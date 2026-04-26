import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import type { Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import { addSecurityHeaders } from '@/lib/security-headers';

export const runtime = 'nodejs';

const TRANSACTION_HMAC_FIELDS = [
  'amount_cents',
  'created_at',
  'currency',
  'error_occured',
  'has_parent_transaction',
  'id',
  'integration_id',
  'is_3d_secure',
  'is_auth',
  'is_capture',
  'is_refunded',
  'is_standalone_payment',
  'is_voided',
  'order.id',
  'owner',
  'pending',
  'source_data.pan',
  'source_data.sub_type',
  'source_data.type',
  'success',
] as const;

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as JsonRecord) : null;
}

function readPath(obj: JsonRecord, path: string): unknown {
  if (path === 'order.id') {
    const order = obj.order;
    if (typeof order === 'string' || typeof order === 'number') {
      return order;
    }

    const orderRecord = asRecord(order);
    return orderRecord?.id;
  }

  return path.split('.').reduce<unknown>((current, key) => {
    const record = asRecord(current);
    return record ? record[key] : undefined;
  }, obj);
}

function stringifyHmacValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return String(value);
}

function computeTransactionHmac(obj: JsonRecord, secret: string): string {
  const payload = TRANSACTION_HMAC_FIELDS.map((field) => stringifyHmacValue(readPath(obj, field))).join('');
  return crypto.createHmac('sha512', secret).update(payload).digest('hex');
}

function safeCompareHex(a: string, b: string): boolean {
  try {
    const aBuffer = Buffer.from(a.toLowerCase(), 'hex');
    const bBuffer = Buffer.from(b.toLowerCase(), 'hex');
    return aBuffer.length === bBuffer.length && crypto.timingSafeEqual(aBuffer, bBuffer);
  } catch {
    return false;
  }
}

function boolValue(value: unknown): boolean {
  return value === true || value === 'true' || value === 'True' || value === 1 || value === '1';
}

function stringValue(value: unknown): string | undefined {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }
  return undefined;
}

function getOrderId(obj: JsonRecord): string | undefined {
  return stringValue(readPath(obj, 'order.id'));
}

function getLocalPaymentReference(obj: JsonRecord): string | undefined {
  const directReference = stringValue(obj.special_reference) || stringValue(obj.merchant_order_id);
  if (directReference) return directReference;

  const order = asRecord(obj.order);
  const orderReference =
    stringValue(order?.merchant_order_id) ||
    stringValue(order?.special_reference) ||
    stringValue(order?.merchantOrderId);
  if (orderReference) return orderReference;

  const extras =
    asRecord(obj.extras) ||
    asRecord(obj.extra) ||
    asRecord(asRecord(obj.payment_key_claims)?.extra) ||
    asRecord(asRecord(obj.payment_key_claims)?.extras);

  return (
    stringValue(extras?.coursePaymentId) ||
    stringValue(extras?.course_payment_id) ||
    stringValue(extras?.paymentId)
  );
}

function paymentStatusFromCallback(obj: JsonRecord): 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' {
  const success = boolValue(obj.success);
  const pending = boolValue(obj.pending);
  const errorOccurred = boolValue(obj.error_occured);
  const voided = boolValue(obj.is_voided);
  const refunded = boolValue(obj.is_refunded);

  if (voided || refunded) return 'CANCELLED';
  if (pending) return 'PENDING';
  if (success && !errorOccurred) return 'PAID';
  return 'FAILED';
}

function generatePaymentCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function generateUniquePaymentCode(tx: Prisma.TransactionClient): Promise<string> {
  let code = '';

  for (let attempts = 0; attempts < 10; attempts++) {
    code = generatePaymentCode();
    const existing = await tx.courseEnrollment.findUnique({
      where: { paymentCode: code },
      select: { id: true },
    });

    if (!existing) return code;
  }

  return `${generatePaymentCode()}${Date.now().toString(36).slice(-2).toUpperCase()}`;
}

function safeJsonObject(value: unknown): Prisma.InputJsonObject {
  return JSON.parse(JSON.stringify(value ?? {})) as Prisma.InputJsonObject;
}

async function findPayment(obj: JsonRecord) {
  const localReference = getLocalPaymentReference(obj);
  const transactionId = stringValue(obj.id);
  const orderId = getOrderId(obj);

  if (localReference) {
    const payment = await prisma.coursePayment.findUnique({
      where: { id: localReference },
    });
    if (payment) return payment;
  }

  if (transactionId) {
    const payment = await prisma.coursePayment.findUnique({
      where: { providerTransactionId: transactionId },
    });
    if (payment) return payment;
  }

  if (orderId) {
    return prisma.coursePayment.findFirst({
      where: { providerOrderId: orderId },
    });
  }

  return null;
}

export async function POST(request: NextRequest) {
  try {
    const hmacSecret = process.env.PAYMOB_HMAC_SECRET?.trim();
    if (!hmacSecret) {
      return addSecurityHeaders(
        NextResponse.json({ success: false, error: 'Paymob HMAC is not configured' }, { status: 503 })
      );
    }

    const body = (await request.json()) as JsonRecord;
    const obj = asRecord(body.obj) || body;
    const receivedHmac =
      request.nextUrl.searchParams.get('hmac') ||
      stringValue(body.hmac) ||
      stringValue(obj.hmac);

    if (!receivedHmac) {
      return addSecurityHeaders(
        NextResponse.json({ success: false, error: 'Missing HMAC' }, { status: 400 })
      );
    }

    const calculatedHmac = computeTransactionHmac(obj, hmacSecret);
    if (!safeCompareHex(calculatedHmac, receivedHmac)) {
      return addSecurityHeaders(
        NextResponse.json({ success: false, error: 'Invalid HMAC' }, { status: 401 })
      );
    }

    const payment = await findPayment(obj);
    if (!payment) {
      return addSecurityHeaders(
        NextResponse.json({ success: false, error: 'Payment not found' }, { status: 404 })
      );
    }

    const callbackStatus = paymentStatusFromCallback(obj);
    const transactionId = stringValue(obj.id);
    const orderId = getOrderId(obj);
    const callbackAmountCents = Number(stringValue(obj.amount_cents) || 0);
    const expectedAmountCents = Math.round(payment.amount * 100);
    const callbackCurrency = stringValue(obj.currency)?.toUpperCase();
    const expectedCurrency = payment.currency.toUpperCase();
    const callbackMetadata: Prisma.InputJsonObject = {
      source: 'paymob_webhook',
      callback: safeJsonObject(body),
    };

    if (
      callbackStatus === 'PAID' &&
      (callbackAmountCents !== expectedAmountCents || callbackCurrency !== expectedCurrency)
    ) {
      await prisma.coursePayment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          providerOrderId: orderId || payment.providerOrderId,
          providerTransactionId: transactionId || payment.providerTransactionId,
          metadata: {
            ...callbackMetadata,
            mismatch: {
              expectedAmountCents,
              callbackAmountCents,
              expectedCurrency,
              callbackCurrency: callbackCurrency || null,
            },
          },
        },
      });

      return addSecurityHeaders(
        NextResponse.json({ success: false, error: 'Payment amount mismatch' }, { status: 400 })
      );
    }

    if (callbackStatus !== 'PAID') {
      await prisma.coursePayment.update({
        where: { id: payment.id },
        data: {
          status: callbackStatus,
          providerOrderId: orderId || payment.providerOrderId,
          providerTransactionId: transactionId || payment.providerTransactionId,
          metadata: callbackMetadata,
        },
      });

      return addSecurityHeaders(NextResponse.json({ success: true }));
    }

    await prisma.$transaction(async (tx) => {
      const paidPayment = await tx.coursePayment.update({
        where: { id: payment.id },
        data: {
          status: 'PAID',
          providerOrderId: orderId || payment.providerOrderId,
          providerTransactionId: transactionId || payment.providerTransactionId,
          metadata: callbackMetadata,
        },
      });

      const existingEnrollment = await tx.courseEnrollment.findUnique({
        where: {
          userId_courseId: {
            userId: paidPayment.userId,
            courseId: paidPayment.courseId,
          },
        },
        select: {
          id: true,
          status: true,
          paymentId: true,
        },
      });

      if (!existingEnrollment) {
        await tx.courseEnrollment.create({
          data: {
            userId: paidPayment.userId,
            courseId: paidPayment.courseId,
            paymentId: paidPayment.id,
            phone: paidPayment.phone,
            phoneVerified: true,
            amount: paidPayment.amount,
            status: 'CONFIRMED',
            paymentCode: await generateUniquePaymentCode(tx),
          },
        });
        return;
      }

      if (existingEnrollment.status !== 'CONFIRMED') {
        await tx.courseEnrollment.update({
          where: { id: existingEnrollment.id },
          data: {
            status: 'CONFIRMED',
            paymentId: paidPayment.id,
            phone: paidPayment.phone,
            phoneVerified: true,
            amount: paidPayment.amount,
          },
        });
        return;
      }

      if (!existingEnrollment.paymentId) {
        await tx.courseEnrollment.update({
          where: { id: existingEnrollment.id },
          data: { paymentId: paidPayment.id },
        });
      }
    });

    return addSecurityHeaders(NextResponse.json({ success: true }));
  } catch (error) {
    console.error('Paymob webhook error:', error);
    return addSecurityHeaders(
      NextResponse.json({ success: false, error: 'Webhook processing failed' }, { status: 500 })
    );
  }
}
