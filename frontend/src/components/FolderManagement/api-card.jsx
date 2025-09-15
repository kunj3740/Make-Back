"use client"

import { useState } from "react"
import { Edit2, Trash2, Save, X, Globe, Eye, ChevronRight } from "lucide-react"

const ApiCard = ({ api, onEdit, onDelete, onUpdate, onClick, isEditing, getMethodColor }) => {
  const [editData, setEditData] = useState({
    name: api?.name || "",
    description: api?.description || "",
    method: api?.method || "GET",
    endpoint: api?.endpoint || "",
    controllerCode: api?.controllerCode || "",
  })

  if (!api) {
    return (
      <div className="group relative">
        <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center justify-center py-8">
            <p className="text-slate-400">API data not available</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="group relative">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 hover:border-slate-600/50 transition-all duration-300 cursor-pointer">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3 flex-1" onClick={() => onClick(api)}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg blur opacity-30"></div>
              <div className="relative bg-gradient-to-br from-emerald-500/20 to-blue-500/20 p-3 rounded-lg border border-slate-700/50">
                <Globe className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    className="font-bold bg-slate-800/50 text-white border border-slate-600/50 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
                    onClick={(e) => e.stopPropagation()}
                    placeholder="API Name"
                  />
                  <div className="flex space-x-2">
                    <select
                      value={editData.method}
                      onChange={(e) => setEditData({ ...editData, method: e.target.value })}
                      className="bg-slate-800/50 text-white border border-slate-600/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                      <option value="PATCH">PATCH</option>
                    </select>
                    <input
                      type="text"
                      value={editData.endpoint}
                      onChange={(e) => setEditData({ ...editData, endpoint: e.target.value })}
                      className="bg-slate-800/50 text-white border border-slate-600/50 rounded-lg px-3 py-2 text-sm flex-1 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Endpoint"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors mb-2">
                    {api.name || "Unnamed API"}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-3 py-1 rounded-lg text-sm font-semibold border shadow-lg ${getMethodColor ? getMethodColor(api.method || "GET") : "text-slate-400 bg-slate-500/10 border-slate-500/20"}`}
                    >
                      {api.method || "GET"}
                    </span>
                    <code className="text-slate-300 text-sm bg-slate-800/50 px-2 py-1 rounded font-mono border border-slate-700/50">
                      {api.endpoint || "/api/endpoint"}
                    </code>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {isEditing ? (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onUpdate && onUpdate(api._id || api.id, editData)
                  }}
                  className="p-2 hover:bg-emerald-500/20 rounded-lg transition-colors"
                >
                  <Save className="h-4 w-4 text-emerald-400" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditData({
                      name: api?.name || "",
                      description: api?.description || "",
                      method: api?.method || "GET",
                      endpoint: api?.endpoint || "",
                      controllerCode: api?.controllerCode || "",
                    })
                    onEdit && onEdit(null)
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
                    onEdit && onEdit(api._id || api.id)
                  }}
                  className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors"
                >
                  <Edit2 className="h-4 w-4 text-blue-400" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete && onDelete(api._id || api.id)
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
          <div className="space-y-3">
            <textarea
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              placeholder="Enter API description..."
              className="w-full bg-slate-800/50 text-white border border-slate-600/50 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              rows="2"
              onClick={(e) => e.stopPropagation()}
            />
            <textarea
              value={editData.controllerCode}
              onChange={(e) => setEditData({ ...editData, controllerCode: e.target.value })}
              placeholder="Enter controller code..."
              className="w-full bg-slate-800/50 text-white border border-slate-600/50 rounded-lg px-3 py-2 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              rows="4"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
        {!isEditing && (
          <div onClick={() => onClick && onClick(api)} className="flex items-center justify-end mt-3">
            <div className="flex items-center space-x-1 text-slate-400 group-hover:text-emerald-400 transition-colors">
              <Eye className="h-4 w-4" />
              <ChevronRight className="h-4 w-4" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ApiCard
