const supabase = require('../supabaseClient');
const fs = require('fs');
const path = require('path');

const dailyRunes = JSON.parse(fs.readFileSync(path.join(__dirname, '../dailyRunes.json'), 'utf8'));

module.exports = {
  getDailyRune: async (req, res) => {
    const  telegramId  = req.params.telegramId; // Получаем Telegram ID пользователя

    try {
      console.log("📩 Получен запрос с telegramId:", telegramId); // Логируем, что пришло

      // 1️⃣ Ищем user_id в таблице `users` по его Telegram ID
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('telegram', telegramId)  // <-- ТУТ МОЖЕТ БЫТЬ ПРОБЛЕМА
        

      if (userError) {
        console.error("❌ Ошибка при поиске пользователя:", userError);
        throw new Error("Ошибка базы данных");
      }

      let user = users.length > 0 ? users[0] : null; // Берем первый найденный объект

      if (!user) {
        console.log("🆕 Пользователь не найден в users, создаём...");
      
        const { data: newUser, error: insertUserError } = await supabase
          .from('users')
          .insert([{ telegram: telegramId }])
          .select('id')  // Получаем ID нового пользователя
          .single();
      
        if (insertUserError) {
          console.error("❌ Ошибка при создании пользователя:", insertUserError);
          return res.status(500).json({ error: "Ошибка создания пользователя" });
        }
      
        console.log("✅ Новый пользователь создан с ID:", newUser.id);
        user = newUser; // Теперь user содержит объект с id
      }
      
      console.log("✅ Найден пользователь с ID:", user.id);

      // 2️⃣ Проверяем, есть ли запись о руну дня в таблице `users_runes`
      let { data: userRune, error } = await supabase
        .from('users_runes')
        .select('rune')
        .eq('user_id', user.id)
       

      if (error) {
        console.error("❌ Ошибка при поиске users_runes:", error);
        throw error;
      }
      
      // 3️⃣ Если пользователя в `users_runes` нет — создаем запись
      if (!userRune|| userRune.length === 0) {
        console.log("🆕 Пользователь не найден в users_runes, добавляем...");
        const { error: insertError } = await supabase
          .from('users_runes')
          .insert([{ user_id: user.id, rune: null }]);

        if (insertError) throw insertError;

        userRune = { rune: null };
      } else {
        userRune = userRune[0]; // Берем первую найденную запись
      }

      // 4️⃣ Если руна уже есть — просто отправляем её
      if (!userRune.rune) {
        // Если rune = NULL, показываем "рубашку" (скрытая руна)
        console.log("📌 Руна еще не перевернута, отправляем рубашку");
        return res.json({
          name: "Скрытая руна",
          image: "./runes/cover.png",
          description: "Переверните руну, чтобы узнать её значение."
        });
      } else {
        // Если rune уже есть, значит она перевернута — отправляем её
        const runeData = dailyRunes.find(rune => rune.name === userRune.rune);
        console.log("📌 Руна уже перевернута:", runeData.name);
        return res.json({
          name: runeData.name,
          image: runeData.image,
          description: runeData.description
        });
      }
    } catch (error) {
      console.error("🚨 Ошибка:", error.message);
      res.status(500).json({ error: error.message });
    }
  },
  flipRune: async (req, res) => {
    const telegramId = req.params.telegramId;

    try {
      console.log("🔄 Переворот руны для telegramId:", telegramId);

      // 1️⃣ Ищем user_id в таблице `users`
      const { data: users, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('telegram', telegramId);

      if (userError) {
        console.error("❌ Ошибка при поиске пользователя:", userError);
        throw new Error("Ошибка базы данных");
      }

      let user = users.length > 0 ? users[0] : null;

      if (!user) {
        console.log("⚠️ Пользователь не найден, перевернуть руну невозможно.");
        return res.status(404).json({ error: "Пользователь не найден" });
      }

      console.log("✅ Найден пользователь с ID:", user.id);

      // 2️⃣ Ищем его руну
      let { data: userRune, error: runeError } = await supabase
        .from('users_runes')
        .select('rune')
        .eq('user_id', user.id);

      if (runeError) {
        console.error("❌ Ошибка при поиске users_runes:", runeError);
        throw runeError;
      }

      if (!userRune || userRune.length === 0) {
        console.log("⚠️ У пользователя нет записи в users_runes, невозможно перевернуть руну.");
        return res.status(400).json({ error: "Нет данных о рунне" });
      }

      userRune = userRune[0];

      // 3️⃣ Если руна уже перевернута, нельзя перевернуть снова
      if (userRune.rune) {
        console.log("⚠️ Пользователь уже переворачивал руну, нельзя снова.");
        return res.status(400).json({ error: "Руна уже перевернута" });
      }

      // 4️⃣ Если rune = NULL, генерируем новую руну
      const randomRune = dailyRunes[Math.floor(Math.random() * dailyRunes.length)];

      console.log("🎲 Переворачиваем руну, новая:", randomRune.name);

      const { error: updateError } = await supabase
        .from('users_runes')
        .update({ rune: randomRune.id })  
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // 5️⃣ Отправляем перевернутую руну
      res.json({
        name: randomRune.name,
        image: randomRune.image,
        description: randomRune.description
      });

    } catch (error) {
      console.error("🚨 Ошибка:", error.message);
      res.status(500).json({ error: error.message });
    }
  }
};
