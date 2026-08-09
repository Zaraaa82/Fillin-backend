const User = require('../models/User');

async function isWorker(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    if (user.role !== 'worker') {
      return res.status(403).json({ message: 'This action is restricted to workers.' });
    }
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function isBusiness(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    if (user.role !== 'business') {
      return res.status(403).json({ message: 'This action is restricted to businesses.' });
    }
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

async function isProfileComplete(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    if (!user.isProfileComplete) {
      return res.status(403).json({ message: 'Please complete your profile before performing this action.' });
    }
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
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

async function isActiveWorker(req, res, next) {
  try {
    const user = await reactivateWorkerIfSuspensionExpired(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    if (user.status === 'suspended') {
      return res.status(403).json({
        message: 'Your account is currently suspended.',
        suspendedUntil: user.suspendedUntil,
      });
    }
    next();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

module.exports = { isWorker, isBusiness, isProfileComplete, isActiveWorker };
