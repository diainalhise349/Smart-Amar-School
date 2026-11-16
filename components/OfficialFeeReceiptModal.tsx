import React, { useState } from 'react';
import { 
  Download, Printer, CheckCircle2, ShieldCheck, Copy, 
  Check, FileText, QrCode, X, Building2, User, Phone, Calendar,
  CreditCard, Loader2, Sparkles, AlertCircle, Mail, Send
} from 'lucide-react';
import { Modal, Button, Badge, useToast } from './UIComponents';
import { useAuth } from '../context/AuthContext';
import { resolveFeeReceiptData, downloadFeeReceiptPDF, numberToWordsBDT } from '../utils/feeReceiptResolver';
import { sendFeeReceiptEmail, getRegisteredParentEmail, FeeReceiptEmailLog } from '../utils/feeEmailService';

interface OfficialFeeReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any | null;
}

export const OfficialFeeReceiptModal: React.FC<OfficialFeeReceiptModalProps> = ({
  isOpen,
  onClose,
  invoice
}) => {
  const { activeTenant } = useAuth();
  const { showToast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [copiedTrx, setCopiedTrx] = useState(false);
  const [copiedReceiptNo, setCopiedReceiptNo] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [showEmailBox, setShowEmailBox] = useState(false);
  const [customParentEmail, setCustomParentEmail] = useState('');
  const [lastEmailSent, setLastEmailSent] = useState<FeeReceiptEmailLog | null>(null);

  if (!invoice) return null;

  // Resolve normalized receipt data
  const receipt = resolveFeeReceiptData(invoice, activeTenant);
  const schoolName = activeTenant?.name || 'SMART AMAR SCHOOL & COLLEGE';
  const schoolEiin = activeTenant?.eiin || '108162';
  const schoolCode = activeTenant?.code || 'SCH-101';
  const schoolAddress = activeTenant?.address || 'Dhaka, Bangladesh';
  const schoolPhone = activeTenant?.contactPhone || '+880 1712-345678';
  const schoolEmail = activeTenant?.contactEmail || 'office@smartamarschool.edu.bd';

  const isPaid = receipt.status?.toLowerCase().includes('paid') || 
                 receipt.status?.toLowerCase().includes('settled') || 
                 (receipt.dueAmount ?? 0) === 0;

  const handleDownloadPDF = async () => {
    try {
      setIsExporting(true);
      await downloadFeeReceiptPDF(invoice, activeTenant);
      showToast(`Official PDF receipt for ${receipt.studentName} generated & downloaded!`, 'success');
    } catch (err) {
      console.error('Failed to export fee receipt PDF:', err);
      showToast('Failed to generate PDF receipt. Please try again.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSendEmail = async () => {
    try {
      setIsSendingEmail(true);
      const targetEmail = customParentEmail.trim() || invoice.parentEmail || getRegisteredParentEmail(receipt.studentId, receipt.studentName);
      const res = await sendFeeReceiptEmail({
        invoice,
        activeTenant,
        recipientEmail: targetEmail,
        deliveryChannel: 'Manual Resend'
      });
      setLastEmailSent(res);
      showToast(`Fee receipt PDF emailed to ${res.recipientEmail}!`, 'success');
      setShowEmailBox(false);
    } catch (err) {
      console.error('Failed to send receipt email:', err);
      showToast('Failed to dispatch receipt email.', 'error');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleCopy = (text: string, type: 'trx' | 'receipt') => {
    navigator.clipboard.writeText(text);
    if (type === 'trx') {
      setCopiedTrx(true);
      setTimeout(() => setCopiedTrx(false), 2000);
      showToast('Transaction ID copied to clipboard', 'info');
    } else {
      setCopiedReceiptNo(true);
      setTimeout(() => setCopiedReceiptNo(false), 2000);
      showToast('Receipt number copied to clipboard', 'info');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="lg"
    >
      <div className="space-y-6 -mt-2">
        
        {/* ACTION TOOLBAR (Top Bar) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Official School Fee Receipt</h3>
              <p className="text-[11px] text-slate-500">Auto-populated from institutional financial ledger</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              icon={Printer}
              onClick={handlePrint}
              className="text-xs text-slate-700 hover:bg-slate-100"
            >
              Print
            </Button>
            <Button
              size="sm"
              icon={isExporting ? Loader2 : Download}
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="text-xs bg-indigo-700 hover:bg-indigo-800 text-white font-bold shadow-xs flex items-center gap-1.5"
            >
              {isExporting ? 'Generating PDF...' : 'Download Official PDF'}
            </Button>
          </div>
        </div>

        {/* PRINTABLE RECEIPT CONTAINER */}
        <div 
          id="official-school-fee-receipt-view" 
          className="bg-white border-2 border-slate-300 rounded-2xl p-5 sm:p-7 shadow-xs relative overflow-hidden font-sans space-y-5 text-slate-800"
        >
          {/* Subtle Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
            <div className="text-8xl font-black rotate-[-30deg] tracking-widest text-slate-900 uppercase">
              PAID RECEIPT
            </div>
          </div>

          {/* 1. School Header */}
          <div className="text-center border-b-2 border-slate-900 pb-4 relative">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-900 to-indigo-900 rounded-xl text-white font-black text-xl flex items-center justify-center mx-auto mb-2 shadow-sm border border-blue-200 overflow-hidden">
              {activeTenant?.logoUrl ? (
                <img src={activeTenant.logoUrl} alt={schoolName} className="w-full h-full object-cover" />
              ) : (
                <span>{schoolName.charAt(0) || 'S'}</span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight">
              {schoolName}
            </h2>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              {activeTenant?.type === 'Madrasa' ? 'বাংলাদেশ মাদ্রাসা শিক্ষা বোর্ড অনুমোদিত দ্বীনি শিক্ষা প্রতিষ্ঠান' :
               activeTenant?.type === 'College' ? 'মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড ও জাতীয় বিশ্ববিদ্যালয় অধিভুক্ত' :
               activeTenant?.type === 'University' ? 'বিশ্ববিদ্যালয় মঞ্জুরি কমিশন (UGC) অনুমোদিত শিক্ষা প্রতিষ্ঠান' :
               'মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড অধিভুক্ত মডেল বিদ্যাপীঠ'}
            </p>
            <div className="text-[11px] text-slate-500 font-mono mt-1 flex flex-wrap items-center justify-center gap-3">
              <span>EIIN: <strong className="text-slate-700">{schoolEiin}</strong></span>
              <span>•</span>
              <span>Code: <strong className="text-slate-700">{schoolCode}</strong></span>
              <span>•</span>
              <span>Session: <strong className="text-slate-700">{receipt.academicYear}</strong></span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              {schoolAddress} • Hotline: {schoolPhone} • Email: {schoolEmail}
            </p>

            {/* Receipt Ribbon & Paid Badge */}
            <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-slate-200">
              <span className="bg-blue-950 text-white text-[10px] font-black uppercase px-3 py-1 rounded-md tracking-wider">
                Official Money Receipt (Student & Parent Copy)
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase flex items-center gap-1 ${
                isPaid ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
              }`}>
                <CheckCircle2 size={13} className={isPaid ? 'text-emerald-600' : 'text-rose-600'} />
                <span>{isPaid ? 'Verified Paid' : 'Pending Dues'}</span>
              </span>
            </div>
          </div>

          {/* 2. Top Metadata (Receipt & Gateway Details) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Receipt #</span>
              <div className="flex items-center gap-1 font-mono font-black text-indigo-700">
                <span className="truncate">{receipt.receiptNo}</span>
                <button 
                  onClick={() => handleCopy(receipt.receiptNo, 'receipt')}
                  className="text-slate-400 hover:text-indigo-600 cursor-pointer"
                  title="Copy Receipt #"
                >
                  {copiedReceiptNo ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                </button>
              </div>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Payment Date</span>
              <span className="font-bold text-slate-800">{receipt.paymentDate}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Gateway / Channel</span>
              <span className="font-bold text-emerald-700">{receipt.paymentMethod}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block">TrxID / Ref</span>
              <div className="flex items-center gap-1 font-mono font-bold text-indigo-600">
                <span className="truncate">{receipt.trxId}</span>
                {receipt.trxId && (
                  <button 
                    onClick={() => handleCopy(receipt.trxId!, 'trx')}
                    className="text-slate-400 hover:text-indigo-600 cursor-pointer"
                    title="Copy TrxID"
                  >
                    {copiedTrx ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 3. Student & Guardian Information Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs border border-slate-200 p-4 rounded-xl bg-white">
            <div className="space-y-1.5 border-b sm:border-b-0 sm:border-r border-slate-200 pb-3 sm:pb-0 sm:pr-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Student Particulars</span>
              <div className="flex justify-between">
                <span className="text-slate-500">Student Name:</span>
                <span className="font-bold text-slate-900 uppercase">{receipt.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Student ID:</span>
                <span className="font-mono font-bold text-indigo-700">{receipt.studentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Class & Section:</span>
                <span className="font-bold text-slate-800">{receipt.studentClass} ({receipt.studentSection || 'A'})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Class Roll:</span>
                <span className="font-bold text-slate-800">{receipt.studentRoll || 'N/A'}</span>
              </div>
            </div>

            <div className="space-y-1.5 sm:pl-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Guardian & Billing</span>
              <div className="flex justify-between">
                <span className="text-slate-500">Guardian Name:</span>
                <span className="font-bold text-slate-800">{receipt.guardianName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Contact Phone:</span>
                <span className="font-mono text-slate-700">{receipt.guardianPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Billing Period:</span>
                <span className="font-bold text-slate-800">{receipt.month} {receipt.year}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fee Category:</span>
                <span className="font-bold text-indigo-700">{receipt.feeType}</span>
              </div>
            </div>
          </div>

          {/* 4. Line Items Particulars Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-bold text-[10px] uppercase">
                  <th className="py-2.5 px-3 w-10 text-center">SL</th>
                  <th className="py-2.5 px-3">Description / Fee Head</th>
                  <th className="py-2.5 px-3 text-center">Period</th>
                  <th className="py-2.5 px-3 text-right">Gross (BDT)</th>
                  <th className="py-2.5 px-3 text-right">Waiver (BDT)</th>
                  <th className="py-2.5 px-3 text-right">Paid (BDT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-2.5 px-3 text-center font-bold text-slate-500">1</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900">{receipt.feeType}</td>
                  <td className="py-2.5 px-3 text-center text-slate-600">{receipt.month}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">৳{receipt.amount.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-emerald-600">
                    {receipt.waiverAmount ? `-৳${receipt.waiverAmount.toLocaleString()}` : '৳0'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-black text-indigo-800">৳{receipt.paidAmount.toLocaleString()}</td>
                </tr>
                {receipt.breakdown?.lab ? (
                  <tr>
                    <td className="py-2 px-3 text-center text-slate-400">2</td>
                    <td className="py-2 px-3 text-slate-700">Practical Science & Computer Laboratory Charge</td>
                    <td className="py-2 px-3 text-center text-slate-500">{receipt.month}</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-600">৳{receipt.breakdown.lab.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-400">৳0</td>
                    <td className="py-2 px-3 text-right font-mono text-slate-700">Included</td>
                  </tr>
                ) : null}
                <tr className="bg-slate-50/50">
                  <td className="py-2 px-3 text-center text-slate-400">•</td>
                  <td className="py-2 px-3 text-slate-600 italic">Electronic Gateway & Automated Clearance Service</td>
                  <td className="py-2 px-3 text-center text-slate-500">{receipt.month}</td>
                  <td className="py-2 px-3 text-right font-mono text-slate-500">৳0</td>
                  <td className="py-2 px-3 text-right font-mono text-slate-400">৳0</td>
                  <td className="py-2 px-3 text-right font-mono text-emerald-600 font-bold">FREE</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 5. Totals & In-Words Section */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
            {/* In Words & Remarks */}
            <div className="sm:col-span-7 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Amount in Words</span>
                <span className="font-bold text-slate-900 italic">
                  {numberToWordsBDT(receipt.paidAmount)}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed border-t border-slate-200 pt-1.5">
                Note: This is an official computer-generated fee receipt verified by the institutional payment switch. No physical adhesive revenue stamp required.
              </p>
            </div>

            {/* Financial Totals */}
            <div className="sm:col-span-5 bg-indigo-50/60 p-3.5 rounded-xl border border-indigo-200 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Invoiced Amount:</span>
                <span className="font-mono font-bold">৳{receipt.amount.toLocaleString()}</span>
              </div>
              {receipt.waiverAmount ? (
                <div className="flex justify-between text-emerald-700">
                  <span>Waiver / Discount:</span>
                  <span className="font-mono font-bold">-৳{receipt.waiverAmount.toLocaleString()}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-sm font-black text-indigo-950 border-t border-indigo-200 pt-1">
                <span>Total Paid:</span>
                <span className="font-mono text-emerald-700">৳{receipt.paidAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Outstanding Due:</span>
                <span className="font-mono font-bold text-slate-700">
                  {receipt.dueAmount ? `৳${receipt.dueAmount.toLocaleString()}` : '৳0 (Nil)'}
                </span>
              </div>
            </div>
          </div>

          {/* 6. Digital Verification & Signatures */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center pt-3 border-t border-slate-200 text-xs">
            {/* QR Verification Seal */}
            <div className="sm:col-span-6 flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <div className="w-14 h-14 bg-white p-1 rounded-lg border border-slate-200 shrink-0 flex items-center justify-center">
                <QrCode size={44} className="text-indigo-800" />
              </div>
              <div className="text-[10px] leading-tight text-slate-500">
                <strong className="text-slate-800 block text-xs">Digital Verification</strong>
                <span>Scan QR code to verify validity on the institutional portal.</span>
                <span className="font-mono text-[9px] block text-indigo-600 mt-0.5">UID: {receipt.trxId || receipt.receiptNo}</span>
              </div>
            </div>

            {/* Signatures */}
            <div className="sm:col-span-6 grid grid-cols-2 text-center text-[10px] font-bold text-slate-500 pt-4">
              <div>
                <div className="w-24 border-t border-slate-400 mx-auto pt-1 font-bold text-slate-700">
                  Accounts Officer
                </div>
                <span className="text-[9px] text-slate-400">Cashier Stamp</span>
              </div>
              <div>
                <div className="w-24 border-t border-slate-400 mx-auto pt-1 font-bold text-slate-700">
                  Principal / Head
                </div>
                <span className="text-[9px] text-slate-400">Official Seal</span>
              </div>
            </div>
          </div>

        </div>

        {/* EMAIL DISPATCH PANEL */}
        {showEmailBox && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs space-y-2 animate-in fade-in-50">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-900 flex items-center gap-1.5 text-xs">
                <Mail size={14} className="text-emerald-600" />
                Email School-Branded PDF Fee Receipt Directly to Parent
              </span>
              <button 
                type="button" 
                onClick={() => setShowEmailBox(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="email"
                value={customParentEmail || invoice.parentEmail || getRegisteredParentEmail(receipt.studentId, receipt.studentName)}
                onChange={(e) => setCustomParentEmail(e.target.value)}
                placeholder="parent.email@gmail.com"
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-emerald-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              />
              <Button
                size="sm"
                icon={isSendingEmail ? Loader2 : Send}
                disabled={isSendingEmail}
                onClick={handleSendEmail}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
              >
                {isSendingEmail ? 'Sending...' : 'Send Email'}
              </Button>
            </div>
            <p className="text-[10px] text-emerald-700 flex items-center gap-1">
              <CheckCircle2 size={11} className="text-emerald-600" />
              Includes official verified receipt PDF ({receipt.receiptNo}) with digital QR seal as attachment.
            </p>
          </div>
        )}

        {lastEmailSent && !showEmailBox && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-xs text-emerald-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-600" />
              Fee receipt PDF sent to <strong>{lastEmailSent.recipientEmail}</strong> at {lastEmailSent.sentAt}
            </span>
            <button
              type="button"
              onClick={() => setShowEmailBox(true)}
              className="text-indigo-600 hover:underline font-bold text-[10px]"
            >
              Resend
            </button>
          </div>
        )}

        {/* BOTTOM ACTION BUTTONS */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Official digital archive document with QR verification</span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose} className="text-xs">
              Close
            </Button>
            <Button
              variant="outline"
              icon={Mail}
              onClick={() => setShowEmailBox(!showEmailBox)}
              className="text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-bold"
            >
              Email PDF
            </Button>
            <Button
              icon={isExporting ? Loader2 : Download}
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="text-xs bg-indigo-700 hover:bg-indigo-800 text-white font-bold shadow-sm"
            >
              {isExporting ? 'Generating PDF...' : 'Download Official PDF'}
            </Button>
          </div>
        </div>

      </div>
    </Modal>
  );
};
