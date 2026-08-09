const router = require("express").Router();
const {
  getAllShifts,
  getShiftById,
  getShiftsByBusiness,
  createShift,
  updateShift,
  cancelShift
} = require('../controllers/shift.controller')
const verifyToken = require("../middleware/verifyToken");
const isBusiness = require('../middleware/isBusiness');
const isProfileComplete = require('../middleware/isProfileComplete');
const validateObjectId = require('../middleware/validateObjectId');
const isShiftOwner = require('../middleware/isShiftOwner');

router.get('/', getAllShifts);
router.get('/business/:id', validateObjectId, getShiftsByBusiness);
router.get('/:id', validateObjectId, getShiftById);
router.post('/', verifyToken, isBusiness, isProfileComplete, createShift);
router.put('/:id', verifyToken, validateObjectId, isBusiness, isShiftOwner, updateShift);
router.delete('/:id', verifyToken, validateObjectId, isBusiness, isShiftOwner, cancelShift);



module.exports = router;