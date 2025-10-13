const mongoose = require('mongoose');

const tasksSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Users', 
    required: [true, 'User ID is required'] 
  },
  title: { 
    type: String, 
    required: [true, 'Title is required'], 
    trim: true, 
    maxLength: [100, 'Title cannot exceed 100 characters'] 
  },
  description: { 
    type: String, 
    trim: true 
  },
  dueDate: { 
    type: Date, 
    required: [true, 'Due date is required'] 
  },
  completed: { 
    type: Boolean, 
    default: false 
  }
}, {
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.model('Tasks', tasksSchema);