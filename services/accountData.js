const supabase = require('../supabaseClient');

async function accountData(telegramId) {
  //Проверка на наличие в users
  let {data: user, error: userError} = await supabase
    .from('users')
    .select('id, score')
    .eq('telegram',telegramId)
    .maybeSingle();

  if (userError) throw userError;

  if (!user) {
    const {data: newUser, error: insError} = await supabase
      .from('users')
      .insert([{telegram: telegramId, score: 0}])
      .select('id,score')
      .single();
    
    if(insError) throw insError;
    user = newUser;
  }

  let{data:expUser,error:expError} = await supabase
    .from('user_experience')
    .select('experience,levels!inner(level_name)')
    .eq('user_id',user.id)
    .maybeSingle();

  if (expError) throw expError;
  if(!expUser) {
    const {insExpError} = await supabase
      .from('user_experience')
      .insert([{user_id:user.id,experience:0,level_id:1}])

    if (insExpError) throw insExpError;
    expUser = { experience: 0, levels: { level_name: 'Новичок' } }; // Дефолтные значения
  } 
  
  return {
    userId: user.id,
    score: user.score || 0,
    experience: expUser.experience || 0,
    level: expUser.levels?.level_name || 'Новичок'
    //experience: expUser.user_experience?.[0]?.experience || 0,
    //level: expUser.levels?.[0]?.level_name || 'Новичок',
  }
}

module.exports = {
  accountData,
};