import axios from 'axios';
import * as cheerio from 'cheerio';
import http from 'http';
import https from 'https';

const httpAgent = new http.Agent({ family: 4 });
const httpsAgent = new https.Agent({ family: 4 });

(async () => {
  try {
    const loginRes = await axios.get('https://aims.rkmvc.ac.in/student/loginPage', {
      httpAgent, httpsAgent,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    
    const $ = cheerio.load(loginRes.data);
    let imgSrc = $('#captImg img').attr('src');
    if (!imgSrc.startsWith('http')) imgSrc = 'https://aims.rkmvc.ac.in' + imgSrc;

    const imgRes = await axios.get(imgSrc, {
        responseType: 'arraybuffer',
        httpAgent, httpsAgent,
        headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    
    console.log('Captcha fetched successfully, size:', imgRes.data.length);
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
