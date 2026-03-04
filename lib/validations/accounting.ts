/**
 * Zod Validation Schemas - نظام الحسابات
 * يُستخدم في كل API route للتحقق من صحة البيانات المُرسلة
 */

import { z } from 'zod';

// ============================================================================
// Enums (مطابقة لـ Prisma enums)
// ============================================================================

export const bookingSourceEnum = z.enum([
  'AIRBNB', 'EXTERNAL', 'DIRECT', 'BOOKING_COM', 'OTHER',
]);

export const bookingStatusEnum = z.enum([
  'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED',
]);

export const expenseCategoryEnum = z.enum([
  'CLEANING', 'INTERNET', 'WATER', 'GAS', 'ELECTRICITY',
  'MAINTENANCE', 'SUPPLIES', 'FURNITURE', 'LAUNDRY',
  'TOWELS', 'KITCHEN_SUPPLIES', 'AIR_CONDITIONING', 'OTHER',
]);

// ============================================================================
// Projects - المشاريع
// ============================================================================

export const createProjectSchema = z.object({
  name: z.string().min(1, 'اسم المشروع مطلوب').max(100),
  description: z.string().max(500).optional(),
});

export const updateProjectSchema = createProjectSchema.partial();

// ============================================================================
// Apartments - الشقق
// ============================================================================

export const createApartmentSchema = z.object({
  name: z.string().min(1, 'اسم الشقة مطلوب').max(100),
  floor: z.string().max(20).optional(),
  type: z.string().max(50).optional(),
  projectId: z.string().min(1, 'المشروع مطلوب'),
});

export const updateApartmentSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  floor: z.string().max(20).optional().nullable(),
  type: z.string().max(50).optional().nullable(),
  projectId: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

// ============================================================================
// Bookings - الحجوزات
// ============================================================================

export const createBookingSchema = z.object({
  apartmentId: z.string().min(1, 'الشقة مطلوبة'),
  clientName: z.string().min(1, 'اسم العميل مطلوب').max(100),
  clientPhone: z.string().max(20).optional(),
  checkIn: z.string().min(1, 'تاريخ الدخول مطلوب'),       // ISO date string
  checkOut: z.string().min(1, 'تاريخ الخروج مطلوب'),      // ISO date string
  nights: z.number().int().min(1, 'عدد الليالي يجب أن يكون 1 على الأقل'),
  amount: z.number().min(0, 'المبلغ لا يمكن أن يكون سالباً'),
  currency: z.string().default('USD'),
  source: bookingSourceEnum,
  arrivalTime: z.string().max(10).optional(),
  flightNumber: z.string().max(20).optional(),
  notes: z.string().max(500).optional(),
  receptionSupervisor: z.string().max(100).optional(),
  deliverySupervisor: z.string().max(100).optional(),
  status: bookingStatusEnum.optional(),
});

export const updateBookingSchema = z.object({
  clientName: z.string().min(1).max(100).optional(),
  clientPhone: z.string().max(20).optional().nullable(),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  nights: z.number().int().min(1).optional(),
  amount: z.number().min(0).optional(),
  currency: z.string().optional(),
  source: bookingSourceEnum.optional(),
  arrivalTime: z.string().max(10).optional().nullable(),
  flightNumber: z.string().max(20).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
  receptionSupervisor: z.string().max(100).optional().nullable(),
  deliverySupervisor: z.string().max(100).optional().nullable(),
  status: bookingStatusEnum.optional(),
});

// ============================================================================
// Expenses - المصروفات
// ============================================================================

export const createExpenseSchema = z.object({
  apartmentId: z.string().min(1, 'الشقة مطلوبة'),
  description: z.string().min(1, 'الوصف مطلوب').max(200),
  category: expenseCategoryEnum,
  amount: z.number().min(0, 'المبلغ لا يمكن أن يكون سالباً'),
  currency: z.string().default('USD'),
  date: z.string().min(1, 'التاريخ مطلوب'),              // ISO date string
  notes: z.string().max(500).optional(),
});

export const updateExpenseSchema = z.object({
  description: z.string().min(1).max(200).optional(),
  category: expenseCategoryEnum.optional(),
  amount: z.number().min(0).optional(),
  currency: z.string().optional(),
  date: z.string().optional(),
  notes: z.string().max(500).optional().nullable(),
});

// ============================================================================
// Apartment Investors - مستثمرو الشقة
// ============================================================================

export const addApartmentInvestorSchema = z.object({
  userId: z.string().min(1, 'المستثمر مطلوب'),
  percentage: z.number().min(0.01, 'النسبة يجب أن تكون أكبر من 0').max(1, 'النسبة لا تتجاوز 100%'),
  investmentTarget: z.number().min(0).default(0),
});

export const updateApartmentInvestorSchema = z.object({
  percentage: z.number().min(0.01).max(1).optional(),
  investmentTarget: z.number().min(0).optional(),
});

// ============================================================================
// Withdrawals - المسحوبات
// ============================================================================

export const createWithdrawalSchema = z.object({
  amount: z.number().min(0.01, 'المبلغ يجب أن يكون أكبر من 0'),
  currency: z.string().default('USD'),
  date: z.string().min(1, 'التاريخ مطلوب'),
  comments: z.string().max(500).optional(),
});

// ============================================================================
// Currency Rate - سعر الصرف
// ============================================================================

export const updateCurrencyRateSchema = z.object({
  fromCurrency: z.string().min(1).max(5).default('USD'),
  toCurrency: z.string().min(1).max(5).default('EGP'),
  rate: z.number().min(0.001, 'سعر الصرف يجب أن يكون أكبر من 0'),
});

// ============================================================================
// Query Params مشتركة
// ============================================================================

export const monthQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'الشهر يجب أن يكون بصيغة YYYY-MM').optional(),
  year: z.string().regex(/^\d{4}$/, 'السنة يجب أن تكون بصيغة YYYY').optional(),
  apartmentId: z.string().optional(),
});

// ============================================================================
// Types
// ============================================================================

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CreateApartmentInput = z.infer<typeof createApartmentSchema>;
export type UpdateApartmentInput = z.infer<typeof updateApartmentSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type AddApartmentInvestorInput = z.infer<typeof addApartmentInvestorSchema>;
export type CreateWithdrawalInput = z.infer<typeof createWithdrawalSchema>;
export type UpdateCurrencyRateInput = z.infer<typeof updateCurrencyRateSchema>;
