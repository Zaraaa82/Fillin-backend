const Application = require('../models/Application');
const Shift = require('../models/Shift');
const WorkerProfile = require('../models/WorkerProfile');
const BusinessProfile = require('../models/BusinessProfile');
const {
    hasAcceptedShiftConflict,
    withdrawConflictingApplications,
    addSkillMatchPercentages
} = require('../services/applicationService');

const {
    updateShiftStatuses,
    calculateAvailableSpots
} = require('../services/shiftService');

const { recordMissedShift } = require('../services/workerSuspensionService');


async function getShiftApplications(req, res){
    try{
        const applications = await Application.find({
            shift: req.params.id
        }).populate({
            path: 'worker',
            populate: [
                {
                    path: 'owner',
                    select: "username email phoneNumber status"
                },
                {
                    path: 'skills'
                }
            ]
        }).populate({
            path: 'shift',
            populate: [
                {
                    path: 'postedBy'
                },
                {
                    path: 'requiredSkills'
                }
            ]
        });

        const applicationsWithPercentages = addSkillMatchPercentages(applications);

        return res.status(200).json(applicationsWithPercentages);

    }catch(err){
        console.log(err);
        res.status(500).json({message: 'Internal Server Error'});
    }
}

async function getMyApplications(req, res){
    try{
        const worker = await WorkerProfile.findOne({owner: req.user._id});

        const applications = await Application.find({
            worker: worker._id
        }).populate({
            path: 'shift',
            populate: [
                {
                    path: 'postedBy'
                },
                {
                    path: 'requiredSkills'
                }
            ]
        }).sort({ createdAt: -1 });

        return res.status(200).json(applications);

    }catch(err){
        console.log(err);
        res.status(500).json({message: 'Internal Server Error'});
    }
}

async function getApplicationById(req, res){
    try{
        const foundApplication = await Application.findById(
            req.params.id
        ).populate({
            path: 'worker',
            populate: [
                {
                    path: 'owner',
                    select: "username email phoneNumber status"
                },
                {
                    path: 'skills'
                }
            ]
        }).populate({
            path: 'shift',
            populate: [
                {
                    path: 'postedBy'
                },
                {
                    path: 'requiredSkills'
                }
            ]
        });

        if (!foundApplication) {
            return res.status(404).json({message: 'Application not found'});
        }

        const [applicationWithPercentages] = addSkillMatchPercentages([foundApplication]);



        return res.status(200).json(applicationWithPercentages);

    }catch(err){
        console.log(err);
        res.status(500).json({message: 'Internal Server Error'});
    }
}

async function getBusinessApplications(req, res){
    try{
        const business = await BusinessProfile.findOne({owner: req.user._id});
        const postedShifts = await Shift.find({postedBy: business._id}).select('_id');
        const postedShiftsIds = postedShifts.map(shift=> shift._id);

        const applications = await Application.find({shift: {$in: postedShiftsIds}}).populate({
            path: 'worker',
            populate: [
                {
                    path: 'owner',
                    select: "username email phoneNumber status"
                },
                {
                    path: 'skills'
                }
            ]
        }).populate({
            path: 'shift',
            populate: [
                {
                    path: 'postedBy'
                },
                {
                    path: 'requiredSkills'
                }
            ]
        });
    
        const applicationsWithPercentages = addSkillMatchPercentages(applications);

        return res.status(200).json(applicationsWithPercentages);

    }catch(err){
        console.log(err);
        res.status(500).json({message: 'Internal Server Error'});
    }
}

async function applyToShift(req, res){
    try{
        const {id: shiftId} = req.params;
        const worker = await WorkerProfile.findOne({owner: req.user._id});
        const requestedShift = await Shift.findOne({_id: shiftId,status: 'open'});
        
        if (!requestedShift) {
            return res.status(404).json({message: 'Shift not found or is not accepting applications'});
        }

        
        const existingApplication = await Application.findOne({
            shift: requestedShift._id,
            worker: worker._id
        });
        
        if(existingApplication){
            return res.status(409).json({message: 'You have already applied to this shift'})
        }

        if(await hasAcceptedShiftConflict(worker._id, requestedShift)){
            return res.status(409).json({message: 'This shift conflicts with an accepted shift'});
        }


        const createdApplication = await Application.create({
            shift: requestedShift._id,
            worker: worker._id
        });

        res.status(201).json(createdApplication);

    }catch(err){
        
        if (err.name === "ValidationError") {
            return res.status(400).json({message: err.message});
        }

        console.log(err);
        res.status(500).json({message: 'Internal Server Error'});
    }
}

async function withdrawApplication(req, res){
    try{
        const  withdrawnApplication = await Application.findOneAndUpdate(
            {
                _id: req.params.id,
                status: 'pending'
            },
            {status: 'withdrawn'},
            {new: true, runValidators: true}
        );

        if (!withdrawnApplication) {
            return res.status(404).json({message: 'Application not found or cannot be withdrawn'});
        }
  
        return res.status(200).json(withdrawnApplication);

    }catch(err){
        console.log(err);
        res.status(500).json({message: 'Internal Server Error'});
    }
}

async function acceptApplication(req, res){
    try{
        const { businessMessage } = req.body;
        const application = await Application.findById(req.params.id).populate('shift');

        if (!application) { 
            return res.status(404).json({message: 'Application not found'});
        }

        if (application.status !== 'pending') {
            return res.status(409).json({message: 'Only pending applications can be accepted'});
        }

        if (application.shift.status !== 'open') {
            return res.status(409).json({message: 'This shift is no longer accepting applications'});
        }
        
        if(await hasAcceptedShiftConflict(application.worker, application.shift)){
            return res.status(409).json({message: 'The worker has a conflicting accepted shift'});
        }


        application.status = 'accepted';
        application.businessMessage = businessMessage;
        await application.save();
        
        const availableSpots = await calculateAvailableSpots(application.shift);
        
        if (availableSpots === 0) {
            application.shift.status = 'filled';
            await application.shift.save();
        }

        await withdrawConflictingApplications(application.worker, application.shift);

        await updateShiftStatuses();

        return res.status(200).json(application);

    }catch(err){
        if (err.name === "ValidationError") {
            return res.status(400).json({message: err.message});
        }
        console.log(err);
        res.status(500).json({message: 'Internal Server Error'});
    }
}

async function rejectApplication(req, res){
    try{
        const { rejectionReason } = req.body;

        if (!rejectionReason?.trim()) {
            return res.status(400).json({message: 'Rejection reason is required'});
        }

        const  rejectedApplication  = await Application.findOneAndUpdate(
            {
                _id: req.params.id,
                status: 'pending'
            },
            {status: 'rejected', rejectionReason},
            {new: true, runValidators: true}
        );

        if (!rejectedApplication) {
            return res.status(404).json({message: 'Application not found or cannot be rejected'});
        }
  
        return res.status(200).json(rejectedApplication);

    }catch(err){
        console.log(err);
        res.status(500).json({message: 'Internal Server Error'});
    }
}

async function cancelAssignment(req, res){
    try{
        const application = await Application.findOne({
            _id: req.params.id,
            status: 'accepted'
        }).populate('shift', 'status');

        if (!application) {
            return res.status(404).json({message: 'Assignment not found or cannot be cancelled'});
        }
        if(['in_progress', 'completed', 'cancelled'].includes(application.shift.status)){
            return res.status(409).json({message: 'Assignment cannot be cancelled after the shift starts'});
        }

        application.status = 'cancelled';
        await application.save();

        await updateShiftStatuses();
  
        return res.status(200).json(application);

    }catch(err){
        console.log(err);
        res.status(500).json({message: 'Internal Server Error'});
    }
}

async function updateAttendance(req, res){
    try{
        const { attendanceStatus } = req.body;

        if (!['attended', 'missed'].includes(attendanceStatus)) {
            return res.status(400).json({message: 'Attendance status must be attended or missed'});
        }

        const application = await Application.findById(req.params.id).populate('shift', 'status');

        if (!application) { 
            return res.status(404).json({message: 'Application not found'});
        }

        if (application.status !== 'accepted') {
            return res.status(409).json({message: 'Attendance can only be updated for an accepted application'});
        }

        if (application.shift.status !== 'completed') {
            return res.status(409).json({message: 'Attendance can only be updated after the shift is completed'});
        }
        

        application.attendanceStatus = attendanceStatus;
        application.status = 'completed';

        await application.save();

        if (attendanceStatus === 'missed') {
            await recordMissedShift(application.worker);
        }
    
        return res.status(200).json(application);

    }catch(err){
        if (err.name === "ValidationError") {
            return res.status(400).json({message: err.message});
        }
        console.log(err);
        res.status(500).json({message: 'Internal Server Error'});
    }
}

module.exports = {
    getShiftApplications,
    getMyApplications,
    getApplicationById,
    getBusinessApplications,
    applyToShift,
    withdrawApplication,
    acceptApplication,
    rejectApplication,
    cancelAssignment,
    updateAttendance
}