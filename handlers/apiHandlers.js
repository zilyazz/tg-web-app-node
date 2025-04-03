const runeService = require('../services/runeService');

module.exports = {
  generateLayout: async (req, res) => {
    const { telegramId,theme,type } = req.body;
    try {
      const layout = await runeService.generateLayout(theme,type);
      const scoreUser = await runeService.addPointsForLayout(telegramId);
      await runeService.insertInSpread(telegramId,layout);

      res.json({...layout,...scoreUser});

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }, 
}