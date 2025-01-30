const runeService = require('../services/runeService');
const supabase = require('../supabaseClient'); // Подключаем Supabase клиент

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
  },
};