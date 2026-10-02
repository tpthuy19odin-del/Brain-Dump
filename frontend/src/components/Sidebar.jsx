import React from 'react';
import { 
  Home, 
  Calendar as CalendarIcon, 
  CheckSquare, 
  Timer, 
  TrendingUp, 
  FileText,
  Sparkles,
  Sprout
} from 'lucide-react';

export default function Sidebar({ activeNav, setActiveNav }) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'focus', label: 'Focus', icon: Timer },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  return (
    <aside className="w-56 h-full bg-[#f4f8f5] border-r border-[#e3ece5] flex flex-col justify-between p-4 shrink-0 select-none">
      {/* Brand Header */}
      <div>
        <div className="flex items-center space-x-2.5 px-2 py-3 mb-6">
          <div className="w-8 h-8 rounded-xl bg-[#1b4d3e] text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <h1 className="font-extrabold text-lg text-[#1b4d3e] tracking-tight">Brain Dump</h1>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#d8edd9] text-[#164334] shadow-xs'
                    : 'text-[#526a5d] hover:bg-[#e8f2ea] hover:text-[#1b4d3e]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#164334]' : 'text-[#6f8579]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Illustration & Slogan */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-b from-[#e5f3e7] to-[#d6ecda] border border-[#cfe5d2] text-[#1b4d3e] relative overflow-hidden">
        <div className="flex items-center space-x-1.5 text-xs font-extrabold mb-1">
          <Sprout className="w-4 h-4 text-[#206652]" />
          <span>Small steps</span>
        </div>
        <div className="text-xs font-bold text-[#2e745f]">big goals</div>
        <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-[#277861]/10 rounded-full blur-xs pointer-events-none"></div>
      </div>
    </aside>
  );
}
