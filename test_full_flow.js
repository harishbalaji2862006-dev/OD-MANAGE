import axios from 'axios';
import * as cheerio from 'cheerio';
import http from 'http';
import https from 'https';
import fs from 'fs';

const httpAgent = new http.Agent({ family: 4 });
const httpsAgent = new https.Agent({ family: 4 });
const BASE_URL = 'https://aims.rkmvc.ac.in';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

(async () => {
  try {
    // Step 1: Get login page + captcha
    const loginPageRes = await axios.get(`${BASE_URL}/student/loginPage`, {
      httpAgent, httpsAgent,
      headers: { 'User-Agent': UA }
    });
    
    let cookieMap = {};
    const initCookies = loginPageRes.headers['set-cookie'] || [];
    initCookies.forEach(c => {
      const parts = c.split(';')[0].split('=');
      if (parts[0]) cookieMap[parts[0].trim()] = parts.slice(1).join('=');
    });

    const $ = cheerio.load(loginPageRes.data);
    let imgSrc = $('#captImg img').attr('src');
    if (!imgSrc.startsWith('http')) imgSrc = BASE_URL + imgSrc;
    
    const cookieStr = () => Object.entries(cookieMap).map(([k,v]) => `${k}=${v}`).join('; ');

    // Fetch captcha image
    const imgRes = await axios.get(imgSrc, {
      responseType: 'arraybuffer',
      httpAgent, httpsAgent,
      headers: { 'Cookie': cookieStr(), 'User-Agent': UA }
    });
    fs.writeFileSync('captcha_debug.jpg', imgRes.data);
    console.log('Captcha saved to captcha_debug.jpg - open it and enter the text');

    // Read captcha from stdin
    const readline = await import('readline');
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    
    rl.question('Enter captcha: ', async (captcha) => {
      rl.close();
      
      // Step 2: POST login
      const loginRes = await axios.post(`${BASE_URL}/student/do_stud_login`,
        `student_code=2413281033018&password=test&captcha=${encodeURIComponent(captcha)}&submit_data=1`,
        {
          httpAgent, httpsAgent,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Cookie': cookieStr(),
            'Referer': `${BASE_URL}/student/loginPage`,
            'Origin': BASE_URL,
            'User-Agent': UA
          },
          maxRedirects: 5,
          validateStatus: () => true
        }
      );
      
      // Update cookies
      const loginCookies = loginRes.headers['set-cookie'] || [];
      loginCookies.forEach(c => {
        const parts = c.split(';')[0].split('=');
        if (parts[0]) cookieMap[parts[0].trim()] = parts.slice(1).join('=');
      });
      
      console.log('Login status:', loginRes.status);
      console.log('Login redirect:', loginRes.headers.location);
      
      // Step 3: Visit dashboard
      const dashRes = await axios.get(`${BASE_URL}/student/dashboard`, {
        httpAgent, httpsAgent,
        headers: { 'Cookie': cookieStr(), 'Referer': `${BASE_URL}/student/loginPage`, 'User-Agent': UA },
        validateStatus: () => true
      });
      
      const dashCookies = dashRes.headers['set-cookie'] || [];
      dashCookies.forEach(c => {
        const parts = c.split(';')[0].split('=');
        if (parts[0]) cookieMap[parts[0].trim()] = parts.slice(1).join('=');
      });
      
      console.log('Dashboard status:', dashRes.status);
      console.log('Dashboard title:', cheerio.load(dashRes.data)('title').text());
      
      // Step 4: Fetch AttndReport
      const attndRes = await axios.get(`${BASE_URL}/student/AttndReport`, {
        httpAgent, httpsAgent,
        headers: { 'Cookie': cookieStr(), 'Referer': `${BASE_URL}/student/dashboard`, 'User-Agent': UA },
        validateStatus: () => true
      });
      
      const attndCookies = attndRes.headers['set-cookie'] || [];
      attndCookies.forEach(c => {
        const parts = c.split(';')[0].split('=');
        if (parts[0]) cookieMap[parts[0].trim()] = parts.slice(1).join('=');
      });
      
      console.log('\nAttndReport status:', attndRes.status);
      console.log('AttndReport title:', cheerio.load(attndRes.data)('title').text());
      console.log('AttndReport HTML length:', attndRes.data.length);
      
      // Save full HTML for inspection
      fs.writeFileSync('attnd_report.html', attndRes.data);
      console.log('\nFull HTML saved to attnd_report.html');
      
      // Analyze structure
      const $a = cheerio.load(attndRes.data);
      console.log('\n--- HTML Structure Analysis ---');
      console.log('Number of <table> elements:', $a('table').length);
      console.log('Number of <tr> elements:', $a('tr').length);
      console.log('Number of <td> elements:', $a('td').length);
      console.log('Number of <th> elements:', $a('th').length);
      console.log('Number of <div class="table"> elements:', $a('div.table').length);
      console.log('Number of <div class="row"> elements:', $a('div.row').length);
      
      // Print all table headers
      $a('table').each((i, table) => {
        console.log(`\n--- Table ${i} ---`);
        $a(table).find('tr').first().find('th, td').each((j, cell) => {
          console.log(`  Header ${j}: "${$a(cell).text().trim()}"`);
        });
        // Print first data row
        const rows = $a(table).find('tr');
        if (rows.length > 1) {
          console.log('  First data row:');
          $a(rows[1]).find('td').each((j, cell) => {
            console.log(`    Col ${j}: "${$a(cell).text().trim()}"`);
          });
        }
      });
    });
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
