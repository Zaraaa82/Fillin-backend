const BusinessProfile = require('../models/BusinessProfile')
const User = require('../models/User')

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

module.exports = { createBusinessProfile }
