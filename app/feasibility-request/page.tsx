'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Container from '@/components/ui/Container';
import LoadingSpinner from '@/components/LoadingSpinner';
import StudyTypeSelector from '@/components/feasibility-request/StudyTypeSelector';
import FeasibilityRequestForm from '@/components/feasibility-request/FeasibilityRequestForm';
import { StudyRequestType } from '@/lib/validations/feasibility-request';

function FeasibilityRequestContent() {
  const searchParams = useSearchParams();
  const typeParam = searchParams.get('type');
  
  // تحديد إذا كان النوع محدد مسبقاً من URL (قادم من قسم الخدمات)
  const preselectedType: StudyRequestType | null = (() => {
    if (typeParam === 'with-field') return 'WITH_FIELD_VISIT';
    if (typeParam === 'without-field') return 'WITHOUT_FIELD_VISIT';
    return null;
  })();

  // حالة النوع المختار (بعد الضغط على الزر)
  const [selectedType, setSelectedType] = useState<StudyRequestType | null>(null);
  
  // تحديد إذا كان المستخدم ضغط على "ابدأ الآن" أو "اختر هذا النوع"
  const [showForm, setShowForm] = useState(false);

  const handleTypeSelect = (type: StudyRequestType) => {
    setSelectedType(type);
    setShowForm(true);
  };

  const handleBack = () => {
    setShowForm(false);
    setSelectedType(null);
  };

  // إذا كان النوع محدد مسبقاً ولم يتم الضغط على الزر بعد، نعرض الشاشة مع الخدمة المختارة فقط
  // إذا تم الضغط على الزر، نعرض الفورم
  const currentType = selectedType || preselectedType;

  return (
    <div className="min-h-screen bg-linear-to-b from-[#fdf6ee] via-[#f5e6d3] to-[#f0dcc4]">
      <Navbar />
      
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/patterns/pattern-vertical-white.png)',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            opacity: 0.3,
          }}
        />
      </div>
      
      <main className="relative z-10 pt-20 pb-8">
        <Container>
          <AnimatePresence mode="wait">
            {!showForm ? (
              <motion.div
                key="selector"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <StudyTypeSelector 
                  onSelect={handleTypeSelect} 
                  preselectedType={preselectedType}
                />
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <FeasibilityRequestForm 
                  studyType={currentType!} 
                  onBack={handleBack}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </Container>
      </main>
    </div>
  );
}

export default function FeasibilityRequestPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-linear-to-b from-[#fdf6ee] via-[#f5e6d3] to-[#f0dcc4] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    }>
      <FeasibilityRequestContent />
    </Suspense>
  );
}
