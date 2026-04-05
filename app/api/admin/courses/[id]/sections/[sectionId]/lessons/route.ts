import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addSecurityHeaders } from '@/lib/security-headers';
import { createLessonSchema } from '@/lib/validations/courses';

// POST - إضافة درس جديد لقسم
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== 'ADMIN') {
      return addSecurityHeaders(NextResponse.json({ error: 'غير مصرح' }, { status: 403 }));
    }

    const { id: courseId, sectionId } = await params;
    const body = await request.json();
    const parsed = createLessonSchema.safeParse(body);
    if (!parsed.success) {
      return addSecurityHeaders(NextResponse.json(
        { error: 'بيانات غير صالحة', details: parsed.error.issues },
        { status: 400 }
      ));
    }

    const section = await prisma.courseSection.findUnique({ where: { id: sectionId } });
    if (!section || section.courseId !== courseId) {
      return addSecurityHeaders(NextResponse.json({ error: 'القسم غير موجود' }, { status: 404 }));
    }

    // حساب ترتيب الدرس الجديد
    const maxOrder = await prisma.courseLesson.aggregate({
      where: { sectionId },
      _max: { sortOrder: true },
    });

    const lesson = await prisma.courseLesson.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description || null,
        videoUrl: parsed.data.videoUrl,
        duration: parsed.data.duration,
        sortOrder: parsed.data.sortOrder ?? (maxOrder._max.sortOrder ?? -1) + 1,
        isFree: parsed.data.isFree,
        sectionId,
      },
    });

    // تحديث إحصائيات الدورة
    await recalculateCourseStats(courseId);

    return addSecurityHeaders(NextResponse.json({ success: true, lesson }, { status: 201 }));
  } catch (error) {
    console.error('Error creating lesson:', error);
    return addSecurityHeaders(NextResponse.json({ error: 'حدث خطأ' }, { status: 500 }));
  }
}

async function recalculateCourseStats(courseId: string) {
  const sections = await prisma.courseSection.findMany({
    where: { courseId },
    include: { lessons: true },
  });
  
  let totalDuration = 0;
  let lessonsCount = 0;
  for (const section of sections) {
    for (const lesson of section.lessons) {
      totalDuration += lesson.duration;
      lessonsCount++;
    }
  }

  await prisma.course.update({
    where: { id: courseId },
    data: { totalDuration, lessonsCount },
  });
}
