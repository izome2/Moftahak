'use client';

/**
 * صفحة إدارة المستخدمين - تصميم احترافي
 * 
 * تصميم متوافق مع صفحة دراسات الجدوى:
 * - بطاقات بزوايا rounded-2xl
 * - ظلال احترافية
 * - تأثير shimmer عند hover
 * - ألوان متناسقة مع التصميم العام
 */

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Users, 
  Shield, 
  ShieldOff, 
  MoreVertical,
  Mail,
  Calendar,
  Loader2,
  AlertCircle,
  RefreshCw,
  UserCog,
  Trash2,
  Eye,
  Crown
} from 'lucide-react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// ============================================
// 🎨 DESIGN TOKENS
// ============================================

const SHADOWS = {
  card: 'rgba(237, 191, 140, 0.15) 0px 4px 20px',
  cardHover: 'rgba(237, 191, 140, 0.25) 0px 8px 30px',
  button: 'rgba(16, 48, 43, 0.15) 0px 4px 12px',
  icon: 'rgba(237, 191, 140, 0.3) 0px 4px 12px',
  popup: 'rgba(16, 48, 43, 0.25) 0px 25px 50px -12px',
};

// ============================================
// 📋 TYPES
// ============================================

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'USER' | 'ADMIN';
  image?: string;
  createdAt: string;
}

// ============================================
// 🎯 ROLE CONFIG
// ============================================

const roleConfig: Record<string, { 
  label: string; 
  bgColor: string;
  textColor: string;
  borderColor: string;
  icon: React.ElementType;
}> = {
  ADMIN: { 
    label: 'مسؤول', 
    bgColor: 'bg-emerald-400/15',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-500/30',
    icon: Crown
  },
  USER: { 
    label: 'مستخدم', 
    bgColor: 'bg-blue-500/10',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-500/30',
    icon: Users
  },
};

// ============================================
// 🧩 USER CARD COMPONENT
// ============================================

interface UserCardProps {
  user: User;
  index: number;
  onToggleRole: (userId: string, currentRole: string) => void;
  onDelete: (userId: string) => void;
  menuOpen: string | null;
  setMenuOpen: (id: string | null) => void;
  actionLoading: string | null;
  currentUserId?: string;
}

const UserCard: React.FC<UserCardProps> = ({ 
  user, 
  index, 
  onToggleRole,
  onDelete,
  menuOpen,
  setMenuOpen,
  actionLoading,
  currentUserId
}) => {
  const role = roleConfig[user.role] || roleConfig.USER;
  const RoleIcon = role.icon;
  const isCurrentUser = user.id === currentUserId;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ 
        duration: 0.4,
        delay: index * 0.08,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      whileHover={{ y: -4 }}
      className={`group relative bg-white border-2 border-primary/20 rounded-2xl overflow-visible will-change-transform ${menuOpen === user.id ? 'z-[200]' : 'z-10'}`}
      style={{ 
        boxShadow: SHADOWS.card,
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
      }}
    >
      {/* Shimmer Effect */}
      <div
        className="absolute inset-0 pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden rounded-2xl"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(237, 191, 140, 0.25) 50%, transparent 100%)',
        }}
      />

      <div className="relative p-5">
        <div className="flex items-start gap-4">
          {/* صورة المستخدم */}
          <motion.div 
            className="relative w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center border-2 border-primary/30 shrink-0 overflow-hidden"
            style={{ boxShadow: SHADOWS.icon }}
            whileHover={{ scale: 1.05 }}
          >
            {user.image ? (
              <Image
                src={user.image}
                alt={`${user.firstName} ${user.lastName}`}
                fill
                className="object-cover"
              />
            ) : (
              <span className="text-lg font-bold text-secondary font-dubai">
                {user.firstName[0]}{user.lastName[0]}
              </span>
            )}
          </motion.div>

          {/* معلومات المستخدم */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h3 className="font-dubai font-bold text-lg text-secondary truncate">
                {user.firstName} {user.lastName}
              </h3>
              {isCurrentUser && (
                <span className="px-2 py-0.5 rounded-full text-xs font-dubai font-medium bg-primary/20 text-primary border border-primary/30">
                  أنت
                </span>
              )}
              <span className={`px-3 py-1 rounded-full text-xs font-dubai font-medium border ${role.bgColor} ${role.textColor} ${role.borderColor}`}>
                <RoleIcon className="w-3 h-3 inline ml-1" />
                {role.label}
              </span>
            </div>
            
            {/* معلومات التواصل */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-secondary/60">
              <span className="flex items-center gap-1.5">
                <Mail className="w-4 h-4" />
                {user.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(user.createdAt).toLocaleDateString('ar-EG')}
              </span>
            </div>
          </div>

          {/* الإجراءات */}
          <div className="flex items-center gap-2">
            {!isCurrentUser && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onToggleRole(user.id, user.role)}
                disabled={actionLoading === user.id}
                className={`hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl font-dubai font-medium text-sm transition-colors ${
                  user.role === 'ADMIN' 
                    ? 'bg-red-500/10 text-red-700 hover:bg-red-500/20 border border-red-500/30'
                    : 'bg-emerald-400/15 text-emerald-700 hover:bg-emerald-400/25 border border-emerald-500/30'
                }`}
              >
                {actionLoading === user.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : user.role === 'ADMIN' ? (
                  <>
                    <ShieldOff className="w-4 h-4" />
                    إزالة الصلاحيات
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    جعله مسؤول
                  </>
                )}
              </motion.button>
            )}

            {/* قائمة المزيد */}
            <div className="relative">
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setMenuOpen(menuOpen === user.id ? null : user.id)}
                className="p-2.5 hover:bg-primary/10 rounded-xl transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-secondary/60" />
              </motion.button>
              
              <AnimatePresence>
                {menuOpen === user.id && (
                  <>
                    <div 
                      className="fixed inset-0 z-150"
                      onClick={() => setMenuOpen(null)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -5 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-0 top-full mt-2 bg-white rounded-2xl border-2 border-primary/30 py-2 z-160 min-w-[180px] overflow-hidden"
                      style={{ boxShadow: SHADOWS.popup }}
                    >
                      <div className="px-2 py-1">
                        <button
                          onClick={() => {
                            setMenuOpen(null);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-dubai text-secondary hover:bg-primary/10 transition-colors group/item"
                        >
                          <div className="w-8 h-8 bg-secondary/5 rounded-lg flex items-center justify-center group-hover/item:bg-secondary/10 transition-colors">
                            <Eye className="w-4 h-4" />
                          </div>
                          <span className="flex-1 text-right">عرض التفاصيل</span>
                        </button>
                      </div>
                      
                      {!isCurrentUser && (
                        <>
                          {/* خيار تغيير الصلاحية للموبايل */}
                          <div className="px-2 py-1 sm:hidden">
                            <button
                              onClick={() => {
                                onToggleRole(user.id, user.role);
                                setMenuOpen(null);
                              }}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-dubai transition-colors group/item ${
                                user.role === 'ADMIN' 
                                  ? 'text-red-600 hover:bg-red-50'
                                  : 'text-emerald-700 hover:bg-emerald-50'
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                user.role === 'ADMIN' 
                                  ? 'bg-red-50 group-hover/item:bg-red-100'
                                  : 'bg-emerald-50 group-hover/item:bg-emerald-100'
                              }`}>
                                {user.role === 'ADMIN' ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                              </div>
                              <span className="flex-1 text-right">
                                {user.role === 'ADMIN' ? 'إزالة الصلاحيات' : 'جعله مسؤول'}
                              </span>
                            </button>
                          </div>
                          
                          <div className="h-px bg-primary/10 my-1" />
                          
                          <div className="px-2 py-1">
                            <button
                              onClick={() => {
                                onDelete(user.id);
                                setMenuOpen(null);
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-dubai text-red-600 hover:bg-red-50 transition-colors group/item"
                            >
                              <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center group-hover/item:bg-red-100 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </div>
                              <span className="flex-1 text-right">حذف المستخدم</span>
                            </button>
                          </div>
                        </>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// 🚀 MAIN COMPONENT
// ============================================

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  // حماية الصفحة
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [status, session, router]);

  // جلب المستخدمين
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      setUsers(data.users || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء جلب البيانات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
      fetchUsers();
    }
  }, [status, session, fetchUsers]);

  // تغيير صلاحية المستخدم
  const handleToggleRole = async (userId: string, currentRole: string) => {
    setActionLoading(userId);
    try {
      const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setActionLoading(null);
    }
  };

  // حذف المستخدم
  const handleDelete = async (userId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.')) return;
    
    setActionLoading(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setActionLoading(null);
    }
  };

  // تصفية المستخدمين
  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true;
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // إحصائيات
  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'ADMIN').length,
    users: users.filter(u => u.role === 'USER').length,
  };

  // عرض loading
  if (status === 'loading' || !session || session.user?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div
            className="w-16 h-16 bg-primary/30 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-primary/40"
            style={{ boxShadow: SHADOWS.icon }}
          >
            <Loader2 className="w-8 h-8 text-secondary animate-spin" />
          </div>
          <p className="text-secondary/60 font-dubai">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* العنوان */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 will-change-transform"
          style={{ transform: 'translateZ(0)' }}
        >
          <div className="flex items-center gap-4">
            <motion.div 
              className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center border-2 border-primary/30"
              style={{ boxShadow: SHADOWS.icon }}
              whileHover={{ scale: 1.05 }}
            >
              <UserCog className="w-7 h-7 text-secondary" strokeWidth={1.5} />
            </motion.div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-secondary font-dubai">
                إدارة المستخدمين
              </h1>
              <p className="text-secondary/60 text-sm mt-1 font-dubai">
                إدارة وتعديل صلاحيات المستخدمين
                <span className="mr-2 px-2 py-0.5 bg-primary/20 rounded-full text-xs">
                  {stats.total} مستخدم
                </span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* إحصائيات سريعة */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.05, ease: [0.25, 0.1, 0.25, 1] }}
          className="grid grid-cols-3 gap-4 will-change-transform"
          style={{ transform: 'translateZ(0)' }}
        >
          <div 
            className="bg-white border-2 border-primary/20 rounded-2xl p-4 text-center"
            style={{ boxShadow: SHADOWS.card }}
          >
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Users className="w-5 h-5 text-secondary" />
            </div>
            <p className="text-2xl font-bold text-secondary font-bristone">{stats.total}</p>
            <p className="text-xs text-secondary/60 font-dubai">إجمالي المستخدمين</p>
          </div>
          
          <div 
            className="bg-white border-2 border-emerald-500/20 rounded-2xl p-4 text-center"
            style={{ boxShadow: SHADOWS.card }}
          >
            <div className="w-10 h-10 bg-emerald-400/20 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Crown className="w-5 h-5 text-emerald-700" />
            </div>
            <p className="text-2xl font-bold text-emerald-700 font-bristone">{stats.admins}</p>
            <p className="text-xs text-secondary/60 font-dubai">المسؤولين</p>
          </div>
          
          <div 
            className="bg-white border-2 border-blue-500/20 rounded-2xl p-4 text-center"
            style={{ boxShadow: SHADOWS.card }}
          >
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Users className="w-5 h-5 text-blue-700" />
            </div>
            <p className="text-2xl font-bold text-blue-700 font-bristone">{stats.users}</p>
            <p className="text-xs text-secondary/60 font-dubai">المستخدمين العاديين</p>
          </div>
        </motion.div>

        {/* شريط البحث */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative will-change-transform"
          style={{ transform: 'translateZ(0)' }}
        >
          <div 
            className="bg-white border-2 border-primary/20 rounded-2xl overflow-hidden"
            style={{ boxShadow: SHADOWS.card }}
          >
            <div className="flex items-center px-4">
              <Search className="w-5 h-5 text-secondary/40" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث بالاسم أو البريد الإلكتروني..."
                className="flex-1 px-4 py-4 bg-transparent text-secondary placeholder-secondary/40 focus:outline-none font-dubai"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                >
                  <span className="text-secondary/40 text-sm">✕</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* رسالة الخطأ */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-3 p-4 bg-red-50 border-2 border-red-200 rounded-2xl text-red-700"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="font-dubai">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* قائمة المستخدمين */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <div
              className="w-16 h-16 bg-primary/30 rounded-2xl flex items-center justify-center mb-4 border-2 border-primary/40"
              style={{ boxShadow: SHADOWS.icon }}
            >
              <Loader2 className="w-8 h-8 text-secondary animate-spin" />
            </div>
            <p className="text-secondary/60 font-dubai">جاري تحميل المستخدمين...</p>
          </motion.div>
        ) : filteredUsers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative bg-white border-2 border-primary/20 rounded-2xl p-12 text-center overflow-hidden"
            style={{ boxShadow: SHADOWS.card }}
          >
            <div className="relative z-10">
              <motion.div 
                className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border-2 border-primary/30"
                style={{ boxShadow: SHADOWS.icon }}
                whileHover={{ scale: 1.05 }}
              >
                <Users className="w-10 h-10 text-secondary" strokeWidth={1.5} />
              </motion.div>
              
              <h3 className="text-xl font-dubai font-bold text-secondary mb-2">
                {searchTerm ? 'لا توجد نتائج' : 'لا يوجد مستخدمين'}
              </h3>
              <p className="text-secondary/60 font-dubai mb-6">
                {searchTerm 
                  ? 'جرب البحث بكلمات مختلفة'
                  : 'لم يتم تسجيل أي مستخدمين بعد'
                }
              </p>
              
              {searchTerm && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSearchTerm('')}
                  className="flex items-center gap-2 mx-auto px-5 py-3 bg-white border-2 border-primary/30 rounded-xl font-dubai font-medium text-secondary hover:border-primary/50 transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                  إعادة تعيين البحث
                </motion.button>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="sync">
              {filteredUsers.map((user, index) => (
                <UserCard
                  key={user.id}
                  user={user}
                  index={index}
                  onToggleRole={handleToggleRole}
                  onDelete={handleDelete}
                  menuOpen={menuOpen}
                  setMenuOpen={setMenuOpen}
                  actionLoading={actionLoading}
                  currentUserId={session?.user?.id}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
