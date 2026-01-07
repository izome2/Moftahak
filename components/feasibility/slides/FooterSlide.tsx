'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Phone, 
  Mail, 
  Globe, 
  MessageCircle,
  Facebook,
  Instagram,
  Twitter,
  Edit2,
  Check,
  Heart
} from 'lucide-react';
import { FooterSlideData } from '@/types/feasibility';
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';
import Image from 'next/image';

interface FooterSlideProps {
  data?: FooterSlideData;
  isEditing?: boolean;
  onUpdate?: (data: FooterSlideData) => void;
}

const defaultData: FooterSlideData = {
  message: 'شكراً لثقتكم بنا',
  contactInfo: {
    phone: '',
    email: 'info@moftahak.com',
    website: 'www.moftahak.com',
    whatsapp: '',
  },
  socialLinks: {
    facebook: '',
    instagram: '',
    twitter: '',
  },
};

export default function FooterSlide({
  data = defaultData,
  isEditing = false,
  onUpdate,
}: FooterSlideProps) {
  const [slideData, setSlideData] = useState<FooterSlideData>(data);
  const [editingField, setEditingField] = useState<string | null>(null);

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

  // تحديث حقل
  const handleFieldUpdate = (field: string, value: string) => {
    if (field === 'message') {
      setSlideData(prev => ({ ...prev, message: value }));
    } else if (field.startsWith('contact.')) {
      const contactField = field.replace('contact.', '') as keyof typeof slideData.contactInfo;
      setSlideData(prev => ({
        ...prev,
        contactInfo: { ...prev.contactInfo, [contactField]: value },
      }));
    } else if (field.startsWith('social.')) {
      const socialField = field.replace('social.', '') as keyof typeof slideData.socialLinks;
      setSlideData(prev => ({
        ...prev,
        socialLinks: { ...prev.socialLinks, [socialField]: value },
      }));
    }
  };

  // مكون حقل قابل للتحرير
  const EditableField = ({ 
    field, 
    value, 
    placeholder,
    className = ''
  }: { 
    field: string; 
    value: string; 
    placeholder: string;
    className?: string;
  }) => {
    if (isEditing && editingField === field) {
      return (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={value}
            onChange={e => handleFieldUpdate(field, e.target.value)}
            className={`bg-white/20 border border-white/30 rounded-lg px-3 py-1 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 ${className}`}
            placeholder={placeholder}
            autoFocus
            onBlur={() => setEditingField(null)}
            onKeyDown={e => e.key === 'Enter' && setEditingField(null)}
          />
          <button
            onClick={() => setEditingField(null)}
            className="w-6 h-6 rounded-full bg-primary/30 flex items-center justify-center"
          >
            <Check className="w-3 h-3 text-white" />
          </button>
        </div>
      );
    }

    return (
      <div 
        className={`flex items-center gap-2 ${isEditing ? 'cursor-pointer hover:opacity-80' : ''} ${className}`}
        onClick={() => isEditing && setEditingField(field)}
      >
        <span>{value || placeholder}</span>
        {isEditing && (
          <Edit2 className="w-3 h-3 opacity-50" />
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col bg-secondary relative overflow-hidden">
      {/* خلفية مزخرفة */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
      </div>

      {/* المحتوى */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center justify-center h-full p-8 text-center"
      >
        {/* الشعار */}
        <motion.div
          variants={fadeInUp}
          className="mb-6"
        >
          <div className="relative w-32 h-32 mx-auto">
            <Image
              src="/logos/logo-light.png"
              alt="مفتاحك"
              fill
              className="object-contain"
              onError={(e) => {
                // إذا لم يكن الشعار موجوداً، اعرض نص بديل
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            {/* نص بديل إذا لم يكن الشعار موجوداً */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold text-primary font-bristone">مفتاحك</span>
            </div>
          </div>
        </motion.div>

        {/* الرسالة الرئيسية */}
        <motion.div
          variants={fadeInUp}
          className="mb-8"
        >
          {isEditing && editingField === 'message' ? (
            <div className="flex items-center justify-center gap-2">
              <input
                type="text"
                value={slideData.message}
                onChange={e => handleFieldUpdate('message', e.target.value)}
                className="text-2xl font-bold text-primary bg-transparent border-b-2 border-primary/50 text-center focus:outline-none focus:border-primary"
                autoFocus
                onBlur={() => setEditingField(null)}
                onKeyDown={e => e.key === 'Enter' && setEditingField(null)}
              />
            </div>
          ) : (
            <h2 
              className={`text-2xl font-bold text-primary font-dubai ${isEditing ? 'cursor-pointer hover:opacity-80' : ''}`}
              onClick={() => isEditing && setEditingField('message')}
            >
              {slideData.message}
              {isEditing && <Edit2 className="w-4 h-4 inline-block mr-2 opacity-50" />}
            </h2>
          )}
        </motion.div>

        {/* الخط الفاصل */}
        <motion.div
          variants={fadeInUp}
          className="w-48 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent mb-8"
        />

        {/* معلومات التواصل */}
        <motion.div
          variants={fadeInUp}
          className="space-y-3 text-white/80 mb-8"
        >
          {(slideData.contactInfo.whatsapp || isEditing) && (
            <div className="flex items-center justify-center gap-3">
              <MessageCircle className="w-4 h-4 text-primary" />
              <EditableField
                field="contact.whatsapp"
                value={slideData.contactInfo.whatsapp || ''}
                placeholder="رقم الواتساب"
              />
            </div>
          )}
          
          {(slideData.contactInfo.phone || isEditing) && (
            <div className="flex items-center justify-center gap-3">
              <Phone className="w-4 h-4 text-primary" />
              <EditableField
                field="contact.phone"
                value={slideData.contactInfo.phone || ''}
                placeholder="رقم الهاتف"
              />
            </div>
          )}
          
          {(slideData.contactInfo.email || isEditing) && (
            <div className="flex items-center justify-center gap-3">
              <Mail className="w-4 h-4 text-primary" />
              <EditableField
                field="contact.email"
                value={slideData.contactInfo.email || ''}
                placeholder="البريد الإلكتروني"
              />
            </div>
          )}
          
          {(slideData.contactInfo.website || isEditing) && (
            <div className="flex items-center justify-center gap-3">
              <Globe className="w-4 h-4 text-primary" />
              <EditableField
                field="contact.website"
                value={slideData.contactInfo.website || ''}
                placeholder="الموقع الإلكتروني"
              />
            </div>
          )}
        </motion.div>

        {/* وسائل التواصل الاجتماعي */}
        <motion.div
          variants={fadeInUp}
          className="flex items-center justify-center gap-4"
        >
          {(slideData.socialLinks.facebook || isEditing) && (
            <a
              href={slideData.socialLinks.facebook || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors ${isEditing ? 'cursor-pointer' : ''}`}
              onClick={e => {
                if (isEditing) {
                  e.preventDefault();
                  setEditingField('social.facebook');
                }
              }}
            >
              <Facebook className="w-5 h-5 text-primary" />
            </a>
          )}
          
          {(slideData.socialLinks.instagram || isEditing) && (
            <a
              href={slideData.socialLinks.instagram || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors ${isEditing ? 'cursor-pointer' : ''}`}
              onClick={e => {
                if (isEditing) {
                  e.preventDefault();
                  setEditingField('social.instagram');
                }
              }}
            >
              <Instagram className="w-5 h-5 text-primary" />
            </a>
          )}
          
          {(slideData.socialLinks.twitter || isEditing) && (
            <a
              href={slideData.socialLinks.twitter || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className={`w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors ${isEditing ? 'cursor-pointer' : ''}`}
              onClick={e => {
                if (isEditing) {
                  e.preventDefault();
                  setEditingField('social.twitter');
                }
              }}
            >
              <Twitter className="w-5 h-5 text-primary" />
            </a>
          )}
        </motion.div>

        {/* نافذة تعديل روابط السوشيال ميديا */}
        {isEditing && editingField?.startsWith('social.') && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 bg-white/10 backdrop-blur-sm rounded-xl p-4"
          >
            <input
              type="text"
              value={
                editingField === 'social.facebook' ? slideData.socialLinks.facebook || '' :
                editingField === 'social.instagram' ? slideData.socialLinks.instagram || '' :
                slideData.socialLinks.twitter || ''
              }
              onChange={e => handleFieldUpdate(editingField, e.target.value)}
              className="bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-64"
              placeholder={
                editingField === 'social.facebook' ? 'رابط فيسبوك' :
                editingField === 'social.instagram' ? 'رابط انستجرام' :
                'رابط تويتر'
              }
              autoFocus
              onBlur={() => setEditingField(null)}
              onKeyDown={e => e.key === 'Enter' && setEditingField(null)}
            />
          </motion.div>
        )}

        {/* نص الحقوق */}
        <motion.div
          variants={fadeInUp}
          className="absolute bottom-6 left-0 right-0 text-center"
        >
          <p className="text-white/40 text-xs flex items-center justify-center gap-1 font-dubai">
            صُنع بـ <Heart className="w-3 h-3 text-red-400 fill-red-400" /> من فريق مفتاحك
          </p>
          <p className="text-white/30 text-xs mt-1 font-dubai">
            © {new Date().getFullYear()} جميع الحقوق محفوظة
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
