import React, { useState, useEffect, useMemo } from 'react';
import {
  CalendarRange,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  SlidersHorizontal,
  Users,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Check,
  X,
  MessageSquare,
  ShieldCheck,
  Send,
  Eye,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, Button, Badge, Modal, useToast } from './UIComponents';
import {
  getLeaveApplications,
  subscribeToLeaveUpdates,
  getLeaveQuickStatusCounts,
  reviewLeaveApplication,
  LeaveQuickStatusData
} from '../utils/leaveWorkflow';
import { LeaveApplication } from '../types';

export const LeaveQuickStatusWidget: React.FC<{
  className?: string;
  showQuickInspection?: boolean;
}> = ({ className = '', showQuickInspection = true }) => {
  const { showToast } = useToast();
  const [leaves, setLeaves] = useState<LeaveApplication[]>(() => getLeaveApplications());
  const [horizon, setHorizon] = useState<'all' | 'year' | 'month'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('Just now');
  
  // Quick inspection state
  const [inspectedStatus, setInspectedStatus] = useState<'Pending' | 'Approved' | 'Rejected' | null>('Pending');
  const [isQuickReviewOpen, setIsQuickReviewOpen] = useState(false);
  const [selectedLeaveForReview, setSelectedLeaveForReview] = useState<LeaveApplication | null>(null);
  const [quickDecision, setQuickDecision] = useState<'Approved' | 'Rejected'>('Approved');
  const [quickComment, setQuickComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Sync with real-time leave events
  const syncData = () => {
    const fresh = getLeaveApplications();
    setLeaves([...fresh]);
    const d = new Date();
    setLastUpdated(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  };

  useEffect(() => {
    syncData();
    const unsub = subscribeToLeaveUpdates(() => {
      syncData();
    });
    return () => unsub();
  }, []);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    syncData();
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Leave status counts synchronized in real-time', 'success');
    }, 400);
  };

  // Compute live stats based on selected horizon
  const stats: LeaveQuickStatusData = useMemo(() => {
    return getLeaveQuickStatusCounts(leaves, horizon);
  }, [leaves, horizon]);

  // Filtered leaves for the inspection panel
  const inspectedLeaves = useMemo(() => {
    if (!inspectedStatus) return [];
    
    const now = new Date();
    const currentYearStr = now.getFullYear().toString();
    const currentMonth = now.getMonth();

    return leaves.filter(l => {
      if (l.status !== inspectedStatus) return false;
      if (horizon === 'all') return true;

      const dateStr = l.startDate || l.appliedOn;
      if (!dateStr) return true;
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return true;

      if (horizon === 'year') {
        return d.getFullYear().toString() === currentYearStr;
      }
      if (horizon === 'month') {
        return d.getFullYear().toString() === currentYearStr && d.getMonth() === currentMonth;
      }
      return true;
    });
  }, [leaves, inspectedStatus, horizon]);

  // Handle in-widget quick review submission
  const handleOpenReview = (leave: LeaveApplication, initialDecision: 'Approved' | 'Rejected' = 'Approved') => {
    setSelectedLeaveForReview(leave);
    setQuickDecision(initialDecision);
    setQuickComment(
      initialDecision === 'Approved'
        ? 'Leave sanctioned as per institutional policies. Lecture schedule coordinated.'
        : 'Declined due to departmental duty coverage.'
    );
    setIsQuickReviewOpen(true);
  };

  const submitQuickReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeaveForReview) return;

    setIsSubmittingReview(true);
    try {
      const result = reviewLeaveApplication(
        selectedLeaveForReview.id,
        quickDecision,
        quickComment,
        'Dr. M. Rahman (School Admin / Principal)'
      );

      if (result.success) {
        showToast(
          `Application ${selectedLeaveForReview.id} ${quickDecision.toLowerCase()} successfully`,
          'success'
        );
        setIsQuickReviewOpen(false);
        setSelectedLeaveForReview(null);
        syncData();
      } else {
        showToast(result.message || 'Action failed', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error reviewing leave application', 'error');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Helper badge styles for leave types
  const getLeaveTypeBadge = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('sick')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (t.includes('casual')) return 'bg-amber-100 text-amber-800 border-amber-200';
    if (t.includes('duty')) return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    if (t.includes('maternity')) return 'bg-pink-100 text-pink-800 border-pink-200';
    return 'bg-purple-100 text-purple-800 border-purple-200';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Widget Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 via-white to-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-xl shadow-sm shadow-indigo-200">
              <CalendarRange size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Quick Status: Faculty Leave Requests</span>
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Real-time tracking of pending, approved, and rejected teacher leave applications
              </p>
            </div>
          </div>

          {/* Controls: Horizon Filter & Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setHorizon('all')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  horizon === 'all'
                    ? 'bg-white text-indigo-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Records
              </button>
              <button
                type="button"
                onClick={() => setHorizon('year')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  horizon === 'year'
                    ? 'bg-white text-indigo-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Year 2026
              </button>
              <button
                type="button"
                onClick={() => setHorizon('month')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  horizon === 'month'
                    ? 'bg-white text-indigo-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                This Month
              </button>
            </div>

            <button
              type="button"
              onClick={handleManualRefresh}
              title="Refresh real-time counts"
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors border border-slate-200 flex items-center gap-1 text-xs font-bold"
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-indigo-600' : ''} />
              <span className="hidden sm:inline text-[11px] text-slate-500">Updated {lastUpdated}</span>
            </button>

            <Link
              to="/school/leave-approval"
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition-all"
            >
              <span>Sanction Desk</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        {/* 3 Real-time Status Counter Cards + 1 Summary Card */}
        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* PENDING STATUS CARD */}
            <div
              onClick={() => setInspectedStatus(inspectedStatus === 'Pending' ? null : 'Pending')}
              className={`cursor-pointer rounded-2xl p-4 transition-all border-2 relative overflow-hidden group ${
                inspectedStatus === 'Pending'
                  ? 'bg-amber-50/90 border-amber-500 ring-2 ring-amber-500/20 shadow-md'
                  : 'bg-amber-50/40 border-amber-200/80 hover:border-amber-400 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-800">
                      Pending Review
                    </span>
                    {stats.pending > 0 && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    )}
                  </div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black text-amber-950 font-mono tracking-tight">
                      {stats.pending.toString().padStart(2, '0')}
                    </span>
                    <span className="text-xs font-bold text-amber-700">
                      {stats.pending === 1 ? 'request' : 'requests'}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-amber-500 text-white rounded-xl shadow-sm group-hover:scale-105 transition-transform">
                  <Clock size={22} />
                </div>
              </div>

              {/* Sub metrics & Urgent chip */}
              <div className="mt-3 pt-3 border-t border-amber-200/60 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-amber-700 font-medium">Days Requested:</span>
                  <span className="font-black text-amber-900 font-mono">{stats.pendingDays} Faculty Days</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-amber-700 font-medium">Share of Total:</span>
                  <span className="font-bold text-amber-900">{stats.pendingRate}%</span>
                </div>

                {stats.pendingUrgentCount > 0 && (
                  <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-md border border-rose-200">
                    <AlertCircle size={12} className="shrink-0" />
                    <span>{stats.pendingUrgentCount} starting within 72 hrs</span>
                  </div>
                )}

                <div className="mt-2 flex items-center justify-between text-[11px] font-bold text-amber-800 group-hover:text-amber-950">
                  <span>{inspectedStatus === 'Pending' ? 'Hide list ▲' : 'Inspect pending ▼'}</span>
                  <span className="underline underline-offset-2">Action Desk</span>
                </div>
              </div>
            </div>

            {/* APPROVED STATUS CARD */}
            <div
              onClick={() => setInspectedStatus(inspectedStatus === 'Approved' ? null : 'Approved')}
              className={`cursor-pointer rounded-2xl p-4 transition-all border-2 relative overflow-hidden group ${
                inspectedStatus === 'Approved'
                  ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                  : 'bg-emerald-50/40 border-emerald-200/80 hover:border-emerald-400 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-800">
                    Approved / Sanctioned
                  </span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black text-emerald-950 font-mono tracking-tight">
                      {stats.approved.toString().padStart(2, '0')}
                    </span>
                    <span className="text-xs font-bold text-emerald-700">
                      {stats.approved === 1 ? 'request' : 'requests'}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-sm group-hover:scale-105 transition-transform">
                  <CheckCircle2 size={22} />
                </div>
              </div>

              {/* Sub metrics */}
              <div className="mt-3 pt-3 border-t border-emerald-200/60 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-700 font-medium">Sanctioned Absence:</span>
                  <span className="font-black text-emerald-900 font-mono">{stats.approvedDays} Faculty Days</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-700 font-medium">Approval Rate:</span>
                  <span className="font-black text-emerald-900 font-mono">{stats.approvalRate}%</span>
                </div>

                <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md border border-emerald-200">
                  <ShieldCheck size={12} className="shrink-0 text-emerald-600" />
                  <span>Substitutes & syllabus recorded</span>
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] font-bold text-emerald-800 group-hover:text-emerald-950">
                  <span>{inspectedStatus === 'Approved' ? 'Hide list ▲' : 'Inspect approved ▼'}</span>
                  <span className="underline underline-offset-2">Approved Log</span>
                </div>
              </div>
            </div>

            {/* REJECTED STATUS CARD */}
            <div
              onClick={() => setInspectedStatus(inspectedStatus === 'Rejected' ? null : 'Rejected')}
              className={`cursor-pointer rounded-2xl p-4 transition-all border-2 relative overflow-hidden group ${
                inspectedStatus === 'Rejected'
                  ? 'bg-rose-50/90 border-rose-500 ring-2 ring-rose-500/20 shadow-md'
                  : 'bg-rose-50/40 border-rose-200/80 hover:border-rose-400 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-rose-800">
                    Rejected / Declined
                  </span>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black text-rose-950 font-mono tracking-tight">
                      {stats.rejected.toString().padStart(2, '0')}
                    </span>
                    <span className="text-xs font-bold text-rose-700">
                      {stats.rejected === 1 ? 'request' : 'requests'}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-rose-600 text-white rounded-xl shadow-sm group-hover:scale-105 transition-transform">
                  <XCircle size={22} />
                </div>
              </div>

              {/* Sub metrics */}
              <div className="mt-3 pt-3 border-t border-rose-200/60 flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-rose-700 font-medium">Declined Days:</span>
                  <span className="font-black text-rose-900 font-mono">{stats.rejectedDays} Faculty Days</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-rose-700 font-medium">Rejection Rate:</span>
                  <span className="font-black text-rose-900 font-mono">{stats.rejectionRate}%</span>
                </div>

                <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-100/70 px-2 py-0.5 rounded-md border border-rose-200">
                  <MessageSquare size={12} className="shrink-0 text-rose-600" />
                  <span>Admin remarks documented</span>
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] font-bold text-rose-800 group-hover:text-rose-950">
                  <span>{inspectedStatus === 'Rejected' ? 'Hide list ▲' : 'Inspect rejected ▼'}</span>
                  <span className="underline underline-offset-2">Audit Log</span>
                </div>
              </div>
            </div>

            {/* TOTAL OVERVIEW CARD */}
            <div className="bg-slate-900 text-white rounded-2xl p-4 flex flex-col justify-between shadow-sm border border-slate-800 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Total Petitions
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                    {horizon === 'all' ? 'All Time' : horizon === 'year' ? '2026' : 'Month'}
                  </span>
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                    {stats.total.toString().padStart(2, '0')}
                  </span>
                  <span className="text-xs font-bold text-slate-400">Total Filings</span>
                </div>
              </div>

              {/* Progress Summary */}
              <div className="mt-3 pt-3 border-t border-slate-800 relative z-10 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Absence Volume:</span>
                  <span className="font-bold text-white font-mono">{stats.totalDays} Total Days</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Resolution Rate:</span>
                  <span className="font-bold text-emerald-400 font-mono">
                    {stats.approvalRate + stats.rejectionRate}% Processed
                  </span>
                </div>

                <Link
                  to="/school/leave-approval"
                  className="mt-2 w-full py-1.5 px-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                >
                  <span>Open Full Leave Desk</span>
                  <ArrowUpRight size={14} />
                </Link>
              </div>

              {/* Background Glow */}
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
            </div>

          </div>

          {/* Visual Status Proportion Bar */}
          <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <span className="text-xs font-black uppercase text-slate-600 tracking-wider">
                Status Ratio Distribution
              </span>
              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-amber-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Pending: {stats.pending} ({stats.pendingRate}%)
                </span>
                <span className="flex items-center gap-1.5 text-emerald-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Approved: {stats.approved} ({stats.approvalRate}%)
                </span>
                <span className="flex items-center gap-1.5 text-rose-800">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  Rejected: {stats.rejected} ({stats.rejectionRate}%)
                </span>
              </div>
            </div>

            {/* Proportion Bar */}
            <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
              {stats.pending > 0 && (
                <div
                  style={{ width: `${stats.pendingRate}%` }}
                  className="h-full bg-amber-500 transition-all duration-500 relative group cursor-pointer"
                  title={`Pending: ${stats.pending} (${stats.pendingRate}%)`}
                  onClick={() => setInspectedStatus('Pending')}
                />
              )}
              {stats.approved > 0 && (
                <div
                  style={{ width: `${stats.approvalRate}%` }}
                  className="h-full bg-emerald-500 transition-all duration-500 relative group cursor-pointer"
                  title={`Approved: ${stats.approved} (${stats.approvalRate}%)`}
                  onClick={() => setInspectedStatus('Approved')}
                />
              )}
              {stats.rejected > 0 && (
                <div
                  style={{ width: `${stats.rejectionRate}%` }}
                  className="h-full bg-rose-500 transition-all duration-500 relative group cursor-pointer"
                  title={`Rejected: ${stats.rejected} (${stats.rejectionRate}%)`}
                  onClick={() => setInspectedStatus('Rejected')}
                />
              )}
            </div>
          </div>

          {/* Interactive Inspection Drawer */}
          {showQuickInspection && inspectedStatus && (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Quick Inspection:
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${
                      inspectedStatus === 'Pending'
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : inspectedStatus === 'Approved'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border-rose-300'
                    }`}
                  >
                    {inspectedStatus} ({inspectedLeaves.length})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                    Showing {inspectedLeaves.length} matching application(s)
                  </span>
                  <button
                    type="button"
                    onClick={() => setInspectedStatus(null)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 px-2 py-1 rounded-lg hover:bg-slate-200/60 transition-colors"
                  >
                    Close Drawer ✕
                  </button>
                </div>
              </div>

              {/* Leave Applications Cards List */}
              {inspectedLeaves.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  <p className="text-sm font-bold">No {inspectedStatus.toLowerCase()} leave requests found for this time horizon.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                  {inspectedLeaves.slice(0, 4).map((leave) => (
                    <div
                      key={leave.id}
                      className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            {leave.applicantAvatar ? (
                              <img
                                src={leave.applicantAvatar}
                                alt={leave.applicantName}
                                className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                                {leave.applicantName.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <h4 className="text-xs font-black text-slate-900 leading-tight">
                                {leave.applicantName}
                              </h4>
                              <p className="text-[11px] text-slate-500 font-medium">
                                {leave.applicantDepartment || leave.applicantDesignation || 'Faculty'}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getLeaveTypeBadge(leave.type)}`}>
                              {leave.type} Leave
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 font-bold">{leave.id}</span>
                          </div>
                        </div>

                        {/* Dates & Reason */}
                        <div className="mt-2.5 p-2 bg-slate-50 rounded-lg text-xs space-y-1">
                          <div className="flex items-center justify-between text-slate-700 font-semibold">
                            <span className="flex items-center gap-1 text-[11px] text-slate-500">
                              <Calendar size={12} />
                              {leave.startDate} to {leave.endDate}
                            </span>
                            <span className="font-bold text-indigo-700 font-mono text-[11px]">
                              {leave.daysCount} {leave.daysCount === 1 ? 'day' : 'days'}
                            </span>
                          </div>
                          <p className="text-slate-600 text-[11px] line-clamp-2 italic">
                            "{leave.reason}"
                          </p>
                        </div>

                        {leave.adminComment && (
                          <div className="mt-2 p-2 rounded-lg bg-slate-100/70 border border-slate-200/60 text-[11px] text-slate-700">
                            <span className="font-bold text-slate-900">Admin Remark: </span>
                            {leave.adminComment}
                          </div>
                        )}
                      </div>

                      {/* Fast Action Buttons */}
                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        {leave.status === 'Pending' ? (
                          <div className="flex items-center gap-1.5 w-full">
                            <button
                              type="button"
                              onClick={() => handleOpenReview(leave, 'Approved')}
                              className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black flex items-center justify-center gap-1 shadow-2xs transition-colors"
                            >
                              <Check size={13} />
                              <span>Sanction</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenReview(leave, 'Rejected')}
                              className="flex-1 py-1.5 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                            >
                              <X size={13} />
                              <span>Decline</span>
                            </button>
                          </div>
                        ) : (
                          <div className="w-full flex items-center justify-between text-[11px]">
                            <span className="text-slate-500">
                              Reviewed by <strong className="text-slate-700">{leave.reviewedBy || 'Office'}</strong>
                            </span>
                            <Link
                              to="/school/leave-approval"
                              className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
                            >
                              <span>Details</span>
                              <ChevronRight size={12} />
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {inspectedLeaves.length > 4 && (
                <div className="mt-3 text-center">
                  <Link
                    to="/school/leave-approval"
                    className="inline-flex items-center gap-1 text-xs font-black text-indigo-600 hover:text-indigo-800"
                  >
                    <span>View all {inspectedLeaves.length} {inspectedStatus.toLowerCase()} requests on Sanction Desk</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* In-Widget Quick Review Modal */}
      {selectedLeaveForReview && (
        <Modal
          isOpen={isQuickReviewOpen}
          onClose={() => setIsQuickReviewOpen(false)}
          title={`Quick Review: ${selectedLeaveForReview.id}`}
        >
          <form onSubmit={submitQuickReview} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">Applicant:</span>
                <span className="font-black text-slate-900">{selectedLeaveForReview.applicantName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">Leave Type & Period:</span>
                <span className="font-bold text-indigo-700">
                  {selectedLeaveForReview.type} ({selectedLeaveForReview.daysCount} days: {selectedLeaveForReview.startDate} to {selectedLeaveForReview.endDate})
                </span>
              </div>
              <div className="pt-1 border-t border-slate-200">
                <span className="font-bold text-slate-700">Reason:</span>
                <p className="text-slate-600 italic mt-0.5">"{selectedLeaveForReview.reason}"</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Official Sanction Decision:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setQuickDecision('Approved')}
                  className={`py-2 px-3 rounded-xl border-2 font-black text-xs flex items-center justify-center gap-1.5 transition-all ${
                    quickDecision === 'Approved'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <Check size={14} />
                  <span>Sanction (Approve)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDecision('Rejected')}
                  className={`py-2 px-3 rounded-xl border-2 font-black text-xs flex items-center justify-center gap-1.5 transition-all ${
                    quickDecision === 'Rejected'
                      ? 'border-rose-600 bg-rose-50 text-rose-800 ring-2 ring-rose-500/20'
                      : 'border-slate-200 hover:border-slate-300 text-slate-600'
                  }`}
                >
                  <X size={14} />
                  <span>Decline (Reject)</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Administrative Remark:
              </label>
              <textarea
                rows={2}
                value={quickComment}
                onChange={(e) => setQuickComment(e.target.value)}
                placeholder="Enter custom remarks for the faculty member..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsQuickReviewOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingReview}
                className={`text-xs text-white ${
                  quickDecision === 'Approved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {isSubmittingReview ? 'Recording...' : `Confirm ${quickDecision}`}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
export default LeaveQuickStatusWidget;
