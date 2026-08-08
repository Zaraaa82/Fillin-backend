const mongoose = require('mongoose')

const ObjectId = mongoose.Schema.Types.ObjectId;

const applicationSchema = new mongoose.Schema({
    shift: {
        type: ObjectId,
        ref: 'Shift',
        required: true
    },
    worker: {
        type: ObjectId,
        ref: 'WorkerProfile',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'checked-in', 'completed', 'no-show'],
        required: true,
        default: 'pending'
    },
    attendanceStatus: {
        type: String,
        enum: ['not-yet', 'present', 'absent'],
        default: 'not-yet'
    },
    rejectionReason: {
        type: String
    },
    businessMessage: {
        type: String
    }

}, { timestamps: true })

applicationSchema.index({ shift: 1, worker: 1 }, { unique: true });

const Application = mongoose.model('Application', applicationSchema)

module.exports = Application