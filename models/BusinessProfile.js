const mongoose = require('mongoose')

const ObjectId = mongoose.Schema.Types.ObjectId;

const businessProfileSchema = new mongoose.Schema({
    owner: {
        type: ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    industry: {
        type: String,
        required: true,
        enum: [
            'restaurant',
            'cafe',
            'hotel',
            'catering',
            'event venue',
            'wedding',
            'exhibition & conference',
            'retail',
            'supermarket',
            'other'
        ],
        trim: true
    },
    imageURL: {
        type: String,
        trim: true,
        required: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    websiteURL: {
        type: String,
        trim: true
    }

}, { timestamps: true })

const BusinessProfile = mongoose.model('BusinessProfile', businessProfileSchema)

module.exports = BusinessProfile