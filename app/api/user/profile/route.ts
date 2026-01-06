import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateProfileSchema } from '@/lib/validations/auth';
import { ZodError } from 'zod';

// GET - Get user profile
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'غير مصرح بالوصول' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        image: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'المستخدم غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء جلب البيانات' },
      { status: 500 }
    );
  }
}

// PATCH - Update user profile
export async function PATCH(request: NextRequest) {
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
    const validatedData = updateProfileSchema.parse(body);

    // Build update data
    const updateData: any = {};
    if (validatedData.firstName) updateData.firstName = validatedData.firstName;
    if (validatedData.lastName) updateData.lastName = validatedData.lastName;
    if (validatedData.image !== undefined) updateData.image = validatedData.image;

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        image: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'تم تحديث الملف الشخصي بنجاح',
      user: updatedUser,
    });
  } catch (error) {
    // Validation error
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: 'بيانات غير صالحة',
          errors: error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, message: 'حدث خطأ أثناء التحديث' },
      { status: 500 }
    );
  }
}
