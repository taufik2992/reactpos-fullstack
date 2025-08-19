const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Shift = require('../models/Shift');
const moment = require('moment');
const { validationResult } = require('express-validator');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '8h'
  });
};

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check if user already has an active shift today
    const today = moment().format('YYYY-MM-DD');
    let activeShift = await Shift.findOne({
      userId: user._id,
      date: today,
      status: 'active'
    });

    // If no active shift, create new one (clock in)
    if (!activeShift) {
      activeShift = new Shift({
        userId: user._id,
        clockIn: new Date(),
        date: today,
        status: 'active'
      });
      await activeShift.save();
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: user.toJSON(),
      shift: {
        clockIn: activeShift.clockIn,
        hoursWorked: moment().diff(moment(activeShift.clockIn), 'hours', true),
        maxHours: 8
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

const logout = async (req, res) => {
  try {
    const today = moment().format('YYYY-MM-DD');
    const activeShift = await Shift.findOne({
      userId: req.user._id,
      date: today,
      status: 'active'
    });

    if (activeShift) {
      activeShift.clockOut = new Date();
      activeShift.status = 'completed';
      await activeShift.save();
    }

    res.status(200).json({
      success: true,
      message: 'Logout successful',
      shift: activeShift ? {
        clockIn: activeShift.clockIn,
        clockOut: activeShift.clockOut,
        duration: activeShift.duration,
        durationHours: activeShift.durationHours
      } : null
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during logout'
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Get current shift info
    const today = moment().format('YYYY-MM-DD');
    const activeShift = await Shift.findOne({
      userId: req.user._id,
      date: today,
      status: 'active'
    });

    let shiftInfo = null;
    if (activeShift) {
      const hoursWorked = moment().diff(moment(activeShift.clockIn), 'hours', true);
      shiftInfo = {
        clockIn: activeShift.clockIn,
        hoursWorked: Math.round(hoursWorked * 100) / 100,
        remainingHours: Math.round((8 - hoursWorked) * 100) / 100,
        maxHours: 8
      };
    }

    res.status(200).json({
      success: true,
      user,
      shift: shiftInfo
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  login,
  logout,
  getProfile
};