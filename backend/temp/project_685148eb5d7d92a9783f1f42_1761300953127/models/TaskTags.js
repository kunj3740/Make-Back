const mongoose = require('mongoose');

const taskTagsSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tasks',
    required: [true, 'Task ID is required']
  },
  tagId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tags',
    required: [true, 'Tag ID is required']
  }
}, {
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.model('TaskTags', taskTagsSchema);