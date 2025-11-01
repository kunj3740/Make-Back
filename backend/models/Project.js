const mongoose = require('mongoose')

const projectSchema = new mongoose.Schema({
  name: { type: String  },
  description: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  githubRepoLink: { type: String },
  renderServiceId: { type: String },
  deploymentUrl: { type: String }
})

module.exports = mongoose.model('Project', projectSchema)
