import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addSecurityHeaders } from '@/lib/security-headers';

// GET - قائمة طلبات الاشتراك مع فلاتر
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== 'ADMIN') {
      return addSecurityHeaders(
        NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 403 })
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const courseId = searchParams.get('courseId');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // بناء شروط البحث
    const where: Record<string, unknown> = {};

    if (status && ['PENDING', 'CONFIRMED', 'EXPIRED', 'REFUNDED'].includes(status)) {
      where.status = status;
    }

    if (courseId) {
      where.courseId = courseId;
    }

    if (search) {
      where.OR = [
        { paymentCode: { contains: search, mode: 'insensitive' } },
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // جلب الطلبات مع التفاصيل + الإحصائيات
    const [enrollments, total, stats] = await Promise.all([
      prisma.courseEnrollment.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              image: true,
            },
          },
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
              price: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.courseEnrollment.count({ where }),
      // إحصائيات سريعة
      Promise.all([
        prisma.courseEnrollment.count(),
        prisma.courseEnrollment.count({ where: { status: 'PENDING' } }),
        prisma.courseEnrollment.count({ where: { status: 'CONFIRMED' } }),
        prisma.courseEnrollment.aggregate({
          where: { status: 'CONFIRMED' },
          _sum: { amount: true },
        }),
      ]),
    ]);

    const response = NextResponse.json({
      enrollments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        totalEnrollments: stats[0],
        pendingEnrollments: stats[1],
        confirmedEnrollments: stats[2],
        totalRevenue: stats[3]._sum.amount || 0,
      },
    });

    return addSecurityHeaders(response);
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return addSecurityHeaders(
      NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
    );
  }
}
