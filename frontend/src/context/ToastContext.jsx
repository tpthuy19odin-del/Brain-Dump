import React, { createContext, useContext, useState, useCallback } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  X, 
  Sparkles 
} from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback(({ 
    type = 'info', 
    title = '', 
    message = '', 
    duration = 4000 
  }) => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
    const newToast = { id, type, title, message, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Toast Notification Container (Top-Right Floating) */}
      <div className="fixed top-5 right-5 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Individual Toast Item Component
function ToastItem({ toast, onClose }) {
  const { type, title, message } = toast;

  const config = {
    success: {
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
      border: 'border-emerald-200',
      bg: 'bg-white',
      accent: 'bg-emerald-500',
      titleColor: 'text-emerald-950',
      defaultTitle: 'Thành công'
    },
    warning: {
      icon: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 animate-bounce" />,
      border: 'border-amber-200',
      bg: 'bg-[#fffcf5]',
      accent: 'bg-amber-500',
      titleColor: 'text-amber-950',
      defaultTitle: 'Cảnh báo rủi ro'
    },
    error: {
      icon: <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />,
      border: 'border-red-200',
      bg: 'bg-[#fff8f8]',
      accent: 'bg-red-500',
      titleColor: 'text-red-950',
      defaultTitle: 'Đã có lỗi xảy ra'
    },
    info: {
      icon: <Sparkles className="w-5 h-5 text-blue-500 shrink-0" />,
      border: 'border-blue-200',
      bg: 'bg-white',
      accent: 'bg-blue-500',
      titleColor: 'text-blue-950',
      defaultTitle: 'Thông báo'
    }
  }[type] || {
    icon: <Info className="w-5 h-5 text-slate-500 shrink-0" />,
    border: 'border-slate-200',
    bg: 'bg-white',
    accent: 'bg-slate-500',
    titleColor: 'text-slate-900',
    defaultTitle: 'Thông báo'
  };

  return (
    <div className={`pointer-events-auto w-full ${config.bg} border ${config.border} rounded-2xl p-4 shadow-xl shadow-black/5 flex items-start space-x-3 relative overflow-hidden transition-all animate-in slide-in-from-top-4 fade-in duration-200`}>
      {/* Left colored bar */}
      <div className={`absolute top-0 left-0 bottom-0 w-1.5 ${config.accent}`}></div>

      {/* Icon */}
      <div className="pt-0.5 pl-1">
        {config.icon}
      </div>

      {/* Message text */}
      <div className="flex-1 min-w-0 pr-2">
        <h5 className={`font-extrabold text-xs ${config.titleColor} leading-tight`}>
          {title || config.defaultTitle}
        </h5>
        {message && (
          <p className="text-[11px] text-slate-600 font-medium mt-1 leading-relaxed whitespace-pre-line">
            {message}
          </p>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
