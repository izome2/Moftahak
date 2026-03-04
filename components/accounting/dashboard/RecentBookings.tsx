'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, Loader2 } from 'lucide-react';

interface BookingItem {
  id: string;
  clientName: string;
  apartment: string;
  checkIn: string;
  checkOut: string;
  amount: number;
  source: string;
  status: string;
}

interface RecentBookingsProps {
  bookings: BookingItem[];
  isLoading?: boolean;
}

const SOURCE_BADGES: Record<string, { label: string; className: string }> = {
  AIRBNB: { label: 'Airbnb', className: 'bg-primary/10 text-secondary' },
  BOOKING_COM: { label: 'Booking.com', className: 'bg-primary/10 text-secondary' },
  EXTERNAL: { label: 'خارجي', className: 'bg-secondary/10 text-secondary' },
  DIRECT: { label: 'مباشر', className: 'bg-primary/20 text-secondary' },
  OTHER: { label: 'أخرى', className: 'bg-secondary/10 text-secondary/70' },
};

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  CONFIRMED: { label: 'مؤكد', className: 'bg-primary/15 text-secondary' },
  PENDING: { label: 'معلّق', className: 'bg-primary/10 text-secondary/70' },
  CANCELLED: { label: 'ملغي', className: 'bg-secondary/10 text-secondary/50' },
  COMPLETED: { label: 'مكتمل', className: 'bg-primary/25 text-secondary' },
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ar-EG', {
    month: 'short',
    day: 'numeric',
  });
};

const RecentBookings: React.FC<RecentBookingsProps> = ({ bookings, isLoading }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      className="bg-white border-2 border-primary/20 rounded-2xl shadow-[0_4px_20px_rgba(237,191,140,0.15)] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-primary/10">
        <div className="flex items-center gap-2">
          <CalendarCheck size={20} className="text-primary" />
          <h3 className="text-lg font-bold text-secondary font-dubai">آخر الحجوزات</h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-8">
            <CalendarCheck size={40} className="text-secondary/20 mx-auto mb-2" />
            <p className="text-secondary/50 font-dubai text-sm">لا توجد حجوزات بعد</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => {
              const source = SOURCE_BADGES[booking.source] || SOURCE_BADGES.OTHER;
              const status = STATUS_BADGES[booking.status] || STATUS_BADGES.PENDING;

              return (
                <div
                  key={booking.id}
                  className="flex items-center gap-3 p-3 bg-accent/30 rounded-xl hover:bg-accent/50 transition-colors"
                >
                  {/* Client Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-secondary font-dubai text-sm truncate">
                      {booking.clientName}
                    </p>
                    <p className="text-xs text-secondary/50 font-dubai truncate">
                      {booking.apartment}
                    </p>
                  </div>

                  {/* Dates */}
                  <div className="text-center flex-shrink-0 hidden sm:block">
                    <p className="text-xs text-secondary/60 font-dubai">
                      {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="text-left flex-shrink-0">
                    <p className="font-bold text-secondary font-dubai text-sm">
                      {new Intl.NumberFormat('ar-EG').format(booking.amount)} ج.م
                    </p>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-dubai ${source.className}`}>
                      {source.label}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-dubai ${status.className}`}>
                      {status.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default RecentBookings;
