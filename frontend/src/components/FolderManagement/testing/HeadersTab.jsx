// import React from 'react';
// import { Plus, Trash2, FileText } from 'lucide-react';

// const HeadersTab = ({
//   headers,
//   onAddHeader,
//   onUpdateHeader,
//   onRemoveHeader,
// }) => {
//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div className="flex items-center space-x-3">
//           <div className="p-2 bg-indigo-500/10 rounded-lg">
//             <FileText className="h-5 w-5 text-indigo-400" />
//           </div>
//           <div>
//             <h3 className="text-xl font-bold text-white">Request Headers</h3>
//             <p className="text-slate-400 text-sm">Add custom headers to your HTTP request</p>
//           </div>
//         </div>
//         <button
//           onClick={onAddHeader}
//           className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 hover:from-emerald-500/30 hover:to-emerald-600/30 text-emerald-400 rounded-lg transition-all duration-200 text-sm font-semibold border border-emerald-500/30 hover:border-emerald-500/50 shadow-lg hover:shadow-emerald-500/10"
//         >
//           <Plus className="h-4 w-4" />
//           <span>Add Header</span>
//         </button>
//       </div>

//       {headers.length > 0 ? (
//         <div className="space-y-4">
//           {headers.map((header, index) => (
//             <div key={index} className="group p-4 bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-xl border border-slate-600/50 hover:border-slate-500/50 transition-all duration-200 backdrop-blur-sm shadow-lg">
//               <div className="flex items-center space-x-4">
//                 <div className="flex items-center">
//                   <input
//                     type="checkbox"
//                     checked={header.enabled}
//                     onChange={(e) => onUpdateHeader(index, "enabled", e.target.checked)}
//                     className="w-5 h-5 text-emerald-500 bg-slate-800 border-slate-600 rounded focus:ring-emerald-500/50 focus:ring-2"
//                   />
//                 </div>
//                 <input
//                   type="text"
//                   value={header.key}
//                   onChange={(e) => onUpdateHeader(index, "key", e.target.value)}
//                   className="flex-1 px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200 placeholder-slate-500"
//                   placeholder="Header name (e.g., Content-Type)"
//                 />
//                 <input
//                   type="text"
//                   value={header.value}
//                   onChange={(e) => onUpdateHeader(index, "value", e.target.value)}
//                   className="flex-1 px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200 placeholder-slate-500"
//                   placeholder="Header value (e.g., application/json)"
//                 />
//                 <button
//                   onClick={() => onRemoveHeader(index)}
//                   className="p-3 text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 hover:shadow-lg"
//                 >
//                   <Trash2 className="h-4 w-4" />
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : (
//         <div className="text-center py-16 text-slate-400">
//           <div className="p-4 bg-slate-800/30 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
//             <FileText className="h-10 w-10 text-slate-500" />
//           </div>
//           <p className="text-lg font-medium text-slate-300">No headers added</p>
//           <p className="text-sm mt-2">Click "Add Header" to get started</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default HeadersTab;
"use client"
import { Plus, Trash2, FileText } from "lucide-react"

const HeadersTab = ({ headers, onAddHeader, onUpdateHeader, onRemoveHeader }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            <FileText className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Request Headers</h3>
            <p className="text-slate-400 text-sm">Add custom headers to your HTTP request</p>
          </div>
        </div>
        <button
          onClick={onAddHeader}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 hover:from-emerald-500/30 hover:to-emerald-600/30 text-emerald-400 rounded-lg transition-all duration-200 text-sm font-semibold border border-emerald-500/30 hover:border-emerald-500/50 shadow-lg hover:shadow-emerald-500/10"
        >
          <Plus className="h-4 w-4" />
          <span>Add Header</span>
        </button>
      </div>

      {headers.length > 0 ? (
        <div className="space-y-4">
          {headers.map((header, index) => (
            <div
              key={index}
              className="group p-4 bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-xl border border-slate-600/50 hover:border-slate-500/50 transition-all duration-200 backdrop-blur-sm shadow-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={header.enabled}
                    onChange={(e) => onUpdateHeader(index, "enabled", e.target.checked)}
                    className="w-5 h-5 text-emerald-500 bg-slate-800 border-slate-600 rounded focus:ring-emerald-500/50 focus:ring-2"
                  />
                </div>
                <input
                  type="text"
                  value={header.key}
                  onChange={(e) => onUpdateHeader(index, "key", e.target.value)}
                  className="flex-1 px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200 placeholder-slate-500"
                  placeholder="Header name (e.g., Content-Type)"
                />
                <input
                  type="text"
                  value={header.value}
                  onChange={(e) => onUpdateHeader(index, "value", e.target.value)}
                  className="flex-1 px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200 placeholder-slate-500"
                  placeholder="Header value (e.g., application/json)"
                />
                <button
                  onClick={() => onRemoveHeader(index)}
                  className="p-3 text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 hover:shadow-lg"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-slate-400">
          <div className="p-4 bg-slate-800/30 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <FileText className="h-10 w-10 text-slate-500" />
          </div>
          <p className="text-lg font-medium text-slate-300">No headers added</p>
          <p className="text-sm mt-2">Click "Add Header" to get started</p>
        </div>
      )}
    </div>
  )
}

export default HeadersTab
