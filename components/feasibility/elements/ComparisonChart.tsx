'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/animations/variants';

interface ComparisonChartProps {
  data: { label: string; value: number; color?: string }[];
  maxValue?: number;
}

// ألوان افتراضية
const defaultColors = [
  '#10302b', // secondary
  '#1a4a42', // secondary lighter
  '#2d5c52', // green variant
  '#edbf8c', // primary
  '#d4a574', // primary darker
];

export default function ComparisonChart({ data, maxValue }: ComparisonChartProps) {
  const max = maxValue || Math.max(...data.map(d => d.value), 1);

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="bg-transparent p-4"
    >
      <h3 className="text-sm font-bold text-secondary font-dubai text-center mb-4">
        مقارنة الأسعار
      </h3>
      
      <div className="space-y-3">
        {data.map((item, index) => {
          const percentage = (item.value / max) * 100;
          const color = item.color || defaultColors[index % defaultColors.length];
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-1"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs text-secondary font-dubai">{item.label}</span>
                <span className="text-xs font-bold text-secondary">
                  {item.value.toLocaleString('ar-EG')} ج.م
                </span>
              </div>
              <div className="h-6 bg-accent/30 rounded-lg overflow-hidden">
                <motion.div
                  className="h-full rounded-lg flex items-center justify-end px-2"
                  style={{ backgroundColor: color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  {percentage > 15 && (
                    <span className="text-[10px] text-white font-bold">
                      {percentage.toFixed(0)}%
                    </span>
                  )}
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
