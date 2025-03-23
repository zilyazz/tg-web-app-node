const raitingGenerate = require('../services/raiting');

module.exports = {
    raitStat: async(req,res) =>{
    try{
        const rait = await raitingGenerate.raitStat();
        res.json(rait);
    } catch (error) {
        res.status(500).json({ error: error.message });
        }
    },
};
