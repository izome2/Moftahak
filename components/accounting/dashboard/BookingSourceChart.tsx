'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useChartTooltip } from '@/hooks/useChartTooltip';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

interface SourceData {
  source: string;
  amount: number;
  count: number;
}

interface BookingSourceChartProps {
  data: SourceData[];
  isLoading?: boolean;
}

const SOURCE_COLORS: Record<string, string> = {
  AIRBNB: '#c47a6c',
  BOOKING_COM: '#7a9ab5',
  EXTERNAL: '#10302b',
  DIRECT: '#edbf8c',
  OTHER: '#8a857e',
};

const FALLBACK_COLORS = ['#c47a6c', '#7a9ab5', '#10302b', '#edbf8c', '#8a857e'];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x} y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight="bold"
      fontFamily="var(--font-dubai)"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const BookingSourceChart: React.FC<BookingSourceChartProps> = ({ data, isLoading }) => {
  const t = useTranslation();
  const { language } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG-u-nu-arab' : 'en-US';
  const currency = t.accounting.common.currency;
  const { onMouseMove, wrapperStyle } = useChartTooltip();

  const SOURCE_LABELS: Record<string, string> = {
    AIRBNB: 'Airbnb',
    BOOKING_COM: 'Booking.com',
    ...t.accounting.bookingSources,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const entry = payload[0];
    const d = entry.payload;
    return (
      <div className="bg-white border border-secondary/[0.08] rounded-xl p-3 shadow-lg font-dubai text-sm" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.fill }} />
          <span className="font-bold text-secondary">{d.name}</span>
        </div>
        <p className="text-secondary/70">
          {t.accounting.dashboard.amount} <span className="font-bold text-secondary">{new Intl.NumberFormat(locale).format(d.amount)} {currency}</span>
        </p>
        {d.count !== undefined && (
          <p className="text-secondary/70">
            {t.accounting.dashboard.bookingsLabel} <span className="font-bold text-secondary">{d.count}</span>
          </p>
        )}
      </div>
    );
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
      <div className="h-[300px] flex items-center justify-center text-secondary/75 font-dubai">
        {t.accounting.dashboard.noBookingsThisMonth}
      </div>
    );
  }

  const chartData = data.map(d => ({
    name: SOURCE_LABELS[d.source] || d.source,
    value: d.count,
    amount: d.amount,
    count: d.count,
    sourceKey: d.source,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      onMouseMove={onMouseMove}
    >
      <ResponsiveContainer width="100%" height={340}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={120}
            innerRadius={45}
            cornerRadius={6}
            paddingAngle={2}
            dataKey="value"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth={2}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={index}
                fill={SOURCE_COLORS[entry.sourceKey] || FALLBACK_COLORS[index % FALLBACK_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} cursor={false} wrapperStyle={wrapperStyle} isAnimationActive={false} allowEscapeViewBox={{ x: true, y: true }} />
          <Legend
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontFamily: 'var(--font-dubai)', fontSize: 11, paddingTop: 10 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default BookingSourceChart;
