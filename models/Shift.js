const mongoose = require('mongoose')

const ObjectId = mongoose.Schema.Types.ObjectId;

const shiftSchema = new mongoose.Schema({
    postedBy: {
        type: ObjectId,
        ref: 'BusinessProfile',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    requiredSkills: {
        type: [ObjectId],
        ref: 'Skill',
        validate: {
            validator: (skills) => skills.length >= 1,
            message: 'At least one skill is required.'
        }
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true,
        validate: {
        validator: function (value) {
            return value > this.startTime;
        },
        message: 'endTime must be later than startTime.'
    }

    },
    location: {
        type: String,
        required: true
    },
    payAmount: {
        type: Number,
        required: true,
        min: 10
    },
    capacity: {
        type: Number,
        required: true,
        min: 1
    },
    applicationDeadline: {
        type: Date,
        required: true,
        validate: {
        validator: function (value) {
            return value < this.startTime;
        },
        message: 'applicationDeadline must be before startTime.'
    }
    },
    status: {
    type: String,
    enum: ['open', 'filled', 'cancelled', 'completed', 'closed ', 'in-progress'],
    default: 'open'
},

}, { timestamps: true })

const Shift = mongoose.model('Shift', shiftSchema)

module.exports = Shift