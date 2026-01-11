'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ChevronRight, 
  ChevronLeft,
  Plus,
  FileText,
  Home,
  ChefHat,
  Bath,
  Bed,
  Sofa,
  MapPin,
  BarChart3,
  DollarSign,
  Layers
} from 'lucide-react';

interface SlidePreviewItem {
  id: string;
  type: string;
  title: string;
  icon: React.ElementType;
}

interface EditorSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeSlideIndex: number;
  onSlideSelect: (index: number) => void;
}

// الشرائح الافتراضية للمحرر
const defaultSlides: SlidePreviewItem[] = [
  { id: 'cover', type: 'cover', title: 'الغلاف', icon: FileText },
  { id: 'intro', type: 'introduction', title: 'المقدمة', icon: Home },
];

// أنواع الشرائح المتاحة للإضافة
const availableSlideTypes = [
  { type: 'kitchen', title: 'المطبخ', icon: ChefHat },
  { type: 'bedroom', title: 'غرفة نوم', icon: Bed },
  { type: 'living-room', title: 'الصالة', icon: Sofa },
  { type: 'bathroom', title: 'الحمام', icon: Bath },
  { type: 'area-study', title: 'دراسة المنطقة', icon: MapPin },
  { type: 'statistics', title: 'الإحصائيات', icon: BarChart3 },
  { type: 'cost-summary', title: 'ملخص التكاليف', icon: DollarSign },
];

const EditorSidebar: React.FC<EditorSidebarProps> = ({
  isOpen,
  onToggle,
  activeSlideIndex,
  onSlideSelect,
}) => {
  const [slides, setSlides] = React.useState<SlidePreviewItem[]>(defaultSlides);
  const [showAddMenu, setShowAddMenu] = React.useState(false);

  const handleAddSlide = (type: string, title: string, icon: React.ElementType) => {
    const newSlide: SlidePreviewItem = {
      id: `${type}-${Date.now()}`,
      type,
      title,
      icon,
    };
    setSlides([...slides, newSlide]);
    setShowAddMenu(false);
    // تحديد الشريحة الجديدة
    onSlideSelect(slides.length);
  };

  return (
    <div className="h-full bg-secondary flex flex-col relative">
      {/* رأس الشريط الجانبي */}
      <div className="p-4 border-b border-secondary-light">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            <h3 className="text-primary font-dubai font-medium">الشرائح</h3>
          </div>
          <button
            onClick={onToggle}
            className="p-1.5 hover:bg-secondary-light rounded transition-colors"
            title={isOpen ? 'إغلاق الشريط الجانبي' : 'فتح الشريط الجانبي'}
          >
            {isOpen ? (
              <ChevronRight className="w-4 h-4 text-primary" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-primary" />
            )}
          </button>
        </div>
      </div>

      {/* قائمة الشرائح */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {slides.map((slide, index) => {
          const Icon = slide.icon;
          const isActive = index === activeSlideIndex;
          
          return (
            <motion.button
              key={slide.id}
              onClick={() => onSlideSelect(index)}
              className={`
                w-full p-3 flex items-center gap-3 transition-all
                ${isActive 
                  ? 'bg-primary text-secondary' 
                  : 'bg-secondary-light text-primary hover:bg-primary/20'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`
                w-8 h-8 flex items-center justify-center
                ${isActive ? 'bg-secondary/20' : 'bg-primary/10'}
              `}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 text-right">
                <span className="text-sm font-dubai">{slide.title}</span>
                <span className="block text-xs opacity-60">
                  شريحة {index + 1}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* زر إضافة شريحة */}
      <div className="p-3 border-t border-secondary-light relative">
        <motion.button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="w-full p-3 bg-primary text-secondary flex items-center justify-center gap-2 hover:bg-primary-dark transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-5 h-5" />
          <span className="font-dubai font-medium">إضافة شريحة</span>
        </motion.button>

        {/* قائمة أنواع الشرائح */}
        {showAddMenu && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full right-0 left-0 mb-2 mx-3 bg-white shadow-lg border border-accent overflow-hidden z-50 editor-cursor"
          >
            <div className="p-2 border-b border-accent">
              <span className="text-xs text-secondary/60 font-dubai">اختر نوع الشريحة</span>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {availableSlideTypes.map((slideType) => {
                const Icon = slideType.icon;
                return (
                  <button
                    key={slideType.type}
                    onClick={() => handleAddSlide(slideType.type, slideType.title, slideType.icon)}
                    className="w-full p-3 flex items-center gap-3 hover:bg-accent/50 transition-colors text-secondary"
                  >
                    <div className="w-8 h-8 bg-primary/20 flex items-center justify-center">
                      <Icon className="w-4 h-4 text-secondary" />
                    </div>
                    <span className="font-dubai text-sm">{slideType.title}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      {/* Overlay لإغلاق القائمة */}
      {showAddMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowAddMenu(false)}
        />
      )}
    </div>
  );
};

export default EditorSidebar;
