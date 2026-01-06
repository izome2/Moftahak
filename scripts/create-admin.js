require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ['query', 'error', 'warn'],
});

async function main() {
  console.log('إنشاء حساب المسؤول...');
  
  const adminEmail = 'admin@moftahak.com';
  const adminPassword = 'Admin@2026'; // يمكن تغيير كلمة المرور بعد أول تسجيل دخول
  
  // التحقق من وجود المسؤول
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });
  
  if (existingAdmin) {
    console.log('⚠️  المسؤول موجود بالفعل!');
    console.log('الإيميل:', adminEmail);
    
    // تحديث الدور إلى ADMIN إذا لم يكن كذلك
    if (existingAdmin.role !== 'ADMIN') {
      await prisma.user.update({
        where: { email: adminEmail },
        data: { role: 'ADMIN' }
      });
      console.log('✅ تم تحديث الدور إلى ADMIN');
    }
    
    return;
  }
  
  // تشفير كلمة المرور
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  
  // إنشاء المسؤول
  const admin = await prisma.user.create({
    data: {
      firstName: 'مسؤول',
      lastName: 'النظام',
      email: adminEmail,
      password: hashedPassword,
      role: 'ADMIN',
      image: '/images/default-avatar.svg'
    }
  });
  
  console.log('✅ تم إنشاء حساب المسؤول بنجاح!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('الإيميل:', adminEmail);
  console.log('كلمة المرور:', adminPassword);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⚠️  احفظ هذه المعلومات وقم بتغيير كلمة المرور بعد أول تسجيل دخول!');
}

main()
  .catch((e) => {
    console.error('❌ خطأ:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
