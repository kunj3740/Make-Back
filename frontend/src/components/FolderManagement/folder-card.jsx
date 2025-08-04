"use client"

import { useState } from "react"
import { Edit2, Trash2, Save, X, Database, Activity, ChevronRight } from "lucide-react"

const FolderCard = ({ folder, onEdit, onDelete, onUpdate, onClick, isEditing }) => {
  const [editData, setEditData] = useState({
    name: folder.name,
    description: folder.description || "",
  })

  return (
    <div className="group relative">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 hover:border-slate-600/50 transition-all duration-300 cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 flex-1" onClick={() => onClick(folder)}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg blur opacity-30"></div>
              <div className="relative bg-gradient-to-br from-cyan-500/20 to-purple-500/20 p-3 rounded-lg border border-slate-700/50">
                <Database className="h-6 w-6 text-cyan-400" />
              </div>
            </div>
            {isEditing ? (
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="font-bold bg-slate-800/50 text-white border border-slate-600/50 rounded-lg px-3 py-2 flex-1 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 text-sm"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors mb-1">
                  {folder.name}
                </h3>
                <p className="text-slate-400 text-sm flex items-center space-x-1">
                  <Activity className="h-3 w-3" />
                  <span>{folder.apis?.length || 0} APIs</span>
                </p>
              </div>
            )}
          </div>
          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {isEditing ? (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onUpdate(folder._id, editData)
                  }}
                  className="p-2 hover:bg-emerald-500/20 rounded-lg transition-colors"
                >
                  <Save className="h-4 w-4 text-emerald-400" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditData({ name: folder.name, description: folder.description || "" })
                    onEdit(null)
                  }}
                  className="p-2 hover:bg-slate-500/20 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(folder._id)
                  }}
                  className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors"
                >
                  <Edit2 className="h-4 w-4 text-blue-400" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(folder._id)
                  }}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4 text-red-400" />
                </button>
              </>
            )}
          </div>
        </div>
        {isEditing && (
          <textarea
            value={editData.description}
            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            placeholder="Enter folder description..."
            className="w-full bg-slate-800/50 text-white border border-slate-600/50 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            rows="2"
            onClick={(e) => e.stopPropagation()}
          />
        )}
        {!isEditing && (
          <div onClick={() => onClick(folder)} className="flex items-center justify-end">
            <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
          </div>
        )}
      </div>
    </div>
  )
}

export default FolderCard
