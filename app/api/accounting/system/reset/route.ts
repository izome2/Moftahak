/**
 * إعادة تعيين نظام المحاسبة (تصفية كاملة)
 * POST /api/accounting/system/reset
 * 
 * يحذف كل بيانات المحاسبة مع الاحتفاظ بالمستخدمين
 * ⚠️ عملية لا رجعة فيها — يُنصح بأخذ نسخة احتياطية أولاً
 * 
 * Body: { confirmText: "تأكيد التصفية", keepUsers: boolean }
 * 
 * الصلاحية: GENERAL_MANAGER فقط
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAccountingAuth, checkAccountingRateLimit, errorResponse } from '@/lib/accounting-auth';
import { logAuditEvent } from '@/lib/accounting/audit';

export async function POST(request: NextRequest) {
  // Rate limit — very strict
  const rateLimitError = checkAccountingRateLimit(request, { maxRequests: 2 });
  if (rateLimitError) return rateLimitError;

  // Auth — GM only
  const authResult = await requireAccountingAuth('canManageInvestors');
  if (authResult.error) return authResult.error;
  const { session } = authResult;

  const role = session.user.role;
  if (role !== 'GENERAL_MANAGER' && role !== 'ADMIN') {
    return errorResponse('ليس لديك صلاحية التصفية — المدير العام فقط', 403);
  }

  try {
    const body = await request.json();

    // Safety check — require explicit confirmation
    if (body.confirmText !== 'تأكيد التصفية') {
      return errorResponse('يجب كتابة "تأكيد التصفية" للمتابعة', 400);
    }

    const keepUsers = body.keepUsers !== false; // Default: keep users

    // Collect stats before deletion
    const [
      snapshotCount,
      investorSnapshotCount,
      withdrawalCount,
      auditCount,
      bookingCount,
      expenseCount,
      investorCount,
      apartmentCount,
      projectCount,
      currencyCount,
      settingsCount,
    ] = await Promise.all([
      prisma.monthlySnapshot.count(),
      prisma.monthlyInvestorSnapshot.count(),
      prisma.withdrawal.count(),
      prisma.auditLog.count(),
      prisma.booking.count(),
      prisma.expense.count(),
      prisma.apartmentInvestor.count(),
      prisma.apartment.count(),
      prisma.project.count(),
      prisma.currencyRate.count(),
      prisma.systemSetting.count(),
    ]);

    // Delete in order (respecting FK constraints)
    const deleted: Record<string, number> = {};
    deleted.monthlyInvestorSnapshots = (await prisma.monthlyInvestorSnapshot.deleteMany({})).count;
    deleted.withdrawals = (await prisma.withdrawal.deleteMany({})).count;
    deleted.auditLogs = (await prisma.auditLog.deleteMany({})).count;
    deleted.monthlySnapshots = (await prisma.monthlySnapshot.deleteMany({})).count;
    deleted.bookings = (await prisma.booking.deleteMany({})).count;
    deleted.expenses = (await prisma.expense.deleteMany({})).count;
    deleted.apartmentInvestors = (await prisma.apartmentInvestor.deleteMany({})).count;
    deleted.apartments = (await prisma.apartment.deleteMany({})).count;
    deleted.projects = (await prisma.project.deleteMany({})).count;
    deleted.currencyRates = (await prisma.currencyRate.deleteMany({})).count;
    deleted.systemSettings = (await prisma.systemSetting.deleteMany({})).count;

    if (!keepUsers) {
      // Delete all accounting-role users except the current user
      deleted.users = (await prisma.user.deleteMany({
        where: {
          role: { in: ['OPS_MANAGER', 'BOOKING_MANAGER', 'INVESTOR'] },
          id: { not: session.user.id! },
        },
      })).count;
    }

    // Log the reset (this creates a fresh audit log entry)
    await logAuditEvent({
      userId: session.user.id!,
      userName: `${session.user.firstName} ${session.user.lastName}`,
      action: 'SYSTEM_RESET',
      entity: 'SYSTEM',
      metadata: {
        keepUsers,
        deleted,
        previousCounts: {
          snapshots: snapshotCount,
          investorSnapshots: investorSnapshotCount,
          withdrawals: withdrawalCount,
          auditLogs: auditCount,
          bookings: bookingCount,
          expenses: expenseCount,
          investors: investorCount,
          apartments: apartmentCount,
          projects: projectCount,
          currencies: currencyCount,
          settings: settingsCount,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'تمت تصفية النظام بالكامل',
      deleted,
      keepUsers,
    });
  } catch (error: any) {
    console.error('Reset error:', error);
    return errorResponse(`فشل في التصفية: ${error.message}`, 500);
  }
}
