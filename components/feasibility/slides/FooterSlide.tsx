'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Phone, 
  Mail, 
  Globe,
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
    <div 
      className="relative bg-secondary flex flex-col overflow-hidden"
      style={{ minHeight: '600px' }}
      dir="rtl"
    >
      {/* النمط الخلفي - نفس المقدمة */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url('/patterns/pattern-vertical-white.png')`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* المحتوى */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center justify-center h-full py-10 px-8 text-center"
      >
        {/* الشعار */}
        <motion.div
          variants={fadeInUp}
          className="mb-6"
        >
          <div className="relative w-40 h-40 mx-auto">
            <Image
              src="/logos/logo-white.png"
              alt="مفتاحك"
              fill
              className="object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        </motion.div>

        {/* الخط الفاصل العلوي */}
        <motion.div 
          className="w-24 h-px bg-primary/30 mb-6"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        />

        {/* الرسالة الرئيسية */}
        <motion.div
          variants={fadeInUp}
          className="mb-6"
        >
          {isEditing && editingField === 'message' ? (
            <div className="flex items-center justify-center gap-3">
              <input
                type="text"
                value={slideData.message}
                onChange={e => handleFieldUpdate('message', e.target.value)}
                className="text-3xl font-bold text-primary bg-transparent border-b-2 border-primary/50 text-center focus:outline-none focus:border-primary font-dubai"
                autoFocus
                onBlur={() => setEditingField(null)}
                onKeyDown={e => e.key === 'Enter' && setEditingField(null)}
              />
            </div>
          ) : (
            <h2 
              className={`text-3xl font-bold text-primary font-dubai ${isEditing ? 'cursor-pointer hover:opacity-80' : ''}`}
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

        {/* معلومات التواصل - على خط واحد */}
        <motion.div
          variants={fadeInUp}
          className="flex flex-wrap items-center justify-center gap-6 text-white/80 mb-8"
        >
          {(slideData.contactInfo.phone || isEditing) && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                <Phone className="w-4 h-4 text-primary" />
              </div>
              <EditableField
                field="contact.phone"
                value={slideData.contactInfo.phone || ''}
                placeholder="رقم الهاتف"
                className="text-sm"
              />
            </div>
          )}
          
          {(slideData.contactInfo.email || isEditing) && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                <Mail className="w-4 h-4 text-primary" />
              </div>
              <EditableField
                field="contact.email"
                value={slideData.contactInfo.email || ''}
                placeholder="البريد الإلكتروني"
                className="text-sm"
              />
            </div>
          )}
          
          {(slideData.contactInfo.website || isEditing) && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                <Globe className="w-4 h-4 text-primary" />
              </div>
              <EditableField
                field="contact.website"
                value={slideData.contactInfo.website || ''}
                placeholder="الموقع الإلكتروني"
                className="text-sm"
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
              className={`w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 hover:bg-primary/30 flex items-center justify-center transition-colors ${isEditing ? 'cursor-pointer' : ''}`}
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
              className={`w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 hover:bg-primary/30 flex items-center justify-center transition-colors ${isEditing ? 'cursor-pointer' : ''}`}
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
              className={`w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 hover:bg-primary/30 flex items-center justify-center transition-colors ${isEditing ? 'cursor-pointer' : ''}`}
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
            className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-5"
          >
            <input
              type="text"
              value={
                editingField === 'social.facebook' ? slideData.socialLinks.facebook || '' :
                editingField === 'social.instagram' ? slideData.socialLinks.instagram || '' :
                slideData.socialLinks.twitter || ''
              }
              onChange={e => handleFieldUpdate(editingField, e.target.value)}
              className="bg-white/20 border border-white/30 rounded-lg px-5 py-3 text-white text-base focus:outline-none focus:ring-2 focus:ring-primary/50 w-72"
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

        {/* القسم السفلي - الفوتر */}
        <motion.div 
          className="mt-auto pt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {/* زخرفة */}
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-12 h-px bg-primary/20" />
            <div className="w-2 h-2 bg-primary/30 rotate-45 rounded-sm" />
            <div className="w-12 h-px bg-primary/20" />
          </div>
          
          <p className="text-primary/50 text-sm flex items-center justify-center gap-2 font-dubai mb-1">
            صُنع بـ <Heart className="w-3 h-3 text-red-400 fill-red-400" /> من فريق مفتاحك
          </p>
          <p className="text-primary/40 text-xs font-dubai">
            © {new Date().getFullYear()} جميع الحقوق محفوظة
          </p>
        </motion.div>
      </motion.div>

      {/* تأثير التدرج السفلي */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-linear-to-t from-secondary-dark/50 to-transparent pointer-events-none" />
    </div>
  );
}
