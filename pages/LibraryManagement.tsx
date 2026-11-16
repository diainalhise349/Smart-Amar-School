import React, { useState, useMemo } from 'react';
import { 
  Library, BookOpen, BookCopy, Plus, Search, Filter, Calendar, Clock, 
  AlertTriangle, CheckCircle2, DollarSign, Receipt, Download, Printer, 
  Edit, Trash2, QrCode, Users, Layers, Settings2, ArrowRight, RotateCcw, 
  FileText, Sparkles, ChevronRight, Info, ShieldCheck, Send, Smartphone,
  Bookmark, Check, X, ShieldAlert, FileSpreadsheet, Eye, RefreshCw
} from 'lucide-react';
import { DashboardLayout } from '../components/Layout';
import { Card, Button, Input, Badge, Modal, useToast } from '../components/UIComponents';
import { PDFExportModal } from '../components/PDFExportModal';
import { 
  exportBookCatalogToPDF, 
  exportLibraryBorrowRegisterToPDF, 
  exportLibraryOverdueReportToPDF 
} from '../utils/pdfExport';
import { UserRole, Book, BookBorrowRecord, LibraryRuleConfig } from '../types';
import { MOCK_STUDENTS, MOCK_BOOKS, MOCK_BORROW_RECORDS, MOCK_LIBRARY_CONFIG } from '../constants';

export const LibraryManagement: React.FC = () => {
  const { showToast } = useToast();

  // Primary State
  const [activeTab, setActiveTab] = useState<'catalog' | 'issue' | 'returns' | 'fines' | 'settings'>('catalog');
  const [books, setBooks] = useState<Book[]>(MOCK_BOOKS);
  const [borrowRecords, setBorrowRecords] = useState<BookBorrowRecord[]>(MOCK_BORROW_RECORDS);
  const [libraryConfig, setLibraryConfig] = useState<LibraryRuleConfig>(MOCK_LIBRARY_CONFIG);

  // Search & Filters - Catalog
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStockStatus, setSelectedStockStatus] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  // Search & Filters - Borrows / Returns
  const [borrowSearch, setBorrowSearch] = useState('');
  const [borrowStatusFilter, setBorrowStatusFilter] = useState<'All' | 'Issued' | 'Overdue' | 'Returned' | 'Lost'>('All');
  const [classFilter, setClassFilter] = useState('All');

  // Modals State
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [isEditBookModalOpen, setIsEditBookModalOpen] = useState(false);
  const [selectedBookForEdit, setSelectedBookForEdit] = useState<Book | null>(null);
  
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedBorrowForReturn, setSelectedBorrowForReturn] = useState<BookBorrowRecord | null>(null);
  const [returnCondition, setReturnCondition] = useState<'Good' | 'Fair' | 'Damaged' | 'Lost'>('Good');
  const [returnFinePaymentMethod, setReturnFinePaymentMethod] = useState<'Paid_Cash' | 'Paid_Digital' | 'Pending' | 'Waived'>('Paid_Cash');
  const [waiverReason, setWaiverReason] = useState('');

  const [isCollectFineModalOpen, setIsCollectFineModalOpen] = useState(false);
  const [selectedBorrowForFine, setSelectedBorrowForFine] = useState<BookBorrowRecord | null>(null);
  const [finePaymentMethod, setFinePaymentMethod] = useState<'Cash' | 'Digital' | 'Bank'>('Cash');

  const [isIssueReceiptOpen, setIsIssueReceiptOpen] = useState(false);
  const [latestIssuedRecord, setLatestIssuedRecord] = useState<BookBorrowRecord | null>(null);

  const [isReturnReceiptOpen, setIsReturnReceiptOpen] = useState(false);
  const [latestReturnedRecord, setLatestReturnedRecord] = useState<BookBorrowRecord | null>(null);

  // PDF Export Modal State
  const [isExportPDFOpen, setIsExportPDFOpen] = useState(false);
  const [exportType, setExportType] = useState<'catalog' | 'borrows' | 'overdue'>('catalog');

  // Issue Book Form State (Tab 2)
  const [issueStudentSearch, setIssueStudentSearch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [issueBookSearch, setIssueBookSearch] = useState('');
  const [selectedBookId, setSelectedBookId] = useState('');
  const [borrowDays, setBorrowDays] = useState(14);
  const [issueCondition, setIssueCondition] = useState<'New' | 'Good' | 'Fair'>('Good');
  const [issueNotes, setIssueNotes] = useState('');
  const [issuerStaff, setIssuerStaff] = useState('Mrs. Selina (Chief Librarian)');

  // New Book Form State
  const [newBook, setNewBook] = useState<Partial<Book>>({
    title: '',
    author: '',
    isbn: '',
    category: 'Science',
    publisher: '',
    edition: '1st Edition',
    shelfLocation: 'Rack A-01',
    totalCopies: 5,
    availableCopies: 5,
    condition: 'New',
    price: 350,
    callNumber: '',
    status: 'Available'
  });

  // Derived KPIs
  const totalTitles = books.length;
  const totalCopies = books.reduce((acc, b) => acc + (b.totalCopies || 0), 0);
  const availableCopies = books.reduce((acc, b) => acc + (b.availableCopies || 0), 0);
  const issuedCopies = totalCopies - availableCopies;

  const activeBorrows = borrowRecords.filter(r => r.status === 'Issued' || r.status === 'Overdue');
  const overdueBorrows = borrowRecords.filter(r => r.status === 'Overdue');
  const totalFinesPending = borrowRecords.reduce((acc, r) => acc + (r.fineStatus === 'Pending' ? r.calculatedFine : 0), 0);
  const totalFinesCollected = borrowRecords.reduce((acc, r) => acc + (r.finePaid || 0), 0);

  // Unique Categories
  const categories = useMemo(() => {
    const set = new Set(books.map(b => b.category));
    return ['All', ...Array.from(set)];
  }, [books]);

  // Filtered Catalog
  const filteredBooks = useMemo(() => {
    return books.filter(b => {
      const matchQuery = 
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.isbn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.shelfLocation && b.shelfLocation.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (b.callNumber && b.callNumber.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchCat = selectedCategory === 'All' || b.category === selectedCategory;
      const matchStock = 
        selectedStockStatus === 'All' ||
        (selectedStockStatus === 'Available' && b.availableCopies > 0) ||
        (selectedStockStatus === 'Low' && b.availableCopies > 0 && b.availableCopies <= 3) ||
        (selectedStockStatus === 'Out' && b.availableCopies === 0);

      return matchQuery && matchCat && matchStock;
    });
  }, [books, searchQuery, selectedCategory, selectedStockStatus]);

  // Filtered Borrows & Returns
  const filteredBorrows = useMemo(() => {
    return borrowRecords.filter(r => {
      const matchQuery = 
        r.studentName.toLowerCase().includes(borrowSearch.toLowerCase()) ||
        r.studentRoll.toLowerCase().includes(borrowSearch.toLowerCase()) ||
        r.bookTitle.toLowerCase().includes(borrowSearch.toLowerCase()) ||
        r.bookIsbn.toLowerCase().includes(borrowSearch.toLowerCase()) ||
        r.id.toLowerCase().includes(borrowSearch.toLowerCase());

      const matchStatus = borrowStatusFilter === 'All' || r.status === borrowStatusFilter;
      const matchClass = classFilter === 'All' || r.studentClass === classFilter;

      return matchQuery && matchStatus && matchClass;
    });
  }, [borrowRecords, borrowSearch, borrowStatusFilter, classFilter]);

  // Selected Student for Issue
  const selectedStudent = useMemo(() => {
    return MOCK_STUDENTS.find(s => s.id === selectedStudentId);
  }, [selectedStudentId]);

  // Student's active borrow count
  const studentActiveBorrows = useMemo(() => {
    if (!selectedStudentId) return [];
    return borrowRecords.filter(r => r.studentId === selectedStudentId && (r.status === 'Issued' || r.status === 'Overdue'));
  }, [selectedStudentId, borrowRecords]);

  // Selected Book for Issue
  const selectedBook = useMemo(() => {
    return books.find(b => b.id === selectedBookId);
  }, [selectedBookId, books]);

  // --- Actions ---

  // Handle Add Book
  const handleAddBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBook.title || !newBook.author || !newBook.isbn) {
      showToast('Please fill in Book Title, Author, and ISBN', 'error');
      return;
    }

    const bookId = `BK-${1000 + books.length + 1}`;
    const copies = Number(newBook.totalCopies) || 1;
    const created: Book = {
      id: bookId,
      title: newBook.title,
      author: newBook.author,
      isbn: newBook.isbn,
      category: newBook.category || 'General',
      publisher: newBook.publisher || 'Institutional Press',
      edition: newBook.edition || '1st Edition',
      shelfLocation: newBook.shelfLocation || 'Main Hall',
      totalCopies: copies,
      availableCopies: copies,
      condition: newBook.condition || 'New',
      price: Number(newBook.price) || 300,
      callNumber: newBook.callNumber || `${newBook.title.substring(0, 3).toUpperCase()}-01`,
      coverUrl: newBook.coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300',
      status: 'Available'
    };

    setBooks([created, ...books]);
    setIsAddBookModalOpen(false);
    setNewBook({
      title: '',
      author: '',
      isbn: '',
      category: 'Science',
      publisher: '',
      edition: '1st Edition',
      shelfLocation: 'Rack A-01',
      totalCopies: 5,
      availableCopies: 5,
      condition: 'New',
      price: 350,
      callNumber: '',
      status: 'Available'
    });
    showToast(`Book "${created.title}" added to catalog successfully!`, 'success');
  };

  // Handle Edit Book
  const handleUpdateBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookForEdit) return;

    setBooks(books.map(b => b.id === selectedBookForEdit.id ? selectedBookForEdit : b));
    setIsEditBookModalOpen(false);
    setSelectedBookForEdit(null);
    showToast(`Book details for "${selectedBookForEdit.title}" updated!`, 'success');
  };

  // Handle Delete Book
  const handleDeleteBook = (id: string, title: string) => {
    const hasActiveBorrow = borrowRecords.some(r => r.bookId === id && (r.status === 'Issued' || r.status === 'Overdue'));
    if (hasActiveBorrow) {
      showToast(`Cannot delete "${title}" while copies are currently issued to students.`, 'error');
      return;
    }
    if (window.confirm(`Are you sure you want to remove "${title}" from the library catalog?`)) {
      setBooks(books.filter(b => b.id !== id));
      showToast(`"${title}" removed from catalog.`, 'info');
    }
  };

  // Handle Issue Book
  const handleIssueBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      showToast('Please select a valid student borrower.', 'error');
      return;
    }
    if (!selectedBook) {
      showToast('Please select a book to issue.', 'error');
      return;
    }
    if (selectedBook.availableCopies <= 0) {
      showToast('Sorry, no copies of this book are currently available.', 'error');
      return;
    }
    if (studentActiveBorrows.length >= libraryConfig.maxBooksPerStudent) {
      showToast(`Student has reached maximum quota of ${libraryConfig.maxBooksPerStudent} borrowed books.`, 'warning');
      return;
    }

    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + Number(borrowDays));

    const borrowId = `BOR-2024-${String(borrowRecords.length + 1).padStart(3, '0')}`;
    const newRecord: BookBorrowRecord = {
      id: borrowId,
      bookId: selectedBook.id,
      bookTitle: selectedBook.title,
      bookIsbn: selectedBook.isbn,
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      studentRoll: selectedStudent.rollNo,
      studentClass: selectedStudent.class,
      studentSection: selectedStudent.section,
      borrowDate: today.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      status: 'Issued',
      issuedBy: issuerStaff,
      conditionAtIssue: issueCondition,
      daysOverdue: 0,
      calculatedFine: 0,
      finePaid: 0,
      fineStatus: 'None',
      notes: issueNotes
    };

    // Decrement available copies
    setBooks(books.map(b => {
      if (b.id === selectedBook.id) {
        const nextAvail = Math.max(0, b.availableCopies - 1);
        return {
          ...b,
          availableCopies: nextAvail,
          status: nextAvail === 0 ? 'Out of Stock' : (nextAvail <= 2 ? 'Low Stock' : 'Available')
        };
      }
      return b;
    }));

    setBorrowRecords([newRecord, ...borrowRecords]);
    setLatestIssuedRecord(newRecord);
    setIsIssueReceiptOpen(true);
    showToast(`Book successfully issued to ${selectedStudent.name}!`, 'success');

    // Reset Form
    setSelectedBookId('');
    setIssueBookSearch('');
    setIssueNotes('');
  };

  // Open Return Modal
  const handleOpenReturnModal = (record: BookBorrowRecord) => {
    setSelectedBorrowForReturn(record);
    setReturnCondition('Good');
    setReturnFinePaymentMethod('Paid_Cash');
    setWaiverReason('');
    setIsReturnModalOpen(true);
  };

  // Confirm Return Process
  const handleConfirmReturn = () => {
    if (!selectedBorrowForReturn) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const fineAmount = selectedBorrowForReturn.calculatedFine;
    let finePaid = 0;
    let fineStatus: 'None' | 'Pending' | 'Paid' | 'Waived' = 'None';

    if (fineAmount > 0) {
      if (returnFinePaymentMethod === 'Paid_Cash' || returnFinePaymentMethod === 'Paid_Digital') {
        finePaid = fineAmount;
        fineStatus = 'Paid';
      } else if (returnFinePaymentMethod === 'Waived') {
        finePaid = 0;
        fineStatus = 'Waived';
      } else {
        finePaid = 0;
        fineStatus = 'Pending';
      }
    }

    const updatedRecord: BookBorrowRecord = {
      ...selectedBorrowForReturn,
      returnDate: todayStr,
      status: returnCondition === 'Lost' ? 'Lost' : 'Returned',
      conditionAtReturn: returnCondition,
      finePaid,
      fineStatus,
      fineWaivedReason: returnFinePaymentMethod === 'Waived' ? waiverReason : undefined
    };

    // Update Borrow Records
    setBorrowRecords(borrowRecords.map(r => r.id === selectedBorrowForReturn.id ? updatedRecord : r));

    // Update Book stock (if not lost)
    if (returnCondition !== 'Lost') {
      setBooks(books.map(b => {
        if (b.id === selectedBorrowForReturn.bookId) {
          const nextAvail = Math.min(b.totalCopies, b.availableCopies + 1);
          return {
            ...b,
            availableCopies: nextAvail,
            status: nextAvail > 2 ? 'Available' : 'Low Stock'
          };
        }
        return b;
      }));
    }

    setIsReturnModalOpen(false);
    setLatestReturnedRecord(updatedRecord);
    setIsReturnReceiptOpen(true);
    showToast(`Book return for ${selectedBorrowForReturn.studentName} processed successfully!`, 'success');
  };

  // Quick Extend / Renew Borrow
  const handleExtendBorrow = (record: BookBorrowRecord) => {
    const currentDue = new Date(record.dueDate);
    currentDue.setDate(currentDue.getDate() + 7);
    const newDueDate = currentDue.toISOString().split('T')[0];

    setBorrowRecords(borrowRecords.map(r => {
      if (r.id === record.id) {
        return {
          ...r,
          dueDate: newDueDate,
          status: 'Issued',
          daysOverdue: 0,
          calculatedFine: 0,
          notes: `${r.notes ? r.notes + ' | ' : ''}Renewed for +7 days on ${new Date().toLocaleDateString()}`
        };
      }
      return r;
    }));

    showToast(`Due date extended by 7 days to ${newDueDate}`, 'success');
  };

  // Send SMS Reminder
  const handleSendReminderSMS = (record: BookBorrowRecord) => {
    showToast(`SMS Overdue Reminder queued for ${record.studentName}'s registered mobile number!`, 'info');
  };

  // Collect Fine Action
  const handleCollectFine = () => {
    if (!selectedBorrowForFine) return;
    setBorrowRecords(borrowRecords.map(r => {
      if (r.id === selectedBorrowForFine.id) {
        return {
          ...r,
          finePaid: r.calculatedFine,
          fineStatus: 'Paid',
          notes: `${r.notes ? r.notes + ' | ' : ''}Fine collected via ${finePaymentMethod} on ${new Date().toLocaleDateString()}`
        };
      }
      return r;
    }));
    setIsCollectFineModalOpen(false);
    showToast(`Late fee of $${selectedBorrowForFine.calculatedFine} collected for ${selectedBorrowForFine.studentName}`, 'success');
  };

  // Waive Fine Action
  const handleWaiveFine = (record: BookBorrowRecord) => {
    const reason = prompt(`Enter reason for waiving late fine of $${record.calculatedFine} for ${record.studentName}:`, 'Approved by Principal');
    if (reason !== null) {
      setBorrowRecords(borrowRecords.map(r => {
        if (r.id === record.id) {
          return {
            ...r,
            fineStatus: 'Waived',
            fineWaivedReason: reason,
            notes: `${r.notes ? r.notes + ' | ' : ''}Fine waived: ${reason}`
          };
        }
        return r;
      }));
      showToast(`Fine waived for ${record.studentName}`, 'info');
    }
  };

  return (
    <DashboardLayout role={UserRole.SCHOOL_ADMIN}>
      {/* Top Header Banner */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-indigo-600/10 text-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 border border-indigo-100 shadow-inner">
            <Library size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Library & Resource Center</h1>
              <Badge color="blue">Academic Session 2024-25</Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Accession catalog, circulation ledger, student borrow workflows, and automated late fee recovery.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            icon={Download}
            onClick={() => {
              setExportType('catalog');
              setIsExportPDFOpen(true);
            }}
            className="border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100"
          >
            Export PDF Register
          </Button>

          <Button
            variant="secondary"
            icon={RotateCcw}
            onClick={() => setActiveTab('issue')}
            className="bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            Issue Book
          </Button>

          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setIsAddBookModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200"
          >
            Add New Book
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border-slate-200/80 hover:border-indigo-200 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Book Titles & Copies</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-black text-slate-800">{totalTitles}</h3>
                <span className="text-xs text-slate-500 font-medium">({totalCopies} total copies)</span>
              </div>
              <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <CheckCircle2 size={12} /> {availableCopies} copies in shelf
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <BookOpen size={24} />
            </div>
          </div>
        </Card>

        <Card className="border-slate-200/80 hover:border-indigo-200 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Circulating / Issued</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-black text-indigo-600">{activeBorrows.length}</h3>
                <span className="text-xs text-slate-500 font-medium">active borrows</span>
              </div>
              <p className="text-xs text-indigo-500 font-semibold mt-1">
                {issuedCopies} copies checked out
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <BookCopy size={24} />
            </div>
          </div>
        </Card>

        <Card className="border-slate-200/80 hover:border-rose-200 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overdue Items</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-black text-rose-600">{overdueBorrows.length}</h3>
                <span className="text-xs text-rose-500 font-medium">defaulters</span>
              </div>
              <p className="text-xs text-rose-600 font-semibold mt-1 flex items-center gap-1">
                <AlertTriangle size={12} /> Needs follow-up
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
              <Clock size={24} />
            </div>
          </div>
        </Card>

        <Card className="border-slate-200/80 hover:border-emerald-200 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Late Fine Status</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-black text-slate-800">${totalFinesPending}</h3>
                <span className="text-xs text-amber-600 font-bold">due</span>
              </div>
              <p className="text-xs text-emerald-600 font-semibold mt-1">
                ${totalFinesCollected} collected this term
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <DollarSign size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Module Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 mb-6 bg-white px-4 pt-3 rounded-t-xl shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'catalog'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-t-lg'
          }`}
        >
          <BookOpen size={17} />
          Book Catalog ({books.length})
        </button>

        <button
          onClick={() => setActiveTab('issue')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'issue'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-t-lg'
          }`}
        >
          <Plus size={17} />
          Issue Book Workflow
        </button>

        <button
          onClick={() => setActiveTab('returns')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'returns'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-t-lg'
          }`}
        >
          <RotateCcw size={17} />
          Active Borrows & Returns ({activeBorrows.length})
        </button>

        <button
          onClick={() => setActiveTab('fines')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'fines'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-t-lg'
          }`}
        >
          <DollarSign size={17} />
          Late Fees & Fines ({overdueBorrows.length > 0 && <span className="px-1.5 py-0.5 text-xs bg-rose-100 text-rose-700 rounded-full font-bold">{overdueBorrows.length}</span>})
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'settings'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/40 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-t-lg'
          }`}
        >
          <Settings2 size={17} />
          Library Rules & Fine Rates
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: BOOK CATALOG & INVENTORY */}
      {/* ========================================================================= */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1 flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full sm:w-72">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search title, author, ISBN, shelf..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
                  ))}
                </select>

                <select
                  value={selectedStockStatus}
                  onChange={(e) => setSelectedStockStatus(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="All">All Stock Levels</option>
                  <option value="Available">In Stock (&gt;0)</option>
                  <option value="Low">Low Stock (≤3)</option>
                  <option value="Out">Out of Stock (0)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 justify-between sm:justify-end">
              <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                    viewMode === 'table' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Table
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                    viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Card Grid
                </button>
              </div>

              <Button
                variant="outline"
                size="sm"
                icon={Download}
                onClick={() => exportBookCatalogToPDF(filteredBooks)}
                className="border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Catalog PDF
              </Button>
            </div>
          </div>

          {/* Catalog Views */}
          {filteredBooks.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
              <BookOpen size={48} className="mx-auto text-slate-300 mb-3" />
              <h3 className="text-lg font-bold text-slate-700">No books found</h3>
              <p className="text-sm text-slate-500 mt-1">Try adjusting your search criteria or add new titles to the catalog.</p>
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={() => setIsAddBookModalOpen(true)}
                className="mt-4"
              >
                Add New Book
              </Button>
            </div>
          ) : viewMode === 'table' ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-5 py-3.5">Book Details</th>
                      <th className="px-4 py-3.5">Category & Call No</th>
                      <th className="px-4 py-3.5">ISBN & Edition</th>
                      <th className="px-4 py-3.5">Shelf Location</th>
                      <th className="px-4 py-3.5 text-center">Copies (Avail / Total)</th>
                      <th className="px-4 py-3.5 text-right">Price</th>
                      <th className="px-4 py-3.5 text-center">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBooks.map((book) => (
                      <tr key={book.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-14 bg-indigo-50 border border-slate-200 rounded overflow-hidden flex-shrink-0 shadow-xs flex items-center justify-center">
                              {book.coverUrl ? (
                                <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                              ) : (
                                <BookOpen size={16} className="text-indigo-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 leading-snug">{book.title}</p>
                              <p className="text-xs text-slate-500 mt-0.5">by <span className="font-medium text-slate-700">{book.author}</span></p>
                              <span className="inline-block mt-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                                {book.id}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-semibold">
                            {book.category}
                          </span>
                          {book.callNumber && (
                            <p className="text-[11px] font-mono text-slate-500 mt-1">{book.callNumber}</p>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <p className="text-xs font-mono text-slate-700">{book.isbn}</p>
                          <p className="text-[11px] text-slate-500">{book.edition || 'Standard'}</p>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                            <Layers size={14} className="text-slate-400" />
                            {book.shelfLocation || 'Main Hall'}
                          </div>
                        </td>

                        <td className="px-4 py-4 text-center">
                          <div className="inline-flex items-center gap-1">
                            <span className={`text-sm font-black ${book.availableCopies > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {book.availableCopies}
                            </span>
                            <span className="text-xs text-slate-400">/</span>
                            <span className="text-xs font-bold text-slate-600">{book.totalCopies}</span>
                          </div>
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full mx-auto mt-1 overflow-hidden">
                            <div 
                              className={`h-full ${book.availableCopies === 0 ? 'bg-rose-500' : (book.availableCopies <= 2 ? 'bg-amber-500' : 'bg-emerald-500')}`}
                              style={{ width: `${(book.availableCopies / (book.totalCopies || 1)) * 100}%` }}
                            />
                          </div>
                        </td>

                        <td className="px-4 py-4 text-right font-bold text-slate-800">
                          ${book.price || 0}
                        </td>

                        <td className="px-4 py-4 text-center">
                          {book.availableCopies === 0 ? (
                            <Badge color="red">Out of Stock</Badge>
                          ) : book.availableCopies <= 2 ? (
                            <Badge color="yellow">Low Stock</Badge>
                          ) : (
                            <Badge color="green">Available</Badge>
                          )}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setSelectedBookId(book.id);
                                setActiveTab('issue');
                              }}
                              disabled={book.availableCopies === 0}
                              title="Quick Issue to Student"
                              className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                              <RotateCcw size={16} />
                            </button>

                            <button
                              onClick={() => {
                                setSelectedBookForEdit(book);
                                setIsEditBookModalOpen(true);
                              }}
                              title="Edit Book"
                              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <Edit size={16} />
                            </button>

                            <button
                              onClick={() => handleDeleteBook(book.id, book.title)}
                              title="Delete Book"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Card Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredBooks.map((book) => (
                <div 
                  key={book.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all flex flex-col justify-between overflow-hidden group"
                >
                  <div className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-16 h-22 bg-indigo-50 border border-slate-200 rounded-lg overflow-hidden flex-shrink-0 shadow-xs flex items-center justify-center">
                        {book.coverUrl ? (
                          <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <BookOpen size={24} className="text-indigo-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                          {book.category}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm mt-1 leading-snug line-clamp-2">{book.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">{book.author}</p>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 pt-3 border-t border-slate-100">
                      <div className="flex justify-between">
                        <span className="text-slate-400">ISBN:</span>
                        <span className="font-mono text-slate-700 truncate max-w-[140px]">{book.isbn}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Location:</span>
                        <span className="font-medium text-slate-800">{book.shelfLocation || 'Main Hall'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Availability:</span>
                        <span className={`font-black ${book.availableCopies > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {book.availableCopies} / {book.totalCopies} copies
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-sm">${book.price || 0}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedBookForEdit(book);
                          setIsEditBookModalOpen(true);
                        }}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-md transition-colors"
                      >
                        <Edit size={14} />
                      </button>
                      <Button
                        size="sm"
                        variant={book.availableCopies > 0 ? 'primary' : 'secondary'}
                        disabled={book.availableCopies === 0}
                        onClick={() => {
                          setSelectedBookId(book.id);
                          setActiveTab('issue');
                        }}
                        className="text-xs h-7 px-2.5"
                      >
                        Issue
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ISSUE / BORROW BOOK WORKFLOW */}
      {/* ========================================================================= */}
      {activeTab === 'issue' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Issue Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card title="Student Book Issue Counter" description="Select student borrower, specify material title, and issue with official circulation receipt.">
              <form onSubmit={handleIssueBook} className="space-y-5">
                {/* 1. Student Selection */}
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                    Step 1: Select Student Borrower *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search student by Name or Roll..."
                        value={issueStudentSearch}
                        onChange={(e) => setIssueStudentSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <select
                      value={selectedStudentId}
                      onChange={(e) => setSelectedStudentId(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">-- Choose Enrolled Student --</option>
                      {MOCK_STUDENTS
                        .filter(s => 
                          s.name.toLowerCase().includes(issueStudentSearch.toLowerCase()) || 
                          s.rollNo.includes(issueStudentSearch) || 
                          s.class.toLowerCase().includes(issueStudentSearch.toLowerCase())
                        )
                        .map(s => (
                          <option key={s.id} value={s.id}>
                            Roll #{s.rollNo} • {s.name} ({s.class} - {s.section})
                          </option>
                        ))
                      }
                    </select>
                  </div>

                  {/* Selected Student Information Chip */}
                  {selectedStudent && (
                    <div className="mt-3 p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-black flex items-center justify-center text-sm shadow-xs">
                          {(selectedStudent?.name || 'S').charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{selectedStudent.name}</p>
                          <p className="text-xs text-slate-500">
                            Class {selectedStudent.class} ({selectedStudent.section}) • Roll #{selectedStudent.rollNo} • ID: {selectedStudent.id}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                          studentActiveBorrows.length >= libraryConfig.maxBooksPerStudent 
                            ? 'bg-rose-100 text-rose-700' 
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {studentActiveBorrows.length} / {libraryConfig.maxBooksPerStudent} Active Borrows
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Book Selection */}
                <div className="pt-4 border-t border-slate-100">
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                    Step 2: Select Book to Issue *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search catalog by Title / ISBN..."
                        value={issueBookSearch}
                        onChange={(e) => setIssueBookSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <select
                      value={selectedBookId}
                      onChange={(e) => setSelectedBookId(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">-- Choose Accessioned Book --</option>
                      {books
                        .filter(b => 
                          b.title.toLowerCase().includes(issueBookSearch.toLowerCase()) || 
                          b.isbn.includes(issueBookSearch) || 
                          b.author.toLowerCase().includes(issueBookSearch.toLowerCase())
                        )
                        .map(b => (
                          <option key={b.id} value={b.id} disabled={b.availableCopies <= 0}>
                            {b.title} ({b.availableCopies > 0 ? `${b.availableCopies} Avail` : 'Out of Stock'}) • {b.category}
                          </option>
                        ))
                      }
                    </select>
                  </div>

                  {/* Selected Book Details preview */}
                  {selectedBook && (
                    <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-12 bg-indigo-100 rounded border border-slate-300 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {selectedBook.coverUrl ? (
                            <img src={selectedBook.coverUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <BookOpen size={16} className="text-indigo-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{selectedBook.title}</p>
                          <p className="text-xs text-slate-500">by {selectedBook.author} • Location: <span className="font-semibold text-slate-700">{selectedBook.shelfLocation}</span></p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 text-xs font-bold rounded ${selectedBook.availableCopies > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {selectedBook.availableCopies} Copies Available
                        </span>
                        <p className="text-[11px] font-mono text-slate-500 mt-1">{selectedBook.isbn}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Borrow Duration & Condition */}
                <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Borrow Duration</label>
                    <select
                      value={borrowDays}
                      onChange={(e) => setBorrowDays(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value={7}>7 Days (1 Week)</option>
                      <option value={14}>14 Days (2 Weeks - Standard)</option>
                      <option value={21}>21 Days (3 Weeks)</option>
                      <option value={30}>30 Days (1 Month)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Book Condition</label>
                    <select
                      value={issueCondition}
                      onChange={(e) => setIssueCondition(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="New">New / Mint</option>
                      <option value="Good">Good (Standard)</option>
                      <option value="Fair">Fair / Minor Wear</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Issuer / Officer</label>
                    <input
                      type="text"
                      value={issuerStaff}
                      onChange={(e) => setIssuerStaff(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Remarks & Notes */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Issue Remarks / Special Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Reference assignment work, approved for exam preparation..."
                    value={issueNotes}
                    onChange={(e) => setIssueNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setSelectedStudentId('');
                      setSelectedBookId('');
                      setIssueNotes('');
                    }}
                  >
                    Clear Form
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    icon={CheckCircle2}
                    disabled={!selectedStudent || !selectedBook || selectedBook.availableCopies <= 0 || studentActiveBorrows.length >= libraryConfig.maxBooksPerStudent}
                    className="bg-indigo-600 hover:bg-indigo-700 px-6"
                  >
                    Confirm Issue & Print Receipt
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Quick Info & Active Borrow Summary for Student */}
          <div className="space-y-6">
            <Card title="Borrowing Regulations & Quota" description="Institutional policy guidelines">
              <div className="space-y-3.5 text-xs text-slate-600">
                <div className="flex items-start gap-2.5">
                  <Clock size={16} className="text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-800">Standard Duration</p>
                    <p className="text-slate-500">Books can be issued for up to {libraryConfig.maxBorrowDays} days with 1 extension allowed.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <BookOpen size={16} className="text-indigo-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-800">Maximum Book Limit</p>
                    <p className="text-slate-500">Each student may have at most {libraryConfig.maxBooksPerStudent} active books simultaneously.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <DollarSign size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-800">Overdue Late Fee</p>
                    <p className="text-slate-500">${libraryConfig.dailyFineAmount} per calendar day after grace period of {libraryConfig.gracePeriodDays} day.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <ShieldCheck size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-800">Care of Materials</p>
                    <p className="text-slate-500">Damaged or lost books incur replacement cost at {libraryConfig.lostBookMultiplier}x list price.</p>
                  </div>
                </div>
              </div>
            </Card>

            {selectedStudent && (
              <Card title={`Active Borrows for ${selectedStudent.name}`} description={`Current active items: ${studentActiveBorrows.length}`}>
                {studentActiveBorrows.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No currently active or overdue books for this student.</p>
                ) : (
                  <div className="space-y-2.5">
                    {studentActiveBorrows.map(record => (
                      <div key={record.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                        <div className="flex justify-between items-start">
                          <p className="font-bold text-slate-800">{record.bookTitle}</p>
                          <Badge color={record.status === 'Overdue' ? 'red' : 'blue'}>{record.status}</Badge>
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                          <span>Due: {record.dueDate}</span>
                          {record.status === 'Overdue' && (
                            <span className="font-bold text-rose-600">Late: {record.daysOverdue} days</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ACTIVE BORROWS & RETURN TRACKING */}
      {/* ========================================================================= */}
      {activeTab === 'returns' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1 flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full sm:w-80">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student, roll, book title, ISBN..."
                  value={borrowSearch}
                  onChange={(e) => setBorrowSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={borrowStatusFilter}
                  onChange={(e) => setBorrowStatusFilter(e.target.value as any)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="All">All Circulation Records</option>
                  <option value="Issued">Active Issued</option>
                  <option value="Overdue">Overdue Items Only</option>
                  <option value="Returned">Returned Materials</option>
                </select>

                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="All">All Classes</option>
                  <option value="Class 10">Class 10</option>
                  <option value="Class 9">Class 9</option>
                  <option value="Class 8">Class 8</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={Download}
                onClick={() => exportLibraryBorrowRegisterToPDF(filteredBorrows)}
                className="border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Export Circulation PDF
              </Button>
            </div>
          </div>

          {/* Circulation Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Circulation ID</th>
                    <th className="px-4 py-3.5">Student / Borrower</th>
                    <th className="px-4 py-3.5">Book Title & ISBN</th>
                    <th className="px-4 py-3.5">Borrow Date</th>
                    <th className="px-4 py-3.5">Due Date</th>
                    <th className="px-4 py-3.5 text-center">Status / Delay</th>
                    <th className="px-4 py-3.5 text-right">Fine</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBorrows.map((record) => (
                    <tr 
                      key={record.id} 
                      className={`hover:bg-slate-50/80 transition-colors ${record.status === 'Overdue' ? 'bg-rose-50/20' : ''}`}
                    >
                      <td className="px-5 py-4 font-mono text-xs font-bold text-indigo-700">
                        {record.id}
                      </td>

                      <td className="px-4 py-4">
                        <p className="font-bold text-slate-900 leading-snug">{record.studentName}</p>
                        <p className="text-xs text-slate-500">
                          {record.studentClass} ({record.studentSection}) • Roll #{record.studentRoll}
                        </p>
                      </td>

                      <td className="px-4 py-4 max-w-xs">
                        <p className="font-semibold text-slate-900 truncate">{record.bookTitle}</p>
                        <p className="text-xs font-mono text-slate-400">{record.bookIsbn}</p>
                      </td>

                      <td className="px-4 py-4 text-xs font-medium text-slate-700">
                        {record.borrowDate}
                      </td>

                      <td className="px-4 py-4">
                        <p className={`text-xs font-bold ${record.status === 'Overdue' ? 'text-rose-600' : 'text-slate-800'}`}>
                          {record.dueDate}
                        </p>
                        {record.returnDate && (
                          <p className="text-[10px] text-emerald-600">Returned: {record.returnDate}</p>
                        )}
                      </td>

                      <td className="px-4 py-4 text-center">
                        {record.status === 'Overdue' ? (
                          <div className="inline-flex flex-col items-center">
                            <Badge color="red">Overdue</Badge>
                            <span className="text-[11px] font-bold text-rose-600 mt-0.5">
                              {record.daysOverdue} days late
                            </span>
                          </div>
                        ) : record.status === 'Issued' ? (
                          <Badge color="blue">Active Issued</Badge>
                        ) : record.status === 'Returned' ? (
                          <Badge color="green">Returned</Badge>
                        ) : (
                          <Badge color="yellow">{record.status}</Badge>
                        )}
                      </td>

                      <td className="px-4 py-4 text-right">
                        {record.calculatedFine > 0 ? (
                          <div>
                            <p className="font-bold text-rose-600 text-sm">${record.calculatedFine}</p>
                            <span className={`text-[10px] font-bold ${
                              record.fineStatus === 'Paid' ? 'text-emerald-600' : 
                              record.fineStatus === 'Waived' ? 'text-blue-600' : 'text-amber-600'
                            }`}>
                              {record.fineStatus}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">$0</span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {record.status !== 'Returned' && (
                            <>
                              <Button
                                size="sm"
                                variant="primary"
                                icon={RotateCcw}
                                onClick={() => handleOpenReturnModal(record)}
                                className="text-xs h-8 px-3 bg-emerald-600 hover:bg-emerald-700"
                              >
                                Return
                              </Button>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleExtendBorrow(record)}
                                title="Extend Due Date by 7 Days"
                                className="text-xs h-8 px-2 border-slate-200 text-slate-700"
                              >
                                +7d
                              </Button>
                            </>
                          )}

                          {record.status === 'Overdue' && (
                            <button
                              onClick={() => handleSendReminderSMS(record)}
                              title="Send SMS Notice"
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Send size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: LATE FEES & FINES LEDGER */}
      {/* ========================================================================= */}
      {activeTab === 'fines' && (
        <div className="space-y-6">
          {/* Overdue Alert Bar */}
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-600 text-white flex items-center justify-center flex-shrink-0">
                <ShieldAlert size={22} />
              </div>
              <div>
                <h4 className="font-bold text-rose-900 text-sm">Overdue Library Accounts & Recovery</h4>
                <p className="text-xs text-rose-700 mt-0.5">
                  Currently {overdueBorrows.length} students have overdue items totaling ${totalFinesPending} in assessed fines.
                </p>
              </div>
            </div>

            <Button
              variant="danger"
              size="sm"
              icon={Download}
              onClick={() => exportLibraryOverdueReportToPDF(overdueBorrows)}
              className="bg-rose-600 hover:bg-rose-700"
            >
              Export Overdue Notice PDF
            </Button>
          </div>

          {/* Fines Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Receipt size={18} className="text-indigo-600" />
                Fine Collection Ledger
              </h3>
              <Badge color="gray">{borrowRecords.filter(r => r.calculatedFine > 0).length} Total Fine Records</Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-black text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Student Borrower</th>
                    <th className="px-4 py-3.5">Book Title</th>
                    <th className="px-4 py-3.5">Due Date</th>
                    <th className="px-4 py-3.5 text-center">Days Overdue</th>
                    <th className="px-4 py-3.5 text-right">Assessed Fine</th>
                    <th className="px-4 py-3.5 text-center">Fine Status</th>
                    <th className="px-4 py-3.5 text-center">Circulation State</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {borrowRecords
                    .filter(r => r.calculatedFine > 0 || r.status === 'Overdue')
                    .map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-900">{record.studentName}</p>
                          <p className="text-xs text-slate-500">Roll #{record.studentRoll} • {record.studentClass}</p>
                        </td>

                        <td className="px-4 py-4 max-w-xs truncate font-medium text-slate-800">
                          {record.bookTitle}
                        </td>

                        <td className="px-4 py-4 text-xs font-mono text-slate-700">
                          {record.dueDate}
                        </td>

                        <td className="px-4 py-4 text-center font-bold text-rose-600 text-xs">
                          {record.daysOverdue} Days
                        </td>

                        <td className="px-4 py-4 text-right font-black text-slate-900">
                          ${record.calculatedFine}
                        </td>

                        <td className="px-4 py-4 text-center">
                          {record.fineStatus === 'Paid' ? (
                            <Badge color="green">Paid (${record.finePaid})</Badge>
                          ) : record.fineStatus === 'Waived' ? (
                            <Badge color="blue">Waived</Badge>
                          ) : (
                            <Badge color="red">Pending Collection</Badge>
                          )}
                        </td>

                        <td className="px-4 py-4 text-center">
                          <span className="text-xs font-semibold text-slate-600">
                            {record.status}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {record.fineStatus === 'Pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="primary"
                                  icon={DollarSign}
                                  onClick={() => {
                                    setSelectedBorrowForFine(record);
                                    setIsCollectFineModalOpen(true);
                                  }}
                                  className="text-xs h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700"
                                >
                                  Collect
                                </Button>

                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleWaiveFine(record)}
                                  className="text-xs h-7 px-2 text-slate-500 hover:text-slate-800"
                                >
                                  Waive
                                </Button>
                              </>
                            )}

                            <button
                              onClick={() => handleSendReminderSMS(record)}
                              title="Send Reminder SMS"
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            >
                              <Smartphone size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: LIBRARY RULES & FINE CONFIGURATION */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && (
        <div className="max-w-4xl space-y-6">
          <Card 
            title="Library Policy & Circulation Parameters" 
            description="Configure automated fine calculation rates, borrowing durations, student limits, and lost material penalties."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Daily Overdue Fine Rate ($ per day)
                  </label>
                  <div className="relative">
                    <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      min={0}
                      value={libraryConfig.dailyFineAmount}
                      onChange={(e) => setLibraryConfig({ ...libraryConfig, dailyFineAmount: Number(e.target.value) })}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Charged for every overdue day following the grace period.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Maximum Borrow Duration (Days)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={libraryConfig.maxBorrowDays}
                    onChange={(e) => setLibraryConfig({ ...libraryConfig, maxBorrowDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Default circulation period assigned on book issue.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Max Books per Student Limit
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={libraryConfig.maxBooksPerStudent}
                    onChange={(e) => setLibraryConfig({ ...libraryConfig, maxBooksPerStudent: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Prevents hoarding and ensures fair material access.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Grace Period Before Fine (Days)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={libraryConfig.gracePeriodDays}
                    onChange={(e) => setLibraryConfig({ ...libraryConfig, gracePeriodDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Extra days permitted without incurring immediate penalty.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Lost Book Replacement Multiplier (x list price)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min={1}
                    value={libraryConfig.lostBookMultiplier}
                    onChange={(e) => setLibraryConfig({ ...libraryConfig, lostBookMultiplier: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Accounts for processing, binding, and re-cataloging costs.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Flat Damage Assessment Fee ($)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={libraryConfig.damageFineFlat}
                    onChange={(e) => setLibraryConfig({ ...libraryConfig, damageFineFlat: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Applied when returned material has page damage or binding tear.</p>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">Settings are persisted to school administration configuration.</span>
              <Button
                variant="primary"
                icon={CheckCircle2}
                onClick={() => showToast('Library circulation rules and fine rates saved!', 'success')}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Save Policy Settings
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD NEW BOOK TO CATALOG */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isAddBookModalOpen}
        onClose={() => setIsAddBookModalOpen(false)}
        title="Add New Book to Library Catalog"
      >
        <form onSubmit={handleAddBook} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Book Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Higher Secondary Physics"
              value={newBook.title}
              onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Author Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. H.C. Verma"
                value={newBook.author}
                onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ISBN Number *</label>
              <input
                type="text"
                required
                placeholder="978-81-7709-187-8"
                value={newBook.isbn}
                onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category / Genre</label>
              <select
                value={newBook.category}
                onChange={(e) => setNewBook({ ...newBook, category: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Science">Science & Technology</option>
                <option value="Literature">Literature & Fiction</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Social Studies">Social Studies & History</option>
                <option value="Computer Science">Computer Science & IT</option>
                <option value="Reference">Reference & Encyclopedia</option>
                <option value="Islamic Studies">Islamic Studies</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Shelf / Rack Location</label>
              <input
                type="text"
                placeholder="Rack S-01 (Shelf A)"
                value={newBook.shelfLocation}
                onChange={(e) => setNewBook({ ...newBook, shelfLocation: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Total Copies</label>
              <input
                type="number"
                min={1}
                value={newBook.totalCopies}
                onChange={(e) => setNewBook({ ...newBook, totalCopies: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Price ($)</label>
              <input
                type="number"
                min={0}
                value={newBook.price}
                onChange={(e) => setNewBook({ ...newBook, price: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Condition</label>
              <select
                value={newBook.condition}
                onChange={(e) => setNewBook({ ...newBook, condition: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="New">New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setIsAddBookModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" icon={Plus}>
              Save Book to Catalog
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: EDIT BOOK MODAL */}
      {/* ========================================================================= */}
      {selectedBookForEdit && (
        <Modal
          isOpen={isEditBookModalOpen}
          onClose={() => setIsEditBookModalOpen(false)}
          title={`Edit Book: ${selectedBookForEdit.title}`}
        >
          <form onSubmit={handleUpdateBook} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Book Title</label>
              <input
                type="text"
                required
                value={selectedBookForEdit.title}
                onChange={(e) => setSelectedBookForEdit({ ...selectedBookForEdit, title: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Author</label>
                <input
                  type="text"
                  required
                  value={selectedBookForEdit.author}
                  onChange={(e) => setSelectedBookForEdit({ ...selectedBookForEdit, author: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Shelf Location</label>
                <input
                  type="text"
                  value={selectedBookForEdit.shelfLocation || ''}
                  onChange={(e) => setSelectedBookForEdit({ ...selectedBookForEdit, shelfLocation: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Total Copies</label>
                <input
                  type="number"
                  min={selectedBookForEdit.totalCopies - selectedBookForEdit.availableCopies}
                  value={selectedBookForEdit.totalCopies}
                  onChange={(e) => {
                    const newTotal = Number(e.target.value);
                    const diff = newTotal - selectedBookForEdit.totalCopies;
                    setSelectedBookForEdit({
                      ...selectedBookForEdit,
                      totalCopies: newTotal,
                      availableCopies: Math.max(0, selectedBookForEdit.availableCopies + diff)
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Available Copies</label>
                <input
                  type="number"
                  max={selectedBookForEdit.totalCopies}
                  value={selectedBookForEdit.availableCopies}
                  onChange={(e) => setSelectedBookForEdit({ ...selectedBookForEdit, availableCopies: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Price ($)</label>
                <input
                  type="number"
                  value={selectedBookForEdit.price || 0}
                  onChange={(e) => setSelectedBookForEdit({ ...selectedBookForEdit, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsEditBookModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" icon={CheckCircle2}>
                Update Book Information
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: PROCESS BOOK RETURN */}
      {/* ========================================================================= */}
      {selectedBorrowForReturn && (
        <Modal
          isOpen={isReturnModalOpen}
          onClose={() => setIsReturnModalOpen(false)}
          title="Process Book Return & Inspection"
        >
          <div className="space-y-4">
            {/* Record Overview */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Student Borrower:</span>
                <span className="font-bold text-slate-900">{selectedBorrowForReturn.studentName} ({selectedBorrowForReturn.studentRoll})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Book Title:</span>
                <span className="font-semibold text-indigo-700">{selectedBorrowForReturn.bookTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Issue & Due Date:</span>
                <span className="font-medium text-slate-700">{selectedBorrowForReturn.borrowDate} → {selectedBorrowForReturn.dueDate}</span>
              </div>
              {selectedBorrowForReturn.daysOverdue > 0 && (
                <div className="flex justify-between pt-1 border-t border-slate-200 text-rose-600 font-bold">
                  <span>Overdue Delay:</span>
                  <span>{selectedBorrowForReturn.daysOverdue} Days Late</span>
                </div>
              )}
            </div>

            {/* Condition on Return */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Condition at Return Inspection</label>
              <select
                value={returnCondition}
                onChange={(e) => setReturnCondition(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Good">Good / Undamaged</option>
                <option value="Fair">Fair / Acceptable Wear</option>
                <option value="Damaged">Damaged / Torn Pages (+Fine)</option>
                <option value="Lost">Lost by Student (Full Replacement)</option>
              </select>
            </div>

            {/* Fine Assessment if Overdue or Damaged */}
            {selectedBorrowForReturn.calculatedFine > 0 && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign size={18} className="text-amber-600" />
                    <span className="text-xs font-bold text-amber-900">Assessed Late Fine:</span>
                  </div>
                  <span className="text-lg font-black text-amber-900">${selectedBorrowForReturn.calculatedFine}</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-amber-900 mb-1">Payment Action:</label>
                  <select
                    value={returnFinePaymentMethod}
                    onChange={(e) => setReturnFinePaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-semibold text-slate-800 outline-none"
                  >
                    <option value="Paid_Cash">Collect Fine Now (Cash Counter)</option>
                    <option value="Paid_Digital">Collect Fine Now (Digital Payment)</option>
                    <option value="Pending">Add to Student Dues Ledger (Pay Later)</option>
                    <option value="Waived">Waive Fine (Special Exemption)</option>
                  </select>
                </div>

                {returnFinePaymentMethod === 'Waived' && (
                  <div>
                    <label className="block text-[11px] font-bold text-amber-900 mb-1">Reason for Waiver:</label>
                    <input
                      type="text"
                      placeholder="e.g. Medical leave, Principal recommendation..."
                      value={waiverReason}
                      onChange={(e) => setWaiverReason(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs outline-none"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button variant="ghost" onClick={() => setIsReturnModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                icon={CheckCircle2}
                onClick={handleConfirmReturn}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Confirm Return & Clearance
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: COLLECT FINE MODAL */}
      {/* ========================================================================= */}
      {selectedBorrowForFine && (
        <Modal
          isOpen={isCollectFineModalOpen}
          onClose={() => setIsCollectFineModalOpen(false)}
          title="Collect Library Late Fee"
        >
          <div className="space-y-4">
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-center">
              <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Total Outstanding Fine</p>
              <h3 className="text-3xl font-black text-indigo-700 mt-1">${selectedBorrowForFine.calculatedFine}</h3>
              <p className="text-xs text-slate-600 mt-1">
                Borrower: <span className="font-bold">{selectedBorrowForFine.studentName}</span> (Roll #{selectedBorrowForFine.studentRoll})
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
              <select
                value={finePaymentMethod}
                onChange={(e) => setFinePaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Cash">Cash Counter</option>
                <option value="Digital">Digital (bKash / Nagad / Card)</option>
                <option value="Bank">Bank Deposit</option>
              </select>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <Button variant="ghost" onClick={() => setIsCollectFineModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                icon={CheckCircle2}
                onClick={handleCollectFine}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Confirm Payment & Mark Paid
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: ISSUE SLIP / RECEIPT MODAL */}
      {/* ========================================================================= */}
      {latestIssuedRecord && (
        <Modal
          isOpen={isIssueReceiptOpen}
          onClose={() => setIsIssueReceiptOpen(false)}
          title="Library Material Issue Voucher"
        >
          <div className="space-y-5">
            <div className="p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl space-y-4">
              <div className="text-center border-b border-slate-200 pb-3">
                <h4 className="text-base font-black text-slate-900">SMART AMAR SCHOOL & COLLEGE</h4>
                <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider mt-0.5">Library Circulation Issue Slip</p>
                <p className="text-[11px] font-mono text-slate-400 mt-1">Issue Ref: {latestIssuedRecord.id}</p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Student Name:</span>
                  <span className="font-bold text-slate-800">{latestIssuedRecord.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Class & Roll:</span>
                  <span className="font-medium text-slate-700">{latestIssuedRecord.studentClass} ({latestIssuedRecord.studentSection}) • Roll #{latestIssuedRecord.studentRoll}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Book Issued:</span>
                  <span className="font-bold text-indigo-700">{latestIssuedRecord.bookTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ISBN Code:</span>
                  <span className="font-mono text-slate-600">{latestIssuedRecord.bookIsbn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Issue Date:</span>
                  <span className="font-medium text-slate-700">{latestIssuedRecord.borrowDate}</span>
                </div>
                <div className="flex justify-between font-bold text-rose-600">
                  <span>Return Due Date:</span>
                  <span>{latestIssuedRecord.dueDate}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 text-[10px] text-slate-400 text-center italic">
                Please return this volume on or before the specified due date to avoid overdue fines.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                icon={Printer}
                onClick={() => {
                  window.print();
                  showToast('Printing issue slip...', 'info');
                }}
              >
                Print Voucher
              </Button>
              <Button
                variant="primary"
                onClick={() => setIsIssueReceiptOpen(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: RETURN ACKNOWLEDGEMENT & FINE CLEARANCE RECEIPT */}
      {/* ========================================================================= */}
      {latestReturnedRecord && (
        <Modal
          isOpen={isReturnReceiptOpen}
          onClose={() => setIsReturnReceiptOpen(false)}
          title="Library Material Return Acknowledgement"
        >
          <div className="space-y-5">
            <div className="p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl space-y-4">
              <div className="text-center border-b border-slate-200 pb-3">
                <h4 className="text-base font-black text-slate-900">SMART AMAR SCHOOL & COLLEGE</h4>
                <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mt-0.5">Circulation Clearance Voucher</p>
                <p className="text-[11px] font-mono text-slate-400 mt-1">Voucher #{latestReturnedRecord.id}-RET</p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Student:</span>
                  <span className="font-bold text-slate-800">{latestReturnedRecord.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Book Title:</span>
                  <span className="font-semibold text-slate-800">{latestReturnedRecord.bookTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Returned Date:</span>
                  <span className="font-medium text-emerald-700">{latestReturnedRecord.returnDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Condition Verified:</span>
                  <span className="font-bold text-slate-800">{latestReturnedRecord.conditionAtReturn}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Fine Status:</span>
                  <span className="font-bold text-slate-800">{latestReturnedRecord.fineStatus} (${latestReturnedRecord.finePaid})</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 text-[10px] text-emerald-600 text-center font-bold">
                ✓ Material officially accepted and cleared from student record.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                icon={Printer}
                onClick={() => {
                  window.print();
                  showToast('Printing clearance slip...', 'info');
                }}
              >
                Print Slip
              </Button>
              <Button
                variant="primary"
                onClick={() => setIsReturnReceiptOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* PDF Export Config Modal */}
      <PDFExportModal
        isOpen={isExportPDFOpen}
        onClose={() => setIsExportPDFOpen(false)}
        title={
          exportType === 'catalog' ? 'Official Library Book Catalog' :
          exportType === 'borrows' ? 'Library Circulation & Borrow Ledger' :
          'Library Overdue & Late Fee Recovery Notice'
        }
        defaultSubtitle="Institutional Library & Resource Center Official Records"
        moduleType={
          exportType === 'catalog' ? 'library_catalog' :
          exportType === 'borrows' ? 'library_borrows' :
          'library_overdue'
        }
        data={
          exportType === 'catalog' ? filteredBooks :
          exportType === 'borrows' ? filteredBorrows :
          overdueBorrows
        }
      />
    </DashboardLayout>
  );
};
