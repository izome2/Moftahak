/**
 * API: المشاريع - GET (list) / POST (create)
 * الصلاحيات: canManageApartments (إنشاء) / canViewAllData أو أي دور حسابات (عرض)
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
import { createProjectSchema } from '@/lib/validations/accounting';

// GET /api/accounting/projects - قائمة المشاريع
export async function GET(request: NextRequest) {
  const rateLimitError = checkAccountingRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAccountingSession();
  if (authResult.error) return authResult.error;

  const projects = await prisma.project.findMany({
    include: {
      _count: { select: { apartments: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return successResponse({ projects });
}

// POST /api/accounting/projects - إنشاء مشروع
export async function POST(request: NextRequest) {
  const rateLimitError = checkAccountingRateLimit(request, { maxRequests: 10 });
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAccountingAuth('canManageApartments');
  if (authResult.error) return authResult.error;

  const body = await request.json();
  const parsed = createProjectSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message || 'بيانات غير صالحة');
  }

  const project = await prisma.project.create({
    data: parsed.data,
  });

  return successResponse({ project }, 201);
}
