import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rate-limit';
import { addSecurityHeaders } from '@/lib/security-headers';
import { sendOTPEmail, generateOTP } from '@/lib/email-service';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - strict for OTP
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const { allowed } = checkRateLimit(ip, {
      windowMs: 5 * 60 * 1000, // 5 minutes
      maxRequests: 3, // 3 OTP requests per 5 minutes
    });

    if (!allowed) {
      const response = NextResponse.json(
        { error: 'تم إرسال عدد كبير من الطلبات. يرجى الانتظار 5 دقائق.' },
        { status: 429 }
      );
      return addSecurityHeaders(response);
    }

    const body = await request.json();
    const { email, name } = body;

    // Validate email format
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      const response = NextResponse.json(
        { error: 'البريد الإلكتروني غير صالح' },
        { status: 400 }
      );
      return addSecurityHeaders(response);
    }

    // Check if email was verified in last 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const existingVerification = await prisma.emailVerification.findFirst({
      where: {
        email: email.toLowerCase(),
        verified: true,
        verifiedAt: {
          gte: tenMinutesAgo,
        },
      },
      orderBy: {
        verifiedAt: 'desc',
      },
    });

    // If verified recently, return success without sending new code
    if (existingVerification) {
      const response = NextResponse.json(
        { 
          success: true,
          message: 'تم التحقق من البريد الإلكتروني',
          alreadyVerified: true,
          verificationId: existingVerification.id,
        },
        { status: 200 }
      );
      return addSecurityHeaders(response);
    }

    // Generate OTP
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Delete any existing unverified codes for this email
    await prisma.emailVerification.deleteMany({
      where: {
        email: email.toLowerCase(),
        verified: false,
      },
    });

    // Create new verification record
    const verification = await prisma.emailVerification.create({
      data: {
        email: email.toLowerCase(),
        code,
        expiresAt,
        verified: false,
      },
    });

    // Send OTP email
    const emailResult = await sendOTPEmail(email, name || 'عميلنا الكريم', code);

    if (!emailResult.success) {
      // Delete the verification record if email failed
      await prisma.emailVerification.delete({
        where: { id: verification.id },
      });

      const response = NextResponse.json(
        { error: emailResult.error || 'فشل إرسال البريد الإلكتروني' },
        { status: 500 }
      );
      return addSecurityHeaders(response);
    }

    const response = NextResponse.json(
      { 
        success: true,
        message: 'تم إرسال رمز التحقق بنجاح إلى بريدك الإلكتروني',
        verificationId: verification.id,
        // Only include code in development for testing
        ...(process.env.NODE_ENV === 'development' && { devCode: code }),
      },
      { status: 200 }
    );

    return addSecurityHeaders(response);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    
    const response = NextResponse.json(
      { error: 'حدث خطأ في إرسال رمز التحقق. يرجى المحاولة مرة أخرى.' },
      { status: 500 }
    );
    return addSecurityHeaders(response);
  }
}
