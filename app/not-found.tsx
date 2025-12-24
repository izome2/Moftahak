import Link from 'next/link';
import { Home, Search } from 'lucide-react';

/**
 * 404 Not Found Page
 * Displayed when a page doesn't exist
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-accent flex items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        <div className="bg-white border-4 border-primary/20 rounded-2xl p-8 md:p-16 shadow-2xl">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="text-8xl md:text-9xl font-bold text-primary/20 font-bristone">
              404
            </div>
            <Search className="w-16 h-16 text-primary mx-auto -mt-8" aria-hidden="true" />
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
            الصفحة غير موجودة
          </h1>

          {/* Description */}
          <p className="text-base md:text-lg text-secondary/70 mb-8">
            عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى موقع آخر.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-secondary font-bold hover:bg-primary/90 transition-colors rounded-lg shadow-md">
              <Home size={20} />
              العودة للصفحة الرئيسية
            </Link>
            <Link href="/" className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-primary text-primary font-bold hover:bg-primary hover:text-secondary transition-colors rounded-lg">
              تصفح الموقع
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
