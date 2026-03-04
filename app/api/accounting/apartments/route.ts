/**
 * API: الشقق - GET (list) / POST (create)
 * الصلاحيات: canManageApartments (إنشاء) / أي دور حسابات (عرض)
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  requireAccountingSession,
  requireAccountingAuth,
  checkAccountingRateLimit,
  successResponse,
  errorResponse,
} from '@/lib/accounting-auth';
import { createApartmentSchema } from '@/lib/validations/accounting';

// GET /api/accounting/apartments
export async function GET(request: NextRequest) {
  const rateLimitError = checkAccountingRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAccountingSession();
  if (authResult.error) return authResult.error;

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  const includeInactive = searchParams.get('includeInactive') === 'true';

  const where: Record<string, unknown> = {};
  if (projectId) where.projectId = projectId;
  if (!includeInactive) where.isActive = true;

  const apartments = await prisma.apartment.findMany({
    where,
    include: {
      project: { select: { id: true, name: true } },
      _count: {
        select: {
          bookings: { where: { deletedAt: null } },
          investors: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  });

  return successResponse({ apartments });
}

// POST /api/accounting/apartments
export async function POST(request: NextRequest) {
  const rateLimitError = checkAccountingRateLimit(request, { maxRequests: 10 });
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAccountingAuth('canManageApartments');
  if (authResult.error) return authResult.error;

  const body = await request.json();
  const parsed = createApartmentSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message || 'بيانات غير صالحة');
  }

  // التحقق من وجود المشروع
  const project = await prisma.project.findUnique({
    where: { id: parsed.data.projectId },
  });
  if (!project) return errorResponse('المشروع غير موجود', 404);

  const apartment = await prisma.apartment.create({
    data: parsed.data,
    include: {
      project: { select: { id: true, name: true } },
    },
  });

  return successResponse({ apartment }, 201);
}
