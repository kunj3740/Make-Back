// "use client"

// import { Check, Trash2, X } from "lucide-react"

// const AIPreviewModal = ({ isOpen, onClose, title, generatedAPI, onApply, getMethodColor, isUpdate = false }) => {
//   if (!isOpen) return null

//   return (
//     <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//       <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 w-full max-w-5xl mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
//         <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5 rounded-xl"></div>
//         <div className="relative">
//           <div className="flex items-center justify-between mb-6">
//             <div>
//               <h3 className="text-lg font-bold text-white">{title}</h3>
//               <p className="text-slate-400 text-sm mt-1">Review and approve the AI-generated API</p>
//             </div>
//             <button
//               onClick={onClose}
//               className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all duration-300"
//             >
//               <X className="h-5 w-5" />
//             </button>
//           </div>
//           <div
//             className={`${isUpdate ? "bg-gradient-to-r from-orange-500/10 to-orange-500/5 border-orange-500/20" : "bg-gradient-to-r from-cyan-500/10 to-cyan-500/5 border-cyan-500/20"} border rounded-lg p-3 mb-6`}
//           >
//             <p className={`${isUpdate ? "text-orange-300" : "text-cyan-300"} text-sm`}>
//               <strong>Preview:</strong> Review the {isUpdate ? "updated" : "generated"} API below. Click "Apply" to{" "}
//               {isUpdate ? "update" : "create"} this API, or "Discard" to cancel.
//             </p>
//           </div>
//           <div className="space-y-6">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 p-4 rounded-lg border border-slate-700/50">
//                 <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
//                 <p className="text-white font-semibold">{generatedAPI.name}</p>
//               </div>
//               <div className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 p-4 rounded-lg border border-slate-700/50">
//                 <label className="block text-sm font-medium text-slate-300 mb-2">Method & Endpoint</label>
//                 <div className="flex items-center space-x-3">
//                   <span
//                     className={`px-3 py-1 rounded-lg text-sm font-semibold border shadow-lg ${getMethodColor(generatedAPI.method)}`}
//                   >
//                     {generatedAPI.method}
//                   </span>
//                   <code className="text-slate-300 font-mono text-sm bg-slate-800/50 px-2 py-1 rounded">
//                     {generatedAPI.endpoint}
//                   </code>
//                 </div>
//               </div>
//             </div>
//             <div className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 p-4 rounded-lg border border-slate-700/50">
//               <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
//               <p className="text-slate-300 leading-relaxed text-sm">{generatedAPI.description}</p>
//             </div>
//             <div className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 p-4 rounded-lg border border-slate-700/50">
//               <label className="block text-sm font-medium text-slate-300 mb-3">Controller Code</label>
//               <div className="bg-slate-900 rounded-lg border border-slate-700/50 overflow-hidden">
//                 <div className="bg-slate-800/50 px-4 py-2 border-b border-slate-700/50 flex items-center space-x-2">
//                   <div className="flex space-x-1">
//                     <div className="w-2 h-2 rounded-full bg-red-500"></div>
//                     <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
//                     <div className="w-2 h-2 rounded-full bg-green-500"></div>
//                   </div>
//                   <span className="text-slate-400 text-xs font-mono">controller.js</span>
//                 </div>
//                 <pre
//                   className="p-4 text-slate-300 font-mono text-xs overflow-x-auto max-h-48 leading-relaxed"
//                   style={{
//                     fontFamily: "'JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', monospace",
//                   }}
//                 >
//                   <code>{generatedAPI.controllerCode}</code>
//                 </pre>
//               </div>
//             </div>
//             {generatedAPI.documentation && (
//               <div className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 p-4 rounded-lg border border-slate-700/50">
//                 <label className="block text-sm font-medium text-slate-300 mb-3">Documentation</label>
//                 <p className="text-slate-300 mb-4 leading-relaxed text-sm">{generatedAPI.documentation.summary}</p>
//                 {generatedAPI.documentation.parameters && generatedAPI.documentation.parameters.length > 0 && (
//                   <div>
//                     <h4 className="text-sm font-medium text-slate-300 mb-3">Parameters:</h4>
//                     <div className="space-y-2">
//                       {generatedAPI.documentation.parameters.map((param, index) => (
//                         <div key={index} className="flex items-center space-x-3 text-sm">
//                           <code className="text-cyan-400 font-mono bg-cyan-500/10 px-2 py-1 rounded">{param.name}</code>
//                           <span className="text-slate-400">({param.type})</span>
//                           {param.required && (
//                             <span className="text-red-400 text-xs bg-red-500/10 px-2 py-1 rounded">Required</span>
//                           )}
//                           <span className="text-slate-300">- {param.description}</span>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}
//             {generatedAPI.testCases && generatedAPI.testCases.length > 0 && (
//               <div className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 p-4 rounded-lg border border-slate-700/50">
//                 <label className="block text-sm font-medium text-slate-300 mb-3">Test Case</label>
//                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
//                   <div>
//                     <h4 className="text-white font-medium mb-2 text-sm">Input</h4>
//                     <pre className="bg-slate-900 text-slate-300 p-3 rounded text-xs overflow-x-auto font-mono border border-slate-700/50">
//                       <code>{JSON.stringify(generatedAPI.testCases[0]?.input || {}, null, 2)}</code>
//                     </pre>
//                   </div>
//                   <div>
//                     <h4 className="text-white font-medium mb-2 text-sm">Expected Output</h4>
//                     <pre className="bg-slate-900 text-slate-300 p-3 rounded text-xs overflow-x-auto font-mono border border-slate-700/50">
//                       <code>{JSON.stringify(generatedAPI.testCases[0]?.expectedOutput || {}, null, 2)}</code>
//                     </pre>
//                   </div>
//                 </div>
//               </div>
//             )}
//             <div className="flex space-x-3 pt-4">
//               <button
//                 onClick={onApply}
//                 className={`px-6 py-2 rounded-lg ${isUpdate ? "bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 shadow-orange-500/25" : "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-emerald-500/25"} text-white font-medium transition-all duration-300 transform hover:scale-105 shadow-lg text-sm`}
//               >
//                 <div className="flex items-center space-x-2">
//                   <Check className="h-4 w-4" />
//                   <span>Apply Changes</span>
//                 </div>
//               </button>
//               <button
//                 onClick={onClose}
//                 className="px-6 py-2 rounded-lg bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-medium transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-500/25 text-sm"
//               >
//                 <div className="flex items-center space-x-2">
//                   <Trash2 className="h-4 w-4" />
//                   <span>Discard</span>
//                 </div>
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default AIPreviewModal
"use client"

import { Check, Trash2, X, Package, Code2, FileText, TestTube } from "lucide-react"

const AIPreviewModal = ({ isOpen, onClose, title, generatedAPI, onApply, getMethodColor, isUpdate = false }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5 rounded-xl"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">{title}</h3>
              <p className="text-slate-400 text-sm mt-1">Review and approve the AI-generated API</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-all duration-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div
            className={`${isUpdate ? "bg-gradient-to-r from-orange-500/10 to-orange-500/5 border-orange-500/20" : "bg-gradient-to-r from-cyan-500/10 to-cyan-500/5 border-cyan-500/20"} border rounded-lg p-3 mb-6`}
          >
            <p className={`${isUpdate ? "text-orange-300" : "text-cyan-300"} text-sm`}>
              <strong>Preview:</strong> Review the {isUpdate ? "updated" : "generated"} API below. Click "Apply" to{" "}
              {isUpdate ? "update" : "create"} this API, or "Discard" to cancel.
            </p>
          </div>

          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 p-4 rounded-lg border border-slate-700/50">
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>API Name</span>
                </label>
                <p className="text-white font-semibold">{generatedAPI.name}</p>
              </div>
              
              <div className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 p-4 rounded-lg border border-slate-700/50">
                <label className="block text-sm font-medium text-slate-300 mb-2 flex items-center space-x-2">
                  <Code2 className="h-4 w-4" />
                  <span>Controller Function</span>
                </label>
                <code className="text-cyan-400 font-mono text-sm bg-slate-800/50 px-2 py-1 rounded">
                  {generatedAPI.controllerName}
                </code>
              </div>
            </div>

            {/* Method & Endpoint */}
            <div className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 p-4 rounded-lg border border-slate-700/50">
              <label className="block text-sm font-medium text-slate-300 mb-3">Method & Endpoint</label>
              <div className="flex items-center space-x-3">
                <span
                  className={`px-3 py-1 rounded-lg text-sm font-semibold border shadow-lg ${getMethodColor(generatedAPI.method)}`}
                >
                  {generatedAPI.method}
                </span>
                <code className="text-slate-300 font-mono text-sm bg-slate-800/50 px-3 py-2 rounded flex-1">
                  {generatedAPI.endpoint}
                </code>
              </div>
            </div>

            {/* Description */}
            <div className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 p-4 rounded-lg border border-slate-700/50">
              <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
              <p className="text-slate-300 leading-relaxed text-sm">{generatedAPI.description}</p>
            </div>

            {/* Imports */}
            {/* {generatedAPI.imports && generatedAPI.imports.length > 0 && (
              <div className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 p-4 rounded-lg border border-slate-700/50">
                <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center space-x-2">
                  <Package className="h-4 w-4" />
                  <span>Required Imports</span>
                </label>
                <div className="space-y-2">
                  {generatedAPI.imports.map((imp, index) => (
                    <div key={index} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg border border-slate-700/30">
                      <div className="flex items-center space-x-3">
                        <code className="text-cyan-400 font-mono text-sm">{imp.module}</code>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          imp.type === 'npm' 
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {imp.type}
                        </span>
                      </div>
                      <span className="text-slate-400 text-xs">{imp.version}</span>
                    </div>
                  ))}
                </div>
              </div>
            )} */}
            {generatedAPI.imports && generatedAPI.imports.length > 0 && (
              <div className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 p-4 rounded-lg border border-slate-700/50">
                <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center space-x-2">
                  <Package className="h-4 w-4" />
                  <span>Required Imports</span>
                </label>
                <div className="space-y-3">
                  {generatedAPI.imports.map((imp, index) => {
                    // Generate the proper import statement based on type
                    let importStatement = '';
                    
                    if (imp.type === 'npm' || imp.type === 'core') {
                      // For npm packages: const express = require('express');
                      // For core modules: const fs = require('fs');
                      const moduleName = imp.module.split('/').pop() || imp.module;
                      importStatement = `const ${moduleName} = require('${imp.module}');`;
                    } else if (imp.type === 'local') {
                      // For local files: const User = require('../models/User');
                      const fileName = imp.module.split('/').pop() || imp.module;
                      importStatement = `const ${fileName} = require('${imp.module}');`;
                    }
                    
                    return (
                      <div key={index} className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/30">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              imp.type === 'npm' 
                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                : imp.type === 'local'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                            }`}>
                              {imp.type}
                            </span>
                            <span className="text-slate-400 text-xs">{imp.version}</span>
                          </div>
                          <button
                            onClick={() => navigator.clipboard.writeText(importStatement)}
                            className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded hover:bg-slate-700/50 transition-colors"
                            title="Copy import statement"
                          >
                            Copy
                          </button>
                        </div>
                        <code className="text-cyan-300 font-mono text-sm bg-slate-900/50 px-3 py-2 rounded block w-full border border-slate-700/30">
                          {importStatement}
                        </code>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {/* Controller Code */}
            <div className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 p-4 rounded-lg border border-slate-700/50">
              <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center space-x-2">
                <Code2 className="h-4 w-4" />
                <span>Controller Code</span>
              </label>
              <div className="bg-slate-900 rounded-lg border border-slate-700/50 overflow-hidden">
                <div className="bg-slate-800/50 px-4 py-2 border-b border-slate-700/50 flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                  <span className="text-slate-400 text-xs font-mono">controller.js</span>
                </div>
                <pre
                  className="p-4 text-slate-300 font-mono text-xs overflow-x-auto max-h-64 leading-relaxed"
                  style={{
                    fontFamily: "'JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', monospace",
                  }}
                >
                  <code>{generatedAPI.controllerCode}</code>
                </pre>
              </div>
            </div>

            {/* Documentation */}
            {generatedAPI.documentation && (
              <div className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 p-4 rounded-lg border border-slate-700/50">
                <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>API Documentation</span>
                </label>
                <p className="text-slate-300 mb-4 leading-relaxed text-sm">{generatedAPI.documentation.summary}</p>
                
                {generatedAPI.documentation.parameters && generatedAPI.documentation.parameters.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-3">Parameters:</h4>
                    <div className="space-y-3">
                      {generatedAPI.documentation.parameters.map((param, index) => (
                        <div key={index} className="bg-slate-800/30 p-3 rounded-lg border border-slate-700/30">
                          <div className="flex items-center space-x-3 mb-2">
                            <code className="text-cyan-400 font-mono text-sm bg-cyan-500/10 px-2 py-1 rounded">
                              {param.name}
                            </code>
                            <span className="text-slate-400 text-sm">({param.type})</span>
                            <span className="text-slate-500 text-xs bg-slate-700/50 px-2 py-1 rounded">
                              {param.location}
                            </span>
                            {param.required && (
                              <span className="text-red-400 text-xs bg-red-500/10 px-2 py-1 rounded border border-red-500/20">
                                Required
                              </span>
                            )}
                          </div>
                          <p className="text-slate-300 text-sm">{param.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Test Cases */}
            {generatedAPI.testCases && generatedAPI.testCases.length > 0 && (
              <div className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 p-4 rounded-lg border border-slate-700/50">
                <label className="block text-sm font-medium text-slate-300 mb-3 flex items-center space-x-2">
                  <TestTube className="h-4 w-4" />
                  <span>Test Cases</span>
                </label>
                {generatedAPI.testCases.map((testCase, index) => (
                  <div key={index} className="mb-4 last:mb-0">
                    <div className="flex items-center space-x-2 mb-3">
                      <h4 className="text-white font-medium text-sm">{testCase.name}</h4>
                      <span className="text-slate-400 text-xs">- {testCase.description}</span>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-slate-300 font-medium mb-2 text-sm">Input</h5>
                        <pre className="bg-slate-900 text-slate-300 p-3 rounded text-xs overflow-x-auto font-mono border border-slate-700/50 max-h-40">
                          <code>{JSON.stringify(testCase.input || {}, null, 2)}</code>
                        </pre>
                      </div>
                      <div>
                        <h5 className="text-slate-300 font-medium mb-2 text-sm">Expected Output</h5>
                        <pre className="bg-slate-900 text-slate-300 p-3 rounded text-xs overflow-x-auto font-mono border border-slate-700/50 max-h-40">
                          <code>{JSON.stringify(testCase.expectedOutput || {}, null, 2)}</code>
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-6 border-t border-slate-700/50">
              <button
                onClick={onApply}
                className={`px-6 py-3 rounded-lg ${isUpdate ? "bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 shadow-orange-500/25" : "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-emerald-500/25"} text-white font-medium transition-all duration-300 transform hover:scale-105 shadow-lg text-sm`}
              >
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4" />
                  <span>Apply Changes</span>
                </div>
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-lg bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-medium transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-500/25 text-sm"
              >
                <div className="flex items-center space-x-2">
                  <Trash2 className="h-4 w-4" />
                  <span>Discard</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIPreviewModal