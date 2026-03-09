'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Building2, CalendarCheck, TrendingUp, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

interface ApartmentCardProps {
  apartment: {
    id: string;
    name: string;
    floor?: string | null;
    type?: string | null;
    project?: { id: string; name: string } | null;
    _count?: { bookings: number; investors: number };
  };
  summary?: {
    totalRevenue: number;
    totalExpenses: number;
    profit: number;
    bookingsCount: number;
  } | null;
  index?: number;
  isLoading?: boolean;
  /** إخفاء الإيرادات والأرباح (مثلاً لمدير التشغيل) */
  hideRevenue?: boolean;
}

const ApartmentCard: React.FC<ApartmentCardProps> = ({
  apartment,
  summary,
  index = 0,
  isLoading = false,
  hideRevenue = false,
}) => {
  const t = useTranslation();
  const { language } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG' : 'en-US';
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(locale).format(amount) + ' ' + t.accounting.common.currency;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Link
        href={`/accounting/apartments/${apartment.id}`}
        className="block bg-white rounded-2xl border-2 border-primary/20 p-5 hover:shadow-[0_8px_30px_rgba(237,191,140,0.25)] shadow-[0_4px_20px_rgba(237,191,140,0.12)] transition-all duration-300 group"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Building2 size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="text-base font-bold text-secondary font-dubai group-hover:text-primary transition-colors">
                {apartment.name}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                {apartment.project && (
                  <span className="text-xs text-secondary/50 font-dubai">
                    {apartment.project.name}
                  </span>
                )}
                {apartment.floor && (
                  <span className="text-xs text-secondary/40 font-dubai">
                    • {t.accounting.common.floor} {apartment.floor}
                  </span>
                )}
                {apartment.type && (
                  <span className="text-[10px] bg-primary/10 text-secondary/60 px-2 py-0.5 rounded-full font-dubai">
                    {apartment.type}
                  </span>
                )}
              </div>
            </div>
          </div>
          <ChevronLeft size={18} className="text-secondary/30 group-hover:text-primary transition-colors mt-1" />
        </div>

        {/* Stats */}
        {isLoading ? (
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-14 bg-accent/30 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : summary ? (
          <div className={`grid gap-3 ${hideRevenue ? 'grid-cols-1' : 'grid-cols-3'}`}>
            {!hideRevenue && (
              <div className="bg-[#8a9a7a]/8 rounded-xl p-2.5 text-center">
                <p className="text-[10px] text-[#8a9a7a]/70 font-dubai mb-0.5">{t.accounting.apartments.totalRevenue}</p>
                <p className="text-sm font-bold text-[#8a9a7a] font-dubai">
                  {formatCurrency(summary.totalRevenue)}
                </p>
              </div>
            )}
            <div className="bg-[#c09080]/8 rounded-xl p-2.5 text-center">
              <p className="text-[10px] text-[#c09080]/70 font-dubai mb-0.5">{t.accounting.apartments.totalExpenses}</p>
              <p className="text-sm font-bold text-[#c09080] font-dubai">
                {formatCurrency(summary.totalExpenses)}
              </p>
            </div>
            {!hideRevenue && (
              <div className={`${summary.profit >= 0 ? 'bg-primary/10' : 'bg-[#c09080]/8'} rounded-xl p-2.5 text-center`}>
                <p className="text-[10px] text-secondary/50 font-dubai mb-0.5">{t.accounting.apartments.netProfit}</p>
                <p className={`text-sm font-bold font-dubai ${summary.profit >= 0 ? 'text-secondary' : 'text-[#c09080]'}`}>
                  {formatCurrency(summary.profit)}
                </p>
              </div>
            )}
          </div>
        ) : null}

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-primary/10">
          <div className="flex items-center gap-1.5 text-secondary/50">
            <CalendarCheck size={13} />
            <span className="text-xs font-dubai">
              {apartment._count?.bookings || 0} {t.accounting.common.booking}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-secondary/50">
            <TrendingUp size={13} />
            <span className="text-xs font-dubai">
              {apartment._count?.investors || 0} {t.accounting.common.investor}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ApartmentCard;
