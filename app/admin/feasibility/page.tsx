'use client';

/**
 * صفحة دراسات الجدوى - تصميم موحد
 * 
 * - قائمة موحدة تجمع الطلبات والدراسات
 * - الطلبات الجديدة تظهر أولاً
 * - نفس الخصائص: معاينة/تعديل/حذف
 */

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  FileText, 
  Calendar, 
  MoreVertical, 
  Loader2, 
  RefreshCw, 
  Trash2, 
  Eye, 
  AlertCircle, 
  DollarSign, 
  Bed, 
  Bath, 
  ChefHat, 
  Sofa,
  Search,
  MapPin,
  Phone,
  Mail,
  Home,
  CheckCircle,
  Clock,
  XCircle,
  PlayCircle,
  PenLine,
  Undo2,
  Ban,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import useCurrencyFormatter from '@/hooks/useCurrencyFormatter';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

// ============================================
// 🎨 DESIGN TOKENS
// ============================================

const SHADOWS = {
  card: 'rgba(237, 191, 140, 0.15) 0px 4px 20px',
  cardHover: 'rgba(237, 191, 140, 0.25) 0px 8px 30px',
  button: 'rgba(16, 48, 43, 0.15) 0px 4px 12px',
  icon: 'rgba(237, 191, 140, 0.3) 0px 4px 12px',
  popup: 'rgba(16, 48, 43, 0.25) 0px 25px 50px -12px',
};

// ============================================
// 📋 TYPES
// ============================================

interface Study {
  id: string;
  title: string;
  clientName: string;
  clientEmail: string | null;
  status: 'DRAFT' | 'SENT' | 'VIEWED';
  totalCost: number;
  currency?: string;
  bedrooms: number;
  livingRooms: number;
  kitchens: number;
  bathrooms: number;
  shareId: string | null;
  createdAt: string;
  updatedAt: string;
  studyType?: string;
  consultation: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
}

interface FeasibilityRequest {
  id: string;
  studyType: 'WITH_FIELD_VISIT' | 'WITHOUT_FIELD_VISIT';
  fullName: string;
  email: string;
  phone: string | null;
  propertyType: string;
  city: string;
  district: string;
  bedrooms: number;
  livingRooms: number;
  kitchens: number;
  bathrooms: number;
  latitude: number | null;
  longitude: number | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'REJECTED';
  paymentCode: string;
  createdAt: string;
  updatedAt: string;
  feasibilityStudy: {
    id: string;
    title: string;
    status: string;
    shareId?: string | null;
  } | null;
}

// نوع موحد للعناصر
type UnifiedItem = 
  | { type: 'request'; data: FeasibilityRequest }
  | { type: 'study'; data: Study };

// ============================================
// 🎯 STATUS CONFIG
// ============================================

const studyStatusConfig: Record<string, { 
  bgColor: string;
  textColor: string;
  borderColor: string;
  icon: React.ComponentType<{ className?: string }>;
}> = {
  DRAFT: { 
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-500/30',
    icon: Clock
  },
  SENT: { 
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-500/30',
    icon: PlayCircle
  },
  VIEWED: { 
    bgColor: 'bg-emerald-400/15',
    textColor: 'text-emerald-800/70',
    borderColor: 'border-emerald-600/40',
    icon: CheckCircle
  },
};

const requestStatusConfig: Record<string, { 
  bgColor: string;
  textColor: string;
  borderColor: string;
  icon: React.ComponentType<{ className?: string }>;
}> = {
  PENDING: { 
    bgColor: 'bg-orange-500/15',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-500/40',
    icon: Clock
  },
  IN_PROGRESS: { 
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-500/30',
    icon: PlayCircle
  },
  COMPLETED: { 
    bgColor: 'bg-emerald-400/15',
    textColor: 'text-emerald-800/70',
    borderColor: 'border-emerald-600/40',
    icon: CheckCircle
  },
  REJECTED: { 
    bgColor: 'bg-red-500/10',
    textColor: 'text-red-700',
    borderColor: 'border-red-500/30',
    icon: XCircle
  },
};

// propertyTypeLabels and studyTypeLabels are now provided via translations

// ============================================
// 🧩 UNIFIED CARD COMPONENT
// ============================================

interface UnifiedCardProps {
  item: UnifiedItem;
  index: number;
  onDelete: (id: string, type: 'request' | 'study') => void;
  onCreateStudy: (request: FeasibilityRequest) => void;
  onAcceptRequest: (request: FeasibilityRequest) => void;
  onRejectRequest: (request: FeasibilityRequest) => void;
  onUnrejectRequest: (request: FeasibilityRequest) => void;
  menuOpen: string | null;
  setMenuOpen: (id: string | null) => void;
  isRejectedSection?: boolean;
  currencySymbol?: string;
}

const UnifiedCard: React.FC<UnifiedCardProps> = ({ 
  item, 
  index, 
  onDelete,
  onCreateStudy,
  onAcceptRequest,
  onRejectRequest,
  onUnrejectRequest,
  menuOpen,
  setMenuOpen,
  isRejectedSection = false,
  currencySymbol = 'ج.م'
}) => {
  const t = useTranslation();
  const { language } = useLanguage();
  const propertyTypeLabels = t.admin.propertyTypes;
  const studyTypeLabelsMap = t.admin.studyTypes;
  const isRequest = item.type === 'request';
  const data = item.data;
  
  // استخراج البيانات الموحدة
  const id = data.id;
  const clientName = isRequest ? (data as FeasibilityRequest).fullName : (data as Study).clientName;
  const email = isRequest ? (data as FeasibilityRequest).email : (data as Study).clientEmail;
  const phone = isRequest ? (data as FeasibilityRequest).phone : null;
  const createdAt = data.createdAt;
  const bedrooms = isRequest ? (data as FeasibilityRequest).bedrooms : (data as Study).bedrooms;
  const livingRooms = isRequest ? (data as FeasibilityRequest).livingRooms : (data as Study).livingRooms;
  const kitchens = isRequest ? (data as FeasibilityRequest).kitchens : (data as Study).kitchens;
  const bathrooms = isRequest ? (data as FeasibilityRequest).bathrooms : (data as Study).bathrooms;
  
  // بيانات خاصة بالطلبات
  const requestData = isRequest ? data as FeasibilityRequest : null;
  const studyData = !isRequest ? data as Study : null;
  
  // العملة - استخدام العملة من الدراسة أو الافتراضية
  const itemCurrencySymbol = studyData?.currency 
    ? (studyData.currency === 'SAR' ? 'ر.س' : studyData.currency === 'USD' ? '$' : 'ج.م')
    : currencySymbol;
  
  // الحالة
  const status = isRequest 
    ? requestStatusConfig[requestData!.status] || requestStatusConfig.PENDING
    : studyStatusConfig[studyData!.status] || studyStatusConfig.DRAFT;
  const StatusIcon = status.icon;
  
  // هل لديه دراسة مرتبطة؟
  const linkedStudy = requestData?.feasibilityStudy;
  const shareId = linkedStudy?.shareId || studyData?.shareId;
  const studyId = linkedStudy?.id || studyData?.id;
  
  // نوع الدراسة
  const studyType = requestData?.studyType || studyData?.studyType;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ 
        duration: 0.4,
        delay: index * 0.05,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      whileHover={{ y: -4 }}
      className={`group relative bg-white border-2 border-primary/20 rounded-2xl overflow-visible will-change-transform ${menuOpen === id ? 'z-200' : 'z-10'}`}
      style={{ 
        boxShadow: SHADOWS.card,
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
      }}
    >
      {/* Shimmer Effect */}
      <div
        className="absolute inset-0 pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden rounded-2xl"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(237, 191, 140, 0.25) 50%, transparent 100%)',
        }}
      />

      <div className="relative p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
          {/* الأيقونة - مخفية على الموبايل */}
          <motion.div 
            className="hidden sm:flex w-14 h-14 rounded-2xl items-center justify-center border-2 shrink-0 bg-primary/20 border-primary/30"
            style={{ boxShadow: SHADOWS.icon }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <FileText className="w-7 h-7 text-secondary" strokeWidth={1.5} />
          </motion.div>

          {/* المعلومات */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
              <h3 className="font-dubai font-bold text-base sm:text-lg text-secondary truncate">
                {clientName}
              </h3>
              <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-dubai font-medium border flex items-center gap-1 sm:gap-1.5 ${status.bgColor} ${status.textColor} ${status.borderColor}`}>
                <StatusIcon className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                {isRequest 
                  ? (t.admin.requestStatus[requestData!.status as keyof typeof t.admin.requestStatus] || requestData!.status)
                  : (t.admin.studyStatus[studyData!.status as keyof typeof t.admin.studyStatus] || studyData!.status)
                }
              </span>
              {studyType && (
                <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-dubai font-medium bg-secondary/10 text-secondary border border-secondary/20">
                  {studyTypeLabelsMap[studyType as keyof typeof studyTypeLabelsMap] || studyType}
                </span>
              )}
            </div>
            
            {/* التفاصيل */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-secondary/60 mb-2 sm:mb-3">
              {requestData?.propertyType && (
                <span className="flex items-center gap-1 sm:gap-1.5">
                  <Home className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                  {propertyTypeLabels[requestData.propertyType as keyof typeof propertyTypeLabels] || requestData.propertyType}
                </span>
              )}
              {(requestData?.city || requestData?.district) && (
                <span className="flex items-center gap-1 sm:gap-1.5">
                  <MapPin className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                  {requestData.district}، {requestData.city}
                </span>
              )}
              <span className="flex items-center gap-1 sm:gap-1.5">
                <Calendar className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                {new Date(createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
              </span>
              {studyData?.totalCost && studyData.totalCost > 0 && (
                <span className="flex items-center gap-1 sm:gap-1.5 text-primary font-medium">
                  {studyData.totalCost.toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')} {itemCurrencySymbol}
                </span>
              )}
            </div>

            {/* معلومات التواصل */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-secondary/60 mb-2 sm:mb-3">
              {email && (
                <span className="flex items-center gap-1 sm:gap-1.5">
                  <Mail className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                  <span dir="ltr" className="truncate max-w-[120px] sm:max-w-none">{email}</span>
                </span>
              )}
              {phone && (
                <span className="flex items-center gap-1 sm:gap-1.5">
                  <Phone className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                  <span dir="ltr">{phone}</span>
                </span>
              )}
            </div>

            {/* تكوين الشقة */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {bedrooms > 0 && (
                <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-secondary/5 rounded-lg text-secondary/70 text-xs">
                  <Bed className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                  <span>{bedrooms}</span>
                </div>
              )}
              {livingRooms > 0 && (
                <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-secondary/5 rounded-lg text-secondary/70 text-xs">
                  <Sofa className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                  <span>{livingRooms}</span>
                </div>
              )}
              {kitchens > 0 && (
                <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-secondary/5 rounded-lg text-secondary/70 text-xs">
                  <ChefHat className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                  <span>{kitchens}</span>
                </div>
              )}
              {bathrooms > 0 && (
                <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-secondary/5 rounded-lg text-secondary/70 text-xs">
                  <Bath className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                  <span>{bathrooms}</span>
                </div>
              )}
            </div>
          </div>

          {/* الإجراءات */}
          <div className="flex flex-wrap items-center gap-2 mt-3 sm:mt-0 justify-end sm:justify-start">
            {/* رمز الدفع للطلبات */}
            {isRequest && requestData?.paymentCode && (
              <div className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 border-2 border-amber-200 rounded-xl text-amber-800">
                <span className="text-xs font-dubai">{t.admin.feasibilityPage.paymentCode}</span>
                <span className="font-mono font-bold text-sm" dir="ltr">{requestData.paymentCode}</span>
              </div>
            )}
            
            {/* أزرار للطلبات المرفوضة */}
            {isRejectedSection && isRequest && requestData?.status === 'REJECTED' && (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => onUnrejectRequest(requestData!)}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-primary text-secondary rounded-xl font-dubai font-medium text-xs sm:text-sm transition-all hover:shadow-lg border-2 border-primary/30"
                  style={{ boxShadow: SHADOWS.button }}
                >
                  <Undo2 className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                  <span className="hidden sm:inline">{t.admin.feasibilityPage.undoReject}</span>
                  <span className="sm:hidden">{t.admin.feasibilityPage.undoShort}</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => onAcceptRequest(requestData!)}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-secondary text-accent rounded-xl font-dubai font-medium text-xs sm:text-sm transition-all hover:shadow-lg"
                  style={{ boxShadow: SHADOWS.button }}
                >
                  <CheckCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                  <span className="hidden sm:inline">{t.admin.feasibilityPage.acceptAndProceed}</span>
                  <span className="sm:hidden">{t.admin.feasibilityPage.acceptShort}</span>
                </motion.button>
              </>
            )}
            
            {/* أزرار القبول والرفض للطلبات الجديدة (PENDING) */}
            {!isRejectedSection && isRequest && !linkedStudy && requestData?.status === 'PENDING' && (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => onRejectRequest(requestData!)}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border-2 border-primary/30 text-secondary rounded-xl font-dubai font-medium text-xs sm:text-sm transition-all hover:border-primary/50 hover:shadow-lg"
                  style={{ boxShadow: SHADOWS.card }}
                >
                  <Ban className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                  {t.admin.feasibilityPage.reject}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => onAcceptRequest(requestData!)}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-secondary text-accent rounded-xl font-dubai font-medium text-xs sm:text-sm transition-all hover:shadow-lg"
                  style={{ boxShadow: SHADOWS.button }}
                >
                  <CheckCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                  {t.admin.feasibilityPage.accept}
                </motion.button>
              </>
            )}
            
            {/* زر إنشاء/تعديل الدراسة للطلبات قيد المعالجة */}
            {!isRejectedSection && isRequest && !linkedStudy && requestData?.status === 'IN_PROGRESS' && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                onClick={() => onCreateStudy(requestData!)}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-secondary text-accent rounded-xl font-dubai font-medium text-xs sm:text-sm transition-all hover:shadow-lg"
                style={{ boxShadow: SHADOWS.button }}
              >
                <Plus className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                <span className="hidden sm:inline">{t.admin.feasibilityPage.createStudy}</span>
                <span className="sm:hidden">{t.admin.feasibilityPage.createShort}</span>
              </motion.button>
            )}
            
            {/* زر تعديل الدراسة إذا كان هناك دراسة مرتبطة */}
            {!isRejectedSection && studyId && (
              <Link href={`/admin/feasibility/${studyId}`}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl border-2 bg-primary/20 border-primary/30 font-dubai font-medium text-xs sm:text-sm text-secondary transition-all"
                  style={{ boxShadow: 'rgba(237, 191, 140, 0.3) 0px 4px 12px' }}
                >
                  <PenLine className="w-3.5 sm:w-4 h-3.5 sm:h-4" strokeWidth={1.5} />
                  <span className="hidden sm:inline">{t.admin.feasibilityPage.editStudy}</span>
                  <span className="sm:hidden">{t.admin.feasibilityPage.editShort}</span>
                </motion.button>
              </Link>
            )}

            {/* قائمة المزيد */}
            <div className="relative">
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setMenuOpen(menuOpen === id ? null : id)}
                className="p-2.5 hover:bg-primary/10 rounded-xl transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-secondary/60" />
              </motion.button>
              
              <AnimatePresence>
                {menuOpen === id && (
                  <>
                    <div 
                      className="fixed inset-0 z-150"
                      onClick={() => setMenuOpen(null)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 top-full mt-2 bg-white rounded-2xl border-2 border-primary/20 py-3 z-160 min-w-40 overflow-hidden"
                      style={{ boxShadow: SHADOWS.popup }}
                    >
                      {/* معاينة */}
                      {shareId && (
                        <button
                          onClick={() => {
                            window.open(`/study/${shareId}`, '_blank');
                            setMenuOpen(null);
                          }}
                          className="w-[calc(100%-16px)] flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl text-sm text-secondary hover:bg-primary/10 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          {t.admin.preview}
                        </button>
                      )}
                      
                      {/* فتح الموقع */}
                      {requestData?.latitude && requestData?.longitude && (
                        <button
                          onClick={() => {
                            window.open(`https://www.google.com/maps?q=${requestData.latitude},${requestData.longitude}`, '_blank');
                            setMenuOpen(null);
                          }}
                          className="w-[calc(100%-16px)] flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl text-sm text-secondary hover:bg-primary/10 transition-colors"
                        >
                          <MapPin className="w-4 h-4" />
                          {t.admin.openLocation}
                        </button>
                      )}
                      
                      {/* حذف */}
                      <button
                        onClick={() => {
                          onDelete(id, item.type);
                          setMenuOpen(null);
                        }}
                        className="w-[calc(100%-16px)] flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        {t.admin.delete}
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// 🚀 MAIN COMPONENT
// ============================================

export default function FeasibilityStudiesPage() {
  const { currencySymbol } = useCurrencyFormatter();
  const t = useTranslation();
  const { language } = useLanguage();
  const [studies, setStudies] = useState<Study[]>([]);
  const [requests, setRequests] = useState<FeasibilityRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRejected, setShowRejected] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // جلب البيانات
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const [studiesRes, requestsRes] = await Promise.all([
        fetch('/api/admin/feasibility?page=1&limit=100'),
        fetch('/api/admin/feasibility-requests?page=1&limit=100')
      ]);
      
      const studiesData = await studiesRes.json();
      const requestsData = await requestsRes.json();
      
      if (!studiesRes.ok) throw new Error(studiesData.error);
      if (!requestsRes.ok) throw new Error(requestsData.error);
      
      setStudies(studiesData.studies || []);
      setRequests(requestsData.requests || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.admin.errorFetchingData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // دمج البيانات وترتيبها (باستثناء المرفوضة)
  const unifiedItems = React.useMemo<UnifiedItem[]>(() => {
    const items: UnifiedItem[] = [];
    
    // الحصول على IDs الدراسات المرتبطة بالطلبات
    const linkedStudyIds = new Set(
      requests
        .filter(r => r.feasibilityStudy)
        .map(r => r.feasibilityStudy!.id)
    );
    
    // إضافة الطلبات (التي ليس لها دراسة أولاً، ثم التي لها دراسة) - باستثناء المرفوضة
    const pendingRequests = requests.filter(r => !r.feasibilityStudy && r.status !== 'REJECTED');
    const linkedRequests = requests.filter(r => r.feasibilityStudy && r.status !== 'REJECTED');
    
    pendingRequests.forEach(r => items.push({ type: 'request', data: r }));
    linkedRequests.forEach(r => items.push({ type: 'request', data: r }));
    
    // إضافة الدراسات التي ليس لها طلب مرتبط
    studies
      .filter(s => !linkedStudyIds.has(s.id))
      .forEach(s => items.push({ type: 'study', data: s }));
    
    return items;
  }, [studies, requests]);

  // الطلبات المرفوضة
  const rejectedItems = React.useMemo<UnifiedItem[]>(() => {
    return requests
      .filter(r => r.status === 'REJECTED')
      .map(r => ({ type: 'request' as const, data: r }));
  }, [requests]);

  // فلترة حسب البحث
  const filteredItems = unifiedItems.filter(item => {
    const query = searchQuery.toLowerCase();
    if (item.type === 'request') {
      const r = item.data as FeasibilityRequest;
      return r.fullName.toLowerCase().includes(query) ||
             r.email.toLowerCase().includes(query) ||
             r.city.toLowerCase().includes(query) ||
             r.district.toLowerCase().includes(query);
    } else {
      const s = item.data as Study;
      return s.clientName.toLowerCase().includes(query) ||
             (s.clientEmail?.toLowerCase().includes(query) || false);
    }
  });

  // عدد الطلبات الجديدة
  const newRequestsCount = requests.filter(r => !r.feasibilityStudy && r.status === 'PENDING').length;
  
  // عدد الطلبات المرفوضة
  const rejectedCount = rejectedItems.length;

  // حذف عنصر
  const handleDelete = async (id: string, type: 'request' | 'study') => {
    try {
      const endpoint = type === 'request' 
        ? `/api/admin/feasibility-requests/${id}`
        : `/api/admin/feasibility/${id}`;
      
      const response = await fetch(endpoint, { method: 'DELETE' });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }
      
      fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : t.admin.errorOccurred);
    }
    setMenuOpen(null);
  };

  // قبول طلب (إنشاء دراسة)
  const handleAcceptRequest = async (request: FeasibilityRequest) => {
    try {
      setActionLoading(request.id);
      const response = await fetch(`/api/admin/feasibility-requests/${request.id}/accept`, {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      // الانتقال لصفحة تعديل الدراسة
      window.location.href = `/admin/feasibility/${data.study.id}`;
    } catch (err) {
      alert(err instanceof Error ? err.message : t.admin.errorOccurred);
      setActionLoading(null);
    }
  };

  // رفض طلب
  const handleRejectRequest = async (request: FeasibilityRequest) => {
    if (!confirm(t.admin.feasibilityPage.confirmReject)) return;
    
    try {
      setActionLoading(request.id);
      const response = await fetch(`/api/admin/feasibility-requests/${request.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: t.admin.feasibilityPage.rejectedByAdmin }),
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : t.admin.errorOccurred);
    } finally {
      setActionLoading(null);
    }
  };

  // التراجع عن رفض طلب
  const handleUnrejectRequest = async (request: FeasibilityRequest) => {
    try {
      setActionLoading(request.id);
      const response = await fetch(`/api/admin/feasibility-requests/${request.id}/unreject`, {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : t.admin.errorOccurred);
    } finally {
      setActionLoading(null);
    }
  };

  // إنشاء دراسة من طلب
  const handleCreateStudyFromRequest = async (request: FeasibilityRequest) => {
    try {
      const response = await fetch('/api/admin/feasibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: request.fullName,
          clientEmail: request.email,
          clientPhone: request.phone,
          studyType: request.studyType,
          bedrooms: request.bedrooms,
          livingRooms: request.livingRooms,
          kitchens: request.kitchens,
          bathrooms: request.bathrooms,
          feasibilityRequestId: request.id,
          latitude: request.latitude,
          longitude: request.longitude,
          city: request.city,
          district: request.district,
          propertyType: request.propertyType,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      // تحديث حالة الطلب
      await fetch(`/api/admin/feasibility-requests/${request.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'IN_PROGRESS' }),
      });
      
      // الانتقال لصفحة تعديل الدراسة
      window.location.href = `/admin/feasibility/${data.study.id}`;
    } catch (err) {
      alert(err instanceof Error ? err.message : t.admin.errorOccurred);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* العنوان */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-col gap-4 will-change-transform"
          style={{ transform: 'translateZ(0)' }}
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <motion.div 
              className="w-10 h-10 sm:w-14 sm:h-14 bg-primary/20 rounded-xl sm:rounded-2xl flex items-center justify-center border-2 border-primary/30"
              style={{ boxShadow: SHADOWS.icon }}
              whileHover={{ scale: 1.05 }}
            >
              <FileText className="w-5 h-5 sm:w-7 sm:h-7 text-secondary" strokeWidth={1.5} />
            </motion.div>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-secondary font-dubai">
                {t.admin.feasibilityPage.title}
              </h1>
              <p className="text-secondary/60 text-xs sm:text-sm mt-0.5 sm:mt-1 font-dubai">
                {t.admin.feasibilityPage.subtitle}
                {newRequestsCount > 0 && (
                  <span className="mr-2 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs">
                    {newRequestsCount} {t.admin.feasibilityPage.newRequest}
                  </span>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            {/* زر الطلبات المرفوضة / العودة للرئيسية */}
            {rejectedCount > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowRejected(!showRejected)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-xl font-dubai font-medium text-sm transition-colors ${
                  showRejected 
                    ? 'bg-secondary text-accent' 
                    : 'bg-white border-2 border-primary/30 text-secondary hover:border-primary/50'
                }`}
                style={{ boxShadow: showRejected ? SHADOWS.button : SHADOWS.card }}
              >
                {showRejected ? (
                  <>
                    <FileText className="w-4 sm:w-5 h-4 sm:h-5" />
                    <span className="hidden sm:inline">{t.admin.feasibilityPage.mainRequests}</span>
                    <span className="sm:hidden">{t.admin.feasibilityPage.mainShort}</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 sm:w-5 h-4 sm:h-5" />
                    <span className="hidden sm:inline">{t.admin.rejected(rejectedCount)}</span>
                    <span className="sm:hidden">{t.admin.rejectedShort(rejectedCount)}</span>
                  </>
                )}
              </motion.button>
            )}
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchData}
              className="flex items-center gap-2 p-2 sm:px-4 sm:py-3 bg-white border-2 border-primary/30 rounded-xl font-dubai font-medium text-secondary hover:border-primary/50 transition-colors"
              style={{ boxShadow: SHADOWS.card }}
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </motion.button>
            
            <Link href="/admin/feasibility/new">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-1.5 sm:gap-2 bg-secondary text-accent px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-dubai font-bold text-sm transition-all hover:shadow-lg"
                style={{ boxShadow: SHADOWS.button }}
              >
                <Plus className="w-4 sm:w-5 h-4 sm:h-5" />
                <span className="hidden sm:inline">{t.admin.feasibilityPage.newStudy}</span>
                <span className="sm:hidden">{t.admin.feasibilityPage.newShort}</span>
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* شريط البحث */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative will-change-transform"
          style={{ transform: 'translateZ(0)' }}
        >
          <div 
            className="bg-white border-2 border-primary/20 rounded-2xl overflow-hidden"
            style={{ boxShadow: SHADOWS.card }}
          >
            <div className="flex items-center px-4">
              <Search className="w-5 h-5 text-secondary/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.admin.feasibilityPage.searchPlaceholder}
                className="flex-1 px-4 py-4 bg-transparent text-secondary placeholder-secondary/40 focus:outline-none font-dubai"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                >
                  <span className="text-secondary/40 text-sm">✕</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* رسالة الخطأ */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="flex items-center gap-3 p-4 bg-red-50 border-2 border-red-200 rounded-2xl text-red-700"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="font-dubai">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* المحتوى */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <div
              className="w-16 h-16 bg-primary/30 rounded-2xl flex items-center justify-center mb-4 border-2 border-primary/40"
              style={{ boxShadow: SHADOWS.icon }}
            >
              <Loader2 className="w-8 h-8 text-secondary animate-spin" />
            </div>
            <p className="text-secondary/60 font-dubai">{t.admin.loadingData}</p>
          </motion.div>
        ) : filteredItems.length === 0 && !showRejected ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative bg-white border-2 border-primary/20 rounded-2xl p-12 text-center overflow-hidden"
            style={{ boxShadow: SHADOWS.card }}
          >
            <div className="relative z-10">
              <motion.div 
                className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border-2 border-primary/30"
                style={{ boxShadow: SHADOWS.icon }}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <FileText className="w-10 h-10 text-secondary" strokeWidth={1.5} />
              </motion.div>
              
              <h3 className="text-xl font-dubai font-bold text-secondary mb-2">
                {searchQuery ? t.admin.noResults : t.admin.feasibilityPage.noStudiesOrRequests}
              </h3>
              <p className="text-secondary/60 text-sm font-dubai mb-6">
                {searchQuery 
                  ? t.admin.feasibilityPage.tryDifferentSearch
                  : t.admin.feasibilityPage.startCreating
                }
              </p>
              
              {!searchQuery && (
                <Link href="/admin/feasibility/new">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 bg-secondary text-accent px-5 py-3 rounded-xl font-dubai font-bold mx-auto"
                    style={{ boxShadow: SHADOWS.button }}
                  >
                    <Plus className="w-5 h-5" />
                    {t.admin.feasibilityPage.newStudy}
                  </motion.button>
                </Link>
              )}
            </div>
          </motion.div>
        ) : showRejected ? (
          /* عرض الطلبات المرفوضة */
          <div className="space-y-4">
            {rejectedItems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="relative bg-white border-2 border-primary/20 rounded-2xl p-12 text-center overflow-hidden"
                style={{ boxShadow: SHADOWS.card }}
              >
                <div className="relative z-10">
                  <motion.div 
                    className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border-2 border-primary/30"
                    style={{ boxShadow: SHADOWS.icon }}
                  >
                    <CheckCircle className="w-10 h-10 text-secondary" strokeWidth={1.5} />
                  </motion.div>
                  
                  <h3 className="text-xl font-dubai font-bold text-secondary mb-2">
                    {t.admin.feasibilityPage.noRejectedRequests}
                  </h3>
                  <p className="text-secondary/60 text-sm font-dubai">
                    {t.admin.feasibilityPage.allProcessed}
                  </p>
                </div>
              </motion.div>
            ) : (
              <AnimatePresence>
                {rejectedItems.map((item, index) => (
                  <UnifiedCard
                    key={item.data.id}
                    item={item}
                    index={index}
                    onDelete={handleDelete}
                    onCreateStudy={handleCreateStudyFromRequest}
                    onAcceptRequest={handleAcceptRequest}
                    onRejectRequest={handleRejectRequest}
                    onUnrejectRequest={handleUnrejectRequest}
                    menuOpen={menuOpen}
                    setMenuOpen={setMenuOpen}
                    isRejectedSection={true}
                    currencySymbol={currencySymbol}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredItems.map((item, index) => (
                <UnifiedCard
                  key={item.data.id}
                  item={item}
                  index={index}
                  onDelete={handleDelete}
                  onCreateStudy={handleCreateStudyFromRequest}
                  onAcceptRequest={handleAcceptRequest}
                  onRejectRequest={handleRejectRequest}
                  onUnrejectRequest={handleUnrejectRequest}
                  menuOpen={menuOpen}
                  setMenuOpen={setMenuOpen}
                  currencySymbol={currencySymbol}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* ملخص سفلي */}
        {!loading && (filteredItems.length > 0 || rejectedCount > 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center text-secondary/50 text-sm font-dubai py-4"
          >
            {showRejected ? (
              <>{t.admin.feasibilityPage.totalRejected(rejectedCount)}</>
            ) : (
              <>
                {t.admin.feasibilityPage.totalItems(filteredItems.length)}
                {newRequestsCount > 0 && ` • ${t.admin.feasibilityPage.newRequestsWaiting(newRequestsCount)}`}
                {rejectedCount > 0 && ` • ${t.admin.feasibilityPage.rejectedRequests(rejectedCount)}`}
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
