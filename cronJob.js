const cron = require('node-cron');
const updateDailyTasks = require('./services/dailyTaskScheduler');

// Запускаем обновление каждый день в 00:00
cron.schedule('0 0 * * *', async () => {
  console.log('Запуск обновления заданий...');
  await updateDailyTasks();
});

console.log('Планировщик заданий запущен');
