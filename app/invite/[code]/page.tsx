'use client';

import React, { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import { Shield, Loader2, AlertCircle, Clock } from 'lucide-react';
import RegisterForm from '@/components/auth/RegisterForm';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

const ROLE_LABELS: Record<string, string> = {
  GENERAL_MANAGER: 'المدير العام',
  OPS_MANAGER: 'مدير التشغيل',
  BOOKING_MANAGER: 'مدير الحجوزات',
  INVESTOR: 'مستثمر',
};

const ROLE_COLORS: Record<string, string> = {
  GENERAL_MANAGER: 'bg-purple-100 text-purple-700',
  OPS_MANAGER: 'bg-blue-100 text-blue-700',
  BOOKING_MANAGER: 'bg-green-100 text-green-700',
  INVESTOR: 'bg-amber-100 text-amber-700',
};

interface InviteData {
  valid: boolean;
  role: string;
  roleLabel: string;
  expiresAt: string;
  error?: string;
}

export default function InvitePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    // If already logged in, redirect to home
    if (session) {
      router.push('/');
      return;
    }

    const validateInvite = async () => {
      try {
        const res = await fetch(`/api/auth/invite/${encodeURIComponent(code)}`);
        const data = await res.json();
        
        if (data.valid) {
          setInviteData(data);
        } else {
          setErrorMessage(data.error || 'رابط الدعوة غير صالح');
        }
      } catch {
        setErrorMessage('حدث خطأ في التحقق من الدعوة');
      } finally {
        setIsLoading(false);
      }
    };

    validateInvite();
  }, [code, session, router]);

  const getRemainingTime = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'منتهية';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days} يوم و ${hours % 24} ساعة`;
    return `${hours} ساعة`;
  };

  const handleRegistrationSuccess = () => {
    router.push('/accounting');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-accent flex items-center justify-center" dir="rtl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3"
        >
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-secondary/60 font-dubai">جاري التحقق من الدعوة...</p>
        </motion.div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-accent flex items-center justify-center p-4" dir="rtl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-secondary font-dubai mb-2">
            الدعوة غير صالحة
          </h1>
          <p className="text-sm text-secondary/60 font-dubai mb-6">{errorMessage}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2.5 bg-secondary text-white rounded-xl text-sm font-bold font-dubai hover:bg-secondary/90 transition"
          >
            العودة للصفحة الرئيسية
          </button>
        </motion.div>
      </div>
    );
  }

  if (!inviteData) return null;

  return (
    <div className="min-h-screen bg-accent flex items-center justify-center p-4" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
      >
        {/* Invite header */}
        <div className="bg-secondary/5 border-b-2 border-primary/10 p-5">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-bold text-secondary font-dubai">دعوة للانضمام</h1>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className={`text-sm rounded-lg px-3 py-1 font-bold font-dubai ${ROLE_COLORS[inviteData.role] || 'bg-secondary/10 text-secondary'}`}>
              {inviteData.roleLabel}
            </span>
          </div>
          <div className="flex items-center justify-center gap-1 mt-2 text-[11px] text-secondary/40 font-dubai">
            <Clock className="w-3 h-3" />
            <span>متبقي: {getRemainingTime(inviteData.expiresAt)}</span>
          </div>
        </div>

        {/* Registration form */}
        <div className="p-5">
          <p className="text-xs text-secondary/50 font-dubai text-center mb-4">
            أنشئ حسابك للانضمام للفريق
          </p>
          <RegisterForm
            onSwitchToLogin={() => router.push('/')}
            onSuccess={handleRegistrationSuccess}
            inviteCode={code}
          />
        </div>
      </motion.div>
    </div>
  );
}
