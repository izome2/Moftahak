'use client';

import React, { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
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

const SECTION_DEFS: { key: SectionKey; sectionKey: keyof typeof import('@/lib/translations').default.ar.accounting.backup.sections; icon: React.ElementType; dataKey: string; color: string }[] = [
  { key: 'projects', sectionKey: 'projects', icon: FolderKanban, dataKey: 'projects', color: 'blue' },
  { key: 'apartments', sectionKey: 'apartments', icon: Building2, dataKey: 'apartments', color: 'emerald' },
  { key: 'bookings', sectionKey: 'bookings', icon: CalendarCheck, dataKey: 'bookings', color: 'purple' },
  { key: 'expenses', sectionKey: 'expenses', icon: Receipt, dataKey: 'expenses', color: 'red' },
  { key: 'investors', sectionKey: 'investors', icon: Users, dataKey: 'apartmentInvestors', color: 'amber' },
  { key: 'withdrawals', sectionKey: 'withdrawals', icon: Wallet, dataKey: 'withdrawals', color: 'orange' },
  { key: 'users', sectionKey: 'users', icon: Users, dataKey: 'users', color: 'teal' },
  { key: 'auditLogs', sectionKey: 'auditLog', icon: FileText, dataKey: 'auditLogs', color: 'gray' },
];

export default function BackupViewerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslation();
  const { language } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG' : 'en-US';
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
        throw new Error(err.error || t.accounting.errors.fetchBackup);
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
          <p className="text-secondary font-dubai font-bold">{t.accounting.backup.loading}</p>
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
          className="bg-white rounded-2xl p-8 shadow-xl border-2 border-rose-200/60 max-w-md text-center space-y-4"
          dir={language === 'ar' ? 'rtl' : 'ltr'}
        >
          <div className="p-3 rounded-xl bg-rose-50/80 border border-rose-200/60 w-fit mx-auto">
            <AlertTriangle className="w-8 h-8 text-rose-400" />
          </div>
          <h2 className="text-xl font-bold text-secondary font-dubai">{t.accounting.backup.error}</h2>
          <p className="text-secondary/60 font-dubai text-sm">{error || t.accounting.backup.notFound}</p>
          <button
            onClick={() => window.close()}
            className="px-6 py-2.5 rounded-xl bg-secondary text-white font-dubai font-bold text-sm hover:bg-secondary/90 transition-colors"
          >
            <ArrowRight className="w-4 h-4 inline ml-2" />
            {t.accounting.common.close}
          </button>
        </motion.div>
      </div>
    );
  }

  const backupData = backup.data;

  return (
    <div className="min-h-screen bg-gradient-to-l from-primary/20 via-accent/40 to-accent/60" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b-2 border-primary/20 shadow-lg"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 border-2 border-primary/30">
              <Database className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-secondary font-dubai">{backup.name}</h1>
              <div className="flex items-center gap-3 text-xs text-secondary/50 font-dubai">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(backup.createdAt).toLocaleDateString(locale, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span>{t.accounting.common.by} {backup.createdByName}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-dubai font-bold">
              {t.accounting.common.readOnly}
            </span>
            <button
              onClick={() => window.close()}
              className="px-4 py-2 rounded-xl bg-secondary/10 text-secondary font-dubai font-bold text-sm hover:bg-secondary/20 transition-colors"
            >
              {t.accounting.common.close}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
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
              <p className="text-xs text-secondary/50 font-dubai">{(t.accounting.backup.sections as any)[key] || key}</p>
            </div>
          ))}
        </motion.div>

        {/* Data Sections */}
        <div className="space-y-3">
          {SECTION_DEFS.map((section, i) => {
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
                    <div className={language === 'ar' ? 'text-right' : 'text-left'}>
                      <h3 className="font-bold text-secondary font-dubai text-sm">{t.accounting.backup.sections[section.sectionKey]}</h3>
                      <p className="text-xs text-secondary/40 font-dubai">{items.length} {t.accounting.common.item}</p>
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
                          <DataTable items={items} section={section.key} t={t} locale={locale} language={language} />
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
function DataTable({ items, section, t, locale, language }: { items: any[]; section: SectionKey; t: ReturnType<typeof useTranslation>; locale: string; language: string }) {
  const columns = getColumnsForSection(section, t, locale, language);

  return (
    <table className="w-full text-sm font-dubai">
      <thead>
        <tr className="border-b-2 border-primary/10">
          <th className={`${language === 'ar' ? 'text-right' : 'text-left'} py-2 px-3 text-xs font-bold text-secondary/50`}>#</th>
          {columns.map(col => (
            <th key={col.key} className={`${language === 'ar' ? 'text-right' : 'text-left'} py-2 px-3 text-xs font-bold text-secondary/50 whitespace-nowrap`}>
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
              {t.accounting.common.showing100of(items.length)}
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

function getColumnsForSection(section: SectionKey, t: ReturnType<typeof useTranslation>, locale: string, language: string): Column[] {
  const h = t.accounting.backup.headers;
  const c = t.accounting.common;
  const fmtDate = (val: any) => formatDate(val, locale);
  const fmtMoney = (val: any) => formatMoney(val, locale);
  switch (section) {
    case 'projects':
      return [
        { key: 'name', label: h.name },
        { key: 'description', label: h.description },
        { key: 'createdAt', label: h.createdAt, render: fmtDate },
      ];
    case 'apartments':
      return [
        { key: 'name', label: h.name },
        { key: 'floor', label: h.floor },
        { key: 'type', label: h.type },
        { key: 'isActive', label: h.status, render: (v: boolean) => v ? c.active : c.inactive },
      ];
    case 'bookings':
      return [
        { key: 'clientName', label: h.client },
        { key: 'checkIn', label: h.arrival, render: fmtDate },
        { key: 'checkOut', label: h.departure, render: fmtDate },
        { key: 'nights', label: h.nights },
        { key: 'amount', label: h.amount, render: fmtMoney },
        { key: 'currency', label: h.currency },
        { key: 'source', label: h.source },
        { key: 'status', label: h.status },
      ];
    case 'expenses':
      return [
        { key: 'description', label: h.description },
        { key: 'category', label: h.category },
        { key: 'amount', label: h.amount, render: fmtMoney },
        { key: 'currency', label: h.currency },
        { key: 'date', label: h.date, render: fmtDate },
      ];
    case 'investors':
      return [
        { key: 'apartmentId', label: h.apartmentId },
        { key: 'userId', label: h.investorId },
        { key: 'percentage', label: h.percentage, render: (v: number) => `${v}%` },
      ];
    case 'withdrawals':
      return [
        { key: 'amount', label: h.amount, render: fmtMoney },
        { key: 'currency', label: h.currency },
        { key: 'date', label: h.date, render: fmtDate },
        { key: 'comments', label: h.notes },
      ];
    case 'users':
      return [
        { key: 'firstName', label: h.firstName },
        { key: 'lastName', label: h.lastName },
        { key: 'email', label: h.email },
        { key: 'phone', label: h.phone },
        { key: 'role', label: h.role },
      ];
    case 'auditLogs':
      return [
        { key: 'userName', label: h.user },
        { key: 'action', label: h.action },
        { key: 'entity', label: h.entity },
        { key: 'createdAt', label: h.date, render: fmtDate },
      ];
    default:
      return [];
  }
}

function formatValue(val: any): string {
  if (val === null || val === undefined) return '—';
  if (typeof val === 'boolean') return val ? '✓' : '✗';
  return String(val);
}

function formatDate(val: any, locale: string = 'ar-EG'): string {
  if (!val) return '—';
  try {
    return new Date(val).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return String(val);
  }
}

function formatMoney(val: any, locale: string = 'ar-EG'): string {
  if (val === null || val === undefined) return '—';
  return Number(val).toLocaleString(locale);
}
