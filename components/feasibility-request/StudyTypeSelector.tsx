'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ClipboardCheck, MapPin, Users, CheckCircle } from 'lucide-react';
import { StudyRequestType, studyTypeLabels } from '@/lib/validations/feasibility-request';
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';

interface StudyTypeOption {
  type: StudyRequestType;
  title: string;
  subtitle: string;
  price: string;
  features: string[];
  icon: React.ReactNode;
  recommended?: boolean;
}

const studyOptions: StudyTypeOption[] = [
  {
    type: 'WITHOUT_FIELD_VISIT',
    title: studyTypeLabels.WITHOUT_FIELD_VISIT,
    subtitle: 'تحليل شامل بناءً على البيانات المقدمة',
    price: '٢,٥٠٠ ج.م',
    features: [
      'تحليل موقع العقار',
      'دراسة المنافسين في المنطقة',
      'تقدير العوائد المتوقعة',
      'توصيات التسعير',
      'تقرير PDF شامل',
    ],
    icon: <ClipboardCheck className="w-8 h-8" />,
  },
  {
    type: 'WITH_FIELD_VISIT',
    title: studyTypeLabels.WITH_FIELD_VISIT,
    subtitle: 'زيارة ميدانية وتحليل تفصيلي للعقار',
    price: '٥,٠٠٠ ج.م',
    features: [
      'كل مميزات الدراسة الأساسية',
      'زيارة ميدانية للعقار',
      'تقييم حالة الأثاث والتجهيزات',
      'توصيات التحسين والتطوير',
      'خطة تأثيث مفصلة',
      'تصوير احترافي للعقار',
    ],
    icon: <MapPin className="w-8 h-8" />,
    recommended: true,
  },
];

interface StudyTypeSelectorProps {
  onSelect: (type: StudyRequestType) => void;
  preselectedType?: StudyRequestType | null;
}

export default function StudyTypeSelector({ onSelect, preselectedType }: StudyTypeSelectorProps) {
  // Filter options if preselected
  const displayOptions = preselectedType 
    ? studyOptions.filter(opt => opt.type === preselectedType)
    : studyOptions;

  const isSingleOption = displayOptions.length === 1;

  return (
    <div className="max-w-5xl mx-auto py-18">
      {/* Header */}
      <motion.div 
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-secondary mb-3 font-dubai">
          {isSingleOption ? displayOptions[0].title : 'اختر نوع دراسة الجدوى'}
        </h1>
        <p className="text-base text-secondary/70 max-w-2xl mx-auto font-dubai">
          {isSingleOption 
            ? displayOptions[0].subtitle
            : 'نقدم لك خيارين مختلفين لدراسة جدوى مشروعك العقاري. اختر النوع المناسب لاحتياجاتك.'
          }
        </p>
      </motion.div>

      {/* Cards Grid */}
      <motion.div 
        className={`grid gap-6 md:gap-8 ${isSingleOption ? 'max-w-lg mx-auto' : 'md:grid-cols-2'}`}
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {displayOptions.map((option) => (
          <motion.div
            key={option.type}
            variants={fadeInUp}
            className="relative"
          >
            {/* Recommended Badge - only show when not single option */}
            {option.recommended && !isSingleOption && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary text-secondary text-sm font-bold rounded-full shadow-lg font-dubai">
                  <Users className="w-4 h-4" />
                  الأكثر طلباً
                </span>
              </div>
            )}
            
            <button
              onClick={() => onSelect(option.type)}
              className={`
                w-full text-right p-6 md:p-8 rounded-2xl transition-all duration-300
                bg-white/80 backdrop-blur-sm border-2
                hover:bg-white hover:shadow-xl hover:scale-[1.02]
                focus:outline-none focus:ring-4 focus:ring-primary/30
                ${option.recommended || isSingleOption
                  ? 'border-primary shadow-lg' 
                  : 'border-secondary/10 shadow-md hover:border-primary/50'
                }
              `}
            >
              {/* Icon & Title */}
              <div className="flex items-start gap-4 mb-6">
                <div className={`
                  shrink-0 w-16 h-16 rounded-xl flex items-center justify-center
                  ${option.recommended 
                    ? 'bg-primary text-secondary' 
                    : 'bg-secondary/10 text-secondary'
                  }
                `}>
                  {option.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-bold text-secondary mb-1 font-dubai">
                    {option.title}
                  </h3>
                  <p className="text-secondary/60 text-sm font-dubai">
                    {option.subtitle}
                  </p>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6 pb-6 border-b border-secondary/10">
                <span className="text-3xl md:text-4xl font-bold text-secondary font-bristone">
                  {option.price}
                </span>
              </div>

              {/* Features List */}
              <ul className="space-y-3">
                {option.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className={`
                      w-5 h-5 shrink-0
                      ${option.recommended ? 'text-primary' : 'text-secondary/50'}
                    `} />
                    <span className="text-secondary/80 font-dubai">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div className={`
                mt-8 py-4 px-6 rounded-xl text-center font-bold text-lg transition-colors
                ${option.recommended || isSingleOption
                  ? 'bg-primary text-secondary' 
                  : 'bg-secondary/10 text-secondary group-hover:bg-primary'
                }
              `}>
                <span className="font-dubai">
                  {isSingleOption ? 'ابدأ الآن' : 'اختر هذا النوع'}
                </span>
              </div>
            </button>
          </motion.div>
        ))}
      </motion.div>

      {/* Info Note - only show when not single option */}
      {!isSingleOption && (
        <motion.p 
          className="text-center text-secondary/50 mt-8 text-sm font-dubai"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          * الأسعار قابلة للتغيير. سيتم تأكيد السعر النهائي قبل البدء في الدراسة.
        </motion.p>
      )}
    </div>
  );
}
