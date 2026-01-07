'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { fadeInUp } from '@/lib/animations/variants';

interface CostChartProps {
  data: { name: string; cost: number; color?: string }[];
}

// ألوان افتراضية للرسم البياني
const defaultColors = [
  '#10302b', // secondary
  '#edbf8c', // primary
  '#ead3b9', // accent
  '#1a4a42', // secondary lighter
  '#d4a574', // primary darker
  '#c9b89a', // accent darker
  '#2d5c52', // green variant
  '#b8956a', // gold variant
];

export default function CostChart({ data }: CostChartProps) {
  const total = data.reduce((sum, item) => sum + item.cost, 0);
  
  // حساب زوايا الشرائح
  let currentAngle = 0;
  const slices = data.map((item, index) => {
    const percentage = total > 0 ? (item.cost / total) * 100 : 0;
    const angle = (percentage / 100) * 360;
    const slice = {
      ...item,
      percentage,
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
      color: item.color || defaultColors[index % defaultColors.length],
    };
    currentAngle += angle;
    return slice;
  });

  // SVG path لقطاع دائري
  const createSlicePath = (startAngle: number, endAngle: number, radius: number, cx: number, cy: number) => {
    // تحويل الزوايا إلى راديان
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);
    
    // نقاط البداية والنهاية
    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);
    
    // هل القوس أكبر من 180 درجة؟
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  const cx = 100;
  const cy = 100;
  const radius = 80;

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-soft border border-black/5"
    >
      <h3 className="text-sm font-bold text-secondary font-dubai text-center mb-4">
        توزيع التكاليف
      </h3>
      
      <div className="flex flex-col md:flex-row items-center gap-4">
        {/* الرسم البياني الدائري */}
        <div className="relative">
          <svg width="200" height="200" viewBox="0 0 200 200">
            {slices.map((slice, index) => (
              <motion.path
                key={index}
                d={createSlicePath(slice.startAngle, slice.endAngle, radius, cx, cy)}
                fill={slice.color}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
            ))}
            {/* دائرة وسطية */}
            <circle cx={cx} cy={cy} r={40} fill="white" />
            <text
              x={cx}
              y={cy - 5}
              textAnchor="middle"
              className="text-xs font-bold fill-secondary"
            >
              الإجمالي
            </text>
            <text
              x={cx}
              y={cy + 12}
              textAnchor="middle"
              className="text-[10px] fill-secondary/70"
            >
              {total.toLocaleString('ar-EG')} ج.م
            </text>
          </svg>
        </div>

        {/* مفتاح الألوان */}
        <div className="flex flex-col gap-2">
          {slices.map((slice, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: slice.color }}
              />
              <span className="text-xs text-secondary font-dubai">
                {slice.name}
              </span>
              <span className="text-xs text-secondary/60 mr-auto">
                {slice.percentage.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
