import React, { useState } from 'react';
import { X, Sparkles, Mail, Lock, User, ArrowRight, LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';
import { api } from '../api/client';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'register') {
        if (!name.trim()) throw new Error('Vui lòng nhập họ tên của bạn');
        const data = await api.register(name.trim(), email.trim(), password);
        onAuthSuccess(data.user, data.token);
      } else {
        const data = await api.login(email.trim(), password);
        onAuthSuccess(data.user, data.token);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Đã có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 relative border border-[#e1ece4] shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#1b4d3e] text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-[#1b4d3e]/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-black text-[#1b3d2f]">
            {mode === 'login' ? 'Đăng nhập Brain Dump' : 'Đăng ký tài khoản'}
          </h3>
          <p className="text-xs text-[#527363] mt-1 font-medium">
            AI Planner đồng hành cùng lịch học của bạn
          </p>
        </div>

        {/* Mode Switch Tabs */}
        <div className="flex bg-[#f3f8f4] p-1 rounded-2xl mb-5 border border-[#e2efe5]">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
              mode === 'login'
                ? 'bg-white text-[#1b4d3e] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Đăng Nhập
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
              mode === 'register'
                ? 'bg-white text-[#1b4d3e] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Đăng Ký Mới
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-[#234b38] mb-1">Họ và tên</label>
              <div className="flex items-center bg-[#f8faf8] border border-slate-300 rounded-xl px-3 py-2 focus-within:border-[#1b7a53] focus-within:bg-white transition">
                <User className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Linh Trần"
                  required
                  className="w-full bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#234b38] mb-1">Email</label>
            <div className="flex items-center bg-[#f8faf8] border border-slate-300 rounded-xl px-3 py-2 focus-within:border-[#1b7a53] focus-within:bg-white transition">
              <Mail className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="linh@student.edu.vn"
                required
                className="w-full bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#234b38] mb-1">Mật khẩu</label>
            <div className="flex items-center bg-[#f8faf8] border border-slate-300 rounded-xl px-3 py-2 focus-within:border-[#1b7a53] focus-within:bg-white transition">
              <Lock className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-slate-400 hover:text-[#1b4d3e] transition cursor-pointer"
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 rounded-xl bg-[#1b4d3e] hover:bg-[#153e32] disabled:opacity-50 text-white font-extrabold text-xs shadow-md shadow-[#1b4d3e]/25 flex items-center justify-center space-x-2 transition cursor-pointer"
          >
            {isLoading ? (
              <span>Đang xử lý...</span>
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Đăng Nhập</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Tạo Tài Khoản Mới</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Account Hint */}
        <div className="mt-4 p-2.5 rounded-xl bg-[#f0f8f3] border border-[#d6ebdc] text-[11px] text-[#2d5f47] text-center font-medium">
          Tài khoản dùng thử có sẵn: <strong>linh@student.edu.vn</strong> / Mật khẩu: <strong>123</strong>
        </div>
      </div>
    </div>
  );
}
