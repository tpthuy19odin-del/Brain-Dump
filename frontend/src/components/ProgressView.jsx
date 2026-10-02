import React from 'react';
import { 
  TrendingUp, 
  Flame, 
  Award, 
  Clock, 
  Zap, 
  CheckCircle2, 
  Sparkles,
  BookOpen
} from 'lucide-react';

export default function ProgressView({ stats, tasks = [], subtasks = [], onAskAI }) {
  const streakBadges = [
    { days: 7, label: 'Tân Binh Tập Trung', unlocked: (stats?.streakDays || 0) >= 7, icon: '🌱' },
    { days: 14, label: 'Chiến Binh Kỷ Luật', unlocked: (stats?.streakDays || 0) >= 14, icon: '⚔️' },
    { days: 30, label: 'Bậc Thầy Deadline', unlocked: (stats?.streakDays || 0) >= 30, icon: '👑' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#fafdfa] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black text-[#1b3d2f] flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-[#1b7a53]" />
            <span>Tiến Độ, Chuỗi Streak & Huy Hiệu</span>
          </h2>
          <p className="text-xs text-[#5f8070] font-medium mt-0.5">
            Theo dõi sự tiến bộ hàng ngày và duy trì chuỗi hoàn thành nhiệm vụ
          </p>
        </div>

        <button
          onClick={() => onAskAI('Nhận xét tiến độ học tập và đề xuất phương án cải thiện cho tuần tới')}
          className="px-4 py-2 rounded-xl bg-[#1b4d3e] hover:bg-[#143e31] text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-[#1b4d3e]/20 transition"
        >
          <Sparkles className="w-4 h-4" />
          <span>Nhờ AI Đánh Giá</span>
        </button>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Streak Hero Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-[#1b4d3e] to-[#256c57] text-white shadow-md flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-200 mb-1">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-bounce" />
              <span>CHUỖI LIÊN TIẾP HIỆN TẠI</span>
            </div>
            <h3 className="text-3xl font-black">{stats?.streakDays || 0} Ngày Liên Tục</h3>
            <p className="text-xs text-emerald-100 mt-1">
              Hãy hoàn thành ít nhất 1 khối việc mỗi ngày để không làm đứt chuỗi nhé!
            </p>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-3xl">
            🔥
          </div>
        </div>

        {/* Badges Milestone */}
        <div className="p-6 rounded-3xl bg-white border border-[#e1ece4] shadow-2xs">
          <h3 className="text-sm font-extrabold text-[#1b3d2f] mb-4 flex items-center space-x-2">
            <Award className="w-4 h-4 text-[#1b7a53]" />
            <span>Huy Hiệu Cột Mốc Streak</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {streakBadges.map((b) => (
              <div
                key={b.days}
                className={`p-4 rounded-2xl border text-center transition ${
                  b.unlocked
                    ? 'bg-[#ebf8ee] border-[#cfe8d4] text-[#1b4d3e] shadow-2xs'
                    : 'bg-[#f8faf8] border-slate-200 opacity-60 text-slate-500'
                }`}
              >
                <div className="text-3xl mb-2">{b.icon}</div>
                <div className="font-extrabold text-xs">{b.label}</div>
                <div className="text-[10px] font-mono mt-0.5">Mốc {b.days} ngày streak</div>
                <div className="mt-2 text-[10px] font-bold">
                  {b.unlocked ? '✅ Đã đạt được' : '🔒 Chưa mở khóa'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Learning Insights (Giờ Vàng & Hệ Số Bù) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-[#e1ece4] shadow-2xs space-y-2">
            <div className="flex items-center space-x-2 text-xs font-extrabold text-[#1b4d3e]">
              <Zap className="w-4 h-4 text-[#1b7a53]" />
              <span>Khung Giờ Vàng (Golden Hour)</span>
            </div>
            <p className="text-sm font-black text-[#1b3d2f]">{stats?.goldenHours || '14:00 - 17:00 (Độ tập trung 94%)'}</p>
            <p className="text-[11px] text-[#5e8271]">
              Dựa vào lịch sử tick hoàn thành Pomodoro, AI tự động xếp các task khó vào khung giờ này để bạn làm nhanh nhất.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-[#e1ece4] shadow-2xs space-y-2">
            <div className="flex items-center space-x-2 text-xs font-extrabold text-[#1b4d3e]">
              <Clock className="w-4 h-4 text-[#1b7a53]" />
              <span>Hệ Số Bù Thời Gian Thực Tế</span>
            </div>
            <p className="text-sm font-black text-[#1b3d2f]">{stats?.compensationFactor || '+15% đệm an toàn'}</p>
            <p className="text-[11px] text-[#5e8271]">
              Nếu thực tế bạn làm lâu hơn dự tính, AI sẽ tự động cộng thêm hệ số bù vào các lần lập lịch sau để tránh vỡ kế hoạch.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
