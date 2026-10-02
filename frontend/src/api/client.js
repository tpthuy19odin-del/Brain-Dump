import axios from 'axios';

const API_BASE = '/api';

const apiClient = axios.create({
  baseURL: API_BASE
});

// Automatically inject user email and token
apiClient.interceptors.request.use((config) => {
  try {
    const userStr = localStorage.getItem('brain_dump_user');
    const token = localStorage.getItem('brain_dump_token');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user?.email) {
        config.headers['x-user-email'] = user.email;
      }
    }
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (e) {}
  return config;
});

export const api = {
  // Auth
  login: async (email, password) => {
    const res = await apiClient.post(`/auth/login`, { email, password });
    return res.data;
  },
  register: async (name, email, password) => {
    const res = await apiClient.post(`/auth/register`, { name, email, password });
    return res.data;
  },

  // Chat
  sendMessage: async (message, apiKey = '', imageBase64 = null, email = '', userName = '') => {
    const res = await apiClient.post(`/chat`, { message, apiKey, imageBase64, email, userName });
    return res.data;
  },
  getChatHistory: async () => {
    const res = await apiClient.get(`/chat/history`);
    return res.data;
  },
  clearChatHistory: async () => {
    const res = await apiClient.delete(`/chat/history`);
    return res.data;
  },

  // Tasks & Subtasks
  getTasks: async () => {
    const res = await apiClient.get(`/tasks`);
    return res.data;
  },
  createTask: async (taskData) => {
    const res = await apiClient.post(`/tasks`, taskData);
    return res.data;
  },
  getSubtasks: async () => {
    const res = await apiClient.get(`/subtasks`);
    return res.data;
  },
  updateSubtask: async (id, data) => {
    const res = await apiClient.patch(`/subtasks/${id}`, data);
    return res.data;
  },
  deleteTask: async (id) => {
    const res = await apiClient.delete(`/tasks/${id}`);
    return res.data;
  },

  // Fixed Schedules
  getFixedSchedules: async () => {
    const res = await apiClient.get(`/fixed-schedules`);
    return res.data;
  },
  createFixedSchedule: async (data) => {
    const res = await apiClient.post(`/fixed-schedules`, data);
    return res.data;
  },
  deleteFixedSchedule: async (id) => {
    const res = await apiClient.delete(`/fixed-schedules/${id}`);
    return res.data;
  },

  // Stats & Workload
  getStats: async () => {
    const res = await apiClient.get(`/stats`);
    return res.data;
  },

  // Email Reminders for Urgent Tasks
  sendUrgentEmail: async (email, userName) => {
    const res = await apiClient.post(`/reminders/send-urgent-email`, { email, userName });
    return res.data;
  }
};

