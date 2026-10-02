import React from 'react';
import { 
  Sparkles, 
  Flame, 
  Download, 
  Settings as SettingsIcon, 
  BarChart3, 
  Calendar as CalendarIcon,
  CheckCircle2,
  ShieldAlert,
  MessageSquare,
  Menu
} from 'lucide-react';

export default function Navbar({ 
  stats, 
  activeTab, 
  setActiveTab, 
  onOpenSettings, 
  onOpenStats, 
  onTriggerPanic,
  isPanicMode,
  showMobileChat,
  setShowMobileChat
}) {
  return (
    <header className="h-16 border-b border-emerald-100 bg-white/95 backdrop-blur-md px-3 sm:px-6 flex items-center justify-between z-30 shrink-0 shadow-xs">
      {/* Brand */}
      <div className="flex items-center space-x-2.5 sm:space-x-3 shrink-0">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <h1 className="font-bold text-base sm:text-lg text-slate-900 tracking-tight">Brain Dump</h1>
            <span className="text-[9px] sm:text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              AI
            </span>
          </div>
          <p className="text-[11px] text-slate-500 hidden xl:block">Biến suy nghĩ hỗn độn thành lịch trình khả thi</p>
        </div>
      </div>

      {/* Center Nav Tabs (Responsive) */}
      <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 mx-2">
        <button
          onClick={() => {
            setActiveTab('calendar');
            setShowMobileChat(false);
          }}
          className={`flex items-center space-x-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'calendar' && !showMobileChat
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CalendarIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Lịch Tuần & Ngày</span>
          <span className="sm:hidden">Lịch</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('today');
            setShowMobileChat(false);
          }}
          className={`flex items-center space-x-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'today' && !showMobileChat
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Hôm Nay</span>
          <span className="hidden md:inline">({stats?.totalSubtasks ? `${stats.doneSubtasks}/${stats.totalSubtasks}` : '0'})</span>
        </button>

        {/* Mobile AI Chat Switcher button (only visible on mobile/tablet) */}
        <button
          onClick={() => setShowMobileChat(!showMobileChat)}
          className={`lg:hidden flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            showMobileChat
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>AI Chat</span>
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
        {/* Streak Badge */}
        <div className="hidden sm:flex items-center space-x-1 px-2 sm:px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold shrink-0">
          <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 fill-amber-500 animate-pulse" />
          <span>{stats?.streakDays || 3}d</span>
          <span className="hidden md:inline"> streak</span>
        </div>

        {/* Panic Mode Toggle */}
        <button
          onClick={onTriggerPanic}
          className={`flex items-center space-x-1 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
            isPanicMode
              ? 'bg-red-600 text-white animate-bounce shadow-md shadow-red-600/30'
              : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
          }`}
          title="Kích hoạt chế độ cứu hạn sát deadline"
        >
          <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="hidden sm:inline">{isPanicMode ? 'Panic' : 'Panic'}</span>
        </button>

        {/* Stats Report Button */}
        <button
          onClick={onOpenStats}
          className="p-1.5 sm:p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition border border-slate-200 hover:border-emerald-200 shrink-0"
          title="Xem báo cáo & Giờ Vàng"
        >
          <BarChart3 className="w-4 h-4" />
        </button>

        {/* Export .SQL Button */}
        <a
          href="/api/export-sql"
          download="brain_dump_schema.sql"
          className="hidden md:flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold border border-emerald-200 transition shrink-0"
          title="Tải file .sql về máy"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden xl:inline">Tải .SQL</span>
        </a>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 sm:p-2 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition border border-slate-200 hover:border-emerald-200 shrink-0"
          title="Cài đặt"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
