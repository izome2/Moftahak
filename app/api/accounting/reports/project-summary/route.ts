/**
 * API: ملخص المشروع الكامل - GET
 * يعرض ملخص كل الشقق في مشروع معين أو كل المشاريع
 * الصلاحيات: canViewAllData (المدير العام فقط)
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  requireAccountingAuth,
  checkAccountingRateLimit,
  successResponse,
  errorResponse,
} from '@/lib/accounting-auth';

// GET /api/accounting/reports/project-summary?projectId=...&month=YYYY-MM
export async function GET(request: NextRequest) {
  const rateLimitError = checkAccountingRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAccountingAuth('canViewAllData');
  if (authResult.error) return authResult.error;

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  const month = searchParams.get('month'); // YYYY-MM

  if (!month) {
    return errorResponse('الشهر مطلوب (month=YYYY-MM)', 400);
  }

  // جلب الشقق
  const apartmentWhere: Record<string, unknown> = { isActive: true };
  if (projectId) apartmentWhere.projectId = projectId;

  const apartments = await prisma.apartment.findMany({
    where: apartmentWhere,
    include: {
      project: { select: { id: true, name: true } },
    },
    orderBy: { name: 'asc' },
  });

  // ⚡ جلب الملخصات الشهرية لكل الشقق
  const apartmentIds = apartments.map(a => a.id);
  const snapshots = await prisma.monthlySnapshot.findMany({
    where: {
      apartmentId: { in: apartmentIds },
      month,
    },
  });

  const snapshotMap = new Map(snapshots.map(s => [s.apartmentId, s]));

  const apartmentSummaries = apartments.map(apt => {
    const snapshot = snapshotMap.get(apt.id);
    return {
      id: apt.id,
      name: apt.name,
      floor: apt.floor,
      type: apt.type,
      project: apt.project,
      month,
      totalRevenue: snapshot?.totalRevenue || 0,
      totalExpenses: snapshot?.totalExpenses || 0,
      profit: snapshot?.profit || 0,
      bookingsCount: snapshot?.bookingsCount || 0,
      occupiedNights: snapshot?.occupiedNights || 0,
      revenueBySource: snapshot?.revenueBySource || {},
    };
  });

  // إجماليات المشروع
  const projectTotals = {
    totalRevenue: apartmentSummaries.reduce((s, a) => s + a.totalRevenue, 0),
    totalExpenses: apartmentSummaries.reduce((s, a) => s + a.totalExpenses, 0),
    profit: apartmentSummaries.reduce((s, a) => s + a.profit, 0),
    totalBookings: apartmentSummaries.reduce((s, a) => s + a.bookingsCount, 0),
    totalOccupiedNights: apartmentSummaries.reduce((s, a) => s + a.occupiedNights, 0),
    apartmentsCount: apartments.length,
  };

  return successResponse({
    month,
    projectId: projectId || 'all',
    apartments: apartmentSummaries,
    totals: projectTotals,
  });
}
