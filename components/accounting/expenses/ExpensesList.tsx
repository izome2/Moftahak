'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Receipt, Loader2, Pencil, Trash2, FileText, CheckCircle2, XCircle, Clock, Building2, Tag, Calendar, DollarSign, CircleDot, Settings } from 'lucide-react';
import CategoryBadge from './CategoryBadge';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

interface ExpenseRow {
  id: string;
  description: string;
  category: string;
  amount: number;
  currency: string;
  date: string;
  notes?: string | null;
  apartment?: { id: string; name: string } | null;
  approvalStatus?: string;
  rejectionReason?: string | null;
}

interface ExpensesListProps {
  expenses: ExpenseRow[];
  totalAmount?: number;
  totalCount?: number;
  isLoading?: boolean;
  showApartment?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canApprove?: boolean;
  onEdit?: (expense: ExpenseRow) => void;
  onDelete?: (expense: ExpenseRow) => void;
  onApprove?: (expense: ExpenseRow) => void;
  onReject?: (expense: ExpenseRow) => void;
}

const ApprovalBadge: React.FC<{ status?: string; rejectionReason?: string | null; t: ReturnType<typeof useTranslation> }> = ({ status, rejectionReason, t }) => {
  if (!status) return null;
  const config: Record<string, { icon: React.ReactNode; label: string; className: string }> = {
    PENDING: { icon: <Clock size={11} />, label: t.accounting.expenses.statusPENDING, className: 'bg-amber-50 text-amber-700 border-amber-200' },
    APPROVED: { icon: <CheckCircle2 size={11} />, label: t.accounting.expenses.statusAPPROVED, className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    REJECTED: { icon: <XCircle size={11} />, label: t.accounting.expenses.statusREJECTED, className: 'bg-rose-50 text-rose-700 border-rose-200' },
  };
  const c = config[status] || config.PENDING;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-bold font-dubai ${c.className}`} title={rejectionReason || undefined}>
      {c.icon} {c.label}
    </span>
  );
};

const ExpensesList: React.FC<ExpensesListProps> = ({
  expenses,
  totalAmount,
  totalCount,
  isLoading = false,
  showApartment = true,
  canEdit = false,
  canDelete = false,
  canApprove = false,
  onEdit,
  onDelete,
  onApprove,
  onReject,
}) => {
  const t = useTranslation();
  const { language } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG-u-nu-arab' : 'en-US';
  const currency = t.accounting.common.currency;

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString(locale, { month: 'short', day: 'numeric' });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(locale).format(amount) + ' ' + currency;

  const hasActions = canEdit || canDelete || canApprove;

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
            <Receipt size={14} className="text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-secondary font-dubai tracking-tight">{t.accounting.expenses.expensesList}</h3>
            {totalCount !== undefined && (
              <p className="text-[11px] text-secondary/70 font-dubai">{new Intl.NumberFormat(locale).format(totalCount!)} {t.accounting.common.expense}</p>
            )}
          </div>
        </div>
        {totalAmount !== undefined && !isLoading && (
          <div className="bg-rose-500/8 px-3 py-1.5 rounded-xl">
            <span className="text-sm font-bold text-rose-700 font-dubai">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 text-secondary/60 animate-spin" />
        </div>
      ) : expenses.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 rounded-2xl bg-secondary/[0.03] mx-auto mb-3 flex items-center justify-center">
            <Receipt size={22} className="text-secondary/60" />
          </div>
          <p className="text-secondary/70 font-dubai text-sm">{t.accounting.expenses.noExpensesFilter}</p>
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="block md:hidden">
            {expenses.map((expense, i) => (
              <div
                key={expense.id}
                className={`px-5 py-3.5 space-y-2 ${i < expenses.length - 1 ? 'border-b border-secondary/[0.04]' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-secondary font-dubai text-[13px] truncate">{expense.description}</p>
                    {showApartment && expense.apartment?.name && (
                      <span className="text-[10px] bg-secondary/[0.04] text-secondary/75 px-2 py-0.5 rounded-md font-medium inline-block mt-1">
                        {expense.apartment.name}
                      </span>
                    )}
                  </div>
                  <span className="text-[13px] font-bold text-secondary font-dubai whitespace-nowrap">
                    {formatCurrency(expense.amount)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CategoryBadge category={expense.category} size="sm" showIcon={false} />
                    <ApprovalBadge status={expense.approvalStatus} rejectionReason={expense.rejectionReason} t={t} />
                    <span className="text-[11px] text-secondary/80 font-dubai">{formatDate(expense.date)}</span>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {canApprove && expense.approvalStatus === 'PENDING' && onApprove && onReject && (
                      <>
                        <button onClick={() => onApprove(expense)} className="p-1.5 hover:bg-emerald-50 rounded-lg transition-colors" title={t.accounting.expenses.approve}>
                          <CheckCircle2 size={14} className="text-emerald-600" />
                        </button>
                        <button onClick={() => onReject(expense)} className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors" title={t.accounting.expenses.reject}>
                          <XCircle size={14} className="text-rose-600" />
                        </button>
                      </>
                    )}
                    {canEdit && onEdit && (
                      <button onClick={() => onEdit(expense)} className="p-1.5 hover:bg-secondary/5 rounded-lg transition-colors">
                        <Pencil size={13} className="text-secondary/70" />
                      </button>
                    )}
                    {canDelete && onDelete && (
                      <button onClick={() => onDelete(expense)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={13} className="text-secondary/65" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="overflow-x-auto hidden md:block">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-secondary/[0.02] border-b border-secondary/[0.06]">
                  {showApartment && (
                    <th className="px-4 py-3 text-right text-[11px] text-secondary/70 font-medium font-dubai"><span className="inline-flex items-center gap-1"><Building2 size={12} />{t.accounting.expenses.apartment}</span></th>
                  )}
                  <th className="px-4 py-3 text-right text-[11px] text-secondary/70 font-medium font-dubai"><span className="inline-flex items-center gap-1"><FileText size={12} />{t.accounting.expenses.description}</span></th>
                  <th className="px-4 py-3 text-center text-[11px] text-secondary/70 font-medium font-dubai"><span className="inline-flex items-center gap-1"><Tag size={12} />{t.accounting.expenses.category}</span></th>
                  <th className="px-4 py-3 text-center text-[11px] text-secondary/70 font-medium font-dubai hidden sm:table-cell"><span className="inline-flex items-center gap-1"><Calendar size={12} />{t.accounting.expenses.date}</span></th>
                  <th className="px-4 py-3 text-center text-[11px] text-secondary/70 font-medium font-dubai"><span className="inline-flex items-center gap-1"><DollarSign size={12} />{t.accounting.expenses.amount}</span></th>
                  <th className="px-4 py-3 text-center text-[11px] text-secondary/70 font-medium font-dubai"><span className="inline-flex items-center gap-1"><CircleDot size={12} />{t.accounting.expenses.status}</span></th>
                  {hasActions && (
                    <th className="px-4 py-3 text-center text-[11px] text-secondary/70 font-medium font-dubai w-24"><span className="inline-flex items-center gap-1"><Settings size={12} />{t.accounting.expenses.actions}</span></th>
                  )}
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense, i) => (
                  <tr
                    key={expense.id}
                    className={`border-b border-secondary/[0.04] hover:bg-secondary/[0.02] transition-colors group`}
                  >
                    {showApartment && (
                      <td className="px-4 py-3.5 font-dubai">
                        <span className="text-[11px] bg-secondary/[0.04] text-secondary/75 px-2 py-0.5 rounded-md font-medium">
                          {expense.apartment?.name || '—'}
                        </span>
                      </td>
                    )}
                    <td className="px-4 py-3.5 font-dubai">
                      <p className="font-semibold text-secondary text-[13px]">{expense.description}</p>
                      {expense.notes && (
                        <span className="text-[10px] text-secondary/80 flex items-center gap-0.5 mt-0.5" title={expense.notes}>
                          <FileText size={9} />
                          <span className="truncate max-w-[150px]">{expense.notes}</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <CategoryBadge category={expense.category} size="sm" showIcon={false} />
                    </td>
                    <td className="px-4 py-3.5 text-center text-secondary/75 font-dubai text-[12px] hidden sm:table-cell">
                      {formatDate(expense.date)}
                    </td>
                    <td className="px-4 py-3.5 text-center font-bold text-secondary font-dubai text-[13px]">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <ApprovalBadge status={expense.approvalStatus} rejectionReason={expense.rejectionReason} t={t} />
                    </td>
                    {hasActions && (
                      <td className="px-4 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {canApprove && expense.approvalStatus === 'PENDING' && onApprove && onReject && (
                            <>
                              <button
                                onClick={() => onApprove(expense)}
                                className="p-1.5 hover:bg-emerald-50 rounded-lg transition-colors"
                                title={t.accounting.expenses.approve}
                              >
                                <CheckCircle2 size={14} className="text-emerald-600" />
                              </button>
                              <button
                                onClick={() => onReject(expense)}
                                className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors"
                                title={t.accounting.expenses.reject}
                              >
                                <XCircle size={14} className="text-rose-600" />
                              </button>
                            </>
                          )}
                          {canEdit && onEdit && (
                            <button
                              onClick={() => onEdit(expense)}
                              className="p-1.5 hover:bg-secondary/5 rounded-lg transition-colors"
                              title={t.accounting.common.edit}
                            >
                              <Pencil size={13} className="text-secondary/70" />
                            </button>
                          )}
                          {canDelete && onDelete && (
                            <button
                              onClick={() => onDelete(expense)}
                              className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                              title={t.accounting.common.delete}
                            >
                              <Trash2 size={13} className="text-secondary/65" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default ExpensesList;
