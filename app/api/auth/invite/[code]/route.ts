import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const ROLE_LABELS: Record<string, string> = {
  GENERAL_MANAGER: 'المدير العام',
  OPS_MANAGER: 'مدير التشغيل',
  BOOKING_MANAGER: 'مدير الحجوزات',
  INVESTOR: 'مستثمر',
};

// GET - التحقق من صلاحية رابط الدعوة (عام - بدون تسجيل دخول)
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const invitation = await prisma.invitation.findUnique({
      where: { code },
    });

    if (!invitation) {
      return NextResponse.json(
        { valid: false, error: 'رابط الدعوة غير صالح' },
        { status: 404 }
      );
    }

    if (invitation.used) {
      return NextResponse.json(
        { valid: false, error: 'تم استخدام رابط الدعوة بالفعل' },
        { status: 410 }
      );
    }

    if (new Date() > invitation.expiresAt) {
      return NextResponse.json(
        { valid: false, error: 'انتهت صلاحية رابط الدعوة' },
        { status: 410 }
      );
    }

    return NextResponse.json({
      valid: true,
      role: invitation.role,
      roleLabel: ROLE_LABELS[invitation.role] || invitation.role,
      expiresAt: invitation.expiresAt,
    });
  } catch (error) {
    console.error('Error validating invitation:', error);
    return NextResponse.json({ valid: false, error: 'حدث خطأ' }, { status: 500 });
  }
}
