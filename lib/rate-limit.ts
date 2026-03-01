/**
 * Rate Limiting Middleware - حماية من Brute Force
 * استخدمها في API routes الحساسة (login, register, password change)
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export interface RateLimitConfig {
  windowMs?: number; // مدة النافذة بالميلي ثانية (افتراضي: 15 دقيقة)
  maxRequests?: number; // عدد الطلبات المسموح (افتراضي: 5)
}

/**
 * تحقق من Rate Limit لـ IP معين
 */
export function checkRateLimit(
  identifier: string, // IP address أو user ID
  config: RateLimitConfig = {}
): { allowed: boolean; remaining: number; resetTime: number } {
  const windowMs = config.windowMs || 15 * 60 * 1000; // 15 minutes
  const maxRequests = config.maxRequests || 5;
  const now = Date.now();

  // نظافة البيانات القديمة (كل 10 دقائق)
  cleanupOldEntries(now);

  // الحصول على السجل الحالي
  const record = store[identifier];

  if (!record || now > record.resetTime) {
    // إنشاء سجل جديد
    store[identifier] = {
      count: 1,
      resetTime: now + windowMs,
    };
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs,
    };
  }

  // زيادة العداد
  record.count++;

  if (record.count > maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetTime: record.resetTime,
  };
}

/**
 * تنظيف السجلات القديمة
 */
function cleanupOldEntries(now: number) {
  const keys = Object.keys(store);
  for (const key of keys) {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  }
}

/**
 * إعادة تعيين rate limit لمستخدم معين (للاختبار)
 */
export function resetRateLimit(identifier: string) {
  delete store[identifier];
}

/**
 * الحصول على IP من request
 */
export function getClientIP(request: Request): string {
  // محاولة الحصول على IP من headers مختلفة
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIp) {
    return realIp;
  }
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  return 'unknown';
}
