import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addSecurityHeaders } from '@/lib/security-headers';
import { checkRateLimit } from '@/lib/rate-limit';
import { reviewSchema } from '@/lib/validations/courses';

// GET - تقييمات دورة (عام - بدون auth)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);

    const course = await prisma.course.findUnique({
      where: { slug, isPublished: true },
      select: { id: true },
    });

    if (!course) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'الدورة غير موجودة' }, { status: 404 })
      );
    }

    const [reviews, total] = await Promise.all([
      prisma.courseReview.findMany({
        where: { courseId: course.id },
        include: {
          user: {
            select: { firstName: true, lastName: true, image: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.courseReview.count({ where: { courseId: course.id } }),
    ]);

    // Check if current user is enrolled (for showing review form)
    let isEnrolled = false;
    const session = await auth();
    if (session?.user?.id) {
      const enrollment = await prisma.courseEnrollment.findUnique({
        where: {
          userId_courseId: { userId: session.user.id, courseId: course.id },
        },
        select: { status: true },
      });
      isEnrolled = enrollment?.status === 'CONFIRMED';
    }

    return addSecurityHeaders(
      NextResponse.json({ reviews, total, page, limit, isEnrolled })
    );
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return addSecurityHeaders(
      NextResponse.json({ error: 'حدث خطأ' }, { status: 500 })
    );
  }
}

// POST - Create or update a review
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      );
    }

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const { allowed } = checkRateLimit(ip, { windowMs: 15 * 60 * 1000, maxRequests: 10 });
    if (!allowed) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Too many requests' }, { status: 429 })
      );
    }

    const { slug } = await params;
    const body = await request.json();

    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return addSecurityHeaders(
        NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid data' }, { status: 400 })
      );
    }

    const { rating, comment } = parsed.data;

    const course = await prisma.course.findFirst({
      where: { slug, isPublished: true },
      select: { id: true },
    });

    if (!course) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Course not found' }, { status: 404 })
      );
    }

    // Check enrollment
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: { userId: session.user.id, courseId: course.id },
      },
      select: { status: true },
    });

    if (enrollment?.status !== 'CONFIRMED') {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Enrollment required' }, { status: 403 })
      );
    }

    // Upsert review (one per user per course)
    const review = await prisma.courseReview.upsert({
      where: {
        userId_courseId: { userId: session.user.id, courseId: course.id },
      },
      update: { rating, comment: comment || null },
      create: {
        rating,
        comment: comment || null,
        userId: session.user.id,
        courseId: course.id,
      },
      include: {
        user: {
          select: { firstName: true, lastName: true, image: true },
        },
      },
    });

    return addSecurityHeaders(
      NextResponse.json({ review }, { status: 201 })
    );
  } catch (error) {
    console.error('Create review error:', error);
    return addSecurityHeaders(
      NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    );
  }
}
