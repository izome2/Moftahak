# خطة تنفيذ نظام الدورات التدريبية - مفتاحك
# Moftahak Courses System - Implementation Plan

> **التاريخ**: مارس 2026  
> **المشروع**: نظام الدورات التدريبية (Video Courses Platform)  
> **المنصة**: Next.js 16 + Prisma + PostgreSQL  
> **التصميم المرجعي**: `course-taking-v2.blade.php` (مع تكييف الألوان)

---

## الفهرس

- [نظرة عامة](#نظرة-عامة)
- [المرحلة 1: قاعدة البيانات والنماذج](#المرحلة-1-قاعدة-البيانات-والنماذج)
- [المرحلة 2: لوحة تحكم الأدمن - إدارة الدورات](#المرحلة-2-لوحة-تحكم-الأدمن---إدارة-الدورات)
- [المرحلة 3: واجهة المستخدم العامة - عرض الدورات](#المرحلة-3-واجهة-المستخدم-العامة---عرض-الدورات)
- [المرحلة 4: نظام الاشتراك والدفع عبر واتساب](#المرحلة-4-نظام-الاشتراك-والدفع-عبر-واتساب)
- [المرحلة 5: صفحة مشاهدة الدورة (مشغل الفيديو)](#المرحلة-5-صفحة-مشاهدة-الدورة-مشغل-الفيديو)
- [المرحلة 6: نظام التعليقات والتفاعل](#المرحلة-6-نظام-التعليقات-والتفاعل)
- [المرحلة 7: لوحة تحكم الأدمن - إدارة الطلبات](#المرحلة-7-لوحة-تحكم-الأدمن---إدارة-الطلبات)
- [المرحلة 8: التكامل مع النافبار وقسم الخدمات](#المرحلة-8-التكامل-مع-النافبار-وقسم-الخدمات)
- [المرحلة 9: الترجمة والتعريب](#المرحلة-9-الترجمة-والتعريب)
- [المرحلة 10: الأمان والأداء والاختبار](#المرحلة-10-الأمان-والأداء-والاختبار)
- [هيكل الملفات النهائي](#هيكل-الملفات-النهائي)
- [ملاحظات تقنية مهمة](#ملاحظات-تقنية-مهمة)

---

## نظرة عامة

### الهدف
إنشاء نظام دورات تدريبية متكامل داخل منصة مفتاحك يسمح بـ:
- رفع وإدارة دورات فيديو من لوحة الأدمن
- عرض الدورات للزوار في قسم الخدمات
- اشتراك المستخدمين عبر الواتساب (نفس نظام دراسة الجدوى)
- مشاهدة الدورات بمشغل فيديو مخصص احترافي
- التعليق والتفاعل مع المحتوى

### التصميم المرجعي
- الألوان: نظام ألوان مفتاحك (ذهبي `#edbf8c` + أخضر داكن `#10302b` + بيج `#ead3b9`)
- التأثيرات: Framer Motion + scroll animations (نفس أسلوب الموقع)
- التخطيط: مستوحى من `course-taking-v2.blade.php` مع تكييف كامل للألوان والخطوط

### نظام الدفع
- **نفس آلية دراسة الجدوى بالضبط**:
  1. المستخدم يملأ نموذج الاشتراك
  2. يتم توليد رمز دفع فريد (6 أحرف)
  3. التحويل التلقائي للواتساب مع رسالة مُعبأة مسبقاً
  4. الأدمن يؤكد الدفع من لوحة التحكم

---

## المرحلة 1: قاعدة البيانات والنماذج

### 1.1 إضافة نماذج Prisma الجديدة

**الملف**: `prisma/schema.prisma`

```prisma
// =============================================
// نظام الدورات التدريبية
// =============================================

model Course {
  id            String         @id @default(cuid())
  title         String                            // اسم الدورة
  slug          String         @unique             // رابط URL فريد
  description   String         @db.Text            // وصف تفصيلي
  shortDescription String?                         // وصف مختصر للبطاقة
  price         Float                              // السعر بالجنيه
  currency      String         @default("EGP")
  thumbnailUrl  String?                            // صورة غلاف الدورة
  previewVideoUrl String?                          // فيديو تعريفي/trailer
  features      Json?                              // قائمة مميزات الدورة
  level         CourseLevel    @default(BEGINNER)   // مستوى الدورة
  isPublished   Boolean        @default(false)     // منشورة أو مسودة
  sortOrder     Int            @default(0)         // ترتيب العرض
  
  // إحصائيات
  totalDuration Int            @default(0)         // إجمالي المدة بالثواني
  lessonsCount  Int            @default(0)         // عدد الدروس
  
  // العلاقات
  sections      CourseSection[]
  enrollments   CourseEnrollment[]
  reviews       CourseReview[]
  
  // Admin creator
  adminId       String
  admin         User           @relation("AdminCourses", fields: [adminId], references: [id])
  
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
}

enum CourseLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
}

model CourseSection {
  id          String        @id @default(cuid())
  title       String                               // عنوان القسم (مثلاً: "مقدمة", "أساسيات الإيجار")
  sortOrder   Int           @default(0)            // ترتيب القسم
  
  courseId     String
  course      Course        @relation(fields: [courseId], references: [id], onDelete: Cascade)
  
  lessons     CourseLesson[]
  
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

model CourseLesson {
  id            String         @id @default(cuid())
  title         String                              // عنوان الدرس
  description   String?                             // وصف اختياري
  videoUrl      String                              // رابط الفيديو (Vercel Blob أو رابط خارجي)
  duration      Int            @default(0)          // المدة بالثواني
  sortOrder     Int            @default(0)          // ترتيب الدرس داخل القسم
  isFree        Boolean        @default(false)      // درس مجاني (معاينة)
  
  sectionId     String
  section       CourseSection  @relation(fields: [sectionId], references: [id], onDelete: Cascade)
  
  // التقدم والتعليقات
  progress      LessonProgress[]
  comments      LessonComment[]
  likes         LessonLike[]
  
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
}

model CourseEnrollment {
  id            String                @id @default(cuid())
  status        EnrollmentStatus      @default(PENDING)
  paymentCode   String                @unique          // رمز الدفع (6 أحرف)
  
  userId        String
  user          User                  @relation("UserEnrollments", fields: [userId], references: [id])
  
  courseId       String
  course        Course                @relation(fields: [courseId], references: [id])
  
  // بيانات الدفع
  phone         String                                 // رقم الهاتف
  phoneVerified Boolean               @default(false)
  amount        Float                                  // المبلغ المدفوع
  
  // تتبع التقدم
  completedLessons Int               @default(0)
  lastAccessedAt   DateTime?
  completedAt      DateTime?
  
  createdAt     DateTime              @default(now())
  updatedAt     DateTime              @updatedAt

  @@unique([userId, courseId])  // مستخدم واحد = اشتراك واحد لكل دورة
}

enum EnrollmentStatus {
  PENDING       // في انتظار تأكيد الدفع
  CONFIRMED     // تم التأكيد - نشط
  EXPIRED       // منتهي الصلاحية
  REFUNDED      // مسترد
}

model LessonProgress {
  id            String        @id @default(cuid())
  watchedSeconds Int          @default(0)          // الثواني المشاهدة
  isCompleted   Boolean       @default(false)      // هل أكمل الدرس؟
  lastPosition  Int           @default(0)          // آخر موضع للمتابعة
  
  userId        String
  user          User          @relation("UserProgress", fields: [userId], references: [id])
  
  lessonId      String
  lesson        CourseLesson  @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@unique([userId, lessonId])
}

model LessonComment {
  id          String          @id @default(cuid())
  content     String          @db.Text
  
  userId      String
  user        User            @relation("UserComments", fields: [userId], references: [id])
  
  lessonId    String
  lesson      CourseLesson    @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  
  // للردود
  parentId    String?
  parent      LessonComment?  @relation("CommentReplies", fields: [parentId], references: [id], onDelete: Cascade)
  replies     LessonComment[] @relation("CommentReplies")
  
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
}

model LessonLike {
  id        String        @id @default(cuid())
  
  userId    String
  user      User          @relation("UserLikes", fields: [userId], references: [id])
  
  lessonId  String
  lesson    CourseLesson  @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  
  createdAt DateTime      @default(now())

  @@unique([userId, lessonId])  // لايك واحد لكل مستخدم لكل درس
}

model CourseReview {
  id        String   @id @default(cuid())
  rating    Int                            // 1-5 نجوم
  comment   String?  @db.Text             // تعليق اختياري
  
  userId    String
  user      User     @relation("UserReviews", fields: [userId], references: [id])
  
  courseId   String
  course    Course   @relation(fields: [courseId], references: [id], onDelete: Cascade)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, courseId])  // تقييم واحد لكل مستخدم لكل دورة
}
```

### 1.2 تحديث نموذج User

إضافة العلاقات الجديدة إلى نموذج `User` الحالي:

```prisma
model User {
  // ... الحقول الحالية ...
  
  // علاقات الدورات (جديدة)
  enrollments    CourseEnrollment[]  @relation("UserEnrollments")
  lessonProgress LessonProgress[]   @relation("UserProgress")
  comments       LessonComment[]    @relation("UserComments")
  likes          LessonLike[]       @relation("UserLikes")
  reviews        CourseReview[]     @relation("UserReviews")
  adminCourses   Course[]           @relation("AdminCourses")
}
```

### 1.3 تنفيذ الهجرة

```bash
npx prisma migrate dev --name add_courses_system
```

### المخرجات المتوقعة
- [x] 7 جداول جديدة في قاعدة البيانات
- [x] علاقات User محدثة
- [x] Enums جديدة (CourseLevel, EnrollmentStatus)
- [x] هجرة ناجحة

---

## المرحلة 2: لوحة تحكم الأدمن - إدارة الدورات

### 2.1 إضافة رابط الدورات في الـ Sidebar

**الملف**: `components/admin/Sidebar.tsx`

إضافة عنصر جديد في `menuItems`:
```typescript
{ icon: PlayCircle, label: 'الدورات التدريبية', href: '/admin/courses' },
```

يوضع بعد `Feasibility Studies` وقبل `Consultation Requests`.

### 2.2 صفحة قائمة الدورات (Admin)

**الملف**: `app/admin/courses/page.tsx`

**المحتوى:**
- شريط علوي: عنوان "الدورات التدريبية" + زر "إنشاء دورة جديدة"
- شريط بحث وفلترة (بالاسم، الحالة: مسودة/منشورة)
- قائمة بطاقات الدورات (كارد لكل دورة):
  - صورة الغلاف (أو placeholder افتراضي)
  - اسم الدورة
  - السعر
  - عدد الدروس | المدة الإجمالية
  - عدد المشتركين
  - متوسط التقييم
  - الحالة (مسودة / منشورة) - badge
  - أزرار: تعديل | حذف | معاينة | نشر/إلغاء نشر
- حالة فارغة إذا لم تكن هناك دورات

### 2.3 صفحة إنشاء / تعديل دورة

**الملف**: `app/admin/courses/new/page.tsx`  
**الملف**: `app/admin/courses/[id]/edit/page.tsx`  

**نفس المكون يُستخدم للإنشاء والتعديل** (`components/admin/courses/CourseEditor.tsx`)

**خطوات الإنشاء (واجهة واحدة مُقسّمة):**

#### القسم 1: المعلومات الأساسية
- **اسم الدورة** (حقل نصي - مطلوب)
- **الوصف المختصر** (حقل نصي - للعرض في البطاقة)
- **الوصف التفصيلي** (textarea كبير)
- **السعر** (رقمي بالجنيه المصري)
- **المستوى** (مبتدئ / متوسط / متقدم)
- **المميزات** (قائمة ديناميكية - إضافة/حذف عناصر)
- **صورة الغلاف** (رفع صورة مع معاينة مباشرة)
- **فيديو تعريفي** (رفع فيديو أو رابط YouTube - اختياري)

#### القسم 2: محتوى الدورة (الفيديوهات)
- **إضافة قسم** (Section) - زر يضيف قسم جديد بعنوان
- داخل كل قسم:
  - عنوان القسم (قابل للتعديل)
  - **رفع فيديو/فيديوهات** مع:
    - شريط تقدم الرفع (percentage bar) لكل ملف
    - رفع ملف فردي أو متعدد
    - سحب وإفلات (Drag & Drop zone)
    - إمكانية إعادة الترتيب بالسحب (@dnd-kit)
  - لكل درس:
    - اسم الدرس (يؤخذ تلقائياً من اسم الملف ويمكن تعديله)
    - وصف اختياري
    - علامة "درس مجاني" (toggle) - للمعاينة بدون اشتراك

#### القسم 3: الحفظ والنشر
- زر **حفظ كمسودة** (يحفظ بدون نشر)
- زر **نشر الدورة** (يحفظ وينشر مباشرة)
- حالة الحفظ مرئية (جاري الحفظ... / تم الحفظ)

### 2.4 مكونات صفحة الإنشاء (مُقسّمة لملفات)

```
components/admin/courses/
├── CourseEditor.tsx              // المكون الرئيسي - يجمع كل شيء
├── CourseBasicInfo.tsx           // القسم 1: المعلومات الأساسية
├── CourseFeaturesEditor.tsx     // محرر قائمة المميزات
├── CourseMediaUpload.tsx        // رفع الصورة والفيديو التعريفي
├── CourseSectionsEditor.tsx     // القسم 2: إدارة الأقسام والدروس
├── SectionItem.tsx              // عنصر قسم واحد مع الدروس بداخله
├── LessonItem.tsx               // عنصر درس واحد (اسم، وصف، مدة، مجاني)
├── VideoUploadZone.tsx          // منطقة رفع الفيديو مع شريط التقدم
├── CourseCard.tsx               // بطاقة الدورة في القائمة
└── index.ts                     // Barrel exports
```

### 2.5 API Routes للأدمن

```
app/api/admin/courses/
├── route.ts                     // GET (قائمة) + POST (إنشاء)
├── [id]/
│   ├── route.ts                 // GET + PATCH + DELETE
│   └── publish/
│       └── route.ts             // POST (نشر/إلغاء نشر)
├── [id]/sections/
│   ├── route.ts                 // POST (إضافة قسم)
│   └── [sectionId]/
│       ├── route.ts             // PATCH + DELETE
│       └── lessons/
│           ├── route.ts         // POST (إضافة درس)
│           └── [lessonId]/
│               └── route.ts     // PATCH + DELETE
└── upload/
    └── route.ts                 // POST (رفع فيديو إلى Vercel Blob)
```

### 2.6 رفع الفيديوهات

- استخدام **Vercel Blob** (نفس آلية رفع الصور الحالية في الموقع)
- حد أقصى لحجم الملف: **500MB** لكل فيديو
- الصيغ المدعومة: MP4, MOV, WEBM, AVI
- شريط تقدم مرئي أثناء الرفع باستخدام `XMLHttpRequest` مع `upload.onprogress`
- بعد اكتمال الرفع، يتم استخراج مدة الفيديو تلقائياً (client-side عبر `<video>` element)

### المخرجات المتوقعة
- [x] رابط الدورات في sidebar الأدمن
- [x] صفحة قائمة الدورات
- [x] صفحة إنشاء دورة كاملة مع رفع فيديوهات
- [x] صفحة تعديل دورة
- [x] API routes كاملة (CRUD)
- [x] رفع فيديو مع شريط تقدم

---

## المرحلة 3: واجهة المستخدم العامة - عرض الدورات

### 3.1 صفحة تفاصيل الدورة

**الملف**: `app/courses/[slug]/page.tsx`

صفحة عامة (لا تحتاج تسجيل دخول للعرض) تعرض:

#### التخطيط العلوي (Hero Section):
- صورة/فيديو تعريفي كبير (مع زر تشغيل إذا كان فيديو)
- اسم الدورة (عنوان كبير)
- وصف مختصر
- بادج المستوى (مبتدئ/متوسط/متقدم)
- تقييم بالنجوم + عدد المقيّمين
- عدد الطلاب المشتركين
- مدة الدورة الإجمالية
- عدد الدروس

#### القسم الرئيسي:
- **علامات تبويب** (Tabs):
  1. **نظرة عامة**: الوصف التفصيلي + قائمة المميزات (أيقونات + نصوص)
  2. **محتوى الدورة**: قائمة الأقسام والدروس (accordion) - تظهر المدة لكل درس + أيقونة قفل/مفتوح
  3. **التقييمات**: تقييمات ومراجعات الطلاب مع الأسماء والنجوم

#### الشريط الجانبي (Sticky):
- **بطاقة الاشتراك**:
  - السعر بخط كبير
  - زر "اشترك الآن" (للزوار وغير المشتركين)
  - أو زر "ادخل الدورة" (للمشتركين المؤكدين)
  - أو حالة "في انتظار التأكيد" (للمشتركين المعلقين)
  - معلومات مختصرة (المدة، المستوى، عدد الدروس)

### 3.2 الصورة/الفيديو الافتراضي

إذا لم يكن هناك صورة غلاف أو فيديو تعريفي:
- عرض تصميم افتراضي أنيق مع:
  - أيقونة كتاب/فيديو كبيرة
  - اسم الدورة بالوسط
  - خلفية بتدرج لوني من ألوان العلامة التجارية
  - باترن من `/public/patterns/`

### 3.3 مكونات صفحة التفاصيل

```
components/courses/
├── CourseDetailHero.tsx          // القسم العلوي (صورة/فيديو + معلومات)
├── CourseOverviewTab.tsx         // تاب نظرة عامة
├── CourseCurriculumTab.tsx      // تاب المحتوى (أقسام + دروس)
├── CourseReviewsTab.tsx         // تاب التقييمات
├── CourseEnrollCard.tsx         // بطاقة الاشتراك الجانبية
├── CourseDefaultThumbnail.tsx   // الصورة الافتراضية
├── CourseRatingStars.tsx        // مكون النجوم
├── CourseLevelBadge.tsx         // بادج المستوى
└── index.ts
```

### 3.4 API Routes العامة

```
app/api/courses/
├── route.ts                     // GET - قائمة الدورات المنشورة
├── [slug]/
│   ├── route.ts                 // GET - تفاصيل دورة محددة
│   └── reviews/
│       └── route.ts             // GET - تقييمات الدورة
```

### المخرجات المتوقعة
- [x] صفحة تفاصيل دورة احترافية
- [x] صورة/فيديو افتراضي أنيق
- [x] عرض التقييمات والمراجعات
- [x] بطاقة اشتراك ذكية (تتغير حسب حالة المستخدم)
- [x] API عام لجلب الدورات

---

## المرحلة 4: نظام الاشتراك والدفع عبر واتساب

### 4.1 صفحة طلب الاشتراك

**الملف**: `app/courses/[slug]/enroll/page.tsx`

**نفس تصميم وآلية `app/feasibility-request/page.tsx` تماماً** مع التعديلات:

#### الخطوات:
1. **عرض تفاصيل الدورة**: ملخص (اسم الدورة + السعر + المميزات)
2. **بيانات المستخدم**: 
   - إذا مسجل دخول → تعبئة تلقائية (الاسم + البريد)
   - إذا زائر → نموذج التسجيل/تسجيل الدخول أولاً
3. **التحقق من الهاتف**: Firebase OTP (نفس المكون `FirebasePhoneVerification`)
4. **شاشة النجاح**: رمز الدفع + التحويل للواتساب

#### رسالة الواتساب المُعبأة:
```
🎓 طلب اشتراك في دورة
━━━━━━━━━━━━━━━━
📌 الدورة: [اسم الدورة]
💰 المبلغ: [السعر] جنيه
🔑 رمز الدفع: [PAYMENT_CODE]
━━━━━━━━━━━━━━━━
⚠️ تنبيه: يرجى عدم تعديل هذه الرسالة
```

### 4.2 تسجيل الفاتورة

عند تأكيد الدفع من الأدمن:
- تحديث `CourseEnrollment.status` → `CONFIRMED`
- إنشاء سجل في **لوحة تحكم المستخدم** (profile)
- الفاتورة تظهر في:
  - صفحة الملف الشخصي للمستخدم (قسم "دوراتي")
  - لوحة تحكم الأدمن (سجل الطلبات)

### 4.3 مكونات الاشتراك

```
components/courses/enrollment/
├── EnrollmentForm.tsx           // النموذج الرئيسي
├── CourseSummaryCard.tsx        // ملخص الدورة قبل الدفع
├── EnrollmentSuccess.tsx        // شاشة النجاح مع رمز الدفع
└── index.ts
```

### 4.4 API Routes الاشتراك

```
app/api/courses/enroll/
└── route.ts                     // POST - إنشاء طلب اشتراك + توليد رمز دفع
```

**المنطق:**
1. التحقق من تسجيل الدخول (مطلوب)
2. التحقق من عدم وجود اشتراك سابق
3. التحقق من رقم الهاتف (Firebase)
4. توليد `paymentCode` فريد (نفس خوارزمية `generateUniquePaymentCode`)
5. إنشاء `CourseEnrollment` بحالة `PENDING`
6. إرجاع رمز الدفع

### المخرجات المتوقعة
- [x] صفحة اشتراك بنفس تصميم دراسة الجدوى
- [x] التحقق من الهاتف عبر Firebase
- [x] توليد رمز دفع فريد
- [x] تحويل تلقائي للواتساب
- [x] تسجيل الفاتورة

---

## المرحلة 5: صفحة مشاهدة الدورة (مشغل الفيديو)

### 5.1 الصفحة الرئيسية

**الملف**: `app/courses/[slug]/watch/page.tsx`

> **محمية**: تتطلب تسجيل دخول + اشتراك مؤكد (`CONFIRMED`)

### 5.2 التخطيط (مستوحى من course-taking-v2.blade.php)

```
┌────────────────────────────────────────────────────────┐
│  Navbar (شريط علوي مبسط - اسم الدورة + رجوع)          │
├──────────────────────────────┬─────────────────────────┤
│                              │                         │
│   مشغل الفيديو المخصص       │   قائمة الفيديوهات      │
│   (كبير - يأخذ 70%+)        │   (sidebar - 30%)       │
│                              │   ┌───────────────────┐ │
│   ┌──────────────────────┐   │   │ القسم 1           │ │
│   │                      │   │   │ ├─ الدرس 1 ✓     │ │
│   │    VIDEO PLAYER      │   │   │ ├─ الدرس 2 ▶     │ │
│   │                      │   │   │ └─ الدرس 3 🔒    │ │
│   └──────────────────────┘   │   │ القسم 2           │ │
│                              │   │ ├─ الدرس 4       │ │
│   اسم الفيديو الحالي        │   │ └─ الدرس 5       │ │
│                              │   └───────────────────┘ │
│   ─────────────────────      │                         │
│   💬 التعليقات               │   شريط التقدم          │
│   ├─ تعليق 1 (❤️ 5)         │   ██████░░░░ 60%       │
│   │  └─ رد 1               │                         │
│   └─ تعليق 2 (❤️ 2)         │                         │
│                              │                         │
├──────────────────────────────┴─────────────────────────┤
```

### 5.3 مشغل الفيديو المخصص

**الملف**: `components/courses/player/VideoPlayer.tsx`

**المميزات** (مستوحاة من التصميم المرجعي):
- **تشغيل/إيقاف** بالنقر على الفيديو أو زر Play
- **شريط التقدم** مع:
  - السحب للتقديم/الترجيع
  - عرض الوقت الحالي / الإجمالي
  - تلميح بالوقت عند التمرير (tooltip)
- **أزرار التحكم**:
  - تقديم/ترجيع 5 ثوانٍ (مع أنيميشن)
  - التحكم بالصوت (slider)
  - سرعة التشغيل (0.5x → 2x)
  - ملء الشاشة
  - كتم الصوت
- **اختصارات لوحة المفاتيح**:
  - Space → تشغيل/إيقاف
  - ← → تقديم/ترجيع 5 ثوانٍ
  - ↑↓ → رفع/خفض الصوت
  - F → ملء الشاشة
  - M → كتم الصوت
- **حفظ موضع المشاهدة** (يتذكر آخر نقطة توقف)
- **إخفاء أدوات التحكم** تلقائياً بعد 3 ثوانٍ من عدم الحركة
- **عرض اسم الفيديو** فوق المشغل أثناء التوقف
- **Responsive** - يتكيف مع جميع الشاشات
- **ألوان مفتاحك**:
  - شريط التقدم: `#edbf8c` (ذهبي)
  - خلفية الأدوات: تدرج شفاف
  - أزرار: أبيض مع ظل

### 5.4 قائمة الفيديوهات (Sidebar)

**الملف**: `components/courses/player/LessonsSidebar.tsx`

- **ظل خفيف** + **بوردر ريديوس** (rounded-2xl)
- أقسام قابلة للطي (accordion)
- كل درس يعرض:
  - أيقونة الحالة: ✓ مكتمل | ▶ قيد المشاهدة | ○ لم يُشاهد
  - اسم الدرس
  - المدة
- تمييز الدرس الحالي (خلفية ذهبية خفيفة)
- شريط تقدم إجمالي أسفل القائمة
- **قابلة للإخفاء** على الموبايل (زر toggle)

### 5.5 مكونات المشغل

```
components/courses/player/
├── VideoPlayer.tsx               // المشغل الرئيسي
├── PlayerControls.tsx            // أزرار التحكم السفلية
├── ProgressBar.tsx               // شريط التقدم
├── VolumeControl.tsx             // التحكم بالصوت
├── SpeedSelector.tsx             // سرعة التشغيل
├── LessonsSidebar.tsx            // قائمة الفيديوهات الجانبية
├── LessonItem.tsx                // عنصر درس في القائمة
├── WatchPageLayout.tsx           // تخطيط الصفحة الكامل
├── LessonTitle.tsx               // عنوان الدرس تحت الفيديو
└── index.ts
```

### 5.6 API Routes المشاهدة

```
app/api/courses/[slug]/
├── progress/
│   └── route.ts                 // POST - تحديث تقدم المشاهدة
├── lessons/[lessonId]/
│   └── route.ts                 // GET - جلب بيانات درس محدد
```

### المخرجات المتوقعة
- [x] مشغل فيديو مخصص بتصميم مفتاحك
- [x] قائمة فيديوهات جانبية (sidebar) مع ظل وبوردر
- [x] اسم الفيديو أسفل المشغل وداخله أثناء التوقف
- [x] حفظ موضع المشاهدة وتتبع التقدم
- [x] اختصارات لوحة المفاتيح
- [x] شريط تقدم إجمالي للدورة
- [x] تصميم متجاوب

---

## المرحلة 6: نظام التعليقات والتفاعل

### 6.1 قسم التعليقات

**الملف**: `components/courses/comments/CommentsSection.tsx`

يظهر أسفل مشغل الفيديو مباشرة:

#### المميزات:
- **إضافة تعليق**: حقل نصي + زر إرسال (يتطلب تسجيل دخول)
- **عرض التعليقات**: مرتبة بالأحدث أولاً
- **الرد على تعليق**: يُنشئ thread متداخل (مستوى واحد فقط)
- **زر أعجبني (❤️)**: لكل تعليق + عدد الإعجابات
- **صورة المستخدم + الاسم** بجانب كل تعليق
- **التاريخ النسبي** (منذ 5 دقائق، منذ يوم، إلخ)
- **تحميل المزيد** (pagination - 10 تعليقات في كل مرة)

### 6.2 نظام الإعجاب بالدرس

**الملف**: `components/courses/player/LessonLikeButton.tsx`

- زر قلب ❤️ بجانب اسم الفيديو
- عداد عدد الإعجابات
- أنيميشن عند النقر (scale + color change)
- Toggle: نقرة للإعجاب، نقرة أخرى لإلغاء الإعجاب

### 6.3 نظام التقييم

**الملف**: `components/courses/reviews/ReviewForm.tsx`

- يظهر في صفحة تفاصيل الدورة (ليس في صفحة المشاهدة)
- 5 نجوم قابلة للنقر
- حقل تعليق اختياري
- يمكن التعديل بعد الإرسال
- متاح فقط للمشتركين المؤكدين

### 6.4 مكونات التعليقات

```
components/courses/comments/
├── CommentsSection.tsx           // المكون الرئيسي
├── CommentItem.tsx              // تعليق واحد مع الردود
├── CommentForm.tsx              // نموذج إضافة تعليق
├── ReplyForm.tsx                // نموذج الرد
└── index.ts
```

### 6.5 API Routes التعليقات والتفاعل

```
app/api/courses/[slug]/lessons/[lessonId]/
├── comments/
│   ├── route.ts                 // GET (قائمة) + POST (إضافة)
│   └── [commentId]/
│       └── route.ts             // DELETE (حذف تعليقي)
├── like/
│   └── route.ts                 // POST (toggle like)
```

```
app/api/courses/[slug]/reviews/
└── route.ts                     // GET + POST + PATCH
```

### المخرجات المتوقعة
- [x] نظام تعليقات مع ردود متداخلة
- [x] زر إعجاب بالدرس
- [x] نظام تقييم الدورة بالنجوم
- [x] API routes كاملة للتفاعل

---

## المرحلة 7: لوحة تحكم الأدمن - إدارة الطلبات

### 7.1 صفحة سجل طلبات الاشتراك

**الملف**: `app/admin/courses/enrollments/page.tsx`

صفحة جديدة في لوحة تحكم الأدمن تعرض جميع طلبات الاشتراك.

**المحتوى:**
- **إحصائيات سريعة** (أعلى الصفحة):
  - إجمالي الطلبات
  - طلبات معلقة (PENDING)
  - طلبات مؤكدة (CONFIRMED)
  - إجمالي الإيرادات

- **جدول الطلبات**:
  | رمز الدفع | اسم الطالب | الدورة | المبلغ | الحالة | التاريخ | إجراءات |
  |-----------|-----------|-------|--------|--------|--------|---------|
  | ABC123    | أحمد      | ...   | 2,500  | 🟡 معلق | ...    | ✅ ❌    |
  
- **الإجراءات**:
  - **تأكيد الدفع** (PENDING → CONFIRMED): ينشّط اشتراك الطالب
  - **رفض** (PENDING → REJECTED): مع سبب اختياري
  - **استرداد** (CONFIRMED → REFUNDED)
  - **عرض التفاصيل**: معلومات الطالب + الهاتف + تاريخ الطلب + سجل التقدم

- **فلاتر**:
  - بالحالة (الكل / معلق / مؤكد / مسترد)
  - بالدورة
  - بحث بالاسم أو رمز الدفع

### 7.2 بطاقة الإحصائيات في Dashboard

**الملف**: تعديل `app/admin/page.tsx`

إضافة بطاقة جديدة في الـ Dashboard:
- **عدد الدورات** (أيقونة PlayCircle)
- **طلبات معلقة** (أيقونة Clock)
- **إجمالي إيرادات الدورات** (أيقونة DollarSign)

### 7.3 تحديث API الإحصائيات

**الملف**: تعديل `app/api/admin/stats/route.ts`

إضافة:
```typescript
coursesCount: await prisma.course.count(),
pendingEnrollments: await prisma.courseEnrollment.count({ where: { status: 'PENDING' } }),
totalCourseRevenue: await prisma.courseEnrollment.aggregate({
  where: { status: 'CONFIRMED' },
  _sum: { amount: true }
}),
```

### 7.4 API Routes إدارة الطلبات

```
app/api/admin/courses/enrollments/
├── route.ts                     // GET - قائمة الطلبات (مع فلاتر)
└── [id]/
    ├── route.ts                 // GET - تفاصيل طلب
    ├── confirm/
    │   └── route.ts             // POST - تأكيد الدفع
    ├── reject/
    │   └── route.ts             // POST - رفض الطلب
    └── refund/
        └── route.ts             // POST - استرداد
```

### 7.5 صفحة "دوراتي" في ملف المستخدم

**الملف**: تعديل `app/profile/page.tsx` أو إنشاء `app/profile/courses/page.tsx`

إضافة قسم جديد أو تاب في صفحة الملف الشخصي:
- قائمة الدورات المشترك فيها
- حالة كل اشتراك (معلق / نشط / منتهي)
- نسبة الإكمال لكل دورة
- زر "متابعة المشاهدة" لاستئناف من آخر نقطة
- الفواتير (رمز الدفع، التاريخ، المبلغ)

### المخرجات المتوقعة
- [x] صفحة إدارة طلبات الاشتراك كاملة
- [x] تأكيد/رفض/استرداد الطلبات
- [x] إحصائيات الدورات في لوحة التحكم
- [x] قسم "دوراتي" في الملف الشخصي

---

## المرحلة 8: التكامل مع النافبار وقسم الخدمات

### 8.1 إضافة زر الدورات في Navbar

**الملف**: `components/Navbar.tsx`

إضافة عنصر جديد في `navLinks`:
```typescript
{ label: t.nav.courses, href: '#services' },  // يسكرول إلى قسم الخدمات
```

يوضع بين "الخدمات" و "دراسة الجدوى" (أو بعد الخدمات مباشرة).

**السلوك**: عند النقر يقوم بـ smooth scroll إلى قسم الخدمات `#services` (نفس آلية الروابط الحالية).

### 8.2 إضافة بطاقة الدورات في ServicesSection

**الملف**: `components/ServicesSection.tsx`

إضافة بطاقة ثالثة (أو أكثر حسب الدورات المنشورة):

**بطاقة الدورة** تحتوي على:
- صورة الغلاف (أو الصورة الافتراضية)
- بادج "جديد" أو "الأكثر مبيعاً"
- اسم الدورة
- وصف مختصر
- السعر
- أيقونات المعلومات (عدد الدروس، المدة، المستوى)
- عدد المشتركين (avatars)
- متوسط التقييم بالنجوم
- زر **"عرض الدورة"** → ينقل إلى `/courses/[slug]`

**التصميم**: نفس أسلوب بطاقات دراسة الجدوى الحالية مع:
- تأثير 3D Tilt (نفس الكود الحالي)
- Framer Motion animations
- ألوان متسقة

### 8.3 جلب الدورات ديناميكياً

بدلاً من بيانات ثابتة، يتم جلب الدورات المنشورة من API:
```typescript
// في ServicesSection أو مكون منفصل
const courses = await fetch('/api/courses?published=true&limit=3');
```

أو عبر Server Component يجلب مباشرة من Prisma.

### المخرجات المتوقعة
- [x] زر "الدورات" في النافبار يسكرول للخدمات
- [x] بطاقة دورة احترافية في قسم الخدمات
- [x] جلب الدورات ديناميكياً
- [x] تناسق تصميمي كامل

---

## المرحلة 9: الترجمة والتعريب

### 9.1 إضافة مفاتيح الترجمة

**الملف**: `lib/translations.ts`

```typescript
// إضافات جديدة
courses: {
  title: 'الدورات التدريبية',
  subtitle: 'دورات متخصصة في إدارة العقارات والإيجار القصير',
  enrollNow: 'اشترك الآن',
  enterCourse: 'ادخل الدورة',
  pendingPayment: 'في انتظار تأكيد الدفع',
  lessons: 'درس',
  students: 'طالب',
  duration: 'المدة',
  level: 'المستوى',
  beginner: 'مبتدئ',
  intermediate: 'متوسط',
  advanced: 'متقدم',
  overview: 'نظرة عامة',
  curriculum: 'محتوى الدورة',
  reviews: 'التقييمات',
  features: 'مميزات الدورة',
  freeLesson: 'مجاني',
  completed: 'مكتمل',
  inProgress: 'قيد المشاهدة',
  locked: 'مقفل',
  writeComment: 'اكتب تعليقاً...',
  reply: 'رد',
  like: 'أعجبني',
  showMore: 'عرض المزيد',
  noComments: 'لا توجد تعليقات بعد',
  courseProgress: 'تقدم الدورة',
  continueLearning: 'متابعة المشاهدة',
  myCourses: 'دوراتي',
  
  // الاشتراك
  enrollment: {
    title: 'اشتراك في الدورة',
    courseSummary: 'ملخص الدورة',
    paymentCode: 'رمز الدفع',
    successMessage: 'تم إرسال طلب الاشتراك بنجاح!',
    whatsappRedirect: 'سيتم تحويلك للواتساب خلال',
    seconds: 'ثوانٍ',
  },
  
  // الأدمن
  admin: {
    createCourse: 'إنشاء دورة جديدة',
    editCourse: 'تعديل الدورة',
    courseName: 'اسم الدورة',
    coursePrice: 'سعر الدورة',
    courseDescription: 'وصف الدورة',
    uploadVideo: 'رفع فيديو',
    uploadVideos: 'رفع فيديوهات',
    dragDropHint: 'اسحب الملفات هنا أو انقر للاختيار',
    uploading: 'جاري الرفع...',
    uploadComplete: 'اكتمل الرفع',
    saveDraft: 'حفظ كمسودة',
    publish: 'نشر الدورة',
    unpublish: 'إلغاء النشر',
    addSection: 'إضافة قسم',
    sectionTitle: 'عنوان القسم',
    enrollments: 'طلبات الاشتراك',
    confirmPayment: 'تأكيد الدفع',
    rejectRequest: 'رفض الطلب',
    refund: 'استرداد',
    noEnrollments: 'لا توجد طلبات اشتراك',
  },
},

// تحديث nav
nav: {
  // ... الحالية ...
  courses: 'الدورات',
},
```

### 9.2 الترجمة الإنجليزية

نفس المفاتيح بالإنجليزية:
```typescript
courses: {
  title: 'Training Courses',
  subtitle: 'Specialized courses in property management and short-term rental',
  enrollNow: 'Enroll Now',
  enterCourse: 'Enter Course',
  // ... etc
}
```

### المخرجات المتوقعة
- [x] جميع النصوص مترجمة (عربي + إنجليزي)
- [x] استخدام `useTranslation()` في كل المكونات

---

## المرحلة 10: الأمان والأداء والاختبار

### 10.1 الأمان

#### حماية الـ Middleware
**الملف**: `middleware.ts`

إضافة حماية المسارات:
```typescript
// مسارات محمية
'/courses/*/watch'  → يتطلب تسجيل دخول + اشتراك مؤكد
'/api/courses/*/progress'     → يتطلب تسجيل دخول
'/api/courses/*/comments'     → يتطلب تسجيل دخول (POST)
'/api/courses/*/like'         → يتطلب تسجيل دخول
'/api/admin/courses/*'        → يتطلب ADMIN role
```

#### Rate Limiting
- `/api/courses/enroll`: 5 طلبات / 15 دقيقة (نفس دراسة الجدوى)
- `/api/courses/*/comments`: 20 تعليق / 10 دقائق
- `/api/courses/*/like`: 30 طلب / دقيقة

#### Security Headers
- تطبيق `addSecurityHeaders()` على جميع الـ API routes الجديدة

#### منع التحميل
- Blob URLs مع فترة صلاحية محدودة
- عدم كشف رابط الفيديو المباشر في الـ client
- التأكد من الاشتراك في كل طلب فيديو

### 10.2 الأداء

- **صور الغلاف**: تحسين عبر `next/image` (AVIF/WebP)
- **تحميل كسول**: الفيديو لا يُحمّل حتى النقر (poster image)
- **Pagination**: التعليقات والمراجعات (10 لكل صفحة)
- **Caching**: تخزين مؤقت لبيانات الدورة (ISR أو SWR)
- **Code Splitting**: كل صفحة مُنفصلة (dynamic imports)
- **الفيديو**: Adaptive streaming إن أمكن

### 10.3 Validation (Zod)

**الملف**: `lib/validations/courses.ts`

```typescript
// مخطط إنشاء دورة
export const createCourseSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10),
  price: z.number().positive(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  // ...
});

// مخطط طلب اشتراك
export const enrollCourseSchema = z.object({
  courseId: z.string(),
  phone: z.string().regex(/^\+?[0-9]{10,15}$/),
  isPhoneVerified: z.boolean().refine(v => v === true),
});

// مخطط تعليق
export const commentSchema = z.object({
  content: z.string().min(1).max(2000),
  parentId: z.string().optional(),
});

// مخطط تقييم
export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});
```

### المخرجات المتوقعة
- [x] حماية كاملة للمسارات
- [x] Rate limiting مناسب
- [x] Validation schemas
- [x] تحسينات الأداء
- [x] حماية الفيديو من التحميل

---

## هيكل الملفات النهائي

```
📁 المسارات (App Router)
app/
├── courses/
│   ├── page.tsx                         // (اختياري) صفحة قائمة كل الدورات
│   └── [slug]/
│       ├── page.tsx                      // صفحة تفاصيل الدورة
│       ├── enroll/
│       │   └── page.tsx                  // صفحة طلب الاشتراك
│       └── watch/
│           └── page.tsx                  // صفحة المشاهدة (محمية)
├── admin/
│   └── courses/
│       ├── page.tsx                      // قائمة الدورات (أدمن)
│       ├── new/
│       │   └── page.tsx                  // إنشاء دورة جديدة
│       ├── [id]/
│       │   └── edit/
│       │       └── page.tsx              // تعديل دورة
│       └── enrollments/
│           └── page.tsx                  // سجل طلبات الاشتراك
├── api/
│   ├── courses/
│   │   ├── route.ts                     // GET قائمة الدورات العامة
│   │   ├── enroll/
│   │   │   └── route.ts                 // POST طلب اشتراك
│   │   └── [slug]/
│   │       ├── route.ts                 // GET تفاصيل دورة
│   │       ├── progress/
│   │       │   └── route.ts             // POST تحديث التقدم
│   │       ├── reviews/
│   │       │   └── route.ts             // GET + POST التقييمات
│   │       └── lessons/
│   │           └── [lessonId]/
│   │               ├── route.ts         // GET بيانات درس
│   │               ├── comments/
│   │               │   ├── route.ts     // GET + POST
│   │               │   └── [commentId]/
│   │               │       └── route.ts // DELETE
│   │               └── like/
│   │                   └── route.ts     // POST toggle
│   └── admin/
│       └── courses/
│           ├── route.ts                 // GET + POST (أدمن)
│           ├── [id]/
│           │   ├── route.ts             // GET + PATCH + DELETE
│           │   ├── publish/
│           │   │   └── route.ts         // POST
│           │   ├── sections/
│           │   │   ├── route.ts         // POST
│           │   │   └── [sectionId]/
│           │   │       ├── route.ts     // PATCH + DELETE
│           │   │       └── lessons/
│           │   │           ├── route.ts // POST
│           │   │           └── [lessonId]/
│           │   │               └── route.ts // PATCH + DELETE
│           │   └── upload/
│           │       └── route.ts         // POST رفع فيديو
│           └── enrollments/
│               ├── route.ts             // GET قائمة الطلبات
│               └── [id]/
│                   ├── route.ts         // GET تفاصيل
│                   ├── confirm/
│                   │   └── route.ts     // POST تأكيد
│                   ├── reject/
│                   │   └── route.ts     // POST رفض
│                   └── refund/
│                       └── route.ts     // POST استرداد

📁 المكونات
components/courses/
├── CourseDetailHero.tsx
├── CourseOverviewTab.tsx
├── CourseCurriculumTab.tsx
├── CourseReviewsTab.tsx
├── CourseEnrollCard.tsx
├── CourseDefaultThumbnail.tsx
├── CourseRatingStars.tsx
├── CourseLevelBadge.tsx
├── CourseServiceCard.tsx                // بطاقة الدورة في قسم الخدمات
├── enrollment/
│   ├── EnrollmentForm.tsx
│   ├── CourseSummaryCard.tsx
│   ├── EnrollmentSuccess.tsx
│   └── index.ts
├── player/
│   ├── VideoPlayer.tsx
│   ├── PlayerControls.tsx
│   ├── ProgressBar.tsx
│   ├── VolumeControl.tsx
│   ├── SpeedSelector.tsx
│   ├── LessonsSidebar.tsx
│   ├── LessonItem.tsx
│   ├── WatchPageLayout.tsx
│   ├── LessonTitle.tsx
│   └── index.ts
├── comments/
│   ├── CommentsSection.tsx
│   ├── CommentItem.tsx
│   ├── CommentForm.tsx
│   ├── ReplyForm.tsx
│   └── index.ts
├── reviews/
│   ├── ReviewForm.tsx
│   └── index.ts
└── index.ts

components/admin/courses/
├── CourseEditor.tsx
├── CourseBasicInfo.tsx
├── CourseFeaturesEditor.tsx
├── CourseMediaUpload.tsx
├── CourseSectionsEditor.tsx
├── SectionItem.tsx
├── LessonItem.tsx
├── VideoUploadZone.tsx
├── CourseCard.tsx
└── index.ts

📁 المكتبات والأدوات
lib/
├── validations/
│   └── courses.ts                       // Zod schemas
├── courses/
│   └── utils.ts                         // دوال مساعدة (formatDuration, generateSlug, etc.)

📁 الأنواع
types/
└── courses.ts                           // TypeScript interfaces & types

📁 قاعدة البيانات
prisma/
├── schema.prisma                        // النماذج الجديدة
└── migrations/
    └── XXXXXX_add_courses_system/       // هجرة الدورات
```

---

## ملاحظات تقنية مهمة

### 1. رفع الفيديوهات
- **Vercel Blob** مناسب للملفات حتى ~500MB
- إذا كانت الفيديوهات أكبر، يمكن استخدام **chunked upload** لتقسيم الملف
- يُفضل ضغط الفيديو على جهاز الأدمن قبل الرفع
- الرفع يحدث مباشرة من المتصفح إلى Blob مع `onUploadProgress` callback

### 2. حماية محتوى الفيديو
- لا يتم كشف رابط Blob المباشر في HTML
- استخدام Signed URLs أو API proxy لتقديم الفيديو
- التأكد من الاشتراك في كل request للفيديو server-side
- منع Right-click + Developer Tools لا يمنع التحميل حقاً، لكن يُقلّل السهولة

### 3. تصميم الألوان (مستوحى من course-taking-v2.blade.php)
| العنصر في الملف المرجعي | اللون الأصلي | اللون الجديد (مفتاحك) |
|---|---|---|
| Primary gradient | `#667eea → #764ba2` | `#edbf8c → #d4a574` (ذهبي) |
| Background | `#ffffff` | `#fdf6ee` (أبيض بيج) |
| Sidebar | Dark | `#10302b` (أخضر داكن) |
| Progress bar | Blue | `#edbf8c` (ذهبي) |
| Active lesson | Blue highlight | `#edbf8c20` (ذهبي شفاف) |
| Buttons | Purple gradient | `#10302b` (أخضر داكن) |
| Hover states | Light purple | `#ead3b9` (بيج) |
| Card shadows | Gray | ظل ناعم بني خفيف |

### 4. الاعتمادات الجديدة المطلوبة
لا حاجة لمكتبات جديدة - كل شيء متاح:
- ✅ Framer Motion (موجود)
- ✅ @dnd-kit (موجود - للسحب والإفلات في ترتيب الفيديوهات)
- ✅ Lucide React (موجود - للأيقونات)
- ✅ @vercel/blob (موجود - لرفع الملفات)
- ✅ Zod (موجود - للتحقق)
- ✅ Firebase (موجود - للتحقق من الهاتف)

### 5. ترتيب التنفيذ الموصى به
```
المرحلة 1  → أسبوع 1    (قاعدة البيانات)
المرحلة 2  → أسبوع 1-2  (أدمن - إنشاء دورة)
المرحلة 8  → أسبوع 2    (النافبار + الخدمات)
المرحلة 3  → أسبوع 2-3  (صفحة التفاصيل)
المرحلة 4  → أسبوع 3    (الاشتراك + الدفع)
المرحلة 5  → أسبوع 3-4  (مشغل الفيديو)
المرحلة 6  → أسبوع 4    (التعليقات)
المرحلة 7  → أسبوع 4    (أدمن - الطلبات)
المرحلة 9  → أسبوع 5    (الترجمة)
المرحلة 10 → أسبوع 5    (الأمان + الاختبار)
```

### 6. الصفحة الافتراضية عند عدم وجود صورة
- تصميم مخصص بألوان مفتاحك
- SVG متحرك بخطوط هندسية
- اسم الدورة بخط Dubai عربي
- باترن من `/public/patterns/pattern-vertical-dark.png` كخلفية

### 7. مشغل الفيديو - نقاط حرجة
- **لا نستخدم** مكتبات مشغل جاهزة (video.js, plyr)
- مشغل **مخصص بالكامل** مبني بـ HTML5 `<video>` + React
- هذا يتيح تحكم كامل في التصميم والسلوك
- مستوحى من التصميم في `course-taking-v2.blade.php` مع:
  - نفس هيكل الأزرار والتحكمات
  - نفس أنيميشن التقديم/الترجيع
  - نفس نظام thumbnails في شريط التقدم (اختياري)
  - ألوان مفتاحك بدلاً من البنفسجي

### 8. إضافات مستقبلية (غير مطلوبة حالياً)
- شهادة إتمام الدورة (PDF قابل للتحميل)
- نظام كوبونات خصم
- بث مباشر (Live streaming)
- اختبارات وأسئلة بعد كل قسم
- نظام إشعارات (دورة جديدة، رد على تعليق)
- تحميل المحتوى offline (PWA)

---

## خلاصة المراحل

| # | المرحلة | الوصف | الحالة |
|---|---------|-------|--------|
| 1 | قاعدة البيانات | 7 جداول + migrations | ✅ مكتمل |
| 2 | أدمن - إدارة الدورات | CRUD + رفع فيديو | ✅ مكتمل |
| 3 | صفحة تفاصيل الدورة | عرض عام + مميزات + تقييمات | ✅ مكتمل |
| 4 | نظام الاشتراك | واتساب + رمز دفع | ✅ مكتمل |
| 5 | مشغل الفيديو | مشغل مخصص + sidebar + تقدم | ✅ مكتمل |
| 6 | التعليقات والتفاعل | تعليقات + ردود + لايك | ✅ مكتمل |
| 7 | أدمن - إدارة الطلبات | سجل + تأكيد + إحصائيات | ✅ مكتمل |
| 8 | النافبار + الخدمات | زر + بطاقة دورة | ✅ مكتمل |
| 9 | الترجمة | عربي + إنجليزي | ⬜ لم يبدأ |
| 10 | الأمان والأداء | middleware + rate limit + validation | ⬜ لم يبدأ |

---

> **ملاحظة**: هذه الخطة مصممة للتنفيذ التدريجي مرحلة بمرحلة. كل مرحلة مستقلة ويمكن اختبارها بشكل منفصل قبل الانتقال للمرحلة التالية.
