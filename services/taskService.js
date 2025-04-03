const supabase = require('../supabaseClient');
const taskChecks = require('./taskCheckService');

//* Получение списка заданий на сегодня
async function getDailyTasks() {
  const { data, error } = await supabase
    .from('daily_tasks')
    .select('task_id')
    .eq('date', new Date().toISOString().split('T')[0]);

  if (error) throw error;
  return data;
}

//* Получаем id, выполненные задания + задания за которые уже собрал награду 
async function getUserTasks (telegramId) {
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id,daily_tasks_id,claimed_rewards')
    .eq('telegram', telegramId);

  if (userError) throw userError;
  return userData[0] || {};
}

//* Получаем необходимую инфу о задании 
async function getTasksDetails (taskIds) {
  const { data: tasks, error: taskDetailsError } = await supabase
    .from('tasks')
    .select('id, description, points, check_function')
    .in('id', taskIds);

  if(taskDetailsError) throw taskDetailsError;
  return tasks;
}

async function updateCompletedTasks (userId, completedTasks, taskIds) {
  const tasksArray = Array.isArray(completedTasks) 
    ? completedTasks 
    : [];

  const updatedTasks = [...tasksArray, taskIds]; 
  const { error: updateError } = await supabase
    .from('users')
    .update({ daily_tasks_id: updatedTasks })
    .eq('id', userId);

  if(updateError) throw updateError;
}

//TODO Функция для поулчения статуса о выполненном задании и о том, собирал ли юзер очки за него
async function getDailyTasksWithStatus (telegramId) {
  const dailyTasks = await getDailyTasks(); 
  const userData = await getUserTasks(telegramId); 
  const taskIds = dailyTasks.map(task => task.task_id); 
  const tasks = await getTasksDetails(taskIds);

  const completedTasks = Array.isArray(userData?.daily_tasks_id) 
    ? userData.daily_tasks_id 
    : JSON.parse(userData?.daily_tasks_id || "[]");

  const claimedRewards = Array.isArray(userData?.claimed_rewards) 
  ? userData.claimed_rewards 
  : JSON.parse(userData?.claimed_rewards || "[]");

  // Проверяем выполнение заданий
  const tasksWithStatus = await Promise.all(dailyTasks.map(async (task) => {
    const taskInfo = tasks.find(t => t.id === task.task_id); // Находим полную информацию о задании по task_id
    let isCompleted = completedTasks.includes(task.task_id); // Проверяем, выполнено ли задание
    let isClaimed = claimedRewards.includes(task.task_id);   // Проверяем, собраны ли очки для задания

    // Автоматически отмечаем как выполненное, если проверка пройдена
    if (taskInfo.check_function && !isCompleted) {
      const checkPassed = await taskChecks[taskInfo.check_function](userData.id);
      if (checkPassed) {
        await updateCompletedTasks(userData.id, completedTasks, task.task_id);
        isCompleted = true;
      }
    }
    
    return {
      id: task.task_id,
      description: taskInfo.description,
      points: taskInfo.points,
      completed: isCompleted,
      claimed: isClaimed,
    };
  }));
  return tasksWithStatus;
}

//TODO Завершение задания и начисление очков
async function completeTask(telegramId, taskId) {
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('score, claimed_rewards')
    .eq('telegram', telegramId)
    .single();
  if(userError) throw userError;

  const validClaimedRewards = Array.isArray(userData.claimed_rewards) // Убедимся, что claimed_rewards это массив
    ? userData.claimed_rewards 
    : []; 

  // Получаем очки задания
  const { data: taskDetails, error: taskDetailsError } = await supabase
    .from('tasks')
    .select('points')
    .eq('id', taskId)
    .single();
  if(taskDetailsError) throw taskDetailsError;

  const newScore = userData.score + taskDetails.points; // Начисляем очки
  const taskIdNumber = Number(taskId);                  // Преобразуем в число (чтобы в массиве было без ковычек)

  const { error: updateError } = await supabase
    .from('users')
    .update({ score: newScore, claimed_rewards: [...validClaimedRewards, taskIdNumber] })
    .eq('telegram', telegramId);
  if(updateError) throw updateError;

  return{newScore};
}

module.exports = {
  getDailyTasksWithStatus, 
  completeTask 
};