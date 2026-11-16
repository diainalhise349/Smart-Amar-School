
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  LayoutDashboard, FileText, Activity, Calculator, UserPlus, Users, 
  Grid, Table, Clock, ClipboardCheck, CreditCard, CalendarX, 
  Award, FileBadge, Settings2, Building2, UserCheck, MessageSquare, 
  Bell, Contact, Megaphone, ArrowUpCircle, ShieldCheck, 
  Eye, Database, Settings, LogOut, Menu, X, ChevronDown, 
  ChevronRight, Languages, Search, Bell as BellIcon, UserCircle,
  Globe, Package, Headphones, Sparkles, ScrollText, BarChart3, Palette,
  FileClock, ShieldQuestion, ImagePlus, UserPen, DatabaseBackup, Key,
  LockKeyhole, SmartphoneNfc, Printer, LayoutGrid, Maximize, PlusSquare,
  List, CalendarRange, UserSearch, TreePalm, UserMinus, Send, Settings as SettingsIcon,
  History, Ban, Hash, Square, CalendarPlus, UserCheck2, Scroll, PlusCircle, Layers, CalendarDays, BookOpen,
  PlusCircle as AddIcon, FileStack, SearchCode, Smartphone, CreditCard as IDCardIcon,
  ArrowUpCircle as PromotionIcon, ShieldCheck as PermissionIcon, Key as KeyIcon,
  Phone as PhoneIcon, FileType, Library, Zap, FolderArchive, FolderLock, SlidersHorizontal,
  FileSpreadsheet, Bus, GraduationCap, ListTodo, ExternalLink, Receipt, TrendingUp,
  Compass, School, Check, CalendarClock, CloudUpload
} from 'lucide-react';
import { NavItem, UserRole, LanguageCode } from '../types';
import { MOCK_NOTIFICATIONS, MOCK_PLANS, MOCK_STUDENTS } from '../constants';
import { useLanguage } from '../context/LanguageContext';
import { LanguageToggle } from './LanguageToggle';
import { Header, GlobalLanguageSwitcher } from './Header';
import { useAuth } from '../context/AuthContext';
import { useTenant } from '../context/TenantContext';
import { updateTenantTheme, SCHOOL_THEME_EVENT } from '../utils/tenantStorage';
import { PRESET_BRAND_COLORS } from './SchoolThemeCustomizer';
// Added missing Button import from UIComponents
import { Button } from './UIComponents';
import { GlobalSearch } from './GlobalSearch';
import { HeaderGlobalSearchBar } from './HeaderGlobalSearchBar';
import {
  getAdmissionWorkflowNotifications,
  markWorkflowNotificationAsRead,
  markAllWorkflowNotificationsAsRead,
  ADMISSION_WORKFLOW_EVENT,
  AdmissionWorkflowNotification
} from '../utils/admissionWorkflow';
import {
  getPendingLeaveCount,
  subscribeToLeaveUpdates
} from '../utils/leaveWorkflow';
import { TeacherNotificationBell } from './TeacherNotificationBell';
import { CentralNotificationBell } from './CentralNotificationCenter';

// --- Navigation Item Component for Nested Menus ---
const SidebarNavItem: React.FC<{ 
  item: NavItem; 
  isRTL: boolean; 
  t: any; 
  setMobileOpen: (o: boolean) => void;
  brandColor?: string;
}> = ({ item, isRTL, t, setMobileOpen, brandColor = '#4F46E5' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const hasChildren = item.children && item.children.length > 0;
    
    const isChildActive = hasChildren && item.children?.some(child => location.pathname === child.path);

    if (!hasChildren) {
        return (
            <NavLink
              to={item.path!}
              onClick={() => setMobileOpen(false)}
              style={({ isActive }) => 
                isActive 
                  ? { backgroundColor: brandColor, boxShadow: `0 8px 16px -3px ${brandColor}50` } 
                  : undefined
              }
              className={({ isActive }) => `flex items-center px-4 py-2 text-[11px] font-medium rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'text-white shadow-lg'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className={`w-3.5 h-3.5 ${isRTL ? 'ml-2.5' : 'mr-2.5'} transition-transform group-hover:scale-110`} />
              <span className="truncate">{item.label}</span>
            </NavLink>
        );
    }

    return (
        <div className="space-y-1">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between w-full px-4 py-2 text-[11px] font-medium rounded-lg transition-all duration-200 group ${
                    isChildActive || isOpen ? 'bg-slate-800/50 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
            >
                <div className="flex items-center">
                    <item.icon className={`w-3.5 h-3.5 ${isRTL ? 'ml-2.5' : 'mr-2.5'}`} />
                    <span className="truncate">{item.label}</span>
                </div>
                {isOpen ? <ChevronDown size={14} /> : (isRTL ? <ChevronRight size={14} className="rotate-180" /> : <ChevronRight size={14} />)}
            </button>
            
            {isOpen && (
                <div className={`mt-1 space-y-1 ${isRTL ? 'pr-4' : 'pl-4'} animate-in slide-in-from-top-1 duration-200`}>
                    {item.children?.map((child) => (
                        <NavLink
                            key={child.path}
                            to={child.path!}
                            onClick={() => setMobileOpen(false)}
                            style={({ isActive }) => 
                              isActive 
                                ? { color: brandColor, backgroundColor: `${brandColor}20` } 
                                : undefined
                            }
                            className={({ isActive }) => `flex items-center px-4 py-2 text-[10px] font-medium rounded-lg transition-all duration-200 ${
                                isActive
                                    ? 'font-bold'
                                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
                            }`}
                        >
                            <child.icon className={`w-3 h-3 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                            <span className="truncate">{child.label}</span>
                        </NavLink>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Navigation Configurations ---
const SUPER_ADMIN_NAV: (t: any) => NavItem[] = (t) => [
  { label: t('dashboard') || 'Dashboard', path: '/super-admin', icon: LayoutDashboard },
  { label: t('tenants_schools') || 'Tenants (Schools)', path: '/super-admin/tenants', icon: Building2 },
  { label: t('domains') || 'Domains', path: '/super-admin/domains', icon: Globe },
  { label: t('module_manager') || 'Module Manager', path: '/super-admin/modules', icon: Package },
  { label: t('subscriptions') || 'Subscriptions', path: '/super-admin/subscriptions', icon: CreditCard },
  { label: t('helpdesk_support') || 'Helpdesk & Support', path: '/super-admin/support', icon: Headphones },
  { label: t('global_reports') || 'Global Reports', path: '/super-admin/reports', icon: BarChart3 },
  { label: t('activity_logs') || 'Activity Logs', path: '/super-admin/logs', icon: Activity },
  { label: t('data_backup_export') || 'Data Backup & Export', path: '/super-admin/backup', icon: DatabaseBackup },
  { label: t('scheduled_backups') || 'Scheduled Backups', path: '/super-admin/scheduled-backups', icon: CalendarClock },
  { label: t('external_storage_sync') || 'Cloud Storage Sync', path: '/super-admin/cloud-storage', icon: CloudUpload },
  { label: t('blueprint_docs') || 'Blueprint Docs', path: '/super-admin/blueprint', icon: FileText },
  { label: t('ai_prompt_gen') || 'AI Prompt Gen', path: '/super-admin/prompt-gen', icon: Sparkles },
  { label: t('settings') || 'Settings', path: '/super-admin/settings', icon: Settings },
];

const TEACHER_NAV: (t: any) => NavItem[] = (t) => [
  { label: t('dashboard') || 'Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard },
  { label: t('reports') || 'Student Performance', path: '/teacher/performance', icon: BarChart3 },
  { label: t('academic_calendar') || 'Academic Calendar', path: '/school/academic-calendar', icon: CalendarDays },
  { label: t('class_routine') || 'Class Routine', path: '/teacher/routine', icon: CalendarDays },
  { label: t('attendance') || 'Attendance', path: '/teacher/attendance', icon: Clock },
  { label: t('my_students') || 'My Students', path: '/teacher/students', icon: Users },
  { label: t('marksheet_results') || 'Marks & Results', path: '/teacher/marks', icon: FileText },
  { label: t('homework') || 'Homework', path: '/teacher/homework', icon: BookOpen },
  { label: t('study_materials') || 'Study Materials', path: '/teacher/materials', icon: Package },
  { label: t('lesson_plan') || 'Lesson Plan & AI', path: '/teacher/lesson-plan', icon: Sparkles },
  { label: t('live_classes') || 'Live Classes', path: '/teacher/live-class', icon: Headphones },
  { label: t('leave_requests') || 'Leave Requests', path: '/teacher/leave', icon: CalendarRange },
  { label: t('my_profile') || 'My Profile', path: '/teacher/profile', icon: UserCircle },
];

const STUDENT_NAV: (t: any) => NavItem[] = (t) => [
  { label: t('student_dashboard') || t('dashboard') || 'Student Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
  { label: t('class_routine') || 'Class Routine', path: '/student/routine', icon: CalendarDays },
  { label: t('homework') || 'Homework & Tasks', path: '/student/homework', icon: BookOpen },
  { label: t('online_exams') || 'Online Exams', path: '/student/online-exam', icon: FileText },
  { label: t('fee_payments') || 'Fee Payments', path: '/student/fees', icon: CreditCard },
  { label: t('report_cards_gpa') || 'Report Cards & GPA', path: '/student/results', icon: Award },
  { label: t('leave_petitions') || 'Leave Petitions', path: '/student/leave', icon: CalendarRange },
  { label: t('digital_student_id') || 'Digital Student ID', path: '/student/id-card', icon: UserCircle },
  { label: t('syllabus') || 'Syllabus', path: '/student/syllabus', icon: ScrollText },
  { label: t('study_materials') || 'Study Materials', path: '/student/materials', icon: Package },
  { label: t('library_books') || 'Library Books', path: '/student/library', icon: Library },
  { label: t('my_profile') || 'Student Profile', path: '/student/profile', icon: UserPen },
];

const PARENT_NAV: (t: any) => NavItem[] = (t) => [
  { label: t('parent_dashboard') || t('dashboard') || 'Parent Dashboard', path: '/parent/dashboard', icon: LayoutDashboard },
  { label: t('homework') || "Child's Class Diary", path: '/parent/class-diary', icon: BookOpen },
  { label: t('homework') || 'Homework Monitoring', path: '/parent/homework', icon: ClipboardCheck },
  { label: t('attendance') || 'Attendance Tracking', path: '/parent/attendance', icon: Clock },
  { label: t('fee_payments') || 'Fees & Online Pay', path: '/parent/fees', icon: CreditCard },
  { label: t('marksheet_results') || 'Academic Results', path: '/parent/results', icon: Award },
  { label: t('leave_petitions') || 'Leave Petitions', path: '/parent/leave', icon: CalendarRange },
  { label: t('digital_student_id') || "Child's Digital ID", path: '/parent/id-card', icon: UserCircle },
  { label: t('school_bus_tracking') || 'School Bus Tracking', path: '/parent/transport', icon: Bus },
  { label: t('chat_with_teacher') || 'Chat with Teacher', path: '/parent/chat', icon: MessageSquare },
  { label: t('child_profile') || 'Child Profile', path: '/parent/profile', icon: UserPen },
];

const SCHOOL_ADMIN_NAV: (t: any) => NavItem[] = (t) => [
  { label: t('dashboard') || 'Dashboard', path: '/school', icon: LayoutDashboard },
  { 
    label: t('result_control') || 'Resultcontrol', 
    icon: FileText,
    children: [
        { label: t('marksheet_results') || 'Marksheet & Results', path: '/school/results', icon: FileText },
        { label: t('exam_management') || 'Exam Management', path: '/school/exams', icon: ListTodo },
        { label: t('result_tabulation') || 'Result Tabulation Sheet', path: '/school/results/tabulation', icon: FileSpreadsheet },
        { label: t('reports') || 'Reports Dashboard', path: '/school/reports', icon: BarChart3 },
    ]
  },
  { 
    label: t('font_site_control') || 'Font Site Control', 
    icon: Globe,
    children: [
        { label: t('website_cms') || 'Website CMS & Profile', path: '/school/institution/profile', icon: Building2 },
        { label: t('public_preview') || 'Public School Preview', path: '/school/front-site', icon: ExternalLink },
        { label: t('notices_news') || 'Notices & News', path: '/school/notice/list', icon: Megaphone },
        { label: t('hotline_settings') || 'Hotline Settings', path: '/school/settings/hotline', icon: PhoneIcon },
    ]
  },
  { label: t('activity') || 'Activity', path: '/school/activity', icon: Activity },
  { 
    label: t('accounting') || 'Accounting', 
    icon: Calculator,
    children: [
        { label: t('fee_collection') || 'Fee Collection', path: '/school/accounts', icon: CreditCard },
        { label: t('expense_register') || 'Expense Register', path: '/school/accounts?tab=expenses', icon: Receipt },
        { label: t('transaction_report') || 'Transaction Report', path: '/school/reports?type=fees', icon: TrendingUp },
    ]
  },
  { 
    label: t('admission') || 'Admission Control', 
    icon: UserPlus,
    children: [
        { label: t('student_admission') || 'Student Admission', path: '/school/students/admission', icon: UserPlus },
        { label: t('candidate_list') || 'Candidate List', path: '/school/students/admission-request', icon: FileClock },
        { label: t('bulk_upload') || 'CSV Bulk Upload', path: '/school/students/bulk-upload', icon: FileSpreadsheet },
        { label: t('primary_request') || 'Primary Request', path: '/school/students/primary-request', icon: ShieldQuestion },
    ]
  },
  { label: t('temp_ad') || 'Temporary AD', path: '/school/admissions', icon: Clock },
  { 
    label: t('chat_message') || 'Chat Message', 
    icon: MessageSquare,
    children: [
        { label: t('communication_center') || 'Communication Center', path: '/school/communication', icon: Zap },
        { label: t('messages_sms_inbox') || 'Messages & SMS Inbox', path: '/school/communication?tab=chat', icon: MessageSquare },
    ]
  },
  { 
    label: t('student_seat_plane') || 'Student Seat Plane', 
    icon: Grid,
    children: [
        { label: t('seat_plan_1') || 'Seat Plan 1', path: '/school/seat-plan/1', icon: LayoutGrid },
        { label: t('seat_plan_2') || 'Seat Plan 2', path: '/school/seat-plan/2', icon: Grid },
        { label: t('small_seat_plan') || 'Small Seat Plan', path: '/school/seat-plan/small', icon: Maximize },
    ]
  },
  { 
    label: t('routine_all') || 'Routine All', 
    icon: Table,
    children: [
        { label: t('routine_list') || 'Routine List', path: '/school/routine/list', icon: List },
        { label: t('add_routine') || 'Add Routine', path: '/school/routine/add', icon: PlusSquare },
    ]
  },
  { 
    label: t('attendance') || 'Attendance', 
    icon: Clock,
    children: [
        { label: 'Add Attendance', path: '/school/attendance/add', icon: PlusSquare },
        { label: 'Attendance Report', path: '/school/attendance/report', icon: CalendarRange },
        { label: 'Individual Attendance', path: '/school/attendance/individual', icon: UserSearch },
        { label: 'Holiday Setup', path: '/school/attendance/holiday', icon: TreePalm },
        { label: 'Student Holiday', path: '/school/attendance/student-holiday', icon: UserMinus },
        { label: 'Send SMS', path: '/school/attendance/send-sms', icon: Send },
        { label: 'SMS Settings', path: '/school/attendance/sms-settings', icon: SettingsIcon },
        { label: 'SMS Log', path: '/school/attendance/sms-log', icon: History },
        { label: 'SMS Blocking', path: '/school/attendance/sms-blocking', icon: Ban },
    ]
  },
  { 
    label: t('registration') || 'Registration', 
    icon: ClipboardCheck,
    children: [
        { label: t('add_reg_no') || 'Add Reg No', path: '/school/registration/add', icon: Hash },
        { label: t('reg_card_print') || 'Reg Card Print', path: '/school/registration/print', icon: Printer },
        { label: t('reg_settings') || 'Registration Settings', path: '/school/registration/settings', icon: Settings2 },
    ]
  },
  { 
    label: t('card_info') || 'Card Information', 
    icon: CreditCard,
    children: [
        { label: t('student_id_card') || 'Student ID Card', path: '/school/card-info/student-id', icon: UserCircle },
        { label: t('admit_card') || 'Admit Card', path: '/school/card-info/admit-card', icon: FileBadge },
        { label: t('online_admit_card') || 'Online Admit Card', path: '/school/card-info/online-admit', icon: Globe },
        { label: t('online_admit_card_list') || 'Online Admit Card List', path: '/school/card-info/online-admit-list', icon: List },
        { label: t('guardian_id_card') || 'Guardian ID Card', path: '/school/card-info/guardian-id', icon: Users },
        { label: t('admit_card_settings') || 'Admit Card Settings', path: '/school/card-info/admit-settings', icon: Settings },
        { label: t('student_card_settings') || 'Student Card Settings', path: '/school/card-info/student-settings', icon: Settings2 },
        { label: t('student_card_settings_front') || 'Student Card Front', path: '/school/card-info/student-settings-front', icon: Square },
        { label: t('student_card_settings_back') || 'Student Card Back', path: '/school/card-info/student-settings-back', icon: Square },
    ]
  },
  { 
    label: t('card_expiry') || 'Card Expiry', 
    icon: CalendarX,
    children: [
        { label: t('student_card_expiry_add') || 'Student Card Expiry Add', path: '/school/card-expiry/student-add', icon: CalendarPlus },
        { label: t('manage_guardian_card_expiry') || 'Manage Guardian Card Expiry', path: '/school/card-expiry/guardian-manage', icon: UserCheck2 },
    ]
  },
  { 
    label: t('testimonial') || 'Testimonial', 
    icon: Award,
    children: [
        { label: t('testimonial') || 'Testimonial List', path: '/school/testimonial/list', icon: Award },
        { label: t('settings_testimonial') || 'Settings Testimonial', path: '/school/testimonial/settings', icon: Settings2 },
    ]
  },
  { 
    label: t('basic_certificate') || 'Basic Certificate', 
    icon: FileBadge,
    children: [
        { label: t('certificate') || 'Certificate List', path: '/school/certificates/list', icon: FileBadge },
        { label: t('settings_certificate') || 'Settings Certificate', path: '/school/certificates/settings', icon: Settings2 },
    ]
  },
  { 
    label: t('academic_setup') || 'Academic Setup', 
    icon: Settings2,
    children: [
        { label: t('add_class') || 'Add Class', path: '/school/academic-setup/class', icon: PlusCircle },
        { label: t('add_group') || 'Add Group', path: '/school/academic-setup/group', icon: LayoutGrid },
        { label: t('add_session') || 'Add Session', path: '/school/academic-setup/session', icon: CalendarDays },
        { label: t('add_section') || 'Add Section', path: '/school/academic-setup/section', icon: Layers },
        { label: t('add_shift') || 'Add Shift', path: '/school/academic-setup/shift', icon: Clock },
    ]
  },
  { 
    label: t('teacher_panel') || 'Teacher Panel', 
    icon: UserCheck,
    children: [
        { label: t('teacher_list') || 'Teacher List', path: '/school/teacher-panel/list', icon: Users },
        { label: t('teacher_reg_new') || 'Teacher Registration', path: '/school/teacher-panel/registration', icon: UserPlus },
        { label: t('leave_application') || 'Leave Approval Workflow', path: '/school/leave-approval', icon: CalendarRange },
        { label: t('settings') || 'Leave Policies & Rules', path: '/school/leave-policies', icon: SlidersHorizontal },
        { label: t('add_teacher_subject') || 'Add Teacher Subject', path: '/school/teacher-panel/subjects', icon: BookOpen },
        { label: t('teacher_print_list') || 'Teacher Print List', path: '/school/teacher-panel/print', icon: Printer },
        { label: t('send_sms_teacher') || 'Send SMS Teacher', path: '/school/teacher-panel/sms-credentials', icon: SmartphoneNfc },
        { label: t('teacher_id_card') || 'Teacher ID Card', path: '/school/teacher-panel/id-card', icon: CreditCard },
        { label: t('teacher_card_settings') || 'Teacher Card Settings', path: '/school/teacher-panel/card-settings', icon: Settings },
    ]
  },
  { 
    label: t('sms_panel') || 'SMS Panel', 
    icon: SmartphoneNfc,
    children: [
        { label: t('sms_panel') || 'SMS Panel Dashboard', path: '/school/sms/dashboard', icon: MessageSquare },
        { label: t('communication_center') || 'Communication Center', path: '/school/communication', icon: Zap },
        { label: t('sms_settings') || 'SMS Settings', path: '/school/attendance/sms-settings', icon: SettingsIcon },
        { label: t('sms_log') || 'SMS Log', path: '/school/sms/log', icon: History },
    ]
  },
  { 
    label: t('note_notification') || 'Note Notification', 
    icon: Bell,
    children: [
        { label: t('add_notification') || 'Add Notification', path: '/school/notifications/add', icon: PlusCircle },
        { label: t('notification_list') || 'Notification List', path: '/school/notifications/list', icon: List },
    ]
  },
  { label: t('student_call_sms') || 'Send Push Notification', path: '/school/communication', icon: Send },
  { 
    label: t('staff_entry') || 'Staff Entry', 
    icon: Contact,
    children: [
        { label: t('add_staff_entry') || 'Add Staff Entry', path: '/school/staff/add', icon: PlusCircle },
        { label: t('show_staff') || 'Show Staff List', path: '/school/staff/list', icon: Users },
        { label: t('staff_print_list') || 'Staff Print List', path: '/school/staff/print', icon: Printer },
        { label: t('send_mobile_sms') || 'Send Mobile SMS', path: '/school/staff/sms', icon: Smartphone },
        { label: t('staff_id_card') || 'Staff ID Card', path: '/school/staff/id-card', icon: IDCardIcon },
        { label: t('staff_card_settings') || 'Staff Card Settings', path: '/school/staff/card-settings', icon: Settings },
    ]
  },
  { 
    label: t('notice') || 'Notice', 
    icon: Megaphone,
    children: [
        { label: t('add_notice') || 'Add Notice', path: '/school/notice/add', icon: PlusCircle },
        { label: t('show_notice') || 'Show Notice List', path: '/school/notice/list', icon: List },
    ]
  },
  { 
    label: t('promotion') || 'Promotion', 
    icon: ArrowUpCircle,
    children: [
        { label: t('student_promotion') || 'Student Promotion', path: '/school/promotion/student', icon: PromotionIcon },
        { label: t('student_permission') || 'Student Permission', path: '/school/promotion/permission', icon: PermissionIcon },
    ]
  },
  { 
    label: t('role_management') || 'User & Role Management', 
    icon: ShieldCheck,
    children: [
        { label: t('user_list') || 'Student & User List', path: '/school/students/list', icon: Users },
        { label: t('permissions') || 'Permissions', path: '/school/roles/permissions', icon: KeyIcon },
        { label: t('manage_roles') || 'Manage Roles', path: '/school/roles/list', icon: ShieldCheck },
        { label: t('add_user_pass') || 'Student Credentials & Pass', path: '/school/students/add-credentials', icon: Key },
        { label: t('pass_active_deactivate') || 'Pass Active / Deactivate', path: '/school/students/credentials-status', icon: LockKeyhole },
    ]
  },
  { 
    label: t('visitor_portal') || 'Visitor Portal', 
    icon: Eye,
    children: [
        { label: t('add_visitor_entry') || 'Add Visitor Entry', path: '/school/visitors/add', icon: PlusCircle },
        { label: t('visitor_show') || 'Visitor Show', path: '/school/visitors/list', icon: List },
        { label: t('visitor_sms') || 'Visitor SMS', path: '/school/visitors/sms', icon: Send },
    ]
  },
  { 
    label: t('backup') || 'Backup', 
    icon: Database,
    children: [
        { label: t('db_backup_restore') || 'DB Backup & Restore', path: '/school/backup/database', icon: DatabaseBackup },
        { label: t('assets_backup_restore') || 'Assets Backup & Restore', path: '/school/backup/assets', icon: FileStack },
    ]
  },
  { 
    label: t('correction_text') || 'Correction text', 
    icon: FileType,
    children: [
        { label: t('correction_text') || 'Correction Text Settings', path: '/school/settings/correction', icon: FileType },
        { label: 'Theme & Brand Customization', path: '/school/settings/theme', icon: Palette },
        { label: t('hotline_settings') || 'Hotline Settings', path: '/school/settings/hotline', icon: PhoneIcon },
        { label: t('admission_form_en') || 'Admission Form EN', path: '/school/settings/admission-en', icon: FileStack },
        { label: t('admission_form_bn') || 'Admission Form BN', path: '/school/settings/admission-bn', icon: FileStack },
        { label: t('settings') || 'General Settings', path: '/school/settings/general', icon: SettingsIcon },
    ]
  },
  { 
    label: 'Document Vault', 
    icon: FolderArchive,
    children: [
        { label: 'All Documents', path: '/school/documents', icon: FolderArchive },
        { label: 'Student Records', path: '/school/documents?category=student-records', icon: Users },
        { label: 'Fee Receipts', path: '/school/documents?category=fee-receipts', icon: Calculator },
        { label: 'Academic Certificates', path: '/school/documents?category=academic-certificates', icon: FileBadge },
        { label: 'Secure Upload', path: '/school/documents?action=upload', icon: ShieldCheck },
    ]
  },
  { label: t('academic_calendar') || 'Academic Calendar', path: '/school/academic-calendar', icon: CalendarDays },
  { label: 'Library Management', path: '/school/library', icon: Library },
];

const Sidebar: React.FC<{ items: NavItem[]; mobileOpen: boolean; setMobileOpen: (o: boolean) => void }> = ({ items, mobileOpen, setMobileOpen }) => {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const { user, activeTenant, logout } = useAuth();
  const { tenant } = useTenant();

  const brandColor = tenant?.primaryColor || activeTenant?.primaryColor || '#4F46E5';
  const logoUrl = tenant?.logoUrl || activeTenant?.logoUrl;
  const schoolName = tenant?.name || activeTenant?.name || user?.tenantName || 'Smart Amar School';
  const sidebarTheme = tenant?.sidebarTheme || 'dark';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside 
        style={
          sidebarTheme === 'brand-tinted'
            ? { backgroundImage: `linear-gradient(to bottom, #0f172a, ${brandColor}22, #020617)` }
            : undefined
        }
        className={`fixed top-0 ${isRTL ? 'right-0' : 'left-0'} z-30 w-64 h-screen transition-transform duration-300 transform ${
          sidebarTheme === 'midnight' ? 'bg-black' : 'bg-slate-900'
        } text-white flex flex-col ${mobileOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full')} lg:translate-x-0 shadow-xl border-r border-slate-800`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800 bg-slate-950">
          <div className="min-w-0 flex-1">
             <div className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden text-white shadow-xs border border-white/10"
                  style={{ backgroundColor: brandColor }}
                >
                  {logoUrl ? (
                    <img src={logoUrl} alt={schoolName} className="w-full h-full object-cover" />
                  ) : (
                    (schoolName || 'S').charAt(0)
                  )}
                </div>
                <span className="truncate">Smart<span style={{ color: brandColor }}>Amar</span>School</span>
             </div>
             {(user?.role === UserRole.SCHOOL_ADMIN || activeTenant || tenant) && (
               <p className="text-[10px] text-amber-300 font-bold truncate max-w-[190px] mt-0.5 flex items-center gap-1">
                 <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: brandColor }} />
                 <span className="truncate">{schoolName}</span>
               </p>
             )}
          </div>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden text-slate-400">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-0.5 overflow-y-auto custom-scrollbar">
          {items.map((item, idx) => (
            <SidebarNavItem 
                key={idx} 
                item={item} 
                isRTL={isRTL} 
                t={t} 
                setMobileOpen={setMobileOpen} 
                brandColor={brandColor}
            />
          ))}
        </nav>

        {/* User Card in Sidebar Footer */}
        {user && (
          <div className="px-3 pt-3 border-t border-slate-800/80 bg-slate-950/70">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
              <div 
                className="w-9 h-9 rounded-lg text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden ring-1 ring-white/10"
                style={{ backgroundColor: brandColor }}
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name || 'User'} className="w-full h-full object-cover" />
                ) : (
                  (user.name?.charAt(0) || user.role?.charAt(0) || 'U').toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{user.name || 'User'}</p>
                <p className="text-[10px] text-slate-400 font-mono truncate">
                  {user.role === UserRole.STUDENT
                    ? `${user.studentClass || 'Class 10'} • Roll: ${user.studentRoll || '101'}`
                    : user.role === UserRole.PARENT
                    ? `Child: ${user.studentData?.name || 'Student'}`
                    : user.role === UserRole.SCHOOL_ADMIN
                    ? (user.tenantName || activeTenant?.name || 'School Admin')
                    : (user.role ? String(user.role).replace(/_/g, ' ') : 'User')}
                </p>
              </div>
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: brandColor }} title="Active"></span>
            </div>
          </div>
        )}

        <div className="p-3 bg-slate-950">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
          >
            <LogOut className={`w-5 h-5 ${isRTL ? 'ml-3' : 'mr-3'}`} />
            {t('logout')}
          </button>
        </div>
      </aside>
    </>
  );
};

/**
 * Interface definition for DashboardLayout component props.
 */
interface LayoutProps {
  children: React.ReactNode;
  role: UserRole;
}

export const DashboardLayout: React.FC<LayoutProps> = ({ children, role }) => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { language, setLanguage, t, isRTL } = useLanguage();

  const [admissionNotifications, setAdmissionNotifications] = useState<AdmissionWorkflowNotification[]>(() =>
    getAdmissionWorkflowNotifications()
  );
  const [pendingLeavesCount, setPendingLeavesCount] = useState<number>(() => getPendingLeaveCount());
  const { user, activeTenant } = useAuth();
  const { tenant, tenantSubdomain } = useTenant();

  const brandColor = tenant?.primaryColor || activeTenant?.primaryColor || '#4F46E5';
  const logoUrl = tenant?.logoUrl || activeTenant?.logoUrl;
  const schoolName = tenant?.name || activeTenant?.name || user?.tenantName || 'Smart Amar School';

  useEffect(() => {
    const handleUpdate = () => {
      setAdmissionNotifications(getAdmissionWorkflowNotifications());
    };
    window.addEventListener(ADMISSION_WORKFLOW_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(ADMISSION_WORKFLOW_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  useEffect(() => {
    const updatePending = () => {
      setPendingLeavesCount(getPendingLeaveCount());
    };
    updatePending();
    const unsubscribe = subscribeToLeaveUpdates(updatePending);
    return () => unsubscribe();
  }, []);

  const unreadAlertsCount = admissionNotifications.filter(n => !n.read).length;

  // Keyboard shortcut listener for Global Search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  const COLORS = [
    { name: 'Indigo', bg: 'bg-indigo-600' },
    { name: 'Blue', bg: 'bg-blue-600' },
    { name: 'Green', bg: 'bg-green-600' },
    { name: 'Red', bg: 'bg-red-600' },
    { name: 'Purple', bg: 'bg-purple-600' },
  ];

  let navItems = 
    role === UserRole.SUPER_ADMIN 
      ? SUPER_ADMIN_NAV(t) 
      : role === UserRole.TEACHER 
      ? TEACHER_NAV(t) 
      : role === UserRole.STUDENT 
      ? STUDENT_NAV(t)
      : role === UserRole.PARENT 
      ? PARENT_NAV(t)
      : SCHOOL_ADMIN_NAV(t);

  return (
    <div className={`min-h-screen bg-slate-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      <Sidebar items={navItems} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      
      {/* Global Search Dialog */}
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} userRole={role} />

      <div className={`${isRTL ? 'lg:mr-64' : 'lg:ml-64'} flex flex-col min-h-screen`}>
        <header className="sticky top-0 z-10 bg-white border-b border-slate-200 h-16 flex items-center px-4 lg:px-8 shadow-xs justify-between gap-4 relative">
          {/* Top Brand Accent Line */}
          <div 
            className="absolute top-0 left-0 right-0 h-[2.5px] transition-colors duration-300" 
            style={{ backgroundColor: brandColor }} 
          />
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setMobileOpen(!mobileOpen)} className="text-slate-500 hover:text-indigo-600 transition-colors shrink-0">
              <Menu size={20} />
            </button>
            
            {/* Branded Institution Identity Pill in Header */}
            <div className="flex items-center gap-2.5 shrink-0 min-w-0">
              <div 
                className="w-8 h-8 rounded-xl overflow-hidden border border-slate-200 shadow-2xs flex items-center justify-center text-white font-black text-xs shrink-0"
                style={{ backgroundColor: brandColor }}
              >
                {logoUrl ? (
                  <img src={logoUrl} alt={schoolName} className="w-full h-full object-cover" />
                ) : (
                  (schoolName || 'S').charAt(0)
                )}
              </div>
              <div className="hidden sm:block shrink-0 min-w-0">
                <h1 className="text-xs sm:text-sm font-bold text-slate-800 truncate max-w-[240px]">
                  {schoolName}
                </h1>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: brandColor }} />
                  <span className="text-[10px] font-bold" style={{ color: brandColor }}>
                    {role === UserRole.TEACHER 
                      ? 'Teacher Portal' 
                      : role === UserRole.STUDENT 
                      ? `Student Portal • Roll: ${user?.studentRoll || '101'}`
                      : role === UserRole.PARENT 
                      ? `Parent Portal • ${user?.guardianName || 'Guardian'}`
                      : role === UserRole.SCHOOL_ADMIN
                      ? 'Administration Hub'
                      : 'Smart Amar School'}
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Global Search Bar in Header */}
            <HeaderGlobalSearchBar
              userRole={role}
              onOpenFullModal={() => setSearchOpen(true)}
            />
          </div>

          <div className="flex items-center space-x-2 lg:space-x-4 space-x-reverse shrink-0">
             {/* Quick Leave Approval / My Leaves Header Action */}
             {role === UserRole.SCHOOL_ADMIN && (
                <Link
                  to="/school/leave-approval"
                  className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    pendingLeavesCount > 0
                      ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                  title="Teacher Leave Sanctioning Desk"
                >
                  <CalendarRange size={14} className={pendingLeavesCount > 0 ? 'text-amber-700 animate-pulse' : 'text-slate-500'} />
                  <span>Leave Approvals</span>
                  {pendingLeavesCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-600 text-white">
                      {pendingLeavesCount}
                    </span>
                  )}
                </Link>
             )}

             {role === UserRole.TEACHER && (
                <Link
                  to="/teacher/leave"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-all border border-indigo-200"
                  title="My Leave Requests & Quotas"
                >
                  <CalendarRange size={14} className="text-indigo-600" />
                  <span>Leave Portal</span>
                </Link>
             )}

             {role === UserRole.STUDENT && (
                <Link
                  to="/student/id-card"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-all border border-indigo-200"
                  title="View Digital Student ID Card"
                >
                  <IDCardIcon size={14} className="text-indigo-600" />
                  <span>Digital ID</span>
                </Link>
             )}

             {role === UserRole.PARENT && (
                <Link
                  to="/parent/id-card"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-all border border-indigo-200"
                  title="Child's Digital ID Card"
                >
                  <IDCardIcon size={14} className="text-indigo-600" />
                  <span>Child ID</span>
                </Link>
             )}

             {/* Centralized Notification Bell for Students, Parents, Teachers, and Admins */}
             <CentralNotificationBell variant="navbar" />

             {/* Additional Teacher Leave Workflow Bell for Teachers */}
             {role === UserRole.TEACHER && (
                <TeacherNotificationBell teacherId="EMP-001" variant="navbar" />
             )}

             {/* Admission & System Workflow Alert Bell for School Admin */}
             {role === UserRole.SCHOOL_ADMIN && (
                <div className="relative">
                  <button 
                    id="navbar-notification-bell-btn"
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors relative cursor-pointer"
                    title="Admission System Alerts"
                  >
                     <Bell size={18} />
                     {unreadAlertsCount > 0 && (
                       <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-amber-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 border-2 border-white shadow-xs">
                         {unreadAlertsCount}
                       </span>
                     )}
                  </button>

                  {notificationsOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setNotificationsOpen(false)}></div>
                      <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-30 animate-in fade-in slide-in-from-top-2`}>
                        <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                              Admission & System Alerts
                            </span>
                            {unreadAlertsCount > 0 && (
                              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                {unreadAlertsCount} Pending
                              </span>
                            )}
                          </div>
                          {unreadAlertsCount > 0 && (
                            <button
                              onClick={() => {
                                markAllWorkflowNotificationsAsRead();
                                setAdmissionNotifications(getAdmissionWorkflowNotifications());
                              }}
                              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                            >
                              Mark all read
                            </button>
                          )}
                        </div>

                        <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                          {admissionNotifications.length === 0 ? (
                            <div className="p-6 text-center text-xs text-slate-400">
                              No active workflow notifications
                            </div>
                          ) : (
                            admissionNotifications.slice(0, 5).map(item => (
                              <div 
                                key={item.id}
                                onClick={() => {
                                  markWorkflowNotificationAsRead(item.id);
                                  setAdmissionNotifications(getAdmissionWorkflowNotifications());
                                  setNotificationsOpen(false);
                                  navigate('/school/communication');
                                }}
                                className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition-colors flex items-start gap-2.5 ${!item.read ? 'bg-indigo-50/50' : ''}`}
                              >
                                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!item.read ? 'bg-indigo-600' : 'bg-transparent'}`}></div>
                                <div className="space-y-0.5 flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="font-bold text-slate-800 truncate">{item.studentName}</span>
                                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                                      {item.status}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight">
                                    {item.message}
                                  </p>
                                  <div className="text-[9.5px] font-bold text-indigo-600 pt-0.5">
                                    Class: {item.appliedClass} • Ref: {item.applicationId}
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        <div className="p-2.5 border-t border-slate-100 bg-slate-50 rounded-b-xl text-center">
                          <Link
                            to="/school/communication"
                            onClick={() => setNotificationsOpen(false)}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
                          >
                            <span>Open Communication Center</span>
                            <ChevronRight size={14} />
                          </Link>
                        </div>
                      </div>
                    </>
                  )}
                </div>
             )}

             {/* Year Selector matching screenshot */}
             <div className="flex items-center gap-1.5 bg-slate-900 text-white px-2.5 py-1.5 rounded-lg text-xs font-bold border border-slate-700 shadow-xs">
                <span className="text-slate-300">Year :</span>
                <select 
                  className="bg-transparent text-emerald-400 font-mono font-bold outline-none cursor-pointer text-xs pr-1"
                  defaultValue="2026"
                >
                  <option value="2026" className="bg-slate-900 text-white">2026</option>
                  <option value="2025" className="bg-slate-900 text-white">2025</option>
                  <option value="2024" className="bg-slate-900 text-white">2024</option>
                </select>
             </div>

             {/* Color / Theme Quick Selector */}
             <div className="relative">
                <button 
                  id="header-theme-color-btn"
                  onClick={() => setColorOpen(!colorOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  title="Theme & Brand Color"
                >
                   <span 
                     className="w-3.5 h-3.5 rounded-full border border-white shadow-2xs" 
                     style={{ backgroundColor: brandColor }} 
                   />
                   <span className="hidden sm:inline">Theme</span>
                </button>
                {colorOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setColorOpen(false)}></div>
                    <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-30 animate-in fade-in slide-in-from-top-1`}>
                        <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-100">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Quick Brand Color</p>
                          <span className="font-mono text-[9px] font-bold text-slate-600 uppercase">{brandColor}</span>
                        </div>
                        <div className="grid grid-cols-5 gap-1.5 mb-3">
                            {PRESET_BRAND_COLORS.map(c => (
                                <button
                                  key={c.id} 
                                  onClick={() => {
                                    updateTenantTheme(tenantSubdomain || tenant?.id || 'sonar-bangla', { primaryColor: c.hex });
                                    setColorOpen(false);
                                  }}
                                  className="w-7 h-7 rounded-lg transition-transform hover:scale-110 flex items-center justify-center relative cursor-pointer"
                                  style={{ backgroundColor: c.hex }}
                                  title={c.name}
                                >
                                  {brandColor.toLowerCase() === c.hex.toLowerCase() && (
                                    <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                                  )}
                                </button>
                            ))}
                        </div>
                        <div className="pt-2 border-t border-slate-100">
                          <Link
                            to="/school/settings/theme"
                            onClick={() => setColorOpen(false)}
                            className="w-full text-center py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold flex items-center justify-center gap-1 transition"
                          >
                            <Palette size={13} style={{ color: brandColor }} />
                            <span>Logo & Theme Customizer</span>
                          </Link>
                        </div>
                    </div>
                  </>
                )}
             </div>

             {/* Global Language Switcher (Bilingual English <-> Bangla) */}
             <div className="flex items-center">
                <GlobalLanguageSwitcher variant="segmented" size="sm" showLabels={true} />
             </div>

             {/* Settings Link */}
             <Link 
                to={role === UserRole.TEACHER ? "/teacher/profile" : "/school/settings/theme"} 
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                title={role === UserRole.TEACHER ? "Teacher Profile" : "Settings"}
             >
                <Settings size={14} className="text-slate-600" />
                <span className="hidden sm:inline">Setting</span>
             </Link>

             <div className={`flex items-center gap-3 ${isRTL ? 'pr-4 border-r' : 'pl-4 border-l'} border-slate-200`}>
                <Link 
                  to={role === UserRole.TEACHER ? "/teacher/profile" : role === UserRole.STUDENT ? "/student/profile" : role === UserRole.PARENT ? "/parent/profile" : "/school/settings/theme"}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-indigo-100 cursor-pointer overflow-hidden"
                  style={{ backgroundColor: brandColor }}
                >
                   {user?.avatar ? (
                     <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                   ) : role === UserRole.SUPER_ADMIN ? 'SA' : role === UserRole.TEACHER ? 'T' : role === UserRole.STUDENT ? 'ST' : role === UserRole.PARENT ? 'P' : 'A'}
                </Link>
             </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto print:p-0 print:overflow-visible">
          {children}
        </main>
      </div>
    </div>
  );
};

export const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-200">S</div>
            <span className="text-xl font-bold text-slate-900">Smart<span className="text-indigo-600">Amar</span>School</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link to="/" className="hover:text-indigo-600 transition-colors">Home</Link>
            <Link to="/madrasa" className="text-emerald-900 bg-emerald-100/80 hover:bg-emerald-200 border border-emerald-300 px-3 py-1 rounded-full text-xs font-black transition-colors flex items-center gap-1.5 shadow-xs">
              <Compass size={14} className="text-emerald-700" />
              <span>আল-আমিন মাদ্রাসা সাইট</span>
            </Link>
            <Link to="/sonar-bangla" className="text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs">
              <School size={14} className="text-indigo-600" />
              <span>স্কুল সাইট</span>
            </Link>
            <Link to="/institutions" className="hover:text-indigo-600 transition-colors font-medium text-indigo-600">প্রতিষ্ঠানসমূহ</Link>
            <Link to="/about" className="hover:text-indigo-600 transition-colors">About</Link>
            <Link to="/pricing" className="hover:text-indigo-600 transition-colors">Pricing</Link>
            <Link to="/contact" className="hover:text-indigo-600 transition-colors">Contact</Link>
            <GlobalLanguageSwitcher variant="segmented" size="sm" showLabels={true} />
            <Button size="sm" onClick={() => navigate('/login')}>Login</Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="bg-slate-50 border-t border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-4 pt-8 border-t border-slate-200 text-center text-slate-400 text-xs">
          <p>© 2024 Smart Amar School System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export { Header, GlobalLanguageSwitcher };