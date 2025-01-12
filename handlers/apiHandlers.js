const runeService = require('../services/runeService');

module.exports = {
  generateLayout: (req, res) => {
    const layout = runeService.generateLayout(); // Генерируем расклад
    res.json(layout); // Возвращаем расклад в формате JSON
  },
};