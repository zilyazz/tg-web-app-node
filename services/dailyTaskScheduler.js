const supabase = require('../supabaseClient');

async function updateDailyTasks() {
  try {
    // Очищаем задания за вчера
    await supabase.from('daily_tasks').delete().neq('id', 0);

    // Получаем все доступные задания
    const { data: tasks, error: taskError } = await supabase
      .from('tasks')
      .select('*');

    if (taskError) throw taskError;

    // Фильтруем задания по уровню сложности
    const easyTasks = tasks.filter((t) => t.difficulty === 1);
    const mediumTasks = tasks.filter((t) => t.difficulty === 2);
    const hardTasks = tasks.filter((t) => t.difficulty === 3);

    // Выбираем случайные задания
    const dailyTasks = [
      ...easyTasks.sort(() => 0.5 - Math.random()).slice(0, 2),
      ...mediumTasks.sort(() => 0.5 - Math.random()).slice(0, 2),
      ...hardTasks.sort(() => 0.5 - Math.random()).slice(0, 1),
    ];

    // Записываем задания в daily_tasks
    await supabase.from('daily_tasks').insert(
      dailyTasks.map((task) => ({
      task_id: task.id, // ID задания
      date: new Date().toISOString().split('T')[0], // Дата задания
    }))
  );
  

    // Очищаем выполненные задания у пользователей
    await supabase.from('users').update({ daily_tasks_id: [] }).neq('id', 0);

    console.log('Ежедневные задания обновлены и выполненные очищены');
  } catch (error) {
    console.error('Ошибка обновления заданий:', error);
  }
}

module.exports = updateDailyTasks;
