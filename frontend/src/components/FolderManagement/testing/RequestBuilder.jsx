import React from 'react';
import { Play, Edit3, CheckCircle, X, Globe } from 'lucide-react';
import { getMethodColor, HTTP_METHODS } from '../../../lib/utils';

const RequestBuilder = ({
  testRequest,
  baseUrl,
  showBaseUrlEdit,
  tempBaseUrl,
  loading,
  onMethodChange,
  onEndpointChange,
  onBaseUrlEdit,
  onTempBaseUrlChange,
  onBaseUrlUpdate,
  onBaseUrlCancel,
  onSendRequest,
}) => {
  return (
    <div className="p-8 border-b border-slate-700/50 bg-gradient-to-br from-slate-800/50 to-slate-900/50">
      <div className="flex items-center space-x-4 mb-6">
        <div className="relative">
          <select
            value={testRequest.method}
            onChange={(e) => onMethodChange(e.target.value)}
            className={`px-6 py-3 rounded-xl font-bold text-sm border-0 focus:ring-2 focus:ring-emerald-500/50 transition-all duration-200 shadow-lg text-white ${getMethodColor(testRequest.method)}`}
          >
            {HTTP_METHODS.map(method => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
        </div>

        <div className="flex-1 flex border border-slate-600/50 rounded-xl overflow-hidden bg-slate-800/80 backdrop-blur-sm shadow-lg">
          <div className="relative">
            {showBaseUrlEdit ? (
              <div className="flex">
                <input
                  type="text"
                  value={tempBaseUrl}
                  onChange={(e) => onTempBaseUrlChange(e.target.value)}
                  className="px-5 py-3 bg-slate-700/80 border-0 text-emerald-400 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 backdrop-blur-sm"
                  placeholder="https://api.example.com"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onBaseUrlUpdate();
                    if (e.key === "Escape") onBaseUrlCancel();
                  }}
                  autoFocus
                />
                <button
                  onClick={onBaseUrlUpdate}
                  className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-200 hover:shadow-lg"
                >
                  <CheckCircle className="h-4 w-4" />
                </button>
                <button
                  onClick={onBaseUrlCancel}
                  className="px-4 py-3 bg-slate-600 hover:bg-slate-700 text-slate-300 transition-all duration-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onBaseUrlEdit(true)}
                className="px-3 py-3 bg-slate-700/60 hover:bg-slate-600/60 text-emerald-400 font-mono text-sm transition-all duration-200 flex items-center space-x-3 group backdrop-blur-sm"
              >
                <Globe className="h-4 w-4 text-emerald-500" />
                <span className="text-emerald-400 font-semibold">{baseUrl}</span>
                <Edit3 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all duration-200" />
              </button>
            )}
          </div>
          <input
            type="text"
            value={testRequest.endpoint}
            onChange={(e) => onEndpointChange(e.target.value)}
            className="flex-1 px-5 py-3 bg-transparent border-0 font-mono text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 placeholder-slate-500"
            placeholder="/api/v1/endpoint"
          />
        </div>

        <button
          onClick={onSendRequest}
          disabled={loading || !testRequest.endpoint}
          className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-slate-600 disabled:to-slate-700 disabled:text-slate-400 text-white font-bold rounded-xl transition-all duration-200 flex items-center space-x-3 shadow-lg hover:shadow-emerald-500/25 disabled:shadow-none transform hover:scale-105 disabled:hover:scale-100"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Sending...</span>
            </>
          ) : (
            <>
              <Play className="h-5 w-5" />
              <span>Send Request</span>
            </>
          )}
        </button>
      </div>

      <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/50 backdrop-blur-sm">
        <div className="text-sm font-mono text-slate-400 flex items-center space-x-2">
          <Globe className="h-4 w-4 text-emerald-500" />
          <span className="text-emerald-400 font-semibold">{baseUrl}</span>
          <span className="text-slate-100">{testRequest.endpoint}</span>
        </div>
      </div>
    </div>
  );
};

export default RequestBuilder;