import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ACCOUNTING_ROLES } from '@/lib/permissions';
import type { Role } from '@prisma/client';

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

    // جلب بيانات المستخدم الحالية من قاعدة البيانات
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, additionalRoles: true },
    });

    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'المستخدم غير موجود', error: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    const currentRole = currentUser.role;
    const currentAdditionalRoles = currentUser.additionalRoles || [];

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

    const invitedRole = invitation.role;

    // إذا كان المستخدم بالفعل بنفس الدور (أساسي أو إضافي)
    const allCurrentRoles = [currentRole, ...currentAdditionalRoles] as string[];
    if (allCurrentRoles.includes(invitedRole)) {
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: { used: true, usedAt: new Date(), usedById: userId },
      });

      return NextResponse.json({
        success: true,
        message: `أنت بالفعل ${ROLE_LABELS[invitedRole] || invitedRole}`,
        user: { id: userId, role: currentRole, additionalRoles: currentAdditionalRoles },
        alreadySameRole: true,
      });
    }

    // تحديد كيفية إضافة الدور الجديد
    const isCurrentRoleAccounting = ACCOUNTING_ROLES.includes(currentRole as typeof ACCOUNTING_ROLES[number]);
    const isInvitedRoleAccounting = ACCOUNTING_ROLES.includes(invitedRole as typeof ACCOUNTING_ROLES[number]);

    let updateData: { role?: Role; additionalRoles?: Role[] };

    if (currentRole === 'ADMIN') {
      // ADMIN: يحتفظ بدوره الأساسي ويضيف الدور الجديد كإضافي
      updateData = {
        additionalRoles: [...currentAdditionalRoles, invitedRole] as Role[],
      };
    } else if (currentRole === 'GENERAL_MANAGER') {
      // المدير العام: يحتفظ بدوره ويضيف كإضافي
      updateData = {
        additionalRoles: [...currentAdditionalRoles, invitedRole] as Role[],
      };
    } else if (currentRole === 'USER' || !isCurrentRoleAccounting) {
      // مستخدم عادي بدون دور حسابات: يصبح الدور الجديد هو الأساسي
      updateData = {
        role: invitedRole as Role,
      };
    } else {
      // لديه دور حسابات بالفعل: يحتفظ بالأساسي ويضيف الجديد كإضافي
      updateData = {
        additionalRoles: [...currentAdditionalRoles, invitedRole] as Role[],
      };
    }

    const [updatedUser] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          additionalRoles: true,
          image: true,
        },
      }),
      prisma.invitation.update({
        where: { id: invitation.id },
        data: { used: true, usedAt: new Date(), usedById: userId },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `تمت إضافة دور ${ROLE_LABELS[invitedRole] || invitedRole} بنجاح`,
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
