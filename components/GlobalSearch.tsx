import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Users, GraduationCap, BookOpen, Layers, FileText, 
  Calendar, CheckSquare, Clock, ArrowRight, X, Phone, Mail, 
  ShieldCheck, Calculator, Sparkles, UserPlus, Table, Grid, 
  Key, Smartphone, Award, FileBadge, Settings, Building2, 
  Briefcase, Eye, ChevronRight, Hash, UserCheck, ExternalLink,
  Command, CornerDownLeft, AlertCircle, Copy, Check
} from 'lucide-react';
import { Badge, Button, useToast } from './UIComponents';
import { MOCK_STUDENTS, MOCK_STAFF, MOCK_CLASSES, MOCK_SUBJECTS, MOCK_EXAMS } from '../constants';
import { Student, Staff, UserRole } from '../types';

export interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'student' | 'staff' | 'module' | 'class' | 'exam';
  path?: string;
  icon: any;
  badge?: string;
  badgeColor?: 'blue' | 'green' | 'yellow' | 'red' | 'gray';
  metadata?: {
    rollNo?: string;
    class?: string;
    section?: string;
    guardian?: string;
    phone?: string;
    bloodGroup?: string;
    status?: string;
    feesDue?: number;
    designation?: string;
    department?: string;
    role?: string;
    imageUrl?: string;
    studentsCount?: number;
    teacherName?: string;
  };
}

// Comprehensive searchable modules list with tags & target routes
const PLATFORM_MODULES: SearchResultItem[] = [
  // School Admin - Student Modules
  { id: 'mod-academic-calendar', title: 'Academic Calendar & Holidays', subtitle: 'View annual holidays, scheduled exams, and school events with interactive calendar view', category: 'module', path: '/school/academic-calendar', icon: Calendar, badge: 'Academic' },
  { id: 'mod-students-list', title: 'Student List & Directory', subtitle: 'View, filter, and manage all enrolled students', category: 'module', path: '/school/students/list', icon: Users, badge: 'Academic' },
  { id: 'mod-admission', title: 'Student Admission', subtitle: 'Register a new student with full bio-data & guardian info', category: 'module', path: '/school/students/admission', icon: UserPlus, badge: 'Admission' },
  { id: 'mod-admission-requests', title: 'Online Admission Requests', subtitle: 'Review and approve pending student applications', category: 'module', path: '/school/students/admission-request', icon: Clock, badge: 'Admission' },
  { id: 'mod-data-update', title: 'Student Bulk Data Update', subtitle: 'Update student profiles, roll numbers and records in bulk', category: 'module', path: '/school/students/data-update', icon: Layers, badge: 'Records' },
  { id: 'mod-credentials-status', title: 'Student Portal Credentials & Passwords', subtitle: 'Manage student login accounts and active credentials', category: 'module', path: '/school/students/credentials-status', icon: Key, badge: 'Security' },
  { id: 'mod-sms-credentials', title: 'Send SMS User Credentials', subtitle: 'Broadcast username & password credentials to parents via SMS', category: 'module', path: '/school/students/sms-credentials', icon: Smartphone, badge: 'SMS Gateway' },
  { id: 'mod-teacher-assign', title: 'Assign Teacher to Students', subtitle: 'Map guide teachers and mentors to student batches', category: 'module', path: '/school/students/teacher-assign', icon: UserCheck, badge: 'Academic' },

  // School Admin - Accounts & Fees
  { id: 'mod-accounts-fees', title: 'Fees & Accounts Management', subtitle: 'Track fee invoices, collect dues, expenses, and salary logs', category: 'module', path: '/school/accounts', icon: Calculator, badge: 'Finance' },
  
  // School Admin - Exams & Results
  { id: 'mod-exam-results', title: 'Exam Result Sheet & GPA Control', subtitle: 'Publish exam results, tabulate marksheets, and grading', category: 'module', path: '/school/results', icon: FileText, badge: 'Exams' },

  // School Admin - Seat Plans
  { id: 'mod-seat-plan-1', title: 'Exam Seat Plan Generator (Layout 1)', subtitle: 'Generate classroom exam seating allocations format 1', category: 'module', path: '/school/seat-plan/1', icon: Grid, badge: 'Exams' },
  { id: 'mod-seat-plan-2', title: 'Exam Seat Plan Generator (Layout 2)', subtitle: 'Generate roll-wise examination seating arrangements', category: 'module', path: '/school/seat-plan/2', icon: Table, badge: 'Exams' },
  { id: 'mod-seat-plan-small', title: 'Desk Stickers & Small Seat Plan', subtitle: 'Print compact seat stickers for student desks', category: 'module', path: '/school/seat-plan/small', icon: Layers, badge: 'Print' },

  // Teacher Portal Modules
  { id: 'mod-teacher-dashboard', title: 'Teacher Dashboard', subtitle: 'Dedicated faculty hub for classes, attendance & materials', category: 'module', path: '/teacher/dashboard', icon: GraduationCap, badge: 'Teacher Portal' },
  { id: 'mod-teacher-routine', title: 'Teacher Class Routine & Timetable', subtitle: 'Weekly period schedule and room assignments', category: 'module', path: '/teacher/routine', icon: Calendar, badge: 'Teacher Portal' },
  { id: 'mod-teacher-attendance', title: 'Teacher Attendance Register', subtitle: 'Log daily class attendance with instant guardian SMS', category: 'module', path: '/teacher/attendance', icon: CheckSquare, badge: 'Teacher Portal' },
  { id: 'mod-teacher-homework', title: 'Homework & Assignment Manager', subtitle: 'Assign homework tasks and grade submissions', category: 'module', path: '/teacher/homework', icon: BookOpen, badge: 'Teacher Portal' },
  { id: 'mod-teacher-materials', title: 'Study Materials & Lecture Notes', subtitle: 'Upload handouts, PDFs, slides, and syllabus guides', category: 'module', path: '/teacher/materials', icon: FileText, badge: 'Teacher Portal' },
  { id: 'mod-teacher-lesson-plan', title: 'AI Lesson Planner & Curriculum', subtitle: 'Generate structured lesson plans using AI tools', category: 'module', path: '/teacher/lesson-plan', icon: Sparkles, badge: 'AI Assistant' },
  { id: 'mod-teacher-live-class', title: 'Live Online Classroom', subtitle: 'Host video lectures, screen share, and interactive chats', category: 'module', path: '/teacher/live-class', icon: GraduationCap, badge: 'E-Learning' },
  { id: 'mod-teacher-marks', title: 'Marks Entry & Evaluation', subtitle: 'Record subject marks for term exams and class tests', category: 'module', path: '/teacher/marks', icon: FileText, badge: 'Teacher Portal' },
  { id: 'mod-teacher-leave', title: 'Teacher Leave Applications', subtitle: 'Submit sick/casual leave requests and track approvals', category: 'module', path: '/teacher/leave', icon: Clock, badge: 'HR' },
  { id: 'mod-teacher-profile', title: 'Teacher Profile & Settings', subtitle: 'Manage faculty credentials and contact details', category: 'module', path: '/teacher/profile', icon: Settings, badge: 'Profile' },

  // Super Admin Modules
  { id: 'mod-sa-tenants', title: 'Tenant School Management', subtitle: 'Manage affiliated schools, colleges, and madrasas', category: 'module', path: '/super-admin/tenants', icon: Building2, badge: 'Super Admin' },
  { id: 'mod-sa-subscriptions', title: 'Subscription Plans & Billing', subtitle: 'Configure tenant pricing tiers, limits, and billing', category: 'module', path: '/super-admin/subscriptions', icon: Calculator, badge: 'Super Admin' },
  { id: 'mod-sa-domains', title: 'Custom Domain Manager', subtitle: 'Manage custom CNAME and A record domain routing', category: 'module', path: '/super-admin/domains', icon: Building2, badge: 'Super Admin' },
];

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: UserRole;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose, userRole }) => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const showToast = (msg: string, type?: any) => addToast(msg, type);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'students' | 'staff' | 'modules' | 'classes'>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedItemDetail, setSelectedItemDetail] = useState<SearchResultItem | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
      setSelectedItemDetail(null);
    }
  }, [isOpen]);

  // Build searchable items
  const allSearchItems = useMemo<SearchResultItem[]>(() => {
    const items: SearchResultItem[] = [];

    // 1. Students
    MOCK_STUDENTS.forEach(student => {
      items.push({
        id: student.id,
        title: student.name,
        subtitle: `Roll: #${student.rollNo} • ${student.class} (Sec ${student.section}) • Guardian: ${student.guardian}`,
        category: 'student',
        path: '/school/students/list',
        icon: Users,
        badge: student.status,
        badgeColor: student.status === 'Active' ? 'green' : 'red',
        metadata: {
          rollNo: student.rollNo,
          class: student.class,
          section: student.section,
          guardian: student.guardian,
          phone: student.phone,
          bloodGroup: student.bloodGroup,
          status: student.status,
          feesDue: student.feesDue,
          imageUrl: student.imageUrl,
        }
      });
    });

    // 2. Staff / Faculty
    MOCK_STAFF.forEach(staff => {
      items.push({
        id: staff.id,
        title: staff.name,
        subtitle: `${staff.designation} • ${staff.role} • ${staff.address}`,
        category: 'staff',
        path: userRole === UserRole.TEACHER ? '/teacher/profile' : '/school/students/list',
        icon: GraduationCap,
        badge: staff.role,
        badgeColor: staff.role === 'Teacher' ? 'blue' : 'yellow',
        metadata: {
          designation: staff.designation,
          phone: staff.phone,
          bloodGroup: staff.bloodGroup,
          role: staff.role,
          imageUrl: staff.imageUrl,
        }
      });
    });

    // 3. Classes & Sections
    MOCK_CLASSES.forEach(cls => {
      items.push({
        id: cls.id,
        title: `${cls.name} - Section ${cls.section}`,
        subtitle: `Class Teacher: ${cls.classTeacher} • ${cls.studentsCount} Students`,
        category: 'class',
        path: '/school/students/list',
        icon: Layers,
        badge: `${cls.studentsCount} Students`,
        badgeColor: 'blue',
        metadata: {
          class: cls.name,
          section: cls.section,
          teacherName: cls.classTeacher,
          studentsCount: cls.studentsCount,
        }
      });
    });

    // 4. Platform Modules
    PLATFORM_MODULES.forEach(mod => {
      items.push(mod);
    });

    // 5. Exams
    MOCK_EXAMS.forEach(exam => {
      items.push({
        id: exam.id,
        title: exam.name,
        subtitle: `Start Date: ${exam.startDate} • Status: ${exam.status}`,
        category: 'exam',
        path: '/school/results',
        icon: FileText,
        badge: exam.status,
        badgeColor: exam.status === 'Completed' ? 'green' : 'yellow',
      });
    });

    return items;
  }, [userRole]);

  // Filter items based on active tab and query
  const filteredResults = useMemo(() => {
    let list = allSearchItems;

    // Filter by category tab
    if (activeTab === 'students') list = list.filter(i => i.category === 'student');
    else if (activeTab === 'staff') list = list.filter(i => i.category === 'staff');
    else if (activeTab === 'modules') list = list.filter(i => i.category === 'module');
    else if (activeTab === 'classes') list = list.filter(i => i.category === 'class');

    // Filter by search query
    if (!query.trim()) {
      return list.slice(0, 12); // Return top recommendations when query is blank
    }

    const q = query.toLowerCase().trim();
    return list.filter(item => {
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSubtitle = item.subtitle.toLowerCase().includes(q);
      const matchId = item.id.toLowerCase().includes(q);
      const matchBadge = item.badge?.toLowerCase().includes(q);
      const matchRoll = item.metadata?.rollNo?.toLowerCase().includes(q);
      const matchPhone = item.metadata?.phone?.toLowerCase().includes(q);
      const matchGuardian = item.metadata?.guardian?.toLowerCase().includes(q);
      const matchDesignation = item.metadata?.designation?.toLowerCase().includes(q);
      
      return matchTitle || matchSubtitle || matchId || matchBadge || matchRoll || matchPhone || matchGuardian || matchDesignation;
    }).slice(0, 20);
  }, [allSearchItems, activeTab, query]);

  // Auto-select first item when results change
  useEffect(() => {
    setSelectedIndex(0);
    if (filteredResults.length > 0) {
      setSelectedItemDetail(filteredResults[0]);
    } else {
      setSelectedItemDetail(null);
    }
  }, [filteredResults]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => {
        const next = prev < filteredResults.length - 1 ? prev + 1 : 0;
        setSelectedItemDetail(filteredResults[next]);
        return next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => {
        const next = prev > 0 ? prev - 1 : filteredResults.length - 1;
        setSelectedItemDetail(filteredResults[next]);
        return next;
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredResults[selectedIndex]) {
        handleSelectItem(filteredResults[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const handleSelectItem = (item: SearchResultItem) => {
    if (item.path) {
      navigate(item.path);
      onClose();
      showToast(`Navigated to ${item.title}`, 'info');
    } else {
      setSelectedItemDetail(item);
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard?.writeText(id);
    setCopiedId(true);
    showToast(`Copied ID: ${id}`, 'success');
    setTimeout(() => setCopiedId(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      {/* Main Search Palette Container */}
      <div 
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
        onKeyDown={handleKeyDown}
      >
        {/* Search Header Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex items-center gap-3">
          <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
            <Search size={20} />
          </div>
          <input 
            ref={inputRef}
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search students (name, roll, phone), staff, or school modules..." 
            className="flex-1 bg-transparent text-slate-800 placeholder-slate-400 text-base sm:text-lg font-medium focus:outline-none"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X size={18} />
            </button>
          )}
          <div className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-slate-400 bg-white border border-slate-200 px-2 py-1 rounded-md shadow-xs">
            <span>ESC</span>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="px-4 py-2 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto bg-white text-xs">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] mr-1">Filter:</span>
          {[
            { key: 'all', label: 'All Results' },
            { key: 'students', label: `Students (${MOCK_STUDENTS.length})` },
            { key: 'staff', label: `Staff & Teachers (${MOCK_STAFF.length})` },
            { key: 'modules', label: `Modules (${PLATFORM_MODULES.length})` },
            { key: 'classes', label: `Classes (${MOCK_CLASSES.length})` },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3 py-1 rounded-lg font-bold transition-all whitespace-nowrap ${
                activeTab === tab.key 
                  ? 'bg-indigo-600 text-white shadow-xs' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Results & Live Preview Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-100 overflow-hidden flex-1">
          
          {/* Results List (7 cols on desktop) */}
          <div ref={listRef} className="md:col-span-7 overflow-y-auto max-h-[50vh] md:max-h-[55vh] p-2 space-y-1">
            {filteredResults.length > 0 ? (
              filteredResults.map((item, index) => {
                const isSelected = index === selectedIndex;
                const IconComponent = item.icon;

                return (
                  <div
                    key={`${item.category}-${item.id}`}
                    onClick={() => handleSelectItem(item)}
                    onMouseEnter={() => {
                      setSelectedIndex(index);
                      setSelectedItemDetail(item);
                    }}
                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-indigo-50/80 border border-indigo-200 text-indigo-950 shadow-xs' 
                        : 'hover:bg-slate-50 border border-transparent text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Avatar or Category Icon */}
                      {item.metadata?.imageUrl ? (
                        <img 
                          src={item.metadata.imageUrl} 
                          alt={item.title} 
                          className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                        />
                      ) : (
                        <div className={`p-2 rounded-xl shrink-0 ${
                          item.category === 'student' ? 'bg-blue-100 text-blue-700' :
                          item.category === 'staff' ? 'bg-purple-100 text-purple-700' :
                          item.category === 'class' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-indigo-100 text-indigo-700'
                        }`}>
                          <IconComponent size={18} />
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm truncate text-slate-900">{item.title}</h4>
                          {item.badge && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              item.badgeColor === 'green' ? 'bg-emerald-100 text-emerald-700' :
                              item.badgeColor === 'red' ? 'bg-rose-100 text-rose-700' :
                              item.badgeColor === 'yellow' ? 'bg-amber-100 text-amber-700' :
                              item.badgeColor === 'blue' ? 'bg-blue-100 text-blue-700' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{item.subtitle}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 pl-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                        {item.category}
                      </span>
                      <ChevronRight size={16} className={`text-slate-300 ${isSelected ? 'text-indigo-600' : ''}`} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <AlertCircle size={24} />
                </div>
                <h4 className="font-bold text-slate-700 text-sm">No results found</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Try searching for student names, roll numbers ("101"), employee IDs ("EMP-001"), or modules like "Routine" or "Fees".
                </p>
              </div>
            )}
          </div>

          {/* Live Preview / Action Card Panel (5 cols on desktop) */}
          <div className="hidden md:flex md:col-span-5 bg-slate-50/50 p-4 flex-col justify-between overflow-y-auto max-h-[55vh]">
            {selectedItemDetail ? (
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Selected Item</span>
                  <div className="flex items-center gap-3 mt-2">
                    {selectedItemDetail.metadata?.imageUrl ? (
                      <img 
                        src={selectedItemDetail.metadata.imageUrl} 
                        alt={selectedItemDetail.title} 
                        className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-200 shadow-sm"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                        {React.createElement(selectedItemDetail.icon, { size: 24 })}
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-slate-900 text-base leading-snug">{selectedItemDetail.title}</h3>
                      <p className="text-xs text-indigo-600 font-semibold">{selectedItemDetail.category.toUpperCase()}</p>
                      {selectedItemDetail.id && (
                        <button 
                          onClick={() => handleCopyId(selectedItemDetail.id)}
                          className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-700 mt-0.5"
                          title="Copy ID"
                        >
                          <span>{selectedItemDetail.id}</span>
                          {copiedId ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Dynamic Metadata Attributes */}
                {selectedItemDetail.category === 'student' && selectedItemDetail.metadata && (
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-400">Class & Section:</span>
                      <span className="font-bold text-slate-800">{selectedItemDetail.metadata.class} - {selectedItemDetail.metadata.section}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-400">Roll Number:</span>
                      <span className="font-bold text-slate-800">#{selectedItemDetail.metadata.rollNo}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-400">Guardian Name:</span>
                      <span className="font-bold text-slate-800">{selectedItemDetail.metadata.guardian}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-400">Contact Phone:</span>
                      <span className="font-bold text-indigo-600">{selectedItemDetail.metadata.phone}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-400">Blood Group:</span>
                      <span className="font-bold text-rose-600">{selectedItemDetail.metadata.bloodGroup || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Fee Status:</span>
                      <span className={`font-bold ${selectedItemDetail.metadata.feesDue ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {selectedItemDetail.metadata.feesDue ? `৳${selectedItemDetail.metadata.feesDue} Due` : 'Paid in Full'}
                      </span>
                    </div>
                  </div>
                )}

                {selectedItemDetail.category === 'staff' && selectedItemDetail.metadata && (
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-400">Designation:</span>
                      <span className="font-bold text-slate-800">{selectedItemDetail.metadata.designation}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-400">Role:</span>
                      <span className="font-bold text-slate-800">{selectedItemDetail.metadata.role}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-400">Phone:</span>
                      <span className="font-bold text-indigo-600">{selectedItemDetail.metadata.phone}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Blood Group:</span>
                      <span className="font-bold text-rose-600">{selectedItemDetail.metadata.bloodGroup || 'N/A'}</span>
                    </div>
                  </div>
                )}

                {selectedItemDetail.category === 'class' && selectedItemDetail.metadata && (
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-400">Class:</span>
                      <span className="font-bold text-slate-800">{selectedItemDetail.metadata.class}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-400">Section:</span>
                      <span className="font-bold text-slate-800">{selectedItemDetail.metadata.section}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-400">Class Teacher:</span>
                      <span className="font-bold text-indigo-600">{selectedItemDetail.metadata.teacherName}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Total Enrolled:</span>
                      <span className="font-bold text-emerald-600">{selectedItemDetail.metadata.studentsCount} Students</span>
                    </div>
                  </div>
                )}

                {selectedItemDetail.category === 'module' && (
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600">
                    <p className="font-medium">{selectedItemDetail.subtitle}</p>
                    <p className="text-[11px] text-slate-400 mt-2">Press <strong className="text-slate-700">Enter ↵</strong> to immediately open this module page.</p>
                  </div>
                )}

                {/* Primary Action Button */}
                <Button 
                  onClick={() => handleSelectItem(selectedItemDetail)}
                  className="w-full flex items-center justify-center gap-2 text-xs font-bold py-2.5"
                  icon={CornerDownLeft}
                >
                  Open {selectedItemDetail.category === 'module' ? 'Module' : 'Details'}
                </Button>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <Command size={32} className="mb-2 opacity-50" />
                <p className="text-xs font-medium">Select any search result to preview information</p>
              </div>
            )}

            {/* Bottom Keyboard Hint */}
            <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="bg-white border border-slate-200 px-1 py-0.5 rounded font-mono text-[10px]">↑↓</span>
                <span>Navigate</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="bg-white border border-slate-200 px-1 py-0.5 rounded font-mono text-[10px]">↵</span>
                <span>Select</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="bg-white border border-slate-200 px-1 py-0.5 rounded font-mono text-[10px]">ESC</span>
                <span>Close</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
