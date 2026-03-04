/**
 * API: كل المستثمرين - GET
 * الصلاحيات: canManageInvestors / canViewAllData
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  requireAccountingAuth,
  checkAccountingRateLimit,
  successResponse,
} from '@/lib/accounting-auth';

// GET /api/accounting/investors
export async function GET(request: NextRequest) {
  const rateLimitError = checkAccountingRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAccountingAuth('canManageInvestors');
  if (authResult.error) return authResult.error;

  // جلب المستثمرين (Role = INVESTOR) مع استثماراتهم
  const investors = await prisma.user.findMany({
    where: { role: 'INVESTOR' },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      image: true,
      investments: {
        include: {
          apartment: { select: { id: true, name: true } },
          _count: { select: { withdrawals: true } },
        },
      },
    },
    orderBy: { firstName: 'asc' },
  });

  return successResponse({ investors });
}
