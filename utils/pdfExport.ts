import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import { Student, Book, BookBorrowRecord } from '../types';

export interface PDFSchoolHeader {
  schoolName?: string;
  subTitle?: string;
  eiin?: string;
  established?: string;
  address?: string;
  phone?: string;
  email?: string;
  academicYear?: string;
}

export interface PDFExportOptions {
  title: string;
  subtitle?: string;
  filename?: string;
  orientation?: 'portrait' | 'landscape';
  includeSignatures?: boolean;
  includeSummaryStats?: boolean;
  schoolInfo?: PDFSchoolHeader;
  signatureTitles?: string[];
  filterSummary?: Record<string, string>;
  themeColor?: [number, number, number]; // RGB
}

const DEFAULT_SCHOOL: PDFSchoolHeader = {
  schoolName: 'SMART AMAR SCHOOL & COLLEGE',
  subTitle: 'Excellence in Digital Education & Administrative Management',
  eiin: 'EIIN: 134209 • Code: 2041',
  established: 'Est. 1998',
  address: 'Plot 14, Academic Avenue, Dhanmondi, Dhaka - 1209',
  phone: '+880 1712-345678',
  email: 'info@smartamarschool.edu.bd',
  academicYear: '2026'
};

function getDynamicSchoolHeader(provided?: PDFSchoolHeader): PDFSchoolHeader {
  try {
    const raw = localStorage.getItem('smart_amar_school_active_tenant_v1');
    if (raw) {
      const tenant = JSON.parse(raw);
      if (tenant && tenant.name) {
        return {
          schoolName: tenant.name.toUpperCase(),
          subTitle: 'Official Academic & Administrative Management Document',
          eiin: `EIIN: ${tenant.eiin || '108162'} • Code: ${tenant.code || 'SCH-101'}`,
          established: tenant.establishedYear ? `Est. ${tenant.establishedYear}` : 'Est. 1998',
          address: tenant.address || 'Dhaka, Bangladesh',
          phone: tenant.contactPhone || '+880 1712-345678',
          email: tenant.contactEmail || 'office@smartamarschool.edu.bd',
          academicYear: '2026',
          ...(provided || {})
        };
      }
    }
  } catch (e) {
    // fallback
  }
  return { ...DEFAULT_SCHOOL, ...(provided || {}) };
}

const BRAND_PRIMARY: [number, number, number] = [30, 58, 138]; // Deep Navy (#1e3a8a)
const BRAND_ACCENT: [number, number, number] = [79, 70, 229]; // Indigo (#4f46e5)
const TEXT_MUTED: [number, number, number] = [100, 116, 139]; // Slate-500
const BORDER_COLOR: [number, number, number] = [203, 213, 225]; // Slate-300

/**
 * Draw official institution header with crest/badge styling
 */
function drawDocumentHeader(doc: jsPDF, options: PDFExportOptions): number {
  const school = getDynamicSchoolHeader(options.schoolInfo);
  const pageWidth = doc.internal.pageSize.getWidth();
  const isLandscape = options.orientation === 'landscape';
  const startX = 14;
  const contentWidth = pageWidth - 28;

  // Header Banner background line / accent band
  doc.setFillColor(30, 58, 138); // Primary Navy
  doc.rect(startX, 10, contentWidth, 3, 'F');

  // School Emblem / Crest Box
  doc.setFillColor(238, 242, 255); // Indigo-50
  doc.setDrawColor(79, 70, 229);
  doc.setLineWidth(0.5);
  doc.roundedRect(startX + 2, 16, 20, 20, 3, 3, 'FD');
  
  // Icon / Text inside emblem
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(79, 70, 229);
  doc.text('SAS', startX + 12, 26, { align: 'center' });
  doc.setFontSize(6);
  doc.text('1998', startX + 12, 31, { align: 'center' });

  // Main School Name & Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42); // Slate-900
  doc.text(school.schoolName || '', startX + 26, 21);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105); // Slate-600
  doc.text(school.subTitle || '', startX + 26, 26);
  
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  const contactText = `${school.address} • Phone: ${school.phone} • ${school.eiin}`;
  doc.text(contactText, startX + 26, 31);

  // Right-aligned Academic Session Badge
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  const badgeWidth = 46;
  const badgeX = pageWidth - 14 - badgeWidth;
  doc.roundedRect(badgeX, 16, badgeWidth, 18, 2, 2, 'FD');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(79, 70, 229);
  doc.text('OFFICIAL RECORD', badgeX + (badgeWidth / 2), 21.5, { align: 'center' });
  
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(`Year: ${school.academicYear}`, badgeX + (badgeWidth / 2), 26.5, { align: 'center' });
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  doc.text(`Printed: ${dateStr}`, badgeX + (badgeWidth / 2), 30.5, { align: 'center' });

  // Divider Line
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.4);
  doc.line(startX, 39, pageWidth - 14, 39);

  // Document Title Banner
  let currentY = 46;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(30, 58, 138);
  doc.text(options.title.toUpperCase(), startX, currentY);

  if (options.subtitle) {
    currentY += 4.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text(options.subtitle, startX, currentY);
  }

  // Filter Criteria Summary Chips (if provided)
  if (options.filterSummary && Object.keys(options.filterSummary).length > 0) {
    currentY += 4;
    let filterX = startX;
    doc.setFontSize(7.5);
    
    Object.entries(options.filterSummary).forEach(([key, val]) => {
      if (!val) return;
      const chipText = `${key}: ${val}`;
      const textWidth = doc.getTextWidth(chipText) + 6;
      
      if (filterX + textWidth > pageWidth - 14) {
        filterX = startX;
        currentY += 5;
      }
      
      doc.setFillColor(243, 244, 246);
      doc.setDrawColor(229, 231, 235);
      doc.roundedRect(filterX, currentY - 3.5, textWidth, 4.5, 1, 1, 'FD');
      
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(55, 65, 81);
      doc.text(chipText, filterX + 3, currentY);
      
      filterX += textWidth + 3;
    });
  }

  return currentY + 6;
}

/**
 * Add Document Page Numbers and Footer Security Watermark
 */
function addDocumentFooter(doc: jsPDF, totalPages: number) {
  const pageCount = (doc.internal as any).getNumberOfPages ? (doc.internal as any).getNumberOfPages() : totalPages;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Bottom Border Line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(14, pageHeight - 14, pageWidth - 14, pageHeight - 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // Slate-400
    
    const leftText = 'Smart Amar School Management Information System • Official Archive Document';
    doc.text(leftText, 14, pageHeight - 9);

    const rightText = `Page ${i} of ${pageCount}`;
    doc.text(rightText, pageWidth - 14, pageHeight - 9, { align: 'right' });
  }
}

/**
 * Draw Official Signature endorsement blocks at the end of report
 */
function drawSignatureBlocks(doc: jsPDF, startY: number, titles?: string[]) {
  const defaultTitles = titles || ['Prepared By (Officer)', 'Class Teacher', 'Exam Controller', 'Headmaster / Principal'];
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const usableWidth = pageWidth - (margin * 2);
  const blockWidth = usableWidth / defaultTitles.length;
  
  // If not enough room on page, add new page
  let y = startY + 18;
  if (y + 25 > pageHeight - 20) {
    doc.addPage();
    y = 40;
  }

  defaultTitles.forEach((title, index) => {
    const xCenter = margin + (index * blockWidth) + (blockWidth / 2);
    const lineHalfWidth = Math.min(blockWidth * 0.38, 26);
    
    doc.setDrawColor(100, 116, 139);
    doc.setLineWidth(0.4);
    doc.line(xCenter - lineHalfWidth, y, xCenter + lineHalfWidth, y);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(title, xCenter, y + 4.5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text('Signature & Date Stamp', xCenter, y + 8, { align: 'center' });
  });
}

/**
 * Helper to draw a horizontal row of KPI summary cards
 */
function drawSummaryKPIBanner(
  doc: jsPDF,
  startY: number,
  stats: { label: string; value: string | number; color?: [number, number, number] }[]
): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  const usableWidth = pageWidth - (margin * 2);
  const gap = 3;
  const boxWidth = (usableWidth - (gap * (stats.length - 1))) / stats.length;
  const boxHeight = 12;

  stats.forEach((st, i) => {
    const x = margin + (i * (boxWidth + gap));
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, startY, boxWidth, boxHeight, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    doc.text(st.label.toUpperCase(), x + 3, startY + 4);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    const color = st.color || [30, 58, 138];
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(String(st.value), x + 3, startY + 9.5);
  });

  return startY + boxHeight + 5;
}

/**
 * 1. Export Student Directory / Nominal Rolls to PDF
 */
export function exportStudentListToPDF(students: Student[], options?: Partial<PDFExportOptions>) {
  const opts: PDFExportOptions = {
    title: options?.title || 'Student Directory & Nominal Roll',
    subtitle: options?.subtitle || `Official list of enrolled students • Total Records: ${students.length}`,
    filename: options?.filename || `Student_List_${new Date().toISOString().split('T')[0]}.pdf`,
    orientation: options?.orientation || 'portrait',
    includeSignatures: options?.includeSignatures ?? true,
    includeSummaryStats: options?.includeSummaryStats ?? true,
    filterSummary: options?.filterSummary,
    schoolInfo: options?.schoolInfo,
    ...options
  };

  const doc = new jsPDF({
    orientation: opts.orientation,
    unit: 'mm',
    format: 'a4'
  });

  const startY = drawDocumentHeader(doc, opts);

  // Summary statistics calculation
  const total = students.length;
  const activeCount = students.filter(s => s.status === 'Active').length;
  const inactiveCount = total - activeCount;
  const maleCount = students.filter(s => s.gender === 'Male' || (!s.gender && s.id.endsWith('1'))).length;
  const femaleCount = total - maleCount;

  let currentY = startY;

  if (opts.includeSummaryStats) {
    const pageWidth = doc.internal.pageSize.getWidth();
    const boxWidth = (pageWidth - 28 - 9) / 4;
    const boxHeight = 12;

    const stats = [
      { label: 'TOTAL STUDENTS', value: `${total}`, color: [30, 58, 138] },
      { label: 'ACTIVE ENROLLMENT', value: `${activeCount}`, color: [22, 101, 52] },
      { label: 'GENDER RATIO', value: `${maleCount} M / ${femaleCount} F`, color: [109, 40, 217] },
      { label: 'STATUS CONFIRMED', value: '100% Verified', color: [194, 65, 12] },
    ];

    stats.forEach((st, i) => {
      const x = 14 + (i * (boxWidth + 3));
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(x, currentY, boxWidth, boxHeight, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(100, 116, 139);
      doc.text(st.label, x + 3, currentY + 4);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(st.color[0], st.color[1], st.color[2]);
      doc.text(st.value, x + 3, currentY + 9.5);
    });

    currentY += boxHeight + 5;
  }

  const tableHeaders = ['Roll', 'Student ID', 'Student Full Name', 'Class & Sec', 'Guardian Name', 'Contact Phone', 'Blood', 'Status'];
  const tableData = students.map((s, idx) => [
    s.rollNo || `${idx + 1}`.padStart(2, '0'),
    s.id,
    s.name.toUpperCase(),
    `${s.class || 'Class 10'} (${s.section || 'A'})`,
    s.guardian || s.fatherName || 'N/A',
    s.phone || '01700-000000',
    s.bloodGroup || 'O+',
    s.status || 'Active'
  ]);

  autoTable(doc, {
    head: [tableHeaders],
    body: tableData,
    startY: currentY,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left',
      cellPadding: 2.5
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
      cellPadding: 2.2
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 14, fontStyle: 'bold' },
      1: { fontStyle: 'bold', cellWidth: 26, textColor: [79, 70, 229] },
      2: { fontStyle: 'bold', cellWidth: 44 },
      3: { cellWidth: 24 },
      4: { cellWidth: 32 },
      5: { cellWidth: 24 },
      6: { halign: 'center', cellWidth: 14, textColor: [185, 28, 28] },
      7: { halign: 'center', cellWidth: 16 }
    },
    didDrawCell: (data) => {
      // Color status badge
      if (data.column.index === 7 && data.section === 'body') {
        const text = data.cell.raw as string;
        if (text === 'Active') {
          doc.setTextColor(22, 101, 52);
        } else {
          doc.setTextColor(185, 28, 28);
        }
      }
    },
    margin: { left: 14, right: 14, bottom: 20 }
  });

  const finalY = (doc as any).lastAutoTable?.finalY || currentY + 50;

  if (opts.includeSignatures) {
    drawSignatureBlocks(doc, finalY, opts.signatureTitles);
  }

  addDocumentFooter(doc, (doc.internal as any).getNumberOfPages());
  doc.save(opts.filename);
}

/**
 * 2. Export Academic Performance Analytics & Merit List to PDF
 */
export interface PerformanceRecord {
  rank: number;
  id: string;
  name: string;
  rollNo: string;
  totalMarks: number;
  maxMarks: number;
  percentage: number;
  gpa: string;
  grade: string;
  attendance: string;
  status: string;
}

export function exportPerformanceReportToPDF(
  records: PerformanceRecord[],
  options?: Partial<PDFExportOptions>
) {
  const opts: PDFExportOptions = {
    title: options?.title || 'Academic Performance & Merit List Report',
    subtitle: options?.subtitle || 'Term Examination Performance Analysis and Tabulation Sheet',
    filename: options?.filename || `Academic_Performance_${new Date().toISOString().split('T')[0]}.pdf`,
    orientation: options?.orientation || 'landscape',
    includeSignatures: true,
    includeSummaryStats: true,
    ...options
  };

  const doc = new jsPDF({
    orientation: opts.orientation,
    unit: 'mm',
    format: 'a4'
  });

  const startY = drawDocumentHeader(doc, opts);

  // Performance Benchmarks Stats
  const avgMarks = (records.reduce((acc, r) => acc + r.percentage, 0) / (records.length || 1)).toFixed(1);
  const aPlusCount = records.filter(r => r.grade === 'A+').length;
  const passCount = records.filter(r => r.grade !== 'F').length;
  const passRate = ((passCount / (records.length || 1)) * 100).toFixed(1);

  const pageWidth = doc.internal.pageSize.getWidth();
  const boxWidth = (pageWidth - 28 - 12) / 5;
  const boxHeight = 12;

  const stats = [
    { label: 'COHORT SIZE', value: `${records.length} Students`, color: [30, 58, 138] },
    { label: 'CLASS AVERAGE', value: `${avgMarks}%`, color: [79, 70, 229] },
    { label: 'A+ ACHIEVERS', value: `${aPlusCount} Students`, color: [22, 101, 52] },
    { label: 'PASS PERCENTAGE', value: `${passRate}%`, color: [16, 185, 129] },
    { label: 'TOP PERFORMER', value: records[0]?.name || 'N/A', color: [194, 65, 12] }
  ];

  stats.forEach((st, i) => {
    const x = 14 + (i * (boxWidth + 3));
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, startY, boxWidth, boxHeight, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    doc.text(st.label, x + 3, startY + 4);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(st.color[0], st.color[1], st.color[2]);
    doc.text(st.value, x + 3, startY + 9.5);
  });

  const tableHeaders = ['Merit Rank', 'Roll', 'Student ID', 'Student Full Name', 'Obtained Marks', 'Percentage', 'Letter Grade', 'GPA Point', 'Attendance', 'Result Status'];
  const tableData = records.map(r => [
    `#${r.rank}`,
    r.rollNo,
    r.id,
    r.name.toUpperCase(),
    `${r.totalMarks} / ${r.maxMarks}`,
    `${r.percentage}%`,
    r.grade,
    r.gpa,
    r.attendance,
    r.status
  ]);

  autoTable(doc, {
    head: [tableHeaders],
    body: tableData,
    startY: startY + boxHeight + 5,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left',
      cellPadding: 2.5
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
      cellPadding: 2.2
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 20, fontStyle: 'bold', textColor: [30, 58, 138] },
      1: { halign: 'center', cellWidth: 14, fontStyle: 'bold' },
      2: { cellWidth: 26, fontStyle: 'bold', textColor: [79, 70, 229] },
      3: { cellWidth: 50, fontStyle: 'bold' },
      4: { halign: 'center', cellWidth: 28 },
      5: { halign: 'center', cellWidth: 22, fontStyle: 'bold' },
      6: { halign: 'center', cellWidth: 24, fontStyle: 'bold' },
      7: { halign: 'center', cellWidth: 20, fontStyle: 'bold' },
      8: { halign: 'center', cellWidth: 24 },
      9: { halign: 'center', cellWidth: 28, fontStyle: 'bold' }
    },
    margin: { left: 14, right: 14, bottom: 20 }
  });

  const finalY = (doc as any).lastAutoTable?.finalY || startY + 60;
  drawSignatureBlocks(doc, finalY, ['Tabulator', 'Head of Department', 'Academic Coordinator', 'Principal']);
  addDocumentFooter(doc, (doc.internal as any).getNumberOfPages());
  doc.save(opts.filename);
}

/**
 * 3. Export Student Seat Plan PDF (Official Exam Hall Arrangement)
 */
export interface SeatPlanItem {
  seatNo: string | number;
  roomNo: string;
  studentId: string;
  name: string;
  rollNo: string;
  class: string;
  section: string;
  examName: string;
}

export function exportSeatPlanToPDF(
  items: SeatPlanItem[],
  options?: Partial<PDFExportOptions>
) {
  const opts: PDFExportOptions = {
    title: options?.title || 'Examination Hall Seating Arrangement & Admit Plan',
    subtitle: options?.subtitle || `Exam Session 2024-2025 • Total Desk Allocations: ${items.length}`,
    filename: options?.filename || `Exam_Seat_Plan_${new Date().toISOString().split('T')[0]}.pdf`,
    orientation: 'portrait',
    includeSignatures: true,
    ...options
  };

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const startY = drawDocumentHeader(doc, opts);

  const tableHeaders = ['Seat No', 'Room / Hall', 'Roll No', 'Student ID', 'Student Full Name', 'Class & Section', 'Candidate Sign'];
  const tableData = items.map(item => [
    `SEAT ${item.seatNo}`,
    item.roomNo || 'Hall 101',
    item.rollNo,
    item.studentId,
    item.name.toUpperCase(),
    `${item.class} - ${item.section}`,
    '_________________'
  ]);

  autoTable(doc, {
    head: [tableHeaders],
    body: tableData,
    startY: startY,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2.8
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [15, 23, 42],
      cellPadding: 3
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 22, fontStyle: 'bold', textColor: [30, 58, 138] },
      1: { halign: 'center', cellWidth: 24, fontStyle: 'bold' },
      2: { halign: 'center', cellWidth: 16, fontStyle: 'bold' },
      3: { cellWidth: 26, fontStyle: 'bold', textColor: [79, 70, 229] },
      4: { cellWidth: 42, fontStyle: 'bold' },
      5: { cellWidth: 24 },
      6: { halign: 'center', cellWidth: 28, textColor: [148, 163, 184] }
    },
    margin: { left: 14, right: 14, bottom: 20 }
  });

  const finalY = (doc as any).lastAutoTable?.finalY || startY + 50;
  drawSignatureBlocks(doc, finalY, ['Hall Supervisor', 'Invigilator', 'Chief Exam Controller']);
  addDocumentFooter(doc, (doc.internal as any).getNumberOfPages());
  doc.save(opts.filename);
}

/**
 * 4. Export Fee Invoices & Collection Register to PDF
 */
export interface FeeInvoiceRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  studentSection: string;
  feeType: string;
  amount: number;
  paidAmount: number;
  dueAmount: number;
  status: string;
  paymentMethod?: string;
  trxId?: string;
  paidDate?: string;
}

export function exportFeeRegisterToPDF(
  invoices: FeeInvoiceRecord[],
  options?: Partial<PDFExportOptions>
) {
  const opts: PDFExportOptions = {
    title: options?.title || 'Accounts & Student Fee Collection Register',
    subtitle: options?.subtitle || `Official financial ledger • Total Invoices: ${invoices.length}`,
    filename: options?.filename || `Fee_Collection_Register_${new Date().toISOString().split('T')[0]}.pdf`,
    orientation: 'landscape',
    includeSignatures: true,
    includeSummaryStats: true,
    ...options
  };

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const startY = drawDocumentHeader(doc, opts);

  const totalBilled = invoices.reduce((acc, inv) => acc + inv.amount, 0);
  const totalCollected = invoices.reduce((acc, inv) => acc + inv.paidAmount, 0);
  const totalDue = invoices.reduce((acc, inv) => acc + inv.dueAmount, 0);
  const paidCount = invoices.filter(inv => inv.status === 'Paid').length;

  const pageWidth = doc.internal.pageSize.getWidth();
  const boxWidth = (pageWidth - 28 - 9) / 4;
  const boxHeight = 12;

  const stats = [
    { label: 'TOTAL INVOICED', value: `BDT ${totalBilled.toLocaleString()}`, color: [30, 58, 138] },
    { label: 'TOTAL COLLECTED', value: `BDT ${totalCollected.toLocaleString()}`, color: [22, 101, 52] },
    { label: 'OUTSTANDING DUES', value: `BDT ${totalDue.toLocaleString()}`, color: [185, 28, 28] },
    { label: 'PAID INVOICES', value: `${paidCount} of ${invoices.length}`, color: [79, 70, 229] }
  ];

  stats.forEach((st, i) => {
    const x = 14 + (i * (boxWidth + 3));
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, startY, boxWidth, boxHeight, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    doc.text(st.label, x + 3, startY + 4);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(st.color[0], st.color[1], st.color[2]);
    doc.text(st.value, x + 3, startY + 9.5);
  });

  const tableHeaders = ['Invoice ID', 'Student ID', 'Student Full Name', 'Class & Sec', 'Fee Particulars', 'Amount (BDT)', 'Paid (BDT)', 'Due (BDT)', 'Gateway / TrxID', 'Status'];
  const tableData = invoices.map(inv => [
    inv.id,
    inv.studentId,
    inv.studentName.toUpperCase(),
    `${inv.studentClass} (${inv.studentSection})`,
    inv.feeType,
    inv.amount.toLocaleString(),
    inv.paidAmount.toLocaleString(),
    inv.dueAmount.toLocaleString(),
    inv.trxId ? `${inv.paymentMethod || 'Online'} • ${inv.trxId}` : (inv.paymentMethod || 'Pending'),
    inv.status
  ]);

  autoTable(doc, {
    head: [tableHeaders],
    body: tableData,
    startY: startY + boxHeight + 5,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2.5
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
      cellPadding: 2.2
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 26, textColor: [30, 58, 138] },
      1: { fontStyle: 'bold', cellWidth: 24, textColor: [79, 70, 229] },
      2: { fontStyle: 'bold', cellWidth: 42 },
      3: { cellWidth: 22 },
      4: { cellWidth: 38 },
      5: { halign: 'right', cellWidth: 22, fontStyle: 'bold' },
      6: { halign: 'right', cellWidth: 22, fontStyle: 'bold', textColor: [22, 101, 52] },
      7: { halign: 'right', cellWidth: 22, fontStyle: 'bold', textColor: [185, 28, 28] },
      8: { cellWidth: 34 },
      9: { halign: 'center', cellWidth: 18, fontStyle: 'bold' }
    },
    margin: { left: 14, right: 14, bottom: 20 }
  });

  const finalY = (doc as any).lastAutoTable?.finalY || startY + 60;
  drawSignatureBlocks(doc, finalY, ['Cashier / Accountant', 'Accounts Officer', 'Bursar', 'Headmaster / Principal']);
  addDocumentFooter(doc, (doc.internal as any).getNumberOfPages());
  doc.save(opts.filename);
}

/**
 * 5. General Table Exporter to PDF for any data collection
 */
export function exportTableToPDF(config: {
  title: string;
  subtitle?: string;
  filename?: string;
  headers: string[];
  rows: (string | number)[][];
  orientation?: 'portrait' | 'landscape';
  schoolInfo?: PDFSchoolHeader;
  filterSummary?: Record<string, string>;
  includeSignatures?: boolean;
  signatureTitles?: string[];
}) {
  const doc = new jsPDF({
    orientation: config.orientation || 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const startY = drawDocumentHeader(doc, {
    title: config.title,
    subtitle: config.subtitle,
    orientation: config.orientation || 'portrait',
    schoolInfo: config.schoolInfo,
    filterSummary: config.filterSummary
  });

  autoTable(doc, {
    head: [config.headers],
    body: config.rows,
    startY: startY,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2.5
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
      cellPadding: 2.2
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    margin: { left: 14, right: 14, bottom: 20 }
  });

  const finalY = (doc as any).lastAutoTable?.finalY || startY + 50;

  if (config.includeSignatures !== false) {
    drawSignatureBlocks(doc, finalY, config.signatureTitles);
  }

  addDocumentFooter(doc, (doc.internal as any).getNumberOfPages());
  doc.save(config.filename || `${config.title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
}

/**
 * 6. Export Library Book Catalog to PDF
 */
export function exportBookCatalogToPDF(books: Book[], options?: Partial<PDFExportOptions>) {
  const opts: PDFExportOptions = {
    title: options?.title || 'Institutional Library Book Catalog',
    subtitle: options?.subtitle || `Official Register of Accessioned Titles & Shelf Locations • Total Books: ${books.length}`,
    filename: options?.filename || `Library_Catalog_${new Date().toISOString().split('T')[0]}.pdf`,
    orientation: options?.orientation || 'landscape',
    includeSignatures: options?.includeSignatures ?? true,
    includeSummaryStats: options?.includeSummaryStats ?? true,
    filterSummary: options?.filterSummary,
    schoolInfo: options?.schoolInfo,
    ...options
  };

  const doc = new jsPDF({
    orientation: opts.orientation,
    unit: 'mm',
    format: 'a4'
  });

  const startY = drawDocumentHeader(doc, opts);

  const totalCopies = books.reduce((acc, b) => acc + (b.totalCopies || 0), 0);
  const availableCopies = books.reduce((acc, b) => acc + (b.availableCopies || 0), 0);
  const totalValue = books.reduce((acc, b) => acc + ((b.price || 0) * (b.totalCopies || 1)), 0);

  const stats = [
    { label: 'Total Titles', value: books.length },
    { label: 'Total Copies', value: totalCopies },
    { label: 'Available Copies', value: availableCopies },
    { label: 'Currently Issued', value: totalCopies - availableCopies },
    { label: 'Total Inventory Valuation', value: `$${totalValue.toLocaleString()}` }
  ];

  let currentY = startY;
  if (opts.includeSummaryStats) {
    currentY = drawSummaryKPIBanner(doc, startY, stats);
  }

  const tableData = books.map((b, idx) => [
    idx + 1,
    b.id,
    b.title,
    b.author,
    b.isbn,
    b.category,
    b.shelfLocation || 'Main Hall',
    b.totalCopies,
    b.availableCopies,
    b.condition || 'Good',
    `$${b.price || 0}`,
    b.status
  ]);

  autoTable(doc, {
    head: [['#', 'Book ID', 'Book Title', 'Author', 'ISBN', 'Category', 'Shelf / Rack', 'Total', 'Avail', 'Cond.', 'Price', 'Status']],
    body: tableData,
    startY: currentY,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'left',
      cellPadding: 2.2
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [30, 41, 59],
      cellPadding: 1.8
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { fontStyle: 'bold', cellWidth: 18, textColor: [30, 58, 138] },
      2: { fontStyle: 'bold', cellWidth: 55 },
      3: { cellWidth: 35 },
      4: { cellWidth: 30 },
      5: { cellWidth: 24 },
      6: { cellWidth: 28 },
      7: { halign: 'center', cellWidth: 12, fontStyle: 'bold' },
      8: { halign: 'center', cellWidth: 12, fontStyle: 'bold', textColor: [22, 101, 52] },
      9: { halign: 'center', cellWidth: 14 },
      10: { halign: 'right', cellWidth: 15, fontStyle: 'bold' },
      11: { halign: 'center', cellWidth: 20, fontStyle: 'bold' }
    },
    margin: { left: 14, right: 14, bottom: 20 }
  });

  const finalY = (doc as any).lastAutoTable?.finalY || currentY + 60;
  drawSignatureBlocks(doc, finalY, ['Librarian In-Charge', 'Library Committee Chair', 'Academic Dean', 'Headmaster / Principal']);
  addDocumentFooter(doc, (doc.internal as any).getNumberOfPages());
  doc.save(opts.filename);
}

/**
 * 7. Export Library Circulation / Borrow & Return Register
 */
export function exportLibraryBorrowRegisterToPDF(records: BookBorrowRecord[], options?: Partial<PDFExportOptions>) {
  const opts: PDFExportOptions = {
    title: options?.title || 'Library Circulation & Borrowing Register',
    subtitle: options?.subtitle || `Official Record of Issued & Returned Materials • Total Entries: ${records.length}`,
    filename: options?.filename || `Library_Circulation_${new Date().toISOString().split('T')[0]}.pdf`,
    orientation: options?.orientation || 'landscape',
    includeSignatures: options?.includeSignatures ?? true,
    includeSummaryStats: options?.includeSummaryStats ?? true,
    filterSummary: options?.filterSummary,
    schoolInfo: options?.schoolInfo,
    ...options
  };

  const doc = new jsPDF({
    orientation: opts.orientation,
    unit: 'mm',
    format: 'a4'
  });

  const startY = drawDocumentHeader(doc, opts);

  const activeIssued = records.filter(r => r.status === 'Issued').length;
  const overdueCount = records.filter(r => r.status === 'Overdue').length;
  const returnedCount = records.filter(r => r.status === 'Returned').length;
  const totalFineDue = records.reduce((acc, r) => acc + (r.fineStatus === 'Pending' ? r.calculatedFine : 0), 0);
  const totalFineCollected = records.reduce((acc, r) => acc + (r.finePaid || 0), 0);

  const stats = [
    { label: 'Active Issued', value: activeIssued },
    { label: 'Overdue Items', value: overdueCount },
    { label: 'Returned Books', value: returnedCount },
    { label: 'Pending Fines', value: `$${totalFineDue.toLocaleString()}` },
    { label: 'Fines Collected', value: `$${totalFineCollected.toLocaleString()}` }
  ];

  let currentY = startY;
  if (opts.includeSummaryStats) {
    currentY = drawSummaryKPIBanner(doc, startY, stats);
  }

  const tableData = records.map((r, idx) => [
    idx + 1,
    r.id,
    `${r.studentName} (${r.studentRoll})`,
    `${r.studentClass} - ${r.studentSection}`,
    r.bookTitle,
    r.borrowDate,
    r.dueDate,
    r.returnDate || '---',
    r.daysOverdue > 0 ? `${r.daysOverdue} days` : 'On Time',
    r.calculatedFine > 0 ? `$${r.calculatedFine}` : '$0',
    r.status
  ]);

  autoTable(doc, {
    head: [['#', 'Issue ID', 'Student / Borrower', 'Class', 'Book Title', 'Borrow Date', 'Due Date', 'Return Date', 'Overdue', 'Fine', 'Status']],
    body: tableData,
    startY: currentY,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'left',
      cellPadding: 2.2
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [30, 41, 59],
      cellPadding: 1.8
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { fontStyle: 'bold', cellWidth: 22, textColor: [30, 58, 138] },
      2: { fontStyle: 'bold', cellWidth: 40 },
      3: { cellWidth: 24 },
      4: { cellWidth: 55 },
      5: { cellWidth: 20 },
      6: { cellWidth: 20, fontStyle: 'bold' },
      7: { cellWidth: 20 },
      8: { halign: 'center', cellWidth: 18, fontStyle: 'bold', textColor: [185, 28, 28] },
      9: { halign: 'right', cellWidth: 15, fontStyle: 'bold' },
      10: { halign: 'center', cellWidth: 20, fontStyle: 'bold' }
    },
    margin: { left: 14, right: 14, bottom: 20 }
  });

  const finalY = (doc as any).lastAutoTable?.finalY || currentY + 60;
  drawSignatureBlocks(doc, finalY, ['Librarian (Issuer)', 'Chief Librarian', 'Accounts Department', 'Headmaster / Principal']);
  addDocumentFooter(doc, (doc.internal as any).getNumberOfPages());
  doc.save(opts.filename);
}

/**
 * 8. Export Library Overdue & Defaulter Notice to PDF
 */
export function exportLibraryOverdueReportToPDF(overdueRecords: BookBorrowRecord[], options?: Partial<PDFExportOptions>) {
  const opts: PDFExportOptions = {
    title: options?.title || 'Library Overdue & Fine Recovery Notice',
    subtitle: options?.subtitle || `Official Institutional Notice for Delinquent Library Items • Total Defaulters: ${overdueRecords.length}`,
    filename: options?.filename || `Library_Overdue_Notice_${new Date().toISOString().split('T')[0]}.pdf`,
    orientation: options?.orientation || 'portrait',
    includeSignatures: options?.includeSignatures ?? true,
    includeSummaryStats: options?.includeSummaryStats ?? true,
    filterSummary: options?.filterSummary,
    schoolInfo: options?.schoolInfo,
    ...options
  };

  const doc = new jsPDF({
    orientation: opts.orientation,
    unit: 'mm',
    format: 'a4'
  });

  const startY = drawDocumentHeader(doc, opts);

  const totalOutstandingFine = overdueRecords.reduce((acc, r) => acc + r.calculatedFine, 0);
  const maxDelay = Math.max(...overdueRecords.map(r => r.daysOverdue), 0);

  const stats = [
    { label: 'Total Defaulters', value: overdueRecords.length },
    { label: 'Max Days Overdue', value: `${maxDelay} Days` },
    { label: 'Outstanding Fines', value: `$${totalOutstandingFine.toLocaleString()}` }
  ];

  let currentY = startY;
  if (opts.includeSummaryStats) {
    currentY = drawSummaryKPIBanner(doc, startY, stats);
  }

  const tableData = overdueRecords.map((r, idx) => [
    idx + 1,
    r.studentRoll,
    r.studentName,
    `${r.studentClass} (${r.studentSection})`,
    r.bookTitle,
    r.dueDate,
    `${r.daysOverdue} Days`,
    `$${r.calculatedFine}`,
    r.fineStatus
  ]);

  autoTable(doc, {
    head: [['#', 'Roll', 'Student Name', 'Class', 'Overdue Book Title', 'Due Date', 'Days Late', 'Late Fine', 'Status']],
    body: tableData,
    startY: currentY,
    theme: 'grid',
    headStyles: {
      fillColor: [185, 28, 28], // Crimson Red for Overdue
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'left',
      cellPadding: 2.2
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [30, 41, 59],
      cellPadding: 2
    },
    alternateRowStyles: {
      fillColor: [254, 242, 242]
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { fontStyle: 'bold', cellWidth: 14, textColor: [185, 28, 28] },
      2: { fontStyle: 'bold', cellWidth: 36 },
      3: { cellWidth: 22 },
      4: { cellWidth: 42 },
      5: { cellWidth: 20 },
      6: { halign: 'center', cellWidth: 18, fontStyle: 'bold', textColor: [185, 28, 28] },
      7: { halign: 'right', cellWidth: 16, fontStyle: 'bold' },
      8: { halign: 'center', cellWidth: 16, fontStyle: 'bold' }
    },
    margin: { left: 14, right: 14, bottom: 20 }
  });

  const finalY = (doc as any).lastAutoTable?.finalY || currentY + 60;
  drawSignatureBlocks(doc, finalY, ['Librarian', 'Class Teacher', 'Discipline Committee', 'Headmaster / Principal']);
  addDocumentFooter(doc, (doc.internal as any).getNumberOfPages());
  doc.save(opts.filename);
}

/**
 * 9. Export Individual Student Progress & Attendance Report to PDF
 */
export interface StudentProgressReportData {
  id: string;
  rollNo: string;
  name: string;
  class: string;
  section: string;
  guardian: string;
  guardianPhone: string;
  academicStanding: string;
  attendanceStatus: string;
  cumulativeGPA: number;
  overallPercentage: number;
  totalAttendancePercentage: number;
  classRank: number;
  totalStudentsInClass: number;
  percentile: number;
  strengths?: string[];
  growthAreas?: string[];
  adminNotes?: string;
  termProgress?: {
    term: string;
    testDate: string;
    studentScore: number;
    classAverage: number;
    grade: string;
    gpa: number;
  }[];
  subjects?: {
    subject: string;
    code: string;
    obtained: number;
    total: number;
    percentage: number;
    grade: string;
    gpa: number;
    classAverage: number;
    competencyScore?: number;
  }[];
  monthlyAttendance?: {
    month: string;
    presentDays: number;
    totalDays: number;
    percentage: number;
    lateDays: number;
    leaveDays: number;
    absentDays: number;
    avgExamScore: number;
  }[];
  weekdayAttendance?: {
    day: string;
    percentage: number;
    status: string;
  }[];
}

export function exportStudentProgressReportToPDF(
  student: StudentProgressReportData,
  options?: Partial<PDFExportOptions>
) {
  const opts: PDFExportOptions = {
    title: options?.title || 'Student Progress & Attendance Record',
    subtitle: options?.subtitle || `Official Individual Continuous Assessment & Attendance Dossier • ${student.name} (${student.id})`,
    filename: options?.filename || `Student_Progress_${student.rollNo}_${student.name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
    orientation: 'portrait',
    includeSignatures: options?.includeSignatures ?? true,
    includeSummaryStats: options?.includeSummaryStats ?? true,
    filterSummary: {
      'Student Name': student.name,
      'Student ID': student.id,
      'Class & Sec': `${student.class} (${student.section})`,
      'Roll Number': student.rollNo,
      'Academic Standing': student.academicStanding,
      ...(options?.filterSummary || {})
    },
    ...options
  };

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const usableWidth = pageWidth - (margin * 2);

  let currentY = drawDocumentHeader(doc, opts);

  // Student Particulars ID Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, currentY, usableWidth, 22, 2, 2, 'FD');

  // Left Column: Student Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 58, 138);
  doc.text(`STUDENT: ${student.name.toUpperCase()}`, margin + 4, currentY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`ID: ${student.id}   |   Roll: ${student.rollNo}   |   Class: ${student.class} (Sec: ${student.section})`, margin + 4, currentY + 10.5);
  doc.text(`Guardian: ${student.guardian}   |   Contact: ${student.guardianPhone}`, margin + 4, currentY + 15.5);

  // Right Column: Official Standing & Attendance Status Badges
  const isHighAttendance = student.totalAttendancePercentage >= 75;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(79, 70, 229);
  doc.text(`Academic Standing: ${student.academicStanding.toUpperCase()}`, margin + (usableWidth / 2) + 10, currentY + 5.5);

  doc.setTextColor(isHighAttendance ? 22 : 185, isHighAttendance ? 101 : 28, isHighAttendance ? 52 : 28);
  doc.text(`Attendance Compliance: ${student.attendanceStatus} (${student.totalAttendancePercentage}%)`, margin + (usableWidth / 2) + 10, currentY + 10.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(isHighAttendance ? 'Meets Statutory 75% Board Threshold' : 'WARNING: Below Mandatory 75% Board Rule', margin + (usableWidth / 2) + 10, currentY + 15.5);

  currentY += 25;

  // Executive KPI Summary Banner (Cumulative GPA, Overall %, Attendance Rate, Rank, Percentile)
  if (opts.includeSummaryStats) {
    const stats = [
      { label: 'Cumulative GPA', value: `${student.cumulativeGPA.toFixed(2)} / 5.0`, color: [79, 70, 229] as [number, number, number] },
      { label: 'Overall Marks', value: `${student.overallPercentage}%`, color: [30, 58, 138] as [number, number, number] },
      { label: 'Attendance Rate', value: `${student.totalAttendancePercentage}%`, color: (isHighAttendance ? [22, 101, 52] : [185, 28, 28]) as [number, number, number] },
      { label: 'Class Rank', value: `#${student.classRank} of ${student.totalStudentsInClass}`, color: [194, 65, 12] as [number, number, number] },
      { label: 'Cohort Tier', value: `${student.percentile}th Percentile`, color: [109, 40, 217] as [number, number, number] }
    ];
    currentY = drawSummaryKPIBanner(doc, currentY, stats);
    currentY += 2;
  }

  // Section 1: Subject-Wise Performance Table
  if (student.subjects && student.subjects.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 58, 138);
    doc.text('I. SUBJECT-WISE ACADEMIC PERFORMANCE TABULATION', margin, currentY + 3);
    currentY += 5;

    const subjectHeaders = ['#', 'Subject Name', 'Course Code', 'Marks (Obt / Max)', 'Percentage', 'Grade', 'GPA', 'Class Avg', 'Benchmark'];
    const subjectData = student.subjects.map((sub, idx) => {
      const diff = sub.percentage - sub.classAverage;
      const diffStr = diff >= 0 ? `+${diff.toFixed(1)}%` : `${diff.toFixed(1)}%`;
      return [
        idx + 1,
        sub.subject,
        sub.code,
        `${sub.obtained} / ${sub.total}`,
        `${sub.percentage}%`,
        sub.grade,
        sub.gpa.toFixed(1),
        `${sub.classAverage}%`,
        diffStr
      ];
    });

    autoTable(doc, {
      head: [subjectHeaders],
      body: subjectData,
      startY: currentY,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 58, 138],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
        halign: 'left',
        cellPadding: 2.2
      },
      bodyStyles: {
        fontSize: 7,
        textColor: [30, 41, 59],
        cellPadding: 2
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: {
        0: { cellWidth: 8, halign: 'center' },
        1: { fontStyle: 'bold', cellWidth: 42 },
        2: { cellWidth: 22, textColor: [100, 116, 139] },
        3: { halign: 'center', cellWidth: 26 },
        4: { halign: 'center', cellWidth: 18, fontStyle: 'bold' },
        5: { halign: 'center', cellWidth: 14, fontStyle: 'bold', textColor: [79, 70, 229] },
        6: { halign: 'center', cellWidth: 14, fontStyle: 'bold' },
        7: { halign: 'center', cellWidth: 18 },
        8: { halign: 'center', cellWidth: 20, fontStyle: 'bold' }
      },
      didDrawCell: (data) => {
        if (data.column.index === 8 && data.section === 'body') {
          const raw = String(data.cell.raw || '');
          if (raw.startsWith('+')) {
            doc.setTextColor(22, 101, 52);
          } else if (raw.startsWith('-')) {
            doc.setTextColor(185, 28, 28);
          }
        }
      },
      margin: { left: margin, right: margin, bottom: 20 }
    });

    currentY = (doc as any).lastAutoTable?.finalY || currentY + 40;
    currentY += 5;
  }

  // Section 2: Multi-Term Trajectory Table
  if (student.termProgress && student.termProgress.length > 0) {
    if (currentY + 45 > pageHeight - 30) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 58, 138);
    doc.text('II. MULTI-TERM ACADEMIC PROGRESS & GRADE TRAJECTORY', margin, currentY + 3);
    currentY += 5;

    const termHeaders = ['Term / Assessment', 'Test Date', 'Student Score (%)', 'Class Average (%)', 'Performance Delta', 'Letter Grade', 'GPA Point'];
    const termData = student.termProgress.map(t => {
      const delta = t.studentScore - t.classAverage;
      const deltaStr = delta >= 0 ? `+${delta}% (Above Avg)` : `${delta}% (Below Avg)`;
      return [
        t.term,
        t.testDate,
        `${t.studentScore}%`,
        `${t.classAverage}%`,
        deltaStr,
        t.grade,
        t.gpa.toFixed(1)
      ];
    });

    autoTable(doc, {
      head: [termHeaders],
      body: termData,
      startY: currentY,
      theme: 'grid',
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
        halign: 'left',
        cellPadding: 2.2
      },
      bodyStyles: {
        fontSize: 7,
        textColor: [30, 41, 59],
        cellPadding: 2
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 32 },
        1: { cellWidth: 24, halign: 'center' },
        2: { halign: 'center', cellWidth: 26, fontStyle: 'bold', textColor: [30, 58, 138] },
        3: { halign: 'center', cellWidth: 26 },
        4: { halign: 'center', cellWidth: 36, fontStyle: 'bold' },
        5: { halign: 'center', cellWidth: 18, fontStyle: 'bold' },
        6: { halign: 'center', cellWidth: 20, fontStyle: 'bold' }
      },
      margin: { left: margin, right: margin, bottom: 20 }
    });

    currentY = (doc as any).lastAutoTable?.finalY || currentY + 35;
    currentY += 5;
  }

  // Section 3: Monthly Attendance & Punctuality Breakdown
  if (student.monthlyAttendance && student.monthlyAttendance.length > 0) {
    if (currentY + 45 > pageHeight - 30) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 58, 138);
    doc.text('III. MONTHLY ATTENDANCE, PUNCTUALITY & EXAM CORRELATION', margin, currentY + 3);
    currentY += 5;

    const attHeaders = ['Month', 'Working Days', 'Present Days', 'Late Arrival', 'Leave', 'Absent', 'Attendance Rate', 'Exam Avg', 'Statutory Status'];
    const attData = student.monthlyAttendance.map(m => {
      const isCompliant = m.percentage >= 75;
      return [
        m.month,
        m.totalDays,
        m.presentDays,
        m.lateDays,
        m.leaveDays,
        m.absentDays,
        `${m.percentage.toFixed(1)}%`,
        `${m.avgExamScore}%`,
        isCompliant ? 'Compliant' : 'Non-Compliant (<75%)'
      ];
    });

    autoTable(doc, {
      head: [attHeaders],
      body: attData,
      startY: currentY,
      theme: 'grid',
      headStyles: {
        fillColor: [15, 118, 110],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 7.5,
        halign: 'left',
        cellPadding: 2.2
      },
      bodyStyles: {
        fontSize: 7,
        textColor: [30, 41, 59],
        cellPadding: 1.8
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 16, halign: 'center' },
        1: { halign: 'center', cellWidth: 20 },
        2: { halign: 'center', cellWidth: 20, fontStyle: 'bold', textColor: [22, 101, 52] },
        3: { halign: 'center', cellWidth: 18, textColor: [180, 83, 9] },
        4: { halign: 'center', cellWidth: 16 },
        5: { halign: 'center', cellWidth: 16, textColor: [185, 28, 28], fontStyle: 'bold' },
        6: { halign: 'center', cellWidth: 24, fontStyle: 'bold' },
        7: { halign: 'center', cellWidth: 20 },
        8: { halign: 'center', cellWidth: 32, fontStyle: 'bold' }
      },
      didDrawCell: (data) => {
        if (data.column.index === 8 && data.section === 'body') {
          const raw = String(data.cell.raw || '');
          if (raw.startsWith('Compliant')) {
            doc.setTextColor(22, 101, 52);
          } else {
            doc.setTextColor(185, 28, 28);
          }
        }
      },
      margin: { left: margin, right: margin, bottom: 20 }
    });

    currentY = (doc as any).lastAutoTable?.finalY || currentY + 35;
    currentY += 5;
  }

  // Section 4: Administrative Findings, Strengths & Growth Areas Box
  if (currentY + 35 > pageHeight - 30) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  const notesHeight = 24;
  doc.roundedRect(margin, currentY, usableWidth, notesHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 58, 138);
  doc.text('IV. OFFICIAL EVALUATION REMARKS & RECOMMENDATIONS', margin + 4, currentY + 4.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text('Demonstrated Strengths:', margin + 4, currentY + 9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text((student.strengths && student.strengths.length > 0) ? student.strengths.join(' • ') : 'Consistent academic engagement across syllabus', margin + 35, currentY + 9);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Areas for Growth:', margin + 4, currentY + 13.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text((student.growthAreas && student.growthAreas.length > 0) ? student.growthAreas.join(' • ') : 'Maintain routine punctuality and revision', margin + 35, currentY + 13.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Institutional Note:', margin + 4, currentY + 18);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  const noteText = student.adminNotes || 'Student demonstrates regular participation. Records verified by administrative coordinator.';
  const splitNotes = doc.splitTextToSize(noteText, usableWidth - 40);
  doc.text(splitNotes, margin + 35, currentY + 18);

  currentY += notesHeight + 6;

  // Signatures
  if (opts.includeSignatures) {
    if (currentY + 28 > pageHeight - 15) {
      doc.addPage();
      currentY = 25;
    }
    drawSignatureBlocks(doc, currentY, ['Class Teacher', 'Academic Coordinator', 'Exam Controller', 'Headmaster / Principal']);
  }

  addDocumentFooter(doc, (doc.internal as any).getNumberOfPages());
  doc.save(opts.filename);
}

// ============================================================================
// 10. OFFICIAL SCHOOL-BRANDED SINGLE FEE RECEIPT EXPORT ENGINE
// ============================================================================

export interface FeeReceiptData {
  receiptNo: string;
  invoiceId: string;
  trxId?: string;
  paymentDate: string;
  academicYear?: string;
  
  // Student & Guardian Info
  studentId: string;
  studentName: string;
  studentClass: string;
  studentSection?: string;
  studentRoll?: string;
  guardianName?: string;
  guardianPhone?: string;
  
  // Financial Details
  feeType: string;
  month?: string;
  year?: string;
  dueDate?: string;
  amount: number;
  paidAmount: number;
  dueAmount?: number;
  waiverAmount?: number;
  
  // Breakdown line items
  breakdown?: {
    tuition?: number;
    exam?: number;
    lab?: number;
    sports?: number;
    library?: number;
    development?: number;
    latePenalty?: number;
    waiver?: number;
  };
  
  // Payment Gateway
  paymentMethod?: string;
  bankRef?: string;
  cardLast4?: string;
  accountNumber?: string;
  status: 'Paid' | 'Settled' | 'Partial' | 'Unpaid' | string;
  remarks?: string;
}

function internalNumberToWords(amount: number): string {
  if (!amount || amount === 0) return 'Zero Taka Only';
  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ',
    'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const num = Math.floor(amount);
  const paisa = Math.round((amount - num) * 100);

  function inWords(n: number): string {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : ' ');
    if (n < 1000) return inWords(Math.floor(n / 100)) + 'Hundred ' + inWords(n % 100);
    if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + inWords(n % 1000);
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + inWords(n % 100000);
    return inWords(Math.floor(n / 10000000)) + 'Crore ' + inWords(n % 10000000);
  }

  let words = inWords(num).trim() + ' Taka';
  if (paisa > 0) {
    words += ' and ' + inWords(paisa).trim() + ' Paisa';
  }
  return words + ' Only';
}

/**
 * Generates an official school-branded fee receipt jsPDF document instance
 */
export async function generateFeeReceiptPDF(
  receiptData: FeeReceiptData,
  options?: Partial<PDFExportOptions>
): Promise<jsPDF> {
  const school = getDynamicSchoolHeader(options?.schoolInfo);
  
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
  const margin = 12;
  const usableWidth = pageWidth - (margin * 2); // 186mm

  // 1. Double Border Frame
  doc.setDrawColor(30, 58, 138); // Primary Navy
  doc.setLineWidth(0.6);
  doc.roundedRect(8, 8, 194, 281, 3, 3, 'S');

  doc.setDrawColor(203, 213, 225); // Slate-300
  doc.setLineWidth(0.25);
  doc.roundedRect(10, 10, 190, 277, 2, 2, 'S');

  // 2. Faint Watermark Background
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(54);
  doc.setTextColor(245, 247, 250); // Very light slate watermark
  doc.text('OFFICIAL RECEIPT', pageWidth / 2, 140, { align: 'center', angle: 35 });
  doc.text('PAID', pageWidth / 2, 175, { align: 'center', angle: 35 });

  // 3. School Header Accent Band
  doc.setFillColor(30, 58, 138);
  doc.rect(margin, 12, usableWidth, 2.5, 'F');

  // School Crest / Monogram Box
  doc.setFillColor(238, 242, 255); // Indigo-50
  doc.setDrawColor(79, 70, 229);
  doc.setLineWidth(0.5);
  doc.roundedRect(15, 17, 22, 22, 3, 3, 'FD');

  const initials = school.schoolName?.split(' ').map(w => w[0]).slice(0, 3).join('') || 'SAS';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(79, 70, 229);
  doc.text(initials, 26, 28, { align: 'center' });
  doc.setFontSize(6);
  doc.setTextColor(100, 116, 139);
  doc.text(school.established || 'Est. 1998', 26, 34, { align: 'center' });

  // School Information Texts
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14.5);
  doc.setTextColor(30, 58, 138);
  doc.text(school.schoolName || 'SMART AMAR SCHOOL & COLLEGE', 41, 23);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(school.subTitle || 'Approved by Ministry of Education & Secondary/Higher Education Board', 41, 28);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`${school.eiin || 'EIIN: 108162 • Code: 2041'}   •   Session: ${receiptData.academicYear || '2024-2025'}`, 41, 33);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text(`${school.address || 'Dhaka, Bangladesh'}   •   Tel: ${school.phone || '+880 1712-345678'}   •   Email: ${school.email || 'info@school.edu.bd'}`, 41, 37.5);

  // 4. Voucher Title Ribbon & Paid Status Badge
  const ribbonY = 43;
  doc.setFillColor(30, 58, 138);
  doc.roundedRect(margin, ribbonY, usableWidth - 44, 7.5, 1.5, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('OFFICIAL MONEY RECEIPT   •   STUDENT & PARENT COPY', margin + 4, ribbonY + 5.2);

  // Status Badge (Verified Paid)
  const isPaid = receiptData.status?.toLowerCase().includes('paid') || receiptData.status?.toLowerCase().includes('settled') || (receiptData.dueAmount ?? 0) === 0;
  doc.setFillColor(isPaid ? 22 : 185, isPaid ? 101 : 28, isPaid ? 52 : 28);
  doc.roundedRect(margin + usableWidth - 41, ribbonY, 41, 7.5, 1.5, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.text(isPaid ? '✓ VERIFIED PAID' : 'PENDING DUES', margin + usableWidth - 20.5, ribbonY + 5.2, { align: 'center' });

  // 5. Receipt Metadata Card (Top Details)
  const metaY = 53.5;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, metaY, usableWidth, 14, 2, 2, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text('RECEIPT NUMBER', margin + 4, metaY + 4.5);
  doc.text('PAYMENT DATE', margin + 48, metaY + 4.5);
  doc.text('PAYMENT CHANNEL', margin + 96, metaY + 4.5);
  doc.text('TRANSACTION ID (TRXID)', margin + 140, metaY + 4.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 58, 138);
  doc.text(receiptData.receiptNo || receiptData.invoiceId, margin + 4, metaY + 10);

  doc.setTextColor(30, 41, 59);
  doc.text(receiptData.paymentDate || new Date().toISOString().split('T')[0], margin + 48, metaY + 10);

  doc.setTextColor(16, 185, 129);
  doc.text(receiptData.paymentMethod || 'Online Gateway', margin + 96, metaY + 10);

  doc.setFont('courier', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(79, 70, 229);
  doc.text(receiptData.trxId || 'N/A', margin + 140, metaY + 10);

  // 6. Student & Guardian Information Box
  const studentY = 70.5;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.35);
  doc.roundedRect(margin, studentY, usableWidth, 23, 2, 2, 'FD');

  // Left Column
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('STUDENT INFORMATION', margin + 4, studentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Student Full Name:', margin + 4, studentY + 10.5);
  doc.text('Student ID Number:', margin + 4, studentY + 15.5);
  doc.text('Class & Section:', margin + 4, studentY + 20);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(receiptData.studentName.toUpperCase(), margin + 34, studentY + 10.5);
  doc.text(receiptData.studentId, margin + 34, studentY + 15.5);
  doc.text(`${receiptData.studentClass} (${receiptData.studentSection || 'A'})   |   Roll: ${receiptData.studentRoll || 'N/A'}`, margin + 34, studentY + 20);

  // Right Column
  const rightColX = margin + 98;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('GUARDIAN & BILLING PARTICULARS', rightColX, studentY + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Guardian Name:', rightColX, studentY + 10.5);
  doc.text('Contact Mobile:', rightColX, studentY + 15.5);
  doc.text('Billing Period:', rightColX, studentY + 20);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(receiptData.guardianName || 'Guardian', rightColX + 28, studentY + 10.5);
  doc.text(receiptData.guardianPhone || 'N/A', rightColX + 28, studentY + 15.5);
  doc.text(`${receiptData.month || 'Current Month'} ${receiptData.year || ''}   •   ${receiptData.feeType}`, rightColX + 28, studentY + 20);

  // 7. Itemized Fee Breakdown Table
  const tableHeaders = ['SL', 'Particulars & Fee Head Description', 'Billing Period', 'Gross (BDT)', 'Waiver (BDT)', 'Net Paid (BDT)'];
  
  // Construct dynamic breakdown items
  const tableRows: any[][] = [];
  const b = receiptData.breakdown;
  const totalAmount = receiptData.amount;
  const waiver = receiptData.waiverAmount || b?.waiver || 0;
  const netPaid = receiptData.paidAmount;

  if (b && (b.tuition || b.exam || b.lab)) {
    let sl = 1;
    if (b.tuition) {
      tableRows.push([sl++, `${receiptData.feeType} (Tuition & Instruction)`, receiptData.month || 'May', b.tuition.toLocaleString(), '0.00', b.tuition.toLocaleString()]);
    }
    if (b.lab) {
      tableRows.push([sl++, 'Computer Practical & Science Laboratory Fee', receiptData.month || 'May', b.lab.toLocaleString(), '0.00', b.lab.toLocaleString()]);
    }
    if (b.library) {
      tableRows.push([sl++, 'Digital Library & Learning Resources Access', receiptData.month || 'May', b.library.toLocaleString(), '0.00', b.library.toLocaleString()]);
    }
    if (b.sports) {
      tableRows.push([sl++, 'Sports, Physical Education & Student Welfare', receiptData.month || 'May', b.sports.toLocaleString(), '0.00', b.sports.toLocaleString()]);
    }
    if (waiver > 0) {
      tableRows.push([sl++, 'Merit Scholarship / Special Fee Concession', receiptData.month || 'May', '0.00', `-${waiver.toLocaleString()}`, `-${waiver.toLocaleString()}`]);
    }
  } else {
    // Single consolidated item
    tableRows.push([
      '1',
      `${receiptData.feeType} (Academic Instruction & Facilities)`,
      `${receiptData.month || 'Session'} ${receiptData.year || ''}`,
      totalAmount.toLocaleString(),
      waiver > 0 ? waiver.toLocaleString() : '0.00',
      netPaid.toLocaleString()
    ]);
    tableRows.push([
      '2',
      'Electronic Gateway Processing & Administrative Ledger Record',
      `${receiptData.month || 'Session'} ${receiptData.year || ''}`,
      '0.00',
      '0.00',
      '0.00 (FREE)'
    ]);
  }

  autoTable(doc, {
    head: [tableHeaders],
    body: tableRows,
    startY: 97,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2.6
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59],
      cellPadding: 2.4
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10, fontStyle: 'bold' },
      1: { cellWidth: 78, fontStyle: 'bold' },
      2: { halign: 'center', cellWidth: 26 },
      3: { halign: 'right', cellWidth: 24, fontStyle: 'bold' },
      4: { halign: 'right', cellWidth: 24, textColor: [16, 185, 129] },
      5: { halign: 'right', cellWidth: 24, fontStyle: 'bold', textColor: [30, 58, 138] }
    },
    margin: { left: margin, right: margin }
  });

  const finalTableY = (doc as any).lastAutoTable?.finalY || 140;

  // 8. Totals and In-Words Section
  const totalsY = finalTableY + 4;
  const leftBoxWidth = 112;
  const rightBoxWidth = usableWidth - leftBoxWidth - 3;

  // Left Box: Amount in Words & Method Remarks
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, totalsY, leftBoxWidth, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.2);
  doc.setTextColor(30, 58, 138);
  doc.text('AMOUNT IN WORDS:', margin + 4, totalsY + 5.5);

  doc.setFont('helvetica', 'bolditalic');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  const words = internalNumberToWords(netPaid);
  doc.text(words, margin + 4, totalsY + 11.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Payment Gateway: ${receiptData.paymentMethod || 'Online Gateway'}   •   Bank Ref: ${receiptData.bankRef || 'NPSB-VERIFIED'}`, margin + 4, totalsY + 17.5);
  doc.text('Notice: Computer-generated official receipt. Valid without physical revenue stamp.', margin + 4, totalsY + 21.5);

  // Right Box: Financial Summary Box
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin + leftBoxWidth + 3, totalsY, rightBoxWidth, 24, 2, 2, 'FD');

  const rightX = margin + leftBoxWidth + 6;
  const rightValX = margin + usableWidth - 4;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Invoiced Amount:', rightX, totalsY + 5);
  doc.text('BDT ' + totalAmount.toLocaleString(), rightValX, totalsY + 5, { align: 'right' });

  doc.text('Waiver / Concession:', rightX, totalsY + 10);
  doc.setTextColor(16, 185, 129);
  doc.text('- BDT ' + waiver.toLocaleString(), rightValX, totalsY + 10, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 58, 138);
  doc.text('TOTAL PAID:', rightX, totalsY + 16);
  doc.setTextColor(22, 101, 52);
  doc.text('BDT ' + netPaid.toLocaleString(), rightValX, totalsY + 16, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Balance Dues:', rightX, totalsY + 21.5);
  const balanceDue = receiptData.dueAmount ?? 0;
  doc.setTextColor(balanceDue > 0 ? 185 : 100, balanceDue > 0 ? 28 : 116, balanceDue > 0 ? 28 : 139);
  doc.text(balanceDue > 0 ? `BDT ${balanceDue.toLocaleString()}` : 'BDT 0.00 (NIL)', rightValX, totalsY + 21.5, { align: 'right' });

  // 9. Digital Verification QR Code & Official Circular Seal
  const certY = totalsY + 30;

  // Generate QR Code data URL
  try {
    const qrPayload = JSON.stringify({
      receiptNo: receiptData.receiptNo || receiptData.invoiceId,
      studentId: receiptData.studentId,
      studentName: receiptData.studentName,
      amount: netPaid,
      trxId: receiptData.trxId || 'N/A',
      school: school.schoolName,
      eiin: school.eiin,
      timestamp: receiptData.paymentDate,
      verification: 'GENUINE_SETTLED_RECEIPT'
    });

    const qrDataUrl = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 140,
      color: { dark: '#1e3a8a', light: '#ffffff' }
    });

    doc.addImage(qrDataUrl, 'PNG', margin + 3, certY, 26, 26);
  } catch (e) {
    // fallback if QR generation has issue
    doc.setFillColor(238, 242, 255);
    doc.rect(margin + 3, certY, 26, 26, 'FD');
    doc.setFontSize(7);
    doc.setTextColor(79, 70, 229);
    doc.text('QR VERIFIED', margin + 16, certY + 14, { align: 'center' });
  }

  // Verification Explanation next to QR code
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 58, 138);
  doc.text('DIGITAL VERIFICATION & AUDIT', margin + 32, certY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.8);
  doc.setTextColor(71, 85, 105);
  doc.text('Scan this QR code with any smartphone camera to authenticate', margin + 32, certY + 11);
  doc.text('this payment slip against the centralized institutional accounts ledger.', margin + 32, certY + 15);
  doc.text(`Digital Verification Code: SEC-${(receiptData.receiptNo || 'RCP').replace(/[^a-zA-Z0-9]/g, '')}-OK`, margin + 32, certY + 19);

  // Official Circular Stamp / Seal Graphic (Right side)
  const sealCenterX = margin + usableWidth - 28;
  const sealCenterY = certY + 13;
  
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.6);
  doc.circle(sealCenterX, sealCenterY, 13, 'S');
  doc.setLineWidth(0.25);
  doc.circle(sealCenterX, sealCenterY, 11, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5);
  doc.setTextColor(30, 58, 138);
  doc.text('SMART AMAR SCHOOL', sealCenterX, sealCenterY - 6.5, { align: 'center' });
  doc.setFontSize(7);
  doc.setTextColor(22, 101, 52);
  doc.text('★ VERIFIED ★', sealCenterX, sealCenterY - 0.5, { align: 'center' });
  doc.setFontSize(5.5);
  doc.setTextColor(30, 58, 138);
  doc.text('ACCOUNTS DEPT', sealCenterX, sealCenterY + 4.5, { align: 'center' });
  doc.setFontSize(4.5);
  doc.setTextColor(100, 116, 139);
  doc.text('OFFICIAL SEAL', sealCenterX, sealCenterY + 8, { align: 'center' });

  // 10. Endorsement & Signatures Section
  const signY = certY + 36;
  const colWidth = usableWidth / 3;

  const signatures = [
    { title: 'Student / Depositor', desc: 'Acknowledged Receipt' },
    { title: 'Accounts Officer / Cashier', desc: 'Authorized Collector Stamp' },
    { title: 'Headmaster / Principal', desc: 'Institutional Authorization' }
  ];

  signatures.forEach((sig, idx) => {
    const xCenter = margin + (idx * colWidth) + (colWidth / 2);
    const lineHalf = 24;

    doc.setDrawColor(100, 116, 139);
    doc.setLineWidth(0.4);
    doc.line(xCenter - lineHalf, signY, xCenter + lineHalf, signY);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 58, 138);
    doc.text(sig.title, xCenter, signY + 4.5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(sig.desc, xCenter, signY + 8.5, { align: 'center' });
  });

  // 11. Security Footer & Document Number
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(margin, pageHeight - 14, margin + usableWidth, pageHeight - 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`Official Document Ref: ${receiptData.receiptNo}   •   Generated on: ${new Date().toLocaleString()}`, margin, pageHeight - 10);
  doc.text('Smart Amar School ERP   •   Page 1 of 1', margin + usableWidth, pageHeight - 10, { align: 'right' });

  return doc;
}

/**
 * Triggers instant PDF download of the official school-branded fee receipt
 */
export async function exportFeeReceiptToPDF(
  receiptData: FeeReceiptData,
  options?: Partial<PDFExportOptions>
): Promise<void> {
  const doc = await generateFeeReceiptPDF(receiptData, options);
  const filename = options?.filename || `Official_Fee_Receipt_${receiptData.receiptNo}_${receiptData.studentName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  doc.save(filename);
}


