const Shift = require('../models/Shift');
const Application = require('../models/Application');

/**
 * Update all non-cancelled Shifts to the correct status based on
 * their application deadline, available spots, start time, and end time.
 */
async function updateShiftStatuses(){
    const now = new Date();

    const shifts = await Shift.find({status:{$nin: ['cancelled','completed']}});

    await Promise.all(shifts.map( async(shift)=>{

    // Change an open or filled Shift to closed when its application deadline passes.
        if(
            ['open', 'filled'].includes(shift.status) && 
            shift.applicationDeadline <= now
        ){
            shift.status = 'closed';
            await shift.save();
        }

        // Change a filled Shift back to open if a spot becomes available before the Shift starts.
        if(
            shift.status === 'filled' &&
            shift.startTime > now &&
            shift.applicationDeadline > now
        ){
            const availableSpots = await calculateAvailableSpots(shift);
            if(availableSpots){
                shift.status = 'open';
                await shift.save();
            }
        }
        // Change an open, filled, or closed Shift to in_progress when its start time arrives.
        if( ['open', 'filled', 'closed'].includes(shift.status) && shift.startTime <= now ){
            shift.status = 'in_progress';
            await shift.save();
        }

        // Change an in_progress Shift to completed when its end time passes.
        if(shift.status === 'in_progress' && shift.endTime <= now){
            shift.status = 'completed';
            await shift.save();
        }

    }));
}


// Calculate the number of unfilled spots in a shift.
async function calculateAvailableSpots(shift) {
    const acceptedApplications = (await Application.find({shift: shift._id, status: 'accepted'})).length;

    return Math.max(shift.capacity - acceptedApplications , 0);
}


// Add the calculated available spots to each shift.
async function addAvailableSpots(shifts){
    const shiftsWithAvailableSpots = await Promise.all(shifts.map(async (shift) => {
        const availableSpots = await calculateAvailableSpots(shift);
        return {...shift.toObject(), availableSpots};
    }));
    return shiftsWithAvailableSpots;

}

module.exports = {
    updateShiftStatuses,
    calculateAvailableSpots,
    addAvailableSpots
}