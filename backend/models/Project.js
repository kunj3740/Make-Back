const mongoose = require('mongoose')

const projectSchema = new mongoose.Schema({
  name: { type: String  },
  description: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
})

module.exports = mongoose.model('Project', projectSchema)
