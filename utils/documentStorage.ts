import { SchoolDocument, DocumentFolder, DocumentCategory, DocumentSecurityLevel, UserRole } from '../types';

export const DOCUMENT_STORAGE_EVENT = 'amar_school_documents_changed';
const STORAGE_DOCS_KEY = 'amar_school_documents_vault_v1';
const STORAGE_FOLDERS_KEY = 'amar_school_folders_vault_v1';

export const DEFAULT_FOLDERS: DocumentFolder[] = [
  {
    id: 'fld-root',
    path: 'documents',
    name: 'All Documents',
    parentPath: null,
    createdAt: '2024-01-01',
    description: 'Root storage directory for all institutional files'
  },
  {
    id: 'fld-academic',
    path: 'documents/academic',
    name: 'Academic Records',
    category: 'academic',
    parentPath: 'documents',
    createdAt: '2024-01-01',
    description: 'Curriculum equivalencies, board credentials, academic transcripts and syllabi'
  },
  {
    id: 'fld-medical',
    path: 'documents/medical',
    name: 'Medical & Health',
    category: 'medical',
    parentPath: 'documents',
    createdAt: '2024-01-01',
    description: 'Immunization cards, physician fitness certificates, dietary accommodations & clinic records'
  },
  {
    id: 'fld-legal',
    path: 'documents/legal',
    name: 'Legal & Affidavits',
    category: 'legal',
    parentPath: 'documents',
    createdAt: '2024-01-01',
    description: 'Parental guardianship affidavits, notary public undertakings, custody and conduct deeds'
  },
  {
    id: 'fld-students',
    path: 'documents/student-records',
    name: 'Student Records',
    category: 'student-records',
    parentPath: 'documents',
    createdAt: '2024-01-01',
    description: 'Birth certificates, national IDs, admission forms, previous transcripts'
  },
  {
    id: 'fld-fees',
    path: 'documents/fee-receipts',
    name: 'Fee Receipts',
    category: 'fee-receipts',
    parentPath: 'documents',
    createdAt: '2024-01-01',
    description: 'Bank payment slips, tuition fee invoices, exam vouchers, payment proofs'
  },
  {
    id: 'fld-certs',
    path: 'documents/academic-certificates',
    name: 'Academic Certificates',
    category: 'academic-certificates',
    parentPath: 'documents',
    createdAt: '2024-01-01',
    description: 'Board graduation certificates, testimonials, character certificates, honor diplomas'
  },
  {
    id: 'fld-admin',
    path: 'documents/administrative',
    name: 'Administrative & Staff',
    category: 'administrative',
    parentPath: 'documents',
    createdAt: '2024-01-01',
    description: 'Ministry accreditations, board permissions, faculty appointments'
  }
];

// Helper to generate simulated SHA-256 fingerprint
export const generateDocumentHash = (fileName: string, size: number, timestamp: string): string => {
  let hashStr = `${fileName}_${size}_${timestamp}_AMAR_SCHOOL_SECURE_VAULT`;
  let hash = 0;
  for (let i = 0; i < hashStr.length; i++) {
    const char = hashStr.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `sha256-${hex}a7f8e9c2014b98d361${Math.abs(hash * 31).toString(16).slice(0, 16)}`;
};

export const formatBytes = (bytes: number, decimals = 1): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

// Initial Seed Documents
const INITIAL_DOCUMENTS: SchoolDocument[] = [
  {
    id: 'DOC-2024-001',
    title: 'Class 10 Admission Dossier & Birth Reg.',
    fileName: 'rahim_ahmed_admission_dossier.pdf',
    fileSize: 1420500, // ~1.4 MB
    fileType: 'application/pdf',
    category: 'student-records',
    folder: 'documents/student-records',
    studentId: 'ST-2024-001',
    studentName: 'Rahim Ahmed',
    studentRoll: '101',
    studentClass: 'Class 10',
    issueDate: '2024-01-12',
    expiryDate: 'Permanent',
    issuingAuthority: 'Office of the Registrar General, Birth & Death Registration (BRIS-BD)',
    uploadedBy: {
      id: 'SCH-001',
      name: 'Principal Rafiq',
      role: 'School Admin'
    },
    uploadedAt: '2024-01-15T09:30:00Z',
    securityLevel: 'Confidential',
    fileHash: 'sha256-a94f8e9c2014b98d361e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b9',
    verificationStatus: 'Verified',
    tags: ['Admission', 'Birth Certificate', 'Verified ID', 'Class 10'],
    notes: 'National Birth Registration verified against government registry BRIS-BD.',
    accessRoles: [UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN]
  },
  {
    id: 'DOC-2024-002',
    title: 'Annual Tuition Fee Receipt - Term 1',
    fileName: 'fatima_begum_tuition_term1.pdf',
    fileSize: 485200, // ~485 KB
    fileType: 'application/pdf',
    category: 'fee-receipts',
    folder: 'documents/fee-receipts',
    studentId: 'ST-2024-002',
    studentName: 'Fatima Begum',
    studentRoll: '102',
    studentClass: 'Class 10',
    amount: 1500,
    transactionId: 'TXN-BKASH-8947219',
    issueDate: '2024-02-05',
    expiryDate: '2025-02-05',
    issuingAuthority: 'Smart Amar School Accounts & Bursar Department',
    uploadedBy: {
      id: 'EMP-003',
      name: 'Mofizur Rahman',
      role: 'Accountant'
    },
    uploadedAt: '2024-02-05T14:15:00Z',
    securityLevel: 'Standard',
    fileHash: 'sha256-7c12f0e9b214c78a991f4d0c11298fa2d148afbf4c8996fe82427ae41e4648d1',
    verificationStatus: 'Verified',
    tags: ['Fee Slip', 'bKash', 'Tuition', 'Term 1'],
    notes: 'Paid via bKash Merchant Gateway. Bank reference reconciles with batch ledger #2024-02.',
    accessRoles: [UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN]
  },
  {
    id: 'DOC-2024-003',
    title: 'Junior Secondary Merit Certificate & Testimonial',
    fileName: 'karim_ullah_merit_testimonial.pdf',
    fileSize: 920400, // ~920 KB
    fileType: 'application/pdf',
    category: 'academic-certificates',
    folder: 'documents/academic-certificates',
    studentId: 'ST-2024-003',
    studentName: 'Karim Ullah',
    studentRoll: '103',
    studentClass: 'Class 10',
    certificateType: 'Merit & Character',
    issueDate: '2024-03-20',
    expiryDate: 'Permanent',
    issuingAuthority: 'Board of Intermediate and Secondary Education (BISE), Dhaka',
    uploadedBy: {
      id: 'SCH-001',
      name: 'Principal Rafiq',
      role: 'School Admin'
    },
    uploadedAt: '2024-03-22T11:45:00Z',
    securityLevel: 'Confidential',
    fileHash: 'sha256-d44b8e9c1014e98f261e1a0c44298fc2b149afbf4c8996fc72427ae41e4651a2',
    verificationStatus: 'Verified',
    tags: ['Certificate', 'Merit', 'Academic Honors', 'Signed by Headmaster'],
    notes: 'Official academic testimonial with embossed seal and digital QR verification signature.',
    accessRoles: [UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.TEACHER]
  },
  {
    id: 'DOC-2024-004',
    title: 'Annual Student Medical Fitness & Immunization Clearance',
    fileName: 'rahim_ahmed_medical_fitness.pdf',
    fileSize: 760000,
    fileType: 'application/pdf',
    category: 'medical',
    folder: 'documents/medical',
    studentId: 'ST-2024-001',
    studentName: 'Rahim Ahmed',
    studentRoll: '101',
    studentClass: 'Class 10',
    issueDate: '2024-01-10',
    expiryDate: '2025-01-10',
    issuingAuthority: 'District Civil Surgeon Office & General Hospital Medical Board',
    uploadedBy: {
      id: 'SCH-001',
      name: 'Principal Rafiq',
      role: 'School Admin'
    },
    uploadedAt: '2024-01-14T08:20:00Z',
    securityLevel: 'Confidential',
    fileHash: 'sha256-a19f8b4c7014e33d161d9a0c77298fc5c149afbf4c8996fe12427ae41e4682c1',
    verificationStatus: 'Verified',
    tags: ['Medical', 'Immunization', 'Annual Physical', 'Health Clearance'],
    notes: 'Certified fit for all physical education and curricular activities. Blood group: B+.',
    accessRoles: [UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN]
  },
  {
    id: 'DOC-2024-005',
    title: 'Parental Legal Guardianship Affidavit & Undertaking',
    fileName: 'fatima_begum_guardianship_affidavit.pdf',
    fileSize: 620000,
    fileType: 'application/pdf',
    category: 'legal',
    folder: 'documents/legal',
    studentId: 'ST-2024-002',
    studentName: 'Fatima Begum',
    studentRoll: '102',
    studentClass: 'Class 10',
    issueDate: '2024-01-15',
    expiryDate: '2027-01-15',
    issuingAuthority: 'First Class Judicial Magistrate & Notary Public, Dhaka Court',
    uploadedBy: {
      id: 'SCH-001',
      name: 'Principal Rafiq',
      role: 'School Admin'
    },
    uploadedAt: '2024-01-18T12:40:00Z',
    securityLevel: 'Restricted',
    fileHash: 'sha256-c32a7e9b8014f44a991f2c0c88298fa7e149afbf4c8996fd92427ae41e4691a3',
    verificationStatus: 'Verified',
    tags: ['Legal', 'Affidavit', 'Guardianship', 'Notarized Stamp'],
    notes: 'Notarized declaration of authorized local guardian for hostel & off-campus exit privileges.',
    accessRoles: [UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN]
  },
  {
    id: 'DOC-2024-006',
    title: 'National Curriculum & Textbook Board (NCTB) Equivalency',
    fileName: 'karim_ullah_nctb_equivalency.pdf',
    fileSize: 580000,
    fileType: 'application/pdf',
    category: 'academic',
    folder: 'documents/academic',
    studentId: 'ST-2024-003',
    studentName: 'Karim Ullah',
    studentRoll: '103',
    studentClass: 'Class 10',
    issueDate: '2024-02-14',
    expiryDate: 'Permanent',
    issuingAuthority: 'National Curriculum and Textbook Board (NCTB), Ministry of Education',
    uploadedBy: {
      id: 'SCH-001',
      name: 'Principal Rafiq',
      role: 'School Admin'
    },
    uploadedAt: '2024-02-18T10:05:00Z',
    securityLevel: 'Standard',
    fileHash: 'sha256-f81d2a4e9014b11c331a6d0c44298fc9a149afbf4c8996fc22427ae41e4677e8',
    verificationStatus: 'Verified',
    tags: ['Academic', 'Equivalency', 'Curriculum', 'NCTB'],
    notes: 'Official equivalency certificate approved for Secondary School Certificate syllabus.',
    accessRoles: [UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.TEACHER]
  },
  {
    id: 'DOC-2024-007',
    title: 'Previous School Transfer Certificate (TC)',
    fileName: 'nusrat_jahan_transfer_cert.pdf',
    fileSize: 678000,
    fileType: 'application/pdf',
    category: 'student-records',
    folder: 'documents/student-records',
    studentId: 'ST-2024-004',
    studentName: 'Nusrat Jahan',
    studentRoll: '104',
    studentClass: 'Class 9',
    issueDate: '2023-12-28',
    expiryDate: 'Permanent',
    issuingAuthority: 'Mirpur Government High School, Academic Council',
    uploadedBy: {
      id: 'SCH-001',
      name: 'Principal Rafiq',
      role: 'School Admin'
    },
    uploadedAt: '2024-01-08T10:10:00Z',
    securityLevel: 'Standard',
    fileHash: 'sha256-b81f9a2c3014d88e461a2b0c33298fd3e149afbf4c8996fa62427ae41e4659b8',
    verificationStatus: 'Verified',
    tags: ['Transfer Certificate', 'Prior Records', 'Admission Doc'],
    notes: 'Original hard copy filed in Registrar cabinet section B-4.',
    accessRoles: [UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN]
  },
  {
    id: 'DOC-2024-008',
    title: 'Lab & Library Caution Deposit Receipt',
    fileName: 'tariq_islam_caution_fee.pdf',
    fileSize: 312000,
    fileType: 'application/pdf',
    category: 'fee-receipts',
    folder: 'documents/fee-receipts',
    studentId: 'ST-2024-005',
    studentName: 'Tariq Islam',
    studentRoll: '105',
    studentClass: 'Class 9',
    amount: 800,
    transactionId: 'TXN-BANK-AGRANI-44120',
    issueDate: '2024-01-20',
    expiryDate: '2025-01-20',
    issuingAuthority: 'Agrani Bank PLC, Institutional Branch',
    uploadedBy: {
      id: 'EMP-003',
      name: 'Mofizur Rahman',
      role: 'Accountant'
    },
    uploadedAt: '2024-01-21T16:00:00Z',
    securityLevel: 'Standard',
    fileHash: 'sha256-993d7c1a8014e77a161f5c0c99298fe1a149afbf4c8996fc32427ae41e4663c9',
    verificationStatus: 'Verified',
    tags: ['Deposit', 'Library', 'Science Lab', 'Refundable'],
    notes: 'Agrani Bank Challan verified.',
    accessRoles: [UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN]
  }
];

export const getStoredDocuments = (): SchoolDocument[] => {
  try {
    const raw = localStorage.getItem(STORAGE_DOCS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_DOCS_KEY, JSON.stringify(INITIAL_DOCUMENTS));
      return INITIAL_DOCUMENTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Backfill missing mandatory metadata fields on older stored documents if needed
      return parsed.map((doc: any) => ({
        ...doc,
        expiryDate: doc.expiryDate || 'Permanent',
        issuingAuthority: doc.issuingAuthority || 'Institution Registrar Office'
      }));
    }
    localStorage.setItem(STORAGE_DOCS_KEY, JSON.stringify(INITIAL_DOCUMENTS));
    return INITIAL_DOCUMENTS;
  } catch (e) {
    console.error('Failed to retrieve stored documents', e);
    return INITIAL_DOCUMENTS;
  }
};

export const getStoredFolders = (): DocumentFolder[] => {
  try {
    const raw = localStorage.getItem(STORAGE_FOLDERS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_FOLDERS_KEY, JSON.stringify(DEFAULT_FOLDERS));
      return DEFAULT_FOLDERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Ensure default folders exist even if localStorage was created in previous session
      const existingPaths = new Set(parsed.map((f: any) => f.path));
      let missingAdded = false;
      const merged = [...parsed];
      DEFAULT_FOLDERS.forEach(df => {
        if (!existingPaths.has(df.path)) {
          merged.push(df);
          missingAdded = true;
        }
      });
      if (missingAdded) {
        localStorage.setItem(STORAGE_FOLDERS_KEY, JSON.stringify(merged));
      }
      return merged;
    }
    return DEFAULT_FOLDERS;
  } catch (e) {
    console.error('Failed to retrieve stored folders', e);
    return DEFAULT_FOLDERS;
  }
};

export const saveDocument = (doc: SchoolDocument): void => {
  const current = getStoredDocuments();
  const index = current.findIndex(d => d.id === doc.id);
  let updated: SchoolDocument[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = doc;
  } else {
    updated = [doc, ...current];
  }
  localStorage.setItem(STORAGE_DOCS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent(DOCUMENT_STORAGE_EVENT, { detail: { action: 'save', document: doc } }));
};

export const deleteDocument = (id: string): boolean => {
  const current = getStoredDocuments();
  const filtered = current.filter(d => d.id !== id);
  if (filtered.length !== current.length) {
    localStorage.setItem(STORAGE_DOCS_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent(DOCUMENT_STORAGE_EVENT, { detail: { action: 'delete', id } }));
    return true;
  }
  return false;
};

export const deleteDocuments = (ids: string[]): number => {
  if (!ids || ids.length === 0) return 0;
  const current = getStoredDocuments();
  const idSet = new Set(ids);
  const filtered = current.filter(d => !idSet.has(d.id));
  const deletedCount = current.length - filtered.length;
  if (deletedCount > 0) {
    localStorage.setItem(STORAGE_DOCS_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent(DOCUMENT_STORAGE_EVENT, { detail: { action: 'batch_delete', ids, count: deletedCount } }));
  }
  return deletedCount;
};

export const updateDocument = (id: string, updates: Partial<SchoolDocument>): SchoolDocument | null => {
  const current = getStoredDocuments();
  const index = current.findIndex(d => d.id === id);
  if (index === -1) return null;
  const updatedDoc = { ...current[index], ...updates };
  current[index] = updatedDoc;
  localStorage.setItem(STORAGE_DOCS_KEY, JSON.stringify(current));
  window.dispatchEvent(new CustomEvent(DOCUMENT_STORAGE_EVENT, { detail: { action: 'update', document: updatedDoc } }));
  return updatedDoc;
};

export const createFolder = (
  folderName: string,
  parentPath = 'documents',
  category?: DocumentCategory,
  description?: string
): DocumentFolder => {
  const folders = getStoredFolders();
  const cleanName = folderName.trim().replace(/[^a-zA-Z0-9-_\s]/g, '');
  const slug = cleanName.toLowerCase().replace(/\s+/g, '-');
  const fullPath = parentPath === 'documents' ? `documents/${slug}` : `${parentPath}/${slug}`;

  // check if already exists
  const existing = folders.find(f => f.path === fullPath);
  if (existing) return existing;

  const newFolder: DocumentFolder = {
    id: `fld-${Date.now()}`,
    path: fullPath,
    name: cleanName,
    category,
    parentPath,
    createdAt: new Date().toISOString().split('T')[0],
    description: description || `Dedicated directory in ${parentPath}`
  };

  const updated = [...folders, newFolder];
  localStorage.setItem(STORAGE_FOLDERS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent(DOCUMENT_STORAGE_EVENT, { detail: { action: 'create_folder', folder: newFolder } }));
  return newFolder;
};

export const deleteFolder = (folderPath: string): boolean => {
  if (['documents', 'documents/student-records', 'documents/fee-receipts', 'documents/academic-certificates'].includes(folderPath)) {
    // protect default folders from deletion
    return false;
  }
  const folders = getStoredFolders();
  const filteredFolders = folders.filter(f => f.path !== folderPath && !f.path.startsWith(`${folderPath}/`));
  localStorage.setItem(STORAGE_FOLDERS_KEY, JSON.stringify(filteredFolders));

  // Move documents in deleted folder back to parent documents/
  const docs = getStoredDocuments();
  const updatedDocs = docs.map(d => {
    if (d.folder === folderPath || d.folder.startsWith(`${folderPath}/`)) {
      return { ...d, folder: 'documents' };
    }
    return d;
  });
  localStorage.setItem(STORAGE_DOCS_KEY, JSON.stringify(updatedDocs));

  window.dispatchEvent(new CustomEvent(DOCUMENT_STORAGE_EVENT, { detail: { action: 'delete_folder', folderPath } }));
  return true;
};
