const flipDailyRune = require('../services/flipDailyRune');

module.exports = {
  flipRune: async (req,res) => {
    try{
      const telegramId = req.params.telegramId;

      /*let userRune = await dailyRuneUser.getOrCreateUserRune(acData.userId);
      if(userRune.rune) {
        return res.status(400).json({ error: "Руна уже перевернута" });
      } */

      const newDailyRune = await flipDailyRune.flipRune(telegramId);
      // перевернутую руну
      return res.json({
        name: newDailyRune.name,
        image: newDailyRune.image,
        description: newDailyRune.description
      });
    } catch (error) {
        console.error("🚨 Ошибка2:", error.message);
        res.status(500).json({ error: error.message });
      }
  }
}