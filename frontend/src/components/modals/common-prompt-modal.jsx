"use client"

import { FileCode, X } from "lucide-react"

const CommonPromptModal = ({ isOpen, onClose, commonPrompt, setCommonPrompt, onUpdate, isUpdating, error, folder }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5 rounded-xl"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Common Prompt</h3>
              <p className="text-slate-400 text-sm mt-1">Set a common prompt for all APIs in this folder</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all duration-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-indigo-500/10 to-indigo-500/5 border border-indigo-500/20 rounded-lg p-3">
              <p className="text-indigo-300 text-sm">
                <strong>Folder:</strong> {folder?.name}
              </p>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Common Prompt *</label>
              <textarea
                value={commonPrompt}
                onChange={(e) => setCommonPrompt(e.target.value)}
                className="w-full bg-slate-800/50 text-white border border-slate-700/50 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300 text-sm"
                rows="4"
                placeholder="Enter a common prompt that will be applied to all APIs in this folder..."
              />
            </div>
            {error && (
              <div className="bg-gradient-to-r from-red-500/10 to-red-500/5 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}
            <div className="flex space-x-3 pt-4">
              <button
                onClick={onUpdate}
                disabled={isUpdating}
                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:from-indigo-800 disabled:to-indigo-700 text-white font-medium transition-all duration-300 transform hover:scale-105 shadow-lg shadow-indigo-500/25 text-sm"
              >
                {isUpdating ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Updating...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <FileCode className="h-4 w-4" />
                    <span>Update Prompt</span>
                  </div>
                )}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-white font-medium transition-all duration-300 border border-slate-600/50 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CommonPromptModal
