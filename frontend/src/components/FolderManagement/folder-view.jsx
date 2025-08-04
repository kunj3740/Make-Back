"use client"

import { useState } from "react"
import { Plus, Database } from "lucide-react"
import axios from "axios"
import { BACKEND_URL } from "../../config"
import FolderCard from "./folder-card"
import CreateFolderForm from "./create-folder-form"
import ApiSuggestions from "./api-suggestions"

const FolderView = ({ folders, setFolders, onFolderClick, projectId, userId, authToken }) => {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newFolder, setNewFolder] = useState({ name: "", description: "", commonPrompt: "" })
  const [error, setError] = useState("")
  const [editingFolder, setEditingFolder] = useState(null)

  // API Suggestions states
  const [showApiSuggestions, setShowApiSuggestions] = useState(false)
  const [apiSuggestions, setApiSuggestions] = useState([])
  const [createdFolder, setCreatedFolder] = useState(null)
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  const createFolder = async () => {
    if (!newFolder.name.trim()) {
      setError("Folder name is required")
      return
    }
    setError("")
    try {
      const res = await axios.post(
        `${BACKEND_URL}/api/v1/folders/`,
        {
          name: newFolder.name,
          description: newFolder.description,
          commonPrompt: newFolder.commonPrompt,
          projectId,
          userId,
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        },
      )

      const folder = res.data.data
      setFolders((prev) => [...prev, folder])
      setCreatedFolder(folder)

      // Get API suggestions after folder creation
      await getApiSuggestions(folder)

      setNewFolder({ name: "", description: "", commonPrompt: "" })
      setShowCreateForm(false)
    } catch (err) {
      setError("Failed to create folder")
      console.error("Error creating folder:", err)
    }
  }

  const getApiSuggestions = async (folder) => {
    setLoadingSuggestions(true)
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/ai/generate/apis/suggestion`,
        {
          folderName: folder.name,
          folderDescription: folder.description,
          projectId: projectId,
          commonPrompt: folder.commonPrompt || "",
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        },
      )

      if (response.data.success) {
        setApiSuggestions(response.data.suggestions)
        setShowApiSuggestions(true)
      }
    } catch (err) {
      console.error("Error getting API suggestions:", err)
      setError("Failed to get API suggestions")
    } finally {
      setLoadingSuggestions(false)
    }
  }

  const updateFolder = async (folderId, updatedData) => {
    setError("")
    try {
      await axios.put(`${BACKEND_URL}/api/v1/folders/${folderId}`, updatedData, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      setFolders((prev) => prev.map((f) => (f._id === folderId ? { ...f, ...updatedData } : f)))
      setEditingFolder(null)
    } catch (err) {
      setError("Failed to update folder")
      console.error("Error updating folder:", err)
    }
  }

  const deleteFolder = async (folderId) => {
    const confirmed = window.confirm("Are you sure you want to delete this folder and its APIs?")
    if (!confirmed) return
    setError("")
    try {
      await axios.delete(`${BACKEND_URL}/api/v1/folders/${folderId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      setFolders((prev) => prev.filter((f) => f._id !== folderId))
    } catch (err) {
      setError("Failed to delete folder")
      console.error("Error deleting folder:", err)
    }
  }

  const handleApiSuggestionsComplete = (updatedFolder) => {
    // Update the folder in the folders list with new APIs
    setFolders((prev) => prev.map((f) => (f._id === updatedFolder._id ? updatedFolder : f)))
    setShowApiSuggestions(false)
    setApiSuggestions([])
    setCreatedFolder(null)
  }

  return (
    <>
      {/* Create Folder Button */}
      {!showCreateForm && !showApiSuggestions && (
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => setShowCreateForm(true)}
            className="group relative px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-medium transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/25 text-sm"
          >
            <div className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>New Folder</span>
            </div>
          </button>
        </div>
      )}

      {/* Create Folder Form */}
      {showCreateForm && (
        <CreateFolderForm
          newFolder={newFolder}
          setNewFolder={setNewFolder}
          onSubmit={createFolder}
          onCancel={() => {
            setShowCreateForm(false)
            setNewFolder({ name: "", description: "", commonPrompt: "" })
            setError("")
          }}
          error={error}
        />
      )}

      {/* API Suggestions */}
      {showApiSuggestions && createdFolder && (
        <ApiSuggestions
          folder={createdFolder}
          suggestions={apiSuggestions}
          onComplete={handleApiSuggestionsComplete}
          onSkip={() => {
            setShowApiSuggestions(false)
            setApiSuggestions([])
            setCreatedFolder(null)
          }}
          authToken={authToken}
          projectId={projectId}
          loading={loadingSuggestions}
        />
      )}

      {/* Folders Grid */}
      {!showCreateForm && !showApiSuggestions && (
        <>
          {folders.length === 0 ? (
            <div className="text-center py-16">
              <div className="relative mx-auto w-24 h-24 mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full blur opacity-20"></div>
                <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-full p-6 border border-slate-700/50">
                  <Database className="h-12 w-12 text-slate-400 mx-auto" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">No folders found</h3>
              <p className="text-slate-400 mb-6 max-w-md mx-auto">
                Create your first folder to organize your APIs and start building with AI assistance
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-medium transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/25"
              >
                Create Your First Folder
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {folders.map((folder) => (
                <FolderCard
                  key={folder._id}
                  folder={folder}
                  onEdit={setEditingFolder}
                  onDelete={deleteFolder}
                  onUpdate={updateFolder}
                  onClick={onFolderClick}
                  isEditing={editingFolder === folder._id}
                />
              ))}
            </div>
          )}
        </>
      )}
    </>
  )
}

export default FolderView
