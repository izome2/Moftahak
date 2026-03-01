import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addSecurityHeaders } from '@/lib/security-headers';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - جلب استشارة واحدة
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== 'ADMIN') {
      const response = NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 403 }
      );
      return addSecurityHeaders(response);
    }

    const { id } = await params;
    
    const consultation = await prisma.consultation.findUnique({
      where: { id },
    });

    if (!consultation) {
      const response = NextResponse.json(
        { error: 'الاستشارة غير موجودة' },
        { status: 404 }
      );
      return addSecurityHeaders(response);
    }

    const response = NextResponse.json({ consultation });
    return addSecurityHeaders(response);
  } catch (error) {
    console.error('Error fetching consultation:', error);
    const response = NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الاستشارة' },
      { status: 500 }
    );
    return addSecurityHeaders(response);
  }
}

// PATCH - تحديث حالة الاستشارة
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== 'ADMIN') {
      const response = NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 403 }
      );
      return addSecurityHeaders(response);
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!['PENDING', 'READ', 'COMPLETED'].includes(status)) {
      const response = NextResponse.json(
        { error: 'حالة غير صالحة' },
        { status: 400 }
      );
      return addSecurityHeaders(response);
    }

    const consultation = await prisma.consultation.update({
      where: { id },
      data: { status },
    });

    const response = NextResponse.json({ 
      success: true,
      consultation,
    });
    return addSecurityHeaders(response);
  } catch (error) {
    console.error('Error updating consultation:', error);
    const response = NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث الاستشارة' },
      { status: 500 }
    );
    return addSecurityHeaders(response);
  }
}

// DELETE - حذف استشارة
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== 'ADMIN') {
      const response = NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 403 }
      );
      return addSecurityHeaders(response);
    }

    const { id } = await params;

    await prisma.consultation.delete({
      where: { id },
    });

    const response = NextResponse.json({ 
      success: true,
      message: 'تم حذف الاستشارة بنجاح',
    });
    return addSecurityHeaders(response);
  } catch (error) {
    console.error('Error deleting consultation:', error);
    const response = NextResponse.json(
      { error: 'حدث خطأ أثناء حذف الاستشارة' },
      { status: 500 }
    );
    return addSecurityHeaders(response);
  }
}
