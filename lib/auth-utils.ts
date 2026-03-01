import { auth } from './auth';
import { redirect } from 'next/navigation';

/**
 * دوال مساعدة للتحقق من الصلاحيات والمصادقة
 */

/**
 * التحقق من أن المستخدم مسجل دخول
 * @returns معلومات المستخدم أو يعيد توجيه للصفحة الرئيسية
 */
export async function requireAuth() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/');
  }
  
  return session.user;
}

/**
 * التحقق من أن المستخدم أدمن
 * @returns معلومات المستخدم أو يعيد توجيه للصفحة الرئيسية
 */
export async function requireAdmin() {
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/');
  }
  
  return session.user;
}

/**
 * التحقق من أن المستخدم أدمن (للـ API)
 * @returns true إذا كان أدمن، false إذا لم يكن
 */
export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  return session?.user?.role === 'ADMIN';
}

/**
 * التحقق من أن المستخدم مسجل دخول (للـ API)
 * @returns true إذا كان مسجل دخول، false إذا لم يكن
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await auth();
  return !!session?.user;
}

/**
 * الحصول على المستخدم الحالي
 * @returns معلومات المستخدم أو null
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user || null;
}

/**
 * التحقق من أن المستخدم يملك صلاحية معينة
 * @param userId - ID المستخدم المطلوب التحقق منه
 * @returns true إذا كان المستخدم الحالي هو نفسه أو أدمن
 */
export async function canAccessUser(userId: string): Promise<boolean> {
  const session = await auth();
  
  if (!session?.user) {
    return false;
  }
  
  // الأدمن يمكنه الوصول لكل المستخدمين
  if (session.user.role === 'ADMIN') {
    return true;
  }
  
  // المستخدم يمكنه الوصول لملفه الشخصي فقط
  return session.user.id === userId;
}
