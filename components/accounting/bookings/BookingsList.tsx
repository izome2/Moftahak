'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, Loader2, Pencil, Trash2, Phone, Clock, FileText } from 'lucide-react';
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
  currency: string;
  source: string;
  status: string;
  arrivalTime?: string | null;
  notes?: string | null;
  apartment?: { id: string; name: string } | null;
}

interface BookingsListProps {
  bookings: BookingRow[];
  totalAmount?: number;
  totalNights?: number;
  totalCount?: number;
  isLoading?: boolean;
  showApartment?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  onEdit?: (booking: BookingRow) => void;
  onDelete?: (booking: BookingRow) => void;
  hideFinancials?: boolean;
}

const SOURCE_BADGE_CLASSES: Record<string, string> = {
  AIRBNB: 'bg-primary/10 text-secondary',
  BOOKING_COM: 'bg-primary/10 text-secondary',
  EXTERNAL: 'bg-secondary/10 text-secondary',
  DIRECT: 'bg-primary/20 text-secondary',
  OTHER: 'bg-secondary/10 text-secondary/70',
};

const STATUS_BADGE_CLASSES: Record<string, string> = {
  CONFIRMED: 'bg-primary/15 text-secondary',
  CHECKED_IN: 'bg-primary/25 text-secondary',
  CHECKED_OUT: 'bg-secondary/10 text-secondary/70',
  CANCELLED: 'bg-secondary/10 text-secondary/50',
};

const BookingsList: React.FC<BookingsListProps> = ({
  bookings,
  totalAmount,
  totalNights,
  totalCount,
  isLoading = false,
  showApartment = true,
  canEdit = false,
  canDelete = false,
  onEdit,
  onDelete,
  hideFinancials = false,
}) => {
  const t = useTranslation();
  const { language } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG' : 'en-US';
  const currency = t.accounting.common.currency;

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString(locale, { month: 'short', day: 'numeric' });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(locale).format(amount) + ' ' + currency;

  const getSourceLabel = (source: string) => {
    if (source === 'AIRBNB') return 'Airbnb';
    if (source === 'BOOKING_COM') return 'Booking.com';
    return (t.accounting.bookingSources as Record<string, string>)[source] || source;
  };

  const getStatusLabel = (status: string) => {
    return (t.accounting.bookingStatuses as Record<string, string>)[status] || status;
  };

  const hasActions = canEdit || canDelete;

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
          <div>
            <h3 className="text-sm font-bold text-secondary font-dubai">{t.accounting.bookings.bookingsList}</h3>
            {totalCount !== undefined && (
              <p className="text-[11px] text-secondary/55 font-dubai">{totalCount} {t.accounting.common.booking}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {totalNights !== undefined && totalNights > 0 && !isLoading && (
            <span className="text-[11px] font-bold text-secondary/60 font-dubai bg-primary/8 px-2.5 py-1 rounded-lg">
              {totalNights} {t.accounting.common.night}
            </span>
          )}
          {totalAmount !== undefined && !isLoading && !hideFinancials && (
            <div className="bg-primary/8 px-3 py-1.5 rounded-xl">
              <span className="text-sm font-bold text-secondary font-dubai">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 rounded-2xl bg-primary/5 mx-auto mb-3 flex items-center justify-center">
            <CalendarCheck size={22} className="text-secondary/35" />
          </div>
          <p className="text-secondary/55 font-dubai text-sm">{t.accounting.bookings.noBookingsFilter}</p>
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="block md:hidden">
            {bookings.map((booking, i) => {
              const sourceClass = SOURCE_BADGE_CLASSES[booking.source] || SOURCE_BADGE_CLASSES.OTHER;
              const statusClass = STATUS_BADGE_CLASSES[booking.status] || STATUS_BADGE_CLASSES.CONFIRMED;
              return (
                <div
                  key={booking.id}
                  className={`px-5 py-3.5 space-y-2 ${booking.status === 'CANCELLED' ? 'opacity-50' : ''} ${i < bookings.length - 1 ? 'border-b border-primary/[0.06]' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-secondary font-dubai text-[13px]">{booking.clientName}</p>
                      {showApartment && booking.apartment?.name && (
                        <span className="text-[10px] bg-primary/8 text-secondary/60 px-2 py-0.5 rounded-md font-medium inline-block mt-1">
                          {booking.apartment.name}
                        </span>
                      )}
                    </div>
                    {!hideFinancials && (
                      <span className="text-[13px] font-bold text-secondary font-dubai whitespace-nowrap">
                        {formatCurrency(booking.amount)}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-secondary/65 font-dubai">
                    <span>{formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}</span>
                    <span className="font-bold text-secondary/70">{booking.nights} {t.accounting.common.night}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${sourceClass}`}>
                        {getSourceLabel(booking.source)}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${statusClass}`}>
                        {getStatusLabel(booking.status)}
                      </span>
                    </div>
                    {hasActions && (
                      <div className="flex items-center gap-0.5">
                        {canEdit && onEdit && (
                          <button onClick={() => onEdit(booking)} className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors">
                            <Pencil size={13} className="text-secondary/50" />
                          </button>
                        )}
                        {canDelete && onDelete && (
                          <button onClick={() => onDelete(booking)} className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors">
                            <Trash2 size={13} className="text-secondary/45" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View */}
          <div className="overflow-x-auto hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-l from-primary/15 to-primary/25 border-b border-primary/20">
                  {showApartment && <th className="px-4 py-3 text-right text-[11px] text-secondary/80 font-bold font-dubai">{t.accounting.bookings.apartment}</th>}
                  <th className="px-4 py-3 text-right text-[11px] text-secondary/80 font-bold font-dubai">{t.accounting.bookings.client}</th>
                  <th className="px-4 py-3 text-center text-[11px] text-secondary/80 font-bold font-dubai hidden sm:table-cell">{t.accounting.bookings.checkIn}</th>
                  <th className="px-4 py-3 text-center text-[11px] text-secondary/80 font-bold font-dubai hidden sm:table-cell">{t.accounting.bookings.checkOut}</th>
                  <th className="px-4 py-3 text-center text-[11px] text-secondary/80 font-bold font-dubai">{t.accounting.bookings.nights}</th>
                  {!hideFinancials && <th className="px-4 py-3 text-center text-[11px] text-secondary/80 font-bold font-dubai">{t.accounting.bookings.amount}</th>}
                  <th className="px-4 py-3 text-center text-[11px] text-secondary/80 font-bold font-dubai">{t.accounting.bookings.source}</th>
                  <th className="px-4 py-3 text-center text-[11px] text-secondary/80 font-bold font-dubai hidden md:table-cell">{t.accounting.bookings.status}</th>
                  {hasActions && <th className="px-4 py-3 text-center text-[11px] text-secondary/80 font-bold font-dubai w-20">{t.accounting.bookings.actions}</th>}
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking, i) => {
                  const sourceClass = SOURCE_BADGE_CLASSES[booking.source] || SOURCE_BADGE_CLASSES.OTHER;
                  const statusClass = STATUS_BADGE_CLASSES[booking.status] || STATUS_BADGE_CLASSES.CONFIRMED;

                  return (
                    <tr
                      key={booking.id}
                      className={`border-b border-primary/10 hover:bg-primary/10 transition-colors group ${
                        booking.status === 'CANCELLED'
                          ? 'opacity-50'
                          : i % 2 === 0
                            ? 'bg-primary/[0.06]'
                            : ''
                      }`}
                    >
                      {showApartment && (
                        <td className="px-4 py-3.5 font-dubai">
                          <span className="text-[11px] bg-primary/8 text-secondary/60 px-2 py-0.5 rounded-md font-medium">
                            {booking.apartment?.name || '—'}
                          </span>
                        </td>
                      )}
                      <td className="px-4 py-3.5 font-dubai">
                        <p className="font-semibold text-secondary text-[13px]">{booking.clientName}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {booking.clientPhone && (
                            <span className="text-[10px] text-secondary/55 flex items-center gap-0.5 ltr">
                              <Phone size={9} />
                              {booking.clientPhone}
                            </span>
                          )}
                          {booking.arrivalTime && (
                            <span className="text-[10px] text-secondary/55 flex items-center gap-0.5">
                              <Clock size={9} />
                              {booking.arrivalTime}
                            </span>
                          )}
                          {booking.notes && (
                            <span className="text-[10px] text-secondary/45" title={booking.notes}>
                              <FileText size={9} />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-center text-secondary/70 font-dubai text-[12px] hidden sm:table-cell">
                        {formatDate(booking.checkIn)}
                      </td>
                      <td className="px-4 py-3.5 text-center text-secondary/70 font-dubai text-[12px] hidden sm:table-cell">
                        {formatDate(booking.checkOut)}
                      </td>
                      <td className="px-4 py-3.5 text-center font-bold text-secondary font-dubai text-[13px]">
                        {booking.nights}
                      </td>
                      {!hideFinancials && (
                        <td className="px-4 py-3.5 text-center font-bold text-secondary font-dubai text-[13px]">
                          {formatCurrency(booking.amount)}
                        </td>
                      )}
                      <td className="px-4 py-3.5 text-center">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-dubai font-bold ${sourceClass}`}>
                          {getSourceLabel(booking.source)}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center hidden md:table-cell">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-dubai font-bold ${statusClass}`}>
                          {getStatusLabel(booking.status)}
                        </span>
                      </td>
                      {hasActions && (
                        <td className="px-4 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            {canEdit && onEdit && (
                              <button
                                onClick={() => onEdit(booking)}
                                className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors"
                                title={t.accounting.common.edit}
                              >
                                <Pencil size={13} className="text-secondary/50" />
                              </button>
                            )}
                            {canDelete && onDelete && (
                              <button
                                onClick={() => onDelete(booking)}
                                className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors"
                                title={t.accounting.common.delete}
                              >
                                <Trash2 size={13} className="text-secondary/45" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default BookingsList;
