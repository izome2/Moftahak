import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rate-limit';
import { addSecurityHeaders } from '@/lib/security-headers';

// Generate random 6-digit code
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

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
    const { phoneNumber } = body;

    // Validate phone number format
    if (!phoneNumber || !/^01[0125][0-9]{8}$/.test(phoneNumber)) {
      const response = NextResponse.json(
        { error: 'رقم الهاتف غير صالح' },
        { status: 400 }
      );
      return addSecurityHeaders(response);
    }

    // Generate OTP
    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Delete any existing unverified codes for this phone
    await prisma.phoneVerification.deleteMany({
      where: {
        phone: phoneNumber,
        verified: false,
      },
    });

    // Create new verification record
    const verification = await prisma.phoneVerification.create({
      data: {
        phone: phoneNumber,
        code,
        expiresAt,
        verified: false,
      },
    });

    // TODO: Integrate with SMS provider (Twilio, Vonage, etc.)
    // For now, we'll log the code in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] OTP for ${phoneNumber}: ${code}`);
    }

    // In production, send SMS here:
    // await sendSMS(phoneNumber, `رمز التحقق الخاص بك هو: ${code}`);

    const response = NextResponse.json(
      { 
        success: true,
        message: 'تم إرسال رمز التحقق بنجاح',
        verificationId: verification.id,
        // Only include code in development for testing
        ...(process.env.NODE_ENV === 'development' && { devCode: code }),
      },
      { status: 200 }
    );

    return addSecurityHeaders(response);
  } catch (error) {
    console.error('Error sending OTP:', error);
    
    const response = NextResponse.json(
      { error: 'حدث خطأ في إرسال رمز التحقق. يرجى المحاولة مرة أخرى.' },
      { status: 500 }
    );
    return addSecurityHeaders(response);
  }
}
