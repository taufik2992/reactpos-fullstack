const mongoose = require('mongoose');
const moment = require('moment');

const shiftSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  clockIn: {
    type: Date,
    required: [true, 'Clock in time is required']
  },
  clockOut: {
    type: Date
  },
  duration: {
    type: Number, // Duration in minutes
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'overtime'],
    default: 'active'
  },
  date: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Calculate duration when clock out
shiftSchema.pre('save', function(next) {
  if (this.clockOut && this.clockIn) {
    this.duration = moment(this.clockOut).diff(moment(this.clockIn), 'minutes');
    
    // Check if overtime (more than 8 hours = 480 minutes)
    if (this.duration > 480) {
      this.status = 'overtime';
    } else if (this.clockOut) {
      this.status = 'completed';
    }
  }
  next();
});

// Virtual for duration in hours
shiftSchema.virtual('durationHours').get(function() {
  return Math.round((this.duration / 60) * 100) / 100;
});

shiftSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Shift', shiftSchema);