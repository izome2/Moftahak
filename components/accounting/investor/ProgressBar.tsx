'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

interface ProgressBarProps {
  label: string;
  current: number;
  target: number;
  currency?: string;
  className?: string;
}

const formatCurrency = (amount: number, currency: string = 'USD') => {
  if (currency === 'EGP') return new Intl.NumberFormat('ar-EG').format(amount) + ' ج.م';
  return '$' + new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(amount);
};

const ProgressBar: React.FC<ProgressBarProps> = ({
  label,
  current,
  target,
  currency = 'USD',
  className = '',
}) => {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const isComplete = percentage >= 100;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-sm font-dubai">
        <span className="text-secondary/70 font-medium">{label}</span>
        <div className="flex items-center gap-1.5">
          <span className={`font-bold ${isComplete ? 'text-[#8a9a7a]' : 'text-secondary'}`}>
            {percentage.toFixed(1)}%
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
      <div className="flex items-center justify-between text-xs text-secondary/40 font-dubai">
        <span>المحقق: <span className="text-secondary/70 font-medium">{formatCurrency(current, currency)}</span></span>
        <span>الهدف: <span className="text-secondary/70 font-medium">{formatCurrency(target, currency)}</span></span>
      </div>
    </div>
  );
};

export default ProgressBar;
