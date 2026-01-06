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
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  // التحقق من المسارات المحمية
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  const isAdminPath = adminOnlyPaths.some(path => pathname.startsWith(path));
  
  // إذا كان المسار محمي ولا يوجد مستخدم مسجل
  if (isProtectedPath && !token) {
    const url = new URL('/', request.url);
    return NextResponse.redirect(url);
  }
  
  // إذا كان المسار خاص بالأدمن والمستخدم ليس أدمن
  if (isAdminPath && token?.role !== 'ADMIN') {
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
