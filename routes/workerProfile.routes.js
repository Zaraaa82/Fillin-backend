const router = require('express').Router();
const {
    createWorkerProfile,
    getWorkerProfile,
    updateWorkerProfile,
    getMyProfile
} = require('../controllers/workerProfile.controller');
const verifyToken = require('../middleware/verifyToken');
const isWorker = require('../middleware/isWorker');
const validateObjectId = require('../middleware/validateObjectId');



router.post('/', verifyToken, isWorker, createWorkerProfile);
router.put('/', verifyToken, isWorker, validateObjectId, updateWorkerProfile)
router.get('/me', verifyToken, isWorker, getMyProfile);
router.get('/:id', verifyToken, validateObjectId, getWorkerProfile);

module.exports = router;