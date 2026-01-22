'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Send, Copy, Check, MessageCircle, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
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
  const [paymentCode, setPaymentCode] = useState<string | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState<number>(3);
  const [manualRedirect, setManualRedirect] = useState(false); // Track manual redirect
  
  // Ref for the scrollable content area
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);

  // Handle wheel events anywhere on the page to scroll the form content
  useEffect(() => {
    const handleGlobalWheel = (e: WheelEvent) => {
      const scrollContainer = scrollContainerRef.current;
      
      if (!scrollContainer) return;
      
      // Check if target is inside an input that should handle its own scroll (like map)
      const target = e.target as HTMLElement;
      const isInsideMap = target.closest('.leaflet-container');
      
      if (isInsideMap) return; // Let map handle its own zoom
      
      // Prevent default page scroll and scroll the form content instead
      e.preventDefault();
      scrollContainer.scrollTop += e.deltaY;
    };

    // Use capture phase to intercept before other handlers
    window.addEventListener('wheel', handleGlobalWheel, { passive: false, capture: true });
    return () => window.removeEventListener('wheel', handleGlobalWheel, { capture: true });
  }, []);

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
      email: formData.email,
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

      // حفظ رمز الدفع
      if (data.paymentCode) {
        setPaymentCode(data.paymentCode);
      }
      
      setSubmitSuccess(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'حدث خطأ غير متوقع');
    } finally {
      setIsSubmitting(false);
    }
  };

  // نسخ رمز الدفع
  const copyPaymentCode = () => {
    if (paymentCode) {
      navigator.clipboard.writeText(paymentCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  // إنشاء رابط واتساب مع الرسالة الجاهزة
  const getWhatsAppLink = () => {
    const phone = '201091507717';
    const message = `السلام عليكم،

أود تأكيد طلب دراسة الجدوى الخاص بي.

رمز الدفع: ${paymentCode}
نوع الدراسة: ${studyTypeLabels[studyType]}

⚠️ تنبيه: يرجى عدم تعديل هذه الرسالة لضمان معالجة طلبك بشكل صحيح.`;
    
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  // التوجيه التلقائي إلى واتساب بعد 3 ثواني
  useEffect(() => {
    if (submitSuccess && paymentCode && !manualRedirect) {
      const countdown = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdown);
            window.open(getWhatsAppLink(), '_blank');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdown);
    }
  }, [submitSuccess, paymentCode, manualRedirect]);

  // Success State
  if (submitSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl mx-auto px-1 md:px-4 py-3 md:py-12"
      >
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl py-10 px-6 pb-6 md:py-12 md:px-10 text-center shadow-xl border border-secondary/10 relative overflow-hidden w-full">
          {/* دوائر خلفية ديكورية */}
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          
          {/* أيقونة النجاح */}
          <div className="w-28 h-28 md:w-28 md:h-28 mx-auto mb-5 rounded-full bg-primary/20 flex items-center justify-center relative z-10">
            <Send className="w-14 h-14 md:w-14 md:h-14 text-primary" />
          </div>
          
          <h2 className="text-2xl md:text-2xl font-bold text-secondary mb-3 font-dubai relative z-10">
            تم إرسال طلبك بنجاح!
          </h2>
          
          <p className="text-secondary/70 mb-5 font-dubai text-base md:text-base relative z-10 leading-relaxed">
            عزيزي العميل.. يرجى إتمام عملية الدفع للبدء في دراسة الجدوى. انتقل للواتساب لاستلام تفاصيل الدفع.
          </p>

          {/* عداد التوجيه التلقائي */}
          {redirectCountdown > 0 && !manualRedirect && (
            <div className="mb-4 p-3 bg-primary/10 border border-primary/30 rounded-xl text-secondary text-sm font-dubai relative z-10">
              سيتم توجيهك تلقائياً إلى واتساب خلال {redirectCountdown} {redirectCountdown === 1 ? 'ثانية' : 'ثواني'}...
            </div>
          )}
          
          {/* رمز الدفع */}
          {paymentCode && (
            <div className="p-5 md:p-6 bg-primary/10 rounded-2xl mb-5 border-2 border-primary/30 relative z-10">
              <p className="text-secondary/60 text-sm md:text-sm mb-2 font-dubai">رمز الدفع الخاص بك</p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl md:text-3xl font-bold text-secondary font-mono tracking-widest" dir="ltr">
                  {paymentCode}
                </span>
                <button
                  onClick={copyPaymentCode}
                  className="p-1.5 rounded-lg bg-secondary/10 hover:bg-secondary/20 transition-colors"
                  title="نسخ الرمز"
                >
                  {codeCopied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-secondary" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* طرق الدفع */}
          <div className="mb-6 relative z-10">
            <p className="text-secondary/70 mb-3 font-dubai text-sm md:text-sm">
              طرق الدفع المتاحة:
            </p>
            <div className="flex justify-center items-center gap-4">
              <Image 
                src="/images/payment/vodafone-cash.png" 
                alt="فودافون كاش"
                width={50}
                height={50}
                className="object-contain rounded-lg"
              />
              <Image 
                src="/images/payment/instapay.png" 
                alt="انستا باي"
                width={50}
                height={50}
                className="object-contain rounded-lg"
              />
              <Image 
                src="/images/payment/visa.png" 
                alt="فيزا"
                width={50}
                height={50}
                className="object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
        
        {/* زر واتساب - منفصل */}
        <a
          href={getWhatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setManualRedirect(true)} // Cancel auto-redirect when clicked
          className="mt-4 w-full bg-[#22c55e] hover:bg-[#20BA5A] text-white rounded-2xl shadow-xl border-2 border-[#1fbb58] p-4 md:p-5 transition-all inline-flex items-center justify-center gap-3 font-bold font-dubai text-base md:text-base"
        >
          <Image 
            src="/images/payment/whatsapp.png" 
            alt="واتساب"
            width={35}
            height={35}
            className="object-contain"
          />
          <span>الانتقال إلى واتساب للدفع</span>
        </a>
        
        {/* زر العودة - منفصل تماماً */}
        <button
          onClick={() => window.location.href = '/'}
          className="mt-4 w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-secondary/10 p-4 md:p-5 hover:bg-white/80 transition-all inline-flex items-center justify-center gap-2 text-secondary font-bold font-dubai text-base md:text-base"
        >
          <span>العودة للصفحة الرئيسية</span>
          <ArrowRight className="w-5 h-5 flex-shrink-0" />
        </button>
      </motion.div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto transition-all duration-500 ease-in-out ${
      currentStep === 1 ? '' : 'pt-4 md:pt-10'
    }`}>
      {/* Header - Hidden in step 2 */}
      <div className={`text-center transition-all duration-300 overflow-hidden ${
        currentStep === 1 ? 'mb-4 max-h-20 opacity-100' : 'mb-0 max-h-0 opacity-0'
      }`}>
        <h1 className="text-2xl md:text-3xl font-bold text-secondary font-dubai">
          طلب دراسة جدوى
        </h1>
      </div>

      {/* Stepper */}
      <FormStepper currentStep={currentStep} steps={steps} />

      {/* Form Container - Fixed heights for smooth transition */}
      <div 
        ref={formContainerRef}
        className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-secondary/10 flex flex-col transition-all duration-500 ease-in-out overflow-hidden ${
          currentStep === 1 
            ? 'h-[480px]' 
            : 'h-[calc(100vh-140px)] md:h-[calc(100vh-180px)]'
        }`}
      >
        {/* Scrollable Content */}
        <div ref={scrollContainerRef} className="flex-1 p-4 md:p-6 lg:p-8 scrollbar-hide overflow-y-auto">
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
        <div className="flex items-center justify-between p-3 md:p-6 border-t border-secondary/10 bg-white/50 rounded-b-2xl shrink-0">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentStep === 1 && !onBack}
            className={`
              flex items-center gap-1.5 md:gap-2 px-3 md:px-6 py-2.5 md:py-3 rounded-xl font-medium transition-all font-dubai text-sm md:text-base
              ${currentStep === 1 && !onBack
                ? 'opacity-50 cursor-not-allowed text-secondary/40'
                : 'text-secondary hover:bg-secondary/5'
              }
            `}
          >
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            <span>السابق</span>
          </button>

          {currentStep === 1 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 md:gap-2 px-5 md:px-8 py-2.5 md:py-3 bg-primary text-secondary rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl font-dubai text-sm md:text-base"
            >
              <span>التالي</span>
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 rotate-180" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-1.5 md:gap-2 px-5 md:px-8 py-2.5 md:py-3 bg-secondary text-white rounded-xl font-bold hover:bg-secondary/90 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-dubai text-sm md:text-base"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 md:w-5 md:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>جاري الإرسال...</span>
                </>
              ) : (
                <>
                  <span>إرسال الطلب</span>
                  <Send className="w-4 h-4 md:w-5 md:h-5" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
