const cors = require('cors');

module.exports = cors({
  origin: 'https://gleeful-basbousa-ac098a.netlify.app', // Укажи свой домен
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
