import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addSecurityHeaders } from '@/lib/security-headers';

// POST - نشر / إلغاء نشر دورة
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== 'ADMIN') {
      return addSecurityHeaders(NextResponse.json({ error: 'غير مصرح' }, { status: 403 }));
    }

    const { id } = await params;

    const course = await prisma.course.findUnique({
      where: { id },
      select: {
        id: true,
        isPublished: true,
        description: true,
        sections: { include: { lessons: { select: { id: true, videoUrl: true } } } },
      },
    });

    if (!course) {
      return addSecurityHeaders(NextResponse.json({ error: 'الدورة غير موجودة' }, { status: 404 }));
    }

    // عند النشر، تحقق من وجود محتوى كافٍ
    if (!course.isPublished) {
      const totalLessons = course.sections.reduce((sum, s) => sum + s.lessons.length, 0);
      if (totalLessons === 0) {
        return addSecurityHeaders(NextResponse.json(
          { error: 'لا يمكن نشر دورة بدون دروس. يرجى إضافة قسم ودرس على الأقل.' },
          { status: 400 }
        ));
      }
      if (!course.description || course.description.trim().length < 10) {
        return addSecurityHeaders(NextResponse.json(
          { error: 'يرجى إضافة وصف للدورة (10 أحرف على الأقل) قبل النشر.' },
          { status: 400 }
        ));
      }
      // التحقق من أن جميع الدروس لديها فيديو
      const lessonsWithoutVideo = course.sections.flatMap(s => 
        s.lessons.filter(l => !l.videoUrl)
      );
      if (lessonsWithoutVideo.length > 0) {
        return addSecurityHeaders(NextResponse.json(
          { error: `يوجد ${lessonsWithoutVideo.length} درس بدون فيديو. يرجى رفع الفيديوهات أولاً.` },
          { status: 400 }
        ));
      }
    }

    const updated = await prisma.course.update({
      where: { id },
      data: { isPublished: !course.isPublished },
    });

    return addSecurityHeaders(NextResponse.json({
      success: true,
      isPublished: updated.isPublished,
    }));
  } catch (error) {
    console.error('Error toggling publish:', error);
    return addSecurityHeaders(NextResponse.json({ error: 'حدث خطأ' }, { status: 500 }));
  }
}
