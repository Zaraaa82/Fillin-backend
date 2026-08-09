const User = require('../models/User');

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

module.exports = isProfileComplete