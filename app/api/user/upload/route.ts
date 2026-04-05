import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { mkdir, writeFile, unlink } from 'fs/promises';
import { join, dirname } from 'path';

const useBlob = !!process.env.BLOB_READ_WRITE_TOKEN;

async function uploadToBlob(filename: string, file: File) {
  const { put } = await import('@vercel/blob');
  const blob = await put(filename, file, {
    access: 'public',
    addRandomSuffix: false,
  });
  return blob.url;
}

async function uploadToLocal(filename: string, file: File) {
  const uploadsDir = join(process.cwd(), 'public', 'uploads');
  const fullPath = join(uploadsDir, filename);
  await mkdir(dirname(fullPath), { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(fullPath, buffer);
  return `/uploads/${filename}`;
}

async function deleteOldAvatar(imageUrl: string) {
  if (!imageUrl || imageUrl.startsWith('/images/default-avatar')) return;

  if (imageUrl.startsWith('https://') && useBlob) {
    try {
      const { del } = await import('@vercel/blob');
      await del(imageUrl);
    } catch (error) {
      console.error('Error deleting old avatar from blob:', error);
    }
  } else if (imageUrl.startsWith('/uploads/')) {
    try {
      const fullPath = join(process.cwd(), 'public', imageUrl);
      await unlink(fullPath);
    } catch (error) {
      console.error('Error deleting old avatar from local:', error);
    }
  }
}

// POST - Upload user avatar
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح بالوصول' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'لم يتم اختيار ملف' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'نوع الملف غير مدعوم. يرجى استخدام JPG أو PNG أو WebP' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: 'حجم الملف يجب أن يكون أقل من 5 ميجابايت' },
        { status: 400 }
      );
    }

    // Get current user to check for old avatar
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true },
    });

    // Delete old avatar if exists
    if (currentUser?.image) {
      await deleteOldAvatar(currentUser.image);
    }

    // Generate unique filename with path
    const timestamp = Date.now();
    const extension = file.type.split('/')[1];
    const filename = `avatars/${session.user.id}-${timestamp}.${extension}`;

    // Upload to Vercel Blob or local storage
    const imageUrl = useBlob
      ? await uploadToBlob(filename, file)
      : await uploadToLocal(filename, file);

    // Update user profile with new image URL
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: imageUrl },
    });

    return NextResponse.json({
      success: true,
      message: 'تم رفع الصورة بنجاح',
      imageUrl,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء رفع الصورة' },
      { status: 500 }
    );
  }
}

// DELETE - Delete user avatar
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح بالوصول' },
        { status: 401 }
      );
    }

    // Get current user avatar
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { image: true },
    });

    // Delete old avatar if exists
    if (currentUser?.image) {
      await deleteOldAvatar(currentUser.image);
    }

    // Reset to default avatar
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image: '/images/default-avatar.svg' },
    });

    return NextResponse.json({
      success: true,
      message: 'تم حذف الصورة بنجاح',
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء حذف الصورة' },
      { status: 500 }
    );
  }
}
