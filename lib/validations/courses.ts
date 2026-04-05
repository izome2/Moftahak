import { z } from 'zod';

// قبول URLs كاملة أو مسارات محلية (/uploads/...)
const urlOrPath = z.string().refine(
  (val) => val.startsWith('http://') || val.startsWith('https://') || val.startsWith('/'),
  { message: 'رابط غير صالح' }
);

// مخطط إنشاء دورة
export const createCourseSchema = z.object({
  title: z.string().min(3, 'اسم الدورة يجب أن يكون 3 أحرف على الأقل').max(200),
  description: z.string().min(10, 'الوصف يجب أن يكون 10 أحرف على الأقل'),
  shortDescription: z.string().max(300).optional(),
  price: z.number().min(0, 'السعر يجب أن يكون 0 أو أكثر'),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  features: z.array(z.string()).optional(),
  thumbnailUrl: urlOrPath.optional().nullable(),
  previewVideoUrl: urlOrPath.optional().nullable(),
});

// مخطط تحديث دورة
export const updateCourseSchema = createCourseSchema.partial().extend({
  isPublished: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

// مخطط إنشاء قسم
export const createSectionSchema = z.object({
  title: z.string().min(1, 'عنوان القسم مطلوب').max(200),
  sortOrder: z.number().int().min(0).optional(),
});

// مخطط تحديث قسم
export const updateSectionSchema = createSectionSchema.partial();

// مخطط إنشاء درس
export const createLessonSchema = z.object({
  title: z.string().min(1, 'عنوان الدرس مطلوب').max(200),
  description: z.string().max(1000).optional(),
  videoUrl: urlOrPath,
  duration: z.number().int().min(0).default(0),
  sortOrder: z.number().int().min(0).optional(),
  isFree: z.boolean().default(false),
});

// مخطط تحديث درس
export const updateLessonSchema = createLessonSchema.partial();

// مخطط طلب اشتراك
export const enrollCourseSchema = z.object({
  courseId: z.string().min(1),
  phone: z.string().min(10).max(15),
  isPhoneVerified: z.literal(true, {
    message: 'يرجى التحقق من رقم الهاتف',
  }),
});

// مخطط تعليق
export const commentSchema = z.object({
  content: z.string().min(1, 'التعليق لا يمكن أن يكون فارغاً').max(2000),
  parentId: z.string().optional(),
});

// مخطط تقييم
export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});
