import { z } from 'zod';

// أنواع العقارات
export const PropertyTypeEnum = z.enum([
  'APARTMENT',
  'VILLA', 
  'STUDIO',
  'DUPLEX',
  'PENTHOUSE',
  'CHALET',
  'OTHER'
]);

// أنواع الدراسة
export const StudyRequestTypeEnum = z.enum([
  'WITHOUT_FIELD_VISIT',
  'WITH_FIELD_VISIT'
]);

// ترجمة أنواع العقارات
export const propertyTypeLabels: Record<string, string> = {
  APARTMENT: 'شقة',
  VILLA: 'فيلا',
  STUDIO: 'استوديو',
  DUPLEX: 'دوبلكس',
  PENTHOUSE: 'بنتهاوس',
  CHALET: 'شاليه',
  OTHER: 'أخرى',
};

// ترجمة أنواع الدراسة
export const studyTypeLabels: Record<string, string> = {
  WITHOUT_FIELD_VISIT: 'بدون نزول ميداني',
  WITH_FIELD_VISIT: 'مع نزول ميداني',
};

// مخطط التحقق من الخطوة 1 - البيانات الأساسية
export const step1Schema = z.object({
  fullName: z
    .string()
    .min(4, 'الاسم يجب أن يكون 4 أحرف على الأقل')
    .max(100, 'الاسم طويل جداً'),
  propertyType: PropertyTypeEnum,
  city: z
    .string()
    .min(2, 'اسم المدينة مطلوب')
    .max(100, 'اسم المدينة طويل جداً'),
  district: z
    .string()
    .min(2, 'اسم الحي مطلوب')
    .max(100, 'اسم الحي طويل جداً'),
});

// مخطط التحقق من الخطوة 2 - بيانات الشقة والموقع وبيانات التواصل
export const step2Schema = z.object({
  bedrooms: z.number().min(0, 'الحد الأدنى 0').max(10, 'الحد الأقصى 10'),
  livingRooms: z.number().min(0, 'الحد الأدنى 0').max(5, 'الحد الأقصى 5'),
  kitchens: z.number().min(0, 'الحد الأدنى 0').max(3, 'الحد الأقصى 3'),
  bathrooms: z.number().min(0, 'الحد الأدنى 0').max(5, 'الحد الأقصى 5'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  phoneNumber: z
    .string()
    .regex(/^(01[0125][0-9]{8})?$/, 'رقم هاتف مصري غير صالح')
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .email('البريد الإلكتروني غير صالح'),
});

// مخطط التحقق الكامل لطلب دراسة الجدوى
export const feasibilityRequestSchema = z.object({
  studyType: StudyRequestTypeEnum,
  ...step1Schema.shape,
  ...step2Schema.shape,
});

// مخطط التحقق من البريد الإلكتروني
export const emailVerificationSchema = z.object({
  email: z
    .string()
    .email('البريد الإلكتروني غير صالح'),
  name: z.string().optional(),
});

// مخطط التحقق من رمز OTP
export const verifyCodeSchema = z.object({
  verificationId: z.string(),
  code: z
    .string()
    .length(6, 'رمز التحقق يجب أن يكون 6 أرقام')
    .regex(/^\d{6}$/, 'رمز التحقق يجب أن يحتوي على أرقام فقط'),
});

// أنواع TypeScript
export type PropertyType = z.infer<typeof PropertyTypeEnum>;
export type StudyRequestType = z.infer<typeof StudyRequestTypeEnum>;
export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type FeasibilityRequestData = z.infer<typeof feasibilityRequestSchema>;
export type EmailVerificationData = z.infer<typeof emailVerificationSchema>;
export type VerifyCodeData = z.infer<typeof verifyCodeSchema>;

// نوع بيانات النموذج مع خصائص إضافية
export interface FeasibilityRequestFormData extends Omit<FeasibilityRequestData, 'isEmailVerified'> {
  isEmailVerified: boolean;
  latitude?: number;
  longitude?: number;
  phoneNumber?: string;
}

// البيانات الافتراضية للفورم
export const defaultFormData: Omit<FeasibilityRequestFormData, 'studyType'> = {
  fullName: '',
  email: '',
  isEmailVerified: false,
  propertyType: 'APARTMENT',
  city: '',
  district: '',
  bedrooms: 0,
  livingRooms: 0,
  kitchens: 0,
  bathrooms: 0,
  latitude: undefined,
  longitude: undefined,
  phoneNumber: '',
};
