import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import toast from "react-hot-toast"
import { BACKEND_URL } from "../config"
import { Plus, Edit3, Trash2, Save, X, FolderOpen, Search, Calendar, User } from "lucide-react"

// Skeleton Component
const ProjectSkeleton = () => (
  <div className="backdrop-blur-xl bg-slate-800/40 rounded-2xl border border-slate-700/50 p-6 shadow-xl animate-pulse">
    <div className="flex justify-between items-start mb-6">
      <div className="flex-1 min-w-0">
        <div className="h-6 bg-slate-700/50 rounded-lg w-3/4 mb-2"></div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-slate-700/50 rounded"></div>
          <div className="h-4 bg-slate-700/50 rounded w-24"></div>
        </div>
      </div>
    </div>

    <div className="space-y-2 mb-4">
      <div className="h-4 bg-slate-700/50 rounded w-full"></div>
      <div className="h-4 bg-slate-700/50 rounded w-4/5"></div>
      <div className="h-4 bg-slate-700/50 rounded w-3/5"></div>
    </div>

    <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-slate-700/50 rounded"></div>
        <div className="h-3 bg-slate-700/50 rounded w-16"></div>
      </div>
      <div className="w-2 h-2 bg-slate-700/50 rounded-full"></div>
    </div>
  </div>
)

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
      toast.error(err.response?.data?.message || "Error fetching projects")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if ( !token ){
      navigate("/signin")
    }
    fetchProjects()
  }, [])

  // POST new project
  const handleCreate = async () => {
    if (!newProject.name.trim() || !newProject.description.trim() ) return
    setIsLoading(true)
    try {
      const res = await axios.post(`${BACKEND_URL}/api/v1/projects`, newProject, { headers })
      setProjects([...projects, res.data])
      setNewProject({ name: "", description: "" })
      setShowCreateModal(false)
    } catch (err) {
      toast.error(err.response?.data?.message || "Error creating project")
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
      toast.error(err.response?.data?.message || "Error updating project")
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
        toast.error(err.response?.data?.message || "Error deleting project")
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto mt-[100px]">
        {/* Header Section */}
        <div className="mb-12">
          <div className="backdrop-blur-xl bg-slate-800/40 rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                {/* Search Bar */}
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-400 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-3.5 bg-slate-800/60 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none w-full sm:w-80 backdrop-blur-sm transition-all duration-200"
                  />
                </div>

                {/* New Project Button */}
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3.5 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 transform hover:scale-105 whitespace-nowrap"
                >
                  <Plus className="w-5 h-5" />
                  New Project
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <ProjectSkeleton key={index} />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20">
            <div className="backdrop-blur-xl bg-slate-800/30 rounded-3xl border border-slate-700/50 p-12 max-w-md mx-auto shadow-2xl">
              <div className="w-28 h-28 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                <FolderOpen className="w-14 h-14 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                {searchTerm ? "No projects found" : "No projects yet"}
              </h3>
              <p className="text-slate-400 mb-8 text-lg leading-relaxed">
                {searchTerm ? "Try adjusting your search terms" : "Create your first project to get started on your journey"}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-8 py-4 rounded-xl font-semibold inline-flex items-center gap-3 transition-all duration-200 shadow-lg hover:shadow-emerald-500/25 transform hover:scale-105"
                >
                  <Plus className="w-5 h-5" />
                  Create Project
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProjects.map((project, index) => (
              <div
                key={project._id}
                className="group relative backdrop-blur-xl bg-slate-800/40 rounded-2xl border border-slate-700/50 p-6 hover:bg-slate-800/60 hover:border-slate-600/50 transition-all duration-300 cursor-pointer shadow-xl hover:shadow-2xl transform hover:scale-105"
                onClick={() => handleProjectClick(project._id)}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                {/* Gradient Border Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-emerald-600/20 rounded-2xl opacity-0  transition-opacity duration-300 -z-10"></div>
                
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors truncate mb-2">
                      {project.name}
                    </h3>
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>Created recently</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditClick(project)
                      }}
                      className="p-2.5 text-slate-400 hover:text-blue-400 hover:bg-slate-700/50 rounded-lg transition-all duration-200 backdrop-blur-sm"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(project._id)
                      }}
                      className="p-2.5 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded-lg transition-all duration-200 backdrop-blur-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-slate-400 text-sm leading-relaxed line-clamp-3 mb-4">
                  {project.description || "No description provided"}
                </p>

                {/* Project Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                  <div className="flex items-center gap-2 text-slate-500 text-xs">
                    <User className="w-3 h-3" />
                    <span>Personal</span>
                  </div>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="backdrop-blur-xl bg-slate-800/90 rounded-2xl max-w-md w-full p-8 border border-slate-700/50 shadow-2xl transform transition-all duration-300 scale-100">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Create New Project</h2>
                <p className="text-slate-400">Start your next big idea</p>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setNewProject({ name: "", description: "" })
                }}
                className="text-slate-400 hover:text-white hover:bg-slate-700/50 p-2 rounded-lg transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">Project Name</label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter project name"
                  className="w-full px-4 py-3.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none backdrop-blur-sm transition-all duration-200"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">Description</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your project"
                  rows={4}
                  required
                  className="w-full px-4 py-3.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none resize-none backdrop-blur-sm transition-all duration-200"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setNewProject({ name: "", description: "" })
                }}
                className="px-6 py-3 text-slate-300 hover:bg-slate-700/50 rounded-xl font-medium transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={isLoading || !newProject.name.trim() || !newProject.description.trim()}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-slate-600 disabled:to-slate-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-blue-500/25"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="backdrop-blur-xl bg-slate-800/90 rounded-2xl max-w-md w-full p-8 border border-slate-700/50 shadow-2xl transform transition-all duration-300 scale-100">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Edit Project</h2>
                <p className="text-slate-400">Update your project details</p>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditProject(null)
                }}
                className="text-slate-400 hover:text-white hover:bg-slate-700/50 p-2 rounded-lg transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">Project Name</label>
                <input
                  type="text"
                  value={editProject?.name || ""}
                  onChange={(e) => setEditProject((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter project name"
                  className="w-full px-4 py-3.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none backdrop-blur-sm transition-all duration-200"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">Description</label>
                <textarea
                  value={editProject?.description || ""}
                  onChange={(e) => setEditProject((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your project"
                  rows={4}
                  className="w-full px-4 py-3.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none resize-none backdrop-blur-sm transition-all duration-200"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditProject(null)
                }}
                className="px-6 py-3 text-slate-300 hover:bg-slate-700/50 rounded-xl font-medium transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={isLoading || !editProject?.name?.trim()}
                className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 disabled:from-slate-600 disabled:to-slate-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-orange-500/25"
              >
                <Save className="w-4 h-4" />
                {isLoading ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  )
}