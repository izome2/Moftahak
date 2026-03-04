'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LogOut, Phone, Building2 } from 'lucide-react';
import SupervisorSelect from './SupervisorSelect';

interface CheckOutRow {
  id: string;
  apartment: { id: string; name: string; floor?: number | null } | null;
  clientName: string;
  clientPhone?: string | null;
  checkOut: string;
  deliverySupervisor?: string | null;
  notes?: string | null;
  status: string;
}

interface CheckOutTableProps {
  checkOuts: CheckOutRow[];
  isLoading?: boolean;
  canAssignSupervisor?: boolean;
  onSupervisorSaved?: (bookingId: string, field: string, value: string) => void;
}

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });

const CheckOutTable: React.FC<CheckOutTableProps> = ({
  checkOuts,
  isLoading,
  canAssignSupervisor = false,
  onSupervisorSaved,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border-2 border-primary/20 p-8">
        <div className="flex items-center justify-center gap-2 text-secondary/60">
          <div className="w-5 h-5 border-2 border-primary/30 border-t-red-500 rounded-full animate-spin" />
          <span className="text-sm">جاري تحميل بيانات الخروج...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="bg-white rounded-2xl border-2 border-primary/20 overflow-hidden shadow-[0_4px_20px_rgba(237,191,140,0.15)]"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3.5 border-b-2 border-primary/10
        bg-gradient-to-l from-primary/5 to-white"
      >
        <div className="w-8 h-8 rounded-xl bg-[#c09080]/10 border-2 border-[#c09080]/25 flex items-center justify-center">
          <LogOut className="w-4 h-4 text-[#c09080]" />
        </div>
        <h3 className="text-base font-bold text-secondary font-dubai">
          تسجيل الخروج
        </h3>
        <span className="mr-auto bg-[#c09080]/10 text-[#c09080] text-xs font-bold
          px-2.5 py-1 rounded-full font-dubai"
        >
          {checkOuts.length} حجز
        </span>
      </div>

      {checkOuts.length === 0 ? (
        <div className="py-10 text-center text-secondary/55">
          <LogOut className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-dubai">لا يوجد حجوزات خروج لهذا اليوم</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-l from-primary/15 to-primary/25 border-b border-primary/20">
                <th className="text-right px-4 py-3 text-[11px] text-secondary/80 font-bold font-dubai">الشقة</th>
                <th className="text-right px-4 py-3 text-[11px] text-secondary/80 font-bold font-dubai">الضيف</th>
                <th className="text-right px-4 py-3 text-[11px] text-secondary/80 font-bold font-dubai">التواصل</th>
                <th className="text-right px-4 py-3 text-[11px] text-secondary/80 font-bold font-dubai">الخروج</th>
                {canAssignSupervisor && (
                  <th className="text-right px-4 py-3 text-[11px] text-secondary/80 font-bold font-dubai">مشرف الاستلام</th>
                )}
              </tr>
            </thead>
            <tbody>
              {checkOuts.map((row) => {
                const hasActivity = row.status !== 'CANCELLED';
                return (
                  <tr
                    key={row.id}
                    className={`
                      transition-colors duration-150
                      ${hasActivity
                        ? 'bg-white hover:bg-primary/5'
                        : 'bg-primary/5 opacity-50'
                      }
                    `}
                  >
                    {/* الشقة */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-secondary/55" />
                        <span className="font-medium text-secondary font-dubai">
                          {row.apartment?.name || '—'}
                        </span>
                      </div>
                    </td>

                    {/* الضيف */}
                    <td className="px-4 py-3">
                      <span className="font-medium text-secondary font-dubai">
                        {row.clientName}
                      </span>
                    </td>

                    {/* التواصل */}
                    <td className="px-4 py-3">
                      {row.clientPhone ? (
                        <a
                          href={`tel:${row.clientPhone}`}
                          className="flex items-center gap-1 text-secondary/70 hover:text-secondary
                            transition-colors"
                        >
                          <Phone className="w-3 h-3" />
                          <span className="text-xs font-mono" dir="ltr">{row.clientPhone}</span>
                        </a>
                      ) : (
                        <span className="text-secondary/45 text-xs">—</span>
                      )}
                    </td>

                    {/* الخروج */}
                    <td className="px-4 py-3">
                      <span className="text-secondary/70 text-xs font-dubai">
                        {formatDate(row.checkOut)}
                      </span>
                    </td>

                    {/* مشرف الاستلام */}
                    {canAssignSupervisor && (
                      <td className="px-4 py-3">
                        <SupervisorSelect
                          bookingId={row.id}
                          field="deliverySupervisor"
                          value={row.deliverySupervisor || null}
                          onSaved={onSupervisorSaved}
                        />
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default CheckOutTable;
