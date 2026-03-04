/**
 * API: شقة واحدة - GET / PUT / DELETE
 * الصلاحيات: canManageApartments (تعديل/حذف) / أي دور حسابات (عرض)
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  requireAccountingSession,
  requireAccountingAuth,
  checkAccountingRateLimit,
  successResponse,
  errorResponse,
  notFoundResponse,
} from '@/lib/accounting-auth';
import { updateApartmentSchema } from '@/lib/validations/accounting';

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/accounting/apartments/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  const rateLimitError = checkAccountingRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAccountingSession();
  if (authResult.error) return authResult.error;

  const { id } = await params;

  const apartment = await prisma.apartment.findUnique({
    where: { id },
    include: {
      project: { select: { id: true, name: true } },
      investors: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      },
    },
  });

  if (!apartment) return notFoundResponse('الشقة');

  return successResponse({ apartment });
}

// PUT /api/accounting/apartments/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const rateLimitError = checkAccountingRateLimit(request, { maxRequests: 15 });
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAccountingAuth('canManageApartments');
  if (authResult.error) return authResult.error;

  const { id } = await params;
  const body = await request.json();
  const parsed = updateApartmentSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message || 'بيانات غير صالحة');
  }

  const existing = await prisma.apartment.findUnique({ where: { id } });
  if (!existing) return notFoundResponse('الشقة');

  // إذا تم تغيير المشروع → تحقق من وجوده
  if (parsed.data.projectId) {
    const project = await prisma.project.findUnique({
      where: { id: parsed.data.projectId },
    });
    if (!project) return errorResponse('المشروع غير موجود', 404);
  }

  const apartment = await prisma.apartment.update({
    where: { id },
    data: parsed.data,
    include: {
      project: { select: { id: true, name: true } },
    },
  });

  return successResponse({ apartment });
}

// DELETE /api/accounting/apartments/[id] - Soft delete (تعطيل)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const rateLimitError = checkAccountingRateLimit(request, { maxRequests: 5 });
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAccountingAuth('canManageApartments');
  if (authResult.error) return authResult.error;

  const { id } = await params;

  const existing = await prisma.apartment.findUnique({ where: { id } });
  if (!existing) return notFoundResponse('الشقة');

  // Soft delete: تعطيل الشقة بدل حذفها
  await prisma.apartment.update({
    where: { id },
    data: { isActive: false },
  });

  return successResponse({ message: 'تم تعطيل الشقة بنجاح' });
}
