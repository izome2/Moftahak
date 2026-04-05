import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addSecurityHeaders } from '@/lib/security-headers';

// GET - جلب إحصائيات لوحة التحكم
export async function GET() {
  try {
    // التحقق من الجلسة والصلاحيات
    const session = await auth();
    if (!session || session.user?.role !== 'ADMIN') {
      const response = NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 403 }
      );
      return addSecurityHeaders(response);
    }

    // جلب الإحصائيات بالتوازي
    const [
      totalUsers,
      pendingConsultations,
      totalFeasibilityStudies,
      recentUsers,
      recentConsultations,
      totalCourses,
      pendingEnrollments,
      courseRevenue,
      recentEnrollments,
    ] = await Promise.all([
      // إجمالي المستخدمين
      prisma.user.count(),
      
      // الاستشارات الجديدة (المعلقة)
      prisma.consultation.count({
        where: { status: 'PENDING' },
      }),
      
      // إجمالي دراسات الجدوى
      prisma.feasibilityStudy.count(),
      
      // آخر 5 مستخدمين مسجلين
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          image: true,
          createdAt: true,
        },
      }),
      
      // آخر 5 استشارات
      prisma.consultation.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          status: true,
          createdAt: true,
        },
      }),

      // إحصائيات الدورات
      prisma.course.count(),
      prisma.courseEnrollment.count({ where: { status: 'PENDING' } }),
      prisma.courseEnrollment.aggregate({
        where: { status: 'CONFIRMED' },
        _sum: { amount: true },
      }),
      
      // آخر 5 طلبات اشتراك
      prisma.courseEnrollment.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          paymentCode: true,
          status: true,
          amount: true,
          createdAt: true,
          user: { select: { firstName: true, lastName: true } },
          course: { select: { title: true } },
        },
      }),
    ]);

    const response = NextResponse.json({
      stats: {
        totalUsers,
        pendingConsultations,
        totalFeasibilityStudies,
        totalReviews: 0,
        totalCourses,
        pendingEnrollments,
        totalCourseRevenue: courseRevenue._sum.amount || 0,
      },
      recentUsers,
      recentConsultations,
      recentEnrollments,
    });

    return addSecurityHeaders(response);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    const response = NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الإحصائيات' },
      { status: 500 }
    );
    return addSecurityHeaders(response);
  }
}
