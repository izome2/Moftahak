import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rate-limit';
import { addSecurityHeaders } from '@/lib/security-headers';
import { z } from 'zod';

// مخطط التحقق من البيانات
const consultationSchema = z.object({
  firstName: z.string().min(2, 'الاسم الأول مطلوب'),
  lastName: z.string().min(2, 'الاسم الأخير مطلوب'),
  email: z.string().email('البريد الإلكتروني غير صالح'),
  phone: z.string().optional(),
  message: z.string().min(5, 'الرسالة قصيرة جداً'),
  // تكوين الشقة (اختياري)
  bedrooms: z.number().min(0).max(10).optional(),
  livingRooms: z.number().min(0).max(5).optional(),
  kitchens: z.number().min(0).max(3).optional(),
  bathrooms: z.number().min(0).max(5).optional(),
});

// POST - إنشاء طلب استشارة جديد
export async function POST(request: NextRequest) {
  try {
    // التحقق من rate limit
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'dev-' + Math.random().toString(36).substring(7); // IP فريد لكل طلب في التطوير
    
    const { allowed, remaining } = checkRateLimit(ip, {
      windowMs: 15 * 60 * 1000, // 15 دقيقة
      maxRequests: 10, // زيادة إلى 10 طلبات
    });

    if (!allowed) {
      const response = NextResponse.json(
        { error: 'لقد تجاوزت الحد المسموح من الطلبات. حاول مرة أخرى لاحقاً.' },
        { status: 429 }
      );
      return addSecurityHeaders(response);
    }

    // قراءة البيانات
    const body = await request.json();
    
    // التحقق من البيانات
    const validationResult = consultationSchema.safeParse(body);
    if (!validationResult.success) {
      const response = NextResponse.json(
        { error: 'بيانات غير صالحة', details: validationResult.error.issues },
        { status: 400 }
      );
      return addSecurityHeaders(response);
    }

    const data = validationResult.data;

    // إنشاء طلب الاستشارة
    const consultation = await prisma.consultation.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone || null,
        message: data.message,
        bedrooms: data.bedrooms || 0,
        livingRooms: data.livingRooms || 0,
        kitchens: data.kitchens || 0,
        bathrooms: data.bathrooms || 0,
        status: 'PENDING',
      },
    });

    const response = NextResponse.json(
      { 
        success: true, 
        message: 'تم إرسال طلب الاستشارة بنجاح. سنتواصل معك قريباً.',
        consultationId: consultation.id,
        remaining,
      },
      { status: 201 }
    );
    
    return addSecurityHeaders(response);
  } catch (error) {
    console.error('Error creating consultation:', error);
    const response = NextResponse.json(
      { error: 'حدث خطأ أثناء إرسال الطلب. حاول مرة أخرى.' },
      { status: 500 }
    );
    return addSecurityHeaders(response);
  }
}
