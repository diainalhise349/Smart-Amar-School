import React, { useState, useEffect, useMemo } from 'react';
import {
  Bell,
  Send,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Sliders,
  MessageSquare,
  Filter,
  Search,
  Smartphone,
  Sparkles,
  Zap,
  RefreshCw,
  Check,
  X,
  ExternalLink,
  ShieldCheck,
  FileText,
  Volume2,
  VolumeX,
  Play,
  ArrowRight,
  User,
  Users,
  Building2,
  Calendar,
  ChevronRight,
  Info,
  BadgeAlert,
  Radio
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input, useToast } from './UIComponents';
import { useLanguage } from '../context/LanguageContext';
import { Link, useNavigate } from 'react-router-dom';
import { SMSBroadcastModule } from './SMSBroadcastModule';
import { SMSTemplateManager } from './SMSTemplateManager';
import { SMSScheduledManager } from './SMSScheduledManager';
import {
  AdmissionWorkflowNotification,
  WorkflowAutomationRule,
  getAdmissionWorkflowNotifications,
  saveAdmissionWorkflowNotifications,
  markWorkflowNotificationAsRead,
  markAllWorkflowNotificationsAsRead,
  updateWorkflowNotificationStatus,
  triggerPendingApprovalWorkflow,
  getWorkflowRule,
  saveWorkflowRule,
  ADMISSION_WORKFLOW_EVENT
} from '../utils/admissionWorkflow';

export const CommunicationCenter: React.FC = () => {
  const { t, language } = useLanguage();
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<'alerts' | 'rules' | 'logs' | 'broadcast' | 'templates' | 'scheduled'>('alerts');

  // Notifications state
  const [notifications, setNotifications] = useState<AdmissionWorkflowNotification[]>(() => 
    getAdmissionWorkflowNotifications()
  );

  // Workflow automation rule state
  const [ruleConfig, setRuleConfig] = useState<WorkflowAutomationRule>(() => 
    getWorkflowRule()
  );

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending Approval' | 'Approved' | 'Rejected'>('All');
  const [unreadOnly, setUnreadOnly] = useState(false);

  // Simulator Modal state
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [simName, setSimName] = useState('ANIKA TABASSUM CHOWDHURY');
  const [simClass, setSimClass] = useState('Class 8');
  const [simGroup, setSimGroup] = useState('General');
  const [simGuardian, setSimGuardian] = useState('DR. KAMRUL HASAN');
  const [simMobile, setSimMobile] = useState('01719876543');

  // Subscribe to real-time custom events for live synchronization
  useEffect(() => {
    const handleNotificationUpdate = () => {
      setNotifications(getAdmissionWorkflowNotifications());
    };

    window.addEventListener(ADMISSION_WORKFLOW_EVENT, handleNotificationUpdate);
    window.addEventListener('storage', handleNotificationUpdate);

    return () => {
      window.removeEventListener(ADMISSION_WORKFLOW_EVENT, handleNotificationUpdate);
      window.removeEventListener('storage', handleNotificationUpdate);
    };
  }, []);

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter(item => {
      const matchSearch =
        item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.applicationId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.appliedClass.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.guardianName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.guardianMobile.includes(searchQuery);

      const matchStatus = statusFilter === 'All' || item.status === statusFilter;
      const matchUnread = !unreadOnly || !item.read;

      return matchSearch && matchStatus && matchUnread;
    });
  }, [notifications, searchQuery, statusFilter, unreadOnly]);

  // Statistics
  const pendingCount = useMemo(() => 
    notifications.filter(n => n.status === 'Pending Approval').length,
    [notifications]
  );
  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.read).length,
    [notifications]
  );
  const approvedCount = useMemo(() => 
    notifications.filter(n => n.status === 'Approved').length,
    [notifications]
  );

  // Action handlers
  const handleMarkAsRead = (id: string) => {
    markWorkflowNotificationAsRead(id);
    setNotifications(getAdmissionWorkflowNotifications());
    addToast('Notification marked as read', 'info');
  };

  const handleMarkAllRead = () => {
    markAllWorkflowNotificationsAsRead();
    setNotifications(getAdmissionWorkflowNotifications());
    addToast('All workflow notifications marked as read', 'success');
  };

  const handleQuickApprove = (id: string, name: string) => {
    updateWorkflowNotificationStatus(id, 'Approved');
    setNotifications(getAdmissionWorkflowNotifications());
    addToast(`Admission for ${name} APPROVED! Confirmation SMS dispatched to guardian.`, 'success');
  };

  const handleQuickReject = (id: string, name: string) => {
    updateWorkflowNotificationStatus(id, 'Rejected');
    setNotifications(getAdmissionWorkflowNotifications());
    addToast(`Admission for ${name} marked as Rejected/Incomplete.`, 'error');
  };

  const handleSaveRules = (e: React.FormEvent) => {
    e.preventDefault();
    saveWorkflowRule(ruleConfig);
    addToast('Workflow Automation Rules updated and active!', 'success');
  };

  // Run the trigger simulator
  const handleRunSimulator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simName.trim()) {
      addToast('Please enter candidate name', 'error');
      return;
    }

    const created = triggerPendingApprovalWorkflow({
      studentName: simName,
      appliedClass: simClass,
      group: simGroup,
      guardianName: simGuardian,
      guardianMobile: simMobile
    });

    setNotifications(getAdmissionWorkflowNotifications());
    setIsSimulatorOpen(false);
    addToast(`Automated Trigger Executed: Form for ${created.studentName} reached 'Pending Approval'. Alert sent to Communication Center!`, 'success');
  };

  // Relative time helper
  const formatTimeAgo = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return new Date(isoString).toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="space-y-6" id="communication-center-container">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-indigo-900/50 relative overflow-hidden">
        {/* Background circuit glow */}
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-40 top-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Active Workflow Trigger
              </span>
              <span className="text-xs text-indigo-200 font-bold hidden sm:inline">
                Rule #RULE-ADM-001
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Communication Center & Automated Workflows
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Real-time administrative alerts dispatched automatically whenever student admission applications transition to{' '}
              <strong className="text-amber-400 font-black">‘Pending Approval’</strong> status, with multi-channel SMS and notification queues.
            </p>
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              id="simulate-trigger-modal-btn"
              variant="outline"
              size="sm"
              icon={Sparkles}
              onClick={() => setIsSimulatorOpen(true)}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md font-bold shadow-lg"
            >
              Test Workflow Trigger
            </Button>
            <Button
              id="view-pending-admissions-btn"
              variant="primary"
              size="sm"
              icon={ExternalLink}
              onClick={() => navigate('/school/students/admission-request')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-black shadow-lg shadow-indigo-600/30 border-none"
            >
              Admission Requests ({pendingCount})
            </Button>
          </div>
        </div>

        {/* Live Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-indigo-800/40">
          <div className="bg-white/5 backdrop-blur-xs rounded-xl p-3 border border-white/5">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Pending Approvals</span>
              <Clock size={14} className="text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400 mt-1">{pendingCount}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Forms requiring audit</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xs rounded-xl p-3 border border-white/5">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Unread Alerts</span>
              <Bell size={14} className="text-indigo-400" />
            </div>
            <div className="text-2xl font-black text-white mt-1">{unreadCount}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Admin notifications</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xs rounded-xl p-3 border border-white/5">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Approved Intake</span>
              <CheckCircle2 size={14} className="text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{approvedCount}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Enrolled candidates</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xs rounded-xl p-3 border border-white/5">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Trigger Pipeline</span>
              <Zap size={14} className="text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-cyan-400 mt-1">100%</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Automated dispatch rate</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            id="tab-alerts-btn"
            onClick={() => setActiveTab('alerts')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeTab === 'alerts'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Bell size={16} />
            <span>Admission Workflow Alerts</span>
            {pendingCount > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                activeTab === 'alerts' ? 'bg-white text-indigo-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {pendingCount}
              </span>
            )}
          </button>

          <button
            id="tab-rules-btn"
            onClick={() => setActiveTab('rules')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeTab === 'rules'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sliders size={16} />
            <span>Workflow Trigger Rules</span>
          </button>

          <button
            id="tab-logs-btn"
            onClick={() => setActiveTab('logs')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeTab === 'logs'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <MessageSquare size={16} />
            <span>SMS & Dispatch Ledger</span>
          </button>

          <button
            id="tab-broadcast-btn"
            onClick={() => setActiveTab('broadcast')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeTab === 'broadcast'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 ring-2 ring-indigo-300'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Radio size={16} className={activeTab === 'broadcast' ? 'text-white' : 'text-indigo-600'} />
            <span>Bulk SMS Broadcast</span>
            <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
              NEW
            </span>
          </button>

          <button
            id="tab-templates-btn"
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeTab === 'templates'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 ring-2 ring-indigo-300'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText size={16} />
            <span>SMS Templates</span>
          </button>

          <button
            id="tab-scheduled-btn"
            onClick={() => setActiveTab('scheduled')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeTab === 'scheduled'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-200 ring-2 ring-amber-300'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calendar size={16} />
            <span>Scheduled SMS</span>
          </button>
        </div>

        {activeTab === 'alerts' && unreadCount > 0 && (
          <button
            id="mark-all-read-top-btn"
            onClick={handleMarkAllRead}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline px-3 py-1.5"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* TAB 1: ADMISSION WORKFLOW ALERTS */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <Card className="p-4 border-slate-200 bg-white shadow-xs">
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="search-admission-alerts-input"
                  type="text"
                  placeholder="Filter by student name, application reference ID, class, or guardian phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs font-medium border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 ring-indigo-500 outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center rounded-lg border border-slate-200 p-1 bg-slate-50 text-xs font-bold">
                  {(['All', 'Pending Approval', 'Approved', 'Rejected'] as const).map(st => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1 rounded-md transition-all ${
                        statusFilter === st
                          ? 'bg-white text-indigo-700 shadow-2xs font-black'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                <button
                  id="toggle-unread-filter-btn"
                  onClick={() => setUnreadOnly(prev => !prev)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                    unreadOnly
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Unread ({unreadCount})
                </button>
              </div>
            </div>
          </Card>

          {/* Workflow Automation Alert Notice Banner */}
          <div className="p-4 bg-indigo-50/70 border border-indigo-200/80 rounded-xl flex items-start gap-3">
            <div className="p-2 bg-indigo-600 text-white rounded-lg shrink-0 mt-0.5">
              <Zap size={18} />
            </div>
            <div className="text-xs text-indigo-950 space-y-1">
              <p className="font-black uppercase tracking-wider text-indigo-700">
                Automated Trigger Architecture Active
              </p>
              <p className="leading-relaxed">
                Whenever a student or guardian completes the <strong>Student Admission Form</strong>, or whenever an application transitions to <strong>‘Pending Approval’</strong>, this communication pipeline automatically logs the dossier here, triggers the top navigation badge, and queues an SMS delivery confirmation to the guardian.
              </p>
            </div>
          </div>

          {/* Alert Feed List */}
          {filteredNotifications.length === 0 ? (
            <Card className="p-12 text-center bg-white border-slate-200">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Bell size={24} />
              </div>
              <h4 className="text-base font-bold text-slate-700">No Admission Alerts Found</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                {searchQuery || statusFilter !== 'All' || unreadOnly
                  ? 'No notifications match the active filter criteria. Try resetting the filters.'
                  : 'There are currently no admission workflow triggers logged.'}
              </p>
              {(searchQuery || statusFilter !== 'All' || unreadOnly) && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('All');
                    setUnreadOnly(false);
                  }}
                  className="mt-4 text-xs font-bold"
                >
                  Clear Filters
                </Button>
              )}
            </Card>
          ) : (
            <div className="space-y-3" id="admission-alerts-list">
              {filteredNotifications.map((alert) => (
                <Card
                  key={alert.id}
                  id={`alert-card-${alert.id}`}
                  className={`p-4 sm:p-5 transition-all border ${
                    !alert.read
                      ? 'border-indigo-300 bg-white shadow-md ring-1 ring-indigo-50'
                      : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    {/* Left: Indicator & Content */}
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      {/* Priority Status Icon */}
                      <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                        alert.status === 'Pending Approval'
                          ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-200'
                          : alert.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}>
                        {alert.status === 'Pending Approval' ? (
                          <Clock size={20} className="animate-pulse" />
                        ) : alert.status === 'Approved' ? (
                          <CheckCircle2 size={20} />
                        ) : (
                          <AlertTriangle size={20} />
                        )}
                      </div>

                      {/* Main Alert Body */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            alert.status === 'Pending Approval'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : alert.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}>
                            {alert.status}
                          </span>

                          <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {alert.applicationId}
                          </span>

                          <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                            {alert.appliedClass} {alert.group ? `• ${alert.group}` : ''}
                          </span>

                          <span className="text-xs text-slate-400 font-medium ml-auto">
                            {formatTimeAgo(alert.timestamp)}
                          </span>
                        </div>

                        {/* Candidate & Guardian Meta */}
                        <div className="pt-1">
                          <h3 className="text-base font-black text-slate-900 tracking-tight">
                            {alert.studentName}
                            {alert.studentNameNative && (
                              <span className="text-slate-500 text-xs font-semibold ml-2">
                                ({alert.studentNameNative})
                              </span>
                            )}
                          </h3>
                          <p className="text-xs text-slate-600 font-medium leading-relaxed mt-0.5">
                            {alert.message}
                          </p>
                        </div>

                        {/* Dispatch Metadata Badges */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-2 text-xs text-slate-500">
                          <div className="flex items-center gap-1.5 font-bold text-slate-700">
                            <User size={13} className="text-slate-400" />
                            <span>Guardian: {alert.guardianName}</span>
                          </div>

                          <div className="flex items-center gap-1.5 font-mono text-slate-600">
                            <Smartphone size={13} className="text-slate-400" />
                            <span>{alert.guardianMobile}</span>
                          </div>

                          {alert.smsDelivered && (
                            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <Check size={12} />
                              <span>SMS Delivered ({alert.smsReceiptId})</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Quick Review / Approval Actions */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 w-full sm:w-auto">
                      <div className="flex items-center gap-2">
                        {alert.status === 'Pending Approval' && (
                          <>
                            <Button
                              id={`quick-approve-btn-${alert.id}`}
                              size="sm"
                              variant="primary"
                              icon={Check}
                              onClick={() => handleQuickApprove(alert.id, alert.studentName)}
                              className="h-8 text-xs font-black bg-emerald-600 hover:bg-emerald-700 border-none shadow-xs"
                            >
                              Approve
                            </Button>
                            <Button
                              id={`quick-reject-btn-${alert.id}`}
                              size="sm"
                              variant="danger"
                              icon={X}
                              onClick={() => handleQuickReject(alert.id, alert.studentName)}
                              className="h-8 text-xs font-black shadow-xs"
                            >
                              Reject
                            </Button>
                          </>
                        )}

                        <Button
                          id={`review-dossier-btn-${alert.id}`}
                          size="sm"
                          variant="outline"
                          icon={ExternalLink}
                          onClick={() => navigate('/school/students/admission-request')}
                          className="h-8 text-xs font-bold border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                        >
                          Review Dossier
                        </Button>
                      </div>

                      {!alert.read && (
                        <button
                          id={`mark-read-btn-${alert.id}`}
                          onClick={() => handleMarkAsRead(alert.id)}
                          className="text-[11px] font-bold text-slate-400 hover:text-slate-700 mt-1"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TRIGGER RULES CONFIGURATION */}
      {activeTab === 'rules' && (
        <div className="space-y-6">
          <Card className="p-6 border-slate-200 bg-white">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700">
                <Sliders size={22} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-800">
                  Admission Workflow Trigger Rule Configuration
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  Define automated actions, dispatch channels, and notification behavior for incoming student admissions.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveRules} className="space-y-6 pt-6">
              {/* Visual Workflow Flowchart */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <p className="text-xs font-black uppercase text-slate-500 tracking-wider">
                  Automated Pipeline Architecture
                </p>
                <div className="flex flex-col md:flex-row items-center gap-3 text-xs">
                  <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-2xs text-center flex-1 w-full">
                    <span className="block text-[10px] font-black uppercase text-indigo-600">Event Source</span>
                    <strong className="font-bold text-slate-800">Student Admission Form</strong>
                    <span className="block text-slate-400 text-[10px]">Filled via Portal or Admin</span>
                  </div>

                  <ArrowRight size={18} className="text-slate-400 shrink-0 hidden md:block" />

                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl shadow-2xs text-center flex-1 w-full">
                    <span className="block text-[10px] font-black uppercase text-amber-700">Condition Check</span>
                    <strong className="font-bold text-amber-900">Status == 'Pending Approval'</strong>
                    <span className="block text-amber-700 text-[10px]">Required fields & signatures verified</span>
                  </div>

                  <ArrowRight size={18} className="text-slate-400 shrink-0 hidden md:block" />

                  <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl shadow-2xs text-center flex-1 w-full">
                    <span className="block text-[10px] font-black uppercase text-indigo-700">Workflow Trigger</span>
                    <strong className="font-bold text-indigo-950">Dispatch Admin Alert + SMS</strong>
                    <span className="block text-indigo-600 text-[10px]">Communication Center + Guardian Receipt</span>
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-slate-200 rounded-xl flex items-center justify-between gap-4 bg-slate-50/50">
                  <div className="space-y-0.5">
                    <label className="text-xs font-black text-slate-800">
                      Auto-Notify School Admin
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Create urgent alert in Communication Center and top navigation bar
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={ruleConfig.enabled}
                    onChange={(e) => setRuleConfig({ ...ruleConfig, enabled: e.target.checked })}
                    className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>

                <div className="p-4 border border-slate-200 rounded-xl flex items-center justify-between gap-4 bg-slate-50/50">
                  <div className="space-y-0.5">
                    <label className="text-xs font-black text-slate-800">
                      Auto-Send SMS Receipt to Guardian
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Queue immediate acknowledgment SMS upon form submission
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={ruleConfig.autoSmsGuardian}
                    onChange={(e) => setRuleConfig({ ...ruleConfig, autoSmsGuardian: e.target.checked })}
                    className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>

                <div className="p-4 border border-slate-200 rounded-xl flex items-center justify-between gap-4 bg-slate-50/50">
                  <div className="space-y-0.5">
                    <label className="text-xs font-black text-slate-800">
                      Top Navigation Bell Counter
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Increment unread counter badge on the main dashboard header
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={ruleConfig.priorityBadge}
                    onChange={(e) => setRuleConfig({ ...ruleConfig, priorityBadge: e.target.checked })}
                    className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>

                <div className="p-4 border border-slate-200 rounded-xl flex items-center justify-between gap-4 bg-slate-50/50">
                  <div className="space-y-0.5">
                    <label className="text-xs font-black text-slate-800">
                      Auditory Chime Alert
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Play subtle Web Audio tone when new pending approval trigger fires
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={ruleConfig.soundAlert}
                    onChange={(e) => setRuleConfig({ ...ruleConfig, soundAlert: e.target.checked })}
                    className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* SMS Template Customization */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Automated Guardian SMS Message Template
                </label>
                <textarea
                  rows={3}
                  value={ruleConfig.smsTemplate}
                  onChange={(e) => setRuleConfig({ ...ruleConfig, smsTemplate: e.target.value })}
                  className="w-full text-xs font-mono p-3 border border-slate-200 rounded-xl focus:ring-2 ring-indigo-500 outline-none bg-slate-50"
                />
                <p className="text-[11px] text-slate-500 flex items-center gap-2">
                  <Info size={12} className="text-indigo-600" />
                  Available tags: <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600">[Guardian]</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600">[Student]</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600">[Class]</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600">[AppID]</code>
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  type="submit"
                  variant="primary"
                  icon={SaveIcon}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 shadow-md shadow-indigo-100"
                >
                  Save Trigger Configuration
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* TAB 3: SMS & DISPATCH LOGS */}
      {activeTab === 'logs' && (
        <Card className="p-0 border-slate-200 bg-white overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="text-sm font-black text-slate-800">
                Automated Dispatch & Communication Ledger
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Audit trail of automated SMS notifications sent to candidates and guardians upon Pending Approval transition
              </p>
            </div>
            <div className="text-xs text-slate-500 font-bold bg-slate-100 px-3 py-1 rounded-full">
              Total Logged: {notifications.length}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-black tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3">Receipt / Ref</th>
                  <th className="px-6 py-3">Recipient & Mobile</th>
                  <th className="px-6 py-3">Trigger Event</th>
                  <th className="px-6 py-3">Application Status</th>
                  <th className="px-6 py-3">Delivery Status</th>
                  <th className="px-6 py-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {notifications.map((n) => (
                  <tr key={n.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-3 font-mono font-bold text-slate-700">
                      {n.smsReceiptId || n.applicationId}
                    </td>
                    <td className="px-6 py-3">
                      <div className="font-bold text-slate-800">{n.guardianName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{n.guardianMobile}</div>
                    </td>
                    <td className="px-6 py-3">
                      <span className="font-medium text-slate-700">
                        {n.studentName} ({n.appliedClass})
                      </span>
                      <div className="text-[10px] text-indigo-600 font-bold">
                        Form reached Pending Approval
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <Badge color={n.status === 'Pending Approval' ? 'yellow' : n.status === 'Approved' ? 'green' : 'red'}>
                        {n.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-600 text-[11px]">
                        <Check size={12} />
                        Delivered
                      </span>
                    </td>
                    <td className="px-6 py-3 text-slate-500 font-mono text-[11px]">
                      {new Date(n.timestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 4: BULK SMS BROADCAST */}
      {activeTab === 'broadcast' && (
        <SMSBroadcastModule />
      )}

      {/* TAB 5: SMS TEMPLATES LIBRARY */}
      {activeTab === 'templates' && (
        <Card className="p-6 border-slate-200 bg-white shadow-xs">
          <SMSTemplateManager
            onSelectTemplate={(tmpl) => {
              setActiveTab('broadcast');
            }}
          />
        </Card>
      )}

      {/* TAB 6: SCHEDULED SMS QUEUE */}
      {activeTab === 'scheduled' && (
        <Card className="p-6 border-slate-200 bg-white shadow-xs">
          <SMSScheduledManager onScheduleNew={() => setActiveTab('broadcast')} />
        </Card>
      )}

      {/* MODAL: INTERACTIVE TRIGGER SIMULATOR */}
      <Modal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        title="Simulate 'Pending Approval' Workflow Trigger"
        size="md"
      >
        <form onSubmit={handleRunSimulator} className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
            <strong>How this works:</strong> This simulator mimics an external applicant or parent completing a student admission form. When triggered, the form is set to <strong>‘Pending Approval’</strong>, which immediately fires the automated workflow trigger, dispatches a new alert to this Communication Center, increments the navigation bell, and logs the SMS dispatch.
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-600">Candidate Student Name *</label>
              <input
                id="sim-student-name-input"
                type="text"
                required
                value={simName}
                onChange={(e) => setSimName(e.target.value)}
                className="w-full text-xs font-bold border border-slate-200 rounded-lg p-2.5 mt-1 outline-none focus:ring-2 ring-indigo-500 bg-slate-50 uppercase"
                placeholder="e.g. SADIA SULTANA"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600">Applied Class *</label>
                <select
                  value={simClass}
                  onChange={(e) => setSimClass(e.target.value)}
                  className="w-full text-xs font-bold border border-slate-200 rounded-lg p-2.5 mt-1 outline-none focus:ring-2 ring-indigo-500 bg-slate-50"
                >
                  <option>Class 6</option>
                  <option>Class 7</option>
                  <option>Class 8</option>
                  <option>Class 9</option>
                  <option>Class 10</option>
                  <option>Class 11</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600">Academic Group</label>
                <select
                  value={simGroup}
                  onChange={(e) => setSimGroup(e.target.value)}
                  className="w-full text-xs font-bold border border-slate-200 rounded-lg p-2.5 mt-1 outline-none focus:ring-2 ring-indigo-500 bg-slate-50"
                >
                  <option>General</option>
                  <option>Science</option>
                  <option>Commerce</option>
                  <option>Humanities</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-600">Guardian Name</label>
                <input
                  type="text"
                  value={simGuardian}
                  onChange={(e) => setSimGuardian(e.target.value)}
                  className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 mt-1 outline-none focus:ring-2 ring-indigo-500 bg-slate-50"
                  placeholder="e.g. DR. KAMRUL HASAN"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600">Guardian Mobile *</label>
                <input
                  type="tel"
                  required
                  value={simMobile}
                  onChange={(e) => setSimMobile(e.target.value)}
                  className="w-full text-xs font-mono border border-slate-200 rounded-lg p-2.5 mt-1 outline-none focus:ring-2 ring-indigo-500 bg-slate-50"
                  placeholder="017XXXXXXXX"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsSimulatorOpen(false)}
            >
              Cancel
            </Button>
            <Button
              id="confirm-simulate-trigger-btn"
              type="submit"
              variant="primary"
              size="sm"
              icon={Zap}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-md shadow-indigo-100"
            >
              Fire Workflow Trigger
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

function SaveIcon(props: any) {
  return <Check {...props} />;
}
