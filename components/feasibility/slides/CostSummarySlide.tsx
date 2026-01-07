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
  Edit3
} from 'lucide-react';
import type { SlideData, CostSummarySlideData, RoomData } from '@/types/feasibility';

interface CostSummarySlideProps {
  data: CostSummarySlideData;
  isEditing?: boolean;
  onUpdate?: (data: Partial<SlideData>) => void;
}

// أيقونات أنواع الغرف
const roomIcons: Record<string, React.ElementType> = {
  kitchen: ChefHat,
  bedroom: Bed,
  'living-room': Sofa,
  bathroom: Bath,
};

// ألوان أنواع الغرف
const roomColors: Record<string, string> = {
  kitchen: 'bg-orange-500/20 text-orange-600',
  bedroom: 'bg-blue-500/20 text-blue-600',
  'living-room': 'bg-green-500/20 text-green-600',
  bathroom: 'bg-cyan-500/20 text-cyan-600',
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
    <div className="w-full h-full bg-accent flex flex-col overflow-hidden" dir="rtl">
      {/* رأس الشريحة */}
      <div className="bg-secondary text-white px-6 py-4 flex items-center gap-3">
        <div className="w-12 h-12 bg-primary/20 flex items-center justify-center rounded-xl">
          <Calculator className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-dubai">ملخص التكاليف</h2>
          <p className="text-primary/80 text-sm">
            إجمالي تكاليف تجهيز الشقة
          </p>
        </div>
      </div>

      {/* محتوى الشريحة */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="bg-white border border-secondary/10 overflow-hidden rounded-2xl shadow-soft">
          {/* رأس الجدول */}
          <div className="bg-secondary/5 px-4 py-4 grid grid-cols-12 gap-4 font-bold text-secondary border-b border-secondary/10">
            <div className="col-span-1 text-center">#</div>
            <div className="col-span-1 text-center">
              <Home className="w-4 h-4 mx-auto" />
            </div>
            <div className="col-span-6">الغرفة / البند</div>
            <div className="col-span-4 text-left">التكلفة</div>
          </div>

          {/* صفوف الغرف */}
          <div className="divide-y divide-secondary/10">
            {rooms.length === 0 ? (
              <div className="px-4 py-8 text-center text-secondary/50">
                <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Home className="w-7 h-7 opacity-60" />
                </div>
                <p className="font-dubai">لم يتم إضافة غرف بعد</p>
                <p className="text-sm mt-1">أضف الغرف من الشرائح السابقة</p>
              </div>
            ) : (
              rooms.map((room, index) => {
                const Icon = roomIcons[room.type] || Home;
                const colorClass = roomColors[room.type] || 'bg-gray-500/20 text-gray-600';
                
                return (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="px-4 py-3 grid grid-cols-12 gap-4 items-center hover:bg-secondary/5 transition-colors"
                  >
                    <div className="col-span-1 text-center font-bold text-secondary/50">
                      {index + 1}
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <div className={`w-9 h-9 flex items-center justify-center ${colorClass} rounded-lg`}>
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="col-span-6">
                      <p className="font-dubai font-medium text-secondary">{room.name}</p>
                      <p className="text-xs text-secondary/60">
                        {room.items?.length || 0} عنصر
                      </p>
                    </div>
                    <div className="col-span-4 text-left">
                      <span className="font-bold text-secondary">
                        {formatPrice(room.totalCost || 0)}
                      </span>
                      <span className="text-sm text-secondary/60 mr-1">ج.م</span>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* خط فاصل */}
          {rooms.length > 0 && (
            <div className="border-t-2 border-secondary/20" />
          )}

          {/* إجمالي الغرف */}
          {rooms.length > 0 && (
            <div className="px-4 py-3 grid grid-cols-12 gap-4 items-center bg-secondary/5">
              <div className="col-span-2"></div>
              <div className="col-span-6 font-bold text-secondary font-dubai">
                إجمالي تكلفة الغرف
              </div>
              <div className="col-span-4 text-left">
                <span className="font-bold text-lg text-secondary">
                  {formatPrice(roomsTotalCost)}
                </span>
                <span className="text-sm text-secondary/60 mr-1">ج.م</span>
              </div>
            </div>
          )}

          {/* التكاليف الإضافية */}
          {(additionalCosts.length > 0 || isEditing) && (
            <>
              <div className="border-t-2 border-dashed border-secondary/20" />
              <div className="px-4 py-2 bg-primary/10">
                <p className="text-sm font-bold text-secondary font-dubai flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  تكاليف إضافية
                </p>
              </div>
              
              {additionalCosts.map((cost, index) => (
                <div
                  key={index}
                  className="px-4 py-3 grid grid-cols-12 gap-4 items-center hover:bg-secondary/5"
                >
                  <div className="col-span-2"></div>
                  <div className="col-span-6">
                    {isEditing ? (
                      <input
                        type="text"
                        value={cost.name}
                        onChange={(e) => handleAdditionalCostChange(index, 'name', e.target.value)}
                        className="w-full px-2 py-1 border border-secondary/20 bg-transparent text-secondary focus:border-primary focus:outline-none font-dubai"
                      />
                    ) : (
                      <p className="font-dubai text-secondary">{cost.name}</p>
                    )}
                  </div>
                  <div className="col-span-4 flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <input
                          type="number"
                          value={cost.amount}
                          onChange={(e) => handleAdditionalCostChange(index, 'amount', e.target.value)}
                          className="w-24 px-2 py-1 border border-secondary/20 bg-transparent text-secondary focus:border-primary focus:outline-none text-left"
                          min="0"
                        />
                        <span className="text-sm text-secondary/60">ج.م</span>
                        <button
                          onClick={() => handleRemoveAdditionalCost(index)}
                          className="text-red-500 hover:text-red-600 mr-2"
                        >
                          ✕
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="font-bold text-secondary">
                          {formatPrice(cost.amount)}
                        </span>
                        <span className="text-sm text-secondary/60">ج.م</span>
                      </>
                    )}
                  </div>
                </div>
              ))}

              {isEditing && (
                <div className="px-4 py-2">
                  <button
                    onClick={handleAddAdditionalCost}
                    className="text-sm text-primary hover:text-primary/80 font-dubai flex items-center gap-1"
                  >
                    <span>+</span> إضافة تكلفة جديدة
                  </button>
                </div>
              )}
            </>
          )}

          {/* الخصم */}
          {(discount > 0 || isEditing) && (
            <>
              <div className="border-t border-secondary/10" />
              <div className="px-4 py-3 grid grid-cols-12 gap-4 items-center bg-green-500/5">
                <div className="col-span-2 flex justify-center">
                  <Percent className="w-5 h-5 text-green-600" />
                </div>
                <div className="col-span-6 flex items-center gap-2">
                  <span className="font-dubai text-green-700">خصم</span>
                  {isEditing ? (
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => handleDiscountChange(Number(e.target.value))}
                      className="w-16 px-2 py-1 border border-green-300 bg-transparent text-green-700 focus:border-green-500 focus:outline-none text-center"
                      min="0"
                      max="100"
                    />
                  ) : (
                    <span className="font-bold text-green-700">{discount}</span>
                  )}
                  <span className="text-green-600">%</span>
                </div>
                <div className="col-span-4 text-left">
                  <span className="font-bold text-green-600">
                    - {formatPrice(discountAmount)}
                  </span>
                  <span className="text-sm text-green-500 mr-1">ج.م</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* الإجمالي النهائي */}
      <div className="bg-secondary text-white px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-primary/80 text-sm">الإجمالي النهائي</p>
              <p className="text-xs text-white/50">شامل جميع التكاليف</p>
            </div>
          </div>
          <motion.div
            key={grandTotal}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="text-left"
          >
            <span className="text-3xl font-bold text-primary">
              {formatPrice(grandTotal)}
            </span>
            <span className="text-lg text-primary/80 mr-2">ج.م</span>
          </motion.div>
        </div>
        
        {/* تفاصيل صغيرة */}
        {(additionalTotalCost > 0 || discount > 0) && (
          <div className="mt-3 pt-3 border-t border-white/10 flex gap-6 text-sm text-white/60">
            <span>تكلفة الغرف: {formatPrice(roomsTotalCost)} ج.م</span>
            {additionalTotalCost > 0 && (
              <span>+ إضافية: {formatPrice(additionalTotalCost)} ج.م</span>
            )}
            {discount > 0 && (
              <span className="text-green-400">- خصم: {formatPrice(discountAmount)} ج.م</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CostSummarySlide;
