import React from 'react';
import { CheckCircle2, Circle, Clock, Play, Sparkles, BookOpen, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function TodayChecklist({ 
  subtasks, 
  onOpenPomodoro, 
  onToggleSubtaskStatus,
  stats
}) {
  const handleCheck = (id, currentStatus) => {
    const nextStatus = currentStatus === 'DONE' ? 'TODO' : 'DONE';
    if (nextStatus === 'DONE') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 }
      });
    }
    onToggleSubtaskStatus(id, nextStatus);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden p-6 max-w-4xl mx-auto w-full">
      {/* Header with Progress Bar */}
      <div className="glass-panel p-6 rounded-3xl mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
              <span>Hôm Nay</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric' })}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">Tập trung hoàn thành từng khối theo thứ tự thời gian</p>
          </div>

          <div className="text-right">
            <div className="text-2xl font-black text-emerald-600 font-mono">
              {stats?.completionRate || 0}%
            </div>
            <div className="text-[11px] text-slate-500 font-medium">
              Đã hoàn thành {stats?.doneSubtasks || 0}/{stats?.totalSubtasks || 0} việc
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 rounded-full transition-all duration-500"
            style={{ width: `${stats?.completionRate || 0}%` }}
          ></div>
        </div>
      </div>

      {/* Task Checklist Items */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">
          Các khối việc cần hoàn thành ({subtasks.length})
        </h3>

        {subtasks.length === 0 ? (
          <div className="p-12 text-center text-slate-500 glass-card rounded-3xl">
            <Sparkles className="w-8 h-8 text-emerald-600 mx-auto mb-3 animate-pulse" />
            <p className="font-bold text-slate-800">Tuyệt vời! Bạn không có việc tồn đọng nào.</p>
            <p className="text-xs mt-1 text-slate-500">Hãy gõ bài tập mới vào thanh chat bên cạnh để AI xếp lịch nhé.</p>
          </div>
        ) : (
          subtasks.map((st) => {
            const isDone = st.status === 'DONE';
            const startStr = new Date(st.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const endStr = new Date(st.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div
                key={st.id}
                className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                  isDone
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : 'bg-white border-slate-200 hover:border-emerald-300 shadow-2xs hover:shadow-sm'
                }`}
              >
                <div className="flex items-center space-x-3.5 flex-1 min-w-0 mr-4">
                  <button
                    onClick={() => handleCheck(st.id, st.status)}
                    className={`p-1 rounded-lg transition ${
                      isDone ? 'text-emerald-600' : 'text-slate-400 hover:text-emerald-600'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 fill-emerald-100 text-emerald-600" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`font-bold text-sm truncate ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {st.title}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1 font-mono font-medium">
                      <span className="flex items-center space-x-1 text-emerald-700">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{startStr} - {endStr}</span>
                      </span>
                      <span>•</span>
                      <span>{st.durationMin} phút</span>
                      {st.taskSubject && (
                        <>
                          <span>•</span>
                          <span className="text-slate-700 font-sans font-medium">{st.taskSubject}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {!isDone && (
                  <button
                    onClick={() => onOpenPomodoro(st)}
                    className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition shrink-0"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Pomodoro</span>
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
