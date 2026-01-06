import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { changePasswordSchema } from '@/lib/validations/auth';
import { hash, compare } from 'bcryptjs';
import { ZodError } from 'zod';

// POST - Change user password
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح بالوصول' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input
    const validatedData = changePasswordSchema.parse(body);

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'المستخدم غير موجود' },
        { status: 404 }
      );
    }

    // Verify current password
    const isPasswordValid = await compare(
      validatedData.currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'كلمة المرور الحالية غير صحيحة' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await hash(validatedData.newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح',
    });
  } catch (error) {
    // Validation error
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: error.issues[0]?.message || 'بيانات غير صالحة',
          errors: error.issues,
        },
        { status: 400 }
      );
    }

    console.error('Password change error:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء تغيير كلمة المرور' },
      { status: 500 }
    );
  }
}
