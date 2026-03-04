/**
 * API: Cron Job - إعادة حساب MonthlySnapshots
 * يُشغّل يومياً كـ safety net لضمان دقة البيانات
 * 
 * الحماية: يتطلب CRON_SECRET في الـ header
 * أو صلاحية canManageSettings (تشغيل يدوي)
 */

import { NextRequest } from 'next/server';
import { refreshAllSnapshots } from '@/lib/accounting/snapshot';
import { addSecurityHeaders } from '@/lib/security-headers';
import { NextResponse } from 'next/server';

// POST /api/cron/refresh-snapshots?month=YYYY-MM (اختياري)
export async function POST(request: NextRequest) {
  // التحقق من الصلاحية: CRON_SECRET أو جلسة مدير عام
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    // Cron job مصرح
  } else {
    // محاولة تحقق عبر الجلسة
    const { auth } = await import('@/lib/auth');
    const { hasPermission } = await import('@/lib/permissions');

    const session = await auth();
    if (!session?.user || !hasPermission(session.user.role, 'canManageSettings')) {
      return addSecurityHeaders(
        NextResponse.json({ error: 'غير مصرح' }, { status: 403 })
      );
    }
  }

  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month') || undefined;

  try {
    // دائماً نحدّث الشهر الحالي
    const result = await refreshAllSnapshots(month);

    // أيضاً نحدّث الشهر السابق (حجوزات متأخرة أو تعديلات بأثر رجعي)
    let prevMonthResult = null;
    if (!month) {
      const now = new Date();
      const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
      prevMonthResult = await refreshAllSnapshots(prevMonth);
    }

    return addSecurityHeaders(
      NextResponse.json({
        message: 'تم تحديث الملخصات الشهرية',
        month: month || 'current',
        ...result,
        ...(prevMonthResult ? { previousMonth: prevMonthResult } : {}),
      })
    );
  } catch (error) {
    console.error('[Cron] Failed to refresh snapshots:', error);
    return addSecurityHeaders(
      NextResponse.json(
        { error: 'فشل تحديث الملخصات', details: error instanceof Error ? error.message : 'Unknown' },
        { status: 500 }
      )
    );
  }
}
