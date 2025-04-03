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
    try{
      const { telegramId, taskId } = req.body;
      const result = await taskService.completeTask(telegramId, taskId);
      res.json({newScore: result.newScore });
    } catch (error) {
        console.error('Ошибка выполнения задания:', error);
        res.status(500).json({ message: 'Ошибка выполнения задания' });
    }
  }
};