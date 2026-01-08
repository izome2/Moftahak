'use client';

import React, { useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  Building2, 
  X, 
  DollarSign, 
  Bed, 
  Star, 
  TrendingUp,
  MapPin,
  Edit3,
  Check,
  ImagePlus,
  FileText,
  Hash,
  Sparkles,
  Home
} from 'lucide-react';
import { NearbyApartmentsSlideData, NearbyApartment, MapSlideData } from '@/types/feasibility';

// ============================================
// 🎨 DESIGN TOKENS - ذهبي وبيج فقط
// ============================================
const SHADOWS = {
  card: '0 4px 20px rgba(16, 48, 43, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
  cardHover: '0 12px 40px rgba(16, 48, 43, 0.15), 0 4px 12px rgba(237, 191, 140, 0.1)',
  icon: '0 4px 12px rgba(237, 191, 140, 0.3)',
  button: '0 4px 16px rgba(237, 191, 140, 0.4)',
  image: '0 4px 12px rgba(16, 48, 43, 0.1)',
};

interface NearbyApartmentsSlideProps {
  data?: NearbyApartmentsSlideData;
  mapData?: MapSlideData;
  isEditing?: boolean;
  onUpdate?: (data: NearbyApartmentsSlideData) => void;
}

const defaultData: NearbyApartmentsSlideData = {
  apartments: [],
  showFromMap: true,
};

// مكون بطاقة الشقة الكبيرة
interface ApartmentCardProps {
  apartment: NearbyApartment;
  index: number;
  isEditing: boolean;
  isMyApartment?: boolean;
  onUpdateDescription: (id: string, description: string) => void;
  onUpdateImages: (id: string, images: string[]) => void;
}

const ApartmentCardComponent: React.FC<ApartmentCardProps> = ({
  apartment,
  index,
  isEditing,
  isMyApartment = false,
  onUpdateDescription,
  onUpdateImages,
}) => {
  const [editingDescription, setEditingDescription] = useState(false);
  const [localDescription, setLocalDescription] = useState(apartment.description || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveDescription = () => {
    onUpdateDescription(apartment.id, localDescription);
    setEditingDescription(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const currentImages = apartment.images || [];
    const remainingSlots = 4 - currentImages.length;
    
    if (remainingSlots <= 0) return;

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    
    filesToProcess.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        onUpdateImages(apartment.id, [...(apartment.images || []), base64]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (imageIndex: number) => {
    const newImages = (apartment.images || []).filter((_, i) => i !== imageIndex);
    onUpdateImages(apartment.id, newImages);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative bg-white rounded-2xl border-2 border-primary/30 hover:border-primary/50 overflow-hidden group"
      style={{ boxShadow: SHADOWS.card }}
    >
      {/* Header - ذهبي موحد */}
      <div 
        className="p-5 relative overflow-hidden bg-primary/20 border-b-2 border-primary/30"
        style={{ boxShadow: 'rgba(237, 191, 140, 0.3) 0px 4px 12px' }}
      >
        {/* زخرفة خلفية */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute -top-4 -right-4 w-24 h-24 border-4 border-primary/30 rounded-full" />
          <div className="absolute -bottom-6 -left-6 w-32 h-32 border-4 border-primary/20 rounded-full" />
        </div>
        
        <div className="relative z-10 flex items-center gap-4">
          <div 
            className="w-14 h-14 bg-primary/30 rounded-2xl flex items-center justify-center border-2 border-primary/40"
            style={{ boxShadow: 'rgba(237, 191, 140, 0.3) 0px 4px 12px' }}
          >
            <Building2 className="w-7 h-7 text-secondary" strokeWidth={2} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-secondary font-dubai">{apartment.name}</h3>
            <div className="flex items-center gap-2 text-secondary/60 text-sm mt-0.5">
              <div className="w-4 h-4 bg-primary/30 rounded-full flex items-center justify-center border border-primary/40">
                <MapPin className="w-2.5 h-2.5 text-secondary" />
              </div>
              <span className="font-dubai">موقع على الخريطة</span>
            </div>
          </div>
          {/* رقم الشقة أو "شقتي" */}
          <div 
            className="px-3 py-2 bg-primary/30 rounded-xl flex items-center justify-center border-2 border-primary/40"
            style={{ boxShadow: 'rgba(237, 191, 140, 0.3) 0px 4px 12px' }}
          >
            <span className="text-secondary font-bold font-dubai text-sm">
              {isMyApartment ? 'شقتي' : `#${index + 1}`}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Stats Grid - كل الخلايا ذهبي موحد */}
        <div className="grid grid-cols-2 gap-3">
          {/* السعر */}
          <div 
            className="bg-primary/20 p-3 rounded-xl border-2 border-primary/30"
            style={{ boxShadow: 'rgba(237, 191, 140, 0.3) 0px 4px 12px' }}
          >
            <div className="flex items-center gap-2 text-secondary/70 mb-1">
              <div className="w-6 h-6 bg-primary/30 rounded-lg flex items-center justify-center border border-primary/40">
                <DollarSign className="w-3.5 h-3.5 text-secondary" />
              </div>
              <span className="text-xs font-dubai">سعر الإيجار</span>
            </div>
            <div className="text-xl font-bold text-secondary font-bristone">
              {apartment.price.toLocaleString('ar-EG')}
              <span className="text-sm font-normal mr-1 text-secondary/60">ج.م</span>
            </div>
          </div>

          {/* عدد الغرف */}
          <div 
            className="bg-primary/20 p-3 rounded-xl border-2 border-primary/30"
            style={{ boxShadow: 'rgba(237, 191, 140, 0.3) 0px 4px 12px' }}
          >
            <div className="flex items-center gap-2 text-secondary/70 mb-1">
              <div className="w-6 h-6 bg-primary/30 rounded-lg flex items-center justify-center border border-primary/40">
                <Bed className="w-3.5 h-3.5 text-secondary" />
              </div>
              <span className="text-xs font-dubai">عدد الغرف</span>
            </div>
            <div className="text-xl font-bold text-secondary font-bristone">
              {apartment.rooms}
              <span className="text-sm font-normal mr-1 text-secondary/60">غرف</span>
            </div>
          </div>

          {/* مرات التأجير */}
          <div 
            className="bg-primary/20 p-3 rounded-xl border-2 border-primary/30"
            style={{ boxShadow: 'rgba(237, 191, 140, 0.3) 0px 4px 12px' }}
          >
            <div className="flex items-center gap-2 text-secondary/70 mb-1">
              <div className="w-6 h-6 bg-primary/30 rounded-lg flex items-center justify-center border border-primary/40">
                <Hash className="w-3.5 h-3.5 text-secondary" />
              </div>
              <span className="text-xs font-dubai">مرات التأجير</span>
            </div>
            <div className="text-xl font-bold text-secondary font-bristone">
              {apartment.rentCount}
              <span className="text-sm font-normal mr-1 text-secondary/60">مرة</span>
            </div>
          </div>

          {/* أعلى إيجار */}
          <div 
            className="bg-primary/20 p-3 rounded-xl border-2 border-primary/30"
            style={{ boxShadow: 'rgba(237, 191, 140, 0.3) 0px 4px 12px' }}
          >
            <div className="flex items-center gap-2 text-secondary/70 mb-1">
              <div className="w-6 h-6 bg-primary/30 rounded-lg flex items-center justify-center border border-primary/40">
                <TrendingUp className="w-3.5 h-3.5 text-secondary" />
              </div>
              <span className="text-xs font-dubai">أعلى إيجار</span>
            </div>
            <div className="text-xl font-bold text-secondary font-bristone">
              {apartment.highestRent.toLocaleString('ar-EG')}
              <span className="text-sm font-normal mr-1 text-secondary/60">ج.م</span>
            </div>
          </div>
        </div>

        {/* المميزات */}
        {apartment.features.length > 0 && (
          <div 
            className="bg-primary/20 p-3 rounded-xl border-2 border-primary/30"
            style={{ boxShadow: 'rgba(237, 191, 140, 0.3) 0px 4px 12px' }}
          >
            <div className="flex items-center gap-2 text-secondary/70 mb-2">
              <div className="w-6 h-6 bg-primary/30 rounded-lg flex items-center justify-center border border-primary/40">
                <Star className="w-3.5 h-3.5 text-secondary" />
              </div>
              <span className="text-xs font-bold font-dubai">المميزات</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {apartment.features.map((feature, i) => (
                <span 
                  key={i}
                  className="px-2 py-1 bg-white text-secondary text-xs rounded-lg border-2 border-primary/30 font-dubai"
                  style={{ boxShadow: 'rgba(237, 191, 140, 0.3) 0px 4px 12px' }}
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* الوصف */}
        <div 
          className="bg-primary/20 rounded-xl p-3 border-2 border-primary/30"
          style={{ boxShadow: 'rgba(237, 191, 140, 0.3) 0px 4px 12px' }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-secondary/70">
              <div className="w-6 h-6 bg-primary/30 rounded-lg flex items-center justify-center border border-primary/40">
                <FileText className="w-3.5 h-3.5 text-secondary" />
              </div>
              <span className="text-xs font-bold font-dubai">وصف إضافي</span>
            </div>
            {isEditing && !editingDescription && (
              <button
                onClick={() => setEditingDescription(true)}
                className="p-1.5 bg-primary/30 hover:bg-primary/40 rounded-lg transition-colors border border-primary/40"
                style={{ boxShadow: 'rgba(237, 191, 140, 0.3) 0px 4px 12px' }}
              >
                <Edit3 className="w-4 h-4 text-secondary" />
              </button>
            )}
          </div>
          
          {editingDescription ? (
            <div className="space-y-2">
              <textarea
                value={localDescription}
                onChange={(e) => setLocalDescription(e.target.value)}
                placeholder="أضف وصفاً للشقة..."
                className="w-full h-24 bg-accent/30 border-2 border-primary/20 rounded-lg p-2 text-sm text-secondary font-dubai focus:outline-none focus:border-primary resize-none"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveDescription}
                  className="px-3 py-1.5 bg-primary text-secondary text-xs font-bold rounded-lg flex items-center gap-1 font-dubai border-2 border-primary/50"
                  style={{ boxShadow: SHADOWS.button }}
                >
                  <Check className="w-3 h-3" />
                  حفظ
                </button>
                <button
                  onClick={() => {
                    setEditingDescription(false);
                    setLocalDescription(apartment.description || '');
                  }}
                  className="px-3 py-1.5 bg-accent/50 text-secondary text-xs rounded-lg font-dubai border-2 border-primary/20"
                >
                  إلغاء
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-secondary/60 font-dubai leading-relaxed">
              {apartment.description || (isEditing ? 'انقر للإضافة...' : 'لا يوجد وصف')}
            </p>
          )}
        </div>

        {/* الصور */}
        <div 
          className="bg-primary/20 rounded-xl p-3 border-2 border-primary/30"
          style={{ boxShadow: 'rgba(237, 191, 140, 0.3) 0px 4px 12px' }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-secondary/70">
              <div className="w-6 h-6 bg-primary/30 rounded-lg flex items-center justify-center border border-primary/40">
                <ImagePlus className="w-3.5 h-3.5 text-secondary" />
              </div>
              <span className="text-xs font-bold font-dubai">صور الشقة ({(apartment.images || []).length}/4)</span>
            </div>
            {isEditing && (apartment.images || []).length < 4 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-2 py-1 bg-primary/30 text-secondary text-xs rounded-lg flex items-center gap-1 hover:bg-primary/40 transition-colors font-dubai border-2 border-primary/40"
                style={{ boxShadow: 'rgba(237, 191, 140, 0.3) 0px 4px 12px' }}
              >
                <ImagePlus className="w-3 h-3" />
                إضافة
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />

          {(apartment.images || []).length > 0 ? (
            <div className="grid grid-cols-4 gap-2">
              {(apartment.images || []).map((img, i) => (
                <div 
                  key={i} 
                  className="relative aspect-square group/img rounded-lg overflow-hidden border-2 border-primary/40"
                  style={{ boxShadow: 'rgba(237, 191, 140, 0.3) 0px 4px 12px' }}
                >
                  <Image
                    src={img}
                    alt={`صورة ${i + 1}`}
                    fill
                    className="object-cover"
                  />
                  {isEditing && (
                    <button
                      onClick={() => handleRemoveImage(i)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-primary/80 text-secondary rounded-full flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity border-2 border-primary"
                      style={{ boxShadow: 'rgba(237, 191, 140, 0.3) 0px 4px 12px' }}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="h-16 flex items-center justify-center text-secondary/40 text-xs font-dubai bg-primary/10 rounded-lg border-2 border-dashed border-primary/30">
              {isEditing ? 'انقر على "إضافة" لرفع الصور' : 'لا توجد صور'}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default function NearbyApartmentsSlide({
  data = defaultData,
  mapData,
  isEditing = false,
  onUpdate,
}: NearbyApartmentsSlideProps) {
  // دمج الشقق من الخريطة مع الشقق المحلية
  const apartments = useMemo(() => {
    if (mapData?.pins && mapData.pins.length > 0) {
      return mapData.pins.map(pin => pin.apartment);
    }
    return data.apartments;
  }, [mapData?.pins, data.apartments]);

  const [localData, setLocalData] = useState<Record<string, { description?: string; images?: string[] }>>({});

  // حفظ مرجع لـ onUpdate
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  // تحديث الوصف
  const handleUpdateDescription = (id: string, description: string) => {
    setLocalData(prev => ({
      ...prev,
      [id]: { ...prev[id], description }
    }));
  };

  // تحديث الصور
  const handleUpdateImages = (id: string, images: string[]) => {
    setLocalData(prev => ({
      ...prev,
      [id]: { ...prev[id], images }
    }));
  };

  // دمج البيانات المحلية مع بيانات الشقق
  const mergedApartments = useMemo(() => {
    return apartments.map(apt => ({
      ...apt,
      description: localData[apt.id]?.description ?? apt.description,
      images: localData[apt.id]?.images ?? apt.images,
    }));
  }, [apartments, localData]);

  return (
    <div className="p-6 md:p-8 bg-linear-to-br from-accent/30 via-white to-accent/20 pb-24" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto space-y-8"
      >
        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white p-6 sm:p-8 border-2 border-primary/30"
          style={{ boxShadow: SHADOWS.card }}
        >
          <div className="absolute -top-8 -left-8 opacity-[0.05] pointer-events-none">
            <Building2 className="w-48 h-48 text-primary" strokeWidth={1} />
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div 
                className="p-4 rounded-2xl bg-primary/20 border-2 border-primary/30"
                style={{ boxShadow: SHADOWS.icon }}
              >
                <Building2 className="w-8 h-8 text-primary" strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-secondary font-dubai">
                  الشقق المحيطة
                </h2>
                <p className="text-secondary/60 font-dubai text-sm mt-1">
                  مقارنة تفصيلية للشقق في منطقتك
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4">
              <div 
                className="text-center px-4 py-2 bg-accent/40 rounded-xl border-2 border-primary/20"
                style={{ boxShadow: SHADOWS.card }}
              >
                <span className="block text-2xl font-bold text-secondary font-bristone">
                  {mergedApartments.length}
                </span>
                <span className="text-xs text-secondary/60 font-dubai">شقة</span>
              </div>
              {mergedApartments.length > 0 && (
                <div 
                  className="text-center px-4 py-2 bg-primary/20 rounded-xl border-2 border-primary/30"
                  style={{ boxShadow: SHADOWS.icon }}
                >
                  <span className="block text-xl font-bold text-secondary font-bristone">
                    {Math.round(
                      mergedApartments.reduce((sum, a) => sum + a.price, 0) / mergedApartments.length
                    ).toLocaleString('ar-EG')}
                  </span>
                  <span className="text-xs text-secondary/60 font-dubai">متوسط الإيجار</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* فقرة توضيحية للعميل */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-primary/20 rounded-2xl p-5 border-2 border-primary/30 flex items-center gap-4"
          style={{ boxShadow: 'rgba(237, 191, 140, 0.3) 0px 4px 12px' }}
        >
          <span className="w-1 h-5 bg-primary rounded-full shrink-0"></span>
          <p className="text-secondary text-base font-dubai leading-relaxed">
            عزيزي العميل، إليك تفاصيل الوحدات السكنية القريبة من موقعك مع معلومات شاملة عن الأسعار والمميزات وبعض الصور التوضيحية.
          </p>
        </motion.div>

        {/* Apartments Grid */}
        {mergedApartments.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
          >
            {mergedApartments.map((apartment, index) => (
              <ApartmentCardComponent
                key={apartment.id}
                apartment={apartment}
                index={index}
                isEditing={isEditing}
                isMyApartment={index === 0}
                onUpdateDescription={handleUpdateDescription}
                onUpdateImages={handleUpdateImages}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border-2 border-primary/30 p-12"
            style={{ boxShadow: SHADOWS.card }}
          >
            <div className="flex flex-col items-center justify-center text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-xl" />
                <div 
                  className="relative w-24 h-24 bg-accent/50 rounded-3xl flex items-center justify-center border-2 border-primary/30"
                  style={{ boxShadow: SHADOWS.icon }}
                >
                  <MapPin className="w-12 h-12 text-primary" strokeWidth={1.5} />
                </div>
              </div>
              <h4 className="font-dubai font-bold text-secondary text-xl mb-2">
                لا توجد شقق محيطة بعد
              </h4>
              <p className="font-dubai text-secondary/50 text-sm max-w-sm">
                قم بإضافة دبابيس الشقق على الخريطة أولاً، وستظهر هنا تلقائياً مع إمكانية إضافة تفاصيل أكثر
              </p>
            </div>
          </motion.div>
        )}

        {/* Summary Stats */}
        {mergedApartments.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 border-2 border-primary/30"
            style={{ boxShadow: SHADOWS.card }}
          >
            <h3 className="text-lg font-bold text-secondary font-dubai mb-4 flex items-center gap-2">
              <div 
                className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center border-2 border-primary/30"
                style={{ boxShadow: SHADOWS.icon }}
              >
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              ملخص الإحصائيات
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div 
                className="text-center p-4 bg-primary/20 rounded-xl border-2 border-primary/30"
                style={{ boxShadow: 'rgba(237, 191, 140, 0.3) 0px 4px 12px' }}
              >
                <div className="text-3xl font-bold text-secondary font-bristone">
                  {mergedApartments.length}
                </div>
                <div className="text-sm text-secondary/60 font-dubai mt-1">عدد الشقق</div>
              </div>
              <div 
                className="text-center p-4 bg-primary/20 rounded-xl border-2 border-primary/30"
                style={{ boxShadow: 'rgba(237, 191, 140, 0.3) 0px 4px 12px' }}
              >
                <div className="text-3xl font-bold text-secondary font-bristone">
                  {Math.min(...mergedApartments.map(a => a.price)).toLocaleString('ar-EG')}
                </div>
                <div className="text-sm text-secondary/60 font-dubai mt-1">أقل إيجار (ج.م)</div>
              </div>
              <div 
                className="text-center p-4 bg-primary/20 rounded-xl border-2 border-primary/30"
                style={{ boxShadow: 'rgba(237, 191, 140, 0.3) 0px 4px 12px' }}
              >
                <div className="text-3xl font-bold text-secondary font-bristone">
                  {Math.max(...mergedApartments.map(a => a.price)).toLocaleString('ar-EG')}
                </div>
                <div className="text-sm text-secondary/60 font-dubai mt-1">أعلى إيجار (ج.م)</div>
              </div>
              <div 
                className="text-center p-4 bg-primary/20 rounded-xl border-2 border-primary/30"
                style={{ boxShadow: 'rgba(237, 191, 140, 0.3) 0px 4px 12px' }}
              >
                <div className="text-3xl font-bold text-secondary font-bristone">
                  {Math.round(
                    mergedApartments.reduce((sum, a) => sum + a.price, 0) / mergedApartments.length
                  ).toLocaleString('ar-EG')}
                </div>
                <div className="text-sm text-secondary/60 font-dubai mt-1">المتوسط (ج.م)</div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
