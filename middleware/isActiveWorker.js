const { reactivateWorkerIfSuspensionExpired } = require('../services/workerSuspensionService');

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

module.exports =  isActiveWorker ;
