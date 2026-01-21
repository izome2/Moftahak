'use client';

import React from 'react';
import { Phone, Mail } from 'lucide-react';
import RoomCounters from './RoomCounters';
import LocationPicker from './LocationPicker';
import EmailVerification from './EmailVerification';
import { 
  FeasibilityRequestFormData, 
  StudyRequestType 
} from '@/lib/validations/feasibility-request';

interface Step2PropertyDetailsProps {
  formData: FeasibilityRequestFormData;
  errors: Record<string, string>;
  studyType: StudyRequestType;
  onChange: (data: Partial<FeasibilityRequestFormData>) => void;
}

export default function Step2PropertyDetails({ 
  formData, 
  errors, 
  studyType,
  onChange
}: Step2PropertyDetailsProps) {
  const handlePhoneChange = (value: string) => {
    // Only allow numbers and limit to 11 digits
    const cleaned = value.replace(/\D/g, '').slice(0, 11);
    onChange({ phoneNumber: cleaned });
  };

  return (
    <div className="space-y-5 md:space-y-8">
      <h2 className="text-lg md:text-xl font-bold text-secondary mb-4 md:mb-6 font-dubai">
        تفاصيل العقار
      </h2>

      {/* Room Counters - For BOTH types now */}
      <RoomCounters
        bedrooms={formData.bedrooms}
        bathrooms={formData.bathrooms}
        livingRooms={formData.livingRooms}
        kitchens={formData.kitchens}
        onChange={(rooms) => onChange(rooms)}
        errors={errors}
      />

      {/* Location Picker Map */}
      <LocationPicker
        latitude={formData.latitude}
        longitude={formData.longitude}
        onChange={(lat, lng) => onChange({ latitude: lat, longitude: lng })}
        error={errors.latitude || errors.longitude}
      />

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-secondary/10" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 bg-white text-secondary/50 text-sm font-dubai">
            بيانات التواصل
          </span>
        </div>
      </div>

      {/* Phone Number - For Contact Only */}
      <div>
        <label className="block text-xs md:text-sm font-medium text-secondary mb-1.5 md:mb-2 font-dubai">
          رقم الهاتف للتواصل <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-secondary/40">
            <Phone className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          <input
            type="tel"
            dir="ltr"
            value={formData.phoneNumber || ''}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="01234567890"
            className={`
              w-full pr-10 md:pr-12 pl-4 py-2.5 md:py-3 rounded-xl border-2 bg-white/50
              focus:outline-none focus:border-primary
              transition-all font-bristone text-left text-sm md:text-base
              ${errors.phoneNumber ? 'border-red-400' : 'border-secondary/20'}
            `}
          />
        </div>
        <p className="mt-1 md:mt-1.5 text-[10px] md:text-xs text-secondary/50 font-dubai">
          هذا الرقم سيُستخدم للتواصل معك بخصوص الدراسة فقط
        </p>
        {errors.phoneNumber && (
          <p className="mt-1 text-sm text-red-500 font-dubai">{errors.phoneNumber}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-xs md:text-sm font-medium text-secondary mb-1.5 md:mb-2 font-dubai">
          البريد الإلكتروني <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-secondary/40">
            <Mail className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          <input
            type="email"
            dir="ltr"
            value={formData.email}
            onChange={(e) => onChange({ email: e.target.value, isEmailVerified: false })}
            placeholder="example@email.com"
            disabled={formData.isEmailVerified}
            className={`
              w-full pr-10 md:pr-12 pl-4 py-2.5 md:py-3 rounded-xl border-2 bg-white/50
              focus:outline-none focus:border-primary
              transition-all font-bristone text-left text-sm md:text-base
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
    </div>
  );
}
