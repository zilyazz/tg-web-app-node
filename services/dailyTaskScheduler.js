//console.log("Скрипт запущен");

require('dotenv').config();
const supabase = require('../supabaseClient');

async function updateDailyTasks() {
  try {
   // console.log('Начинаем обновление ежедневных заданий...');
    // Логируем переменные окружения
    //console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
    //console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY ? 'Exists' : 'Not found');

    // Очищаем задания за вчера
    //console.log('Очищаем задания за вчера...');
    const { data: deleteData, error: deleteError } = await supabase.from('daily_tasks').delete().neq('id', 0);
    if (deleteError) {
      console.error('Ошибка при удалении старых записей:', deleteError.message);
      return;
    }
   // console.log('Задания за вчера очищены:', deleteData);

    // Получаем все доступные задания
    //console.log('Получаем все задания...');
    const { data: tasks, error: taskError } = await supabase
      .from('tasks')
      .select('*');
    if (taskError) {
      console.error('Ошибка получения заданий:', taskError.message);
      return;
    }
    //console.log('Полученные задания:', tasks);

    // Фильтруем задания по уровню сложности
    const easyTasks = tasks.filter((t) => t.difficulty === 1);
    const mediumTasks = tasks.filter((t) => t.difficulty === 2);

    //console.log('Легкие задания:', easyTasks);
    //console.log('Средние задания:', mediumTasks);

    // Выбираем случайные задания
    const dailyTasks = [
      ...easyTasks.sort(() => 0.5 - Math.random()).slice(0, 1),
      ...mediumTasks.sort(() => 0.5 - Math.random()).slice(0, 1),
    ];

    //console.log('Выбранные ежедневные задания:', dailyTasks);

    // Записываем задания в daily_tasks
    //console.log('Вставляем задания в daily_tasks...');
    const { data: insertData, error: insertError } = await supabase.from('daily_tasks').insert(
      dailyTasks.map((task) => ({
        task_id: task.id, // ID задания
        date: new Date().toISOString().split('T')[0], // Дата задания
      }))
    );

    if (insertError) {
      console.error('Ошибка вставки в daily_tasks:', insertError.message);
      console.error('Подробности ошибки:', insertError.details);
      return;
    }

    //console.log('Задания успешно добавлены в daily_tasks:', insertData);

    // Очищаем выполненные задания у пользователей
    //console.log('Очищаем выполненные задания у пользователей...');
    const { data: usersData, error: usersError } = await supabase.from('users').update({ daily_tasks_id: [] }).neq('id', 0);

    if (usersError) {
      console.error('Ошибка обновления пользователей:', usersError.message);
      return;
    }

    //console.log('Выполненные задания пользователей очищены:', usersData);

    //console.log('Ежедневные задания обновлены и выполненные очищены');
  } catch (error) {
    console.error('Ошибка обновления заданий:', error.message);
  }
}

// Добавляем логи на случай, если что-то с экспортом
//console.log("До выполнения updateDailyTasks");
updateDailyTasks();
//console.log("После выполнения updateDailyTasks");

module.exports = updateDailyTasks;
