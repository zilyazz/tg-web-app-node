const runeService = require('../services/runeService');
const supabase = require('../supabaseClient'); 

module.exports = {
  generateLayout: async (req, res) => {
    const { telegramId,theme,type } = req.body;

    try {
      const layout = runeService.generateLayout(theme,type);
      const scoreUser = await runeService.addPointsForLayout(telegramId);
     // await runeService.addPointsForLayout(telegramId); //добавляем когда добавим БД и очки

  
      // Извлекаем ключи (key) рун из объекта layout
      const runeKeys = layout.runes.map(rune => rune.key);
      console.log("layout.runes:", layout.runes);
      console.log("runeKeys:", runeKeys);
      
      // Сохраняем данные в таблицу spreads в Supabase
      const { data, error } = await supabase 
        .from('spreads')
        .insert([
          {
            Userid: telegramId,      
            Runes: runeKeys,//JSON.stringify(runeKeys),  // Сохраняем ключи рун как строку JSON //FIXME: скорее всего должно быть runeKeys, иначе сохраняется только одно значение вместо массива.
            Description: layout.description,  
            Theme:layout.theme,
            Type: layout.type
          }
        ]);

      res.json({...layout,...scoreUser});
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