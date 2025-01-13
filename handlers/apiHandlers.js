const runeService = require('../services/runeService');

module.exports = {
  generateLayout: async (req, res) => {
    const { telegramId } = req.body;

    try {
      const layout = runeService.generateLayout();
      await runeService.addPointsForLayout(telegramId);
      res.json(layout);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};