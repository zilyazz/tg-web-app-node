const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const config = require('./config/config');
const corsMiddleware = require('./middlewares/corsMiddleware');
const apiHandlers = require('./handlers/apiHandlers');
const botHandlers = require('./handlers/botHandlers');
const taskService = require('./services/taskService');
require('dotenv').config(); // Загружаем переменные окружения из .env

// Инициализация бота
const bot = new TelegramBot(config.token, { polling: true });

// Инициализация Express
const app = express();
app.use(express.json()); // Чтобы сервер понимал JSON
app.use(corsMiddleware); // Подключаем CORS middleware
app.options('*', corsMiddleware); // Обработчик preflight-запросов

// Обработчики API
app.post('/generate', apiHandlers.generateLayout);
app.get('/score', apiHandlers.getScore);

// Новые endpoint'ы для заданий
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await taskService.getTasks();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/complete-task', async (req, res) => {
  const { telegramId, taskId } = req.body;

  try {
    const result = await taskService.completeTask(telegramId, taskId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

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