'use client';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';

// ============================================================================
// PDF Report Generator - مولد التقارير
// Renders a beautiful branded HTML report → captures with html2canvas → jsPDF
// Full Arabic support with Dubai font, matches Moftahak design system
// ============================================================================

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

function fmt(val: number): string {
  return new Intl.NumberFormat('ar-EG').format(Math.round(val));
}

function fmtMonth(month: string): string {
  const [y, m] = month.split('-');
  const months = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
  ];
  return `${months[parseInt(m) - 1]} ${y}`;
}

function fmtDate(): string {
  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());
}

function profitColor(val: number): string {
  return val >= 0 ? '#059669' : '#dc2626';
}

// ============================================================================
// HTML Report Builder — renders styled HTML matching Moftahak design
// ============================================================================

function buildReportHTML(
  title: string,
  subtitle: string,
  summaryCards: { label: string; value: string; color?: string }[],
  sections: { title: string; html: string }[],
): string {
  const cardItems = summaryCards.map(c => `
    <div style="flex:1; min-width:120px; background:#fdf6ee; border:2px solid rgba(237,191,140,0.3); border-radius:16px; padding:16px 12px; text-align:center;">
      <div style="font-size:22px; font-weight:700; color:${c.color || '#10302b'}; margin-bottom:4px; font-family:'Dubai',sans-serif;">${c.value}</div>
      <div style="font-size:11px; color:rgba(16,48,43,0.55); font-family:'Dubai',sans-serif;">${c.label}</div>
    </div>
  `).join('');

  const sectionBlocks = sections.map(s => `
    <div style="margin-bottom:24px;">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
        <div style="width:4px; height:20px; background:#edbf8c; border-radius:4px;"></div>
        <div style="font-size:15px; font-weight:700; color:#10302b; font-family:'Dubai',sans-serif;">${s.title}</div>
      </div>
      ${s.html}
    </div>
  `).join('');

  return `
    <div id="moftahak-report" style="width:794px; font-family:'Dubai','Segoe UI',sans-serif; direction:rtl; background:#fff; color:#10302b;">
      
      <!-- Header -->
      <div style="background:#10302b; padding:24px 32px; display:flex; align-items:center; justify-content:space-between;">
        <div>
          <div style="font-size:22px; font-weight:700; color:#fdf6ee; font-family:'Dubai',sans-serif; margin-bottom:4px;">${title}</div>
          <div style="font-size:12px; color:#edbf8c; font-family:'Dubai',sans-serif;">${subtitle}</div>
        </div>
        <div style="text-align:left;">
          <img src="/logos/logo-white.png" style="height:40px; object-fit:contain;" crossorigin="anonymous" />
        </div>
      </div>

      <!-- Gold accent line -->
      <div style="height:3px; background:linear-gradient(90deg, #edbf8c, #ead3b9, #edbf8c);"></div>

      <!-- Content -->
      <div style="padding:24px 32px;">
        
        <!-- Summary Cards -->
        <div style="display:flex; gap:12px; margin-bottom:28px; flex-wrap:wrap;">
          ${cardItems}
        </div>

        <!-- Sections -->
        ${sectionBlocks}
      </div>

      <!-- Footer -->
      <div style="border-top:2px solid rgba(237,191,140,0.3); padding:12px 32px; display:flex; align-items:center; justify-content:space-between;">
        <div style="font-size:10px; color:rgba(16,48,43,0.4); font-family:'Dubai',sans-serif;">نظام مفتاحك المحاسبي</div>
        <div style="font-size:10px; color:rgba(16,48,43,0.3); font-family:'Dubai',sans-serif;">www.moftahak.com</div>
        <div style="font-size:10px; color:rgba(16,48,43,0.4); font-family:'Dubai',sans-serif;">${fmtDate()}</div>
      </div>
    </div>
  `;
}

function buildTable(
  headers: string[],
  rows: string[][],
  totalsRow?: string[],
): string {
  const ths = headers.map(h =>
    `<th style="padding:10px 12px; font-size:11px; font-weight:700; color:#fdf6ee; background:#10302b; font-family:'Dubai',sans-serif; text-align:center; white-space:nowrap;">${h}</th>`
  ).join('');

  const trs = rows.map((row, idx) => {
    const bg = idx % 2 === 0 ? '#fff' : '#fdf6ee';
    const tds = row.map((cell, ci) =>
      `<td style="padding:9px 12px; font-size:11px; color:#10302b; font-family:'Dubai',sans-serif; text-align:${ci === 0 ? 'right' : 'center'}; background:${bg}; border-bottom:1px solid rgba(237,191,140,0.15);">${cell}</td>`
    ).join('');
    return `<tr>${tds}</tr>`;
  }).join('');

  let totalsHtml = '';
  if (totalsRow) {
    const tds = totalsRow.map((cell, ci) =>
      `<td style="padding:10px 12px; font-size:12px; font-weight:700; color:#10302b; font-family:'Dubai',sans-serif; text-align:${ci === 0 ? 'right' : 'center'}; background:#edbf8c; border-top:2px solid rgba(16,48,43,0.15);">${cell}</td>`
    ).join('');
    totalsHtml = `<tr>${tds}</tr>`;
  }

  return `
    <table style="width:100%; border-collapse:collapse; border:2px solid rgba(237,191,140,0.3); border-radius:12px; overflow:hidden;">
      <thead><tr>${ths}</tr></thead>
      <tbody>${trs}${totalsHtml}</tbody>
    </table>
  `;
}

// ============================================================================
// HTML → PDF Converter
// ============================================================================

async function htmlToPdf(html: string, filename: string): Promise<void> {
  // Create offscreen container
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.zIndex = '-1';
  container.innerHTML = html;
  document.body.appendChild(container);

  // Wait for fonts and images to load
  await document.fonts.ready;
  await new Promise(resolve => setTimeout(resolve, 300));

  const reportEl = container.querySelector('#moftahak-report') as HTMLElement;
  if (!reportEl) {
    document.body.removeChild(container);
    return;
  }

  try {
    const canvas = await html2canvas(reportEl, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageHeight = 297; // A4 height in mm
    let heightLeft = imgHeight;
    let position = 0;

    // First page
    doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Additional pages if content overflows
    while (heightLeft > 0) {
      position -= pageHeight;
      doc.addPage();
      doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    doc.save(filename);
  } finally {
    document.body.removeChild(container);
  }
}

// ============================================================================
// Monthly Report PDF
// ============================================================================

export async function generateMonthlyPDF(data: MonthlyReportData): Promise<void> {
  const totalNights = data.apartments.reduce((s, a) => s + (a.occupiedNights || 0), 0);
  const totalBookings = data.apartments.reduce((s, a) => s + a.bookings, 0);

  const summaryCards = [
    { label: 'عدد الشقق', value: String(data.totals.apartmentsCount) },
    { label: 'إجمالي الإيرادات', value: `${fmt(data.totals.totalRevenue)} $` },
    { label: 'إجمالي المصروفات', value: `${fmt(data.totals.totalExpenses)} $` },
    { label: 'صافي الربح', value: `${fmt(data.totals.profit)} $`, color: profitColor(data.totals.profit) },
  ];

  const sections: { title: string; html: string }[] = [];

  // Apartment performance table
  if (data.apartments.length > 0) {
    const aptHeaders = ['الشقة', 'الإيرادات ($)', 'المصروفات ($)', 'الربح ($)', 'الحجوزات', 'ليالي الإشغال'];
    const aptRows = data.apartments.map(a => [
      a.name,
      fmt(a.revenue),
      fmt(a.expenses),
      `<span style="color:${profitColor(a.profit)}">${fmt(a.profit)}</span>`,
      String(a.bookings),
      String(a.occupiedNights || 0),
    ]);
    const aptTotals = ['الإجمالي', fmt(data.totals.totalRevenue), fmt(data.totals.totalExpenses), fmt(data.totals.profit), String(totalBookings), String(totalNights)];

    sections.push({
      title: 'أداء الشقق',
      html: buildTable(aptHeaders, aptRows, aptTotals),
    });
  }

  // Booking sources
  if (data.bookingsBySource && Object.keys(data.bookingsBySource).length > 0) {
    const srcHeaders = ['المصدر', 'الإيرادات ($)', 'الليالي', 'عدد الحجوزات'];
    const srcRows = Object.entries(data.bookingsBySource).map(([source, d]) => [
      source,
      fmt(d.amount),
      String(d.nights),
      String(d.count),
    ]);

    sections.push({
      title: 'مصادر الحجوزات',
      html: buildTable(srcHeaders, srcRows),
    });
  }

  // Expense categories
  if (data.expensesByCategory && Object.keys(data.expensesByCategory).length > 0) {
    const expHeaders = ['القسم', 'المبلغ ($)', 'العدد'];
    const expRows = Object.entries(data.expensesByCategory).map(([cat, d]) => [
      cat,
      fmt(d.amount),
      String(d.count),
    ]);
    const expTotal = Object.values(data.expensesByCategory).reduce((s, d) => s + d.amount, 0);
    const expCount = Object.values(data.expensesByCategory).reduce((s, d) => s + d.count, 0);

    sections.push({
      title: 'توزيع المصروفات',
      html: buildTable(expHeaders, expRows, ['الإجمالي', fmt(expTotal), String(expCount)]),
    });
  }

  const html = buildReportHTML(
    `تقرير شهر ${fmtMonth(data.month)}`,
    `${data.apartments.length} شقة • نظام مفتاحك المحاسبي`,
    summaryCards,
    sections,
  );

  await htmlToPdf(html, `Moftahak-Report-${data.month}.pdf`);
}

// ============================================================================
// Annual Report PDF
// ============================================================================

export async function generateAnnualPDF(data: AnnualReportData): Promise<void> {
  const summaryCards = [
    { label: 'عدد الشقق', value: String(data.apartmentBreakdown.length) },
    { label: 'إجمالي الإيرادات', value: `${fmt(data.totals.revenue)} $` },
    { label: 'إجمالي المصروفات', value: `${fmt(data.totals.expenses)} $` },
    { label: 'صافي الربح', value: `${fmt(data.totals.profit)} $`, color: profitColor(data.totals.profit) },
  ];

  const sections: { title: string; html: string }[] = [];

  // Monthly breakdown
  if (data.monthlyBreakdown.length > 0) {
    const monthHeaders = ['الشهر', 'الإيرادات ($)', 'المصروفات ($)', 'الربح ($)', 'الحجوزات', 'الليالي'];
    const monthRows = data.monthlyBreakdown.map(m => [
      fmtMonth(m.month),
      fmt(m.revenue),
      fmt(m.expenses),
      `<span style="color:${profitColor(m.profit)}">${fmt(m.profit)}</span>`,
      String(m.bookings),
      String(m.nights),
    ]);
    const monthTotals = ['الإجمالي', fmt(data.totals.revenue), fmt(data.totals.expenses), fmt(data.totals.profit), String(data.totals.bookings), String(data.totals.nights)];

    sections.push({
      title: 'التفصيل الشهري',
      html: buildTable(monthHeaders, monthRows, monthTotals),
    });
  }

  // Apartment breakdown
  if (data.apartmentBreakdown.length > 0) {
    const aptHeaders = ['الشقة', 'الإيرادات ($)', 'المصروفات ($)', 'الربح ($)', 'الحجوزات', 'الليالي'];
    const aptRows = data.apartmentBreakdown.map(a => [
      a.name,
      fmt(a.revenue),
      fmt(a.expenses),
      `<span style="color:${profitColor(a.profit)}">${fmt(a.profit)}</span>`,
      String(a.bookings),
      String(a.nights),
    ]);
    const aptTotals = ['الإجمالي', fmt(data.totals.revenue), fmt(data.totals.expenses), fmt(data.totals.profit), String(data.totals.bookings), String(data.totals.nights)];

    sections.push({
      title: 'أداء الشقق (سنوي)',
      html: buildTable(aptHeaders, aptRows, aptTotals),
    });
  }

  const html = buildReportHTML(
    `التقرير السنوي ${data.year}`,
    `${data.apartmentBreakdown.length} شقة • ${data.monthlyBreakdown.length} شهر • نظام مفتاحك المحاسبي`,
    summaryCards,
    sections,
  );

  await htmlToPdf(html, `Moftahak-Annual-Report-${data.year}.pdf`);
}
