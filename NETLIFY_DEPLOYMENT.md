# 🚀 دليل نشر الموقع على Netlify

## ✅ تم الإعداد بنجاح:
- ✅ إعادة إعدادات Next.js الكاملة (SSR + API Support)
- ✅ إعادة الملفات الديناميكية (sitemap, robots, manifest)
- ✅ إنشاء ملف `netlify.toml` للتكوين
- ✅ المشروع جاهز للنشر على Netlify

---

## 🔥 لماذا Netlify أفضل؟

| الميزة | Netlify | Static Hosting |
|--------|---------|----------------|
| Deploy تلقائي من GitHub | ✅ | ❌ |
| يدعم Next.js (SSR + API) | ✅ | ❌ |
| SSL/HTTPS تلقائي | ✅ | يدوي |
| ربط Domain | سهل جداً | معقد |
| CI/CD | ✅ | ❌ |
| Serverless Functions | ✅ | ❌ |
| Image Optimization | ✅ | ❌ |
| Preview Deployments | ✅ | ❌ |

---

## 📋 خطوات النشر على Netlify

### 1️⃣ رفع المشروع على GitHub (إن لم يكن مرفوعاً)

```powershell
# تهيئة Git (إن لم يكن موجود)
git init

# إضافة كل الملفات
git add .

# عمل Commit
git commit -m "Ready for Netlify deployment"

# ربط مع GitHub Repository الموجود
git remote add origin https://github.com/izome2/Moftahak.git

# رفع الكود (إذا كانت أول مرة)
git push -u origin main

# للتحديثات اللاحقة
git push
```

### 2️⃣ إنشاء حساب Netlify

1. افتح [https://netlify.com](https://netlify.com)
2. اضغط **Sign up** (التسجيل)
3. اختر **Sign up with GitHub** لربط حسابك مباشرة
4. وافق على الصلاحيات المطلوبة

### 3️⃣ ربط Repository وإطلاق الموقع

1. من لوحة Netlify، اضغط **Add new site**
2. اختر **Import an existing project**
3. اختر **Deploy with GitHub**
4. اختر Repository: **izome2/Moftahak**
5. اضغط **Authorize Netlify** إذا طُلب منك

### 4️⃣ إعدادات Build

سيملأها Netlify تلقائياً من `netlify.toml`، لكن تأكد:

```yaml
Branch to deploy: main
Build command: npm run build
Publish directory: .next
```

6. اضغط **Deploy site** 🚀

### 5️⃣ انتظر Build (2-5 دقائق)

- سترى شاشة **Deploying**
- انتظر حتى يظهر **Published** ✅
- سيعطيك رابط مثل: `https://moftahak-abc123.netlify.app`

---

## 🌐 ربط Domain الخاص بك (اختياري)

### إذا كان عندك Domain:

1. من لوحة Netlify → **Domain settings**
2. اضغط **Add custom domain**
3. اكتب: `moftahak.com`
4. اضغط **Verify**

### إعدادات DNS:

**الطريقة الأسهل - Netlify DNS:**
- انقل الـ Nameservers في GoDaddy إلى:
  ```
  dns1.p01.nsone.net
  dns2.p01.nsone.net
  dns3.p01.nsone.net
  dns4.p01.nsone.net
  ```

**أو استخدم A Record:**
- أضف A Record في GoDaddy يشير إلى IP الخاص بـ Netlify
- سيظهر لك في Dashboard

### HTTPS تلقائي:
- Netlify سيفعّل SSL Certificate مجاني (Let's Encrypt)
- انتظر 5-10 دقائق

---

## 🔄 التحديثات التلقائية

**الميزة الأقوى:**

كل مرة تعمل Push لـ GitHub:
1. ✅ Build تلقائي
2. ✅ Deploy تلقائي
3. ✅ Preview للتغييرات

```powershell
# عدّل أي ملف
git add .
git commit -m "Update content"
git push

# 🎉 Netlify سينشر التحديثات تلقائياً!
```

---

## ⚙️ إعدادات متقدمة

### Environment Variables

من Dashboard → **Site settings** → **Environment variables**

```
NODE_VERSION=18
NEXT_PUBLIC_SITE_URL=https://moftahak.com
```

### Custom Redirects

في `netlify.toml`:

```toml
[[redirects]]
  from = "/old-page"
  to = "/new-page"
  status = 301
```

---

## 🔧 حل المشاكل

### ❌ Build Failed

```toml
# أضف في netlify.toml
[build.environment]
  NODE_VERSION = "18"
```

### ❌ الصور لا تظهر

```tsx
// استخدم مسارات مطلقة
<Image src="/images/hero.jpg" alt="Hero" />
```

---

## ✨ الموقع الآن على Netlify!

### الميزات المفعّلة:
- ✅ SSR (Server-Side Rendering)
- ✅ API Routes Support
- ✅ Image Optimization
- ✅ Automatic HTTPS
- ✅ Continuous Deployment
- ✅ Global CDN
- ✅ Sitemap + Robots + Manifest

### التكلفة:

**Free Plan (كافي لمعظم المواقع):**
- ✅ 100 GB Bandwidth شهرياً
- ✅ 300 Build دقيقة شهرياً
- ✅ Sites غير محدودة
- ✅ SSL مجاني
- ✅ CDN عالمي

---

## 🎉 استمتع بموقعك!

**رابط Netlify Dashboard:**
https://app.netlify.com

**Documentation:**
https://docs.netlify.com/integrations/frameworks/next-js/

**بالتوفيق!** 🚀
