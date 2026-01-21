'use client';

import React from 'react';
import { User, MapPin, Map } from 'lucide-react';
import { 
  FeasibilityRequestFormData, 
  PropertyType,
  propertyTypeLabels 
} from '@/lib/validations/feasibility-request';

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
              focus:outline-none focus:border-primary
              transition-all font-dubai text-right
              ${errors.fullName ? 'border-red-400' : 'border-secondary/20'}
            `}
          />
        </div>
        {errors.fullName && (
          <p className="mt-1 text-sm text-red-500 font-dubai">{errors.fullName}</p>
        )}
      </div>

      {/* Property Type - Selection Cards */}
      <div>
        <label className="block text-sm font-medium text-secondary mb-2 font-dubai">
          نوع العقار <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {propertyTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onChange({ propertyType: type })}
              className={`
                py-2.5 px-3 rounded-xl border-2 text-center font-dubai text-sm
                transition-all duration-200 cursor-pointer
                ${formData.propertyType === type 
                  ? 'border-primary bg-primary/20 text-secondary font-bold' 
                  : 'border-secondary/20 bg-white/50 text-secondary/70 hover:border-primary/50 hover:bg-primary/5'
                }
                ${errors.propertyType ? 'border-red-400' : ''}
              `}
            >
              {propertyTypeLabels[type]}
            </button>
          ))}
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
                focus:outline-none focus:border-primary
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
                focus:outline-none focus:border-primary
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
