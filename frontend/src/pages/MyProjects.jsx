"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { BACKEND_URL } from "../config"
import { Plus, Edit3, Trash2, Save, X, FolderOpen, Search } from "lucide-react"

export default function ProjectManager() {
  const [projects, setProjects] = useState([])
  const [newProject, setNewProject] = useState({ name: "", description: "" })
  const [editProject, setEditProject] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const navigate = useNavigate()

  const token = localStorage.getItem("token")
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  }

  // Filter projects based on search term
  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // GET all projects
  const fetchProjects = async () => {
    setIsLoading(true)
    try {
      const res = await axios.get(`${BACKEND_URL}/api/v1/projects`, { headers })
      setProjects(res.data)
    } catch (err) {
      console.error("Error fetching projects:", err.response?.data || err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  // POST new project
  const handleCreate = async () => {
    if (!newProject.name.trim()) return
    setIsLoading(true)
    try {
      const res = await axios.post(`${BACKEND_URL}/api/v1/projects`, newProject, { headers })
      setProjects([...projects, res.data])
      setNewProject({ name: "", description: "" })
      setShowCreateModal(false)
    } catch (err) {
      console.error("Error creating project:", err.response?.data || err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // PUT (update) a project
  const handleUpdate = async () => {
    if (!editProject.name.trim()) return
    setIsLoading(true)
    try {
      const res = await axios.put(
        `${BACKEND_URL}/api/v1/projects/${editProject._id}`,
        {
          name: editProject.name,
          description: editProject.description,
        },
        { headers },
      )
      setProjects(projects.map((p) => (p._id === res.data._id ? res.data : p)))
      setEditProject(null)
      setShowEditModal(false)
    } catch (err) {
      console.error("Error updating project:", err.response?.data || err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // DELETE a project
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      setIsLoading(true)
      try {
        await axios.delete(`${BACKEND_URL}/api/v1/projects/${id}`, { headers })
        setProjects(projects.filter((p) => p._id !== id))
      } catch (err) {
        console.error("Error deleting project:", err.response?.data || err.message)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleEditClick = (project) => {
    setEditProject({ ...project })
    setShowEditModal(true)
  }

  const handleProjectClick = (projectId) => {
    navigate(`/projects/${projectId}`)
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6" >
      <div className="max-w-7xl mx-auto mt-[100px]">
        {/* Top Controls */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Project
          </button>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none w-80"
            />
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <FolderOpen className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchTerm ? "No projects found" : "No projects yet"}
            </h3>
            <p className="text-gray-400 mb-8">
              {searchTerm ? "Try adjusting your search terms" : "Create your first project to get started"}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Project
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProjects.map((project) => (
              <div
                key={project._id}
                className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:bg-gray-750 hover:border-gray-600 transition-all cursor-pointer group"
                onClick={() => handleProjectClick(project._id)}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
                    {project.name}
                  </h3>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditClick(project)
                      }}
                      className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(project._id)
                      }}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-gray-400 text-sm line-clamp-3">{project.description || "No description provided"}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl max-w-md w-full p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Create New Project</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setNewProject({ name: "", description: "" })
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Project Name</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter project name"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your project"
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setNewProject({ name: "", description: "" })
                }}
                className="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={isLoading || !newProject.name.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isLoading ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl max-w-md w-full p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">Edit Project</h2>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditProject(null)
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Project Name</label>
                <input
                  type="text"
                  value={editProject?.name || ""}
                  onChange={(e) => setEditProject((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter project name"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={editProject?.description || ""}
                  onChange={(e) => setEditProject((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your project"
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditProject(null)
                }}
                className="px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={isLoading || !editProject?.name?.trim()}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isLoading ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
