/*************************************************************
Функция очистки истории раскладов
Оставляет только 5 последних уникальных раскладов у каждого пользователя
*************************************************************/

require('dotenv').config();
const supabase = require('../supabaseClient');

async function cleanUpSpreadHistory() {
    try {
        //console.log("🔹 Начинаем очистку истории раскладов...");

        // Получаем все расклады, отсортированные по дате (от новых к старым)
        const { data: spreads, error: dateError } = await supabase
            .from('spreads')
            .select('id, Userid, DateCreate')
            .order('DateCreate', { ascending: false });

        if (dateError) {
            console.error('❌ Ошибка при получении данных:', dateError);
            return;
        }

        if (!spreads || spreads.length === 0) {
            console.log("⚠️ Нет данных для обработки, выходим.");
            return;
        }

        //console.log("📊 Получено записей:", spreads.length);

        // Группируем расклады по пользователям
        const userSpreads = {};

        spreads.forEach(({ id, Userid, DateCreate }) => {
            if (!userSpreads[Userid]) {
                userSpreads[Userid] = [];
            }
            userSpreads[Userid].push({ id, date: new Date(DateCreate).toISOString().split('T')[0] });
        });

        // Определяем, какие записи оставить (5 последних у каждого пользователя)
        const allowedIds = new Set();
        Object.keys(userSpreads).forEach(userId => {
            const uniqueDates = new Set();
            userSpreads[userId].forEach(spread => {
                if (uniqueDates.size < 5) {
                    uniqueDates.add(spread.date);
                    allowedIds.add(spread.id);
                }
            });
        });

        //console.log("✅ Оставляем записи с ID:", [...allowedIds]);

        // Удаляем записи, которых нет в allowedIds
        const { error: deleteError } = await supabase
        .from('spreads')
        .delete()
        .not('id', 'in', `(${[...allowedIds].join(',')})`);
      

        if (deleteError) {
            console.error('❌ Ошибка при удалении старых записей:', deleteError);
        } else {
            console.log("🎉 Очистка завершена: оставлены только последние 5 раскладов для каждого пользователя.");
        }
    } catch (error) {
        console.error('❌ Ошибка очистки истории:', error.message);
    }
}

cleanUpSpreadHistory();
module.exports = cleanUpSpreadHistory;
