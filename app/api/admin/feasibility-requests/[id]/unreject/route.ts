import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addSecurityHeaders } from '@/lib/security-headers';

// POST - التراجع عن رفض الطلب (إعادته لحالة الانتظار)
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

    // جلب الطلب
    const feasibilityRequest = await prisma.feasibilityRequest.findUnique({
      where: { id },
    });

    if (!feasibilityRequest) {
      const response = NextResponse.json(
        { error: 'الطلب غير موجود' },
        { status: 404 }
      );
      return addSecurityHeaders(response);
    }

    // التحقق من أن الطلب مرفوض
    if (feasibilityRequest.status !== 'REJECTED') {
      const response = NextResponse.json(
        { error: 'الطلب ليس مرفوضاً' },
        { status: 400 }
      );
      return addSecurityHeaders(response);
    }

    // إعادة الطلب لحالة الانتظار
    const updatedRequest = await prisma.feasibilityRequest.update({
      where: { id },
      data: {
        status: 'PENDING',
      },
    });

    const response = NextResponse.json({
      success: true,
      message: 'تم التراجع عن الرفض بنجاح',
      request: updatedRequest,
    });
    return addSecurityHeaders(response);
  } catch (error) {
    console.error('Error unreject feasibility request:', error);
    const response = NextResponse.json(
      { error: 'حدث خطأ أثناء التراجع عن الرفض' },
      { status: 500 }
    );
    return addSecurityHeaders(response);
  }
}
