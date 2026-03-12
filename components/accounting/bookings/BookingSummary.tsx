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
      bgColor: 'bg-[#8a9a7a]/12',
      iconColor: 'text-[#8a9a7a]',
      valueColor: 'text-[#8a9a7a]',
    }] : []),
    {
      label: t.accounting.bookings.bookingsCount,
      value: new Intl.NumberFormat(locale).format(totalBookings),
      icon: CalendarCheck,
      bgColor: 'bg-primary/15',
      iconColor: 'text-primary',
      valueColor: 'text-secondary',
    },
    {
      label: t.accounting.bookings.nightsBooked,
      value: new Intl.NumberFormat(locale).format(totalNights),
      icon: Moon,
      bgColor: 'bg-secondary/8',
      iconColor: 'text-secondary/60',
      valueColor: 'text-secondary',
    },
    ...(!hideFinancials ? [{
      label: t.accounting.bookings.avgNightRate,
      value: formatCurrency(Math.round(avg)),
      icon: TrendingUp,
      bgColor: 'bg-primary/20',
      iconColor: 'text-primary',
      valueColor: 'text-secondary',
    }] : []),
    ...(apartmentsCount !== undefined ? [{
      label: t.accounting.bookings.activeApartments,
      value: new Intl.NumberFormat(locale).format(apartmentsCount!),
      icon: Building2,
      bgColor: 'bg-primary/12',
      iconColor: 'text-primary',
      valueColor: 'text-secondary',
    }] : []),
  ];

  return (
    <div className={`grid grid-cols-2 gap-3 ${hideFinancials ? 'sm:grid-cols-3' : 'sm:grid-cols-3 lg:grid-cols-5'}`}>
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.06 }}
          className="bg-white rounded-xl border-2 border-primary/20 p-4 shadow-[0_4px_20px_rgba(237,191,140,0.12)]"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded-lg ${card.bgColor} border border-primary/20`}>
              <card.icon size={16} className={card.iconColor} />
            </div>
            <span className="text-xs text-secondary/60 font-dubai">{card.label}</span>
          </div>
          {isLoading ? (
            <div className="h-7 bg-primary/10 rounded-lg w-20 animate-pulse" />
          ) : (
            <p className={`text-lg sm:text-xl font-bold font-dubai ${card.valueColor}`}>
              {card.value}
            </p>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default BookingSummary;
