'use client';

import React, { useEffect, useState, use } from 'react';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, FileText } from 'lucide-react';
import type { Slide } from '@/types/feasibility';
import type { CurrencyCode } from '@/lib/feasibility/currency';
import StudyViewer from '@/components/feasibility/viewer/StudyViewer';

interface PageProps {
  params: Promise<{ shareId: string }>;
}

interface StudyData {
  id: string;
  title: string;
  clientName: string;
  slides: Slide[];
  totalCost: number;
  createdAt: string;
  studyType?: 'WITH_FIELD_VISIT' | 'WITHOUT_FIELD_VISIT';
  currency?: CurrencyCode;
}

export default function ViewStudyPage({ params }: PageProps) {
  const { shareId } = use(params);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [study, setStudy] = useState<StudyData | null>(null);

  useEffect(() => {
    const fetchStudy = async () => {
      try {
        const response = await fetch(`/api/feasibility/${shareId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'الدراسة غير موجودة');
        }

        setStudy({
          id: data.study.id,
          title: data.study.title,
          clientName: data.study.clientName,
          slides: data.study.slides as Slide[],
          totalCost: data.study.totalCost,
          createdAt: data.study.createdAt,
          studyType: data.study.studyType,
          currency: data.study.currency || 'EGP',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
      } finally {
        setLoading(false);
      }
    };

    fetchStudy();
  }, [shareId]);

  // حالة التحميل
  if (loading) {
    return (
      <div className="min-h-screen bg-accent flex items-center justify-center" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-white/80 rounded-2xl shadow-lg flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-secondary animate-spin" />
          </div>
          <h2 className="text-xl font-dubai font-bold text-secondary mb-2">
            جاري تحميل الدراسة...
          </h2>
          <p className="text-secondary/60 font-dubai">يرجى الانتظار</p>
        </motion.div>
      </div>
    );
  }

  // حالة الخطأ
  if (error || !study) {
    return (
      <div className="min-h-screen bg-accent flex items-center justify-center" dir="rtl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto px-6"
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-2xl shadow-lg flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-xl font-dubai font-bold text-secondary mb-2">
            {error || 'الدراسة غير موجودة'}
          </h2>
          <p className="text-secondary/60 font-dubai mb-6">
            قد يكون الرابط غير صحيح أو أن الدراسة لم تعد متاحة
          </p>
          <div className="flex items-center justify-center gap-2 text-secondary/40 bg-white/50 px-4 py-2 rounded-lg">
            <FileText className="w-5 h-5" />
            <span className="text-sm font-dubai">تواصل مع مفتاحك للحصول على رابط جديد</span>
          </div>
        </motion.div>
      </div>
    );
  }

  // عرض الدراسة
  return <StudyViewer study={study} />;
}
