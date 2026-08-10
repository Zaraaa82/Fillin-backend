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


/**
 * Add a skill match percentage to every application by comparing
 * the worker's skills with the required skills of its shift.
 */
function addSkillMatchPercentages(applications) {
    const applicationsWithPercentages = applications.map((application) => {
        
        const requiredSkills = application.shift.requiredSkills;
        const workerSkills = application.worker.skills;

        const workerSkillIds = workerSkills.map((skill) => skill._id.toString());

        const matchedSkills = requiredSkills.filter((skill) => workerSkillIds.includes(skill._id.toString()));

        let matchPercentage = 100;

        if (requiredSkills.length) {
            matchPercentage = Math.round((matchedSkills.length / requiredSkills.length) * 100);
        }

        const applicationWithPercentage = {
            ...application.toObject(),
            matchPercentage,
        };

        return applicationWithPercentage;
    }
  );

  return applicationsWithPercentages;
}

module.exports = {
    doShiftsOverlap,
    hasAcceptedShiftConflict,
    withdrawConflictingApplications,
    addSkillMatchPercentages
}