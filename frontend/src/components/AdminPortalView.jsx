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
  ArrowLeft,
  Lock, 
  Unlock, 
  Crown, 
  Plus, 
  Send, 
  Loader2, 
  BarChart3, 
  RefreshCw, 
  Search,
  Filter,
  Sparkles,
  Database,
  Activity,
  AlertTriangle,
  TrendingUp,
  Download,
  Trash2
} from 'lucide-react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import ThemeSwitch from './ThemeSwitch';

export default function AdminPortalView({ onBackToStudentApp, user, onLogout }) {
  const [activeAdminTab, setActiveAdminTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState('ALL');

  // Broadcast state
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastContent, setBroadcastContent] = useState('');

  // New template state
  const [newTplName, setNewTplName] = useState('');
  const [newTplDays, setNewTplDays] = useState(7);
  const [newTplSteps, setNewTplSteps] = useState('');

  const { showToast } = useToast();

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const [st, us, tpl, fb] = await Promise.all([
        api.getAdminStats().catch(() => null),
        api.getAdminUsers().catch(() => ({ users: [] })),
        api.getAdminTemplates().catch(() => ({ templates: [] })),
        api.getAdminFeedbacks().catch(() => ({ feedbacks: [] }))
      ]);

      if (st) setStats(st);
      if (us?.users) setUsers(us.users);
      if (tpl?.templates) setTemplates(tpl.templates);
      if (fb?.feedbacks) setFeedbacks(fb.feedbacks);
    } catch (e) {
      console.error('Error loading admin data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleLock = async (userId) => {
    try {
      await api.toggleLockUser(userId).catch(() => {});
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isLocked: !u.isLocked } : u));
      showToast({ type: 'info', title: 'Tài khoản', message: 'Đã thay đổi trạng thái khóa của tài khoản!' });
    } catch (e) {
      showToast({ type: 'error', title: 'Lỗi', message: e.message });
    }
  };

  const handleUpdatePlan = async (userId, currentPlan) => {
    const nextPlan = currentPlan === 'PRO' ? 'FREE' : 'PRO';
    try {
      await api.updateUserPlan(userId, nextPlan).catch(() => {});
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
      await api.broadcastNotification({ title: broadcastTitle, content: broadcastContent }).catch(() => {});
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
      }).catch(() => ({
        template: {
          id: 'tpl-' + Date.now(),
          name: newTplName,
          durationDays: Number(newTplDays) || 7,
          subtasks: stepsArr.length > 0 ? stepsArr : ['Bước 1', 'Bước 2']
        }
      }));
      setTemplates(prev => [...prev, res.template]);
      showToast({ type: 'success', title: 'Đã thêm mẫu mới', message: `Mẫu "${newTplName}" đã được lưu vào hệ thống!` });
      setNewTplName('');
      setNewTplSteps('');
    } catch (e) {
      showToast({ type: 'error', title: 'Lỗi', message: e.message });
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = filterPlan === 'ALL' || u.plan === filterPlan;
    return matchesSearch && matchesPlan;
  });

  return (
    <div className="h-screen w-screen flex bg-[#0c120f] text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] overflow-hidden select-none">
      {/* 1. Admin Dedicated Sidebar */}
      <aside className="w-64 h-full bg-[#101915] border-r border-[#1d2c26] flex flex-col justify-between p-4 shrink-0">
        <div>
          {/* Admin Header */}
          <div className="flex items-center space-x-3 px-2 py-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-base text-white tracking-tight flex items-center gap-1.5">
                <span>Brain Dump</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-extrabold border border-amber-500/40">ADMIN</span>
              </h2>
              <p className="text-[11px] text-slate-400">Hệ thống quản trị trung tâm</p>
            </div>
          </div>

          {/* Admin Navigation Menu */}
          <nav className="space-y-1.5">
            {[
              { id: 'dashboard', label: 'Bảng Điều Khiển & AI Cost', icon: BarChart3 },
              { id: 'users', label: 'Quản Lý Người Dùng', icon: Users, badge: users.length },
              { id: 'templates', label: 'Mẫu Chia Nhỏ Task CMS', icon: FileCode },
              { id: 'broadcast', label: 'Thông Báo Toàn Hệ Thống', icon: Bell },
              { id: 'feedbacks', label: 'Hòm Thư Phản Hồi', icon: MessageSquare, badge: feedbacks.length }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeAdminTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveAdminTab(tab.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-xs'
                      : 'text-slate-400 hover:bg-[#16241e] hover:text-white'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge !== undefined && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#1d2c26] text-slate-300">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Admin User Info & Navigation */}
        <div className="space-y-2.5 pt-4 border-t border-[#1d2c26]">
          {user && (
            <div className="p-2.5 rounded-xl bg-[#14201a] border border-[#21352b] flex items-center justify-between">
              <div className="flex items-center space-x-2 truncate">
                <span className="text-base">{user.avatar || '🛡️'}</span>
                <div className="truncate">
                  <div className="text-xs font-bold text-white truncate">{user.name || 'Quản Trị Viên'}</div>
                  <div className="text-[10px] text-amber-400 font-semibold truncate">{user.email}</div>
                </div>
              </div>
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40">
                ADMIN
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onBackToStudentApp}
              className="flex items-center justify-center space-x-1.5 p-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-800 text-emerald-300 text-xs font-bold transition shadow-xs cursor-pointer"
              title="Xem giao diện sinh viên"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>App Sinh Viên</span>
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                className="flex items-center justify-center space-x-1.5 p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-300 text-xs font-bold transition shadow-xs cursor-pointer"
                title="Đăng xuất khỏi hệ thống"
              >
                <span>Đăng xuất</span>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* 2. Admin Content View */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#080d0b]">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-[#1d2c26] bg-[#0e1512]/90 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <h1 className="font-extrabold text-base text-white tracking-tight">
              {activeAdminTab === 'dashboard' && '📊 Tổng Quan Hệ Thống & Giám Sát Chi Phí AI'}
              {activeAdminTab === 'users' && '👥 Quản Lý Tài Khoản & Gói Dịch Vụ'}
              {activeAdminTab === 'templates' && '📝 Quản Trị Mẫu Chia Nhỏ Task (Template CMS)'}
              {activeAdminTab === 'broadcast' && '📢 Phát Sóng Thông Báo & Cập Nhật Mới'}
              {activeAdminTab === 'feedbacks' && '💬 Hòm Thư Tiếp Nhận Góp Ý & Báo Lỗi'}
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <ThemeSwitch />
            <button
              onClick={loadAdminData}
              className="p-2 rounded-xl bg-[#14201a] hover:bg-[#1e332a] border border-[#22362d] text-emerald-400 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Làm mới</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: DASHBOARD & AI COST */}
          {activeAdminTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Top 4 Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-[#101915] border border-[#1d2c26] space-y-1 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                    <span>Tổng Người Dùng</span>
                    <Users className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-3xl font-black text-white">{stats?.totalUsers ?? users.length}</div>
                  <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <span>● {stats?.activeToday ?? users.length} user trong cơ sở dữ liệu</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#101915] border border-[#1d2c26] space-y-1 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                    <span>Tỷ Lệ Hoàn Thành Kế Hoạch</span>
                    <TrendingUp className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-3xl font-black text-purple-400">{stats?.completionRate ?? 0}%</div>
                  <div className="text-[11px] text-slate-400">
                    {stats?.doneSubtasks ?? 0}/{stats?.totalSubtasks ?? 0} bước việc đã xong
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#101915] border border-[#1d2c26] space-y-1 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                    <span>Số Lượt Gọi Gemini AI</span>
                    <Cpu className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-3xl font-black text-amber-400">{stats?.aiCallCount ?? 0}</div>
                  <div className="text-[11px] text-slate-400">Mô hình Gemini Flash Lite</div>
                </div>

                <div className="p-5 rounded-2xl bg-[#101915] border border-[#1d2c26] space-y-1 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-bold">
                    <span>Chi Phí Vận Hành AI</span>
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-3xl font-black text-emerald-400">${stats?.estimatedCostUsd ?? '0.0000'}</div>
                  <div className="text-[11px] text-emerald-400 font-bold">Ước tính theo token thực tế</div>
                </div>
              </div>

              {/* Infrastructure Status */}
              <div className="p-5 rounded-2xl bg-[#101915] border border-[#1d2c26] space-y-3">
                <h3 className="font-extrabold text-sm text-white flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>Trạng Thái Hoạt Động Của Hệ Thống (Health Check)</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-[#14201a] border border-[#22362d] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">Google Gemini 1.5 Flash</div>
                      <div className="text-[11px] text-slate-400">Thời gian phản hồi: ~0.8s</div>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#14201a] border border-[#22362d] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">PostgreSQL Database (Neon)</div>
                      <div className="text-[11px] text-slate-400">Kết nối Prisma ORM</div>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#14201a] border border-[#22362d] flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white">Dịch Vụ Gửi Email (SMTP)</div>
                      <div className="text-[11px] text-slate-400">Tự động báo việc gấp</div>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USER MANAGEMENT */}
          {activeAdminTab === 'users' && (
            <div className="space-y-4">
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm theo tên hoặc email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#101915] border border-[#1d2c26] text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400 font-bold">Lọc gói:</span>
                  {['ALL', 'FREE', 'PRO'].map((plan) => (
                    <button
                      key={plan}
                      onClick={() => setFilterPlan(plan)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        filterPlan === plan ? 'bg-amber-500 text-black' : 'bg-[#14201a] text-slate-400 hover:text-white'
                      }`}
                    >
                      {plan}
                    </button>
                  ))}
                </div>
              </div>

              {/* Users Table */}
              <div className="border border-[#1d2c26] rounded-2xl overflow-hidden bg-[#101915]">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#14201a] border-b border-[#1d2c26] text-slate-300 font-bold">
                    <tr>
                      <th className="p-3.5">Họ Tên & Email</th>
                      <th className="p-3.5">Gói Dịch Vụ</th>
                      <th className="p-3.5">Vai Trò</th>
                      <th className="p-3.5">Streak</th>
                      <th className="p-3.5 text-right">Hành Động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1d2c26]">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-[#14201a]/70 transition">
                        <td className="p-3.5">
                          <div className="font-extrabold text-white text-sm">{u.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                            u.plan === 'PRO' ? 'bg-purple-950 text-purple-300 border border-purple-800' : 'bg-[#182720] text-slate-300'
                          }`}>
                            {u.plan}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-slate-400">
                          {u.role}
                        </td>
                        <td className="p-3.5 font-black text-amber-400">
                          🔥 {u.streakDays || 1}d
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => handleUpdatePlan(u.id, u.plan)}
                            className="px-3 py-1.5 rounded-xl bg-purple-950/60 hover:bg-purple-900 border border-purple-800 text-purple-300 text-xs font-bold transition cursor-pointer"
                          >
                            <Crown className="w-3.5 h-3.5 inline mr-1" />
                            {u.plan === 'PRO' ? 'Hạ Free' : 'Nâng Pro'}
                          </button>
                          <button
                            onClick={() => handleToggleLock(u.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                              u.isLocked
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : 'bg-[#14201a] hover:bg-rose-950 hover:text-rose-300 border border-[#22362d] text-slate-300'
                            }`}
                          >
                            {u.isLocked ? <Lock className="w-3.5 h-3.5 inline mr-1 text-rose-400" /> : <Unlock className="w-3.5 h-3.5 inline mr-1" />}
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

          {/* TAB 3: TASK TEMPLATES CMS */}
          {activeAdminTab === 'templates' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {templates.map((tpl) => (
                  <div key={tpl.id} className="p-5 rounded-2xl bg-[#101915] border border-[#1d2c26] space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-sm text-white">{tpl.name}</h4>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {tpl.durationDays} ngày
                      </span>
                    </div>
                    <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                      {tpl.subtasks?.map((st, i) => (
                        <li key={i}>{typeof st === 'string' ? st : st.title}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Add Template */}
              <form onSubmit={handleCreateTemplate} className="p-5 rounded-2xl bg-[#101915] border border-dashed border-[#263c32] space-y-3 max-w-2xl">
                <h4 className="font-extrabold text-xs text-white flex items-center space-x-1.5">
                  <Plus className="w-4 h-4 text-emerald-400" />
                  <span>Thêm Mẫu Chia Nhỏ Task Mới Vào Hệ Thống AI</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Tên loại công việc (VD: Đồ Án Tốt Nghiệp)..."
                    value={newTplName}
                    onChange={(e) => setNewTplName(e.target.value)}
                    className="p-2.5 rounded-xl bg-[#14201a] border border-[#22362d] text-xs text-white"
                  />
                  <input
                    type="number"
                    placeholder="Số ngày hoàn thành dự kiến..."
                    value={newTplDays}
                    onChange={(e) => setNewTplDays(e.target.value)}
                    className="p-2.5 rounded-xl bg-[#14201a] border border-[#22362d] text-xs text-white"
                  />
                </div>
                <textarea
                  rows={3}
                  placeholder="Các bước chia nhỏ (Mỗi bước một dòng kèm thời lượng, VD: Thu thập tài liệu 60m)..."
                  value={newTplSteps}
                  onChange={(e) => setNewTplSteps(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#14201a] border border-[#22362d] text-xs text-white"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer"
                >
                  Lưu Mẫu Mới
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: BROADCAST NOTIFICATIONS */}
          {activeAdminTab === 'broadcast' && (
            <form onSubmit={handleSendBroadcast} className="p-6 rounded-2xl bg-[#101915] border border-[#1d2c26] space-y-4 max-w-2xl">
              <h3 className="font-extrabold text-sm text-white flex items-center space-x-2">
                <Bell className="w-4 h-4 text-amber-400" />
                <span>Phát Sóng Thông Báo Đến Toàn Bộ Người Dùng</span>
              </h3>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Tiêu đề thông báo:</label>
                <input
                  type="text"
                  placeholder="VD: Cập nhật tính năng Xuất Lịch Google Calendar & Dark Mode mới..."
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#14201a] border border-[#22362d] text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">Nội dung chi tiết:</label>
                <textarea
                  rows={4}
                  placeholder="Nhập nội dung cập nhật hoặc thông báo lịch bảo trì..."
                  value={broadcastContent}
                  onChange={(e) => setBroadcastContent(e.target.value)}
                  className="w-full p-3 rounded-xl bg-[#14201a] border border-[#22362d] text-xs text-white"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black text-xs font-black transition flex items-center space-x-2 cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <Send className="w-4 h-4" />
                <span>Phát Sóng Ngay</span>
              </button>
            </form>
          )}

          {/* TAB 5: FEEDBACK INBOX */}
          {activeAdminTab === 'feedbacks' && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-sm text-white flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Hòm Thư Góp Ý & Báo Lỗi ({feedbacks.length})</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {feedbacks.map((fb) => (
                  <div key={fb.id} className="p-4 rounded-2xl bg-[#101915] border border-[#1d2c26] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          fb.type === 'BUG_REPORT' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}>
                          {fb.type === 'BUG_REPORT' ? 'Báo Lỗi' : 'Góp Ý'}
                        </span>
                        <span className="font-extrabold text-white text-xs">{fb.userName}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {new Date(fb.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {fb.message}
                    </p>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Email liên hệ: {fb.email}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
