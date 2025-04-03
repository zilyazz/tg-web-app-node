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
    classic:JSON.parse(fs.readFileSync(path.join(__dirname, '../runeLibr/RuneLove.json'), 'utf8')),
    pyramid:JSON.parse(fs.readFileSync(path.join(__dirname, '../runeLibr/PyramidLove.json'), 'utf8'))
  },
  energy:{
    cross:JSON.parse(fs.readFileSync(path.join(__dirname, '../runeLibr/KrestEnergy.json'), 'utf8')),
    classic:JSON.parse(fs.readFileSync(path.join(__dirname, '../runeLibr/RuneEnergy.json'), 'utf8')),
    pyramid:JSON.parse(fs.readFileSync(path.join(__dirname, '../runeLibr/PyramidEnergy.json'), 'utf8'))
  },
  finance:{
    cross:JSON.parse(fs.readFileSync(path.join(__dirname, '../runeLibr/KrestFinance.json'), 'utf8'))
  },
  career:{
    classic:JSON.parse(fs.readFileSync(path.join(__dirname, '../runeLibr/RuneCareer.json'), 'utf8')),
    pyramid:JSON.parse(fs.readFileSync(path.join(__dirname, '../runeLibr/PyramidCareer.json'), 'utf8'))
  },
  danet:{
    classic: {
      Да: {description: 'Да'},
      Нет: {description: 'Нет'}
    }
  }
};


//* Функция для генерации расклада
async function generateLayout (theme,type) {
  if(!runesLibrary[theme] || !runesLibrary[theme][type]){
    throw new Error ("Выбранная тема или тип расклада отсутствует");
  }
  //Генерация Да/Нет (в бд не учитываем)
  if (theme === 'danet') {
    const response = Math.random() < 0.5? 'Да': 'Нет';
    return {
      key: response,
      runes: [],
      description: runesLibrary[theme][type][response].description,
      theme: theme,
      type: type
    };
  }

  const library = runesLibrary[theme][type];
  const keys = Object.keys(library);
  const randomKey = keys[Math.floor(Math.random() * keys.length)]; //! Разобрать
  return {
    key: randomKey,
    runes: library[randomKey].runes,
    description: library[randomKey].description,
    theme:theme,
    type: type
  };  
}

//*Добавление записи в spread (история расклада)
async function insertInSpread (telegramId,layout) {     // Сохраняем данные в таблицу spreads в Supabase
  if (layout.theme !='danet'){
    const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('telegram', telegramId)
    .single();

  const { data, error } = await supabase 
    .from('spreads')
    .insert([
      {
        Userid: user.id,      
        Runes: layout.key,
        Description: layout.description,  
        Theme:layout.theme,
        Type: layout.type
      }
    ]);
  }
}

//* Добавление очков и опыта за расклад
async function addPointsForLayout (telegramId) {
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

  if (user) {  //! Убрать после отладки с Машей
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
      .maybeSingle();

    console.log("Найденная запись опыта:", experienceData, "Ошибка:", experienceError);
//! Убрать после отладки с Машей
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
        .insert([{ user_id: user.id, experience: updexpPoints,level_id: 1 }]);     
    }
//!!!!!!
    //Проверка на уровень (не стоит ли обновить)
    const{data: levelData,error: levelError} = await supabase
    .from('levels')
    .select('id','level_name')
    .lte('experience_required',updexpPoints)
    .order('experience_required', {ascending:false} )
    .limit(1)

    if (levelError) throw levelError;

    newLevel = levelData.length ? levelData[0].id : (experienceData  ? experienceData.level_id: 1)
    
    if (newLevel !== (experienceData  ? experienceData.level_id: 1)) {
      levelUp = true;
      await supabase
        .from('user_experience')
        .update({level_id: newLevel})
        .eq ('user_id',user.id)
    }
//! Убрать после отладки с Машей
  } else {
    updatedScore = 10;
    const { data: newUser, error: newUserError } = await supabase
      .from('users')
      .insert([{ telegram: telegramId, score: updatedScore }])
      .select('id')
      .single();

    if (newUserError) throw newUserError;

    // Начисляем опыт новому пользователю
    await supabase
      .from('user_experience')
      .insert([{ user_id: newUser.id, experience: experiencePoints, level_id: 1 }]);
    
    updexpPoints = experiencePoints;
  }
//!!!!
  return { 
    score: updatedScore, 
    experience: updexpPoints, 
    level: newLevel,
    levelUp: levelUp
  };
}


module.exports = {
  generateLayout,
  insertInSpread,
  addPointsForLayout,
};