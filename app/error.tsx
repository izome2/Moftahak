'use client';

import { useEffect } from 'react';
import ErrorDisplay from '@/components/ErrorDisplay';

/**
 * Global Error Page
 * Catches and displays errors throughout the application
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-accent flex items-center justify-center">
      <ErrorDisplay
        title="عذراً، حدث خطأ!"
        message={
          error.message ||
          'حدث خطأ غير متوقع أثناء تحميل الصفحة. يرجى المحاولة مرة أخرى.'
        }
        onRetry={reset}
        showRetry={true}
        showHome={true}
        onGoHome={() => {
          window.location.href = '/';
        }}
      />
    </div>
  );
}
