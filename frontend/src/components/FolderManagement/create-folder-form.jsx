// "use client"

// const CreateFolderForm = ({ newFolder, setNewFolder, onSubmit, onCancel, error }) => {
//   return (
//     <div className="mb-6">
//       <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
//         <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5 rounded-xl"></div>
//         <div className="relative">
//           <h3 className="text-lg font-bold text-white mb-4">Create New Folder</h3>
//           <div className="grid grid-cols-1 gap-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <label className="block text-sm font-medium text-slate-300">Folder Name *</label>
//                 <input
//                   type="text"
//                   placeholder="Enter folder name..."
//                   value={newFolder.name}
//                   onChange={(e) => setNewFolder({ ...newFolder, name: e.target.value })}
//                   className="w-full bg-slate-800/50 text-white border border-slate-700/50 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300 text-sm"
//                 />
//               </div>
//               <div className="space-y-2">
//                 <label className="block text-sm font-medium text-slate-300">Description</label>
//                 <input
//                   type="text"
//                   placeholder="Enter description..."
//                   value={newFolder.description}
//                   onChange={(e) => setNewFolder({ ...newFolder, description: e.target.value })}
//                   className="w-full bg-slate-800/50 text-white border border-slate-700/50 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300 text-sm"
//                 />
//               </div>
//             </div>
//             <div className="space-y-2">
//               <label className="block text-sm font-medium text-slate-300">Common Prompt</label>
//               <textarea
//                 placeholder="Enter common prompt for all APIs in this folder..."
//                 value={newFolder.commonPrompt || ""}
//                 onChange={(e) => setNewFolder({ ...newFolder, commonPrompt: e.target.value })}
//                 className="w-full bg-slate-800/50 text-white border border-slate-700/50 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300 text-sm resize-none"
//                 rows="3"
//               />
//             </div>
//           </div>
//           {error && (
//             <div className="mt-4 bg-gradient-to-r from-red-500/10 to-red-500/5 border border-red-500/20 rounded-lg p-3">
//               <p className="text-red-300 text-sm">{error}</p>
//             </div>
//           )}
//           <div className="flex space-x-3 mt-6">
//             <button
//               onClick={onSubmit}
//               className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-medium transition-all duration-300 transform hover:scale-105 shadow-lg shadow-emerald-500/25 text-sm"
//             >
//               Create Folder
//             </button>
//             <button
//               onClick={onCancel}
//               className="px-4 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-white font-medium transition-all duration-300 border border-slate-600/50 text-sm"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default CreateFolderForm
"use client"

const CreateFolderForm = ({ newFolder, setNewFolder, onSubmit, onCancel, error }) => {
  return (
    <div className="mb-6">
      <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5 rounded-xl"></div>
        <div className="relative">
          <h3 className="text-lg font-bold text-white mb-4">Create New Folder</h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Folder Name *</label>
                <input
                  type="text"
                  placeholder="Enter folder name..."
                  value={newFolder.name}
                  onChange={(e) => setNewFolder({ ...newFolder, name: e.target.value })}
                  className="w-full bg-slate-800/50 text-white border border-slate-700/50 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">Description</label>
                <input
                  type="text"
                  placeholder="Enter description..."
                  value={newFolder.description}
                  onChange={(e) => setNewFolder({ ...newFolder, description: e.target.value })}
                  className="w-full bg-slate-800/50 text-white border border-slate-700/50 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300 text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Common Prompt</label>
              <textarea
                placeholder="Enter common prompt for all APIs in this folder..."
                value={newFolder.commonPrompt || ""}
                onChange={(e) => setNewFolder({ ...newFolder, commonPrompt: e.target.value })}
                className="w-full bg-slate-800/50 text-white border border-slate-700/50 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300 text-sm resize-none"
                rows="3"
              />
            </div>
          </div>
          {error && (
            <div className="mt-4 bg-gradient-to-r from-red-500/10 to-red-500/5 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}
          <div className="flex space-x-3 mt-6">
            <button
              onClick={onSubmit}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-medium transition-all duration-300 transform hover:scale-105 shadow-lg shadow-emerald-500/25 text-sm"
            >
              Create Folder
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-white font-medium transition-all duration-300 border border-slate-600/50 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateFolderForm
