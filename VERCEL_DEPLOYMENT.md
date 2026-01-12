# خطوات رفع مفتاحك على Vercel

## 1. قاعدة البيانات (Neon) ✅

لديك قاعدة بيانات Neon جاهزة:

### رابط الاتصال (Pooled - للإنتاج):
```
DATABASE_URL="postgresql://neondb_owner:npg_dZh7H8ECpXLB@ep-super-scene-ag89jv2d-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require"
```

### رابط الاتصال (Direct - للـ Migrations):
```
DATABASE_URL_UNPOOLED="postgresql://neondb_owner:npg_dZh7H8ECpXLB@ep-super-scene-ag89jv2d.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require"
```

**ملاحظة مهمة:** استخدم الرابط المجمع (pooled) للإنتاج!

---

## 2. إعداد متغيرات البيئة في Vercel

اذهب إلى: https://vercel.com/your-username/moftahak/settings/environment-variables

### أضف المتغيرات التالية:

#### أ) DATABASE_URL (Pooled Connection)
```
DATABASE_URL
```
**القيمة:**
```
postgresql://neondb_owner:npg_dZh7H8ECpXLB@ep-super-scene-ag89jv2d-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require
```
**البيئات:** Production, Preview, Development

---

#### ب) NEXTAUTH_SECRET (تم إنشاؤه تلقائياً)
```
NEXTAUTH_SECRET
```
**القيمة:**
```
ormt8rif6Hz801ouxNdzEwpxArp9sWQB/2w97d36BT8=
```
**البيئات:** Production, Preview, Development

---

#### ج) NEXTAUTH_URL (سيتم تحديثه بعد أول نشر)
```
NEXTAUTH_URL
```
**القيمة المؤقتة:**
```
https://moftahak.vercel.app
```
**البيئات:** Production

**ملاحظة:** بعد أول نشر، حدّث هذا الرابط بالدومين الفعلي الذي حصلت عليه من Vercel

---

## 3. تشغيل الـ Migrations على قاعدة البيانات

قبل النشر، يجب تطبيق الـ migrations على قاعدة البيانات:

### الطريقة الأولى: من الجهاز المحلي

```powershell
# اضبط DATABASE_URL مؤقتاً
$env:DATABASE_URL="postgresql://neondb_owner:npg_dZh7H8ECpXLB@ep-super-scene-ag89jv2d.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require"

# قم بتطبيق الـ migrations
npx prisma migrate deploy

# أو إذا كانت أول مرة
npx prisma db push
```

### الطريقة الثانية: من Vercel (بعد النشر)

سيتم تطبيقها تلقائياً عبر أمر `vercel-build` في package.json

---

## 4. رفع المشروع على Vercel

### أ) إنشاء مشروع جديد:

```powershell
vercel --yes
```

أو اختر الإعدادات يدوياً:
- Project Name: `moftahak`
- Framework: `Next.js`
- Build Command: سيستخدم تلقائياً من package.json
- Output Directory: `.next`

### ب) نشر للإنتاج:

```powershell
vercel --prod
```

---

## 5. إنشاء مستخدم Admin

بعد نجاح النشر:

### الطريقة الأولى: من الجهاز المحلي

```powershell
# اضبط DATABASE_URL
$env:DATABASE_URL="postgresql://neondb_owner:npg_dZh7H8ECpXLB@ep-super-scene-ag89jv2d.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require"

# أنشئ Admin
node scripts/create-admin.js
```

**بيانات الدخول الافتراضية:**
- Email: `admin@moftahak.com`
- Password: `Admin@2026`

### الطريقة الثانية: من Prisma Studio

```powershell
$env:DATABASE_URL="postgresql://neondb_owner:npg_dZh7H8ECpXLB@ep-super-scene-ag89jv2d.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require"
npx prisma studio
```

---

## 6. التحقق من النشر

بعد النشر، تحقق من:

- ✅ الصفحة الرئيسية: `https://your-domain.vercel.app`
- ✅ التسجيل والدخول: `/` (النموذج المنبثق)
- ✅ لوحة الإدارة: `/admin` (استخدم بيانات Admin)
- ✅ إنشاء دراسات الجدوى: `/admin/feasibility/new`

---

## 7. مشكلة رفع الصور (مهم!)

Vercel هي بيئة serverless، مما يعني أن الملفات المرفوعة ستُحذف بعد كل نشر.

### الحل: استخدام Vercel Blob Storage

#### أ) تثبيت الحزمة:

```powershell
npm install @vercel/blob
```

#### ب) تحديث API رفع الصور:

سيتم تحديث `app/api/user/upload/route.ts` لاستخدام Vercel Blob

#### ج) إنشاء Blob Store:

1. اذهب إلى Vercel Dashboard
2. اختر Storage → Create Database → Blob
3. اربطه بمشروعك

---

## 8. أوامر مفيدة

```powershell
# عرض معلومات المشروع
vercel ls

# عرض السجلات
vercel logs

# عرض متغيرات البيئة
vercel env ls

# سحب متغيرات البيئة محلياً
vercel env pull .env.production.local

# إلغاء ربط المشروع (إذا أردت البدء من جديد)
vercel unlink

# نشر فرع معين
vercel --prod
```

---

## 9. التحديثات المستقبلية

### نشر تلقائي من Git (موصى به):

1. ادفع الكود إلى GitHub
2. في Vercel Dashboard، اختر "Import Git Repository"
3. اربط المستودع
4. كل Push سيؤدي لنشر تلقائي!

### نشر يدوي:

```powershell
# للـ Preview
vercel

# للإنتاج
vercel --prod
```

---

## 10. استكشاف الأخطاء

### خطأ في Database Connection:

```
Error: P1001: Can't reach database server
```

**الحل:**
- تأكد من صحة DATABASE_URL
- تأكد من أن `sslmode=require` موجود في الرابط
- جرب الرابط المباشر (غير pooled) للـ migrations

### خطأ في NextAuth:

```
Error: NEXTAUTH_SECRET missing
```

**الحل:**
- تأكد من إضافة NEXTAUTH_SECRET في Vercel
- تأكد من إضافة NEXTAUTH_URL بالدومين الصحيح

### خطأ في Build:

```
Error: Prisma Client not generated
```

**الحل:**
- تأكد من أن `postinstall: prisma generate` موجود في package.json
- أعد النشر: `vercel --prod --force`

---

## الخطوة التالية: 🚀

قم بتنفيذ الخطوات من 2 إلى 5 بالترتيب، وسيكون موقعك جاهزاً!
