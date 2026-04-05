import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addSecurityHeaders } from '@/lib/security-headers';
import { updateCourseSchema } from '@/lib/validations/courses';

// GET - تفاصيل دورة مع الأقسام والدروس
export async function GET(
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
      include: {
        sections: {
          orderBy: { sortOrder: 'asc' },
          include: {
            lessons: {
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
        _count: {
          select: {
            enrollments: { where: { status: 'CONFIRMED' } },
            reviews: true,
          },
        },
      },
    });

    if (!course) {
      return addSecurityHeaders(NextResponse.json({ error: 'الدورة غير موجودة' }, { status: 404 }));
    }

    return addSecurityHeaders(NextResponse.json({ course }));
  } catch (error) {
    console.error('Error fetching course:', error);
    return addSecurityHeaders(NextResponse.json({ error: 'حدث خطأ' }, { status: 500 }));
  }
}

// PATCH - تحديث دورة
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== 'ADMIN') {
      return addSecurityHeaders(NextResponse.json({ error: 'غير مصرح' }, { status: 403 }));
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = updateCourseSchema.safeParse(body);
    if (!parsed.success) {
      return addSecurityHeaders(NextResponse.json(
        { error: 'بيانات غير صالحة', details: parsed.error.issues },
        { status: 400 }
      ));
    }

    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) {
      return addSecurityHeaders(NextResponse.json({ error: 'الدورة غير موجودة' }, { status: 404 }));
    }

    const course = await prisma.course.update({
      where: { id },
      data: parsed.data,
    });

    return addSecurityHeaders(NextResponse.json({ success: true, course }));
  } catch (error) {
    console.error('Error updating course:', error);
    return addSecurityHeaders(NextResponse.json({ error: 'حدث خطأ' }, { status: 500 }));
  }
}

// DELETE - حذف دورة
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== 'ADMIN') {
      return addSecurityHeaders(NextResponse.json({ error: 'غير مصرح' }, { status: 403 }));
    }

    const { id } = await params;

    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) {
      return addSecurityHeaders(NextResponse.json({ error: 'الدورة غير موجودة' }, { status: 404 }));
    }

    // حذف السجلات المرتبطة ثم الدورة
    await prisma.$transaction(async (tx) => {
      // حذف تقدم الدروس
      await tx.lessonProgress.deleteMany({
        where: { lesson: { section: { courseId: id } } },
      });
      // حذف إعجابات الدروس
      await tx.lessonLike.deleteMany({
        where: { lesson: { section: { courseId: id } } },
      });
      // حذف تعليقات الدروس
      await tx.lessonComment.deleteMany({
        where: { lesson: { section: { courseId: id } } },
      });
      // حذف تقييمات الدورة
      await tx.courseReview.deleteMany({
        where: { courseId: id },
      });
      // حذف الدورة (سيتم حذف الأقسام والدروس والاشتراكات تلقائياً عبر Cascade)
      await tx.course.delete({ where: { id } });
    });

    return addSecurityHeaders(NextResponse.json({ success: true }));
  } catch (error) {
    console.error('Error deleting course:', error);
    return addSecurityHeaders(NextResponse.json({ error: 'حدث خطأ' }, { status: 500 }));
  }
}
