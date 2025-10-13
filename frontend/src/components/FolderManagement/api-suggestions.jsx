
// "use client"

// import { useState } from "react"
// import { Check, Loader2, Sparkles, X, ChevronRight, Zap } from "lucide-react"
// import axios from "axios"
// import { BACKEND_URL } from "../../config"

// const ApiSuggestions = ({ folder, suggestions, onComplete, onSkip, authToken, projectId, loading }) => {
//   const [apiStates, setApiStates] = useState({})
//   const [generatingApis, setGeneratingApis] = useState(new Set())

//   const checkDuplicateApiName = (name) => {
//     if (!folder.apis) return false
//     return folder.apis.some((api) => api.name.toLowerCase().trim() === name.toLowerCase().trim())
//   }

//   const generateAndCreateApi = async (suggestion) => {
//     const suggestionId = suggestion.id

//     // Set loading state
//     setGeneratingApis((prev) => new Set([...prev, suggestionId]))
//     setApiStates((prev) => ({ ...prev, [suggestionId]: "generating" }))

//     try {
//       if (checkDuplicateApiName(suggestion.name)) {
//         setApiStates((prev) => ({
//           ...prev,
//           [suggestionId]: "error",
//           [`${suggestionId}_error`]: `An API named "${suggestion.name}" already exists in this folder. Please choose a different name.`,
//         }))
//         return
//       }

//       // Step 1: Generate API using AI
//       const generateResponse = await axios.post(
//         `${BACKEND_URL}/api/ai/generate-api`,
//         {
//           prompt: `Create an API with name: "${suggestion.name}"${folder.description ? ` for ${folder.description}` : ""}${folder.commonPrompt ? `. Additional context: ${folder.commonPrompt}` : ""}`,
//           projectId: projectId,
//           folderId: folder._id,
//         },
//         {
//           headers: { Authorization: `Bearer ${authToken}` },
//         },
//       )
//       console.log(generateResponse.data)
//       if (!generateResponse.data.success) {
//         throw new Error("Failed to generate API")
//       }

//       const generatedAPI = generateResponse.data.api

//       if (checkDuplicateApiName(generatedAPI.name)) {
//         setApiStates((prev) => ({
//           ...prev,
//           [suggestionId]: "error",
//           [`${suggestionId}_error`]: `Generated API name "${generatedAPI.name}" already exists in this folder. Try regenerating or use a different suggestion.`,
//         }))
//         return
//       }

//       // Step 2: Create the API in the folder
//       const createResponse = await axios.post(`${BACKEND_URL}/api/v1/folders/${folder._id}/api`, generatedAPI, {
//         headers: { Authorization: `Bearer ${authToken}` },
//       })

//       // Update folder with new API
//       const updatedFolder = {
//         ...folder,
//         apis: [...(folder.apis || []), createResponse.data.data],
//       }

//       // Set success state
//       setApiStates((prev) => ({ ...prev, [suggestionId]: "completed" }))

//       // Update the folder reference for subsequent API creations
//       folder.apis = updatedFolder.apis
//     } catch (error) {
//       console.error(`Error generating API "${suggestion.name}":`, error)

//       let errorMessage = "Failed to generate API"
//       if (
//         error.response?.status === 409 ||
//         error.response?.data?.message?.includes("duplicate") ||
//         error.response?.data?.message?.includes("already exists")
//       ) {
//         errorMessage = `An API named "${suggestion.name}" already exists. Please try a different name.`
//       } else if (error.response?.data?.error) {
//         errorMessage = error.response.data.error
//       }

//       setApiStates((prev) => ({
//         ...prev,
//         [suggestionId]: "error",
//         [`${suggestionId}_error`]: errorMessage,
//       }))
//     } finally {
//       setGeneratingApis((prev) => {
//         const newSet = new Set(prev)
//         newSet.delete(suggestionId)
//         return newSet
//       })
//     }
//   }

//   const handleApiToggle = async (suggestion) => {
//     const suggestionId = suggestion.id
//     const currentState = apiStates[suggestionId]

//     if (currentState === "generating" || currentState === "completed") {
//       return // Don't allow toggling if already processing or completed
//     }

//     await generateAndCreateApi(suggestion)
//   }

//   const handleComplete = () => {
//     onComplete(folder)
//   }

//   const getApiStateIcon = (suggestionId) => {
//     const state = apiStates[suggestionId]

//     switch (state) {
//       case "generating":
//         return <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
//       case "completed":
//         return <Check className="h-4 w-4 text-emerald-400" />
//       case "error":
//         return <X className="h-4 w-4 text-red-400" />
//       default:
//         return (
//           <div className="w-4 h-4 border-2 border-slate-600 rounded-sm hover:border-cyan-400 transition-colors"></div>
//         )
//     }
//   }

//   const getApiStateClass = (suggestionId) => {
//     const state = apiStates[suggestionId]

//     switch (state) {
//       case "generating":
//         return "bg-blue-500/10 border-blue-500/30 cursor-not-allowed"
//       case "completed":
//         return "bg-emerald-500/10 border-emerald-500/30 cursor-default"
//       case "error":
//         return "bg-red-500/10 border-red-500/30 cursor-pointer hover:bg-red-500/20"
//       default:
//         return "hover:bg-slate-700/30 cursor-pointer"
//     }
//   }

//   const getApiErrorMessage = (suggestionId) => {
//     return apiStates[`${suggestionId}_error`] || "Failed to create. Click to retry"
//   }

//   const completedCount = Object.values(apiStates).filter((state) => state === "completed").length
//   const totalSuggestions = suggestions.length

//   if (loading) {
//     return (
//       <div className="mb-6">
//         <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8">
//           <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-cyan-500/5 rounded-xl"></div>
//           <div className="relative text-center">
//             <div className="flex items-center justify-center mb-4">
//               <div className="relative">
//                 <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-400 rounded-full animate-spin"></div>
//                 <div className="absolute inset-0 w-8 h-8 border-4 border-transparent border-t-purple-300 rounded-full animate-spin animate-reverse"></div>
//               </div>
//             </div>
//             <h3 className="text-lg font-bold text-white mb-2">Generating API Suggestions</h3>
//             <p className="text-slate-400 text-sm">AI is analyzing your folder to suggest relevant APIs...</p>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="mb-6">
//       <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
//         <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-cyan-500/5 rounded-xl"></div>
//         <div className="relative">
//           {/* Header */}
//           <div className="flex items-center justify-between mb-6">
//             <div className="flex items-center space-x-3">
//               <div className="relative">
//                 <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg blur opacity-30"></div>
//                 <div className="relative bg-gradient-to-br from-purple-500/20 to-cyan-500/20 p-3 rounded-lg border border-slate-700/50">
//                   <Sparkles className="h-6 w-6 text-purple-400" />
//                 </div>
//               </div>
//               <div>
//                 <h3 className="text-lg font-bold text-white">AI Generated API Suggestions</h3>
//                 <p className="text-slate-400 text-sm">
//                   For folder: <span className="text-cyan-400 font-medium">{folder.name}</span>
//                   {completedCount > 0 && (
//                     <span className="ml-2 text-emerald-400">
//                       ({completedCount}/{totalSuggestions} created)
//                     </span>
//                   )}
//                 </p>
//               </div>
//             </div>
//             <div className="flex space-x-2">
//               <button
//                 onClick={onSkip}
//                 className="px-4 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-white font-medium transition-all duration-300 border border-slate-600/50 text-sm"
//               >
//                 Skip
//               </button>
//               <button
//                 onClick={handleComplete}
//                 className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-medium transition-all duration-300 transform hover:scale-105 shadow-lg shadow-emerald-500/25 text-sm"
//               >
//                 <div className="flex items-center space-x-2">
//                   <Check className="h-4 w-4" />
//                   <span>Complete</span>
//                 </div>
//               </button>
//             </div>
//           </div>

//           {/* Progress Bar */}
//           {completedCount > 0 && (
//             <div className="mb-6">
//               <div className="flex items-center justify-between mb-2">
//                 <span className="text-sm text-slate-300">Progress</span>
//                 <span className="text-sm text-slate-300">
//                   {completedCount}/{totalSuggestions}
//                 </span>
//               </div>
//               <div className="w-full bg-slate-700/50 rounded-full h-2">
//                 <div
//                   className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
//                   style={{ width: `${(completedCount / totalSuggestions) * 100}%` }}
//                 ></div>
//               </div>
//             </div>
//           )}

//           {/* API Suggestions List */}
//           <div className="space-y-2">
//             <h4 className="text-sm font-medium text-slate-300 mb-3">Select APIs to generate and create:</h4>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//               {suggestions.map((suggestion) => {
//                 const suggestionId = suggestion.id
//                 const state = apiStates[suggestionId]

//                 return (
//                   <div
//                     key={suggestionId}
//                     onClick={() => handleApiToggle(suggestion)}
//                     className={`relative group p-4 rounded-lg border border-slate-700/50 transition-all duration-300 ${getApiStateClass(suggestionId)}`}
//                   >
//                     <div className="flex items-center space-x-3">
//                       <div className="flex-shrink-0">{getApiStateIcon(suggestionId)}</div>
//                       <div className="flex-1 min-w-0">
//                         <h5 className="text-white font-medium text-sm truncate">{suggestion.name}</h5>
//                         {state === "generating" && <p className="text-blue-400 text-xs mt-1">Generating API...</p>}
//                         {state === "completed" && (
//                           <p className="text-emerald-400 text-xs mt-1">API created successfully</p>
//                         )}
//                         {state === "error" && (
//                           <p className="text-red-400 text-xs mt-1">{getApiErrorMessage(suggestionId)}</p>
//                         )}
//                       </div>
//                       {state !== "generating" && state !== "completed" && (
//                         <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-cyan-400 transition-colors opacity-0 group-hover:opacity-100" />
//                       )}
//                       {state === "generating" && <Zap className="h-4 w-4 text-blue-400 animate-pulse" />}
//                     </div>
//                   </div>
//                 )
//               })}
//             </div>
//           </div>

//           {/* Instructions */}
//           <div className="mt-6 p-4 bg-gradient-to-r from-slate-700/20 to-slate-800/20 rounded-lg border border-slate-700/30">
//             <p className="text-slate-300 text-sm">
//               <strong>Instructions:</strong> Click on any API suggestion to generate and create it automatically. The AI
//               will create the complete API with endpoints, documentation, and test cases based on your folder's context.
//               <br />
//               <strong>Note:</strong> Duplicate API names within the same folder are automatically prevented.
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default ApiSuggestions
"use client"

import { useState } from "react"
import { Check, Loader2, Sparkles, X, ChevronRight, Zap } from "lucide-react"
import axios from "axios"
import { BACKEND_URL } from "../../config"

const ApiSuggestions = ({ folder, suggestions, onComplete, onSkip, authToken, projectId, loading }) => {
  const [apiStates, setApiStates] = useState({})
  const [generatingApis, setGeneratingApis] = useState(new Set())

  const checkDuplicateApiName = (name) => {
    if (!folder.apis) return false
    return folder.apis.some((api) => api.name.toLowerCase().trim() === name.toLowerCase().trim())
  }

  const generateAndCreateApi = async (suggestion) => {
    const suggestionId = suggestion.id

    // Set loading state
    setGeneratingApis((prev) => new Set([...prev, suggestionId]))
    setApiStates((prev) => ({ ...prev, [suggestionId]: "generating" }))

    try {
      if (checkDuplicateApiName(suggestion.name)) {
        setApiStates((prev) => ({
          ...prev,
          [suggestionId]: "error",
          [`${suggestionId}_error`]: `An API named "${suggestion.name}" already exists in this folder. Please choose a different name.`,
        }))
        return
      }

      // Step 1: Generate API using AI
      const generateResponse = await axios.post(
        `${BACKEND_URL}/api/ai/generate-api`,
        {
          prompt: `Create an API with name: "${suggestion.name}"${folder.description ? ` for ${folder.description}` : ""}${folder.commonPrompt ? `. Additional context: ${folder.commonPrompt}` : ""}`,
          projectId: projectId,
          folderId: folder._id,
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        },
      )
      console.log(generateResponse.data)
      if (!generateResponse.data.success) {
        throw new Error("Failed to generate API")
      }

      const generatedAPI = generateResponse.data.api

      if (checkDuplicateApiName(generatedAPI.name)) {
        setApiStates((prev) => ({
          ...prev,
          [suggestionId]: "error",
          [`${suggestionId}_error`]: `Generated API name "${generatedAPI.name}" already exists in this folder. Try regenerating or use a different suggestion.`,
        }))
        return
      }

      // Step 2: Create the API in the folder
      const createResponse = await axios.post(`${BACKEND_URL}/api/v1/folders/${folder._id}/api`, generatedAPI, {
        headers: { Authorization: `Bearer ${authToken}` },
      })

      // Update folder with new API
      const updatedFolder = {
        ...folder,
        apis: [...(folder.apis || []), createResponse.data.data],
      }

      // Set success state
      setApiStates((prev) => ({ ...prev, [suggestionId]: "completed" }))

      // Update the folder reference for subsequent API creations
      folder.apis = updatedFolder.apis
    } catch (error) {
      console.error(`Error generating API "${suggestion.name}":`, error)

      let errorMessage = "Failed to generate API"
      if (
        error.response?.status === 409 ||
        error.response?.data?.message?.includes("duplicate") ||
        error.response?.data?.message?.includes("already exists")
      ) {
        errorMessage = `An API named "${suggestion.name}" already exists. Please try a different name.`
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      }

      setApiStates((prev) => ({
        ...prev,
        [suggestionId]: "error",
        [`${suggestionId}_error`]: errorMessage,
      }))
    } finally {
      setGeneratingApis((prev) => {
        const newSet = new Set(prev)
        newSet.delete(suggestionId)
        return newSet
      })
    }
  }

  const handleApiToggle = async (suggestion) => {
    const suggestionId = suggestion.id
    const currentState = apiStates[suggestionId]

    if (currentState === "generating" || currentState === "completed") {
      return // Don't allow toggling if already processing or completed
    }

    await generateAndCreateApi(suggestion)
  }

  const handleComplete = () => {
    onComplete(folder)
  }

  const getApiStateIcon = (suggestionId) => {
    const state = apiStates[suggestionId]

    switch (state) {
      case "generating":
        return <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
      case "completed":
        return <Check className="h-4 w-4 text-emerald-400" />
      case "error":
        return <X className="h-4 w-4 text-red-400" />
      default:
        return (
          <div className="w-4 h-4 border-2 border-slate-600 rounded-sm hover:border-cyan-400 transition-colors"></div>
        )
    }
  }

  const getApiStateClass = (suggestionId) => {
    const state = apiStates[suggestionId]

    switch (state) {
      case "generating":
        return "bg-blue-500/10 border-blue-500/30 cursor-not-allowed"
      case "completed":
        return "bg-emerald-500/10 border-emerald-500/30 cursor-default"
      case "error":
        return "bg-red-500/10 border-red-500/30 cursor-pointer hover:bg-red-500/20"
      default:
        return "hover:bg-slate-700/30 cursor-pointer"
    }
  }

  const getApiErrorMessage = (suggestionId) => {
    return apiStates[`${suggestionId}_error`] || "Failed to create. Click to retry"
  }

  const hasInProgressApis = () => {
    return Object.values(apiStates).some((state) => state === "generating")
  }

  const completedCount = Object.values(apiStates).filter((state) => state === "completed").length
  const totalSuggestions = suggestions.length

  if (loading) {
    return (
      <div className="mb-6">
        <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-8">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-cyan-500/5 rounded-xl"></div>
          <div className="relative text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <div className="w-8 h-8 border-4 border-purple-500/30 border-t-purple-400 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-8 h-8 border-4 border-transparent border-t-purple-300 rounded-full animate-spin animate-reverse"></div>
              </div>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Generating API Suggestions</h3>
            <p className="text-slate-400 text-sm">AI is analyzing your folder to suggest relevant APIs...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-cyan-500/5 rounded-xl"></div>
        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg blur opacity-30"></div>
                <div className="relative bg-gradient-to-br from-purple-500/20 to-cyan-500/20 p-3 rounded-lg border border-slate-700/50">
                  <Sparkles className="h-6 w-6 text-purple-400" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">AI Generated API Suggestions</h3>
                <p className="text-slate-400 text-sm">
                  For folder: <span className="text-cyan-400 font-medium">{folder.name}</span>
                  {completedCount > 0 && (
                    <span className="ml-2 text-emerald-400">
                      ({completedCount}/{totalSuggestions} created)
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={onSkip}
                disabled={hasInProgressApis()}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 border text-sm ${
                  hasInProgressApis()
                    ? "bg-slate-700/30 text-slate-500 border-slate-700/30 cursor-not-allowed opacity-50"
                    : "bg-slate-700/50 hover:bg-slate-600/50 text-white border-slate-600/50"
                }`}
              >
                Skip
              </button>
              <button
                onClick={handleComplete}
                disabled={hasInProgressApis()}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 text-sm ${
                  hasInProgressApis()
                    ? "bg-slate-700/30 text-slate-500 border border-slate-700/30 cursor-not-allowed opacity-50"
                    : "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white transform hover:scale-105 shadow-lg shadow-emerald-500/25"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4" />
                  <span>Complete</span>
                </div>
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          {completedCount > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-300">Progress</span>
                <span className="text-sm text-slate-300">
                  {completedCount}/{totalSuggestions}
                </span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(completedCount / totalSuggestions) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* API Suggestions List */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-slate-300 mb-3">Select APIs to generate and create:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {suggestions.map((suggestion) => {
                const suggestionId = suggestion.id
                const state = apiStates[suggestionId]

                return (
                  <div
                    key={suggestionId}
                    onClick={() => handleApiToggle(suggestion)}
                    className={`relative group p-4 rounded-lg border border-slate-700/50 transition-all duration-300 ${getApiStateClass(suggestionId)}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">{getApiStateIcon(suggestionId)}</div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-white font-medium text-sm truncate">{suggestion.name}</h5>
                        {state === "generating" && <p className="text-blue-400 text-xs mt-1">Generating API...</p>}
                        {state === "completed" && (
                          <p className="text-emerald-400 text-xs mt-1">API created successfully</p>
                        )}
                        {state === "error" && (
                          <p className="text-red-400 text-xs mt-1">{getApiErrorMessage(suggestionId)}</p>
                        )}
                      </div>
                      {state !== "generating" && state !== "completed" && (
                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-cyan-400 transition-colors opacity-0 group-hover:opacity-100" />
                      )}
                      {state === "generating" && <Zap className="h-4 w-4 text-blue-400 animate-pulse" />}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-6 p-4 bg-gradient-to-r from-slate-700/20 to-slate-800/20 rounded-lg border border-slate-700/30">
            <p className="text-slate-300 text-sm">
              <strong>Instructions:</strong> Click on any API suggestion to generate and create it automatically. The AI
              will create the complete API with endpoints, documentation, and test cases based on your folder's context.
              <br />
              <strong>Note:</strong> Duplicate API names within the same folder are automatically prevented.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApiSuggestions