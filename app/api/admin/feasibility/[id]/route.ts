import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addSecurityHeaders } from '@/lib/security-headers';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - جلب دراسة جدوى واحدة
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
    
    const study = await prisma.feasibilityStudy.findUnique({
      where: { id },
      include: {
        consultation: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            message: true,
          },
        },
        admin: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!study) {
      const response = NextResponse.json(
        { error: 'الدراسة غير موجودة' },
        { status: 404 }
      );
      return addSecurityHeaders(response);
    }

    const response = NextResponse.json({ study });
    return addSecurityHeaders(response);
  } catch (error) {
    console.error('Error fetching study:', error);
    const response = NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الدراسة' },
      { status: 500 }
    );
    return addSecurityHeaders(response);
  }
}

// PUT - تحديث دراسة الجدوى (حفظ الشرائح والتكلفة)
export async function PUT(request: NextRequest, { params }: RouteParams) {
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
    
    // استخراج الحقول القابلة للتحديث
    const {
      slides,
      totalCost,
      status,
      clientName,
      title,
      bedrooms,
      livingRooms,
      kitchens,
      bathrooms,
    } = body;

    // بناء كائن التحديث
    const updateData: Record<string, unknown> = {};
    
    if (slides !== undefined) updateData.slides = slides;
    if (totalCost !== undefined) updateData.totalCost = totalCost;
    if (status !== undefined) updateData.status = status;
    if (clientName !== undefined) updateData.clientName = clientName;
    if (title !== undefined) updateData.title = title;
    if (bedrooms !== undefined) updateData.bedrooms = bedrooms;
    if (livingRooms !== undefined) updateData.livingRooms = livingRooms;
    if (kitchens !== undefined) updateData.kitchens = kitchens;
    if (bathrooms !== undefined) updateData.bathrooms = bathrooms;

    // تحديث تاريخ الإرسال إذا تم تغيير الحالة إلى SENT
    if (status === 'SENT') {
      updateData.sentAt = new Date();
    }

    const study = await prisma.feasibilityStudy.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        title: true,
        clientName: true,
        status: true,
        totalCost: true,
        updatedAt: true,
      },
    });

    const response = NextResponse.json({ 
      success: true,
      message: 'تم حفظ الدراسة بنجاح',
      study,
    });
    return addSecurityHeaders(response);
  } catch (error) {
    console.error('Error updating study:', error);
    const response = NextResponse.json(
      { error: 'حدث خطأ أثناء حفظ الدراسة' },
      { status: 500 }
    );
    return addSecurityHeaders(response);
  }
}

// PATCH - تحديث جزئي (مثل الحالة فقط)
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

    const study = await prisma.feasibilityStudy.update({
      where: { id },
      data: body,
    });

    const response = NextResponse.json({ 
      success: true,
      study,
    });
    return addSecurityHeaders(response);
  } catch (error) {
    console.error('Error patching study:', error);
    const response = NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث الدراسة' },
      { status: 500 }
    );
    return addSecurityHeaders(response);
  }
}

// DELETE - حذف دراسة جدوى
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

    // حذف الدراسة
    await prisma.feasibilityStudy.delete({
      where: { id },
    });

    const response = NextResponse.json({ 
      success: true,
      message: 'تم حذف الدراسة بنجاح',
    });
    return addSecurityHeaders(response);
  } catch (error) {
    console.error('Error deleting study:', error);
    const response = NextResponse.json(
      { error: 'حدث خطأ أثناء حذف الدراسة' },
      { status: 500 }
    );
    return addSecurityHeaders(response);
  }
}
