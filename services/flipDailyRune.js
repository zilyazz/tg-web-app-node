const supabase = require('../supabaseClient');
const fs = require('fs');
const path = require('path');
const dailyRunes = JSON.parse(fs.readFileSync(path.join(__dirname, '../runeLibr/dailyRunes.json'), 'utf8')); 

async function flipRune(telegramId) {
  const randomRune = dailyRunes[Math.floor(Math.random() * dailyRunes.length)];

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('telegram', telegramId)
    .single();

  if (userError) throw userError;

  const { error: updateError } = await supabase
    .from('users_runes')
    .update({ rune: randomRune.id })  
    .eq('user_id', user.id);

  if (updateError) throw updateError;
  return randomRune;
};

module.exports = {
  flipRune
}