require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // حذف البيانات المرتبطة أولاً
  await prisma.feasibilityStudy.deleteMany({});
  await prisma.consultation.deleteMany({});
  console.log('تم حذف البيانات المرتبطة');

  // حذف جميع المستخدمين
  const deleted = await prisma.user.deleteMany({});
  console.log('تم حذف', deleted.count, 'حساب');

  // إنشاء أدمن جديد
  const hashedPassword = await bcrypt.hash('Admin@2026', 10);
  const admin = await prisma.user.create({
    data: {
      firstName: 'مسؤول',
      lastName: 'النظام',
      email: 'admin@moftahak.com',
      password: hashedPassword,
      role: 'ADMIN',
      image: '/images/default-avatar.svg'
    }
  });

  console.log('');
  console.log('تم إنشاء حساب الأدمن الجديد');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('الإيميل: admin@moftahak.com');
  console.log('كلمة المرور: Admin@2026');
  console.log('الدور:', admin.role);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => { console.error('خطأ:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); pool.end(); });
