'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, FileText, Sparkles } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface CourseOverviewTabProps {
  description: string;
  features: string[] | null;
}

export default function CourseOverviewTab({ description, features }: CourseOverviewTabProps) {
  const t = useTranslation();
  const ct = t.courses;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* الوصف التفصيلي */}
      <div className="rounded-2xl bg-[#ead3b9]/20 border-2 border-[#ead3b9]/50 shadow-lg overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#ead3b9]/40">
          <div className="w-9 h-9 rounded-lg bg-[#ead3b9]/40 flex items-center justify-center">
            <FileText className="w-[18px] h-[18px] text-[#c4956a]" />
          </div>
          <h3 className="text-base font-bold text-secondary">{'نبذة عن الدورة'}</h3>
        </div>
        <div className="px-6 py-5">
          <div className="prose max-w-none text-[15px] text-gray-700 leading-relaxed whitespace-pre-line">
            {description}
          </div>
        </div>
      </div>

      {/* المميزات */}
      {features && features.length > 0 && (
        <div className="rounded-2xl bg-[#ead3b9]/20 border-2 border-[#ead3b9]/70 shadow-lg overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-4 border-b border-[#ead3b9]/40">
            <div className="w-9 h-9 rounded-lg bg-[#ead3b9]/40 flex items-center justify-center">
              <Sparkles className="w-[18px] h-[18px] text-[#c4956a]" />
            </div>
            <h3 className="text-base font-bold text-secondary">{ct.features}</h3>
          </div>
          <div className="px-6 py-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 px-4 py-3.5 rounded-xl bg-[#ffffff]/60 border border-[#ead3b9]/50 hover:border-primary/40 hover:bg-[#ffffff] transition-colors"
                >
                  <CheckCircle className="w-[18px] h-[18px] text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-[15px] text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
