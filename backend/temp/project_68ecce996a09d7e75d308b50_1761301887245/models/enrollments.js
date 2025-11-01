const mongoose = require('mongoose');

const enrollmentsSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'students',
    required: [true, 'Student ID is required']
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'courses',
    required: [true, 'Course ID is required']
  },
  enrollmentDate: {
    type: Date,
    required: [true, 'Enrollment date is required']
  }
}, {
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.model('enrollments', enrollmentsSchema);