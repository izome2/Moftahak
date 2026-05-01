'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronDown,
  Clock,
  FileText,
  Home,
  PackageCheck,
  Play,
  RefreshCw,
  ShieldCheck,
  Sofa,
  TrendingUp,
  UserRound,
  Users,
  Wrench,
} from 'lucide-react';
import {
  AIRBNB_COURSE_TITLE,
  AIRBNB_PRICE,
  AIRBNB_VALUE_PRICE,
  airbnbLandingContent,
  curriculumModules,
  getAirbnbCourseContentHref,
  proofVideos,
} from '@/lib/courses/airbnb-landing';
import type { ProofStat } from '@/lib/courses/airbnb-landing';
import AnimatedStroke from '@/components/ui/AnimatedStroke';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useGyroscope } from '@/hooks/useGyroscope';

interface AirbnbCourseLandingPageProps {
  courseSlug: string;
}

interface IconCard {
  title: string;
  body: string;
  icon: LucideIcon;
}

const primaryCtaClass =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-tl from-[#e5b483] to-[#edc49f] px-6 py-3.5 text-sm font-bold text-secondary shadow-[0_0_18px_rgba(180,130,80,0.25)] transition-all hover:shadow-[0_0_24px_rgba(180,130,80,0.35)] active:scale-95 sm:text-base';

const secondaryCtaClass =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-[#ead3b9]/70 bg-white/70 px-6 py-3.5 text-sm font-bold text-secondary transition-all hover:bg-white hover:border-primary/70 active:scale-95 sm:text-base';

const sectionTitleClass = 'text-2xl sm:text-3xl lg:text-4xl font-bold text-secondary font-dubai leading-snug';
const sectionCopyClass = 'mt-3 max-w-2xl text-base leading-relaxed text-secondary/68';

const problemCards: IconCard[] = [
  {
    title: 'اختيار وحدة غير مناسبة',
    body: 'الموقع الخاطئ يضعف كل شيء بعده.',
    icon: Building2,
  },
  {
    title: 'تجهيز يصرف ولا يبيع',
    body: 'تفاصيل كثيرة لا تغيّر قرار الضيف.',
    icon: Sofa,
  },
  {
    title: 'تشغيل بلا أرقام',
    body: 'تسعير ضعيف وإشغال غير مستقر.',
    icon: AlertTriangle,
  },
];

const audienceCards: IconCard[] = [
  {
    title: 'تبدأ من الصفر',
    body: 'وتريد دخول المجال بوعي.',
    icon: UserRound,
  },
  {
    title: 'تملك وحدة عقارية',
    body: 'وتفكر في تشغيلها قصير الأجل.',
    icon: Home,
  },
  {
    title: 'تقرأ فرصة استثمار',
    body: 'وتحتاج أرقامًا قبل القرار.',
    icon: TrendingUp,
  },
  {
    title: 'تريد نظام تشغيل',
    body: 'للتسعير، الحجوزات، والتقييمات.',
    icon: Wrench,
  },
];

const outcomes = [
  'تقيّم الوحدة قبل الدخول.',
  'تجهّز ما يهم الضيف فعلًا.',
  'تسعّر حسب الطلب والموسم.',
  'تقرأ الإيراد والمصاريف وصافي الربح.',
  'تقلل أخطاء البداية المكلفة.',
  'تفكر في التوسع بأرقام لا تخمين.',
];

const offerItems: IconCard[] = [
  {
    title: 'الكورس كامل',
    body: 'كل الدروس والموديولات.',
    icon: BookOpen,
  },
  {
    title: 'وصول مدى الحياة',
    body: 'شاهد وقت ما يناسبك.',
    icon: Clock,
  },
  {
    title: 'تحديثات مستقبلية',
    body: 'أي إضافة تصل لحسابك.',
    icon: RefreshCw,
  },
  {
    title: 'ملفات وموارد مساعدة',
    body: 'نماذج تساعدك في التطبيق.',
    icon: FileText,
  },
  {
    title: 'مجتمع خاص',
    body: 'متابعة وأسئلة وخبرة مشتركة.',
    icon: Users,
  },
  {
    title: 'ضمان 14 يوم',
    body: 'جرّب بدون مخاطرة.',
    icon: ShieldCheck,
  },
];

const faqs = [
  {
    question: 'هل يناسب المبتدئين؟',
    answer: 'نعم. يبدأ من الأساسيات ثم ينتقل للتطبيق.',
  },
  {
    question: 'هل أحتاج أملك شقة؟',
    answer: 'لا. يمكنك استخدامه لفهم الفرصة قبل الاستثمار.',
  },
  {
    question: 'هل هو نظري؟',
    answer: 'لا. المنهج عملي ومبني على قرارات تشغيل حقيقية.',
  },
  {
    question: 'هل الوصول مدى الحياة؟',
    answer: 'نعم. تشاهد الدروس في أي وقت ومن أي جهاز.',
  },
  {
    question: 'ماذا لو لم يناسبني؟',
    answer: 'يمكنك طلب استرداد خلال 14 يوم وفق سياسة الضمان.',
  },
];

function formatEgp(amount: number) {
  return `${new Intl.NumberFormat('ar-EG').format(amount)} جنيه`;
}

function SectionShell({
  id,
  children,
  className = '',
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`px-4 py-14 sm:px-6 lg:px-8 lg:py-16 ${className}`}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

function SectionTitle({
  children,
  className = '',
  delay = 0.2,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <h2 className={`${sectionTitleClass} ${className}`}>
      <AnimatedStroke delay={delay}>{children}</AnimatedStroke>
    </h2>
  );
}

function IconCardGrid({ items, columns = 'md:grid-cols-3' }: { items: IconCard[]; columns?: string }) {
  return (
    <div className={`mt-8 grid grid-cols-1 gap-4 ${columns}`}>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.title}
            className="rounded-2xl border-2 border-[#ead3b9]/70 bg-white/75 p-5 shadow-lg transition-colors hover:border-primary/60"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-primary/25 bg-primary/15 text-secondary">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold text-secondary">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-secondary/65">{item.body}</p>
          </div>
        );
      })}
    </div>
  );
}

function HeroSection({ ctaHref }: { ctaHref: string }) {
  return (
    <section className="relative overflow-hidden bg-white px-4 pb-10 pt-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative min-h-[calc(100vh-7rem)] overflow-hidden rounded-2xl bg-secondary shadow-2xl">
          <Image
            src="/images/hero/hero-1.jpg"
            alt="شقة فندقية جاهزة للتشغيل"
            fill
            priority
            className="object-cover opacity-25"
            sizes="100vw"
          />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: "url('/patterns/pattern_hero.png')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div className="absolute inset-0 bg-linear-to-b from-secondary/90 via-secondary/84 to-secondary/96" />

          <div className="relative z-10 flex min-h-[calc(100vh-7rem)] flex-col items-center justify-center px-5 py-14 text-center sm:px-8">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mx-auto max-w-5xl"
            >
              <h1 className="text-3xl font-bold leading-tight text-primary sm:text-5xl lg:text-6xl">
                {airbnbLandingContent.heroTitle}
              </h1>
              <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-white/82 sm:text-lg">
                {airbnbLandingContent.heroDescription}
              </p>

              <div className="mx-auto mt-8 flex w-full max-w-2xl items-center justify-center gap-2.5 sm:gap-4">
                <Link href={ctaHref} className={`${primaryCtaClass} min-w-0 flex-1 px-4 py-4 text-sm sm:px-8 sm:py-5 sm:text-lg`}>
                  ابدأ الكورس الآن
                  <ArrowLeft className="h-5 w-5" />
                </Link>
                <a href="#curriculum" className="inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-4 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15 sm:px-8 sm:py-5 sm:text-lg">
                  شاهد المحتوى
                </a>
              </div>
            </motion.div>

            <div className="mt-8 grid w-full max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
              {airbnbLandingContent.stats.map((stat) => (
                <div key={stat} className="rounded-2xl border border-primary/25 bg-white/10 px-4 py-4 text-center backdrop-blur">
                  <p className="text-base font-bold text-accent sm:text-lg">{stat}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex max-w-4xl flex-wrap justify-center gap-2">
              {airbnbLandingContent.trustPoints.map((point) => (
                <span key={point} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white/78">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  {point}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CourseSubnav({ ctaHref }: { ctaHref: string }) {
  const links = [
    { href: '#curriculum', label: 'محتوى الكورس' },
    { href: '#proof', label: 'نماذج حقيقية' },
    { href: '#instructor', label: 'عن المدرب' },
    { href: '#pricing', label: 'السعر' },
    { href: '#faq', label: 'الأسئلة الشائعة' },
  ];

  return (
    <div className="sticky top-20 z-30 hidden border-y border-[#ead3b9]/70 bg-[#fdf6ee]/90 px-4 py-3 backdrop-blur-md md:block">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <nav className="flex items-center gap-5 text-sm font-bold text-secondary/70">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="transition-colors hover:text-primary">
              {link.label}
            </a>
          ))}
        </nav>
        <Link href={ctaHref} className="rounded-xl bg-secondary px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-secondary/90">
          ابدأ الكورس الآن
        </Link>
      </div>
    </div>
  );
}

function ProblemSection({ ctaHref }: { ctaHref: string }) {
  return (
    <SectionShell className="bg-white">
      <div className="text-center">
        <SectionTitle>ليست في AirBNB… بل في البداية العشوائية</SectionTitle>
        <p className={`${sectionCopyClass} mx-auto`}>
          قرار واحد خاطئ في الوحدة أو التسعير قد يكلّفك أكثر من ثمن الكورس.
        </p>
      </div>
      <IconCardGrid items={problemCards} />
      <div className="mt-8 text-center">
        <Link href={ctaHref} className={primaryCtaClass}>
          ابدأ الكورس الآن
        </Link>
      </div>
    </SectionShell>
  );
}

function AudienceOutcomesSection() {
  return (
    <SectionShell className="bg-[#faf7f2]">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-start">
        <div>
          <SectionTitle>لو تفكر في وحدة قصيرة الأجل، فهذا لك</SectionTitle>
          <IconCardGrid items={audienceCards} columns="sm:grid-cols-2" />
        </div>

        <div className="rounded-2xl border-2 border-[#ead3b9]/70 bg-white/80 p-6 shadow-lg">
          <h3 className="text-2xl font-bold text-secondary">بعد الكورس ستكون قادرًا على:</h3>
          <div className="mt-5 grid gap-3">
            {outcomes.map((outcome) => (
              <div key={outcome} className="flex items-start gap-3 rounded-xl border border-[#ead3b9]/50 bg-[#faf7f2] px-4 py-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm leading-relaxed text-secondary/75">{outcome}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

function ProofVideoSection() {
  const [currentTime, setCurrentTime] = useState(0);
  const activeVideo = proofVideos[0];
  const floatingStats = useMemo(
    () =>
      activeVideo.stats
        .map((stat, index) => ({ stat, index }))
        .filter(({ stat }) => currentTime >= stat.time && currentTime < stat.time + 4.4),
    [activeVideo.stats, currentTime]
  );

  return (
    <SectionShell id="proof" className="bg-white">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
        <div>
          <SectionTitle>الأرقام قبل الوعود</SectionTitle>
          <p className={sectionCopyClass}>
            نماذج تشغيل توضّح السعر، الإشغال، الإيراد، المصاريف، وصافي الربح.
          </p>
          <a href="#proof-video" className={`${secondaryCtaClass} mt-6`}>
            شاهد النماذج
            <Play className="h-4 w-4" />
          </a>

          <ProofAnalyticsPanel currentTime={currentTime} />
        </div>

        <div id="proof-video" className="mx-auto w-full max-w-[390px] rounded-[2rem] border-2 border-[#ead3b9]/70 bg-[#ead3b9]/20 p-3 shadow-2xl">
          <div className="relative aspect-[9/16] overflow-hidden rounded-[1.5rem] bg-secondary">
            <video
              src={activeVideo.videoSrc}
              poster={activeVideo.posterSrc}
              className="h-full w-full object-cover"
              preload="metadata"
              controls
              playsInline
              onPlay={(event) => setCurrentTime(event.currentTarget.currentTime)}
              onPause={() => setCurrentTime(Number.POSITIVE_INFINITY)}
              onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
              onSeeked={(event) => setCurrentTime(event.currentTarget.paused ? Number.POSITIVE_INFINITY : event.currentTarget.currentTime)}
              onLoadedMetadata={() => setCurrentTime(0)}
              onEnded={() => setCurrentTime(Number.POSITIVE_INFINITY)}
            />
            <div className="pointer-events-none absolute inset-0 z-10">
              <AnimatePresence mode="popLayout">
                {floatingStats.map(({ stat, index }) => (
                  <FloatingProofBadge
                    key={`${stat.label}-${stat.time}`}
                    stat={stat}
                    index={index}
                    position={proofFloatingPositions[index % proofFloatingPositions.length]}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-3 flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {proofVideos.map((video) => (
              <button
                key={video.id}
                className="min-w-[220px] rounded-xl border border-primary/30 bg-white px-4 py-3 text-start shadow-sm"
              >
                <p className="text-sm font-bold text-secondary">{video.title}</p>
                <p className="text-xs text-secondary/55">{video.unitType} • {video.location}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

function FloatingProofBadge({ stat, index, position }: { stat: ProofStat; index: number; position: React.CSSProperties }) {
  const Icon = proofFloatingIcons[index % proofFloatingIcons.length];
  const chartType = stat.label === 'صافي الربح' ? 'profit' : stat.label === 'نسبة الإشغال' ? 'occupancy' : null;

  return (
    <motion.div
      className="absolute w-[190px] sm:w-[220px]"
      style={position}
      initial={{ opacity: 0, y: 32, scale: 0.93, filter: 'blur(6px)' }}
      animate={{
        opacity: [0, 1, 1, 0],
        y: [32, -14, -76, -122],
        scale: [0.93, 1, 1, 0.97],
        filter: ['blur(6px)', 'blur(0px)', 'blur(0px)', 'blur(8px)'],
      }}
      exit={{
        opacity: 0,
        y: -92,
        scale: 0.96,
        filter: 'blur(8px)',
        transition: {
          opacity: { duration: 0.7, ease: 'easeOut' },
          y: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
          scale: { duration: 0.7, ease: 'easeOut' },
          filter: { duration: 0.7, ease: 'easeOut' },
        },
      }}
      transition={{
        opacity: { duration: 4.4, times: [0, 0.16, 0.78, 1], ease: 'easeOut' },
        y: { duration: 4.4, ease: 'linear' },
        scale: { duration: 4.4, times: [0, 0.16, 0.78, 1], ease: 'easeOut' },
        filter: { duration: 4.4, times: [0, 0.16, 0.78, 1], ease: 'easeOut' },
      }}
    >
      {chartType && (
        <div className="mb-2 rounded-2xl border border-[#c99b6a]/65 bg-[#fdf6ee]/55 px-3 py-3 text-secondary shadow-[0_16px_38px_rgba(16,48,43,0.22)] backdrop-blur-xl">
          {chartType === 'profit' ? <ProfitMiniLineChart /> : <OccupancyMiniDonutChart />}
        </div>
      )}
      <div className="relative rounded-2xl border border-[#c99b6a]/65 bg-[#fdf6ee]/55 px-4 py-4 pt-5 text-secondary shadow-[0_18px_45px_rgba(16,48,43,0.28)] backdrop-blur-xl">
        <span className="absolute -top-4 right-4 flex h-9 w-9 items-center justify-center rounded-xl border border-[#c99b6a]/70 bg-[#fdf6ee]/80 text-secondary shadow-lg backdrop-blur-xl">
          <Icon className="h-[18px] w-[18px]" />
        </span>
        <p className="text-xs font-bold text-[#8f5f30] sm:text-sm">{stat.label}</p>
        <p className="mt-1 text-base font-bold leading-tight text-secondary sm:text-lg">{stat.value}</p>
        {stat.detail && <p className="mt-1 text-xs font-semibold text-secondary/62 sm:text-[13px]">{stat.detail}</p>}
      </div>
    </motion.div>
  );
}

const proofFloatingIcons = [Building2, Clock, TrendingUp, PackageCheck, FileText, CheckCircle2, ShieldCheck];

const proofFloatingPositions: React.CSSProperties[] = [
  { top: '8%', right: '7%' },
  { top: '20%', left: '7%' },
  { top: '41%', right: '5%' },
  { top: '55%', left: '8%' },
  { bottom: '20%', right: '9%' },
  { bottom: '12%', left: '10%' },
  { top: '31%', left: '30%' },
];

const proofMetrics = [
  { label: 'إيراد شهري', value: 43290, suffix: ' جنيه', icon: TrendingUp },
  { label: 'صافي ربح', value: 31890, suffix: ' جنيه', icon: CheckCircle2 },
  { label: 'نسبة إشغال', value: 78, suffix: '%', icon: Building2 },
];

const proofChartData = [
  { label: 'أسبوع 1', revenue: 8200, net: 5700 },
  { label: 'أسبوع 2', revenue: 14800, net: 9800 },
  { label: 'أسبوع 3', revenue: 27600, net: 19100 },
  { label: 'أسبوع 4', revenue: 43290, net: 31890 },
];

function getProofProgress(currentTime: number) {
  return Math.min(Math.max(currentTime / 18, 0), 1);
}

function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - value, 3);
}

function ProofAnalyticsPanel({ currentTime }: { currentTime: number }) {
  const progress = getProofProgress(currentTime);
  const easedProgress = easeOutCubic(progress);

  return (
    <div className="mt-7 hidden rounded-2xl border-2 border-[#ead3b9]/70 bg-[#faf7f2] p-4 shadow-lg sm:p-5 lg:block">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {proofMetrics.map((metric) => (
          <ProofMetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            suffix={metric.suffix}
            progress={easedProgress}
            icon={metric.icon}
          />
        ))}
      </div>

      <ProofGrowthChart progress={easedProgress} />
    </div>
  );
}

function ProfitMiniLineChart() {
  const lift = 0.9;
  const dots = [0.28, 0.46, 0.4, 0.74, 1];
  const points = dots
    .map((height, dotIndex) => {
      const x = 9 + dotIndex * 23.5;
      const y = 55 - height * 39 * lift;
      return `${dotIndex === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return (
    <svg viewBox="0 0 112 64" className="h-16 w-full overflow-visible sm:h-20" aria-hidden="true">
      <line x1="6" x2="106" y1="58" y2="58" stroke="#d8b58a" strokeWidth="1" strokeDasharray="3 4" />
      <motion.path
        d={points}
        fill="none"
        className="stroke-[#8f5f30] stroke-[1.15] sm:stroke-[2.35]"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="1 6"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 0.95, y: 0 }}
        transition={{ duration: 0.75, ease: 'easeOut' }}
      />
      {dots.map((height, dotIndex) => {
        const x = 9 + dotIndex * 23.5;
        const y = 55 - height * 39 * lift;
        return (
          <motion.circle
            key={dotIndex}
            cx={x}
            cy={y}
            r="3.8"
            fill={dotIndex === dots.length - 1 ? '#8f5f30' : '#c98f4d'}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: dotIndex * 0.06, duration: 0.45, ease: 'easeOut' }}
          />
        );
      })}
    </svg>
  );
}

function OccupancyMiniDonutChart() {
  const rate = 0.78;
  const radius = 24;
  const circumference = 2 * Math.PI * radius;

  return (
    <svg viewBox="0 0 112 76" className="h-20 w-full overflow-visible sm:h-24" aria-hidden="true">
      <circle cx="56" cy="38" r={radius} fill="none" stroke="#e6c9a6" strokeWidth="9" opacity="0.75" />
      <motion.circle
        cx="56"
        cy="38"
        r={radius}
        fill="none"
        stroke="#8f5f30"
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: circumference * (1 - rate) }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        transform="rotate(-90 56 38)"
      />
      <text x="56" y="43" textAnchor="middle" className="fill-secondary text-sm font-bold">
        78%
      </text>
    </svg>
  );
}

function ProofMetricCard({
  label,
  value,
  suffix,
  progress,
  icon: Icon,
}: {
  label: string;
  value: number;
  suffix: string;
  progress: number;
  icon: LucideIcon;
}) {
  const displayValue = Math.round(value * progress);

  return (
    <div className="rounded-2xl border border-[#ead3b9]/70 bg-white px-4 py-4 shadow-sm">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-secondary">
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-bold text-secondary">
        {new Intl.NumberFormat('ar-EG').format(displayValue)}
        <span className="text-sm text-secondary/55">{suffix}</span>
      </p>
      <p className="mt-1 text-xs font-bold text-secondary/58">{label}</p>
    </div>
  );
}

function ProofGrowthChart({ progress }: { progress: number }) {
  const maxRevenue = Math.max(...proofChartData.map((item) => item.revenue));
  const chartHeight = 118;
  const baseY = 150;
  const linePoints = proofChartData.map((item, index) => {
    const x = 38 + index * 70;
    const y = baseY - (item.net / maxRevenue) * chartHeight * progress;
    return { x, y };
  });
  const linePath = linePoints
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-[#ead3b9]/70 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-secondary">نمو الإيراد وصافي الربح</p>
          <p className="text-xs text-secondary/55">الرسم يتحرك مع وقت الفيديو</p>
        </div>
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-primary">
          {Math.round(progress * 100)}%
        </span>
      </div>

      <svg viewBox="0 0 280 170" className="h-48 w-full" role="img" aria-label="رسم بياني لإيراد وصافي ربح نموذج Airbnb">
        {[30, 70, 110, 150].map((y) => (
          <line key={y} x1="24" x2="266" y1={y} y2={y} stroke="#ead3b9" strokeWidth="1" strokeDasharray="4 6" opacity="0.8" />
        ))}

        {proofChartData.map((item, index) => {
          const x = 30 + index * 70;
          const revenueHeight = (item.revenue / maxRevenue) * chartHeight * progress;
          const netHeight = (item.net / maxRevenue) * chartHeight * progress;
          const ghostHeight = (item.revenue / maxRevenue) * chartHeight;

          return (
            <g key={item.label}>
              <rect x={x} y={baseY - ghostHeight} width="28" height={ghostHeight} rx="8" fill="#ead3b9" opacity="0.22" />
              <motion.rect
                x={x}
                width="28"
                rx="8"
                fill="#0f332e"
                initial={false}
                animate={{ y: baseY - revenueHeight, height: revenueHeight }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
              />
              <motion.rect
                x={x + 9}
                width="10"
                rx="5"
                fill="#edc49f"
                initial={false}
                animate={{ y: baseY - netHeight, height: netHeight }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
              />
              <text x={x + 14} y="166" textAnchor="middle" className="fill-secondary/50 text-[9px] font-bold">
                {item.label}
              </text>
            </g>
          );
        })}

        <motion.path
          d={linePath}
          fill="none"
          stroke="#c98f4d"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{ pathLength: progress, opacity: progress > 0 ? 1 : 0.2 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        />
        {linePoints.map((point, index) => (
          <motion.circle
            key={`${point.x}-${index}`}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="#c98f4d"
            initial={false}
            animate={{ scale: progress > index / proofChartData.length ? 1 : 0.4, opacity: progress > index / proofChartData.length ? 1 : 0.3 }}
            transition={{ duration: 0.35 }}
          />
        ))}
      </svg>
    </div>
  );
}

function CurriculumSection({ ctaHref }: { ctaHref: string }) {
  const [openModule, setOpenModule] = useState(0);

  return (
    <SectionShell id="curriculum" className="bg-[#faf7f2]">
      <div className="text-center">
        <SectionTitle>كل خطوة تحتاجها للتشغيل</SectionTitle>
        <p className={`${sectionCopyClass} mx-auto`}>
          سوق، وحدة، تجهيز، تسعير، تشغيل، ثم أرقام وتوسع.
        </p>
      </div>

      <div className="mx-auto mt-6 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4">
        {airbnbLandingContent.stats.map((stat) => (
          <div key={stat} className="rounded-xl border border-[#ead3b9]/70 bg-white px-3 py-3 text-center text-sm font-bold text-secondary shadow-sm">
            {stat}
          </div>
        ))}
      </div>

      <div className="mx-auto mt-8 max-w-4xl overflow-hidden rounded-2xl border-2 border-[#ead3b9]/70 bg-white shadow-lg">
        {curriculumModules.map((module, index) => {
          const isOpen = openModule === index;
          return (
            <div key={module.title} className="border-b border-[#ead3b9]/40 last:border-b-0">
              <button
                onClick={() => setOpenModule(isOpen ? -1 : index)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start transition-colors hover:bg-[#ead3b9]/15"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-secondary">{module.title}</p>
                  <p className="mt-1 hidden text-xs text-secondary/55 sm:block">{module.outcome}</p>
                </div>
                <motion.span animate={{ rotate: isOpen ? 180 : 0 }} className="shrink-0">
                  <ChevronDown className="h-4 w-4 text-secondary/50" />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-3 bg-[#faf7f2] px-5 py-4">
                      <p className="text-sm leading-relaxed text-secondary/70 sm:hidden">{module.outcome}</p>
                      {module.lessons.map((lesson) => (
                        <div key={lesson} className="flex items-center gap-2 text-sm text-secondary/75">
                          <BookOpen className="h-4 w-4 shrink-0 text-primary" />
                          {lesson}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <Link href={ctaHref} className={primaryCtaClass}>
          ابدأ الكورس الآن
        </Link>
      </div>
    </SectionShell>
  );
}

function InstructorSection() {
  const instructorStats = [
    { value: '5', label: 'سنوات خبرة', icon: TrendingUp },
    { value: '3,000+', label: 'ليلة تشغيل', icon: Clock },
    { value: '1,200+', label: 'عميل راضٍ', icon: Users },
  ];

  return (
    <SectionShell id="instructor" className="bg-white">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="lg:pr-10">
          <InstructorImageStack />
        </div>

        <div>
          <SectionTitle>خبرة تشغيل حقيقية، لا كلام عام</SectionTitle>
          <p className={sectionCopyClass}>
            خلاصة تجربة في الإيجارات قصيرة الأجل، التشغيل، الأرقام، وتجربة الضيف.
          </p>

          <blockquote className="relative mt-6 rounded-2xl border-2 border-[#ead3b9]/80 bg-[#faf7f2] px-5 py-5 pb-9 text-lg font-bold leading-relaxed text-secondary shadow-lg">
            <span className="absolute inset-y-5 right-0 w-1 rounded-l-full bg-primary" />
            <p>&quot;هدفي أن أوفّر عليك العشوائية، وأختصر لك الطريق بخطوات عملية قابلة للتنفيذ.&quot;</p>
            <span className="absolute bottom-0 left-5 translate-y-1/2 rounded-full border border-primary/30 bg-secondary px-4 py-2 text-xs font-bold text-primary shadow-lg">
              عبد الله الخضر
            </span>
          </blockquote>

          <div className="mt-9 grid grid-cols-3 gap-2 sm:gap-3">
            {instructorStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="group rounded-2xl border-2 border-[#ead3b9]/70 bg-white p-3 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-primary/60 hover:shadow-lg sm:p-4">
                  <div className="mx-auto mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-secondary transition-colors group-hover:bg-secondary group-hover:text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-xl font-bold text-secondary sm:text-2xl">{stat.value}</p>
                  <p className="mt-1 text-xs font-bold leading-tight text-secondary/60 sm:text-sm">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

function InstructorImageStack() {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const isImageInView = useScrollAnimation(imageRef as React.RefObject<Element>, { threshold: 0.1, once: false });
  const [isMobile, setIsMobile] = useState(false);

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springConfig = { damping: 20, stiffness: 200, mass: 0.5 };
  const rotateXSpring = useSpring(rotateX, springConfig);
  const rotateYSpring = useSpring(rotateY, springConfig);

  const xBackground = useTransform(rotateYSpring, [-3, 3], [-6, 6]);
  const xOverlay1 = useTransform(rotateYSpring, [-3, 3], [-8, -12]);
  const yOverlay1 = useTransform(rotateXSpring, [-3, 3], [-2, 2]);
  const xOverlay2 = useTransform(rotateYSpring, [-3, 3], [2.5, -2.5]);
  const yOverlay2 = useTransform(rotateXSpring, [-3, 3], [-2.5, 2.5]);
  const gyro = useGyroscope(0.8);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile && gyro.isSupported) {
      rotateX.set(gyro.rotateX);
      rotateY.set(gyro.rotateY);
    }
  }, [gyro.isSupported, gyro.rotateX, gyro.rotateY, isMobile, rotateX, rotateY]);

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || isMobile) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    rotateY.set(((x - centerX) / centerX) * 3);
    rotateX.set(-((y - centerY) / centerY) * 3);
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      rotateX.set(0);
      rotateY.set(0);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative mx-auto max-w-lg lg:mx-0"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: '1200px' }}
    >
      <motion.div
        ref={imageRef}
        style={{
          rotateX: rotateXSpring,
          rotateY: rotateYSpring,
          transformStyle: 'preserve-3d',
        }}
        className="relative"
      >
        <motion.div
          className="absolute inset-0 z-0"
          initial={{ opacity: 0, y: 20 }}
          animate={isImageInView ? { opacity: 1, y: [0, -8, 0] } : { opacity: 0, y: 20 }}
          transition={{
            opacity: { delay: 0.2, duration: 0.6 },
            y: { delay: 0.8, duration: 6, repeat: Infinity, ease: 'easeInOut' },
          }}
          style={{ x: xBackground, scale: 0.95 }}
        >
          <Image
            src="/images/hero/background-0.png"
            alt=""
            width={800}
            height={800}
            className="h-full w-full object-contain"
          />
        </motion.div>

        <motion.div
          className="relative z-10 overflow-hidden rounded-3xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isImageInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ delay: 0, duration: 0.5 }}
          whileHover={{ scale: 1.02 }}
        >
          <Image
            src="/images/hero/abdullah-profile.png"
            alt="عبد الله الخضر"
            width={800}
            height={800}
            className="h-auto w-full object-contain"
          />
        </motion.div>

        <motion.div
          className="pointer-events-none absolute inset-0 z-20"
          initial={{ opacity: 0, y: 20 }}
          animate={isImageInView ? { opacity: 1, y: [0, 10, 0] } : { opacity: 0, y: 20 }}
          transition={{
            opacity: { delay: 0.3, duration: 0.6 },
            y: { delay: 0.9, duration: 7, repeat: Infinity, ease: 'easeInOut' },
          }}
          style={{ x: xOverlay1, y: yOverlay1, scale: 1.05 }}
        >
          <Image
            src="/images/hero/overlay-1.png"
            alt=""
            width={800}
            height={800}
            className="h-full w-full object-contain"
          />
        </motion.div>

        <motion.div
          className="pointer-events-none absolute inset-0 z-30"
          initial={{ opacity: 0, y: 20 }}
          animate={isImageInView ? { opacity: 1, y: [0, -12, 0] } : { opacity: 0, y: 20 }}
          transition={{
            opacity: { delay: 0.4, duration: 0.6 },
            y: { delay: 1, duration: 6.5, repeat: Infinity, ease: 'easeInOut' },
          }}
          style={{ x: xOverlay2, y: yOverlay2, scale: 1.08 }}
        >
          <Image
            src="/images/hero/overlay-2.png"
            alt=""
            width={800}
            height={800}
            className="h-full w-full object-contain"
          />
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute -bottom-6 -left-6 -z-10 h-32 w-32 rounded-full bg-primary/20 blur-3xl"
        initial={{ scale: 0, opacity: 0 }}
        animate={isImageInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      />
      <motion.div
        className="absolute -right-6 -top-6 -z-10 h-32 w-32 rounded-full bg-secondary/20 blur-3xl"
        initial={{ scale: 0, opacity: 0 }}
        animate={isImageInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      />
    </div>
  );
}

function OfferSection({ ctaHref }: { ctaHref: string }) {
  return (
    <SectionShell className="bg-[#faf7f2]">
      <div className="text-center">
        <SectionTitle>محتوى عملي + موارد + ضمان</SectionTitle>
      </div>
      <IconCardGrid items={offerItems} columns="sm:grid-cols-2 lg:grid-cols-3" />
      <div className="mt-8 text-center">
        <Link href={ctaHref} className={primaryCtaClass}>
          ابدأ الكورس الآن
        </Link>
      </div>
    </SectionShell>
  );
}

function PricingSection({ ctaHref }: { ctaHref: string }) {
  return (
    <SectionShell id="pricing" className="bg-white">
      <div className="mx-auto max-w-4xl text-center">
        <SectionTitle>استثمر في الفهم قبل الوحدة</SectionTitle>
        <p className={`${sectionCopyClass} mx-auto`}>
          الوصول الكامل للكورس والموارد مع ضمان 14 يوم.
        </p>
      </div>

      <div className="mx-auto mt-8 max-w-xl rounded-2xl border-2 border-primary/45 bg-[#ead3b9]/20 p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-secondary/55">القيمة الإجمالية</p>
            <p className="text-xl font-bold text-secondary/45 line-through">{formatEgp(AIRBNB_VALUE_PRICE)}</p>
          </div>
          <span className="rounded-full bg-secondary px-4 py-1.5 text-sm font-bold text-primary">وفّر 48%</span>
        </div>

        <div className="mt-5">
          <p className="text-sm font-bold text-secondary/60">السعر الحالي</p>
          <p className="text-5xl font-bold text-secondary">{formatEgp(AIRBNB_PRICE)}</p>
        </div>

        <div className="mt-6 grid gap-3">
          {airbnbLandingContent.priceIncludes.map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-xl border border-[#ead3b9]/70 bg-white px-4 py-3">
              <PackageCheck className="h-5 w-5 shrink-0 text-primary" />
              <span className="text-sm font-bold text-secondary/75">{item}</span>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-xl bg-white/70 px-4 py-3 text-sm font-bold text-secondary/65">
          طرق الدفع: {airbnbLandingContent.paymentMethods}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link href={ctaHref} className={`${primaryCtaClass} w-full`}>
            ابدأ الكورس الآن
          </Link>
          <a href="#curriculum" className={`${secondaryCtaClass} w-full`}>
            راجع محتوى الكورس
          </a>
        </div>
      </div>
    </SectionShell>
  );
}

function GuaranteeFaqSection({ ctaHref }: { ctaHref: string }) {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <SectionShell id="faq" className="bg-[#faf7f2]">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div className="rounded-2xl border-2 border-[#ead3b9]/70 bg-white p-6 shadow-lg">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-secondary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-secondary">
            <AnimatedStroke delay={0.2}>جرّب بدون مخاطرة</AnimatedStroke>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-secondary/70">
            لو لم يناسبك، اطلب الاسترداد خلال 14 يوم وفق السياسة المعتمدة.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border-2 border-[#ead3b9]/70 bg-white shadow-lg">
          <div className="border-b border-[#ead3b9]/50 px-5 py-4">
            <h2 className="text-2xl font-bold text-secondary">
              <AnimatedStroke delay={0.2}>أسئلة شائعة قبل الاشتراك</AnimatedStroke>
            </h2>
          </div>
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div key={faq.question} className="border-b border-[#ead3b9]/35 last:border-b-0">
                <button
                  onClick={() => setOpenFaq(isOpen ? -1 : index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start hover:bg-[#ead3b9]/15"
                >
                  <span className="text-sm font-bold text-secondary">{faq.question}</span>
                  <motion.span animate={{ rotate: isOpen ? 180 : 0 }}>
                    <ChevronDown className="h-4 w-4 text-secondary/45" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-4 text-sm leading-relaxed text-secondary/65">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
          <div className="px-5 py-5 text-center">
            <Link href={ctaHref} className={primaryCtaClass}>
              ابدأ الكورس الآن
            </Link>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}

function FinalCtaSection({ ctaHref }: { ctaHref: string }) {
  const currentYear = new Date().getFullYear();
  const footerHighlights = [
    { value: '45 درس', label: 'محتوى منظم', icon: BookOpen },
    { value: '13 ساعة', label: 'تطبيق عملي', icon: Clock },
    { value: '14 يوم', label: 'ضمان استرداد', icon: ShieldCheck },
    { value: formatEgp(AIRBNB_PRICE), label: 'سعر الاشتراك', icon: PackageCheck },
  ];

  return (
    <section className="bg-[#faf7f2] px-4 py-14 pb-28 sm:px-6 lg:px-8 md:pb-14">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-2xl border-2 border-[#2e5852] bg-secondary text-white shadow-[0_6px_50px_rgba(16,48,43,0.45)]">
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: "url('/patterns/pattern-vertical-white.png')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />

          <div className="relative z-10 grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-10">
            <div className="text-center lg:text-start">
              <h2 className="text-3xl font-bold leading-snug text-white sm:text-4xl">
                <AnimatedStroke delay={0.2}>ابدأ بثقة، لا بتخمين</AnimatedStroke>
              </h2>
            </div>

            <div>
              <div className="grid grid-cols-2 content-start gap-3">
                {footerHighlights.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="rounded-xl border border-white/15 bg-white/[0.08] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_18px_35px_rgba(0,0,0,0.12)] backdrop-blur-md"
                    >
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>
                      <p className="text-lg font-bold text-primary">{item.value}</p>
                      <p className="mt-1 text-xs text-white/62">{item.label}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Link href={ctaHref} className={`${primaryCtaClass} w-full`}>
                  ابدأ الكورس الآن
                  <ArrowLeft className="h-5 w-5" />
                </Link>
                <a href="#curriculum" className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.08] px-6 py-3.5 text-sm font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_18px_35px_rgba(0,0,0,0.12)] backdrop-blur-md transition hover:bg-white/[0.12] sm:text-base">
                  شاهد المحتوى
                </a>
              </div>
            </div>
          </div>

          <div className="relative z-10 border-t border-white/10 px-6 py-4 sm:px-8 lg:px-10">
            <div className="flex flex-col items-center justify-between gap-3 text-center md:flex-row">
              <p className="text-xs text-white/55">© {currentYear} مفتاحك. جميع الحقوق محفوظة.</p>
              <div className="flex items-center gap-4">
                <Link href="/privacy" className="text-xs text-white/55 transition-colors hover:text-primary">
                  سياسة الخصوصية
                </Link>
                <Link href="/refund" className="text-xs text-white/55 transition-colors hover:text-primary">
                  سياسة الاسترداد
                </Link>
                <Link href="/terms" className="text-xs text-white/55 transition-colors hover:text-primary">
                  الشروط
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function MobileStickyCta({ ctaHref, show }: { ctaHref: string; show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-x-0 bottom-0 z-50 border-t border-primary/30 bg-[#fdf6ee]/95 px-4 py-3 shadow-2xl backdrop-blur md:hidden"
        >
          <Link href={ctaHref} className={`${primaryCtaClass} w-full`}>
            ابدأ الكورس الآن — {formatEgp(AIRBNB_PRICE)}
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function AirbnbCourseLandingPage({ courseSlug }: AirbnbCourseLandingPageProps) {
  const ctaHref = getAirbnbCourseContentHref(courseSlug);
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowSticky(window.scrollY > window.innerHeight * 0.75);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className="overflow-hidden">
      <HeroSection ctaHref={ctaHref} />
      <CourseSubnav ctaHref={ctaHref} />
      <ProblemSection ctaHref={ctaHref} />
      <AudienceOutcomesSection />
      <ProofVideoSection />
      <CurriculumSection ctaHref={ctaHref} />
      <InstructorSection />
      <OfferSection ctaHref={ctaHref} />
      <PricingSection ctaHref={ctaHref} />
      <GuaranteeFaqSection ctaHref={ctaHref} />
      <FinalCtaSection ctaHref={ctaHref} />
      <MobileStickyCta ctaHref={ctaHref} show={showSticky} />
      <span className="sr-only">{AIRBNB_COURSE_TITLE}</span>
    </main>
  );
}
