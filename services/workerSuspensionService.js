const User = require('../models/User');
const WorkerProfile = require('../models/WorkerProfile');

const STRIKES_BEFORE_SUSPENSION = 3;
const SUSPENSION_DAYS = 14;

async function recordMissedShift(workerId) {
    const workerProfile = await WorkerProfile.findById(workerId);
    if (!workerProfile) return null;

    const user = await User.findById(workerProfile.owner);
    if (!user) return null;

    workerProfile.lifetimeMissedCount += 1;

    const nextStrikeCount = workerProfile.strikeCount + 1;

    if (nextStrikeCount >= STRIKES_BEFORE_SUSPENSION) {
        user.status = 'suspended';
        user.suspendedUntil = new Date(Date.now() + SUSPENSION_DAYS * 24 * 60 * 60 * 1000);
        workerProfile.strikeCount = 0;
        await user.save();
    } else {
        workerProfile.strikeCount = nextStrikeCount;
    }

    await workerProfile.save();

    return { workerProfile, user };
}

async function reactivateWorkerIfSuspensionExpired(userId) {
    const user = await User.findById(userId);
    if (!user) return null;

    if (user.status === 'suspended' && user.suspendedUntil && user.suspendedUntil <= new Date()) {
        user.status = 'active';
        user.suspendedUntil = null;
        await user.save();
    }

    return user;
}

module.exports = {
    recordMissedShift,
    reactivateWorkerIfSuspensionExpired,
};
