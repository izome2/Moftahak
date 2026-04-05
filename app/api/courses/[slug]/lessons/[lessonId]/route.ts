import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addSecurityHeaders } from '@/lib/security-headers';

// GET - Fetch lesson data with enrollment check
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; lessonId: string }> }
) {
  try {
    let { slug, lessonId } = await params;

    // Get course with enrollment data
    const course = await prisma.course.findFirst({
      where: { slug, isPublished: true },
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        admin: {
          select: {
            firstName: true,
            lastName: true,
            image: true,
          },
        },
        sections: {
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            title: true,
            sortOrder: true,
            lessons: {
              orderBy: { sortOrder: 'asc' },
              select: {
                id: true,
                title: true,
                duration: true,
                sortOrder: true,
                isFree: true,
                videoUrl: true,
              },
            },
          },
        },
      },
    });

    if (!course) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Course not found' }, { status: 404 })
      );
    }

    // If "last", resolve to the most recently watched lesson
    if (lessonId === 'last') {
      const session = await auth();
      if (session?.user?.id) {
        const lastProgress = await prisma.lessonProgress.findFirst({
          where: {
            userId: session.user.id,
            lesson: { section: { courseId: course.id } },
          },
          orderBy: { updatedAt: 'desc' },
          select: { lessonId: true },
        });
        if (lastProgress) {
          lessonId = lastProgress.lessonId;
        }
      }
      // Fallback to first lesson if no progress found
      if (lessonId === 'last') {
        const firstLesson = course.sections[0]?.lessons[0];
        if (!firstLesson) {
          return addSecurityHeaders(
            NextResponse.json({ error: 'No lessons found' }, { status: 404 })
          );
        }
        lessonId = firstLesson.id;
      }
    }

    // Find the requested lesson
    let currentLesson = null;
    for (const section of course.sections) {
      const found = section.lessons.find((l) => l.id === lessonId);
      if (found) {
        currentLesson = { ...found, sectionId: section.id, sectionTitle: section.title };
        break;
      }
    }

    if (!currentLesson) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
      );
    }

    // Check enrollment for non-free lessons
    const session = await auth();
    let enrolled = false;
    let progress = null;
    const isFreeCourse = course.price === 0;

    if (session?.user?.id) {
      let enrollment = await prisma.courseEnrollment.findUnique({
        where: {
          userId_courseId: {
            userId: session.user.id,
            courseId: course.id,
          },
        },
        select: { id: true, status: true },
      });

      // Auto-enroll for free courses
      if (!enrollment && isFreeCourse) {
        enrollment = await prisma.courseEnrollment.create({
          data: {
            userId: session.user.id,
            courseId: course.id,
            phone: '',
            phoneVerified: false,
            amount: 0,
            status: 'CONFIRMED',
            paymentCode: `FREE-${Date.now().toString(36).toUpperCase()}`,
          },
          select: { id: true, status: true },
        });
      }

      enrolled = enrollment?.status === 'CONFIRMED';

      // Fetch progress for this lesson
      if (enrolled) {
        progress = await prisma.lessonProgress.findUnique({
          where: {
            userId_lessonId: {
              userId: session.user.id,
              lessonId,
            },
          },
          select: {
            watchedSeconds: true,
            lastPosition: true,
          },
        });
      }
    }

    // If lesson is not free and user is not enrolled, don't send videoUrl
    if (!currentLesson.isFree && !enrolled) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'Enrollment required' }, { status: 403 })
      );
    }

    // Include videoUrl for enrolled users (needed for thumbnails)
    const sections = course.sections.map((section) => ({
      ...section,
      lessons: section.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        duration: lesson.duration,
        sortOrder: lesson.sortOrder,
        isFree: lesson.isFree,
        hasAccess: lesson.isFree || enrolled,
        ...(enrolled ? { videoUrl: lesson.videoUrl } : {}),
      })),
    }));

    // Fetch all progress for this course
    let allProgress: { lessonId: string }[] = [];
    if (session?.user?.id && enrolled) {
      allProgress = await prisma.lessonProgress.findMany({
        where: {
          userId: session.user.id,
          lesson: {
            section: {
              courseId: course.id,
            },
          },
        },
        select: {
          lessonId: true,
        },
      });
    }

    // Update last accessed
    if (session?.user?.id && enrolled) {
      await prisma.courseEnrollment.update({
        where: {
          userId_courseId: {
            userId: session.user.id,
            courseId: course.id,
          },
        },
        data: { lastAccessedAt: new Date() },
      });
    }

    return addSecurityHeaders(
      NextResponse.json({
        course: {
          id: course.id,
          title: course.title,
          slug: course.slug,
          instructor: course.admin ? {
            firstName: course.admin.firstName,
            lastName: course.admin.lastName,
            image: course.admin.image,
          } : undefined,
        },
        lesson: {
          id: currentLesson.id,
          title: currentLesson.title,
          videoUrl: currentLesson.videoUrl,
          duration: currentLesson.duration,
          isFree: currentLesson.isFree,
          sectionId: currentLesson.sectionId,
          sectionTitle: currentLesson.sectionTitle,
        },
        sections,
        progress,
        allProgress,
        enrolled,
      })
    );
  } catch (error) {
    console.error('Lesson fetch error:', error);
    return addSecurityHeaders(
      NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    );
  }
}
