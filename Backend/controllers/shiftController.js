const Shift = require('../models/Shift');
const moment = require('moment');

const getCurrentShift = async (req, res) => {
  try {
    const today = moment().format('YYYY-MM-DD');
    const shift = await Shift.findOne({
      userId: req.user._id,
      date: today
    }).populate('userId', 'nama email role');

    if (!shift) {
      return res.status(404).json({
        success: false,
        message: 'No active shift found for today'
      });
    }

    // Calculate current hours worked if shift is active
    let currentHours = 0;
    if (shift.status === 'active') {
      currentHours = moment().diff(moment(shift.clockIn), 'hours', true);
    }

    res.status(200).json({
      success: true,
      shift: {
        ...shift.toJSON(),
        currentHours: Math.round(currentHours * 100) / 100,
        remainingHours: shift.status === 'active' ? Math.round((8 - currentHours) * 100) / 100 : 0
      }
    });
  } catch (error) {
    console.error('Get current shift error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getAllShifts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      userId, 
      status,
      startDate,
      endDate
    } = req.query;
    
    const query = {};
    
    // If not admin, only show own shifts
    if (req.user.role !== 'admin') {
      query.userId = req.user._id;
    } else if (userId) {
      query.userId = userId;
    }
    
    if (status) query.status = status;
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    const shifts = await Shift.find(query)
      .populate('userId', 'nama email role')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Shift.countDocuments(query);

    res.status(200).json({
      success: true,
      shifts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all shifts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const clockOut = async (req, res) => {
  try {
    const today = moment().format('YYYY-MM-DD');
    const activeShift = await Shift.findOne({
      userId: req.user._id,
      date: today,
      status: 'active'
    });

    if (!activeShift) {
      return res.status(400).json({
        success: false,
        message: 'No active shift found'
      });
    }

    activeShift.clockOut = new Date();
    activeShift.status = 'completed';
    await activeShift.save();

    res.status(200).json({
      success: true,
      message: 'Clocked out successfully',
      shift: {
        clockIn: activeShift.clockIn,
        clockOut: activeShift.clockOut,
        duration: activeShift.duration,
        durationHours: activeShift.durationHours,
        status: activeShift.status
      }
    });
  } catch (error) {
    console.error('Clock out error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getShiftStats = async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;
    
    const matchStage = {};
    
    // If not admin, only show own stats
    if (req.user.role !== 'admin') {
      matchStage.userId = req.user._id;
    } else if (userId) {
      matchStage.userId = mongoose.Types.ObjectId(userId);
    }
    
    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = startDate;
      if (endDate) matchStage.date.$lte = endDate;
    }

    const stats = await Shift.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalShifts: { $sum: 1 },
          totalHours: { $sum: { $divide: ['$duration', 60] } },
          averageHours: { $avg: { $divide: ['$duration', 60] } },
          overtimeShifts: {
            $sum: {
              $cond: [{ $eq: ['$status', 'overtime'] }, 1, 0]
            }
          }
        }
      }
    ]);

    const statusStats = await Shift.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalHours: { $sum: { $divide: ['$duration', 60] } }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      stats: stats[0] || {
        totalShifts: 0,
        totalHours: 0,
        averageHours: 0,
        overtimeShifts: 0
      },
      statusBreakdown: statusStats
    });
  } catch (error) {
    console.error('Get shift stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getCurrentShift,
  getAllShifts,
  clockOut,
  getShiftStats
};