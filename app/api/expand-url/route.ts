import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    // Follow redirects to get the final URL
    const response = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
    });

    // The final URL after redirects
    const expandedUrl = response.url;

    return NextResponse.json({ expandedUrl });
  } catch (error) {
    console.error('Error expanding URL:', error);
    return NextResponse.json({ error: 'Failed to expand URL' }, { status: 500 });
  }
}
