/**
 * API: إدارة الفريق - GET (list) / POST (create)
 * إنشاء أعضاء فريق جدد بأدوار مختلفة
 * الصلاحيات: canManageTeam (المدير العام فقط)
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import {
  requireAccountingAuth,
  checkAccountingRateLimit,
  successResponse,
  errorResponse,
} from '@/lib/accounting-auth';
import { z } from 'zod';

const ACCOUNTING_ROLES = [
  'GENERAL_MANAGER', 'OPS_MANAGER', 'BOOKING_MANAGER', 'INVESTOR',
] as const;

const createTeamMemberSchema = z.object({
  firstName: z.string().min(1, 'الاسم الأول مطلوب').max(100),
  lastName: z.string().min(1, 'اسم العائلة مطلوب').max(100),
  email: z.string().email('بريد إلكتروني غير صالح').optional().nullable(),
  phone: z.string().min(6, 'رقم الهاتف غير صالح').max(20).optional().nullable(),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  role: z.enum(ACCOUNTING_ROLES, { message: 'الدور غير صالح' }),
});

// GET /api/accounting/settings/team - قائمة أعضاء الفريق
export async function GET(request: NextRequest) {
  const rateLimitError = checkAccountingRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAccountingAuth('canManageTeam');
  if (authResult.error) return authResult.error;

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { role: { in: ['GENERAL_MANAGER', 'OPS_MANAGER', 'BOOKING_MANAGER', 'INVESTOR'] } },
        { additionalRoles: { hasSome: ['GENERAL_MANAGER', 'OPS_MANAGER', 'BOOKING_MANAGER', 'INVESTOR'] } },
      ],
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      additionalRoles: true,
      image: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return successResponse({ users });
}

// POST /api/accounting/settings/team - إنشاء عضو جديد
export async function POST(request: NextRequest) {
  const rateLimitError = checkAccountingRateLimit(request, { maxRequests: 10 });
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAccountingAuth('canManageTeam');
  if (authResult.error) return authResult.error;

  const body = await request.json();
  const parsed = createTeamMemberSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message || 'بيانات غير صالحة');
  }

  const { firstName, lastName, email, phone, password, role } = parsed.data;

  // Check for duplicate email/phone
  if (email) {
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) return errorResponse('البريد الإلكتروني مسجل بالفعل', 409);
  }
  if (phone) {
    const existingPhone = await prisma.user.findUnique({ where: { phone } });
    if (existingPhone) return errorResponse('رقم الهاتف مسجل بالفعل', 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email: email || null,
      phone: phone || null,
      password: hashedPassword,
      role,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });

  return successResponse({ user }, 201);
}
