import React from 'react';
import { 
  FileBadge, Receipt, Users, FileText, Eye, CheckCircle2, Award, DollarSign,
  HeartPulse, Scale, GraduationCap, Building2, CalendarClock
} from 'lucide-react';
import { SchoolDocument } from '../types';

interface DocumentThumbnailProps {
  document: SchoolDocument;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
}

export const DocumentThumbnail: React.FC<DocumentThumbnailProps> = ({
  document: doc,
  size = 'md',
  onClick,
  className = ''
}) => {
  const isCert = doc.category === 'academic-certificates';
  const isFee = doc.category === 'fee-receipts';
  const isRecord = doc.category === 'student-records';
  const isMedical = doc.category === 'medical';
  const isLegal = doc.category === 'legal';
  const isAcademic = doc.category === 'academic';
  const isImage = (doc.fileType && doc.fileType.startsWith('image/')) || 
                  doc.fileName.match(/\.(png|jpg|jpeg|webp)$/i);

  // Height and dimensions by size
  const heightClass = 
    size === 'sm' ? 'h-16 w-20' :
    size === 'lg' ? 'h-40 w-full' :
    'h-28 w-full';

  return (
    <div 
      onClick={onClick}
      className={`relative rounded-xl overflow-hidden border cursor-pointer group transition-all duration-200 select-none ${heightClass} ${
        isMedical ? 'border-rose-200 bg-rose-50/40 hover:border-rose-400' :
        isLegal ? 'border-amber-200 bg-amber-50/40 hover:border-amber-400' :
        isCert ? 'border-purple-200 bg-purple-50/50 hover:border-purple-400' :
        isFee ? 'border-emerald-200 bg-emerald-50/40 hover:border-emerald-400' :
        isRecord ? 'border-indigo-200 bg-indigo-50/40 hover:border-indigo-400' :
        isAcademic ? 'border-blue-200 bg-blue-50/40 hover:border-blue-400' :
        'border-slate-200 bg-slate-50 hover:border-slate-300'
      } ${className}`}
    >
      {/* 1. Real Image Thumbnail */}
      {isImage && doc.contentUrl ? (
        <div className="w-full h-full relative overflow-hidden bg-slate-900/5">
          <img 
            src={doc.contentUrl} 
            alt={doc.title} 
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : isMedical ? (
        /* Medical Health Record Miniature */
        <div className="w-full h-full p-2.5 flex flex-col justify-between border border-rose-300/60 rounded-lg bg-gradient-to-b from-white to-rose-50/60 text-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[7.5px] font-black uppercase tracking-wider text-rose-800 flex items-center gap-0.5">
              <HeartPulse size={9} className="text-rose-600" />
              <span>HEALTH RECORD</span>
            </span>
            <span className="text-[7px] font-black bg-rose-100 text-rose-800 px-1 py-0.2 rounded">
              MED
            </span>
          </div>

          <div className="my-auto px-0.5">
            <div className="text-[9.5px] font-bold text-slate-900 truncate">
              {doc.studentName || doc.title}
            </div>
            <div className="text-[7.5px] text-rose-900/70 truncate mt-0.5 flex items-center gap-0.5">
              <Building2 size={8} className="shrink-0" />
              <span className="truncate">{doc.issuingAuthority || 'Civil Surgeon Office'}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[7px] text-slate-400 pt-1 border-t border-rose-100">
            <span className="truncate text-rose-700 font-semibold">{doc.certificateType || 'Clearance'}</span>
            <span className="font-mono text-slate-500">Exp: {doc.expiryDate || 'Permanent'}</span>
          </div>
        </div>
      ) : isLegal ? (
        /* Legal & Affidavit Miniature */
        <div className="w-full h-full p-2.5 flex flex-col justify-between border-2 border-amber-400/50 rounded-lg bg-gradient-to-b from-white to-amber-50/60 text-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[7.5px] font-black uppercase tracking-wider text-amber-800 flex items-center gap-0.5">
              <Scale size={9} className="text-amber-600" />
              <span>LEGAL AFFIDAVIT</span>
            </span>
            <span className="text-[7px] font-black bg-amber-100 text-amber-900 px-1 py-0.2 rounded font-mono">
              NOTARY
            </span>
          </div>

          <div className="my-auto px-0.5">
            <div className="text-[9.5px] font-bold text-slate-900 truncate">
              {doc.studentName || doc.title}
            </div>
            <div className="text-[7.5px] text-amber-900/70 truncate mt-0.5 flex items-center gap-0.5">
              <Building2 size={8} className="shrink-0" />
              <span className="truncate">{doc.issuingAuthority || 'Magistrate Court'}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[7px] text-slate-400 pt-1 border-t border-amber-200/60">
            <span className="truncate text-amber-800 font-semibold">{doc.certificateType || 'Affidavit'}</span>
            <span className="font-mono text-slate-500">Exp: {doc.expiryDate || 'Permanent'}</span>
          </div>
        </div>
      ) : isAcademic ? (
        /* Academic Credential Miniature */
        <div className="w-full h-full p-2.5 flex flex-col justify-between border border-blue-300/60 rounded-lg bg-gradient-to-b from-white to-blue-50/50 text-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[7.5px] font-black uppercase tracking-wider text-blue-800 flex items-center gap-0.5">
              <GraduationCap size={9} className="text-blue-600" />
              <span>ACADEMIC RECORD</span>
            </span>
            <span className="text-[7px] font-mono text-blue-900/60 font-bold">{doc.id}</span>
          </div>

          <div className="my-auto px-0.5">
            <div className="text-[9.5px] font-bold text-slate-900 truncate">
              {doc.studentName || doc.title}
            </div>
            <div className="text-[7.5px] text-slate-500 truncate mt-0.5">
              {doc.issuingAuthority || 'Ministry of Education'}
            </div>
          </div>

          <div className="flex items-center justify-between text-[7px] text-slate-400 pt-1 border-t border-blue-100">
            <span className="truncate">{doc.studentClass || 'Class 10'}</span>
            <span className="text-emerald-700 font-bold flex items-center gap-0.5">
              <CheckCircle2 size={8} />
              <span>VALID</span>
            </span>
          </div>
        </div>
      ) : isCert ? (
        /* 2. Certificate Miniature Thumbnail */
        <div className="w-full h-full p-2.5 flex flex-col justify-between border-2 border-double border-purple-400/40 rounded-lg bg-gradient-to-b from-purple-50/70 to-purple-100/40 text-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[7.5px] font-black uppercase tracking-wider text-purple-900 flex items-center gap-0.5">
              <Award size={9} className="text-purple-600" />
              <span>CERTIFICATE</span>
            </span>
            <span className="text-[7px] font-mono text-purple-900/60 font-bold">{doc.id}</span>
          </div>

          <div className="text-center px-1 my-auto">
            <div className="text-[10px] font-bold text-indigo-950 truncate font-serif">
              {doc.studentName || 'Student Certificate'}
            </div>
            <div className="text-[8px] text-purple-900 font-medium truncate mt-0.5">
              {doc.certificateType || 'Merit & Conduct'}
            </div>
          </div>

          <div className="flex items-center justify-between text-[7px] text-slate-500 pt-1 border-t border-purple-200">
            <span className="truncate">{doc.studentClass || 'Class 10'}</span>
            <span className="text-emerald-700 font-bold flex items-center gap-0.5">
              <CheckCircle2 size={8} />
              <span>SEAL</span>
            </span>
          </div>
        </div>
      ) : isFee ? (
        /* 3. Fee Receipt Miniature Thumbnail */
        <div className="w-full h-full p-2.5 flex flex-col justify-between border border-emerald-400/50 rounded-lg bg-gradient-to-b from-white to-emerald-50/50 text-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[7.5px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-0.5">
              <Receipt size={9} className="text-emerald-600" />
              <span>FEE VOUCHER</span>
            </span>
            <span className="text-[7.5px] font-black bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded">
              PAID
            </span>
          </div>

          <div className="my-auto flex items-center justify-between px-0.5">
            <div className="min-w-0 pr-1">
              <div className="text-[9.5px] font-bold text-slate-900 truncate">
                {doc.studentName || 'Fee Payment'}
              </div>
              <div className="text-[8px] font-mono text-slate-500 truncate">
                {doc.transactionId || doc.id}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[11px] font-black font-mono text-emerald-700">
                ৳{(doc.amount || 1500).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[7px] text-slate-400 pt-1 border-t border-emerald-100">
            <span>{doc.studentClass || 'Academic Fee'}</span>
            <span className="font-mono text-slate-500">
              {new Date(doc.uploadedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      ) : isRecord ? (
        /* 4. Student Record Dossier Miniature Thumbnail */
        <div className="w-full h-full p-2.5 flex flex-col justify-between border border-indigo-200 rounded-lg bg-gradient-to-b from-white to-indigo-50/40 text-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[7.5px] font-black uppercase tracking-wider text-indigo-800 flex items-center gap-0.5">
              <Users size={9} className="text-indigo-600" />
              <span>STUDENT DOSSIER</span>
            </span>
            <span className="text-[7px] font-mono bg-indigo-100 text-indigo-700 font-bold px-1 rounded">
              {doc.studentId || doc.id}
            </span>
          </div>

          <div className="my-auto flex items-center gap-1.5 px-0.5">
            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-[9px] shrink-0">
              {doc.studentName ? doc.studentName.charAt(0) : 'S'}
            </div>
            <div className="min-w-0">
              <div className="text-[9.5px] font-bold text-slate-900 truncate">
                {doc.studentName || doc.title}
              </div>
              <div className="text-[7.5px] text-slate-500 truncate">
                {doc.studentClass || 'Enrolled Student'} • Roll #{doc.studentRoll || '101'}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[7px] text-slate-400 pt-1 border-t border-indigo-100">
            <span className="truncate max-w-[90px]">{doc.fileName}</span>
            <span className="text-emerald-700 font-bold">VERIFIED</span>
          </div>
        </div>
      ) : (
        /* 5. Generic Document Miniature Thumbnail */
        <div className="w-full h-full p-2.5 flex flex-col justify-between border border-slate-200 rounded-lg bg-white text-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-[7.5px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-0.5">
              <FileText size={9} />
              <span>OFFICIAL DOC</span>
            </span>
            <span className="text-[7px] font-mono text-slate-400">{doc.id}</span>
          </div>

          <div className="my-auto px-1">
            <div className="text-[9.5px] font-bold text-slate-800 truncate">
              {doc.title}
            </div>
            <div className="text-[7.5px] font-mono text-slate-400 truncate mt-0.5">
              {doc.fileName}
            </div>
          </div>

          <div className="flex items-center justify-between text-[7px] text-slate-400 pt-1 border-t border-slate-100">
            <span>{doc.folder}</span>
            <span className="font-mono">{new Date(doc.uploadedAt).toLocaleDateString()}</span>
          </div>
        </div>
      )}

      {/* Hover Inspect Preview Overlay */}
      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 backdrop-blur-2xs">
        <span className="px-2.5 py-1 rounded-lg bg-white/95 text-slate-900 font-bold text-[10.5px] flex items-center gap-1 shadow-md transform scale-95 group-hover:scale-100 transition-transform">
          <Eye size={12} className="text-indigo-600" />
          <span>Inspect Preview</span>
        </span>
      </div>
    </div>
  );
};
