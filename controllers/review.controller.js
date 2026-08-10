const Review = require('../models/Review')
const Application = require('../models/Application')
const WorkerProfile = require('../models/WorkerProfile')
const BusinessProfile = require('../models/BusinessProfile')

async function createReview(req, res) {
    const { rating, comment } = req.body
    try {
        const application = await Application.findById(req.params.id)
            .populate('worker')
            .populate({ path: 'shift', populate: { path: 'postedBy' } })

        if (!application) {
            return res.status(404).json({ message: 'Application not found' })
        }

        if (application.status !== 'completed' || application.attendanceStatus !== 'attended') {
            return res.status(400).json({ message: 'Reviews can only be left for completed applications' })
        }

        const workerUserId = application.worker.owner
        const businessUserId = application.shift.postedBy.owner
        const reviewerId = req.user._id

        let revieweeId
        if (workerUserId.equals(reviewerId)) {
            revieweeId = businessUserId
        } else if (businessUserId.equals(reviewerId)) {
            revieweeId = workerUserId
        } else {
            return res.status(403).json({ message: 'You are not a participant in this application' })
        }

        const createdReview = await Review.create({
            reviewer: reviewerId,
            reviewee: revieweeId,
            application: application._id,
            rating,
            comment
        })

        res.status(201).json(createdReview)
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message })
        }
        if (err.code === 11000) {
            return res.status(409).json({ message: 'You have already reviewed this application.' })
        }
        console.error(err)
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

async function updateReview(req, res) {
    const { rating, comment } = req.body
    try {
        const updatedReview = await Review.findByIdAndUpdate(
            req.params.id,
            { rating, comment },
            { new: true, runValidators: true }
        )

        res.status(200).json(updatedReview)
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message })
        }
        console.error(err)
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

async function deleteReview(req, res) {
    try {
        await Review.findByIdAndDelete(req.params.id)
        res.status(204).json({ message: 'Review deleted successfully.' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

async function getWorkerReviews(req, res) {
    try {
        const workerProfile = await WorkerProfile.findById(req.params.id)

        if (!workerProfile) {
            return res.status(404).json({ message: 'Worker profile not found.' })
        }

        const reviews = await Review.find({ reviewee: workerProfile.owner })
            .populate('reviewer', 'username')
            .sort({ createdAt: -1 })

        res.status(200).json(reviews)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

async function getBusinessReviews(req, res) {
    try {
        const businessProfile = await BusinessProfile.findById(req.params.id)

        if (!businessProfile) {
            return res.status(404).json({ message: 'Business profile not found.' })
        }

        const reviews = await Review.find({ reviewee: businessProfile.owner })
            .populate('reviewer', 'username')
            .sort({ createdAt: -1 })

        res.status(200).json(reviews)
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

module.exports = { createReview, updateReview, deleteReview, getWorkerReviews, getBusinessReviews }
