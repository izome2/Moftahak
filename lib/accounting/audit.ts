/**
 * Audit Trail System - سجل المراجعة
 * 🔒 يسجل كل العمليات المالية (إنشاء/تعديل/حذف) مع القيم قبل وبعد
 * يُستدعى من كل API route بعد نجاح العملية
 */

import { prisma } from '@/lib/prisma';
import type { Prisma } from '@/generated/prisma';

// ============================================================================
// Types
// ============================================================================

export type AuditAction = 
  | 'CREATE' 
  | 'UPDATE' 
  | 'DELETE' 
  | 'LOCK_MONTH' 
  | 'UNLOCK_MONTH' 
  | 'WITHDRAWAL'
  | 'RESTORE'
  | 'SYSTEM_RESET';

export type AuditEntity = 
  | 'BOOKING' 
  | 'EXPENSE' 
  | 'INVESTOR' 
  | 'WITHDRAWAL' 
  | 'MONTH'
  | 'PROJECT'
  | 'APARTMENT'
  | 'CUSTODY'
  | 'SETTING'
  | 'SYSTEM';

export interface AuditEventParams {
  userId: string;
  userName: string;
  action: AuditAction;
  entity: AuditEntity;
  entityId?: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}

// ============================================================================
// Core Functions
// ============================================================================

/**
 * تسجيل حدث في سجل المراجعة
 * يتم تنفيذه بشكل غير مُعطِّل (fire-and-forget) لعدم تأثيره على أداء العملية الأصلية
 */
export async function logAuditEvent(params: AuditEventParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        userName: params.userName,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        before: (params.before ?? undefined) as Prisma.InputJsonValue | undefined,
        after: (params.after ?? undefined) as Prisma.InputJsonValue | undefined,
        metadata: (params.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
        ipAddress: params.ipAddress,
      },
    });
  } catch (error) {
    // Audit logging should never break the main operation
    console.error('[Audit] Failed to log event:', error);
  }
}

/**
 * استخراج IP من Request
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return 'unknown';
}

/**
 * إنشاء اسم المستخدم من بيانات الجلسة
 */
export function formatUserName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
}

// ============================================================================
// Diff Helpers - مساعدات المقارنة
// ============================================================================

/**
 * استخراج التغييرات بين كائنين (before/after)
 * يُرجع فقط الحقول التي تغيرت
 */
export function extractChanges(
  before: Record<string, unknown>,
  after: Record<string, unknown>
): { before: Record<string, unknown>; after: Record<string, unknown> } {
  const changedBefore: Record<string, unknown> = {};
  const changedAfter: Record<string, unknown> = {};

  for (const key of Object.keys(after)) {
    if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
      changedBefore[key] = before[key];
      changedAfter[key] = after[key];
    }
  }

  return { before: changedBefore, after: changedAfter };
}

/**
 * تنظيف كائن Prisma لتسجيله في audit log
 * يزيل الحقول الثقيلة مثل relations ويحتفظ بالحقول المهمة
 */
export function sanitizeForAudit(
  obj: Record<string, unknown>,
  excludeKeys: string[] = ['apartment', 'createdBy', 'user', 'apartmentInvestor', '_count']
): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (!excludeKeys.includes(key) && value !== undefined) {
      sanitized[key] = value;
    }
  }
  return sanitized;
}
