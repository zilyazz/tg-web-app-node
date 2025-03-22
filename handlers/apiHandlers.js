const runeService = require('../services/runeService');
const supabase = require('../supabaseClient'); 

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
  }, /*
  getScore: async (req, res) => {
    const { telegramId } = req.query; // Получаем telegramId из query-параметров

    try {
      // Получаем данные пользователя из Supabase
      const { data: user, error } = await supabase
        .from('users')
        .select('score')
        .eq('telegram', telegramId)
        .single();

      if (error) throw error;

      // Возвращаем текущий счёт пользователя
      res.json({ score: user ? user.score : 0 });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }, */
};