'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Edit3, Check, X, Calendar, ImagePlus } from 'lucide-react';
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
  const [backgroundImage, setBackgroundImage] = useState<string | null>(data.backgroundImage || null);
  const [imageOpacity, setImageOpacity] = useState<number>(data.imageOpacity || 50);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // تحديث البيانات عند تغيير الـ props
  useEffect(() => {
    setClientName(data.clientName || 'اسم العميل');
    setStudyTitle(data.studyTitle || 'دراسة جدوى');
    setBackgroundImage(data.backgroundImage || null);
    setImageOpacity(data.imageOpacity || 50);
  }, [data.clientName, data.studyTitle, data.backgroundImage, data.imageOpacity]);

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

  // التاريخ بالتنسيق العربي
  const formatArabicDate = (date: Date) => {
    const day = date.getDate();
    const year = date.getFullYear();
    const months = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ];
    const month = months[date.getMonth()];
    
    // تحويل الأرقام للعربية
    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    const toArabicNumerals = (num: number) => {
      return num.toString().split('').map(d => arabicNumerals[parseInt(d)]).join('');
    };
    
    return `${toArabicNumerals(day)} ${month} ${toArabicNumerals(year)}`;
  };
  
  const currentDate = data.date || formatArabicDate(new Date());

  // معالجة رفع صورة الخلفية
  const handleBackgroundClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // ضغط الصورة لتقليل الحجم
  const compressImage = (file: File, maxWidth: number = 1200, quality: number = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = document.createElement('img');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      img.onload = () => {
        // حساب الأبعاد الجديدة مع الحفاظ على النسبة
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // رسم الصورة على الـ canvas
        ctx?.drawImage(img, 0, 0, width, height);
        
        // تحويل إلى base64 مضغوط
        const compressedData = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedData);
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // ضغط الصورة قبل الحفظ
        const compressedImage = await compressImage(file, 1200, 0.7);
        setBackgroundImage(compressedImage);
        if (onUpdate) {
          onUpdate({
            cover: {
              ...data,
              backgroundImage: compressedImage,
              imageOpacity,
            },
          });
        }
      } catch (error) {
        console.error('Error compressing image:', error);
      }
    }
  };

  // تغيير شنفافية الصورة
  const handleOpacityChange = (opacity: number) => {
    setImageOpacity(opacity);
    if (onUpdate) {
      onUpdate({
        cover: {
          ...data,
          imageOpacity: opacity,
        },
      });
    }
  };

  return (
    <div 
      className="relative bg-secondary flex flex-col overflow-hidden group/cover"
      style={{ minHeight: '800px' }}
      dir="rtl"
    >
      {/* إدخال ملف الصورة المخفي */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
        onClick={(e) => e.stopPropagation()}
      />

      {/* صورة الخلفية المخصصة */}
      {backgroundImage && (
        <div className="absolute inset-0 z-[0]">
          <Image
            src={backgroundImage}
            alt="خلفية"
            fill
            className="object-cover"
            style={{ opacity: imageOpacity / 100 }}
          />
        </div>
      )}

      {/* النمط الخلفي */}
      <div 
        className="absolute inset-0 z-[1]"
        style={{
          backgroundImage: `url('/patterns/pattern-vertical-white.png')`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: window.innerWidth < 768 ? '200%' : '150%',
          backgroundPosition: 'center',
          opacity: backgroundImage ? Math.min(0.05 + (imageOpacity / 100) * 0.25, 0.3) : 0.05,
          maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.2) 100%)',
          WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.2) 100%)',
        }}
      />

      {/* منطقة إضافة صورة الخلفية - تظهر عند التحويم فقط */}
      {isEditing && (
        <div 
          className="absolute inset-0 z-[15] pointer-events-none"
        >
          <div className="absolute inset-0 flex items-end justify-end p-6 opacity-0 group-hover/cover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div 
              className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer pointer-events-auto hover:bg-white/20 transition-colors"
              onClick={handleBackgroundClick}
            >
              <ImagePlus className="w-4 h-4 text-primary" />
              <span className="text-primary text-xs font-dubai">
                {backgroundImage ? 'تغيير الخلفية' : 'إضافة خلفية'}
              </span>
            </div>
          </div>
          
          {/* شريط التحكم بالشفافية - يظهر بالأسفل عند التحويم */}
          {backgroundImage && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/cover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover/cover:pointer-events-auto">
              <div className="bg-secondary/90 backdrop-blur-sm px-4 py-2 rounded-full border border-primary/30 flex items-center gap-3">
                <span className="text-primary text-xs font-dubai pointer-events-none">شفافية</span>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={imageOpacity}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleOpacityChange(Number(e.target.value));
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-24 h-1 bg-primary/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* المحتوى - تخطيط ثابت */}
      <div className="relative z-10 h-full min-h-[800px] pointer-events-none">
        {/* wrapper للعناصر القابلة للنقر */}
        <div className="pointer-events-auto absolute inset-0 flex flex-col">
          
          {/* ===== القسم العلوي - الشعار ===== */}
          <div className="flex items-center justify-center pt-10">
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* الشعار */}
              <div className={`relative w-28 h-28 mx-auto mb-3 ${backgroundImage ? 'drop-shadow-2xl' : ''}`}>
                <Image
                  src="/logos/logo-white.png"
                  alt="مفتاحك"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              
              {/* الخط الفاصل المتدرج */}
              <motion.div 
                className="w-64 h-[2px] mx-auto mb-2"
                style={{ 
                  background: 'linear-gradient(to right, transparent, #f8eae7, transparent)'
                }}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              />
              
              <p className={`text-sm font-dubai ${backgroundImage ? '[text-shadow:_0_2px_8px_rgb(0_0_0_/_80%)]' : ''}`} style={{ color: '#f8eae7' }}>
                شريكك في النجاح العقاري
              </p>
            </motion.div>
          </div>

          {/* ===== القسم الأوسط - دراسة جدوى + اسم العميل (في المنتصف تماماً) ===== */}
          <div className="flex-1 flex flex-col items-center justify-center">
            {/* عنوان الدراسة */}
            <motion.div 
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {isEditing && editingField === 'studyTitle' ? (
                <div className="flex items-center justify-center gap-3">
                  <input
                    type="text"
                    value={studyTitle}
                    onChange={(e) => setStudyTitle(e.target.value)}
                    className="text-6xl font-dubai text-primary bg-white/10 backdrop-blur-sm border-b-2 border-primary/50 outline-none text-center px-6 py-3 rounded-t-xl"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSave('studyTitle');
                      if (e.key === 'Escape') handleCancel('studyTitle');
                    }}
                  />
                  <button
                    onClick={() => handleSave('studyTitle')}
                    className="p-2 hover:bg-primary/20 rounded-lg transition-colors"
                  >
                    <Check className="w-5 h-5 text-green-400" />
                  </button>
                  <button
                    onClick={() => handleCancel('studyTitle')}
                    className="p-2 hover:bg-primary/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-red-400" />
                  </button>
                </div>
              ) : (
                <div 
                  className={`relative group inline-block ${isEditing ? 'cursor-pointer' : ''}`}
                  onClick={() => isEditing && setEditingField('studyTitle')}
                >
                  <span className={`text-6xl sm:text-6xl md:text-6xl lg:text-7xl font-dubai font-bold text-primary ${backgroundImage ? '[text-shadow:_0_2px_8px_rgb(0_0_0_/_80%)]' : ''}`}>
                    {studyTitle}
                  </span>
                  {isEditing && (
                    <Edit3 className="w-5 h-5 absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-primary/40" />
                  )}
                </div>
              )}
            </motion.div>

            {/* اسم العميل */}
            <motion.div 
              className="text-center mt-12"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              {isEditing && editingField === 'clientName' ? (
                <div className="flex flex-col items-center gap-2">
                  <span className={`text-primary text-base font-dubai ${backgroundImage ? '[text-shadow:_0_2px_8px_rgb(0_0_0_/_80%)]' : ''}`}>أُعدت خصيصاً للعميل:</span>
                  <div className="flex items-center gap-3">
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
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleSave('clientName')}
                        className="p-2 hover:bg-primary/20 rounded-lg transition-colors"
                      >
                        <Check className="w-5 h-5 text-green-400" />
                      </button>
                      <button
                        onClick={() => handleCancel('clientName')}
                        className="p-2 hover:bg-primary/20 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div 
                  className={`relative group inline-block ${isEditing ? 'cursor-pointer' : ''}`}
                  onClick={() => isEditing && setEditingField('clientName')}
                >
                  <span className={`block text-primary text-base font-dubai mb-1 ${backgroundImage ? '[text-shadow:_0_2px_8px_rgb(0_0_0_/_80%)]' : ''}`}>
                    أُعدت خصيصاً للعميل:
                  </span>
                  <h2 className={`text-3xl font-dubai font-bold text-primary ${backgroundImage ? '[text-shadow:_0_2px_8px_rgb(0_0_0_/_80%)]' : ''}`}>
                    {clientName}
                  </h2>
                  {isEditing && (
                    <Edit3 className="w-5 h-5 absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-primary/40" />
                  )}
                </div>
              )}
            </motion.div>

            {/* الخط الفاصل */}
            <motion.div 
              className="w-40 h-0.5 bg-primary/20 mx-auto mt-8"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            />
          </div>

          {/* ===== القسم السفلي - التاريخ والحقوق ===== */}
          <div className="flex flex-col items-center px-8 pb-12">
            {/* التاريخ */}
            <motion.div 
              className={`flex items-center gap-2 mb-2 ${backgroundImage ? '[text-shadow:_0_2px_8px_rgb(0_0_0_/_80%)]' : ''}`}
              style={{ color: '#f8eae7' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Calendar className="w-4 h-4" />
              <span className="text-base font-dubai">{currentDate}</span>
            </motion.div>

            {/* زخرفة + الحقوق */}
            <motion.div 
              className="text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              {/* زخرفة */}
              <div className="flex items-center justify-center gap-3 mb-1.5">
                <div className="w-12 h-px" style={{ backgroundColor: '#f8eae7' }} />
                <div className="w-2 h-2 rotate-45" style={{ backgroundColor: '#f8eae7' }} />
                <div className="w-12 h-px" style={{ backgroundColor: '#f8eae7' }} />
              </div>
              
              <p className={`text-sm font-dubai ${backgroundImage ? '[text-shadow:_0_2px_8px_rgb(0_0_0_/_80%)]' : ''}`} style={{ color: '#f8eae7' }}>
                تم إنشاء هذا النموذج من خلال
              </p>
              <p className={`text-base font-bristone mt-0.5 ${backgroundImage ? '[text-shadow:_0_2px_8px_rgb(0_0_0_/_80%)]' : ''}`} style={{ color: '#f8eae7' }}>
                moftahak.com
              </p>
            </motion.div>
          </div>
          
        </div>
      </div>

      {/* تأثير التدرج السفلي */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-secondary-dark/50 to-transparent pointer-events-none" />
    </div>
  );
};

export default CoverSlide;
