const mongoose = require('mongoose')

const frontendPageSchema = new mongoose.Schema({
  pageName: { type: String, required: true },
  code: { type: String, required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
}, { timestamps: true })

// Ensure unique page names within the same project
frontendPageSchema.index({ project: 1, pageName: 1 }, { unique: true })

module.exports = mongoose.model('FrontendPage', frontendPageSchema)
