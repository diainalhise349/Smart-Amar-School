import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Filter, 
  Search, Clock, MapPin, Users, AlertCircle, CheckCircle2, 
  Trash2, Edit, Download, Printer, Share2, Sparkles, Tag, 
  CalendarDays, BookOpen, Trophy, Flag, GraduationCap, X, 
  Layers, Check, Send, AlertTriangle, Eye, ArrowRight, BookmarkCheck,
  FileText, Megaphone
} from 'lucide-react';
import { DashboardLayout } from '../components/Layout';
import { Card, Button, Badge, Input, Modal, useToast } from '../components/UIComponents';
import { UserRole } from '../types';

export interface CalendarEvent {
  id: string;
  title: string;
  category: 'holiday' | 'exam' | 'event' | 'deadline' | 'training';
  startDate: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  startTime?: string; // e.g. "09:00 AM"
  endTime?: string;   // e.g. "01:30 PM"
  isAllDay: boolean;
  location?: string;
  targetAudience: 'All' | 'Students' | 'Teachers' | 'Parents' | 'Class 10' | 'Class 9';
  description?: string;
  color?: 'rose' | 'amber' | 'emerald' | 'indigo' | 'purple' | 'blue';
  notifyViaSMS?: boolean;
}

// Initial Comprehensive Academic Calendar Dataset
const INITIAL_EVENTS: CalendarEvent[] = [
  // Holidays
  {
    id: 'EVT-001',
    title: 'International Mother Language Day',
    category: 'holiday',
    startDate: '2025-02-21',
    isAllDay: true,
    location: 'National Observance',
    targetAudience: 'All',
    description: 'School campus closed in honor of Language Martyrs Day.',
    color: 'rose',
  },
  {
    id: 'EVT-002',
    title: 'Independence Day & National Day',
    category: 'holiday',
    startDate: '2025-03-26',
    isAllDay: true,
    location: 'Campus Wide',
    targetAudience: 'All',
    description: 'National holiday. Morning flag hoisting at 8:00 AM followed by cultural assembly.',
    color: 'rose',
  },
  {
    id: 'EVT-003',
    title: 'Holy Ramadan & Eid-ul-Fitr Vacation',
    category: 'holiday',
    startDate: '2025-03-28',
    endDate: '2025-04-12',
    isAllDay: true,
    location: 'All Branches',
    targetAudience: 'All',
    description: 'Annual Eid-ul-Fitr and Ramadan recess for all academic sections.',
    color: 'rose',
  },
  {
    id: 'EVT-004',
    title: 'Bengali New Year (Pohela Boishakh)',
    category: 'holiday',
    startDate: '2025-04-14',
    isAllDay: true,
    location: 'Campus Ground',
    targetAudience: 'All',
    description: 'Pohela Boishakh celebration and traditional Mangal Shobhajatra.',
    color: 'rose',
  },
  {
    id: 'EVT-005',
    title: 'Summer Vacation',
    category: 'holiday',
    startDate: '2025-06-15',
    endDate: '2025-06-25',
    isAllDay: true,
    location: 'All Branches',
    targetAudience: 'All',
    description: 'Institutional summer break following 1st Term Examinations.',
    color: 'rose',
  },

  // Exams
  {
    id: 'EVT-101',
    title: '1st Term Preparatory Model Test',
    category: 'exam',
    startDate: '2025-04-20',
    endDate: '2025-04-27',
    startTime: '09:00 AM',
    endTime: '12:30 PM',
    location: 'Examination Halls (Floor 2 & 3)',
    targetAudience: 'Class 10',
    description: 'Model evaluation covering term 1 syllabus for SSC candidate batches.',
    color: 'indigo',
  },
  {
    id: 'EVT-102',
    title: 'Half-Yearly / 1st Term Final Examination',
    category: 'exam',
    startDate: '2025-05-15',
    endDate: '2025-05-30',
    startTime: '09:30 AM',
    endTime: '01:00 PM',
    location: 'All Classrooms',
    targetAudience: 'Students',
    description: 'Comprehensive term evaluation for Classes 1 to 10. Admit card mandatory.',
    color: 'indigo',
  },
  {
    id: 'EVT-103',
    title: 'Mid-Term Practical & Lab Evaluation',
    category: 'exam',
    startDate: '2025-08-10',
    endDate: '2025-08-14',
    startTime: '10:00 AM',
    endTime: '02:00 PM',
    location: 'Physics, Chemistry & ICT Labs',
    targetAudience: 'Class 9',
    description: 'Hands-on practical tests and lab notebook assessments.',
    color: 'indigo',
  },
  {
    id: 'EVT-104',
    title: 'Annual Final Examination 2025',
    category: 'exam',
    startDate: '2025-11-20',
    endDate: '2025-12-08',
    startTime: '09:30 AM',
    endTime: '01:00 PM',
    location: 'Main Building Examination Center',
    targetAudience: 'All',
    description: 'Final promotion examinations for academic year 2025.',
    color: 'indigo',
  },

  // Special Events
  {
    id: 'EVT-201',
    title: 'Annual Inter-School Sports Meet',
    category: 'event',
    startDate: '2025-02-15',
    endDate: '2025-02-16',
    startTime: '08:30 AM',
    endTime: '04:30 PM',
    location: 'Main Sports Complex & Track',
    targetAudience: 'All',
    description: 'Track and field events, march-past, gymnastic drill, and award ceremony.',
    color: 'emerald',
  },
  {
    id: 'EVT-202',
    title: 'Science & Robotics Innovation Fair',
    category: 'event',
    startDate: '2025-05-08',
    startTime: '09:00 AM',
    endTime: '03:00 PM',
    location: 'Auditorium & STEM Lab',
    targetAudience: 'Students',
    description: 'Student project exhibitions, AI demonstrations, and inter-class quiz bowl.',
    color: 'emerald',
  },
  {
    id: 'EVT-203',
    title: 'Parents-Teachers Academic Conference (PTM)',
    category: 'event',
    startDate: '2025-06-05',
    startTime: '10:00 AM',
    endTime: '03:30 PM',
    location: 'Designated Classrooms',
    targetAudience: 'Parents',
    description: 'Progress card discussion and behavioral review with guardians.',
    color: 'emerald',
  },
  {
    id: 'EVT-204',
    title: 'Annual Cultural Festival & Prize Giving Ceremony',
    category: 'event',
    startDate: '2025-12-20',
    startTime: '04:00 PM',
    endTime: '08:00 PM',
    location: 'Open Air Amphitheatre',
    targetAudience: 'All',
    description: 'Drama, music performances, annual awards, and academic merit medals.',
    color: 'emerald',
  },

  // Academic Deadlines
  {
    id: 'EVT-301',
    title: 'Quarter 1 Tuition Fees Submission Cutoff',
    category: 'deadline',
    startDate: '2025-03-10',
    isAllDay: true,
    location: 'Accounts Office & Online Portal',
    targetAudience: 'Parents',
    description: 'Final date to clear Quarter 1 dues without late fee charges.',
    color: 'amber',
  },
  {
    id: 'EVT-302',
    title: '1st Term Marks Submission by Faculty',
    category: 'deadline',
    startDate: '2025-06-02',
    isAllDay: true,
    location: 'Exam Control Portal',
    targetAudience: 'Teachers',
    description: 'All subject teachers must submit marks into the system for tabulation.',
    color: 'amber',
  },
  {
    id: 'EVT-303',
    title: 'New Student Admission Form Deadline',
    category: 'deadline',
    startDate: '2025-11-15',
    isAllDay: true,
    location: 'Admission Office',
    targetAudience: 'All',
    description: 'Last date for submitting online and offline admission application forms.',
    color: 'amber',
  },

  // Teacher Training / Staff
  {
    id: 'EVT-401',
    title: 'Digital Pedagogy & STEM Curriculum Workshop',
    category: 'training',
    startDate: '2025-01-08',
    startTime: '09:00 AM',
    endTime: '02:00 PM',
    location: 'Conference Hall',
    targetAudience: 'Teachers',
    description: 'Staff professional development program on interactive teaching tools.',
    color: 'purple',
  },
];

const CATEGORY_STYLES = {
  holiday: {
    label: 'Holiday / Vacation',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
    dotClass: 'bg-rose-500',
    icon: Flag,
    bgLight: 'bg-rose-50 border-rose-200 text-rose-900',
  },
  exam: {
    label: 'Examination / Assessment',
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    dotClass: 'bg-indigo-600',
    icon: BookOpen,
    bgLight: 'bg-indigo-50 border-indigo-200 text-indigo-900',
  },
  event: {
    label: 'Special Event & Activity',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    dotClass: 'bg-emerald-500',
    icon: Trophy,
    bgLight: 'bg-emerald-50 border-emerald-200 text-emerald-900',
  },
  deadline: {
    label: 'Academic Deadline',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    dotClass: 'bg-amber-500',
    icon: Clock,
    bgLight: 'bg-amber-50 border-amber-200 text-amber-900',
  },
  training: {
    label: 'Faculty & Staff Training',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200',
    dotClass: 'bg-purple-600',
    icon: GraduationCap,
    bgLight: 'bg-purple-50 border-purple-200 text-purple-900',
  },
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const AcademicCalendar: React.FC = () => {
  const { showToast } = useToast();

  // State Management
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2025, 4, 1)); // May 2025 as starting academic reference
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'calendar' | 'agenda' | 'holidays' | 'exams'>('calendar');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDayEvents, setSelectedDayEvents] = useState<{ date: string; events: CalendarEvent[] } | null>(null);
  const [isDayViewModalOpen, setIsDayViewModalOpen] = useState(false);

  // Form State for Adding / Editing Event
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    category: CalendarEvent['category'];
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    isAllDay: boolean;
    location: string;
    targetAudience: CalendarEvent['targetAudience'];
    description: string;
    notifyViaSMS: boolean;
  }>({
    title: '',
    category: 'holiday',
    startDate: '2025-05-15',
    endDate: '',
    startTime: '09:00 AM',
    endTime: '01:00 PM',
    isAllDay: true,
    location: 'Main Campus',
    targetAudience: 'All',
    description: '',
    notifyViaSMS: false,
  });

  // Calendar Calculation Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = useMemo(() => {
    return new Date(year, month + 1, 0).getDate();
  }, [year, month]);

  const firstDayOfMonth = useMemo(() => {
    return new Date(year, month, 1).getDay(); // 0 = Sunday, 1 = Monday...
  }, [year, month]);

  const daysInPrevMonth = useMemo(() => {
    return new Date(year, month, 0).getDate();
  }, [year, month]);

  // Navigate Calendar
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Helper to check if event spans or falls on a date
  const isEventOnDate = (event: CalendarEvent, dateStr: string) => {
    if (event.startDate === dateStr) return true;
    if (event.endDate && event.startDate <= dateStr && event.endDate >= dateStr) {
      return true;
    }
    return false;
  };

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchCategory = selectedCategory === 'all' || event.category === selectedCategory;
      const matchSearch = searchQuery.trim() === '' || 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [events, selectedCategory, searchQuery]);

  // Calendar Grid Matrix Generation
  const calendarGrid = useMemo(() => {
    const matrix: Array<{
      dayNum: number;
      dateStr: string;
      isCurrentMonth: boolean;
      events: CalendarEvent[];
      isHoliday: boolean;
      isToday: boolean;
    }> = [];

    const todayStr = new Date().toISOString().split('T')[0];

    // Previous Month padding days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const dayEvents = filteredEvents.filter(e => isEventOnDate(e, dateStr));
      const isHoliday = dayEvents.some(e => e.category === 'holiday');

      matrix.push({
        dayNum,
        dateStr,
        isCurrentMonth: false,
        events: dayEvents,
        isHoliday,
        isToday: dateStr === todayStr,
      });
    }

    // Current Month days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayEvents = filteredEvents.filter(e => isEventOnDate(e, dateStr));
      const isHoliday = dayEvents.some(e => e.category === 'holiday');

      matrix.push({
        dayNum: i,
        dateStr,
        isCurrentMonth: true,
        events: dayEvents,
        isHoliday,
        isToday: dateStr === todayStr,
      });
    }

    // Next Month padding days (fill out 35 or 42 grid cells)
    const remainingCells = (7 - (matrix.length % 7)) % 7;
    for (let i = 1; i <= remainingCells; i++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayEvents = filteredEvents.filter(e => isEventOnDate(e, dateStr));
      const isHoliday = dayEvents.some(e => e.category === 'holiday');

      matrix.push({
        dayNum: i,
        dateStr,
        isCurrentMonth: false,
        events: dayEvents,
        isHoliday,
        isToday: dateStr === todayStr,
      });
    }

    return matrix;
  }, [year, month, firstDayOfMonth, daysInMonth, daysInPrevMonth, filteredEvents]);

  // Statistics Summary
  const stats = useMemo(() => {
    const holidaysCount = events.filter(e => e.category === 'holiday').length;
    const examsCount = events.filter(e => e.category === 'exam').length;
    const eventsCount = events.filter(e => e.category === 'event').length;
    const deadlinesCount = events.filter(e => e.category === 'deadline').length;
    return { holidaysCount, examsCount, eventsCount, deadlinesCount };
  }, [events]);

  // Open Modal for New Event
  const handleOpenAddModal = (defaultDate?: string) => {
    setEditingEventId(null);
    setFormData({
      title: '',
      category: 'holiday',
      startDate: defaultDate || `${year}-${String(month + 1).padStart(2, '0')}-01`,
      endDate: '',
      startTime: '09:00 AM',
      endTime: '01:00 PM',
      isAllDay: true,
      location: 'Main Campus',
      targetAudience: 'All',
      description: '',
      notifyViaSMS: false,
    });
    setIsAddModalOpen(true);
  };

  // Open Modal for Editing Event
  const handleOpenEditModal = (evt: CalendarEvent) => {
    setEditingEventId(evt.id);
    setFormData({
      title: evt.title,
      category: evt.category,
      startDate: evt.startDate,
      endDate: evt.endDate || '',
      startTime: evt.startTime || '09:00 AM',
      endTime: evt.endTime || '01:00 PM',
      isAllDay: evt.isAllDay,
      location: evt.location || '',
      targetAudience: evt.targetAudience,
      description: evt.description || '',
      notifyViaSMS: false,
    });
    setIsDetailModalOpen(false);
    setIsAddModalOpen(true);
  };

  // Save or Update Event
  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.startDate) {
      showToast('Please enter an event title and start date', 'warning');
      return;
    }

    if (editingEventId) {
      // Update existing
      setEvents(prev => prev.map(evt => {
        if (evt.id === editingEventId) {
          return {
            ...evt,
            ...formData,
            endDate: formData.endDate || undefined,
            startTime: !formData.isAllDay ? formData.startTime : undefined,
            endTime: !formData.isAllDay ? formData.endTime : undefined,
          };
        }
        return evt;
      }));
      showToast(`Updated "${formData.title}" successfully`, 'success');
    } else {
      // Create new
      const newEvt: CalendarEvent = {
        id: `EVT-${Date.now().toString().slice(-4)}`,
        title: formData.title,
        category: formData.category,
        startDate: formData.startDate,
        endDate: formData.endDate || undefined,
        startTime: !formData.isAllDay ? formData.startTime : undefined,
        endTime: !formData.isAllDay ? formData.endTime : undefined,
        isAllDay: formData.isAllDay,
        location: formData.location || 'Main Campus',
        targetAudience: formData.targetAudience,
        description: formData.description,
        color: formData.category === 'holiday' ? 'rose' : formData.category === 'exam' ? 'indigo' : formData.category === 'event' ? 'emerald' : 'amber',
        notifyViaSMS: formData.notifyViaSMS,
      };

      setEvents(prev => [newEvt, ...prev]);
      showToast(`Added "${formData.title}" to calendar!`, 'success');

      if (formData.notifyViaSMS) {
        setTimeout(() => {
          showToast(`SMS notifications broadcast to ${formData.targetAudience}!`, 'info');
        }, 800);
      }
    }

    setIsAddModalOpen(false);
  };

  // Delete Event
  const handleDeleteEvent = (id: string) => {
    if (window.confirm('Are you sure you want to delete this event from the academic calendar?')) {
      setEvents(prev => prev.filter(e => e.id !== id));
      setIsDetailModalOpen(false);
      setIsDayViewModalOpen(false);
      showToast('Event removed from academic calendar', 'info');
    }
  };

  // Handle Day Click
  const handleDayClick = (cell: typeof calendarGrid[0]) => {
    if (cell.events.length > 0) {
      setSelectedDayEvents({ date: cell.dateStr, events: cell.events });
      setIsDayViewModalOpen(true);
    } else {
      handleOpenAddModal(cell.dateStr);
    }
  };

  // Handle Print Action
  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout role={UserRole.SCHOOL_ADMIN}>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        
        {/* Header Title and Quick Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-100">
                <CalendarDays size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Academic Calendar & Events</h1>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                  Academic Year 2025-2026 • Official Holiday Lists, Term Exams, and Institution Milestones
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            <Button 
              variant="outline" 
              onClick={handlePrint}
              icon={Printer}
              className="text-xs font-bold bg-white hover:bg-slate-50"
            >
              Print Schedule
            </Button>
            <Button 
              onClick={() => handleOpenAddModal()}
              icon={Plus}
              className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 text-white"
            >
              Add Event / Holiday
            </Button>
          </div>
        </div>

        {/* Academic Calendar Metric Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 border border-rose-100 bg-linear-to-br from-rose-50/50 to-white hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Annual Holidays</span>
              <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
                <Flag size={18} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-slate-900">{stats.holidaysCount}</span>
              <span className="text-xs font-bold text-slate-500 ml-1.5">Days Gazetted</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">Includes Eid, Puja, National & Vacations</p>
          </Card>

          <Card className="p-4 border border-indigo-100 bg-linear-to-br from-indigo-50/50 to-white hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Scheduled Exams</span>
              <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                <BookOpen size={18} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-slate-900">{stats.examsCount}</span>
              <span className="text-xs font-bold text-slate-500 ml-1.5">Exam Windows</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">1st Term, Midterm & Annual Finals</p>
          </Card>

          <Card className="p-4 border border-emerald-100 bg-linear-to-br from-emerald-50/50 to-white hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Special Events</span>
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                <Trophy size={18} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-slate-900">{stats.eventsCount}</span>
              <span className="text-xs font-bold text-slate-500 ml-1.5">Programs</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">Sports, Science Fair & Cultural Days</p>
          </Card>

          <Card className="p-4 border border-amber-100 bg-linear-to-br from-amber-50/50 to-white hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Academic Deadlines</span>
              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                <Clock size={18} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-slate-900">{stats.deadlinesCount}</span>
              <span className="text-xs font-bold text-slate-500 ml-1.5">Deadlines</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">Fees, Mark Submission & Admissions</p>
          </Card>
        </div>

        {/* Navigation Toolbar & View Selector */}
        <Card className="p-3.5 border-slate-200 shadow-xs">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            
            {/* View Switcher Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 overflow-x-auto text-xs">
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                  viewMode === 'calendar' 
                    ? 'bg-white text-indigo-700 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Calendar Grid
              </button>
              <button
                onClick={() => setViewMode('agenda')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                  viewMode === 'agenda' 
                    ? 'bg-white text-indigo-700 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Agenda List ({filteredEvents.length})
              </button>
              <button
                onClick={() => setViewMode('holidays')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                  viewMode === 'holidays' 
                    ? 'bg-white text-indigo-700 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Holiday Directory ({stats.holidaysCount})
              </button>
              <button
                onClick={() => setViewMode('exams')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                  viewMode === 'exams' 
                    ? 'bg-white text-indigo-700 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Exam Schedules ({stats.examsCount})
              </button>
            </div>

            {/* Category Filter Badges */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-1">
              <span className="text-[10px] font-black uppercase text-slate-400 mr-1">Filter:</span>
              {[
                { key: 'all', label: 'All' },
                { key: 'holiday', label: 'Holidays', color: 'rose' },
                { key: 'exam', label: 'Exams', color: 'indigo' },
                { key: 'event', label: 'Events', color: 'emerald' },
                { key: 'deadline', label: 'Deadlines', color: 'amber' },
              ].map(cat => (
                <button
                  key={cat.key}
                  onClick={() => setSelectedCategory(cat.key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedCategory === cat.key
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative shrink-0 w-full lg:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search event, exam, holiday..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

          </div>
        </Card>

        {/* --- VIEW MODE 1: MONTH CALENDAR GRID --- */}
        {viewMode === 'calendar' && (
          <Card className="p-0 border-slate-200 overflow-hidden shadow-sm">
            {/* Calendar Month Navigation Header */}
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  {MONTH_NAMES[month]} {year}
                </h2>
                <button
                  onClick={handleToday}
                  className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-bold shadow-2xs"
                >
                  Current Month
                </button>
              </div>

              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                  title="Previous Month"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="w-px h-4 bg-slate-200" />
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
                  title="Next Month"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-100/70 text-center">
              {DAYS_OF_WEEK.map((day, idx) => (
                <div 
                  key={day} 
                  className={`py-2 text-xs font-black uppercase tracking-wider ${
                    idx === 5 || idx === 6 ? 'text-rose-600' : 'text-slate-600'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* 7-Column Day Cells Grid */}
            <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100 bg-slate-200/50">
              {calendarGrid.map((cell, idx) => (
                <div
                  key={`${cell.dateStr}-${idx}`}
                  onClick={() => handleDayClick(cell)}
                  className={`min-h-[100px] sm:min-h-[120px] p-2 bg-white flex flex-col justify-between transition-all cursor-pointer group ${
                    !cell.isCurrentMonth ? 'bg-slate-50/60 opacity-60 text-slate-400' : ''
                  } ${cell.isToday ? 'ring-2 ring-indigo-500 ring-inset bg-indigo-50/30' : ''} ${
                    cell.isHoliday && cell.isCurrentMonth ? 'bg-rose-50/20' : ''
                  } hover:bg-indigo-50/40`}
                >
                  {/* Day Header with Number */}
                  <div className="flex items-center justify-between">
                    <span 
                      className={`text-xs font-black inline-flex items-center justify-center rounded-md ${
                        cell.isToday 
                          ? 'w-6 h-6 bg-indigo-600 text-white shadow-xs' 
                          : cell.isHoliday && cell.isCurrentMonth
                          ? 'text-rose-600 font-black' 
                          : 'text-slate-700'
                      }`}
                    >
                      {cell.dayNum}
                    </span>

                    {cell.events.length > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600">
                        {cell.events.length}
                      </span>
                    )}
                  </div>

                  {/* Event Badges List in Cell */}
                  <div className="mt-1.5 space-y-1 overflow-hidden flex-1">
                    {cell.events.slice(0, 3).map(evt => {
                      const style = CATEGORY_STYLES[evt.category];
                      return (
                        <div
                          key={evt.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(evt);
                            setIsDetailModalOpen(true);
                          }}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold truncate border flex items-center gap-1 transition-transform hover:scale-[1.02] shadow-2xs ${
                            evt.category === 'holiday' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                            evt.category === 'exam' ? 'bg-indigo-100 text-indigo-800 border-indigo-200' :
                            evt.category === 'event' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                            'bg-amber-100 text-amber-800 border-amber-200'
                          }`}
                          title={`${evt.title} (${style.label})`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dotClass}`} />
                          <span className="truncate">{evt.title}</span>
                        </div>
                      );
                    })}

                    {cell.events.length > 3 && (
                      <div className="text-[10px] font-black text-indigo-600 pl-1">
                        +{cell.events.length - 3} more
                      </div>
                    )}
                  </div>

                  {/* Hover Add Prompt */}
                  <div className="opacity-0 group-hover:opacity-100 text-[10px] text-indigo-600 font-bold text-right transition-opacity pt-1">
                    + Add
                  </div>
                </div>
              ))}
            </div>

            {/* Calendar Footer Legend */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center flex-wrap gap-4">
                <span className="text-[11px] font-black uppercase text-slate-400">Legend:</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-slate-600 font-semibold">Holiday / Vacation</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                  <span className="text-slate-600 font-semibold">Examination</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-600 font-semibold">Special Event</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-slate-600 font-semibold">Academic Deadline</span>
                </div>
              </div>

              <div className="text-slate-400 text-[11px]">
                Click on any date to inspect or schedule events
              </div>
            </div>
          </Card>
        )}

        {/* --- VIEW MODE 2: AGENDA LIST TIMELINE --- */}
        {viewMode === 'agenda' && (
          <div className="space-y-4">
            {filteredEvents.length > 0 ? (
              filteredEvents.map(evt => {
                const style = CATEGORY_STYLES[evt.category];
                const IconComponent = style.icon;

                return (
                  <Card 
                    key={evt.id} 
                    className="p-5 border border-slate-200 hover:border-indigo-300 transition-all hover:shadow-md bg-white"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-2xl shrink-0 ${
                          evt.category === 'holiday' ? 'bg-rose-100 text-rose-700' :
                          evt.category === 'exam' ? 'bg-indigo-100 text-indigo-700' :
                          evt.category === 'event' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          <IconComponent size={24} />
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-black text-slate-900">{evt.title}</h3>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${style.badgeClass}`}>
                              {style.label}
                            </span>
                            <Badge color="gray" className="text-[10px]">
                              Audience: {evt.targetAudience}
                            </Badge>
                          </div>

                          <p className="text-xs text-slate-500 mt-1">{evt.description}</p>

                          <div className="flex items-center flex-wrap gap-4 text-xs font-semibold text-slate-600 mt-3">
                            <div className="flex items-center gap-1.5 text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">
                              <CalendarIcon size={14} />
                              <span>{evt.startDate} {evt.endDate ? `to ${evt.endDate}` : ''}</span>
                            </div>

                            {!evt.isAllDay && evt.startTime && (
                              <div className="flex items-center gap-1.5 text-slate-600">
                                <Clock size={14} className="text-slate-400" />
                                <span>{evt.startTime} - {evt.endTime}</span>
                              </div>
                            )}

                            {evt.location && (
                              <div className="flex items-center gap-1.5 text-slate-600">
                                <MapPin size={14} className="text-slate-400" />
                                <span>{evt.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleOpenEditModal(evt)}
                          icon={Edit}
                          className="text-xs font-bold"
                        >
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="danger"
                          onClick={() => handleDeleteEvent(evt.id)}
                          icon={Trash2}
                          className="text-xs font-bold"
                        >
                          Delete
                        </Button>
                      </div>

                    </div>
                  </Card>
                );
              })
            ) : (
              <Card className="p-12 text-center border-dashed">
                <AlertCircle size={36} className="mx-auto text-slate-300 mb-2" />
                <h3 className="text-base font-bold text-slate-700">No events found</h3>
                <p className="text-xs text-slate-400 mt-1">Try resetting search filters or add a new event.</p>
              </Card>
            )}
          </div>
        )}

        {/* --- VIEW MODE 3: HOLIDAY DIRECTORY --- */}
        {viewMode === 'holidays' && (
          <Card className="p-0 border-slate-200 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-200 bg-rose-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-rose-950">Official Institutional & National Holidays</h3>
                <p className="text-xs text-rose-700 font-medium mt-0.5">
                  Gazetted holidays and authorized institutional recess days for 2025-2026.
                </p>
              </div>
              <Button 
                size="sm" 
                onClick={() => {
                  setFormData(prev => ({ ...prev, category: 'holiday' }));
                  handleOpenAddModal();
                }}
                icon={Plus}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
              >
                Add Holiday
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-600 uppercase font-black tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Holiday Name</th>
                    <th className="p-3.5">Date / Duration</th>
                    <th className="p-3.5">Total Days</th>
                    <th className="p-3.5">Campus Status</th>
                    <th className="p-3.5">Audience</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {events.filter(e => e.category === 'holiday').map(hol => {
                    const daysCount = hol.endDate ? 
                      Math.max(1, Math.round((new Date(hol.endDate).getTime() - new Date(hol.startDate).getTime()) / (1000 * 3600 * 24)) + 1) : 1;

                    return (
                      <tr key={hol.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5 font-bold text-slate-900">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                            <span>{hol.title}</span>
                          </div>
                          {hol.description && (
                            <p className="text-[11px] font-normal text-slate-400 mt-0.5 pl-4">{hol.description}</p>
                          )}
                        </td>
                        <td className="p-3.5 font-semibold text-slate-700">
                          {hol.startDate} {hol.endDate ? `to ${hol.endDate}` : ''}
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[11px]">
                            {daysCount} {daysCount > 1 ? 'Days' : 'Day'}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <Badge color="red">Campus Closed</Badge>
                        </td>
                        <td className="p-3.5 font-medium text-slate-600">
                          {hol.targetAudience}
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button 
                              onClick={() => handleOpenEditModal(hol)}
                              className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteEvent(hol.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* --- VIEW MODE 4: EXAM SCHEDULES --- */}
        {viewMode === 'exams' && (
          <Card className="p-0 border-slate-200 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-200 bg-indigo-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-indigo-950">Academic Examination Calendars</h3>
                <p className="text-xs text-indigo-700 font-medium mt-0.5">
                  Scheduled term evaluations, mock board examinations, and lab assessments.
                </p>
              </div>
              <Button 
                size="sm" 
                onClick={() => {
                  setFormData(prev => ({ ...prev, category: 'exam', isAllDay: false }));
                  handleOpenAddModal();
                }}
                icon={Plus}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
              >
                Schedule Exam
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-600 uppercase font-black tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Examination Title</th>
                    <th className="p-3.5">Date Range</th>
                    <th className="p-3.5">Time / Shift</th>
                    <th className="p-3.5">Target Classes</th>
                    <th className="p-3.5">Venue</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {events.filter(e => e.category === 'exam').map(exm => (
                    <tr key={exm.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-indigo-600" />
                          <span>{exm.title}</span>
                        </div>
                        {exm.description && (
                          <p className="text-[11px] font-normal text-slate-400 mt-0.5 pl-4">{exm.description}</p>
                        )}
                      </td>
                      <td className="p-3.5 font-semibold text-slate-700">
                        {exm.startDate} {exm.endDate ? `to ${exm.endDate}` : ''}
                      </td>
                      <td className="p-3.5 text-slate-600">
                        {exm.isAllDay ? 'All Day Window' : `${exm.startTime} - ${exm.endTime}`}
                      </td>
                      <td className="p-3.5">
                        <Badge color="blue">{exm.targetAudience}</Badge>
                      </td>
                      <td className="p-3.5 text-slate-600">
                        {exm.location || 'All Classrooms'}
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => handleOpenEditModal(exm)}
                            className="p-1 text-slate-400 hover:text-indigo-600 rounded hover:bg-slate-100"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteEvent(exm.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* --- MODAL 1: ADD / EDIT CALENDAR EVENT --- */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title={editingEventId ? 'Edit Academic Event / Holiday' : 'Add New Academic Event / Holiday'}
        >
          <form onSubmit={handleSaveEvent} className="p-6 space-y-4">
            
            {/* Event Title */}
            <div>
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">
                Event Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Eid-ul-Fitr Vacation, 1st Term Exam, Sports Day"
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* Category / Event Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">
                  Category / Type
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-semibold bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="holiday">🏖️ Holiday / Vacation (School Closed)</option>
                  <option value="exam">📝 Examination / Assessment</option>
                  <option value="event">🏆 Special Event & Activity</option>
                  <option value="deadline">📌 Academic Deadline / Fee Cutoff</option>
                  <option value="training">👨‍🏫 Faculty / Staff Training</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">
                  Target Audience
                </label>
                <select
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as any })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-semibold bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="All">All School (Students, Staff & Parents)</option>
                  <option value="Students">All Students</option>
                  <option value="Class 10">Class 10 Only</option>
                  <option value="Class 9">Class 9 Only</option>
                  <option value="Teachers">Faculty & Staff Only</option>
                  <option value="Parents">Parents / Guardians</option>
                </select>
              </div>
            </div>

            {/* Date Configuration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">
                  Start Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">
                  End Date (Optional for multi-day)
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            {/* All Day Toggle & Time Picker */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  All-Day Event
                </label>
                <input
                  type="checkbox"
                  checked={formData.isAllDay}
                  onChange={(e) => setFormData({ ...formData, isAllDay: e.target.checked })}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
              </div>

              {!formData.isAllDay && (
                <div className="grid grid-cols-2 gap-3 mt-2 pt-2 border-t border-slate-200">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Start Time</label>
                    <input
                      type="text"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      placeholder="09:00 AM"
                      className="w-full border border-slate-300 rounded-lg p-2 text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">End Time</label>
                    <input
                      type="text"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      placeholder="01:00 PM"
                      className="w-full border border-slate-300 rounded-lg p-2 text-xs font-semibold"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Location / Venue */}
            <div>
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">
                Venue / Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Main Auditorium, Playground, Examination Halls, Campus Wide"
                className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* Description / Instructions */}
            <div>
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-1">
                Description & Instructions
              </label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add special instructions, requirements, or agenda details..."
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* SMS Notification Broadcast */}
            <div className="flex items-center gap-2 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
              <input
                type="checkbox"
                id="notifySms"
                checked={formData.notifyViaSMS}
                onChange={(e) => setFormData({ ...formData, notifyViaSMS: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <label htmlFor="notifySms" className="text-xs font-bold text-indigo-900 cursor-pointer">
                Broadcast automatic SMS notification to target recipients ({formData.targetAudience})
              </label>
            </div>

            {/* Form Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="font-bold text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6"
                icon={Check}
              >
                {editingEventId ? 'Save Changes' : 'Publish to Calendar'}
              </Button>
            </div>

          </form>
        </Modal>

        {/* --- MODAL 2: EVENT DETAILS INSPECTION --- */}
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title="Academic Event Overview"
        >
          {selectedEvent && (
            <div className="p-6 space-y-5">
              <div className="flex items-start gap-3.5">
                <div className={`p-3 rounded-2xl shrink-0 ${
                  selectedEvent.category === 'holiday' ? 'bg-rose-100 text-rose-700' :
                  selectedEvent.category === 'exam' ? 'bg-indigo-100 text-indigo-700' :
                  selectedEvent.category === 'event' ? 'bg-emerald-100 text-emerald-700' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {React.createElement(CATEGORY_STYLES[selectedEvent.category].icon, { size: 24 })}
                </div>

                <div>
                  <h3 className="text-lg font-black text-slate-900">{selectedEvent.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${CATEGORY_STYLES[selectedEvent.category].badgeClass}`}>
                      {CATEGORY_STYLES[selectedEvent.category].label}
                    </span>
                    <Badge color="gray">{selectedEvent.targetAudience}</Badge>
                  </div>
                </div>
              </div>

              {/* Event Metadata Cards */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200/70">
                  <span className="text-slate-500 font-medium">Scheduled Date:</span>
                  <span className="font-bold text-slate-900">
                    {selectedEvent.startDate} {selectedEvent.endDate ? `to ${selectedEvent.endDate}` : ''}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-200/70">
                  <span className="text-slate-500 font-medium">Timing:</span>
                  <span className="font-bold text-slate-900">
                    {selectedEvent.isAllDay ? 'All Day Event' : `${selectedEvent.startTime} - ${selectedEvent.endTime}`}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-200/70">
                  <span className="text-slate-500 font-medium">Location / Venue:</span>
                  <span className="font-bold text-slate-900">{selectedEvent.location || 'Campus Wide'}</span>
                </div>

                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-medium">Campus Operational Status:</span>
                  <span className={`font-bold ${selectedEvent.category === 'holiday' ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {selectedEvent.category === 'holiday' ? 'Closed for Classes' : 'Regular Operational Day'}
                  </span>
                </div>
              </div>

              {selectedEvent.description && (
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-400 mb-1">Details & Remarks</h4>
                  <p className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
                    {selectedEvent.description}
                  </p>
                </div>
              )}

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDeleteEvent(selectedEvent.id)}
                  icon={Trash2}
                  className="font-bold text-xs"
                >
                  Delete Event
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDetailModalOpen(false)}
                    className="font-bold text-xs"
                  >
                    Close
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleOpenEditModal(selectedEvent)}
                    icon={Edit}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                  >
                    Edit Event
                  </Button>
                </div>
              </div>

            </div>
          )}
        </Modal>

        {/* --- MODAL 3: DAY VIEW INSPECTION (When multiple events on single day) --- */}
        <Modal
          isOpen={isDayViewModalOpen}
          onClose={() => setIsDayViewModalOpen(false)}
          title={`Schedule for ${selectedDayEvents?.date}`}
        >
          {selectedDayEvents && (
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                {selectedDayEvents.events.map(evt => {
                  const style = CATEGORY_STYLES[evt.category];
                  const Icon = style.icon;

                  return (
                    <div 
                      key={evt.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between hover:border-indigo-300 transition-all shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          evt.category === 'holiday' ? 'bg-rose-100 text-rose-600' :
                          evt.category === 'exam' ? 'bg-indigo-100 text-indigo-600' :
                          evt.category === 'event' ? 'bg-emerald-100 text-emerald-600' :
                          'bg-amber-100 text-amber-600'
                        }`}>
                          <Icon size={18} />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">{evt.title}</h4>
                          <p className="text-xs text-slate-500">{style.label} • {evt.targetAudience}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedEvent(evt);
                            setIsDayViewModalOpen(false);
                            setIsDetailModalOpen(true);
                          }}
                          className="text-xs font-bold"
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <Button
                  onClick={() => {
                    setIsDayViewModalOpen(false);
                    handleOpenAddModal(selectedDayEvents.date);
                  }}
                  icon={Plus}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                >
                  Add Another Event on this Day
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsDayViewModalOpen(false)}
                  className="font-bold text-xs"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </Modal>

      </div>
    </DashboardLayout>
  );
};
