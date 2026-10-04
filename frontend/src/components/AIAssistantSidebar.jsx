import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  Minus,
  Sparkles,
  Bot,
  User,
  Clock,
  Calendar,
  BarChart3,
  ChevronRight,
  Image as ImageIcon,
  Paperclip,
  Check,
  RotateCcw,
  Lock,
  Crown,
  Zap
} from 'lucide-react';

import { useToast } from '../context/ToastContext';

export default function AIAssistantSidebar({
  messages = [],
  onSendMessage,
  isLoading,
  onClose,
  user,
  onOpenUpgrade
}) {
  const { showToast } = useToast();
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const isPro = user?.plan === 'PRO' || user?.role === 'ADMIN';
  const userMessagesCount = messages.filter(m => m.role === 'user').length;
  const usedCount = Math.min(10, userMessagesCount);
  const isLimitReached = !isPro && userMessagesCount >= 10;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (isLimitReached) {
      showToast({
        type: 'warning',
        title: 'Hết giới hạn Free ⭐',
        message: 'Bạn đã dùng hết 10/10 câu hỏi AI hôm nay. Hãy nâng cấp gói PRO để chat không giới hạn!'
      });
      if (onOpenUpgrade) onOpenUpgrade();
      return;
    }

    onSendMessage(input.trim());
    setInput('');
  };

  const handleQuickPrompt = (text) => {
    if (isLimitReached) {
      showToast({
        type: 'warning',
        title: 'Hết giới hạn Free ⭐',
        message: 'Bạn đã dùng hết 10/10 câu hỏi AI hôm nay. Hãy nâng cấp gói PRO để chat không giới hạn!'
      });
      if (onOpenUpgrade) onOpenUpgrade();
      return;
    }
    onSendMessage(text);
  };

// Voice to Text using Web Speech API
const handleVoiceInput = () => {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    showToast({
      type: 'warning',
      title: 'Chưa hỗ trợ giọng nói',
      message: 'Trình duyệt của bạn chưa hỗ trợ Web Speech API. Bạn có thể gõ trực tiếp câu lệnh!'
    });
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = 'vi-VN';
  recognition.interimResults = false;

  recognition.onstart = () => {
    setIsRecording(true);
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    setInput(transcript);
    setIsRecording(false);
    onSendMessage(transcript);
  };

  recognition.onerror = () => {
    setIsRecording(false);
  };

  recognition.onend = () => {
    setIsRecording(false);
  };

  recognition.start();
};

// Image Upload handler (Compressed client-side for ultra-fast Gemini Vision OCR)
const handleFileUpload = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 1200;
      const scale = img.width > MAX_WIDTH ? (MAX_WIDTH / img.width) : 1;
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);

      onSendMessage(
        `[Ảnh: ${file.name}] Hãy phân tích thời khóa biểu / đề bài từ ảnh này và cập nhật vào hệ thống giúp mình!`,
        compressedBase64
      );
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
  e.target.value = '';
};

return (
  <aside className="w-full lg:w-[360px] xl:w-[390px] h-full bg-white dark:bg-[#0e1512] border-l border-[#e3ece5] dark:border-[#1d2c26] flex flex-col justify-between shrink-0 select-none shadow-xs transition-colors duration-200">
    {/* 1. Header */}
    <div className="p-3.5 sm:p-4 border-b border-[#e9f2eb] dark:border-[#1d2c26] flex items-center justify-between bg-white dark:bg-[#0e1512]">
      <div className="flex items-center space-x-2.5">
        <div className="w-7 h-7 rounded-xl bg-[#e5f4e8] dark:bg-[#1b3d2f] text-[#1b4d3e] dark:text-emerald-400 flex items-center justify-center">
          <Bot className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-extrabold text-sm text-[#1b3d2f] dark:text-[#f0fdf4]">AI Assistant</h3>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Gõ tự do, giọng nói hoặc tải ảnh TKB</p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {isPro ? (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700 flex items-center gap-1">
            <Crown className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span>PRO Vô Hạn</span>
          </span>
        ) : (
          <button
            onClick={onOpenUpgrade}
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 transition cursor-pointer ${isLimitReached
                ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 animate-pulse'
                : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 hover:bg-emerald-100'
              }`}
            title="Gói Free: Giới hạn 10 câu hỏi/ngày. Bấm để nâng cấp PRO"
          >
            <span>{isLimitReached ? '🚫 Hết lượt' : `💬 ${usedCount}/10 câu`}</span>
          </button>
        )}

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-[#182720] transition cursor-pointer flex items-center space-x-1 text-xs font-semibold"
            title="Thu gọn AI Chatbot"
          >
            <Minus className="w-4 h-4 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white" />
          </button>
        )}
      </div>
    </div>

    {/* 2. Messages List */}
    <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#fbfdfb] dark:bg-[#090e0c]">
      {messages.map((msg) => {
        const isUser = msg.role === 'user';
        return (
          <div
            key={msg.id}
            className={`flex items-start space-x-2.5 ${isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}
          >
            <div
              className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${isUser ? 'bg-[#1b4d3e] dark:bg-emerald-600 text-white' : 'bg-[#e5f4e8] dark:bg-[#182921] text-[#1b4d3e] dark:text-emerald-400'
                }`}
            >
              {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${isUser
                  ? 'bg-[#e2f3e5] dark:bg-[#1b382b] text-[#194c3a] dark:text-emerald-200 font-medium rounded-tr-none shadow-2xs'
                  : 'bg-white dark:bg-[#131e19] text-[#204033] dark:text-[#e2ede6] rounded-tl-none border border-[#e2efe5] dark:border-[#22362c] shadow-2xs'
                }`}
            >
              <div className="whitespace-pre-line font-medium">{msg.content}</div>

              {/* Metadata actions */}
              {!isUser && msg.metadata && (() => {
                try {
                  const meta = typeof msg.metadata === 'string' ? JSON.parse(msg.metadata) : msg.metadata;
                  if (meta.type === 'SCHEDULE_MODIFIED' || meta.type === 'TASK_CREATED' || meta.type === 'FIXED_SCHEDULE_CREATED') {
                    return (
                      <div className="flex items-center space-x-1.5 mt-2 pt-1.5 border-t border-emerald-100 dark:border-[#223a2f] text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                        <Check className="w-3.5 h-3.5" />
                        <span>Đã tự động đưa vào Thời Khóa Biểu</span>
                      </div>
                    );
                  }
                  if (meta.type === 'REPLAN' || meta.type === 'WHAT_IF' || meta.type === 'PANIC_MODE') {
                    return (
                      <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-slate-100 dark:border-[#223a2f]">
                        <button
                          onClick={() => onSendMessage('Chấp nhận kế hoạch này')}
                          className="px-2.5 py-1 rounded-lg bg-[#1b4d3e] dark:bg-emerald-600 text-white text-[10px] font-bold hover:bg-[#143e31] dark:hover:bg-emerald-700 transition"
                        >
                          Chấp nhận
                        </button>
                        <button
                          onClick={() => onSendMessage('Giữ nguyên lịch cũ')}
                          className="px-2.5 py-1 rounded-lg bg-[#f4f8f5] dark:bg-[#16231c] text-[#335645] dark:text-emerald-300 border border-[#d6e7db] dark:border-[#263e32] text-[10px] font-bold hover:bg-[#e8f1ea] dark:hover:bg-[#1d3126] transition"
                        >
                          Hoàn tác
                        </button>
                      </div>
                    );
                  }
                } catch (e) { }
                return null;
              })()}

              <div className="text-[9px] text-right mt-1 text-slate-400 dark:text-slate-500">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        );
      })}

      {isLoading && (
        <div className="flex items-center space-x-2 text-[#46745e] dark:text-emerald-400 text-xs italic py-1">
          <Sparkles className="w-4 h-4 animate-spin text-[#1b7a53] dark:text-emerald-400" />
          <span>AI đang phân tích & xếp lại lịch...</span>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>

    {/* 3. Quick Prompts Section (Gợi ý nhanh) */}
    <div className="px-4 py-3 border-t border-[#eaf2ec] dark:border-[#1d2c26] bg-[#f9fcfa] dark:bg-[#0c1310] space-y-2">
      <h4 className="font-extrabold text-xs text-[#1f4233] dark:text-emerald-300 mb-1">Gợi ý nhanh:</h4>

      <div
        onClick={() => handleQuickPrompt('Việc nào gấp nhất hôm nay?')}
        className="p-2.5 rounded-xl bg-white dark:bg-[#131e19] border border-[#e2ede5] dark:border-[#22362c] flex items-center justify-between cursor-pointer hover:bg-[#f2f8f4] dark:hover:bg-[#182721] transition shadow-2xs"
      >
        <div className="flex items-center space-x-2 text-xs font-bold text-[#2a5542] dark:text-emerald-200">
          <Clock className="w-3.5 h-3.5 text-[#1b7a53] dark:text-emerald-400" />
          <span>Việc nào gấp nhất?</span>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-[#7a998b] dark:text-[#5e8171]" />
      </div>

      <div
        onClick={() => handleQuickPrompt('Tuần này rảnh khi nào?')}
        className="p-2.5 rounded-xl bg-white dark:bg-[#131e19] border border-[#e2ede5] dark:border-[#22362c] flex items-center justify-between cursor-pointer hover:bg-[#f2f8f4] dark:hover:bg-[#182721] transition shadow-2xs"
      >
        <div className="flex items-center space-x-2 text-xs font-bold text-[#2a5542] dark:text-emerald-200">
          <Calendar className="w-3.5 h-3.5 text-[#1b7a53] dark:text-emerald-400" />
          <span>Tuần này rảnh khi nào?</span>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-[#7a998b] dark:text-[#5e8171]" />
      </div>

      <div
        onClick={() => handleQuickPrompt('Kiểm tra workload tuần này')}
        className="p-2.5 rounded-xl bg-white dark:bg-[#131e19] border border-[#e2ede5] dark:border-[#22362c] flex items-center justify-between cursor-pointer hover:bg-[#f2f8f4] dark:hover:bg-[#182721] transition shadow-2xs"
      >
        <div className="flex items-center space-x-2 text-xs font-bold text-[#2a5542] dark:text-emerald-200">
          <BarChart3 className="w-3.5 h-3.5 text-[#1b7a53] dark:text-emerald-400" />
          <span>Kiểm tra workload tuần này</span>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-[#7a998b] dark:text-[#5e8171]" />
      </div>
    </div>

    {/* 4. Bottom Input Bar */}
    <form onSubmit={handleSubmit} className="p-3 border-t border-[#e9f2eb] dark:border-[#1d2c26] bg-white dark:bg-[#0e1512]">
      {isLimitReached && (
        <div className="mb-2.5 p-2.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-[#261e12] dark:to-[#2e1d14] border border-amber-200 dark:border-amber-800/60 flex items-center justify-between shadow-2xs animate-in fade-in">
          <div className="flex items-center space-x-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-black text-amber-900 dark:text-amber-200">Đã hết 10 lượt hỏi Free hôm nay</p>
              <p className="text-[9.5px] text-amber-700 dark:text-amber-400 truncate">Nâng cấp PRO để chat không giới hạn</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenUpgrade}
            className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-600 hover:to-emerald-700 text-white text-[10px] font-black shrink-0 shadow-2xs transition cursor-pointer flex items-center space-x-1"
          >
            <Zap className="w-2.5 h-2.5" />
            <span>Nâng PRO</span>
          </button>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*,.pdf"
        className="hidden"
      />

      <div className="flex items-center bg-[#f4f9f5] dark:bg-[#14201a] border border-[#daebd0] dark:border-[#22362d] rounded-2xl px-3 py-1.5 focus-within:border-[#1b7a53] dark:focus-within:border-emerald-500 focus-within:bg-white dark:focus-within:bg-[#121c18] transition">
        {/* Image/PDF upload icon */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-1 text-[#6c8e7e] dark:text-[#7f9e8f] hover:text-[#1b4d3e] dark:hover:text-emerald-300 transition mr-1"
          title="Tải ảnh thời khóa biểu hoặc file đề bài"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Gõ việc tự do (VD: Mai nộp bài Toán, Tối T4 bận)..."
          className="flex-1 bg-transparent text-xs text-slate-800 dark:text-[#e2ede6] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none py-1.5"
        />

        {/* Voice Input Mic Button */}
        <button
          type="button"
          onClick={handleVoiceInput}
          className={`p-1.5 rounded-full transition ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'text-[#6c8e7e] dark:text-[#7f9e8f] hover:text-[#1b4d3e] dark:hover:text-emerald-300'}`}
          title="Nói để nhập giọng nói"
        >
          <Mic className="w-4 h-4" />
        </button>

        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="w-8 h-8 rounded-full bg-[#1b4d3e] dark:bg-emerald-600 hover:bg-[#153e32] dark:hover:bg-emerald-700 disabled:opacity-40 text-white flex items-center justify-center ml-1.5 shadow-xs transition shrink-0 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5 ml-0.5" />
        </button>
      </div>
    </form>
    </aside>
  );
}

