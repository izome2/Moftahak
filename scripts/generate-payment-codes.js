/**
 * سكريبت لتوليد رموز الدفع للطلبات الموجودة التي لا تحتوي على رمز دفع
 */

require('dotenv').config({ path: '.env.local' });

const { PrismaClient } = require('../generated/prisma');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// توليد رمز دفع فريد (6 أحرف وأرقام)
function generatePaymentCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // بدون O/0/I/1 لتجنب الالتباس
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function main() {
  console.log('🔄 جاري البحث عن طلبات بدون رمز دفع...');
  
  // جلب جميع الطلبات بدون رمز دفع
  const requestsWithoutCode = await prisma.feasibilityRequest.findMany({
    where: {
      paymentCode: null,
    },
  });
  
  console.log(`📋 تم العثور على ${requestsWithoutCode.length} طلب بدون رمز دفع`);
  
  if (requestsWithoutCode.length === 0) {
    console.log('✅ جميع الطلبات لديها رموز دفع');
    return;
  }
  
  // جلب جميع رموز الدفع الموجودة
  const existingCodes = await prisma.feasibilityRequest.findMany({
    where: {
      paymentCode: { not: null },
    },
    select: { paymentCode: true },
  });
  
  const usedCodes = new Set(existingCodes.map(r => r.paymentCode));
  
  // توليد رموز فريدة للطلبات
  for (const request of requestsWithoutCode) {
    let code;
    let attempts = 0;
    
    // التأكد من أن الرمز فريد
    do {
      code = generatePaymentCode();
      attempts++;
    } while (usedCodes.has(code) && attempts < 100);
    
    if (usedCodes.has(code)) {
      // في حالة نادرة جداً، استخدم timestamp
      code = `${generatePaymentCode()}${Date.now().toString(36).slice(-2).toUpperCase()}`;
    }
    
    // تحديث الطلب
    await prisma.feasibilityRequest.update({
      where: { id: request.id },
      data: { paymentCode: code },
    });
    
    usedCodes.add(code);
    console.log(`✅ تم توليد رمز ${code} للطلب ${request.id} (${request.fullName})`);
  }
  
  console.log(`\n🎉 تم توليد رموز دفع لـ ${requestsWithoutCode.length} طلب بنجاح!`);
}

main()
  .catch((error) => {
    console.error('❌ حدث خطأ:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
