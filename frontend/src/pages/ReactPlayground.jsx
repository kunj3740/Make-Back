import { useState, useEffect } from "react"
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  useSandpack,
} from "@codesandbox/sandpack-react"
import { nightOwl } from "@codesandbox/sandpack-themes"
import { BACKEND_URL } from "../config"

function CodeSync({ onCodeChange }) {
  const { sandpack } = useSandpack()

  useEffect(() => {
    const currentCode = sandpack.files[sandpack.activeFile].code
    onCodeChange(currentCode)
  }, [sandpack.files, sandpack.activeFile, onCodeChange])

  return null
}

export default function CodeEditorPreview({ projectId }) {
  const [mode, setMode] = useState("edit")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [pages, setPages] = useState([])
  const [activePageId, setActivePageId] = useState(null)
  const [newPageName, setNewPageName] = useState("")
  const [showNewPageInput, setShowNewPageInput] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [authToken, setAuthToken] = useState(null)
  const [showDropdown, setShowDropdown] = useState(null)
  const [renamingPageId, setRenamingPageId] = useState(null)
  const [renameValue, setRenameValue] = useState("")
  const [toast, setToast] = useState({ show: false, message: "", type: "" })
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createPageData, setCreatePageData] = useState({ name: "", description: "" })

  // Get auth token from localStorage
  useEffect(() => {
    const token = localStorage.getItem("token")
    if( token ){
      setAuthToken(token)
    }
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      setShowDropdown(null)
      // Close modal if clicking outside
      if (showCreateModal) {
        const modalElement = document.getElementById('create-page-modal')
        if (modalElement && !modalElement.contains(event.target)) {
          setShowCreateModal(false)
          setCreatePageData({ name: "", description: "" })
        }
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showCreateModal])



  const activePage = pages.find((page) => page._id === activePageId) || pages[0]

  // Fetch components by project ID on component mount
  useEffect(() => {
    if (projectId && authToken) {
      fetchComponentsByProject()
    }
  }, [projectId, authToken])

  const fetchComponentsByProject = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${BACKEND_URL}/api/v1/components/project/${projectId}`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch components')
      }

      const data = await response.json()
      console.log("[v0] Fetched components:", data)
      
      if (data && data.length > 0) {
        setPages(data)
        setActivePageId(data[0]._id)
      } else {
        
      }
    } catch (err) {
      console.error("[v0] API fetch error:", err)
      setError(err.message)
    
    } finally {
      setLoading(false)
    }
  }

  

  const handlePageSelect = (pageId) => {
    console.log("[v0] Switching to page:", pageId)
    setActivePageId(pageId)
    setMode("edit")
  }

  const handleCreatePage = async () => {
    if (createPageData.name.trim() && createPageData.description.trim() && projectId && authToken) {
      // Check if page name already exists
      const pageExists = pages.some(page => page.pageName.toLowerCase() === createPageData.name.trim().toLowerCase())
      if (pageExists) {
        showToast("Page name already exists", "error")
        return
      }

      try {
        const response = await fetch(`${BACKEND_URL}/api/v1/components`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            pageName: createPageData.name.trim(),
            description: createPageData.description.trim(),
            projectId: projectId
          })
        })

        if (!response.ok) {
          throw new Error('Failed to create component')
        }

        const newComponent = await response.json()
        console.log("[v0] Created new component:", newComponent)
        
        setPages((prev) => [...prev, newComponent])
        setActivePageId(newComponent._id)
        setCreatePageData({ name: "", description: "" })
        setShowCreateModal(false)
        setMode("edit")
        showToast("Page created successfully", "success")
      } catch (err) {
        console.error("[v0] Error creating page:", err)
        showToast("Failed to create new page", "error")
      }
    }
  }

  const handleCodeChange = async (newCode) => {
    if (activePage && newCode !== activePage.code && authToken) {
      try {
        // Update local state immediately for better UX
        setPages((prevPages) => 
          prevPages.map((page) => 
            page._id === activePageId ? { ...page, code: newCode } : page
          )
        )

        // Debounced API call to update backend
        clearTimeout(window.codeUpdateTimeout)
        window.codeUpdateTimeout = setTimeout(async () => {
          try {
            const response = await fetch(`${BACKEND_URL}/api/v1/components/${activePageId}`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                code: newCode
              })
            })

            if (!response.ok) {
              throw new Error('Failed to update component')
            }

            console.log("[v0] Code updated successfully for page:", activePageId)
          } catch (err) {
            console.error("[v0] Error updating code:", err)
            // Revert local state on error
            setPages((prevPages) => 
              prevPages.map((page) => 
                page._id === activePageId ? { ...page, code: activePage.code } : page
              )
            )
          }
        }, 1000) // 1 second debounce
      } catch (err) {
        console.error("[v0] Error in handleCodeChange:", err)
      }
    }
  }

  const handleDeletePage = async (pageId) => {
    if (pages.length <= 1) {
      setError("Cannot delete the last remaining page")
      return
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/components/${pageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete component')
      }

      setPages((prev) => prev.filter((page) => page._id !== pageId))
      
      // Switch to another page if the deleted page was active
      if (activePageId === pageId) {
        const remainingPages = pages.filter((page) => page._id !== pageId)
        if (remainingPages.length > 0) {
          setActivePageId(remainingPages[0]._id)
        }
      }

      console.log("[v0] Component deleted successfully:", pageId)
    } catch (err) {
      console.error("[v0] Error deleting page:", err)
      setError("Failed to delete page")
    }
  }

  // Add the showToast function
  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" })
    }, 3000)
  }
  const startRename = (page) => {
    setRenamingPageId(page._id)
    setRenameValue(page.pageName)
    setShowDropdown(null)
  }

  // Add the handleRenamePage function
  const handleRenamePage = async (pageId, newName) => {
    if (!newName.trim() || !authToken) return

    // Check if the new name already exists (excluding current page)
    const pageExists = pages.some(page => 
      page._id !== pageId && page.pageName.toLowerCase() === newName.trim().toLowerCase()
    )
    if (pageExists) {
      showToast("Page name already exists", "error")
      setRenamingPageId(null)
      setRenameValue("")
      return
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/components/${pageId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pageName: newName.trim()
        })
      })

      if (!response.ok) {
        throw new Error('Failed to rename component')
      }

      // Update local state
      setPages((prevPages) => 
        prevPages.map((page) => 
          page._id === pageId ? { ...page, pageName: newName.trim() } : page
        )
      )

      setRenamingPageId(null)
      setRenameValue("")
      showToast("Page renamed successfully", "success")
      
      console.log("[v0] Page renamed successfully:", pageId, newName)
    } catch (err) {
      console.error("[v0] Error renaming page:", err)
      setError("Failed to rename page")
      showToast("Failed to rename page", "error")
      setRenamingPageId(null)
      setRenameValue("")
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-md shadow-2xl border border-gray-700/50 overflow-hidden backdrop-blur-sm flex items-center justify-center h-96">
        <div className="text-gray-300 text-lg">Loading components...</div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-md shadow-2xl border border-gray-700/50 overflow-hidden backdrop-blur-sm flex items-center justify-center h-96">
        <div className="text-red-400 text-lg">Error: {error}</div>
      </div>
    )
  }

  const sandpackFiles = activePage ? {
    "/App.js": activePage.code,
    "/styles.css": `@import url('https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css');`,
  } : {}

  return (
    <div className="w-full max-w-7xl mx-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-md shadow-2xl border border-gray-700/50 overflow-hidden backdrop-blur-sm flex flex-col">
      {/* Toast notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
          <div className={`px-4 py-3 rounded-lg shadow-lg border backdrop-blur-sm flex items-center gap-3 ${
            toast.type === "success" 
              ? "bg-green-900/80 border-green-600 text-green-200" 
              : "bg-red-900/80 border-red-600 text-red-200"
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              toast.type === "success" ? "bg-green-400" : "bg-red-400"
            }`}></div>
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => setToast({ show: false, message: "", type: "" })}
              className="text-gray-400 hover:text-gray-200 transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700/50 bg-gradient-to-r from-gray-800 via-gray-750 to-gray-800">
        <div className="flex items-center gap-3">
          <span className="ml-4 font-semibold text-lg bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Code Editor
          </span>
          <span className="ml-2 px-2 py-1 rounded bg-gray-700/50 text-gray-300 text-sm">{activePage?.pageName || 'No Page'}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMode("edit")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              mode === "edit"
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25"
                : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white"
            }`}
          >
            Code
          </button>
          <button
            onClick={() => setMode("preview")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              mode === "preview"
                ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/25"
                : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white"
            }`}
          >
            Preview
          </button>
          <button
            onClick={() => setIsFullscreen(true)}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white transition-all"
          >
            Fullscreen
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r border-gray-700/50 bg-gradient-to-b from-gray-800/80 to-gray-900/80 p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-300 font-medium flex items-center gap-2">
              <span className="w-5 h-5">📄</span> Pages
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowCreateModal(true)
              }}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:scale-110 transition-transform"
            >
              +
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {pages.map((page) => (
              <div
                key={page._id}
                className={`w-full px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-all relative group ${
                  activePageId === page._id
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50"
                }`}
              >
                {renamingPageId === page._id ? (
                  <div className="flex-1 flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${activePageId === page._id ? "bg-green-400" : "bg-gray-500"}`}
                    ></span>
                    <input
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      className="flex-1 bg-gray-800 border border-gray-600 rounded px-2 py-1 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          if (renameValue.trim() && renameValue.trim() !== page.pageName) {
                            handleRenamePage(page._id, renameValue)
                          } else {
                            setRenamingPageId(null)
                            setRenameValue("")
                          }
                        } else if (e.key === 'Escape') {
                          setRenamingPageId(null)
                          setRenameValue("")
                        }
                      }}
                      onBlur={() => {
                        if (renameValue.trim() && renameValue.trim() !== page.pageName) {
                          handleRenamePage(page._id, renameValue)
                        } else {
                          setRenamingPageId(null)
                          setRenameValue("")
                        }
                      }}
                      autoFocus
                    />
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => handlePageSelect(page._id)}
                      className="flex items-center gap-2 flex-1 text-left"
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${activePageId === page._id ? "bg-green-400" : "bg-gray-500"}`}
                      ></span>
                      {page.pageName}
                    </button>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowDropdown(showDropdown === page._id ? null : page._id)
                        }}
                        className="ml-2 w-6 h-6 flex items-center justify-center rounded hover:bg-gray-600/50 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <span className="text-gray-400 hover:text-gray-200">⋯</span>
                      </button>
                      {showDropdown === page._id && (
                        <div className="absolute right-0 top-8 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 min-w-32">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              startRename(page)
                            }}
                            className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white rounded-t-lg"
                          >
                            Rename
                          </button>
                          {pages.length > 1 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                if (window.confirm(`Are you sure you want to delete "${page.pageName}"?`)) {
                                  handleDeletePage(page._id)
                                }
                              }}
                              className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-b-lg"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Editor / Preview */}
        <div className="flex-1 bg-gradient-to-br from-gray-900/50 to-gray-800/50 p-4">
          {activePage ? (
            <SandpackProvider
              key={`sandpack-${activePageId}`}
              theme={nightOwl}
              template="react"
              files={sandpackFiles}
              options={{
                activeFile: "/App.js",
                recompileMode: "immediate",
                recompileDelay: 0,
              }}
              customSetup={{
                dependencies: {
                  react: "latest",
                  "react-dom": "latest",
                  tailwindcss: "latest",
                },
              }}
            >
              <CodeSync onCodeChange={handleCodeChange} />

              <div className="rounded-2xl overflow-hidden border border-gray-700/30 shadow-2xl h-[600px]">
                <SandpackLayout style={{ height: "100%" }}>
                  {mode === "edit" && (
                    <SandpackCodeEditor
                      showTabs={false}
                      showLineNumbers
                      showInlineErrors
                      wrapContent
                      style={{
                        height: "100%",
                        fontSize: "14px",
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                      }}
                      showRunButton={true}
                      closableTabs={false}
                    />
                  )}
                  {mode === "preview" && (
                    <SandpackPreview
                      showNavigator
                      showRefreshButton
                      showOpenInCodeSandbox
                      showSandpackErrorOverlay
                      style={{ height: "100%" }}
                    />
                  )}
                </SandpackLayout>
              </div>
            </SandpackProvider>
          ) : (
            <div className="flex items-center justify-center h-[600px] text-gray-400">
              No active page selected
            </div>
          )}
        </div>
      </div>

      {/* Create Page Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div 
            id="create-page-modal"
            className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 rounded-2xl shadow-2xl border border-gray-700/50 p-6 w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Create New Page
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setCreatePageData({ name: "", description: "" })
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-700/50 text-gray-400 hover:bg-gray-600/50 hover:text-gray-200 transition-all"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Page Name
                </label>
                <input
                  type="text"
                  value={createPageData.name}
                  onChange={(e) => setCreatePageData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-600 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter page name"
                  onKeyPress={(e) => e.key === 'Enter' && createPageData.name.trim() && createPageData.description.trim() && handleCreatePage()}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={createPageData.description}
                  onChange={(e) => setCreatePageData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg bg-gray-800/50 border border-gray-600 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Enter page description"
                  rows="3"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setCreatePageData({ name: "", description: "" })
                }}
                className="flex-1 px-4 py-3 rounded-lg bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePage}
                disabled={!createPageData.name.trim() || !createPageData.description.trim()}
                className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-all font-medium"
              >
                Create Page
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-gray-700/50 bg-gradient-to-r from-gray-800 to-gray-750 text-sm text-gray-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            Ready
          </span>
          <span>React • JavaScript</span>
          <span>{pages.length} pages</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Tailwind CSS</span>
          <span className="text-xs bg-gray-700/50 px-2 py-1 rounded">
            {mode === "edit" ? "✏️ Editing" : "👁️ Preview"}
          </span>
        </div>
      </div>
    </div>
  )
}