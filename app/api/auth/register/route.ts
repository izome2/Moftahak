import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { ZodError, z } from 'zod';
import type { Role } from '@/generated/prisma';

// Custom register validation for phone/email support
const registerValidation = z.object({
  firstName: z.string().min(2, 'الاسم الأول يجب أن يكون حرفين على الأقل').max(50, 'الاسم الأول طويل جداً'),
  lastName: z.string().min(2, 'اسم العائلة يجب أن يكون حرفين على الأقل').max(50, 'اسم العائلة طويل جداً'),
  email: z.string().email('البريد الإلكتروني غير صالح').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  password: z.string()
    .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    .regex(/[a-z]/, 'كلمة المرور يجب أن تحتوي على حرف صغير')
    .regex(/[A-Z]/, 'كلمة المرور يجب أن تحتوي على حرف كبير')
    .regex(/[0-9]/, 'كلمة المرور يجب أن تحتوي على رقم'),
  confirmPassword: z.string(),
  phoneVerified: z.boolean().optional(),
  inviteCode: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'كلمة المرور غير متطابقة',
  path: ['confirmPassword'],
}).refine((data) => data.email || data.phone, {
  message: 'يجب إدخال البريد الإلكتروني أو رقم الهاتف',
  path: ['email'],
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = registerValidation.parse(body);

    // Check if using email or phone
    const isUsingEmail = !!validatedData.email;
    const isUsingPhone = !!validatedData.phone;

    // Check if email already exists (normalize to lowercase)
    if (isUsingEmail && validatedData.email) {
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email: validatedData.email.toLowerCase().trim() },
      });

      if (existingUserByEmail) {
        // إذا كان هناك كود دعوة، ننصح المستخدم بتسجيل الدخول بدلاً من إنشاء حساب جديد
        if (validatedData.inviteCode) {
          return NextResponse.json(
            { 
              success: false, 
              message: 'لديك حساب بالفعل! قم بتسجيل الدخول لقبول الدعوة',
              error: 'USE_EXISTING_ACCOUNT'
            },
            { status: 409 }
          );
        }
        return NextResponse.json(
          { 
            success: false, 
            message: 'البريد الإلكتروني مستخدم بالفعل',
            error: 'EMAIL_EXISTS'
          },
          { status: 400 }
        );
      }
    }

    // Check if phone already exists
    if (isUsingPhone && validatedData.phone) {
      // Normalize phone number (ensure it's just digits)
      const normalizedPhone = validatedData.phone.replace(/\D/g, '');
      
      const existingUserByPhone = await prisma.user.findUnique({
        where: { phone: normalizedPhone },
      });

      if (existingUserByPhone) {
        // إذا كان هناك كود دعوة، ننصح المستخدم بتسجيل الدخول بدلاً من إنشاء حساب جديد
        if (validatedData.inviteCode) {
          return NextResponse.json(
            { 
              success: false, 
              message: 'لديك حساب بالفعل! قم بتسجيل الدخول لقبول الدعوة',
              error: 'USE_EXISTING_ACCOUNT'
            },
            { status: 409 }
          );
        }
        return NextResponse.json(
          { 
            success: false, 
            message: 'رقم الهاتف مستخدم بالفعل',
            error: 'PHONE_EXISTS'
          },
          { status: 400 }
        );
      }

      // Verify phone verification status (for phone registration)
      if (!validatedData.phoneVerified) {
        // Check if phone is verified in our database
        const phoneVerification = await prisma.phoneVerification.findFirst({
          where: {
            phoneNumber: normalizedPhone,
            verified: true,
            expiresAt: {
              gt: new Date(),
            },
          },
        });

        if (!phoneVerification) {
          return NextResponse.json(
            { 
              success: false, 
              message: 'يجب التحقق من رقم الهاتف أولاً',
              error: 'PHONE_NOT_VERIFIED'
            },
            { status: 400 }
          );
        }
      }
    }

    // Hash password
    const hashedPassword = await hash(validatedData.password, 10);

    // Determine role - check invite code
    let assignedRole: Role = 'USER';
    let invitationId: string | null = null;

    if (validatedData.inviteCode) {
      const invitation = await prisma.invitation.findUnique({
        where: { code: validatedData.inviteCode },
      });

      if (!invitation) {
        return NextResponse.json(
          { success: false, message: 'رابط الدعوة غير صالح', error: 'INVALID_INVITE' },
          { status: 400 }
        );
      }

      if (invitation.used) {
        return NextResponse.json(
          { success: false, message: 'تم استخدام رابط الدعوة بالفعل', error: 'INVITE_USED' },
          { status: 410 }
        );
      }

      if (new Date() > invitation.expiresAt) {
        return NextResponse.json(
          { success: false, message: 'انتهت صلاحية رابط الدعوة', error: 'INVITE_EXPIRED' },
          { status: 410 }
        );
      }

      assignedRole = invitation.role;
      invitationId = invitation.id;
    }

    // Prepare user data
    const userData: {
      firstName: string;
      lastName: string;
      email?: string;
      phone?: string;
      password: string;
      role: Role;
      phoneVerified?: Date;
    } = {
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      password: hashedPassword,
      role: assignedRole,
    };

    if (isUsingEmail && validatedData.email) {
      userData.email = validatedData.email.toLowerCase().trim();
    }

    if (isUsingPhone && validatedData.phone) {
      userData.phone = validatedData.phone.replace(/\D/g, '');
      userData.phoneVerified = new Date();
    }

    // Create user
    const user = await prisma.user.create({
      data: userData,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        image: true,
        createdAt: true,
      },
    });

    // Mark invitation as used (single-use)
    if (invitationId) {
      await prisma.invitation.update({
        where: { id: invitationId },
        data: {
          used: true,
          usedAt: new Date(),
          usedById: user.id,
        },
      });
    }

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
          errors: error.issues.map((err: z.ZodIssue) => ({
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
