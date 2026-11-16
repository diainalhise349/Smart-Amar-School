import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Smartphone, ShieldCheck, Lock, QrCode, Printer, 
  Download, RefreshCw, CheckCircle2, AlertCircle, Loader2, ArrowRight, 
  Check, Copy, X, ChevronRight, Calendar, Building2, Sparkles, 
  Receipt, Wallet, ExternalLink, FileText, Info, Phone, ArrowLeft,
  DollarSign, CheckSquare, Hash, Mail, Send
} from 'lucide-react';
import { Button, Badge, Modal, useToast } from './UIComponents';
import { useAuth } from '../context/AuthContext';
import { downloadFeeReceiptPDF } from '../utils/feeReceiptResolver';
import { sendFeeReceiptEmail, getRegisteredParentEmail, FeeReceiptEmailLog } from '../utils/feeEmailService';

export type PaymentChannel = 'bkash' | 'nagad' | 'rocket' | 'card' | 'bank';
export type PaymentStatus = 'Initiated' | 'Processing' | 'Completed' | 'Failed' | 'Refunded';

export interface PaymentTransaction {
  id: string;
  trxId: string;
  invoiceId: string;
  studentId: string;
  studentName: string;
  studentClass?: string;
  studentRoll?: string;
  guardianPhone?: string;
  amount: number;
  feeType: string;
  channel: PaymentChannel;
  channelName: string;
  accountNumber?: string;
  cardLast4?: string;
  bankRef?: string;
  status: PaymentStatus;
  timestamp: string;
  paidAt?: string;
  gatewayFee: number;
  remarks?: string;
}

export interface PaymentInvoiceInfo {
  id: string;
  studentId?: string;
  studentName: string;
  studentClass?: string;
  studentRoll?: string;
  guardianPhone?: string;
  amount: number;
  feeType: string;
  dueDate?: string;
  month?: string;
  breakdown?: {
    tuition?: number;
    exam?: number;
    lab?: number;
    sports?: number;
    latePenalty?: number;
    waiver?: number;
  };
}

interface MockPaymentGatewayProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: PaymentInvoiceInfo | null;
  onPaymentSuccess?: (transaction: PaymentTransaction) => void;
  onPaymentFailed?: (errorMsg: string) => void;
}

export const MockPaymentGateway: React.FC<MockPaymentGatewayProps> = ({
  isOpen,
  onClose,
  invoice,
  onPaymentSuccess,
  onPaymentFailed,
}) => {
  const { addToast } = useToast();
  const { activeTenant } = useAuth();
  const [isDownloadingReceipt, setIsDownloadingReceipt] = useState(false);
  const [emailSentStatus, setEmailSentStatus] = useState<FeeReceiptEmailLog | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [showCustomEmailInput, setShowCustomEmailInput] = useState(false);
  const [customEmailValue, setCustomEmailValue] = useState('');

  // Wizard Steps
  // 1: SELECT_CHANNEL, 2: ENTER_CREDENTIALS, 3: VERIFY_OTP, 4: ENTER_PIN, 5: PROCESSING, 6: SUCCESS, 7: FAILED
  const [step, setStep] = useState<number>(1);
  const [selectedChannel, setSelectedChannel] = useState<PaymentChannel>('bkash');
  
  // Form State
  const [accountNumber, setAccountNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [pinCode, setPinCode] = useState('');
  
  // Card Form
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Bank Form
  const [selectedBank, setSelectedBank] = useState('City Bank Touch');

  // Processing & Result State
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingMessage, setProcessingMessage] = useState('Contacting payment gateway...');
  const [completedTxn, setCompletedTxn] = useState<PaymentTransaction | null>(null);
  const [simulateFailure, setSimulateFailure] = useState(false);

  // OTP Timer countdown
  const [otpTimer, setOtpTimer] = useState(60);

  // Reset modal when invoice changes or modal opens
  useEffect(() => {
    if (isOpen && invoice) {
      setStep(1);
      setSelectedChannel('bkash');
      setAccountNumber(invoice.guardianPhone || '01712345678');
      setOtpCode('');
      setPinCode('');
      setCardNumber('4532 8921 7732 1094');
      setCardHolder(invoice.studentName ? `${invoice.studentName}'s Guardian` : 'MD. RAHIM AHMED');
      setCardExpiry('08/28');
      setCardCvv('789');
      setProcessingProgress(0);
      setCompletedTxn(null);
      setSimulateFailure(false);
    }
  }, [isOpen, invoice]);

  // OTP Timer effect
  useEffect(() => {
    let interval: any;
    if (step === 3 && otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, otpTimer]);

  if (!isOpen || !invoice) return null;

  const baseAmount = invoice.amount;
  const gatewayFee = selectedChannel === 'card' ? Math.round(baseAmount * 0.015) : selectedChannel === 'bank' ? 10 : Math.round(baseAmount * 0.01);
  const grandTotal = baseAmount + gatewayFee;

  const handleSelectChannel = (channel: PaymentChannel) => {
    setSelectedChannel(channel);
    setStep(2);
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedChannel === 'bkash' || selectedChannel === 'nagad' || selectedChannel === 'rocket') {
      if (!accountNumber || accountNumber.length < 11) {
        addToast('Please enter a valid 11-digit mobile number', 'error');
        return;
      }
    } else if (selectedChannel === 'card') {
      if (!cardNumber || cardNumber.replace(/\s/g, '').length < 16) {
        addToast('Please enter a valid 16-digit card number', 'error');
        return;
      }
    }
    setOtpTimer(60);
    setOtpCode('589214'); // Auto-suggested OTP
    setStep(3);
    addToast(`Security OTP sent to ${accountNumber || 'registered mobile'}`, 'info');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 4) {
      addToast('Please enter the 6-digit OTP', 'error');
      return;
    }
    if (selectedChannel === 'card') {
      // Cards skip PIN and go straight to 3DS authorization processing
      startProcessingFlow();
    } else {
      setStep(4); // Enter PIN
    }
  };

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinCode || pinCode.length < 4) {
      addToast('Please enter your 4-5 digit PIN', 'error');
      return;
    }
    startProcessingFlow();
  };

  const startProcessingFlow = () => {
    setStep(5);
    setProcessingProgress(15);
    setProcessingMessage('Secure Handshake with Central Payment Gateway...');

    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const generatedTrxId = selectedChannel === 'bkash' 
      ? `TRX-BK${randomSuffix}` 
      : selectedChannel === 'nagad' 
      ? `TRX-NG${randomSuffix}` 
      : selectedChannel === 'rocket' 
      ? `TRX-RK${randomSuffix}` 
      : selectedChannel === 'card' 
      ? `TRX-CC${randomSuffix}` 
      : `TRX-BNK${randomSuffix}`;

    setTimeout(() => {
      setProcessingProgress(45);
      setProcessingMessage('Verifying account balance & 3-D Secure token...');
    }, 800);

    setTimeout(() => {
      setProcessingProgress(80);
      setProcessingMessage('Settling invoice with School Treasury Account...');
    }, 1600);

    setTimeout(() => {
      if (simulateFailure) {
        setProcessingProgress(100);
        setStep(7);
        if (onPaymentFailed) onPaymentFailed('Payment declined by card issuer / insufficient balance.');
        addToast('Payment Failed: Simulated decline response', 'error');
      } else {
        setProcessingProgress(100);
        const txnRecord: PaymentTransaction = {
          id: `PAY-${Date.now().toString().slice(-6)}`,
          trxId: generatedTrxId,
          invoiceId: invoice.id,
          studentId: invoice.studentId || 'ST-2024-001',
          studentName: invoice.studentName,
          studentClass: invoice.studentClass || 'Class 10',
          studentRoll: invoice.studentRoll || '01',
          guardianPhone: accountNumber || invoice.guardianPhone,
          amount: grandTotal,
          feeType: invoice.feeType,
          channel: selectedChannel,
          channelName: 
            selectedChannel === 'bkash' ? 'bKash Mobile Banking' :
            selectedChannel === 'nagad' ? 'Nagad Digital Payment' :
            selectedChannel === 'rocket' ? 'DBBL Rocket' :
            selectedChannel === 'card' ? 'Visa / MasterCard Debit/Credit' :
            `Internet Banking (${selectedBank})`,
          accountNumber: selectedChannel !== 'card' ? accountNumber : undefined,
          cardLast4: selectedChannel === 'card' ? cardNumber.slice(-4) : undefined,
          bankRef: `BNK-REF-${Math.floor(10000000 + Math.random() * 90000000)}`,
          status: 'Completed',
          timestamp: new Date().toISOString(),
          paidAt: new Date().toLocaleString(),
          gatewayFee,
          remarks: `Fee settlement for ${invoice.feeType} (${invoice.id})`,
        };

        setCompletedTxn(txnRecord);
        setStep(6);
        if (onPaymentSuccess) {
          onPaymentSuccess(txnRecord);
        }
        addToast(`Payment of ৳${grandTotal.toLocaleString()} Successful!`, 'success');

        // Automatically dispatch official PDF fee receipt to registered parent email
        sendFeeReceiptEmail({
          invoice: txnRecord,
          activeTenant,
          deliveryChannel: 'Automated Post-Payment'
        }).then((emailLog) => {
          setEmailSentStatus(emailLog);
          addToast(`Official PDF receipt automatically emailed to ${emailLog.recipientEmail}`, 'info');
        }).catch((err) => {
          console.error('Automated receipt email dispatch error:', err);
        });
      }
    }, 2400);
  };

  const handleDownloadReceiptPDF = async () => {
    if (!completedTxn) return;
    try {
      setIsDownloadingReceipt(true);
      await downloadFeeReceiptPDF(completedTxn, activeTenant);
      addToast('Official fee receipt PDF downloaded successfully!', 'success');
    } catch (e) {
      addToast('Failed to generate PDF receipt', 'error');
    } finally {
      setIsDownloadingReceipt(false);
    }
  };

  const getChannelColor = (ch: PaymentChannel) => {
    switch (ch) {
      case 'bkash': return 'bg-[#E2136E] text-white hover:bg-[#c90f61]';
      case 'nagad': return 'bg-[#F7941D] text-white hover:bg-[#e07f0f]';
      case 'rocket': return 'bg-[#8C3494] text-white hover:bg-[#77287e]';
      case 'card': return 'bg-indigo-600 text-white hover:bg-indigo-700';
      case 'bank': return 'bg-emerald-600 text-white hover:bg-emerald-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-400">
              <ShieldCheck size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm tracking-tight text-white uppercase">Amar Smart School Payment Gateway</h3>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-500/30">
                  256-Bit SSL
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <Lock size={12} className="text-emerald-400" /> Merchant: Smart School Treasury • Invoice: #{invoice.id}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Invoice Summary Strip */}
        <div className="bg-gradient-to-r from-indigo-50 via-slate-50 to-blue-50 border-b border-indigo-100/60 p-4 px-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Billed To</div>
            <div className="text-sm font-black text-slate-800 uppercase flex items-center gap-1.5">
              {invoice.studentName}
              {invoice.studentClass && <span className="text-xs font-bold text-indigo-600">({invoice.studentClass})</span>}
            </div>
            <div className="text-[11px] text-slate-500">
              Fee Type: <span className="font-bold text-slate-700">{invoice.feeType}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Total Payable</div>
            <div className="text-2xl font-black text-indigo-700 tracking-tight">
              ৳{grandTotal.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400">
              Base: ৳{baseAmount.toLocaleString()} + Gateway Fee: ৳{gatewayFee}
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6">
          {/* STEP 1: SELECT PAYMENT METHOD */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div>
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide">Choose Payment Method</h4>
                <p className="text-xs text-slate-500">Select your preferred mobile wallet, card, or internet banking account.</p>
              </div>

              {/* Mobile Banking Section */}
              <div className="space-y-2">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mobile Financial Services (MFS)</div>
                <div className="grid grid-cols-3 gap-3">
                  {/* bKash */}
                  <button
                    type="button"
                    onClick={() => handleSelectChannel('bkash')}
                    className="p-3.5 rounded-xl border-2 border-slate-200 hover:border-[#E2136E] bg-white hover:bg-pink-50/40 text-left transition-all group flex flex-col justify-between h-24 relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-[#E2136E] uppercase tracking-wider">bKash</span>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#E2136E]"></span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-bold group-hover:text-slate-800">
                      Instant 1-Click Pay
                    </div>
                    <div className="text-[9px] font-black text-[#E2136E] uppercase flex items-center gap-1">
                      bKash Checkout <ArrowRight size={10} />
                    </div>
                  </button>

                  {/* Nagad */}
                  <button
                    type="button"
                    onClick={() => handleSelectChannel('nagad')}
                    className="p-3.5 rounded-xl border-2 border-slate-200 hover:border-[#F7941D] bg-white hover:bg-amber-50/40 text-left transition-all group flex flex-col justify-between h-24 relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-[#F7941D] uppercase tracking-wider">Nagad</span>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#F7941D]"></span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-bold group-hover:text-slate-800">
                      Postal Digital Pay
                    </div>
                    <div className="text-[9px] font-black text-[#F7941D] uppercase flex items-center gap-1">
                      Nagad Pay <ArrowRight size={10} />
                    </div>
                  </button>

                  {/* Rocket */}
                  <button
                    type="button"
                    onClick={() => handleSelectChannel('rocket')}
                    className="p-3.5 rounded-xl border-2 border-slate-200 hover:border-[#8C3494] bg-white hover:bg-purple-50/40 text-left transition-all group flex flex-col justify-between h-24 relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-[#8C3494] uppercase tracking-wider">Rocket</span>
                      <span className="w-2.5 h-2.5 rounded-full bg-[#8C3494]"></span>
                    </div>
                    <div className="text-[10px] text-slate-500 font-bold group-hover:text-slate-800">
                      DBBL Banking
                    </div>
                    <div className="text-[9px] font-black text-[#8C3494] uppercase flex items-center gap-1">
                      Rocket Pay <ArrowRight size={10} />
                    </div>
                  </button>
                </div>
              </div>

              {/* Cards & Net Banking Section */}
              <div className="space-y-2 pt-2">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cards & Online Banking</div>
                <div className="grid grid-cols-2 gap-3">
                  {/* Cards */}
                  <button
                    type="button"
                    onClick={() => handleSelectChannel('card')}
                    className="p-4 rounded-xl border-2 border-slate-200 hover:border-indigo-600 bg-white hover:bg-indigo-50/40 text-left transition-all group flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <div className="font-black text-xs text-slate-800 uppercase">Debit / Credit Card</div>
                      <div className="text-[10px] text-slate-400">Visa, Mastercard, Amex</div>
                    </div>
                  </button>

                  {/* Net Banking */}
                  <button
                    type="button"
                    onClick={() => handleSelectChannel('bank')}
                    className="p-4 rounded-xl border-2 border-slate-200 hover:border-emerald-600 bg-white hover:bg-emerald-50/40 text-left transition-all group flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <div className="font-black text-xs text-slate-800 uppercase">Net Banking</div>
                      <div className="text-[10px] text-slate-400">City Touch, EBL, IBBL</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Simulation switch for testing failure mode */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Info size={14} className="text-slate-400" />
                  Test Gateway Sandbox Mode
                </span>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-600">
                  <input
                    type="checkbox"
                    checked={simulateFailure}
                    onChange={(e) => setSimulateFailure(e.target.checked)}
                    className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                  />
                  Simulate Failed Payment
                </label>
              </div>
            </div>
          )}

          {/* STEP 2: ENTER CREDENTIALS */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                >
                  <ArrowLeft size={14} /> Back to Methods
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">Channel:</span>
                  <span className={`text-xs font-black px-2.5 py-0.5 rounded-full uppercase ${
                    selectedChannel === 'bkash' ? 'bg-pink-100 text-[#E2136E]' :
                    selectedChannel === 'nagad' ? 'bg-orange-100 text-[#F7941D]' :
                    selectedChannel === 'rocket' ? 'bg-purple-100 text-[#8C3494]' :
                    selectedChannel === 'card' ? 'bg-indigo-100 text-indigo-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {selectedChannel}
                  </span>
                </div>
              </div>

              {/* MFS Inputs */}
              {(selectedChannel === 'bkash' || selectedChannel === 'nagad' || selectedChannel === 'rocket') && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                      Your {selectedChannel.toUpperCase()} Account Number
                    </label>
                    <div className="relative">
                      <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        type="tel"
                        required
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        placeholder="e.g. 017XXXXXXXX"
                        maxLength={11}
                        className="w-full pl-11 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl text-base font-mono font-bold tracking-wider text-slate-900 focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-100 transition-all"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
                      <Lock size={12} className="text-slate-400" />
                      We will send a 6-digit one-time verification code (OTP) to this number.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      className={`w-full h-12 font-black uppercase tracking-wider text-sm shadow-lg ${getChannelColor(selectedChannel)}`}
                      icon={ArrowRight}
                    >
                      Proceed to Verification
                    </Button>
                  </div>
                </form>
              )}

              {/* Card Inputs */}
              {selectedChannel === 'card' && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        required
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                        placeholder="NAME ON CARD"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold uppercase focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1">
                        Card Number
                      </label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                          type="text"
                          required
                          value={cardNumber}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim();
                            setCardNumber(val.slice(0, 19));
                          }}
                          placeholder="4532 0000 0000 0000"
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold tracking-widest focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          required
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          maxLength={5}
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500 outline-none text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1">
                          CVV / CVC
                        </label>
                        <input
                          type="password"
                          required
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value.slice(0, 4))}
                          placeholder="•••"
                          maxLength={4}
                          className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500 outline-none text-center"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-wider text-sm shadow-lg shadow-indigo-100"
                    icon={ShieldCheck}
                  >
                    Pay ৳{grandTotal.toLocaleString()} with 3D Secure
                  </Button>
                </form>
              )}

              {/* Net Banking Inputs */}
              {selectedChannel === 'bank' && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                      Select Bank Portal
                    </label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-emerald-600"
                    >
                      <option value="City Bank Touch">City Bank (City Touch)</option>
                      <option value="Eastern Bank Skybanking">Eastern Bank PLC (Skybanking)</option>
                      <option value="Islami Bank i-Banking">Islami Bank Bangladesh (CellFin / i-Banking)</option>
                      <option value="Dutch Bangla Bank Nexus">Dutch Bangla Bank (NexusPay)</option>
                      <option value="BRAC Bank Astha">BRAC Bank (Astha)</option>
                      <option value="Sonali Bank e-Sheba">Sonali Bank PLC (e-Sheba)</option>
                    </select>
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-800 font-medium">
                    You will be securely routed through your bank's tokenized direct debit gateway.
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-wider text-sm shadow-lg"
                    icon={ArrowRight}
                  >
                    Continue to {selectedBank}
                  </Button>
                </form>
              )}
            </div>
          )}

          {/* STEP 3: VERIFY OTP */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-2">
                  <ShieldCheck size={28} />
                </div>
                <h4 className="text-base font-black text-slate-900 uppercase">Enter Verification Code (OTP)</h4>
                <p className="text-xs text-slate-500">
                  A 6-digit code has been sent to <span className="font-bold font-mono text-slate-800">{accountNumber || 'your phone'}</span>.
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-4 max-w-sm mx-auto">
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="589214"
                    maxLength={6}
                    className="w-full py-3.5 text-center bg-slate-50 border-2 border-indigo-200 rounded-xl text-2xl font-mono font-black tracking-[0.4em] text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-inner"
                    autoFocus
                  />
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500 px-1">
                    <span>
                      {otpTimer > 0 ? (
                        <span className="font-mono text-indigo-600 font-bold">Resend code in {otpTimer}s</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => { setOtpTimer(60); addToast('New OTP sent', 'info'); }}
                          className="font-bold text-indigo-600 hover:underline"
                        >
                          Resend Code
                        </button>
                      )}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Demo OTP: 589214</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-1/3 text-xs"
                    onClick={() => setStep(2)}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className={`w-2/3 h-11 font-black uppercase tracking-wider text-xs shadow-md ${getChannelColor(selectedChannel)}`}
                    icon={Check}
                  >
                    Confirm OTP
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 4: ENTER PIN (FOR MFS) */}
          {step === 4 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center mx-auto mb-2">
                  <Lock size={24} />
                </div>
                <h4 className="text-base font-black text-slate-900 uppercase">
                  Enter {selectedChannel.toUpperCase()} PIN
                </h4>
                <p className="text-xs text-slate-500">
                  Enter your {selectedChannel.toUpperCase()} security PIN to finalize transaction.
                </p>
              </div>

              <form onSubmit={handleVerifyPin} className="space-y-4 max-w-sm mx-auto">
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                    placeholder="•••••"
                    maxLength={5}
                    className="w-full py-3 text-center bg-slate-50 border-2 border-slate-200 rounded-xl text-3xl font-mono font-black tracking-[0.5em] text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all"
                    autoFocus
                  />
                  <p className="text-[10px] text-slate-400 text-center mt-2 font-mono">
                    Simulation Sandbox • Enter any 4-5 digit PIN (e.g. 12345)
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-1/3 text-xs"
                    onClick={() => setStep(3)}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className={`w-2/3 h-12 font-black uppercase tracking-wider text-sm shadow-xl ${getChannelColor(selectedChannel)}`}
                    icon={CheckCircle2}
                  >
                    Pay ৳{grandTotal.toLocaleString()}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 5: REAL-TIME PROCESSING ANIMATION */}
          {step === 5 && (
            <div className="py-10 text-center space-y-6 animate-in zoom-in-95 duration-300">
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-indigo-100 animate-ping opacity-30"></div>
                <div className="w-16 h-16 rounded-full bg-indigo-50 border-2 border-indigo-200 flex items-center justify-center text-indigo-600">
                  <Loader2 size={32} className="animate-spin" />
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">Processing Payment</h4>
                <p className="text-xs text-slate-500 font-medium animate-pulse">{processingMessage}</p>
              </div>

              <div className="max-w-xs mx-auto space-y-1">
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full transition-all duration-500 rounded-full"
                    style={{ width: `${processingProgress}%` }}
                  ></div>
                </div>
                <div className="text-[10px] font-mono font-bold text-slate-400 text-right">{processingProgress}%</div>
              </div>

              <p className="text-[10px] text-slate-400 italic">
                Please do not close this window or refresh the browser.
              </p>
            </div>
          )}

          {/* STEP 6: PAYMENT SUCCESS RECEIPT */}
          {step === 6 && completedTxn && (
            <div className="space-y-6 animate-in zoom-in-95 duration-300">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 size={36} />
                </div>
                <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">Payment Completed!</h4>
                <p className="text-xs text-emerald-600 font-bold">
                  Invoice #{completedTxn.invoiceId} has been successfully settled.
                </p>
              </div>

              {/* Transaction Voucher Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3 relative overflow-hidden" id="receipt-print-area">
                <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider">
                  Verified Paid
                </div>

                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <div className="text-[10px] font-black text-slate-400 uppercase">Transaction ID</div>
                    <div className="text-xs font-mono font-black text-indigo-700 flex items-center gap-1.5">
                      {completedTxn.trxId}
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(completedTxn.trxId);
                          addToast('Transaction ID copied', 'info');
                        }}
                        className="text-slate-400 hover:text-indigo-600"
                        title="Copy TRX ID"
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                  </div>
                  <div className="text-right pr-16">
                    <div className="text-[10px] font-black text-slate-400 uppercase">Amount Paid</div>
                    <div className="text-base font-black text-slate-900">৳{completedTxn.amount.toLocaleString()}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-1">
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase font-bold">Student Name</span>
                    <span className="font-bold text-slate-800 uppercase">{completedTxn.studentName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase font-bold">Student ID / Class</span>
                    <span className="font-bold text-slate-700">{completedTxn.studentId} • {completedTxn.studentClass}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase font-bold">Payment Method</span>
                    <span className="font-bold text-slate-800">{completedTxn.channelName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase font-bold">Bank Reference</span>
                    <span className="font-mono font-bold text-slate-600 text-[11px]">{completedTxn.bankRef}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase font-bold">Fee Category</span>
                    <span className="font-bold text-indigo-600">{completedTxn.feeType}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block uppercase font-bold">Paid On</span>
                    <span className="font-bold text-slate-700 text-[11px]">{completedTxn.paidAt}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <ShieldCheck size={12} className="text-emerald-500" />
                    Authorized by Bangladesh Bank National Payment Switch
                  </span>
                  <span className="font-mono font-bold text-slate-400">STATUS: SETTLED</span>
                </div>
              </div>

              {/* Automated Email Notification Status */}
              <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-4 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Mail size={14} />
                    </div>
                    <div>
                      <span className="font-black text-emerald-950 uppercase text-[11px] flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-emerald-600" />
                        PDF Fee Receipt Auto-Dispatched
                      </span>
                      <p className="text-[10px] text-emerald-700">Official receipt attached directly to parent email</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-200/80 text-emerald-900 font-black px-2.5 py-0.5 rounded-full border border-emerald-300">
                    Delivered
                  </span>
                </div>

                <div className="bg-white/80 rounded-xl p-2.5 border border-emerald-200/80 text-[11px] text-emerald-900 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 font-medium">To Registered Parent:</span>
                    <strong className="font-mono font-bold text-slate-900">
                      {emailSentStatus?.recipientEmail || getRegisteredParentEmail(completedTxn.studentId, completedTxn.studentName)}
                    </strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomEmailValue(emailSentStatus?.recipientEmail || getRegisteredParentEmail(completedTxn.studentId, completedTxn.studentName));
                      setShowCustomEmailInput(!showCustomEmailInput);
                    }}
                    className="text-[10px] font-black uppercase text-indigo-700 hover:text-indigo-900 underline"
                  >
                    {showCustomEmailInput ? 'Hide' : 'Send to another email'}
                  </button>
                </div>

                {showCustomEmailInput && (
                  <div className="pt-2 border-t border-emerald-200/80 flex items-center gap-2 animate-in fade-in-50">
                    <input
                      type="email"
                      value={customEmailValue}
                      onChange={(e) => setCustomEmailValue(e.target.value)}
                      placeholder="e.g. parent.name@gmail.com"
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      disabled={isSendingEmail || !customEmailValue.includes('@')}
                      onClick={async () => {
                        if (!completedTxn) return;
                        setIsSendingEmail(true);
                        try {
                          const res = await sendFeeReceiptEmail({
                            invoice: completedTxn,
                            activeTenant,
                            recipientEmail: customEmailValue,
                            deliveryChannel: 'Manual Resend'
                          });
                          setEmailSentStatus(res);
                          addToast(`PDF receipt sent to ${customEmailValue}!`, 'success');
                          setShowCustomEmailInput(false);
                        } catch (e) {
                          addToast('Failed to dispatch receipt email', 'error');
                        } finally {
                          setIsSendingEmail(false);
                        }
                      }}
                      className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-xs shrink-0"
                    >
                      {isSendingEmail ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                      Email PDF
                    </button>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <Button
                  className="sm:w-1/2 h-11 bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5"
                  icon={isDownloadingReceipt ? Loader2 : Download}
                  disabled={isDownloadingReceipt}
                  onClick={handleDownloadReceiptPDF}
                >
                  {isDownloadingReceipt ? 'Generating PDF...' : 'Download Official PDF'}
                </Button>
                <Button
                  variant="outline"
                  className="sm:w-1/4 h-11 text-xs font-bold"
                  icon={Printer}
                  onClick={() => window.print()}
                >
                  Print
                </Button>
                <Button
                  className="sm:w-1/4 h-11 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider"
                  icon={Check}
                  onClick={onClose}
                >
                  Done
                </Button>
              </div>
            </div>
          )}

          {/* STEP 7: PAYMENT FAILED */}
          {step === 7 && (
            <div className="py-6 text-center space-y-5 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-inner">
                <AlertCircle size={36} />
              </div>

              <div className="space-y-1">
                <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight">Payment Unsuccessful</h4>
                <p className="text-xs text-red-600 font-bold">
                  The payment gateway declined the transaction. No charges were made.
                </p>
                <p className="text-[11px] text-slate-500 pt-1">
                  Reason: Insufficient fund, timeout, or simulated test failure response.
                </p>
              </div>

              <div className="flex gap-3 justify-center pt-2">
                <Button
                  variant="outline"
                  className="h-10 text-xs"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  className="h-10 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase"
                  icon={RefreshCw}
                  onClick={() => {
                    setSimulateFailure(false);
                    setStep(1);
                  }}
                >
                  Retry Payment
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
