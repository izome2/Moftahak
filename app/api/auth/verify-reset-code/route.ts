import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isEmail, isPhone, normalizePhone } from '@/lib/validations/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, code } = body;

    if (!identifier || !code) {
      return NextResponse.json(
        { success: false, message: 'البيانات غير مكتملة' },
        { status: 400 }
      );
    }

    // Validate code format (6 digits)
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { success: false, message: 'رمز التحقق يجب أن يكون 6 أرقام' },
        { status: 400 }
      );
    }

    const isEmailInput = isEmail(identifier);
    const isPhoneInput = isPhone(identifier);

    if (!isEmailInput && !isPhoneInput) {
      return NextResponse.json(
        { success: false, message: 'معرف غير صالح' },
        { status: 400 }
      );
    }

    // Find the reset record
    const normalizedIdentifier = isPhoneInput ? normalizePhone(identifier) : identifier;
    
    const resetRecord = await prisma.passwordReset.findFirst({
      where: {
        ...(isEmailInput ? { email: identifier } : { phone: normalizedIdentifier }),
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!resetRecord) {
      return NextResponse.json(
        { success: false, message: 'لم يتم العثور على طلب إعادة تعيين صالح. يرجى طلب رمز جديد.' },
        { status: 400 }
      );
    }

    // Verify the code
    if (resetRecord.code !== code) {
      return NextResponse.json(
        { success: false, message: 'رمز التحقق غير صحيح' },
        { status: 400 }
      );
    }

    // Code is valid - don't mark as used yet, that happens when password is reset
    return NextResponse.json({
      success: true,
      message: 'تم التحقق من الرمز بنجاح',
    });
  } catch (error) {
    console.error('Verify reset code error:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.' },
      { status: 500 }
    );
  }
}
