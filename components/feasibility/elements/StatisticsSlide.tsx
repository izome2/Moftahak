'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  Building2,
  Calculator
} from 'lucide-react';
import { StatisticsSlideData } from '@/types/feasibility';
import CostChart from './CostChart';
import ComparisonChart from './ComparisonChart';
import { useFeasibilityEditorSafe } from '@/contexts/FeasibilityEditorContext';

// الظلال المتناسقة
const SHADOWS = {
  card: '0 4px 20px rgba(16, 48, 43, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
  cardHover: '0 12px 40px rgba(16, 48, 43, 0.15), 0 4px 12px rgba(237, 191, 140, 0.1)',
  icon: '0 4px 12px rgba(237, 191, 140, 0.3)',
  button: '0 4px 16px rgba(237, 191, 140, 0.4)',
  modal: '0 25px 60px rgba(16, 48, 43, 0.25)',
};

interface StatisticsSlideProps {
  data?: StatisticsSlideData;
  isEditing?: boolean;
  onUpdate?: (data: StatisticsSlideData) => void;
  studyType?: 'WITH_FIELD_VISIT' | 'WITHOUT_FIELD_VISIT';
}

const defaultData: StatisticsSlideData = {
  totalCost: 0,
  averageRent: 0,
  roomsCost: [],
  comparisonData: [],
};

// تنسيق السعر
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ar-EG').format(price);
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
  
  const [slideData, setSlideData] = useState<StatisticsSlideData>(data);
  const [showAddCostModal, setShowAddCostModal] = useState(false);
  const [showAddComparisonModal, setShowAddComparisonModal] = useState(false);
  const [editingItem, setEditingItem] = useState<{ type: 'cost' | 'comparison'; index: number } | null>(null);
  const [formData, setFormData] = useState({ name: '', value: 0 });

  // تحديث البيانات من الخارج
  useEffect(() => {
    setSlideData(data);
  }, [data]);

  // حفظ مرجع لـ onUpdate لتجنب infinite loop
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  // إضافة/تعديل تكلفة غرفة
  const handleSaveCost = () => {
    if (!formData.name.trim()) return;

    let newData: StatisticsSlideData;
    if (editingItem?.type === 'cost') {
      newData = {
        ...slideData,
        roomsCost: slideData.roomsCost.map((item, i) =>
          i === editingItem.index ? { name: formData.name, cost: formData.value } : item
        ),
      };
    } else {
      newData = {
        ...slideData,
        roomsCost: [...slideData.roomsCost, { name: formData.name, cost: formData.value }],
      };
    }
    
    newData.totalCost = newData.roomsCost.reduce((sum, item) => sum + item.cost, 0);
    setSlideData(newData);
    if (onUpdateRef.current) onUpdateRef.current(newData);

    setShowAddCostModal(false);
    setEditingItem(null);
    setFormData({ name: '', value: 0 });
  };

  // إضافة/تعديل بيانات مقارنة
  const handleSaveComparison = () => {
    if (!formData.name.trim()) return;

    let newData: StatisticsSlideData;
    if (editingItem?.type === 'comparison') {
      newData = {
        ...slideData,
        comparisonData: slideData.comparisonData.map((item, i) =>
          i === editingItem.index ? { label: formData.name, value: formData.value } : item
        ),
      };
    } else {
      newData = {
        ...slideData,
        comparisonData: [...slideData.comparisonData, { label: formData.name, value: formData.value }],
      };
    }
    
    setSlideData(newData);
    if (onUpdateRef.current) onUpdateRef.current(newData);

    setShowAddComparisonModal(false);
    setEditingItem(null);
    setFormData({ name: '', value: 0 });
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

  // حذف بيانات مقارنة
  const handleDeleteComparison = (index: number) => {
    const newData = {
      ...slideData,
      comparisonData: slideData.comparisonData.filter((_, i) => i !== index),
    };
    setSlideData(newData);
    if (onUpdateRef.current) onUpdateRef.current(newData);
  };

  // تعديل متوسط الإيجار
  const handleUpdateAverageRent = (value: number) => {
    const newData = { ...slideData, averageRent: value };
    setSlideData(newData);
    if (onUpdateRef.current) onUpdateRef.current(newData);
  };

  // حساب التكلفة الإجمالية من الغرف
  const totalFromRooms = slideData.roomsCost.reduce((sum, item) => sum + item.cost, 0);
  
  // حساب فترة الاسترداد
  const paybackPeriod = slideData.averageRent > 0 
    ? Math.ceil(totalFromRooms / slideData.averageRent)
    : 0;

  return (
    <div className="min-h-full p-6 md:p-8 bg-linear-to-br from-accent/30 via-white to-accent/20 pb-24">
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
                <h2 className="text-2xl sm:text-3xl font-bold text-secondary font-dubai">
                  الإحصائيات والملخص
                </h2>
                <p className="text-secondary/60 font-dubai text-sm">
                  {isWithFieldVisit ? 'ملخص شامل للتكاليف ومقارنة الأسعار' : 'مقارنة الأسعار في المنطقة'}
                </p>
              </div>
            </div>

            {/* Total Summary Badge - فقط مع نزول ميداني */}
            {isWithFieldVisit && (
              <div className="text-center px-6 py-3 bg-primary/20 rounded-2xl border-2 border-primary/30">
                <span className="block text-xs text-secondary/60 font-dubai mb-1">إجمالي التكلفة</span>
                <span className="block text-2xl font-bold text-primary font-bristone">{formatPrice(totalFromRooms)}</span>
                <span className="text-xs text-secondary/60 font-dubai">ج.م</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Statistics Cards - فقط مع نزول ميداني */}
        {isWithFieldVisit && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* إجمالي التكلفة */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="relative rounded-2xl overflow-hidden bg-white p-5 border-2 border-primary/20"
            style={{ boxShadow: SHADOWS.card }}
            whileHover={{ scale: 1.02, boxShadow: SHADOWS.cardHover }}
          >
            <div className="absolute -top-4 -left-4 opacity-[0.08] pointer-events-none">
              <DollarSign className="w-24 h-24 text-primary" strokeWidth={1.5} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-primary/20 border-2 border-primary/30" style={{ boxShadow: SHADOWS.icon }}>
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm text-secondary/70 font-dubai">إجمالي التكلفة</span>
              </div>
              <div className="text-2xl font-bold text-secondary font-bristone">
                {formatPrice(totalFromRooms)}
                <span className="text-sm font-normal text-secondary/60 font-dubai mr-2">ج.م</span>
              </div>
            </div>
          </motion.div>

          {/* متوسط الإيجار */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative rounded-2xl overflow-hidden bg-white p-5 border-2 border-primary/20"
            style={{ boxShadow: SHADOWS.card }}
            whileHover={{ scale: 1.02, boxShadow: SHADOWS.cardHover }}
          >
            <div className="absolute -top-4 -left-4 opacity-[0.08] pointer-events-none">
              <TrendingUp className="w-24 h-24 text-primary" strokeWidth={1.5} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-green-500/20 border-2 border-green-500/30" style={{ boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)' }}>
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm text-secondary/70 font-dubai">متوسط الإيجار</span>
              </div>
              {isEditing ? (
                <input
                  type="number"
                  value={slideData.averageRent}
                  onChange={e => handleUpdateAverageRent(Number(e.target.value))}
                  className="text-2xl font-bold text-green-600 font-bristone bg-transparent border-none outline-none w-full"
                />
              ) : (
                <div className="text-2xl font-bold text-green-600 font-bristone">
                  {formatPrice(slideData.averageRent)}
                  <span className="text-sm font-normal text-secondary/60 font-dubai mr-2">ج.م/شهر</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* فترة الاسترداد */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="relative rounded-2xl overflow-hidden bg-white p-5 border-2 border-primary/20"
            style={{ boxShadow: SHADOWS.card }}
            whileHover={{ scale: 1.02, boxShadow: SHADOWS.cardHover }}
          >
            <div className="absolute -top-4 -left-4 opacity-[0.08] pointer-events-none">
              <Calendar className="w-24 h-24 text-primary" strokeWidth={1.5} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-blue-500/20 border-2 border-blue-500/30" style={{ boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}>
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm text-secondary/70 font-dubai">فترة الاسترداد</span>
              </div>
              <div className="text-2xl font-bold text-blue-600 font-bristone">
                {paybackPeriod > 0 ? paybackPeriod : '—'}
                <span className="text-sm font-normal text-secondary/60 font-dubai mr-2">شهر</span>
              </div>
            </div>
          </motion.div>
        </div>
        )}

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
                  onClick={() => {
                    setFormData({ name: '', value: 0 });
                    setEditingItem(null);
                    setShowAddCostModal(true);
                  }}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Chart */}
                <div className="min-h-[250px] bg-transparent">
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
                          <h4 className="font-dubai font-bold text-secondary text-base truncate">
                            {item.name}
                          </h4>
                        </div>

                        {/* Price & Actions */}
                        <div className="flex items-center gap-2">
                          <div className="text-left">
                            <motion.span 
                              className="font-dubai font-bold text-primary text-lg block"
                              key={item.cost}
                              initial={{ scale: 1.2 }}
                              animate={{ scale: 1 }}
                            >
                              {formatPrice(item.cost)}
                            </motion.span>
                            <span className="text-xs text-secondary/60 font-dubai">ج.م</span>
                          </div>
                          
                          {isEditing && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  setFormData({ name: item.name, value: item.cost });
                                  setEditingItem({ type: 'cost', index });
                                  setShowAddCostModal(true);
                                }}
                                className="p-1.5 hover:bg-primary/20 rounded-lg transition-colors"
                              >
                                <Edit2 className="w-4 h-4 text-secondary" />
                              </button>
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

        {/* Comparison Section */}
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
                  <Building2 className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="font-dubai font-bold text-secondary text-lg">مقارنة أسعار الشقق</h3>
                  <p className="text-secondary/60 text-xs font-dubai">{slideData.comparisonData.length} شقة</p>
                </div>
              </div>
              {isEditing && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setFormData({ name: '', value: 0 });
                    setEditingItem(null);
                    setShowAddComparisonModal(true);
                  }}
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
            {slideData.comparisonData.length === 0 ? (
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
                    <BarChart3 className="w-10 h-10 text-primary" strokeWidth={1.5} />
                  </div>
                </motion.div>
                
                <h4 className="font-dubai font-bold text-secondary text-lg mb-1">
                  لا توجد بيانات مقارنة
                </h4>
                <p className="font-dubai text-secondary/50 text-sm max-w-sm">
                  {isEditing ? 'انقر على "إضافة" لإضافة بيانات المقارنة' : 'سيتم تحديث البيانات تلقائياً من الشقق المحيطة'}
                </p>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Chart */}
                <div className="min-h-[250px] bg-transparent">
                  <ComparisonChart data={slideData.comparisonData} />
                </div>

                {/* List */}
                <div className="space-y-2">
                  {slideData.comparisonData.map((item, index) => (
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
                        {/* Icon */}
                        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center shrink-0 border-2 border-primary/30">
                          <Building2 className="w-5 h-5 text-primary" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-dubai font-bold text-secondary text-base truncate">
                            {item.label}
                          </h4>
                        </div>

                        {/* Price & Actions */}
                        <div className="flex items-center gap-2">
                          <div className="text-left">
                            <motion.span 
                              className="font-dubai font-bold text-primary text-lg block"
                              key={item.value}
                              initial={{ scale: 1.2 }}
                              animate={{ scale: 1 }}
                            >
                              {formatPrice(item.value)}
                            </motion.span>
                            <span className="text-xs text-secondary/60 font-dubai">ج.م/ليلة</span>
                          </div>
                          
                          {isEditing && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {
                                  setFormData({ name: item.label, value: item.value });
                                  setEditingItem({ type: 'comparison', index });
                                  setShowAddComparisonModal(true);
                                }}
                                className="p-1.5 hover:bg-primary/20 rounded-lg transition-colors"
                              >
                                <Edit2 className="w-4 h-4 text-secondary" />
                              </button>
                              <button
                                onClick={() => handleDeleteComparison(index)}
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

        {/* Grand Total Card - فقط مع نزول ميداني */}
        {isWithFieldVisit && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-linear-to-r from-secondary to-secondary/90 p-6 sm:p-8 text-white"
          style={{ boxShadow: SHADOWS.modal }}
        >
          {/* Background Pattern */}
          <div className="absolute -top-10 -left-10 opacity-10 pointer-events-none">
            <Calculator className="w-40 h-40 text-white" strokeWidth={1.5} />
          </div>

          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <BarChart3 className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-dubai font-bold text-2xl">ملخص الدراسة</h3>
                  <p className="text-white/70 text-sm font-dubai">التكلفة ومتوسط العائد</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6 text-center">
                <div>
                  <span className="block text-white/60 text-xs font-dubai mb-1">التكلفة</span>
                  <span className="block font-bristone font-bold text-primary text-2xl">
                    {formatPrice(totalFromRooms)}
                  </span>
                </div>
                <div className="w-px h-12 bg-white/20"></div>
                <div>
                  <span className="block text-white/60 text-xs font-dubai mb-1">الإيجار</span>
                  <span className="block font-bristone font-bold text-green-400 text-2xl">
                    {formatPrice(slideData.averageRent)}
                  </span>
                </div>
                <div className="w-px h-12 bg-white/20"></div>
                <div>
                  <span className="block text-white/60 text-xs font-dubai mb-1">الاسترداد</span>
                  <span className="block font-bristone font-bold text-blue-400 text-2xl">
                    {paybackPeriod > 0 ? `${paybackPeriod} شهر` : '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        )}
      </motion.div>

      {/* Modal إضافة تكلفة */}
      {showAddCostModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowAddCostModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl max-w-sm w-full p-6 border-2 border-primary/20"
            style={{ boxShadow: SHADOWS.modal }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/20 border-2 border-primary/30">
                  <PieChart className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-secondary font-dubai">
                  {editingItem ? 'تعديل التكلفة' : 'إضافة تكلفة جديدة'}
                </h3>
              </div>
              <button
                onClick={() => setShowAddCostModal(false)}
                className="w-8 h-8 rounded-xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center hover:bg-primary/20 transition-colors"
              >
                <X className="w-4 h-4 text-secondary" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-secondary mb-2 font-dubai">
                  اسم البند
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 bg-accent/30 border-2 border-primary/20 rounded-xl text-secondary font-dubai focus:outline-none focus:border-primary transition-colors"
                  placeholder="مثال: المطبخ"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-secondary mb-2 font-dubai">
                  التكلفة (ج.م)
                </label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={e => setFormData(prev => ({ ...prev, value: Number(e.target.value) }))}
                  className="w-full px-4 py-3 bg-accent/30 border-2 border-primary/20 rounded-xl text-secondary font-dubai focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveCost}
                disabled={!formData.name.trim()}
                className="w-full px-4 py-3 bg-linear-to-r from-secondary to-secondary/90 text-primary rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-dubai"
                style={{ boxShadow: SHADOWS.button }}
              >
                <Save className="w-5 h-5" />
                حفظ
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal إضافة مقارنة */}
      {showAddComparisonModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowAddComparisonModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl max-w-sm w-full p-6 border-2 border-primary/20"
            style={{ boxShadow: SHADOWS.modal }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/20 border-2 border-primary/30">
                  <Building2 className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-secondary font-dubai">
                  {editingItem ? 'تعديل بيانات المقارنة' : 'إضافة للمقارنة'}
                </h3>
              </div>
              <button
                onClick={() => setShowAddComparisonModal(false)}
                className="w-8 h-8 rounded-xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center hover:bg-primary/20 transition-colors"
              >
                <X className="w-4 h-4 text-secondary" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-secondary mb-2 font-dubai">
                  اسم الشقة
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 bg-accent/30 border-2 border-primary/20 rounded-xl text-secondary font-dubai focus:outline-none focus:border-primary transition-colors"
                  placeholder="مثال: شقة المعادي"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-secondary mb-2 font-dubai">
                  السعر (ج.م/ليلة)
                </label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={e => setFormData(prev => ({ ...prev, value: Number(e.target.value) }))}
                  className="w-full px-4 py-3 bg-accent/30 border-2 border-primary/20 rounded-xl text-secondary font-dubai focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveComparison}
                disabled={!formData.name.trim()}
                className="w-full px-4 py-3 bg-linear-to-r from-secondary to-secondary/90 text-primary rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-dubai"
                style={{ boxShadow: SHADOWS.button }}
              >
                <Save className="w-5 h-5" />
                حفظ
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
