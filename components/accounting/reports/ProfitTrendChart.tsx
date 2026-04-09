'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useChartTooltip } from '@/hooks/useChartTooltip';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

interface MonthlyProfitData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface ProfitTrendChartProps {
  data: MonthlyProfitData[];
  isLoading?: boolean;
}

const formatCompact = (val: number, locale: string) => {
  if (val >= 1000000) return new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(val / 1000000) + 'M';
  if (val >= 1000) return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(val / 1000) + 'K';
  return new Intl.NumberFormat(locale).format(val);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label, monthNames, currencyLabel, locale }: any) => {
  if (!active || !payload?.length) return null;
  const formatMonthLabel = (month: string) => {
    const m = parseInt(month.split('-')[1], 10) - 1;
    return monthNames[m] || month;
  };
  return (
    <div className="bg-white border border-secondary/[0.08] rounded-xl p-3 shadow-lg font-dubai text-sm" dir="rtl">
      <p className="text-secondary font-bold mb-1.5">{formatMonthLabel(label)}</p>
      {payload.map((entry: { name: string; value: number; color: string }, i: number) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-secondary/90">{entry.name}:</span>
          <span className="font-bold text-secondary">
            {new Intl.NumberFormat(locale).format(entry.value)} {currencyLabel}
          </span>
        </div>
      ))}
    </div>
  );
};

const ProfitTrendChart: React.FC<ProfitTrendChartProps> = ({
  data,
  isLoading,
}) => {
  const t = useTranslation();
  const { language } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG-u-nu-arab' : 'en-US';
  const monthNames = t.accounting.months;
  const { onMouseMove, wrapperStyle } = useChartTooltip();

  const formatMonthLabel = (month: string) => {
    const m = parseInt(month.split('-')[1], 10) - 1;
    return monthNames[m] || month;
  };

  if (isLoading) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary/30" />
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="h-[300px] flex items-center justify-center text-secondary/90 font-dubai">
        {t.accounting.reports.noTrendData}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      onMouseMove={onMouseMove}
    >
      <ResponsiveContainer width="100%" height={340}>
        <LineChart data={data} margin={{ top: 10, right: 15, left: 15, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(16, 48, 43, 0.08)" />
          <XAxis
            dataKey="month"
            tickFormatter={formatMonthLabel}
            tick={{ fontSize: 11, fill: '#10302b', fontFamily: 'var(--font-dubai)' }}
            axisLine={{ stroke: 'rgba(16, 48, 43, 0.1)' }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={(v) => formatCompact(v, locale)}
            tick={{ fontSize: 11, fill: '#10302b', fontFamily: 'var(--font-dubai)' }}
            axisLine={false}
            tickLine={false}
            width={50}
          />
          <Tooltip content={<CustomTooltip monthNames={monthNames} currencyLabel={t.accounting.common.currency} locale={locale} />} cursor={false} wrapperStyle={wrapperStyle} isAnimationActive={false} allowEscapeViewBox={{ x: true, y: true }} />
          <Legend
            verticalAlign="top"
            align="center"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontFamily: 'var(--font-dubai)', fontSize: 12, paddingBottom: 10 }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            name={t.accounting.dashboard.revenue}
            stroke="#5a9a7a"
            strokeWidth={2.5}
            dot={{ fill: '#5a9a7a', r: 4, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6, strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="expenses"
            name={t.accounting.dashboard.expensesLabel}
            stroke="#c47a6c"
            strokeWidth={2.5}
            dot={{ fill: '#c47a6c', r: 4, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6, strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="profit"
            name={t.accounting.dashboard.profit}
            stroke="#edbf8c"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: '#edbf8c', r: 3, strokeWidth: 2, stroke: '#fff' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default ProfitTrendChart;
