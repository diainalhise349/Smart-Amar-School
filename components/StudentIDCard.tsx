import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, QrCode, Phone, Droplet, User, CheckCircle2, 
  ExternalLink, Copy, Check, RotateCw, AlertTriangle, Building2,
  Calendar, Award, Sparkles, Hash, AlertCircle, FileBadge
} from 'lucide-react';
import { Student } from '../types';
import { generateStudentQrDataUrl, getStudentVerificationUrl, generateVerificationToken } from '../utils/studentVerification';
import { useToast } from './UIComponents';

export type IDCardTheme = 'navy' | 'crimson' | 'emerald' | 'slate';

export interface StudentIDCardProps {
  student: Student;
  theme?: IDCardTheme;
  orientation?: 'portrait' | 'landscape';
  showBack?: boolean;
  onFlip?: () => void;
  expiryDate?: string;
  issueDate?: string;
  institutionName?: string;
  eiinNumber?: string;
  showSignature?: boolean;
  showBloodGroup?: boolean;
  showEmergencyPhone?: boolean;
  className?: string;
}

export const StudentIDCard: React.FC<StudentIDCardProps> = ({
  student,
  theme = 'navy',
  orientation = 'portrait',
  showBack: externalShowBack,
  onFlip,
  expiryDate = '31 Dec 2025',
  issueDate = '01 Jan 2024',
  institutionName = 'SMART AMAR SCHOOL & COLLEGE',
  eiinNumber = 'EIIN: 134209 • Code: 2041',
  showSignature = true,
  showBloodGroup = true,
  showEmergencyPhone = true,
  className = ''
}) => {
  const { addToast } = useToast();
  const [internalShowBack, setInternalShowBack] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Controlled or uncontrolled back view
  const isBack = externalShowBack !== undefined ? externalShowBack : internalShowBack;

  // Generate QR Code on student change
  useEffect(() => {
    let isMounted = true;
    generateStudentQrDataUrl(student, { size: 180 })
      .then((url) => {
        if (isMounted) setQrDataUrl(url);
      })
      .catch((err) => console.error(err));

    return () => {
      isMounted = false;
    };
  }, [student]);

  const verificationUrl = getStudentVerificationUrl(student.id);
  const verificationToken = generateVerificationToken(student);

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(verificationUrl);
    setCopiedLink(true);
    addToast('Verification link copied to clipboard.', 'success');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleToggleFlip = () => {
    if (onFlip) {
      onFlip();
    } else {
      setInternalShowBack(!internalShowBack);
    }
  };

  // Theme gradient & styling presets
  const themeStyles = {
    navy: {
      headerBg: 'bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900',
      accentColor: 'text-amber-400',
      badgeBg: 'bg-amber-400 text-slate-950 font-black',
      borderAccent: 'border-amber-400/40',
      primaryText: 'text-indigo-950',
      footerBar: 'bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-950 text-white',
      avatarRing: 'ring-amber-400 ring-2'
    },
    crimson: {
      headerBg: 'bg-gradient-to-r from-rose-900 via-red-900 to-amber-950',
      accentColor: 'text-amber-300',
      badgeBg: 'bg-amber-300 text-rose-950 font-black',
      borderAccent: 'border-amber-300/40',
      primaryText: 'text-rose-950',
      footerBar: 'bg-gradient-to-r from-rose-950 via-red-950 to-amber-950 text-white',
      avatarRing: 'ring-amber-300 ring-2'
    },
    emerald: {
      headerBg: 'bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900',
      accentColor: 'text-emerald-300',
      badgeBg: 'bg-emerald-400 text-emerald-950 font-black',
      borderAccent: 'border-emerald-300/40',
      primaryText: 'text-emerald-950',
      footerBar: 'bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 text-white',
      avatarRing: 'ring-emerald-400 ring-2'
    },
    slate: {
      headerBg: 'bg-gradient-to-r from-slate-900 via-gray-900 to-zinc-950',
      accentColor: 'text-cyan-400',
      badgeBg: 'bg-cyan-400 text-slate-950 font-black',
      borderAccent: 'border-cyan-400/40',
      primaryText: 'text-slate-900',
      footerBar: 'bg-gradient-to-r from-slate-950 via-gray-950 to-zinc-950 text-white',
      avatarRing: 'ring-cyan-400 ring-2'
    }
  }[theme];

  return (
    <div className={`relative group inline-block select-none ${className}`}>
      {/* 
        CR-80 Standard Credit Card Dimension Ratio: 85.6mm x 53.98mm (Approx 1.586 ratio).
        In pixels: ~320px x 490px in Portrait, or 490px x 310px in Landscape.
      */}
      <div 
        onClick={handleToggleFlip}
        className={`w-[310px] h-[480px] rounded-2xl shadow-xl overflow-hidden cursor-pointer transition-all duration-300 relative border border-slate-200/90 bg-white flex flex-col justify-between hover:shadow-2xl hover:-translate-y-0.5 print:shadow-none print:border-slate-400 print:hover:translate-y-0`}
      >
        {/* ========================================================================= */}
        {/* FRONT OF THE CARD */}
        {/* ========================================================================= */}
        {!isBack && (
          <div className="h-full flex flex-col justify-between relative bg-radial from-white via-slate-50/50 to-slate-100/80">
            {/* Hologram Simulated Watermark Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-indigo-500/[0.03] to-amber-500/[0.04] pointer-events-none" />

            {/* Top Institutional Header */}
            <div className={`${themeStyles.headerBg} p-3 text-white relative overflow-hidden shadow-xs shrink-0`}>
              {/* Subtle Guilloche Pattern Overlay */}
              <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full border border-white/10 pointer-events-none" />
              <div className="absolute -left-6 -top-6 w-20 h-20 rounded-full border border-white/10 pointer-events-none" />

              <div className="flex items-center gap-2 relative z-10">
                {/* School Emblem Badge */}
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 flex flex-col items-center justify-center shrink-0 text-white font-black shadow-2xs">
                  <span className="text-[10px] font-black tracking-tight leading-none">SAS</span>
                  <span className="text-[6.5px] font-mono tracking-widest text-amber-300">EST.98</span>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-[11px] font-black uppercase tracking-tight text-white truncate leading-tight">
                    {institutionName}
                  </h3>
                  <div className="flex items-center justify-between text-[8px] text-slate-300 font-mono mt-0.5">
                    <span>{eiinNumber}</span>
                    <span className="text-amber-300 font-bold">2024-25</span>
                  </div>
                </div>
              </div>

              {/* Card Sub-banner */}
              <div className="mt-1.5 pt-1 border-t border-white/10 flex items-center justify-between">
                <span className="text-[8.5px] font-black uppercase tracking-wider text-amber-300">
                  STUDENT IDENTITY CARD
                </span>
                <span className="text-[7.5px] font-mono uppercase bg-white/20 text-white px-1.5 py-0.2 rounded font-bold">
                  OFFICIAL PASS
                </span>
              </div>
            </div>

            {/* Middle Section: Student Photograph & Primary Credentials */}
            <div className="px-3.5 pt-2 pb-1 flex flex-col items-center flex-1 justify-around">
              {/* Photo Frame with Security Badge */}
              <div className="relative">
                <div className={`w-24 h-28 rounded-xl overflow-hidden bg-slate-100 border-2 ${themeStyles.borderAccent} shadow-md relative flex items-center justify-center`}>
                  {student.imageUrl ? (
                    <img 
                      src={student.imageUrl} 
                      alt={student.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <User size={36} className="text-slate-300" />
                      <span className="text-[9px] font-mono mt-1 font-bold">PHOTO</span>
                    </div>
                  )}

                  {/* Anti-Fraud Micro Hologram Badge */}
                  <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-gradient-to-tr from-amber-400 via-rose-300 to-indigo-400 shadow-xs flex items-center justify-center text-[7px] font-black text-slate-900 border border-white">
                    ★
                  </div>
                </div>

                {/* Status Pill Badge */}
                <div className="absolute -bottom-2 inset-x-0 flex justify-center">
                  <span className={`text-[8.5px] uppercase tracking-wider px-2 py-0.5 rounded-full font-black shadow-xs ${
                    student.status === 'Active' 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-rose-500 text-white'
                  }`}>
                    {student.status || 'Active'}
                  </span>
                </div>
              </div>

              {/* Student Name & ID */}
              <div className="text-center w-full mt-2">
                <h4 className="font-black text-sm text-slate-900 uppercase tracking-tight truncate px-1">
                  {student.name}
                </h4>
                <div className="inline-flex items-center gap-1.5 mt-0.5 bg-slate-100 text-indigo-950 border border-slate-200 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold">
                  <span>ID:</span>
                  <span className="font-black text-indigo-700">{student.id}</span>
                </div>
              </div>

              {/* Academic Grid Matrix */}
              <div className="w-full grid grid-cols-3 gap-1 bg-slate-50 border border-slate-200/80 rounded-xl p-1.5 my-1 text-center">
                <div className="border-r border-slate-200 pr-1">
                  <span className="block text-[7.5px] uppercase font-bold text-slate-600">Class</span>
                  <span className="text-[10px] font-black text-slate-800">{student.class}</span>
                </div>
                <div className="border-r border-slate-200 px-1">
                  <span className="block text-[7.5px] uppercase font-bold text-slate-600">Section</span>
                  <span className="text-[10px] font-black text-slate-800">{student.section || 'A'}</span>
                </div>
                <div className="pl-1">
                  <span className="block text-[7.5px] uppercase font-bold text-slate-600">Roll No</span>
                  <span className="text-[10px] font-black font-mono text-indigo-700">{student.rollNo}</span>
                </div>
              </div>

              {/* Lower Profile & QR Code Row */}
              <div className="w-full flex items-center justify-between gap-2 px-1">
                {/* Left Attributes */}
                <div className="flex-1 space-y-1 text-[9.5px]">
                  {showBloodGroup && student.bloodGroup && (
                    <div className="flex items-center gap-1 text-slate-700 font-bold">
                      <Droplet size={11} className="text-rose-600 fill-rose-600" />
                      <span>Blood: <strong className="text-rose-700 font-black">{student.bloodGroup}</strong></span>
                    </div>
                  )}

                  {showEmergencyPhone && (
                    <div className="flex items-center gap-1 text-slate-700 font-bold">
                      <Phone size={11} className="text-indigo-600" />
                      <span className="truncate max-w-[125px]">
                        Mob: <strong className="font-mono text-[9px]">{student.phone || '01712-345678'}</strong>
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-slate-500 font-medium text-[8px]">
                    <Calendar size={10} className="text-slate-400" />
                    <span>Valid Thru: <strong className="text-slate-800">{expiryDate}</strong></span>
                  </div>
                </div>

                {/* Right Scannable Dynamic QR Code */}
                <div className="flex flex-col items-center shrink-0">
                  <div className="p-1 bg-white rounded-lg border-2 border-indigo-950/20 shadow-xs">
                    {qrDataUrl ? (
                      <img 
                        src={qrDataUrl} 
                        alt="Dynamic Verification QR Code" 
                        className="w-14 h-14 object-contain"
                      />
                    ) : (
                      <div className="w-14 h-14 bg-slate-100 flex items-center justify-center">
                        <QrCode size={20} className="text-slate-400 animate-pulse" />
                      </div>
                    )}
                  </div>
                  <span className="text-[6.5px] font-black uppercase text-indigo-900 tracking-wider mt-0.5 flex items-center gap-0.5">
                    <ShieldCheck size={7} className="text-emerald-600" />
                    Scan to Verify
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Security Microprint Footer */}
            <div className={`${themeStyles.footerBar} px-3 py-1.5 flex items-center justify-between text-[7px] font-mono tracking-tight shrink-0`}>
              <span className="uppercase text-amber-300 font-bold">SMART AMAR SCHOOL ERP</span>
              <span className="opacity-80">VER: {student.id}</span>
              <span className="flex items-center gap-0.5 text-emerald-300 font-bold">
                <CheckCircle2 size={8} /> SECURE PASS
              </span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* BACK OF THE CARD */}
        {/* ========================================================================= */}
        {isBack && (
          <div className="h-full flex flex-col justify-between relative bg-radial from-slate-50 via-white to-slate-100 p-3.5 text-slate-800 text-[9px]">
            {/* Top Institutional Header Back */}
            <div className="border-b border-slate-200 pb-2 text-center">
              <h4 className="font-black uppercase text-[10.5px] text-slate-900 tracking-tight">
                {institutionName}
              </h4>
              <p className="text-[7.5px] text-slate-500 font-medium">
                Academic Administration & Security Department
              </p>
            </div>

            {/* Official Instructions & Terms */}
            <div className="space-y-1.5 text-[8px] text-slate-600 py-1">
              <div className="font-bold text-slate-900 uppercase text-[8.5px] flex items-center gap-1 text-indigo-900">
                <AlertCircle size={10} /> Cardholder Instructions:
              </div>
              <ul className="list-disc pl-3.5 space-y-0.5 leading-snug">
                <li>This card is non-transferable and remains institutional property.</li>
                <li>Must be worn prominently during school hours, exams, and transport.</li>
                <li>Loss or damage must be reported immediately to the admin desk.</li>
                <li>Tampering or forging identity credentials is a serious offense.</li>
              </ul>
            </div>

            {/* Return Notice & Emergency Contacts */}
            <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-2 text-[8px] space-y-1">
              <div className="font-bold text-indigo-950 flex items-center justify-between">
                <span>CAMPUS ASSISTANCE HOTLINE</span>
                <span className="font-mono text-indigo-700">999 / +880 1712-345678</span>
              </div>
              <p className="text-slate-600 text-[7.5px] leading-tight">
                If found, kindly drop in any post box or return to: <br/>
                <strong className="text-slate-800">Plot 14, Academic Avenue, Dhanmondi, Dhaka - 1209</strong>
              </p>
            </div>

            {/* Dates & Issue Details */}
            <div className="grid grid-cols-2 gap-2 text-[8px] font-mono border-t border-slate-200 pt-1.5">
              <div>
                <span className="block text-slate-400 text-[7px] uppercase font-sans font-bold">Issue Date</span>
                <span className="font-bold text-slate-700">{issueDate}</span>
              </div>
              <div className="text-right">
                <span className="block text-slate-400 text-[7px] uppercase font-sans font-bold">Expiry Date</span>
                <span className="font-bold text-rose-700">{expiryDate}</span>
              </div>
            </div>

            {/* Authorized Signature & Official Seal */}
            <div className="flex items-end justify-between pt-1 border-t border-slate-200/80">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full border-2 border-indigo-900/30 flex flex-col items-center justify-center text-indigo-950/40 text-[6.5px] font-black uppercase leading-none transform -rotate-12 pointer-events-none select-none">
                  <span>OFFICIAL</span>
                  <span className="text-[5.5px]">ACADEMIC</span>
                  <span>SEAL</span>
                </div>
              </div>

              {showSignature && (
                <div className="text-center pr-2">
                  <div className="font-serif italic text-indigo-900 text-xs font-bold transform -rotate-2 select-none">
                    M. Rahman
                  </div>
                  <div className="w-24 h-0.5 bg-slate-400 mt-0.5 mb-0.5" />
                  <span className="block text-[7px] font-black uppercase text-slate-500 tracking-wider">
                    Principal's Signature
                  </span>
                </div>
              )}
            </div>

            {/* Barcode & Security Hash Bar */}
            <div className="pt-1 border-t border-slate-200 flex flex-col items-center justify-center">
              {/* Simulated Code 128 Barcode */}
              <div className="flex items-center gap-[1.5px] h-6 w-full justify-center opacity-85">
                {[2, 1, 3, 1, 2, 4, 1, 2, 3, 1, 1, 2, 4, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1, 2, 1, 3, 2, 4, 1, 2].map((w, idx) => (
                  <div 
                    key={idx} 
                    className="bg-slate-900 h-full" 
                    style={{ width: `${w * 1.3}px` }} 
                  />
                ))}
              </div>
              <span className="font-mono text-[7.5px] font-bold text-slate-600 tracking-widest mt-0.5">
                *{student.id}*
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Hover / Action Toolbar (Hidden in Print) */}
      <div className="mt-2 flex items-center justify-center gap-1.5 print:hidden">
        <button
          type="button"
          onClick={handleToggleFlip}
          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
          title="Flip card between Front and Back"
        >
          <RotateCw size={12} />
          <span>{isBack ? 'Show Front' : 'Show Back'}</span>
        </button>

        <button
          type="button"
          onClick={handleCopyLink}
          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer shadow-2xs"
          title="Copy Verification URL"
        >
          {copiedLink ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
        </button>

        <a
          href={verificationUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors cursor-pointer shadow-2xs"
          title="Open Public Verification Portal"
        >
          <ExternalLink size={13} />
        </a>
      </div>
    </div>
  );
};
