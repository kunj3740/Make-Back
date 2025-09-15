import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

export const AUTH_TYPES = {
  NONE: 'none',
  BEARER: 'bearer',
  BASIC: 'basic',
  API_KEY: 'apikey'
};

export const API_KEY_LOCATIONS = {
  HEADER: 'header',
  QUERY: 'query'
};
export const getMethodColor = (method) => {
  const colors = {
    GET: "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-emerald-500/25",
    POST: "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-orange-500/25",
    PUT: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-blue-500/25",
    DELETE: "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-red-500/25",
    PATCH: "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-purple-500/25"
  };
  return colors[method] || "bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 shadow-slate-500/25";
};

export const getMethodBadgeColor = (method) => {
  const colors = {
    GET: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-emerald-500/10",
    POST: "bg-orange-500/10 text-orange-400 border-orange-500/30 shadow-orange-500/10",
    PUT: "bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-blue-500/10",
    DELETE: "bg-red-500/10 text-red-400 border-red-500/30 shadow-red-500/10",
    PATCH: "bg-purple-500/10 text-purple-400 border-purple-500/30 shadow-purple-500/10"
  };
  return colors[method] || "bg-slate-500/10 text-slate-400 border-slate-500/30 shadow-slate-500/10";
};

export const getStatusColor = (status) => {
  if (status >= 200 && status < 300) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30 shadow-emerald-500/10";
  if (status >= 300 && status < 400) return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30 shadow-yellow-500/10";
  if (status >= 400 && status < 500) return "text-orange-400 bg-orange-500/10 border-orange-500/30 shadow-orange-500/10";
  if (status >= 500) return "text-red-400 bg-red-500/10 border-red-500/30 shadow-red-500/10";
  return "text-slate-400 bg-slate-500/10 border-slate-500/30 shadow-slate-500/10";
};