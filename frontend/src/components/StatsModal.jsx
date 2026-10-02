import React from 'react';
import { X, Sparkles, Clock, Flame, Award, CheckCircle2, TrendingUp, Zap } from 'lucide-react';

export default function StatsModal({ stats, onClose, onAskAI }) {
  if (!stats) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-3xl p-6 relative border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5 mb-6">
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Báo Cáo Tiến Độ & AI Insights</h3>
            <p className="text-xs text-slate-500">Phân tích thói quen và hiệu suất học tập của bạn</p>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-center">
            <div className="text-[11px] text-slate-500 font-medium">Tổng giờ học</div>
            <div className="text-xl font-black text-emerald-700 font-mono mt-1">{stats.totalHours}h</div>
          </div>
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-center">
            <div className="text-[11px] text-slate-500 font-medium">Đúng kế hoạch</div>
            <div className="text-xl font-black text-emerald-600 font-mono mt-1">{stats.completionRate}%</div>
          </div>
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-center">
            <div className="text-[11px] text-slate-500 font-medium">Chuỗi Streak</div>
            <div className="text-xl font-black text-amber-600 font-mono mt-1">{stats.streakDays} ngày</div>
          </div>
          <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-center">
            <div className="text-[11px] text-slate-500 font-medium">Khối đã xong</div>
            <div className="text-xl font-black text-teal-700 font-mono mt-1">{stats.doneSubtasks}/{stats.totalSubtasks}</div>
          </div>
        </div>

        {/* AI Learning Insights */}
        <div className="space-y-3 mb-6">
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start space-x-3">
            <Zap className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-xs">
              <strong className="text-emerald-900 font-bold">Khung Giờ Vàng (Golden Hour):</strong>
              <p className="text-slate-700 mt-0.5 font-medium">{stats.goldenHours}</p>
              <p className="text-[11px] text-slate-500 mt-1">AI sẽ ưu tiên xếp các môn khó/tiểu luận vào khung giờ này.</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start space-x-3">
            <Clock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs">
              <strong className="text-amber-900 font-bold">Học từ thực tế (Hệ số bù thời gian):</strong>
              <p className="text-slate-700 mt-0.5 font-medium">{stats.compensationFactor}</p>
              <p className="text-[11px] text-slate-500 mt-1">Dựa trên dữ liệu Pomodoro thực tế, AI tự động cộng thêm thời gian đệm để tránh vỡ lịch.</p>
            </div>
          </div>
        </div>

        {/* Ask AI Review Button */}
        <button
          onClick={() => {
            onClose();
            onAskAI('Nhờ AI đánh giá hiệu suất tuần này và đưa ra 3 lời khuyên để cải thiện');
          }}
          className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/25 transition"
        >
          <Sparkles className="w-4 h-4" />
          <span>Nhờ AI nhận xét chi tiết & Gợi ý cải thiện</span>
        </button>
      </div>
    </div>
  );
}
