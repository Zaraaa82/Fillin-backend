const bcrypt = require("bcrypt");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const validator = require('validator');
const { reactivateWorkerIfSuspensionExpired } = require('../services/workerSuspensionService');

async function signUp(req, res) {
  try {
    const { username, password, email, phoneNumber, role } = req.body;

    // Validation
    if (!username || !password) return res.status(400).json({message: "Username and password are required.",});
    if (!email) return res.status(400).json({message: "Email is required."});
    if (!phoneNumber) return res.status(400).json({message: 'Phone number is required.'});
    if (!role) return res.status(400).json({message: 'Role is required'});

    if (password.length < 6) return res.status(400).json({message: 'Password must be at least 6 characters'});

    if(!validator.isEmail(email)) return res.status(400).json({message: 'Please enter a valid email address.'});
    if(!validator.isMobilePhone(phoneNumber)) return res.status(400).json({message: 'Please enter a valid phone number.'});
    if(role !== 'worker' && role !== 'business') return res.status(400).json({message: 'Role must be either worker or business.'})

    const user = await User.create({
      username,
      hashedPassword: await bcrypt.hash(password, 12),
      email,
      phoneNumber,
      role
    });

    const { _id, createdAt, status, isProfileComplete, suspendedUntil,   updatedAt } = user;

    res
      .status(201)
      .json({  
        _id, 
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        status,
        isProfileComplete,
        suspendedUntil,
        createdAt,
        updatedAt 
      });
  } catch (err) {
    console.log(err);
    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: err.message,
      });
    }
    if (err.code === 11000) {
      return res.status(409).json({
        message: "Username, email, or phone number already exists.",
      });
    }

    console.log(err);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

async function signIn(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required.",
      });
    }
    const user = await User.findOne({ username:username.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }
    
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.hashedPassword,
    );
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid credentials." });
    }
    
    const {email, phoneNumber,role, status, isProfileComplete, suspendedUntil} = user
    // Construct the payload
    const payload = { username: user.username, _id: user._id };


    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    return res.status(200).json({
      accessToken,
      user: {
        _id: user._id,
        username: user.username,
        email,
        phoneNumber,
        role,
        status,
        isProfileComplete,
        suspendedUntil,
      },
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

async function verifyUser(req, res) {
  try {
    const user = await reactivateWorkerIfSuspensionExpired(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }
    const {email, phoneNumber,role, status, isProfileComplete, suspendedUntil} = user

    return res.status(200).json({
        _id: user._id,
        username: user.username,
        email,
        phoneNumber,
        role,
        status,
        isProfileComplete,
        suspendedUntil,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
}

module.exports = {
  signUp,
  signIn,
  verifyUser,
};
