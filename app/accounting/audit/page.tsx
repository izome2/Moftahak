'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ScrollText,
  Filter,
  RefreshCw,
  Calendar,
  User,
  Search,
  ArrowUpDown,
  Banknote,
  Building2,
  CalendarDays,
  FileText,
  Tag,
  UserCircle,
  Phone,
  LogIn,
  LogOut,
  Globe,
  Moon,
  Info,
  BarChart3,
  Mail,
  ClipboardList,
  Lock,
  Home,
  CheckCircle2,
  XCircle,
  Camera,
  TrendingUp,
  TrendingDown,
  Bookmark,
  MessageSquare,
  ArrowLeftRight,
  CircleDot,
  Circle,
  Trash2,
  MapPin,
  Link,
  Clock,
  Plane,
  HardHat,
  CreditCard,
  Zap,
  Target,
  Hourglass,
  type LucideIcon,
} from 'lucide-react';
import { useToast } from '@/components/accounting/shared/Toast';
import CustomSelect from '@/components/accounting/shared/CustomSelect';

// ============================================================================
// Types
// ============================================================================

interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  entityId: string | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
}

interface AuditPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ============================================================================
// Constants
// ============================================================================

const ACTION_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  CREATE: { label: 'إنشاء', color: 'text-emerald-800', bg: 'bg-emerald-50' },
  UPDATE: { label: 'تعديل', color: 'text-sky-800', bg: 'bg-sky-50' },
  DELETE: { label: 'حذف', color: 'text-rose-800', bg: 'bg-rose-50' },
  LOCK_MONTH: { label: 'قفل شهر', color: 'text-amber-800', bg: 'bg-amber-50' },
  UNLOCK_MONTH: { label: 'فتح شهر', color: 'text-orange-800', bg: 'bg-orange-50' },
  WITHDRAWAL: { label: 'سحب', color: 'text-violet-800', bg: 'bg-violet-50' },
  SYSTEM_RESET: { label: 'تصفية النظام', color: 'text-rose-800', bg: 'bg-rose-50' },
  RESTORE: { label: 'استعادة', color: 'text-teal-800', bg: 'bg-teal-50' },
};

const ENTITY_LABELS: Record<string, string> = {
  BOOKING: 'حجز',
  EXPENSE: 'مصروف',
  INVESTOR: 'مستثمر',
  WITHDRAWAL: 'مسحوبات',
  MONTH: 'شهر',
  PROJECT: 'مشروع',
  APARTMENT: 'شقة',
  SETTING: 'إعدادات',
  SYSTEM: 'النظام',
};

const ENTITY_OPTIONS = [
  { value: '', label: 'جميع الكيانات' },
  { value: 'BOOKING', label: 'حجز' },
  { value: 'EXPENSE', label: 'مصروف' },
  { value: 'INVESTOR', label: 'مستثمر' },
  { value: 'WITHDRAWAL', label: 'مسحوبات' },
  { value: 'MONTH', label: 'قفل شهر' },
  { value: 'SYSTEM', label: 'النظام' },
];

const ACTION_OPTIONS = [
  { value: '', label: 'جميع العمليات' },
  { value: 'CREATE', label: 'إنشاء' },
  { value: 'UPDATE', label: 'تعديل' },
  { value: 'DELETE', label: 'حذف' },
  { value: 'LOCK_MONTH', label: 'قفل شهر' },
  { value: 'UNLOCK_MONTH', label: 'فتح شهر' },
  { value: 'WITHDRAWAL', label: 'سحب' },
  { value: 'SYSTEM_RESET', label: 'تصفية النظام' },
  { value: 'RESTORE', label: 'استعادة' },
];

// ترجمة أسماء الحقول التقنية للعربية
const FIELD_LABELS: Record<string, string> = {
  amount: 'المبلغ',
  updatedAt: 'تاريخ التحديث',
  createdAt: 'تاريخ الإنشاء',
  description: 'الوصف',
  category: 'التصنيف',
  apartmentId: 'الشقة',
  month: 'الشهر',
  newMonth: 'الشهر الجديد',
  oldMonth: 'الشهر السابق',
  guestName: 'اسم الضيف',
  clientName: 'اسم العميل',
  clientPhone: 'هاتف العميل',
  checkIn: 'تاريخ الدخول',
  checkOut: 'تاريخ الخروج',
  platform: 'المنصة',
  totalAmount: 'المبلغ الإجمالي',
  netAmount: 'الصافي',
  nightlyRate: 'سعر الليلة',
  nights: 'عدد الليالي',
  nightCount: 'عدد الليالي',
  status: 'الحالة',
  percentage: 'النسبة',
  name: 'الاسم',
  email: 'البريد',
  phone: 'الهاتف',
  notes: 'ملاحظات',
  isLocked: 'مقفل',
  allApartments: 'جميع الشقق',
  success: 'نجح',
  failed: 'فشل',
  investorSnapshots: 'لقطات المستثمرين',
  profit: 'الربح',
  revenue: 'الإيرادات',
  expenses: 'المصروفات',
  type: 'النوع',
  date: 'التاريخ',
  comments: 'التعليقات',
  currency: 'العملة',
  balanceAfter: 'الرصيد بعد',
  balanceBefore: 'الرصيد قبل',
  isDeleted: 'محذوف',
  title: 'العنوان',
  source: 'المصدر',
  arrivalTime: 'وقت الوصول',
  flightNumber: 'رقم الرحلة',
  receptionSupervisor: 'مشرف الاستقبال',
  deliverySupervisor: 'مشرف التسليم',
  commissionRate: 'نسبة العمولة',
  commission: 'العمولة',
  paidAmount: 'المبلغ المدفوع',
  remainingAmount: 'المتبقي',
  isPaid: 'مدفوع',
  paymentMethod: 'طريقة الدفع',
  isActive: 'نشط',
  investmentTarget: 'هدف الاستثمار',
  investorName: 'المستثمر',
  apartmentName: 'الشقة',
  keepUsers: 'الاحتفاظ بالمستخدمين',
  deleted: 'تم حذفه',
  previousCounts: 'الأعداد السابقة',
  bookings: 'الحجوزات',
  apartments: 'الشقق',
  projects: 'المشاريع',
  investors: 'المستثمرين',
  withdrawals: 'المسحوبات',
  auditLogs: 'سجل المراجعة',
  currencyRates: 'أسعار الصرف',
  systemSettings: 'إعدادات النظام',
  monthlySnapshots: 'اللقطات الشهرية',
  monthlyInvestorSnapshots: 'لقطات المستثمرين',
  apartmentInvestors: 'استثمارات الشقق',
  snapshots: 'اللقطات',
  settings: 'الإعدادات',
  currencies: 'العملات',
  backupVersion: 'إصدار النسخة',
  backupDate: 'تاريخ النسخة',
  restored: 'تم استعادته',
};

/** أيقونة لكل حقل */
const FIELD_ICONS: Record<string, LucideIcon> = {
  amount: Banknote,
  totalAmount: Banknote,
  netAmount: Banknote,
  paidAmount: Banknote,
  remainingAmount: Hourglass,
  commission: Banknote,
  apartmentId: Building2,
  allApartments: Home,
  month: CalendarDays,
  newMonth: CalendarDays,
  oldMonth: CalendarDays,
  date: CalendarDays,
  checkIn: LogIn,
  checkOut: LogOut,
  description: FileText,
  category: Tag,
  guestName: UserCircle,
  clientName: UserCircle,
  name: UserCircle,
  clientPhone: Phone,
  phone: Phone,
  email: Mail,
  platform: Globe,
  nightlyRate: Moon,
  nights: Moon,
  nightCount: Moon,
  status: Info,
  percentage: BarChart3,
  commissionRate: BarChart3,
  notes: ClipboardList,
  comments: MessageSquare,
  isLocked: Lock,
  success: CheckCircle2,
  failed: XCircle,
  investorSnapshots: Camera,
  profit: TrendingUp,
  revenue: TrendingUp,
  expenses: TrendingDown,
  type: Bookmark,
  currency: ArrowLeftRight,
  balanceAfter: CircleDot,
  balanceBefore: Circle,
  isDeleted: Trash2,
  title: MapPin,
  source: Link,
  arrivalTime: Clock,
  flightNumber: Plane,
  receptionSupervisor: HardHat,
  deliverySupervisor: HardHat,
  paymentMethod: CreditCard,
  isPaid: CheckCircle2,
  isActive: Zap,
  investmentTarget: Target,
  investorName: UserCircle,
  apartmentName: Building2,
};

/** رندر اسم الحقل مع أيقونة */
const FieldLabel = ({ fieldKey, className = '' }: { fieldKey: string; className?: string }) => {
  const Icon = FIELD_ICONS[fieldKey];
  const label = FIELD_LABELS[fieldKey] || fieldKey;
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      {Icon && <Icon size={12} className="text-secondary/70 shrink-0" />}
      {label}
    </span>
  );
};

/** الحقول التقنية التي لا تعني المستخدم */
const SKIP_FIELDS = new Set([
  'id', 'apartmentInvestorId', 'investorUserId', 'deletedById',
  'createdById', 'updatedById', 'userId', 'projectId', 'supervisorId',
  'deletedAt', 'updatedAt', 'createdAt', 'isDeleted',
  // إخفاء ID عند وجود اسم مقروء
  // apartmentId يُعرض فقط إذا لم يكن هناك apartmentName (يُعالج في formatValue)
]);

/** اختصار المعرف الطويل */
const shortenId = (id: string | null): string => {
  if (!id) return '—';
  if (id.length <= 10) return id;
  return id.slice(0, 4) + '…' + id.slice(-4);
};

/** ترجمة اسم الحقل (نص فقط) */
const translateField = (key: string): string => FIELD_LABELS[key] || key;

/** رمز العملة */
const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', EUR: '€', EGP: 'ج.م', SAR: 'ر.س', AED: 'د.إ', GBP: '£',
};
const CURRENCY_NAMES: Record<string, string> = {
  USD: 'دولار أمريكي', EUR: 'يورو', EGP: 'جنيه مصري',
  SAR: 'ريال سعودي', AED: 'درهم إماراتي', GBP: 'جنيه إسترليني',
};

/** هل الحقل مبلغ مالي */
const MONEY_FIELDS = new Set([
  'amount', 'totalAmount', 'netAmount', 'nightlyRate', 'paidAmount',
  'remainingAmount', 'commission', 'profit', 'revenue', 'expenses',
  'balanceAfter', 'balanceBefore', 'investmentTarget',
]);

/** تنسيق مبلغ مع العملة الصحيحة */
const formatMoney = (value: number, currency?: string): string => {
  const sym = CURRENCY_SYMBOLS[currency || 'EGP'] || currency || 'ج.م';
  return new Intl.NumberFormat('ar-EG').format(value) + ' ' + sym;
};

/** تنسيق القيم — يأخذ السياق الكامل (العملة + خريطة الشقق) */
const formatValue = (
  key: string,
  value: unknown,
  ctx: { currency?: string; apartmentsMap?: Record<string, string> }
): string => {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'نعم' : 'لا';

  // شقة → اسمها
  if (typeof value === 'string' && key === 'apartmentId' && ctx.apartmentsMap?.[value]) {
    return ctx.apartmentsMap[value];
  }
  // العملة → اسم عربي
  if (typeof value === 'string' && key === 'currency') {
    return CURRENCY_NAMES[value] || value;
  }
  // تواريخ ISO
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric', month: 'numeric', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(value));
  }
  // تاريخ بسيط YYYY-MM → أرقام عربية بدون صفر بادئة
  if (typeof value === 'string' && /^\d{4}-\d{2}$/.test(value)) {
    const [y, m] = value.split('-');
    const clean = `${y}-${parseInt(m)}`;
    return clean.replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
  }
  // مبالغ مالية
  if (typeof value === 'number' && MONEY_FIELDS.has(key)) {
    return formatMoney(value, ctx.currency);
  }
  // نسب مئوية
  if (typeof value === 'number' && (key === 'percentage' || key === 'commissionRate')) {
    return (value * 100).toFixed(1) + '%';
  }
  // أرقام عادية
  if (typeof value === 'number') {
    return new Intl.NumberFormat('ar-EG').format(value);
  }
  if (typeof value === 'object') {
    // Handle nested objects (like deleted, previousCounts) by converting to readable Arabic
    const obj = value as Record<string, unknown>;
    const parts = Object.entries(obj)
      .filter(([, v]) => v !== null && v !== undefined && v !== 0 && v !== '')
      .map(([k, v]) => {
        const label = FIELD_LABELS[k] || k;
        if (typeof v === 'boolean') return `${label}: ${v ? 'نعم' : 'لا'}`;
        if (typeof v === 'number') return `${label}: ${new Intl.NumberFormat('ar-EG').format(v)}`;
        if (typeof v === 'object') return null; // skip deeply nested
        return `${label}: ${v}`;
      })
      .filter(Boolean);
    return parts.join(' • ');
  }
  return String(value);
};

// ============================================================================
// Component
// ============================================================================

export default function AuditLogPage() {
  const toast = useToast();
  const toastRef = React.useRef(toast);
  toastRef.current = toast;

  const [allLogs, setAllLogs] = useState<AuditLogEntry[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [apartmentsMap, setApartmentsMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const ITEMS_PER_PAGE = 20;

  // Filters
  const [entityFilter, setEntityFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLogs = useCallback(async (pageNum = 1, append = false) => {
    if (append) setLoadingMore(true); else setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(pageNum), limit: String(ITEMS_PER_PAGE) });
      if (entityFilter) params.set('entity', entityFilter);
      if (actionFilter) params.set('action', actionFilter);

      const res = await fetch(`/api/accounting/audit?${params}`);
      const json = await res.json();

      if (res.ok) {
        const newLogs: AuditLogEntry[] = json.logs || [];
        if (append) {
          setAllLogs(prev => [...prev, ...newLogs]);
        } else {
          setAllLogs(newLogs);
        }
        const pagination: AuditPagination = json.pagination || { page: 1, limit: ITEMS_PER_PAGE, total: 0, totalPages: 0 };
        setPage(pagination.page);
        setHasMore(pagination.page < pagination.totalPages);
      } else {
        toastRef.current.error(json.error || 'فشل في تحميل السجلات');
      }
    } catch {
      toastRef.current.error('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [entityFilter, actionFilter]);

  // جلب أسماء الشقق مرة واحدة لترجمة IDs
  useEffect(() => {
    fetch('/api/accounting/apartments')
      .then(r => r.json())
      .then(data => {
        const map: Record<string, string> = {};
        const list: { id: string; name: string }[] = data.apartments || data || [];
        list.forEach(a => { map[a.id] = a.name; });
        setApartmentsMap(map);
      })
      .catch(() => {});
  }, []);

  // عند تغيير الفلاتر: أعد التحميل من الصفحة 1
  useEffect(() => {
    setAllLogs([]);
    setPage(1);
    setHasMore(true);
    fetchLogs(1, false);
  }, [fetchLogs]);

  // Infinite scroll: IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          fetchLogs(page + 1, true);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, page, fetchLogs]);

  const filteredLogs = searchQuery
    ? allLogs.filter(log =>
        log.userName.includes(searchQuery) ||
        log.entityId?.includes(searchQuery) ||
        ENTITY_LABELS[log.entity]?.includes(searchQuery) ||
        ACTION_LABELS[log.action]?.label?.includes(searchQuery)
      )
    : allLogs;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.floor((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));

    const timePart = new Intl.DateTimeFormat('ar-EG', {
      hour: '2-digit', minute: '2-digit',
    }).format(date);

    let dayPart: string;
    if (diffDays === 0) {
      dayPart = 'اليوم';
    } else if (diffDays === 1) {
      dayPart = 'أمس';
    } else if (diffDays === 2) {
      dayPart = 'أول أمس';
    } else {
      dayPart = new Intl.DateTimeFormat('ar-EG', {
        year: 'numeric', month: 'numeric', day: 'numeric',
      }).format(date);
    }

    return `${dayPart} - ${timePart}`;
  };

  /** استخراج عملة السجل من البيانات */
  const detectCurrency = (log: AuditLogEntry): string => {
    // ابحث في after ثم before ثم metadata
    for (const obj of [log.after, log.before, log.metadata]) {
      if (obj && typeof obj.currency === 'string') return obj.currency;
    }
    return 'EGP';
  };

  /** دمج بيانات السجل في عرض موحد مفهوم */
  const renderUnifiedDetails = (log: AuditLogEntry) => {
    const currency = detectCurrency(log);
    const ctx = { currency, apartmentsMap };

    // دمج metadata في بيانات العرض حسب نوع العملية
    const allData: Record<string, unknown> = {};

    // أضف بيانات metadata أولاً (الشقة، الشهر، الرصيد)
    if (log.metadata) {
      const meta = log.metadata;
      // إذا oldMonth === newMonth نعرض فقط "الشهر" بدل حقلين
      if (meta.oldMonth && meta.newMonth && meta.oldMonth === meta.newMonth) {
        Object.entries(meta).forEach(([k, v]) => {
          if (k === 'oldMonth' || k === 'newMonth') return;
          if (!SKIP_FIELDS.has(k)) allData[k] = v;
        });
        allData['month'] = meta.newMonth;
      } else {
        Object.entries(meta).forEach(([k, v]) => {
          if (!SKIP_FIELDS.has(k)) allData[k] = v;
        });
      }
    }

    // للتعديل: نعرض قبل وبعد جنباً لجنب
    if (log.action === 'UPDATE' && log.before && log.after) {
      const changedKeys = new Set([
        ...Object.keys(log.before).filter(k => !SKIP_FIELDS.has(k)),
        ...Object.keys(log.after).filter(k => !SKIP_FIELDS.has(k)),
      ]);

      // بيانات السياق (شقة، شهر) من metadata
      const contextEntries = Object.entries(allData).filter(
        ([k, v]) => {
          if (v === null || v === undefined) return false;
          // إخفاء apartmentId إذا كان اسم الشقة موجود
          if (k === 'apartmentId' && allData.apartmentName) return false;
          return true;
        }
      );

      return (
        <div className="space-y-3" dir="rtl">
          {/* سياق العملية */}
          {contextEntries.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {contextEntries.map(([key, value]) => (
                <span key={key} className="inline-flex items-center gap-1.5 text-xs bg-primary/10 text-secondary px-3 py-1.5 rounded-lg font-dubai">
                  <FieldLabel fieldKey={key} className="font-bold" />:
                  <span>{formatValue(key, value, ctx)}</span>
                </span>
              ))}
            </div>
          )}

          {/* جدول التغييرات */}
          <div className="bg-secondary/5 rounded-xl overflow-hidden">
            <div className="grid grid-cols-3 bg-secondary/10 px-4 py-2">
              <span className="text-xs font-bold text-secondary/60 font-dubai">الحقل</span>
              <span className="text-xs font-bold text-secondary/60 font-dubai">القيمة السابقة</span>
              <span className="text-xs font-bold text-secondary/60 font-dubai">القيمة الجديدة</span>
            </div>
            {[...changedKeys].map(key => (
              <div key={key} className="grid grid-cols-3 px-4 py-2 border-t border-secondary/5">
                <span className="text-xs font-bold text-secondary font-dubai"><FieldLabel fieldKey={key} /></span>
                <span className="text-xs text-secondary/50 font-dubai" style={{ textDecoration: 'line-through', textDecorationColor: 'rgba(16,48,43,0.25)', textUnderlineOffset: '0px' }}>
                  {formatValue(key, log.before?.[key], ctx)}
                </span>
                <span className="text-xs text-secondary font-bold font-dubai">
                  {formatValue(key, log.after?.[key], ctx)}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // للإنشاء / السحب / الحذف: عرض موحد
    const mainData = log.action === 'DELETE' ? log.before : log.after;
    if (mainData) {
      Object.entries(mainData).forEach(([k, v]) => {
        if (!SKIP_FIELDS.has(k) && v !== null && v !== undefined) {
          // metadata تأخذ أولوية (مثلاً amount في metadata هو المبلغ الصحيح)
          if (!(k in allData)) allData[k] = v;
        }
      });
    }

    // ترتيب ذكي: الشقة → المستثمر → الشهر → المبلغ → العملة → الباقي
    const priorityOrder = ['apartmentName', 'investorName', 'apartmentId', 'month', 'oldMonth', 'newMonth', 'amount', 'currency', 'balanceBefore', 'balanceAfter', 'description', 'category', 'clientName', 'guestName', 'date', 'checkIn', 'checkOut'];
    const entries = Object.entries(allData)
      .filter(([k, v]) => {
        if (v === null || v === undefined || v === '') return false;
        // إخفاء apartmentId إذا كان اسم الشقة موجود
        if (k === 'apartmentId' && allData.apartmentName) return false;
        return true;
      })
      .sort(([a], [b]) => {
        const ai = priorityOrder.indexOf(a);
        const bi = priorityOrder.indexOf(b);
        if (ai !== -1 && bi !== -1) return ai - bi;
        if (ai !== -1) return -1;
        if (bi !== -1) return 1;
        return 0;
      });

    if (entries.length === 0) return null;

    return (
      <div dir="rtl">
        <div className="bg-secondary/5 rounded-xl p-4 text-xs space-y-2">
          {entries.map(([key, value]) => (
            <div key={key} className="flex gap-2 items-baseline">
              <span className="text-secondary font-bold font-dubai shrink-0 min-w-[100px]"><FieldLabel fieldKey={key} />:</span>
              <span className="text-secondary/70 font-dubai">
                {formatValue(key, value, ctx)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6" dir="rtl">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10 shadow-md border-2 border-primary/30">
            <ScrollText size={24} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-secondary font-dubai">سجل المراجعة</h1>
            <p className="text-sm text-secondary/60 font-dubai">
              تتبع جميع العمليات المالية — مَن فعل ماذا ومتى
            </p>
          </div>
        </div>

        <button
          onClick={() => { setAllLogs([]); fetchLogs(1, false); }}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 hover:bg-primary/20 text-secondary font-dubai text-sm font-bold rounded-xl transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          تحديث
        </button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex flex-wrap items-center gap-3 bg-white border-2 border-primary/20 rounded-2xl p-4 shadow-[0_4px_20px_rgba(237,191,140,0.15)]"
      >
        <Filter size={18} className="text-secondary/40" />

        {/* Entity Filter */}
        <CustomSelect
          value={entityFilter}
          onChange={setEntityFilter}
          options={ENTITY_OPTIONS}
          placeholder="جميع الكيانات"
          variant="filter"
        />

        {/* Action Filter */}
        <CustomSelect
          value={actionFilter}
          onChange={setActionFilter}
          options={ACTION_OPTIONS}
          placeholder="جميع العمليات"
          variant="filter"
        />

        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary/30" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم أو المعرف..."
            className="w-full pr-9 pl-3 py-2 bg-primary/5 border border-primary/20 rounded-xl text-sm font-dubai text-secondary placeholder:text-secondary/30 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Total count */}
        <span className="text-xs text-secondary/50 font-dubai font-bold bg-primary/5 px-3 py-2 rounded-lg">
          {allLogs.length} سجل
        </span>
      </motion.div>

      {/* Logs Table */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white border-2 border-primary/20 rounded-2xl shadow-[0_4px_20px_rgba(237,191,140,0.15)] overflow-hidden"
      >
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-20 text-secondary/40 font-dubai">
            <ScrollText size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-lg font-bold">لا توجد سجلات</p>
            <p className="text-sm mt-1">ستظهر هنا جميع العمليات المالية بعد تنفيذها</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-primary/5 border-b-2 border-primary/10">
                  <th className="text-right px-4 py-3 font-dubai font-bold text-secondary/70 whitespace-nowrap">
                    <div className="flex items-center gap-1"><Calendar size={14} /> الوقت</div>
                  </th>
                  <th className="text-right px-4 py-3 font-dubai font-bold text-secondary/70 whitespace-nowrap">
                    <div className="flex items-center gap-1"><User size={14} /> المستخدم</div>
                  </th>
                  <th className="text-right px-4 py-3 font-dubai font-bold text-secondary/70 whitespace-nowrap">
                    <div className="flex items-center gap-1"><ArrowUpDown size={14} /> العملية</div>
                  </th>
                  <th className="text-right px-4 py-3 font-dubai font-bold text-secondary/70 whitespace-nowrap">الكيان</th>
                  <th className="text-right px-4 py-3 font-dubai font-bold text-secondary/70 whitespace-nowrap">المعرف</th>
                  <th className="text-right px-4 py-3 font-dubai font-bold text-secondary/70 whitespace-nowrap">التفاصيل</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, idx) => {
                    const actionInfo = ACTION_LABELS[log.action] || { label: log.action, color: 'text-gray-700', bg: 'bg-gray-100' };
                    const isExpanded = expandedId === log.id;

                    return (
                      <React.Fragment key={log.id}>
                        <motion.tr
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: Math.min(idx * 0.02, 0.4) }}
                          className={`border-b border-primary/5 hover:bg-primary/3 transition-colors cursor-pointer ${isExpanded ? 'bg-primary/5' : ''}`}
                          onClick={() => (log.before || log.after || log.metadata) && setExpandedId(isExpanded ? null : log.id)}
                        >
                          <td className="px-4 py-3 font-dubai text-secondary/70 whitespace-nowrap text-xs">
                            {formatDate(log.createdAt)}
                          </td>
                          <td className="px-4 py-3 font-dubai text-secondary font-semibold whitespace-nowrap">
                            {log.userName}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold font-dubai ${actionInfo.color} ${actionInfo.bg}`}>
                              {actionInfo.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-dubai text-secondary/70 text-xs">
                            {ENTITY_LABELS[log.entity] || log.entity}
                          </td>
                          <td className="px-4 py-3 text-xs text-secondary/60 font-dubai max-w-[140px]" title={log.entityId || ''}>
                            {log.entity === 'APARTMENT' && log.entityId && apartmentsMap[log.entityId]
                              ? apartmentsMap[log.entityId]
                              : (() => {
                                  const aptId = log.entityId?.split(':')[0];
                                  return aptId && apartmentsMap[aptId]
                                    ? apartmentsMap[aptId]
                                    : shortenId(log.entityId);
                                })()
                            }
                          </td>
                          <td className="px-4 py-3">
                            {(log.before || log.after || log.metadata) ? (
                              <span className="text-xs font-dubai font-bold text-secondary/80 hover:text-secondary transition-colors">
                                {isExpanded ? 'إخفاء ▲' : 'عرض ▼'}
                              </span>
                            ) : (
                              <span className="text-xs text-secondary/30">—</span>
                            )}
                          </td>
                        </motion.tr>

                        {/* Inline expanded details — directly below the same row */}
                        <tr>
                          <td colSpan={6} className="p-0">
                            {/* grid-template-rows 0fr→1fr is the smoothest CSS height animation */}
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateRows: isExpanded ? '1fr' : '0fr',
                                opacity: isExpanded ? 1 : 0,
                                transition: 'grid-template-rows 420ms cubic-bezier(0.4,0,0.2,1), opacity 380ms cubic-bezier(0.4,0,0.2,1)',
                              }}
                            >
                              <div style={{ overflow: 'hidden', minHeight: 0 }}>
                                <div className="border-t-2 border-primary/10 bg-accent/20 px-4 py-4 sm:px-6 sm:py-5">
                                  {renderUnifiedDetails(log)}
                                  {log.ipAddress && (
                                    <p className="mt-3 text-[10px] text-secondary/30 font-dubai">
                                      عنوان IP: {log.ipAddress}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-1" />
      {loadingMore && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          <span className="mr-3 text-sm font-dubai text-secondary/50">جار تحميل المزيد...</span>
        </div>
      )}
      {!hasMore && allLogs.length > 0 && (
        <p className="text-center text-xs text-secondary/30 font-dubai py-2">
          تم عرض جميع السجلات
        </p>
      )}
    </div>
  );
}
