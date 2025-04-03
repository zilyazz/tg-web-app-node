const taskService = require('../services/taskService');

module.exports = {
  getDailyTasksWithStatus: async(req,res) => {
    try{
    const{telegramId} = req.params;
    const dailyTasks = await taskService.getDailyTasksWithStatus(telegramId);
    res.json(dailyTasks);
  } catch (error) {
    console.error('Ошибка получения статуса заданий:', error);
    res.status(500).json({ message: 'Ошибка получения статуса заданий' });
  }
  },
  completeTask: async (req, res) => {
    try {
      const { telegramId, taskId } = req.body;
      const result = await taskService.completeTask(telegramId, taskId);
      res.json({newScore: result.newScore });
    } catch (error) {
      console.error('Ошибка выполнения задания:', error);
      res.status(500).json({ message: 'Ошибка выполнения задания' });
    }
  }
};



/*
// Получение списка заданий на сегодня и их статуса выполнения
async function getDailyTasksWithStatus(req, res) {
  const userId = req.params.userId;

  try {
    // Получаем сегодняшние задания с информацией из tasks
    const { data: dailyTasks, error: taskError } = await supabase
      .from('daily_tasks')
      .select('task_id')
      .eq('date', new Date().toISOString().split('T')[0]);

    if (taskError) {
      console.error('Ошибка при получении ежедневных заданий:', taskError.message);
      throw taskError;
    }

   // console.log('Полученные задания на сегодня:', dailyTasks);

    // Получаем список выполненных заданий пользователя
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('daily_tasks_id,claimed_rewards')
      .eq('telegram', userId);

    if (userError) {
      console.error('Ошибка при получении данных пользователя:', userError.message);
      throw userError;
    }

    //let completedTasks = userData?.daily_tasks_id || [];
    let completedTasks = Array.isArray(userData?.daily_tasks_id) 
    ? userData.daily_tasks_id 
    : JSON.parse(userData?.daily_tasks_id || "[]");

    let claimedRewards = userData[0]?.claimed_rewards || []; // Явно берем из массива

    // Получаем подробную информацию о заданиях (description, points, check_function)
    const taskIds = dailyTasks.map(task => task.task_id);
    const { data: tasks, error: taskDetailsError } = await supabase
      .from('tasks')
      .select('id, description, points, check_function')
      .in('id', taskIds);

    if (taskDetailsError) {
      console.error('Ошибка при получении подробной информации о заданиях:', taskDetailsError.message);
      throw taskDetailsError;
    }

    // Проверяем выполнение заданий
    const tasksWithStatus = await Promise.all(dailyTasks.map(async (task) => {
      const taskInfo = tasks.find(t => t.id === task.task_id); // Находим полную информацию о задании по task_id
      let isCompleted = completedTasks.includes(task.task_id);
      let isAvailable = false;
      let isClaimed = claimedRewards.includes(task.task_id);// Проверяем, собраны ли очки для задания

      // Проверяем доступность задания с учетом функции проверки
      if (taskInfo.check_function && !isCompleted) { // Добавляем условие, что задание не выполнено
        isAvailable = await taskChecks[taskInfo.check_function](userId);
        console.log(`Задание ${task.task_id} доступно: ${isAvailable}`);
      }

      // Если задание доступно и не выполнено, то обновляем его в списке выполненных
      if (isAvailable && !isCompleted) {
        console.log(`Задание ${task.task_id} будет добавлено в выполненные задания.`);

        const { error: updateError } = await supabase
          .from('users')
          .update({
            daily_tasks_id: [...completedTasks, task.task_id]  // Добавляем новое выполненное задание в массив
          })
          .eq('telegram', userId);

        if (updateError) {
          console.error('Ошибка при обновлении статуса задания:', updateError);
        } else {
          console.log(`Задание ${task.task_id} успешно добавлено в выполненные задания.`);
        }
        /*const { data: updatedUserData, error: updatedUserError } = await supabase
        .from('users')
        .select('daily_tasks_id')
        .eq('telegram', userId)
        .single(); 

    if (updatedUserError) {
      console.error('Ошибка при повторном получении данных пользователя:', updateedUserError.message);
    } else {
      completedTasks = updatedUserData?.daily_tasks_id || [];
      console.log('Обновленный список выполненных заданий:', completedTasks); 

      // Теперь обновляем `isCompleted` перед возвратом
      isCompleted = completedTasks.includes(task.task_id);
    }
      isCompleted = true; // Задание теперь выполнено
      }
    
      return {
        id: task.task_id,
        description: taskInfo.description,
        points: taskInfo.points,
        completed: isCompleted,
        available: isAvailable,
        claimed: isClaimed,
      };
    }));

    //console.log('Статус заданий с информацией о выполнении и доступности:', tasksWithStatus);

    res.json(tasksWithStatus);
  } catch (error) {
    console.error('Ошибка получения статуса заданий:', error);
    res.status(500).json({ message: 'Ошибка получения статуса заданий' });
  }
}


// Завершение задания и начисление очков
async function completeTask(req, res) {
  const { userId, taskId } = req.body;

  console.log(`Запрос на выполнение задания для пользователя ${userId}, задание ${taskId}`);

  try {
    // Получаем данные пользователя (только его очки и собранные награды)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('score, claimed_rewards')
      .eq('telegram', userId)
      .single();

    if (userError || !userData) {
      console.error('Пользователь не найден:', userError ? userError.message : 'Нет данных');
      return res.status(400).json({ message: 'Пользователь не найден' });
    }

    const { score, claimed_rewards } = userData;

    // Убедимся, что claimed_rewards это массив
    const validClaimedRewards = Array.isArray(claimed_rewards) ? claimed_rewards : [];

    // Получаем очки задания (не нужна вся информация, только points)
    const { data: taskDetails, error: taskDetailsError } = await supabase
      .from('tasks')
      .select('points')
      .eq('id', taskId)
      .single();

    if (taskDetailsError || !taskDetails) {
      console.error('Не удалось получить информацию о задании:', taskDetailsError ? taskDetailsError.message : 'Нет данных');
      return res.status(400).json({ message: 'Не удалось получить информацию о задании' });
    }

    console.log('Информация о задании для начисления очков:', taskDetails);

    // Начисляем очки
    const newScore = score + taskDetails.points;

    // Обновляем данные пользователя, добавляя задание в список собранных наград
    const { error: updateError } = await supabase
      .from('users')
      .update({ score: newScore, claimed_rewards: [...validClaimedRewards, taskId] })
      .eq('telegram', userId);

    if (updateError) {
      console.error('Ошибка при обновлении данных пользователя:', updateError.message);
      return res.status(500).json({ message: 'Ошибка при обновлении данных пользователя' });
    }

    console.log('Задание выполнено. Новая сумма очков пользователя:', newScore);

    res.json({ message: 'Задание выполнено', newScore });
  } catch (error) {
    console.error('Ошибка выполнения задания:', error);
    res.status(500).json({ message: 'Ошибка выполнения задания' });
  }
}


module.exports = { getDailyTasksWithStatus, completeTask };
*/