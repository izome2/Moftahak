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

/** جمع كل الأدوار الفعلية للمستخدم (الأساسي + الإضافية) */
function getAllEffectiveRoles(token: { role?: unknown; additionalRoles?: unknown }): string[] {
  const roles: string[] = [];
  const primaryRole = getEffectiveRole(token.role as string | undefined);
  if (primaryRole) roles.push(primaryRole);
  
  const additional = token.additionalRoles;
  if (Array.isArray(additional)) {
    for (const r of additional) {
      const effective = getEffectiveRole(r as string);
      if (effective && !roles.includes(effective)) {
        roles.push(effective);
      }
    }
  }
  
  return roles;
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
  '/accounting/audit':         ['GENERAL_MANAGER'],
  '/accounting/backup':        ['GENERAL_MANAGER'],
  '/accounting/month-lock':    ['GENERAL_MANAGER'],
};

function canAccessAccountingPath(roles: string[], pathname: string): boolean {
  if (roles.length === 0) return false;
  
  // ابحث عن أطول مسار مطابق (الأكثر تحديداً)
  let matchedPath = '';
  for (const path of Object.keys(accountingPageAccess)) {
    if (pathname.startsWith(path) && path.length > matchedPath.length) {
      matchedPath = path;
    }
  }
  
  if (!matchedPath) return false;
  
  const allowedRoles = accountingPageAccess[matchedPath];
  return roles.some(role => allowedRoles.includes(role as AccountingRole));
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
  
  // التحقق من المسارات المحمية
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  const isAdminPath = adminOnlyPaths.some(path => pathname.startsWith(path));
  const isAccountingPath = pathname.startsWith('/accounting');
  const isAccountingApi = pathname.startsWith('/api/accounting');
  
  // إذا كان المسار محمي ولا يوجد مستخدم مسجل
  if ((isProtectedPath || isAccountingApi) && !token) {
    const url = new URL('/', request.url);
    return NextResponse.redirect(url);
  }
  
  // إذا كان المسار خاص بالأدمن والمستخدم ليس أدمن
  if (isAdminPath && token?.role !== 'ADMIN') {
    const url = new URL('/', request.url);
    return NextResponse.redirect(url);
  }
  
  // ════════════════════════════════════════════════════════════════════
  // حماية مسارات نظام الحسابات (صفحات)
  // ════════════════════════════════════════════════════════════════════
  if (isAccountingPath) {
    const roles = getAllEffectiveRoles(token as { role?: unknown; additionalRoles?: unknown });
    
    // يجب أن يكون لديه دور حسابات
    const hasAccountingRole = roles.some(r => ACCOUNTING_ROLES.includes(r as AccountingRole));
    if (!hasAccountingRole) {
      const url = new URL('/', request.url);
      return NextResponse.redirect(url);
    }
    
    // التحقق من صلاحية الوصول للمسار المحدد
    if (!canAccessAccountingPath(roles, pathname)) {
      const url = new URL('/accounting', request.url);
      return NextResponse.redirect(url);
    }
  }
  
  // ════════════════════════════════════════════════════════════════════
  // حماية API نظام الحسابات
  // ════════════════════════════════════════════════════════════════════
  if (isAccountingApi) {
    const roles = getAllEffectiveRoles(token as { role?: unknown; additionalRoles?: unknown });
    
    // يجب أن يكون لديه دور حسابات
    const hasAccountingRole = roles.some(r => ACCOUNTING_ROLES.includes(r as AccountingRole));
    if (!hasAccountingRole) {
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
