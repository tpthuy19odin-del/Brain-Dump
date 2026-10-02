import React from 'react';
import { AlertTriangle, CheckCircle, Info, Sparkles, ChevronRight } from 'lucide-react';

export default function WorkloadBanner({ stats, onAskAI }) {
  if (!stats) return null;

  const isOverload = stats.workloadStatus === 'OVERLOAD';
  const isHeavy = stats.workloadStatus === 'HEAVY';

  const bgColor = isOverload ? 'bg-red-50 border-red-200' : isHeavy ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50/90 border-emerald-200';
  const textColor = isOverload ? 'text-red-800' : isHeavy ? 'text-amber-800' : 'text-emerald-800';
  const icon = isOverload ? <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" /> : isHeavy ? <Info className="w-4 h-4 text-amber-600 shrink-0" /> : <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />;

  return (
    <div className={`mx-4 md:mx-6 mt-4 p-3 rounded-xl border ${bgColor} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs transition-all shadow-sm`}>
      <div className="flex items-center space-x-2.5">
        <div className="p-1.5 rounded-lg bg-white shadow-xs">
          {icon}
        </div>
        <div>
          <span className={`font-bold ${textColor}`}>
            {isOverload ? 'CẢNH BÁO QUÁ TẢI' : isHeavy ? 'KHỐI LƯỢNG NẶNG' : 'TIẾN ĐỘ TỐT'}:
          </span>{' '}
          <span className="text-slate-700">{stats.workloadText}</span>
          <span className="text-slate-500 ml-2">
            (Tổng thời lượng: <strong className="text-slate-900">{stats.totalHours}h</strong> • Tỷ lệ hoàn thành: <strong className="text-emerald-700">{stats.completionRate}%</strong>)
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2 shrink-0">
        <button
          onClick={() => onAskAI('Nhận xét lịch tuần này và gợi ý cách tối ưu khối lượng cho mình')}
          className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition font-semibold shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Nhờ AI tối ưu</span>
          <ChevronRight className="w-3 h-3 text-emerald-500" />
        </button>
      </div>
    </div>
  );
}
