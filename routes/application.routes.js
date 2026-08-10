const router = require("express").Router();
const verifyToken = require("../middleware/verifyToken");
const {
    getShiftApplications,
    getMyApplications,
    getApplicationById,
    getBusinessApplications,
    applyToShift,
    withdrawApplication,
    acceptApplication,
    rejectApplication,
    cancelAssignment,
    updateAttendance
} = require('../controllers/application.controller');

const validateObjectId = require('../middleware/validateObjectId');
const isWorker = require('../middleware/isWorker');
const isProfileComplete = require('../middleware/isProfileComplete');
const isActiveWorker = require('../middleware/isActiveWorker');
const isBusiness = require('../middleware/isBusiness');
const isApplicationParticipant = require('../middleware/isApplicationParticipant');
const isApplicationWorker = require('../middleware/isApplicationWorker');
const isApplicationBusiness = require('../middleware/isApplicationBusiness');
const isShiftOwner = require("../middleware/isShiftOwner");

router.post('/shifts/:id', verifyToken, validateObjectId, isWorker, isActiveWorker, isProfileComplete, applyToShift);
router.get('/shifts/:id', verifyToken, validateObjectId, isBusiness, isShiftOwner, getShiftApplications);
router.get('/me', verifyToken, isWorker, getMyApplications);
router.get('/business/me', verifyToken, isBusiness, getBusinessApplications);
router.get('/:id', verifyToken, validateObjectId, isApplicationParticipant, getApplicationById);
router.put('/:id/withdraw', verifyToken, validateObjectId, isWorker, isApplicationWorker, withdrawApplication);
router.put('/:id/cancel-assignment', verifyToken, validateObjectId, isApplicationParticipant, cancelAssignment);
router.put('/:id/accept', verifyToken, validateObjectId, isBusiness, isApplicationBusiness, acceptApplication);
router.put('/:id/reject', verifyToken, validateObjectId, isBusiness, isApplicationBusiness, rejectApplication);
router.put('/:id/attendance', verifyToken, validateObjectId, isBusiness, isApplicationBusiness, updateAttendance);


module.exports = router;
