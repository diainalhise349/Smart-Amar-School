import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  ReferenceLine,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import {
  TrendingUp,
  Award,
  AlertTriangle,
  Users,
  BookOpen,
  Filter,
  Download,
  Printer,
  ChevronRight,
  Search,
  Sparkles,
  BarChart2,
  PieChart as PieChartIcon,
  Activity,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Eye,
  Mail,
  Send,
  RefreshCw,
  SlidersHorizontal,
  FileSpreadsheet
} from 'lucide-react';
import { Card, Button, Badge, Modal, Input, useToast } from './UIComponents';

export interface PerformanceStudent {
  id: string;
  rollNo: string;
  name: string;
  class: string;
  section: string;
  photo?: string;
  math: number;
  physics: number;
  science: number;
  english: number;
  ict: number;
  totalMarks: number;
  percentage: number;
  gpa: number;
  grade: string;
  attendance: number;
  status: 'Distinction' | 'Good Standing' | 'Needs Support' | 'At-Risk';
  strengths: string[];
  weaknesses: string[];
  trend: 'improving' | 'stable' | 'declining';
}

const INITIAL_STUDENTS_PERFORMANCE: PerformanceStudent[] = [
  {
    id: 'ST-001',
    rollNo: '101',
    name: 'Rahim Ahmed',
    class: 'Class 10',
    section: 'A',
    photo: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=100',
    math: 92,
    physics: 88,
    science: 90,
    english: 85,
    ict: 95,
    totalMarks: 450,
    percentage: 90.0,
    gpa: 5.0,
    grade: 'A+',
    attendance: 98,
    status: 'Distinction',
    strengths: ['Calculus', 'Electromagnetism', 'Algorithm Logic'],
    weaknesses: ['English Essay Vocabulary'],
    trend: 'improving'
  },
  {
    id: 'ST-002',
    rollNo: '102',
    name: 'Fatima Begum',
    class: 'Class 10',
    section: 'A',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    math: 78,
    physics: 82,
    science: 84,
    english: 88,
    ict: 86,
    totalMarks: 418,
    percentage: 83.6,
    gpa: 4.8,
    grade: 'A',
    attendance: 94,
    status: 'Good Standing',
    strengths: ['Optics', 'Chemical Equations', 'Reading Comprehension'],
    weaknesses: ['Trigonometric Proofs'],
    trend: 'improving'
  },
  {
    id: 'ST-003',
    rollNo: '103',
    name: 'Karim Ullah',
    class: 'Class 10',
    section: 'A',
    photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100',
    math: 48,
    physics: 52,
    science: 58,
    english: 62,
    ict: 70,
    totalMarks: 290,
    percentage: 58.0,
    gpa: 3.0,
    grade: 'B',
    attendance: 76,
    status: 'Needs Support',
    strengths: ['Computer Labs', 'Descriptive Biology'],
    weaknesses: ['Quadratic Equations', 'Kinematics Physics', 'Class Attendance'],
    trend: 'declining'
  },
  {
    id: 'ST-004',
    rollNo: '104',
    name: 'Nusrat Jahan',
    class: 'Class 9',
    section: 'B',
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100',
    math: 85,
    physics: 89,
    science: 91,
    english: 90,
    ict: 92,
    totalMarks: 447,
    percentage: 89.4,
    gpa: 5.0,
    grade: 'A+',
    attendance: 96,
    status: 'Distinction',
    strengths: ['Wave Mechanics', 'Algebraic Identities', 'English Grammar'],
    weaknesses: ['Time Management in Long Answer Exams'],
    trend: 'improving'
  },
  {
    id: 'ST-005',
    rollNo: '105',
    name: 'Tariq Islam',
    class: 'Class 9',
    section: 'B',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    math: 38,
    physics: 44,
    science: 50,
    english: 54,
    ict: 60,
    totalMarks: 246,
    percentage: 49.2,
    gpa: 2.0,
    grade: 'C',
    attendance: 72,
    status: 'At-Risk',
    strengths: ['Hands-on Lab Experiments'],
    weaknesses: ['Formula Memorization', 'Physics Numerical Calculations'],
    trend: 'declining'
  },
  {
    id: 'ST-006',
    rollNo: '106',
    name: 'Sadia Rahman',
    class: 'Class 8',
    section: 'A',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    math: 94,
    physics: 90,
    science: 92,
    english: 89,
    ict: 96,
    totalMarks: 461,
    percentage: 92.2,
    gpa: 5.0,
    grade: 'A+',
    attendance: 100,
    status: 'Distinction',
    strengths: ['Geometry', 'Science Projects', 'Speed & Accuracy'],
    weaknesses: ['Needs advanced Olympiad level problems'],
    trend: 'stable'
  },
  {
    id: 'ST-007',
    rollNo: '107',
    name: 'Tanvir Hossain',
    class: 'Class 10',
    section: 'A',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
    math: 68,
    physics: 72,
    science: 76,
    english: 74,
    ict: 80,
    totalMarks: 370,
    percentage: 74.0,
    gpa: 4.0,
    grade: 'A',
    attendance: 88,
    status: 'Good Standing',
    strengths: ['Statistics', 'Physics Diagramming'],
    weaknesses: ['Organic Chemistry Concepts'],
    trend: 'stable'
  },
  {
    id: 'ST-008',
    rollNo: '108',
    name: 'Mehedi Hasan',
    class: 'Class 9',
    section: 'B',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
    math: 74,
    physics: 69,
    science: 75,
    english: 70,
    ict: 82,
    totalMarks: 370,
    percentage: 74.0,
    gpa: 3.8,
    grade: 'A-',
    attendance: 90,
    status: 'Good Standing',
    strengths: ['ICT Coding', 'Algebra'],
    weaknesses: ['Physics Laws deduction'],
    trend: 'improving'
  }
];

// Grade distribution dataset
const GRADE_DISTRIBUTION_DATA = [
  { grade: 'A+ (80-100%)', count: 28, percentage: 23.3, color: '#10b981', point: 5.0 },
  { grade: 'A (70-79%)', count: 42, percentage: 35.0, color: '#3b82f6', point: 4.0 },
  { grade: 'A- (60-69%)', count: 26, percentage: 21.7, color: '#6366f1', point: 3.5 },
  { grade: 'B (50-59%)', count: 14, percentage: 11.7, color: '#f59e0b', point: 3.0 },
  { grade: 'C (40-49%)', count: 6, percentage: 5.0, color: '#ec4899', point: 2.0 },
  { grade: 'D (33-39%)', count: 3, percentage: 2.5, color: '#f97316', point: 1.0 },
  { grade: 'F (<33%)', count: 1, percentage: 0.8, color: '#ef4444', point: 0.0 },
];

// Subject specific performance dataset
const SUBJECT_METRICS_DATA = [
  { subject: 'Mathematics', classAvg: 76.8, topScore: 98, passRate: 92, target: 80, failingCount: 4 },
  { subject: 'Physics', classAvg: 74.2, topScore: 96, passRate: 90, target: 75, failingCount: 5 },
  { subject: 'General Science', classAvg: 81.5, topScore: 99, passRate: 97, target: 80, failingCount: 1 },
  { subject: 'English 1st', classAvg: 78.0, topScore: 94, passRate: 95, target: 75, failingCount: 2 },
  { subject: 'ICT / Computer', classAvg: 86.4, topScore: 100, passRate: 98, target: 85, failingCount: 1 },
];

// Term progression trend dataset
const TERM_PROGRESSION_DATA = [
  { term: 'Diagnostic Test', classAvg: 68.2, top10Avg: 88.5, bottom10Avg: 44.0, passRate: 84 },
  { term: 'Monthly Quiz 1', classAvg: 71.4, top10Avg: 90.2, bottom10Avg: 47.5, passRate: 87 },
  { term: 'Mid-Term Exam', classAvg: 75.8, top10Avg: 94.0, bottom10Avg: 51.2, passRate: 91 },
  { term: 'Monthly Quiz 2', classAvg: 77.2, top10Avg: 95.5, bottom10Avg: 54.0, passRate: 93 },
  { term: 'Pre-Annual Exam', classAvg: 79.6, top10Avg: 97.2, bottom10Avg: 58.6, passRate: 95 },
];

// Competency domain radar dataset
const COMPETENCY_RADAR_DATA = [
  { subject: 'Theoretical Concepts', classScore: 78, benchScore: 70, fullMark: 100 },
  { subject: 'Problem Solving & Math', classScore: 74, benchScore: 65, fullMark: 100 },
  { subject: 'MCQ & Speed Accuracy', classScore: 84, benchScore: 75, fullMark: 100 },
  { subject: 'Lab & Practical Rigor', classScore: 82, benchScore: 75, fullMark: 100 },
  { subject: 'Homework & Assignments', classScore: 88, benchScore: 80, fullMark: 100 },
  { subject: 'Exam Time Management', classScore: 71, benchScore: 68, fullMark: 100 },
];

// Section comparison dataset
const SECTION_COMPARISON_DATA = [
  { section: 'Class 10 - A (Math)', avgMarks: 79.4, passRate: 94.5, attendance: 95.2, topCount: 14 },
  { section: 'Class 9 - B (Physics)', avgMarks: 75.8, passRate: 91.2, attendance: 92.0, topCount: 9 },
  { section: 'Class 8 - A (Math)', avgMarks: 82.1, passRate: 96.8, attendance: 96.4, topCount: 12 },
];

export const StudentPerformanceAnalytics: React.FC = () => {
  const { showToast } = useToast();

  // Filters
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [selectedExam, setSelectedExam] = useState<string>('Mid-Term Exam 2025');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [gradeFilter, setGradeFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Active chart view toggle
  const [chartViewMode, setChartViewMode] = useState<'overview' | 'subject' | 'progression' | 'competency'>('overview');

  // Drilldown Modal
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<PerformanceStudent | null>(null);
  const [teacherNote, setTeacherNote] = useState<string>('');

  // Remedial action modal
  const [isRemedialModalOpen, setIsRemedialModalOpen] = useState(false);
  const [remedialTopic, setRemedialTopic] = useState('Quadratic Equations & Physics Vectors');
  const [remedialDate, setRemedialDate] = useState('2025-05-24');

  // Filtered Students List
  const filteredStudents = useMemo(() => {
    return INITIAL_STUDENTS_PERFORMANCE.filter(s => {
      const matchClass = selectedClass === 'All' || s.class.toLowerCase().includes(selectedClass.toLowerCase());
      const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.rollNo.includes(searchQuery) || 
                          s.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchGrade = gradeFilter === 'All' 
        ? true 
        : gradeFilter === 'A+' 
        ? s.grade === 'A+' 
        : gradeFilter === 'A'
        ? (s.grade === 'A' || s.grade === 'A-')
        : gradeFilter === 'At-Risk'
        ? (s.status === 'At-Risk' || s.status === 'Needs Support')
        : true;

      return matchClass && matchSearch && matchGrade;
    });
  }, [selectedClass, searchQuery, gradeFilter]);

  // Overall calculations
  const totalCount = filteredStudents.length;
  const avgPercentage = totalCount > 0 
    ? (filteredStudents.reduce((acc, curr) => acc + curr.percentage, 0) / totalCount).toFixed(1)
    : '0';
  const passCount = filteredStudents.filter(s => s.percentage >= 40).length;
  const passPercentage = totalCount > 0 ? ((passCount / totalCount) * 100).toFixed(1) : '100';
  const distinctionCount = filteredStudents.filter(s => s.grade === 'A+').length;
  const atRiskCount = filteredStudents.filter(s => s.status === 'At-Risk' || s.status === 'Needs Support').length;

  const handleExportCSV = () => {
    const headers = 'Roll,ID,Name,Class,Section,Math,Physics,Science,English,ICT,Total,Percentage,GPA,Grade,Attendance,Status\n';
    const rows = filteredStudents.map(s => 
      `${s.rollNo},${s.id},"${s.name}",${s.class},${s.section},${s.math},${s.physics},${s.science},${s.english},${s.ict},${s.totalMarks},${s.percentage}%,${s.gpa},${s.grade},${s.attendance}%,${s.status}`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Student_Performance_${selectedClass.replace(/\s+/g, '_')}_${selectedExam.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Student performance grade sheet exported to CSV!', 'success');
  };

  const handleSendRemedialNotification = (e: React.FormEvent) => {
    e.preventDefault();
    setIsRemedialModalOpen(false);
    showToast(`Remedial clinic invite for "${remedialTopic}" dispatched to ${atRiskCount} parents via SMS & Portal!`, 'success');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Control Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <BarChart2 size={20} />
              </span>
              <h3 className="text-xl font-bold text-slate-900">Class Performance Analytics & Grading Trends</h3>
              <Badge color="blue" className="hidden sm:inline-flex">Live Recharts Engine</Badge>
            </div>
            <p className="text-xs text-slate-500">
              Interactive academic diagnostics, grade distributions, and subject-specific outcome tracking across all assigned sections.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button 
              variant="outline" 
              icon={FileSpreadsheet} 
              className="text-xs h-9 text-slate-700" 
              onClick={handleExportCSV}
            >
              Export CSV
            </Button>
            <Button 
              variant="outline" 
              icon={Printer} 
              className="text-xs h-9 text-slate-700" 
              onClick={() => window.print()}
            >
              Print Report
            </Button>
            <Button 
              variant="primary" 
              icon={Sparkles} 
              className="text-xs h-9 bg-indigo-600 hover:bg-indigo-700 text-white" 
              onClick={() => setIsRemedialModalOpen(true)}
            >
              Schedule Remedial Class
            </Button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-600 mb-1">Select Target Class</label>
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="All">All Classes (10-A, 9-B, 8-A)</option>
              <option value="Class 10">Class 10 - Section A (Math/Phys)</option>
              <option value="Class 9">Class 9 - Section B (Physics)</option>
              <option value="Class 8">Class 8 - Section A (General Math)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Examination Term</label>
            <select
              value={selectedExam}
              onChange={e => setSelectedExam(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="Mid-Term Exam 2025">Term 1 Mid-Term Exam 2025</option>
              <option value="Monthly Assessment">Monthly Quiz Series (April)</option>
              <option value="Annual Exam 2024">Annual Final Exam 2024</option>
              <option value="Unit 4 Practice">Unit 4 Special Diagnostic</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Subject Scope</label>
            <select
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="All">All Subjects (Aggregated)</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="General Science">General Science</option>
              <option value="English">English 1st Paper</option>
              <option value="ICT">ICT / Computer Science</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 mb-1">Performance Tier</label>
            <select
              value={gradeFilter}
              onChange={e => setGradeFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="All">All Tiers ({totalCount} Students)</option>
              <option value="A+">Distinction: A+ / GPA 5.0</option>
              <option value="A">High Achievers: A / A-</option>
              <option value="At-Risk">⚠️ At-Risk / Needs Support</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Performance Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-indigo-500 bg-white hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Class Average</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-bold text-slate-800">{avgPercentage}%</h3>
                <span className="text-xs font-bold text-emerald-600 flex items-center">
                  <TrendingUp size={12} className="mr-0.5" /> +3.8%
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">GPA 4.12 out of 5.0</p>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Award size={22} />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-emerald-500 bg-white hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pass Rate</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-bold text-slate-800">{passPercentage}%</h3>
                <Badge color="green" className="text-[10px] px-1.5 py-0.5">Optimal</Badge>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">{passCount} of {totalCount} students cleared</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 size={22} />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-amber-500 bg-white hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">A+ Achievers (GPA 5)</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-bold text-slate-800">{distinctionCount}</h3>
                <span className="text-xs font-semibold text-amber-600">
                  ({((distinctionCount / Math.max(totalCount, 1)) * 100).toFixed(0)}%)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Eligible for merit certificate</p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Sparkles size={22} />
            </div>
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-rose-500 bg-white hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Needs Support</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-bold text-slate-800">{atRiskCount}</h3>
                {atRiskCount > 0 && (
                  <Badge color="red" className="text-[10px] px-1.5 py-0.5 animate-pulse">Follow-up</Badge>
                )}
              </div>
              <button 
                onClick={() => setGradeFilter('At-Risk')}
                className="text-[11px] font-bold text-rose-600 hover:underline mt-1 block"
              >
                View At-Risk Students →
              </button>
            </div>
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
              <AlertTriangle size={22} />
            </div>
          </div>
        </Card>
      </div>

      {/* Chart Visualizer Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setChartViewMode('overview')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            chartViewMode === 'overview'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BarChart2 size={15} /> Grade Distribution & Spread
        </button>

        <button
          onClick={() => setChartViewMode('subject')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            chartViewMode === 'subject'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <BookOpen size={15} /> Subject-Specific Metrics
        </button>

        <button
          onClick={() => setChartViewMode('progression')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            chartViewMode === 'progression'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <TrendingUp size={15} /> Term-over-Term Progression
        </button>

        <button
          onClick={() => setChartViewMode('competency')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            chartViewMode === 'competency'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Activity size={15} /> Competency & Skill Radar
        </button>
      </div>

      {/* Main Charts Dynamic Area */}
      {chartViewMode === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Grade Distribution BarChart */}
          <div className="lg:col-span-2">
            <Card 
              title="Class-Wide Grade Spread & Student Distribution" 
              action={<span className="text-xs text-slate-400 font-normal">Based on 120 Total Exam Results</span>}
            >
              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={GRADE_DISTRIBUTION_DATA} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="grade" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} label={{ value: 'Students', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs border border-slate-800">
                              <p className="font-bold text-sm text-indigo-300">{label}</p>
                              <div className="mt-1 space-y-1">
                                <p className="flex justify-between gap-4">
                                  <span className="text-slate-400">Student Count:</span>
                                  <span className="font-bold text-white">{data.count}</span>
                                </p>
                                <p className="flex justify-between gap-4">
                                  <span className="text-slate-400">Class Percentage:</span>
                                  <span className="font-bold text-emerald-400">{data.percentage}%</span>
                                </p>
                                <p className="flex justify-between gap-4">
                                  <span className="text-slate-400">Grade Point:</span>
                                  <span className="font-bold text-amber-400">{data.point.toFixed(1)} / 5.0</span>
                                </p>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <ReferenceLine y={20} stroke="#94a3b8" strokeDasharray="3 3" label={{ value: 'Average Tier Target', fill: '#94a3b8', fontSize: 10 }} />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {GRADE_DISTRIBUTION_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span>
                    <span className="text-slate-600 font-medium">A+ (GPA 5.0)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-blue-500 inline-block"></span>
                    <span className="text-slate-600 font-medium">A (GPA 4.0)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-amber-500 inline-block"></span>
                    <span className="text-slate-600 font-medium">B (Passing)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-rose-500 inline-block"></span>
                    <span className="text-slate-600 font-medium">Below C (Support)</span>
                  </div>
                </div>
                <span className="text-slate-400">Benchmark: 80% passing at Grade B+ or above</span>
              </div>
            </Card>
          </div>

          {/* Section Benchmarking Mini Breakdown */}
          <div>
            <Card title="Section vs Section Benchmark">
              <div className="space-y-4">
                {SECTION_COMPARISON_DATA.map((sec, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-slate-800 text-xs">{sec.section}</h4>
                      <Badge color="blue">{sec.avgMarks}% Avg</Badge>
                    </div>
                    <div className="space-y-2 text-[11px]">
                      <div>
                        <div className="flex justify-between text-slate-500 mb-0.5">
                          <span>Pass Rate</span>
                          <span className="font-bold text-emerald-600">{sec.passRate}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${sec.passRate}%` }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-slate-500 mb-0.5">
                          <span>Attendance Consistency</span>
                          <span className="font-bold text-indigo-600">{sec.attendance}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${sec.attendance}%` }}></div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-slate-200 flex justify-between text-[11px] text-slate-500">
                      <span>GPA 5.0 Cadre:</span>
                      <span className="font-bold text-slate-800">{sec.topCount} Students</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {chartViewMode === 'subject' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Subject Metric Comparison Composed Chart */}
          <div className="lg:col-span-2">
            <Card title="Subject-Specific Performance & Pass Rate Comparison">
              <div className="h-80 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={SUBJECT_METRICS_DATA} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 100]} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#64748b' }} domain={[70, 100]} unit="%" />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs border border-slate-800">
                              <p className="font-bold text-sm text-indigo-300">{label}</p>
                              <div className="mt-2 space-y-1">
                                <p className="flex justify-between gap-4">
                                  <span className="text-slate-400">Class Average:</span>
                                  <span className="font-bold text-white">{data.classAvg}%</span>
                                </p>
                                <p className="flex justify-between gap-4">
                                  <span className="text-slate-400">Highest Score:</span>
                                  <span className="font-bold text-emerald-400">{data.topScore} / 100</span>
                                </p>
                                <p className="flex justify-between gap-4">
                                  <span className="text-slate-400">Pass Rate:</span>
                                  <span className="font-bold text-cyan-400">{data.passRate}%</span>
                                </p>
                                <p className="flex justify-between gap-4">
                                  <span className="text-slate-400">Department Target:</span>
                                  <span className="font-bold text-amber-400">{data.target}%</span>
                                </p>
                                <p className="flex justify-between gap-4">
                                  <span className="text-slate-400">Below Passing Marks:</span>
                                  <span className="font-bold text-rose-400">{data.failingCount} students</span>
                                </p>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                    <Bar yAxisId="left" dataKey="classAvg" name="Class Avg Marks %" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={28} />
                    <Bar yAxisId="left" dataKey="target" name="Target Benchmark %" fill="#cbd5e1" radius={[6, 6, 0, 0]} barSize={28} />
                    <Line yAxisId="right" type="monotone" dataKey="passRate" name="Pass Rate %" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Subject Insights Breakdown */}
          <div>
            <Card title="Subject Diagnostic Insights">
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <h5 className="font-bold text-xs text-emerald-900">ICT & Science Excellence</h5>
                  </div>
                  <p className="text-xs text-slate-600">
                    Highest performance across all sections. 98% pass rate in practical computer labs with 14 perfect scores.
                  </p>
                </div>

                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle size={16} className="text-amber-600" />
                    <h5 className="font-bold text-xs text-amber-900">Physics Lab vs Theory Gap</h5>
                  </div>
                  <p className="text-xs text-slate-600">
                    Theoretical Kinematics & Wave Optics scores lag practical marks by 14.2%. Needs extra concept clarification.
                  </p>
                </div>

                <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp size={16} className="text-indigo-600" />
                    <h5 className="font-bold text-xs text-indigo-900">Math Quadratic Equations</h5>
                  </div>
                  <p className="text-xs text-slate-600">
                    Average improved from 71.2% to 76.8% following the chapter revision worksheets published last week.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {chartViewMode === 'progression' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Term-over-Term AreaChart */}
          <div className="lg:col-span-2">
            <Card title="Academic Trajectory: Term-over-Term Progression">
              <div className="h-80 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={TERM_PROGRESSION_DATA} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                    <defs>
                      <linearGradient id="top10Grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="classAvgGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="bottom10Grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="term" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis domain={[30, 100]} tick={{ fontSize: 11, fill: '#64748b' }} unit="%" />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs border border-slate-800">
                              <p className="font-bold text-sm text-indigo-300">{label}</p>
                              <div className="mt-2 space-y-1">
                                <p className="flex justify-between gap-4 text-emerald-400">
                                  <span>Top 10% Average:</span>
                                  <span className="font-bold">{data.top10Avg}%</span>
                                </p>
                                <p className="flex justify-between gap-4 text-indigo-300">
                                  <span>Class Average:</span>
                                  <span className="font-bold">{data.classAvg}%</span>
                                </p>
                                <p className="flex justify-between gap-4 text-amber-400">
                                  <span>Lower 10% Cohort:</span>
                                  <span className="font-bold">{data.bottom10Avg}%</span>
                                </p>
                                <p className="flex justify-between gap-4 text-cyan-300 border-t border-slate-800 pt-1">
                                  <span>Overall Pass Rate:</span>
                                  <span className="font-bold">{data.passRate}%</span>
                                </p>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                    <Area type="monotone" dataKey="top10Avg" name="Top 10% Cohort Avg" stroke="#10b981" fillOpacity={1} fill="url(#top10Grad)" strokeWidth={2} />
                    <Area type="monotone" dataKey="classAvg" name="Class Mean Score %" stroke="#6366f1" fillOpacity={1} fill="url(#classAvgGrad)" strokeWidth={3} />
                    <Area type="monotone" dataKey="bottom10Avg" name="Lower 10% Cohort Avg" stroke="#f59e0b" fillOpacity={1} fill="url(#bottom10Grad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Growth Summary */}
          <div>
            <Card title="Cohort Growth Summary">
              <div className="space-y-4">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-xs text-slate-500 font-medium">Cumulative Mean Gain</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <h4 className="text-2xl font-bold text-slate-800">+11.4%</h4>
                    <span className="text-xs font-bold text-emerald-600">Since Diagnostic Exam</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Baseline: 68.2% → Current: 79.6%</p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-xs text-slate-500 font-medium">Lower Decile Recovery</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <h4 className="text-2xl font-bold text-slate-800">+14.6%</h4>
                    <span className="text-xs font-bold text-indigo-600">Targeted Remedials</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Bottom tier shifted from 44.0% to 58.6%</p>
                </div>

                <Button 
                  className="w-full text-xs h-9" 
                  variant="outline"
                  icon={Download}
                  onClick={() => showToast('Full term progression audit log prepared.', 'info')}
                >
                  Download Cohort Audit
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {chartViewMode === 'competency' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar Chart for Competencies */}
          <Card title="Multi-Dimensional Competency & Learning Domain Radar">
            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius={90} data={COMPETENCY_RADAR_DATA}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                  <Radar name="Class Score %" dataKey="classScore" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                  <Radar name="National Benchmark %" dataKey="benchScore" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.2} strokeDasharray="3 3" />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs border border-slate-800">
                            <p className="font-bold text-sm text-indigo-300">{data.subject}</p>
                            <div className="mt-2 space-y-1">
                              <p className="flex justify-between gap-4">
                                <span className="text-slate-400">Class Proficiency:</span>
                                <span className="font-bold text-indigo-400">{data.classScore}%</span>
                              </p>
                              <p className="flex justify-between gap-4">
                                <span className="text-slate-400">Board Benchmark:</span>
                                <span className="font-bold text-slate-300">{data.benchScore}%</span>
                              </p>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Competency Action Plan */}
          <Card title="Skill Domain Focus Points">
            <div className="space-y-3 text-xs">
              <div className="p-3 border border-slate-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Homework & Regularity: 88%</span>
                  <Badge color="green">Top Strength</Badge>
                </div>
                <p className="text-slate-500">
                  Submissions and practice worksheets show highest compliance. Continue weekly quizzes to maintain cadence.
                </p>
              </div>

              <div className="p-3 border border-slate-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Exam Time Management: 71%</span>
                  <Badge color="yellow">Key Growth Area</Badge>
                </div>
                <p className="text-slate-500">
                  Students struggle to finish Section C 10-mark problems within the 2.5 hour window. Plan mock speed drills.
                </p>
              </div>

              <div className="p-3 border border-slate-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Problem Solving & Proofs: 74%</span>
                  <Badge color="blue">Moderate</Badge>
                </div>
                <p className="text-slate-500">
                  Step-by-step mathematical reasoning needs reinforcement in Trigonometry and Geometric proofs.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Student Roster & Individual Marks Table */}
      <Card 
        title="Student Marks Breakdown & Individual Performance" 
        action={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search student or roll..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 w-44 sm:w-56"
              />
            </div>
          </div>
        }
      >
        <div className="overflow-x-auto -mx-6">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-slate-500 uppercase tracking-wider">Student</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-500 uppercase tracking-wider">Class</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-500 uppercase tracking-wider">Math</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-500 uppercase tracking-wider">Physics</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-500 uppercase tracking-wider">Science</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-500 uppercase tracking-wider">English</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-500 uppercase tracking-wider">ICT</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-500 uppercase tracking-wider">Total / %</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-500 uppercase tracking-wider">GPA & Grade</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right font-semibold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filteredStudents.length > 0 ? (
                filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-6 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                          {student.photo ? (
                            <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
                          ) : (
                            (student?.name || 'S').charAt(0)
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-sm">{student.name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">Roll: #{student.rollNo} • {student.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center whitespace-nowrap font-medium text-slate-700">
                      {student.class} - {student.section}
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono font-bold whitespace-nowrap">
                      <span className={student.math >= 80 ? 'text-emerald-600' : student.math < 50 ? 'text-rose-600' : 'text-slate-800'}>
                        {student.math}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono font-bold whitespace-nowrap">
                      <span className={student.physics >= 80 ? 'text-emerald-600' : student.physics < 50 ? 'text-rose-600' : 'text-slate-800'}>
                        {student.physics}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono font-bold whitespace-nowrap">
                      <span className={student.science >= 80 ? 'text-emerald-600' : student.science < 50 ? 'text-rose-600' : 'text-slate-800'}>
                        {student.science}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono font-bold whitespace-nowrap">
                      <span className={student.english >= 80 ? 'text-emerald-600' : student.english < 50 ? 'text-rose-600' : 'text-slate-800'}>
                        {student.english}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center font-mono font-bold whitespace-nowrap">
                      <span className={student.ict >= 80 ? 'text-emerald-600' : student.ict < 50 ? 'text-rose-600' : 'text-slate-800'}>
                        {student.ict}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <div className="font-bold text-slate-800">{student.percentage}%</div>
                      <div className="text-[10px] text-slate-400 font-mono">{student.totalMarks}/500</div>
                    </td>
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <Badge 
                        color={student.grade === 'A+' ? 'green' : student.grade === 'A' ? 'blue' : student.grade === 'B' ? 'yellow' : 'red'}
                      >
                        {student.grade} ({student.gpa.toFixed(1)})
                      </Badge>
                    </td>
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        student.status === 'Distinction'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : student.status === 'Good Standing'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : student.status === 'Needs Support'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right whitespace-nowrap">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="text-xs h-7 px-2.5"
                        icon={Eye}
                        onClick={() => {
                          setSelectedStudentForDetail(student);
                          setTeacherNote('');
                        }}
                      >
                        Analytics
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={11} className="text-center py-8 text-slate-400">
                    No students match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal: Individual Student Deep Dive Analytics */}
      <Modal
        isOpen={!!selectedStudentForDetail}
        onClose={() => setSelectedStudentForDetail(null)}
        title={selectedStudentForDetail ? `Performance Profile: ${selectedStudentForDetail.name}` : 'Student Profile'}
      >
        {selectedStudentForDetail && (
          <div className="space-y-5 text-xs">
            {/* Header info */}
            <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg overflow-hidden shrink-0">
                  {selectedStudentForDetail.photo ? (
                    <img src={selectedStudentForDetail.photo} alt="" className="w-full h-full object-cover" />
                  ) : (
                    (selectedStudentForDetail?.name || 'S').charAt(0)
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">{selectedStudentForDetail.name}</h4>
                  <p className="text-slate-500 font-medium">
                    Roll #{selectedStudentForDetail.rollNo} • {selectedStudentForDetail.class} - Sec {selectedStudentForDetail.section}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge color={selectedStudentForDetail.grade === 'A+' ? 'green' : selectedStudentForDetail.grade === 'A' ? 'blue' : 'yellow'}>
                  Grade {selectedStudentForDetail.grade} • GPA {selectedStudentForDetail.gpa}
                </Badge>
                <p className="text-[11px] text-slate-400 mt-1">Attendance: {selectedStudentForDetail.attendance}%</p>
              </div>
            </div>

            {/* Subject Marks Breakdown */}
            <div>
              <h5 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] mb-2">Subject Scores & Mastery</h5>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-center">
                  <span className="text-slate-500 text-[10px]">Mathematics</span>
                  <p className="text-lg font-bold text-indigo-600 font-mono mt-0.5">{selectedStudentForDetail.math}</p>
                  <span className="text-[10px] text-slate-400">/ 100</span>
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-center">
                  <span className="text-slate-500 text-[10px]">Physics</span>
                  <p className="text-lg font-bold text-indigo-600 font-mono mt-0.5">{selectedStudentForDetail.physics}</p>
                  <span className="text-[10px] text-slate-400">/ 100</span>
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-center">
                  <span className="text-slate-500 text-[10px]">General Science</span>
                  <p className="text-lg font-bold text-indigo-600 font-mono mt-0.5">{selectedStudentForDetail.science}</p>
                  <span className="text-[10px] text-slate-400">/ 100</span>
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-center">
                  <span className="text-slate-500 text-[10px]">English 1st</span>
                  <p className="text-lg font-bold text-indigo-600 font-mono mt-0.5">{selectedStudentForDetail.english}</p>
                  <span className="text-[10px] text-slate-400">/ 100</span>
                </div>
                <div className="p-2.5 bg-white border border-slate-200 rounded-lg text-center">
                  <span className="text-slate-500 text-[10px]">ICT / Computer</span>
                  <p className="text-lg font-bold text-indigo-600 font-mono mt-0.5">{selectedStudentForDetail.ict}</p>
                  <span className="text-[10px] text-slate-400">/ 100</span>
                </div>
              </div>
            </div>

            {/* Strengths & Weaknesses Tagger */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl">
                <h6 className="font-bold text-emerald-900 mb-1.5 flex items-center gap-1">
                  <CheckCircle2 size={13} className="text-emerald-600" /> Key Strengths
                </h6>
                <div className="flex flex-wrap gap-1">
                  {selectedStudentForDetail.strengths.map((str, i) => (
                    <span key={i} className="px-2 py-0.5 bg-emerald-100/80 text-emerald-800 rounded font-medium text-[11px]">
                      {str}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-rose-50/60 border border-rose-200 rounded-xl">
                <h6 className="font-bold text-rose-900 mb-1.5 flex items-center gap-1">
                  <AlertTriangle size={13} className="text-rose-600" /> Improvement Areas
                </h6>
                <div className="flex flex-wrap gap-1">
                  {selectedStudentForDetail.weaknesses.map((wk, i) => (
                    <span key={i} className="px-2 py-0.5 bg-rose-100/80 text-rose-800 rounded font-medium text-[11px]">
                      {wk}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Teacher Feedback / Action */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Teacher Diagnostic Remarks</label>
              <textarea
                value={teacherNote}
                onChange={e => setTeacherNote(e.target.value)}
                placeholder="Add personalized recommendation or encouragement note for the report card..."
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs h-20 resize-none"
              ></textarea>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <Button 
                variant="outline" 
                icon={Send} 
                onClick={() => {
                  showToast(`Progress update SMS sent to guardian of ${selectedStudentForDetail.name}`, 'success');
                  setSelectedStudentForDetail(null);
                }}
              >
                Send SMS to Guardian
              </Button>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setSelectedStudentForDetail(null)}>Close</Button>
                <Button 
                  onClick={() => {
                    showToast('Remarks saved and synced to student report card!', 'success');
                    setSelectedStudentForDetail(null);
                  }}
                >
                  Save Remarks
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal: Schedule Remedial Class */}
      <Modal
        isOpen={isRemedialModalOpen}
        onClose={() => setIsRemedialModalOpen(false)}
        title="Schedule Targeted Remedial Workshop"
      >
        <form onSubmit={handleSendRemedialNotification} className="space-y-4 text-xs">
          <p className="text-slate-500">
            Automatically invite students scoring under 60% in targeted topics for an after-school booster session.
          </p>

          <Input
            label="Workshop Topic & Chapter"
            value={remedialTopic}
            onChange={e => setRemedialTopic(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Session Date"
              type="date"
              value={remedialDate}
              onChange={e => setRemedialDate(e.target.value)}
              required
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Target Cohort</label>
              <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white">
                <option>At-Risk Students ({atRiskCount} Students)</option>
                <option>All Class 10 Students</option>
                <option>Open Voluntary Attendance</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-slate-600">
            <p className="font-semibold text-indigo-900 mb-1">Automatic Parent Notification</p>
            <p>
              An automated notification with the date, room location (Room 201), and practice problem sheet will be sent to enrolled student portals.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setIsRemedialModalOpen(false)}>Cancel</Button>
            <Button type="submit" icon={Send}>Broadcast Invitation</Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
