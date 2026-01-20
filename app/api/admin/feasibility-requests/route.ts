import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addSecurityHeaders } from '@/lib/security-headers';

// GET - جلب جميع طلبات دراسات الجدوى
export async function GET(request: NextRequest) {
  try {
    // التحقق من صلاحية الأدمن
    const session = await auth();
    if (!session || session.user?.role !== 'ADMIN') {
      const response = NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
      return addSecurityHeaders(response);
    }

    // معاملات البحث والفلترة
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const studyType = searchParams.get('studyType');
    const search = searchParams.get('search');

    // بناء شروط البحث
    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (studyType) {
      where.studyType = studyType;
    }

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { city: { contains: search, mode: 'insensitive' } },
        { district: { contains: search, mode: 'insensitive' } },
      ];
    }

    // جلب الطلبات مع الـ pagination
    const [requests, total] = await Promise.all([
      prisma.feasibilityRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
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
      prisma.feasibilityRequest.count({ where }),
    ]);

    const response = NextResponse.json({
      requests,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });

    return addSecurityHeaders(response);
  } catch (error) {
    console.error('Error fetching feasibility requests:', error);
    const response = NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الطلبات' },
      { status: 500 }
    );
    return addSecurityHeaders(response);
  }
}
