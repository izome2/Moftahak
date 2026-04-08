/**
 * Accounting Auth Helpers - الطبقة الثانية من الحماية
 * يُستخدم داخل كل API route لنظام الحسابات
 * 
 * نمط الاستخدام:
 * ```ts
 * const authResult = await requireAccountingAuth(request, 'canAddBookings');
 * if (authResult.error) return authResult.error;
 * const { session, userId } = authResult;
 * ```
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { hasPermission, hasAnyPermission, isAccountingRole, getEffectiveAccountingRole, getAllEffectiveRoles } from '@/lib/permissions';
import type { Permission } from '@/lib/permissions';
import { checkRateLimit } from '@/lib/rate-limit';
import { addSecurityHeaders } from '@/lib/security-headers';
import type { Session } from 'next-auth';

// ============================================================================
// أنواع الاستجابة
// ============================================================================

interface AuthSuccess {
  session: Session;
  userId: string;
  role: string;
  error: null;
}

interface AuthError {
  session: null;
  userId: null;
  role: null;
  error: NextResponse;
}

type AuthResult = AuthSuccess | AuthError;

// ============================================================================
// دوال مساعدة للردود
// ============================================================================

function jsonError(message: string, status: number): NextResponse {
  const response = NextResponse.json({ error: message }, { status });
  return addSecurityHeaders(response);
}

function json<T>(data: T, status = 200): NextResponse {
  const response = NextResponse.json(data, { status });
  return addSecurityHeaders(response);
}

// ============================================================================
// التحقق الأساسي - هل المستخدم مسجل + دور حسابات؟
// ============================================================================

/**
 * التحقق من أن المستخدم مسجل ولديه دور حسابات
 * بدون فحص صلاحية محددة
 */
export async function requireAccountingSession(): Promise<AuthResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      session: null,
      userId: null,
      role: null,
      error: jsonError('غير مصرح - يجب تسجيل الدخول', 401),
    };
  }

  const role = session.user.role;
  const additionalRoles = (session.user as { additionalRoles?: string[] }).additionalRoles || [];

  // التحقق من وجود أي دور حسابات (أساسي أو إضافي)
  const allRoles = getAllEffectiveRoles(role, additionalRoles);
  if (allRoles.length === 0) {
    return {
      session: null,
      userId: null,
      role: null,
      error: jsonError('ليس لديك صلاحية الوصول لنظام الحسابات', 403),
    };
  }

  return {
    session,
    userId: session.user.id,
    role,
    error: null,
  };
}

// ============================================================================
// التحقق مع صلاحية محددة
// ============================================================================

/**
 * التحقق من الجلسة + صلاحية واحدة محددة
 * 
 * @example
 * const result = await requireAccountingAuth('canAddBookings');
 * if (result.error) return result.error;
 */
export async function requireAccountingAuth(
  permission: keyof Permission
): Promise<AuthResult> {
  const sessionResult = await requireAccountingSession();
  if (sessionResult.error) return sessionResult;

  const additionalRoles = (sessionResult.session?.user as { additionalRoles?: string[] })?.additionalRoles || [];
  if (!hasPermission(sessionResult.role, permission, additionalRoles)) {
    return {
      session: null,
      userId: null,
      role: null,
      error: jsonError('ليس لديك الصلاحية المطلوبة لهذا الإجراء', 403),
    };
  }

  return sessionResult;
}

/**
 * التحقق من الجلسة + أي صلاحية من قائمة
 * مفيد للمسارات المشتركة بين عدة أدوار
 * 
 * @example
 * const result = await requireAnyAccountingAuth(['canViewBookings', 'canAddBookings']);
 * if (result.error) return result.error;
 */
export async function requireAnyAccountingAuth(
  permissions: (keyof Permission)[]
): Promise<AuthResult> {
  const sessionResult = await requireAccountingSession();
  if (sessionResult.error) return sessionResult;

  const additionalRoles = (sessionResult.session?.user as { additionalRoles?: string[] })?.additionalRoles || [];
  if (!hasAnyPermission(sessionResult.role, permissions, additionalRoles)) {
    return {
      session: null,
      userId: null,
      role: null,
      error: jsonError('ليس لديك الصلاحية المطلوبة لهذا الإجراء', 403),
    };
  }

  return sessionResult;
}

// ============================================================================
// مساعدات Rate Limiting
// ============================================================================

/**
 * التحقق من rate limit مع رسائل عربية
 */
export function checkAccountingRateLimit(
  request: NextRequest,
  options?: { maxRequests?: number; windowMs?: number }
): NextResponse | null {
  // تجاوز Rate Limit في بيئة الاختبار
  const bypass = request.headers.get('x-test-bypass-ratelimit');
  if (bypass === 'moftahak-test-2026' && process.env.NODE_ENV !== 'production') {
    return null;
  }

  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const path = request.nextUrl.pathname;
  const identifier = `${ip}:${path}`;
  const { allowed } = checkRateLimit(identifier, {
    maxRequests: options?.maxRequests ?? 30,
    windowMs: options?.windowMs ?? 60 * 1000, // 1 minute default
  });

  if (!allowed) {
    return jsonError('طلبات كثيرة جداً - حاول مرة أخرى لاحقاً', 429);
  }

  return null;
}

// ============================================================================
// دوال مساعدة عامة
// ============================================================================

/** استجابة نجاح مع security headers */
export function successResponse<T>(data: T, status = 200): NextResponse {
  return json(data, status);
}

/** استجابة خطأ مع security headers */
export function errorResponse(message: string, status = 400): NextResponse {
  return jsonError(message, status);
}

/** استجابة 404 */
export function notFoundResponse(entity = 'العنصر'): NextResponse {
  return jsonError(`${entity} غير موجود`, 404);
}
