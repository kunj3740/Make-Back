import React from 'react';
import { Plus, Trash2, Hash } from 'lucide-react';

const ParametersTab = ({
  params,
  onAddParam,
  onUpdateParam,
  onRemoveParam,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Hash className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Query Parameters</h3>
            <p className="text-slate-400 text-sm">Add URL query parameters to your request</p>
          </div>
        </div>
        <button
          onClick={onAddParam}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-emerald-600/20 hover:from-emerald-500/30 hover:to-emerald-600/30 text-emerald-400 rounded-lg transition-all duration-200 text-sm font-semibold border border-emerald-500/30 hover:border-emerald-500/50 shadow-lg hover:shadow-emerald-500/10"
        >
          <Plus className="h-4 w-4" />
          <span>Add Parameter</span>
        </button>
      </div>

      {params.length > 0 ? (
        <div className="space-y-4 ">
          {params.map((param, index) => (
            <div key={index} className="group p-4 bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-xl border border-slate-600/50 hover:border-slate-500/50 transition-all duration-200 backdrop-blur-sm shadow-lg">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={param.enabled}
                    onChange={(e) => onUpdateParam(index, "enabled", e.target.checked)}
                    className="w-5 h-5 text-emerald-500 bg-slate-800 border-slate-600 rounded focus:ring-emerald-500/50 focus:ring-2"
                  />
                </div>
                <input
                  type="text"
                  value={param.key}
                  onChange={(e) => onUpdateParam(index, "key", e.target.value)}
                  className="flex-1 px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200 placeholder-slate-500"
                  placeholder="Parameter name"
                />
                <input
                  type="text"
                  value={param.value}
                  onChange={(e) => onUpdateParam(index, "value", e.target.value)}
                  className="flex-1 px-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200 placeholder-slate-500"
                  placeholder="Parameter value"
                />
                <button
                  onClick={() => onRemoveParam(index)}
                  className="p-3 text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 hover:shadow-lg"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center  text-slate-400">
          <div className="p-4 bg-slate-800/30 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <Hash className="h-10 w-10 text-slate-500" />
          </div>
          <p className="text-lg font-medium text-slate-300">No query parameters added</p>
          <p className="text-sm mt-2">Click "Add Parameter" to get started</p>
        </div>
      )}
    </div>
  );
};

export default ParametersTab;