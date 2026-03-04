'use client';

import React from 'react';
import { motion } from 'framer-motion';
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

interface MonthlyData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface RevenueExpenseChartProps {
  data: MonthlyData[];
  isLoading?: boolean;
}

// تحويل الشهر من YYYY-MM إلى اسم عربي مختصر
const formatMonthLabel = (month: string) => {
  const months: Record<string, string> = {
    '01': 'يناير', '02': 'فبراير', '03': 'مارس',
    '04': 'أبريل', '05': 'مايو', '06': 'يونيو',
    '07': 'يوليو', '08': 'أغسطس', '09': 'سبتمبر',
    '10': 'أكتوبر', '11': 'نوفمبر', '12': 'ديسمبر',
  };
  const [, m] = month.split('-');
  return months[m] || month;
};

const formatCurrency = (val: number) => {
  if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
  if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
  return val.toString();
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border-2 border-primary/20 rounded-xl p-3 shadow-lg font-dubai text-sm" dir="rtl">
      <p className="text-secondary font-bold mb-1.5">{formatMonthLabel(label)}</p>
      {payload.map((entry: { name: string; value: number; color: string }, i: number) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-secondary/70">{entry.name}:</span>
          <span className="font-bold text-secondary">
            {new Intl.NumberFormat('ar-EG').format(entry.value)} ج.م
          </span>
        </div>
      ))}
    </div>
  );
};

const RevenueExpenseChart: React.FC<RevenueExpenseChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="h-[300px] flex items-center justify-center text-secondary/50 font-dubai">
        لا توجد بيانات للعرض
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
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
            tickFormatter={formatCurrency}
            tick={{ fontSize: 11, fill: '#10302b', fontFamily: 'var(--font-dubai)' }}
            axisLine={false}
            tickLine={false}
            width={50}
          />
          <Tooltip content={<CustomTooltip />} cursor={false} />
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
            name="الإيرادات"
            stroke="#5a9a7a"
            strokeWidth={2.5}
            dot={{ fill: '#5a9a7a', r: 4, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6, strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="expenses"
            name="المصروفات"
            stroke="#c47a6c"
            strokeWidth={2.5}
            dot={{ fill: '#c47a6c', r: 4, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6, strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="profit"
            name="الربح"
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

export default RevenueExpenseChart;
