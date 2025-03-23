//* Выводим топ 50 игроков для рейтинга
//!Текущее место пользователя добавить в будущем (затратно)

const supabase = require('../supabaseClient');

async function raitStat() {
  const {data: topData, error:topError} = await supabase
    .from('user_experience')
    .select('experience, users!inner(nikname),level_id')
    .order('experience',{accending:false})
    .limit(50);
    
   // Форматируем данные для ответа
  const result = topData.map((row) => ({
    nikname: row.users.nikname,
    level: row.level_id,
    experience: row.experience
  }));

  return result;
}


module.exports = {
  raitStat,
};
