import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Users,
  Filter,
  RefreshCw,
  Search,
  Check,
  X,
  Eye,
  ShieldCheck,
  UserCheck,
  Phone,
  Sparkles,
  ChevronDown,
  Layers,
  ArrowUpRight,
  HelpCircle,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, Button, Badge, Modal, useToast } from './UIComponents';
import {
  getLeaveApplications,
  subscribeToLeaveUpdates,
  reviewLeaveApplication
} from '../utils/leaveWorkflow';
import { LeaveApplication } from '../types';
import { MOCK_STAFF } from '../constants';

interface StaffLeaveCalendarWidgetProps {
  className?: string;
}

export const StaffLeaveCalendarWidget: React.FC<StaffLeaveCalendarWidgetProps> = ({ className = '' }) => {
  const { showToast } = useToast();

  // All active leave applications
  const [leaves, setLeaves] = useState<LeaveApplication[]>(() => getLeaveApplications());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');

  // Calendar View State: Month & Year (0-indexed month, 2026 default or current)
  const initialDate = useMemo(() => new Date(), []);
  const [currentYear, setCurrentYear] = useState<number>(() => initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(() => initialDate.getMonth()); // 0 = Jan, 8 = Sep

  // Filter states
  const [selectedStaffId, setSelectedStaffId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Approved' | 'Pending' | 'Rejected'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected date modal / drawer
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [selectedDateLeaves, setSelectedDateLeaves] = useState<LeaveApplication[]>([]);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);

  // Review inside calendar modal state
  const [reviewingLeave, setReviewingLeave] = useState<LeaveApplication | null>(null);
  const [reviewDecision, setReviewDecision] = useState<'Approved' | 'Rejected'>('Approved');
  const [reviewRemark, setReviewRemark] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Real-time synchronization
  const syncLeaves = () => {
    const fresh = getLeaveApplications();
    setLeaves([...fresh]);
    const d = new Date();
    setLastSyncTime(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  };

  useEffect(() => {
    syncLeaves();
    const unsubscribe = subscribeToLeaveUpdates(() => {
      syncLeaves();
    });
    return () => unsubscribe();
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    syncLeaves();
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Staff leave calendar synchronized with live records', 'success');
    }, 350);
  };

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleGoToToday = () => {
    const today = new Date();
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  // Month Names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculate unique staff list for filter
  const allStaffList = useMemo(() => {
    const map = new Map<string, { id: string; name: string; designation?: string; avatar?: string }>();
    MOCK_STAFF.forEach(s => {
      map.set(s.id, {
        id: s.id,
        name: s.name,
        designation: s.designation,
        avatar: s.imageUrl
      });
    });
    leaves.forEach(l => {
      if (!map.has(l.applicantId)) {
        map.set(l.applicantId, {
          id: l.applicantId,
          name: l.applicantName,
          designation: l.applicantDesignation || l.applicantDepartment,
          avatar: l.applicantAvatar
        });
      }
    });
    return Array.from(map.values());
  }, [leaves]);

  // Unique leave types for filter
  const leaveTypesList = useMemo(() => {
    const types = new Set<string>();
    leaves.forEach(l => {
      if (l.type) types.add(l.type);
    });
    return Array.from(types);
  }, [leaves]);

  // Filter leaves based on active controls
  const filteredLeaves = useMemo(() => {
    return leaves.filter(l => {
      if (selectedStaffId !== 'all' && l.applicantId !== selectedStaffId) {
        return false;
      }
      if (statusFilter !== 'all' && l.status !== statusFilter) {
        return false;
      }
      if (typeFilter !== 'all' && l.type.toLowerCase() !== typeFilter.toLowerCase()) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = l.applicantName.toLowerCase().includes(q);
        const matchReason = l.reason.toLowerCase().includes(q);
        const matchId = l.id.toLowerCase().includes(q);
        if (!matchName && !matchReason && !matchId) return false;
      }
      return true;
    });
  }, [leaves, selectedStaffId, statusFilter, typeFilter, searchQuery]);

  // Format Date to YYYY-MM-DD
  const formatDateStr = (year: number, monthIndex: number, day: number) => {
    const y = year.toString();
    const m = (monthIndex + 1).toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Map leaves to dates in the active month
  // A leave can span multiple dates (startDate to endDate inclusive)
  const leavesByDateMap = useMemo(() => {
    const map = new Map<string, LeaveApplication[]>();

    filteredLeaves.forEach(leave => {
      if (!leave.startDate) return;
      const start = new Date(leave.startDate);
      const end = leave.endDate ? new Date(leave.endDate) : new Date(leave.startDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) return;

      // Loop through each day in the span
      const cur = new Date(start);
      // Safety limit to avoid infinite loops in malformed dates (max 90 days span)
      let count = 0;
      while (cur <= end && count < 90) {
        const y = cur.getFullYear();
        const m = (cur.getMonth() + 1).toString().padStart(2, '0');
        const d = cur.getDate().toString().padStart(2, '0');
        const key = `${y}-${m}-${d}`;

        const existing = map.get(key) || [];
        existing.push(leave);
        map.set(key, existing);

        cur.setDate(cur.getDate() + 1);
        count++;
      }
    });

    return map;
  }, [filteredLeaves]);

  // Monthly stats for current viewing month
  const monthSummaryStats = useMemo(() => {
    const curYearStr = currentYear.toString();
    const curMonthStr = (currentMonth + 1).toString().padStart(2, '0');
    const prefix = `${curYearStr}-${curMonthStr}`;

    let totalMonthLeaves = 0;
    let approvedCount = 0;
    let pendingCount = 0;
    let rejectedCount = 0;

    // Track unique application IDs touched in this month
    const processedIds = new Set<string>();

    leavesByDateMap.forEach((apps, dateKey) => {
      if (dateKey.startsWith(prefix)) {
        apps.forEach(app => {
          if (!processedIds.has(app.id)) {
            processedIds.add(app.id);
            totalMonthLeaves++;
            if (app.status === 'Approved') approvedCount++;
            else if (app.status === 'Pending') pendingCount++;
            else if (app.status === 'Rejected') rejectedCount++;
          }
        });
      }
    });

    return {
      total: totalMonthLeaves,
      approved: approvedCount,
      pending: pendingCount,
      rejected: rejectedCount
    };
  }, [leavesByDateMap, currentYear, currentMonth]);

  // Calendar Grid Matrix Generation
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun, 1 = Mon ...
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days: Array<{
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isWeekend: boolean;
      leaves: LeaveApplication[];
    }> = [];

    const todayStr = (() => {
      const t = new Date();
      return `${t.getFullYear()}-${(t.getMonth() + 1).toString().padStart(2, '0')}-${t.getDate().toString().padStart(2, '0')}`;
    })();

    // 1. Previous Month Spillover Days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = formatDateStr(prevYear, prevMonth, dayNum);
      const dayOfWeek = new Date(prevYear, prevMonth, dayNum).getDay();

      days.push({
        dateStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isWeekend: dayOfWeek === 5 || dayOfWeek === 6, // Fri/Sat in some school regions, or standard weekend
        leaves: leavesByDateMap.get(dateStr) || []
      });
    }

    // 2. Current Month Days
    for (let dayNum = 1; dayNum <= daysInCurrentMonth; dayNum++) {
      const dateStr = formatDateStr(currentYear, currentMonth, dayNum);
      const dayOfWeek = new Date(currentYear, currentMonth, dayNum).getDay();

      days.push({
        dateStr,
        dayNumber: dayNum,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        isWeekend: dayOfWeek === 5 || dayOfWeek === 6,
        leaves: leavesByDateMap.get(dateStr) || []
      });
    }

    // 3. Next Month Spillover Days (to complete 5 or 6 rows of 7 = 35 or 42)
    const totalCells = days.length <= 35 ? 35 : 42;
    const remaining = totalCells - days.length;
    for (let dayNum = 1; dayNum <= remaining; dayNum++) {
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = formatDateStr(nextYear, nextMonth, dayNum);
      const dayOfWeek = new Date(nextYear, nextMonth, dayNum).getDay();

      days.push({
        dateStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
        isWeekend: dayOfWeek === 5 || dayOfWeek === 6,
        leaves: leavesByDateMap.get(dateStr) || []
      });
    }

    return days;
  }, [currentYear, currentMonth, leavesByDateMap]);

  // Today's active leaves (for the "Staff on Leave Today" quick alert bar)
  const todayStr = useMemo(() => {
    const t = new Date();
    return `${t.getFullYear()}-${(t.getMonth() + 1).toString().padStart(2, '0')}-${t.getDate().toString().padStart(2, '0')}`;
  }, []);

  const todayLeaves = useMemo(() => {
    return leavesByDateMap.get(todayStr) || [];
  }, [leavesByDateMap, todayStr]);

  // Handle opening day inspection
  const handleOpenDayModal = (dateStr: string, dayLeaves: LeaveApplication[]) => {
    setSelectedDateStr(dateStr);
    setSelectedDateLeaves(dayLeaves);
    setIsDayModalOpen(true);
  };

  // Review submission
  const handleStartReview = (leave: LeaveApplication, initialDecision: 'Approved' | 'Rejected') => {
    setReviewingLeave(leave);
    setReviewDecision(initialDecision);
    setReviewRemark(
      initialDecision === 'Approved'
        ? 'Leave sanctioned as per academic council policies. Class substitution verified.'
        : 'Leave request declined due to institutional invigilation commitments.'
    );
  };

  const handleConfirmReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingLeave) return;

    setIsSubmittingReview(true);
    try {
      const result = reviewLeaveApplication(
        reviewingLeave.id,
        reviewDecision,
        reviewRemark,
        'Dr. M. Rahman (Principal / School Admin)'
      );

      if (result.success) {
        showToast(
          `Application ${reviewingLeave.id} has been ${reviewDecision.toLowerCase()}!`,
          'success'
        );
        setReviewingLeave(null);
        syncLeaves();

        // Update day modal list
        if (selectedDateStr) {
          const freshAll = getLeaveApplications();
          const updated = freshAll.filter(l => {
            const start = l.startDate;
            const end = l.endDate || l.startDate;
            return selectedDateStr >= start && selectedDateStr <= end;
          });
          setSelectedDateLeaves(updated);
        }
      } else {
        showToast(result.message || 'Failed to update review status', 'error');
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || 'Error recording review', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Color helper for leave status badge
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'Approved':
        return {
          pill: 'bg-emerald-100 text-emerald-900 border-l-4 border-emerald-500 hover:bg-emerald-200/80',
          dot: 'bg-emerald-500',
          text: 'text-emerald-700',
          border: 'border-emerald-200'
        };
      case 'Pending':
        return {
          pill: 'bg-amber-100 text-amber-950 border-l-4 border-amber-500 hover:bg-amber-200/80',
          dot: 'bg-amber-500 animate-pulse',
          text: 'text-amber-700',
          border: 'border-amber-200'
        };
      case 'Rejected':
        return {
          pill: 'bg-rose-100 text-rose-900 border-l-4 border-rose-500 opacity-85 hover:bg-rose-200/80 line-through decoration-rose-400',
          dot: 'bg-rose-500',
          text: 'text-rose-700',
          border: 'border-rose-200'
        };
      default:
        return {
          pill: 'bg-slate-100 text-slate-800 border-l-4 border-slate-400',
          dot: 'bg-slate-400',
          text: 'text-slate-600',
          border: 'border-slate-200'
        };
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Calendar Card Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Top Header Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Title & Live Status */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-400/30">
                <CalendarRange size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                    <span>Staff Leave Monthly Calendar</span>
                  </h3>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Color-Coded Registry
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-medium mt-0.5">
                  Visual daily schedule of approved, pending, and rejected staff leave requests
                </p>
              </div>
            </div>

            {/* Month Navigator Controls */}
            <div className="flex items-center gap-2 flex-wrap justify-between lg:justify-end">
              <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 shadow-inner">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  title="Previous Month"
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  <ChevronLeft size={18} />
                </button>

                <div className="px-3 py-1 text-center min-w-[150px]">
                  <span className="text-xs font-black text-white tracking-wide uppercase">
                    {monthNames[currentMonth]} {currentYear}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleNextMonth}
                  title="Next Month"
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Jump to Today Button */}
              <button
                type="button"
                onClick={handleGoToToday}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <CalendarIcon size={14} className="text-indigo-400" />
                <span>Today</span>
              </button>

              {/* Refresh Button */}
              <button
                type="button"
                onClick={handleManualRefresh}
                title="Refresh calendar data"
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 cursor-pointer"
              >
                <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-amber-400' : ''} />
              </button>

              {/* Sanction Desk Quick Link */}
              <Link
                to="/school/leave-approval"
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-sm transition-all"
              >
                <span>Sanction Desk</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>

          {/* Month Summary Counters Bar */}
          <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total In Month</span>
                <span className="text-lg font-black text-white font-mono">{monthSummaryStats.total}</span>
              </div>
              <div className="p-2 bg-slate-700/50 rounded-lg text-slate-300">
                <Users size={16} />
              </div>
            </div>

            <div className="bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 block">Approved</span>
                <span className="text-lg font-black text-emerald-300 font-mono">{monthSummaryStats.approved}</span>
              </div>
              <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-lg">
                <CheckCircle2 size={16} />
              </div>
            </div>

            <div className="bg-amber-950/40 p-2.5 rounded-xl border border-amber-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 block">Pending</span>
                <span className="text-lg font-black text-amber-300 font-mono">{monthSummaryStats.pending}</span>
              </div>
              <div className="p-2 bg-amber-500/20 text-amber-300 rounded-lg">
                <Clock size={16} />
              </div>
            </div>

            <div className="bg-rose-950/40 p-2.5 rounded-xl border border-rose-500/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-rose-400 block">Rejected</span>
                <span className="text-lg font-black text-rose-300 font-mono">{monthSummaryStats.rejected}</span>
              </div>
              <div className="p-2 bg-rose-500/20 text-rose-300 rounded-lg">
                <XCircle size={16} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search Strip */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter by Staff Member */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 shadow-2xs">
              <Users size={14} className="text-indigo-600 shrink-0" />
              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="bg-transparent font-bold text-slate-700 outline-none cursor-pointer pr-1"
              >
                <option value="all">All Staff Members ({allStaffList.length})</option>
                {allStaffList.map(staff => (
                  <option key={staff.id} value={staff.id}>
                    {staff.name} ({staff.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Status */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 shadow-2xs">
              <Filter size={14} className="text-slate-500 shrink-0" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-transparent font-bold text-slate-700 outline-none cursor-pointer pr-1"
              >
                <option value="all">All Statuses</option>
                <option value="Approved">🟢 Approved Only</option>
                <option value="Pending">🟡 Pending Only</option>
                <option value="Rejected">🔴 Rejected Only</option>
              </select>
            </div>

            {/* Filter by Leave Category */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-500">Category:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-transparent font-bold text-slate-700 outline-none cursor-pointer pr-1"
              >
                <option value="all">All Types</option>
                {leaveTypesList.map(type => (
                  <option key={type} value={type}>
                    {type} Leave
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff or reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs w-44 sm:w-56"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Color-Coding Legend Indicators */}
          <div className="flex items-center gap-3 font-semibold text-[11px] bg-white px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="text-slate-400 uppercase tracking-wider text-[10px] font-bold hidden sm:inline">
              Legend:
            </span>
            <div className="flex items-center gap-1.5 text-emerald-800">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Approved</span>
            </div>
            <div className="flex items-center gap-1.5 text-amber-800">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <span>Pending</span>
            </div>
            <div className="flex items-center gap-1.5 text-rose-800">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Rejected</span>
            </div>
          </div>
        </div>

        {/* Staff on Leave Today Alert Banner (if applicable) */}
        {todayLeaves.length > 0 && (
          <div className="bg-amber-50/90 border-b border-amber-200/80 px-4 sm:px-6 py-2.5 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="p-1 bg-amber-500 text-white rounded-md">
                <AlertCircle size={14} />
              </span>
              <span className="font-bold text-amber-950">
                Staff On Leave Today ({todayLeaves.length}):
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {todayLeaves.map(leave => (
                  <span
                    key={leave.id}
                    onClick={() => handleOpenDayModal(todayStr, todayLeaves)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white border border-amber-300 text-amber-900 font-bold cursor-pointer hover:bg-amber-100 transition-colors shadow-2xs"
                  >
                    <span>{leave.applicantName}</span>
                    <span className="text-[10px] font-normal text-amber-700">({leave.type})</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      leave.status === 'Approved' ? 'bg-emerald-500' : leave.status === 'Pending' ? 'bg-amber-500' : 'bg-rose-500'
                    }`} />
                  </span>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleOpenDayModal(todayStr, todayLeaves)}
              className="text-[11px] font-bold text-amber-900 hover:underline"
            >
              View Today's Details →
            </button>
          </div>
        )}

        {/* Monthly Calendar View Grid */}
        <div className="p-2 sm:p-4 bg-slate-100/50">
          
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-1 sm:mb-2 text-center">
            {daysOfWeek.map((day, idx) => (
              <div
                key={day}
                className={`py-2 text-[11px] sm:text-xs font-black uppercase tracking-wider rounded-lg ${
                  idx === 5 || idx === 6
                    ? 'bg-slate-200/60 text-slate-500'
                    : 'bg-white text-slate-700 shadow-2xs'
                }`}
              >
                <span>{day}</span>
              </div>
            ))}
          </div>

          {/* Calendar Cells Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarDays.map((cell) => {
              const hasLeaves = cell.leaves.length > 0;
              const pendingInCell = cell.leaves.filter(l => l.status === 'Pending').length;
              const approvedInCell = cell.leaves.filter(l => l.status === 'Approved').length;
              const rejectedInCell = cell.leaves.filter(l => l.status === 'Rejected').length;

              return (
                <div
                  key={cell.dateStr}
                  onClick={() => handleOpenDayModal(cell.dateStr, cell.leaves)}
                  className={`min-h-[92px] sm:min-h-[110px] p-1.5 sm:p-2 rounded-xl border transition-all flex flex-col justify-between cursor-pointer group relative ${
                    cell.isToday
                      ? 'bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm'
                      : cell.isCurrentMonth
                      ? 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-xs'
                      : 'bg-slate-50/60 border-slate-100 text-slate-400 opacity-60'
                  }`}
                >
                  {/* Cell Header: Day Number & Status Summary Dots */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs sm:text-sm font-black font-mono leading-none ${
                        cell.isToday
                          ? 'w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-2xs'
                          : cell.isCurrentMonth
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {/* Quick status dots for mobile or multiple events */}
                    {hasLeaves && (
                      <div className="flex items-center gap-1">
                        {pendingInCell > 0 && (
                          <span
                            title={`${pendingInCell} Pending`}
                            className="w-2 h-2 rounded-full bg-amber-500"
                          />
                        )}
                        {approvedInCell > 0 && (
                          <span
                            title={`${approvedInCell} Approved`}
                            className="w-2 h-2 rounded-full bg-emerald-500"
                          />
                        )}
                        {rejectedInCell > 0 && (
                          <span
                            title={`${rejectedInCell} Rejected`}
                            className="w-2 h-2 rounded-full bg-rose-500"
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {/* Day Content: Color-Coded Staff Leave Cards */}
                  <div className="space-y-1 flex-1 overflow-hidden">
                    {cell.leaves.slice(0, 2).map((leave) => {
                      const style = getStatusBadgeStyle(leave.status);
                      const isSingleDay = leave.startDate === leave.endDate;

                      return (
                        <div
                          key={`${cell.dateStr}-${leave.id}`}
                          title={`${leave.applicantName} - ${leave.type} Leave (${leave.status})\n${leave.startDate} to ${leave.endDate}\nReason: ${leave.reason}`}
                          className={`text-[10px] sm:text-[11px] py-0.5 px-1.5 rounded-md font-semibold leading-tight truncate transition-all shadow-2xs flex items-center gap-1 ${style.pill}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />
                          <span className="font-bold truncate">{leave.applicantName.split(' ')[0]}</span>
                          <span className="text-[9px] opacity-75 hidden sm:inline">({leave.type})</span>
                        </div>
                      );
                    })}

                    {/* Overflow Badge */}
                    {cell.leaves.length > 2 && (
                      <div className="text-[9.5px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded px-1 text-center border border-indigo-200">
                        +{cell.leaves.length - 2} more leave{cell.leaves.length - 2 > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>

                  {/* Cell Bottom Indicator */}
                  {cell.isToday && (
                    <div className="text-[9px] font-extrabold text-indigo-600 uppercase tracking-wider text-right mt-1">
                      Today
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-amber-500 shrink-0" />
            <span>Click any day to inspect staff presence, substitute arrangements, or sanction pending requests.</span>
          </div>
          <div className="text-[11px] font-mono text-slate-400">
            Last synchronized: <span className="text-slate-700 font-semibold">{lastSyncTime}</span>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* DAY INSPECTION & QUICK SANCTION MODAL */}
      {/* ======================================================== */}
      {selectedDateStr && (
        <Modal
          isOpen={isDayModalOpen}
          onClose={() => {
            setIsDayModalOpen(false);
            setReviewingLeave(null);
          }}
          title={`Staff Leave Details: ${selectedDateStr}`}
        >
          <div className="space-y-4">
            
            {/* Modal Header Summary */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-800">
                  {selectedDateLeaves.length} Staff Member{selectedDateLeaves.length === 1 ? '' : 's'} on Leave
                </span>
                <p className="text-slate-500 text-[11px]">
                  Schedule records for {new Date(selectedDateStr).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              {selectedDateLeaves.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {selectedDateLeaves.filter(l => l.status === 'Approved').length} Approved
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    {selectedDateLeaves.filter(l => l.status === 'Pending').length} Pending
                  </span>
                </div>
              )}
            </div>

            {/* If no leaves on this date */}
            {selectedDateLeaves.length === 0 ? (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <CalendarIcon size={32} className="mx-auto text-slate-300" />
                <p className="text-sm font-bold text-slate-600">No staff leaves recorded for this date.</p>
                <p className="text-xs text-slate-400">All registered faculty and staff are scheduled for standard duty.</p>
              </div>
            ) : (
              /* List of leaves active on this date */
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                {selectedDateLeaves.map((leave) => {
                  const style = getStatusBadgeStyle(leave.status);

                  return (
                    <div
                      key={leave.id}
                      className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:shadow-xs transition-shadow space-y-3"
                    >
                      {/* Top Row: Applicant Profile & Status Badge */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {leave.applicantAvatar ? (
                            <img
                              src={leave.applicantAvatar}
                              alt={leave.applicantName}
                              className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm shrink-0">
                              {leave.applicantName.substring(0, 2).toUpperCase()}
                            </div>
                          )}

                          <div>
                            <h4 className="text-sm font-black text-slate-900 leading-tight">
                              {leave.applicantName}
                            </h4>
                            <p className="text-xs text-slate-500 font-medium">
                              {leave.applicantDesignation || leave.applicantDepartment || 'Faculty Member'}
                            </p>
                            <span className="text-[10px] font-mono text-slate-400">ID: {leave.applicantId}</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${
                              leave.status === 'Approved'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : leave.status === 'Pending'
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : 'bg-rose-100 text-rose-800 border-rose-300'
                            }`}
                          >
                            {leave.status}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 font-bold">{leave.id}</span>
                        </div>
                      </div>

                      {/* Details Box */}
                      <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs border border-slate-200/70">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Leave Category:</span>
                          <span className="font-black text-indigo-700">{leave.type} Leave</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Full Duration:</span>
                          <span className="font-bold text-slate-800 font-mono">
                            {leave.startDate} to {leave.endDate} ({leave.daysCount} working day{leave.daysCount === 1 ? '' : 's'})
                          </span>
                        </div>

                        {leave.backupTeacher && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-medium flex items-center gap-1">
                              <UserCheck size={12} className="text-emerald-600" />
                              Substitute Assigned:
                            </span>
                            <span className="font-bold text-slate-700">{leave.backupTeacher}</span>
                          </div>
                        )}

                        {leave.emergencyContact && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-medium flex items-center gap-1">
                              <Phone size={12} className="text-indigo-600" />
                              Emergency Contact:
                            </span>
                            <span className="font-mono text-slate-700">{leave.emergencyContact}</span>
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-200">
                          <span className="text-slate-500 font-medium block mb-0.5">Stated Reason:</span>
                          <p className="text-slate-800 italic bg-white p-2 rounded-lg border border-slate-200">
                            "{leave.reason}"
                          </p>
                        </div>

                        {leave.adminComment && (
                          <div className="pt-1 text-[11px] text-slate-600">
                            <span className="font-bold text-slate-800">Reviewer Note: </span>
                            {leave.adminComment} ({leave.reviewedBy || 'Office'})
                          </div>
                        )}
                      </div>

                      {/* Action buttons inside day modal */}
                      <div className="flex items-center justify-between pt-1">
                        {leave.status === 'Pending' ? (
                          <div className="flex items-center gap-2 w-full">
                            <button
                              type="button"
                              onClick={() => handleStartReview(leave, 'Approved')}
                              className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                            >
                              <Check size={14} />
                              <span>Sanction Leave</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStartReview(leave, 'Rejected')}
                              className="flex-1 py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <X size={14} />
                              <span>Decline</span>
                            </button>
                          </div>
                        ) : (
                          <div className="w-full flex items-center justify-between text-xs">
                            <span className="text-slate-500 text-[11px]">
                              Status: <strong className="text-slate-800">{leave.status}</strong>
                            </span>
                            <Link
                              to="/school/leave-approval"
                              className="text-xs font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                            >
                              <span>Open in Sanction Desk</span>
                              <ArrowUpRight size={13} />
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quick In-Modal Sanction Review Panel (when admin clicks Sanction or Decline) */}
            {reviewingLeave && (
              <form onSubmit={handleConfirmReview} className="mt-4 p-4 rounded-xl border-2 border-indigo-500 bg-indigo-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-black uppercase text-indigo-900 flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-indigo-600" />
                    <span>Confirm Action for {reviewingLeave.applicantName}</span>
                  </h5>
                  <button
                    type="button"
                    onClick={() => setReviewingLeave(null)}
                    className="text-slate-400 hover:text-slate-600 text-xs"
                  >
                    Cancel ✕
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewDecision('Approved')}
                    className={`py-1.5 px-3 rounded-lg text-xs font-black flex items-center justify-center gap-1 transition-all ${
                      reviewDecision === 'Approved'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    <Check size={13} />
                    <span>Sanction (Approve)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReviewDecision('Rejected')}
                    className={`py-1.5 px-3 rounded-lg text-xs font-black flex items-center justify-center gap-1 transition-all ${
                      reviewDecision === 'Rejected'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    <X size={13} />
                    <span>Decline (Reject)</span>
                  </button>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">
                    Official Administrative Remarks:
                  </label>
                  <textarea
                    rows={2}
                    value={reviewRemark}
                    onChange={(e) => setReviewRemark(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setReviewingLeave(null)}
                    className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200/50 rounded-lg"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className={`px-4 py-1.5 text-xs font-black text-white rounded-lg shadow-xs cursor-pointer ${
                      reviewDecision === 'Approved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                    }`}
                  >
                    {isSubmittingReview ? 'Recording...' : `Confirm ${reviewDecision}`}
                  </button>
                </div>
              </form>
            )}

            {/* Modal Footer */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <Link
                to="/school/leave-approval"
                className="text-xs font-black text-indigo-600 hover:underline flex items-center gap-1"
              >
                <span>Go to Full Sanction Desk</span>
                <ArrowUpRight size={13} />
              </Link>
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setIsDayModalOpen(false);
                  setReviewingLeave(null);
                }}
                className="text-xs"
              >
                Close
              </Button>
            </div>

          </div>
        </Modal>
      )}

    </div>
  );
};
export default StaffLeaveCalendarWidget;
