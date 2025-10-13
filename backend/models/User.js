const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: String,
  username: { type: String, unique: true },
  password: String,
  githubUsername: { type: String, unique: true, sparse: true },
  githubAccessToken: { type: String }, // Store encrypted access token
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }]
})

module.exports = mongoose.model('User', userSchema)