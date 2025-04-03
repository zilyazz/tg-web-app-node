const supabase = require('../supabaseClient');

//* Функция проверки выполнения расклада классического три в ряд
async function checkClassicSpread(userId) {
  const now = new Date();
  const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const endOfDay = new Date(startOfDay.getTime() + 86400000 - 1); // 23:59:59.999

  //Преобразуем в формат, который понимает Supabase
  function toSupabaseTimestamp(date) {
    return date.toISOString().replace('T', ' ').replace('Z', '+00');
  }

  const startStr = toSupabaseTimestamp(startOfDay); // "2025-04-02 00:00:00.000+00"

  // 2. Форматируем даты для Supabase

  const { data, error } = await supabase
    .from('spreads')
    .select('1')
    .eq('Userid', userId)
    .eq('Theme', 'class') // Проверяем только классический расклад
    .eq('Type','classic')
    .gte('DateCreate', startStr);

  if (error) {
    console.error('Ошибка при проверке классического расклада:', error);
    return false;
  }

  console.log('Найдено раскладов:', data.length);
  return data.length > 0;
}

//* Функция проверки выполнения расклада Любовь pyramid
async function checkLovePyramid(userId) {
  const now = new Date();
  const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const endOfDay = new Date(startOfDay.getTime() + 86400000 - 1); // 23:59:59.999

  //Преобразуем в формат, который понимает Supabase
  function toSupabaseTimestamp(date) {
    return date.toISOString().replace('T', ' ').replace('Z', '+00');
  }

  const startStr = toSupabaseTimestamp(startOfDay); // "2025-04-02 00:00:00.000+00"

  // 2. Форматируем даты для Supabase

  const { data, error } = await supabase
    .from('spreads')
    .select('1')
    .eq('Userid', userId)
    .eq('Theme', 'love') // Проверяем только классический расклад
    .eq('Type','pyramid')
    .gte('DateCreate', startStr);

  if (error) {
    console.error('Ошибка при проверке классического расклада:', error);
    return false;
  }

  console.log('Найдено раскладов:', data.length);
  return data.length > 0;
}  
  // Добавляем в маппинг
  const taskChecks = {
    checkClassicSpread,
    checkLovePyramid,
  };
  
  module.exports = taskChecks;
  
