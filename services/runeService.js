const fs = require('fs');
const path = require('path');
const runesLibrary = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../runes-library.json'), 'utf8')
);

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
};