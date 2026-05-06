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

export interface AudienceTab {
  id: string;
  label: string;
  title: string;
  text: string;
  imageSrc: string;
  imageAlt: string;
}

export interface ReviewComment {
  name: string;
  handle: string;
  avatarSrc: string;
  videoSrc: string;
  posterSrc: string;
  text: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface DiscountCountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
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

export function getDiscountCountdownParts(now: Date, endsAt: Date): DiscountCountdownParts {
  const totalSeconds = Math.max(0, Math.floor((endsAt.getTime() - now.getTime()) / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
}

export const airbnbLandingContent = {
  heroLabel: 'الوعد',
  heroTitle: 'حقق ٢٠,٠٠٠ جنيه دخل شهري بدون رأس مال باستثمار تطبيق Airbnb',
  heroDescription: 'تعلم مجال الإستضافة الفندقية في وقت قياسي و ابدأ في استلام أرباحك!',
  heroVideoSrc: '/videos/courses/airbnb/hero-ad-1.mp4',
  heroPosterSrc: '/images/thumbnails/airbnb/hero-ad-1.png',
  discountDurationMs: ((3 * 24 + 21) * 60 * 60 + 59) * 1000,
  proofText: 'أكثر من ١٥٥ مشترك',
  badges: {
    promise: { label: 'الوعد', icon: 'BadgeCheck', variant: 'green' },
    reviews: { label: 'المراجعات', icon: 'Heart', variant: 'beige' },
    curriculum: { label: 'محتويات الكورس', icon: 'BookOpen', variant: 'beige' },
    questions: { label: 'الأسئلة', icon: 'CircleHelp', variant: 'beige' },
  } as const,
  stats: ['٧ دروس', 'ساعتين', '٦ محطات'],
  priceIncludes: [
    '٧ دروس',
    'ساعتين',
    '٦ محطات',
    'ملفات مساعدة',
  ],
  paymentMethods: 'Visa / MasterCard / InstaPay',
};

export const reviewComments: ReviewComment[] = [
  {
    name: 'محمد',
    handle: '@mohamed',
    avatarSrc: '/images/courses/airbnb/reviews/subscriber-1.png',
    videoSrc: '/videos/instagram-1.mp4',
    posterSrc: '/images/thumbnails/instagram-1.png',
    text: 'شكراً ليك ... تعبنا واحنا بندور على حد عربي يتكلم عن المجال ده',
  },
  {
    name: 'خالد',
    handle: '@khaled',
    avatarSrc: '/images/courses/airbnb/reviews/subscriber-2.png',
    videoSrc: '/videos/instagram-2.mp4',
    posterSrc: '/images/thumbnails/instagram-2.png',
    text: 'طول عمري بستخدم Airbnb عشان احجز شقة وانا مسافر - عمري ما تخيلت اني هكون صاحب شقة والناس تحجز عندي',
  },
  {
    name: 'عبدالله',
    handle: '@abdullah',
    avatarSrc: '/images/courses/airbnb/reviews/subscriber-3.png',
    videoSrc: '/videos/instagram-3.mp4',
    posterSrc: '/images/thumbnails/instagram-3.png',
    text: 'افضل استثمار عملته في حياتي اني اشتريت الكورس .. رجعت قيمته بشغل نص يوم',
  },
];

export const audienceTabs: AudienceTab[] = [
  {
    id: 'extra-income',
    label: 'دخل إضافي',
    title: 'بتدور على دخل إضافي بدون رأس مال',
    text: 'الدخل الاضافي مش معناه انك لازم يكون عندك راس مال او تخاطر بيه ، ولا معناه انك تشتغل شيفت زياده في الشركة عشان تاخد بدل ، هتتعلم تعمل دخل إضافي يوصل ل ۲۰۰۰$ وبدون راس مال',
    imageSrc: '/images/hero/hero-1.jpg',
    imageAlt: 'شقة فندقية جاهزة للتشغيل على Airbnb',
  },
  {
    id: 'real-estate-company',
    label: 'شركة عقارات',
    title: 'صاحب شركة عقارات او تشطيبات',
    text: 'انت صاحب شركة عقارات او تشطيبات وتقدر تقنع عملائك باستثمار شققهم ، هتتعلم كيف تدير شققهم وتحقق دخل عالي من خلال الإدارة',
    imageSrc: '/images/services/nzol_mydany.jpg',
    imageAlt: 'فريق عقاري يراجع وحدة مناسبة للتشغيل',
  },
  {
    id: 'unit-owner',
    label: 'صاحب وحدة',
    title: 'صاحب وحده فندقيه',
    text: 'انت صاحب شقه فندقيه وبتعتمد على الطرق التقليديه في الايجارات ، هتتعلم ازاي تستخدم تطبيق Airbnb بشكل احترافى يساعدك على جلب عملاء اكثر لشقتك',
    imageSrc: '/images/hero/slide-2.jpg',
    imageAlt: 'وحدة فندقية جاهزة لاستقبال الضيوف',
  },
  {
    id: 'tried-before',
    label: 'جربت وما نجحت',
    title: 'جربت المجال وما نجحت',
    text: 'نزلت شقة على airbnb لكن مفيش حجوزات او الحجوزات ضعيفه ؟ ، هتتعلم المشكله كانت فين ( الصور ، التسعير ، اختيار المنطقه ، الوصف ) وهتتعلم كيف تنزل شقتك بطريقه احترافيه على airbnb يساعدك على جذب العملاء',
    imageSrc: '/images/hero/slide-3.jpg',
    imageAlt: 'تحسين عرض الوحدة والصور لجذب الحجوزات',
  },
];

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
    title: 'المحطة 1: فهم مجال الاستضافة',
    outcome: 'تعرف كيف يعمل المجال وأين توجد فرصة الربح.',
    lessons: [
      'نموذج الإيجار قصير الأجل',
      'أين توجد الفرصة',
      'أخطاء البداية',
    ],
  },
  {
    title: 'المحطة 2: تحول مجال الاستضافة لمجال ذكي بعد دخول التكنولوجيا',
    outcome: 'تعرف نماذج البداية والشراكات وإدارة وحدات الغير.',
    lessons: ['الشراكات', 'إدارة وحدات الغير', 'تقليل المخاطرة'],
  },
  {
    title: 'المحطة 3: شرح Airbnb بطريقة احترافية',
    outcome: 'تعلم استخدام المنصة وإدارة الحجز والتواصل باحتراف.',
    lessons: ['إنشاء وتحسين الحساب', 'إدارة الحجز', 'التواصل مع الضيوف'],
  },
  {
    title: 'المحطة 4: كيفية اختيار المنطقة الرابحة',
    outcome: 'تعرف كيف تختار وحدة مناسبة وتجهزها للتشغيل.',
    lessons: ['الموقع', 'مواصفات الوحدة', 'التجهيز الأساسي'],
  },
  {
    title: 'المحطة 5: مصادر الشقق وأنواع الاتفاقات مع أصحاب الشقق',
    outcome: 'تعلم تحسين الصور والوصف والتسعير لزيادة فرص الحجز.',
    lessons: ['الصور', 'الوصف', 'التسعير'],
  },
  {
    title: 'المحطة 6: تفاصيل صغيرة تعمل فارق كبير',
    outcome: 'تابع الأداء، افهم الأرقام، وحسّن النتائج مع الوقت.',
    lessons: ['قراءة الأداء', 'تحسين الإيراد', 'التعامل مع التقييمات'],
  },
];

export const faqItems: FaqItem[] = [
  {
    question: 'هل أحتاج أن أملك شقة؟',
    answer: 'لا. يمكنك البدء بفهم نماذج الشراكة أو إدارة وحدات الغير قبل امتلاك وحدة.',
  },
  {
    question: 'هل هذا المجال يقتصر على دول معينة؟',
    answer: 'لا. المجال مناسب للعمل في دول كثيرة، مع مراعاة القوانين والطلب في كل سوق.',
  },
  {
    question: 'هل أحتاج خبرة سابقة؟',
    answer: 'لا. الكورس يبدأ من الأساسيات ثم ينتقل للتطبيق العملي.',
  },
  {
    question: 'هل الكورس نظري أم عملي؟',
    answer: 'عملي، ويركز على خطوات التشغيل والتسعير والعرض وتحسين النتائج.',
  },
  {
    question: 'هل أستطيع المشاهدة في أي وقت؟',
    answer: 'نعم، يمكنك مشاهدة الدروس في الوقت المناسب لك.',
  },
  {
    question: 'هل يوجد وصول مدى الحياة؟',
    answer: 'نعم، الوصول متاح حسب نظام الاشتراك الموضح داخل الصفحة.',
  },
  {
    question: 'ماذا لو لم يناسبني الكورس؟',
    answer: 'يمكنك طلب استرداد خلال فترة الضمان وفق السياسة المعتمدة.',
  },
];
