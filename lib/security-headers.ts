/**
 * Security Headers - إضافة headers أمنية للاستجابات
 */

import { NextResponse } from 'next/server';

export function addSecurityHeaders(response: NextResponse): NextResponse {
  // منع XSS
  response.headers.set(
    'X-Content-Type-Options',
    'nosniff'
  );

  // منع Clickjacking
  response.headers.set(
    'X-Frame-Options',
    'DENY'
  );

  // XSS Protection
  response.headers.set(
    'X-XSS-Protection',
    '1; mode=block'
  );

  // Referrer Policy
  response.headers.set(
    'Referrer-Policy',
    'strict-origin-when-cross-origin'
  );

  // Content Security Policy (CSP)
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
  );

  // Permissions Policy
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  return response;
}

/**
 * دالة مساعدة لإنشاء استجابة JSON مع security headers
 */
export function secureJsonResponse(data: any, init?: ResponseInit) {
  const response = NextResponse.json(data, init);
  return addSecurityHeaders(response);
}
