import axios from 'axios';
import * as cheerio from 'cheerio';
import http from 'http';
import https from 'https';
import fs from 'fs';
import readline from 'readline';

const httpAgent = new http.Agent({ family: 4 });
const httpsAgent = new https.Agent({ family: 4 });

(async () => {
  try {
    const BASE_URL = 'https://aims.rkmvc.ac.in';
    const loginRes = await axios.get(`${BASE_URL}/student/loginPage`, {
      httpAgent, httpsAgent,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    
    const loginCookies = loginRes.headers['set-cookie'] || [];
    const cookie = loginCookies.map(c => c.split(';')[0]).join('; ');

    const $ = cheerio.load(loginRes.data);
    let imgSrc = $('#captImg img').attr('src');
    if (!imgSrc.startsWith('http')) imgSrc = BASE_URL + imgSrc;

    const imgRes = await axios.get(imgSrc, {
        responseType: 'arraybuffer',
        httpAgent, httpsAgent,
        headers: { 'Cookie': cookie, 'User-Agent': 'Mozilla/5.0' }
    });
    
    fs.writeFileSync('captcha.jpg', imgRes.data);
    console.log('Captcha saved to captcha.jpg');

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question('Enter captcha from captcha.jpg: ', async (captcha) => {
      rl.close();
      const qs = `student_code=error&password=error&captcha=${encodeURIComponent(captcha)}&submit_data=1`;
      
      const postRes = await axios.post(`${BASE_URL}/student/do_stud_login`, qs, {
        httpAgent, httpsAgent,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': cookie,
          'User-Agent': 'Mozilla/5.0'
        },
        maxRedirects: 0,
        validateStatus: () => true
      });
      
      const $2 = cheerio.load(postRes.data);
      const errorText = $2('.alert, .text-danger, p').text().trim();
      console.log('Server response text:', errorText);
    });

  } catch (err) {
    console.error('Error:', err.message);
  }
})();
