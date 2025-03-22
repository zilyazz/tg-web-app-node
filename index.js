const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const config = require('./config/config');
const corsMiddleware = require('./middlewares/corsMiddleware');
const apiHandlers = require('./handlers/apiHandlers');
const botHandlers = require('./handlers/botHandlers');
const taskService = require('./services/taskService');
const spreadHandler = require('./handlers/spreadHandler');
const { getDailyTasksWithStatus, completeTask } = require('./handlers/taskHandler');
//const { getDailyRune, flipRune } = require('./services/dailyRuneUser');
const dailyRuneHandler = require('./handlers/dailyRuneUserHandler');
require('dotenv').config(); // Загружаем переменные окружения из .en

// Инициализация бота
const bot = new TelegramBot(config.token, { polling: true });

// Инициализация Express
const app = express();
app.use(express.json()); // Чтобы сервер понимал JSON
app.use(corsMiddleware); // Подключаем CORS middleware
app.options('*', corsMiddleware); // Обработчик preflight-запросов

// Обработчики API
app.post('/generate', apiHandlers.generateLayout);
app.get('/spread/history/:userId', spreadHandler.getSpreadHistory);
app.get('/spread/details/:spreadId', spreadHandler.getSpreadDetails);
app.get('/tasks/daily/:userId', getDailyTasksWithStatus);
app.post('/tasks/complete', completeTask);
//app.get('/dailyRuneUser/:telegramId', getDailyRune);
//app.post('/flipRune/:telegramId',flipRune);
app.get('/dailyRuneUser/:telegramId', dailyRuneHandler.getDailyRune);
app.post('/flipRune/:telegramId', dailyRuneHandler.flipRune);

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