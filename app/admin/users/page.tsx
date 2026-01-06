'use client';

import React, { useEffect, useState } from 'react';
import { Search, Filter, MoreVertical, Shield, ShieldOff } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'USER' | 'ADMIN';
  image?: string;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { data: session, status } = useSession();
  const router = useRouter();

  // حماية الصفحة - إعادة توجيه إذا لم يكن أدمن
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
      fetchUsers();
    }
  }, [status, session]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserRole = async (userId: string, currentRole: string) => {
    try {
      const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        fetchUsers(); // إعادة تحميل القائمة
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // عرض loading أثناء التحقق من الصلاحيات
  if (status === 'loading' || !session || session.user?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-secondary font-dubai">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* العنوان */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-secondary mb-2 font-bristone">
          إدارة المستخدمين
        </h1>
        <p className="text-sm sm:text-base text-secondary/60 font-dubai">
          إدارة وتعديل صلاحيات المستخدمين
        </p>
      </div>

      {/* شريط البحث والتصفية */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <div className="flex-1 relative">
          <Search
            size={20}
            className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-secondary/40"
          />
          <input
            type="text"
            placeholder="البحث عن مستخدم..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="
              w-full pr-10 sm:pr-12 pl-3 sm:pl-4 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base
              bg-accent border border-primary/10
              text-secondary placeholder:text-secondary/40
              focus:outline-none focus:border-primary/30
              transition-all duration-300
              font-dubai
            "
          />
        </div>
        <button
          className="
            px-6 py-3 rounded-xl bg-accent border border-primary/10
            text-secondary hover:bg-primary/10
            transition-all duration-300 flex items-center gap-2
            font-dubai
          "
        >
          <Filter size={20} />
          <span>تصفية</span>
        </button>
      </div>

      {/* جدول المستخدمين */}
      <div className="bg-accent border border-primary/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-secondary/60 font-dubai">جاري التحميل...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-secondary/60 font-dubai">لا يوجد مستخدمين</p>
          </div>
        ) : (
          <>
            {/* عرض Cards للموبايل */}
            <div className="block lg:hidden divide-y divide-primary/10">
              {filteredUsers.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 hover:bg-primary/5 transition-colors"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-primary/10 flex-shrink-0">
                      {user.image ? (
                        <Image
                          src={user.image}
                          alt={user.firstName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-secondary font-bold">
                          {user.firstName[0]}{user.lastName[0]}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-secondary font-dubai truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-secondary/60 font-dubai truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`
                        px-3 py-1 rounded-lg text-xs font-semibold font-dubai
                        ${
                          user.role === 'ADMIN'
                            ? 'bg-primary/20 text-primary'
                            : 'bg-secondary/10 text-secondary'
                        }
                      `}
                    >
                      {user.role === 'ADMIN' ? 'مسؤول' : 'مستخدم'}
                    </span>
                    <button
                      onClick={() => toggleUserRole(user.id, user.role)}
                      className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                      title={user.role === 'ADMIN' ? 'إلغاء الصلاحيات' : 'منح صلاحيات المسؤول'}
                    >
                      {user.role === 'ADMIN' ? (
                        <ShieldOff size={18} className="text-red-500" />
                      ) : (
                        <Shield size={18} className="text-primary" />
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* عرض Table للديسكتوب */}
            <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary/5 border-b border-primary/10">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-secondary font-dubai">
                    المستخدم
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-secondary font-dubai">
                    البريد الإلكتروني
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-secondary font-dubai">
                    الدور
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-secondary font-dubai">
                    تاريخ التسجيل
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-secondary font-dubai">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10">
                {filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-primary/5 transition-colors duration-200"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-primary/10 flex-shrink-0">
                          {user.image ? (
                            <Image
                              src={user.image}
                              alt={user.firstName}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-secondary font-bold">
                              {user.firstName[0]}{user.lastName[0]}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-secondary font-dubai">
                            {user.firstName} {user.lastName}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-secondary/80 font-dubai text-sm">
                        {user.email}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`
                          inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold font-dubai
                          ${
                            user.role === 'ADMIN'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'
                          }
                        `}
                      >
                        {user.role === 'ADMIN' ? (
                          <>
                            <Shield size={12} />
                            مسؤول
                          </>
                        ) : (
                          <>
                            <ShieldOff size={12} />
                            مستخدم
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-secondary/60 font-dubai text-sm">
                        {new Date(user.createdAt).toLocaleDateString('ar-EG')}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleUserRole(user.id, user.role)}
                        className="
                          px-4 py-2 rounded-lg
                          text-xs font-semibold font-dubai
                          bg-primary/10 text-primary
                          hover:bg-primary hover:text-white
                          transition-all duration-300
                        "
                      >
                        {user.role === 'ADMIN' ? 'إزالة صلاحيات المسؤول' : 'جعله مسؤول'}
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>
    </div>
  );
}
