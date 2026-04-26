import { NextResponse } from 'next/server';
import { addSecurityHeaders } from '@/lib/security-headers';

// الاشتراك اليدوي القديم تم تعطيله بعد نقل اشتراك الدورات إلى Paymob Checkout.
export async function POST() {
  return addSecurityHeaders(
    NextResponse.json(
      {
        success: false,
        error: 'تم تعطيل طلبات الاشتراك اليدوية. يرجى استخدام زر الدفع الآن.',
      },
      { status: 410 }
    )
  );
}
