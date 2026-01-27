import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rate-limit';
import { addSecurityHeaders } from '@/lib/security-headers';

// Verify and store phone verification in database
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const { allowed } = checkRateLimit(ip, {
      windowMs: 5 * 60 * 1000, // 5 minutes
      maxRequests: 10, // 10 verification confirmations per 5 minutes
    });

    if (!allowed) {
      const response = NextResponse.json(
        { error: 'محاولات كثيرة. يرجى الانتظار 5 دقائق.' },
        { status: 429 }
      );
      return addSecurityHeaders(response);
    }

    const body = await request.json();
    const { phoneNumber, firebaseUid, idToken } = body;

    // Validate input
    if (!phoneNumber || !firebaseUid) {
      const response = NextResponse.json(
        { error: 'بيانات غير كاملة' },
        { status: 400 }
      );
      return addSecurityHeaders(response);
    }

    // Normalize phone number (remove all non-digits)
    const normalizedPhone = phoneNumber.replace(/\D/g, '');
    
    // Validate phone number format (Egyptian or Saudi)
    const isEgyptian = normalizedPhone.startsWith('20') && normalizedPhone.length === 12; // +20 1xxxxxxxxx
    const isSaudi = normalizedPhone.startsWith('966') && normalizedPhone.length === 12; // +966 5xxxxxxxx
    
    if (!isEgyptian && !isSaudi) {
      const response = NextResponse.json(
        { error: 'رقم الهاتف غير صالح' },
        { status: 400 }
      );
      return addSecurityHeaders(response);
    }

    // Set expiry to 24 hours from now
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Check if phone already has an active verification
    const existingVerification = await prisma.phoneVerification.findFirst({
      where: {
        phoneNumber: normalizedPhone,
        verified: true,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (existingVerification) {
      // Update existing verification
      await prisma.phoneVerification.update({
        where: { id: existingVerification.id },
        data: {
          firebaseUid,
          verifiedAt: new Date(),
          expiresAt, // Extend expiry
        },
      });

      const response = NextResponse.json({
        success: true,
        message: 'تم تحديث التحقق من رقم الهاتف',
        expiresAt: expiresAt.toISOString(),
      });
      return addSecurityHeaders(response);
    }

    // Delete any old unverified records for this phone
    await prisma.phoneVerification.deleteMany({
      where: {
        phoneNumber: normalizedPhone,
        verified: false,
      },
    });

    // Also delete expired verified records
    await prisma.phoneVerification.deleteMany({
      where: {
        phoneNumber: normalizedPhone,
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    // Create new verification record
    await prisma.phoneVerification.create({
      data: {
        phoneNumber: normalizedPhone,
        firebaseUid,
        verified: true,
        verifiedAt: new Date(),
        expiresAt,
      },
    });

    const response = NextResponse.json({
      success: true,
      message: 'تم التحقق من رقم الهاتف بنجاح',
      expiresAt: expiresAt.toISOString(),
    });
    return addSecurityHeaders(response);

  } catch (error) {
    console.error('Phone verification confirm error:', error);
    const response = NextResponse.json(
      { error: 'حدث خطأ في حفظ التحقق' },
      { status: 500 }
    );
    return addSecurityHeaders(response);
  }
}
