import React from 'react';
import { Code, AlertCircle } from 'lucide-react';

const BodyTab = ({ body, method, onBodyChange }) => {
  const isGetMethod = method === "GET";

  return (
    <div className="space-y-6 ">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-orange-500/10 rounded-lg">
          <Code className="h-5 w-5 text-orange-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Request Body</h3>
          <p className="text-slate-400 text-sm">
            {isGetMethod 
              ? "Request body is not applicable for GET requests" 
              : "Add JSON, XML, or other data to send with your request"
            }
          </p>
        </div>
      </div>

      {isGetMethod && (
        <div className="p-6 bg-yellow-500/5 border border-yellow-500/20 rounded-xl flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0" />
          <div>
            <p className="text-yellow-400 font-medium">GET requests don't support request bodies</p>
            <p className="text-yellow-400/70 text-sm mt-1">Use query parameters instead to send data</p>
          </div>
        </div>
      )}

      <div className="relative">
        <textarea
          value={body}
          onChange={(e) => onBodyChange(e.target.value)}
          className={`w-full h-50 px-6 py-4 bg-slate-800/80 border border-slate-600/50 rounded-xl font-mono text-sm text-slate-100 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200 placeholder-slate-500 backdrop-blur-sm ${
            isGetMethod ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          placeholder={
            isGetMethod
              ? "Request body is not applicable for GET requests"
              : `{
  "key": "value",
  "data": {
    "nested": "object"
  }
}`
          }
          disabled={isGetMethod}
        />
        {!isGetMethod && (
          <div className="absolute top-4 right-4 px-3 py-1 bg-slate-700/80 rounded-lg text-xs text-slate-400 font-mono">
            JSON
          </div>
        )}
      </div>

    </div>
  );
};

export default BodyTab;