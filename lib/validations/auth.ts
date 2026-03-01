import { z } from 'zod';

// Validate Egyptian phone number (01x xxxxxxxx or +201xxxxxxxxx or 201xxxxxxxxx)
const isValidEgyptianPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  
  // 201xxxxxxxxx (12 digits with country code - normalized format)
  if (cleaned.length === 12 && cleaned.startsWith('20')) {
    const withoutCountry = cleaned.substring(2); // Remove '20' -> 1095058413
    // Check for valid prefixes (10, 11, 12, 15)
    const validPrefixes = ['10', '11', '12', '15'];
    return validPrefixes.some(prefix => withoutCountry.startsWith(prefix));
  }
  
  // 01x xxxxxxxx (11 digits)
  if (cleaned.length === 11 && cleaned.startsWith('01')) {
    const validPrefixes = ['010', '011', '012', '015'];
    return validPrefixes.some(prefix => cleaned.startsWith(prefix));
  }
  
  // 1x xxxxxxxx (10 digits without leading 0)
  if (cleaned.length === 10 && cleaned.startsWith('1')) {
    const validPrefixes = ['10', '11', '12', '15'];
    return validPrefixes.some(prefix => cleaned.startsWith(prefix));
  }
  
  return false;
};

// Validate Saudi phone number (5x xxxxxxxx or +9665xxxxxxxx)
const isValidSaudiPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  
  // +966 5x xxxxxxxx (12 digits with country code)
  if (cleaned.length === 12 && cleaned.startsWith('966')) {
    const withoutCountry = cleaned.substring(3); // Remove '966'
    return /^5[0-9]{8}$/.test(withoutCountry);
  }
  
  // 05x xxxxxxxx (10 digits)
  if (cleaned.length === 10 && cleaned.startsWith('05')) {
    return /^05[0-9]{8}$/.test(cleaned);
  }
  
  // 5x xxxxxxxx (9 digits without leading 0)
  if (cleaned.length === 9 && cleaned.startsWith('5')) {
    return /^5[0-9]{8}$/.test(cleaned);
  }
  
  return false;
};

// Check if input is email or phone
export const isEmail = (input: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
};

export const isPhone = (input: string): boolean => {
  return isValidEgyptianPhone(input) || isValidSaudiPhone(input);
};

// Normalize phone number - clean and format for storage/API calls
export const normalizePhone = (input: string): string => {
  const cleaned = input.replace(/\D/g, '');
  
  // Egyptian with country code (2010xxxxxxxx or 201xxxxxxxxx)
  if (cleaned.startsWith('20') && cleaned.length >= 12) {
    return cleaned; // Keep as is (201095058413)
  }
  
  // Egyptian local (01xxxxxxxxx)
  if (cleaned.startsWith('01') && cleaned.length === 11) {
    return `20${cleaned.substring(1)}`; // Convert 01095058413 to 201095058413
  }
  
  // Egyptian without leading 0 (1xxxxxxxxx)
  if (cleaned.startsWith('1') && cleaned.length === 10) {
    return `20${cleaned}`; // Convert 1095058413 to 201095058413
  }
  
  // Saudi with country code (9665xxxxxxxx)
  if (cleaned.startsWith('966') && cleaned.length === 12) {
    return cleaned; // Keep as is
  }
  
  // Saudi local (05xxxxxxxx)
  if (cleaned.startsWith('05') && cleaned.length === 10) {
    return `966${cleaned.substring(1)}`; // Convert 0512345678 to 966512345678
  }
  
  // Saudi without leading 0 (5xxxxxxxx)
  if (cleaned.startsWith('5') && cleaned.length === 9) {
    return `966${cleaned}`; // Convert 512345678 to 966512345678
  }
  
  // Return cleaned as fallback
  return cleaned;
};

// Detect if input LOOKS LIKE a phone number (even partially typed)
// This is used for UI hints (icon change) while user is typing
export const looksLikePhone = (input: string): boolean => {
  const trimmed = input.trim();
  
  // Starts with international codes
  if (/^(\+20|\+966|20|966)/.test(trimmed)) {
    return true;
  }
  
  // Starts with Egyptian mobile prefixes (010, 011, 012, 015, 10, 11, 12, 15)
  if (/^(010|011|012|015|10|11|12|15)/.test(trimmed)) {
    return true;
  }
  
  // Starts with Saudi mobile prefix (05 or 5)
  if (/^(05|5\d)/.test(trimmed)) {
    return true;
  }
  
  // All digits and at least 3 chars (likely phone)
  if (/^\d{3,}$/.test(trimmed)) {
    return true;
  }
  
  return false;
};

// Login Schema - supports email or phone
export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, 'البريد الإلكتروني أو رقم الهاتف مطلوب')
    .refine((val) => isEmail(val) || isPhone(val), {
      message: 'يرجى إدخال بريد إلكتروني أو رقم هاتف صالح',
    }),
  password: z
    .string()
    .min(1, 'كلمة المرور مطلوبة'),
});

// Register Schema - supports email or phone
export const registerSchema = z.object({
  firstName: z
    .string()
    .min(2, 'الاسم الأول يجب أن يكون حرفين على الأقل')
    .max(50, 'الاسم الأول طويل جداً'),
  lastName: z
    .string()
    .min(2, 'اسم العائلة يجب أن يكون حرفين على الأقل')
    .max(50, 'اسم العائلة طويل جداً'),
  email: z
    .string()
    .email('البريد الإلكتروني غير صالح')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .optional()
    .or(z.literal('')),
  password: z
    .string()
    .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    .regex(/[a-z]/, 'كلمة المرور يجب أن تحتوي على حرف صغير')
    .regex(/[A-Z]/, 'كلمة المرور يجب أن تحتوي على حرف كبير')
    .regex(/[0-9]/, 'كلمة المرور يجب أن تحتوي على رقم'),
  confirmPassword: z.string(),
  phoneVerified: z.boolean().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'كلمة المرور غير متطابقة',
  path: ['confirmPassword'],
}).refine((data) => data.email || data.phone, {
  message: 'يجب إدخال البريد الإلكتروني أو رقم الهاتف',
  path: ['email'],
});

// Update Profile Schema
export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(2, 'الاسم الأول يجب أن يكون حرفين على الأقل')
    .max(50, 'الاسم الأول طويل جداً')
    .optional(),
  lastName: z
    .string()
    .min(2, 'اسم العائلة يجب أن يكون حرفين على الأقل')
    .max(50, 'اسم العائلة طويل جداً')
    .optional(),
  image: z.string().optional(),
});

// Change Password Schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'كلمة المرور الحالية مطلوبة'),
  newPassword: z
    .string()
    .min(8, 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل')
    .regex(/[a-z]/, 'كلمة المرور يجب أن تحتوي على حرف صغير')
    .regex(/[A-Z]/, 'كلمة المرور يجب أن تحتوي على حرف كبير')
    .regex(/[0-9]/, 'كلمة المرور يجب أن تحتوي على رقم'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'كلمة المرور غير متطابقة',
  path: ['confirmPassword'],
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
