import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addSecurityHeaders } from '@/lib/security-headers';
import { checkRateLimit } from '@/lib/rate-limit';

// GET - Fetch current like/dislike status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; lessonId: string }> }
) {
  try {
    const session = await auth();
    const { lessonId } = await params;

    const likesCount = await prisma.lessonLike.count({ where: { lessonId } });

    let liked = false;
    let disliked = false;

    if (session?.user?.id) {
      const [likeRow, dislikeRow] = await Promise.all([
        prisma.lessonLike.findUnique({ where: { userId_lessonId: { userId: session.user.id, lessonId } } }),
        prisma.lessonDislike.findUnique({ where: { userId_lessonId: { userId: session.user.id, lessonId } } }),
      ]);
      liked = !!likeRow;
      disliked = !!dislikeRow;
    }

    return addSecurityHeaders(
      NextResponse.json({ liked, disliked, likesCount })
    );
  } catch (error) {
    console.error('Fetch like status error:', error);
    return addSecurityHeaders(
      NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    );
  }
}

// POST - Toggle like/dislike on a lesson
// Body: { action: 'like' | 'dislike' } (defaults to 'like' if empty for backward compat)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; lessonId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      );
    }

    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const { allowed } = checkRateLimit(ip, { windowMs: 60 * 1000, maxRequests: 30 });
    if (!allowed) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Too many requests' }, { status: 429 })
      );
    }

    const { slug, lessonId } = await params;

    // Parse action from body
    let action: 'like' | 'dislike' = 'like';
    try {
      const body = await request.json();
      if (body.action === 'dislike') action = 'dislike';
    } catch {
      // No body or invalid JSON - default to 'like'
    }

    // Verify course + enrollment
    const course = await prisma.course.findFirst({
      where: { slug, isPublished: true },
      select: { id: true },
    });

    if (!course) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Course not found' }, { status: 404 })
      );
    }

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

    // Verify lesson belongs to course
    const lesson = await prisma.courseLesson.findFirst({
      where: { id: lessonId, section: { courseId: course.id } },
      select: { id: true },
    });

    if (!lesson) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
      );
    }

    const userId = session.user.id;

    if (action === 'like') {
      // Check existing like
      const existingLike = await prisma.lessonLike.findUnique({
        where: { userId_lessonId: { userId, lessonId } },
      });

      if (existingLike) {
        // Unlike - remove like
        await prisma.lessonLike.delete({ where: { id: existingLike.id } });
      } else {
        // Like - add like and remove any dislike
        await prisma.$transaction([
          prisma.lessonDislike.deleteMany({ where: { userId, lessonId } }),
          prisma.lessonLike.create({ data: { userId, lessonId } }),
        ]);
      }
    } else {
      // action === 'dislike'
      const existingDislike = await prisma.lessonDislike.findUnique({
        where: { userId_lessonId: { userId, lessonId } },
      });

      if (existingDislike) {
        // Un-dislike - remove dislike
        await prisma.lessonDislike.delete({ where: { id: existingDislike.id } });
      } else {
        // Dislike - add dislike and remove any like
        await prisma.$transaction([
          prisma.lessonLike.deleteMany({ where: { userId, lessonId } }),
          prisma.lessonDislike.create({ data: { userId, lessonId } }),
        ]);
      }
    }

    // Get updated state
    const [likesCount, liked, disliked] = await Promise.all([
      prisma.lessonLike.count({ where: { lessonId } }),
      prisma.lessonLike.findUnique({ where: { userId_lessonId: { userId, lessonId } } }),
      prisma.lessonDislike.findUnique({ where: { userId_lessonId: { userId, lessonId } } }),
    ]);

    return addSecurityHeaders(
      NextResponse.json({
        liked: !!liked,
        disliked: !!disliked,
        likesCount,
      })
    );
  } catch (error) {
    console.error('Toggle like/dislike error:', error);
    return addSecurityHeaders(
      NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    );
  }
}
