'use client';

/**
 * صفحة دراسات الجدوى - تصميم احترافي
 * 
 * تصميم متوافق مع باقي الصفحات:
 * - بطاقات بزوايا rounded-2xl
 * - ظلال احترافية
 * - تأثير shimmer عند hover
 * - ألوان متناسقة مع التصميم العام
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
  Edit3, 
  AlertCircle, 
  DollarSign, 
  Bed, 
  Bath, 
  ChefHat, 
  Sofa,
  Search,
  MessageSquare,
  FolderOpen
} from 'lucide-react';

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
  bedrooms: number;
  livingRooms: number;
  kitchens: number;
  bathrooms: number;
  shareId: string | null;
  createdAt: string;
  updatedAt: string;
  consultation: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
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
  label: string; 
  bgColor: string;
  textColor: string;
  borderColor: string;
}> = {
  DRAFT: { 
    label: 'مسودة', 
    bgColor: 'bg-amber-500/10',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-500/30'
  },
  SENT: { 
    label: 'تم الإرسال', 
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-500/30'
  },
  VIEWED: { 
    label: 'تمت المشاهدة', 
    bgColor: 'bg-emerald-400/15',
    textColor: 'text-emerald-800/70',
    borderColor: 'border-emerald-600/40'
  },
};

// ============================================
// 🧩 STUDY CARD COMPONENT
// ============================================

interface StudyCardProps {
  study: Study;
  index: number;
  onDelete: (id: string) => void;
  menuOpen: string | null;
  setMenuOpen: (id: string | null) => void;
}

const StudyCard: React.FC<StudyCardProps> = ({ 
  study, 
  index, 
  onDelete,
  menuOpen,
  setMenuOpen
}) => {
  const status = statusConfig[study.status] || statusConfig.DRAFT;
  
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
      className={`group relative bg-white border-2 border-primary/20 rounded-2xl overflow-visible will-change-transform ${menuOpen === study.id ? 'z-[200]' : 'z-10'}`}
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

      <div className="relative p-5">
        <div className="flex items-start gap-4">
          {/* أيقونة الدراسة */}
          <motion.div 
            className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center border-2 border-primary/30 flex-shrink-0"
            style={{ boxShadow: SHADOWS.icon }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <FileText className="w-7 h-7 text-secondary" strokeWidth={1.5} />
          </motion.div>

          {/* معلومات الدراسة */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-dubai font-bold text-lg text-secondary truncate">
                {study.clientName}
              </h3>
              <span className={`px-3 py-1 rounded-full text-xs font-dubai font-medium border ${status.bgColor} ${status.textColor} ${status.borderColor}`}>
                {status.label}
              </span>
            </div>
            
            {/* التفاصيل */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-secondary/60">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(study.updatedAt).toLocaleDateString('ar-EG')}
              </span>
              
              {study.totalCost > 0 && (
                <span className="flex items-center gap-1.5 text-primary font-medium">
                  <DollarSign className="w-4 h-4" />
                  {study.totalCost.toLocaleString('ar-EG')} ج.م
                </span>
              )}
            </div>

            {/* تكوين الشقة */}
            <div className="flex items-center gap-3 mt-3">
              {study.bedrooms > 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-secondary/5 rounded-lg text-secondary/70 text-xs">
                  <Bed className="w-3.5 h-3.5" />
                  <span>{study.bedrooms}</span>
                </div>
              )}
              {study.livingRooms > 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-secondary/5 rounded-lg text-secondary/70 text-xs">
                  <Sofa className="w-3.5 h-3.5" />
                  <span>{study.livingRooms}</span>
                </div>
              )}
              {study.kitchens > 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-secondary/5 rounded-lg text-secondary/70 text-xs">
                  <ChefHat className="w-3.5 h-3.5" />
                  <span>{study.kitchens}</span>
                </div>
              )}
              {study.bathrooms > 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-secondary/5 rounded-lg text-secondary/70 text-xs">
                  <Bath className="w-3.5 h-3.5" />
                  <span>{study.bathrooms}</span>
                </div>
              )}
            </div>
          </div>

          {/* الإجراءات */}
          <div className="flex items-center gap-2">
            <Link href={`/admin/feasibility/${study.id}`}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2 px-4 py-2.5 bg-secondary text-accent rounded-xl font-dubai font-medium text-sm transition-all hover:shadow-lg"
                style={{ boxShadow: SHADOWS.button }}
              >
                <Edit3 className="w-4 h-4" />
                تعديل
              </motion.button>
            </Link>

            {/* قائمة المزيد */}
            <div className="relative">
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setMenuOpen(menuOpen === study.id ? null : study.id)}
                className="p-2.5 hover:bg-primary/10 rounded-xl transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-secondary/60" />
              </motion.button>
              
              <AnimatePresence>
                {menuOpen === study.id && (
                  <>
                    <div 
                      className="fixed inset-0 z-[150]"
                      onClick={() => setMenuOpen(null)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 top-full mt-2 bg-white rounded-2xl border-2 border-primary/20 py-3 z-[160] min-w-[160px] overflow-hidden"
                      style={{ boxShadow: SHADOWS.popup }}
                    >
                      {study.shareId && (
                        <button
                          onClick={() => {
                            window.open(`/study/${study.shareId}`, '_blank');
                            setMenuOpen(null);
                          }}
                          className="w-[calc(100%-16px)] flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl text-sm text-secondary hover:bg-primary/10 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          معاينة
                        </button>
                      )}
                      <button
                        onClick={() => onDelete(study.id)}
                        className="w-[calc(100%-16px)] flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        حذف
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
  const [studies, setStudies] = useState<Study[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // جلب الدراسات
  const fetchStudies = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/admin/feasibility?page=${page}&limit=10`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      setStudies(data.studies);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء جلب البيانات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudies();
  }, [fetchStudies]);

  // فلترة الدراسات حسب البحث
  const filteredStudies = studies.filter(study => 
    study.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    study.clientEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // حذف دراسة
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/feasibility/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }
      
      fetchStudies(pagination?.page || 1);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'حدث خطأ');
    }
    setMenuOpen(null);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* العنوان */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 will-change-transform"
          style={{ transform: 'translateZ(0)' }}
        >
          <div className="flex items-center gap-4">
            <motion.div 
              className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center border-2 border-primary/30"
              style={{ boxShadow: SHADOWS.icon }}
              whileHover={{ scale: 1.05 }}
            >
              <FileText className="w-7 h-7 text-secondary" strokeWidth={1.5} />
            </motion.div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-secondary font-dubai">
                دراسات الجدوى
              </h1>
              <p className="text-secondary/60 text-sm mt-1 font-dubai">
                إدارة وإنشاء دراسات الجدوى للعملاء
                {pagination && (
                  <span className="mr-2 px-2 py-0.5 bg-primary/20 rounded-full text-xs">
                    {pagination.total} دراسة
                  </span>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Link href="/admin/consultations">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-primary/30 rounded-xl font-dubai font-medium text-secondary hover:border-primary/50 transition-colors"
                style={{ boxShadow: SHADOWS.card }}
              >
                <MessageSquare className="w-5 h-5" />
                <span>الطلبات</span>
              </motion.button>
            </Link>
            
            <Link href="/admin/feasibility/new">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 bg-secondary text-accent px-5 py-3 rounded-xl font-dubai font-bold transition-all hover:shadow-lg"
                style={{ boxShadow: SHADOWS.button }}
              >
                <Plus className="w-5 h-5" />
                <span>دراسة جديدة</span>
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
                placeholder="ابحث باسم العميل أو البريد الإلكتروني..."
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
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="font-dubai">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* قائمة الدراسات */}
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
            <p className="text-secondary/60 font-dubai">جاري تحميل الدراسات...</p>
          </motion.div>
        ) : filteredStudies.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative bg-white border-2 border-primary/20 rounded-2xl p-12 text-center overflow-hidden"
            style={{ boxShadow: SHADOWS.card }}
          >
            {/* أيقونة خلفية كبيرة */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
              <FolderOpen className="w-64 h-64 text-secondary" strokeWidth={0.5} />
            </div>
            
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
                {searchQuery ? 'لا توجد نتائج' : 'لا توجد دراسات'}
              </h3>
              <p className="text-secondary/60 text-sm font-dubai mb-6">
                {searchQuery 
                  ? 'جرب البحث بكلمات مختلفة'
                  : 'ابدأ بإنشاء دراسة جدوى جديدة أو قبول طلبات الاستشارة'
                }
              </p>
              
              <div className="flex items-center justify-center gap-3">
                <Link href="/admin/feasibility/new">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 bg-secondary text-accent px-5 py-3 rounded-xl font-dubai font-bold"
                    style={{ boxShadow: SHADOWS.button }}
                  >
                    <Plus className="w-5 h-5" />
                    دراسة جديدة
                  </motion.button>
                </Link>
                <Link href="/admin/consultations">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-primary/30 rounded-xl font-dubai font-medium text-secondary hover:border-primary/50 transition-colors"
                  >
                    <MessageSquare className="w-5 h-5" />
                    طلبات الاستشارة
                  </motion.button>
                </Link>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredStudies.map((study, index) => (
                <StudyCard
                  key={study.id}
                  study={study}
                  index={index}
                  onDelete={handleDelete}
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
                onClick={() => fetchStudies(page)}
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
    </div>
  );
}
