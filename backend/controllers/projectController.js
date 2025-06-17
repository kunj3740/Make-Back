const Project = require('../models/Project')
const User = require('../models/User')

// Create a project
exports.createProject = async (req, res) => {
  const { name, description } = req.body
  try {
    const project = new Project({ name, description, owner: req.userId })
    await project.save()

    // Add project to user's list
    await User.findByIdAndUpdate(req.userId, {
      $push: { projects: project._id }
    })

    res.status(201).json(project)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Get all projects for a user
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.userId })
    res.status(200).json(projects)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}
// Get projects by projectId

exports.getProjectsById = async (req, res) => {
  const { id } = req.params;
  try {
    const projects = await Project.findById(id);
    res.status(200).json(projects)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}
// Update a project
exports.updateProject = async (req, res) => {
  const { id } = req.params
  const { name, description } = req.body
  try {
    const project = await Project.findOneAndUpdate(
      { _id: id, owner: req.userId },
      { name, description },
      { new: true }
    )

    if (!project) return res.status(404).json({ message: 'Project not found' })

    res.status(200).json(project)
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Delete a project
exports.deleteProject = async (req, res) => {
  const { id } = req.params
  try {
    const project = await Project.findOneAndDelete({ _id: id, owner: req.userId })
    if (!project) return res.status(404).json({ message: 'Project not found' })

    await User.findByIdAndUpdate(req.userId, {
      $pull: { projects: id }
    })

    res.status(200).json({ message: 'Project deleted' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}
