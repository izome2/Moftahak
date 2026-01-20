'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface FormStepperProps {
  currentStep: 1 | 2;
  steps: { number: number; title: string }[];
}

export default function FormStepper({ currentStep, steps }: FormStepperProps) {
  return (
    <div className="flex items-center justify-center gap-2 md:gap-3 mb-3">
      {steps.map((step, index) => {
        const isCompleted = currentStep > step.number;
        const isActive = currentStep === step.number;
        const isLast = index === steps.length - 1;

        return (
          <React.Fragment key={step.number}>
            {/* Step Circle & Label */}
            <div className="flex flex-col items-center gap-0.5">
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.1 : 1,
                  backgroundColor: isCompleted 
                    ? '#10302b' // secondary
                    : isActive 
                      ? '#edbf8c' // primary
                      : '#f5e6d3', // light bg
                  borderColor: isCompleted || isActive 
                    ? '#10302b' 
                    : '#d4c4b0',
                }}
                transition={{ duration: 0.3 }}
                className={`
                  w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center
                  border-2 transition-colors
                `}
              >
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                ) : (
                  <span className={`
                    text-xs md:text-sm font-bold font-bristone
                    ${isActive ? 'text-secondary' : 'text-secondary/40'}
                  `}>
                    {step.number}
                  </span>
                )}
              </motion.div>
              
              <span className={`
                text-[10px] font-medium font-dubai text-center whitespace-nowrap
                ${isActive || isCompleted ? 'text-secondary' : 'text-secondary/40'}
              `}>
                {step.title}
              </span>
            </div>

            {/* Connector Line */}
            {!isLast && (
              <div className="flex-1 max-w-12 md:max-w-20 h-0.5 bg-secondary/10 relative -mt-5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ 
                    width: isCompleted ? '100%' : '0%' 
                  }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  className="absolute inset-y-0 right-0 bg-secondary"
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
