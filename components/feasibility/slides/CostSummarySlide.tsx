'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  Calculator,
  TrendingUp,
  Home,
  ChefHat,
  Bed,
  Sofa,
  Bath,
  Percent,
  Edit3,
  Sparkles,
  Plus,
  X
} from 'lucide-react';
import type { SlideData, CostSummarySlideData, RoomData } from '@/types/feasibility';

interface CostSummarySlideProps {
  data: CostSummarySlideData;
  isEditing?: boolean;
  onUpdate?: (data: Partial<SlideData>) => void;
}

// الظلال المتناسقة
const SHADOWS = {
  card: '0 4px 20px rgba(16, 48, 43, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
  cardHover: '0 12px 40px rgba(16, 48, 43, 0.15), 0 4px 12px rgba(237, 191, 140, 0.1)',
  icon: '0 4px 12px rgba(237, 191, 140, 0.3)',
  button: '0 4px 16px rgba(237, 191, 140, 0.4)',
  modal: '0 25px 60px rgba(16, 48, 43, 0.25)',
};

// أيقونات أنواع الغرف
const roomIcons: Record<string, React.ElementType> = {
  kitchen: ChefHat,
  bedroom: Bed,
  'living-room': Sofa,
  bathroom: Bath,
};

// ألوان أنواع الغرف
const roomColors: Record<string, string> = {
  kitchen: 'bg-primary/20 text-primary border-primary/30',
  bedroom: 'bg-primary/20 text-primary border-primary/30',
  'living-room': 'bg-primary/20 text-primary border-primary/30',
  bathroom: 'bg-primary/20 text-primary border-primary/30',
};

const CostSummarySlide: React.FC<CostSummarySlideProps> = ({
  data,
  isEditing = false,
  onUpdate,
}) => {
  const { rooms = [], additionalCosts = [], discount = 0 } = data;

  // حساب إجمالي تكلفة الغرف
  const roomsTotalCost = rooms.reduce((sum, room) => sum + (room.totalCost || 0), 0);
  
  // حساب إجمالي التكاليف الإضافية
  const additionalTotalCost = additionalCosts.reduce((sum, cost) => sum + cost.amount, 0);
  
  // حساب الإجمالي قبل الخصم
  const subtotal = roomsTotalCost + additionalTotalCost;
  
  // حساب قيمة الخصم
  const discountAmount = (subtotal * discount) / 100;
  
  // حساب الإجمالي النهائي
  const grandTotal = subtotal - discountAmount;

  // تنسيق السعر
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG').format(price);
  };

  // تحديث الخصم
  const handleDiscountChange = (newDiscount: number) => {
    if (onUpdate) {
      onUpdate({
        costSummary: {
          ...data,
          discount: Math.max(0, Math.min(100, newDiscount)),
        },
      });
    }
  };

  // تحديث تكلفة إضافية
  const handleAdditionalCostChange = (index: number, field: 'name' | 'amount', value: string | number) => {
    if (onUpdate) {
      const newCosts = [...additionalCosts];
      if (field === 'name') {
        newCosts[index] = { ...newCosts[index], name: value as string };
      } else {
        newCosts[index] = { ...newCosts[index], amount: Number(value) || 0 };
      }
      onUpdate({
        costSummary: {
          ...data,
          additionalCosts: newCosts,
        },
      });
    }
  };

  // إضافة تكلفة إضافية جديدة
  const handleAddAdditionalCost = () => {
    if (onUpdate) {
      onUpdate({
        costSummary: {
          ...data,
          additionalCosts: [...additionalCosts, { name: 'تكلفة جديدة', amount: 0 }],
        },
      });
    }
  };

  // حذف تكلفة إضافية
  const handleRemoveAdditionalCost = (index: number) => {
    if (onUpdate) {
      const newCosts = additionalCosts.filter((_, i) => i !== index);
      onUpdate({
        costSummary: {
          ...data,
          additionalCosts: newCosts,
        },
      });
    }
  };

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
            <Calculator className="w-56 h-56 text-primary" strokeWidth={1.5} />
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.div 
                className="p-4 rounded-2xl bg-primary/20 border-2 border-primary/30"
                whileHover={{ scale: 1.05, rotate: 5 }}
                style={{ boxShadow: SHADOWS.icon }}
              >
                <Calculator className="w-8 h-8 text-primary" strokeWidth={2} />
              </motion.div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-secondary font-dubai">
                  ملخص التكاليف
                </h2>
                <p className="text-secondary/60 font-dubai text-sm">
                  إجمالي تكاليف تجهيز الشقة
                </p>
              </div>
            </div>

            {/* Total Summary Badge */}
            <div className="text-center px-6 py-3 bg-primary/20 rounded-2xl border-2 border-primary/30">
              <span className="block text-xs text-secondary/60 font-dubai mb-1">الإجمالي</span>
              <span className="block text-2xl font-bold text-primary font-bristone">{formatPrice(grandTotal)}</span>
              <span className="text-xs text-secondary/60 font-dubai">ج.م</span>
            </div>
          </div>
        </motion.div>

        {/* Rooms List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white border-2 border-primary/20"
          style={{ boxShadow: SHADOWS.card }}
        >
          {/* Section Header */}
          <div className="bg-linear-to-r from-primary/20 to-primary/10 px-6 py-4 border-b-2 border-primary/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/30 border border-primary/40">
                <Home className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <h3 className="font-dubai font-bold text-secondary text-lg">تكاليف الغرف</h3>
                <p className="text-secondary/60 text-xs font-dubai">{rooms.length} غرفة</p>
              </div>
            </div>
          </div>

          {/* Rooms Content */}
          <div className="p-6">
            {rooms.length === 0 ? (
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
                    <Home className="w-10 h-10 text-primary" strokeWidth={1.5} />
                  </div>
                </motion.div>
                
                <h4 className="font-dubai font-bold text-secondary text-lg mb-1">
                  لم يتم إضافة غرف بعد
                </h4>
                <p className="font-dubai text-secondary/50 text-sm max-w-sm">
                  أضف الغرف من الشرائح السابقة لحساب التكاليف
                </p>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {rooms.map((room, index) => {
                  const Icon = roomIcons[room.type] || Home;
                  const colorClass = roomColors[room.type] || 'bg-primary/20 text-primary border-primary/30';
                  
                  return (
                    <motion.div
                      key={room.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="relative rounded-xl bg-accent/30 p-4 border-2 border-primary/20 group"
                      style={{ boxShadow: 'rgba(237, 191, 140, 0.2) 0px 2px 8px' }}
                    >
                      {/* Background Icon */}
                      <div className="absolute -top-2 -left-2 opacity-[0.08] pointer-events-none">
                        <Icon className="w-24 h-24 text-primary" strokeWidth={1.5} />
                      </div>

                      <div className="relative z-10 flex items-center gap-4">
                        {/* Number Badge */}
                        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center shrink-0 border-2 border-primary/30">
                          <span className="font-bristone font-bold text-secondary">{index + 1}</span>
                        </div>

                        {/* Icon */}
                        <div className={`p-2.5 rounded-xl flex items-center justify-center shrink-0 border-2 ${colorClass}`}>
                          <Icon className="w-5 h-5" strokeWidth={2} />
                        </div>

                        {/* Room Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-dubai font-bold text-secondary text-base truncate">
                            {room.name}
                          </h4>
                          <p className="text-xs text-secondary/60 font-dubai">
                            {room.items?.length || 0} عنصر
                          </p>
                        </div>

                        {/* Price */}
                        <div className="text-left">
                          <motion.span 
                            className="font-dubai font-bold text-primary text-xl block"
                            key={room.totalCost}
                            initial={{ scale: 1.2 }}
                            animate={{ scale: 1 }}
                          >
                            {formatPrice(room.totalCost || 0)}
                          </motion.span>
                          <span className="text-xs text-secondary/60 font-dubai">ج.م</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {/* Rooms Total */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: rooms.length * 0.05 + 0.1 }}
                  className="mt-4 pt-4 border-t-2 border-primary/30"
                >
                  <div className="flex items-center justify-between px-4 py-3 bg-primary/10 rounded-xl border-2 border-primary/20">
                    <span className="font-dubai font-bold text-secondary text-lg">
                      إجمالي تكلفة الغرف
                    </span>
                    <div className="text-left">
                      <span className="font-bristone font-bold text-primary text-2xl">
                        {formatPrice(roomsTotalCost)}
                      </span>
                      <span className="text-sm text-secondary/60 font-dubai mr-2">ج.م</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Additional Costs */}
        {(additionalCosts.length > 0 || isEditing) && (
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
                    <TrendingUp className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-dubai font-bold text-secondary text-lg">تكاليف إضافية</h3>
                    <p className="text-secondary/60 text-xs font-dubai">نفقات أخرى</p>
                  </div>
                </div>
                {isEditing && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddAdditionalCost}
                    className="px-3 py-1.5 bg-primary/20 border-2 border-primary/30 text-secondary rounded-lg flex items-center gap-1.5 text-xs font-dubai font-bold hover:bg-primary/30 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    إضافة
                  </motion.button>
                )}
              </div>
            </div>

            {/* Additional Costs Content */}
            <div className="p-6">
              <div className="space-y-3">
                {additionalCosts.map((cost, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="relative rounded-xl bg-accent/30 p-4 border-2 border-primary/20 group"
                    style={{ boxShadow: 'rgba(237, 191, 140, 0.2) 0px 2px 8px' }}
                  >
                    {/* Background Icon */}
                    <div className="absolute -top-2 -left-2 opacity-[0.08] pointer-events-none">
                      <Sparkles className="w-24 h-24 text-primary" strokeWidth={1.5} />
                    </div>

                    <div className="relative z-10 flex items-center gap-4">
                      {/* Icon */}
                      <div className="p-2.5 rounded-xl flex items-center justify-center shrink-0 border-2 bg-primary/20 text-primary border-primary/30">
                        <Sparkles className="w-5 h-5" strokeWidth={2} />
                      </div>

                      {/* Cost Info */}
                      <div className="flex-1 min-w-0">
                        {isEditing ? (
                          <input
                            type="text"
                            value={cost.name}
                            onChange={(e) => handleAdditionalCostChange(index, 'name', e.target.value)}
                            className="w-full px-3 py-2 border-2 border-primary/20 bg-white rounded-lg text-secondary font-dubai focus:border-primary focus:outline-none"
                            placeholder="اسم التكلفة"
                          />
                        ) : (
                          <h4 className="font-dubai font-bold text-secondary text-base">
                            {cost.name}
                          </h4>
                        )}
                      </div>

                      {/* Price */}
                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <>
                            <input
                              type="number"
                              value={cost.amount}
                              onChange={(e) => handleAdditionalCostChange(index, 'amount', e.target.value)}
                              className="w-28 px-3 py-2 border-2 border-primary/20 bg-white rounded-lg text-secondary font-dubai text-left focus:border-primary focus:outline-none"
                              min="0"
                              placeholder="0"
                            />
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleRemoveAdditionalCost(index)}
                              className="w-8 h-8 bg-white border-2 border-primary/30 text-secondary rounded-lg flex items-center justify-center hover:opacity-80"
                              style={{ boxShadow: 'rgba(237, 191, 140, 0.3) 0px 2px 8px' }}
                            >
                              <X size={14} />
                            </motion.button>
                          </>
                        ) : (
                          <div className="text-left">
                            <span className="font-dubai font-bold text-primary text-xl block">
                              {formatPrice(cost.amount)}
                            </span>
                            <span className="text-xs text-secondary/60 font-dubai">ج.م</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Additional Total */}
                {additionalCosts.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: additionalCosts.length * 0.05 + 0.1 }}
                    className="mt-4 pt-4 border-t-2 border-primary/30"
                  >
                    <div className="flex items-center justify-between px-4 py-3 bg-primary/10 rounded-xl border-2 border-primary/20">
                      <span className="font-dubai font-bold text-secondary text-base">
                        إجمالي التكاليف الإضافية
                      </span>
                      <div className="text-left">
                        <span className="font-bristone font-bold text-primary text-xl">
                          {formatPrice(additionalTotalCost)}
                        </span>
                        <span className="text-sm text-secondary/60 font-dubai mr-2">ج.م</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Discount */}
        {(discount > 0 || isEditing) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white border-2 border-primary/20"
            style={{ boxShadow: SHADOWS.card }}
          >
            {/* Section Header */}
            <div className="bg-linear-to-r from-green-500/20 to-green-500/10 px-6 py-4 border-b-2 border-green-500/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-green-500/30 border border-green-500/40">
                  <Percent className="w-5 h-5 text-green-700" />
                </div>
                <div>
                  <h3 className="font-dubai font-bold text-green-800 text-lg">خصم</h3>
                  <p className="text-green-700/70 text-xs font-dubai">تخفيض على الإجمالي</p>
                </div>
              </div>
            </div>

            {/* Discount Content */}
            <div className="p-6">
              <div className="relative rounded-xl bg-green-500/10 p-4 border-2 border-green-500/20"
                style={{ boxShadow: 'rgba(34, 197, 94, 0.2) 0px 2px 8px' }}
              >
                <div className="flex items-center gap-4">
                  {/* Discount Icon */}
                  <div className="p-2.5 rounded-xl flex items-center justify-center shrink-0 border-2 bg-green-500/20 text-green-700 border-green-500/30">
                    <Percent className="w-5 h-5" strokeWidth={2} />
                  </div>

                  {/* Discount Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-dubai font-bold text-green-800 text-base">نسبة الخصم</span>
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={discount}
                            onChange={(e) => handleDiscountChange(Number(e.target.value))}
                            className="w-20 px-3 py-2 border-2 border-green-500/30 bg-white rounded-lg text-green-700 font-bold text-center focus:border-green-500 focus:outline-none"
                            min="0"
                            max="100"
                          />
                          <span className="text-green-700 font-bold">%</span>
                        </div>
                      ) : (
                        <span className="font-bristone font-bold text-green-700 text-xl">{discount}%</span>
                      )}
                    </div>
                    <p className="text-xs text-green-700/70 font-dubai mt-1">
                      قيمة الخصم: {formatPrice(discountAmount)} ج.م
                    </p>
                  </div>

                  {/* Discount Amount */}
                  <div className="text-left">
                    <span className="font-dubai font-bold text-green-600 text-2xl block">
                      - {formatPrice(discountAmount)}
                    </span>
                    <span className="text-xs text-green-700/70 font-dubai">ج.م</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Grand Total */}
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
                  <DollarSign className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-dubai font-bold text-2xl">الإجمالي النهائي</h3>
                  <p className="text-white/70 text-sm font-dubai">شامل جميع التكاليف والخصومات</p>
                </div>
              </div>
              
              <motion.div
                key={grandTotal}
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                className="text-center"
              >
                <span className="block font-bristone font-bold text-primary text-4xl sm:text-5xl">
                  {formatPrice(grandTotal)}
                </span>
                <span className="text-lg text-primary/80 font-dubai">ج.م</span>
              </motion.div>
            </div>
            
            {/* Breakdown Details */}
            {(additionalTotalCost > 0 || discount > 0) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-6 pt-6 border-t border-white/10"
              >
                <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-white/70 font-dubai">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary/50 rounded-full"></span>
                    <span>الغرف: {formatPrice(roomsTotalCost)} ج.م</span>
                  </div>
                  {additionalTotalCost > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary/50 rounded-full"></span>
                      <span>إضافية: {formatPrice(additionalTotalCost)} ج.م</span>
                    </div>
                  )}
                  {discount > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      <span className="text-green-400">خصم: {formatPrice(discountAmount)} ج.م</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CostSummarySlide;
