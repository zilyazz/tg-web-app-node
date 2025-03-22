const fs = require('fs');
const path = require('path');
const supabase = require('../supabaseClient');
const { threadId } = require('worker_threads');

// **Загружаем библиотеки**
//const runesLibrary = JSON.parse(
//  fs.readFileSync(path.join(__dirname, '../Rune.json'), 'utf8')
//);
const runesLibrary = {
class:{
  classic:JSON.parse(fs.readFileSync(path.join(__dirname, '../runeLibr/Rune.json'), 'utf8'))
},  
love:{
  cross:JSON.parse(fs.readFileSync(path.join(__dirname, '../runeLibr/KrestLove.json'), 'utf8')),
  classic:JSON.parse(fs.readFileSync(path.join(__dirname, '../runeLibr/RuneLove.json'), 'utf8'))
},
energy:{
  cross:JSON.parse(fs.readFileSync(path.join(__dirname, '../runeLibr/KrestEnergy.json'), 'utf8')),
  classic:JSON.parse(fs.readFileSync(path.join(__dirname, '../runeLibr/RuneEnergy.json'), 'utf8'))
},
finance:{
  cross:JSON.parse(fs.readFileSync(path.join(__dirname, '../runeLibr/KrestFinance.json'), 'utf8'))
},
career:{
  classic:JSON.parse(fs.readFileSync(path.join(__dirname, '../runeLibr/RuneCareer.json'), 'utf8'))
},
};
module.exports = {
  generateLayout: (theme,type) => {
    if(!runesLibrary[theme] || !runesLibrary[theme][type]){
      throw new Error ("Выбранная тема или тип расклада отсутствует");
    }

    const library = runesLibrary[theme][type];
    const keys = Object.keys(library);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];

    return {
      key: randomKey,
      runes: library[randomKey].runes,
      description: library[randomKey].description,
      theme:theme,
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
  let newLevel = null;
  let levelUp = false; 

  if (user) {
    updatedScore = user.score + 10; // +10 очков денег за расклад
    await supabase
      .from('users')
      .update({ score: updatedScore })
      .eq('telegram', telegramId);

    // Получаем текущий опыт пользователя
    const { data: experienceData, error: experienceError } = await supabase
      .from('user_experience')
      .select('id,experience,level_id')
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

    //Проверка на уровень (не стоит ли обновить)
    const{data: levelData,error: levelError} = await supabase
    .from('levels')
    .select('id','level_name')
    .lte('experience_required',updexpPoints)
    .order('experience_required', {ascending:false} )
    .limit(1)

    if (levelError) throw levelError;

    newLevel = levelData.length ? levelData[0].id : experienceData.level_id
    
    if (newLevel !== experienceData.level_id) {
      levelUp = true;
      await supabase
        .from('user_experience')
        .update({level_id: newLevel})
        .eq ('user_id',user.id)
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

  return { 
    score: updatedScore, 
    experience: updexpPoints, 
    level: newLevel,
    levelUp: levelUp
  };
},
};
