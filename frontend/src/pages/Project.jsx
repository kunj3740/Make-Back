
import { useState, useEffect } from "react"
import DiagramViewer from "../components/Table"
import axios from "axios"
import { BACKEND_URL } from "../config"
import { useNavigate, useParams } from "react-router-dom"
import { Code, Database, FileText } from "lucide-react"
import FolderManagement from "../components/FolderManagement"
import CodeEditorPreview from "./ReactPlayground"


export const Project = () => {
  const [entities, setEntities] = useState([])
  const [folders, setFolders] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingSchemas, setLoadingSchemas] = useState(true)
  const [loadingApis, setLoadingApis] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("schema")
  const { projectId } = useParams()
  const Navigate = useNavigate()

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

        setEntities(diagramData.entities || [])
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
      // Load schemas first (by default)
      fetchDiagram()
      fetchFolders()
    }
  }, [projectId])

  // Update main loading state based on individual loading states
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
    // <div className="min-h-screen bg-gray-900 pt-20">
    //   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    //     {/* Tab Navigation */}
    //     <div className="mb-8">
    //       <div className="border-b border-gray-700">
    //         <nav className="-mb-px flex space-x-8">
    //           <button
    //             onClick={() => setActiveTab("schema")}
    //             className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center gap-2 ${
    //               activeTab === "schema"
    //                 ? "border-blue-500 text-blue-400"
    //                 : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600"
    //             }`}
    //           >
    //             <Database className="w-4 h-4" />
    //             Schema
    //             {loadingSchemas && (
    //               <div className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin"></div>
    //             )}
    //           </button>
    //           <button
    //             onClick={() => setActiveTab("apis")}
    //             className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center gap-2 ${
    //               activeTab === "apis"
    //                 ? "border-blue-500 text-blue-400"
    //                 : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600"
    //             }`}
    //           >
    //             <FileText className="w-4 h-4" />
    //             APIs
    //             {loadingApis && (
    //               <div className="w-3 h-3 border border-blue-400 border-t-transparent rounded-full animate-spin"></div>
    //             )}
    //           </button>
    //         </nav>
    //       </div>
    //     </div>

    //     {/* Tab Content */}
    //     <div className="mb-8">
    //       {activeTab === "schema" && (
    //         <div className="border border-slate-500 rounded-xl">
    //           {loadingSchemas ? (
    //             <div className="flex items-center justify-center py-20">
    //               <div className="text-center">
    //                 <div className="relative w-12 h-12 mx-auto mb-4">
    //                   <div className="absolute inset-0 border-4 border-gray-600 rounded-full"></div>
    //                   <div className="absolute inset-0 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
    //                 </div>
    //                 <p className="text-gray-300">Loading schemas...</p>
    //               </div>
    //             </div>
    //           ) : (
    //             <DiagramViewer entities={entities} projectId={projectId || ""} onEditSchema={handleEditSchema} />
    //           )}
    //         </div>
    //       )}

    //       {activeTab === "apis" && (
    //         <div>
    //           {loadingApis ? (
    //             <div className="flex items-center justify-center py-20">
    //               <div className="text-center">
    //                 <div className="relative w-12 h-12 mx-auto mb-4">
    //                   <div className="absolute inset-0 border-4 border-gray-600 rounded-full"></div>
    //                   <div className="absolute inset-0 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
    //                 </div>
    //                 <p className="text-gray-300">Loading APIs...</p>
    //               </div>
    //             </div>
    //           ) : (
    //             <FolderManagement projectId={projectId} folders={folders} setFolders={setFolders} />
    //           )}
    //         </div>
    //       )}
    //     </div>

    //     <div className="h-[100px]"></div>
    //   </div>
    // </div>
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
              {/* <button
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
              </button> */}
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
                <DiagramViewer entities={entities} projectId={projectId || ""} onEditSchema={handleEditSchema} />
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
              <CodeEditorPreview />
            </div>
          )}
        </div>

        <div className="h-[100px]"></div>
      </div>
    </div>
  )
}
