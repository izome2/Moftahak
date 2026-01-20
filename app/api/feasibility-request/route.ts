import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { feasibilityRequestSchema } from '@/lib/validations/feasibility-request';
import { checkRateLimit } from '@/lib/rate-limit';
import { addSecurityHeaders } from '@/lib/security-headers';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const { allowed, remaining } = checkRateLimit(ip, {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5, // 5 requests per 15 minutes
    });

    if (!allowed) {
      const response = NextResponse.json(
        { error: 'تم إرسال عدد كبير من الطلبات. يرجى المحاولة لاحقاً.' },
        { status: 429 }
      );
      return addSecurityHeaders(response);
    }

    // Parse request body
    const body = await request.json();

    // Validate request data
    const validationResult = feasibilityRequestSchema.safeParse(body);

    if (!validationResult.success) {
      const response = NextResponse.json(
        { 
          error: 'بيانات غير صالحة',
          details: validationResult.error.issues 
        },
        { status: 400 }
      );
      return addSecurityHeaders(response);
    }

    const data = validationResult.data;

    // Check if email is verified
    if (!body.isEmailVerified) {
      const response = NextResponse.json(
        { error: 'يرجى التحقق من البريد الإلكتروني' },
        { status: 400 }
      );
      return addSecurityHeaders(response);
    }

    // Verify email was actually verified in database (within last 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const emailVerification = await prisma.emailVerification.findFirst({
      where: {
        email: data.email.toLowerCase(),
        verified: true,
        verifiedAt: {
          gte: tenMinutesAgo, // التحقق خلال آخر 10 دقائق
        },
      },
      orderBy: {
        verifiedAt: 'desc',
      },
    });

    if (!emailVerification) {
      const response = NextResponse.json(
        { error: 'انتهت صلاحية التحقق من البريد الإلكتروني. يرجى إعادة التحقق.' },
        { status: 400 }
      );
      return addSecurityHeaders(response);
    }

    // Create feasibility request in database
    const feasibilityRequest = await prisma.feasibilityRequest.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        phone: body.phoneNumber || null,
        studyType: data.studyType,
        propertyType: data.propertyType,
        city: data.city,
        district: data.district,
        latitude: body.latitude || null,
        longitude: body.longitude || null,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        livingRooms: data.livingRooms,
        kitchens: data.kitchens,
        emailVerified: true,
        status: 'PENDING',
      },
    });

    // Clean up used email verification records
    await prisma.emailVerification.deleteMany({
      where: {
        email: data.email.toLowerCase(),
      },
    });

    const response = NextResponse.json(
      { 
        success: true,
        message: 'تم إرسال طلبك بنجاح. سيتواصل معك فريقنا قريباً.',
        requestId: feasibilityRequest.id,
      },
      { status: 201 }
    );

    return addSecurityHeaders(response);
  } catch (error) {
    console.error('Error creating feasibility request:', error);
    
    const response = NextResponse.json(
      { error: 'حدث خطأ في الخادم. يرجى المحاولة مرة أخرى.' },
      { status: 500 }
    );
    return addSecurityHeaders(response);
  }
}
