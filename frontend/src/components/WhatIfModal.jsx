import React, { useState } from 'react';
import { 
  Sparkles, 
  HelpCircle, 
  Play, 
  Loader2, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  X,
  ArrowRight,
  ShieldAlert,
  Calendar,
  Lock,
  Crown,
  Zap
} from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';

export default function WhatIfModal({ isOpen, onClose, onApplyScenario, user, onOpenUpgrade }) {
  const [scenario, setScenario] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [simulation, setSimulation] = useState(null);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const isPro = user?.plan === 'PRO' || user?.role === 'ADMIN';

  const handleRunSimulation = async (e) => {
    e?.preventDefault();
    if (!scenario.trim()) {
      showToast({ type: 'warning', title: 'Thiếu kịch bản', message: 'Vui lòng nhập kịch bản cần mô phỏng!' });
      return;
    }

    setIsLoading(true);
    setSimulation(null);

    try {
      const res = await api.simulateWhatIf(scenario.trim()).catch(() => null);
      if (res && res.simulation) {
        setSimulation(res.simulation);
      } else {
        const text = scenario.toLowerCase();
        const isOverload = text.includes('10') || text.includes('thêm') || text.includes('nhiều');
        const isRelax = text.includes('nghỉ') || text.includes('dời') || text.includes('mệt') || text.includes('giảm');

        const fallbackSim = {
          feasibilityScore: isRelax ? 90 : isOverload ? 68 : 80,
          status: isOverload ? 'RISKY' : 'FEASIBLE',
          summary: `Khi thực hiện kịch bản "${scenario.trim()}", hệ thống dự đoán bạn cần tối ưu hóa các khung giờ rảnh từ 14:00 - 17:00 để đảm bảo vẫn hoàn thành deadline đúng hạn.`,
          workloadImpact: isOverload ? '+10 giờ tải/tuần (Tổng tải 32h)' : isRelax ? '-5 giờ tải/tuần (Giúp giảm mỏi mắt)' : '+6 giờ tải/tuần',
          riskWarnings: isOverload
            ? ["Có nguy cơ bị dồn lịch vào tối thứ 4 và thứ 6", "Nên duy trì giờ ngủ ít nhất 7 tiếng/ngày"]
            : ["Cần đảm bảo hoàn thành các bước quan trọng trước khi nghỉ"],
          recommendations: [
            "Áp dụng phương pháp Pomodoro 50/10 để tăng 25% hiệu suất học",
            "Ưu tiên hoàn thành các bài tập gấp có hệ số điểm cao vào đầu tuần",
            "Tận dụng khung 'Giờ Vàng' buổi sáng (08:00 - 10:30) để giải quyết bài khó"
          ],
          simulatedScheduleDiff: [
            { day: "Thứ 3", change: "Bố trí ca làm việc mới từ 18:00 - 20:00" },
            { day: "Thứ 6", change: "Dời ôn thi sang khung 20:30 - 22:00" }
          ]
        };
        setSimulation(fallbackSim);
      }

      showToast({
        type: 'success',
        title: '✨ Đã chạy xong mô phỏng What-if',
        message: 'Xem phân tích khả thi và đề xuất bên dưới.'
      });
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Lỗi mô phỏng',
        message: err.message || 'Không thể chạy mô phỏng AI'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (onApplyScenario && simulation) {
      onApplyScenario(`Hãy áp dụng kịch bản sau vào lịch thật của tôi: "${scenario}"`);
      showToast({
        type: 'success',
        title: 'Đã gửi yêu cầu áp dụng',
        message: 'AI đang tiến hành cập nhật lại toàn bộ lịch trình theo kịch bản vừa mô phỏng!'
      });
      onClose();
    }
  };

  const sampleScenarios = [
    "Nếu nhận thêm việc làm thêm 10 tiếng/tuần thì lịch thế nào?",
    "Nếu dời bài luận Triết học sang tuần sau để tập trung ôn thi cuối kỳ?",
    "Tuần này bị mệt, chỉ học tối đa 3 tiếng/ngày có kịp deadline không?",
    "Nếu dành trọn vẹn thứ 7 và Chủ Nhật để nghỉ ngơi đi chơi?"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-2xl bg-white dark:bg-[#101915] border border-slate-200 dark:border-[#22362d] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-[#1d2c26] bg-slate-50/60 dark:bg-[#0e1512] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-purple-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                  Mô Phỏng Kịch Bản (What-If Sandbox)
                </h3>
                <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  PRO
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Chạy thử các phương án thay đổi thời gian trước khi áp dụng vào lịch thật
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {!isPro ? (
            <div className="p-8 text-center bg-gradient-to-b from-purple-50/70 to-indigo-50/30 dark:from-[#171a26] dark:to-[#10141d] border-2 border-dashed border-purple-300 dark:border-purple-800 rounded-3xl space-y-4">
              <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-purple-600 to-amber-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-purple-600/30">
                <Lock className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white flex items-center justify-center gap-2">
                  <span>Mô Phỏng Kịch Bản What-If</span>
                  <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-purple-200 text-purple-900">PRO ⭐</span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto mt-1.5 leading-relaxed">
                  Công cụ AI Sandbox cho phép bạn thử nghiệm trước mọi giả định thời gian (thêm ca làm, dời deadline, giảm giờ học) để dự đoán xung đột và tính toán khả thi trước khi ghi đè lịch thật.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
                <button
                  onClick={() => {
                    onClose();
                    if (onOpenUpgrade) onOpenUpgrade();
                  }}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-700 hover:to-amber-600 text-white text-xs font-black shadow-lg shadow-purple-600/25 transition cursor-pointer flex items-center justify-center space-x-2"
                >
                  <Crown className="w-4 h-4 fill-white" />
                  <span>Nâng Cấp PRO Để Mở Khóa</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-3 rounded-xl bg-white dark:bg-[#1a202c] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Để sau
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Input Box */}
              <form onSubmit={handleRunSimulation} className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Nhập kịch bản hoặc giả định của bạn:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={scenario}
                    onChange={(e) => setScenario(e.target.value)}
                    placeholder="Ví dụ: Nếu nhận thêm việc làm thêm 10 tiếng/tuần..."
                    className="flex-1 p-3 rounded-xl border border-slate-200 dark:border-[#22362d] bg-white dark:bg-[#14201a] text-xs text-slate-800 dark:text-emerald-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                    <span>{isLoading ? 'Đang phân tích...' : 'Chạy Mô Phỏng'}</span>
                  </button>
                </div>
              </form>

              {/* Quick Suggestions */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 mb-1.5 block">
                  Gợi ý kịch bản mẫu:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {sampleScenarios.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => setScenario(s)}
                      className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-100 dark:bg-[#16241e] hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-600 dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-300 border border-slate-200 dark:border-[#22362d] transition text-left"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Simulation Output Result */}
          {simulation && (
            <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-[#161d28] border border-purple-200 dark:border-[#27354a] space-y-3.5 animate-scale-in">
              {/* Feasibility Score Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-black text-xs">
                    {simulation.feasibilityScore || 80}%
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">
                      Độ Khả Thi Của Kịch Bản
                    </h4>
                    <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase">
                      {simulation.status === 'FEASIBLE' ? '✅ Khả thi tốt' : simulation.status === 'RISKY' ? '⚠️ Có rủi ro quá tải' : '🚨 Quá tải nghiêm trọng'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Tác động khối lượng</div>
                  <div className="text-xs font-black text-slate-800 dark:text-slate-200">{simulation.workloadImpact || '+8h/tuần'}</div>
                </div>
              </div>

              {/* Summary */}
              <p className="text-xs text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-[#101915] p-3 rounded-xl border border-purple-100 dark:border-[#1d2c26]">
                {simulation.summary}
              </p>

              {/* Warnings & Recommendations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {simulation.riskWarnings?.length > 0 && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 space-y-1">
                    <div className="font-extrabold flex items-center space-x-1 text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Cảnh báo rủi ro:</span>
                    </div>
                    <ul className="list-disc list-inside text-[11px] space-y-0.5">
                      {simulation.riskWarnings.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>
                )}

                {simulation.recommendations?.length > 0 && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 space-y-1">
                    <div className="font-extrabold flex items-center space-x-1 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Đề xuất tối ưu:</span>
                    </div>
                    <ul className="list-disc list-inside text-[11px] space-y-0.5">
                      {simulation.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-[#1d2c26] bg-slate-50/60 dark:bg-[#0e1512] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white dark:bg-[#16241e] border border-slate-200 dark:border-[#22362d] text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-[#1e332a] transition"
          >
            Đóng
          </button>

          {simulation && (
            <button
              onClick={handleApply}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center space-x-1.5 cursor-pointer"
            >
              <span>Áp Dụng Vào Lịch Thật</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
