import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addSecurityHeaders } from '@/lib/security-headers';

// GET - جلب جميع الاستشارات (للأدمن فقط)
export async function GET(request: NextRequest) {
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

    // قراءة معاملات البحث
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // بناء شروط البحث
    const where = status ? { status: status as 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED' } : {};

    // جلب الاستشارات مع العدد الإجمالي
    const [consultations, total] = await Promise.all([
      prisma.consultation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          feasibilityStudy: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
        },
      }),
      prisma.consultation.count({ where }),
    ]);

    const response = NextResponse.json({
      consultations,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });

    return addSecurityHeaders(response);
  } catch (error) {
    console.error('Error fetching consultations:', error);
    const response = NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الاستشارات' },
      { status: 500 }
    );
    return addSecurityHeaders(response);
  }
}
