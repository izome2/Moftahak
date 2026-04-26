import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/Navbar';

export default async function CoursePaymentSuccessPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdf6ee] via-[#f5e6d3] to-[#f0dcc4]" dir="rtl">
      <Navbar />
      <main className="min-h-[calc(100vh-64px)] px-4 pt-28 pb-10 flex items-center justify-center">
        <div className="w-full max-w-xl bg-white/90 rounded-2xl border border-secondary/10 shadow-xl px-6 py-10 text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 mx-auto mb-5 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold text-secondary mb-3 font-dubai">تم الدفع بنجاح</h1>
          <p className="text-secondary/70 font-dubai mb-2">تم تسجيلك في الدورة بعد تأكيد Paymob.</p>
          <p className="text-secondary/50 text-sm font-dubai mb-6">
            إذا لم يظهر الوصول فورًا، انتظر لحظات قليلة حتى يصل تأكيد الدفع النهائي.
          </p>
          <Link
            href={`/courses/${encodeURIComponent(decodedSlug)}/watch`}
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-secondary text-white font-bold font-dubai hover:bg-secondary/90 transition-colors"
          >
            الذهاب إلى الدورة
          </Link>
        </div>
      </main>
    </div>
  );
}
