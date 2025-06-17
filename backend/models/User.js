const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: String,
  username: { type: String, unique: true },
  password: String,
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }]
})

module.exports = mongoose.model('User', userSchema)
