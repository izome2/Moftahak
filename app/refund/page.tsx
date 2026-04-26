import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import RefundContent from './RefundContent';

export const metadata: Metadata = {
  title: 'سياسة الاسترداد',
  description: 'سياسة الاسترداد لموقع مفتاحك - تعرف على شروط وأحكام استرداد المبالغ',
};

export default function RefundPage() {
  return (
    <>
      <Navbar />
      <RefundContent />
    </>
  );
}
