/**
 * نسخ احتياطي كامل لنظام المحاسبة
 * GET /api/accounting/system/backup
 * 
 * يُصدّر كل بيانات المحاسبة في ملف JSON واحد
 * يمكن استخدامه لاحقاً للاستعادة عبر /api/accounting/system/restore
 * 
 * الصلاحية: GENERAL_MANAGER فقط
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAccountingAuth, checkAccountingRateLimit, errorResponse } from '@/lib/accounting-auth';

export async function GET(request: NextRequest) {
  // Rate limit
  const rateLimitError = checkAccountingRateLimit(request, { maxRequests: 5 });
  if (rateLimitError) return rateLimitError;

  // Auth — GM only
  const authResult = await requireAccountingAuth('canManageInvestors');
  if (authResult.error) return authResult.error;
  const { session } = authResult;

  // Only GENERAL_MANAGER or ADMIN
  const role = session.user.role;
  if (role !== 'GENERAL_MANAGER' && role !== 'ADMIN') {
    return errorResponse('ليس لديك صلاحية النسخ الاحتياطي — المدير العام فقط', 403);
  }

  try {
    // Collect all accounting data in parallel
    const [
      projects,
      apartments,
      bookings,
      expenses,
      apartmentInvestors,
      withdrawals,
      currencyRates,
      monthlySnapshots,
      monthlyInvestorSnapshots,
      systemSettings,
      auditLogs,
      // Users (accounting roles only)
      users,
    ] = await Promise.all([
      prisma.project.findMany({ orderBy: { createdAt: 'asc' } }),
      prisma.apartment.findMany({ orderBy: { createdAt: 'asc' } }),
      prisma.booking.findMany({ orderBy: { createdAt: 'asc' } }),
      prisma.expense.findMany({ orderBy: { createdAt: 'asc' } }),
      prisma.apartmentInvestor.findMany({ orderBy: { createdAt: 'asc' } }),
      prisma.withdrawal.findMany({ orderBy: { createdAt: 'asc' } }),
      prisma.currencyRate.findMany(),
      prisma.monthlySnapshot.findMany({ orderBy: { createdAt: 'asc' } }),
      prisma.monthlyInvestorSnapshot.findMany({ orderBy: { createdAt: 'asc' } }),
      prisma.systemSetting.findMany(),
      prisma.auditLog.findMany({ orderBy: { createdAt: 'asc' } }),
      prisma.user.findMany({
        where: { role: { in: ['GENERAL_MANAGER', 'OPS_MANAGER', 'BOOKING_MANAGER', 'INVESTOR'] } },
        select: { id: true, firstName: true, lastName: true, email: true, phone: true, role: true, image: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    const backup = {
      version: '1.0',
      createdAt: new Date().toISOString(),
      createdBy: `${session.user.firstName} ${session.user.lastName}`,
      system: 'moftahak-accounting',
      stats: {
        users: users.length,
        projects: projects.length,
        apartments: apartments.length,
        bookings: bookings.length,
        expenses: expenses.length,
        investors: apartmentInvestors.length,
        withdrawals: withdrawals.length,
        auditLogs: auditLogs.length,
      },
      data: {
        users,
        projects,
        apartments,
        bookings,
        expenses,
        apartmentInvestors,
        withdrawals,
        currencyRates,
        monthlySnapshots,
        monthlyInvestorSnapshots,
        systemSettings,
        auditLogs,
      },
    };

    return NextResponse.json(backup, {
      headers: {
        'Content-Disposition': `attachment; filename="moftahak-backup-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (error: any) {
    console.error('Backup error:', error);
    return errorResponse('فشل في إنشاء النسخة الاحتياطية', 500);
  }
}
