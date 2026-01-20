'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Send } from 'lucide-react';
import FormStepper from './FormStepper';
import Step1BasicInfo from './Step1BasicInfo';
import Step2PropertyDetails from './Step2PropertyDetails';
import { 
  StudyRequestType, 
  step1Schema, 
  step2Schema,
  FeasibilityRequestFormData,
  defaultFormData,
  studyTypeLabels 
} from '@/lib/validations/feasibility-request';

interface FeasibilityRequestFormProps {
  studyType: StudyRequestType;
  onBack?: () => void;
}

const steps = [
  { number: 1, title: 'المعلومات الأساسية' },
  { number: 2, title: 'تفاصيل العقار' },
];

export default function FeasibilityRequestForm({ 
  studyType, 
  onBack 
}: FeasibilityRequestFormProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState<FeasibilityRequestFormData>({
    ...defaultFormData,
    studyType,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showEmailVerificationInStep2, setShowEmailVerificationInStep2] = useState(false);

  const updateFormData = (data: Partial<FeasibilityRequestFormData>) => {
    setFormData((prev: FeasibilityRequestFormData) => ({ ...prev, ...data }));
    // Clear errors for updated fields
    const updatedKeys = Object.keys(data);
    setErrors((prev: Record<string, string>) => {
      const newErrors = { ...prev };
      updatedKeys.forEach(key => delete newErrors[key]);
      return newErrors;
    });
  };

  const validateStep1 = (): boolean => {
    const result = step1Schema.safeParse({
      fullName: formData.fullName,
      email: formData.email,
      isEmailVerified: formData.isEmailVerified,
      propertyType: formData.propertyType,
      city: formData.city,
      district: formData.district,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const validateStep2 = (): boolean => {
    // For with field visit, we need room counts
    const roomsRequired = studyType === 'WITH_FIELD_VISIT';
    
    const result = step2Schema.safeParse({
      bedrooms: formData.bedrooms,
      bathrooms: formData.bathrooms,
      livingRooms: formData.livingRooms,
      kitchens: formData.kitchens,
      latitude: formData.latitude,
      longitude: formData.longitude,
      phoneNumber: formData.phoneNumber || '',
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return false;
    }

    // التحقق من أن المجموع الكلي للغرف لا يقل عن 3
    const totalRooms = formData.bedrooms + formData.bathrooms + formData.livingRooms + formData.kitchens;
    if (totalRooms < 3) {
      setErrors({ 
        bedrooms: 'يجب إضافة 3 غرف على الأقل (اي مزيج من الغرف)',
        bathrooms: '',
        livingRooms: '',
        kitchens: ''
      });
      return false;
    }

    // التحقق من تحديد الموقع
    if (!formData.latitude || !formData.longitude) {
      setErrors({ 
        latitude: 'يرجى تحديد موقع الشقة على الخريطة',
        longitude: 'يرجى تحديد موقع الشقة على الخريطة'
      });
      return false;
    }

    setErrors({});
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handlePrevious = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else if (onBack) {
      onBack();
    }
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;

    // التحقق من أن البريد موثق
    if (!formData.isEmailVerified) {
      setShowEmailVerificationInStep2(true);
      setSubmitError('يجب التحقق من البريد الإلكتروني لإرسال الطلب');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/feasibility-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'حدث خطأ أثناء إرسال الطلب');
      }

      setSubmitSuccess(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'حدث خطأ غير متوقع');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success State
  if (submitSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto py-12"
      >
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 md:p-12 text-center shadow-xl border border-secondary/10">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <Send className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-4 font-dubai">
            تم إرسال طلبك بنجاح!
          </h2>
          <p className="text-secondary/70 mb-6 font-dubai">
            شكراً لك على اختيارك مفتاحك. سيتواصل معك فريقنا خلال ٢٤ ساعة لمناقشة تفاصيل دراسة الجدوى.
          </p>
          <div className="p-4 bg-primary/10 rounded-xl mb-6">
            <p className="text-secondary font-medium font-dubai">
              نوع الدراسة: {studyTypeLabels[studyType]}
            </p>
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="px-8 py-3 bg-secondary text-white rounded-xl font-bold hover:bg-secondary/90 transition-colors font-dubai"
          >
            العودة للصفحة الرئيسية
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header - Compact */}
      <div className="text-center mb-2">
        <h1 className="text-lg md:text-xl font-bold text-secondary mb-0.5 font-dubai">
          طلب دراسة جدوى
        </h1>
        <p className="text-secondary/70 font-dubai text-xs">
          {studyTypeLabels[studyType]}
        </p>
      </div>

      {/* Stepper - Compact */}
      <FormStepper currentStep={currentStep} steps={steps} />

      {/* Form Container - Scrollable Inside */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-secondary/10 flex flex-col" style={{ height: 'calc(100vh - 220px)', minHeight: '500px' }}>
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 scrollbar-hide">
          <AnimatePresence mode="wait">
          {currentStep === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Step1BasicInfo
                formData={formData}
                errors={errors}
                onChange={updateFormData}
              />
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Step2PropertyDetails
                formData={formData}
                errors={errors}
                studyType={studyType}
                onChange={updateFormData}
                showEmailVerification={showEmailVerificationInStep2}
                onEmailVerified={(verified) => {
                  updateFormData({ isEmailVerified: verified });
                  if (verified) {
                    setShowEmailVerificationInStep2(false);
                    setSubmitError(null);
                  }
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Message */}
        {submitError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-center font-dubai"
          >
            {submitError}
          </motion.div>
        )}
        </div>

        {/* Navigation Buttons - Fixed at bottom */}
        <div className="flex items-center justify-between p-6 border-t border-secondary/10 bg-white/50 rounded-b-2xl shrink-0">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 1 && !onBack}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all font-dubai
              ${currentStep === 1 && !onBack
                ? 'opacity-50 cursor-not-allowed text-secondary/40'
                : 'text-secondary hover:bg-secondary/5'
              }
            `}
          >
            <ArrowRight className="w-5 h-5" />
            <span>السابق</span>
          </button>

          {currentStep === 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 px-8 py-3 bg-primary text-secondary rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl font-dubai"
            >
              <span>التالي</span>
              <ArrowRight className="w-5 h-5 rotate-180" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3 bg-secondary text-white rounded-xl font-bold hover:bg-secondary/90 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-dubai"
            >
              {isSubmitting ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>جاري الإرسال...</span>
                </>
              ) : (
                <>
                  <span>إرسال الطلب</span>
                  <Send className="w-5 h-5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
