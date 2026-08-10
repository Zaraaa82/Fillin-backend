const Shift = require('../models/Shift');
const BusinessProfile = require("../models/BusinessProfile");
const { addAvailableSpots } = require('../services/shiftService');

async function getAllShifts(req, res){
    try{
        const allShifts = await Shift.find({status: {$ne: 'cancelled'}}).populate('postedBy').populate('requiredSkills', '_id name');
        const shifts = await addAvailableSpots(allShifts);
        return res.status(200).json(shifts);

    }catch(err){
        console.log(err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

/**
 * Return a shift by id.
 * Only the business owner can view a cancelled shift.
 */
async function getShiftById(req, res){
    try{
        const foundShift = await Shift.findById(req.params.id).populate('postedBy').populate('requiredSkills', '_id name');
        if(!foundShift){
            return res.status(404).json({message: 'Shift not found'});
        }
        const isOwner = req.user && foundShift.postedBy.owner.equals(req.user._id);

        if(!isOwner && foundShift.status === 'cancelled'){
            return res.status(403).json({message: 'You are not authorized to view this shift'});
        }

        const [shift] = await addAvailableSpots([foundShift]);
        return res.status(200).json(shift);
        
    }catch(err){
        console.log(err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}


/**
 * Return all shifts posted by a business.
 * The business owner can view all shifts, including cancelled ones.
 * Cancelled shifts are excluded for all other users.
 */
async function getShiftsByBusiness(req, res){
    try{
        const businessProfile = await BusinessProfile.findById(req.params.id).select('owner');

        if(!businessProfile){
            return res.status(404).json({message: 'Business profile not found'});
        }

        const filter = {postedBy:req.params.id};

        
        // Hide cancelled shifts unless the requester owns the business profile.
        const isOwner = req.user && businessProfile.owner.equals(req.user._id);
        if(!isOwner){
            filter.status = {$ne: 'cancelled'};
        }

        const allShifts = await Shift.find(filter).populate('postedBy').populate('requiredSkills', '_id name');

        const shifts = await addAvailableSpots(allShifts);

        return res.status(200).json(shifts);

    }catch(err){
        console.log(err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

async function createShift(req, res){
    try{
        const businessProfile = await BusinessProfile.findOne({owner: req.user._id});

        if(!businessProfile){
            return res.status(404).json({message: 'Business profile not found'});
        }
        const {
            title, 
            description, 
            requiredSkills, 
            startTime, 
            endTime, 
            location, 
            payAmount, 
            capacity, 
            applicationDeadline
        } = req.body;

       const createdShift = await Shift.create({
            postedBy: businessProfile._id,
            title, 
            description, 
            requiredSkills, 
            startTime, 
            endTime, 
            location, 
            payAmount, 
            capacity, 
            applicationDeadline
       });
       await createShift.populate('requiredSkills', '_id name');
       return res.status(201).json(createdShift);

    }catch(err){
        if (err.name === "ValidationError") {
            return res.status(400).json({message: err.message});
        }

        console.log(err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

async function updateShift(req, res){
    try{

        const {
            title, 
            description, 
            requiredSkills, 
            startTime, 
            endTime, 
            location, 
            payAmount, 
            capacity, 
            applicationDeadline
        } = req.body;

       const updatedShift = await Shift.findByIdAndUpdate(
        req.params.id,
        {
            title, 
            description, 
            requiredSkills, 
            startTime, 
            endTime, 
            location, 
            payAmount, 
            capacity, 
            applicationDeadline
       }, 
       {new: true, runValidators: true}).populate('requiredSkills', '_id name');

        if (!updatedShift) {
            return res.status(404).json({message: 'Shift not found'});
        }

        return res.status(200).json(updatedShift);

    }catch(err){
        if (err.name === "ValidationError") {
            return res.status(400).json({message: err.message});
        }

        console.log(err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}

async function cancelShift(req, res){
    try{

        const cancelledShift = await Shift.findOneAndUpdate(
            {
                _id: req.params.id,
                status: {$nin: ['cancelled', 'in-progress', 'completed']}
            },
            {status: 'cancelled'},
            {new: true, runValidators: true}
        );

        if (!cancelledShift) {
            return res.status(404).json({message: 'Shift not found or cannot be cancelled'});
        }

        return res.status(200).json(cancelledShift);

    }catch(err){
        console.log(err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}



module.exports = {
  getAllShifts,
  getShiftById,
  getShiftsByBusiness,
  createShift,
  updateShift,
  cancelShift
};