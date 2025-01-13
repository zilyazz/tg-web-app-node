// services/taskService.js
const supabase = require('../supabaseClient');

module.exports = {
  getTasks: async () => {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*');

    if (error) throw error;
    return tasks;
  },

  completeTask: async (telegramId, taskId) => {
    // Получаем задание
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('amount')
      .eq('id', taskId)
      .single();

    if (taskError) throw taskError;

    // Получаем пользователя
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('score, tasks')
      .eq('telegram', telegramId)
      .single();

    if (userError) throw userError;

    // Проверяем, выполнено ли задание ранее
    if (user.tasks.includes(taskId)) {
      throw new Error('Task already completed');
    }

    // Начисляем очки и добавляем задание в список выполненных
    const updatedScore = user.score + task.amount;
    const updatedTasks = [...user.tasks, taskId];

    const { error: updateError } = await supabase
      .from('users')
      .update({ score: updatedScore, tasks: updatedTasks })
      .eq('telegram', telegramId);

    if (updateError) throw updateError;

    return { score: updatedScore };
  },
};