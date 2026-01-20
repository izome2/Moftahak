'use client';

import React from 'react';
import { User, Mail, Building2, MapPin, Map } from 'lucide-react';
import { 
  FeasibilityRequestFormData, 
  PropertyType,
  propertyTypeLabels 
} from '@/lib/validations/feasibility-request';
import EmailVerification from './EmailVerification';

interface Step1BasicInfoProps {
  formData: FeasibilityRequestFormData;
  errors: Record<string, string>;
  onChange: (data: Partial<FeasibilityRequestFormData>) => void;
}

const propertyTypes: PropertyType[] = [
  'APARTMENT',
  'VILLA',
  'CHALET',
  'STUDIO',
  'DUPLEX',
  'PENTHOUSE',
];

export default function Step1BasicInfo({ 
  formData, 
  errors, 
  onChange 
}: Step1BasicInfoProps) {
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold text-secondary mb-4 font-dubai">
        المعلومات الأساسية
      </h2>

      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-secondary mb-1.5 font-dubai">
          الاسم بالكامل <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/40">
            <User className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => onChange({ fullName: e.target.value })}
            placeholder="أدخل اسمك الكامل"
            className={`
              w-full pr-12 pl-4 py-3 rounded-xl border-2 bg-white/50
              focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
              transition-all font-dubai text-right
              ${errors.fullName ? 'border-red-400' : 'border-secondary/20'}
            `}
          />
        </div>
        {errors.fullName && (
          <p className="mt-1 text-sm text-red-500 font-dubai">{errors.fullName}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-secondary mb-1.5 font-dubai">
          البريد الإلكتروني <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/40">
            <Mail className="w-5 h-5" />
          </div>
          <input
            type="email"
            dir="ltr"
            value={formData.email}
            onChange={(e) => onChange({ email: e.target.value, isEmailVerified: false })}
            placeholder="example@email.com"
            disabled={formData.isEmailVerified}
            className={`
              w-full pr-12 pl-4 py-3 rounded-xl border-2 bg-white/50
              focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
              transition-all font-dubai text-left
              disabled:bg-secondary/5 disabled:cursor-not-allowed
              ${errors.email ? 'border-red-400' : 'border-secondary/20'}
            `}
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-sm text-red-500 font-dubai">{errors.email}</p>
        )}
      </div>

      {/* Email Verification */}
      <EmailVerification
        email={formData.email}
        name={formData.fullName}
        isVerified={formData.isEmailVerified}
        error={errors.isEmailVerified}
        onVerified={(verified) => onChange({ isEmailVerified: verified })}
      />

      {/* Property Type */}
      <div>
        <label className="block text-sm font-medium text-secondary mb-1.5 font-dubai">
          نوع العقار <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/40">
            <Building2 className="w-5 h-5" />
          </div>
          <select
            value={formData.propertyType}
            onChange={(e) => onChange({ propertyType: e.target.value as PropertyType })}
            className={`
              w-full pr-12 pl-4 py-3 rounded-xl border-2 bg-white/50 appearance-none
              focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
              transition-all font-dubai text-right cursor-pointer
              ${errors.propertyType ? 'border-red-400' : 'border-secondary/20'}
              ${!formData.propertyType ? 'text-secondary/40' : 'text-secondary'}
            `}
          >
            <option value="">اختر نوع العقار</option>
            {propertyTypes.map((type) => (
              <option key={type} value={type}>
                {propertyTypeLabels[type]}
              </option>
            ))}
          </select>
          {/* Custom dropdown arrow */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-5 h-5 text-secondary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {errors.propertyType && (
          <p className="mt-1 text-sm text-red-500 font-dubai">{errors.propertyType}</p>
        )}
      </div>

      {/* Location Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* City */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-1.5 font-dubai">
            المدينة <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/40">
              <Map className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => onChange({ city: e.target.value })}
              placeholder="مثال: القاهرة"
              className={`
                w-full pr-12 pl-4 py-3 rounded-xl border-2 bg-white/50
                focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                transition-all font-dubai text-right
                ${errors.city ? 'border-red-400' : 'border-secondary/20'}
              `}
            />
          </div>
          {errors.city && (
            <p className="mt-1 text-sm text-red-500 font-dubai">{errors.city}</p>
          )}
        </div>

        {/* District */}
        <div>
          <label className="block text-sm font-medium text-secondary mb-1.5 font-dubai">
            الحي / المنطقة <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/40">
              <MapPin className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={formData.district}
              onChange={(e) => onChange({ district: e.target.value })}
              placeholder="مثال: مدينة نصر"
              className={`
                w-full pr-12 pl-4 py-3 rounded-xl border-2 bg-white/50
                focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                transition-all font-dubai text-right
                ${errors.district ? 'border-red-400' : 'border-secondary/20'}
              `}
            />
          </div>
          {errors.district && (
            <p className="mt-1 text-sm text-red-500 font-dubai">{errors.district}</p>
          )}
        </div>
      </div>
    </div>
  );
}
