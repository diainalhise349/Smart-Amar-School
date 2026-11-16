import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Users, GraduationCap, BookOpen, Layers, FileText,
  Calendar, CheckSquare, Clock, ArrowRight, X, Phone,
  ShieldCheck, Calculator, Sparkles, UserPlus, Table, Grid,
  Key, Smartphone, Award, Settings, Building2,
  ChevronRight, Hash, UserCheck, ExternalLink,
  Command, AlertCircle, Copy, Check, TrendingUp,
  Activity, SlidersHorizontal, Library, ArrowUpRight
} from 'lucide-react';
import { MOCK_STUDENTS, MOCK_STAFF, MOCK_CLASSES, MOCK_EXAMS } from '../constants';
import { UserRole } from '../types';
import { useToast } from './UIComponents';

export interface HeaderSearchItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'student' | 'staff' | 'module' | 'class';
  path: string;
  icon: any;
  badge?: string;
  badgeColor?: 'blue' | 'emerald' | 'amber' | 'rose' | 'slate' | 'indigo' | 'purple';
  extraMeta?: {
    rollNo?: string;
    class?: string;
    section?: string;
    guardian?: string;
    phone?: string;
    bloodGroup?: string;
    status?: string;
    designation?: string;
    department?: string;
    role?: string;
    imageUrl?: string;
    studentsCount?: number;
  };
}

// Comprehensive school admin & system modules registry
const COMPREHENSIVE_MODULES: HeaderSearchItem[] = [
  // Academic & Attendance
  {
    id: 'mod-academic-calendar',
    title: 'Academic Calendar & Holidays',
    subtitle: 'Annual institutional holidays, exam terms, and scheduled events',
    category: 'module',
    path: '/school/academic-calendar',
    icon: Calendar,
    badge: 'Academic',
    badgeColor: 'indigo'
  },
  {
    id: 'mod-student-progress-charts',
    title: 'Student Progress & Attendance Analytics',
    subtitle: 'Recharts multi-term academic trajectory and 75% attendance rule compliance',
    category: 'module',
    path: '/school/attendance/individual',
    icon: TrendingUp,
    badge: 'Analytics',
    badgeColor: 'emerald'
  },
  {
    id: 'mod-students-list',
    title: 'Student Directory & Records',
    subtitle: 'Complete enrolled student roster, roll numbers, sections, and guardians',
    category: 'module',
    path: '/school/students/list',
    icon: Users,
    badge: 'Directory',
    badgeColor: 'blue'
  },
  {
    id: 'mod-student-admission',
    title: 'New Student Admission Form',
    subtitle: 'Register new student bio-data, guardian details, and upload documents',
    category: 'module',
    path: '/school/students/admission',
    icon: UserPlus,
    badge: 'Admission',
    badgeColor: 'purple'
  },
  {
    id: 'mod-admission-requests',
    title: 'Online Admission Requests & Workflow',
    subtitle: 'Review, sanction, and approve incoming parent application forms',
    category: 'module',
    path: '/school/students/admission-request',
    icon: Clock,
    badge: 'Admission',
    badgeColor: 'purple'
  },
  {
    id: 'mod-student-data-update',
    title: 'Bulk Student Profile Update',
    subtitle: 'Batch update student contact info, roll numbers, and blood groups',
    category: 'module',
    path: '/school/students/data-update',
    icon: Layers,
    badge: 'Records',
    badgeColor: 'slate'
  },
  {
    id: 'mod-student-credentials',
    title: 'Student Portal Credentials & Security',
    subtitle: 'Generate and reset student login passwords and manage access',
    category: 'module',
    path: '/school/students/credentials-status',
    icon: Key,
    badge: 'Security',
    badgeColor: 'amber'
  },
  {
    id: 'mod-sms-credentials',
    title: 'Send Credentials via SMS Broadcast',
    subtitle: 'Dispatch login credentials and emergency notices to parent phones',
    category: 'module',
    path: '/school/students/sms-credentials',
    icon: Smartphone,
    badge: 'SMS Gateway',
    badgeColor: 'indigo'
  },
  {
    id: 'mod-teacher-assign',
    title: 'Assign Guide Teachers to Batches',
    subtitle: 'Pair faculty mentors and guide teachers with student cohorts',
    category: 'module',
    path: '/school/students/teacher-assign',
    icon: UserCheck,
    badge: 'Faculty',
    badgeColor: 'blue'
  },

  // HR & Faculty Leave Workflow
  {
    id: 'mod-leave-approval',
    title: 'Teacher Leave Approval Workflow Desk',
    subtitle: 'Sanction, approve, or reject teacher leave applications in real time',
    category: 'module',
    path: '/school/leave-approval',
    icon: CheckSquare,
    badge: 'HR & Leaves',
    badgeColor: 'amber'
  },
  {
    id: 'mod-leave-policies',
    title: 'Institutional Leave Policies & Eligibility Rules',
    subtitle: 'Configure annual leave quotas, accrual models, and teacher regulations',
    category: 'module',
    path: '/school/leave-policies',
    icon: SlidersHorizontal,
    badge: 'Governance',
    badgeColor: 'emerald'
  },

  // Accounts & Finances
  {
    id: 'mod-accounts-fees',
    title: 'Fees & Accounts Management',
    subtitle: 'Invoice generation, student fee collections, expenses, and ledger logs',
    category: 'module',
    path: '/school/accounts',
    icon: Calculator,
    badge: 'Finance',
    badgeColor: 'emerald'
  },

  // Exams & Grading
  {
    id: 'mod-exam-results',
    title: 'Examination Results & GPA Tabulation',
    subtitle: 'Compile grade sheets, GPA points, and print official report cards',
    category: 'module',
    path: '/school/results',
    icon: FileText,
    badge: 'Exams',
    badgeColor: 'indigo'
  },
  {
    id: 'mod-seat-plan-1',
    title: 'Exam Seat Plan Generator (Standard Layout)',
    subtitle: 'Automatic classroom seating allocations for midterms and finals',
    category: 'module',
    path: '/school/seat-plan/1',
    icon: Grid,
    badge: 'Exams',
    badgeColor: 'indigo'
  },
  {
    id: 'mod-seat-plan-2',
    title: 'Exam Seat Plan Generator (Roll-Wise Layout)',
    subtitle: 'Alternating roll-wise exam seating plan to minimize interference',
    category: 'module',
    path: '/school/seat-plan/2',
    icon: Table,
    badge: 'Exams',
    badgeColor: 'indigo'
  },
  {
    id: 'mod-seat-plan-small',
    title: 'Desk Stickers & Compact Seat Labels',
    subtitle: 'Printable individual student desk seating stickers with barcodes',
    category: 'module',
    path: '/school/seat-plan/small',
    icon: Layers,
    badge: 'Printables',
    badgeColor: 'slate'
  },
  {
    id: 'mod-library-management',
    title: 'Library & Book Lending Management',
    subtitle: 'Track textbook inventory, lending logs, overdue fines, and returns',
    category: 'module',
    path: '/school/library',
    icon: Library,
    badge: 'Library',
    badgeColor: 'amber'
  }
];

interface HeaderGlobalSearchBarProps {
  onOpenFullModal?: () => void;
  userRole?: UserRole;
  className?: string;
}

export const HeaderGlobalSearchBar: React.FC<HeaderGlobalSearchBarProps> = ({
  onOpenFullModal,
  userRole = UserRole.SCHOOL_ADMIN,
  className = ''
}) => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const showToast = (msg: string, type?: any) => addToast(msg, type);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | 'students' | 'staff' | 'modules'>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global shortcut: ⌘K or Ctrl+K focuses the search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compile all search items
  const allItems = useMemo<HeaderSearchItem[]>(() => {
    const items: HeaderSearchItem[] = [];

    // 1. Enrolled Students
    MOCK_STUDENTS.forEach(student => {
      items.push({
        id: student.id,
        title: student.name,
        subtitle: `Roll: #${student.rollNo} • ${student.class} (Sec ${student.section}) • Guardian: ${student.guardian}`,
        category: 'student',
        path: `/school/attendance/individual?studentId=${student.id}`,
        icon: Users,
        badge: student.status,
        badgeColor: student.status === 'Active' ? 'emerald' : 'rose',
        extraMeta: {
          rollNo: student.rollNo,
          class: student.class,
          section: student.section,
          guardian: student.guardian,
          phone: student.phone,
          bloodGroup: student.bloodGroup,
          status: student.status,
          imageUrl: student.imageUrl
        }
      });
    });

    // 2. Staff & Faculty
    MOCK_STAFF.forEach(staff => {
      items.push({
        id: staff.id,
        title: staff.name,
        subtitle: `${staff.designation} • ${staff.role} • ${staff.address || 'Dhaka'}`,
        category: 'staff',
        path: userRole === UserRole.TEACHER ? '/teacher/profile' : '/school/leave-approval',
        icon: GraduationCap,
        badge: staff.role,
        badgeColor: staff.role === 'Teacher' ? 'indigo' : 'amber',
        extraMeta: {
          designation: staff.designation,
          phone: staff.phone,
          bloodGroup: staff.bloodGroup,
          role: staff.role,
          imageUrl: staff.imageUrl
        }
      });
    });

    // 3. Platform Modules
    COMPREHENSIVE_MODULES.forEach(mod => {
      items.push(mod);
    });

    // 4. Classes
    MOCK_CLASSES.forEach(cls => {
      items.push({
        id: cls.id,
        title: `${cls.name} (Section ${cls.section})`,
        subtitle: `Class Teacher: ${cls.classTeacher} • ${cls.studentsCount} Students Enrolled`,
        category: 'class',
        path: '/school/students/list',
        icon: Layers,
        badge: `${cls.studentsCount} Students`,
        badgeColor: 'blue',
        extraMeta: {
          class: cls.name,
          section: cls.section,
          studentsCount: cls.studentsCount
        }
      });
    });

    return items;
  }, [userRole]);

  // Filtered results based on search input and active category tab
  const filteredResults = useMemo(() => {
    let list = allItems;

    // Filter by tab
    if (activeCategory === 'students') {
      list = list.filter(i => i.category === 'student');
    } else if (activeCategory === 'staff') {
      list = list.filter(i => i.category === 'staff');
    } else if (activeCategory === 'modules') {
      list = list.filter(i => i.category === 'module');
    }

    const q = query.trim().toLowerCase();
    if (!q) {
      // Default top suggestions when query is empty
      return list.slice(0, 8);
    }

    return list.filter(item => {
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchSubtitle = item.subtitle.toLowerCase().includes(q);
      const matchId = item.id.toLowerCase().includes(q);
      const matchBadge = item.badge?.toLowerCase().includes(q);
      const matchRoll = item.extraMeta?.rollNo?.toLowerCase().includes(q);
      const matchPhone = item.extraMeta?.phone?.toLowerCase().includes(q);
      const matchGuardian = item.extraMeta?.guardian?.toLowerCase().includes(q);
      const matchDesignation = item.extraMeta?.designation?.toLowerCase().includes(q);
      const matchClass = item.extraMeta?.class?.toLowerCase().includes(q);

      return (
        matchTitle ||
        matchSubtitle ||
        matchId ||
        matchBadge ||
        matchRoll ||
        matchPhone ||
        matchGuardian ||
        matchDesignation ||
        matchClass
      );
    }).slice(0, 15);
  }, [allItems, query, activeCategory]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredResults]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      setSelectedIndex(prev => (prev < filteredResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredResults.length > 0 && filteredResults[selectedIndex]) {
        handleNavigateToItem(filteredResults[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleNavigateToItem = (item: HeaderSearchItem) => {
    navigate(item.path);
    setIsOpen(false);
    showToast(`Navigated to ${item.title}`, 'info');
  };

  const handleCopyId = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(id);
    setCopiedId(id);
    showToast(`Copied ID: ${id}`, 'success');
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  // Badge color helper
  const getBadgeStyle = (color?: string) => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'indigo':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'amber':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'rose':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'purple':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'blue':
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filterFn = (item: HeaderSearchItem) => {
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q) ||
        item.extraMeta?.rollNo?.toLowerCase().includes(q) ||
        item.extraMeta?.designation?.toLowerCase().includes(q)
      );
    };

    return {
      all: allItems.filter(filterFn).length,
      students: allItems.filter(i => i.category === 'student' && filterFn(i)).length,
      staff: allItems.filter(i => i.category === 'staff' && filterFn(i)).length,
      modules: allItems.filter(i => i.category === 'module' && filterFn(i)).length
    };
  }, [allItems, query]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* ------------------------------------------------------------- */}
      {/* MAIN SEARCH INPUT IN HEADER */}
      {/* ------------------------------------------------------------- */}
      <div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all shadow-2xs ${
          isOpen
            ? 'bg-white border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm w-56 sm:w-80 md:w-96 lg:w-[420px]'
            : 'bg-slate-100/90 hover:bg-slate-200/70 border-slate-200 hover:border-slate-300 w-44 sm:w-64 md:w-80 lg:w-96'
        }`}
      >
        <Search
          size={15}
          className={`shrink-0 transition-colors ${
            isOpen ? 'text-indigo-600' : 'text-slate-400'
          }`}
        />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search students, staff, modules by name/ID..."
          className="w-full bg-transparent text-xs text-slate-800 placeholder:text-slate-400 outline-none font-medium truncate"
        />

        {query ? (
          <button
            onClick={handleClear}
            className="p-0.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
            title="Clear search"
          >
            <X size={13} />
          </button>
        ) : (
          <kbd className="hidden sm:inline-flex items-center font-mono text-[10px] font-bold bg-white border border-slate-300 px-1.5 py-0.5 rounded text-slate-400 shadow-2xs shrink-0 select-none">
            ⌘K
          </kbd>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* FLOATING DROPDOWN SUGGESTIONS & SEARCH RESULTS */}
      {/* ------------------------------------------------------------- */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 sm:w-96 md:w-[460px] lg:w-[520px] bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Top Category Filter Chips */}
          <div className="p-2.5 bg-slate-50/90 border-b border-slate-100 flex items-center justify-between gap-1 flex-wrap">
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  activeCategory === 'all'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <span>All</span>
                <span className={`px-1 py-0.2 rounded-full text-[9px] font-black ${
                  activeCategory === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {categoryCounts.all}
                </span>
              </button>

              <button
                onClick={() => setActiveCategory('students')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  activeCategory === 'students'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <Users size={12} />
                <span>Students</span>
                <span className={`px-1 py-0.2 rounded-full text-[9px] font-black ${
                  activeCategory === 'students' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {categoryCounts.students}
                </span>
              </button>

              <button
                onClick={() => setActiveCategory('staff')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  activeCategory === 'staff'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <GraduationCap size={12} />
                <span>Staff</span>
                <span className={`px-1 py-0.2 rounded-full text-[9px] font-black ${
                  activeCategory === 'staff' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {categoryCounts.staff}
                </span>
              </button>

              <button
                onClick={() => setActiveCategory('modules')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  activeCategory === 'modules'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <Layers size={12} />
                <span>Modules</span>
                <span className={`px-1 py-0.2 rounded-full text-[9px] font-black ${
                  activeCategory === 'modules' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {categoryCounts.modules}
                </span>
              </button>
            </div>

            {/* Quick Helper */}
            <span className="text-[10px] text-slate-400 hidden sm:inline-block font-medium">
              ↑↓ to navigate • ↵ to select
            </span>
          </div>

          {/* Results List */}
          <div ref={listRef} className="max-h-80 sm:max-h-96 overflow-y-auto divide-y divide-slate-100">
            {filteredResults.length === 0 ? (
              <div className="py-10 px-4 text-center">
                <AlertCircle size={28} className="mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-bold text-slate-700">No matching student, staff, or module found</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Try searching with student name, ID (e.g. ST-2024-001), staff ID (e.g. EMP-001), or module title.
                </p>
              </div>
            ) : (
              filteredResults.map((item, index) => {
                const isSelected = index === selectedIndex;
                const IconComponent = item.icon;
                const isStudent = item.category === 'student';
                const isStaff = item.category === 'staff';
                const isModule = item.category === 'module';

                return (
                  <div
                    key={`${item.category}-${item.id}`}
                    onClick={() => handleNavigateToItem(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`p-3 transition-colors cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected ? 'bg-indigo-50/70' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Avatar or Icon */}
                      <div className="relative shrink-0">
                        {item.extraMeta?.imageUrl ? (
                          <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200">
                            <img
                              src={item.extraMeta.imageUrl}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                              isStudent
                                ? 'bg-blue-50 text-blue-600 border-blue-200'
                                : isStaff
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                : 'bg-indigo-50 text-indigo-600 border-indigo-200'
                            }`}
                          >
                            <IconComponent size={17} />
                          </div>
                        )}
                        <span
                          className={`absolute -bottom-1 -right-1 text-[8px] font-black px-1 rounded-sm uppercase tracking-tighter ${
                            isStudent
                              ? 'bg-blue-600 text-white'
                              : isStaff
                              ? 'bg-emerald-600 text-white'
                              : 'bg-indigo-600 text-white'
                          }`}
                        >
                          {item.category.slice(0, 3)}
                        </span>
                      </div>

                      {/* Text info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 truncate">
                            {item.title}
                          </span>

                          {/* ID badge with quick copy */}
                          <button
                            onClick={e => handleCopyId(e, item.id)}
                            className="font-mono text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded border border-slate-200 flex items-center gap-1 transition-colors shrink-0"
                            title="Click to copy ID"
                          >
                            <span>{item.id}</span>
                            {copiedId === item.id ? (
                              <Check size={10} className="text-emerald-600" />
                            ) : (
                              <Copy size={9} className="text-slate-400" />
                            )}
                          </button>

                          {/* Status/Type Badge */}
                          {item.badge && (
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded border shrink-0 hidden sm:inline-block ${getBadgeStyle(
                                item.badgeColor
                              )}`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Right Action Buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      {isStudent && (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            navigate(`/school/attendance/individual?studentId=${item.id}`);
                            setIsOpen(false);
                          }}
                          className="px-2 py-1 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 hover:border-emerald-300 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors shadow-2xs"
                          title="View Attendance & Progress Trends"
                        >
                          <TrendingUp size={11} />
                          <span className="hidden sm:inline">Progress</span>
                        </button>
                      )}

                      <span
                        className={`p-1.5 rounded-lg text-slate-400 transition-colors ${
                          isSelected ? 'text-indigo-600 bg-white shadow-2xs' : ''
                        }`}
                      >
                        <ArrowRight size={13} />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Footer with Modal Trigger & Quick Summary */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">
                {filteredResults.length} matches
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">
                School Admin Master Registry
              </span>
            </div>

            {onOpenFullModal && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenFullModal();
                }}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
              >
                <span>Full Search Modal</span>
                <ArrowUpRight size={12} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
