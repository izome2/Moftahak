'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, FileText, Calendar, User, MoreVertical } from 'lucide-react';

// بيانات تجريبية للدراسات
const mockStudies = [
  { id: '1', clientName: 'أحمد محمد', date: '2026-01-05', status: 'draft', slidesCount: 8 },
  { id: '2', clientName: 'سارة أحمد', date: '2026-01-04', status: 'completed', slidesCount: 12 },
  { id: '3', clientName: 'محمود علي', date: '2026-01-03', status: 'shared', slidesCount: 10 },
];

const statusLabels: Record<string, { label: string; color: string }> = {
  draft: { label: 'مسودة', color: 'bg-yellow-100 text-yellow-700' },
  completed: { label: 'مكتملة', color: 'bg-green-100 text-green-700' },
  shared: { label: 'تم المشاركة', color: 'bg-blue-100 text-blue-700' },
};

export default function FeasibilityStudiesPage() {
  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* العنوان وزر إضافة */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary font-dubai">دراسات الجدوى</h1>
          <p className="text-secondary/60 text-sm mt-1">إدارة وإنشاء دراسات الجدوى للعملاء</p>
        </div>
        
        <Link href="/admin/feasibility/new">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 bg-secondary text-primary px-4 py-2.5 rounded-xl font-dubai font-medium shadow-md hover:shadow-lg transition-shadow"
          >
            <Plus className="w-5 h-5" />
            <span>دراسة جديدة</span>
          </motion.button>
        </Link>
      </div>

      {/* قائمة الدراسات */}
      <div className="grid gap-4">
        {mockStudies.map((study, index) => (
          <motion.div
            key={study.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/60 backdrop-blur-sm border border-primary/20 rounded-xl p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              {/* أيقونة */}
              <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-secondary" />
              </div>

              {/* المعلومات */}
              <div className="flex-1">
                <h3 className="font-dubai font-bold text-secondary">{study.clientName}</h3>
                <div className="flex items-center gap-4 mt-1 text-sm text-secondary/60">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(study.date).toLocaleDateString('ar-EG')}
                  </span>
                  <span>{study.slidesCount} شريحة</span>
                </div>
              </div>

              {/* الحالة */}
              <span className={`px-3 py-1 rounded-full text-xs font-dubai ${statusLabels[study.status].color}`}>
                {statusLabels[study.status].label}
              </span>

              {/* الإجراءات */}
              <Link href={`/admin/feasibility/${study.id}`}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-secondary/10 hover:bg-secondary/20 rounded-lg text-secondary text-sm font-dubai transition-colors"
                >
                  تعديل
                </motion.button>
              </Link>

              <button className="p-2 hover:bg-accent/50 rounded-lg transition-colors">
                <MoreVertical className="w-5 h-5 text-secondary/60" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* رسالة فارغة */}
      {mockStudies.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-secondary/20 mx-auto mb-4" />
          <h3 className="text-lg font-dubai font-bold text-secondary/60">لا توجد دراسات</h3>
          <p className="text-secondary/40 text-sm mt-1">ابدأ بإنشاء دراسة جدوى جديدة</p>
        </div>
      )}
    </div>
  );
}
