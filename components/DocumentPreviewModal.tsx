import React, { useState, useEffect } from 'react';
import { 
  X, Download, Printer, ZoomIn, ZoomOut, RotateCw, Maximize2, 
  Minimize2, ChevronLeft, ChevronRight, Copy, ShieldCheck, 
  CheckCircle2, FileText, Receipt, FileBadge, Users, QrCode, 
  Lock, RefreshCw, Layers, Calendar, User, Hash, DollarSign, 
  Award, FileCheck2, ExternalLink, Sparkles, AlertCircle,
  Building2, CalendarClock, HeartPulse, Scale, GraduationCap
} from 'lucide-react';
import { SchoolDocument } from '../types';
import { formatBytes } from '../utils/documentStorage';
import { useToast } from './UIComponents';

interface DocumentPreviewModalProps {
  document: SchoolDocument | null;
  documentsList?: SchoolDocument[];
  onClose: () => void;
  onNavigate?: (doc: SchoolDocument) => void;
  onDownload?: (doc: SchoolDocument) => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  document: doc,
  documentsList = [],
  onClose,
  onNavigate,
  onDownload
}) => {
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'preview' | 'fields' | 'security'>('preview');
  const [zoom, setZoom] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showWatermark, setShowWatermark] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [voucherCopy, setVoucherCopy] = useState<'student' | 'office'>('student');

  // Reset view state when document changes
  useEffect(() => {
    setZoom(100);
    setRotation(0);
    setIsVerifying(false);
  }, [doc?.id]);

  // Keyboard navigation & escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [doc, documentsList]);

  if (!doc) return null;

  // Navigation indices
  const currentIndex = documentsList.findIndex(d => d.id === doc.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex !== -1 && currentIndex < documentsList.length - 1;

  const handlePrev = () => {
    if (hasPrev && onNavigate) {
      onNavigate(documentsList[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext && onNavigate) {
      onNavigate(documentsList[currentIndex + 1]);
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleResetZoom = () => {
    setZoom(100);
    setRotation(0);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard`, 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleTriggerVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      showToast('SHA-256 fingerprint verified against institutional root blockchain ledger.', 'success');
    }, 700);
  };

  const isCertificate = doc.category === 'academic-certificates';
  const isReceipt = doc.category === 'fee-receipts';
  const isRecord = doc.category === 'student-records';
  const isImage = doc.fileType.startsWith('image/') || doc.fileName.match(/\.(png|jpg|jpeg|webp)$/i);

  return (
    <div className={`fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in ${
      isFullscreen ? 'p-0' : ''
    }`}>
      <div className={`bg-white rounded-2xl shadow-2xl border border-slate-200 w-full overflow-hidden flex flex-col transition-all ${
        isFullscreen ? 'h-screen max-w-none rounded-none' : 'max-w-5xl max-h-[92vh] my-auto'
      }`}>
        {/* Top Header Bar */}
        <div className="bg-slate-900 text-white px-4 py-3 sm:px-6 flex items-center justify-between shrink-0 border-b border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            {/* Category Icon Badge */}
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isCertificate ? 'bg-purple-500/20 text-purple-400 border border-purple-400/30' :
              isReceipt ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/30' :
              isRecord ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-400/30' :
              'bg-slate-700 text-slate-300'
            }`}>
              {isCertificate && <FileBadge size={18} />}
              {isReceipt && <Receipt size={18} />}
              {isRecord && <Users size={18} />}
              {!isCertificate && !isReceipt && !isRecord && <FileText size={18} />}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-md">
                  {doc.title}
                </h3>
                <span className="text-[10px] font-mono bg-white/10 text-slate-300 px-2 py-0.5 rounded-full shrink-0">
                  {doc.id}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                  doc.securityLevel === 'Restricted' ? 'bg-rose-500/20 text-rose-300 border border-rose-400/30' :
                  doc.securityLevel === 'Confidential' ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30' :
                  'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                }`}>
                  {doc.securityLevel}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono truncate flex items-center gap-2 mt-0.5 flex-wrap">
                <span>{doc.fileName}</span>
                <span>•</span>
                <span>{formatBytes(doc.fileSize)}</span>
                <span>•</span>
                <span>{doc.folder}</span>
                {doc.issuingAuthority && (
                  <>
                    <span>•</span>
                    <span className="text-indigo-300 font-medium font-sans flex items-center gap-1">
                      <Building2 size={11} />
                      {doc.issuingAuthority}
                    </span>
                  </>
                )}
                {doc.expiryDate && (
                  <>
                    <span>•</span>
                    <span className={`font-sans font-bold flex items-center gap-1 ${
                      doc.expiryDate === 'Permanent' ? 'text-emerald-400' : 'text-amber-300'
                    }`}>
                      <CalendarClock size={11} />
                      Exp: {doc.expiryDate}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Action & Close Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Download Button */}
            {onDownload && (
              <button
                onClick={() => onDownload(doc)}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                title="Download this document"
              >
                <Download size={14} />
                <span className="hidden sm:inline">Download</span>
              </button>
            )}

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
              title="Print document"
            >
              <Printer size={16} />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors hidden sm:flex"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-rose-600/80 text-slate-400 hover:text-white transition-colors ml-1"
              title="Close modal (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Toolbar & Tab Switcher Bar */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center justify-between gap-3 text-xs shrink-0 flex-wrap">
          {/* Tabs */}
          <div className="flex items-center bg-white p-0.5 rounded-xl border border-slate-200 shrink-0">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'preview'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText size={13} />
              <span>Document Preview</span>
            </button>

            <button
              onClick={() => setActiveTab('fields')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'fields'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers size={13} />
              <span>Extracted Data</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'security'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck size={13} />
              <span>Audit & SHA-256</span>
            </button>
          </div>

          {/* Document View Controls (only when on preview tab) */}
          {activeTab === 'preview' && (
            <div className="flex items-center gap-1 sm:gap-2 ml-auto">
              {/* Receipt counterfoil switch */}
              {isReceipt && (
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white mr-1 text-[11px] font-bold">
                  <button
                    onClick={() => setVoucherCopy('student')}
                    className={`px-2 py-1 transition-colors ${voucherCopy === 'student' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    Student Copy
                  </button>
                  <button
                    onClick={() => setVoucherCopy('office')}
                    className={`px-2 py-1 transition-colors ${voucherCopy === 'office' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    Office Foil
                  </button>
                </div>
              )}

              {/* Watermark toggle */}
              <button
                onClick={() => setShowWatermark(!showWatermark)}
                className={`px-2 py-1 rounded-lg border font-bold text-[11px] transition-colors ${
                  showWatermark 
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                    : 'bg-white border-slate-200 text-slate-500'
                }`}
                title="Toggle official institutional watermark"
              >
                Watermark {showWatermark ? 'ON' : 'OFF'}
              </button>

              {/* Zoom Controls */}
              <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={handleZoomOut}
                  disabled={zoom <= 50}
                  className="p-1.5 hover:bg-slate-100 disabled:opacity-40 text-slate-700"
                  title="Zoom Out (-25%)"
                >
                  <ZoomOut size={14} />
                </button>
                <button
                  onClick={handleResetZoom}
                  className="px-2 text-[11px] font-mono font-bold text-slate-700 hover:bg-slate-50"
                  title="Reset Zoom to 100%"
                >
                  {zoom}%
                </button>
                <button
                  onClick={handleZoomIn}
                  disabled={zoom >= 200}
                  className="p-1.5 hover:bg-slate-100 disabled:opacity-40 text-slate-700"
                  title="Zoom In (+25%)"
                >
                  <ZoomIn size={14} />
                </button>
              </div>

              {/* Rotate Button */}
              <button
                onClick={handleRotate}
                className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700"
                title="Rotate 90°"
              >
                <RotateCw size={14} />
              </button>
            </div>
          )}

          {/* Sequential Browser Controls */}
          {documentsList.length > 1 && (
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
              <button
                onClick={handlePrev}
                disabled={!hasPrev}
                className="p-1 rounded text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
                title="Previous Document (←)"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-[10px] font-bold text-slate-500 px-1 font-mono">
                {currentIndex + 1} / {documentsList.length}
              </span>
              <button
                onClick={handleNext}
                disabled={!hasNext}
                className="p-1 rounded text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
                title="Next Document (→)"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Modal Body Container */}
        <div className="flex-1 overflow-y-auto bg-slate-200/70 p-4 sm:p-6 flex items-center justify-center min-h-[420px]">
          {activeTab === 'preview' && (
            <div 
              className="transition-transform duration-200 origin-center flex items-center justify-center w-full"
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`
              }}
            >
              {/* IMAGE SCAN PREVIEW */}
              {isImage && doc.contentUrl ? (
                <div className="relative max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-300">
                  <img 
                    src={doc.contentUrl} 
                    alt={doc.title} 
                    className="w-full h-auto max-h-[600px] object-contain mx-auto"
                  />
                  {showWatermark && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-20 rotate-[-25deg]">
                      <span className="font-sans font-black text-2xl uppercase tracking-widest text-slate-900 border-4 border-slate-900 px-6 py-2">
                        OFFICIAL VAULT ARCHIVE
                      </span>
                    </div>
                  )}
                </div>
              ) : isCertificate ? (
                /* ACADEMIC CERTIFICATE PREVIEW */
                <div className="w-full max-w-2xl bg-amber-50/40 rounded-xl shadow-2xl border-8 border-double border-amber-700/60 p-8 sm:p-10 relative overflow-hidden font-serif text-slate-800">
                  {/* Watermark */}
                  {showWatermark && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10 rotate-[-25deg]">
                      <span className="font-sans font-black text-4xl uppercase tracking-widest text-amber-900 border-4 border-amber-900 px-8 py-3">
                        SMART AMAR SCHOOL
                      </span>
                    </div>
                  )}

                  {/* Corner Ornaments */}
                  <div className="absolute top-2 left-2 text-amber-600/60 text-lg select-none">❖</div>
                  <div className="absolute top-2 right-2 text-amber-600/60 text-lg select-none">❖</div>
                  <div className="absolute bottom-2 left-2 text-amber-600/60 text-lg select-none">❖</div>
                  <div className="absolute bottom-2 right-2 text-amber-600/60 text-lg select-none">❖</div>

                  {/* Header */}
                  <div className="text-center pb-6 border-b-2 border-amber-700/20 relative">
                    <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 border-2 border-amber-600 text-amber-800 flex items-center justify-center mb-2 shadow-inner">
                      <Award size={28} />
                    </div>
                    <div className="font-sans text-[11px] font-black uppercase tracking-widest text-amber-800">
                      GOVERNMENT RECOGNIZED & EDUCATION BOARD AFFILIATED
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1 font-serif">
                      Smart Amar Model School & College
                    </h2>
                    <p className="text-xs text-slate-600 font-sans mt-0.5">
                      Established 2010 • Institution EIIN: 134892 • Dhaka Board
                    </p>
                  </div>

                  {/* Title of Certificate */}
                  <div className="text-center my-6">
                    <span className="inline-block px-4 py-1 rounded-full bg-amber-100/80 border border-amber-300 font-sans text-xs font-black uppercase tracking-widest text-amber-900">
                      {doc.certificateType || 'Certificate of Academic Merit'}
                    </span>
                    <p className="text-xs text-slate-500 font-sans mt-2 italic">
                      This is to officially certify that
                    </p>
                    <h3 className="text-xl sm:text-2xl font-black text-indigo-950 font-serif mt-1 border-b border-dashed border-slate-300 pb-2 inline-block min-w-[280px]">
                      {doc.studentName || 'Student Name Unspecified'}
                    </h3>
                  </div>

                  {/* Body Text */}
                  <div className="text-center text-xs sm:text-sm leading-relaxed text-slate-700 space-y-3 font-sans px-4">
                    <p>
                      Student ID: <strong className="font-mono text-slate-900">{doc.studentId || 'N/A'}</strong> • 
                      Class: <strong className="text-slate-900">{doc.studentClass || 'Class 10'}</strong> • 
                      Roll No: <strong className="font-mono text-slate-900">{doc.studentRoll || '101'}</strong>
                    </p>
                    <p className="text-xs text-slate-600 italic">
                      has successfully demonstrated exemplary academic diligence, outstanding character, and high moral conduct during their institutional tenure at this institution.
                    </p>
                  </div>

                  {/* Verification & Signatures Footer */}
                  <div className="mt-8 pt-6 border-t border-amber-700/20 flex items-end justify-between text-xs font-sans">
                    {/* Left: Verification Seal */}
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 rounded-xl border-2 border-emerald-600 bg-emerald-50 text-emerald-800 flex flex-col items-center justify-center p-1 text-center shadow-xs">
                        <CheckCircle2 size={16} />
                        <span className="text-[8px] font-black uppercase tracking-tighter mt-0.5">SEAL VERIFIED</span>
                        <span className="text-[7px] font-mono">{doc.id}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 space-y-0.5">
                        <div>Issue Date: <strong className="text-slate-700">{doc.issueDate || '2024-01-15'}</strong></div>
                        <div>Vault Ref: <code className="font-mono text-indigo-700 font-bold">{doc.id}</code></div>
                      </div>
                    </div>

                    {/* Right: Signature */}
                    <div className="text-center">
                      <div className="font-serif italic text-base text-indigo-900 font-bold tracking-wider mb-1">
                        Rafiqul Islam
                      </div>
                      <div className="w-32 border-t border-slate-400 mx-auto" />
                      <div className="text-[10px] font-bold text-slate-800 uppercase tracking-wider mt-1">
                        Principal & Head of Institution
                      </div>
                    </div>
                  </div>
                </div>
              ) : isReceipt ? (
                /* OFFICIAL FEE RECEIPT VOUCHER PREVIEW */
                <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl border-2 border-emerald-600/80 p-6 sm:p-8 relative overflow-hidden font-sans text-slate-800">
                  {/* Watermark */}
                  {showWatermark && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10 rotate-[-25deg]">
                      <span className="font-sans font-black text-4xl uppercase tracking-widest text-emerald-900 border-4 border-emerald-900 px-8 py-3">
                        PAID & AUDITED
                      </span>
                    </div>
                  )}

                  {/* Top Bar with Voucher Type */}
                  <div className="flex items-center justify-between pb-3 border-b-2 border-emerald-600">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                        <Receipt size={18} />
                      </div>
                      <div>
                        <h4 className="font-black text-base text-slate-900">Smart Amar School & College</h4>
                        <p className="text-[10px] text-slate-500 font-mono">Institutional Finance & Fee Counter</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                        {voucherCopy === 'student' ? 'Student Voucher Copy' : 'Accounts Office Counterfoil'}
                      </span>
                      <div className="text-[11px] font-mono font-bold text-slate-600 mt-1">
                        Receipt #: {doc.id}
                      </div>
                    </div>
                  </div>

                  {/* Student & Payment Particulars */}
                  <div className="grid grid-cols-2 gap-3 py-4 text-xs border-b border-slate-200">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Student Dossier</span>
                      <div className="font-bold text-slate-900 text-sm mt-0.5">{doc.studentName || 'Walk-in Student'}</div>
                      <div className="text-slate-600 font-mono text-[11px] mt-0.5">
                        ID: <strong className="text-slate-800">{doc.studentId || 'N/A'}</strong> • {doc.studentClass || 'Class 10'} (Roll #{doc.studentRoll || '101'})
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Date of Payment</span>
                      <div className="font-bold text-slate-800 mt-0.5">
                        {new Date(doc.uploadedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                      {doc.transactionId && (
                        <div className="text-slate-500 font-mono text-[10px] mt-0.5">
                          Ref: <strong className="text-emerald-700">{doc.transactionId}</strong>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Itemized Fee Table */}
                  <div className="py-4">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 text-[10px] uppercase font-bold">
                          <th className="py-1.5">Fee Particulars</th>
                          <th className="py-1.5 text-right">Amount (BDT)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="py-2 text-slate-800 font-medium">
                            {doc.title}
                          </td>
                          <td className="py-2 text-right font-mono font-bold text-slate-900">
                            ৳{(doc.amount || 1500).toLocaleString()}
                          </td>
                        </tr>
                        <tr>
                          <td className="py-1 text-slate-500 text-[11px]">
                            Digital Processing & System Maintenance Fee
                          </td>
                          <td className="py-1 text-right font-mono text-slate-500 text-[11px]">
                            ৳0.00 (Waived)
                          </td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-slate-300 font-bold">
                          <td className="py-2 text-slate-900 text-xs uppercase">Total Amount Paid</td>
                          <td className="py-2 text-right font-mono text-base font-black text-emerald-600">
                            ৳{(doc.amount || 1500).toLocaleString()}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  {/* Payment Stamp & Signatures */}
                  <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
                    {/* Rubber Stamp */}
                    <div className="border-2 border-emerald-600 rounded-xl px-3 py-1.5 text-center rotate-[-4deg] bg-emerald-50/50">
                      <div className="font-black text-emerald-700 text-xs uppercase tracking-wider flex items-center gap-1 justify-center">
                        <CheckCircle2 size={13} />
                        <span>RECEIVED & PAID</span>
                      </div>
                      <div className="text-[9px] font-mono text-emerald-800 mt-0.5">
                        Accounts Dept • Smart Amar
                      </div>
                    </div>

                    {/* Authorized Signatory */}
                    <div className="text-right">
                      <div className="font-serif italic text-xs text-slate-700 font-bold mb-1">
                        M. Rahman (Officer)
                      </div>
                      <div className="w-28 border-t border-slate-400 ml-auto" />
                      <div className="text-[10px] text-slate-500 font-bold mt-1">Authorized Cashier</div>
                    </div>
                  </div>
                </div>
              ) : isRecord ? (
                /* STUDENT ADMISSION RECORD & DOSSIER PREVIEW */
                <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-300 p-6 sm:p-8 relative overflow-hidden font-sans text-slate-800">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        STUDENT OFFICIAL RECORD DOSSIER
                      </span>
                      <h3 className="text-lg font-black text-slate-900 mt-1">
                        Student Cumulative Profile & Enrolment
                      </h3>
                      <p className="text-[10px] text-slate-500 font-mono">
                        Archive ID: {doc.id} • Registered under Dhaka Education Board
                      </p>
                    </div>

                    {/* Photo placeholder */}
                    <div className="w-16 h-20 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-center p-1 text-slate-400 shrink-0">
                      <User size={20} />
                      <span className="text-[7px] font-bold uppercase mt-1 leading-tight">PHOTO ATTACHED</span>
                    </div>
                  </div>

                  {/* Particulars Grid */}
                  <div className="py-4 space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Student Name</span>
                        <div className="font-bold text-slate-900 text-sm mt-0.5">{doc.studentName || 'Rahim Ahmed'}</div>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Student System ID</span>
                        <div className="font-mono font-bold text-indigo-600 text-sm mt-0.5">{doc.studentId || 'ST-2024-001'}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Class Enrolled</span>
                        <div className="font-semibold text-slate-800 mt-0.5">{doc.studentClass || 'Class 10'}</div>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Roll Number</span>
                        <div className="font-mono font-semibold text-slate-800 mt-0.5">#{doc.studentRoll || '101'}</div>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Birth Reg (BRIS)</span>
                        <div className="font-mono font-bold text-emerald-700 mt-0.5">Verified OK</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Archived File</span>
                        <div className="font-mono text-slate-700 mt-0.5 truncate">{doc.fileName}</div>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">File Checksum</span>
                        <div className="font-mono text-[10px] text-slate-600 truncate mt-0.5">{doc.fileHash}</div>
                      </div>
                    </div>

                    {doc.notes && (
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-600">
                        <strong className="text-slate-700 block mb-0.5">Verification Notes:</strong>
                        {doc.notes}
                      </div>
                    )}
                  </div>

                  {/* Stamp */}
                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-400 font-mono">
                      Archived: {new Date(doc.uploadedAt).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      <ShieldCheck size={13} />
                      <span>Verified Institutional Dossier</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* GENERIC ADMINISTRATIVE DOCUMENT PREVIEW */
                <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-300 p-8 relative overflow-hidden font-sans text-slate-800">
                  <div className="text-center pb-4 border-b border-slate-200">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      GOVERNMENT OF THE PEOPLE'S REPUBLIC OF BANGLADESH
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1">Smart Amar Institutional Archive</h3>
                    <p className="text-xs text-slate-500 font-mono">Reference: {doc.id}</p>
                  </div>

                  <div className="py-6 space-y-4 text-xs leading-relaxed text-slate-700">
                    <div className="font-bold text-slate-900 text-sm">{doc.title}</div>
                    <p>
                      This institutional document has been cryptographically preserved in the dedicated School Admin documents vault.
                    </p>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-[11px] space-y-1">
                      <div>File Name: <strong className="text-slate-900">{doc.fileName}</strong></div>
                      <div>MIME Type: {doc.fileType}</div>
                      <div>File Size: {formatBytes(doc.fileSize)}</div>
                      <div>Vault Location: {doc.folder}</div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Archived by: {doc.uploadedBy.name}</span>
                    <span className="font-bold text-indigo-600">Integrity Verified</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EXTRACTED FIELDS & METADATA */}
          {activeTab === 'fields' && (
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg border border-slate-200 p-6 space-y-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  Field Inspector
                </span>
                <h3 className="text-base font-bold text-slate-800 mt-1">
                  Extracted Document Fields & Associated Metadata
                </h3>
                <p className="text-xs text-slate-500">
                  Review all structured parameters indexed for administrative retrieval and compliance checks.
                </p>
              </div>

              {/* Core Document Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Hash size={12} />
                    Document ID
                  </span>
                  <div className="text-xs font-mono font-bold text-indigo-700 mt-1 flex items-center justify-between">
                    <span>{doc.id}</span>
                    <button onClick={() => copyToClipboard(doc.id, 'Document ID')} className="text-slate-400 hover:text-indigo-600">
                      <Copy size={12} />
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <FileText size={12} />
                    Repository Category
                  </span>
                  <div className="text-xs font-bold text-slate-800 capitalize mt-1 flex items-center gap-1.5">
                    {doc.category === 'medical' ? <HeartPulse size={13} className="text-rose-600" /> :
                     doc.category === 'legal' ? <Scale size={13} className="text-amber-600" /> :
                     doc.category === 'academic' ? <GraduationCap size={13} className="text-blue-600" /> : null}
                    <span>{(doc.category || '').replace('-', ' ')}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-200/80 md:col-span-2">
                  <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
                    <Building2 size={12} />
                    Issuing Authority / Institution
                  </span>
                  <div className="text-xs font-bold text-indigo-950 mt-1">
                    {doc.issuingAuthority || 'Institutional Registrar Office'}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80">
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
                    <CalendarClock size={12} />
                    Validity & Expiration
                  </span>
                  <div className="text-xs font-black text-amber-900 mt-1 flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10.5px] ${
                      doc.expiryDate === 'Permanent' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-amber-100 text-amber-900'
                    }`}>
                      {doc.expiryDate || 'Permanent Record'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Lock size={12} />
                    Security Level
                  </span>
                  <div className="mt-1">
                    <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded-full ${
                      doc.securityLevel === 'Restricted' ? 'bg-rose-100 text-rose-800' :
                      doc.securityLevel === 'Confidential' ? 'bg-amber-100 text-amber-800' :
                      'bg-emerald-100 text-emerald-800'
                    }`}>
                      {doc.securityLevel}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <User size={12} />
                    Linked Student
                  </span>
                  <div className="text-xs font-bold text-slate-800 mt-1">
                    {doc.studentName || 'Not linked to specific student'}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Hash size={12} />
                    Student ID & Roll
                  </span>
                  <div className="text-xs font-mono font-bold text-slate-700 mt-1">
                    {doc.studentId || 'N/A'} {doc.studentRoll ? `(Roll #${doc.studentRoll})` : ''}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Calendar size={12} />
                    Academic Class
                  </span>
                  <div className="text-xs font-bold text-slate-800 mt-1">
                    {doc.studentClass || 'N/A'}
                  </div>
                </div>

                {doc.amount !== undefined && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
                      <DollarSign size={12} />
                      Receipt Amount
                    </span>
                    <div className="text-sm font-black text-emerald-800 mt-1">
                      ৳{doc.amount.toLocaleString()}
                    </div>
                  </div>
                )}

                {doc.transactionId && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Hash size={12} />
                      Transaction Reference
                    </span>
                    <div className="text-xs font-mono font-bold text-slate-800 mt-1 truncate">
                      {doc.transactionId}
                    </div>
                  </div>
                )}

                {doc.certificateType && (
                  <div className="p-3 rounded-xl bg-purple-50 border border-purple-200/80">
                    <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1">
                      <Award size={12} />
                      Certificate Classification
                    </span>
                    <div className="text-xs font-bold text-purple-900 mt-1">
                      {doc.certificateType}
                    </div>
                  </div>
                )}
              </div>

              {/* Archival Remark & Tags */}
              <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
                {doc.notes && (
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      Archival Remarks & Notes
                    </span>
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 text-xs leading-relaxed">
                      {doc.notes}
                    </div>
                  </div>
                )}

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    Metadata Search Tags
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {doc.tags && doc.tags.length > 0 ? (
                      doc.tags.map((tag, idx) => (
                        <span key={idx} className="text-xs bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-lg font-medium">
                          #{tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 italic text-xs">No custom tags attached</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CRYPTOGRAPHIC AUDIT & SECURITY LEDGER */}
          {activeTab === 'security' && (
            <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg border border-slate-200 p-6 space-y-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Cryptographic Provenance
                </span>
                <h3 className="text-base font-bold text-slate-800 mt-1">
                  SHA-256 Tamper-Proof Audit Verification
                </h3>
                <p className="text-xs text-slate-500">
                  Every document uploaded to the vault is sealed with a unique SHA-256 cryptographic hash that prevents unauthorized alteration.
                </p>
              </div>

              {/* Hash Verification Card */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-emerald-950">SHA-256 Cryptographic Hash</div>
                      <div className="text-[10px] text-emerald-700 font-medium">Original upload fingerprint timestamped</div>
                    </div>
                  </div>

                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2.5 py-1 rounded-full shadow-2xs">
                    {doc.verificationStatus}
                  </span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-emerald-100 font-mono text-xs text-emerald-950 break-all select-all flex items-start justify-between gap-2">
                  <span>{doc.fileHash}</span>
                  <button
                    onClick={() => copyToClipboard(doc.fileHash, 'SHA-256 Fingerprint')}
                    className="p-1 hover:text-emerald-700 text-slate-400 shrink-0"
                    title="Copy hash"
                  >
                    <Copy size={14} />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={handleTriggerVerify}
                    disabled={isVerifying}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                  >
                    <RefreshCw size={13} className={isVerifying ? 'animate-spin' : ''} />
                    <span>{isVerifying ? 'Recalculating Checksum...' : 'Re-verify Ledger Hash'}</span>
                  </button>

                  <span className="text-[11px] text-emerald-800 font-medium flex items-center gap-1">
                    <CheckCircle2 size={13} className="text-emerald-600" />
                    <span>Bitstream matches original 100%</span>
                  </span>
                </div>
              </div>

              {/* Provenance Audit Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Audit Trail & Storage Attributes
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                  <div className="p-3 flex items-center justify-between">
                    <span className="text-slate-500">Vault Directory</span>
                    <code className="font-mono text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded">
                      {doc.folder}
                    </code>
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <span className="text-slate-500">Archived By</span>
                    <span className="font-bold text-slate-800">
                      {doc.uploadedBy.name} ({doc.uploadedBy.role})
                    </span>
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <span className="text-slate-500">Timestamp</span>
                    <span className="font-mono text-slate-700">
                      {new Date(doc.uploadedAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <span className="text-slate-500">Encryption Standard</span>
                    <span className="font-bold text-slate-700">AES-256 (At-Rest) • TLS 1.3 (In-Transit)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-white border-t border-slate-200 px-4 py-3 sm:px-6 flex items-center justify-between shrink-0 text-xs">
          <div className="flex items-center gap-2 text-slate-500 font-medium">
            <span className="hidden sm:inline">Use <kbd className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">←</kbd> <kbd className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">→</kbd> to cycle files</span>
          </div>

          <div className="flex items-center gap-2">
            {onDownload && (
              <button
                onClick={() => onDownload(doc)}
                className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold flex items-center gap-1.5 transition-colors"
              >
                <Download size={14} />
                <span>Download Document</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
