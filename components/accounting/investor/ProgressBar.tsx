'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProgressBarProps {
  label: string;
  current: number;
  target: number;
  currency?: string;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  label,
  current,
  target,
  currency = 'USD',
  className = '',
}) => {
  const t = useTranslation();
  const { language } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG-u-nu-arab' : 'en-US';
  const currencyLabel = ' ' + t.accounting.common.currency;

  const formatCurrency = (amount: number, cur: string = currency) => {
    if (cur === 'EGP') return new Intl.NumberFormat(locale).format(amount) + currencyLabel;
    return '$' + new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(amount);
  };

  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const isComplete = percentage >= 100;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-sm font-dubai">
        <span className="text-secondary/90 font-medium">{label}</span>
        <div className="flex items-center gap-1.5">
          <span className={`font-bold ${isComplete ? 'text-[#8a9a7a]' : 'text-secondary'}`}>
            {new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(percentage)}%
          </span>
          {isComplete && <TrendingUp className="w-3.5 h-3.5 text-[#8a9a7a]" />}
        </div>
      </div>

      {/* Bar */}
      <div className="relative h-3 bg-primary/20 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          className={`absolute inset-y-0 right-0 rounded-full ${
            isComplete
              ? 'bg-gradient-to-l from-[#8a9a7a] to-[#a8b898]'
              : 'bg-gradient-to-l from-primary to-primary/70'
          }`}
        />
      </div>

      {/* Labels */}
      <div className="flex items-center justify-between text-xs text-secondary/90 font-dubai">
        <span>{t.accounting.investorPortal.achieved} <span className="text-secondary/90 font-medium">{formatCurrency(current, currency)}</span></span>
        <span>{t.accounting.investorPortal.target} <span className="text-secondary/90 font-medium">{formatCurrency(target, currency)}</span></span>
      </div>
    </div>
  );
};

export default ProgressBar;
