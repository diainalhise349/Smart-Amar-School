import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, CheckCircle2, XCircle, Clock, BookOpen, 
  Award, Megaphone, Send, CheckCheck, 
  ExternalLink, Sparkles, Filter, X, ChevronRight, 
  AlertTriangle, Calendar, Plus, RefreshCw, Volume2, VolumeX,
  FileText, Check, Trash2, Users, School, Layers, Radio,
  BellRing, Monitor, Settings, Eye, UserCheck
} from 'lucide-react';
import { 
  CentralNotification, 
  NotificationCategory, 
  NotificationPriority, 
  NotificationTargetRole, 
  useNotifications 
} from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from './UIComponents';
import { UserRole } from '../types';

interface CentralNotificationBellProps {
  variant?: 'navbar' | 'compact' | 'prominent';
  className?: string;
  onOpenBroadcastModal?: () => void;
}

export const CentralNotificationBell: React.FC<CentralNotificationBellProps> = ({
  variant = 'navbar',
  className = '',
  onOpenBroadcastModal
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const { showToast } = useToast();
  const { 
    getNotificationsForRole, 
    getUnreadCountForRole, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    triggerTestAlert,
    desktopPermission,
    desktopAlertsEnabled,
    soundAlertsEnabled,
    requestDesktopPermission,
    toggleDesktopAlerts,
    toggleSoundAlerts,
    testDesktopNotification
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'homework' | 'exam_result' | 'announcement'>('all');
  const [selectedNotification, setSelectedNotification] = useState<CentralNotification | null>(null);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const role = user?.role || UserRole.STUDENT;
  const studentClass = user?.studentClass || user?.studentData?.class || 'Class 10';

  // Get notifications filtered for the active user's role and class
  const roleNotifications = useMemo(() => {
    return getNotificationsForRole(role, studentClass);
  }, [getNotificationsForRole, role, studentClass]);

  const unreadCount = useMemo(() => {
    return getUnreadCountForRole(role, studentClass);
  }, [getUnreadCountForRole, role, studentClass]);

  // Tab counts
  const homeworkCount = roleNotifications.filter(n => n.type === 'homework').length;
  const examResultCount = roleNotifications.filter(n => n.type === 'exam_result').length;
  const announcementCount = roleNotifications.filter(n => n.type === 'announcement').length;

  const filteredNotifications = useMemo(() => {
    if (activeTab === 'all') return roleNotifications;
    return roleNotifications.filter(n => n.type === activeTab);
  }, [roleNotifications, activeTab]);

  // Close dropdown when clicking outside
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

  const isBengali = language === 'bn';

  const readerDetails = useMemo(() => ({
    readerId: user?.id,
    readerName: user?.name || (role === UserRole.STUDENT ? 'Student' : role === UserRole.PARENT ? 'Parent' : role === UserRole.TEACHER ? 'Faculty' : 'Admin'),
    readerRole: role,
    readerClass: studentClass
  }), [user?.id, user?.name, role, studentClass]);

  const handleNotificationClick = (item: CentralNotification) => {
    markAsRead(item.id, role, readerDetails);
    
    // Ensure selected modal receives immediate read status
    const currentReceipts = item.readReceipts ? [...item.readReceipts] : [];
    const alreadyHasReceipt = currentReceipts.some(r => 
      (user?.id && r.readerId === user.id) || (r.readerRole === role && r.readerName === readerDetails.readerName)
    );
    if (!alreadyHasReceipt) {
      currentReceipts.push({
        readerId: user?.id,
        readerName: readerDetails.readerName,
        readerRole: role,
        readerClass: studentClass,
        readAt: new Date().toISOString()
      });
    }

    setSelectedNotification({
      ...item,
      readBy: item.readBy.includes(String(role).toLowerCase()) ? item.readBy : [...item.readBy, String(role).toLowerCase()],
      readReceipts: currentReceipts
    });
  };

  const handleActionClick = (e: React.MouseEvent, item: CentralNotification) => {
    e.stopPropagation();
    markAsRead(item.id, role, readerDetails);
    setIsOpen(false);
    if (item.actionUrl) {
      navigate(item.actionUrl);
    }
  };

  const handleMarkAllRead = () => {
    markAllAsRead(role, readerDetails);
    showToast(isBengali ? 'সকল নোটিফিকেশন পঠিত হিসেবে চিহ্নিত করা হয়েছে' : 'All notifications marked as read', 'info');
  };

  const getRelativeTime = (isoString: string) => {
    const diff = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (isBengali) {
      if (minutes < 1) return 'এইমাত্র';
      if (minutes < 60) return `${minutes} মিনিট আগে`;
      if (hours < 24) return `${hours} ঘণ্টা আগে`;
      return `${days} দিন আগে`;
    }
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // Role display label
  const getRoleBadge = (r: UserRole | string) => {
    const rLower = String(r).toLowerCase();
    if (rLower.includes('student')) return isBengali ? 'শিক্ষার্থী' : 'Student';
    if (rLower.includes('parent')) return isBengali ? 'অভিভাবক' : 'Parent';
    if (rLower.includes('teacher')) return isBengali ? 'শিক্ষক' : 'Teacher';
    return isBengali ? 'এডমিন' : 'Admin';
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Bell Trigger Button */}
      {variant === 'prominent' ? (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer relative shadow-sm"
          title={isBengali ? 'নোটিফিকেশন সেন্টার' : 'Central Notification Center'}
        >
          <div className="relative">
            <Bell size={18} className={unreadCount > 0 ? 'text-amber-300 animate-pulse' : 'text-white'} />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] bg-rose-600 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 border-2 border-slate-900 shadow-md animate-bounce">
                {unreadCount}
              </span>
            )}
          </div>
          <span className="text-xs font-bold hidden sm:inline">
            {isBengali ? 'অ্যালার্ট ও নোটিশ' : 'Alerts & Notices'}
          </span>
          {unreadCount > 0 && (
            <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
              {unreadCount} {isBengali ? 'নতুন' : 'new'}
            </span>
          )}
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors relative cursor-pointer"
          title={isBengali ? 'কেন্দ্রীয় নোটিফিকেশন সেন্টার' : 'Centralized Notification Center'}
        >
          <Bell size={18} className={unreadCount > 0 ? 'text-indigo-600' : 'text-slate-600'} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-rose-600 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 border-2 border-white shadow-xs animate-bounce">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      )}

      {/* Flyout Notification Dropdown */}
      {isOpen && (
        <div className="fixed sm:absolute right-2 sm:right-0 top-16 sm:top-full mt-2 w-[94vw] sm:w-[440px] max-w-[460px] bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 overflow-hidden flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="px-4 pb-3 border-b border-slate-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <Bell size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  {isBengali ? 'নোটিফিকেশন সেন্টার' : 'Notification Center'}
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                    {getRoleBadge(role)}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  {unreadCount > 0
                    ? `${unreadCount} ${isBengali ? 'টি নতুন অপঠিত বিজ্ঞপ্তি' : 'unread alerts pending'}`
                    : isBengali ? 'সকল বিজ্ঞপ্তি হালনাগাদ রয়েছে' : 'All caught up'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowSettingsPanel(!showSettingsPanel)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  showSettingsPanel ? 'bg-indigo-100 text-indigo-700' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }`}
                title={isBengali ? 'ডেস্কটপ নোটিফিকেশন ও সাউন্ড সেটিংস' : 'Desktop push & sound settings'}
              >
                <Settings size={15} />
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  title={isBengali ? 'সব পঠিত মার্ক করুন' : 'Mark all as read'}
                >
                  <CheckCheck size={14} />
                  <span className="hidden xs:inline">{isBengali ? 'পঠিত মার্ক' : 'Mark all read'}</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Browser Push Permission Request Banner */}
          {desktopPermission === 'default' && (
            <div className="bg-gradient-to-r from-indigo-50 via-sky-50 to-amber-50 border-b border-indigo-100/80 p-3.5 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <BellRing size={18} className="animate-pulse text-amber-300" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black text-slate-900">
                    {isBengali ? 'ডেস্কটপ নোটিফিকেশন চালু করুন' : 'Enable Desktop System Alerts'}
                  </h4>
                  <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.2 rounded-full border border-indigo-200">
                    {isBengali ? 'প্রস্তাবিত' : 'Recommended'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug mt-1">
                  {isBengali
                    ? 'পরীক্ষার ফলাফল প্রকাশ, নতুন হোমওয়ার্ক ও প্রাতিষ্ঠানিক জরুরি নোটিশের তাৎক্ষণিক লাইভ ডেস্কটপ অ্যালার্ট পেতে ব্রাউজারে অনুমতি দিন।'
                    : 'Receive real-time desktop popups for exam results, assignment deadlines, and madrasa notices even when this tab is hidden.'}
                </p>
                <div className="flex items-center gap-2 mt-2.5">
                  <button
                    disabled={isRequestingPermission}
                    onClick={async () => {
                      setIsRequestingPermission(true);
                      const res = await requestDesktopPermission();
                      setIsRequestingPermission(false);
                      if (res === 'granted') {
                        showToast(isBengali ? 'ডেস্কটপ অ্যালার্ট সক্রিয় করা হয়েছে!' : 'Desktop notifications enabled successfully!', 'success');
                      } else if (res === 'denied') {
                        showToast(isBengali ? 'ব্রাউজার সেটিংসে নোটিফিকেশন ব্লক করা রয়েছে।' : 'Notification permission blocked in browser.', 'warning');
                      }
                    }}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check size={13} />
                    <span>{isRequestingPermission ? (isBengali ? 'অনুমতি নেওয়া হচ্ছে...' : 'Requesting...') : (isBengali ? 'ডেস্কটপ অ্যালার্ট চালু করুন' : 'Allow Desktop Alerts')}</span>
                  </button>
                  <button
                    onClick={() => setShowSettingsPanel(true)}
                    className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-800 hover:bg-white/80 rounded-lg font-medium transition-colors cursor-pointer"
                  >
                    {isBengali ? 'সেটিংস' : 'Settings'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Desktop & Audio Preferences Drawer */}
          {showSettingsPanel && (
            <div className="bg-slate-900 text-white p-4 border-b border-slate-800 space-y-3 animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Monitor size={16} className="text-indigo-400" />
                  <span className="text-xs font-bold text-slate-100">
                    {isBengali ? 'ডেস্কটপ পুশ ও সাউন্ড সেটিংস' : 'Desktop Push & Alert Preferences'}
                  </span>
                </div>
                <button
                  onClick={() => setShowSettingsPanel(false)}
                  className="text-slate-400 hover:text-white p-1 rounded cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Permission Row */}
              <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60 flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-200">
                      {isBengali ? 'ব্রাউজার নোটিফিকেশন পারমিশন:' : 'Browser Permission:'}
                    </span>
                    {desktopPermission === 'granted' ? (
                      <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        {isBengali ? 'অনুমোদিত (সক্রিয়)' : 'Granted (Active)'}
                      </span>
                    ) : desktopPermission === 'denied' ? (
                      <span className="text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-full">
                        {isBengali ? 'ব্লক করা (Blocked)' : 'Denied (Blocked)'}
                      </span>
                    ) : desktopPermission === 'unsupported' ? (
                      <span className="text-[10px] font-bold bg-slate-700 text-slate-400 px-2 py-0.5 rounded-full">
                        {isBengali ? 'অনুপযুক্ত' : 'Unsupported'}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">
                        {isBengali ? 'অনুমতি প্রয়োজন' : 'Action Required'}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {desktopPermission === 'granted'
                      ? (isBengali ? 'পরীক্ষার ফলাফল ও জরুরি নোটিশে সিস্টেম অ্যালার্ট প্রদর্শিত হবে।' : 'System notifications will pop up for exams & alerts.')
                      : desktopPermission === 'denied'
                      ? (isBengali ? 'ব্রাউজারের সাইট সেটিংসে গিয়ে নোটিফিকেশন আনব্লক করুন।' : 'Unblock in browser URL bar to receive desktop alerts.')
                      : (isBengali ? 'ডেস্কটপ নোটিফিকেশন পেতে অনুমতি প্রদান করুন।' : 'Grant browser permission to enable popups.')}
                  </p>
                </div>

                {desktopPermission !== 'granted' && desktopPermission !== 'unsupported' && (
                  <button
                    disabled={isRequestingPermission}
                    onClick={async () => {
                      setIsRequestingPermission(true);
                      const res = await requestDesktopPermission();
                      setIsRequestingPermission(false);
                      if (res === 'granted') {
                        showToast(isBengali ? 'ডেস্কটপ অ্যালার্ট সক্রিয় হয়েছে!' : 'Desktop alerts granted!', 'success');
                      } else if (res === 'denied') {
                        showToast(isBengali ? 'ব্রাউজারে ব্লক করা রয়েছে' : 'Permission denied by browser', 'warning');
                      }
                    }}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-colors shrink-0 cursor-pointer shadow-xs"
                  >
                    {isBengali ? 'অনুমতি দিন' : 'Grant'}
                  </button>
                )}
              </div>

              {/* Toggles Row */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Desktop Alert Toggle */}
                <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BellRing size={14} className={desktopAlertsEnabled ? 'text-indigo-400' : 'text-slate-500'} />
                    <span className="text-slate-300 font-medium">
                      {isBengali ? 'ডেস্কটপ পপআপ' : 'Desktop Popups'}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleDesktopAlerts(!desktopAlertsEnabled)}
                    disabled={desktopPermission !== 'granted'}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                      desktopAlertsEnabled && desktopPermission === 'granted'
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-700 text-slate-400'
                    } ${desktopPermission !== 'granted' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {desktopAlertsEnabled && desktopPermission === 'granted' ? (isBengali ? 'চালু' : 'ON') : (isBengali ? 'বন্ধ' : 'OFF')}
                  </button>
                </div>

                {/* Audio Chime Toggle */}
                <div className="bg-slate-800/80 rounded-xl p-2.5 border border-slate-700/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {soundAlertsEnabled ? (
                      <Volume2 size={14} className="text-emerald-400" />
                    ) : (
                      <VolumeX size={14} className="text-slate-500" />
                    )}
                    <span className="text-slate-300 font-medium">
                      {isBengali ? 'সাউন্ড চিম' : 'Chime Sound'}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleSoundAlerts(!soundAlertsEnabled)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                      soundAlertsEnabled ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {soundAlertsEnabled ? (isBengali ? 'চালু' : 'ON') : (isBengali ? 'বন্ধ' : 'OFF')}
                  </button>
                </div>
              </div>

              {/* Test Buttons Row */}
              <div className="pt-1 flex items-center justify-between gap-2 border-t border-slate-800 text-[11px]">
                <span className="text-slate-400 font-medium">
                  {isBengali ? 'ডেস্কটপ নোটিফিকেশন টেস্ট:' : 'Test Desktop Alert:'}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      testDesktopNotification('exam_result');
                      showToast(isBengali ? 'পরীক্ষার ফলাফল ডেস্কটপ অ্যালার্ট পাঠানো হয়েছে' : 'Exam result desktop alert triggered', 'success');
                    }}
                    className="px-2.5 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/30 rounded-lg font-bold transition-colors cursor-pointer"
                  >
                    🎓 {isBengali ? 'ফলাফল অ্যালার্ট' : 'Exam Alert'}
                  </button>
                  <button
                    onClick={() => {
                      testDesktopNotification('homework');
                      showToast(isBengali ? 'হোমওয়ার্ক ডেস্কটপ অ্যালার্ট পাঠানো হয়েছে' : 'Homework desktop alert triggered', 'info');
                    }}
                    className="px-2.5 py-1 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 rounded-lg font-bold transition-colors cursor-pointer"
                  >
                    📖 {isBengali ? 'হোমওয়ার্ক' : 'HW Alert'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Simulation / Broadcast Action Bar for testing and teachers */}
          <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 overflow-x-auto text-[10px] text-slate-500">
              <span className="font-bold text-slate-600 shrink-0">{isBengali ? 'টেস্ট অ্যালার্ট:' : 'Simulate:'}</span>
              <button
                onClick={() => {
                  triggerTestAlert('homework');
                  showToast(isBengali ? 'নতুন হোমওয়ার্ক নোটিফিকেশন পাঠানো হয়েছে!' : 'New Homework alert broadcasted!', 'success');
                }}
                className="px-2 py-0.5 bg-white hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 rounded-md font-semibold text-slate-700 transition-colors shrink-0 cursor-pointer"
              >
                + {isBengali ? 'হোমওয়ার্ক' : 'Homework'}
              </button>
              <button
                onClick={() => {
                  triggerTestAlert('exam_result');
                  showToast(isBengali ? 'পরীক্ষার ফলাফল নোটিফিকেশন প্রকাশ হয়েছে!' : 'Exam Result alert published!', 'success');
                }}
                className="px-2 py-0.5 bg-white hover:bg-emerald-50 hover:text-emerald-600 border border-slate-200 rounded-md font-semibold text-slate-700 transition-colors shrink-0 cursor-pointer"
              >
                + {isBengali ? 'ফলাফল' : 'Result'}
              </button>
              <button
                onClick={() => {
                  triggerTestAlert('announcement');
                  showToast(isBengali ? 'জরুরি বিজ্ঞপ্তি ঘোষণা করা হয়েছে!' : 'School announcement broadcasted!', 'success');
                }}
                className="px-2 py-0.5 bg-white hover:bg-amber-50 hover:text-amber-600 border border-slate-200 rounded-md font-semibold text-slate-700 transition-colors shrink-0 cursor-pointer"
              >
                + {isBengali ? 'ঘোষণা' : 'Notice'}
              </button>
            </div>

            {(role === UserRole.TEACHER || role === UserRole.SCHOOL_ADMIN) && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsBroadcastModalOpen(true);
                }}
                className="shrink-0 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <Plus size={13} />
                <span>{isBengali ? 'বার্তা পাঠান' : 'Broadcast'}</span>
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex border-b border-slate-100 px-3 pt-2 gap-1 text-xs overflow-x-auto bg-white shrink-0">
            <button
              onClick={() => setActiveTab('all')}
              className={`pb-2 px-2.5 font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'all'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <span>{isBengali ? 'সকল' : 'All'}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeTab === 'all' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {roleNotifications.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('homework')}
              className={`pb-2 px-2.5 font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'homework'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <BookOpen size={13} />
              <span>{isBengali ? 'হোমওয়ার্ক' : 'Homework'}</span>
              {homeworkCount > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'homework' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {homeworkCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('exam_result')}
              className={`pb-2 px-2.5 font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'exam_result'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Award size={13} />
              <span>{isBengali ? 'ফলাফল' : 'Exam Results'}</span>
              {examResultCount > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'exam_result' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {examResultCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('announcement')}
              className={`pb-2 px-2.5 font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'announcement'
                  ? 'border-amber-600 text-amber-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Megaphone size={13} />
              <span>{isBengali ? 'ঘোষণা' : 'Notices'}</span>
              {announcementCount > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === 'announcement' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {announcementCount}
                </span>
              )}
            </button>
          </div>

          {/* Notification Items List */}
          <div className="overflow-y-auto divide-y divide-slate-100 flex-1 max-h-[380px]">
            {filteredNotifications.length === 0 ? (
              <div className="py-12 px-6 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
                  <Bell size={22} />
                </div>
                <h4 className="text-sm font-bold text-slate-700">
                  {isBengali ? 'কোনো নোটিফিকেশন নেই' : 'No notifications found'}
                </h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  {isBengali 
                    ? 'এই ক্যাটাগরিতে নতুন কোনো হোমওয়ার্ক, পরীক্ষার রেজাল্ট বা নোটিশ নেই।'
                    : 'No active notifications in this category. You are all up to date!'}
                </p>
              </div>
            ) : (
              filteredNotifications.map((item) => {
                const isUnread = !item.readBy.includes(String(role).toLowerCase()) && !item.readBy.includes('read_all');
                
                // Color badges per category
                let categoryIcon = <Megaphone size={16} />;
                let categoryBg = 'bg-amber-50 text-amber-600 border-amber-200';
                let categoryLabel = isBengali ? 'ঘোষণা' : 'Announcement';

                if (item.type === 'homework') {
                  categoryIcon = <BookOpen size={16} />;
                  categoryBg = 'bg-blue-50 text-blue-600 border-blue-200';
                  categoryLabel = isBengali ? 'হোমওয়ার্ক' : 'Homework';
                } else if (item.type === 'exam_result') {
                  categoryIcon = <Award size={16} />;
                  categoryBg = 'bg-emerald-50 text-emerald-600 border-emerald-200';
                  categoryLabel = isBengali ? 'পরীক্ষার ফলাফল' : 'Exam Result';
                }

                return (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    className={`p-3.5 hover:bg-slate-50/90 cursor-pointer transition-all flex items-start gap-3 relative group ${
                      isUnread ? 'bg-indigo-50/40' : 'bg-white'
                    }`}
                  >
                    {/* Read receipt / Unread dot indicator */}
                    <div className="pt-1 shrink-0">
                      {isUnread ? (
                        <div 
                          className="w-2.5 h-2.5 rounded-full bg-indigo-600 shadow-xs ring-4 ring-indigo-100" 
                          title={isBengali ? 'অপঠিত নোটিফিকেশন' : 'Unread notification'} 
                        />
                      ) : (
                        <div 
                          className="p-0.5 rounded-full text-emerald-600 bg-emerald-50 border border-emerald-200 shadow-2xs" 
                          title={isBengali ? 'পঠিত স্থিতি নিশ্চিত (Read receipt verified)' : 'Read receipt verified'}
                        >
                          <CheckCheck size={12} className="text-emerald-600" />
                        </div>
                      )}
                    </div>

                    {/* Category Icon */}
                    <div className={`p-2 rounded-xl shrink-0 border ${categoryBg}`}>
                      {categoryIcon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${categoryBg}`}>
                            {categoryLabel}
                          </span>
                          {item.priority === 'urgent' && (
                            <span className="text-[10px] font-black bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded border border-rose-200 animate-pulse">
                              {isBengali ? 'জরুরি' : 'Urgent'}
                            </span>
                          )}
                          {item.targetClass && item.targetClass !== 'All' && (
                            <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded">
                              {item.targetClass}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {!isUnread && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.2 rounded-full">
                              <CheckCheck size={10} className="text-emerald-600" />
                              <span>{isBengali ? 'পঠিত' : 'Read'}</span>
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 font-medium">
                            {getRelativeTime(item.timestamp)}
                          </span>
                        </div>
                      </div>

                      <h4 className={`text-xs font-bold leading-tight ${
                        isUnread ? 'text-slate-900 font-extrabold' : 'text-slate-700'
                      }`}>
                        {isBengali ? item.titleBn || item.title : item.title}
                      </h4>

                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {isBengali ? item.messageBn || item.message : item.message}
                      </p>

                      {/* Metadata Chips & Quick Action */}
                      <div className="pt-1 flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          {item.metadata?.dueDate && (
                            <span className="flex items-center gap-1 font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                              <Clock size={11} /> {isBengali ? 'জমার শেষ সময়:' : 'Due:'} {item.metadata.dueDate}
                            </span>
                          )}
                          {item.metadata?.gpa && (
                            <span className="flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                              <Award size={11} /> GPA {item.metadata.gpa}
                            </span>
                          )}
                          {item.authorName && (
                            <span className="truncate max-w-[120px]">
                              {item.authorName}
                            </span>
                          )}
                          {/* Read receipt view count */}
                          {item.readReceipts && item.readReceipts.length > 0 && (
                            <span 
                              className="flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/60"
                              title={isBengali ? `${item.readReceipts.length} জন পাঠক দেখেছেন` : `Viewed by ${item.readReceipts.length} recipients`}
                            >
                              <Eye size={11} className="text-indigo-600" />
                              <span>{item.readReceipts.length} {isBengali ? 'জন দেখেছেন' : 'views'}</span>
                            </span>
                          )}
                        </div>

                        {item.actionUrl && (
                          <button
                            onClick={(e) => handleActionClick(e, item)}
                            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer shrink-0 ml-auto"
                          >
                            <span>{isBengali ? item.actionLabelBn || 'দেখুন' : item.actionLabel || 'View'}</span>
                            <ChevronRight size={13} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Delete item button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(item.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-500 rounded transition-all cursor-pointer"
                      title={isBengali ? 'মুছে ফেলুন' : 'Delete notification'}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-center flex items-center justify-between text-xs text-slate-500">
            <span>{isBengali ? 'স্মার্ট স্কুল সেন্ট্রাল নোটিফিকেশন ইঞ্জিন' : 'Smart Central Notification Engine'}</span>
            <button
              onClick={() => {
                setIsOpen(false);
                if (role === UserRole.STUDENT) navigate('/student/homework');
                else if (role === UserRole.PARENT) navigate('/parent/results');
                else navigate('/school/communication');
              }}
              className="text-indigo-600 font-bold hover:underline cursor-pointer"
            >
              {isBengali ? 'সবগুলো দেখুন' : 'View all'}
            </button>
          </div>
        </div>
      )}

      {/* Detail Notification Modal */}
      {selectedNotification && (
        <NotificationDetailModal
          notification={selectedNotification}
          isOpen={!!selectedNotification}
          onClose={() => setSelectedNotification(null)}
          onNavigate={(url) => {
            setSelectedNotification(null);
            setIsOpen(false);
            navigate(url);
          }}
        />
      )}

      {/* Broadcast / Create Alert Modal for Teachers & Admins */}
      <BroadcastAlertModal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
      />
    </div>
  );
};

// Modal for Full Notification Details
interface NotificationDetailModalProps {
  notification: CentralNotification;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (url: string) => void;
}

export const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({
  notification,
  isOpen,
  onClose,
  onNavigate
}) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const isBengali = language === 'bn';

  const currentViewerReceipt = useMemo(() => {
    if (!notification.readReceipts || notification.readReceipts.length === 0) return null;
    return notification.readReceipts.find(
      r => (user?.id && r.readerId === user.id) ||
           (user?.role && r.readerRole === String(user.role).toLowerCase())
    );
  }, [notification.readReceipts, user]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${
              notification.type === 'homework' 
                ? 'bg-blue-50 text-blue-600' 
                : notification.type === 'exam_result'
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-amber-50 text-amber-600'
            }`}>
              {notification.type === 'homework' && <BookOpen size={24} />}
              {notification.type === 'exam_result' && <Award size={24} />}
              {notification.type === 'announcement' && <Megaphone size={24} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {notification.type === 'homework' 
                    ? (isBengali ? 'হোমওয়ার্ক নোটিফিকেশন' : 'Homework Alert')
                    : notification.type === 'exam_result'
                    ? (isBengali ? 'পরীক্ষার ফলাফল বিজ্ঞপ্তি' : 'Exam Result Published')
                    : (isBengali ? 'সাধারণ নোটিশ' : 'Announcement')}
                </span>
                {notification.priority === 'urgent' && (
                  <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.2 rounded-full">
                    {isBengali ? 'জরুরি' : 'Urgent'}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                {isBengali ? notification.titleBn || notification.title : notification.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 text-sm leading-relaxed whitespace-pre-line">
            {isBengali ? notification.messageBn || notification.message : notification.message}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
              <span className="text-slate-400 block">{isBengali ? 'বিষয় / বিভাগ:' : 'Subject / Scope:'}</span>
              <span className="font-bold text-slate-800">{notification.subject || notification.targetClass || 'All Classes'}</span>
            </div>

            <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
              <span className="text-slate-400 block">{isBengali ? 'প্রকাশকারী:' : 'Published By:'}</span>
              <span className="font-bold text-slate-800">{notification.authorName} ({notification.authorRole})</span>
            </div>

            {notification.metadata?.dueDate && (
              <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-100">
                <span className="text-amber-700 block">{isBengali ? 'জমা দেওয়ার শেষ সময়:' : 'Deadline / Due:'}</span>
                <span className="font-bold text-amber-900">{notification.metadata.dueDate}</span>
              </div>
            )}

            {notification.metadata?.gpa && (
              <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100">
                <span className="text-emerald-700 block">{isBengali ? 'প্রাপ্ত ফলাফল / জিপিএ:' : 'Result Grade:'}</span>
                <span className="font-bold text-emerald-900">GPA {notification.metadata.gpa}</span>
              </div>
            )}

            <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
              <span className="text-slate-400 block">{isBengali ? 'লক্ষ্যভুক্ত প্রাপক:' : 'Target Audience:'}</span>
              <span className="font-bold text-slate-800 capitalize">
                {notification.targetRoles.join(', ')}
              </span>
            </div>

            <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100">
              <span className="text-slate-400 block">{isBengali ? 'তারিখ ও সময়:' : 'Published At:'}</span>
              <span className="font-bold text-slate-800">
                {new Date(notification.timestamp).toLocaleString(isBengali ? 'bn-BD' : 'en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>

          {/* Dedicated Read Receipt Status & Viewer Audit Section */}
          <div className="rounded-xl border border-slate-200/90 bg-slate-50/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 shadow-2xs">
                  <CheckCheck size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <span>{isBengali ? 'পঠন স্থিতি ও পাঠক বিবরণ' : 'Read Receipt Status'}</span>
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {isBengali ? 'যাচাইকৃত' : 'Active Receipt'}
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {isBengali 
                      ? 'নোটিফিকেশনটির দেখা বা পড়ার সময়কাল ও পাঠকগণের রিয়েল-টাইম লগ' 
                      : 'Real-time recipient view timestamps and reader engagement verification'}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-black text-slate-800 flex items-center gap-1 justify-end">
                  <Eye size={13} className="text-indigo-600" />
                  <span>{notification.readReceipts?.length || (notification.readBy.length > 0 ? notification.readBy.length : 1)}</span>
                </span>
                <span className="text-[10px] text-slate-400 block font-medium">
                  {isBengali ? 'মোট পাঠক' : 'Total Views'}
                </span>
              </div>
            </div>

            {/* Current Viewer Read Status Card */}
            <div className="p-2.5 rounded-lg bg-white border border-emerald-200 flex items-center justify-between text-xs shadow-2xs">
              <div className="flex items-center gap-2">
                <UserCheck size={15} className="text-emerald-600 shrink-0" />
                <span className="text-slate-700">
                  <strong className="font-bold text-slate-900">{isBengali ? 'আপনার স্থিতি:' : 'Your Status:'}</strong>{' '}
                  <span className="text-emerald-700 font-semibold">{isBengali ? 'পঠিত (স্বীকৃত)' : 'Read & Acknowledged'}</span>
                </span>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/80">
                {currentViewerReceipt ? (
                  new Date(currentViewerReceipt.readAt).toLocaleTimeString(isBengali ? 'bn-BD' : 'en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                ) : (
                  isBengali ? 'এইমাত্র পঠিত' : 'Just viewed'
                )}
              </span>
            </div>

            {/* Reader Breakdown Audit List */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span>{isBengali ? 'পাঠক লগ ও রিসিপ্ট:' : 'Reader Logs:'}</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {notification.readReceipts && notification.readReceipts.length > 0
                    ? (isBengali ? `${notification.readReceipts.length} জন নিশ্চিত পাঠক` : `${notification.readReceipts.length} verified readers`)
                    : (isBengali ? 'লগ রেকর্ড হচ্ছে...' : 'Recording logs...')}
                </span>
              </div>

              {notification.readReceipts && notification.readReceipts.length > 0 ? (
                <div className="max-h-36 overflow-y-auto divide-y divide-slate-100 rounded-lg bg-white border border-slate-200">
                  {notification.readReceipts.map((receipt, idx) => {
                    const roleBadgeColor = receipt.readerRole === 'student'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : receipt.readerRole === 'parent'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : receipt.readerRole === 'teacher'
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : 'bg-purple-50 text-purple-700 border-purple-200';

                    const roleLabel = receipt.readerRole === 'student'
                      ? (isBengali ? 'শিক্ষার্থী' : 'Student')
                      : receipt.readerRole === 'parent'
                      ? (isBengali ? 'অভিভাবক' : 'Parent')
                      : receipt.readerRole === 'teacher'
                      ? (isBengali ? 'শিক্ষক' : 'Teacher')
                      : (isBengali ? 'এডমিন' : 'Admin');

                    return (
                      <div key={idx} className="p-2 flex items-center justify-between text-xs hover:bg-slate-50/80 transition-colors">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 text-[10px] font-bold shrink-0 border border-slate-200">
                            {receipt.readerName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-800 truncate text-[11px]">
                              {receipt.readerName}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px]">
                              <span className={`px-1.5 py-0.2 rounded font-bold border ${roleBadgeColor}`}>
                                {roleLabel}
                              </span>
                              {receipt.readerClass && (
                                <span className="text-slate-400">({receipt.readerClass})</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] text-slate-500 font-medium block">
                            {new Date(receipt.readAt).toLocaleString(isBengali ? 'bn-BD' : 'en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              day: 'numeric',
                              month: 'short'
                            })}
                          </span>
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-600">
                            <CheckCheck size={11} />
                            <span>{isBengali ? 'পঠিত' : 'Read'}</span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-2.5 bg-white rounded-lg border border-slate-100 text-[11px] text-slate-400">
                  {isBengali ? 'এখনও কোনো পৃথক পাঠক তথ্য নেই' : 'No individual viewer logs yet'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            {isBengali ? 'বন্ধ করুন' : 'Close'}
          </button>
          {notification.actionUrl && (
            <button
              onClick={() => onNavigate(notification.actionUrl!)}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span>{isBengali ? notification.actionLabelBn || 'সংশ্লিষ্ট পেজে যান' : notification.actionLabel || 'Proceed to View'}</span>
              <ExternalLink size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Modal for Creating & Broadcasting New Alerts (Teachers, School Admins)
interface BroadcastAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: NotificationCategory;
}

export const BroadcastAlertModal: React.FC<BroadcastAlertModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'announcement'
}) => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { showToast } = useToast();
  const { broadcastAnnouncement, publishHomeworkAlert, publishExamResultAlert } = useNotifications();

  const isBengali = language === 'bn';

  const [type, setType] = useState<NotificationCategory>(defaultType);
  const [title, setTitle] = useState('');
  const [titleBn, setTitleBn] = useState('');
  const [message, setMessage] = useState('');
  const [messageBn, setMessageBn] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [targetClass, setTargetClass] = useState('Class 10');
  const [dueDate, setDueDate] = useState('Next Sunday, 5:00 PM');
  const [examName, setExamName] = useState('Second Term Exam 2025');
  const [priority, setPriority] = useState<NotificationPriority>('normal');
  const [targetStudents, setTargetStudents] = useState(true);
  const [targetParents, setTargetParents] = useState(true);
  const [targetTeachers, setTargetTeachers] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() && !titleBn.trim()) {
      showToast(isBengali ? 'দয়া করে শিরোনাম লিখুন' : 'Please provide a title', 'error');
      return;
    }

    const finalTitle = title.trim() || titleBn.trim();
    const finalTitleBn = titleBn.trim() || title.trim();
    const finalMsg = message.trim() || messageBn.trim() || 'No additional details provided.';
    const finalMsgBn = messageBn.trim() || message.trim() || 'কোনো বিস্তারিত বিবরণ দেওয়া হয়নি।';

    const targetRoles: NotificationTargetRole[] = [];
    if (targetStudents) targetRoles.push('student');
    if (targetParents) targetRoles.push('parent');
    if (targetTeachers) targetRoles.push('teacher');
    if (targetRoles.length === 0) targetRoles.push('student', 'parent');

    const authorName = user?.name || 'Faculty Office';
    const authorRole = user?.role === UserRole.TEACHER ? 'Teacher' : 'Administrator';

    if (type === 'homework') {
      publishHomeworkAlert({
        title: finalTitle,
        titleBn: finalTitleBn,
        subject,
        className: targetClass,
        dueDate,
        instructions: finalMsg,
        teacherName: authorName
      });
      showToast(isBengali ? 'হোমওয়ার্ক সফলভাবে অ্যাসাইন করা হয়েছে এবং শিক্ষার্থীদের অ্যালার্ট পাঠানো হয়েছে!' : 'Homework assigned & notification broadcasted!', 'success');
    } else if (type === 'exam_result') {
      publishExamResultAlert({
        examName: examName || finalTitle,
        className: targetClass,
        subject,
        authorName,
        gpa: '5.00'
      });
      showToast(isBengali ? 'পরীক্ষার ফলাফল সফলভাবে প্রকাশিত ও নোটিফাই করা হয়েছে!' : 'Exam results published & notification alert sent!', 'success');
    } else {
      broadcastAnnouncement({
        title: finalTitle,
        titleBn: finalTitleBn,
        message: finalMsg,
        messageBn: finalMsgBn,
        targetRoles,
        targetClass,
        priority,
        authorName,
        authorRole
      });
      showToast(isBengali ? 'বিজ্ঞপ্তি সফলভাবে প্রচার করা হয়েছে!' : 'Announcement broadcasted successfully!', 'success');
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-900 to-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <Megaphone size={20} className="text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                {isBengali ? 'নতুন নোটিফিকেশন ও অ্যালার্ট পাঠান' : 'Create & Broadcast Notification'}
              </h3>
              <p className="text-xs text-indigo-200">
                {isBengali ? 'শিক্ষার্থী, অভিভাবক ও শিক্ষকদের নিকট অবিলম্বে অ্যালার্ট পৌঁছাবে' : 'Immediately alerts students, parents, and teachers'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-white/70 hover:text-white rounded-lg hover:bg-white/10"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Notification Type Select */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              {isBengali ? 'বিজ্ঞপ্তির ধরন / ক্যাটাগরি:' : 'Notification Category:'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType('homework')}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                  type === 'homework'
                    ? 'border-blue-600 bg-blue-50/80 text-blue-700 font-bold shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <BookOpen size={20} className={type === 'homework' ? 'text-blue-600' : 'text-slate-400'} />
                <span className="text-xs">{isBengali ? 'হোমওয়ার্ক' : 'Homework'}</span>
              </button>

              <button
                type="button"
                onClick={() => setType('exam_result')}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                  type === 'exam_result'
                    ? 'border-emerald-600 bg-emerald-50/80 text-emerald-700 font-bold shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Award size={20} className={type === 'exam_result' ? 'text-emerald-600' : 'text-slate-400'} />
                <span className="text-xs">{isBengali ? 'পরীক্ষার ফলাফল' : 'Exam Result'}</span>
              </button>

              <button
                type="button"
                onClick={() => setType('announcement')}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                  type === 'announcement'
                    ? 'border-amber-600 bg-amber-50/80 text-amber-700 font-bold shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <Megaphone size={20} className={type === 'announcement' ? 'text-amber-600' : 'text-slate-400'} />
                <span className="text-xs">{isBengali ? 'সাধারণ ঘোষণা' : 'Notice'}</span>
              </button>
            </div>
          </div>

          {/* Title Inputs */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              {isBengali ? 'শিরোনাম (Title)' : 'Notification Title'} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                type === 'homework'
                  ? 'e.g. Math Chapter 6 Trigonometry Practice'
                  : type === 'exam_result'
                  ? 'e.g. Mid-Term Examination 2025 Result Published'
                  : 'e.g. Annual Sports & Cultural Day 2025'
              }
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
            <input
              type="text"
              value={titleBn}
              onChange={(e) => setTitleBn(e.target.value)}
              placeholder="বাংলা শিরোনাম (ঐচ্ছিক): যেমন - ত্রিকোণমিতি অনুশীলন সেট ১"
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50/50"
            />
          </div>

          {/* Dynamic Fields per Type */}
          {type === 'homework' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="English">English</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="Bangla">Bangla</option>
                  <option value="Islamic Studies">Islamic Studies</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Class / Section</label>
                <select
                  value={targetClass}
                  onChange={(e) => setTargetClass(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
                >
                  <option value="Class 10">Class 10 (Section A & B)</option>
                  <option value="Class 9">Class 9 (Section A & B)</option>
                  <option value="Class 8">Class 8</option>
                  <option value="Class 7">Class 7</option>
                  <option value="Class 6">Class 6</option>
                  <option value="All">All Classes</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Submission Due</label>
                <input
                  type="text"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  placeholder="e.g. Tomorrow 5 PM"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>
            </div>
          )}

          {type === 'exam_result' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Exam Name</label>
                <input
                  type="text"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  placeholder="e.g. First Term Exam 2024"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Class</label>
                <select
                  value={targetClass}
                  onChange={(e) => setTargetClass(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
                >
                  <option value="Class 10">Class 10</option>
                  <option value="Class 9">Class 9</option>
                  <option value="Class 8">Class 8</option>
                  <option value="All">All Classes</option>
                </select>
              </div>
            </div>
          )}

          {/* Target Audience Checkboxes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {isBengali ? 'লক্ষ্যভুক্ত অডিয়েন্স / প্রাপক:' : 'Target Recipients:'}
            </label>
            <div className="flex items-center gap-4 text-xs font-medium text-slate-700">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={targetStudents}
                  onChange={(e) => setTargetStudents(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span>{isBengali ? 'শিক্ষার্থী (Students)' : 'Students'}</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={targetParents}
                  onChange={(e) => setTargetParents(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span>{isBengali ? 'অভিভাবক (Parents)' : 'Parents'}</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={targetTeachers}
                  onChange={(e) => setTargetTeachers(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span>{isBengali ? 'শিক্ষকবৃন্দ (Teachers)' : 'Teachers'}</span>
              </label>
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              {isBengali ? 'অগ্রাধিকার স্তর (Priority):' : 'Priority Level:'}
            </label>
            <div className="flex gap-2">
              {(['normal', 'high', 'urgent'] as NotificationPriority[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                    priority === p
                      ? p === 'urgent'
                        ? 'bg-rose-600 text-white'
                        : p === 'high'
                        ? 'bg-amber-500 text-white'
                        : 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Message / Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              {isBengali ? 'বিস্তারিত নির্দেশনা বা বার্তা:' : 'Message / Instructions:'}
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Provide complete instructions, homework tasks, or event guidelines..."
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            />
            <textarea
              rows={2}
              value={messageBn}
              onChange={(e) => setMessageBn(e.target.value)}
              placeholder="বাংলা বার্তা (ঐচ্ছিক): বিস্তারিত নির্দেশাবলী এখানে লিখতে পারেন..."
              className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-600 focus:ring-2 focus:ring-indigo-500 outline-none resize-none bg-slate-50/50"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              {isBengali ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Send size={14} />
              <span>{isBengali ? 'এখনই অ্যালার্ট পাঠান' : 'Dispatch Notification'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
