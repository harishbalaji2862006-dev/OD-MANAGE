import axios from 'axios';
import http from 'http';
import https from 'https';

const httpAgent = new http.Agent({ family: 4 });
const httpsAgent = new https.Agent({ family: 4 });

(async () => {
  try {
    const res = await axios.get('https://aims.rkmvc.ac.in/student/attendance', {
      httpAgent, httpsAgent,
      headers: {
        'User-Agent': 'Mozilla/5.0'
      },
      validateStatus: () => true
    });
    console.log('Status:', res.status);
    console.log('Headers:', res.headers);
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
