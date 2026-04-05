// =============================================
// أنواع نظام الدورات التدريبية
// Courses System Types
// =============================================

// --- Enums ---

export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type EnrollmentStatus = 'PENDING' | 'CONFIRMED' | 'EXPIRED' | 'REFUNDED';

// --- Core Models ---

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  price: number;
  currency: string;
  thumbnailUrl: string | null;
  previewVideoUrl: string | null;
  features: string[] | null;
  level: CourseLevel;
  isPublished: boolean;
  sortOrder: number;
  totalDuration: number;
  lessonsCount: number;
  adminId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CourseSection {
  id: string;
  title: string;
  sortOrder: number;
  courseId: string;
  lessons: CourseLesson[];
  createdAt: string;
  updatedAt: string;
}

export interface CourseLesson {
  id: string;
  title: string;
  description: string | null;
  videoUrl: string;
  duration: number;
  sortOrder: number;
  isFree: boolean;
  sectionId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CourseEnrollment {
  id: string;
  status: EnrollmentStatus;
  paymentCode: string;
  userId: string;
  courseId: string;
  phone: string;
  phoneVerified: boolean;
  amount: number;
  completedLessons: number;
  lastAccessedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LessonProgress {
  id: string;
  watchedSeconds: number;
  lastPosition: number;
  userId: string;
  lessonId: string;
  createdAt: string;
  updatedAt: string;
}

export interface LessonComment {
  id: string;
  content: string;
  userId: string;
  lessonId: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  // Populated relations
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    image: string | null;
  };
  replies?: LessonComment[];
}

export interface LessonLike {
  id: string;
  userId: string;
  lessonId: string;
  createdAt: string;
}

export interface CourseReview {
  id: string;
  rating: number;
  comment: string | null;
  userId: string;
  courseId: string;
  createdAt: string;
  updatedAt: string;
  // Populated
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    image: string | null;
  };
}

// --- API Response Types ---

export interface CourseWithDetails extends Course {
  sections: CourseSection[];
  _count?: {
    enrollments: number;
    reviews: number;
  };
  averageRating?: number;
}

export interface CourseCardData {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  price: number;
  currency: string;
  thumbnailUrl: string | null;
  level: CourseLevel;
  totalDuration: number;
  lessonsCount: number;
  enrollmentsCount: number;
  averageRating: number;
  reviewsCount: number;
}

export interface EnrollmentWithRelations extends CourseEnrollment {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    image: string | null;
  };
  course: {
    id: string;
    title: string;
    slug: string;
    price: number;
    thumbnailUrl: string | null;
  };
}

// --- Form / Input Types ---

export interface CreateCourseInput {
  title: string;
  description: string;
  shortDescription?: string;
  price: number;
  level: CourseLevel;
  features?: string[];
  thumbnailUrl?: string;
  previewVideoUrl?: string;
}

export interface UpdateCourseInput extends Partial<CreateCourseInput> {
  isPublished?: boolean;
  sortOrder?: number;
}

export interface CreateSectionInput {
  title: string;
  sortOrder?: number;
}

export interface CreateLessonInput {
  title: string;
  description?: string;
  videoUrl: string;
  duration: number;
  sortOrder?: number;
  isFree?: boolean;
}

export interface EnrollCourseInput {
  courseId: string;
  phone: string;
  isPhoneVerified: boolean;
}

export interface VideoUploadProgress {
  fileName: string;
  progress: number; // 0-100
  status: 'uploading' | 'completed' | 'error';
  url?: string;
  error?: string;
}
