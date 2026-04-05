import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addSecurityHeaders } from '@/lib/security-headers';

// GET - تفاصيل طلب اشتراك واحد
export async function GET(
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

    const { id } = await params;

    const enrollment = await prisma.courseEnrollment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            image: true,
            createdAt: true,
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            price: true,
            lessonsCount: true,
            totalDuration: true,
          },
        },
      },
    });

    if (!enrollment) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 })
      );
    }

    return addSecurityHeaders(NextResponse.json({ enrollment }));
  } catch (error) {
    console.error('Error fetching enrollment details:', error);
    return addSecurityHeaders(
      NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 })
    );
  }
}
