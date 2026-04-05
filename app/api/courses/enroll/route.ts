import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rate-limit';
import { addSecurityHeaders } from '@/lib/security-headers';
import { enrollCourseSchema } from '@/lib/validations/courses';

// توليد رمز دفع فريد (6 أحرف وأرقام)
function generatePaymentCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function generateUniquePaymentCode(): Promise<string> {
  let code: string = '';
  let exists = true;
  let attempts = 0;
  const maxAttempts = 10;

  while (exists && attempts < maxAttempts) {
    code = generatePaymentCode();
    const existing = await prisma.courseEnrollment.findUnique({
      where: { paymentCode: code },
    });
    exists = !!existing;
    attempts++;
  }

  if (exists) {
    return `${generatePaymentCode()}${Date.now().toString(36).slice(-2).toUpperCase()}`;
  }

  return code;
}

// POST - إنشاء طلب اشتراك في دورة
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const { allowed } = checkRateLimit(ip, {
      windowMs: 15 * 60 * 1000,
      maxRequests: 5,
    });

    if (!allowed) {
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'تم إرسال عدد كبير من الطلبات. يرجى المحاولة لاحقاً.' },
          { status: 429 }
        )
      );
    }

    // التحقق من تسجيل الدخول
    const session = await auth();
    if (!session?.user?.id) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'يجب تسجيل الدخول للاشتراك' }, { status: 401 })
      );
    }

    const body = await request.json();

    // التحقق من تأكيد الهاتف
    if (!body.isPhoneVerified) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'يرجى التحقق من رقم الهاتف' }, { status: 400 })
      );
    }

    // Validation
    const parsed = enrollCourseSchema.safeParse(body);
    if (!parsed.success) {
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'بيانات غير صالحة', details: parsed.error.issues },
          { status: 400 }
        )
      );
    }

    const { courseId, phone } = parsed.data;

    // التحقق من وجود الدورة ونشرها
    const course = await prisma.course.findUnique({
      where: { id: courseId, isPublished: true },
      select: { id: true, title: true, price: true },
    });

    if (!course) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'الدورة غير موجودة' }, { status: 404 })
      );
    }

    // التحقق من عدم وجود اشتراك سابق نشط
    const existingEnrollment = await prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId,
        },
      },
    });

    if (existingEnrollment) {
      // السماح بإعادة الاشتراك بعد الاسترداد
      if (existingEnrollment.status === 'REFUNDED') {
        await prisma.courseEnrollment.delete({
          where: { id: existingEnrollment.id },
        });
      } else {
        return addSecurityHeaders(
          NextResponse.json({ error: 'أنت مشترك بالفعل في هذه الدورة' }, { status: 409 })
        );
      }
    }

    // التحقق من رقم الهاتف server-side
    const normalizedPhone = phone.replace(/\D/g, '');
    const phoneVerification = await prisma.phoneVerification.findFirst({
      where: {
        phoneNumber: normalizedPhone,
        verified: true,
        expiresAt: { gt: new Date() },
      },
      orderBy: { verifiedAt: 'desc' },
    });

    if (!phoneVerification) {
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'انتهت صلاحية التحقق من رقم الهاتف. يرجى إعادة التحقق.' },
          { status: 400 }
        )
      );
    }

    // الدورات المجانية: تأكيد فوري
    if (course.price === 0) {
      const enrollment = await prisma.courseEnrollment.create({
        data: {
          userId: session.user.id,
          courseId,
          phone: normalizedPhone,
          phoneVerified: true,
          amount: 0,
          status: 'CONFIRMED',
          paymentCode: await generateUniquePaymentCode(),
        },
      });

      return addSecurityHeaders(
        NextResponse.json({
          success: true,
          free: true,
          enrollmentId: enrollment.id,
        }, { status: 201 })
      );
    }

    // الدورات المدفوعة: توليد رمز دفع
    const paymentCode = await generateUniquePaymentCode();

    const enrollment = await prisma.courseEnrollment.create({
      data: {
        userId: session.user.id,
        courseId,
        phone: normalizedPhone,
        phoneVerified: true,
        amount: course.price,
        status: 'PENDING',
        paymentCode,
      },
    });

    return addSecurityHeaders(
      NextResponse.json({
        success: true,
        free: false,
        enrollmentId: enrollment.id,
        paymentCode: enrollment.paymentCode,
        courseTitle: course.title,
        amount: course.price,
      }, { status: 201 })
    );
  } catch (error) {
    console.error('Error creating enrollment:', error);
    return addSecurityHeaders(
      NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
    );
  }
}
