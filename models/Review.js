const mongoose = require("mongoose");

const ObjectId = mongoose.Schema.Types.ObjectId;

const reviewSchema = new mongoose.Schema(
    {
        reviewer: {
            type: ObjectId,
            ref: 'BusinessProfile',
            required: true
        },
        reviewee: {
            type: ObjectId,
            ref: 'WorkerProfile',
            required: true
        },
        application: {
            type: ObjectId,
            ref: 'Application',
            required: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            required: true,
            trim: true
        }

    },
    { timestamps: true },
);

reviewSchema.index({ application: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;