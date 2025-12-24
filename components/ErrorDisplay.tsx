'use client';

import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface ErrorDisplayProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  showRetry?: boolean;
  showHome?: boolean;
}

/**
 * Error Display Component
 * Shows error state with optional retry and home buttons
 */
export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title = 'حدث خطأ ما',
  message = 'عذراً، حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.',
  onRetry,
  onGoHome,
  showRetry = true,
  showHome = false,
}) => {
  return (
    <div
      className="flex flex-col items-center justify-center p-8 md:p-16 text-center"
      role="alert"
      aria-live="assertive"
    >
      <div className="bg-red-50 border-4 border-red-500/20 rounded-xl p-8 md:p-12 max-w-2xl">
        <AlertCircle
          className="w-16 h-16 text-red-500 mx-auto mb-4"
          aria-hidden="true"
        />
        <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-4">
          {title}
        </h2>
        <p className="text-base md:text-lg text-secondary/70 mb-8">
          {message}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {showRetry && onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-secondary font-bold hover:bg-primary/90 transition-colors rounded-lg shadow-md"
              aria-label="إعادة المحاولة"
            >
              <RefreshCw size={20} />
              إعادة المحاولة
            </button>
          )}
          {showHome && onGoHome && (
            <button
              onClick={onGoHome}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-primary text-primary font-bold hover:bg-primary hover:text-secondary transition-colors rounded-lg"
              aria-label="العودة للصفحة الرئيسية"
            >
              <Home size={20} />
              الصفحة الرئيسية
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
