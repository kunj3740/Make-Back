import { useState, useEffect } from "react"
import DiagramViewer from "../components/Table"
import axios from "axios"
import { BACKEND_URL } from "../config"
import { useParams } from "react-router-dom"
import { AlertCircle, Database, Plus, Settings, BarChart3, FileText } from "lucide-react"
import FolderManagement from "../components/FolderManagement"

export const Project = () => {
  const [entities, setEntities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { projectId } = useParams()

  useEffect(() => {
    const fetchDiagram = async () => {
      try {
        const jwttoken = localStorage.getItem("token")
        if (!jwttoken) {
          setError("Authentication required")
          setLoading(false)
          return
        }

        setLoading(true)
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
        setLoading(false)
      }
    }

    if (projectId) {
      fetchDiagram()
    }
  }, [projectId])

  const handleEditSchema = () => {
    window.location.href = `/projects/${projectId}/editor`
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
        

        <div className="mb-8 border border-slate-500 rounded-xl">
          <DiagramViewer entities={entities} projectId={projectId || ""} onEditSchema={handleEditSchema} />
        </div>

        <div className="h-[100px]"></div>

        <div>
          <FolderManagement projectId={projectId}/>
        </div>
        
      </div>
    </div>
  )
}
