const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function resetAllData() {
  console.log('🧹 Bắt đầu xóa sạch toàn bộ dữ liệu trong PostgreSQL Database...');
  
  try {
    // 1. Xóa Subtask (các khối việc do AI xếp)
    const delSubtasks = await prisma.subtask.deleteMany({});
    console.log(`✅ Đã xóa ${delSubtasks.count} Subtasks`);

    // 2. Xóa Task (các nhiệm vụ / deadline)
    const delTasks = await prisma.task.deleteMany({});
    console.log(`✅ Đã xóa ${delTasks.count} Tasks`);

    // 3. Xóa FixedSchedule (Thời khóa biểu cố định)
    const delSchedules = await prisma.fixedSchedule.deleteMany({});
    console.log(`✅ Đã xóa ${delSchedules.count} Fixed Schedules`);

    // 4. Xóa ChatMessage (Lịch sử chat)
    const delMessages = await prisma.chatMessage.deleteMany({});
    console.log(`✅ Đã xóa ${delMessages.count} Chat Messages`);

    // 5. Xóa User (Người dùng test cũ)
    const delUsers = await prisma.user.deleteMany({});
    console.log(`✅ Đã xóa ${delUsers.count} Users`);

    console.log('\n✨ TOÀN BỘ CƠ SỞ DỮ LIỆU ĐÃ ĐƯỢC XÓA SẠCH VÀ SẴN SÀNG NHƯ MỚI! ✨');
  } catch (err) {
    console.error('❌ Lỗi khi xóa dữ liệu:', err);
  } finally {
    await prisma.$disconnect();
  }
}

resetAllData();
