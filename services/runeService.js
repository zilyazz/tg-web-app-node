const fs = require('fs');
const path = require('path');
const runesLibrary = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../Rune.json'), 'utf8')
);
const supabase = require('../supabaseClient');

module.exports = {
  generateLayout: () => {
    const keys = Object.keys(runesLibrary);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const type = 1
    
    return {
      key: randomKey,
      runes: runesLibrary[randomKey].runes,
      description: runesLibrary[randomKey].description,
      type: type
    };
  },

 //добавим когда бд будет и учет очков за расклад
 addPointsForLayout: async (telegramId) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('id,score')
    .eq('telegram', telegramId)
    .single();
   

  let updatedScore;
  let experiencePoints = 5; // Фиксированное количество очков опыта за расклад
  let updexpPoints;

  if (user) {
    updatedScore = user.score + 10; // +10 очков денег за расклад
    await supabase
      .from('users')
      .update({ score: updatedScore })
      .eq('telegram', telegramId);

    // Получаем текущий опыт пользователя
    const { data: experienceData, error: experienceError } = await supabase
      .from('user_experience')
      .select('id,experience')
      .eq('user_id', user.id)
      .single();

    console.log("Найденная запись опыта:", experienceData, "Ошибка:", experienceError);

    if (experienceData) {
      updexpPoints = experienceData.experience + experiencePoints;
      await supabase
        .from('user_experience')
        .update({ experience: updexpPoints })
        .eq('id', experienceData.id);
    } else {
      // Если записи нет, создаем новую
      updexpPoints = experiencePoints;
      await supabase
        .from('user_experience')
        .insert([{ user_id: user.id, experience: updexpPoints }]);        
    }

  } else {
    updatedScore = 10;
    const { data: newUser, error: newUserError } = await supabase
      .from('users')
      .insert([{ telegram: telegramId, score: updatedScore, tasks: [] }])
      .select('id')
      .single();

    if (newUserError) throw newUserError;

    // Начисляем опыт новому пользователю
    await supabase
      .from('user_experience')
      .insert([{ user_id: newUser.id, experience: experiencePoints }]);
    
    updexpPoints = experiencePoints;
  }

  return { score: updatedScore, experience: updexpPoints };
 },
};
