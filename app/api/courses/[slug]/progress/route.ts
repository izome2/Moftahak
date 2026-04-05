import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addSecurityHeaders } from '@/lib/security-headers';
import { checkRateLimit } from '@/lib/rate-limit';

// POST - Update watch progress for a lesson
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
    const { allowed } = checkRateLimit(ip, { windowMs: 60 * 1000, maxRequests: 60 });
    if (!allowed) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Too many requests' }, { status: 429 })
      );
    }

    const { slug } = await params;
    const body = await request.json();

    const { lessonId, watchedSeconds, lastPosition } = body;

    if (!lessonId || typeof watchedSeconds !== 'number' || typeof lastPosition !== 'number') {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Invalid data' }, { status: 400 })
      );
    }

    // Verify course exists
    const course = await prisma.course.findFirst({
      where: { slug, isPublished: true },
      select: { id: true },
    });

    if (!course) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Course not found' }, { status: 404 })
      );
    }

    // Verify enrollment
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: course.id,
        },
      },
      select: { id: true, status: true, lastAccessedAt: true },
    });

    if (enrollment?.status !== 'CONFIRMED') {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Enrollment required' }, { status: 403 })
      );
    }

    // Verify lesson belongs to this course
    const lesson = await prisma.courseLesson.findFirst({
      where: {
        id: lessonId,
        section: { courseId: course.id },
      },
      select: { id: true, duration: true },
    });

    if (!lesson) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
      );
    }

    // Upsert progress
    const progress = await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: session.user.id,
          lessonId,
        },
      },
      update: {
        watchedSeconds: Math.max(watchedSeconds, 0),
        lastPosition: Math.max(lastPosition, 0),
      },
      create: {
        userId: session.user.id,
        lessonId,
        watchedSeconds: Math.max(watchedSeconds, 0),
        lastPosition: Math.max(lastPosition, 0),
      },
    });

    // Only update lastAccessedAt if more than 5 minutes since last update to reduce DB writes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const shouldUpdateAccess = !enrollment.lastAccessedAt || new Date(enrollment.lastAccessedAt) < fiveMinutesAgo;

    if (shouldUpdateAccess) {
      await prisma.courseEnrollment.update({
        where: { id: enrollment.id },
        data: { lastAccessedAt: new Date() },
      });
    }

    return addSecurityHeaders(
      NextResponse.json({
        success: true,
        progress: {
          watchedSeconds: progress.watchedSeconds,
          lastPosition: progress.lastPosition,
        },
      })
    );
  } catch (error) {
    console.error('Progress update error:', error);
    return addSecurityHeaders(
      NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    );
  }
}
