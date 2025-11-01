
import { useState, useEffect } from "react"
import axios from "axios"
import { BACKEND_URL } from "../config"
import { useNavigate, useParams } from "react-router-dom"
import { Code, Database, Download, FileText, Github , Cloud , ExternalLink  } from "lucide-react"
import FolderManagement from "../components/FolderManagement"
import CodeEditorPreview from "./ReactPlayground"
import SchemaViewer from "../components/schemaViewer"

export const Project = () => {
  const [entities, setEntities] = useState([])
  const [diagramUrl, setDiagramUrl] = useState("")
  const [folders, setFolders] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingSchemas, setLoadingSchemas] = useState(true)
  const [loadingApis, setLoadingApis] = useState(true)
  const [generatingCode, setGeneratingCode] = useState(false)
  const [pushingToGithub, setPushingToGithub] = useState(false)
  const [error, setError] = useState(null)
  const [diagramId, setDiagramId] = useState("")
  const [activeTab, setActiveTab] = useState("schema")
  const [githubAccessToken, setGithubAccessToken] = useState("")
  const [deploying, setDeploying] = useState(false)
  const [deploymentUrl, setDeploymentUrl] = useState("")
  const [deploymentStatus, setDeploymentStatus] = useState(null)
  const [showDeployModal, setShowDeployModal] = useState(false)
  const { projectId } = useParams()
  const Navigate = useNavigate()

  const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID
  const REDIRECT_URI = `${window.location.origin}/auth/github/callback`

  useEffect(() => {
    const checkExistingDeployment = async () => {
      try {
        const jwttoken = localStorage.getItem("token")
        if (!jwttoken || !projectId) return

        const response = await axios.get(
          `${BACKEND_URL}/api/v1/code/render/status/${projectId}`,
          {
            headers: {
              Authorization: `Bearer ${jwttoken}`,
            },
          }
        )

        if (response.data.success) {
          setDeploymentUrl(response.data.data.deploymentUrl)
          setDeploymentStatus(response.data.data.status)
        }
      } catch (error) {
        // No deployment exists yet, that's fine
        console.log("No existing deployment")
      }
    }

    if (projectId) {
      checkExistingDeployment()
    }
  }, [projectId])

  // Check for GitHub connection on component mount
  useEffect(() => {
    const checkGithubConnection = async () => {
      try {
        const jwttoken = localStorage.getItem("token")
        if (!jwttoken) return

        const response = await axios.post(
          `${BACKEND_URL}/api/v1/user/check-github`,
          {},
          {
            headers: {
              Authorization: `Bearer ${jwttoken}`,
            },
          }
        )

        if (response.data.connected && response.data.githubAccessToken) {
          // Store token in state
          setGithubAccessToken(response.data.githubAccessToken)
          console.log("GitHub already connected")
        }
      } catch (error) {
        console.log("GitHub not connected:", error)
      }
    }

    checkGithubConnection()
  }, [])

  // Handle GitHub callback when returning from OAuth
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get("code")
    const state = urlParams.get("state")
    const fromAuth = urlParams.get("from_auth")

    // Only process if we have code, state, and this is a GitHub callback
    if (code && state && fromAuth === "github") {
      const processingFlag = `github_processing_${code}_${state}`
      const isProcessing = sessionStorage.getItem(processingFlag)
      
      if (!isProcessing) {
        sessionStorage.setItem(processingFlag, "true")
        handleGithubCallback(code, state).finally(() => {
          sessionStorage.removeItem(processingFlag)
        })
      }
    }
  }, [])

  const handleGithubCallback = async (code, state) => {
    // Verify state to prevent CSRF
    const storedState = localStorage.getItem("github_oauth_state") || 
                       sessionStorage.getItem("github_oauth_state")
    
    if (!storedState || state !== storedState) {
      setError("Authentication failed: Invalid session")
      cleanupAuthState()
      return
    }

    cleanupAuthState()

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/user/github-auth`,
        {
          code,
          redirect_uri: REDIRECT_URI,
        },
        {
          timeout: 25000,
        }
      )

      if (response.data.token) {
        localStorage.setItem("token", response.data.token)
      }

      // Fetch the GitHub access token after successful auth
      const jwttoken = localStorage.getItem("token")
      const checkResponse = await axios.post(
        `${BACKEND_URL}/api/v1/user/check-github`,
        {},
        {
          headers: {
            Authorization: `Bearer ${jwttoken}`,
          },
        }
      )

      if (checkResponse.data.connected && checkResponse.data.githubAccessToken) {
        setGithubAccessToken(checkResponse.data.githubAccessToken)
        console.log("GitHub token fetched after auth")
      }

      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname)
      
      alert("GitHub connected successfully! You can now push your code.")
    } catch (err) {
      console.error("GitHub auth error:", err)
      setError(err.response?.data?.message || "GitHub authentication failed")
      alert(err.response?.data?.message || "GitHub authentication failed")
    }
  }

  const cleanupAuthState = () => {
    localStorage.removeItem("github_oauth_state")
    sessionStorage.removeItem("github_oauth_state")
  }

  const initiateGithubAuth = () => {
    if (!GITHUB_CLIENT_ID) {
      setError("GitHub not configured")
      return
    }

    // Store the current project ID to return here after auth
    sessionStorage.setItem("github_auth_return_project", projectId)
    
    // Generate secure state parameter
    const state = btoa(crypto.randomUUID() + Date.now())
    localStorage.setItem("github_oauth_state", state)
    sessionStorage.setItem("github_oauth_state", state)

    // Always request repo scope for pushing code
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&scope=repo user:email&state=${state}&allow_signup=true`

    console.log("Redirecting to GitHub OAuth")
    window.location.href = githubAuthUrl
  }

  const handlePushToGithub = async () => {
    try {
      setPushingToGithub(true)
      setError(null)
      
      const jwttoken = localStorage.getItem("token")
      
      if (!jwttoken) {
        setError("Authentication required")
        setPushingToGithub(false)
        return
      }

      // Check if we have a GitHub access token
      if (!githubAccessToken) {
        // No token at all - need to authenticate
        if (window.confirm("You need to connect your GitHub account to push code. Connect now?")) {
          initiateGithubAuth()
        }
        setPushingToGithub(false)
        return
      }

      if (!projectId) {
        setError("Project ID is required")
        setPushingToGithub(false)
        return
      }

      // Try to create repo with existing token
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/code/github/create-repo/${projectId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${jwttoken}`,
            'Content-Type': 'application/json'
          },
        }
      )

      if (response.data.success) {
        console.log('Code pushed to GitHub successfully:', response.data)
        alert(`Repository created successfully!\n\nRepo: ${response.data.data.repoFullName}\nURL: ${response.data.data.repoUrl}`)
        
        // Optionally open the repo in a new tab
        if (response.data.data.repoUrl) {
          window.open(response.data.data.repoUrl, '_blank')
        }
      }
    } catch (err) {
      console.error("Error pushing to GitHub:", err)
      
      // Handle insufficient permissions (403 with requiresGithubAuth flag)
      if (err.response?.status === 403 && err.response?.data?.requiresGithubAuth) {
        const errorMsg = err.response.data.message || "Insufficient GitHub permissions"
        
        if (window.confirm(`${errorMsg}\n\nWould you like to reconnect GitHub with repository permissions?`)) {
          // Clear the old token since it doesn't have the right permissions
          setGithubAccessToken("")
          
          // If backend provides an authorization URL, use it
          if (err.response.data.authorizationUrl) {
            const state = btoa(crypto.randomUUID() + Date.now())
            localStorage.setItem("github_oauth_state", state)
            sessionStorage.setItem("github_oauth_state", state)
            sessionStorage.setItem("github_auth_return_project", projectId)
            
            // Append state to the URL from backend
            window.location.href = err.response.data.authorizationUrl + `&state=${state}`
          } else {
            // Fallback to our own auth flow
            initiateGithubAuth()
          }
        }
      } else {
        setError(err.response?.data?.message || "Failed to push to GitHub")
        alert(err.response?.data?.message || "Failed to push to GitHub")
      }
    } finally {
      setPushingToGithub(false)
    }
  }

  const handleDiagramUrlUpdate = (newDiagramUrl) => {
    setDiagramUrl(newDiagramUrl)
  }

  const handleGenerateCode = async () => {
    try {
      setGeneratingCode(true)
      const jwttoken = localStorage.getItem("token")
      
      if (!jwttoken) {
        setError("Authentication required")
        return
      }

      if (!diagramId || !projectId) {
        setError("Diagram ID and Project ID are required")
        return
      }

      const response = await axios.post(`${BACKEND_URL}/api/v1/code/generate-project`, {
        projectId: projectId,
        diagramId: diagramId
      }, {
        headers: {
          Authorization: `Bearer ${jwttoken}`,
          'Content-Type': 'application/json'
        },
      })

      if (response.data.success) {
        console.log('Code generated successfully:', response.data)
      }
    } catch (err) {
      console.error("Error generating code:", err)
      setError(err.response?.data?.message || "Failed to generate code")
    } finally {
      setGeneratingCode(false)
    }
  }
  const handleDownloadCode = async () => {
    try {
      setGeneratingCode(true)
      setError(null)
      
      const jwttoken = localStorage.getItem("token")
      
      if (!jwttoken) {
        setError("Authentication required")
        alert("Please login to download code")
        return
      }

      if (!diagramId || !projectId) {
        setError("Diagram ID and Project ID are required")
        alert("Please create a schema first before downloading code")
        return
      }

      // Make the API call to generate and download the project
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/code/generate-project`,
        {
          projectId: projectId,
          diagramId: diagramId
        },
        {
          headers: {
            Authorization: `Bearer ${jwttoken}`,
            'Content-Type': 'application/json'
          },
          responseType: 'blob', // Important: This tells axios to expect binary data
          timeout: 60000 // 60 second timeout for larger projects
        }
      )

      // Create a blob from the response
      const blob = new Blob([response.data], { type: 'application/zip' })
      
      // Get filename from Content-Disposition header or use default
      let filename = `project_${projectId}.zip`
      const contentDisposition = response.headers['content-disposition']
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i)
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1]
        }
      }
      
      // Create a download link and trigger it
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      alert('Code downloaded successfully! Check your downloads folder.')
      
    } catch (err) {
      console.error("Error downloading code:", err)
      
      let errorMessage = "Failed to download code"
      
      // Handle different error scenarios
      if (err.code === 'ECONNABORTED') {
        errorMessage = "Request timeout. The project might be too large."
      } else if (err.response?.status === 404) {
        errorMessage = "Project or diagram not found"
      } else if (err.response?.status === 401) {
        errorMessage = "Authentication failed. Please login again."
      } else if (err.response?.data) {
        // If error response is not a blob, try to parse it
        if (err.response.data instanceof Blob) {
          try {
            const text = await err.response.data.text()
            const errorData = JSON.parse(text)
            errorMessage = errorData.message || errorMessage
          } catch (parseErr) {
            console.error("Could not parse error response:", parseErr)
          }
        } else {
          errorMessage = err.response.data.message || errorMessage
        }
      }
      
      setError(errorMessage)
      alert(errorMessage)
    } finally {
      setGeneratingCode(false)
    }
  }
  useEffect(() => {
    const fetchDiagram = async () => {
      try {
        const jwttoken = localStorage.getItem("token")
        if (!jwttoken) {
          setError("Authentication required")
          setLoadingSchemas(false)
          return
        }

        setLoadingSchemas(true)
        const response = await axios.get(`${BACKEND_URL}/api/v1/diagrams/from/project/${projectId}`, {
          headers: {
            Authorization: `Bearer ${jwttoken}`,
          },
        })

        let diagramData = response.data

        if (response.data.diagram) {
          diagramData = response.data.diagram
        } else if (response.data.data) {
          diagramData = response.data.data
        }

        if (diagramData && !diagramData.entities) {
          if (Array.isArray(diagramData)) {
            diagramData = { entities: diagramData }
          } else {
            diagramData = { entities: [] }
          }
        }
        setDiagramId(diagramData.id || diagramData._id || null)
        setEntities(diagramData.entities || [])
        setDiagramUrl(diagramData.diagramUrl || "")
      } catch (err) {
        console.error("Error fetching diagram:", err)
        setError(err.message || "Failed to fetch diagram")
      } finally {
        setLoadingSchemas(false)
      }
    }

    const fetchFolders = async () => {
      try {
        const jwttoken = localStorage.getItem("token")
        if (!jwttoken) {
          setError("Authentication required")
          setLoadingApis(false)
          return
        }

        setLoadingApis(true)
        const response = await axios.get(`${BACKEND_URL}/api/v1/folders/project/${projectId}`, {
          headers: {
            Authorization: `Bearer ${jwttoken}`,
          },
        })

        setFolders(response.data.data || [])
      } catch (err) {
        console.error("Error fetching folders:", err)
        setError(err.message || "Failed to fetch folders")
      } finally {
        setLoadingApis(false)
      }
    }

    if (projectId) {
      fetchDiagram()
      fetchFolders()
    }
  }, [projectId])

  useEffect(() => {
    setLoading(loadingSchemas && loadingApis)
  }, [loadingSchemas, loadingApis])

  const handleEditSchema = () => {
    Navigate(`/projects/${projectId}/editor`)
  }
  

  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 border-4 border-gray-600 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
              </div>
              <p className="text-gray-300 text-lg">Loading project...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("schema")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center gap-2 ${
                  activeTab === "schema"
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600"
                }`}
              >
                <Database className="w-4 h-4" />
                Schema
                {loadingSchemas && (
                  <div className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab("apis")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center gap-2 ${
                  activeTab === "apis"
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600"
                }`}
              >
                <FileText className="w-4 h-4" />
                APIs
                {loadingApis && (
                  <div className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab("editor")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center gap-2 ${
                  activeTab === "editor"
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600"
                }`}
              >
                <Code className="w-4 h-4" />
                Editor
              </button>
              <div className="flex-1"></div>
              <button
                onClick={handleDownloadCode}
                disabled={generatingCode || !diagramId}
                className={`px-4 md:px-6 my-2 py-2 rounded-lg font-medium text-sm transition-all duration-300 flex items-center gap-2 ${
                  generatingCode || !diagramId
                    ? "bg-slate-700  shadow-blue-500/20 text-white  hover:bg-blue-600 cursor-pointer "
                    : "bg-slate-700  shadow-blue-500/20 text-white   cursor-pointer "
                }`}
              >
                {generatingCode ? (
                  <>
                    <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                    <span className="hidden sm:inline">Generating...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 flex-shrink-0" />
                    <span className="hidden sm:inline">Download Code</span>
                    <span className="sm:hidden">Download</span>
                  </>
                )}
              </button>
              {showDeployModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-gray-800 rounded-lg p-6 max-w-lg w-full mx-4">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Cloud className="w-6 h-6 text-green-400" />
                      Deployment Successful!
                    </h3>
                    <div className="bg-gray-900 rounded-lg p-4 mb-4">
                      <p className="text-gray-400 text-sm mb-2">Your API is being deployed to Render</p>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-gray-400 text-sm">Status:</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          deploymentStatus === 'live' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-yellow-600 text-white'
                        }`}>
                          {deploymentStatus || 'deploying'}
                        </span>
                      </div>
                      <div className="bg-gray-800 rounded p-3 mb-3">
                        <p className="text-xs text-gray-500 mb-1">Deployment URL:</p>
                        <p className="text-blue-400 text-sm font-mono break-all">{deploymentUrl}</p>
                      </div>
                      <p className="text-xs text-gray-400">
                        ⚠️ Note: First deployment may take 5-10 minutes. Free tier services spin down after 15 minutes of inactivity.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          window.open(deploymentUrl, '_blank')
                          setShowDeployModal(false)
                        }}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open URL
                      </button>
                      <button
                        onClick={() => setShowDeployModal(false)}
                        className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {deploymentUrl && (
                <div className="mb-4 bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Cloud className="w-5 h-5 text-purple-400" />
                      <div>
                        <p className="text-white font-medium">Deployed on Render</p>
                        <p className="text-gray-400 text-sm">{deploymentUrl}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        deploymentStatus === 'live' 
                          ? 'bg-green-600 text-white' 
                          : 'bg-yellow-600 text-white'
                      }`}>
                        {deploymentStatus || 'unknown'}
                      </span>
                      <button
                        onClick={() => window.open(deploymentUrl, '_blank')}
                        className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4 text-gray-300" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              <button
                onClick={handlePushToGithub}
                disabled={pushingToGithub}
                className={`px-6 my-2 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
                  pushingToGithub
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : githubAccessToken
                    ? "bg-blue-700  shadow-blue-500/20 text-white   hover:bg-blue-600 cursor-pointer "
                    : "bg-gray-700 text-white hover:bg-gray-600 hover:shadow-lg"
                }`}
              >
                {pushingToGithub ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    Pushing...
                  </>
                ) : (
                  <>
                    <Github className="w-4 h-4 " />
                    {githubAccessToken ? "Push to GitHub" : "Connect GitHub"}
                  </>
                )}
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mb-8">
          {activeTab === "schema" && (
            <div className="border border-slate-900 rounded-xl">
              {loadingSchemas ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="relative w-12 h-12 mx-auto mb-4">
                      <div className="absolute inset-0 border-4 border-gray-600 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
                    </div>
                    <p className="text-gray-300">Loading schemas...</p>
                  </div>
                </div>
              ) : (
                <SchemaViewer
                  entities={entities}
                  projectId={projectId || ""}
                  onEditSchema={handleEditSchema}
                  diagramUrl={diagramUrl}
                  diagramId={diagramId}
                  onDiagramUrlUpdate={handleDiagramUrlUpdate}
                />
              )}
            </div>
          )}

          {activeTab === "apis" && (
            <div>
              {loadingApis ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="relative w-12 h-12 mx-auto mb-4">
                      <div className="absolute inset-0 border-4 border-gray-600 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
                    </div>
                    <p className="text-gray-300">Loading APIs...</p>
                  </div>
                </div>
              ) : (
                <FolderManagement projectId={projectId} folders={folders} setFolders={setFolders} />
              )}
            </div>
          )}

          {activeTab === "editor" && (
            <div className="flex justify-center">
              <CodeEditorPreview projectId={projectId} />
            </div>
          )}
        </div>

        <div className="h-[100px]"></div>
      </div>
    </div>
  )
}