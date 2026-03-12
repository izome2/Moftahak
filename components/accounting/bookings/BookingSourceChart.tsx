'use client';

import React from 'react';
import { motion } from 'framer-motion';
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

interface ApartmentRevenue {
  name: string;
  revenue: number;
}

interface BookingSourceChartProps {
  sourceData: SourceData[];
  apartmentData?: ApartmentRevenue[];
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

const BAR_COLORS = ['#10302b', '#edbf8c', '#c47a6c', '#7a9ab5', '#9a7ab5', '#5a9a7a', '#c4a86c'];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createCustomLabel = (locale: string) => ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
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
      {new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(percent * 100) + '%'}
    </text>
  );
};

const BookingSourceChart: React.FC<BookingSourceChartProps> = ({
  sourceData,
  apartmentData,
  isLoading,
}) => {
  const t = useTranslation();
  const { language } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG-u-nu-arab' : 'en-US';
  const currency = t.accounting.common.currency;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(locale).format(amount) + ' ' + currency;

  const renderCustomLabel = createCustomLabel(locale);

  const SOURCE_LABELS: Record<string, string> = {
    AIRBNB: 'Airbnb',
    BOOKING_COM: 'Booking.com',
    EXTERNAL: t.accounting.bookingSources.EXTERNAL,
    DIRECT: t.accounting.bookingSources.DIRECT,
    OTHER: t.accounting.bookingSources.OTHER,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const entry = payload[0];
    return (
      <div className="bg-white border-2 border-primary/20 rounded-xl p-3 shadow-lg font-dubai text-sm" dir="rtl">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.payload.fill }} />
          <span className="font-bold text-secondary">{entry.name}</span>
        </div>
        <p className="text-secondary/70">
          {t.accounting.bookings.amount}: <span className="font-bold text-secondary">{formatCurrency(entry.value)}</span>
        </p>
        {entry.payload.count !== undefined && (
          <p className="text-secondary/70">
            {t.accounting.bookings.bookingsList}: <span className="font-bold text-secondary">{entry.payload.count}</span>
          </p>
        )}
      </div>
    );
  };
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border-2 border-primary/20 p-6 h-[360px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
        <div className="bg-white rounded-xl border-2 border-primary/20 p-6 h-[360px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  const pieData = sourceData.map(d => ({
    name: SOURCE_LABELS[d.source] || d.source,
    value: d.amount,
    count: d.count,
    sourceKey: d.source,
  }));

  const hasBarData = apartmentData && apartmentData.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Pie Chart - Sources */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-xl border-2 border-primary/20 shadow-[0_4px_20px_rgba(237,191,140,0.12)] p-4"
      >
        <h3 className="text-sm font-bold text-secondary font-dubai mb-2 text-center">
          {t.accounting.bookings.sourceDistribution}
        </h3>
        {pieData.length === 0 ? (
          <div className="h-[280px] flex items-center justify-center text-secondary/40 font-dubai text-sm">
            {t.accounting.common.noData}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={340}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="45%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={115}
                innerRadius={40}
                cornerRadius={6}
                paddingAngle={2}
                dataKey="value"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth={2}
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={SOURCE_COLORS[entry.sourceKey] || FALLBACK_COLORS[index % FALLBACK_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} cursor={false} />
              <Legend
                verticalAlign="bottom"
                align="center"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontFamily: 'var(--font-dubai)', fontSize: 11, paddingTop: 10 }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Bar Chart - Apartments Revenue Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="bg-white rounded-xl border-2 border-primary/20 shadow-[0_4px_20px_rgba(237,191,140,0.12)] p-4"
      >
        <h3 className="text-sm font-bold text-secondary font-dubai mb-4 text-center">
          {t.accounting.bookings.apartmentRevenueComparison}
        </h3>
        {!hasBarData ? (
          <div className="h-[280px] flex items-center justify-center text-secondary/40 font-dubai text-sm">
            {t.accounting.common.noData}
          </div>
        ) : (
          <div className="space-y-2.5 px-1">
            {apartmentData!.map((apt, index) => {
              const maxRevenue = Math.max(...apartmentData!.map(a => a.revenue));
              const pct = maxRevenue > 0 ? (apt.revenue / maxRevenue) * 100 : 0;
              const color = BAR_COLORS[index % BAR_COLORS.length];
              return (
                <div key={index} className="group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-secondary font-dubai truncate max-w-[55%]">
                      {apt.name}
                    </span>
                    <span className="text-xs font-bold font-dubai" style={{ color }}>
                      {formatCurrency(apt.revenue)}
                    </span>
                  </div>
                  <div className="w-full h-5 bg-primary/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(pct, 2)}%` }}
                      transition={{ duration: 0.8, delay: 0.1 * index, ease: [0.25, 0.1, 0.25, 1] }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default BookingSourceChart;
