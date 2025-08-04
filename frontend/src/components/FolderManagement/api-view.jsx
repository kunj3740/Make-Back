"use client"

import { useState } from "react"
import { Globe, Sparkles } from "lucide-react"
import ApiCard from "./api-card"

const ApiView = ({ folder, apis, onApiClick, onApiUpdate, onApiDelete, getMethodColor, loading, onAIGenerate }) => {
  const [editingApi, setEditingApi] = useState(null)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-400 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-10 h-10 border-4 border-transparent border-t-purple-300 rounded-full animate-spin animate-reverse"></div>
          </div>
          <p className="text-slate-400 text-sm">Loading APIs...</p>
        </div>
      </div>
    )
  }

  if (apis.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="relative mx-auto w-24 h-24 mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur opacity-20"></div>
          <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-full p-6 border border-slate-700/50">
            <Globe className="h-12 w-12 text-slate-400 mx-auto" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-white mb-3">No APIs found</h3>
        <p className="text-slate-400 mb-6 max-w-md mx-auto">Generate your first API using our advanced AI system</p>
        <button
          onClick={onAIGenerate}
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-medium transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/25"
        >
          <div className="flex items-center space-x-2">
            <Sparkles className="h-4 w-4" />
            <span>Generate with AI</span>
          </div>
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {apis.map((api) => (
        <ApiCard
          key={api._id}
          api={api}
          onEdit={setEditingApi}
          onDelete={onApiDelete}
          onUpdate={onApiUpdate}
          onClick={onApiClick}
          isEditing={editingApi === api._id}
          getMethodColor={getMethodColor}
        />
      ))}
    </div>
  )
}

export default ApiView
