const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const config = require('./config/config');
const corsMiddleware = require('./middlewares/corsMiddleware');
const apiHandlers = require('./handlers/apiHandlers');
const botHandlers = require('./handlers/botHandlers');

// Инициализация бота
const bot = new TelegramBot(config.token, { polling: true });

// Инициализация Express
const app = express();
app.use(express.json()); // Чтобы сервер понимал JSON
app.use(corsMiddleware); // Подключаем CORS middleware
app.options('*', corsMiddleware); // Обработчик preflight-запросов

// Обработчики API
app.post('/generate', apiHandlers.generateLayout);

// Обработчики бота
const { handleStart } = botHandlers(bot, config.webAppUrl);
bot.on('message', async (msg) => {
  const text = msg.text;
  if (text === '/start') {
    await handleStart(msg);
  }
});

// Запуск сервера
app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});