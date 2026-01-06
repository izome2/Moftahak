import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { registerSchema } from '@/lib/validations/auth';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'البريد الإلكتروني مستخدم بالفعل',
          error: 'EMAIL_EXISTS'
        },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(validatedData.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        password: hashedPassword,
        role: 'USER', // Default role
      },
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

    return NextResponse.json(
      {
        success: true,
        message: 'تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول',
        user,
      },
      { status: 201 }
    );
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

    // Database error
    console.error('Registration error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة مرة أخرى',
        error: 'SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}
