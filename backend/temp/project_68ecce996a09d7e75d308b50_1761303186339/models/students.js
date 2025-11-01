const mongoose = require('mongoose');

const studentsSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minLength: [2, 'First name must be at least 2 characters long'],
    maxLength: [50, 'First name must be at most 50 characters long']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    minLength: [2, 'Last name must be at least 2 characters long'],
    maxLength: [50, 'Last name must be at most 50 characters long']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
  },
  enrollmentNumber: {
    type: String,
    required: [true, 'Enrollment number is required'],
    unique: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.model('students', studentsSchema);