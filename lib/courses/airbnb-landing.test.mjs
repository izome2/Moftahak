import assert from 'node:assert/strict';
import test from 'node:test';

import {
  AIRBNB_COURSE_TITLE,
  AIRBNB_LANDING_ENTRY_SOURCE,
  AIRBNB_LANDING_ROUTE,
  airbnbLandingContent,
  curriculumModules,
  getAirbnbCourseContentHref,
  getAirbnbCourseEnrollHref,
  getAirbnbCourseLandingHref,
  getDiscountCountdownParts,
  getVisibleProofStats,
  isAirbnbCourse,
} from './airbnb-landing.ts';

test('detects the Airbnb course by title or slug', () => {
  assert.equal(
    isAirbnbCourse({
      title: AIRBNB_COURSE_TITLE,
      slug: 'anything',
    }),
    true
  );

  assert.equal(
    isAirbnbCourse({
      title: 'دورة أخرى',
      slug: 'كورس-تعلم-واحتراف-مجال-airbnb',
    }),
    true
  );

  assert.equal(
    isAirbnbCourse({
      title: 'دورة تأسيس',
      slug: 'اهلا-بكم',
    }),
    true
  );

  assert.equal(
    isAirbnbCourse({
      title: 'دورة أخرى',
      slug: 'other-course',
    }),
    false
  );
});

test('routes Airbnb course cards to landing while other courses keep detail links', () => {
  assert.equal(
    getAirbnbCourseLandingHref({
      title: AIRBNB_COURSE_TITLE,
      slug: 'published-airbnb-slug',
    }),
    AIRBNB_LANDING_ROUTE
  );

  assert.equal(
    getAirbnbCourseLandingHref({
      title: 'دورة أخرى',
      slug: 'other-course',
    }),
    '/courses/other-course'
  );
});

test('builds enrollment href from the resolved course slug', () => {
  assert.equal(
    getAirbnbCourseEnrollHref('كورس-تعلم-واحتراف-مجال-airbnb'),
    '/courses/%D9%83%D9%88%D8%B1%D8%B3-%D8%AA%D8%B9%D9%84%D9%85-%D9%88%D8%A7%D8%AD%D8%AA%D8%B1%D8%A7%D9%81-%D9%85%D8%AC%D8%A7%D9%84-airbnb/enroll'
  );
});

test('builds content href from the resolved course slug', () => {
  assert.equal(
    getAirbnbCourseContentHref('اهلا-بكم'),
    `/courses/%D8%A7%D9%87%D9%84%D8%A7-%D8%A8%D9%83%D9%85?from=${AIRBNB_LANDING_ENTRY_SOURCE}`
  );
});

test('returns proof stats visible at the current video time', () => {
  const stats = getVisibleProofStats(10, [
    { time: 0, label: 'الوحدة', value: 'ستوديو فاخر' },
    { time: 3, label: 'متوسط سعر الليلة', value: '1,850 جنيه' },
    { time: 12, label: 'المصاريف', value: '11,400 جنيه' },
  ]);

  assert.deepEqual(stats, [
    { time: 0, label: 'الوحدة', value: 'ستوديو فاخر' },
    { time: 3, label: 'متوسط سعر الليلة', value: '1,850 جنيه' },
  ]);
});

test('returns clamped discount countdown parts from two dates', () => {
  assert.deepEqual(
    getDiscountCountdownParts(
      new Date('2026-05-05T10:00:00.000Z'),
      new Date('2026-05-07T13:04:09.000Z')
    ),
    { days: 2, hours: 3, minutes: 4, seconds: 9 }
  );

  assert.deepEqual(
    getDiscountCountdownParts(
      new Date('2026-05-08T10:00:00.000Z'),
      new Date('2026-05-07T13:04:09.000Z')
    ),
    { days: 0, hours: 0, minutes: 0, seconds: 0 }
  );
});

test('landing hero uses the requested Airbnb promise and compact proof stats', () => {
  assert.equal(
    airbnbLandingContent.heroTitle,
    'حقق ٢٠,٠٠٠ جنيه دخل شهري بدون رأس مال باستثمار تطبيق Airbnb'
  );
  assert.equal(
    airbnbLandingContent.heroDescription,
    'تعلم مجال الإستضافة الفندقية في وقت قياسي و ابدأ في استلام أرباحك!'
  );
  assert.deepEqual(airbnbLandingContent.stats, [
    '٧ دروس',
    'ساعتين',
    '٦ محطات',
  ]);
});

test('landing badges define the requested labels with suitable icons', () => {
  assert.deepEqual(airbnbLandingContent.badges, {
    promise: { label: 'الوعد', icon: 'BadgeCheck', variant: 'green' },
    reviews: { label: 'المراجعات', icon: 'Heart', variant: 'beige' },
    curriculum: { label: 'محتويات الكورس', icon: 'BookOpen', variant: 'beige' },
    questions: { label: 'الأسئلة', icon: 'CircleHelp', variant: 'beige' },
  });
});

test('curriculum modules match the six requested compact stations', () => {
  assert.deepEqual(
    curriculumModules.map((module) => module.title),
    [
      'المحطة 1: فهم مجال الاستضافة',
      'المحطة 2: تحول مجال الاستضافة لمجال ذكي بعد دخول التكنولوجيا',
      'المحطة 3: شرح Airbnb بطريقة احترافية',
      'المحطة 4: كيفية اختيار المنطقة الرابحة',
      'المحطة 5: مصادر الشقق وأنواع الاتفاقات مع أصحاب الشقق',
      'المحطة 6: تفاصيل صغيرة تعمل فارق كبير',
    ]
  );
  assert.equal(
    curriculumModules.every((module) => module.lessons.length <= 3),
    true
  );
});
