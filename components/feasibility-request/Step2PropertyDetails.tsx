'use client';

import React from 'react';
import RoomCounters from './RoomCounters';
import LocationPicker from './LocationPicker';
import FirebasePhoneVerification from './FirebasePhoneVerification';
import { 
  FeasibilityRequestFormData, 
  StudyRequestType 
} from '@/lib/validations/feasibility-request';

interface Step2PropertyDetailsProps {
  formData: FeasibilityRequestFormData;
  errors: Record<string, string>;
  studyType: StudyRequestType;
  onChange: (data: Partial<FeasibilityRequestFormData>) => void;
  userPhone?: string; // رقم هاتف المستخدم المسجل دخول (إذا كان مسجل برقم هاتف)
}

export default function Step2PropertyDetails({ 
  formData, 
  errors, 
  studyType,
  onChange,
  userPhone
}: Step2PropertyDetailsProps) {
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

      {/* Phone Verification with Firebase */}
      <FirebasePhoneVerification
        phoneNumber={formData.phoneNumber}
        isVerified={formData.isPhoneVerified}
        error={errors.phoneNumber || errors.isPhoneVerified}
        onPhoneChange={(phone, keepVerification) => onChange({ 
          phoneNumber: phone, 
          ...(keepVerification ? {} : { isPhoneVerified: false })
        })}
        onVerified={(verified) => onChange({ isPhoneVerified: verified })}
        userPhone={userPhone}
      />
    </div>
  );
}
