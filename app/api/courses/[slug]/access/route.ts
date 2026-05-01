import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addSecurityHeaders } from '@/lib/security-headers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);

    const course = await prisma.course.findFirst({
      where: { slug: decodedSlug, isPublished: true },
      select: { id: true },
    });

    if (!course) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'الدورة غير موجودة', enrolled: false }, { status: 404 })
      );
    }

    const session = await auth();
    if (!session?.user?.id) {
      return addSecurityHeaders(NextResponse.json({ enrolled: false }));
    }

    const enrollment = await prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: course.id,
        },
      },
      select: { status: true },
    });

    return addSecurityHeaders(
      NextResponse.json({ enrolled: enrollment?.status === 'CONFIRMED' })
    );
  } catch (error) {
    console.error('Course access check error:', error);
    return addSecurityHeaders(
      NextResponse.json({ error: 'حدث خطأ', enrolled: false }, { status: 500 })
    );
  }
}
