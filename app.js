// imports
const express = require("express") //importing express package
const app = express() // creates a express application
const dotenv = require("dotenv").config() //this allows me to use my .env values in this file
const morgan = require('morgan')
const cors = require('cors')
const refreshShiftStatuses = require('./middleware/refreshShiftStatuses');

// Routes Import
const authRoutes = require('./routes/auth.routes')
const skillRoutes = require('./routes/skill.routes')


const shiftRoutes = require('./routes/shift.routes');


// Middleware
app.use(
    cors({
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
    })
);
app.use(express.json())
app.use(morgan('dev'))

// Routes
app.use('/auth',authRoutes)
app.use('/skills', skillRoutes)


app.use('/shifts', refreshShiftStatuses, shiftRoutes);




module.exports = app