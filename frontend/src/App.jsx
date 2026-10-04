import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, ChevronLeft } from 'lucide-react';
import { api } from './api/client';
import { useToast } from './context/ToastContext';
import Sidebar from './components/Sidebar';
import DashboardCenter from './components/DashboardCenter';
import CalendarView from './components/CalendarView';
import TasksView from './components/TasksView';
import FocusView from './components/FocusView';
import ProgressView from './components/ProgressView';
import ReportsView from './components/ReportsView';
import AIAssistantSidebar from './components/AIAssistantSidebar';
import AuthModal from './components/AuthModal';
import PomodoroModal from './components/PomodoroModal';
import StatsModal from './components/StatsModal';
import SettingsModal from './components/SettingsModal';
import OnboardingModal from './components/OnboardingModal';
import WhatIfModal from './components/WhatIfModal';
import FeedbackModal from './components/FeedbackModal';
import AdminPortalView from './components/AdminPortalView';
import UpgradeModal from './components/UpgradeModal';

export default function App() {
  const { showToast } = useToast();
  const [currentPortal, setCurrentPortal] = useState('student'); // 'student' | 'admin'
  const [activeNav, setActiveNav] = useState('home');
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showWhatIf, setShowWhatIf] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('brain_dump_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        if (u && !u.plan) {
          u.plan = u.role === 'ADMIN' || u.email?.toLowerCase()?.includes('admin') ? 'PRO' : 'FREE';
        }
        return u;
      } catch (e) {
        return null;
      }
    }
    return null; // Guest state
  });
  
  const [messages, setMessages] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [subtasks, setSubtasks] = useState([]);
  const [fixedSchedules, setFixedSchedules] = useState([]);
  const [stats, setStats] = useState(null);
  
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [activePomodoroTask, setActivePomodoroTask] = useState(null);
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');

  // Initial & User-Change Data Fetch
  useEffect(() => {
    loadAllData();
  }, [user]);

  const loadAllData = async () => {
    if (!user) {
      setMessages([
        {
          id: 'msg-guest',
          role: 'assistant',
          content: 'Chào bạn! Vui lòng đăng nhập hoặc tạo tài khoản để Brain Dump AI lưu trữ và sắp xếp lịch của riêng bạn nhé!',
          createdAt: new Date().toISOString()
        }
      ]);
      setTasks([]);
      setSubtasks([]);
      setFixedSchedules([]);
      setStats(null);
      return;
    }

    try {
      const [hist, ts, sts, fss, st] = await Promise.all([
        api.getChatHistory(),
        api.getTasks(),
        api.getSubtasks(),
        api.getFixedSchedules(),
        api.getStats()
      ]);
      setMessages(hist);
      setTasks(ts);
      setSubtasks(sts);
      setFixedSchedules(fss);
      setStats(st);
    } catch (e) {
      console.error('Error loading user data:', e);
    }
  };

  // Chat message submission
  const handleSendMessage = async (text, imageBase64 = null) => {
    if (!user) {
      showToast({
        type: 'warning',
        title: 'Yêu cầu đăng nhập',
        message: 'Vui lòng đăng nhập để lưu trữ lịch và bài tập của bạn!'
      });
      setShowAuthModal(true);
      return;
    }

    setIsLoadingChat(true);
    const tempUserMsg = {
      id: 'temp-' + Date.now(),
      role: 'user',
      content: text,
      createdAt: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const data = await api.sendMessage(text, apiKey, imageBase64, user?.email, user?.name);
      if (data.messages) {
        setMessages(data.messages);
      }
      const [ts, sts, st, fs] = await Promise.all([
        api.getTasks(),
        api.getSubtasks(),
        api.getStats(),
        api.getFixedSchedules()
      ]);
      setTasks(ts);
      setSubtasks(sts);
      setStats(st);
      setFixedSchedules(fs);

      // Trigger toasts based on AI action
      if (data.result?.type === 'FIXED_SCHEDULE_CREATED') {
        showToast({
          type: 'success',
          title: '🏛️ Đã lưu Thời Khóa Biểu Cố Định',
          message: 'Các khung giờ học cố định đã được khóa. AI sẽ tự động né các giờ này khi xếp bài tập!',
          duration: 6000
        });
      } else if (data.result?.type === 'TASK_CREATED') {
        if (data.result?.data?.task?.priority === 'URGENT') {
          showToast({
            type: 'warning',
            title: '🚨 Việc Rất Gấp - Tự Động Gửi Email!',
            message: `Nhiệm vụ "${data.result.data.task.title}" ở mức RẤT GẤP đã được đưa vào lịch và tự động gửi email cảnh báo về ${user?.email}!`,
            duration: 7000
          });
        } else {
          showToast({
            type: 'success',
            title: '✨ Đã phân tích & xếp lịch',
            message: `Nhiệm vụ mới đã được chia nhỏ và tự động đưa vào lịch!`
          });
        }
      } else if (data.result?.type === 'PANIC_MODE') {
        showToast({
          type: 'warning',
          title: '🚨 Kích hoạt Panic Mode',
          message: 'Lịch học đã được nén tối đa để kịp deadline!'
        });
      } else if (data.result?.type === 'SCHEDULE_MODIFIED') {
        showToast({
          type: 'success',
          title: '📅 Đã cập nhật lịch thành công!',
          message: data.result.reply || 'Thời khóa biểu đã được cập nhật thay đổi mới.',
          duration: 6000
        });
      } else if (data.result?.type === 'REPLAN') {
        showToast({
          type: 'info',
          title: '📅 Đã sắp xếp lại lịch (Re-plan)',
          message: 'Các khối thời gian bị trùng đã được dời sang khung giờ trống.'
        });
      }
    } catch (e) {
      console.error('Send message error:', e);
      showToast({
        type: 'error',
        title: 'Lỗi xử lý AI',
        message: e.response?.data?.reply || e.response?.data?.error || 'Không thể kết nối đến máy chủ AI, vui lòng thử lại!'
      });
    } finally {
      setIsLoadingChat(false);
    }
  };

  // Task Creation
  const handleCreateTask = async (taskData) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    try {
      await api.createTask({
        ...taskData,
        email: user.email,
        userName: user.name
      });
      const [ts, sts, st] = await Promise.all([
        api.getTasks(),
        api.getSubtasks(),
        api.getStats()
      ]);
      setTasks(ts);
      setSubtasks(sts);
      setStats(st);

      if (taskData.priority === 'URGENT') {
        showToast({
          type: 'warning',
          title: '🚨 Việc Rất Gấp - Tự Động Báo Email!',
          message: `Nhiệm vụ "${taskData.title}" đã được lưu và hệ thống tự động gửi email cảnh báo về ${user.email}!`,
          duration: 6000
        });
      } else {
        showToast({
          type: 'success',
          title: 'Thêm task thành công',
          message: `Nhiệm vụ "${taskData.title}" đã được chia thành các bước chi tiết.`
        });
      }
    } catch (e) {
      showToast({
        type: 'error',
        title: 'Lỗi thêm task',
        message: e.message || 'Không thể tạo task'
      });
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await api.deleteTask(id);
      const [ts, sts, st] = await Promise.all([
        api.getTasks(),
        api.getSubtasks(),
        api.getStats()
      ]);
      setTasks(ts);
      setSubtasks(sts);
      setStats(st);
      showToast({
        type: 'info',
        title: 'Đã xóa nhiệm vụ',
        message: 'Lịch trình đã được giải phóng các slot trống.'
      });
    } catch (e) {
      showToast({
        type: 'error',
        title: 'Lỗi xóa task',
        message: e.message
      });
    }
  };

  const handleDeleteSubtask = async (id) => {
    try {
      await api.deleteSubtask(id);
      const [ts, sts, st] = await Promise.all([
        api.getTasks(),
        api.getSubtasks(),
        api.getStats()
      ]);
      setTasks(ts);
      setSubtasks(sts);
      setStats(st);
    } catch (e) {
      showToast({
        type: 'error',
        title: 'Lỗi xóa nhiệm vụ',
        message: e.message || 'Không thể xóa nhiệm vụ'
      });
      throw e;
    }
  };

  const handleDeleteFixedSchedule = async (id) => {
    try {
      await api.deleteFixedSchedule(id);
      const [fs, st] = await Promise.all([
        api.getFixedSchedules(),
        api.getStats()
      ]);
      setFixedSchedules(fs);
      setStats(st);
    } catch (e) {
      showToast({
        type: 'error',
        title: 'Lỗi xóa lịch cố định',
        message: e.message || 'Không thể xóa lịch cố định'
      });
      throw e;
    }
  };

  // Toggle Subtask
  const handleToggleSubtask = async (id, status) => {
    try {
      await api.updateSubtask(id, { status });
      const [ts, sts, st] = await Promise.all([
        api.getTasks(),
        api.getSubtasks(),
        api.getStats()
      ]);
      setTasks(ts);
      setSubtasks(sts);
      setStats(st);
      if (status === 'DONE') {
        showToast({
          type: 'success',
          title: '🎉 Hoàn thành khối việc!',
          message: 'Tiến độ học tập và chuỗi Streak của bạn đã được tăng lên!'
        });
      }
    } catch (e) {
      console.error('Update subtask error:', e);
    }
  };

  // Finish Pomodoro
  const handleFinishPomodoro = async (id, minutesDone, markCompleted) => {
    try {
      if (id && id !== 'default') {
        await api.updateSubtask(id, {
          actualMin: minutesDone,
          status: markCompleted ? 'DONE' : 'TODO'
        });
      }
      const [ts, sts, st] = await Promise.all([
        api.getTasks(),
        api.getSubtasks(),
        api.getStats()
      ]);
      setTasks(ts);
      setSubtasks(sts);
      setStats(st);

      showToast({
        type: 'success',
        title: '🏆 Hoàn thành phiên Pomodoro',
        message: `Đã ghi nhận ${minutesDone} phút học tập vào dữ liệu học máy của AI!`
      });
    } catch (e) {
      console.error('Finish pomodoro error:', e);
    }
  };

  // Auth Handlers
  const handleAuthSuccess = async (userData, token) => {
    setUser(userData);
    localStorage.setItem('brain_dump_user', JSON.stringify(userData));
    localStorage.setItem('brain_dump_token', token);

    const isAdminUser = userData?.role === 'ADMIN' || userData?.email?.toLowerCase()?.includes('admin');
    if (isAdminUser) {
      setCurrentPortal('admin');
      showToast({
        type: 'success',
        title: '🛡️ Quyền Quản Trị Viên (Admin)',
        message: `Chào mừng ${userData.name}! Đã đăng nhập và tự động mở Phân hệ Quản trị Admin.`
      });
    } else {
      setCurrentPortal('student');
      showToast({
        type: 'success',
        title: 'Đăng nhập thành công',
        message: `Chào mừng ${userData.name} (${userData.email}) đã đăng nhập hệ thống!`
      });
    }
    // Immediately refetch all fresh data for the newly logged-in user
    await loadAllData();
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('brain_dump_user');
    localStorage.removeItem('brain_dump_token');
    setCurrentPortal('student');
    
    // Clear old user's data from UI state
    setTasks([]);
    setSubtasks([]);
    setFixedSchedules([]);
    setStats(null);
    setMessages([
      {
        id: 'msg-init',
        role: 'assistant',
        content: 'Chào bạn! Vui lòng đăng nhập hoặc đăng ký tài khoản để bắt đầu quản lý thời khóa biểu và việc học cùng Brain Dump AI nhé!',
        createdAt: new Date().toISOString()
      }
    ]);

    showToast({
      type: 'info',
      title: 'Đã đăng xuất',
      message: 'Dữ liệu phiên làm việc cũ đã được dọn sạch. Hẹn gặp lại bạn!'
    });

    // Prompt login modal for the next user
    setShowAuthModal(true);
  };

  const handleUpdateSubtaskTime = async (id, startTime) => {
    try {
      await api.updateSubtask(id, { startTime });
      const [ts, sts, st] = await Promise.all([
        api.getTasks(),
        api.getSubtasks(),
        api.getStats()
      ]);
      setTasks(ts);
      setSubtasks(sts);
      setStats(st);
    } catch (e) {
      console.error('Update subtask time error:', e);
    }
  };

  // If in Admin Subsystem, render full standalone Admin Portal only for Admin
  const isAdmin = user?.role === 'ADMIN' || user?.email?.toLowerCase()?.includes('admin');
  if (currentPortal === 'admin' && isAdmin) {
    return (
      <AdminPortalView
        user={user}
        onBackToStudentApp={() => setCurrentPortal('student')}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-[#fafdfa] dark:bg-[#080d0b] text-slate-800 dark:text-[#e2ede6] font-['Plus_Jakarta_Sans',sans-serif] transition-colors duration-200">
      {/* 1. Left Navigation Sidebar */}
      <Sidebar 
        activeNav={activeNav} 
        setActiveNav={setActiveNav}
        onOpenOnboarding={() => setShowOnboarding(true)}
        onOpenWhatIf={() => setShowWhatIf(true)}
        onOpenFeedback={() => setShowFeedback(true)}
        onOpenAdmin={() => setCurrentPortal('admin')}
        onOpenUpgrade={() => setShowUpgradeModal(true)}
        user={user}
      />

      {/* 2. Main Content Area according to activeNav */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {activeNav === 'home' && (
          <DashboardCenter
            user={user}
            tasks={tasks}
            subtasks={subtasks}
            fixedSchedules={fixedSchedules}
            stats={stats}
            onOpenPomodoro={(task) => setActivePomodoroTask(task)}
            onAskAI={handleSendMessage}
            onOpenAuth={() => setShowAuthModal(true)}
            onLogout={handleLogout}
            onOpenUpgrade={() => setShowUpgradeModal(true)}
            onDeleteSubtask={handleDeleteSubtask}
            onDeleteFixedSchedule={handleDeleteFixedSchedule}
          />
        )}

        {activeNav === 'calendar' && (
          <CalendarView
            subtasks={subtasks}
            fixedSchedules={fixedSchedules}
            onOpenPomodoro={(task) => setActivePomodoroTask(task)}
            onToggleSubtaskStatus={handleToggleSubtask}
            onUpdateSubtaskTime={handleUpdateSubtaskTime}
            onDeleteSubtask={handleDeleteSubtask}
            onDeleteFixedSchedule={handleDeleteFixedSchedule}
            onUndoSuccess={loadAllData}
            isChatOpen={isChatOpen}
            onToggleChat={() => setIsChatOpen(!isChatOpen)}
          />
        )}

        {activeNav === 'tasks' && (
          <TasksView
            tasks={tasks}
            subtasks={subtasks}
            onCreateTask={handleCreateTask}
            onDeleteTask={handleDeleteTask}
            onToggleSubtask={handleToggleSubtask}
            onOpenPomodoro={(task) => setActivePomodoroTask(task)}
          />
        )}

        {activeNav === 'focus' && (
          <FocusView
            subtasks={subtasks}
            onFinishPomodoro={handleFinishPomodoro}
          />
        )}

        {activeNav === 'progress' && (
          <ProgressView
            stats={stats}
            tasks={tasks}
            subtasks={subtasks}
            onAskAI={handleSendMessage}
          />
        )}

        {activeNav === 'reports' && (
          <ReportsView
            stats={stats}
            tasks={tasks}
            subtasks={subtasks}
            onAskAI={handleSendMessage}
            user={user}
            onOpenUpgrade={() => setShowUpgradeModal(true)}
          />
        )}
      </main>

      {/* 3. Right AI Assistant Panel (Collapsible) */}
      {isChatOpen ? (
        <AIAssistantSidebar
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoadingChat}
          onClose={() => setIsChatOpen(false)}
          user={user}
          onOpenUpgrade={() => setShowUpgradeModal(true)}
        />
      ) : (
        <aside className="w-12 h-full bg-white dark:bg-[#0e1512] border-l border-[#e3ece5] dark:border-[#1d2c26] flex flex-col items-center py-4 justify-between shrink-0 select-none shadow-xs transition-colors duration-200">
          <button
            onClick={() => setIsChatOpen(true)}
            className="w-8 h-8 rounded-xl bg-[#e5f4e8] dark:bg-[#1b3d2f] text-[#1b4d3e] dark:text-emerald-400 hover:bg-[#1b4d3e] hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white flex items-center justify-center transition shadow-2xs cursor-pointer group"
            title="Mở rộng Trợ lý AI"
          >
            <Bot className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>
          
          {/* Vertical Label */}
          <button
            onClick={() => setIsChatOpen(true)}
            className="py-6 px-1 rounded-xl hover:bg-slate-100 dark:hover:bg-[#16241e] text-slate-500 dark:text-slate-400 hover:text-[#1b4d3e] dark:hover:text-emerald-300 transition cursor-pointer flex flex-col items-center gap-3"
            title="Mở rộng Trợ lý AI"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold tracking-widest uppercase [writing-mode:vertical-lr] rotate-180">
              AI Chat
            </span>
          </button>

          <button
            onClick={() => setIsChatOpen(true)}
            className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-[#16241e] hover:bg-emerald-50 dark:hover:bg-[#1e332a] text-slate-600 dark:text-emerald-300 flex items-center justify-center transition cursor-pointer"
            title="Mở rộng Trợ lý AI"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </aside>
      )}

      {/* Auth Modal (Đăng Nhập / Đăng Ký) */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Quick Pomodoro Modal */}
      {activePomodoroTask && (
        <PomodoroModal
          subtask={activePomodoroTask}
          onClose={() => setActivePomodoroTask(null)}
          onFinishPomodoro={handleFinishPomodoro}
        />
      )}

      {/* 3-Step Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onAskAI={handleSendMessage}
      />

      {/* What-If Sandbox Simulator Modal */}
      <WhatIfModal
        isOpen={showWhatIf}
        onClose={() => setShowWhatIf(false)}
        onApplyScenario={(prompt) => handleSendMessage(prompt)}
        user={user}
        onOpenUpgrade={() => setShowUpgradeModal(true)}
      />

      {/* User Feedback & Bug Report Modal */}
      <FeedbackModal
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        user={user}
      />

      {/* Upgrade / Pricing Comparison Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        user={user}
        onUserUpdated={(updatedUser) => setUser(updatedUser)}
      />
    </div>
  );
}
