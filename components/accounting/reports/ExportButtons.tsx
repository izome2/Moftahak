'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Table,
  Printer,
  Loader2,
} from 'lucide-react';

interface ExportButtonsProps {
  month: string;
  reportType: 'monthly' | 'annual';
  apartmentId?: string;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({
  month,
  reportType,
  apartmentId,
}) => {
  const [loadingType, setLoadingType] = useState<string | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const buildCsvUrl = () => {
    const base = reportType === 'annual'
      ? `/api/accounting/reports/annual?year=${month.split('-')[0]}`
      : `/api/accounting/reports/monthly?month=${month}`;
    return apartmentId ? `${base}&apartmentId=${apartmentId}` : base;
  };

  const handleCsvExport = async () => {
    setLoadingType('csv');
    try {
      const res = await fetch(buildCsvUrl());
      const json = await res.json();
      if (!res.ok) return;

      const data = json.data;
      let csv = '\uFEFF'; // UTF-8 BOM for Arabic

      if (reportType === 'annual' && data.apartmentBreakdown) {
        csv += 'الشقة,الإيرادات,المصروفات,الربح,الحجوزات,الليالي\n';
        for (const apt of data.apartmentBreakdown) {
          csv += `${apt.name},${apt.revenue},${apt.expenses},${apt.profit},${apt.bookings},${apt.nights}\n`;
        }
        csv += `\nالإجمالي,${data.totals.revenue},${data.totals.expenses},${data.totals.profit},${data.totals.bookings},${data.totals.nights}\n`;
      } else if (data.apartments) {
        csv += 'الشقة,الإيرادات,المصروفات,الربح,الحجوزات,ليالي الإشغال\n';
        for (const apt of data.apartments) {
          csv += `${apt.name},${apt.revenue},${apt.expenses},${apt.profit},${apt.bookings},${apt.occupiedNights}\n`;
        }
        csv += `\nالإجمالي,${data.totals.totalRevenue},${data.totals.totalExpenses},${data.totals.profit},,\n`;
      }

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${month}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      // silent
    } finally {
      setLoadingType(null);
    }
  };

  const handlePdfExport = () => {
    // Use browser print-to-PDF
    setLoadingType('pdf');
    setTimeout(() => {
      window.print();
      setLoadingType(null);
    }, 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="flex flex-wrap items-center gap-2"
    >
      <button
        onClick={handlePdfExport}
        disabled={!!loadingType}
        className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium
          bg-[#c09080]/8 border border-[#c09080]/20 rounded-xl text-[#c09080]
          hover:bg-[#c09080]/15 transition-all duration-200 disabled:opacity-50 font-dubai"
      >
        {loadingType === 'pdf' ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <FileText className="w-3.5 h-3.5" />
        )}
        PDF
      </button>

      <button
        onClick={handleCsvExport}
        disabled={!!loadingType}
        className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium
          bg-[#8a9a7a]/8 border border-[#8a9a7a]/20 rounded-xl text-[#8a9a7a]
          hover:bg-[#8a9a7a]/15 transition-all duration-200 disabled:opacity-50 font-dubai"
      >
        {loadingType === 'csv' ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Table className="w-3.5 h-3.5" />
        )}
        Excel / CSV
      </button>

      <button
        onClick={handlePrint}
        disabled={!!loadingType}
        className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium
          bg-primary/10 border border-primary/20 rounded-xl text-secondary/70
          hover:bg-primary/20 transition-all duration-200 disabled:opacity-50 font-dubai"
      >
        <Printer className="w-3.5 h-3.5" />
        طباعة
      </button>
    </motion.div>
  );
};

export default ExportButtons;
