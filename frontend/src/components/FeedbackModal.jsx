import React, { useState } from 'react';
import { MessageSquare, Send, X, Star, Bug, Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';

export default function FeedbackModal({ isOpen, onClose, user }) {
  const [type, setType] = useState('FEEDBACK');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      showToast({ type: 'warning', title: 'Thiếu nội dung', message: 'Vui lòng nhập nội dung góp ý hoặc báo lỗi!' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.sendFeedback({
        name: user?.name || 'Khách',
        email: user?.email || 'anonymous@student.edu.vn',
        type,
        message: message.trim()
      });
      showToast({
        type: 'success',
        title: 'Cảm ơn bạn!',
        message: res.message || 'Đã gửi phản hồi thành công đến ban quản trị!'
      });
      setMessage('');
      onClose();
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Lỗi gửi phản hồi',
        message: err.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-md bg-white dark:bg-[#101915] border border-slate-200 dark:border-[#22362d] rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-[#1d2c26] bg-slate-50/60 dark:bg-[#0e1512] flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                Góp Ý & Báo Lỗi AI
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Ý kiến của bạn giúp AI xếp lịch ngày càng chính xác hơn
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Loại phản hồi:
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setType('FEEDBACK')}
                className={`p-2.5 rounded-xl border flex items-center justify-center space-x-1.5 font-bold transition cursor-pointer ${
                  type === 'FEEDBACK'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-300'
                    : 'bg-slate-50 dark:bg-[#14201a] border-slate-200 dark:border-[#22362d] text-slate-600 dark:text-slate-400'
                }`}
              >
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>Góp ý tính năng</span>
              </button>

              <button
                type="button"
                onClick={() => setType('BUG_REPORT')}
                className={`p-2.5 rounded-xl border flex items-center justify-center space-x-1.5 font-bold transition cursor-pointer ${
                  type === 'BUG_REPORT'
                    ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-800 dark:text-rose-300'
                    : 'bg-slate-50 dark:bg-[#14201a] border-slate-200 dark:border-[#22362d] text-slate-600 dark:text-slate-400'
                }`}
              >
                <Bug className="w-3.5 h-3.5 text-rose-500" />
                <span>Báo lỗi AI xếp lịch</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Nội dung chi tiết:
            </label>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Mô tả sự cố hoặc ý tưởng bạn muốn Brain Dump bổ sung..."
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-[#22362d] bg-white dark:bg-[#14201a] text-xs text-slate-800 dark:text-emerald-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-[#16241e] text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-[#1b4d3e] dark:bg-emerald-600 hover:bg-[#143e31] dark:hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-[#1b4d3e]/20 transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>{isSubmitting ? 'Đang gửi...' : 'Gửi Phản Hồi'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
