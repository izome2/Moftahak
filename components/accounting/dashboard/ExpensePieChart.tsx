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

interface CategoryData {
  category: string;
  amount: number;
}

interface ExpensePieChartProps {
  data: CategoryData[];
  isLoading?: boolean;
}

// ترجمة أقسام المصروفات
const CATEGORY_LABELS: Record<string, string> = {
  CLEANING: 'نظافة',
  MAINTENANCE: 'صيانة',
  ELECTRICITY: 'كهرباء',
  WATER: 'مياه',
  GAS: 'غاز',
  INTERNET: 'إنترنت',
  FURNITURE: 'أثاث',
  SUPPLIES: 'مستلزمات',
  COMMISSION: 'عمولة',
  TAXES: 'ضرائب',
  INSURANCE: 'تأمين',
  MANAGEMENT: 'إدارة',
  OTHER: 'أخرى',
};

const COLORS = [
  '#10302b', '#edbf8c', '#5a9a7a', '#c47a6c', '#7a9ab5',
  '#9a7ab5', '#c4a86c', '#b57a8a', '#6ab5a5', '#a0b56a',
  '#c49a6c', '#8a7ab5', '#7ab5a5',
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="bg-white border-2 border-primary/20 rounded-xl p-3 shadow-lg font-dubai text-sm" dir="rtl">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.payload.fill }} />
        <span className="text-secondary/70">{entry.name}:</span>
        <span className="font-bold text-secondary">
          {new Intl.NumberFormat('ar-EG').format(entry.value)} ج.م
        </span>
      </div>
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.05) return null; // لا تعرض النسبة إذا أقل من 5%
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

const ExpensePieChart: React.FC<ExpensePieChartProps> = ({ data, isLoading }) => {
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
        لا توجد مصروفات هذا الشهر
      </div>
    );
  }

  const chartData = data.map(d => ({
    name: CATEGORY_LABELS[d.category] || d.category,
    value: d.amount,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
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
            {chartData.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} cursor={false} />
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

export default ExpensePieChart;
