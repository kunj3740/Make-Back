const mongoose = require('mongoose');

const facultiesSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxLength: [100, 'First name cannot exceed 100 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxLength: [100, 'Last name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
  },
  employeeNumber: {
    type: String,
    required: [true, 'Employee number is required'],
    unique: true,
    trim: true,
    maxLength: [50, 'Employee number cannot exceed 50 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.model('faculties', facultiesSchema);