import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { z } from 'zod';
import { normalizePhone } from '@/lib/validations/auth';

const resetPasswordSchema = z.object({
  identifier: z.string().min(1, 'يرجى إدخال البريد الإلكتروني أو رقم الهاتف'),
  code: z.string().min(1, 'رمز التحقق مطلوب'),
  newPassword: z.string()
    .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'كلمة المرور غير متطابقة',
  path: ['confirmPassword'],
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = resetPasswordSchema.safeParse(body);

    if (!validation.success) {
      const firstError = validation.error.issues[0];
      return NextResponse.json(
        { success: false, message: firstError.message },
        { status: 400 }
      );
    }

    const { identifier, code, newPassword } = validation.data;

    // Check if identifier is email or phone
    const isEmailInput = identifier.includes('@');
    const normalizedIdentifier = isEmailInput ? identifier : normalizePhone(identifier);

    // Find the reset record
    // For phone, we look for PHONE_PENDING code (Firebase verified)
    // For email, we match the actual OTP code
    const resetRecord = await prisma.passwordReset.findFirst({
      where: {
        ...(isEmailInput ? { email: identifier } : { phone: normalizedIdentifier }),
        ...(isEmailInput ? { code } : { code: 'PHONE_PENDING' }),
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!resetRecord) {
      return NextResponse.json(
        { success: false, message: 'رمز التحقق غير صالح أو منتهي الصلاحية' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: isEmailInput ? { email: identifier } : { phone: normalizedIdentifier },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'لم يتم العثور على الحساب' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Mark reset code as used
    await prisma.passwordReset.update({
      where: { id: resetRecord.id },
      data: { used: true, usedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.' },
      { status: 500 }
    );
  }
}
