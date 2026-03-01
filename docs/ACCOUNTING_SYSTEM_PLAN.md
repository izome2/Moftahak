# خطة تنفيذ نظام الحسابات الشامل - مفتاحك 🏢

## نظرة عامة على المشروع

نظام حسابات متكامل لإدارة الشقق الفندقية يشمل: الحجوزات، المصروفات، الإيرادات، المتابعة اليومية، وحسابات المستثمرين. يُبنى داخل نفس تطبيق Next.js الحالي مع الحفاظ على هوية التصميم (الألوان الذهبية `#edbf8c` والأخضر الداكن `#10302b` والبيج `#ead3b9`).

---

## المبادئ الهندسية الأساسية (Engineering Principles) 🏗️

> هذه المبادئ مُطبقة عبر جميع مراحل التنفيذ ويجب الالتزام بها في كل سطر كود.

### 1. فلترة البيانات بالشهر دائماً (Monthly Scoping)
كل query تجلب بيانات مالية (حجوزات، مصروفات) **يجب أن تكون مُفلترة بالشهر**. لا نجلب كل البيانات دفعة واحدة أبداً:
```typescript
// ✅ صحيح - فلترة بالشهر
bookings: {
  where: {
    checkIn: { gte: startOfMonth, lt: endOfMonth },
    deletedAt: null, // Soft delete filter
  }
}

// ❌ خاطئ - يجلب كل البيانات
bookings: true
```

### 2. الحسابات على مستوى DB (Database-Level Aggregation)
بدل `.reduce()` في JavaScript، نستخدم `prisma.aggregate` و `prisma.groupBy`:
```typescript
// ✅ صحيح - حساب على مستوى DB
const revenue = await prisma.booking.aggregate({
  _sum: { amount: true },
  where: { apartmentId, checkIn: { gte: startOfMonth, lt: endOfMonth }, deletedAt: null }
});

// ❌ خاطئ - حساب في الذاكرة
const revenue = bookings.reduce((sum, b) => sum + b.amount, 0);
```
**لماذا؟** أسرع، أقل استهلاك للذاكرة، قابل للتوسع.

### 3. Soft Delete لكل البيانات المالية
لا نحذف أي سجل مالي فعلياً. نضيف `deletedAt` ونفلتر عليه:
```typescript
// الحذف = تحديث
await prisma.booking.update({
  where: { id },
  data: { deletedAt: new Date() }
});

// كل query تستثني المحذوف
where: { ...filters, deletedAt: null }
```
**لماذا؟** حماية البيانات المالية، audit trail، أمان قانوني.

### 4. حماية مزدوجة (Double-Layer Auth)
كل API route يتحقق من الصلاحيات **بشكل مستقل** حتى لو المسار محمي في middleware:
```typescript
// حتى لو middleware يحمي /api/accounting/*
// كل route يتحقق مرة أخرى:
if (!hasPermission(session?.user?.role, 'canAddExpenses')) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```
**لماذا؟** لا نعتمد على Frontend أو middleware وحده. Defense in depth.

### 5. MonthlySnapshot للتقارير السريعة
نحفظ ملخص شهري مُحسوب مسبقاً لتسريع التقارير 100x (تفاصيل في المرحلة 1.10).

---

## هيكل النظام (Architecture Overview)

```
┌──────────────────────────────────────────────────────────────────┐
│                        المدير العام (GENERAL_MANAGER)             │
│              صلاحيات كاملة - إدارة كل شيء                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │ مدير التشغيل │  │ مدير الحجوزات │  │      المستثمر          │  │
│  │ OPS_MANAGER  │  │ BOOKING_MGR   │  │     INVESTOR           │  │
│  ├─────────────┤  ├──────────────┤  ├────────────────────────┤  │
│  │• مصروفات    │  │• حجوزات جديدة│  │• عرض حساباته فقط      │  │
│  │• دخول/خروج  │  │• تعديل حجوزات│  │• ملخص أرباحه          │  │
│  │• تعيين مشرف │  │              │  │• مسحوباته              │  │
│  └──────┬──────┘  └──────┬───────┘  └────────────────────────┘  │
│         │                │                                       │
│         ▼                ▼                                       │
│  ┌──────────────────────────────────┐                           │
│  │       شيت الشقة الأساسي          │                           │
│  │  (إيرادات + مصروفات + أرباح)     │                           │
│  │  → جدول المستثمرين (تلقائي)      │                           │
│  └──────────────────────────────────┘                           │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────────────────────────┐                           │
│  │     شيت المشروع الكامل           │                           │
│  │  (ملخص جميع الشقق + إحصائيات)    │                           │
│  └──────────────────────────────────┘                           │
└──────────────────────────────────────────────────────────────────┘
```

---

## المرحلة 1: قاعدة البيانات (Database Schema) 🗄️

### 1.1 تحديث نظام الأدوار (Roles)

```prisma
enum Role {
  USER
  ADMIN
  GENERAL_MANAGER    // المدير العام
  OPS_MANAGER        // مدير التشغيل
  BOOKING_MANAGER    // مدير الحجوزات
  INVESTOR           // المستثمر
}
```

### 1.2 نموذج المشروع (Project)

```prisma
model Project {
  id          String   @id @default(cuid())
  name        String                          // اسم المشروع (مثلاً: المنيل)
  description String?
  apartments  Apartment[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### 1.3 نموذج الشقة (Apartment)

```prisma
model Apartment {
  id              String   @id @default(cuid())
  name            String                         // اسم الشقة (مثلاً: المنيل - الدور الخامس)
  floor           String?                        // رقم الدور
  type            String?                        // نوع الشقة (عادي / بانوراما)
  project         Project  @relation(fields: [projectId], references: [id])
  projectId       String
  
  // العلاقات
  bookings        Booking[]
  expenses        Expense[]
  investors       ApartmentInvestor[]
  
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### 1.4 نموذج الحجز (Booking)

```prisma
model Booking {
  id              String        @id @default(cuid())
  apartment       Apartment     @relation(fields: [apartmentId], references: [id])
  apartmentId     String
  
  // بيانات العميل
  clientName      String
  clientPhone     String?
  
  // تفاصيل الحجز
  checkIn         DateTime                    // تاريخ الدخول
  checkOut        DateTime                    // تاريخ الخروج
  nights          Int                         // عدد الليالي (محسوب)
  amount          Float                       // القيمة المالية للحجز
  currency        String       @default("USD")
  source          BookingSource               // مصدر الحجز
  
  // بيانات الوصول
  arrivalTime     String?                     // وقت الوصول للمطار
  flightNumber    String?                     // رقم الرحلة
  notes           String?                     // ملاحظات أخرى
  
  // المشرفين
  receptionSupervisor  String?               // مشرف الاستقبال
  deliverySupervisor   String?               // مشرف الاستلام (الخروج)
  
  // الحالة
  status          BookingStatus @default(CONFIRMED)
  
  // 🔒 Soft Delete - لا نحذف البيانات المالية فعلياً
  deletedAt       DateTime?                   // null = نشط، تاريخ = محذوف
  
  createdBy       User          @relation("BookingCreator", fields: [createdById], references: [id])
  createdById     String
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  // Index للأداء - فلترة بالشقة والشهر
  @@index([apartmentId, checkIn])
  @@index([apartmentId, checkOut])
  @@index([deletedAt])
}

enum BookingSource {
  AIRBNB
  EXTERNAL      // خارجي
  DIRECT        // مباشر
  BOOKING_COM
  OTHER
}

enum BookingStatus {
  CONFIRMED
  CHECKED_IN
  CHECKED_OUT
  CANCELLED
}
```

### 1.5 نموذج المصروفات (Expense)

```prisma
model Expense {
  id              String          @id @default(cuid())
  apartment       Apartment       @relation(fields: [apartmentId], references: [id])
  apartmentId     String
  
  description     String                       // الوصف
  category        ExpenseCategory              // القسم (نظافة، انترنت، مياه...)
  amount          Float                        // المبلغ
  currency        String          @default("USD")
  date            DateTime                     // تاريخ المصروف
  notes           String?
  
  // 🔒 Soft Delete
  deletedAt       DateTime?                   // null = نشط، تاريخ = محذوف
  
  createdBy       User            @relation("ExpenseCreator", fields: [createdById], references: [id])
  createdById     String
  
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  
  // Index للأداء
  @@index([apartmentId, date])
  @@index([deletedAt])
}

enum ExpenseCategory {
  CLEANING           // تنظيف الشقة
  INTERNET           // انترنت
  WATER              // مياه
  GAS                // غاز
  ELECTRICITY        // كهرباء
  MAINTENANCE        // صيانة
  SUPPLIES           // مستلزمات (صابون، مناشيل...)
  FURNITURE          // أثاث
  LAUNDRY            // غسيل ملاءات
  TOWELS             // مناشيل حمام
  KITCHEN_SUPPLIES   // مستلزمات المطبخ
  AIR_CONDITIONING   // تكييف
  OTHER              // أخرى
}
```

### 1.6 نموذج المستثمر في الشقة (ApartmentInvestor)

```prisma
model ApartmentInvestor {
  id              String    @id @default(cuid())
  apartment       Apartment @relation(fields: [apartmentId], references: [id])
  apartmentId     String
  user            User      @relation(fields: [userId], references: [id])
  userId          String
  
  percentage      Float                        // نسبة المستثمر (مثلاً 0.20 = 20%)
  investmentTarget Float    @default(0)        // الهدف السنوي للاستثمار
  
  // يمنع تكرار نفس المستثمر في نفس الشقة
  @@unique([apartmentId, userId])
  
  withdrawals     Withdrawal[]
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

### 1.7 نموذج المسحوبات (Withdrawal)

```prisma
model Withdrawal {
  id                    String             @id @default(cuid())
  apartmentInvestor     ApartmentInvestor  @relation(fields: [apartmentInvestorId], references: [id])
  apartmentInvestorId   String
  
  amount                Float                     // المبلغ المسحوب
  currency              String    @default("USD")
  date                  DateTime                  // تاريخ السحب
  comments              String?                   // ملاحظات
  
  // 🔒 Soft Delete
  deletedAt             DateTime?                 // null = نشط، تاريخ = محذوف
  
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  
  @@index([deletedAt])
}
```

### 1.8 نموذج سعر صرف العملة (CurrencyRate)

```prisma
model CurrencyRate {
  id          String   @id @default(cuid())
  fromCurrency String                       // مثلاً: USD
  toCurrency   String                       // مثلاً: EGP
  rate         Float                        // سعر الصرف
  updatedAt    DateTime @updatedAt
  
  @@unique([fromCurrency, toCurrency])
}
```

### 1.9 تحديث نموذج المستخدم (User)

```prisma
model User {
  // ... الحقول الموجودة حالياً ...
  
  // علاقات جديدة
  investments       ApartmentInvestor[]
  createdBookings   Booking[]    @relation("BookingCreator")
  createdExpenses   Expense[]    @relation("ExpenseCreator")
}
```

### 1.10 نموذج الملخص الشهري (MonthlySnapshot) ⚡

> **اقتراح ذهبي للأداء** - بدل حساب الإيرادات والمصروفات والأرباح في كل طلب، نحفظ ملخص مُحسوب مسبقاً لكل شقة كل شهر.

```prisma
model MonthlySnapshot {
  id              String    @id @default(cuid())
  apartment       Apartment @relation(fields: [apartmentId], references: [id])
  apartmentId     String
  month           String                      // "2026-03" format
  
  // الأرقام المحسوبة
  totalRevenue    Float     @default(0)       // إجمالي الإيرادات
  totalExpenses   Float     @default(0)       // إجمالي المصروفات
  profit          Float     @default(0)       // صافي الربح
  bookingsCount   Int       @default(0)       // عدد الحجوزات
  occupiedNights  Int       @default(0)       // عدد الليالي المشغولة
  
  // تقسيم الإيرادات حسب المصدر
  revenueBySource Json?                       // { "AIRBNB": 5000, "DIRECT": 2000, ... }
  
  // تقسيم المصروفات حسب القسم
  expensesByCategory Json?                    // { "CLEANING": 400, "INTERNET": 200, ... }
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // كل شقة لها ملخص واحد فقط لكل شهر
  @@unique([apartmentId, month])
  @@index([month])
}
```

**متى يتم التحديث؟**
```typescript
// 1. عند إضافة/تعديل/حذف حجز أو مصروف → نحدث snapshot الشهر المعني
async function refreshMonthlySnapshot(apartmentId: string, month: string) {
  const [year, m] = month.split('-').map(Number);
  const startOfMonth = new Date(year, m - 1, 1);
  const endOfMonth = new Date(year, m, 1);
  
  const [revenue, expenses, bookings] = await Promise.all([
    prisma.booking.aggregate({
      _sum: { amount: true },
      _count: true,
      where: {
        apartmentId,
        checkIn: { gte: startOfMonth, lt: endOfMonth },
        deletedAt: null,
      },
    }),
    prisma.expense.aggregate({
      _sum: { amount: true },
      where: {
        apartmentId,
        date: { gte: startOfMonth, lt: endOfMonth },
        deletedAt: null,
      },
    }),
    // تقسيم حسب المصدر
    prisma.booking.groupBy({
      by: ['source'],
      _sum: { amount: true },
      where: {
        apartmentId,
        checkIn: { gte: startOfMonth, lt: endOfMonth },
        deletedAt: null,
      },
    }),
  ]);
  
  await prisma.monthlySnapshot.upsert({
    where: { apartmentId_month: { apartmentId, month } },
    update: {
      totalRevenue: revenue._sum.amount || 0,
      totalExpenses: expenses._sum.amount || 0,
      profit: (revenue._sum.amount || 0) - (expenses._sum.amount || 0),
      bookingsCount: revenue._count || 0,
    },
    create: {
      apartmentId, month,
      totalRevenue: revenue._sum.amount || 0,
      totalExpenses: expenses._sum.amount || 0,
      profit: (revenue._sum.amount || 0) - (expenses._sum.amount || 0),
      bookingsCount: revenue._count || 0,
    },
  });
}

// 2. Cron job يومي (اختياري) لإعادة حساب كل الشهور كـ safety net
// app/api/cron/refresh-snapshots/route.ts
```

**الاستخدام في Dashboard والتقارير:**
```typescript
// ✅ بدل حساب معقد → query واحد بسيط وسريع جداً
const monthlyData = await prisma.monthlySnapshot.findMany({
  where: { month: '2026-03' },
  include: { apartment: { select: { name: true } } },
});
// النتيجة جاهزة فوراً بدون حسابات!
```

### 1.11 تحديث نموذج الشقة (Apartment) - إضافة علاقة MonthlySnapshot

```prisma
model Apartment {
  // ... الحقول الموجودة ...
  monthlySnapshots MonthlySnapshot[]
}
```

### ✅ مخرجات المرحلة 1:
- [ ] تحديث `prisma/schema.prisma` بجميع النماذج والعلاقات الجديدة
- [ ] إضافة `deletedAt` لكل النماذج المالية (Booking, Expense, Withdrawal)
- [ ] إضافة indexes للأداء (apartmentId + checkIn, deletedAt)
- [ ] إنشاء MonthlySnapshot model
- [ ] إنشاء migration: `npx prisma migrate dev --name add_accounting_system`
- [ ] إنشاء `lib/accounting/snapshot.ts` - دالة `refreshMonthlySnapshot()`
- [ ] اختبار العلاقات عبر `npx prisma studio`

---

## المرحلة 2: نظام الصلاحيات (Authorization) 🔐

### 2.1 تحديث Middleware

**الملف:** `middleware.ts`

```typescript
// المسارات المحمية الجديدة
const protectedPaths = ['/admin', '/profile', '/accounting'];
const adminOnlyPaths = ['/admin'];
const accountingPaths = ['/accounting'];

// صلاحيات كل مسار
const roleAccess = {
  '/accounting/dashboard':     ['GENERAL_MANAGER'],
  '/accounting/apartments':    ['GENERAL_MANAGER'],
  '/accounting/bookings':      ['GENERAL_MANAGER', 'BOOKING_MANAGER'],
  '/accounting/expenses':      ['GENERAL_MANAGER', 'OPS_MANAGER'],
  '/accounting/daily':         ['GENERAL_MANAGER', 'OPS_MANAGER'],
  '/accounting/investors':     ['GENERAL_MANAGER'],
  '/accounting/my-investments': ['INVESTOR'],
};
```

### 2.2 دالة فحص الصلاحيات

**الملف الجديد:** `lib/permissions.ts`

```typescript
type AccountingRole = 'GENERAL_MANAGER' | 'OPS_MANAGER' | 'BOOKING_MANAGER' | 'INVESTOR';

interface Permission {
  canManageTeam: boolean;          // إدارة الفريق
  canManageApartments: boolean;    // إضافة/حذف شقق
  canManageInvestors: boolean;     // إدارة المستثمرين
  canAddBookings: boolean;         // إضافة حجوزات
  canEditBookings: boolean;        // تعديل حجوزات
  canDeleteBookings: boolean;      // حذف حجوزات (soft delete)
  canAddExpenses: boolean;         // إضافة مصروفات
  canDeleteExpenses: boolean;      // حذف مصروفات (soft delete)
  canViewDailyOps: boolean;        // عرض المتابعة اليومية
  canAssignSupervisor: boolean;    // تعيين مشرف استقبال/استلام
  canViewOwnInvestments: boolean;  // عرض استثماراته فقط
  canViewAllData: boolean;         // عرض كل البيانات
  canEditAnyField: boolean;        // تعديل أي خانة
}

export function getPermissions(role: AccountingRole): Permission { ... }

// 🔒 دالة التحقق - تُستخدم في كل API route بدون استثناء
export function hasPermission(role: string | undefined, permission: keyof Permission): boolean {
  if (!role) return false;
  const perms = getPermissions(role as AccountingRole);
  return perms[permission] ?? false;
}

// 🔒 دالة مساعدة للـ API routes - ترجع 403 إذا لا يملك الصلاحية
export function requirePermission(role: string | undefined, permission: keyof Permission) {
  if (!hasPermission(role, permission)) {
    throw new ForbiddenError(`Missing permission: ${permission}`);
  }
}
```

### 2.3 نمط الحماية المزدوجة (Defense in Depth Pattern)

> **⚠️ قاعدة حاسمة:** لا نعتمد على حماية Frontend أو middleware وحدهما أبداً.

كل API route يجب أن يتبع هذا النمط:

```typescript
export async function POST(request: NextRequest) {
  // 1️⃣ الطبقة الأولى: التحقق من تسجيل الدخول
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // 2️⃣ الطبقة الثانية: التحقق من الصلاحية المحددة
  if (!hasPermission(session.user.role, 'canAddExpenses')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // 3️⃣ الطبقة الثالثة: Rate limiting
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const { allowed } = checkRateLimit(ip, { maxRequests: 30 });
  if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  
  // 4️⃣ الطبقة الرابعة: Validation (Zod)
  const body = await request.json();
  const parsed = expenseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  
  // ... business logic
}
```

### ✅ مخرجات المرحلة 2:
- [ ] إنشاء `lib/permissions.ts` مع `hasPermission()` و `requirePermission()`
- [ ] تحديث `middleware.ts` لدعم المسارات الجديدة (الطبقة الأولى)
- [ ] تحديث JWT callbacks في `lib/auth.ts` لتضمين الدور الجديد
- [ ] إنشاء `lib/accounting-auth.ts` - نمط الحماية المزدوجة (الطبقة الثانية)
- [ ] التأكد من أن كل API route يتبع نمط الـ 4 طبقات

---

## المرحلة 3: API Routes 🔌

### 3.1 هيكل API Routes

```
app/api/accounting/
├── projects/
│   ├── route.ts              GET (list) / POST (create)
│   └── [id]/
│       └── route.ts          GET / PUT / DELETE
├── apartments/
│   ├── route.ts              GET (list) / POST (create)
│   └── [id]/
│       ├── route.ts          GET / PUT / DELETE
│       ├── summary/
│       │   └── route.ts      GET (ملخص الشقة: إيرادات + مصروفات + أرباح)
│       └── investors/
│           └── route.ts      GET / POST (إدارة مستثمري الشقة)
├── bookings/
│   ├── route.ts              GET (list with filters) / POST (create)
│   └── [id]/
│       └── route.ts          GET / PUT / DELETE
├── expenses/
│   ├── route.ts              GET (list with filters) / POST (create)
│   ├── categories/
│   │   └── route.ts          GET (أقسام المصروفات)
│   └── [id]/
│       └── route.ts          GET / PUT / DELETE
├── daily/
│   └── route.ts              GET (جدول اليوم: دخول + خروج)
├── investors/
│   ├── route.ts              GET (كل المستثمرين)
│   └── [userId]/
│       ├── route.ts          GET (ملخص المستثمر)
│       └── withdrawals/
│           └── route.ts      GET / POST (المسحوبات)
├── reports/
│   ├── project-summary/
│   │   └── route.ts          GET (ملخص المشروع الكامل)
│   ├── monthly/
│   │   └── route.ts          GET (تقرير شهري)
│   └── annual/
│       └── route.ts          GET (تقرير سنوي)
└── currency-rate/
    └── route.ts              GET / PUT (سعر الصرف)

app/api/cron/
└── refresh-snapshots/
    └── route.ts              POST (إعادة حساب MonthlySnapshots - safety net)
```

### 3.2 نموذج API Route (الحجوزات)

```typescript
// app/api/accounting/bookings/route.ts
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkRateLimit } from '@/lib/rate-limit';
import { addSecurityHeaders } from '@/lib/security-headers';
import { hasPermission } from '@/lib/permissions';
import { refreshMonthlySnapshot } from '@/lib/accounting/snapshot';

export async function GET(request: NextRequest) {
  // 🔒 طبقة 1: Auth
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // 🔒 طبقة 2: Permission
  if (!hasPermission(session.user.role, 'canAddBookings') && 
      !hasPermission(session.user.role, 'canViewAllData')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const apartmentId = searchParams.get('apartmentId');
  const month = searchParams.get('month');  // YYYY-MM format (مطلوب)
  const source = searchParams.get('source');

  // ⚡ الفلترة بالشهر إلزامية للأداء
  const where: any = { deletedAt: null }; // Soft delete filter
  if (apartmentId) where.apartmentId = apartmentId;
  if (month) {
    const [year, m] = month.split('-');
    where.checkIn = {
      gte: new Date(+year, +m - 1, 1),
      lt: new Date(+year, +m, 1),
    };
  }
  if (source) where.source = source;

  const bookings = await prisma.booking.findMany({
    where,
    include: { apartment: { select: { name: true } } },
    orderBy: { checkIn: 'desc' },
  });

  return addSecurityHeaders(NextResponse.json({ bookings }));
}

export async function POST(request: NextRequest) {
  // 🔒 نفس نمط الحماية المزدوجة
  const session = await auth();
  if (!hasPermission(session?.user?.role, 'canAddBookings')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // ... validation, create booking ...
  const booking = await prisma.booking.create({ data: { ... } });
  
  // ⚡ تحديث MonthlySnapshot بعد الإنشاء
  const month = `${booking.checkIn.getFullYear()}-${String(booking.checkIn.getMonth() + 1).padStart(2, '0')}`;
  await refreshMonthlySnapshot(booking.apartmentId, month);
  
  return addSecurityHeaders(NextResponse.json({ booking }));
}

export async function DELETE(request: NextRequest) {
  // 🔒 Soft Delete فقط
  await prisma.booking.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  
  // ⚡ تحديث MonthlySnapshot بعد الحذف
  await refreshMonthlySnapshot(booking.apartmentId, month);
}
```

### 3.3 API جدول المتابعة اليومية

```typescript
// app/api/accounting/daily/route.ts
// يجلب الحجوزات التي فيها دخول أو خروج اليوم (أو الغد بعد الساعة 7 مساءً)

export async function GET(request: NextRequest) {
  const now = new Date();
  const hour = now.getHours();
  
  // بعد الساعة 7 مساءً → عرض بيانات اليوم التالي
  const targetDate = hour >= 19 
    ? new Date(now.getTime() + 24 * 60 * 60 * 1000) 
    : now;
  
  const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
  
  // تسجيل الدخول
  const checkIns = await prisma.booking.findMany({
    where: { checkIn: { gte: startOfDay, lte: endOfDay }, deletedAt: null },
    include: { apartment: true },
  });
  
  // تسجيل الخروج
  const checkOuts = await prisma.booking.findMany({
    where: { checkOut: { gte: startOfDay, lte: endOfDay }, deletedAt: null },
    include: { apartment: true },
  });
  
  return NextResponse.json({ checkIns, checkOuts, targetDate: startOfDay });
}
```

### 3.4 API ملخص المستثمر (مُحسّن)

```typescript
// app/api/accounting/investors/[userId]/route.ts
// يعرض فقط شقق المستثمر مع نسبته وأرباحه (بدون بيانات المستثمرين الآخرين)
// ⚡ يستخدم MonthlySnapshot + DB Aggregation بدل تحميل كل البيانات

export async function GET(request, { params }) {
  // 🔒 طبقة 1: Auth
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { userId } = params;
  
  // 🔒 طبقة 2: المستثمر يرى بياناته فقط
  if (session.user.role === 'INVESTOR' && session.user.id !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month'); // YYYY-MM (اختياري)
  const year = searchParams.get('year');   // YYYY (اختياري)
  
  // جلب استثمارات المستثمر فقط
  const investments = await prisma.apartmentInvestor.findMany({
    where: { userId },
    include: {
      apartment: { select: { id: true, name: true, type: true } },
    },
  });
  
  // ⚡ استخدام MonthlySnapshot بدل تحميل كل الحجوزات والمصروفات
  const result = await Promise.all(investments.map(async (inv) => {
    // جلب الملخصات الشهرية (مفلترة بالشهر أو السنة)
    const snapshotWhere: any = { apartmentId: inv.apartmentId };
    if (month) snapshotWhere.month = month;
    if (year) snapshotWhere.month = { startsWith: year };
    
    const snapshots = await prisma.monthlySnapshot.findMany({
      where: snapshotWhere,
      orderBy: { month: 'asc' },
    });
    
    // ⚡ حساب المجاميع من snapshots (بدل .reduce على كل الحجوزات)
    const totalRevenue = snapshots.reduce((s, snap) => s + snap.totalRevenue, 0);
    const totalExpenses = snapshots.reduce((s, snap) => s + snap.totalExpenses, 0);
    const profit = totalRevenue - totalExpenses;
    const investorProfit = profit * inv.percentage;
    
    // ⚡ المسحوبات عبر DB aggregation
    const totalWithdrawals = await prisma.withdrawal.aggregate({
      _sum: { amount: true },
      where: { apartmentInvestorId: inv.id, deletedAt: null },
    });
    
    // المسحوبات التفصيلية (مع pagination)
    const withdrawals = await prisma.withdrawal.findMany({
      where: { apartmentInvestorId: inv.id, deletedAt: null },
      orderBy: { date: 'desc' },
      take: 50,
    });
    
    return {
      apartment: inv.apartment.name,
      apartmentId: inv.apartmentId,
      percentage: inv.percentage,
      investmentTarget: inv.investmentTarget,
      totalRevenue,
      totalExpenses,
      profit,
      investorProfit,
      totalWithdrawals: totalWithdrawals._sum.amount || 0,
      balance: investorProfit - (totalWithdrawals._sum.amount || 0),
      monthlyBreakdown: snapshots.map(s => ({
        month: s.month,
        revenue: s.totalRevenue,
        expenses: s.totalExpenses,
        profit: s.profit,
        investorShare: s.profit * inv.percentage,
      })),
      withdrawals,
    };
  }));
  
  return addSecurityHeaders(NextResponse.json({ investments: result }));
}
```

> **ملاحظة أداء:** هذا الـ API أصبح أسرع بـ 100x مقارنة بالنسخة التي تجلب كل الحجوزات والمصروفات، خاصة مع شقق لها بيانات 3+ سنوات.

### 3.5 API ملخص الشقة (مُحسّن بـ DB Aggregation)

```typescript
// app/api/accounting/apartments/[id]/summary/route.ts
// يستخدم prisma.aggregate بدل .reduce() لحساب الملخص

export async function GET(request: NextRequest, { params }) {
  const { id: apartmentId } = params;
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month'); // YYYY-MM
  
  // ⚡ Option 1: من MonthlySnapshot (الأسرع - O(1))
  if (month) {
    const snapshot = await prisma.monthlySnapshot.findUnique({
      where: { apartmentId_month: { apartmentId, month } },
    });
    if (snapshot) return NextResponse.json({ summary: snapshot });
  }
  
  // ⚡ Option 2: حساب مباشر عبر DB Aggregation (fallback)
  const [year, m] = (month || '').split('-').map(Number);
  const dateFilter = month ? {
    gte: new Date(year, m - 1, 1),
    lt: new Date(year, m, 1),
  } : undefined;
  
  const [revenueResult, expenseResult, bookingsBySource] = await Promise.all([
    prisma.booking.aggregate({
      _sum: { amount: true },
      _count: true,
      where: {
        apartmentId,
        deletedAt: null,
        ...(dateFilter ? { checkIn: dateFilter } : {}),
      },
    }),
    prisma.expense.aggregate({
      _sum: { amount: true },
      where: {
        apartmentId,
        deletedAt: null,
        ...(dateFilter ? { date: dateFilter } : {}),
      },
    }),
    prisma.booking.groupBy({
      by: ['source'],
      _sum: { amount: true },
      _count: true,
      where: {
        apartmentId,
        deletedAt: null,
        ...(dateFilter ? { checkIn: dateFilter } : {}),
      },
    }),
  ]);
  
  const totalRevenue = revenueResult._sum.amount || 0;
  const totalExpenses = expenseResult._sum.amount || 0;
  
  return NextResponse.json({
    summary: {
      totalRevenue,
      totalExpenses,
      profit: totalRevenue - totalExpenses,
      bookingsCount: revenueResult._count,
      revenueBySource: Object.fromEntries(
        bookingsBySource.map(g => [g.source, g._sum.amount || 0])
      ),
    }
  });
}
```

### ✅ مخرجات المرحلة 3:
- [ ] إنشاء جميع API routes المذكورة أعلاه
- [ ] تطبيق نمط الحماية المزدوجة (4 طبقات) في كل route
- [ ] استخدام `deletedAt: null` في كل where clause
- [ ] استخدام `prisma.aggregate` و `prisma.groupBy` بدل `.reduce()`
- [ ] استدعاء `refreshMonthlySnapshot()` بعد كل عملية إنشاء/تعديل/حذف
- [ ] إضافة Zod validation schemas في `lib/validations/accounting.ts`
- [ ] إضافة rate limiting لكل endpoint
- [ ] اختبار كل endpoint يدوياً عبر Postman/curl

---

## المرحلة 4: التخطيط (Layout) والتنقل 🧭

### 4.1 هيكل الصفحات

```
app/accounting/
├── layout.tsx                    // Layout مع Sidebar + Auth guard
├── page.tsx                      // لوحة التحكم الرئيسية (Dashboard)
├── apartments/
│   ├── page.tsx                  // قائمة الشقق
│   └── [id]/
│       └── page.tsx              // تفاصيل شقة واحدة (شيت الشقة الأساسي)
├── bookings/
│   └── page.tsx                  // شيت الحجوزات (الإيرادات)
├── expenses/
│   └── page.tsx                  // شيت المصروفات
├── daily/
│   └── page.tsx                  // جدول المتابعة اليومية
├── investors/
│   └── page.tsx                  // إدارة المستثمرين (للمدير فقط)
├── my-investments/
│   └── page.tsx                  // حسابات المستثمر (للمستثمر فقط)
├── reports/
│   └── page.tsx                  // التقارير والملخصات
└── settings/
    └── page.tsx                  // إعدادات النظام (أقسام مصروفات، سعر صرف...)
```

### 4.2 Sidebar الحسابات

**الملف الجديد:** `components/accounting/Sidebar.tsx`

القائمة تتغير حسب الدور:

| الصفحة | المدير العام | مدير التشغيل | مدير الحجوزات | المستثمر |
|--------|:---:|:---:|:---:|:---:|
| لوحة التحكم | ✅ | ✅ | ✅ | ❌ |
| الشقق | ✅ | 👁️ | 👁️ | ❌ |
| الحجوزات | ✅ | 👁️ | ✅ | ❌ |
| المصروفات | ✅ | ✅ | ❌ | ❌ |
| المتابعة اليومية | ✅ | ✅ | ❌ | ❌ |
| المستثمرين | ✅ | ❌ | ❌ | ❌ |
| حساباتي | ❌ | ❌ | ❌ | ✅ |
| التقارير | ✅ | ❌ | ❌ | ❌ |
| الإعدادات | ✅ | ❌ | ❌ | ❌ |

**أيقونة كل صفحة (Lucide React):**
- لوحة التحكم: `LayoutDashboard`
- الشقق: `Building2`
- الحجوزات: `CalendarCheck`
- المصروفات: `Receipt`
- المتابعة اليومية: `ClipboardList`
- المستثمرين: `Users`
- حساباتي: `Wallet`
- التقارير: `BarChart3`
- الإعدادات: `Settings`

### 4.3 تصميم Layout الحسابات

```tsx
// app/accounting/layout.tsx
// مشابه تماماً لـ admin/layout.tsx مع:
// - Sidebar مخصص حسب الدور
// - نفس الألوان والأنماط (gradient, rounded corners, shadows)
// - responsive: sidebar ثابت على desktop، drawer على mobile
// - خلفية: from-primary/20 via-accent/40 to-accent/60
```

### ✅ مخرجات المرحلة 4:
- [ ] إنشاء `app/accounting/layout.tsx`
- [ ] إنشاء `components/accounting/Sidebar.tsx`
- [ ] إنشاء صفحات placeholder لكل مسار
- [ ] تحديث `middleware.ts` لحماية مسارات `/accounting/*`

---

## المرحلة 5: لوحة التحكم الرئيسية (Dashboard) 📊

### 5.1 بطاقات الإحصائيات

**الصفحة:** `app/accounting/page.tsx`

بطاقات `StatsCard` مشابهة للوحة الأدمن الحالية:

| البطاقة | الأيقونة | اللون |
|---------|---------|-------|
| إجمالي الإيرادات (هذا الشهر) | `DollarSign` | أخضر |
| إجمالي المصروفات (هذا الشهر) | `Receipt` | أحمر |
| صافي الربح (هذا الشهر) | `TrendingUp` | ذهبي |
| عدد الحجوزات النشطة | `CalendarCheck` | أزرق |
| عدد الشقق | `Building2` | بنفسجي |
| نسبة الإشغال | `Percent` | برتقالي |

### 5.2 الرسوم البيانية (Charts)

باستخدام `recharts` (موجود في المشروع):

1. **مخطط خطي** - الإيرادات vs المصروفات (آخر 12 شهر)
2. **مخطط دائري** - توزيع المصروفات حسب القسم
3. **مخطط شريطي** - مقارنة أرباح الشقق
4. **مخطط دائري** - مصادر الحجوزات (Airbnb, خارجي, مباشر...)

### 5.3 جداول سريعة

- آخر 5 حجوزات
- آخر 5 مصروفات
- تنبيهات (دخول/خروج اليوم)

### التصميم المرئي:

```
┌─────────────────────────────────────────────────────────────┐
│                    لوحة التحكم - نظام الحسابات               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐│
│  │إيرادات│  │مصروفات│  │ ربح  │  │حجوزات│  │ شقق │  │إشغال ││
│  │$12,500│  │$4,200│  │$8,300│  │  15  │  │  11  │  │ 78% ││
│  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘  └──────┘│
│                                                             │
│  ┌─────────────────────────┐  ┌─────────────────────────┐  │
│  │  📈 الإيرادات/المصروفات  │  │  🥧 توزيع المصروفات     │  │
│  │     (مخطط خطي)          │  │     (مخطط دائري)        │  │
│  └─────────────────────────┘  └─────────────────────────┘  │
│                                                             │
│  ┌─────────────────────────┐  ┌─────────────────────────┐  │
│  │  📋 آخر الحجوزات        │  │  ⚠️ تنبيهات اليوم       │  │
│  │  (جدول)                 │  │  (دخول/خروج)            │  │
│  └─────────────────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### ✅ مخرجات المرحلة 5:
- [ ] إنشاء `app/accounting/page.tsx`
- [ ] إنشاء `components/accounting/dashboard/StatsCards.tsx`
- [ ] إنشاء `components/accounting/dashboard/RevenueExpenseChart.tsx`
- [ ] إنشاء `components/accounting/dashboard/ExpensePieChart.tsx`
- [ ] إنشاء `components/accounting/dashboard/RecentBookings.tsx`
- [ ] إنشاء `components/accounting/dashboard/DailyAlerts.tsx`
- [ ] إضافة Framer Motion animations بنفس أسلوب الأدمن الحالي

---

## المرحلة 6: شيت الشقق (Apartments) 🏠

### 6.1 صفحة قائمة الشقق

**الصفحة:** `app/accounting/apartments/page.tsx`

- عرض كروت لجميع الشقق مجمعة حسب المشروع
- كل كرت يعرض: اسم الشقة، نوعها، عدد الحجوزات، إجمالي الإيرادات/المصروفات، صافي الربح
- زر إضافة شقة جديدة (للمدير العام فقط)
- فلتر حسب المشروع والشهر

### 6.2 صفحة تفاصيل الشقة (شيت الشقة الأساسي)

**الصفحة:** `app/accounting/apartments/[id]/page.tsx`

هذا هو الشيت الأهم - يعرض كل بيانات الشقة في مكان واحد:

```
┌─────────────────────────────────────────────────────────────┐
│              المنيل - الدور الخامس  |  مارس 2026            │
│              ◄ الشهر السابق    الشهر التالي ►               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  الملخص المالي                        │  │
│  │  ┌────────┐  ┌────────────┐  ┌──────────┐           │  │
│  │  │إيرادات │  │ مصروفات    │  │  الربح   │           │  │
│  │  │$12,500 │  │  $4,200    │  │ $8,300   │           │  │
│  │  └────────┘  └────────────┘  └──────────┘           │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  الحجوزات (الإيرادات)                  │  │
│  │  ┌──────┬────────┬────────┬──────┬────────┬────────┐ │  │
│  │  │العميل│ الدخول │ الخروج │الليالي│ المبلغ │ المصدر │ │  │
│  │  ├──────┼────────┼────────┼──────┼────────┼────────┤ │  │
│  │  │ أحمد │ 01/03  │ 05/03  │  4   │ $600   │Airbnb  │ │  │
│  │  │ محمد │ 07/03  │ 10/03  │  3   │ $450   │ خارجي  │ │  │
│  │  └──────┴────────┴────────┴──────┴────────┴────────┘ │  │
│  │                               مجموع: $1,050          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  المصروفات                             │  │
│  │  ┌────────────┬──────────┬────────┬─────────────────┐│  │
│  │  │   الوصف    │  القسم   │ التاريخ │     المبلغ     ││  │
│  │  ├────────────┼──────────┼────────┼─────────────────┤│  │
│  │  │تنظيف الشقة │ نظافة    │ 01/03  │     $400       ││  │
│  │  │فاتورة مياه │ مياه     │ 05/03  │     $65        ││  │
│  │  └────────────┴──────────┴────────┴─────────────────┘│  │
│  │                               مجموع: $465            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │               جدول المستثمرين                         │  │
│  │  ┌──────────┬───────┬────────┬──────────┬──────────┐ │  │
│  │  │  الاسم   │النسبة │ الربح  │المسحوبات │المتبقي  │ │  │
│  │  ├──────────┼───────┼────────┼──────────┼──────────┤ │  │
│  │  │ محمد     │ 20%   │ $1,660 │  $500    │ $1,160  │ │  │
│  │  │ Buggzy   │ 25%   │ $2,075 │  $0      │ $2,075  │ │  │
│  │  │ أبو عمر  │ 45%   │ $3,735 │  $1,000  │ $2,735  │ │  │
│  │  └──────────┴───────┴────────┴──────────┴──────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### التنسيق:
- الخلفية العامة: `bg-accent/30` (بيج فاتح)
- الجداول: `bg-white rounded-xl shadow-soft` مع `border border-primary/20`
- رأس الجدول: `bg-secondary text-white` (أخضر داكن)
- صفوف الإيرادات: `bg-green-50/50` (شفاف أخضر فاتح)
- صفوف المصروفات: `bg-red-50/50` (شفاف أحمر فاتح)
- بطاقات الملخص: نفس تصميم `StatsCard` في الأدمن
- أزرار التنقل بين الأشهر: `bg-primary/20 hover:bg-primary/40 rounded-lg`

### ✅ مخرجات المرحلة 6:
- [ ] إنشاء `app/accounting/apartments/page.tsx`
- [ ] إنشاء `app/accounting/apartments/[id]/page.tsx`
- [ ] إنشاء `components/accounting/apartments/ApartmentCard.tsx`
- [ ] إنشاء `components/accounting/apartments/ApartmentDetail.tsx`
- [ ] إنشاء `components/accounting/apartments/BookingsTable.tsx`
- [ ] إنشاء `components/accounting/apartments/ExpensesTable.tsx`
- [ ] إنشاء `components/accounting/apartments/InvestorsTable.tsx`
- [ ] إنشاء `components/accounting/apartments/MonthSelector.tsx`
- [ ] إنشاء `components/accounting/apartments/FinancialSummary.tsx`
- [ ] Modal إضافة/تعديل شقة جديدة

---

## المرحلة 7: شيت الحجوزات (Bookings) 📅

### 7.1 الصفحة الرئيسية

**الصفحة:** `app/accounting/bookings/page.tsx`

**الوصول:** المدير العام + مدير الحجوزات

**المحتوى:**
- فلتر بالشقة والشهر ومصدر الحجز والحالة
- جدول الحجوزات لكل شقة (tabs أو filter)
- زر إضافة حجز جديد
- ملخص الإيرادات (بطاقة علوية)

### 7.2 صفحة الملخص

في نفس الصفحة (tab أو قسم):
- مجموع الإيرادات للشقق كلها
- مخطط دائري لتوزيع حسب مصادر الحجز
- مخطط شريطي لمقارنة إيرادات الشقق

### 7.3 نموذج إضافة حجز

```
┌──────────────────────────────────────────┐
│           إضافة حجز جديد                  │
├──────────────────────────────────────────┤
│  الشقة:        [قائمة الشقق ▼]           │
│  اسم العميل:   [_______________]         │
│  رقم التواصل:  [_______________]         │
│  مصدر الحجز:   [Airbnb ▼]               │
│  تاريخ الدخول: [📅 01/03/2026]           │
│  تاريخ الخروج: [📅 05/03/2026]           │
│  عدد الليالي:  4 (محسوب تلقائياً)        │
│  القيمة المالية: [_______________]       │
│  وقت الوصول:   [_______________]         │
│  ملاحظات:      [_______________]         │
│                                          │
│      [إلغاء]           [حفظ الحجز]       │
└──────────────────────────────────────────┘
```

### التنسيق:
- Modal بنمط `rounded-2xl` مع `backdrop-blur`
- أزرار: `bg-secondary text-white hover:bg-secondary-light` (الزر الرئيسي)
- حالات مصدر الحجز: badges ملونة
  - Airbnb: `bg-[#FF5A5F]/10 text-[#FF5A5F]`
  - خارجي: `bg-secondary/10 text-secondary`
  - مباشر: `bg-primary/20 text-primary-dark`
  - Booking.com: `bg-[#003B95]/10 text-[#003B95]`

### ✅ مخرجات المرحلة 7:
- [ ] إنشاء `app/accounting/bookings/page.tsx`
- [ ] إنشاء `components/accounting/bookings/BookingForm.tsx`
- [ ] إنشاء `components/accounting/bookings/BookingsList.tsx`
- [ ] إنشاء `components/accounting/bookings/BookingSummary.tsx`
- [ ] إنشاء `components/accounting/bookings/BookingSourceChart.tsx`
- [ ] Zod schema: `lib/validations/booking.ts`

---

## المرحلة 8: شيت المصروفات (Expenses) 💰

### 8.1 الصفحة الرئيسية

**الصفحة:** `app/accounting/expenses/page.tsx`

**الوصول:** المدير العام + مدير التشغيل

**المحتوى:**
- Tabs لكل شقة (أو فلتر dropdown)
- فلتر بالشهر والقسم
- جدول المصروفات مع إمكانية الإضافة
- بطاقة مجموع المصروفات

### 8.2 صفحة الملخص

- مجموع المصروفات للشقق كلها
- مخطط دائري لتوزيع المصروفات حسب القسم
- مخطط شريطي لمقارنة مصروفات الشقق
- مخطط خطي لتتبع المصروفات عبر الأشهر

### 8.3 أقسام المصروفات (Categories Badge Design)

| القسم | اللون | الأيقونة |
|-------|-------|---------|
| تنظيف الشقة | `bg-blue-50 text-blue-700` | `Sparkles` |
| انترنت | `bg-purple-50 text-purple-700` | `Wifi` |
| مياه | `bg-cyan-50 text-cyan-700` | `Droplets` |
| غاز | `bg-orange-50 text-orange-700` | `Flame` |
| كهرباء | `bg-yellow-50 text-yellow-700` | `Zap` |
| صيانة | `bg-gray-50 text-gray-700` | `Wrench` |
| مستلزمات | `bg-green-50 text-green-700` | `ShoppingBag` |
| أثاث | `bg-amber-50 text-amber-700` | `Armchair` |
| غسيل ملاءات | `bg-indigo-50 text-indigo-700` | `Shirt` |
| مناشيل حمام | `bg-teal-50 text-teal-700` | `Bath` |
| مستلزمات المطبخ | `bg-rose-50 text-rose-700` | `ChefHat` |
| تكييف | `bg-sky-50 text-sky-700` | `Snowflake` |
| أخرى | `bg-stone-50 text-stone-700` | `MoreHorizontal` |

### 8.4 نموذج إضافة مصروف

```
┌──────────────────────────────────────────┐
│           إضافة مصروف جديد               │
├──────────────────────────────────────────┤
│  الشقة:     [قائمة الشقق ▼]             │
│  الوصف:     [_______________]            │
│  القسم:     [🔽 اختر القسم]             │
│             ┌─────────────────┐          │
│             │ ✨ تنظيف الشقة   │          │
│             │ 📶 انترنت        │          │
│             │ 💧 مياه          │          │
│             │ 🔥 غاز           │          │
│             │ ⚡ كهرباء        │          │
│             │ 🔧 صيانة         │          │
│             │ ...              │          │
│             └─────────────────┘          │
│  المبلغ:    [_______________]            │
│  التاريخ:   [📅 01/03/2026]             │
│  ملاحظات:   [_______________]            │
│                                          │
│      [إلغاء]         [حفظ المصروف]       │
└──────────────────────────────────────────┘
```

### ✅ مخرجات المرحلة 8:
- [ ] إنشاء `app/accounting/expenses/page.tsx`
- [ ] إنشاء `components/accounting/expenses/ExpenseForm.tsx`
- [ ] إنشاء `components/accounting/expenses/ExpensesList.tsx`
- [ ] إنشاء `components/accounting/expenses/ExpenseSummary.tsx`
- [ ] إنشاء `components/accounting/expenses/CategoryPieChart.tsx`
- [ ] إنشاء `components/accounting/expenses/CategoryBadge.tsx`
- [ ] Zod schema: `lib/validations/expense.ts`

---

## المرحلة 9: جدول المتابعة اليومية (Daily Operations) 📋

### 9.1 الصفحة

**الصفحة:** `app/accounting/daily/page.tsx`

**الوصول:** المدير العام + مدير التشغيل

**القاعدة المهمة:**
> يتحدث الجدول كل يوم الساعة 7 مساءً ليعرض بيانات اليوم التالي

### 9.2 التصميم

```
┌─────────────────────────────────────────────────────────────┐
│           جدول أعمال اليوم - السبت 1 مارس 2026              │
│           (يتم التحديث الساعة 7:00 مساءً)                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  🟢 تسجيل الدخول (Check-in)                          │  │
│  │  ┌─────────┬─────────┬────────┬────────┬───────────┐ │  │
│  │  │ الشقة   │ الضيف   │التواصل │ الوصول │مشرف       │ │  │
│  │  │         │         │        │        │الاستقبال  │ │  │
│  │  ├─────────┼─────────┼────────┼────────┼───────────┤ │  │
│  │  │الخامس   │ ليلى    │  0     │        │[اختر ▼]   │ │  │
│  │  │الرابع   │  --     │  --    │   --   │[اختر ▼]   │ │  │
│  │  └─────────┴─────────┴────────┴────────┴───────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  🔴 تسجيل الخروج (Check-out)                         │  │
│  │  ┌─────────┬─────────┬────────┬────────┬───────────┐ │  │
│  │  │ الشقة   │ الضيف   │التواصل │ الخروج │مشرف       │ │  │
│  │  │         │         │        │        │الاستلام   │ │  │
│  │  ├─────────┼─────────┼────────┼────────┼───────────┤ │  │
│  │  │ شهاب   │ ليلى    │  0     │14/02   │[محمد ▼]   │ │  │
│  │  └─────────┴─────────┴────────┴────────┴───────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ℹ️ الخانة الوحيدة القابلة للتعديل: مشرف الاستقبال/الاستلام│
└─────────────────────────────────────────────────────────────┘
```

### 9.3 سلوك التحديث

```typescript
// hooks/useDailySchedule.ts
function useDailySchedule() {
  const [targetDate, setTargetDate] = useState(() => {
    const now = new Date();
    // بعد الساعة 7 مساءً → عرض بيانات الغد
    if (now.getHours() >= 19) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }
    return now;
  });
  
  // تحديث تلقائي عند الساعة 7
  useEffect(() => {
    const checkTime = setInterval(() => {
      const now = new Date();
      if (now.getHours() >= 19) {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        setTargetDate(tomorrow);
      }
    }, 60000); // فحص كل دقيقة
    return () => clearInterval(checkTime);
  }, []);
  
  return targetDate;
}
```

### 9.4 حفظ المشرف

```typescript
// PATCH /api/accounting/bookings/[id]
// مدير التشغيل يمكنه فقط تحديث:
// - receptionSupervisor (مشرف الاستقبال)
// - deliverySupervisor (مشرف الاستلام)
```

### التنسيق:
- قسم الدخول: حدود `border-r-4 border-green-500`
- قسم الخروج: حدود `border-r-4 border-red-500`
- شقة بدون حركة: صف رمادي فاتح `bg-gray-50 opacity-50`
- شقة بها حركة: `bg-white` مع `shadow-soft` خفيف
- Dropdown المشرف: تصميم select مخصص بنفس ألوان النظام

### ✅ مخرجات المرحلة 9:
- [ ] إنشاء `app/accounting/daily/page.tsx`
- [ ] إنشاء `components/accounting/daily/CheckInTable.tsx`
- [ ] إنشاء `components/accounting/daily/CheckOutTable.tsx`
- [ ] إنشاء `components/accounting/daily/SupervisorSelect.tsx`
- [ ] إنشاء `hooks/useDailySchedule.ts`
- [ ] API endpoint: `PATCH /api/accounting/bookings/[id]` (للمشرف فقط)

---

## المرحلة 10: واجهة المستثمر (Investor Portal) 💼

### 10.1 صفحة حساباتي

**الصفحة:** `app/accounting/my-investments/page.tsx`

**الوصول:** المستثمر فقط

### 10.2 التصميم - صفحة الشقة للمستثمر

```
┌─────────────────────────────────────────────────────────────┐
│                   حساباتي - المنيل (2)                       │
│                   ◄ الشهر السابق    الشهر التالي ►           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                    الملخص المالي                      │  │
│  │  إجمالي الإيرادات: $94,992.00                        │  │
│  │  إجمالي المصروفات: $37,862.20                        │  │
│  │  صافي الربح:       $57,129.80                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              نسبتي في هذه الشقة                       │  │
│  │  ┌──────────┬───────┬────────┬──────────┬──────────┐ │  │
│  │  │  الاسم   │النسبة │ الربح  │المسحوبات │المتبقي  │ │  │
│  │  ├──────────┼───────┼────────┼──────────┼──────────┤ │  │
│  │  │ Tawfiq   │ 0.0%  │ $95.22 │   $0     │ $95.22  │ │  │
│  │  └──────────┴───────┴────────┴──────────┴──────────┘ │  │
│  │  ⚠️ يظهر فقط بيانات المستثمر الحالي                   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  تفاصيل الحجوزات                      │  │
│  │  (جدول الإيرادات - للقراءة فقط)                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                  تفاصيل المصروفات                     │  │
│  │  (جدول المصروفات - للقراءة فقط)                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 10.3 صفحة الملخص المالي للمستثمر

```
┌─────────────────────────────────────────────────────────────┐
│              الملخص المالي - Tawfiq                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────── 2024 ───────────────────────────┐   │
│  │                  الربح الشهري                        │   │
│  │  ┌──────┬────────────────────────────┬──────────────┐│   │
│  │  │الشقة │  4  5  6  7  8  9  10 ... │  المجموع     ││   │
│  │  ├──────┼────────────────────────────┼──────────────┤│   │
│  │  │منيل2 │$95 $203 $129 $252 $200 ...│  $1,703.43   ││   │
│  │  └──────┴────────────────────────────┴──────────────┘│   │
│  │                                                      │   │
│  │  التقدم السنوي                                       │   │
│  │  الهدف: $3,000  |  المحقق: $1,703.43  |  56.78%     │   │
│  │  ████████████████████░░░░░░░░░░░░░░                  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────── 2025 ───────────────────────────┐   │
│  │  (نفس التنسيق)                                      │   │
│  │  المحقق: $1,041.29  |  34.71%                       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              المسحوبات                                │  │
│  │  ┌────────┬─────────────┬──────────────────────────┐ │  │
│  │  │ المبلغ │  التاريخ    │      ملاحظات             │ │  │
│  │  ├────────┼─────────────┼──────────────────────────┤ │  │
│  │  │ $820   │ 15/09/2024  │ عند بجزي بعد شرم...     │ │  │
│  │  │ $989   │ 21/02/2025  │ تحويل انستا باي          │ │  │
│  │  ├────────┼─────────────┼──────────────────────────┤ │  │
│  │  │إجمالي: │  $1,809.00  │                          │ │  │
│  │  └────────┴─────────────┴──────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  الرصيد النهائي                                      │  │
│  │  إجمالي الأرباح: $2,744.72                           │  │
│  │  إجمالي المسحوبات: $1,809.00                         │  │
│  │  الرصيد المتبقي: $935.72                             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 10.4 الخصوصية

> **قاعدة أمان مهمة:** المستثمر يرى بياناته فقط في جدول المستثمرين.
> لا يرى نسب أو أرباح أو مسحوبات المستثمرين الآخرين.
> يتم تصفية البيانات على مستوى API وليس على مستوى العرض فقط.

### التنسيق:
- بطاقة الملخص: `bg-gradient-to-l from-secondary/5 to-primary/10 rounded-2xl`
- شريط التقدم: `bg-primary/30` (الخلفية) + `bg-primary` (المعبأ) مع animation
- جدول المسحوبات: خلفية `bg-red-50/30` (وردي خفيف)
- بطاقة الرصيد: `bg-secondary text-white rounded-2xl` مع `shadow-large`
- جدول الأرباح الشهرية: `bg-blue-50/50` للرأس مع ألوان متناوبة للصفوف

### ✅ مخرجات المرحلة 10:
- [ ] إنشاء `app/accounting/my-investments/page.tsx`
- [ ] إنشاء `components/accounting/investor/ApartmentView.tsx`
- [ ] إنشاء `components/accounting/investor/MonthlySummary.tsx`
- [ ] إنشاء `components/accounting/investor/WithdrawalsTable.tsx`
- [ ] إنشاء `components/accounting/investor/ProgressBar.tsx`
- [ ] إنشاء `components/accounting/investor/BalanceCard.tsx`
- [ ] تأكيد أن API يفلت بيانات المستثمرين الآخرين

---

## المرحلة 11: إدارة المستثمرين (للمدير العام) 👥

### 11.1 الصفحة

**الصفحة:** `app/accounting/investors/page.tsx`

**الوصول:** المدير العام فقط

### 11.2 المحتوى

- قائمة كل المستثمرين مع شققهم ونسبهم
- إمكانية ربط مستثمر بشقة وتحديد نسبته
- إمكانية تعديل النسب
- إمكانية تسجيل مسحوبات جديدة
- ملخص مالي لكل مستثمر

### 11.3 إدارة فريق العمل

**بجانب المستثمرين، المدير العام يمكنه:**
- إنشاء حسابات جديدة بأدوار مختلفة
- تعيين أو إزالة أدوار (مدير تشغيل، مدير حجوزات، مستثمر)
- تعطيل/تفعيل حسابات

### ✅ مخرجات المرحلة 11:
- [ ] إنشاء `app/accounting/investors/page.tsx`
- [ ] إنشاء `components/accounting/investors/InvestorsList.tsx`
- [ ] إنشاء `components/accounting/investors/AssignInvestorModal.tsx`
- [ ] إنشاء `components/accounting/investors/WithdrawalForm.tsx`
- [ ] API: `POST /api/accounting/investors/[userId]/withdrawals`
- [ ] API: `POST /api/accounting/apartments/[id]/investors` (ربط مستثمر)

---

## المرحلة 12: شيت المشروع الكامل (Project Overview) 📈

### 12.1 الصفحة

**الصفحة:** `app/accounting/reports/page.tsx`

**الوصول:** المدير العام فقط

### 12.2 المحتوى

```
┌─────────────────────────────────────────────────────────────┐
│            ملخص المشروع - مارس 2026                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────── الشقق ────────────────────────────────────────┐   │
│  │ ┌─────────────────┐ ┌─────────────────┐             │   │
│  │ │ المنيل - خامس   │ │ المنيل - رابع   │ ...         │   │
│  │ │ إيرادات: $5,000 │ │ إيرادات: $3,200 │             │   │
│  │ │ مصروفات: $1,800 │ │ مصروفات: $900   │             │   │
│  │ │ ربح: $3,200     │ │ ربح: $2,300     │             │   │
│  │ └─────────────────┘ └─────────────────┘             │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                الملخص التجميعي                        │  │
│  │  إجمالي الإيرادات: $45,000                           │  │
│  │  إجمالي المصروفات: $12,500                           │  │
│  │  صافي الربح: $32,500                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  📊 مخطط مقارنة الشقق (شريطي)                       │  │
│  │  📈 اتجاه الأرباح (خطي - آخر 12 شهر)                │  │
│  │  🥧 توزيع المصروفات حسب القسم (دائري)                │  │
│  │  🥧 مصادر الحجوزات (دائري)                           │  │
│  │  📊 نسبة الإشغال لكل شقة (شريطي)                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  📥 تصدير التقرير                                    │  │
│  │  [PDF] [Excel] [طباعة]                               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### ✅ مخرجات المرحلة 12:
- [ ] إنشاء `app/accounting/reports/page.tsx`
- [ ] إنشاء `components/accounting/reports/ProjectSummary.tsx`
- [ ] إنشاء `components/accounting/reports/ApartmentComparisonChart.tsx`
- [ ] إنشاء `components/accounting/reports/OccupancyChart.tsx`
- [ ] إنشاء `components/accounting/reports/ProfitTrendChart.tsx`
- [ ] إنشاء `components/accounting/reports/ExportButtons.tsx` (PDF/Excel)

---

## المرحلة 13: الإعدادات (Settings) ⚙️

**الصفحة:** `app/accounting/settings/page.tsx`

**الوصول:** المدير العام فقط

### المحتوى:

1. **إدارة المشاريع**: إضافة/تعديل/حذف مشاريع
2. **إدارة الشقق**: إضافة/تعديل/حذف شقق
3. **أقسام المصروفات**: تعديل القائمة المحددة
4. **سعر الصرف**: تعديل سعر تحويل العملة (USD → EGP)
5. **قائمة المشرفين**: إضافة أسماء المشرفين المتاحين للاختيار في المتابعة اليومية
6. **إدارة الفريق**: تعيين/حذف/تعديل المستخدمين وأدوارهم

### ✅ مخرجات المرحلة 13:
- [ ] إنشاء `app/accounting/settings/page.tsx`
- [ ] إنشاء components للإعدادات
- [ ] API endpoints لإدارة الإعدادات

---

## المرحلة 14: التكامل مع النظام الحالي 🔗

### 14.1 تحديث Navbar

- إضافة رابط "الحسابات" في الـ Navbar للمستخدمين المصرح لهم
- الرابط يظهر فقط لأصحاب الأدوار المعنية

### 14.2 تحديث لوحة الأدمن

- إضافة بطاقة إحصائية "نظام الحسابات" في dashboard الأدمن
- رابط سريع لنظام الحسابات

### 14.3 إشعارات (اختياري - مرحلة مستقبلية)

- إشعار عند إضافة حجز جديد (لمدير التشغيل)
- إشعار يومي بجدول الدخول/الخروج (الساعة 7 مساءً)
- إشعار عند تسجيل مسحوبات جديدة (للمستثمر)

### ✅ مخرجات المرحلة 14:
- [ ] تحديث `components/Navbar.tsx`
- [ ] تحديث `app/admin/page.tsx`
- [ ] تحديث `middleware.ts` النهائي

---

## المرحلة 15: التحسينات والاختبار 🧪

### 15.1 الأداء

- [ ] تحسين queries بالـ pagination
- [ ] استخدام `MonthlySnapshot` في Dashboard والتقارير (بدل حساب real-time)
- [ ] `prisma.aggregate` و `prisma.groupBy` في كل الحسابات (بدل `.reduce()`)
- [ ] `deletedAt: null` filter في كل where clause
- [ ] Cron job يومي لإعادة حساب snapshots كـ safety net
- [ ] Lazy loading للرسوم البيانية
- [ ] Optimistic updates للإضافات السريعة
- [ ] Database indexes للـ queries المتكررة

### 15.2 تجربة المستخدم

- [ ] Loading states بنفس تصميم الأدمن الحالي (shimmer/skeleton)
- [ ] Error handling مع رسائل عربية واضحة
- [ ] Empty states بتصميم جذاب
- [ ] Confirm dialogs قبل الحذف
- [ ] Toast notifications (إشعارات مؤقتة) عند النجاح/الفشل

### 15.3 Responsive Design

- [ ] Mobile: الجداول تتحول إلى cards
- [ ] Tablet: تصميم مرن
- [ ] Desktop: عرض كامل بالـ sidebar

### 15.4 Animations (Framer Motion)

بنفس أسلوب الموقع الحالي:
- `fadeInUp` لعرض البطاقات والأقسام
- `staggerContainer` للقوائم والجداول
- `scaleUp` لإظهار الـ Modals
- `spring` configs لحركة سلسة
- `whileHover` effects على الأزرار والكروت

### 15.5 الاختبار

- [ ] اختبار كل API endpoint
- [ ] اختبار الصلاحيات (كل دور يرى فقط ما يخصه)
- [ ] اختبار حساب الأرباح والتوزيع على المستثمرين
- [ ] اختبار جدول المتابعة اليومية (التحديث الساعة 7)
- [ ] اختبار responsive على mobile/tablet/desktop

---

## ملخص الملفات المطلوب إنشاؤها

### قاعدة البيانات
| # | الملف | الوصف |
|---|-------|-------|
| 1 | `prisma/schema.prisma` (تحديث) | إضافة النماذج والعلاقات الجديدة + Soft Delete + Indexes |

### المكتبات والأدوات
| # | الملف | الوصف |
|---|-------|-------|
| 2 | `lib/permissions.ts` | نظام الصلاحيات + `hasPermission()` + `requirePermission()` |
| 3 | `lib/accounting-auth.ts` | نمط الحماية المزدوجة (4 طبقات) |
| 4 | `lib/validations/accounting.ts` | Zod schemas |
| 5 | `lib/accounting/snapshot.ts` | `refreshMonthlySnapshot()` + حسابات DB Aggregation |
| 6 | `hooks/useDailySchedule.ts` | Hook المتابعة اليومية |

### API Routes (~27 ملف)
| # | المسار | الوصف |
|---|--------|-------|
| 7-30 | `app/api/accounting/**` | جميع الـ API endpoints |
| 31 | `app/api/cron/refresh-snapshots` | Cron إعادة حساب MonthlySnapshots |

### الصفحات (~10 صفحات)
| # | الملف | الوصف |
|---|-------|-------|
| 31 | `app/accounting/layout.tsx` | Layout + Auth |
| 32 | `app/accounting/page.tsx` | Dashboard |
| 33 | `app/accounting/apartments/page.tsx` | قائمة الشقق |
| 34 | `app/accounting/apartments/[id]/page.tsx` | تفاصيل شقة |
| 35 | `app/accounting/bookings/page.tsx` | الحجوزات |
| 36 | `app/accounting/expenses/page.tsx` | المصروفات |
| 37 | `app/accounting/daily/page.tsx` | المتابعة اليومية |
| 38 | `app/accounting/investors/page.tsx` | إدارة المستثمرين |
| 39 | `app/accounting/my-investments/page.tsx` | حسابات المستثمر |
| 40 | `app/accounting/reports/page.tsx` | التقارير |
| 41 | `app/accounting/settings/page.tsx` | الإعدادات |

### المكونات (~40 مكون)
| # | المجلد | الوصف |
|---|--------|-------|
| 42+ | `components/accounting/Sidebar.tsx` | القائمة الجانبية |
| 43+ | `components/accounting/dashboard/*` | بطاقات ورسوم بيانية |
| 44+ | `components/accounting/apartments/*` | مكونات الشقق |
| 45+ | `components/accounting/bookings/*` | مكونات الحجوزات |
| 46+ | `components/accounting/expenses/*` | مكونات المصروفات |
| 47+ | `components/accounting/daily/*` | مكونات المتابعة اليومية |
| 48+ | `components/accounting/investor/*` | مكونات المستثمر |
| 49+ | `components/accounting/reports/*` | مكونات التقارير |
| 50+ | `components/accounting/shared/*` | مكونات مشتركة (MonthPicker, DataTable, etc.) |

---

## الجدول الزمني المقترح

| المرحلة | الوصف | المدة التقديرية |
|---------|-------|---------------|
| **1** | قاعدة البيانات (Schema + Migration) | يوم واحد |
| **2** | نظام الصلاحيات | يوم واحد |
| **3** | API Routes | 3-4 أيام |
| **4** | Layout والتنقل | يوم واحد |
| **5** | لوحة التحكم | 2 أيام |
| **6** | شيت الشقق | 3 أيام |
| **7** | شيت الحجوزات | 2 أيام |
| **8** | شيت المصروفات | 2 أيام |
| **9** | المتابعة اليومية | 2 أيام |
| **10** | واجهة المستثمر | 3 أيام |
| **11** | إدارة المستثمرين | 2 أيام |
| **12** | التقارير والملخصات | 2 أيام |
| **13** | الإعدادات | يوم واحد |
| **14** | التكامل | يوم واحد |
| **15** | التحسين والاختبار | 3 أيام |
| | **المجموع** | **~28-30 يوم عمل** |

---

## مبادئ التصميم المتبعة

### الألوان (من `tailwind.config.js`)
- **Primary (ذهبي):** `#edbf8c` — للأزرار، الإبرازات، الأيقونات
- **Secondary (أخضر داكن):** `#10302b` — للنصوص، رؤوس الجداول، الأزرار الرئيسية
- **Accent (بيج):** `#ead3b9` — للخلفيات، البطاقات
- **White (أوف وايت):** `#fdf6ee` — لخلفية البطاقات

### الخطوط
- **Dubai** (العربي - الافتراضي): `font-dubai`
- **Bristone** (الإنجليزي): `font-bristone`

### حدود مدورة
- بطاقات: `rounded-xl` أو `rounded-2xl`
- أزرار: `rounded-lg`
- Modals: `rounded-2xl`
- Badges: `rounded-full`

### ظلال
- بطاقات: `shadow-soft` أو `shadow-medium`
- Hover: `shadow-large`
- Glow: `shadow-glow` (للعناصر المميزة)

### حركة (Framer Motion)
- دخول: `fadeInUp` مع `staggerContainer`
- Cards hover: `whileHover={{ y: -5, shadow: '...' }}`
- أرقام: `useCounter` للعد المتحرك
- Loading: Skeleton shimmer

### اتجاه RTL
- النظام بالكامل RTL (اتجاه من اليمين لليسار)
- Sidebar على اليمين
- الجداول محاذاة يمين
- الأيقونات مع النص على اليمين

---

## ملاحظات تقنية

1. **سعر الصرف**: يُحفظ في `CurrencyRate` ويتم تحديثه يدوياً من المدير العام
2. **الحساب التلقائي**: `عدد الليالي = checkOut - checkIn` يُحسب تلقائياً
3. **الشهر**: كل الجداول تُصفى على مستوى الشهر باستخدام query parameters
4. **Access Control**: التحقق يتم في API **وفي** الـ middleware (حماية مزدوجة)
5. **المتابعة اليومية**: Timer يتحقق كل دقيقة من الساعة الحالية للتبديل
6. **خصوصية المستثمر**: الفلترة تتم على مستوى Server (API) وليس Client فقط
7. **البيانات المشتركة**: الحجوزات والمصروفات تُدخل مرة واحدة وتظهر في كل الشيتات تلقائياً
8. **Soft Delete**: لا يتم حذف أي سجل مالي فعلياً - يُضاف `deletedAt` ويُفلتر عليه
9. **DB Aggregation**: كل الحسابات المالية تتم عبر `prisma.aggregate` وليس `.reduce()` في الذاكرة
10. **MonthlySnapshot**: ملخصات شهرية مُحسوبة مسبقاً تُحدّث تلقائياً عند كل عملية مالية
11. **Indexes**: كل query فيها فلترة متكررة لها index في قاعدة البيانات
12. **Rate Limiting**: كل API endpoint محمي بحد أقصى للطلبات

---

## ملخص التحسينات الهندسية المُطبقة

| # | التحسين | السبب | الأثر |
|---|---------|-------|-------|
| 1 | فلترة بالشهر دائماً | منع تحميل سنوات من البيانات | أداء أسرع 10x+ |
| 2 | DB Aggregation | حساب في DB بدل JavaScript | أقل RAM، أسرع، scalable |
| 3 | Soft Delete | حماية البيانات المالية | audit trail + أمان قانوني |
| 4 | حماية مزدوجة | عدم الاعتماد على Frontend | أمان متعدد الطبقات |
| 5 | MonthlySnapshot | ملخصات مُحسوبة مسبقاً | تقارير أسرع 100x |
| 6 | Database Indexes | تسريع queries المتكررة | query time < 50ms |

---

*آخر تحديث: مارس 2026*
