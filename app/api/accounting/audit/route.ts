/**
 * API: سجل المراجعة - GET (list with filters)
 * الصلاحيات: canViewAuditLog (GENERAL_MANAGER فقط)
 * 🔒 يعرض كل العمليات المالية مع القيم قبل وبعد
 */

import { NextRequest } from 'next/server';
import {
  requireAccountingAuth,
  checkAccountingRateLimit,
  successResponse,
  errorResponse,
} from '@/lib/accounting-auth';
import { prisma } from '@/lib/prisma';

// GET /api/accounting/audit?entity=BOOKING&action=CREATE&userId=...&from=...&to=...&page=1&limit=50
export async function GET(request: NextRequest) {
  const rateLimitError = checkAccountingRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAccountingAuth('canViewAuditLog');
  if (authResult.error) return authResult.error;

  const { searchParams } = new URL(request.url);
  const entity = searchParams.get('entity');       // BOOKING, EXPENSE, INVESTOR, WITHDRAWAL, MONTH
  const action = searchParams.get('action');       // CREATE, UPDATE, DELETE, LOCK_MONTH, etc.
  const userId = searchParams.get('userId');
  const entityId = searchParams.get('entityId');
  const from = searchParams.get('from');           // ISO date
  const to = searchParams.get('to');               // ISO date
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);

  const where: Record<string, unknown> = {};

  if (entity) where.entity = entity;
  if (action) where.action = action;
  if (userId) where.userId = userId;
  if (entityId) where.entityId = entityId;

  if (from || to) {
    const dateFilter: Record<string, Date> = {};
    if (from) dateFilter.gte = new Date(from);
    if (to) dateFilter.lte = new Date(to);
    where.createdAt = dateFilter;
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return successResponse({
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}
