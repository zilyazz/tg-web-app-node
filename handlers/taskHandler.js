const supabase = require('../supabaseClient');
const taskChecks = require('../services/taskCheckService');

// Получение списка заданий на сегодня и их статуса выполнения
async function getDailyTasksWithStatus(req, res) {
  const userId = req.params.userId;

  try {
    // Получаем сегодняшние задания с информацией из tasks
    const { data: dailyTasks, error: taskError } = await supabase
      .from('daily_tasks')
      .select('task_id, tasks(description, points, check_function)')
      .eq('date', new Date().toISOString().split('T')[0]);

    if (taskError) throw taskError;

    // Получаем список выполненных заданий пользователя
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('daily_tasks_id')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    const completedTasks = userData?.daily_tasks_id || [];

    // Проверяем выполнение заданий
    const tasksWithStatus = await Promise.all(
      dailyTasks.map(async (task) => {
        const taskInfo = task.tasks; // Данные из таблицы tasks
        const isCompleted = completedTasks.includes(task.task_id);
        const isAvailable = await (taskChecks[taskInfo.check_function]
          ? taskChecks[taskInfo.check_function](userId)
          : false);

        return {
          id: task.task_id,
          description: taskInfo.description,
          points: taskInfo.points,
          completed: isCompleted,
          available: isAvailable,
        };
      })
    );

    res.json(tasksWithStatus);
  } catch (error) {
    console.error('Ошибка получения статуса заданий:', error);
    res.status(500).json({ message: 'Ошибка получения статуса заданий' });
  }
}

// Завершение задания и начисление очков
async function completeTask(req, res) {
  const { userId, taskId } = req.body;

  try {
    // Проверяем, существует ли задание
    const { data: task, error: taskError } = await supabase
      .from('daily_tasks')
      .select('task_id, tasks(points)')
      .eq('task_id', taskId)
      .single();

    if (taskError || !task) {
      return res.status(400).json({ message: 'Задание не найдено' });
    }

    // Проверяем, выполнял ли пользователь это задание
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('daily_tasks_id, score')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    if (userData.daily_tasks_id.includes(taskId)) {
      return res.status(400).json({ message: 'Задание уже выполнено' });
    }

    // Добавляем задание в список выполненных
    const updatedTasks = [...userData.daily_tasks_id, taskId];

    // Начисляем очки
    const newScore = userData.score + task.tasks.points;

    await supabase
      .from('users')
      .update({ daily_tasks_id: updatedTasks, score: newScore })
      .eq('id', userId);

    res.json({ message: 'Задание выполнено', newScore });
  } catch (error) {
    console.error('Ошибка выполнения задания:', error);
    res.status(500).json({ message: 'Ошибка выполнения задания' });
  }
}

module.exports = { getDailyTasksWithStatus, completeTask };
