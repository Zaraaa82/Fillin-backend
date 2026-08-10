const WorkerProfile = require('../models/WorkerProfile');
const User = require('../models/User');

const {calculateWorkerStatistics} = require("../services/profileStatisticsService");

async function createWorkerProfile(req, res){
    try{
        const existingWorkerProfile = await WorkerProfile.findOne({owner: req.user._id});
        
        if(existingWorkerProfile){
            return res.status(409).json({message: 'Worker profile already exists'});
        }

        const {fullName, imageURL, bio, skills, location} = req.body;

        const createdWorkerProfile = await WorkerProfile.create({
            owner: req.user._id,
            fullName,
            imageURL,
            bio,
            skills,
            location
        });
        
        await User.findByIdAndUpdate(req.user._id, {isProfileComplete: true});

        res.status(201).json(createdWorkerProfile);

    }catch(err){
        if (err.name === "ValidationError") {
            return res.status(400).json({message: err.message});
        }

        console.log(err);
        res.status(500).json({message: 'Internal Server Error'});
    }
}

async function getWorkerProfile(req, res){
    try{
        const foundWorkerProfile = await WorkerProfile.findById(
            req.params.id
        ).populate('owner','username email phoneNumber status').populate('skills','_id name');

        if(!foundWorkerProfile){
            return res.status(404).json({message: 'Worker profile not found'});
        }

        const {completedShifts, avgRating, reliabilityPercentage} = await calculateWorkerStatistics(foundWorkerProfile._id);
        
        res.status(200).json({
            ...foundWorkerProfile.toObject(),
            completedShifts,
            avgRating,
            reliabilityPercentage
        }); 
        
    }catch(err){
        
        console.log(err);
        res.status(500).json({message: 'Internal Server Error'});
    }
}

async function updateWorkerProfile(req, res){
    try{
        const { fullName, imageURL, bio, skills, location } = req.body;

        const updatedWorkerProfile = await WorkerProfile.findOneAndUpdate(
            {        
                _id:req.params.id,
                owner: req.user._id
            },
            {
                fullName,
                imageURL,
                bio,
                skills,
                location
            },
            {new: true, runValidators: true}
        );
        
        if(!updatedWorkerProfile){
            return res.status(404).json({message: 'Worker profile not found'});
        }

        res.status(200).json(updatedWorkerProfile);

    }catch(err){

        if (err.name === "ValidationError") {
            return res.status(400).json({message: err.message});
        }

        console.log(err);
        res.status(500).json({message: 'Internal Server Error'});
    }
}

module.exports = {
    createWorkerProfile,
    getWorkerProfile,
    updateWorkerProfile
}
