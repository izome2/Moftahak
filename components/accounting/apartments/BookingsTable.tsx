'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

interface BookingRow {
  id: string;
  clientName: string;
  clientPhone?: string | null;
  checkIn: string;
  checkOut: string;
  nights: number;
  amount: number;
  source: string;
  status: string;
}

interface BookingsTableProps {
  bookings: BookingRow[];
  totalAmount?: number;
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
  CHECKED_IN: 'bg-primary/25 text-secondary',
  CHECKED_OUT: 'bg-secondary/10 text-secondary/70',
  CANCELLED: 'bg-secondary/10 text-secondary/50',
};

const BookingsTable: React.FC<BookingsTableProps> = ({ bookings, totalAmount, isLoading }) => {
  const t = useTranslation();
  const { language } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG-u-nu-arab' : 'en-US';
  const currency = t.accounting.common.currency;

  const SOURCE_LABELS: Record<string, string> = {
    AIRBNB: 'Airbnb',
    BOOKING_COM: 'Booking.com',
    ...t.accounting.bookingSources,
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString(locale, { month: 'short', day: 'numeric' });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(locale).format(amount) + ' ' + currency;
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-white rounded-2xl border-2 border-primary/30 shadow-[0_4px_20px_rgba(237,191,140,0.15)] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-primary/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center flex-shrink-0">
            <CalendarCheck size={16} className="text-primary" />
          </div>
          <h3 className="text-sm font-bold text-secondary font-dubai">{t.accounting.apartments.bookingsRevenue}</h3>
        </div>
        {totalAmount !== undefined && !isLoading && (
          <div className="bg-primary/8 px-3 py-1.5 rounded-xl">
            <span className="text-sm font-bold text-secondary font-dubai">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-14">
          <div className="w-12 h-12 rounded-2xl bg-primary/5 mx-auto mb-3 flex items-center justify-center">
            <CalendarCheck size={22} className="text-secondary/35" />
          </div>
          <p className="text-secondary/55 font-dubai text-sm">{t.accounting.apartments.noBookingsThisMonth}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-l from-primary/15 to-primary/25 border-b border-primary/20">
                <th className="px-4 py-3 text-right text-[11px] text-secondary/80 font-bold font-dubai">{t.accounting.apartments.client}</th>
                <th className="px-4 py-3 text-center text-[11px] text-secondary/80 font-bold font-dubai hidden sm:table-cell">{t.accounting.apartments.checkInDate}</th>
                <th className="px-4 py-3 text-center text-[11px] text-secondary/80 font-bold font-dubai hidden sm:table-cell">{t.accounting.apartments.checkOutDate}</th>
                <th className="px-4 py-3 text-center text-[11px] text-secondary/80 font-bold font-dubai">{t.accounting.apartments.nights}</th>
                <th className="px-4 py-3 text-center text-[11px] text-secondary/80 font-bold font-dubai">{t.accounting.apartments.amountHeader}</th>
                <th className="px-4 py-3 text-center text-[11px] text-secondary/80 font-bold font-dubai">{t.accounting.apartments.source}</th>
                <th className="px-4 py-3 text-center text-[11px] text-secondary/80 font-bold font-dubai hidden md:table-cell">{t.accounting.apartments.status}</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking, i) => {
                const sourceLabel = SOURCE_LABELS[booking.source] || booking.source;
                const sourceClass = SOURCE_CLASSES[booking.source] || SOURCE_CLASSES.OTHER;
                const statusLabel = t.accounting.bookingStatuses[booking.status as keyof typeof t.accounting.bookingStatuses] || booking.status;
                const statusClass = STATUS_CLASSES[booking.status] || STATUS_CLASSES.CONFIRMED;

                return (
                  <tr
                    key={booking.id}
                    className={`border-b border-primary/10 hover:bg-primary/10 transition-colors ${
                      i % 2 === 0 ? 'bg-primary/[0.06]' : ''
                    }`}
                  >
                    <td className="px-4 py-3.5 font-dubai">
                      <p className="font-semibold text-secondary text-[13px]">{booking.clientName}</p>
                      {booking.clientPhone && (
                        <p className="text-[10px] text-secondary/55 mt-0.5 ltr">{booking.clientPhone}</p>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center text-secondary/70 font-dubai text-[12px] hidden sm:table-cell">
                      {formatDate(booking.checkIn)}
                    </td>
                    <td className="px-4 py-3.5 text-center text-secondary/70 font-dubai text-[12px] hidden sm:table-cell">
                      {formatDate(booking.checkOut)}
                    </td>
                    <td className="px-4 py-3.5 text-center font-bold text-secondary font-dubai text-[13px]">
                      {new Intl.NumberFormat(locale).format(booking.nights)}
                    </td>
                    <td className="px-4 py-3.5 text-center font-bold text-secondary font-dubai text-[13px]">
                      {formatCurrency(booking.amount)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-dubai ${sourceClass}`}>
                        {sourceLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center hidden md:table-cell">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-dubai ${statusClass}`}>
                        {statusLabel}
                      </span>
                    </td>
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

export default BookingsTable;
