'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeft,
  BadgeCheck,
  BookOpen,
  ChevronDown,
  CircleHelp,
  Clock,
  Heart,
  Play,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  AIRBNB_COURSE_TITLE,
  airbnbLandingContent,
  audienceTabs,
  curriculumModules,
  faqItems,
  getAirbnbCourseContentHref,
  reviewComments,
} from '@/lib/courses/airbnb-landing';

interface AirbnbCourseLandingPageProps {
  courseSlug: string;
}

const sectionClass = 'px-4 py-14 sm:px-6 lg:px-8 lg:py-18';
const sectionInnerClass = 'mx-auto max-w-6xl';

const badgeIcons = {
  BadgeCheck,
  Heart,
  BookOpen,
  CircleHelp,
};

type BadgeIconName = keyof typeof badgeIcons;
type BadgeVariant = 'green' | 'beige';
type RevealDirection = 'up' | 'down' | 'left' | 'right' | 'none';

const smoothEase: [number, number, number, number] = [0.16, 1, 0.3, 1];
const mediaSwitchTransition = {
  opacity: { duration: 1.18, ease: smoothEase },
  x: { duration: 1.24, ease: smoothEase },
  y: { duration: 1.24, ease: smoothEase },
  scale: { duration: 1.24, ease: smoothEase },
  filter: { duration: 1.65, ease: smoothEase },
};
const audienceSwitchTransition = {
  opacity: { duration: 1.18, ease: smoothEase },
  filter: { duration: 1.65, ease: smoothEase },
};
const stableMotionStyle: React.CSSProperties = {
  backfaceVisibility: 'hidden',
  isolation: 'isolate',
  overflowAnchor: 'none',
};
const gpuTransform = (_: unknown, generatedTransform: string) => (
  generatedTransform && generatedTransform !== 'none'
    ? `${generatedTransform} translateZ(0)`
    : 'translateZ(0)'
);

function Reveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  amount = 0.22,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: RevealDirection;
  amount?: number;
}) {
  const [hasRevealed, setHasRevealed] = useState(false);
  const offsets: Record<RevealDirection, { x: number; y: number }> = {
    up: { x: 0, y: 30 },
    down: { x: 0, y: -24 },
    left: { x: -30, y: 0 },
    right: { x: 30, y: 0 },
    none: { x: 0, y: 0 },
  };
  const offset = offsets[direction];

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: offset.x, y: offset.y, scale: 0.975, filter: 'blur(18px)' }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1, filter: 'blur(0px)' }}
      viewport={{ once: true, amount, margin: '0px 0px -80px 0px' }}
      transition={{ duration: 1.15, delay, ease: smoothEase }}
      transformTemplate={gpuTransform}
      onAnimationComplete={() => setHasRevealed(true)}
      style={{
        ...stableMotionStyle,
        willChange: hasRevealed ? 'auto' : 'transform, opacity, filter',
      }}
    >
      {children}
    </motion.div>
  );
}

function BadgePill({
  badge,
  className = '',
}: {
  badge: { label: string; icon: BadgeIconName; variant: BadgeVariant };
  className?: string;
}) {
  const Icon = badgeIcons[badge.icon];
  const variantClass =
    badge.variant === 'green'
      ? 'border border-[#2e5852] bg-secondary text-primary shadow-[0_10px_24px_rgba(16,48,43,0.22)]'
      : 'border border-[#ead3b9]/80 bg-[#f5e6d5] text-secondary shadow-[0_8px_22px_rgba(180,130,80,0.12)]';

  return (
    <span
      className={`inline-flex items-center justify-center gap-3 rounded-[18px] px-6 py-2.5 text-lg font-bold leading-none sm:px-7 sm:py-3 sm:text-xl ${variantClass} ${className}`}
    >
      <Icon className="h-[22px] w-[22px] fill-none stroke-[2.5] sm:h-6 sm:w-6" />
      <span>{badge.label}</span>
    </span>
  );
}

function StartNowButton({
  href,
  className = '',
  fullWidth = false,
  inverted = false,
}: {
  href: string;
  className?: string;
  fullWidth?: boolean;
  inverted?: boolean;
}) {
  const buttonPalette = inverted
    ? 'border border-white/18 bg-[#1c3933] text-white shadow-[0_14px_34px_rgba(0,0,0,0.16),inset_0_1px_0_rgba(255,255,255,0.14)] hover:text-white hover:shadow-[0_18px_42px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.18)] active:text-white'
    : 'bg-linear-to-tl from-[#edbf8c] to-[#f8d9ae] text-secondary shadow-[0_16px_36px_rgba(16,48,43,0.18),0_0_24px_rgba(237,191,140,0.28)] hover:text-white hover:shadow-[0_20px_46px_rgba(16,48,43,0.24),0_0_34px_rgba(237,191,140,0.38)] active:text-white';
  const circlePalette = inverted ? 'bg-primary' : 'bg-secondary';
  const arrowPalette = inverted ? 'text-secondary' : 'text-primary';
  const labelPalette = 'group-hover:text-white group-active:text-white';

  return (
    <Link
      href={href}
      className={`group relative inline-flex min-h-14 items-center justify-center overflow-hidden rounded-full py-2.5 pl-5 pr-14 font-bold transition duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] sm:min-h-[60px] sm:pl-6 sm:pr-16 ${buttonPalette} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
    >
      <span
        aria-hidden="true"
        className={`absolute right-1 top-1/2 z-0 h-10 w-10 -translate-y-1/2 rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_8px_18px_rgba(16,48,43,0.18)] transition-[width,height,right] ease-out group-hover:right-[-1px] group-hover:h-[calc(100%+2px)] group-hover:w-[calc(100%+2px)] group-active:right-[-1px] group-active:h-[calc(100%+2px)] group-active:w-[calc(100%+2px)] sm:h-11 sm:w-11 ${circlePalette}`}
        style={{ transitionDuration: '500ms,760ms,680ms' }}
      />
      <span className={`pointer-events-none absolute right-1 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center transition duration-300 group-hover:-translate-x-1 group-hover:scale-105 group-hover:text-white group-active:text-white sm:h-11 sm:w-11 ${arrowPalette}`}>
        <ArrowLeft className="h-[22px] w-[22px] transition-transform duration-300 group-hover:scale-110 sm:h-6 sm:w-6" />
      </span>
      <span className={`relative z-20 min-w-[124px] translate-x-3 px-2 text-center text-[1.55rem] leading-none transition duration-300 group-hover:translate-x-3.5 group-hover:scale-[1.03] sm:min-w-[148px] sm:text-[1.85rem] ${labelPalette}`}>
        ابــــدأ الآن
      </span>
    </Link>
  );
}

function SectionHeader({
  badge,
  title,
  subtitle,
  light = false,
  titleClassName = '',
}: {
  badge?: { label: string; icon: BadgeIconName; variant: BadgeVariant };
  title: string;
  subtitle?: string;
  light?: boolean;
  titleClassName?: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {badge && <BadgePill badge={badge} />}
      <h2 className={`${badge ? 'mt-6' : 'mt-0'} ${titleClassName || 'text-3xl font-bold leading-tight sm:text-4xl'} ${light ? 'text-white' : 'text-secondary'}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`mx-auto mt-3 max-w-2xl whitespace-pre-line text-base leading-relaxed ${light ? 'text-white/68' : 'text-secondary/64'}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

function ProofStrip({ light = false }: { light?: boolean }) {
  return (
    <div
      className={`relative inline-flex max-w-full flex-wrap items-center justify-center gap-3 overflow-hidden rounded-full border px-4 py-2.5 shadow-sm ${
      light ? 'border-white/18 bg-[#1c3933] text-white shadow-[0_14px_34px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.16)]' : 'border-[#ead3b9]/80 bg-white/75 text-secondary'
    }`}
    >
      <div className="relative z-10 flex -space-x-2 space-x-reverse">
        {reviewComments.slice(0, 3).map((comment) => (
          <Image
            key={comment.name}
            src={comment.avatarSrc}
            alt=""
            width={34}
            height={34}
            className="h-8 w-8 rounded-full border-2 border-[#fdf6ee] object-cover"
          />
        ))}
      </div>
      <div className="relative z-10 flex items-center gap-0.5 text-primary" aria-label="تقييم 5 نجوم">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star key={index} className="h-4 w-4 fill-current" />
        ))}
      </div>
      <span className={`relative z-10 text-sm font-bold ${light ? 'text-white/82' : 'text-secondary/76'}`}>
        {airbnbLandingContent.proofText}
      </span>
    </div>
  );
}

function VideoPreviewCard({
  imageSrc,
  videoSrc,
  posterSrc,
  alt,
  portrait = false,
  aspectClass,
  priority = false,
  className = '',
}: {
  imageSrc?: string;
  videoSrc?: string;
  posterSrc?: string;
  alt: string;
  portrait?: boolean;
  aspectClass?: string;
  priority?: boolean;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSrc) return;

    video.pause();
    video.load();
  }, [posterSrc, videoSrc]);

  const togglePlayback = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      try {
        await video.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-[2rem] border border-white/20 bg-secondary shadow-2xl ${className}`}>
      <div className={`relative ${aspectClass || (portrait ? 'aspect-[4/5]' : 'aspect-video')}`}>
        {videoSrc ? (
          <video
            ref={videoRef}
            src={videoSrc}
            poster={posterSrc}
            className="h-full w-full object-cover"
            playsInline
            preload="metadata"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
          />
        ) : (
          <Image
            src={imageSrc || '/images/hero/hero-1.jpg'}
            alt={alt}
            fill
            priority={priority}
            className="object-cover"
            sizes="(max-width: 768px) 92vw, 920px"
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-secondary/5 via-transparent to-secondary/18" />
        {videoSrc ? (
          <button
            type="button"
            onClick={togglePlayback}
            aria-label={isPlaying ? 'إيقاف الفيديو' : 'تشغيل الفيديو'}
            className={`absolute inset-0 z-10 flex items-center justify-center transition-opacity duration-300 focus-visible:opacity-100 focus-visible:outline-none ${
              isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'
            }`}
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-white/16 text-white shadow-[0_18px_45px_rgba(0,0,0,0.24)] backdrop-blur-md transition-transform duration-300 hover:scale-105 sm:h-20 sm:w-20">
              <Play className="h-7 w-7 fill-current" />
            </span>
          </button>
        ) : (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-white/16 text-white shadow-[0_18px_45px_rgba(0,0,0,0.24)] backdrop-blur-md sm:h-20 sm:w-20">
            <Play className="h-7 w-7 fill-current" />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function HeroSection({ ctaHref }: { ctaHref: string }) {
  return (
    <section className="relative overflow-hidden rounded-b-[2.5rem] border-t border-primary/10 bg-secondary px-4 pb-14 pt-44 text-center sm:rounded-b-[3.75rem] sm:px-6 sm:pt-48 lg:rounded-b-[5rem] lg:px-8 lg:pb-18 lg:pt-44">
      <div
        className="absolute inset-0 opacity-[0.09]"
        style={{
          backgroundImage: "url('/patterns/pattern-vertical-white.png')",
          backgroundRepeat: 'repeat',
          backgroundSize: 'clamp(680px, 178vw, 1180px) auto',
          backgroundPosition: 'center',
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        <Reveal delay={0.12}>
          <h1 className="airbnb-display-title mx-auto max-w-5xl text-[2.15rem] leading-[1.3] text-white sm:text-[3.25rem] lg:text-[4.05rem]">
            {airbnbLandingContent.heroTitle}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/72 sm:text-lg">
            {airbnbLandingContent.heroDescription}
          </p>
        </Reveal>

        <Reveal delay={0.22} className="mx-auto mt-8 max-w-4xl rounded-[2.65rem] border border-white/22 bg-white/10 p-2 shadow-[0_22px_60px_rgba(0,0,0,0.22)] sm:rounded-[2.25rem]">
          <VideoPreviewCard
            videoSrc={airbnbLandingContent.heroVideoSrc}
            posterSrc={airbnbLandingContent.heroPosterSrc}
            alt="إعلان كورس Airbnb"
            className="!rounded-[2.32rem] border-white/25 bg-white/8 shadow-none sm:!rounded-[1.95rem]"
          />
        </Reveal>

        <Reveal delay={0.3} className="mt-7">
          <ProofStrip light />
        </Reveal>
        <Reveal delay={0.36} className="mt-5">
          <StartNowButton
            href={ctaHref}
            inverted
          />
        </Reveal>
      </div>
    </section>
  );
}

function ReviewsSection({ ctaHref }: { ctaHref: string }) {
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);
  const activeReview = reviewComments[activeReviewIndex] || reviewComments[0];

  return (
    <section className={`${sectionClass} bg-[#fdf6ee]`}>
      <div className={sectionInnerClass}>
        <Reveal>
          <SectionHeader
            badge={airbnbLandingContent.badges.reviews}
            title="ابدأ الآن و حقق أرباحك"
            subtitle={'خلاصة تجربة مشتركين عاشوا الرحلة وشاركونا نتائجهم و أرباحهم\nالدور عليك في انتظار نتائجك'}
          />
        </Reveal>

        <div className="mt-10 grid gap-5 lg:grid-cols-[1.18fr_0.82fr] lg:items-center">
          <Reveal direction="right" className="w-full">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.div
                key={activeReview.videoSrc}
                initial={{ opacity: 0, scale: 0.94, y: 34, filter: 'blur(24px)' }}
                animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 1.015, y: -16, filter: 'blur(20px)' }}
                transition={mediaSwitchTransition}
                transformTemplate={gpuTransform}
                style={{ ...stableMotionStyle, willChange: 'opacity, transform, filter' }}
              >
                <VideoPreviewCard
                  videoSrc={activeReview.videoSrc}
                  posterSrc={activeReview.posterSrc}
                  alt="رأي أحد المشتركين في الدورة"
                  aspectClass="aspect-[16/10] sm:aspect-video"
                  className="border-[#ead3b9]/80 bg-white p-0 shadow-[0_18px_44px_rgba(16,48,43,0.12)]"
                />
              </motion.div>
            </AnimatePresence>
          </Reveal>

          <Reveal direction="left" className="-mx-6 flex scroll-px-6 gap-4 overflow-x-auto px-6 py-8 scrollbar-hide sm:-mx-8 sm:scroll-px-8 sm:px-8 sm:py-9 lg:mx-0 lg:grid lg:gap-5 lg:overflow-visible lg:px-0 lg:py-3">
            {reviewComments.map((comment, index) => (
              <ReviewCommentCard
                key={comment.text}
                comment={comment}
                isActive={index === activeReviewIndex}
                index={index}
                onSelect={() => setActiveReviewIndex(index)}
              />
            ))}
          </Reveal>
        </div>

        <Reveal delay={0.08} className="mt-2 text-center sm:mt-4">
          <StartNowButton href={ctaHref} />
        </Reveal>
      </div>
    </section>
  );
}

function ReviewCommentCard({
  comment,
  isActive,
  index,
  onSelect,
}: {
  comment: (typeof reviewComments)[number];
  isActive: boolean;
  index: number;
  onSelect: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      aria-pressed={isActive}
      data-review-index={index}
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.32 }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: smoothEase }}
      className={`min-w-[330px] scroll-mx-6 rounded-[1.75rem] border p-5 text-start shadow-[0_18px_40px_rgba(16,48,43,0.1)] transition duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:min-w-[370px] sm:scroll-mx-8 sm:p-6 lg:min-w-0 ${
        isActive
          ? 'border-secondary bg-secondary text-white shadow-[0_18px_44px_rgba(16,48,43,0.22)]'
          : 'border-[#ead3b9]/80 bg-white text-secondary hover:-translate-y-1 hover:border-primary/55'
      }`}
    >
      <div className="flex items-center gap-4">
        <Image
          src={comment.avatarSrc}
          alt=""
          width={58}
          height={58}
          className="h-14 w-14 rounded-full border-2 border-primary/40 object-cover shadow-sm"
        />
        <div>
          <h3 className={`text-base font-bold sm:text-lg ${isActive ? 'text-white' : 'text-secondary'}`}>{comment.name}</h3>
          <p className={`text-sm font-semibold ${isActive ? 'text-white/52' : 'text-secondary/45'}`}>{comment.handle}</p>
        </div>
      </div>
      <div className="mt-5 flex items-center gap-1 text-primary">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star key={index} className="h-4 w-4 fill-current sm:h-5 sm:w-5" />
        ))}
      </div>
      <p className={`mt-4 text-base font-semibold leading-relaxed sm:text-lg ${isActive ? 'text-white/74' : 'text-secondary/72'}`}>
        {comment.text}
      </p>
    </motion.button>
  );
}

function AudienceTabsSection({ ctaHref }: { ctaHref: string }) {
  const [activeId, setActiveId] = useState(audienceTabs[0].id);

  return (
    <section className={`${sectionClass} bg-white`}>
      <div className={sectionInnerClass}>
        <Reveal>
          <SectionHeader
            title="هل أنت واحد منهم ؟"
            subtitle="لو انت واحد منهم ف الكورس دا ليك انت"
          />
        </Reveal>

        <Reveal delay={0.08} className="mx-auto mt-7 flex w-full max-w-3xl gap-2 overflow-x-auto scroll-smooth rounded-full border border-[#ead3b9]/70 bg-[#faf7f2] p-2 scrollbar-hide">
          {audienceTabs.map((tab) => {
            const isActive = tab.id === activeId;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveId(tab.id)}
                aria-pressed={isActive}
                className={`min-h-11 shrink-0 rounded-full px-5 py-2.5 text-center text-sm font-bold leading-tight transition ${
                  isActive
                    ? 'bg-secondary text-primary shadow-[0_10px_24px_rgba(16,48,43,0.16)]'
                    : 'text-secondary/62 hover:bg-white hover:text-secondary'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </Reveal>

        <div className="mt-7 grid gap-6 rounded-[2rem] border border-[#ead3b9]/75 bg-[#faf7f2] p-3 shadow-xl md:grid-cols-[1.05fr_0.95fr] md:items-center md:p-5">
          <div className="relative aspect-video overflow-hidden rounded-[1.5rem] bg-secondary md:aspect-[4/3]">
            {audienceTabs.map((tab) => (
              <motion.div
                key={tab.id}
                aria-hidden={tab.id !== activeId}
                animate={tab.id === activeId ? { opacity: 1, filter: 'blur(0px)' } : { opacity: 0, filter: 'blur(18px)' }}
                transition={audienceSwitchTransition}
                style={{ ...stableMotionStyle, willChange: 'opacity, filter' }}
                className="pointer-events-none absolute inset-0"
              >
                <Image
                  src={tab.imageSrc}
                  alt={tab.imageAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 92vw, 560px"
                />
              </motion.div>
            ))}
            <div className="absolute inset-0 bg-linear-to-b from-transparent to-secondary/28" />
            <span className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/18 text-white backdrop-blur-md">
              <Play className="h-5 w-5 fill-current" />
            </span>
          </div>

          <div className="px-2 pb-4 text-center md:px-5 md:pb-0 md:text-start">
            <div className="relative min-h-[410px] overflow-hidden sm:min-h-[330px] md:min-h-[350px] lg:min-h-[310px]">
              {audienceTabs.map((tab) => (
                <motion.div
                  key={tab.id}
                  aria-hidden={tab.id !== activeId}
                  animate={tab.id === activeId ? { opacity: 1, filter: 'blur(0px)' } : { opacity: 0, filter: 'blur(18px)' }}
                  transition={audienceSwitchTransition}
                  style={{ ...stableMotionStyle, willChange: 'opacity, filter' }}
                  className="pointer-events-none absolute inset-x-0 top-0"
                >
                  <h3 className="text-2xl font-bold leading-snug text-secondary">{tab.title}</h3>
                  <p className="mt-3 text-base leading-relaxed text-secondary/68">{tab.text}</p>
                </motion.div>
              ))}
            </div>
            <div className="mt-6">
              <StartNowButton href={ctaHref} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function splitModuleTitle(title: string) {
  const [station, ...rest] = title.split(':');
  return {
    station: station.trim(),
    title: rest.join(':').trim() || title,
  };
}

function CurriculumSection({ ctaHref }: { ctaHref: string }) {
  const [openModule, setOpenModule] = useState(0);

  return (
    <section id="curriculum" className={`${sectionClass} bg-[#faf7f2]`}>
      <div className={sectionInnerClass}>
        <Reveal>
          <SectionHeader
            badge={airbnbLandingContent.badges.curriculum}
            title="محتويات رحلة تحقيق الأرباح"
            subtitle="من فهم المجال إلى تشغيل الوحدة وتحسين النتائج."
          />
        </Reveal>

        <div className="mx-auto mt-6 flex max-w-3xl flex-wrap justify-center gap-2">
          {airbnbLandingContent.stats.map((stat, index) => (
            <motion.span
              key={stat}
              initial={{ opacity: 0, y: 16, scale: 0.94 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.52, delay: index * 0.07, ease: smoothEase }}
              transformTemplate={gpuTransform}
              style={{ ...stableMotionStyle, willChange: 'transform, opacity' }}
              className="rounded-full border border-[#ead3b9]/85 bg-white/75 px-4 py-2 text-sm font-bold text-secondary shadow-sm"
            >
              {stat}
            </motion.span>
          ))}
        </div>

        <Reveal delay={0.08} className="mx-auto mt-8 max-w-4xl overflow-hidden rounded-[1.5rem] border border-[#ead3b9]/80 bg-white shadow-xl">
          {curriculumModules.map((module, index) => {
            const isOpen = openModule === index;
            const titleParts = splitModuleTitle(module.title);

            return (
              <motion.div
                key={module.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.56, delay: index * 0.055, ease: smoothEase }}
                transformTemplate={gpuTransform}
                style={{ ...stableMotionStyle, willChange: 'transform, opacity' }}
                className="border-b border-[#ead3b9]/45 last:border-b-0"
              >
                <button
                  type="button"
                  onClick={() => setOpenModule(isOpen ? -1 : index)}
                  className="flex w-full items-center justify-between gap-4 px-4 py-4 text-start transition hover:bg-[#ead3b9]/16 sm:px-5"
                >
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-primary-dark">{titleParts.station}</span>
                    <h3 className="mt-1 text-base font-bold text-secondary sm:text-lg">{titleParts.title}</h3>
                    <p className="mt-1 text-sm text-secondary/55">{module.outcome}</p>
                  </div>
                  <motion.span animate={{ rotate: isOpen ? 180 : 0 }} className="shrink-0 rounded-full bg-[#faf7f2] p-2">
                    <ChevronDown className="h-4 w-4 text-secondary/55" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: smoothEase }}
                      className="overflow-hidden"
                    >
                      <div className="grid gap-2 bg-[#faf7f2] px-5 py-4">
                        {module.lessons.map((lesson) => (
                          <div key={lesson} className="flex items-center gap-2 text-sm font-semibold text-secondary/70">
                            <BookOpen className="h-4 w-4 shrink-0 text-primary-dark" />
                            {lesson}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                    )}
                  </AnimatePresence>
              </motion.div>
            );
          })}
        </Reveal>

        <Reveal delay={0.08} className="mt-8 text-center">
          <StartNowButton href={ctaHref} />
        </Reveal>
      </div>
    </section>
  );
}

function InstructorPortraitStack() {
  return (
    <div className="relative mx-auto w-full max-w-lg lg:mx-0" style={{ perspective: '1200px' }}>
      <motion.div
        className="relative"
        style={{ transformStyle: 'preserve-3d' }}
        whileHover={{ rotateX: -1.5, rotateY: 1.5, scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
      >
        <motion.div
          className="absolute inset-0 z-0"
          animate={{ y: [0, -8, 0], x: [0, 4, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
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
          className="relative z-10 overflow-hidden rounded-[2rem]"
          initial={{ opacity: 0.94, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.66, ease: smoothEase }}
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
          animate={{ y: [0, 10, 0], x: [0, -5, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
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
          animate={{ y: [0, -12, 0], x: [0, 5, 0] }}
          transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
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
    </div>
  );
}

function InstructorSection() {
  const instructorStats: Array<{ value: string; label: string; icon: LucideIcon }> = [
    { value: '٦ سنوات', label: 'خبره', icon: TrendingUp },
    { value: '٥ الاف', label: 'ليلة', icon: Clock },
    { value: '٣ الاف', label: 'عميل راضي', icon: Users },
  ];

  return (
    <section id="instructor" className={`${sectionClass} bg-white`}>
      <div className={`${sectionInnerClass} grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center`}>
        <Reveal direction="right">
          <InstructorPortraitStack />
        </Reveal>

        <Reveal direction="left" className="text-center lg:text-start">
          <h2 className="text-3xl font-bold leading-tight text-secondary sm:text-4xl">خبرة بدأت بخسارة ثم تعلم ثم احتراف</h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-secondary/64">
            أنقل لك خلاصة عملية في مجال الإجارات الفندقية
          </p>
          <blockquote className="relative mt-6 rounded-[1.5rem] border border-[#ead3b9]/80 bg-[#faf7f2] p-5 text-lg font-bold leading-relaxed text-secondary shadow-lg">
            <span className="absolute inset-y-5 right-0 w-1 rounded-l-full bg-primary" />
            &quot;هدفي أختصر عليك طريقك لتحقيق ٢٠،٠٠٠ دخل شهري من خلال تطبيق AirBnb&quot;
          </blockquote>

          <div className="mt-6 grid grid-cols-3 gap-3">
            {instructorStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 18, scale: 0.96 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.54, ease: smoothEase }}
                  transformTemplate={gpuTransform}
                  style={{ ...stableMotionStyle, willChange: 'transform, opacity' }}
                  className="rounded-[1.25rem] border border-[#ead3b9]/80 bg-white p-4 text-center shadow-sm"
                >
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/18 text-secondary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-xl font-bold text-secondary sm:text-2xl">{stat.value}</p>
                  <p className="mt-1 text-xs font-bold leading-tight text-secondary/58 sm:text-sm">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function FaqSection({ ctaHref }: { ctaHref: string }) {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <section id="faq" className={`${sectionClass} bg-[#faf7f2]`}>
      <div className={sectionInnerClass}>
        <Reveal className="mb-5 flex justify-center">
          <BadgePill badge={airbnbLandingContent.badges.questions} />
        </Reveal>
        <Reveal delay={0.08} className="mx-auto max-w-4xl rounded-[1.75rem] border border-[#ead3b9]/80 bg-white p-4 shadow-xl sm:p-6">
          <SectionHeader title="أسئلة أكيد في بالك" />

          <div className="mt-7 overflow-hidden rounded-[1.25rem] border border-[#ead3b9]/70">
            {faqItems.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <motion.div
                  key={faq.question}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.45 }}
                  transition={{ duration: 0.5, delay: index * 0.05, ease: smoothEase }}
                  transformTemplate={gpuTransform}
                  style={{ ...stableMotionStyle, willChange: 'transform, opacity' }}
                  className="border-b border-[#ead3b9]/45 last:border-b-0"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    className="flex w-full items-center justify-between gap-4 px-4 py-4 text-start transition hover:bg-[#faf7f2]"
                  >
                    <span className="text-sm font-bold text-secondary sm:text-base">{faq.question}</span>
                    <motion.span animate={{ rotate: isOpen ? 180 : 0 }} className="shrink-0">
                      <ChevronDown className="h-4 w-4 text-secondary/48" />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: smoothEase }}
                        className="overflow-hidden"
                      >
                        <p className="px-4 pb-4 text-sm leading-relaxed text-secondary/64">{faq.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-6 text-center">
            <StartNowButton href={ctaHref} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function FinalReviewMarquee() {
  const marqueeComments = [...reviewComments, ...reviewComments];

  return (
    <div dir="ltr" className="relative overflow-hidden rounded-[1.7rem] px-5 py-9 sm:px-7">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-linear-to-r from-secondary to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-linear-to-l from-secondary to-transparent" />
      <motion.div
        className="flex w-max gap-5"
        animate={{ x: ['-50%', '0%'] }}
        transition={{ duration: 34, repeat: Infinity, ease: 'linear' }}
      >
        {marqueeComments.map((comment, index) => (
          <article
            key={`${comment.name}-${index}`}
            dir="rtl"
            className="w-[340px] shrink-0 rounded-[1.6rem] border border-white/15 bg-white/[0.08] p-5 text-start shadow-[0_18px_38px_rgba(0,0,0,0.16)] backdrop-blur sm:w-[390px] sm:p-6"
          >
            <div className="flex items-center gap-4">
              <Image
                src={comment.avatarSrc}
                alt=""
                width={58}
                height={58}
                className="h-14 w-14 rounded-full border-2 border-primary/55 object-cover shadow-sm"
              />
              <div>
                <p className="text-base font-bold text-white sm:text-lg">{comment.name}</p>
                <p className="text-sm font-semibold text-white/52">{comment.handle}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-primary">
              {Array.from({ length: 5 }).map((_, starIndex) => (
                <Star key={starIndex} className="h-4 w-4 fill-current sm:h-5 sm:w-5" />
              ))}
            </div>
            <p className="mt-4 line-clamp-4 text-base font-semibold leading-relaxed text-white/74 sm:text-lg">{comment.text}</p>
          </article>
        ))}
      </motion.div>
    </div>
  );
}

function FinalCtaSection({ ctaHref }: { ctaHref: string }) {
  return (
    <section className="bg-[#faf7f2] px-4 py-14 pb-28 sm:px-6 lg:px-8 md:pb-16">
      <div className="mx-auto max-w-6xl space-y-5">
        <Reveal className="relative overflow-hidden rounded-[2rem] border border-[#2e5852] bg-secondary px-0 py-9 text-center shadow-[0_22px_55px_rgba(16,48,43,0.28)] sm:py-11 lg:py-14">
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage: "url('/patterns/pattern-horizontal-white.png')",
              backgroundRepeat: 'repeat',
              backgroundSize: 'clamp(720px, 190vw, 1280px) auto',
              backgroundPosition: 'center',
            }}
          />
          <div className="relative z-10">
            <div className="px-5 sm:px-8">
              <SectionHeader
                light
                title={airbnbLandingContent.heroTitle}
                subtitle="تعلم مجال الإستضافة الفندقية في وقت قياسي و ابدأ في استلام أرباحك"
                titleClassName="airbnb-display-title mx-auto max-w-4xl text-[2rem] leading-[1.3] sm:text-[2.75rem] lg:text-[3.25rem]"
              />
            </div>
            <div className="mt-8">
              <FinalReviewMarquee />
            </div>
            <div className="mt-6 px-5 sm:px-8">
              <ProofStrip light />
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.12} className="pt-2 text-center">
          <StartNowButton href={ctaHref} />
        </Reveal>
      </div>
    </section>
  );
}

export default function AirbnbCourseLandingPage({ courseSlug }: AirbnbCourseLandingPageProps) {
  const ctaHref = getAirbnbCourseContentHref(courseSlug);

  return (
    <main className="overflow-hidden scroll-smooth">
      <HeroSection ctaHref={ctaHref} />
      <ReviewsSection ctaHref={ctaHref} />
      <AudienceTabsSection ctaHref={ctaHref} />
      <CurriculumSection ctaHref={ctaHref} />
      <InstructorSection />
      <FaqSection ctaHref={ctaHref} />
      <FinalCtaSection ctaHref={ctaHref} />
      <span className="sr-only">{AIRBNB_COURSE_TITLE}</span>
    </main>
  );
}
