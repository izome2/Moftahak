'use client';

import LoadingSpinner from '@/components/LoadingSpinner';
import { useTranslation } from '@/hooks/useTranslation';

export default function Loading() {
  const t = useTranslation();
  return (
    <div className="min-h-screen bg-accent flex items-center justify-center">
      <LoadingSpinner size="lg" text={t.loadingPage} fullScreen />
    </div>
  );
}
