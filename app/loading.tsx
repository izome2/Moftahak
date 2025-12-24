import LoadingSpinner from '@/components/LoadingSpinner';

/**
 * Global Loading Page
 * Displayed while page is loading
 */
export default function Loading() {
  return (
    <div className="min-h-screen bg-accent flex items-center justify-center">
      <LoadingSpinner size="lg" text="جاري تحميل الصفحة..." fullScreen />
    </div>
  );
}
