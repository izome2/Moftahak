/**
 * نظام الصلاحيات - Accounting System Permissions
 * يُستخدم في middleware (الطبقة الأولى) و API routes (الطبقة الثانية)
 */

import type { Role } from '@prisma/client';

// ============================================================================
// أنواع الصلاحيات
// ============================================================================

export type AccountingRole = 'GENERAL_MANAGER' | 'OPS_MANAGER' | 'BOOKING_MANAGER' | 'INVESTOR';

/** كل الأدوار التي لها وصول لنظام الحسابات */
export const ACCOUNTING_ROLES: AccountingRole[] = [
  'GENERAL_MANAGER',
  'OPS_MANAGER',
  'BOOKING_MANAGER',
  'INVESTOR',
];

/** التحقق إذا كان الدور من أدوار نظام الحسابات (ADMIN يُعامَل كـ GENERAL_MANAGER) */
export function isAccountingRole(role: string | undefined | null): boolean {
  if (role === 'ADMIN') return true;
  return ACCOUNTING_ROLES.includes(role as AccountingRole);
}

/** إرجاع الدور الفعلي في نظام الحسابات (ADMIN → GENERAL_MANAGER) */
export function getEffectiveAccountingRole(role: string | undefined | null): AccountingRole | null {
  if (!role) return null;
  if (role === 'ADMIN') return 'GENERAL_MANAGER';
  if (ACCOUNTING_ROLES.includes(role as AccountingRole)) return role as AccountingRole;
  return null;
}

/**
 * إرجاع جميع الأدوار الفعلية لمستخدم (الدور الأساسي + الأدوار الإضافية)
 * يُستخدم لدعم تعدد الوظائف للمستخدم الواحد
 */
export function getAllEffectiveRoles(
  primaryRole: string | undefined | null,
  additionalRoles?: string[] | null
): AccountingRole[] {
  const roles: AccountingRole[] = [];
  
  const primary = getEffectiveAccountingRole(primaryRole);
  if (primary) roles.push(primary);
  
  if (additionalRoles && Array.isArray(additionalRoles)) {
    for (const role of additionalRoles) {
      const effective = getEffectiveAccountingRole(role);
      if (effective && !roles.includes(effective)) {
        roles.push(effective);
      }
    }
  }
  
  return roles;
}

// ============================================================================
// تعريف الصلاحيات
// ============================================================================

export interface Permission {
  // إدارة الفريق والنظام
  canManageTeam: boolean;          // إنشاء/حذف/تعديل أعضاء الفريق والمستثمرين
  canManageApartments: boolean;    // إضافة/حذف/تعديل شقق ومشاريع
  canManageInvestors: boolean;     // إدارة المستثمرين ونسبهم ومسحوباتهم
  canEditAnyField: boolean;        // تعديل أي خانة في أي ملف
  canViewAllData: boolean;         // عرض كل البيانات (dashboard, reports)
  canManageSettings: boolean;      // إعدادات النظام (أقسام، سعر صرف، مشرفين)

  // الحجوزات
  canAddBookings: boolean;         // إضافة حجوزات جديدة
  canEditBookings: boolean;        // تعديل حجوزات قائمة
  canDeleteBookings: boolean;      // حذف حجوزات (soft delete)
  canViewBookings: boolean;        // عرض الحجوزات (للقراءة فقط)

  // المصروفات
  canAddExpenses: boolean;         // إضافة مصروفات
  canEditExpenses: boolean;        // تعديل مصروفات
  canDeleteExpenses: boolean;      // حذف مصروفات (soft delete)
  canViewExpenses: boolean;        // عرض المصروفات (للقراءة فقط)
  canApproveExpenses: boolean;     // اعتماد/رفض المصروفات (المدير العام فقط)

  // المتابعة اليومية
  canViewDailyOps: boolean;        // عرض جدول الدخول والخروج اليومي
  canAssignSupervisor: boolean;    // تعيين مشرف استقبال/استلام

  // المستثمر
  canViewOwnInvestments: boolean;  // عرض استثماراته وحساباته فقط

  // العهدة
  canViewCustody: boolean;         // عرض حساب العهدة
  canManageCustody: boolean;       // إنشاء/تعديل/تقفيل العهدة

  // Enterprise Features
  canLockMonths: boolean;          // قفل/فتح الأشهر المالية
  canViewAuditLog: boolean;        // عرض سجل المراجعة
}

// ============================================================================
// مصفوفة الصلاحيات لكل دور
// ============================================================================

const PERMISSIONS: Record<AccountingRole, Permission> = {
  /**
   * المدير العام - صلاحيات كاملة
   * يمكنه فعل كل شيء في النظام
   */
  GENERAL_MANAGER: {
    canManageTeam: true,
    canManageApartments: true,
    canManageInvestors: true,
    canEditAnyField: true,
    canViewAllData: true,
    canManageSettings: true,

    canAddBookings: true,
    canEditBookings: true,
    canDeleteBookings: true,
    canViewBookings: true,

    canAddExpenses: true,
    canEditExpenses: true,
    canDeleteExpenses: true,
    canViewExpenses: true,
    canApproveExpenses: true,

    canViewDailyOps: true,
    canAssignSupervisor: true,

    canViewOwnInvestments: false, // ليس مستثمراً

    canViewCustody: true,
    canManageCustody: true,

    canLockMonths: true,
    canViewAuditLog: true,
  },

  /**
   * مدير التشغيل - مصروفات + متابعة يومية
   * مسؤول عن المصروفات وحركة الدخول والخروج اليومي
   */
  OPS_MANAGER: {
    canManageTeam: false,
    canManageApartments: false,
    canManageInvestors: false,
    canEditAnyField: false,
    canViewAllData: false,
    canManageSettings: false,

    canAddBookings: false,
    canEditBookings: false,
    canDeleteBookings: false,
    canViewBookings: false,         // لا يرى الحجوزات ولا الإيرادات

    canAddExpenses: true,          // يضيف مصروفات
    canEditExpenses: true,         // يعدل مصروفاته فقط
    canDeleteExpenses: false,      // لا يحذف (المدير العام فقط)
    canViewExpenses: true,         // يرى مصروفاته فقط
    canApproveExpenses: false,

    canViewDailyOps: true,         // يرى جدول الدخول والخروج
    canAssignSupervisor: true,     // يعيّن مشرف الاستقبال/الاستلام

    canViewOwnInvestments: false,

    canViewCustody: true,          // يرى حساب العهدة الخاص به
    canManageCustody: false,       // لا ينشئ عهدة (المدير العام فقط)

    canLockMonths: false,
    canViewAuditLog: false,
  },

  /**
   * مدير الحجوزات - إدارة الحجوزات فقط
   * مسؤول عن إضافة وتعديل الحجوزات
   */
  BOOKING_MANAGER: {
    canManageTeam: false,
    canManageApartments: false,
    canManageInvestors: false,
    canEditAnyField: false,
    canViewAllData: false,
    canManageSettings: false,

    canAddBookings: true,          // يضيف حجوزات
    canEditBookings: true,         // يعدل حجوزاته
    canDeleteBookings: false,      // لا يحذف (المدير العام فقط)
    canViewBookings: true,

    canAddExpenses: false,
    canEditExpenses: false,
    canDeleteExpenses: false,
    canViewExpenses: false,        // لا يرى المصروفات
    canApproveExpenses: false,

    canViewDailyOps: false,        // لا يرى المتابعة اليومية
    canAssignSupervisor: false,

    canViewOwnInvestments: false,

    canViewCustody: false,
    canManageCustody: false,

    canLockMonths: false,
    canViewAuditLog: false,
  },

  /**
   * المستثمر - عرض حساباته فقط
   * يرى فقط الشقق المشترك فيها مع أرباحه ومسحوباته
   */
  INVESTOR: {
    canManageTeam: false,
    canManageApartments: false,
    canManageInvestors: false,
    canEditAnyField: false,
    canViewAllData: false,
    canManageSettings: false,

    canAddBookings: false,
    canEditBookings: false,
    canDeleteBookings: false,
    canViewBookings: false,        // لا يرى تفاصيل الحجوزات

    canAddExpenses: false,
    canEditExpenses: false,
    canDeleteExpenses: false,
    canViewExpenses: false,        // لا يرى تفاصيل المصروفات
    canApproveExpenses: false,

    canViewDailyOps: false,
    canAssignSupervisor: false,

    canViewOwnInvestments: true,   // يرى حساباته فقط

    canViewCustody: false,
    canManageCustody: false,

    canLockMonths: false,
    canViewAuditLog: false,
  },
};

// ============================================================================
// دوال التحقق
// ============================================================================

/**
 * إرجاع صلاحيات دور معين
 * إذا كان الدور غير معروف → لا صلاحيات
 */
export function getPermissions(role: string | AccountingRole): Permission {
  // ADMIN يحصل على نفس صلاحيات المدير العام
  if (role === 'ADMIN') {
    return PERMISSIONS.GENERAL_MANAGER;
  }
  if (role in PERMISSIONS) {
    return PERMISSIONS[role as AccountingRole];
  }
  // USER و أي دور غير معروف → لا صلاحيات حسابات
  return {
    canManageTeam: false,
    canManageApartments: false,
    canManageInvestors: false,
    canEditAnyField: false,
    canViewAllData: false,
    canManageSettings: false,
    canAddBookings: false,
    canEditBookings: false,
    canDeleteBookings: false,
    canViewBookings: false,
    canAddExpenses: false,
    canEditExpenses: false,
    canDeleteExpenses: false,
    canViewExpenses: false,
    canApproveExpenses: false,
    canViewDailyOps: false,
    canAssignSupervisor: false,
    canViewOwnInvestments: false,
    canViewCustody: false,
    canManageCustody: false,
    canLockMonths: false,
    canViewAuditLog: false,
  };
}

/**
 * إرجاع الصلاحيات المدمجة من جميع أدوار المستخدم
 * تُفعّل أي صلاحية موجودة في أي دور من أدوار المستخدم
 */
export function getMergedPermissions(
  primaryRole: string,
  additionalRoles?: string[] | null
): Permission {
  const allRoles = getAllEffectiveRoles(primaryRole, additionalRoles);
  
  if (allRoles.length === 0) {
    return getPermissions('USER');
  }
  
  if (allRoles.length === 1) {
    return getPermissions(allRoles[0]);
  }
  
  // دمج الصلاحيات من جميع الأدوار (OR logic)
  const merged = { ...getPermissions(allRoles[0]) };
  for (let i = 1; i < allRoles.length; i++) {
    const perms = getPermissions(allRoles[i]);
    for (const key of Object.keys(perms) as (keyof Permission)[]) {
      if (perms[key]) {
        (merged as Record<string, boolean>)[key] = true;
      }
    }
  }
  
  return merged;
}

/**
 * التحقق إذا كان المستخدم يملك صلاحية معينة
 * يدعم الأدوار المتعددة (يتحقق من الدور الأساسي + الأدوار الإضافية)
 */
export function hasPermission(
  role: string | undefined | null,
  permission: keyof Permission,
  additionalRoles?: string[] | null
): boolean {
  if (!role) return false;
  const perms = getMergedPermissions(role, additionalRoles);
  return perms[permission] ?? false;
}

/**
 * التحقق إذا كان المستخدم يملك أي صلاحية من قائمة صلاحيات
 * يدعم الأدوار المتعددة
 */
export function hasAnyPermission(
  role: string | undefined | null,
  permissions: (keyof Permission)[],
  additionalRoles?: string[] | null
): boolean {
  return permissions.some(p => hasPermission(role, p, additionalRoles));
}

// ============================================================================
// خريطة صلاحيات المسارات (للـ Middleware)
// ============================================================================

/** الأدوار المسموح لها بالوصول لكل مسار صفحة */
export const PAGE_ROLE_ACCESS: Record<string, AccountingRole[]> = {
  '/accounting':               ['GENERAL_MANAGER', 'OPS_MANAGER', 'BOOKING_MANAGER'],
  '/accounting/apartments':    ['GENERAL_MANAGER', 'OPS_MANAGER', 'BOOKING_MANAGER'],
  '/accounting/bookings':      ['GENERAL_MANAGER', 'BOOKING_MANAGER'],
  '/accounting/expenses':      ['GENERAL_MANAGER', 'OPS_MANAGER'],
  '/accounting/daily':         ['GENERAL_MANAGER', 'OPS_MANAGER'],
  '/accounting/custody':       ['GENERAL_MANAGER', 'OPS_MANAGER'],
  '/accounting/investors':     ['GENERAL_MANAGER'],
  '/accounting/my-investments': ['INVESTOR'],
  '/accounting/reports':       ['GENERAL_MANAGER'],
  '/accounting/month-lock':    ['GENERAL_MANAGER'],
  '/accounting/audit':         ['GENERAL_MANAGER'],
  '/accounting/settings':      ['GENERAL_MANAGER'],
};

/**
 * التحقق إذا كان الدور مسموح له بالوصول لمسار معين
 * يدعم الأدوار المتعددة
 */
export function canAccessPath(
  role: string | undefined | null,
  pathname: string,
  additionalRoles?: string[] | null
): boolean {
  if (!role) return false;

  // جمع كل الأدوار الفعلية
  const allRoles = getAllEffectiveRoles(role, additionalRoles);

  // ابحث عن أطول مسار مطابق (الأكثر تحديداً)
  let matchedPath = '';
  for (const path of Object.keys(PAGE_ROLE_ACCESS)) {
    if (pathname.startsWith(path) && path.length > matchedPath.length) {
      matchedPath = path;
    }
  }

  if (!matchedPath) return false;

  const allowedRoles = PAGE_ROLE_ACCESS[matchedPath];
  return allRoles.some(r => allowedRoles.includes(r));
}
