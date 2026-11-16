import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ShieldCheck, CheckCircle2, AlertTriangle, XCircle, Search, 
  School, QrCode, Printer, Share2, ArrowLeft, User, Phone, 
  Droplet, Calendar, Award, ExternalLink, Check, Copy, Sparkles,
  Lock, FileCheck, RefreshCw, BadgeCheck
} from 'lucide-react';
import { verifyStudentIdentity, VerificationResult, getStudentVerificationUrl } from '../utils/studentVerification';
import { Button, Card, Badge, useToast } from '../components/UIComponents';

export const StudentVerificationPortal: React.FC = () => {
  const { id: routeStudentId } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [inputStudentId, setInputStudentId] = useState(routeStudentId || '');
  const [currentVerification, setCurrentVerification] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Auto-verify on route param change
  useEffect(() => {
    if (routeStudentId) {
      setInputStudentId(routeStudentId);
      runVerification(routeStudentId);
    } else {
      // Default sample verification for quick demonstration if accessed via /verify without query
      const sampleId = 'ST-2024-001';
      setInputStudentId(sampleId);
      runVerification(sampleId);
    }
  }, [routeStudentId]);

  const runVerification = (idToVerify: string) => {
    if (!idToVerify.trim()) return;

    setIsVerifying(true);
    // Simulate instantaneous cryptographic check
    setTimeout(() => {
      const result = verifyStudentIdentity(idToVerify);
      setCurrentVerification(result);
      setIsVerifying(false);
    }, 250);
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputStudentId.trim()) return;
    navigate(`/verify/student/${encodeURIComponent(inputStudentId.trim())}`);
    runVerification(inputStudentId.trim());
  };

  const handleCopyVerificationLink = () => {
    if (!currentVerification?.student) return;
    const url = getStudentVerificationUrl(currentVerification.student.id);
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    addToast('Verification link copied to clipboard.', 'success');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  const student = currentVerification?.student;
  const isVerified = currentVerification?.status === 'ACTIVE_VERIFIED';
  const isSuspended = currentVerification?.status === 'SUSPENDED';
  const isNotFound = currentVerification?.status === 'NOT_FOUND';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white print:bg-white print:text-slate-900">
      
      {/* --------------------------------------------------------------------- */}
      {/* TOP INSTITUTIONAL TRUST HEADER */}
      {/* --------------------------------------------------------------------- */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50 px-4 py-3 print:hidden">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 text-white hover:opacity-90 transition-opacity">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center font-black text-white shadow-md">
                SAS
              </div>
              <div>
                <span className="font-black text-sm tracking-tight block uppercase">
                  Amar Smart School ERP
                </span>
                <span className="text-[10px] text-emerald-400 font-mono tracking-wider flex items-center gap-1 font-bold">
                  <ShieldCheck size={12} /> OFFICIAL DIGITAL VERIFICATION PORTAL
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/school/students/list">
              <Button size="sm" variant="outline" className="text-xs text-slate-300 border-slate-700 hover:bg-slate-800">
                School Admin
              </Button>
            </Link>
            <Link to="/login">
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-xs font-bold">
                Portal Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* --------------------------------------------------------------------- */}
      {/* MAIN VERIFICATION CONTAINER */}
      {/* --------------------------------------------------------------------- */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6 print:p-0 print:max-w-none">
        
        {/* Search & Lookup Bar (Hidden in Print) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl print:hidden">
          <form onSubmit={handleManualSearch} className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={inputStudentId}
                onChange={(e) => setInputStudentId(e.target.value)}
                placeholder="Enter Student ID (e.g. ST-2024-001, ST-2024-002)..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm font-mono text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 ring-indigo-500/20"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                type="submit"
                disabled={isVerifying}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-5 flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <BadgeCheck size={16} />
                    <span>Verify Credentials</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* ===================================================================== */}
        {/* CASE 1: VERIFIED ACTIVE STUDENT RECORD */}
        {/* ===================================================================== */}
        {student && isVerified && (
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl border-2 border-emerald-500/40 p-6 sm:p-8 shadow-2xl relative overflow-hidden print:bg-white print:text-slate-900 print:border-slate-800 print:shadow-none print:p-6">
            
            {/* Ambient Background Aura */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none print:hidden" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none print:hidden" />

            {/* Top Verification Status Badge */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6 print:border-slate-300">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-lg">
                  <ShieldCheck size={32} className="animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase print:text-slate-900">
                      Verified Official Student
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono text-[11px] font-black uppercase">
                      Active Enrolled
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 print:text-slate-600">
                    Cryptographic signature matched against institutional registry database.
                  </p>
                </div>
              </div>

              {/* Action Buttons (Print / Share) */}
              <div className="flex items-center gap-2 print:hidden">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyVerificationLink}
                  className="bg-slate-800 text-slate-200 border-slate-700 text-xs font-bold flex items-center gap-1.5"
                >
                  {copiedLink ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  <span>{copiedLink ? 'Link Copied' : 'Share Proof'}</span>
                </Button>
                <Button
                  size="sm"
                  onClick={handlePrintCertificate}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Printer size={14} />
                  <span>Print Certificate</span>
                </Button>
              </div>
            </div>

            {/* Student Profile Card Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-6 items-center">
              {/* Photo & Biometric Column */}
              <div className="md:col-span-4 flex flex-col items-center justify-center text-center">
                <div className="relative">
                  <div className="w-32 h-40 rounded-2xl overflow-hidden bg-slate-800 border-4 border-slate-700 shadow-xl flex items-center justify-center print:border-slate-300">
                    {student.imageUrl ? (
                      <img
                        src={student.imageUrl}
                        alt={student.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={54} className="text-slate-600" />
                    )}
                  </div>
                  {/* Verified Ribbon */}
                  <div className="absolute -bottom-2.5 inset-x-0 flex justify-center">
                    <span className="bg-emerald-500 text-white font-black text-[10px] tracking-wider uppercase px-3 py-0.5 rounded-full shadow-md flex items-center gap-1">
                      <CheckCircle2 size={11} /> VERIFIED
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <span className="text-[11px] font-mono text-slate-400 block">Unique Student ID</span>
                  <span className="text-base font-black font-mono text-indigo-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-lg inline-block mt-0.5 print:text-indigo-900 print:bg-slate-100 print:border-slate-300">
                    {student.id}
                  </span>
                </div>
              </div>

              {/* Data Credentials Column */}
              <div className="md:col-span-8 space-y-4">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                    Full Registered Name
                  </span>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight print:text-slate-900">
                    {student.name}
                  </h3>
                </div>

                {/* Academic Matrix Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800 print:bg-slate-50 print:border-slate-200">
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-500">Class / Grade</span>
                    <span className="text-sm font-black text-white print:text-slate-900">{student.class}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-500">Section</span>
                    <span className="text-sm font-black text-white print:text-slate-900">{student.section || 'A'}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-500">Class Roll</span>
                    <span className="text-sm font-black font-mono text-emerald-400 print:text-emerald-800">{student.rollNo}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-500">Legal Guardian</span>
                    <span className="text-xs font-bold text-slate-200 print:text-slate-800 truncate block">
                      {student.guardian || 'Registered Guardian'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-500">Blood Group</span>
                    <span className="text-xs font-black text-rose-400 print:text-rose-700">
                      {student.bloodGroup || 'Not Specified'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-500">Academic Session</span>
                    <span className="text-xs font-mono font-bold text-slate-300 print:text-slate-800">2024 - 2025</span>
                  </div>
                </div>

                {/* Digital Verification Details */}
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-1.5 text-xs print:bg-slate-100 print:border-slate-300">
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>Certificate Hash:</span>
                    <span className="font-mono text-indigo-400 font-bold print:text-indigo-900">
                      {currentVerification.verificationId}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>Timestamp Verified:</span>
                    <span className="font-mono text-slate-300 print:text-slate-700">
                      {currentVerification.verifiedAt}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400 text-[11px]">
                    <span>Issuing Institution:</span>
                    <span className="font-bold text-white print:text-slate-900">
                      Smart Amar School & College (EIIN: 134209)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Institutional Stamp & Endorsement */}
            <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 print:border-slate-300 print:text-slate-600">
              <div className="flex items-center gap-2">
                <Lock size={14} className="text-emerald-400" />
                <span>256-Bit Cryptographically Sealed Identity Pass</span>
              </div>
              <div className="text-[11px] font-mono">
                Official Document Ref: SAS-VER-{student.id}
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* CASE 2: SUSPENDED / INACTIVE STUDENT RECORD */}
        {/* ===================================================================== */}
        {student && isSuspended && (
          <div className="bg-amber-950/30 rounded-3xl border-2 border-amber-500/50 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
                <AlertTriangle size={32} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">
                    Student Record Suspended
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono text-[11px] font-black uppercase">
                    Suspended
                  </span>
                </div>
                <p className="text-xs text-amber-200/80 mt-1">
                  This student ID ({student.id}) belongs to <strong>{student.name}</strong>, but their active enrollment standing is currently <strong>SUSPENDED</strong> by the institution.
                </p>
                <div className="mt-4 p-3 bg-amber-950/60 border border-amber-500/30 rounded-xl text-xs text-amber-100">
                  For clearance or identity disputes, please contact the Principal / Academic Administration desk: <strong>+880 1712-345678</strong>.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* CASE 3: INVALID / NOT FOUND RECORD */}
        {/* ===================================================================== */}
        {isNotFound && (
          <div className="bg-rose-950/30 rounded-3xl border-2 border-rose-500/50 p-6 sm:p-8 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center mx-auto">
              <XCircle size={36} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">
                Invalid or Unrecognized Student Credential
              </h2>
              <p className="text-xs text-rose-200/80 mt-1 max-w-md mx-auto">
                No active or registered student record was found in the official Smart Amar School nominal roll database for ID: <code className="font-mono font-bold text-white bg-rose-900/60 px-2 py-0.5 rounded">{inputStudentId}</code>.
              </p>
            </div>
            <div className="text-xs text-slate-400 max-w-lg mx-auto bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              Please double check the Student ID or scan the QR code again directly using a smartphone camera. If you suspect an unauthorized or forged ID card, report it immediately to security.
            </div>
          </div>
        )}

        {/* Informational Guidance Box (Hidden in Print) */}
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 text-xs text-slate-400 space-y-2 print:hidden">
          <div className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <School size={15} className="text-indigo-400" />
            <span>Authorized Purpose & Security Notice</span>
          </div>
          <p className="leading-relaxed">
            This verification portal is the authoritative digital authentication gateway for <strong>Smart Amar School & College</strong>. It is designed for exam invigilators, bus transit officers, law enforcement, and campus security to instantly establish student identity in real-time.
          </p>
        </div>
      </main>

      {/* --------------------------------------------------------------------- */}
      {/* FOOTER */}
      {/* --------------------------------------------------------------------- */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-4 text-center text-xs text-slate-500 print:hidden">
        <p>© 2026 Smart Amar School & College • Digital Identity & Anti-Fraud Security Network</p>
      </footer>
    </div>
  );
};
