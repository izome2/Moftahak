/**
 * دوال مساعدة لنظام الدورات
 */

/** تحويل عنوان الدورة إلى slug آمن لـ URL */
export function generateSlug(title: string): string {
  return title
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\u0600-\u06FF\u0750-\u077Fa-zA-Z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    || `course-${Date.now()}`;
}

/** تنسيق المدة من ثواني إلى نص مقروء */
export function formatDuration(totalSeconds: number): string {
  if (totalSeconds <= 0) return '0 د';
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  
  if (hours > 0) {
    return minutes > 0 ? `${hours} س ${minutes} د` : `${hours} س`;
  }
  return `${minutes} د`;
}

/** تنسيق المدة بالإنجليزية */
export function formatDurationEn(totalSeconds: number): string {
  if (totalSeconds <= 0) return '0 min';
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  
  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  return `${minutes} min`;
}

/** تنسيق السعر بالجنيه المصري */
export function formatCoursePrice(price: number): string {
  return new Intl.NumberFormat('ar-EG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/** صيغ الفيديو المدعومة */
export const SUPPORTED_VIDEO_TYPES = [
  'video/mp4',
  'video/quicktime', // .mov
  'video/webm',
  'video/x-msvideo', // .avi
];

/** صيغ الصور المدعومة */
export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

/** الحد الأقصى لحجم الفيديو (500 ميجابايت) */
export const MAX_VIDEO_SIZE = 500 * 1024 * 1024;

/** الحد الأقصى لحجم الصورة (5 ميجابايت) */
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

/** التحقق من صلاحية ملف فيديو */
export function isValidVideoFile(file: File): { valid: boolean; error?: string } {
  if (!SUPPORTED_VIDEO_TYPES.includes(file.type)) {
    return { valid: false, error: 'نوع الملف غير مدعوم. الصيغ المدعومة: MP4, MOV, WEBM, AVI' };
  }
  if (file.size > MAX_VIDEO_SIZE) {
    return { valid: false, error: 'حجم الملف يجب أن يكون أقل من 500 ميجابايت' };
  }
  return { valid: true };
}

/** التحقق من صلاحية ملف صورة */
export function isValidImageFile(file: File): { valid: boolean; error?: string } {
  if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: 'نوع الملف غير مدعوم. الصيغ المدعومة: JPG, PNG, WebP' };
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return { valid: false, error: 'حجم الملف يجب أن يكون أقل من 5 ميجابايت' };
  }
  return { valid: true };
}
