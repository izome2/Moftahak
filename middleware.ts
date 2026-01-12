import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// مسارات محمية - تحتاج تسجيل دخول
const protectedPaths = ['/admin', '/profile'];

// مسارات خاصة بالأدمن فقط
const adminOnlyPaths = ['/admin'];

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
  
  // إذا كان المسار محمي ولا يوجد مستخدم مسجل
  if (isProtectedPath && !token) {
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
  
  return NextResponse.next();
}

// تطبيق Middleware على المسارات المحددة فقط
export const config = {
  matcher: [
    '/admin/:path*',
    '/profile/:path*',
    '/api/admin/:path*',
    '/api/user/:path*',
  ],
};
