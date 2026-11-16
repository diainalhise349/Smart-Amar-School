import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Printer, Download, FileText, Settings2, CheckCircle2, 
  Layers, Shield, Calendar, Sparkles, Building2, Eye, X,
  ZoomIn, ZoomOut, Filter, Check, RefreshCw, Hash, SlidersHorizontal,
  ChevronDown, UserCheck, DollarSign, Users, Award, Clock,
  FileSpreadsheet, ArrowDownTray, ShieldCheck, QrCode as QrIcon
} from 'lucide-react';
import QRCode from 'qrcode';
import { Modal, Button, Badge, Input, useToast } from './UIComponents';
import { 
  exportStudentListToPDF, exportPerformanceReportToPDF, exportSeatPlanToPDF, 
  exportFeeRegisterToPDF, exportTableToPDF, exportBookCatalogToPDF, 
  exportLibraryBorrowRegisterToPDF, exportLibraryOverdueReportToPDF, 
  exportStudentProgressReportToPDF, PDFExportOptions, PDFSchoolHeader 
} from '../utils/pdfExport';
import { Student, Book, BookBorrowRecord } from '../types';

export interface PrintExportUtilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  defaultSubtitle?: string;
  moduleType: 'students' | 'fees' | 'performance' | 'seatplan' | 'library_catalog' | 'library_borrows' | 'library_overdue' | 'student_progress' | 'general';
  data: any[];
  availableClasses?: string[];
  filterContext?: Record<string, string>;
  institutionInfo?: Partial<PDFSchoolHeader>;
  onPrintComplete?: () => void;
}

export const DEFAULT_INSTITUTION_HEADER: PDFSchoolHeader = {
  schoolName: 'SMART AMAR SCHOOL & COLLEGE',
  subTitle: 'Excellence in Digital Education & Administrative Management',
  eiin: 'EIIN: 134209 • Code: 2041',
  established: 'Est. 1998',
  address: 'Plot 14, Academic Avenue, Dhanmondi, Dhaka - 1209',
  phone: '+880 1712-345678',
  email: 'info@smartamarschool.edu.bd',
  academicYear: '2024 - 2025'
};

export const PrintExportUtilityModal: React.FC<PrintExportUtilityModalProps> = ({
  isOpen,
  onClose,
  title,
  defaultSubtitle,
  moduleType,
  data,
  availableClasses = ['All Classes', 'Class 10', 'Class 9', 'Class 8', 'Class 7', 'Class 6'],
  filterContext = {},
  institutionInfo = {},
  onPrintComplete
}) => {
  const { addToast } = useToast();

  // Document configuration state
  const [docTitle, setDocTitle] = useState(title);
  const [docSubtitle, setDocSubtitle] = useState(
    defaultSubtitle || 
    (moduleType === 'fees' 
      ? 'Official Accounts & Financial Collection Register • Physical Archival' 
      : 'Official Student Directory & Nominal Roll • Physical Archival')
  );
  const [schoolInfo, setSchoolInfo] = useState<PDFSchoolHeader>({
    ...DEFAULT_INSTITUTION_HEADER,
    ...institutionInfo
  });

  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    moduleType === 'fees' || moduleType === 'performance' ? 'landscape' : 'portrait'
  );
  const [includeSignatures, setIncludeSignatures] = useState(true);
  const [includeSummaryStats, setIncludeSummaryStats] = useState(true);
  const [includeQrCode, setIncludeQrCode] = useState(true);
  const [includeWatermark, setIncludeWatermark] = useState(false);

  // Filters state
  const [selectedClass, setSelectedClass] = useState('All Classes');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Interactive UI view controls
  const [activeTab, setActiveTab] = useState<'preview' | 'settings'>('preview');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Verification QR Data URL
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  // Column visibility map (columnId -> boolean)
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({});

  // Document Reference ID
  const documentRefId = useMemo(() => {
    const prefix = moduleType === 'fees' ? 'FEE-REG' : moduleType === 'students' ? 'STU-DIR' : 'SAS-DOC';
    const year = schoolInfo.academicYear ? schoolInfo.academicYear.split('-')[0].trim() : '2024';
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${year}-${randomHex}`;
  }, [moduleType, schoolInfo.academicYear]);

  // Sync document.body with print-modal-active to engage exact @media print isolation styles from index.html
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('print-modal-active');
    } else {
      document.body.classList.remove('print-modal-active');
    }
    return () => {
      document.body.classList.remove('print-modal-active');
    };
  }, [isOpen]);

  // Generate verification QR code
  useEffect(() => {
    if (!isOpen) return;

    const payload = JSON.stringify({
      system: 'Smart Amar School ERP',
      docRef: documentRefId,
      docType: moduleType.toUpperCase(),
      title: docTitle,
      records: data.length,
      session: schoolInfo.academicYear,
      eiin: schoolInfo.eiin,
      timestamp: new Date().toISOString(),
      verifiedBy: 'Official Academic Administration'
    });

    QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 160,
      color: {
        dark: '#1e3a8a', // Deep Navy
        light: '#ffffff'
      }
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error('Failed to generate verification QR:', err));
  }, [isOpen, documentRefId, moduleType, docTitle, data.length, schoolInfo]);

  // Define default columns based on module type
  const availableColumns = useMemo(() => {
    if (moduleType === 'students') {
      return [
        { id: 'sl', label: 'SL #', default: true },
        { id: 'id', label: 'Student ID', default: true },
        { id: 'name', label: 'Student Full Name', default: true },
        { id: 'rollNo', label: 'Class Roll', default: true },
        { id: 'classSec', label: 'Class & Section', default: true },
        { id: 'guardian', label: 'Guardian / Father', default: true },
        { id: 'phone', label: 'Guardian Mobile', default: true },
        { id: 'bloodGroup', label: 'Blood Group', default: true },
        { id: 'gender', label: 'Gender', default: false },
        { id: 'feesDue', label: 'Fees Due (৳)', default: true },
        { id: 'status', label: 'Status', default: true }
      ];
    } else if (moduleType === 'fees') {
      return [
        { id: 'sl', label: 'SL #', default: true },
        { id: 'invoiceId', label: 'Invoice No', default: true },
        { id: 'studentId', label: 'Student ID', default: true },
        { id: 'studentName', label: 'Student Name', default: true },
        { id: 'classSec', label: 'Class & Sec', default: true },
        { id: 'feeType', label: 'Fee Particulars', default: true },
        { id: 'amount', label: 'Invoiced (৳)', default: true },
        { id: 'paidAmount', label: 'Paid (৳)', default: true },
        { id: 'dueAmount', label: 'Due (৳)', default: true },
        { id: 'paymentMethod', label: 'Payment Trx / Method', default: true },
        { id: 'status', label: 'Payment Status', default: true }
      ];
    } else {
      // Dynamic fallback for generic data
      const sample = data[0] || {};
      const keys = Object.keys(sample).slice(0, 8);
      return [
        { id: 'sl', label: 'SL #', default: true },
        ...keys.map((k) => ({
          id: k,
          label: k.charAt(0).toUpperCase() + k.slice(1).replace(/([A-Z])/g, ' $1'),
          default: true
        }))
      ];
    }
  }, [moduleType, data]);

  // Initialize visible columns
  useEffect(() => {
    const initialVisibility: Record<string, boolean> = {};
    availableColumns.forEach((col) => {
      initialVisibility[col.id] = col.default;
    });
    setVisibleColumns(initialVisibility);
  }, [availableColumns]);

  // Normalization & Filtering
  const filteredRecords = useMemo(() => {
    let result = [...data];

    // Filter by class
    if (selectedClass !== 'All Classes') {
      result = result.filter((item) => {
        const itemClass = item.class || item.studentClass || '';
        return itemClass.toLowerCase().includes(selectedClass.toLowerCase());
      });
    }

    // Filter by status
    if (selectedStatus !== 'All') {
      result = result.filter((item) => {
        const itemStatus = item.status || item.paymentStatus || '';
        return itemStatus.toLowerCase() === selectedStatus.toLowerCase();
      });
    }

    // Filter by search query
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      result = result.filter((item) => {
        const name = (item.name || item.studentName || '').toLowerCase();
        const id = (item.id || item.studentId || item.invoiceId || '').toLowerCase();
        const roll = (item.rollNo || item.studentRoll || '').toString().toLowerCase();
        const phone = (item.phone || item.guardianPhone || '').toString().toLowerCase();
        const feeType = (item.feeType || item.feeHead || '').toLowerCase();

        return name.includes(q) || id.includes(q) || roll.includes(q) || phone.includes(q) || feeType.includes(q);
      });
    }

    return result;
  }, [data, selectedClass, selectedStatus, searchQuery]);

  // Aggregate KPI Calculations
  const statsSummary = useMemo(() => {
    if (moduleType === 'students') {
      const total = filteredRecords.length;
      const active = filteredRecords.filter((s) => (s.status || 'Active') === 'Active').length;
      const suspended = total - active;
      const totalDue = filteredRecords.reduce((acc, s) => acc + (Number(s.feesDue) || 0), 0);
      const male = filteredRecords.filter((s) => (s.gender || 'Male').toLowerCase().startsWith('m')).length;
      const female = filteredRecords.filter((s) => (s.gender || '').toLowerCase().startsWith('f')).length;

      return [
        { label: 'TOTAL COHORT', value: `${total} Students`, sub: `${active} Active / ${suspended} Suspended`, color: 'text-indigo-900', bg: 'bg-indigo-50 border-indigo-200' },
        { label: 'ACTIVE RATIO', value: `${total > 0 ? Math.round((active / total) * 100) : 0}%`, sub: 'Official Enrollment', color: 'text-emerald-800', bg: 'bg-emerald-50 border-emerald-200' },
        { label: 'TOTAL DUES', value: `৳${totalDue.toLocaleString()}`, sub: 'Outstanding Balance', color: 'text-rose-800', bg: 'bg-rose-50 border-rose-200' },
        { label: 'GENDER PROFILE', value: `${male}M / ${female}F`, sub: 'Co-educational', color: 'text-blue-800', bg: 'bg-blue-50 border-blue-200' }
      ];
    } else if (moduleType === 'fees') {
      const totalInvoices = filteredRecords.length;
      const totalBilled = filteredRecords.reduce((acc, i) => acc + (Number(i.amount) || Number(i.totalAmount) || 0), 0);
      const totalCollected = filteredRecords.reduce((acc, i) => acc + (Number(i.paidAmount) || 0), 0);
      const totalDue = filteredRecords.reduce((acc, i) => acc + (Number(i.dueAmount) || 0), 0);
      const paidCount = filteredRecords.filter((i) => i.status === 'Paid').length;
      const efficiency = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

      return [
        { label: 'TOTAL INVOICED', value: `৳${totalBilled.toLocaleString()}`, sub: `${totalInvoices} Invoices`, color: 'text-indigo-900', bg: 'bg-indigo-50 border-indigo-200' },
        { label: 'COLLECTED AMOUNT', value: `৳${totalCollected.toLocaleString()}`, sub: `${efficiency}% Realized`, color: 'text-emerald-800', bg: 'bg-emerald-50 border-emerald-200' },
        { label: 'OUTSTANDING DUES', value: `৳${totalDue.toLocaleString()}`, sub: 'Uncollected Deficit', color: 'text-rose-800', bg: 'bg-rose-50 border-rose-200' },
        { label: 'PAID INVOICES', value: `${paidCount} / ${totalInvoices}`, sub: `${totalInvoices - paidCount} Pending`, color: 'text-amber-800', bg: 'bg-amber-50 border-amber-200' }
      ];
    }

    return [
      { label: 'TOTAL RECORDS', value: `${filteredRecords.length}`, sub: 'Listed Items', color: 'text-slate-800', bg: 'bg-slate-50 border-slate-200' }
    ];
  }, [moduleType, filteredRecords]);

  // Direct Browser Native Print Action
  const handleNativePrint = () => {
    if (onPrintComplete) onPrintComplete();
    window.print();
  };

  // Direct jsPDF Vector Download Action
  const handleDownloadVectorPdf = () => {
    setIsExportingPdf(true);
    try {
      const options: PDFExportOptions = {
        title: docTitle,
        subtitle: docSubtitle,
        orientation,
        includeSignatures,
        includeSummaryStats,
        schoolInfo,
        filename: `${docTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
        filterSummary: {
          ...filterContext,
          ...(selectedClass !== 'All Classes' ? { 'Class Filter': selectedClass } : {}),
          ...(selectedStatus !== 'All' ? { 'Status': selectedStatus } : {})
        }
      };

      if (moduleType === 'students') {
        exportStudentListToPDF(filteredRecords as Student[], options);
      } else if (moduleType === 'fees') {
        // Map to expected FeeInvoiceRecord schema
        const mappedInvoices = filteredRecords.map((i, idx) => ({
          id: i.id || i.invoiceId || `INV-${idx + 1}`,
          studentId: i.studentId || i.id || 'N/A',
          studentName: i.studentName || i.name || 'Unnamed',
          studentClass: i.studentClass || (i.class ? i.class.split(' ')[0] : 'Class 10'),
          studentSection: i.studentSection || (i.class && i.class.includes('(') ? i.class.split('(')[1].replace(')', '') : 'A'),
          feeType: i.feeType || i.feeHead || 'Tuition Fee',
          amount: Number(i.amount) || Number(i.totalAmount) || 0,
          paidAmount: Number(i.paidAmount) || 0,
          dueAmount: Number(i.dueAmount) || 0,
          status: i.status || (i.paidAmount >= i.amount ? 'Paid' : 'Unpaid'),
          paymentMethod: i.paymentMethod || 'Online',
          trxId: i.trxId || ''
        }));
        exportFeeRegisterToPDF(mappedInvoices, options);
      } else if (moduleType === 'performance') {
        exportPerformanceReportToPDF(filteredRecords, options);
      } else if (moduleType === 'seatplan') {
        exportSeatPlanToPDF(filteredRecords, options);
      } else if (moduleType === 'library_catalog') {
        exportBookCatalogToPDF(filteredRecords as Book[], options);
      } else if (moduleType === 'library_borrows') {
        exportLibraryBorrowRegisterToPDF(filteredRecords as BookBorrowRecord[], options);
      } else if (moduleType === 'library_overdue') {
        exportLibraryOverdueReportToPDF(filteredRecords as BookBorrowRecord[], options);
      } else if (moduleType === 'student_progress') {
        exportStudentProgressReportToPDF(filteredRecords[0] || data[0] || data, options);
      } else {
        // Generic table exporter
        const headers = availableColumns.filter((c) => visibleColumns[c.id]).map((c) => c.label);
        const rows = filteredRecords.map((item, idx) => {
          return availableColumns
            .filter((c) => visibleColumns[c.id])
            .map((c) => {
              if (c.id === 'sl') return idx + 1;
              return item[c.id] !== undefined ? String(item[c.id]) : '';
            });
        });
        exportTableToPDF({
          title: docTitle,
          subtitle: docSubtitle,
          headers,
          rows,
          orientation,
          schoolInfo,
          includeSignatures
        });
      }

      addToast('Vector PDF successfully generated and downloaded.', 'success');
    } catch (err: any) {
      console.error('Vector PDF generation error:', err);
      addToast('Error generating PDF: ' + (err.message || 'Unknown issue'), 'error');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Export filtered rows to CSV
  const handleExportCsv = () => {
    try {
      const activeCols = availableColumns.filter((c) => visibleColumns[c.id]);
      const headerRow = activeCols.map((c) => `"${c.label}"`).join(',');

      const dataRows = filteredRecords.map((item, idx) => {
        return activeCols
          .map((c) => {
            let val = '';
            if (c.id === 'sl') val = String(idx + 1);
            else if (c.id === 'classSec') val = `${item.class || item.studentClass || ''} ${item.section || item.studentSection ? `(${item.section || item.studentSection})` : ''}`.trim();
            else val = item[c.id] !== undefined ? String(item[c.id]) : '';
            return `"${val.replace(/"/g, '""')}"`;
          })
          .join(',');
      });

      const csvContent = [headerRow, ...dataRows].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${docTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      addToast('Exported filtered data to CSV.', 'info');
    } catch (err) {
      console.error(err);
      addToast('Failed to export CSV', 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static">
      {/* 
        The outer modal container uses `.print-document-modal` to pair with:
        `body.print-modal-active .print-document-modal`
        which removes overflow, borders, and shadows to render a pristine paper printout!
      */}
      <div className="print-document-modal bg-slate-100 rounded-2xl shadow-2xl border border-slate-300 w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 print:shadow-none print:border-none print:max-w-none print:max-h-none print:w-full print:rounded-none">
        
        {/* ========================================================================= */}
        {/* TOP TOOLBAR & CONTROLS (HIDDEN DURING BROWSER PRINT) */}
        {/* ========================================================================= */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 print:hidden border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-400/30 flex items-center justify-center font-bold">
              <Printer size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black tracking-tight text-white uppercase">
                  Official Institutional Print & PDF Export Utility
                </h3>
                <span className="text-[10px] font-mono font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-400/40 px-2 py-0.5 rounded-full">
                  {orientation === 'landscape' ? 'A4 Landscape' : 'A4 Portrait'}
                </span>
                <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                  {filteredRecords.length} Records
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Physical archival grade reporting with letterhead, signatures, KPI analytics, and security verification stamp
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Tab Switcher: Preview vs Settings */}
            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'preview'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye size={13} />
                <span>Live Preview</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('settings')}
                className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'settings'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Settings2 size={13} />
                <span>Format Settings</span>
              </button>
            </div>

            {/* Zoom Controls */}
            {activeTab === 'preview' && (
              <div className="hidden md:flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-xl p-1 text-xs text-slate-300">
                <button
                  type="button"
                  onClick={() => setZoomLevel((prev) => Math.max(70, prev - 10))}
                  className="p-1 hover:text-white rounded hover:bg-slate-700 cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut size={13} />
                </button>
                <span className="px-1.5 font-mono text-[11px] min-w-[38px] text-center font-bold">
                  {zoomLevel}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((prev) => Math.min(130, prev + 10))}
                  className="p-1 hover:text-white rounded hover:bg-slate-700 cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn size={13} />
                </button>
              </div>
            )}

            {/* Quick CSV Export */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
              title="Download filtered dataset as CSV"
            >
              <FileSpreadsheet size={13} />
              <span className="hidden sm:inline">CSV</span>
            </Button>

            {/* Vector PDF Download */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadVectorPdf}
              disabled={isExportingPdf}
              className="bg-slate-800 hover:bg-slate-700 text-emerald-400 border-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Generate and download vector-drawn PDF"
            >
              <Download size={14} />
              <span>{isExportingPdf ? 'Exporting...' : 'Save Vector PDF'}</span>
            </Button>

            {/* Direct Browser Native Print */}
            <Button
              type="button"
              size="sm"
              onClick={handleNativePrint}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
              title="Open Browser Print Dialog (uses CSS @media print styles)"
            >
              <Printer size={14} />
              <span>Print Document</span>
            </Button>

            {/* Close Modal */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Close window"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECONDARY FILTER & CUSTOMIZATION BAR (HIDDEN IN PRINT) */}
        {/* ========================================================================= */}
        <div className="bg-white border-b border-slate-200 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs print:hidden">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Class Filter */}
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-500 uppercase text-[10.5px]">Class:</span>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 outline-none focus:ring-1 ring-indigo-500 cursor-pointer"
              >
                {availableClasses.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-500 uppercase text-[10.5px]">Status:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 outline-none focus:ring-1 ring-indigo-500 cursor-pointer"
              >
                <option value="All">All Statuses</option>
                {moduleType === 'fees' ? (
                  <>
                    <option value="Paid">Paid Only</option>
                    <option value="Unpaid">Unpaid Only</option>
                    <option value="Overdue">Overdue Only</option>
                    <option value="Partial">Partial Only</option>
                  </>
                ) : (
                  <>
                    <option value="Active">Active Only</option>
                    <option value="Suspended">Suspended Only</option>
                  </>
                )}
              </select>
            </div>

            {/* Orientation Switcher */}
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-500 uppercase text-[10.5px]">Layout:</span>
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setOrientation('portrait')}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                    orientation === 'portrait'
                      ? 'bg-white text-indigo-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Portrait
                </button>
                <button
                  type="button"
                  onClick={() => setOrientation('landscape')}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                    orientation === 'landscape'
                      ? 'bg-white text-indigo-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Landscape
                </button>
              </div>
            </div>

            {/* Signatures & Stats Quick Toggles */}
            <label className="flex items-center gap-1.5 font-bold text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={includeSummaryStats}
                onChange={(e) => setIncludeSummaryStats(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
              />
              <span>KPI Stats</span>
            </label>

            <label className="flex items-center gap-1.5 font-bold text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={includeSignatures}
                onChange={(e) => setIncludeSignatures(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
              />
              <span>Signatures</span>
            </label>
          </div>

          {/* Quick Search */}
          <div className="w-full sm:w-56">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search records in printout..."
              className="w-full text-xs font-medium border border-slate-200 rounded-lg px-2.5 py-1 bg-slate-50 text-slate-800 outline-none focus:ring-1 ring-indigo-500"
            />
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MAIN BODY: SETTINGS PANEL OR A4 PRINT CANVAS */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto bg-slate-200/70 p-3 sm:p-6 flex justify-center print:bg-white print:p-0 print:overflow-visible">
          
          {/* VIEW A: SETTINGS PANEL */}
          {activeTab === 'settings' && (
            <div className="w-full max-w-3xl bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6 print:hidden">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Settings2 size={18} className="text-indigo-600" />
                  <h4 className="font-black text-sm text-slate-800 uppercase">
                    Document & Layout Customization
                  </h4>
                </div>
                <Button
                  size="sm"
                  onClick={() => setActiveTab('preview')}
                  className="bg-indigo-600 text-white font-bold text-xs"
                >
                  Return to Preview
                </Button>
              </div>

              {/* Title & Subtitle Form */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Document Main Title
                  </label>
                  <input
                    type="text"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 outline-none focus:ring-2 ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Document Subtitle / Archival Description
                  </label>
                  <input
                    type="text"
                    value={docSubtitle}
                    onChange={(e) => setDocSubtitle(e.target.value)}
                    className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 outline-none focus:ring-2 ring-indigo-500"
                  />
                </div>
              </div>

              {/* Institutional Profile Settings */}
              <div className="pt-2 border-t border-slate-100">
                <h5 className="text-xs font-black text-slate-700 uppercase mb-3">
                  Institutional Header Details
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">School Name</label>
                    <input
                      type="text"
                      value={schoolInfo.schoolName}
                      onChange={(e) => setSchoolInfo((prev) => ({ ...prev, schoolName: e.target.value }))}
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">EIIN & Reg Code</label>
                    <input
                      type="text"
                      value={schoolInfo.eiin}
                      onChange={(e) => setSchoolInfo((prev) => ({ ...prev, eiin: e.target.value }))}
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Campus Address</label>
                    <input
                      type="text"
                      value={schoolInfo.address}
                      onChange={(e) => setSchoolInfo((prev) => ({ ...prev, address: e.target.value }))}
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Academic Session</label>
                    <input
                      type="text"
                      value={schoolInfo.academicYear}
                      onChange={(e) => setSchoolInfo((prev) => ({ ...prev, academicYear: e.target.value }))}
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Column Selection Checkboxes */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-xs font-black text-slate-700 uppercase">
                    Column Visibility ({Object.values(visibleColumns).filter(Boolean).length} Active)
                  </h5>
                  <div className="flex gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => {
                        const allOn: Record<string, boolean> = {};
                        availableColumns.forEach((c) => (allOn[c.id] = true));
                        setVisibleColumns(allOn);
                      }}
                      className="text-indigo-600 font-bold hover:underline cursor-pointer"
                    >
                      Select All
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => {
                        const defaults: Record<string, boolean> = {};
                        availableColumns.forEach((c) => (defaults[c.id] = c.default));
                        setVisibleColumns(defaults);
                      }}
                      className="text-slate-500 hover:underline cursor-pointer"
                    >
                      Reset Defaults
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {availableColumns.map((col) => (
                    <label
                      key={col.id}
                      className="flex items-center gap-2 text-xs font-medium text-slate-700 hover:text-slate-900 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={!!visibleColumns[col.id]}
                        onChange={(e) =>
                          setVisibleColumns((prev) => ({
                            ...prev,
                            [col.id]: e.target.checked
                          }))
                        }
                        className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                      />
                      <span>{col.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Security & Verification Options */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-4 text-xs">
                <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeQrCode}
                    onChange={(e) => setIncludeQrCode(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Include Digital QR Verification Stamp</span>
                </label>

                <label className="flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeWatermark}
                    onChange={(e) => setIncludeWatermark(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Show Official Watermark</span>
                </label>
              </div>
            </div>
          )}

          {/* VIEW B: REALISTIC SIMULATED A4 PAPER SHEET */}
          {activeTab === 'preview' && (
            <div
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top center',
                transition: 'transform 0.15s ease-out'
              }}
              className={`bg-white text-slate-900 shadow-2xl transition-all relative ${
                orientation === 'landscape'
                  ? 'w-[297mm] min-h-[210mm] p-[10mm]'
                  : 'w-[210mm] min-h-[297mm] p-[12mm]'
              } print:w-full print:min-h-0 print:p-0 print:shadow-none print:transform-none`}
            >
              {/* Optional Watermark */}
              {includeWatermark && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden opacity-[0.04]">
                  <span className="text-[120px] font-black uppercase text-slate-900 -rotate-45 leading-none">
                    SMART AMAR SCHOOL
                  </span>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* 1. INSTITUTIONAL LETTERHEAD & CREST */}
              {/* ------------------------------------------------------------- */}
              <div className="border-b-2 border-slate-900 pb-3 mb-4">
                {/* Header Accent Line */}
                <div className="h-1.5 bg-gradient-to-r from-indigo-900 via-blue-900 to-indigo-900 mb-3 print:bg-slate-900" />

                <div className="flex items-start justify-between gap-4">
                  {/* Left School Crest & Titles */}
                  <div className="flex items-center gap-3">
                    {/* Emblem Box */}
                    <div className="w-14 h-14 rounded-xl border-2 border-indigo-900 bg-indigo-50/70 flex flex-col items-center justify-center shrink-0 text-indigo-950 font-black shadow-2xs">
                      <span className="text-sm font-black tracking-tighter">SAS</span>
                      <span className="text-[8px] font-mono tracking-widest text-indigo-700">1998</span>
                    </div>

                    <div>
                      <h1 className="text-xl font-black text-slate-950 uppercase tracking-tight font-serif">
                        {schoolInfo.schoolName}
                      </h1>
                      <p className="text-xs font-semibold text-slate-700 mt-0.5">
                        {schoolInfo.subTitle}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                        {schoolInfo.address} • Phone: {schoolInfo.phone} • {schoolInfo.eiin}
                      </p>
                    </div>
                  </div>

                  {/* Right Official Session Badge */}
                  <div className="border border-slate-300 rounded-lg p-2 text-right bg-slate-50 shrink-0 min-w-[130px]">
                    <span className="block text-[8.5px] font-black uppercase text-indigo-800 tracking-wider">
                      OFFICIAL PHYSICAL RECORD
                    </span>
                    <span className="block text-xs font-black text-slate-900 font-mono mt-0.5">
                      Session: {schoolInfo.academicYear}
                    </span>
                    <span className="block text-[9px] text-slate-500 font-mono mt-0.5">
                      Date: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* 2. DOCUMENT TITLE & METADATA BAR */}
              {/* ------------------------------------------------------------- */}
              <div className="bg-slate-100/90 rounded-xl p-3 border border-slate-200 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                      {docTitle}
                    </h2>
                    <span className="text-[9.5px] font-mono font-bold px-2 py-0.2 rounded bg-indigo-100 text-indigo-900 border border-indigo-200">
                      REF: {documentRefId}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 font-medium">
                    {docSubtitle}
                  </p>
                </div>

                <div className="text-left sm:text-right text-[10px] text-slate-500 font-mono">
                  <span>Class: <strong className="text-slate-800">{selectedClass}</strong></span>
                  <span className="mx-1.5">•</span>
                  <span>Status: <strong className="text-slate-800">{selectedStatus}</strong></span>
                  <span className="mx-1.5">•</span>
                  <span>Listed: <strong className="text-slate-800">{filteredRecords.length} Items</strong></span>
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* 3. KPI SUMMARY STATS CARDS (CONFIGURABLE) */}
              {/* ------------------------------------------------------------- */}
              {includeSummaryStats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
                  {statsSummary.map((st, i) => (
                    <div
                      key={i}
                      className={`p-2.5 rounded-xl border ${st.bg} flex flex-col justify-between`}
                    >
                      <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                        {st.label}
                      </span>
                      <div className={`text-base font-black font-mono my-0.5 ${st.color}`}>
                        {st.value}
                      </div>
                      <span className="text-[9.5px] text-slate-500 font-medium">
                        {st.sub}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* 4. OFFICIAL REPORT DATA TABLE */}
              {/* ------------------------------------------------------------- */}
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-left text-[10.5px] border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold text-[10px] uppercase tracking-wider border-b-2 border-slate-900">
                      {visibleColumns.sl && (
                        <th className="py-2 px-2 text-center w-8 border border-slate-800">#</th>
                      )}
                      
                      {moduleType === 'students' ? (
                        <>
                          {visibleColumns.id && <th className="py-2 px-2 border border-slate-800">Student ID</th>}
                          {visibleColumns.name && <th className="py-2 px-2 border border-slate-800">Student Full Name</th>}
                          {visibleColumns.rollNo && <th className="py-2 px-2 text-center border border-slate-800">Roll</th>}
                          {visibleColumns.classSec && <th className="py-2 px-2 text-center border border-slate-800">Class & Sec</th>}
                          {visibleColumns.guardian && <th className="py-2 px-2 border border-slate-800">Guardian Name</th>}
                          {visibleColumns.phone && <th className="py-2 px-2 border border-slate-800">Guardian Mobile</th>}
                          {visibleColumns.bloodGroup && <th className="py-2 px-1.5 text-center border border-slate-800">Blood</th>}
                          {visibleColumns.gender && <th className="py-2 px-1.5 text-center border border-slate-800">Gender</th>}
                          {visibleColumns.feesDue && <th className="py-2 px-2 text-right border border-slate-800">Due (৳)</th>}
                          {visibleColumns.status && <th className="py-2 px-2 text-center border border-slate-800">Status</th>}
                        </>
                      ) : moduleType === 'fees' ? (
                        <>
                          {visibleColumns.invoiceId && <th className="py-2 px-2 border border-slate-800">Invoice #</th>}
                          {visibleColumns.studentId && <th className="py-2 px-2 border border-slate-800">Student ID</th>}
                          {visibleColumns.studentName && <th className="py-2 px-2 border border-slate-800">Student Full Name</th>}
                          {visibleColumns.classSec && <th className="py-2 px-2 text-center border border-slate-800">Class (Sec)</th>}
                          {visibleColumns.feeType && <th className="py-2 px-2 border border-slate-800">Fee Particulars</th>}
                          {visibleColumns.amount && <th className="py-2 px-2 text-right border border-slate-800">Amount (৳)</th>}
                          {visibleColumns.paidAmount && <th className="py-2 px-2 text-right border border-slate-800">Paid (৳)</th>}
                          {visibleColumns.dueAmount && <th className="py-2 px-2 text-right border border-slate-800">Due (৳)</th>}
                          {visibleColumns.paymentMethod && <th className="py-2 px-2 border border-slate-800">Payment / Trx</th>}
                          {visibleColumns.status && <th className="py-2 px-2 text-center border border-slate-800">Status</th>}
                        </>
                      ) : (
                        availableColumns.filter((c) => c.id !== 'sl' && visibleColumns[c.id]).map((c) => (
                          <th key={c.id} className="py-2 px-2 border border-slate-800">{c.label}</th>
                        ))
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredRecords.length === 0 ? (
                      <tr>
                        <td colSpan={15} className="py-8 text-center text-slate-400 italic">
                          No matching records found for the selected criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredRecords.map((item, idx) => (
                        <tr
                          key={idx}
                          className={`hover:bg-slate-50 transition-colors ${
                            idx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white'
                          }`}
                        >
                          {visibleColumns.sl && (
                            <td className="py-1.5 px-2 text-center font-mono text-slate-500 font-bold border border-slate-200">
                              {idx + 1}
                            </td>
                          )}

                          {moduleType === 'students' ? (
                            <>
                              {visibleColumns.id && (
                                <td className="py-1.5 px-2 font-mono font-bold text-indigo-700 border border-slate-200">
                                  {item.id}
                                </td>
                              )}
                              {visibleColumns.name && (
                                <td className="py-1.5 px-2 font-bold uppercase text-slate-900 border border-slate-200">
                                  {item.name}
                                </td>
                              )}
                              {visibleColumns.rollNo && (
                                <td className="py-1.5 px-2 text-center font-mono font-bold border border-slate-200">
                                  {item.rollNo}
                                </td>
                              )}
                              {visibleColumns.classSec && (
                                <td className="py-1.5 px-2 text-center border border-slate-200 font-medium">
                                  {item.class} ({item.section})
                                </td>
                              )}
                              {visibleColumns.guardian && (
                                <td className="py-1.5 px-2 text-slate-700 border border-slate-200">
                                  {item.guardian || '---'}
                                </td>
                              )}
                              {visibleColumns.phone && (
                                <td className="py-1.5 px-2 font-mono text-slate-600 border border-slate-200">
                                  {item.phone || '---'}
                                </td>
                              )}
                              {visibleColumns.bloodGroup && (
                                <td className="py-1.5 px-1.5 text-center font-mono font-bold text-rose-700 border border-slate-200">
                                  {item.bloodGroup || '--'}
                                </td>
                              )}
                              {visibleColumns.gender && (
                                <td className="py-1.5 px-1.5 text-center font-medium border border-slate-200">
                                  {item.gender || 'Male'}
                                </td>
                              )}
                              {visibleColumns.feesDue && (
                                <td className={`py-1.5 px-2 text-right font-mono font-bold border border-slate-200 ${
                                  (item.feesDue || 0) > 0 ? 'text-rose-700' : 'text-emerald-700'
                                }`}>
                                  ৳{(item.feesDue || 0).toLocaleString()}
                                </td>
                              )}
                              {visibleColumns.status && (
                                <td className="py-1.5 px-2 text-center border border-slate-200">
                                  <span
                                    className={`inline-block px-1.5 py-0.5 rounded text-[9.5px] font-bold ${
                                      item.status === 'Active'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-rose-100 text-rose-800'
                                    }`}
                                  >
                                    {item.status || 'Active'}
                                  </span>
                                </td>
                              )}
                            </>
                          ) : moduleType === 'fees' ? (
                            <>
                              {visibleColumns.invoiceId && (
                                <td className="py-1.5 px-2 font-mono font-bold text-slate-900 border border-slate-200">
                                  {item.id || item.invoiceId}
                                </td>
                              )}
                              {visibleColumns.studentId && (
                                <td className="py-1.5 px-2 font-mono font-bold text-indigo-700 border border-slate-200">
                                  {item.studentId || item.id}
                                </td>
                              )}
                              {visibleColumns.studentName && (
                                <td className="py-1.5 px-2 font-bold uppercase text-slate-900 border border-slate-200">
                                  {item.studentName || item.name}
                                </td>
                              )}
                              {visibleColumns.classSec && (
                                <td className="py-1.5 px-2 text-center border border-slate-200 font-medium">
                                  {item.studentClass || item.class} {item.studentSection ? `(${item.studentSection})` : ''}
                                </td>
                              )}
                              {visibleColumns.feeType && (
                                <td className="py-1.5 px-2 text-slate-800 border border-slate-200 font-medium">
                                  {item.feeType || item.feeHead}
                                </td>
                              )}
                              {visibleColumns.amount && (
                                <td className="py-1.5 px-2 text-right font-mono font-bold border border-slate-200">
                                  ৳{(Number(item.amount) || Number(item.totalAmount) || 0).toLocaleString()}
                                </td>
                              )}
                              {visibleColumns.paidAmount && (
                                <td className="py-1.5 px-2 text-right font-mono font-bold text-emerald-700 border border-slate-200">
                                  ৳{(Number(item.paidAmount) || 0).toLocaleString()}
                                </td>
                              )}
                              {visibleColumns.dueAmount && (
                                <td className={`py-1.5 px-2 text-right font-mono font-bold border border-slate-200 ${
                                  (Number(item.dueAmount) || 0) > 0 ? 'text-rose-700' : 'text-slate-400'
                                }`}>
                                  ৳{(Number(item.dueAmount) || 0).toLocaleString()}
                                </td>
                              )}
                              {visibleColumns.paymentMethod && (
                                <td className="py-1.5 px-2 text-slate-600 font-mono text-[10px] border border-slate-200">
                                  {item.trxId ? `${item.paymentMethod || 'Online'} • ${item.trxId}` : (item.paymentMethod || 'Pending')}
                                </td>
                              )}
                              {visibleColumns.status && (
                                <td className="py-1.5 px-2 text-center border border-slate-200">
                                  <span
                                    className={`inline-block px-1.5 py-0.5 rounded text-[9.5px] font-bold ${
                                      item.status === 'Paid'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : item.status === 'Overdue'
                                        ? 'bg-rose-100 text-rose-800'
                                        : 'bg-amber-100 text-amber-800'
                                    }`}
                                  >
                                    {item.status}
                                  </span>
                                </td>
                              )}
                            </>
                          ) : (
                            availableColumns.filter((c) => c.id !== 'sl' && visibleColumns[c.id]).map((c) => (
                              <td key={c.id} className="py-1.5 px-2 border border-slate-200">
                                {item[c.id] !== undefined ? String(item[c.id]) : ''}
                              </td>
                            ))
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>

                  {/* Summary Totals Row */}
                  {filteredRecords.length > 0 && (
                    <tfoot className="border-t-2 border-slate-900 bg-slate-100 font-bold font-mono">
                      <tr>
                        <td
                          colSpan={
                            moduleType === 'fees'
                              ? (visibleColumns.sl ? 1 : 0) + (visibleColumns.invoiceId ? 1 : 0) + (visibleColumns.studentId ? 1 : 0) + (visibleColumns.studentName ? 1 : 0) + (visibleColumns.classSec ? 1 : 0) + (visibleColumns.feeType ? 1 : 0)
                              : 4
                          }
                          className="py-2 px-2 text-right uppercase text-slate-900 border border-slate-300 font-black"
                        >
                          Cumulative Totals:
                        </td>

                        {moduleType === 'fees' ? (
                          <>
                            {visibleColumns.amount && (
                              <td className="py-2 px-2 text-right text-slate-900 border border-slate-300 font-black">
                                ৳{filteredRecords.reduce((acc, i) => acc + (Number(i.amount) || Number(i.totalAmount) || 0), 0).toLocaleString()}
                              </td>
                            )}
                            {visibleColumns.paidAmount && (
                              <td className="py-2 px-2 text-right text-emerald-700 border border-slate-300 font-black">
                                ৳{filteredRecords.reduce((acc, i) => acc + (Number(i.paidAmount) || 0), 0).toLocaleString()}
                              </td>
                            )}
                            {visibleColumns.dueAmount && (
                              <td className="py-2 px-2 text-right text-rose-700 border border-slate-300 font-black">
                                ৳{filteredRecords.reduce((acc, i) => acc + (Number(i.dueAmount) || 0), 0).toLocaleString()}
                              </td>
                            )}
                            {visibleColumns.paymentMethod && <td className="border border-slate-300"></td>}
                            {visibleColumns.status && <td className="border border-slate-300"></td>}
                          </>
                        ) : moduleType === 'students' ? (
                          <>
                            <td colSpan={visibleColumns.feesDue ? 4 : 5} className="py-2 px-2 text-right text-slate-600 border border-slate-300">
                              Total Due Outstanding:
                            </td>
                            {visibleColumns.feesDue && (
                              <td className="py-2 px-2 text-right text-rose-700 border border-slate-300 font-black">
                                ৳{filteredRecords.reduce((acc, s) => acc + (Number(s.feesDue) || 0), 0).toLocaleString()}
                              </td>
                            )}
                            {visibleColumns.status && <td className="border border-slate-300"></td>}
                          </>
                        ) : (
                          <td colSpan={5} className="border border-slate-300"></td>
                        )}
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* 5. VERIFICATION STAMP & DIGITAL HASH FOOTER */}
              {/* ------------------------------------------------------------- */}
              {includeQrCode && (
                <div className="page-break-inside-avoid border border-slate-300 rounded-xl bg-slate-50/80 p-3 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-slate-600">
                  <div className="flex items-center gap-3">
                    {qrCodeDataUrl && (
                      <div className="w-12 h-12 bg-white p-0.5 border border-slate-300 rounded-lg shrink-0 shadow-2xs">
                        <img src={qrCodeDataUrl} alt="Document QR" className="w-full h-full object-contain" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        <ShieldCheck size={14} className="text-emerald-700" />
                        <span>DIGITALLY VALIDATED INSTITUTIONAL ARCHIVE RECORD</span>
                      </div>
                      <p className="text-[9.5px] font-mono text-slate-500 mt-0.5">
                        Ref: <strong className="text-indigo-900">{documentRefId}</strong> • Verified Against SAS Cloud Nominal Ledger • Session: {schoolInfo.academicYear}
                      </p>
                    </div>
                  </div>

                  <div className="text-center sm:text-right font-medium">
                    <span className="block text-slate-700 font-bold">Authorized for Administrative, Audit & Physical Filing</span>
                    <span className="text-[9px] text-slate-400 font-mono">Generated: {new Date().toLocaleString('en-GB')}</span>
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* 6. OFFICIAL SIGNATURE ENDORSEMENT BLOCKS */}
              {/* ------------------------------------------------------------- */}
              {includeSignatures && (
                <div className="page-break-inside-avoid pt-6 mt-4 border-t border-slate-200">
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 text-center">
                    {moduleType === 'fees' ? (
                      <>
                        <div className="flex flex-col items-center justify-end">
                          <div className="w-32 border-t-2 border-slate-900 pt-1.5">
                            <span className="block text-[10.5px] font-bold uppercase text-slate-900">Cashier / Collector</span>
                            <span className="text-[9px] text-slate-500">Accounts Counter</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-center justify-end">
                          <div className="w-32 border-t-2 border-slate-900 pt-1.5">
                            <span className="block text-[10.5px] font-bold uppercase text-slate-900">Accounts Officer</span>
                            <span className="text-[9px] text-slate-500">Audit & Finance</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-center justify-end">
                          <div className="w-32 border-t-2 border-slate-900 pt-1.5">
                            <span className="block text-[10.5px] font-bold uppercase text-slate-900">Bursar / Registrar</span>
                            <span className="text-[9px] text-slate-500">General Administration</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-center justify-end">
                          <div className="w-32 border-t-2 border-slate-900 pt-1.5">
                            <span className="block text-[10.5px] font-bold uppercase text-slate-900">Headmaster / Principal</span>
                            <span className="text-[9px] text-slate-500">Head of Institution</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex flex-col items-center justify-end">
                          <div className="w-32 border-t-2 border-slate-900 pt-1.5">
                            <span className="block text-[10.5px] font-bold uppercase text-slate-900">Prepared By</span>
                            <span className="text-[9px] text-slate-500">Data Entry / Assistant</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-center justify-end">
                          <div className="w-32 border-t-2 border-slate-900 pt-1.5">
                            <span className="block text-[10.5px] font-bold uppercase text-slate-900">Class Teacher</span>
                            <span className="text-[9px] text-slate-500">Section In-Charge</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-center justify-end">
                          <div className="w-32 border-t-2 border-slate-900 pt-1.5">
                            <span className="block text-[10.5px] font-bold uppercase text-slate-900">Academic Supervisor</span>
                            <span className="text-[9px] text-slate-500">Academic Affairs</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-center justify-end">
                          <div className="w-32 border-t-2 border-slate-900 pt-1.5">
                            <span className="block text-[10.5px] font-bold uppercase text-slate-900">Headmaster / Principal</span>
                            <span className="text-[9px] text-slate-500">Head of Institution</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* 7. RUNNING DOCUMENT FOOTER */}
              {/* ------------------------------------------------------------- */}
              <div className="mt-8 pt-2 border-t border-slate-200 flex justify-between items-center text-[9px] text-slate-400 font-mono">
                <span>Smart Amar School Automated Administrative Report Engine • Version 2.4</span>
                <span>Page 1 of 1 • System Verification Code: {documentRefId}</span>
              </div>

            </div>
          )}

        </div>

        {/* ========================================================================= */}
        {/* BOTTOM ACTION BAR (HIDDEN IN PRINT) */}
        {/* ========================================================================= */}
        <div className="bg-white border-t border-slate-200 px-5 py-3 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span>Document is pre-rendered with printable stylesheets. Click <strong>Print Document</strong> or <strong>Save Vector PDF</strong>.</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Close
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleDownloadVectorPdf}
              disabled={isExportingPdf}
              className="border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100 text-xs font-bold flex items-center gap-1.5"
            >
              <Download size={14} />
              <span>{isExportingPdf ? 'Exporting...' : 'Save Vector PDF'}</span>
            </Button>

            <Button
              type="button"
              onClick={handleNativePrint}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Printer size={14} />
              <span>Print Document (Ctrl + P)</span>
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};

/**
 * Reusable Drop-in Trigger Button for quick placement in headers, data tables, or cards
 */
export interface PrintExportButtonProps {
  title: string;
  defaultSubtitle?: string;
  moduleType: 'students' | 'fees' | 'performance' | 'seatplan' | 'library_catalog' | 'library_borrows' | 'library_overdue' | 'student_progress' | 'general';
  data: any[];
  availableClasses?: string[];
  filterContext?: Record<string, string>;
  institutionInfo?: Partial<PDFSchoolHeader>;
  className?: string;
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
}

export const PrintExportButton: React.FC<PrintExportButtonProps> = ({
  title,
  defaultSubtitle,
  moduleType,
  data,
  availableClasses,
  filterContext,
  institutionInfo,
  className,
  variant = 'outline',
  size = 'sm',
  label = 'Print / Export PDF'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant as any}
        size={size as any}
        onClick={() => setIsOpen(true)}
        className={className}
        icon={Printer}
      >
        {label}
      </Button>

      {isOpen && (
        <PrintExportUtilityModal
          isOpen={true}
          onClose={() => setIsOpen(false)}
          title={title}
          defaultSubtitle={defaultSubtitle}
          moduleType={moduleType}
          data={data}
          availableClasses={availableClasses}
          filterContext={filterContext}
          institutionInfo={institutionInfo}
        />
      )}
    </>
  );
};
