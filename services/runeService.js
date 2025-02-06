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
    
    return {
      key: randomKey,
      runes: runesLibrary[randomKey].runes,
      description: runesLibrary[randomKey].description
    };
  },

 //добавим когда бд будет и учет очков за расклад
  addPointsForLayout: async (telegramId) => {
    const { data: user, error } = await supabase
      .from('users')
      .select('score')
      .eq('telegram', telegramId)
      .single();
    
      let updatedScore;

    if (user) {
      const updatedScore = user.score + 10; // 10 очков за расклад
      await supabase
        .from('users')
        .update({ score: updatedScore })
        .eq('telegram', telegramId);
    } else {
      await supabase
        .from('users')
        .insert([{ telegram: telegramId, score: updatedScore, tasks: [] }]);
    }
    return updatedScore;
  }, 
};
/*
const fs = require('fs');
const path = require('path');
const runesLibrary = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../runes-library.json'), 'utf8')
);
const supabase = require('../supabaseClient');

module.exports = {
  generateLayout: () => {
    const runesCount = 5; // Количество доступных рун
    const positionsCount = 5; // Количество позиций в раскладе

    // Группируем ключи по номерам рун
    const runeGroups = {};
    Object.keys(runesLibrary).forEach((key) => {
      const [runeIndex] = key.split('-'); // Извлекаем номер руны (первая часть ключа)
      if (!runeGroups[runeIndex]) {
        runeGroups[runeIndex] = [];
      }

      runeGroups[runeIndex].push(key);
    });

    // Выбираем случайные уникальные руны
    const selectedRunes = Object.keys(runeGroups)
      .sort(() => Math.random() - 0.5) // Перемешиваем массив номеров рун
      .slice(0, positionsCount); // Берем только нужное количество позиций

    // Генерируем расклад
    const layout = selectedRunes.map((runeIndex) => {
      const possibleKeys = runeGroups[runeIndex]; // Ключи для данной руны
      const randomKey = possibleKeys[Math.floor(Math.random() * possibleKeys.length)]; // Случайный ключ из доступных
      return runesLibrary[randomKey]; // Достаем объект руны из библиотеки
    });

    return layout;
  },
  addPointsForLayout: async (telegramId) => {
    const { data: user, error } = await supabase
      .from('users')
      .select('score')
      .eq('telegram', telegramId)
      .single();

    if (user) {
      const updatedScore = user.score + 10; // 10 очков за расклад
      await supabase
        .from('users')
        .update({ score: updatedScore })
        .eq('telegram', telegramId);
    } else {
      await supabase
        .from('users')
        .insert([{ telegram: telegramId, score: 10, tasks: [] }]);
    }
  },
};
*/