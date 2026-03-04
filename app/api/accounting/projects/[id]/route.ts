/**
 * API: مشروع واحد - GET / PUT / DELETE
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
import { updateProjectSchema } from '@/lib/validations/accounting';

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/accounting/projects/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  const rateLimitError = checkAccountingRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAccountingSession();
  if (authResult.error) return authResult.error;

  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      apartments: {
        where: { isActive: true },
        select: { id: true, name: true, floor: true, type: true },
        orderBy: { name: 'asc' },
      },
    },
  });

  if (!project) return notFoundResponse('المشروع');

  return successResponse({ project });
}

// PUT /api/accounting/projects/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const rateLimitError = checkAccountingRateLimit(request, { maxRequests: 15 });
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAccountingAuth('canManageApartments');
  if (authResult.error) return authResult.error;

  const { id } = await params;
  const body = await request.json();
  const parsed = updateProjectSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message || 'بيانات غير صالحة');
  }

  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) return notFoundResponse('المشروع');

  const project = await prisma.project.update({
    where: { id },
    data: parsed.data,
  });

  return successResponse({ project });
}

// DELETE /api/accounting/projects/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const rateLimitError = checkAccountingRateLimit(request, { maxRequests: 5 });
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAccountingAuth('canManageApartments');
  if (authResult.error) return authResult.error;

  const { id } = await params;

  const existing = await prisma.project.findUnique({
    where: { id },
    include: { _count: { select: { apartments: true } } },
  });

  if (!existing) return notFoundResponse('المشروع');

  if (existing._count.apartments > 0) {
    return errorResponse('لا يمكن حذف مشروع يحتوي على شقق. أزل الشقق أولاً.', 409);
  }

  await prisma.project.delete({ where: { id } });

  return successResponse({ message: 'تم حذف المشروع بنجاح' });
}
