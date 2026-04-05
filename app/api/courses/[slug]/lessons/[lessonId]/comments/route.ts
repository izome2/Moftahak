import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addSecurityHeaders } from '@/lib/security-headers';
import { checkRateLimit } from '@/lib/rate-limit';
import { commentSchema } from '@/lib/validations/courses';

// GET - Fetch comments for a lesson (paginated)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; lessonId: string }> }
) {
  try {
    const { slug, lessonId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);

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

    // Verify lesson belongs to this course
    const lesson = await prisma.courseLesson.findFirst({
      where: { id: lessonId, section: { courseId: course.id } },
      select: { id: true },
    });

    if (!lesson) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
      );
    }

    // Fetch top-level comments with replies
    const [comments, total] = await Promise.all([
      prisma.lessonComment.findMany({
        where: { lessonId, parentId: null },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, image: true },
          },
          replies: {
            include: {
              user: {
                select: { id: true, firstName: true, lastName: true, image: true },
              },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.lessonComment.count({ where: { lessonId, parentId: null } }),
    ]);

    return addSecurityHeaders(
      NextResponse.json({ comments, total, page, limit })
    );
  } catch (error) {
    console.error('Fetch comments error:', error);
    return addSecurityHeaders(
      NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    );
  }
}

// POST - Add a comment or reply
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
    const { allowed } = checkRateLimit(ip, { windowMs: 10 * 60 * 1000, maxRequests: 20 });
    if (!allowed) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Too many requests' }, { status: 429 })
      );
    }

    const { slug, lessonId } = await params;
    const body = await request.json();

    const parsed = commentSchema.safeParse(body);
    if (!parsed.success) {
      return addSecurityHeaders(
        NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid data' }, { status: 400 })
      );
    }

    const { content, parentId } = parsed.data;

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

    // If replying, verify parent exists and belongs to same lesson
    if (parentId) {
      const parent = await prisma.lessonComment.findFirst({
        where: { id: parentId, lessonId, parentId: null },
        select: { id: true },
      });
      if (!parent) {
        return addSecurityHeaders(
          NextResponse.json({ error: 'Parent comment not found' }, { status: 404 })
        );
      }
    }

    const comment = await prisma.lessonComment.create({
      data: {
        content,
        userId: session.user.id,
        lessonId,
        parentId: parentId || null,
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, image: true },
        },
        replies: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, image: true },
            },
          },
        },
      },
    });

    return addSecurityHeaders(
      NextResponse.json({ comment }, { status: 201 })
    );
  } catch (error) {
    console.error('Create comment error:', error);
    return addSecurityHeaders(
      NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    );
  }
}
