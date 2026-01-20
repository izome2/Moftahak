'use client';

import React from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { 
  Plus, 
  GripVertical,
  FileText,
  Home,
  ChefHat,
  Bath,
  Bed,
  Sofa,
  MapPin,
  BarChart3,
  DollarSign,
  Layers,
  Settings,
  Trash2,
  Copy,
  Lock,
  Building2
} from 'lucide-react';
import type { Slide, SlideType } from '@/types/feasibility';

// أيقونات الشرائح
const slideIcons: Record<SlideType, React.ElementType> = {
  cover: FileText,
  introduction: Home,
  'room-setup': Settings,
  kitchen: ChefHat,
  bathroom: Bath,
  bedroom: Bed,
  'living-room': Sofa,
  'cost-summary': DollarSign,
  'area-study': MapPin,
  map: MapPin,
  'nearby-apartments': Building2,
  statistics: BarChart3,
  footer: FileText,
};

// ألوان الشرائح
const slideColors: Record<SlideType, string> = {
  cover: 'bg-secondary',
  introduction: 'bg-primary/20',
  'room-setup': 'bg-blue-100',
  kitchen: 'bg-orange-100',
  bathroom: 'bg-cyan-100',
  bedroom: 'bg-purple-100',
  'living-room': 'bg-green-100',
  'cost-summary': 'bg-yellow-100',
  'area-study': 'bg-rose-100',
  map: 'bg-emerald-100',
  'nearby-apartments': 'bg-teal-100',
  statistics: 'bg-indigo-100',
  footer: 'bg-secondary',
};

// أنواع الشرائح المتاحة للإضافة
const availableSlideTypes: { type: SlideType; title: string }[] = [
  { type: 'room-setup', title: 'تكوين الشقة' },
  { type: 'kitchen', title: 'المطبخ' },
  { type: 'bedroom', title: 'غرفة نوم' },
  { type: 'living-room', title: 'الصالة' },
  { type: 'bathroom', title: 'الحمام' },
  { type: 'cost-summary', title: 'ملخص التكاليف' },
  { type: 'area-study', title: 'دراسة المنطقة' },
  { type: 'map', title: 'الخريطة' },
  { type: 'nearby-apartments', title: 'الشقق المحيطة' },
  { type: 'statistics', title: 'الإحصائيات' },
  { type: 'footer', title: 'الخاتمة' },
];

interface SlideManagerProps {
  slides: Slide[];
  activeSlideIndex: number;
  onSlideSelect: (index: number) => void;
  onAddSlide: (type: SlideType, afterIndex?: number) => void;
  onRemoveSlide: (id: string) => void;
  onDuplicateSlide: (id: string) => void;
  onReorderSlides: (fromIndex: number, toIndex: number) => void;
  onSetSlideOrder: (newOrder: Slide[]) => void;
  canRemoveSlide: (id: string) => boolean;
  compact?: boolean;
  studyType?: 'WITH_FIELD_VISIT' | 'WITHOUT_FIELD_VISIT';
}

const SlideManager: React.FC<SlideManagerProps> = ({
  slides,
  activeSlideIndex,
  onSlideSelect,
  onAddSlide,
  onRemoveSlide,
  onDuplicateSlide,
  onReorderSlides,
  onSetSlideOrder,
  canRemoveSlide,
  compact = false,
  studyType = 'WITH_FIELD_VISIT',
}) => {
  const [showAddMenu, setShowAddMenu] = React.useState(false);
  const [contextMenu, setContextMenu] = React.useState<{
    slideId: string;
    x: number;
    y: number;
  } | null>(null);

  // فلترة أنواع الشرائح حسب نوع الدراسة
  const filteredSlideTypes = React.useMemo(() => {
    if (studyType === 'WITHOUT_FIELD_VISIT') {
      // إخفاء شرائح الغرف وملخص التكاليف
      const hiddenTypes: SlideType[] = ['kitchen', 'bedroom', 'living-room', 'bathroom', 'cost-summary'];
      return availableSlideTypes.filter(st => !hiddenTypes.includes(st.type));
    }
    return availableSlideTypes;
  }, [studyType]);

  // معالجة إعادة الترتيب - Reorder من Framer Motion يمرر الترتيب الجديد
  const handleReorder = (newOrder: Slide[]) => {
    onSetSlideOrder(newOrder);
  };

  // معالجة النقر بزر الفأرة الأيمن
  const handleContextMenu = (e: React.MouseEvent, slideId: string) => {
    e.preventDefault();
    setContextMenu({
      slideId,
      x: e.clientX,
      y: e.clientY,
    });
  };

  // إغلاق قائمة السياق
  const closeContextMenu = () => setContextMenu(null);

  return (
    <div className={`h-full flex flex-col editor-cursor ${compact ? 'bg-transparent' : 'bg-secondary/95 backdrop-blur-sm'}`}>
      {/* رأس الشريط الجانبي */}
      <div className={`px-4 py-2.5 ${compact ? 'bg-linear-to-br from-accent/30 to-transparent' : 'border-b border-secondary-light/50'}`}>
        <div className="flex items-center gap-2.5">
          <Layers className={`w-5 h-5 ${compact ? 'text-secondary' : 'text-primary'}`} />
          <h3 className={`font-dubai font-medium text-base ${compact ? 'text-secondary' : 'text-primary'}`}>الشرائح</h3>
          <span className={`text-sm mr-auto ${compact ? 'text-secondary/60 bg-primary/20 px-2.5 py-0.5 rounded-full' : 'text-primary/60'}`}>
            {slides.length}
          </span>
        </div>
      </div>

      {/* قائمة الشرائح */}
      <div className={`flex-1 overflow-y-auto px-2.5 py-2 ${compact ? 'custom-scrollbar' : ''}`}>
        <Reorder.Group
          axis="y"
          values={slides}
          onReorder={handleReorder}
          className="space-y-1.5"
        >
          {slides.map((slide, index) => {
            const Icon = slideIcons[slide.type];
            const isActive = index === activeSlideIndex;
            const isLocked = slide.isLocked;
            const bgColor = slideColors[slide.type];

            return (
              <Reorder.Item
                key={slide.id}
                value={slide}
                dragListener={!isLocked}
                className="outline-none"
              >
                <motion.div
                  onClick={() => onSlideSelect(index)}
                  onContextMenu={(e) => handleContextMenu(e, slide.id)}
                  className={`
                    relative w-full p-2.5 flex items-center gap-2.5 cursor-pointer group rounded-xl overflow-hidden border-2
                    ${isActive 
                      ? 'bg-primary/10 border-primary/30 shadow-[0_4px_20px_rgba(237,191,140,0.25)]' 
                      : 'bg-white border-primary/20 hover:shadow-[0_4px_20px_rgba(237,191,140,0.15)]'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ boxShadow: isActive ? 'rgba(237, 191, 140, 0.25) 0px 4px 20px' : undefined }}
                >
                  {/* أيقونة خلفية شفافة */}
                  <div className="absolute -top-1 -left-1 opacity-[0.10] pointer-events-none">
                    <Icon className="w-12 h-12 text-primary" />
                  </div>
                  
                  {/* تأثير التحويم */}
                  <div 
                    className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ 
                      background: 'linear-gradient(90deg, transparent, rgba(237, 191, 140, 0.4), transparent)',
                      transform: 'translateX(-100%)',
                    }}
                  />
                  
                  <div className="flex items-center gap-2.5 relative z-10 w-full">
                    {/* مقبض السحب */}
                    {!isLocked && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                        <GripVertical className="w-4 h-4 text-secondary/60" />
                      </div>
                    )}
                    
                    {/* أيقونة القفل للشرائح المقفلة */}
                    {isLocked && (
                      <div className="opacity-60">
                        <Lock className="w-4 h-4 text-secondary/60" />
                      </div>
                    )}

                    {/* معاينة الشريحة */}
                    <div className="w-9 h-9 bg-primary/20 flex items-center justify-center rounded-lg border border-primary/30 shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>

                    {/* معلومات الشريحة */}
                    <div className="flex-1 min-w-0 text-right">
                      <span className="text-sm font-dubai font-bold block truncate text-secondary">
                        {slide.title}
                      </span>
                      <span className="text-xs text-secondary/60 block">
                        شريحة {index + 1}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </Reorder.Item>
            );
          })}
        </Reorder.Group>
      </div>

      {/* زر إضافة شريحة */}
      <div className="p-2.5 relative">
        <motion.button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="w-full p-3 flex items-center justify-center gap-2.5 rounded-lg shadow-md bg-linear-to-r from-primary to-primary/80 text-secondary hover:shadow-lg transition-shadow"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-5 h-5" />
          <span className="font-dubai font-medium text-sm">إضافة شريحة</span>
        </motion.button>

        {/* قائمة أنواع الشرائح */}
        <AnimatePresence>
          {showAddMenu && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-full right-0 left-0 mb-2 mx-3 bg-white shadow-[0_8px_30px_rgba(237,191,140,0.3)] border-2 border-primary/20 overflow-hidden z-50 rounded-xl editor-cursor"
            >
              <div className="p-4 border-b-2 border-primary/20 bg-primary/5">
                <span className="text-sm text-secondary font-dubai font-bold">اختر نوع الشريحة</span>
              </div>
              <div className="max-h-64 overflow-y-auto overflow-x-hidden p-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <style jsx>{`
                  div::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>
                {filteredSlideTypes.map((slideType) => {
                  const Icon = slideIcons[slideType.type];
                  return (
                    <button
                      key={slideType.type}
                      onClick={() => {
                        onAddSlide(slideType.type, activeSlideIndex);
                        setShowAddMenu(false);
                      }}
                      className="relative w-full p-3 flex items-center gap-3 text-secondary rounded-xl overflow-hidden border-2 border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all group"
                    >
                      {/* أيقونة خلفية شفافة */}
                      <div className="absolute -top-1 -left-1 opacity-[0.08] pointer-events-none">
                        <Icon className="w-12 h-12 text-primary" />
                      </div>
                      
                      {/* تأثير التحويم */}
                      <div 
                        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ 
                          background: 'linear-gradient(90deg, transparent, rgba(237, 191, 140, 0.4), transparent)',
                          transform: 'translateX(-100%)',
                        }}
                      />
                      
                      <div className="flex items-center gap-3 relative z-10">
                        <div className="w-9 h-9 bg-primary/20 flex items-center justify-center rounded-lg border border-primary/30">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-dubai text-sm font-bold">{slideType.title}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Overlay لإغلاق القائمة */}
        {showAddMenu && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowAddMenu(false)}
          />
        )}
      </div>

      {/* قائمة السياق */}
      <AnimatePresence>
        {contextMenu && (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{
                position: 'fixed',
                left: contextMenu.x,
                top: contextMenu.y,
              }}
              className="bg-white shadow-large border border-accent/50 z-50 min-w-37.5 rounded-xl overflow-hidden editor-cursor"
            >
              <button
                onClick={() => {
                  onDuplicateSlide(contextMenu.slideId);
                  closeContextMenu();
                }}
                className="w-full p-3 flex items-center gap-2.5 hover:bg-accent/50 transition-colors text-secondary text-sm"
                disabled={!canRemoveSlide(contextMenu.slideId)}
              >
                <Copy className="w-4 h-4" />
                <span className="font-dubai">تكرار</span>
              </button>
              <button
                onClick={() => {
                  onRemoveSlide(contextMenu.slideId);
                  closeContextMenu();
                }}
                className="w-full p-3 flex items-center gap-2.5 hover:bg-red-50 transition-colors text-red-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!canRemoveSlide(contextMenu.slideId)}
              >
                <Trash2 className="w-4 h-4" />
                <span className="font-dubai">حذف</span>
              </button>
            </motion.div>
            <div 
              className="fixed inset-0 z-40" 
              onClick={closeContextMenu}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SlideManager;
