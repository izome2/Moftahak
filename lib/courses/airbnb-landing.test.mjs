import assert from 'node:assert/strict';
import test from 'node:test';

import {
  AIRBNB_COURSE_TITLE,
  AIRBNB_LANDING_ENTRY_SOURCE,
  AIRBNB_LANDING_ROUTE,
  getAirbnbCourseContentHref,
  getAirbnbCourseEnrollHref,
  getAirbnbCourseLandingHref,
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
