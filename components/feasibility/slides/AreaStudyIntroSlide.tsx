'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Building2,
  TrendingUp,
  DollarSign,
  Star,
  BarChart3,
  Home,
  Users,
  Edit3,
  Check
} from 'lucide-react';
import type { SlideData, AreaStudySlideData } from '@/types/feasibility';

interface AreaStudyIntroSlideProps {
  data: AreaStudySlideData;
  isEditing?: boolean;
  onUpdate?: (data: Partial<SlideData>) => void;
}

// قائمة النقاط الافتراضية
const defaultBulletPoints = [
  { icon: Building2, text: 'الشقق المحيطة بموقعك' },
  { icon: DollarSign, text: 'أسعار الإيجار في المنطقة' },
  { icon: Star, text: 'مميزات كل شقة' },
  { icon: BarChart3, text: 'إحصائيات التأجير' },
  { icon: Users, text: 'معدل الإشغال' },
  { icon: TrendingUp, text: 'توقعات العائد' },
];

const AreaStudyIntroSlide: React.FC<AreaStudyIntroSlideProps> = ({
  data,
  isEditing = false,
  onUpdate,
}) => {
  const { title = 'دراسة المنطقة المحيطة', description = '' } = data;
  
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [localTitle, setLocalTitle] = useState(title);
  const [localDescription, setLocalDescription] = useState(
    description || 'في هذا القسم ستتعرف على تحليل شامل للمنطقة المحيطة بشقتك، بما في ذلك الشقق المنافسة وأسعار الإيجار ومعدلات الإشغال، لمساعدتك في اتخاذ قرارات مدروسة حول تسعير شقتك.'
  );

  // حفظ التغييرات
  const handleSave = (field: 'title' | 'description') => {
    if (onUpdate) {
      onUpdate({
        areaStudy: {
          ...data,
          [field]: field === 'title' ? localTitle : localDescription,
        },
      });
    }
    if (field === 'title') setEditingTitle(false);
    if (field === 'description') setEditingDescription(false);
  };

  // أنيميشن للظهور
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="w-full h-full bg-linear-to-br from-accent via-accent to-primary/10 flex flex-col overflow-hidden" dir="rtl">
      {/* رأس الشريحة */}
      <div className="bg-secondary text-white px-6 py-4 flex items-center gap-3">
        <div className="w-12 h-12 bg-primary/20 flex items-center justify-center rounded-xl">
          <MapPin className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          {isEditing && editingTitle ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
                className="flex-1 bg-white/10 border border-white/20 px-3 py-2 text-white font-dubai text-xl focus:outline-none focus:border-primary rounded-lg"
                autoFocus
              />
              <button
                onClick={() => handleSave('title')}
                className="p-1.5 bg-primary/20 hover:bg-primary/30 transition-colors rounded-lg"
              >
                <Check className="w-5 h-5 text-primary" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold font-dubai">{localTitle}</h2>
              {isEditing && (
                <button
                  onClick={() => setEditingTitle(true)}
                  className="p-1.5 hover:bg-white/10 transition-colors rounded-lg"
                >
                  <Edit3 className="w-4 h-4 text-primary/70" />
                </button>
              )}
            </div>
          )}
          <p className="text-primary/80 text-sm">
            تحليل السوق والمنافسة
          </p>
        </div>
      </div>

      {/* محتوى الشريحة */}
      <div className="flex-1 p-8 flex flex-col justify-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-2xl mx-auto w-full"
        >
          {/* أيقونة كبيرة */}
          <motion.div
            variants={itemVariants}
            className="flex justify-center mb-8"
          >
            <div className="w-24 h-24 bg-secondary/10 flex items-center justify-center rounded-3xl shadow-medium">
              <Building2 className="w-12 h-12 text-secondary" />
            </div>
          </motion.div>

          {/* العنوان الفرعي */}
          <motion.div variants={itemVariants} className="text-center mb-6">
            <h3 className="text-2xl font-bold text-secondary font-dubai mb-2">
              في هذا القسم ستتعرف على:
            </h3>
          </motion.div>

          {/* الوصف */}
          <motion.div variants={itemVariants} className="mb-8">
            {isEditing && editingDescription ? (
              <div className="flex flex-col gap-2">
                <textarea
                  value={localDescription}
                  onChange={(e) => setLocalDescription(e.target.value)}
                  className="w-full h-24 bg-white border border-secondary/20 px-4 py-3 text-secondary font-dubai text-center focus:outline-none focus:border-primary resize-none rounded-xl shadow-soft"
                  autoFocus
                />
                <button
                  onClick={() => handleSave('description')}
                  className="self-center p-2 bg-primary/20 hover:bg-primary/30 transition-colors flex items-center gap-1 text-secondary text-sm rounded-lg"
                >
                  <Check className="w-4 h-4" />
                  حفظ
                </button>
              </div>
            ) : (
              <div
                className={`text-center text-secondary/70 font-dubai leading-relaxed ${isEditing ? 'cursor-pointer hover:bg-white/60' : ''} bg-white/50 backdrop-blur-sm p-5 border border-secondary/10 rounded-xl shadow-soft`}
                onClick={() => isEditing && setEditingDescription(true)}
              >
                {localDescription}
                {isEditing && (
                  <Edit3 className="w-4 h-4 inline-block mr-2 text-primary/50" />
                )}
              </div>
            )}
          </motion.div>

          {/* النقاط */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 md:grid-cols-3 gap-4"
          >
            {defaultBulletPoints.map((point, index) => {
              const Icon = point.icon;
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/80 backdrop-blur-sm border border-secondary/10 p-4 flex items-center gap-3 hover:border-primary/30 hover:shadow-soft transition-all rounded-xl"
                >
                  <div className="w-10 h-10 bg-primary/10 flex items-center justify-center shrink-0 rounded-lg">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-secondary font-dubai text-sm font-medium">
                    {point.text}
                  </span>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>

      {/* فوتر الشريحة */}
      <div className="bg-secondary/5 px-6 py-3 border-t border-secondary/10">
        <div className="flex items-center justify-center gap-2 text-secondary/50 text-sm">
          <Home className="w-4 h-4" />
          <span className="font-dubai">مفتاحك - دراسات الجدوى الاحترافية</span>
        </div>
      </div>
    </div>
  );
};

export default AreaStudyIntroSlide;
