import React, { useState, useEffect, useMemo } from 'react';
import {
  History,
  Search,
  Filter,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Download,
  FileText,
  ChevronRight,
  ChevronLeft,
  ArrowUpDown,
  RefreshCw,
  User,
  ExternalLink,
  Check,
  X,
  MessageSquare,
  ShieldCheck,
  CalendarRange
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Modal, Badge, Button, useToast } from './UIComponents';
import {
  getLeaveApplications,
  subscribeToLeaveUpdates,
  reviewLeaveApplication
} from '../utils/leaveWorkflow';
import { exportTableToPDF } from '../utils/pdfExport';
import { LeaveApplication } from '../types';

export const RecentLeaveHistoryTable: React.FC<{
  className?: string;
  defaultFilter?: 'all' | 'processed' | 'Approved' | 'Pending' | 'Rejected';
}> = ({ className = '', defaultFilter = 'all' }) => {
  const { showToast } = useToast();
  const [leaves, setLeaves] = useState<LeaveApplication[]>(() => getLeaveApplications());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'processed' | 'Approved' | 'Pending' | 'Rejected'>(defaultFilter);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'date' | 'name' | 'type' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [selectedLeave, setSelectedLeave] = useState<LeaveApplication | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // In-modal quick action state for pending requests
  const [adminRemarkInput, setAdminRemarkInput] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Subscribe to real-time leave workflow changes
  useEffect(() => {
    const syncData = () => {
      setLeaves([...getLeaveApplications()]);
    };
    syncData();
    const unsubscribe = subscribeToLeaveUpdates(syncData);
    return () => unsubscribe();
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setLeaves([...getLeaveApplications()]);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast({ title: 'Leave History Refreshed', message: 'Loaded latest faculty leave records.', type: 'info' });
    }, 400);
  };

  // Helper date parsing for chronological sorting
  const getSortableDate = (leave: LeaveApplication): number => {
    // Priority: reviewedAt, then appliedOn, then startDate
    const timestampStr = leave.reviewedAt || leave.appliedOn || leave.startDate;
    if (!timestampStr) return 0;
    const time = new Date(timestampStr).getTime();
    return isNaN(time) ? 0 : time;
  };

  // Format date helper
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Filtered and Sorted Leave Requests
  const filteredLeaves = useMemo(() => {
    return leaves.filter(leave => {
      // Status filter
      if (statusFilter === 'processed') {
        if (leave.status !== 'Approved' && leave.status !== 'Rejected') return false;
      } else if (statusFilter !== 'all') {
        if (leave.status !== statusFilter) return false;
      }

      // Type filter
      if (typeFilter !== 'all') {
        if ((leave.type || '').toLowerCase() !== typeFilter.toLowerCase()) return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = (leave.applicantName || '').toLowerCase().includes(query);
        const matchesDept = (leave.applicantDepartment || '').toLowerCase().includes(query);
        const matchesDesig = (leave.applicantDesignation || '').toLowerCase().includes(query);
        const matchesType = (leave.type || '').toLowerCase().includes(query);
        const matchesReason = (leave.reason || '').toLowerCase().includes(query);
        const matchesId = (leave.id || '').toLowerCase().includes(query);
        const matchesEmpId = (leave.applicantId || '').toLowerCase().includes(query);
        const matchesStatus = (leave.status || '').toLowerCase().includes(query);

        if (!matchesName && !matchesDept && !matchesDesig && !matchesType && !matchesReason && !matchesId && !matchesEmpId && !matchesStatus) {
          return false;
        }
      }

      return true;
    });
  }, [leaves, statusFilter, typeFilter, searchTerm]);

  // Sort filtered list chronologically or by selected column
  const sortedLeaves = useMemo(() => {
    return [...filteredLeaves].sort((a, b) => {
      if (sortField === 'date') {
        const dateA = getSortableDate(a);
        const dateB = getSortableDate(b);
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      } else if (sortField === 'name') {
        const nameA = a.applicantName.toLowerCase();
        const nameB = b.applicantName.toLowerCase();
        return sortOrder === 'desc' ? nameB.localeCompare(nameA) : nameA.localeCompare(nameB);
      } else if (sortField === 'type') {
        const typeA = (a.type || '').toLowerCase();
        const typeB = (b.type || '').toLowerCase();
        return sortOrder === 'desc' ? typeB.localeCompare(typeA) : typeA.localeCompare(typeB);
      } else if (sortField === 'status') {
        const statusA = a.status.toLowerCase();
        const statusB = b.status.toLowerCase();
        return sortOrder === 'desc' ? statusB.localeCompare(statusA) : statusA.localeCompare(statusB);
      }
      return 0;
    });
  }, [filteredLeaves, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedLeaves.length / itemsPerPage) || 1;
  const paginatedLeaves = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedLeaves.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedLeaves, currentPage, itemsPerPage]);

  const handleSort = (field: 'date' | 'name' | 'type' | 'status') => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc'); // default new column sort to descending
    }
    setCurrentPage(1);
  };

  // Distinct leave types in dataset
  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    leaves.forEach(l => {
      if (l.type) types.add(l.type.trim());
    });
    return Array.from(types);
  }, [leaves]);

  // Summary counts
  const stats = useMemo(() => {
    const total = leaves.length;
    const approved = leaves.filter(l => l.status === 'Approved').length;
    const pending = leaves.filter(l => l.status === 'Pending').length;
    const rejected = leaves.filter(l => l.status === 'Rejected').length;
    const processed = approved + rejected;
    const approvalRate = processed > 0 ? Math.round((approved / processed) * 100) : 0;
    return { total, approved, pending, rejected, processed, approvalRate };
  }, [leaves]);

  // Export to PDF
  const handleExportPDF = () => {
    const headers = ['#', 'Leave ID', 'Teacher Name', 'Department', 'Leave Period', 'Days', 'Type', 'Status', 'Reviewed By'];
    const rows = sortedLeaves.map((leave, index) => [
      index + 1,
      leave.id,
      leave.applicantName,
      leave.applicantDepartment || 'Faculty',
      leave.startDate === leave.endDate
        ? formatDate(leave.startDate)
        : `${formatDate(leave.startDate)} to ${formatDate(leave.endDate)}`,
      `${leave.daysCount || 1}d`,
      leave.type,
      leave.status,
      leave.reviewedBy || (leave.status === 'Pending' ? 'Awaiting Review' : 'Admin Office')
    ]);

    exportTableToPDF({
      title: 'Recent Faculty Leave History & Sanction Audit Register',
      subtitle: `Official Institutional Records • Total Records: ${sortedLeaves.length} • Generated on ${new Date().toLocaleDateString()}`,
      headers,
      rows,
      orientation: 'landscape',
      signatureTitles: ['Sanction Clerk', 'Academic Dean', 'Vice Principal', 'Principal / Headmaster']
    });

    showToast({
      title: 'PDF Export Generated',
      message: `Exported ${sortedLeaves.length} recent leave records to official PDF.`,
      type: 'success'
    });
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Leave ID', 'Teacher Name', 'Employee ID', 'Department', 'Designation', 'Start Date', 'End Date', 'Days', 'Type', 'Reason', 'Status', 'Applied On', 'Reviewed By', 'Reviewed At', 'Admin Remarks'];
    const csvRows = [headers.join(',')];

    sortedLeaves.forEach(l => {
      const row = [
        `"${l.id}"`,
        `"${l.applicantName.replace(/"/g, '""')}"`,
        `"${l.applicantId || ''}"`,
        `"${(l.applicantDepartment || '').replace(/"/g, '""')}"`,
        `"${(l.applicantDesignation || '').replace(/"/g, '""')}"`,
        `"${l.startDate}"`,
        `"${l.endDate}"`,
        l.daysCount || 1,
        `"${l.type}"`,
        `"${(l.reason || '').replace(/"/g, '""')}"`,
        `"${l.status}"`,
        `"${l.appliedOn || ''}"`,
        `"${(l.reviewedBy || '').replace(/"/g, '""')}"`,
        `"${l.reviewedAt || ''}"`,
        `"${(l.adminComment || '').replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Recent_Leave_History_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast({
      title: 'CSV Export Downloaded',
      message: `Downloaded CSV with ${sortedLeaves.length} leave history records.`,
      type: 'success'
    });
  };

  // Quick review handler directly inside the detail modal
  const handleModalReview = (action: 'Approved' | 'Rejected') => {
    if (!selectedLeave) return;
    setIsSubmittingReview(true);
    setTimeout(() => {
      const remark = adminRemarkInput.trim() || (action === 'Approved' ? 'Leave sanctioned by School Admin Office.' : 'Leave application declined by Admin Office.');
      reviewLeaveApplication(selectedLeave.id, action, remark, 'School Admin Desk');
      
      const updatedList = getLeaveApplications();
      setLeaves([...updatedList]);
      const updatedCurrent = updatedList.find(l => l.id === selectedLeave.id) || null;
      setSelectedLeave(updatedCurrent);
      setAdminRemarkInput('');
      setIsSubmittingReview(false);

      showToast({
        title: `Leave ${action}`,
        message: `Teacher ${selectedLeave.applicantName}'s request has been ${action.toLowerCase()}. Notification dispatched.`,
        type: action === 'Approved' ? 'success' : 'error'
      });
    }, 300);
  };

  // Color helper for leave type badge
  const getTypeBadgeStyle = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('sick') || t.includes('medical')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20';
    }
    if (t.includes('casual')) {
      return 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20';
    }
    if (t.includes('duty')) {
      return 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-500/20';
    }
    if (t.includes('maternity')) {
      return 'bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/20';
    }
    if (t.includes('emergency')) {
      return 'bg-red-50 text-red-700 border-red-200 ring-red-500/20';
    }
    if (t.includes('earned')) {
      return 'bg-purple-50 text-purple-700 border-purple-200 ring-purple-500/20';
    }
    return 'bg-slate-50 text-slate-700 border-slate-200 ring-slate-500/20';
  };

  // Status badge helper
  const renderStatusBadge = (status: 'Approved' | 'Pending' | 'Rejected') => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
            Approved
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
            <Clock size={13} className="text-amber-600 shrink-0" />
            Pending
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle size={13} className="text-rose-600 shrink-0" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>
      {/* Top Header Banner */}
      <div className="p-5 sm:p-6 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-3 bg-indigo-500/20 border border-indigo-400/30 rounded-xl text-indigo-300 shadow-sm shrink-0">
              <History size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
                  Recent Leave History
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  {stats.processed} Processed • {stats.total} Total
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {stats.approvalRate}% Approval Rate
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Detailed chronological list of recently processed faculty leave requests, absence petitions, and administrative dispositions.
              </p>
            </div>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex items-center gap-2 flex-wrap self-end lg:self-center">
            <button
              onClick={handleManualRefresh}
              title="Refresh Leave History"
              className={`p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/10 flex items-center gap-1.5 ${isRefreshing ? 'opacity-70' : ''}`}
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/10 flex items-center gap-1.5 shadow-sm"
              title="Export Current View to PDF"
            >
              <FileText size={14} className="text-indigo-300" />
              <span>PDF Report</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/10 flex items-center gap-1.5 shadow-sm"
              title="Export to CSV Spreadsheet"
            >
              <Download size={14} className="text-emerald-300" />
              <span className="hidden sm:inline">CSV</span>
            </button>
            <Link
              to="/school/leave-approval"
              className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-black flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition-all shrink-0"
            >
              <span>Sanction Desk</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5 pt-4 border-t border-white/10">
          <div className="bg-white/5 rounded-xl p-2.5 border border-white/5 flex items-center justify-between">
            <span className="text-xs text-slate-300">Total Filings</span>
            <span className="text-sm font-black text-white">{stats.total}</span>
          </div>
          <div className="bg-emerald-500/10 rounded-xl p-2.5 border border-emerald-500/20 flex items-center justify-between">
            <span className="text-xs text-emerald-300 flex items-center gap-1">
              <CheckCircle2 size={12} /> Approved
            </span>
            <span className="text-sm font-black text-emerald-200">{stats.approved}</span>
          </div>
          <div className="bg-rose-500/10 rounded-xl p-2.5 border border-rose-500/20 flex items-center justify-between">
            <span className="text-xs text-rose-300 flex items-center gap-1">
              <XCircle size={12} /> Rejected
            </span>
            <span className="text-sm font-black text-rose-200">{stats.rejected}</span>
          </div>
          <div className="bg-amber-500/10 rounded-xl p-2.5 border border-amber-500/20 flex items-center justify-between">
            <span className="text-xs text-amber-300 flex items-center gap-1">
              <Clock size={12} /> Pending Review
            </span>
            <span className="text-sm font-black text-amber-200">{stats.pending}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by teacher name, department, leave ID, reason..."
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status Tab Filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All ({leaves.length})
          </button>
          <button
            onClick={() => { setStatusFilter('processed'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
              statusFilter === 'processed'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Processed ({stats.processed})
          </button>
          <button
            onClick={() => { setStatusFilter('Approved'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
              statusFilter === 'Approved'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
            }`}
          >
            Approved ({stats.approved})
          </button>
          <button
            onClick={() => { setStatusFilter('Rejected'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
              statusFilter === 'Rejected'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
            }`}
          >
            Rejected ({stats.rejected})
          </button>
          <button
            onClick={() => { setStatusFilter('Pending'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
              statusFilter === 'Pending'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200'
            }`}
          >
            Pending ({stats.pending})
          </button>
        </div>

        {/* Type Filter Select */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
            <Filter size={14} />
            <span className="hidden sm:inline">Type:</span>
          </div>
          <select
            value={typeFilter}
            onChange={e => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          >
            <option value="all">All Types</option>
            {availableTypes.map(t => (
              <option key={t} value={t}>{t} Leave</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Table View */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-50/90 text-slate-500 border-b border-slate-200 uppercase tracking-wider text-[11px] font-bold">
              {/* Teacher Name Column */}
              <th
                onClick={() => handleSort('name')}
                className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors select-none"
              >
                <div className="flex items-center gap-1.5">
                  <User size={13} className="text-slate-400" />
                  <span>Teacher Name</span>
                  <ArrowUpDown size={12} className={`text-slate-400 ${sortField === 'name' ? 'text-indigo-600' : ''}`} />
                </div>
              </th>

              {/* Date Column */}
              <th
                onClick={() => handleSort('date')}
                className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors select-none"
              >
                <div className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-slate-400" />
                  <span>Date & Duration</span>
                  <ArrowUpDown size={12} className={`text-slate-400 ${sortField === 'date' ? 'text-indigo-600' : ''}`} />
                </div>
              </th>

              {/* Type Column */}
              <th
                onClick={() => handleSort('type')}
                className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Type</span>
                  <ArrowUpDown size={12} className={`text-slate-400 ${sortField === 'type' ? 'text-indigo-600' : ''}`} />
                </div>
              </th>

              {/* Status Column */}
              <th
                onClick={() => handleSort('status')}
                className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors select-none"
              >
                <div className="flex items-center gap-1.5">
                  <span>Status & Disposition</span>
                  <ArrowUpDown size={12} className={`text-slate-400 ${sortField === 'status' ? 'text-indigo-600' : ''}`} />
                </div>
              </th>

              {/* Actions Column */}
              <th className="py-3.5 px-4 text-right">
                <span>Actions</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {paginatedLeaves.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 px-4 text-center">
                  <div className="max-w-sm mx-auto flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                      <History size={24} />
                    </div>
                    <h4 className="text-sm font-bold text-slate-700">No Leave History Found</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      No leave petitions match the active filter or search keywords.
                    </p>
                    {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all') && (
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setStatusFilter('all');
                          setTypeFilter('all');
                        }}
                        className="mt-3 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                      >
                        Reset All Filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              paginatedLeaves.map((leave, index) => {
                const isApproved = leave.status === 'Approved';
                const isPending = leave.status === 'Pending';
                const isRejected = leave.status === 'Rejected';

                return (
                  <tr
                    key={leave.id}
                    className={`hover:bg-slate-50/80 transition-colors group ${
                      isPending ? 'bg-amber-50/20' : ''
                    }`}
                  >
                    {/* 1. TEACHER NAME COLUMN */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {leave.applicantAvatar ? (
                          <img
                            src={leave.applicantAvatar}
                            alt={leave.applicantName}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-xs shadow-sm shrink-0">
                            {leave.applicantName
                              .split(' ')
                              .map(p => p[0])
                              .slice(0, 2)
                              .join('')
                              .toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors truncate">
                              {leave.applicantName}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 font-semibold hidden sm:inline">
                              {leave.id}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap mt-0.5">
                            <span className="font-medium text-slate-600">
                              {leave.applicantDesignation || 'Faculty Member'}
                            </span>
                            {leave.applicantDepartment && (
                              <>
                                <span className="text-slate-300">•</span>
                                <span className="text-slate-400 text-[11px] truncate max-w-[130px]">
                                  {leave.applicantDepartment}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* 2. DATE COLUMN */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div>
                        <div className="flex items-center gap-2 font-semibold text-slate-800 text-xs sm:text-sm">
                          {leave.startDate === leave.endDate ? (
                            <span>{formatDate(leave.startDate)}</span>
                          ) : (
                            <span>
                              {formatDate(leave.startDate)} <span className="text-slate-400">to</span> {formatDate(leave.endDate)}
                            </span>
                          )}
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            {leave.daysCount || 1} {(leave.daysCount || 1) === 1 ? 'Day' : 'Days'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          {leave.reviewedAt ? (
                            <span title={`Processed on ${new Date(leave.reviewedAt).toLocaleString()}`}>
                              Processed: {formatDate(leave.reviewedAt)}
                            </span>
                          ) : leave.appliedOn ? (
                            <span title={`Submitted on ${new Date(leave.appliedOn).toLocaleString()}`}>
                              Applied: {formatDate(leave.appliedOn)}
                            </span>
                          ) : (
                            <span>Effective Date</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* 3. TYPE COLUMN */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex flex-col items-start gap-1">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${getTypeBadgeStyle(
                            leave.type
                          )}`}
                        >
                          {leave.type} Leave
                        </span>
                        {leave.backupTeacher && leave.backupTeacher !== 'Unassigned' && (
                          <span className="text-[10px] text-slate-400 truncate max-w-[120px]" title={`Substitute: ${leave.backupTeacher}`}>
                            Sub: {leave.backupTeacher}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 4. STATUS COLUMN */}
                    <td className="py-3.5 px-4">
                      <div>
                        <div className="flex items-center gap-2">
                          {renderStatusBadge(leave.status)}
                        </div>
                        {leave.adminComment && (
                          <p className="text-[11px] text-slate-500 italic mt-1 line-clamp-1 max-w-[260px]" title={leave.adminComment}>
                            "{leave.adminComment}"
                          </p>
                        )}
                        {!leave.adminComment && isPending && (
                          <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1">
                            <span>Awaiting administrative review</span>
                          </p>
                        )}
                      </div>
                    </td>

                    {/* 5. ACTIONS COLUMN */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedLeave(leave);
                            setAdminRemarkInput(leave.adminComment || '');
                            setIsDetailModalOpen(true);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors flex items-center gap-1 border border-indigo-200/60 shadow-sm"
                          title="View Full Application Details"
                        >
                          <Eye size={13} />
                          <span className="hidden sm:inline">Details</span>
                        </button>
                        {isPending && (
                          <Link
                            to="/school/leave-approval"
                            className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black transition-colors flex items-center gap-1 shadow-sm"
                            title="Open in Full Sanction Desk"
                          >
                            <span>Review</span>
                            <ChevronRight size={13} />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination & Footer Meta */}
      <div className="p-4 bg-slate-50/90 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-3">
          <span>
            Showing <strong className="text-slate-800">{sortedLeaves.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</strong> to{' '}
            <strong className="text-slate-800">{Math.min(currentPage * itemsPerPage, sortedLeaves.length)}</strong> of{' '}
            <strong className="text-slate-800">{sortedLeaves.length}</strong> records
          </span>
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
            <span className="text-slate-400">Rows:</span>
            <select
              value={itemsPerPage}
              onChange={e => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-200 rounded-lg px-2 py-0.5 text-xs text-slate-700 outline-none"
            >
              <option value={5}>5</option>
              <option value={8}>8</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
            </select>
          </div>
        </div>

        {/* Page navigation */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Previous Page"
          >
            <ChevronLeft size={16} />
          </button>
          
          {Array.from({ length: totalPages }).map((_, idx) => {
            const pageNum = idx + 1;
            // Only show close pages
            if (pageNum !== 1 && pageNum !== totalPages && Math.abs(pageNum - currentPage) > 1) {
              if (pageNum === 2 || pageNum === totalPages - 1) {
                return <span key={pageNum} className="px-1 text-slate-400">...</span>;
              }
              return null;
            }
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                  currentPage === pageNum
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="Next Page"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Detailed Leave Record Modal */}
      {selectedLeave && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Faculty Leave Record • ${selectedLeave.id}`}
          size="lg"
        >
          <div className="space-y-5">
            {/* Teacher Profile Summary Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                {selectedLeave.applicantAvatar ? (
                  <img
                    src={selectedLeave.applicantAvatar}
                    alt={selectedLeave.applicantName}
                    className="w-14 h-14 rounded-full object-cover border-2 border-indigo-200 shadow-sm"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-lg shadow-sm">
                    {(selectedLeave.applicantName || 'U').charAt(0)}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-black text-slate-800">{selectedLeave.applicantName}</h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800">
                      {selectedLeave.applicantId}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedLeave.applicantDesignation || 'Faculty Member'} •{' '}
                    <span className="font-semibold text-slate-700">{selectedLeave.applicantDepartment || 'Academics'}</span>
                  </p>
                  {selectedLeave.applicantPhone && (
                    <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                      Phone: {selectedLeave.applicantPhone}
                    </p>
                  )}
                </div>
              </div>

              <div className="self-end sm:self-center">
                {renderStatusBadge(selectedLeave.status)}
              </div>
            </div>

            {/* Application Core Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Leave Type</span>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${getTypeBadgeStyle(selectedLeave.type)}`}>
                    {selectedLeave.type} Leave
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Duration & Period</span>
                <p className="mt-1 text-xs font-bold text-slate-800">
                  {selectedLeave.startDate === selectedLeave.endDate
                    ? formatDate(selectedLeave.startDate)
                    : `${formatDate(selectedLeave.startDate)} – ${formatDate(selectedLeave.endDate)}`}
                </p>
                <span className="text-[11px] text-indigo-600 font-semibold">
                  {selectedLeave.daysCount || 1} {(selectedLeave.daysCount || 1) === 1 ? 'Calendar Day' : 'Calendar Days'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Substitute Teacher</span>
                <p className="mt-1 text-xs font-bold text-slate-800">
                  {selectedLeave.backupTeacher || 'No substitute assigned'}
                </p>
                <span className="text-[11px] text-slate-400">Classroom handoff arranged</span>
              </div>
            </div>

            {/* Stated Purpose / Reason */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Stated Purpose & Faculty Justification
              </span>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 font-normal">
                "{selectedLeave.reason || 'No written explanation provided.'}"
              </p>
            </div>

            {/* Administrative Review & Audit Trail */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-indigo-600" />
                  Administrative Audit & Disposition
                </span>
                {selectedLeave.reviewedAt && (
                  <span className="text-[11px] font-mono text-slate-400">
                    {new Date(selectedLeave.reviewedAt).toLocaleString()}
                  </span>
                )}
              </div>

              {selectedLeave.status !== 'Pending' ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Sanctioning Officer:</span>
                    <strong className="text-slate-800">{selectedLeave.reviewedBy || 'School Admin Office'}</strong>
                  </div>
                  <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-700">
                    <span className="font-bold text-slate-500 block mb-0.5">Official Remarks:</span>
                    <p className="italic text-slate-800">
                      {selectedLeave.adminComment || 'Sanction recorded without additional remarks.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  <p className="text-xs text-amber-700 font-medium">
                    This requisition is currently awaiting administrative decision. You may review and record your disposition now or open the full Sanction Desk.
                  </p>
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Administrative Decision Remarks:
                    </label>
                    <textarea
                      value={adminRemarkInput}
                      onChange={e => setAdminRemarkInput(e.target.value)}
                      placeholder="Add official administrative remarks, syllabus coverage notes, or substitution orders..."
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      rows={2}
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <Button
                      variant="outline"
                      onClick={() => handleModalReview('Rejected')}
                      disabled={isSubmittingReview}
                      className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:border-rose-300 text-xs font-bold"
                    >
                      <X size={14} className="mr-1 text-rose-600" />
                      Decline Request
                    </Button>
                    <Button
                      onClick={() => handleModalReview('Approved')}
                      disabled={isSubmittingReview}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                    >
                      <Check size={14} className="mr-1" />
                      Sanction & Approve
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <Link
                to="/school/leave-approval"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                onClick={() => setIsDetailModalOpen(false)}
              >
                <span>Open in Sanction Desk</span>
                <ExternalLink size={12} />
              </Link>
              <Button
                variant="outline"
                onClick={() => setIsDetailModalOpen(false)}
                className="text-xs font-bold"
              >
                Close Record
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
