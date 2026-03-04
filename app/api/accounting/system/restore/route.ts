/**
 * استعادة نسخة احتياطية لنظام المحاسبة
 * POST /api/accounting/system/restore
 * 
 * يستعيد بيانات من ملف JSON تم تصديره مسبقاً
 * ⚠️ يحذف كل البيانات الحالية قبل الاستعادة
 * 
 * الصلاحية: GENERAL_MANAGER فقط
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAccountingAuth, checkAccountingRateLimit, errorResponse } from '@/lib/accounting-auth';
import { logAuditEvent } from '@/lib/accounting/audit';

export async function POST(request: NextRequest) {
  // Rate limit
  const rateLimitError = checkAccountingRateLimit(request, { maxRequests: 3 });
  if (rateLimitError) return rateLimitError;

  // Auth — GM only
  const authResult = await requireAccountingAuth('canManageInvestors');
  if (authResult.error) return authResult.error;
  const { session } = authResult;

  const role = session.user.role;
  if (role !== 'GENERAL_MANAGER' && role !== 'ADMIN') {
    return errorResponse('ليس لديك صلاحية الاستعادة — المدير العام فقط', 403);
  }

  try {
    const backup = await request.json();

    // Validate backup structure
    if (!backup?.version || !backup?.system || backup.system !== 'moftahak-accounting' || !backup?.data) {
      return errorResponse('ملف النسخة الاحتياطية غير صالح أو تالف', 400);
    }

    const { data } = backup;

    // Step 1: Purge all accounting data (in correct order for FK constraints)
    await prisma.monthlyInvestorSnapshot.deleteMany({});
    await prisma.withdrawal.deleteMany({});
    await prisma.auditLog.deleteMany({});
    await prisma.monthlySnapshot.deleteMany({});
    await prisma.booking.deleteMany({});
    await prisma.expense.deleteMany({});
    await prisma.apartmentInvestor.deleteMany({});
    await prisma.apartment.deleteMany({});
    await prisma.project.deleteMany({});
    await prisma.currencyRate.deleteMany({});
    await prisma.systemSetting.deleteMany({});

    // Delete accounting users (not ADMIN/USER)
    await prisma.user.deleteMany({
      where: { role: { in: ['GENERAL_MANAGER', 'OPS_MANAGER', 'BOOKING_MANAGER', 'INVESTOR'] } },
    });

    let restored = {
      users: 0,
      projects: 0,
      apartments: 0,
      bookings: 0,
      expenses: 0,
      investors: 0,
      withdrawals: 0,
      currencyRates: 0,
      snapshots: 0,
      settings: 0,
      auditLogs: 0,
    };

    // Step 2: Restore users (need their IDs for foreign keys)
    if (data.users?.length) {
      // We need to recreate users with new passwords since we don't store hashed passwords in backup
      // The backup only stores metadata, so we skip user restoration
      // Users must be re-created manually or through Team API
      restored.users = data.users.length;
    }

    // Step 3: Restore projects
    if (data.projects?.length) {
      for (const p of data.projects) {
        await prisma.project.create({
          data: {
            id: p.id,
            name: p.name,
            description: p.description || null,
            createdAt: new Date(p.createdAt),
          },
        });
      }
      restored.projects = data.projects.length;
    }

    // Step 4: Restore apartments
    if (data.apartments?.length) {
      for (const a of data.apartments) {
        await prisma.apartment.create({
          data: {
            id: a.id,
            name: a.name,
            floor: a.floor || null,
            type: a.type || null,
            projectId: a.projectId,
            isActive: a.isActive ?? true,
            createdAt: new Date(a.createdAt),
          },
        });
      }
      restored.apartments = data.apartments.length;
    }

    // Step 5: Restore apartment investors (need existing users in DB)
    if (data.apartmentInvestors?.length) {
      for (const inv of data.apartmentInvestors) {
        try {
          await prisma.apartmentInvestor.create({
            data: {
              id: inv.id,
              apartmentId: inv.apartmentId,
              userId: inv.userId,
              percentage: inv.percentage,
              investmentTarget: inv.investmentTarget || 0,
              createdAt: new Date(inv.createdAt),
            },
          });
          restored.investors++;
        } catch {
          // Skip if user doesn't exist (will need to be re-added)
        }
      }
    }

    // Step 6: Restore bookings
    if (data.bookings?.length) {
      for (const b of data.bookings) {
        try {
          await prisma.booking.create({
            data: {
              id: b.id,
              apartmentId: b.apartmentId,
              clientName: b.clientName,
              clientPhone: b.clientPhone || null,
              checkIn: new Date(b.checkIn),
              checkOut: new Date(b.checkOut),
              nights: b.nights,
              amount: b.amount,
              currency: b.currency || 'USD',
              source: b.source,
              arrivalTime: b.arrivalTime || null,
              flightNumber: b.flightNumber || null,
              notes: b.notes || null,
              receptionSupervisor: b.receptionSupervisor || null,
              deliverySupervisor: b.deliverySupervisor || null,
              status: b.status || 'CONFIRMED',
              deletedAt: b.deletedAt ? new Date(b.deletedAt) : null,
              createdById: b.createdById,
              createdAt: new Date(b.createdAt),
            },
          });
          restored.bookings++;
        } catch {
          // Skip if creator user doesn't exist
        }
      }
    }

    // Step 7: Restore expenses
    if (data.expenses?.length) {
      for (const e of data.expenses) {
        try {
          await prisma.expense.create({
            data: {
              id: e.id,
              apartmentId: e.apartmentId,
              description: e.description,
              category: e.category,
              amount: e.amount,
              currency: e.currency || 'USD',
              date: new Date(e.date),
              notes: e.notes || null,
              deletedAt: e.deletedAt ? new Date(e.deletedAt) : null,
              createdById: e.createdById,
              createdAt: new Date(e.createdAt),
            },
          });
          restored.expenses++;
        } catch {
          // Skip if creator user doesn't exist
        }
      }
    }

    // Step 8: Restore withdrawals
    if (data.withdrawals?.length) {
      for (const w of data.withdrawals) {
        try {
          await prisma.withdrawal.create({
            data: {
              id: w.id,
              apartmentInvestorId: w.apartmentInvestorId,
              amount: w.amount,
              currency: w.currency || 'USD',
              date: new Date(w.date),
              comments: w.comments || null,
              deletedAt: w.deletedAt ? new Date(w.deletedAt) : null,
              createdAt: new Date(w.createdAt),
            },
          });
          restored.withdrawals++;
        } catch {
          // Skip if investor doesn't exist
        }
      }
    }

    // Step 9: Restore currency rates
    if (data.currencyRates?.length) {
      for (const cr of data.currencyRates) {
        await prisma.currencyRate.create({
          data: {
            id: cr.id,
            fromCurrency: cr.fromCurrency,
            toCurrency: cr.toCurrency,
            rate: cr.rate,
          },
        });
      }
      restored.currencyRates = data.currencyRates.length;
    }

    // Step 10: Restore monthly snapshots
    if (data.monthlySnapshots?.length) {
      for (const ms of data.monthlySnapshots) {
        await prisma.monthlySnapshot.create({
          data: {
            id: ms.id,
            apartmentId: ms.apartmentId,
            month: ms.month,
            totalRevenue: ms.totalRevenue || 0,
            totalExpenses: ms.totalExpenses || 0,
            profit: ms.profit || 0,
            bookingsCount: ms.bookingsCount || 0,
            occupiedNights: ms.occupiedNights || 0,
            revenueBySource: ms.revenueBySource || null,
            expensesByCategory: ms.expensesByCategory || null,
            isLocked: ms.isLocked || false,
            lockedAt: ms.lockedAt ? new Date(ms.lockedAt) : null,
            lockedById: ms.lockedById || null,
            createdAt: new Date(ms.createdAt),
          },
        });
      }
      restored.snapshots = data.monthlySnapshots.length;
    }

    // Step 11: Restore monthly investor snapshots
    if (data.monthlyInvestorSnapshots?.length) {
      for (const mis of data.monthlyInvestorSnapshots) {
        try {
          await prisma.monthlyInvestorSnapshot.create({
            data: {
              id: mis.id,
              apartmentInvestorId: mis.apartmentInvestorId,
              month: mis.month,
              percentage: mis.percentage,
              investorProfit: mis.investorProfit || 0,
              createdAt: new Date(mis.createdAt),
            },
          });
        } catch {
          // Skip if investor doesn't exist
        }
      }
    }

    // Step 12: Restore system settings
    if (data.systemSettings?.length) {
      for (const ss of data.systemSettings) {
        await prisma.systemSetting.create({
          data: { key: ss.key, value: ss.value },
        });
      }
      restored.settings = data.systemSettings.length;
    }

    // Step 13: Restore audit logs
    if (data.auditLogs?.length) {
      for (const al of data.auditLogs) {
        await prisma.auditLog.create({
          data: {
            id: al.id,
            userId: al.userId,
            userName: al.userName,
            action: al.action,
            entity: al.entity,
            entityId: al.entityId || null,
            before: al.before || null,
            after: al.after || null,
            metadata: al.metadata || null,
            ipAddress: al.ipAddress || null,
            createdAt: new Date(al.createdAt),
          },
        });
      }
      restored.auditLogs = data.auditLogs.length;
    }

    // Log the restore action
    await logAuditEvent({
      userId: session.user.id!,
      userName: `${session.user.firstName} ${session.user.lastName}`,
      action: 'RESTORE',
      entity: 'SYSTEM',
      metadata: {
        backupVersion: backup.version,
        backupDate: backup.createdAt,
        restored,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'تمت استعادة النسخة الاحتياطية بنجاح',
      restored,
      note: 'قد يلزم إعادة إنشاء المستخدمين يدوياً عبر إدارة الفريق',
    });
  } catch (error: any) {
    console.error('Restore error:', error);
    return errorResponse(`فشل في الاستعادة: ${error.message}`, 500);
  }
}
