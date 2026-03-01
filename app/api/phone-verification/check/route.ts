import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { addSecurityHeaders } from '@/lib/security-headers';

// Check if a phone number is already verified (and not expired)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber } = body;

    if (!phoneNumber) {
      const response = NextResponse.json(
        { error: 'رقم الهاتف مطلوب' },
        { status: 400 }
      );
      return addSecurityHeaders(response);
    }

    // Normalize phone number
    const normalizedPhone = phoneNumber.replace(/\D/g, '');

    // Check for active verification
    const verification = await prisma.phoneVerification.findFirst({
      where: {
        phoneNumber: normalizedPhone,
        verified: true,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        verifiedAt: 'desc',
      },
    });

    if (verification) {
      const response = NextResponse.json({
        verified: true,
        expiresAt: verification.expiresAt.toISOString(),
      });
      return addSecurityHeaders(response);
    }

    const response = NextResponse.json({
      verified: false,
    });
    return addSecurityHeaders(response);

  } catch (error) {
    console.error('Phone verification check error:', error);
    const response = NextResponse.json(
      { error: 'حدث خطأ في التحقق' },
      { status: 500 }
    );
    return addSecurityHeaders(response);
  }
}
