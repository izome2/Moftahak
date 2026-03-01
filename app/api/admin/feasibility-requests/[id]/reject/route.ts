import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addSecurityHeaders } from '@/lib/security-headers';

// POST - رفض الطلب
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== 'ADMIN') {
      const response = NextResponse.json(
        { error: 'غير مصرح' },
        { status: 401 }
      );
      return addSecurityHeaders(response);
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const { reason } = body;

    // جلب الطلب
    const feasibilityRequest = await prisma.feasibilityRequest.findUnique({
      where: { id },
      include: {
        feasibilityStudy: true,
      },
    });

    if (!feasibilityRequest) {
      const response = NextResponse.json(
        { error: 'الطلب غير موجود' },
        { status: 404 }
      );
      return addSecurityHeaders(response);
    }

    // التحقق من أن الطلب ليس مرفوضاً بالفعل
    if (feasibilityRequest.status === 'REJECTED') {
      const response = NextResponse.json(
        { error: 'الطلب مرفوض بالفعل' },
        { status: 400 }
      );
      return addSecurityHeaders(response);
    }

    // التحقق من عدم وجود دراسة مرتبطة
    if (feasibilityRequest.feasibilityStudy) {
      const response = NextResponse.json(
        { error: 'لا يمكن رفض طلب له دراسة مرتبطة' },
        { status: 400 }
      );
      return addSecurityHeaders(response);
    }

    // تحديث حالة الطلب إلى مرفوض
    const updatedRequest = await prisma.feasibilityRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        adminNotes: reason || feasibilityRequest.adminNotes,
      },
    });

    const response = NextResponse.json({
      success: true,
      message: 'تم رفض الطلب بنجاح',
      request: updatedRequest,
    });
    return addSecurityHeaders(response);
  } catch (error) {
    console.error('Error rejecting feasibility request:', error);
    const response = NextResponse.json(
      { error: 'حدث خطأ أثناء رفض الطلب' },
      { status: 500 }
    );
    return addSecurityHeaders(response);
  }
}
