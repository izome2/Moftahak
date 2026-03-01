'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}


export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2
        className={`${sizeClasses[size]} text-primary animate-spin`}
        aria-hidden="true"
      />
      {text && (
        <p className="text-secondary/70 text-sm md:text-base">{text}</p>
      )}
      <span className="sr-only">جاري التحميل...</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className="fixed inset-0 bg-accent/50 backdrop-blur-sm z-50 flex items-center justify-center"
        role="status"
        aria-live="polite"
      >
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8" role="status" aria-live="polite">
      {content}
    </div>
  );
};

export default LoadingSpinner;
