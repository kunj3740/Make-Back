"use client"

import { AlertCircle, X } from "lucide-react"

const ErrorAlert = ({ message, onClose }) => {
  return (
    <div className="mx-6 mt-4">
      <div className="relative bg-gradient-to-r from-red-500/10 via-red-500/5 to-red-500/10 border border-red-500/20 rounded-lg p-3 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="flex-1">
            <p className="text-red-300 font-medium text-sm">{message}</p>
          </div>
          <button onClick={onClose} className="flex-shrink-0 p-1 rounded-lg hover:bg-red-500/20 transition-colors">
            <X className="h-4 w-4 text-red-400" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ErrorAlert
