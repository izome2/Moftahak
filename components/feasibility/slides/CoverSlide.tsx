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
      className="relative bg-secondary flex flex-col overflow-hidden"
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
        <div className="absolute inset-0 z-0">
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
        className="absolute inset-0 opacity-5 z-[1]"
        style={{
          backgroundImage: `url('/patterns/pattern-vertical-white.png')`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* منطقة إضافة صورة الخلفية - تظهر عند التحويم فقط */}
      {isEditing && (
        <div 
          className="absolute inset-0 z-[2] cursor-pointer group"
          onClick={handleBackgroundClick}
        >
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
            <div className="bg-white/10 backdrop-blur-sm p-6 flex flex-col items-center gap-3">
              <ImagePlus className="w-12 h-12 text-primary" />
              <span className="text-primary text-sm font-dubai">
                {backgroundImage ? 'انقر لتغيير صورة الخلفية' : 'انقر لإضافة صورة خلفية'}
              </span>
            </div>
          </div>
          
          {/* شريط التحكم بالشفافية - يظهر بالأسفل عند التحويم */}
          {backgroundImage && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-secondary/90 backdrop-blur-sm px-4 py-2 rounded-full border border-primary/30 flex items-center gap-3">
                <span className="text-primary text-xs font-dubai">شفافية</span>
                <input
                  type="range"
                  min="10"
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

      {/* المحتوى */}
      <div className="relative z-10 flex flex-col h-full py-12 pointer-events-none">
        {/* wrapper للعناصر القابلة للنقر */}
        <div className="pointer-events-auto flex-1 flex flex-col">
        {/* القسم العلوي - الشعار (ثابت في الأعلى) */}
        <div className="flex items-center justify-center pt-8">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* الشعار */}
            <div className={`relative w-48 h-48 mx-auto mb-6 ${backgroundImage ? 'drop-shadow-2xl' : ''}`}>
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
              className="w-64 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent mb-4 mx-auto"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            />
            
            <p className={`text-primary text-lg font-dubai ${backgroundImage ? '[text-shadow:_0_2px_8px_rgb(0_0_0_/_80%)]' : ''}`}>
              شريكك في النجاح العقاري
            </p>
          </motion.div>
        </div>

        {/* مساحة فارغة للفصل بين الشعار والمحتوى السفلي */}
        <div className="flex-1" />

        {/* القسم السفلي - كل المحتوى (دراسة جدوى، اسم العميل، التاريخ، الحقوق) */}
        <div className="flex flex-col items-center px-8 pb-8 pt-22">
          {/* عنوان الدراسة */}
          <motion.div 
            className="mb-4 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {isEditing && editingField === 'studyTitle' ? (
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={studyTitle}
                  onChange={(e) => setStudyTitle(e.target.value)}
                  className="text-2xl font-dubai text-primary bg-white/10 backdrop-blur-sm border-b-2 border-primary/50 outline-none text-center px-6 py-3 rounded-t-xl"
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
                className={`relative group ${isEditing ? 'cursor-pointer' : ''}`}
                onClick={() => isEditing && setEditingField('studyTitle')}
              >
                <span className={`text-4xl font-dubai text-primary ${backgroundImage ? '[text-shadow:_0_2px_8px_rgb(0_0_0_/_80%)]' : ''}`}>
                  {studyTitle}
                </span>
                {isEditing && (
                  <Edit3 className="w-5 h-5 absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-primary/40" />
                )}
              </div>
            )}
          </motion.div>

          {/* اسم العميل - "أُعدت خصيصاً للعميل:" أعلى الاسم */}
          <motion.div 
            className="text-center mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            {isEditing && editingField === 'clientName' ? (
              <div className="flex flex-col items-center gap-3">
                <span className={`text-primary text-lg font-dubai ${backgroundImage ? '[text-shadow:_0_2px_8px_rgb(0_0_0_/_80%)]' : ''}`}>أُعدت خصيصاً للعميل:</span>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="text-4xl font-dubai font-bold text-primary bg-white/10 backdrop-blur-sm border-b-2 border-primary outline-none text-center px-4 py-2 rounded-t-xl"
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
                className={`relative group ${isEditing ? 'cursor-pointer' : ''}`}
                onClick={() => isEditing && setEditingField('clientName')}
              >
                {/* "أُعدت خصيصاً للعميل:" أعلى الاسم */}
                <span className={`block text-primary text-lg font-dubai mb-2 ${backgroundImage ? '[text-shadow:_0_2px_8px_rgb(0_0_0_/_80%)]' : ''}`}>
                  أُعدت خصيصاً للعميل:
                </span>
                {/* اسم العميل */}
                <h2 className={`text-4xl font-dubai font-bold text-primary ${backgroundImage ? '[text-shadow:_0_2px_8px_rgb(0_0_0_/_80%)]' : ''}`}>
                  {clientName}
                </h2>
                {isEditing && (
                  <Edit3 className="w-5 h-5 absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-primary/40" />
                )}
              </div>
            )}
          </motion.div>

          {/* الخط الفاصل السفلي */}
          <motion.div 
            className="w-40 h-0.5 bg-primary/20 mb-4"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          />

          {/* التاريخ */}
          <motion.div 
            className={`flex items-center gap-3 text-primary mb-6 ${backgroundImage ? '[text-shadow:_0_2px_8px_rgb(0_0_0_/_80%)]' : ''}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Calendar className="w-5 h-5" />
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
            <div className="flex items-center justify-center gap-4 mb-3">
              <div className="w-16 h-px bg-primary/20" />
              <div className="w-3 h-3 bg-primary rotate-45 rounded-sm" />
              <div className="w-16 h-px bg-primary/20" />
            </div>
            
            <p className={`text-primary text-sm font-dubai ${backgroundImage ? '[text-shadow:_0_2px_8px_rgb(0_0_0_/_80%)]' : ''}`}>
              تم إنشاء هذا النموذج من خلال
            </p>
            <p className={`text-primary text-lg font-bristone mt-1 ${backgroundImage ? '[text-shadow:_0_2px_8px_rgb(0_0_0_/_80%)]' : ''}`}>
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
