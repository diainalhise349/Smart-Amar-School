
import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Calendar, CheckSquare, FileText, Coffee, Clock, 
  Mail, Phone, MapPin, Plus, Check, XCircle, Search, Filter, Save, Download, 
  BookOpen, AlertCircle, TrendingUp, Activity, Archive, Trash2, Edit, 
  BookOpenCheck, Video, ExternalLink, Printer, Sparkles, BrainCircuit, 
  MessageSquare, AlertTriangle, Send, Share2, UploadCloud, ChevronRight, 
  CheckCircle2, UserCheck, Play, Bell, CalendarDays, BarChart2, Eye,
  CalendarRange, ShieldCheck, HeartPulse, Stethoscope, Ban, Award, Info, RefreshCw,
  SlidersHorizontal, Layers, X, ArrowRight
} from 'lucide-react';
import { DashboardLayout } from '../components/Layout';
import { Card, Button, Badge, Input, Modal, ImageUpload, useToast } from '../components/UIComponents';
import { UserRole, LeaveApplication, LeavePolicy, DynamicTeacherLeaveBalance } from '../types';
import { MOCK_STUDENTS, MOCK_ROUTINES, MOCK_LEAVES, MOCK_STAFF, MOCK_SUBJECTS, MOCK_CLASSES, MOCK_GRADING_RULES, MOCK_RESULTS } from '../constants';
import { StudentPerformanceAnalytics } from '../components/StudentPerformanceAnalytics';
import { QuickLeaveRequestModal } from '../components/QuickLeaveRequestModal';
import { TeacherNotificationBell } from '../components/TeacherNotificationBell';
import { CentralNotificationBell } from '../components/CentralNotificationCenter';
import { DashboardNotificationWidget } from '../components/DashboardNotificationWidget';
import { TeacherLeaveStatusBanner } from '../components/TeacherLeaveStatusBanner';
import { useNotifications } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  getTeacherLeaves, 
  submitLeaveApplication, 
  withdrawLeaveApplication, 
  getTeacherLeaveQuota,
  calculateDaysCount,
  subscribeToLeaveUpdates,
  getLeavePolicies,
  getTeacherDynamicLeaveBalances,
  subscribeToPolicyUpdates
} from '../utils/leaveWorkflow';

export const TeacherDashboard: React.FC<{ initialTab?: 'overview' | 'performance' }> = ({ initialTab }) => {
  const location = useLocation();
  const { showToast } = useToast();
  const { t, formatNumber } = useLanguage();
  const { publishHomeworkAlert } = useNotifications();
  const [dashboardTab, setDashboardTab] = useState<'overview' | 'performance'>(
    initialTab || (location.pathname.includes('performance') ? 'performance' : 'overview')
  );

  useEffect(() => {
    if (location.pathname.includes('performance')) {
      setDashboardTab('performance');
    }
  }, [location.pathname]);

  const [selectedDay, setSelectedDay] = useState<'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday'>('Sunday');
  const [materialFilter, setMaterialFilter] = useState<string>('All');
  
  // Quick Leave Request Modal State & Quota
  const [isQuickLeaveModalOpen, setIsQuickLeaveModalOpen] = useState(false);
  const [teacherLeaves, setTeacherLeaves] = useState<LeaveApplication[]>(() => getTeacherLeaves('EMP-001'));
  const [teacherQuota, setTeacherQuota] = useState(() => getTeacherLeaveQuota('EMP-001'));

  useEffect(() => {
    const syncLeaves = () => {
      setTeacherLeaves(getTeacherLeaves('EMP-001'));
      setTeacherQuota(getTeacherLeaveQuota('EMP-001'));
    };
    syncLeaves();
    const unsubscribe = subscribeToLeaveUpdates(syncLeaves);
    return () => unsubscribe();
  }, []);

  // Quick Upload Material State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    title: '',
    subject: 'Mathematics',
    class: 'Class 10 - A',
    fileType: 'PDF',
    size: '2.4 MB'
  });

  // Quick Assignment State
  const [isHomeworkModalOpen, setIsHomeworkModalOpen] = useState(false);
  const [newHomework, setNewHomework] = useState({
    title: '',
    subject: 'Mathematics',
    class: 'Class 10 - A',
    dueDate: '',
    instructions: ''
  });

  // Quick Attendance Modal State
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [attendanceClass, setAttendanceClass] = useState('Class 10');
  const classStudents = MOCK_STUDENTS.filter(s => s.class === attendanceClass);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    MOCK_STUDENTS.forEach(s => { init[s.id] = 'Present'; });
    return init;
  });

  // Study Materials State
  const [materials, setMaterials] = useState([
    { id: 1, title: 'Calculus & Quadratic Equations Notes', subject: 'Mathematics', class: 'Class 10 - A', date: '2025-05-18', size: '3.2 MB', type: 'PDF', downloads: 38 },
    { id: 2, title: 'Optics & Wave Motion Lecture Slides', subject: 'Physics', class: 'Class 9 - B', date: '2025-05-16', size: '5.8 MB', type: 'PPTX', downloads: 42 },
    { id: 3, title: 'Geometry Proofs Practice Worksheet #4', subject: 'Mathematics', class: 'Class 10 - A', date: '2025-05-14', size: '1.4 MB', type: 'PDF', downloads: 35 },
    { id: 4, title: 'Thermodynamics Problem Solving Guide', subject: 'Physics', class: 'Class 9 - B', date: '2025-05-10', size: '2.1 MB', type: 'PDF', downloads: 29 },
  ]);

  // Homework State
  const [homeworkList, setHomeworkList] = useState([
    { id: 1, title: 'Algebra Practice Problem Set 3', subject: 'Mathematics', class: 'Class 10 - A', dueDate: 'Tomorrow, 11:59 PM', submitted: 32, total: 45, status: 'Active' },
    { id: 2, title: 'Physics Lab Experiment: Prism Refraction', subject: 'Physics', class: 'Class 9 - B', dueDate: 'May 25, 2025', submitted: 18, total: 40, status: 'Active' },
    { id: 3, title: 'Linear Equations Real-world Applications', subject: 'Mathematics', class: 'Class 8 - A', dueDate: 'May 20, 2025', submitted: 35, total: 35, status: 'Completed' },
  ]);

  const handleUploadMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterial.title.trim()) {
      showToast('Please enter a title for the material', 'error');
      return;
    }
    const added = {
      id: materials.length + 1,
      title: newMaterial.title,
      subject: newMaterial.subject,
      class: newMaterial.class,
      date: new Date().toISOString().split('T')[0],
      size: '2.8 MB',
      type: newMaterial.fileType,
      downloads: 0
    };
    setMaterials([added, ...materials]);
    setIsUploadModalOpen(false);
    setNewMaterial({ title: '', subject: 'Mathematics', class: 'Class 10 - A', fileType: 'PDF', size: '2.4 MB' });
    showToast('Study material published successfully!', 'success');
  };

  const handleCreateHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHomework.title.trim()) {
      showToast('Please enter an assignment title', 'error');
      return;
    }
    const added = {
      id: homeworkList.length + 1,
      title: newHomework.title,
      subject: newHomework.subject,
      class: newHomework.class,
      dueDate: newHomework.dueDate || 'Next Class',
      submitted: 0,
      total: 42,
      status: 'Active'
    };
    setHomeworkList([added, ...homeworkList]);
    setIsHomeworkModalOpen(false);

    // Broadcast centralized notification alert to students and parents
    publishHomeworkAlert({
      title: newHomework.title,
      subject: newHomework.subject,
      className: newHomework.class,
      dueDate: newHomework.dueDate || 'Next Class',
      instructions: newHomework.instructions || 'Please complete assigned exercises on time.',
      teacherName: 'Abdul Jabbar'
    });

    setNewHomework({ title: '', subject: 'Mathematics', class: 'Class 10 - A', dueDate: '', instructions: '' });
    showToast('Assignment assigned & notification sent to Students and Parents!', 'success');
  };

  const toggleStudentAttendance = (studentId: string) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'Present' ? 'Absent' : prev[studentId] === 'Absent' ? 'Late' : 'Present'
    }));
  };

  const handleSaveAttendance = () => {
    setIsAttendanceModalOpen(false);
    showToast(`Attendance for ${attendanceClass} saved and synced!`, 'success');
  };

  const filteredMaterials = materialFilter === 'All' 
    ? materials 
    : materials.filter(m => m.subject.toLowerCase() === materialFilter.toLowerCase());

  // Filter routines by selected day
  const dayRoutines = MOCK_ROUTINES.filter(r => r.day === selectedDay && r.teacherName === 'Abdul Jabbar');

  return (
    <DashboardLayout role={UserRole.TEACHER}>
      {/* Header Banner */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-8 pointer-events-none">
          <BookOpenCheck size={200} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Badge color="green" className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              ● Active Semester • Academic Year 2025-26
            </Badge>
            <span className="text-xs text-slate-300">Staff ID: EMP-001</span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
            {t('welcome_back', 'Welcome back')}, Abdul Jabbar
          </h2>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            Senior Mathematics & Physics Faculty. You have <span className="font-semibold text-emerald-300">{formatNumber(dayRoutines.length)} {t('classes_today', 'classes scheduled')}</span> {t('today', 'today')} across Class 10-A, 9-B, and 8-A.
          </p>
        </div>
        
        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <CentralNotificationBell variant="prominent" />
          <TeacherNotificationBell teacherId="EMP-001" variant="navbar" />
          <Button 
            onClick={() => setIsQuickLeaveModalOpen(true)}
            icon={CalendarRange}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-sm"
          >
            {t('quick_leave_request', 'Quick Leave Request')}
          </Button>
          <Button 
            onClick={() => setIsAttendanceModalOpen(true)}
            icon={CheckSquare}
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          >
            {t('mark_attendance', 'Mark Attendance')}
          </Button>
          <Button 
            onClick={() => setIsUploadModalOpen(true)}
            icon={UploadCloud}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
          >
            {t('upload_material', 'Upload Material')}
          </Button>
        </div>
      </div>

      {/* Centralized Faculty & Institutional Notification Hub */}
      <DashboardNotificationWidget role={UserRole.TEACHER} className="mb-6" />

      {/* Teacher Leave Status Change Alert Banner */}
      <TeacherLeaveStatusBanner teacherId="EMP-001" className="mb-6" />

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4 border-l-4 border-indigo-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t('total_students', 'Total Students')}</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{formatNumber(120)}</h3>
              <p className="text-xs text-indigo-600 font-medium mt-1">{t('across_sections', 'Across 3 Sections')}</p>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Users size={22} />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-emerald-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t('classes_today', 'Classes Today')}</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{formatNumber(dayRoutines.length || 4)}</h3>
              <p className="text-xs text-emerald-600 font-medium mt-1">{t('next_class_prefix', 'Next: Period')} 2 (10:15 AM)</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Calendar size={22} />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-blue-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t('study_materials_kpi', 'Study Materials')}</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{formatNumber(materials.length)}</h3>
              <p className="text-xs text-blue-600 font-medium mt-1">{formatNumber(144)} {t('total_downloads', 'Total Downloads')}</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <BookOpen size={22} />
            </div>
          </div>
        </Card>

        <Card 
          className="p-4 border-l-4 border-amber-500 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setDashboardTab('performance')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{t('class_performance_kpi', 'Class Performance')}</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">{formatNumber('78.4')}%</h3>
              <p className="text-xs text-amber-600 font-medium mt-1">Avg GPA 4.12 • Analytics →</p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <TrendingUp size={22} />
            </div>
          </div>
        </Card>
      </div>

      {/* Primary Dashboard Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 mb-6">
        <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto">
          <button
            onClick={() => setDashboardTab('overview')}
            className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              dashboardTab === 'overview'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <CalendarDays size={18} />
            <span>{t('overview_daily_routine', 'Overview & Daily Routine')}</span>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{t('today', 'Today')}</span>
          </button>

          <button
            onClick={() => setDashboardTab('performance')}
            className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              dashboardTab === 'performance'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <TrendingUp size={18} />
            <span>{t('student_performance', 'Student Performance')}</span>
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
              Recharts Analytics
            </span>
          </button>
        </div>

        {dashboardTab === 'performance' && (
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            <span>Live Class Grading Engine</span>
          </div>
        )}
      </div>

      {/* Tab Content 1: Student Performance Analytics */}
      {dashboardTab === 'performance' && (
        <div className="mb-8">
          <StudentPerformanceAnalytics />
        </div>
      )}

      {/* Tab Content 2: Overview & Daily Routine Grid */}
      {dashboardTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Left Column (2 Cols): Classes Routine & Attendance Section */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Dedicated View: Daily Routine & Classes */}
          <Card 
            title={t('class_routine_timetable', 'Class Routine & Timetable')} 
            action={
              <Link to="/teacher/routine" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                {t('full_weekly_routine', 'Full Weekly Routine')} <ChevronRight size={14} />
              </Link>
            }
          >
            {/* Day Selector Tabs */}
            <div className="flex items-center gap-1 border-b border-slate-100 pb-3 mb-4 overflow-x-auto">
              {(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'] as const).map(day => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    selectedDay === day 
                      ? 'bg-indigo-600 text-white shadow-sm' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>

            {/* Classes List for the Day */}
            <div className="space-y-3">
              {dayRoutines.length > 0 ? (
                dayRoutines.map((routine, idx) => {
                  const isCurrent = idx === 0;
                  return (
                    <div 
                      key={idx} 
                      className={`p-4 rounded-xl border transition-all ${
                        isCurrent 
                          ? 'bg-indigo-50/50 border-indigo-200 ring-1 ring-indigo-200' 
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-4">
                          <div className={`px-3 py-2 rounded-lg text-center font-bold text-xs shrink-0 ${
                            isCurrent ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                          }`}>
                            <p>{routine.period}</p>
                            <span className="text-[10px] font-normal opacity-80">{routine.time}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-800 text-base">{routine.subjectName}</h4>
                              {isCurrent && (
                                <Badge color="green" className="animate-pulse">Next Up</Badge>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              <span className="font-medium text-slate-700">{routine.classId}</span> • Room <span className="font-medium text-slate-700">{routine.roomNo}</span> • Academic Building
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <Button 
                            variant="secondary" 
                            className="text-xs h-8"
                            onClick={() => {
                              setAttendanceClass(routine.classId.includes('10') ? 'Class 10' : 'Class 9');
                              setIsAttendanceModalOpen(true);
                            }}
                            icon={UserCheck}
                          >
                            Attendance
                          </Button>
                          <Link to="/teacher/live-class">
                            <Button 
                              variant="outline" 
                              className="text-xs h-8 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                              icon={Video}
                            >
                              Live Room
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <CalendarDays className="mx-auto text-slate-400 mb-2" size={32} />
                  <p className="text-sm font-medium text-slate-700">No classes scheduled on {selectedDay}</p>
                  <p className="text-xs text-slate-500 mt-1">Use this time for lesson planning or evaluating homework.</p>
                </div>
              )}
            </div>
          </Card>

          {/* Dedicated View: Attendance Tracking & Status */}
          <Card 
            title="Class Attendance Overview" 
            action={
              <Link to="/teacher/attendance" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                Attendance Register <ChevronRight size={14} />
              </Link>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-700">Class 10 - Section A</span>
                  <Badge color="green">Marked</Badge>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-2">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '95%' }}></div>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>38 Present</span>
                  <span className="text-rose-600 font-medium">2 Absent</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-700">Class 9 - Section B</span>
                  <Badge color="green">Marked</Badge>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-2">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '92%' }}></div>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>37 Present</span>
                  <span className="text-rose-600 font-medium">3 Absent</span>
                </div>
              </div>

              <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-700">Class 8 - Section A</span>
                  <Badge color="yellow">Pending</Badge>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-2">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: '0%' }}></div>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Period 4 Today</span>
                  <button 
                    onClick={() => { setAttendanceClass('Class 8'); setIsAttendanceModalOpen(true); }}
                    className="text-amber-700 font-bold hover:underline"
                  >
                    Take Now
                  </button>
                </div>
              </div>
            </div>

            {/* Absentee Quick Follow-up */}
            <div className="border-t border-slate-100 pt-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Today's Absent Students Alert</h5>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2.5 bg-red-50/60 border border-red-100 rounded-lg text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-red-200 text-red-700 flex items-center justify-center font-bold text-[10px]">
                      103
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Karim Ullah</p>
                      <p className="text-slate-500 text-[11px]">Class 10-A • Guardian: Rafiq Ullah (01711-223344)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="secondary" 
                      className="text-[11px] h-7 px-2"
                      onClick={() => showToast('SMS notification sent to parent of Karim Ullah', 'success')}
                      icon={Send}
                    >
                      Send SMS
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-red-50/60 border border-red-100 rounded-lg text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-full bg-red-200 text-red-700 flex items-center justify-center font-bold text-[10px]">
                      105
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">Tariq Islam</p>
                      <p className="text-slate-500 text-[11px]">Class 9-B • Guardian: Aminul Islam (01811-998877)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="secondary" 
                      className="text-[11px] h-7 px-2"
                      onClick={() => showToast('SMS notification sent to parent of Tariq Islam', 'success')}
                      icon={Send}
                    >
                      Send SMS
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Dedicated View: Study Materials & Resources Hub */}
          <Card 
            title="Study Materials & Class Notes" 
            action={
              <div className="flex items-center gap-2">
                <Button 
                  onClick={() => setIsUploadModalOpen(true)} 
                  icon={Plus} 
                  className="text-xs h-8"
                >
                  Upload New
                </Button>
                <Link to="/teacher/materials" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                  View All <ChevronRight size={14} />
                </Link>
              </div>
            }
          >
            {/* Subject Filters */}
            <div className="flex items-center gap-2 mb-4">
              {['All', 'Mathematics', 'Physics'].map(sub => (
                <button
                  key={sub}
                  onClick={() => setMaterialFilter(sub)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    materialFilter === sub 
                      ? 'bg-slate-800 text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredMaterials.map(item => (
                <div key={item.id} className="p-3.5 border border-slate-200 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/20 transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
                        <FileText size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{item.title}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{item.subject} • {item.class}</p>
                        <p className="text-[11px] text-slate-400 mt-1">{item.size} • {item.downloads} downloads</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => showToast(`Downloading ${item.title}...`, 'info')}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Download file"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column (1 Col): Homework Tracker, Quick Actions, Notices */}
        <div className="space-y-6">
          
          {/* Quick Action Navigation Shortcuts */}
          <Card title="Quick Actions">
            <div className="grid grid-cols-2 gap-2.5">
              <Link 
                to="/teacher/attendance"
                className="p-3 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 border border-slate-200/70 rounded-xl flex flex-col items-center text-center gap-1.5 transition-all group"
              >
                <div className="p-2 bg-indigo-100/60 text-indigo-600 rounded-lg group-hover:scale-110 transition-transform">
                  <CheckSquare size={18} />
                </div>
                <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600">Attendance</span>
              </Link>

              <Link 
                to="/teacher/homework"
                className="p-3 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200/70 rounded-xl flex flex-col items-center text-center gap-1.5 transition-all group"
              >
                <div className="p-2 bg-emerald-100/60 text-emerald-600 rounded-lg group-hover:scale-110 transition-transform">
                  <BookOpen size={18} />
                </div>
                <span className="text-xs font-bold text-slate-700 group-hover:text-emerald-600">Homework</span>
              </Link>

              <Link 
                to="/teacher/marks"
                className="p-3 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 border border-slate-200/70 rounded-xl flex flex-col items-center text-center gap-1.5 transition-all group"
              >
                <div className="p-2 bg-blue-100/60 text-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                  <BarChart2 size={18} />
                </div>
                <span className="text-xs font-bold text-slate-700 group-hover:text-blue-600">Marks Entry</span>
              </Link>

              <Link 
                to="/teacher/lesson-plan"
                className="p-3 bg-slate-50 hover:bg-purple-50 hover:border-purple-200 border border-slate-200/70 rounded-xl flex flex-col items-center text-center gap-1.5 transition-all group"
              >
                <div className="p-2 bg-purple-100/60 text-purple-600 rounded-lg group-hover:scale-110 transition-transform">
                  <Sparkles size={18} />
                </div>
                <span className="text-xs font-bold text-slate-700 group-hover:text-purple-600">AI Lesson Plan</span>
              </Link>

              <Link 
                to="/teacher/students"
                className="p-3 bg-slate-50 hover:bg-amber-50 hover:border-amber-200 border border-slate-200/70 rounded-xl flex flex-col items-center text-center gap-1.5 transition-all group"
              >
                <div className="p-2 bg-amber-100/60 text-amber-600 rounded-lg group-hover:scale-110 transition-transform">
                  <Users size={18} />
                </div>
                <span className="text-xs font-bold text-slate-700 group-hover:text-amber-600">My Students</span>
              </Link>

              <button 
                type="button"
                onClick={() => setIsQuickLeaveModalOpen(true)}
                className="p-3 bg-slate-50 hover:bg-rose-50 hover:border-rose-200 border border-slate-200/70 rounded-xl flex flex-col items-center text-center gap-1.5 transition-all group cursor-pointer"
                title="Submit Quick Leave Request directly from dashboard"
              >
                <div className="p-2 bg-rose-100/60 text-rose-600 rounded-lg group-hover:scale-110 transition-transform">
                  <Coffee size={18} />
                </div>
                <span className="text-xs font-bold text-slate-700 group-hover:text-rose-600">
                  Quick Leave ({teacherQuota ? teacherQuota.casual.remaining + teacherQuota.sick.remaining : 12}d)
                </span>
              </button>
            </div>
          </Card>

          {/* Active Homework & Assignments Tracker */}
          <Card 
            title="Homework & Tasks"
            action={
              <button 
                onClick={() => setIsHomeworkModalOpen(true)}
                className="p-1 text-indigo-600 hover:bg-indigo-50 rounded"
                title="Create assignment"
              >
                <Plus size={16} />
              </button>
            }
          >
            <div className="space-y-3">
              {homeworkList.map(hw => (
                <div key={hw.id} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h4 className="font-bold text-slate-800 text-xs line-clamp-1">{hw.title}</h4>
                    <Badge color={hw.status === 'Active' ? 'green' : 'blue'}>{hw.status}</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2">{hw.subject} • {hw.class}</p>
                  
                  <div className="flex items-center justify-between text-[11px] text-slate-600 mb-1">
                    <span>Submissions</span>
                    <span className="font-bold text-indigo-600">{hw.submitted}/{hw.total}</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-2">
                    <div 
                      className="bg-indigo-600 h-full rounded-full" 
                      style={{ width: `${Math.round((hw.submitted / hw.total) * 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span>Due: {hw.dueDate}</span>
                    <Link to="/teacher/homework" className="text-indigo-600 font-bold hover:underline">
                      Grade Submissions
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Faculty Leave Quota & Quick Action Card */}
          <Card 
            title="Leave Balance & Quick Dispatch"
            action={
              <Link to="/teacher/leave" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                Full Register <ChevronRight size={14} />
              </Link>
            }
          >
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-amber-50 border border-amber-200/70 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-amber-800 block">Casual</span>
                  <div className="text-lg font-black text-amber-950 font-mono mt-0.5">
                    {teacherQuota?.casual.remaining ?? 12}
                    <span className="text-[10px] text-amber-700 font-normal">/{teacherQuota?.casual.total ?? 14}</span>
                  </div>
                  <span className="text-[9px] text-amber-700">Days Left</span>
                </div>

                <div className="p-2 bg-emerald-50 border border-emerald-200/70 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block">Medical</span>
                  <div className="text-lg font-black text-emerald-950 font-mono mt-0.5">
                    {teacherQuota?.sick.remaining ?? 9}
                    <span className="text-[10px] text-emerald-700 font-normal">/{teacherQuota?.sick.total ?? 10}</span>
                  </div>
                  <span className="text-[9px] text-emerald-700">Days Left</span>
                </div>

                <div className="p-2 bg-indigo-50 border border-indigo-200/70 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-indigo-800 block">Duty</span>
                  <div className="text-lg font-black text-indigo-950 font-mono mt-0.5">
                    {teacherQuota?.duty.remaining ?? 5}
                    <span className="text-[10px] text-indigo-700 font-normal">/{teacherQuota?.duty.total ?? 7}</span>
                  </div>
                  <span className="text-[9px] text-indigo-700">Days Left</span>
                </div>
              </div>

              {/* Recent Application Notice */}
              {teacherLeaves.length > 0 && (
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-800 truncate">{teacherLeaves[0].type} Leave</span>
                      <span className={`text-[9.5px] font-bold px-1.5 py-0.2 rounded-full ${
                        teacherLeaves[0].status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : teacherLeaves[0].status === 'Pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {teacherLeaves[0].status}
                      </span>
                    </div>
                    <span className="text-[10.5px] text-slate-500 block truncate mt-0.5">
                      {teacherLeaves[0].startDate} • {teacherLeaves[0].daysCount} day(s) • {teacherLeaves[0].reason}
                    </span>
                  </div>

                  <Link to="/teacher/leave" className="text-[11px] font-bold text-indigo-600 hover:underline shrink-0">
                    Track →
                  </Link>
                </div>
              )}

              <Button
                onClick={() => setIsQuickLeaveModalOpen(true)}
                icon={CalendarRange}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black shadow-xs py-2 text-xs flex items-center justify-center gap-2"
              >
                Apply for Quick Leave
              </Button>
            </div>
          </Card>

          {/* Faculty Notices */}
          <Card title="Teacher Notices">
            <div className="space-y-3">
              <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Bell size={14} className="text-indigo-600" />
                  <h4 className="font-bold text-xs text-slate-800">Monthly Faculty Meeting</h4>
                </div>
                <p className="text-xs text-slate-600">
                  Principal has scheduled the all-staff academic progress review for Thursday at 3:30 PM in Conference Room 1.
                </p>
                <p className="text-[10px] text-slate-400 mt-2">Posted by Admin • 2 hours ago</p>
              </div>

              <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle size={14} className="text-amber-600" />
                  <h4 className="font-bold text-xs text-slate-800">Term-End Exam Question Papers</h4>
                </div>
                <p className="text-xs text-slate-600">
                  Please submit your moderated exam papers for Mathematics and Physics by May 28th to the exam controller.
                </p>
                <p className="text-[10px] text-slate-400 mt-2">Posted by Exam Controller • Yesterday</p>
              </div>
            </div>
          </Card>

        </div>
      </div>
      )}

      {/* Modal: Quick Upload Study Material */}
      <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload Study Material">
        <form className="space-y-4" onSubmit={handleUploadMaterial}>
          <Input 
            label="Material Title" 
            placeholder="e.g. Chapter 4 Trigonometry Formula Sheet"
            value={newMaterial.title}
            onChange={e => setNewMaterial({ ...newMaterial, title: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
              <select 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                value={newMaterial.subject}
                onChange={e => setNewMaterial({ ...newMaterial, subject: e.target.value })}
              >
                <option>Mathematics</option>
                <option>Physics</option>
                <option>General Science</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Target Class</label>
              <select 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                value={newMaterial.class}
                onChange={e => setNewMaterial({ ...newMaterial, class: e.target.value })}
              >
                <option>Class 10 - A</option>
                <option>Class 9 - B</option>
                <option>Class 8 - A</option>
              </select>
            </div>
          </div>
          <div className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50 hover:bg-indigo-50/20">
            <UploadCloud className="mx-auto text-indigo-500 mb-2" size={32} />
            <span className="text-sm font-semibold text-slate-700">Drop PDF, DOCX, or PPTX file here</span>
            <p className="text-xs text-slate-400 mt-1">Maximum file size: 25MB</p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setIsUploadModalOpen(false)}>Cancel</Button>
            <Button type="submit" icon={UploadCloud}>Publish to Students</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Quick Create Assignment */}
      <Modal isOpen={isHomeworkModalOpen} onClose={() => setIsHomeworkModalOpen(false)} title="Assign New Homework">
        <form className="space-y-4" onSubmit={handleCreateHomework}>
          <Input 
            label="Assignment Title" 
            placeholder="e.g. Exercises 5.2 - Quadratic Equations" 
            value={newHomework.title}
            onChange={e => setNewHomework({ ...newHomework, title: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
              <select 
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                value={newHomework.class}
                onChange={e => setNewHomework({ ...newHomework, class: e.target.value })}
              >
                <option>Class 10 - A</option>
                <option>Class 9 - B</option>
                <option>Class 8 - A</option>
              </select>
            </div>
            <Input 
              label="Due Date" 
              type="date" 
              value={newHomework.dueDate}
              onChange={e => setNewHomework({ ...newHomework, dueDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Instructions & Problem Set Details</label>
            <textarea 
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm h-24 resize-none"
              placeholder="Specify the exercises, page numbers, or guidelines for the submission..."
              value={newHomework.instructions}
              onChange={e => setNewHomework({ ...newHomework, instructions: e.target.value })}
            ></textarea>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setIsHomeworkModalOpen(false)}>Cancel</Button>
            <Button type="submit" icon={BookOpen}>Post Homework</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Quick Attendance Marking */}
      <Modal isOpen={isAttendanceModalOpen} onClose={() => setIsAttendanceModalOpen(false)} title={`Mark Attendance: ${attendanceClass}`}>
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <span className="text-xs text-slate-500 font-medium">Selecting Class:</span>
              <div className="flex gap-2 mt-1">
                {['Class 10', 'Class 9', 'Class 8'].map(cls => (
                  <button
                    key={cls}
                    onClick={() => setAttendanceClass(cls)}
                    className={`px-3 py-1 text-xs font-bold rounded-md ${
                      attendanceClass === cls ? 'bg-indigo-600 text-white' : 'bg-white border text-slate-600'
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>
            <Button 
              variant="secondary" 
              className="text-xs"
              onClick={() => {
                const updated = { ...attendanceRecords };
                classStudents.forEach(s => { updated[s.id] = 'Present'; });
                setAttendanceRecords(updated);
                showToast('All students marked Present', 'info');
              }}
            >
              Mark All Present
            </Button>
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg">
            {classStudents.map(student => (
              <div key={student.id} className="p-3 flex items-center justify-between hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-slate-500 w-8">#{student.rollNo}</span>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{student.name}</p>
                    <p className="text-[11px] text-slate-400">{student.class} - Sec {student.section}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggleStudentAttendance(student.id)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                    (attendanceRecords[student.id] || 'Present') === 'Present'
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                      : (attendanceRecords[student.id] || 'Present') === 'Absent'
                      ? 'bg-rose-100 text-rose-700 border border-rose-300'
                      : 'bg-amber-100 text-amber-700 border border-amber-300'
                  }`}
                >
                  {attendanceRecords[student.id] || 'Present'}
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setIsAttendanceModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveAttendance} icon={CheckSquare}>Save Attendance</Button>
          </div>
        </div>
      </Modal>

      {/* Quick Leave Request Modal */}
      <QuickLeaveRequestModal
        isOpen={isQuickLeaveModalOpen}
        onClose={() => setIsQuickLeaveModalOpen(false)}
        teacherId="EMP-001"
        teacherName="Abdul Jabbar"
        onSuccess={() => {
          setTeacherLeaves(getTeacherLeaves('EMP-001'));
          setTeacherQuota(getTeacherLeaveQuota('EMP-001'));
        }}
      />
    </DashboardLayout>
  );
};

// ... [TeacherLiveClass remains unchanged] ...
export const TeacherLiveClass = () => {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [classes, setClasses] = useState([
        { id: 1, title: 'Math Problem Solving', class: 'Class 10-A', time: '10:00 AM - 11:00 AM', date: '2024-05-21', platform: 'Zoom', link: 'https://zoom.us/j/123456789' },
        { id: 2, title: 'Physics Doubt Session', class: 'Class 9-B', time: '02:00 PM - 03:00 PM', date: '2024-05-22', platform: 'Google Meet', link: 'https://meet.google.com/abc-defg-hij' },
    ]);
    const [newClass, setNewClass] = useState({ title: '', class: 'Class 10 - A', date: '', time: '', platform: 'Zoom', link: '' });

    const handleSchedule = (e: React.FormEvent) => {
        e.preventDefault();
        const formattedTime = new Date(`2000-01-01T${newClass.time}`).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const classObj = {
            id: classes.length + 1,
            title: newClass.title,
            class: newClass.class,
            date: newClass.date,
            time: `${formattedTime} - ${formattedTime}`, // Simplified range for demo
            platform: newClass.platform,
            link: newClass.link
        };
        setClasses([...classes, classObj]);
        setIsAddModalOpen(false);
        setNewClass({ title: '', class: 'Class 10 - A', date: '', time: '', platform: 'Zoom', link: '' });
    };

    return (
        <DashboardLayout role={UserRole.TEACHER}>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Live Classes</h2>
                    <p className="text-slate-500">Schedule and manage online sessions.</p>
                </div>
                <Button icon={Plus} onClick={() => setIsAddModalOpen(true)}>Schedule Class</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {classes.map(cls => (
                    <Card key={cls.id} className="border-l-4 border-indigo-500">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-slate-800">{cls.title}</h3>
                                <p className="text-sm text-slate-500">{cls.class}</p>
                            </div>
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                <Video size={20} />
                            </div>
                        </div>
                        <div className="space-y-2 text-sm text-slate-600 mb-6">
                            <div className="flex items-center gap-2">
                                <Calendar size={16}/> {cls.date}
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock size={16}/> {cls.time}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium">Platform:</span> {cls.platform}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <a href={cls.link} target="_blank" rel="noreferrer" className="flex-1">
                                <Button className="w-full text-xs" icon={ExternalLink}>Start Class</Button>
                            </a>
                            <Button variant="secondary" className="text-xs" icon={Edit}>Edit</Button>
                        </div>
                    </Card>
                ))}
            </div>

            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Schedule Live Class">
                <form className="space-y-4" onSubmit={handleSchedule}>
                    <Input 
                        label="Class Title" 
                        placeholder="e.g. Chapter 5 Revision" 
                        value={newClass.title}
                        onChange={e => setNewClass({...newClass, title: e.target.value})}
                        required
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Target Class</label>
                            <select 
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                value={newClass.class}
                                onChange={e => setNewClass({...newClass, class: e.target.value})}
                            >
                                <option>Class 10 - A</option>
                                <option>Class 9 - B</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Platform</label>
                            <select 
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                                value={newClass.platform}
                                onChange={e => setNewClass({...newClass, platform: e.target.value})}
                            >
                                <option>Zoom</option>
                                <option>Google Meet</option>
                                <option>Microsoft Teams</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input 
                            label="Date" 
                            type="date" 
                            value={newClass.date}
                            onChange={e => setNewClass({...newClass, date: e.target.value})}
                            required
                        />
                        <Input 
                            label="Start Time" 
                            type="time" 
                            value={newClass.time}
                            onChange={e => setNewClass({...newClass, time: e.target.value})}
                            required
                        />
                    </div>
                    <Input 
                        label="Meeting Link" 
                        placeholder="https://..." 
                        value={newClass.link}
                        onChange={e => setNewClass({...newClass, link: e.target.value})}
                        required
                    />
                    <div className="flex justify-end pt-4">
                        <Button type="submit">Schedule</Button>
                    </div>
                </form>
            </Modal>
        </DashboardLayout>
    );
};

// ... [Keep other TeacherPortal components unchanged until TeacherRoutine] ...
export const TeacherLessonPlan = () => {
    // ... [existing content] ...
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'diary' | 'ai'>('diary');
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiResult, setAiResult] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const [plans, setPlans] = useState([
        { id: 1, date: '2024-05-20', class: 'Class 10 - A', subject: 'Mathematics', topic: 'Algebraic Formulas', status: 'Completed', work: 'Ex 3.1 Q1-5' },
        { id: 2, date: '2024-05-21', class: 'Class 10 - A', subject: 'Mathematics', topic: 'Quadratic Equations', status: 'Planned', work: 'Intro theory' },
    ]);

    const handleGenerate = () => {
        if (!aiPrompt) return;
        setIsGenerating(true);
        // Simulate AI generation
        setTimeout(() => {
            setAiResult(`
**Lesson Outline: ${aiPrompt}**

1. **Introduction (5 mins)**
   - Start with a real-life example.
   - Define key terms.

2. **Core Concept (15 mins)**
   - Explain the theorem/concept in detail.
   - Show diagrams on whiteboard.

3. **Activity (15 mins)**
   - Group discussion or problem-solving.
   - Worksheet distribution.

4. **Assessment (5 mins)**
   - Quick quiz or Q&A session.

**Homework:** Read chapter 5 and solve practice questions 1-5.
            `);
            setIsGenerating(false);
        }, 1500);
    };

    return (
        <DashboardLayout role={UserRole.TEACHER}>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Lesson Plans & Diary</h2>
                    <p className="text-slate-500">Plan your weekly teaching schedule.</p>
                </div>
                <div className="flex gap-2">
                    <div className="flex bg-slate-100 rounded-lg p-1">
                        <button 
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${activeTab === 'diary' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                            onClick={() => setActiveTab('diary')}
                        >
                            Class Diary
                        </button>
                        <button 
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${activeTab === 'ai' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                            onClick={() => setActiveTab('ai')}
                        >
                            <Sparkles size={12}/> AI Assistant
                        </button>
                    </div>
                    <Button icon={Plus} onClick={() => setIsAddModalOpen(true)}>Add Plan</Button>
                </div>
            </div>

            {activeTab === 'diary' ? (
                <div className="space-y-6">
                    <Card>
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Class & Subject</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Topic</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Classwork</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {plans.map(plan => (
                                    <tr key={plan.id}>
                                        <td className="px-6 py-4 text-sm text-slate-700 font-medium">{plan.date}</td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-slate-800">{plan.subject}</p>
                                            <p className="text-xs text-slate-500">{plan.class}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{plan.topic}</td>
                                        <td className="px-6 py-4 text-sm text-slate-500 italic">"{plan.work}"</td>
                                        <td className="px-6 py-4">
                                            <Badge color={plan.status === 'Completed' ? 'green' : 'blue'}>{plan.status}</Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button variant="ghost" className="text-xs text-slate-400 hover:text-indigo-600"><Edit size={16}/></Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Card>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card title="AI Lesson Generator">
                        <div className="space-y-4">
                            <p className="text-sm text-slate-600">Enter a topic, and our AI will create a structured lesson plan for you.</p>
                            <Input 
                                label="Topic / Concept" 
                                placeholder="e.g. Introduction to Thermodynamics" 
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Class Level</label>
                                    <select className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                                        <option>Primary</option>
                                        <option>Secondary (Class 6-10)</option>
                                        <option>Higher Secondary</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Duration</label>
                                    <select className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                                        <option>30 Minutes</option>
                                        <option>45 Minutes</option>
                                        <option>60 Minutes</option>
                                    </select>
                                </div>
                            </div>
                            <Button 
                                className="w-full" 
                                onClick={handleGenerate} 
                                disabled={!aiPrompt || isGenerating}
                                icon={BrainCircuit}
                            >
                                {isGenerating ? 'Generating...' : 'Generate Lesson Plan'}
                            </Button>
                        </div>
                    </Card>

                    {aiResult && (
                        <Card title="Generated Plan" className="bg-indigo-50 border-indigo-100">
                            <div className="prose prose-sm text-slate-700 whitespace-pre-wrap">
                                {aiResult}
                            </div>
                            <div className="mt-4 flex justify-end gap-2">
                                <Button variant="secondary" className="text-xs" icon={Printer}>Print</Button>
                                <Button className="text-xs" icon={Save} onClick={() => { setIsAddModalOpen(true); setActiveTab('diary'); }}>Save to Diary</Button>
                            </div>
                        </Card>
                    )}
                </div>
            )}

            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Lesson Plan">
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsAddModalOpen(false); }}>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Date" type="date" />
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
                            <select className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                                <option>Class 10 - A</option>
                                <option>Class 9 - B</option>
                            </select>
                        </div>
                    </div>
                    <Input label="Subject" defaultValue="Mathematics" />
                    <Input label="Topic" placeholder="e.g. Geometry - Circles" />
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Classwork / Homework</label>
                        <textarea className="w-full px-3 py-2 border border-slate-300 rounded-lg h-24 resize-none" placeholder="What will be done in class..."></textarea>
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button type="submit">Save Plan</Button>
                    </div>
                </form>
            </Modal>
        </DashboardLayout>
    );
};

export const TeacherAttendance = () => {
    const [selectedClass, setSelectedClass] = useState('Class 10');
    // Mock filtering logic - in real app, fetch students by class ID
    const students = MOCK_STUDENTS.filter(s => s.class === selectedClass);
    
    const [attendance, setAttendance] = useState<Record<string, string>>(() => {
        const initial: Record<string, string> = {};
        // Initialize visible students
        students.forEach(s => initial[s.id] = 'Present');
        return initial;
    });

    // Effect to reset attendance when class changes (optional, or just load saved state)
    React.useEffect(() => {
        const initial: Record<string, string> = {};
        students.forEach(s => initial[s.id] = 'Present');
        setAttendance(initial);
    }, [selectedClass]);

    const toggleAttendance = (id: string) => {
        setAttendance(prev => ({
            ...prev,
            [id]: prev[id] === 'Absent' ? 'Present' : prev[id] === 'Present' ? 'Late' : 'Absent'
        }));
    };

    const markAllPresent = () => {
        const updated: Record<string, string> = {};
        students.forEach(s => updated[s.id] = 'Present');
        setAttendance(updated);
    };

    const presentCount = Object.values(attendance).filter(s => s === 'Present').length;
    const absentCount = Object.values(attendance).filter(s => s === 'Absent').length;
    const lateCount = Object.values(attendance).filter(s => s === 'Late').length;

    return (
        <DashboardLayout role={UserRole.TEACHER}>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Mark Attendance</h2>
                    <p className="text-slate-500">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="flex gap-2 items-center w-full md:w-auto">
                    <select 
                        className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                    >
                        <option value="Class 10">Class 10 - Section A</option>
                        <option value="Class 9">Class 9 - Section B</option>
                        <option value="Class 8">Class 8 - Section A</option>
                    </select>
                    <Button 
                        variant="secondary" 
                        icon={Download} 
                        onClick={() => exportTableToPDF({
                            title: `Daily Attendance Sheet - ${selectedClass}`,
                            subtitle: `Date: ${new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} • Total Students: ${students.length}`,
                            columns: [
                                { header: 'Roll', dataKey: 'rollNo', width: 15 },
                                { header: 'Student ID', dataKey: 'studentId', width: 25 },
                                { header: 'Student Name', dataKey: 'name', width: 50 },
                                { header: 'Class', dataKey: 'class', width: 25 },
                                { header: 'Section', dataKey: 'section', width: 20 },
                                { header: 'Status', dataKey: 'status', width: 25 },
                            ],
                            data: students.map(s => ({
                                rollNo: s.rollNo,
                                studentId: s.id,
                                name: s.name,
                                class: s.class,
                                section: s.section,
                                status: attendance[s.id] || 'Present'
                            })),
                            summaryStats: [
                                { label: 'Present Count', value: presentCount },
                                { label: 'Absent Count', value: absentCount },
                                { label: 'Late Count', value: lateCount }
                            ]
                        })}
                    >
                        Export PDF
                    </Button>
                    <Button variant="secondary" onClick={markAllPresent} className="whitespace-nowrap">All Present</Button>
                    <Button icon={CheckSquare}>Save</Button>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center">
                    <span className="text-xs font-bold text-green-700 uppercase">Present</span>
                    <p className="text-2xl font-bold text-green-800">{presentCount}</p>
                </div>
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center">
                    <span className="text-xs font-bold text-red-700 uppercase">Absent</span>
                    <p className="text-2xl font-bold text-red-800">{absentCount}</p>
                </div>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                    <span className="text-xs font-bold text-yellow-700 uppercase">Late</span>
                    <p className="text-2xl font-bold text-yellow-800">{lateCount}</p>
                </div>
            </div>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Roll</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Student Name</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Status (Click to toggle)</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {students.length > 0 ? students.map((student) => (
                                <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-mono text-slate-500">{student.rollNo}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-900 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center text-slate-500">
                                            {student.imageUrl ? <img src={student.imageUrl} className="w-full h-full object-cover" alt=""/> : <Users size={16}/>}
                                        </div>
                                        {student.name}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button 
                                            onClick={() => toggleAttendance(student.id)}
                                            className={`w-32 py-2 rounded-full text-xs font-bold transition-all duration-200 border shadow-sm ${
                                                attendance[student.id] === 'Present' 
                                                ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200' 
                                                : attendance[student.id] === 'Late'
                                                ? 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200'
                                                : 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200'
                                            }`}
                                        >
                                            {attendance[student.id]}
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={3} className="px-6 py-12 text-center text-slate-500">No students found for this class.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </DashboardLayout>
    );
};

export const TeacherHomework = () => {
    const { publishHomeworkAlert } = useNotifications();
    const { showToast } = useToast();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
    const [viewingSubmissions, setViewingSubmissions] = useState<any>(null);
    const [formTitle, setFormTitle] = useState('');
    const [formClass, setFormClass] = useState('Class 10 - A');
    const [formSubject, setFormSubject] = useState('Mathematics');
    const [formDueDate, setFormDueDate] = useState('');
    const [formInstructions, setFormInstructions] = useState('');
    
    // Mock Assignments
    const [assignmentsList, setAssignmentsList] = useState([
        { id: 1, title: 'Algebra Practice Set 1', subject: 'Mathematics', class: 'Class 10 - A', dueDate: '2024-05-25', status: 'Active', submissions: 24, total: 45 },
        { id: 2, title: 'Hamlet Essay', subject: 'English', class: 'Class 10 - B', dueDate: '2024-05-22', status: 'Expired', submissions: 40, total: 42 },
        { id: 3, title: 'Physics Lab Report', subject: 'Physics', class: 'Class 9 - A', dueDate: '2024-05-30', status: 'Active', submissions: 12, total: 50 },
    ]);

    // Mock Submissions
    const submissions = [
        { id: 1, student: 'Rahim Ahmed', roll: '101', submittedAt: '2024-05-20', status: 'Pending', file: 'algebra_rahim.pdf' },
        { id: 2, student: 'Fatima Begum', roll: '102', submittedAt: '2024-05-21', status: 'Graded', grade: '9/10', file: 'algebra_fatima.jpg' },
        { id: 3, student: 'Karim Ullah', roll: '103', submittedAt: '2024-05-22', status: 'Pending', file: 'algebra_karim.pdf' },
    ];

    return (
        <DashboardLayout role={UserRole.TEACHER}>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Homework & Assignments</h2>
                    <p className="text-slate-500">{viewingSubmissions ? `Submissions: ${viewingSubmissions.title}` : 'Manage class assignments.'}</p>
                </div>
                <div className="flex gap-2">
                    {viewingSubmissions && <Button variant="secondary" onClick={() => setViewingSubmissions(null)}>Back to List</Button>}
                    {!viewingSubmissions && <Button icon={Plus} onClick={() => setIsCreateModalOpen(true)}>Create Assignment</Button>}
                </div>
            </div>

            {!viewingSubmissions ? (
                <div className="grid grid-cols-1 gap-4">
                    {assignmentsList.map(assign => (
                        <Card key={assign.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setViewingSubmissions(assign)}>
                            <div className="flex justify-between items-center">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
                                        <BookOpen size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 hover:text-indigo-600">{assign.title}</h4>
                                        <p className="text-sm text-slate-500">{assign.subject} • {assign.class}</p>
                                        <p className="text-xs text-slate-400 mt-1">Due: {assign.dueDate}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="mb-2">
                                        <Badge color={assign.status === 'Active' ? 'green' : 'red'}>{assign.status}</Badge>
                                    </div>
                                    <p className="text-xs font-medium text-slate-600">{assign.submissions}/{assign.total} Submitted</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Student</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Submitted At</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">File</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {submissions.map(sub => (
                                <tr key={sub.id}>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-slate-800">{sub.student}</p>
                                        <p className="text-xs text-slate-500">Roll: {sub.roll}</p>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{sub.submittedAt}</td>
                                    <td className="px-6 py-4">
                                        <span className="flex items-center gap-1 text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded cursor-pointer hover:underline">
                                            <FileText size={12}/> {sub.file}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge color={sub.status === 'Graded' ? 'green' : 'yellow'}>
                                            {sub.status === 'Graded' ? `Graded: ${sub.grade}` : 'Pending Review'}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button variant="secondary" className="text-xs h-8">Grade</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </Card>
            )}

            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New Assignment">
                <form 
                    className="space-y-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (!formTitle.trim()) {
                            showToast('Please enter an assignment title', 'error');
                            return;
                        }
                        const newAssign = {
                            id: assignmentsList.length + 1,
                            title: formTitle,
                            subject: formSubject,
                            class: formClass,
                            dueDate: formDueDate || 'Next Week',
                            status: 'Active',
                            submissions: 0,
                            total: 45
                        };
                        setAssignmentsList([newAssign, ...assignmentsList]);
                        publishHomeworkAlert({
                            title: formTitle,
                            subject: formSubject,
                            className: formClass,
                            dueDate: formDueDate || 'Next Week',
                            instructions: formInstructions || 'Please complete assigned exercises on time.',
                            teacherName: 'Abdul Jabbar'
                        });
                        showToast('Homework assigned! Students and parents have been notified.', 'success');
                        setIsCreateModalOpen(false);
                        setFormTitle('');
                        setFormInstructions('');
                    }}
                >
                    <Input 
                        label="Assignment Title" 
                        placeholder="e.g. Chapter 5 Exercises" 
                        value={formTitle}
                        onChange={(e: any) => setFormTitle(e.target.value)}
                        required
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
                            <select 
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                                value={formClass}
                                onChange={(e) => setFormClass(e.target.value)}
                            >
                                <option>Class 10 - A</option>
                                <option>Class 9 - B</option>
                                <option>Class 8 - A</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                            <select 
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                                value={formSubject}
                                onChange={(e) => setFormSubject(e.target.value)}
                            >
                                <option>Mathematics</option>
                                <option>English</option>
                                <option>Physics</option>
                            </select>
                        </div>
                    </div>
                    <Input 
                        label="Due Date" 
                        type="date" 
                        value={formDueDate}
                        onChange={(e: any) => setFormDueDate(e.target.value)}
                    />
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Instructions</label>
                        <textarea 
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg h-24 resize-none text-sm" 
                            placeholder="Details about the assignment..."
                            value={formInstructions}
                            onChange={(e) => setFormInstructions(e.target.value)}
                        ></textarea>
                    </div>
                    <div className="flex justify-end pt-2 gap-2">
                        <Button variant="secondary" type="button" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                        <Button type="submit">Assign Homework</Button>
                    </div>
                </form>
            </Modal>
        </DashboardLayout>
    );
};

export const TeacherMaterials = () => {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    const materials = [
        { id: 1, title: 'Calculus Notes.pdf', subject: 'Mathematics', class: 'Class 10', date: '2024-05-10', size: '2.4 MB' },
        { id: 2, title: 'Poetry Summary.docx', subject: 'English', class: 'Class 9', date: '2024-05-12', size: '1.1 MB' },
    ];

    return (
        <DashboardLayout role={UserRole.TEACHER}>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Study Materials</h2>
                    <p className="text-slate-500">Share resources with students.</p>
                </div>
                <Button icon={Plus} onClick={() => setIsUploadModalOpen(true)}>Upload Material</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {materials.map(file => (
                    <Card key={file.id} className="relative group cursor-pointer hover:border-indigo-300 transition-colors">
                        <div className="flex flex-col items-center text-center p-4">
                            <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center mb-4 text-slate-400 group-hover:text-indigo-500 transition-colors">
                                <FileText size={32} />
                            </div>
                            <h4 className="font-bold text-slate-800 text-sm truncate w-full">{file.title}</h4>
                            <p className="text-xs text-slate-500 mt-1">{file.subject} • {file.class}</p>
                            <p className="text-[10px] text-slate-400 mt-2">{file.date} • {file.size}</p>
                        </div>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1 hover:bg-slate-100 rounded text-slate-500"><Download size={16}/></button>
                        </div>
                    </Card>
                ))}
            </div>

            <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload Study Material">
                <form className="space-y-4">
                    <Input label="Title" placeholder="e.g. Chapter 1 Notes" />
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Class</label>
                            <select className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                                <option>Class 10</option>
                                <option>Class 9</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                            <select className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                                <option>Mathematics</option>
                                <option>English</option>
                            </select>
                        </div>
                    </div>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:bg-slate-50">
                        <Archive className="mx-auto text-slate-400 mb-2" />
                        <span className="text-sm font-medium text-slate-600">Click to upload file</span>
                        <p className="text-xs text-slate-400 mt-1">PDF, DOCX, JPG (Max 10MB)</p>
                    </div>
                    <div className="flex justify-end pt-2">
                        <Button onClick={() => setIsUploadModalOpen(false)}>Upload</Button>
                    </div>
                </form>
            </Modal>
        </DashboardLayout>
    );
};

export const TeacherMarks = () => {
    const { publishExamResultAlert } = useNotifications();
    const { showToast } = useToast();
    const [marks, setMarks] = useState<Record<string, { written: string, mcq: string, practical: string }>>({});
    const [selectedSubject, setSelectedSubject] = useState(MOCK_SUBJECTS[0]?.id || '');

    const handleMarkChange = (studentId: string, field: 'written' | 'mcq' | 'practical', value: string) => {
        setMarks(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [field]: value
            }
        }));
    };

    const calculateTotal = (studentId: string) => {
        const studentMarks = marks[studentId] || { written: '0', mcq: '0', practical: '0' };
        const written = parseInt(studentMarks.written) || 0;
        const mcq = parseInt(studentMarks.mcq) || 0;
        const practical = parseInt(studentMarks.practical) || 0;
        return written + mcq + practical;
    };

    const calculateGrade = (total: number) => {
        const rule = MOCK_GRADING_RULES.find(r => total >= r.min && total <= r.max);
        return rule ? rule.grade : 'F';
    };

    const calculatePoint = (total: number) => {
        const rule = MOCK_GRADING_RULES.find(r => total >= r.min && total <= r.max);
        return rule ? rule.point : '0.00';
    };

    const InfoIcon = ({ size }: { size: number }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
    );

    return (
        <DashboardLayout role={UserRole.TEACHER}>
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Mark Entry</h2>
                    <p className="text-slate-500">First Term Examination 2024</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <select 
                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white flex-1 md:flex-none"
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                    >
                        {MOCK_SUBJECTS.map(sub => (
                            <option key={sub.id} value={sub.id}>{sub.name} ({sub.classId})</option>
                        ))}
                    </select>
                    <Button 
                        variant="secondary" 
                        icon={Download}
                        onClick={() => {
                            const subObj = MOCK_SUBJECTS.find(s => s.id === selectedSubject);
                            const classStudents = MOCK_STUDENTS.filter(s => s.class === 'Class 10');
                            const marksData = classStudents.map(student => {
                                const total = calculateTotal(student.id);
                                const grade = calculateGrade(total);
                                const gpa = parseFloat(calculatePoint(total));
                                return {
                                    studentId: student.id,
                                    name: student.name,
                                    rollNo: student.rollNo,
                                    class: student.class,
                                    section: student.section,
                                    examName: 'First Term Examination 2024',
                                    totalMarks: total,
                                    gpa,
                                    grade,
                                    rank: 0,
                                    status: total >= 33 ? 'Pass' : 'Fail'
                                };
                            });
                            exportPerformanceReportToPDF(marksData, {
                                title: `Marks Award Sheet - ${subObj?.name || 'Subject'}`,
                                subtitle: `First Term Examination 2024 • Class 10 (Section A)`
                            });
                        }}
                    >
                        Export PDF
                    </Button>
                    <Button variant="secondary" icon={Download}>CSV</Button>
                    <Button icon={Save} onClick={() => showToast('Marks saved successfully to database.', 'info')}>Save All</Button>
                    <Button 
                        icon={Megaphone} 
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm"
                        onClick={() => {
                            const subObj = MOCK_SUBJECTS.find(s => s.id === selectedSubject);
                            publishExamResultAlert({
                                examName: 'First Term Examination 2024',
                                className: 'Class 10',
                                subject: subObj?.name || 'Mathematics',
                                authorName: 'Abdul Jabbar',
                                gpa: '5.00'
                            });
                            showToast('Exam results published! Alert broadcasted to Students and Parents.', 'success');
                        }}
                    >
                        Publish & Alert Results
                    </Button>
                </div>
            </div>

            <Card className="p-0 overflow-hidden">
                <div className="p-4 bg-indigo-50 border-b border-indigo-100 flex items-center gap-2 text-indigo-700 text-sm">
                    <InfoIcon size={16} />
                    <span>Grading is auto-calculated. Ensure total marks do not exceed 100.</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase sticky left-0 bg-slate-50 z-10 shadow-sm">Student</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase w-24">Written (60)</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase w-24">MCQ (20)</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase w-24">Practical (20)</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase w-24 bg-slate-100">Total (100)</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase w-20">Grade</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 uppercase w-20">GPA</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {MOCK_STUDENTS.filter(s => s.class === 'Class 10').map((student) => {
                                const total = calculateTotal(student.id);
                                const grade = calculateGrade(total);
                                const gpa = calculatePoint(total);
                                return (
                                    <tr key={student.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 sticky left-0 bg-white z-10 shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold">
                                                    {student.rollNo}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900">{student.name}</p>
                                                    <p className="text-xs text-slate-500">{student.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <input 
                                                type="number" 
                                                className="w-full text-center border border-slate-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow" 
                                                placeholder="-"
                                                max="60"
                                                onChange={(e) => handleMarkChange(student.id, 'written', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input 
                                                type="number" 
                                                className="w-full text-center border border-slate-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow" 
                                                placeholder="-"
                                                max="20"
                                                onChange={(e) => handleMarkChange(student.id, 'mcq', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <input 
                                                type="number" 
                                                className="w-full text-center border border-slate-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow" 
                                                placeholder="-"
                                                max="20"
                                                onChange={(e) => handleMarkChange(student.id, 'practical', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-4 py-3 text-center bg-slate-50 font-bold text-slate-800 border-l border-r border-slate-200">
                                            {total > 0 ? total : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {total > 0 && <Badge color={grade === 'F' ? 'red' : 'green'}>{grade}</Badge>}
                                        </td>
                                        <td className="px-4 py-3 text-center font-mono text-sm">
                                            {total > 0 ? gpa : '-'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </DashboardLayout>
    );
};

export const TeacherRoutine = () => {
    const { addToast } = useToast();
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

    return (
        <DashboardLayout role={UserRole.TEACHER}>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">My Class Routine</h2>
                    <p className="text-slate-500">Weekly Schedule</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" icon={Clock} onClick={() => setIsRequestModalOpen(true)}>Request Change</Button>
                    <Button variant="secondary" icon={FileText}>Download PDF</Button>
                </div>
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Day</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Period</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Class</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Subject</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Room</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {MOCK_ROUTINES.filter(r => r.teacherName === 'Abdul Jabbar').map((routine) => (
                                <tr key={routine.id}>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-800">{routine.day}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">{routine.period}</td>
                                    <td className="px-6 py-4 text-sm text-indigo-600 font-medium">{routine.classId}</td>
                                    <td className="px-6 py-4 text-sm text-slate-800">{routine.subjectName}</td>
                                    <td className="px-6 py-4 text-sm text-slate-500">{routine.roomNo}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} title="Request Reschedule">
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsRequestModalOpen(false); addToast('Request sent to admin', 'success'); }}>
                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-sm text-yellow-800 mb-4 flex items-center gap-2">
                        <AlertTriangle size={16}/> Requests must be approved by the administration.
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Select Class to Change</label>
                        <select className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                            {MOCK_ROUTINES.filter(r => r.teacherName === 'Abdul Jabbar').map(r => (
                                <option key={r.id}>{r.day} - {r.period} ({r.subjectName})</option>
                            ))}
                        </select>
                    </div>
                    <Input label="Proposed New Date" type="date" />
                    <Input label="Reason" placeholder="e.g. Medical Appointment" />
                    <div className="flex justify-end pt-2">
                        <Button type="submit">Submit Request</Button>
                    </div>
                </form>
            </Modal>
        </DashboardLayout>
    );
};

export const TeacherStudents = () => {
    const { addToast } = useToast();
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'info' | 'results' | 'attendance' | 'report'>('info');
    const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);

    const handleReport = () => {
        setIsComplaintModalOpen(false);
        addToast('Incident reported to administration and parents.', 'warning');
    };

    return (
        <DashboardLayout role={UserRole.TEACHER}>
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">My Students</h2>
                    <p className="text-slate-500">Students in Class 10 (Section A)</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                        <input type="text" placeholder="Search..." className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
                    </div>
                </div>
            </div>

            <Card>
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Roll No</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Guardian</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {MOCK_STUDENTS.filter(s => s.class === 'Class 10').map((st) => (
                            <tr key={st.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 text-sm font-mono text-slate-500">{st.rollNo}</td>
                                <td className="px-6 py-4 text-sm font-medium text-slate-900 flex items-center gap-2">
                                    {st.imageUrl && <img src={st.imageUrl} className="w-6 h-6 rounded-full" alt="" />}
                                    {st.name}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-500">{st.guardian}</td>
                                <td className="px-6 py-4 text-sm text-slate-500">{st.phone}</td>
                                <td className="px-6 py-4">
                                    <Badge color={st.status === 'Active' ? 'green' : 'red'}>{st.status}</Badge>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedStudent(st); setActiveTab('info'); }}><Edit size={14}/></Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => { setSelectedStudent(st); setIsComplaintModalOpen(true); }}><AlertTriangle size={14}/></Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            {/* Profile View Modal */}
            <Modal 
                isOpen={!!selectedStudent && !isComplaintModalOpen} 
                onClose={() => setSelectedStudent(null)}
                title="Student Profile"
            >
                {selectedStudent && (
                    <div>
                        <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-6">
                            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-2xl overflow-hidden">
                                {selectedStudent.imageUrl ? <img src={selectedStudent.imageUrl} className="w-full h-full object-cover" alt="" /> : (selectedStudent.name || 'S').charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">{selectedStudent.name}</h3>
                                <p className="text-slate-500 text-sm">{selectedStudent.class} - Section {selectedStudent.section}</p>
                                <div className="flex gap-2 mt-1">
                                    <Badge color="blue">Roll: {selectedStudent.rollNo}</Badge>
                                    <Badge color={selectedStudent.status === 'Active' ? 'green' : 'red'}>{selectedStudent.status}</Badge>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 mb-4 border-b border-slate-100 overflow-x-auto">
                            <button onClick={() => setActiveTab('info')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'info' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Basic Info</button>
                            <button onClick={() => setActiveTab('results')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'results' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Results</button>
                            <button onClick={() => setActiveTab('attendance')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'attendance' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Attendance</button>
                            <button onClick={() => setActiveTab('report')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'report' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Report Card</button>
                        </div>
                        
                        {activeTab === 'info' && (
                            <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
                                <div className="flex justify-between">
                                    <span className="text-sm text-slate-500">Student ID</span>
                                    <span className="text-sm font-medium text-slate-800">{selectedStudent.id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-slate-500">Guardian</span>
                                    <span className="text-sm font-medium text-slate-800">{selectedStudent.guardian}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-slate-500">Contact</span>
                                    <span className="text-sm font-medium text-slate-800">{selectedStudent.phone}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-slate-500">Blood Group</span>
                                    <span className="text-sm font-medium text-red-600">{selectedStudent.bloodGroup}</span>
                                </div>
                            </div>
                        )}

                        {/* ... (Keep existing tabs for results, attendance, report) ... */}
                        {activeTab === 'results' && (
                            <div className="space-y-3">
                                <div className="p-3 bg-white border border-slate-200 rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm">Mathematics</p>
                                        <p className="text-xs text-slate-500">First Term Exam</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-indigo-600">85</p>
                                        <p className="text-xs text-green-600 font-bold">A+</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                            <Button variant="secondary" onClick={() => setSelectedStudent(null)}>Close</Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Complaint Modal */}
            <Modal isOpen={isComplaintModalOpen} onClose={() => setIsComplaintModalOpen(false)} title="Report Incident / Note">
                {selectedStudent && (
                    <div className="space-y-4">
                        <div className="bg-red-50 p-3 rounded-lg border border-red-100 mb-4">
                            <p className="text-sm text-red-800 font-medium">Reporting for: {selectedStudent.name}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Issue Category</label>
                            <select className="w-full px-3 py-2 border border-slate-300 rounded-lg">
                                <option>Disciplinary Issue</option>
                                <option>Academic Warning</option>
                                <option>Late Arrival</option>
                                <option>Appreciation Note</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <textarea className="w-full px-3 py-2 border border-slate-300 rounded-lg h-24 resize-none" placeholder="Describe the incident..."></textarea>
                        </div>
                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="notify" className="rounded text-indigo-600"/>
                            <label htmlFor="notify" className="text-sm text-slate-600">Notify Guardian immediately via SMS</label>
                        </div>
                        <div className="flex justify-end pt-2 gap-2">
                            <Button variant="secondary" onClick={() => setIsComplaintModalOpen(false)}>Cancel</Button>
                            <Button variant="danger" onClick={handleReport}>Submit Report</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </DashboardLayout>
    );
};

// ... [Keep other components: TeacherLeave, TeacherProfile] ...
export const TeacherLeave = () => {
    const { showToast } = useToast();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const highlightLeaveId = searchParams.get('highlight');
    
    // Active logged-in teacher context (defaults to Abdul Jabbar EMP-001, with test switcher)
    const [selectedTeacherId, setSelectedTeacherId] = useState<string>('EMP-001');
    const activeTeacher = MOCK_STAFF.find(s => s.id === selectedTeacherId) || MOCK_STAFF[0];

    // Navigation section: 'applications' | 'policies'
    const [activeSection, setActiveSection] = useState<'applications' | 'policies'>('applications');
    const [policyFilter, setPolicyFilter] = useState<string>('all');
    const [policySearchQuery, setPolicySearchQuery] = useState<string>('');

    const [isQuickModalOpen, setIsQuickModalOpen] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
    const [selectedAuditLeave, setSelectedAuditLeave] = useState<LeaveApplication | null>(null);

    // Dynamic Leave Policies and Balances defined by School Administration
    const [policies, setPolicies] = useState<LeavePolicy[]>(() => getLeavePolicies());
    const [teacherBalances, setTeacherBalances] = useState<DynamicTeacherLeaveBalance[]>(() => 
        getTeacherDynamicLeaveBalances(selectedTeacherId)
    );

    // Form state
    const [formData, setFormData] = useState({
        type: 'Casual Leave',
        startDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        reason: '',
        backupTeacher: 'Nasreen Akter (Senior Science Faculty)',
        emergencyContact: '01700-000001'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Synchronize leaves and dynamic policies
    const syncAllData = () => {
        const teacherLeaves = getTeacherLeaves(selectedTeacherId);
        setLeaves([...teacherLeaves]);
        const currentPolicies = getLeavePolicies();
        setPolicies(currentPolicies);
        setTeacherBalances(getTeacherDynamicLeaveBalances(selectedTeacherId));
    };

    useEffect(() => {
        syncAllData();
        const unsubLeaves = subscribeToLeaveUpdates(syncAllData);
        const unsubPolicies = subscribeToPolicyUpdates(syncAllData);
        return () => {
            unsubLeaves();
            unsubPolicies();
        };
    }, [selectedTeacherId]);

    // Active policy object based on selected formData.type
    const activePolicy = useMemo(() => {
        const query = formData.type.toLowerCase();
        return policies.find(p => 
            p.name.toLowerCase() === query || 
            p.code.toLowerCase() === query ||
            query.includes(p.name.toLowerCase())
        ) || policies[0];
    }, [policies, formData.type]);

    const durationDays = calculateDaysCount(formData.startDate, formData.endDate);

    // Notice period advisory calculation
    const noticeAdvisory = useMemo(() => {
        if (!activePolicy || !formData.startDate) return null;
        const start = new Date(formData.startDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (activePolicy.minAdvanceNoticeDays > 0 && diffDays < activePolicy.minAdvanceNoticeDays) {
            return {
                isWarning: true,
                message: `Notice Advisory: Policy specifies ${activePolicy.minAdvanceNoticeDays} day(s) advance notice. You are applying for a date in ${diffDays <= 0 ? 'today / immediate' : `${diffDays} day(s)`}. Please ensure prior administrative coordination.`
            };
        }
        return null;
    }, [activePolicy, formData.startDate]);

    // Consecutive limit advisory calculation
    const consecutiveAdvisory = useMemo(() => {
        if (!activePolicy) return null;
        if (durationDays > activePolicy.maxConsecutiveDays) {
            return {
                isWarning: true,
                message: `Continuous Duration Advisory: Policy limits ${activePolicy.name} to ${activePolicy.maxConsecutiveDays} consecutive days. Your request of ${durationDays} days may require special Headmaster sanction.`
            };
        }
        return null;
    }, [activePolicy, durationDays]);

    // Filter leaves
    const filteredLeaves = leaves.filter(l => {
        if (filterStatus === 'pending') return l.status === 'Pending';
        if (filterStatus === 'approved') return l.status === 'Approved';
        if (filterStatus === 'rejected') return l.status === 'Rejected';
        return true;
    });

    const pendingCount = leaves.filter(l => l.status === 'Pending').length;

    // Filtered policies in handbook
    const filteredPoliciesForHandbook = useMemo(() => {
        return policies.filter(p => {
            if (!p.isActive) return false;
            if (policyFilter !== 'all' && p.category.toLowerCase() !== policyFilter.toLowerCase()) return false;
            if (policySearchQuery.trim()) {
                const q = policySearchQuery.toLowerCase();
                const mName = p.name.toLowerCase().includes(q);
                const mCode = p.code.toLowerCase().includes(q);
                const mDesc = p.description.toLowerCase().includes(q);
                if (!mName && !mCode && !mDesc) return false;
            }
            return true;
        });
    }, [policies, policyFilter, policySearchQuery]);

    // Handle form submit
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.reason.trim()) {
            showToast('Please specify the reason for your leave request.', 'error');
            return;
        }

        if (!formData.startDate || !formData.endDate) {
            showToast('Please select valid start and end dates.', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            const res = submitLeaveApplication({
                applicantName: activeTeacher.name,
                applicantId: activeTeacher.id,
                applicantDesignation: activeTeacher.designation,
                applicantDepartment: 'Academic Department',
                applicantPhone: activeTeacher.phone,
                applicantAvatar: activeTeacher.imageUrl,
                role: 'Teacher',
                type: formData.type,
                startDate: formData.startDate,
                endDate: formData.endDate,
                reason: formData.reason.trim(),
                backupTeacher: formData.backupTeacher,
                emergencyContact: formData.emergencyContact
            });

            if (res.success) {
                showToast(res.message, 'success');
                setShowForm(false);
                setFormData({
                    type: policies.find(p => p.isActive)?.name || 'Casual Leave',
                    startDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                    endDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
                    reason: '',
                    backupTeacher: 'Nasreen Akter (Senior Science Faculty)',
                    emergencyContact: activeTeacher.phone || '01700-000001'
                });
                syncAllData();
            } else {
                showToast(res.message, 'error');
            }
        } catch (err) {
            console.error(err);
            showToast('Failed to submit leave application', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle withdrawal
    const handleWithdraw = (id: string) => {
        if (window.confirm(`Are you sure you want to withdraw leave application ${id}?`)) {
            const res = withdrawLeaveApplication(id);
            if (res.success) {
                showToast(res.message, 'info');
                syncAllData();
            } else {
                showToast(res.message, 'error');
            }
        }
    };

    // Quick Apply from Handbook card
    const handleApplyFromPolicy = (policy: LeavePolicy) => {
        setFormData(prev => ({
            ...prev,
            type: policy.name
        }));
        setActiveSection('applications');
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <DashboardLayout role={UserRole.TEACHER}>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
                            <CalendarRange size={20} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                                <span>Faculty Leave Portal</span>
                                {pendingCount > 0 && (
                                    <span className="text-xs px-2.5 py-0.5 rounded-full font-black bg-amber-100 text-amber-800 border border-amber-300">
                                        {pendingCount} Pending Approval
                                    </span>
                                )}
                            </h1>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Submit institutional leave requests and track School Administration approval decisions and remarks.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right controls: Teacher Switcher (for demonstration), Notification Bell & Apply Button */}
                <div className="flex items-center gap-2.5 flex-wrap">
                    <TeacherNotificationBell teacherId={selectedTeacherId} variant="prominent" />

                    <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs">
                        <span className="text-[11px] font-bold text-slate-500">Teacher Profile:</span>
                        <select
                            value={selectedTeacherId}
                            onChange={(e) => setSelectedTeacherId(e.target.value)}
                            className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                        >
                            {MOCK_STAFF.filter(s => s.role === 'Teacher' || s.designation.includes('Teacher') || s.designation.includes('Faculty')).map(t => (
                                <option key={t.id} value={t.id}>
                                    {t.name} ({t.id})
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={() => setIsQuickModalOpen(true)}
                        className="px-3.5 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-xs bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all cursor-pointer"
                        title="Submit Quick Leave via modal"
                    >
                        <CalendarRange size={15} />
                        <span>Quick Leave Modal</span>
                    </button>

                    <button
                        onClick={() => {
                            setActiveSection('applications');
                            setShowForm(!showForm);
                        }}
                        className={`px-4 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer ${
                            showForm 
                                ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' 
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                    >
                        {showForm ? <X size={15} /> : <Plus size={15} />}
                        <span>{showForm ? 'Cancel Form' : 'Apply for Leave'}</span>
                    </button>
                </div>
            </div>

            {/* Real-time Status Change Alert Banner */}
            <TeacherLeaveStatusBanner teacherId={selectedTeacherId} className="mb-6" />

            {/* Sub-Navigation Tabs: My Applications vs Policies Handbook */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 pt-3 rounded-2xl shadow-xs mb-6">
                <div className="flex items-center gap-2 overflow-x-auto pb-3">
                    <button
                        onClick={() => setActiveSection('applications')}
                        className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                            activeSection === 'applications'
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                    >
                        <CalendarRange size={15} />
                        <span>My Leave Balances & Applications</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            activeSection === 'applications' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                            {leaves.length}
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveSection('policies')}
                        className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                            activeSection === 'policies'
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        }`}
                    >
                        <SlidersHorizontal size={15} />
                        <span>Institutional Leave Policies & Eligibility Rules</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            activeSection === 'policies' ? 'bg-emerald-400 text-slate-950' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                            {policies.filter(p => p.isActive).length} Governed Rules
                        </span>
                    </button>
                </div>

                <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-bold text-slate-400 pb-3">
                    <ShieldCheck size={14} className="text-emerald-600" />
                    <span>Admin Policies Synced in Real-Time</span>
                </div>
            </div>

            {/* ========================================================================= */}
            {/* VIEW 1: MY LEAVE BALANCES & APPLICATIONS */}
            {/* ========================================================================= */}
            {activeSection === 'applications' ? (
                <>
                    {/* Dynamic Leave Balance Quota Cards (Directly reflecting School Admin defined policies) */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 mb-6">
                        {teacherBalances.map(bal => (
                            <div 
                                key={bal.policyId} 
                                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                                        <span className="flex items-center gap-1.5 truncate">
                                            <span 
                                                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs" 
                                                style={{ backgroundColor: bal.color }} 
                                            />
                                            <span className="truncate text-slate-800 font-bold">{bal.policyName}</span>
                                        </span>
                                        <span className="p-1 rounded bg-slate-100 text-slate-700 font-mono text-[10px] font-black">
                                            {bal.policyCode}
                                        </span>
                                    </div>

                                    <div className="text-2xl font-black text-slate-800 mt-2">
                                        {bal.remainingDays}{' '}
                                        <span className="text-xs font-normal text-slate-400">/ {bal.annualEntitlement} days</span>
                                    </div>

                                    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                                        <div 
                                            className="h-1.5 rounded-full transition-all duration-500" 
                                            style={{ 
                                                backgroundColor: bal.color,
                                                width: `${Math.min(100, (bal.usedDays / (bal.annualEntitlement || 1)) * 100)}%` 
                                            }} 
                                        />
                                    </div>
                                </div>

                                <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10.5px] text-slate-500 flex items-center justify-between">
                                    <span>{bal.usedDays} days used</span>
                                    <span className="font-bold text-indigo-600">
                                        {bal.accrualRatePerMonth > 0 ? `${bal.accrualRatePerMonth} d/mo` : bal.accrualMethod}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Collapsible New Leave Application Form */}
                    {showForm && (
                        <div className="mb-6 bg-white border-2 border-indigo-200 rounded-2xl p-5 shadow-sm animate-in slide-in-from-top-3 duration-300">
                            <div className="flex items-center justify-between pb-3 mb-4 border-b border-indigo-100">
                                <div>
                                    <h3 className="font-black text-base text-indigo-950 flex items-center gap-2">
                                        <CalendarRange className="text-indigo-600" size={18} />
                                        <span>Submit New Leave Application</span>
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Submitting for: <strong className="text-slate-800">{activeTeacher.name}</strong> ({activeTeacher.designation})
                                    </p>
                                </div>
                                <span className="text-[11px] font-mono px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full font-bold">
                                    Duration: {durationDays} Day{durationDays > 1 ? 's' : ''}
                                </span>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Leave Category Selector (Dynamically populated from Active Policies) */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            Leave Category <span className="text-rose-500">*</span>
                                        </label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        >
                                            {policies.filter(p => p.isActive).map(p => (
                                                <option key={p.id} value={p.name}>
                                                    {p.name} ({p.code}) — {p.category} [{p.annualDays}d/yr]
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            Start Date <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            End Date <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.endDate}
                                            min={formData.startDate}
                                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Dynamic Policy Eligibility and Notice Callout */}
                                {activePolicy && (
                                    <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/40 space-y-2 text-xs">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activePolicy.color }} />
                                                <span className="font-bold text-indigo-950">
                                                    Institutional Rules for {activePolicy.name} ({activePolicy.code})
                                                </span>
                                            </div>
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                                                Quota: {activePolicy.annualDays} days/yr ({activePolicy.accrualMethod})
                                            </span>
                                        </div>

                                        <p className="text-slate-600 italic text-[11.5px]">
                                            "{activePolicy.description}"
                                        </p>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1 text-[11px] text-slate-700">
                                            <div>
                                                <span className="text-slate-400">Notice Required:</span>{' '}
                                                <strong className="text-slate-800">
                                                    {activePolicy.minAdvanceNoticeDays === 0 ? 'Same-day' : `${activePolicy.minAdvanceNoticeDays} day(s)`}
                                                </strong>
                                            </div>
                                            <div>
                                                <span className="text-slate-400">Max Consecutive:</span>{' '}
                                                <strong className="text-slate-800">
                                                    {activePolicy.maxConsecutiveDays} days
                                                </strong>
                                            </div>
                                            <div>
                                                <span className="text-slate-400">Substitute:</span>{' '}
                                                <strong className={activePolicy.requiresSubstituteTeacher ? 'text-amber-800' : 'text-slate-700'}>
                                                    {activePolicy.requiresSubstituteTeacher ? 'Compulsory' : 'Optional'}
                                                </strong>
                                            </div>
                                            <div>
                                                <span className="text-slate-400">Rollover:</span>{' '}
                                                <strong className="text-slate-800">
                                                    {activePolicy.allowCarryForward ? `Max ${activePolicy.maxCarryForwardDays}d` : 'Forfeited'}
                                                </strong>
                                            </div>
                                        </div>

                                        {/* Soft Advisories */}
                                        {noticeAdvisory && (
                                            <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-1.5 animate-in fade-in">
                                                <AlertCircle size={13} className="text-amber-600 shrink-0" />
                                                <span>{noticeAdvisory.message}</span>
                                            </div>
                                        )}

                                        {consecutiveAdvisory && (
                                            <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-1.5 animate-in fade-in">
                                                <AlertCircle size={13} className="text-amber-600 shrink-0" />
                                                <span>{consecutiveAdvisory.message}</span>
                                            </div>
                                        )}

                                        {activePolicy.requiresDocumentProof && activePolicy.documentProofNotice && (
                                            <div className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-[11px] flex items-center gap-1.5">
                                                <FileText size={13} className="text-blue-600 shrink-0" />
                                                <span><strong>Document Proof:</strong> {activePolicy.documentProofNotice}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            Nominated Substitute / Backup Teacher
                                            {activePolicy?.requiresSubstituteTeacher && <span className="text-rose-500"> *</span>}
                                        </label>
                                        <select
                                            value={formData.backupTeacher}
                                            onChange={(e) => setFormData({ ...formData, backupTeacher: e.target.value })}
                                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        >
                                            {MOCK_STAFF.filter(s => s.id !== activeTeacher.id).map(s => (
                                                <option key={s.id} value={`${s.name} (${s.designation})`}>
                                                    {s.name} — {s.designation}
                                                </option>
                                            ))}
                                            <option value="Self-arranged with department head">Self-arranged with department head</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1">
                                            Emergency Contact Phone During Leave
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.emergencyContact}
                                            onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                                            placeholder="e.g. 01711-223344"
                                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Reason & Justification for Leave <span className="text-rose-500">*</span>
                                    </label>
                                    <textarea
                                        value={formData.reason}
                                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                        placeholder="Explain reason for absence, syllabus coverage plan, or medical details..."
                                        rows={3}
                                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
                                        required
                                    />
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                                        <Info size={13} className="text-indigo-600" />
                                        <span>Will be routed directly to the School Admin approval queue.</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowForm(false)}
                                            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="px-5 py-2 text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                                        >
                                            <Send size={14} />
                                            <span>{isSubmitting ? 'Submitting...' : 'Submit Application'}</span>
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Leave Applications History & Status Tracker */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                        {/* Filter Tabs */}
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setFilterStatus('all')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        filterStatus === 'all'
                                            ? 'bg-slate-900 text-white'
                                            : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    All ({leaves.length})
                                </button>
                                <button
                                    onClick={() => setFilterStatus('pending')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                                        filterStatus === 'pending'
                                            ? 'bg-amber-500 text-white'
                                            : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    <Clock size={12} />
                                    <span>Pending ({leaves.filter(l => l.status === 'Pending').length})</span>
                                </button>
                                <button
                                    onClick={() => setFilterStatus('approved')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                                        filterStatus === 'approved'
                                            ? 'bg-emerald-600 text-white'
                                            : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    <CheckCircle2 size={12} />
                                    <span>Approved ({leaves.filter(l => l.status === 'Approved').length})</span>
                                </button>
                                <button
                                    onClick={() => setFilterStatus('rejected')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                                        filterStatus === 'rejected'
                                            ? 'bg-rose-600 text-white'
                                            : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    <XCircle size={12} />
                                    <span>Declined ({leaves.filter(l => l.status === 'Rejected').length})</span>
                                </button>
                            </div>

                            <div className="text-xs text-slate-500">
                                Applications for: <span className="font-bold text-slate-800">{activeTeacher.name}</span>
                            </div>
                        </div>

                        {/* Applications Table / Cards */}
                        {filteredLeaves.length === 0 ? (
                            <div className="py-12 text-center text-slate-400">
                                <CalendarRange size={32} className="mx-auto text-slate-300 mb-2" />
                                <p className="font-bold text-slate-600 text-sm">No leave records found in this category.</p>
                                <p className="text-xs text-slate-400 mt-0.5">Click "Apply for Leave" above to submit a new petition.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {filteredLeaves.map((leave) => {
                                    const isPending = leave.status === 'Pending';
                                    const isApproved = leave.status === 'Approved';
                                    const isRejected = leave.status === 'Rejected';
                                    const isHighlighted = highlightLeaveId === leave.id;

                                    return (
                                        <div 
                                            key={leave.id} 
                                            id={`leave-row-${leave.id}`}
                                            className={`p-4 transition-all duration-300 ${
                                                isHighlighted 
                                                    ? 'bg-indigo-50/70 ring-2 ring-indigo-500 shadow-md rounded-xl' 
                                                    : 'hover:bg-slate-50/50'
                                            }`}
                                        >
                                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                                                {/* Left: Summary */}
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                                        {isHighlighted && (
                                                            <span className="px-2 py-0.5 rounded-full text-[9.5px] font-black bg-indigo-600 text-white animate-pulse">
                                                                ★ Focus from Alert
                                                            </span>
                                                        )}
                                                        <span className="font-mono font-black text-indigo-700 text-xs">
                                                            {leave.id}
                                                        </span>
                                                        <span className={`px-2 py-0.5 rounded text-[10.5px] font-bold ${
                                                            leave.type.toLowerCase().includes('sick') ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                                                            leave.type.toLowerCase().includes('casual') ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                                            leave.type.toLowerCase().includes('duty') ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                                            'bg-purple-50 text-purple-700 border border-purple-200'
                                                        }`}>
                                                            {leave.type}
                                                        </span>
                                                        <span className="text-xs font-bold text-slate-700 flex items-center gap-1 font-mono">
                                                            <Calendar size={12} className="text-slate-400" />
                                                            {leave.startDate} to {leave.endDate}
                                                        </span>
                                                        <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.2 rounded-full">
                                                            {leave.daysCount || 1} day{(leave.daysCount || 1) > 1 ? 's' : ''}
                                                        </span>
                                                    </div>

                                                    <p className="text-xs text-slate-700 font-medium mt-1">
                                                        <span className="text-slate-400 font-normal">Reason: </span>
                                                        {leave.reason}
                                                    </p>

                                                    <div className="flex items-center gap-4 text-[11px] text-slate-500 mt-2 flex-wrap">
                                                        {leave.backupTeacher && (
                                                            <span className="flex items-center gap-1">
                                                                <UserCheck size={11} className="text-emerald-600" />
                                                                <span>Coverage: <strong>{leave.backupTeacher}</strong></span>
                                                            </span>
                                                        )}
                                                        {leave.appliedOn && (
                                                            <span className="text-slate-400 font-mono text-[10.5px]">
                                                                Submitted: {new Date(leave.appliedOn).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Center/Right: Status Badge & Actions */}
                                                <div className="flex items-center gap-3 shrink-0">
                                                    {isPending && (
                                                        <div className="text-right">
                                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                                                                <Clock size={12} />
                                                                <span>Pending Admin Sanction</span>
                                                            </span>
                                                            <div className="mt-1.5 flex justify-end">
                                                                <button
                                                                    onClick={() => handleWithdraw(leave.id)}
                                                                    className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline"
                                                                >
                                                                    Withdraw Application
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {isApproved && (
                                                        <div className="text-right">
                                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                                                                <CheckCircle2 size={13} />
                                                                <span>Sanctioned / Approved</span>
                                                            </span>
                                                            {leave.reviewedAt && (
                                                                <div className="text-[10px] text-slate-400 mt-1 font-mono">
                                                                    {new Date(leave.reviewedAt).toLocaleDateString()}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {isRejected && (
                                                        <div className="text-right">
                                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-300">
                                                                <XCircle size={13} />
                                                                <span>Application Declined</span>
                                                            </span>
                                                            {leave.reviewedAt && (
                                                                <div className="text-[10px] text-slate-400 mt-1 font-mono">
                                                                    {new Date(leave.reviewedAt).toLocaleDateString()}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    <button
                                                        onClick={() => setSelectedAuditLeave(leave)}
                                                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                                        title="View Audit Trail"
                                                    >
                                                        <ChevronRight size={16} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Admin Custom Comment / Remarks Callout */}
                                            {leave.adminComment && (
                                                <div className={`mt-3 p-3 rounded-xl border flex items-start gap-2.5 animate-in fade-in duration-200 ${
                                                    isApproved 
                                                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
                                                        : isRejected 
                                                        ? 'bg-rose-50/70 border-rose-200 text-rose-950' 
                                                        : 'bg-slate-50 border-slate-200 text-slate-800'
                                                }`}>
                                                    <div className="mt-0.5 shrink-0">
                                                        {isApproved ? (
                                                            <ShieldCheck size={16} className="text-emerald-600" />
                                                        ) : isRejected ? (
                                                            <AlertCircle size={16} className="text-rose-600" />
                                                        ) : (
                                                            <MessageSquare size={16} className="text-indigo-600" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 text-xs">
                                                        <div className="flex items-center justify-between flex-wrap gap-1 mb-0.5">
                                                            <span className={`font-black uppercase text-[10px] tracking-wider ${
                                                                isApproved ? 'text-emerald-800' : 'text-rose-800'
                                                            }`}>
                                                                {isApproved ? 'School Admin Sanction Remark' : 'Administrative Decline Explanation'}
                                                            </span>
                                                            {leave.reviewedBy && (
                                                                <span className="text-[10px] font-bold text-slate-500">
                                                                    Officer: {leave.reviewedBy}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="font-medium italic leading-relaxed">
                                                            "{leave.adminComment}"
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </>
            ) : (
                /* ========================================================================= */
                /* VIEW 2: INSTITUTIONAL LEAVE POLICIES & ELIGIBILITY RULES HANDBOOK */
                /* ========================================================================= */
                <div className="space-y-6">
                    {/* Top Guide Overview Banner */}
                    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <span className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5 mb-1">
                                    <BookOpenCheck size={15} />
                                    <span>Faculty Service Regulations & Leave Handbook</span>
                                </span>
                                <h2 className="text-xl font-black text-white tracking-tight">
                                    Amar Smart School Institutional Leave Policies
                                </h2>
                                <p className="text-xs text-indigo-200 mt-1 max-w-2xl leading-relaxed">
                                    Official leave entitlements, monthly accrual rates, and eligibility rules established by School Administration. Review quota allocations, notice requirements, and mandatory documentation before submitting requests.
                                </p>
                            </div>

                            <button
                                onClick={() => {
                                    setActiveSection('applications');
                                    setShowForm(true);
                                }}
                                className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-black rounded-xl flex items-center gap-1.5 transition-all shadow-sm shrink-0 self-start md:self-auto cursor-pointer"
                            >
                                <Plus size={15} />
                                <span>Apply for Leave</span>
                            </button>
                        </div>
                    </div>

                    {/* Filter & Search Bar */}
                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                            {[
                                { id: 'all', label: 'All Policy Types' },
                                { id: 'Paid', label: 'Paid Leave' },
                                { id: 'Half-Pay', label: 'Half-Pay' },
                                { id: 'Special', label: 'Special / Statutory' },
                                { id: 'Unpaid', label: 'Unpaid' }
                            ].map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setPolicyFilter(cat.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                        policyFilter === cat.id
                                            ? 'bg-indigo-600 text-white shadow-xs'
                                            : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>

                        <div className="relative w-full sm:w-64">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search policy guidelines, rules..."
                                value={policySearchQuery}
                                onChange={(e) => setPolicySearchQuery(e.target.value)}
                                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            {policySearchQuery && (
                                <button
                                    onClick={() => setPolicySearchQuery('')}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    <X size={12} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Grid of Policy Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {filteredPoliciesForHandbook.map(policy => (
                            <div 
                                key={policy.id}
                                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                            >
                                <div>
                                    {/* Header */}
                                    <div className="p-4 pb-3 border-b border-slate-100 flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <div 
                                                className="w-3.5 h-3.5 rounded-md shrink-0 shadow-xs" 
                                                style={{ backgroundColor: policy.color }} 
                                            />
                                            <span className="font-mono font-black text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-800">
                                                {policy.code}
                                            </span>
                                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                                policy.category === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                                policy.category === 'Half-Pay' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                                policy.category === 'Special' ? 'bg-pink-50 text-pink-700 border border-pink-200' :
                                                'bg-slate-100 text-slate-700 border border-slate-200'
                                            }`}>
                                                {policy.category}
                                            </span>
                                        </div>

                                        <span className="text-xs font-black text-indigo-700">
                                            {policy.annualDays} Days / Year
                                        </span>
                                    </div>

                                    {/* Content */}
                                    <div className="p-4 space-y-3.5">
                                        <div>
                                            <h3 className="text-base font-black text-slate-900">
                                                {policy.name}
                                            </h3>
                                            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                                                {policy.description}
                                            </p>
                                        </div>

                                        {/* Accrual Method & Rollover Box */}
                                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5">
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-500">Accrual Model:</span>
                                                <span className="font-bold text-slate-800">{policy.accrualMethod}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-500">Accrual Frequency:</span>
                                                <span className="font-mono font-bold text-indigo-600">
                                                    {policy.accrualRatePerMonth > 0 ? `${policy.accrualRatePerMonth} days / month` : 'Annual Credit'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-500">Carry-Forward (Rollover):</span>
                                                <span className="font-bold text-slate-800">
                                                    {policy.allowCarryForward ? `Permitted (Max ${policy.maxCarryForwardDays} days)` : 'Forfeited at session end'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Eligibility & Rules Box */}
                                        <div className="p-3 bg-indigo-50/40 rounded-xl border border-indigo-100/70 text-xs space-y-1.5">
                                            <div className="text-[10px] font-black uppercase tracking-wider text-indigo-900 mb-1 flex items-center gap-1">
                                                <ShieldCheck size={12} className="text-indigo-600" />
                                                <span>Teacher Eligibility Rules</span>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-600">Tenure Requirement:</span>
                                                <span className="font-bold text-slate-800">
                                                    {policy.minServiceMonths === 0 ? 'Eligible immediately' : `Minimum ${policy.minServiceMonths} months service`}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-600">Advance Notice:</span>
                                                <span className="font-bold text-slate-800">
                                                    {policy.minAdvanceNoticeDays === 0 ? 'Immediate notification' : `At least ${policy.minAdvanceNoticeDays} days prior`}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-600">Max Consecutive:</span>
                                                <span className="font-bold text-slate-800">
                                                    Up to {policy.maxConsecutiveDays} continuous days
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <span className="text-slate-600">Substitute Teacher:</span>
                                                <span className={`font-bold ${policy.requiresSubstituteTeacher ? 'text-amber-800' : 'text-slate-600'}`}>
                                                    {policy.requiresSubstituteTeacher ? 'Compulsory' : 'Optional'}
                                                </span>
                                            </div>

                                            {policy.requiresDocumentProof && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-slate-600">Medical/Official Slip:</span>
                                                    <span className="font-bold text-rose-700">Required</span>
                                                </div>
                                            )}
                                        </div>

                                        {policy.documentProofNotice && (
                                            <div className="p-2 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-[11px] flex items-center gap-1.5">
                                                <Info size={12} className="text-amber-600 shrink-0" />
                                                <span>{policy.documentProofNotice}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Apply button */}
                                <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                                    <div className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                                        <CheckCircle2 size={13} />
                                        <span>Governed Policy</span>
                                    </div>

                                    <button
                                        onClick={() => handleApplyFromPolicy(policy)}
                                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-lg flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                                    >
                                        <span>Apply</span>
                                        <ArrowRight size={13} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modal: Full Audit History of Application */}
            {selectedAuditLeave && (
                <Modal
                    isOpen={true}
                    onClose={() => setSelectedAuditLeave(null)}
                    title={`Leave Application History (${selectedAuditLeave.id})`}
                >
                    <div className="space-y-4 text-xs">
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                            <div>
                                <span className="font-bold text-slate-700">{selectedAuditLeave.type}</span>
                                <span className="text-slate-400 mx-1.5">•</span>
                                <span className="font-mono text-slate-600">{selectedAuditLeave.startDate} to {selectedAuditLeave.endDate}</span>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full font-black text-[10px] ${
                                selectedAuditLeave.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                                selectedAuditLeave.status === 'Rejected' ? 'bg-rose-100 text-rose-800' :
                                'bg-amber-100 text-amber-800'
                            }`}>
                                {selectedAuditLeave.status}
                            </span>
                        </div>

                        <div>
                            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-2">
                                Audit Log & Status Transitions
                            </span>
                            <div className="space-y-2 border-l-2 border-indigo-200 pl-3 ml-2">
                                {selectedAuditLeave.statusTimeline && selectedAuditLeave.statusTimeline.map((item, i) => (
                                    <div key={i} className="relative">
                                        <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 border-2 border-white" />
                                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                                            <span>[{item.status}]</span>
                                            <span className="text-slate-500 font-normal">{item.actor}</span>
                                        </div>
                                        <div className="text-[10.5px] text-slate-600 mt-0.5">
                                            {item.comment}
                                        </div>
                                        <div className="text-[9.5px] text-slate-400 font-mono mt-0.5">
                                            {new Date(item.timestamp).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end pt-3 border-t border-slate-100">
                            <Button variant="secondary" onClick={() => setSelectedAuditLeave(null)}>
                                Close
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Quick Leave Request Modal */}
            <QuickLeaveRequestModal
                isOpen={isQuickModalOpen}
                onClose={() => setIsQuickModalOpen(false)}
                teacherId={selectedTeacherId}
                teacherName={activeTeacher.name}
                onSuccess={() => syncAllData()}
            />
        </DashboardLayout>
    );
};

export const TeacherProfile = () => {
    const [teacher, setTeacher] = useState<any>(MOCK_STAFF.find(s => s.id === 'EMP-001'));
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [newImage, setNewImage] = useState<string | undefined>(teacher?.imageUrl);

    if (!teacher) return <div>Teacher not found</div>;

    const handleSavePhoto = () => {
        setTeacher({ ...teacher, imageUrl: newImage });
        setIsEditModalOpen(false);
    };

    const handleImageChange = (file: File) => {
        const url = URL.createObjectURL(file);
        setNewImage(url);
    };

    return (
        <DashboardLayout role={UserRole.TEACHER}>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">My Profile</h2>
            </div>

            <Card className="max-w-4xl">
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex flex-col items-center">
                        <div className="w-32 h-32 bg-slate-200 rounded-full mb-4 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
                            {teacher.imageUrl ? <img src={teacher.imageUrl} className="w-full h-full object-cover" /> : <Users size={64} className="text-slate-400" />}
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">{teacher.name}</h3>
                        <p className="text-indigo-600 font-medium">{teacher.designation}</p>
                        <Badge color="blue" className="mt-2">{teacher.id}</Badge>
                    </div>

                    <div className="flex-1 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Contact Phone</label>
                                <div className="flex items-center gap-2 mt-1 text-slate-800">
                                    <Phone size={16} className="text-slate-400" /> {teacher.phone}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Address</label>
                                <div className="flex items-center gap-2 mt-1 text-slate-800">
                                    <MapPin size={16} className="text-slate-400" /> {teacher.address}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Joining Date</label>
                                <div className="flex items-center gap-2 mt-1 text-slate-800">
                                    <Calendar size={16} className="text-slate-400" /> {teacher.joinDate}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Blood Group</label>
                                <div className="mt-1 text-slate-800 font-bold">{teacher.bloodGroup}</div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100">
                            <h4 className="font-bold text-slate-800 mb-3">Settings</h4>
                            <div className="flex gap-4">
                                <Button variant="secondary" className="text-xs">Change Password</Button>
                                <Button variant="secondary" className="text-xs">Edit Contact Info</Button>
                                <Button variant="secondary" className="text-xs" onClick={() => { setIsEditModalOpen(true); setNewImage(teacher.imageUrl); }}>Update Photo</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Update Profile Photo">
                <div className="flex justify-center">
                    <ImageUpload 
                        label="New Profile Photo" 
                        defaultImage={newImage} 
                        onChange={handleImageChange}
                    />
                </div>
                <div className="flex justify-end pt-4">
                    <Button onClick={handleSavePhoto}>Save Change</Button>
                </div>
            </Modal>
        </DashboardLayout>
    );
};

export const TeacherPerformance = () => {
    return <TeacherDashboard initialTab="performance" />;
};

