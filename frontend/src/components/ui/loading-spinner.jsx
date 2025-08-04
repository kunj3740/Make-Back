"use client"

const LoadingSpinner = ({ message = "Loading", subtitle = "Please wait..." }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-cyan-300 rounded-full animate-spin animate-reverse"></div>
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-1">{message}</h3>
          <p className="text-slate-400 text-sm">{subtitle}</p>
        </div>
      </div>
    </div>
  )
}

export default LoadingSpinner
