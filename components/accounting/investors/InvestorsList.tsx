'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Building2,
  Percent,
  ArrowDownCircle,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Mail,
  Phone,
  Pencil,
  Trash2,
  Loader2,
  Target,
  Settings,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

// --- Types ---
interface InvestmentInfo {
  id: string;
  percentage: number;
  investmentTarget: number;
  apartment: { id: string; name: string };
  _count: { withdrawals: number };
}

interface InvestorRow {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  image?: string | null;
  investments: InvestmentInfo[];
}

interface InvestorsListProps {
  investors: InvestorRow[];
  isLoading?: boolean;
  onViewDetails?: (investor: InvestorRow) => void;
  onEditInvestment?: (investmentId: string, investor: InvestorRow) => void;
  onDeleteInvestment?: (investmentId: string, investor: InvestorRow) => void;
  onAddWithdrawal?: (investor: InvestorRow) => void;
}

const InvestorsList: React.FC<InvestorsListProps> = ({
  investors,
  isLoading,
  onViewDetails,
  onEditInvestment,
  onDeleteInvestment,
  onAddWithdrawal,
}) => {
  const t = useTranslation();
  const { language } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG-u-nu-arab' : 'en-US';
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-secondary/[0.08] shadow-sm p-8">
        <div className="flex items-center justify-center gap-2 text-secondary/70">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-dubai">{t.accounting.investors.loadingInvestors}</span>
        </div>
      </div>
    );
  }

  if (investors.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-12 h-12 rounded-2xl bg-secondary/[0.03] mx-auto mb-3 flex items-center justify-center">
          <Users className="w-6 h-6 text-secondary/60" />
        </div>
        <p className="text-secondary/70 font-dubai text-sm">{t.accounting.investors.noInvestors}</p>
        <p className="text-secondary/75 font-dubai text-xs mt-1">
          {t.accounting.investors.addInvestorHint}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {investors.map((investor, idx) => {
        const isExpanded = expandedId === investor.id;
        const totalApartments = investor.investments.length;
        const fullName = `${investor.firstName} ${investor.lastName}`;

        return (
          <motion.div
            key={investor.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-white rounded-2xl border border-secondary/[0.08] shadow-sm overflow-hidden"
          >
            {/* Investor Header */}
            <button
              onClick={() => setExpandedId(isExpanded ? null : investor.id)}
              className="w-full flex items-center gap-3 px-5 py-4 hover:bg-secondary/[0.02]
                transition-colors"
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-secondary/80
                flex items-center justify-center text-white font-bold text-sm shrink-0"
              >
                {investor.firstName.charAt(0)}
              </div>

              {/* Info */}
              <div className="flex-1 text-right">
                <h3 className="text-sm font-bold text-secondary font-dubai">{fullName}</h3>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  {investor.email && (
                    <span className="flex items-center gap-1 text-xs text-secondary/80">
                      <Mail className="w-3 h-3" />
                      {investor.email}
                    </span>
                  )}
                  {investor.phone && (
                    <span className="flex items-center gap-1 text-xs text-secondary/80">
                      <Phone className="w-3 h-3" />
                      <span dir="ltr">{investor.phone}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Quick stats */}
              <div className="flex items-center gap-3 shrink-0">
                <span className="flex items-center gap-1 text-xs bg-secondary/5 text-secondary
                  px-2 py-1 rounded-full font-dubai font-medium"
                >
                  <Building2 className="w-3 h-3" />
                  {totalApartments} {t.accounting.investors.apartmentUnit}
                </span>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-secondary/80" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-secondary/80" />
                )}
              </div>
            </button>

            {/* Expanded - Investments List */}
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.2 }}
                className="border-t border-secondary/[0.06]"
              >
                {/* Action buttons */}
                <div className="flex items-center gap-2 px-5 py-2.5 bg-secondary/[0.02] border-b border-secondary/[0.06]">
                  <button
                    onClick={() => onAddWithdrawal?.(investor)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium
                      bg-rose-50 text-rose-700 border border-rose-200/60 rounded-lg hover:bg-rose-100 transition-colors font-dubai"
                  >
                    <ArrowDownCircle className="w-3 h-3" />
                    {t.accounting.investors.registerWithdrawal}
                  </button>
                  <button
                    onClick={() => onViewDetails?.(investor)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium
                      bg-secondary/5 text-secondary rounded-lg hover:bg-secondary/10 transition-colors font-dubai"
                  >
                    <DollarSign className="w-3 h-3" />
                    {t.accounting.investors.viewFinancialDetails}
                  </button>
                </div>

                {/* Investments table */}
                {investor.investments.length === 0 ? (
                  <div className="py-6 text-center text-secondary/70 text-xs font-dubai">
                    {t.accounting.investors.noLinkedInvestments}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-secondary/[0.02] border-b border-secondary/[0.06]">
                          <th className="text-right px-4 py-3 text-[11px] text-secondary/70 font-medium font-dubai"><span className="inline-flex items-center gap-1"><Building2 size={12} />{t.accounting.common.apartment}</span></th>
                          <th className="text-right px-4 py-3 text-[11px] text-secondary/70 font-medium font-dubai"><span className="inline-flex items-center gap-1"><Percent size={12} />{t.accounting.investors.percentageLabel}</span></th>
                          <th className="text-right px-4 py-3 text-[11px] text-secondary/70 font-medium font-dubai"><span className="inline-flex items-center gap-1"><Target size={12} />{t.accounting.investors.yearlyTargetHeader}</span></th>
                          <th className="text-right px-4 py-3 text-[11px] text-secondary/70 font-medium font-dubai"><span className="inline-flex items-center gap-1"><ArrowDownCircle size={12} />{t.accounting.investors.withdrawalsHeader}</span></th>
                          <th className="text-right px-4 py-3 text-[11px] text-secondary/70 font-medium font-dubai"><span className="inline-flex items-center gap-1"><Settings size={12} />{t.accounting.investors.actionsHeader}</span></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-secondary/[0.04]">
                        {investor.investments.map((inv) => (
                          <tr key={inv.id} className="hover:bg-secondary/[0.02] transition-colors">
                            <td className="px-4 py-2.5">
                              <span className="flex items-center gap-1.5 font-medium text-secondary font-dubai text-xs">
                                <Building2 className="w-3 h-3 text-secondary/80" />
                                {inv.apartment.name}
                              </span>
                            </td>
                            <td className="px-4 py-2.5">
                              <span className="bg-secondary/[0.06] text-secondary text-xs font-bold
                                px-2 py-0.5 rounded-full font-dubai"
                              >
                                {new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(inv.percentage * 100)}%
                              </span>
                            </td>
                            <td className="px-4 py-2.5">
                              <span className="text-secondary/80 text-xs font-dubai">
                                {inv.investmentTarget > 0
                                  ? `$${new Intl.NumberFormat('en-US').format(inv.investmentTarget)}`
                                  : '—'
                                }
                              </span>
                            </td>
                            <td className="px-4 py-2.5">
                              <span className="text-secondary/85 text-xs font-dubai">
                                {inv._count.withdrawals} {t.accounting.common.operation}
                              </span>
                            </td>
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => onEditInvestment?.(inv.id, investor)}
                                  className="p-1.5 rounded-lg hover:bg-secondary/5 text-secondary/70
                                    hover:text-secondary transition-colors"
                                  title={t.accounting.investors.editPercentageAction}
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => onDeleteInvestment?.(inv.id, investor)}
                                  className="p-1.5 rounded-lg hover:bg-red-50 text-secondary/75
                                    hover:text-red-500 transition-colors"
                                  title={t.accounting.investors.removeFromApartment}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default InvestorsList;
