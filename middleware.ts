import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// مسارات محمية - تحتاج تسجيل دخول
const protectedPaths = ['/admin', '/profile', '/accounting'];

// مسارات خاصة بالأدمن فقط
const adminOnlyPaths = ['/admin'];

// ============================================================================
// خريطة صلاحيات مسارات نظام الحسابات (الطبقة الأولى)
// ============================================================================
type AccountingRole = 'GENERAL_MANAGER' | 'OPS_MANAGER' | 'BOOKING_MANAGER' | 'INVESTOR';

const ACCOUNTING_ROLES: AccountingRole[] = [
  'GENERAL_MANAGER', 'OPS_MANAGER', 'BOOKING_MANAGER', 'INVESTOR',
];

/** ADMIN يُعامَل كـ GENERAL_MANAGER في نظام الحسابات */
function getEffectiveRole(role: string | undefined): string | undefined {
  return role === 'ADMIN' ? 'GENERAL_MANAGER' : role;
}

/** الأدوار المسموح لها بالوصول لكل مسار حسابات */
const accountingPageAccess: Record<string, AccountingRole[]> = {
  '/accounting':               ['GENERAL_MANAGER', 'OPS_MANAGER', 'BOOKING_MANAGER'],
  '/accounting/apartments':    ['GENERAL_MANAGER', 'OPS_MANAGER', 'BOOKING_MANAGER'],
  '/accounting/bookings':      ['GENERAL_MANAGER', 'BOOKING_MANAGER'],
  '/accounting/expenses':      ['GENERAL_MANAGER', 'OPS_MANAGER'],
  '/accounting/daily':         ['GENERAL_MANAGER', 'OPS_MANAGER'],
  '/accounting/custody':       ['GENERAL_MANAGER', 'OPS_MANAGER'],
  '/accounting/investors':     ['GENERAL_MANAGER'],
  '/accounting/my-investments': ['INVESTOR'],
  '/accounting/reports':       ['GENERAL_MANAGER'],
  '/accounting/settings':      ['GENERAL_MANAGER'],
};

function canAccessAccountingPath(role: string | undefined, pathname: string): boolean {
  if (!role) return false;
  
  // ابحث عن أطول مسار مطابق (الأكثر تحديداً)
  let matchedPath = '';
  for (const path of Object.keys(accountingPageAccess)) {
    if (pathname.startsWith(path) && path.length > matchedPath.length) {
      matchedPath = path;
    }
  }
  
  if (!matchedPath) return false;
  
  const allowedRoles = accountingPageAccess[matchedPath];
  return allowedRoles.includes(role as AccountingRole);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // الحصول على التوكن بدلاً من الجلسة الكاملة (يعمل في Edge Runtime)
  // NextAuth v5 يدعم كلاً من AUTH_SECRET و NEXTAUTH_SECRET
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  
  const token = await getToken({ 
    req: request,
    secret: secret,
    secureCookie: process.env.NODE_ENV === 'production',
  });
  
  // Log للتشخيص في بيئة الإنتاج
  console.log('Middleware - Path:', pathname);
  console.log('Middleware - Token exists:', !!token);
  console.log('Middleware - Token role:', token?.role);
  
  // التحقق من المسارات المحمية
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  const isAdminPath = adminOnlyPaths.some(path => pathname.startsWith(path));
  const isAccountingPath = pathname.startsWith('/accounting');
  const isAccountingApi = pathname.startsWith('/api/accounting');
  
  // إذا كان المسار محمي ولا يوجد مستخدم مسجل
  if ((isProtectedPath || isAccountingApi) && !token) {
    console.log('Middleware - Redirecting: No token for protected path');
    const url = new URL('/', request.url);
    return NextResponse.redirect(url);
  }
  
  // إذا كان المسار خاص بالأدمن والمستخدم ليس أدمن
  if (isAdminPath && token?.role !== 'ADMIN') {
    console.log('Middleware - Redirecting: Not admin, role is:', token?.role);
    const url = new URL('/', request.url);
    return NextResponse.redirect(url);
  }
  
  // ════════════════════════════════════════════════════════════════════
  // حماية مسارات نظام الحسابات (صفحات)
  // ════════════════════════════════════════════════════════════════════
  if (isAccountingPath) {
    const rawRole = token?.role as string | undefined;
    const role = getEffectiveRole(rawRole);
    
    // يجب أن يكون لديه دور حسابات
    if (!role || !ACCOUNTING_ROLES.includes(role as AccountingRole)) {
      console.log('Middleware - Redirecting: Not an accounting role, role is:', rawRole);
      const url = new URL('/', request.url);
      return NextResponse.redirect(url);
    }
    
    // التحقق من صلاحية الوصول للمسار المحدد
    if (!canAccessAccountingPath(role, pathname)) {
      console.log('Middleware - Redirecting: No access to accounting path:', pathname);
      const url = new URL('/accounting', request.url);
      return NextResponse.redirect(url);
    }
  }
  
  // ════════════════════════════════════════════════════════════════════
  // حماية API نظام الحسابات
  // ════════════════════════════════════════════════════════════════════
  if (isAccountingApi) {
    const rawRole = token?.role as string | undefined;
    const role = getEffectiveRole(rawRole);
    
    // يجب أن يكون لديه دور حسابات
    if (!role || !ACCOUNTING_ROLES.includes(role as AccountingRole)) {
      return NextResponse.json(
        { error: 'ليس لديك صلاحية الوصول لنظام الحسابات' },
        { status: 403 }
      );
    }
  }
  
  return NextResponse.next();
}

// تطبيق Middleware على المسارات المحددة فقط
export const config = {
  matcher: [
    '/admin/:path*',
    '/profile/:path*',
    '/accounting/:path*',
    '/api/admin/:path*',
    '/api/user/:path*',
    '/api/accounting/:path*',
  ],
};
