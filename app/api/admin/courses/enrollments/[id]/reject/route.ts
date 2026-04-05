import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addSecurityHeaders } from '@/lib/security-headers';
import { checkRateLimit } from '@/lib/rate-limit';

// POST - رفض طلب الاشتراك
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== 'ADMIN') {
      return addSecurityHeaders(
        NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 403 })
      );
    }

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const { allowed } = checkRateLimit(ip, { windowMs: 60 * 1000, maxRequests: 30 });
    if (!allowed) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'طلبات كثيرة، حاول لاحقاً' }, { status: 429 })
      );
    }

    const { id } = await params;

    const enrollment = await prisma.courseEnrollment.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!enrollment) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
      );
    }

    if (enrollment.status !== 'PENDING') {
      return addSecurityHeaders(
        NextResponse.json(
          { error: 'لا يمكن رفض هذا الطلب لأنه ليس في حالة انتظار' },
          { status: 400 }
        )
      );
    }

    const updated = await prisma.courseEnrollment.update({
      where: { id },
      data: { status: 'EXPIRED' },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        course: { select: { title: true } },
      },
    });

    return addSecurityHeaders(
      NextResponse.json({
        success: true,
        message: 'تم رفض الطلب',
        enrollment: updated,
      })
    );
  } catch (error) {
    console.error('Error rejecting enrollment:', error);
    return addSecurityHeaders(
      NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
    );
  }
}
