import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Folder, FolderPlus, FileText, UploadCloud, Search, Filter, 
  ShieldCheck, Lock, Download, Eye, Trash2, ChevronRight, 
  Receipt, FileBadge, Users, ArrowUpDown, CheckCircle2, 
  AlertTriangle, Copy, ExternalLink, HardDrive, RefreshCw, 
  MoreVertical, FileCheck, Printer, X, Tag, FolderArchive, ArrowRight,
  SlidersHorizontal, Sparkles, UserCheck, GraduationCap, Hash,
  FileCheck2, RotateCcw, Building2, Layers, Check, SearchCode,
  Minus, CheckSquare, Square, CalendarClock, HeartPulse, Scale
} from 'lucide-react';
import { DashboardLayout } from '../components/Layout';
import { SecureDocumentUpload } from '../components/SecureDocumentUpload';
import { DocumentPreviewModal } from '../components/DocumentPreviewModal';
import { DocumentThumbnail } from '../components/DocumentThumbnail';
import { useToast } from '../components/UIComponents';
import { 
  SchoolDocument, DocumentFolder, DocumentCategory, 
  DocumentSecurityLevel, UserRole 
} from '../types';
import { 
  getStoredDocuments, getStoredFolders, deleteDocument, deleteDocuments,
  updateDocument, createFolder, deleteFolder, formatBytes, 
  DOCUMENT_STORAGE_EVENT 
} from '../utils/documentStorage';
import { useAuth } from '../context/AuthContext';
import { MOCK_STUDENTS } from '../constants';

export const SchoolAdminDocuments: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Storage state
  const [documents, setDocuments] = useState<SchoolDocument[]>(() => getStoredDocuments());
  const [folders, setFolders] = useState<DocumentFolder[]>(() => getStoredFolders());

  // URL query params
  const currentCategoryParam = searchParams.get('category') as DocumentCategory | null;
  const currentFolderParam = searchParams.get('folder');
  const actionParam = searchParams.get('action');

  // Filter & Search states
  const [activeFolder, setActiveFolder] = useState<string>(currentFolderParam || 'documents');
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | 'all'>(currentCategoryParam || 'all');
  const [selectedSecurity, setSelectedSecurity] = useState<DocumentSecurityLevel | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchScope, setSearchScope] = useState<'all' | 'name' | 'id' | 'type'>('all');
  const [selectedStudent, setSelectedStudent] = useState<string>('all');
  const [selectedDocType, setSelectedDocType] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedFormat, setSelectedFormat] = useState<'all' | 'pdf' | 'image' | 'doc'>('all');
  const [searchInAllFolders, setSearchInAllFolders] = useState(false);
  const [showOnlyLinkedStudents, setShowOnlyLinkedStudents] = useState(false);
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');

  // Modal states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(actionParam === 'upload');
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDesc, setNewFolderDesc] = useState('');

  // Move document modal
  const [movingDoc, setMovingDoc] = useState<SchoolDocument | null>(null);
  const [destinationFolder, setDestinationFolder] = useState<string>('documents');

  // Viewer modal
  const [previewDoc, setPreviewDoc] = useState<SchoolDocument | null>(null);

  // Bulk Selection states
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isBulkMovingModalOpen, setIsBulkMovingModalOpen] = useState(false);
  const [bulkDestinationFolder, setBulkDestinationFolder] = useState<string>('documents');
  const [isDeletingBatch, setIsDeletingBatch] = useState(false);

  // Sync with storage changes
  useEffect(() => {
    const handleUpdate = () => {
      setDocuments(getStoredDocuments());
      setFolders(getStoredFolders());
    };
    window.addEventListener(DOCUMENT_STORAGE_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(DOCUMENT_STORAGE_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Update active category from url params if present
  useEffect(() => {
    if (currentCategoryParam) {
      setSelectedCategory(currentCategoryParam);
      if (currentCategoryParam === 'student-records') setActiveFolder('documents/student-records');
      else if (currentCategoryParam === 'fee-receipts') setActiveFolder('documents/fee-receipts');
      else if (currentCategoryParam === 'academic-certificates') setActiveFolder('documents/academic-certificates');
    }
    if (currentFolderParam) {
      setActiveFolder(currentFolderParam);
    }
    if (actionParam === 'upload') {
      setIsUploadModalOpen(true);
    }
  }, [currentCategoryParam, currentFolderParam, actionParam]);

  // Extract all unique students from documents + mock roster
  const availableStudents = useMemo(() => {
    const map = new Map<string, { id: string; name: string; roll?: string; class?: string; docCount: number }>();
    
    // Seed with mock students
    MOCK_STUDENTS.forEach(st => {
      map.set(st.id, {
        id: st.id,
        name: st.name,
        roll: st.rollNo,
        class: st.class,
        docCount: 0
      });
    });

    // Count documents and include any unlisted students found in documents
    documents.forEach(doc => {
      if (doc.studentId && map.has(doc.studentId)) {
        map.get(doc.studentId)!.docCount += 1;
      } else if (doc.studentId || doc.studentName) {
        const key = doc.studentId || doc.studentName || 'unknown';
        if (!map.has(key)) {
          map.set(key, {
            id: doc.studentId || key,
            name: doc.studentName || 'Unnamed Student',
            roll: doc.studentRoll,
            class: doc.studentClass,
            docCount: 1
          });
        } else {
          map.get(key)!.docCount += 1;
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      // Prioritize students with docs
      if (b.docCount !== a.docCount) return b.docCount - a.docCount;
      return a.name.localeCompare(b.name);
    });
  }, [documents]);

  // Available classes list
  const availableClasses = useMemo(() => {
    const set = new Set<string>();
    documents.forEach(d => {
      if (d.studentClass) set.add(d.studentClass);
    });
    MOCK_STUDENTS.forEach(s => {
      if (s.class) set.add(s.class);
    });
    return Array.from(set).sort();
  }, [documents]);

  // Folder stats calculation
  const stats = useMemo(() => {
    const totalDocs = documents.length;
    const totalBytes = documents.reduce((sum, d) => sum + d.fileSize, 0);
    const studentRecords = documents.filter(d => d.category === 'student-records').length;
    const feeReceipts = documents.filter(d => d.category === 'fee-receipts').length;
    const certificates = documents.filter(d => d.category === 'academic-certificates').length;
    const confidentialCount = documents.filter(d => d.securityLevel === 'Confidential' || d.securityLevel === 'Restricted').length;

    return {
      totalDocs,
      totalBytes: formatBytes(totalBytes),
      studentRecords,
      feeReceipts,
      certificates,
      confidentialCount
    };
  }, [documents]);

  // Helper to test if a document matches specific sub-type classification
  const matchesDocType = (doc: SchoolDocument, typeKey: string): boolean => {
    if (typeKey === 'all') return true;
    const content = `${doc.title} ${doc.fileName} ${doc.category} ${doc.certificateType || ''} ${doc.tags.join(' ')} ${doc.notes || ''}`.toLowerCase();
    switch (typeKey) {
      case 'type-admission':
        return content.includes('admission') || content.includes('dossier') || content.includes('entry');
      case 'type-birth':
        return content.includes('birth') || content.includes('bris') || content.includes('nid');
      case 'type-tc':
        return content.includes('transfer') || content.includes('tc');
      case 'type-transcript':
        return content.includes('transcript') || content.includes('previous') || content.includes('prior');
      case 'type-tuition':
        return content.includes('tuition') || content.includes('term');
      case 'type-caution':
        return content.includes('caution') || content.includes('deposit') || content.includes('lab');
      case 'type-exam-fee':
        return content.includes('exam') || content.includes('voucher');
      case 'type-challan':
        return content.includes('challan') || content.includes('bank') || content.includes('bkash');
      case 'type-testimonial':
        return content.includes('testimonial') || content.includes('character');
      case 'type-merit':
        return content.includes('merit') || content.includes('honor') || content.includes('award') || content.includes('diploma');
      case 'type-board':
        return content.includes('board') || content.includes('ssc') || content.includes('registration') || content.includes('clearance');
      case 'type-accreditation':
        return doc.category === 'administrative' || content.includes('accredit') || content.includes('ministry');
      default:
        return content.includes(typeKey.toLowerCase());
    }
  };

  // Filtered documents with comprehensive search and multi-criteria filters
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      // 1. Folder filter: unless searchInAllFolders is enabled or student is specifically selected
      if (!searchInAllFolders && activeFolder !== 'documents' && selectedStudent === 'all') {
        if (doc.folder !== activeFolder && !doc.folder.startsWith(`${activeFolder}/`)) {
          return false;
        }
      }

      // 2. Primary Category filter
      if (selectedCategory !== 'all' && doc.category !== selectedCategory) {
        return false;
      }

      // 3. Security Classification filter
      if (selectedSecurity !== 'all' && doc.securityLevel !== selectedSecurity) {
        return false;
      }

      // 4. Student filter (by Student ID or Name)
      if (selectedStudent !== 'all') {
        const isMatch = (doc.studentId && doc.studentId === selectedStudent) ||
                        (doc.studentName && doc.studentName.toLowerCase() === selectedStudent.toLowerCase());
        if (!isMatch) return false;
      }

      // 5. Specific Document Subtype filter
      if (selectedDocType !== 'all') {
        if (!matchesDocType(doc, selectedDocType)) {
          return false;
        }
      }

      // 6. Academic Class filter
      if (selectedClass !== 'all') {
        const classMatch = doc.studentClass === selectedClass ||
                           doc.tags.some(t => t.toLowerCase() === selectedClass.toLowerCase()) ||
                           doc.title.toLowerCase().includes(selectedClass.toLowerCase());
        if (!classMatch) return false;
      }

      // 7. File Format filter
      if (selectedFormat !== 'all') {
        const fType = (doc.fileType || '').toLowerCase();
        const fName = (doc.fileName || '').toLowerCase();
        if (selectedFormat === 'pdf') {
          if (!fType.includes('pdf') && !fName.endsWith('.pdf')) return false;
        } else if (selectedFormat === 'image') {
          const isImg = fType.includes('image') || fName.match(/\.(png|jpg|jpeg|webp)$/i);
          if (!isImg) return false;
        } else if (selectedFormat === 'doc') {
          const isDoc = fType.includes('doc') || fType.includes('word') || fName.match(/\.(doc|docx|txt|xlsx)$/i);
          if (!isDoc) return false;
        }
      }

      // 8. Only Linked Students filter
      if (showOnlyLinkedStudents && !doc.studentName && !doc.studentId) {
        return false;
      }

      // 9. Intelligent Search query filter with targeted scope matching
      if (searchQuery.trim()) {
        const tokens = searchQuery.toLowerCase().trim().split(/\s+/);
        
        // Every token in query must match
        const matchesAllTokens = tokens.every(token => {
          if (searchScope === 'name') {
            // Target Name: studentName, title, uploadedBy.name
            return (
              (doc.studentName && doc.studentName.toLowerCase().includes(token)) ||
              doc.title.toLowerCase().includes(token) ||
              doc.uploadedBy.name.toLowerCase().includes(token)
            );
          } else if (searchScope === 'id') {
            // Target ID: studentId, rollNo, doc.id, transactionId
            return (
              (doc.studentId && doc.studentId.toLowerCase().includes(token)) ||
              (doc.studentRoll && doc.studentRoll.toLowerCase().includes(token)) ||
              doc.id.toLowerCase().includes(token) ||
              (doc.transactionId && doc.transactionId.toLowerCase().includes(token))
            );
          } else if (searchScope === 'type') {
            // Target Document Type: category, certificateType, fileType, tags, extension
            return (
              doc.category.toLowerCase().includes(token) ||
              (doc.certificateType && doc.certificateType.toLowerCase().includes(token)) ||
              doc.tags.some(t => t.toLowerCase().includes(token)) ||
              doc.fileType.toLowerCase().includes(token) ||
              doc.fileName.toLowerCase().includes(token)
            );
          } else {
            // Global All-fields search: checks name, id, type, title, hash, transaction
            return (
              doc.title.toLowerCase().includes(token) ||
              doc.fileName.toLowerCase().includes(token) ||
              (doc.studentName && doc.studentName.toLowerCase().includes(token)) ||
              (doc.studentId && doc.studentId.toLowerCase().includes(token)) ||
              (doc.studentRoll && doc.studentRoll.toLowerCase().includes(token)) ||
              (doc.studentClass && doc.studentClass.toLowerCase().includes(token)) ||
              doc.id.toLowerCase().includes(token) ||
              (doc.transactionId && doc.transactionId.toLowerCase().includes(token)) ||
              doc.category.toLowerCase().includes(token) ||
              (doc.certificateType && doc.certificateType.toLowerCase().includes(token)) ||
              doc.tags.some(t => t.toLowerCase().includes(token)) ||
              doc.fileHash.toLowerCase().includes(token) ||
              (doc.notes && doc.notes.toLowerCase().includes(token))
            );
          }
        });

        if (!matchesAllTokens) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'name') return a.title.localeCompare(b.title);
      if (sortBy === 'size') return b.fileSize - a.fileSize;
      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    });
  }, [
    documents, activeFolder, selectedCategory, selectedSecurity, searchQuery, 
    searchScope, selectedStudent, selectedDocType, selectedClass, selectedFormat, 
    searchInAllFolders, showOnlyLinkedStudents, sortBy
  ]);

  // Check if any search or filter is active
  const hasActiveFilters = useMemo(() => {
    return (
      searchQuery.trim().length > 0 ||
      searchScope !== 'all' ||
      selectedStudent !== 'all' ||
      selectedDocType !== 'all' ||
      selectedClass !== 'all' ||
      selectedFormat !== 'all' ||
      selectedCategory !== 'all' ||
      selectedSecurity !== 'all' ||
      showOnlyLinkedStudents ||
      searchInAllFolders
    );
  }, [
    searchQuery, searchScope, selectedStudent, selectedDocType, selectedClass, 
    selectedFormat, selectedCategory, selectedSecurity, showOnlyLinkedStudents, 
    searchInAllFolders
  ]);

  // Reset all filters to default
  const handleClearAllFilters = () => {
    setSearchQuery('');
    setSearchScope('all');
    setSelectedStudent('all');
    setSelectedDocType('all');
    setSelectedClass('all');
    setSelectedFormat('all');
    setSelectedCategory('all');
    setSelectedSecurity('all');
    setShowOnlyLinkedStudents(false);
    setSearchInAllFolders(false);
    showToast('Filters cleared', 'info');
  };

  // Quick preset helper
  const handleApplyPreset = (preset: string) => {
    if (preset === 'all') {
      handleClearAllFilters();
    } else if (preset === 'student-records') {
      setSelectedCategory('student-records');
      setActiveFolder('documents/student-records');
      setSelectedDocType('all');
    } else if (preset === 'fee-receipts') {
      setSelectedCategory('fee-receipts');
      setActiveFolder('documents/fee-receipts');
      setSelectedDocType('all');
    } else if (preset === 'academic-certificates') {
      setSelectedCategory('academic-certificates');
      setActiveFolder('documents/academic-certificates');
      setSelectedDocType('all');
    } else if (preset === 'medical') {
      setSelectedCategory('medical');
      setActiveFolder('documents/medical');
      setSelectedDocType('all');
    } else if (preset === 'legal') {
      setSelectedCategory('legal');
      setActiveFolder('documents/legal');
      setSelectedDocType('all');
    } else if (preset === 'academic') {
      setSelectedCategory('academic');
      setActiveFolder('documents/academic');
      setSelectedDocType('all');
    } else if (preset === 'class-10') {
      setSelectedClass('Class 10');
      setIsAdvancedFilterOpen(true);
    } else if (preset === 'linked-students') {
      setShowOnlyLinkedStudents(true);
    } else if (preset === 'confidential') {
      setSelectedSecurity('Confidential');
    }
  };

  // Selected documents objects & stats
  const selectedDocuments = useMemo(() => {
    const map = new Map(documents.map(d => [d.id, d]));
    return selectedDocIds.map(id => map.get(id)).filter((d): d is SchoolDocument => !!d);
  }, [selectedDocIds, documents]);

  const selectedTotalBytes = useMemo(() => {
    return selectedDocuments.reduce((sum, d) => sum + d.fileSize, 0);
  }, [selectedDocuments]);

  // View-specific selection state
  const isAllSelected = useMemo(() => {
    return filteredDocuments.length > 0 && filteredDocuments.every(d => selectedDocIds.includes(d.id));
  }, [filteredDocuments, selectedDocIds]);

  const isSomeSelected = useMemo(() => {
    return filteredDocuments.some(d => selectedDocIds.includes(d.id));
  }, [filteredDocuments, selectedDocIds]);

  const isPartiallySelected = isSomeSelected && !isAllSelected;

  const handleToggleSelectDoc = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedDocIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      // Unselect all currently visible
      const visibleIds = new Set(filteredDocuments.map(d => d.id));
      setSelectedDocIds(prev => prev.filter(id => !visibleIds.has(id)));
    } else {
      // Select all visible
      const visibleIds = filteredDocuments.map(d => d.id);
      setSelectedDocIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleClearSelection = () => {
    setSelectedDocIds([]);
  };

  const handleSelectAllVisible = () => {
    setSelectedDocIds(filteredDocuments.map(d => d.id));
  };

  const handleSelectAllInVault = () => {
    setSelectedDocIds(documents.map(d => d.id));
  };

  const handleBatchDownload = () => {
    if (selectedDocuments.length === 0) return;
    selectedDocuments.forEach((doc, idx) => {
      setTimeout(() => {
        handleDownload(doc);
      }, idx * 250);
    });
    showToast(`Downloading ${selectedDocuments.length} document${selectedDocuments.length > 1 ? 's' : ''}...`, 'info');
  };

  // Handle Single or Batch Delete Trigger
  const handleDeleteDoc = (id: string, _title?: string) => {
    setSelectedDocIds([id]);
    setIsBulkDeleteModalOpen(true);
  };

  // Execute Batch Delete
  const handleConfirmBatchDelete = () => {
    if (selectedDocIds.length === 0) return;
    setIsDeletingBatch(true);

    setTimeout(() => {
      const count = deleteDocuments(selectedDocIds);
      if (previewDoc && selectedDocIds.includes(previewDoc.id)) {
        setPreviewDoc(null);
      }
      showToast(`Successfully purged ${count} document${count > 1 ? 's' : ''} from vault`, 'success');
      setSelectedDocIds([]);
      setIsDeletingBatch(false);
      setIsBulkDeleteModalOpen(false);
    }, 400);
  };

  // Execute Batch Move
  const handleConfirmBatchMove = () => {
    if (selectedDocIds.length === 0) return;
    selectedDocIds.forEach(id => {
      updateDocument(id, { folder: bulkDestinationFolder });
    });
    showToast(`Moved ${selectedDocIds.length} document${selectedDocIds.length > 1 ? 's' : ''} to '${bulkDestinationFolder}'`, 'success');
    setSelectedDocIds([]);
    setIsBulkMovingModalOpen(false);
  };

  // Handle Move
  const handleConfirmMove = () => {
    if (movingDoc) {
      updateDocument(movingDoc.id, { folder: destinationFolder });
      showToast(`Moved to '${destinationFolder}'`, 'success');
      setMovingDoc(null);
    }
  };

  // Handle New Folder
  const handleCreateNewFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    const created = createFolder(newFolderName, activeFolder, undefined, newFolderDesc);
    showToast(`Folder '${created.name}' created`, 'success');
    setActiveFolder(created.path);
    setIsNewFolderModalOpen(false);
    setNewFolderName('');
    setNewFolderDesc('');
  };

  // Copy hash helper
  const copyToClipboard = (text: string, label = 'SHA-256 Checksum') => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard!`, 'info');
  };

  // Download simulation
  const handleDownload = (doc: SchoolDocument) => {
    if (doc.contentUrl) {
      const a = document.createElement('a');
      a.href = doc.contentUrl;
      a.download = doc.fileName;
      a.click();
    } else {
      // Generate text blob with record verification
      const receiptContent = `AMAR SMART SCHOOL - OFFICIAL VAULT ARCHIVE
=========================================
Document ID: ${doc.id}
Title: ${doc.title}
Filename: ${doc.fileName}
Folder: ${doc.folder}
Category: ${doc.category}
Student: ${doc.studentName || 'N/A'} (Roll: ${doc.studentRoll || 'N/A'}, Class: ${doc.studentClass || 'N/A'})
Security Classification: ${doc.securityLevel}
SHA-256 Checksum: ${doc.fileHash}
Verification: Cryptographically Validated by Smart Amar School System
Uploaded By: ${doc.uploadedBy.name} (${doc.uploadedBy.role}) on ${doc.uploadedAt}
=========================================
This document is a certified copy stored in the institutional repository.`;

      const blob = new Blob([receiptContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.fileName.endsWith('.txt') ? doc.fileName : `${doc.fileName}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
    showToast(`Downloading '${doc.fileName}'...`, 'info');
  };

  // Breadcrumbs generator
  const breadcrumbSegments = useMemo(() => {
    const parts = activeFolder.split('/');
    const items: { label: string; path: string }[] = [];
    let currentPath = '';
    parts.forEach((p, idx) => {
      currentPath = idx === 0 ? p : `${currentPath}/${p}`;
      const fld = folders.find(f => f.path === currentPath);
      items.push({
        label: fld ? fld.name : p,
        path: currentPath
      });
    });
    return items;
  }, [activeFolder, folders]);

  return (
    <DashboardLayout role={UserRole.SCHOOL_ADMIN}>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <FolderArchive size={22} />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Secure Document Vault
              </h1>
              <span className="text-[11px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck size={13} />
                AES-256 Compliant
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Encrypted institutional file repository for student admission files, tuition fee receipts, and academic certificates.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsNewFolderModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors flex items-center gap-1.5"
            >
              <FolderPlus size={16} />
              <span>New Subfolder</span>
            </button>

            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-indigo-200 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <UploadCloud size={16} />
              <span>Upload Document</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Vault Files</span>
              <HardDrive size={16} className="text-indigo-600" />
            </div>
            <div className="text-xl font-black text-slate-900">{stats.totalDocs}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{stats.totalBytes} stored</div>
          </div>

          <div 
            onClick={() => { setActiveFolder('documents/student-records'); setSelectedCategory('student-records'); }}
            className="bg-white p-4 rounded-xl border border-indigo-100 hover:border-indigo-300 cursor-pointer shadow-2xs transition-all hover:bg-indigo-50/30"
          >
            <div className="flex items-center justify-between text-indigo-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Student Records</span>
              <Users size={16} />
            </div>
            <div className="text-xl font-black text-indigo-950">{stats.studentRecords}</div>
            <div className="text-[10px] text-indigo-600 font-semibold mt-0.5">Birth certs, admissions</div>
          </div>

          <div 
            onClick={() => { setActiveFolder('documents/fee-receipts'); setSelectedCategory('fee-receipts'); }}
            className="bg-white p-4 rounded-xl border border-emerald-100 hover:border-emerald-300 cursor-pointer shadow-2xs transition-all hover:bg-emerald-50/30"
          >
            <div className="flex items-center justify-between text-emerald-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Fee Receipts</span>
              <Receipt size={16} />
            </div>
            <div className="text-xl font-black text-emerald-950">{stats.feeReceipts}</div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Bank slips, tuition vouchers</div>
          </div>

          <div 
            onClick={() => { setActiveFolder('documents/academic-certificates'); setSelectedCategory('academic-certificates'); }}
            className="bg-white p-4 rounded-xl border border-purple-100 hover:border-purple-300 cursor-pointer shadow-2xs transition-all hover:bg-purple-50/30"
          >
            <div className="flex items-center justify-between text-purple-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Certificates</span>
              <FileBadge size={16} />
            </div>
            <div className="text-xl font-black text-purple-950">{stats.certificates}</div>
            <div className="text-[10px] text-purple-600 font-semibold mt-0.5">Testimonials, board certs</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-2xs">
            <div className="flex items-center justify-between text-amber-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Confidential</span>
              <Lock size={16} />
            </div>
            <div className="text-xl font-black text-amber-950">{stats.confidentialCount}</div>
            <div className="text-[10px] text-amber-600 font-semibold mt-0.5">Restricted permissions</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Vault Integrity</span>
              <ShieldCheck size={16} className="text-emerald-500" />
            </div>
            <div className="text-xl font-black text-emerald-600">100%</div>
            <div className="text-[10px] text-slate-500 mt-0.5">SHA-256 Signatures Valid</div>
          </div>
        </div>

        {/* Main Explorer Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column: Dedicated Folders Tree */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Folder Directory
                </span>
                <span className="text-[11px] font-mono text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">
                  {folders.length} Folders
                </span>
              </div>

              <div className="space-y-1">
                {folders.map(fld => {
                  const countInFolder = documents.filter(d => 
                    fld.path === 'documents' 
                      ? true 
                      : d.folder === fld.path || d.folder.startsWith(`${fld.path}/`)
                  ).length;

                  const isActive = activeFolder === fld.path;

                  return (
                    <button
                      key={fld.id}
                      onClick={() => {
                        setActiveFolder(fld.path);
                        if (fld.category) setSelectedCategory(fld.category);
                        else setSelectedCategory('all');
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between group ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Folder 
                          size={16} 
                          className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'} 
                        />
                        <span className="truncate">{fld.name}</span>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {countInFolder}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Security Policy Reminder */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-[11px] text-slate-600 space-y-1 mt-4">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>Institutional Archiving</span>
                </div>
                <p className="text-[10.5px] text-slate-500 leading-relaxed">
                  All documents stored in <code className="bg-slate-200/80 px-1 py-0.5 rounded font-mono text-indigo-700">documents/</code> are indexed with SHA-256 cryptographic signatures.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Files Explorer */}
          <div className="lg:col-span-3 space-y-4">
            {/* Quick Filter Presets Row */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
              <span className="text-slate-400 font-bold shrink-0 flex items-center gap-1 mr-1">
                <Sparkles size={13} className="text-amber-500" />
                <span>Quick:</span>
              </span>
              <button
                onClick={() => handleApplyPreset('all')}
                className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all ${
                  !hasActiveFilters
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                All Documents
              </button>
              <button
                onClick={() => handleApplyPreset('student-records')}
                className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all flex items-center gap-1 ${
                  selectedCategory === 'student-records' && activeFolder.includes('student-records')
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Users size={12} />
                <span>Student Records</span>
              </button>
              <button
                onClick={() => handleApplyPreset('fee-receipts')}
                className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all flex items-center gap-1 ${
                  selectedCategory === 'fee-receipts' && activeFolder.includes('fee-receipts')
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Receipt size={12} />
                <span>Fee Receipts</span>
              </button>
              <button
                onClick={() => handleApplyPreset('medical')}
                className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all flex items-center gap-1 ${
                  selectedCategory === 'medical' && activeFolder.includes('medical')
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <HeartPulse size={12} />
                <span>Medical</span>
              </button>
              <button
                onClick={() => handleApplyPreset('legal')}
                className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all flex items-center gap-1 ${
                  selectedCategory === 'legal' && activeFolder.includes('legal')
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Scale size={12} />
                <span>Legal</span>
              </button>
              <button
                onClick={() => handleApplyPreset('academic')}
                className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all flex items-center gap-1 ${
                  selectedCategory === 'academic' && activeFolder.includes('academic')
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <GraduationCap size={12} />
                <span>Academic</span>
              </button>
              <button
                onClick={() => handleApplyPreset('academic-certificates')}
                className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all flex items-center gap-1 ${
                  selectedCategory === 'academic-certificates' && activeFolder.includes('academic-certificates')
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FileBadge size={12} />
                <span>Certificates</span>
              </button>
              <button
                onClick={() => handleApplyPreset('class-10')}
                className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all flex items-center gap-1 ${
                  selectedClass === 'Class 10'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <GraduationCap size={12} />
                <span>Class 10</span>
              </button>
              <button
                onClick={() => handleApplyPreset('linked-students')}
                className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all flex items-center gap-1 ${
                  showOnlyLinkedStudents
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <UserCheck size={12} />
                <span>Student Dossiers Only</span>
              </button>
              <button
                onClick={() => handleApplyPreset('confidential')}
                className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all flex items-center gap-1 ${
                  selectedSecurity === 'Confidential'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Lock size={12} />
                <span>Confidential</span>
              </button>
            </div>

            {/* Filter and Search Bar Card */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              {/* Breadcrumb Path Bar */}
              <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-slate-400">Path:</span>
                  {breadcrumbSegments.map((seg, idx) => (
                    <React.Fragment key={seg.path}>
                      {idx > 0 && <ChevronRight size={14} className="text-slate-300 shrink-0" />}
                      <button
                        onClick={() => {
                          setActiveFolder(seg.path);
                          setSearchInAllFolders(false);
                        }}
                        className={`hover:text-indigo-600 font-mono px-1.5 py-0.5 rounded transition-colors ${
                          seg.path === activeFolder && !searchInAllFolders
                            ? 'font-bold text-indigo-600 bg-indigo-50' 
                            : 'text-slate-600'
                        }`}
                      >
                        {seg.label}
                      </button>
                    </React.Fragment>
                  ))}
                </div>

                {/* Search across entire vault toggle */}
                <button
                  onClick={() => setSearchInAllFolders(!searchInAllFolders)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1.5 shrink-0 ${
                    searchInAllFolders
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-700'
                  }`}
                  title="Search files across all folders in the entire vault"
                >
                  <FolderArchive size={13} />
                  <span>{searchInAllFolders ? 'Searching All Folders' : 'Search Current Folder Only'}</span>
                </button>
              </div>

              {/* Main Search Bar & Quick Dropdowns Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                {/* Search Bar with Scope Selection */}
                <div className="md:col-span-6 relative">
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 bg-white">
                    {/* Search Scope Dropdown */}
                    <div className="bg-slate-50 border-r border-slate-200 px-2 py-2 shrink-0">
                      <select
                        value={searchScope}
                        onChange={(e) => setSearchScope(e.target.value as any)}
                        className="text-[11px] font-bold text-slate-700 bg-transparent focus:outline-hidden cursor-pointer"
                        title="Choose Search Scope: All fields, Student Name, Student/Doc ID, or Document Type"
                      >
                        <option value="all">All Fields</option>
                        <option value="name">Student Name</option>
                        <option value="id">ID (Student/Doc)</option>
                        <option value="type">Document Type</option>
                      </select>
                    </div>

                    {/* Search Input */}
                    <div className="relative flex-1 flex items-center">
                      <Search size={15} className="text-slate-400 ml-2.5 shrink-0" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={
                          searchScope === 'name' 
                            ? 'Search by student name or title...' 
                            : searchScope === 'id' 
                            ? 'Search by student ID (ST-...), Roll, Doc ID (DOC-...), Txn...' 
                            : searchScope === 'type' 
                            ? 'Search by document type (admission, tuition, cert, PDF)...' 
                            : 'Search by student name, ID, roll, type, or checksum...'
                        }
                        className="w-full pl-2 pr-8 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                          title="Clear search text"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Document Type Selector */}
                <div className="md:col-span-3">
                  <select
                    value={selectedDocType}
                    onChange={(e) => {
                      setSelectedDocType(e.target.value);
                      if (e.target.value.startsWith('type-')) {
                        // Automatically align primary category if appropriate
                        if (['type-admission', 'type-birth', 'type-tc', 'type-transcript'].includes(e.target.value)) {
                          setSelectedCategory('student-records');
                        } else if (['type-tuition', 'type-caution', 'type-exam-fee', 'type-challan'].includes(e.target.value)) {
                          setSelectedCategory('fee-receipts');
                        } else if (['type-testimonial', 'type-merit', 'type-board'].includes(e.target.value)) {
                          setSelectedCategory('academic-certificates');
                        } else if (['type-academic-record', 'type-board-cert'].includes(e.target.value)) {
                          setSelectedCategory('academic');
                        } else if (['type-fitness', 'type-immunization', 'type-clinical'].includes(e.target.value)) {
                          setSelectedCategory('medical');
                        } else if (['type-affidavit', 'type-indemnity', 'type-custody'].includes(e.target.value)) {
                          setSelectedCategory('legal');
                        }
                      }
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-medium text-slate-700"
                    title="Filter by specific document type"
                  >
                    <option value="all">All Document Types</option>
                    <optgroup label="— Student Records —">
                      <option value="type-admission">Admission Dossier & Form</option>
                      <option value="type-birth">Birth Registration (BRIS)</option>
                      <option value="type-tc">Transfer Certificate (TC)</option>
                      <option value="type-transcript">Prior Academic Transcript</option>
                    </optgroup>
                    <optgroup label="— Academic Credentials —">
                      <option value="type-academic-record">National Curriculum Transcript</option>
                      <option value="type-board-cert">Board Pass Certificate</option>
                    </optgroup>
                    <optgroup label="— Medical Records —">
                      <option value="type-fitness">Annual Physical Fitness</option>
                      <option value="type-immunization">Immunization & Vaccine Record</option>
                      <option value="type-clinical">Clinical Doctor Prescription</option>
                    </optgroup>
                    <optgroup label="— Legal Affidavits —">
                      <option value="type-affidavit">Parental Guardianship Affidavit</option>
                      <option value="type-indemnity">Notarized Indemnity Undertaking</option>
                      <option value="type-custody">Custody Deed / Court Order</option>
                    </optgroup>
                    <optgroup label="— Fee Receipts —">
                      <option value="type-tuition">Tuition Fee Slip</option>
                      <option value="type-caution">Caution & Lab Deposit</option>
                      <option value="type-exam-fee">Exam Fee Slip</option>
                      <option value="type-challan">Bank Challan Voucher</option>
                    </optgroup>
                    <optgroup label="— Academic Certificates —">
                      <option value="type-testimonial">Character Testimonial</option>
                      <option value="type-merit">Merit & Honors Diploma</option>
                      <option value="type-board">Board Clearance Certificate</option>
                    </optgroup>
                    <optgroup label="— Administrative —">
                      <option value="type-accreditation">Ministry & Board Accreditation</option>
                    </optgroup>
                  </select>
                </div>

                {/* Student Selector */}
                <div className="md:col-span-3 flex items-center gap-2">
                  <select
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-medium text-slate-700 truncate"
                    title="Filter documents belonging to a specific student"
                  >
                    <option value="all">All Students ({availableStudents.length})</option>
                    {availableStudents.map(st => (
                      <option key={st.id} value={st.id}>
                        {st.name} ({st.id || `Roll ${st.roll}`} • {st.docCount} {st.docCount === 1 ? 'doc' : 'docs'})
                      </option>
                    ))}
                  </select>

                  {/* Filter Drawer Toggle */}
                  <button
                    onClick={() => setIsAdvancedFilterOpen(!isAdvancedFilterOpen)}
                    className={`p-2 rounded-xl border transition-colors relative shrink-0 ${
                      isAdvancedFilterOpen || (selectedClass !== 'all' || selectedFormat !== 'all' || selectedSecurity !== 'all' || showOnlyLinkedStudents)
                        ? 'bg-indigo-50 border-indigo-300 text-indigo-600'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                    title="Toggle Advanced Filters (Class, Format, Security)"
                  >
                    <SlidersHorizontal size={15} />
                    {(selectedClass !== 'all' || selectedFormat !== 'all' || selectedSecurity !== 'all' || showOnlyLinkedStudents) && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-600 rounded-full ring-2 ring-white" />
                    )}
                  </button>

                  {/* View Mode Toggle */}
                  <div className="flex border border-slate-200 rounded-xl overflow-hidden shrink-0">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                      title="Grid View"
                    >
                      <FileText size={15} />
                    </button>
                    <button
                      onClick={() => setViewMode('table')}
                      className={`p-2 transition-colors ${viewMode === 'table' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                      title="List View"
                    >
                      <Filter size={15} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Collapsible Advanced Filters Drawer */}
              {isAdvancedFilterOpen && (
                <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50/70 p-3 rounded-xl border border-slate-200/60 animate-in fade-in">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Repository Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-700"
                    >
                      <option value="all">All Categories</option>
                      <option value="academic">Academic Documents</option>
                      <option value="medical">Medical Records</option>
                      <option value="legal">Legal & Affidavits</option>
                      <option value="student-records">Student Records</option>
                      <option value="fee-receipts">Fee Receipts</option>
                      <option value="academic-certificates">Certificates</option>
                      <option value="administrative">Administrative</option>
                    </select>
                  </div>

                  {/* Class Filter */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Academic Class
                    </label>
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-700"
                    >
                      <option value="all">All Classes</option>
                      {availableClasses.map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                      ))}
                    </select>
                  </div>

                  {/* File Format Filter */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      File Format
                    </label>
                    <select
                      value={selectedFormat}
                      onChange={(e) => setSelectedFormat(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-700"
                    >
                      <option value="all">All Formats</option>
                      <option value="pdf">PDF Documents (.pdf)</option>
                      <option value="image">Image Scans (.png, .jpg)</option>
                      <option value="doc">Word / Office (.docx, .txt)</option>
                    </select>
                  </div>

                  {/* Security Classification Filter */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Security Clearance
                    </label>
                    <select
                      value={selectedSecurity}
                      onChange={(e) => setSelectedSecurity(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-700"
                    >
                      <option value="all">All Security Levels</option>
                      <option value="Standard">Standard</option>
                      <option value="Confidential">Confidential</option>
                      <option value="Restricted">Restricted</option>
                    </select>
                  </div>

                  {/* Checkbox Options */}
                  <div className="sm:col-span-2 md:col-span-4 flex items-center justify-between pt-2 border-t border-slate-200/50 flex-wrap gap-2 text-xs">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                      <input
                        type="checkbox"
                        checked={showOnlyLinkedStudents}
                        onChange={(e) => setShowOnlyLinkedStudents(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Only show files linked to registered student profiles</span>
                    </label>

                    <label className="inline-flex items-center gap-2 cursor-pointer text-slate-700 font-medium">
                      <input
                        type="checkbox"
                        checked={searchInAllFolders}
                        onChange={(e) => setSearchInAllFolders(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Bypass current directory and search across entire vault</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Active Filter Chips Bar */}
              {hasActiveFilters && (
                <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-400 font-bold mr-1 text-[11px]">Active Filters:</span>

                  {/* Search Query Chip */}
                  {searchQuery.trim() && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium text-[11px]">
                      <span>
                        {searchScope === 'name' ? 'Name' : searchScope === 'id' ? 'ID' : searchScope === 'type' ? 'Type' : 'Query'}: "{searchQuery}"
                      </span>
                      <button onClick={() => setSearchQuery('')} className="hover:text-indigo-900 p-0.5">
                        <X size={12} />
                      </button>
                    </span>
                  )}

                  {/* Student Chip */}
                  {selectedStudent !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium text-[11px]">
                      <Users size={11} />
                      <span>
                        Student: {availableStudents.find(s => s.id === selectedStudent)?.name || selectedStudent}
                      </span>
                      <button onClick={() => setSelectedStudent('all')} className="hover:text-indigo-900 p-0.5">
                        <X size={12} />
                      </button>
                    </span>
                  )}

                  {/* Document Type Chip */}
                  {selectedDocType !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-medium text-[11px]">
                      <FileBadge size={11} />
                      <span>Type: {(selectedDocType || '').replace('type-', '').replace('-', ' ').toUpperCase()}</span>
                      <button onClick={() => setSelectedDocType('all')} className="hover:text-purple-900 p-0.5">
                        <X size={12} />
                      </button>
                    </span>
                  )}

                  {/* Category Chip */}
                  {selectedCategory !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-medium text-[11px]">
                      <span>Category: {selectedCategory}</span>
                      <button onClick={() => setSelectedCategory('all')} className="hover:text-slate-900 p-0.5">
                        <X size={12} />
                      </button>
                    </span>
                  )}

                  {/* Class Chip */}
                  {selectedClass !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium text-[11px]">
                      <GraduationCap size={11} />
                      <span>Class: {selectedClass}</span>
                      <button onClick={() => setSelectedClass('all')} className="hover:text-blue-900 p-0.5">
                        <X size={12} />
                      </button>
                    </span>
                  )}

                  {/* Format Chip */}
                  {selectedFormat !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-medium text-[11px]">
                      <span>Format: {selectedFormat.toUpperCase()}</span>
                      <button onClick={() => setSelectedFormat('all')} className="hover:text-slate-900 p-0.5">
                        <X size={12} />
                      </button>
                    </span>
                  )}

                  {/* Security Chip */}
                  {selectedSecurity !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium text-[11px]">
                      <Lock size={11} />
                      <span>Security: {selectedSecurity}</span>
                      <button onClick={() => setSelectedSecurity('all')} className="hover:text-amber-900 p-0.5">
                        <X size={12} />
                      </button>
                    </span>
                  )}

                  {/* Linked Students Only Chip */}
                  {showOnlyLinkedStudents && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium text-[11px]">
                      <UserCheck size={11} />
                      <span>Student Dossiers Only</span>
                      <button onClick={() => setShowOnlyLinkedStudents(false)} className="hover:text-emerald-900 p-0.5">
                        <X size={12} />
                      </button>
                    </span>
                  )}

                  {/* Entire Vault Chip */}
                  {searchInAllFolders && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium text-[11px]">
                      <FolderArchive size={11} />
                      <span>Entire Vault</span>
                      <button onClick={() => setSearchInAllFolders(false)} className="hover:text-indigo-900 p-0.5">
                        <X size={12} />
                      </button>
                    </span>
                  )}

                  {/* Clear All Button */}
                  <button
                    onClick={handleClearAllFilters}
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-rose-600 hover:text-rose-700 font-bold ml-auto transition-colors"
                  >
                    <RotateCcw size={12} />
                    <span>Reset All</span>
                  </button>
                </div>
              )}
            </div>

            {/* Results Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 px-1">
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Select All Visible toggle */}
                {filteredDocuments.length > 0 && (
                  <button
                    type="button"
                    onClick={handleToggleSelectAll}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs ${
                      isAllSelected
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : isPartiallySelected
                        ? 'bg-indigo-100 text-indigo-800 border border-indigo-300 hover:bg-indigo-200'
                        : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                    title={isAllSelected ? 'Deselect all visible' : 'Select all visible'}
                  >
                    <div className={`w-3.5 h-3.5 rounded flex items-center justify-center ${
                      isAllSelected ? 'bg-indigo-600 text-white' : isPartiallySelected ? 'bg-indigo-600 text-white' : 'border border-slate-400'
                    }`}>
                      {isAllSelected && <Check size={11} strokeWidth={3} />}
                      {isPartiallySelected && <Minus size={11} strokeWidth={3} />}
                    </div>
                    <span>{isAllSelected ? 'Deselect All' : isPartiallySelected ? `Selected (${selectedDocIds.length})` : 'Select All'}</span>
                  </button>
                )}

                <span>
                  Found <strong className="text-slate-800">{filteredDocuments.length}</strong> matching {filteredDocuments.length === 1 ? 'document' : 'documents'}{' '}
                  {searchInAllFolders ? (
                    <span>across <strong className="text-indigo-600">Entire Vault</strong></span>
                  ) : (
                    <span>in <code className="text-indigo-600 font-mono font-bold">{activeFolder}</code></span>
                  )}
                </span>
                {hasActiveFilters && (
                  <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                    Filtered
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-[11px]">
                {selectedDocIds.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 underline mr-2 transition-colors"
                  >
                    Clear selection ({selectedDocIds.length})
                  </button>
                )}
                <span>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent font-bold text-slate-700 focus:outline-hidden cursor-pointer"
                >
                  <option value="date">Upload Date</option>
                  <option value="name">Title Name</option>
                  <option value="size">File Size</option>
                </select>
              </div>
            </div>

            {/* Bulk Actions Banner (appears when documents are selected) */}
            {selectedDocIds.length > 0 && (
              <div className="bg-slate-900 text-white rounded-2xl p-3 sm:p-4 shadow-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-400/30 flex items-center justify-center font-bold font-mono text-xs shrink-0">
                    {selectedDocIds.length}
                  </div>

                  <div>
                    <div className="text-xs sm:text-sm font-bold flex items-center gap-2">
                      <span>{selectedDocIds.length} {selectedDocIds.length === 1 ? 'document' : 'documents'} selected</span>
                      <span className="text-slate-400 text-xs">•</span>
                      <span className="text-slate-300 font-mono text-xs">{formatBytes(selectedTotalBytes)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      {!isAllSelected && (
                        <button
                          type="button"
                          onClick={handleSelectAllVisible}
                          className="hover:text-white underline decoration-slate-600 hover:decoration-white transition-colors"
                        >
                          Select all visible ({filteredDocuments.length})
                        </button>
                      )}
                      {selectedDocIds.length < documents.length && (
                        <button
                          type="button"
                          onClick={handleSelectAllInVault}
                          className="hover:text-white underline decoration-slate-600 hover:decoration-white transition-colors"
                        >
                          Select entire vault ({documents.length})
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
                  {/* Batch Move */}
                  <button
                    type="button"
                    onClick={() => {
                      setBulkDestinationFolder(activeFolder);
                      setIsBulkMovingModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-700"
                    title="Move selected files to another folder"
                  >
                    <Folder size={14} className="text-indigo-400" />
                    <span>Move</span>
                  </button>

                  {/* Batch Download */}
                  <button
                    type="button"
                    onClick={handleBatchDownload}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-700"
                    title="Download all selected files"
                  >
                    <Download size={14} className="text-emerald-400" />
                    <span>Download</span>
                  </button>

                  {/* Batch Delete Trigger */}
                  <button
                    type="button"
                    onClick={() => setIsBulkDeleteModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                    title="Permanently purge selected documents"
                  >
                    <Trash2 size={14} />
                    <span>Delete Selected ({selectedDocIds.length})</span>
                  </button>

                  {/* Clear Selection */}
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
                    title="Cancel selection"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Documents List / Grid */}
            {filteredDocuments.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-indigo-50 text-indigo-400 flex items-center justify-center mx-auto">
                  <SearchCode size={26} />
                </div>
                <h3 className="text-base font-bold text-slate-800">No documents match your search & filter criteria</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {hasActiveFilters ? (
                    <span>
                      Try broadening your search query, switching search scope, or resetting filters to view all documents.
                    </span>
                  ) : (
                    <span>
                      No documents found in folder <code className="font-mono text-indigo-600">{activeFolder}</code>. Upload documents or select another folder from the left directory.
                    </span>
                  )}
                </p>

                <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
                  {hasActiveFilters && (
                    <button
                      onClick={handleClearAllFilters}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors shadow-2xs"
                    >
                      <RotateCcw size={14} />
                      <span>Clear All Filters</span>
                    </button>
                  )}

                  {!searchInAllFolders && (
                    <button
                      onClick={() => setSearchInAllFolders(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors shadow-2xs"
                    >
                      <FolderArchive size={14} />
                      <span>Search Across Entire Vault</span>
                    </button>
                  )}

                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                  >
                    <UploadCloud size={14} />
                    <span>Upload New Document</span>
                  </button>
                </div>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocuments.map(doc => {
                  const isRecord = doc.category === 'student-records';
                  const isFee = doc.category === 'fee-receipts';
                  const isCert = doc.category === 'academic-certificates';
                  const isSelected = selectedDocIds.includes(doc.id);

                  return (
                    <div
                      key={doc.id}
                      className={`bg-white rounded-2xl border p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group relative ${
                        isSelected 
                          ? 'border-indigo-500 ring-2 ring-indigo-500/80 bg-indigo-50/15' 
                          : 'border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      {/* Top Badges & Document ID */}
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            {/* Card Selection Checkbox */}
                            <button
                              type="button"
                              onClick={(e) => handleToggleSelectDoc(doc.id, e)}
                              className={`w-5 h-5 rounded-md flex items-center justify-center transition-all shrink-0 ${
                                isSelected 
                                  ? 'bg-indigo-600 text-white shadow-2xs' 
                                  : 'border border-slate-300 hover:border-indigo-400 bg-white group-hover:border-slate-400'
                              }`}
                              title={isSelected ? 'Deselect document' : 'Select document'}
                            >
                              {isSelected && <Check size={13} strokeWidth={3} />}
                            </button>

                            <button
                              onClick={() => {
                                setSelectedCategory(doc.category);
                                setSelectedDocType('all');
                              }}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 hover:opacity-80 transition-opacity truncate ${
                                doc.category === 'medical' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                                doc.category === 'legal' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                doc.category === 'academic' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                isRecord ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                                isFee ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                isCert ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                                'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                              title={`Filter category: ${doc.category}`}
                            >
                              {doc.category === 'medical' && <HeartPulse size={11} />}
                              {doc.category === 'legal' && <Scale size={11} />}
                              {doc.category === 'academic' && <GraduationCap size={11} />}
                              {isRecord && <Users size={11} />}
                              {isFee && <Receipt size={11} />}
                              {isCert && <FileBadge size={11} />}
                              <span>{
                                doc.category === 'medical' ? 'Medical' :
                                doc.category === 'legal' ? 'Legal' :
                                doc.category === 'academic' ? 'Academic' :
                                isRecord ? 'Record' : 
                                isFee ? 'Receipt' : 
                                isCert ? 'Certificate' : 'Admin'
                              }</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {/* Document ID badge */}
                            <button
                              onClick={() => {
                                setSearchScope('id');
                                setSearchQuery(doc.id);
                              }}
                              className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 px-1.5 py-0.5 rounded transition-colors"
                              title="Filter by Document ID"
                            >
                              {doc.id}
                            </button>

                            {/* Security badge */}
                            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                              doc.securityLevel === 'Restricted' ? 'bg-rose-100 text-rose-800' :
                              doc.securityLevel === 'Confidential' ? 'bg-amber-100 text-amber-800' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {doc.securityLevel}
                            </span>
                          </div>
                        </div>

                        {/* Visual Document Thumbnail */}
                        <div className="mb-2.5">
                          <DocumentThumbnail
                            document={doc}
                            size="md"
                            onClick={() => setPreviewDoc(doc)}
                          />
                        </div>

                        {/* Title and File info */}
                        <h4 
                          onClick={() => setPreviewDoc(doc)}
                          className="text-xs font-bold text-slate-800 hover:text-indigo-600 cursor-pointer line-clamp-2 transition-colors"
                          title={doc.title}
                        >
                          {doc.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                          {doc.fileName}
                        </p>

                        {/* Student Dossier Badge if attached */}
                        {doc.studentName && (
                          <div 
                            onClick={() => {
                              if (doc.studentId) setSelectedStudent(doc.studentId);
                              else setSearchQuery(doc.studentName || '');
                            }}
                            className="mt-2.5 p-2 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200/80 hover:border-indigo-200 cursor-pointer transition-all flex items-center justify-between text-[11px] group/stu"
                            title="Click to filter all documents for this student"
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-[10px] shrink-0">
                                {(doc.studentName || 'S').charAt(0)}
                              </span>
                              <div className="min-w-0">
                                <span className="font-bold text-slate-800 group-hover/stu:text-indigo-600 truncate block">
                                  {doc.studentName}
                                </span>
                                {doc.studentId && (
                                  <span className="text-[10px] font-mono text-slate-400 block truncate">
                                    ID: <strong className="text-slate-600">{doc.studentId}</strong>
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right shrink-0 ml-1">
                              <span className="text-[10px] font-bold text-slate-600 block">
                                {doc.studentClass || 'N/A'}
                              </span>
                              {doc.studentRoll && (
                                <span className="text-[10px] font-mono text-slate-400 block">
                                  Roll #{doc.studentRoll}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Extra Category Details & Tags */}
                        {isFee && doc.amount && (
                          <div className="mt-2 text-xs font-black text-emerald-600 flex items-center justify-between">
                            <span>Amount: ৳{doc.amount.toLocaleString()}</span>
                            {doc.transactionId && (
                              <button
                                onClick={() => {
                                  setSearchScope('id');
                                  setSearchQuery(doc.transactionId || '');
                                }}
                                className="font-mono text-[10px] text-slate-400 hover:text-emerald-700 truncate max-w-[120px]"
                                title="Filter by transaction reference"
                              >
                                {doc.transactionId}
                              </button>
                            )}
                          </div>
                        )}

                        {isCert && doc.certificateType && (
                          <div className="mt-2 flex items-center gap-1">
                            <span className="text-[10.5px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                              📜 {doc.certificateType}
                            </span>
                          </div>
                        )}

                        {/* Document tags snippet */}
                        {doc.tags && doc.tags.length > 0 && (
                          <div className="mt-2 flex items-center gap-1 overflow-hidden flex-wrap max-h-5">
                            {doc.tags.slice(0, 2).map((t, idx) => (
                              <button
                                key={idx}
                                onClick={() => {
                                  setSearchScope('all');
                                  setSearchQuery(t);
                                }}
                                className="text-[9.5px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-medium transition-colors"
                              >
                                #{t}
                              </button>
                            ))}
                            {doc.tags.length > 2 && (
                              <span className="text-[9px] text-slate-400">+{doc.tags.length - 2}</span>
                            )}
                          </div>
                        )}
                        {/* Mandatory Metadata Summary: Issuing Authority & Expiry */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10.5px]">
                          <div className="flex items-center gap-1 text-slate-600 truncate max-w-[160px]" title={`Issuing Authority: ${doc.issuingAuthority || 'Institution'}`}>
                            <Building2 size={11} className="text-slate-400 shrink-0" />
                            <span className="truncate font-medium">{doc.issuingAuthority || 'Registrar Office'}</span>
                          </div>
                          <div className={`font-mono text-[9.5px] px-1.5 py-0.5 rounded font-bold shrink-0 flex items-center gap-0.5 ${
                            doc.expiryDate === 'Permanent' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'
                          }`}>
                            <CalendarClock size={9} />
                            <span>{doc.expiryDate === 'Permanent' ? 'Permanent' : `Exp: ${doc.expiryDate}`}</span>
                          </div>
                        </div>
                      </div>

                      {/* Footer Info & Actions */}
                      <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                        <div className="flex items-center justify-between text-[10.5px] text-slate-400">
                          <span className="font-medium text-slate-500">{formatBytes(doc.fileSize)}</span>
                          <span className="font-mono">{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                        </div>

                        <div className="flex items-center justify-between gap-1 pt-1">
                          <button
                            onClick={() => setPreviewDoc(doc)}
                            className="flex-1 py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-colors"
                            title="Preview Document & Official Verification"
                          >
                            <Eye size={13} />
                            <span>Preview</span>
                          </button>

                          <button
                            onClick={() => handleDownload(doc)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                            title="Download Document"
                          >
                            <Download size={14} />
                          </button>

                          <button
                            onClick={() => {
                              setMovingDoc(doc);
                              setDestinationFolder(doc.folder);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                            title="Move to another folder"
                          >
                            <Folder size={14} />
                          </button>

                          <button
                            onClick={() => handleDeleteDoc(doc.id, doc.title)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Purge Document"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Table List View */
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 pl-4 pr-1 w-10 text-center">
                          <button
                            type="button"
                            onClick={handleToggleSelectAll}
                            className={`w-4 h-4 rounded flex items-center justify-center transition-all mx-auto ${
                              isAllSelected
                                ? 'bg-indigo-600 text-white'
                                : isPartiallySelected
                                ? 'bg-indigo-600 text-white'
                                : 'border border-slate-300 hover:border-indigo-400 bg-white'
                            }`}
                            title={isAllSelected ? 'Deselect all visible' : 'Select all visible'}
                          >
                            {isAllSelected && <Check size={12} strokeWidth={3} />}
                            {isPartiallySelected && <Minus size={12} strokeWidth={3} />}
                          </button>
                        </th>
                        <th className="py-3 px-3">Document / File</th>
                        <th className="py-3 px-3">Type & Category</th>
                        <th className="py-3 px-3">Issuing Authority & Expiry</th>
                        <th className="py-3 px-3">Student Dossier</th>
                        <th className="py-3 px-3">Folder Path</th>
                        <th className="py-3 px-3">Security</th>
                        <th className="py-3 px-3">Size & Date</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredDocuments.map(doc => {
                        const isSelected = selectedDocIds.includes(doc.id);
                        return (
                          <tr 
                            key={doc.id} 
                            className={`transition-colors ${
                              isSelected ? 'bg-indigo-50/50 hover:bg-indigo-50/80' : 'hover:bg-slate-50/70'
                            }`}
                          >
                            <td className="py-3 pl-4 pr-1 w-10 text-center">
                              <button
                                type="button"
                                onClick={(e) => handleToggleSelectDoc(doc.id, e)}
                                className={`w-4 h-4 rounded flex items-center justify-center transition-all mx-auto ${
                                  isSelected
                                    ? 'bg-indigo-600 text-white shadow-2xs'
                                    : 'border border-slate-300 hover:border-indigo-400 bg-white'
                                }`}
                                title={isSelected ? 'Deselect row' : 'Select row'}
                              >
                                {isSelected && <Check size={12} strokeWidth={3} />}
                              </button>
                            </td>
                            {/* Document / File Column */}
                            <td className="py-3 px-3">
                            <div className="flex items-center gap-2.5">
                              <div 
                                onClick={() => setPreviewDoc(doc)}
                                className="w-12 h-10 shrink-0 cursor-pointer"
                                title="Click to inspect document"
                              >
                                <DocumentThumbnail document={doc} size="sm" className="w-12 h-10" />
                              </div>
                              <div className="min-w-0 max-w-xs">
                                <div 
                                  onClick={() => setPreviewDoc(doc)}
                                  className="font-bold text-slate-800 hover:text-indigo-600 cursor-pointer truncate"
                                  title={doc.title}
                                >
                                  {doc.title}
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono truncate">
                                  <button
                                    onClick={() => {
                                      setSearchScope('id');
                                      setSearchQuery(doc.id);
                                    }}
                                    className="text-indigo-600 hover:underline font-bold"
                                    title="Filter by Document ID"
                                  >
                                    {doc.id}
                                  </button>
                                  <span>•</span>
                                  <span>{doc.fileName}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Type & Category Column */}
                          <td className="py-3 px-3">
                            <button
                              onClick={() => {
                                setSelectedCategory(doc.category);
                                setSelectedDocType('all');
                              }}
                              className="font-semibold text-slate-700 capitalize hover:text-indigo-600 block text-left"
                            >
                              {(doc.category || '').replace('-', ' ')}
                            </button>
                            {doc.certificateType && (
                              <span className="text-[10px] font-bold text-purple-700 block">
                                {doc.certificateType}
                              </span>
                            )}
                            {doc.amount && (
                              <div className="text-[10px] font-bold text-emerald-600">
                                ৳{doc.amount.toLocaleString()}
                              </div>
                            )}
                          </td>

                          {/* Issuing Authority & Expiry Column */}
                          <td className="py-3 px-3">
                            <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                              <Building2 size={11} className="text-slate-400 shrink-0" />
                              <span className="truncate max-w-[150px]" title={doc.issuingAuthority}>
                                {doc.issuingAuthority || 'Institution Registrar'}
                              </span>
                            </div>
                            <div className="text-[10px] mt-0.5 flex items-center gap-1 font-mono">
                              <CalendarClock size={10} className="text-slate-400 shrink-0" />
                              <span className={doc.expiryDate === 'Permanent' ? 'text-emerald-700 font-bold' : 'text-amber-800 font-semibold'}>
                                {doc.expiryDate === 'Permanent' ? 'Permanent' : `Exp: ${doc.expiryDate}`}
                              </span>
                            </div>
                          </td>

                          {/* Student Dossier Column */}
                          <td className="py-3 px-3">
                            {doc.studentName ? (
                              <div 
                                onClick={() => {
                                  if (doc.studentId) setSelectedStudent(doc.studentId);
                                  else setSearchQuery(doc.studentName || '');
                                }}
                                className="cursor-pointer group/stucol"
                                title="Click to filter by this student"
                              >
                                <span className="font-bold text-slate-800 group-hover/stucol:text-indigo-600 block">
                                  {doc.studentName}
                                </span>
                                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                                  {doc.studentId && (
                                    <span className="text-slate-600 font-bold">{doc.studentId}</span>
                                  )}
                                  {doc.studentClass && <span>({doc.studentClass})</span>}
                                  {doc.studentRoll && <span>#Roll {doc.studentRoll}</span>}
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Institutional</span>
                            )}
                          </td>

                          {/* Target Folder Column */}
                          <td className="py-3 px-3">
                            <button
                              onClick={() => {
                                setActiveFolder(doc.folder);
                                setSearchInAllFolders(false);
                              }}
                              className="text-[10px] font-mono bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 px-1.5 py-0.5 rounded transition-colors"
                              title="Navigate to this folder"
                            >
                              {doc.folder}
                            </button>
                          </td>

                          {/* Security Column */}
                          <td className="py-3 px-3">
                            <button
                              onClick={() => setSelectedSecurity(doc.securityLevel)}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                doc.securityLevel === 'Restricted' ? 'bg-rose-100 text-rose-800' :
                                doc.securityLevel === 'Confidential' ? 'bg-amber-100 text-amber-800' :
                                'bg-emerald-100 text-emerald-800'
                              }`}
                              title={`Filter security: ${doc.securityLevel}`}
                            >
                              {doc.securityLevel}
                            </button>
                          </td>

                          {/* Size & Date Column */}
                          <td className="py-3 px-3">
                            <span className="text-slate-700 font-medium">{formatBytes(doc.fileSize)}</span>
                            <span className="text-[10px] text-slate-400 block font-mono">
                              {new Date(doc.uploadedAt).toLocaleDateString()}
                            </span>
                          </td>

                          {/* Actions Column */}
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => setPreviewDoc(doc)}
                                className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50"
                                title="View Document"
                              >
                                <Eye size={15} />
                              </button>
                              <button
                                onClick={() => handleDownload(doc)}
                                className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-slate-100"
                                title="Download"
                              >
                                <Download size={15} />
                              </button>
                              <button
                                onClick={() => handleDeleteDoc(doc.id, doc.title)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                title="Purge"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal: Secure Upload Drawer / Modal */}
        {isUploadModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
            <div className="w-full max-w-3xl my-8">
              <SecureDocumentUpload
                initialFolder={activeFolder !== 'documents' ? activeFolder : 'documents/student-records'}
                initialCategory={
                  activeFolder.includes('medical') ? 'medical' :
                  activeFolder.includes('legal') ? 'legal' :
                  activeFolder.includes('academic-certificates') ? 'academic-certificates' :
                  activeFolder.includes('academic') ? 'academic' :
                  activeFolder.includes('fee-receipts') ? 'fee-receipts' :
                  activeFolder.includes('administrative') ? 'administrative' :
                  'student-records'
                }
                isModal={true}
                onCancel={() => setIsUploadModalOpen(false)}
                onUploadComplete={() => {
                  setIsUploadModalOpen(false);
                  setDocuments(getStoredDocuments());
                }}
              />
            </div>
          </div>
        )}

        {/* Modal: New Folder Creation */}
        {isNewFolderModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <FolderPlus size={18} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">Create New Vault Subfolder</h3>
                </div>
                <button
                  onClick={() => setIsNewFolderModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateNewFolder} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Parent Directory
                  </label>
                  <div className="text-xs font-mono bg-slate-100 text-slate-600 px-3 py-2 rounded-xl border border-slate-200">
                    {activeFolder}/
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Subfolder Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="e.g. 2024-admissions or scholarship-vouchers"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Description / Purpose (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={newFolderDesc}
                    onChange={(e) => setNewFolderDesc(e.target.value)}
                    placeholder="e.g. For keeping verified national ID documents"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNewFolderModalOpen(false)}
                    className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                  >
                    Create Subfolder
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Move Document */}
        {movingDoc && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Folder size={18} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">Move Document to Folder</h3>
                </div>
                <button onClick={() => setMovingDoc(null)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X size={18} />
                </button>
              </div>

              <div className="text-xs text-slate-600">
                Select target destination folder for: <strong className="text-slate-900">{movingDoc.title}</strong>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Destination Folder</label>
                <select
                  value={destinationFolder}
                  onChange={(e) => setDestinationFolder(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-medium"
                >
                  {folders.map(f => (
                    <option key={f.id} value={f.path}>
                      📁 {f.path} ({f.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMovingDoc(null)}
                  className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmMove}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  Move Document
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Interactive Document Viewer & File Preview */}
        {previewDoc && (
          <DocumentPreviewModal
            document={previewDoc}
            documentsList={filteredDocuments}
            onClose={() => setPreviewDoc(null)}
            onNavigate={(newDoc) => setPreviewDoc(newDoc)}
            onDownload={(docToDownload) => handleDownload(docToDownload)}
          />
        )}

        {/* Modal: Batch / Single Delete Confirmation Modal */}
        {isBulkDeleteModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
            <div className="bg-white rounded-3xl shadow-2xl border border-rose-200 w-full max-w-lg overflow-hidden my-8 animate-in zoom-in-95">
              {/* Red Header */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-600 to-rose-700 text-white flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shrink-0">
                    <Trash2 size={20} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold truncate">
                      {selectedDocIds.length === 1 ? 'Delete Document' : 'Batch Delete Documents'}
                    </h3>
                    <p className="text-xs text-rose-100 truncate">
                      {selectedDocIds.length === 1 
                        ? 'Permanently purge record from vault' 
                        : `Purge ${selectedDocIds.length} selected documents in batch`}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => !isDeletingBatch && setIsBulkDeleteModalOpen(false)}
                  disabled={isDeletingBatch}
                  className="p-1.5 rounded-xl text-rose-200 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-5 sm:p-6 space-y-4">
                {/* Warning Alert */}
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
                  <AlertTriangle className="text-rose-600 shrink-0 mt-0.5" size={18} />
                  <div className="text-xs text-rose-800">
                    <p className="font-bold">Irreversible Vault Purge Warning</p>
                    <p className="mt-0.5 text-rose-700 leading-relaxed">
                      This action will permanently purge {selectedDocIds.length === 1 ? 'the document' : `the selected ${selectedDocIds.length} documents`} and remove cryptographic SHA-256 fingerprint ledger entries. This action cannot be reversed.
                    </p>
                  </div>
                </div>

                {/* Selected Documents List Preview */}
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-2">
                    <span>Target Documents ({selectedDocIds.length}):</span>
                    <span className="font-mono text-slate-600">Total: {formatBytes(selectedTotalBytes)}</span>
                  </div>

                  <div className="max-h-52 overflow-y-auto space-y-1.5 border border-slate-200 rounded-2xl p-2.5 bg-slate-50/70 divide-y divide-slate-100">
                    {selectedDocuments.map(doc => (
                      <div key={doc.id} className="pt-1.5 first:pt-0 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded capitalize shrink-0 ${
                            doc.category === 'student-records' ? 'bg-indigo-100 text-indigo-700' :
                            doc.category === 'fee-receipts' ? 'bg-emerald-100 text-emerald-700' :
                            doc.category === 'academic-certificates' ? 'bg-purple-100 text-purple-700' :
                            'bg-slate-200 text-slate-700'
                          }`}>
                            {(doc.category || '').replace('-', ' ')}
                          </span>
                          <div className="min-w-0">
                            <span className="font-bold text-slate-800 truncate block">{doc.title}</span>
                            <span className="text-[10px] text-slate-400 font-mono truncate block">
                              {doc.id} • {doc.studentName || 'Institutional'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-slate-500 font-mono block">{formatBytes(doc.fileSize)}</span>
                          {selectedDocIds.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleToggleSelectDoc(doc.id)}
                              className="text-[10px] text-slate-400 hover:text-rose-600 font-medium"
                              title="Exclude from batch"
                            >
                              Exclude
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    disabled={isDeletingBatch}
                    onClick={() => setIsBulkDeleteModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    disabled={isDeletingBatch || selectedDocIds.length === 0}
                    onClick={handleConfirmBatchDelete}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isDeletingBatch ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Purging Vault Records...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 size={14} />
                        <span>Permanently Purge {selectedDocIds.length} {selectedDocIds.length === 1 ? 'Document' : 'Documents'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Batch Move Modal */}
        {isBulkMovingModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Folder size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Move Multiple Documents</h3>
                    <p className="text-[11px] text-slate-500">Relocate {selectedDocIds.length} selected documents</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsBulkMovingModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Destination Folder</label>
                <select
                  value={bulkDestinationFolder}
                  onChange={(e) => setBulkDestinationFolder(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-medium"
                >
                  {folders.map(f => (
                    <option key={f.id} value={f.path}>
                      📁 {f.path} ({f.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBulkMovingModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBatchMove}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  Move {selectedDocIds.length} Documents
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Floating Bulk Action Bar (fixed at bottom center when scrolled) */}
        {selectedDocIds.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[92%] sm:w-auto bg-slate-900/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center justify-between gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold font-mono text-xs shrink-0">
                {selectedDocIds.length}
              </span>
              <div className="text-xs font-semibold whitespace-nowrap">
                <span className="text-white font-bold">{selectedDocIds.length}</span>
                <span className="text-slate-300"> selected</span>
                <span className="text-slate-400 font-mono text-[11px] ml-1.5 hidden sm:inline">
                  ({formatBytes(selectedTotalBytes)})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => {
                  setBulkDestinationFolder(activeFolder);
                  setIsBulkMovingModalOpen(true);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1 border border-slate-700"
                title="Batch Move"
              >
                <Folder size={13} className="text-indigo-400" />
                <span className="hidden sm:inline">Move</span>
              </button>

              <button
                type="button"
                onClick={handleBatchDownload}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1 border border-slate-700"
                title="Batch Download"
              >
                <Download size={13} className="text-emerald-400" />
                <span className="hidden sm:inline">Download</span>
              </button>

              <button
                type="button"
                onClick={() => setIsBulkDeleteModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white flex items-center gap-1.5 shadow-md shadow-rose-900/30 active:scale-95 transition-all"
                title="Permanently Delete Selected"
              >
                <Trash2 size={13} />
                <span>Delete ({selectedDocIds.length})</span>
              </button>

              <button
                type="button"
                onClick={handleClearSelection}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                title="Deselect all"
              >
                <X size={15} />
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
