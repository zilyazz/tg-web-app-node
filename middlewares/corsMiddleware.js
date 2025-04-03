const cors = require('cors');

module.exports = cors({
  origin: 'https://luminous-khapse-3750fd.netlify.app', // Укажи свой домен
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
