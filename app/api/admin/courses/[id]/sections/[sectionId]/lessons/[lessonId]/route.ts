import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addSecurityHeaders } from '@/lib/security-headers';
import { updateLessonSchema } from '@/lib/validations/courses';

// PATCH - تحديث درس
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string; lessonId: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== 'ADMIN') {
      return addSecurityHeaders(NextResponse.json({ error: 'غير مصرح' }, { status: 403 }));
    }

    const { id: courseId, sectionId, lessonId } = await params;
    const body = await request.json();
    const parsed = updateLessonSchema.safeParse(body);
    if (!parsed.success) {
      return addSecurityHeaders(NextResponse.json(
        { error: 'بيانات غير صالحة', details: parsed.error.issues },
        { status: 400 }
      ));
    }

    const lesson = await prisma.courseLesson.findUnique({ where: { id: lessonId } });
    if (!lesson || lesson.sectionId !== sectionId) {
      return addSecurityHeaders(NextResponse.json({ error: 'الدرس غير موجود' }, { status: 404 }));
    }

    // التحقق من أن القسم ينتمي للدورة
    const section = await prisma.courseSection.findUnique({ where: { id: sectionId } });
    if (!section || section.courseId !== courseId) {
      return addSecurityHeaders(NextResponse.json({ error: 'القسم غير موجود' }, { status: 404 }));
    }

    const updated = await prisma.courseLesson.update({
      where: { id: lessonId },
      data: parsed.data,
    });

    // إعادة حساب إحصائيات الدورة إذا تغيرت المدة
    if (parsed.data.duration !== undefined) {
      await recalculateCourseStats(courseId);
    }

    return addSecurityHeaders(NextResponse.json({ success: true, lesson: updated }));
  } catch (error) {
    console.error('Error updating lesson:', error);
    return addSecurityHeaders(NextResponse.json({ error: 'حدث خطأ' }, { status: 500 }));
  }
}

// DELETE - حذف درس
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string; lessonId: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== 'ADMIN') {
      return addSecurityHeaders(NextResponse.json({ error: 'غير مصرح' }, { status: 403 }));
    }

    const { id: courseId, sectionId, lessonId } = await params;

    const lesson = await prisma.courseLesson.findUnique({ where: { id: lessonId } });
    if (!lesson || lesson.sectionId !== sectionId) {
      return addSecurityHeaders(NextResponse.json({ error: 'الدرس غير موجود' }, { status: 404 }));
    }

    const section = await prisma.courseSection.findUnique({ where: { id: sectionId } });
    if (!section || section.courseId !== courseId) {
      return addSecurityHeaders(NextResponse.json({ error: 'القسم غير موجود' }, { status: 404 }));
    }

    await prisma.courseLesson.delete({ where: { id: lessonId } });
    await recalculateCourseStats(courseId);

    return addSecurityHeaders(NextResponse.json({ success: true }));
  } catch (error) {
    console.error('Error deleting lesson:', error);
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
