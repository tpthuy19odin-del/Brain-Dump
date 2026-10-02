const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

const schedules = [
  { title: 'Hệ thống IoT và ứng dụng (CS1.E402)', dayOfWeek: 1, startTime: '07:00', endTime: '08:45', color: '#3b82f6' },
  { title: 'Phân tích & trực quan dữ liệu (CS1.A113)', dayOfWeek: 2, startTime: '07:00', endTime: '08:45', color: '#10b981' },
  { title: 'Hệ thống thông tin không gian (CS1.A411)', dayOfWeek: 2, startTime: '08:50', endTime: '11:35', color: '#06b6d4' },
  { title: 'Nhập môn xử lý ảnh (CS1.A212)', dayOfWeek: 3, startTime: '07:00', endTime: '09:40', color: '#f59e0b' },
  { title: 'Học máy nâng cao (CS1.A307)', dayOfWeek: 4, startTime: '07:00', endTime: '08:45', color: '#8b5cf6' },
  { title: 'Ngôn ngữ kịch bản (CS1.A409)', dayOfWeek: 4, startTime: '08:50', endTime: '11:35', color: '#ec4899' },
  { title: 'Hệ thống IoT và ứng dụng (CS1.B1201)', dayOfWeek: 5, startTime: '07:00', endTime: '09:40', color: '#3b82f6' },
  { title: 'Phát triển PM Web an toàn (CS1.A111)', dayOfWeek: 5, startTime: '09:50', endTime: '11:35', color: '#14b8a6' }
];

async function seedFixedSchedule() {
  console.log('🏛️ Đang nạp chính xác Thời Khóa Biểu lớp D17CNPM4 vào Neon Database...');
  await prisma.fixedSchedule.deleteMany({});
  for (const s of schedules) {
    const created = await prisma.fixedSchedule.create({ data: s });
    console.log(`✅ Đã nạp: T${s.dayOfWeek + 1} (${s.startTime} - ${s.endTime}): ${s.title}`);
  }
  console.log('🎉 Hoàn tất nạp chính xác thời khóa biểu từ ảnh!');
  await prisma.$disconnect();
}

seedFixedSchedule().catch(console.error);
