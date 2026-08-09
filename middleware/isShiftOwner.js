const Shift = require('../models/Shift');

async function isShiftOwner(req, res, next){
    const shift = await Shift.findById(req.params.id);

    if (!shift) {
      return res.status(404).json({message: 'Shift not found.'});
    }

    if(!shift.postedBy.equals(req.user._id)){
        return res.status(403).json({message: 'You are not authorized to manage this shift.'});
    }

    next();
}

module.exports = isShiftOwner;