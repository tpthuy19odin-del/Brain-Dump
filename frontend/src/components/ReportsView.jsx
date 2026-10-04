import React from 'react';
import { FileText, BarChart3, Clock, CheckCircle2, Sparkles, PieChart, Lock, Crown, Zap } from 'lucide-react';
import ThemeSwitch from './ThemeSwitch';

export default function ReportsView({ stats, tasks = [], subtasks = [], onAskAI, user, onOpenUpgrade }) {
  const isPro = user?.plan === 'PRO' || user?.role === 'ADMIN';
  const subjectsMap = {};
  tasks.forEach(t => {
    const subj = t.subject || 'Học tập';
    subjectsMap[subj] = (subjectsMap[subj] || 0) + 1;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#fafdfa] dark:bg-[#080d0b] p-6 transition-colors duration-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-black text-[#1b3d2f] dark:text-[#f0fdf4] flex items-center space-x-2">
              <FileText className="w-5 h-5 text-[#1b7a53] dark:text-emerald-400" />
              <span>Báo Cáo Tổng Kết & Phân Tích Chuyên Sâu</span>
            </h2>
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
              isPro ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}>
              {isPro ? 'PRO ACTIVE' : 'PRO ONLY'}
            </span>
          </div>
          <p className="text-xs text-[#5f8070] dark:text-[#8aa396] font-medium mt-0.5">
            Tổng hợp dữ liệu học tập, cảnh báo quá tải và lời khuyên tối ưu từ AI
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* Dark/Light Quick Toggle Switch */}
          <ThemeSwitch />

          <button
            onClick={() => {
              if (!isPro) {
                if (onOpenUpgrade) onOpenUpgrade();
              } else {
                onAskAI('Tổng kết báo cáo học tập tuần này và đưa ra 3 việc cần tập trung tuần sau');
              }
            }}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center space-x-1.5 shadow-md transition cursor-pointer ${
              isPro 
                ? 'bg-[#1b4d3e] dark:bg-emerald-600 hover:bg-[#143e31] dark:hover:bg-emerald-700 text-white shadow-[#1b4d3e]/20'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300'
            }`}
          >
            {isPro ? <Sparkles className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5" />}
            <span>Tóm Tắt Bằng AI {isPro ? '' : '(PRO)'}</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* 4 Numbers Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#101915] border border-[#e1ece4] dark:border-[#1d2c26] shadow-2xs text-center">
            <div className="text-[11px] font-bold text-[#6a8d7d] dark:text-[#7f9e8f]">Tổng giờ đã làm</div>
            <div className="text-2xl font-black text-[#1b3d2f] dark:text-[#f0fdf4] mt-1">{stats?.totalHours || '0'}h</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#101915] border border-[#e1ece4] dark:border-[#1d2c26] shadow-2xs text-center">
            <div className="text-[11px] font-bold text-[#6a8d7d] dark:text-[#7f9e8f]">Số bước hoàn thành</div>
            <div className="text-2xl font-black text-[#1b7a53] dark:text-emerald-400 mt-1">{stats?.doneSubtasks || 0}</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#101915] border border-[#e1ece4] dark:border-[#1d2c26] shadow-2xs text-center">
            <div className="text-[11px] font-bold text-[#6a8d7d] dark:text-[#7f9e8f]">Tỷ lệ đúng kế hoạch</div>
            <div className="text-2xl font-black text-[#1b7a53] dark:text-emerald-400 mt-1">{stats?.completionRate || 0}%</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#101915] border border-[#e1ece4] dark:border-[#1d2c26] shadow-2xs text-center">
            <div className="text-[11px] font-bold text-[#6a8d7d] dark:text-[#7f9e8f]">Số deadline đã xử lý</div>
            <div className="text-2xl font-black text-[#1b3d2f] dark:text-[#f0fdf4] mt-1">{stats?.totalTasks || 0}</div>
          </div>
        </div>

        {/* Subjects Breakdown */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#101915] border border-[#e1ece4] dark:border-[#1d2c26] shadow-2xs">
          <h3 className="text-sm font-extrabold text-[#1b3d2f] dark:text-[#f0fdf4] mb-4 flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-[#1b7a53] dark:text-emerald-400" />
            <span>Phân Bổ Công Việc Theo Môn Học</span>
          </h3>

          {Object.keys(subjectsMap).length === 0 ? (
            <div className="py-6 text-center text-slate-400 dark:text-slate-500 text-xs">
              Chưa có môn học nào. Hãy thêm bài tập để xem biểu đồ phân bổ nhé!
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(subjectsMap).map(([subj, count]) => {
                const pct = Math.round((count / (tasks.length || 1)) * 100);
                return (
                  <div key={subj}>
                    <div className="flex justify-between text-xs font-bold text-[#234b39] dark:text-emerald-300 mb-1">
                      <span>{subj}</span>
                      <span>{count} task ({pct}%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-[#182720] rounded-full overflow-hidden">
                      <div className="h-full bg-[#1b7a53] dark:bg-emerald-500 rounded-full" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* PRO Feature: Deep Burnout & AI Optimization Insights */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-white to-purple-50/40 dark:from-[#101915] dark:to-[#161a26] border border-purple-200/80 dark:border-purple-900/40 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Phân Tích Hiệu Suất Chuyên Sâu & Cảnh Báo Quá Tải (Burnout Prevention)
              </h3>
            </div>
            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
              PRO ONLY ⭐
            </span>
          </div>

          {!isPro ? (
            <div className="p-6 text-center bg-white/80 dark:bg-[#121820]/80 backdrop-blur-xs rounded-2xl border border-purple-200 dark:border-purple-900/60 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
                <Lock className="w-5 h-5" />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                Báo cáo phân tích nhịp độ học tập hàng tuần, phát hiện sớm nguy cơ dồn ứ deadline và biểu đồ chỉ số mệt mỏi chỉ khả dụng trên gói PRO.
              </p>
              <button
                onClick={onOpenUpgrade}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-700 text-white text-xs font-black shadow-md transition cursor-pointer inline-flex items-center space-x-1.5"
              >
                <Crown className="w-3.5 h-3.5 fill-white" />
                <span>Nâng Cấp PRO Để Mở Khóa Báo Cáo</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="p-3.5 rounded-xl bg-purple-100/50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60">
                <span className="font-bold text-purple-900 dark:text-purple-200">💡 Đánh giá của AI:</span> Tải học tập của bạn đang duy trì ở mức tối ưu (78% công suất). Khung giờ học hiệu quả nhất ghi nhận vào khoảng 08:30 - 11:00 sáng.
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white dark:bg-[#101915] border border-slate-200 dark:border-[#22362d]">
                  <span className="font-bold text-slate-800 dark:text-slate-100">Chỉ số năng lượng học tập:</span> 85/100
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-[#101915] border border-slate-200 dark:border-[#22362d]">
                  <span className="font-bold text-slate-800 dark:text-slate-100">Dự báo nguy cơ trễ hạn:</span> Thấp (Dưới 10%)
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

