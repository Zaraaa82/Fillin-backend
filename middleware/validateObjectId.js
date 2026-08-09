const mongoose = require('mongoose')
function validateObjectId(req,res,next){
if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "The provided ID must be a valid MongoDB ObjectId." });
    }
next()
}

module.exports = validateObjectId