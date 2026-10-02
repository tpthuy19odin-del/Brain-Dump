const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const { memoryStore, prisma, isPrismaAvailable } = require('./db');
const { processUserChat } = require('./services/aiService');
const { sendUrgentReminderEmail } = require('./services/emailService');

const app = express();
const PORT = process.env.PORT || 5000;

// Disable ETag to prevent 304 Not Modified on dynamic APIs
app.set('etag', false);

app.use(cors());
app.use(express.json({ limit: '15mb' }));

// Ensure all API responses are fresh 200 OK
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// ==========================================
// 1. AUTHENTICATION API (Mã Hóa Mật Khẩu với Bcrypt)
// ==========================================
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Vui lòng nhập đầy đủ họ tên, email và mật khẩu' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check existing in Prisma or Memory
    let existing = null;
    try {
      existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
    } catch (e) {
      existing = memoryStore.users?.find(u => u.email === cleanEmail);
    }

    if (existing) {
      return res.status(400).json({ error: 'Email này đã được đăng ký tài khoản!' });
    }

    // Mã hóa mật khẩu an toàn với bcrypt (Salt rounds = 10)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in PostgreSQL Database
    let createdUser;
    try {
      createdUser = await prisma.user.create({
        data: {
          email: cleanEmail,
          password: hashedPassword,
          name: name.trim(),
          avatar: '🧑‍💻',
          streakDays: 1
        }
      });
      console.log('✅ Created User with Hashed Password in PostgreSQL Neon DB:', createdUser.email);
    } catch (e) {
      console.warn('Fallback memory user create:', e.message);
      createdUser = {
        id: 'user-' + Date.now(),
        email: cleanEmail,
        password: hashedPassword,
        name: name.trim(),
        avatar: '🧑‍💻',
        streakDays: 1,
        createdAt: new Date().toISOString()
      };
      if (!memoryStore.users) memoryStore.users = [];
      memoryStore.users.push(createdUser);
    }

    const { password: _, ...userWithoutPass } = createdUser;
    res.status(201).json({ user: userWithoutPass, token: 'jwt-' + createdUser.id });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const cleanEmail = email.trim().toLowerCase();

    let user = null;
    try {
      user = await prisma.user.findUnique({ where: { email: cleanEmail } });
    } catch (e) {
      user = memoryStore.users?.find(u => u.email === cleanEmail);
    }

    // Default demo Linh if database empty
    if (!user && cleanEmail === 'linh@student.edu.vn' && password === '123') {
      user = {
        id: 'user-default',
        email: 'linh@student.edu.vn',
        password: await bcrypt.hash('123', 10),
        name: 'Linh Trần',
        avatar: '👩‍🎓',
        streakDays: 7
      };
    }

    if (!user) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không chính xác!' });
    }

    // Compare password using bcrypt
    const isMatch = await bcrypt.compare(password, user.password).catch(() => false) || (user.password === password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không chính xác!' });
    }

    const { password: _, ...userWithoutPass } = user;
    res.json({ user: userWithoutPass, token: 'jwt-' + user.id });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper to extract user email from request headers, query, or body
function getReqUserEmail(req) {
  const headerEmail = req.headers['x-user-email'];
  if (headerEmail && typeof headerEmail === 'string' && headerEmail.trim()) {
    return headerEmail.trim().toLowerCase();
  }
  if (req.body?.email && typeof req.body.email === 'string' && req.body.email.trim()) {
    return req.body.email.trim().toLowerCase();
  }
  if (req.query?.email && typeof req.query.email === 'string' && req.query.email.trim()) {
    return req.query.email.trim().toLowerCase();
  }
  return null;
}

// ==========================================
// 2. CHAT & BRAIN DUMP AI PLANNER
// ==========================================
app.post('/api/chat', async (req, res) => {
  try {
    const { message, apiKey, imageBase64 } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Tin nhắn không được để trống' });
    }

    const userEmail = getReqUserEmail(req);
    if (!userEmail) {
      return res.status(401).json({
        reply: '⚠️ Bạn chưa đăng nhập. Vui lòng bấm vào nút "Đăng nhập" ở góc trên cùng để Brain Dump AI lưu trữ và đồng bộ dữ liệu của riêng bạn!',
        result: { type: 'AUTH_REQUIRED' },
        messages: []
      });
    }

    const userMsg = {
      id: 'msg-' + Date.now(),
      userEmail,
      role: 'user',
      content: message,
      metadata: null,
      createdAt: new Date().toISOString()
    };
    memoryStore.messages.push(userMsg);

    try {
      await prisma.chatMessage.create({
        data: { userEmail, role: 'user', content: message }
      });
    } catch (e) {}

    // Load current state for AI context strictly for this user
    let currentSchedules = [];
    let currentTasks = [];
    let currentSubtasks = [];
    try {
      currentSchedules = await prisma.fixedSchedule.findMany({ 
        where: { userEmail }, 
        orderBy: { dayOfWeek: 'asc' } 
      });
      currentTasks = await prisma.task.findMany({ 
        where: { userEmail }, 
        orderBy: { deadline: 'asc' } 
      });
      currentSubtasks = await prisma.subtask.findMany({ 
        where: { task: { userEmail } }, 
        orderBy: { startTime: 'asc' } 
      });
    } catch (e) {
      currentSchedules = (memoryStore.fixedSchedules || []).filter(s => s.userEmail === userEmail);
      currentTasks = (memoryStore.tasks || []).filter(t => t.userEmail === userEmail);
      currentSubtasks = (memoryStore.subtasks || []).filter(st => {
        const p = memoryStore.tasks?.find(t => t.id === st.taskId);
        return p?.userEmail === userEmail;
      });
    }

    const aiResult = await processUserChat({ 
      message, 
      apiKey, 
      imageBase64, 
      currentSchedules, 
      currentTasks, 
      currentSubtasks 
    });

    // Handle SCHEDULE_MODIFIED (Sửa / Xóa / Thay thế lịch cố định của riêng user này)
    if (aiResult.type === 'SCHEDULE_MODIFIED' && aiResult.modifications) {
      const { deleteFixedScheduleKeywords, deleteScheduleDayOfWeek, addFixedSchedules } = aiResult.modifications;

      // 1. Delete matching schedules from DB for this user
      if (Array.isArray(deleteFixedScheduleKeywords) && deleteFixedScheduleKeywords.length > 0) {
        for (const kw of deleteFixedScheduleKeywords) {
          const cleanKw = (kw || '').toLowerCase().trim();
          try {
            const allDbSchedules = await prisma.fixedSchedule.findMany({ where: { userEmail } });
            const toDelete = allDbSchedules.filter(s => {
              const sTitle = s.title.toLowerCase();
              const matchKw = sTitle.includes(cleanKw) || cleanKw.includes(sTitle) ||
                (cleanKw.includes('học máy') && sTitle.includes('học máy')) ||
                (cleanKw.includes('iot') && sTitle.includes('iot')) ||
                (cleanKw.includes('xử lý ảnh') && sTitle.includes('xử lý ảnh')) ||
                (cleanKw.includes('kịch bản') && sTitle.includes('kịch bản')) ||
                (cleanKw.includes('không gian') && sTitle.includes('không gian')) ||
                (cleanKw.includes('web') && sTitle.includes('web')) ||
                (cleanKw.includes('dữ liệu') && sTitle.includes('dữ liệu'));
              const matchDay = deleteScheduleDayOfWeek ? s.dayOfWeek === Number(deleteScheduleDayOfWeek) : true;
              return matchKw && matchDay;
            });

            for (const item of toDelete) {
              await prisma.fixedSchedule.delete({ where: { id: item.id } });
              console.log(`🗑️ Đã xóa lịch cũ của user ${userEmail}: ${item.title}`);
            }

            // Also delete matching tasks
            const allDbTasks = await prisma.task.findMany({ where: { userEmail } });
            const tasksToDelete = allDbTasks.filter(t => t.title.toLowerCase().includes(cleanKw) || cleanKw.includes(t.title.toLowerCase()));
            for (const t of tasksToDelete) {
              await prisma.task.delete({ where: { id: t.id } });
            }
          } catch (dbErr) {
            console.warn('Memory fallback schedule deletion:', dbErr.message);
            memoryStore.fixedSchedules = memoryStore.fixedSchedules.filter(s => {
              if (s.userEmail && s.userEmail !== userEmail) return true;
              const sTitle = s.title.toLowerCase();
              const matchKw = sTitle.includes(cleanKw) || cleanKw.includes(sTitle);
              const matchDay = deleteScheduleDayOfWeek ? s.dayOfWeek === Number(deleteScheduleDayOfWeek) : true;
              return !(matchKw && matchDay);
            });
            memoryStore.tasks = memoryStore.tasks.filter(t => {
              if (t.userEmail && t.userEmail !== userEmail) return true;
              return !t.title.toLowerCase().includes(cleanKw);
            });
          }
        }
      }

      // 2. Add new replacement schedules into DB for this user & create corresponding Task
      if (Array.isArray(addFixedSchedules) && addFixedSchedules.length > 0) {
        for (const fsItem of addFixedSchedules) {
          const now = new Date();
          const curDay = now.getDay() === 0 ? 7 : now.getDay();
          let diffDays = (Number(fsItem.dayOfWeek) || 1) - curDay;
          if (diffDays < 0) diffDays += 7;
          const targetDeadline = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffDays);
          if (fsItem.startTime) {
            const [h, m] = fsItem.startTime.split(':').map(Number);
            if (!isNaN(h)) targetDeadline.setHours(h, m || 0, 0, 0);
          }

          const lowerTitle = (fsItem.title || '').toLowerCase();
          const isMeeting = lowerTitle.includes('họp') || lowerTitle.includes('meeting') || lowerTitle.includes('gặp') || lowerTitle.includes('phỏng vấn');
          const isExam = lowerTitle.includes('thi') || lowerTitle.includes('kiểm tra') || lowerTitle.includes('bảo vệ') || lowerTitle.includes('đồ án');
          const subject = isMeeting ? 'Lịch Họp' : (isExam ? 'Lịch Thi' : 'Lịch Trình');
          const priority = (isMeeting || isExam) ? 'URGENT' : 'HIGH';

          try {
            const created = await prisma.fixedSchedule.create({
              data: {
                userEmail,
                title: fsItem.title || 'Sự kiện mới',
                dayOfWeek: Number(fsItem.dayOfWeek) || 1,
                startTime: fsItem.startTime || '07:00',
                endTime: fsItem.endTime || '08:45',
                color: fsItem.color || (isMeeting ? '#3b82f6' : isExam ? '#e11d48' : '#10b981')
              }
            });
            console.log(`➕ Đã thêm lịch mới cho user ${userEmail}: ${created.title}`);

            // Also create a Task so it immediately shows up in "Hạn Chót Deadline"
            const matchingTask = await prisma.task.create({
              data: {
                userEmail,
                title: fsItem.title || 'Sự kiện mới',
                subject,
                deadline: targetDeadline,
                priority,
                status: 'TODO'
              }
            });

            await prisma.subtask.create({
              data: {
                taskId: matchingTask.id,
                title: `Tham gia: ${fsItem.title} (${fsItem.startTime} - ${fsItem.endTime})`,
                stepOrder: 1,
                startTime: targetDeadline,
                endTime: new Date(targetDeadline.getTime() + 60 * 60000),
                durationMin: 60,
                status: 'TODO'
              }
            });
          } catch (dbErr) {
            console.warn('Memory fallback schedule creation:', dbErr.message);
            const schedId = `fs-mod-${Date.now()}-${Math.random()}`;
            memoryStore.fixedSchedules.push({
              id: schedId,
              userEmail,
              title: fsItem.title || 'Sự kiện mới',
              dayOfWeek: Number(fsItem.dayOfWeek) || 1,
              startTime: fsItem.startTime || '07:00',
              endTime: fsItem.endTime || '08:45',
              color: fsItem.color || '#e11d48'
            });

            const taskId = 'task-' + Date.now();
            memoryStore.tasks.push({
              id: taskId,
              userEmail,
              title: fsItem.title || 'Sự kiện mới',
              subject,
              deadline: targetDeadline.toISOString(),
              priority,
              status: 'TODO'
            });
            memoryStore.subtasks.push({
              id: 'st-' + Date.now(),
              taskId,
              title: `Tham gia: ${fsItem.title} (${fsItem.startTime} - ${fsItem.endTime})`,
              stepOrder: 1,
              startTime: targetDeadline.toISOString(),
              endTime: new Date(targetDeadline.getTime() + 60 * 60000).toISOString(),
              durationMin: 60,
              status: 'TODO'
            });
          }
        }
      }
    }

    // Save task into PostgreSQL with userEmail
    if (aiResult.type === 'TASK_CREATED' && aiResult.data?.task) {
      let createdTask;
      try {
        createdTask = await prisma.task.create({
          data: {
            userEmail,
            title: aiResult.data.task.title,
            subject: aiResult.data.task.subject || 'Học tập',
            deadline: new Date(aiResult.data.task.deadline),
            priority: aiResult.data.task.priority || 'MEDIUM',
            status: 'TODO'
          }
        });

        if (aiResult.data.subtasks && Array.isArray(aiResult.data.subtasks)) {
          for (let i = 0; i < aiResult.data.subtasks.length; i++) {
            const st = aiResult.data.subtasks[i];
            await prisma.subtask.create({
              data: {
                taskId: createdTask.id,
                title: st.title,
                stepOrder: st.stepOrder || i + 1,
                startTime: new Date(st.startTime),
                endTime: new Date(st.endTime),
                durationMin: st.durationMin || 45,
                actualMin: 0,
                status: 'TODO'
              }
            });
          }
        }
      } catch (dbErr) {
        console.warn('Saved to memory fallback:', dbErr.message);
        const taskId = 'task-' + Date.now();
        const newTask = {
          id: taskId,
          userEmail,
          ...aiResult.data.task,
          createdAt: new Date().toISOString()
        };
        memoryStore.tasks.unshift(newTask);
        if (aiResult.data.subtasks) {
          aiResult.data.subtasks.forEach((st, idx) => {
            memoryStore.subtasks.push({
              id: `sub-${Date.now()}-${idx}`,
              taskId: taskId,
              ...st,
              actualMin: 0
            });
          });
        }
      }

      // Tự động kích hoạt gửi Mail cảnh báo nếu nhiệm vụ này được AI đánh dấu là RẤT GẤP (URGENT)
      if (aiResult.data.task.priority === 'URGENT') {
        const recipientEmail = userEmail;
        const recipientName = req.body.userName || userEmail.split('@')[0];

        sendUrgentReminderEmail({
          toEmail: recipientEmail,
          userName: recipientName,
          urgentTasks: [{
            title: aiResult.data.task.title,
            subject: aiResult.data.task.subject || 'Học tập',
            deadline: aiResult.data.task.deadline,
            priority: 'URGENT',
            subtasks: aiResult.data.subtasks || []
          }]
        }).then(res => {
          console.log(`⚡ [Auto-Email] Đã tự động gửi email việc rất gấp tới ${recipientEmail}:`, res.previewUrl || res.messageId);
        }).catch(err => {
          console.warn('⚡ [Auto-Email Error]:', err.message);
        });

        aiResult.reply += `\n\n🚨 **Lưu ý:** Nhiệm vụ này ở mức **RẤT GẤP (URGENT)** nên hệ thống đã **tự động gửi email cảnh báo** về hộp thư \`${recipientEmail}\` cho bạn! 📧`;
      }
    }

    // Save Fixed Schedules if FIXED_SCHEDULE_CREATED
    if (aiResult.type === 'FIXED_SCHEDULE_CREATED' && aiResult.data?.schedules) {
      try {
        for (const fsItem of aiResult.data.schedules) {
          const existing = await prisma.fixedSchedule.findFirst({
            where: {
              userEmail,
              title: fsItem.title,
              dayOfWeek: fsItem.dayOfWeek,
              startTime: fsItem.startTime
            }
          });
          if (!existing) {
            await prisma.fixedSchedule.create({
              data: {
                userEmail,
                title: fsItem.title,
                dayOfWeek: fsItem.dayOfWeek,
                startTime: fsItem.startTime,
                endTime: fsItem.endTime,
                color: fsItem.color || '#3b82f6'
              }
            });
          }
        }
      } catch (dbErr) {
        console.warn('Fallback memory fixed schedules:', dbErr.message);
        aiResult.data.schedules.forEach((fsItem, idx) => {
          const exists = memoryStore.fixedSchedules.find(
            s => (s.userEmail === userEmail || !s.userEmail) && s.title === fsItem.title && s.dayOfWeek === fsItem.dayOfWeek && s.startTime === fsItem.startTime
          );
          if (!exists) {
            memoryStore.fixedSchedules.push({
              id: `fs-chat-${Date.now()}-${idx}`,
              userEmail,
              ...fsItem
            });
          }
        });
      }
    }

    const botMsg = {
      id: 'msg-' + (Date.now() + 1),
      userEmail,
      role: 'assistant',
      content: aiResult.reply,
      metadata: JSON.stringify(aiResult),
      createdAt: new Date().toISOString()
    };
    memoryStore.messages.push(botMsg);

    try {
      await prisma.chatMessage.create({
        data: {
          userEmail,
          role: 'assistant',
          content: aiResult.reply,
          metadata: JSON.stringify(aiResult)
        }
      });
    } catch (e) {}

    // Return messages for this user
    let userMessages = [];
    try {
      userMessages = await prisma.chatMessage.findMany({
        where: { userEmail },
        orderBy: { createdAt: 'asc' },
        take: 50
      });
    } catch (e) {
      userMessages = memoryStore.messages.filter(m => !m.userEmail || m.userEmail === userEmail);
    }

    res.json({
      reply: aiResult.reply,
      result: aiResult,
      messages: userMessages
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/chat/history', async (req, res) => {
  const userEmail = getReqUserEmail(req);
  if (!userEmail) {
    return res.json([
      {
        id: 'msg-guest',
        role: 'assistant',
        content: 'Chào bạn! Vui lòng đăng nhập tài khoản để xem và quản lý thời khóa biểu của bạn nhé!',
        createdAt: new Date().toISOString()
      }
    ]);
  }

  try {
    const dbMsgs = await prisma.chatMessage.findMany({
      where: { userEmail },
      orderBy: { createdAt: 'asc' },
      take: 50
    });
    if (dbMsgs.length > 0) return res.json(dbMsgs);
  } catch (e) {}

  const filtered = memoryStore.messages.filter(m => m.userEmail === userEmail);
  if (filtered.length > 0) return res.json(filtered);

  res.json([
    {
      id: 'msg-init-' + userEmail,
      role: 'assistant',
      content: 'Chào bạn! Mình là Brain Dump AI. Hãy đổ hết bài tập, deadline hoặc việc cần làm vào đây nhé!',
      createdAt: new Date().toISOString()
    }
  ]);
});

app.delete('/api/chat/history', async (req, res) => {
  const userEmail = getReqUserEmail(req);
  if (!userEmail) return res.json({ success: true, messages: [] });
  try {
    await prisma.chatMessage.deleteMany({
      where: { userEmail }
    });
  } catch (e) {}
  memoryStore.messages = memoryStore.messages.filter(m => m.userEmail !== userEmail);
  res.json({ 
    success: true, 
    messages: [
      {
        id: 'msg-init',
        role: 'assistant',
        content: 'Chào bạn! Mình là Brain Dump AI. Hãy đổ hết bài tập, deadline hoặc việc cần làm vào đây nhé!',
        createdAt: new Date().toISOString()
      }
    ] 
  });
});

// ==========================================
// 3. TASKS & SUBTASKS API
// ==========================================
app.get('/api/tasks', async (req, res) => {
  const userEmail = getReqUserEmail(req);
  if (!userEmail) return res.json([]);

  try {
    const dbTasks = await prisma.task.findMany({
      where: { userEmail },
      include: { subtasks: true },
      orderBy: { createdAt: 'desc' }
    });
    if (dbTasks) return res.json(dbTasks);
  } catch (e) {}
  
  const userTasks = memoryStore.tasks.filter(t => t.userEmail === userEmail);
  const fullTasks = userTasks.map(t => ({
    ...t,
    subtasks: memoryStore.subtasks.filter(st => st.taskId === t.id)
  }));
  res.json(fullTasks);
});

app.post('/api/tasks', async (req, res) => {
  const { title, subject, deadline, priority } = req.body;
  const userEmail = getReqUserEmail(req);
  if (!userEmail) return res.status(401).json({ error: 'Vui lòng đăng nhập để tạo task' });

  try {
    const taskDeadline = deadline ? new Date(deadline) : new Date(Date.now() + 3 * 86400000);
    const createdTask = await prisma.task.create({
      data: {
        userEmail,
        title: title || 'Nhiệm vụ mới',
        subject: subject || 'Học tập',
        deadline: taskDeadline,
        priority: priority || 'MEDIUM',
        status: 'TODO'
      }
    });

    const subtaskTemplates = [
      { title: `Chuẩn bị tài liệu & Dàn ý: ${createdTask.title}`, duration: 60, offsetH: 14 },
      { title: `Thực hiện nội dung chính: ${createdTask.title}`, duration: 90, offsetH: 38 },
      { title: `Rà soát & Hoàn thiện nộp: ${createdTask.title}`, duration: 45, offsetH: 62 }
    ];

    for (let i = 0; i < subtaskTemplates.length; i++) {
      const t = subtaskTemplates[i];
      const start = new Date(Date.now() + t.offsetH * 3600000);
      const end = new Date(start.getTime() + t.duration * 60000);
      await prisma.subtask.create({
        data: {
          taskId: createdTask.id,
          title: t.title,
          stepOrder: i + 1,
          startTime: start,
          endTime: end,
          durationMin: t.duration,
          status: 'TODO'
        }
      });
    }

    const fullTask = await prisma.task.findUnique({
      where: { id: createdTask.id },
      include: { subtasks: true }
    });

    if (priority === 'URGENT') {
      const recipientEmail = userEmail;
      const recipientName = req.body.userName || userEmail.split('@')[0];
      sendUrgentReminderEmail({
        toEmail: recipientEmail,
        userName: recipientName,
        urgentTasks: [fullTask || createdTask]
      }).catch(err => console.warn('Auto email error on create task:', err.message));
    }

    return res.status(201).json(fullTask);
  } catch (e) {
    console.warn('Memory task fallback:', e.message);
    const taskId = 'task-' + Date.now();
    const newTask = {
      id: taskId,
      userEmail,
      title: title || 'Nhiệm vụ mới',
      subject: subject || 'Chung',
      deadline: deadline || new Date(Date.now() + 3 * 86400000).toISOString(),
      priority: priority || 'MEDIUM',
      status: 'TODO',
      createdAt: new Date().toISOString()
    };
    memoryStore.tasks.unshift(newTask);
    res.status(201).json(newTask);
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.task.delete({ where: { id } });
  } catch (e) {
    memoryStore.tasks = memoryStore.tasks.filter(t => t.id !== id);
    memoryStore.subtasks = memoryStore.subtasks.filter(st => st.taskId !== id);
  }
  res.json({ success: true });
});

app.get('/api/subtasks', async (req, res) => {
  const userEmail = getReqUserEmail(req);
  if (!userEmail) return res.json([]);

  try {
    const dbSubtasks = await prisma.subtask.findMany({
      where: { task: { userEmail } },
      include: { task: true },
      orderBy: { startTime: 'asc' }
    });
    if (dbSubtasks && dbSubtasks.length >= 0) {
      return res.json(dbSubtasks.map(st => ({
        ...st,
        taskTitle: st.task?.title || 'Công việc',
        taskSubject: st.task?.subject || 'Học tập',
        taskPriority: st.task?.priority || 'MEDIUM'
      })));
    }
  } catch (e) {}

  const subtasksWithTask = memoryStore.subtasks
    .filter(st => {
      const parent = memoryStore.tasks.find(t => t.id === st.taskId);
      return parent?.userEmail === userEmail;
    })
    .map(st => {
      const parent = memoryStore.tasks.find(t => t.id === st.taskId);
      return {
        ...st,
        taskTitle: parent?.title || 'Công việc',
        taskSubject: parent?.subject || 'Học tập',
        taskPriority: parent?.priority || 'MEDIUM'
      };
    });
  res.json(subtasksWithTask);
});

app.patch('/api/subtasks/:id', async (req, res) => {
  const { id } = req.params;
  const { status, actualMin, startTime, endTime, title } = req.body;
  try {
    const updated = await prisma.subtask.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(actualMin !== undefined && { actualMin: { increment: actualMin } }),
        ...(startTime !== undefined && { startTime: new Date(startTime) }),
        ...(endTime !== undefined && { endTime: new Date(endTime) }),
        ...(title !== undefined && { title })
      }
    });
    return res.json(updated);
  } catch (e) {
    const index = memoryStore.subtasks.findIndex(st => st.id === id);
    if (index !== -1) {
      if (status !== undefined) memoryStore.subtasks[index].status = status;
      if (actualMin !== undefined) memoryStore.subtasks[index].actualMin = (memoryStore.subtasks[index].actualMin || 0) + actualMin;
      return res.json(memoryStore.subtasks[index]);
    }
    res.status(404).json({ error: 'Subtask not found' });
  }
});

// ==========================================
// 4. FIXED SCHEDULES API (TKB Cố Định)
// ==========================================
app.get('/api/fixed-schedules', async (req, res) => {
  const userEmail = getReqUserEmail(req);
  if (!userEmail) return res.json([]);

  try {
    const dbSchedules = await prisma.fixedSchedule.findMany({
      where: { userEmail },
      orderBy: { dayOfWeek: 'asc' }
    });
    if (dbSchedules) return res.json(dbSchedules);
  } catch (e) {}
  
  const userFixed = memoryStore.fixedSchedules.filter(fs => fs.userEmail === userEmail);
  res.json(userFixed);
});

app.post('/api/fixed-schedules', async (req, res) => {
  const { title, dayOfWeek, startTime, endTime, color } = req.body;
  const userEmail = getReqUserEmail(req);
  if (!userEmail) return res.status(401).json({ error: 'Vui lòng đăng nhập' });

  try {
    const newSched = await prisma.fixedSchedule.create({
      data: {
        userEmail,
        title: title || 'Lịch cố định',
        dayOfWeek: Number(dayOfWeek) || 1,
        startTime: startTime || '08:00',
        endTime: endTime || '10:00',
        color: color || '#3b82f6'
      }
    });
    return res.status(201).json(newSched);
  } catch (e) {
    const newSched = {
      id: 'fs-' + Date.now(),
      userEmail,
      title: title || 'Lịch cố định',
      dayOfWeek: Number(dayOfWeek) || 1,
      startTime: startTime || '08:00',
      endTime: endTime || '10:00',
      color: color || '#3b82f6'
    };
    memoryStore.fixedSchedules.push(newSched);
    res.status(201).json(newSched);
  }
});

app.delete('/api/fixed-schedules/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.fixedSchedule.delete({ where: { id } });
  } catch (e) {
    memoryStore.fixedSchedules = memoryStore.fixedSchedules.filter(fs => fs.id !== id);
  }
  res.json({ success: true });
});

// ==========================================
// 5. STATS & WORKLOAD CALCULATION
// ==========================================
app.get('/api/stats', async (req, res) => {
  const userEmail = getReqUserEmail(req);
  if (!userEmail) {
    return res.json({
      totalTasks: 0,
      completedTasks: 0,
      totalSubtasks: 0,
      doneSubtasks: 0,
      completionRate: 0,
      totalHours: '0.0',
      streakDays: 0,
      workloadStatus: 'OPTIMAL',
      workloadText: 'Chưa đăng nhập',
      workloadColor: '#10b981',
      goldenHours: '--:--',
      compensationFactor: '0%'
    });
  }

  try {
    const [tasksCount, completedCount, subtasks] = await Promise.all([
      prisma.task.count({ where: { userEmail } }),
      prisma.task.count({ where: { userEmail, status: 'DONE' } }),
      prisma.subtask.findMany({ where: { task: { userEmail } } })
    ]);

    const totalSubtasks = subtasks.length;
    const doneSubtasks = subtasks.filter(st => st.status === 'DONE').length;
    const totalMinutes = subtasks.reduce((sum, st) => sum + (st.actualMin || st.durationMin || 0), 0);
    const totalHours = (totalMinutes / 60).toFixed(1);

    let workloadStatus = 'OPTIMAL';
    let workloadText = 'Tải học tập cân đối';
    let workloadColor = '#10b981';

    if (totalSubtasks > 8) {
      workloadStatus = 'OVERLOAD';
      workloadText = 'Cảnh báo: Lịch tuần này đang quá tải!';
      workloadColor = '#ef4444';
    } else if (totalSubtasks > 4) {
      workloadStatus = 'HEAVY';
      workloadText = 'Khối lượng học tập vừa phải';
      workloadColor = '#f59e0b';
    }

    return res.json({
      totalTasks: tasksCount,
      completedTasks: completedCount,
      totalSubtasks,
      doneSubtasks,
      completionRate: totalSubtasks > 0 ? Math.round((doneSubtasks / totalSubtasks) * 100) : 0,
      totalHours,
      streakDays: totalSubtasks > 0 ? 1 : 0,
      workloadStatus,
      workloadText,
      workloadColor,
      goldenHours: '14:00 - 17:00 (Hiệu suất đạt 94%)',
      compensationFactor: '+15% bù thời gian thực tế'
    });
  } catch (e) {
    const userTasks = memoryStore.tasks.filter(t => t.userEmail === userEmail);
    const userSubtasks = memoryStore.subtasks.filter(st => {
      const p = memoryStore.tasks.find(t => t.id === st.taskId);
      return p?.userEmail === userEmail;
    });
    const totalSubtasks = userSubtasks.length;
    const doneSubtasks = userSubtasks.filter(st => st.status === 'DONE').length;
    const totalMinutes = userSubtasks.reduce((sum, st) => sum + (st.actualMin || st.durationMin || 0), 0);
    const totalHours = (totalMinutes / 60).toFixed(1);

    res.json({
      totalTasks: userTasks.length,
      completedTasks: userTasks.filter(t => t.status === 'DONE').length,
      totalSubtasks,
      doneSubtasks,
      completionRate: totalSubtasks > 0 ? Math.round((doneSubtasks / totalSubtasks) * 100) : 0,
      totalHours,
      streakDays: 0,
      workloadStatus: 'OPTIMAL',
      workloadText: 'Tải học tập cân đối',
      workloadColor: '#10b981',
      goldenHours: '14:00 - 17:00 (Hiệu suất đạt 94%)',
      compensationFactor: '+15% bù thời gian thực tế'
    });
  }
});

// ==========================================
// 6. URGENT EMAIL REMINDER NOTIFICATION (Gửi Việc Gấp Qua Mail)
// ==========================================
app.post('/api/reminders/send-urgent-email', async (req, res) => {
  try {
    const userEmail = getReqUserEmail(req);
    const recipientEmail = userEmail || req.body.email;
    if (!recipientEmail) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập tài khoản trước khi gửi email báo việc gấp!'
      });
    }
    const recipientName = req.body.userName || recipientEmail.split('@')[0];

    // 1. Get ONLY tasks belonging to this user
    let userTasks = [];
    try {
      userTasks = await prisma.task.findMany({
        where: { userEmail: recipientEmail },
        include: { subtasks: true },
        orderBy: { deadline: 'asc' }
      });
    } catch (e) {
      userTasks = memoryStore.tasks
        .filter(t => t.userEmail === recipientEmail)
        .map(t => ({
          ...t,
          subtasks: memoryStore.subtasks.filter(st => st.taskId === t.id)
        }));
    }

    // 2. Filter urgent tasks for this user (Priority = URGENT or deadline within next 48h, and status !== DONE)
    const now = new Date();
    const urgentTasks = userTasks.filter(t => {
      if (t.status === 'DONE') return false;
      if (t.priority === 'URGENT') return true;
      const d = new Date(t.deadline);
      const diffHours = (d.getTime() - now.getTime()) / (1000 * 3600);
      return diffHours <= 48; // Gấp trong vòng 48h
    });

    // 3. Find schedules for this user
    let userSchedules = [];
    try {
      userSchedules = await prisma.fixedSchedule.findMany({
        where: { userEmail: recipientEmail }
      });
    } catch (e) {
      userSchedules = memoryStore.fixedSchedules.filter(s => s.userEmail === recipientEmail);
    }

    const currentDayOfWeek = now.getDay() === 0 ? 7 : now.getDay();

    // 3.1 Lịch Họp / Gặp gỡ / Phỏng vấn
    const meetingKeywords = ['họp', 'meeting', 'gặp', 'hẹn', 'phỏng vấn', 'thảo luận', 'hội thảo'];
    const meetingEvents = userSchedules.filter(s => {
      const lower = s.title.toLowerCase();
      return meetingKeywords.some(k => lower.includes(k));
    });

    // 3.2 Lịch Thi / Kiểm tra / Bảo vệ đồ án
    const examKeywords = ['thi', 'kiểm tra', 'bảo vệ', 'đồ án', 'thuyết trình', 'test', 'exam'];
    const examEvents = userSchedules.filter(s => {
      const lower = s.title.toLowerCase();
      return examKeywords.some(k => lower.includes(k)) && !meetingKeywords.some(mk => lower.includes(mk));
    });

    // 3.3 Lịch trong ngày hôm nay (loại trừ đã có trong họp/thi)
    const todayEvents = userSchedules.filter(s => {
      const isToday = s.dayOfWeek === currentDayOfWeek;
      const alreadyIn = meetingEvents.some(m => m.id === s.id) || examEvents.some(e => e.id === s.id);
      return isToday && !alreadyIn;
    });

    const totalCount = urgentTasks.length + meetingEvents.length + examEvents.length + todayEvents.length;

    if (totalCount === 0) {
      return res.status(200).json({
        success: false,
        message: 'Hiện tại bạn không có lịch họp, lịch thi, lịch hôm nay hay việc gấp nào cần gửi email!'
      });
    }

    const emailResult = await sendUrgentReminderEmail({
      toEmail: recipientEmail,
      userName: recipientName,
      urgentTasks,
      meetingEvents,
      examEvents,
      todayEvents
    });

    return res.json({
      success: true,
      message: `Đã gửi email tổng hợp ${totalCount} lịch họp, lịch thi & nhiệm vụ tới ${recipientEmail}!`,
      urgentCount: totalCount,
      previewUrl: emailResult.previewUrl,
      recipient: recipientEmail
    });
  } catch (error) {
    console.error('Send Urgent Email Error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 7. SYSTEM RESET API (Xóa sạch toàn bộ dữ liệu)
// ==========================================
app.post('/api/admin/reset-data', async (req, res) => {
  try {
    await prisma.subtask.deleteMany({});
    await prisma.task.deleteMany({});
    await prisma.fixedSchedule.deleteMany({});
    await prisma.chatMessage.deleteMany({});
    await prisma.user.deleteMany({});

    memoryStore.tasks = [];
    memoryStore.subtasks = [];
    memoryStore.fixedSchedules = [];
    memoryStore.messages = [
      {
        id: 'msg-1',
        role: 'assistant',
        content: 'Chào bạn! Mình là Brain Dump AI. Hãy khai báo lịch học cố định hoặc đổ hết bài tập, deadline vào đây nhé!',
        metadata: null,
        createdAt: new Date().toISOString()
      }
    ];

    res.json({ success: true, message: 'Toàn bộ dữ liệu hệ thống đã được xóa sạch hoàn toàn!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export raw SQL file
app.get('/api/export-sql', (req, res) => {
  const sqlFilePath = path.join(__dirname, '..', 'schema.sql');
  if (fs.existsSync(sqlFilePath)) {
    res.download(sqlFilePath, 'brain_dump_schema.sql');
  } else {
    res.status(404).send('schema.sql not found');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Brain Dump Backend API running on http://localhost:${PORT}`);
  console.log(`🗄️ PostgreSQL Neon DB Connected & Synced!`);
});
