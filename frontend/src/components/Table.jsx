"use client"

import { useState, useEffect, useRef } from "react"
import { Database, Key, Edit3, Move, RotateCcw, Maximize2, Minimize2 } from "lucide-react"
import axios from "axios"
import { BACKEND_URL } from "../config"
import { Link } from "react-router-dom"

const DiagramViewer = ({ entities = [], projectId, onEditSchema }) => {
  const [diagramEntities, setDiagramEntities] = useState([])
  const [draggedEntity, setDraggedEntity] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [editMode, setEditMode] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const canvasRef = useRef(null)
  const [projectName , setProjectName] = useState("");
  // Initialize entities with positions
  useEffect(() => {
    if (entities && entities.length > 0) {
      const GRID_SIZE = 300
      const COLS = 3

      const entitiesWithPositions = entities.map((entity, index) => {
        const row = Math.floor(index / COLS)
        const col = index % COLS

        return {
          ...entity,
          id: entity.id || entity.name || `entity-${index}`,
          x: entity.x !== undefined ? entity.x : 50 + col * GRID_SIZE,
          y: entity.y !== undefined ? entity.y : 100 + row * GRID_SIZE,
          attributes: entity.attributes || [],
        }
      })

      setDiagramEntities(entitiesWithPositions)
    }
  }, [entities])
  useEffect(() => {
    
    const fecthProjectName = async () => {
      const token = localStorage.getItem("token");
      if( token ){
        
        const response = await axios.get(`${BACKEND_URL}/api/v1/projects/${projectId}` , 
          {
            headers : {
              Authorization : `Bearer ${token}`,
            }
          } 
        );
        // console.log(response)
        if( response.data.name ){
          setProjectName(response.data.name);
        } 
      }
    }
    fecthProjectName();
  })
  const getTypeIcon = (type) => {
    const icons = {
      string: "🔤",
      number: "🔢",
      boolean: "✅",
      date: "📅",
      text: "📄",
      varchar: "🔤",
      int: "🔢",
      integer: "🔢",
      timestamp: "📅",
      datetime: "📅",
    }
    return icons[type?.toLowerCase()] || "🔤"
  }

  const getTypeColor = (type) => {
    const colors = {
      string: "text-blue-400",
      number: "text-green-400",
      boolean: "text-orange-400",
      date: "text-cyan-400",
      text: "text-yellow-400",
      varchar: "text-blue-400",
      int: "text-green-400",
      integer: "text-green-400",
      timestamp: "text-cyan-400",
      datetime: "text-cyan-400",
    }
    return colors[type?.toLowerCase()] || "text-gray-400"
  }

  const autoArrange = () => {
    const GRID_SIZE = 300
    const COLS = 3

    const arranged = diagramEntities.map((entity, index) => {
      const row = Math.floor(index / COLS)
      const col = index % COLS
      return {
        ...entity,
        x: 50 + col * GRID_SIZE,
        y: 100 + row * GRID_SIZE,
      }
    })

    setDiagramEntities(arranged)
  }

  const handleMouseDown = (e, entity) => {
    if (!editMode) return

    e.preventDefault()
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const scrollLeft = canvasRef.current?.scrollLeft || 0
    const scrollTop = canvasRef.current?.scrollTop || 0

    setDraggedEntity(entity.id)
    setDragOffset({
      x: e.clientX - rect.left + scrollLeft - (entity.x || 0),
      y: e.clientY - rect.top + scrollTop - (entity.y || 0),
    })
  }

  const handleMouseMove = (e) => {
    if (!draggedEntity || !editMode || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const scrollLeft = canvasRef.current.scrollLeft
    const scrollTop = canvasRef.current.scrollTop

    const newX = Math.max(0, e.clientX - rect.left + scrollLeft - dragOffset.x)
    const newY = Math.max(0, e.clientY - rect.top + scrollTop - dragOffset.y)

    setDiagramEntities((prev) =>
      prev.map((entity) => (entity.id === draggedEntity ? { ...entity, x: newX, y: newY } : entity)),
    )
  }

  const handleMouseUp = () => {
    setDraggedEntity(null)
    setDragOffset({ x: 0, y: 0 })
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
  }, [draggedEntity, dragOffset, editMode])

  const drawConnections = () => {
    const connections = []

    diagramEntities.forEach((entity) => {
      entity.attributes.forEach((attr) => {
        if (attr.ref || attr.reference || attr.foreignKey) {
          const ref = attr.ref || attr.reference || attr.foreignKey
          const [refTable] = ref.split(".")
          const targetEntity = diagramEntities.find((e) => e.name === refTable)
          if (
            targetEntity &&
            entity.x !== undefined &&
            entity.y !== undefined &&
            targetEntity.x !== undefined &&
            targetEntity.y !== undefined
          ) {
            connections.push({
              from: { x: entity.x + 120, y: entity.y + 60 },
              to: { x: targetEntity.x + 120, y: targetEntity.y + 60 },
              fromTable: entity.name,
              toTable: refTable,
            })
          }
        }
      })
    })

    return connections.map((conn, idx) => (
      <g key={idx}>
        <line
          x1={conn.from.x}
          y1={conn.from.y}
          x2={conn.to.x}
          y2={conn.to.y}
          stroke="#3b82f6"
          strokeWidth="2"
          strokeDasharray="5,5"
          className="opacity-60 hover:opacity-100 transition-opacity"
        />
        <circle cx={conn.from.x} cy={conn.from.y} r="4" fill="#3b82f6" className="opacity-80" />
        <circle cx={conn.to.x} cy={conn.to.y} r="4" fill="#10b981" className="opacity-80" />
      </g>
    ))
  }

  if (!diagramEntities || diagramEntities.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Database className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Database Schema</h2>
                <p className="text-sm text-gray-400">Project: {projectName}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div className="flex items-center justify-center p-12">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 mx-auto bg-gray-800 rounded-full flex items-center justify-center mb-6 border border-gray-700">
              <Database className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">No Schema Found</h3>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Create your database schema to visualize your data structure and relationships.
            </p>
            {onEditSchema && (
              <Link
                to={`/projects/${projectId}/editor`}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
              >
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
      className={`bg-gray-900 rounded-xl border border-gray-900 overflow-hidden ${isFullscreen ? "fixed inset-4 z-50" : ""}`}
    >
      {/* Header with Controls */}
      <div className="relative bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-xl border-b border-slate-700/50 px-6 py-4">
        {/* Subtle cyan-purple overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5"></div>

        <div className="relative flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-900 to-purple-900 rounded-lg blur opacity-30"></div>
                <div className="relative w-10 h-10 bg-gradient-to-br from-cyan-900/30 to-purple-900/30 rounded-lg flex items-center justify-center border border-slate-700/50">
                  <Database className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  Database Schema
                </h2>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span>Project: {projectName}</span>
                  <div className="h-3 w-px bg-slate-700"></div>
                  <span>{diagramEntities.length} table</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Layout Controls */}
            <div className="flex items-center gap-2 border-r border-slate-700/50 pr-3">
              <button
                onClick={() => setEditMode(!editMode)}
                className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 shadow-md ${
                  editMode
                    ? "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-emerald-500/25"
                    : "bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 border border-slate-700/50"
                }`}
              >
                <Move className="w-4 h-4" />
                {editMode ? "Exit Edit" : "Edit Layout"}
              </button>
              <button
                onClick={autoArrange}
                className="px-3 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 rounded-lg font-medium transition-colors flex items-center gap-2 border border-slate-700/50"
                title="Auto-arrange tables"
              >
                <RotateCcw className="w-4 h-4" />
                Auto Arrange
              </button>
            </div>

            {/* Action Controls */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-700/50"
              title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
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

        {/* Edit mode hint */}
        {editMode && (
          <div className="mt-3 text-sm text-yellow-400 flex items-center gap-2 bg-yellow-400/10 px-3 py-2 rounded-lg border border-yellow-400/20">
            <Move className="w-4 h-4" />
            Drag tables to reposition them. Click "Exit Edit" when done.
          </div>
        )}
      </div>
      {/* Diagram Canvas */}
      <div
        ref={canvasRef}
        className="overflow-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
        style={{ height: isFullscreen ? "calc(100vh - 200px)" : "600px" }}
      >
        <div className="relative min-w-[1200px] min-h-[600px] p-8">
          {/* SVG for connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
            {drawConnections()}
          </svg>

          {/* Tables */}
          {diagramEntities.map((entity) => (
            <div
              key={entity.id}
              className={`absolute bg-gray-800 border border-gray-700 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-200 group ${
                editMode ? "cursor-move hover:border-blue-500" : "hover:border-gray-600"
              } ${draggedEntity === entity.id ? "shadow-2xl border-blue-500 scale-105" : ""}`}
              style={{
                left: `${entity.x}px`,
                top: `${entity.y}px`,
                zIndex: draggedEntity === entity.id ? 30 : 10,
              }}
              onMouseDown={(e) => handleMouseDown(e, entity)}
            >
              {/* Table Header */}
              <div
                className={`bg-gradient-to-r from-gray-700 to-gray-600 px-4 py-3 rounded-t-lg border-b border-gray-600 ${
                  editMode ? "cursor-move" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <Database className="w-4 h-4 text-blue-400" />
                  <h3 className="font-bold text-white text-base">{entity.name}</h3>
                  {editMode && <Move className="w-4 h-4 text-gray-400 ml-auto" />}
                </div>
              </div>

              {/* Table Body */}
              <div className="p-0 max-h-80 overflow-y-auto">
                {entity.attributes.map((attr, idx) => (
                  <div
                    key={idx}
                    className="px-4 py-2.5 border-b border-gray-700 last:border-b-0 hover:bg-gray-750 transition-colors flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="text-xs">{getTypeIcon(attr.type)}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white text-sm truncate">{attr.name}</span>
                          {(attr.unique || attr.isPrimaryKey || attr.primary) && (
                            <Key className="w-3 h-3 text-yellow-400" title="Unique/Primary Key" />
                          )}
                          {(attr.ref || attr.reference || attr.foreignKey) && (
                            <Link className="w-3 h-3 text-blue-400" title="Foreign Key" />
                          )}
                        </div>
                        {(attr.ref || attr.reference || attr.foreignKey) && (
                          <div className="text-xs text-blue-400 mt-1">
                            → {attr.ref || attr.reference || attr.foreignKey}
                          </div>
                        )}
                        {attr.default && <div className="text-xs text-gray-500 mt-1">default: {attr.default}</div>}
                      </div>
                    </div>
                    <span className={`text-xs font-mono px-2 py-1 rounded bg-gray-700 ${getTypeColor(attr.type)}`}>
                      {attr.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DiagramViewer
