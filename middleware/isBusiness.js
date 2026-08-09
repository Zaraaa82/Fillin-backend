const User = require('../models/User');

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

module.exports = isBusiness