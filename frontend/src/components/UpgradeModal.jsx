import React, { useState } from 'react';
import {
  Crown,
  Sparkles,
  Check,
  X,
  Zap,
  ShieldCheck,
  Flame,
  Loader2,
  Calendar,
  Mail,
  TrendingUp,
  Bot,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';

export default function UpgradeModal({ isOpen, onClose, user, onUserUpdated }) {
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [selectedBilling, setSelectedBilling] = useState('monthly'); // 'monthly' | 'yearly'
  const { showToast } = useToast();

  if (!isOpen) return null;

  const isPro = user?.plan === 'PRO' || user?.role === 'ADMIN';

  const handleUpgrade = async () => {
    setIsUpgrading(true);
    try {
      // 1. Immediately update user state to PRO
      const updatedUser = { ...(user || { name: 'Người dùng', email: 'guest@student.edu.vn' }), plan: 'PRO' };
      localStorage.setItem('brain_dump_user', JSON.stringify(updatedUser));
      if (onUserUpdated) onUserUpdated(updatedUser);

      // 2. Sync with backend
      await api.upgradePlan('PRO', updatedUser.email).catch((err) => {
        console.warn('Backend upgrade sync note:', err);
      });

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      showToast({
        type: 'success',
        title: '🎉 Đã Kích Hoạt PRO Thành Công!',
        message: 'Tài khoản đã được chuyển sang gói PRO! Mọi tính năng cao cấp (What-If, Báo Mail, Phân tích chuyên sâu) đã sẵn sàng sử dụng.'
      });
      onClose();
    } catch (e) {
      console.error('Upgrade error:', e);
      showToast({
        type: 'info',
        title: 'Đã kích hoạt PRO tạm thời',
        message: 'Tài khoản của bạn đã được nâng cấp lên PRO trên phiên làm việc hiện tại!'
      });
      onClose();
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleDowngrade = async () => {
    setIsUpgrading(true);
    try {
      const updatedUser = { ...(user || { name: 'Người dùng', email: 'guest@student.edu.vn' }), plan: 'FREE' };
      localStorage.setItem('brain_dump_user', JSON.stringify(updatedUser));
      if (onUserUpdated) onUserUpdated(updatedUser);

      await api.upgradePlan('FREE', updatedUser.email).catch(() => { });

      showToast({
        type: 'info',
        title: 'Đã chuyển về gói FREE',
        message: 'Tài khoản đã chuyển về gói Miễn Phí cơ bản.'
      });
      onClose();
    } catch (e) {
      console.error('Downgrade error:', e);
    } finally {
      setIsUpgrading(false);
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'Gói Miễn Phí (FREE)',
      badge: 'Cơ bản',
      price: '0 đ',
      period: '/mãi mãi',
      description: 'Phù hợp cho học sinh, sinh viên quản lý việc học cơ bản hàng ngày.',
      isCurrent: !isPro,
      features: [
        { title: 'AI Breakdown bài tập (Tối đa 10 task/ngày)', included: true },
        { title: 'Lịch biểu & Kéo thả thủ công', included: true },
        { title: 'Đồng hồ Focus Pomodoro cơ bản', included: true },
        { title: 'Xuất file Google Calendar (.ICS)', included: true },
        { title: 'Mô phỏng kịch bản What-If', included: false },
        { title: 'Tự động gửi cảnh báo việc gấp qua Email', included: false },
        { title: 'AI Tự động xếp lịch thông minh 24/7', included: false },
        { title: 'Báo cáo & Phân tích chuyên sâu (Weekly Burnout)', included: false }
      ]
    },
    {
      id: 'pro',
      name: 'Gói Cao Cấp (PRO ⭐)',
      badge: 'Khuyên Dùng',
      popular: true,
      price: selectedBilling === 'monthly' ? '49.000 đ' : '39.000 đ',
      period: '/tháng',
      savings: selectedBilling === 'yearly' ? 'Tiết kiệm 20% khi đóng theo năm' : null,
      description: 'Mở khóa toàn bộ sức mạnh AI, chống trễ deadline và tối ưu hóa năng suất 100%.',
      isCurrent: isPro,
      features: [
        { title: 'Không giới hạn AI chia nhỏ Task & Chat', included: true, highlight: true },
        { title: 'Mô phỏng What-If Simulator kịch bản', included: true, highlight: true },
        { title: 'Tự động gửi Email cảnh báo việc gấp về Gmail', included: true, highlight: true },
        { title: 'AI Tự động xếp lịch tối ưu tránh trùng TKB', included: true, highlight: true },
        { title: 'Hoàn tác (Undo) lịch trước & sau khi AI xếp', included: true },
        { title: 'Đồng hồ Pomodoro đa chế độ & âm thanh Lofi', included: true },
        { title: 'Báo cáo hiệu suất học tập & cảnh báo quá tải', included: true },
        { title: 'Hỗ trợ ưu tiên 24/7 từ đội ngũ kỹ thuật', included: true }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-[#101915] rounded-3xl border border-slate-200 dark:border-[#1e3328] shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col">

        {/* Modal Header */}
        <div className="relative p-6 bg-gradient-to-r from-emerald-800 via-[#1b4d3e] to-teal-900 text-white flex items-center justify-between shrink-0 overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex items-center space-x-3.5 z-10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 text-amber-950 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-black tracking-tight">Nâng Cấp Gói Tài Khoản</h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-400/30 text-amber-200 border border-amber-300/40">
                  Brain Dump PRO
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 mt-0.5">
                Chọn gói phù hợp để giải phóng năng lực học tập và quản lý thời gian đỉnh cao
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="px-6 pt-5 pb-2 flex justify-center items-center gap-3 bg-slate-50 dark:bg-[#0c1410] border-b border-slate-200/60 dark:border-[#1d2d25]">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Chu kỳ thanh toán:</span>
          <div className="flex bg-slate-200 dark:bg-[#15231c] p-1 rounded-xl border border-slate-300 dark:border-[#22382d] text-xs font-bold">
            <button
              onClick={() => setSelectedBilling('monthly')}
              className={`px-3 py-1 rounded-lg transition ${selectedBilling === 'monthly'
                  ? 'bg-white dark:bg-[#1e3428] text-emerald-800 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
            >
              Theo Tháng
            </button>
            <button
              onClick={() => setSelectedBilling('yearly')}
              className={`px-3 py-1 rounded-lg transition flex items-center gap-1.5 ${selectedBilling === 'yearly'
                  ? 'bg-white dark:bg-[#1e3428] text-emerald-800 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
            >
              <span>Theo Năm</span>
              <span className="text-[9px] font-black px-1 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Modal Body - 2 Plans Comparison */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 dark:bg-[#0c1410]">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all relative ${plan.popular
                  ? 'bg-gradient-to-b from-white to-emerald-50/40 dark:from-[#13201a] dark:to-[#0f1b15] border-2 border-emerald-500/80 shadow-xl shadow-emerald-900/10'
                  : 'bg-white dark:bg-[#121c17] border border-slate-200 dark:border-[#1d2d25] shadow-xs'
                }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-emerald-600 text-white text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3 fill-white" />
                  <span>{plan.badge}</span>
                </div>
              )}

              <div>
                {/* Plan Header */}
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    {plan.id === 'pro' && <Crown className="w-4 h-4 text-amber-500" />}
                    <span>{plan.name}</span>
                  </h4>
                  {plan.isCurrent && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      Gói Hiện Tại
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 min-h-[34px]">
                  {plan.description}
                </p>

                {/* Price */}
                <div className="mb-4 pb-4 border-b border-slate-100 dark:border-[#1c2c23]">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900 dark:text-white">{plan.price}</span>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{plan.period}</span>
                  </div>
                  {plan.savings && (
                    <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 mt-1">
                      ✨ {plan.savings}
                    </div>
                  )}
                </div>

                {/* Feature List */}
                <div className="space-y-2.5 mb-6">
                  <div className="text-[11px] font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                    Tính năng bao gồm:
                  </div>
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start space-x-2.5 text-xs">
                      {feat.included ? (
                        <div className={`p-0.5 rounded-full mt-0.5 shrink-0 ${feat.highlight
                            ? 'bg-emerald-500 text-white font-black'
                            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
                          }`}>
                          <Check className="w-3 h-3" />
                        </div>
                      ) : (
                        <div className="p-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mt-0.5 shrink-0">
                          <X className="w-3 h-3" />
                        </div>
                      )}
                      <span className={`${feat.included
                          ? feat.highlight ? 'font-bold text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'
                          : 'text-slate-400 dark:text-slate-500 line-through opacity-75'
                        }`}>
                        {feat.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div>
                {plan.id === 'pro' ? (
                  plan.isCurrent ? (
                    <div className="space-y-2">
                      <div className="w-full py-2.5 rounded-xl bg-emerald-100 dark:bg-[#1a3327] border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs font-black text-center flex items-center justify-center space-x-1.5">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Bạn đang sử dụng gói PRO</span>
                      </div>
                      <button
                        onClick={handleDowngrade}
                        disabled={isUpgrading}
                        className="w-full py-1 text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-semibold text-center cursor-pointer transition"
                      >
                        Hủy / Chuyển về gói Free
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleUpgrade}
                      disabled={isUpgrading}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-[#1b4d3e] to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-black shadow-lg shadow-emerald-700/25 transition cursor-pointer flex items-center justify-center space-x-2"
                    >
                      {isUpgrading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
                      )}
                      <span>{isUpgrading ? 'Đang kích hoạt...' : 'Kích Hoạt PRO Ngay (Dùng Thử)'}</span>
                    </button>
                  )
                ) : (
                  plan.isCurrent ? (
                    <div className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-[#182620] border border-slate-200 dark:border-[#22362c] text-slate-600 dark:text-slate-300 text-xs font-bold text-center">
                      Đang sử dụng gói này
                    </div>
                  ) : (
                    <button
                      onClick={handleDowngrade}
                      disabled={isUpgrading}
                      className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-[#182620] hover:bg-slate-200 dark:hover:bg-[#20332a] text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
                    >
                      Chuyển về gói Miễn Phí
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer Note */}
        <div className="p-4 bg-white dark:bg-[#101915] border-t border-slate-200/80 dark:border-[#1e3328] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2 shrink-0">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Hỗ trợ thanh toán bảo mật & có thể hủy gói bất kỳ lúc nào</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#182620] font-bold transition cursor-pointer"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
}
