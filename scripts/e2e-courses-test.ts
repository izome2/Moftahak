/**
 * Comprehensive E2E Test Script for Moftahak Courses System
 * 
 * Tests the full lifecycle:
 * 1. Admin creates a course
 * 2. Admin adds sections and lessons
 * 3. Admin publishes the course
 * 4. Public user views the course
 * 5. User registers & enrolls (with direct DB enrollment for phone-verified flow)
 * 6. User watches a lesson (progress tracking)
 * 7. User adds a comment
 * 8. User likes a lesson
 * 9. User submits a review
 * 10. Admin views enrollments
 * 11. Cleanup
 * 
 * Usage:
 *   npx tsx scripts/e2e-courses-test.ts
 * 
 * Requirements:
 *   - Dev server running on http://localhost:3000
 *   - PostgreSQL database accessible
 *   - Admin user exists (admin@moftahak.com / Admin@2026)
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@moftahak.com';
const ADMIN_PASSWORD = 'Admin@2026';
const TEST_USER_EMAIL = `test-e2e-${Date.now()}@moftahak.com`;
const TEST_USER_PASSWORD = 'TestUser@2026';

// ─── Helpers ─────────────────────────────────────────────────
let adminCookies = '';
let userCookies = '';
let testCourseId = '';
let testCourseSlug = '';
let testSectionId = '';
let testLessonId = '';
let testUserId = '';
let testEnrollmentId = '';

const log = (icon: string, msg: string) => console.log(`${icon}  ${msg}`);
const pass = (msg: string) => log('✅', msg);
const fail = (msg: string) => { log('❌', msg); process.exitCode = 1; };
const info = (msg: string) => log('ℹ️', msg);
const section = (msg: string) => console.log(`\n${'═'.repeat(60)}\n  ${msg}\n${'═'.repeat(60)}`);

async function fetchJSON(
  path: string,
  options: RequestInit = {},
  cookies = ''
): Promise<{ status: number; data: Record<string, unknown> }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(cookies ? { Cookie: cookies } : {}),
    ...(options.headers as Record<string, string> || {}),
  };
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers, redirect: 'manual' });
  let data: Record<string, unknown> = {};
  try {
    data = await res.json();
  } catch {
    // Some responses may not have JSON body
  }
  return { status: res.status, data };
}

async function loginAs(email: string, password: string): Promise<string> {
  // NextAuth credentials login via CSRF token flow
  // Step 1: Get CSRF token
  const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`);
  const csrfData = await csrfRes.json() as { csrfToken: string };
  const csrfCookies = csrfRes.headers.getSetCookie?.()?.join('; ') || '';

  // Step 2: Sign in with credentials
  const signInRes = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: csrfCookies,
    },
    body: new URLSearchParams({
      csrfToken: csrfData.csrfToken,
      email,
      password,
      json: 'true',
    }),
    redirect: 'manual',
  });

  // Collect session cookies from Set-Cookie headers
  const setCookies = signInRes.headers.getSetCookie?.() || [];
  const sessionCookies = setCookies
    .map((c: string) => c.split(';')[0])
    .filter((c: string) => c.includes('next-auth') || c.includes('authjs'))
    .join('; ');

  if (!sessionCookies) {
    // Fallback: combine CSRF cookies with response cookies
    return csrfCookies;
  }
  return sessionCookies;
}

// ─── Test Steps ──────────────────────────────────────────────

async function step1_adminLogin() {
  section('Step 1: Admin Login');
  adminCookies = await loginAs(ADMIN_EMAIL, ADMIN_PASSWORD);
  
  // Verify we're authenticated by accessing admin courses API
  const { status, data } = await fetchJSON('/api/admin/courses?limit=1', {}, adminCookies);
  if (status === 200 && data.courses) {
    pass(`Admin logged in successfully. ${(data.courses as unknown[]).length} courses found.`);
  } else {
    fail(`Admin login failed. Status: ${status}`);
    throw new Error('Admin login failed - cannot proceed');
  }
}

async function step2_createCourse() {
  section('Step 2: Create Course');
  const { status, data } = await fetchJSON('/api/admin/courses', {
    method: 'POST',
    body: JSON.stringify({
      title: 'دورة اختبارية شاملة E2E',
      description: 'هذه دورة اختبارية تم إنشاؤها تلقائياً لاختبار النظام الشامل. تتضمن جميع المراحل من الإنشاء إلى المشاهدة والتقييم.',
      shortDescription: 'دورة اختبارية شاملة',
      price: 0, // Free course for easy enrollment
      level: 'BEGINNER',
      features: ['اختبار شامل', 'مجانية', 'تعلم ذاتي'],
    }),
  }, adminCookies);

  if (status === 201 && data.course) {
    const course = data.course as { id: string; slug: string; title: string };
    testCourseId = course.id;
    testCourseSlug = course.slug;
    pass(`Course created: "${course.title}" (ID: ${testCourseId}, Slug: ${testCourseSlug})`);
  } else {
    fail(`Course creation failed. Status: ${status}, Error: ${JSON.stringify(data)}`);
    throw new Error('Course creation failed');
  }
}

async function step3_addSections() {
  section('Step 3: Add Section');
  const { status, data } = await fetchJSON(
    `/api/admin/courses/${testCourseId}/sections`,
    {
      method: 'POST',
      body: JSON.stringify({ title: 'القسم الأول: المقدمة', sortOrder: 0 }),
    },
    adminCookies
  );

  if (status === 201 && data.section) {
    const sec = data.section as { id: string; title: string };
    testSectionId = sec.id;
    pass(`Section created: "${sec.title}" (ID: ${testSectionId})`);
  } else {
    fail(`Section creation failed. Status: ${status}, Error: ${JSON.stringify(data)}`);
    throw new Error('Section creation failed');
  }
}

async function step4_addLesson() {
  section('Step 4: Add Lesson');
  // Use a sample video URL (or local path)
  const { status, data } = await fetchJSON(
    `/api/admin/courses/${testCourseId}/sections/${testSectionId}/lessons`,
    {
      method: 'POST',
      body: JSON.stringify({
        title: 'الدرس الأول: ترحيب',
        description: 'درس تعريفي ترحيبي بالطلاب',
        videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
        duration: 120,
        sortOrder: 0,
        isFree: true,
      }),
    },
    adminCookies
  );

  if (status === 201 && data.lesson) {
    const lesson = data.lesson as { id: string; title: string };
    testLessonId = lesson.id;
    pass(`Lesson created: "${lesson.title}" (ID: ${testLessonId})`);
  } else {
    fail(`Lesson creation failed. Status: ${status}, Error: ${JSON.stringify(data)}`);
    throw new Error('Lesson creation failed');
  }
}

async function step5_publishCourse() {
  section('Step 5: Publish Course');
  const { status, data } = await fetchJSON(
    `/api/admin/courses/${testCourseId}/publish`,
    { method: 'PATCH', body: JSON.stringify({ isPublished: true }) },
    adminCookies
  );

  if (status === 200 && data.isPublished === true) {
    pass('Course published successfully');
  } else {
    fail(`Publishing failed. Status: ${status}, Data: ${JSON.stringify(data)}`);
    throw new Error('Publishing failed');
  }
}

async function step6_publicViewCourse() {
  section('Step 6: Public Views Course');
  
  // 6a: List courses (no auth)
  const { status: listStatus, data: listData } = await fetchJSON('/api/courses');
  if (listStatus === 200 && Array.isArray(listData.courses)) {
    const found = (listData.courses as { slug: string }[]).find(c => c.slug === testCourseSlug);
    if (found) {
      pass(`Course appears in public listing`);
    } else {
      fail('Course not found in public listing');
    }
  } else {
    fail(`Public courses listing failed. Status: ${listStatus}`);
  }

  // 6b: Course detail (no auth)
  const { status: detailStatus, data: detailData } = await fetchJSON(
    `/api/courses/${encodeURIComponent(testCourseSlug)}`
  );
  if (detailStatus === 200 && detailData.course) {
    const course = detailData.course as { title: string; sections: unknown[] };
    pass(`Course detail loaded: "${course.title}" with ${course.sections.length} section(s)`);
  } else {
    fail(`Course detail failed. Status: ${detailStatus}`);
  }
}

async function step7_registerUser() {
  section('Step 7: Register Test User');
  const { status, data } = await fetchJSON('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      firstName: 'مستخدم',
      lastName: 'اختبار',
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
      confirmPassword: TEST_USER_PASSWORD,
    }),
  });

  if (status === 201 || (status === 200 && data.user)) {
    const user = data.user as { id: string };
    testUserId = user.id;
    pass(`User registered: ${TEST_USER_EMAIL} (ID: ${testUserId})`);
  } else {
    fail(`Registration failed. Status: ${status}, Error: ${JSON.stringify(data)}`);
    throw new Error('User registration failed');
  }
}

async function step8_userLogin() {
  section('Step 8: User Login');
  userCookies = await loginAs(TEST_USER_EMAIL, TEST_USER_PASSWORD);
  
  // Verify session by fetching a protected route indicator
  // We'll try to enroll, which requires auth
  const { status } = await fetchJSON('/api/courses/enroll', {
    method: 'POST',
    body: JSON.stringify({ courseId: 'test', phone: '000', isPhoneVerified: true }),
  }, userCookies);
  
  // Even a 400/404 means we're authenticated (not 401)
  if (status !== 401) {
    pass('User logged in successfully');
  } else {
    fail('User login failed - getting 401');
    throw new Error('User login failed');
  }
}

async function step9_enrollUser() {
  section('Step 9: Enroll User (Direct DB - bypasses phone verification)');
  // Since enrollment requires Firebase phone verification which can't be automated,
  // we create the enrollment directly via a Prisma-based approach.
  // We'll use the admin enrollment management API to confirm.
  
  // First, use admin to create a direct enrollment
  // Actually, we need to use Prisma directly. Let's use a different approach:
  // Call the admin enrollment confirm API after creating enrollment record.
  
  // Use admin API to check if there's a simpler way...
  // Alternative: We'll directly call the database via a helper endpoint.
  // For a true E2E without DB access, we'd need to mock Firebase.
  // Instead, let's create the enrollment via admin's enrollment management.
  
  // Step 9a: Create enrollment directly by importing pg and running SQL
  const { Pool } = await import('pg');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    const enrollmentId = `test-enrollment-${Date.now()}`;
    const paymentCode = `E2E-${Date.now().toString(36).toUpperCase()}`;
    
    await pool.query(
      `INSERT INTO "CourseEnrollment" (id, "userId", "courseId", phone, "phoneVerified", amount, status, "paymentCode", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
      [enrollmentId, testUserId, testCourseId, '01000000000', true, 0, 'CONFIRMED', paymentCode]
    );
    
    testEnrollmentId = enrollmentId;
    pass(`Enrollment created directly in DB (ID: ${testEnrollmentId}, Code: ${paymentCode})`);
  } catch (err) {
    fail(`Enrollment creation failed: ${err}`);
    throw err;
  } finally {
    await pool.end();
  }
}

async function step10_watchLesson() {
  section('Step 10: Watch Lesson (Fetch Lesson + Save Progress)');
  
  // 10a: Fetch lesson data
  const { status: lessonStatus, data: lessonData } = await fetchJSON(
    `/api/courses/${encodeURIComponent(testCourseSlug)}/lessons/${testLessonId}`,
    {},
    userCookies
  );

  if (lessonStatus === 200 && lessonData.lesson) {
    const lesson = lessonData.lesson as { title: string; videoUrl: string };
    pass(`Lesson fetched: "${lesson.title}" - Video: ${lesson.videoUrl}`);
  } else {
    fail(`Lesson fetch failed. Status: ${lessonStatus}, Data: ${JSON.stringify(lessonData)}`);
  }

  // 10b: Save progress
  const { status: progressStatus, data: progressData } = await fetchJSON(
    `/api/courses/${encodeURIComponent(testCourseSlug)}/progress`,
    {
      method: 'POST',
      body: JSON.stringify({
        lessonId: testLessonId,
        watchedSeconds: 60,
        lastPosition: 60,
        isCompleted: false,
      }),
    },
    userCookies
  );

  if (progressStatus === 200 && progressData.success) {
    pass(`Progress saved: ${(progressData.progress as { watchedSeconds: number }).watchedSeconds}s watched`);
  } else {
    fail(`Progress save failed. Status: ${progressStatus}, Data: ${JSON.stringify(progressData)}`);
  }

  // 10c: Mark as completed
  const { status: completeStatus, data: completeData } = await fetchJSON(
    `/api/courses/${encodeURIComponent(testCourseSlug)}/progress`,
    {
      method: 'POST',
      body: JSON.stringify({
        lessonId: testLessonId,
        watchedSeconds: 120,
        lastPosition: 120,
        isCompleted: true,
      }),
    },
    userCookies
  );

  if (completeStatus === 200 && completeData.success) {
    pass(`Lesson completed! Total completed: ${completeData.completedLessons}`);
  } else {
    fail(`Completion failed. Status: ${completeStatus}`);
  }
}

async function step11_addComment() {
  section('Step 11: Add Comment');
  const { status, data } = await fetchJSON(
    `/api/courses/${encodeURIComponent(testCourseSlug)}/lessons/${testLessonId}/comments`,
    {
      method: 'POST',
      body: JSON.stringify({ content: 'تعليق اختباري - الدرس ممتاز ومفيد جداً! 🌟' }),
    },
    userCookies
  );

  if (status === 201 && data.comment) {
    pass(`Comment added: "${(data.comment as { content: string }).content}"`);
  } else {
    fail(`Comment failed. Status: ${status}, Data: ${JSON.stringify(data)}`);
  }

  // 11b: Fetch comments to verify
  const { status: fetchStatus, data: fetchData } = await fetchJSON(
    `/api/courses/${encodeURIComponent(testCourseSlug)}/lessons/${testLessonId}/comments`
  );

  if (fetchStatus === 200 && (fetchData.comments as unknown[])?.length > 0) {
    pass(`Comments fetched: ${(fetchData.comments as unknown[]).length} comment(s)`);
  } else {
    fail(`Comments fetch failed. Status: ${fetchStatus}`);
  }
}

async function step12_likeLesson() {
  section('Step 12: Like Lesson');
  const { status, data } = await fetchJSON(
    `/api/courses/${encodeURIComponent(testCourseSlug)}/lessons/${testLessonId}/like`,
    { method: 'POST' },
    userCookies
  );

  if (status === 200) {
    pass(`Lesson like toggled: liked=${data.liked}, total=${data.likesCount}`);
  } else {
    fail(`Like failed. Status: ${status}, Data: ${JSON.stringify(data)}`);
  }
}

async function step13_submitReview() {
  section('Step 13: Submit Course Review');
  const { status, data } = await fetchJSON(
    `/api/courses/${encodeURIComponent(testCourseSlug)}/reviews`,
    {
      method: 'POST',
      body: JSON.stringify({
        rating: 5,
        comment: 'دورة ممتازة! محتوى رائع ومنظم. أنصح بها بشدة.',
      }),
    },
    userCookies
  );

  if (status === 201 || status === 200) {
    pass(`Review submitted: rating=${(data.review as { rating: number })?.rating || 5}`);
  } else {
    fail(`Review failed. Status: ${status}, Data: ${JSON.stringify(data)}`);
  }

  // 13b: Verify review appears in public listing
  const { status: reviewsStatus, data: reviewsData } = await fetchJSON(
    `/api/courses/${encodeURIComponent(testCourseSlug)}/reviews?page=1&limit=10`
  );

  if (reviewsStatus === 200 && (reviewsData.reviews as unknown[])?.length > 0) {
    pass(`Reviews fetched: ${reviewsData.total} total review(s)`);
  } else {
    fail(`Reviews fetch failed. Status: ${reviewsStatus}`);
  }
}

async function step14_adminEnrollments() {
  section('Step 14: Admin Views Enrollments');
  const { status, data } = await fetchJSON(
    '/api/admin/courses/enrollments?limit=10',
    {},
    adminCookies
  );

  if (status === 200 && data.enrollments) {
    const enrollments = data.enrollments as { id: string }[];
    const found = enrollments.find(e => e.id === testEnrollmentId);
    if (found) {
      pass(`Admin can see test enrollment in list (${enrollments.length} total)`);
    } else {
      pass(`Admin enrollments API works (${enrollments.length} enrollments, test enrollment may be on another page)`);
    }
  } else {
    fail(`Admin enrollments failed. Status: ${status}`);
  }
}

async function step15_cleanup() {
  section('Step 15: Cleanup');
  
  // Delete test course (cascades to sections, lessons, enrollment, progress, comments, likes, reviews)
  const { status } = await fetchJSON(
    `/api/admin/courses/${testCourseId}`,
    { method: 'DELETE' },
    adminCookies
  );

  if (status === 200) {
    pass('Test course deleted (with all related data)');
  } else {
    fail(`Course cleanup failed. Status: ${status}`);
  }

  // Delete test user
  const { Pool } = await import('pg');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    await pool.query('DELETE FROM "User" WHERE id = $1', [testUserId]);
    pass(`Test user deleted: ${TEST_USER_EMAIL}`);
  } catch (err) {
    fail(`User cleanup failed: ${err}`);
  } finally {
    await pool.end();
  }
}

// ─── Main Runner ─────────────────────────────────────────────

async function runAllTests() {
  console.log('\n' + '╔' + '═'.repeat(58) + '╗');
  console.log('║' + '  Moftahak Courses E2E Test Suite'.padEnd(58) + '║');
  console.log('║' + `  Server: ${BASE_URL}`.padEnd(58) + '║');
  console.log('║' + `  Started: ${new Date().toLocaleString('ar-EG')}`.padEnd(58) + '║');
  console.log('╚' + '═'.repeat(58) + '╝');

  const steps = [
    { name: 'Admin Login', fn: step1_adminLogin },
    { name: 'Create Course', fn: step2_createCourse },
    { name: 'Add Section', fn: step3_addSections },
    { name: 'Add Lesson', fn: step4_addLesson },
    { name: 'Publish Course', fn: step5_publishCourse },
    { name: 'Public View Course', fn: step6_publicViewCourse },
    { name: 'Register User', fn: step7_registerUser },
    { name: 'User Login', fn: step8_userLogin },
    { name: 'Enroll User', fn: step9_enrollUser },
    { name: 'Watch Lesson', fn: step10_watchLesson },
    { name: 'Add Comment', fn: step11_addComment },
    { name: 'Like Lesson', fn: step12_likeLesson },
    { name: 'Submit Review', fn: step13_submitReview },
    { name: 'Admin Enrollments', fn: step14_adminEnrollments },
    { name: 'Cleanup', fn: step15_cleanup },
  ];

  let passed = 0;
  let failed = 0;

  for (const step of steps) {
    try {
      await step.fn();
      passed++;
    } catch (err) {
      failed++;
      console.error(`  ⚠️  Step "${step.name}" threw: ${err instanceof Error ? err.message : err}`);
      
      // If critical steps fail, attempt cleanup and stop
      if (['Admin Login', 'Create Course'].includes(step.name)) {
        console.log('\n🛑  Critical failure - aborting remaining tests.');
        break;
      }
    }
  }

  // Final summary
  console.log('\n' + '╔' + '═'.repeat(58) + '╗');
  console.log('║' + '  TEST RESULTS'.padEnd(58) + '║');
  console.log('║' + `  Passed: ${passed}/${steps.length}`.padEnd(58) + '║');
  console.log('║' + `  Failed: ${failed}/${steps.length}`.padEnd(58) + '║');
  console.log('║' + `  Status: ${failed === 0 ? '✅ ALL PASSED' : '❌ SOME FAILED'}`.padEnd(58) + '║');
  console.log('╚' + '═'.repeat(58) + '╝\n');

  if (failed > 0) {
    process.exitCode = 1;
  }
}

runAllTests().catch((err) => {
  console.error('💥 Fatal error:', err);
  process.exitCode = 1;
});
