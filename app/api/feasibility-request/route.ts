import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { feasibilityRequestSchema } from '@/lib/validations/feasibility-request';
import { checkRateLimit } from '@/lib/rate-limit';
import { addSecurityHeaders } from '@/lib/security-headers';

// توليد رمز دفع فريد (6 أحرف وأرقام)
function generatePaymentCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // بدون O/0/I/1 لتجنب الالتباس
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// التأكد من أن رمز الدفع فريد
async function generateUniquePaymentCode(): Promise<string> {
  let code: string;
  let exists = true;
  let attempts = 0;
  const maxAttempts = 10;
  
  while (exists && attempts < maxAttempts) {
    code = generatePaymentCode();
    const existingRequest = await prisma.feasibilityRequest.findUnique({
      where: { paymentCode: code },
    });
    exists = !!existingRequest;
    attempts++;
  }
  
  if (exists) {
    // في حالة نادرة جداً، استخدم timestamp
    return `${generatePaymentCode()}${Date.now().toString(36).slice(-2).toUpperCase()}`;
  }
  
  return code!;
}

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
    
    console.log('Received request body:', JSON.stringify(body, null, 2));

    // Check if phone is verified first (before validation)
    if (!body.isPhoneVerified) {
      const response = NextResponse.json(
        { error: 'يرجى التحقق من رقم الهاتف' },
        { status: 400 }
      );
      return addSecurityHeaders(response);
    }

    // Validate request data
    const validationResult = feasibilityRequestSchema.safeParse(body);

    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error);
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

    // Normalize phone number
    const normalizedPhone = body.phoneNumber.replace(/\D/g, '');

    // Verify phone was actually verified in database (within last 24 hours)
    const phoneVerification = await prisma.phoneVerification.findFirst({
      where: {
        phoneNumber: normalizedPhone,
        verified: true,
        expiresAt: {
          gt: new Date(), // التحقق لم تنتهِ صلاحيته بعد
        },
      },
      orderBy: {
        verifiedAt: 'desc',
      },
    });

    if (!phoneVerification) {
      const response = NextResponse.json(
        { error: 'انتهت صلاحية التحقق من رقم الهاتف. يرجى إعادة التحقق.' },
        { status: 400 }
      );
      return addSecurityHeaders(response);
    }

    // توليد رمز دفع فريد
    const paymentCode = await generateUniquePaymentCode();
    
    console.log('Creating feasibility request with data:', {
      fullName: data.fullName,
      phone: normalizedPhone,
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
      paymentCode: paymentCode,
    });

    // Create feasibility request in database
    const feasibilityRequest = await prisma.feasibilityRequest.create({
      data: {
        fullName: data.fullName,
        phone: normalizedPhone,
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
        phoneVerified: true,
        status: 'PENDING',
        paymentCode: paymentCode,
      },
    });

    // Don't delete phone verification - it's valid for 24 hours and can be reused
    // Clean up old expired verifications instead (via cron job)

    const response = NextResponse.json(
      { 
        success: true,
        message: 'تم إرسال طلبك بنجاح. سيتواصل معك فريقنا قريباً.',
        requestId: feasibilityRequest.id,
        paymentCode: feasibilityRequest.paymentCode,
      },
      { status: 201 }
    );

    return addSecurityHeaders(response);
  } catch (error) {
    console.error('Error creating feasibility request:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    const response = NextResponse.json(
      { 
        error: 'حدث خطأ في الخادم. يرجى المحاولة مرة أخرى.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
    return addSecurityHeaders(response);
  }
}
