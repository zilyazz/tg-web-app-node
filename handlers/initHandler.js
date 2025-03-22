// TODO **** Поинт при заходе юзера в приложение ****

const runeService = require('../services/runeService');
const supabase = require('../supabaseClient'); 
const dailyRuneService = require('../handlers/dailyRuneUserHandler'); // Логика для рун

module.exports = {
  initFunc: async (req, res) => {
    const telegramId = req.params.telegramId;

    try {
      // Вызов других хендлеров с передачей telegramId
      const runeData = await dailyRuneService.getDailyRune(telegramId);
      //const experienceData = await experienceHandler.getExperience(telegramId);

      // Отправляем собранные данные в одном ответе
      return res.json({
        rune: runeData,
       // score: scoreData,
      //  experience: experienceData
      });
    } catch (error) {
      console.error("Ошибка в initFunc:", error.message);
      res.status(500).json({ error: error.message });
    }
  }
};