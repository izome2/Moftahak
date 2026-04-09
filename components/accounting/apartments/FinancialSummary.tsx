'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Receipt, TrendingUp, CalendarCheck, Moon } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

interface FinancialSummaryProps {
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  bookingsCount?: number;
  occupiedNights?: number;
  isLoading?: boolean;
  hideRevenue?: boolean;
  hideExpenses?: boolean;
  hideProfit?: boolean;
}

const FinancialSummary: React.FC<FinancialSummaryProps> = ({
  totalRevenue,
  totalExpenses,
  profit,
  bookingsCount,
  occupiedNights,
  isLoading = false,
  hideRevenue = false,
  hideExpenses = false,
  hideProfit = false,
}) => {
  const t = useTranslation();
  const { language } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG-u-nu-arab' : 'en-US';
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(locale).format(amount) + ' ' + t.accounting.common.currency;

  const cards = [
    ...(!hideRevenue ? [{
      label: t.accounting.apartments.totalRevenue,
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      bgColor: 'bg-primary/15',
      iconColor: 'text-primary',
      valueColor: 'text-secondary',
    }] : []),
    ...(!hideExpenses ? [{
      label: t.accounting.apartments.totalExpenses,
      value: formatCurrency(totalExpenses),
      icon: Receipt,
      bgColor: 'bg-secondary/10',
      iconColor: 'text-secondary/90',
      valueColor: 'text-secondary',
    }] : []),
    ...(!hideProfit ? [{
      label: t.accounting.apartments.netProfit,
      value: formatCurrency(profit),
      icon: TrendingUp,
      bgColor: 'bg-primary/20',
      iconColor: 'text-primary',
      valueColor: 'text-secondary',
    }] : []),
    ...(bookingsCount !== undefined ? [{
      label: t.accounting.apartments.bookingsCount,
      value: new Intl.NumberFormat(locale).format(bookingsCount!),
      icon: CalendarCheck,
      bgColor: 'bg-primary/10',
      iconColor: 'text-primary',
      valueColor: 'text-secondary',
    }] : []),
    ...(occupiedNights !== undefined ? [{
      label: t.accounting.apartments.nightsBooked,
      value: new Intl.NumberFormat(locale).format(occupiedNights!),
      icon: Moon,
      bgColor: 'bg-primary/10',
      iconColor: 'text-primary',
      valueColor: 'text-secondary',
    }] : []),
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.06 }}
          className="bg-white rounded-xl border border-secondary/[0.08] p-4 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded-lg ${card.bgColor}`}>
              <card.icon size={16} className={card.iconColor} />
            </div>
            <span className="text-xs text-secondary/90 font-dubai">{card.label}</span>
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

export default FinancialSummary;
