// import React, { useState, useEffect } from 'react';
// import { Zap } from 'lucide-react';
// import RequestBuilder from './RequestBuilder';
// import RequestTabs from './RequestTabs';
// import ResponseSection from './ResponseSection';
// import { AUTH_TYPES, API_KEY_LOCATIONS } from '../../../lib/utils';

// const ApiTestSection = ({ api }) => {
//   const [baseUrl, setBaseUrl] = useState("https://api.example.com");
//   const [showBaseUrlEdit, setShowBaseUrlEdit] = useState(false);
//   const [tempBaseUrl, setTempBaseUrl] = useState(baseUrl);

//   const [testRequest, setTestRequest] = useState({
//     method: api?.method || "GET",
//     endpoint: api?.endpoint || "",
//     headers: [{ key: "Content-Type", value: "application/json", enabled: true }],
//     body: "",
//     params: [],
//     auth: {
//       type: AUTH_TYPES.NONE,
//       token: "",
//       username: "",
//       password: "",
//       apiKey: "",
//       apiKeyLocation: API_KEY_LOCATIONS.HEADER,
//       apiKeyName: "X-API-Key",
//     },
//   });

//   const [response, setResponse] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [activeTab, setActiveTab] = useState("params");

//   useEffect(() => {
//     if (api) {
//       const testCase = api.testCases && api.testCases.length > 0 ? api.testCases[0] : null;

//       setTestRequest((prev) => ({
//         ...prev,
//         method: api.method || "GET",
//         endpoint: api.endpoint || "",
//         params:
//           api.documentation?.parameters
//             ?.filter((p) => p.location === "query")
//             .map((p) => ({
//               key: p.name,
//               value: p.example || "",
//               enabled: p.required || false,
//               description: p.description,
//             })) || [],
//         body: testCase?.input
//           ? (() => {
//               const cleanInput = { ...testCase.input };
//               if (cleanInput._id) {
//                 delete cleanInput._id;
//               }
//               return JSON.stringify(cleanInput, null, 2);
//             })()
//           : (api.method === "POST" || api.method === "PUT") && api.documentation?.requestBody
//             ? JSON.stringify(api.documentation.requestBody, null, 2)
//             : "",
//       }));

//       if (api.documentation?.parameters) {
//         const headerParams = api.documentation.parameters.filter((p) => p.location === "header");
//         if (headerParams.length > 0) {
//           setTestRequest((prev) => ({
//             ...prev,
//             headers: [
//               { key: "Content-Type", value: "application/json", enabled: true },
//               ...headerParams.map((p) => ({
//                 key: p.name,
//                 value: p.example || "",
//                 enabled: p.required || false,
//                 description: p.description,
//               })),
//             ],
//           }));
//         }
//       }
//     }
//   }, [api]);

//   const updateBaseUrl = () => {
//     setBaseUrl(tempBaseUrl);
//     setShowBaseUrlEdit(false);
//   };

//   const cancelBaseUrlEdit = () => {
//     setTempBaseUrl(baseUrl);
//     setShowBaseUrlEdit(false);
//   };

//   const handleMethodChange = (method) => {
//     setTestRequest((prev) => ({ ...prev, method }));
//   };

//   const handleEndpointChange = (endpoint) => {
//     setTestRequest((prev) => ({ ...prev, endpoint }));
//   };

//   const addParam = () => {
//     setTestRequest((prev) => ({
//       ...prev,
//       params: [...prev.params, { key: "", value: "", enabled: true, description: "" }],
//     }));
//   };

//   const updateParam = (index, field, value) => {
//     setTestRequest((prev) => ({
//       ...prev,
//       params: prev.params.map((param, i) => (i === index ? { ...param, [field]: value } : param)),
//     }));
//   };

//   const removeParam = (index) => {
//     setTestRequest((prev) => ({
//       ...prev,
//       params: prev.params.filter((_, i) => i !== index),
//     }));
//   };

//   const addHeader = () => {
//     setTestRequest((prev) => ({
//       ...prev,
//       headers: [...prev.headers, { key: "", value: "", enabled: true, description: "" }],
//     }));
//   };

//   const updateHeader = (index, field, value) => {
//     setTestRequest((prev) => ({
//       ...prev,
//       headers: prev.headers.map((header, i) => (i === index ? { ...header, [field]: value } : header)),
//     }));
//   };

//   const removeHeader = (index) => {
//     setTestRequest((prev) => ({
//       ...prev,
//       headers: prev.headers.filter((_, i) => i !== index),
//     }));
//   };

//   const handleAuthChange = (updates) => {
//     setTestRequest((prev) => ({
//       ...prev,
//       auth: { ...prev.auth, ...updates },
//     }));
//   };

//   const handleBodyChange = (body) => {
//     setTestRequest((prev) => ({ ...prev, body }));
//   };

//   const sendRequest = async () => {
//     setLoading(true);
//     const startTime = Date.now();

//     try {
//       const fullUrl = baseUrl.endsWith("/")
//         ? baseUrl + testRequest.endpoint.replace(/^\//, "")
//         : baseUrl + (testRequest.endpoint.startsWith("/") ? testRequest.endpoint : "/" + testRequest.endpoint);

//       const url = new URL(fullUrl);

//       testRequest.params.forEach((param) => {
//         if (param.enabled && param.key && param.value) {
//           url.searchParams.append(param.key, param.value);
//         }
//       });

//       if (testRequest.auth.type === AUTH_TYPES.API_KEY && testRequest.auth.apiKeyLocation === API_KEY_LOCATIONS.QUERY) {
//         url.searchParams.append(testRequest.auth.apiKeyName, testRequest.auth.apiKey);
//       }

//       const headers = {};
//       testRequest.headers.forEach((header) => {
//         if (header.enabled && header.key && header.value) {
//           headers[header.key] = header.value;
//         }
//       });

//       if (testRequest.auth.type === AUTH_TYPES.BEARER && testRequest.auth.token) {
//         headers["Authorization"] = `Bearer ${testRequest.auth.token}`;
//       } else if (testRequest.auth.type === AUTH_TYPES.BASIC && testRequest.auth.username && testRequest.auth.password) {
//         const credentials = btoa(`${testRequest.auth.username}:${testRequest.auth.password}`);
//         headers["Authorization"] = `Basic ${credentials}`;
//       } else if (testRequest.auth.type === AUTH_TYPES.API_KEY && testRequest.auth.apiKeyLocation === API_KEY_LOCATIONS.HEADER) {
//         headers[testRequest.auth.apiKeyName] = testRequest.auth.apiKey;
//       }

//       const options = {
//         method: testRequest.method,
//         headers,
//       };

//       if (testRequest.method !== "GET" && testRequest.body) {
//         options.body = testRequest.body;
//       }

//       const response = await fetch(url.toString(), options);
//       const endTime = Date.now();
//       const duration = endTime - startTime;

//       let responseData;
//       const contentType = response.headers.get("content-type");

//       if (contentType && contentType.includes("application/json")) {
//         responseData = await response.json();
//       } else {
//         responseData = await response.text();
//       }

//       const responseObj = {
//         status: response.status,
//         statusText: response.statusText,
//         headers: Object.fromEntries(response.headers.entries()),
//         data: responseData,
//         duration,
//         timestamp: new Date().toISOString(),
//       };

//       setResponse(responseObj);
//     } catch (error) {
//       const errorResponse = {
//         status: 0,
//         statusText: "Network Error",
//         headers: {},
//         data: { error: error.message },
//         duration: Date.now() - startTime,
//         timestamp: new Date().toISOString(),
//       };

//       setResponse(errorResponse);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const copyResponse = () => {
//     if (response) {
//       navigator.clipboard.writeText(JSON.stringify(response.data, null, 2));
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
//       <div className="max-w-7xl mx-auto p-8 space-y-8">
//         {/* Header */}
//         <div className="text-center space-y-4">
//           <div className="flex items-center justify-center space-x-3">
//             <div className="p-3 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 rounded-xl">
//               <Zap className="h-8 w-8 text-emerald-400" />
//             </div>
//             <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
//               API Testing Studio
//             </h1>
//           </div>
//           <p className="text-slate-400 text-lg max-w-2xl mx-auto">
//             Professional API testing interface with advanced features and beautiful design
//           </p>
//         </div>

//         {/* Main Interface */}
//         <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-slate-700/50 rounded-2xl shadow-2xl backdrop-blur-sm overflow-hidden">
//           <RequestBuilder
//             testRequest={testRequest}
//             baseUrl={baseUrl}
//             showBaseUrlEdit={showBaseUrlEdit}
//             tempBaseUrl={tempBaseUrl}
//             loading={loading}
//             onMethodChange={handleMethodChange}
//             onEndpointChange={handleEndpointChange}
//             onBaseUrlEdit={setShowBaseUrlEdit}
//             onTempBaseUrlChange={setTempBaseUrl}
//             onBaseUrlUpdate={updateBaseUrl}
//             onBaseUrlCancel={cancelBaseUrlEdit}
//             onSendRequest={sendRequest}
//           />

//           <RequestTabs
//             activeTab={activeTab}
//             testRequest={testRequest}
//             onTabChange={setActiveTab}
//             onAddParam={addParam}
//             onUpdateParam={updateParam}
//             onRemoveParam={removeParam}
//             onAddHeader={addHeader}
//             onUpdateHeader={updateHeader}
//             onRemoveHeader={removeHeader}
//             onAuthChange={handleAuthChange}
//             onBodyChange={handleBodyChange}
//           />
//         </div>

//         {/* Response Section */}
//         {response && (
//           <ResponseSection
//             response={response}
//             onCopyResponse={copyResponse}
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default ApiTestSection;
"use client"

import { useState, useEffect } from "react"
import { Zap } from "lucide-react"
import RequestBuilder from "./RequestBuilder"
import RequestTabs from "./RequestTabs"
import ResponseSection from "./ResponseSection"
import { AUTH_TYPES, API_KEY_LOCATIONS } from "../../../lib/utils"

const ApiTestSection = ({ api }) => {
  const [baseUrl, setBaseUrl] = useState("https://api.example.com")
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
