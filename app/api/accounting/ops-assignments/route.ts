/**
 * API: تعيين الشقق لمدير التشغيل - GET / POST / DELETE
 * الصلاحيات: canManageTeam (المدير العام فقط)
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  requireAccountingAuth,
  checkAccountingRateLimit,
  successResponse,
  errorResponse,
} from '@/lib/accounting-auth';

// GET /api/accounting/ops-assignments?userId=...
export async function GET(request: NextRequest) {
  const rateLimitError = checkAccountingRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAccountingAuth('canManageTeam');
  if (authResult.error) return authResult.error;

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  const where: Record<string, unknown> = {};
  if (userId) where.userId = userId;

  const assignments = await prisma.opsManagerApartment.findMany({
    where,
    include: {
      user: { select: { id: true, firstName: true, lastName: true, role: true } },
      apartment: { 
        select: { 
          id: true, 
          name: true, 
          project: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return successResponse({ assignments });
}

// POST /api/accounting/ops-assignments
// Body: { userId, apartmentIds: string[] }
export async function POST(request: NextRequest) {
  const rateLimitError = checkAccountingRateLimit(request, { maxRequests: 10 });
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAccountingAuth('canManageTeam');
  if (authResult.error) return authResult.error;

  const body = await request.json();
  const { userId, apartmentIds } = body as { userId: string; apartmentIds: string[] };

  if (!userId || !Array.isArray(apartmentIds)) {
    return errorResponse('يجب تحديد المستخدم والشقق');
  }

  // التحقق من أن المستخدم مدير تشغيل
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!user) return errorResponse('المستخدم غير موجود', 404);
  if (user.role !== 'OPS_MANAGER') return errorResponse('المستخدم ليس مدير تشغيل');

  // حذف التعيينات القديمة وإنشاء الجديدة
  await prisma.$transaction([
    prisma.opsManagerApartment.deleteMany({ where: { userId } }),
    ...apartmentIds.map(apartmentId =>
      prisma.opsManagerApartment.create({
        data: { userId, apartmentId },
      })
    ),
  ]);

  // جلب التعيينات الجديدة
  const assignments = await prisma.opsManagerApartment.findMany({
    where: { userId },
    include: {
      apartment: { 
        select: { 
          id: true, 
          name: true,
          project: { select: { id: true, name: true } },
        },
      },
    },
  });

  return successResponse({ assignments, message: 'تم تحديث تعيينات الشقق بنجاح' });
}

// DELETE /api/accounting/ops-assignments
// Body: { userId, apartmentId }
export async function DELETE(request: NextRequest) {
  const rateLimitError = checkAccountingRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAccountingAuth('canManageTeam');
  if (authResult.error) return authResult.error;

  const body = await request.json();
  const { userId, apartmentId } = body as { userId: string; apartmentId: string };

  if (!userId || !apartmentId) {
    return errorResponse('يجب تحديد المستخدم والشقة');
  }

  await prisma.opsManagerApartment.deleteMany({
    where: { userId, apartmentId },
  });

  return successResponse({ message: 'تم إزالة التعيين بنجاح' });
}
