import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addSecurityHeaders } from '@/lib/security-headers';
import { updateSectionSchema } from '@/lib/validations/courses';

// PATCH - تحديث قسم
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== 'ADMIN') {
      return addSecurityHeaders(NextResponse.json({ error: 'غير مصرح' }, { status: 403 }));
    }

    const { sectionId } = await params;
    const body = await request.json();
    const parsed = updateSectionSchema.safeParse(body);
    if (!parsed.success) {
      return addSecurityHeaders(NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 }));
    }

    const section = await prisma.courseSection.update({
      where: { id: sectionId },
      data: parsed.data,
    });

    return addSecurityHeaders(NextResponse.json({ success: true, section }));
  } catch (error) {
    console.error('Error updating section:', error);
    return addSecurityHeaders(NextResponse.json({ error: 'حدث خطأ' }, { status: 500 }));
  }
}

// DELETE - حذف قسم
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== 'ADMIN') {
      return addSecurityHeaders(NextResponse.json({ error: 'غير مصرح' }, { status: 403 }));
    }

    const { id, sectionId } = await params;

    await prisma.courseSection.delete({ where: { id: sectionId } });

    // تحديث إحصائيات الدورة
    await recalculateCourseStats(id);

    return addSecurityHeaders(NextResponse.json({ success: true }));
  } catch (error) {
    console.error('Error deleting section:', error);
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
