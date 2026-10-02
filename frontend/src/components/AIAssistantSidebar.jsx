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
  RotateCcw
} from 'lucide-react';

import { useToast } from '../context/ToastContext';

export default function AIAssistantSidebar({
  messages = [],
  onSendMessage,
  isLoading
}) {
  const { showToast } = useToast();
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleQuickPrompt = (text) => {
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
    <aside className="w-full lg:w-[360px] xl:w-[390px] h-full bg-white border-l border-[#e3ece5] flex flex-col justify-between shrink-0 select-none shadow-xs">
      {/* 1. Header */}
      <div className="p-4 border-b border-[#e9f2eb] flex items-center justify-between bg-white">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-xl bg-[#e5f4e8] text-[#1b4d3e] flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-[#1b3d2f]">AI Assistant</h3>
            <p className="text-[10px] text-slate-500">Gõ tự do, giọng nói hoặc tải ảnh TKB</p>
          </div>
        </div>

        <button className="text-slate-400 hover:text-slate-700 p-1">
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#fbfdfb]">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-2.5 ${isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                  isUser ? 'bg-[#1b4d3e] text-white' : 'bg-[#e5f4e8] text-[#1b4d3e]'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-[#e2f3e5] text-[#194c3a] font-medium rounded-tr-none shadow-2xs'
                    : 'bg-white text-[#204033] rounded-tl-none border border-[#e2efe5] shadow-2xs'
                }`}
              >
                <div className="whitespace-pre-line font-medium">{msg.content}</div>

                {/* Metadata actions */}
                {!isUser && msg.metadata && (() => {
                  try {
                    const meta = typeof msg.metadata === 'string' ? JSON.parse(msg.metadata) : msg.metadata;
                    if (meta.type === 'SCHEDULE_MODIFIED' || meta.type === 'TASK_CREATED' || meta.type === 'FIXED_SCHEDULE_CREATED') {
                      return (
                        <div className="flex items-center space-x-1.5 mt-2 pt-1.5 border-t border-emerald-100 text-[10px] font-bold text-emerald-700">
                          <Check className="w-3.5 h-3.5" />
                          <span>Đã tự động đưa vào Thời Khóa Biểu</span>
                        </div>
                      );
                    }
                    if (meta.type === 'REPLAN' || meta.type === 'WHAT_IF' || meta.type === 'PANIC_MODE') {
                      return (
                        <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => onSendMessage('Chấp nhận kế hoạch này')}
                            className="px-2.5 py-1 rounded-lg bg-[#1b4d3e] text-white text-[10px] font-bold hover:bg-[#143e31] transition"
                          >
                            Chấp nhận
                          </button>
                          <button
                            onClick={() => onSendMessage('Giữ nguyên lịch cũ')}
                            className="px-2.5 py-1 rounded-lg bg-[#f4f8f5] text-[#335645] border border-[#d6e7db] text-[10px] font-bold hover:bg-[#e8f1ea] transition"
                          >
                            Hoàn tác
                          </button>
                        </div>
                      );
                    }
                  } catch (e) {}
                  return null;
                })()}

                <div className="text-[9px] text-right mt-1 text-slate-400">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center space-x-2 text-[#46745e] text-xs italic py-1">
            <Sparkles className="w-4 h-4 animate-spin text-[#1b7a53]" />
            <span>AI đang phân tích & xếp lại lịch...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Quick Prompts Section (Gợi ý nhanh) */}
      <div className="px-4 py-3 border-t border-[#eaf2ec] bg-[#f9fcfa] space-y-2">
        <h4 className="font-extrabold text-xs text-[#1f4233] mb-1">Gợi ý nhanh:</h4>

        <div 
          onClick={() => handleQuickPrompt('Việc nào gấp nhất hôm nay?')}
          className="p-2.5 rounded-xl bg-white border border-[#e2ede5] flex items-center justify-between cursor-pointer hover:bg-[#f2f8f4] transition shadow-2xs"
        >
          <div className="flex items-center space-x-2 text-xs font-bold text-[#2a5542]">
            <Clock className="w-3.5 h-3.5 text-[#1b7a53]" />
            <span>Việc nào gấp nhất?</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-[#7a998b]" />
        </div>

        <div 
          onClick={() => handleQuickPrompt('Tuần này rảnh khi nào?')}
          className="p-2.5 rounded-xl bg-white border border-[#e2ede5] flex items-center justify-between cursor-pointer hover:bg-[#f2f8f4] transition shadow-2xs"
        >
          <div className="flex items-center space-x-2 text-xs font-bold text-[#2a5542]">
            <Calendar className="w-3.5 h-3.5 text-[#1b7a53]" />
            <span>Tuần này rảnh khi nào?</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-[#7a998b]" />
        </div>

        <div 
          onClick={() => handleQuickPrompt('Kiểm tra workload tuần này')}
          className="p-2.5 rounded-xl bg-white border border-[#e2ede5] flex items-center justify-between cursor-pointer hover:bg-[#f2f8f4] transition shadow-2xs"
        >
          <div className="flex items-center space-x-2 text-xs font-bold text-[#2a5542]">
            <BarChart3 className="w-3.5 h-3.5 text-[#1b7a53]" />
            <span>Kiểm tra workload tuần này</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-[#7a998b]" />
        </div>
      </div>

      {/* 4. Bottom Input Bar */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-[#e9f2eb] bg-white">
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          accept="image/*,.pdf" 
          className="hidden" 
        />

        <div className="flex items-center bg-[#f4f9f5] border border-[#daebd0] rounded-2xl px-3 py-1.5 focus-within:border-[#1b7a53] focus-within:bg-white transition">
          {/* Image/PDF upload icon */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-1 text-[#6c8e7e] hover:text-[#1b4d3e] transition mr-1"
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
            className="flex-1 bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none py-1.5"
          />

          {/* Voice Input Mic Button */}
          <button
            type="button"
            onClick={handleVoiceInput}
            className={`p-1.5 rounded-full transition ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'text-[#6c8e7e] hover:text-[#1b4d3e]'}`}
            title="Nói để nhập giọng nói"
          >
            <Mic className="w-4 h-4" />
          </button>

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-8 h-8 rounded-full bg-[#1b4d3e] hover:bg-[#153e32] disabled:opacity-40 text-white flex items-center justify-center ml-1.5 shadow-xs transition shrink-0 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>
      </form>
    </aside>
  );
}
