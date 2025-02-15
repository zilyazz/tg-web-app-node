require('dotenv').config();

module.exports = {
  token: process.env.TELEGRAM_BOT_TOKEN,
  webAppUrl: 'https://runiclayout.netlify.app/',
  port: 8000,
};