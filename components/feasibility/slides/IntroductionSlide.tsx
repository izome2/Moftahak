'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  FileText, 
  Home, 
  DollarSign, 
  MapPin, 
  BarChart3, 
  CheckCircle2,
  Edit3,
  Plus,
  Trash2,
  Sparkles,
  BookOpen
} from 'lucide-react';
import type { IntroductionSlideData, SlideData } from '@/types/feasibility';


const SHADOWS = {
  card: 'rgba(237, 191, 140, 0.15) 0px 4px 20px',
  cardHover: 'rgba(237, 191, 140, 0.25) 0px 8px 30px',
  button: 'rgba(16, 48, 43, 0.15) 0px 4px 12px',
  icon: 'rgba(237, 191, 140, 0.3) 0px 4px 12px',
  modal: 'rgba(16, 48, 43, 0.25) 0px 25px 50px -12px',
};

// ============================================
// 📋 TYPES
// ============================================

interface IntroductionSlideProps {
  data: IntroductionSlideData;
  isEditing?: boolean;
  onUpdate?: (data: Partial<SlideData>) => void;
}

// الأيقونات للنقاط
const bulletIcons = [
  Home,
  DollarSign,
  MapPin,
  BarChart3,
  FileText,
  CheckCircle2,
];

// ============================================
// 🎯 MAIN COMPONENT
// ============================================

const IntroductionSlide: React.FC<IntroductionSlideProps> = ({
  data,
  isEditing = false,
  onUpdate,
}) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [localData, setLocalData] = useState<IntroductionSlideData>(data);

  const handleUpdate = (updates: Partial<IntroductionSlideData>) => {
    const newData = { ...localData, ...updates };
    setLocalData(newData);
    if (onUpdate) {
      onUpdate({ introduction: newData });
    }
  };

  const handleBulletUpdate = (index: number, value: string) => {
    const newBullets = [...localData.bulletPoints];
    newBullets[index] = value;
    handleUpdate({ bulletPoints: newBullets });
  };

  const handleAddBullet = () => {
    const newBullets = [...localData.bulletPoints, 'نقطة جديدة'];
    handleUpdate({ bulletPoints: newBullets });
  };

  const handleRemoveBullet = (index: number) => {
    if (localData.bulletPoints.length > 1) {
      const newBullets = localData.bulletPoints.filter((_, i) => i !== index);
      handleUpdate({ bulletPoints: newBullets });
    }
  };

  const handleSave = () => {
    setEditingField(null);
  };

  return (
    <div className="relative overflow-hidden" style={{ minHeight: '1200px', background: 'linear-gradient(135deg, #f8eddf 0%, #fdfbf7 50%, #faf0e5 100%)' }} dir="rtl">
      {/* Background Glow Effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-100 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* المحتوى الرئيسي */}
      <div className="relative h-full flex flex-col p-8 pt-20">
        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white p-6 sm:p-8 border-2 border-primary/20 mb-6"
          style={{ boxShadow: SHADOWS.card }}
        >
          {/* Background Icon */}
          <div className="absolute -top-8 -left-8 opacity-[0.08] pointer-events-none">
            <BookOpen className="w-56 h-56 text-primary" strokeWidth={1.5} />
          </div>

          {/* Shimmer Effect */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(237, 191, 140, 0.3), transparent)',
            }}
            initial={{ opacity: 0, x: '-100%' }}
            whileHover={{ opacity: 1, x: '100%' }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <motion.div 
                className="p-3 rounded-xl bg-primary/20 border-2 border-primary/30"
                whileHover={{ scale: 1.05, rotate: 5 }}
                style={{ boxShadow: SHADOWS.icon }}
              >
                <Sparkles className="w-6 h-6 text-primary" strokeWidth={2} />
              </motion.div>
              <span className="text-primary font-dubai font-bold">مرحباً بك في</span>
            </div>
            
            {isEditing && editingField === 'title' ? (
              <input
                type="text"
                value={localData.title}
                onChange={(e) => setLocalData({ ...localData, title: e.target.value })}
                onBlur={() => {
                  handleUpdate({ title: localData.title });
                  handleSave();
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                className="text-2xl sm:text-3xl font-dubai font-bold text-secondary bg-white border-2 border-primary/30 rounded-xl outline-none w-full px-4 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                autoFocus
              />
            ) : (
              <h1 
                className={`text-2xl sm:text-3xl font-dubai font-bold text-secondary relative group ${isEditing ? 'cursor-pointer hover:bg-primary/10 transition-colors px-4 py-2 rounded-xl' : ''}`}
                onClick={() => isEditing && setEditingField('title')}
              >
                {localData.title}
                {isEditing && (
                  <Edit3 className="w-5 h-5 absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                )}
              </h1>
            )}
            
            {/* الخط الزخرفي */}
            <div className="flex items-center gap-2 mt-4">
              <div className="w-20 h-1.5 bg-primary rounded-full" />
              <div className="w-6 h-1.5 bg-primary/50 rounded-full" />
              <div className="w-3 h-1.5 bg-primary/30 rounded-full" />
            </div>
          </div>
        </motion.div>

        {/* Description Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative rounded-2xl overflow-hidden bg-linear-to-br from-primary/5 to-primary/10 p-5 border-2 border-primary/20 mb-6 group"
          style={{ boxShadow: SHADOWS.card }}
        >
          {/* أيقونة خلفية شفافة */}
          <div className="absolute -top-4 -right-4 opacity-[0.08] pointer-events-none">
            <BookOpen className="w-40 h-40 text-primary" strokeWidth={1.5} />
          </div>
          
          {/* تأثير التحويم */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(237, 191, 140, 0.3), transparent)',
            }}
            initial={{ opacity: 0, x: '-100%' }}
            whileHover={{ opacity: 1, x: '100%' }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          />
          
          <div className="relative z-10">
            {isEditing && editingField === 'description' ? (
              <textarea
                value={localData.description}
                onChange={(e) => setLocalData({ ...localData, description: e.target.value })}
                onBlur={() => {
                  handleUpdate({ description: localData.description });
                  handleSave();
                }}
                className="text-base font-dubai text-secondary leading-relaxed bg-white border-2 border-primary/30 rounded-xl outline-none w-full px-4 py-3 resize-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                rows={3}
                autoFocus
              />
            ) : (
              <p 
                className={`text-base font-dubai text-secondary leading-relaxed relative group ${isEditing ? 'cursor-pointer hover:bg-white/50 transition-colors px-4 py-3 rounded-xl' : ''}`}
                onClick={() => isEditing && setEditingField('description')}
              >
                {localData.description}
                {isEditing && (
                  <Edit3 className="w-4 h-4 absolute -left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                )}
              </p>
            )}
          </div>
        </motion.div>

        {/* البطاقة الرئيسية مع النقاط */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex-1 relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white p-6 border-2 border-primary/20"
          style={{ boxShadow: SHADOWS.card }}
        >
          {/* Background Icon */}
          <div className="absolute -bottom-10 -left-10 opacity-[0.08] pointer-events-none">
            <FileText className="w-64 h-64 text-primary" strokeWidth={1.5} />
          </div>

          {/* عنوان البطاقة */}
          <div className="flex items-center gap-4 mb-6 relative z-10">
            <motion.div 
              className="p-4 rounded-2xl bg-primary/20 border-2 border-primary/40 -ml-0.5"
              whileHover={{ scale: 1.05, rotate: 5 }}
              style={{ boxShadow: 'rgba(237, 191, 140, 0.3) 0px 4px 12px' }}
            >
              <FileText className="w-7 h-7 text-secondary" strokeWidth={2} />
            </motion.div>
            <h2 className="text-xl font-dubai font-bold text-secondary">
              ما ستجده في هذا التقرير
            </h2>
          </div>

          {/* قائمة النقاط */}
          <div className="space-y-3 relative z-10">
            {localData.bulletPoints.map((point, index) => {
              const IconComponent = bulletIcons[index % bulletIcons.length];
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.01, x: -4 }}
                  className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-white p-4 border-2 border-primary/20 group cursor-pointer"
                  style={{ boxShadow: SHADOWS.card }}
                >
                  {/* Background Icon for each item */}
                  <div className="absolute -top-2 -left-2 opacity-[0.10] pointer-events-none">
                    <IconComponent className="w-24 h-24 text-primary" strokeWidth={1.5} />
                  </div>

                  {/* Shimmer Effect */}
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(237, 191, 140, 0.4), transparent)',
                    }}
                    initial={{ opacity: 0, x: '-100%' }}
                    whileHover={{ opacity: 1, x: '100%' }}
                    transition={{ duration: 0.6, ease: 'easeInOut' }}
                  />

                  <div className="flex items-center gap-4 relative z-10">
                    {/* أيقونة النقطة */}
                    <motion.div 
                      className="w-11 h-11 bg-primary/20 flex items-center justify-center shrink-0 rounded-xl border-2 border-primary/30"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                    >
                      <IconComponent className="w-5 h-5 text-primary" strokeWidth={2} />
                    </motion.div>
                    
                    {/* نص النقطة */}
                    {isEditing && editingField === `bullet-${index}` ? (
                      <input
                        type="text"
                        value={point}
                        onChange={(e) => {
                          const newBullets = [...localData.bulletPoints];
                          newBullets[index] = e.target.value;
                          setLocalData({ ...localData, bulletPoints: newBullets });
                        }}
                        onBlur={() => {
                          handleBulletUpdate(index, localData.bulletPoints[index]);
                          handleSave();
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                        className="flex-1 text-base font-dubai font-bold text-secondary bg-white border-2 border-primary/30 rounded-lg outline-none px-4 py-2 focus:border-primary focus:ring-2 focus:ring-primary/20"
                        autoFocus
                      />
                    ) : (
                      <span 
                        className={`flex-1 text-base font-dubai font-bold text-secondary ${isEditing ? 'cursor-pointer' : ''}`}
                        onClick={() => isEditing && setEditingField(`bullet-${index}`)}
                      >
                        {point}
                      </span>
                    )}
                    
                    {/* أزرار التحكم */}
                    {isEditing && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleRemoveBullet(index)}
                        className="w-9 h-9 bg-red-100 text-red-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200 rounded-xl"
                        disabled={localData.bulletPoints.length <= 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* زر إضافة نقطة جديدة */}
          {isEditing && localData.bulletPoints.length < 6 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.01, y: -2 }}
              whileTap={{ scale: 0.99 }}
              transition={{ delay: 0.6 }}
              onClick={handleAddBullet}
              className="mt-4 w-full p-4 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 text-primary font-dubai font-bold flex items-center justify-center gap-3 hover:bg-primary/10 hover:border-primary"
            >
              <Plus size={20} />
              <span>إضافة نقطة جديدة</span>
            </motion.button>
          )}
        </motion.div>

        {/* النص السفلي */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-primary rounded-full" />
            <span className="text-sm font-dubai font-bold text-secondary/60">
              دراسة جدوى شاملة من مفتاحك
            </span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <div className="w-10 h-1 bg-primary/30 rounded-full" />
            <div className="w-5 h-1 bg-primary/50 rounded-full" />
            <div className="w-3 h-1 bg-primary rounded-full" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default IntroductionSlide;
