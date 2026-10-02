import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Mic, 
  Image as ImageIcon, 
  Trash2, 
  Bot, 
  User, 
  ArrowRight,
  Layers,
  Calendar,
  Zap,
  HelpCircle,
  Clock
} from 'lucide-react';

export default function ChatSidebar({ 
  messages, 
  onSendMessage, 
  onClearHistory, 
  isLoading 
}) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const quickPrompts = [
    { label: '📝 Đổ task Marketing', text: 'Tuần sau nộp tiểu luận Marketing Căn bản, cần làm bài tập lớn 4 chương' },
    { label: '🚨 Bận tối thứ 4', text: 'Tối thứ 4 tuần này mình bận họp CLB, hãy dời lịch học sang ngày khác' },
    { label: '⚡ Kích hoạt Panic Mode', text: 'Sát hạn nộp bài rồi, kích hoạt Panic Mode giúp mình với!' },
    { label: '📊 Thử What-If 10h/tuần', text: 'Nếu mình nhận thêm việc làm thêm 10 tiếng mỗi tuần thì lịch có bị quá tải không?' },
    { label: '💡 Tóm tắt hôm nay', text: 'Hôm nay mình cần làm những việc gì và khung giờ nào rảnh?' }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleQuickClick = (text) => {
    setInput(text);
    inputRef.current?.focus();
  };

  return (
    <aside className="w-full md:w-[320px] lg:w-[340px] xl:w-[360px] h-full flex flex-col border-l border-slate-200 bg-white shadow-sm shrink-0">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Brain Dump Assistant</h2>
            <p className="text-[11px] text-slate-500">Gõ tự do mọi việc, AI tự chia & xếp lịch</p>
          </div>
        </div>

        <button
          onClick={onClearHistory}
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
          title="Xóa lịch sử chat"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Quick Prompts Carousel */}
      <div className="px-3 py-2 border-b border-slate-100 bg-emerald-50/30 overflow-x-auto flex space-x-1.5 scrollbar-none">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleQuickClick(qp.text)}
            className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium bg-white hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 transition whitespace-nowrap shadow-2xs"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#fafcfb]">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-2.5 ${isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  isUser
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white text-emerald-600 border border-emerald-200 shadow-xs'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  isUser
                    ? 'bg-emerald-600 text-white rounded-tr-none shadow-md shadow-emerald-600/15'
                    : 'bg-white text-slate-800 rounded-tl-none border border-slate-200/90 shadow-xs'
                }`}
              >
                <div className="whitespace-pre-line">{msg.content}</div>
                <div className={`text-[9px] text-right mt-1 ${isUser ? 'text-emerald-100' : 'text-slate-400'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center space-x-2 text-slate-500 text-xs italic py-2">
            <Sparkles className="w-4 h-4 animate-spin text-emerald-600" />
            <span>AI đang phân tích câu lệnh & xếp lịch...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-200 bg-white">
        <div className="relative rounded-xl bg-slate-50 border border-slate-300 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/10 transition shadow-inner">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Đổ hết việc vào đây (VD: Thứ 6 nộp bài tập Toán, CN thi Triết)..."
            className="w-full bg-transparent px-3.5 pt-2.5 pb-9 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none min-h-[64px]"
            rows={2}
          />

          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
            <div className="flex items-center space-x-1 text-slate-500">
              <button
                type="button"
                onClick={() => handleQuickClick('Nhập lịch học từ ảnh thời khóa biểu')}
                className="p-1.5 rounded-lg hover:text-emerald-700 hover:bg-emerald-50 transition"
                title="Tải ảnh thời khóa biểu / Đề bài"
              >
                <ImageIcon className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleQuickClick('Ghi âm giọng nói: Mai phải nộp bài báo cáo thực tập')}
                className="p-1.5 rounded-lg hover:text-emerald-700 hover:bg-emerald-50 transition"
                title="Nhập bằng giọng nói"
              >
                <Mic className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white text-xs font-semibold flex items-center space-x-1 shadow-md shadow-emerald-600/20 transition"
            >
              <span>Gửi</span>
              <Send className="w-3 h-3" />
            </button>
          </div>
        </div>
      </form>
    </aside>
  );
}
