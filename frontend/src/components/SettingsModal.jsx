import React, { useState } from 'react';
import { X, Plus, Trash2, Key, BookOpen, Clock, ShieldCheck, Check, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const DAYS = [
  { id: 1, name: 'Thứ 2' },
  { id: 2, name: 'Thứ 3' },
  { id: 3, name: 'Thứ 4' },
  { id: 4, name: 'Thứ 5' },
  { id: 5, name: 'Thứ 6' },
  { id: 6, name: 'Thứ 7' },
  { id: 7, name: 'Chủ Nhật' }
];

export default function SettingsModal({
  fixedSchedules,
  onAddFixedSchedule,
  onDeleteFixedSchedule,
  apiKey,
  onSaveApiKey,
  onClose
}) {
  const { isDark, toggleTheme } = useTheme();
  const [keyInput, setKeyInput] = useState(apiKey || '');
  const [newTitle, setNewTitle] = useState('');
  const [newDay, setNewDay] = useState(1);
  const [newStart, setNewStart] = useState('08:00');
  const [newEnd, setNewEnd] = useState('11:30');
  const [savedKeySuccess, setSavedKeySuccess] = useState(false);

  const handleSaveKey = (e) => {
    e.preventDefault();
    onSaveApiKey(keyInput.trim());
    setSavedKeySuccess(true);
    setTimeout(() => setSavedKeySuccess(false), 2000);
  };

  const handleCreateFixed = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddFixedSchedule({
      title: newTitle.trim(),
      dayOfWeek: Number(newDay),
      startTime: newStart,
      endTime: newEnd,
      color: '#3b82f6'
    });
    setNewTitle('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#101915] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 relative border border-slate-200 dark:border-[#1d2c26] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#182720] transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-slate-900 dark:text-[#f0fdf4] mb-1">Cài Đặt Cá Nhân & Lịch Cố Định</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Tùy chỉnh thời khóa biểu, giao diện và kết nối AI</p>

        {/* 1. Dark Mode / Theme Selector Section */}
        <div className="bg-slate-50 dark:bg-[#14201a] border border-slate-200 dark:border-[#22362d] p-4 rounded-2xl mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1">
              {isDark ? <Moon className="w-4 h-4 text-emerald-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
              <span>Chế độ hiển thị (Theme)</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Chuyển đổi giữa chế độ Sáng (Mint/Sage) và chế độ Tối (Obsidian Forest)
            </p>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="px-4 py-2 rounded-xl bg-white dark:bg-[#1c2c24] border border-slate-200 dark:border-[#2b4438] text-xs font-bold text-slate-800 dark:text-emerald-300 flex items-center space-x-2 shadow-2xs hover:border-emerald-500 transition"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-emerald-600" />}
            <span>{isDark ? 'Bật Giao diện Sáng' : 'Bật Giao diện Tối'}</span>
          </button>
        </div>

        {/* 2. Gemini API Key */}
        <div className="bg-slate-50 dark:bg-[#14201a] border border-slate-200 dark:border-[#22362d] p-4 rounded-2xl mb-6">
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-2">
            <Key className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Google Gemini API Key (Tùy chọn)</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
            Nếu để trống, hệ thống sẽ sử dụng Rule Engine NLP thông minh tích hợp sẵn để demo mượt mà.
          </p>
          <form onSubmit={handleSaveKey} className="flex gap-2">
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="Dán AIzaSy... vào đây"
              className="flex-1 bg-white dark:bg-[#101915] border border-slate-300 dark:border-[#243d30] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center space-x-1"
            >
              {savedKeySuccess ? <Check className="w-4 h-4 text-white" /> : <span>Lưu Key</span>}
            </button>
          </form>
        </div>

        {/* 3. Fixed Schedules List & Add */}
        <div className="bg-slate-50 dark:bg-[#14201a] border border-slate-200 dark:border-[#22362d] p-4 rounded-2xl mb-6">
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-3">
            <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Thời Khóa Biểu Cố Định (AI sẽ tránh xếp việc vào giờ này)</span>
          </div>

          <form onSubmit={handleCreateFixed} className="grid grid-cols-1 sm:grid-cols-5 gap-2 mb-4">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Tên môn học / Hoạt động"
              className="sm:col-span-2 bg-white dark:bg-[#101915] border border-slate-300 dark:border-[#243d30] text-slate-900 dark:text-slate-100 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
            />
            <select
              value={newDay}
              onChange={(e) => setNewDay(e.target.value)}
              className="bg-white dark:bg-[#101915] border border-slate-300 dark:border-[#243d30] text-slate-900 dark:text-slate-100 rounded-xl px-2 py-1.5 text-xs focus:outline-none"
            >
              {DAYS.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <div className="flex items-center space-x-1 sm:col-span-1">
              <input
                type="text"
                value={newStart}
                onChange={(e) => setNewStart(e.target.value)}
                className="w-1/2 bg-white dark:bg-[#101915] border border-slate-300 dark:border-[#243d30] text-slate-900 dark:text-slate-100 rounded-lg px-1.5 py-1.5 text-xs text-center font-mono"
              />
              <span className="text-slate-400">-</span>
              <input
                type="text"
                value={newEnd}
                onChange={(e) => setNewEnd(e.target.value)}
                className="w-1/2 bg-white dark:bg-[#101915] border border-slate-300 dark:border-[#243d30] text-slate-900 dark:text-slate-100 rounded-lg px-1.5 py-1.5 text-xs text-center font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm</span>
            </button>
          </form>

          {/* List */}
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {fixedSchedules.map((fs) => (
              <div
                key={fs.id}
                className="p-2.5 rounded-xl bg-white dark:bg-[#101915] border border-slate-200 dark:border-[#22362d] flex items-center justify-between text-xs shadow-2xs"
              >
                <div>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{fs.title}</span>
                  <span className="text-slate-500 dark:text-slate-400 ml-2 font-mono">
                    ({DAYS.find(d => d.id === fs.dayOfWeek)?.name || 'Thứ 2'} • {fs.startTime} - {fs.endTime})
                  </span>
                </div>
                <button
                  onClick={() => onDeleteFixedSchedule(fs.id)}
                  className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Personal Constraints (C8: Giờ ngủ, giờ ăn, giờ tối đa/ngày, ngày nghỉ bảo vệ) */}
        <div className="bg-slate-50 dark:bg-[#14201a] border border-slate-200 dark:border-[#22362d] p-4 rounded-2xl mb-6 space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
            <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Ràng Buộc Cá Nhân & Thông Báo (Personal Constraints)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white dark:bg-[#101915] rounded-xl border border-slate-200 dark:border-[#243d30]">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                🌙 Giờ ngủ (AI không xếp bài vào giờ này):
              </label>
              <div className="flex items-center space-x-2">
                <input type="text" defaultValue="23:30" className="w-20 p-1 rounded-lg border border-slate-300 dark:border-[#2b4438] bg-transparent text-center font-mono" />
                <span>đến</span>
                <input type="text" defaultValue="07:00" className="w-20 p-1 rounded-lg border border-slate-300 dark:border-[#2b4438] bg-transparent text-center font-mono" />
              </div>
            </div>

            <div className="p-3 bg-white dark:bg-[#101915] rounded-xl border border-slate-200 dark:border-[#243d30]">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                ⚡ Số giờ học tối đa / ngày:
              </label>
              <select defaultValue="6" className="w-full p-1.5 rounded-lg border border-slate-300 dark:border-[#2b4438] bg-transparent font-bold">
                <option value="4">Tối đa 4 giờ/ngày (Nhẹ nhàng)</option>
                <option value="6">Tối đa 6 giờ/ngày (Khuyên dùng)</option>
                <option value="8">Tối đa 8 giờ/ngày (Cường độ cao)</option>
                <option value="10">Tối đa 10 giờ/ngày (Chế độ ôn thi)</option>
              </select>
            </div>

            <div className="p-3 bg-white dark:bg-[#101915] rounded-xl border border-slate-200 dark:border-[#243d30]">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                🏖️ Ngày nghỉ được bảo vệ:
              </label>
              <select defaultValue="7" className="w-full p-1.5 rounded-lg border border-slate-300 dark:border-[#2b4438] bg-transparent font-bold">
                <option value="7">Chủ Nhật (Nghỉ trọn vẹn)</option>
                <option value="6">Thứ Bảy</option>
                <option value="weekend">Cả Thứ 7 và Chủ Nhật</option>
                <option value="none">Không nghỉ (Học đều cả tuần)</option>
              </select>
            </div>

            <div className="p-3 bg-white dark:bg-[#101915] rounded-xl border border-slate-200 dark:border-[#243d30] flex items-center justify-between">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  🔔 Thông báo Web Push / Trình duyệt:
                </label>
                <p className="text-[10px] text-slate-400">Nhắc nhở trước giờ học 15 phút</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if ('Notification' in window) {
                    Notification.requestPermission();
                  }
                }}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold text-[11px] hover:bg-emerald-200 transition"
              >
                Kích hoạt
              </button>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-[#182720] hover:bg-slate-200 dark:hover:bg-[#20352c] text-slate-700 dark:text-slate-200 text-xs font-bold transition"
        >
          Đóng
        </button>
      </div>
    </div>
  );
}

