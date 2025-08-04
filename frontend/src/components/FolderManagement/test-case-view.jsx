"use client"

import { Play, Check, FileCode } from "lucide-react"

const TestCaseView = ({ api }) => {
  const testCase = api.testCases && api.testCases.length > 0 ? api.testCases[0] : null

  const formatJson = (obj) => {
    if (!obj) return "{}"
    try {
      return JSON.stringify(obj, null, 2)
    } catch (e) {
      return "{}"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">Test Case</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full shadow-lg ${testCase ? "bg-emerald-500" : "bg-slate-500"}`}></div>
          <span className="text-sm text-slate-400 font-medium">
            {testCase ? "Test case available" : "No test case defined"}
          </span>
        </div>
      </div>
      {testCase ? (
        <div className="space-y-6 mt-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Test Input */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500 rounded-lg blur opacity-40"></div>
                  <div className="relative bg-emerald-500/20 p-2 rounded-lg border border-emerald-500/30">
                    <Play className="h-5 w-5 text-emerald-400" />
                  </div>
                </div>
                <h4 className="font-semibold text-white">Input</h4>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-xl blur"></div>
                <div className="relative bg-slate-900 rounded-xl border border-slate-700/50 overflow-hidden shadow-2xl">
                  <div className="bg-slate-800/50 px-4 py-2 border-b border-slate-700/50 flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg"></div>
                      <div className="w-2 h-2 rounded-full bg-yellow-500 shadow-lg"></div>
                      <div className="w-2 h-2 rounded-full bg-red-500 shadow-lg"></div>
                    </div>
                    <span className="text-slate-400 text-xs font-mono">input.json</span>
                  </div>
                  <pre
                    className="p-4 text-slate-300 font-mono text-xs overflow-x-auto leading-6"
                    style={{
                      fontFamily: "'JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', monospace",
                      fontSize: "12px",
                      lineHeight: "1.6",
                    }}
                  >
                    <code className="language-json">{formatJson(testCase.input)}</code>
                  </pre>
                </div>
              </div>
            </div>
            {/* Expected Output */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500 rounded-lg blur opacity-40"></div>
                  <div className="relative bg-blue-500/20 p-2 rounded-lg border border-blue-500/30">
                    <Check className="h-5 w-5 text-blue-400" />
                  </div>
                </div>
                <h4 className="font-semibold text-white">Expected Output</h4>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur"></div>
                <div className="relative bg-slate-900 rounded-xl border border-slate-700/50 overflow-hidden shadow-2xl">
                  <div className="bg-slate-800/50 px-4 py-2 border-b border-slate-700/50 flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full bg-green-500 shadow-lg"></div>
                      <div className="w-2 h-2 rounded-full bg-yellow-500 shadow-lg"></div>
                      <div className="w-2 h-2 rounded-full bg-red-500 shadow-lg"></div>
                    </div>
                    <span className="text-slate-400 text-xs font-mono">output.json</span>
                  </div>
                  <pre
                    className="p-4 text-slate-300 font-mono text-xs overflow-x-auto leading-6"
                    style={{
                      fontFamily: "'JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', monospace",
                      fontSize: "12px",
                      lineHeight: "1.6",
                    }}
                  >
                    <code className="language-json">{formatJson(testCase.expectedOutput)}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="relative mx-auto w-24 h-24 mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full blur opacity-20"></div>
            <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-full p-6 border border-slate-700/50">
              <FileCode className="h-12 w-12 text-slate-400 mx-auto" />
            </div>
          </div>
          <h4 className="text-lg font-bold text-white mb-2">No Test Case Available</h4>
          <p className="text-slate-400">This API doesn't have any test cases defined yet.</p>
        </div>
      )}
    </div>
  )
}

export default TestCaseView
