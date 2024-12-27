const express = require('express'); // Устанавливаем express для работы с сервером
const TelegramBot = require('node-telegram-bot-api');
const cors = require('cors'); // Для разрешения запросов с фронтенда

const token = '7596711900:AAGQ74SgAHOLhkt93xoYD_rheEuLGhqHHfA';
const webAppUrl='https://prismatic-moonbeam-fb0383.netlify.app';
const bot = new TelegramBot(token, {polling: true});

const app = express();
app.use(express.json()); // Чтобы сервер понимал JSON
app.use(cors()); // Разрешаем запросы с фронтенда

// Генерация расклада из трёх карт
app.post('/generate', (req, res) => {
  const runes = [
  'ᚠ (Феху) - Благосостояние, изобилие',
  'ᚢ (Уруз) - Сила, здоровье',
  'ᚦ (Турисаз) - Препятствия, защита',
  'ᚨ (Ансуз) - Знание, вдохновение',
  'ᚱ (Райдо) - Путешествие, движение',
  'ᚲ (Кеназ) - Озарение, ясность',
  'ᚷ (Гебо) - Партнёрство, дар',
  'ᚹ (Вуньо) - Радость, успех',
  'ᚺ (Хагалаз) - Перемены, разрушение',
  'ᚾ (Наутиз) - Необходимость, терпение',
  'ᛁ (Иса) - Застой, покой',
  'ᛃ (Йера) - Урожай, результаты',
  'ᛇ (Эйваз) - Защита, трансформация',
  'ᛈ (Перт) - Тайна, судьба',
  'ᛉ (Альгиз) - Защита, интуиция',
  'ᛊ (Совило) - Сила, успех',
  'ᛏ (Тейваз) - Мужество, справедливость',
  'ᛒ (Беркана) - Рождение, рост',
  'ᛖ (Эваз) - Прогресс, движение',
  'ᛗ (Манназ) - Человечество, помощь',
  'ᛚ (Лагуз) - Интуиция, вода',
  'ᛜ (Ингуз) - Плодородие, завершение',
  'ᛞ (Дагаз) - Новое начало, пробуждение',
  'ᛟ (Одал) - Наследие, имущество',
  ];

  // Перемешиваем и выбираем 3 случайные карты
  const shuffled = runes.sort(() => 0.5 - Math.random());
  const selectedRunes = shuffled.slice(0, 3);

  res.json({ runes: selectedRunes });
});

// Telegram bot handler


bot.on('message', async(msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  
  if(text ==='/start') {

       await bot.sendMessage(chatId, 'Привет! Заходи, и получишь все ответы про свою судьбу', {
                   reply_markup: {
                           inline_keyboard: [
                           [{text: 'Узнать свою судьбу', web_app: {url: webAppUrl}}]
                           ]
                   }
      })
    }
  });