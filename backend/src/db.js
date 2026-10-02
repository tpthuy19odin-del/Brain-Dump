const { PrismaClient } = require('@prisma/client');

let prisma;
let isPrismaAvailable = false;

try {
  prisma = new PrismaClient();
  // Test connection asynchronously
  prisma.$connect()
    .then(() => {
      isPrismaAvailable = true;
      console.log('✅ Connected to PostgreSQL Database via Prisma successfully!');
    })
    .catch((err) => {
      console.warn('⚠️ PostgreSQL not reachable yet, falling back to Local In-Memory Store for instant demo mode:', err.message);
      isPrismaAvailable = false;
    });
} catch (e) {
  console.warn('⚠️ Prisma initialization skipped, using fallback In-Memory DB:', e.message);
}

// Clean initial store (No mock data)
const memoryStore = {
  fixedSchedules: [],
  tasks: [],
  subtasks: [],
  messages: [
    {
      id: 'msg-1',
      role: 'assistant',
      content: 'Chào bạn! Mình là Brain Dump AI. Hãy đổ hết bài tập, deadline hoặc việc cần làm vào đây, mình sẽ tự chia nhỏ và xếp lịch tối ưu cho bạn ngay!',
      metadata: null,
      createdAt: new Date().toISOString()
    }
  ],
  userSetting: {
    id: 'default-user',
    name: 'Sinh viên',
    maxHoursPerDay: 8,
    wakeTime: '07:00',
    sleepTime: '23:00',
    protectedDayOff: 7,
    streakDays: 0,
    lastStreakDate: null
  }
};

module.exports = {
  prisma,
  isPrismaAvailable: () => isPrismaAvailable,
  memoryStore
};
