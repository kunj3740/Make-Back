
import { useState, useEffect } from "react"
import { ArrowLeft, Search, Sparkles, FileCode, Database, Globe, Terminal } from "lucide-react"
import axios from "axios"
import { BACKEND_URL } from "../config"

// Import components
import FolderView from "./FolderManagement/folder-view"
import ApiView from "./FolderManagement/api-view"
import ApiDetailView from "./FolderManagement/api-detail-view"
import AIGeneratorModal from "./modals/ai-generator-modal"
import AIUpdateModal from "./modals/ai-update-modal"
import CommonPromptModal from "./modals/common-prompt-modal"
import AIPreviewModal from "./modals/ai-preview-modal"
import ErrorAlert from "./ui/error-alert"
import LoadingSpinner from "./ui/loading-spinner"

const FolderManagement = ({
  projectId = "684e85c2e4057008b9532c30",
  userId = "684d4af18371719a6892c8ed",
  folders,
  setFolders,
}) => {
  // State management
  const [selectedFolder, setSelectedFolder] = useState(null)
  const [currentView, setCurrentView] = useState("folders") // 'folders', 'apis', 'api-detail'
  const [selectedApi, setSelectedApi] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [authToken, setAuthToken] = useState("")

  // Modal states
  const [showAIGenerator, setShowAIGenerator] = useState(false)
  const [showAIUpdateGenerator, setShowAIUpdateGenerator] = useState(false)
  const [showCommonPromptModal, setShowCommonPromptModal] = useState(false)
  const [showAIPreview, setShowAIPreview] = useState(false)
  const [showAIUpdatePreview, setShowAIUpdatePreview] = useState(false)

  // AI Generation states
  const [aiPrompt, setAiPrompt] = useState({ name: "", description: "" })
  const [aiUpdatePrompt, setAiUpdatePrompt] = useState({ name: "", description: "" })
  const [generatedAPI, setGeneratedAPI] = useState(null)
  const [generatedUpdateAPI, setGeneratedUpdateAPI] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingUpdate, setIsGeneratingUpdate] = useState(false)
  const [aiError, setAiError] = useState("")
  const [aiUpdateError, setAiUpdateError] = useState("")

  // Common Prompt states
  const [commonPrompt, setCommonPrompt] = useState("")
  const [isUpdatingCommonPrompt, setIsUpdatingCommonPrompt] = useState(false)
  const [commonPromptError, setCommonPromptError] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      setAuthToken(token)
    }
  }, [])

  // Navigation handlers
  const handleFolderClick = (folder) => {
    setSelectedFolder(folder)
    setCurrentView("apis")
    if (!folder.apis || folder.apis.length === 0) {
      fetchFolderDetails(folder._id)
    }
  }

  const handleApiClick = (api) => {
    setSelectedApi(api)
    setCurrentView("api-detail")
    fetchApiDetails(selectedFolder._id, api._id)
  }

  const handleBackToFolders = () => {
    setCurrentView("folders")
    setSelectedFolder(null)
    setSelectedApi(null)
  }

  const handleBackToApis = () => {
    setCurrentView("apis")
    setSelectedApi(null)
  }

  // API calls
  const fetchFolderDetails = async (folderId) => {
    setLoading(true)
    setError("")
    try {
      const res = await axios.get(`${BACKEND_URL}/api/v1/folders/${folderId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      setSelectedFolder(res.data.data)
    } catch (err) {
      setError("Failed to fetch folder details")
      console.error("Error fetching folder details:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchApiDetails = async (folderId, apiId) => {
    setLoading(true)
    setError("")
    try {
      const res = await axios.get(`${BACKEND_URL}/api/v1/folders/${folderId}/api/${apiId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      setSelectedApi(res.data.data)
    } catch (err) {
      setError("Failed to fetch API details")
      console.error("Error fetching API details:", err)
    } finally {
      setLoading(false)
    }
  }

  // AI Generation handlers
  const handleGenerateAPI = async () => {
    if (!aiPrompt.name.trim()) {
      setAiError("Please provide a name for the API")
      return
    }
    setIsGenerating(true)
    setAiError("")
    try {
      const prompt = `Create an API with name: "${aiPrompt.name}"${aiPrompt.description.trim() ? ` and description: "${aiPrompt.description}"` : ""}`
      const response = await axios.post(
        `${BACKEND_URL}/api/ai/generate-api`,
        {
          prompt: prompt,
          projectId,
          folderId: selectedFolder._id,
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        },
      )

      if (response.data.success) {
        setGeneratedAPI(response.data.api)
        setShowAIGenerator(false)
        setShowAIPreview(true)
      } else {
        setAiError("Failed to generate API")
      }
    } catch (error) {
      console.error("AI Generation Error:", error)
      setAiError(error.response?.data?.error || "Failed to generate API")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateUpdateAPI = async () => {
    if (!aiUpdatePrompt.description.trim()) {
      setAiUpdateError("Please provide a description for the update")
      return
    }
    setIsGeneratingUpdate(true)
    setAiUpdateError("")
    try {
      const prompt = `Update the existing API "${selectedApi.name}" with new requirements: ${aiUpdatePrompt.name.trim() ? `name: "${aiUpdatePrompt.name}" and ` : ""}description: "${aiUpdatePrompt.description}". Current API details: ${JSON.stringify(
        {
          name: selectedApi.name,
          method: selectedApi.method,
          endpoint: selectedApi.endpoint,
          description: selectedApi.description,
        },
      )}`
      const response = await axios.post(
        `${BACKEND_URL}/api/ai/generate-api`,
        {
          prompt: prompt,
          projectId,
          folderId: selectedFolder._id,
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        },
      )

      if (response.data.success) {
        setGeneratedUpdateAPI(response.data.api)
        setShowAIUpdateGenerator(false)
        setShowAIUpdatePreview(true)
      } else {
        setAiUpdateError("Failed to generate API update")
      }
    } catch (error) {
      console.error("AI Update Generation Error:", error)
      setAiUpdateError(error.response?.data?.error || "Failed to generate API update")
    } finally {
      setIsGeneratingUpdate(false)
    }
  }

  const handleApplyGeneratedAPI = async () => {
    if (!generatedAPI) return
    setError("")
    try {
      const res = await axios.post(`${BACKEND_URL}/api/v1/folders/${selectedFolder._id}/api`, generatedAPI, {
        headers: { Authorization: `Bearer ${authToken}` },
      })

      setFolders((prev) =>
        prev.map((f) => (f._id === selectedFolder._id ? { ...f, apis: [...(f.apis || []), res.data.data] } : f)),
      )

      setSelectedFolder((prev) => ({
        ...prev,
        apis: [...(prev.apis || []), res.data.data],
      }))

      setGeneratedAPI(null)
      setShowAIPreview(false)
      setAiPrompt({ name: "", description: "" })
      setAiError("")
    } catch (err) {
      setError("Failed to create API")
      console.error("Error creating API:", err)
    }
  }

  const handleApplyGeneratedUpdateAPI = async () => {
    if (!generatedUpdateAPI || !selectedApi) return
    setError("")
    try {
      await updateApi(selectedApi._id, generatedUpdateAPI)
      setGeneratedUpdateAPI(null)
      setShowAIUpdatePreview(false)
      setAiUpdatePrompt({ name: "", description: "" })
      setAiUpdateError("")
    } catch (err) {
      setError("Failed to update API")
      console.error("Error updating API:", err)
    }
  }

  const updateApi = async (apiId, updatedData) => {
    setError("")
    try {
      await axios.put(`${BACKEND_URL}/api/v1/folders/${selectedFolder._id}/api/${apiId}`, updatedData, {
        headers: { Authorization: `Bearer ${authToken}` },
      })

      setFolders((prev) =>
        prev.map((f) =>
          f._id === selectedFolder._id
            ? { ...f, apis: f.apis.map((api) => (api._id === apiId ? { ...api, ...updatedData } : api)) }
            : f,
        ),
      )

      setSelectedFolder((prev) => ({
        ...prev,
        apis: prev.apis.map((api) => (api._id === apiId ? { ...api, ...updatedData } : api)),
      }))

      if (selectedApi && selectedApi._id === apiId) {
        setSelectedApi({ ...selectedApi, ...updatedData })
      }
    } catch (err) {
      setError("Failed to update API")
      console.error("Error updating API:", err)
    }
  }

  const deleteApi = async (apiId) => {
    const confirmed = window.confirm("Are you sure you want to delete this API?")
    if (!confirmed) return
    setError("")
    try {
      await axios.delete(`${BACKEND_URL}/api/v1/folders/${selectedFolder._id}/api/${apiId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })

      setFolders((prev) =>
        prev.map((f) => (f._id === selectedFolder._id ? { ...f, apis: f.apis.filter((api) => api._id !== apiId) } : f)),
      )

      setSelectedFolder((prev) => ({
        ...prev,
        apis: prev.apis.filter((api) => api._id !== apiId),
      }))

      if (selectedApi && selectedApi._id === apiId) {
        setCurrentView("apis")
        setSelectedApi(null)
      }
    } catch (err) {
      setError("Failed to delete API")
      console.error("Error deleting API:", err)
    }
  }

  const handleUpdateCommonPrompt = async () => {
    if (!commonPrompt.trim()) {
      setCommonPromptError("Please enter a common prompt")
      return
    }
    setIsUpdatingCommonPrompt(true)
    setCommonPromptError("")
    try {
      await axios.put(
        `${BACKEND_URL}/api/v1/folders/${selectedFolder._id}`,
        {
          commonPrompt: commonPrompt,
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        },
      )

      setSelectedFolder((prev) => ({
        ...prev,
        commonPrompt: commonPrompt,
      }))

      setFolders((prev) => prev.map((f) => (f._id === selectedFolder._id ? { ...f, commonPrompt: commonPrompt } : f)))
      setShowCommonPromptModal(false)
      setCommonPrompt("")
    } catch (err) {
      setCommonPromptError("Failed to update common prompt")
      console.error("Error updating common prompt:", err)
    } finally {
      setIsUpdatingCommonPrompt(false)
    }
  }

  const getMethodColor = (method) => {
    switch (method) {
      case "GET":
        return "bg-green-500/20 text-green-400 border-green-500/40 shadow-green-500/20"
      case "POST":
        return "bg-blue-500/20 text-blue-400 border-blue-500/40 shadow-blue-500/20"
      case "PUT":
        return "bg-orange-500/20 text-orange-400 border-orange-500/40 shadow-orange-500/20"
      case "PATCH":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/40 shadow-yellow-500/20"
      case "DELETE":
        return "bg-red-500/20 text-red-400 border-red-500/40 shadow-red-500/20"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/40 shadow-slate-500/20"
    }
  }

  const filteredFolders = folders.filter(
    (folder) =>
      folder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (folder.description && folder.description.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const filteredApis =
    selectedFolder && selectedFolder.apis
      ? selectedFolder.apis.filter(
          (api) =>
            api.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (api.description && api.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
            api.endpoint.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      : []

  if (loading && currentView === "folders") {
    return <LoadingSpinner message="Loading Workspace" subtitle="Initializing your API management system..." />
  }

  return (
    <div className="min-h-screen   bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-xl border-b border-slate-700/50">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {currentView !== "folders" && (
                <button
                  onClick={currentView === "api-detail" ? handleBackToApis : handleBackToFolders}
                  className="group flex items-center space-x-2 px-3 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300"
                >
                  <ArrowLeft className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
                  <span className="text-slate-400 group-hover:text-white transition-colors text-sm">Back</span>
                </button>
              )}
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-900 to-purple-900 rounded-xl blur opacity-30"></div>
                  <div className="relative bg-gradient-to-r from-cyan-900/20 to-purple-900/20 p-3 rounded-xl border border-slate-700/50">
                    {currentView === "folders" ? (
                      <Database className="h-6 w-6 text-cyan-400" />
                    ) : currentView === "apis" ? (
                      <Globe className="h-6 w-6 text-purple-400" />
                    ) : (
                      <Terminal className="h-6 w-6 text-emerald-400" />
                    )}
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                    {currentView === "folders"
                      ? "API Workspace"
                      : currentView === "apis"
                        ? selectedFolder?.name
                        : selectedApi?.name}
                  </h1>
                  <p className="text-slate-400 text-xs mt-0.5">
                    {currentView === "folders"
                      ? "Manage your API collections with AI-powered tools"
                      : currentView === "apis"
                        ? `${selectedFolder?.apis?.length || 0} APIs • AI-Enhanced Development`
                        : "Advanced API Configuration & Testing"}
                  </p>
                </div>
              </div>
            </div>

            {/* Search and Actions */}
            <div className="flex items-center space-x-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center">
                  <Search className="h-4 w-4 text-slate-400 absolute left-3 z-10" />
                  <input
                    type="text"
                    placeholder={`Search ${currentView}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-slate-800/50 backdrop-blur-sm text-white pl-10 pr-4 py-2 rounded-lg border border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 w-64 transition-all duration-300 text-sm"
                  />
                </div>
              </div>

              {currentView === "apis" && (
                <>
                  <button
                    onClick={() => setShowAIGenerator(true)}
                    className="group relative px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-medium transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/25 text-sm"
                  >
                    <div className="flex items-center space-x-2">
                      <Sparkles className="h-4 w-4" />
                      <span>AI Generate</span>
                    </div>
                  </button> 
                  <button
                    onClick={() => {
                      setCommonPrompt(selectedFolder?.commonPrompt || "")
                      setShowCommonPromptModal(true)
                    }}
                    className="group relative px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-medium transition-all duration-300 transform hover:scale-105 shadow-lg shadow-indigo-500/25 text-sm"
                  >
                    <div className="flex items-center space-x-2">
                      <FileCode className="h-4 w-4" />
                      <span>Common Prompt</span>
                    </div>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && <ErrorAlert message={error} onClose={() => setError("")} />}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {currentView === "folders" && (
          <FolderView
            folders={filteredFolders}
            setFolders={setFolders}
            onFolderClick={handleFolderClick}
            projectId={projectId}
            userId={userId}
            authToken={authToken}
          />
        )}

        {currentView === "apis" && (
          <ApiView
            folder={selectedFolder}
            apis={filteredApis}
            onApiClick={handleApiClick}
            onApiUpdate={updateApi}
            onApiDelete={deleteApi}
            getMethodColor={getMethodColor}
            loading={loading}
            onAIGenerate={() => setShowAIGenerator(true)}
          />
        )}

        {currentView === "api-detail" && selectedApi && (
          <ApiDetailView
            api={selectedApi}
            onUpdate={updateApi}
            getMethodColor={getMethodColor}
            loading={loading}
            onAIUpdate={() => setShowAIUpdateGenerator(true)}
          />
        )}
      </div>

      {/* Modals */}
      {showAIGenerator && (
        <AIGeneratorModal
          isOpen={showAIGenerator}
          onClose={() => {
            setShowAIGenerator(false)
            setAiPrompt({ name: "", description: "" })
            setAiError("")
          }}
          aiPrompt={aiPrompt}
          setAiPrompt={setAiPrompt}
          onGenerate={handleGenerateAPI}
          isGenerating={isGenerating}
          error={aiError}
        />
      )}

      {showAIUpdateGenerator && (
        <AIUpdateModal
          isOpen={showAIUpdateGenerator}
          onClose={() => {
            setShowAIUpdateGenerator(false)
            setAiUpdatePrompt({ name: "", description: "" })
            setAiUpdateError("")
          }}
          aiUpdatePrompt={aiUpdatePrompt}
          setAiUpdatePrompt={setAiUpdatePrompt}
          onGenerate={handleGenerateUpdateAPI}
          isGenerating={isGeneratingUpdate}
          error={aiUpdateError}
          currentApi={selectedApi}
        />
      )}

      {showCommonPromptModal && (
        <CommonPromptModal
          isOpen={showCommonPromptModal}
          onClose={() => {
            setShowCommonPromptModal(false)
            setCommonPrompt("")
            setCommonPromptError("")
          }}
          commonPrompt={commonPrompt}
          setCommonPrompt={setCommonPrompt}
          onUpdate={handleUpdateCommonPrompt}
          isUpdating={isUpdatingCommonPrompt}
          error={commonPromptError}
          folder={selectedFolder}
        />
      )}

      {showAIPreview && generatedAPI && (
        <AIPreviewModal
          isOpen={showAIPreview}
          onClose={() => {
            setGeneratedAPI(null)
            setShowAIPreview(false)
            setAiPrompt({ name: "", description: "" })
            setAiError("")
          }}
          title="AI Generated API Preview"
          generatedAPI={generatedAPI}
          onApply={handleApplyGeneratedAPI}
          getMethodColor={getMethodColor}
        />
      )}

      {showAIUpdatePreview && generatedUpdateAPI && (
        <AIPreviewModal
          isOpen={showAIUpdatePreview}
          onClose={() => {
            setGeneratedUpdateAPI(null)
            setShowAIUpdatePreview(false)
            setAiUpdatePrompt({ name: "", description: "" })
            setAiUpdateError("")
          }}
          title="AI Updated API Preview"
          generatedAPI={generatedUpdateAPI}
          onApply={handleApplyGeneratedUpdateAPI}
          getMethodColor={getMethodColor}
          isUpdate={true}
        />
      )}
    </div>
  )
}

export default FolderManagement
