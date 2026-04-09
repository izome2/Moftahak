'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LogOut, Phone, Building2, Loader2, User, Calendar, UserCheck } from 'lucide-react';
import SupervisorSelect from './SupervisorSelect';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

interface CheckOutRow {
  id: string;
  apartment: { id: string; name: string; floor?: number | null } | null;
  clientName: string;
  clientPhone?: string | null;
  checkOut: string;
  deliverySupervisor?: string | null;
  notes?: string | null;
  status: string;
}

interface CheckOutTableProps {
  checkOuts: CheckOutRow[];
  isLoading?: boolean;
  canAssignSupervisor?: boolean;
  onSupervisorSaved?: (bookingId: string, field: string, value: string) => void;
}

const CheckOutTable: React.FC<CheckOutTableProps> = ({
  checkOuts,
  isLoading,
  canAssignSupervisor = false,
  onSupervisorSaved,
}) => {
  const t = useTranslation();
  const { language } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG-u-nu-arab' : 'en-US';

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString(locale, { month: 'short', day: 'numeric' });
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-secondary/[0.08] shadow-sm p-8">
        <div className="flex items-center justify-center gap-2 text-secondary/70">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-dubai">{t.accounting.daily.loadingCheckOut}</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="bg-white rounded-2xl border border-secondary/[0.08] overflow-hidden shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-secondary/[0.06]">
        <div className="w-8 h-8 rounded-xl bg-rose-500/15 flex items-center justify-center">
          <LogOut className="w-4 h-4 text-rose-600" />
        </div>
        <h3 className="text-sm font-bold text-secondary font-dubai tracking-tight">
          {t.accounting.daily.checkOutTitle}
        </h3>
        <span className="mr-auto bg-rose-500/10 text-rose-700 text-[11px] font-bold
          px-2.5 py-1 rounded-full font-dubai"
        >
          {checkOuts.length} {t.accounting.common.booking}
        </span>
      </div>

      {checkOuts.length === 0 ? (
        <div className="py-10 text-center text-secondary/70">
          <LogOut className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-dubai">{t.accounting.daily.noCheckOuts}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-secondary/[0.02] border-b border-secondary/[0.06]">
                <th className="text-right px-2 sm:px-4 py-2 sm:py-3 text-[11px] text-secondary/70 font-medium font-dubai"><span className="inline-flex items-center gap-1"><Building2 size={12} />{t.accounting.daily.apartment}</span></th>
                <th className="text-right px-2 sm:px-4 py-2 sm:py-3 text-[11px] text-secondary/70 font-medium font-dubai"><span className="inline-flex items-center gap-1"><User size={12} />{t.accounting.daily.guest}</span></th>
                <th className="text-right px-2 sm:px-4 py-2 sm:py-3 text-[11px] text-secondary/70 font-medium font-dubai hidden md:table-cell"><span className="inline-flex items-center gap-1"><Phone size={12} />{t.accounting.daily.contact}</span></th>
                <th className="text-right px-2 sm:px-4 py-2 sm:py-3 text-[11px] text-secondary/70 font-medium font-dubai"><span className="inline-flex items-center gap-1"><Calendar size={12} />{t.accounting.daily.departure}</span></th>
                {canAssignSupervisor && (
                  <th className="text-right px-2 sm:px-4 py-2 sm:py-3 text-[11px] text-secondary/70 font-medium font-dubai"><span className="inline-flex items-center gap-1"><UserCheck size={12} />{t.accounting.daily.deliverySupervisor}</span></th>
                )}
              </tr>
            </thead>
            <tbody>
              {checkOuts.map((row) => {
                const hasActivity = row.status !== 'CANCELLED';
                return (
                  <tr
                    key={row.id}
                    className={`
                      transition-colors duration-150
                      ${hasActivity
                        ? 'bg-white hover:bg-secondary/[0.02]'
                        : 'bg-secondary/[0.02] opacity-50'
                      }
                    `}
                  >
                    {/* الشقة */}
                    <td className="px-2 sm:px-4 py-2 sm:py-3">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-secondary/70" />
                        <span className="font-medium text-secondary font-dubai">
                          {row.apartment?.name || '—'}
                        </span>
                      </div>
                    </td>

                    {/* الضيف */}
                    <td className="px-2 sm:px-4 py-2 sm:py-3">
                      <span className="font-medium text-secondary font-dubai">
                        {row.clientName}
                      </span>
                    </td>

                    {/* التواصل */}
                    <td className="px-2 sm:px-4 py-2 sm:py-3 hidden md:table-cell">
                      {row.clientPhone ? (
                        <a
                          href={`tel:${row.clientPhone}`}
                          className="flex items-center gap-1 text-secondary/70 hover:text-secondary
                            transition-colors"
                        >
                          <Phone className="w-3 h-3" />
                          <span className="text-xs font-mono" dir="ltr">{row.clientPhone}</span>
                        </a>
                      ) : (
                        <span className="text-secondary/70 text-xs">—</span>
                      )}
                    </td>

                    {/* الخروج */}
                    <td className="px-2 sm:px-4 py-2 sm:py-3">
                      <span className="text-secondary/70 text-xs font-dubai">
                        {formatDate(row.checkOut)}
                      </span>
                    </td>

                    {/* مشرف الاستلام */}
                    {canAssignSupervisor && (
                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        <SupervisorSelect
                          bookingId={row.id}
                          field="deliverySupervisor"
                          value={row.deliverySupervisor || null}
                          onSaved={onSupervisorSaved}
                        />
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default CheckOutTable;
