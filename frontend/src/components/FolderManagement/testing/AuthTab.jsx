// import React from 'react';
// import { Shield, Key, User, Lock } from 'lucide-react';
// import { AUTH_TYPES, API_KEY_LOCATIONS } from '../../../lib/utils';

// const AuthTab = ({ auth, onAuthChange }) => {
//   const authIcons = {
//     [AUTH_TYPES.NONE]: Shield,
//     [AUTH_TYPES.BEARER]: Key,
//     [AUTH_TYPES.BASIC]: User,
//     [AUTH_TYPES.API_KEY]: Lock,
//   };

//   const AuthIcon = authIcons[auth.type];

//   return (
//     <div className="space-y-8">
//       <div className="flex items-center space-x-3">
//         <div className="p-2 bg-purple-500/10 rounded-lg">
//           <AuthIcon className="h-5 w-5 text-purple-400" />
//         </div>
//         <div>
//           <h3 className="text-xl font-bold text-white">Authorization</h3>
//           <p className="text-slate-400 text-sm">Configure authentication for your API request</p>
//         </div>
//       </div>

//       <div className="space-y-6">
//         <div>
//           <label className="block text-sm font-semibold text-slate-200 mb-3">Authentication Type</label>
//           <select
//             value={auth.type}
//             onChange={(e) => onAuthChange({ type: e.target.value })}
//             className="w-full px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200"
//           >
//             <option value={AUTH_TYPES.NONE}>No Authentication</option>
//             <option value={AUTH_TYPES.BEARER}>Bearer Token</option>
//             <option value={AUTH_TYPES.BASIC}>Basic Auth</option>
//             <option value={AUTH_TYPES.API_KEY}>API Key</option>
//           </select>
//         </div>

//         {auth.type === AUTH_TYPES.BEARER && (
//           <div className="p-6 bg-gradient-to-br from-slate-800/60 to-slate-700/60 rounded-xl border border-slate-600/50 backdrop-blur-sm">
//             <label className="block text-sm font-semibold text-slate-200 mb-3">Bearer Token</label>
//             <input
//               type="password"
//               value={auth.token}
//               onChange={(e) => onAuthChange({ token: e.target.value })}
//               className="w-full px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-lg font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200 placeholder-slate-500"
//               placeholder="Enter your bearer token"
//             />
//           </div>
//         )}

//         {auth.type === AUTH_TYPES.BASIC && (
//           <div className="p-6 bg-gradient-to-br from-slate-800/60 to-slate-700/60 rounded-xl border border-slate-600/50 backdrop-blur-sm space-y-4">
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-semibold text-slate-200 mb-3">Username</label>
//                 <input
//                   type="text"
//                   value={auth.username}
//                   onChange={(e) => onAuthChange({ username: e.target.value })}
//                   className="w-full px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200 placeholder-slate-500"
//                   placeholder="Username"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold text-slate-200 mb-3">Password</label>
//                 <input
//                   type="password"
//                   value={auth.password}
//                   onChange={(e) => onAuthChange({ password: e.target.value })}
//                   className="w-full px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200 placeholder-slate-500"
//                   placeholder="Password"
//                 />
//               </div>
//             </div>
//           </div>
//         )}

//         {auth.type === AUTH_TYPES.API_KEY && (
//           <div className="p-6 bg-gradient-to-br from-slate-800/60 to-slate-700/60 rounded-xl border border-slate-600/50 backdrop-blur-sm space-y-4">
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-semibold text-slate-200 mb-3">Key Name</label>
//                 <input
//                   type="text"
//                   value={auth.apiKeyName}
//                   onChange={(e) => onAuthChange({ apiKeyName: e.target.value })}
//                   className="w-full px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200 placeholder-slate-500"
//                   placeholder="X-API-Key"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-semibold text-slate-200 mb-3">Add to</label>
//                 <select
//                   value={auth.apiKeyLocation}
//                   onChange={(e) => onAuthChange({ apiKeyLocation: e.target.value })}
//                   className="w-full px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200"
//                 >
//                   <option value={API_KEY_LOCATIONS.HEADER}>Header</option>
//                   <option value={API_KEY_LOCATIONS.QUERY}>Query Parameters</option>
//                 </select>
//               </div>
//             </div>
//             <div>
//               <label className="block text-sm font-semibold text-slate-200 mb-3">API Key Value</label>
//               <input
//                 type="password"
//                 value={auth.apiKey}
//                 onChange={(e) => onAuthChange({ apiKey: e.target.value })}
//                 className="w-full px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-lg font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200 placeholder-slate-500"
//                 placeholder="Enter your API key"
//               />
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AuthTab;
"use client"
import { Shield, Key, User, Lock } from "lucide-react"
import { AUTH_TYPES, API_KEY_LOCATIONS } from "../../../lib/utils"

const AuthTab = ({ auth, onAuthChange }) => {
  const authIcons = {
    [AUTH_TYPES.NONE]: Shield,
    [AUTH_TYPES.BEARER]: Key,
    [AUTH_TYPES.BASIC]: User,
    [AUTH_TYPES.API_KEY]: Lock,
  }

  const AuthIcon = authIcons[auth.type]

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-purple-500/10 rounded-lg">
          <AuthIcon className="h-5 w-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Authorization</h3>
          <p className="text-slate-400 text-sm">Configure authentication for your API request</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-200 mb-3">Authentication Type</label>
          <select
            value={auth.type}
            onChange={(e) => onAuthChange({ type: e.target.value })}
            className="w-full px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200"
          >
            <option value={AUTH_TYPES.NONE}>No Authentication</option>
            <option value={AUTH_TYPES.BEARER}>Bearer Token</option>
            <option value={AUTH_TYPES.BASIC}>Basic Auth</option>
            <option value={AUTH_TYPES.API_KEY}>API Key</option>
          </select>
        </div>

        {auth.type === AUTH_TYPES.BEARER && (
          <div className="p-6 bg-gradient-to-br from-slate-800/60 to-slate-700/60 rounded-xl border border-slate-600/50 backdrop-blur-sm">
            <label className="block text-sm font-semibold text-slate-200 mb-3">Bearer Token</label>
            <input
              type="password"
              value={auth.token}
              onChange={(e) => onAuthChange({ token: e.target.value })}
              className="w-full px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-lg font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200 placeholder-slate-500"
              placeholder="Enter your bearer token"
            />
          </div>
        )}

        {auth.type === AUTH_TYPES.BASIC && (
          <div className="p-6 bg-gradient-to-br from-slate-800/60 to-slate-700/60 rounded-xl border border-slate-600/50 backdrop-blur-sm space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-3">Username</label>
                <input
                  type="text"
                  value={auth.username}
                  onChange={(e) => onAuthChange({ username: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200 placeholder-slate-500"
                  placeholder="Username"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-3">Password</label>
                <input
                  type="password"
                  value={auth.password}
                  onChange={(e) => onAuthChange({ password: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200 placeholder-slate-500"
                  placeholder="Password"
                />
              </div>
            </div>
          </div>
        )}

        {auth.type === AUTH_TYPES.API_KEY && (
          <div className="p-6 bg-gradient-to-br from-slate-800/60 to-slate-700/60 rounded-xl border border-slate-600/50 backdrop-blur-sm space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-3">Key Name</label>
                <input
                  type="text"
                  value={auth.apiKeyName}
                  onChange={(e) => onAuthChange({ apiKeyName: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200 placeholder-slate-500"
                  placeholder="X-API-Key"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-3">Add to</label>
                <select
                  value={auth.apiKeyLocation}
                  onChange={(e) => onAuthChange({ apiKeyLocation: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200"
                >
                  <option value={API_KEY_LOCATIONS.HEADER}>Header</option>
                  <option value={API_KEY_LOCATIONS.QUERY}>Query Parameters</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-200 mb-3">API Key Value</label>
              <input
                type="password"
                value={auth.apiKey}
                onChange={(e) => onAuthChange({ apiKey: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-lg font-mono text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200 placeholder-slate-500"
                placeholder="Enter your API key"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AuthTab
