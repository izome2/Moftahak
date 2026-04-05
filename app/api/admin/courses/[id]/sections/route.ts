import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addSecurityHeaders } from '@/lib/security-headers';
import { createSectionSchema } from '@/lib/validations/courses';

// POST - إضافة قسم جديد لدورة
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
    const body = await request.json();
    const parsed = createSectionSchema.safeParse(body);
    if (!parsed.success) {
      return addSecurityHeaders(NextResponse.json(
        { error: 'بيانات غير صالحة', details: parsed.error.issues },
        { status: 400 }
      ));
    }

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) {
      return addSecurityHeaders(NextResponse.json({ error: 'الدورة غير موجودة' }, { status: 404 }));
    }

    // حساب ترتيب القسم الجديد
    const maxOrder = await prisma.courseSection.aggregate({
      where: { courseId: id },
      _max: { sortOrder: true },
    });

    const section = await prisma.courseSection.create({
      data: {
        title: parsed.data.title,
        sortOrder: parsed.data.sortOrder ?? (maxOrder._max.sortOrder ?? -1) + 1,
        courseId: id,
      },
    });

    return addSecurityHeaders(NextResponse.json({ success: true, section }, { status: 201 }));
  } catch (error) {
    console.error('Error creating section:', error);
    return addSecurityHeaders(NextResponse.json({ error: 'حدث خطأ' }, { status: 500 }));
  }
}
