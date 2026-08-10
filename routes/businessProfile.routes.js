const router = require("express").Router();
const verifyToken = require("../middleware/verifyToken");
const isBusiness = require("../middleware/isBusiness");
const businessProfileController = require('../controllers/businessProfile.controller');
const validateObjectId = require("../middleware/validateObjectId");

router.post('/', verifyToken, isBusiness, businessProfileController.createBusinessProfile)
router.put('/', verifyToken, isBusiness, businessProfileController.updateBusinessProfile)
router.get('/me', verifyToken, isBusiness, businessProfileController.getMyProfile)
router.get('/:id', validateObjectId, businessProfileController.getBusinessProfile)

module.exports = router;
