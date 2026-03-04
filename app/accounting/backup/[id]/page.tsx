'use client';

import React, { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  FolderKanban,
  Building2,
  CalendarCheck,
  Receipt,
  Users,
  Wallet,
  Clock,
  Database,
  Loader2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  DollarSign,
  FileText,
  Hash,
} from 'lucide-react';

interface BackupData {
  id: string;
  name: string;
  stats: Record<string, number>;
  createdByName: string;
  createdAt: string;
  data: {
    projects?: any[];
    apartments?: any[];
    bookings?: any[];
    expenses?: any[];
    apartmentInvestors?: any[];
    withdrawals?: any[];
    currencyRates?: any[];
    monthlySnapshots?: any[];
    monthlyInvestorSnapshots?: any[];
    systemSettings?: any[];
    auditLogs?: any[];
    users?: any[];
  };
}

type SectionKey = 'projects' | 'apartments' | 'bookings' | 'expenses' | 'investors' | 'withdrawals' | 'users' | 'auditLogs';

const SECTIONS: { key: SectionKey; label: string; icon: React.ElementType; dataKey: string; color: string }[] = [
  { key: 'projects', label: 'المشاريع', icon: FolderKanban, dataKey: 'projects', color: 'blue' },
  { key: 'apartments', label: 'الشقق', icon: Building2, dataKey: 'apartments', color: 'emerald' },
  { key: 'bookings', label: 'الحجوزات', icon: CalendarCheck, dataKey: 'bookings', color: 'purple' },
  { key: 'expenses', label: 'المصروفات', icon: Receipt, dataKey: 'expenses', color: 'red' },
  { key: 'investors', label: 'المستثمرين', icon: Users, dataKey: 'apartmentInvestors', color: 'amber' },
  { key: 'withdrawals', label: 'المسحوبات', icon: Wallet, dataKey: 'withdrawals', color: 'orange' },
  { key: 'users', label: 'المستخدمين', icon: Users, dataKey: 'users', color: 'teal' },
  { key: 'auditLogs', label: 'سجل المراجعة', icon: FileText, dataKey: 'auditLogs', color: 'gray' },
];

export default function BackupViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [backup, setBackup] = useState<BackupData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchBackup();
  }, [id]);

  const fetchBackup = async () => {
    try {
      const res = await fetch(`/api/accounting/system/backups/${id}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'فشل في جلب النسخة الاحتياطية');
      }
      const data = await res.json();
      setBackup(data.backup);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (key: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-l from-primary/20 via-accent/40 to-accent/60">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-3" />
          <p className="text-secondary font-dubai font-bold">جاري تحميل النسخة الاحتياطية...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !backup) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-l from-primary/20 via-accent/40 to-accent/60">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-8 shadow-xl border-2 border-red-200 max-w-md text-center space-y-4"
          dir="rtl"
        >
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 w-fit mx-auto">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-secondary font-dubai">خطأ</h2>
          <p className="text-secondary/60 font-dubai text-sm">{error || 'النسخة الاحتياطية غير موجودة'}</p>
          <button
            onClick={() => window.close()}
            className="px-6 py-2.5 rounded-xl bg-secondary text-white font-dubai font-bold text-sm hover:bg-secondary/90 transition-colors"
          >
            <ArrowRight className="w-4 h-4 inline ml-2" />
            إغلاق
          </button>
        </motion.div>
      </div>
    );
  }

  const backupData = backup.data;

  return (
    <div className="min-h-screen bg-gradient-to-l from-primary/20 via-accent/40 to-accent/60" dir="rtl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b-2 border-primary/20 shadow-lg"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 border-2 border-primary/30">
              <Database className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-secondary font-dubai">{backup.name}</h1>
              <div className="flex items-center gap-3 text-xs text-secondary/50 font-dubai">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(backup.createdAt).toLocaleDateString('ar-EG', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span>بواسطة {backup.createdByName}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-dubai font-bold">
              للقراءة فقط
            </span>
            <button
              onClick={() => window.close()}
              className="px-4 py-2 rounded-xl bg-secondary/10 text-secondary font-dubai font-bold text-sm hover:bg-secondary/20 transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6"
        >
          {backup.stats && Object.entries(backup.stats).filter(([, v]) => (v as number) > 0).map(([key, value], i) => (
            <div
              key={key}
              className="bg-white rounded-xl border-2 border-primary/15 p-3 text-center"
            >
              <p className="text-2xl font-bold text-secondary font-dubai">{value as number}</p>
              <p className="text-xs text-secondary/50 font-dubai">{translateKey(key)}</p>
            </div>
          ))}
        </motion.div>

        {/* Data Sections */}
        <div className="space-y-3">
          {SECTIONS.map((section, i) => {
            const items = (backupData as any)[section.dataKey] || [];
            if (items.length === 0) return null;
            const isExpanded = expandedSections.has(section.key);

            return (
              <motion.div
                key={section.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="bg-white rounded-2xl border-2 border-primary/15 overflow-hidden"
              >
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.key)}
                  className="w-full flex items-center justify-between p-4 hover:bg-primary/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl bg-${section.color}-50 border border-${section.color}-200`}>
                      <section.icon className={`w-4 h-4 text-${section.color}-600`} />
                    </div>
                    <div className="text-right">
                      <h3 className="font-bold text-secondary font-dubai text-sm">{section.label}</h3>
                      <p className="text-xs text-secondary/40 font-dubai">{items.length} عنصر</p>
                    </div>
                  </div>
                  {isExpanded
                    ? <ChevronUp className="w-5 h-5 text-secondary/40" />
                    : <ChevronDown className="w-5 h-5 text-secondary/40" />
                  }
                </button>

                {/* Section Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t-2 border-primary/10 p-4">
                        <div className="overflow-x-auto">
                          <DataTable items={items} section={section.key} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// Data Table Component
// ═══════════════════════════════════════
function DataTable({ items, section }: { items: any[]; section: SectionKey }) {
  const columns = getColumnsForSection(section);

  return (
    <table className="w-full text-sm font-dubai">
      <thead>
        <tr className="border-b-2 border-primary/10">
          <th className="text-right py-2 px-3 text-xs font-bold text-secondary/50">#</th>
          {columns.map(col => (
            <th key={col.key} className="text-right py-2 px-3 text-xs font-bold text-secondary/50 whitespace-nowrap">
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.slice(0, 100).map((item, i) => (
          <tr key={item.id || i} className="border-b border-primary/5 hover:bg-primary/5 transition-colors">
            <td className="py-2 px-3 text-xs text-secondary/40">{i + 1}</td>
            {columns.map(col => (
              <td key={col.key} className="py-2 px-3 text-xs text-secondary/80 whitespace-nowrap">
                {col.render ? col.render(item[col.key], item) : formatValue(item[col.key])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
      {items.length > 100 && (
        <tfoot>
          <tr>
            <td colSpan={columns.length + 1} className="py-3 text-center text-xs text-secondary/40 font-dubai">
              يُعرض أول 100 عنصر من {items.length}
            </td>
          </tr>
        </tfoot>
      )}
    </table>
  );
}

// ═══════════════════════════════════════
// Column Definitions
// ═══════════════════════════════════════
type Column = { key: string; label: string; render?: (val: any, item: any) => string };

function getColumnsForSection(section: SectionKey): Column[] {
  switch (section) {
    case 'projects':
      return [
        { key: 'name', label: 'الاسم' },
        { key: 'description', label: 'الوصف' },
        { key: 'createdAt', label: 'تاريخ الإنشاء', render: formatDate },
      ];
    case 'apartments':
      return [
        { key: 'name', label: 'الاسم' },
        { key: 'floor', label: 'الطابق' },
        { key: 'type', label: 'النوع' },
        { key: 'isActive', label: 'الحالة', render: (v: boolean) => v ? 'نشط' : 'غير نشط' },
      ];
    case 'bookings':
      return [
        { key: 'clientName', label: 'العميل' },
        { key: 'checkIn', label: 'الوصول', render: formatDate },
        { key: 'checkOut', label: 'المغادرة', render: formatDate },
        { key: 'nights', label: 'الليالي' },
        { key: 'amount', label: 'المبلغ', render: formatMoney },
        { key: 'currency', label: 'العملة' },
        { key: 'source', label: 'المصدر' },
        { key: 'status', label: 'الحالة' },
      ];
    case 'expenses':
      return [
        { key: 'description', label: 'الوصف' },
        { key: 'category', label: 'الفئة' },
        { key: 'amount', label: 'المبلغ', render: formatMoney },
        { key: 'currency', label: 'العملة' },
        { key: 'date', label: 'التاريخ', render: formatDate },
      ];
    case 'investors':
      return [
        { key: 'apartmentId', label: 'معرف الشقة' },
        { key: 'userId', label: 'معرف المستثمر' },
        { key: 'percentage', label: 'النسبة', render: (v: number) => `${v}%` },
      ];
    case 'withdrawals':
      return [
        { key: 'amount', label: 'المبلغ', render: formatMoney },
        { key: 'currency', label: 'العملة' },
        { key: 'date', label: 'التاريخ', render: formatDate },
        { key: 'comments', label: 'ملاحظات' },
      ];
    case 'users':
      return [
        { key: 'firstName', label: 'الاسم الأول' },
        { key: 'lastName', label: 'اسم العائلة' },
        { key: 'email', label: 'البريد' },
        { key: 'phone', label: 'الهاتف' },
        { key: 'role', label: 'الدور' },
      ];
    case 'auditLogs':
      return [
        { key: 'userName', label: 'المستخدم' },
        { key: 'action', label: 'الإجراء' },
        { key: 'entity', label: 'الكيان' },
        { key: 'createdAt', label: 'التاريخ', render: formatDate },
      ];
    default:
      return [];
  }
}

function formatValue(val: any): string {
  if (val === null || val === undefined) return '—';
  if (typeof val === 'boolean') return val ? 'نعم' : 'لا';
  return String(val);
}

function formatDate(val: any): string {
  if (!val) return '—';
  try {
    return new Date(val).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return String(val);
  }
}

function formatMoney(val: any): string {
  if (val === null || val === undefined) return '—';
  return Number(val).toLocaleString('ar-EG');
}

function translateKey(key: string): string {
  const map: Record<string, string> = {
    users: 'المستخدمين',
    projects: 'المشاريع',
    apartments: 'الشقق',
    bookings: 'الحجوزات',
    expenses: 'المصروفات',
    investors: 'المستثمرين',
    withdrawals: 'المسحوبات',
    snapshots: 'اللقطات',
    auditLogs: 'سجل المراجعة',
  };
  return map[key] || key;
}
