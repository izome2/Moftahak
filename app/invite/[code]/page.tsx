'use client';

import React, { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Loader2, AlertCircle, Clock, CheckCircle2, UserPlus, LogIn, ArrowRight } from 'lucide-react';
import RegisterForm from '@/components/auth/RegisterForm';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { signIn } from 'next-auth/react';
import { isEmail, isPhone, normalizePhone } from '@/lib/validations/auth';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'المسؤول الأساسي',
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

type PageMode = 'select' | 'new-account' | 'existing-account';

export default function InvitePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const [inviteData, setInviteData] = useState<InviteData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // وضع الصفحة: اختيار، حساب جديد، حساب موجود
  const [mode, setMode] = useState<PageMode>('select');
  
  // قبول الدعوة للمستخدم المسجل
  const [isAccepting, setIsAccepting] = useState(false);
  const [acceptError, setAcceptError] = useState('');
  const [acceptSuccess, setAcceptSuccess] = useState('');

  // تسجيل دخول الحساب الموجود
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
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
  }, [code]);

  const getRemainingTime = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'منتهية';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days} يوم و ${hours % 24} ساعة`;
    return `${hours} ساعة`;
  };

  // قبول الدعوة للمستخدم المسجّل
  const handleAcceptInvite = async () => {
    setIsAccepting(true);
    setAcceptError('');
    setAcceptSuccess('');

    try {
      const res = await fetch(`/api/auth/invite/${encodeURIComponent(code)}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (data.success) {
        setAcceptSuccess(data.message);
        // تحديث الجلسة لتعكس الدور الجديد
        await updateSession();
        setTimeout(() => {
          window.location.href = '/accounting';
        }, 1500);
      } else {
        setAcceptError(data.message || 'حدث خطأ في قبول الدعوة');
      }
    } catch {
      setAcceptError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setIsAccepting(false);
    }
  };

  // تسجيل الدخول ثم قبول الدعوة
  const handleLoginAndAccept = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    if (!loginIdentifier.trim()) {
      setLoginError('يرجى إدخال البريد الإلكتروني أو رقم الهاتف');
      setIsLoggingIn(false);
      return;
    }

    if (!isEmail(loginIdentifier) && !isPhone(loginIdentifier)) {
      setLoginError('يرجى إدخال بريد إلكتروني أو رقم هاتف صالح');
      setIsLoggingIn(false);
      return;
    }

    try {
      const normalizedIdentifier = isPhone(loginIdentifier) 
        ? normalizePhone(loginIdentifier) 
        : loginIdentifier;

      const result = await signIn('credentials', {
        identifier: normalizedIdentifier,
        password: loginPassword,
        redirect: false,
      });

      if (result?.error) {
        setLoginError('البيانات غير صحيحة. يرجى التحقق من بياناتك');
        setIsLoggingIn(false);
        return;
      }

      if (result?.ok) {
        // بعد تسجيل الدخول بنجاح، نقبل الدعوة مباشرة
        const acceptRes = await fetch(`/api/auth/invite/${encodeURIComponent(code)}/accept`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        const acceptData = await acceptRes.json();

        if (acceptData.success) {
          setAcceptSuccess(acceptData.message);
          await updateSession();
          setTimeout(() => {
            window.location.href = '/accounting';
          }, 1500);
        } else {
          setAcceptError(acceptData.message || 'حدث خطأ في قبول الدعوة');
          setIsLoggingIn(false);
        }
      }
    } catch {
      setLoginError('حدث خطأ غير متوقع');
      setIsLoggingIn(false);
    }
  };

  const handleRegistrationSuccess = () => {
    router.push('/accounting');
  };

  // ====== حالات التحميل والخطأ ======

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

  // ====== رسالة النجاح ======
  if (acceptSuccess) {
    return (
      <div className="min-h-screen bg-accent flex items-center justify-center p-4" dir="rtl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-green-50 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-xl font-bold text-secondary font-dubai mb-2">
            تم بنجاح!
          </h1>
          <p className="text-sm text-secondary/60 font-dubai mb-4">{acceptSuccess}</p>
          <p className="text-xs text-secondary/40 font-dubai">جاري التحويل لنظام الحسابات...</p>
        </motion.div>
      </div>
    );
  }

  // ====== المستخدم مسجّل دخول بالفعل ======
  if (session?.user) {
    const userRole = session.user.role;
    const isProtected = userRole === 'ADMIN' || userRole === 'GENERAL_MANAGER';

    return (
      <div className="min-h-screen bg-accent flex items-center justify-center p-4" dir="rtl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
        >
          {/* رأس الدعوة */}
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

          <div className="p-5">
            {/* معلومات المستخدم الحالي */}
            <div className="bg-secondary/5 rounded-xl p-4 mb-4">
              <p className="text-xs text-secondary/50 font-dubai mb-1">مسجّل الدخول كـ:</p>
              <p className="text-sm font-bold text-secondary font-dubai">
                {session.user.firstName} {session.user.lastName}
              </p>
              <p className="text-xs text-secondary/40 font-dubai">
                الدور الحالي: {ROLE_LABELS[userRole] || userRole}
              </p>
            </div>

            {isProtected ? (
              /* محمي - لا يمكن تغيير الدور */
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <AlertCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-red-700 font-dubai mb-1">
                  لا يمكن قبول هذه الدعوة
                </p>
                <p className="text-xs text-red-500 font-dubai">
                  {userRole === 'ADMIN' 
                    ? 'لا يمكن تغيير دور المسؤول الأساسي للنظام'
                    : 'لا يمكن تغيير دور المدير العام. يجب التواصل مع المسؤول الأساسي'
                  }
                </p>
              </div>
            ) : (
              /* يمكن قبول الدعوة */
              <>
                {userRole !== 'USER' && userRole !== inviteData.role && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                    <p className="text-xs text-amber-700 font-dubai text-center">
                      سيتم تغيير دورك من <strong>{ROLE_LABELS[userRole] || userRole}</strong> إلى <strong>{inviteData.roleLabel}</strong>
                    </p>
                  </div>
                )}

                {acceptError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-dubai mb-4 text-center">
                    {acceptError}
                  </div>
                )}

                <button
                  onClick={handleAcceptInvite}
                  disabled={isAccepting}
                  className="w-full py-3 bg-secondary text-white rounded-xl text-sm font-bold font-dubai hover:bg-secondary/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isAccepting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      جاري قبول الدعوة...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      قبول الدعوة والانضمام
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // ====== المستخدم غير مسجّل دخول ======
  return (
    <div className="min-h-screen bg-accent flex items-center justify-center p-4" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
      >
        {/* رأس الدعوة */}
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

        <div className="p-5">
          <AnimatePresence mode="wait">
            {mode === 'select' && (
              <motion.div
                key="select"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                <p className="text-xs text-secondary/50 font-dubai text-center mb-4">
                  اختر طريقة الانضمام
                </p>
                
                {/* إنشاء حساب جديد */}
                <button
                  onClick={() => setMode('new-account')}
                  className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-secondary/10 hover:border-primary/40 hover:bg-primary/5 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition">
                    <UserPlus className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-secondary font-dubai">إنشاء حساب جديد</p>
                    <p className="text-[11px] text-secondary/40 font-dubai">ليس لدي حساب في النظام</p>
                  </div>
                </button>

                {/* لدي حساب بالفعل */}
                <button
                  onClick={() => setMode('existing-account')}
                  className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-secondary/10 hover:border-primary/40 hover:bg-primary/5 transition-all group"
                >
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition">
                    <LogIn className="w-5 h-5 text-secondary" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-secondary font-dubai">لدي حساب بالفعل</p>
                    <p className="text-[11px] text-secondary/40 font-dubai">تسجيل الدخول وقبول الدعوة</p>
                  </div>
                </button>
              </motion.div>
            )}

            {mode === 'new-account' && (
              <motion.div
                key="new-account"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <button
                  onClick={() => setMode('select')}
                  className="flex items-center gap-1 text-xs text-secondary/50 font-dubai mb-3 hover:text-secondary transition"
                >
                  <ArrowRight className="w-3 h-3" />
                  رجوع
                </button>
                <p className="text-xs text-secondary/50 font-dubai text-center mb-4">
                  أنشئ حسابك للانضمام للفريق
                </p>
                <RegisterForm
                  onSwitchToLogin={() => setMode('existing-account')}
                  onSuccess={handleRegistrationSuccess}
                  inviteCode={code}
                />
              </motion.div>
            )}

            {mode === 'existing-account' && (
              <motion.div
                key="existing-account"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <button
                  onClick={() => setMode('select')}
                  className="flex items-center gap-1 text-xs text-secondary/50 font-dubai mb-3 hover:text-secondary transition"
                >
                  <ArrowRight className="w-3 h-3" />
                  رجوع
                </button>
                <p className="text-xs text-secondary/50 font-dubai text-center mb-4">
                  سجّل دخولك لقبول الدعوة
                </p>
                
                <form onSubmit={handleLoginAndAccept} className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={loginIdentifier}
                      onChange={(e) => { setLoginIdentifier(e.target.value); setLoginError(''); }}
                      placeholder="رقم الهاتف أو البريد الإلكتروني"
                      required
                      className="w-full px-4 py-3 rounded-xl border-2 border-accent bg-white text-secondary placeholder:text-secondary/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-dubai text-right text-sm"
                    />
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => { setLoginPassword(e.target.value); setLoginError(''); }}
                      placeholder="كلمة المرور"
                      required
                      className="w-full px-4 pl-10 py-3 rounded-xl border-2 border-accent bg-white text-secondary placeholder:text-secondary/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-dubai text-right text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary/40 hover:text-secondary/60 transition"
                    >
                      {showPassword ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      )}
                    </button>
                  </div>

                  {loginError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-dubai text-center">
                      {loginError}
                    </div>
                  )}

                  {acceptError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-dubai text-center">
                      {acceptError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full py-3 bg-secondary text-white rounded-xl text-sm font-bold font-dubai hover:bg-secondary/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoggingIn ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        جاري تسجيل الدخول وقبول الدعوة...
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        تسجيل الدخول وقبول الدعوة
                      </>
                    )}
                  </button>

                  <p className="text-center text-xs text-secondary/40 font-dubai">
                    ليس لديك حساب؟{' '}
                    <button
                      type="button"
                      onClick={() => setMode('new-account')}
                      className="text-secondary font-bold hover:text-secondary/70 transition"
                    >
                      إنشاء حساب جديد
                    </button>
                  </p>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
