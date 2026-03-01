import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addSecurityHeaders } from '@/lib/security-headers';

// GET - جلب تفاصيل طلب واحد
export async function GET(
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

    const feasibilityRequest = await prisma.feasibilityRequest.findUnique({
      where: { id },
      include: {
        feasibilityStudy: {
          select: {
            id: true,
            title: true,
            status: true,
            shareId: true,
          },
        },
      },
    });

    if (!feasibilityRequest) {
      const response = NextResponse.json(
        { error: 'الطلب غير موجود' },
        { status: 404 }
      );
      return addSecurityHeaders(response);
    }

    const response = NextResponse.json({ request: feasibilityRequest });
    return addSecurityHeaders(response);
  } catch (error) {
    console.error('Error fetching feasibility request:', error);
    const response = NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الطلب' },
      { status: 500 }
    );
    return addSecurityHeaders(response);
  }
}

// PATCH - تحديث حالة الطلب أو الملاحظات
export async function PATCH(
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
    const body = await request.json();
    const { status, adminNotes } = body;

    // التحقق من وجود الطلب
    const existingRequest = await prisma.feasibilityRequest.findUnique({
      where: { id },
    });

    if (!existingRequest) {
      const response = NextResponse.json(
        { error: 'الطلب غير موجود' },
        { status: 404 }
      );
      return addSecurityHeaders(response);
    }

    // تحديث الطلب
    const updatedRequest = await prisma.feasibilityRequest.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(adminNotes !== undefined && { adminNotes }),
      },
    });

    const response = NextResponse.json({
      success: true,
      request: updatedRequest,
    });
    return addSecurityHeaders(response);
  } catch (error) {
    console.error('Error updating feasibility request:', error);
    const response = NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث الطلب' },
      { status: 500 }
    );
    return addSecurityHeaders(response);
  }
}

// DELETE - حذف طلب
export async function DELETE(
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

    // التحقق من وجود الطلب
    const existingRequest = await prisma.feasibilityRequest.findUnique({
      where: { id },
    });

    if (!existingRequest) {
      const response = NextResponse.json(
        { error: 'الطلب غير موجود' },
        { status: 404 }
      );
      return addSecurityHeaders(response);
    }

    // حذف الطلب
    await prisma.feasibilityRequest.delete({
      where: { id },
    });

    const response = NextResponse.json({
      success: true,
      message: 'تم حذف الطلب بنجاح',
    });
    return addSecurityHeaders(response);
  } catch (error) {
    console.error('Error deleting feasibility request:', error);
    const response = NextResponse.json(
      { error: 'حدث خطأ أثناء حذف الطلب' },
      { status: 500 }
    );
    return addSecurityHeaders(response);
  }
}
