import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

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

    // Generate unique filename
    const timestamp = Date.now();
    const extension = file.type.split('/')[1];
    const filename = `${session.user.id}-${timestamp}.${extension}`;

    // Define upload directory
    const uploadDir = path.join(process.cwd(), 'public', 'images', 'avatars');
    
    // Create directory if it doesn't exist
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.error('Error creating directory:', error);
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save file
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    // Generate URL
    const imageUrl = `/images/avatars/${filename}`;

    // Update user profile with new image
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
