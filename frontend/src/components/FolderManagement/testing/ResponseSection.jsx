import React from 'react';
import { Copy, Clock, CheckCircle, AlertTriangle, XCircle, Info, FileText, Code } from 'lucide-react';
import { getStatusColor } from '../../../lib/utils';

const ResponseSection = ({ response, onCopyResponse }) => {
  const getStatusIcon = (status) => {
    if (status >= 200 && status < 300) return CheckCircle;
    if (status >= 300 && status < 400) return Info;
    if (status >= 400 && status < 500) return AlertTriangle;
    if (status >= 500) return XCircle;
    return XCircle;
  };

  const StatusIcon = getStatusIcon(response.status);

  return (
    <div className="w-full bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50  shadow-xl backdrop-blur-sm text-sm">
      <div className="p-5 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-emerald-500/10 rounded-md">
                <StatusIcon className="h-5 w-5 text-emerald-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Response</h3>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1.5 rounded-lg font-semibold border shadow-md ${getStatusColor(response.status)} text-sm`}>
                {response.status} {response.statusText}
              </span>
              <span className="flex items-center space-x-1.5 text-slate-400 text-sm bg-slate-800/60 px-3 py-1.5 rounded-md">
                <Clock className="h-4 w-4" />
                <span className="font-mono">{response.duration}ms</span>
              </span>
            </div>
          </div>
          <button
            onClick={onCopyResponse}
            className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-slate-700/80 to-slate-600/80 hover:from-slate-600/80 hover:to-slate-500/80 border border-slate-600/50 rounded-lg transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg transform hover:scale-105"
          >
            <Copy className="h-4 w-4" />
            <span>Copy</span>
          </button>
        </div>
      </div>

      <div className="p-5 space-y-5 max-h-[600px] overflow-y-auto">
        {/* Response Headers */}
        <div>
          <h4 className="text-base font-semibold text-white mb-3 flex items-center space-x-2">
            <FileText className="h-5 w-5 text-indigo-400" />
            <span>Headers</span>
          </h4>
          <div className="bg-slate-800/60 rounded-lg p-4 border border-slate-600/50 backdrop-blur-sm max-h-48 overflow-y-auto">
            <pre className="text-sm font-mono text-slate-100 space-y-1">
              {Object.entries(response.headers).map(([key, value]) => (
                <div key={key} className="flex">
                  <span className="text-emerald-400 font-semibold flex-shrink-0">{key}:</span>
                  <span className="text-slate-300 ml-1 break-all">{value}</span>
                </div>
              ))}
            </pre>
          </div>
        </div>

        {/* Response Body */}
        <div>
          <h4 className="text-base font-semibold text-white mb-3 flex items-center space-x-2">
            <Code className="h-5 w-5 text-orange-400" />
            <span>Body</span>
          </h4>
          <div className="bg-slate-800/60 rounded-lg border border-slate-600/50 overflow-hidden backdrop-blur-sm">
            <div className="p-2 bg-slate-700/50 border-b border-slate-600/50 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">
                {typeof response.data === "object" ? "JSON" : "TEXT"}
              </span>
              <span className="text-xs text-slate-400">
                {JSON.stringify(response.data).length} chars
              </span>
            </div>
            <pre className="p-4 text-sm font-mono text-slate-100 overflow-x-auto max-h-72 overflow-y-auto">
              {typeof response.data === "object" 
                ? JSON.stringify(response.data, null, 2) 
                : response.data
              }
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponseSection;
