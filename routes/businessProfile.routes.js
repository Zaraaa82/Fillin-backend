const router = require("express").Router();
const verifyToken = require("../middleware/verifyToken");
const isBusiness = require("../middleware/isBusiness");
const businessProfileController = require('../controllers/businessProfile.controller')

router.post('/', verifyToken, isBusiness, businessProfileController.createBusinessProfile)
router.get('/:id', businessProfileController.getBusinessProfile)

module.exports = router;
