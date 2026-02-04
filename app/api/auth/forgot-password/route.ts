import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendOTPEmail, generateOTP } from '@/lib/email-service';
import { isEmail, isPhone, normalizePhone } from '@/lib/validations/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier } = body;

    if (!identifier) {
      return NextResponse.json(
        { success: false, message: 'يرجى إدخال البريد الإلكتروني أو رقم الهاتف' },
        { status: 400 }
      );
    }

    const isEmailInput = isEmail(identifier);
    const isPhoneInput = isPhone(identifier);

    if (!isEmailInput && !isPhoneInput) {
      return NextResponse.json(
        { success: false, message: 'يرجى إدخال بريد إلكتروني أو رقم هاتف صالح' },
        { status: 400 }
      );
    }

    // Find user
    let user = null;
    if (isEmailInput) {
      user = await prisma.user.findUnique({
        where: { email: identifier },
        select: { id: true, firstName: true, email: true, phone: true },
      });
    } else {
      const normalizedPhoneNumber = normalizePhone(identifier);
      user = await prisma.user.findUnique({
        where: { phone: normalizedPhoneNumber },
        select: { id: true, firstName: true, email: true, phone: true },
      });
    }

    // If no user found, still return success for phone (to not reveal if account exists)
    if (!user) {
      if (isPhoneInput) {
        return NextResponse.json({
          success: true,
          message: 'يرجى التحقق من رقم الهاتف',
          method: 'phone',
          requiresPhoneVerification: true,
        });
      }
      // For email, still return success to prevent enumeration
      return NextResponse.json({
        success: true,
        message: 'إذا كان الحساب موجوداً، سيتم إرسال رمز التحقق',
        method: 'email',
      });
    }

    // Delete any existing reset codes for this user
    if (isEmailInput && user.email) {
      await prisma.passwordReset.deleteMany({
        where: { email: user.email },
      });
    } else if (user.phone) {
      await prisma.passwordReset.deleteMany({
        where: { phone: user.phone },
      });
    }

    // For email: Generate OTP, save it, and send email
    // For phone: Just mark the request, Firebase will handle verification
    if (isEmailInput && user.email) {
      // Generate OTP for email
      const code = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      
      // Create new reset code
      await prisma.passwordReset.create({
        data: {
          email: identifier,
          phone: null,
          code,
          expiresAt,
        },
      });
      
      // Send email
      const emailResult = await sendOTPEmail(user.email, user.firstName, code);
      if (!emailResult.success) {
        console.error('Failed to send password reset email:', emailResult.error);
        return NextResponse.json(
          { success: false, message: 'فشل إرسال البريد الإلكتروني. يرجى المحاولة لاحقاً.' },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: 'تم إرسال رمز التحقق إلى بريدك الإلكتروني',
        method: 'email',
      });
    } else {
      // For phone: Create a temporary record (Firebase will verify)
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      const normalizedPhoneForReset = normalizePhone(identifier);
      
      await prisma.passwordReset.create({
        data: {
          email: null,
          phone: normalizedPhoneForReset,
          code: 'PHONE_PENDING', // Special marker for phone verification
          expiresAt,
        },
      });
      
      // Return that verification should happen on client via Firebase
      return NextResponse.json({
        success: true,
        message: 'يرجى التحقق من رقم الهاتف',
        method: 'phone',
        requiresPhoneVerification: true,
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.' },
      { status: 500 }
    );
  }
}
