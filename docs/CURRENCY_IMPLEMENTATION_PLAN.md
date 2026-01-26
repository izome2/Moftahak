# خطة تنفيذ تحويل العملات في دراسة الجدوى

## الهدف
تغيير رمز العملة من `ج.م` (جنيه مصري) إلى `ر.س` (ريال سعودي) أو `$` (دولار أمريكي) في جميع أنحاء دراسة الجدوى **بدون تحويل الأرقام**.

---

## المرحلة 1: إنشاء نظام العملات ✅
### الملفات المطلوبة:
- `lib/feasibility/currency.ts` - ملف تعريف العملات ووظائف المساعدة

### المحتوى:
- تعريف العملات المدعومة (EGP, SAR, USD)
- وظيفة `getCurrencySymbol(code)` للحصول على رمز العملة
- وظيفة `formatPriceWithCurrency(price, currencyCode)` لتنسيق السعر مع الرمز

---

## المرحلة 2: إضافة العملة للـ Context ✅
### الملف: `contexts/FeasibilityEditorContext.tsx`

### التغييرات:
- إضافة `currency` و `setCurrency` للحالة
- إضافة `CurrencyCode` type

---

## المرحلة 3: إنشاء زر تحديد العملة ✅
### الملف الجديد: `components/feasibility/shared/CurrencySelector.tsx`

### الوظيفة:
- زر بجانب أزرار المعاينة والمشاركة
- عند النقر يفتح نافذة/قائمة منسدلة
- خيارات: ج.م | ر.س | $
- عند الاختيار يتم تغيير العملة في الـ Context

---

## المرحلة 4: تحديث شريط الأدوات (EditorToolbar) ✅
### الملف: `components/feasibility/editor/EditorToolbar.tsx`

### التغييرات:
- استيراد وإضافة `CurrencySelector`
- وضعه بين زر المعاينة وزر المشاركة

---

## المرحلة 5: إنشاء Hook لتنسيق الأسعار ✅
### الملف الجديد: `hooks/useCurrencyFormatter.ts`

### الوظيفة:
- يستخدم العملة من الـ Context
- يوفر دالة `formatPrice(amount)` ترجع السعر مع رمز العملة الصحيح
- يوفر `currencySymbol` لاستخدامه مباشرة

---

## المرحلة 6: تحديث المكونات لاستخدام العملة الديناميكية ✅
### الملفات المطلوب تحديثها:

#### عناصر المكتبة:
- `components/feasibility/editor/DraggableItem.tsx`
- `components/feasibility/editor/DragOverlay.tsx`
- `components/feasibility/shared/ItemWidget.tsx`
- `components/feasibility/shared/ItemLibrary.tsx`
- `components/feasibility/shared/AddCustomItemModal.tsx`

#### رأس الأقسام (Room Headers):
- `components/feasibility/shared/RoomHeader.tsx`

#### ملخص التكاليف:
- `components/feasibility/slides/CostSummarySlide.tsx`

#### شرائح الغرف:
- `components/feasibility/elements/BedroomSlide.tsx`
- `components/feasibility/elements/BathroomSlide.tsx`
- `components/feasibility/elements/KitchenSlide.tsx`
- `components/feasibility/elements/LivingRoomSlide.tsx`

#### الشقق المحيطة:
- `components/feasibility/elements/ApartmentCard.tsx`

#### الإحصائيات والمخططات:
- `components/feasibility/elements/ComparisonChart.tsx`
- `components/feasibility/elements/CostChart.tsx`

#### أخرى:
- `components/feasibility/elements/KitchenItem.tsx`
- `components/feasibility/elements/KitchenItemsLibrary.tsx`

---

## المرحلة 7: تحديث العارض (Viewer) للدراسات المشاركة
### الملف: `app/study/[shareId]/page.tsx`

### التغييرات:
- إضافة العملة كـ prop أو استخدام provider منفصل
- التأكد من أن العملة المحفوظة تُعرض بشكل صحيح

---

## ملاحظات التنفيذ

### الأولوية:
1. ✅ إنشاء ملف العملات
2. ✅ تحديث الـ Context
3. ✅ إنشاء زر الاختيار
4. ✅ تحديث الـ Toolbar
5. ✅ تحديث المكونات الرئيسية

### نمط الاستخدام:
```tsx
// قبل
{formatPrice(totalCost)} ج.م

// بعد
{formatPrice(totalCost)} {currencySymbol}
// أو
{formatPriceWithCurrency(totalCost)}
```

### ملاحظة مهمة:
- لا يتم تحويل القيمة العددية
- فقط يتغير الرمز من ج.م إلى ر.س أو $
- العملة الافتراضية هي ج.م (EGP)

---

## حالة التنفيذ

| المرحلة | الحالة |
|---------|--------|
| المرحلة 1 | ✅ مكتمل |
| المرحلة 2 | ✅ مكتمل |
| المرحلة 3 | ✅ مكتمل |
| المرحلة 4 | ✅ مكتمل |
| المرحلة 5 | ✅ مكتمل |
| المرحلة 6 | ✅ مكتمل |
| المرحلة 7 | ✅ مكتمل |

## الملفات المحدثة

### المكونات المحدثة لدعم العملة الديناميكية:
- ✅ `components/feasibility/shared/RoomHeader.tsx`
- ✅ `components/feasibility/shared/ItemWidget.tsx`
- ✅ `components/feasibility/slides/CostSummarySlide.tsx`
- ✅ `components/feasibility/elements/BedroomSlide.tsx`
- ✅ `components/feasibility/elements/BathroomSlide.tsx`
- ✅ `components/feasibility/elements/KitchenSlide.tsx`
- ✅ `components/feasibility/elements/LivingRoomSlide.tsx`
- ✅ `components/feasibility/elements/StatisticsSlide.tsx`
- ✅ `components/feasibility/elements/NearbyApartmentsSlide.tsx`
- ✅ `components/feasibility/elements/RoomCard.tsx`
- ✅ `components/feasibility/elements/MapSlide.tsx`
- ✅ `app/admin/feasibility/page.tsx`

### المرحلة 7 - ملفات العارض:
- ✅ `prisma/schema.prisma` - إضافة حقل `currency`
- ✅ `app/api/admin/feasibility/[id]/route.ts` - دعم حفظ العملة
- ✅ `app/api/feasibility/[shareId]/route.ts` - إرجاع العملة للعارض
- ✅ `components/feasibility/viewer/CurrencyContext.tsx` - Context جديد للعارض
- ✅ `hooks/useCurrencyFormatter.ts` - دعم ViewerCurrencyContext
- ✅ `components/feasibility/viewer/StudyViewer.tsx` - استخدام CurrencyProvider
- ✅ `app/study/[shareId]/page.tsx` - تمرير العملة للعارض
- ✅ `app/admin/feasibility/[id]/page.tsx` - حفظ العملة مع الدراسة
