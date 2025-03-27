const dailyRuneUser = require('../services/initialization/dailyRuneUser');
const accountData = require('../services/initialization/accountData');
module.exports = {
  getDailyRune: async (req,res) => {
    try {
      const telegramId = req.params.telegramId;

      const acData = await accountData.accountData(telegramId);
      let userRune = await dailyRuneUser.getOrCreateUserRune(acData.userId);
      const { userId, ...responseData } = acData; //деструктуризация чтобы не выводил userId в return

      if (!userRune.rune) {
        // Если rune = NULL, показываем "рубашку" 
        return res.json({
          name: "Скрытая руна",
          image: "./runes/cover.png",
          description: "Переверните руну, чтобы узнать её значение.",
          ...responseData
        });
      } 
        // Если rune уже есть, значит она перевернута — отправляем её
      const runeData = await dailyRuneUser.getRuneById(userRune.rune);
      return res.json({
        name: runeData.name,
        image: runeData.image,
        description: runeData.description,
        ...responseData
      });
    } catch (error) {
        console.error("🚨 Ошибка:", error.message);
        res.status(500).json({ error: error.message });
      }
  },
  
  flipRune: async (req,res) => {
    try{
      const telegramId = req.params.telegramId;
      const acData = await accountData.accountData(telegramId);
      /*let userRune = await dailyRuneUser.getOrCreateUserRune(acData.userId);
      if(userRune.rune) {
        return res.status(400).json({ error: "Руна уже перевернута" });
      } */

      const newDailyRune = await dailyRuneUser.flipRune(acData.userId);
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
