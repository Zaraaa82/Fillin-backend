const WorkerProfile = require('../models/WorkerProfile');
const User = require('../models/User');

async function createWorkerProfile(req, res){
    try{
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
        ).populate('owner','username email phoneNumber status').populate('skills', 'name');

        if(!foundWorkerProfile){
            return res.status(404).json({message: 'Worker profile not found'});
        }
        
        res.status(200).json(foundWorkerProfile); 
        
    }catch(err){
        
        console.log(err);
        res.status(500).json({message: 'Internal Server Error'});
    }
}

async function updateWorkerProfile(req, res){
    try{
        const { fullName, imageURL, bio, skills, location } = req.body;

        const updatedWorkerProfile = await WorkerProfile.findByIdAndUpdate(
            req.params.id,
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
