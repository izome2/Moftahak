# دليل رفع المشروع على Vercel

## الخطوات المطلوبة:

### 1. إعداد قاعدة بيانات PostgreSQL

يمكنك استخدام أحد مقدمي خدمات PostgreSQL التالية:

- **Vercel Postgres** (موصى به - مدمج مع Vercel)
- **Neon** (https://neon.tech) - مجاني مع SSL
- **Supabase** (https://supabase.com) - مجاني مع واجهة إدارة
- **Railway** (https://railway.app) - سهل الاستخدام

### 2. الحصول على DATABASE_URL

بعد إنشاء قاعدة البيانات، ستحصل على رابط الاتصال بالصيغة:
```
postgresql://username:password@host:port/database?sslmode=require
```

### 3. إعداد متغيرات البيئة في Vercel

في لوحة تحكم Vercel، أضف المتغيرات التالية:

#### المتغيرات المطلوبة:

1. **DATABASE_URL**
   ```
   postgresql://username:password@host:port/database?sslmode=require
   ```

2. **NEXTAUTH_URL**
   ```
   https://your-domain.vercel.app
   ```
   (سيتم تحديثه بعد أول نشر)

3. **NEXTAUTH_SECRET**
   ```
   قم بإنشاء secret عشوائي باستخدام:
   openssl rand -base64 32
   ```
   أو استخدم موقع: https://generate-secret.vercel.app/32

### 4. رفع المشروع على Vercel

#### الطريقة الأولى: استخدام Vercel CLI
```bash
# تسجيل الدخول
vercel login

# رفع المشروع (أول مرة)
vercel

# رفع للإنتاج
vercel --prod
```

#### الطريقة الثانية: ربط مع GitHub
1. ادفع الكود إلى GitHub
2. في Vercel Dashboard، اختر "Import Project"
3. اختر المستودع
4. أضف متغيرات البيئة
5. انقر "Deploy"

### 5. تهيئة قاعدة البيانات بعد النشر

بعد أول نشر ناجح، قم بتشغيل:

```bash
# إنشاء مستخدم admin
vercel env pull .env.production.local
node scripts/create-admin.js
```

أو استخدم Prisma Studio:
```bash
npx prisma studio --schema=./prisma/schema.prisma
```

### 6. ملاحظات مهمة

1. **الملفات المرفوعة**: مجلد `public/uploads` لن يتم حفظه على Vercel (serverless)
   - استخدم Vercel Blob Storage للصور
   - أو استخدم Cloudinary/AWS S3

2. **الاتصال بقاعدة البيانات**: تأكد من:
   - SSL مفعّل (sslmode=require)
   - Connection pooling مفعّل
   - استخدام @prisma/adapter-pg (موجود بالفعل)

3. **البيئة المحلية**: 
   - استخدم `.env.local` للتطوير المحلي
   - لا ترفع ملفات .env للمستودع

### 7. التحقق من النشر

بعد النشر، تحقق من:
- [ ] الصفحة الرئيسية تعمل
- [ ] التسجيل والدخول يعملان
- [ ] لوحة الإدارة تعمل
- [ ] إنشاء دراسات الجدوى يعمل
- [ ] رفع الصور يعمل (بعد إعداد Blob Storage)

### 8. أوامر مفيدة

```bash
# بناء محلي للتأكد من عدم وجود أخطاء
npm run build

# تحديث الإنتاج
vercel --prod

# عرض السجلات
vercel logs

# عرض المتغيرات
vercel env ls

# إضافة متغير جديد
vercel env add DATABASE_URL
```

## الدعم

إذا واجهت مشاكل:
1. تحقق من سجلات Vercel: `vercel logs`
2. تحقق من Build Logs في Vercel Dashboard
3. تأكد من صحة DATABASE_URL
4. تأكد من تشغيل الـ migrations بنجاح
