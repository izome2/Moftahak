/**
 * النسخ الاحتياطية للنظام
 * 
 * GET  /api/accounting/system/backups     — قائمة النسخ الاحتياطية
 * POST /api/accounting/system/backups     — إنشاء نسخة احتياطية جديدة وحفظها في قاعدة البيانات
 * 
 * الصلاحية: GENERAL_MANAGER أو ADMIN فقط
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAccountingAuth, checkAccountingRateLimit, errorResponse } from '@/lib/accounting-auth';

// ═══════════════════════════════════════
// GET — قائمة النسخ الاحتياطية (بدون بيانات كاملة)
// ═══════════════════════════════════════
export async function GET(request: NextRequest) {
  const rateLimitError = checkAccountingRateLimit(request, { maxRequests: 10 });
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAccountingAuth('canManageInvestors');
  if (authResult.error) return authResult.error;
  const { session } = authResult;

  const role = session.user.role;
  if (role !== 'GENERAL_MANAGER' && role !== 'ADMIN') {
    return errorResponse('ليس لديك صلاحية — المدير العام فقط', 403);
  }

  try {
    const backups = await prisma.systemBackup.findMany({
      select: {
        id: true,
        name: true,
        stats: true,
        createdBy: true,
        createdByName: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ backups });
  } catch (error: any) {
    console.error('List backups error:', error);
    return errorResponse('فشل في جلب قائمة النسخ الاحتياطية', 500);
  }
}

// ═══════════════════════════════════════
// POST — إنشاء نسخة احتياطية جديدة
// ═══════════════════════════════════════
export async function POST(request: NextRequest) {
  const rateLimitError = checkAccountingRateLimit(request, { maxRequests: 5 });
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAccountingAuth('canManageInvestors');
  if (authResult.error) return authResult.error;
  const { session } = authResult;

  const role = session.user.role;
  if (role !== 'GENERAL_MANAGER' && role !== 'ADMIN') {
    return errorResponse('ليس لديك صلاحية — المدير العام فقط', 403);
  }

  try {
    const body = await request.json();
    const name = body.name?.trim();

    if (!name || name.length < 2) {
      return errorResponse('يجب إدخال اسم النسخة الاحتياطية (حرفان على الأقل)', 400);
    }

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
      users,
      custodyRecords,
      opsManagerApartments,
      invitations,
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
      prisma.custody.findMany({ orderBy: { createdAt: 'asc' } }),
      prisma.opsManagerApartment.findMany({ orderBy: { createdAt: 'asc' } }),
      prisma.invitation.findMany({ orderBy: { createdAt: 'asc' } }),
    ]);

    const stats = {
      users: users.length,
      projects: projects.length,
      apartments: apartments.length,
      bookings: bookings.length,
      expenses: expenses.length,
      investors: apartmentInvestors.length,
      withdrawals: withdrawals.length,
      snapshots: monthlySnapshots.length,
      auditLogs: auditLogs.length,
      custodyRecords: custodyRecords.length,
      opsAssignments: opsManagerApartments.length,
    };

    const data = {
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
      custodyRecords,
      opsManagerApartments,
      invitations,
    };

    const backup = await prisma.systemBackup.create({
      data: {
        name,
        data,
        stats,
        createdBy: session.user.id!,
        createdByName: `${session.user.firstName} ${session.user.lastName}`,
      },
      select: {
        id: true,
        name: true,
        stats: true,
        createdByName: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء النسخة الاحتياطية بنجاح',
      backup,
    });
  } catch (error: any) {
    console.error('Create backup error:', error);
    return errorResponse('فشل في إنشاء النسخة الاحتياطية', 500);
  }
}
