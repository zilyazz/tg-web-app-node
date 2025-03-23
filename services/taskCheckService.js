const supabase = require('../supabaseClient');

// Функция проверки подписки на канал
async function checkSubscription(userId) {
  // Пример: предположим, что в таблице users есть поле is_subscribed
  const { data, error } = await supabase
    .from('users')
    .select('is_subscribed')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Ошибка при проверке подписки:', error);
    return false;
  }

  return data.is_subscribed;
}

// Функция проверки отправки сообщения в чат
async function checkMessageSent(userId) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('user_id', userId)
    .gt('timestamp', new Date().setHours(0, 0, 0, 0)); // Сообщения за сегодня

  if (error) {
    console.error('Ошибка при проверке сообщений:', error);
    return false;
  }

  return data.length > 0;
}

// Функция проверки выполнения расклада
async function checkClassicSpread(userId) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0); // Устанавливаем 00:00:00
  
  const dateString = startOfDay.toISOString().slice(0, 19).replace('T', ' ');

  console.log(`Проверка расклада с датой: ${dateString}`);

  const { data, error } = await supabase
    .from('spreads')
    .select('*')
    .eq('Userid', userId)
    .eq('Theme', 'class') // Проверяем только классический расклад
    .eq('Type','classic')
    .gte('DateCreate', dateString);

  if (error) {
    console.error('Ошибка при проверке классического расклада:', error);
    return false;
  }

  console.log(`Найдено раскладов: ${data.length}`);
  return data.length > 0;
}

  
  // Добавляем в маппинг
  const taskChecks = {
    checkSubscription,
    checkMessageSent,
    checkClassicSpread,
  };
  
  module.exports = taskChecks;
  
