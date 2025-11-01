const mongoose = require('mongoose');

const coursesSchema = new mongoose.Schema({
  courseName: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true,
    minLength: [3, 'Course name must be at least 3 characters long'],
    maxLength: [100, 'Course name must be less than 100 characters long']
  },
  courseCode: {
    type: String,
    required: [true, 'Course code is required'],
    unique: true,
    trim: true,
    minLength: [3, 'Course code must be at least 3 characters long'],
    maxLength: [10, 'Course code must be less than 10 characters long']
  },
  credits: {
    type: Number,
    required: [true, 'Credits are required'],
    min: [1, 'Credits must be at least 1'],
    max: [10, 'Credits must be less than or equal to 10']
  }
}, {
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.model('courses', coursesSchema);