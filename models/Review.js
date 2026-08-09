const mongoose = require("mongoose");

const ObjectId = mongoose.Schema.Types.ObjectId;

const reviewSchema = new mongoose.Schema(
    {
        reviewer: {
            type: ObjectId,
            ref: 'User',
            required: true
        },
        reviewee: {
            type: ObjectId,
            ref: 'User',
            required: true,
            validate: {
                validator: function (reviewee) {
                    return !reviewee.equals(this.reviewer);
                },
                message: "Reviewer and reviewee cannot be the same user."
            }
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

reviewSchema.index({ application: 1, reviewer: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;