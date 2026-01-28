'use client';

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  Home,
  ExternalLink,
  Users,
  Bath,
  ChevronLeft,
  Percent,
  Wallet
} from 'lucide-react';
import { NearbyApartmentsSlideData, NearbyApartment, MapSlideData } from '@/types/feasibility';
import EditableSectionTitle from '@/components/feasibility/shared/EditableSectionTitle';
import useCurrencyFormatter from '@/hooks/useCurrencyFormatter';

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
  onUpdateMapData?: (data: MapSlideData) => void;
}

const defaultData: NearbyApartmentsSlideData = {
  apartments: [],
  showFromMap: true,
};

// معالم مصرية مشهورة مع التصنيفات
type LandmarkCategory = 'tourism' | 'education' | 'transport' | 'shopping' | 'health' | 'park' | 'district' | 'religious';

interface Landmark {
  name: string;
  lat: number;
  lng: number;
  category: LandmarkCategory;
}

const LANDMARKS: Landmark[] = [
  // نهر النيل - نقاط متعددة على طول النهر (كل 2-3 كم تقريباً)
  { name: 'نهر النيل - الزمالك', lat: 30.0626, lng: 31.2204, category: 'park' },
  { name: 'نهر النيل - الجزيرة', lat: 30.0444, lng: 31.2240, category: 'park' },
  { name: 'نهر النيل - جاردن سيتي', lat: 30.0350, lng: 31.2280, category: 'park' },
  { name: 'نهر النيل - كورنيش النيل', lat: 30.0444, lng: 31.2320, category: 'park' },
  { name: 'نهر النيل - مصر القديمة', lat: 30.0059, lng: 31.2280, category: 'park' },
  { name: 'نهر النيل - المعادي', lat: 29.9601, lng: 31.2300, category: 'park' },
  { name: 'نهر النيل - الدقي', lat: 30.0380, lng: 31.2100, category: 'park' },
  { name: 'نهر النيل - شبرا', lat: 30.0900, lng: 31.2450, category: 'park' },
  { name: 'نهر النيل - المنيل', lat: 30.0200, lng: 31.2250, category: 'park' },
  { name: 'نهر النيل - إمبابة', lat: 30.0750, lng: 31.2050, category: 'park' },
  
  // معالم سياحية
  { name: 'الأهرامات وأبو الهول', lat: 29.9792, lng: 31.1342, category: 'tourism' },
  { name: 'برج القاهرة', lat: 30.0459, lng: 31.2243, category: 'tourism' },
  { name: 'المتحف المصري الكبير', lat: 29.9956, lng: 31.1167, category: 'tourism' },
  { name: 'المتحف المصري بالتحرير', lat: 30.0478, lng: 31.2336, category: 'tourism' },
  { name: 'قلعة صلاح الدين', lat: 30.0297, lng: 31.2602, category: 'tourism' },
  { name: 'خان الخليلي', lat: 30.0474, lng: 31.2626, category: 'tourism' },
  { name: 'قصر البارون', lat: 30.0880, lng: 31.3278, category: 'tourism' },
  { name: 'قصر عابدين', lat: 30.0426, lng: 31.2489, category: 'tourism' },
  { name: 'دار الأوبرا المصرية', lat: 30.0429, lng: 31.2247, category: 'tourism' },
  
  // جامعات ومؤسسات تعليمية
  { name: 'جامعة القاهرة', lat: 30.0260, lng: 31.2088, category: 'education' },
  { name: 'جامعة عين شمس', lat: 30.0783, lng: 31.2815, category: 'education' },
  { name: 'الجامعة الأمريكية بالقاهرة', lat: 30.0197, lng: 31.4996, category: 'education' },
  { name: 'جامعة حلوان', lat: 29.8420, lng: 31.3358, category: 'education' },
  { name: 'جامعة المستقبل', lat: 30.0075, lng: 31.4683, category: 'education' },
  { name: 'الجامعة الألمانية بالقاهرة', lat: 29.9867, lng: 31.4401, category: 'education' },
  { name: 'أكاديمية الشروق', lat: 30.1167, lng: 31.6167, category: 'education' },
  
  // مواصلات
  { name: 'مطار القاهرة الدولي', lat: 30.1219, lng: 31.4056, category: 'transport' },
  { name: 'مطار سفنكس الدولي', lat: 29.9833, lng: 31.0167, category: 'transport' },
  { name: 'محطة مصر رمسيس', lat: 30.0630, lng: 31.2478, category: 'transport' },
  { name: 'محطة مترو العتبة', lat: 30.0528, lng: 31.2472, category: 'transport' },
  { name: 'محطة مترو السادات', lat: 30.0444, lng: 31.2357, category: 'transport' },
  { name: 'مونوريل العاصمة الإدارية', lat: 30.0275, lng: 31.7467, category: 'transport' },
  
  // مراكز تسوق
  { name: 'مول مصر', lat: 30.0070, lng: 31.0176, category: 'shopping' },
  { name: 'سيتي ستارز', lat: 30.0727, lng: 31.3449, category: 'shopping' },
  { name: 'مول العرب', lat: 29.9705, lng: 30.9525, category: 'shopping' },
  { name: 'كايرو فيستيفال سيتي', lat: 30.0275, lng: 31.4016, category: 'shopping' },
  { name: 'داون تاون مول', lat: 30.0333, lng: 31.4833, category: 'shopping' },
  { name: 'الداون تاون العاصمة الإدارية', lat: 30.0167, lng: 31.7333, category: 'shopping' },
  
  // مستشفيات
  { name: 'مستشفى دار الفؤاد', lat: 29.9815, lng: 31.2071, category: 'health' },
  { name: 'مستشفى القصر العيني', lat: 30.0296, lng: 31.2318, category: 'health' },
  { name: 'مستشفى 57357', lat: 30.0125, lng: 31.2083, category: 'health' },
  { name: 'مستشفى السلام الدولي', lat: 30.0500, lng: 31.3667, category: 'health' },
  { name: 'مستشفى الجلاء العسكري', lat: 30.0667, lng: 31.2500, category: 'health' },
  
  // حدائق ومتنزهات
  { name: 'حديقة الأزهر', lat: 30.0403, lng: 31.2643, category: 'park' },
  { name: 'حديقة الأورمان', lat: 30.0338, lng: 31.2083, category: 'park' },
  { name: 'الحديقة الدولية', lat: 30.0833, lng: 31.3333, category: 'park' },
  { name: 'حديقة الفسطاط', lat: 30.0100, lng: 31.2350, category: 'park' },
  { name: 'النهر الأخضر العاصمة', lat: 30.0333, lng: 31.7500, category: 'park' },
  
  // أحياء رئيسية
  { name: 'مدينة نصر', lat: 30.0540, lng: 31.3410, category: 'district' },
  { name: 'المعادي', lat: 29.9601, lng: 31.2504, category: 'district' },
  { name: 'الزمالك', lat: 30.0626, lng: 31.2204, category: 'district' },
  { name: 'مدينة الشيخ زايد', lat: 30.0181, lng: 30.9760, category: 'district' },
  { name: 'السادس من أكتوبر', lat: 29.9544, lng: 31.0036, category: 'district' },
  { name: 'التجمع الخامس', lat: 30.0300, lng: 31.4294, category: 'district' },
  { name: 'العاصمة الإدارية الجديدة', lat: 30.0275, lng: 31.7467, category: 'district' },
  { name: 'الشروق', lat: 30.1167, lng: 31.6167, category: 'district' },
  { name: 'مدينتي', lat: 30.1000, lng: 31.6333, category: 'district' },
  { name: 'الرحاب', lat: 30.0667, lng: 31.4833, category: 'district' },
  { name: 'هليوبوليس الجديدة', lat: 30.1000, lng: 31.3833, category: 'district' },
  
  // أماكن دينية بارزة
  { name: 'مسجد الحسين', lat: 30.0478, lng: 31.2633, category: 'religious' },
  { name: 'مسجد محمد علي', lat: 30.0288, lng: 31.2596, category: 'religious' },
  { name: 'الكنيسة المعلقة', lat: 30.0059, lng: 31.2304, category: 'religious' },
  { name: 'كاتدرائية ميلاد المسيح', lat: 30.0275, lng: 31.7467, category: 'religious' },
  { name: 'مسجد الفتاح العليم', lat: 30.0275, lng: 31.7467, category: 'religious' },
];

// دالة حساب المسافة (Haversine)
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

interface EditableWidgetProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  suffix: string;
  isEditable: boolean;
  onSave?: (newValue: number) => void;
  isNumber?: boolean;
  isDark?: boolean;
}

const EditableWidget: React.FC<EditableWidgetProps> = ({
  icon,
  label,
  value,
  suffix,
  isEditable,
  onSave,
  isNumber = true,
  isDark = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  // تحديث localValue عند تغيير value من الخارج
  useEffect(() => {
    if (!isEditing) {
      setLocalValue(String(value));
    }
  }, [value, isEditing]);

  const handleClick = () => {
    if (isEditable && onSave) {
      setIsEditing(true);
      // تعيين القيمة الرقمية مباشرة (بدون تنسيق)
      const numVal = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
      setLocalValue(String(numVal));
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  };

  const handleSave = () => {
    if (onSave && isNumber) {
      const numValue = parseFloat(localValue) || 0;
      onSave(numValue);
    }
    setIsEditing(false);
  };

  // تحديث القيمة المحلية فقط (بدون حفظ فوري)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // السماح بالأرقام والنقطة فقط
    const rawValue = e.target.value.replace(/[^0-9.]/g, '');
    setLocalValue(rawValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setLocalValue(String(value));
      setIsEditing(false);
    }
  };

  return (
    <motion.div 
      className={`p-2 sm:p-3 rounded-lg sm:rounded-xl border-2 transition-all ${
        isDark 
          ? `border-secondary/40 ${isEditable ? 'cursor-pointer hover:border-secondary/60' : ''}`
          : `bg-primary/20 border-primary/30 ${isEditable ? 'cursor-pointer hover:border-primary/50 hover:bg-primary/30' : ''}`
      }`}
      style={{ 
        boxShadow: isDark ? 'rgba(16, 48, 43, 0.3) 0px 4px 12px' : 'rgba(237, 191, 140, 0.3) 0px 4px 12px',
        backgroundColor: isDark ? '#164138' : undefined,
      }}
      onClick={handleClick}
    >
      <div className={`flex items-center gap-1.5 sm:gap-2 mb-1 ${isDark ? 'text-[#fdf5ed]/70' : 'text-secondary/70'}`}>
        <div 
          className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg flex items-center justify-center border ${isDark ? 'border-secondary/60' : 'bg-primary/30 border-primary/40'}`}
          style={{ backgroundColor: isDark ? '#0d2622' : undefined }}
        >
          {icon}
        </div>
        <span className="text-[10px] sm:text-xs font-dubai">{label}</span>
        {isEditable && !isEditing && (
          <Edit3 className={`w-2.5 h-2.5 sm:w-3 sm:h-3 mr-auto ${isDark ? 'text-[#fdf5ed]/70' : 'text-primary/60'}`} />
        )}
      </div>
      {isEditing ? (
        <div className="flex items-center gap-1">
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={localValue}
            onChange={handleChange}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className={`w-full text-base sm:text-lg font-bold font-dubai border rounded-lg px-2 py-1 focus:outline-none ${isDark ? 'text-[#fdf5ed] bg-secondary/50 border-secondary/40 focus:border-secondary/70' : 'text-secondary bg-white/50 border-primary/40 focus:border-primary'}`}
          />
          <button
            onClick={(e) => { e.stopPropagation(); handleSave(); }}
            className={`p-1.5 rounded-lg transition-colors ${isDark ? 'bg-secondary text-[#fdf5ed] hover:bg-secondary/80' : 'bg-secondary/80 text-white hover:bg-secondary'}`}
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className={`text-base sm:text-lg font-bold font-bristone ${isDark ? 'text-[#fdf5ed]' : 'text-secondary'}`}>
          {typeof value === 'number' ? value.toLocaleString('ar-EG') : value}
          <span className={`text-[10px] sm:text-xs font-normal mr-1 ${isDark ? 'text-[#fdf5ed]/60' : 'text-secondary/60'}`}>{suffix}</span>
        </div>
      )}
    </motion.div>
  );
};

// مكون بطاقة الشقة الكبيرة
interface ApartmentCardProps {
  apartment: NearbyApartment;
  index: number;
  isEditing: boolean;
  isMyApartment?: boolean;
  onUpdateDescription: (id: string, description: string) => void;
  onUpdateImages: (id: string, images: string[]) => void;
  onUpdateApartment?: (id: string, updates: Partial<NearbyApartment>) => void;
}

const ApartmentCardComponent: React.FC<ApartmentCardProps> = ({
  apartment,
  index,
  isEditing,
  isMyApartment = false,
  onUpdateDescription,
  onUpdateImages,
  onUpdateApartment,
}) => {
  const [editingDescription, setEditingDescription] = useState(false);
  const [localDescription, setLocalDescription] = useState(apartment.description || '');
  const [expandedImageIndex, setExpandedImageIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { currencySymbol } = useCurrencyFormatter();

  const canEdit = isEditing;

  const handleUpdateValue = (field: keyof NearbyApartment, value: number) => {
    if (onUpdateApartment) {
      onUpdateApartment(apartment.id, { [field]: value });
    }
  };

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
      // ضغط الصورة قبل الحفظ
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = document.createElement('img');
      
      img.onload = () => {
        // تحديد الحجم الأقصى (600px للصور بجودة جيدة)
        const maxSize = 600;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);
        
        // تحويل لـ JPEG بجودة 75% (جودة جيدة)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.75);
        onUpdateImages(apartment.id, [...(apartment.images || []), compressedBase64]);
      };
      
      const reader = new FileReader();
      reader.onload = (event) => {
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (imageIndex: number) => {
    const newImages = (apartment.images || []).filter((_, i) => i !== imageIndex);
    onUpdateImages(apartment.id, newImages);
  };

  // مرجع لـ input اختيار صورة الشقة
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpdateApartment) return;
    
    // ضغط الصورة قبل التحويل لـ base64
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = document.createElement('img');
    
    img.onload = () => {
      // تحديد الحجم الأقصى (300px لجودة أفضل)
      const maxSize = 300;
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);
      
      // تحويل لـ JPEG بجودة 70% (جودة أفضل مع حجم معقول)
      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
      onUpdateApartment(apartment.id, { thumbnailUrl: compressedBase64 });
    };
    
    const reader = new FileReader();
    reader.onload = (event) => {
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <motion.div
      className={`relative rounded-2xl border-2 overflow-hidden group ${
        isMyApartment 
          ? 'border-secondary/30' 
          : 'bg-white border-primary/30'
      }`}
      style={{ 
        boxShadow: SHADOWS.card,
        backgroundColor: isMyApartment ? '#1a4a42' : undefined,
      }}
    >
      {/* Input مخفي لاختيار صورة */}
      <input
        ref={thumbnailInputRef}
        type="file"
        accept="image/*"
        onChange={handleThumbnailUpload}
        style={{ display: 'none' }}
      />
      
      {/* Header */}
      <div 
        className={`p-5 relative overflow-hidden border-b-2 ${
          isMyApartment 
            ? 'border-secondary/40' 
            : 'bg-primary/20 border-primary/30'
        }`}
        style={{ 
          boxShadow: isMyApartment ? 'rgba(16, 48, 43, 0.3) 0px 4px 12px' : 'rgba(237, 191, 140, 0.3) 0px 4px 12px',
          backgroundColor: isMyApartment ? '#10302b' : undefined,
        }}
      >
        {/* صورة الشقة كخلفية */}
        {apartment.thumbnailUrl && (
          <div className="absolute inset-0">
            <img
              src={apartment.thumbnailUrl}
              alt={apartment.name}
              className="absolute inset-0 w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-linear-to-l from-primary/40 via-primary/20 to-primary/40" />
          </div>
        )}
        
        {/* زخرفة خلفية */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute -top-4 -right-4 w-24 h-24 border-4 border-primary/30 rounded-full" />
          <div className="absolute -bottom-6 -left-6 w-32 h-32 border-4 border-primary/20 rounded-full" />
        </div>
        
        <div className="relative z-10 flex items-center gap-2 sm:gap-4">
          <div 
            className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center border-2 backdrop-blur-sm ${
              isMyApartment 
                ? 'border-secondary/60' 
                : `border-primary/40 ${!apartment.thumbnailUrl && isEditing ? 'cursor-pointer hover:bg-primary/40 transition-colors' : ''} ${apartment.thumbnailUrl ? 'bg-primary/50' : 'bg-primary/30'}`
            }`}
            style={{ 
              boxShadow: isMyApartment ? 'rgba(16, 48, 43, 0.4) 0px 4px 12px' : 'rgba(237, 191, 140, 0.3) 0px 4px 12px',
              backgroundColor: isMyApartment ? '#0d2622' : undefined,
            }}
            onClick={() => {
              if (!apartment.thumbnailUrl && isEditing) {
                thumbnailInputRef.current?.click();
              }
            }}
            title={!apartment.thumbnailUrl && isEditing ? 'انقر لإضافة صورة' : undefined}
          >
            {!apartment.thumbnailUrl && isEditing ? (
              <ImagePlus className={`w-4 h-4 sm:w-6 sm:h-6 ${isMyApartment ? 'text-[#fdf5ed]' : 'text-secondary/70'}`} strokeWidth={2} />
            ) : (
              <Building2 className={`w-5 h-5 sm:w-7 sm:h-7 ${isMyApartment ? 'text-[#fdf5ed]' : 'text-secondary'}`} strokeWidth={2} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`text-base sm:text-xl font-bold font-dubai truncate ${isMyApartment ? 'text-[#fdf5ed]' : 'text-secondary'}`}>{apartment.name}</h3>
            <div className={`flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm mt-0.5 ${isMyApartment ? 'text-[#fdf5ed]/70' : 'text-secondary/60'}`}>
              {apartment.airbnbUrl ? (
                <a
                  href={apartment.airbnbUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 sm:gap-2 hover:text-[#FF5A5F] transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-[#FF5A5F]/20 rounded-full flex items-center justify-center border border-[#FF5A5F]/40">
                    <ExternalLink className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-[#FF5A5F]" />
                  </div>
                  <span className="font-dubai">عرض في Airbnb</span>
                </a>
              ) : (
                <>
                  <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full flex items-center justify-center border ${isMyApartment ? 'bg-secondary/60 border-secondary/80' : 'bg-primary/30 border-primary/40'}`}>
                    <MapPin className={`w-2 h-2 sm:w-2.5 sm:h-2.5 ${isMyApartment ? 'text-[#fdf5ed]' : 'text-secondary'}`} />
                  </div>
                  <span className="font-dubai">موقع على الخريطة</span>
                </>
              )}
            </div>
          </div>
          {/* رقم الشقة أو "شقتي" */}
          <div 
            className={`px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl flex items-center justify-center border-2 backdrop-blur-sm ${
              isMyApartment 
                ? 'border-secondary/60' 
                : `border-primary/40 ${apartment.thumbnailUrl ? 'bg-primary/50' : 'bg-primary/30'}`
            }`}
            style={{ 
              boxShadow: isMyApartment ? 'rgba(16, 48, 43, 0.4) 0px 4px 12px' : 'rgba(237, 191, 140, 0.3) 0px 4px 12px',
              backgroundColor: isMyApartment ? '#0d2622' : undefined,
            }}
          >
            <span className={`font-bold font-dubai text-xs sm:text-sm ${isMyApartment ? 'text-[#fdf5ed]' : 'text-secondary'}`}>
              {isMyApartment ? 'شقتي' : `${index + 1}`}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 space-y-3 sm:space-y-4 overflow-hidden">
        {/* Stats Grid - شبكة مرنة للودجات */}
        <div className="grid grid-cols-6 gap-3 overflow-hidden">
          {/* السعر */}
          <div className="col-span-2">
            <EditableWidget
              icon={<DollarSign className={`w-3.5 h-3.5 ${isMyApartment ? 'text-[#fdf5ed]' : 'text-secondary'}`} />}
              label="السعر/ليلة"
              value={apartment.price}
              suffix={currencySymbol}
              isEditable={canEdit}
              onSave={(v) => handleUpdateValue('price', v)}
              isDark={isMyApartment}
            />
          </div>

          {/* غرف النوم */}
          <div className="col-span-2">
            <EditableWidget
              icon={<Home className={`w-3.5 h-3.5 ${isMyApartment ? 'text-[#fdf5ed]' : 'text-secondary'}`} />}
              label="غرف النوم"
              value={apartment.rooms}
              suffix="غرف"
              isEditable={canEdit}
              onSave={(v) => handleUpdateValue('rooms', v)}
              isDark={isMyApartment}
            />
          </div>

          {/* الضيوف */}
          <div className="col-span-2">
            <EditableWidget
              icon={<Users className={`w-3.5 h-3.5 ${isMyApartment ? 'text-[#fdf5ed]' : 'text-secondary'}`} />}
              label="الضيوف"
              value={apartment.guests || 0}
              suffix="ضيف"
              isEditable={canEdit}
              onSave={(v) => handleUpdateValue('guests', v)}
              isDark={isMyApartment}
            />
          </div>

          {/* الأسرّة */}
          <div className="col-span-2">
            <EditableWidget
              icon={<Bed className={`w-3.5 h-3.5 ${isMyApartment ? 'text-[#fdf5ed]' : 'text-secondary'}`} />}
              label="الأسرّة"
              value={apartment.beds || 0}
              suffix="سرير"
              isEditable={canEdit}
              onSave={(v) => handleUpdateValue('beds', v)}
              isDark={isMyApartment}
            />
          </div>

          {/* الحمامات */}
          <div className="col-span-2">
            <EditableWidget
              icon={<Bath className={`w-3.5 h-3.5 ${isMyApartment ? 'text-[#fdf5ed]' : 'text-secondary'}`} />}
              label="الحمامات"
              value={apartment.bathrooms || 0}
              suffix="حمام"
              isEditable={canEdit}
              onSave={(v) => handleUpdateValue('bathrooms', v)}
              isDark={isMyApartment}
            />
          </div>

          {/* التقييم */}
          <div className="col-span-2">
            <EditableWidget
              icon={<Star className={`w-3.5 h-3.5 ${isMyApartment ? 'text-[#fdf5ed]' : 'text-secondary'}`} />}
              label="التقييم"
              value={apartment.rating ? apartment.rating.toFixed(1) : 0}
              suffix={apartment.reviewsCount ? `(${apartment.reviewsCount})` : '/ 5'}
              isEditable={canEdit}
              onSave={(v) => handleUpdateValue('rating', v)}
              isDark={isMyApartment}
            />
          </div>

          {/* نسبة الإشغال - أعرض */}
          <div className="col-span-3">
            <EditableWidget
              icon={<Percent className={`w-3.5 h-3.5 ${isMyApartment ? 'text-[#fdf5ed]' : 'text-secondary'}`} />}
              label="نسبة الإشغال"
              value={apartment.occupancy || 0}
              suffix="%"
              isEditable={canEdit}
              onSave={(v) => handleUpdateValue('occupancy', Math.min(100, Math.max(0, v)))}
              isDark={isMyApartment}
            />
          </div>

          {/* العوائد السنوية - محسوبة تلقائياً */}
          <div className="col-span-3">
            <EditableWidget
              icon={<Wallet className={`w-3.5 h-3.5 ${isMyApartment ? 'text-[#fdf5ed]' : 'text-secondary'}`} />}
              label="العوائد السنوية"
              value={Math.round(365 * ((apartment.occupancy || 0) / 100) * (apartment.price || 0))}
              suffix={currencySymbol}
              isEditable={false}
              isDark={isMyApartment}
            />
          </div>
        </div>

        {/* المميزات */}
        {apartment.features.length > 0 && (
          <div 
            className={`p-3 rounded-xl border-2 ${
              isMyApartment 
                ? 'border-secondary/40' 
                : 'bg-primary/20 border-primary/30'
            }`}
            style={{ 
              boxShadow: isMyApartment ? 'rgba(16, 48, 43, 0.3) 0px 4px 12px' : 'rgba(237, 191, 140, 0.3) 0px 4px 12px',
              backgroundColor: isMyApartment ? '#164138' : undefined,
            }}
          >
            <div className={`flex items-center gap-2 mb-2 ${isMyApartment ? 'text-[#fdf5ed]/70' : 'text-secondary/70'}`}>
              <div 
                className={`w-6 h-6 rounded-lg flex items-center justify-center border ${isMyApartment ? 'border-secondary/60' : 'bg-primary/30 border-primary/40'}`}
                style={{ backgroundColor: isMyApartment ? '#0d2622' : undefined }}
              >
                <Star className={`w-3.5 h-3.5 ${isMyApartment ? 'text-[#fdf5ed]' : 'text-secondary'}`} />
              </div>
              <span className="text-xs font-bold font-dubai">المميزات</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {apartment.features.map((feature, i) => (
                <span 
                  key={i}
                  className={`px-2 py-1 text-xs rounded-lg border-2 font-dubai ${
                    isMyApartment 
                      ? 'text-[#fdf5ed] border-secondary/40' 
                      : 'bg-white text-secondary border-primary/30'
                  }`}
                  style={{ 
                    boxShadow: isMyApartment ? 'rgba(16, 48, 43, 0.3) 0px 4px 12px' : 'rgba(237, 191, 140, 0.3) 0px 4px 12px',
                    backgroundColor: isMyApartment ? '#0d2622' : undefined,
                  }}
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* الوصف - يظهر فقط إذا كان هناك وصف أو في وضع التحرير */}
        {(isEditing || apartment.description) && (
          <div 
            className={`rounded-xl p-3 border-2 ${
              isMyApartment 
                ? 'border-secondary/40' 
                : 'bg-primary/20 border-primary/30'
            }`}
            style={{ 
              boxShadow: isMyApartment ? 'rgba(16, 48, 43, 0.3) 0px 4px 12px' : 'rgba(237, 191, 140, 0.3) 0px 4px 12px',
              backgroundColor: isMyApartment ? '#164138' : undefined,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`flex items-center gap-2 ${isMyApartment ? 'text-[#fdf5ed]/70' : 'text-secondary/70'}`}>
                <div 
                  className={`w-6 h-6 rounded-lg flex items-center justify-center border ${isMyApartment ? 'border-secondary/60' : 'bg-primary/30 border-primary/40'}`}
                  style={{ backgroundColor: isMyApartment ? '#0d2622' : undefined }}
                >
                  <FileText className={`w-3.5 h-3.5 ${isMyApartment ? 'text-[#fdf5ed]' : 'text-secondary'}`} />
                </div>
                <span className="text-xs font-bold font-dubai">وصف إضافي</span>
              </div>
              {isEditing && !editingDescription && (
                <button
                  onClick={() => setEditingDescription(true)}
                  className={`p-1.5 rounded-lg transition-colors border ${isMyApartment ? 'hover:bg-secondary/50 border-secondary/60' : 'bg-primary/30 hover:bg-primary/40 border-primary/40'}`}
                  style={{ 
                    boxShadow: isMyApartment ? 'rgba(16, 48, 43, 0.3) 0px 4px 12px' : 'rgba(237, 191, 140, 0.3) 0px 4px 12px',
                    backgroundColor: isMyApartment ? '#0d2622' : undefined,
                  }}
                >
                  <Edit3 className={`w-4 h-4 ${isMyApartment ? 'text-[#fdf5ed]' : 'text-secondary'}`} />
                </button>
              )}
            </div>
            
            {editingDescription ? (
              <div className="space-y-2">
                <textarea
                  value={localDescription}
                  onChange={(e) => setLocalDescription(e.target.value)}
                  placeholder="أضف وصفاً للشقة..."
                  className={`w-full h-24 border-2 rounded-lg p-2 text-sm font-dubai focus:outline-none resize-none ${
                    isMyApartment 
                      ? 'bg-secondary/30 border-secondary/40 text-[#fdf5ed] placeholder:text-[#fdf5ed]/40 focus:border-secondary/70' 
                      : 'bg-accent/30 border-primary/20 text-secondary placeholder:text-secondary/40 focus:border-primary'
                  }`}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveDescription}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1 font-dubai border-2 ${
                      isMyApartment
                        ? 'bg-secondary text-[#fdf5ed] border-secondary/50 hover:bg-secondary/80'
                        : 'bg-primary text-secondary border-primary/50 hover:bg-primary/80'
                    }`}
                    style={{ boxShadow: isMyApartment ? 'rgba(16, 48, 43, 0.4) 0px 4px 16px' : SHADOWS.button }}
                  >
                    <Check className="w-3 h-3" />
                    حفظ
                  </button>
                  <button
                    onClick={() => {
                      setEditingDescription(false);
                      setLocalDescription(apartment.description || '');
                    }}
                    className={`px-3 py-1.5 text-xs rounded-lg font-dubai border-2 ${
                      isMyApartment
                        ? 'bg-secondary/30 text-[#fdf5ed] border-secondary/40 hover:bg-secondary/40'
                        : 'bg-accent/50 text-secondary border-primary/20 hover:bg-accent/60'
                    }`}
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            ) : (
              <p className={`text-sm font-dubai leading-relaxed ${isMyApartment ? 'text-[#fdf5ed]/70' : 'text-secondary/60'}`}>
                {apartment.description}
              </p>
            )}
          </div>
        )}

        {/* الصور - يظهر فقط إذا كان هناك صور أو في وضع التحرير */}
        {(isEditing || (apartment.images && apartment.images.length > 0)) && (
          <div 
            className={`rounded-xl p-3 border-2 ${
              isMyApartment 
                ? 'border-secondary/40' 
                : 'bg-primary/20 border-primary/30'
            }`}
            style={{ 
              boxShadow: isMyApartment ? 'rgba(16, 48, 43, 0.3) 0px 4px 12px' : 'rgba(237, 191, 140, 0.3) 0px 4px 12px',
              backgroundColor: isMyApartment ? '#164138' : undefined,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`flex items-center gap-2 ${isMyApartment ? 'text-[#fdf5ed]/70' : 'text-secondary/70'}`}>
                <div 
                  className={`w-6 h-6 rounded-lg flex items-center justify-center border ${isMyApartment ? 'border-secondary/60' : 'bg-primary/30 border-primary/40'}`}
                  style={{ backgroundColor: isMyApartment ? '#0d2622' : undefined }}
                >
                  <ImagePlus className={`w-3.5 h-3.5 ${isMyApartment ? 'text-[#fdf5ed]' : 'text-secondary'}`} />
                </div>
                <span className="text-xs font-bold font-dubai">صور الشقة ({(apartment.images || []).length}/4)</span>
              </div>
              {isEditing && (apartment.images || []).length < 4 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`px-2 py-1 text-xs rounded-lg flex items-center gap-1 transition-colors font-dubai border-2 ${
                    isMyApartment 
                      ? 'text-[#fdf5ed] hover:bg-secondary/50 border-secondary/60' 
                      : 'bg-primary/30 text-secondary hover:bg-primary/40 border-primary/40'
                  }`}
                  style={{ 
                    boxShadow: isMyApartment ? 'rgba(16, 48, 43, 0.3) 0px 4px 12px' : 'rgba(237, 191, 140, 0.3) 0px 4px 12px',
                    backgroundColor: isMyApartment ? '#0d2622' : undefined,
                  }}
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
              style={{ display: 'none' }}
            />

            {(apartment.images || []).length > 0 ? (
              <>
                <div className="grid grid-cols-4 gap-2">
                  {(apartment.images || []).map((img, i) => (
                    <div 
                      key={i} 
                      className={`relative aspect-square group/img rounded-lg overflow-hidden border-2 cursor-pointer transition-[border-color] duration-200 ${
                        expandedImageIndex !== null && expandedImageIndex !== i ? 'opacity-30' : ''
                      } ${isMyApartment ? 'border-secondary/60 hover:border-secondary' : 'border-primary/40 hover:border-primary'}`}
                      style={{ 
                        boxShadow: isMyApartment ? 'rgba(16, 48, 43, 0.3) 0px 4px 12px' : 'rgba(237, 191, 140, 0.3) 0px 4px 12px',
                      }}
                      onClick={() => {
                        setExpandedImageIndex(expandedImageIndex === i ? null : i);
                      }}
                    >
                      {/* استخدام img العادي لجميع الصور لتجنب مشاكل Next.js Image */}
                      <img
                        src={img}
                        alt={`صورة ${i + 1}`}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      {isEditing && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveImage(i);
                          }}
                          className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity border-2 ${
                            isMyApartment ? 'bg-secondary/80 text-[#fdf5ed] border-secondary' : 'bg-primary/80 text-secondary border-primary'
                          }`}
                          style={{ boxShadow: isMyApartment ? 'rgba(16, 48, 43, 0.3) 0px 4px 12px' : 'rgba(237, 191, 140, 0.3) 0px 4px 12px' }}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* خلفية ضبابية عند التكبير */}
                {expandedImageIndex !== null && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`absolute inset-0 backdrop-blur-sm z-40 ${isMyApartment ? 'bg-secondary/60' : 'bg-white/60'}`}
                    onClick={() => setExpandedImageIndex(null)}
                  />
                )}
                
                {/* الصورة المكبرة في مركز البطاقة */}
                {expandedImageIndex !== null && apartment.images && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className={`absolute inset-0 m-auto w-[85%] aspect-square rounded-lg overflow-hidden border-2 cursor-pointer z-50 ${isMyApartment ? 'border-secondary/60' : 'border-primary/40'}`}
                    style={{ 
                      boxShadow: isMyApartment ? 'rgba(16, 48, 43, 0.6) 0px 16px 48px' : 'rgba(237, 191, 140, 0.6) 0px 16px 48px',
                    }}
                    onClick={() => setExpandedImageIndex(null)}
                  >
                    {/* استخدام img العادي لجميع الصور */}
                    <img
                      src={apartment.images[expandedImageIndex]}
                      alt={`صورة ${expandedImageIndex + 1}`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </motion.div>
                )}
              </>
            ) : isEditing && (
              <div className={`h-16 flex items-center justify-center text-xs font-dubai rounded-lg border-2 border-dashed ${
                isMyApartment 
                  ? 'text-[#fdf5ed]/50 border-secondary/40' 
                  : 'text-secondary/40 bg-primary/10 border-primary/30'
              }`}
              style={{ backgroundColor: isMyApartment ? '#164138' : undefined }}
              >
                انقر على "إضافة" لرفع الصور
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default function NearbyApartmentsSlide({
  data = defaultData,
  mapData,
  isEditing = false,
  onUpdate,
  onUpdateMapData,
}: NearbyApartmentsSlideProps) {
  const { currencySymbol } = useCurrencyFormatter();
  
  // دمج الشقق من mapData مع البيانات المحفوظة في data.apartments
  const apartments = useMemo(() => {
    if (mapData?.pins && mapData.pins.length > 0) {
      // إرجاع كل الشقق من الخريطة مع دمج البيانات المحفوظة
      return mapData.pins
        .filter(pin => pin.apartment) // تصفية الـ pins التي ليس لديها apartment
        .map(pin => {
          // البحث عن بيانات محفوظة لهذه الشقة
          const savedApartment = data.apartments.find(a => a.id === pin.apartment.id);
          return {
            ...pin.apartment,
            // دمج الصور والوصف والصورة المصغرة من البيانات المحفوظة
            images: savedApartment?.images || pin.apartment.images || [],
            description: savedApartment?.description || pin.apartment.description || '',
            thumbnailUrl: savedApartment?.thumbnailUrl || pin.apartment.thumbnailUrl || '',
            // دمج باقي البيانات القابلة للتعديل
            price: savedApartment?.price ?? pin.apartment.price ?? 0,
            rooms: savedApartment?.rooms ?? pin.apartment.rooms ?? 0,
            guests: savedApartment?.guests ?? pin.apartment.guests ?? 0,
            beds: savedApartment?.beds ?? pin.apartment.beds ?? 0,
            bathrooms: savedApartment?.bathrooms ?? pin.apartment.bathrooms ?? 0,
            rating: savedApartment?.rating ?? pin.apartment.rating ?? 0,
            occupancy: savedApartment?.occupancy ?? pin.apartment.occupancy ?? 0,
            annualRevenue: savedApartment?.annualRevenue ?? pin.apartment.annualRevenue ?? 0,
            // الحفاظ على الخصائص الأصلية المهمة
            airbnbUrl: pin.apartment.airbnbUrl,
            isClientApartment: pin.apartment.isClientApartment,
          };
        });
    }
    return data.apartments;
  }, [mapData?.pins, data.apartments]);

  const [localData, setLocalData] = useState<Record<string, { description?: string; images?: string[] }>>({});

  // حالة تعديل نص المعالم
  const [editingLandmarks, setEditingLandmarks] = useState(false);
  const [customLandmarksText, setCustomLandmarksText] = useState('');

  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  const onUpdateMapDataRef = useRef(onUpdateMapData);
  onUpdateMapDataRef.current = onUpdateMapData;

  const handleUpdateDescription = (id: string, description: string) => {
    setLocalData(prev => ({
      ...prev,
      [id]: { ...prev[id], description }
    }));
  };

  const handleUpdateImages = (id: string, images: string[]) => {
    setLocalData(prev => ({
      ...prev,
      [id]: { ...prev[id], images }
    }));
  };

  const handleUpdateApartment = (id: string, updates: Partial<NearbyApartment>) => {
    setLocalData(prev => ({
      ...prev,
      [id]: { ...prev[id], ...updates }
    }));
  };

  const mergedApartments = useMemo(() => {
    const merged = apartments.map(apt => ({
      ...apt,
      description: localData[apt.id]?.description ?? apt.description,
      images: localData[apt.id]?.images ?? apt.images,
      price: (localData[apt.id] as any)?.price ?? apt.price,
      rooms: (localData[apt.id] as any)?.rooms ?? apt.rooms,
      guests: (localData[apt.id] as any)?.guests ?? apt.guests,
      beds: (localData[apt.id] as any)?.beds ?? apt.beds,
      bathrooms: (localData[apt.id] as any)?.bathrooms ?? apt.bathrooms,
      rating: (localData[apt.id] as any)?.rating ?? apt.rating,
      thumbnailUrl: (localData[apt.id] as any)?.thumbnailUrl ?? apt.thumbnailUrl,
      occupancy: (localData[apt.id] as any)?.occupancy ?? apt.occupancy,
      annualRevenue: (localData[apt.id] as any)?.annualRevenue ?? apt.annualRevenue,
      // الحفاظ على الخصائص الأصلية
      airbnbUrl: apt.airbnbUrl,
      isClientApartment: apt.isClientApartment,
    }));
    
    // ترتيب الشقق: شقة العميل أولاً دائماً
    return merged.sort((a, b) => {
      if (a.isClientApartment && !b.isClientApartment) return -1;
      if (!a.isClientApartment && b.isClientApartment) return 1;
      return 0;
    });
  }, [apartments, localData]);

  // حفظ التغييرات تلقائياً عند تعديل localData
  // نستخدم JSON.stringify لتتبع كل التغييرات في القيم وليس المفاتيح فقط
  const localDataString = JSON.stringify(localData);
  useEffect(() => {
    // التحقق من وجود بيانات محلية للحفظ
    if (Object.keys(localData).length === 0) return;
    if (!onUpdateRef.current) return;
    
    // إنشاء البيانات المدمجة داخل useEffect لتجنب الحلقة
    const updatedApartments = apartments.map(apt => ({
      ...apt,
      description: localData[apt.id]?.description ?? apt.description,
      images: localData[apt.id]?.images ?? apt.images,
      price: (localData[apt.id] as any)?.price ?? apt.price,
      rooms: (localData[apt.id] as any)?.rooms ?? apt.rooms,
      guests: (localData[apt.id] as any)?.guests ?? apt.guests,
      beds: (localData[apt.id] as any)?.beds ?? apt.beds,
      bathrooms: (localData[apt.id] as any)?.bathrooms ?? apt.bathrooms,
      rating: (localData[apt.id] as any)?.rating ?? apt.rating,
      thumbnailUrl: (localData[apt.id] as any)?.thumbnailUrl ?? apt.thumbnailUrl,
      occupancy: (localData[apt.id] as any)?.occupancy ?? apt.occupancy,
      annualRevenue: (localData[apt.id] as any)?.annualRevenue ?? apt.annualRevenue,
      // الحفاظ على الخصائص الأصلية
      airbnbUrl: apt.airbnbUrl,
      isClientApartment: apt.isClientApartment,
    }));
    
    onUpdateRef.current({
      apartments: updatedApartments,
      showFromMap: data.showFromMap,
    });

    // تحديث بيانات الخريطة أيضاً لتنعكس التغييرات على الـ pins
    if (onUpdateMapDataRef.current && mapData) {
      const updatedPins = mapData.pins.map(pin => {
        if (!pin.apartment) return pin;
        const updates = localData[pin.apartment.id];
        if (!updates) return pin;
        
        return {
          ...pin,
          apartment: {
            ...pin.apartment,
            description: (updates as any)?.description ?? pin.apartment.description,
            images: (updates as any)?.images ?? pin.apartment.images,
            price: (updates as any)?.price ?? pin.apartment.price,
            rooms: (updates as any)?.rooms ?? pin.apartment.rooms,
            guests: (updates as any)?.guests ?? pin.apartment.guests,
            beds: (updates as any)?.beds ?? pin.apartment.beds,
            bathrooms: (updates as any)?.bathrooms ?? pin.apartment.bathrooms,
            rating: (updates as any)?.rating ?? pin.apartment.rating,
            thumbnailUrl: (updates as any)?.thumbnailUrl ?? pin.apartment.thumbnailUrl,
            occupancy: (updates as any)?.occupancy ?? pin.apartment.occupancy,
            annualRevenue: (updates as any)?.annualRevenue ?? pin.apartment.annualRevenue,
          },
        };
      });
      
      onUpdateMapDataRef.current({
        ...mapData,
        pins: updatedPins,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localDataString]);

  // حساب أقرب المعالم مع التنوع في التصنيفات
  const nearestLandmarks = useMemo(() => {
    if (!mapData?.pins || mapData.pins.length === 0) return [];
    
    // استخدام موقع شقة العميل (البحث بخاصية isClientApartment أو أول pin كـ fallback)
    const clientPin = mapData.pins.find(p => p.apartment?.isClientApartment === true) || mapData.pins[0];
    if (!clientPin) return [];
    
    // حساب المسافة لكل معلم
    const landmarksWithDistance = LANDMARKS.map(landmark => ({
      ...landmark,
      distance: calculateDistance(
        clientPin.lat,
        clientPin.lng,
        landmark.lat,
        landmark.lng
      )
    }))
    // استبعاد المعالم البعيدة جداً (أكثر من 30 كم)
    .filter(l => l.distance <= 30)
    // ترتيب حسب المسافة
    .sort((a, b) => a.distance - b.distance);
    
    // اختيار 3 معالم متنوعة التصنيف
    const selected: typeof landmarksWithDistance = [];
    const usedCategories = new Set<LandmarkCategory>();
    
    // أولاً: التحقق من القرب من النيل (أقل من 1 كم)
    const nearbyRiver = landmarksWithDistance.find(l => 
      l.name.includes('نهر النيل') && l.distance < 1.0
    );
    
    if (nearbyRiver) {
      // إذا كانت قريبة من النيل، اعرض ذلك كأول معلم
      selected.push(nearbyRiver);
      usedCategories.add(nearbyRiver.category);
    } else {
      // وإلا اختر أقرب معلم
      if (landmarksWithDistance.length > 0) {
        const nearest = landmarksWithDistance[0];
        selected.push(nearest);
        usedCategories.add(nearest.category);
      }
    }
    
    // ثانياً: اختر معلمين آخرين من تصنيفات مختلفة
    for (const landmark of landmarksWithDistance) {
      if (selected.length >= 3) break;
      // تخطى معالم النيل الأخرى إذا كان واحد منها موجود بالفعل
      if (landmark.name.includes('نهر النيل') && selected.some(s => s.name.includes('نهر النيل'))) {
        continue;
      }
      if (!usedCategories.has(landmark.category)) {
        selected.push(landmark);
        usedCategories.add(landmark.category);
      }
    }
    
    // إذا لم نجد 3 تصنيفات مختلفة، أكمل بأقرب المتاحين
    if (selected.length < 3) {
      for (const landmark of landmarksWithDistance) {
        if (selected.length >= 3) break;
        if (!selected.includes(landmark) && !landmark.name.includes('نهر النيل')) {
          selected.push(landmark);
        }
      }
    }
    
    // ترتيب النتائج حسب المسافة
    return selected.sort((a, b) => a.distance - b.distance);
  }, [mapData?.pins]);

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
          <div className="absolute -top-8 -left-8 opacity-[0.08] pointer-events-none">
            <Building2 className="w-56 h-56 text-primary" strokeWidth={1.5} />
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
                <EditableSectionTitle
                  title="الشقق المحيطة"
                  subtitle="مقارنة تفصيلية للشقق في منطقتك"
                  isEditing={isEditing}
                />
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
              {(() => {
                // استبعاد شقة العميل من حساب المتوسط
                const otherApartmentsForAvg = mergedApartments.filter(a => !a.isClientApartment);
                if (otherApartmentsForAvg.length === 0) return null;
                return (
                  <div 
                    className="text-center px-4 py-2 bg-primary/20 rounded-xl border-2 border-primary/30"
                    style={{ boxShadow: SHADOWS.icon }}
                  >
                    <span className="block text-xl font-bold text-secondary font-bristone">
                      {Math.round(
                        otherApartmentsForAvg.reduce((sum, a) => sum + a.price, 0) / otherApartmentsForAvg.length
                      ).toLocaleString('ar-EG')}
                    </span>
                    <span className="text-xs text-secondary/60 font-dubai">متوسط إيجار المحيطة</span>
                  </div>
                );
              })()}
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

        {/* أقرب المعالم */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-primary/20 rounded-xl p-4 border-2 border-primary/30 flex items-center gap-4"
          style={{ boxShadow: 'rgba(237, 191, 140, 0.3) 0px 4px 12px' }}
        >
          <span className="w-1 h-5 bg-primary rounded-full shrink-0"></span>
          <div className="flex items-center justify-between gap-3 flex-1">
            {editingLandmarks ? (
              <input
                type="text"
                value={customLandmarksText}
                onChange={(e) => setCustomLandmarksText(e.target.value)}
                onBlur={() => setEditingLandmarks(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') setEditingLandmarks(false);
                  if (e.key === 'Escape') {
                    setCustomLandmarksText('');
                    setEditingLandmarks(false);
                  }
                }}
                placeholder="أضف وصفاً للمعالم والأماكن المميزة في المنطقة..."
                className="flex-1 bg-transparent text-secondary text-sm font-dubai focus:outline-none placeholder:text-secondary/40"
                autoFocus
              />
            ) : (
              <p className="text-secondary text-sm font-dubai leading-relaxed flex-1">
                {customLandmarksText ? (
                  <span>{customLandmarksText}</span>
                ) : nearestLandmarks.length > 0 ? (
                  <>
                    <span className="font-bold">أقرب المعالم:</span>{' '}
                    {nearestLandmarks[0].name.includes('نهر النيل') && nearestLandmarks[0].distance < 1.0 ? (
                      <>
                        {nearestLandmarks[0].distance < 0.3 ? (
                          <span>تقع هذه المنطقة على ضفاف نهر النيل مباشرةً</span>
                        ) : nearestLandmarks[0].distance < 0.7 ? (
                          <span>تقع هذه المنطقة بجوار نهر النيل{' '}
                          <span style={{ color: '#9b774f' }}>
                            ({Math.round(nearestLandmarks[0].distance * 1000)} متر)
                          </span></span>
                        ) : (
                          <span>تقع هذه المنطقة قرب نهر النيل{' '}
                          <span style={{ color: '#9b774f' }}>
                            ({Math.round(nearestLandmarks[0].distance * 1000)} متر)
                          </span></span>
                        )}
                        {nearestLandmarks.length > 1 && (
                          <>, وبالقرب من {nearestLandmarks.slice(1).map((landmark, index) => (
                            <span key={landmark.name}>
                              <span className="text-secondary">{landmark.name}</span>
                              {' '}
                              <span style={{ color: '#9b774f' }}>
                                ({landmark.distance < 1 
                                  ? `${Math.round(landmark.distance * 1000)} متر` 
                                  : `${landmark.distance.toFixed(1)} كم`})
                              </span>
                              {index < nearestLandmarks.slice(1).length - 1 && (index === nearestLandmarks.slice(1).length - 2 ? ' و' : '، ')}
                            </span>
                          ))}</>
                        )}.
                      </>
                    ) : (
                      <>
                        تقع هذه المنطقة بالقرب من {nearestLandmarks.map((landmark, index) => (
                          <span key={landmark.name}>
                            <span className="text-secondary">{landmark.name}</span>
                            {' '}
                            <span style={{ color: '#9b774f' }}>
                              ({landmark.distance < 1 
                                ? `${Math.round(landmark.distance * 1000)} متر` 
                                : `${landmark.distance.toFixed(1)} كم`})
                            </span>
                            {index < nearestLandmarks.length - 1 && (index === nearestLandmarks.length - 2 ? ' و' : '، ')}
                          </span>
                        ))}.
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <span className="font-bold">معالم المنطقة:</span> لم يتم اكتشاف معالم قريبة تلقائياً. يُرجى إضافة أقرب الأماكن العامة التي تتميز بها المنطقة مثل المولات، المدارس، المستشفيات، أو أي معالم مميزة.
                  </>
                )}
              </p>
            )}
            {isEditing && !editingLandmarks && (
              <button
                onClick={() => {
                  setEditingLandmarks(true);
                  setCustomLandmarksText('');
                }}
                className="p-1.5 bg-primary/30 hover:bg-primary/40 rounded-lg transition-colors border border-primary/40 shrink-0"
                style={{ boxShadow: 'rgba(237, 191, 140, 0.3) 0px 4px 12px' }}
              >
                <Edit3 className="w-3.5 h-3.5 text-secondary" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Apartments Grid - نظام أعمدة مستقلة لضمان ارتفاعات مختلفة */}
        {mergedApartments.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col lg:flex-row gap-6 w-full overflow-hidden"
          >
            {/* العمود الأيمن */}
            <div className="flex-1 min-w-0 flex flex-col gap-6">
              {mergedApartments
                .filter((_, index) => index % 2 === 0)
                .map((apartment) => {
                  const originalIndex = mergedApartments.findIndex(a => a.id === apartment.id);
                  return (
                    <ApartmentCardComponent
                      key={apartment.id}
                      apartment={apartment}
                      index={originalIndex}
                      isEditing={isEditing}
                      isMyApartment={apartment.isClientApartment === true}
                      onUpdateDescription={handleUpdateDescription}
                      onUpdateImages={handleUpdateImages}
                      onUpdateApartment={handleUpdateApartment}
                    />
                  );
                })}
            </div>
            {/* العمود الأيسر */}
            <div className="flex-1 min-w-0 flex flex-col gap-6">
              {mergedApartments
                .filter((_, index) => index % 2 === 1)
                .map((apartment) => {
                  const originalIndex = mergedApartments.findIndex(a => a.id === apartment.id);
                  return (
                    <ApartmentCardComponent
                      key={apartment.id}
                      apartment={apartment}
                      index={originalIndex}
                      isEditing={isEditing}
                      isMyApartment={apartment.isClientApartment === true}
                      onUpdateDescription={handleUpdateDescription}
                      onUpdateImages={handleUpdateImages}
                      onUpdateApartment={handleUpdateApartment}
                    />
                  );
                })}
            </div>
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
                  <MapPin className="w-16 h-16 text-primary" strokeWidth={1.5} />
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
                <div className="text-sm text-secondary/60 font-dubai mt-1">أقل إيجار ({currencySymbol})</div>
              </div>
              <div 
                className="text-center p-4 bg-primary/20 rounded-xl border-2 border-primary/30"
                style={{ boxShadow: 'rgba(237, 191, 140, 0.3) 0px 4px 12px' }}
              >
                <div className="text-3xl font-bold text-secondary font-bristone">
                  {Math.max(...mergedApartments.map(a => a.price)).toLocaleString('ar-EG')}
                </div>
                <div className="text-sm text-secondary/60 font-dubai mt-1">أعلى إيجار ({currencySymbol})</div>
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
                <div className="text-sm text-secondary/60 font-dubai mt-1">المتوسط ({currencySymbol})</div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
