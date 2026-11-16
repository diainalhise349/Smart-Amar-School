import React, { useRef, useState, useEffect } from 'react';
import { 
  PenTool, Upload, Eraser, Sparkles, Trash2, CheckCircle2, 
  ShieldCheck, FileCheck, Calendar, User, Award, Stamp
} from 'lucide-react';

export interface SignaturePadFieldProps {
  id: string;
  title: string;
  subtitle: string;
  declarationText: string;
  signatoryName: string;
  onSignatoryNameChange: (val: string) => void;
  signatoryNameLabel?: string;
  signatoryNamePlaceholder?: string;
  signDate: string;
  onSignDateChange: (val: string) => void;
  signatureData?: string;
  onSignatureChange: (dataUrl: string) => void;
  signatureType: 'draw' | 'upload';
  onSignatureTypeChange: (type: 'draw' | 'upload') => void;
  isRepresentative?: boolean;
  designation?: string;
  onDesignationChange?: (val: string) => void;
  status?: string;
  onStatusChange?: (val: string) => void;
  sampleSignatureSvg?: string;
  required?: boolean;
  accentColor?: 'blue' | 'emerald';
}

export const SignaturePadField: React.FC<SignaturePadFieldProps> = ({
  id,
  title,
  subtitle,
  declarationText,
  signatoryName,
  onSignatoryNameChange,
  signatoryNameLabel = 'Signatory Full Name',
  signatoryNamePlaceholder = 'Enter full legal name',
  signDate,
  onSignDateChange,
  signatureData = '',
  onSignatureChange,
  signatureType,
  onSignatureTypeChange,
  isRepresentative = false,
  designation = '',
  onDesignationChange,
  status = 'Approved',
  onStatusChange,
  sampleSignatureSvg,
  required = false,
  accentColor = 'blue'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState<string>(accentColor === 'emerald' ? '#047857' : '#1e3a8a');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');

  // Synchronize canvas if signatureData is cleared or updated from outside
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!signatureData) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    } else if (signatureType === 'draw') {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = signatureData;
    }
  }, [signatureData, signatureType]);

  // Coordinate helper that handles responsiveness & canvas scale
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if ('touches' in e) {
      e.preventDefault();
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    if ('touches' in e) {
      e.preventDefault();
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSignatureChange(dataUrl);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    onSignatureChange('');
    setUploadedFileName('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        onSignatureChange(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplySample = () => {
    if (!sampleSignatureSvg) return;
    onSignatureChange(sampleSignatureSvg);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = sampleSignatureSvg;
      }
    }
  };

  const hasValidSignature = Boolean(signatureData && signatureData.trim().length > 0);

  return (
    <div className="border border-emerald-600/70 bg-white p-3 rounded-none flex flex-col justify-between h-full">
      <div>
        {/* Header with Title and Verification Pill */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2.5">
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
              {isRepresentative ? (
                <ShieldCheck size={14} className="text-emerald-700" />
              ) : (
                <FileCheck size={14} className="text-indigo-600" />
              )}
              {title} {required && <span className="text-rose-600 font-bold">*</span>}
            </h4>
            <p className="text-[10px] text-slate-500 font-medium">{subtitle}</p>
          </div>

          <div className="flex items-center gap-1.5">
            {hasValidSignature ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-sm">
                <CheckCircle2 size={11} className="text-emerald-600" />
                Signed & Verified
              </span>
            ) : (
              <span className="inline-flex items-center text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-sm">
                Awaiting Signature
              </span>
            )}
          </div>
        </div>

        {/* Declaration Statement */}
        <div className="bg-slate-50 border-l-2 border-emerald-600 p-2 mb-3 text-[10.5px] text-slate-600 italic leading-relaxed">
          "{declarationText}"
        </div>

        {/* Signatory Fields (Name, Designation, Date) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
          <div>
            <label className="block text-[10.5px] font-semibold text-slate-700 mb-0.5">
              {signatoryNameLabel} {required && <span className="text-rose-600">*</span>}
            </label>
            <div className="relative">
              <input
                type="text"
                value={signatoryName}
                onChange={(e) => onSignatoryNameChange(e.target.value)}
                placeholder={signatoryNamePlaceholder}
                className="w-full border border-emerald-600 px-2 py-1 pl-6 text-xs outline-none focus:ring-1 focus:ring-emerald-700 rounded-none bg-white text-slate-800 font-medium"
              />
              <User size={12} className="absolute left-1.5 top-2 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="block text-[10.5px] font-semibold text-slate-700 mb-0.5">
              Date of Signing
            </label>
            <div className="relative">
              <input
                type="date"
                value={signDate}
                onChange={(e) => onSignDateChange(e.target.value)}
                className="w-full border border-emerald-600 px-2 py-1 pl-6 text-xs outline-none focus:ring-1 focus:ring-emerald-700 rounded-none bg-white text-slate-800"
              />
              <Calendar size={12} className="absolute left-1.5 top-2 text-slate-400" />
            </div>
          </div>
        </div>

        {/* School Representative Specific Fields */}
        {isRepresentative && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
            <div>
              <label className="block text-[10.5px] font-semibold text-slate-700 mb-0.5">
                Authority Designation
              </label>
              <div className="relative">
                <select
                  value={designation}
                  onChange={(e) => onDesignationChange && onDesignationChange(e.target.value)}
                  className="w-full border border-emerald-600 px-2 py-1 pl-6 text-xs outline-none focus:ring-1 focus:ring-emerald-700 rounded-none bg-white text-slate-800 font-medium"
                >
                  <option value="Headmaster / Principal">Headmaster / Principal</option>
                  <option value="Admission In-Charge">Admission In-Charge</option>
                  <option value="Academic Committee Convener">Academic Committee Convener</option>
                  <option value="Vice Principal">Vice Principal</option>
                  <option value="Authorized Registrar">Authorized Registrar</option>
                </select>
                <Award size={12} className="absolute left-1.5 top-2 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block text-[10.5px] font-semibold text-slate-700 mb-0.5">
                Admission Validation Status
              </label>
              <select
                value={status}
                onChange={(e) => onStatusChange && onStatusChange(e.target.value)}
                className="w-full border border-emerald-600 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-emerald-700 rounded-none bg-emerald-50/50 text-emerald-900 font-bold"
              >
                <option value="Approved">Approved & Confirmed</option>
                <option value="Verified">Verified - Subject to Clearance</option>
                <option value="Provisional">Provisional Admission</option>
              </select>
            </div>
          </div>
        )}

        {/* Signature Input Mode Selection Tabs (Draw vs Upload) */}
        <div className="print:hidden">
          <div className="flex items-center justify-between gap-2 border-b border-slate-200 mb-2">
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => onSignatureTypeChange('draw')}
                className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold border-b-2 transition-all cursor-pointer ${
                  signatureType === 'draw'
                    ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <PenTool size={12} />
                <span>Draw Digital Pad</span>
              </button>

              <button
                type="button"
                onClick={() => onSignatureTypeChange('upload')}
                className={`flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold border-b-2 transition-all cursor-pointer ${
                  signatureType === 'upload'
                    ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Upload size={12} />
                <span>Upload Signature Image</span>
              </button>
            </div>

            {/* Quick Demo Pre-fill Button */}
            {sampleSignatureSvg && (
              <button
                type="button"
                onClick={handleApplySample}
                className="inline-flex items-center gap-1 text-[10px] text-indigo-700 hover:text-indigo-900 font-medium cursor-pointer"
                title="Use pre-formatted cursive script signature"
              >
                <Sparkles size={11} />
                <span>Sample Sign</span>
              </button>
            )}
          </div>

          {/* TAB 1: DRAW DIGITAL SIGNATURE PAD */}
          {signatureType === 'draw' && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] text-slate-500 px-0.5">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  Sign within the box below (Touch or Mouse)
                </span>
                
                {/* Pen color selector */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[9.5px]">Ink:</span>
                  <button
                    type="button"
                    onClick={() => setPenColor('#1e3a8a')}
                    className={`w-3.5 h-3.5 rounded-full bg-[#1e3a8a] border ${penColor === '#1e3a8a' ? 'ring-2 ring-slate-400' : ''}`}
                    title="Official Navy Blue"
                  />
                  <button
                    type="button"
                    onClick={() => setPenColor('#0f172a')}
                    className={`w-3.5 h-3.5 rounded-full bg-[#0f172a] border ${penColor === '#0f172a' ? 'ring-2 ring-slate-400' : ''}`}
                    title="Classic Black"
                  />
                  <button
                    type="button"
                    onClick={() => setPenColor('#047857')}
                    className={`w-3.5 h-3.5 rounded-full bg-[#047857] border ${penColor === '#047857' ? 'ring-2 ring-slate-400' : ''}`}
                    title="Authorized Green"
                  />
                </div>
              </div>

              {/* Responsive Canvas Pad with Touch Support */}
              <div className="relative border border-emerald-600 bg-white rounded-none overflow-hidden shadow-2xs">
                <canvas
                  ref={canvasRef}
                  width={340}
                  height={100}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-[100px] touch-none cursor-crosshair block bg-white"
                />

                {/* Subdued Guidelines within pad */}
                <div className="absolute inset-x-4 bottom-5 border-b border-dashed border-slate-200 pointer-events-none flex justify-between">
                  <span className="text-[8px] text-slate-300 font-mono">x Sign here</span>
                  <span className="text-[8px] text-slate-300 font-mono">Digital Signature Area</span>
                </div>

                {/* Clear Action overlay button */}
                <div className="absolute right-1.5 top-1.5 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleClear}
                    className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-sm text-[10px] flex items-center gap-0.5 border border-slate-300 shadow-2xs cursor-pointer"
                    title="Clear Signature Pad"
                  >
                    <Eraser size={12} />
                    <span className="text-[9px]">Clear</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: UPLOAD SIGNATURE IMAGE */}
          {signatureType === 'upload' && (
            <div className="space-y-2">
              <div className="border border-dashed border-emerald-600 bg-emerald-50/20 p-3 text-center">
                {signatureData ? (
                  <div className="flex flex-col items-center">
                    <div className="bg-white border border-slate-200 p-2 mb-2 max-w-[240px] max-h-[75px] flex items-center justify-center">
                      <img src={signatureData} alt="Uploaded Signature" className="max-h-[60px] object-contain" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-600 truncate max-w-[180px]">
                        {uploadedFileName || 'Signature File Loaded'}
                      </span>
                      <button
                        type="button"
                        onClick={handleClear}
                        className="inline-flex items-center gap-1 text-[10px] text-rose-600 hover:text-rose-800 font-medium cursor-pointer"
                      >
                        <Trash2 size={11} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-2">
                    <Upload size={22} className="text-emerald-700/60 mb-1" />
                    <p className="text-[11px] font-semibold text-slate-700">Click or browse signature image</p>
                    <p className="text-[9.5px] text-slate-400">PNG with transparent background or JPG (Max 2MB)</p>
                    <label className="mt-2 inline-flex items-center gap-1 bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1 text-[11px] font-medium rounded-sm cursor-pointer shadow-xs">
                      <span>Choose Signature File</span>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Live Preview Box in Screen Mode */}
        {hasValidSignature && (
          <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between text-[10.5px] text-slate-600 print:hidden bg-slate-50/80 p-1.5">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-500 text-[10px]">Preview:</span>
              <img src={signatureData} alt="Current Signature" className="h-6 max-w-[100px] object-contain" />
            </div>
            <div className="text-[9.5px] text-slate-500 font-mono">
              Recorded: {signDate}
            </div>
          </div>
        )}
      </div>

      {/* ======================================================================= */}
      {/* OFFICIAL PRINT-ONLY TRADITIONAL SIGNATURE BLOCK (Visible when printed) */}
      {/* ======================================================================= */}
      <div className="hidden print:flex flex-col items-center justify-end pt-6 text-center">
        {signatureData ? (
          <div className="h-14 flex items-end justify-center mb-1">
            <img src={signatureData} alt="Official Signature" className="max-h-12 max-w-[170px] object-contain" />
          </div>
        ) : (
          <div className="h-14 flex items-end justify-center text-[10px] text-slate-400 italic mb-1">
            (Physical signature required)
          </div>
        )}
        <div className="w-52 border-t-2 border-slate-900 mt-1"></div>
        <p className="text-xs font-black text-slate-900 mt-0.5 uppercase tracking-tight">
          {signatoryName || 'Authorized Signatory'}
        </p>
        {isRepresentative && (
          <p className="text-[10px] text-slate-700 font-bold">
            {designation || 'Principal / Head of Institution'}
          </p>
        )}
        <p className="text-[9px] text-slate-600">
          Date: {signDate} • {isRepresentative ? `Status: ${status}` : 'Verified Guardian'}
        </p>
      </div>
    </div>
  );
};
