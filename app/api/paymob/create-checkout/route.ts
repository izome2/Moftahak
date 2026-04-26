import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { Prisma } from '@/generated/prisma';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rate-limit';
import { addSecurityHeaders } from '@/lib/security-headers';
import {
  assertPaymobCheckoutConfigured,
  createPaymobPaymentIntention,
  PaymobConfigurationError,
  PaymobRequestError,
} from '@/lib/paymob';

export const runtime = 'nodejs';

const createCheckoutSchema = z.object({
  courseSlug: z.string().min(1),
  user: z.object({
    name: z.string().min(2).max(200),
    email: z.string().email(),
    phone: z.string().min(10).max(20),
  }),
});

function normalizeInternationalPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');

  if (digits.startsWith('01') && digits.length === 11) {
    return `20${digits.slice(1)}`;
  }

  if (digits.startsWith('1') && digits.length === 10) {
    return `20${digits}`;
  }

  return digits;
}

function isSupportedInternationalPhone(phone: string): boolean {
  return (
    (phone.startsWith('20') && phone.length === 12) ||
    (phone.startsWith('966') && phone.length === 12)
  );
}

function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const firstName = parts[0] || 'Customer';
  const lastName = parts.slice(1).join(' ') || firstName;
  return { firstName, lastName };
}

function getAppUrl(request: NextRequest): string {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, '');
  }

  const requestUrl = new URL(request.url);
  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  const protocol = request.headers.get('x-forwarded-proto') || requestUrl.protocol.replace(':', '');

  return host ? `${protocol}://${host}` : requestUrl.origin;
}

function jsonError(message: string, status: number) {
  return addSecurityHeaders(NextResponse.json({ success: false, error: message }, { status }));
}

function toJsonObject(value: unknown): Prisma.InputJsonObject {
  return JSON.parse(JSON.stringify(value ?? {})) as Prisma.InputJsonObject;
}

export async function POST(request: NextRequest) {
  let paymentId: string | null = null;

  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const { allowed } = checkRateLimit(ip, {
      windowMs: 15 * 60 * 1000,
      maxRequests: 5,
    });

    if (!allowed) {
      return jsonError('تم إرسال عدد كبير من الطلبات. يرجى المحاولة لاحقاً.', 429);
    }

    const session = await auth();
    if (!session?.user?.id) {
      return jsonError('يجب تسجيل الدخول قبل الدفع', 401);
    }

    const body = await request.json();
    const parsed = createCheckoutSchema.safeParse(body);

    if (!parsed.success) {
      return addSecurityHeaders(
        NextResponse.json(
          { success: false, error: 'بيانات الدفع غير صالحة', details: parsed.error.issues },
          { status: 400 }
        )
      );
    }

    const { courseSlug, user } = parsed.data;
    const normalizedPhone = normalizeInternationalPhone(user.phone);

    if (!isSupportedInternationalPhone(normalizedPhone)) {
      return jsonError('رقم الهاتف يجب أن يكون بصيغة دولية صحيحة', 400);
    }

    const phoneVerification = await prisma.phoneVerification.findFirst({
      where: {
        phoneNumber: normalizedPhone,
        verified: true,
        expiresAt: { gt: new Date() },
      },
      orderBy: { verifiedAt: 'desc' },
    });

    if (!phoneVerification) {
      return jsonError('يجب تأكيد رقم الهاتف أولًا قبل الدفع', 400);
    }

    const course = await prisma.course.findFirst({
      where: {
        slug: courseSlug,
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        currency: true,
      },
    });

    if (!course) {
      return jsonError('الدورة غير موجودة', 404);
    }

    if (course.price <= 0) {
      return jsonError('لا يمكن الدفع لهذه الدورة حاليًا', 400);
    }

    const currency = (process.env.PAYMOB_CURRENCY || course.currency || 'EGP').toUpperCase();
    if (currency !== 'EGP') {
      return jsonError('لا يمكن الدفع لهذه الدورة حاليًا', 400);
    }

    const existingEnrollment = await prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: course.id,
        },
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (existingEnrollment?.status === 'CONFIRMED') {
      return jsonError('أنت مشترك بالفعل في هذه الدورة', 409);
    }

    const amountCents = Math.round(course.price * 100);
    const appUrl = getAppUrl(request);
    const returnUrl = `${appUrl}/payment/paymob-return?courseSlug=${encodeURIComponent(course.slug)}`;
    const webhookUrl = `${appUrl}/api/paymob/webhook`;
    const billingName = user.name.trim();
    const { firstName, lastName } = splitFullName(billingName);

    assertPaymobCheckoutConfigured();

    const payment = await prisma.coursePayment.create({
      data: {
        userId: session.user.id,
        courseId: course.id,
        amount: course.price,
        currency,
        phone: normalizedPhone,
        billingName,
        billingEmail: user.email.toLowerCase().trim(),
        status: 'PENDING',
        provider: 'PAYMOB',
        metadata: {
          courseSlug: course.slug,
          source: 'course_enroll_checkout',
        },
      },
    });
    paymentId = payment.id;

    const intention = await createPaymobPaymentIntention({
      amountCents,
      currency,
      specialReference: payment.id,
      notificationUrl: webhookUrl,
      redirectionUrl: returnUrl,
      billingData: {
        first_name: firstName,
        last_name: lastName,
        email: user.email.toLowerCase().trim(),
        phone_number: `+${normalizedPhone}`,
        apartment: 'NA',
        floor: 'NA',
        street: 'NA',
        building: 'NA',
        city: 'Cairo',
        country: 'EG',
      },
      items: [
        {
          name: course.title,
          amount: amountCents,
          description: course.title,
          quantity: 1,
        },
      ],
      extras: {
        coursePaymentId: payment.id,
        courseId: course.id,
        courseSlug: course.slug,
        userId: session.user.id,
      },
    });

    await prisma.coursePayment.update({
      where: { id: payment.id },
      data: {
        providerOrderId: intention.providerOrderId,
        checkoutUrl: intention.checkoutUrl,
        clientSecret: intention.clientSecret,
        metadata: {
          courseSlug: course.slug,
          source: 'course_enroll_checkout',
          paymob: toJsonObject(intention.raw),
        },
      },
    });

    return addSecurityHeaders(
      NextResponse.json({
        success: true,
        checkoutUrl: intention.checkoutUrl,
        clientSecret: intention.clientSecret,
      })
    );
  } catch (error) {
    if (paymentId) {
      await prisma.coursePayment
        .update({
          where: { id: paymentId },
          data: {
            status: 'FAILED',
            metadata: {
              source: 'course_enroll_checkout',
              error: error instanceof Error ? error.message : 'Unknown checkout error',
            },
          },
        })
        .catch(() => undefined);
    }

    if (error instanceof PaymobConfigurationError) {
      console.error('Paymob configuration error:', error.message);
      return jsonError('لا يمكن الدفع لهذه الدورة حاليًا', 503);
    }

    if (error instanceof PaymobRequestError) {
      console.error('Paymob checkout error:', error.message);
      return jsonError('حدث خطأ أثناء تجهيز الدفع، حاول مرة أخرى', 502);
    }

    console.error('Create Paymob checkout error:', error);
    return jsonError('حدث خطأ أثناء تجهيز الدفع، حاول مرة أخرى', 500);
  }
}
