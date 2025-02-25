/*************************************************************
Функция очистки истории раскладов
Оставляет только 5 последний уникальных дней (не подряд)
*************************************************************/

//require('dotenv').config();
const supabase = require('../supabaseClient');

async function cleanUpSpreadHistory() {
    try {
        console.log("🔹 Начинаем очистку истории раскладов...");

        // Получаем все расклады, отсортированные по дате (от новых к старым)
        const { data: spreads, error: dateError } = await supabase
            .from('spreads')
            .select('Userid, DateCreate')
            .order('DateCreate', { ascending: false });

        if (dateError) {
            console.error('❌ Ошибка при получении данных:', dateError);
            return;
        }

        console.log("📊 Получено записей:", spreads.length);

        if (!spreads || spreads.length === 0) {
            console.log("⚠️ Нет данных для обработки, выходим.");
            return;
        }

        // Группируем данные по пользователям
        const userDates = {};

        spreads.forEach(({ Userid, DateCreate }) => {
            const date = new Date(DateCreate).toISOString().split('T')[0]; // Формат YYYY-MM-DD
            
            if (!userDates[Userid]) {
                userDates[Userid] = new Set();
            }
            
            userDates[Userid].add(date);
        });

        // Оставляем только 5 последних уникальных дат для каждого пользователя
        const allowedDatesByUser = {};
        Object.keys(userDates).forEach(userId => {
            allowedDatesByUser[userId] = [...userDates[userId]].slice(0, 5);
        });

        // Создаем массив дат, которые нужно оставить
        const allowedDates = new Set();
        Object.values(allowedDatesByUser).forEach(dates => {
            dates.forEach(date => allowedDates.add(date));
        });

        console.log("✅ Оставляем записи за даты:", [...allowedDates]);

        // Если нет дат для удаления — выходим
        if (allowedDates.size === 0) {
            console.log("⚠️ Нет дат для удаления, выходим.");
            return;
        }

        console.log("🚨 Удаляем записи, не входящие в эти даты:", [...allowedDates]);

        // Удаляем записи, у которых дата не входит в список разрешенных
        const { error: deleteError } = await supabase
        .from('spreads')
        .delete()
        .not('DateCreate', 'in', 
          supabase
            .from('spreads')
            .select('DateCreate')
            .in('DateCreate', [...allowedDates].map(date => `${date} 00:00:00`))
        );
      
      
      
      

        if (deleteError) {
            console.error('❌ Ошибка при удалении старых записей:', deleteError);
        } else {
            console.log("🎉 Очистка завершена: оставлены только последние 5 дней для каждого пользователя.");
        }
    } catch (error) {
        console.error('❌ Ошибка очистки истории:', error.message);
    }
}
  cleanUpSpreadHistory();
  module.exports = cleanUpSpreadHistory;
