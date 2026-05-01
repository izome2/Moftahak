export const AIRBNB_COURSE_TITLE = 'كورس تعلم واحتراف مجال AirBNB';
export const AIRBNB_LANDING_ROUTE = '/courses/airbnb/landing';
export const AIRBNB_LANDING_ENTRY_SOURCE = 'airbnb-landing';
export const AIRBNB_PRICE = 4999;
export const AIRBNB_VALUE_PRICE = 9600;
export const AIRBNB_FALLBACK_SLUG = 'كورس-تعلم-واحتراف-مجال-airbnb';

export const AIRBNB_SLUG_CANDIDATES = [
  AIRBNB_FALLBACK_SLUG,
  'اهلا-بكم',
  'airbnb-course',
  'airbnb',
  'learn-airbnb',
];

const AIRBNB_SLUG_CANDIDATE_SET = new Set(AIRBNB_SLUG_CANDIDATES);

export interface CourseIdentity {
  title: string;
  slug: string;
}

export interface ProofStat {
  time: number;
  label: string;
  value: string;
  detail?: string;
}

export interface ProofVideo {
  id: string;
  title: string;
  location: string;
  unitType: string;
  videoSrc: string;
  posterSrc: string;
  stats: ProofStat[];
}

export interface CurriculumModule {
  title: string;
  outcome: string;
  lessons: string[];
}

export function isAirbnbCourse(course: CourseIdentity | null | undefined): boolean {
  if (!course) return false;

  return course.title.trim() === AIRBNB_COURSE_TITLE || AIRBNB_SLUG_CANDIDATE_SET.has(course.slug);
}

export function getAirbnbCourseLandingHref(course: CourseIdentity): string {
  return isAirbnbCourse(course) ? AIRBNB_LANDING_ROUTE : `/courses/${encodeURIComponent(course.slug)}`;
}

export function getAirbnbCourseEnrollHref(slug: string | null | undefined): string {
  return `/courses/${encodeURIComponent(slug || AIRBNB_FALLBACK_SLUG)}/enroll`;
}

export function getAirbnbCourseContentHref(slug: string | null | undefined): string {
  return `/courses/${encodeURIComponent(slug || AIRBNB_FALLBACK_SLUG)}?from=${AIRBNB_LANDING_ENTRY_SOURCE}`;
}

export function getVisibleProofStats(currentTime: number, stats: ProofStat[]): ProofStat[] {
  return stats.filter((stat) => currentTime >= stat.time);
}

export const airbnbLandingContent = {
  heroTitle: 'ادخل AirBNB بخطة واضحة… لا بتجربة عشوائية',
  heroDescription:
    'كورس مختصر وعملي يفهمك السوق، اختيار الوحدة، التجهيز، التسعير، وتشغيل الإيجار قصير الأجل بثقة.',
  trustPoints: [
    'للمبتدئين وأصحاب الوحدات',
    'تطبيق عملي لا تنظير',
    'وصول مدى الحياة',
    'ضمان 14 يوم',
  ],
  stats: ['45 درس', '13 ساعة', '6 محطات', '4,999 جنيه'],
  priceIncludes: [
    '45 درس',
    '13 ساعة محتوى',
    '6 محطات',
    'وصول مدى الحياة',
    'ملفات مساعدة',
    'ضمان 14 يوم',
  ],
  paymentMethods: 'Visa / MasterCard / InstaPay',
};

export const proofVideos: ProofVideo[] = [
  {
    id: 'new-cairo-studio',
    title: 'ستوديو فاخر — القاهرة الجديدة',
    location: 'القاهرة الجديدة',
    unitType: 'ستوديو فاخر',
    videoSrc: '/videos/instagram-1.mp4',
    posterSrc: '/images/thumbnails/instagram-1.png',
    stats: [
      { time: 0, label: 'النموذج', value: 'ستوديو فاخر', detail: 'القاهرة الجديدة' },
      { time: 3, label: 'متوسط سعر الليلة', value: '1,850 جنيه' },
      { time: 6, label: 'نسبة الإشغال', value: '78%' },
      { time: 9, label: 'الإيراد الشهري', value: '43,290 جنيه' },
      { time: 12, label: 'المصاريف', value: '11,400 جنيه' },
      { time: 15, label: 'صافي الربح', value: '31,890 جنيه' },
      { time: 18, label: 'التقييم', value: '4.9/5', detail: 'نتيجة تشغيل مستقرة' },
    ],
  },
];

export const curriculumModules: CurriculumModule[] = [
  {
    title: 'المحطة 01: فهم السوق ونموذج العمل',
    outcome: 'تفهم كيف يعمل النموذج وأين توجد الفرصة.',
    lessons: [
      'نموذج الإيجار قصير الأجل',
      'الفرق عن الإيجار التقليدي',
      'أخطاء البداية',
    ],
  },
  {
    title: 'المحطة 02: اختيار الوحدة المناسبة',
    outcome: 'تعرف متى تدخل ومتى ترفض الفرصة.',
    lessons: ['الموقع', 'مؤشرات الطلب', 'قرار الدخول'],
  },
  {
    title: 'المحطة 03: التجهيز والتأثيث',
    outcome: 'تجهز بذكاء بدون إهدار في تفاصيل لا تبيع.',
    lessons: ['أساسيات التجهيز', 'ما يهم الضيف', 'توازن الشكل والتكلفة'],
  },
  {
    title: 'المحطة 04: التسعير والحجوزات',
    outcome: 'تسعر حسب الموسم والطلب لا برقم ثابت.',
    lessons: ['أساسيات التسعير', 'المواسم', 'تحسين الإشغال'],
  },
  {
    title: 'المحطة 05: التشغيل وتجربة الضيف',
    outcome: 'تشغل الوحدة بنظام وتجربة ضيف أفضل.',
    lessons: ['رحلة الضيف', 'التواصل', 'رفع التقييمات'],
  },
  {
    title: 'المحطة 06: الأرقام والتوسع',
    outcome: 'تقرأ الأداء وتفكر في التوسع بناءً على أرقام.',
    lessons: ['الإيرادات والمصاريف', 'صافي الربح', 'قرار التوسع'],
  },
];
