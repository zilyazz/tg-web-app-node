const supabase = require('../supabaseClient');
//! Нужно отправлять: уровень, ник, количество опыта.
module.exports = {
    raitStat: async (telegramID) =>{
        const {data: topData, error:topError} = await supabase
        .from('user_experience')
        .select('users(telegram),experience')
        .order('experience',{accending:false})
        .limit(20);
    
        if(topError) throw Error;

    //Текущее место пользователя
    const {data: userPos, error:posError} = await supabase
    .from('user_experience')
    .select('users(telegram),experience')
    .order('experience',{accending:false})
    .limit(20);
    
    const userIndex = userPos.findIndex(user => user.user_id === telegramId);


    }
}