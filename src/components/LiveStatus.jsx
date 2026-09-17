import React from 'react';
import { Activity, RefreshCw } from 'lucide-react';

export const LiveStatus = ({ isRefreshing, onRefresh, lastUpdated }) => {
  return (
    <div
      id="live-data-status-card"
      className="fixed bottom-6 left-4 sm:left-6 z-20 flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-slate-950/85 backdrop-blur-xl border border-slate-800/90 shadow-2xl shadow-black/40 text-slate-100 transition-all duration-200"
    >
      {/* Live Signal Icon with pulsating green dot */}
      <div className="relative flex items-center justify-center">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <Activity size={16} className="animate-pulse" />
        </div>
        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
      </div>

      <div className="flex flex-col">
        <span className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
          Live weather data
        </span>
        <span className="text-[11px] text-slate-400 font-medium">
          {isRefreshing ? 'Updating live metrics...' : `Updated ${lastUpdated || 'just now'}`}
        </span>
      </div>

      <button
        id="btn-refresh-live-weather"
        onClick={onRefresh}
        disabled={isRefreshing}
        className="p-1.5 ml-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 active:bg-slate-800 transition-colors disabled:opacity-40"
        title="Refresh weather data"
      >
        <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-blue-400' : ''} />
      </button>
    </div>
  );
};
