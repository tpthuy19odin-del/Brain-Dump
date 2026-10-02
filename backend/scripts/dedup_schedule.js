const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function deduplicateSchedules() {
  const all = await prisma.fixedSchedule.findMany({ orderBy: { createdAt: 'asc' } });
  const seen = new Set();
  let deletedCount = 0;

  for (const s of all) {
    const key = `${s.title}_${s.dayOfWeek}_${s.startTime}`;
    if (seen.has(key)) {
      await prisma.fixedSchedule.delete({ where: { id: s.id } });
      deletedCount++;
    } else {
      seen.add(key);
    }
  }

  console.log(`🧹 Đã dọn dẹp và xóa ${deletedCount} bản ghi trùng lặp! Còn lại ${seen.size} sự kiện duy nhất.`);
  await prisma.$disconnect();
}

deduplicateSchedules().catch(console.error);
