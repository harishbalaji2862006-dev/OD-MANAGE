import serverless from 'serverless-http';
import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import http from 'http';
import https from 'https';

const httpAgent = new http.Agent({ family: 4 });
const httpsAgent = new https.Agent({ family: 4 });

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

const BASE_URL = 'https://aims.rkmvc.ac.in';

app.get('/api/captcha', async (req, res) => {
  try {
    const loginRes = await axios.get(`${BASE_URL}/student/loginPage`, {
      httpAgent, httpsAgent,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
    });
    const loginCookies = loginRes.headers['set-cookie'] || [];
    const loginCookieString = loginCookies.map(c => c.split(';')[0]).join('; ');
    
    const login$ = cheerio.load(loginRes.data);
    let imgSrc = login$('#captImg img').attr('src');
    
    if (imgSrc) {
        if (!imgSrc.startsWith('http')) imgSrc = BASE_URL + imgSrc;
        
        const imgRes = await axios.get(imgSrc, {
            responseType: 'arraybuffer',
            httpAgent, httpsAgent,
            headers: { 
              'Cookie': loginCookieString,
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        const base64 = Buffer.from(imgRes.data, 'binary').toString('base64');
        return res.json({
            cookie: loginCookieString,
            image: `data:image/jpeg;base64,${base64}`
        });
    }

    res.status(500).json({ error: 'Could not extract captcha image' });
  } catch (err) {
    console.error('Captcha error:', err.message);
    res.status(500).json({ error: 'Failed to load captcha' });
  }
});

app.post('/api/login', async (req, res) => {
  const { student_code, password, captcha, cookie } = req.body;
  if (!student_code || !password || !captcha || !cookie) {
    return res.status(400).json({ error: 'Missing credentials, captcha, or session cookie' });
  }

  try {
    const qs = `student_code=${encodeURIComponent(student_code)}&password=${encodeURIComponent(password)}&captcha=${encodeURIComponent(captcha)}&submit_data=1`;

    const loginRes = await axios.post(`${BASE_URL}/student/do_stud_login`, qs, {
      httpAgent, httpsAgent,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookie,
        'Referer': 'https://aims.rkmvc.ac.in/student/loginPage',
        'Origin': 'https://aims.rkmvc.ac.in',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      maxRedirects: 0,
      validateStatus: (status) => status >= 200 && status < 400
    });

    if (loginRes.status === 200 && typeof loginRes.data === 'string' && loginRes.data.includes('login-box')) {
       const $ = cheerio.load(loginRes.data);
       const errorText = $('.alert, .text-danger, p').text().trim() || 'Invalid credentials or Captcha.';
       return res.status(401).json({ error: errorText });
    }

    // Correct cookie merging (overwrite old with new)
    let cookieMap = {};
    cookie.split(';').forEach(c => {
      const parts = c.trim().split('=');
      if (parts[0]) cookieMap[parts[0]] = parts.slice(1).join('=');
    });
    
    const newCookies = loginRes.headers['set-cookie'];
    if (newCookies) {
      newCookies.forEach(c => {
        const parts = c.split(';')[0].split('=');
        if (parts[0]) cookieMap[parts[0]] = parts.slice(1).join('=');
      });
    }
    let finalCookieString = Object.entries(cookieMap).map(([k, v]) => `${k}=${v}`).join('; ');

    // Mimic real browser flow: Visit dashboard first to initialize session
    const dashRes = await axios.get(`${BASE_URL}/student/dashboard`, {
      httpAgent, httpsAgent,
      headers: {
        'Cookie': finalCookieString,
        'Referer': 'https://aims.rkmvc.ac.in/student/loginPage',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      validateStatus: () => true
    });

    // Update cookies again
    const dashCookies = dashRes.headers['set-cookie'];
    if (dashCookies) {
      dashCookies.forEach(c => {
        const parts = c.split(';')[0].split('=');
        if (parts[0]) cookieMap[parts[0]] = parts.slice(1).join('=');
      });
      finalCookieString = Object.entries(cookieMap).map(([k, v]) => `${k}=${v}`).join('; ');
    }

    const attendanceRes = await axios.get(`${BASE_URL}/student/AttndReport`, {
      httpAgent, httpsAgent,
      headers: {
        'Cookie': finalCookieString,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      validateStatus: () => true
    });

    const $ = cheerio.load(attendanceRes.data);

    // ── Text-based parser ──────────────────────────────────────────
    // The AIMS portal renders attendance using non-standard HTML that
    // Cheerio's $('table') selector cannot find.  Instead, we strip
    // scripts/styles and parse the clean text content using the
    // bracketed course-code pattern [XXXXX] as anchors.

    $('script, style, link').remove();
    const pageText = $.text().replace(/\s+/g, ' ').trim();

    // Abort early if the page is actually the login page (session expired)
    if (pageText.includes('login-box') || (attendanceRes.data.includes('login-box') && !pageText.includes('Current Semester'))) {
      return res.status(401).json({ error: 'Session expired – the portal redirected back to the login page. Please try again.' });
    }

    // Isolate the "Current Semester Attendance Details" section
    const currentSemStart = pageText.indexOf('Current Semester');
    const prevSemStart   = pageText.indexOf('Previous Semesters');
    const currentSemText = currentSemStart >= 0
      ? pageText.substring(currentSemStart, prevSemStart > currentSemStart ? prevSemStart : undefined)
      : pageText;

    // Find every course code [XXXXX]
    const codeRegex = /\[([A-Z][A-Z0-9]+)\]/g;
    const codes = [];
    let m;
    while ((m = codeRegex.exec(currentSemText)) !== null) {
      codes.push({ code: m[1], start: m.index, end: m.index + m[0].length });
    }

    const attendanceData = [];

    for (let i = 0; i < codes.length; i++) {
      const { code, start, end } = codes[i];

      // ── Course name ──
      // Text before [CODE] contains: "... <serial> <semester> <COURSE NAME> "
      const beforeText = currentSemText.substring(
        i > 0 ? codes[i - 1].end : 0,
        start
      ).trim();

      // Walk backwards through tokens to find the course name
      // (everything after the last "<serial> <semester>" pair)
      const words = beforeText.split(/\s+/);
      const courseWords = [];
      for (let j = words.length - 1; j >= 0; j--) {
        // Two consecutive 1-2 digit numbers = serial + semester
        if (/^\d{1,2}$/.test(words[j]) && j > 0 && /^\d{1,2}$/.test(words[j - 1])) {
          break;
        }
        courseWords.unshift(words[j]);
      }
      const courseName = courseWords.join(' ').trim() || code;

      // ── Attendance numbers ──
      // Text after [CODE] contains: "<teacher?> <held> <attended> <classHrs> <hrsAttd> <pct|NA> ..."
      const nextBoundary = i < codes.length - 1 ? codes[i + 1].start : currentSemText.length;
      const afterText = currentSemText.substring(end, nextBoundary).trim();

      // Find the first run of 4-5 consecutive numeric tokens (teacher names have no standalone numbers)
      const tokens = afterText.split(/\s+/);
      const nums = [];
      let started = false;
      for (const tok of tokens) {
        if (/^\d+(\.\d+)?$/.test(tok) || tok === 'NA') {
          started = true;
          nums.push(tok);
          if (nums.length >= 5) break;
        } else if (started) {
          break;
        }
      }

      // Also try to extract teacher name (text between [CODE] and the first number)
      let teacher = '';
      for (const tok of tokens) {
        if (/^\d+(\.\d+)?$/.test(tok) || tok === 'NA') break;
        teacher += (teacher ? ' ' : '') + tok;
      }

      if (nums.length >= 4) {
        const held        = parseInt(nums[0], 10);
        const attended    = parseInt(nums[1], 10);
        const classHours  = parseFloat(nums[2]);
        const hrsAttended = parseFloat(nums[3]);
        const pctStr      = nums[4] || 'NA';
        const percentage  = pctStr === 'NA'
          ? (held === 0 ? 0 : Math.round((attended / held) * 10000) / 100)
          : parseFloat(pctStr);

        attendanceData.push({
          subject: `${courseName} [${code}]`,
          teacher: teacher || '',
          attended,
          total: held,
          classHours,
          hoursAttended: hrsAttended,
          percentage
        });
      }
    }

    // ── Previous semesters ──
    const previousSemesters = [];
    if (prevSemStart >= 0) {
      const prevText = pageText.substring(prevSemStart);
      // Pattern: <serial> <semester> <percentage> <status>
      const prevRegex = /(\d+)\s+(\d+)\s+(\d+)\s+(Regular|Detained|Short)/gi;
      let pm;
      while ((pm = prevRegex.exec(prevText)) !== null) {
        previousSemesters.push({
          semester: parseInt(pm[2], 10),
          percentage: parseInt(pm[3], 10),
          status: pm[4]
        });
      }
    }

    if (attendanceData.length === 0) {
      const pageTitle = $('title').text().trim() || 'No Title';
      return res.status(500).json({
        error: `Could not parse attendance data from the portal. Page title: "${pageTitle}", length: ${attendanceRes.data.length}. The portal structure may have changed.`
      });
    }

    res.json({ success: true, data: attendanceData, previousSemesters });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: `Failed to communicate with portal: ${err.message}` });
  }
});

export const handler = serverless(app);
