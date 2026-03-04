'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LogIn, Phone, Plane, Clock, Building2 } from 'lucide-react';
import SupervisorSelect from './SupervisorSelect';

interface CheckInRow {
  id: string;
  apartment: { id: string; name: string; floor?: number | null } | null;
  clientName: string;
  clientPhone?: string | null;
  arrivalTime?: string | null;
  flightNumber?: string | null;
  checkIn: string;
  checkOut: string;
  nights: number;
  receptionSupervisor?: string | null;
  notes?: string | null;
  status: string;
}

interface CheckInTableProps {
  checkIns: CheckInRow[];
  isLoading?: boolean;
  canAssignSupervisor?: boolean;
  onSupervisorSaved?: (bookingId: string, field: string, value: string) => void;
}

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });

const CheckInTable: React.FC<CheckInTableProps> = ({
  checkIns,
  isLoading,
  canAssignSupervisor = false,
  onSupervisorSaved,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border-2 border-primary/20 p-8">
        <div className="flex items-center justify-center gap-2 text-secondary/60">
          <div className="w-5 h-5 border-2 border-primary/30 border-t-green-500 rounded-full animate-spin" />
          <span className="text-sm">جاري تحميل بيانات الدخول...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="bg-white rounded-2xl border-2 border-primary/20 overflow-hidden shadow-[0_4px_20px_rgba(237,191,140,0.15)]"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3.5 border-b-2 border-primary/10
        bg-gradient-to-l from-primary/5 to-white"
      >
        <div className="w-8 h-8 rounded-xl bg-[#8a9a7a]/10 border-2 border-[#8a9a7a]/25 flex items-center justify-center">
          <LogIn className="w-4 h-4 text-[#8a9a7a]" />
        </div>
        <h3 className="text-base font-bold text-secondary font-dubai">
          تسجيل الدخول
        </h3>
        <span className="mr-auto bg-[#8a9a7a]/10 text-[#8a9a7a] text-xs font-bold
          px-2.5 py-1 rounded-full font-dubai"
        >
          {checkIns.length} حجز
        </span>
      </div>

      {checkIns.length === 0 ? (
        <div className="py-10 text-center text-secondary/55">
          <LogIn className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-dubai">لا يوجد حجوزات دخول لهذا اليوم</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-l from-primary/15 to-primary/25 border-b border-primary/20">
                <th className="text-right px-4 py-3 text-[11px] text-secondary/80 font-bold font-dubai">الشقة</th>
                <th className="text-right px-4 py-3 text-[11px] text-secondary/80 font-bold font-dubai">الضيف</th>
                <th className="text-right px-4 py-3 text-[11px] text-secondary/80 font-bold font-dubai">التواصل</th>
                <th className="text-right px-4 py-3 text-[11px] text-secondary/80 font-bold font-dubai">الوصول</th>
                <th className="text-right px-4 py-3 text-[11px] text-secondary/80 font-bold font-dubai">الليالي</th>
                {canAssignSupervisor && (
                  <th className="text-right px-4 py-3 text-[11px] text-secondary/80 font-bold font-dubai">مشرف الاستقبال</th>
                )}
              </tr>
            </thead>
            <tbody>
              {checkIns.map((row) => {
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

                    {/* الوصول */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        {row.arrivalTime && (
                          <span className="flex items-center gap-1 text-secondary/70 text-xs">
                            <Clock className="w-3 h-3" />
                            {row.arrivalTime}
                          </span>
                        )}
                        {row.flightNumber && (
                          <span className="flex items-center gap-1 text-secondary/60 text-xs">
                            <Plane className="w-3 h-3" />
                            {row.flightNumber}
                          </span>
                        )}
                        {!row.arrivalTime && !row.flightNumber && (
                          <span className="text-secondary/45 text-xs">—</span>
                        )}
                      </div>
                    </td>

                    {/* الليالي */}
                    <td className="px-4 py-3">
                      <span className="text-xs bg-secondary/5 text-secondary/70 px-2 py-0.5
                        rounded-full font-dubai font-medium"
                      >
                        {row.nights} ليلة
                      </span>
                    </td>

                    {/* مشرف الاستقبال */}
                    {canAssignSupervisor && (
                      <td className="px-4 py-3">
                        <SupervisorSelect
                          bookingId={row.id}
                          field="receptionSupervisor"
                          value={row.receptionSupervisor || null}
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

export default CheckInTable;
