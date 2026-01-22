'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Building2,
  TrendingUp,
  DollarSign,
  Star,
  BarChart3,
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

// ============================================
// 🎨 DESIGN TOKENS
// ============================================
const SHADOWS = {
  card: '0 4px 20px rgba(16, 48, 43, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
  cardHover: '0 12px 40px rgba(16, 48, 43, 0.15), 0 4px 12px rgba(237, 191, 140, 0.1)',
  icon: '0 4px 12px rgba(237, 191, 140, 0.3)',
  button: '0 4px 16px rgba(237, 191, 140, 0.4)',
};

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

  // Sync local state when props data changes (e.g., when study is loaded from database)
  useEffect(() => {
    setLocalTitle(title);
    setLocalDescription(
      description || 'في هذا القسم ستتعرف على تحليل شامل للمنطقة المحيطة بشقتك، بما في ذلك الشقق المنافسة وأسعار الإيجار ومعدلات الإشغال، لمساعدتك في اتخاذ قرارات مدروسة حول تسعير شقتك.'
    );
  }, [title, description]);

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
    <div className="p-6 md:p-8 pb-24" style={{ background: 'linear-gradient(135deg, #f8eddf 0%, #fdfbf7 50%, #faf0e5 100%)' }} dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto space-y-8"
      >
        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white p-6 sm:p-8 border-2 border-primary/20"
          style={{ boxShadow: SHADOWS.card }}
        >
          <div className="absolute -top-8 -left-8 opacity-[0.08] pointer-events-none">
            <MapPin className="w-56 h-56 text-primary" strokeWidth={1.5} />
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div 
                className="p-4 rounded-2xl bg-primary/20 border-2 border-primary/30"
                style={{ boxShadow: SHADOWS.icon }}
              >
                <MapPin className="w-8 h-8 text-primary" strokeWidth={2} />
              </div>
              <div>
                {isEditing && editingTitle ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={localTitle}
                      onChange={(e) => setLocalTitle(e.target.value)}
                      className="text-2xl sm:text-3xl font-bold text-secondary font-dubai bg-white/50 border border-primary/30 px-3 py-1 rounded-xl focus:outline-none focus:border-primary"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSave('title')}
                      className="p-2 bg-primary/20 hover:bg-primary/30 transition-colors rounded-xl"
                    >
                      <Check className="w-5 h-5 text-primary" />
                    </button>
                  </div>
                ) : (
                  <div className="group relative flex items-center gap-2">
                    <h2 className="text-2xl sm:text-3xl font-bold text-secondary font-dubai">
                      {localTitle}
                    </h2>
                    {isEditing && (
                      <button
                        onClick={() => setEditingTitle(true)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Edit3 className="w-5 h-5 text-primary/60" />
                      </button>
                    )}
                  </div>
                )}
                <p className="text-secondary/60 font-dubai text-sm mt-1">
                  تحليل السوق والمنافسة المحيطة
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Description Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white p-6 sm:p-8 border-2 border-primary/20"
          style={{ boxShadow: SHADOWS.card }}
        >
          <div className="absolute -top-4 -right-4 opacity-[0.08] pointer-events-none">
            <Building2 className="w-40 h-40 text-primary" strokeWidth={1.5} />
          </div>

          <div className="relative z-10">
            <h3 className="text-xl font-bold text-secondary font-dubai mb-4 flex items-center gap-3">
              <div className="w-1.5 h-8 bg-linear-to-b from-primary to-primary/50 rounded-full" />
              في هذا القسم ستتعرف على:
            </h3>

            {isEditing && editingDescription ? (
              <div className="flex flex-col gap-3">
                <textarea
                  value={localDescription}
                  onChange={(e) => setLocalDescription(e.target.value)}
                  className="w-full min-h-30 bg-accent/20 border-2 border-primary/20 px-4 py-3 text-secondary font-dubai focus:outline-none focus:border-primary resize-none rounded-xl"
                  autoFocus
                />
                <button
                  onClick={() => handleSave('description')}
                  className="self-start px-4 py-2 bg-primary hover:bg-primary/90 transition-colors flex items-center gap-2 text-secondary text-sm font-dubai font-bold rounded-xl"
                  style={{ boxShadow: SHADOWS.button }}
                >
                  <Check className="w-4 h-4" />
                  حفظ
                </button>
              </div>
            ) : (
              <div
                className={`text-secondary/70 font-dubai leading-relaxed ${isEditing ? 'cursor-pointer hover:bg-accent/30' : ''} bg-accent/20 p-5 rounded-xl transition-colors relative group`}
                onClick={() => isEditing && setEditingDescription(true)}
              >
                {localDescription}
                {isEditing && (
                  <Edit3 className="w-4 h-4 absolute left-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary/60" />
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {defaultBulletPoints.map((point, index) => {
            const Icon = point.icon;
            return (
              <div
                key={index}
                className="group relative bg-white p-6 rounded-2xl border-2 border-primary/10 hover:border-primary/40 cursor-pointer card-hover overflow-hidden"
                style={{ 
                  boxShadow: SHADOWS.card,
                  opacity: 0,
                  animation: `fadeInUp 0.5s ease-out ${0.4 + index * 0.1}s forwards`,
                }}
              >
                {/* Background Icon */}
                <div className="absolute -bottom-4 -right-4 opacity-[0.03] pointer-events-none">
                  <Icon className="w-40 h-40 text-primary" strokeWidth={1.5} />
                </div>

                {/* Shimmer Effect - من اليمين لليسار */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none shimmer-effect"
                  style={{
                    background: 'linear-gradient(-90deg, transparent, rgba(237, 191, 140, 0.2), transparent)',
                  }}
                />

                <div className="flex flex-col items-center text-center gap-4 relative z-10">
                  <div
                    className="icon-container w-16 h-16 bg-linear-to-br from-primary/20 to-primary/10 flex items-center justify-center shrink-0 rounded-2xl border-2 border-primary/30 group-hover:border-primary/50"
                    style={{ boxShadow: SHADOWS.icon }}
                  >
                    <Icon className="w-8 h-8 text-primary icon-rotate relative z-10" strokeWidth={2.5} />
                  </div>
                  <span className="text-secondary font-dubai text-base font-bold leading-relaxed group-hover:text-primary text-hover">
                    {point.text}
                  </span>
                </div>

                {/* Corner Accent */}
                <div 
                  className="absolute top-0 right-0 w-12 h-12 bg-linear-to-br from-primary/10 to-transparent rounded-bl-3xl opacity-0 group-hover:opacity-100 corner-accent"
                />
              </div>
            );
          })}
        </motion.div>
      </motion.div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes shimmer {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }

        @keyframes iconRotate {
          0%, 100% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(-10deg) scale(1.15); }
          50% { transform: rotate(10deg) scale(1.15); }
          75% { transform: rotate(-10deg) scale(1.15); }
        }

        .card-hover {
          transition: transform 0.15s ease-out, box-shadow 0.15s ease-out, border-color 0.15s ease-out;
        }

        .card-hover:hover {
          transform: translateY(-8px);
          box-shadow: ${SHADOWS.cardHover};
        }

        .icon-container {
          position: relative;
          transition: transform 0.15s ease-out, border-color 0.15s ease-out;
        }

        .group:hover .icon-container {
          transform: scale(1.15);
        }

        .icon-rotate {
          transition: transform 0.15s ease-out;
        }

        .group:hover .icon-rotate {
          animation: iconRotate 0.5s ease-in-out;
        }

        .text-hover {
          transition: color 0.15s ease-out;
        }

        .corner-accent {
          transition: opacity 0.15s ease-out;
        }

        .shimmer-effect {
          transition: opacity 0.2s ease-out;
        }

        .group:hover .shimmer-effect {
          animation: shimmer 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AreaStudyIntroSlide;
