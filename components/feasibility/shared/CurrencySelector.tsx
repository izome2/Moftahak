'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Check } from 'lucide-react';
import { useFeasibilityEditorSafe } from '@/contexts/FeasibilityEditorContext';
import { CURRENCY_LIST, getCurrencySymbol, type CurrencyCode } from '@/lib/feasibility/currency';

interface CurrencySelectorProps {
  className?: string;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const editor = useFeasibilityEditorSafe();
  
  // إذا لم يكن داخل Provider، لا تعرض شيء
  if (!editor) return null;
  
  const { currency, setCurrency } = editor;
  const currentSymbol = getCurrencySymbol(currency);

  // إغلاق القائمة عند النقر خارجها
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectCurrency = (code: CurrencyCode) => {
    setCurrency(code);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* زر العملة */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-secondary hover:bg-primary/10 rounded-lg transition-colors"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Coins className="w-4 h-4" />
        <span className="font-dubai text-sm font-bold min-w-[32px]">{currentSymbol}</span>
      </motion.button>

      {/* القائمة المنسدلة */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-2 w-48 bg-white shadow-lg border-2 border-primary/20 rounded-xl overflow-hidden z-[100]"
            style={{ boxShadow: 'rgba(16, 48, 43, 0.15) 0px 8px 24px' }}
          >
            {/* العنوان */}
            <div className="px-4 py-2 bg-accent/50 border-b border-primary/10">
              <span className="font-dubai text-sm text-secondary/70">اختر العملة</span>
            </div>
            
            {/* خيارات العملات */}
            {CURRENCY_LIST.map((curr) => (
              <button
                key={curr.code}
                onClick={() => handleSelectCurrency(curr.code)}
                className={`w-full px-4 py-3 flex items-center justify-between hover:bg-accent/50 transition-colors ${
                  currency === curr.code ? 'bg-primary/10' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-dubai text-lg font-bold text-primary min-w-[40px]">
                    {curr.symbol}
                  </span>
                  <span className="font-dubai text-sm text-secondary">
                    {curr.nameAr}
                  </span>
                </div>
                {currency === curr.code && (
                  <Check className="w-4 h-4 text-green-600" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay للإغلاق */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[90]" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default CurrencySelector;
