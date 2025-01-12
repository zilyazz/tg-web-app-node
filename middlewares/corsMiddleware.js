const cors = require('cors');

module.exports = cors({
  origin: '*', // Разрешить запросы с любых источников
  methods: ['GET', 'POST', 'OPTIONS'], // Разрешить только нужные методы
  allowedHeaders: ['Content-Type'], // Указать разрешённые заголовки
});