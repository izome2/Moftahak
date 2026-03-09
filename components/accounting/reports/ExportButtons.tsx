'use client';

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FileDown, Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface ExportButtonsProps {
  month: string;
  reportType: 'monthly' | 'annual';
  apartmentId?: string;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({
  month,
  reportType,
}) => {
  const t = useTranslation();
  const [isExporting, setIsExporting] = useState(false);

  const handlePdfExport = useCallback(async () => {
    setIsExporting(true);
    try {
      // Fetch fresh data
      const url = reportType === 'annual'
        ? `/api/accounting/reports/annual?year=${month}`
        : `/api/accounting/reports/monthly?month=${month}`;

      const res = await fetch(url);
      const json = await res.json();
      if (!res.ok) return;

      // Dynamically import PDF generator (keep bundle small)
      const { generateMonthlyPDF, generateAnnualPDF } = await import('@/lib/accounting/pdf-report');

      if (reportType === 'annual') {
        await generateAnnualPDF(json);
      } else {
        await generateMonthlyPDF(json);
      }
    } catch (err) {
      console.error('PDF export error:', err);
    } finally {
      setIsExporting(false);
    }
  }, [month, reportType]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <button
        onClick={handlePdfExport}
        disabled={isExporting}
        className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold
          bg-secondary text-white rounded-xl
          hover:bg-secondary/90 transition-all duration-200 disabled:opacity-50 font-dubai shadow-md"
      >
        {isExporting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileDown className="w-4 h-4" />
        )}
        {isExporting ? t.accounting.reports.downloadingPDF : t.accounting.reports.downloadPDF}
      </button>
    </motion.div>
  );
};

export default ExportButtons;
