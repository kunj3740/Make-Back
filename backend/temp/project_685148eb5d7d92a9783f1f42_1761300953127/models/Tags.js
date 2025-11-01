const mongoose = require('mongoose');

const tagsSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: [true, 'Tag name is required'],
    trim: true,
    minLength: [1, 'Tag name must be at least 1 character long'],
    maxLength: [100, 'Tag name must be less than 100 characters long']
  }
}, {
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.model('Tags', tagsSchema);