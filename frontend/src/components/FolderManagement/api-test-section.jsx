"use client"

import { useState, useEffect } from "react"
import { Play, Copy, History, Plus, Trash2, Key, Edit3, Clock, CheckCircle, AlertCircle } from "lucide-react"

const ApiTestSection = ({ api }) => {
  const [baseUrl, setBaseUrl] = useState("http://localhost:3000")
  const [showBaseUrlEdit, setShowBaseUrlEdit] = useState(false)
  const [tempBaseUrl, setTempBaseUrl] = useState(baseUrl)

  const [testRequest, setTestRequest] = useState({
    method: api?.method || "GET",
    endpoint: api?.endpoint || "",
    headers: [{ key: "Content-Type", value: "application/json", enabled: true }],
    body: "",
    params: [],
    auth: {
      type: "none",
      token: "",
      username: "",
      password: "",
      apiKey: "",
      apiKeyLocation: "header",
      apiKeyName: "X-API-Key",
    },
  })

  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const [activeTab, setActiveTab] = useState("params")

  useEffect(() => {
    if (api) {
      const testCase = api.testCases && api.testCases.length > 0 ? api.testCases[0] : null

      setTestRequest((prev) => ({
        ...prev,
        method: api.method || "GET",
        endpoint: api.endpoint || "",
        params:
          api.documentation?.parameters
            ?.filter((p) => p.location === "query")
            .map((p) => ({
              key: p.name,
              value: p.example || "",
              enabled: p.required || false,
              description: p.description,
            })) || [],
        body: testCase?.input
          ? (() => {
              const cleanInput = { ...testCase.input }
              if (cleanInput._id) {
                delete cleanInput._id
              }
              return JSON.stringify(cleanInput, null, 2)
            })()
          : (api.method === "POST" || api.method === "PUT") && api.documentation?.requestBody
            ? JSON.stringify(api.documentation.requestBody, null, 2)
            : "",
      }))

      if (api.documentation?.parameters) {
        const headerParams = api.documentation.parameters.filter((p) => p.location === "header")
        if (headerParams.length > 0) {
          setTestRequest((prev) => ({
            ...prev,
            headers: [
              { key: "Content-Type", value: "application/json", enabled: true },
              ...headerParams.map((p) => ({
                key: p.name,
                value: p.example || "",
                enabled: p.required || false,
                description: p.description,
              })),
            ],
          }))
        }
      }
    }
  }, [api])

  const getMethodColor = (method) => {
    switch (method) {
      case "GET":
        return "bg-emerald-600 text-white hover:bg-emerald-700"
      case "POST":
        return "bg-orange-600 text-white hover:bg-orange-700"
      case "PUT":
        return "bg-blue-600 text-white hover:bg-blue-700"
      case "DELETE":
        return "bg-red-600 text-white hover:bg-red-700"
      case "PATCH":
        return "bg-purple-600 text-white hover:bg-purple-700"
      default:
        return "bg-slate-600 text-white hover:bg-slate-700"
    }
  }

  const getMethodBadgeColor = (method) => {
    switch (method) {
      case "GET":
        return "bg-emerald-900/30 text-emerald-300 border-emerald-800"
      case "POST":
        return "bg-orange-900/30 text-orange-300 border-orange-800"
      case "PUT":
        return "bg-blue-900/30 text-blue-300 border-blue-800"
      case "DELETE":
        return "bg-red-900/30 text-red-300 border-red-800"
      case "PATCH":
        return "bg-purple-900/30 text-purple-300 border-purple-800"
      default:
        return "bg-slate-700/50 text-slate-300 border-slate-600"
    }
  }

  const updateBaseUrl = () => {
    setBaseUrl(tempBaseUrl)
    setShowBaseUrlEdit(false)
  }

  const cancelBaseUrlEdit = () => {
    setTempBaseUrl(baseUrl)
    setShowBaseUrlEdit(false)
  }

  useEffect(() => {
    setTestRequest((prev) => ({
      ...prev,
      baseUrl: baseUrl,
    }))
  }, [baseUrl])

  const addParam = () => {
    setTestRequest((prev) => ({
      ...prev,
      params: [...prev.params, { key: "", value: "", enabled: true, description: "" }],
    }))
  }

  const updateParam = (index, field, value) => {
    setTestRequest((prev) => ({
      ...prev,
      params: prev.params.map((param, i) => (i === index ? { ...param, [field]: value } : param)),
    }))
  }

  const removeParam = (index) => {
    setTestRequest((prev) => ({
      ...prev,
      params: prev.params.filter((_, i) => i !== index),
    }))
  }

  const addHeader = () => {
    setTestRequest((prev) => ({
      ...prev,
      headers: [...prev.headers, { key: "", value: "", enabled: true, description: "" }],
    }))
  }

  const updateHeader = (index, field, value) => {
    setTestRequest((prev) => ({
      ...prev,
      headers: prev.headers.map((header, i) => (i === index ? { ...header, [field]: value } : header)),
    }))
  }

  const removeHeader = (index) => {
    setTestRequest((prev) => ({
      ...prev,
      headers: prev.headers.filter((_, i) => i !== index),
    }))
  }

  const sendRequest = async () => {
    setLoading(true)
    const startTime = Date.now()

    try {
      const fullUrl = baseUrl.endsWith("/")
        ? baseUrl + testRequest.endpoint.replace(/^\//, "")
        : baseUrl + (testRequest.endpoint.startsWith("/") ? testRequest.endpoint : "/" + testRequest.endpoint)

      const url = new URL(fullUrl)

      testRequest.params.forEach((param) => {
        if (param.enabled && param.key && param.value) {
          url.searchParams.append(param.key, param.value)
        }
      })

      if (testRequest.auth.type === "apikey" && testRequest.auth.apiKeyLocation === "query") {
        url.searchParams.append(testRequest.auth.apiKeyName, testRequest.auth.apiKey)
      }

      const headers = {}
      testRequest.headers.forEach((header) => {
        if (header.enabled && header.key && header.value) {
          headers[header.key] = header.value
        }
      })

      if (testRequest.auth.type === "bearer" && testRequest.auth.token) {
        headers["Authorization"] = `Bearer ${testRequest.auth.token}`
      } else if (testRequest.auth.type === "basic" && testRequest.auth.username && testRequest.auth.password) {
        const credentials = btoa(`${testRequest.auth.username}:${testRequest.auth.password}`)
        headers["Authorization"] = `Basic ${credentials}`
      } else if (testRequest.auth.type === "apikey" && testRequest.auth.apiKeyLocation === "header") {
        headers[testRequest.auth.apiKeyName] = testRequest.auth.apiKey
      }

      const options = {
        method: testRequest.method,
        headers,
      }

      if (testRequest.method !== "GET" && testRequest.body) {
        options.body = testRequest.body
      }

      const response = await fetch(url.toString(), options)
      const endTime = Date.now()
      const duration = endTime - startTime

      let responseData
      const contentType = response.headers.get("content-type")

      if (contentType && contentType.includes("application/json")) {
        responseData = await response.json()
      } else {
        responseData = await response.text()
      }

      const responseObj = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData,
        duration,
        timestamp: new Date().toISOString(),
      }

      setResponse(responseObj)

      const historyItem = {
        id: Date.now(),
        request: { ...testRequest, baseUrl },
        response: responseObj,
        timestamp: new Date().toISOString(),
      }

      setHistory((prev) => [historyItem, ...prev.slice(0, 9)])
    } catch (error) {
      const errorResponse = {
        status: 0,
        statusText: "Network Error",
        headers: {},
        data: { error: error.message },
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      }

      setResponse(errorResponse)
    } finally {
      setLoading(false)
    }
  }

  const copyResponse = () => {
    if (response) {
      navigator.clipboard.writeText(JSON.stringify(response.data, null, 2))
    }
  }

  const loadFromHistory = (historyItem) => {
    setTestRequest(historyItem.request)
    setBaseUrl(historyItem.request.baseUrl)
    setResponse(historyItem.response)
    setShowHistory(false)
  }

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return "text-emerald-300 bg-emerald-900/30 border-emerald-800"
    if (status >= 300 && status < 400) return "text-yellow-300 bg-yellow-900/30 border-yellow-800"
    if (status >= 400 && status < 500) return "text-orange-300 bg-orange-900/30 border-orange-800"
    if (status >= 500) return "text-red-300 bg-red-900/30 border-red-800"
    return "text-slate-300 bg-slate-700/50 border-slate-600"
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">API Testing Console</h1>
            <p className="text-slate-400 mt-1">Test your API endpoints with a professional interface</p>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
          >
            <History className="h-4 w-4" />
            <span className="font-medium">History</span>
          </button>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-lg">
          {/* Request URL Builder */}
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center space-x-3">
              <select
                value={testRequest.method}
                onChange={(e) => setTestRequest((prev) => ({ ...prev, method: e.target.value }))}
                className={`px-4 py-2 rounded-lg font-semibold text-sm border-0 focus:ring-2 focus:ring-emerald-500/50 ${getMethodColor(testRequest.method)}`}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
              </select>

              <div className="flex-1 flex border border-slate-600 rounded-lg overflow-hidden bg-slate-700">
                <div className="relative">
                  {showBaseUrlEdit ? (
                    <div className="flex">
                      <input
                        type="text"
                        value={tempBaseUrl}
                        onChange={(e) => setTempBaseUrl(e.target.value)}
                        className="px-4 py-2 bg-slate-800 border-0 text-emerald-400 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        placeholder="http://localhost:3000"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") updateBaseUrl()
                          if (e.key === "Escape") cancelBaseUrlEdit()
                        }}
                        autoFocus
                      />
                      <button
                        onClick={updateBaseUrl}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      <button
                        onClick={cancelBaseUrlEdit}
                        className="px-3 py-2 bg-slate-600 hover:bg-slate-700 text-slate-300 transition-colors"
                      >
                        <AlertCircle className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowBaseUrlEdit(true)}
                      className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-emerald-400 font-mono text-sm transition-colors flex items-center space-x-2 group"
                    >
                      <span className="text-emerald-400 font-semibold">{baseUrl}</span>
                      <Edit3 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={testRequest.endpoint}
                  onChange={(e) => setTestRequest((prev) => ({ ...prev, endpoint: e.target.value }))}
                  className="flex-1 px-4 py-2 bg-transparent border-0 font-mono text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder="/api/v1/endpoint"
                />
              </div>

              <button
                onClick={sendRequest}
                disabled={loading || !testRequest.endpoint}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 disabled:text-slate-400 text-white font-semibold rounded-lg transition-colors flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    <span>Send</span>
                  </>
                )}
              </button>
            </div>

            <div className="mt-3 p-3 bg-slate-700 rounded-lg">
              <div className="text-sm font-mono text-slate-400">
                <span className="text-emerald-400 font-semibold">{baseUrl}</span>
                <span className="text-slate-100">{testRequest.endpoint}</span>
              </div>
            </div>
          </div>

          <div className="border-b border-slate-700">
            <nav className="flex">
              {[
                { id: "params", label: "Params", icon: null },
                { id: "auth", label: "Authorization", icon: Key },
                { id: "headers", label: "Headers", icon: null },
                { id: "body", label: "Body", icon: null },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-emerald-500 text-emerald-400 bg-emerald-500/10"
                      : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                  }`}
                >
                  {tab.icon && <tab.icon className="h-4 w-4" />}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "params" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Query Parameters</h3>
                  <button
                    onClick={addParam}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-lg transition-colors text-sm font-medium"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Parameter</span>
                  </button>
                </div>

                {testRequest.params.length > 0 ? (
                  <div className="space-y-3">
                    {testRequest.params.map((param, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg">
                        <input
                          type="checkbox"
                          checked={param.enabled}
                          onChange={(e) => updateParam(index, "enabled", e.target.checked)}
                          className="w-4 h-4 text-emerald-500 bg-slate-800 border-slate-600 rounded focus:ring-emerald-500/50"
                        />
                        <input
                          type="text"
                          value={param.key}
                          onChange={(e) => updateParam(index, "key", e.target.value)}
                          className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                          placeholder="Parameter name"
                        />
                        <input
                          type="text"
                          value={param.value}
                          onChange={(e) => updateParam(index, "value", e.target.value)}
                          className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                          placeholder="Parameter value"
                        />
                        <button
                          onClick={() => removeParam(index)}
                          className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <p>No query parameters added</p>
                    <p className="text-sm mt-1">Click "Add Parameter" to get started</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "auth" && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white">Authorization</h3>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">Type</label>
                  <select
                    value={testRequest.auth.type}
                    onChange={(e) =>
                      setTestRequest((prev) => ({
                        ...prev,
                        auth: { ...prev.auth, type: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  >
                    <option value="none">No Auth</option>
                    <option value="bearer">Bearer Token</option>
                    <option value="basic">Basic Auth</option>
                    <option value="apikey">API Key</option>
                  </select>
                </div>

                {testRequest.auth.type === "bearer" && (
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">Token</label>
                    <input
                      type="password"
                      value={testRequest.auth.token}
                      onChange={(e) =>
                        setTestRequest((prev) => ({
                          ...prev,
                          auth: { ...prev.auth, token: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      placeholder="Enter bearer token"
                    />
                  </div>
                )}

                {testRequest.auth.type === "basic" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-2">Username</label>
                      <input
                        type="text"
                        value={testRequest.auth.username}
                        onChange={(e) =>
                          setTestRequest((prev) => ({
                            ...prev,
                            auth: { ...prev.auth, username: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        placeholder="Username"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-2">Password</label>
                      <input
                        type="password"
                        value={testRequest.auth.password}
                        onChange={(e) =>
                          setTestRequest((prev) => ({
                            ...prev,
                            auth: { ...prev.auth, password: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        placeholder="Password"
                      />
                    </div>
                  </div>
                )}

                {testRequest.auth.type === "apikey" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-200 mb-2">Key</label>
                        <input
                          type="text"
                          value={testRequest.auth.apiKeyName}
                          onChange={(e) =>
                            setTestRequest((prev) => ({
                              ...prev,
                              auth: { ...prev.auth, apiKeyName: e.target.value },
                            }))
                          }
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                          placeholder="X-API-Key"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-200 mb-2">Add to</label>
                        <select
                          value={testRequest.auth.apiKeyLocation}
                          onChange={(e) =>
                            setTestRequest((prev) => ({
                              ...prev,
                              auth: { ...prev.auth, apiKeyLocation: e.target.value },
                            }))
                          }
                          className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        >
                          <option value="header">Header</option>
                          <option value="query">Query Params</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-2">Value</label>
                      <input
                        type="password"
                        value={testRequest.auth.apiKey}
                        onChange={(e) =>
                          setTestRequest((prev) => ({
                            ...prev,
                            auth: { ...prev.auth, apiKey: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                        placeholder="Enter API key"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "headers" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Headers</h3>
                  <button
                    onClick={addHeader}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-lg transition-colors text-sm font-medium"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Header</span>
                  </button>
                </div>

                {testRequest.headers.length > 0 ? (
                  <div className="space-y-3">
                    {testRequest.headers.map((header, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg">
                        <input
                          type="checkbox"
                          checked={header.enabled}
                          onChange={(e) => updateHeader(index, "enabled", e.target.checked)}
                          className="w-4 h-4 text-emerald-500 bg-slate-800 border-slate-600 rounded focus:ring-emerald-500/50"
                        />
                        <input
                          type="text"
                          value={header.key}
                          onChange={(e) => updateHeader(index, "key", e.target.value)}
                          className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                          placeholder="Header name"
                        />
                        <input
                          type="text"
                          value={header.value}
                          onChange={(e) => updateHeader(index, "value", e.target.value)}
                          className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                          placeholder="Header value"
                        />
                        <button
                          onClick={() => removeHeader(index)}
                          className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-slate-400">
                    <p>No headers added</p>
                    <p className="text-sm mt-1">Click "Add Header" to get started</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "body" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Request Body</h3>
                <textarea
                  value={testRequest.body}
                  onChange={(e) => setTestRequest((prev) => ({ ...prev, body: e.target.value }))}
                  className="w-full h-64 px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg font-mono text-sm text-slate-100 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  placeholder={
                    testRequest.method === "GET"
                      ? "Request body is not applicable for GET requests"
                      : "Enter request body (JSON, XML, etc.)"
                  }
                  disabled={testRequest.method === "GET"}
                />
              </div>
            )}
          </div>
        </div>

        {showHistory && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-lg">
            <div className="p-6 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">Request History</h3>
            </div>
            <div className="p-6">
              {history.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => loadFromHistory(item)}
                      className="flex items-center justify-between p-4 bg-slate-700/50 hover:bg-slate-700 rounded-lg cursor-pointer transition-colors border border-slate-600/50"
                    >
                      <div className="flex items-center space-x-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold border ${getMethodBadgeColor(item.request.method)}`}
                        >
                          {item.request.method}
                        </span>
                        <span className="font-mono text-sm text-slate-100 truncate max-w-md">
                          {item.request.baseUrl}
                          {item.request.endpoint}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(item.response.status)}`}
                        >
                          {item.response.status}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-slate-400 text-sm">
                        <span className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{item.response.duration}ms</span>
                        </span>
                        <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No requests in history</p>
                  <p className="text-sm mt-1">Your API requests will appear here</p>
                </div>
              )}
            </div>
          </div>
        )}

        {response && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-lg">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h3 className="text-lg font-semibold text-white">Response</h3>
                  <span className={`px-3 py-1 rounded-lg font-semibold border ${getStatusColor(response.status)}`}>
                    {response.status} {response.statusText}
                  </span>
                  <span className="flex items-center space-x-1 text-slate-400 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>{response.duration}ms</span>
                  </span>
                </div>
                <button
                  onClick={copyResponse}
                  className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg transition-colors text-sm font-medium"
                >
                  <Copy className="h-4 w-4" />
                  <span>Copy Response</span>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Response Headers */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-3">Headers</h4>
                <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50">
                  <pre className="text-sm font-mono text-slate-100">
                    {Object.entries(response.headers).map(([key, value]) => (
                      <div key={key} className="mb-1">
                        <span className="text-emerald-400 font-semibold">{key}:</span> {value}
                      </div>
                    ))}
                  </pre>
                </div>
              </div>

              {/* Response Body */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-3">Body</h4>
                <div className="bg-slate-700/50 rounded-lg border border-slate-600/50 overflow-hidden">
                  <pre className="p-4 text-sm font-mono text-slate-100 overflow-x-auto max-h-96 overflow-y-auto">
                    {typeof response.data === "object" ? JSON.stringify(response.data, null, 2) : response.data}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ApiTestSection