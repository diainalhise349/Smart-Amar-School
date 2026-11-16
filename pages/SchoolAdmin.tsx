
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Users, UserPlus, Grid, Table, Calendar, Clock, ClipboardCheck, 
  CreditCard, FileText, Settings, UserCheck, MessageSquare, 
  Bell, Contact, Megaphone, ArrowUpCircle, Eye, Calculator, 
  FileBadge, Database, CheckSquare, Phone, Send, Receipt, 
  FileSearch, Settings2, BarChart3, ChevronDown, ListTodo, 
  History, CreditCard as CardIcon, LayoutGrid, Layers, FolderPlus,
  Activity, Upload, X, GraduationCap, Plus, Save, MapPin, Trash2, Printer, Search, RefreshCw,
  Mail, CalendarDays, CheckCircle2, Loader2, Download, Copy, Trash, MoreHorizontal,
  Edit, AlertCircle, Camera, Filter, CheckCircle, ChevronRight, Play, Key, UserCheck2, ShieldCheck, Power, Smartphone, SmartphoneNfc, GraduationCap as TeacherIcon, ArrowLeft,
  Briefcase, Fingerprint, CloudUpload, UserMinus, UserCog, CheckCircle2 as VerifiedIcon, Award, TrendingUp,
  FolderArchive, FolderLock, CalendarRange, FileSpreadsheet, Sparkles,
  Globe, ExternalLink, Share2, School, Check, LogIn, Palette
} from 'lucide-react';
import { DashboardLayout } from '../components/Layout';
import { Card, Button, Badge, Modal, Input, SmartDataTable, useToast, ImageUpload } from '../components/UIComponents';
import { StudentAdmissionForm } from '../components/StudentAdmissionForm';
import { AdmissionTrendsWidget } from '../components/AdmissionTrendsWidget';
import { SchoolMetricsDashboard } from '../components/SchoolMetricsDashboard';
import { TopStudentsAndAttendanceWidget } from '../components/TopStudentsAndAttendanceWidget';
import { StudentProgressCharts } from '../components/StudentProgressCharts';
import { StudentBulkUpload } from '../components/StudentBulkUpload';
import { StudentIDCardGenerator } from '../components/StudentIDCardGenerator';
import { StudentIDCard } from '../components/StudentIDCard';
import { TeacherLeaveAnalyticsWidget } from '../components/TeacherLeaveAnalyticsWidget';
import { LeaveQuickStatusWidget } from '../components/LeaveQuickStatusWidget';
import { StaffLeaveCalendarWidget } from '../components/StaffLeaveCalendarWidget';
import { RecentLeaveHistoryTable } from '../components/RecentLeaveHistoryTable';
import { CommunicationCenter as CommunicationCenterComponent } from '../components/CommunicationCenter';
import { SchoolSettingsContent } from '../components/SchoolSettingsContent';
import { DataBackupExportModule } from '../components/DataBackupExportModule';
import { UserRole, Student } from '../types';
import { MOCK_STUDENTS, MOCK_STAFF, MOCK_CLASSES } from '../constants';
import { getStoredStudents, subscribeToStudents, deleteStudent } from '../utils/studentStorage';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useTenant, useTenantId, useTenantFiltered } from '../context/TenantContext';
import { 
  getStoredTenants, 
  getTenantStudents, 
  getTenantStaff, 
  getTenantMetrics, 
  getTenantClassWiseDistribution, 
  getTenantBySubdomain 
} from '../utils/tenantStorage';
import { Link, useNavigate } from 'react-router-dom';
import { PDFExportModal } from '../components/PDFExportModal';
import { exportStudentListToPDF, exportSeatPlanToPDF, exportPerformanceReportToPDF, exportFeeRegisterToPDF, exportTableToPDF } from '../utils/pdfExport';
import { getLeaveApplications, getPendingLeaveCount, subscribeToLeaveUpdates } from '../utils/leaveWorkflow';

interface TopMetricProps {
  icon: any;
  number: string | number;
  label: string;
  bgColor: string;
  secondaryStat?: { label: string; value: string | number };
}

const TopMetricCard: React.FC<TopMetricProps> = ({
  icon: Icon,
  number,
  label,
  bgColor,
  secondaryStat
}) => (
  <div className={`p-4 sm:p-5 rounded-2xl text-white shadow-sm flex flex-col justify-between min-h-[110px] ${bgColor} relative overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5`}>
    <div className="flex items-start justify-between">
      <div className="p-2.5 rounded-xl bg-white/20 backdrop-blur-xs text-white shadow-2xs">
        <Icon size={22} className="stroke-[2.5]" />
      </div>
      {secondaryStat && (
        <div className="text-right">
          <div className="text-sm font-black leading-tight">{secondaryStat.value}</div>
          <div className="text-[10px] text-white/85 font-bold uppercase tracking-wider">{secondaryStat.label}</div>
        </div>
      )}
    </div>
    <div className="mt-2.5">
      <div className="text-2xl sm:text-3xl font-black leading-tight tracking-tight">{number}</div>
      <div className="text-xs font-semibold text-white/95 mt-0.5">{label}</div>
    </div>
  </div>
);

interface ActionTileProps {
  icon: any;
  badgeBg: string;
  title: string;
  link: string;
}

const ActionTile: React.FC<ActionTileProps> = ({
  icon: Icon,
  badgeBg,
  title,
  link
}) => {
  const { t } = useLanguage();
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 sm:p-5 flex flex-col items-center justify-between text-center hover:shadow-md transition-all group min-h-[150px]">
      <div className={`w-12 h-12 rounded-full ${badgeBg} text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform`}>
        <Icon size={20} className="stroke-[2.2]" />
      </div>
      <h4 className="text-xs sm:text-sm font-bold text-slate-800 mt-2.5 px-1 line-clamp-1">{title}</h4>
      <Link
        to={link}
        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-xs transition-colors mt-2"
      >
        <span>{t('view_action', '➔ View')}</span>
      </Link>
    </div>
  );
};

export const SchoolDashboard = () => {
    const { t, formatNumber } = useLanguage();
    const { 
        tenantId, 
        tenantSubdomain, 
        tenant: activeTenant, 
        tenantName, 
        tenantType, 
        allTenants: tenantsList, 
        switchTenant, 
        scopedStudents: students, 
        scopedMetrics: metrics, 
        scopedClassWiseRows: classWiseRows 
    } = useTenant();
    const { addToast } = useToast();
    const [selectedYear, setSelectedYear] = useState('2026');

    const totalStudentsCount = useMemo(() => {
        return classWiseRows.reduce((acc, row) => acc + row.total, 0);
    }, [classWiseRows]);

    return (
        <DashboardLayout role={UserRole.SCHOOL_ADMIN}>
            {/* INSTITUTION ISOLATION BANNER & QUICK TENANT SWITCHER */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 mb-5 shadow-lg border border-indigo-900/40 relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-indigo-600 flex items-center justify-center text-white shadow-md font-black text-xl shrink-0">
                            {activeTenant.type === 'Madrasa' ? 'ম' : 'স্'}
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                                    {activeTenant.name}
                                </h1>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-wider">
                                    {activeTenant.type === 'Madrasa' ? 'মাদরাসা ড্যাশবোর্ড' : 'স্কুল ড্যাশবোর্ড'}
                                </span>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30">
                                    EIIN: {activeTenant.eiin || '138765'}
                                </span>
                            </div>
                            <p className="text-xs text-indigo-200/90 mt-1 flex flex-wrap items-center gap-3">
                                <span>
                                    🔒 <strong>প্রতিষ্ঠান আইসোলেশন মোড:</strong> এই ড্যাশবোর্ডে শুধুমাত্র {activeTenant.name}-এর নিজস্ব তথ্য ও ডাটা প্রদর্শিত হচ্ছে।
                                </span>
                                <span>•</span>
                                <span className="font-mono text-slate-300">কোড: {activeTenant.code}</span>
                                <span>•</span>
                                <span className="font-mono text-slate-300">শিক্ষাবর্ষ: {formatNumber(selectedYear)}</span>
                            </p>
                        </div>
                    </div>

                    {/* Quick Tenant Switcher Dropdown */}
                    <div className="flex items-center gap-2 bg-white/10 p-1.5 rounded-xl border border-white/15 backdrop-blur-md">
                        <span className="text-[11px] font-bold text-indigo-200 px-2 shrink-0">
                            প্রতিষ্ঠান পরিবর্তন:
                        </span>
                        <select
                            value={activeTenant.subdomain}
                            onChange={(e) => {
                                switchTenant(e.target.value);
                                addToast(`সুইচ করা হয়েছে: ${getTenantBySubdomain(e.target.value).name}`, 'info');
                            }}
                            className="bg-slate-900 text-white text-xs font-bold rounded-lg px-3 py-1.5 border border-indigo-400/40 outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
                        >
                            {tenantsList.map(t => (
                                <option key={t.id} value={t.subdomain} className="bg-slate-900 text-white">
                                    {t.name} ({t.type})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* 1. TOP METRIC CARDS (8 solid colored stat cards - 2 rows x 4 columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <TopMetricCard 
                    icon={GraduationCap} 
                    number={formatNumber(metrics.todayAdmission)} 
                    label={t('today_admission', "Today's New Admission")} 
                    bgColor="bg-[#1e7e34]" 
                />
                <TopMetricCard 
                    icon={Users} 
                    number={formatNumber(metrics.totalStudents)} 
                    label={`${t('total_students', 'Total Students')} (${formatNumber(selectedYear)})`} 
                    secondaryStat={{ label: t('all_time', 'All Time'), value: formatNumber(metrics.allTimeStudents) }} 
                    bgColor="bg-[#28a745]" 
                />
                <TopMetricCard 
                    icon={Clock} 
                    number={formatNumber(metrics.pendingStudents)} 
                    label={t('pending_students', 'Pending Students')} 
                    bgColor="bg-[#5cb85c]" 
                />
                <TopMetricCard 
                    icon={School} 
                    number={formatNumber(metrics.totalClasses)} 
                    label={t('total_classes', 'Total Classes')} 
                    bgColor="bg-[#c0ca33]" 
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <TopMetricCard 
                    icon={Layers} 
                    number={formatNumber(metrics.totalSections)} 
                    label={t('total_sections', 'Total Sections')} 
                    bgColor="bg-[#009688]" 
                />
                <TopMetricCard 
                    icon={Users} 
                    number={formatNumber(metrics.totalGroups)} 
                    label={t('total_groups', 'Total Groups')} 
                    bgColor="bg-[#00bcd4]" 
                />
                <TopMetricCard 
                    icon={Calendar} 
                    number={formatNumber(selectedYear)} 
                    label={t('academic_year', 'Current Academic Year')} 
                    bgColor="bg-[#00838f]" 
                />
                <TopMetricCard 
                    icon={Clock} 
                    number={formatNumber(metrics.totalShifts)} 
                    label={t('total_shifts', 'Total Shifts')} 
                    secondaryStat={{ label: 'শিফট', value: metrics.shiftName }}
                    bgColor="bg-[#263238]" 
                />
            </div>

            {/* INTERACTIVE METRICS DASHBOARD (RECHARTS) */}
            <SchoolMetricsDashboard 
                institutionName={activeTenant.name} 
                tenantSubdomain={activeTenant.subdomain}
                tenantType={activeTenant.type}
            />

            {/* TOP PERFORMING STUDENTS & ATTENDANCE TRENDS WIDGET (RECHARTS) */}
            <TopStudentsAndAttendanceWidget className="mb-6" />

            {/* 2. MIDDLE QUICK ACTION TILES (12 cards in 3 rows x 4 columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <ActionTile 
                    icon={UserPlus} 
                    badgeBg="bg-[#ef4444]" 
                    title={t('student_admission', 'Student Admission')} 
                    link="/school/students/admission" 
                />
                <ActionTile 
                    icon={CreditCard} 
                    badgeBg="bg-[#10b981]" 
                    title={t('fee_collection', 'Fee Collection')} 
                    link="/school/accounts" 
                />
                <ActionTile 
                    icon={TrendingUp} 
                    badgeBg="bg-[#f59e0b]" 
                    title={t('transaction_report', 'Transaction Report')} 
                    link="/school/reports?type=fees" 
                />
                <ActionTile 
                    icon={Users} 
                    badgeBg="bg-[#6366f1]" 
                    title={t('user_list', 'User List')} 
                    link="/school/students/list" 
                />

                <ActionTile 
                    icon={FileText} 
                    badgeBg="bg-[#8b5cf6]" 
                    title={t('student_list_pdf', 'Student List PDF')} 
                    link="/school/students/list" 
                />
                <ActionTile 
                    icon={UserCheck} 
                    badgeBg="bg-[#f97316]" 
                    title={t('pending_student_sheet', 'Pending Student Sheet')} 
                    link="/school/students/admission-request" 
                />
                <ActionTile 
                    icon={MessageSquare} 
                    badgeBg="bg-[#06b6d4]" 
                    title={t('sms_settings', 'SMS Settings')} 
                    link="/school/attendance/sms-settings" 
                />
                <ActionTile 
                    icon={CalendarRange} 
                    badgeBg="bg-[#881337]" 
                    title={t('leave_application', 'Leave Application')} 
                    link="/school/leave-approval" 
                />

                <ActionTile 
                    icon={Phone} 
                    badgeBg="bg-[#14b8a6]" 
                    title={t('student_call_sms', 'Student Call & SMS')} 
                    link="/school/communication" 
                />
                <ActionTile 
                    icon={Receipt} 
                    badgeBg="bg-[#dc2626]" 
                    title={t('transaction_report', 'Transaction Report')} 
                    link="/school/accounts" 
                />
                <ActionTile 
                    icon={Send} 
                    badgeBg="bg-[#4338ca]" 
                    title={t('due_sms_send', 'Due SMS Send')} 
                    link="/school/attendance/send-sms" 
                />
                <ActionTile 
                    icon={CreditCard} 
                    badgeBg="bg-[#334155]" 
                    title={t('payment_request', 'Payment Request')} 
                    link="/school/accounts" 
                />
                <ActionTile 
                    icon={Palette} 
                    badgeBg="bg-[#7c3aed]" 
                    title={t('theme_branding', 'Theme & Brand Settings')} 
                    link="/school/settings/theme" 
                />
            </div>

            {/* 3. CLASS-WISE STUDENTS TABLE (2026) */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                <div className="bg-[#0d6efd] px-5 py-3.5 text-white font-bold text-sm tracking-wide flex items-center justify-between">
                    <span>{t('class_wise_students', 'Class-wise Students')} — {activeTenant.name} ({formatNumber(selectedYear)})</span>
                    <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-mono font-medium">
                        {t('session_col', 'Session')}: {formatNumber(selectedYear)}
                    </span>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold">
                                <th className="py-3 px-6">{t('class_col', 'Class')}</th>
                                <th className="py-3 px-6">{t('total_students', 'Total Students')}</th>
                                <th className="py-3 px-6">{t('group_col', 'Group')}</th>
                                <th className="py-3 px-6">{t('section_col', 'Section')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-600">
                            {classWiseRows.map((row, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="py-3 px-6 font-semibold text-slate-800">{row.className}</td>
                                    <td className="py-3 px-6 font-bold text-slate-900 font-mono">{formatNumber(row.total)}</td>
                                    <td className="py-3 px-6">{row.group}</td>
                                    <td className="py-3 px-6">{row.section}</td>
                                </tr>
                            ))}
                            <tr className="border-t-2 border-slate-300 bg-slate-50 font-black text-slate-900">
                                <td className="py-3.5 px-6 uppercase tracking-wider">{t('total', 'Total')}</td>
                                <td className="py-3.5 px-6 font-mono text-sm text-[#0d6efd]">{formatNumber(totalStudentsCount)}</td>
                                <td className="py-3.5 px-6"></td>
                                <td className="py-3.5 px-6"></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </DashboardLayout>
    );
};

/** 
 * Student List Module 
 */
export const StudentList = () => {
    const { t } = useLanguage();
    const { addToast } = useToast();
    const { tenant: activeTenant, scopedStudents: students } = useTenant();
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
    const [isIDCardModalOpen, setIsIDCardModalOpen] = useState(false);
    const [selectedCardStudent, setSelectedCardStudent] = useState<Student | null>(null);

    const handleDeleteStudent = (st: Student) => {
        if (window.confirm(`Are you sure you want to remove ${st.name} (Roll: ${st.rollNo}, ${st.class}-${st.section}) from the enrolled nominal roll?`)) {
            deleteStudent(st.id);
            addToast(`Student ${st.name} removed from registry.`, 'info');
        }
    };

    return (
        <DashboardLayout role={UserRole.SCHOOL_ADMIN}>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">{t('student_list')}</h2>
                            <span className="font-mono text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                                {students.length} Enrolled • {activeTenant.name}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 font-bold mt-0.5">
                            Official student nominal roll directory & archive records ({activeTenant.name})
                        </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <Button 
                            variant="outline" 
                            icon={Printer} 
                            onClick={() => setIsExportModalOpen(true)}
                            className="text-indigo-600 border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 font-bold"
                        >
                            Print / Export Directory
                        </Button>
                        <Button 
                            onClick={() => setIsBulkUploadModalOpen(true)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-xs"
                            icon={FileSpreadsheet}
                        >
                            CSV Bulk Upload
                        </Button>
                        <Link to="/school/card-info/student-id">
                            <Button 
                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5 shadow-xs"
                                icon={CreditCard}
                            >
                                ID Cards
                            </Button>
                        </Link>
                        <Button icon={UserPlus} link="/school/students/admission">New Admission</Button>
                    </div>
                </div>
                <Card className="p-0 border-none shadow-xl overflow-hidden">
                    <SmartDataTable 
                        exportTitle={`Student Directory • ${activeTenant.name}`}
                        exportSubtitle={`Official Enrolled Student Roster • ${activeTenant.name} • Total: ${students.length}`}
                        onExportPDF={(data) => exportStudentListToPDF(data as Student[], {
                            title: `Student Directory & Nominal Roll • ${activeTenant.name}`,
                            subtitle: `Official Student Enrolment Registry • Total Students: ${data.length}`
                        })}
                        columns={[
                            { field: 'id', headerName: 'Student ID', width: '140px', renderCell: (r) => <span className="font-mono font-bold text-indigo-600">{r.id}</span> },
                            { field: 'name', headerName: 'Student Name', width: '240px', renderCell: (r) => (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                                        {r.imageUrl ? <img src={r.imageUrl} className="w-full h-full object-cover" /> : <Users size={14} className="text-slate-400"/>}
                                    </div>
                                    <div>
                                        <span className="font-bold uppercase text-xs block text-slate-900">{r.name}</span>
                                        {r.guardian && <span className="text-[10px] text-slate-400 font-medium">G: {r.guardian}</span>}
                                    </div>
                                </div>
                            )},
                            { field: 'class', headerName: 'Class', width: '110px' },
                            { field: 'section', headerName: 'Section', width: '90px' },
                            { field: 'rollNo', headerName: 'Roll', width: '90px', renderCell: (r) => <span className="font-mono font-bold">{r.rollNo}</span> },
                            { field: 'phone', headerName: 'Mobile', width: '140px', renderCell: (r) => <span className="font-mono text-xs text-slate-600">{r.phone || '---'}</span> },
                            { field: 'bloodGroup', headerName: 'Blood', width: '80px', renderCell: (r) => r.bloodGroup ? <span className="font-mono font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded text-[11px]">{r.bloodGroup}</span> : <span className="text-slate-300">--</span> },
                            { field: 'status', headerName: 'Status', width: '110px', renderCell: (r) => <Badge color={r.status === 'Active' ? 'green' : 'red'}>{r.status}</Badge> },
                        ]}
                        data={students}
                        actions={(r) => (
                            <div className="flex gap-1.5 justify-end items-center">
                                <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="text-indigo-600 hover:bg-indigo-50" 
                                    icon={CreditCard} 
                                    onClick={() => {
                                        setSelectedCardStudent(r as Student);
                                        setIsIDCardModalOpen(true);
                                    }}
                                    title="Generate & View Digital Student ID Card"
                                />
                                <Link to={`/school/documents?category=student-records&folder=documents/student-records`} title="View Student Records in Vault">
                                    <Button size="sm" variant="ghost" className="text-indigo-600 hover:bg-indigo-50" icon={FolderArchive} />
                                </Link>
                                <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="text-red-500 hover:bg-red-50 hover:text-red-700" 
                                    icon={Trash} 
                                    onClick={() => handleDeleteStudent(r as Student)}
                                    title="Remove student from nominal roll"
                                />
                            </div>
                        )}
                    />
                </Card>

                {/* PDF Export Configuration Modal */}
                <PDFExportModal
                    isOpen={isExportModalOpen}
                    onClose={() => setIsExportModalOpen(false)}
                    title="Student Directory & Nominal Roll"
                    defaultSubtitle="Official list of enrolled students for administrative and physical record-keeping"
                    moduleType="students"
                    data={students}
                />

                {/* CSV Bulk Upload Modal */}
                {isBulkUploadModalOpen && (
                    <Modal
                        isOpen={true}
                        onClose={() => setIsBulkUploadModalOpen(false)}
                        title="CSV Bulk Student Upload & Schema Mapping"
                        maxWidth="max-w-5xl"
                    >
                        <StudentBulkUpload 
                            isModal={true}
                            onCancel={() => setIsBulkUploadModalOpen(false)}
                            onSuccess={() => {
                                // Real-time subscription auto-refreshes nominal roll
                            }}
                        />
                    </Modal>
                )}

                {/* Digital Student ID Card Modal */}
                {isIDCardModalOpen && (
                    <Modal
                        isOpen={true}
                        onClose={() => {
                            setIsIDCardModalOpen(false);
                            setSelectedCardStudent(null);
                        }}
                        title={`Digital Student ID Card — ${selectedCardStudent?.name || 'Nominal Roll'}`}
                        maxWidth="max-w-5xl"
                    >
                        <StudentIDCardGenerator
                            initialStudentId={selectedCardStudent?.id}
                            isModal={true}
                            onClose={() => {
                                setIsIDCardModalOpen(false);
                                setSelectedCardStudent(null);
                            }}
                        />
                    </Modal>
                )}
            </div>
        </DashboardLayout>
    );
};

/**
 * Dedicated Page for Student CSV Bulk Upload
 */
export const StudentBulkUploadPage = () => {
    const navigate = useNavigate();

    return (
        <DashboardLayout role={UserRole.SCHOOL_ADMIN}>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <FileSpreadsheet size={22} />
                            </span>
                            <div>
                                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
                                    CSV Bulk Student Upload
                                </h2>
                                <p className="text-xs text-slate-500 font-bold mt-0.5">
                                    Smart column mapping to student schema with real-time validation and error recovery
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline" 
                            icon={Users} 
                            onClick={() => navigate('/school/students/list')}
                        >
                            View Nominal Roll
                        </Button>
                        <Button 
                            icon={UserPlus} 
                            link="/school/students/admission"
                        >
                            Manual Admission
                        </Button>
                    </div>
                </div>

                <StudentBulkUpload 
                    onSuccess={() => {
                        // User can review results or navigate
                    }}
                />
            </div>
        </DashboardLayout>
    );
};

/** 
 * Student Admission Module 
 */
export const StudentAdmission = () => {
    return (
        <DashboardLayout role={UserRole.SCHOOL_ADMIN}>
            <div className="space-y-4">
                <StudentAdmissionForm />
            </div>
        </DashboardLayout>
    );
};

/** 
 * Admission Request Module 
 */
export const AdmissionRequests = () => {
    const { t } = useLanguage();
    const { tenant: activeTenant, scopedStudents: tenantStudents } = useTenant();
    const navigate = useNavigate();
    const [showTrends, setShowTrends] = useState(true);

    return (
        <DashboardLayout role={UserRole.SCHOOL_ADMIN}>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">{t('admission_request')}</h2>
                        <p className="text-xs text-slate-500 font-bold mt-0.5">Review incoming student enrollment submissions and candidate credentials</p>
                    </div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <Button
                            variant="primary"
                            size="sm"
                            icon={Bell}
                            onClick={() => navigate('/school/communication')}
                            className="text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100 border-none"
                        >
                            Communication Center Alerts
                        </Button>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            icon={TrendingUp}
                            onClick={() => setShowTrends(prev => !prev)}
                            className="text-xs font-bold border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100"
                        >
                            {showTrends ? 'Hide Admission Trends' : 'View Admission Trends & Analytics'}
                        </Button>
                    </div>
                </div>

                {/* Automated Trigger Status Bar */}
                <div className="p-3.5 bg-gradient-to-r from-indigo-50 via-white to-amber-50 border border-indigo-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
                    <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                        <span className="font-black text-indigo-900 uppercase tracking-wider text-[11px]">Workflow Trigger Active:</span>
                        <span className="text-slate-600 font-medium">
                            New student admission forms reaching <strong>‘Pending Approval’</strong> automatically alert the School Admin via the <strong>Communication Center</strong> with SMS confirmation to guardians.
                        </span>
                    </div>
                    <Link to="/school/communication" className="inline-flex items-center gap-1.5 text-xs font-black text-indigo-600 hover:text-indigo-800 shrink-0">
                        <span>Open Communication Center</span>
                    </Link>
                </div>

                {showTrends && (
                    <div className="animate-in fade-in duration-200">
                        <AdmissionTrendsWidget />
                    </div>
                )}

                <Card className="p-0 border-none shadow-xl overflow-hidden">
                    <SmartDataTable 
                        columns={[
                            { field: 'date', headerName: 'Apply Date', width: '150px', renderCell: () => '2024-05-22' },
                            { field: 'name', headerName: 'Candidate Name', width: '250px', renderCell: (r) => <span className="font-bold uppercase text-xs">{r.name}</span> },
                            { field: 'class', headerName: 'Applied Class', width: '150px' },
                            { field: 'mobile', headerName: 'Guardian Mobile', width: '150px', renderCell: (r) => r.phone },
                            { field: 'status', headerName: 'Status', width: '120px', renderCell: () => <Badge color="yellow">Pending</Badge> },
                        ]}
                        data={tenantStudents}
                        actions={() => (
                            <div className="flex gap-2 justify-end">
                                <Button size="sm" variant="primary" className="h-7 text-[10px] font-bold">Approve</Button>
                                <Button size="sm" variant="danger" className="h-7 text-[10px] font-bold">Reject</Button>
                            </div>
                        )}
                    />
                </Card>
            </div>
        </DashboardLayout>
    );
};

/** 
 * Student Image Update Module 
 */
export const StudentImageUpdate = () => {
    const { t } = useLanguage();
    const { tenant: activeTenant, scopedStudents: tenantStudents } = useTenant();
    const { addToast } = useToast();
    const [isFiltered, setIsFiltered] = useState(false);

    return (
        <DashboardLayout role={UserRole.SCHOOL_ADMIN}>
            <div className="space-y-6">
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">{t('student_image_update')}</h2>
                
                <Card className="p-6 border-none shadow-lg no-print">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase">Select Class</label>
                            <select className="w-full border p-2 rounded-lg text-sm font-bold bg-slate-50 outline-none focus:ring-1 ring-indigo-500">
                                {MOCK_CLASSES.map(c => <option key={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase">Select Section</label>
                            <select className="w-full border p-2 rounded-lg text-sm font-bold bg-slate-50 outline-none focus:ring-1 ring-indigo-500">
                                <option>A</option><option>B</option>
                            </select>
                        </div>
                        <Button className="h-10 bg-indigo-600" icon={Search} onClick={() => setIsFiltered(true)}>Fetch Students</Button>
                    </div>
                </Card>

                {isFiltered && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-500">
                        {tenantStudents.map(st => (
                            <Card key={st.id} className="text-center p-6 hover:border-indigo-300 transition-colors">
                                <div className="relative group mx-auto w-24 h-24 mb-4">
                                    <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-300">
                                        {st.imageUrl ? <img src={st.imageUrl} className="w-full h-full object-cover" /> : <Camera className="text-slate-300" />}
                                    </div>
                                    <label className="absolute bottom-0 right-0 p-1.5 bg-indigo-600 text-white rounded-full cursor-pointer hover:bg-indigo-700 shadow-md">
                                        <Upload size={14} />
                                        <input type="file" className="hidden" />
                                    </label>
                                </div>
                                <h4 className="font-black text-xs uppercase text-slate-800">{st.name}</h4>
                                <p className="text-[10px] font-bold text-slate-400 mt-1">ID: {st.id}</p>
                                <Button size="sm" variant="ghost" className="mt-3 text-[10px] font-black text-indigo-600" onClick={() => addToast('Image Uploaded', 'success')}>SAVE IMAGE</Button>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

/** 
 * Bulk Student Data Update 
 */
export const StudentDataBulkUpdate = () => {
    const { t } = useLanguage();
    const { activeTenant } = useAuth();
    const { addToast } = useToast();
    const tenantStudents = getTenantStudents(activeTenant.subdomain);

    return (
        <DashboardLayout role={UserRole.SCHOOL_ADMIN}>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">{t('student_data_update')}</h2>
                    <Button icon={Save} onClick={() => addToast('All changes saved', 'success')}>Save Bulk Changes</Button>
                </div>
                <Card className="p-0 border-none shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-[11px] whitespace-nowrap">
                            <thead className="bg-slate-100 border-b">
                                <tr>
                                    <th className="px-4 py-3 font-black uppercase text-slate-500">ID</th>
                                    <th className="px-4 py-3 font-black uppercase text-slate-500">Student Name</th>
                                    <th className="px-4 py-3 font-black uppercase text-slate-500">Class</th>
                                    <th className="px-4 py-3 font-black uppercase text-slate-500">Section</th>
                                    <th className="px-4 py-3 font-black uppercase text-slate-500">Roll No</th>
                                    <th className="px-4 py-3 font-black uppercase text-slate-500">Guardian</th>
                                    <th className="px-4 py-3 font-black uppercase text-slate-500">Mobile</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {tenantStudents.map(st => (
                                    <tr key={st.id} className="hover:bg-indigo-50/50">
                                        <td className="px-4 py-2 font-mono font-bold text-indigo-600">{st.id}</td>
                                        <td className="px-4 py-2"><input className="border rounded px-2 py-1 w-48 font-bold bg-slate-50" defaultValue={st.name} /></td>
                                        <td className="px-4 py-2"><input className="border rounded px-2 py-1 w-24 font-bold bg-slate-50" defaultValue={st.class} /></td>
                                        <td className="px-4 py-2"><input className="border rounded px-2 py-1 w-16 font-bold bg-slate-50 text-center" defaultValue={st.section} /></td>
                                        <td className="px-4 py-2"><input className="border rounded px-2 py-1 w-16 font-bold bg-slate-50 text-center" defaultValue={st.rollNo} /></td>
                                        <td className="px-4 py-2"><input className="border rounded px-2 py-1 w-40 font-bold bg-slate-50" defaultValue={st.guardian} /></td>
                                        <td className="px-4 py-2"><input className="border rounded px-2 py-1 w-32 font-bold bg-slate-50" defaultValue={st.phone} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </DashboardLayout>
    );
};

/** 
 * Administrator Primary Request Module 
 */
export const AdministratorPrimaryRequest = () => {
    const { t } = useLanguage();
    const { addToast } = useToast();
    return (
        <DashboardLayout role={UserRole.SCHOOL_ADMIN}>
            <div className="max-w-4xl mx-auto space-y-6">
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">{t('admin_primary_request')}</h2>
                <Card className="p-8 border-none shadow-2xl bg-indigo-900 text-white">
                    <div className="flex gap-4 items-start mb-6">
                        <div className="p-3 bg-white/10 rounded-xl"><ShieldCheck size={32} /></div>
                        <div>
                            <h3 className="text-xl font-black uppercase italic">Primary Administrative Request Portal</h3>
                            <p className="text-indigo-200 text-sm">Submit critical modification requests directly to the Super Admin.</p>
                        </div>
                    </div>
                    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); addToast('Request Submitted to HQ', 'info'); }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-indigo-300 uppercase">Request Type</label>
                                <select className="w-full bg-indigo-800/50 border border-indigo-700 p-3 rounded-lg text-sm font-bold text-white outline-none focus:ring-2 ring-indigo-400">
                                    <option>Student Data Restoration</option>
                                    <option>Result Modification Permission</option>
                                    <option>New Session Initialization</option>
                                    <option>Bulk Deletion Request</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-indigo-300 uppercase">Priority Level</label>
                                <select className="w-full bg-indigo-800/50 border border-indigo-700 p-3 rounded-lg text-sm font-bold text-white outline-none focus:ring-2 ring-indigo-400">
                                    <option>Normal</option>
                                    <option>Urgent</option>
                                    <option className="text-red-400">CRITICAL</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-indigo-300 uppercase">Detailed Justification</label>
                            <textarea className="w-full bg-indigo-800/50 border border-indigo-700 p-4 rounded-lg text-sm font-bold text-white outline-none focus:ring-2 ring-indigo-400 h-32" placeholder="Describe why this administrative action is required..."></textarea>
                        </div>
                        <div className="flex justify-end pt-4">
                            <Button type="submit" className="bg-white text-indigo-900 hover:bg-indigo-50 font-black uppercase px-10">Send Request</Button>
                        </div>
                    </form>
                </Card>
            </div>
        </DashboardLayout>
    );
};

/**
 * Selectable Data Update (Bulk Update specific fields)
 */
export const StudentSelectableUpdate = () => {
    const { t } = useLanguage();
    const { addToast } = useToast();
    return (
        <DashboardLayout role={UserRole.SCHOOL_ADMIN}>
            <div className="max-w-4xl mx-auto space-y-6">
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">{t('selectable_data_update')}</h2>
                <Card className="p-8 border-none shadow-xl">
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                        <p className="text-sm text-blue-700 font-bold">Quickly update Class, Section, or Session for multiple students at once.</p>
                    </div>
                    <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); addToast('Bulk updates applied!', 'success'); }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="font-black text-slate-400 uppercase text-xs">Step 1: Select Filter</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase">From Class</label>
                                        <select className="w-full border p-2 rounded-lg text-sm font-bold bg-slate-50 outline-none focus:ring-1 ring-indigo-500">
                                            {MOCK_CLASSES.map(c => <option key={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase">From Section</label>
                                        <select className="w-full border p-2 rounded-lg text-sm font-bold bg-slate-50 outline-none focus:ring-1 ring-indigo-500">
                                            <option>A</option><option>B</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="font-black text-indigo-600 uppercase text-xs">Step 2: New Destination</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase">To Class</label>
                                        <select className="w-full border p-2 rounded-lg text-sm font-bold bg-slate-50 outline-none focus:ring-1 ring-indigo-500">
                                            {MOCK_CLASSES.map(c => <option key={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase">To Section</label>
                                        <select className="w-full border p-2 rounded-lg text-sm font-bold bg-slate-50 outline-none focus:ring-1 ring-indigo-500">
                                            <option>A</option><option>B</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="pt-6 border-t flex justify-center">
                            <Button type="submit" className="bg-indigo-600 px-12" icon={RefreshCw}>Execute Transformation</Button>
                        </div>
                    </form>
                </Card>
            </div>
        </DashboardLayout>
    );
};

/**
 * Student Seat Plan - 1 Component
 */
export const StudentSeatPlan1 = () => {
    const { activeTenant } = useAuth();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [isFiltered, setIsFiltered] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const tenantStudents = getTenantStudents(activeTenant.subdomain);

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setResults(tenantStudents.map(s => ({
                ...s,
                seatNo: `S-${Math.floor(Math.random() * 100) + 1}`,
                roomNo: '101'
            })));
            setIsFiltered(true);
            setLoading(false);
            addToast('Seat plan generated', 'success');
        }, 1000);
    };

    return (
        <DashboardLayout role={UserRole.SCHOOL_ADMIN}>
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex justify-between items-center no-print">
                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Student Seat Plan</h2>
                    <div className="flex gap-2">
                        {isFiltered && (
                            <Button 
                                variant="outline" 
                                size="sm" 
                                icon={Download} 
                                onClick={() => exportSeatPlanToPDF(results.map((r, idx) => ({
                                    seatNo: r.seatNo || `${idx + 1}`,
                                    roomNo: r.roomNo || 'Room 101',
                                    studentId: r.id,
                                    name: r.name,
                                    rollNo: r.rollNo,
                                    class: r.class || 'Class 10',
                                    section: r.section || 'A',
                                    examName: 'Annual Examination 2024'
                                })))}
                                className="border-indigo-200 text-indigo-600 bg-indigo-50/50 hover:bg-indigo-100"
                            >
                                Export PDF
                            </Button>
                        )}
                        <Button variant="outline" size="sm" icon={History}>History</Button>
                        <Button variant="primary" size="sm" icon={Printer} onClick={() => window.print()}>Print</Button>
                    </div>
                </div>

                <Card className="p-0 overflow-hidden border-none shadow-xl no-print">
                    <div className="bg-indigo-600 p-3 text-white font-bold flex items-center gap-2">
                        <Filter size={18} />
                        Filter Data
                    </div>
                    <form className="p-6" onSubmit={handleFilter}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Select Class</label>
                                <select name="course" className="w-full text-xs border border-slate-200 rounded-lg p-2.5 h-10 outline-none focus:ring-1 ring-indigo-500 bg-slate-50 font-bold">
                                    <option value="">Select Class</option>
                                    <option value="1">Play</option>
                                    <option value="2">Nursery</option>
                                    <option value="3">One</option>
                                    <option value="4">Two</option>
                                    <option value="5">Three</option>
                                    <option value="6">Four</option>
                                    <option value="7">Five</option>
                                    <option value="8">Six</option>
                                    <option value="9">Seven</option>
                                    <option value="10">Eight</option>
                                    <option value="11">Nine (General)</option>
                                    <option value="12">Ten (General)</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Select Group</label>
                                <select name="branch" className="w-full text-xs border border-slate-200 rounded-lg p-2.5 h-10 outline-none focus:ring-1 ring-indigo-500 bg-slate-50 font-bold">
                                    <option value="">Select Group</option>
                                    <option value="1">General</option>
                                    <option value="5">Humanities</option>
                                    <option value="6">Commerce</option>
                                    <option value="7">Science</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Select Section</label>
                                <select name="section" className="w-full text-xs border border-slate-200 rounded-lg p-2.5 h-10 outline-none focus:ring-1 ring-indigo-500 bg-slate-50 font-bold">
                                    <option value="">Select Section</option>
                                    <option value="18">A</option>
                                    <option value="19">B</option>
                                </select>
                            </div>
                            <div className="space-y-1 lg:col-span-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Exam Name <span className="text-red-500">*</span></label>
                                <select name="exam_name" required className="w-full text-xs border border-slate-200 rounded-lg p-2.5 h-10 outline-none focus:ring-1 ring-indigo-500 bg-slate-50 font-bold">
                                    <option value="" disabled selected>Select Exam Name</option>
                                    <option value="Annual">Annual Examination - 2024</option>
                                    <option value="1st Term">1st Term - 2024</option>
                                </select>
                            </div>
                        </div>
                        <div className="mt-8 flex justify-center">
                            <Button 
                                type="submit" 
                                className="px-12 bg-indigo-600 hover:bg-indigo-700 h-12 font-black uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all hover:-translate-y-0.5" 
                                icon={loading ? Loader2 : Filter}
                                disabled={loading}
                            >
                                {loading ? 'Fetching...' : 'FILTER'}
                            </Button>
                        </div>
                    </form>
                </Card>

                {isFiltered && (
                    <div className="print-area animate-in fade-in duration-500" id="report-download">
                        <Card className="p-8 border-slate-300 shadow-none card-print-clean">
                            <div className="text-center border-b-2 border-slate-900 pb-6 mb-8">
                                <h1 className="text-3xl font-black text-slate-900 uppercase">Student Seat Plan</h1>
                                <p className="text-sm font-bold text-slate-600">Exam Session: 2024-2025</p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {results.map((res, i) => (
                                    <div key={i} className="border-2 border-slate-200 p-3 rounded-lg text-center hover:border-indigo-400 transition-colors bg-white">
                                        <div className="text-[8px] font-black text-slate-400 uppercase mb-1">Seat {res.seatNo}</div>
                                        <div className="w-12 h-12 rounded-full bg-slate-100 mx-auto mb-2 flex items-center justify-center text-slate-400">
                                            {res.imageUrl ? <img src={res.imageUrl} className="w-full h-full rounded-full object-cover" /> : <Users size={20}/>}
                                        </div>
                                        <div className="text-xs font-black text-slate-800 uppercase truncate">{res.name}</div>
                                        <div className="text-[10px] font-bold text-indigo-600">ID: {res.id}</div>
                                        <div className="text-[10px] font-bold text-slate-500">Roll: {res.rollNo}</div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

/**
 * Student Seat Plan - 2 Component
 */
export const StudentSeatPlan2 = () => {
    const { activeTenant } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isFiltered, setIsFiltered] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const tenantStudents = getTenantStudents(activeTenant.subdomain);

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setResults(tenantStudents.map((s, idx) => ({
                ...s,
                seatNo: `B-${idx + 1}`,
                room: 'Room 302',
                subject: 'Science'
            })));
            setIsFiltered(true);
            setLoading(false);
            addToast('Alternative seat plan generated', 'success');
        }, 1200);
    };

    return (
        <DashboardLayout role={UserRole.SCHOOL_ADMIN}>
            <div className="max-w-6xl mx-auto space-y-6">
                <div className="flex justify-between items-center no-print mb-4">
                    <div className="flex items-center gap-4">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            icon={ArrowLeft} 
                            onClick={() => navigate('/school')}
                            className="bg-slate-800 text-white hover:bg-slate-900 border-none"
                        >
                            Back
                        </Button>
                        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Student Seat Plan - Layout 2</h2>
                    </div>
                    <div className="flex gap-2">
                        {isFiltered && (
                            <Button 
                                variant="outline" 
                                size="sm" 
                                icon={Download} 
                                onClick={() => exportSeatPlanToPDF(results.map((r, idx) => ({
                                    seatNo: r.seatNo || `${idx + 1}`,
                                    roomNo: r.room || 'Room 302',
                                    studentId: r.id,
                                    name: r.name,
                                    rollNo: r.rollNo,
                                    class: r.class || 'Class 10',
                                    section: r.section || 'A',
                                    examName: 'Annual Examination 2024'
                                })))}
                                className="border-indigo-200 text-indigo-600 bg-indigo-50/50 hover:bg-indigo-100"
                            >
                                Export PDF
                            </Button>
                        )}
                        <Button 
                            variant="primary" 
                            size="sm" 
                            icon={Printer} 
                            onClick={() => window.print()}
                            className="bg-indigo-600 shadow-lg shadow-indigo-100"
                        >
                            Print
                        </Button>
                    </div>
                </div>

                <Card className="p-0 overflow-hidden border-none shadow-xl no-print bg-white">
                    <div className="bg-indigo-600 p-4 text-white font-bold flex items-center gap-2">
                        <Filter size={20} />
                        Filter Selection Criteria
                    </div>
                    <form className="p-8" onSubmit={handleFilter}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-1">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Select Class</label>
                                <select name="course" className="w-full text-sm border border-slate-200 rounded-xl p-3 h-12 outline-none focus:ring-2 ring-indigo-100 bg-slate-50 font-bold transition-all">
                                    <option value="">Select Class</option>
                                    <option value="1">Play</option>
                                    <option value="2">Nursery</option>
                                    <option value="3">One</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Select Section</label>
                                <select name="section" className="w-full text-sm border border-slate-200 rounded-xl p-3 h-12 outline-none focus:ring-2 ring-indigo-100 bg-slate-50 font-bold transition-all">
                                    <option value="">Select Section</option>
                                    <option value="18">A</option>
                                    <option value="19">B</option>
                                </select>
                            </div>
                            <div className="space-y-1 lg:col-span-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Exam Name <span className="text-red-500">*</span></label>
                                <select name="exam_name" required className="w-full text-sm border border-slate-200 rounded-xl p-3 h-12 outline-none focus:ring-2 ring-indigo-100 bg-slate-50 font-bold transition-all">
                                    <option value="" disabled selected>Select Exam Name</option>
                                    <option value="Annual">Annual Examination - 2024</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-10 flex justify-center">
                            <Button 
                                type="submit" 
                                className="px-16 bg-indigo-600 hover:bg-indigo-700 h-14 rounded-xl font-black uppercase tracking-widest shadow-2xl shadow-indigo-100 transition-all hover:-translate-y-1" 
                                icon={loading ? Loader2 : Filter}
                                disabled={loading}
                            >
                                {loading ? 'Fetching Records...' : 'FILTER'}
                            </Button>
                        </div>
                    </form>
                </Card>

                {isFiltered && (
                    <div className="print-area animate-in fade-in slide-in-from-bottom-4 duration-700" id="report-download">
                        <Card className="p-12 border-slate-300 shadow-none card-print-clean bg-white min-h-[1000px]">
                            <div className="text-center border-b-4 border-double border-slate-900 pb-8 mb-12">
                                <h1 className="text-4xl font-black text-slate-900 uppercase mb-2 tracking-tight">Student Seat Plan</h1>
                                <p className="text-lg font-bold text-slate-600 tracking-wide">Academic Year: 2024-2025</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                                {results.map((res, i) => (
                                    <div key={i} className="border-4 border-slate-800 p-6 rounded-2xl relative overflow-hidden flex flex-col items-center justify-center bg-white hover:bg-slate-50 transition-colors">
                                        <div className="absolute top-0 right-0 bg-slate-900 text-white px-6 py-2 font-black text-lg rounded-bl-2xl">
                                            {res.seatNo}
                                        </div>
                                        <div className="w-20 h-20 rounded-full border-4 border-slate-100 shadow-inner mb-4 overflow-hidden bg-slate-100 flex items-center justify-center">
                                            {res.imageUrl ? <img src={res.imageUrl} className="w-full h-full object-cover" /> : <Users size={40} className="text-slate-300" />}
                                        </div>
                                        <h3 className="text-lg font-black text-slate-900 uppercase text-center mb-1 leading-tight">{res.name}</h3>
                                        <p className="text-xs font-bold text-slate-500 uppercase mb-4">{res.class} • {res.section}</p>
                                        <div className="w-full grid grid-cols-2 gap-2 border-t border-slate-100 pt-4 text-[10px] font-black uppercase text-slate-400">
                                            <div>
                                                <p>Student ID</p>
                                                <p className="text-indigo-600 text-sm">{res.id}</p>
                                            </div>
                                            <div className="text-right">
                                                <p>Roll No</p>
                                                <p className="text-slate-800 text-sm">{res.rollNo}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

/**
 * Small Seat Plan Component
 */
export const SmallSeatPlan = () => {
    const { activeTenant } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isFiltered, setIsFiltered] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const tenantStudents = getTenantStudents(activeTenant.subdomain);

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setResults(tenantStudents.map((s, i) => ({
                ...s,
                seatNo: i + 1,
                room: 'Hall A'
            })));
            setIsFiltered(true);
            setLoading(false);
            addToast('Compact seat plan generated', 'success');
        }, 800);
    };

    return (
        <DashboardLayout role={UserRole.SCHOOL_ADMIN}>
            <div className="container-fluid space-y-6">
                <div className="btn_all m-3 flex gap-2 no-print">
                    <Button variant="secondary" size="sm" className="bg-slate-800 text-white" onClick={() => navigate('/school')}>Back</Button>
                    {isFiltered && (
                        <Button 
                            variant="outline" 
                            size="sm" 
                            icon={Download} 
                            onClick={() => exportSeatPlanToPDF(results.map((r, idx) => ({
                                seatNo: String(r.seatNo || idx + 1),
                                roomNo: r.room || 'Hall A',
                                studentId: r.id,
                                name: r.name,
                                rollNo: r.rollNo,
                                class: r.class || 'Class 1',
                                section: r.section || 'A',
                                examName: 'Mid-Term Examination 2024'
                            })))}
                            className="border-indigo-200 text-indigo-600 bg-indigo-50/50 hover:bg-indigo-100"
                        >
                            Export PDF
                        </Button>
                    )}
                    <Button variant="primary" size="sm" onClick={() => window.print()}>Print</Button>
                </div>

                <div className="row no-print">
                    <Card className="panel-heading bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase">Select Class</label>
                                <select className="w-full text-xs border border-slate-200 rounded p-2 focus:ring-1 ring-indigo-500 font-bold outline-none" name="course">
                                    <option value="">Select Class</option>
                                    <option value="1">Play</option><option value="2">Nursery</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase">Select Section</label>
                                <select className="w-full text-xs border border-slate-200 rounded p-2 focus:ring-1 ring-indigo-500 font-bold outline-none" name="section">
                                    <option value="">Select Section</option>
                                    <option value="18">A</option><option value="19">B</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase">Exam Name</label>
                                <select className="w-full text-xs border border-slate-200 rounded p-2 focus:ring-1 ring-indigo-500 font-bold outline-none" name="exam_name" required>
                                    <option value="">Select Exam Name</option>
                                    <option value="Annual">Annual Exam 2024</option>
                                </select>
                            </div>
                            <div className="flex items-end">
                                <Button type="submit" className="w-full h-9 bg-indigo-600 font-black uppercase tracking-widest" icon={loading ? Loader2 : Filter}>
                                    {loading ? '...' : 'FILTER'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>

                <div className="print mt-6">
                    <div className="page bg-white rounded-lg p-6 shadow-sm border border-slate-100 card-print-clean">
                         {isFiltered && (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                <div className="text-center border-b-2 border-slate-800 pb-4 mb-6">
                                    <h2 className="text-xl font-black text-slate-900 uppercase">Student Small Seat Plan</h2>
                                    <p className="text-xs text-slate-500 font-bold uppercase">Exam Session: 2024-2025</p>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                                    {results.map((st) => (
                                        <div key={st.id} className="border border-slate-800 p-2 text-center flex flex-col justify-center min-h-[100px]">
                                            <div className="text-[8px] font-black text-slate-900 border-b border-slate-200 mb-1">SEAT #{st.seatNo}</div>
                                            <div className="text-[10px] font-black text-slate-800 uppercase truncate">{st.name}</div>
                                            <div className="text-[8px] font-bold text-slate-400">ID: {st.id}</div>
                                            <div className="text-[10px] font-black text-indigo-600 mt-1">Roll: {st.rollNo}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                         )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

/**
 * Filter Form shared between Assign and Print pages
 */
const StudentTeacherFilterForm = ({ onSubmit, loading, title }: { onSubmit: (e: React.FormEvent) => void, loading: boolean, title: string }) => {
    const { activeTenant } = useAuth();
    const teachers = getTenantStaff(activeTenant.subdomain).filter(s => s.role === 'Teacher');

    return (
        <Card className="p-0 overflow-hidden border-none shadow-xl no-print">
            <div className="bg-indigo-600 p-4 text-white font-bold flex items-center gap-2">
                <Filter size={18} />
                {title}
            </div>
            <form className="p-6" onSubmit={onSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Class <span className="text-red-500">*</span></label>
                        <select name="course" className="w-full text-sm border border-slate-200 rounded-lg p-2.5 h-11 focus:ring-2 ring-indigo-100 outline-none bg-slate-50 font-bold" required>
                            <option value="">Select Class</option>
                            <option>Class 10</option><option>Class 9</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Section</label>
                        <select name="section" className="w-full text-sm border border-slate-200 rounded-lg p-2.5 h-11 focus:ring-2 ring-indigo-100 outline-none bg-slate-50 font-bold">
                            <option value="">All Sections</option>
                            <option>A</option><option>B</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Teacher</label>
                        <select name="teacher_id" className="w-full text-sm border border-slate-200 rounded-lg p-2.5 h-11 focus:ring-2 ring-indigo-100 outline-none bg-slate-50 font-bold">
                            <option value="">All Teachers</option>
                            {teachers.map(t => (
                                <option key={t.id} value={t.id}>{t.name.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="mt-8 flex justify-center">
                    <Button 
                        type="submit" 
                        className="px-12 bg-indigo-600 hover:bg-indigo-700 h-12 font-black uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all hover:-translate-y-0.5" 
                        icon={loading ? Loader2 : Search}
                        disabled={loading}
                    >
                        {loading ? 'Fetching...' : 'Show Students'}
                    </Button>
                </div>
            </form>
        </Card>
    );
};

/**
 * StudentTeacherAssign Component
 */
export const StudentTeacherAssign = () => {
    const { activeTenant } = useAuth();
    const { addToast } = useToast();
    const [isFiltered, setIsFiltered] = useState(false);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const tenantStudents = getTenantStudents(activeTenant.subdomain);
    const tenantStaff = getTenantStaff(activeTenant.subdomain);

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setResults(tenantStudents.map(s => ({
                ...s,
                assignedTeacher: ''
            })));
            setIsFiltered(true);
            setLoading(false);
            addToast('Student records loaded for assignment', 'info');
        }, 800);
    };

    const handleAssign = (studentId: string, teacherId: string) => {
        setResults(prev => prev.map(s => 
            s.id === studentId ? { ...s, assignedTeacher: teacherId } : s
        ));
        addToast('Teacher assigned to student', 'success');
    };

    return (
        <DashboardLayout role={UserRole.SCHOOL_ADMIN}>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="text-center no-print">
                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Assign Teacher To Students</h2>
                </div>

                <StudentTeacherFilterForm onSubmit={handleFilter} loading={loading} title="Filtering Criteria" />

                {isFiltered && (
                    <Card className="p-0 overflow-hidden border-none shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
                        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center no-print">
                            <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Assign Faculty</h3>
                            <Badge color="blue">{results.length} Students Found</Badge>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs whitespace-nowrap">
                                <thead className="bg-slate-100 text-slate-600 font-black uppercase border-b">
                                    <tr>
                                        <th className="px-6 py-4">Roll</th>
                                        <th className="px-4 py-4">Student Name</th>
                                        <th className="px-4 py-4">Current Teacher</th>
                                        <th className="px-4 py-4 text-right no-print">Assign New</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {results.map((st) => (
                                        <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-black text-indigo-600 font-mono">{st.rollNo}</td>
                                            <td className="px-4 py-4 font-black text-slate-800 uppercase">{st.name}</td>
                                            <td className="px-4 py-4">
                                                {st.assignedTeacher ? (
                                                    <Badge color="green">{tenantStaff.find(t => t.id === st.assignedTeacher)?.name}</Badge>
                                                ) : (
                                                    <span className="text-slate-300 italic font-bold">Not Assigned</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-right no-print">
                                                <select 
                                                    className="text-[10px] border border-slate-200 rounded p-1 bg-slate-50 font-bold outline-none focus:ring-1 ring-indigo-500"
                                                    onChange={(e) => handleAssign(st.id, e.target.value)}
                                                    value={st.assignedTeacher}
                                                >
                                                    <option value="">Select Teacher</option>
                                                    {tenantStaff.filter(s => s.role === 'Teacher').map(staff => (
                                                        <option key={staff.id} value={staff.id}>{staff.name}</option>
                                                    ))}
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 bg-slate-50 border-t flex justify-end gap-2 no-print">
                             <Button variant="secondary" size="sm" icon={Printer} onClick={() => window.print()}>Print List</Button>
                             <Button size="sm" icon={Save}>Save Assignments</Button>
                        </div>
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
};

/**
 * StudentTeacherAssignPrint Component
 */
export const StudentTeacherAssignPrint = () => {
    const { tenant: activeTenant, scopedStudents: tenantStudents, scopedStaff: tenantStaff } = useTenant();
    const { addToast } = useToast();
    const [isFiltered, setIsFiltered] = useState(false);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any[]>([]);

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            const firstTeacher = tenantStaff.find(t => t.role === 'Teacher')?.name || 'Staff Faculty';
            setResults(tenantStudents.map(s => ({
                ...s,
                assignedTeacher: firstTeacher
            })));
            setIsFiltered(true);
            setLoading(false);
            addToast('Data loaded for printing', 'info');
        }, 800);
    };

    return (
        <DashboardLayout role={UserRole.SCHOOL_ADMIN}>
            <div className="max-w-5xl mx-auto space-y-6 print:m-0 print:p-0">
                <div className="text-center no-print">
                    <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Student Teacher Assign Print</h2>
                </div>

                <StudentTeacherFilterForm onSubmit={handleFilter} loading={loading} title="Assign Teacher To Students" />

                {isFiltered && (
                    <div className="space-y-6">
                        <div className="flex justify-end no-print">
                             <Button icon={Printer} onClick={() => window.print()}>Print Now</Button>
                        </div>

                        <Card className="p-10 border-slate-300 shadow-none card-print-clean animate-in fade-in duration-500">
                            <div className="text-center border-b-2 border-slate-900 pb-6 mb-8">
                                <h1 className="text-3xl font-black text-slate-900 uppercase">{activeTenant.name}</h1>
                                <p className="text-sm font-bold text-slate-600">Student Teacher Assignment List - 2024</p>
                            </div>

                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b-2 border-slate-900">
                                        <th className="py-3 px-2 font-black uppercase text-xs">Roll</th>
                                        <th className="py-3 px-2 font-black uppercase text-xs">Student ID</th>
                                        <th className="py-3 px-2 font-black uppercase text-xs">Student Name</th>
                                        <th className="py-3 px-2 font-black uppercase text-xs">Assigned Teacher</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {results.map((st) => (
                                        <tr key={st.id}>
                                            <td className="py-4 px-2 font-bold text-slate-800">{st.rollNo}</td>
                                            <td className="py-4 px-2 text-slate-600 font-mono">{st.id}</td>
                                            <td className="py-4 px-2 font-black text-slate-900 uppercase">{st.name}</td>
                                            <td className="py-4 px-2 font-bold text-indigo-700 uppercase">{st.assignedTeacher}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Card>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export const StudentAddCredentials = () => {
    const { activeTenant } = useAuth();
    const { addToast } = useToast();
    const [isFiltered, setIsFiltered] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const tenantStudents = getTenantStudents(activeTenant.subdomain);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setIsFiltered(true);
        setResults(tenantStudents.map(s => ({
            ...s,
            userId: s.id.toLowerCase().replace('-', ''),
            password: 'pass' + Math.floor(1000 + Math.random() * 9000),
            status: 'Pending'
        })));
        addToast('Search results loaded', 'info');
    };

    return (
        <DashboardLayout role={UserRole.SCHOOL_ADMIN}>
            <div className="space-y-6">
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Add User & Password Request</h2>
                <Card className="p-6 border-none shadow-lg">
                    <form className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end" onSubmit={handleSearch}>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase">Select Class</label>
                            <select className="w-full border p-2 rounded-lg text-sm font-bold bg-slate-50 outline-none focus:ring-1 ring-indigo-500">
                                {MOCK_CLASSES.map(c => <option key={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <Button type="submit" className="bg-green-600" icon={Search}>Search Students</Button>
                    </form>
                </Card>

                {isFiltered && (
                    <Card className="p-0 overflow-hidden border-none shadow-xl animate-in slide-in-from-bottom-4 duration-500">
                        <SmartDataTable 
                            columns={[
                                { field: 'id', headerName: 'ID', width: '120px' },
                                { field: 'name', headerName: 'Name', width: '200px' },
                                { field: 'userId', headerName: 'User ID', width: '150px', renderCell: (r) => <Badge color="blue">{r.userId}</Badge> },
                                { field: 'password', headerName: 'Temp Password', width: '150px', renderCell: (r) => <span className="font-mono text-slate-500">{r.password}</span> },
                            ]}
                            data={results}
                            actions={() => <Button size="sm" variant="primary" icon={Key}>Generate</Button>}
                        />
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
};

export const StudentCredentialsStatus = () => {
    const { activeTenant } = useAuth();
    const { addToast } = useToast();
    const [isFiltered, setIsFiltered] = useState(false);
    const [results, setResults] = useState<any[]>([]);
    const tenantStudents = getTenantStudents(activeTenant.subdomain);

    const handleAction = (e: React.FormEvent) => {
        e.preventDefault();
        setIsFiltered(true);
        setResults(tenantStudents.map(s => ({
            ...s,
            loginStatus: Math.random() > 0.3 ? 'Active' : 'Deactive',
            lastLogin: '2024-05-20 10:30 AM'
        })));
        addToast('Student status records loaded', 'success');
    };

    const toggleStatus = (id: string) => {
        setResults(prev => prev.map(s => 
            s.id === id ? { ...s, loginStatus: s.loginStatus === 'Active' ? 'Deactive' : 'Active' } : s
        ));
        addToast('Status updated successfully', 'success');
    };

    return (
        <DashboardLayout role={UserRole.SCHOOL_ADMIN}>
            <div className="space-y-6">
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Login Active & Deactivate</h2>
                <Card className="p-6 border-none shadow-lg">
                    <form className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end" onSubmit={handleAction}>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase">Select Class</label>
                            <select className="w-full border p-2 rounded-lg text-sm font-bold bg-slate-50 outline-none focus:ring-1 ring-indigo-500">
                                {MOCK_CLASSES.map(c => <option key={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <Button type="submit" className="bg-green-600">Load List</Button>
                    </form>
                </Card>

                {isFiltered && (
                    <Card className="p-0 overflow-hidden border-none shadow-xl">
                        <SmartDataTable 
                            columns={[
                                { field: 'id', headerName: 'ID', width: '120px' },
                                { field: 'name', headerName: 'Name', width: '200px' },
                                { field: 'lastLogin', headerName: 'Last Login', width: '180px' },
                                { field: 'loginStatus', headerName: 'Status', width: '120px', renderCell: (r) => <Badge color={r.loginStatus === 'Active' ? 'green' : 'red'}>{r.loginStatus}</Badge> },
                            ]}
                            data={results}
                            actions={(r) => <Button size="sm" variant={r.loginStatus === 'Active' ? 'danger' : 'primary'} icon={Power} onClick={() => toggleStatus(r.id)} />}
                        />
                    </Card>
                )}
            </div>
        </DashboardLayout>
    );
};

export const StudentSendSmsCredentials = () => {
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleSendSms = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            addToast('SMS request processed successfully!', 'success');
        }, 2000);
    };

    return (
        <DashboardLayout role={UserRole.SCHOOL_ADMIN}>
            <div className="max-w-3xl mx-auto space-y-6">
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Send UserID & Password SMS</h2>
                <Card className="p-8 border-none shadow-xl">
                    <form className="space-y-6" onSubmit={handleSendSms}>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase">Select Class</label>
                                <select className="w-full border p-2 rounded-lg text-sm font-bold bg-slate-50 outline-none focus:ring-1 ring-indigo-500">
                                    {MOCK_CLASSES.map(c => <option key={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-slate-400 uppercase">Select Section</label>
                                <select className="w-full border p-2 rounded-lg text-sm font-bold bg-slate-50 outline-none focus:ring-1 ring-indigo-500">
                                    <option>A</option><option>B</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase">SMS Template</label>
                            <textarea className="w-full border p-4 rounded-lg text-sm font-bold h-32" defaultValue="Dear [name], your SmartSchool UserID: [userid] and Pass: [password]. Log in: school.link"></textarea>
                        </div>
                        <div className="flex justify-center">
                            <Button type="submit" className="bg-green-600 px-12" icon={Send} disabled={loading}>{loading ? 'Sending...' : 'Send Bulk SMS'}</Button>
                        </div>
                    </form>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export const StaffList = () => <DashboardLayout role={UserRole.SCHOOL_ADMIN}><div className="p-8 text-center bg-white rounded-xl border border-slate-200"><h2 className="text-2xl font-bold text-slate-800">Staff List</h2><p className="text-slate-500 mt-2">Manage teaching and non-teaching staff records.</p></div></DashboardLayout>;
export { FeesManagement } from './FeesManagement';
export const ExamManagement = () => <DashboardLayout role={UserRole.SCHOOL_ADMIN}><div className="p-8 text-center bg-white rounded-xl border border-slate-200"><h2 className="text-2xl font-bold text-slate-800">Exam Management</h2><p className="text-slate-500 mt-2">Schedule examinations and manage seating plans.</p></div></DashboardLayout>;
export const CertificatesManagement = () => <DashboardLayout role={UserRole.SCHOOL_ADMIN}><div className="p-8 text-center bg-white rounded-xl border border-slate-200"><h2 className="text-2xl font-bold text-slate-800">Certificates Management</h2><p className="text-slate-500 mt-2">Design and issue character, merit, and transfer certificates.</p></div></DashboardLayout>;
/**
 * Reports Dashboard Component
 */
export const ReportsDashboard = () => {
    const { tenant: activeTenant, scopedStudents: tenantStudents } = useTenant();
    const { addToast } = useToast();
    const [activeReport, setActiveReport] = useState<'nominal' | 'performance' | 'attendance' | 'fees' | 'seatplan'>('nominal');
    const [selectedClass, setSelectedClass] = useState('All');
    const [selectedSection, setSelectedSection] = useState('All');
    const [selectedTerm, setSelectedTerm] = useState('Annual 2024');
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    // Mock rich data for reports
    const performanceData = tenantStudents.map((s, idx) => {
        const marks = [
            Math.min(100, Math.floor(70 + ((idx * 13) % 28))),
            Math.min(100, Math.floor(65 + ((idx * 17) % 33))),
            Math.min(100, Math.floor(75 + ((idx * 19) % 25))),
            Math.min(100, Math.floor(60 + ((idx * 23) % 38)))
        ];
        const totalMarks = marks.reduce((a, b) => a + b, 0);
        const avg = Math.round(totalMarks / marks.length);
        const gpa = Number((avg / 20).toFixed(2));
        const grade = avg >= 80 ? 'A+' : avg >= 70 ? 'A' : avg >= 60 ? 'A-' : avg >= 50 ? 'B' : 'C';
        return {
            id: s.id || `perf-${idx}`,
            studentId: s.id,
            name: s.name,
            rollNo: s.rollNo,
            class: s.class,
            section: s.section,
            examName: selectedTerm,
            totalMarks,
            gpa,
            grade,
            rank: idx + 1,
            status: gpa >= 2.0 ? 'Pass' : 'Fail'
        };
    });

    const attendanceData = tenantStudents.map((s, idx) => {
        const totalDays = 24;
        const presentDays = Math.max(16, totalDays - (idx % 5));
        const absentDays = totalDays - presentDays;
        const percentage = Math.round((presentDays / totalDays) * 100);
        return {
            id: s.id || `att-${idx}`,
            studentId: s.id,
            name: s.name,
            rollNo: s.rollNo,
            class: s.class,
            section: s.section,
            totalDays,
            presentDays,
            absentDays,
            percentage: `${percentage}%`,
            status: percentage >= 85 ? 'Excellent' : percentage >= 75 ? 'Good' : 'Needs Attention'
        };
    });

    const feeReportData = tenantStudents.map((s, idx) => {
        const totalAmount = 15000;
        const paidAmount = idx % 3 === 0 ? 15000 : idx % 3 === 1 ? 10000 : 5000;
        const dueAmount = totalAmount - paidAmount;
        return {
            id: `fee-${s.id || idx}`,
            studentId: s.id,
            name: s.name,
            rollNo: s.rollNo,
            class: s.class,
            feeHead: 'Term Tuition & Session Fee',
            totalAmount,
            paidAmount,
            dueAmount,
            status: dueAmount === 0 ? 'Paid' : paidAmount > 0 ? 'Partial' : 'Unpaid'
        };
    });

    const seatPlanReportData = tenantStudents.map((s, idx) => ({
        id: `seat-${s.id || idx}`,
        seatNo: `S-${100 + idx + 1}`,
        roomNo: idx < 5 ? 'Hall 101' : 'Hall 102',
        studentId: s.id,
        name: s.name,
        rollNo: s.rollNo,
        class: s.class,
        section: s.section,
        examName: selectedTerm
    }));

    // Filtered data based on selection
    const filterByClassSection = (items: any[]) => {
        return items.filter(item => {
            const matchClass = selectedClass === 'All' || item.class === selectedClass;
            const matchSection = selectedSection === 'All' || item.section === selectedSection;
            return matchClass && matchSection;
        });
    };

    const currentNominalData = filterByClassSection(tenantStudents);
    const currentPerformanceData = filterByClassSection(performanceData);
    const currentAttendanceData = filterByClassSection(attendanceData);
    const currentFeeData = filterByClassSection(feeReportData);
    const currentSeatData = filterByClassSection(seatPlanReportData);

    const handleDirectExport = () => {
        if (activeReport === 'nominal') {
            exportStudentListToPDF(currentNominalData as Student[], {
                title: `Student Nominal Roll (${selectedClass} - ${selectedSection})`,
                subtitle: `Academic Term: ${selectedTerm} • Generated for Physical Archives`
            });
        } else if (activeReport === 'performance') {
            exportPerformanceReportToPDF(currentPerformanceData, {
                title: `Academic Tabulation & Merit List (${selectedClass})`,
                subtitle: `Examination: ${selectedTerm} • Official Performance Archive`
            });
        } else if (activeReport === 'fees') {
            exportFeeRegisterToPDF(currentFeeData, {
                title: `Fee Collection & Dues Register (${selectedClass})`,
                subtitle: `Academic Session 2024-2025 • Billing Period: ${selectedTerm}`
            });
        } else if (activeReport === 'seatplan') {
            exportSeatPlanToPDF(currentSeatData, {
                title: `Examination Seating Matrix (${selectedClass})`,
                subtitle: `Exam: ${selectedTerm} • Hall Master Allocation`
            });
        } else if (activeReport === 'attendance') {
            exportTableToPDF({
                title: `Class Attendance Register (${selectedClass} - ${selectedSection})`,
                subtitle: `Session 2024-2025 • Period: ${selectedTerm}`,
                columns: [
                    { header: 'Roll', dataKey: 'rollNo', width: 14 },
                    { header: 'ID', dataKey: 'studentId', width: 22 },
                    { header: 'Student Name', dataKey: 'name', width: 45 },
                    { header: 'Class', dataKey: 'class', width: 20 },
                    { header: 'Total Days', dataKey: 'totalDays', width: 22 },
                    { header: 'Present', dataKey: 'presentDays', width: 20 },
                    { header: 'Absent', dataKey: 'absentDays', width: 20 },
                    { header: 'Attendance %', dataKey: 'percentage', width: 28 },
                    { header: 'Remark', dataKey: 'status', width: 25 },
                ],
                data: currentAttendanceData,
                summaryStats: [
                    { label: 'Total Enrolled', value: currentAttendanceData.length },
                    { label: 'Class Working Days', value: '24' },
                    { label: 'Avg Attendance', value: '88.4%' }
                ]
            });
        }
        addToast('Exporting official PDF report...', 'success');
    };

    return (
        <DashboardLayout role={UserRole.SCHOOL_ADMIN}>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Reports & Physical Archives</h2>
                        <p className="text-xs text-slate-500 font-bold mt-0.5">Generate, customize and export official records to PDF and spreadsheet formats</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline" 
                            icon={Settings2} 
                            onClick={() => setIsExportModalOpen(true)}
                            className="border-indigo-200 text-indigo-700 bg-indigo-50/60 hover:bg-indigo-100"
                        >
                            Customize PDF
                        </Button>
                        <Button 
                            icon={Download} 
                            onClick={handleDirectExport}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100"
                        >
                            Download Official PDF
                        </Button>
                    </div>
                </div>

                {/* Report Type Tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {[
                        { id: 'nominal', label: 'Nominal Roll', icon: Users, desc: 'Student Roster' },
                        { id: 'performance', label: 'Tabulation Sheet', icon: Award, desc: 'Academic Marks' },
                        { id: 'attendance', label: 'Attendance Ledger', icon: CalendarDays, desc: 'Monthly Presence' },
                        { id: 'fees', label: 'Fee Dues Register', icon: Receipt, desc: 'Billing & Balances' },
                        { id: 'seatplan', label: 'Seat Matrix', icon: LayoutGrid, desc: 'Exam Hall Allocations' },
                    ].map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeReport === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveReport(tab.id as any)}
                                className={`p-4 rounded-2xl text-left transition-all border ${
                                    isActive 
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' 
                                        : 'bg-white text-slate-700 border-slate-200/80 hover:border-indigo-200 hover:bg-slate-50/50'
                                }`}
                            >
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2.5 ${
                                    isActive ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'
                                }`}>
                                    <Icon size={18} />
                                </div>
                                <div className="font-black text-sm tracking-tight">{tab.label}</div>
                                <div className={`text-[10px] font-bold mt-0.5 ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>{tab.desc}</div>
                            </button>
                        );
                    })}
                </div>

                {/* Filter Controls & KPIs */}
                <Card className="p-5 border-none shadow-md bg-white">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Class Filter</label>
                            <select 
                                value={selectedClass} 
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="w-full text-xs font-bold border border-slate-200 rounded-xl p-2.5 bg-slate-50 outline-none focus:ring-2 ring-indigo-500"
                            >
                                <option value="All">All Classes</option>
                                {MOCK_CLASSES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Section</label>
                            <select 
                                value={selectedSection} 
                                onChange={(e) => setSelectedSection(e.target.value)}
                                className="w-full text-xs font-bold border border-slate-200 rounded-xl p-2.5 bg-slate-50 outline-none focus:ring-2 ring-indigo-500"
                            >
                                <option value="All">All Sections</option>
                                <option value="A">Section A</option>
                                <option value="B">Section B</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Academic Term / Exam</label>
                            <select 
                                value={selectedTerm} 
                                onChange={(e) => setSelectedTerm(e.target.value)}
                                className="w-full text-xs font-bold border border-slate-200 rounded-xl p-2.5 bg-slate-50 outline-none focus:ring-2 ring-indigo-500"
                            >
                                <option value="Annual 2024">Annual Examination 2024</option>
                                <option value="1st Term 2024">1st Term Examination 2024</option>
                                <option value="Mid Term 2024">Mid Term Examination 2024</option>
                            </select>
                        </div>

                        <div className="flex gap-2">
                            <Button 
                                variant="outline" 
                                className="w-full text-xs font-bold h-10 border-slate-200" 
                                icon={RefreshCw}
                                onClick={() => {
                                    setSelectedClass('All');
                                    setSelectedSection('All');
                                    addToast('Filters reset', 'info');
                                }}
                            >
                                Reset
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Table View with Smart Export */}
                <Card className="p-0 border-none shadow-xl overflow-hidden">
                    {activeReport === 'nominal' && (
                        <SmartDataTable
                            exportTitle={`Student Nominal Roll - ${selectedClass}`}
                            exportSubtitle={`Academic Session 2024-2025 • Total: ${currentNominalData.length}`}
                            onExportPDF={(data) => exportStudentListToPDF(data as Student[], {
                                title: `Student Nominal Roll (${selectedClass})`,
                                subtitle: `Academic Session 2024-2025 • Total Enrolled: ${data.length}`
                            })}
                            columns={[
                                { field: 'rollNo', headerName: 'Roll', width: '90px', renderCell: (r) => <span className="font-mono font-bold text-indigo-600">{r.rollNo}</span> },
                                { field: 'id', headerName: 'Student ID', width: '130px', renderCell: (r) => <span className="font-mono text-xs">{r.id}</span> },
                                { field: 'name', headerName: 'Full Name', width: '220px', renderCell: (r) => <span className="font-bold text-slate-800 uppercase text-xs">{r.name}</span> },
                                { field: 'class', headerName: 'Class', width: '120px' },
                                { field: 'section', headerName: 'Section', width: '100px' },
                                { field: 'bloodGroup', headerName: 'Blood Grp', width: '110px' },
                                { field: 'phone', headerName: 'Guardian Phone', width: '150px' },
                                { field: 'status', headerName: 'Status', width: '110px', renderCell: (r) => <Badge color={r.status === 'Active' ? 'green' : 'red'}>{r.status}</Badge> }
                            ]}
                            data={currentNominalData}
                        />
                    )}

                    {activeReport === 'performance' && (
                        <SmartDataTable
                            exportTitle={`Academic Tabulation Sheet - ${selectedClass}`}
                            exportSubtitle={`Exam: ${selectedTerm} • Total Records: ${currentPerformanceData.length}`}
                            onExportPDF={(data) => exportPerformanceReportToPDF(data, {
                                title: `Academic Tabulation Sheet (${selectedClass})`,
                                subtitle: `Exam: ${selectedTerm} • Total Records: ${data.length}`
                            })}
                            columns={[
                                { field: 'rank', headerName: 'Rank', width: '80px', renderCell: (r) => <Badge color={r.rank <= 3 ? 'blue' : 'purple'}>#{r.rank}</Badge> },
                                { field: 'rollNo', headerName: 'Roll', width: '80px', renderCell: (r) => <span className="font-mono font-bold">{r.rollNo}</span> },
                                { field: 'name', headerName: 'Student Name', width: '200px', renderCell: (r) => <span className="font-bold text-xs uppercase">{r.name}</span> },
                                { field: 'class', headerName: 'Class', width: '110px' },
                                { field: 'totalMarks', headerName: 'Total (400)', width: '110px', renderCell: (r) => <span className="font-bold font-mono">{r.totalMarks}</span> },
                                { field: 'gpa', headerName: 'GPA', width: '100px', renderCell: (r) => <span className="font-mono font-black text-indigo-600">{r.gpa.toFixed(2)}</span> },
                                { field: 'grade', headerName: 'Grade', width: '100px', renderCell: (r) => <Badge color={r.grade === 'A+' ? 'green' : r.grade === 'A' ? 'blue' : 'yellow'}>{r.grade}</Badge> },
                                { field: 'status', headerName: 'Result', width: '100px', renderCell: (r) => <Badge color={r.status === 'Pass' ? 'green' : 'red'}>{r.status}</Badge> }
                            ]}
                            data={currentPerformanceData}
                        />
                    )}

                    {activeReport === 'attendance' && (
                        <SmartDataTable
                            exportTitle={`Attendance Register - ${selectedClass}`}
                            exportSubtitle={`Period: ${selectedTerm} • Total Students: ${currentAttendanceData.length}`}
                            onExportPDF={(data) => exportTableToPDF({
                                title: `Attendance Register (${selectedClass})`,
                                subtitle: `Period: ${selectedTerm}`,
                                columns: [
                                    { header: 'Roll', dataKey: 'rollNo', width: 14 },
                                    { header: 'ID', dataKey: 'studentId', width: 22 },
                                    { header: 'Name', dataKey: 'name', width: 45 },
                                    { header: 'Class', dataKey: 'class', width: 20 },
                                    { header: 'Total Days', dataKey: 'totalDays', width: 22 },
                                    { header: 'Present', dataKey: 'presentDays', width: 20 },
                                    { header: 'Absent', dataKey: 'absentDays', width: 20 },
                                    { header: 'Attendance %', dataKey: 'percentage', width: 28 },
                                    { header: 'Remark', dataKey: 'status', width: 25 },
                                ],
                                data
                            })}
                            columns={[
                                { field: 'rollNo', headerName: 'Roll', width: '80px', renderCell: (r) => <span className="font-mono font-bold">{r.rollNo}</span> },
                                { field: 'name', headerName: 'Student Name', width: '200px', renderCell: (r) => <span className="font-bold text-xs uppercase">{r.name}</span> },
                                { field: 'class', headerName: 'Class', width: '110px' },
                                { field: 'totalDays', headerName: 'Working Days', width: '120px' },
                                { field: 'presentDays', headerName: 'Present', width: '100px', renderCell: (r) => <span className="text-green-600 font-bold">{r.presentDays}</span> },
                                { field: 'absentDays', headerName: 'Absent', width: '100px', renderCell: (r) => <span className="text-red-500 font-bold">{r.absentDays}</span> },
                                { field: 'percentage', headerName: 'Rate', width: '110px', renderCell: (r) => <span className="font-bold font-mono">{r.percentage}</span> },
                                { field: 'status', headerName: 'Evaluation', width: '130px', renderCell: (r) => <Badge color={r.status === 'Excellent' ? 'green' : 'blue'}>{r.status}</Badge> }
                            ]}
                            data={currentAttendanceData}
                        />
                    )}

                    {activeReport === 'fees' && (
                        <SmartDataTable
                            exportTitle={`Fee Collection & Dues Register - ${selectedClass}`}
                            exportSubtitle={`Session 2024-2025 • Total Records: ${currentFeeData.length}`}
                            onExportPDF={(data) => exportFeeRegisterToPDF(data, {
                                title: `Fee Dues Register (${selectedClass})`,
                                subtitle: `Session 2024-2025 • Billing Period: ${selectedTerm}`
                            })}
                            columns={[
                                { field: 'rollNo', headerName: 'Roll', width: '80px', renderCell: (r) => <span className="font-mono font-bold">{r.rollNo}</span> },
                                { field: 'name', headerName: 'Student Name', width: '200px', renderCell: (r) => <span className="font-bold text-xs uppercase">{r.name}</span> },
                                { field: 'class', headerName: 'Class', width: '110px' },
                                { field: 'feeHead', headerName: 'Fee Item', width: '180px' },
                                { field: 'totalAmount', headerName: 'Billed', width: '110px', renderCell: (r) => <span className="font-mono font-bold">${r.totalAmount.toLocaleString()}</span> },
                                { field: 'paidAmount', headerName: 'Paid', width: '110px', renderCell: (r) => <span className="font-mono font-bold text-green-600">${r.paidAmount.toLocaleString()}</span> },
                                { field: 'dueAmount', headerName: 'Due', width: '110px', renderCell: (r) => <span className={`font-mono font-bold ${r.dueAmount > 0 ? 'text-red-500' : 'text-slate-400'}`}>${r.dueAmount.toLocaleString()}</span> },
                                { field: 'status', headerName: 'Payment Status', width: '120px', renderCell: (r) => <Badge color={r.status === 'Paid' ? 'green' : r.status === 'Partial' ? 'yellow' : 'red'}>{r.status}</Badge> }
                            ]}
                            data={currentFeeData}
                        />
                    )}

                    {activeReport === 'seatplan' && (
                        <SmartDataTable
                            exportTitle={`Exam Seat Matrix - ${selectedClass}`}
                            exportSubtitle={`Exam: ${selectedTerm} • Total Seats: ${currentSeatData.length}`}
                            onExportPDF={(data) => exportSeatPlanToPDF(data, {
                                title: `Examination Seating Matrix (${selectedClass})`,
                                subtitle: `Exam: ${selectedTerm} • Hall Allocations`
                            })}
                            columns={[
                                { field: 'seatNo', headerName: 'Seat #', width: '100px', renderCell: (r) => <Badge color="blue">{r.seatNo}</Badge> },
                                { field: 'roomNo', headerName: 'Room / Hall', width: '130px', renderCell: (r) => <span className="font-bold text-xs">{r.roomNo}</span> },
                                { field: 'rollNo', headerName: 'Roll', width: '90px', renderCell: (r) => <span className="font-mono font-bold">{r.rollNo}</span> },
                                { field: 'studentId', headerName: 'Student ID', width: '120px', renderCell: (r) => <span className="font-mono text-xs">{r.studentId}</span> },
                                { field: 'name', headerName: 'Candidate Name', width: '220px', renderCell: (r) => <span className="font-bold text-xs uppercase">{r.name}</span> },
                                { field: 'class', headerName: 'Class', width: '110px' },
                                { field: 'section', headerName: 'Section', width: '90px' }
                            ]}
                            data={currentSeatData}
                        />
                    )}
                </Card>

                {/* PDF Export Configuration Modal */}
                <PDFExportModal
                    isOpen={isExportModalOpen}
                    onClose={() => setIsExportModalOpen(false)}
                    title={
                        activeReport === 'nominal' ? `Student Nominal Roll (${selectedClass})` :
                        activeReport === 'performance' ? `Academic Tabulation Sheet (${selectedClass})` :
                        activeReport === 'attendance' ? `Attendance Register (${selectedClass})` :
                        activeReport === 'fees' ? `Fee Dues & Collection Ledger (${selectedClass})` :
                        `Exam Seating Matrix (${selectedClass})`
                    }
                    defaultSubtitle={`Academic Term: ${selectedTerm} • Official Institutional Record`}
                    moduleType={activeReport === 'seatplan' ? 'seatplan' : activeReport === 'nominal' ? 'students' : activeReport === 'performance' ? 'performance' : activeReport === 'fees' ? 'fees' : 'custom'}
                    data={
                        activeReport === 'nominal' ? currentNominalData :
                        activeReport === 'performance' ? currentPerformanceData :
                        activeReport === 'attendance' ? currentAttendanceData :
                        activeReport === 'fees' ? currentFeeData :
                        currentSeatData
                    }
                />
            </div>
        </DashboardLayout>
    );
};

export const SchoolSettings = () => (
  <DashboardLayout role={UserRole.SCHOOL_ADMIN}>
    <SchoolSettingsContent />
  </DashboardLayout>
);
export const SchoolBackupExport = () => (
  <DashboardLayout role={UserRole.SCHOOL_ADMIN}>
    <DataBackupExportModule mode="school-admin" />
  </DashboardLayout>
);
export const AttendanceManagement = () => <DashboardLayout role={UserRole.SCHOOL_ADMIN}><div className="p-8 text-center bg-white rounded-xl border border-slate-200"><h2 className="text-2xl font-bold text-slate-800">Attendance Management</h2><p className="text-slate-500 mt-2">Track daily attendance for students and staff.</p></div></DashboardLayout>;
export const CommunicationCenter = () => (
    <DashboardLayout role={UserRole.SCHOOL_ADMIN}>
        <CommunicationCenterComponent />
    </DashboardLayout>
);
export const StudentPromotion = () => <DashboardLayout role={UserRole.SCHOOL_ADMIN}><div className="p-8 text-center bg-white rounded-xl border border-slate-200"><h2 className="text-2xl font-bold text-slate-800">Student Promotion</h2><p className="text-slate-500 mt-2">Process year-end student promotions to higher classes.</p></div></DashboardLayout>;
export const IDCardGenerator = () => (
    <DashboardLayout role={UserRole.SCHOOL_ADMIN}>
        <StudentIDCardGenerator />
    </DashboardLayout>
);
export const RoutineManagement = () => <DashboardLayout role={UserRole.SCHOOL_ADMIN}><div className="p-8 text-center bg-white rounded-xl border border-slate-200"><h2 className="text-2xl font-bold text-slate-800">Routine Management</h2><p className="text-slate-500 mt-2">Create and manage class time-tables.</p></div></DashboardLayout>;
export const EventsManagement = () => <DashboardLayout role={UserRole.SCHOOL_ADMIN}><div className="p-8 text-center bg-white rounded-xl border border-slate-200"><h2 className="text-2xl font-bold text-slate-800">Events Management</h2><p className="text-slate-500 mt-2">Manage the school calendar and holiday list.</p></div></DashboardLayout>;
export const VisitorManagement = () => <DashboardLayout role={UserRole.SCHOOL_ADMIN}><div className="p-8 text-center bg-white rounded-xl border border-slate-200"><h2 className="text-2xl font-bold text-slate-800">Visitor Management</h2><p className="text-slate-500 mt-2">Log and monitor visitors at the front desk.</p></div></DashboardLayout>;
export const ComplaintManagement = () => <DashboardLayout role={UserRole.SCHOOL_ADMIN}><div className="p-8 text-center bg-white rounded-xl border border-slate-200"><h2 className="text-2xl font-bold text-slate-800">Complaint Management</h2><p className="text-slate-500 mt-2">Handle complaints and feedback from stakeholders.</p></div></DashboardLayout>;

/**
 * ResultSheet Component
 */
export const ResultSheet = () => {
    const { activeTenant } = useAuth();
    const [selectedClass, setSelectedClass] = useState('Class 10');
    const [selectedExam, setSelectedExam] = useState('Annual Examination 2024');
    const tenantStudents = getTenantStudents(activeTenant.subdomain);

    const resultRows = tenantStudents.map((s, idx) => {
        const math = Math.min(100, Math.floor(75 + ((idx * 7) % 25)));
        const english = Math.min(100, Math.floor(70 + ((idx * 11) % 28)));
        const science = Math.min(100, Math.floor(68 + ((idx * 13) % 30)));
        const bangla = Math.min(100, Math.floor(80 + ((idx * 5) % 18)));
        const total = math + english + science + bangla;
        const avg = Math.round(total / 4);
        const gpa = Number((avg / 20).toFixed(2));
        const grade = avg >= 80 ? 'A+' : avg >= 70 ? 'A' : avg >= 60 ? 'A-' : avg >= 50 ? 'B' : 'C';

        return {
            id: s.id || `result-${idx}`,
            studentId: s.id,
            rollNo: s.rollNo,
            name: s.name,
            class: s.class,
            section: s.section,
            math,
            english,
            science,
            bangla,
            totalMarks: total,
            gpa,
            grade,
            rank: idx + 1,
            status: gpa >= 2.0 ? 'Pass' : 'Fail'
        };
    });

    return (
        <DashboardLayout role={UserRole.SCHOOL_ADMIN}>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Academic Result Tabulation Sheet</h2>
                        <p className="text-xs text-slate-500 font-bold mt-0.5">Comprehensive term-wise result processing and official physical mark register</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                            icon={Download}
                            onClick={() => exportPerformanceReportToPDF(resultRows, {
                                title: `Official Result Sheet - ${selectedClass}`,
                                subtitle: `${selectedExam} • Tabulation & Merit List`
                            })}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100"
                        >
                            Export Official PDF
                        </Button>
                    </div>
                </div>

                <Card className="p-5 border-none shadow-md bg-white">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Class</label>
                            <select 
                                value={selectedClass} 
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="w-full text-xs font-bold border border-slate-200 rounded-xl p-2.5 bg-slate-50 outline-none focus:ring-2 ring-indigo-500"
                            >
                                {MOCK_CLASSES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Examination</label>
                            <select 
                                value={selectedExam} 
                                onChange={(e) => setSelectedExam(e.target.value)}
                                className="w-full text-xs font-bold border border-slate-200 rounded-xl p-2.5 bg-slate-50 outline-none focus:ring-2 ring-indigo-500"
                            >
                                <option value="Annual Examination 2024">Annual Examination 2024</option>
                                <option value="1st Term Examination 2024">1st Term Examination 2024</option>
                                <option value="Mid Term Examination 2024">Mid Term Examination 2024</option>
                            </select>
                        </div>
                    </div>
                </Card>

                <Card className="p-0 border-none shadow-xl overflow-hidden">
                    <SmartDataTable 
                        exportTitle={`Result Sheet - ${selectedClass}`}
                        exportSubtitle={`${selectedExam} • Total: ${resultRows.length}`}
                        onExportPDF={(data) => exportPerformanceReportToPDF(data, {
                            title: `Official Result Sheet - ${selectedClass}`,
                            subtitle: `${selectedExam} • Tabulation & Merit List`
                        })}
                        columns={[
                            { field: 'rank', headerName: 'Rank', width: '80px', renderCell: (r) => <Badge color={r.rank <= 3 ? 'blue' : 'purple'}>#{r.rank}</Badge> },
                            { field: 'rollNo', headerName: 'Roll', width: '80px', renderCell: (r) => <span className="font-mono font-bold">{r.rollNo}</span> },
                            { field: 'studentId', headerName: 'ID', width: '120px', renderCell: (r) => <span className="font-mono text-xs">{r.studentId}</span> },
                            { field: 'name', headerName: 'Student Name', width: '200px', renderCell: (r) => <span className="font-bold text-xs uppercase">{r.name}</span> },
                            { field: 'math', headerName: 'Math', width: '80px', renderCell: (r) => <span className="font-mono">{r.math}</span> },
                            { field: 'english', headerName: 'English', width: '80px', renderCell: (r) => <span className="font-mono">{r.english}</span> },
                            { field: 'science', headerName: 'Science', width: '80px', renderCell: (r) => <span className="font-mono">{r.science}</span> },
                            { field: 'bangla', headerName: 'Bangla', width: '80px', renderCell: (r) => <span className="font-mono">{r.bangla}</span> },
                            { field: 'totalMarks', headerName: 'Total (400)', width: '110px', renderCell: (r) => <span className="font-mono font-bold">{r.totalMarks}</span> },
                            { field: 'gpa', headerName: 'GPA', width: '90px', renderCell: (r) => <span className="font-mono font-black text-indigo-600">{r.gpa.toFixed(2)}</span> },
                            { field: 'grade', headerName: 'Grade', width: '90px', renderCell: (r) => <Badge color={r.grade === 'A+' ? 'green' : 'blue'}>{r.grade}</Badge> }
                        ]}
                        data={resultRows}
                    />
                </Card>
            </div>
        </DashboardLayout>
    );
};
export const RoleManagement = () => <DashboardLayout role={UserRole.SCHOOL_ADMIN}><div className="p-8 text-center bg-white rounded-xl border border-slate-200"><h2 className="text-2xl font-bold text-slate-800">Role Management</h2><p className="text-slate-500 mt-2">Configure user roles and permissions.</p></div></DashboardLayout>;

export const IndividualStudentProgressPage = () => {
    return (
        <DashboardLayout role={UserRole.SCHOOL_ADMIN}>
            <div className="mb-4">
                <Link
                    to="/school"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
                >
                    <ArrowLeft size={14} />
                    <span>Back to School Dashboard</span>
                </Link>
            </div>
            <StudentProgressCharts />
        </DashboardLayout>
    );
};

