const Application = require('../models/Application');

async function isApplicationBusiness(req, res, next){
    
    const application = await Application.findById(req.params.id).populate({
        path: 'shift',
        populate: {
            path: 'postedBy',
            select: 'owner'
        }
    });

    if (!application) {
      return res.status(404).json({message: 'Application not found.'});
    }

    if(!application.shift.postedBy.owner.equals(req.user._id)){
        return res.status(403).json({message: 'You are not authorized to manage this application.'});
    }

    next();
}

module.exports = isApplicationBusiness;