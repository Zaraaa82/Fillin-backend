const Review = require('../models/Review');

async function isReviewOwner(req, res, next){
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({message: 'Review not found.'});
    }

    if(!review.reviewer.equals(req.user._id)){
        return res.status(403).json({message: 'You are not authorized to manage this review.'});
    }
    next();
}

module.exports = isReviewOwner;