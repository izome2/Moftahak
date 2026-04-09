'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LogIn, Phone, Plane, Clock, Building2, Loader2, User, Moon, UserCheck } from 'lucide-react';
import SupervisorSelect from './SupervisorSelect';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

interface CheckInRow {
  id: string;
  apartment: { id: string; name: string; floor?: number | null } | null;
  clientName: string;
  clientPhone?: string | null;
  arrivalTime?: string | null;
  flightNumber?: string | null;
  checkIn: string;
  checkOut: string;
  nights: number;
  receptionSupervisor?: string | null;
  notes?: string | null;
  status: string;
}

interface CheckInTableProps {
  checkIns: CheckInRow[];
  isLoading?: boolean;
  canAssignSupervisor?: boolean;
  onSupervisorSaved?: (bookingId: string, field: string, value: string) => void;
}

const CheckInTable: React.FC<CheckInTableProps> = ({
  checkIns,
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
          <span className="text-sm font-dubai">{t.accounting.daily.loadingCheckIn}</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="bg-white rounded-2xl border border-secondary/[0.08] overflow-hidden shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-secondary/[0.06]">
        <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center">
          <LogIn className="w-4 h-4 text-emerald-600" />
        </div>
        <h3 className="text-sm font-bold text-secondary font-dubai tracking-tight">
          {t.accounting.daily.checkInTitle}
        </h3>
        <span className="mr-auto bg-emerald-500/10 text-emerald-700 text-[11px] font-bold
          px-2.5 py-1 rounded-full font-dubai"
        >
          {checkIns.length} {t.accounting.common.booking}
        </span>
      </div>

      {checkIns.length === 0 ? (
        <div className="py-10 text-center text-secondary/70">
          <LogIn className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-dubai">{t.accounting.daily.noCheckIns}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="bg-secondary/[0.02] border-b border-secondary/[0.06]">
                <th className="text-right px-2 sm:px-4 py-2 sm:py-3 text-[11px] text-secondary/70 font-medium font-dubai"><span className="inline-flex items-center gap-1"><Building2 size={12} />{t.accounting.daily.apartment}</span></th>
                <th className="text-right px-2 sm:px-4 py-2 sm:py-3 text-[11px] text-secondary/70 font-medium font-dubai"><span className="inline-flex items-center gap-1"><User size={12} />{t.accounting.daily.guest}</span></th>
                <th className="text-right px-2 sm:px-4 py-2 sm:py-3 text-[11px] text-secondary/70 font-medium font-dubai hidden md:table-cell"><span className="inline-flex items-center gap-1"><Phone size={12} />{t.accounting.daily.contact}</span></th>
                <th className="text-right px-2 sm:px-4 py-2 sm:py-3 text-[11px] text-secondary/70 font-medium font-dubai hidden sm:table-cell"><span className="inline-flex items-center gap-1"><Clock size={12} />{t.accounting.daily.arrival}</span></th>
                <th className="text-right px-2 sm:px-4 py-2 sm:py-3 text-[11px] text-secondary/70 font-medium font-dubai"><span className="inline-flex items-center gap-1"><Moon size={12} />{t.accounting.daily.nights}</span></th>
                {canAssignSupervisor && (
                  <th className="text-right px-2 sm:px-4 py-2 sm:py-3 text-[11px] text-secondary/70 font-medium font-dubai"><span className="inline-flex items-center gap-1"><UserCheck size={12} />{t.accounting.daily.receptionSupervisor}</span></th>
                )}
              </tr>
            </thead>
            <tbody>
              {checkIns.map((row) => {
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

                    {/* الوصول */}
                    <td className="px-2 sm:px-4 py-2 sm:py-3 hidden sm:table-cell">
                      <div className="flex flex-col gap-0.5">
                        {row.arrivalTime && (
                          <span className="flex items-center gap-1 text-secondary/70 text-xs">
                            <Clock className="w-3 h-3" />
                            {row.arrivalTime}
                          </span>
                        )}
                        {row.flightNumber && (
                          <span className="flex items-center gap-1 text-secondary/80 text-xs">
                            <Plane className="w-3 h-3" />
                            {row.flightNumber}
                          </span>
                        )}
                        {!row.arrivalTime && !row.flightNumber && (
                          <span className="text-secondary/70 text-xs">—</span>
                        )}
                      </div>
                    </td>

                    {/* الليالي */}
                    <td className="px-2 sm:px-4 py-2 sm:py-3">
                      <span className="text-xs bg-secondary/[0.04] text-secondary/75 px-2 py-0.5
                        rounded-full font-dubai font-medium"
                      >
                        {new Intl.NumberFormat(locale).format(row.nights)} {t.accounting.common.night}
                      </span>
                    </td>

                    {/* مشرف الاستقبال */}
                    {canAssignSupervisor && (
                      <td className="px-2 sm:px-4 py-2 sm:py-3">
                        <SupervisorSelect
                          bookingId={row.id}
                          field="receptionSupervisor"
                          value={row.receptionSupervisor || null}
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

export default CheckInTable;
