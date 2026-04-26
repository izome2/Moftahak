import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import PrivacyContent from './PrivacyContent';

export const metadata: Metadata = {
  title: 'سياسة الخصوصية',
  description: 'سياسة الخصوصية لموقع مفتاحك - نحترم خصوصيتك ونحمي بياناتك الشخصية',
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <PrivacyContent />
    </>
  );
}
