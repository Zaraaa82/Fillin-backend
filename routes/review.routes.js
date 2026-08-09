const router = require("express").Router();
const reviewController = require('../controllers/review.controller')
const verifyToken = require('../middleware/verifyToken')
const validateObjectId = require('../middleware/validateObjectId')
const isApplicationParticipant = require('../middleware/isApplicationParticipant')
const isReviewOwner = require('../middleware/isReviewOwner')

router.post('/applications/:id', validateObjectId, verifyToken, isApplicationParticipant, reviewController.createReview)
router.get('/worker/:id', validateObjectId, verifyToken, reviewController.getWorkerReviews)
router.get('/business/:id', validateObjectId, verifyToken, reviewController.getBusinessReviews)
router.put('/:id', validateObjectId, verifyToken, isReviewOwner, reviewController.updateReview)
router.delete('/:id', validateObjectId, verifyToken, isReviewOwner, reviewController.deleteReview)

module.exports = router;
