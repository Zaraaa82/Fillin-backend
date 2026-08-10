const router = require('express').Router();
const {
    createWorkerProfile,
    getWorkerProfile,
    updateWorkerProfile
} = require('../controllers/workerProfile.controller');
const verifyToken = require('../middleware/verifyToken');
const isWorker = require('../middleware/isWorker');
const validateObjectId = require('../middleware/validateObjectId');



router.post('/', verifyToken, isWorker, createWorkerProfile);
router.get('/:id', verifyToken, validateObjectId, getWorkerProfile);
router.put('/:id', verifyToken, isWorker, validateObjectId, updateWorkerProfile)

module.exports = router;