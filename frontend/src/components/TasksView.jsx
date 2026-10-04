import React, { useState } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Trash2, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Sparkles,
  Layers,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import ThemeSwitch from './ThemeSwitch';
import confetti from 'canvas-confetti';

export default function TasksView({ 
  tasks = [], 
  subtasks = [], 
  onCreateTask, 
  onDeleteTask, 
  onToggleSubtask, 
  onOpenPomodoro 
}) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [expandedTasks, setExpandedTasks] = useState({});

  const toggleExpand = (id) => {
    setExpandedTasks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreateTask({
      title: title.trim(),
      subject: subject.trim() || 'Học tập',
      deadline: deadline ? new Date(deadline).toISOString() : new Date(Date.now() + 3 * 86400000).toISOString(),
      priority
    });
    setTitle('');
    setSubject('');
    setDeadline('');
    setShowAddModal(false);
  };

  const handleCheckSubtask = (stId, currentStatus) => {
    const nextStatus = currentStatus === 'DONE' ? 'TODO' : 'DONE';
    if (nextStatus === 'DONE') {
      confetti({ particleCount: 40, spread: 50 });
    }
    onToggleSubtask(stId, nextStatus);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#fafdfa] dark:bg-[#080d0b] p-6 transition-colors duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black text-[#1b3d2f] dark:text-[#f0fdf4] flex items-center space-x-2">
            <CheckSquare className="w-5 h-5 text-[#1b7a53] dark:text-emerald-400" />
            <span>Quản Lý Tasks & Chia Nhỏ Tiến Độ (Breakdown)</span>
          </h2>
          <p className="text-xs text-[#5f8070] dark:text-[#8aa396] font-medium mt-0.5">
            Xem tiến độ từng bước của các bài tập lớn, đồ án và ôn thi
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* Dark/Light Quick Toggle Switch */}
          <ThemeSwitch />

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-[#1b4d3e] dark:bg-emerald-600 hover:bg-[#143e31] dark:hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-[#1b4d3e]/20 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Task Mới</span>
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4 max-w-4xl">
        {tasks.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-[#101915] border border-[#e2efe5] dark:border-[#1d2c26] rounded-3xl shadow-2xs">
            <Sparkles className="w-10 h-10 text-[#1b7a53] dark:text-emerald-400 mx-auto mb-3 animate-pulse" />
            <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">Chưa có nhiệm vụ nào</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              Bấm <strong>"Thêm Task Mới"</strong> hoặc nhắn tin vào Trợ lý AI ở thanh bên phải để AI tự động chia nhỏ các bước thực tế!
            </p>
          </div>
        ) : (
          tasks.map((t) => {
            const taskSubs = subtasks.filter(st => st.taskId === t.id);
            const doneCount = taskSubs.filter(st => st.status === 'DONE').length;
            const progressPct = taskSubs.length > 0 ? Math.round((doneCount / taskSubs.length) * 100) : 0;
            const isExpanded = expandedTasks[t.id] !== false;
            const isAllDone = (taskSubs.length > 0 && doneCount === taskSubs.length) || t.status === 'DONE';

            return (
              <div key={t.id} className={`bg-white dark:bg-[#101915] border rounded-2xl shadow-2xs overflow-hidden transition ${
                isAllDone ? 'border-[#cce8d4] dark:border-[#1d3326] bg-[#fbfdfb] dark:bg-[#0c1410]' : 'border-[#e1ece4] dark:border-[#1d2c26]'
              }`}>
                {/* Task Header Bar */}
                <div className={`p-4 flex items-center justify-between gap-3 border-b ${
                  isAllDone ? 'bg-[#f4f9f6] dark:bg-[#101c16] border-[#e2efe6] dark:border-[#1d2d25]' : 'bg-[#fbfdfb] dark:bg-[#121e18] border-[#edf4ee] dark:border-[#1c2a23]'
                }`}>
                  <div 
                    onClick={() => toggleExpand(t.id)} 
                    className="flex items-center space-x-3 flex-1 min-w-0 cursor-pointer"
                  >
                    <button className="text-[#597e6c] dark:text-[#7f9e8f] hover:text-[#1b4d3e] dark:hover:text-emerald-300">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        {isAllDone && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        )}
                        <h4 className={`font-extrabold text-sm truncate ${isAllDone ? 'line-through text-slate-500 dark:text-slate-500' : 'text-[#1b3d2f] dark:text-slate-100'}`}>
                          {t.title}
                        </h4>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                          isAllDone ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' :
                          t.priority === 'URGENT' ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300' : 
                          t.priority === 'HIGH' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300' : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        }`}>
                          {isAllDone ? '✓ ĐÃ XONG' : t.priority}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-[#628574] dark:text-[#8aa396] font-medium mt-0.5">
                        <span>🏷️ {t.subject || 'Học tập'}</span>
                        <span>•</span>
                        <span>⏰ Deadline: {new Date(t.deadline).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar + Delete */}
                  <div className="flex items-center space-x-4 shrink-0">
                    <div className="text-right">
                      <div className={`text-xs font-black ${isAllDone ? 'text-emerald-700 dark:text-emerald-400' : 'text-[#1b7a53] dark:text-emerald-400'}`}>
                        {progressPct}%
                      </div>
                      <div className="text-[10px] text-[#698a7a] dark:text-[#7f9e8f]">{doneCount}/{taskSubs.length} bước</div>
                    </div>

                    <button
                      onClick={() => onDeleteTask(t.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                      title="Xóa task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Subtasks List */}
                {isExpanded && (
                  <div className="p-4 space-y-2.5 bg-white dark:bg-[#0f1713]">
                    <div className="text-[11px] font-bold text-[#5c7e6e] dark:text-[#7f9e8f] uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Các bước chi tiết do AI chia nhỏ:</span>
                    </div>

                    {taskSubs.map((st) => {
                      const isDone = st.status === 'DONE';
                      return (
                        <div
                          key={st.id}
                          className={`p-3 rounded-xl border flex items-center justify-between transition ${
                            isDone ? 'bg-[#f8faf8] dark:bg-[#131d18] border-slate-200 dark:border-[#1d2c26] opacity-60' : 'bg-[#f4f9f5] dark:bg-[#14231c] border-[#d7eadb] dark:border-[#1f372a] hover:border-[#a8d9b2] dark:hover:border-emerald-600'
                          }`}
                        >
                          <div className="flex items-center space-x-3 flex-1 min-w-0 mr-3">
                            <button
                              onClick={() => handleCheckSubtask(st.id, st.status)}
                              className={`p-0.5 rounded transition ${isDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 hover:text-emerald-600'}`}
                            >
                              {isDone ? <CheckCircle2 className="w-5 h-5 fill-emerald-100 dark:fill-emerald-950 text-emerald-600 dark:text-emerald-400" /> : <Circle className="w-5 h-5" />}
                            </button>
                            <span className={`text-xs font-bold ${isDone ? 'line-through text-slate-400 dark:text-slate-500' : 'text-[#1d3d30] dark:text-slate-200'}`}>
                              {st.title}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white dark:bg-[#192b22] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#223d2f]">
                              {st.durationMin} phút
                            </span>
                            {!isDone && (
                              <button
                                onClick={() => onOpenPomodoro(st)}
                                className="px-2.5 py-1 rounded-lg bg-[#1b4d3e] dark:bg-emerald-600 text-white text-[10px] font-bold hover:bg-[#143d30] dark:hover:bg-emerald-700 transition shadow-2xs"
                              >
                                Pomo
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#101915] w-full max-w-md rounded-3xl p-6 border border-slate-200 dark:border-[#1d2c26] shadow-2xl">
            <h3 className="text-lg font-black text-[#1b3d2f] dark:text-[#f0fdf4] mb-1">Thêm Nhiệm Vụ & Deadline</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Hệ thống AI sẽ tự động phân tích và chia nhỏ các bước thực tế</p>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#234b38] dark:text-emerald-300 mb-1">Tên bài tập / Deadline</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Tiểu luận Marketing 4 chương"
                  required
                  className="w-full bg-[#f8faf8] dark:bg-[#16241e] border border-slate-300 dark:border-[#243d30] text-slate-800 dark:text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1b7a53] dark:focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#234b38] dark:text-emerald-300 mb-1">Môn học</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Marketing"
                    className="w-full bg-[#f8faf8] dark:bg-[#16241e] border border-slate-300 dark:border-[#243d30] text-slate-800 dark:text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1b7a53] dark:focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#234b38] dark:text-emerald-300 mb-1">Độ ưu tiên</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-[#f8faf8] dark:bg-[#16241e] border border-slate-300 dark:border-[#243d30] text-slate-800 dark:text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1b7a53] dark:focus:border-emerald-500"
                  >
                    <option value="LOW">LOW (Thấp)</option>
                    <option value="MEDIUM">MEDIUM (Vừa)</option>
                    <option value="HIGH">HIGH (Cao)</option>
                    <option value="URGENT">URGENT (Rất gấp)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#234b38] dark:text-emerald-300 mb-1">Hạn chót nộp bài</label>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full bg-[#f8faf8] dark:bg-[#16241e] border border-slate-300 dark:border-[#243d30] text-slate-800 dark:text-slate-100 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1b7a53] dark:focus:border-emerald-500"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-[#182720] hover:bg-slate-200 dark:hover:bg-[#20352c] text-slate-700 dark:text-slate-200 font-bold text-xs transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#1b4d3e] dark:bg-emerald-600 hover:bg-[#143e31] dark:hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-[#1b4d3e]/20 transition"
                >
                  Tạo Task & Chia Bước
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

