require('dotenv').config();

module.exports = {
  token: process.env.TELEGRAM_BOT_TOKEN,
  webAppUrl: 'https://prismatic-moonbeam-fb0383.netlify.app',
  port: 8000,
};