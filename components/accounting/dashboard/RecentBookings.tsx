'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

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

const SOURCE_CLASSES: Record<string, string> = {
  AIRBNB: 'bg-primary/10 text-secondary',
  BOOKING_COM: 'bg-primary/10 text-secondary',
  EXTERNAL: 'bg-secondary/10 text-secondary',
  DIRECT: 'bg-primary/20 text-secondary',
  OTHER: 'bg-secondary/10 text-secondary/70',
};

const STATUS_CLASSES: Record<string, string> = {
  CONFIRMED: 'bg-primary/15 text-secondary',
  PENDING: 'bg-primary/10 text-secondary/70',
  CANCELLED: 'bg-secondary/10 text-secondary/50',
  COMPLETED: 'bg-primary/25 text-secondary',
};

const RecentBookings: React.FC<RecentBookingsProps> = ({ bookings, isLoading }) => {
  const t = useTranslation();
  const { language } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG-u-nu-arab' : 'en-US';
  const currency = t.accounting.common.currency;

  const SOURCE_LABELS: Record<string, string> = {
    AIRBNB: 'Airbnb',
    BOOKING_COM: 'Booking.com',
    ...t.accounting.bookingSources,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
    });
  };
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
          <h3 className="text-lg font-bold text-secondary font-dubai">{t.accounting.dashboard.recentBookings}</h3>
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
            <p className="text-secondary/50 font-dubai text-sm">{t.accounting.dashboard.noBookingsYet}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => {
              const sourceLabel = SOURCE_LABELS[booking.source] || booking.source;
              const sourceClass = SOURCE_CLASSES[booking.source] || SOURCE_CLASSES.OTHER;
              const statusLabel = t.accounting.bookingStatuses[booking.status as keyof typeof t.accounting.bookingStatuses] || booking.status;
              const statusClass = STATUS_CLASSES[booking.status] || STATUS_CLASSES.PENDING;

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
                      {new Intl.NumberFormat(locale).format(booking.amount)} {currency}
                    </p>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-dubai ${sourceClass}`}>
                      {sourceLabel}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-dubai ${statusClass}`}>
                      {statusLabel}
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
