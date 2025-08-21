
"use client"

import { useState, useEffect } from "react"
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
  useSandpack,
} from "@codesandbox/sandpack-react"
import { nightOwl } from "@codesandbox/sandpack-themes"

function CodeSync({ onCodeChange }) {
  const { sandpack } = useSandpack()

  useEffect(() => {
    const currentCode = sandpack.files[sandpack.activeFile].code
    onCodeChange(currentCode)
  }, [sandpack.files, sandpack.activeFile, onCodeChange])

  return null
}

export default function CodeEditorPreview() {
  const [mode, setMode] = useState("edit")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [pages, setPages] = useState([
    {
      id: 1,
      name: "Login Page",
      code: `import React from "react";
import "./styles.css";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 p-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Login
        </h1>
        <form className="space-y-4">
          <input 
            type="email" 
            placeholder="Email" 
            className="w-full p-3 border rounded-lg"
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full p-3 border rounded-lg"
          />
          <button className="w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}`,
    },
  ])
  const [activePageId, setActivePageId] = useState(1)
  const [newPageName, setNewPageName] = useState("")
  const [showNewPageInput, setShowNewPageInput] = useState(false)

  const activePage = pages.find((page) => page.id === activePageId) || pages[0]

  useEffect(() => {
    // Fetch default pages from API
    // fetch("http://localhost:8000/api/v1/frontend")
    //   .then((res) => res.json())
    //   .then((data) => {
    //     if (data.code) {
    //       setPages((prevPages) => prevPages.map((page) => (page.id === 1 ? { ...page, code: data.code } : page)))
    //     }
    //   })
    //   .catch((err) => console.log("[v0] API fetch error:", err))
  }, [])

  const handlePageSelect = (pageId) => {
    console.log("[v0] Switching to page:", pageId)
    setActivePageId(pageId)
    setMode("edit")
  }

  const handleCreatePage = () => {
    if (newPageName.trim()) {
      const newPage = {
        id: Date.now(),
        name: newPageName.trim(),
        code: `import React from "react";
import "./styles.css";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-500 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-2xl p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">
          ${newPageName}
        </h1>
        <p className="text-gray-600 text-lg text-center">
          Start building your ${newPageName.toLowerCase()} here!
        </p>
      </div>
    </div>
  );
}`,
      }
      setPages((prev) => [...prev, newPage])
      setActivePageId(newPage.id)
      setNewPageName("")
      setShowNewPageInput(false)
      setMode("edit")
    }
  }

  const handleCodeChange = (newCode) => {
    if (newCode !== activePage.code) {
      console.log("[v0] Code changed for page:", activePageId)
      setPages((prevPages) => prevPages.map((page) => (page.id === activePageId ? { ...page, code: newCode } : page)))
    }
  }

  const sandpackFiles = {
    "/App.js": activePage.code,
    "/styles.css": `@import url('https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css');`,
  }

  return (
    <div className="w-full max-w-7xl mx-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-md shadow-2xl border border-gray-700/50 overflow-hidden backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700/50 bg-gradient-to-r from-gray-800 via-gray-750 to-gray-800">
        <div className="flex items-center gap-3">
          <span className="ml-4 font-semibold text-lg bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Code Editor
          </span>
          <span className="ml-2 px-2 py-1 rounded bg-gray-700/50 text-gray-300 text-sm">{activePage?.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMode("edit")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              mode === "edit"
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25"
                : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white"
            }`}
          >
            Code
          </button>
          <button
            onClick={() => setMode("preview")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              mode === "preview"
                ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/25"
                : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white"
            }`}
          >
            Preview
          </button>
          <button
            onClick={() => setIsFullscreen(true)}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white transition-all"
          >
            Fullscreen
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r border-gray-700/50 bg-gradient-to-b from-gray-800/80 to-gray-900/80 p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-300 font-medium flex items-center gap-2">
              <span className="w-5 h-5">📄</span> Pages
            </span>
            <button
              onClick={() => setShowNewPageInput(true)}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:scale-110 transition-transform"
            >
              +
            </button>
          </div>

          {showNewPageInput && (
            <div className="flex flex-col gap-2 mb-4">
              <input
                type="text"
                value={newPageName}
                onChange={(e) => setNewPageName(e.target.value)}
                className="px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="New page name"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreatePage}
                  className="flex-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowNewPageInput(false)}
                  className="flex-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-200 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto space-y-2">
            {pages.map((page) => (
              <button
                key={page.id}
                onClick={() => handlePageSelect(page.id)}
                className={`w-full px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-all ${
                  activePageId === page.id
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/50"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${activePageId === page.id ? "bg-green-400" : "bg-gray-500"}`}
                  ></span>
                  {page.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Editor / Preview */}
        <div className="flex-1 bg-gradient-to-br from-gray-900/50 to-gray-800/50 p-4">
          <SandpackProvider
            key={`sandpack-${activePageId}`}
            theme={nightOwl}
            template="react"
            files={sandpackFiles}
            options={{
              activeFile: "/App.js",
              recompileMode: "immediate",
              recompileDelay: 0,
            }}
            customSetup={{
              dependencies: {
                react: "latest",
                "react-dom": "latest",
                tailwindcss: "latest",
              },
            }}
          >
            <CodeSync onCodeChange={handleCodeChange} />

            <div className="rounded-2xl overflow-hidden border border-gray-700/30 shadow-2xl h-[600px]">
              <SandpackLayout style={{ height: "100%" }}>
                {mode === "edit" && (
                  <SandpackCodeEditor
                    showTabs={false}
                    showLineNumbers
                    showInlineErrors
                    wrapContent
                    style={{
                      height: "100%",
                      fontSize: "14px",
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    }}
                    showRunButton={true}
                    closableTabs={false}
                  />
                )}
                {mode === "preview" && (
                  <SandpackPreview
                    showNavigator
                    showRefreshButton
                    showOpenInCodeSandbox
                    showSandpackErrorOverlay
                    style={{ height: "100%" }}
                  />
                )}
              </SandpackLayout>
            </div>
          </SandpackProvider>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-gray-700/50 bg-gradient-to-r from-gray-800 to-gray-750 text-sm text-gray-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            Ready
          </span>
          <span>React • JavaScript</span>
          <span>{pages.length} pages</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Tailwind CSS</span>
          <span className="text-xs bg-gray-700/50 px-2 py-1 rounded">
            {mode === "edit" ? "✏️ Editing" : "👁️ Preview"}
          </span>
        </div>
      </div>
    </div>
  )
}
