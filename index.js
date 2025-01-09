require('dotenv').config();
const express = require('express'); // Устанавливаем express для работы с сервером
const TelegramBot = require('node-telegram-bot-api');
const cors = require('cors'); // Для разрешения запросов с фронтенда

const token = process.env.TELEGRAM_BOT_TOKEN;
const webAppUrl = 'https://prismatic-moonbeam-fb0383.netlify.app';
const bot = new TelegramBot(token, { polling: true });

const app = express();
app.use(express.json()); // Чтобы сервер понимал JSON
app.use(cors({
  origin: '*', // Разрешить запросы с любых источников
  methods: ['GET', 'POST', 'OPTIONS'], // Разрешить только нужные методы
  allowedHeaders: ['Content-Type'], // Указать разрешённые заголовки
}));
app.options('*', cors()); // Обработчик preflight-запросов

// Загрузка библиотеки рун
const fs = require('fs');
const path = require('path');
const runesLibrary = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'runes-library.json'), 'utf8')
);

// Функция генерации расклада
function generateLayout() {
  const runesCount = 24; // Количество рун
  const positionsCount = 5; // Количество позиций
  const statesCount = 2; // Прямое или перевернутое положение

  const keys = [];
  for (let i = 0; i < positionsCount; i++) {
    const runeIndex = Math.floor(Math.random() * runesCount) + 1;
    const state = Math.round(Math.random());
    const key = `${runeIndex}-${i+1}-${state}`;
    keys.push(key);
  }

  const layout = [];
  for (const key of keys) {
    const data = runesLibrary[key]; // Извлекаем данные по ключу
    layout.push(data);
  }

  return layout;
}

// Маршрут для генерации расклада
app.post('/generate', (req, res) => {
  const layout = generateLayout(); // Генерируем расклад

  res.json(layout); // Возвращаем расклад в формате JSON
});

// Telegram bot handler
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === '/start') {
    await bot.sendMessage(chatId, 'Привет! Заходи, и получишь все ответы про свою судьбу', {
      reply_markup: {
        inline_keyboard: [
          [{
            text: 'Узнать свою судьбу',
            web_app: { url: webAppUrl }
          }]
        ]
      }
    });
  }
});

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});