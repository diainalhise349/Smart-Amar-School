import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, CheckCircle2, XCircle, ArrowRight, X, Sparkles, CalendarRange, Clock 
} from 'lucide-react';
import { 
  TeacherLeaveNotification, 
  getTeacherLeaveNotifications, 
  markTeacherLeaveNotificationAsRead, 
  subscribeToTeacherLeaveNotifications 
} from '../utils/leaveWorkflow';

interface TeacherLeaveStatusBannerProps {
  teacherId?: string;
  onOpenDetails?: (notification: TeacherLeaveNotification) => void;
  className?: string;
}

export const TeacherLeaveStatusBanner: React.FC<TeacherLeaveStatusBannerProps> = ({
  teacherId = 'EMP-001',
  onOpenDetails,
  className = ''
}) => {
  const navigate = useNavigate();
  const [unreadNotifications, setUnreadNotifications] = useState<TeacherLeaveNotification[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  const loadAlerts = () => {
    const list = getTeacherLeaveNotifications(teacherId);
    setUnreadNotifications(list.filter(n => !n.read));
  };

  useEffect(() => {
    loadAlerts();
    const unsubscribe = subscribeToTeacherLeaveNotifications(loadAlerts);
    return () => unsubscribe();
  }, [teacherId]);

  const activeAlerts = unreadNotifications.filter(n => !dismissedIds.includes(n.id));

  if (activeAlerts.length === 0) return null;

  const latestAlert = activeAlerts[0];
  const isApproved = latestAlert.newStatus === 'Approved';

  const handleDismiss = () => {
    setDismissedIds(prev => [...prev, latestAlert.id]);
    markTeacherLeaveNotificationAsRead(latestAlert.id);
  };

  const handleView = () => {
    markTeacherLeaveNotificationAsRead(latestAlert.id);
    if (onOpenDetails) {
      onOpenDetails(latestAlert);
    } else {
      navigate(`/teacher/leave?highlight=${latestAlert.leaveId}`);
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-4 shadow-sm transition-all duration-300 animate-in slide-in-from-top-2 ${
        isApproved
          ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/60 border-emerald-300 text-emerald-950'
          : 'bg-gradient-to-r from-rose-50 via-pink-50 to-rose-100/60 border-rose-300 text-rose-950'
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`p-2.5 rounded-xl shrink-0 ${
              isApproved
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
            }`}
          >
            {isApproved ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  isApproved
                    ? 'bg-emerald-200/80 text-emerald-900 border border-emerald-400'
                    : 'bg-rose-200/80 text-rose-900 border border-rose-400'
                }`}
              >
                Status Alert: {isApproved ? 'Approved by Admin' : 'Declined by Admin'}
              </span>
              <span className="text-xs font-mono font-bold text-slate-800">
                {latestAlert.leaveId}
              </span>
              {activeAlerts.length > 1 && (
                <span className="text-[10.5px] font-bold text-slate-600 bg-white/70 px-2 py-0.5 rounded-full border border-slate-200">
                  +{activeAlerts.length - 1} more alert{activeAlerts.length > 2 ? 's' : ''}
                </span>
              )}
            </div>

            <p className="text-xs font-bold leading-relaxed">
              {isApproved ? (
                <span>
                  Your application for <strong>{latestAlert.leaveType} Leave</strong> ({latestAlert.startDate} to {latestAlert.endDate}, {latestAlert.daysCount} days) has been officially sanctioned.
                </span>
              ) : (
                <span>
                  Your request for <strong>{latestAlert.leaveType} Leave</strong> ({latestAlert.startDate} to {latestAlert.endDate}) was reviewed and declined by School Administration.
                </span>
              )}
            </p>

            {latestAlert.adminComment && (
              <p className="text-[11px] italic text-slate-700 bg-white/60 p-2 rounded-lg border border-slate-200/50">
                Remark: "{latestAlert.adminComment}"
              </p>
            )}

            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={handleView}
                className={`text-xs font-black flex items-center gap-1 hover:underline cursor-pointer ${
                  isApproved ? 'text-emerald-800' : 'text-rose-800'
                }`}
              >
                <span>View Full Details & Timeline</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-black/5 transition-colors shrink-0"
          title="Dismiss notification"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
