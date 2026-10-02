import React, { useState, useEffect } from 'react';
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

export default function App() {
  const { showToast } = useToast();
  const [activeNav, setActiveNav] = useState('home');
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('brain_dump_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null; // Guest state
  });
  
  const [showAuthModal, setShowAuthModal] = useState(false);
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
    showToast({
      type: 'success',
      title: 'Đăng nhập thành công',
      message: `Chào mừng ${userData.name} (${userData.email}) đã đăng nhập hệ thống!`
    });
    // Immediately refetch all fresh data for the newly logged-in user
    await loadAllData();
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('brain_dump_user');
    localStorage.removeItem('brain_dump_token');
    
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

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-[#fafdfa] text-slate-800 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* 1. Left Navigation Sidebar */}
      <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />

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
          />
        )}

        {activeNav === 'calendar' && (
          <CalendarView
            subtasks={subtasks}
            fixedSchedules={fixedSchedules}
            onOpenPomodoro={(task) => setActivePomodoroTask(task)}
            onToggleSubtaskStatus={handleToggleSubtask}
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
          />
        )}
      </main>

      {/* 3. Right AI Assistant Panel */}
      <AIAssistantSidebar
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoadingChat}
      />

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
    </div>
  );
}
