import React, { useState, useEffect, useMemo } from 'react';
import { 
  CalendarRange, CheckCircle2, XCircle, Clock, Search, Filter, 
  UserCheck, AlertCircle, MessageSquare, ChevronRight, RefreshCw, 
  Send, ShieldCheck, FileText, ArrowRight, Printer, Check, X,
  Calendar, Users, Building2, User, Phone, Sparkles, SlidersHorizontal,
  Info, Award, HelpCircle, BarChart3, PieChart
} from 'lucide-react';
import { DashboardLayout } from '../components/Layout';
import { Card, Button, Badge, Input, Modal, useToast } from '../components/UIComponents';
import { UserRole, LeaveApplication } from '../types';
import { TeacherLeaveAnalyticsWidget } from '../components/TeacherLeaveAnalyticsWidget';
import { LeaveAnalyticsPdfModal } from '../components/LeaveAnalyticsPdfModal';
import { StaffLeaveCalendarWidget } from '../components/StaffLeaveCalendarWidget';
import { 
  getLeaveApplications, 
  reviewLeaveApplication, 
  batchReviewLeaves, 
  getTeacherLeaveQuota,
  resetLeaveData,
  subscribeToLeaveUpdates,
  getLeavePolicies
} from '../utils/leaveWorkflow';
import { MOCK_STAFF } from '../constants';
import { useLocation, useNavigate } from 'react-router-dom';
import { LeavePoliciesManagement } from '../components/LeavePoliciesManagement';

interface SchoolAdminLeaveApprovalProps {
  defaultTab?: 'approvals' | 'policies' | 'calendar' | 'analytics';
}

export const SchoolAdminLeaveApproval: React.FC<SchoolAdminLeaveApprovalProps> = ({ defaultTab }) => {
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const initialUrlTab = searchParams.get('tab') as ('approvals' | 'policies' | 'calendar' | 'analytics') | null;

  // Primary navigation tab
  const [primaryTab, setPrimaryTab] = useState<'approvals' | 'policies' | 'calendar' | 'analytics'>(() => {
    if (initialUrlTab && ['approvals', 'policies', 'calendar', 'analytics'].includes(initialUrlTab)) {
      return initialUrlTab;
    }
    if (defaultTab) return defaultTab;
    return 'approvals';
  });

  useEffect(() => {
    const currentTab = searchParams.get('tab') as any;
    if (currentTab && ['approvals', 'policies', 'calendar', 'analytics'].includes(currentTab)) {
      setPrimaryTab(currentTab);
    } else if (defaultTab) {
      setPrimaryTab(defaultTab);
    }
  }, [location.search, defaultTab]);

  const handleSelectPrimaryTab = (tab: 'approvals' | 'policies' | 'calendar' | 'analytics') => {
    setPrimaryTab(tab);
    navigate(`/school/leave-approval?tab=${tab}`, { replace: true });
  };
  
  // Workflow state
  const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [policiesCount, setPoliciesCount] = useState<number>(() => getLeavePolicies().filter(p => p.isActive).length);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedLeaves, setSelectedLeaves] = useState<string[]>([]);
  
  // Review Modal State
  const [reviewingLeave, setReviewingLeave] = useState<LeaveApplication | null>(null);
  const [decision, setDecision] = useState<'Approved' | 'Rejected'>('Approved');
  const [customComment, setCustomComment] = useState('');
  const [reviewerName, setReviewerName] = useState('Dr. M. Rahman (School Admin / Principal)');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Batch action modal state
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchDecision, setBatchDecision] = useState<'Approved' | 'Rejected'>('Approved');
  const [batchComment, setBatchComment] = useState('');
  const [showAnalyticsSection, setShowAnalyticsSection] = useState(false);
  const [showCalendarView, setShowCalendarView] = useState(false);
  const [isLeavePdfModalOpen, setIsLeavePdfModalOpen] = useState(false);

  // Quick preset comment chips
  const approvalPresets = [
    'Approved. Coordinate substitute lecture schedule with your department head.',
    'Approved for medical recovery. Submit physician clearance slip upon return.',
    'Sanctioned as casual leave. Departmental class routine coverage verified.',
    'Sanctioned as official academic duty. School will record full attendance credits.'
  ];

  const rejectionPresets = [
    'Declined due to scheduled Board Examination invigilation duty during this period.',
    'Application rejected: Annual Casual Leave quota for current term has been exhausted.',
    'Declined due to critical school inspection week. Please request alternate dates.',
    'Rejected: Alternate substitute teacher has not been arranged for core subjects.'
  ];

  // Refresh leaves from workflow store
  const refreshLeaves = () => {
    const list = getLeaveApplications();
    setLeaves([...list]);
    setPoliciesCount(getLeavePolicies().filter(p => p.isActive).length);
  };

  useEffect(() => {
    refreshLeaves();
    const unsubscribe = subscribeToLeaveUpdates(refreshLeaves);
    return () => unsubscribe();
  }, []);

  // Filtered lists and stats
  const stats = useMemo(() => {
    const total = leaves.length;
    const pending = leaves.filter(l => l.status === 'Pending').length;
    const approved = leaves.filter(l => l.status === 'Approved').length;
    const rejected = leaves.filter(l => l.status === 'Rejected').length;
    return { total, pending, approved, rejected };
  }, [leaves]);

  const filteredLeaves = useMemo(() => {
    return leaves.filter(leave => {
      // Tab filter
      if (activeTab === 'pending' && leave.status !== 'Pending') return false;
      if (activeTab === 'approved' && leave.status !== 'Approved') return false;
      if (activeTab === 'rejected' && leave.status !== 'Rejected') return false;

      // Type filter
      if (selectedType !== 'all' && leave.type.toLowerCase() !== selectedType.toLowerCase()) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = leave.applicantName.toLowerCase().includes(query);
        const matchesId = leave.applicantId.toLowerCase().includes(query);
        const matchesLeaveId = leave.id.toLowerCase().includes(query);
        const matchesDesignation = (leave.applicantDesignation || '').toLowerCase().includes(query);
        const matchesReason = leave.reason.toLowerCase().includes(query);
        if (!matchesName && !matchesId && !matchesLeaveId && !matchesDesignation && !matchesReason) {
          return false;
        }
      }

      return true;
    });
  }, [leaves, activeTab, selectedType, searchQuery]);

  // Open review modal for a specific application
  const handleOpenReview = (leave: LeaveApplication, initialDecision: 'Approved' | 'Rejected' = 'Approved') => {
    setReviewingLeave(leave);
    setDecision(initialDecision);
    if (initialDecision === 'Approved') {
      setCustomComment(leave.adminComment || approvalPresets[0]);
    } else {
      setCustomComment(leave.adminComment || rejectionPresets[0]);
    }
  };

  // Submit single review decision
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingLeave) return;

    if (decision === 'Rejected' && !customComment.trim()) {
      showToast('A formal custom comment / explanation is required when declining a leave request.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = reviewLeaveApplication(
        reviewingLeave.id,
        decision,
        customComment.trim(),
        reviewerName.trim()
      );

      if (result.success) {
        showToast(result.message, decision === 'Approved' ? 'success' : 'info');
        setReviewingLeave(null);
        refreshLeaves();
      } else {
        showToast(result.message, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to update leave status', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle batch selection
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const pendingIds = filteredLeaves.filter(l => l.status === 'Pending').map(l => l.id);
      setSelectedLeaves(pendingIds);
    } else {
      setSelectedLeaves([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedLeaves(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Batch review submit
  const handleBatchReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLeaves.length === 0) return;

    if (batchDecision === 'Rejected' && !batchComment.trim()) {
      showToast('Please provide an explanatory comment for the rejected applications.', 'error');
      return;
    }

    const comment = batchComment.trim() || (batchDecision === 'Approved' 
      ? 'Batch approved by School Administration office.' 
      : 'Batch declined per administrative review.');

    const result = batchReviewLeaves(selectedLeaves, batchDecision, comment, reviewerName);
    showToast(result.message, 'success');
    setIsBatchModalOpen(false);
    setSelectedLeaves([]);
    setBatchComment('');
    refreshLeaves();
  };

  // Reset demo data helper
  const handleResetData = () => {
    if (window.confirm('Reset leave applications back to default institutional seed data?')) {
      resetLeaveData();
      refreshLeaves();
      showToast('Leave applications reset to initial records.', 'info');
    }
  };

  // Print sanction orders summary
  const handlePrintSummary = () => {
    window.print();
  };

  // Active reviewing leave quota
  const reviewingQuota = useMemo(() => {
    if (!reviewingLeave) return null;
    return getTeacherLeaveQuota(reviewingLeave.applicantId);
  }, [reviewingLeave]);

  return (
    <DashboardLayout role={UserRole.SCHOOL_ADMIN}>
      {/* Top Header Banner */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
              <CalendarRange size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                <span>Teacher Leave Approval Workflow</span>
                {stats.pending > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                    {stats.pending} Pending Action
                  </span>
                )}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Review incoming faculty leave petitions, audit substitute coverage, and approve or reject with custom administrative comments.
              </p>
            </div>
          </div>
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowCalendarView(prev => !prev)}
            className={`px-3 py-2 border text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs ${
              showCalendarView
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
            title="Toggle Monthly Color-Coded Staff Leave Calendar View"
          >
            <Calendar size={14} />
            <span>{showCalendarView ? 'Hide Calendar' : 'Monthly Calendar View'}</span>
          </button>
          <button
            onClick={() => setShowAnalyticsSection(prev => !prev)}
            className={`px-3 py-2 border text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs ${
              showAnalyticsSection
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
            title="Toggle Leave Analytics & Visual Trends (Pie & Bar Charts)"
          >
            <BarChart3 size={14} />
            <span>{showAnalyticsSection ? 'Hide Analytics' : 'Analytics & Trends'}</span>
          </button>
          <button
            onClick={refreshLeaves}
            className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
            title="Reload from local repository"
          >
            <RefreshCw size={14} />
            <span>Sync</span>
          </button>
          <button
            onClick={() => setIsLeavePdfModalOpen(true)}
            className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
            title="Export Leave Distribution & Trend Charts as a Formatted PDF Document"
          >
            <FileText size={14} className="text-amber-500" />
            <span>Leave Analytics PDF</span>
          </button>
          <button
            onClick={handlePrintSummary}
            className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Printer size={14} />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleResetData}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-colors"
            title="Reset to default mock requests"
          >
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Primary Module Navigation Tabs: Approvals Desk vs Leave Policies vs Calendar vs Analytics */}
      <div className="mb-6 flex items-center justify-between border-b border-slate-200 bg-white px-4 pt-3 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-3">
          <button
            onClick={() => handleSelectPrimaryTab('approvals')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
              primaryTab === 'approvals'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CalendarRange size={16} />
            <span>Leave Petitions & Approvals</span>
            {stats.pending > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                primaryTab === 'approvals' ? 'bg-amber-400 text-slate-950' : 'bg-amber-100 text-amber-800'
              }`}>
                {stats.pending} Pending
              </span>
            )}
          </button>

          <button
            onClick={() => handleSelectPrimaryTab('policies')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
              primaryTab === 'policies'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <SlidersHorizontal size={16} />
            <span>Leave Policies & Rules</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              primaryTab === 'policies' ? 'bg-emerald-400 text-slate-950' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {policiesCount} Active
            </span>
          </button>

          <button
            onClick={() => handleSelectPrimaryTab('calendar')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
              primaryTab === 'calendar'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calendar size={16} />
            <span>Staff Absence Calendar</span>
          </button>

          <button
            onClick={() => handleSelectPrimaryTab('analytics')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
              primaryTab === 'analytics'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 size={16} />
            <span>Analytics & Trends</span>
          </button>
        </div>
      </div>

      {/* RENDER VIEW ACCORDING TO PRIMARY TAB */}
      {primaryTab === 'policies' ? (
        <LeavePoliciesManagement onPolicyUpdated={refreshLeaves} />
      ) : primaryTab === 'calendar' ? (
        <StaffLeaveCalendarWidget />
      ) : primaryTab === 'analytics' ? (
        <div>
          <TeacherLeaveAnalyticsWidget />
        </div>
      ) : (
        <>
          {/* Monthly Color-Coded Staff Leave Calendar (collapsible shortcut) */}
          {showCalendarView && (
            <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
              <StaffLeaveCalendarWidget />
            </div>
          )}

          {/* Visual Analytics Section (Pie Chart & Monthly Bar Chart) */}
          {showAnalyticsSection && (
            <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
              <TeacherLeaveAnalyticsWidget />
            </div>
          )}

          {/* KPI Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div 
          onClick={() => setActiveTab('all')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'all' 
              ? 'bg-indigo-50/70 border-indigo-300 shadow-xs ring-2 ring-indigo-500/20' 
              : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Petitions</span>
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
              <FileText size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800 mt-2">{stats.total}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span>All historical & current requests</span>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('pending')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'pending' 
              ? 'bg-amber-50/80 border-amber-300 shadow-xs ring-2 ring-amber-500/20' 
              : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Awaiting Decision</span>
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <Clock size={18} className="animate-spin" style={{ animationDuration: '6s' }} />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-900 mt-2 flex items-center gap-2">
            <span>{stats.pending}</span>
            {stats.pending > 0 && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900">
                Action Required
              </span>
            )}
          </div>
          <div className="text-[11px] text-amber-700/80 mt-1">
            <span>Pending School Admin approval</span>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('approved')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'approved' 
              ? 'bg-emerald-50/80 border-emerald-300 shadow-xs ring-2 ring-emerald-500/20' 
              : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Sanctioned / Approved</span>
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-900 mt-2">{stats.approved}</div>
          <div className="text-[11px] text-emerald-700/80 mt-1">
            <span>Roster & substitution confirmed</span>
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('rejected')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === 'rejected' 
              ? 'bg-rose-50/80 border-rose-300 shadow-xs ring-2 ring-rose-500/20' 
              : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">Declined Requests</span>
            <div className="p-2 bg-rose-100 text-rose-700 rounded-xl">
              <XCircle size={18} />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-900 mt-2">{stats.rejected}</div>
          <div className="text-[11px] text-rose-700/80 mt-1">
            <span>Feedback sent to teacher portal</span>
          </div>
        </div>
      </div>

      {/* Main Filter & Search Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs mb-6 overflow-hidden">
        {/* Navigation Tabs */}
        <div className="px-5 pt-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2.5 text-xs font-black rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'pending'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Clock size={14} />
              <span>Pending Review</span>
              {stats.pending > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  activeTab === 'pending' ? 'bg-white text-amber-700' : 'bg-amber-100 text-amber-800'
                }`}>
                  {stats.pending}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2.5 text-xs font-black rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>All Requests</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
              }`}>
                {stats.total}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('approved')}
              className={`px-4 py-2.5 text-xs font-black rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'approved'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CheckCircle2 size={14} />
              <span>Approved</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === 'approved' ? 'bg-white text-emerald-800' : 'bg-emerald-50 text-emerald-700'
              }`}>
                {stats.approved}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('rejected')}
              className={`px-4 py-2.5 text-xs font-black rounded-xl transition-all flex items-center gap-2 ${
                activeTab === 'rejected'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <XCircle size={14} />
              <span>Declined</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === 'rejected' ? 'bg-white text-rose-800' : 'bg-rose-50 text-rose-700'
              }`}>
                {stats.rejected}
              </span>
            </button>
          </div>

          {/* Batch action trigger if pending selected */}
          {selectedLeaves.length > 0 && (
            <div className="flex items-center gap-2 animate-in fade-in duration-200">
              <span className="text-xs font-bold text-slate-600">
                {selectedLeaves.length} selected
              </span>
              <button
                onClick={() => {
                  setBatchDecision('Approved');
                  setBatchComment(approvalPresets[0]);
                  setIsBatchModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 flex items-center gap-1"
              >
                <Check size={13} />
                <span>Batch Approve</span>
              </button>
              <button
                onClick={() => {
                  setBatchDecision('Rejected');
                  setBatchComment(rejectionPresets[0]);
                  setIsBatchModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 flex items-center gap-1"
              >
                <X size={13} />
                <span>Batch Reject</span>
              </button>
            </div>
          )}
        </div>

        {/* Toolbar: Search & Select Filter */}
        <div className="p-4 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search teacher, ID, reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs font-bold text-slate-500 shrink-0">Leave Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Leave Categories</option>
              <option value="sick">Sick Leave</option>
              <option value="casual">Casual Leave</option>
              <option value="duty">Academic Duty</option>
              <option value="emergency">Emergency</option>
              <option value="maternity">Maternity / Paternity</option>
              <option value="unpaid">Unpaid Leave</option>
            </select>
          </div>
        </div>

        {/* Applications List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-black uppercase text-slate-500 tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-10">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      filteredLeaves.filter(l => l.status === 'Pending').length > 0 &&
                      selectedLeaves.length === filteredLeaves.filter(l => l.status === 'Pending').length
                    }
                    className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                  />
                </th>
                <th className="py-3.5 px-4">Application ID</th>
                <th className="py-3.5 px-4">Faculty Member</th>
                <th className="py-3.5 px-4">Leave Category & Duration</th>
                <th className="py-3.5 px-4">Substitute Coverage</th>
                <th className="py-3.5 px-4">Current Status</th>
                <th className="py-3.5 px-4">Admin Decision / Comment</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <div className="p-3 bg-slate-100 rounded-full mb-3 text-slate-400">
                        <CalendarRange size={24} />
                      </div>
                      <p className="font-bold text-slate-600 text-sm">No leave applications match your criteria.</p>
                      <p className="text-xs text-slate-400 mt-1">Try resetting the filter tabs or search keywords.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLeaves.map((leave) => {
                  const isPending = leave.status === 'Pending';
                  const isApproved = leave.status === 'Approved';
                  const isRejected = leave.status === 'Rejected';

                  return (
                    <tr 
                      key={leave.id} 
                      className={`hover:bg-indigo-50/30 transition-colors ${
                        selectedLeaves.includes(leave.id) ? 'bg-indigo-50/50' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4">
                        {isPending ? (
                          <input
                            type="checkbox"
                            checked={selectedLeaves.includes(leave.id)}
                            onChange={() => handleToggleSelect(leave.id)}
                            className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                          />
                        ) : (
                          <span className="text-slate-300">•</span>
                        )}
                      </td>

                      {/* Application ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <span className="text-indigo-600">{leave.id}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-sans mt-0.5">
                          {leave.appliedOn ? new Date(leave.appliedOn).toLocaleDateString() : 'Recent'}
                        </div>
                      </td>

                      {/* Faculty Member */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden shrink-0 border border-slate-300">
                            {leave.applicantAvatar ? (
                              <img src={leave.applicantAvatar} alt={leave.applicantName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold text-xs">
                                {(leave.applicantName || 'U').charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                              <span>{leave.applicantName}</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                                {leave.applicantId}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 truncate max-w-[180px]" title={leave.applicantDesignation}>
                              {leave.applicantDesignation || 'Faculty Member'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Leave Type & Dates */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-[10.5px] font-bold ${
                            leave.type.toLowerCase() === 'sick' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                            leave.type.toLowerCase() === 'casual' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                            leave.type.toLowerCase() === 'duty' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                            'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}>
                            {leave.type} Leave
                          </span>
                          <span className="font-bold text-slate-800 text-xs">
                            {leave.daysCount || 1} day{(leave.daysCount || 1) > 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 flex items-center gap-1 font-mono">
                          <Calendar size={11} className="text-slate-400" />
                          <span>{leave.startDate}</span>
                          <span className="text-slate-400">→</span>
                          <span>{leave.endDate}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 italic truncate max-w-[200px] mt-0.5" title={leave.reason}>
                          "{leave.reason}"
                        </div>
                      </td>

                      {/* Substitute Coverage */}
                      <td className="py-3.5 px-4">
                        <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                          <UserCheck size={12} className="text-emerald-600 shrink-0" />
                          <span className="truncate max-w-[140px]" title={leave.backupTeacher}>
                            {leave.backupTeacher || 'Self-Nominated'}
                          </span>
                        </div>
                        {leave.emergencyContact && (
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono mt-0.5">
                            <Phone size={10} />
                            <span>{leave.emergencyContact}</span>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                            <Clock size={12} />
                            <span>Pending Review</span>
                          </span>
                        )}
                        {isApproved && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                            <CheckCircle2 size={12} />
                            <span>Sanctioned</span>
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-300">
                            <XCircle size={12} />
                            <span>Declined</span>
                          </span>
                        )}
                      </td>

                      {/* Admin Decision / Comment Column */}
                      <td className="py-3.5 px-4 max-w-[240px]">
                        {leave.adminComment ? (
                          <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80">
                            <div className="text-[11px] font-medium text-slate-700 leading-snug line-clamp-2" title={leave.adminComment}>
                              "{leave.adminComment}"
                            </div>
                            {leave.reviewedBy && (
                              <div className="text-[9.5px] text-indigo-700 font-bold mt-1 flex items-center gap-1 truncate">
                                <ShieldCheck size={10} className="shrink-0" />
                                <span>{leave.reviewedBy}</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">
                            No remarks yet
                          </span>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenReview(leave, 'Approved')}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-colors"
                              title="Review and sanction"
                            >
                              <Check size={13} />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleOpenReview(leave, 'Rejected')}
                              className="px-2.5 py-1.5 rounded-lg bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 font-bold text-xs flex items-center gap-1 transition-colors"
                              title="Decline with reason"
                            >
                              <X size={13} />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenReview(leave, leave.status as any)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition-colors ml-auto"
                          >
                            <MessageSquare size={12} />
                            <span>Edit Note</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Showing <span className="font-bold text-slate-700">{filteredLeaves.length}</span> of{' '}
            <span className="font-bold text-slate-700">{leaves.length}</span> faculty petitions
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-700 font-bold">
              <CheckCircle2 size={12} /> Synced with Teacher Portal in Real-Time
            </span>
          </div>
        </div>
      </div>
      </>
      )}

      {/* --- FORMAL LEAVE DECISION MODAL --- */}
      {reviewingLeave && (
        <Modal
          isOpen={true}
          onClose={() => setReviewingLeave(null)}
          title="Formal Leave Sanction & Administrative Review"
        >
          <form onSubmit={handleSubmitReview} className="space-y-4">
            {/* Top Applicant Banner */}
            <div className="p-3.5 bg-gradient-to-r from-slate-900 to-indigo-950 rounded-xl text-white">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-white/10 overflow-hidden border-2 border-indigo-400/40 shrink-0">
                    {reviewingLeave.applicantAvatar ? (
                      <img src={reviewingLeave.applicantAvatar} alt={reviewingLeave.applicantName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-white">
                        {(reviewingLeave.applicantName || 'U').charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-white flex items-center gap-2">
                      <span>{reviewingLeave.applicantName}</span>
                      <span className="text-[10px] font-mono bg-white/20 px-1.5 py-0.5 rounded text-indigo-200">
                        {reviewingLeave.applicantId}
                      </span>
                    </h3>
                    <p className="text-xs text-indigo-200 mt-0.5">
                      {reviewingLeave.applicantDesignation} • {reviewingLeave.applicantDepartment}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-indigo-300 block">Application Ref</span>
                  <span className="font-mono text-xs font-black text-white">{reviewingLeave.id}</span>
                </div>
              </div>
            </div>

            {/* Leave Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Category</span>
                <span className="font-black text-slate-800">{reviewingLeave.type} Leave</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Requested Period</span>
                <span className="font-bold text-slate-800">
                  {reviewingLeave.startDate} to {reviewingLeave.endDate}
                </span>
                <span className="text-indigo-600 font-black ml-1">
                  ({reviewingLeave.daysCount || 1} day{(reviewingLeave.daysCount || 1) > 1 ? 's' : ''})
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Substitute Teacher</span>
                <span className="font-bold text-emerald-800 flex items-center gap-1">
                  <UserCheck size={12} className="text-emerald-600" />
                  {reviewingLeave.backupTeacher || 'None specified'}
                </span>
              </div>
            </div>

            {/* Reason Submitted by Teacher */}
            <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl">
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-800 flex items-center gap-1 mb-1">
                <FileText size={12} />
                Statement / Reason from Teacher
              </span>
              <p className="text-xs text-slate-700 italic leading-relaxed">
                "{reviewingLeave.reason}"
              </p>
            </div>

            {/* Leave Quota Indicator */}
            {reviewingQuota && (
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1.5">
                  Teacher's Annual Leave Balance (Current Academic Year)
                </span>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-500 block">Casual Leaves</span>
                    <span className="font-black text-slate-800">
                      {reviewingQuota.casual.remaining} left{' '}
                      <span className="text-slate-400 font-normal">({reviewingQuota.casual.used}/{reviewingQuota.casual.total} used)</span>
                    </span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-500 block">Sick Leaves</span>
                    <span className="font-black text-slate-800">
                      {reviewingQuota.sick.remaining} left{' '}
                      <span className="text-slate-400 font-normal">({reviewingQuota.sick.used}/{reviewingQuota.sick.total} used)</span>
                    </span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-500 block">Academic Duty</span>
                    <span className="font-black text-slate-800">
                      {reviewingQuota.duty.remaining} left{' '}
                      <span className="text-slate-400 font-normal">({reviewingQuota.duty.used}/{reviewingQuota.duty.total})</span>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Decision Toggle Buttons */}
            <div>
              <label className="block text-xs font-black uppercase text-slate-700 mb-1.5">
                Official Sanction Decision:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setDecision('Approved');
                    setCustomComment(approvalPresets[0]);
                  }}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition-all ${
                    decision === 'Approved'
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-emerald-50 hover:border-emerald-200'
                  }`}
                >
                  <CheckCircle2 size={16} />
                  <span>Sanction / Approve Leave</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDecision('Rejected');
                    setCustomComment(rejectionPresets[0]);
                  }}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition-all ${
                    decision === 'Rejected'
                      ? 'bg-rose-600 border-rose-600 text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-rose-50 hover:border-rose-200'
                  }`}
                >
                  <XCircle size={16} />
                  <span>Decline / Reject Leave</span>
                </button>
              </div>
            </div>

            {/* Custom Comment Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-black uppercase text-slate-700 flex items-center gap-1">
                  <MessageSquare size={13} className="text-indigo-600" />
                  <span>Custom Administrative Comment / Remarks:</span>
                  {decision === 'Rejected' && <span className="text-rose-600">*</span>}
                </label>
                <span className="text-[10px] text-slate-400">
                  {decision === 'Rejected' ? 'Required for teacher portal' : 'Appears in teacher portal'}
                </span>
              </div>

              {/* Quick preset chips */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {(decision === 'Approved' ? approvalPresets : rejectionPresets).map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCustomComment(preset)}
                    className="text-[10px] font-medium px-2 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 text-slate-600 transition-colors text-left"
                  >
                    "{preset.slice(0, 38)}..."
                  </button>
                ))}
              </div>

              <textarea
                value={customComment}
                onChange={(e) => setCustomComment(e.target.value)}
                placeholder={
                  decision === 'Approved'
                    ? 'e.g., Leave sanctioned. Please ensure Class 10 calculus notes are handed over to substitute...'
                    : 'e.g., Application declined due to upcoming exam invigilations. Please discuss with Head of Department...'
                }
                rows={3}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
                required={decision === 'Rejected'}
              />
            </div>

            {/* Reviewer signature / designation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                  Sanctioning Officer Signature
                </label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 font-bold text-slate-700"
                />
              </div>
              <div className="flex items-center p-2 rounded-lg bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900">
                <Info size={14} className="text-amber-600 shrink-0 mr-1.5" />
                <span>Submitting this form immediately updates the internal status in the Teacher Portal.</span>
              </div>
            </div>

            {/* Audit History if already processed */}
            {reviewingLeave.statusTimeline && reviewingLeave.statusTimeline.length > 0 && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Audit History
                </span>
                <div className="space-y-1.5 max-h-24 overflow-y-auto">
                  {reviewingLeave.statusTimeline.map((item, i) => (
                    <div key={i} className="text-[10.5px] flex items-start gap-1.5 text-slate-600">
                      <span className="font-mono text-slate-400 shrink-0">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}:
                      </span>
                      <span className="font-bold text-slate-700">[{item.status}]</span>
                      <span className="text-slate-500 font-medium">{item.actor}</span>
                      <span className="text-slate-400 italic truncate">— "{item.comment}"</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReviewingLeave(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-5 py-2 text-xs font-black text-white rounded-xl shadow-xs transition-all flex items-center gap-1.5 ${
                  decision === 'Approved'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {isSubmitting ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Confirm & Post Decision</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* --- BATCH ACTION MODAL --- */}
      {isBatchModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsBatchModalOpen(false)}
          title={`Batch ${batchDecision} ${selectedLeaves.length} Applications`}
        >
          <form onSubmit={handleBatchReviewSubmit} className="space-y-4">
            <p className="text-xs text-slate-600">
              You are about to <strong>{batchDecision.toLowerCase()}</strong> {selectedLeaves.length} pending leave requests in a single transaction.
            </p>

            <div>
              <label className="block text-xs font-black uppercase text-slate-700 mb-1">
                Common Administrative Remarks:
              </label>
              <textarea
                value={batchComment}
                onChange={(e) => setBatchComment(e.target.value)}
                placeholder="Remarks to attach to all selected leave petitions..."
                rows={3}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required={batchDecision === 'Rejected'}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setIsBatchModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className={batchDecision === 'Approved' ? 'bg-emerald-600' : 'bg-rose-600'}>
                Submit Batch {batchDecision}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Official Leave Distribution & Trends PDF Document Export Modal */}
      <LeaveAnalyticsPdfModal
        isOpen={isLeavePdfModalOpen}
        onClose={() => setIsLeavePdfModalOpen(false)}
        applications={leaves}
      />
    </DashboardLayout>
  );
};
