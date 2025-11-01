const mongoose = require('mongoose');

const facultyCoursesSchema = new mongoose.Schema({
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'faculties',
    required: [true, 'Faculty ID is required']
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'courses',
    required: [true, 'Course ID is required']
  },
  assignedDate: {
    type: Date,
    required: [true, 'Assigned date is required']
  }
}, {
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.model('faculty_courses', facultyCoursesSchema);