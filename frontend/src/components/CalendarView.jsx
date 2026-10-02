import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  Play, 
  BookOpen, 
  Calendar as CalIcon,
  PanelRightClose,
  PanelRightOpen,
  Maximize2
} from 'lucide-react';

const DAYS_OF_WEEK = [
  { id: 1, name: 'Thứ 2', short: 'T2' },
  { id: 2, name: 'Thứ 3', short: 'T3' },
  { id: 3, name: 'Thứ 4', short: 'T4' },
  { id: 4, name: 'Thứ 5', short: 'T5' },
  { id: 5, name: 'Thứ 6', short: 'T6' },
  { id: 6, name: 'Thứ 7', short: 'T7' },
  { id: 7, name: 'Chủ Nhật', short: 'CN' }
];

function formatTime24(isoStr) {
  try {
    const d = new Date(isoStr);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
  } catch (e) {
    return '';
  }
}

export default function CalendarView({
  subtasks,
  fixedSchedules,
  onOpenPomodoro,
  onToggleSubtaskStatus,
  isChatOpen,
  onToggleChat
}) {
  const getFixedForDay = (dayId) => {
    return fixedSchedules.filter(fs => fs.dayOfWeek === dayId);
  };

  const getSubtasksForDay = (dayId) => {
    return subtasks.filter(st => {
      const date = new Date(st.startTime);
      const day = date.getDay() === 0 ? 7 : date.getDay();
      return day === dayId;
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#f8faf9]">
      {/* Top Toolbar */}
      <div className="p-2.5 sm:p-3 border-b border-slate-200/80 bg-white flex items-center justify-between gap-2 shadow-2xs shrink-0">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <button className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <h2 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center space-x-1.5">
            <CalIcon className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Kế hoạch 7 Ngày trong tuần</span>
          </h2>
        </div>

        {/* Legend & Chat Toggle */}
        <div className="flex items-center space-x-3 text-xs">
          <div className="hidden md:flex items-center space-x-3 font-medium text-slate-500 text-[11px]">
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>Lịch TKB</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Việc AI xếp</span>
            </div>
          </div>

          {onToggleChat && (
            <button
              onClick={onToggleChat}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 text-xs font-bold transition"
            >
              {isChatOpen ? <PanelRightClose className="w-3.5 h-3.5 text-emerald-600" /> : <PanelRightOpen className="w-3.5 h-3.5 text-emerald-600" />}
              <span className="hidden sm:inline">{isChatOpen ? 'Ẩn Chatbot' : 'Hiện Chatbot'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 7 Days Grid fitting 100% of Screen Width without horizontal scroll */}
      <div className="flex-1 p-2 sm:p-2.5 overflow-hidden flex flex-col">
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 h-full w-full">
          {DAYS_OF_WEEK.map((day) => {
            const dayFixed = getFixedForDay(day.id);
            const daySubtasks = getSubtasksForDay(day.id);
            const isToday = day.id === 2; // Tuesday

            return (
              <div
                key={day.id}
                className={`rounded-xl border flex flex-col h-full min-w-0 transition bg-white shadow-2xs ${
                  isToday
                    ? 'border-emerald-500 ring-1 ring-emerald-500/20 bg-emerald-50/10'
                    : 'border-slate-200/90 hover:border-slate-300'
                }`}
              >
                {/* Day Header */}
                <div className={`px-2 py-1.5 border-b rounded-t-xl flex items-center justify-between shrink-0 ${
                  isToday ? 'border-emerald-200 bg-emerald-100/70 text-emerald-900' : 'border-slate-100 bg-slate-50/80 text-slate-800'
                }`}>
                  <div className="flex items-center space-x-1 min-w-0">
                    <span className="font-extrabold text-[11px] sm:text-xs truncate">{day.name}</span>
                    {isToday && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" title="Hôm nay"></span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono font-semibold shrink-0">
                    {dayFixed.length + daySubtasks.length}
                  </span>
                </div>

                {/* Day Content Area */}
                <div className="p-1.5 space-y-1.5 flex-1 overflow-y-auto">
                  {/* Fixed Schedule Cards (TKB) */}
                  {dayFixed.map((fs) => (
                    <div
                      key={fs.id}
                      className="p-1.5 rounded-lg bg-blue-50 border border-blue-200/80 text-blue-950 text-[11px] shadow-2xs"
                    >
                      <div className="flex items-center justify-between text-[9px] text-blue-700 font-mono font-bold mb-0.5">
                        <span className="flex items-center space-x-0.5 truncate">
                          <BookOpen className="w-2.5 h-2.5 text-blue-600 shrink-0" />
                          <span>TKB</span>
                        </span>
                        <span className="shrink-0">{fs.startTime}-{fs.endTime}</span>
                      </div>
                      <div className="font-bold text-[11px] leading-tight line-clamp-2 text-slate-900">
                        {fs.title}
                      </div>
                    </div>
                  ))}

                  {/* AI Subtask Cards */}
                  {daySubtasks.map((st) => {
                    const isDone = st.status === 'DONE';
                    const startStr = formatTime24(st.startTime);
                    const endStr = formatTime24(st.endTime);

                    return (
                      <div
                        key={st.id}
                        className={`p-2 rounded-xl border text-[11px] transition ${
                          isDone
                            ? 'bg-[#f4f8f5] border-[#cbe4d2] opacity-85'
                            : 'bg-emerald-50/70 border-emerald-200/90 text-slate-800 hover:border-emerald-400 hover:shadow-xs'
                        }`}
                      >
                        {/* Time & Duration & Status Badge */}
                        <div className="flex items-center justify-between text-[9px] font-mono mb-1 gap-1">
                          <span className={`px-1.5 py-0.5 rounded font-black ${
                            isDone ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {isDone ? '✓ ĐÃ XONG' : `${st.durationMin}p`}
                          </span>
                          <span className="text-slate-500 font-bold truncate">{startStr}-{endStr}</span>
                        </div>

                        {/* Title */}
                        <div className={`font-bold text-[11px] leading-tight mb-1 line-clamp-2 ${
                          isDone ? 'line-through text-slate-500' : 'text-slate-900'
                        }`}>
                          {st.title}
                        </div>

                        {/* Subject Chip */}
                        {st.taskSubject && (
                          <div className={`text-[9px] font-semibold mb-1 truncate ${isDone ? 'text-slate-400' : 'text-emerald-700'}`}>
                            • {st.taskSubject}
                          </div>
                        )}

                        {/* Quick Action Buttons */}
                        <div className="flex items-center justify-between pt-1 border-t border-emerald-100/80 gap-1">
                          <button
                            onClick={() => onToggleSubtaskStatus(st.id, isDone ? 'TODO' : 'DONE')}
                            className={`flex items-center space-x-1 text-[10px] font-bold transition truncate px-1.5 py-0.5 rounded ${
                              isDone ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
                            }`}
                            title={isDone ? 'Bấm để đánh dấu chưa xong' : 'Bấm để đánh dấu hoàn thành'}
                          >
                            <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isDone ? 'text-emerald-600 fill-emerald-100' : 'text-slate-400'}`} />
                            <span className="truncate">{isDone ? 'Đã hoàn thành' : 'Đánh dấu xong'}</span>
                          </button>

                          {!isDone && (
                            <button
                              onClick={() => onOpenPomodoro(st)}
                              className="px-1.5 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black flex items-center space-x-0.5 shadow-2xs shrink-0 cursor-pointer"
                              title="Bắt đầu Pomodoro đếm giờ"
                            >
                              <Play className="w-2 h-2 fill-white shrink-0" />
                              <span>Pomo</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {dayFixed.length === 0 && daySubtasks.length === 0 && (
                    <div className="h-full min-h-[60px] flex items-center justify-center text-slate-300 text-[10px] text-center">
                      <span>Trống</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
