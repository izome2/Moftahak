'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  PieChart,
  Plus,
  X,
  Save,
  Edit2,
  Trash2,
  Calculator,
  Percent,
  MapPin,
  Wallet,
  FileText,
  Bold,
  Italic,
  Underline,
  List,
  ALargeSmall
} from 'lucide-react';
import { StatisticsSlideData, AreaStatistics, MonthlyOccupancyData } from '@/types/feasibility';
import CostChart from './CostChart';
import { useFeasibilityEditorSafe } from '@/contexts/FeasibilityEditorContext';
import EditableSectionTitle from '@/components/feasibility/shared/EditableSectionTitle';
import useCurrencyFormatter from '@/hooks/useCurrencyFormatter';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from 'recharts';

// الظلال المتناسقة
const SHADOWS = {
  card: '0 4px 20px rgba(16, 48, 43, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
  cardHover: '0 12px 40px rgba(16, 48, 43, 0.15), 0 4px 12px rgba(237, 191, 140, 0.1)',
  icon: '0 4px 12px rgba(237, 191, 140, 0.3)',
  button: '0 4px 16px rgba(237, 191, 140, 0.4)',
  modal: '0 25px 60px rgba(16, 48, 43, 0.25)',
};

// ألوان الهايلايت للملاحظات (البيج والأخضر من الهوية)
const HIGHLIGHT_COLORS = [
  { id: 'beige', color: 'rgba(237, 191, 140, 0.5)', textColor: '#10302b', label: 'بيج' },
  { id: 'green', color: 'rgba(16, 48, 43, 0.8)', textColor: '#edbf8c', label: 'أخضر' },
];

// الأشهر بالعربي
const MONTHS_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

interface StatisticsSlideProps {
  data?: StatisticsSlideData;
  isEditing?: boolean;
  onUpdate?: (data: StatisticsSlideData) => void;
  studyType?: 'WITH_FIELD_VISIT' | 'WITHOUT_FIELD_VISIT';
}

const defaultAreaStatistics: AreaStatistics = {
  averageDailyRate: 0,
  averageOccupancy: 0,
  averageAnnualRevenue: 0,
};

const defaultMonthlyOccupancy: MonthlyOccupancyData[] = MONTHS_AR.map(month => ({
  month,
  occupancy: 0,
}));

const defaultData: StatisticsSlideData = {
  totalCost: 0,
  averageRent: 0,
  roomsCost: [],
  operationalCosts: [
    { name: 'إيجار', cost: 0 },
    { name: 'إنترنت', cost: 0 },
    { name: 'مياه', cost: 0 },
    { name: 'كهرباء', cost: 0 },
    { name: 'بواب', cost: 0 },
  ],
  areaStatistics: defaultAreaStatistics,
  monthlyOccupancy: defaultMonthlyOccupancy,
};

// تنسيق السعر
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ar-EG').format(price);
};

// تنسيق النسبة المئوية
const formatPercent = (value: number) => {
  return `${Math.round(value)}%`;
};

export default function StatisticsSlide({
  data = defaultData,
  isEditing = false,
  onUpdate,
  studyType: propStudyType,
}: StatisticsSlideProps) {
  // جلب studyType من context إذا كان متاحاً
  const editorContext = useFeasibilityEditorSafe();
  const studyType = propStudyType || editorContext?.studyType || 'WITH_FIELD_VISIT';
  const isWithFieldVisit = studyType === 'WITH_FIELD_VISIT';
  const { currencySymbol } = useCurrencyFormatter();
  
  const [slideData, setSlideData] = useState<StatisticsSlideData>({
    ...defaultData,
    ...data,
    areaStatistics: data.areaStatistics || defaultAreaStatistics,
    monthlyOccupancy: data.monthlyOccupancy || defaultMonthlyOccupancy,
  });
  const [showEditOccupancyModal, setShowEditOccupancyModal] = useState(false);
  const [isEditingYear, setIsEditingYear] = useState(false);
  const yearInputRef = useRef<HTMLInputElement>(null);
  
  // حالة الملاحظات
  const [notesTitle, setNotesTitle] = useState(data.notesTitle || 'ملاحظات إضافية');
  const [notesContent, setNotesContent] = useState(data.notesContent || '');
  const notesEditorRef = useRef<HTMLDivElement>(null);
  
  // السنة من البيانات أو السنة الحالية افتراضياً
  const year = slideData.year || new Date().getFullYear().toString();

  // تحديث البيانات من الخارج
  useEffect(() => {
    setSlideData(prev => ({
      ...defaultData,
      ...data,
      areaStatistics: data.areaStatistics || defaultAreaStatistics,
      monthlyOccupancy: data.monthlyOccupancy || defaultMonthlyOccupancy,
      // الحفاظ على السنة من البيانات أو السابقة
      year: data.year || prev.year,
    }));
    // تحديث الملاحظات
    setNotesTitle(data.notesTitle || 'ملاحظات إضافية');
    setNotesContent(data.notesContent || '');
    // تحديث محتوى الـ contentEditable
    if (notesEditorRef.current && !isEditing) {
      notesEditorRef.current.innerHTML = data.notesContent || '';
    }
  }, [data, isEditing]);

  // تهيئة محتوى الملاحظات عند التحرير
  useEffect(() => {
    if (notesEditorRef.current && isEditing && notesContent) {
      if (notesEditorRef.current.innerHTML === '') {
        notesEditorRef.current.innerHTML = notesContent;
      }
    }
  }, [isEditing, notesContent]);

  // حفظ مرجع لـ onUpdate لتجنب infinite loop
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  // إضافة تكلفة جديدة فوراً
  const handleAddCost = () => {
    const newItem = { name: 'بند جديد', cost: 0 };
    const newRoomsCost = [...slideData.roomsCost, newItem];
    const newTotalCost = newRoomsCost.reduce((sum, item) => sum + item.cost, 0);
    const newData: StatisticsSlideData = {
      ...slideData,
      roomsCost: newRoomsCost,
      totalCost: newTotalCost,
    };
    setSlideData(newData);
    onUpdateRef.current?.(newData);
  };

  // تحديث اسم تكلفة
  const handleUpdateCostName = (index: number, name: string) => {
    const newData = {
      ...slideData,
      roomsCost: slideData.roomsCost.map((item, i) =>
        i === index ? { ...item, name } : item
      ),
    };
    setSlideData(newData);
    if (onUpdateRef.current) onUpdateRef.current(newData);
  };

  // تحديث قيمة تكلفة
  const handleUpdateCostValue = (index: number, cost: number) => {
    const newData = {
      ...slideData,
      roomsCost: slideData.roomsCost.map((item, i) =>
        i === index ? { ...item, cost } : item
      ),
    };
    newData.totalCost = newData.roomsCost.reduce((sum, item) => sum + item.cost, 0);
    setSlideData(newData);
    if (onUpdateRef.current) onUpdateRef.current(newData);
  };

  // حذف تكلفة
  const handleDeleteCost = (index: number) => {
    const newData = {
      ...slideData,
      roomsCost: slideData.roomsCost.filter((_, i) => i !== index),
    };
    newData.totalCost = newData.roomsCost.reduce((sum, item) => sum + item.cost, 0);
    setSlideData(newData);
    if (onUpdateRef.current) onUpdateRef.current(newData);
  };

  // === دوال المصاريف التشغيلية ===
  
  // إضافة مصروف تشغيلي جديد
  const handleAddOperationalCost = () => {
    const newItem = { name: 'مصروف جديد', cost: 0 };
    const newOperationalCosts = [...(slideData.operationalCosts || []), newItem];
    const newData: StatisticsSlideData = {
      ...slideData,
      operationalCosts: newOperationalCosts,
    };
    setSlideData(newData);
    onUpdateRef.current?.(newData);
  };

  // تحديث اسم مصروف تشغيلي
  const handleUpdateOperationalCostName = (index: number, name: string) => {
    const newData = {
      ...slideData,
      operationalCosts: (slideData.operationalCosts || []).map((item, i) =>
        i === index ? { ...item, name } : item
      ),
    };
    setSlideData(newData);
    onUpdateRef.current?.(newData);
  };

  // تحديث قيمة مصروف تشغيلي
  const handleUpdateOperationalCostValue = (index: number, cost: number) => {
    const newData = {
      ...slideData,
      operationalCosts: (slideData.operationalCosts || []).map((item, i) =>
        i === index ? { ...item, cost } : item
      ),
    };
    setSlideData(newData);
    onUpdateRef.current?.(newData);
  };

  // حذف مصروف تشغيلي
  const handleDeleteOperationalCost = (index: number) => {
    const newData = {
      ...slideData,
      operationalCosts: (slideData.operationalCosts || []).filter((_, i) => i !== index),
    };
    setSlideData(newData);
    onUpdateRef.current?.(newData);
  };

  // تعديل متوسط الإيجار
  const handleUpdateAverageRent = (value: number) => {
    const newData = { ...slideData, averageRent: value };
    setSlideData(newData);
    if (onUpdateRef.current) onUpdateRef.current(newData);
  };

  // تحديث بيانات الإشغال الشهري
  const handleUpdateMonthlyOccupancy = (monthIndex: number, occupancy: number) => {
    const newMonthlyData = [...(slideData.monthlyOccupancy || defaultMonthlyOccupancy)];
    newMonthlyData[monthIndex] = { ...newMonthlyData[monthIndex], occupancy };
    const newData = { ...slideData, monthlyOccupancy: newMonthlyData };
    setSlideData(newData);
    if (onUpdateRef.current) onUpdateRef.current(newData);
  };

  // === دوال الملاحظات ===
  
  // تحديث عنوان الملاحظات
  const handleNotesTitleBlur = () => {
    if (notesTitle !== slideData.notesTitle) {
      const newData = { ...slideData, notesTitle };
      setSlideData(newData);
      onUpdateRef.current?.(newData);
    }
  };

  // تحديث محتوى الملاحظات
  const handleNotesContentBlur = () => {
    if (notesEditorRef.current) {
      const content = notesEditorRef.current.innerHTML;
      if (content !== slideData.notesContent) {
        const newData = { ...slideData, notesContent: content };
        setSlideData(newData);
        onUpdateRef.current?.(newData);
      }
    }
  };

  // حفظ التحديد الحالي للملاحظات
  const saveSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      return selection.getRangeAt(0).cloneRange();
    }
    return null;
  }, []);

  // استعادة التحديد
  const restoreSelection = useCallback((range: Range | null) => {
    if (range) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }, []);

  // تطبيق التنسيق
  const applyFormat = useCallback((command: string, value?: string) => {
    const savedRange = saveSelection();
    document.execCommand(command, false, value);
    restoreSelection(savedRange);
    notesEditorRef.current?.focus();
  }, [saveSelection, restoreSelection]);

  // تطبيق الهايلايت مع تغيير لون النص
  const applyHighlight = useCallback((colorData: typeof HIGHLIGHT_COLORS[0]) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString();
      
      if (selectedText.trim()) {
        const span = document.createElement('span');
        span.style.backgroundColor = colorData.color;
        span.style.color = colorData.textColor;
        span.style.padding = '1px 4px';
        span.style.borderRadius = '3px';
        span.style.userSelect = 'text';
        span.style.cursor = 'text';
        span.setAttribute('data-highlight', colorData.id);
        
        const fragment = range.extractContents();
        span.appendChild(fragment);
        range.insertNode(span);
        
        selection.removeAllRanges();
        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        selection.addRange(newRange);
      }
    }
    notesEditorRef.current?.focus();
  }, []);

  // إزالة الهايلايت
  const removeHighlight = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer;
      
      let highlightSpan: HTMLElement | null = null;
      if (container.nodeType === Node.TEXT_NODE) {
        highlightSpan = container.parentElement?.closest('span[data-highlight]') as HTMLElement;
      } else if (container instanceof HTMLElement) {
        highlightSpan = container.closest('span[data-highlight]') as HTMLElement;
      }
      
      if (highlightSpan && highlightSpan.parentNode) {
        const textContent = highlightSpan.textContent || '';
        const textNode = document.createTextNode(textContent);
        highlightSpan.parentNode.replaceChild(textNode, highlightSpan);
      }
    }
    notesEditorRef.current?.focus();
  }, []);

  // إضافة نقطة رأسية
  const insertBullet = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !notesEditorRef.current) return;
    
    const range = selection.getRangeAt(0);
    const bulletText = '    • ';
    const textNode = document.createTextNode(bulletText);
    range.insertNode(textNode);
    
    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    selection.removeAllRanges();
    selection.addRange(range);
  }, []);

  // تكبير/تصغير حجم الخط
  const toggleFontSize = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer;
      
      let fontSpan: HTMLElement | null = null;
      if (container.nodeType === Node.TEXT_NODE) {
        fontSpan = container.parentElement?.closest('span[data-fontsize="large"]') as HTMLElement;
      } else if (container instanceof HTMLElement) {
        fontSpan = container.closest('span[data-fontsize="large"]') as HTMLElement;
      }
      
      if (fontSpan && fontSpan.parentNode) {
        const textContent = fontSpan.textContent || '';
        const textNode = document.createTextNode(textContent);
        fontSpan.parentNode.replaceChild(textNode, fontSpan);
      } else {
        const selectedText = range.toString();
        if (selectedText.trim()) {
          const span = document.createElement('span');
          span.style.fontSize = '1.2em';
          span.setAttribute('data-fontsize', 'large');
          
          const fragment = range.extractContents();
          span.appendChild(fragment);
          range.insertNode(span);
          
          selection.removeAllRanges();
          const newRange = document.createRange();
          newRange.selectNodeContents(span);
          selection.addRange(newRange);
        }
      }
    }
    notesEditorRef.current?.focus();
  }, []);

  // معالجة الخروج من الهايلايت عند الضغط على الأسهم
  const handleNotesKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const container = range.startContainer;
        
        // البحث عن span الهايلايت
        let highlightSpan: HTMLElement | null = null;
        if (container.nodeType === Node.TEXT_NODE) {
          highlightSpan = container.parentElement?.closest('span[data-highlight]') as HTMLElement;
        } else if (container instanceof HTMLElement) {
          highlightSpan = container.closest('span[data-highlight]') as HTMLElement;
        }
        
        if (highlightSpan) {
          const offset = range.startOffset;
          const textLength = container.textContent?.length || 0;
          
          // إذا كان المؤشر في النهاية وضغط سهم يمين (أو البداية وسهم يسار في RTL)
          if ((e.key === 'ArrowRight' && offset === 0) || 
              (e.key === 'ArrowLeft' && offset === textLength)) {
            // إنشاء مسافة بعد الهايلايت للخروج منه
            const space = document.createTextNode('\u200B'); // Zero-width space
            if (e.key === 'ArrowLeft') {
              highlightSpan.parentNode?.insertBefore(space, highlightSpan.nextSibling);
            } else {
              highlightSpan.parentNode?.insertBefore(space, highlightSpan);
            }
          }
        }
      }
    }
  }, []);

  // معالجة النقر - الخروج من الهايلايت عند النقر خارجه
  const handleNotesClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // تأخير صغير للسماح للتحديد بالتحديث
    setTimeout(() => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0 && selection.isCollapsed) {
        const range = selection.getRangeAt(0);
        const container = range.startContainer;
        
        // التحقق مما إذا كان المؤشر داخل هايلايت
        let highlightSpan: HTMLElement | null = null;
        if (container.nodeType === Node.TEXT_NODE) {
          highlightSpan = container.parentElement?.closest('span[data-highlight]') as HTMLElement;
        } else if (container instanceof HTMLElement) {
          highlightSpan = container.closest('span[data-highlight]') as HTMLElement;
        }
        
        // إذا كان داخل هايلايت، أضف مسافة غير مرئية للخروج منه
        if (highlightSpan && highlightSpan.parentNode) {
          const offset = range.startOffset;
          const textLength = container.textContent?.length || 0;
          
          // إذا كان في بداية أو نهاية الهايلايت
          if (offset === 0 || offset === textLength) {
            const space = document.createTextNode('\u200B');
            if (offset === textLength) {
              highlightSpan.parentNode.insertBefore(space, highlightSpan.nextSibling);
            } else {
              highlightSpan.parentNode.insertBefore(space, highlightSpan);
            }
            // نقل المؤشر إلى المسافة الجديدة
            const newRange = document.createRange();
            newRange.setStart(space, offset === 0 ? 0 : 1);
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);
          }
        }
      }
    }, 0);
  }, []);

  // حساب التكلفة الإجمالية من الغرف
  const totalFromRooms = slideData.roomsCost.reduce((sum, item) => sum + item.cost, 0);
  
  // حساب المصاريف التشغيلية الشهرية
  const monthlyOperationalCosts = (slideData.operationalCosts || []).reduce((sum, item) => sum + item.cost, 0);
  
  // حساب المصاريف التشغيلية السنوية (الشهرية × 12)
  const annualOperationalCosts = monthlyOperationalCosts * 12;
  
  // متوسط الربح السنوي (العائد السنوي - المصاريف التشغيلية السنوية)
  const areaStats = slideData.areaStatistics || defaultAreaStatistics;
  const annualProfit = (areaStats.averageAnnualRevenue || 0) - annualOperationalCosts;
  
  // حساب فترة الاسترداد (تكلفة التجهيز ÷ الربح السنوي)
  // إذا كان الربح السنوي موجب، نحسب مدة الاسترداد بالأشهر
  const paybackPeriod = annualProfit > 0 
    ? Math.ceil((totalFromRooms / annualProfit) * 12)
    : 0;

  const monthlyOccupancy = slideData.monthlyOccupancy || defaultMonthlyOccupancy;

  return (
    <div className="relative min-h-full p-6 md:p-8 bg-linear-to-br from-accent/30 via-white to-accent/20 pb-24">
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
          {/* Background Icon */}
          <div className="absolute -top-8 -left-8 opacity-[0.08] pointer-events-none">
            <BarChart3 className="w-56 h-56 text-primary" strokeWidth={1.5} />
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.div 
                className="p-4 rounded-2xl bg-primary/20 border-2 border-primary/30"
                whileHover={{ scale: 1.05, rotate: 5 }}
                style={{ boxShadow: SHADOWS.icon }}
              >
                <BarChart3 className="w-8 h-8 text-primary" strokeWidth={2} />
              </motion.div>
              <div>
                <EditableSectionTitle
                  title="الإحصائيات والملخص"
                  subtitle={isWithFieldVisit ? 'ملخص شامل للتكاليف وإحصائيات المنطقة' : 'إحصائيات المنطقة والشقق المحيطة'}
                  isEditing={isEditing}
                />
              </div>
            </div>

            {/* Total Summary Badge - فقط مع نزول ميداني */}
            {isWithFieldVisit && (
              <div className="text-center px-6 py-3 bg-primary/20 rounded-2xl border-2 border-primary/30">
                <span className="block text-xs text-secondary/60 font-dubai mb-1">إجمالي التكلفة</span>
                <span className="block text-2xl font-bold text-primary font-bristone">{formatPrice(totalFromRooms)}</span>
                <span className="text-xs text-secondary/60 font-dubai">{currencySymbol}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Rooms Cost Section - فقط مع نزول ميداني */}
        {isWithFieldVisit && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white border-2 border-primary/20"
          style={{ boxShadow: SHADOWS.card }}
        >
          {/* Section Header */}
          <div className="bg-linear-to-r from-primary/20 to-primary/10 px-6 py-4 border-b-2 border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/30 border border-primary/40">
                  <PieChart className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="font-dubai font-bold text-secondary text-lg">توزيع التكاليف</h3>
                  <p className="text-secondary/60 text-xs font-dubai">{slideData.roomsCost.length} بند</p>
                </div>
              </div>
              {isEditing && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddCost}
                  className="px-3 py-1.5 bg-primary/20 border-2 border-primary/30 text-secondary rounded-lg flex items-center gap-1.5 text-xs font-dubai font-bold hover:bg-primary/30 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  إضافة
                </motion.button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {slideData.roomsCost.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-12 flex flex-col items-center justify-center text-center"
              >
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative mb-4"
                >
                  <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-xl" />
                  <div 
                    className="relative w-20 h-20 bg-linear-to-br from-primary/30 to-primary/10 rounded-3xl flex items-center justify-center border-2 border-primary/30"
                    style={{ boxShadow: SHADOWS.icon }}
                  >
                    <PieChart className="w-10 h-10 text-primary" strokeWidth={1.5} />
                  </div>
                </motion.div>
                
                <h4 className="font-dubai font-bold text-secondary text-lg mb-1">
                  لا توجد بيانات تكاليف
                </h4>
                <p className="font-dubai text-secondary/50 text-sm max-w-sm">
                  {isEditing ? 'انقر على "إضافة" لإضافة بيانات التكاليف' : 'سيتم تحديث البيانات تلقائياً من الغرف'}
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Chart */}
                <div className="min-h-64 bg-transparent">
                  <CostChart data={slideData.roomsCost} />
                </div>

                {/* List */}
                <div className="space-y-2">
                  {slideData.roomsCost.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="relative rounded-xl bg-accent/30 p-4 border-2 border-primary/20 group"
                      style={{ boxShadow: 'rgba(237, 191, 140, 0.2) 0px 2px 8px' }}
                    >
                      <div className="flex items-center gap-4">
                        {/* Number Badge */}
                        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center shrink-0 border-2 border-primary/30">
                          <span className="font-bristone font-bold text-secondary">{index + 1}</span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          {isEditing ? (
                            <input
                              type="text"
                              value={item.name}
                              onChange={e => handleUpdateCostName(index, e.target.value)}
                              className="font-dubai font-bold text-secondary text-base bg-transparent border-none outline-none w-full focus:bg-white/50 rounded px-1 transition-colors"
                              placeholder="اسم البند"
                            />
                          ) : (
                            <h4 className="font-dubai font-bold text-secondary text-base truncate">
                              {item.name}
                            </h4>
                          )}
                        </div>

                        {/* Price & Actions */}
                        <div className="flex items-center gap-2">
                          <div className="text-left">
                            {isEditing ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  value={item.cost}
                                  onChange={e => handleUpdateCostValue(index, Number(e.target.value))}
                                  className="font-dubai font-bold text-primary text-lg bg-transparent border-none outline-none w-24 text-right focus:bg-white/50 rounded px-1 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <span className="text-xs text-secondary/60 font-dubai">{currencySymbol}</span>
                              </div>
                            ) : (
                              <>
                                <motion.span 
                                  className="font-dubai font-bold text-primary text-lg block"
                                  key={item.cost}
                                  initial={{ scale: 1.2 }}
                                  animate={{ scale: 1 }}
                                >
                                  {formatPrice(item.cost)}
                                </motion.span>
                                <span className="text-xs text-secondary/60 font-dubai">{currencySymbol}</span>
                              </>
                            )}
                          </div>
                          
                          {isEditing && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDeleteCost(index)}
                                className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
        )}

        {/* Operational Costs Section - المصاريف التشغيلية - فقط مع نزول ميداني */}
        {isWithFieldVisit && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white border-2 border-primary/20"
          style={{ boxShadow: SHADOWS.card }}
        >
          {/* Section Header */}
          <div className="bg-linear-to-r from-primary/20 to-primary/10 px-6 py-4 border-b-2 border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/30 border border-primary/40">
                  <Wallet className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="font-dubai font-bold text-secondary text-lg">المصاريف التشغيلية</h3>
                  <p className="text-secondary/60 text-xs font-dubai">{(slideData.operationalCosts || []).length} بند</p>
                </div>
              </div>
              {isEditing && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddOperationalCost}
                  className="px-3 py-1.5 bg-primary/20 border-2 border-primary/30 text-secondary rounded-lg flex items-center gap-1.5 text-xs font-dubai font-bold hover:bg-primary/30 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  إضافة
                </motion.button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {(slideData.operationalCosts || []).length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-12 flex flex-col items-center justify-center text-center"
              >
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative mb-4"
                >
                  <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-xl" />
                  <div 
                    className="relative w-20 h-20 bg-linear-to-br from-primary/30 to-primary/10 rounded-3xl flex items-center justify-center border-2 border-primary/30"
                    style={{ boxShadow: SHADOWS.icon }}
                  >
                    <Wallet className="w-10 h-10 text-primary" strokeWidth={1.5} />
                  </div>
                </motion.div>
                
                <h4 className="font-dubai font-bold text-secondary text-lg mb-1">
                  لا توجد مصاريف تشغيلية
                </h4>
                <p className="font-dubai text-secondary/50 text-sm max-w-sm">
                  {isEditing ? 'انقر على "إضافة" لإضافة المصاريف التشغيلية (إيجار، إنترنت، مياه، كهرباء...)' : 'لم يتم إضافة مصاريف تشغيلية بعد'}
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Chart */}
                <div className="min-h-64 bg-transparent">
                  <CostChart data={slideData.operationalCosts || []} />
                </div>

                {/* List */}
                <div className="space-y-2">
                  {(slideData.operationalCosts || []).map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="relative rounded-xl bg-accent/30 p-4 border-2 border-primary/20 group"
                      style={{ boxShadow: 'rgba(237, 191, 140, 0.2) 0px 2px 8px' }}
                    >
                      <div className="flex items-center gap-4">
                        {/* Number Badge */}
                        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center shrink-0 border-2 border-primary/30">
                          <span className="font-bristone font-bold text-secondary">{index + 1}</span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          {isEditing ? (
                            <input
                              type="text"
                              value={item.name}
                              onChange={e => handleUpdateOperationalCostName(index, e.target.value)}
                              className="font-dubai font-bold text-secondary text-base bg-transparent border-none outline-none w-full focus:bg-white/50 rounded px-1 transition-colors"
                              placeholder="اسم المصروف"
                            />
                          ) : (
                            <h4 className="font-dubai font-bold text-secondary text-base truncate">
                              {item.name}
                            </h4>
                          )}
                        </div>

                        {/* Price & Actions */}
                        <div className="flex items-center gap-2">
                          <div className="text-left">
                            {isEditing ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  value={item.cost.toLocaleString('ar-EG')}
                                  onChange={e => {
                                    const numValue = Number(e.target.value.replace(/[^\d٠-٩]/g, '').replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString()));
                                    handleUpdateOperationalCostValue(index, numValue);
                                  }}
                                  className="font-dubai font-bold text-primary text-lg bg-transparent border-none outline-none w-24 text-right focus:bg-white/50 rounded px-1 transition-colors"
                                />
                                <span className="text-xs text-secondary/60 font-dubai">{currencySymbol}</span>
                              </div>
                            ) : (
                              <>
                                <motion.span 
                                  className="font-dubai font-bold text-primary text-lg block"
                                  key={item.cost}
                                  initial={{ scale: 1.2 }}
                                  animate={{ scale: 1 }}
                                >
                                  {formatPrice(item.cost)}
                                </motion.span>
                                <span className="text-xs text-secondary/60 font-dubai">{currencySymbol}</span>
                              </>
                            )}
                          </div>
                          
                          {isEditing && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDeleteOperationalCost(index)}
                                className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
        )}

        {/* إحصائيات المنطقة Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white border-2 border-primary/20"
          style={{ boxShadow: SHADOWS.card }}
        >
          {/* Section Header */}
          <div className="bg-linear-to-r from-primary/20 to-primary/10 px-6 py-4 border-b-2 border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/30 border border-primary/40">
                  <MapPin className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="font-dubai font-bold text-secondary text-lg">إحصائيات المنطقة</h3>
                  <p className="text-secondary/60 text-xs font-dubai">متوسط أداء الشقق المجاورة</p>
                </div>
              </div>
            </div>
          </div>

          {/* Area Statistics Cards */}
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* متوسط سعر الليلة */}
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                className="relative rounded-2xl bg-primary/20 p-4 sm:p-5 border-2 border-primary/30 group"
                style={{ boxShadow: 'rgba(237, 191, 140, 0.3) 0px 4px 12px' }}
              >
                <div className="absolute -top-4 -left-4 z-0 opacity-[0.10] pointer-events-none">
                  <DollarSign className="w-24 h-24 text-primary" strokeWidth={1.5} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-xl bg-primary/30 border-2 border-primary/40" style={{ boxShadow: SHADOWS.icon }}>
                      <DollarSign className="w-5 h-5 text-secondary" />
                    </div>
                    <span className="text-sm text-secondary/70 font-dubai">متوسط سعر الليلة</span>
                  </div>
                  <div className="mr-12">
                    <span className="inline-flex flex-row-reverse items-baseline gap-0.5">
                      <span className="text-sm font-bold text-secondary/70 font-dubai">{currencySymbol}</span>
                      <span className="text-2xl font-bold text-secondary font-dubai rounded px-1 py-0.5">{areaStats.averageDailyRate.toLocaleString('ar-EG')}</span>
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* متوسط نسبة الإشغال */}
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                className="relative rounded-2xl bg-primary/20 p-4 sm:p-5 border-2 border-primary/30 group"
                style={{ boxShadow: 'rgba(237, 191, 140, 0.3) 0px 4px 12px' }}
              >
                <div className="absolute -top-4 -left-4 z-0 opacity-[0.10] pointer-events-none">
                  <Percent className="w-24 h-24 text-primary" strokeWidth={1.5} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-xl bg-primary/30 border-2 border-primary/40" style={{ boxShadow: SHADOWS.icon }}>
                      <Percent className="w-5 h-5 text-secondary" />
                    </div>
                    <span className="text-sm text-secondary/70 font-dubai">متوسط نسبة الإشغال</span>
                  </div>
                  <div className="mr-12">
                    <span className="inline-flex flex-row-reverse items-baseline gap-0.5">
                      <span className="text-sm font-bold text-secondary/70 font-dubai">%</span>
                      <span className="text-2xl font-bold text-secondary font-dubai rounded px-1 py-0.5">{Math.round(areaStats.averageOccupancy).toLocaleString('ar-EG')}</span>
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* متوسط العوائد السنوية */}
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                className="relative rounded-2xl bg-primary/20 p-4 sm:p-5 border-2 border-primary/30 group"
                style={{ boxShadow: 'rgba(237, 191, 140, 0.3) 0px 4px 12px' }}
              >
                <div className="absolute -top-4 -left-4 z-0 opacity-[0.10] pointer-events-none">
                  <TrendingUp className="w-24 h-24 text-primary" strokeWidth={1.5} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-xl bg-primary/30 border-2 border-primary/40" style={{ boxShadow: SHADOWS.icon }}>
                      <TrendingUp className="w-5 h-5 text-secondary" />
                    </div>
                    <span className="text-sm text-secondary/70 font-dubai">متوسط العوائد السنوية</span>
                  </div>
                  <div className="mr-12">
                    <span className="inline-flex flex-row-reverse items-baseline gap-0.5">
                      <span className="text-sm font-bold text-secondary/70 font-dubai">{currencySymbol}</span>
                      <span className="text-2xl font-bold text-secondary font-dubai rounded px-1 py-0.5">{areaStats.averageAnnualRevenue.toLocaleString('ar-EG')}</span>
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* شارت متوسط نسبة الإشغال الشهري */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white border-2 border-primary/20"
          style={{ boxShadow: SHADOWS.card }}
        >
          {/* Section Header */}
          <div className="bg-linear-to-r from-primary/20 to-primary/10 px-6 py-4 border-b-2 border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/30 border border-primary/40">
                  <BarChart3 className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-dubai font-bold text-secondary text-lg">توزيع نسبة الاشغال السنوي لعام</h3>
                    {isEditing && isEditingYear ? (
                      <input
                        ref={yearInputRef}
                        type="text"
                        inputMode="numeric"
                        value={year}
                        onChange={(e) => {
                          const arabicToEnglish = e.target.value.replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
                          const numericValue = arabicToEnglish.replace(/[^0-9]/g, '');
                          const newData = { ...slideData, year: numericValue };
                          setSlideData(newData);
                          onUpdateRef.current?.(newData);
                        }}
                        onBlur={() => setIsEditingYear(false)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') setIsEditingYear(false);
                          if (e.key === 'Escape') setIsEditingYear(false);
                        }}
                        className="w-20 px-2 py-1 bg-white border-2 border-primary/40 rounded-lg text-secondary font-dubai text-lg font-bold text-center focus:outline-none focus:border-primary transition-colors"
                        autoFocus
                      />
                    ) : (
                      <span 
                        className={`font-dubai font-bold text-secondary text-lg ${isEditing ? 'cursor-pointer hover:text-primary transition-colors' : ''}`}
                        onClick={() => isEditing && setIsEditingYear(true)}
                      >
                        {year.split('').map(d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]).join('')}
                      </span>
                    )}
                  </div>
                  <p className="text-secondary/60 text-xs font-dubai">تغير نسبة الإشغال على مدار العام</p>
                </div>
              </div>
              {isEditing && !showEditOccupancyModal && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowEditOccupancyModal(true)}
                  className="px-3 py-1.5 bg-primary/20 border-2 border-primary/30 text-secondary rounded-lg flex items-center gap-1.5 text-xs font-dubai font-bold hover:bg-primary/30 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  تعديل البيانات
                </motion.button>
              )}
            </div>
          </div>

          {/* Chart Content or Edit Modal */}
          <div className="relative p-6">
            {/* الشارت - يظهر دائماً */}
            <div className="h-75 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={monthlyOccupancy}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <defs>
                    <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10302b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10302b" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: '#10302b', fontSize: 12, fontFamily: 'Dubai' }}
                    axisLine={{ stroke: '#10302b40' }}
                  />
                  <YAxis 
                    domain={[0, 100]}
                    tick={{ fill: '#10302b', fontSize: 12, fontFamily: 'Dubai', dx: -25 }}
                    axisLine={{ stroke: '#10302b40' }}
                    tickFormatter={(value) => `%${value}`}
                    width={45}
                    tickMargin={8}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'نسبة الإشغال']}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '2px solid #10302b',
                      borderRadius: '12px',
                      fontFamily: 'Dubai',
                      boxShadow: SHADOWS.card,
                    }}
                    labelStyle={{ fontFamily: 'Dubai', fontWeight: 'bold', color: '#10302b' }}
                  />
                  <Legend 
                    formatter={() => 'نسبة الإشغال'}
                    wrapperStyle={{ fontFamily: 'Dubai', color: '#10302b' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="occupancy"
                    stroke="#10302b"
                    strokeWidth={3}
                    fill="url(#occupancyGradient)"
                    dot={{ fill: '#10302b', strokeWidth: 2, r: 5, stroke: '#fff' }}
                    activeDot={{ r: 8, fill: '#edbf8c', stroke: '#10302b', strokeWidth: 2 }}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* نافذة التعديل - تظهر أسفل الشارت */}
            {showEditOccupancyModal && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 pt-6 border-t-2 border-primary/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-secondary font-dubai">تعديل نسب الإشغال الشهرية</h4>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowEditOccupancyModal(false)}
                      className="px-3 py-1.5 bg-primary/10 border-2 border-primary/20 text-secondary rounded-lg font-bold hover:bg-primary/20 transition-colors flex items-center gap-1.5 font-dubai text-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                      إلغاء
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowEditOccupancyModal(false)}
                      className="px-3 py-1.5 bg-linear-to-r from-secondary to-secondary/90 text-primary rounded-lg font-bold hover:shadow-lg transition-all flex items-center gap-1.5 font-dubai text-xs"
                      style={{ boxShadow: SHADOWS.button }}
                    >
                      <Save className="w-3.5 h-3.5" />
                      حفظ
                    </motion.button>
                  </div>
                </div>

                {/* Horizontal grid of months */}
                <div className="grid grid-cols-6 gap-3">
                  {monthlyOccupancy.map((item, index) => (
                    <div key={index} className="flex flex-col items-center gap-2 p-3 bg-accent/30 rounded-xl border border-primary/20">
                      <span className="font-dubai font-bold text-secondary text-sm">{item.month}</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          inputMode="numeric"
                          value={item.occupancy === 0 ? '' : item.occupancy}
                          onChange={e => {
                            const val = e.target.value;
                            if (val === '') {
                              handleUpdateMonthlyOccupancy(index, 0);
                            } else {
                              const num = parseInt(val.replace(/[^\d]/g, ''), 10);
                              if (!isNaN(num)) {
                                handleUpdateMonthlyOccupancy(index, Math.min(100, Math.max(0, num)));
                              }
                            }
                          }}
                          onFocus={e => e.target.select()}
                          placeholder="0"
                          className="w-12 px-2 py-1.5 bg-white border-2 border-primary/20 rounded-lg text-secondary font-dubai text-center text-sm focus:outline-none focus:border-primary transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="text-secondary/60 font-dubai text-sm">%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Grand Total Card - ملخص الدراسة */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-linear-to-r from-secondary/90 to-secondary p-6 sm:p-8 text-white"
          style={{ boxShadow: SHADOWS.modal }}
        >
          {/* Background Pattern */}
          <div className="absolute -top-10 -left-10 opacity-10 pointer-events-none">
            <Calculator className="w-40 h-40 text-white" strokeWidth={1.5} />
          </div>

          <div className="relative z-10">
            {/* العنوان والوصف */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <BarChart3 className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
              </div>
              <div>
                <h3 className="font-dubai font-bold text-xl sm:text-2xl">ملخص الدراسة</h3>
                <p className="text-white/70 text-sm font-dubai">
                  {isWithFieldVisit ? 'تكلفة تجهيز الشقة والعوائد والأرباح' : 'ملخص دراسة المنطقة'}
                </p>
              </div>
            </div>

            {/* المحتوى - يختلف حسب نوع الدراسة */}
            <div className="space-y-6">
              {/* الصف الأول: إحصائيات المنطقة - يظهر دائماً */}
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pb-6 border-b border-white/20">
                <div className="text-center min-w-[100px]">
                  <span className="block text-white/60 text-base font-dubai mb-2.5">متوسط سعر الليلة</span>
                  <span className="block font-bristone font-bold text-primary text-3xl sm:text-4xl">
                    {formatPrice(areaStats.averageDailyRate)}
                    <span className="text-lg text-white/60 font-dubai mr-1.5">{currencySymbol}</span>
                  </span>
                </div>
                <div className="w-px h-12 bg-white/20 hidden sm:block"></div>
                <div className="text-center min-w-[100px]">
                  <span className="block text-white/60 text-base font-dubai mb-2.5">متوسط نسبة الإشغال</span>
                  <span className="block font-dubai font-bold text-primary text-3xl sm:text-4xl">
                    {Math.round(areaStats.averageOccupancy).toLocaleString('ar-EG')}
                    <span className="text-lg text-white/60 font-dubai mr-1.5">%</span>
                  </span>
                </div>
                <div className="w-px h-12 bg-white/20 hidden sm:block"></div>
                <div className="text-center min-w-[100px]">
                  <span className="block text-white/60 text-base font-dubai mb-2.5">متوسط العوائد السنوية</span>
                  <span className="block font-bristone font-bold text-primary text-3xl sm:text-4xl">
                    {areaStats.averageAnnualRevenue > 0 ? formatPrice(areaStats.averageAnnualRevenue) : '—'}
                    {areaStats.averageAnnualRevenue > 0 && <span className="text-lg text-white/60 font-dubai mr-1.5">{currencySymbol}</span>}
                  </span>
                </div>
              </div>

              {/* الصف الثاني: التكاليف والمصاريف - فقط مع نزول ميداني */}
              {isWithFieldVisit && (
                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
                  <div className="text-center min-w-[120px]">
                    <span className="block text-white/60 text-base font-dubai mb-2.5">تكلفة تجهيز الشقة</span>
                    <span className="block font-bristone font-bold text-primary text-2xl sm:text-3xl">
                      {formatPrice(totalFromRooms)}
                    </span>
                  </div>
                  <div className="w-px h-12 bg-white/20 hidden sm:block"></div>
                  <div className="text-center min-w-[120px]">
                    <span className="block text-white/60 text-base font-dubai mb-2.5">المصاريف التشغيلية السنوية</span>
                    <span className="block font-bristone font-bold text-orange-400 text-2xl sm:text-3xl">
                      {formatPrice(annualOperationalCosts)}
                    </span>
                  </div>
                  <div className="w-px h-12 bg-white/20 hidden sm:block"></div>
                  <div className="text-center min-w-[120px]">
                    <span className="block text-white/60 text-base font-dubai mb-2.5">متوسط الربح السنوي</span>
                    <span className={`block font-bristone font-bold text-2xl sm:text-3xl ${annualProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {annualProfit !== 0 ? formatPrice(Math.abs(annualProfit)) : '—'}
                      {annualProfit < 0 && annualProfit !== 0 && <span className="text-base mr-1">-</span>}
                    </span>
                  </div>
                  <div className="w-px h-12 bg-white/20 hidden sm:block"></div>
                  <div className="text-center min-w-[120px]">
                    <span className="block text-white/60 text-base font-dubai mb-2.5">متوسط مدة الاسترداد</span>
                    <span className="block font-bristone font-bold text-blue-400 text-2xl sm:text-3xl">
                      {paybackPeriod > 0 ? `${paybackPeriod.toLocaleString('ar-EG')} شهر` : '—'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* قسم الملاحظات الإضافية */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white p-5 sm:p-6 border-2 border-primary/20"
          style={{ boxShadow: SHADOWS.card }}
        >
          {/* Background Decoration */}
          <div className="absolute -top-6 -left-6 opacity-[0.06] pointer-events-none">
            <FileText className="w-40 h-40 text-primary" strokeWidth={1.5} />
          </div>

          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <motion.div 
                className="p-3 rounded-xl bg-primary/20 border-2 border-primary/30"
                whileHover={{ scale: 1.05, rotate: 5 }}
                style={{ boxShadow: SHADOWS.icon }}
              >
                <FileText className="w-6 h-6 text-primary" strokeWidth={2} />
              </motion.div>
              <div className="flex-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={notesTitle}
                    onChange={(e) => setNotesTitle(e.target.value)}
                    onBlur={handleNotesTitleBlur}
                    className="text-xl sm:text-2xl font-bold text-secondary font-dubai bg-transparent border-b-2 border-transparent focus:border-primary/30 focus:outline-none transition-colors w-full"
                    placeholder="عنوان الملاحظات"
                  />
                ) : (
                  <h2 className="text-xl sm:text-2xl font-bold text-secondary font-dubai">
                    {notesTitle}
                  </h2>
                )}
              </div>
            </div>

            {/* شريط الأدوات */}
            {isEditing && (
              <div className="flex items-center gap-1 mb-4 pb-3 border-b border-primary/10 flex-wrap">
                <button
                  onMouseDown={(e) => { e.preventDefault(); applyFormat('bold'); }}
                  className="p-2 rounded-lg bg-white text-secondary/60 hover:text-secondary hover:bg-primary/10 border border-primary/20 transition-colors"
                  title="نص عريض (Ctrl+B)"
                >
                  <Bold className="w-4 h-4" />
                </button>
                <button
                  onMouseDown={(e) => { e.preventDefault(); applyFormat('italic'); }}
                  className="p-2 rounded-lg bg-white text-secondary/60 hover:text-secondary hover:bg-primary/10 border border-primary/20 transition-colors"
                  title="نص مائل (Ctrl+I)"
                >
                  <Italic className="w-4 h-4" />
                </button>
                <button
                  onMouseDown={(e) => { e.preventDefault(); applyFormat('underline'); }}
                  className="p-2 rounded-lg bg-white text-secondary/60 hover:text-secondary hover:bg-primary/10 border border-primary/20 transition-colors"
                  title="خط تحت النص (Ctrl+U)"
                >
                  <Underline className="w-4 h-4" />
                </button>
                
                <div className="w-px h-6 bg-primary/20 mx-1" />
                
                {/* تكبير الخط */}
                <button
                  onMouseDown={(e) => { e.preventDefault(); toggleFontSize(); }}
                  className="p-2 rounded-lg bg-white text-secondary/60 hover:text-secondary hover:bg-primary/10 border border-primary/20 transition-colors"
                  title="تكبير/تصغير الخط"
                >
                  <ALargeSmall className="w-4 h-4" />
                </button>
                
                {/* نقطة رأسية */}
                <button
                  onMouseDown={(e) => { e.preventDefault(); insertBullet(); }}
                  className="p-2 rounded-lg bg-white text-secondary/60 hover:text-secondary hover:bg-primary/10 border border-primary/20 transition-colors"
                  title="إضافة نقطة رأسية"
                >
                  <List className="w-4 h-4" />
                </button>
                
                <div className="w-px h-6 bg-primary/20 mx-1" />
                
                {/* أزرار الهايلايت */}
                {HIGHLIGHT_COLORS.map((hl) => (
                  <button
                    key={hl.id}
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); applyHighlight(hl); }}
                    className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                    style={{ 
                      backgroundColor: hl.color,
                      borderColor: hl.id === 'beige' ? '#d4ad82' : '#1a3a34'
                    }}
                    title={`تمييز ${hl.label}`}
                  />
                ))}
                <button
                  onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); removeHighlight(); }}
                  className="w-6 h-6 rounded-full border-2 border-red-400 bg-white text-red-400 text-sm font-bold flex items-center justify-center transition-transform hover:scale-110"
                  style={{ paddingTop: '2px' }}
                  title="إزالة التمييز"
                >
                  ✕
                </button>
              </div>
            )}

            {/* محرر النص */}
            {isEditing ? (
              <div
                ref={notesEditorRef}
                contentEditable
                onBlur={handleNotesContentBlur}
                onKeyDown={handleNotesKeyDown}
                onClick={handleNotesClick}
                className="w-full min-h-32 p-4 bg-accent/20 rounded-xl border-2 border-primary/10 focus:border-primary/30 focus:outline-none font-dubai text-secondary text-base leading-relaxed transition-colors"
                dir="rtl"
                style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'break-word' }}
                suppressContentEditableWarning
              />
            ) : (
              <div 
                className="font-dubai text-secondary text-base leading-relaxed w-full"
                dir="rtl"
                style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'break-word' }}
                dangerouslySetInnerHTML={{ __html: notesContent || '<p class="text-secondary/50">لا توجد ملاحظات</p>' }}
              />
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
