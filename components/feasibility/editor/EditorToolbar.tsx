'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  Save, 
  Eye, 
  Share2, 
  Undo2, 
  Redo2,
  ZoomIn,
  ZoomOut,
  ArrowRight,
  MoreVertical,
  Download,
  Printer,
  MousePointer2,
  Move
} from 'lucide-react';

interface EditorToolbarProps {
  studyId: string;
  clientName: string;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onSave: () => void;
  onPreview: () => void;
  onShare: () => void;
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
}) => {
  const [showMoreMenu, setShowMoreMenu] = React.useState(false);
  const [activeTool, setActiveTool] = React.useState<'select' | 'move'>('select');

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
          className="relative flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 pointer-events-auto border-2 border-primary/20 overflow-hidden"
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
          
          <div className="flex items-center gap-2 relative z-10">
            {/* التراجع والإعادة */}
            <div className="flex items-center gap-1">
              <button
                className="p-2 text-secondary/60 hover:text-secondary hover:bg-primary/10 rounded-lg transition-colors"
                title="تراجع"
                disabled
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                className="p-2 text-secondary/60 hover:text-secondary hover:bg-primary/10 rounded-lg transition-colors"
                title="إعادة"
                disabled
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>

            <div className="h-6 w-px bg-primary/20" />

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

            <div className="h-6 w-px bg-primary/20 hidden sm:block" />

            {/* زر الحفظ */}
            <motion.button
              onClick={onSave}
              className="flex items-center gap-2 px-5 py-2 bg-primary text-secondary hover:bg-primary/90 rounded-lg transition-colors"
              style={{ boxShadow: 'rgba(237, 191, 140, 0.25) 0px 4px 12px' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Save className="w-4 h-4" />
              <span className="font-dubai text-sm font-medium">حفظ</span>
            </motion.button>

            {/* قائمة المزيد */}
            <div className="relative">
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="p-2 text-secondary/60 hover:text-secondary hover:bg-primary/10 rounded-lg transition-colors"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

            {showMoreMenu && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute left-0 top-full mt-2 w-48 bg-white shadow-lg border border-primary/20 rounded-2xl overflow-hidden z-50"
                  style={{ boxShadow: SHADOWS.toolbar }}
                >
                  <button
                    onClick={() => {
                      onPreview();
                      setShowMoreMenu(false);
                    }}
                    className="sm:hidden w-full p-3 flex items-center gap-3 hover:bg-accent/50 transition-colors text-secondary"
                  >
                    <Eye className="w-4 h-4" />
                    <span className="font-dubai text-sm">معاينة</span>
                  </button>
                  <button
                    onClick={() => {
                      onShare();
                      setShowMoreMenu(false);
                    }}
                    className="sm:hidden w-full p-3 flex items-center gap-3 hover:bg-accent/50 transition-colors text-secondary"
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="font-dubai text-sm">مشاركة</span>
                  </button>
                  <button
                    className="w-full p-3 flex items-center gap-3 hover:bg-accent/50 transition-colors text-secondary"
                  >
                    <Download className="w-4 h-4" />
                    <span className="font-dubai text-sm">تحميل PDF</span>
                  </button>
                  <button
                    className="w-full p-3 flex items-center gap-3 hover:bg-accent/50 transition-colors text-secondary"
                  >
                    <Printer className="w-4 h-4" />
                    <span className="font-dubai text-sm">طباعة</span>
                  </button>
                </motion.div>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowMoreMenu(false)}
                />
              </>
            )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* شريط الأدوات السفلي المركزي (التكبير/التصغير والمؤشر) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
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

          {/* أداة التحريك */}
          <button
            onClick={() => setActiveTool('move')}
            className={`p-2.5 rounded-lg transition-colors ${
              activeTool === 'move' 
                ? 'bg-primary/20 text-primary border border-primary/30' 
                : 'text-secondary/60 hover:text-secondary hover:bg-primary/10'
            }`}
            title="أداة التحريك"
          >
            <Move className="w-5 h-5" />
          </button>

          <div className="h-6 w-px bg-primary/20" />

          {/* التكبير والتصغير */}
          <button
            onClick={onZoomOut}
            className="p-2 text-secondary/60 hover:text-secondary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-40"
            title="تصغير (↓)"
            disabled={zoom <= 50}
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
    </>
  );
};

export default EditorToolbar;
