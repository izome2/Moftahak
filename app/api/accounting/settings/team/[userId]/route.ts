/**
 * API: إدارة عضو فريق - PUT (update role) / DELETE
 * الصلاحيات: canManageTeam (المدير العام فقط)
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  requireAccountingAuth,
  checkAccountingRateLimit,
  successResponse,
  errorResponse,
  notFoundResponse,
} from '@/lib/accounting-auth';
import { z } from 'zod';

const ACCOUNTING_ROLES = [
  'GENERAL_MANAGER', 'OPS_MANAGER', 'BOOKING_MANAGER', 'INVESTOR',
] as const;

const updateTeamMemberSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().min(6).max(20).optional().nullable(),
  role: z.enum(ACCOUNTING_ROLES).optional(),
});

type Params = { params: Promise<{ userId: string }> };

// PUT /api/accounting/settings/team/[userId]
export async function PUT(request: NextRequest, { params }: Params) {
  const rateLimitError = checkAccountingRateLimit(request, { maxRequests: 10 });
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAccountingAuth('canManageTeam');
  if (authResult.error) return authResult.error;

  const { userId } = await params;

  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) return notFoundResponse('المستخدم');

  // Prevent self-role demotion
  if (authResult.session?.user?.id === userId) {
    return errorResponse('لا يمكنك تعديل دورك الخاص');
  }

  const body = await request.json();
  const parsed = updateTeamMemberSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message || 'بيانات غير صالحة');
  }

  // Check duplicates if email/phone changed
  if (parsed.data.email && parsed.data.email !== existing.email) {
    const dup = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (dup) return errorResponse('البريد الإلكتروني مسجل بالفعل', 409);
  }
  if (parsed.data.phone && parsed.data.phone !== existing.phone) {
    const dup = await prisma.user.findUnique({ where: { phone: parsed.data.phone } });
    if (dup) return errorResponse('رقم الهاتف مسجل بالفعل', 409);
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: parsed.data,
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

  return successResponse({ user });
}

// DELETE /api/accounting/settings/team/[userId]
export async function DELETE(request: NextRequest, { params }: Params) {
  const rateLimitError = checkAccountingRateLimit(request, { maxRequests: 5 });
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAccountingAuth('canManageTeam');
  if (authResult.error) return authResult.error;

  const { userId } = await params;

  // Prevent self-deletion
  if (authResult.session?.user?.id === userId) {
    return errorResponse('لا يمكنك حذف حسابك الخاص');
  }

  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing) return notFoundResponse('المستخدم');

  // Check for investments
  const investmentCount = await prisma.apartmentInvestor.count({
    where: { userId },
  });
  if (investmentCount > 0) {
    return errorResponse(
      `لا يمكن حذف هذا المستخدم لأنه مرتبط بـ ${investmentCount} استثمار. قم بإزالة الاستثمارات أولاً.`
    );
  }

  await prisma.user.delete({ where: { id: userId } });

  return successResponse({ deleted: true });
}
