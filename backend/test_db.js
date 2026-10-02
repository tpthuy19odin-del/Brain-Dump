const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'linh@student.edu.vn' },
    update: {},
    create: {
      email: 'linh@student.edu.vn',
      password: '123',
      name: 'Linh Trần',
      avatar: '👩‍🎓',
      streakDays: 7
    }
  });
  console.log('✅ User inserted/verified in Neon PostgreSQL:', user);
  const count = await prisma.user.count();
  console.log('📊 Total users in Neon DB:', count);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
