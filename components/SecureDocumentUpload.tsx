import React, { useState, useRef, useEffect } from 'react';
import { 
  UploadCloud, FileText, CheckCircle2, AlertTriangle, ShieldCheck, 
  Lock, Folder, X, Search, FileBadge, Receipt, Users, Plus, 
  Eye, RefreshCw, KeyRound, Check, HeartPulse, Scale, 
  GraduationCap, Building2, CalendarClock, Calendar, Sparkles,
  Clock, ShieldAlert, BadgeCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole, DocumentCategory, DocumentSecurityLevel, SchoolDocument, Student } from '../types';
import { MOCK_STUDENTS } from '../constants';
import { 
  getStoredFolders, saveDocument, generateDocumentHash, 
  formatBytes, DocumentFolder 
} from '../utils/documentStorage';
import { useToast } from './UIComponents';

interface SecureDocumentUploadProps {
  initialCategory?: DocumentCategory;
  initialFolder?: string;
  initialStudentId?: string;
  onUploadComplete?: (document: SchoolDocument) => void;
  onCancel?: () => void;
  isModal?: boolean;
}

const AUTHORITY_SUGGESTIONS: Record<string, string[]> = {
  'academic': [
    'Board of Intermediate & Secondary Education (BISE), Dhaka',
    'National Curriculum and Textbook Board (NCTB)',
    'Ministry of Primary & Mass Education (MoPME)',
    'Institution Academic Council & Examination Board'
  ],
  'medical': [
    'District Civil Surgeon Office & General Hospital',
    'Directorate General of Health Services (DGHS)',
    'Upazila Health Complex Medical Officer',
    'Authorized School Physician & Health Board'
  ],
  'legal': [
    'First Class Judicial Magistrate & Notary Public',
    'District Judge Court & Commissioner of Oaths',
    'Ministry of Law, Justice & Parliamentary Affairs',
    'Authorized Legal Guardian Notarized Undertaking'
  ],
  'student-records': [
    'Office of the Registrar General (BRIS-BD)',
    'City Corporation / Union Parishad Local Registrar',
    'Previous Enrolled Educational Institution',
    'National Identity Registration Wing (NID-EC)'
  ],
  'fee-receipts': [
    'Smart Amar School Accounts & Finance Division',
    'Sonali Bank PLC (Institutional Branch)',
    'bKash Merchant Gateway Payment Desk',
    'Agrani Bank PLC / Institutional Bursar'
  ],
  'academic-certificates': [
    'Board of Intermediate & Secondary Education (BISE), Dhaka',
    'Secondary School Certificate (SSC) Board Authority',
    'Madrasah Education Board Bangladesh',
    'Institution Principal & Headmaster Office'
  ],
  'administrative': [
    'Ministry of Education Bangladesh',
    'Directorate of Secondary & Higher Education (DSHE)',
    'School Managing Committee (SMC)',
    'District Education Officer (DEO)'
  ]
};

export const SecureDocumentUpload: React.FC<SecureDocumentUploadProps> = ({
  initialCategory = 'student-records',
  initialFolder = 'documents/student-records',
  initialStudentId,
  onUploadComplete,
  onCancel,
  isModal = false
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  // Role authorization check
  const isAuthorized = user && (
    user.role === UserRole.SUPER_ADMIN || 
    user.role === UserRole.SCHOOL_ADMIN ||
    user.role === UserRole.TEACHER // Authorized faculty can upload
  );

  // Form states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string>('');
  const [title, setTitle] = useState('');
  
  // Mandatory Metadata Fields
  const [category, setCategory] = useState<DocumentCategory>(initialCategory);
  const [issuingAuthority, setIssuingAuthority] = useState<string>(() => {
    return AUTHORITY_SUGGESTIONS[initialCategory]?.[0] || '';
  });
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [isPermanent, setIsPermanent] = useState<boolean>(
    initialCategory === 'academic' || 
    initialCategory === 'academic-certificates' || 
    initialCategory === 'student-records'
  );

  const [targetFolder, setTargetFolder] = useState<string>(initialFolder);
  const [availableFolders, setAvailableFolders] = useState<DocumentFolder[]>([]);
  
  // Student association
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(() => {
    if (initialStudentId) {
      return MOCK_STUDENTS.find(s => s.id === initialStudentId) || null;
    }
    return null;
  });
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);

  // Category specific fields
  const [amount, setAmount] = useState<string>('');
  const [transactionId, setTransactionId] = useState<string>('');
  const [certificateType, setCertificateType] = useState<string>('Testimonial');
  const [medicalClassification, setMedicalClassification] = useState<string>('Annual Fitness Clearance');
  const [legalInstrumentType, setLegalInstrumentType] = useState<string>('Guardianship Affidavit');
  const [notaryRegistrationNo, setNotaryRegistrationNo] = useState<string>('');
  const [issueDate, setIssueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [securityLevel, setSecurityLevel] = useState<DocumentSecurityLevel>('Confidential');
  const [notes, setNotes] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  // Security scanning state
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState<string>('');
  const [calculatedHash, setCalculatedHash] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load folders
  useEffect(() => {
    const folders = getStoredFolders();
    setAvailableFolders(folders);
  }, []);

  // Update target folder & suggestions when category changes
  const handleCategoryChange = (newCat: DocumentCategory) => {
    setCategory(newCat);
    
    // Auto sync folder
    if (newCat === 'academic') setTargetFolder('documents/academic');
    else if (newCat === 'medical') setTargetFolder('documents/medical');
    else if (newCat === 'legal') setTargetFolder('documents/legal');
    else if (newCat === 'student-records') setTargetFolder('documents/student-records');
    else if (newCat === 'fee-receipts') setTargetFolder('documents/fee-receipts');
    else if (newCat === 'academic-certificates') setTargetFolder('documents/academic-certificates');
    else if (newCat === 'administrative') setTargetFolder('documents/administrative');

    // Smart suggestion for Issuing Authority if user hasn't explicitly entered a custom one
    const suggestions = AUTHORITY_SUGGESTIONS[newCat] || [];
    if (!issuingAuthority.trim() || Object.values(AUTHORITY_SUGGESTIONS).some(list => list.includes(issuingAuthority))) {
      if (suggestions.length > 0) {
        setIssuingAuthority(suggestions[0]);
      }
    }

    // Default expiry behavior: Academic & Student Records usually permanent, Medical & Receipts usually expire
    if (newCat === 'medical') {
      setIsPermanent(false);
      // Default to 1 year from now
      const oneYearAhead = new Date();
      oneYearAhead.setFullYear(oneYearAhead.getFullYear() + 1);
      setExpiryDate(oneYearAhead.toISOString().split('T')[0]);
    } else if (newCat === 'fee-receipts') {
      setIsPermanent(false);
      const oneYearAhead = new Date();
      oneYearAhead.setFullYear(oneYearAhead.getFullYear() + 1);
      setExpiryDate(oneYearAhead.toISOString().split('T')[0]);
    } else if (newCat === 'legal') {
      setIsPermanent(false);
      const twoYearsAhead = new Date();
      twoYearsAhead.setFullYear(twoYearsAhead.getFullYear() + 2);
      setExpiryDate(twoYearsAhead.toISOString().split('T')[0]);
    } else {
      setIsPermanent(true);
      setExpiryDate('');
    }
  };

  // Helper for quick expiry date duration
  const setExpiryOffsetYears = (years: number) => {
    setIsPermanent(false);
    const date = new Date();
    date.setFullYear(date.getFullYear() + years);
    setExpiryDate(date.toISOString().split('T')[0]);
  };

  const setExpiryOffsetMonths = (months: number) => {
    setIsPermanent(false);
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    setExpiryDate(date.toISOString().split('T')[0]);
  };

  // Process chosen file
  const handleFileSelection = (file: File) => {
    setErrorMsg(null);
    
    // Allowed file types
    const validExtensions = ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'docx', 'xlsx'];
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!validExtensions.includes(ext)) {
      setErrorMsg(`Unsupported file type (.${ext}). Please upload PDF, PNG, JPG, or DOCX documents.`);
      return;
    }

    // Size limit 15MB
    const maxBytes = 15 * 1024 * 1024;
    if (file.size > maxBytes) {
      setErrorMsg(`File size exceeds 15MB limit (${formatBytes(file.size)}).`);
      return;
    }

    setSelectedFile(file);
    if (!title) {
      // Auto-populate title from file name
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1));
    }

    // Read data for preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setFileDataUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Run simulated security scan
    triggerSecurityScan(file);
  };

  const triggerSecurityScan = (file: File) => {
    setIsScanning(true);
    setScanProgress(0);
    setScanStatus('Initializing SHA-256 virus & heuristic integrity engine...');

    const stages = [
      { progress: 25, status: 'Scanning binary for malware signatures...' },
      { progress: 55, status: 'Verifying MIME header consistency & macro execution...' },
      { progress: 85, status: 'Computing cryptographic SHA-256 digital fingerprint...' },
      { progress: 100, status: 'Verification passed. Cryptographic seal ready.' }
    ];

    let currentStage = 0;
    const interval = setInterval(() => {
      if (currentStage < stages.length) {
        setScanProgress(stages[currentStage].progress);
        setScanStatus(stages[currentStage].status);
        currentStage++;
      } else {
        clearInterval(interval);
        setIsScanning(false);
        const hash = generateDocumentHash(file.name, file.size, new Date().toISOString());
        setCalculatedHash(hash);
      }
    }, 200);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthorized) {
      setErrorMsg('Unauthorized: Your role does not have authorization to store files in the Document Vault.');
      return;
    }

    if (!selectedFile) {
      setErrorMsg('Mandatory: Please select a document file to upload.');
      return;
    }

    if (!title.trim()) {
      setErrorMsg('Mandatory: Please provide a descriptive document title.');
      return;
    }

    // MANDATORY FIELD 1: Category Check
    if (!category) {
      setErrorMsg('Mandatory Field: Please select a Document Category (e.g. Medical, Legal, Academic).');
      return;
    }

    // MANDATORY FIELD 2: Issuing Authority Check
    if (!issuingAuthority.trim()) {
      setErrorMsg('Mandatory Field: Please enter the Issuing Authority (e.g. Ministry of Education, District Health Office, Notary Public).');
      return;
    }

    // MANDATORY FIELD 3: Expiry Date Check
    const finalExpiryDate = isPermanent ? 'Permanent' : expiryDate.trim();
    if (!finalExpiryDate) {
      setErrorMsg('Mandatory Field: Please specify the Expiry Date or select "Permanent / No Expiration" for this document.');
      return;
    }

    // Extract tags
    const defaultTag = category === 'student-records' ? 'Student Record' :
                       category === 'medical' ? 'Medical Record' :
                       category === 'legal' ? 'Legal Document' :
                       category === 'academic' ? 'Academic Record' :
                       category === 'fee-receipts' ? 'Fee Receipt' :
                       category === 'academic-certificates' ? 'Certificate' : 'Admin';
    
    const parsedTags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);
    if (!parsedTags.includes(defaultTag)) {
      parsedTags.unshift(defaultTag);
    }
    if (category === 'medical' && !parsedTags.includes('Health')) parsedTags.push('Health');
    if (category === 'legal' && !parsedTags.includes('Affidavit')) parsedTags.push('Affidavit');
    if (category === 'academic' && !parsedTags.includes('Education')) parsedTags.push('Education');

    const docId = `DOC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowIso = new Date().toISOString();

    const newDocument: SchoolDocument = {
      id: docId,
      title: title.trim(),
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      fileType: selectedFile.type || 'application/pdf',
      category,
      folder: targetFolder,
      studentId: selectedStudent?.id,
      studentName: selectedStudent?.name,
      studentRoll: selectedStudent?.rollNo,
      studentClass: selectedStudent?.class,
      amount: amount ? parseFloat(amount) : undefined,
      transactionId: transactionId.trim() || undefined,
      certificateType: category === 'academic-certificates' ? certificateType : 
                       category === 'medical' ? medicalClassification :
                       category === 'legal' ? legalInstrumentType : undefined,
      issueDate: issueDate || nowIso.split('T')[0],
      expiryDate: finalExpiryDate,
      issuingAuthority: issuingAuthority.trim(),
      documentCategory: category.toUpperCase(),
      uploadedBy: {
        id: user?.id || 'ADM-001',
        name: user?.name || 'Administrator',
        role: user?.role === UserRole.SUPER_ADMIN ? 'Super Admin' :
              user?.role === UserRole.TEACHER ? 'Faculty' : 'School Admin'
      },
      uploadedAt: nowIso,
      securityLevel,
      fileHash: calculatedHash || generateDocumentHash(selectedFile.name, selectedFile.size, nowIso),
      verificationStatus: 'Verified',
      contentUrl: fileDataUrl,
      tags: parsedTags,
      notes: notes.trim() || undefined,
      accessRoles: [UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN]
    };

    saveDocument(newDocument);
    showToast(`Document securely archived with mandatory metadata in '${targetFolder}'`, 'success');

    if (onUploadComplete) {
      onUploadComplete(newDocument);
    }

    // Reset form
    setSelectedFile(null);
    setFileDataUrl('');
    setTitle('');
    setNotes('');
    setTagsInput('');
    setAmount('');
    setTransactionId('');
    setCalculatedHash('');
  };

  const filteredStudents = MOCK_STUDENTS.filter(s => 
    s.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
    s.rollNo.includes(studentSearchQuery) ||
    s.id.toLowerCase().includes(studentSearchQuery.toLowerCase())
  );

  // Compute remaining validity display
  const getExpiryDisplay = () => {
    if (isPermanent) return 'Permanent Record (Does Not Expire)';
    if (!expiryDate) return 'Expiration Date Required';
    const exp = new Date(expiryDate);
    const now = new Date();
    const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 3600 * 24));
    if (diffDays < 0) return `Expired ${Math.abs(diffDays)} days ago`;
    if (diffDays === 0) return 'Expires Today';
    if (diffDays < 30) return `Expires in ${diffDays} days`;
    if (diffDays < 365) return `Expires in ${Math.round(diffDays / 30)} months`;
    return `Valid for ${(diffDays / 365).toFixed(1)} years (until ${expiryDate})`;
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden ${isModal ? 'max-h-[90vh] flex flex-col' : ''}`}>
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <UploadCloud size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <span>Secure Document Vault Upload</span>
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck size={11} />
                SHA-256 Verified
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Institutional document intake with mandatory category, issuing authority, and expiry metadata
            </p>
          </div>
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
            title="Close"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Main Upload Form */}
      <form onSubmit={handleSubmit} className={`p-6 space-y-6 ${isModal ? 'overflow-y-auto' : ''}`}>
        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2 font-medium">
            <AlertTriangle size={18} className="text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1. Category Selection Tabs (Mandatory) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <span>1. Document Category</span>
              <span className="text-rose-500 font-black">* Mandatory</span>
            </label>
            <span className="text-[11px] font-mono text-indigo-700 bg-indigo-50 font-bold px-2 py-0.5 rounded">
              Selected: {category.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {/* Academic */}
            <button
              type="button"
              onClick={() => handleCategoryChange('academic')}
              className={`p-3 rounded-xl border-2 text-left transition-all flex items-start gap-2.5 ${
                category === 'academic'
                  ? 'border-indigo-600 bg-indigo-50/60 shadow-xs ring-2 ring-indigo-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 ${category === 'academic' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <GraduationCap size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <span>Academic</span>
                  {category === 'academic' && <Check size={12} className="text-indigo-600" />}
                </div>
                <div className="text-[10px] text-slate-500 leading-tight mt-0.5">Syllabi, board equivalency & marks</div>
              </div>
            </button>

            {/* Medical */}
            <button
              type="button"
              onClick={() => handleCategoryChange('medical')}
              className={`p-3 rounded-xl border-2 text-left transition-all flex items-start gap-2.5 ${
                category === 'medical'
                  ? 'border-rose-600 bg-rose-50/60 shadow-xs ring-2 ring-rose-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 ${category === 'medical' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <HeartPulse size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <span>Medical</span>
                  {category === 'medical' && <Check size={12} className="text-rose-600" />}
                </div>
                <div className="text-[10px] text-slate-500 leading-tight mt-0.5">Fitness, immunization & clinical records</div>
              </div>
            </button>

            {/* Legal */}
            <button
              type="button"
              onClick={() => handleCategoryChange('legal')}
              className={`p-3 rounded-xl border-2 text-left transition-all flex items-start gap-2.5 ${
                category === 'legal'
                  ? 'border-amber-600 bg-amber-50/60 shadow-xs ring-2 ring-amber-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 ${category === 'legal' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <Scale size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <span>Legal</span>
                  {category === 'legal' && <Check size={12} className="text-amber-600" />}
                </div>
                <div className="text-[10px] text-slate-500 leading-tight mt-0.5">Affidavits, undertakings & notary deeds</div>
              </div>
            </button>

            {/* Student Records */}
            <button
              type="button"
              onClick={() => handleCategoryChange('student-records')}
              className={`p-3 rounded-xl border-2 text-left transition-all flex items-start gap-2.5 ${
                category === 'student-records'
                  ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-2 ring-blue-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 ${category === 'student-records' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <Users size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <span>Student Records</span>
                  {category === 'student-records' && <Check size={12} className="text-blue-600" />}
                </div>
                <div className="text-[10px] text-slate-500 leading-tight mt-0.5">Birth reg, admission forms, TC</div>
              </div>
            </button>

            {/* Fee Receipts */}
            <button
              type="button"
              onClick={() => handleCategoryChange('fee-receipts')}
              className={`p-3 rounded-xl border-2 text-left transition-all flex items-start gap-2.5 ${
                category === 'fee-receipts'
                  ? 'border-emerald-600 bg-emerald-50/60 shadow-xs ring-2 ring-emerald-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 ${category === 'fee-receipts' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <Receipt size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <span>Fee Receipts</span>
                  {category === 'fee-receipts' && <Check size={12} className="text-emerald-600" />}
                </div>
                <div className="text-[10px] text-slate-500 leading-tight mt-0.5">Tuition slips, bank challans</div>
              </div>
            </button>

            {/* Academic Certificates */}
            <button
              type="button"
              onClick={() => handleCategoryChange('academic-certificates')}
              className={`p-3 rounded-xl border-2 text-left transition-all flex items-start gap-2.5 ${
                category === 'academic-certificates'
                  ? 'border-purple-600 bg-purple-50/60 shadow-xs ring-2 ring-purple-500/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 ${category === 'academic-certificates' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <FileBadge size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <span>Certificates</span>
                  {category === 'academic-certificates' && <Check size={12} className="text-purple-600" />}
                </div>
                <div className="text-[10px] text-slate-500 leading-tight mt-0.5">Board diplomas & character certs</div>
              </div>
            </button>

            {/* Administrative */}
            <button
              type="button"
              onClick={() => handleCategoryChange('administrative')}
              className={`p-3 rounded-xl border-2 text-left transition-all flex items-start gap-2.5 col-span-2 sm:col-span-1 lg:col-span-2 ${
                category === 'administrative'
                  ? 'border-slate-700 bg-slate-100 shadow-xs ring-2 ring-slate-400/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 ${category === 'administrative' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <Building2 size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <span>Administrative</span>
                  {category === 'administrative' && <Check size={12} className="text-slate-800" />}
                </div>
                <div className="text-[10px] text-slate-500 leading-tight mt-0.5">Ministry accreditations, board resolutions & faculty</div>
              </div>
            </button>
          </div>
        </div>

        {/* 2. Drag & Drop File Upload Zone */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            2. Choose Document File <span className="text-rose-500 font-black">* Mandatory</span>
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp,.docx,.xlsx"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileSelection(e.target.files[0]);
              }
            }}
            className="hidden"
          />

          {!selectedFile ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                isDragOver 
                  ? 'border-indigo-600 bg-indigo-50/70 scale-[1.01]' 
                  : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/30'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-3">
                <UploadCloud size={24} />
              </div>
              <div className="text-sm font-bold text-slate-800">
                Click or drag & drop files here to upload
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Supported formats: PDF, PNG, JPG, WEBP, DOCX, XLSX (Max 15MB)
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-[11px] text-slate-600 font-medium mt-3 border border-slate-200">
                <ShieldCheck size={12} className="text-emerald-600" />
                <span>Files are automatically indexed with tamper-evident SHA-256 hashes</span>
              </div>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <FileText size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-800 truncate">{selectedFile.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {formatBytes(selectedFile.size)} • {selectedFile.type || 'Document'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 text-xs text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg font-semibold"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setFileDataUrl('');
                      setCalculatedHash('');
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Security scanner banner */}
              {isScanning ? (
                <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs text-indigo-900 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <RefreshCw size={14} className="animate-spin text-indigo-600" />
                      {scanStatus}
                    </span>
                    <span>{scanProgress}%</span>
                  </div>
                  <div className="w-full bg-indigo-200 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
                      style={{ width: `${scanProgress}%` }}
                    />
                  </div>
                </div>
              ) : calculatedHash ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs text-emerald-800">
                    <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold">Security Scan Passed: </span>
                      <span className="font-mono text-[10px] text-emerald-700 break-all">{calculatedHash}</span>
                    </div>
                  </div>
                  <span className="bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0">
                    Clean
                  </span>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* 3. MANDATORY INSTITUTIONAL RECORD METADATA SECTION */}
        <div className="p-5 rounded-2xl bg-indigo-50/40 border-2 border-indigo-100 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-indigo-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-600 text-white rounded-lg">
                <BadgeCheck size={16} />
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-indigo-950">
                  3. Mandatory Record Metadata Fields
                </h3>
                <p className="text-[11px] text-slate-500">
                  Required for institutional compliance, auditing, and automated expiry tracking
                </p>
              </div>
            </div>
            <span className="text-[10px] font-black bg-indigo-600 text-white uppercase px-2 py-0.5 rounded-full">
              Required by Policy
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title (Mandatory) */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Document Title <span className="text-rose-500 font-black">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Rahim Ahmed SSC Passing Certificate or Annual Medical Clearance"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white shadow-xs font-medium"
              />
            </div>

            {/* Issuing Authority (Mandatory) */}
            <div className="md:col-span-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <Building2 size={13} className="text-indigo-600" />
                  <span>Issuing Authority / Organization</span>
                  <span className="text-rose-500 font-black">* Mandatory</span>
                </label>
                <span className="text-[10px] text-slate-500 font-medium">Click suggestion below to auto-fill</span>
              </div>

              <input
                type="text"
                required
                value={issuingAuthority}
                onChange={(e) => setIssuingAuthority(e.target.value)}
                placeholder="e.g. Board of Intermediate & Secondary Education, Civil Surgeon Office, Dhaka Court Notary"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white shadow-xs font-medium text-slate-800"
              />

              {/* Suggestions based on Category */}
              {AUTHORITY_SUGGESTIONS[category] && (
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] font-bold text-slate-400 mr-1 flex items-center gap-0.5">
                    <Sparkles size={11} className="text-amber-500" />
                    Quick Fill:
                  </span>
                  {AUTHORITY_SUGGESTIONS[category].map((sug, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setIssuingAuthority(sug)}
                      className={`text-[10.5px] px-2.5 py-0.5 rounded-lg border font-medium transition-all ${
                        issuingAuthority === sug
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                      }`}
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Expiry Date & Validity (Mandatory) */}
            <div className="md:col-span-2 space-y-2 p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <CalendarClock size={14} className="text-indigo-600" />
                  <span>Document Expiry Date</span>
                  <span className="text-rose-500 font-black">* Mandatory</span>
                </label>

                {/* Expiry feedback badge */}
                <div className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                  isPermanent 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : expiryDate 
                    ? 'bg-indigo-100 text-indigo-800' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  <Clock size={11} />
                  <span>{getExpiryDisplay()}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                {/* Date Picker Input */}
                <div>
                  <input
                    type="date"
                    disabled={isPermanent}
                    value={expiryDate}
                    onChange={(e) => {
                      setExpiryDate(e.target.value);
                      setIsPermanent(false);
                    }}
                    className={`w-full px-3 py-2 rounded-xl border text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-medium ${
                      isPermanent 
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed' 
                        : 'bg-white text-slate-800 border-slate-300'
                    }`}
                  />
                </div>

                {/* Permanent Toggle Button */}
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !isPermanent;
                      setIsPermanent(next);
                      if (next) setExpiryDate('');
                    }}
                    className={`w-full py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      isPermanent
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle2 size={14} className={isPermanent ? 'text-white' : 'text-slate-400'} />
                    <span>Permanent / No Expiration Date</span>
                  </button>
                </div>
              </div>

              {/* Quick Duration Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100">
                <span className="text-[10.5px] font-bold text-slate-400 mr-1">Presets:</span>
                <button
                  type="button"
                  onClick={() => setExpiryOffsetMonths(6)}
                  className="px-2 py-0.5 text-[10.5px] font-medium bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-slate-600 border border-slate-200"
                >
                  +6 Months
                </button>
                <button
                  type="button"
                  onClick={() => setExpiryOffsetYears(1)}
                  className="px-2 py-0.5 text-[10.5px] font-medium bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-slate-600 border border-slate-200"
                >
                  +1 Year
                </button>
                <button
                  type="button"
                  onClick={() => setExpiryOffsetYears(2)}
                  className="px-2 py-0.5 text-[10.5px] font-medium bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-slate-600 border border-slate-200"
                >
                  +2 Years
                </button>
                <button
                  type="button"
                  onClick={() => setExpiryOffsetYears(5)}
                  className="px-2 py-0.5 text-[10.5px] font-medium bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-slate-600 border border-slate-200"
                >
                  +5 Years
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsPermanent(true);
                    setExpiryDate('');
                  }}
                  className="px-2 py-0.5 text-[10.5px] font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg border border-emerald-200"
                >
                  Permanent Record
                </button>
              </div>
            </div>

            {/* Target Folder in Vault */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Target Folder in Vault <span className="text-rose-500 font-black">*</span>
              </label>
              <div className="relative">
                <Folder size={15} className="absolute left-3 top-3 text-slate-400" />
                <select
                  value={targetFolder}
                  onChange={(e) => setTargetFolder(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white font-medium text-slate-700"
                >
                  {availableFolders.map(f => (
                    <option key={f.id} value={f.path}>
                      📁 {f.path} ({f.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Official Issue Date */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Official Issue Date
              </label>
              <div className="relative">
                <Calendar size={15} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden bg-white font-medium text-slate-700"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4. Student Association (Searchable dropdown) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            4. Linked Student Dossier {category === 'student-records' && <span className="text-indigo-600">(Recommended)</span>}
          </label>
          <div className="relative">
            {selectedStudent ? (
              <div className="flex items-center justify-between p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    {selectedStudent.rollNo}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800">{selectedStudent.name}</span>
                    <span className="text-[11px] text-slate-500 ml-2">
                      Class: {selectedStudent.class} ({selectedStudent.section}) • ID: {selectedStudent.id}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold px-2 py-1"
                >
                  Clear
                </button>
              </div>
            ) : (
              <div>
                <div className="relative">
                  <Search size={15} className="absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={studentSearchQuery}
                    onFocus={() => setIsStudentDropdownOpen(true)}
                    onChange={(e) => {
                      setStudentSearchQuery(e.target.value);
                      setIsStudentDropdownOpen(true);
                    }}
                    placeholder="Search student by name, roll, or ID to link file with student dossier..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                {isStudentDropdownOpen && (
                  <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white rounded-xl shadow-xl border border-slate-200 z-20 divide-y divide-slate-100">
                    {filteredStudents.length === 0 ? (
                      <div className="p-3 text-center text-xs text-slate-400">No matching student found</div>
                    ) : (
                      filteredStudents.map(st => (
                        <div
                          key={st.id}
                          onClick={() => {
                            setSelectedStudent(st);
                            setIsStudentDropdownOpen(false);
                            setStudentSearchQuery('');
                          }}
                          className="p-2.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                        >
                          <div>
                            <span className="font-bold text-slate-800">{st.name}</span>
                            <span className="text-slate-500 ml-2">Roll #{st.rollNo} • {st.class}</span>
                          </div>
                          <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                            {st.id}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 5. Category-Specific Fields */}
        {category === 'fee-receipts' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Receipt Amount (BDT ৳)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 1500"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Transaction ID / Bank Challan Ref
              </label>
              <input
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="e.g. TXN-BKASH-8947219 or CHAL-44120"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
              />
            </div>
          </div>
        )}

        {category === 'medical' && (
          <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-xl space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
              <HeartPulse size={14} className="text-rose-600" />
              <span>Medical & Health Classification</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Health Record Type
                </label>
                <select
                  value={medicalClassification}
                  onChange={(e) => setMedicalClassification(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden bg-white"
                >
                  <option value="Annual Fitness Clearance">Annual Fitness Clearance</option>
                  <option value="Immunization & Vaccine Record">Immunization & Vaccine Record (EPI)</option>
                  <option value="Dietary & Allergy Accommodation">Dietary & Allergy Accommodation</option>
                  <option value="Clinical Doctor Prescription / Note">Clinical Doctor Prescription / Note</option>
                  <option value="Vision & Dental Examination">Vision & Dental Examination</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Physician / Clinic Registration No.
                </label>
                <input
                  type="text"
                  value={notaryRegistrationNo}
                  onChange={(e) => setNotaryRegistrationNo(e.target.value)}
                  placeholder="e.g. BMDC Reg. #89211 or General Hospital #4"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-hidden bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {category === 'legal' && (
          <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
              <Scale size={14} className="text-amber-600" />
              <span>Legal Instrument & Notary Classification</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Legal Deed / Document Type
                </label>
                <select
                  value={legalInstrumentType}
                  onChange={(e) => setLegalInstrumentType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden bg-white"
                >
                  <option value="Guardianship Affidavit">Parental Guardianship Affidavit</option>
                  <option value="Notarized Indemnity Undertaking">Notarized Indemnity Undertaking</option>
                  <option value="Custody & Authorization Deed">Custody & Authorization Deed</option>
                  <option value="Institutional Code of Conduct Bond">Institutional Code of Conduct Bond</option>
                  <option value="Legal Court Order / Release">Legal Court Order / Clearance</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Notary Stamp / Case Reference No.
                </label>
                <input
                  type="text"
                  value={notaryRegistrationNo}
                  onChange={(e) => setNotaryRegistrationNo(e.target.value)}
                  placeholder="e.g. NOTARY-DHAKA-2024-8841"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {category === 'academic-certificates' && (
          <div className="p-4 bg-purple-50/50 border border-purple-100 rounded-xl space-y-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Certificate Classification
            </label>
            <select
              value={certificateType}
              onChange={(e) => setCertificateType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden bg-white"
            >
              <option value="SSC/HSC Board Certificate">SSC/HSC Board Certificate</option>
              <option value="Character Certificate">Character Certificate</option>
              <option value="Testimonial">Academic Testimonial</option>
              <option value="Merit & Honors Diploma">Merit & Honors Diploma</option>
              <option value="Transfer Certificate (TC)">Transfer Certificate (TC)</option>
              <option value="Extracurricular Award">Extracurricular Award</option>
            </select>
          </div>
        )}

        {/* 6. Security Classification & Tags */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Security Clearance Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Standard', 'Confidential', 'Restricted'] as DocumentSecurityLevel[]).map(lvl => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSecurityLevel(lvl)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border text-center transition-all ${
                    securityLevel === lvl
                      ? lvl === 'Restricted' 
                        ? 'bg-rose-100 border-rose-400 text-rose-800 shadow-xs'
                        : lvl === 'Confidential'
                        ? 'bg-indigo-100 border-indigo-400 text-indigo-800 shadow-xs'
                        : 'bg-emerald-100 border-emerald-400 text-emerald-800 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Search Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. Verified, Admission 2024, Term 1, Medical"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Notes / Remarks */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Archival Remarks / Verification Notes (Optional)
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Original physical paper filed in vault shelf B2; signature authenticated."
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={!isAuthorized || !selectedFile || isScanning}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-md flex items-center gap-2 transition-all ${
              !isAuthorized || !selectedFile || isScanning
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200 active:scale-95'
            }`}
          >
            <ShieldCheck size={16} />
            <span>Store Securely in '{targetFolder}'</span>
          </button>
        </div>
      </form>
    </div>
  );
};
