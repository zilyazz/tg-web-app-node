module.exports = (bot, webAppUrl) => ({
    handleStart: async (msg) => {
      const chatId = msg.chat.id;
      await bot.sendMessage(chatId, 'Привет! Заходи, и получишь все ответы про свою судьбу', {
        reply_markup: {
          inline_keyboard: [
            [{
              text: 'Узнать свою судьбу',
              web_app: { url: webAppUrl }
            }]
          ]
        }
      });
    },
  });