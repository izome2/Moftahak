'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  PieChart,
  Plus,
  X,
  Save,
  Edit2,
  Trash2
} from 'lucide-react';
import { StatisticsSlideData } from '@/types/feasibility';
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';
import CostChart from './CostChart';
import ComparisonChart from './ComparisonChart';

interface StatisticsSlideProps {
  data?: StatisticsSlideData;
  isEditing?: boolean;
  onUpdate?: (data: StatisticsSlideData) => void;
}

const defaultData: StatisticsSlideData = {
  totalCost: 0,
  averageRent: 0,
  roomsCost: [],
  comparisonData: [],
};

export default function StatisticsSlide({
  data = defaultData,
  isEditing = false,
  onUpdate,
}: StatisticsSlideProps) {
  const [slideData, setSlideData] = useState<StatisticsSlideData>(data);
  const [showAddCostModal, setShowAddCostModal] = useState(false);
  const [showAddComparisonModal, setShowAddComparisonModal] = useState(false);
  const [editingItem, setEditingItem] = useState<{ type: 'cost' | 'comparison'; index: number } | null>(null);
  const [formData, setFormData] = useState({ name: '', value: 0 });

  // حفظ مرجع لـ onUpdate لتجنب infinite loop
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  // تحديث البيانات عند التغيير
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (onUpdateRef.current) {
      onUpdateRef.current(slideData);
    }
  }, [slideData]);

  // إضافة/تعديل تكلفة غرفة
  const handleSaveCost = () => {
    if (!formData.name.trim()) return;

    if (editingItem?.type === 'cost') {
      setSlideData(prev => ({
        ...prev,
        roomsCost: prev.roomsCost.map((item, i) =>
          i === editingItem.index ? { name: formData.name, cost: formData.value } : item
        ),
        totalCost: prev.roomsCost.reduce((sum, item, i) =>
          sum + (i === editingItem.index ? formData.value : item.cost), 0
        ),
      }));
    } else {
      setSlideData(prev => ({
        ...prev,
        roomsCost: [...prev.roomsCost, { name: formData.name, cost: formData.value }],
        totalCost: prev.totalCost + formData.value,
      }));
    }

    setShowAddCostModal(false);
    setEditingItem(null);
    setFormData({ name: '', value: 0 });
  };

  // إضافة/تعديل بيانات مقارنة
  const handleSaveComparison = () => {
    if (!formData.name.trim()) return;

    if (editingItem?.type === 'comparison') {
      setSlideData(prev => ({
        ...prev,
        comparisonData: prev.comparisonData.map((item, i) =>
          i === editingItem.index ? { label: formData.name, value: formData.value } : item
        ),
      }));
    } else {
      setSlideData(prev => ({
        ...prev,
        comparisonData: [...prev.comparisonData, { label: formData.name, value: formData.value }],
      }));
    }

    setShowAddComparisonModal(false);
    setEditingItem(null);
    setFormData({ name: '', value: 0 });
  };

  // حذف تكلفة
  const handleDeleteCost = (index: number) => {
    setSlideData(prev => ({
      ...prev,
      roomsCost: prev.roomsCost.filter((_, i) => i !== index),
      totalCost: prev.roomsCost.reduce((sum, item, i) => i !== index ? sum + item.cost : sum, 0),
    }));
  };

  // حذف بيانات مقارنة
  const handleDeleteComparison = (index: number) => {
    setSlideData(prev => ({
      ...prev,
      comparisonData: prev.comparisonData.filter((_, i) => i !== index),
    }));
  };

  // تعديل متوسط الإيجار
  const handleUpdateAverageRent = (value: number) => {
    setSlideData(prev => ({ ...prev, averageRent: value }));
  };

  // حساب التكلفة الإجمالية من الغرف
  const totalFromRooms = slideData.roomsCost.reduce((sum, item) => sum + item.cost, 0);

  return (
    <div className="w-full h-full flex flex-col p-6 bg-linear-to-br from-accent/30 via-white/50 to-accent/20 overflow-auto">
      {/* العنوان */}
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="text-center mb-4"
      >
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-secondary to-secondary/80 flex items-center justify-center shadow-medium">
            <BarChart3 className="w-6 h-6 text-primary" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-secondary font-dubai">الإحصائيات والملخص</h2>
        <p className="text-secondary/60 text-xs mt-1">
          ملخص شامل للتكاليف ومقارنة الأسعار
        </p>
      </motion.div>

      {/* البطاقات الإحصائية */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4"
      >
        {/* إجمالي التكلفة */}
        <motion.div
          variants={fadeInUp}
          className="bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-soft border border-black/5"
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-secondary" />
            </div>
            <span className="text-xs text-secondary/70 font-dubai">إجمالي التكلفة</span>
          </div>
          <div className="text-lg font-bold text-secondary">
            {totalFromRooms.toLocaleString('ar-EG')} ج.م
          </div>
        </motion.div>

        {/* متوسط الإيجار */}
        <motion.div
          variants={fadeInUp}
          className="bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-soft border border-black/5"
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-xs text-secondary/70 font-dubai">متوسط الإيجار</span>
          </div>
          {isEditing ? (
            <input
              type="number"
              value={slideData.averageRent}
              onChange={e => handleUpdateAverageRent(Number(e.target.value))}
              className="text-lg font-bold text-green-600 bg-transparent border-b border-green-300 w-full focus:outline-none"
            />
          ) : (
            <div className="text-lg font-bold text-green-600">
              {slideData.averageRent.toLocaleString('ar-EG')} ج.م
            </div>
          )}
        </motion.div>

        {/* العائد المتوقع */}
        <motion.div
          variants={fadeInUp}
          className="bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-soft border border-black/5"
        >
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <PieChart className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-xs text-secondary/70 font-dubai">فترة الاسترداد</span>
          </div>
          <div className="text-lg font-bold text-blue-600">
            {slideData.averageRent > 0 
              ? Math.ceil(totalFromRooms / slideData.averageRent)
              : '—'
            } شهر
          </div>
        </motion.div>
      </motion.div>

      {/* الرسوم البيانية */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
        {/* رسم توزيع التكاليف */}
        <div>
          {isEditing && (
            <div className="flex justify-end mb-2">
              <button
                onClick={() => {
                  setFormData({ name: '', value: 0 });
                  setEditingItem(null);
                  setShowAddCostModal(true);
                }}
                className="px-3 py-1.5 bg-secondary/10 text-secondary text-xs rounded-lg hover:bg-secondary/20 transition-colors flex items-center gap-1 font-dubai"
              >
                <Plus className="w-3 h-3" />
                إضافة تكلفة
              </button>
            </div>
          )}
          
          {slideData.roomsCost.length > 0 ? (
            <CostChart data={slideData.roomsCost} />
          ) : (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-soft border border-black/5 h-full flex flex-col items-center justify-center">
              <PieChart className="w-12 h-12 text-secondary/30 mb-2" />
              <p className="text-sm text-secondary/50 font-dubai text-center">
                {isEditing ? 'انقر على "إضافة تكلفة" لإضافة بيانات' : 'لا توجد بيانات تكاليف'}
              </p>
            </div>
          )}

          {/* قائمة التكاليف للتحرير */}
          {isEditing && slideData.roomsCost.length > 0 && (
            <div className="mt-2 space-y-1">
              {slideData.roomsCost.map((item, index) => (
                <div key={index} className="flex items-center justify-between bg-white/60 rounded-lg px-2 py-1 text-xs">
                  <span className="text-secondary font-dubai">{item.name}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-secondary/70">{item.cost.toLocaleString('ar-EG')} ج.م</span>
                    <button
                      onClick={() => {
                        setFormData({ name: item.name, value: item.cost });
                        setEditingItem({ type: 'cost', index });
                        setShowAddCostModal(true);
                      }}
                      className="p-1 hover:bg-secondary/10 rounded"
                    >
                      <Edit2 className="w-3 h-3 text-secondary" />
                    </button>
                    <button
                      onClick={() => handleDeleteCost(index)}
                      className="p-1 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* رسم مقارنة الأسعار */}
        <div>
          {isEditing && (
            <div className="flex justify-end mb-2">
              <button
                onClick={() => {
                  setFormData({ name: '', value: 0 });
                  setEditingItem(null);
                  setShowAddComparisonModal(true);
                }}
                className="px-3 py-1.5 bg-secondary/10 text-secondary text-xs rounded-lg hover:bg-secondary/20 transition-colors flex items-center gap-1 font-dubai"
              >
                <Plus className="w-3 h-3" />
                إضافة للمقارنة
              </button>
            </div>
          )}
          
          {slideData.comparisonData.length > 0 ? (
            <ComparisonChart data={slideData.comparisonData} />
          ) : (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-soft border border-black/5 h-full flex flex-col items-center justify-center">
              <BarChart3 className="w-12 h-12 text-secondary/30 mb-2" />
              <p className="text-sm text-secondary/50 font-dubai text-center">
                {isEditing ? 'انقر على "إضافة للمقارنة" لإضافة بيانات' : 'لا توجد بيانات مقارنة'}
              </p>
            </div>
          )}

          {/* قائمة المقارنات للتحرير */}
          {isEditing && slideData.comparisonData.length > 0 && (
            <div className="mt-2 space-y-1">
              {slideData.comparisonData.map((item, index) => (
                <div key={index} className="flex items-center justify-between bg-white/60 rounded-lg px-2 py-1 text-xs">
                  <span className="text-secondary font-dubai">{item.label}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-secondary/70">{item.value.toLocaleString('ar-EG')} ج.م</span>
                    <button
                      onClick={() => {
                        setFormData({ name: item.label, value: item.value });
                        setEditingItem({ type: 'comparison', index });
                        setShowAddComparisonModal(true);
                      }}
                      className="p-1 hover:bg-secondary/10 rounded"
                    >
                      <Edit2 className="w-3 h-3 text-secondary" />
                    </button>
                    <button
                      onClick={() => handleDeleteComparison(index)}
                      className="p-1 hover:bg-red-100 rounded"
                    >
                      <Trash2 className="w-3 h-3 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal إضافة تكلفة */}
      {showAddCostModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowAddCostModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-5"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-secondary font-dubai">
                {editingItem ? 'تعديل التكلفة' : 'إضافة تكلفة جديدة'}
              </h3>
              <button
                onClick={() => setShowAddCostModal(false)}
                className="w-7 h-7 rounded-lg bg-secondary/10 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-secondary" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-secondary mb-1 font-dubai">
                  اسم الغرفة/البند
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-accent/30 border border-secondary/10 rounded-xl text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="مثال: المطبخ"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-secondary mb-1 font-dubai">
                  التكلفة (ج.م)
                </label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={e => setFormData(prev => ({ ...prev, value: Number(e.target.value) }))}
                  className="w-full px-3 py-2 bg-accent/30 border border-secondary/10 rounded-xl text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <button
                onClick={handleSaveCost}
                disabled={!formData.name.trim()}
                className="w-full px-4 py-2 bg-linear-to-r from-secondary to-secondary/90 text-primary rounded-xl text-sm font-medium hover:shadow-glow transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-dubai"
              >
                <Save className="w-4 h-4" />
                حفظ
              </button>
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
            className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-5"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-secondary font-dubai">
                {editingItem ? 'تعديل بيانات المقارنة' : 'إضافة للمقارنة'}
              </h3>
              <button
                onClick={() => setShowAddComparisonModal(false)}
                className="w-7 h-7 rounded-lg bg-secondary/10 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-secondary" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-secondary mb-1 font-dubai">
                  الوصف
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-accent/30 border border-secondary/10 rounded-xl text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="مثال: شقتك"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-secondary mb-1 font-dubai">
                  القيمة (ج.م)
                </label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={e => setFormData(prev => ({ ...prev, value: Number(e.target.value) }))}
                  className="w-full px-3 py-2 bg-accent/30 border border-secondary/10 rounded-xl text-sm text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <button
                onClick={handleSaveComparison}
                disabled={!formData.name.trim()}
                className="w-full px-4 py-2 bg-linear-to-r from-secondary to-secondary/90 text-primary rounded-xl text-sm font-medium hover:shadow-glow transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-dubai"
              >
                <Save className="w-4 h-4" />
                حفظ
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
