import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Upload, Printer, Download, Sparkles, Check, CheckCircle2, RotateCcw, 
  Send, User, Phone, MapPin, Calendar, FileText, AlertCircle, Eye, School,
  Building2, ChevronDown, PenTool, ShieldCheck, FileCheck, Save, Clock, FileSpreadsheet, X
} from 'lucide-react';
import { Button, useToast } from './UIComponents';
import { MOCK_TENANTS } from '../constants';
import { SignaturePadField } from './SignaturePadField';
import { AdmissionPdfPreviewModal } from './AdmissionPdfPreviewModal';
import { LanguageToggle } from './LanguageToggle';
import { useLanguage } from '../context/LanguageContext';
import { triggerPendingApprovalWorkflow } from '../utils/admissionWorkflow';
import { useAuth } from '../context/AuthContext';
import { UserRole, Tenant } from '../types';

const AUTO_SAVE_STORAGE_KEY = 'student_admission_form_draft_v1';
const AUTO_SAVE_TIMESTAMP_KEY = 'student_admission_form_draft_time_v1';

export interface StudentAdmissionFormData {
  // 0. Institutional Metadata
  tenantId?: string;
  tenantName?: string;
  institutionType?: 'School' | 'College' | 'Madrasa' | 'University';

  // 1. Student Information
  studentPhoto?: string;
  studentNameEn: string;
  studentNameNative: string;
  email: string;
  dob: string;
  birthCertificateNo: string;
  gender: string;
  bloodGroup: string;

  // 2. Parents Information
  fatherNameEn: string;
  fatherNameNative: string;
  fatherMobile: string;
  fatherOccupation: string;
  motherNameEn: string;
  motherNameNative: string;
  motherMobile: string;
  motherOccupation: string;

  // 3. Guardian Information
  guardianName: string;
  guardianRelation: string;
  guardianAddress: string;
  guardianMobile: string;

  // 4. Present Address
  presentVillage: string;
  presentPost: string;
  presentThana: string;
  presentDistrict: string;

  // 5. Permanent Address
  sameAsPresent: boolean;
  permanentVillage: string;
  permanentPost: string;
  permanentThana: string;
  permanentDistrict: string;

  // 6. Admission Information
  selectedClass: string;
  selectedGroup: string;
  section: string;
  shift: string;
  academicYear: string;

  // Type-specific fields
  // Madrasa
  residentialStatus?: 'আবাসিক' | 'অনাবাসিক' | 'ডে-কেয়ার';
  previousMadrasaOrMaktab?: string;
  // School
  mediumOrVersion?: 'বাংলা মাধ্যম' | 'ইংরেজি ভার্সন';
  // College & University
  sscRoll?: string;
  sscReg?: string;
  sscBoard?: string;
  sscGpa?: string;
  sscPassingYear?: string;
  sscGroup?: string;
  // University specific
  hscGpa?: string;
  hscBoard?: string;
  hscPassingYear?: string;
  targetSemester?: string;
  waiverCategory?: string;

  // 7. Previous Academic Information
  previousSchoolName: string;

  // 8. Signatures & Institutional Validation
  guardianSignatureType: 'draw' | 'upload';
  guardianSignatureData: string;
  guardianSignatoryName: string;
  guardianSignDate: string;

  schoolRepSignatureType: 'draw' | 'upload';
  schoolRepSignatureData: string;
  schoolRepName: string;
  schoolRepDesignation: string;
  schoolValidationDate: string;
  schoolValidationStatus: string;
}

export interface InstitutionProfile {
  id?: string;
  name: string;
  subTitle?: string;
  establishedYear?: string;
  address: string;
  contactNumber: string;
  contactEmail?: string;
  eiinNumber?: string;
  code?: string;
  principalName?: string;
  logoBadgeText?: string;
  locationTag?: string;
  institutionType?: 'School' | 'College' | 'Madrasa' | 'University';
}

const DEFAULT_INSTITUTIONS: InstitutionProfile[] = [
  {
    name: 'KALIGANJ IKRA ACADEMY MODEL SCHOOL',
    subTitle: 'SAMPLE DEMO SCHOOL TEMPLATE',
    establishedYear: '1994',
    address: 'Karimpur, Kashiram, Kaliganj, Lalmonirhat',
    contactNumber: '01717-452764',
    eiinNumber: '128456',
    logoBadgeText: 'KALIGANJ MODEL KINDER GARTEN',
    locationTag: 'Kaliganj, Lalmonirhat'
  },
  {
    name: 'DHAKA CITY COLLEGE & MODEL ACADEMY',
    subTitle: 'APPROVED BY MINISTRY OF EDUCATION',
    establishedYear: '1957',
    address: 'Road No. 2, Dhanmondi, Dhaka - 1205',
    contactNumber: '+880 2-9670014, 01711-223344',
    eiinNumber: '107975',
    logoBadgeText: 'DHAKA CITY COLLEGE',
    locationTag: 'Dhanmondi, Dhaka'
  },
  {
    name: 'GREEN LEAF INTERNATIONAL SCHOOL',
    subTitle: 'ENGLISH & BENGALI MEDIUM CURRICULUM',
    establishedYear: '2005',
    address: 'House #42, Sector 7, Uttara Model Town, Dhaka',
    contactNumber: '01819-876543, 01755-667788',
    eiinNumber: '134890',
    logoBadgeText: 'GREEN LEAF ACADEMY',
    locationTag: 'Uttara, Dhaka'
  }
];

const INITIAL_FORM_DATA: StudentAdmissionFormData = {
  studentPhoto: '',
  studentNameEn: '',
  studentNameNative: '',
  email: '',
  dob: '',
  birthCertificateNo: '',
  gender: 'Male',
  bloodGroup: 'None',

  fatherNameEn: '',
  fatherNameNative: '',
  fatherMobile: '',
  fatherOccupation: '',
  motherNameEn: '',
  motherNameNative: '',
  motherMobile: '',
  motherOccupation: '',

  guardianName: '',
  guardianRelation: '',
  guardianAddress: '',
  guardianMobile: '',

  presentVillage: '',
  presentPost: '',
  presentThana: '',
  presentDistrict: '',

  sameAsPresent: false,
  permanentVillage: '',
  permanentPost: '',
  permanentThana: '',
  permanentDistrict: '',

  selectedClass: 'Play',
  selectedGroup: 'General',
  section: 'A',
  shift: 'Morning',
  academicYear: '2026',

  previousSchoolName: '',

  // 8. Signatures & Validation
  guardianSignatureType: 'draw',
  guardianSignatureData: '',
  guardianSignatoryName: '',
  guardianSignDate: new Date().toISOString().split('T')[0],

  schoolRepSignatureType: 'draw',
  schoolRepSignatureData: '',
  schoolRepName: 'Headmaster / Admission In-Charge',
  schoolRepDesignation: 'Principal / Head of Institution',
  schoolValidationDate: new Date().toISOString().split('T')[0],
  schoolValidationStatus: 'Pending Approval'
};

export const SAMPLE_GUARDIAN_SIGNATURE = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='90' viewBox='0 0 300 90'><path d='M20,60 C35,20 45,15 55,65 C62,75 70,30 85,35 C95,40 100,60 115,55 C130,50 145,20 160,50 C170,68 185,35 205,45 C220,52 235,30 255,42 C265,48 275,35 285,40 M45,70 L260,68' fill='none' stroke='%231e3a8a' stroke-width='2.6' stroke-linecap='round' stroke-linejoin='round'/></svg>";

export const SAMPLE_SCHOOL_REP_SIGNATURE = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='90' viewBox='0 0 300 90'><path d='M25,50 C40,15 50,12 60,60 C70,35 85,25 95,55 C110,20 125,18 140,58 C155,30 170,25 190,48 C205,30 220,25 240,40 C250,20 260,15 270,35 M50,45 Q120,85 240,55' fill='none' stroke='%23047857' stroke-width='2.6' stroke-linecap='round' stroke-linejoin='round'/></svg>";

const DEMO_FILL_DATA: StudentAdmissionFormData = {
  studentPhoto: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200',
  studentNameEn: 'MD. AL-AMIN HOSSAIN',
  studentNameNative: 'মোঃ আল-আমিন হোসেন',
  email: 'alamin.student@gmail.com',
  dob: '2016-04-12',
  birthCertificateNo: '20165213456789012',
  gender: 'Male',
  bloodGroup: 'A+',

  fatherNameEn: 'MD. RAFIQUL ISLAM',
  fatherNameNative: 'মোঃ রফিকুল ইসলাম',
  fatherMobile: '01712345678',
  fatherOccupation: 'Businessman',
  motherNameEn: 'MST. RASHIDA BEGUM',
  motherNameNative: 'মোছাঃ রাশিদা বেগম',
  motherMobile: '01912345678',
  motherOccupation: 'Homemaker',

  guardianName: 'MD. RAFIQUL ISLAM',
  guardianRelation: 'Father',
  guardianAddress: 'Karimpur, Kashiram, Kaliganj',
  guardianMobile: '01712345678',

  presentVillage: 'Karimpur, Kashiram Road',
  presentPost: 'Kashiram - 5630',
  presentThana: 'Kaliganj',
  presentDistrict: 'Lalmonirhat',

  sameAsPresent: true,
  permanentVillage: 'Karimpur, Kashiram Road',
  permanentPost: 'Kashiram - 5630',
  permanentThana: 'Kaliganj',
  permanentDistrict: 'Lalmonirhat',

  selectedClass: 'Class 6',
  selectedGroup: 'General',
  section: 'A',
  shift: 'Morning',
  academicYear: '2026',

  previousSchoolName: 'Kaliganj Model Primary School',

  // 8. Signatures & Validation
  guardianSignatureType: 'draw',
  guardianSignatureData: SAMPLE_GUARDIAN_SIGNATURE,
  guardianSignatoryName: 'MD. RAFIQUL ISLAM',
  guardianSignDate: '2026-04-12',

  schoolRepSignatureType: 'draw',
  schoolRepSignatureData: SAMPLE_SCHOOL_REP_SIGNATURE,
  schoolRepName: 'PROF. ABDUL WAHAB KHAN',
  schoolRepDesignation: 'Headmaster / Principal',
  schoolValidationDate: '2026-04-12',
  schoolValidationStatus: 'Approved'
};

interface StudentAdmissionFormProps {
  tenant?: Tenant;
  institutionType?: 'School' | 'College' | 'Madrasa' | 'University';
  onSuccessSubmit?: (data: StudentAdmissionFormData) => void;
  onClose?: () => void;
  onComplete?: () => void;
  customSchoolName?: string;
  customSchoolAddress?: string;
  customSchoolContact?: string;
  customSchoolEmail?: string;
  customSchoolSubTitle?: string;
  customEstablishedYear?: string;
  customLogoBadgeText?: string;
  customEiin?: string;
  customCode?: string;
  customPrincipal?: string;
  isPublicMode?: boolean;
}

export const StudentAdmissionForm: React.FC<StudentAdmissionFormProps> = ({
  tenant,
  institutionType,
  onSuccessSubmit,
  onClose,
  onComplete,
  customSchoolName,
  customSchoolAddress,
  customSchoolContact,
  customSchoolEmail,
  customSchoolSubTitle,
  customEstablishedYear,
  customLogoBadgeText,
  customEiin,
  customCode,
  customPrincipal,
  isPublicMode = false
}) => {
  const { showToast } = useToast();
  const { language, t } = useLanguage();
  const { activeTenant, user } = useAuth();
  
  // Resolve effective tenant and type strictly for this institution
  const effectiveTenant = tenant || activeTenant;
  const effectiveType: 'School' | 'College' | 'Madrasa' | 'University' = 
    institutionType || 
    effectiveTenant?.type || 
    (customSchoolName?.includes('মাদ্রাসা') ? 'Madrasa' : 
     customSchoolName?.includes('কলেজ') ? 'College' : 
     customSchoolName?.includes('বিশ্ববিদ্যালয়') ? 'University' : 'School');

  const buildProfile = (): InstitutionProfile => {
    if (effectiveTenant) {
      return {
        id: effectiveTenant.id,
        name: effectiveTenant.name,
        subTitle: effectiveType === 'Madrasa'
          ? 'বাংলাদেশ মাদ্রাসা শিক্ষা বোর্ড অনুমোদিত দ্বীনি শিক্ষা প্রতিষ্ঠান'
          : effectiveType === 'College'
          ? 'মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড ও জাতীয় বিশ্ববিদ্যালয় অধিভুক্ত'
          : effectiveType === 'University'
          ? 'বিশ্ববিদ্যালয় মঞ্জুরি কমিশন (UGC) ও শিক্ষা মন্ত্রণালয় অনুমোদিত স্থায়ী ক্যাম্পাস'
          : 'মাধ্যমিক ও উচ্চ মাধ্যমিক শিক্ষা বোর্ড অধিভুক্ত মডেল বিদ্যাপীঠ',
        establishedYear: effectiveTenant.establishedYear || '১৯৮৫',
        address: effectiveTenant.address || 'ঢাকা, বাংলাদেশ',
        contactNumber: effectiveTenant.contactPhone || '+৮৮০ ১৭১২-৩৪৫৬৭৮',
        contactEmail: effectiveTenant.contactEmail || `info@${effectiveTenant.subdomain}.edu.bd`,
        eiinNumber: effectiveTenant.eiin,
        code: effectiveTenant.code,
        principalName: effectiveTenant.principalName,
        logoBadgeText: effectiveTenant.name,
        locationTag: effectiveTenant.address?.split(',')[0] || 'ক্যাম্পাস',
        institutionType: effectiveType
      };
    }
    if (customSchoolName) {
      return {
        name: customSchoolName,
        subTitle: customSchoolSubTitle || (effectiveType === 'Madrasa' ? 'দ্বীনি শিক্ষা প্রতিষ্ঠান' : 'অফিসিয়াল ভর্তি আবেদন ফরম'),
        establishedYear: customEstablishedYear || '১৯৮৫',
        address: customSchoolAddress || 'ঢাকা, বাংলাদেশ',
        contactNumber: customSchoolContact || '+৮৮০ ১৭১২-৩৪৫৬৭৮',
        contactEmail: customSchoolEmail,
        eiinNumber: customEiin,
        code: customCode,
        principalName: customPrincipal,
        logoBadgeText: customLogoBadgeText || customSchoolName,
        locationTag: customSchoolAddress || 'ক্যাম্পাস',
        institutionType: effectiveType
      };
    }
    return DEFAULT_INSTITUTIONS[0];
  };

  // Institution Info state (dynamic per school/tenant)
  const [selectedInstIndex, setSelectedInstIndex] = useState<number>(0);
  const [institution, setInstitution] = useState<InstitutionProfile>(buildProfile);

  // Update institution if props or activeTenant changes
  useEffect(() => {
    setInstitution(buildProfile());
  }, [tenant, institutionType, customSchoolName, customSchoolAddress, customSchoolContact, activeTenant]);

  const getInitialClass = () => {
    if (effectiveType === 'Madrasa') return 'নূরানী শিশু শ্রেণি';
    if (effectiveType === 'College') return 'উচ্চ মাধ্যমিক (HSC ১ম বর্ষ)';
    if (effectiveType === 'University') return 'B.Sc. in Computer Science & Engineering (CSE)';
    return '১ম শ্রেণি';
  };

  const getInitialGroup = () => {
    if (effectiveType === 'Madrasa') return 'সাধারণ ইসলামিয়াত';
    if (effectiveType === 'College') return 'বিজ্ঞান শাখা';
    if (effectiveType === 'University') return 'Faculty of Science & Engineering';
    return 'সাধারণ';
  };

  // Auto-Save: Load existing draft from localStorage on initial load
  const [formData, setFormData] = useState<StudentAdmissionFormData>(() => {
    const defaultData: StudentAdmissionFormData = {
      ...INITIAL_FORM_DATA,
      tenantId: effectiveTenant?.id || '',
      tenantName: effectiveTenant?.name || customSchoolName || '',
      institutionType: effectiveType,
      selectedClass: getInitialClass(),
      selectedGroup: getInitialGroup(),
      residentialStatus: 'আবাসিক',
      mediumOrVersion: 'বাংলা মাধ্যম',
      targetSemester: 'Spring 2025'
    };

    try {
      const savedDraft = localStorage.getItem(`${AUTO_SAVE_STORAGE_KEY}_${effectiveTenant?.id || 'default'}`);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        return { ...defaultData, ...parsed };
      }
    } catch (e) {
      console.warn('Failed to load admission form draft:', e);
    }
    return defaultData;
  });

  const [photoPreview, setPhotoPreview] = useState<string>(() => formData.studentPhoto || '');
  const [fileName, setFileName] = useState<string>(formData.studentPhoto ? 'saved_photo.jpg' : 'No file chosen');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<StudentAdmissionFormData | null>(null);
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);

  // Auto-save status tracking
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(() => {
    try {
      return localStorage.getItem(AUTO_SAVE_TIMESTAMP_KEY) || null;
    } catch {
      return null;
    }
  });

  const isInitialMount = useRef(true);

  // Auto-save effect: debounced write to browser storage
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    setAutoSaveStatus('saving');
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(AUTO_SAVE_STORAGE_KEY, JSON.stringify(formData));
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        localStorage.setItem(AUTO_SAVE_TIMESTAMP_KEY, timeStr);
        setLastSavedTime(timeStr);
        setAutoSaveStatus('saved');
      } catch (err) {
        console.error('Error auto-saving form data:', err);
        setAutoSaveStatus('idle');
      }
    }, 600); // 600ms debounce

    return () => clearTimeout(timer);
  }, [formData]);

  // Field change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Checkbox toggle for same as present address
  const handleSameAddressToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setFormData(prev => ({
      ...prev,
      sameAsPresent: checked,
      permanentVillage: checked ? prev.presentVillage : prev.permanentVillage,
      permanentPost: checked ? prev.presentPost : prev.permanentPost,
      permanentThana: checked ? prev.presentThana : prev.permanentThana,
      permanentDistrict: checked ? prev.presentDistrict : prev.permanentDistrict
    }));
  };

  // Image Upload handler
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        const resultStr = reader.result as string;
        setPhotoPreview(resultStr);
        setFormData(prev => ({ ...prev, studentPhoto: resultStr }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Fill Demo Data
  const handleFillDemo = () => {
    setFormData(DEMO_FILL_DATA);
    setPhotoPreview(DEMO_FILL_DATA.studentPhoto || '');
    setFileName('student_photo_passport.jpg');
    showToast('Demo student details successfully filled into the form!', 'info');
  };

  // Reset Form
  const handleReset = () => {
    setFormData(INITIAL_FORM_DATA);
    setPhotoPreview('');
    setFileName('No file chosen');
    try {
      localStorage.removeItem(AUTO_SAVE_STORAGE_KEY);
      localStorage.removeItem(AUTO_SAVE_TIMESTAMP_KEY);
      setLastSavedTime(null);
      setAutoSaveStatus('idle');
    } catch (e) {
      console.error('Error clearing local storage draft:', e);
    }
    showToast('Form fields have been reset and saved draft cleared', 'info');
  };

  // Explicit Save Draft action
  const handleManualSave = () => {
    try {
      localStorage.setItem(AUTO_SAVE_STORAGE_KEY, JSON.stringify(formData));
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      localStorage.setItem(AUTO_SAVE_TIMESTAMP_KEY, timeStr);
      setLastSavedTime(timeStr);
      setAutoSaveStatus('saved');
      showToast('Form inputs safely saved to browser storage!', 'success');
    } catch (err) {
      showToast('Could not save draft to browser storage', 'error');
    }
  };

  // Switch Institution
  const handleSelectInstitution = (index: number) => {
    setSelectedInstIndex(index);
    const target = DEFAULT_INSTITUTIONS[index];
    setInstitution(target);
    localStorage.setItem('active_school_profile', JSON.stringify(target));
    showToast(`Institution switched to: ${target.name}`, 'success');
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.studentNameEn.trim()) {
      showToast('Please enter Student Name in English (*)', 'error');
      return;
    }
    if (!formData.fatherNameEn.trim()) {
      showToast("Please enter Father's Name in English (*)", 'error');
      return;
    }
    if (!formData.fatherMobile.trim()) {
      showToast("Please enter Father's Mobile Number (*)", 'error');
      return;
    }
    if (!formData.motherNameEn.trim()) {
      showToast("Please enter Mother's Name in English (*)", 'error');
      return;
    }
    if (!formData.guardianSignatureData || !formData.guardianSignatureData.trim()) {
      showToast("Please sign in the Parent / Guardian Digital Signature Pad or upload signature (*)", 'error');
      return;
    }

    // Auto-populate signatory name if not typed
    const finalGuardianName = formData.guardianSignatoryName.trim() || formData.fatherNameEn.trim() || formData.guardianName.trim() || formData.motherNameEn.trim();
    const finalData = {
      ...formData,
      guardianSignatoryName: finalGuardianName,
      schoolValidationStatus: 'Pending Approval'
    };

    setIsSubmitting(true);

    const prefix = effectiveType === 'Madrasa' ? 'APP-AIM' : effectiveType === 'College' ? 'APP-DCC' : effectiveType === 'University' ? 'APP-DIU' : 'APP-SBS';
    const refCode = `${prefix}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedData({
        ...finalData,
        tenantId: effectiveTenant?.id || 'sonar-bangla',
        tenantName: institution.name,
        institutionType: effectiveType
      });

      // Save to localStorage scoped by tenant
      try {
        const tenantKey = `tenant_admissions_${effectiveTenant?.id || 'general'}`;
        const existingRaw = localStorage.getItem(tenantKey);
        const existingList = existingRaw ? JSON.parse(existingRaw) : [];
        const newRecord = {
          id: refCode,
          refCode: refCode,
          tenantId: effectiveTenant?.id || 'sonar-bangla',
          tenantName: institution.name,
          institutionType: effectiveType,
          studentName: finalData.studentNameEn,
          studentNameNative: finalData.studentNameNative,
          appliedClass: finalData.selectedClass,
          group: finalData.selectedGroup,
          fatherMobile: finalData.fatherMobile,
          guardianName: finalGuardianName,
          submissionDate: new Date().toISOString(),
          status: 'Pending Approval',
          data: finalData
        };
        existingList.unshift(newRecord);
        localStorage.setItem(tenantKey, JSON.stringify(existingList));

        // Also add to global list
        const globalRaw = localStorage.getItem('all_tenant_admissions_v1');
        const globalList = globalRaw ? JSON.parse(globalRaw) : [];
        globalList.unshift(newRecord);
        localStorage.setItem('all_tenant_admissions_v1', JSON.stringify(globalList));
      } catch (saveErr) {
        console.error('Failed to persist admission request:', saveErr);
      }

      // Automated Workflow Trigger: Notify School Admin via Communication Center
      try {
        triggerPendingApprovalWorkflow({
          studentName: finalData.studentNameEn,
          studentNameNative: finalData.studentNameNative,
          appliedClass: finalData.selectedClass,
          group: finalData.selectedGroup,
          guardianName: finalGuardianName,
          guardianMobile: finalData.fatherMobile || finalData.guardianMobile || '01712345678',
          customMessage: `Automated Workflow Triggered: Student admission form for ${finalData.studentNameEn.toUpperCase()} (${finalData.selectedClass}) reached 'Pending Approval'. Scoped to ${institution.name}.`
        });
      } catch (workflowErr) {
        console.error('Workflow trigger execution error:', workflowErr);
      }

      try {
        localStorage.removeItem(`${AUTO_SAVE_STORAGE_KEY}_${effectiveTenant?.id || 'default'}`);
        localStorage.removeItem(AUTO_SAVE_STORAGE_KEY);
        localStorage.removeItem(AUTO_SAVE_TIMESTAMP_KEY);
        setLastSavedTime(null);
        setAutoSaveStatus('idle');
      } catch (e) {
        console.error('Error clearing submitted draft:', e);
      }

      showToast(`ভর্তি আবেদন সফলভাবে জমা হয়েছে! ট্র্যাকিং কোড: ${refCode}`, 'success');
      if (onSuccessSubmit) {
        onSuccessSubmit(finalData);
      }
      if (onComplete) {
        onComplete();
      }
    }, 600);
  };

  // Print Form Handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-4 print:my-0">
      {/* Top Helper Toolbar (Hidden in Print) */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-white p-3 rounded-xl border border-slate-200 shadow-xs print:hidden">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white ${
            effectiveType === 'Madrasa' ? 'bg-[#07442f]' : effectiveType === 'College' ? 'bg-blue-700' : effectiveType === 'University' ? 'bg-rose-900' : 'bg-emerald-600'
          }`}>
            <School size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">{institution.name} - ভর্তি আবেদন</h3>
            <p className="text-xs text-slate-500 font-medium">
              {effectiveType === 'Madrasa' ? 'মাদ্রাসা শিক্ষাক্রম ভর্তি ফরম' : effectiveType === 'College' ? 'একাদশ শ্রেণি ও ডিগ্রি ভর্তি ফরম' : effectiveType === 'University' ? 'আন্ডারগ্র্যাজুয়েট ও গ্র্যাজুয়েট ভর্তি' : 'বিদ্যালয় ভর্তি ফরম'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Institution Badge (Strict Multi-tenant isolation - No Switcher) */}
          <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-bold">
            <Building2 size={13} className={effectiveType === 'Madrasa' ? 'text-[#07442f]' : effectiveType === 'College' ? 'text-blue-700' : effectiveType === 'University' ? 'text-rose-900' : 'text-emerald-700'} />
            <span className="truncate max-w-[200px]">{institution.name}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-black text-white ${
              effectiveType === 'Madrasa' ? 'bg-[#07442f]' : effectiveType === 'College' ? 'bg-blue-700' : effectiveType === 'University' ? 'bg-rose-900' : 'bg-emerald-600'
            }`}>
              {effectiveType}
            </span>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              title="Close"
            >
              <X size={18} />
            </button>
          )}


          <Button
            size="sm"
            variant="outline"
            icon={Sparkles}
            onClick={handleFillDemo}
            className="text-xs bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100"
          >
            {t('auto_fill_demo')}
          </Button>

          {/* Auto-Save Status Badge & Manual Trigger */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors bg-slate-50 border-slate-200">
            {autoSaveStatus === 'saving' ? (
              <span className="flex items-center gap-1.5 text-amber-600">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                <span>{t('saving_draft')}</span>
              </span>
            ) : autoSaveStatus === 'saved' || lastSavedTime ? (
              <span className="flex items-center gap-1.5 text-emerald-700" title={`Auto-saved in browser storage at ${lastSavedTime || 'recently'}`}>
                <Check size={13} className="text-emerald-600" />
                <span className="hidden sm:inline">{t('auto_saved')}</span>
                {lastSavedTime && <span className="text-[10px] text-slate-500 font-mono">({lastSavedTime})</span>}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-slate-500">
                <Clock size={13} />
                <span className="hidden sm:inline">{t('auto_save_ready')}</span>
              </span>
            )}

            <button
              type="button"
              onClick={handleManualSave}
              className="ml-1 text-slate-400 hover:text-emerald-700 p-0.5 rounded cursor-pointer transition-colors"
              title="Click to force save draft now"
            >
              <Save size={13} />
            </button>
          </div>

          <Link to="/school/students/bulk-upload">
            <Button
              size="sm"
              variant="outline"
              icon={FileSpreadsheet}
              className="text-xs bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100"
            >
              CSV Bulk Upload
            </Button>
          </Link>

          <Button
            size="sm"
            variant="outline"
            icon={RotateCcw}
            onClick={handleReset}
            className="text-xs text-slate-600 border-slate-200 hover:bg-slate-50"
            title="Reset form and clear saved draft"
          >
            {t('reset')}
          </Button>

          <Button
            size="sm"
            variant="outline"
            icon={Eye}
            onClick={() => setIsPdfPreviewOpen(true)}
            className="text-xs text-indigo-700 border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100"
          >
            {t('live_pdf_preview')}
          </Button>

          <Button
            size="sm"
            variant="secondary"
            icon={Printer}
            onClick={handlePrint}
            className="text-xs bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            {t('print_form')}
          </Button>
        </div>
      </div>

      {/* Main Student Form Card */}
      <div className="bg-white border border-slate-300 shadow-md p-4 md:p-6 rounded-none font-sans text-slate-800 print:border-none print:shadow-none print:p-0">
        
        {/* ======================================================================= */}
        {/* INSTITUTION HEADER BOX (Type-specific Styling, Emblem & Official Info) */}
        {/* ======================================================================= */}
        <div className={`border-2 p-3 md:p-4 mb-5 bg-white relative ${
          effectiveType === 'Madrasa' ? 'border-[#07442f]' : 
          effectiveType === 'College' ? 'border-blue-900' : 
          effectiveType === 'University' ? 'border-rose-950' : 
          'border-[#166534]'
        }`}>
          {effectiveType === 'Madrasa' && (
            <div className="text-center pb-1 border-b border-emerald-100 mb-2">
              <span className="text-xs font-serif font-bold text-[#07442f] tracking-widest">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Left: Authentic Monogram Badge */}
            <div className="flex-shrink-0">
              <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 p-1 flex flex-col items-center justify-center text-center shadow-xs relative overflow-hidden ${
                effectiveType === 'Madrasa' ? 'border-emerald-600 bg-emerald-50' : 
                effectiveType === 'College' ? 'border-blue-500 bg-blue-50' : 
                effectiveType === 'University' ? 'border-rose-600 bg-rose-50' : 
                'border-amber-400 bg-amber-50'
              }`}>
                <div className="w-full h-full rounded-full border-2 border-slate-700/40 bg-white flex flex-col items-center justify-center p-1 relative text-center">
                  <span className="text-[7.5px] font-black leading-tight text-center uppercase tracking-tighter line-clamp-2 px-1 text-slate-900">
                    {institution.logoBadgeText || institution.name}
                  </span>
                  
                  {/* Emblem Symbol */}
                  <div className="my-0.5 flex items-center justify-center text-base">
                    {effectiveType === 'Madrasa' ? '🕌 📖' : effectiveType === 'College' ? '🎓 🏛️' : effectiveType === 'University' ? '🏫 🔬' : '👨‍🎓 👩‍🎓'}
                  </div>

                  <span className="text-[7px] font-black uppercase text-slate-800">
                    ESTD: {institution.establishedYear || '১৯৮৫'}
                  </span>
                  <span className="text-[6.5px] text-slate-600 font-bold uppercase truncate max-w-[70px]">
                    {institution.institutionType || effectiveType}
                  </span>
                </div>
              </div>
            </div>

            {/* Center: Dynamic Institution Titles & Contact Details */}
            <div className="flex-1 text-center">
              <p className="text-xs sm:text-sm font-semibold text-slate-700 tracking-wide mb-1 uppercase">
                {institution.subTitle}
              </p>
              
              <h1 className={`text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-tight mb-1.5 drop-shadow-2xs uppercase ${
                effectiveType === 'Madrasa' ? 'text-[#07442f]' : 
                effectiveType === 'College' ? 'text-blue-900' : 
                effectiveType === 'University' ? 'text-rose-950' : 
                'text-[#e11d48]'
              }`}>
                {institution.name}
              </h1>
              
              <p className="text-xs sm:text-sm font-bold text-slate-900">
                {institution.address}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2 mt-1 text-[11px] font-semibold text-slate-600">
                {institution.eiinNumber && (
                  <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-mono font-bold">
                    EIIN: {institution.eiinNumber}
                  </span>
                )}
                {institution.code && (
                  <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-mono font-bold">
                    কোড: {institution.code}
                  </span>
                )}
                <span>হেল্পলাইন: {institution.contactNumber}</span>
                {institution.contactEmail && <span>• {institution.contactEmail}</span>}
              </div>
            </div>

            {/* Right: Passport Photo Box / Placeholder */}
            <div className="w-22 h-26 sm:w-24 sm:h-28 border border-slate-400 bg-slate-50 rounded flex flex-col items-center justify-center text-center p-1 flex-shrink-0 overflow-hidden">
              {photoPreview ? (
                <img src={photoPreview} alt="Student" className="w-full h-full object-cover rounded" />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400">
                  <User size={28} className="text-slate-600 mb-1" />
                  <span className="text-[9px] font-bold text-slate-800 leading-tight uppercase">{t('passport_photo')}</span>
                  <span className="text-[7.5px] text-slate-500">300 x 300 px</span>
                </div>
              )}
            </div>

          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* ======================================================================= */}
          {/* SECTION 1: STUDENT INFORMATION */}
          {/* ======================================================================= */}
          <div className="border border-emerald-600 bg-white">
            <div className="bg-[#15803d] text-white px-3 py-1.5 text-sm font-bold flex items-center justify-between">
              <span>{t('student_info')}</span>
            </div>

            <div className="p-3 space-y-3">
              {/* Photo Upload Row */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('photo_upload')}
                </label>
                <div className="flex items-center border border-emerald-600 rounded-none bg-white overflow-hidden p-1 gap-2">
                  <label className="bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 px-3 py-1 text-xs font-medium cursor-pointer shadow-2xs">
                    {t('choose_file')}
                    <input 
                      type="file" 
                      accept="image/png, image/jpeg, image/jpg" 
                      onChange={handlePhotoUpload} 
                      className="hidden" 
                    />
                  </label>
                  <span className="text-xs text-slate-500 truncate">{fileName}</span>
                </div>
              </div>

              {/* Grid 1: Student Name En, Native Name, Email, DOB */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-0.5">
                    <span className="text-rose-600 font-bold">*</span> {t('student_name_en')}
                  </label>
                  <input
                    type="text"
                    name="studentNameEn"
                    value={formData.studentNameEn}
                    onChange={handleChange}
                    required
                    placeholder="Full Name in English"
                    className="w-full border border-emerald-600 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-emerald-700 rounded-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-0.5">
                    {t('student_name_bn')}
                  </label>
                  <input
                    type="text"
                    name="studentNameNative"
                    value={formData.studentNameNative}
                    onChange={handleChange}
                    placeholder="Full Name in Native Script"
                    className="w-full border border-emerald-600 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-emerald-700 rounded-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-0.5">
                    {t('email_opt')}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="student@example.com"
                    className="w-full border border-emerald-600 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-emerald-700 rounded-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-0.5">
                    {t('dob')}
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full border border-emerald-600 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-emerald-700 rounded-none bg-white"
                  />
                </div>
              </div>

              {/* Grid 2: Birth Certificate No, Gender, Blood Group */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-0.5">
                    {t('birth_certificate_no')}
                  </label>
                  <input
                    type="text"
                    name="birthCertificateNo"
                    value={formData.birthCertificateNo}
                    onChange={handleChange}
                    placeholder="Birth Registration / NID Number"
                    className="w-full border border-emerald-600 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-emerald-700 rounded-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-0.5">
                    <span className="text-rose-600 font-bold">*</span> {t('gender')}
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full border border-emerald-600 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-emerald-700 rounded-none bg-white"
                  >
                    <option value="Male">{t('male')}</option>
                    <option value="Female">{t('female')}</option>
                    <option value="Other">{t('other')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-0.5">
                    {t('blood_group')}
                  </label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    className="w-full border border-emerald-600 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-emerald-700 rounded-none bg-white"
                  >
                    <option value="None">None / Not Known</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================================= */}
          {/* SECTION 2: PARENTS INFORMATION */}
          {/* ======================================================================= */}
          <div className="border border-emerald-600 bg-white">
            <div className="bg-[#15803d] text-white px-3 py-1.5 text-sm font-bold">
              {t('parents_info')}
            </div>

            <div className="p-3 space-y-2.5">
              {/* Father's Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-0.5">
                    <span className="text-rose-600 font-bold">*</span> {t('father_name_en')}
                  </label>
                  <input
                    type="text"
                    name="fatherNameEn"
                    value={formData.fatherNameEn}
                    onChange={handleChange}
                    required
                    placeholder="Father's Name in English"
                    className="w-full border border-emerald-600 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-emerald-700 rounded-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-0.5">
                    {t('father_name_bn')}
                  </label>
                  <input
                    type="text"
                    name="fatherNameNative"
                    value={formData.fatherNameNative}
                    onChange={handleChange}
                    placeholder="Father's Name in Native Script"
                    className="w-full border border-emerald-600 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-emerald-700 rounded-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-0.5">
                    <span className="text-rose-600 font-bold">*</span> {t('father_mobile')}
                  </label>
                  <input
                    type="tel"
                    name="fatherMobile"
                    value={formData.fatherMobile}
                    onChange={handleChange}
                    required
                    placeholder="017xxxxxxxx"
                    className="w-full border border-emerald-600 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-emerald-700 rounded-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-0.5">
                    {t('father_occupation')}
                  </label>
                  <input
                    type="text"
                    name="fatherOccupation"
                    value={formData.fatherOccupation}
                    onChange={handleChange}
                    placeholder="e.g. Teacher, Business, Farmer"
                    className="w-full border border-emerald-600 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-emerald-700 rounded-none bg-white"
                  />
                </div>
              </div>

              {/* Mother's Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-0.5">
                    <span className="text-rose-600 font-bold">*</span> {t('mother_name_en')}
                  </label>
                  <input
                    type="text"
                    name="motherNameEn"
                    value={formData.motherNameEn}
                    onChange={handleChange}
                    required
                    placeholder="Mother's Name in English"
                    className="w-full border border-emerald-600 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-emerald-700 rounded-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-0.5">
                    {t('mother_name_bn')}
                  </label>
                  <input
                    type="text"
                    name="motherNameNative"
                    value={formData.motherNameNative}
                    onChange={handleChange}
                    placeholder="Mother's Name in Native Script"
                    className="w-full border border-emerald-600 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-emerald-700 rounded-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-0.5">
                    {t('mother_mobile')}
                  </label>
                  <input
                    type="tel"
                    name="motherMobile"
                    value={formData.motherMobile}
                    onChange={handleChange}
                    placeholder="01xxxxxxxxx"
                    className="w-full border border-emerald-600 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-emerald-700 rounded-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-0.5">
                    {t('mother_occupation')}
                  </label>
                  <input
                    type="text"
                    name="motherOccupation"
                    value={formData.motherOccupation}
                    onChange={handleChange}
                    placeholder="e.g. Homemaker, Service, Doctor"
                    className="w-full border border-emerald-600 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-emerald-700 rounded-none bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================================= */}
          {/* SECTION 3: GUARDIAN INFORMATION */}
          {/* ======================================================================= */}
          <div className="border border-emerald-600 bg-white">
            <div className="bg-[#15803d] text-white px-3 py-1.5 text-sm font-bold">
              {t('guardian_info')}
            </div>

            <div className="p-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-0.5">
                    {t('guardian_name')}
                  </label>
                  <input
                    type="text"
                    name="guardianName"
                    value={formData.guardianName}
                    onChange={handleChange}
                    placeholder="Legal Guardian's Name"
                    className="w-full border border-emerald-600 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-emerald-700 rounded-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-0.5">
                    {t('relationship')}
                  </label>
                  <input
                    type="text"
                    name="guardianRelation"
                    value={formData.guardianRelation}
                    onChange={handleChange}
                    placeholder="e.g. Uncle, Brother, Grandfather"
                    className="w-full border border-emerald-600 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-emerald-700 rounded-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-0.5">
                    {t('address')}
                  </label>
                  <input
                    type="text"
                    name="guardianAddress"
                    value={formData.guardianAddress}
                    onChange={handleChange}
                    placeholder="Guardian's Present Address"
                    className="w-full border border-emerald-600 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-emerald-700 rounded-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-0.5">
                    {t('mobile_number')}
                  </label>
                  <input
                    type="tel"
                    name="guardianMobile"
                    value={formData.guardianMobile}
                    onChange={handleChange}
                    placeholder="01xxxxxxxxx"
                    className="w-full border border-emerald-600 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-emerald-700 rounded-none bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================================= */}
          {/* SECTION 4: PRESENT ADDRESS */}
          {/* ======================================================================= */}
          <div className="border border-emerald-600 bg-white">
            <div className="bg-[#15803d] text-white px-3 py-1.5 text-sm font-bold">
              {t('present_address')}
            </div>

            <div className="p-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-0.5">
                    {t('village_road')}
                  </label>
                  <input
                    type="text"
                    name="presentVillage"
                    value={formData.presentVillage}
                    onChange={(e) => {
                      handleChange(e);
                      if (formData.sameAsPresent) {
                        setFormData(prev => ({ ...prev, presentVillage: e.target.value, permanentVillage: e.target.value }));
                      }
                    }}
                    placeholder="Village / House No., Road"
                    className="w-full border border-emerald-600 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-emerald-700 rounded-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-0.5">
                    {t('post_office')}
                  </label>
                  <input
                    type="text"
                    name="presentPost"
                    value={formData.presentPost}
                    onChange={(e) => {
                      handleChange(e);
                      if (formData.sameAsPresent) {
                        setFormData(prev => ({ ...prev, presentPost: e.target.value, permanentPost: e.target.value }));
                      }
                    }}
                    placeholder="Post Office / Postal Code"
                    className="w-full border border-emerald-600 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-emerald-700 rounded-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-0.5">
                    {t('police_station')}
                  </label>
                  <input
                    type="text"
                    name="presentThana"
                    value={formData.presentThana}
                    onChange={(e) => {
                      handleChange(e);
                      if (formData.sameAsPresent) {
                        setFormData(prev => ({ ...prev, presentThana: e.target.value, permanentThana: e.target.value }));
                      }
                    }}
                    placeholder="Thana / Upazila"
                    className="w-full border border-emerald-600 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-emerald-700 rounded-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-0.5">
                    {t('district')}
                  </label>
                  <input
                    type="text"
                    name="presentDistrict"
                    value={formData.presentDistrict}
                    onChange={(e) => {
                      handleChange(e);
                      if (formData.sameAsPresent) {
                        setFormData(prev => ({ ...prev, presentDistrict: e.target.value, permanentDistrict: e.target.value }));
                      }
                    }}
                    placeholder="District / City"
                    className="w-full border border-emerald-600 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-emerald-700 rounded-none bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================================= */}
          {/* SECTION 5: PERMANENT ADDRESS (CHECK IF SAME AS PRESENT ■) */}
          {/* ======================================================================= */}
          <div className="border border-emerald-600 bg-white">
            <div className="bg-[#15803d] text-white px-3 py-1.5 text-sm font-bold flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span>{t('permanent_address')}</span>
              </div>
              <label className="inline-flex items-center gap-1.5 bg-emerald-800/90 px-2.5 py-0.5 rounded text-xs font-normal cursor-pointer hover:bg-emerald-900 border border-emerald-500/50">
                <input
                  type="checkbox"
                  checked={formData.sameAsPresent}
                  onChange={handleSameAddressToggle}
                  className="w-3.5 h-3.5 accent-emerald-400 cursor-pointer"
                />
                <span className="font-semibold text-[11px]">{t('same_as_present')}</span>
              </label>
            </div>

            <div className="p-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-0.5">
                    {t('village_road')}
                  </label>
                  <input
                    type="text"
                    name="permanentVillage"
                    value={formData.permanentVillage}
                    onChange={handleChange}
                    disabled={formData.sameAsPresent}
                    placeholder="Village / House No., Road"
                    className="w-full border border-emerald-600 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-emerald-700 rounded-none bg-white disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-0.5">
                    {t('post_office')}
                  </label>
                  <input
                    type="text"
                    name="permanentPost"
                    value={formData.permanentPost}
                    onChange={handleChange}
                    disabled={formData.sameAsPresent}
                    placeholder="Post Office / Postal Code"
                    className="w-full border border-emerald-600 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-emerald-700 rounded-none bg-white disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-0.5">
                    {t('police_station')}
                  </label>
                  <input
                    type="text"
                    name="permanentThana"
                    value={formData.permanentThana}
                    onChange={handleChange}
                    disabled={formData.sameAsPresent}
                    placeholder="Thana / Upazila"
                    className="w-full border border-emerald-600 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-emerald-700 rounded-none bg-white disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-0.5">
                    {t('district')}
                  </label>
                  <input
                    type="text"
                    name="permanentDistrict"
                    value={formData.permanentDistrict}
                    onChange={handleChange}
                    disabled={formData.sameAsPresent}
                    placeholder="District / City"
                    className="w-full border border-emerald-600 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-emerald-700 rounded-none bg-white disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================================= */}
          {/* SECTION 6: STUDENT ADMISSION INFORMATION (TYPE SPECIFIC) */}
          {/* ======================================================================= */}
          <div className="border border-emerald-600 bg-white">
            <div className={`text-white px-3 py-1.5 text-sm font-bold flex items-center justify-between ${
              effectiveType === 'Madrasa' ? 'bg-[#07442f]' : 
              effectiveType === 'College' ? 'bg-blue-800' : 
              effectiveType === 'University' ? 'bg-rose-900' : 
              'bg-[#15803d]'
            }`}>
              <span>
                {effectiveType === 'Madrasa' ? '৬. কাঙ্ক্ষিত জামাত ও দ্বীনি শিক্ষা বিবরণী' : 
                 effectiveType === 'College' ? '৬. কলেজ শাখা, কোর্স ও পূর্ববর্তী পরীক্ষার বিবরণী' : 
                 effectiveType === 'University' ? '৬. অনুষদ, প্রোগ্রাম ও সেমিস্টার তথ্য' : 
                 '৬. ভর্তি সংক্রান্ত তথ্য (Admission Information)'}
              </span>
              <span className="text-xs font-mono font-normal opacity-90">
                {institution.name}
              </span>
            </div>

            <div className="p-3 space-y-3">
              {/* Type 1: MADRASA SPECIFIC ACADEMIC FIELDS */}
              {effectiveType === 'Madrasa' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        <span className="text-rose-600 font-bold">*</span> কাঙ্ক্ষিত জামাত / বিভাগ
                      </label>
                      <select
                        name="selectedClass"
                        value={formData.selectedClass}
                        onChange={handleChange}
                        className="w-full border border-emerald-600 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-emerald-700 rounded-none bg-white font-medium"
                      >
                        <option value="নূরানী শিশু শ্রেণি">নূরানী শিশু শ্রেণি</option>
                        <option value="নূরানী ১ম শ্রেণি">নূরানী ১ম শ্রেণি</option>
                        <option value="নূরানী ২য় শ্রেণি">নূরানী ২য় শ্রেণি</option>
                        <option value="নাজেরা কুরআন পাঠ বিভাগ">নাজেরা কুরআন পাঠ বিভাগ</option>
                        <option value="হিফজুল কুরআন বিভাগ">হিফজুল কুরআন বিভাগ (হিফজুল কুরআন)</option>
                        <option value="কিতাব বিভাগ (ইবতেদায়ি ১ম - ৫ম)">কিতাব বিভাগ (ইবতেদায়ি ১ম - ৫ম)</option>
                        <option value="কিতাব বিভাগ (দাখিল ৬ষ্ঠ - ১০ম)">কিতাব বিভাগ (দাখিল ৬ষ্ঠ - ১০ম)</option>
                        <option value="কিতাব বিভাগ (আলিম ১ম - ২য় বর্ষ)">কিতাব বিভাগ (আলিম ১ম - ২য় বর্ষ)</option>
                        <option value="কিতাব বিভাগ (ফযিলত ১ম - ২য় বর্ষ)">কিতাব বিভাগ (ফযিলত ১ম - ২য় বর্ষ)</option>
                        <option value="দাওরায়ে হাদীস (মাস্টার্স সমমান)">দাওরায়ে হাদীস (মাস্টার্স সমমান তাকমীল)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        <span className="text-rose-600 font-bold">*</span> পাঠ্যক্রম শাখা
                      </label>
                      <select
                        name="selectedGroup"
                        value={formData.selectedGroup}
                        onChange={handleChange}
                        className="w-full border border-emerald-600 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-emerald-700 rounded-none bg-white font-medium"
                      >
                        <option value="সাধারণ ইসলামিয়াত">সাধারণ ইসলামিয়াত</option>
                        <option value="হিফজুল কুরআন">হিফজুল কুরআন ও তাজভীদ</option>
                        <option value="কিতাব ও হাদীস">কিতাব ও হাদীস</option>
                        <option value="আরবি ব্যাকরণ ও ফিকহ">আরবি ব্যাকরণ ও ফিকহ</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        <span className="text-rose-600 font-bold">*</span> আবাসিক সুবিধা
                      </label>
                      <select
                        name="residentialStatus"
                        value={formData.residentialStatus || 'আবাসিক'}
                        onChange={handleChange}
                        className="w-full border border-emerald-600 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-emerald-700 rounded-none bg-white font-medium"
                      >
                        <option value="আবাসিক">আবাসিক (Full Boarding - থাকা ও খাওয়াসহ)</option>
                        <option value="অনাবাসিক">অনাবাসিক (Day Scholar)</option>
                        <option value="ডে-কেয়ার">ডে-কেয়ার (সকাল থেকে এশা)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        <span className="text-rose-600 font-bold">*</span> শিক্ষাবর্ষ
                      </label>
                      <select
                        name="academicYear"
                        value={formData.academicYear}
                        onChange={handleChange}
                        className="w-full border border-emerald-600 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-emerald-700 rounded-none bg-white font-medium"
                      >
                        <option value="২০২৫-২০২৬">২০২৫-২০২৬ (১৪৪৬-১৪৪৭ হিজরি)</option>
                        <option value="২০২৪-২০২৫">২০২৪-২০২৫</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Type 2: COLLEGE SPECIFIC ACADEMIC FIELDS */}
              {effectiveType === 'College' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        <span className="text-rose-600 font-bold">*</span> কাঙ্ক্ষিত কোর্স / প্রোগ্রাম
                      </label>
                      <select
                        name="selectedClass"
                        value={formData.selectedClass}
                        onChange={handleChange}
                        className="w-full border border-blue-600 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-blue-700 rounded-none bg-white font-medium"
                      >
                        <option value="উচ্চ মাধ্যমিক (HSC ১ম বর্ষ)">উচ্চ মাধ্যমিক (HSC ১ম বর্ষ / একাদশ শ্রেণি)</option>
                        <option value="উচ্চ মাধ্যমিক (HSC ২য় বর্ষ)">উচ্চ মাধ্যমিক (HSC ২য় বর্ষ / দ্বাদশ শ্রেণি)</option>
                        <option value="স্নাতক সম্মান (Honours ১ম বর্ষ) - হিসাববিজ্ঞান">অনার্স ১ম বর্ষ - হিসাববিজ্ঞান</option>
                        <option value="স্নাতক সম্মান (Honours ১ম বর্ষ) - ব্যবস্থাপনা">অনার্স ১ম বর্ষ - ব্যবস্থাপনা</option>
                        <option value="স্নাতক সম্মান (Honours ১ম বর্ষ) - ইংরেজি">অনার্স ১ম বর্ষ - ইংরেজি সাহিত্য</option>
                        <option value="ডিগ্রি পাস কোর্স (১ম বর্ষ)">ডিগ্রি পাস কোর্স (১ম বর্ষ - BA/BSS/BBS)</option>
                        <option value="সিএসই প্রফেশনাল (B.Sc in CSE)">সিএসই প্রফেশনাল (B.Sc in CSE)</option>
                        <option value="বিবিএ প্রফেশনাল (BBA Professional)">বিবিএ প্রফেশনাল (BBA Professional)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        <span className="text-rose-600 font-bold">*</span> শাখা / গ্রুপ
                      </label>
                      <select
                        name="selectedGroup"
                        value={formData.selectedGroup}
                        onChange={handleChange}
                        className="w-full border border-blue-600 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-blue-700 rounded-none bg-white font-medium"
                      >
                        <option value="বিজ্ঞান শাখা">বিজ্ঞান শাখা (Science)</option>
                        <option value="ব্যবসায় শিক্ষা শাখা">ব্যবসায় শিক্ষা শাখা (Business Studies)</option>
                        <option value="মানবিক শাখা">মানবিক শাখা (Humanities)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        <span className="text-rose-600 font-bold">*</span> কলেজ শিফট
                      </label>
                      <select
                        name="shift"
                        value={formData.shift}
                        onChange={handleChange}
                        className="w-full border border-blue-600 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-blue-700 rounded-none bg-white font-medium"
                      >
                        <option value="দিবা শাখা">দিবা শাখা (Day Shift - Regular)</option>
                        <option value="প্রাতঃ শাখা">প্রাতঃ শাখা (Morning Shift)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        <span className="text-rose-600 font-bold">*</span> শিক্ষাবর্ষ
                      </label>
                      <select
                        name="academicYear"
                        value={formData.academicYear}
                        onChange={handleChange}
                        className="w-full border border-blue-600 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-blue-700 rounded-none bg-white font-medium"
                      >
                        <option value="২০২৪-২০২৫">২০২৪-২০২৫</option>
                        <option value="২০২৫-২০২৬">২০২৫-২০২৬</option>
                      </select>
                    </div>
                  </div>

                  {/* SSC Qualifications */}
                  <div className="p-2.5 bg-blue-50/60 border border-blue-200 rounded text-xs space-y-2">
                    <div className="font-bold text-blue-900 flex items-center gap-1.5">
                      <span>পূর্ববর্তী এসএসসি / দাখিল পরীক্ষার তথ্য:</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600">এসএসসি রোল</label>
                        <input
                          type="text"
                          name="sscRoll"
                          value={formData.sscRoll || ''}
                          onChange={handleChange}
                          placeholder="রোল নম্বর"
                          className="w-full bg-white border border-slate-300 p-1 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600">রেজিস্ট্রেশন নম্বর</label>
                        <input
                          type="text"
                          name="sscReg"
                          value={formData.sscReg || ''}
                          onChange={handleChange}
                          placeholder="রেজি: নম্বর"
                          className="w-full bg-white border border-slate-300 p-1 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600">শিক্ষা বোর্ড</label>
                        <select
                          name="sscBoard"
                          value={formData.sscBoard || 'ঢাকা'}
                          onChange={handleChange}
                          className="w-full bg-white border border-slate-300 p-1 text-xs"
                        >
                          <option value="ঢাকা">ঢাকা</option>
                          <option value="রাজশাহী">রাজশাহী</option>
                          <option value="চট্টগ্রাম">চট্টগ্রাম</option>
                          <option value="কুমিল্লা">কুমিল্লা</option>
                          <option value="যশোর">যশোর</option>
                          <option value="বরিশাল">বরিশাল</option>
                          <option value="সিলেট">সিলেট</option>
                          <option value="দিনাজপুর">দিনাজপুর</option>
                          <option value="ময়মনসিংহ">ময়মনসিংহ</option>
                          <option value="মাদ্রাসা">মাদ্রাসা</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600">পাসের সন</label>
                        <select
                          name="sscPassingYear"
                          value={formData.sscPassingYear || '২০২৪'}
                          onChange={handleChange}
                          className="w-full bg-white border border-slate-300 p-1 text-xs"
                        >
                          <option value="২০২৪">২০২৪</option>
                          <option value="২০২৩">২০২৩</option>
                          <option value="২০২২">২০২২</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600">প্রাপ্ত GPA</label>
                        <input
                          type="text"
                          name="sscGpa"
                          value={formData.sscGpa || ''}
                          onChange={handleChange}
                          placeholder="যেমন: ৫.০০"
                          className="w-full bg-white border border-slate-300 p-1 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Type 3: UNIVERSITY SPECIFIC ACADEMIC FIELDS */}
              {effectiveType === 'University' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        <span className="text-rose-600 font-bold">*</span> কাঙ্ক্ষিত ডিগ্রি প্রোগ্রাম
                      </label>
                      <select
                        name="selectedClass"
                        value={formData.selectedClass}
                        onChange={handleChange}
                        className="w-full border border-rose-600 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-rose-700 rounded-none bg-white font-medium"
                      >
                        <option value="B.Sc. in Computer Science & Engineering (CSE)">B.Sc. in CSE (144 Credits)</option>
                        <option value="B.Sc. in Electrical & Electronic Engineering (EEE)">B.Sc. in EEE (144 Credits)</option>
                        <option value="B.Sc. in Civil Engineering (CE)">B.Sc. in CE (150 Credits)</option>
                        <option value="Bachelor of Business Administration (BBA)">BBA (Major: HRM, Finance, Marketing)</option>
                        <option value="Bachelor of Laws (LL.B Hons)">Bachelor of Laws (LL.B Hons - 4 Yrs)</option>
                        <option value="Bachelor of Pharmacy (B.Pharm Professional)">B.Pharm Professional (PCB Approved)</option>
                        <option value="B.A. (Hons) in English Literature">B.A. (Hons) in English</option>
                        <option value="Master of Business Administration (MBA)">MBA (Regular / Executive)</option>
                        <option value="Master of Laws (LL.M)">Master of Laws (LL.M - 1 Yr)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        <span className="text-rose-600 font-bold">*</span> অনুষদ (Faculty)
                      </label>
                      <select
                        name="selectedGroup"
                        value={formData.selectedGroup}
                        onChange={handleChange}
                        className="w-full border border-rose-600 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-rose-700 rounded-none bg-white font-medium"
                      >
                        <option value="Faculty of Science & Engineering">Faculty of Science & Engineering</option>
                        <option value="Faculty of Business Studies">Faculty of Business Studies</option>
                        <option value="Faculty of Law">Faculty of Law</option>
                        <option value="Faculty of Arts & Social Sciences">Faculty of Arts & Social Sciences</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        <span className="text-rose-600 font-bold">*</span> কাঙ্ক্ষিত সেমিস্টার
                      </label>
                      <select
                        name="targetSemester"
                        value={formData.targetSemester || 'Spring 2025'}
                        onChange={handleChange}
                        className="w-full border border-rose-600 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-rose-700 rounded-none bg-white font-medium"
                      >
                        <option value="Spring 2025">Spring 2025 (জানুয়ারি - এপ্রিল)</option>
                        <option value="Summer 2025">Summer 2025 (মে - আগস্ট)</option>
                        <option value="Fall 2025">Fall 2025 (সেপ্টেম্বর - ডিসেম্বর)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        <span className="text-rose-600 font-bold">*</span> মোড / শিফট
                      </label>
                      <select
                        name="shift"
                        value={formData.shift}
                        onChange={handleChange}
                        className="w-full border border-rose-600 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-rose-700 rounded-none bg-white font-medium"
                      >
                        <option value="ডে শিফট (Day Regular)">ডে শিফট (Day Regular - 4 Years)</option>
                        <option value="ইভনিং শিফট (Evening / Executive)">ইভনিং শিফট (Evening / Diploma Holders)</option>
                      </select>
                    </div>
                  </div>

                  {/* University Scholarships & Previous Academic Info */}
                  <div className="p-2.5 bg-rose-50/60 border border-rose-200 rounded text-xs space-y-2">
                    <div className="font-bold text-rose-950 flex items-center justify-between">
                      <span>পূর্ববর্তী ফলাফল ও স্কলারশিপ ক্যাটাগরি:</span>
                      <span className="text-[10px] text-rose-800">UGC Guidelines Enforced</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600">এসএসসি জিপিএ (GPA)</label>
                        <input
                          type="text"
                          name="sscGpa"
                          value={formData.sscGpa || ''}
                          onChange={handleChange}
                          placeholder="যেমন: ৫.০০"
                          className="w-full bg-white border border-slate-300 p-1 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600">এইচএসসি / ডিপ্লোমা জিপিএ (GPA)</label>
                        <input
                          type="text"
                          name="hscGpa"
                          value={formData.hscGpa || ''}
                          onChange={handleChange}
                          placeholder="যেমন: ৪.৮০"
                          className="w-full bg-white border border-slate-300 p-1 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-600">টিউশন ফি ওয়েভার ক্যাটাগরি</label>
                        <select
                          name="waiverCategory"
                          value={formData.waiverCategory || 'সাধারণ আবেদন'}
                          onChange={handleChange}
                          className="w-full bg-white border border-slate-300 p-1 text-xs"
                        >
                          <option value="সাধারণ আবেদন">সাধারণ আবেদন (Regular)</option>
                          <option value="গোল্ডেন জিপিএ ৫.০০ (১০০% ছাড়)">গোল্ডেন জিপিএ ৫.০০ (১০০% ছাড়)</option>
                          <option value="জিপিএ ৫.০০ (৫০% ছাড়)">জিপিএ ৫.০০ (৫০% ছাড়)</option>
                          <option value="মুক্তিযোদ্ধা সন্তান কোটা (১০০% ছাড়)">বীর মুক্তিযোদ্ধা সন্তান কোটা</option>
                          <option value="বিশেষ কোটা (২০% ছাড়)">উপজাতি / সহোদর কোটা</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Type 4: SCHOOL SPECIFIC ACADEMIC FIELDS */}
              {effectiveType === 'School' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        <span className="text-rose-600 font-bold">*</span> কাঙ্ক্ষিত শ্রেণি
                      </label>
                      <select
                        name="selectedClass"
                        value={formData.selectedClass}
                        onChange={handleChange}
                        className="w-full border border-emerald-600 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-emerald-700 rounded-none bg-white font-medium"
                      >
                        <option value="Play">শিশু / প্লে (Play)</option>
                        <option value="Nursery">নার্সারি (Nursery)</option>
                        <option value="KG">কেজি (Kindergarten)</option>
                        <option value="Class 1">১ম শ্রেণি</option>
                        <option value="Class 2">২য় শ্রেণি</option>
                        <option value="Class 3">৩য় শ্রেণি</option>
                        <option value="Class 4">৪র্থ শ্রেণি</option>
                        <option value="Class 5">৫ম শ্রেণি</option>
                        <option value="Class 6">৬ষ্ঠ শ্রেণি</option>
                        <option value="Class 7">৭ম শ্রেণি</option>
                        <option value="Class 8">৮ম শ্রেণি</option>
                        <option value="Class 9">৯ম শ্রেণি</option>
                        <option value="Class 10">১০ম শ্রেণি</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        <span className="text-rose-600 font-bold">*</span> গ্রুপ / শাখা
                      </label>
                      <select
                        name="selectedGroup"
                        value={formData.selectedGroup}
                        onChange={handleChange}
                        className="w-full border border-emerald-600 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-emerald-700 rounded-none bg-white font-medium"
                      >
                        <option value="General">সাধারণ (প্লে - ৮ম শ্রেণি)</option>
                        <option value="Science">বিজ্ঞান শাখা (৯ম-১০ম)</option>
                        <option value="Humanities">মানবিক শাখা (৯ম-১০ম)</option>
                        <option value="Business Studies">ব্যবসায় শিক্ষা (৯ম-১০ম)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        <span className="text-rose-600 font-bold">*</span> মাধ্যম (Version)
                      </label>
                      <select
                        name="mediumOrVersion"
                        value={formData.mediumOrVersion || 'বাংলা মাধ্যম'}
                        onChange={handleChange}
                        className="w-full border border-emerald-600 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-emerald-700 rounded-none bg-white font-medium"
                      >
                        <option value="বাংলা মাধ্যম">বাংলা মাধ্যম (National Curriculum)</option>
                        <option value="ইংরেজি ভার্সন">ইংরেজি ভার্সন (English Version)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        <span className="text-rose-600 font-bold">*</span> স্কুলের শিফট
                      </label>
                      <select
                        name="shift"
                        value={formData.shift}
                        onChange={handleChange}
                        className="w-full border border-emerald-600 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-emerald-700 rounded-none bg-white font-medium"
                      >
                        <option value="Morning">প্রাতঃ শাখা (Morning Shift)</option>
                        <option value="Day">দিবা শাখা (Day Shift)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                        <span className="text-rose-600 font-bold">*</span> শিক্ষাবর্ষ
                      </label>
                      <select
                        name="academicYear"
                        value={formData.academicYear}
                        onChange={handleChange}
                        className="w-full border border-emerald-600 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-emerald-700 rounded-none bg-white font-medium"
                      >
                        <option value="২০২৫">২০২৫ শিক্ষাবর্ষ</option>
                        <option value="২০২৪">২০২৪ শিক্ষাবর্ষ</option>
                        <option value="২০২৬">২০২৬ শিক্ষাবর্ষ</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ======================================================================= */}
          {/* SECTION 7: PREVIOUS ACADEMIC INFORMATION */}
          {/* ======================================================================= */}
          <div className="border border-emerald-600 bg-white">
            <div className={`text-white px-3 py-1.5 text-sm font-bold ${
              effectiveType === 'Madrasa' ? 'bg-[#07442f]' : 
              effectiveType === 'College' ? 'bg-blue-800' : 
              effectiveType === 'University' ? 'bg-rose-900' : 
              'bg-[#15803d]'
            }`}>
              {effectiveType === 'Madrasa' ? '৭. পূর্ববর্তী মক্তব / মাদ্রাসার তথ্য' : 
               effectiveType === 'College' ? '৭. পূর্ববর্তী স্কুলের নাম ও ছাড়পত্র তথ্য' : 
               effectiveType === 'University' ? '৭. পূর্ববর্তী কলেজ / ডিপ্লোমা প্রতিষ্ঠানের তথ্য' : 
               '৭. পূর্ববর্তী শিক্ষাপ্রতিষ্ঠানের তথ্য'}
            </div>

            <div className="p-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-0.5">
                  {effectiveType === 'Madrasa' ? 'পূর্ববর্তী মক্তব বা মাদ্রাসার নাম (যদি থাকে)' : 
                   effectiveType === 'College' ? 'এসএসসি সম্পন্নকৃত স্কুলের নাম' : 
                   effectiveType === 'University' ? 'এইচএসসি সম্পন্নকৃত কলেজ বা পলিটেকনিক ইনস্টিটিউটের নাম' : 
                   'পূর্ববর্তী বিদ্যালয়ের নাম (যদি থাকে)'}
                </label>
                <input
                  type="text"
                  name="previousSchoolName"
                  value={formData.previousSchoolName}
                  onChange={handleChange}
                  placeholder={effectiveType === 'Madrasa' ? 'যেমন: দারুল উলুম নূরানী মাদ্রাসা' : 'প্রতিষ্ঠানের পূর্ণ নাম লিখুন...'}
                  className="w-full sm:w-2/3 border border-slate-300 px-2.5 py-1.5 text-xs outline-none focus:ring-1 focus:ring-emerald-700 rounded-none bg-white"
                />
              </div>
            </div>
          </div>

          {/* ======================================================================= */}
          {/* SECTION 8: DIGITAL SIGNATURES & INSTITUTIONAL VALIDATION */}
          {/* ======================================================================= */}
          <div className="border border-emerald-600 bg-white">
            <div className="bg-[#15803d] text-white px-3 py-1.5 text-sm font-bold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>{t('signatures_validation')}</span>
              </div>
              <span className="text-[11px] font-normal text-emerald-100 hidden sm:inline">
                {t('dual_validation_desc')}
              </span>
            </div>

            <div className="p-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* 1. Parent / Guardian Signature Pad */}
                <SignaturePadField
                  id="guardian-signature"
                  title={t('guardian_signature_title')}
                  subtitle={t('guardian_signature_subtitle')}
                  declarationText={t('guardian_declaration')}
                  signatoryName={formData.guardianSignatoryName || formData.fatherNameEn || formData.guardianName}
                  onSignatoryNameChange={(val) => setFormData(prev => ({ ...prev, guardianSignatoryName: val }))}
                  signatoryNameLabel={t('signatory_name_label')}
                  signatoryNamePlaceholder="e.g. Md. Rafiqul Islam"
                  signDate={formData.guardianSignDate}
                  onSignDateChange={(val) => setFormData(prev => ({ ...prev, guardianSignDate: val }))}
                  signatureData={formData.guardianSignatureData}
                  onSignatureChange={(dataUrl) => setFormData(prev => ({ ...prev, guardianSignatureData: dataUrl }))}
                  signatureType={formData.guardianSignatureType}
                  onSignatureTypeChange={(type) => setFormData(prev => ({ ...prev, guardianSignatureType: type }))}
                  sampleSignatureSvg={SAMPLE_GUARDIAN_SIGNATURE}
                  accentColor="blue"
                  required={true}
                />

                {/* 2. School Representative / Headmaster Validation Pad */}
                <SignaturePadField
                  id="school-rep-signature"
                  title={t('school_rep_title')}
                  subtitle={t('school_rep_subtitle')}
                  declarationText={t('school_rep_declaration')}
                  signatoryName={formData.schoolRepName}
                  onSignatoryNameChange={(val) => setFormData(prev => ({ ...prev, schoolRepName: val }))}
                  signatoryNameLabel={t('authorized_officer_name')}
                  signatoryNamePlaceholder="e.g. Prof. Abdul Wahab Khan"
                  signDate={formData.schoolValidationDate}
                  onSignDateChange={(val) => setFormData(prev => ({ ...prev, schoolValidationDate: val }))}
                  signatureData={formData.schoolRepSignatureData}
                  onSignatureChange={(dataUrl) => setFormData(prev => ({ ...prev, schoolRepSignatureData: dataUrl }))}
                  signatureType={formData.schoolRepSignatureType}
                  onSignatureTypeChange={(type) => setFormData(prev => ({ ...prev, schoolRepSignatureType: type }))}
                  isRepresentative={true}
                  designation={formData.schoolRepDesignation}
                  onDesignationChange={(val) => setFormData(prev => ({ ...prev, schoolRepDesignation: val }))}
                  status={formData.schoolValidationStatus}
                  onStatusChange={(val) => setFormData(prev => ({ ...prev, schoolValidationStatus: val }))}
                  sampleSignatureSvg={SAMPLE_SCHOOL_REP_SIGNATURE}
                  accentColor="emerald"
                />
              </div>
            </div>
          </div>

          {/* ======================================================================= */}
          {/* SUBMIT & LIVE PDF PREVIEW BUTTONS */}
          {/* ======================================================================= */}
          <div className="pt-2 print:hidden space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>{t('autosave_banner_text')}</span>
              </div>
              {lastSavedTime && (
                <span className="font-mono text-[11px] text-slate-400">
                  {t('last_saved_prefix')} {lastSavedTime}
                </span>
              )}
            </div>

            {/* Automated Workflow Notice Banner */}
            <div className="p-2.5 bg-indigo-50/80 border border-indigo-200 rounded-sm text-xs text-indigo-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 font-black text-indigo-800">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Automated Workflow Trigger:
              </span>
              <span className="text-slate-600 text-[11px]">
                Submission transitions form to <strong>'Pending Approval'</strong> and dispatches real-time alert to School Admin Communication Center.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setIsPdfPreviewOpen(true)}
                className="py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-sm tracking-wide rounded-sm border border-indigo-300 shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Eye size={16} />
                <span>{t('live_pdf_preview')}</span>
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="sm:col-span-2 py-2.5 px-4 bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-bold text-sm tracking-wide rounded-sm shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{t('processing_app')}</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>{t('send_application')}</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </form>

        {/* ======================================================================= */}
        {/* LIVE PDF PREVIEW MODAL BEFORE FINAL SUBMISSION */}
        {/* ======================================================================= */}
        <AdmissionPdfPreviewModal
          isOpen={isPdfPreviewOpen}
          onClose={() => setIsPdfPreviewOpen(false)}
          formData={formData}
          institution={institution}
          onConfirmSubmit={() => {
            // Trigger formal form submit logic
            handleSubmit({ preventDefault: () => {} } as React.FormEvent);
          }}
        />

        {/* ======================================================================= */}
        {/* SUCCESS CONFIRMATION SLIP MODAL */}
        {/* ======================================================================= */}
        {submittedData && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 print:hidden">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} />
              </div>
              
              <h3 className="text-xl font-black text-center text-slate-800">
                Admission Application Submitted!
              </h3>
              <p className="text-center text-xs text-slate-500 mt-1">
                Application Reference Code: <span className="font-mono font-bold text-emerald-700">ADM-2026-{Math.floor(1000 + Math.random() * 9000)}</span>
              </p>

              <div className="my-5 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500">Institution:</span>
                  <span className="font-bold text-slate-800 uppercase">{institution.name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500">Candidate Name:</span>
                  <span className="font-bold text-slate-800">{submittedData.studentNameEn}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500">Applied Class:</span>
                  <span className="font-bold text-indigo-600">{submittedData.selectedClass} - Section {submittedData.section} ({submittedData.academicYear})</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500">Father's Name & Contact:</span>
                  <span className="font-bold text-slate-800">{submittedData.fatherNameEn} • {submittedData.fatherMobile}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-slate-500">Present Address:</span>
                  <span className="font-medium text-slate-700">{submittedData.presentVillage}, {submittedData.presentThana}, {submittedData.presentDistrict}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-1.5 items-center">
                  <span className="text-slate-500">Form Status:</span>
                  <span className="font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-[11px] border border-amber-200">
                    Pending Approval
                  </span>
                </div>
                <div className="p-2 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-950 text-[11px] leading-snug">
                  <strong>⚡ Automated Trigger Dispatched:</strong> School Admin has been notified in the <strong>Communication Center</strong> for verification and enrollment.
                </div>

                {/* Digital Validation Signatures in Receipt */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="text-center p-2 bg-white rounded border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-semibold mb-1">Guardian Endorsement</p>
                    {submittedData.guardianSignatureData ? (
                      <div className="h-9 flex items-center justify-center mb-0.5">
                        <img src={submittedData.guardianSignatureData} alt="Guardian Signature" className="max-h-8 max-w-[120px] object-contain" />
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic block h-9 flex items-center justify-center">Digital Acknowledged</span>
                    )}
                    <p className="text-[10px] font-bold text-slate-800 truncate">
                      {submittedData.guardianSignatoryName || submittedData.fatherNameEn || 'Guardian'}
                    </p>
                    <p className="text-[8.5px] text-emerald-700 font-medium">✓ Verified Declaration</p>
                  </div>

                  <div className="text-center p-2 bg-white rounded border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-semibold mb-1">School Authority</p>
                    {submittedData.schoolRepSignatureData ? (
                      <div className="h-9 flex items-center justify-center mb-0.5">
                        <img src={submittedData.schoolRepSignatureData} alt="School Representative Signature" className="max-h-8 max-w-[120px] object-contain" />
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic block h-9 flex items-center justify-center">Institutional Seal</span>
                    )}
                    <p className="text-[10px] font-bold text-slate-800 truncate">{submittedData.schoolRepName}</p>
                    <p className="text-[8.5px] text-emerald-700 font-medium">✓ {submittedData.schoolValidationStatus}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  icon={Eye}
                  onClick={() => {
                    setIsPdfPreviewOpen(true);
                  }}
                  className="flex-1 text-xs text-indigo-700 border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100"
                >
                  View PDF & QR
                </Button>
                <Button
                  variant="outline"
                  icon={Printer}
                  onClick={() => {
                    window.print();
                  }}
                  className="flex-1 text-xs"
                >
                  Print Receipt
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setSubmittedData(null);
                    handleReset();
                    if (onClose) onClose();
                  }}
                  className={`flex-1 text-xs text-white ${
                    effectiveType === 'Madrasa' ? 'bg-[#07442f] hover:bg-[#09573c]' : 
                    effectiveType === 'College' ? 'bg-blue-700 hover:bg-blue-800' : 
                    effectiveType === 'University' ? 'bg-rose-900 hover:bg-rose-950' : 
                    'bg-[#15803d] hover:bg-[#166534]'
                  }`}
                >
                  {onClose ? 'সম্পন্ন করুন (Done)' : 'New Admission'}
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
