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
  Loader2
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { api } from '../api/client';

const WEEK_DAYS = [
  { key: 1, label: 'Mon', dayNum: 'T2' },
  { key: 2, label: 'Tue', dayNum: 'T3', isToday: true },
  { key: 3, label: 'Wed', dayNum: 'T4' },
  { key: 4, label: 'Thu', dayNum: 'T5' },
  { key: 5, label: 'Fri', dayNum: 'T6' },
  { key: 6, label: 'Sat', dayNum: 'T7' },
  { key: 7, label: 'Sun', dayNum: 'CN' }
];

const TIME_ROWS = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];

export default function DashboardCenter({ 
  user,
  tasks = [], 
  subtasks = [], 
  fixedSchedules = [], 
  stats, 
  onOpenPomodoro, 
  onAskAI, 
  onOpenAuth, 
  onLogout 
}) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const { showToast } = useToast();

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

  const getFixedForDayAndTime = (dayId, timeHour) => {
    return fixedSchedules.filter(fs => {
      if (fs.dayOfWeek !== dayId) return false;
      const startH = parseInt(fs.startTime.split(':')[0], 10);
      return Math.abs(startH - timeHour) < 2;
    });
  };

  const getSubtasksForDayAndTime = (dayId, timeHour) => {
    return subtasks.filter(st => {
      const d = new Date(st.startTime);
      const day = d.getDay() === 0 ? 7 : d.getDay();
      if (day !== dayId) return false;
      const startH = d.getHours();
      return Math.abs(startH - timeHour) < 2;
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
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#fafdfa] p-4 sm:p-6 select-none">
      {/* 1. Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-2xl font-black text-[#1b3d2f] tracking-tight flex items-center gap-2">
            <span>Chào buổi sáng, {user?.name || 'bạn'}!</span>
            <span className="text-xl">☀️</span>
          </h2>
          <p className="text-xs font-semibold text-[#668575] mt-0.5">Biến mọi suy nghĩ hỗn độn thành kế hoạch hành động.</p>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Send Urgent Email Shortcut Button */}
          <button
            onClick={handleSendUrgentEmail}
            disabled={isSendingEmail}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#fff2ee] hover:bg-[#ffe5dc] border border-[#fecdc2] text-[#c23622] text-xs font-black shadow-2xs transition cursor-pointer disabled:opacity-50"
            title="Gửi ngay danh sách các việc gấp về hộp thư email"
          >
            {isSendingEmail ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#c23622]" />
            ) : (
              <Mail className="w-3.5 h-3.5 text-[#c23622]" />
            )}
            <span>{isSendingEmail ? 'Đang gửi mail...' : 'Báo việc gấp về Mail'}</span>
          </button>

          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#e2eee5] text-[#345946] text-xs font-bold shadow-2xs">
            <CalendarIcon className="w-3.5 h-3.5 text-[#2b7255]" />
            <span>{new Date().toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric' })}</span>
          </div>

          <div className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-[#fff7eb] border border-[#fde1be] text-[#b45309] text-xs font-bold shadow-2xs">
            <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>{stats?.streakDays || user?.streakDays || 0} ngày streak</span>
          </div>

          {/* User Profile & Direct Logout Button */}
          {user ? (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl bg-white border border-[#e1ece4] text-[#1b4d3e] text-xs font-bold shadow-2xs">
                <span className="text-sm">{user.avatar || '👩‍🎓'}</span>
                <span>{user.name}</span>
              </div>
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
              className="px-3 py-1.5 rounded-xl bg-[#1b4d3e] hover:bg-[#143e31] text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center space-x-1"
            >
              <User className="w-3.5 h-3.5" />
              <span>Đăng nhập</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Top 3 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-5">
        {/* Card 1: Deadline overload */}
        <div className="p-4 rounded-2xl bg-[#fff6f4] border border-[#fddbd6] flex flex-col justify-between shadow-2xs">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-xl bg-[#fde5e1] text-[#d94834] shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-[#c23622]">
                {stats?.workloadStatus === 'OVERLOAD' ? 'Cảnh báo quá tải deadline' : 'Khối lượng học tập'}
              </h4>
              <p className="text-[11px] text-[#8c4b40] font-medium mt-0.5">
                {stats?.workloadText || 'Tải học tập đang cân đối, hãy tiếp tục duy trì!'}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#fde5e1]">
            <button 
              onClick={() => onAskAI('Gợi ý cách tối ưu lịch học tập tuần này cho mình')}
              className="text-xs font-bold text-[#c23622] hover:underline flex items-center space-x-1"
            >
              <span>Nhờ AI hỗ trợ</span>
              <ArrowRight className="w-3 h-3" />
            </button>

            <button
              onClick={handleSendUrgentEmail}
              disabled={isSendingEmail}
              className="text-[11px] font-black text-[#c23622] hover:text-[#991b1b] bg-white border border-[#fecdc2] px-2.5 py-1 rounded-lg flex items-center space-x-1 shadow-2xs transition cursor-pointer"
            >
              <Mail className="w-3 h-3 text-[#c23622]" />
              <span>Gửi Mail</span>
            </button>
          </div>
        </div>

        {/* Card 2: Today Progress */}
        <div className="p-4 rounded-2xl bg-white border border-[#e1eee4] flex items-center space-x-4 shadow-2xs">
          <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="28" cy="28" r="23" stroke="#e8f3ea" strokeWidth="5" fill="transparent" />
              <circle
                cx="28"
                cy="28"
                r="23"
                stroke="#1b7a53"
                strokeWidth="5"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 23}
                strokeDashoffset={2 * Math.PI * 23 * (1 - (stats?.completionRate || 0) / 100)}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute font-black text-xs text-[#1b4d3e]">
              {stats?.completionRate || 0}%
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-extrabold text-xs text-[#1b3d2f]">Tiến độ hoàn thành</h4>
            <p className="text-[11px] text-[#638272] font-semibold mt-0.5">
              {stats?.doneSubtasks || 0} / {stats?.totalSubtasks || 0} khối việc đã xong
            </p>
            <div className="w-full h-1.5 bg-[#e8f3ea] rounded-full overflow-hidden mt-2">
              <div className="h-full bg-[#1b7a53] rounded-full" style={{ width: `${stats?.completionRate || 0}%` }}></div>
            </div>
          </div>
        </div>

        {/* Card 3: Motivation */}
        <div className="p-4 rounded-2xl bg-[#ebf8ee] border border-[#d2edd6] flex items-center space-x-3.5 shadow-2xs">
          <div className="w-11 h-11 rounded-full bg-white border border-[#c1e8c7] flex items-center justify-center text-lg shrink-0 shadow-2xs">
            🌿
          </div>
          <div>
            <h4 className="font-black text-xs text-[#1b4d3e]">Cố lên nhé!</h4>
            <p className="text-[11px] text-[#3e7655] font-semibold mt-0.5">Bạn đang làm rất tốt ✨</p>
          </div>
        </div>
      </div>

      {/* 3. Main Split Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Subcolumn */}
        <div className="lg:col-span-4 space-y-4">
          {/* Today's Deadline Box */}
          <div className="p-4 rounded-2xl bg-white border border-[#e1eee4] shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-4 h-4 text-[#1b7a53]" />
                <h3 className="font-extrabold text-xs text-[#1b3d2f]">Hạn Chót Deadline</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSendUrgentEmail}
                  disabled={isSendingEmail}
                  className="text-[10px] font-bold text-[#c23622] hover:bg-[#fee2e2] bg-[#fef2f2] px-2 py-0.5 rounded-md flex items-center space-x-1 transition cursor-pointer"
                  title="Gửi danh sách hạn chót về email"
                >
                  <Mail className="w-2.5 h-2.5" />
                  <span>Báo Mail</span>
                </button>
                <span 
                  onClick={() => onAskAI('Liệt kê danh sách tất cả deadline gấp sắp tới')}
                  className="text-[10px] font-bold text-[#2d7d59] hover:underline cursor-pointer"
                >
                  Xem tất cả →
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {combinedDeadlines.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs">
                  Chưa có deadline nào. Hãy gõ vào khung chat AI bên phải để thêm việc nhé!
                </div>
              ) : (
                combinedDeadlines.map((t) => {
                  const isDone = t.status === 'DONE';
                  return (
                    <div key={t.id} className={`flex items-center justify-between p-2 rounded-xl transition ${
                      isDone ? 'bg-[#f4f7f5] opacity-70' : 'hover:bg-[#f6faf7]'
                    }`}>
                      <div className="flex items-center space-x-2.5 min-w-0">
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            t.category === 'MEETING' ? 'bg-blue-600' :
                            t.category === 'EXAM' ? 'bg-rose-600' :
                            t.priority === 'URGENT' ? 'bg-red-500' : 
                            t.priority === 'HIGH' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}></span>
                        )}
                        <div className="min-w-0">
                          <p className={`font-bold text-xs truncate ${isDone ? 'line-through text-slate-400' : 'text-[#1f3c30]'}`}>
                            {t.title}
                          </p>
                          <p className="text-[10px] text-[#6d8a7c] font-medium">
                            {t.subject || 'Học tập'} • {t.displayDate || new Date(t.deadline).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold shrink-0 ${
                        isDone ? 'bg-emerald-100 text-emerald-800' :
                        t.category === 'MEETING' ? 'bg-blue-100 text-blue-800' :
                        t.category === 'EXAM' ? 'bg-rose-100 text-rose-800' :
                        t.priority === 'URGENT' ? 'bg-red-100 text-red-700' : 
                        t.priority === 'HIGH' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
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
          <div className="p-4 rounded-2xl bg-white border border-[#e1eee4] shadow-2xs">
            <div className="flex items-center space-x-2 mb-3">
              <Clock className="w-4 h-4 text-[#1b7a53]" />
              <h3 className="font-extrabold text-xs text-[#1b3d2f]">Thống Kê Nhanh</h3>
            </div>

            <div className="space-y-2 text-xs font-semibold">
              <div className="flex items-center justify-between text-[#537263]">
                <span>Tổng số task (tuần này)</span>
                <span className="font-bold text-[#1b3d2f]">{stats?.totalTasks || 0}</span>
              </div>
              <div className="flex items-center justify-between text-[#537263]">
                <span>Đã hoàn thành</span>
                <span className="font-bold text-[#1b7a53]">{stats?.completedTasks || 0}</span>
              </div>
              <div className="flex items-center justify-between text-[#537263]">
                <span>Khối việc AI đã xếp</span>
                <span className="font-bold text-[#1b3d2f]">{stats?.totalSubtasks || 0}</span>
              </div>
              <div className="flex items-center justify-between text-[#537263]">
                <span>Tổng giờ học dự kiến</span>
                <span className="font-bold text-[#1b3d2f]">{stats?.totalHours || '0'}h</span>
              </div>
            </div>
          </div>

          {/* Chat AI Shortcut Card */}
          <div 
            onClick={() => onAskAI('Gợi ý cách bắt đầu công việc hôm nay')}
            className="p-3.5 rounded-2xl bg-[#ebf8ee] border border-[#cfe8d4] flex items-center justify-between cursor-pointer hover:bg-[#e2f5e6] transition shadow-2xs"
          >
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-white text-[#1b7a53] shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-[#1b4d3e]">Trợ lý AI Planner</h4>
                <p className="text-[10px] text-[#558268]">Gõ việc cần làm, chia nhỏ và xếp lịch tức thì...</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#1b7a53]" />
          </div>
        </div>

        {/* Right Subcolumn: Weekly Timetable Grid */}
        <div className="lg:col-span-8 flex flex-col rounded-2xl bg-white border border-[#e1eee4] p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-4 h-4 text-[#1b7a53]" />
              <h3 className="font-extrabold text-xs text-[#1b3d2f]">Thời Khóa Biểu Tuần</h3>
            </div>

            <div className="flex items-center space-x-1.5 text-xs text-[#527362] font-bold">
              <span className="px-2 py-0.5 rounded-md bg-[#f1f7f3] border border-[#e2ede5] text-[11px]">
                Tuần này
              </span>
            </div>
          </div>

          {/* Timetable Matrix */}
          <div className="flex-1 overflow-x-auto overflow-y-auto">
            <table className="w-full border-collapse min-w-[560px]">
              <thead>
                <tr className="border-b border-[#e9f2eb]">
                  <th className="p-1.5 w-12 text-[10px] font-bold text-[#839e90] text-left"></th>
                  {WEEK_DAYS.map((day) => (
                    <th key={day.key} className="p-1.5 text-center">
                      <div className={`py-1 px-1.5 rounded-xl flex flex-col items-center ${
                        day.isToday ? 'bg-[#dcf4e2] text-[#134932] font-black' : 'text-[#486b59] font-bold'
                      }`}>
                        <span className="text-[10px] uppercase">{day.label}</span>
                        <span className="text-[11px]">{day.dayNum}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {TIME_ROWS.map((timeStr) => {
                  const hour = parseInt(timeStr.split(':')[0], 10);
                  return (
                    <tr key={timeStr} className="border-b border-[#f0f6f2] min-h-[46px]">
                      <td className="py-2 pr-2 text-[10px] font-mono font-bold text-[#8aa396] align-top">
                        {timeStr}
                      </td>

                      {WEEK_DAYS.map((day) => {
                        const fixedList = getFixedForDayAndTime(day.key, hour);
                        const subList = getSubtasksForDayAndTime(day.key, hour);

                        return (
                          <td key={day.key} className="p-1 align-top w-[14%]">
                            {/* Fixed Items */}
                            {fixedList.map((fs) => (
                              <div
                                key={fs.id}
                                className="p-1.5 rounded-xl bg-[#e2effa] text-[#1e5687] border border-[#cbe3f5] text-[10px] leading-tight mb-1 shadow-2xs font-bold"
                              >
                                <div className="truncate">{fs.title}</div>
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
                                  className={`p-1.5 rounded-xl border text-[10px] leading-tight mb-1 shadow-2xs font-bold cursor-pointer transition ${
                                    isDone
                                      ? 'bg-[#f0f6f2] text-[#557a64] border-[#c5decb] opacity-80'
                                      : 'bg-[#ebf8ee] text-[#29683e] border-[#cbeecd] hover:bg-[#d8edd9]'
                                  }`}
                                >
                                  <div className="flex items-center space-x-1 truncate">
                                    {isDone ? (
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                    ) : (
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                                    )}
                                    <span className={`truncate ${isDone ? 'line-through text-slate-500' : ''}`}>{st.title}</span>
                                  </div>
                                  <div className="text-[8.5px] opacity-80 mt-0.5 flex items-center justify-between">
                                    <span>{st.durationMin}p</span>
                                    <span className={`px-1 py-0.2 rounded text-[8px] font-extrabold ${
                                      isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-white/80 text-emerald-900'
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
            className="mt-3 p-2.5 rounded-xl bg-[#eef7ff] border border-[#cde4fc] text-[#1b63ab] flex items-center justify-between text-xs font-bold cursor-pointer hover:bg-[#e2f0fc] transition shadow-2xs"
          >
            <div className="flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-[#2575c9]" />
              <span>Bấm vào một khối thời gian bất kỳ để bắt đầu Pomodoro đếm giờ</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-[#2575c9]" />
          </div>
        </div>
      </div>
    </div>
  );
}
