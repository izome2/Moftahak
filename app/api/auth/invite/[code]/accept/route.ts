import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const PROTECTED_ROLES = ['ADMIN', 'GENERAL_MANAGER'];

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'المسؤول الأساسي',
  GENERAL_MANAGER: 'المدير العام',
  OPS_MANAGER: 'مدير التشغيل',
  BOOKING_MANAGER: 'مدير الحجوزات',
  INVESTOR: 'مستثمر',
};

// POST - قبول دعوة لمستخدم مسجّل بالفعل
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'يجب تسجيل الدخول أولاً', error: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { code } = await params;
    const userId = session.user.id;
    const currentRole = session.user.role;

    // الحماية: لا يمكن لـ ADMIN تغيير دوره
    if (currentRole === 'ADMIN') {
      return NextResponse.json(
        {
          success: false,
          message: 'لا يمكن تغيير دور المسؤول الأساسي للنظام',
          error: 'ADMIN_PROTECTED',
        },
        { status: 403 }
      );
    }

    // الحماية: لا يمكن لـ GENERAL_MANAGER التنازل عن دوره
    if (currentRole === 'GENERAL_MANAGER') {
      return NextResponse.json(
        {
          success: false,
          message: 'لا يمكن تغيير دور المدير العام. يجب التواصل مع المسؤول الأساسي',
          error: 'GM_PROTECTED',
        },
        { status: 403 }
      );
    }

    // التحقق من صلاحية الدعوة
    const invitation = await prisma.invitation.findUnique({
      where: { code },
    });

    if (!invitation) {
      return NextResponse.json(
        { success: false, message: 'رابط الدعوة غير صالح', error: 'INVALID_INVITE' },
        { status: 404 }
      );
    }

    if (invitation.used) {
      return NextResponse.json(
        { success: false, message: 'تم استخدام رابط الدعوة بالفعل', error: 'INVITE_USED' },
        { status: 410 }
      );
    }

    if (new Date() > invitation.expiresAt) {
      return NextResponse.json(
        { success: false, message: 'انتهت صلاحية رابط الدعوة', error: 'INVITE_EXPIRED' },
        { status: 410 }
      );
    }

    // إذا كان المستخدم بالفعل بنفس الدور المطلوب
    if (currentRole === invitation.role) {
      // نعلم الدعوة كمستخدمة ونعيد النجاح دون تغيير
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: {
          used: true,
          usedAt: new Date(),
          usedById: userId,
        },
      });

      return NextResponse.json({
        success: true,
        message: `أنت بالفعل ${ROLE_LABELS[invitation.role] || invitation.role}`,
        user: {
          id: userId,
          role: currentRole,
        },
        alreadySameRole: true,
      });
    }

    // تحديث دور المستخدم + تعليم الدعوة كمستخدمة
    const [updatedUser] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { role: invitation.role },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          image: true,
        },
      }),
      prisma.invitation.update({
        where: { id: invitation.id },
        data: {
          used: true,
          usedAt: new Date(),
          usedById: userId,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `تم تعيينك كـ ${ROLE_LABELS[invitation.role] || invitation.role} بنجاح`,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ في قبول الدعوة' },
      { status: 500 }
    );
  }
}
