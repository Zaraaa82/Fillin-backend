const {updateShiftStatuses} = require('../services/shiftService');

async function refreshShiftStatuses(req, res, next){
    await updateShiftStatuses();
    next();
}

module.exports = refreshShiftStatuses;