'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Building2, DollarSign, Bed, Hash, Star, TrendingUp, Edit2, Trash2 } from 'lucide-react';
import { NearbyApartment } from '@/types/feasibility';
import { fadeInUp } from '@/lib/animations/variants';
import useCurrencyFormatter from '@/hooks/useCurrencyFormatter';

interface ApartmentCardProps {
  apartment: NearbyApartment;
  index: number;
  isEditing?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function ApartmentCard({
  apartment,
  index,
  isEditing = false,
  onEdit,
  onDelete,
}: ApartmentCardProps) {
  const { currencySymbol } = useCurrencyFormatter();
  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      transition={{ delay: index * 0.1 }}
      className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-soft hover:shadow-medium transition-all duration-300 overflow-hidden group border border-black/5"
    >
      {/* الهيدر */}
      <div className="bg-linear-to-r from-secondary to-secondary/90 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-white font-bold font-dubai text-sm truncate max-w-30">
            {apartment.name || `شقة ${index + 1}`}
          </h3>
        </div>
        <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
          {index + 1}
        </div>
      </div>

      {/* المحتوى */}
      <div className="p-4 space-y-3">
        {/* السعر */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-secondary/70">
            <DollarSign className="w-4 h-4 text-primary" />
            <span className="text-xs font-dubai">سعر الإيجار</span>
          </div>
          <span className="text-secondary font-bold text-sm">
            {apartment.price.toLocaleString('ar-EG')} {currencySymbol}
          </span>
        </div>

        {/* عدد الغرف */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-secondary/70">
            <Bed className="w-4 h-4 text-primary" />
            <span className="text-xs font-dubai">عدد الغرف</span>
          </div>
          <span className="text-secondary font-bold text-sm">
            {apartment.rooms} غرف
          </span>
        </div>

        {/* عدد مرات التأجير */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-secondary/70">
            <Hash className="w-4 h-4 text-primary" />
            <span className="text-xs font-dubai">مرات التأجير</span>
          </div>
          <span className="text-secondary font-bold text-sm">
            {apartment.rentCount} مرة
          </span>
        </div>

        {/* أعلى إيجار */}
        {apartment.highestRent > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-secondary/70">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-xs font-dubai">أعلى إيجار</span>
            </div>
            <span className="text-green-600 font-bold text-sm">
              {apartment.highestRent.toLocaleString('ar-EG')} {currencySymbol}
            </span>
          </div>
        )}

        {/* المميزات */}
        {apartment.features.length > 0 && (
          <div className="pt-2 border-t border-secondary/10">
            <div className="flex items-center gap-1 text-secondary/70 mb-2">
              <Star className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-dubai">المميزات</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {apartment.features.slice(0, 3).map((feature, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-accent/50 text-secondary text-xs rounded-lg font-dubai"
                >
                  {feature}
                </span>
              ))}
              {apartment.features.length > 3 && (
                <span className="px-2 py-0.5 bg-secondary/10 text-secondary/60 text-xs rounded-lg font-dubai">
                  +{apartment.features.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* أزرار التحرير */}
      {isEditing && (
        <div className="px-4 pb-3 flex gap-2">
          <button
            onClick={onEdit}
            className="flex-1 px-3 py-1.5 bg-secondary/10 text-secondary text-xs rounded-lg hover:bg-secondary/20 transition-colors flex items-center justify-center gap-1 font-dubai"
          >
            <Edit2 className="w-3 h-3" />
            تعديل
          </button>
          <button
            onClick={onDelete}
            className="flex-1 px-3 py-1.5 bg-red-100 text-red-600 text-xs rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center gap-1 font-dubai"
          >
            <Trash2 className="w-3 h-3" />
            حذف
          </button>
        </div>
      )}
    </motion.div>
  );
}
