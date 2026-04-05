import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { addSecurityHeaders } from '@/lib/security-headers';
import { createWriteStream } from 'fs';
import { mkdir, unlink, stat } from 'fs/promises';
import { join, dirname } from 'path';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';

// السماح برفع ملفات حتى 500 ميجابايت
export const maxDuration = 120;
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

const useBlob = !!process.env.BLOB_READ_WRITE_TOKEN;

async function uploadToBlob(filename: string, file: File) {
  const { put } = await import('@vercel/blob');
  const blob = await put(filename, file, {
    access: 'public',
    addRandomSuffix: false,
  });
  return { url: blob.url, pathname: blob.pathname };
}

async function uploadToLocal(filename: string, file: File) {
  const uploadsDir = join(process.cwd(), 'public', 'uploads');
  const fullPath = join(uploadsDir, filename);
  await mkdir(dirname(fullPath), { recursive: true });
  
  // استخدام stream بدلاً من arrayBuffer لتجنب مشاكل الذاكرة مع الملفات الكبيرة
  const webStream = file.stream();
  const nodeStream = Readable.fromWeb(webStream as any);
  const writeStream = createWriteStream(fullPath);
  await pipeline(nodeStream, writeStream);
  
  return { url: `/uploads/${filename}`, pathname: filename };
}

// POST - رفع فيديو أو صورة للدورة
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== 'ADMIN') {
      return addSecurityHeaders(
        NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'video' | 'image' | 'thumbnail'
    const courseId = formData.get('courseId') as string;

    if (!file) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'لم يتم اختيار ملف' }, { status: 400 })
      );
    }

    if (!type || !['video', 'image', 'thumbnail'].includes(type)) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'نوع الرفع غير صالح' }, { status: 400 })
      );
    }

    const isVideo = type === 'video';
    const validTypes = isVideo ? VALID_VIDEO_TYPES : VALID_IMAGE_TYPES;
    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;

    if (!validTypes.includes(file.type)) {
      const allowed = isVideo ? 'MP4, WebM, OGG, MOV' : 'JPG, PNG, WebP';
      return addSecurityHeaders(
        NextResponse.json(
          { error: `نوع الملف غير مدعوم. الأنواع المسموحة: ${allowed}` },
          { status: 400 }
        )
      );
    }

    if (file.size > maxSize) {
      const maxMB = Math.round(maxSize / (1024 * 1024));
      return addSecurityHeaders(
        NextResponse.json(
          { error: `حجم الملف يجب أن يكون أقل من ${maxMB} ميجابايت` },
          { status: 400 }
        )
      );
    }

    // إنشاء اسم ملف فريد
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || (isVideo ? 'mp4' : 'jpg');
    const sanitizedName = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .substring(0, 50);
    const folder = isVideo ? 'courses/videos' : 'courses/images';
    const prefix = courseId ? `${courseId}/` : '';
    const filename = `${folder}/${prefix}${sanitizedName}-${timestamp}.${extension}`;

    const result = useBlob
      ? await uploadToBlob(filename, file)
      : await uploadToLocal(filename, file);

    return addSecurityHeaders(
      NextResponse.json({
        success: true,
        url: result.url,
        filename: result.pathname,
        size: file.size,
      })
    );
  } catch (error: any) {
    console.error('Upload error:', error?.message || error, error?.stack);
    const msg = error?.message?.includes('body')
      ? 'حجم الملف كبير جداً'
      : 'حدث خطأ أثناء رفع الملف';
    return addSecurityHeaders(
      NextResponse.json({ error: msg }, { status: 500 })
    );
  }
}

// DELETE - حذف ملف
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== 'ADMIN') {
      return addSecurityHeaders(
        NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
      );
    }

    const { url } = await request.json();
    if (!url || typeof url !== 'string') {
      return addSecurityHeaders(
        NextResponse.json({ error: 'رابط الملف غير صالح' }, { status: 400 })
      );
    }

    if (url.startsWith('/uploads/')) {
      // حذف ملف محلي
      const filePath = join(process.cwd(), 'public', url);
      await unlink(filePath).catch(() => {});
    } else if (url.startsWith('https://')) {
      // حذف من Vercel Blob
      const { del } = await import('@vercel/blob');
      await del(url);
    }

    return addSecurityHeaders(
      NextResponse.json({ success: true })
    );
  } catch (error) {
    console.error('Delete error:', error);
    return addSecurityHeaders(
      NextResponse.json({ error: 'حدث خطأ أثناء حذف الملف' }, { status: 500 })
    );
  }
}
