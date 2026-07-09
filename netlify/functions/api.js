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
    const attendanceData = [];
    
    // Smart parsing for unknown table structure
    $('table').each((tableIdx, table) => {
      let subjectCol = -1;
      let totalCol = -1;
      let attendedCol = -1;
      let presentCol = -1;

      // Find headers
      $(table).find('tr').first().find('th, td').each((i, el) => {
        const headerText = $(el).text().toLowerCase().trim();
        if (headerText.includes('subject') || headerText.includes('course name')) subjectCol = i;
        if (headerText.includes('total') || headerText.includes('conducted')) totalCol = i;
        if (headerText.includes('attend') || headerText.includes('present')) {
          if (attendedCol === -1) attendedCol = i;
        }
      });

      // Fallback heuristics if headers aren't explicitly named
      if (subjectCol === -1) subjectCol = 1; // Usually Sl No is 0, Subject is 1 or 2
      
      $(table).find('tr').each((i, row) => {
        if (i === 0) return; // Skip header
        const columns = $(row).find('td');
        if (columns.length >= 3) {
          // If we didn't find headers, try to guess based on numbers
          if (totalCol === -1 || attendedCol === -1) {
             let nums = [];
             columns.each((idx, col) => {
               const val = $(col).text().trim();
               if (/^\d+$/.test(val)) nums.push({ idx, val: parseInt(val, 10) });
             });
             if (nums.length >= 2) {
               // Usually total > attended
               if (nums[0].val >= nums[1].val) {
                 totalCol = nums[0].idx;
                 attendedCol = nums[1].idx;
               } else {
                 totalCol = nums[1].idx;
                 attendedCol = nums[0].idx;
               }
             }
          }

          const subject = subjectCol !== -1 && $(columns[subjectCol]) ? $(columns[subjectCol]).text().trim() : $(columns[0]).text().trim();
          const totalText = totalCol !== -1 && $(columns[totalCol]) ? $(columns[totalCol]).text().trim() : '';
          const attendedText = attendedCol !== -1 && $(columns[attendedCol]) ? $(columns[attendedCol]).text().trim() : '';
          
          let attended = parseInt(attendedText, 10);
          let total = parseInt(totalText, 10);
          
          // Fallback if parsing failed but there are numbers
          if (isNaN(attended) || isNaN(total)) {
            let nums = [];
            columns.each((idx, col) => {
              const val = $(col).text().trim();
              if (/^\d+$/.test(val)) nums.push(parseInt(val, 10));
            });
            if (nums.length >= 2) {
              total = Math.max(nums[0], nums[1]);
              attended = Math.min(nums[0], nums[1]);
            }
          }

          if (subject && subject.length > 2 && !isNaN(attended) && !isNaN(total)) {
             // Avoid adding duplicates or totals row
             if (!subject.toLowerCase().includes('total') && !subject.toLowerCase().includes('overall')) {
                attendanceData.push({ subject, attended, total });
             }
          }
        }
      });
    });

    if (attendanceData.length === 0) {
      const pageTitle = $('title').text().trim() || 'No Title';
      const isLoginBox = attendanceRes.data.includes('login-box') ? 'Yes' : 'No';
      // Return raw HTML chunks as subject names for visual debugging
      const bodyHtml = $('body').html() || attendanceRes.data;
      // Strip scripts and styles to focus on content
      const $dbg = cheerio.load(bodyHtml);
      $dbg('script, style, link, meta').remove();
      const cleanHtml = $dbg.text().replace(/\s+/g, ' ').trim();
      
      const debugData = [
        { subject: `[INFO] HTTP ${attendanceRes.status} | Title: ${pageTitle} | LoginBox: ${isLoginBox} | Len: ${attendanceRes.data.length}`, attended: 0, total: 0 },
      ];
      
      // Split clean text into ~200 char chunks and add as subjects
      for (let i = 0; i < Math.min(cleanHtml.length, 2000); i += 200) {
        debugData.push({
          subject: `[HTML ${i}] ${cleanHtml.substring(i, i + 200)}`,
          attended: 0,
          total: 0
        });
      }
      
      console.warn('Could not find attendance tables. Returning HTML debug chunks.');
      return res.json({
        success: true,
        data: debugData
      });
    }

    res.json({ success: true, data: attendanceData });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: `Failed to communicate with portal: ${err.message}` });
  }
});

export const handler = serverless(app);
