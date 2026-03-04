'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface BalanceCardProps {
  totalProfit: number;
  totalWithdrawals: number;
  balance: number;
  currency?: string;
}

const formatCurrency = (amount: number, currency: string = 'USD') => {
  if (currency === 'EGP') return new Intl.NumberFormat('ar-EG').format(amount) + ' ج.م';
  return '$' + new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(amount);
};

const BalanceCard: React.FC<BalanceCardProps> = ({
  totalProfit,
  totalWithdrawals,
  balance,
  currency = 'USD',
}) => {
  const isPositive = balance > 0;
  const isZero = balance === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="bg-gradient-to-bl from-[#10302b] via-[#163d36] to-[#1a4a42] rounded-2xl
        border border-[#8a9a7a]/20 shadow-[0_8px_32px_rgba(16,48,43,0.35)] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 pt-5 pb-3">
        <div className="w-10 h-10 rounded-xl bg-white/8 border border-white/10
          flex items-center justify-center"
        >
          <Wallet className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white font-dubai">الرصيد النهائي</h3>
          <p className="text-[11px] text-white/35 font-dubai">ملخص الحساب الإجمالي</p>
        </div>
      </div>

      {/* 3 Widgets Grid */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3 px-4 sm:px-5 pb-5 pt-2">
        {/* Profit Widget */}
        <div className="flex flex-col items-center justify-center text-center
          bg-white/5 border border-white/8 rounded-xl px-2 py-4 sm:py-5
          hover:bg-white/8 transition-colors"
        >
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#8a9a7a]/15 border border-[#8a9a7a]/20
            flex items-center justify-center mb-2.5"
          >
            <TrendingUp className="w-5.5 h-5.5 sm:w-6 sm:h-6 text-[#b5c4a5]" />
          </div>
          <p className="text-[11px] sm:text-xs text-white/50 font-dubai mb-1">إجمالي الأرباح</p>
          <p className="text-sm sm:text-[15px] font-bold text-[#b5c4a5] font-dubai leading-tight">
            {formatCurrency(totalProfit, currency)}
          </p>
        </div>

        {/* Withdrawals Widget */}
        <div className="flex flex-col items-center justify-center text-center
          bg-white/5 border border-white/8 rounded-xl px-2 py-4 sm:py-5
          hover:bg-white/8 transition-colors"
        >
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#c09080]/15 border border-[#c09080]/20
            flex items-center justify-center mb-2.5"
          >
            <TrendingDown className="w-5.5 h-5.5 sm:w-6 sm:h-6 text-[#d4b0a0]" />
          </div>
          <p className="text-[11px] sm:text-xs text-white/50 font-dubai mb-1">إجمالي المسحوبات</p>
          <p className="text-sm sm:text-[15px] font-bold text-[#d4b0a0] font-dubai leading-tight">
            {formatCurrency(totalWithdrawals, currency)}
          </p>
        </div>

        {/* Balance Widget */}
        <div className="flex flex-col items-center justify-center text-center
          bg-white/8 border border-white/12 rounded-xl px-2 py-4 sm:py-5
          hover:bg-white/12 transition-colors"
        >
          <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl border
            flex items-center justify-center mb-2.5 ${
            isPositive
              ? 'bg-[#8a9a7a]/15 border-[#8a9a7a]/20'
              : isZero
                ? 'bg-white/8 border-white/10'
                : 'bg-[#c09080]/15 border-[#c09080]/20'
          }`}>
            {isZero ? (
              <Minus className="w-5.5 h-5.5 sm:w-6 sm:h-6 text-white/40" />
            ) : isPositive ? (
              <Wallet className="w-5.5 h-5.5 sm:w-6 sm:h-6 text-[#b5c4a5]" />
            ) : (
              <Wallet className="w-5.5 h-5.5 sm:w-6 sm:h-6 text-[#d4b0a0]" />
            )}
          </div>
          <p className="text-[11px] sm:text-xs text-white/50 font-dubai mb-1">الرصيد المتبقي</p>
          <p className={`text-[15px] sm:text-lg font-bold font-dubai leading-tight ${
            isPositive ? 'text-[#b5c4a5]' : isZero ? 'text-white/40' : 'text-[#d4b0a0]'
          }`}>
            {formatCurrency(balance, currency)}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default BalanceCard;
