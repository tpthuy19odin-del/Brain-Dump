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
  Compass,
  Crown,
  Zap,
  Lock
} from 'lucide-react';

export default function Sidebar({ 
  activeNav, 
  setActiveNav, 
  onOpenOnboarding, 
  onOpenWhatIf, 
  onOpenFeedback, 
  onOpenAdmin,
  onOpenUpgrade,
  user
}) {
  const isAdmin = user?.role === 'ADMIN' || user?.email?.toLowerCase()?.includes('admin');
  const isPro = user?.plan === 'PRO' || isAdmin;
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

        {/* Account Plan Tier Card */}
        <div className="mt-4 pt-3 border-t border-slate-200/70 dark:border-[#1d2c26]">
          <div className="p-3 rounded-2xl border transition relative overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-[#131f19] dark:to-[#0f1914] border-slate-200/80 dark:border-[#1e3328] shadow-2xs">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center space-x-1.5">
                {isPro ? (
                  <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                ) : (
                  <Zap className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span className="text-[11px] font-black text-slate-900 dark:text-white">
                  {isPro ? 'Gói PRO ⭐' : 'Gói Miễn Phí (FREE)'}
                </span>
              </div>
              <span className={`text-[9px] font-black px-1.5 py-0.2 rounded uppercase ${
                isPro 
                  ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/60 dark:text-amber-200 border border-amber-300 dark:border-amber-700' 
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}>
                {isPro ? 'ACTIVE' : 'FREE'}
              </span>
            </div>

            <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-2 leading-tight">
              {isPro 
                ? 'Đã mở khóa mọi công cụ AI & xếp lịch cao cấp.' 
                : 'Giới hạn tính năng. Nâng cấp để mở khóa toàn bộ AI!'}
            </p>

            <button
              onClick={onOpenUpgrade}
              className={`w-full py-1.5 rounded-xl text-[11px] font-black transition flex items-center justify-center space-x-1 cursor-pointer shadow-xs ${
                isPro
                  ? 'bg-slate-100 hover:bg-slate-200 dark:bg-[#192b22] dark:hover:bg-[#20392d] text-slate-700 dark:text-slate-200'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white'
              }`}
            >
              <Zap className="w-3 h-3 fill-current" />
              <span>{isPro ? 'Chi tiết gói PRO' : 'Nâng cấp PRO ⭐'}</span>
            </button>
          </div>
        </div>

        {/* Pro Tools Section */}
        <div className="mt-3 space-y-1">
          <div className="px-2 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Công Cụ AI Mở Rộng
          </div>

          {/* What-if Simulator (PRO Only) */}
          <button
            onClick={() => {
              if (!isPro) {
                onOpenUpgrade();
              } else {
                onOpenWhatIf();
              }
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
              isPro
                ? 'bg-purple-50/70 dark:bg-purple-950/30 text-purple-800 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50 border-purple-200/70 dark:border-purple-800/60 shadow-2xs'
                : 'bg-slate-50 dark:bg-[#121c17] text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#17251f] border-slate-200 dark:border-[#1e3027]'
            }`}
            title={isPro ? "Mô phỏng kịch bản thời gian trước khi xếp lịch" : "Tính năng Mô phỏng What-if chỉ dành riêng cho gói PRO ⭐ - Bấm để nâng cấp"}
          >
            <div className="flex items-center space-x-2">
              <Sparkles className={`w-3.5 h-3.5 ${isPro ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'}`} />
              <span>Mô phỏng What-if</span>
            </div>
            {isPro ? (
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-200 uppercase">
                PRO
              </span>
            ) : (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                <span>PRO</span>
              </span>
            )}
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
        <div className={`grid ${isAdmin ? 'grid-cols-2' : 'grid-cols-1'} gap-1.5 text-[11px] font-bold`}>
          <button
            onClick={onOpenFeedback}
            className="p-2 rounded-xl bg-white dark:bg-[#14201a] border border-[#e2eee5] dark:border-[#22362d] text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 hover:border-emerald-300 transition flex items-center justify-center space-x-1 cursor-pointer"
            title="Góp ý hoặc báo lỗi AI"
          >
            <MessageSquare className="w-3 h-3 text-slate-400" />
            <span>Góp ý</span>
          </button>

          {isAdmin && (
            <button
              onClick={onOpenAdmin}
              className="p-2 rounded-xl border transition flex items-center justify-center space-x-1 cursor-pointer bg-amber-100 dark:bg-amber-950/60 border-amber-400 dark:border-amber-600 text-amber-900 dark:text-amber-200 font-black shadow-xs ring-1 ring-amber-400/40"
              title="Mở bảng quản trị hệ thống"
            >
              <Shield className="w-3 h-3 text-amber-500" />
              <span>Admin 👑</span>
            </button>
          )}
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
