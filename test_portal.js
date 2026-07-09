import axios from 'axios';

(async () => {
  try {
    const res = await axios.get('https://aims.rkmvc.ac.in/student/loginPage', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 10000
    });
    console.log('Status:', res.status);
    console.log('HTML size:', res.data.length);
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
