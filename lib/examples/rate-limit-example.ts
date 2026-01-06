// مثال: كيفية استخدام Rate Limiting في API route
// يمكن تطبيق هذا على app/api/auth/register/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';
import { secureJsonResponse } from '@/lib/security-headers';

export async function POST(request: NextRequest) {
  // 1. فحص Rate Limit
  const clientIP = getClientIP(request);
  const rateLimitResult = checkRateLimit(clientIP, {
    windowMs: 15 * 60 * 1000, // 15 دقيقة
    maxRequests: 5, // 5 محاولات فقط
  });

  if (!rateLimitResult.allowed) {
    return secureJsonResponse(
      {
        success: false,
        message: 'تم تجاوز عدد المحاولات المسموح بها. حاول مرة أخرى لاحقاً',
        retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000),
      },
      { 
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
          'X-RateLimit-Remaining': String(rateLimitResult.remaining),
          'X-RateLimit-Reset': String(rateLimitResult.resetTime),
        }
      }
    );
  }

  // 2. معالجة الطلب العادي
  try {
    // ... باقي الكود
    
    return secureJsonResponse({
      success: true,
      message: 'تم بنجاح'
    });
  } catch (error) {
    return secureJsonResponse(
      { success: false, message: 'حدث خطأ' },
      { status: 500 }
    );
  }
}
