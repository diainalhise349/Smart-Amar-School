import React, { useState, useMemo, useEffect } from 'react';
import { 
  CreditCard, Smartphone, ShieldCheck, DollarSign, Receipt, 
  Search, Filter, Plus, Printer, Download, CheckCircle2, 
  Clock, AlertCircle, RefreshCw, Send, Users, ArrowUpRight, 
  Calendar, Layers, CheckSquare, Sparkles, Building2, Eye,
  SlidersHorizontal, ChevronRight, Hash, Phone, FileText, ArrowRight,
  TrendingUp, Wallet, Check, Copy, X, ArrowDownRight, Award, Loader2,
  Mail, ExternalLink, Inbox
} from 'lucide-react';
import { DashboardLayout } from '../components/Layout';
import { Card, Button, Badge, Modal, Input, SmartDataTable, useToast } from '../components/UIComponents';
import { UserRole } from '../types';
import { MOCK_STUDENTS, MOCK_CLASSES } from '../constants';
import { MockPaymentGateway, PaymentTransaction, PaymentInvoiceInfo } from '../components/MockPaymentGateway';
import { exportFeeRegisterToPDF, exportTableToPDF } from '../utils/pdfExport';
import { PDFExportModal } from '../components/PDFExportModal';
import { useAuth } from '../context/AuthContext';
import { downloadFeeReceiptPDF } from '../utils/feeReceiptResolver';
import { 
  sendFeeReceiptEmail, 
  getSentFeeReceiptEmails, 
  getRegisteredParentEmail, 
  FeeReceiptEmailLog, 
  clearSentFeeReceiptEmails 
} from '../utils/feeEmailService';

// Extended Fee Invoice item
export interface DetailedFeeInvoice {
  id: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  studentSection: string;
  studentRoll: string;
  guardianPhone: string;
  parentEmail?: string;
  amount: number;
  paidAmount: number;
  dueAmount: number;
  feeType: string;
  month: string;
  year: string;
  dueDate: string;
  status: 'Paid' | 'Unpaid' | 'Overdue' | 'Partial' | 'Processing';
  paymentMethod?: 'bKash' | 'Nagad' | 'Rocket' | 'Card' | 'Bank' | 'Cash';
  paidDate?: string;
  trxId?: string;
}

const INITIAL_INVOICES: DetailedFeeInvoice[] = [
  {
    id: 'INV-2024-001',
    studentId: 'ST-2024-001',
    studentName: 'Rahim Ahmed',
    studentClass: 'Class 10',
    studentSection: 'A',
    studentRoll: '01',
    guardianPhone: '01712345678',
    parentEmail: 'rahim.parent@gmail.com',
    amount: 2500,
    paidAmount: 2500,
    dueAmount: 0,
    feeType: 'Tuition Fee',
    month: 'May',
    year: '2024',
    dueDate: '2024-05-15',
    status: 'Paid',
    paymentMethod: 'bKash',
    paidDate: '2024-05-10 11:24 AM',
    trxId: 'TRX-BK982314'
  },
  {
    id: 'INV-2024-002',
    studentId: 'ST-2024-002',
    studentName: 'Fatima Begum',
    studentClass: 'Class 9',
    studentSection: 'A',
    studentRoll: '02',
    guardianPhone: '01819876543',
    parentEmail: 'fatima.parent@gmail.com',
    amount: 2200,
    paidAmount: 0,
    dueAmount: 2200,
    feeType: 'Tuition Fee',
    month: 'May',
    year: '2024',
    dueDate: '2024-05-25',
    status: 'Unpaid'
  },
  {
    id: 'INV-2024-003',
    studentId: 'ST-2024-003',
    studentName: 'Sujon Khan',
    studentClass: 'Class 8',
    studentSection: 'B',
    studentRoll: '05',
    guardianPhone: '01912445566',
    parentEmail: 'sujon.parent@gmail.com',
    amount: 1500,
    paidAmount: 0,
    dueAmount: 1500,
    feeType: 'First Term Examination Fee',
    month: 'April',
    year: '2024',
    dueDate: '2024-05-01',
    status: 'Overdue'
  },
  {
    id: 'INV-2024-004',
    studentId: 'ST-2024-004',
    studentName: 'Abir Hasan',
    studentClass: 'Class 10',
    studentSection: 'A',
    studentRoll: '03',
    guardianPhone: '01755667788',
    parentEmail: 'abir.parent@gmail.com',
    amount: 3000,
    paidAmount: 1500,
    dueAmount: 1500,
    feeType: 'Tuition & Science Lab Fee',
    month: 'May',
    year: '2024',
    dueDate: '2024-05-28',
    status: 'Partial',
    paymentMethod: 'Cash',
    paidDate: '2024-05-05 09:40 AM',
    trxId: 'CASH-REC-1092'
  },
  {
    id: 'INV-2024-005',
    studentId: 'ST-2024-005',
    studentName: 'Nusrat Jahan',
    studentClass: 'Class 7',
    studentSection: 'A',
    studentRoll: '08',
    guardianPhone: '01688990011',
    parentEmail: 'nusrat.parent@gmail.com',
    amount: 1800,
    paidAmount: 1800,
    dueAmount: 0,
    feeType: 'Tuition Fee',
    month: 'May',
    year: '2024',
    dueDate: '2024-05-20',
    status: 'Paid',
    paymentMethod: 'Nagad',
    paidDate: '2024-05-18 04:15 PM',
    trxId: 'TRX-NG772109'
  },
  {
    id: 'INV-2024-006',
    studentId: 'ST-2024-001',
    studentName: 'Rahim Ahmed',
    studentClass: 'Class 10',
    studentSection: 'A',
    studentRoll: '01',
    guardianPhone: '01712345678',
    parentEmail: 'rahim.parent@gmail.com',
    amount: 1200,
    paidAmount: 0,
    dueAmount: 1200,
    feeType: 'Annual Sports & Cultural Fee',
    month: 'June',
    year: '2024',
    dueDate: '2024-06-15',
    status: 'Unpaid'
  },
  {
    id: 'INV-2024-007',
    studentId: 'ST-2024-002',
    studentName: 'Fatima Begum',
    studentClass: 'Class 9',
    studentSection: 'A',
    studentRoll: '02',
    guardianPhone: '01819876543',
    parentEmail: 'fatima.parent@gmail.com',
    amount: 800,
    paidAmount: 800,
    dueAmount: 0,
    feeType: 'Quarterly Library & ICT Fee',
    month: 'April',
    year: '2024',
    dueDate: '2024-04-30',
    status: 'Paid',
    paymentMethod: 'Card',
    paidDate: '2024-04-28 02:20 PM',
    trxId: 'TRX-CC652190'
  }
];

const INITIAL_TRANSACTIONS: PaymentTransaction[] = [
  {
    id: 'PAY-892101',
    trxId: 'TRX-BK982314',
    invoiceId: 'INV-2024-001',
    studentId: 'ST-2024-001',
    studentName: 'Rahim Ahmed',
    studentClass: 'Class 10',
    studentRoll: '01',
    guardianPhone: '01712345678',
    amount: 2525,
    feeType: 'Tuition Fee',
    channel: 'bkash',
    channelName: 'bKash Mobile Banking',
    accountNumber: '01712345678',
    bankRef: 'BNK-REF-99214012',
    status: 'Completed',
    timestamp: '2024-05-10T11:24:00Z',
    paidAt: 'May 10, 2024 11:24 AM',
    gatewayFee: 25,
    remarks: 'Fee settlement for Tuition Fee (INV-2024-001)'
  },
  {
    id: 'PAY-892102',
    trxId: 'TRX-NG772109',
    invoiceId: 'INV-2024-005',
    studentId: 'ST-2024-005',
    studentName: 'Nusrat Jahan',
    studentClass: 'Class 7',
    studentRoll: '08',
    guardianPhone: '01688990011',
    amount: 1818,
    feeType: 'Tuition Fee',
    channel: 'nagad',
    channelName: 'Nagad Digital Payment',
    accountNumber: '01688990011',
    bankRef: 'BNK-REF-44210982',
    status: 'Completed',
    timestamp: '2024-05-18T16:15:00Z',
    paidAt: 'May 18, 2024 04:15 PM',
    gatewayFee: 18,
    remarks: 'Fee settlement for Tuition Fee (INV-2024-005)'
  },
  {
    id: 'PAY-892103',
    trxId: 'TRX-CC652190',
    invoiceId: 'INV-2024-007',
    studentId: 'ST-2024-002',
    studentName: 'Fatima Begum',
    studentClass: 'Class 9',
    studentRoll: '02',
    guardianPhone: '01819876543',
    amount: 812,
    feeType: 'Quarterly Library & ICT Fee',
    channel: 'card',
    channelName: 'Visa / MasterCard Debit/Credit',
    cardLast4: '4589',
    bankRef: 'BNK-REF-77123901',
    status: 'Completed',
    timestamp: '2024-04-28T14:20:00Z',
    paidAt: 'April 28, 2024 02:20 PM',
    gatewayFee: 12,
    remarks: 'Fee settlement for Library & ICT (INV-2024-007)'
  }
];

export const FeesManagement: React.FC = () => {
  const { activeTenant } = useAuth();
  const { addToast } = useToast();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'invoices' | 'online_pay' | 'tracker' | 'transactions' | 'fee_heads' | 'email_logs'>('invoices');

  // Invoices & Transactions State
  const [invoices, setInvoices] = useState<DetailedFeeInvoice[]>(INITIAL_INVOICES);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(INITIAL_TRANSACTIONS);

  // Filters for Invoices
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [feeTypeFilter, setFeeTypeFilter] = useState('ALL');

  // Payment Gateway Modal State
  const [isGatewayOpen, setIsGatewayOpen] = useState(false);
  const [selectedPayInvoice, setSelectedPayInvoice] = useState<PaymentInvoiceInfo | null>(null);

  // Cash Counter Collection Modal State
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [cashInvoice, setCashInvoice] = useState<DetailedFeeInvoice | null>(null);
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [cashCollector, setCashCollector] = useState('Accountant - Md. Masud');
  const [cashReceiptNo, setCashReceiptNo] = useState(`RCP-${Math.floor(10000 + Math.random() * 90000)}`);
  const [autoEmailParentCash, setAutoEmailParentCash] = useState(true);
  const [cashParentEmail, setCashParentEmail] = useState('');

  // Automated Email Logs & Dispatch Modal State
  const [emailLogs, setEmailLogs] = useState<FeeReceiptEmailLog[]>(() => getSentFeeReceiptEmails(activeTenant?.id));
  const [emailLogSearch, setEmailLogSearch] = useState('');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailTargetInvoice, setEmailTargetInvoice] = useState<DetailedFeeInvoice | null>(null);
  const [emailRecipientInput, setEmailRecipientInput] = useState('');
  const [emailCustomSubject, setEmailCustomSubject] = useState('');
  const [isSendingFeeEmail, setIsSendingFeeEmail] = useState(false);

  // Reactive listener for fee receipt email logs
  useEffect(() => {
    const handleEmailEvent = () => {
      setEmailLogs(getSentFeeReceiptEmails(activeTenant?.id));
    };
    window.addEventListener('fee_receipt_email_sent', handleEmailEvent);
    return () => window.removeEventListener('fee_receipt_email_sent', handleEmailEvent);
  }, [activeTenant?.id]);

  // Create Invoice Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newInvoiceData, setNewInvoiceData] = useState({
    studentId: 'ST-2024-001',
    feeType: 'Tuition Fee',
    amount: 2500,
    month: 'June',
    year: '2024',
    dueDate: '2024-06-25'
  });

  // Receipt Inspection Modal State
  const [inspectedInvoice, setInspectedInvoice] = useState<DetailedFeeInvoice | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isDownloadingReceipt, setIsDownloadingReceipt] = useState(false);

  const handleDownloadInspectedPDF = async () => {
    if (!inspectedInvoice) return;
    try {
      setIsDownloadingReceipt(true);
      await downloadFeeReceiptPDF(inspectedInvoice, activeTenant);
      addToast(`Official PDF receipt for ${inspectedInvoice.studentName} generated & downloaded!`, 'success');
    } catch (err) {
      addToast('Failed to generate PDF receipt', 'error');
    } finally {
      setIsDownloadingReceipt(false);
    }
  };

  const handleQuickDownloadPDF = async (inv: DetailedFeeInvoice) => {
    try {
      await downloadFeeReceiptPDF(inv, activeTenant);
      addToast(`Official PDF receipt for ${inv.studentName} downloaded!`, 'success');
    } catch (err) {
      addToast('Failed to generate PDF receipt', 'error');
    }
  };

  // Tracker State
  const [trackerSearchInput, setTrackerSearchInput] = useState('');
  const [trackedResult, setTrackedResult] = useState<{
    invoice?: DetailedFeeInvoice;
    transaction?: PaymentTransaction;
  } | null>({
    invoice: INITIAL_INVOICES[0],
    transaction: INITIAL_TRANSACTIONS[0]
  });

  // Parent / Student Self-Service Selection
  const [selectedStudentForPay, setSelectedStudentForPay] = useState<string>('ST-2024-002');
  const [selectedInvoicesForBulkPay, setSelectedInvoicesForBulkPay] = useState<string[]>(['INV-2024-002']);

  // Calculated Metrics
  const metrics = useMemo(() => {
    const totalBilled = invoices.reduce((acc, inv) => acc + inv.amount, 0);
    const totalCollected = invoices.reduce((acc, inv) => acc + inv.paidAmount, 0);
    const totalOutstanding = invoices.reduce((acc, inv) => acc + inv.dueAmount, 0);
    const onlineCollected = transactions.filter(t => t.status === 'Completed').reduce((acc, t) => acc + t.amount, 0);
    const cashCollected = totalCollected - invoices.filter(i => i.paymentMethod !== 'Cash' && i.paidAmount > 0).reduce((acc, i) => acc + i.paidAmount, 0);
    const rate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;
    return { totalBilled, totalCollected, totalOutstanding, onlineCollected, cashCollected, rate };
  }, [invoices, transactions]);

  // Filtered Invoices List
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchSearch = 
        inv.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.feeType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inv.trxId && inv.trxId.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchClass = classFilter === 'ALL' || inv.studentClass === classFilter;
      const matchStatus = statusFilter === 'ALL' || inv.status === statusFilter;
      const matchType = feeTypeFilter === 'ALL' || inv.feeType.includes(feeTypeFilter);

      return matchSearch && matchClass && matchStatus && matchType;
    });
  }, [invoices, searchQuery, classFilter, statusFilter, feeTypeFilter]);

  // Handle Launching Payment Gateway
  const handleInitiateOnlinePayment = (inv: DetailedFeeInvoice) => {
    setSelectedPayInvoice({
      id: inv.id,
      studentId: inv.studentId,
      studentName: inv.studentName,
      studentClass: inv.studentClass,
      studentRoll: inv.studentRoll,
      guardianPhone: inv.guardianPhone,
      amount: inv.dueAmount > 0 ? inv.dueAmount : inv.amount,
      feeType: inv.feeType,
      dueDate: inv.dueDate,
      month: inv.month
    });
    setIsGatewayOpen(true);
  };

  // Callback on Payment Gateway Success
  const handleGatewaySuccess = (newTxn: PaymentTransaction) => {
    // 1. Add transaction to ledger
    setTransactions(prev => [newTxn, ...prev]);

    // 2. Update invoice status
    setInvoices(prev => prev.map(inv => {
      if (inv.id === newTxn.invoiceId) {
        return {
          ...inv,
          paidAmount: inv.amount,
          dueAmount: 0,
          status: 'Paid',
          paymentMethod: (newTxn.channel === 'bkash' ? 'bKash' :
                          newTxn.channel === 'nagad' ? 'Nagad' :
                          newTxn.channel === 'rocket' ? 'Rocket' :
                          newTxn.channel === 'card' ? 'Card' : 'Bank') as any,
          paidDate: newTxn.paidAt,
          trxId: newTxn.trxId
        };
      }
      return inv;
    }));

    // 3. Set tracked result so user can instantly see tracker update
    const updatedInv = invoices.find(i => i.id === newTxn.invoiceId);
    if (updatedInv) {
      setTrackedResult({
        invoice: {
          ...updatedInv,
          paidAmount: updatedInv.amount,
          dueAmount: 0,
          status: 'Paid',
          paidDate: newTxn.paidAt,
          trxId: newTxn.trxId
        },
        transaction: newTxn
      });
    }
  };

  // Handle Cash Counter Collection Submission
  const handleCashCollectionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cashInvoice) return;

    if (cashAmount <= 0 || cashAmount > cashInvoice.dueAmount) {
      addToast(`Amount must be between ৳1 and ৳${cashInvoice.dueAmount}`, 'error');
      return;
    }

    const newPaidAmount = cashInvoice.paidAmount + cashAmount;
    const newDueAmount = cashInvoice.amount - newPaidAmount;
    const newStatus: 'Paid' | 'Partial' = newDueAmount === 0 ? 'Paid' : 'Partial';

    const updatedCashInvoice = {
      ...cashInvoice,
      paidAmount: newPaidAmount,
      dueAmount: newDueAmount,
      status: newStatus,
      paymentMethod: 'Cash' as const,
      paidDate: new Date().toLocaleString(),
      trxId: cashReceiptNo
    };

    setInvoices(prev => prev.map(inv => {
      if (inv.id === cashInvoice.id) {
        return updatedCashInvoice;
      }
      return inv;
    }));

    // Auto-dispatch official PDF receipt to parent email
    if (autoEmailParentCash) {
      const parentTarget = cashParentEmail.trim() || cashInvoice.parentEmail || getRegisteredParentEmail(cashInvoice.studentId, cashInvoice.studentName);
      sendFeeReceiptEmail({
        invoice: updatedCashInvoice,
        activeTenant,
        recipientEmail: parentTarget,
        deliveryChannel: 'Counter Cash Collection'
      }).then((log) => {
        addToast(`Official PDF receipt automatically emailed to parent (${log.recipientEmail})`, 'info');
      }).catch((err) => {
        console.error('Failed to auto-email cash fee receipt:', err);
      });
    }

    addToast(`Cash fee collection of ৳${cashAmount.toLocaleString()} recorded!`, 'success');
    setIsCashModalOpen(false);
    setCashInvoice(null);
    setCashParentEmail('');
  };

  // Open manual fee receipt email dialog
  const handleOpenEmailModal = (inv: DetailedFeeInvoice) => {
    setEmailTargetInvoice(inv);
    const targetEmail = inv.parentEmail || getRegisteredParentEmail(inv.studentId, inv.studentName, inv.guardianPhone);
    setEmailRecipientInput(targetEmail);
    setEmailCustomSubject(`Official Fee Payment Receipt [${inv.trxId || inv.id}] - ${inv.studentName} (${inv.feeType})`);
    setIsEmailModalOpen(true);
  };

  // Dispatch fee receipt email with PDF attachment
  const handleSendManualEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailTargetInvoice) return;
    if (!emailRecipientInput || !emailRecipientInput.includes('@')) {
      addToast('Please enter a valid recipient email address', 'error');
      return;
    }

    try {
      setIsSendingFeeEmail(true);
      const res = await sendFeeReceiptEmail({
        invoice: emailTargetInvoice,
        activeTenant,
        recipientEmail: emailRecipientInput.trim(),
        customSubject: emailCustomSubject.trim() || undefined,
        deliveryChannel: 'Manual Resend'
      });
      addToast(`Official PDF receipt successfully dispatched to ${res.recipientEmail}!`, 'success');
      setIsEmailModalOpen(false);
      setEmailTargetInvoice(null);
    } catch (err) {
      console.error('Error dispatching fee email:', err);
      addToast('Failed to dispatch fee receipt email', 'error');
    } finally {
      setIsSendingFeeEmail(false);
    }
  };

  // Handle Creating New Invoice
  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const student = MOCK_STUDENTS.find(s => s.id === newInvoiceData.studentId) || MOCK_STUDENTS[0];
    
    const newInv: DetailedFeeInvoice = {
      id: `INV-2024-${Math.floor(100 + Math.random() * 900)}`,
      studentId: student.id,
      studentName: student.name,
      studentClass: student.class,
      studentSection: student.section,
      studentRoll: student.rollNo,
      guardianPhone: student.phone || '01700000000',
      amount: Number(newInvoiceData.amount),
      paidAmount: 0,
      dueAmount: Number(newInvoiceData.amount),
      feeType: newInvoiceData.feeType,
      month: newInvoiceData.month,
      year: newInvoiceData.year,
      dueDate: newInvoiceData.dueDate,
      status: 'Unpaid'
    };

    setInvoices(prev => [newInv, ...prev]);
    addToast(`New fee bill generated for ${student.name}`, 'success');
    setIsCreateModalOpen(false);
  };

  // Handle Live Tracking Search
  const handleTrackSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = trackerSearchInput.trim();
    if (!query) {
      addToast('Please enter a Transaction ID, Invoice ID, or Student ID', 'warning');
      return;
    }

    const foundTxn = transactions.find(t => 
      t.trxId.toLowerCase() === query.toLowerCase() ||
      t.invoiceId.toLowerCase() === query.toLowerCase() ||
      t.id.toLowerCase() === query.toLowerCase() ||
      t.studentId.toLowerCase() === query.toLowerCase()
    );

    const foundInv = invoices.find(i => 
      i.id.toLowerCase() === query.toLowerCase() ||
      (i.trxId && i.trxId.toLowerCase() === query.toLowerCase()) ||
      i.studentId.toLowerCase() === query.toLowerCase()
    );

    if (foundInv || foundTxn) {
      setTrackedResult({
        invoice: foundInv,
        transaction: foundTxn
      });
      addToast('Transaction records loaded', 'success');
    } else {
      addToast('No transaction or invoice found matching your query', 'error');
    }
  };

  return (
    <DashboardLayout role={UserRole.SCHOOL_ADMIN}>
      <div className="space-y-6">
        {/* Top Header & Quick Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">
                Fees & Accounts Management
              </h2>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-emerald-300">
                Mock Gateway Enabled
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Manage student fee billing, collect payments via mock gateway (bKash/Nagad/Cards), and track online transaction settlements in real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={Printer}
              onClick={() => setIsExportModalOpen(true)}
              className="border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100 font-bold"
            >
              Print / Export Register
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={Search}
              onClick={() => setActiveTab('tracker')}
              className="border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              Track Status
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Smartphone}
              onClick={() => setActiveTab('online_pay')}
              className="bg-pink-600 hover:bg-pink-700 text-white shadow-md shadow-pink-100"
            >
              Parent Online Pay Portal
            </Button>
            <Button
              size="sm"
              icon={Plus}
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100"
            >
              New Fee Invoice
            </Button>
          </div>
        </div>

        {/* Financial KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Revenue */}
          <Card className="p-4 border-none shadow-sm bg-white hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Billed</span>
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <Receipt size={18} />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <h3 className="text-2xl font-black text-slate-900">৳{metrics.totalBilled.toLocaleString()}</h3>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
              <Hash size={12} /> {invoices.length} Total Invoices Generated
            </p>
          </Card>

          {/* Total Collected */}
          <Card className="p-4 border-none shadow-sm bg-white hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Collected</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <h3 className="text-2xl font-black text-emerald-600">৳{metrics.totalCollected.toLocaleString()}</h3>
              <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                {metrics.rate}%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">
              Collection efficiency rate
            </p>
          </Card>

          {/* Outstanding Dues */}
          <Card className="p-4 border-none shadow-sm bg-white hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Outstanding Dues</span>
              <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                <Clock size={18} />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <h3 className="text-2xl font-black text-rose-600">৳{metrics.totalOutstanding.toLocaleString()}</h3>
            </div>
            <p className="text-[11px] text-rose-500 mt-1 font-bold">
              {invoices.filter(i => i.status === 'Unpaid' || i.status === 'Overdue').length} pending bills
            </p>
          </Card>

          {/* Online Gateway Settlements */}
          <Card className="p-4 border-none shadow-sm bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-indigo-300 uppercase tracking-wider">Online Gateway Settlement</span>
              <div className="p-2 rounded-xl bg-white/10 text-emerald-400">
                <Smartphone size={18} />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <h3 className="text-2xl font-black text-white">৳{metrics.onlineCollected.toLocaleString()}</h3>
            </div>
            <p className="text-[11px] text-indigo-200 mt-1 font-medium flex items-center gap-1">
              <ShieldCheck size={12} className="text-emerald-400" />
              {transactions.filter(t => t.status === 'Completed').length} digital transactions processed
            </p>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'invoices'
                ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Receipt size={16} /> Fee Invoices & Dues ({filteredInvoices.length})
          </button>

          <button
            onClick={() => setActiveTab('online_pay')}
            className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'online_pay'
                ? 'border-pink-600 text-pink-600 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Smartphone size={16} /> Parent / Student Pay Online
          </button>

          <button
            onClick={() => setActiveTab('tracker')}
            className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'tracker'
                ? 'border-emerald-600 text-emerald-600 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Search size={16} /> Live Transaction Status Tracker
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'transactions'
                ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <CreditCard size={16} /> Gateway Logs ({transactions.length})
          </button>

          <button
            onClick={() => setActiveTab('fee_heads')}
            className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'fee_heads'
                ? 'border-indigo-600 text-indigo-600 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <SlidersHorizontal size={16} /> Fee Structure & Heads
          </button>

          <button
            onClick={() => setActiveTab('email_logs')}
            className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'email_logs'
                ? 'border-emerald-600 text-emerald-600 bg-white rounded-t-lg font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Mail size={16} className="text-emerald-600" /> Automated Email Logs ({emailLogs.length})
          </button>
        </div>

        {/* TAB 1: INVOICES & DUES LIST */}
        {activeTab === 'invoices' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <Card className="p-4 border-none shadow-sm bg-white">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search student, ID, invoice #..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 ring-indigo-500"
                  />
                </div>

                {/* Class Filter */}
                <div>
                  <select
                    value={classFilter}
                    onChange={(e) => setClassFilter(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:ring-2 ring-indigo-500"
                  >
                    <option value="ALL">All Classes</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 8">Class 8</option>
                    <option value="Class 7">Class 7</option>
                    <option value="Class 6">Class 6</option>
                    <option value="Class 5">Class 5</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:ring-2 ring-indigo-500"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Partial">Partial</option>
                  </select>
                </div>

                {/* Fee Type Filter */}
                <div>
                  <select
                    value={feeTypeFilter}
                    onChange={(e) => setFeeTypeFilter(e.target.value)}
                    className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:ring-2 ring-indigo-500"
                  >
                    <option value="ALL">All Fee Types</option>
                    <option value="Tuition">Tuition Fee</option>
                    <option value="Exam">Exam Fee</option>
                    <option value="Sports">Sports / Cultural</option>
                    <option value="Library">Library / ICT</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Invoices Table */}
            <Card className="p-0 border-none shadow-xl overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3.5 font-black uppercase text-slate-500 tracking-wider">Invoice ID</th>
                      <th className="px-4 py-3.5 font-black uppercase text-slate-500 tracking-wider">Student Name & ID</th>
                      <th className="px-4 py-3.5 font-black uppercase text-slate-500 tracking-wider">Class & Roll</th>
                      <th className="px-4 py-3.5 font-black uppercase text-slate-500 tracking-wider">Fee Head</th>
                      <th className="px-4 py-3.5 font-black uppercase text-slate-500 tracking-wider text-right">Payable</th>
                      <th className="px-4 py-3.5 font-black uppercase text-slate-500 tracking-wider text-right">Paid / Due</th>
                      <th className="px-4 py-3.5 font-black uppercase text-slate-500 tracking-wider text-center">Status</th>
                      <th className="px-4 py-3.5 font-black uppercase text-slate-500 tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-indigo-50/40 transition-colors">
                        <td className="px-4 py-3.5 font-mono font-bold text-indigo-600">
                          {inv.id}
                          {inv.trxId && (
                            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                              TRX: {inv.trxId}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-900 uppercase">{inv.studentName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">ID: {inv.studentId} • Mob: {inv.guardianPhone}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-bold text-slate-700">{inv.studentClass} ({inv.studentSection})</span>
                          <div className="text-[10px] text-slate-400">Roll: {inv.studentRoll}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-800">{inv.feeType}</div>
                          <div className="text-[10px] text-slate-400">{inv.month} {inv.year} • Due: {inv.dueDate}</div>
                        </td>
                        <td className="px-4 py-3.5 text-right font-black text-slate-900">
                          ৳{inv.amount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="font-bold text-emerald-600">৳{inv.paidAmount.toLocaleString()}</div>
                          {inv.dueAmount > 0 && (
                            <div className="text-[10px] font-bold text-rose-500">Due: ৳{inv.dueAmount.toLocaleString()}</div>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <Badge 
                            color={
                              inv.status === 'Paid' ? 'green' : 
                              inv.status === 'Overdue' ? 'red' : 
                              inv.status === 'Partial' ? 'yellow' : 'blue'
                            }
                          >
                            {inv.status}
                          </Badge>
                          {inv.paymentMethod && (
                            <div className="text-[9px] font-bold text-slate-400 mt-0.5">
                              via {inv.paymentMethod}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {inv.status !== 'Paid' ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleInitiateOnlinePayment(inv)}
                                  className="px-2.5 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-black text-[11px] uppercase tracking-wider flex items-center gap-1 shadow-xs transition-all hover:scale-105"
                                  title="Pay online via bKash, Nagad, or Card"
                                >
                                  <Smartphone size={13} /> Pay Online
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setCashInvoice(inv);
                                    setCashAmount(inv.dueAmount);
                                    setIsCashModalOpen(true);
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1 transition-colors"
                                  title="Collect cash at counter"
                                >
                                  <DollarSign size={13} /> Cash
                                </button>
                              </>
                            ) : (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => setInspectedInvoice(inv)}
                                  className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-indigo-700 font-bold text-[11px] flex items-center gap-1 transition-colors"
                                  title="View & Print Official e-Receipt"
                                >
                                  <Receipt size={13} /> Receipt
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleQuickDownloadPDF(inv)}
                                  className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] transition-colors"
                                  title="Download School-Branded Fee Receipt PDF"
                                >
                                  <Download size={13} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEmailModal(inv)}
                                  className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] transition-colors"
                                  title="Email Official Fee Receipt PDF to Parent"
                                >
                                  <Mail size={13} />
                                </button>
                              </div>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                setTrackerSearchInput(inv.trxId || inv.id);
                                setTrackedResult({ invoice: inv, transaction: transactions.find(t => t.invoiceId === inv.id) });
                                setActiveTab('tracker');
                              }}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100"
                              title="Track in Live Status Portal"
                            >
                              <Search size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 2: PARENT / STUDENT ONLINE SELF-PAY PORTAL */}
        {activeTab === 'online_pay' && (
          <div className="space-y-6">
            <Card className="p-6 border-none shadow-xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
              <div className="max-w-3xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-emerald-400 text-xs font-bold">
                  <ShieldCheck size={14} /> Official Instant Fee Payment Portal
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight">
                  Amar Smart School Online Tuition & Exam Fee Settlement
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Parents and students can select their profile, inspect pending monthly dues or semester exam fees, and initiate secure real-time digital payments with instant SMS confirmation and downloadable money receipts.
                </p>

                {/* Student Selector */}
                <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <label className="text-xs font-bold text-slate-300">Select Student Account:</label>
                  <select
                    value={selectedStudentForPay}
                    onChange={(e) => setSelectedStudentForPay(e.target.value)}
                    className="bg-white/10 border border-white/20 text-white rounded-xl px-4 py-2 text-xs font-bold outline-none focus:ring-2 ring-indigo-400"
                  >
                    {MOCK_STUDENTS.map(st => (
                      <option key={st.id} value={st.id} className="text-slate-900">
                        {st.name} ({st.id} • {st.class})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </Card>

            {/* Selected Student Invoices */}
            {(() => {
              const currentStudent = MOCK_STUDENTS.find(s => s.id === selectedStudentForPay) || MOCK_STUDENTS[0];
              const studentInvoices = invoices.filter(i => i.studentId === currentStudent.id);
              const pendingStudentInvoices = studentInvoices.filter(i => i.status !== 'Paid');
              const totalPendingAmount = pendingStudentInvoices.reduce((acc, i) => acc + i.dueAmount, 0);

              return (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left 2 Cols: Invoices List */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide">
                        Fee Invoices for {currentStudent.name}
                      </h4>
                      <span className="text-xs font-bold text-slate-500">
                        Roll: {currentStudent.rollNo} • Class: {currentStudent.class}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {studentInvoices.map((inv) => (
                        <div
                          key={inv.id}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            inv.status === 'Paid' 
                              ? 'bg-slate-50 border-slate-200' 
                              : 'bg-white border-indigo-200 hover:border-indigo-400 shadow-sm'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div className={`p-3 rounded-xl ${
                                inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-pink-100 text-pink-700'
                              }`}>
                                <Receipt size={20} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-black text-xs text-indigo-700">{inv.id}</span>
                                  <Badge color={inv.status === 'Paid' ? 'green' : inv.status === 'Overdue' ? 'red' : 'yellow'}>
                                    {inv.status}
                                  </Badge>
                                </div>
                                <h5 className="font-bold text-sm text-slate-900 mt-0.5">{inv.feeType}</h5>
                                <p className="text-xs text-slate-500">
                                  Month: {inv.month} {inv.year} • Due Date: {inv.dueDate}
                                </p>
                              </div>
                            </div>

                            <div className="text-right flex sm:flex-col items-center sm:items-end justify-between gap-2">
                              <div>
                                <div className="text-xs text-slate-400 font-bold uppercase">Amount</div>
                                <div className="text-base font-black text-slate-900">৳{inv.amount.toLocaleString()}</div>
                              </div>

                              {inv.status !== 'Paid' ? (
                                <Button
                                  size="sm"
                                  className="bg-pink-600 hover:bg-pink-700 text-white font-black text-xs uppercase tracking-wider shadow-md"
                                  icon={Smartphone}
                                  onClick={() => handleInitiateOnlinePayment(inv)}
                                >
                                  Pay ৳{inv.dueAmount.toLocaleString()}
                                </Button>
                              ) : (
                                <button
                                  onClick={() => setInspectedInvoice(inv)}
                                  className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
                                >
                                  <CheckCircle2 size={13} /> View Receipt
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {studentInvoices.length === 0 && (
                        <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
                          No invoices recorded for this student.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right 1 Col: Quick Pay Terminal Card */}
                  <div className="space-y-4">
                    <Card className="p-6 border-none shadow-xl bg-white sticky top-20">
                      <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                        <div className="p-2 rounded-lg bg-pink-100 text-pink-600">
                          <Wallet size={20} />
                        </div>
                        <div>
                          <h4 className="font-black text-sm uppercase text-slate-800">Quick Online Pay</h4>
                          <p className="text-[10px] text-slate-400">Supported by SSL Gateway</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Student Name:</span>
                          <span className="font-bold text-slate-800 uppercase">{currentStudent.name}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Student ID:</span>
                          <span className="font-mono font-bold text-slate-800">{currentStudent.id}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Pending Invoices:</span>
                          <span className="font-bold text-rose-600">{pendingStudentInvoices.length} Bills</span>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                          <span className="text-xs font-black text-slate-700 uppercase">Total Dues:</span>
                          <span className="text-2xl font-black text-rose-600">৳{totalPendingAmount.toLocaleString()}</span>
                        </div>

                        {pendingStudentInvoices.length > 0 ? (
                          <Button
                            className="w-full h-12 bg-pink-600 hover:bg-pink-700 text-white font-black uppercase tracking-wider text-xs shadow-lg shadow-pink-100 mt-2"
                            icon={Smartphone}
                            onClick={() => handleInitiateOnlinePayment(pendingStudentInvoices[0])}
                          >
                            Pay Dues Online Now
                          </Button>
                        ) : (
                          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold text-center border border-emerald-200">
                            🎉 All fees are fully paid! No dues outstanding.
                          </div>
                        )}

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-4 text-[10px] text-slate-400">
                          <span className="font-bold text-[#E2136E]">bKash</span>
                          <span className="font-bold text-[#F7941D]">Nagad</span>
                          <span className="font-bold text-[#8C3494]">Rocket</span>
                          <span className="font-bold text-indigo-600">Visa/Mastercard</span>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 3: LIVE TRANSACTION STATUS TRACKER */}
        {activeTab === 'tracker' && (
          <div className="space-y-6">
            {/* Search Tracker Input */}
            <Card className="p-6 border-none shadow-xl bg-white">
              <div className="max-w-2xl mx-auto space-y-4">
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                    <Search size={24} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                    Live Payment Status & Settlement Tracker
                  </h3>
                  <p className="text-xs text-slate-500">
                    Enter any Transaction ID (<span className="font-mono text-indigo-600 font-bold">TRX-BK982314</span>), Invoice ID (<span className="font-mono text-indigo-600 font-bold">INV-2024-001</span>), or Student ID to verify real-time status.
                  </p>
                </div>

                <form onSubmit={handleTrackSearch} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      value={trackerSearchInput}
                      onChange={(e) => setTrackerSearchInput(e.target.value)}
                      placeholder="e.g. TRX-BK982314 or INV-2024-001"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase text-xs tracking-wider px-6 h-12 shadow-lg"
                    icon={Search}
                  >
                    Track Now
                  </Button>
                </form>

                {/* Quick Samples */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-[11px] text-slate-500">
                  <span>Quick Test Samples:</span>
                  <button
                    type="button"
                    onClick={() => { setTrackerSearchInput('TRX-BK982314'); }}
                    className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded hover:underline"
                  >
                    TRX-BK982314
                  </button>
                  <button
                    type="button"
                    onClick={() => { setTrackerSearchInput('INV-2024-002'); }}
                    className="font-mono font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded hover:underline"
                  >
                    INV-2024-002
                  </button>
                </div>
              </div>
            </Card>

            {/* Tracking Result View */}
            {trackedResult && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Visual Timeline Stepper */}
                <Card className="p-8 border-none shadow-xl bg-white overflow-hidden">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Tracking Target
                      </span>
                      <h4 className="text-lg font-black text-slate-900 font-mono">
                        {trackedResult.transaction?.trxId || trackedResult.invoice?.id}
                      </h4>
                    </div>
                    <Badge color={trackedResult.invoice?.status === 'Paid' ? 'green' : 'red'}>
                      {trackedResult.invoice?.status === 'Paid' ? 'SETTLED & PAID' : 'PENDING PAYMENT'}
                    </Badge>
                  </div>

                  {/* 4-Step Timeline */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
                    {/* Step 1 */}
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold text-xs shadow-md shadow-emerald-100">
                        <Check size={18} />
                      </div>
                      <div>
                        <h5 className="font-black text-xs uppercase text-slate-900">1. Invoice Generated</h5>
                        <p className="text-[11px] text-slate-500 mt-0.5">School accounts ledger billing active</p>
                        <span className="text-[10px] font-mono text-slate-400">{trackedResult.invoice?.dueDate}</span>
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${
                        trackedResult.invoice?.status === 'Paid' 
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100' 
                          : 'bg-slate-200 text-slate-500'
                      }`}>
                        {trackedResult.invoice?.status === 'Paid' ? <Check size={18} /> : '2'}
                      </div>
                      <div>
                        <h5 className="font-black text-xs uppercase text-slate-900">2. Gateway Authorization</h5>
                        <p className="text-[11px] text-slate-500 mt-0.5">OTP & PIN verified by MFS / Bank</p>
                        <span className="text-[10px] font-mono text-slate-400">
                          {trackedResult.transaction?.channelName || 'MFS / 3DS'}
                        </span>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${
                        trackedResult.invoice?.status === 'Paid' 
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100' 
                          : 'bg-slate-200 text-slate-500'
                      }`}>
                        {trackedResult.invoice?.status === 'Paid' ? <Check size={18} /> : '3'}
                      </div>
                      <div>
                        <h5 className="font-black text-xs uppercase text-slate-900">3. Interbank Settlement</h5>
                        <p className="text-[11px] text-slate-500 mt-0.5">Clearing through NPSB network</p>
                        <span className="text-[10px] font-mono text-slate-400">
                          {trackedResult.transaction?.bankRef || 'Pending Settlement'}
                        </span>
                      </div>
                    </div>

                    {/* Step 4 */}
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${
                        trackedResult.invoice?.status === 'Paid' 
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100' 
                          : 'bg-slate-200 text-slate-500'
                      }`}>
                        {trackedResult.invoice?.status === 'Paid' ? <Check size={18} /> : '4'}
                      </div>
                      <div>
                        <h5 className="font-black text-xs uppercase text-slate-900">4. School Treasury Credited</h5>
                        <p className="text-[11px] text-slate-500 mt-0.5">e-Receipt registered & archived</p>
                        <span className="text-[10px] font-mono text-slate-400">
                          {trackedResult.invoice?.paidDate || 'Awaiting Payment'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Detailed Information Panels */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Invoice Meta */}
                  <Card className="p-6 border-none shadow-xl bg-white space-y-4">
                    <h5 className="font-black text-xs uppercase text-slate-400 tracking-wider border-b pb-2">
                      Invoice Billing Metadata
                    </h5>
                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Invoice Reference:</span>
                        <span className="font-mono font-bold text-indigo-700">{trackedResult.invoice?.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Student Name:</span>
                        <span className="font-bold text-slate-900 uppercase">{trackedResult.invoice?.studentName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Student ID & Class:</span>
                        <span className="font-bold text-slate-700">
                          {trackedResult.invoice?.studentId} • {trackedResult.invoice?.studentClass} ({trackedResult.invoice?.studentSection})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Fee Category:</span>
                        <span className="font-bold text-slate-800">{trackedResult.invoice?.feeType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Billing Cycle:</span>
                        <span className="font-bold text-slate-800">{trackedResult.invoice?.month} {trackedResult.invoice?.year}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t font-black">
                        <span className="text-slate-700 uppercase">Amount Payable:</span>
                        <span className="text-base text-slate-900">৳{trackedResult.invoice?.amount.toLocaleString()}</span>
                      </div>
                    </div>
                  </Card>

                  {/* Payment Gateway Meta */}
                  <Card className="p-6 border-none shadow-xl bg-white space-y-4">
                    <h5 className="font-black text-xs uppercase text-slate-400 tracking-wider border-b pb-2">
                      Gateway & Settlement Details
                    </h5>
                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Transaction ID (TRX):</span>
                        <span className="font-mono font-bold text-emerald-600">
                          {trackedResult.transaction?.trxId || trackedResult.invoice?.trxId || 'N/A (Not Paid)'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Channel / Method:</span>
                        <span className="font-bold text-slate-800">
                          {trackedResult.transaction?.channelName || trackedResult.invoice?.paymentMethod || 'Online Gateway'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Bank Auth Reference:</span>
                        <span className="font-mono font-bold text-slate-600">
                          {trackedResult.transaction?.bankRef || 'BNK-REF-AUTOPROCESSED'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Payment Timestamp:</span>
                        <span className="font-bold text-slate-700">
                          {trackedResult.transaction?.paidAt || trackedResult.invoice?.paidDate || 'Pending'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Gateway Fee:</span>
                        <span className="font-bold text-slate-700">
                          ৳{trackedResult.transaction?.gatewayFee || 0}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t font-black">
                        <span className="text-slate-700 uppercase">Settlement Status:</span>
                        <span className={`text-sm uppercase ${
                          trackedResult.invoice?.status === 'Paid' ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {trackedResult.invoice?.status === 'Paid' ? 'COMPLETED / CREDITED' : 'OUTSTANDING'}
                        </span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: GATEWAY AUDIT & TRANSACTION LOGS */}
        {activeTab === 'transactions' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide">
                  Online Gateway Transaction Ledger
                </h4>
                <p className="text-xs text-slate-500">
                  Real-time synchronization logs from bKash, Nagad, Rocket, Visa/Mastercard, and Internet Banking.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                icon={Printer}
                onClick={() => window.print()}
              >
                Print Ledger
              </Button>
            </div>

            <Card className="p-0 border-none shadow-xl overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3.5 font-black uppercase text-slate-500 tracking-wider">Transaction ID</th>
                      <th className="px-4 py-3.5 font-black uppercase text-slate-500 tracking-wider">Invoice ID</th>
                      <th className="px-4 py-3.5 font-black uppercase text-slate-500 tracking-wider">Student</th>
                      <th className="px-4 py-3.5 font-black uppercase text-slate-500 tracking-wider">Channel</th>
                      <th className="px-4 py-3.5 font-black uppercase text-slate-500 tracking-wider text-right">Amount</th>
                      <th className="px-4 py-3.5 font-black uppercase text-slate-500 tracking-wider text-right">Gateway Fee</th>
                      <th className="px-4 py-3.5 font-black uppercase text-slate-500 tracking-wider text-center">Status</th>
                      <th className="px-4 py-3.5 font-black uppercase text-slate-500 tracking-wider">Paid Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transactions.map((t) => (
                      <tr key={t.id} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-indigo-600 flex items-center gap-1.5">
                          {t.trxId}
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(t.trxId);
                              addToast('Transaction ID copied', 'info');
                            }}
                            className="text-slate-400 hover:text-indigo-600"
                            title="Copy TRX"
                          >
                            <Copy size={12} />
                          </button>
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-slate-700">{t.invoiceId}</td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900 uppercase">{t.studentName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{t.studentId} • {t.studentClass}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[11px] font-black px-2 py-0.5 rounded-full uppercase ${
                            t.channel === 'bkash' ? 'bg-pink-100 text-[#E2136E]' :
                            t.channel === 'nagad' ? 'bg-orange-100 text-[#F7941D]' :
                            t.channel === 'rocket' ? 'bg-purple-100 text-[#8C3494]' :
                            t.channel === 'card' ? 'bg-indigo-100 text-indigo-700' :
                            'bg-emerald-100 text-emerald-700'
                          }`}>
                            {t.channel}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-black text-slate-900">
                          ৳{t.amount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-500 font-mono">
                          ৳{t.gatewayFee}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge color={t.status === 'Completed' ? 'green' : 'red'}>
                            {t.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-slate-600 font-medium">{t.paidAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 5: FEE STRUCTURE & HEADS */}
        {activeTab === 'fee_heads' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fee Heads Structure */}
            <Card className="p-6 border-none shadow-xl bg-white space-y-4">
              <h4 className="text-base font-black text-slate-900 uppercase tracking-tight">
                Class-Wise Fee Structure (Session 2024)
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b">
                    <tr>
                      <th className="py-2.5 px-3 font-black uppercase text-slate-500">Class</th>
                      <th className="py-2.5 px-3 font-black uppercase text-slate-500 text-right">Monthly Tuition</th>
                      <th className="py-2.5 px-3 font-black uppercase text-slate-500 text-right">Term Exam</th>
                      <th className="py-2.5 px-3 font-black uppercase text-slate-500 text-right">Lab / ICT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-slate-800">Class 9 & 10 (Science)</td>
                      <td className="py-2.5 px-3 text-right font-bold">৳2,500</td>
                      <td className="py-2.5 px-3 text-right font-bold">৳1,500</td>
                      <td className="py-2.5 px-3 text-right font-bold">৳500</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-slate-800">Class 9 & 10 (Commerce / Arts)</td>
                      <td className="py-2.5 px-3 text-right font-bold">৳2,200</td>
                      <td className="py-2.5 px-3 text-right font-bold">৳1,500</td>
                      <td className="py-2.5 px-3 text-right font-bold">৳300</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-slate-800">Class 6 to 8 (General)</td>
                      <td className="py-2.5 px-3 text-right font-bold">৳1,800</td>
                      <td className="py-2.5 px-3 text-right font-bold">৳1,200</td>
                      <td className="py-2.5 px-3 text-right font-bold">৳200</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-slate-800">Class 1 to 5 (Primary)</td>
                      <td className="py-2.5 px-3 text-right font-bold">৳1,400</td>
                      <td className="py-2.5 px-3 text-right font-bold">৳1,000</td>
                      <td className="py-2.5 px-3 text-right font-bold">৳100</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Waivers & Scholarship Rules */}
            <Card className="p-6 border-none shadow-xl bg-white space-y-4">
              <h4 className="text-base font-black text-slate-900 uppercase tracking-tight">
                Discount & Scholarship Policies
              </h4>
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-100 flex items-start gap-3">
                  <Award className="text-indigo-600 shrink-0 mt-0.5" size={18} />
                  <div>
                    <h5 className="font-bold text-xs text-indigo-900">Academic Merit Waiver (50%)</h5>
                    <p className="text-[11px] text-indigo-700 mt-0.5">
                      Awarded to students scoring GPA 5.00 (Golden) in annual examinations.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start gap-3">
                  <Users className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                  <div>
                    <h5 className="font-bold text-xs text-emerald-900">Sibling Concession (25%)</h5>
                    <p className="text-[11px] text-emerald-700 mt-0.5">
                      Applied automatically to the younger sibling enrolled in the institution.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-3">
                  <Building2 className="text-amber-600 shrink-0 mt-0.5" size={18} />
                  <div>
                    <h5 className="font-bold text-xs text-amber-900">Staff Ward Exemption (100% Tuition)</h5>
                    <p className="text-[11px] text-amber-700 mt-0.5">
                      Full tuition waiver for children of permanent school faculty and administrative staff.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 6: AUTOMATED EMAIL LOGS */}
        {activeTab === 'email_logs' && (
          <div className="space-y-4">
            {/* Header & Metrics Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4 border-none shadow-sm bg-white">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Total Receipts Emailed</span>
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                    <Mail size={18} />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <h3 className="text-2xl font-black text-slate-900">{emailLogs.length}</h3>
                  <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                    100% Sent
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">
                  Auto-dispatched via Payment Webhooks
                </p>
              </Card>

              <Card className="p-4 border-none shadow-sm bg-white">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Delivery SLA</span>
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                    <ShieldCheck size={18} />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <h3 className="text-2xl font-black text-indigo-600">&lt; 3.2s</h3>
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded">
                    Instant
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">
                  Average PDF compilation & dispatch time
                </p>
              </Card>

              <Card className="p-4 border-none shadow-sm bg-white">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Attached PDF Integrity</span>
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                    <FileText size={18} />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <h3 className="text-2xl font-black text-blue-600">QR Verified</h3>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-medium">
                  With Institutional Seal & Bank Ref
                </p>
              </Card>

              <Card className="p-4 border-none shadow-sm bg-slate-900 text-white">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Target Audience</span>
                  <div className="p-2 rounded-xl bg-white/10 text-emerald-400">
                    <Users size={18} />
                  </div>
                </div>
                <div className="mt-2 flex items-baseline gap-2">
                  <h3 className="text-2xl font-black text-white">Parents & Guardians</h3>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 font-medium">
                  Direct SMS/Email notifications
                </p>
              </Card>
            </div>

            {/* Filter and Actions Bar */}
            <Card className="p-4 border-none shadow-sm bg-white">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search by student, parent email, invoice #, or receipt..."
                    value={emailLogSearch}
                    onChange={(e) => setEmailLogSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to clear fee receipt email logs?')) {
                        clearSentFeeReceiptEmails();
                        setEmailLogs([]);
                        addToast('Fee receipt email history cleared', 'info');
                      }
                    }}
                  >
                    Clear History
                  </Button>

                  <Button
                    size="sm"
                    className="text-xs bg-indigo-700 hover:bg-indigo-800 text-white font-bold"
                    icon={Mail}
                    onClick={() => {
                      const samplePaid = invoices.find(i => i.status === 'Paid') || invoices[0];
                      handleOpenEmailModal(samplePaid);
                    }}
                  >
                    Compose Email Receipt
                  </Button>
                </div>
              </div>
            </Card>

            {/* Email Logs Table */}
            <Card className="border-none shadow-sm bg-white overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-black text-sm text-slate-900 uppercase tracking-tight">
                    Automated Fee Receipt Email Dispatch Ledger
                  </h4>
                  <p className="text-xs text-slate-500">
                    Every successful payment triggers an automatic official PDF receipt email with 256-bit digital verification.
                  </p>
                </div>
                <Badge color="green">
                  {emailLogs.filter(l => l.status === 'Delivered').length} Delivered
                </Badge>
              </div>

              {emailLogs.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <Inbox size={24} />
                  </div>
                  <h5 className="font-bold text-sm text-slate-700">No Receipt Emails Sent Yet</h5>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    When parents complete online payment via bKash/Nagad or pay cash at the counter, official PDF receipts will be automatically dispatched and logged here.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 font-black uppercase text-slate-500 tracking-wider">Dispatched At</th>
                        <th className="px-4 py-3 font-black uppercase text-slate-500 tracking-wider">Student & Class</th>
                        <th className="px-4 py-3 font-black uppercase text-slate-500 tracking-wider">Parent Recipient Email</th>
                        <th className="px-4 py-3 font-black uppercase text-slate-500 tracking-wider">Invoice / Receipt #</th>
                        <th className="px-4 py-3 font-black uppercase text-slate-500 tracking-wider text-right">Settled Amount</th>
                        <th className="px-4 py-3 font-black uppercase text-slate-500 tracking-wider">Attached PDF Document</th>
                        <th className="px-4 py-3 font-black uppercase text-slate-500 tracking-wider text-center">Status</th>
                        <th className="px-4 py-3 font-black uppercase text-slate-500 tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {emailLogs
                        .filter(l => {
                          const q = emailLogSearch.toLowerCase();
                          return (
                            l.studentName.toLowerCase().includes(q) ||
                            l.recipientEmail.toLowerCase().includes(q) ||
                            l.invoiceId.toLowerCase().includes(q) ||
                            l.receiptNo.toLowerCase().includes(q) ||
                            l.trxId.toLowerCase().includes(q)
                          );
                        })
                        .map((log) => (
                          <tr key={log.id} className="hover:bg-indigo-50/30 transition-colors">
                            <td className="px-4 py-3">
                              <span className="font-bold text-slate-900">{log.sentAt}</span>
                              <div className="text-[10px] text-slate-400 font-mono">{log.id}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-bold text-slate-800 uppercase">{log.studentName}</div>
                              <div className="text-[10px] text-slate-400">{log.studentClass} • ID: {log.studentId}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-mono font-bold text-indigo-700 flex items-center gap-1">
                                <Mail size={12} className="text-indigo-500" />
                                {log.recipientEmail}
                              </div>
                              <div className="text-[10px] text-slate-400">Guardian: {log.guardianName}</div>
                            </td>
                            <td className="px-4 py-3 font-mono">
                              <div className="font-bold text-slate-800">{log.receiptNo}</div>
                              <div className="text-[10px] text-slate-400">Ref: {log.invoiceId} • {log.trxId}</div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="font-black text-slate-900">৳{log.amount.toLocaleString()}</span>
                              <div className="text-[10px] font-bold text-emerald-600">{log.paymentMethod}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-200 w-fit">
                                <FileText size={13} className="text-rose-600" />
                                <span className="font-mono text-[11px] text-slate-700 font-medium max-w-[180px] truncate" title={log.pdfFileName}>
                                  {log.pdfFileName}
                                </span>
                                <span className="text-[9px] bg-slate-200 text-slate-600 px-1 py-0.2 rounded font-bold">
                                  {log.pdfFileSizeKb} KB
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Badge color="green">
                                <span className="flex items-center gap-1">
                                  <CheckCircle2 size={11} /> {log.status}
                                </span>
                              </Badge>
                              <div className="text-[9px] text-slate-400 mt-0.5">{log.remarks || '256-bit SSL'}</div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={async () => {
                                    try {
                                      addToast(`Resending fee receipt PDF to ${log.recipientEmail}...`, 'info');
                                      const res = await sendFeeReceiptEmail({
                                        invoice: {
                                          id: log.invoiceId,
                                          receiptNo: log.receiptNo,
                                          studentId: log.studentId,
                                          studentName: log.studentName,
                                          studentClass: log.studentClass,
                                          amount: log.amount,
                                          feeType: log.feeType,
                                          paymentMethod: log.paymentMethod,
                                          trxId: log.trxId,
                                          guardianPhone: log.recipientPhone
                                        },
                                        activeTenant,
                                        recipientEmail: log.recipientEmail,
                                        deliveryChannel: 'Manual Resend'
                                      });
                                      addToast(`Fee receipt PDF re-dispatched to ${res.recipientEmail}!`, 'success');
                                    } catch (err) {
                                      addToast('Failed to resend receipt email', 'error');
                                    }
                                  }}
                                  className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-indigo-700 font-bold text-[10px] flex items-center gap-1 transition-colors"
                                  title="Resend official PDF receipt to parent"
                                >
                                  <RefreshCw size={11} /> Resend
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const matchingInv = invoices.find(i => i.id === log.invoiceId);
                                    if (matchingInv) {
                                      setInspectedInvoice(matchingInv);
                                    } else {
                                      setInspectedInvoice({
                                        id: log.invoiceId,
                                        studentId: log.studentId,
                                        studentName: log.studentName,
                                        studentClass: log.studentClass,
                                        studentSection: 'A',
                                        studentRoll: '01',
                                        guardianPhone: log.recipientPhone,
                                        amount: log.amount,
                                        paidAmount: log.amount,
                                        dueAmount: 0,
                                        feeType: log.feeType,
                                        month: 'May',
                                        year: '2024',
                                        dueDate: '2024-05-15',
                                        status: 'Paid',
                                        paymentMethod: log.paymentMethod as any,
                                        trxId: log.trxId
                                      });
                                    }
                                  }}
                                  className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100"
                                  title="Inspect receipt voucher"
                                >
                                  <Eye size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>

      {/* MOCK PAYMENT GATEWAY MODAL */}
      <MockPaymentGateway
        isOpen={isGatewayOpen}
        onClose={() => setIsGatewayOpen(false)}
        invoice={selectedPayInvoice}
        onPaymentSuccess={handleGatewaySuccess}
      />

      {/* CASH COUNTER COLLECTION MODAL */}
      <Modal
        isOpen={isCashModalOpen}
        onClose={() => setIsCashModalOpen(false)}
        title="Record Cash Fee Collection"
      >
        {cashInvoice && (
          <form onSubmit={handleCashCollectionSubmit} className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Student:</span>
                <span className="font-bold text-slate-800 uppercase">{cashInvoice.studentName} ({cashInvoice.studentId})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Fee Head:</span>
                <span className="font-bold text-slate-800">{cashInvoice.feeType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Bill Amount:</span>
                <span className="font-bold text-slate-800">৳{cashInvoice.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-rose-600 font-bold border-t pt-1">
                <span>Current Dues:</span>
                <span>৳{cashInvoice.dueAmount.toLocaleString()}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                Cash Amount Received (৳)
              </label>
              <input
                type="number"
                required
                min={1}
                max={cashInvoice.dueAmount}
                value={cashAmount}
                onChange={(e) => setCashAmount(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                Counter Collector Name
              </label>
              <input
                type="text"
                required
                value={cashCollector}
                onChange={(e) => setCashCollector(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                Cash Receipt Number
              </label>
              <input
                type="text"
                readOnly
                value={cashReceiptNo}
                className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-600 outline-none"
              />
            </div>

            {/* Automated Parent Email Dispatch Option */}
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-2">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-emerald-950">
                <input
                  type="checkbox"
                  checked={autoEmailParentCash}
                  onChange={(e) => setAutoEmailParentCash(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <span className="flex items-center gap-1.5">
                  <Mail size={14} className="text-emerald-600" />
                  Auto-email Official PDF Receipt to Parent
                </span>
              </label>

              {autoEmailParentCash && (
                <div className="space-y-1 pt-1">
                  <input
                    type="email"
                    value={cashParentEmail || cashInvoice.parentEmail || getRegisteredParentEmail(cashInvoice.studentId, cashInvoice.studentName)}
                    onChange={(e) => setCashParentEmail(e.target.value)}
                    placeholder="e.g. parent.name@gmail.com"
                    className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium"
                  />
                  <span className="text-[10px] text-emerald-700 block">
                    ✓ Official school-branded PDF receipt with digital QR seal will be compiled and delivered instantly.
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCashModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold" icon={DollarSign}>
                Record Cash Received
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* CREATE NEW FEE INVOICE MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Generate New Student Fee Invoice"
      >
        <form onSubmit={handleCreateInvoice} className="space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
              Select Student
            </label>
            <select
              value={newInvoiceData.studentId}
              onChange={(e) => setNewInvoiceData({ ...newInvoiceData, studentId: e.target.value })}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold outline-none focus:ring-2 ring-indigo-500"
            >
              {MOCK_STUDENTS.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.id} • {s.class} - Sec {s.section})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                Fee Head
              </label>
              <select
                value={newInvoiceData.feeType}
                onChange={(e) => setNewInvoiceData({ ...newInvoiceData, feeType: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold outline-none focus:ring-2 ring-indigo-500"
              >
                <option value="Tuition Fee">Tuition Fee</option>
                <option value="First Term Exam Fee">First Term Exam Fee</option>
                <option value="Annual Sports & Cultural Fee">Annual Sports Fee</option>
                <option value="Science Lab & ICT Fee">Science Lab & ICT Fee</option>
                <option value="Transport Zone A Fee">Transport Zone Fee</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                Payable Amount (৳)
              </label>
              <input
                type="number"
                required
                value={newInvoiceData.amount}
                onChange={(e) => setNewInvoiceData({ ...newInvoiceData, amount: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold outline-none focus:ring-2 ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                Billing Month & Year
              </label>
              <div className="flex gap-2">
                <select
                  value={newInvoiceData.month}
                  onChange={(e) => setNewInvoiceData({ ...newInvoiceData, month: e.target.value })}
                  className="w-1/2 p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
                >
                  <option>January</option><option>February</option><option>March</option>
                  <option>April</option><option>May</option><option>June</option>
                  <option>July</option><option>August</option><option>September</option>
                  <option>October</option><option>November</option><option>December</option>
                </select>
                <input
                  type="text"
                  value={newInvoiceData.year}
                  onChange={(e) => setNewInvoiceData({ ...newInvoiceData, year: e.target.value })}
                  className="w-1/2 p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-center"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                Due Date
              </label>
              <input
                type="date"
                required
                value={newInvoiceData.dueDate}
                onChange={(e) => setNewInvoiceData({ ...newInvoiceData, dueDate: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold outline-none focus:ring-2 ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold" icon={Plus}>
              Issue Fee Invoice
            </Button>
          </div>
        </form>
      </Modal>

      {/* INSPECT OFFICIAL PRINTABLE E-RECEIPT MODAL */}
      <Modal
        isOpen={!!inspectedInvoice}
        onClose={() => setInspectedInvoice(null)}
        title="Official Money Receipt"
      >
        {inspectedInvoice && (
          <div className="space-y-6" id="official-fee-receipt">
            {/* School Header */}
            <div className="text-center border-b-2 border-slate-900 pb-4">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg text-white font-black text-lg flex items-center justify-center mx-auto mb-1 overflow-hidden">
                {activeTenant?.logoUrl ? (
                  <img src={activeTenant.logoUrl} alt={activeTenant.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{activeTenant?.name?.charAt(0) || 'S'}</span>
                )}
              </div>
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{activeTenant?.name || 'SmartSchool International'}</h3>
              <p className="text-[11px] text-slate-600 font-medium">{activeTenant?.address || 'Main Campus, Bangladesh'} • EIIN: {activeTenant?.eiin || '108241'} • Tel: {activeTenant?.contactPhone || '+880 2-9876543'}</p>
              <div className="mt-2 inline-block px-3 py-0.5 bg-slate-900 text-white font-black text-[10px] uppercase rounded-full tracking-widest">
                Student Fee Payment Receipt
              </div>
            </div>

            {/* Receipt Details Table */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 text-[10px] block uppercase font-bold">Money Receipt #</span>
                <span className="font-mono font-black text-indigo-700">{inspectedInvoice.trxId || inspectedInvoice.id}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 text-[10px] block uppercase font-bold">Payment Date</span>
                <span className="font-bold text-slate-800">{inspectedInvoice.paidDate || 'Settled'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block uppercase font-bold">Student Name</span>
                <span className="font-bold text-slate-900 uppercase">{inspectedInvoice.studentName}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 text-[10px] block uppercase font-bold">Student ID / Roll</span>
                <span className="font-bold text-slate-800">{inspectedInvoice.studentId} • Roll: {inspectedInvoice.studentRoll}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block uppercase font-bold">Class & Section</span>
                <span className="font-bold text-slate-800">{inspectedInvoice.studentClass} ({inspectedInvoice.studentSection})</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 text-[10px] block uppercase font-bold">Payment Channel</span>
                <span className="font-black text-emerald-700 uppercase">{inspectedInvoice.paymentMethod || 'Online Gateway'}</span>
              </div>
            </div>

            {/* Line Items Table */}
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-800 text-slate-500 uppercase font-black text-[10px]">
                  <th className="py-2 px-1">Description / Fee Head</th>
                  <th className="py-2 px-1 text-center">Month</th>
                  <th className="py-2 px-1 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-2.5 px-1 font-bold text-slate-800">{inspectedInvoice.feeType}</td>
                  <td className="py-2.5 px-1 text-center text-slate-600">{inspectedInvoice.month} {inspectedInvoice.year}</td>
                  <td className="py-2.5 px-1 text-right font-black text-slate-900">৳{inspectedInvoice.amount.toLocaleString()}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-900">
                  <td colSpan={2} className="py-2 px-1 font-black text-slate-800 uppercase">Total Paid (Taka):</td>
                  <td className="py-2 px-1 text-right font-black text-base text-indigo-700">৳{inspectedInvoice.paidAmount.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>

            {/* Seal & Signatures */}
            <div className="pt-8 grid grid-cols-2 text-center text-[10px] font-bold text-slate-500">
              <div>
                <div className="w-28 border-t border-slate-400 mx-auto pt-1">Accountant Signature</div>
              </div>
              <div>
                <div className="w-28 border-t border-slate-400 mx-auto pt-1">Principal / Cash Seal</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-200 no-print">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>Computer-generated official money receipt with QR seal</span>
              </span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setInspectedInvoice(null)}>
                  Close
                </Button>
                <Button 
                  variant="outline"
                  icon={Printer} 
                  onClick={() => window.print()}
                >
                  Print
                </Button>
                <Button 
                  variant="outline"
                  icon={Mail}
                  className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 font-bold"
                  onClick={() => {
                    handleOpenEmailModal(inspectedInvoice);
                  }}
                >
                  Email PDF
                </Button>
                <Button 
                  icon={isDownloadingReceipt ? Loader2 : Download}
                  disabled={isDownloadingReceipt}
                  className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold"
                  onClick={handleDownloadInspectedPDF}
                >
                  {isDownloadingReceipt ? 'Generating PDF...' : 'Download Official PDF'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* MANUAL EMAIL DISPATCH MODAL */}
      <Modal
        isOpen={isEmailModalOpen}
        onClose={() => {
          setIsEmailModalOpen(false);
          setEmailTargetInvoice(null);
        }}
        title="Email Official Fee Receipt with PDF Attachment"
      >
        {emailTargetInvoice && (
          <form onSubmit={handleSendManualEmail} className="space-y-4">
            <div className="p-3.5 bg-indigo-50/70 rounded-xl border border-indigo-100 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                <Mail size={18} />
              </div>
              <div className="text-xs">
                <span className="font-bold text-indigo-900 block text-sm">
                  Official School-Branded Receipt Dispatch
                </span>
                <span className="text-indigo-700">
                  Sends verified PDF receipt ({emailTargetInvoice.trxId || emailTargetInvoice.id}) directly to the parent's inbox with official EIIN, QR verification code, and itemized billing particulars.
                </span>
              </div>
            </div>

            {/* Student & Invoice Summary Strip */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400 text-[10px] block font-bold uppercase">Student</span>
                <span className="font-bold text-slate-800 uppercase">{emailTargetInvoice.studentName}</span>
                <span className="text-[10px] text-slate-500 block">{emailTargetInvoice.studentClass} • ID: {emailTargetInvoice.studentId}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block font-bold uppercase">Settled Fee</span>
                <span className="font-bold text-emerald-700">৳{emailTargetInvoice.paidAmount > 0 ? emailTargetInvoice.paidAmount.toLocaleString() : emailTargetInvoice.amount.toLocaleString()}</span>
                <span className="text-[10px] text-slate-500 block">{emailTargetInvoice.feeType}</span>
              </div>
            </div>

            {/* Recipient Email Input */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                Parent Email Address *
              </label>
              <input
                type="email"
                required
                value={emailRecipientInput}
                onChange={(e) => setEmailRecipientInput(e.target.value)}
                placeholder="parent.guardian@gmail.com"
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Pre-filled from registered student particulars. You can edit this before sending.
              </span>
            </div>

            {/* Custom Subject Line */}
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                Email Subject Line
              </label>
              <input
                type="text"
                value={emailCustomSubject}
                onChange={(e) => setEmailCustomSubject(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Attachment Preview Card */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-rose-600 shrink-0" />
                <div>
                  <div className="font-mono font-bold text-slate-800 text-[11px]">
                    Official_Fee_Receipt_{emailTargetInvoice.id}.pdf
                  </div>
                  <div className="text-[10px] text-slate-400">
                    A4 Single-Page • QR Digital Verification Seal • 48 KB
                  </div>
                </div>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 size={11} /> Attached
              </span>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEmailModalOpen(false);
                  setEmailTargetInvoice(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSendingFeeEmail || !emailRecipientInput.includes('@')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                icon={isSendingFeeEmail ? Loader2 : Send}
              >
                {isSendingFeeEmail ? 'Compiling & Sending...' : 'Send Email with PDF'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* PDF Export Modal */}
      <PDFExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Student Fee Register & Collection Ledger"
        defaultSubtitle="Academic Session 2024-2025 • Official Institutional Financial Records"
        moduleType="fees"
        data={invoices}
      />
    </DashboardLayout>
  );
};
