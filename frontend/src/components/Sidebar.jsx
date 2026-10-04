import React from 'react';
import { 
  Home, 
  Calendar as CalendarIcon, 
  CheckSquare, 
  Timer, 
  TrendingUp, 
  FileText,
  Sparkles,
  Sprout,
  HelpCircle,
  Shield,
  MessageSquare,
  Compass
} from 'lucide-react';

export default function Sidebar({ 
  activeNav, 
  setActiveNav, 
  onOpenOnboarding, 
  onOpenWhatIf, 
  onOpenFeedback, 
  onOpenAdmin,
  user
}) {
  const isAdmin = user?.role === 'ADMIN' || user?.email?.toLowerCase()?.includes('admin');
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'focus', label: 'Focus', icon: Timer },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  return (
    <aside className="w-56 h-full bg-[#f4f8f5] dark:bg-[#0e1512] border-r border-[#e3ece5] dark:border-[#1d2c26] flex flex-col justify-between p-3.5 sm:p-4 shrink-0 select-none transition-colors duration-200 overflow-y-auto">
      {/* Brand Header & Nav */}
      <div>
        <div className="flex items-center space-x-2.5 px-2 py-2.5 mb-5">
          <div className="w-8 h-8 rounded-xl bg-[#1b4d3e] dark:bg-emerald-600 text-white flex items-center justify-center shadow-xs shadow-emerald-900/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h1 className="font-extrabold text-lg text-[#1b4d3e] dark:text-emerald-400 tracking-tight">Brain Dump</h1>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#d8edd9] dark:bg-[#1b3d2f] text-[#164334] dark:text-emerald-300 shadow-xs'
                    : 'text-[#526a5d] dark:text-[#8ba396] hover:bg-[#e8f2ea] dark:hover:bg-[#15221b] hover:text-[#1b4d3e] dark:hover:text-emerald-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#164334] dark:text-emerald-400' : 'text-[#6f8579] dark:text-[#6a8376]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Pro Tools Section */}
        <div className="mt-5 pt-3 border-t border-slate-200/70 dark:border-[#1d2c26] space-y-1">
          <div className="px-2 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Công Cụ AI Mở Rộng
          </div>

          {/* What-if Simulator */}
          <button
            onClick={onOpenWhatIf}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold bg-purple-50/70 dark:bg-purple-950/30 text-purple-800 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200/70 dark:border-purple-800/60 transition cursor-pointer"
            title="Mô phỏng kịch bản thời gian trước khi xếp lịch"
          >
            <div className="flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Mô phỏng What-if</span>
            </div>
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-200 uppercase">
              PRO
            </span>
          </button>

          {/* 3-Step Onboarding */}
          <button
            onClick={onOpenOnboarding}
            className="w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-[#e8f2ea] dark:hover:bg-[#15221b] hover:text-[#1b4d3e] dark:hover:text-emerald-300 transition cursor-pointer"
          >
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            <span>Hướng dẫn 3 Bước</span>
          </button>
        </div>
      </div>

      {/* Bottom Section: Admin, Feedback & Slogan */}
      <div className="space-y-2.5 pt-4">
        {/* Feedback & Admin shortcuts */}
        <div className="grid grid-cols-2 gap-1.5 text-[11px] font-bold">
          <button
            onClick={onOpenFeedback}
            className="p-2 rounded-xl bg-white dark:bg-[#14201a] border border-[#e2eee5] dark:border-[#22362d] text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 hover:border-emerald-300 transition flex items-center justify-center space-x-1 cursor-pointer"
            title="Góp ý hoặc báo lỗi AI"
          >
            <MessageSquare className="w-3 h-3 text-slate-400" />
            <span>Góp ý</span>
          </button>

          <button
            onClick={onOpenAdmin}
            className={`p-2 rounded-xl border transition flex items-center justify-center space-x-1 cursor-pointer ${
              isAdmin
                ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-400 dark:border-amber-600 text-amber-900 dark:text-amber-200 font-black shadow-xs ring-1 ring-amber-400/40'
                : 'bg-white dark:bg-[#14201a] border-[#e2eee5] dark:border-[#22362d] text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-300'
            }`}
            title="Mở bảng quản trị hệ thống"
          >
            <Shield className="w-3 h-3 text-amber-500" />
            <span>{isAdmin ? 'Admin 👑' : 'Admin'}</span>
          </button>
        </div>

        {/* Slogan Banner */}
        <div className="p-3 rounded-2xl bg-gradient-to-b from-[#e5f3e7] to-[#d6ecda] dark:from-[#14251e] dark:to-[#0f1b16] border border-[#cfe5d2] dark:border-[#213a2e] text-[#1b4d3e] dark:text-emerald-300 relative overflow-hidden">
          <div className="flex items-center space-x-1.5 text-xs font-extrabold mb-0.5">
            <Sprout className="w-3.5 h-3.5 text-[#206652] dark:text-emerald-400" />
            <span>Small steps</span>
          </div>
          <div className="text-[11px] font-bold text-[#2e745f] dark:text-emerald-500">big goals</div>
          <div className="absolute -bottom-4 -right-4 w-14 h-14 bg-[#277861]/10 dark:bg-emerald-500/10 rounded-full blur-xs pointer-events-none"></div>
        </div>
      </div>
    </aside>
  );
}
