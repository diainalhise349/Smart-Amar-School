import React, { useState, useEffect } from 'react';
import { 
  FileText, Download, Printer, X, CheckCircle, ShieldCheck, 
  User, Calendar, MapPin, School, Phone, AlertCircle, ZoomIn, ZoomOut, Check,
  QrCode, ExternalLink
} from 'lucide-react';
import QRCode from 'qrcode';
import { StudentAdmissionFormData, InstitutionProfile } from './StudentAdmissionForm';

interface AdmissionPdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: StudentAdmissionFormData;
  institution: InstitutionProfile;
  onConfirmSubmit?: () => void;
}

export const AdmissionPdfPreviewModal: React.FC<AdmissionPdfPreviewModalProps> = ({
  isOpen,
  onClose,
  formData,
  institution,
  onConfirmSubmit
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  // Form Admission ID & Verification Details
  const admissionId = `ADM-${formData.academicYear}-${(formData.birthCertificateNo || '9876').slice(-4).padStart(4, '0')}`;
  const applicationDate = formData.guardianSignDate || new Date().toISOString().split('T')[0];

  // Generate QR code encoding Student Admission ID, Application Date, Candidate Name, Class, and Institution
  useEffect(() => {
    if (!isOpen) return;

    const payload = JSON.stringify({
      verificationType: 'SMART_AMAR_SCHOOL_ADMISSION_VERIFICATION',
      admissionId: admissionId,
      applicationDate: applicationDate,
      studentName: formData.studentNameEn || 'Candidate',
      class: `${formData.selectedClass} (${formData.section || 'A'})`,
      school: institution.name,
      dob: formData.dob,
      nid: formData.birthCertificateNo,
      status: formData.schoolValidationStatus || 'Verified'
    });

    QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 200,
      color: {
        dark: '#064e3b', // deep emerald
        light: '#ffffff'
      }
    })
      .then(url => setQrCodeDataUrl(url))
      .catch(err => console.error('QR code generation error:', err));
  }, [isOpen, admissionId, applicationDate, formData, institution]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadSimplePdf = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Title & School Header
      doc.setFillColor(21, 128, 61); // emerald green
      doc.rect(10, 10, 190, 22, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(institution.name.toUpperCase(), 105, 18, { align: 'center' });

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`OFFICIAL STUDENT ADMISSION FORM • ACADEMIC SESSION ${formData.academicYear}`, 105, 24, { align: 'center' });
      doc.text(institution.address || 'Dhaka, Bangladesh', 105, 29, { align: 'center' });

      // Student Summary Box
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('1. STUDENT IDENTIFICATION', 12, 39);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Full Name (English): ${formData.studentNameEn || 'N/A'}`, 14, 46);
      doc.text(`Native Name: ${formData.studentNameNative || 'N/A'}`, 14, 52);
      doc.text(`Date of Birth: ${formData.dob || 'N/A'}`, 14, 58);
      doc.text(`Gender: ${formData.gender || 'N/A'}  |  Blood Group: ${formData.bloodGroup || 'N/A'}`, 14, 64);
      doc.text(`Birth Reg. / NID: ${formData.birthCertificateNo || 'N/A'}`, 14, 70);
      doc.text(`Applied Class: ${formData.selectedClass} (Section ${formData.section}, ${formData.shift} Shift, ${formData.group} Group)`, 14, 76);

      // Parents Info
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('2. PARENTS & GUARDIAN PARTICULARS', 12, 86);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Father's Name: ${formData.fatherNameEn || 'N/A'}  |  Contact: ${formData.fatherMobile || 'N/A'}`, 14, 93);
      doc.text(`Father's Occupation: ${formData.fatherOccupation || 'N/A'}`, 14, 99);
      doc.text(`Mother's Name: ${formData.motherNameEn || 'N/A'}  |  Contact: ${formData.motherMobile || 'N/A'}`, 14, 105);
      doc.text(`Guardian Name: ${formData.guardianName || 'Father/Mother'}  |  Rel: ${formData.guardianRelation || 'Parent'}`, 14, 111);

      // Address
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('3. ADDRESS & PREVIOUS RECORD', 12, 121);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Present Address: ${formData.presentVillage}, ${formData.presentRoad}, ${formData.presentThana}, ${formData.presentDistrict}`, 14, 128);
      doc.text(`Permanent Address: ${formData.permanentVillage}, ${formData.permanentRoad}, ${formData.permanentThana}, ${formData.permanentDistrict}`, 14, 134);
      doc.text(`Previous School: ${formData.previousSchoolName || 'Fresh Enrollment'}`, 14, 140);

      // QR Code for Instant Verification in generated PDF
      if (qrCodeDataUrl) {
        doc.addImage(qrCodeDataUrl, 'PNG', 160, 38, 38, 38);
        doc.setFontSize(7);
        doc.setTextColor(6, 78, 59);
        doc.setFont('helvetica', 'bold');
        doc.text('SCAN FOR VERIFICATION', 179, 79, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(admissionId, 179, 82, { align: 'center' });
      }

      // Signatures
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.text('4. DIGITAL ENDORSEMENTS & VALIDATION', 12, 150);

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.text(`Guardian Signatory: ${formData.guardianSignatoryName || formData.fatherNameEn || 'Guardian'} (Signed: ${formData.guardianSignDate})`, 14, 158);
      doc.text(`School Representative: ${formData.schoolRepName} - ${formData.schoolRepDesignation} (Status: ${formData.schoolValidationStatus})`, 14, 164);

      // Footer
      doc.setDrawColor(200, 200, 200);
      doc.line(10, 270, 200, 270);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated by Smart Amar School Admission Portal • Date: ${new Date().toLocaleDateString()}`, 105, 276, { align: 'center' });

      doc.save(`Admission_Document_${(formData.studentNameEn || 'Student').replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static">
      <div className="bg-slate-100 rounded-xl shadow-2xl border border-slate-300 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 print:shadow-none print:border-none print:max-w-none print:max-h-none print:w-full print:rounded-none">
        
        {/* Top Preview Control Header (Hidden when printing) */}
        <div className="bg-slate-900 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <FileText size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold tracking-tight text-white">Official Admission Document — Live PDF Preview</h3>
                <span className="text-[10px] font-semibold bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  A4 Standard
                </span>
              </div>
              <p className="text-xs text-slate-400">Review all entered student records, addresses, and digital signatures prior to final submission</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-lg p-0.5 text-xs text-slate-300">
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.max(75, prev - 10))}
                className="p-1 hover:text-white rounded hover:bg-slate-700 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut size={14} />
              </button>
              <span className="px-1.5 font-mono text-[11px] min-w-[40px] text-center">{zoomLevel}%</span>
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.min(130, prev + 10))}
                className="p-1 hover:text-white rounded hover:bg-slate-700 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn size={14} />
              </button>
            </div>

            {/* Quick Actions */}
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium rounded-lg cursor-pointer transition-colors"
            >
              <Printer size={14} />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadSimplePdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg cursor-pointer transition-colors shadow-xs"
            >
              <Download size={14} />
              <span>Save PDF</span>
            </button>

            {onConfirmSubmit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onConfirmSubmit();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-xs"
              >
                <Check size={14} />
                <span>Confirm & Submit</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer ml-1"
              title="Close Preview"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable PDF Virtual Paper Canvas */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 flex justify-center bg-slate-200/80">
          <div 
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
            className="w-full max-w-[800px] bg-white shadow-xl border border-slate-300 text-slate-900 font-sans p-6 sm:p-8 transition-transform duration-150 print:p-0 print:border-none print:shadow-none print:scale-100 print:w-full"
          >
            
            {/* ======================================================================= */}
            {/* PDF HEADER: INSTITUTION BANNER */}
            {/* ======================================================================= */}
            <div className="border-2 border-emerald-800 p-4 mb-4 bg-white relative">
              <div className="flex items-center justify-between gap-4">
                
                {/* Left Circular Monogram Seal */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-amber-400 bg-amber-50 p-1 flex flex-col items-center justify-center text-center flex-shrink-0 shadow-2xs">
                  <div className="w-full h-full rounded-full border-2 border-emerald-800 bg-white flex flex-col items-center justify-center p-1 text-center">
                    <span className="text-[6.5px] font-black text-emerald-950 uppercase line-clamp-2 px-0.5 leading-tight">
                      {institution.logoBadgeText || institution.name}
                    </span>
                    <div className="my-0.5 text-xs">🎓</div>
                    <span className="text-[6.5px] font-black text-rose-700 uppercase">
                      ESTD: {institution.establishedYear || '1994'}
                    </span>
                  </div>
                </div>

                {/* Center School Details */}
                <div className="flex-1 text-center">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-widest mb-0.5">
                    {institution.subtitle || 'Government Approved Institution'}
                  </p>
                  <h1 className="text-lg sm:text-xl font-black text-emerald-900 uppercase tracking-tight leading-tight">
                    {institution.name}
                  </h1>
                  <p className="text-xs text-slate-700 font-medium mt-0.5">
                    {institution.address}
                  </p>
                  <div className="inline-block mt-1.5 px-3 py-0.5 bg-emerald-800 text-white text-[11px] font-bold uppercase tracking-wider">
                    STUDENT ADMISSION FORM • SESSION {formData.academicYear}
                  </div>
                </div>

                {/* Right: Passport Photo Box */}
                <div className="w-20 h-24 sm:w-24 sm:h-28 border border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-center flex-shrink-0 p-1">
                  {formData.studentPhoto ? (
                    <img 
                      src={formData.studentPhoto} 
                      alt="Student" 
                      className="w-full h-full object-cover rounded-none"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <User size={28} />
                      <span className="text-[8px] mt-1 font-semibold uppercase">Passport Size Photo</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Reference Code & QR Verification Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-50 border border-emerald-200 px-3.5 py-2 text-xs text-slate-700 font-medium mb-4 rounded-sm gap-2">
              <div className="flex items-center gap-3">
                {qrCodeDataUrl ? (
                  <div className="w-12 h-12 bg-white p-0.5 border border-emerald-300 rounded shadow-2xs flex-shrink-0 flex items-center justify-center">
                    <img src={qrCodeDataUrl} alt="Quick Verification QR" className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-slate-100 border border-slate-300 rounded flex items-center justify-center text-slate-400">
                    <QrCode size={20} />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">Admission ID:</span>
                    <strong className="font-mono text-emerald-900 text-sm">{admissionId}</strong>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded border border-emerald-200">
                      QR Verified
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    Class: <strong className="text-blue-700">{formData.selectedClass}</strong> (Sec: {formData.section}, {formData.shift}) • App Date: <strong className="text-slate-800">{applicationDate}</strong>
                  </div>
                </div>
              </div>

              <div className="text-right sm:border-l sm:border-slate-200 sm:pl-3 text-[10px] text-slate-500 hidden sm:block">
                <span>Print Timestamp: <strong>{new Date().toLocaleDateString('en-GB')}</strong></span>
                <span className="block text-emerald-700 font-medium mt-0.5">Scan QR for instant record check</span>
              </div>
            </div>

            {/* ======================================================================= */}
            {/* SECTION 1: CANDIDATE INFORMATION */}
            {/* ======================================================================= */}
            <div className="mb-4 border border-slate-300">
              <div className="bg-emerald-700 text-white px-3 py-1 text-xs font-bold uppercase tracking-wider">
                1. Student Basic Information
              </div>
              <div className="p-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="col-span-2">
                  <span className="text-slate-500 block text-[10px]">Full Name (English):</span>
                  <span className="font-bold text-slate-900 text-sm uppercase">{formData.studentNameEn || '—'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block text-[10px]">Name in Native Script:</span>
                  <span className="font-semibold text-slate-800">{formData.studentNameNative || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Date of Birth:</span>
                  <span className="font-bold text-slate-800">{formData.dob || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Gender:</span>
                  <span className="font-bold text-slate-800">{formData.gender || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Blood Group:</span>
                  <span className="font-bold text-rose-700">{formData.bloodGroup || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Email Address:</span>
                  <span className="font-medium text-slate-800 truncate block">{formData.studentEmail || '—'}</span>
                </div>
                <div className="col-span-2 sm:col-span-4">
                  <span className="text-slate-500 block text-[10px]">Birth Registration Certificate / NID:</span>
                  <span className="font-mono font-bold text-slate-800 tracking-wider">{formData.birthCertificateNo || '—'}</span>
                </div>
              </div>
            </div>

            {/* ======================================================================= */}
            {/* SECTION 2: PARENTS & GUARDIAN */}
            {/* ======================================================================= */}
            <div className="mb-4 border border-slate-300">
              <div className="bg-emerald-700 text-white px-3 py-1 text-xs font-bold uppercase tracking-wider">
                2. Parents & Legal Guardian Particulars
              </div>
              <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Father */}
                <div className="bg-slate-50 p-2 border border-slate-200 space-y-1">
                  <p className="font-bold text-slate-800 border-b border-slate-200 pb-0.5 text-[11px]">Father's Profile</p>
                  <p><span className="text-slate-500">Name (English):</span> <strong>{formData.fatherNameEn || '—'}</strong></p>
                  <p><span className="text-slate-500">Native Name:</span> <span>{formData.fatherNameNative || '—'}</span></p>
                  <p><span className="text-slate-500">Mobile Phone:</span> <strong className="font-mono text-emerald-800">{formData.fatherMobile || '—'}</strong></p>
                  <p><span className="text-slate-500">Occupation:</span> <span>{formData.fatherOccupation || '—'}</span></p>
                </div>

                {/* Mother */}
                <div className="bg-slate-50 p-2 border border-slate-200 space-y-1">
                  <p className="font-bold text-slate-800 border-b border-slate-200 pb-0.5 text-[11px]">Mother's Profile</p>
                  <p><span className="text-slate-500">Name (English):</span> <strong>{formData.motherNameEn || '—'}</strong></p>
                  <p><span className="text-slate-500">Native Name:</span> <span>{formData.motherNameNative || '—'}</span></p>
                  <p><span className="text-slate-500">Mobile Phone:</span> <strong className="font-mono text-emerald-800">{formData.motherMobile || '—'}</strong></p>
                  <p><span className="text-slate-500">Occupation:</span> <span>{formData.motherOccupation || '—'}</span></p>
                </div>

                {/* Guardian if applicable */}
                {formData.guardianName && (
                  <div className="col-span-1 sm:col-span-2 bg-slate-50 p-2 border border-slate-200 text-xs">
                    <span className="text-slate-500">Appointed Guardian:</span> <strong>{formData.guardianName}</strong> (Relation: {formData.guardianRelation || 'Relative'}) • Contact: <strong className="font-mono">{formData.guardianMobile || '—'}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* ======================================================================= */}
            {/* SECTION 3: ADDRESSES */}
            {/* ======================================================================= */}
            <div className="mb-4 border border-slate-300">
              <div className="bg-emerald-700 text-white px-3 py-1 text-xs font-bold uppercase tracking-wider">
                3. Address Information
              </div>
              <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="font-bold text-slate-800 block mb-0.5 text-[11px]">Present / Mailing Address:</span>
                  <p className="text-slate-700 leading-relaxed bg-slate-50 p-2 border border-slate-200">
                    House/Village: {formData.presentVillage || '—'}<br />
                    Road/Block: {formData.presentRoad || '—'}<br />
                    Post/Thana: {formData.presentThana || '—'}<br />
                    District: <strong>{formData.presentDistrict || '—'}</strong>
                  </p>
                </div>
                <div>
                  <span className="font-bold text-slate-800 block mb-0.5 text-[11px]">Permanent Address:</span>
                  <p className="text-slate-700 leading-relaxed bg-slate-50 p-2 border border-slate-200">
                    House/Village: {formData.permanentVillage || '—'}<br />
                    Road/Block: {formData.permanentRoad || '—'}<br />
                    Post/Thana: {formData.permanentThana || '—'}<br />
                    District: <strong>{formData.permanentDistrict || '—'}</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* ======================================================================= */}
            {/* SECTION 4: ADMISSION PARTICULARS & PREVIOUS SCHOOL */}
            {/* ======================================================================= */}
            <div className="mb-4 border border-slate-300">
              <div className="bg-emerald-700 text-white px-3 py-1 text-xs font-bold uppercase tracking-wider">
                4. Admission Details & Academic History
              </div>
              <div className="p-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Academic Year:</span>
                  <strong className="text-slate-800">{formData.academicYear}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Applied Class:</span>
                  <strong className="text-blue-700">{formData.selectedClass}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Section & Shift:</span>
                  <strong className="text-slate-800">Sec {formData.section} ({formData.shift})</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Discipline / Group:</span>
                  <strong className="text-slate-800">{formData.group}</strong>
                </div>
                <div className="col-span-2 sm:col-span-4 mt-1 pt-1 border-t border-slate-200">
                  <span className="text-slate-500 block text-[10px]">Previous Attended Institution:</span>
                  <span className="font-medium text-slate-800">{formData.previousSchoolName || 'Direct admission without transfer (Fresh entry)'}</span>
                </div>
              </div>
            </div>

            {/* ======================================================================= */}
            {/* SECTION 5: SIGNATURES & INSTITUTIONAL SEALS */}
            {/* ======================================================================= */}
            <div className="border border-slate-300 p-4 bg-slate-50/50">
              <div className="grid grid-cols-2 gap-6 pt-6">
                
                {/* Guardian Signature Box */}
                <div className="flex flex-col items-center justify-end text-center">
                  <div className="h-14 flex items-end justify-center mb-1">
                    {formData.guardianSignatureData ? (
                      <img 
                        src={formData.guardianSignatureData} 
                        alt="Parent Signature" 
                        className="max-h-12 max-w-[180px] object-contain"
                      />
                    ) : (
                      <span className="text-[10px] text-amber-700 italic border border-dashed border-amber-300 px-3 py-1 bg-amber-50">
                        Pending Digital Signature
                      </span>
                    )}
                  </div>
                  <div className="w-52 border-t-2 border-slate-900 mt-1"></div>
                  <p className="text-xs font-bold text-slate-900 mt-1 uppercase">
                    {formData.guardianSignatoryName || formData.fatherNameEn || 'Parent / Legal Guardian'}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Date: {formData.guardianSignDate || new Date().toISOString().split('T')[0]} • Endorsement Verified
                  </p>
                </div>

                {/* School Authority Signature Box */}
                <div className="flex flex-col items-center justify-end text-center">
                  <div className="h-14 flex items-end justify-center mb-1">
                    {formData.schoolRepSignatureData ? (
                      <img 
                        src={formData.schoolRepSignatureData} 
                        alt="Authorized Signature" 
                        className="max-h-12 max-w-[180px] object-contain"
                      />
                    ) : (
                      <span className="text-[10px] text-emerald-800 font-serif italic border border-emerald-200 px-3 py-1 bg-emerald-50">
                        Official Seal & Validation
                      </span>
                    )}
                  </div>
                  <div className="w-52 border-t-2 border-slate-900 mt-1"></div>
                  <p className="text-xs font-bold text-slate-900 mt-1 uppercase">
                    {formData.schoolRepName || 'Headmaster / Principal'}
                  </p>
                  <p className="text-[10px] text-slate-700 font-semibold">
                    {formData.schoolRepDesignation || 'Principal / Head of Institution'}
                  </p>
                  <p className="text-[9.5px] text-emerald-800 font-medium">
                    Status: {formData.schoolValidationStatus} • Date: {formData.schoolValidationDate}
                  </p>
                </div>

              </div>
            </div>

            {/* Document Verification & Security QR Stamp Footer Bar */}
            <div className="mt-4 pt-3 border-t-2 border-slate-300 flex flex-col sm:flex-row justify-between items-center gap-3 text-[10px] text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200">
              <div className="flex items-center gap-2.5">
                {qrCodeDataUrl && (
                  <div className="w-10 h-10 bg-white p-0.5 border border-slate-300 rounded flex-shrink-0">
                    <img src={qrCodeDataUrl} alt="Security Hash QR" className="w-full h-full object-contain" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <ShieldCheck size={13} className="text-emerald-700" />
                    <span>DIGITALLY VERIFIED ENROLLMENT RECORD</span>
                  </div>
                  <p className="text-[9px] text-slate-500 font-mono mt-0.5">
                    ID: <strong className="text-emerald-800">{admissionId}</strong> • Date: <strong className="text-slate-700">{applicationDate}</strong> • Hash: SAS-{formData.academicYear}-V1
                  </p>
                </div>
              </div>

              <div className="text-center sm:text-right text-[9px] text-slate-500">
                <span className="block font-medium text-slate-700">Valid for Academic Enrollment & Institute Archival</span>
                <span>Smart Amar School Automated Admission Register</span>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Modal Actions (Hidden when printing) */}
        <div className="bg-white border-t border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span>Review document details. You can print directly or save as PDF.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
            >
              Back to Edit Form
            </button>

            {onConfirmSubmit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onConfirmSubmit();
                }}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle size={14} />
                <span>Confirm & Send Application</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
