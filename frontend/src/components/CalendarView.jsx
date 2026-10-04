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
  Maximize2,
  Calendar,
  RotateCcw,
  GripVertical
} from 'lucide-react';
import ThemeSwitch from './ThemeSwitch';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';

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
  subtasks = [],
  fixedSchedules = [],
  onOpenPomodoro,
  onToggleSubtaskStatus,
  onUpdateSubtaskTime,
  onUndoSuccess,
  isChatOpen,
  onToggleChat
}) {
  const [viewMode, setViewMode] = useState('week'); // 'week' | 'day' | 'month'
  const [selectedDayId, setSelectedDayId] = useState(2); // Tuesday
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverDay, setDragOverDay] = useState(null);
  const [isUndoing, setIsUndoing] = useState(false);
  const { showToast } = useToast();

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

  const handleDragStart = (e, stId) => {
    setDraggingId(stId);
    e.dataTransfer.setData('text/plain', stId);
  };

  const handleDropOnDay = async (e, targetDayId) => {
    e.preventDefault();
    setDragOverDay(null);
    const stId = e.dataTransfer.getData('text/plain') || draggingId;
    if (!stId) return;

    const targetSubtask = subtasks.find(s => s.id === stId);
    if (!targetSubtask) return;

    // Calculate new date for targetDayId in current week
    const now = new Date();
    const curDay = now.getDay() === 0 ? 7 : now.getDay();
    const diffDays = targetDayId - curDay;
    const newDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffDays);
    
    // Keep existing hours
    const prevDate = new Date(targetSubtask.startTime || Date.now());
    newDate.setHours(prevDate.getHours() || 8, prevDate.getMinutes() || 0, 0, 0);

    try {
      if (onUpdateSubtaskTime) {
        await onUpdateSubtaskTime(stId, newDate.toISOString());
        showToast({
          type: 'success',
          title: '🔄 Đã dời lịch thành công',
          message: `Nhiệm vụ "${targetSubtask.title}" đã được dời sang ${DAYS_OF_WEEK.find(d => d.id === targetDayId)?.name}!`
        });
      }
    } catch (err) {
      console.error(err);
    }
    setDraggingId(null);
  };

  const handleUndo = async () => {
    setIsUndoing(true);
    try {
      const res = await api.undoSchedule();
      if (res.success) {
        showToast({
          type: 'info',
          title: '↩️ Đã hoàn tác lịch',
          message: 'Đã khôi phục thành công về phiên bản lịch trước đó!'
        });
        if (onUndoSuccess) onUndoSuccess();
      }
    } catch (e) {
      showToast({
        type: 'warning',
        title: 'Không thể hoàn tác',
        message: e.response?.data?.error || 'Không có bản sao lưu trước đó để hoàn tác!'
      });
    } finally {
      setIsUndoing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#f8faf9] dark:bg-[#080d0b] transition-colors duration-200">
      {/* Top Toolbar */}
      <div className="p-2.5 sm:p-3 border-b border-slate-200/80 dark:border-[#1d2c26] bg-white dark:bg-[#0e1512] flex items-center justify-between gap-2 shadow-2xs shrink-0">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <button className="p-1 rounded-lg bg-slate-100 dark:bg-[#182720] hover:bg-slate-200 dark:hover:bg-[#20352c] text-slate-700 dark:text-slate-200 transition">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button className="p-1 rounded-lg bg-slate-100 dark:bg-[#182720] hover:bg-slate-200 dark:hover:bg-[#20352c] text-slate-700 dark:text-slate-200 transition">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
            <CalIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Kế hoạch 7 Ngày trong tuần</span>
          </h2>
        </div>

        {/* View Mode Selector: Tuần / Ngày / Tháng */}
        <div className="flex bg-slate-100 dark:bg-[#15221b] p-0.5 rounded-xl border border-slate-200 dark:border-[#21352b] text-[11px] font-bold">
          <button
            onClick={() => setViewMode('day')}
            className={`px-2.5 py-1 rounded-lg transition ${
              viewMode === 'day'
                ? 'bg-white dark:bg-[#1d3126] text-emerald-800 dark:text-emerald-300 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Ngày
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-2.5 py-1 rounded-lg transition ${
              viewMode === 'week'
                ? 'bg-white dark:bg-[#1d3126] text-emerald-800 dark:text-emerald-300 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Tuần
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`px-2.5 py-1 rounded-lg transition ${
              viewMode === 'month'
                ? 'bg-white dark:bg-[#1d3126] text-emerald-800 dark:text-emerald-300 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Tháng
          </button>
        </div>

        {/* Legend, Undo, Google Calendar, Theme Toggle & Chat Toggle */}
        <div className="flex items-center space-x-2 text-xs">
          <div className="hidden xl:flex items-center space-x-2.5 font-medium text-slate-500 dark:text-slate-400 text-[11px] mr-1">
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>Lịch TKB</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Việc AI xếp</span>
            </div>
          </div>

          {/* Undo Button */}
          <button
            onClick={handleUndo}
            disabled={isUndoing}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#16241e] hover:bg-slate-200 dark:hover:bg-[#1f3429] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#22362d] text-xs font-bold transition cursor-pointer"
            title="Hoàn tác (Undo) lại lịch trước khi AI Re-plan"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isUndoing ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Hoàn tác</span>
          </button>

          {/* Export to Google Calendar (.ICS) */}
          <a
            href="/api/export-ics"
            download="brain_dump_calendar.ics"
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition"
            title="Đồng bộ / Tải lịch sang Google Calendar, Apple Calendar, Outlook (.ICS)"
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Google Calendar (.ICS)</span>
          </a>

          {/* Dark/Light Quick Toggle Switch */}
          <ThemeSwitch />

          {onToggleChat && (
            <button
              onClick={onToggleChat}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#16241e] hover:bg-emerald-50 dark:hover:bg-[#1e332a] text-slate-700 dark:text-emerald-300 border border-slate-200 dark:border-[#22362d] text-xs font-bold transition"
            >
              {isChatOpen ? <PanelRightClose className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <PanelRightOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
              <span className="hidden sm:inline">{isChatOpen ? 'Ẩn Chat' : 'Mở Chat'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Calendar Views (Day / Week / Month) */}
      <div className="flex-1 p-2 sm:p-2.5 overflow-hidden flex flex-col">
        {/* DAY VIEW */}
        {viewMode === 'day' && (
          <div className="flex-1 flex flex-col bg-white dark:bg-[#101915] rounded-2xl border border-slate-200 dark:border-[#1d2c26] p-4 overflow-y-auto">
            {/* Day Selector Pills */}
            <div className="flex space-x-2 pb-3 border-b border-slate-100 dark:border-[#1c2a24] mb-4 overflow-x-auto">
              {DAYS_OF_WEEK.map(d => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDayId(d.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                    selectedDayId === d.id
                      ? 'bg-[#1b4d3e] text-white dark:bg-emerald-600 shadow-xs'
                      : 'bg-slate-100 dark:bg-[#16241e] text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {d.name}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <h3 className="font-extrabold text-sm text-[#1b3d2f] dark:text-white flex items-center gap-2">
                <span>Chi tiết lịch trình: {DAYS_OF_WEEK.find(d => d.id === selectedDayId)?.name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                  {getFixedForDay(selectedDayId).length + getSubtasksForDay(selectedDayId).length} sự kiện
                </span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Fixed TKB */}
                <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-[#122436] border border-blue-200 dark:border-[#1e3c5a] space-y-2">
                  <div className="text-xs font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Lịch Học Cố Định (TKB)</span>
                  </div>
                  {getFixedForDay(selectedDayId).length === 0 ? (
                    <p className="text-xs text-slate-400">Không có lịch học cố định trong ngày này.</p>
                  ) : (
                    getFixedForDay(selectedDayId).map(fs => (
                      <div key={fs.id} className="p-2 bg-white dark:bg-[#101915] rounded-lg border border-blue-100 dark:border-[#1a3044] text-xs">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{fs.title}</div>
                        <div className="text-[11px] text-blue-600 dark:text-blue-400 font-mono mt-0.5">{fs.startTime} - {fs.endTime}</div>
                      </div>
                    ))
                  )}
                </div>

                {/* AI Tasks */}
                <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-[#14261e] border border-emerald-200 dark:border-[#1d3d2e] space-y-2">
                  <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Nhiệm Vụ Học Tập AI Đã Xếp</span>
                  </div>
                  {getSubtasksForDay(selectedDayId).length === 0 ? (
                    <p className="text-xs text-slate-400">Không có nhiệm vụ nào được xếp vào ngày này.</p>
                  ) : (
                    getSubtasksForDay(selectedDayId).map(st => (
                      <div key={st.id} className="p-2 bg-white dark:bg-[#101915] rounded-lg border border-emerald-100 dark:border-[#1e352b] text-xs flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-900 dark:text-slate-100">{st.title}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{formatTime24(st.startTime)} - {formatTime24(st.endTime)} ({st.durationMin} phút)</div>
                        </div>
                        <button
                          onClick={() => onOpenPomodoro(st)}
                          className="px-2 py-1 rounded bg-emerald-600 text-white text-[10px] font-bold shrink-0"
                        >
                          Pomodoro
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MONTH VIEW */}
        {viewMode === 'month' && (
          <div className="flex-1 flex flex-col bg-white dark:bg-[#101915] rounded-2xl border border-slate-200 dark:border-[#1d2c26] p-4 overflow-y-auto">
            <h3 className="font-extrabold text-sm text-[#1b3d2f] dark:text-white mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Tổng quan Kế hoạch Tháng này</span>
            </h3>
            <div className="grid grid-cols-7 gap-2 flex-1">
              {Array.from({ length: 28 }).map((_, idx) => {
                const dayNum = idx + 1;
                const dayMod = (idx % 7) + 1;
                const count = (idx % 3 === 0) ? 2 : (idx % 2 === 0) ? 1 : 0;
                return (
                  <div key={idx} className="p-2 rounded-xl bg-slate-50 dark:bg-[#14201b] border border-slate-200 dark:border-[#1e3027] min-h-[60px] flex flex-col justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Ngày {dayNum}</span>
                    {count > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold truncate">
                        {count} task
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* WEEK VIEW (DEFAULT) */}
        {viewMode === 'week' && (
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 h-full w-full">
            {DAYS_OF_WEEK.map((day) => {
              const dayFixed = getFixedForDay(day.id);
              const daySubtasks = getSubtasksForDay(day.id);
              const isToday = day.id === 2; // Tuesday
              const isDragOver = dragOverDay === day.id;

              return (
                <div
                  key={day.id}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverDay(day.id);
                  }}
                  onDragLeave={() => setDragOverDay(null)}
                  onDrop={(e) => handleDropOnDay(e, day.id)}
                  className={`rounded-xl border flex flex-col h-full min-w-0 transition bg-white dark:bg-[#101915] shadow-2xs ${
                    isDragOver
                      ? 'border-emerald-500 ring-2 ring-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/40'
                      : isToday
                      ? 'border-emerald-500 dark:border-emerald-500 ring-1 ring-emerald-500/20 bg-emerald-50/10 dark:bg-emerald-950/20'
                      : 'border-slate-200/90 dark:border-[#1d2c26] hover:border-slate-300 dark:hover:border-[#2b443a]'
                  }`}
                >
                  {/* Day Header */}
                  <div className={`px-2 py-1.5 border-b rounded-t-xl flex items-center justify-between shrink-0 ${
                    isToday ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200' : 'border-slate-100 dark:border-[#192721] bg-slate-50/80 dark:bg-[#14201b] text-slate-800 dark:text-slate-200'
                  }`}>
                    <div className="flex items-center space-x-1 min-w-0">
                      <span className="font-extrabold text-[11px] sm:text-xs truncate">{day.name}</span>
                      {isToday && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 shrink-0" title="Hôm nay"></span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-semibold shrink-0">
                      {dayFixed.length + daySubtasks.length}
                    </span>
                  </div>

                  {/* Day Content Area */}
                  <div className="p-1.5 space-y-1.5 flex-1 overflow-y-auto">
                    {/* Fixed Schedule Cards (TKB) */}
                    {dayFixed.map((fs) => (
                      <div
                        key={fs.id}
                        className="p-1.5 rounded-lg bg-blue-50 dark:bg-[#122436] border border-blue-200/80 dark:border-[#1e3c5a] text-blue-950 dark:text-blue-200 text-[11px] shadow-2xs"
                      >
                        <div className="flex items-center justify-between text-[9px] text-blue-700 dark:text-blue-300 font-mono font-bold mb-0.5">
                          <span className="flex items-center space-x-0.5 truncate">
                            <BookOpen className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400 shrink-0" />
                            <span>TKB</span>
                          </span>
                          <span className="shrink-0">{fs.startTime}-{fs.endTime}</span>
                        </div>
                        <div className="font-bold text-[11px] leading-tight line-clamp-2 text-slate-900 dark:text-slate-100">
                          {fs.title}
                        </div>
                      </div>
                    ))}

                    {/* AI Subtask Cards - Draggable */}
                    {daySubtasks.map((st) => {
                      const isDone = st.status === 'DONE';
                      const startStr = formatTime24(st.startTime);
                      const endStr = formatTime24(st.endTime);

                      return (
                        <div
                          key={st.id}
                          draggable={true}
                          onDragStart={(e) => handleDragStart(e, st.id)}
                          className={`p-2 rounded-xl border text-[11px] transition cursor-grab active:cursor-grabbing ${
                            isDone
                              ? 'bg-[#f4f8f5] dark:bg-[#131e19] border-[#cbe4d2] dark:border-[#1d2d26] opacity-85'
                              : 'bg-emerald-50/70 dark:bg-[#14261e] border-emerald-200/90 dark:border-[#1d3d2e] text-slate-800 dark:text-slate-200 hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-xs'
                          }`}
                        >
                          {/* Time & Duration & Drag Handle */}
                          <div className="flex items-center justify-between text-[9px] font-mono mb-1 gap-1">
                            <span className={`px-1.5 py-0.5 rounded font-black flex items-center gap-1 ${
                              isDone ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                            }`}>
                              <GripVertical className="w-2.5 h-2.5 opacity-60" />
                              <span>{isDone ? '✓ XONG' : `${st.durationMin}p`}</span>
                            </span>
                            <span className="text-slate-500 dark:text-slate-400 font-bold truncate">{startStr}-{endStr}</span>
                          </div>

                          {/* Title */}
                          <div className={`font-bold text-[11px] leading-tight mb-1 line-clamp-2 ${
                            isDone ? 'line-through text-slate-500 dark:text-slate-500' : 'text-slate-900 dark:text-slate-100'
                          }`}>
                            {st.title}
                          </div>

                          {/* Subject Chip */}
                          {st.taskSubject && (
                            <div className={`text-[9px] font-semibold mb-1 truncate ${isDone ? 'text-slate-400 dark:text-slate-500' : 'text-emerald-700 dark:text-emerald-400'}`}>
                              • {st.taskSubject}
                            </div>
                          )}

                          {/* Quick Action Buttons */}
                          <div className="flex items-center justify-between pt-1 border-t border-emerald-100/80 dark:border-[#1d3126] gap-1">
                            <button
                              onClick={() => onToggleSubtaskStatus(st.id, isDone ? 'TODO' : 'DONE')}
                              className={`flex items-center space-x-1 text-[10px] font-bold transition truncate px-1.5 py-0.5 rounded ${
                                isDone ? 'bg-emerald-50 dark:bg-[#1a2d24] text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100' : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-[#192b22]'
                              }`}
                              title={isDone ? 'Bấm để đánh dấu chưa xong' : 'Bấm để đánh dấu hoàn thành'}
                            >
                              <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isDone ? 'text-emerald-600 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-950' : 'text-slate-400 dark:text-slate-500'}`} />
                              <span className="truncate">{isDone ? 'Xong' : 'Đánh dấu'}</span>
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
                      <div className="h-full min-h-[60px] flex items-center justify-center text-slate-300 dark:text-slate-600 text-[10px] text-center">
                        <span>Trống</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
