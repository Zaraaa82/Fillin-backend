const mongoose = require("mongoose");

const ObjectId = mongoose.Schema.Types.ObjectId;

const workerProfileSchema = new mongoose.Schema(
  {
    owner: {
      type: ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
      maxLength: 100
    },

    imageURL:{
        type: String,
        trim: true,
        required: true
    },

    bio: {
        type: String,
        trim: true,
        default: ''
    },

    skills: {
        type: [ObjectId],
        ref: 'Skill', 

        validate: {
            validator: (skills) => skills.length >= 1,
            message: 'At least one skill is required.'
        }
        
    },

    location: {
        type: String,
        required: true,
        trim: true
    },
    
    lifetimeMissedCount: {
        type: Number,
        default: 0,
        min: 0
    },

    strikeCount: {
        type: Number,
        default: 0,
        min: 0,
        max: 2
    }

  },
  { timestamps: true },
);

const WorkerProfile = mongoose.model("WorkerProfile", workerProfileSchema);

module.exports = WorkerProfile;
