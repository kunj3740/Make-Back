

import { useState, useEffect, useRef } from "react"
import {
  Database,
  Edit3,
  Move,
  RotateCcw,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Grid3X3,
  Eye,
  Download,
  X,
  Key,
  RotateCw,
  MoveLeft as RotateLeft,
} from "lucide-react"
import axios from "axios"
import { BACKEND_URL } from "../config"
import { Link } from "react-router-dom"

const SchemaViewer = ({ entities = [], projectId, onEditSchema, diagramUrl, diagramId, onDiagramUrlUpdate }) => {
  const [diagramEntities, setDiagramEntities] = useState([])
  const [draggedEntity, setDraggedEntity] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [editMode, setEditMode] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showGrid, setShowGrid] = useState(true)
  const [zoom, setZoom] = useState(1)
  const canvasRef = useRef(null)
  const [projectName, setProjectName] = useState("")
  const [showDiagramPopup, setShowDiagramPopup] = useState(false)
  const [currentDiagramUrl, setCurrentDiagramUrl] = useState(diagramUrl)
  const [isGeneratingDiagram, setIsGeneratingDiagram] = useState(false)

  const [imageZoom, setImageZoom] = useState(1)
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imageRotation, setImageRotation] = useState(0)
  const imageRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (entities && entities.length > 0) {
      const GRID_SIZE = 320
      const COLS = Math.ceil(Math.sqrt(entities.length))

      const entitiesWithPositions = entities.map((entity, index) => {
        const row = Math.floor(index / COLS)
        const col = index % COLS

        return {
          ...entity,
          id: entity.id || entity.name || `entity-${index}`,
          x: entity.x !== undefined ? entity.x : 100 + col * GRID_SIZE,
          y: entity.y !== undefined ? entity.y : 100 + row * GRID_SIZE,
          attributes: entity.attributes || [],
        }
      })

      setDiagramEntities(entitiesWithPositions)
    }
  }, [entities])

  useEffect(() => {
    const fetchProjectName = async () => {
      const token = localStorage.getItem("token")
      if (token) {
        try {
          const response = await axios.get(`${BACKEND_URL}/api/v1/projects/${projectId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          if (response.data.name) {
            setProjectName(response.data.name)
          }
        } catch (error) {
          console.error("Failed to fetch project name:", error)
        }
      }
    }
    fetchProjectName()
  }, [projectId])

  useEffect(() => {
    setCurrentDiagramUrl(diagramUrl)
  }, [diagramUrl])

  const getTypeIcon = (type) => {
    const icons = {
      string: "📝",
      varchar: "📝",
      text: "📄",
      number: "🔢",
      int: "🔢",
      integer: "🔢",
      float: "🔢",
      decimal: "🔢",
      boolean: "☑️",
      bool: "☑️",
      date: "📅",
      datetime: "📅",
      timestamp: "⏰",
      time: "🕐",
      json: "📋",
      array: "📚",
      object: "📦",
    }
    return icons[type?.toLowerCase()] || "🏷️"
  }

  const getTypeColor = (type) => {
    const colors = {
      string: "from-blue-500 to-blue-600",
      varchar: "from-blue-500 to-blue-600",
      text: "from-blue-400 to-blue-500",
      number: "from-emerald-500 to-emerald-600",
      int: "from-emerald-500 to-emerald-600",
      integer: "from-emerald-500 to-emerald-600",
      boolean: "from-orange-500 to-orange-600",
      bool: "from-orange-500 to-orange-600",
      date: "from-cyan-500 to-cyan-600",
      datetime: "from-cyan-500 to-cyan-600",
      timestamp: "from-cyan-400 to-cyan-500",
      json: "from-purple-500 to-purple-600",
      array: "from-indigo-500 to-indigo-600",
    }
    return colors[type?.toLowerCase()] || "from-gray-500 to-gray-600"
  }

  const handleMouseDown = (e, entity) => {
    if (!editMode) return
    e.preventDefault()
    e.stopPropagation()

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const scrollLeft = canvasRef.current?.scrollLeft || 0
    const scrollTop = canvasRef.current?.scrollTop || 0

    setDraggedEntity(entity.id)
    setDragOffset({
      x: (e.clientX - rect.left + scrollLeft) / zoom - (entity.x || 0),
      y: (e.clientY - rect.top + scrollTop) / zoom - (entity.y || 0),
    })
  }

  const handleMouseMove = (e) => {
    if (!draggedEntity || !editMode || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const scrollLeft = canvasRef.current.scrollLeft
    const scrollTop = canvasRef.current.scrollTop

    const newX = Math.max(50, (e.clientX - rect.left + scrollLeft) / zoom - dragOffset.x)
    const newY = Math.max(50, (e.clientY - rect.top + scrollTop) / zoom - dragOffset.y)

    setDiagramEntities((prev) =>
      prev.map((entity) => (entity.id === draggedEntity ? { ...entity, x: newX, y: newY } : entity)),
    )
  }

  const handleMouseUp = () => {
    setDraggedEntity(null)
    setDragOffset({ x: 0, y: 0 })
  }

  const handleZoom = (direction) => {
    setZoom((prev) => {
      const newZoom = direction === "in" ? Math.min(prev * 1.2, 2) : Math.max(prev / 1.2, 0.5)
      return newZoom
    })
  }

  useEffect(() => {
    if (editMode) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)

      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [draggedEntity, dragOffset, editMode, zoom])

  const getConnectionPoints = (fromEntity, toEntity) => {
    const tableWidth = 280
    const tableHeaderHeight = 56
    const attributeHeight = 40

    const fromTableHeight = tableHeaderHeight + (fromEntity.attributes?.length || 0) * attributeHeight
    const toTableHeight = tableHeaderHeight + (toEntity.attributes?.length || 0) * attributeHeight

    const fromCenterX = fromEntity.x + tableWidth / 2
    const fromCenterY = fromEntity.y + fromTableHeight / 2
    const toCenterX = toEntity.x + tableWidth / 2
    const toCenterY = toEntity.y + toTableHeight / 2

    const deltaX = toCenterX - fromCenterX
    const deltaY = toCenterY - fromCenterY

    let fromPoint, toPoint

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) {
        fromPoint = { x: fromEntity.x + tableWidth + 5, y: fromCenterY }
        toPoint = { x: toEntity.x - 5, y: toCenterY }
      } else {
        fromPoint = { x: fromEntity.x - 5, y: fromCenterY }
        toPoint = { x: toEntity.x + tableWidth + 5, y: toCenterY }
      }
    } else {
      if (deltaY > 0) {
        fromPoint = { x: fromCenterX, y: fromEntity.y + fromTableHeight + 5 }
        toPoint = { x: toCenterX, y: toEntity.y - 5 }
      } else {
        fromPoint = { x: fromCenterX, y: fromEntity.y - 5 }
        toPoint = { x: toCenterX, y: toEntity.y + toTableHeight + 5 }
      }
    }

    return { fromPoint, toPoint }
  }

  const drawConnections = () => {
    const connections = []

    diagramEntities.forEach((entity) => {
      entity.attributes?.forEach((attr) => {
        if (attr.ref || attr.reference || attr.foreignKey) {
          const ref = attr.ref || attr.reference || attr.foreignKey
          const [refTable] = ref.split(".")
          const targetEntity = diagramEntities.find((e) => e.name === refTable)
          if (targetEntity && entity.x !== undefined && entity.y !== undefined) {
            const { fromPoint, toPoint } = getConnectionPoints(entity, targetEntity)

            connections.push({
              from: fromPoint,
              to: toPoint,
              fromTable: entity.name,
              toTable: refTable,
              attribute: attr.name,
            })
          }
        }
      })
    })

    return connections.map((conn, idx) => {
      const midX = (conn.from.x + conn.to.x) / 2
      const midY = (conn.from.y + conn.to.y) / 2

      return (
        <g key={idx} className="connection-group">
          <line
            x1={conn.from.x}
            y1={conn.from.y}
            x2={conn.to.x}
            y2={conn.to.y}
            stroke="url(#connectionGradient)"
            strokeWidth="6"
            className="opacity-20"
            filter="blur(3px)"
          />

          <line
            x1={conn.from.x}
            y1={conn.from.y}
            x2={conn.to.x}
            y2={conn.to.y}
            stroke="url(#connectionGradient)"
            strokeWidth="2.5"
            className="opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
            markerEnd="url(#arrowHead)"
          />

          <circle cx={conn.from.x} cy={conn.from.y} r="4" fill="#06b6d4" className="opacity-80" />
          <circle cx={conn.to.x} cy={conn.to.y} r="4" fill="#8b5cf6" className="opacity-80" />

          <foreignObject x={midX - 30} y={midY - 12} width="60" height="24" className="pointer-events-none">
            <div className="bg-gray-800/90 backdrop-blur-sm text-xs text-cyan-300 px-2 py-1 rounded-full text-center border border-cyan-500/30">
              FK
            </div>
          </foreignObject>
        </g>
      )
    })
  }

  const generateERDiagram = async () => {
    setIsGeneratingDiagram(true)
    const token = localStorage.getItem("token")

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/diagrams/generate`,
        { diagramId: diagramId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.data.success && response.data.data.diagramUrl) {
        const newDiagramUrl = response.data.data.diagramUrl
        setCurrentDiagramUrl(newDiagramUrl)
        if (onDiagramUrlUpdate) {
          onDiagramUrlUpdate(newDiagramUrl)
        }
      }
    } catch (error) {
      console.error("Failed to generate ER diagram:", error)
    } finally {
      setIsGeneratingDiagram(false)
    }
  }

  const resetImageView = () => {
    setImageZoom(1)
    setImagePosition({ x: 0, y: 0 })
    setImageRotation(0)
  }

  const handleImageWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    const newZoom = Math.max(0.1, Math.min(5, imageZoom + delta))
    setImageZoom(newZoom)
  }

  const handleImageMouseDown = (e) => {
    if (imageZoom > 1) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - imagePosition.x,
        y: e.clientY - imagePosition.y,
      })
    }
  }

  const handleImageMouseMove = (e) => {
    if (isDragging && imageZoom > 1) {
      setImagePosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    }
  }

  const handleImageMouseUp = () => {
    setIsDragging(false)
  }

  const rotateImage = (direction) => {
    setImageRotation((prev) => prev + (direction === "right" ? 90 : -90))
  }

  const handleImageZoom = (direction) => {
    const factor = direction === "in" ? 1.2 : 0.8
    const newZoom = Math.max(0.1, Math.min(5, imageZoom * factor))
    setImageZoom(newZoom)
  }

  useEffect(() => {
    if (showDiagramPopup) {
      document.addEventListener("mousemove", handleImageMouseMove)
      document.addEventListener("mouseup", handleImageMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleImageMouseMove)
        document.removeEventListener("mouseup", handleImageMouseUp)
      }
    }
  }, [isDragging, dragStart, showDiagramPopup])

  const viewERDiagram = () => {
    if (currentDiagramUrl) {
      setShowDiagramPopup(true)
      resetImageView()
    }
  }

  const downloadDiagram = async () => {
    if (!currentDiagramUrl) return

    try {
      const response = await fetch(currentDiagramUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${projectName || "schema"}-diagram.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to download diagram:", error)
    }
  }

  // Determine button behavior and text
  const handleDiagramButtonClick = () => {
    if (currentDiagramUrl) {
      viewERDiagram()
    } else {
      generateERDiagram()
    }
  }

  const getDiagramButtonText = () => {
    if (isGeneratingDiagram) {
      return "Generating..."
    }
    return currentDiagramUrl ? "View ER Diagram" : "Generate ER Diagram"
  }

  if (!diagramEntities || diagramEntities.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-2xl border border-slate-800/50 overflow-hidden shadow-2xl">
        <div className="bg-gradient-to-r from-slate-900/80 via-slate-800/80 to-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl blur opacity-60"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-xl flex items-center justify-center border border-slate-700/50">
                  <Database className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  Database Schema
                </h2>
                <p className="text-slate-400">Project: {projectName}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center p-16">
          <div className="text-center max-w-md">
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full blur-xl"></div>
              <div className="relative w-24 h-24 bg-gradient-to-br from-slate-800 to-slate-900 rounded-full flex items-center justify-center border border-slate-700/50">
                <Database className="w-12 h-12 text-slate-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">No Schema Detected</h3>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Design your database schema to visualize tables, relationships, and data flow in an interactive diagram.
            </p>
            {onEditSchema && (
              <Link
                to={`/projects/${projectId}/editor`}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-blue-500/25 hover:scale-105"
              >
                <Edit3 className="w-5 h-5" />
                Create Schema
              </Link>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800/50 overflow-hidden shadow-2xl ${
        isFullscreen ? "fixed inset-4 z-50" : ""
      }`}
    >
      {/* Enhanced Header */}
      <div className="relative bg-gradient-to-r from-slate-900/80 via-slate-800/80 to-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 to-purple-600/30 rounded-xl blur opacity-75"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-cyan-900/40 to-purple-900/40 rounded-xl flex items-center justify-center border border-slate-700/50">
                <Database className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Database Schema
              </h2>
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <span>{projectName}</span>
                <div className="h-3 w-px bg-slate-600"></div>
                <span>{diagramEntities.length} tables</span>
                <div className="h-3 w-px bg-slate-600"></div>
                <span>Zoom: {Math.round(zoom * 100)}%</span>
              </div>
            </div>
          </div>

          {/* Control Panel */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleDiagramButtonClick}
              disabled={isGeneratingDiagram}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 via-green-700 to-teal-800 hover:from-emerald-700 hover:via-emerald-800 hover:to-teal-900 text-white rounded-xl font-semibold transition-all duration-300  flex items-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transform"
            >
              <Eye className="w-4 h-4" />
              <span className="text-md">
                {isGeneratingDiagram ? "Generating..." : currentDiagramUrl ? "View Diagram" : "Generate Diagram"}
              </span>
            </button>

            {/* View Controls */}
            <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-1 border border-slate-700/50">
              <div className="flex items-center bg-slate-800/60 rounded-lg border border-slate-700/50">
                <button
                  onClick={() => handleZoom("out")}
                  disabled={zoom <= 0.5}
                  className="p-2 text-slate-400 hover:text-white disabled:opacity-50 transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 py-1 text-xs text-slate-400 min-w-[45px] text-center border-x border-slate-700/50">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => handleZoom("in")}
                  disabled={zoom >= 2}
                  className="p-2 text-slate-400 hover:text-white disabled:opacity-50 transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Layout Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditMode(!editMode)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                  editMode
                    ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                    : "bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 border border-slate-700/50"
                }`}
              >
                <Move className="w-4 h-4" />
                {editMode ? "Done" : "Edit"}
              </button>
            </div>

            {/* Action Controls */}
            <div className="flex items-center gap-2 border-l border-slate-700/50 pl-3">
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700/50"
                title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {onEditSchema && (
                <Link
                  to={`/projects/${projectId}/editor`}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white rounded-lg font-medium transition-all duration-200 shadow-lg shadow-purple-500/25 flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Schema
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Canvas for Schema */}
      <div
        ref={canvasRef}
        className="overflow-auto bg-gradient-to-br from-slate-950 via-slate-950/50 to-slate-950 relative"
        style={{ height: isFullscreen ? "calc(100vh - 160px)" : "700px" }}
      >
        {/* Grid Background */}
        {showGrid && (
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `
                linear-gradient(rgba(148, 163, 184, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(148, 163, 184, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: `${40 * zoom}px ${40 * zoom}px`,
            }}
          />
        )}

        <div
          className="relative min-w-[1400px] min-h-[800px] p-12"
          style={{ transform: `scale(${zoom})`, transformOrigin: "0 0" }}
        >
          {/* Tables */}
          {diagramEntities.map((entity) => (
            <div
              key={entity.id}
              className={`absolute group transition-all duration-300 ${
                editMode ? "cursor-move" : ""
              } ${draggedEntity === entity.id ? "scale-105 rotate-1" : "hover:scale-102"}`}
              style={{
                left: `${entity.x}px`,
                top: `${entity.y}px`,
                zIndex: draggedEntity === entity.id ? 50 : 20,
              }}
              onMouseDown={(e) => handleMouseDown(e, entity)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-2xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity" />

              <div className="relative bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden min-w-[280px]">
                <div
                  className={`bg-gradient-to-r from-slate-700/80 to-slate-600/80 backdrop-blur-sm px-6 py-4 border-b border-slate-600/50 ${
                    editMode ? "cursor-move" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-cyan-500/30 to-purple-600/30 rounded-lg flex items-center justify-center">
                        <Database className="w-4 h-4 text-cyan-400" />
                      </div>
                      <h3 className="font-bold text-white text-lg">{entity.name}</h3>
                    </div>
                    {editMode && <Move className="w-4 h-4 text-slate-400" />}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">{entity.attributes?.length || 0} attributes</div>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {entity.attributes?.map((attr, idx) => (
                    <div
                      key={idx}
                      className="px-6 py-3 border-b border-slate-700/30 last:border-b-0 hover:bg-slate-700/30 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="text-sm flex-shrink-0">{getTypeIcon(attr.type)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-white truncate">{attr.name}</span>
                              {(attr.unique || attr.isPrimaryKey || attr.primary) && (
                                <Key className="w-3 h-3 text-yellow-400 flex-shrink-0" title="Primary/Unique Key" />
                              )}
                              {(attr.ref || attr.reference || attr.foreignKey) && (
                                <div className="text-cyan-400 text-xs flex-shrink-0" title="Foreign Key">
                                  🔗
                                </div>
                              )}
                            </div>
                            {(attr.ref || attr.reference || attr.foreignKey) && (
                              <div className="text-xs text-cyan-400 opacity-80">
                                → {attr.ref || attr.reference || attr.foreignKey}
                              </div>
                            )}
                          </div>
                        </div>
                        <div
                          className={`px-3 py-1 bg-gradient-to-r ${getTypeColor(attr.type)} text-white text-xs rounded-full font-medium shadow-sm`}
                        >
                          {attr.type}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* SVG Connections Layer */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 40 }}>
            <defs>
              <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
              </linearGradient>

              <marker
                id="arrowHead"
                markerWidth="12"
                markerHeight="12"
                refX="10"
                refY="6"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M2,2 L10,6 L2,10 L6,6 Z" fill="#8b5cf6" />
              </marker>
            </defs>
            {drawConnections()}
          </svg>
        </div>
      </div>

      {showDiagramPopup && currentDiagramUrl && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[100] flex flex-col">
          {/* Enhanced Header with Google Drive styling */}
          <div className="flex-shrink-0 bg-gradient-to-r from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border-b border-slate-700/30 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/30 to-purple-600/30 rounded-xl blur opacity-75"></div>
                  <div className="relative w-10 h-10 bg-gradient-to-br from-cyan-900/40 to-purple-900/40 rounded-xl flex items-center justify-center border border-slate-700/50">
                    <Database className="w-5 h-5 text-cyan-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                    ER Diagram
                  </h3>
                  <p className="text-slate-400 text-sm">{projectName} - Database Schema</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Zoom Controls */}
                <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-1 border border-slate-700/50">
                  <button
                    onClick={() => handleImageZoom("out")}
                    disabled={imageZoom <= 0.1}
                    className="p-2 text-slate-400 hover:text-white disabled:opacity-50 transition-colors rounded"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="px-3 py-1 text-xs text-slate-400 min-w-[60px] text-center">
                    {Math.round(imageZoom * 100)}%
                  </span>
                  <button
                    onClick={() => handleImageZoom("in")}
                    disabled={imageZoom >= 5}
                    className="p-2 text-slate-400 hover:text-white disabled:opacity-50 transition-colors rounded"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </div>

                {/* Rotation Controls */}
                <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1 border border-slate-700/50">
                  <button
                    onClick={() => rotateImage("left")}
                    className="p-2 text-slate-400 hover:text-white transition-colors rounded"
                    title="Rotate Left"
                  >
                    <RotateLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => rotateImage("right")}
                    className="p-2 text-slate-400 hover:text-white transition-colors rounded"
                    title="Rotate Right"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                </div>

                {/* Reset View */}
                <button
                  onClick={resetImageView}
                  className="px-4 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 rounded-lg font-medium transition-colors border border-slate-700/50"
                  title="Reset View"
                >
                  Reset
                </button>

                {/* Download */}
                <button
                  onClick={downloadDiagram}
                  className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-lg font-medium transition-all duration-200 shadow-lg shadow-green-500/25 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>

                {/* Regenerate Diagram */}
                <button
                  onClick={generateERDiagram}
                  disabled={isGeneratingDiagram}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-lg font-medium transition-all duration-200 shadow-lg shadow-blue-500/25 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RotateCcw className="w-4 h-4" />
                  {isGeneratingDiagram ? "Regenerating..." : "Regenerate"}
                </button>

                {/* Close */}
                <button
                  onClick={() => setShowDiagramPopup(false)}
                  className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700/50 border border-slate-700/50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Image Container with Google Drive-style interaction */}
          <div ref={containerRef} className="flex-1 overflow-hidden relative bg-black/50" onWheel={handleImageWheel}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="relative transition-transform duration-200 ease-out"
                style={{
                  transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${imageZoom}) rotate(${imageRotation}deg)`,
                  cursor: imageZoom > 1 ? (isDragging ? "grabbing" : "grab") : "default",
                }}
              >
                <img
                  ref={imageRef}
                  src={currentDiagramUrl || "/placeholder.svg"}
                  alt="ER Diagram"
                  className="max-w-none h-auto select-none"
                  style={{
                    maxHeight: imageZoom === 1 ? "80vh" : "none",
                    maxWidth: imageZoom === 1 ? "90vw" : "none",
                  }}
                  onMouseDown={handleImageMouseDown}
                  onError={(e) => {
                    console.error("Failed to load diagram image")
                    e.target.style.display = "none"
                  }}
                  draggable={false}
                />
              </div>
            </div>

            {/* Zoom Instructions Overlay */}
            {imageZoom === 1 && (
              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-800/90 backdrop-blur-sm text-slate-300 px-4 py-2 rounded-lg border border-slate-700/50 text-sm">
                Use mouse wheel to zoom • Drag to pan when zoomed
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SchemaViewer
