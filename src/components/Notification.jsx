import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export const Notification = ({ toasts, onDismiss }) => {
  useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((t) => {
      return setTimeout(() => {
        onDismiss(t.id);
      }, 5000);
    });
    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [toasts, onDismiss]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        const isError = toast.type === 'error';
        const isSuccess = toast.type === 'success';

        return (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            className={`pointer-events-auto p-3.5 rounded-2xl backdrop-blur-xl border shadow-2xl flex items-start gap-3 text-xs transition-all duration-200 animate-in slide-in-from-top-2 ${
              isError
                ? 'bg-rose-950/90 border-rose-700/80 text-rose-200 shadow-rose-950/50'
                : isSuccess
                ? 'bg-emerald-950/90 border-emerald-700/80 text-emerald-200 shadow-emerald-950/50'
                : 'bg-slate-900/90 border-slate-700/80 text-slate-200 shadow-black/50'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isError ? (
                <AlertCircle size={16} className="text-rose-400" />
              ) : isSuccess ? (
                <CheckCircle2 size={16} className="text-emerald-400" />
              ) : (
                <Info size={16} className="text-blue-400" />
              )}
            </div>

            <div className="flex-1 font-medium leading-relaxed">{toast.message}</div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors shrink-0"
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
