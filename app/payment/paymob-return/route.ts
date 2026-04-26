import { NextRequest, NextResponse } from 'next/server';

export function GET(request: NextRequest) {
  const url = new URL(request.url);
  const courseSlug = url.searchParams.get('courseSlug') || '';
  const successParam = url.searchParams.get('success');
  const success = successParam === 'true' || successParam === 'True' || successParam === '1';

  if (success && courseSlug) {
    return NextResponse.redirect(new URL(`/courses/${encodeURIComponent(courseSlug)}/payment-success`, url.origin));
  }

  const failedUrl = new URL('/payment/failed', url.origin);
  if (courseSlug) {
    failedUrl.searchParams.set('courseSlug', courseSlug);
  }

  return NextResponse.redirect(failedUrl);
}
