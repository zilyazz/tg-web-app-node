const supabase = require('../supabaseClient');
const raitingGenerate = require('../services/raitingGenerate');

module.exports = {
    raitStat: async(req,res) =>{
    try{
        const{telegramID} = req.body;
        const rait = raitingGenerate.raitStat(telegramID);
    } catch (error) {
        res.status(500).json({ error: error.message });
        }
    },
};