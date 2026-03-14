'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useChartTooltip } from '@/hooks/useChartTooltip';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

interface ApartmentData {
  name: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface ApartmentComparisonChartProps {
  data: ApartmentData[];
  isLoading?: boolean;
}

const formatCompact = (val: number, locale: string) => {
  if (val >= 1000000) return new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(val / 1000000) + 'M';
  if (val >= 1000) return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(val / 1000) + 'K';
  return new Intl.NumberFormat(locale).format(val);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label, currencyLabel, locale }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border-2 border-primary/20 rounded-xl p-3 shadow-lg font-dubai text-sm" dir="rtl">
      <p className="text-secondary font-bold mb-1.5">{label}</p>
      {payload.map((entry: { name: string; value: number; color: string }, i: number) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-secondary/70">{entry.name}:</span>
          <span className="font-bold text-secondary">
            {new Intl.NumberFormat(locale).format(entry.value)} {currencyLabel}
          </span>
        </div>
      ))}
    </div>
  );
};

const ApartmentComparisonChart: React.FC<ApartmentComparisonChartProps> = ({
  data,
  isLoading,
}) => {
  const t = useTranslation();
  const { language } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG-u-nu-arab' : 'en-US';
  const { onMouseMove, wrapperStyle } = useChartTooltip();

  if (isLoading) {
    return (
      <div className="h-[320px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="h-[320px] flex items-center justify-center text-secondary/50 font-dubai">
        {t.accounting.reports.noComparisonData}
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
      <ResponsiveContainer width="100%" height={360}>
        <BarChart data={data} margin={{ top: 10, right: 15, left: 15, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(16, 48, 43, 0.08)" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fill: '#10302b', fontFamily: 'var(--font-dubai)' }}
            axisLine={{ stroke: 'rgba(16, 48, 43, 0.1)' }}
            tickLine={false}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tickFormatter={(v) => formatCompact(v, locale)}
            tick={{ fontSize: 11, fill: '#10302b', fontFamily: 'var(--font-dubai)' }}
            axisLine={false}
            tickLine={false}
            width={50}
          />
          <Tooltip content={<CustomTooltip currencyLabel={t.accounting.common.currency} locale={locale} />} cursor={false} wrapperStyle={wrapperStyle} isAnimationActive={false} allowEscapeViewBox={{ x: true, y: true }} />
          <Legend
            verticalAlign="top"
            align="center"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontFamily: 'var(--font-dubai)', fontSize: 12, paddingBottom: 10 }}
          />
          <Bar
            dataKey="revenue"
            name={t.accounting.dashboard.revenue}
            fill="#5a9a7a"
            radius={[6, 6, 0, 0]}
            maxBarSize={40}
          />
          <Bar
            dataKey="expenses"
            name={t.accounting.dashboard.expensesLabel}
            fill="#c47a6c"
            radius={[6, 6, 0, 0]}
            maxBarSize={40}
          />
          <Bar
            dataKey="profit"
            name={t.accounting.dashboard.profit}
            fill="#edbf8c"
            radius={[6, 6, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default ApartmentComparisonChart;
