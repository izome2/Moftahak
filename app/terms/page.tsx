import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import TermsContent from './TermsContent';

export const metadata: Metadata = {
  title: 'شروط الخدمة',
  description: 'شروط الخدمة لموقع مفتاحك - الشروط والأحكام المتعلقة باستخدام الموقع والخدمات',
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <TermsContent />
    </>
  );
}
