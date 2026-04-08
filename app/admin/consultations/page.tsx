'use client';

/**
 * صفحة طلبات الاستشارة - تصميم احترافي
 * 
 * تصميم متوافق مع صفحة دراسات الجدوى:
 * - بطاقات بزوايا rounded-2xl
 * - ظلال احترافية
 * - تأثير shimmer عند hover
 * - ألوان متناسقة مع التصميم العام
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Check, 
  X, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Eye,
  FileText,
  Mail,
  Phone,
  Bed,
  Bath,
  ChefHat,
  Sofa,
  Calendar,
  Loader2,
  AlertCircle,
  RefreshCw,
  MessageSquare,
  Funnel,
  MoreVertical,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDropdownPosition } from '@/hooks/useDropdownPosition';

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

interface Consultation {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  message: string;
  bedrooms: number;
  livingRooms: number;
  kitchens: number;
  bathrooms: number;
  status: 'PENDING' | 'READ' | 'COMPLETED';
  createdAt: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================
// 🎯 STATUS CONFIG
// ============================================

const statusConfig: Record<string, { 
  bgColor: string;
  textColor: string;
  borderColor: string;
  icon: React.ElementType;
}> = {
  PENDING: { 
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-500/30',
    icon: Clock
  },
  READ: { 
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-500/30',
    icon: Eye
  },
  COMPLETED: { 
    bgColor: 'bg-primary/20',
    textColor: 'text-primary',
    borderColor: 'border-primary/30',
    icon: CheckCircle2
  },
};

// ============================================
// 🧩 CONSULTATION CARD COMPONENT
// ============================================

interface ConsultationCardProps {
  consultation: Consultation;
  index: number;
  onViewDetails: (consultation: Consultation) => void;
  onDelete: (id: string) => void;
  actionLoading: string | null;
  menuOpen: string | null;
  setMenuOpen: (id: string | null) => void;
}

const ConsultationCard: React.FC<ConsultationCardProps> = ({ 
  consultation, 
  index, 
  onViewDetails,
  onDelete,
  actionLoading,
  menuOpen,
  setMenuOpen
}) => {
  const t = useTranslation();
  const { language } = useLanguage();
  const moreMenu = useDropdownPosition();
  const statusLabels: Record<string, string> = {
    PENDING: t.admin.consultationStatus.new,
    READ: t.admin.consultationStatus.read,
    COMPLETED: t.admin.consultationStatus.completed,
  };
  const status = statusConfig[consultation.status] || statusConfig.PENDING;
  const StatusIcon = status.icon;
  const hasRoomConfig = consultation.bedrooms > 0 || consultation.livingRooms > 0 || consultation.kitchens > 0 || consultation.bathrooms > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ 
        duration: 0.4,
        delay: index * 0.08,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      whileHover={{ y: -4 }}
      className={`group relative bg-white border-2 border-primary/20 rounded-2xl overflow-visible will-change-transform ${menuOpen === consultation.id ? 'z-[200]' : 'z-10'}`}
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
          {/* أيقونة الاستشارة - مخفية على الموبايل */}
          <motion.div 
            className="hidden sm:flex w-14 h-14 bg-primary/20 rounded-2xl items-center justify-center border-2 border-primary/30 flex-shrink-0"
            style={{ boxShadow: SHADOWS.icon }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <MessageSquare className="w-7 h-7 text-secondary" strokeWidth={1.5} />
          </motion.div>

          {/* معلومات الاستشارة */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
              <h3 className="font-dubai font-bold text-base sm:text-lg text-secondary truncate">
                {consultation.firstName} {consultation.lastName}
              </h3>
              <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-dubai font-medium border ${status.bgColor} ${status.textColor} ${status.borderColor}`}>
                <StatusIcon className="w-3 h-3 inline ml-1" />
                {statusLabels[consultation.status] || consultation.status}
              </span>
            </div>
            
            {/* معلومات التواصل */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-secondary/60">
              <span className="flex items-center gap-1 sm:gap-1.5">
                <Mail className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                <span className="truncate max-w-[140px] sm:max-w-none">{consultation.email}</span>
              </span>
              {consultation.phone && (
                <span className="flex items-center gap-1 sm:gap-1.5">
                  <Phone className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                  {consultation.phone}
                </span>
              )}
              <span className="flex items-center gap-1 sm:gap-1.5">
                <Calendar className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                {new Date(consultation.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
              </span>
            </div>

            {/* تكوين الشقة */}
            {hasRoomConfig && (
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 sm:mt-3">
                {consultation.bedrooms > 0 && (
                  <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-secondary/5 rounded-lg text-secondary/70 text-xs">
                    <Bed className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                    <span>{consultation.bedrooms}</span>
                  </div>
                )}
                {consultation.livingRooms > 0 && (
                  <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-secondary/5 rounded-lg text-secondary/70 text-xs">
                    <Sofa className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                    <span>{consultation.livingRooms}</span>
                  </div>
                )}
                {consultation.kitchens > 0 && (
                  <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-secondary/5 rounded-lg text-secondary/70 text-xs">
                    <ChefHat className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                    <span>{consultation.kitchens}</span>
                  </div>
                )}
                {consultation.bathrooms > 0 && (
                  <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-secondary/5 rounded-lg text-secondary/70 text-xs">
                    <Bath className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                    <span>{consultation.bathrooms}</span>
                  </div>
                )}
              </div>
            )}

            {/* الرسالة */}
            <p className="text-sm text-secondary/60 line-clamp-2 mt-3">
              {consultation.message}
            </p>
          </div>

          {/* الإجراءات */}
          <div className="flex items-center gap-2 mt-3 sm:mt-0 justify-end sm:justify-start">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onViewDetails(consultation)}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-secondary text-accent rounded-xl font-dubai font-medium text-xs sm:text-sm transition-all hover:shadow-lg"
              style={{ boxShadow: SHADOWS.button }}
            >
              <Eye className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
              {t.admin.consultationsPage.details}
            </motion.button>

            {/* قائمة المزيد */}
            <div className="relative">
              <motion.button 
                ref={moreMenu.triggerRef as React.RefObject<HTMLButtonElement>}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  const opening = menuOpen !== consultation.id;
                  if (opening) moreMenu.recalculate(180);
                  setMenuOpen(opening ? consultation.id : null);
                }}
                className="p-2.5 hover:bg-primary/10 rounded-xl transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-secondary/60" />
              </motion.button>
              
              <AnimatePresence>
                {menuOpen === consultation.id && (
                  <>
                    <div 
                      className="fixed inset-0 z-[299]"
                      onClick={() => setMenuOpen(null)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full mt-1 end-0 z-[300] min-w-[200px] bg-white rounded-2xl border-2 border-primary/30 py-2 overflow-y-auto"
                      style={{ boxShadow: SHADOWS.popup }}
                    >
                      <div className="px-2 py-1">
                        <button
                          onClick={() => {
                            onViewDetails(consultation);
                            setMenuOpen(null);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-dubai text-secondary hover:bg-gradient-to-r hover:from-primary/20 hover:to-primary/10 transition-all group/item"
                        >
                          <div className="w-8 h-8 bg-secondary/5 rounded-lg flex items-center justify-center group-hover/item:bg-secondary/10 transition-colors">
                            <Eye className="w-4 h-4" />
                          </div>
                          <span className="flex-1 text-right">{t.admin.viewDetails}</span>
                        </button>
                      </div>
                      
                      <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent my-1" />
                      
                      <div className="px-2 py-1">
                        <button
                          onClick={() => {
                            onDelete(consultation.id);
                            setMenuOpen(null);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-dubai text-secondary hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5 transition-all group/item"
                        >
                          <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center group-hover/item:bg-primary/30 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </div>
                          <span className="flex-1 text-right">{t.admin.consultationsPage.deleteRequest}</span>
                        </button>
                      </div>
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

export default function ConsultationsPage() {
  const t = useTranslation();
  const { language } = useLanguage();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const filterMenu = useDropdownPosition();

  // Status label lookup
  const statusLabels: Record<string, string> = {
    PENDING: t.admin.consultationStatus.new,
    READ: t.admin.consultationStatus.read,
    COMPLETED: t.admin.consultationStatus.completed,
  };

  // خيارات فلتر الحالة
  const filterOptions = [
    { value: '', label: t.admin.consultationsPage.allStatuses, icon: null },
    { value: 'PENDING', label: t.admin.consultationStatus.new, config: statusConfig.PENDING },
    { value: 'COMPLETED', label: t.admin.consultationStatus.completed, config: statusConfig.COMPLETED },
  ];

  const currentFilterOption = filterOptions.find(opt => opt.value === statusFilter) || filterOptions[0];

  // جلب الاستشارات
  const fetchConsultations = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '10');
      if (statusFilter) params.set('status', statusFilter);
      
      const response = await fetch(`/api/admin/consultations?${params}`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      setConsultations(data.consultations);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.admin.errorFetchingData);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchConsultations();
  }, [fetchConsultations]);

  // حذف الاستشارة
  const handleDelete = async (id: string) => {
    if (!confirm(t.admin.consultationsPage.confirmDelete)) return;
    
    setActionLoading(id);
    try {
      const response = await fetch(`/api/admin/consultations/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      fetchConsultations(pagination?.page || 1);
      setSelectedConsultation(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : t.admin.errorOccurred);
    } finally {
      setActionLoading(null);
    }
  };

  // تعيين الطلب كمكتمل
  const handleMarkAsCompleted = async (id: string) => {
    setActionLoading(id);
    try {
      const response = await fetch(`/api/admin/consultations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      });
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      fetchConsultations(pagination?.page || 1);
      setSelectedConsultation(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : t.admin.errorOccurred);
    } finally {
      setActionLoading(null);
    }
  };

  // تصفية الاستشارات بناءً على البحث
  const filteredConsultations = consultations.filter(c => {
    if (!searchTerm) return true;
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || c.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

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
              <MessageSquare className="w-5 h-5 sm:w-7 sm:h-7 text-secondary" strokeWidth={1.5} />
            </motion.div>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-secondary font-dubai">
                {t.admin.consultationsPage.title}
              </h1>
              <p className="text-secondary/60 text-xs sm:text-sm mt-0.5 sm:mt-1 font-dubai">
                {t.admin.consultationsPage.subtitle}
                {pagination && (
                  <span className="mr-2 px-2 py-0.5 bg-primary/20 rounded-full text-xs">
                    {pagination.total} {t.admin.requests}
                  </span>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-end">
            <Link href="/admin/feasibility">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-1.5 sm:gap-2 bg-secondary text-accent px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-dubai font-bold text-sm transition-all hover:shadow-lg"
                style={{ boxShadow: SHADOWS.button }}
              >
                <FileText className="w-4 sm:w-5 h-4 sm:h-5" />
                <span>{t.admin.consultationsPage.studies}</span>
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* شريط البحث والفلترة */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-col sm:flex-row gap-4 will-change-transform relative z-[9999]"
          style={{ transform: 'translateZ(0)' }}
        >
          {/* البحث */}
          <div 
            className="flex-1 bg-white border-2 border-primary/20 rounded-2xl overflow-hidden"
            style={{ boxShadow: SHADOWS.card }}
          >
            <div className="flex items-center px-4">
              <Search className="w-5 h-5 text-secondary/40" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.admin.searchByNameOrEmail}
                className="flex-1 px-4 py-4 bg-transparent text-secondary placeholder-secondary/40 focus:outline-none font-dubai"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                >
                  <span className="text-secondary/40 text-sm">✕</span>
                </button>
              )}
            </div>
          </div>

          {/* فلتر الحالة */}
          <div className="relative">
            <motion.button
              ref={filterMenu.triggerRef as React.RefObject<HTMLButtonElement>}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => {
                if (!filterDropdownOpen) filterMenu.recalculate(250);
                setFilterDropdownOpen(!filterDropdownOpen);
              }}
              className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-4 bg-white border-2 border-primary/20 rounded-2xl cursor-pointer sm:min-w-[180px] transition-all hover:border-primary/40"
              style={{ boxShadow: SHADOWS.card }}
            >
              <Funnel className="w-5 h-5 text-secondary/40" />
              <span className="flex-1 text-right font-dubai text-secondary">
                {currentFilterOption.label}
              </span>
              <motion.div
                animate={{ rotate: filterDropdownOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <svg className="w-4 h-4 text-secondary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {filterDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-[299]"
                    onClick={() => setFilterDropdownOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full mt-1 end-0 z-[300] min-w-[200px] bg-white rounded-2xl border-2 border-primary/30 py-2 overflow-y-auto"
                    style={{ boxShadow: SHADOWS.popup }}
                  >
                    {filterOptions.map((option) => {
                      const isSelected = statusFilter === option.value;
                      const StatusIcon = option.config?.icon;
                      
                      return (
                        <div key={option.value} className="px-2 py-0.5">
                          <button
                            onClick={() => {
                              setStatusFilter(option.value);
                              setFilterDropdownOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-dubai transition-all ${
                              isSelected 
                                ? 'bg-gradient-to-r from-primary/20 to-primary/10 text-secondary' 
                                : 'text-secondary hover:bg-gradient-to-r hover:from-primary/10 hover:to-primary/5'
                            }`}
                          >
                            {option.config ? (
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${option.config.bgColor} ${option.config.borderColor}`}>
                                {StatusIcon && <StatusIcon className={`w-4 h-4 ${option.config.textColor}`} />}
                              </div>
                            ) : (
                              <div className="w-8 h-8 bg-secondary/5 rounded-lg flex items-center justify-center">
                                <Funnel className="w-4 h-4 text-secondary/60" />
                              </div>
                            )}
                            <span className="flex-1 text-right">{option.label}</span>
                          </button>
                        </div>
                      );
                    })}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
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
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="font-dubai">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* قائمة الاستشارات */}
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
            <p className="text-secondary/60 font-dubai">{t.admin.loadingRequests}</p>
          </motion.div>
        ) : filteredConsultations.length === 0 ? (
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
                <MessageSquare className="w-10 h-10 text-secondary" strokeWidth={1.5} />
              </motion.div>
              
              <h3 className="text-xl font-dubai font-bold text-secondary mb-2">
                {searchTerm || statusFilter ? t.admin.noResults : t.admin.consultationsPage.noRequests}
              </h3>
              <p className="text-secondary/60 text-sm font-dubai mb-6">
                {searchTerm || statusFilter
                  ? t.admin.tryChangingCriteria
                  : t.admin.consultationsPage.noRequestsReceived
                }
              </p>
              
              {(searchTerm || statusFilter) && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('');
                  }}
                  className="flex items-center gap-2 mx-auto px-5 py-3 bg-white border-2 border-primary/30 rounded-xl font-dubai font-medium text-secondary hover:border-primary/50 transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                  {t.admin.resetFilters}
                </motion.button>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="sync">
              {filteredConsultations.map((consultation, index) => (
                <ConsultationCard
                  key={consultation.id}
                  consultation={consultation}
                  index={index}
                  onViewDetails={setSelectedConsultation}
                  onDelete={handleDelete}
                  actionLoading={actionLoading}
                  menuOpen={menuOpen}
                  setMenuOpen={setMenuOpen}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="flex items-center justify-center gap-2 pt-6"
          >
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <motion.button
                key={page}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => fetchConsultations(page)}
                className={`w-11 h-11 rounded-xl font-dubai font-bold ${
                  page === pagination.page
                    ? 'bg-secondary text-primary'
                    : 'bg-white border-2 border-primary/20 text-secondary hover:border-primary/40'
                }`}
                style={{ boxShadow: page === pagination.page ? SHADOWS.button : SHADOWS.card }}
              >
                {page}
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Modal تفاصيل الاستشارة */}
      <AnimatePresence>
        {selectedConsultation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedConsultation(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-5 max-w-md w-full max-h-[80vh] overflow-y-auto border-2 border-primary/20 scrollbar-hide"
              style={{ 
                boxShadow: '0 25px 60px -12px rgba(16, 48, 43, 0.35)',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center border-2 border-primary/30"
                    style={{ boxShadow: SHADOWS.icon }}
                  >
                    <MessageSquare className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-dubai font-bold text-secondary">{t.admin.consultationsPage.requestDetails}</h2>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-dubai font-medium border ${statusConfig[selectedConsultation.status].bgColor} ${statusConfig[selectedConsultation.status].textColor} ${statusConfig[selectedConsultation.status].borderColor}`}>
                      {statusLabels[selectedConsultation.status] || selectedConsultation.status}
                    </span>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSelectedConsultation(null)}
                  className="p-2 hover:bg-primary/10 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-secondary" />
                </motion.button>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 bg-accent/30 rounded-xl">
                  <label className="text-xs text-secondary/60 font-dubai">{t.admin.consultationsPage.name}</label>
                  <p className="font-medium text-secondary font-dubai">{selectedConsultation.firstName} {selectedConsultation.lastName}</p>
                </div>
                
                <div className="p-4 bg-accent/30 rounded-xl">
                  <label className="text-xs text-secondary/60 font-dubai">{t.admin.consultationsPage.email}</label>
                  <p className="font-medium text-secondary font-dubai">{selectedConsultation.email}</p>
                </div>
                
                {selectedConsultation.phone && (
                  <div className="p-4 bg-accent/30 rounded-xl">
                    <label className="text-xs text-secondary/60 font-dubai">{t.admin.consultationsPage.phone}</label>
                    <p className="font-medium text-secondary font-dubai">{selectedConsultation.phone}</p>
                  </div>
                )}
                
                <div className="p-4 bg-accent/30 rounded-xl">
                  <label className="text-xs text-secondary/60 font-dubai">{t.admin.consultationsPage.messageLabel}</label>
                  <p className="font-medium text-secondary whitespace-pre-wrap font-dubai mt-1">{selectedConsultation.message}</p>
                </div>
                
                {(selectedConsultation.bedrooms > 0 || selectedConsultation.livingRooms > 0) && (
                  <div className="p-4 bg-accent/30 rounded-xl">
                    <label className="text-xs text-secondary/60 font-dubai mb-3 block">{t.admin.consultationsPage.apartmentConfig}</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-primary/20">
                        <Bed className="w-5 h-5 text-secondary/60" />
                        <span className="text-secondary font-dubai">{selectedConsultation.bedrooms} {t.admin.consultationsPage.bedrooms}</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-primary/20">
                        <Sofa className="w-5 h-5 text-secondary/60" />
                        <span className="text-secondary font-dubai">{selectedConsultation.livingRooms} {t.admin.consultationsPage.livingRoom}</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-primary/20">
                        <ChefHat className="w-5 h-5 text-secondary/60" />
                        <span className="text-secondary font-dubai">{selectedConsultation.kitchens} {t.admin.consultationsPage.kitchen}</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-primary/20">
                        <Bath className="w-5 h-5 text-secondary/60" />
                        <span className="text-secondary font-dubai">{selectedConsultation.bathrooms} {t.admin.consultationsPage.bathroom}</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="p-4 bg-accent/30 rounded-xl">
                  <label className="text-xs text-secondary/60 font-dubai">{t.admin.consultationsPage.sentDate}</label>
                  <p className="font-medium text-secondary font-dubai">
                    {new Date(selectedConsultation.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
              
              {/* أزرار الإجراءات */}
              <div className="flex gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleMarkAsCompleted(selectedConsultation.id)}
                  disabled={actionLoading === selectedConsultation.id || selectedConsultation.status === 'COMPLETED'}
                  className="flex-1 py-2.5 bg-secondary hover:bg-secondary/90 text-accent rounded-xl text-sm font-dubai transition-colors border-2 border-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {selectedConsultation.status === 'COMPLETED' ? t.admin.consultationsPage.completedCheck : t.admin.consultationsPage.markCompleted}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDelete(selectedConsultation.id)}
                  disabled={actionLoading === selectedConsultation.id}
                  className="flex-1 py-2.5 text-red-700 hover:bg-red-500/10 rounded-xl text-sm font-dubai transition-colors border-2 border-red-500/30 disabled:opacity-50"
                >
                  {actionLoading === selectedConsultation.id ? t.admin.consultationsPage.deleting : t.admin.consultationsPage.deleteRequest}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
