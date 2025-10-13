
import { useState, useEffect } from "react"
import { Zap } from "lucide-react"
import RequestBuilder from "./RequestBuilder"
import RequestTabs from "./RequestTabs"
import ResponseSection from "./ResponseSection"
import { AUTH_TYPES, API_KEY_LOCATIONS } from "../../../lib/utils"

const ApiTestSection = ({ api }) => {
  const [baseUrl, setBaseUrl] = useState("http://localhost:8001")
  const [showBaseUrlEdit, setShowBaseUrlEdit] = useState(false)
  const [tempBaseUrl, setTempBaseUrl] = useState(baseUrl)

  const [testRequest, setTestRequest] = useState({
    method: api?.method || "GET",
    endpoint: api?.endpoint || "/api/endpoint",
    headers: [{ key: "Content-Type", value: "application/json", enabled: true }],
    body: "",
    params: [],
    auth: {
      type: AUTH_TYPES.NONE,
      token: "",
      username: "",
      password: "",
      apiKey: "",
      apiKeyLocation: API_KEY_LOCATIONS.HEADER,
      apiKeyName: "X-API-Key",
    },
  })

  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("body")

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
              console.log("TestCase input:", testCase.input) // Debug log
              
              // Check if testCase.input has a 'body' property
              if (testCase.input.body) {
                // If there's a body property, use only that part
                const cleanBody = { ...testCase.input.body }
                if (cleanBody._id) {
                  delete cleanBody._id
                }
                const bodyString = JSON.stringify(cleanBody, null, 2)
                console.log("Using body property:", bodyString) // Debug log
                return bodyString
              } else {
                // If no body property, use the entire input (legacy support)
                const cleanInput = { ...testCase.input }
                if (cleanInput._id) {
                  delete cleanInput._id
                }
                // Remove params if it exists to avoid nested structure
                if (cleanInput.params) {
                  delete cleanInput.params
                }
                const inputString = JSON.stringify(cleanInput, null, 2)
                console.log("Using entire input:", inputString) // Debug log
                return inputString
              }
            })()
          : (api.method === "POST" || api.method === "PUT") && api.documentation?.requestBody
            ? JSON.stringify(api.documentation.requestBody, null, 2)
            : "",
      }))
      
      // Handle path parameters from test case
      if (testCase?.input?.params) {
        const pathParams = Object.entries(testCase.input.params).map(([key, value]) => ({
          key,
          value: String(value),
          enabled: true,
          description: `Path parameter from test case`,
        }))

        setTestRequest((prev) => ({
          ...prev,
          params: [
            ...prev.params,
            ...pathParams,
          ],
        }))
      }

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

  const updateBaseUrl = () => {
    setBaseUrl(tempBaseUrl)
    setShowBaseUrlEdit(false)
  }

  const cancelBaseUrlEdit = () => {
    setTempBaseUrl(baseUrl)
    setShowBaseUrlEdit(false)
  }

  const handleMethodChange = (method) => {
    setTestRequest((prev) => ({ ...prev, method }))
  }

  const handleEndpointChange = (endpoint) => {
    setTestRequest((prev) => ({ ...prev, endpoint }))
  }

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

  const handleAuthChange = (updates) => {
    setTestRequest((prev) => ({
      ...prev,
      auth: { ...prev.auth, ...updates },
    }))
  }

  const handleBodyChange = (body) => {
    setTestRequest((prev) => ({ ...prev, body }))
  }

  const sendRequest = async () => {
    setLoading(true)
    console.log( "Logging State" , testRequest)
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

      if (testRequest.auth.type === AUTH_TYPES.API_KEY && testRequest.auth.apiKeyLocation === API_KEY_LOCATIONS.QUERY) {
        url.searchParams.append(testRequest.auth.apiKeyName, testRequest.auth.apiKey)
      }

      const headers = {}
      testRequest.headers.forEach((header) => {
        if (header.enabled && header.key && header.value) {
          headers[header.key] = header.value
        }
      })

      if (testRequest.auth.type === AUTH_TYPES.BEARER && testRequest.auth.token) {
        headers["Authorization"] = `Bearer ${testRequest.auth.token}`
      } else if (testRequest.auth.type === AUTH_TYPES.BASIC && testRequest.auth.username && testRequest.auth.password) {
        const credentials = btoa(`${testRequest.auth.username}:${testRequest.auth.password}`)
        headers["Authorization"] = `Basic ${credentials}`
      } else if (
        testRequest.auth.type === AUTH_TYPES.API_KEY &&
        testRequest.auth.apiKeyLocation === API_KEY_LOCATIONS.HEADER
      ) {
        headers[testRequest.auth.apiKeyName] = testRequest.auth.apiKey
      }

      const options = {
        method: testRequest.method,
        headers,
      }

      // if (testRequest.method !== "GET" && testRequest.body) {
      //   console.log("Request body before sending:", testRequest.body) // Debug log
      //   // Ensure the body is properly formatted
      //   try {
      //     // Parse and re-stringify to ensure it's valid JSON
      //     const parsedBody = JSON.parse(testRequest.body)
      //     console.log("Parsed body:", parsedBody) // Debug log
      //     options.body = JSON.stringify(parsedBody)
      //     console.log("Final body being sent:", options.body) // Debug log
      //   } catch (error) {
      //     // If parsing fails, send as-is (might be plain text)
      //     console.log("Body parsing failed, sending as-is") // Debug log
      //     options.body = testRequest.body
      //   }
      // }
      if (testRequest.method !== "GET" && testRequest.body) {
        console.log("Request body before sending:", testRequest.body) // Debug log
        // Ensure the body is properly formatted
        try {
          // Parse the body
          const parsedBody = JSON.parse(testRequest.body)
          console.log("Parsed body:", parsedBody) // Debug log
          
          // Check if the parsed body has a 'body' wrapper and extract the actual content
          const actualBody = parsedBody.body ? parsedBody.body : parsedBody
          console.log("Actual body to send:", actualBody) // Debug log
          
          options.body = JSON.stringify(actualBody)
          console.log("Final body being sent:", options.body) // Debug log
        } catch (error) {
          // If parsing fails, send as-is (might be plain text)
          console.log("Body parsing failed, sending as-is") // Debug log
          options.body = testRequest.body
        }
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

  return (
    <div className=" bg-slate-900 text-slate-100">
      <div className="max-w-6xl mx-auto  space-y-4">
        

        {/* Main Interface */}
        <div className="bg-slate-800/60  border-slate-700/50  overflow-hidden">
          <RequestBuilder
            testRequest={testRequest}
            baseUrl={baseUrl}
            showBaseUrlEdit={showBaseUrlEdit}
            tempBaseUrl={tempBaseUrl}
            loading={loading}
            onMethodChange={handleMethodChange}
            onEndpointChange={handleEndpointChange}
            onBaseUrlEdit={setShowBaseUrlEdit}
            onTempBaseUrlChange={setTempBaseUrl}
            onBaseUrlUpdate={updateBaseUrl}
            onBaseUrlCancel={cancelBaseUrlEdit}
            onSendRequest={sendRequest}
          />

          <RequestTabs
            activeTab={activeTab}
            testRequest={testRequest}
            onTabChange={setActiveTab}
            onAddParam={addParam}
            onUpdateParam={updateParam}
            onRemoveParam={removeParam}
            onAddHeader={addHeader}
            onUpdateHeader={updateHeader}
            onRemoveHeader={removeHeader}
            onAuthChange={handleAuthChange}
            onBodyChange={handleBodyChange}
          />
        </div>

        {/* Response Section */}
        {response && <ResponseSection response={response} onCopyResponse={copyResponse} />}
      </div>
    </div>
  )
}

export default ApiTestSection