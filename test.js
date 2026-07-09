import axios from 'axios';

(async () => {
  try {
    const res = await axios.get('https://aims.rkmvc.ac.in/student/loginPage', {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    console.log('Status:', res.status);
    console.log('Data length:', res.data.length);
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
