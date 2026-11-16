import { MOCK_STUDENTS, MOCK_INVOICES } from '../constants';
import { Tenant } from '../types';
import { FeeReceiptData, exportFeeReceiptToPDF } from './pdfExport';

/**
 * Converts numeric amount to Bangladeshi Taka in words
 */
export function numberToWordsBDT(amount: number): string {
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
 * Normalizes any fee invoice / payment transaction into a complete FeeReceiptData structure
 * auto-populating missing student, guardian, and institutional fields from available records.
 */
export function resolveFeeReceiptData(
  invoice: any,
  activeTenant?: Tenant | null
): FeeReceiptData {
  if (!invoice) {
    throw new Error('Invoice data is required to generate receipt');
  }

  // 1. Find matching student record for complete particulars
  const student = MOCK_STUDENTS.find(s => 
    (invoice.studentId && s.id === invoice.studentId) ||
    (invoice.studentName && s.name.toLowerCase() === invoice.studentName.toLowerCase())
  );

  const studentName = invoice.studentName || student?.name || 'STUDENT NAME';
  const studentId = invoice.studentId || student?.id || `ST-${invoice.id ? invoice.id.replace(/[^0-9]/g, '') : '2024'}`;
  const studentClass = invoice.studentClass || student?.class || 'Class 10';
  const studentSection = invoice.studentSection || student?.section || 'A';
  const studentRoll = invoice.studentRoll || student?.rollNo || '01';
  const guardianName = invoice.guardianName || student?.guardian || 'Guardian / Parent';
  const guardianPhone = invoice.guardianPhone || student?.phone || '01712-345678';

  // 2. Financial & Reference data
  const rawId = invoice.id || invoice.invoiceId || 'INV-001';
  const numericSuffix = rawId.replace(/[^0-9]/g, '') || '101';
  const receiptNo = invoice.receiptNo || `RCP-${numericSuffix}-${new Date().getFullYear()}`;
  const trxId = invoice.trxId || `TRX-${(invoice.paymentMethod || 'BK').substring(0, 2).toUpperCase()}${numericSuffix}99`;

  const amount = Number(invoice.amount) || 0;
  const paidAmount = Number(invoice.paidAmount ?? invoice.amount) || 0;
  const dueAmount = invoice.dueAmount !== undefined ? Number(invoice.dueAmount) : Math.max(0, amount - paidAmount);
  const waiverAmount = Number(invoice.waiverAmount || 0);

  const feeType = invoice.feeType || (invoice.type ? `${invoice.type} Fee` : 'Tuition & Academic Fee');
  const month = invoice.month || 'Current Term';
  const year = invoice.year || `${new Date().getFullYear()}`;
  const paymentDate = invoice.paidDate || invoice.paidAt || invoice.paymentDate || new Date().toISOString().split('T')[0];

  const paymentMethod = invoice.paymentMethod || invoice.channelName || 'bKash Online Gateway';
  const status = invoice.status || (dueAmount === 0 ? 'Paid' : 'Partial');

  // 3. Auto-populate itemized breakdown
  const breakdown = invoice.breakdown || {
    tuition: Math.round(amount * 0.7),
    lab: Math.round(amount * 0.15),
    library: Math.round(amount * 0.1),
    sports: Math.round(amount * 0.05),
    waiver: waiverAmount
  };

  return {
    receiptNo,
    invoiceId: rawId,
    trxId,
    paymentDate,
    academicYear: activeTenant?.establishedYear ? `${new Date().getFullYear()}-${new Date().getFullYear() + 1}` : '2024-2025',
    studentId,
    studentName,
    studentClass,
    studentSection,
    studentRoll,
    guardianName,
    guardianPhone,
    feeType,
    month,
    year,
    dueDate: invoice.dueDate,
    amount,
    paidAmount,
    dueAmount,
    waiverAmount,
    breakdown,
    paymentMethod,
    bankRef: invoice.bankRef || `NPSB-${Math.floor(10000000 + Math.random() * 90000000)}`,
    status,
    remarks: invoice.remarks || 'Payment cleared and verified via School Management ERP'
  };
}

/**
 * Direct export trigger: resolves receipt data and triggers browser PDF download
 */
export async function downloadFeeReceiptPDF(
  invoice: any,
  activeTenant?: Tenant | null,
  options?: any
): Promise<void> {
  const receiptData = resolveFeeReceiptData(invoice, activeTenant);
  await exportFeeReceiptToPDF(receiptData, {
    schoolInfo: activeTenant ? {
      schoolName: activeTenant.name.toUpperCase(),
      subTitle: activeTenant.type === 'Madrasa' 
        ? 'বাংলাদেশ মাদ্রাসা শিক্ষা বোর্ড অনুমোদিত দ্বীনি শিক্ষা প্রতিষ্ঠান'
        : activeTenant.type === 'College'
        ? 'মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড ও জাতীয় বিশ্ববিদ্যালয় অধিভুক্ত'
        : activeTenant.type === 'University'
        ? 'বিশ্ববিদ্যালয় মঞ্জুরি কমিশন (UGC) অনুমোদিত শিক্ষা প্রতিষ্ঠান'
        : 'মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড অধিভুক্ত মডেল বিদ্যাপীঠ',
      eiin: `EIIN: ${activeTenant.eiin || '108162'} • Code: ${activeTenant.code || 'SCH-101'}`,
      established: activeTenant.establishedYear ? `Est. ${activeTenant.establishedYear}` : 'Est. 1998',
      address: activeTenant.address || 'Dhaka, Bangladesh',
      phone: activeTenant.contactPhone || '+880 1712-345678',
      email: activeTenant.contactEmail || 'office@smartamarschool.edu.bd',
      academicYear: '2024-2025'
    } : undefined,
    ...options
  });
}
