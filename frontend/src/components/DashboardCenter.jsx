import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  Calendar as CalendarIcon, 
  Flame, 
  User, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  Bot,
  ArrowRight,
  Plus,
  Mail,
  Send,
  Loader2,
  Sun,
  Moon,
  Crown,
  Zap,
  Trash2,
  X
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';
import ThemeSwitch from './ThemeSwitch';

const STANDARD_TIME_SLOTS = [
  { startH: 6, endH: 7, label: '6:00 - 7:00' },
  { startH: 7, endH: 8, label: '7:00 - 8:00' },
  { startH: 8, endH: 9, label: '8:00 - 9:00' },
  { startH: 9, endH: 10, label: '9:00 - 10:00' },
  { startH: 10, endH: 11, label: '10:00 - 11:00' },
  { startH: 11, endH: 12, label: '11:00 - 12:00' },
  { startH: 12, endH: 13, label: '12:00 - 13:00' },
  { startH: 13, endH: 14, label: '13:00 - 14:00' },
  { startH: 14, endH: 15, label: '14:00 - 15:00' },
  { startH: 15, endH: 16, label: '15:00 - 16:00' },
  { startH: 16, endH: 17, label: '16:00 - 17:00' },
  { startH: 17, endH: 18, label: '17:00 - 18:00' },
  { startH: 18, endH: 19, label: '18:00 - 19:00' },
  { startH: 19, endH: 20, label: '19:00 - 20:00' },
  { startH: 20, endH: 21, label: '20:00 - 21:00' },
  { startH: 21, endH: 22, label: '21:00 - 22:00' },
  { startH: 22, endH: 23, label: '22:00 - 23:00' },
  { startH: 23, endH: 24, label: '23:00 - 24:00' },
];

const ALL_TIME_SLOTS = Array.from({ length: 24 }, (_, i) => ({
  startH: i,
  endH: i + 1,
  label: `${i}:00 - ${i + 1 === 24 ? '24:00' : `${i + 1}:00`}`
}));

export default function DashboardCenter({ 
  user,
  tasks = [], 
  subtasks = [], 
  fixedSchedules = [], 
  stats, 
  onOpenPomodoro, 
  onAskAI, 
  onOpenAuth, 
  onLogout,
  onOpenUpgrade,
  onDeleteSubtask,
  onDeleteFixedSchedule
}) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null, type: 'subtask', isDeleting: false });
  const { showToast } = useToast();

  const handleOpenDeleteConfirm = (e, item, type) => {
    e.stopPropagation();
    setDeleteModal({
      isOpen: true,
      item,
      type,
      isDeleting: false
    });
  };

  const handleExecuteDelete = async () => {
    if (!deleteModal.item) return;
    const { item, type } = deleteModal;
    setDeleteModal(prev => ({ ...prev, isDeleting: true }));

    try {
      if (type === 'fixed') {
        if (onDeleteFixedSchedule) {
          await onDeleteFixedSchedule(item.id);
        } else {
          await api.deleteFixedSchedule(item.id);
        }
        showToast({
          type: 'success',
          title: '🗑️ Đã xóa Lịch cố định',
          message: `Môn học/lịch "${item.title}" đã được xóa khỏi thời khóa biểu!`
        });
      } else {
        if (onDeleteSubtask) {
          await onDeleteSubtask(item.id);
        } else {
          await api.deleteSubtask(item.id);
        }
        showToast({
          type: 'success',
          title: '🗑️ Đã xóa nhiệm vụ',
          message: `Nhiệm vụ "${item.title}" đã được xóa thành công!`
        });
      }
      setDeleteModal({ isOpen: false, item: null, type: 'subtask', isDeleting: false });
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Xóa thất bại',
        message: err.response?.data?.error || err.message || 'Không thể xóa mục này.'
      });
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  // Dynamically calculate current week days with both Day of Week & Date (e.g. Thứ 2, 05/10)
  const dynamicWeekDays = useMemo(() => {
    const now = new Date();
    const curDay = now.getDay() === 0 ? 7 : now.getDay();
    const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    const labelNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return Array.from({ length: 7 }, (_, i) => {
      const dayId = i + 1;
      const diff = dayId - curDay;
      const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff);
      const dateFormatted = `${targetDate.getDate().toString().padStart(2, '0')}/${(targetDate.getMonth() + 1).toString().padStart(2, '0')}`;
      return {
        key: dayId,
        label: labelNames[i],
        dayNum: dayNames[i],
        dateFormatted,
        isToday: dayId === curDay
      };
    });
  }, []);

  const handleSendUrgentEmail = async () => {
    if (!user) {
      showToast({
        type: 'warning',
        title: 'Yêu cầu đăng nhập',
        message: 'Vui lòng đăng nhập để gửi email báo việc gấp về hộp thư của bạn!'
      });
      onOpenAuth();
      return;
    }

    const isPro = user?.plan === 'PRO' || user?.role === 'ADMIN';
    if (!isPro) {
      showToast({
        type: 'warning',
        title: 'Tính năng PRO ⭐',
        message: 'Tự động gửi cảnh báo việc gấp qua Email là tính năng độc quyền của gói PRO. Vui lòng nâng cấp để sử dụng!'
      });
      if (onOpenUpgrade) onOpenUpgrade();
      return;
    }

    setIsSendingEmail(true);
    try {
      const email = user.email;
      const userName = user.name;
      const res = await api.sendUrgentEmail(email, userName);
      if (res.success) {
        showToast({
          type: 'success',
          title: 'Đã gửi email nhắc việc gấp!',
          message: `${res.message}\nĐịa chỉ nhận: ${email}`,
          duration: 6000
        });
      } else {
        showToast({
          type: 'info',
          title: 'Nhắc nhở công việc',
          message: res.message || 'Hiện tại không có việc gấp nào cần gửi email cảnh báo.',
          duration: 4000
        });
      }
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Gửi email thất bại',
        message: err.response?.data?.error || err.message || 'Không thể kết nối đến máy chủ gửi email.',
        duration: 5000
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const [timeRangeMode, setTimeRangeMode] = useState('standard'); // 'standard' (6:00-24:00) | 'all' (0:00-24:00)

  const activeTimeSlots = timeRangeMode === 'standard' ? STANDARD_TIME_SLOTS : ALL_TIME_SLOTS;

  const getFixedForDayAndTime = (dayId, startH, endH) => {
    return fixedSchedules.filter(fs => {
      if (fs.dayOfWeek !== dayId) return false;
      const fsStartH = parseInt(fs.startTime.split(':')[0], 10);
      const fsEndH = parseInt(fs.endTime.split(':')[0], 10) || (fsStartH + 1);
      return (fsStartH < endH && fsEndH > startH) || fsStartH === startH;
    });
  };

  const getSubtasksForDayAndTime = (dayId, startH, endH) => {
    return subtasks.filter(st => {
      const d = new Date(st.startTime);
      const day = d.getDay() === 0 ? 7 : d.getDay();
      if (day !== dayId) return false;
      const stH = d.getHours();
      return stH >= startH && stH < endH;
    });
  };

  // Combine tasks and fixed schedules (meetings, exams, events) for deadline box
  const combinedDeadlines = useMemo(() => {
    const list = tasks.map(t => {
      const lower = (t.title || '').toLowerCase();
      const isMeeting = lower.includes('họp') || lower.includes('meeting') || lower.includes('gặp');
      const isExam = lower.includes('thi') || lower.includes('kiểm tra') || lower.includes('bảo vệ') || lower.includes('đồ án');
      return {
        ...t,
        category: isMeeting ? 'MEETING' : isExam ? 'EXAM' : 'TASK',
        displayDate: new Date(t.deadline).toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })
      };
    });

    // Add fixed schedules that are meetings, exams, or events if not already duplicated by title
    fixedSchedules.forEach(fs => {
      const lower = (fs.title || '').toLowerCase();
      const isMeeting = lower.includes('họp') || lower.includes('meeting') || lower.includes('gặp');
      const isExam = lower.includes('thi') || lower.includes('kiểm tra') || lower.includes('bảo vệ') || lower.includes('đồ án');
      const alreadyHasTask = list.some(t => t.title.toLowerCase().trim() === fs.title.toLowerCase().trim());

      if (!alreadyHasTask) {
        const now = new Date();
        const curDay = now.getDay() === 0 ? 7 : now.getDay();
        let diffDays = fs.dayOfWeek - curDay;
        if (diffDays < 0) diffDays += 7;
        const eventDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffDays);
        if (fs.startTime) {
          const [h, m] = fs.startTime.split(':').map(Number);
          if (!isNaN(h)) eventDate.setHours(h, m || 0, 0, 0);
        }

        list.push({
          id: fs.id,
          title: fs.title,
          subject: isMeeting ? 'Lịch Họp' : isExam ? 'Lịch Thi' : 'Lịch Trình',
          deadline: eventDate.toISOString(),
          priority: isMeeting || isExam ? 'URGENT' : 'HIGH',
          category: isMeeting ? 'MEETING' : isExam ? 'EXAM' : 'SCHEDULE',
          displayDate: `Thứ ${fs.dayOfWeek === 7 ? 'CN' : (fs.dayOfWeek + 1)} (${fs.startTime} - ${fs.endTime})`
        });
      }
    });

    // Sort by nearest deadline
    return list.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()).slice(0, 7);
  }, [tasks, fixedSchedules]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#fafdfa] dark:bg-[#080d0b] p-4 sm:p-6 select-none transition-colors duration-200">
      {/* 1. Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-2xl font-black text-[#1b3d2f] dark:text-[#f0fdf4] tracking-tight flex items-center gap-2">
            <span>Chào buổi sáng, {user?.name || 'bạn'}!</span>
            <span className="text-xl">☀️</span>
          </h2>
          <p className="text-xs font-semibold text-[#668575] dark:text-[#8ba396] mt-0.5">Biến mọi suy nghĩ hỗn độn thành kế hoạch hành động.</p>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Send Urgent Email Shortcut Button (PRO) */}
          <button
            onClick={handleSendUrgentEmail}
            disabled={isSendingEmail}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#fff2ee] dark:bg-rose-950/40 hover:bg-[#ffe5dc] dark:hover:bg-rose-900/50 border border-[#fecdc2] dark:border-rose-900 text-[#c23622] dark:text-rose-300 text-xs font-black shadow-2xs transition cursor-pointer disabled:opacity-50"
            title="Gửi ngay danh sách các việc gấp về hộp thư email (Dành riêng cho gói PRO ⭐)"
          >
            {isSendingEmail ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#c23622] dark:text-rose-300" />
            ) : (
              <Mail className="w-3.5 h-3.5 text-[#c23622] dark:text-rose-300" />
            )}
            <span>{isSendingEmail ? 'Đang gửi mail...' : 'Báo việc gấp về Mail'}</span>
            <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-rose-200 dark:bg-rose-900/80 text-rose-900 dark:text-rose-200 uppercase">
              PRO
            </span>
          </button>

          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#121c18] border border-[#e2eee5] dark:border-[#22362d] text-[#345946] dark:text-emerald-300 text-xs font-bold shadow-2xs">
            <CalendarIcon className="w-3.5 h-3.5 text-[#2b7255] dark:text-emerald-400" />
            <span>{new Date().toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric' })}</span>
          </div>

          <div className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-[#fff7eb] dark:bg-amber-950/40 border border-[#fde1be] dark:border-amber-800 text-[#b45309] dark:text-amber-400 text-xs font-bold shadow-2xs">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{stats?.streakDays || user?.streakDays || 0} ngày streak</span>
          </div>

          {/* User Profile, Plan Badge & Direct Logout Button */}
          {user ? (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-white dark:bg-[#121c18] border border-[#e1ece4] dark:border-[#22362d] text-[#1b4d3e] dark:text-emerald-300 text-xs font-bold shadow-2xs">
                <span className="text-sm">{user.avatar || '👩‍🎓'}</span>
                <span>{user.name}</span>

                {/* Account Plan Badge (FREE vs PRO) */}
                {user.plan === 'PRO' || user.role === 'ADMIN' ? (
                  <button
                    onClick={onOpenUpgrade}
                    className="ml-1 text-[10px] font-black px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 flex items-center gap-1 shadow-xs cursor-pointer hover:brightness-105"
                    title="Gói PRO Cao Cấp - Bấm để xem chi tiết"
                  >
                    <Crown className="w-3 h-3 fill-amber-950" />
                    <span>PRO</span>
                  </button>
                ) : (
                  <button
                    onClick={onOpenUpgrade}
                    className="ml-1 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700"
                    title="Gói Miễn Phí (FREE) - Bấm để nâng cấp PRO"
                  >
                    FREE
                  </button>
                )}
              </div>

              {/* Upgrade to PRO button for FREE accounts */}
              {user.plan !== 'PRO' && user.role !== 'ADMIN' && (
                <button
                  onClick={onOpenUpgrade}
                  className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-black shadow-xs transition cursor-pointer flex items-center space-x-1"
                  title="Nâng cấp lên gói PRO để mở khóa toàn bộ AI"
                >
                  <Zap className="w-3.5 h-3.5 fill-white" />
                  <span className="hidden sm:inline">Nâng cấp PRO</span>
                </button>
              )}

              <button
                onClick={onLogout}
                className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center space-x-1"
                title="Đăng xuất"
              >
                <span>Đăng xuất</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3 py-1.5 rounded-xl bg-[#1b4d3e] dark:bg-emerald-600 hover:bg-[#143e31] dark:hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center space-x-1"
            >
              <User className="w-3.5 h-3.5" />
              <span>Đăng nhập</span>
            </button>
          )}

          {/* Dark/Light Quick Toggle Switch - Top Right Header */}
          <ThemeSwitch className="ml-1" />
        </div>
      </div>

      {/* 2. Top 3 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-5">
        {/* Card 1: Deadline overload */}
        <div className="p-4 rounded-2xl bg-[#fff6f4] dark:bg-[#1e1414] border border-[#fddbd6] dark:border-[#3d2424] flex flex-col justify-between shadow-2xs">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-[#fde5e1] dark:bg-rose-900/40 text-[#d94834] dark:text-rose-400 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-[#c23622] dark:text-rose-400">
                {stats?.workloadStatus === 'OVERLOAD' ? 'Cảnh báo quá tải deadline' : 'Khối lượng học tập'}
              </h4>
              <p className="text-[11px] text-[#8c4b40] dark:text-[#d3968d] font-medium mt-0.5">
                {stats?.workloadText || 'Tải học tập đang cân đối, hãy tiếp tục duy trì!'}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#fde5e1] dark:border-[#382020]">
            <button 
              onClick={() => onAskAI('Gợi ý cách tối ưu lịch học tập tuần này cho mình')}
              className="text-xs font-bold text-[#c23622] dark:text-rose-400 hover:underline flex items-center space-x-1"
            >
              <span>Nhờ AI hỗ trợ</span>
              <ArrowRight className="w-3 h-3" />
            </button>

            <button
              onClick={handleSendUrgentEmail}
              disabled={isSendingEmail}
              className="text-[11px] font-black text-[#c23622] dark:text-rose-300 hover:text-[#991b1b] bg-white dark:bg-[#281818] border border-[#fecdc2] dark:border-[#482828] px-2.5 py-1 rounded-lg flex items-center space-x-1 shadow-2xs transition cursor-pointer"
            >
              <Mail className="w-3 h-3 text-[#c23622] dark:text-rose-400" />
              <span>Gửi Mail</span>
            </button>
          </div>
        </div>

        {/* Card 2: Today Progress */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#121c18] border border-[#e1eee4] dark:border-[#22362d] flex items-center space-x-4 shadow-2xs">
          <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="28" cy="28" r="23" stroke="#e8f3ea" className="dark:stroke-[#1d2d26]" strokeWidth="5" fill="transparent" />
              <circle
                cx="28"
                cy="28"
                r="23"
                stroke="#10b981"
                strokeWidth="5"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 23}
                strokeDashoffset={2 * Math.PI * 23 * (1 - (stats?.completionRate || 0) / 100)}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute font-black text-xs text-[#1b4d3e] dark:text-emerald-400">
              {stats?.completionRate || 0}%
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-extrabold text-xs text-[#1b3d2f] dark:text-slate-100">Tiến độ hoàn thành</h4>
            <p className="text-[11px] text-[#638272] dark:text-[#8aa396] font-semibold mt-0.5">
              {stats?.doneSubtasks || 0} / {stats?.totalSubtasks || 0} khối việc đã xong
            </p>
            <div className="w-full h-1.5 bg-[#e8f3ea] dark:bg-[#1d2d26] rounded-full overflow-hidden mt-2">
              <div className="h-full bg-[#1b7a53] dark:bg-emerald-500 rounded-full" style={{ width: `${stats?.completionRate || 0}%` }}></div>
            </div>
          </div>
        </div>

        {/* Card 3: Motivation */}
        <div className="p-4 rounded-2xl bg-[#ebf8ee] dark:bg-[#10231b] border border-[#d2edd6] dark:border-[#1d3d2e] flex items-center space-x-3.5 shadow-2xs">
          <div className="w-11 h-11 rounded-full bg-white dark:bg-[#183126] border border-[#c1e8c7] dark:border-[#274c39] flex items-center justify-center text-lg shrink-0 shadow-2xs">
            🌿
          </div>
          <div>
            <h4 className="font-black text-xs text-[#1b4d3e] dark:text-emerald-300">Cố lên nhé!</h4>
            <p className="text-[11px] text-[#3e7655] dark:text-emerald-400 font-semibold mt-0.5">Bạn đang làm rất tốt ✨</p>
          </div>
        </div>
      </div>

      {/* 3. Main Split Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Subcolumn */}
        <div className="lg:col-span-4 space-y-4">
          {/* Today's Deadline Box */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#121c18] border border-[#e1eee4] dark:border-[#22362d] shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-4 h-4 text-[#1b7a53] dark:text-emerald-400" />
                <h3 className="font-extrabold text-xs text-[#1b3d2f] dark:text-slate-100">Hạn Chót Deadline</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSendUrgentEmail}
                  disabled={isSendingEmail}
                  className="text-[10px] font-bold text-[#c23622] dark:text-rose-400 hover:bg-[#fee2e2] dark:hover:bg-rose-950/60 bg-[#fef2f2] dark:bg-rose-950/40 px-2 py-0.5 rounded-md flex items-center space-x-1 transition cursor-pointer"
                  title="Gửi danh sách hạn chót về email"
                >
                  <Mail className="w-2.5 h-2.5" />
                  <span>Báo Mail</span>
                </button>
                <span 
                  onClick={() => onAskAI('Liệt kê danh sách tất cả deadline gấp sắp tới')}
                  className="text-[10px] font-bold text-[#2d7d59] dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  Xem tất cả →
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {combinedDeadlines.length === 0 ? (
                <div className="py-6 text-center text-slate-400 dark:text-slate-500 text-xs">
                  Chưa có deadline nào. Hãy gõ vào khung chat AI bên phải để thêm việc nhé!
                </div>
              ) : (
                combinedDeadlines.map((t) => {
                  const isDone = t.status === 'DONE';
                  return (
                    <div key={t.id} className={`flex items-center justify-between p-2 rounded-xl transition ${
                      isDone ? 'bg-[#f4f7f5] dark:bg-[#16231c] opacity-70' : 'hover:bg-[#f6faf7] dark:hover:bg-[#16241e]'
                    }`}>
                      <div className="flex items-center space-x-2.5 min-w-0">
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        ) : (
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            t.category === 'MEETING' ? 'bg-blue-500' :
                            t.category === 'EXAM' ? 'bg-rose-500' :
                            t.priority === 'URGENT' ? 'bg-red-500' : 
                            t.priority === 'HIGH' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}></span>
                        )}
                        <div className="min-w-0">
                          <p className={`font-bold text-xs truncate ${isDone ? 'line-through text-slate-400 dark:text-slate-500' : 'text-[#1f3c30] dark:text-slate-200'}`}>
                            {t.title}
                          </p>
                          <p className="text-[10px] text-[#6d8a7c] dark:text-[#7f9e8f] font-medium">
                            {t.subject || 'Học tập'} • {t.displayDate || new Date(t.deadline).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold shrink-0 ${
                        isDone ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' :
                        t.category === 'MEETING' ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300' :
                        t.category === 'EXAM' ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300' :
                        t.priority === 'URGENT' ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300' : 
                        t.priority === 'HIGH' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300' : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                      }`}>
                        {isDone ? '✓ ĐÃ XONG' : t.category === 'MEETING' ? 'HỌP' : t.category === 'EXAM' ? 'THI' : t.priority}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Stats Box */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#121c18] border border-[#e1eee4] dark:border-[#22362d] shadow-2xs">
            <div className="flex items-center space-x-2 mb-3">
              <Clock className="w-4 h-4 text-[#1b7a53] dark:text-emerald-400" />
              <h3 className="font-extrabold text-xs text-[#1b3d2f] dark:text-slate-100">Thống Kê Nhanh</h3>
            </div>

            <div className="space-y-2 text-xs font-semibold">
              <div className="flex items-center justify-between text-[#537263] dark:text-[#8aa396]">
                <span>Tổng số task (tuần này)</span>
                <span className="font-bold text-[#1b3d2f] dark:text-slate-100">{stats?.totalTasks || 0}</span>
              </div>
              <div className="flex items-center justify-between text-[#537263] dark:text-[#8aa396]">
                <span>Đã hoàn thành</span>
                <span className="font-bold text-[#1b7a53] dark:text-emerald-400">{stats?.completedTasks || 0}</span>
              </div>
              <div className="flex items-center justify-between text-[#537263] dark:text-[#8aa396]">
                <span>Khối việc AI đã xếp</span>
                <span className="font-bold text-[#1b3d2f] dark:text-slate-100">{stats?.totalSubtasks || 0}</span>
              </div>
              <div className="flex items-center justify-between text-[#537263] dark:text-[#8aa396]">
                <span>Tổng giờ học dự kiến</span>
                <span className="font-bold text-[#1b3d2f] dark:text-slate-100">{stats?.totalHours || '0'}h</span>
              </div>
            </div>
          </div>

          {/* Chat AI Shortcut Card */}
          <div 
            onClick={() => onAskAI('Gợi ý cách bắt đầu công việc hôm nay')}
            className="p-3.5 rounded-2xl bg-[#ebf8ee] dark:bg-[#10231b] border border-[#cfe8d4] dark:border-[#1d3d2e] flex items-center justify-between cursor-pointer hover:bg-[#e2f5e6] dark:hover:bg-[#152e23] transition shadow-2xs"
          >
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-white dark:bg-[#183126] text-[#1b7a53] dark:text-emerald-400 shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-[#1b4d3e] dark:text-emerald-300">Trợ lý AI Planner</h4>
                <p className="text-[10px] text-[#558268] dark:text-[#7f9e8f]">Gõ việc cần làm, chia nhỏ và xếp lịch tức thì...</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#1b7a53] dark:text-emerald-400" />
          </div>
        </div>

        {/* Right Subcolumn: Weekly Timetable Grid */}
        <div className="lg:col-span-8 flex flex-col rounded-2xl bg-white dark:bg-[#121c18] border border-[#e1eee4] dark:border-[#22362d] p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-4 h-4 text-[#1b7a53] dark:text-emerald-400" />
              <h3 className="font-extrabold text-xs text-[#1b3d2f] dark:text-slate-100">Thời Khóa Biểu Tuần</h3>
            </div>

            <div className="flex items-center space-x-1.5 text-xs text-[#527362] dark:text-[#8aa396] font-bold">
              <div className="flex items-center bg-[#eef6f0] dark:bg-[#162720] p-0.5 rounded-lg border border-[#d6e9dc] dark:border-[#22392e] text-[10px]">
                <button
                  onClick={() => setTimeRangeMode('standard')}
                  className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
                    timeRangeMode === 'standard'
                      ? 'bg-white dark:bg-[#1f372c] text-emerald-800 dark:text-emerald-300 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                  }`}
                  title="Hiển thị từ 6:00 đến 24:00"
                >
                  6:00 - 24:00
                </button>
                <button
                  onClick={() => setTimeRangeMode('all')}
                  className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
                    timeRangeMode === 'all'
                      ? 'bg-white dark:bg-[#1f372c] text-emerald-800 dark:text-emerald-300 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                  }`}
                  title="Hiển thị đầy đủ 24 khung giờ"
                >
                  24 Khung Giờ
                </button>
              </div>
            </div>
          </div>

          {/* Timetable Matrix - Range Slots with Smooth Scroll */}
          <div className="flex-1 overflow-x-auto max-h-[500px] overflow-y-auto pr-1">
            <table className="w-full border-collapse min-w-[580px]">
              <thead className="sticky top-0 bg-white dark:bg-[#121c18] z-10">
                <tr className="border-b border-[#e9f2eb] dark:border-[#1d2c26]">
                  <th className="p-1.5 w-24 text-[10px] font-extrabold text-[#839e90] text-left">Khung giờ</th>
                  {dynamicWeekDays.map((day) => (
                    <th key={day.key} className="p-1 text-center">
                      <div className={`py-1 px-1 rounded-xl flex flex-col items-center ${
                        day.isToday ? 'bg-[#dcf4e2] dark:bg-[#1b3e2d] text-[#134932] dark:text-emerald-300 font-black' : 'text-[#486b59] dark:text-[#7f9e8f] font-bold'
                      }`}>
                        <span className="text-[10px] uppercase font-bold">{day.label} ({day.dayNum})</span>
                        <span className="text-[11px] font-mono font-black text-emerald-700 dark:text-emerald-400">{day.dateFormatted}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {activeTimeSlots.map((slot) => {
                  return (
                    <tr key={slot.label} className="border-b border-[#f0f6f2] dark:border-[#17241e] min-h-[46px]">
                      <td className="py-2.5 pr-2 text-[10px] font-mono font-extrabold text-[#719181] dark:text-[#6a8d7d] align-top whitespace-nowrap">
                        {slot.label}
                      </td>

                      {dynamicWeekDays.map((day) => {
                        const fixedList = getFixedForDayAndTime(day.key, slot.startH, slot.endH);
                        const subList = getSubtasksForDayAndTime(day.key, slot.startH, slot.endH);

                        return (
                          <td key={day.key} className="p-1 align-top w-[14%]">
                            {/* Fixed Items */}
                            {fixedList.map((fs) => (
                              <div
                                key={fs.id}
                                className="group relative p-1.5 rounded-xl bg-[#e2effa] dark:bg-[#152a3d] text-[#1e5687] dark:text-[#7cc0f7] border border-[#cbe3f5] dark:border-[#1e3e5b] text-[10px] leading-tight mb-1 shadow-2xs font-bold transition hover:border-[#a8d3f5] dark:hover:border-[#2b5982]"
                              >
                                <div className="flex items-start justify-between space-x-1">
                                  <div className="truncate flex-1 min-w-0">{fs.title}</div>
                                  <button
                                    onClick={(e) => handleOpenDeleteConfirm(e, fs, 'fixed')}
                                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-rose-500 hover:text-white hover:bg-rose-500 dark:hover:bg-rose-600 transition cursor-pointer shrink-0 -mt-0.5 -mr-0.5"
                                    title="Xóa môn học này khỏi TKB"
                                  >
                                    <X className="w-2.5 h-2.5 stroke-[2.5]" />
                                  </button>
                                </div>
                                <div className="text-[8.5px] opacity-80 mt-0.5">{fs.startTime} - {fs.endTime}</div>
                              </div>
                            ))}

                            {/* Subtask Items */}
                            {subList.map((st) => {
                              const isDone = st.status === 'DONE';
                              return (
                                <div
                                  key={st.id}
                                  onClick={() => onOpenPomodoro(st)}
                                  className={`group relative p-1.5 rounded-xl border text-[10px] leading-tight mb-1 shadow-2xs font-bold cursor-pointer transition ${
                                    isDone
                                      ? 'bg-[#f0f6f2] dark:bg-[#16231c] text-[#557a64] dark:text-[#7f9e8f] border-[#c5decb] dark:border-[#22362c] opacity-80'
                                      : 'bg-[#ebf8ee] dark:bg-[#13291e] text-[#29683e] dark:text-emerald-300 border-[#cbeecd] dark:border-[#1e412f] hover:bg-[#d8edd9] dark:hover:bg-[#1a3829]'
                                  }`}
                                >
                                  <div className="flex items-start justify-between space-x-1">
                                    <div className="flex items-center space-x-1 truncate min-w-0 flex-1">
                                      {isDone ? (
                                        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                      ) : (
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                                      )}
                                      <span className={`truncate ${isDone ? 'line-through text-slate-500' : ''}`}>{st.title}</span>
                                    </div>
                                    <button
                                      onClick={(e) => handleOpenDeleteConfirm(e, st, 'subtask')}
                                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-rose-500 hover:text-white hover:bg-rose-500 dark:hover:bg-rose-600 transition cursor-pointer shrink-0 -mt-0.5 -mr-0.5"
                                      title="Xóa nhiệm vụ này khỏi lịch"
                                    >
                                      <X className="w-2.5 h-2.5 stroke-[2.5]" />
                                    </button>
                                  </div>
                                  <div className="text-[8.5px] opacity-80 mt-0.5 flex items-center justify-between">
                                    <span>{st.durationMin}p</span>
                                    <span className={`px-1 py-0.2 rounded text-[8px] font-extrabold ${
                                      isDone ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' : 'bg-white/80 dark:bg-[#0e1713] text-emerald-900 dark:text-emerald-300'
                                    }`}>
                                      {isDone ? '✓ ĐÃ XONG' : 'Bấm mở Pomo'}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Bottom Pomodoro Banner */}
          <div 
            onClick={() => onOpenPomodoro({ title: 'Tập trung học tập', durationMin: 25, taskSubject: 'Tự học' })}
            className="mt-3 p-2.5 rounded-xl bg-[#eef7ff] dark:bg-[#122436] border border-[#cde4fc] dark:border-[#1d3854] text-[#1b63ab] dark:text-[#7abaff] flex items-center justify-between text-xs font-bold cursor-pointer hover:bg-[#e2f0fc] dark:hover:bg-[#162e47] transition shadow-2xs"
          >
            <div className="flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-[#2575c9] dark:text-[#7abaff]" />
              <span>Bấm vào một khối thời gian bất kỳ để bắt đầu Pomodoro đếm giờ</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-[#2575c9] dark:text-[#7abaff]" />
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-[#121c18] border border-slate-200 dark:border-[#22382e] rounded-2xl shadow-2xl p-5 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Xác nhận xóa khỏi lịch?
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {deleteModal.type === 'fixed' ? 'Lịch cố định (TKB)' : 'Nhiệm vụ AI xếp'}
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-[#182620] rounded-xl border border-slate-100 dark:border-[#22382e] mb-4">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-2">
                "{deleteModal.item?.title}"
              </p>
              {deleteModal.item?.startTime && (
                <p className="text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400 mt-1">
                  ⏰ Khung giờ: {deleteModal.item?.startTime} {deleteModal.item?.endTime ? `- ${deleteModal.item?.endTime}` : ''}
                </p>
              )}
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
              Bạn có chắc chắn muốn xóa mục này không? Khung giờ tương ứng sẽ được giải phóng trên lịch trình.
            </p>

            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={() => setDeleteModal({ isOpen: false, item: null, type: 'subtask', isDeleting: false })}
                disabled={deleteModal.isDeleting}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1a2c24] transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleExecuteDelete}
                disabled={deleteModal.isDeleting}
                className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-xs transition flex items-center space-x-1.5 cursor-pointer"
              >
                {deleteModal.isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang xóa...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa ngay</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

