import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, BookOpen, Award, Megaphone, Clock, 
  ChevronRight, Sparkles, Send, CheckCheck, 
  Plus, Check, AlertCircle, ArrowRight, BellRing, X, Eye, UserCheck
} from 'lucide-react';
import { 
  CentralNotification, 
  useNotifications 
} from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from './UIComponents';
import { UserRole } from '../types';
import { NotificationDetailModal, BroadcastAlertModal } from './CentralNotificationCenter';

interface DashboardNotificationWidgetProps {
  role: UserRole;
  childName?: string;
  childClass?: string;
  className?: string;
}

export const DashboardNotificationWidget: React.FC<DashboardNotificationWidgetProps> = ({
  role,
  childName,
  childClass,
  className = ''
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const { showToast } = useToast();
  const { 
    getNotificationsForRole, 
    markAsRead, 
    markAllAsRead, 
    triggerTestAlert,
    desktopPermission,
    desktopAlertsEnabled,
    requestDesktopPermission,
    testDesktopNotification
  } = useNotifications();

  const [activeFilter, setActiveFilter] = useState<'all' | 'homework' | 'exam_result' | 'announcement'>('all');
  const [selectedNotification, setSelectedNotification] = useState<CentralNotification | null>(null);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [isDismissedBanner, setIsDismissedBanner] = useState(false);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  const isBengali = language === 'bn';
  const targetClass = childClass || user?.studentClass || user?.studentData?.class || 'Class 10';

  // Get notifications filtered for role & class
  const allRoleNotifs = getNotificationsForRole(role, targetClass);
  const unreadCount = allRoleNotifs.filter(
    n => !n.readBy.includes(String(role).toLowerCase()) && !n.readBy.includes('read_all')
  ).length;

  const filteredNotifs = allRoleNotifs.filter(n => {
    if (activeFilter === 'all') return true;
    return n.type === activeFilter;
  }).slice(0, 4); // Show top 4 in widget

  const readerDetails = {
    readerId: user?.id,
    readerName: user?.name || (role === UserRole.STUDENT ? 'Student' : role === UserRole.PARENT ? 'Parent' : role === UserRole.TEACHER ? 'Faculty' : 'Admin'),
    readerRole: role,
    readerClass: targetClass
  };

  const handleItemClick = (notif: CentralNotification) => {
    markAsRead(notif.id, role, readerDetails);
    
    // Immediate receipt reflect in modal
    const currentReceipts = notif.readReceipts ? [...notif.readReceipts] : [];
    const alreadyHasReceipt = currentReceipts.some(r => 
      (user?.id && r.readerId === user.id) || (r.readerRole === role && r.readerName === readerDetails.readerName)
    );
    if (!alreadyHasReceipt) {
      currentReceipts.push({
        readerId: user?.id,
        readerName: readerDetails.readerName,
        readerRole: role,
        readerClass: targetClass,
        readAt: new Date().toISOString()
      });
    }

    setSelectedNotification({
      ...notif,
      readBy: notif.readBy.includes(String(role).toLowerCase()) ? notif.readBy : [...notif.readBy, String(role).toLowerCase()],
      readReceipts: currentReceipts
    });
  };

  const handleActionClick = (e: React.MouseEvent, notif: CentralNotification) => {
    e.stopPropagation();
    markAsRead(notif.id, role, readerDetails);
    if (notif.actionUrl) {
      navigate(notif.actionUrl);
    }
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

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8 ${className}`}>
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 flex items-center justify-center shrink-0 shadow-inner">
            <Bell size={22} className={unreadCount > 0 ? 'text-amber-300 animate-pulse' : 'text-indigo-300'} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-2.5 py-0.5 rounded-full">
                {role === UserRole.STUDENT 
                  ? (isBengali ? 'শিক্ষার্থী নোটিফিকেশন হাব' : 'Student Alert Hub')
                  : role === UserRole.PARENT
                  ? (isBengali ? 'অভিভাবক অ্যাকাডেমিক নোটিশ' : 'Parent Academic Alerts')
                  : (isBengali ? 'অনুষদ নোটিফিকেশন ও ব্রডকাস্ট' : 'Faculty Alerts & Dispatch')}
              </span>
              {unreadCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-bounce">
                  {unreadCount} {isBengali ? 'নতুন অপঠিত' : 'new'}
                </span>
              )}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mt-1">
              {role === UserRole.STUDENT
                ? (isBengali ? 'নতুন হোমওয়ার্ক, পরীক্ষার ফলাফল ও প্রাতিষ্ঠানিক নোটিশ' : 'New Homework, Exam Results & School Notices')
                : role === UserRole.PARENT
                ? (isBengali ? `${childName || 'সন্তানের'} শিক্ষাবর্ষের লাইভ আপডেট ও ফলাফল` : `Live Academic Updates & Exam Results for ${childName || 'Child'}`)
                : (isBengali ? 'ক্লাস অ্যাসাইনমেন্ট সাবমিশন ও রেজাল্ট নোটিফিকেশন' : 'Class Assignment Updates & Result Announcements')}
            </h3>
          </div>
        </div>

        {/* Quick Actions in Banner */}
        <div className="flex items-center gap-2 shrink-0">
          {(role === UserRole.TEACHER || role === UserRole.SCHOOL_ADMIN) && (
            <button
              onClick={() => setIsBroadcastModalOpen(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-md hover:shadow-indigo-500/20 cursor-pointer"
            >
              <Plus size={15} />
              <span>{isBengali ? 'নতুন নোটিশ / হোমওয়ার্ক পাঠান' : 'Broadcast Alert'}</span>
            </button>
          )}

          {unreadCount > 0 && (
            <button
              onClick={() => {
                markAllAsRead(role);
                showToast(isBengali ? 'সকল নোটিফিকেশন পঠিত মার্ক করা হয়েছে' : 'All alerts marked as read', 'info');
              }}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer border border-white/10"
              title={isBengali ? 'সব পঠিত হিসেবে চিহ্নিত করুন' : 'Mark all as read'}
            >
              <CheckCheck size={14} />
              <span className="hidden sm:inline">{isBengali ? 'সব পঠিত' : 'Mark all read'}</span>
            </button>
          )}

          {/* Quick simulation buttons for reviewer */}
          <div className="hidden lg:flex items-center gap-1 bg-white/10 p-1 rounded-xl text-[10px]">
            <button
              onClick={() => {
                triggerTestAlert('homework');
                showToast(isBengali ? 'নতুন হোমওয়ার্ক পাঠানো হয়েছে' : 'Simulated new homework alert', 'success');
              }}
              className="px-2 py-1 bg-white/15 hover:bg-white/30 rounded-lg font-bold text-white transition-colors cursor-pointer"
              title="Test new homework alert"
            >
              + {isBengali ? 'হোমওয়ার্ক' : 'HW'}
            </button>
            <button
              onClick={() => {
                triggerTestAlert('exam_result');
                showToast(isBengali ? 'পরীক্ষার ফলাফল বিজ্ঞপ্তি যুক্ত হয়েছে' : 'Simulated exam result published', 'success');
              }}
              className="px-2 py-1 bg-white/15 hover:bg-white/30 rounded-lg font-bold text-white transition-colors cursor-pointer"
              title="Test exam result alert"
            >
              + {isBengali ? 'ফলাফল' : 'Result'}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Push Notification Permission Prompt Banner */}
      {desktopPermission === 'default' && !isDismissedBanner && (
        <div className="bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-emerald-500/10 border-b border-indigo-100 px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <BellRing size={20} className="animate-bounce text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-900">
                  {isBengali ? 'তাৎক্ষণিক ডেস্কটপ পুশ নোটিফিকেশন চালু করুন' : 'Enable Instant Desktop Push Alerts'}
                </span>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                  {isBengali ? 'পরীক্ষার ফলাফল ও নোটিশ' : 'Exams & Critical Notices'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {isBengali
                  ? 'পরীক্ষার রেজাল্ট প্রকাশ ও জরুরি ছুটির নোটিশ সবার আগে কম্পিউটারের স্ক্রিনে সরাসরি পেতে অনুমতি দিন।'
                  : 'Get real-time browser desktop popups when exam results, grades, or emergency notices are published.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              disabled={isRequestingPermission}
              onClick={async () => {
                setIsRequestingPermission(true);
                const res = await requestDesktopPermission();
                setIsRequestingPermission(false);
                if (res === 'granted') {
                  showToast(isBengali ? 'ডেস্কটপ নোটিফিকেশন সফলভাবে চালু করা হয়েছে!' : 'Desktop push alerts active!', 'success');
                } else if (res === 'denied') {
                  showToast(isBengali ? 'ব্রাউজারে নোটিফিকেশন ব্লক করা রয়েছে।' : 'Notification blocked by browser.', 'warning');
                }
              }}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Check size={14} />
              <span>{isRequestingPermission ? (isBengali ? 'অনুরোধ করা হচ্ছে...' : 'Requesting...') : (isBengali ? 'অনুমতি দিন' : 'Enable Alerts')}</span>
            </button>
            <button
              onClick={() => setIsDismissedBanner(true)}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-lg transition-colors cursor-pointer"
              title={isBengali ? 'পরে স্মরণ করিয়ে দিন' : 'Dismiss'}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Desktop Alerts Active Status Bar */}
      {desktopPermission === 'granted' && (
        <div className="bg-emerald-50/70 border-b border-emerald-100/80 px-5 py-2 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="font-bold">
              {isBengali ? '🟢 ডেস্কটপ পুশ নোটিফিকেশন সক্রিয়:' : '🟢 Desktop Push Alerts Active:'}
            </span>
            <span className="text-slate-600 hidden md:inline">
              {isBengali ? 'পরীক্ষার ফলাফল ও জরুরি নোটিশে সরাসরি কম্পিউটার স্ক্রিনে সতর্কতা আসবে।' : 'Critical exam results & urgent notices will pop up on your desktop.'}
            </span>
          </div>
          <button
            onClick={() => {
              testDesktopNotification('exam_result');
              showToast(isBengali ? 'পরীক্ষার ফলাফল ডেস্কটপ নোটিফিকেশন পাঠানো হয়েছে' : 'Exam result desktop alert triggered', 'success');
            }}
            className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg font-bold text-[11px] transition-colors shadow-2xs flex items-center gap-1 cursor-pointer shrink-0"
          >
            <BellRing size={12} className="text-emerald-600" />
            <span>{isBengali ? 'ফলাফল নোটিফিকেশন টেস্ট' : 'Test Exam Alert'}</span>
          </button>
        </div>
      )}

      {/* Filter Tabs Sub-bar */}
      <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            {isBengali ? 'সকল নোটিশ' : 'All Alerts'} ({allRoleNotifs.length})
          </button>
          <button
            onClick={() => setActiveFilter('homework')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'homework'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <BookOpen size={13} />
            <span>{isBengali ? 'হোমওয়ার্ক' : 'Homework'}</span>
          </button>
          <button
            onClick={() => setActiveFilter('exam_result')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'exam_result'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <Award size={13} />
            <span>{isBengali ? 'পরীক্ষার ফলাফল' : 'Exam Results'}</span>
          </button>
          <button
            onClick={() => setActiveFilter('announcement')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'announcement'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <Megaphone size={13} />
            <span>{isBengali ? 'ঘোষণা' : 'Notices'}</span>
          </button>
        </div>

        <span className="text-xs text-slate-400 font-medium hidden sm:inline">
          {isBengali ? 'সর্বশেষ আপডেট' : 'Real-time updates'}
        </span>
      </div>

      {/* Notification Cards Grid */}
      <div className="p-5">
        {filteredNotifs.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            {isBengali ? 'এই বিভাগে কোনো সক্রিয় নোটিফিকেশন নেই।' : 'No notifications in this category.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNotifs.map((item) => {
              const isUnread = !item.readBy.includes(String(role).toLowerCase()) && !item.readBy.includes('read_all');

              let cardBg = 'hover:border-slate-300';
              let badgeColor = 'bg-slate-100 text-slate-700';
              let icon = <Megaphone size={18} className="text-amber-600" />;

              if (item.type === 'homework') {
                icon = <BookOpen size={18} className="text-blue-600" />;
                badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
                cardBg = isUnread ? 'bg-blue-50/20 border-blue-200/80' : 'bg-white border-slate-200';
              } else if (item.type === 'exam_result') {
                icon = <Award size={18} className="text-emerald-600" />;
                badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                cardBg = isUnread ? 'bg-emerald-50/20 border-emerald-200/80' : 'bg-white border-slate-200';
              } else {
                icon = <Megaphone size={18} className="text-amber-600" />;
                badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
                cardBg = isUnread ? 'bg-amber-50/20 border-amber-200/80' : 'bg-white border-slate-200';
              }

              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative group flex flex-col justify-between hover:shadow-md ${cardBg}`}
                >
                  <div>
                    {/* Top row */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg bg-white shadow-xs border border-slate-100`}>
                          {icon}
                        </div>
                        <div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badgeColor}`}>
                            {item.type === 'homework'
                              ? (isBengali ? 'হোমওয়ার্ক' : 'Homework')
                              : item.type === 'exam_result'
                              ? (isBengali ? 'পরীক্ষার ফলাফল' : 'Exam Result')
                              : (isBengali ? 'ঘোষণা' : 'Notice')}
                          </span>
                          {item.priority === 'urgent' && (
                            <span className="ml-1.5 text-[10px] font-black bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded border border-rose-200 animate-pulse">
                              {isBengali ? 'জরুরি' : 'Urgent'}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px]">
                        {isUnread ? (
                          <span className="flex items-center gap-1 font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                            {isBengali ? 'অপঠিত' : 'New'}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-full shadow-2xs" title={isBengali ? 'পঠিত স্থিতি নিশ্চিত' : 'Read Receipt Confirmed'}>
                            <CheckCheck size={12} className="text-emerald-600" />
                            <span>{isBengali ? 'পঠিত' : 'Read'}</span>
                          </span>
                        )}
                        <span className="text-slate-400 font-medium">{getRelativeTime(item.timestamp)}</span>
                      </div>
                    </div>

                    {/* Title & snippet */}
                    <h4 className={`text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1`}>
                      {isBengali ? item.titleBn || item.title : item.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {isBengali ? item.messageBn || item.message : item.message}
                    </p>
                  </div>

                  {/* Bottom Meta & CTA */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100/80 flex items-center justify-between text-xs">
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5 flex-wrap">
                      {item.metadata?.dueDate && (
                        <span className="text-amber-700 font-medium">
                          {isBengali ? 'জমা:' : 'Due:'} {item.metadata.dueDate}
                        </span>
                      )}
                      {item.metadata?.gpa && (
                        <span className="text-emerald-700 font-bold">
                          GPA {item.metadata.gpa}
                        </span>
                      )}
                      {!item.metadata?.dueDate && !item.metadata?.gpa && (
                        <span>{item.authorName}</span>
                      )}
                      {item.readReceipts && item.readReceipts.length > 0 && (
                        <span 
                          className="inline-flex items-center gap-1 font-semibold text-slate-600 bg-slate-50 border border-slate-200/70 px-1.5 py-0.5 rounded shadow-2xs"
                          title={isBengali ? `${item.readReceipts.length} জন পাঠক এটি দেখেছেন` : `Viewed by ${item.readReceipts.length} recipients`}
                        >
                          <Eye size={11} className="text-indigo-600" />
                          <span>{item.readReceipts.length} {isBengali ? 'জন দেখেছেন' : 'views'}</span>
                        </span>
                      )}
                    </div>

                    {item.actionUrl ? (
                      <button
                        onClick={(e) => handleActionClick(e, item)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-indigo-100 shadow-xs hover:bg-indigo-50 transition-colors"
                      >
                        <span>{isBengali ? item.actionLabelBn || 'দেখুন' : item.actionLabel || 'View'}</span>
                        <ChevronRight size={13} />
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                        <span>{isBengali ? 'বিস্তারিত' : 'Details'}</span>
                        <ChevronRight size={13} />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedNotification && (
        <NotificationDetailModal
          notification={selectedNotification}
          isOpen={!!selectedNotification}
          onClose={() => setSelectedNotification(null)}
          onNavigate={(url) => {
            setSelectedNotification(null);
            navigate(url);
          }}
        />
      )}

      {/* Broadcast Modal */}
      <BroadcastAlertModal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
      />
    </div>
  );
};
