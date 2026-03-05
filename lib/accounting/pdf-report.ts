'use client';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ============================================================================
// PDF Report Generator - مولد التقارير
// Professional Arabic PDF reports matching Moftahak branding
// ============================================================================

// Brand colors
const COLORS = {
  primary: [237, 191, 140] as [number, number, number],      // #edbf8c
  secondary: [16, 48, 43] as [number, number, number],       // #10302b
  accent: [234, 211, 185] as [number, number, number],       // #ead3b9
  white: [253, 246, 238] as [number, number, number],        // #fdf6ee
  green: [34, 197, 94] as [number, number, number],
  red: [239, 68, 68] as [number, number, number],
  textMuted: [16, 48, 43, 0.5] as [number, number, number, number],
};

// ============================================================================
// Types
// ============================================================================

interface ApartmentReport {
  id?: string;
  name: string;
  project?: string;
  revenue: number;
  expenses: number;
  profit: number;
  bookings: number;
  occupiedNights?: number;
  nights?: number;
}

interface Totals {
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  apartmentsCount: number;
}

interface MonthlyReportData {
  month: string;
  apartments: ApartmentReport[];
  bookingsBySource?: Record<string, { amount: number; nights: number; count: number }>;
  expensesByCategory?: Record<string, { amount: number; count: number }>;
  totals: Totals;
}

interface AnnualMonthRow {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  bookings: number;
  nights: number;
}

interface AnnualReportData {
  year: string;
  monthlyBreakdown: AnnualMonthRow[];
  apartmentBreakdown: {
    apartmentId: string;
    name: string;
    project?: string;
    revenue: number;
    expenses: number;
    profit: number;
    bookings: number;
    nights: number;
  }[];
  totals: { revenue: number; expenses: number; profit: number; bookings: number; nights: number };
}

// ============================================================================
// Utils
// ============================================================================

function formatCurrency(val: number): string {
  return new Intl.NumberFormat('ar-EG').format(Math.round(val));
}

function formatMonthArabic(month: string): string {
  const [y, m] = month.split('-');
  const months = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
  ];
  return `${months[parseInt(m) - 1]} ${y}`;
}

function formatDateArabic(): string {
  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());
}

// ============================================================================
// PDF Document Builder
// ============================================================================

async function loadLogoAsBase64(): Promise<string | null> {
  try {
    const response = await fetch('/logos/logo-dark.png');
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function drawHeader(
  doc: jsPDF,
  title: string,
  subtitle: string,
  logoBase64: string | null,
  pageWidth: number
) {
  const margin = 20;
  
  // Header background band
  doc.setFillColor(...COLORS.secondary);
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Gold accent line under header
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 42, pageWidth, 3, 'F');

  // Logo (right side for RTL)
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', pageWidth - margin - 30, 6, 30, 30);
    } catch {
      // Skip logo if it fails
    }
  }

  // Title text (left-aligned since PDF is LTR but we simulate RTL)
  doc.setTextColor(253, 246, 238);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(title, pageWidth - margin - 38, 20, { align: 'right' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(237, 191, 140);
  doc.text(subtitle, pageWidth - margin - 38, 32, { align: 'right' });

  // Date stamp (left side)
  doc.setFontSize(8);
  doc.setTextColor(200, 200, 200);
  doc.text(formatDateArabic(), margin, 20);
  doc.text('Moftahak - Report', margin, 30);

  return 52; // Y position after header
}

function drawSectionTitle(doc: jsPDF, title: string, y: number, pageWidth: number): number {
  const margin = 20;
  
  // Section title with gold left bar
  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(pageWidth - margin - 4, y, 4, 14, 2, 2, 'F');
  
  doc.setTextColor(...COLORS.secondary);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(title, pageWidth - margin - 10, y + 10, { align: 'right' });

  return y + 20;
}

function drawSummaryCards(
  doc: jsPDF,
  cards: { label: string; value: string; color?: [number, number, number] }[],
  y: number,
  pageWidth: number
): number {
  const margin = 20;
  const usableWidth = pageWidth - margin * 2;
  const cardWidth = (usableWidth - (cards.length - 1) * 6) / cards.length;

  cards.forEach((card, i) => {
    const x = pageWidth - margin - (i * (cardWidth + 6)) - cardWidth;

    // Card background
    doc.setFillColor(253, 246, 238);
    doc.roundedRect(x, y, cardWidth, 30, 3, 3, 'F');

    // Card border
    doc.setDrawColor(...COLORS.primary);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, y, cardWidth, 30, 3, 3, 'S');

    // Value
    const valueColor = card.color || COLORS.secondary;
    doc.setTextColor(...valueColor);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(card.value, x + cardWidth / 2, y + 13, { align: 'center' });

    // Label
    doc.setTextColor(16, 48, 43);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(card.label, x + cardWidth / 2, y + 24, { align: 'center' });
  });

  return y + 38;
}

function drawTable(
  doc: jsPDF,
  headers: string[],
  rows: (string | number)[][],
  y: number,
  options?: {
    totalsRow?: (string | number)[];
    columnStyles?: Record<number, { halign?: string; cellWidth?: number }>;
  }
): number {
  const margin = 20;

  // Reverse headers and rows for RTL display
  const rtlHeaders = [...headers].reverse();
  const rtlRows = rows.map(row => [...row].reverse());
  const rtlTotals = options?.totalsRow ? [...options.totalsRow].reverse() : undefined;

  // Build column styles for RTL
  const colCount = headers.length;
  const rtlColumnStyles: Record<number, { halign: 'left' | 'center' | 'right'; cellWidth?: number }> = {};
  for (let i = 0; i < colCount; i++) {
    rtlColumnStyles[i] = { halign: 'center' };
  }
  // First column (was last) is the name — align right
  rtlColumnStyles[colCount - 1] = { halign: 'right' };

  const allRows = rtlTotals ? [...rtlRows, rtlTotals] : rtlRows;

  autoTable(doc, {
    head: [rtlHeaders],
    body: allRows.map(row => row.map(cell => String(cell))),
    startY: y,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 8,
      cellPadding: 4,
      lineColor: [237, 191, 140],
      lineWidth: 0.3,
      textColor: [16, 48, 43],
      font: 'helvetica',
      halign: 'center',
    },
    headStyles: {
      fillColor: COLORS.secondary,
      textColor: [253, 246, 238],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
    },
    alternateRowStyles: {
      fillColor: [253, 246, 238],
    },
    bodyStyles: {
      fillColor: [255, 255, 255],
    },
    columnStyles: rtlColumnStyles,
    didParseCell: (data) => {
      // Style totals row
      if (rtlTotals && data.section === 'body' && data.row.index === allRows.length - 1) {
        data.cell.styles.fillColor = [237, 191, 140];
        data.cell.styles.textColor = [16, 48, 43];
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fontSize = 9;
      }

      // Color profit cells (green/red)
      if (data.section === 'body') {
        const cellText = data.cell.text.join('');
        // Check if this cell contains a negative indicator
        if (cellText.startsWith('-') || cellText.startsWith('−')) {
          data.cell.styles.textColor = [239, 68, 68]; // red
        }
      }
    },
  });

  return (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
}

function drawFooter(doc: jsPDF, pageWidth: number, pageHeight: number) {
  const y = pageHeight - 15;

  // Footer line
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(0.5);
  doc.line(20, y - 5, pageWidth - 20, y - 5);

  doc.setTextColor(16, 48, 43);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Moftahak Accounting System', 20, y);
  
  doc.setTextColor(160, 160, 160);
  doc.text('www.moftahak.com', pageWidth / 2, y, { align: 'center' });

  doc.setTextColor(16, 48, 43);
  doc.text(formatDateArabic(), pageWidth - 20, y, { align: 'right' });
}

// ============================================================================
// Monthly Report PDF
// ============================================================================

export async function generateMonthlyPDF(data: MonthlyReportData): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const logoBase64 = await loadLogoAsBase64();

  // --- Page 1: Summary ---
  let y = drawHeader(
    doc,
    `Monthly Report - ${formatMonthArabic(data.month)}`,
    `${data.apartments.length} apartments | Moftahak`,
    logoBase64,
    pageWidth,
  );

  // Summary cards
  const profitColor: [number, number, number] = data.totals.profit >= 0 ? COLORS.green : COLORS.red;
  y = drawSummaryCards(doc, [
    { label: 'Net Profit ($)', value: formatCurrency(data.totals.profit), color: profitColor },
    { label: 'Total Expenses ($)', value: formatCurrency(data.totals.totalExpenses) },
    { label: 'Total Revenue ($)', value: formatCurrency(data.totals.totalRevenue) },
    { label: 'Apartments', value: String(data.totals.apartmentsCount) },
  ], y, pageWidth);

  // --- Apartments table ---
  y = drawSectionTitle(doc, 'Apartment Performance', y + 4, pageWidth);

  const aptHeaders = ['Apartment', 'Revenue ($)', 'Expenses ($)', 'Profit ($)', 'Bookings', 'Nights'];
  const aptRows = data.apartments.map(a => [
    a.name,
    formatCurrency(a.revenue),
    formatCurrency(a.expenses),
    (a.profit < 0 ? '-' : '') + formatCurrency(Math.abs(a.profit)),
    String(a.bookings),
    String(a.occupiedNights || 0),
  ]);

  const totalNights = data.apartments.reduce((s, a) => s + (a.occupiedNights || 0), 0);
  const totalBookings = data.apartments.reduce((s, a) => s + a.bookings, 0);
  const aptTotals = [
    'Total',
    formatCurrency(data.totals.totalRevenue),
    formatCurrency(data.totals.totalExpenses),
    (data.totals.profit < 0 ? '-' : '') + formatCurrency(Math.abs(data.totals.profit)),
    String(totalBookings),
    String(totalNights),
  ];

  y = drawTable(doc, aptHeaders, aptRows, y, { totalsRow: aptTotals });

  // --- Booking Sources ---
  if (data.bookingsBySource && Object.keys(data.bookingsBySource).length > 0) {
    if (y > pageHeight - 80) {
      drawFooter(doc, pageWidth, pageHeight);
      doc.addPage();
      y = 20;
    }

    y = drawSectionTitle(doc, 'Booking Sources', y + 4, pageWidth);

    const sourceHeaders = ['Source', 'Revenue ($)', 'Nights', 'Bookings'];
    const sourceRows = Object.entries(data.bookingsBySource).map(([source, d]) => [
      source,
      formatCurrency(d.amount),
      String(d.nights),
      String(d.count),
    ]);

    y = drawTable(doc, sourceHeaders, sourceRows, y);
  }

  // --- Expense Categories ---
  if (data.expensesByCategory && Object.keys(data.expensesByCategory).length > 0) {
    if (y > pageHeight - 80) {
      drawFooter(doc, pageWidth, pageHeight);
      doc.addPage();
      y = 20;
    }

    y = drawSectionTitle(doc, 'Expense Categories', y + 4, pageWidth);

    const expHeaders = ['Category', 'Amount ($)', 'Count'];
    const expRows = Object.entries(data.expensesByCategory).map(([cat, d]) => [
      cat,
      formatCurrency(d.amount),
      String(d.count),
    ]);

    const expTotal = Object.values(data.expensesByCategory).reduce((s, d) => s + d.amount, 0);
    const expCountTotal = Object.values(data.expensesByCategory).reduce((s, d) => s + d.count, 0);

    y = drawTable(doc, expHeaders, expRows, y, {
      totalsRow: ['Total', formatCurrency(expTotal), String(expCountTotal)],
    });
  }

  // Footer
  drawFooter(doc, pageWidth, pageHeight);

  // Save
  doc.save(`Moftahak-Report-${data.month}.pdf`);
}

// ============================================================================
// Annual Report PDF
// ============================================================================

export async function generateAnnualPDF(data: AnnualReportData): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const logoBase64 = await loadLogoAsBase64();

  // --- Page 1: Summary ---
  let y = drawHeader(
    doc,
    `Annual Report - ${data.year}`,
    `${data.apartmentBreakdown.length} apartments | 12 months | Moftahak`,
    logoBase64,
    pageWidth,
  );

  // Summary cards
  const profitColor: [number, number, number] = data.totals.profit >= 0 ? COLORS.green : COLORS.red;
  y = drawSummaryCards(doc, [
    { label: 'Net Profit ($)', value: formatCurrency(data.totals.profit), color: profitColor },
    { label: 'Total Expenses ($)', value: formatCurrency(data.totals.expenses) },
    { label: 'Total Revenue ($)', value: formatCurrency(data.totals.revenue) },
    { label: 'Total Bookings', value: String(data.totals.bookings) },
  ], y, pageWidth);

  // --- Monthly breakdown ---
  y = drawSectionTitle(doc, 'Monthly Breakdown', y + 4, pageWidth);

  const monthHeaders = ['Month', 'Revenue ($)', 'Expenses ($)', 'Profit ($)', 'Bookings', 'Nights'];
  const monthRows = data.monthlyBreakdown.map(m => [
    formatMonthArabic(m.month),
    formatCurrency(m.revenue),
    formatCurrency(m.expenses),
    (m.profit < 0 ? '-' : '') + formatCurrency(Math.abs(m.profit)),
    String(m.bookings),
    String(m.nights),
  ]);

  const monthTotals = [
    'Total',
    formatCurrency(data.totals.revenue),
    formatCurrency(data.totals.expenses),
    (data.totals.profit < 0 ? '-' : '') + formatCurrency(Math.abs(data.totals.profit)),
    String(data.totals.bookings),
    String(data.totals.nights),
  ];

  y = drawTable(doc, monthHeaders, monthRows, y, { totalsRow: monthTotals });

  // --- Apartment breakdown ---
  if (y > pageHeight - 80) {
    drawFooter(doc, pageWidth, pageHeight);
    doc.addPage();
    y = 20;
  }

  y = drawSectionTitle(doc, 'Apartment Performance (Annual)', y + 4, pageWidth);

  const aptHeaders = ['Apartment', 'Revenue ($)', 'Expenses ($)', 'Profit ($)', 'Bookings', 'Nights'];
  const aptRows = data.apartmentBreakdown.map(a => [
    a.name,
    formatCurrency(a.revenue),
    formatCurrency(a.expenses),
    (a.profit < 0 ? '-' : '') + formatCurrency(Math.abs(a.profit)),
    String(a.bookings),
    String(a.nights),
  ]);

  const aptTotals = [
    'Total',
    formatCurrency(data.totals.revenue),
    formatCurrency(data.totals.expenses),
    (data.totals.profit < 0 ? '-' : '') + formatCurrency(Math.abs(data.totals.profit)),
    String(data.totals.bookings),
    String(data.totals.nights),
  ];

  y = drawTable(doc, aptHeaders, aptRows, y, { totalsRow: aptTotals });

  // Footer
  drawFooter(doc, pageWidth, pageHeight);

  // Save
  doc.save(`Moftahak-Annual-Report-${data.year}.pdf`);
}
