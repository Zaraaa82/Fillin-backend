const Skill = require('../models/Skill')

async function getAllSkills(req,res){
    try{
        const allSkills = await Skill.find().sort({ name: 1 })
        res.status(200).json(allSkills)

    }catch(err){
        console.error(err)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

module.exports = {getAllSkills}