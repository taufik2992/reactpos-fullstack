const Shift = require('../models/Shift');
const moment = require('moment');

const checkShiftTime = async (req, res, next) => {
  try {
    if (req.user) {
      const today = moment().format('YYYY-MM-DD');
      const activeShift = await Shift.findOne({
        userId: req.user._id,
        date: today,
        status: 'active'
      });

      if (activeShift) {
        const now = moment();
        const clockIn = moment(activeShift.clockIn);
        const hoursWorked = now.diff(clockIn, 'hours', true);

        // If worked more than 8 hours, auto logout
        if (hoursWorked >= 8) {
          // Clock out automatically
          activeShift.clockOut = now.toDate();
          activeShift.status = 'completed';
          await activeShift.save();

          return res.status(401).json({
            success: false,
            message: 'Shift completed. 8 hours work limit reached. Please login again for new shift.',
            shiftCompleted: true,
            hoursWorked: Math.round(hoursWorked * 100) / 100
          });
        }

        // Add shift info to request
        req.currentShift = {
          ...activeShift.toObject(),
          hoursWorked: Math.round(hoursWorked * 100) / 100,
          remainingHours: Math.round((8 - hoursWorked) * 100) / 100
        };
      }
    }
    next();
  } catch (error) {
    console.error('Shift tracking error:', error);
    next();
  }
};

module.exports = { checkShiftTime };