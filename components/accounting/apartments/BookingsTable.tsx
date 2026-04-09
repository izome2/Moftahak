'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, Loader2, User, LogIn, LogOut, Moon, DollarSign, Globe, CircleDot } from 'lucide-react';
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
  hideAmounts?: boolean;
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
  CANCELLED: 'bg-secondary/10 text-secondary/75',
};

const BookingsTable: React.FC<BookingsTableProps> = ({ bookings, totalAmount, isLoading, hideAmounts }) => {
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
      className="bg-white rounded-2xl border border-secondary/[0.08] shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-secondary/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center flex-shrink-0">
            <CalendarCheck size={16} className="text-white" />
          </div>
          <h3 className="text-sm font-bold text-secondary font-dubai">{t.accounting.apartments.bookingsRevenue}</h3>
        </div>
        {totalAmount !== undefined && !isLoading && !hideAmounts && (
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
          <div className="w-12 h-12 rounded-2xl bg-secondary/[0.03] mx-auto mb-3 flex items-center justify-center">
            <CalendarCheck size={22} className="text-secondary/65" />
          </div>
          <p className="text-secondary/80 font-dubai text-sm">{t.accounting.apartments.noBookingsThisMonth}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary/[0.02] border-b border-secondary/[0.06]">
                <th className="px-4 py-3 text-right text-[11px] text-secondary/70 font-medium font-dubai"><span className="inline-flex items-center gap-1"><User size={12} />{t.accounting.apartments.client}</span></th>
                <th className="px-4 py-3 text-center text-[11px] text-secondary/70 font-medium font-dubai hidden sm:table-cell"><span className="inline-flex items-center gap-1"><LogIn size={12} />{t.accounting.apartments.checkInDate}</span></th>
                <th className="px-4 py-3 text-center text-[11px] text-secondary/70 font-medium font-dubai hidden sm:table-cell"><span className="inline-flex items-center gap-1"><LogOut size={12} />{t.accounting.apartments.checkOutDate}</span></th>
                <th className="px-4 py-3 text-center text-[11px] text-secondary/70 font-medium font-dubai"><span className="inline-flex items-center gap-1"><Moon size={12} />{t.accounting.apartments.nights}</span></th>
                {!hideAmounts && <th className="px-4 py-3 text-center text-[11px] text-secondary/70 font-medium font-dubai"><span className="inline-flex items-center gap-1"><DollarSign size={12} />{t.accounting.apartments.amountHeader}</span></th>}
                <th className="px-4 py-3 text-center text-[11px] text-secondary/70 font-medium font-dubai"><span className="inline-flex items-center gap-1"><Globe size={12} />{t.accounting.apartments.source}</span></th>
                <th className="px-4 py-3 text-center text-[11px] text-secondary/70 font-medium font-dubai hidden md:table-cell"><span className="inline-flex items-center gap-1"><CircleDot size={12} />{t.accounting.apartments.status}</span></th>
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
                    className={`border-b border-secondary/[0.04] hover:bg-secondary/[0.02] transition-colors ${
                      i % 2 === 0 ? 'bg-secondary/[0.01]' : ''
                    }`}
                  >
                    <td className="px-4 py-3.5 font-dubai">
                      <p className="font-semibold text-secondary text-[13px]">{booking.clientName}</p>
                      {booking.clientPhone && (
                        <p className="text-[10px] text-secondary/80 mt-0.5 ltr">{booking.clientPhone}</p>
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
                    {!hideAmounts && (
                      <td className="px-4 py-3.5 text-center font-bold text-secondary font-dubai text-[13px]">
                        {formatCurrency(booking.amount)}
                      </td>
                    )}
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
