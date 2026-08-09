const Application = require('../models/Application');

function doShiftsOverlap(firstShift, secondShift){
    return firstShift.startTime < secondShift.endTime && firstShift.endTime > secondShift.startTime;
}

async function hasAcceptedShiftConflict(workerId, requestedShift){
    const acceptedApplications = await Application.find({
        worker: workerId,
        status: 'accepted'
    }).populate('shift');
    for(const application of acceptedApplications){
        if(doShiftsOverlap(requestedShift, application.shift)){
            return true;
        }
    }
    return false;
}

async function withdrawConflictingApplications(workerId, acceptedShift){

    const pendingApplications = await Application.find({
        worker: workerId,
        status: 'pending'
    }).populate('shift');

    const conflictingApplicationsIds = pendingApplications.filter(application => (
        doShiftsOverlap(acceptedShift, application.shift)
    )).map(application => application._id);

    await Application.updateMany({_id: {$in: conflictingApplicationsIds}}, {status: 'withdrawn'});
}

module.exports = {
    doShiftsOverlap,
    hasAcceptedShiftConflict,
    withdrawConflictingApplications
}