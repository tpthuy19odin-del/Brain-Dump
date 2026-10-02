import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  CheckCircle, 
  Flame, 
  Volume2, 
  VolumeX, 
  Coffee,
  CheckCircle2,
  Lock,
  Unlock,
  Maximize2,
  Minimize2,
  ShieldAlert,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function FocusView({ subtasks = [], onFinishPomodoro }) {
  const [selectedSubtaskId, setSelectedSubtaskId] = useState('');
  const [mode, setMode] = useState(25); // 25 hoặc 50
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [completedSessions, setCompletedSessions] = useState(2);
  const [strictLock, setStrictLock] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [distractionCount, setDistractionCount] = useState(0);
  const [showWarningAlert, setShowWarningAlert] = useState(false);

  const activeSubtask = subtasks.find(st => st.id === selectedSubtaskId) || subtasks[0] || {
    id: 'default',
    title: 'Tập trung học tập tự do',
    durationMin: 25,
    taskSubject: 'Chung'
  };

  useEffect(() => {
    setTimeLeft(mode * 60);
    setIsRunning(false);
    setDistractionCount(0);
    setShowWarningAlert(false);
  }, [mode]);

  useEffect(() => {
    let timer = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setCompletedSessions(prev => prev + 1);
      confetti({ particleCount: 100, spread: 70 });
      if (soundEnabled) {
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = ctx.createOscillator();
          osc.connect(ctx.destination);
          osc.frequency.value = 880;
          osc.start();
          osc.stop(ctx.currentTime + 0.5);
        } catch (e) {}
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, soundEnabled]);

  // Anti-Distraction: Tab Switch Detection
  useEffect(() => {
    if (!isRunning || !strictLock) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setDistractionCount(prev => prev + 1);
        setShowWarningAlert(true);
      }
    };

    const handleWindowBlur = () => {
      setDistractionCount(prev => prev + 1);
      setShowWarningAlert(true);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [isRunning, strictLock]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  const toggleTimer = () => {
    if (!isRunning && strictLock && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(mode * 60);
    setDistractionCount(0);
    setShowWarningAlert(false);
  };

  const handleDone = () => {
    const minutesDone = Math.max(1, Math.round((mode * 60 - timeLeft) / 60));
    if (activeSubtask.id !== 'default') {
      onFinishPomodoro(activeSubtask.id, minutesDone, true);
    }
    confetti({ particleCount: 80, spread: 60 });
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPct = ((mode * 60 - timeLeft) / (mode * 60)) * 100;

  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full overflow-y-auto bg-[#fafdfa] p-6 select-none">
      <div className="w-full max-w-lg bg-white border border-[#e1ece4] rounded-3xl p-6 sm:p-8 shadow-sm text-center relative">
        
        {/* Top bar controls */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => !isRunning && setStrictLock(!strictLock)}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black transition cursor-pointer ${
              strictLock 
                ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-xs' 
                : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}
            title={isRunning ? 'Đang trong phiên, không thể tắt khóa' : 'Bật/tắt chế độ khóa nghiêm ngặt không cho rời màn hình'}
          >
            {strictLock ? <Lock className="w-3 h-3 text-rose-600" /> : <Unlock className="w-3 h-3 text-slate-500" />}
            <span>{strictLock ? 'Khóa Tập Trung Bật' : 'Khóa Tự Do'}</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
              title={soundEnabled ? 'Tắt chuông báo' : 'Bật chuông báo'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              title={isFullscreen ? 'Thu nhỏ' : 'Bật toàn màn hình'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Distraction Alert Banner */}
        {showWarningAlert && (
          <div className="mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex items-center justify-between text-xs font-bold animate-bounce">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>🚨 Phát hiện rời màn hình ({distractionCount} lần)! Hãy tập trung học nào!</span>
            </div>
            <button
              onClick={() => setShowWarningAlert(false)}
              className="px-2 py-0.5 rounded bg-amber-200 hover:bg-amber-300 text-amber-900 text-[10px]"
            >
              Đã hiểu
            </button>
          </div>
        )}

        {/* Header Badge */}
        <div className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-[#ebf8ee] border border-[#cfe8d4] text-[#1b7a53] text-xs font-black mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>PHÒNG TẬP TRUNG POMODORO</span>
        </div>

        {/* Task Picker */}
        <div className="mb-6 text-left">
          <label className="block text-xs font-bold text-[#5c7e6e] mb-1.5">Đang làm khối việc:</label>
          <select
            value={selectedSubtaskId || (subtasks[0]?.id || '')}
            onChange={(e) => setSelectedSubtaskId(e.target.value)}
            disabled={isRunning}
            className="w-full bg-[#f8faf8] border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-[#1b3d2f] focus:outline-none focus:border-[#1b7a53] disabled:opacity-60"
          >
            {subtasks.length === 0 ? (
              <option value="default">Học tập tự do (Chưa có task trong lịch)</option>
            ) : (
              subtasks.map(st => (
                <option key={st.id} value={st.id}>
                  {st.title} ({st.durationMin} phút)
                </option>
              ))
            )}
          </select>
        </div>

        {/* Mode Switcher */}
        <div className="flex justify-center space-x-3 mb-6">
          <button
            onClick={() => !isRunning && setMode(25)}
            disabled={isRunning}
            className={`px-4 py-1.5 rounded-xl text-xs font-black transition cursor-pointer disabled:opacity-60 ${
              mode === 25 ? 'bg-[#1b4d3e] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            25 Phút (Chuẩn 25/5)
          </button>
          <button
            onClick={() => !isRunning && setMode(50)}
            disabled={isRunning}
            className={`px-4 py-1.5 rounded-xl text-xs font-black transition cursor-pointer disabled:opacity-60 ${
              mode === 50 ? 'bg-[#1b4d3e] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            50 Phút (Chuyên sâu)
          </button>
        </div>

        {/* Timer Circle */}
        <div className="relative w-60 h-60 mx-auto mb-6 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="120"
              cy="120"
              r="105"
              stroke="#e2eee5"
              strokeWidth="12"
              fill="transparent"
            />
            <circle
              cx="120"
              cy="120"
              r="105"
              stroke={distractionCount > 2 ? '#f59e0b' : '#1b7a53'}
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 105}
              strokeDashoffset={2 * Math.PI * 105 * (1 - progressPct / 100)}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>

          <div className="absolute flex flex-col items-center">
            <span className="text-5xl font-black text-[#1b3d2f] tracking-tight font-mono">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className={`text-[11px] font-bold mt-2 uppercase px-2.5 py-0.5 rounded-full ${
              isRunning ? 'bg-[#dcf4e2] text-[#134932] animate-pulse' : 'bg-slate-100 text-slate-500'
            }`}>
              {isRunning ? '🔥 Đang tập trung...' : 'Đã tạm dừng'}
            </span>
            {distractionCount > 0 && (
              <span className="text-[10px] font-bold text-amber-700 mt-1">
                Mất tập trung: {distractionCount} lần
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          <button
            onClick={resetTimer}
            className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer"
            title="Đặt lại từ đầu"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={toggleTimer}
            className={`px-10 py-3.5 rounded-2xl font-black text-sm text-white shadow-md transition flex items-center space-x-2 cursor-pointer ${
              isRunning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-[#1b4d3e] hover:bg-[#143e31]'
            }`}
          >
            {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
            <span>{isRunning ? 'Tạm Dừng' : 'Bắt Đầu'}</span>
          </button>
        </div>

        {/* Finish & Record */}
        <button
          onClick={handleDone}
          className="w-full py-3 rounded-2xl bg-[#ebf8ee] hover:bg-[#d8eedd] border border-[#bfe2ca] text-[#16563a] font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer shadow-xs"
        >
          <CheckCircle2 className="w-4 h-4 text-[#1b7a53]" />
          <span>Hoàn thành & Ghi nhận vào tiến độ AI</span>
        </button>

        {strictLock && (
          <p className="text-[10px] font-semibold text-slate-400 text-center mt-3">
            🔒 Chế độ khóa nghiêm ngặt: Giám sát và cảnh báo khi bạn chuyển tab hoặc rời ứng dụng.
          </p>
        )}
      </div>
    </div>
  );
}
