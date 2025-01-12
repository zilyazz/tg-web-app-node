const { createClient } = require('@supabase/supabase-js');
//DB  QvTPihqp2IvZUI10

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;