'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, CalendarCheck, Moon, TrendingUp, Building2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

interface BookingSummaryProps {
  totalRevenue?: number;
  totalBookings: number;
  totalNights: number;
  averagePerNight?: number;
  apartmentsCount?: number;
  isLoading?: boolean;
  hideFinancials?: boolean;
}

const BookingSummary: React.FC<BookingSummaryProps> = ({
  totalRevenue,
  totalBookings,
  totalNights,
  averagePerNight,
  apartmentsCount,
  isLoading = false,
  hideFinancials = false,
}) => {
  const t = useTranslation();
  const { language } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG-u-nu-arab' : 'en-US';
  const currency = t.accounting.common.currency;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(locale).format(amount) + ' ' + currency;

  const revenue = totalRevenue ?? 0;
  const avg = averagePerNight ?? (totalNights > 0 ? revenue / totalNights : 0);

  const cards = [
    ...(!hideFinancials ? [{
      label: t.accounting.bookings.totalRevenue,
      value: formatCurrency(revenue),
      icon: DollarSign,
      gradient: 'from-emerald-500/10 to-emerald-500/5',
      iconBg: 'bg-emerald-500/15',
      iconColor: 'text-emerald-600',
      valueColor: 'text-emerald-700',
      accent: 'border-emerald-500/15',
    }] : []),
    {
      label: t.accounting.bookings.bookingsCount,
      value: new Intl.NumberFormat(locale).format(totalBookings),
      icon: CalendarCheck,
      gradient: 'from-blue-500/10 to-blue-500/5',
      iconBg: 'bg-blue-500/15',
      iconColor: 'text-blue-600',
      valueColor: 'text-secondary',
      accent: 'border-blue-500/15',
    },
    {
      label: t.accounting.bookings.nightsBooked,
      value: new Intl.NumberFormat(locale).format(totalNights),
      icon: Moon,
      gradient: 'from-violet-500/10 to-violet-500/5',
      iconBg: 'bg-violet-500/15',
      iconColor: 'text-violet-600',
      valueColor: 'text-secondary',
      accent: 'border-violet-500/15',
    },
    ...(!hideFinancials ? [{
      label: t.accounting.bookings.avgNightRate,
      value: formatCurrency(Math.round(avg)),
      icon: TrendingUp,
      gradient: 'from-amber-500/10 to-amber-500/5',
      iconBg: 'bg-amber-500/15',
      iconColor: 'text-amber-600',
      valueColor: 'text-secondary',
      accent: 'border-amber-500/15',
    }] : []),
    ...(apartmentsCount !== undefined ? [{
      label: t.accounting.bookings.activeApartments,
      value: new Intl.NumberFormat(locale).format(apartmentsCount!),
      icon: Building2,
      gradient: 'from-secondary/10 to-secondary/5',
      iconBg: 'bg-secondary/10',
      iconColor: 'text-secondary/70',
      valueColor: 'text-secondary',
      accent: 'border-secondary/10',
    }] : []),
  ];

  return (
    <div className={`grid grid-cols-2 gap-3 ${hideFinancials ? 'sm:grid-cols-3' : 'sm:grid-cols-3 lg:grid-cols-5'}`}>
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: i * 0.05 }}
          className={`relative overflow-hidden bg-gradient-to-br ${card.gradient} rounded-2xl border ${card.accent} p-4 group hover:shadow-md transition-shadow duration-300`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] text-secondary/75 font-dubai font-medium">{card.label}</span>
            <div className={`w-8 h-8 rounded-xl ${card.iconBg} flex items-center justify-center`}>
              <card.icon size={15} className={card.iconColor} />
            </div>
          </div>
          {isLoading ? (
            <div className="h-7 bg-secondary/8 rounded-lg w-20 animate-pulse" />
          ) : (
            <p className={`text-lg sm:text-xl font-bold font-dubai ${card.valueColor} tracking-tight`}>
              {card.value}
            </p>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default BookingSummary;
