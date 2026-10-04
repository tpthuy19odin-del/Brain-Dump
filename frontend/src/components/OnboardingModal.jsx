import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Calendar, 
  Upload, 
  CheckCircle2, 
  X,
  FileText,
  Clock,
  Flame,
  Bot
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function OnboardingModal({ isOpen, onClose, onFinishOnboarding, onAskAI }) {
  const [step, setStep] = useState(1);
  const [scheduleText, setScheduleText] = useState('Thứ 2: 07:00 - 09:30 Nhập môn mạng máy tính\nThứ 4: 13:00 - 16:00 Thực hành Lập trình Web');
  const [tasksText, setTasksText] = useState('Viết bài luận Triết học 2000 từ nộp thứ 6 tuần sau, Ôn thi giữa kỳ Cơ sở dữ liệu CN này, Làm slide nhóm IoT tối thứ 3');
  const [selectedFile, setSelectedFile] = useState(null);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      // Execute initial AI planner
      const combinedPrompt = `[Onboarding Khởi Tạo] 
Lịch học cố định của tôi:
${scheduleText}

Danh sách các bài tập và deadline của tôi:
${tasksText}

Hãy tự động lưu lịch cố định và chia nhỏ tất cả các bài tập trên, xếp vào các khung giờ trống phù hợp trong tuần giúp tôi nhé!`;

      onAskAI(combinedPrompt);
      showToast({
        type: 'success',
        title: '🎉 Hoàn tất Onboarding!',
        message: 'AI đang phân tích và sắp xếp lịch học hoàn chỉnh cho bạn!'
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-xl bg-white dark:bg-[#101915] border border-slate-200 dark:border-[#22362d] rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all">
        
        {/* Header with Progress Steps */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-[#1d2c26] bg-slate-50/50 dark:bg-[#0e1512] flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2.5">
              <img 
                src="/logo.png" 
                alt="Brain Dump Logo" 
                className="w-8 h-8 rounded-xl object-contain drop-shadow-xs" 
              />
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                Chào mừng bạn đến với Brain Dump AI
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Thiết lập kế hoạch học tập cá nhân hóa chỉ trong 3 bước
            </p>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 pt-4 flex items-center justify-between">
          {[
            { num: 1, label: 'Lịch cố định' },
            { num: 2, label: 'Đổ việc cần làm' },
            { num: 3, label: 'AI xếp lịch' }
          ].map((s) => (
            <div key={s.num} className="flex items-center space-x-2">
              <div
                className={`w-6 h-6 rounded-full text-xs font-black flex items-center justify-center transition-all ${
                  step === s.num
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 dark:ring-emerald-950'
                    : step > s.num
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                    : 'bg-slate-100 dark:bg-[#16241e] text-slate-400'
                }`}
              >
                {step > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
              </div>
              <span className={`text-xs font-bold ${step === s.num ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Modal Body according to Step */}
        <div className="p-6 flex-1 space-y-4">
          {step === 1 && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-start space-x-2.5">
                <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Bước 1:</strong> Khai báo các ca học cố định trên trường hoặc lịch họp hàng tuần để AI tự động <strong>né giờ bận</strong> khi xếp bài tập!
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nhập lịch học cố định theo thứ (hoặc chỉnh mẫu bên dưới):
                </label>
                <textarea
                  rows={4}
                  value={scheduleText}
                  onChange={(e) => setScheduleText(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-[#22362d] bg-white dark:bg-[#14201a] text-xs text-slate-800 dark:text-emerald-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                  placeholder="Ví dụ: Thứ 2: 07:00 - 11:30 Học Lập trình Web..."
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-300 flex items-start space-x-2.5">
                <Flame className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Bước 2 (Brain Dump):</strong> Hãy đổ toàn bộ suy nghĩ hỗn độn, bài tập lớn, đồ án, ôn thi hoặc deadline vào đây. Gõ tự do thoải mái, AI sẽ tự động phân loại và tính toán thời lượng!
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Danh sách việc cần làm (gõ tự do bằng tiếng Việt / tiếng Anh):
                </label>
                <textarea
                  rows={4}
                  value={tasksText}
                  onChange={(e) => setTasksText(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-[#22362d] bg-white dark:bg-[#14201a] text-xs text-slate-800 dark:text-emerald-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  placeholder="Ví dụ: Làm bài tập toán nộp thứ 6, ôn thi tiếng anh 30 câu..."
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-[#e5f4e8] dark:bg-[#1b3d2f] border border-emerald-200 dark:border-emerald-700 text-xs text-[#1b4d3e] dark:text-emerald-200">
                <div className="flex items-center space-x-2 font-black text-sm mb-1">
                  <Bot className="w-4 h-4" />
                  <span>Sẵn sàng tạo thời khóa biểu thông minh!</span>
                </div>
                <p>
                  Khi bạn bấm <strong>"Xác nhận & Xếp Lịch"</strong>, Brain Dump AI sẽ:
                </p>
                <ul className="mt-2 space-y-1 list-disc list-inside font-semibold">
                  <li>Khóa các khung giờ học cố định trên trường.</li>
                  <li>Tự động chia nhỏ từng bài tập thành các bước chi tiết (30-60 phút).</li>
                  <li>Tìm các khung giờ rảnh tối ưu trong tuần và xếp lịch vào bàn học.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-[#1d2c26] bg-slate-50/50 dark:bg-[#0e1512] flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-xl bg-white dark:bg-[#16241e] border border-slate-200 dark:border-[#22362d] text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-[#1e332a] transition flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại</span>
            </button>
          ) : (
            <div></div>
          )}

          <button
            onClick={handleNext}
            className="px-5 py-2.5 rounded-xl bg-[#1b4d3e] dark:bg-emerald-600 hover:bg-[#143e31] dark:hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-[#1b4d3e]/20 transition flex items-center space-x-2 cursor-pointer"
          >
            <span>{step === 3 ? 'Xác nhận & Xếp Lịch' : 'Tiếp theo'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
