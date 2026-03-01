'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Link2, 
  Copy, 
  Check, 
  Share2, 
  Eye, 
  Clock, 
  RefreshCw,
  ExternalLink,
  Loader2
} from 'lucide-react';

// ============================================
// 📋 TYPES
// ============================================

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  studyId: string;
  clientName: string;
}

interface ShareInfo {
  shareId: string | null;
  shareUrl: string | null;
  status: string;
  sentAt: string | null;
  viewedAt: string | null;
}

// ============================================
// 🎨 DESIGN TOKENS
// ============================================

const SHADOWS = {
  modal: 'rgba(16, 48, 43, 0.25) 0px 25px 50px -12px',
  button: 'rgba(237, 191, 140, 0.25) 0px 4px 12px',
  input: 'rgba(237, 191, 140, 0.1) 0px 2px 8px inset',
};

// ============================================
// 🎯 MAIN COMPONENT
// ============================================

const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  studyId,
  clientName,
}) => {
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareInfo, setShareInfo] = useState<ShareInfo | null>(null);
  const [error, setError] = useState('');

  // جلب معلومات المشاركة الحالية
  useEffect(() => {
    if (isOpen && studyId) {
      fetchShareInfo();
    }
  }, [isOpen, studyId]);

  const fetchShareInfo = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/feasibility/${studyId}/share`);
      const data = await response.json();
      
      if (response.ok) {
        setShareInfo(data);
      } else {
        setError(data.error || 'حدث خطأ');
      }
    } catch (err) {
      setError('فشل في جلب معلومات المشاركة');
    } finally {
      setLoading(false);
    }
  };

  // إنشاء رابط مشاركة جديد
  const handleGenerateLink = async () => {
    setGenerating(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/feasibility/${studyId}/share`, {
        method: 'POST',
      });
      const data = await response.json();
      
      if (response.ok) {
        setShareInfo({
          shareId: data.shareId,
          shareUrl: data.shareUrl,
          status: data.status,
          sentAt: new Date().toISOString(),
          viewedAt: null,
        });
      } else {
        setError(data.error || 'فشل في إنشاء الرابط');
      }
    } catch (err) {
      setError('فشل في إنشاء رابط المشاركة');
    } finally {
      setGenerating(false);
    }
  };

  // نسخ الرابط
  const handleCopyLink = async () => {
    if (shareInfo?.shareUrl) {
      try {
        await navigator.clipboard.writeText(shareInfo.shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  // فتح الرابط في نافذة جديدة
  const handleOpenLink = () => {
    if (shareInfo?.shareUrl) {
      window.open(shareInfo.shareUrl, '_blank');
    }
  };

  // تحويل الحالة للعرض
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'DRAFT': return { label: 'مسودة', color: 'text-yellow-600 bg-yellow-100' };
      case 'SENT': return { label: 'تم الإرسال', color: 'text-blue-600 bg-blue-100' };
      case 'VIEWED': return { label: 'تمت المشاهدة', color: 'text-green-600 bg-green-100' };
      default: return { label: status, color: 'text-gray-600 bg-gray-100' };
    }
  };

  // تنسيق التاريخ
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // محتوى المودال
  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* الخلفية */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-9998"
            onClick={onClose}
          />

          {/* المودال */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-9999 w-full max-w-md"
            dir="rtl"
          >
            <div 
              className="bg-white rounded-2xl overflow-hidden"
              style={{ boxShadow: SHADOWS.modal }}
            >
              {/* الهيدر */}
              <div className="bg-linear-to-l from-secondary to-secondary/90 px-6 py-5 relative overflow-hidden">
                {/* نمط الخلفية */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary rounded-full -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary rounded-full translate-y-1/2 -translate-x-1/2" />
                </div>
                
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                      <Share2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-lg font-dubai font-bold text-white">مشاركة الدراسة</h2>
                      <p className="text-sm text-white/70 font-dubai">{clientName}</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white/80" />
                  </button>
                </div>
              </div>

              {/* المحتوى */}
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
                    <p className="text-secondary/60 font-dubai">جاري التحميل...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-8">
                    <p className="text-red-500 font-dubai mb-4">{error}</p>
                    <button
                      onClick={fetchShareInfo}
                      className="px-4 py-2 bg-secondary/10 text-secondary rounded-lg hover:bg-secondary/20 transition-colors font-dubai"
                    >
                      إعادة المحاولة
                    </button>
                  </div>
                ) : (
                  <>
                    {/* حالة الدراسة */}
                    {shareInfo?.status && (
                      <div className="flex items-center justify-between mb-6 p-3 bg-accent/30 rounded-xl">
                        <span className="text-secondary/70 font-dubai text-sm">حالة الدراسة</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-dubai font-medium ${getStatusLabel(shareInfo.status).color}`}>
                          {getStatusLabel(shareInfo.status).label}
                        </span>
                      </div>
                    )}

                    {/* رابط المشاركة */}
                    {shareInfo?.shareUrl ? (
                      <div className="space-y-4">
                        {/* حقل الرابط */}
                        <div className="relative">
                          <div 
                            className="w-full p-3 pr-12 bg-accent/20 border-2 border-primary/20 rounded-xl text-secondary/80 font-mono text-sm overflow-x-auto"
                            style={{ direction: 'ltr' }}
                          >
                            {shareInfo.shareUrl}
                          </div>
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Link2 className="w-5 h-5 text-secondary/40" />
                          </div>
                        </div>

                        {/* أزرار النسخ والفتح */}
                        <div className="flex gap-3">
                          <motion.button
                            onClick={handleCopyLink}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary text-secondary rounded-xl font-dubai font-medium hover:bg-primary/90 transition-colors"
                            style={{ boxShadow: SHADOWS.button }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {copied ? (
                              <>
                                <Check className="w-5 h-5" />
                                <span>تم النسخ!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-5 h-5" />
                                <span>نسخ الرابط</span>
                              </>
                            )}
                          </motion.button>

                          <motion.button
                            onClick={handleOpenLink}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-secondary text-white rounded-xl font-dubai font-medium hover:bg-secondary/90 transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <ExternalLink className="w-5 h-5" />
                            <span>فتح</span>
                          </motion.button>
                        </div>

                        {/* معلومات المشاركة */}
                        <div className="pt-4 border-t border-primary/10 space-y-2">
                          {shareInfo.sentAt && (
                            <div className="flex items-center gap-2 text-sm text-secondary/60">
                              <Clock className="w-4 h-4" />
                              <span className="font-dubai">تم الإرسال: {formatDate(shareInfo.sentAt)}</span>
                            </div>
                          )}
                          {shareInfo.viewedAt && (
                            <div className="flex items-center gap-2 text-sm text-green-600">
                              <Eye className="w-4 h-4" />
                              <span className="font-dubai">تمت المشاهدة: {formatDate(shareInfo.viewedAt)}</span>
                            </div>
                          )}
                        </div>

                        {/* زر تجديد الرابط */}
                        <button
                          onClick={handleGenerateLink}
                          disabled={generating}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-secondary/60 hover:text-secondary hover:bg-accent/30 rounded-lg transition-colors font-dubai text-sm"
                        >
                          <RefreshCw className={`w-4 h-4 ${generating ? 'animate-spin' : ''}`} />
                          <span>{generating ? 'جاري التجديد...' : 'تجديد الرابط'}</span>
                        </button>
                      </div>
                    ) : (
                      /* لا يوجد رابط - إنشاء رابط جديد */
                      <div className="text-center py-4">
                        <div className="w-16 h-16 bg-accent/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <Link2 className="w-8 h-8 text-secondary/50" />
                        </div>
                        <p className="text-secondary/60 font-dubai mb-4">
                          لم يتم إنشاء رابط مشاركة لهذه الدراسة بعد
                        </p>
                        <motion.button
                          onClick={handleGenerateLink}
                          disabled={generating}
                          className="flex items-center justify-center gap-2 px-6 py-3 bg-secondary text-white rounded-xl font-dubai font-medium hover:bg-secondary/90 transition-colors mx-auto disabled:opacity-50"
                          whileHover={{ scale: generating ? 1 : 1.02 }}
                          whileTap={{ scale: generating ? 1 : 0.98 }}
                        >
                          {generating ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span>جاري الإنشاء...</span>
                            </>
                          ) : (
                            <>
                              <Share2 className="w-5 h-5" />
                              <span>إنشاء رابط المشاركة</span>
                            </>
                          )}
                        </motion.button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // استخدام Portal لعرض المودال في document.body
  if (typeof window === 'undefined') return null;
  return createPortal(modalContent, document.body);
};

export default ShareModal;
