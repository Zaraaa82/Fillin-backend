const router = require("express").Router();
const skillController = require('../controllers/skill.controller')

router.get('/', skillController.getAllSkills)

module.exports = router;
