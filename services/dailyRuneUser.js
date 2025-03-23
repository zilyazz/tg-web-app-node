const supabase = require('../supabaseClient');
const fs = require('fs');
const path = require('path');
const dailyRunes = JSON.parse(fs.readFileSync(path.join(__dirname, '../runeLibr/dailyRunes.json'), 'utf8')); 

//* Функция для получения или созданию юзера в БД

async function getOrCreateUser (telegramId) {
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('telegram', telegramId); 
        
  if (userError) throw new Error("Ошибка базы данных");

  let user = users.length > 0 ? users[0] : null; // Берем первый найденный объект

  if (!user) {
    const { data: newUser, error: insertUserError } = await supabase
      .from('users')
      .insert([{ telegram: telegramId }])
      .select('id')  // Получаем ID нового пользователя
      .single();
      
    if (insertUserError) throw new Error("Ошибка создания пользователя"); 
    
    user = newUser; // Теперь user содержит объект с id
  }
  return user;
}

//* Функция для получения или генерации руны дня

async function getOrCreateUserRune (userId) {
  // Проверяем, есть ли запись о руне дня в таблице `users_runes`
  let { data: userRune, error } = await supabase
    .from('users_runes')
    .select('rune')
    .eq('user_id', userId) 

  if (error) throw new Error("Ошибка при поиске руны дня");
      
  if (!userRune|| userRune.length === 0) {
    console.log("🆕 Создаём новую запись для userId:", userId);
    const { error: insertError } = await supabase
      .from('users_runes')
      .insert([{ user_id: userId, rune: null }]);

    if (insertError) throw new Error("Ошибка при создании записи в users_runes"); 

    userRune = { rune: null };
  } else {
      userRune = userRune[0]; // Берем первую найденную запись
    }

  return userRune;
}

//* Метод для поиск руны по ID из библиотеки dailyRunes

async function getRuneById(runeId) {
  if (!runeId) return null; // Если руны нет, сразу возвращаем null

  return dailyRunes.find(rune => rune.id === runeId) || null;
}

//* Метод для переворачивания руны (т.е. генерации новой руны дня для пользователя)

async function flipRune(userId) {
  const randomRune = dailyRunes[Math.floor(Math.random() * dailyRunes.length)];
  const { error: updateError } = await supabase
    .from('users_runes')
    .update({ rune: randomRune.id })  
    .eq('user_id', userId);

  if (updateError) throw updateError;
  return randomRune;
};

module.exports = {
  getOrCreateUser,
  getOrCreateUserRune,
  getRuneById,
  flipRune
};