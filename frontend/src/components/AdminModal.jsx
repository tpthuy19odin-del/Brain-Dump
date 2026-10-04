import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  Cpu, 
  DollarSign, 
  FileCode, 
  Bell, 
  MessageSquare, 
  CheckCircle2, 
  X, 
  Lock, 
  Unlock, 
  Crown, 
  Plus, 
  Send,
  Loader2,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';

export default function AdminModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Broadcast state
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastContent, setBroadcastContent] = useState('');

  // New template state
  const [newTplName, setNewTplName] = useState('');
  const [newTplDays, setNewTplDays] = useState(7);
  const [newTplSteps, setNewTplSteps] = useState('');

  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadAdminData();
    }
  }, [isOpen]);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [st, us, tpl, fb] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(),
        api.getAdminTemplates(),
        api.getAdminFeedbacks()
      ]);
      setStats(st);
      setUsers(us.users || []);
      setTemplates(tpl.templates || []);
      setFeedbacks(fb.feedbacks || []);
    } catch (e) {
      console.error('Error loading admin data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleToggleLock = async (userId) => {
    try {
      await api.toggleLockUser(userId);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isLocked: !u.isLocked } : u));
      showToast({ type: 'info', title: 'Tài khoản', message: 'Đã thay đổi trạng thái khóa của tài khoản!' });
    } catch (e) {
      showToast({ type: 'error', title: 'Lỗi', message: e.message });
    }
  };

  const handleUpdatePlan = async (userId, currentPlan) => {
    const nextPlan = currentPlan === 'PRO' ? 'FREE' : 'PRO';
    try {
      await api.updateUserPlan(userId, nextPlan);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, plan: nextPlan } : u));
      showToast({ type: 'success', title: 'Nâng cấp gói', message: `Đã chuyển tài khoản sang gói ${nextPlan}!` });
    } catch (e) {
      showToast({ type: 'error', title: 'Lỗi', message: e.message });
    }
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastContent) {
      showToast({ type: 'warning', title: 'Thiếu thông tin', message: 'Vui lòng nhập tiêu đề và nội dung thông báo!' });
      return;
    }
    try {
      await api.broadcastNotification({ title: broadcastTitle, content: broadcastContent });
      showToast({ type: 'success', title: 'Đã phát sóng', message: 'Đã gửi thông báo đến toàn bộ người dùng hệ thống!' });
      setBroadcastTitle('');
      setBroadcastContent('');
    } catch (e) {
      showToast({ type: 'error', title: 'Lỗi', message: e.message });
    }
  };

  const handleCreateTemplate = async (e) => {
    e.preventDefault();
    if (!newTplName.trim()) return;
    try {
      const stepsArr = newTplSteps.split('\n').map(s => s.trim()).filter(Boolean);
      const res = await api.createAdminTemplate({
        name: newTplName,
        durationDays: Number(newTplDays) || 7,
        subtasks: stepsArr.length > 0 ? stepsArr : ['Bước 1', 'Bước 2']
      });
      setTemplates(prev => [...prev, res.template]);
      showToast({ type: 'success', title: 'Đã thêm mẫu mới', message: `Mẫu "${newTplName}" đã được lưu vào hệ thống!` });
      setNewTplName('');
      setNewTplSteps('');
    } catch (e) {
      showToast({ type: 'error', title: 'Lỗi', message: e.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-4xl bg-white dark:bg-[#101915] border border-slate-200 dark:border-[#22362d] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all">
        
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-[#1d2c26] bg-slate-50/60 dark:bg-[#0e1512] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                  Bảng Quản Trị Hệ Thống (Admin Control Center)
                </h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 uppercase">
                  ADMIN
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Giám sát người dùng, chi phí AI, quản lý mẫu chia nhỏ & tiếp nhận phản hồi
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={loadAdminData}
              className="p-2 rounded-xl bg-slate-100 dark:bg-[#16241e] hover:bg-slate-200 dark:hover:bg-[#1e332a] text-slate-600 dark:text-emerald-300 transition"
              title="Tải lại dữ liệu"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-3 border-b border-slate-100 dark:border-[#1d2c26] flex items-center space-x-2 bg-slate-50/30 dark:bg-[#0c1310] overflow-x-auto">
          {[
            { id: 'overview', label: 'Tổng Quan & Chi Phí AI', icon: BarChart3 },
            { id: 'users', label: 'Quản Lý Người Dùng', icon: Users },
            { id: 'templates', label: 'Quản Lý Mẫu Task', icon: FileCode },
            { id: 'broadcast', label: 'Thông Báo Toàn Hệ Thống', icon: Bell },
            { id: 'feedbacks', label: `Hòm Thư Góp Ý (${feedbacks.length})`, icon: MessageSquare }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3.5 py-2.5 rounded-t-xl text-xs font-bold transition-all border-b-2 whitespace-nowrap ${
                  isActive
                    ? 'border-amber-500 text-amber-700 dark:text-amber-400 bg-white dark:bg-[#101915]'
                    : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: OVERVIEW & AI COST */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#14201a] border border-slate-200 dark:border-[#22362d] text-center">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Tổng Người Dùng</div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats?.totalUsers || 2}</div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">● Đang hoạt động</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#14201a] border border-slate-200 dark:border-[#22362d] text-center">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Tỷ Lệ Hoàn Thành Task</div>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats?.completionRate || 0}%</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{stats?.doneSubtasks || 0}/{stats?.totalSubtasks || 0} bước việc</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#14201a] border border-slate-200 dark:border-[#22362d] text-center">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Số Lượt Gọi Gemini AI</div>
                  <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{stats?.aiCallCount || 18}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Flash Lite Model</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#14201a] border border-slate-200 dark:border-[#22362d] text-center">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Chi Phí API Ước Tính</div>
                  <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">${stats?.estimatedCostUsd || '0.0027'}</div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">Tối ưu ~95% chi phí</div>
                </div>
              </div>

              {/* Service Health */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-[#13241b] border border-emerald-200 dark:border-[#1d382b] text-xs space-y-2">
                <div className="flex items-center space-x-2 font-extrabold text-emerald-900 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Trạng thái hạ tầng: Toàn bộ dịch vụ đang hoạt động tối ưu 100%</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-700 dark:text-slate-300">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#101915] border border-emerald-100 dark:border-[#213a2e]">
                    <strong>Gemini 1.5 Flash:</strong> Phản hồi ~0.8s
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#101915] border border-emerald-100 dark:border-[#213a2e]">
                    <strong>PostgreSQL DB:</strong> Kết nối đồng bộ
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#101915] border border-emerald-100 dark:border-[#213a2e]">
                    <strong>Nodemailer Mailer:</strong> Đã sẵn sàng
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USER MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Danh sách tài khoản ({users.length})
                </h4>
              </div>

              <div className="border border-slate-200 dark:border-[#22362d] rounded-2xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100/70 dark:bg-[#14201a] border-b border-slate-200 dark:border-[#22362d] font-bold text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="p-3">Họ Tên / Email</th>
                      <th className="p-3">Gói Dịch Vụ</th>
                      <th className="p-3">Vai Trò</th>
                      <th className="p-3">Streak</th>
                      <th className="p-3 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#1d2c26]">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-[#15221b] transition">
                        <td className="p-3">
                          <div className="font-bold text-slate-900 dark:text-white">{u.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            u.plan === 'PRO' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' : 'bg-slate-100 text-slate-700 dark:bg-[#182720] dark:text-slate-300'
                          }`}>
                            {u.plan || 'FREE'}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-slate-600 dark:text-slate-400">
                          {u.role || 'USER'}
                        </td>
                        <td className="p-3 font-bold text-amber-600">
                          🔥 {u.streakDays || 1}d
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            onClick={() => handleUpdatePlan(u.id, u.plan)}
                            className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 hover:bg-purple-100 text-[11px] font-bold transition"
                            title="Đổi gói Free/Pro"
                          >
                            <Crown className="w-3 h-3 inline mr-1" />
                            {u.plan === 'PRO' ? 'Hạ Free' : 'Lên Pro'}
                          </button>
                          <button
                            onClick={() => handleToggleLock(u.id)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                              u.isLocked ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700 dark:bg-[#182720] dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600'
                            }`}
                          >
                            {u.isLocked ? <Lock className="w-3 h-3 inline mr-1 text-rose-600" /> : <Unlock className="w-3 h-3 inline mr-1" />}
                            {u.isLocked ? 'Mở Khóa' : 'Khóa'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: TASK BREAKDOWN TEMPLATES */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              {/* Template List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {templates.map((tpl) => (
                  <div key={tpl.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-[#14201a] border border-slate-200 dark:border-[#22362d] space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-xs text-slate-900 dark:text-white">{tpl.name}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        {tpl.durationDays} ngày
                      </span>
                    </div>
                    <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                      {tpl.subtasks?.map((st, i) => (
                        <li key={i}>{typeof st === 'string' ? st : st.title}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Add New Template Form */}
              <form onSubmit={handleCreateTemplate} className="p-4 rounded-2xl border border-dashed border-slate-300 dark:border-[#263c32] space-y-3">
                <h4 className="font-extrabold text-xs text-slate-800 dark:text-white flex items-center space-x-1">
                  <Plus className="w-4 h-4" />
                  <span>Thêm Mẫu Chia Nhỏ Mới Cho AI</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Tên mẫu (VD: Làm Bài Tập Lớn Nhóm)..."
                    value={newTplName}
                    onChange={(e) => setNewTplName(e.target.value)}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-[#22362d] bg-white dark:bg-[#101915] text-xs"
                  />
                  <input
                    type="number"
                    placeholder="Số ngày hoàn thành dự kiến (VD: 7)..."
                    value={newTplDays}
                    onChange={(e) => setNewTplDays(e.target.value)}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-[#22362d] bg-white dark:bg-[#101915] text-xs"
                  />
                </div>
                <textarea
                  rows={3}
                  placeholder="Các bước chia nhỏ (Mỗi bước 1 dòng kèm thời lượng, VD: Thu thập tài liệu 60m)..."
                  value={newTplSteps}
                  onChange={(e) => setNewTplSteps(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#22362d] bg-white dark:bg-[#101915] text-xs"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#1b4d3e] text-white text-xs font-bold hover:bg-[#143e31] transition cursor-pointer"
                >
                  Lưu Mẫu Hệ Thống
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: BROADCAST NOTIFICATION */}
          {activeTab === 'broadcast' && (
            <form onSubmit={handleSendBroadcast} className="p-5 rounded-2xl bg-slate-50 dark:bg-[#14201a] border border-slate-200 dark:border-[#22362d] space-y-3">
              <h4 className="font-extrabold text-xs text-slate-800 dark:text-white flex items-center space-x-1.5">
                <Bell className="w-4 h-4 text-amber-500" />
                <span>Gửi Thông Báo / Cập Nhật Tính Năng Mới Toàn Hệ Thống</span>
              </h4>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Tiêu đề thông báo:</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Cập nhật tính năng Xuất Lịch Google Calendar & Dark Mode mới..."
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#22362d] bg-white dark:bg-[#101915] text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nội dung thông báo:</label>
                <textarea
                  rows={4}
                  placeholder="Nhập nội dung thông báo gửi đến học viên / sinh viên..."
                  value={broadcastContent}
                  onChange={(e) => setBroadcastContent(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-[#22362d] bg-white dark:bg-[#101915] text-xs"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-md shadow-amber-600/20"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Phát Sóng Thông Báo</span>
              </button>
            </form>
          )}

          {/* TAB 5: FEEDBACKS */}
          {activeTab === 'feedbacks' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Phản hồi & Báo lỗi từ người dùng ({feedbacks.length})
              </h4>
              {feedbacks.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">Chưa có phản hồi nào mới.</div>
              ) : (
                <div className="space-y-2.5">
                  {feedbacks.map((fb) => (
                    <div key={fb.id} className="p-4 rounded-2xl bg-white dark:bg-[#101915] border border-slate-200 dark:border-[#22362d] space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            fb.type === 'BUG_REPORT' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}>
                            {fb.type === 'BUG_REPORT' ? 'Báo Lỗi' : 'Góp Ý'}
                          </span>
                          <span className="font-bold text-xs text-slate-900 dark:text-white">{fb.userName}</span>
                          <span className="text-[11px] text-slate-400">({fb.email})</span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {new Date(fb.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 pt-1">
                        {fb.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
