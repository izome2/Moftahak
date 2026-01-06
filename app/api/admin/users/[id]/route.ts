import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PATCH - تحديث دور المستخدم
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 403 }
      );
    }

    const { role } = await request.json();

    if (!role || !['USER', 'ADMIN'].includes(role)) {
      return NextResponse.json(
        { error: 'دور غير صحيح' },
        { status: 400 }
      );
    }

    // منع المستخدم من تغيير دوره الخاص
    if (params.id === session.user.id) {
      return NextResponse.json(
        { error: 'لا يمكنك تغيير دورك الخاص' },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: { role },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث الدور' },
      { status: 500 }
    );
  }
}

// DELETE - حذف المستخدم
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'غير مصرح' },
        { status: 403 }
      );
    }

    // منع المستخدم من حذف نفسه
    if (params.id === session.user.id) {
      return NextResponse.json(
        { error: 'لا يمكنك حذف حسابك الخاص' },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'تم حذف المستخدم بنجاح' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف المستخدم' },
      { status: 500 }
    );
  }
}
