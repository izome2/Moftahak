'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';

interface OccupancyData {
  name: string;
  nights: number;
  bookings: number;
}

interface OccupancyChartProps {
  data: OccupancyData[];
  daysInMonth: number;
  isLoading?: boolean;
}

const COLORS = [
  '#10302b', '#edbf8c', '#5a9a7a', '#7a9ab5', '#9a7ab5',
  '#c4a86c', '#b57a8a', '#6ab5a5', '#a0b56a', '#c49a6c',
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="bg-white border-2 border-primary/20 rounded-xl p-3 shadow-lg font-dubai text-sm" dir="rtl">
      <p className="text-secondary font-bold mb-1.5">{label}</p>
      <div className="flex items-center gap-2 py-0.5">
        <span className="text-secondary/70">ليالي مشغولة:</span>
        <span className="font-bold text-secondary">{entry.value} ليلة</span>
      </div>
      <div className="flex items-center gap-2 py-0.5">
        <span className="text-secondary/70">نسبة الإشغال:</span>
        <span className="font-bold text-secondary">{entry.payload?.occupancyPct}%</span>
      </div>
      <div className="flex items-center gap-2 py-0.5">
        <span className="text-secondary/70">عدد الحجوزات:</span>
        <span className="font-bold text-secondary">{entry.payload?.bookings}</span>
      </div>
    </div>
  );
};

const OccupancyChart: React.FC<OccupancyChartProps> = ({
  data,
  daysInMonth,
  isLoading,
}) => {
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
        لا توجد بيانات إشغال
      </div>
    );
  }

  const chartData = data.map(d => ({
    ...d,
    occupancyPct: daysInMonth > 0 ? Math.min(100, Math.round((d.nights / daysInMonth) * 100)) : 0,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <ResponsiveContainer width="100%" height={360}>
        <BarChart data={chartData} margin={{ top: 10, right: 15, left: 15, bottom: 5 }}>
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
            tick={{ fontSize: 11, fill: '#10302b', fontFamily: 'var(--font-dubai)' }}
            axisLine={false}
            tickLine={false}
            width={40}
            domain={[0, daysInMonth]}
            tickFormatter={(v) => `${v}`}
          />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Bar
            dataKey="nights"
            name="ليالي مشغولة"
            radius={[6, 6, 0, 0]}
            maxBarSize={50}
          >
            {chartData.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Occupancy % labels */}
      <div className="flex flex-wrap justify-center gap-3 mt-3">
        {chartData.map((d, i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 text-[10px] font-dubai text-secondary/60"
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <span>{d.name}:</span>
            <span className="font-bold text-secondary">{d.occupancyPct}%</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default OccupancyChart;
