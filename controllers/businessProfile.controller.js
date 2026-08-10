const BusinessProfile = require('../models/BusinessProfile')
const User = require('../models/User')
const { calculateBusinessStatistics } = require('../services/profileStatisticsService')

async function createBusinessProfile(req, res) {
    const { name, industry, imageURL, description, websiteURL } = req.body

    try {
        const existingProfile = await BusinessProfile.findOne({ owner: req.user._id })
        if (existingProfile) {
            return res.status(409).json({ message: 'A business profile already exists for this account.' })
        }

        const createdBusinessProfile = await BusinessProfile.create({
            name,
            industry,
            imageURL,
            description,
            websiteURL,
            owner: req.user._id
        })

        await User.findByIdAndUpdate(req.user._id, { isProfileComplete: true })

        res.status(201).json(createdBusinessProfile)
    } catch (err) {
        console.error(err)
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message })
        }
        if (err.code === 11000) {
            return res.status(409).json({ message: 'A business profile already exists for this account.' })
        }
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

async function getMyProfile(req, res) {
    try {
        const foundBusinessProfile = await BusinessProfile.findOne({owner: req.user._id});
        if (!foundBusinessProfile) return res.status(404).json({ message: 'Business Profile is Not Found' })

        const { avgRating } = await calculateBusinessStatistics(foundBusinessProfile._id);

        res.status(200).json({ ...foundBusinessProfile.toObject(), avgRating })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

async function getBusinessProfile(req, res) {
    try {
        const foundBusinessProfile = await BusinessProfile.findById(req.params.id)
        if (!foundBusinessProfile) return res.status(404).json({ message: 'Business Profile is Not Found' })

        const { avgRating } = await calculateBusinessStatistics(foundBusinessProfile._id)

        res.status(200).json({ ...foundBusinessProfile.toObject(), avgRating })
    } catch (err) {
        console.error(err)
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

async function updateBusinessProfile(req, res) {
    const { name, industry, imageURL, description, websiteURL } = req.body

    try {
        const updatedBusinessProfile = await BusinessProfile.findOneAndUpdate(
        { owner: req.user._id }, 
        {
            name, industry, imageURL, description, websiteURL
        },
            { new: true, runValidators: true }
        );

        if (!updatedBusinessProfile) {
            return res.status(404).json({message: 'Business Profile is Not Found'});
        }

        res.status(200).json(updatedBusinessProfile)
    } catch (err) {
        console.error(err)
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message })
        }
        res.status(500).json({ message: 'Internal Server Error' })
    }
}

module.exports = { createBusinessProfile, getBusinessProfile, updateBusinessProfile, getMyProfile }
