import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  Sparkles, 
  Lock, 
  Unlock, 
  AlertTriangle, 
  Maximize2, 
  Minimize2, 
  ShieldAlert,
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PomodoroModal({ subtask, onClose, onFinishPomodoro }) {
  const [mode, setMode] = useState(25); // 25 hoặc 50 phút
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [strictLock, setStrictLock] = useState(true); // Bật chế độ khóa nghiêm ngặt
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [distractionCount, setDistractionCount] = useState(0); // Số lần rời màn hình
  const [showWarningAlert, setShowWarningAlert] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);

  // Reset timer on mode change
  useEffect(() => {
    setTimeLeft(mode * 60);
    setIsRunning(false);
    setDistractionCount(0);
    setShowWarningAlert(false);
  }, [mode]);

  // Main Timer loop
  useEffect(() => {
    let timer = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      confetti({ particleCount: 120, spread: 80 });
      // Play completion chime
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      } catch (e) {}
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  // Anti-Distraction: Detect Tab Switch & Leaving Window
  useEffect(() => {
    if (!isRunning || !strictLock) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setDistractionCount((prev) => prev + 1);
        setShowWarningAlert(true);
      }
    };

    const handleWindowBlur = () => {
      setDistractionCount((prev) => prev + 1);
      setShowWarningAlert(true);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [isRunning, strictLock]);

  // Toggle Fullscreen
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
      // Auto enter fullscreen when start if strict mode is active
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

  const handleCloseAttempt = () => {
    if (isRunning && strictLock) {
      setShowQuitConfirm(true);
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      onClose();
    }
  };

  const confirmQuit = () => {
    setIsRunning(false);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setShowQuitConfirm(false);
    onClose();
  };

  const handleCompleteTask = () => {
    const minutesDone = Math.max(1, Math.round((mode * 60 - timeLeft) / 60));
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    onFinishPomodoro(subtask.id, minutesDone, true);
    onClose();
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPercent = ((mode * 60 - timeLeft) / (mode * 60)) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 relative border border-slate-200 shadow-2xl">
        
        {/* Top Header Actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {/* Strict Mode Indicator */}
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

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              title={isFullscreen ? 'Thu nhỏ' : 'Bật toàn màn hình'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Close button */}
          <button
            onClick={handleCloseAttempt}
            className={`p-2 rounded-full transition cursor-pointer ${
              isRunning && strictLock
                ? 'bg-rose-100 text-rose-600 hover:bg-rose-200'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
            title={isRunning && strictLock ? 'Khóa màn hình đang bật' : 'Đóng'}
          >
            {isRunning && strictLock ? <Lock className="w-4 h-4" /> : <X className="w-5 h-5" />}
          </button>
        </div>

        {/* Distraction Alert Banner */}
        {showWarningAlert && (
          <div className="mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 flex items-center justify-between text-xs font-bold animate-bounce">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>🚨 Phát hiện bạn vừa rời màn hình ({distractionCount} lần)! Hãy tập trung học nào!</span>
            </div>
            <button
              onClick={() => setShowWarningAlert(false)}
              className="px-2 py-0.5 rounded bg-amber-200 hover:bg-amber-300 text-amber-900 text-[10px]"
            >
              Đã hiểu
            </button>
          </div>
        )}

        {/* Task Title & Details */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-black mb-2 border border-emerald-200 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>PHIÊN TẬP TRUNG POMODORO</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 line-clamp-2 px-4 leading-snug">
            {subtask?.title || 'Tập trung học tập'}
          </h3>
          <p className="text-xs text-slate-500 font-bold mt-1">
            🏷️ {subtask?.taskSubject || 'Học tập'} • ⏰ Kế hoạch: {subtask?.durationMin || 25} phút
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex justify-center space-x-2 mb-6">
          <button
            onClick={() => !isRunning && setMode(25)}
            disabled={isRunning}
            className={`px-4 py-1.5 rounded-xl text-xs font-black transition cursor-pointer disabled:opacity-60 ${
              mode === 25
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            25 Phút (Chuẩn)
          </button>
          <button
            onClick={() => !isRunning && setMode(50)}
            disabled={isRunning}
            className={`px-4 py-1.5 rounded-xl text-xs font-black transition cursor-pointer disabled:opacity-60 ${
              mode === 50
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            50 Phút (Chuyên sâu)
          </button>
        </div>

        {/* Circle Progress Timer Display */}
        <div className="flex flex-col items-center justify-center my-6">
          <div className="relative w-56 h-56 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="112"
                cy="112"
                r="95"
                stroke="currentColor"
                strokeWidth="12"
                className="text-slate-100"
                fill="transparent"
              />
              <circle
                cx="112"
                cy="112"
                r="95"
                stroke="currentColor"
                strokeWidth="12"
                className={`transition-all duration-500 ${
                  distractionCount > 2 ? 'text-amber-500' : 'text-emerald-500'
                }`}
                fill="transparent"
                strokeDasharray={2 * Math.PI * 95}
                strokeDashoffset={2 * Math.PI * 95 * (1 - progressPercent / 100)}
                strokeLinecap="round"
              />
            </svg>

            <div className="absolute flex flex-col items-center text-center">
              <span className="text-4xl sm:text-5xl font-black text-slate-900 font-mono tracking-tight">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
              <span className={`text-[11px] font-extrabold mt-1.5 uppercase px-2.5 py-0.5 rounded-full ${
                isRunning ? 'bg-emerald-100 text-emerald-800 animate-pulse' : 'bg-slate-100 text-slate-500'
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
        </div>

        {/* Controls */}
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
            className={`px-10 py-3.5 rounded-2xl font-black text-sm text-white shadow-xl transition flex items-center space-x-2 cursor-pointer ${
              isRunning 
                ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/30' 
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
            }`}
          >
            {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
            <span>{isRunning ? 'Tạm Dừng' : 'Bắt Đầu'}</span>
          </button>
        </div>

        {/* Mark Done & Record Time */}
        <button
          onClick={handleCompleteTask}
          className="w-full py-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs font-black flex items-center justify-center space-x-2 transition cursor-pointer shadow-xs"
        >
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Đánh dấu xong khối này & Ghi nhận thời gian</span>
        </button>

        {/* Strict Lock Reminder Footer */}
        {strictLock && (
          <p className="text-[10px] font-semibold text-slate-400 text-center mt-3">
            🔒 Chế độ khóa nghiêm ngặt đang bật: Tự động cảnh báo khi bạn chuyển tab hoặc rời ứng dụng.
          </p>
        )}
      </div>

      {/* Strict Quit Confirmation Dialog */}
      {showQuitConfirm && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4 animate-in zoom-in-95 duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center shadow-2xl border border-rose-200">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="font-black text-slate-900 text-base mb-1">
              Bạn có chắc muốn từ bỏ giữa chừng?
            </h4>
            <p className="text-xs text-slate-600 font-medium mb-5 leading-relaxed">
              Phiên học đang diễn ra. Nếu thoát bây giờ, thời gian học sẽ không được ghi nhận vào chuỗi Streak và đánh giá hiệu suất AI!
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowQuitConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition cursor-pointer"
              >
                Tiếp tục tập trung
              </button>
              <button
                onClick={confirmQuit}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 font-bold text-xs transition cursor-pointer"
              >
                Vẫn thoát
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
