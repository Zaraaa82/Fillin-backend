const Review = require('../models/Review');
const Application = require('../models/Application');
const WorkerProfile = require('../models/WorkerProfile');
const BusinessProfile = require('../models/BusinessProfile');

async function calculateAverageRating(userId) {
    const reviews = await Review.find({ reviewee: userId });

    if (!reviews.length) return 0;

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return totalRating / reviews.length;
}

async function countCompletedShifts(workerProfileId) {
    return Application.countDocuments({
        worker: workerProfileId,
        status: 'completed',
        attendanceStatus: 'attended'
    });
}

async function calculateReliabilityPercentage(workerProfileId) {
    const attended = await Application.countDocuments({ worker: workerProfileId, attendanceStatus: 'attended' });
    const missed = await Application.countDocuments({ worker: workerProfileId, attendanceStatus: 'missed' });

    if (!attended && !missed) return 0;

    return (attended / (attended + missed)) * 100;
}

async function calculateWorkerStatistics(workerProfileId) {
    const workerProfile = await WorkerProfile.findById(workerProfileId);

    const [completedShifts, avgRating, reliabilityPercentage] = await Promise.all([
        countCompletedShifts(workerProfileId),
        calculateAverageRating(workerProfile.owner),
        calculateReliabilityPercentage(workerProfileId)
    ]);

    return { completedShifts, avgRating, reliabilityPercentage };
}

async function calculateBusinessStatistics(businessProfileId) {
    const businessProfile = await BusinessProfile.findById(businessProfileId);

    const avgRating = await calculateAverageRating(businessProfile.owner);

    return { avgRating };
}

module.exports = {
    calculateAverageRating,
    countCompletedShifts,
    calculateReliabilityPercentage,
    calculateWorkerStatistics,
    calculateBusinessStatistics
}
