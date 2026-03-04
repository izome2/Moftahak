/**
 * نسخة احتياطية محددة
 * 
 * GET    /api/accounting/system/backups/[id]  — جلب بيانات نسخة احتياطية كاملة
 * DELETE /api/accounting/system/backups/[id]  — حذف نسخة احتياطية
 * 
 * الصلاحية: GENERAL_MANAGER أو ADMIN فقط
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAccountingAuth, checkAccountingRateLimit, errorResponse } from '@/lib/accounting-auth';

// ═══════════════════════════════════════
// GET — جلب بيانات نسخة احتياطية كاملة
// ═══════════════════════════════════════
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitError = checkAccountingRateLimit(request, { maxRequests: 10 });
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAccountingAuth('canManageInvestors');
  if (authResult.error) return authResult.error;
  const { session } = authResult;

  const role = session.user.role;
  if (role !== 'GENERAL_MANAGER' && role !== 'ADMIN') {
    return errorResponse('ليس لديك صلاحية — المدير العام فقط', 403);
  }

  const { id } = await params;

  try {
    const backup = await prisma.systemBackup.findUnique({
      where: { id },
    });

    if (!backup) {
      return errorResponse('النسخة الاحتياطية غير موجودة', 404);
    }

    return NextResponse.json({ backup });
  } catch (error: any) {
    console.error('Get backup error:', error);
    return errorResponse('فشل في جلب النسخة الاحتياطية', 500);
  }
}

// ═══════════════════════════════════════
// DELETE — حذف نسخة احتياطية
// ═══════════════════════════════════════
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitError = checkAccountingRateLimit(request, { maxRequests: 5 });
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAccountingAuth('canManageInvestors');
  if (authResult.error) return authResult.error;
  const { session } = authResult;

  const role = session.user.role;
  if (role !== 'GENERAL_MANAGER' && role !== 'ADMIN') {
    return errorResponse('ليس لديك صلاحية — المدير العام فقط', 403);
  }

  const { id } = await params;

  try {
    const backup = await prisma.systemBackup.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!backup) {
      return errorResponse('النسخة الاحتياطية غير موجودة', 404);
    }

    await prisma.systemBackup.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: `تم حذف النسخة الاحتياطية "${backup.name}"`,
    });
  } catch (error: any) {
    console.error('Delete backup error:', error);
    return errorResponse('فشل في حذف النسخة الاحتياطية', 500);
  }
}
