const Application = require('../models/Application');

async function isApplicationParticipant(req, res, next){
    
    const application = await Application.findById(req.params.id).populate({
        path: 'shift',
        populate: {
            path: 'postedBy',
            select: 'owner'
        }
    }).populate({
        path: 'worker',
        select: 'owner'
    });

    if (!application) {
      return res.status(404).json({message: 'Application not found.'});
    }

    const isWorker = application.worker.owner.equals(req.user._id);

    const isBusiness = application.shift.postedBy.owner.equals(req.user._id);

    if (!isWorker && !isBusiness) {
        return res.status(403).json({message: 'You are not authorized to view this application.'});
    }

    next();
}

module.exports = isApplicationParticipant;