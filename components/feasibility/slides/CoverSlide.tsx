'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Edit3, Check, X, Calendar } from 'lucide-react';
import type { CoverSlideData, SlideData } from '@/types/feasibility';

interface CoverSlideProps {
  data: CoverSlideData;
  isEditing?: boolean;
  onUpdate?: (data: Partial<SlideData>) => void;
}

const CoverSlide: React.FC<CoverSlideProps> = ({
  data,
  isEditing = true,
  onUpdate,
}) => {
  // حالات التحرير
  const [editingField, setEditingField] = useState<'clientName' | 'studyTitle' | null>(null);
  const [clientName, setClientName] = useState(data.clientName || 'اسم العميل');
  const [studyTitle, setStudyTitle] = useState(data.studyTitle || 'دراسة جدوى');

  // تحديث البيانات عند تغيير الـ props
  useEffect(() => {
    setClientName(data.clientName || 'اسم العميل');
    setStudyTitle(data.studyTitle || 'دراسة جدوى');
  }, [data.clientName, data.studyTitle]);

  // حفظ التعديلات
  const handleSave = (field: 'clientName' | 'studyTitle') => {
    setEditingField(null);
    if (onUpdate) {
      onUpdate({
        cover: {
          ...data,
          clientName: field === 'clientName' ? clientName : data.clientName,
          studyTitle: field === 'studyTitle' ? studyTitle : data.studyTitle,
        },
      });
    }
  };

  // إلغاء التعديل
  const handleCancel = (field: 'clientName' | 'studyTitle') => {
    setEditingField(null);
    if (field === 'clientName') {
      setClientName(data.clientName || 'اسم العميل');
    } else {
      setStudyTitle(data.studyTitle || 'دراسة جدوى');
    }
  };

  // التاريخ
  const currentDate = data.date || new Date().toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div 
      className="absolute inset-0 bg-secondary flex flex-col overflow-hidden"
      dir="rtl"
    >
      {/* النمط الخلفي */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url('/patterns/pattern-vertical-white.png')`,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px',
        }}
      />

      {/* المحتوى */}
      <div className="relative z-10 flex flex-col h-full">
        {/* القسم العلوي - الشعار */}
        <div className="flex-1 flex items-center justify-center pt-8">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* الشعار */}
            <div className="relative w-28 h-28 mx-auto mb-4">
              <Image
                src="/logos/logo-icon-light.png"
                alt="مفتاحك"
                fill
                className="object-contain"
                priority
              />
            </div>
            
            {/* اسم الشركة */}
            <h1 className="font-bristone text-primary text-2xl tracking-wider">
              Moftahak
            </h1>
            <p className="text-primary/60 text-sm font-dubai mt-1">
              شريكك في النجاح العقاري
            </p>
          </motion.div>
        </div>

        {/* القسم الأوسط - عنوان الدراسة واسم العميل */}
        <div className="flex-2 flex flex-col items-center justify-center px-8">
          {/* عنوان الدراسة */}
          <motion.div 
            className="mb-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {isEditing && editingField === 'studyTitle' ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={studyTitle}
                  onChange={(e) => setStudyTitle(e.target.value)}
                  className="text-xl font-dubai text-primary/80 bg-white/10 backdrop-blur-sm border-b-2 border-primary/50 outline-none text-center px-4 py-2 rounded-t-xl"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave('studyTitle');
                    if (e.key === 'Escape') handleCancel('studyTitle');
                  }}
                />
                <button
                  onClick={() => handleSave('studyTitle')}
                  className="p-1.5 hover:bg-primary/20 rounded-lg transition-colors"
                >
                  <Check className="w-4 h-4 text-green-400" />
                </button>
                <button
                  onClick={() => handleCancel('studyTitle')}
                  className="p-1.5 hover:bg-primary/20 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-red-400" />
                </button>
              </div>
            ) : (
              <div 
                className={`relative group ${isEditing ? 'cursor-pointer' : ''}`}
                onClick={() => isEditing && setEditingField('studyTitle')}
              >
                <span className="text-xl font-dubai text-primary/80">
                  {studyTitle}
                </span>
                {isEditing && (
                  <Edit3 className="w-4 h-4 absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-primary/40" />
                )}
              </div>
            )}
          </motion.div>

          {/* الخط الفاصل العلوي */}
          <motion.div 
            className="w-24 h-px bg-primary/30 mb-6"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          />

          {/* اسم العميل */}
          <motion.div 
            className="text-center mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-primary/50 text-sm font-dubai mb-2">
              أُعدت خصيصاً لـ
            </p>
            
            {isEditing && editingField === 'clientName' ? (
              <div className="flex items-center justify-center gap-2">
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="text-3xl font-dubai font-bold text-primary bg-white/10 backdrop-blur-sm border-b-2 border-primary outline-none text-center px-4 py-2 rounded-t-xl"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave('clientName');
                    if (e.key === 'Escape') handleCancel('clientName');
                  }}
                />
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => handleSave('clientName')}
                    className="p-1.5 hover:bg-primary/20 rounded-lg transition-colors"
                  >
                    <Check className="w-5 h-5 text-green-400" />
                  </button>
                  <button
                    onClick={() => handleCancel('clientName')}
                    className="p-1.5 hover:bg-primary/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-red-400" />
                  </button>
                </div>
              </div>
            ) : (
              <div 
                className={`relative group inline-block ${isEditing ? 'cursor-pointer' : ''}`}
                onClick={() => isEditing && setEditingField('clientName')}
              >
                <h2 className="text-3xl font-dubai font-bold text-primary">
                  {clientName}
                </h2>
                {isEditing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute -left-8 top-1/2 -translate-y-1/2"
                  >
                    <Edit3 className="w-5 h-5 text-primary/40" />
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>

          {/* الخط الفاصل السفلي */}
          <motion.div 
            className="w-32 h-0.5 bg-primary/20"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          />

          {/* التاريخ */}
          <motion.div 
            className="mt-6 flex items-center gap-2 text-primary/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-dubai">{currentDate}</span>
          </motion.div>
        </div>

        {/* القسم السفلي - الفوتر */}
        <motion.div 
          className="py-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {/* زخرفة علوية */}
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-12 h-px bg-primary/20" />
            <div className="w-2.5 h-2.5 bg-primary/30 rotate-45 rounded-sm" />
            <div className="w-12 h-px bg-primary/20" />
          </div>
          
          <p className="text-primary/40 text-xs font-dubai">
            تم إنشاء هذا النموذج من خلال
          </p>
          <p className="text-primary/60 text-sm font-bristone mt-1">
            moftahak.com
          </p>
        </motion.div>
      </div>

      {/* تأثير التدرج السفلي */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-secondary-dark/50 to-transparent pointer-events-none" />
    </div>
  );
};

export default CoverSlide;
