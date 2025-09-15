import React from 'react';
import { Hash, Shield, FileText, Code } from 'lucide-react';
import ParametersTab from './ParametersTab';
import AuthTab from './AuthTab';
import HeadersTab from './HeadersTab';
import BodyTab from './BodyTab';

const RequestTabs = ({
  activeTab,
  testRequest,
  onTabChange,
  onAddParam,
  onUpdateParam,
  onRemoveParam,
  onAddHeader,
  onUpdateHeader,
  onRemoveHeader,
  onAuthChange,
  onBodyChange,
}) => {
  const tabs = [
    { id: "params", label: "Parameters", icon: Hash, color: "blue" },
    { id: "auth", label: "Authorization", icon: Shield, color: "purple" },
    { id: "headers", label: "Headers", icon: FileText, color: "indigo" },
    { id: "body", label: "Body", icon: Code, color: "orange" },
  ];

  const getTabColor = (tabId, color, isActive) => {
    if (isActive) {
      return `border-${color}-500 text-${color}-400 bg-${color}-500/10 shadow-${color}-500/20`;
    }
    return "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-700/30";
  };

  return (
    <>
      <div className="border-b border-slate-700/50 bg-slate-800/30">
        <nav className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center space-x-3 px-8 py-4 border-b-2 font-semibold text-sm transition-all duration-200 ${
                  isActive
                    ? `border-${tab.color}-500 text-${tab.color}-400 bg-${tab.color}-500/10`
                    : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-700/30"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="p-8 bg-gradient-to-br from-slate-900/50 to-slate-800/50 min-h-[350px]">
        {activeTab === "params" && (
          <ParametersTab
            params={testRequest.params}
            onAddParam={onAddParam}
            onUpdateParam={onUpdateParam}
            onRemoveParam={onRemoveParam}
          />
        )}

        {activeTab === "auth" && (
          <AuthTab
            auth={testRequest.auth}
            onAuthChange={onAuthChange}
          />
        )}

        {activeTab === "headers" && (
          <HeadersTab
            headers={testRequest.headers}
            onAddHeader={onAddHeader}
            onUpdateHeader={onUpdateHeader}
            onRemoveHeader={onRemoveHeader}
          />
        )}

        {activeTab === "body" && (
          <BodyTab
            body={testRequest.body}
            method={testRequest.method}
            onBodyChange={onBodyChange}
          />
        )}
      </div>
    </>
  );
};

export default RequestTabs;