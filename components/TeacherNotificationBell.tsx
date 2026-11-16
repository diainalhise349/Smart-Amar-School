import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, CheckCircle2, XCircle, Clock, CalendarRange, 
  MessageSquare, UserCheck, ShieldCheck, CheckCheck, 
  ExternalLink, Sparkles, Filter, X, ChevronRight, AlertTriangle
} from 'lucide-react';
import { 
  TeacherLeaveNotification, 
  getTeacherLeaveNotifications, 
  markTeacherLeaveNotificationAsRead, 
  markAllTeacherLeaveNotificationsAsRead, 
  subscribeToTeacherLeaveNotifications, 
  simulateTeacherLeaveStatusChange 
} from '../utils/leaveWorkflow';
import { useToast } from './UIComponents';

interface TeacherNotificationBellProps {
  teacherId?: string;
  variant?: 'navbar' | 'compact' | 'prominent';
  showQuickTestControls?: boolean;
  className?: string;
  onSelectNotification?: (notification: TeacherLeaveNotification) => void;
}

export const TeacherNotificationBell: React.FC<TeacherNotificationBellProps> = ({
  teacherId = 'EMP-001',
  variant = 'navbar',
  showQuickTestControls = true,
  className = '',
  onSelectNotification
}) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<TeacherLeaveNotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'Approved' | 'Rejected'>('all');
  const [activeDetailModal, setActiveDetailModal] = useState<TeacherLeaveNotification | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync notifications from local storage and cross-window events
  const loadNotifications = () => {
    const list = getTeacherLeaveNotifications(teacherId);
    setNotifications(list);
  };

  useEffect(() => {
    loadNotifications();
    const unsubscribe = subscribeToTeacherLeaveNotifications(loadNotifications);
    return () => unsubscribe();
  }, [teacherId]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const approvedCount = notifications.filter(n => n.newStatus === 'Approved').length;
  const rejectedCount = notifications.filter(n => n.newStatus === 'Rejected').length;

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'Approved') return n.newStatus === 'Approved';
    if (filter === 'Rejected') return n.newStatus === 'Rejected';
    return true;
  });

  const handleMarkAllRead = () => {
    markAllTeacherLeaveNotificationsAsRead(teacherId);
    loadNotifications();
    showToast('All leave status notifications marked as read.', 'info');
  };

  const handleNotificationClick = (notification: TeacherLeaveNotification) => {
    if (!notification.read) {
      markTeacherLeaveNotificationAsRead(notification.id);
      loadNotifications();
    }
    if (onSelectNotification) {
      onSelectNotification(notification);
    } else {
      setActiveDetailModal(notification);
    }
  };

  const handleNavigateToLeave = (leaveId: string) => {
    setIsOpen(false);
    navigate(`/teacher/leave?highlight=${leaveId}`);
  };

  const handleRunSimulation = (decision: 'Approved' | 'Rejected') => {
    setIsSimulating(true);
    try {
      const res = simulateTeacherLeaveStatusChange(teacherId, decision);
      if (res.success) {
        showToast(
          decision === 'Approved' 
            ? `🔔 Leave Request Approved! Notification sent.` 
            : `🔔 Leave Request Declined! Notification sent.`,
          decision === 'Approved' ? 'success' : 'info'
        );
        loadNotifications();
      }
    } catch (err) {
      console.error(err);
      showToast('Simulation failed', 'error');
    } finally {
      setIsSimulating(false);
    }
  };

  const formatRelativeTime = (isoString: string): string => {
    try {
      const now = new Date();
      const past = new Date(isoString);
      const diffMs = now.getTime() - past.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHrs = Math.floor(diffMin / 60);
      const diffDays = Math.floor(diffHrs / 24);

      if (diffSec < 60) return 'Just now';
      if (diffMin < 60) return `${diffMin}m ago`;
      if (diffHrs < 24) return `${diffHrs}h ago`;
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  };

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      {/* Bell Button */}
      {variant === 'navbar' && (
        <button
          id="teacher-leave-notification-bell-btn"
          onClick={() => setIsOpen(!isOpen)}
          className={`p-2 rounded-full transition-all duration-200 relative group cursor-pointer ${
            isOpen 
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          }`}
          title="Teacher Leave Request Alerts & Status Updates"
          aria-label="Teacher Leave Notifications"
        >
          <Bell size={18} className="transition-transform group-hover:rotate-12" />
          
          {unreadCount > 0 && (
            <>
              <span className="absolute -top-1 -right-1 min-w-[19px] h-[19px] bg-rose-600 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 border-2 border-white shadow-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping opacity-75"></span>
            </>
          )}
        </button>
      )}

      {variant === 'prominent' && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-xs cursor-pointer ${
            isOpen
              ? 'bg-indigo-600 text-white border-indigo-600'
              : unreadCount > 0
              ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
          }`}
        >
          <div className="relative">
            <Bell size={15} className={unreadCount > 0 ? 'text-amber-700' : 'text-slate-500'} />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-2 h-2 bg-rose-600 rounded-full animate-pulse"></span>
            )}
          </div>
          <span>Leave Alerts</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white leading-none">
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {variant === 'compact' && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg relative transition-colors"
          title="Leave Notifications"
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full"></span>
          )}
        </button>
      )}

      {/* Flyout Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-84 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-500/20 rounded-lg border border-indigo-400/30 text-indigo-300">
                <Bell size={16} />
              </div>
              <div>
                <h3 className="text-xs font-black tracking-tight text-white flex items-center gap-1.5">
                  <span>Leave Status Alerts</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[9.5px] font-black bg-rose-500 text-white">
                      {unreadCount} New
                    </span>
                  )}
                </h3>
                <p className="text-[10px] text-slate-300">
                  Real-time updates on your leave approvals & rejections
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="px-2 py-1 text-[10px] font-bold text-indigo-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1"
                  title="Mark all notifications as read"
                >
                  <CheckCheck size={12} />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Quick Interactive Testing Simulator Bar */}
          {showQuickTestControls && (
            <div className="px-3.5 py-2 bg-indigo-50/70 border-b border-indigo-100 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1 text-indigo-950 font-bold">
                <Sparkles size={12} className="text-indigo-600" />
                <span className="text-[10.5px]">Test Real-time Alerts:</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleRunSimulation('Approved')}
                  disabled={isSimulating}
                  className="px-2 py-1 rounded-md text-[10px] font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                  title="Simulate Admin Approving your Pending Leave"
                >
                  <CheckCircle2 size={11} />
                  <span>+ Test Approval</span>
                </button>
                <button
                  onClick={() => handleRunSimulation('Rejected')}
                  disabled={isSimulating}
                  className="px-2 py-1 rounded-md text-[10px] font-black bg-rose-600 hover:bg-rose-700 text-white shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                  title="Simulate Admin Declining your Pending Leave"
                >
                  <XCircle size={11} />
                  <span>+ Test Rejection</span>
                </button>
              </div>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="px-3.5 py-2 border-b border-slate-100 bg-slate-50 flex items-center gap-1 overflow-x-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all ${
                filter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all ${
                filter === 'unread'
                  ? 'bg-rose-600 text-white'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('Approved')}
              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all ${
                filter === 'Approved'
                  ? 'bg-emerald-600 text-white'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              Approved ({approvedCount})
            </button>
            <button
              onClick={() => setFilter('Rejected')}
              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold transition-all ${
                filter === 'Rejected'
                  ? 'bg-rose-700 text-white'
                  : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              Declined ({rejectedCount})
            </button>
          </div>

          {/* Notifications Scroll List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-2">
                  <Bell size={20} />
                </div>
                <p className="text-xs font-bold text-slate-700">No leave status notifications</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  When School Administration reviews your leave requests, you will receive real-time notifications here.
                </p>
              </div>
            ) : (
              filteredNotifications.map((notif) => {
                const isApproved = notif.newStatus === 'Approved';

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3.5 text-xs transition-colors cursor-pointer relative hover:bg-slate-50 flex items-start gap-3 ${
                      !notif.read ? 'bg-indigo-50/40' : 'bg-white'
                    }`}
                  >
                    {/* Status Icon */}
                    <div className="shrink-0 mt-0.5">
                      {isApproved ? (
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-2xs">
                          <CheckCircle2 size={18} />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shadow-2xs">
                          <XCircle size={18} />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              isApproved
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-rose-100 text-rose-800 border border-rose-300'
                            }`}
                          >
                            {isApproved ? 'Approved' : 'Declined'}
                          </span>
                          <span className="font-mono font-bold text-[11px] text-slate-800">
                            {notif.leaveId}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          {formatRelativeTime(notif.createdAt)}
                        </span>
                      </div>

                      <p className="text-[11.5px] font-bold text-slate-900 leading-snug">
                        {isApproved ? (
                          <span>Your <strong className="text-emerald-700">{notif.leaveType} Leave</strong> was approved!</span>
                        ) : (
                          <span>Your <strong className="text-rose-700">{notif.leaveType} Leave</strong> was declined.</span>
                        )}
                      </p>

                      <div className="text-[10.5px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <CalendarRange size={11} className="text-slate-400" />
                          <span>{notif.startDate} to {notif.endDate} ({notif.daysCount}d)</span>
                        </span>
                      </div>

                      {/* Official Administrator Remark */}
                      {notif.adminComment && (
                        <div className="mt-2 p-2 rounded-lg bg-slate-100/90 border-l-2 border-indigo-500 text-[11px] text-slate-700 italic">
                          "{notif.adminComment}"
                        </div>
                      )}

                      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100/60">
                        <span className="truncate">Reviewed by: {notif.reviewedBy}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNavigateToLeave(notif.leaveId);
                          }}
                          className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5 shrink-0"
                        >
                          <span>View Leave</span>
                          <ChevronRight size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Unread indicator */}
                    {!notif.read && (
                      <div className="shrink-0 self-center">
                        <span className="w-2 h-2 rounded-full bg-indigo-600 block shadow-xs" title="Unread"></span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Action */}
          <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate('/teacher/leave');
              }}
              className="text-indigo-600 hover:text-indigo-800 font-black text-[11px] flex items-center gap-1"
            >
              <span>Go to Leave Portal</span>
              <ExternalLink size={12} />
            </button>
            <span className="text-[10.5px] text-slate-400">
              Synced with Admin Sanctions
            </span>
          </div>
        </div>
      )}

      {/* Detail Dialog for clicked notification */}
      {activeDetailModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                {activeDetailModal.newStatus === 'Approved' ? (
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                    <CheckCircle2 size={20} />
                  </div>
                ) : (
                  <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
                    <XCircle size={20} />
                  </div>
                )}
                <div>
                  <h3 className="font-black text-sm text-slate-900">Leave Application Status Alert</h3>
                  <p className="text-[11px] text-slate-500 font-mono">Ref: {activeDetailModal.leaveId}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveDetailModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Status Decision</span>
                  <span
                    className={`inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-xs font-black ${
                      activeDetailModal.newStatus === 'Approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {activeDetailModal.newStatus}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Leave Category</span>
                  <span className="font-bold text-slate-800">{activeDetailModal.leaveType} Leave</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl">
                <div>
                  <span className="text-[10px] text-slate-400 block">Duration & Dates</span>
                  <span className="font-bold text-slate-800">
                    {activeDetailModal.startDate} to {activeDetailModal.endDate} ({activeDetailModal.daysCount} days)
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Reviewed At</span>
                  <span className="font-bold text-slate-800">
                    {new Date(activeDetailModal.reviewedAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-700 block mb-1">
                  Official Administrative Remarks & Instructions:
                </span>
                <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-slate-800 italic leading-relaxed">
                  "{activeDetailModal.adminComment}"
                </div>
              </div>

              <div className="text-[11px] text-slate-500 pt-1">
                Sanctioned by: <strong className="text-slate-800">{activeDetailModal.reviewedBy}</strong>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  const id = activeDetailModal.leaveId;
                  setActiveDetailModal(null);
                  handleNavigateToLeave(id);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-colors flex items-center gap-1.5"
              >
                <CalendarRange size={14} />
                <span>Open in Leave Portal</span>
              </button>
              <button
                onClick={() => setActiveDetailModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
