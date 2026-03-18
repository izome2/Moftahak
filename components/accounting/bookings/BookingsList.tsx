'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, Loader2, Pencil, Trash2, Phone, Clock, FileText, Building2, User, LogIn, LogOut, Moon, DollarSign, Globe, CircleDot, Settings } from 'lucide-react';
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
  AIRBNB: 'bg-rose-50 text-rose-600 ring-1 ring-rose-200/60',
  BOOKING_COM: 'bg-blue-50 text-blue-600 ring-1 ring-blue-200/60',
  EXTERNAL: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200/60',
  DIRECT: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200/60',
  OTHER: 'bg-secondary/5 text-secondary/60 ring-1 ring-secondary/10',
};

const STATUS_BADGE_CLASSES: Record<string, string> = {
  CONFIRMED: 'bg-sky-50 text-sky-600',
  CHECKED_IN: 'bg-emerald-50 text-emerald-600',
  CHECKED_OUT: 'bg-secondary/5 text-secondary/50',
  CANCELLED: 'bg-red-50 text-red-400',
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
  const locale = language === 'ar' ? 'ar-EG-u-nu-arab' : 'en-US';
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
      className="bg-white rounded-2xl border border-secondary/[0.08] shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-secondary/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center flex-shrink-0">
            <CalendarCheck size={14} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-secondary font-dubai tracking-tight">{t.accounting.bookings.bookingsList}</h3>
            {totalCount !== undefined && (
              <p className="text-[11px] text-secondary/40 font-dubai">{new Intl.NumberFormat(locale).format(totalCount!)} {t.accounting.common.booking}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {totalNights !== undefined && totalNights > 0 && !isLoading && (
            <span className="text-[11px] font-bold text-secondary/50 font-dubai bg-secondary/[0.04] px-2.5 py-1 rounded-lg">
              {new Intl.NumberFormat(locale).format(totalNights!)} {t.accounting.common.night}
            </span>
          )}
          {totalAmount !== undefined && !isLoading && !hideFinancials && (
            <div className="bg-emerald-500/8 px-3 py-1.5 rounded-xl">
              <span className="text-sm font-bold text-emerald-700 font-dubai">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 text-secondary/30 animate-spin" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 rounded-2xl bg-secondary/[0.03] mx-auto mb-3 flex items-center justify-center">
            <CalendarCheck size={22} className="text-secondary/25" />
          </div>
          <p className="text-secondary/40 font-dubai text-sm">{t.accounting.bookings.noBookingsFilter}</p>
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
                  className={`px-5 py-3.5 space-y-2 ${booking.status === 'CANCELLED' ? 'opacity-40' : ''} ${i < bookings.length - 1 ? 'border-b border-secondary/[0.04]' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-secondary font-dubai text-[13px]">{booking.clientName}</p>
                      {showApartment && booking.apartment?.name && (
                        <span className="text-[10px] bg-secondary/[0.04] text-secondary/50 px-2 py-0.5 rounded-md font-medium inline-block mt-1">
                          {booking.apartment.name}
                        </span>
                      )}
                    </div>
                    {!hideFinancials && (
                      <span className="text-[13px] font-bold text-secondary font-dubai whitespace-nowrap tabular-nums">
                        {formatCurrency(booking.amount)}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-secondary/50 font-dubai">
                    <span>{formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}</span>
                    <span className="font-bold text-secondary/60">{new Intl.NumberFormat(locale).format(booking.nights)} {t.accounting.common.night}</span>
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
                          <button onClick={() => onEdit(booking)} className="p-1.5 hover:bg-secondary/5 rounded-lg transition-colors">
                            <Pencil size={13} className="text-secondary/40" />
                          </button>
                        )}
                        {canDelete && onDelete && (
                          <button onClick={() => onDelete(booking)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={13} className="text-secondary/35" />
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
              <thead className="sticky top-0 z-10">
                <tr className="bg-secondary/[0.02] border-b border-secondary/[0.06]">
                  {showApartment && <th className="px-4 py-3 text-right text-[11px] text-secondary/45 font-medium font-dubai"><span className="inline-flex items-center gap-1"><Building2 size={12} />{t.accounting.bookings.apartment}</span></th>}
                  <th className="px-4 py-3 text-right text-[11px] text-secondary/45 font-medium font-dubai"><span className="inline-flex items-center gap-1"><User size={12} />{t.accounting.bookings.client}</span></th>
                  <th className="px-4 py-3 text-center text-[11px] text-secondary/45 font-medium font-dubai hidden sm:table-cell"><span className="inline-flex items-center gap-1"><LogIn size={12} />{t.accounting.bookings.checkIn}</span></th>
                  <th className="px-4 py-3 text-center text-[11px] text-secondary/45 font-medium font-dubai hidden sm:table-cell"><span className="inline-flex items-center gap-1"><LogOut size={12} />{t.accounting.bookings.checkOut}</span></th>
                  <th className="px-4 py-3 text-center text-[11px] text-secondary/45 font-medium font-dubai"><span className="inline-flex items-center gap-1"><Moon size={12} />{t.accounting.bookings.nights}</span></th>
                  {!hideFinancials && <th className="px-4 py-3 text-center text-[11px] text-secondary/45 font-medium font-dubai"><span className="inline-flex items-center gap-1"><DollarSign size={12} />{t.accounting.bookings.amount}</span></th>}
                  <th className="px-4 py-3 text-center text-[11px] text-secondary/45 font-medium font-dubai"><span className="inline-flex items-center gap-1"><Globe size={12} />{t.accounting.bookings.source}</span></th>
                  <th className="px-4 py-3 text-center text-[11px] text-secondary/45 font-medium font-dubai hidden md:table-cell"><span className="inline-flex items-center gap-1"><CircleDot size={12} />{t.accounting.bookings.status}</span></th>
                  {hasActions && <th className="px-4 py-3 text-center text-[11px] text-secondary/45 font-medium font-dubai w-20"><span className="inline-flex items-center gap-1"><Settings size={12} />{t.accounting.bookings.actions}</span></th>}
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking, i) => {
                  const sourceClass = SOURCE_BADGE_CLASSES[booking.source] || SOURCE_BADGE_CLASSES.OTHER;
                  const statusClass = STATUS_BADGE_CLASSES[booking.status] || STATUS_BADGE_CLASSES.CONFIRMED;

                  return (
                    <tr
                      key={booking.id}
                      className={`border-b border-secondary/[0.04] hover:bg-secondary/[0.02] transition-colors group ${
                        booking.status === 'CANCELLED' ? 'opacity-40' : ''
                      }`}
                    >
                      {showApartment && (
                        <td className="px-4 py-3.5 font-dubai">
                          <span className="text-[11px] bg-secondary/[0.04] text-secondary/50 px-2 py-0.5 rounded-md font-medium">
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
                        {new Intl.NumberFormat(locale).format(booking.nights)}
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
                                className="p-1.5 hover:bg-secondary/5 rounded-lg transition-colors"
                                title={t.accounting.common.edit}
                              >
                                <Pencil size={13} className="text-secondary/40" />
                              </button>
                            )}
                            {canDelete && onDelete && (
                              <button
                                onClick={() => onDelete(booking)}
                                className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                                title={t.accounting.common.delete}
                              >
                                <Trash2 size={13} className="text-red-400/60" />
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
