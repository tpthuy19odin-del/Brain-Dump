import React, { useState } from 'react';
import { X, Plus, Trash2, Key, BookOpen, Clock, ShieldCheck, Check } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 relative border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-slate-900 mb-1">Cài Đặt Cá Nhân & Lịch Cố Định</h3>
        <p className="text-xs text-slate-500 mb-6">Tùy chỉnh thời khóa biểu và kết nối AI</p>

        {/* 1. Gemini API Key */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl mb-6">
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-800 mb-2">
            <Key className="w-4 h-4 text-emerald-600" />
            <span>Google Gemini API Key (Tùy chọn)</span>
          </div>
          <p className="text-[11px] text-slate-500 mb-3">
            Nếu để trống, hệ thống sẽ sử dụng Rule Engine NLP thông minh tích hợp sẵn để demo mượt mà.
          </p>
          <form onSubmit={handleSaveKey} className="flex gap-2">
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="Dán AIzaSy... vào đây"
              className="flex-1 bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-mono"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center space-x-1"
            >
              {savedKeySuccess ? <Check className="w-4 h-4 text-white" /> : <span>Lưu Key</span>}
            </button>
          </form>
        </div>

        {/* 2. Fixed Schedules List & Add */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl mb-6">
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-800 mb-3">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            <span>Thời Khóa Biểu Cố Định (AI sẽ tránh xếp việc vào giờ này)</span>
          </div>

          <form onSubmit={handleCreateFixed} className="grid grid-cols-1 sm:grid-cols-5 gap-2 mb-4">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Tên môn học / Hoạt động"
              className="sm:col-span-2 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
            />
            <select
              value={newDay}
              onChange={(e) => setNewDay(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-2 py-1.5 text-xs text-slate-900 focus:outline-none"
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
                className="w-1/2 bg-white border border-slate-300 rounded-lg px-1.5 py-1.5 text-xs text-slate-900 text-center font-mono"
              />
              <span className="text-slate-400">-</span>
              <input
                type="text"
                value={newEnd}
                onChange={(e) => setNewEnd(e.target.value)}
                className="w-1/2 bg-white border border-slate-300 rounded-lg px-1.5 py-1.5 text-xs text-slate-900 text-center font-mono"
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
                className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs shadow-2xs"
              >
                <div>
                  <span className="font-bold text-slate-900">{fs.title}</span>
                  <span className="text-slate-500 ml-2 font-mono">
                    ({DAYS.find(d => d.id === fs.dayOfWeek)?.name || 'Thứ 2'} • {fs.startTime} - {fs.endTime})
                  </span>
                </div>
                <button
                  onClick={() => onDeleteFixedSchedule(fs.id)}
                  className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
        >
          Đóng
        </button>
      </div>
    </div>
  );
}
