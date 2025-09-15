"use client"

import { useState, useEffect } from "react"
import { Edit2, Save, X, Terminal, Zap, Eye, Code, BookOpen, FileCode, Copy, AlertCircle, TestTube } from "lucide-react"
import TestCaseView from "./test-case-view"
import ApiTestSection from "./testing/api-test-section"

const ApiDetailView = ({ api, onUpdate, getMethodColor, loading, onAIUpdate }) => {
  const [activeTab, setActiveTab] = useState("overview")
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    name: api?.name || "",
    description: api?.description || "",
    method: api?.method || "GET",
    endpoint: api?.endpoint || "",
    controllerCode: api?.controllerCode || "",
    documentation: api?.documentation || { summary: "", parameters: [] },
  })

  useEffect(() => {
    if (api) {
      setEditData({
        name: api.name || "",
        description: api.description || "",
        method: api.method || "GET",
        endpoint: api.endpoint || "",
        controllerCode: api.controllerCode || "",
        documentation: api.documentation || { summary: "", parameters: [] },
      })
    }
  }, [api])

  const handleSave = () => {
    onUpdate(api._id, editData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditData({
      name: api.name || "",
      description: api.description || "",
      method: api.method || "GET",
      endpoint: api.endpoint || "",
      controllerCode: api.controllerCode || "",
      documentation: api.documentation || { summary: "", parameters: [] },
    })
    setIsEditing(false)
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-10 h-10 border-4 border-transparent border-t-emerald-300 rounded-full animate-spin animate-reverse"></div>
          </div>
          <p className="text-slate-400 text-sm">Loading API details...</p>
        </div>
      </div>
    )
  }

  if (!api) {
    return (
      <div className="text-center py-16">
        <div className="relative mx-auto w-24 h-24 mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-full blur opacity-20"></div>
          <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-full p-6 border border-slate-700/50">
            <AlertCircle className="h-12 w-12 text-slate-400 mx-auto" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-white mb-3">API not found</h3>
        <p className="text-slate-400">The requested API could not be loaded</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* API Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/20 via-blue-700/20 to-slate-800/20 rounded-2xl blur"></div>
        <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 ">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-slate-500/5 rounded-2xl"></div>
          <div className="relative flex items-start justify-between">
            <div className="flex items-center space-x-6 flex-1">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r  rounded-xl blur opacity-40"></div>
                  <div className="relative bg-gradient-to-br from-emerald-500/30 to-blue-500/30 p-4 rounded-xl border border-slate-700/50">
                    <Terminal className="h-10 w-10 text-emerald-400" />
                  </div>
                </div>
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="text-2xl font-bold bg-slate-800/50 text-white border border-slate-600/50 rounded-xl px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300"
                      placeholder="API Name"
                    />
                    <div className="flex space-x-3">
                      <select
                        value={editData.method}
                        onChange={(e) => setEditData({ ...editData, method: e.target.value })}
                        className="bg-slate-800/50 text-white border border-slate-600/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300"
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
                        className="bg-slate-800/50 text-white border border-slate-600/50 rounded-lg px-4 py-3 flex-1 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300"
                        placeholder="Endpoint"
                      />
                    </div>
                    <textarea
                      value={editData.description}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      className="w-full bg-slate-800/50 text-white border border-slate-600/50 rounded-lg px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300"
                      rows="2"
                      placeholder="API Description"
                    />
                  </div>
                ) : (
                  <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent mb-3 leading-tight">
                      {api.name}
                    </h1>
                    <div className="flex items-center space-x-4 mb-3">
                      <span
                        className={`px-4 py-2 rounded-lg font-bold border-2  ${getMethodColor(api.method)}`}
                      >
                        {api.method}
                      </span>
                      <code className="text-slate-300 bg-slate-800/50 px-4 py-2 rounded-lg font-mono border border-slate-700/50 shadow-lg">
                        {api.endpoint}
                      </code>
                    </div>
                    {api.description && <p className="text-slate-300 leading-relaxed max-w-3xl">{api.description}</p>}
                  </div>
                )}
              </div>
            </div>
            <div className="flex space-x-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="px-5 py-3 rounded-lg bg-gradient-to-r from-emerald-900 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold transition-all duration-300 transform hover:scale-105 shadow-xl shadow-emerald-500/25 text-sm"
                  >
                    <div className="flex items-center space-x-2">
                      <Save className="h-4 w-4" />
                      <span>Save</span>
                    </div>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-5 py-3 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-white font-semibold transition-all duration-300 border border-slate-600/50 shadow-xl text-sm"
                  >
                    <div className="flex items-center space-x-2">
                      <X className="h-4 w-4" />
                      <span>Cancel</span>
                    </div>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={onAIUpdate}
                    className="px-5 py-3 rounded-lg bg-gradient-to-r from-orange-800 to-orange-500 hover:from-orange-700 hover:to-orange-400 text-white font-semibold transition-all duration-300 transform hover:scale-105  text-sm"
                  >
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4" />
                      <span>AI Enhance</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-5 py-3 rounded-lg bg-gradient-to-r from-blue-800 to-blue-800 hover:from-blue-500 hover:to-blue-600 text-white font-semibold transition-all duration-300 transform hover:scale-105  text-sm"
                  >
                    <div className="flex items-center space-x-2">
                      <Edit2 className="h-4 w-4" />
                      <span>Manual Edit</span>
                    </div>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-800/50 to-slate-900/50 rounded-xl blur"></div>
        <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-2xl overflow-hidden">
          <div className="border-b border-slate-700/50 bg-slate-800/30">
            <nav className="flex space-x-0 px-6">
              {[
                { id: "overview", label: "Overview", icon: Eye },
                { id: "code", label: "Controller Code", icon: Code },
                { id: "documentation", label: "Documentation", icon: BookOpen },
                { id: "test", label: "Test", icon: TestTube },
                { id: "test-input", label: "Test Case", icon: FileCode },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-6 border-b-2 font-semibold text-sm transition-all duration-300 ${
                    activeTab === tab.id
                      ? "border-emerald-500 text-emerald-400 bg-emerald-500/10"
                      : "border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-700/30"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">API Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/20 to-blue-1000/20 rounded-xl "></div>
                      <div className="relative bg-gradient-to-br from-slate-700/30 to-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                        <label className="block text-sm font-medium text-slate-300 mb-2">Method</label>
                        <span
                          className={`inline-block px-4 py-2 rounded-lg font-bold border-2  ${getMethodColor(api.method)}`}
                        >
                          {api.method}
                        </span>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r  rounded-xl blur "></div>
                      <div className="relative bg-gradient-to-br from-slate-700/30 to-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                        <label className="block text-sm font-medium text-slate-300 mb-2">Endpoint</label>
                        <code className="text-slate-300 font-mono bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-600/50 ">
                          {api.endpoint}
                        </code>
                      </div>
                    </div>
                  </div>
                  {api.description && (
                    <div className="relative mt-4">
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/20 to-slate-900/20 rounded-xl blur"></div>
                      <div className="relative bg-gradient-to-br from-slate-700/30 to-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                        <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                        <p className="text-slate-300 leading-relaxed">{api.description}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Controller Code Tab */}
            {activeTab === "code" && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Controller Code</h3>
                  <button
                    onClick={() => copyToClipboard(api.controllerCode || "")}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white font-medium transition-all duration-300 transform hover:scale-105 shadow-xl text-sm"
                  >
                    <div className="flex items-center space-x-2">
                      <Copy className="h-4 w-4" />
                      <span>Copy Code</span>
                    </div>
                  </button>
                </div>
                {isEditing ? (
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl blur"></div>
                    <div className="relative bg-slate-900 rounded-xl border border-slate-700/50 overflow-hidden shadow-2xl">
                      <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-700/50 flex items-center space-x-3">
                        <div className="flex space-x-2">
                          <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-lg"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg"></div>
                        </div>
                        <span className="text-slate-400 text-sm font-mono">controller.js</span>
                        <div className="ml-auto flex items-center space-x-2">
                          <span className="text-xs text-orange-400 font-medium">Editing Mode</span>
                          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-lg"></div>
                        </div>
                      </div>
                      <textarea
                        value={editData.controllerCode}
                        onChange={(e) => setEditData({ ...editData, controllerCode: e.target.value })}
                        className="w-full bg-slate-900 text-slate-300 border-0 p-4 font-mono text-sm resize-none focus:outline-none focus:ring-0 leading-6"
                        rows="20"
                        placeholder="Enter controller code..."
                        style={{
                          fontFamily: "'JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', monospace",
                          fontSize: "13px",
                          lineHeight: "1.6",
                          tabSize: 2,
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-xl blur"></div>
                    <div className="relative bg-slate-900 rounded-xl border border-slate-700/50 overflow-hidden shadow-2xl">
                      <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-700/50 flex items-center space-x-3">
                        <div className="flex space-x-2">
                          <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-lg"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg"></div>
                        </div>
                        <span className="text-slate-400 text-sm font-mono">controller.js</span>
                        <div className="ml-auto flex items-center space-x-2">
                          <span className="text-xs text-emerald-400 font-medium">Read Only</span>
                          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg"></div>
                        </div>
                      </div>
                      <div className="relative group">
                        <pre
                          className="p-4 text-slate-300 font-mono text-sm overflow-x-auto leading-6 max-h-80 overflow-y-auto"
                          style={{
                            fontFamily: "'JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', monospace",
                            fontSize: "13px",
                            lineHeight: "1.6",
                          }}
                        >
                          <code className="language-javascript">
                            {api.controllerCode || "// No controller code provided"}
                          </code>
                        </pre>
                        <div className="absolute top-4 right-4">
                          <button
                            onClick={() => copyToClipboard(api.controllerCode || "")}
                            className="bg-slate-700/80 hover:bg-slate-600/80 text-white p-2 rounded-lg text-xs transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-lg"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Documentation Tab */}
            {activeTab === "documentation" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">API Documentation</h3>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-xl blur"></div>
                    <div className="relative bg-gradient-to-br from-slate-700/30 to-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                      <p className="text-slate-300 leading-relaxed">
                        {api.documentation?.summary || "No documentation summary provided"}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-4">Parameters</h3>
                  {api.documentation?.parameters && api.documentation.parameters.length > 0 ? (
                    <div className="space-y-3">
                      {api.documentation.parameters.map((param, index) => (
                        <div key={index} className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/20 to-emerald-900/20 rounded-xl blur"></div>
                          <div className="relative bg-gradient-to-br from-slate-900/30 to-slate-900/30 p-4 rounded-xl border border-slate-700/50">
                            <div className="flex items-center space-x-4 mb-2">
                              <code className="text-cyan-400 font-mono font-semibold bg-cyan-700/10 px-3 py-1 rounded-lg border border-cyan-500/20 shadow-lg">
                                {param.name}
                              </code>
                              <span className="text-slate-400">({param.type})</span>
                              {param.required && (
                                <span className="text-red-400 text-sm font-semibold bg-red-500/10 px-2 py-1 rounded border border-red-500/20 shadow-lg">
                                  Required
                                </span>
                              )}
                              <span className="text-xs bg-slate-600 text-slate-300 px-2 py-1 rounded-full font-medium shadow-lg">
                                {param.location}
                              </span>
                            </div>
                            <p className="text-slate-300 leading-relaxed">{param.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-600/20 to-slate-700/20 rounded-xl blur"></div>
                      <div className="relative bg-gradient-to-br from-slate-700/30 to-slate-800/30 p-8 rounded-xl border border-slate-700/50 text-center">
                        <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-400">No parameters documented</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Test Tab */}
            {activeTab === "test" && <ApiTestSection api={api} />}

            {/* Test Case Tab */}
            {activeTab === "test-input" && <TestCaseView api={api} />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApiDetailView
