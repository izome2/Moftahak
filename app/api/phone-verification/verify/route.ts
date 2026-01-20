import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rate-limit';
import { addSecurityHeaders } from '@/lib/security-headers';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - strict for verification attempts
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const { allowed } = checkRateLimit(ip, {
      windowMs: 5 * 60 * 1000, // 5 minutes
      maxRequests: 10, // 10 verification attempts per 5 minutes
    });

    if (!allowed) {
      const response = NextResponse.json(
        { error: 'محاولات تحقق كثيرة. يرجى الانتظار 5 دقائق.' },
        { status: 429 }
      );
      return addSecurityHeaders(response);
    }

    const body = await request.json();
    const { verificationId, code } = body;

    // Validate input
    if (!verificationId || !code) {
      const response = NextResponse.json(
        { error: 'بيانات غير كاملة' },
        { status: 400 }
      );
      return addSecurityHeaders(response);
    }

    // Validate code format
    if (!/^\d{6}$/.test(code)) {
      const response = NextResponse.json(
        { error: 'رمز التحقق يجب أن يكون 6 أرقام' },
        { status: 400 }
      );
      return addSecurityHeaders(response);
    }

    // Find verification record
    const verification = await prisma.phoneVerification.findUnique({
      where: { id: verificationId },
    });

    if (!verification) {
      const response = NextResponse.json(
        { error: 'رمز التحقق غير موجود' },
        { status: 404 }
      );
      return addSecurityHeaders(response);
    }

    // Check if already verified
    if (verification.verified) {
      const response = NextResponse.json(
        { error: 'تم التحقق من هذا الرقم بالفعل' },
        { status: 400 }
      );
      return addSecurityHeaders(response);
    }

    // Check if expired
    if (new Date() > verification.expiresAt) {
      await prisma.phoneVerification.delete({
        where: { id: verificationId },
      });
      
      const response = NextResponse.json(
        { error: 'انتهت صلاحية رمز التحقق. يرجى طلب رمز جديد.' },
        { status: 400 }
      );
      return addSecurityHeaders(response);
    }

    // Check if too many attempts
    if (verification.attempts >= 5) {
      await prisma.phoneVerification.delete({
        where: { id: verificationId },
      });
      
      const response = NextResponse.json(
        { error: 'تم تجاوز عدد المحاولات المسموحة. يرجى طلب رمز جديد.' },
        { status: 400 }
      );
      return addSecurityHeaders(response);
    }

    // Verify code
    if (verification.code !== code) {
      // Increment attempts
      await prisma.phoneVerification.update({
        where: { id: verificationId },
        data: { attempts: { increment: 1 } },
      });

      const remainingAttempts = 5 - verification.attempts - 1;
      
      const response = NextResponse.json(
        { 
          error: `رمز التحقق غير صحيح. المحاولات المتبقية: ${remainingAttempts}`,
          remainingAttempts,
        },
        { status: 400 }
      );
      return addSecurityHeaders(response);
    }

    // Mark as verified
    await prisma.phoneVerification.update({
      where: { id: verificationId },
      data: { 
        verified: true,
        verifiedAt: new Date(),
      },
    });

    const response = NextResponse.json(
      { 
        success: true,
        message: 'تم التحقق من رقم الهاتف بنجاح',
      },
      { status: 200 }
    );

    return addSecurityHeaders(response);
  } catch (error) {
    console.error('Error verifying OTP:', error);
    
    const response = NextResponse.json(
      { error: 'حدث خطأ في التحقق. يرجى المحاولة مرة أخرى.' },
      { status: 500 }
    );
    return addSecurityHeaders(response);
  }
}
