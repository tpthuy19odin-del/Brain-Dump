import React from 'react';
import { FileText, BarChart3, Clock, CheckCircle2, Sparkles, PieChart } from 'lucide-react';
import ThemeSwitch from './ThemeSwitch';

export default function ReportsView({ stats, tasks = [], subtasks = [], onAskAI }) {
  const subjectsMap = {};
  tasks.forEach(t => {
    const subj = t.subject || 'Học tập';
    subjectsMap[subj] = (subjectsMap[subj] || 0) + 1;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#fafdfa] dark:bg-[#080d0b] p-6 transition-colors duration-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black text-[#1b3d2f] dark:text-[#f0fdf4] flex items-center space-x-2">
            <FileText className="w-5 h-5 text-[#1b7a53] dark:text-emerald-400" />
            <span>Báo Cáo Tổng Kết Tuần & Tháng</span>
          </h2>
          <p className="text-xs text-[#5f8070] dark:text-[#8aa396] font-medium mt-0.5">
            Tổng hợp dữ liệu học tập và lời khuyên tối ưu từ AI
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          {/* Dark/Light Quick Toggle Switch */}
          <ThemeSwitch />

          <button
            onClick={() => onAskAI('Tổng kết báo cáo học tập tuần này và đưa ra 3 việc cần tập trung tuần sau')}
            className="px-4 py-2 rounded-xl bg-[#1b4d3e] dark:bg-emerald-600 hover:bg-[#143e31] dark:hover:bg-emerald-700 text-white font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-[#1b4d3e]/20 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Tóm Tắt Bằng AI</span>
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
      </div>
    </div>
  );
}

