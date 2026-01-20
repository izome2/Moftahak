'use client';

import React from 'react';
import { Phone } from 'lucide-react';
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
  showEmailVerification?: boolean;
  onEmailVerified?: (verified: boolean) => void;
}

export default function Step2PropertyDetails({ 
  formData, 
  errors, 
  studyType,
  onChange,
  showEmailVerification = false,
  onEmailVerified
}: Step2PropertyDetailsProps) {
  const handlePhoneChange = (value: string) => {
    // Only allow numbers and limit to 11 digits
    const cleaned = value.replace(/\D/g, '').slice(0, 11);
    onChange({ phoneNumber: cleaned });
  };

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-bold text-secondary mb-6 font-dubai">
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
        <label className="block text-sm font-medium text-secondary mb-2 font-dubai">
          رقم الهاتف للتواصل <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/40">
            <Phone className="w-5 h-5" />
          </div>
          <input
            type="tel"
            dir="ltr"
            value={formData.phoneNumber || ''}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="01234567890"
            className={`
              w-full pr-12 pl-4 py-3 rounded-xl border-2 bg-white/50
              focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
              transition-all font-bristone text-left
              ${errors.phoneNumber ? 'border-red-400' : 'border-secondary/20'}
            `}
          />
        </div>
        <p className="mt-1.5 text-xs text-secondary/50 font-dubai">
          هذا الرقم سيُستخدم للتواصل معك بخصوص الدراسة فقط
        </p>
        {errors.phoneNumber && (
          <p className="mt-1 text-sm text-red-500 font-dubai">{errors.phoneNumber}</p>
        )}
      </div>

      {/* Email Verification - Shows when submit clicked and not verified */}
      {showEmailVerification && !formData.isEmailVerified && onEmailVerified && (
        <div className="pt-4 border-t border-secondary/10">
          <p className="text-sm text-secondary/70 mb-3 font-dubai text-center">
            يجب التحقق من بريدك الإلكتروني لإرسال الطلب
          </p>
          <EmailVerification
            email={formData.email}
            name={formData.fullName}
            isVerified={formData.isEmailVerified}
            onVerified={onEmailVerified}
          />
        </div>
      )}
    </div>
  );
}
