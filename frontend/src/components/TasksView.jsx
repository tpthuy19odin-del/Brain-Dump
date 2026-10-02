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
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#fafdfa] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black text-[#1b3d2f] flex items-center space-x-2">
            <CheckSquare className="w-5 h-5 text-[#1b7a53]" />
            <span>Quản Lý Tasks & Chia Nhỏ Tiến Độ (Breakdown)</span>
          </h2>
          <p className="text-xs text-[#5f8070] font-medium mt-0.5">
            Xem tiến độ từng bước của các bài tập lớn, đồ án và ôn thi
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-[#1b4d3e] hover:bg-[#143e31] text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-[#1b4d3e]/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Task Mới</span>
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-4 max-w-4xl">
        {tasks.length === 0 ? (
          <div className="p-12 text-center bg-white border border-[#e2efe5] rounded-3xl shadow-2xs">
            <Sparkles className="w-10 h-10 text-[#1b7a53] mx-auto mb-3 animate-pulse" />
            <h3 className="font-extrabold text-slate-800 text-sm">Chưa có nhiệm vụ nào</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
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
              <div key={t.id} className={`bg-white border rounded-2xl shadow-2xs overflow-hidden transition ${
                isAllDone ? 'border-[#cce8d4] bg-[#fbfdfb]' : 'border-[#e1ece4]'
              }`}>
                {/* Task Header Bar */}
                <div className={`p-4 flex items-center justify-between gap-3 border-b ${
                  isAllDone ? 'bg-[#f4f9f6] border-[#e2efe6]' : 'bg-[#fbfdfb] border-[#edf4ee]'
                }`}>
                  <div 
                    onClick={() => toggleExpand(t.id)} 
                    className="flex items-center space-x-3 flex-1 min-w-0 cursor-pointer"
                  >
                    <button className="text-[#597e6c] hover:text-[#1b4d3e]">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        {isAllDone && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                        <h4 className={`font-extrabold text-sm truncate ${isAllDone ? 'line-through text-slate-500' : 'text-[#1b3d2f]'}`}>
                          {t.title}
                        </h4>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                          isAllDone ? 'bg-emerald-100 text-emerald-800' :
                          t.priority === 'URGENT' ? 'bg-red-100 text-red-700' : 
                          t.priority === 'HIGH' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {isAllDone ? '✓ ĐÃ XONG' : t.priority}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-[#628574] font-medium mt-0.5">
                        <span>🏷️ {t.subject || 'Học tập'}</span>
                        <span>•</span>
                        <span>⏰ Deadline: {new Date(t.deadline).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar + Delete */}
                  <div className="flex items-center space-x-4 shrink-0">
                    <div className="text-right">
                      <div className={`text-xs font-black ${isAllDone ? 'text-emerald-700' : 'text-[#1b7a53]'}`}>
                        {progressPct}%
                      </div>
                      <div className="text-[10px] text-[#698a7a]">{doneCount}/{taskSubs.length} bước</div>
                    </div>

                    <button
                      onClick={() => onDeleteTask(t.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                      title="Xóa task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Subtasks List */}
                {isExpanded && (
                  <div className="p-4 space-y-2.5 bg-white">
                    <div className="text-[11px] font-bold text-[#5c7e6e] uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Các bước chi tiết do AI chia nhỏ:</span>
                    </div>

                    {taskSubs.map((st) => {
                      const isDone = st.status === 'DONE';
                      return (
                        <div
                          key={st.id}
                          className={`p-3 rounded-xl border flex items-center justify-between transition ${
                            isDone ? 'bg-[#f8faf8] border-slate-200 opacity-60' : 'bg-[#f4f9f5] border-[#d7eadb] hover:border-[#a8d9b2]'
                          }`}
                        >
                          <div className="flex items-center space-x-3 flex-1 min-w-0 mr-3">
                            <button
                              onClick={() => handleCheckSubtask(st.id, st.status)}
                              className={`p-0.5 rounded transition ${isDone ? 'text-emerald-600' : 'text-slate-400 hover:text-emerald-600'}`}
                            >
                              {isDone ? <CheckCircle2 className="w-5 h-5 fill-emerald-100" /> : <Circle className="w-5 h-5" />}
                            </button>
                            <span className={`text-xs font-bold ${isDone ? 'line-through text-slate-400' : 'text-[#1d3d30]'}`}>
                              {st.title}
                            </span>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                              {st.durationMin} phút
                            </span>
                            {!isDone && (
                              <button
                                onClick={() => onOpenPomodoro(st)}
                                className="px-2.5 py-1 rounded-lg bg-[#1b4d3e] text-white text-[10px] font-bold hover:bg-[#143d30] transition shadow-2xs"
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
          <div className="bg-white w-full max-w-md rounded-3xl p-6 border border-slate-200 shadow-2xl">
            <h3 className="text-lg font-black text-[#1b3d2f] mb-1">Thêm Nhiệm Vụ & Deadline</h3>
            <p className="text-xs text-slate-500 mb-4">Hệ thống AI sẽ tự động phân tích và chia nhỏ các bước thực tế</p>

            <form onSubmit={handleCreate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-[#234b38] mb-1">Tên bài tập / Deadline</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="VD: Tiểu luận Marketing 4 chương"
                  required
                  className="w-full bg-[#f8faf8] border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1b7a53]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#234b38] mb-1">Môn học</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Marketing"
                    className="w-full bg-[#f8faf8] border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1b7a53]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#234b38] mb-1">Độ ưu tiên</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-[#f8faf8] border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1b7a53]"
                  >
                    <option value="LOW">LOW (Thấp)</option>
                    <option value="MEDIUM">MEDIUM (Vừa)</option>
                    <option value="HIGH">HIGH (Cao)</option>
                    <option value="URGENT">URGENT (Rất gấp)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#234b38] mb-1">Hạn chót nộp bài</label>
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full bg-[#f8faf8] border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#1b7a53]"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#1b4d3e] hover:bg-[#143e31] text-white font-bold text-xs shadow-md shadow-[#1b4d3e]/20 transition"
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
