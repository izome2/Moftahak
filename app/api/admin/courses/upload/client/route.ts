import { NextRequest, NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { auth } from '@/lib/auth';
import { addSecurityHeaders } from '@/lib/security-headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_VIDEO_SIZE = 500 * 1024 * 1024; // 500MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const VALID_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
];

const VALID_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

type UploadPayload = {
  type: 'video' | 'image' | 'thumbnail';
  courseId?: string;
};

function json(data: unknown, init?: ResponseInit) {
  return addSecurityHeaders(NextResponse.json(data, init));
}

function parseClientPayload(clientPayload: string | null): UploadPayload | null {
  if (!clientPayload) return null;

  try {
    const payload = JSON.parse(clientPayload) as Partial<UploadPayload>;
    if (!payload.type || !['video', 'image', 'thumbnail'].includes(payload.type)) {
      return null;
    }

    return {
      type: payload.type,
      courseId: typeof payload.courseId === 'string' ? payload.courseId : undefined,
    };
  } catch {
    return null;
  }
}

function pathnameMatchesType(pathname: string, type: UploadPayload['type']) {
  if (pathname.includes('..') || pathname.startsWith('/')) return false;

  if (type === 'video') {
    return pathname.startsWith('courses/videos/');
  }

  return pathname.startsWith('courses/images/');
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return json(
        { error: 'رفع الفيديو على السيرفر يحتاج إعداد BLOB_READ_WRITE_TOKEN' },
        { status: 503 }
      );
    }

    const body = (await request.json()) as HandleUploadBody;

    if (body.type === 'blob.generate-client-token') {
      const session = await auth();
      if (!session || session.user?.role !== 'ADMIN') {
        return json({ error: 'غير مصرح' }, { status: 403 });
      }
    } else if (body.type !== 'blob.upload-completed') {
      return json({ error: 'نوع طلب الرفع غير صالح' }, { status: 400 });
    }

    const response = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async (pathname, clientPayload, multipart) => {
        const payload = parseClientPayload(clientPayload);
        if (!payload) {
          throw new Error('بيانات الرفع غير صالحة');
        }

        if (!pathnameMatchesType(pathname, payload.type)) {
          throw new Error('مسار الملف غير صالح');
        }

        const isVideo = payload.type === 'video';
        if (isVideo && !multipart) {
          throw new Error('يجب استخدام الرفع المجزأ للفيديو');
        }

        return {
          allowedContentTypes: isVideo ? VALID_VIDEO_TYPES : VALID_IMAGE_TYPES,
          maximumSizeInBytes: isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE,
          addRandomSuffix: false,
          allowOverwrite: false,
          cacheControlMaxAge: 60 * 60 * 24 * 365,
          tokenPayload: JSON.stringify({
            type: payload.type,
            courseId: payload.courseId ?? null,
          }),
        };
      },
    });

    return json(response);
  } catch (error) {
    console.error('Client upload error:', error);

    const message =
      error instanceof Error && error.message
        ? error.message
        : 'حدث خطأ أثناء تجهيز رفع الملف';

    return json({ error: message }, { status: 400 });
  }
}
