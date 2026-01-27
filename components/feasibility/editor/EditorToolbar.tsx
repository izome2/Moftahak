'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  Save, 
  Eye, 
  Share2, 
  ZoomIn,
  ZoomOut,
  MoreVertical,
  MousePointer2,
  Move,
  Type,
  ImagePlus,
  Coins
} from 'lucide-react';
import CurrencySelector from '@/components/feasibility/shared/CurrencySelector';

interface EditorToolbarProps {
  studyId: string;
  clientName: string;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onSave: () => void;
  onPreview: () => void;
  onShare: () => void;
  onAddText?: () => void;
  onAddImage?: (imageSrc: string) => void;
  isSaving?: boolean;
  lastSaved?: Date | null;
}

const SHADOWS = {
  toolbar: 'rgba(16, 48, 43, 0.15) 0px 8px 24px',
  button: 'rgba(237, 191, 140, 0.25) 0px 4px 12px',
};

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  studyId,
  clientName,
  zoom,
  onZoomIn,
  onZoomOut,
  onSave,
  onPreview,
  onShare,
  onAddText,
  onAddImage,
  isSaving = false,
  lastSaved = null,
}) => {
  const [showMoreMenu, setShowMoreMenu] = React.useState(false);
  const [activeTool, setActiveTool] = React.useState<'select' | 'move'>('select');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // ضغط الصورة وتقليل حجمها
  const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          
          // تقليل الحجم إذا كان أكبر من الحد الأقصى
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // تحويل إلى JPEG مع ضغط
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        };
        img.onerror = () => reject(new Error('Could not load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Could not read file'));
      reader.readAsDataURL(file);
    });
  };

  // التعامل مع اختيار ملف الصورة
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onAddImage) {
      try {
        // ضغط الصورة قبل إضافتها
        const compressedImage = await compressImage(file, 800, 0.7);
        onAddImage(compressedImage);
      } catch (error) {
        console.error('Error compressing image:', error);
        // في حالة الفشل، استخدم الصورة الأصلية
        const reader = new FileReader();
        reader.onload = (event) => {
          const imageSrc = event.target?.result as string;
          if (imageSrc) {
            onAddImage(imageSrc);
          }
        };
        reader.readAsDataURL(file);
      }
    }
    // إعادة تعيين الـ input للسماح باختيار نفس الملف مرة أخرى
    if (e.target) {
      e.target.value = '';
    }
  };

  // اختصارات الكيبورد للتكبير والتصغير
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (zoom < 200) onZoomIn();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (zoom > 50) onZoomOut();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [zoom, onZoomIn, onZoomOut]);

  return (
    <>
      {/* شريط الأدوات العلوي العائم */}
      <div className="absolute top-4 left-4 z-50 flex items-center pointer-events-none">
        
        {/* القسم الأيسر - الإجراءات */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 pointer-events-auto border-2 border-primary/20"
          style={{ boxShadow: 'rgba(237, 191, 140, 0.15) 0px 4px 20px' }}
        >
          
          <div className="flex items-center gap-2 relative z-10">
            {/* زر المعاينة */}
            <motion.button
              onClick={onPreview}
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-secondary hover:bg-primary/10 rounded-lg transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Eye className="w-4 h-4" />
              <span className="font-dubai text-sm font-medium">معاينة</span>
            </motion.button>

            {/* زر المشاركة */}
            <motion.button
              onClick={onShare}
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-secondary hover:bg-primary/10 rounded-lg transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Share2 className="w-4 h-4" />
              <span className="font-dubai text-sm font-medium">مشاركة</span>
            </motion.button>

            {/* زر تحديد العملة */}
            <CurrencySelector className="hidden sm:block" />

            <div className="h-6 w-px bg-primary/20 hidden sm:block" />

            {/* زر الحفظ */}
            <motion.button
              onClick={onSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 bg-primary text-secondary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ boxShadow: 'rgba(237, 191, 140, 0.25) 0px 4px 12px' }}
              whileHover={{ scale: isSaving ? 1 : 1.02 }}
              whileTap={{ scale: isSaving ? 1 : 0.98 }}
            >
              <Save className="w-4 h-4" />
              <span className="font-dubai text-sm font-medium">
                {isSaving ? 'جاري الحفظ...' : 'حفظ'}
              </span>
            </motion.button>
            
            {/* وقت آخر حفظ - يظهر ويختفي */}
            {lastSaved && !isSaving && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="hidden xl:block lg:landscape:block text-xs text-secondary/50"
              >
                تم الحفظ ✓
              </motion.span>
            )}

            {/* قائمة المزيد للموبايل فقط */}
            <div className="relative sm:hidden">
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="p-2 text-secondary/60 hover:text-secondary hover:bg-primary/10 rounded-lg transition-colors"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {/* القائمة المنسدلة */}
              {showMoreMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute left-0 top-full mt-2 w-48 bg-white shadow-lg border border-primary/20 rounded-2xl overflow-hidden z-[100]"
                  style={{ boxShadow: SHADOWS.toolbar }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onPreview();
                      setShowMoreMenu(false);
                    }}
                    className="w-full p-3 flex items-center gap-3 hover:bg-accent/50 transition-colors text-secondary"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="font-dubai text-sm">معاينة</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onShare();
                      setShowMoreMenu(false);
                    }}
                    className="w-full p-3 flex items-center gap-3 hover:bg-accent/50 transition-colors text-secondary"
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="font-dubai text-sm">مشاركة</span>
                  </button>
                  {/* زر العملة للموبايل */}
                  <div className="border-t border-primary/10">
                    <CurrencySelector className="w-full" />
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Overlay للإغلاق - خارج القائمة */}
        {showMoreMenu && (
          <div 
            className="fixed inset-0 z-[90] sm:hidden" 
            onClick={() => setShowMoreMenu(false)}
          />
        )}
      </div>

      {/* ======== Desktop: شريط الأدوات السفلي المركزي (≥1280px OR landscape ≥1024px) ======== */}
      <div 
        data-toolbar="desktop"
        className="hidden xl:block lg:landscape:block absolute bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
      >
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="group relative flex items-center gap-3 bg-white rounded-xl px-4 py-2.5 pointer-events-auto border-2 border-primary/20 overflow-hidden"
          style={{ boxShadow: 'rgba(237, 191, 140, 0.15) 0px 4px 20px' }}
        >
          {/* تأثير التحويم */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ 
              background: 'linear-gradient(90deg, transparent, rgba(237, 191, 140, 0.4), transparent)',
              transform: 'translateX(-100%)',
            }}
          />
          <div className="flex items-center gap-3 relative z-10">
            {/* أداة التحديد */}
            <button
              onClick={() => setActiveTool('select')}
              className={`p-2.5 rounded-lg transition-colors ${
                activeTool === 'select' 
                  ? 'bg-primary/20 text-primary border border-primary/30' 
                  : 'text-secondary/60 hover:text-secondary hover:bg-primary/10'
              }`}
              title="أداة التحديد"
            >
              <MousePointer2 className="w-5 h-5" />
            </button>

            <div className="h-6 w-px bg-primary/20" />

            {/* إضافة نص */}
            <button
              onClick={() => onAddText?.()}
              className="p-2.5 rounded-lg transition-colors text-secondary/60 hover:text-secondary hover:bg-primary/10"
              title="إضافة نص"
            >
              <Type className="w-5 h-5" />
            </button>

            {/* إضافة صورة */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 rounded-lg transition-colors text-secondary/60 hover:text-secondary hover:bg-primary/10"
              title="إضافة صورة"
            >
              <ImagePlus className="w-5 h-5" />
            </button>

            <div className="h-6 w-px bg-primary/20" />

            {/* التكبير والتصغير */}
            <button
              onClick={onZoomOut}
              className="p-2 text-secondary/60 hover:text-secondary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-40"
              title="تصغير (↓)"
              disabled={zoom <= 25}
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            
            <span className="text-secondary text-sm w-14 text-center font-dubai font-bold bg-primary/10 rounded-lg py-1.5">
              {zoom}%
            </span>
            
            <button
              onClick={onZoomIn}
              className="p-2 text-secondary/60 hover:text-secondary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-40"
              title="تكبير (↑)"
              disabled={zoom >= 200}
            >
              <ZoomIn className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* ======== Mobile/Tablet: شريط أدوات مصغر على اليسار (<1280px portrait) ======== */}
      <motion.div 
        data-toolbar="mobile"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="xl:hidden lg:landscape:hidden fixed bottom-10 left-4 z-40 flex items-center gap-2 bg-white rounded-full px-3 py-2 border-2 border-primary/20"
        style={{ boxShadow: 'rgba(16, 48, 43, 0.15) 0px 10px 40px, rgba(237, 191, 140, 0.3) 0px 0px 0px 1px' }}
      >
        {/* إضافة نص */}
        <button
          onClick={() => onAddText?.()}
          className="p-1.5 rounded-full transition-colors text-secondary/70 hover:text-secondary hover:bg-primary/10"
          title="إضافة نص"
        >
          <Type className="w-4 h-4" />
        </button>

        {/* إضافة صورة */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-1.5 rounded-full transition-colors text-secondary/70 hover:text-secondary hover:bg-primary/10"
          title="إضافة صورة"
        >
          <ImagePlus className="w-4 h-4" />
        </button>
      </motion.div>

      {/* حقل إدخال الصورة المخفي */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        style={{ display: 'none' }}
      />
    </>
  );
};

export default EditorToolbar;
