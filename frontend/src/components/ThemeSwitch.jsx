import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeSwitch({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div
      onClick={toggleTheme}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleTheme();
        }
      }}
      className={`inline-flex items-center p-0.5 rounded-full bg-slate-200/90 dark:bg-[#121c17] border border-slate-300 dark:border-[#263c32] shadow-xs cursor-pointer select-none transition-all hover:scale-105 duration-200 ${className}`}
      title={isDark ? "Đang bật Giao diện Tối - Bấm để chuyển sang Sáng" : "Đang bật Giao diện Sáng - Bấm để chuyển sang Tối"}
    >
      {/* Light Option */}
      <div
        className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-300 ${
          !isDark
            ? 'bg-white text-amber-600 shadow-xs scale-100'
            : 'text-slate-500 hover:text-slate-800 scale-95 opacity-60'
        }`}
      >
        <Sun className={`w-3.5 h-3.5 ${!isDark ? 'text-amber-500 fill-amber-500/20 animate-spin-slow' : ''}`} />
        <span className="text-[11px]">Sáng</span>
      </div>

      {/* Dark Option */}
      <div
        className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all duration-300 ${
          isDark
            ? 'bg-[#1b4d3e] text-emerald-200 shadow-xs scale-100 border border-emerald-500/30'
            : 'text-slate-500 hover:text-slate-800 scale-95 opacity-60'
        }`}
      >
        <Moon className={`w-3.5 h-3.5 ${isDark ? 'text-emerald-300 fill-emerald-300/20' : ''}`} />
        <span className="text-[11px]">Tối</span>
      </div>
    </div>
  );
}
