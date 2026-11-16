import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart
} from 'recharts';
import {
  TrendingUp,
  Award,
  AlertTriangle,
  Users,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Search,
  Filter,
  Printer,
  Download,
  Mail,
  Send,
  Sparkles,
  ChevronRight,
  UserCheck,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  BarChart2,
  PieChart as PieIcon,
  Activity,
  Layers,
  Phone,
  FileText,
  SlidersHorizontal,
  GraduationCap,
  Scale,
  TrendingDown,
  Minus,
  ToggleLeft,
  ToggleRight,
  Target,
  Bookmark,
  History,
  ListFilter,
  ChevronDown,
  Check,
  Edit3,
  Trash2,
  Plus,
  Crosshair,
  Flame,
  Zap,
  CheckCheck,
  Flag
} from 'lucide-react';
import { MOCK_STUDENTS } from '../constants';
import { Card, Button, Badge, Modal, Input, useToast } from './UIComponents';
import { exportStudentProgressReportToPDF, PDFExportOptions } from '../utils/pdfExport';

// --- DATA STRUCTURES ---
export interface TermProgressPoint {
  term: string;
  testDate: string;
  studentScore: number;
  classAverage: number;
  grade: string;
  gpa: number;
}

export interface SubjectPerformance {
  subject: string;
  code: string;
  obtained: number;
  total: number;
  percentage: number;
  grade: string;
  gpa: number;
  classAverage: number;
  competencyScore: number; // 0-100
}

export interface MonthlyAttendance {
  month: string;
  presentDays: number;
  totalDays: number;
  percentage: number;
  lateDays: number;
  leaveDays: number;
  absentDays: number;
  avgExamScore: number;
}

export interface WeekdayAttendance {
  day: string;
  percentage: number;
  status: string;
}

export interface DetailedStudentProgress {
  id: string;
  rollNo: string;
  name: string;
  class: string;
  section: string;
  guardian: string;
  guardianPhone: string;
  imageUrl?: string;
  academicStanding: 'Distinction' | 'Good Standing' | 'Needs Support' | 'At-Risk';
  attendanceStatus: 'Exemplary' | 'Regular' | 'Warning' | 'Critical';
  cumulativeGPA: number;
  overallPercentage: number;
  totalAttendancePercentage: number;
  classRank: number;
  totalStudentsInClass: number;
  percentile: number;
  termProgress: TermProgressPoint[];
  subjects: SubjectPerformance[];
  monthlyAttendance: MonthlyAttendance[];
  weekdayAttendance: WeekdayAttendance[];
  strengths: string[];
  growthAreas: string[];
  adminNotes: string;
  competencyRadar: {
    skill: string;
    student: number;
    benchmark: number;
  }[];
}

// --- RICH MOCK DATASET FOR INDIVIDUAL STUDENTS ---
const STUDENT_PROGRESS_DATABASE: Record<string, DetailedStudentProgress> = {
  'ST-2024-001': {
    id: 'ST-2024-001',
    rollNo: '101',
    name: 'Rahim Ahmed',
    class: 'Class 10',
    section: 'A',
    guardian: 'Karim Ahmed',
    guardianPhone: '01711111111',
    imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&h=200&fit=crop',
    academicStanding: 'Distinction',
    attendanceStatus: 'Exemplary',
    cumulativeGPA: 5.0,
    overallPercentage: 91.8,
    totalAttendancePercentage: 97.5,
    classRank: 1,
    totalStudentsInClass: 45,
    percentile: 98.5,
    strengths: ['Advanced Mathematics', 'Physics Mechanics', 'Algorithm Design', 'Analytical Rigor'],
    growthAreas: ['Creative English Composition', 'Public Presentation'],
    adminNotes: 'Candidate for National Science Olympiad scholarship. Consistent top performer across all assessment cycles with zero unexcused absences.',
    termProgress: [
      { term: 'Jan Test', testDate: '2024-01-20', studentScore: 88, classAverage: 67, grade: 'A+', gpa: 5.0 },
      { term: 'Feb Test', testDate: '2024-02-18', studentScore: 90, classAverage: 69, grade: 'A+', gpa: 5.0 },
      { term: 'Term 1 Mid', testDate: '2024-03-25', studentScore: 93, classAverage: 71, grade: 'A+', gpa: 5.0 },
      { term: 'Term 1 Final', testDate: '2024-04-28', studentScore: 92, classAverage: 70, grade: 'A+', gpa: 5.0 },
      { term: 'May Test', testDate: '2024-05-22', studentScore: 94, classAverage: 72, grade: 'A+', gpa: 5.0 },
      { term: 'Term 2 Mid', testDate: '2024-07-15', studentScore: 91, classAverage: 70, grade: 'A+', gpa: 5.0 },
      { term: 'Term 2 Final', testDate: '2024-08-30', studentScore: 93, classAverage: 73, grade: 'A+', gpa: 5.0 },
      { term: 'Pre-Board', testDate: '2024-10-20', studentScore: 95, classAverage: 74, grade: 'A+', gpa: 5.0 }
    ],
    subjects: [
      { subject: 'Higher Mathematics', code: 'HMATH-101', obtained: 96, total: 100, percentage: 96, grade: 'A+', gpa: 5.0, classAverage: 72, competencyScore: 98 },
      { subject: 'Physics', code: 'PHY-102', obtained: 92, total: 100, percentage: 92, grade: 'A+', gpa: 5.0, classAverage: 68, competencyScore: 94 },
      { subject: 'Chemistry', code: 'CHEM-103', obtained: 89, total: 100, percentage: 89, grade: 'A+', gpa: 5.0, classAverage: 71, competencyScore: 90 },
      { subject: 'English Language', code: 'ENG-104', obtained: 86, total: 100, percentage: 86, grade: 'A+', gpa: 5.0, classAverage: 75, competencyScore: 84 },
      { subject: 'Information Tech (ICT)', code: 'ICT-105', obtained: 98, total: 100, percentage: 98, grade: 'A+', gpa: 5.0, classAverage: 79, competencyScore: 99 },
      { subject: 'Bangladesh & Global Studies', code: 'BGS-106', obtained: 90, total: 100, percentage: 90, grade: 'A+', gpa: 5.0, classAverage: 74, competencyScore: 88 }
    ],
    monthlyAttendance: [
      { month: 'Jan', presentDays: 21, totalDays: 22, percentage: 95.5, lateDays: 1, leaveDays: 1, absentDays: 0, avgExamScore: 88 },
      { month: 'Feb', presentDays: 19, totalDays: 20, percentage: 95.0, lateDays: 0, leaveDays: 1, absentDays: 0, avgExamScore: 90 },
      { month: 'Mar', presentDays: 22, totalDays: 22, percentage: 100.0, lateDays: 0, leaveDays: 0, absentDays: 0, avgExamScore: 93 },
      { month: 'Apr', presentDays: 20, totalDays: 21, percentage: 95.2, lateDays: 1, leaveDays: 1, absentDays: 0, avgExamScore: 92 },
      { month: 'May', presentDays: 23, totalDays: 23, percentage: 100.0, lateDays: 0, leaveDays: 0, absentDays: 0, avgExamScore: 94 },
      { month: 'Jun', presentDays: 18, totalDays: 19, percentage: 94.7, lateDays: 1, leaveDays: 1, absentDays: 0, avgExamScore: 91 },
      { month: 'Jul', presentDays: 22, totalDays: 22, percentage: 100.0, lateDays: 0, leaveDays: 0, absentDays: 0, avgExamScore: 91 },
      { month: 'Aug', presentDays: 21, totalDays: 22, percentage: 95.5, lateDays: 0, leaveDays: 1, absentDays: 0, avgExamScore: 93 },
      { month: 'Sep', presentDays: 22, totalDays: 22, percentage: 100.0, lateDays: 0, leaveDays: 0, absentDays: 0, avgExamScore: 94 },
      { month: 'Oct', presentDays: 21, totalDays: 21, percentage: 100.0, lateDays: 0, leaveDays: 0, absentDays: 0, avgExamScore: 95 }
    ],
    weekdayAttendance: [
      { day: 'Sunday', percentage: 98.0, status: 'Optimal' },
      { day: 'Monday', percentage: 99.0, status: 'Optimal' },
      { day: 'Tuesday', percentage: 97.0, status: 'Optimal' },
      { day: 'Wednesday', percentage: 96.5, status: 'Optimal' },
      { day: 'Thursday', percentage: 97.0, status: 'Optimal' }
    ],
    competencyRadar: [
      { skill: 'Problem Solving', student: 98, benchmark: 70 },
      { skill: 'Theory Knowledge', student: 92, benchmark: 72 },
      { skill: 'Practical Lab Skills', student: 95, benchmark: 75 },
      { skill: 'Creative Writing', student: 84, benchmark: 76 },
      { skill: 'Punctuality & Presence', student: 98, benchmark: 80 },
      { skill: 'Collaborative Projects', student: 90, benchmark: 74 }
    ]
  },
  'ST-2024-002': {
    id: 'ST-2024-002',
    rollNo: '102',
    name: 'Fatima Begum',
    class: 'Class 10',
    section: 'A',
    guardian: 'Abdul Malik',
    guardianPhone: '01722222222',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    academicStanding: 'Good Standing',
    attendanceStatus: 'Regular',
    cumulativeGPA: 4.8,
    overallPercentage: 84.6,
    totalAttendancePercentage: 93.8,
    classRank: 5,
    totalStudentsInClass: 45,
    percentile: 89.2,
    strengths: ['English Literature', 'Biology & Ecology', 'Reading Comprehension', 'Neat Lab Notebooks'],
    growthAreas: ['Trigonometry Calculations', 'Physics Speed in Numericals'],
    adminNotes: 'Dedicated and conscientious student. Demonstrates solid academic work ethic with consistent 90%+ attendance.',
    termProgress: [
      { term: 'Jan Test', testDate: '2024-01-20', studentScore: 81, classAverage: 67, grade: 'A', gpa: 4.5 },
      { term: 'Feb Test', testDate: '2024-02-18', studentScore: 83, classAverage: 69, grade: 'A', gpa: 4.8 },
      { term: 'Term 1 Mid', testDate: '2024-03-25', studentScore: 85, classAverage: 71, grade: 'A', gpa: 4.8 },
      { term: 'Term 1 Final', testDate: '2024-04-28', studentScore: 84, classAverage: 70, grade: 'A', gpa: 4.8 },
      { term: 'May Test', testDate: '2024-05-22', studentScore: 86, classAverage: 72, grade: 'A', gpa: 5.0 },
      { term: 'Term 2 Mid', testDate: '2024-07-15', studentScore: 85, classAverage: 70, grade: 'A', gpa: 4.8 },
      { term: 'Term 2 Final', testDate: '2024-08-30', studentScore: 87, classAverage: 73, grade: 'A+', gpa: 5.0 },
      { term: 'Pre-Board', testDate: '2024-10-20', studentScore: 88, classAverage: 74, grade: 'A+', gpa: 5.0 }
    ],
    subjects: [
      { subject: 'Higher Mathematics', code: 'HMATH-101', obtained: 78, total: 100, percentage: 78, grade: 'A', gpa: 4.0, classAverage: 72, competencyScore: 78 },
      { subject: 'Physics', code: 'PHY-102', obtained: 82, total: 100, percentage: 82, grade: 'A+', gpa: 5.0, classAverage: 68, competencyScore: 84 },
      { subject: 'Chemistry', code: 'CHEM-103', obtained: 84, total: 100, percentage: 84, grade: 'A+', gpa: 5.0, classAverage: 71, competencyScore: 86 },
      { subject: 'English Language', code: 'ENG-104', obtained: 92, total: 100, percentage: 92, grade: 'A+', gpa: 5.0, classAverage: 75, competencyScore: 94 },
      { subject: 'Information Tech (ICT)', code: 'ICT-105', obtained: 86, total: 100, percentage: 86, grade: 'A+', gpa: 5.0, classAverage: 79, competencyScore: 88 },
      { subject: 'Bangladesh & Global Studies', code: 'BGS-106', obtained: 86, total: 100, percentage: 86, grade: 'A+', gpa: 5.0, classAverage: 74, competencyScore: 87 }
    ],
    monthlyAttendance: [
      { month: 'Jan', presentDays: 20, totalDays: 22, percentage: 90.9, lateDays: 1, leaveDays: 1, absentDays: 1, avgExamScore: 81 },
      { month: 'Feb', presentDays: 19, totalDays: 20, percentage: 95.0, lateDays: 0, leaveDays: 1, absentDays: 0, avgExamScore: 83 },
      { month: 'Mar', presentDays: 21, totalDays: 22, percentage: 95.5, lateDays: 1, leaveDays: 0, absentDays: 1, avgExamScore: 85 },
      { month: 'Apr', presentDays: 19, totalDays: 21, percentage: 90.5, lateDays: 2, leaveDays: 1, absentDays: 1, avgExamScore: 84 },
      { month: 'May', presentDays: 22, totalDays: 23, percentage: 95.7, lateDays: 0, leaveDays: 1, absentDays: 0, avgExamScore: 86 },
      { month: 'Jun', presentDays: 18, totalDays: 19, percentage: 94.7, lateDays: 1, leaveDays: 0, absentDays: 1, avgExamScore: 85 },
      { month: 'Jul', presentDays: 21, totalDays: 22, percentage: 95.5, lateDays: 0, leaveDays: 1, absentDays: 0, avgExamScore: 85 },
      { month: 'Aug', presentDays: 20, totalDays: 22, percentage: 90.9, lateDays: 2, leaveDays: 1, absentDays: 1, avgExamScore: 87 },
      { month: 'Sep', presentDays: 21, totalDays: 22, percentage: 95.5, lateDays: 1, leaveDays: 0, absentDays: 1, avgExamScore: 88 },
      { month: 'Oct', presentDays: 20, totalDays: 21, percentage: 95.2, lateDays: 0, leaveDays: 1, absentDays: 0, avgExamScore: 88 }
    ],
    weekdayAttendance: [
      { day: 'Sunday', percentage: 93.0, status: 'Normal' },
      { day: 'Monday', percentage: 95.0, status: 'Optimal' },
      { day: 'Tuesday', percentage: 94.0, status: 'Optimal' },
      { day: 'Wednesday', percentage: 96.0, status: 'Optimal' },
      { day: 'Thursday', percentage: 91.0, status: 'Slight Dip' }
    ],
    competencyRadar: [
      { skill: 'Problem Solving', student: 80, benchmark: 70 },
      { skill: 'Theory Knowledge', student: 88, benchmark: 72 },
      { skill: 'Practical Lab Skills', student: 86, benchmark: 75 },
      { skill: 'Creative Writing', student: 94, benchmark: 76 },
      { skill: 'Punctuality & Presence', student: 93, benchmark: 80 },
      { skill: 'Collaborative Projects', student: 89, benchmark: 74 }
    ]
  },
  'ST-2024-003': {
    id: 'ST-2024-003',
    rollNo: '103',
    name: 'Karim Ullah',
    class: 'Class 10',
    section: 'A',
    guardian: 'Rafiq Ullah',
    guardianPhone: '01711223344',
    imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop',
    academicStanding: 'Needs Support',
    attendanceStatus: 'Warning',
    cumulativeGPA: 3.1,
    overallPercentage: 58.4,
    totalAttendancePercentage: 76.2,
    classRank: 38,
    totalStudentsInClass: 45,
    percentile: 16.5,
    strengths: ['Hands-on Computer Lab Tasks', 'Visual Diagrams in Biology'],
    growthAreas: ['Quadratic Equations', 'Kinematics in Physics', 'Morning Class Attendance'],
    adminNotes: 'Attendance hovering close to the 75% institutional cutoff line. Regular absences on Thursdays. Academic performance shows correlation with missed class lectures.',
    termProgress: [
      { term: 'Jan Test', testDate: '2024-01-20', studentScore: 66, classAverage: 67, grade: 'A-', gpa: 3.5 },
      { term: 'Feb Test', testDate: '2024-02-18', studentScore: 62, classAverage: 69, grade: 'B', gpa: 3.0 },
      { term: 'Term 1 Mid', testDate: '2024-03-25', studentScore: 59, classAverage: 71, grade: 'B', gpa: 3.0 },
      { term: 'Term 1 Final', testDate: '2024-04-28', studentScore: 55, classAverage: 70, grade: 'B', gpa: 3.0 },
      { term: 'May Test', testDate: '2024-05-22', studentScore: 58, classAverage: 72, grade: 'B', gpa: 3.0 },
      { term: 'Term 2 Mid', testDate: '2024-07-15', studentScore: 54, classAverage: 70, grade: 'C', gpa: 2.0 },
      { term: 'Term 2 Final', testDate: '2024-08-30', studentScore: 57, classAverage: 73, grade: 'B', gpa: 3.0 },
      { term: 'Pre-Board', testDate: '2024-10-20', studentScore: 60, classAverage: 74, grade: 'B', gpa: 3.0 }
    ],
    subjects: [
      { subject: 'Higher Mathematics', code: 'HMATH-101', obtained: 48, total: 100, percentage: 48, grade: 'C', gpa: 2.0, classAverage: 72, competencyScore: 48 },
      { subject: 'Physics', code: 'PHY-102', obtained: 52, total: 100, percentage: 52, grade: 'B', gpa: 3.0, classAverage: 68, competencyScore: 50 },
      { subject: 'Chemistry', code: 'CHEM-103', obtained: 58, total: 100, percentage: 58, grade: 'B', gpa: 3.0, classAverage: 71, competencyScore: 57 },
      { subject: 'English Language', code: 'ENG-104', obtained: 62, total: 100, percentage: 62, grade: 'A-', gpa: 3.5, classAverage: 75, competencyScore: 62 },
      { subject: 'Information Tech (ICT)', code: 'ICT-105', obtained: 70, total: 100, percentage: 70, grade: 'A', gpa: 4.0, classAverage: 79, competencyScore: 72 },
      { subject: 'Bangladesh & Global Studies', code: 'BGS-106', obtained: 60, total: 100, percentage: 60, grade: 'A-', gpa: 3.5, classAverage: 74, competencyScore: 60 }
    ],
    monthlyAttendance: [
      { month: 'Jan', presentDays: 18, totalDays: 22, percentage: 81.8, lateDays: 2, leaveDays: 1, absentDays: 3, avgExamScore: 66 },
      { month: 'Feb', presentDays: 16, totalDays: 20, percentage: 80.0, lateDays: 3, leaveDays: 1, absentDays: 3, avgExamScore: 62 },
      { month: 'Mar', presentDays: 17, totalDays: 22, percentage: 77.2, lateDays: 2, leaveDays: 2, absentDays: 3, avgExamScore: 59 },
      { month: 'Apr', presentDays: 15, totalDays: 21, percentage: 71.4, lateDays: 4, leaveDays: 1, absentDays: 5, avgExamScore: 55 },
      { month: 'May', presentDays: 18, totalDays: 23, percentage: 78.2, lateDays: 3, leaveDays: 1, absentDays: 4, avgExamScore: 58 },
      { month: 'Jun', presentDays: 14, totalDays: 19, percentage: 73.6, lateDays: 2, leaveDays: 1, absentDays: 4, avgExamScore: 54 },
      { month: 'Jul', presentDays: 17, totalDays: 22, percentage: 77.2, lateDays: 2, leaveDays: 1, absentDays: 4, avgExamScore: 54 },
      { month: 'Aug', presentDays: 16, totalDays: 22, percentage: 72.7, lateDays: 4, leaveDays: 2, absentDays: 4, avgExamScore: 57 },
      { month: 'Sep', presentDays: 17, totalDays: 22, percentage: 77.2, lateDays: 2, leaveDays: 1, absentDays: 4, avgExamScore: 59 },
      { month: 'Oct', presentDays: 16, totalDays: 21, percentage: 76.1, lateDays: 3, leaveDays: 1, absentDays: 4, avgExamScore: 60 }
    ],
    weekdayAttendance: [
      { day: 'Sunday', percentage: 72.0, status: 'High Absenteeism' },
      { day: 'Monday', percentage: 82.0, status: 'Moderate' },
      { day: 'Tuesday', percentage: 80.0, status: 'Moderate' },
      { day: 'Wednesday', percentage: 78.0, status: 'Moderate' },
      { day: 'Thursday', percentage: 69.0, status: 'Critical Absenteeism' }
    ],
    competencyRadar: [
      { skill: 'Problem Solving', student: 52, benchmark: 70 },
      { skill: 'Theory Knowledge', student: 58, benchmark: 72 },
      { skill: 'Practical Lab Skills', student: 68, benchmark: 75 },
      { skill: 'Creative Writing', student: 60, benchmark: 76 },
      { skill: 'Punctuality & Presence', student: 74, benchmark: 80 },
      { skill: 'Collaborative Projects', student: 65, benchmark: 74 }
    ]
  },
  'ST-2024-004': {
    id: 'ST-2024-004',
    rollNo: '104',
    name: 'Nusrat Jahan',
    class: 'Class 9',
    section: 'B',
    guardian: 'Kamal Hossain',
    guardianPhone: '01922334455',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop',
    academicStanding: 'Distinction',
    attendanceStatus: 'Exemplary',
    cumulativeGPA: 5.0,
    overallPercentage: 89.4,
    totalAttendancePercentage: 96.4,
    classRank: 1,
    totalStudentsInClass: 40,
    percentile: 97.5,
    strengths: ['Wave Mechanics', 'Algebraic Identities', 'English Grammar & Literature'],
    growthAreas: ['Time Management in Long Theoretical Exams'],
    adminNotes: 'Top ranker in Class 9-B. Consistent academic discipline and active participation in class discussions.',
    termProgress: [
      { term: 'Jan Test', testDate: '2024-01-20', studentScore: 86, classAverage: 65, grade: 'A+', gpa: 5.0 },
      { term: 'Feb Test', testDate: '2024-02-18', studentScore: 88, classAverage: 67, grade: 'A+', gpa: 5.0 },
      { term: 'Term 1 Mid', testDate: '2024-03-25', studentScore: 90, classAverage: 68, grade: 'A+', gpa: 5.0 },
      { term: 'Term 1 Final', testDate: '2024-04-28', studentScore: 89, classAverage: 69, grade: 'A+', gpa: 5.0 },
      { term: 'May Test', testDate: '2024-05-22', studentScore: 92, classAverage: 70, grade: 'A+', gpa: 5.0 },
      { term: 'Term 2 Mid', testDate: '2024-07-15', studentScore: 90, classAverage: 68, grade: 'A+', gpa: 5.0 },
      { term: 'Term 2 Final', testDate: '2024-08-30', studentScore: 91, classAverage: 71, grade: 'A+', gpa: 5.0 },
      { term: 'Pre-Board', testDate: '2024-10-20', studentScore: 93, classAverage: 72, grade: 'A+', gpa: 5.0 }
    ],
    subjects: [
      { subject: 'Mathematics', code: 'MATH-201', obtained: 88, total: 100, percentage: 88, grade: 'A+', gpa: 5.0, classAverage: 67, competencyScore: 90 },
      { subject: 'General Science', code: 'SCI-202', obtained: 91, total: 100, percentage: 91, grade: 'A+', gpa: 5.0, classAverage: 68, competencyScore: 92 },
      { subject: 'English', code: 'ENG-203', obtained: 90, total: 100, percentage: 90, grade: 'A+', gpa: 5.0, classAverage: 72, competencyScore: 92 },
      { subject: 'ICT', code: 'ICT-204', obtained: 92, total: 100, percentage: 92, grade: 'A+', gpa: 5.0, classAverage: 75, competencyScore: 94 },
      { subject: 'Social Science', code: 'SOC-205', obtained: 86, total: 100, percentage: 86, grade: 'A+', gpa: 5.0, classAverage: 71, competencyScore: 88 }
    ],
    monthlyAttendance: [
      { month: 'Jan', presentDays: 21, totalDays: 22, percentage: 95.5, lateDays: 1, leaveDays: 1, absentDays: 0, avgExamScore: 86 },
      { month: 'Feb', presentDays: 19, totalDays: 20, percentage: 95.0, lateDays: 0, leaveDays: 1, absentDays: 0, avgExamScore: 88 },
      { month: 'Mar', presentDays: 22, totalDays: 22, percentage: 100.0, lateDays: 0, leaveDays: 0, absentDays: 0, avgExamScore: 90 },
      { month: 'Apr', presentDays: 20, totalDays: 21, percentage: 95.2, lateDays: 1, leaveDays: 1, absentDays: 0, avgExamScore: 89 },
      { month: 'May', presentDays: 22, totalDays: 23, percentage: 95.7, lateDays: 0, leaveDays: 1, absentDays: 0, avgExamScore: 92 },
      { month: 'Jun', presentDays: 18, totalDays: 19, percentage: 94.7, lateDays: 1, leaveDays: 1, absentDays: 0, avgExamScore: 90 },
      { month: 'Jul', presentDays: 22, totalDays: 22, percentage: 100.0, lateDays: 0, leaveDays: 0, absentDays: 0, avgExamScore: 90 },
      { month: 'Aug', presentDays: 21, totalDays: 22, percentage: 95.5, lateDays: 0, leaveDays: 1, absentDays: 0, avgExamScore: 91 },
      { month: 'Sep', presentDays: 22, totalDays: 22, percentage: 100.0, lateDays: 0, leaveDays: 0, absentDays: 0, avgExamScore: 92 },
      { month: 'Oct', presentDays: 20, totalDays: 21, percentage: 95.2, lateDays: 1, leaveDays: 1, absentDays: 0, avgExamScore: 93 }
    ],
    weekdayAttendance: [
      { day: 'Sunday', percentage: 97.0, status: 'Optimal' },
      { day: 'Monday', percentage: 98.0, status: 'Optimal' },
      { day: 'Tuesday', percentage: 96.0, status: 'Optimal' },
      { day: 'Wednesday', percentage: 96.0, status: 'Optimal' },
      { day: 'Thursday', percentage: 95.0, status: 'Optimal' }
    ],
    competencyRadar: [
      { skill: 'Problem Solving', student: 90, benchmark: 68 },
      { skill: 'Theory Knowledge', student: 92, benchmark: 70 },
      { skill: 'Practical Lab Skills', student: 91, benchmark: 72 },
      { skill: 'Creative Writing', student: 88, benchmark: 73 },
      { skill: 'Punctuality & Presence', student: 96, benchmark: 80 },
      { skill: 'Collaborative Projects', student: 93, benchmark: 71 }
    ]
  },
  'ST-2024-005': {
    id: 'ST-2024-005',
    rollNo: '105',
    name: 'Tariq Islam',
    class: 'Class 9',
    section: 'B',
    guardian: 'Aminul Islam',
    guardianPhone: '01811998877',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    academicStanding: 'At-Risk',
    attendanceStatus: 'Critical',
    cumulativeGPA: 2.1,
    overallPercentage: 49.2,
    totalAttendancePercentage: 71.8,
    classRank: 39,
    totalStudentsInClass: 40,
    percentile: 5.0,
    strengths: ['Hands-on Science Experiments', 'Physical Education'],
    growthAreas: ['Formula Application in Mathematics', 'Consistent School Attendance', 'Homework Submission'],
    adminNotes: 'URGENT: Attendance has fallen below statutory 75% threshold (currently 71.8%). Formal parent counseling meeting scheduled. Subject teacher reports missed foundation lessons in Math and Physics.',
    termProgress: [
      { term: 'Jan Test', testDate: '2024-01-20', studentScore: 58, classAverage: 65, grade: 'B', gpa: 3.0 },
      { term: 'Feb Test', testDate: '2024-02-18', studentScore: 54, classAverage: 67, grade: 'C', gpa: 2.0 },
      { term: 'Term 1 Mid', testDate: '2024-03-25', studentScore: 50, classAverage: 68, grade: 'C', gpa: 2.0 },
      { term: 'Term 1 Final', testDate: '2024-04-28', studentScore: 47, classAverage: 69, grade: 'C', gpa: 2.0 },
      { term: 'May Test', testDate: '2024-05-22', studentScore: 49, classAverage: 70, grade: 'C', gpa: 2.0 },
      { term: 'Term 2 Mid', testDate: '2024-07-15', studentScore: 44, classAverage: 68, grade: 'D', gpa: 1.0 },
      { term: 'Term 2 Final', testDate: '2024-08-30', studentScore: 46, classAverage: 71, grade: 'D', gpa: 1.0 },
      { term: 'Pre-Board', testDate: '2024-10-20', studentScore: 51, classAverage: 72, grade: 'C', gpa: 2.0 }
    ],
    subjects: [
      { subject: 'Mathematics', code: 'MATH-201', obtained: 38, total: 100, percentage: 38, grade: 'D', gpa: 1.0, classAverage: 67, competencyScore: 38 },
      { subject: 'General Science', code: 'SCI-202', obtained: 50, total: 100, percentage: 50, grade: 'B', gpa: 3.0, classAverage: 68, competencyScore: 52 },
      { subject: 'English', code: 'ENG-203', obtained: 54, total: 100, percentage: 54, grade: 'B', gpa: 3.0, classAverage: 72, competencyScore: 55 },
      { subject: 'ICT', code: 'ICT-204', obtained: 60, total: 100, percentage: 60, grade: 'A-', gpa: 3.5, classAverage: 75, competencyScore: 64 },
      { subject: 'Social Science', code: 'SOC-205', obtained: 44, total: 100, percentage: 44, grade: 'C', gpa: 2.0, classAverage: 71, competencyScore: 45 }
    ],
    monthlyAttendance: [
      { month: 'Jan', presentDays: 17, totalDays: 22, percentage: 77.2, lateDays: 3, leaveDays: 1, absentDays: 4, avgExamScore: 58 },
      { month: 'Feb', presentDays: 15, totalDays: 20, percentage: 75.0, lateDays: 2, leaveDays: 1, absentDays: 4, avgExamScore: 54 },
      { month: 'Mar', presentDays: 16, totalDays: 22, percentage: 72.7, lateDays: 3, leaveDays: 1, absentDays: 5, avgExamScore: 50 },
      { month: 'Apr', presentDays: 14, totalDays: 21, percentage: 66.7, lateDays: 4, leaveDays: 2, absentDays: 5, avgExamScore: 47 },
      { month: 'May', presentDays: 16, totalDays: 23, percentage: 69.5, lateDays: 3, leaveDays: 1, absentDays: 6, avgExamScore: 49 },
      { month: 'Jun', presentDays: 13, totalDays: 19, percentage: 68.4, lateDays: 3, leaveDays: 1, absentDays: 5, avgExamScore: 44 },
      { month: 'Jul', presentDays: 15, totalDays: 22, percentage: 68.2, lateDays: 2, leaveDays: 2, absentDays: 5, avgExamScore: 44 },
      { month: 'Aug', presentDays: 15, totalDays: 22, percentage: 68.2, lateDays: 4, leaveDays: 1, absentDays: 6, avgExamScore: 46 },
      { month: 'Sep', presentDays: 16, totalDays: 22, percentage: 72.7, lateDays: 2, leaveDays: 1, absentDays: 5, avgExamScore: 50 },
      { month: 'Oct', presentDays: 15, totalDays: 21, percentage: 71.4, lateDays: 3, leaveDays: 1, absentDays: 5, avgExamScore: 51 }
    ],
    weekdayAttendance: [
      { day: 'Sunday', percentage: 64.0, status: 'Critical' },
      { day: 'Monday', percentage: 76.0, status: 'Warning' },
      { day: 'Tuesday', percentage: 74.0, status: 'Warning' },
      { day: 'Wednesday', percentage: 75.0, status: 'Warning' },
      { day: 'Thursday', percentage: 65.0, status: 'Critical' }
    ],
    competencyRadar: [
      { skill: 'Problem Solving', student: 42, benchmark: 68 },
      { skill: 'Theory Knowledge', student: 46, benchmark: 70 },
      { skill: 'Practical Lab Skills', student: 62, benchmark: 72 },
      { skill: 'Creative Writing', student: 50, benchmark: 73 },
      { skill: 'Punctuality & Presence', student: 68, benchmark: 80 },
      { skill: 'Collaborative Projects', student: 58, benchmark: 71 }
    ]
  },
  'ST-2024-006': {
    id: 'ST-2024-006',
    rollNo: '106',
    name: 'Sadia Rahman',
    class: 'Class 8',
    section: 'A',
    guardian: 'Farid Rahman',
    guardianPhone: '01755667788',
    imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
    academicStanding: 'Distinction',
    attendanceStatus: 'Exemplary',
    cumulativeGPA: 5.0,
    overallPercentage: 92.5,
    totalAttendancePercentage: 98.1,
    classRank: 1,
    totalStudentsInClass: 38,
    percentile: 99.0,
    strengths: ['Mathematics', 'Science Inventions', 'Debating Skills', 'Consistent Homework'],
    growthAreas: ['Advanced Geometry constructions'],
    adminNotes: 'Star pupil in Class 8. Perfect attendance record across three consecutive quarters.',
    termProgress: [
      { term: 'Jan Test', testDate: '2024-01-20', studentScore: 89, classAverage: 66, grade: 'A+', gpa: 5.0 },
      { term: 'Feb Test', testDate: '2024-02-18', studentScore: 91, classAverage: 67, grade: 'A+', gpa: 5.0 },
      { term: 'Term 1 Mid', testDate: '2024-03-25', studentScore: 93, classAverage: 68, grade: 'A+', gpa: 5.0 },
      { term: 'Term 1 Final', testDate: '2024-04-28', studentScore: 92, classAverage: 69, grade: 'A+', gpa: 5.0 },
      { term: 'May Test', testDate: '2024-05-22', studentScore: 94, classAverage: 71, grade: 'A+', gpa: 5.0 },
      { term: 'Term 2 Mid', testDate: '2024-07-15', studentScore: 93, classAverage: 69, grade: 'A+', gpa: 5.0 },
      { term: 'Term 2 Final', testDate: '2024-08-30', studentScore: 95, classAverage: 72, grade: 'A+', gpa: 5.0 },
      { term: 'Pre-Board', testDate: '2024-10-20', studentScore: 96, classAverage: 73, grade: 'A+', gpa: 5.0 }
    ],
    subjects: [
      { subject: 'Mathematics', code: 'MATH-081', obtained: 94, total: 100, percentage: 94, grade: 'A+', gpa: 5.0, classAverage: 68, competencyScore: 96 },
      { subject: 'General Science', code: 'SCI-082', obtained: 92, total: 100, percentage: 92, grade: 'A+', gpa: 5.0, classAverage: 69, competencyScore: 94 },
      { subject: 'English', code: 'ENG-083', obtained: 91, total: 100, percentage: 91, grade: 'A+', gpa: 5.0, classAverage: 71, competencyScore: 93 },
      { subject: 'ICT', code: 'ICT-084', obtained: 96, total: 100, percentage: 96, grade: 'A+', gpa: 5.0, classAverage: 76, competencyScore: 98 },
      { subject: 'Social Studies', code: 'SOC-085', obtained: 89, total: 100, percentage: 89, grade: 'A+', gpa: 5.0, classAverage: 70, competencyScore: 91 }
    ],
    monthlyAttendance: [
      { month: 'Jan', presentDays: 22, totalDays: 22, percentage: 100.0, lateDays: 0, leaveDays: 0, absentDays: 0, avgExamScore: 89 },
      { month: 'Feb', presentDays: 20, totalDays: 20, percentage: 100.0, lateDays: 0, leaveDays: 0, absentDays: 0, avgExamScore: 91 },
      { month: 'Mar', presentDays: 22, totalDays: 22, percentage: 100.0, lateDays: 0, leaveDays: 0, absentDays: 0, avgExamScore: 93 },
      { month: 'Apr', presentDays: 20, totalDays: 21, percentage: 95.2, lateDays: 1, leaveDays: 1, absentDays: 0, avgExamScore: 92 },
      { month: 'May', presentDays: 23, totalDays: 23, percentage: 100.0, lateDays: 0, leaveDays: 0, absentDays: 0, avgExamScore: 94 },
      { month: 'Jun', presentDays: 18, totalDays: 19, percentage: 94.7, lateDays: 0, leaveDays: 1, absentDays: 0, avgExamScore: 93 },
      { month: 'Jul', presentDays: 22, totalDays: 22, percentage: 100.0, lateDays: 0, leaveDays: 0, absentDays: 0, avgExamScore: 93 },
      { month: 'Aug', presentDays: 22, totalDays: 22, percentage: 100.0, lateDays: 0, leaveDays: 0, absentDays: 0, avgExamScore: 95 },
      { month: 'Sep', presentDays: 22, totalDays: 22, percentage: 100.0, lateDays: 0, leaveDays: 0, absentDays: 0, avgExamScore: 95 },
      { month: 'Oct', presentDays: 21, totalDays: 21, percentage: 100.0, lateDays: 0, leaveDays: 0, absentDays: 0, avgExamScore: 96 }
    ],
    weekdayAttendance: [
      { day: 'Sunday', percentage: 99.0, status: 'Optimal' },
      { day: 'Monday', percentage: 99.5, status: 'Optimal' },
      { day: 'Tuesday', percentage: 98.0, status: 'Optimal' },
      { day: 'Wednesday', percentage: 97.0, status: 'Optimal' },
      { day: 'Thursday', percentage: 97.0, status: 'Optimal' }
    ],
    competencyRadar: [
      { skill: 'Problem Solving', student: 96, benchmark: 66 },
      { skill: 'Theory Knowledge', student: 94, benchmark: 69 },
      { skill: 'Practical Lab Skills', student: 92, benchmark: 70 },
      { skill: 'Creative Writing', student: 90, benchmark: 71 },
      { skill: 'Punctuality & Presence', student: 98, benchmark: 79 },
      { skill: 'Collaborative Projects', student: 92, benchmark: 72 }
    ]
  }
};

// Fallback generator for other students
const getOrCreateStudentProgress = (studentId: string): DetailedStudentProgress => {
  if (STUDENT_PROGRESS_DATABASE[studentId]) {
    return STUDENT_PROGRESS_DATABASE[studentId];
  }
  const baseStudent = MOCK_STUDENTS.find(s => s.id === studentId) || MOCK_STUDENTS[0];
  return {
    id: baseStudent.id,
    rollNo: baseStudent.rollNo,
    name: baseStudent.name,
    class: baseStudent.class,
    section: baseStudent.section,
    guardian: baseStudent.guardian,
    guardianPhone: baseStudent.phone || '01700-000000',
    imageUrl: baseStudent.imageUrl,
    academicStanding: 'Good Standing',
    attendanceStatus: 'Regular',
    cumulativeGPA: 4.2,
    overallPercentage: 78.5,
    totalAttendancePercentage: 88.5,
    classRank: 12,
    totalStudentsInClass: 40,
    percentile: 72.0,
    strengths: ['General Studies', 'Practical Engagement'],
    growthAreas: ['Numerical Revision', 'Weekly Homework'],
    adminNotes: 'Steady academic performer with satisfactory attendance pattern.',
    termProgress: [
      { term: 'Jan Test', testDate: '2024-01-20', studentScore: 74, classAverage: 67, grade: 'A', gpa: 4.0 },
      { term: 'Feb Test', testDate: '2024-02-18', studentScore: 76, classAverage: 68, grade: 'A', gpa: 4.0 },
      { term: 'Term 1 Mid', testDate: '2024-03-25', studentScore: 79, classAverage: 70, grade: 'A', gpa: 4.2 },
      { term: 'Term 1 Final', testDate: '2024-04-28', studentScore: 78, classAverage: 70, grade: 'A', gpa: 4.2 },
      { term: 'May Test', testDate: '2024-05-22', studentScore: 80, classAverage: 71, grade: 'A', gpa: 4.5 },
      { term: 'Term 2 Mid', testDate: '2024-07-15', studentScore: 77, classAverage: 69, grade: 'A', gpa: 4.0 },
      { term: 'Term 2 Final', testDate: '2024-08-30', studentScore: 81, classAverage: 72, grade: 'A', gpa: 4.5 },
      { term: 'Pre-Board', testDate: '2024-10-20', studentScore: 82, classAverage: 73, grade: 'A+', gpa: 5.0 }
    ],
    subjects: [
      { subject: 'Mathematics', code: 'MATH-101', obtained: 74, total: 100, percentage: 74, grade: 'A', gpa: 4.0, classAverage: 70, competencyScore: 74 },
      { subject: 'Science', code: 'SCI-102', obtained: 80, total: 100, percentage: 80, grade: 'A+', gpa: 5.0, classAverage: 69, competencyScore: 82 },
      { subject: 'English', code: 'ENG-103', obtained: 79, total: 100, percentage: 79, grade: 'A', gpa: 4.0, classAverage: 73, competencyScore: 80 },
      { subject: 'ICT', code: 'ICT-104', obtained: 85, total: 100, percentage: 85, grade: 'A+', gpa: 5.0, classAverage: 76, competencyScore: 86 }
    ],
    monthlyAttendance: [
      { month: 'Jan', presentDays: 19, totalDays: 22, percentage: 86.4, lateDays: 1, leaveDays: 1, absentDays: 2, avgExamScore: 74 },
      { month: 'Feb', presentDays: 18, totalDays: 20, percentage: 90.0, lateDays: 1, leaveDays: 0, absentDays: 1, avgExamScore: 76 },
      { month: 'Mar', presentDays: 20, totalDays: 22, percentage: 90.9, lateDays: 1, leaveDays: 1, absentDays: 1, avgExamScore: 79 },
      { month: 'Apr', presentDays: 18, totalDays: 21, percentage: 85.7, lateDays: 2, leaveDays: 1, absentDays: 2, avgExamScore: 78 },
      { month: 'May', presentDays: 20, totalDays: 23, percentage: 87.0, lateDays: 1, leaveDays: 1, absentDays: 2, avgExamScore: 80 },
      { month: 'Jun', presentDays: 17, totalDays: 19, percentage: 89.5, lateDays: 1, leaveDays: 0, absentDays: 1, avgExamScore: 77 },
      { month: 'Jul', presentDays: 19, totalDays: 22, percentage: 86.4, lateDays: 1, leaveDays: 1, absentDays: 2, avgExamScore: 77 },
      { month: 'Aug', presentDays: 20, totalDays: 22, percentage: 90.9, lateDays: 1, leaveDays: 1, absentDays: 1, avgExamScore: 81 },
      { month: 'Sep', presentDays: 19, totalDays: 22, percentage: 86.4, lateDays: 2, leaveDays: 0, absentDays: 3, avgExamScore: 82 },
      { month: 'Oct', presentDays: 19, totalDays: 21, percentage: 90.5, lateDays: 1, leaveDays: 1, absentDays: 1, avgExamScore: 82 }
    ],
    weekdayAttendance: [
      { day: 'Sunday', percentage: 86.0, status: 'Normal' },
      { day: 'Monday', percentage: 90.0, status: 'Optimal' },
      { day: 'Tuesday', percentage: 88.0, status: 'Optimal' },
      { day: 'Wednesday', percentage: 89.0, status: 'Optimal' },
      { day: 'Thursday', percentage: 84.0, status: 'Normal' }
    ],
    competencyRadar: [
      { skill: 'Problem Solving', student: 75, benchmark: 70 },
      { skill: 'Theory Knowledge', student: 78, benchmark: 72 },
      { skill: 'Practical Lab Skills', student: 80, benchmark: 74 },
      { skill: 'Creative Writing', student: 76, benchmark: 74 },
      { skill: 'Punctuality & Presence', student: 88, benchmark: 80 },
      { skill: 'Collaborative Projects', student: 82, benchmark: 72 }
    ]
  };
};

// --- GRANULAR SUBJECT BREAKDOWN INTERFACES & EVALUATION DATA ---
export interface SubjectComponentBreakdown {
  component: string;
  shortName: string;
  obtained: number;
  total: number;
  percentage: number;
  classAveragePercentage: number;
  classAverageObtained: number;
  weightage: string;
}

export interface SubjectTopicMastery {
  topic: string;
  score: number;
  classAverage: number;
  status: 'Mastered' | 'Competent' | 'Needs Practice';
}

export interface GranularSubjectDetails {
  subject: string;
  code: string;
  teacherName: string;
  teacherRole: string;
  subjectRank: number;
  totalStudents: number;
  periodsAttended: number;
  totalPeriods: number;
  periodAttendanceRate: number;
  homeworkSubmissionRate: number;
  overallScore: number;
  overallTotal: number;
  overallPercentage: number;
  overallGrade: string;
  overallGpa: number;
  classAverageScore: number;
  deltaVsClassAvg: number;
  components: SubjectComponentBreakdown[];
  termTrajectory: {
    term: string;
    testDate: string;
    studentScore: number;
    classAverage: number;
    grade: string;
  }[];
  topics: SubjectTopicMastery[];
  qualitativeObservation: string;
  keyStrengths: string[];
  growthAreas: string[];
  recommendations: string[];
}

export const getGranularSubjectDetails = (
  student: DetailedStudentProgress,
  subjectCode: string
): GranularSubjectDetails => {
  const currentSub = student.subjects.find(s => s.code === subjectCode) || student.subjects[0];
  const percentage = currentSub ? currentSub.percentage : 85;
  const classAvg = currentSub ? currentSub.classAverage : 70;
  const delta = Math.round((percentage - classAvg) * 10) / 10;
  const subName = currentSub ? currentSub.subject : 'General Subject';
  const subCode = currentSub ? currentSub.code : 'SUB-101';
  const grade = currentSub ? currentSub.grade : 'A';
  const gpa = currentSub ? currentSub.gpa : 4.0;
  const obtained = currentSub ? currentSub.obtained : 85;
  const total = currentSub ? currentSub.total : 100;

  // Derive standing rank in subject
  const subjectRank = delta >= 18 ? 1 : delta >= 10 ? 2 : delta >= 5 ? 4 : delta >= 0 ? 8 : 16;
  const totalStudents = student.totalStudentsInClass || 45;

  // Period attendance
  const totalPeriods = 80;
  const periodAttendanceRate = Math.min(100, Math.max(70, Math.round(student.totalAttendancePercentage + (delta > 0 ? 1.5 : -2))));
  const periodsAttended = Math.round((totalPeriods * periodAttendanceRate) / 100);
  const homeworkSubmissionRate = Math.min(100, Math.max(75, Math.round(percentage >= 80 ? 96 : percentage >= 70 ? 88 : 78)));

  // Configure component breakdown depending on subject field
  const isScienceOrMath = /math|phy|chem|sci|ict|tech/i.test(subName);
  const isLanguage = /eng|bang|lang/i.test(subName);

  let components: SubjectComponentBreakdown[] = [];
  if (isScienceOrMath) {
    const cqObtained = Math.min(50, Math.round(50 * (percentage / 100)));
    const cqClassAvg = Math.min(50, Math.round(50 * (classAvg / 100)));
    const mcqObtained = Math.min(25, Math.round(25 * (Math.min(100, percentage + 2) / 100)));
    const mcqClassAvg = Math.min(25, Math.round(25 * (classAvg / 100)));
    const labObtained = Math.min(15, Math.round(15 * (Math.min(100, percentage + 3) / 100)));
    const labClassAvg = Math.min(15, Math.round(15 * (Math.min(100, classAvg + 4) / 100)));
    const caObtained = Math.min(10, Math.round(10 * (Math.min(100, percentage + 1) / 100)));
    const caClassAvg = Math.min(10, Math.round(10 * (classAvg / 100)));

    components = [
      {
        component: 'Written / Creative Theory (CQ)',
        shortName: 'Creative Theory (50m)',
        obtained: cqObtained,
        total: 50,
        percentage: Math.round((cqObtained / 50) * 100),
        classAveragePercentage: Math.round((cqClassAvg / 50) * 100),
        classAverageObtained: cqClassAvg,
        weightage: '50%'
      },
      {
        component: 'Multiple Choice Questions (MCQ)',
        shortName: 'Objective MCQ (25m)',
        obtained: mcqObtained,
        total: 25,
        percentage: Math.round((mcqObtained / 25) * 100),
        classAveragePercentage: Math.round((mcqClassAvg / 25) * 100),
        classAverageObtained: mcqClassAvg,
        weightage: '25%'
      },
      {
        component: 'Practical Lab Experiment & Viva',
        shortName: 'Practical Lab (15m)',
        obtained: labObtained,
        total: 15,
        percentage: Math.round((labObtained / 15) * 100),
        classAveragePercentage: Math.round((labClassAvg / 15) * 100),
        classAverageObtained: labClassAvg,
        weightage: '15%'
      },
      {
        component: 'Continuous Assessment & Weekly Homework',
        shortName: 'Continuous Assessment (10m)',
        obtained: caObtained,
        total: 10,
        percentage: Math.round((caObtained / 10) * 100),
        classAveragePercentage: Math.round((caClassAvg / 10) * 100),
        classAverageObtained: caClassAvg,
        weightage: '10%'
      }
    ];
  } else if (isLanguage) {
    const compObtained = Math.min(40, Math.round(40 * (percentage / 100)));
    const compClassAvg = Math.min(40, Math.round(40 * (classAvg / 100)));
    const readObtained = Math.min(30, Math.round(30 * (Math.min(100, percentage + 1) / 100)));
    const readClassAvg = Math.min(30, Math.round(30 * (classAvg / 100)));
    const gramObtained = Math.min(20, Math.round(20 * (Math.min(100, percentage + 2) / 100)));
    const gramClassAvg = Math.min(20, Math.round(20 * (classAvg / 100)));
    const vivaObtained = Math.min(10, Math.round(10 * (Math.min(100, percentage) / 100)));
    const vivaClassAvg = Math.min(10, Math.round(10 * (classAvg / 100)));

    components = [
      {
        component: 'Creative Writing & Composition (CQ)',
        shortName: 'Creative Writing (40m)',
        obtained: compObtained,
        total: 40,
        percentage: Math.round((compObtained / 40) * 100),
        classAveragePercentage: Math.round((compClassAvg / 40) * 100),
        classAverageObtained: compClassAvg,
        weightage: '40%'
      },
      {
        component: 'Reading Comprehension & Analysis',
        shortName: 'Reading Passages (30m)',
        obtained: readObtained,
        total: 30,
        percentage: Math.round((readObtained / 30) * 100),
        classAveragePercentage: Math.round((readClassAvg / 30) * 100),
        classAverageObtained: readClassAvg,
        weightage: '30%'
      },
      {
        component: 'Applied Grammar, Syntax & Lexicon',
        shortName: 'Applied Grammar (20m)',
        obtained: gramObtained,
        total: 20,
        percentage: Math.round((gramObtained / 20) * 100),
        classAveragePercentage: Math.round((gramClassAvg / 20) * 100),
        classAverageObtained: gramClassAvg,
        weightage: '20%'
      },
      {
        component: 'Spoken Fluency, Listening & Viva Voce',
        shortName: 'Listening & Speaking (10m)',
        obtained: vivaObtained,
        total: 10,
        percentage: Math.round((vivaObtained / 10) * 100),
        classAveragePercentage: Math.round((vivaClassAvg / 10) * 100),
        classAverageObtained: vivaClassAvg,
        weightage: '10%'
      }
    ];
  } else {
    // Standard 4-component breakdown
    const cqObtained = Math.min(60, Math.round(60 * (percentage / 100)));
    const cqClassAvg = Math.min(60, Math.round(60 * (classAvg / 100)));
    const mcqObtained = Math.min(25, Math.round(25 * (percentage / 100)));
    const mcqClassAvg = Math.min(25, Math.round(25 * (classAvg / 100)));
    const assignObtained = Math.min(10, Math.round(10 * (Math.min(100, percentage + 2) / 100)));
    const assignClassAvg = Math.min(10, Math.round(10 * (classAvg / 100)));
    const vivaObtained = Math.min(5, Math.round(5 * (Math.min(100, percentage) / 100)));
    const vivaClassAvg = Math.min(5, Math.round(5 * (classAvg / 100)));

    components = [
      {
        component: 'Descriptive Examination & Analytical Essay',
        shortName: 'Descriptive Essay (60m)',
        obtained: cqObtained,
        total: 60,
        percentage: Math.round((cqObtained / 60) * 100),
        classAveragePercentage: Math.round((cqClassAvg / 60) * 100),
        classAverageObtained: cqClassAvg,
        weightage: '60%'
      },
      {
        component: 'Objective & Factual Evaluation (MCQ)',
        shortName: 'Objective MCQ (25m)',
        obtained: mcqObtained,
        total: 25,
        percentage: Math.round((mcqObtained / 25) * 100),
        classAveragePercentage: Math.round((mcqClassAvg / 25) * 100),
        classAverageObtained: mcqClassAvg,
        weightage: '25%'
      },
      {
        component: 'Case Study & Term Portfolio Submission',
        shortName: 'Portfolio Project (10m)',
        obtained: assignObtained,
        total: 10,
        percentage: Math.round((assignObtained / 10) * 100),
        classAveragePercentage: Math.round((assignClassAvg / 10) * 100),
        classAverageObtained: assignClassAvg,
        weightage: '10%'
      },
      {
        component: 'Seminar Participation & Oral Defense',
        shortName: 'Oral Defense (5m)',
        obtained: vivaObtained,
        total: 5,
        percentage: Math.round((vivaObtained / 5) * 100),
        classAveragePercentage: Math.round((vivaClassAvg / 5) * 100),
        classAverageObtained: vivaClassAvg,
        weightage: '5%'
      }
    ];
  }

  // Trajectory across all terms for this specific subject
  const subjectRatio = percentage / Math.max(1, student.overallPercentage);
  const classSubjRatio = classAvg / 71;
  const termTrajectory = student.termProgress.map(t => {
    const studentSubScore = Math.min(100, Math.max(35, Math.round(t.studentScore * subjectRatio)));
    const classSubAvg = Math.min(95, Math.max(35, Math.round(t.classAverage * classSubjRatio)));
    return {
      term: t.term,
      testDate: t.testDate,
      studentScore: studentSubScore,
      classAverage: classSubAvg,
      grade: studentSubScore >= 80 ? 'A+' : studentSubScore >= 70 ? 'A' : studentSubScore >= 60 ? 'A-' : 'B'
    };
  });

  // Curriculum topics based on subject name
  let rawTopics: { topic: string; offset: number }[] = [];
  let teacherName = 'Engr. Monirul Islam';
  let teacherRole = 'Senior Faculty & Academic Counselor';
  let qualitativeObservation = '';
  let keyStrengths: string[] = [];
  let growthAreas: string[] = [];
  let recommendations: string[] = [];

  if (/math/i.test(subName)) {
    teacherName = 'Engr. Monirul Islam, M.Sc (Applied Math)';
    teacherRole = 'Head of Mathematics Department';
    rawTopics = [
      { topic: 'Algebraic Polynomials & Sequences', offset: 2 },
      { topic: 'Differential & Integral Calculus', offset: -1 },
      { topic: 'Trigonometric Identities & Functions', offset: -3 },
      { topic: 'Coordinate Geometry & Vectors', offset: 3 },
      { topic: 'Statics, Dynamics & Probability', offset: -1 }
    ];
    qualitativeObservation = `${student.name} demonstrates exceptional spatial reasoning and algorithmic speed in coordinate geometry and vector equations. Complex algebraic proofs are constructed methodically with high precision.`;
    keyStrengths = ['Vector Calculus', 'Coordinate Proofs', 'Speed of Numerical Execution'];
    growthAreas = ['Trigonometric Substitution Timing', 'Formulaic Short-answers'];
    recommendations = [
      'Encourage participation in National Mathematical Olympiad drills.',
      'Assign advanced multi-step calculus integration challenges to sustain engagement.'
    ];
  } else if (/phy/i.test(subName)) {
    teacherName = 'Dr. Shahinur Rahman, Ph.D (Physics)';
    teacherRole = 'Senior Lecturer & Laboratory Coordinator';
    rawTopics = [
      { topic: 'Newtonian Mechanics & Momentum', offset: 3 },
      { topic: 'Thermal Physics & Kinetic Theory', offset: -2 },
      { topic: 'Wave Optics & Sound Resonance', offset: 1 },
      { topic: 'Electromagnetism & Circuit Laws', offset: -1 },
      { topic: 'Modern Physics & Atomic Structure', offset: 2 }
    ];
    qualitativeObservation = `Strong command of physical laws and laboratory instrumentation. Accurately predicts mathematical derivations from experimental datasets with minimal oversight.`;
    keyStrengths = ['Kinematic Graphs', 'Lab Apparatus Calibration', 'Vector Free-Body Diagrams'];
    growthAreas = ['Calorimetry Word Problems', 'Significant Figures Rigor'];
    recommendations = [
      'Engage student with circuit breadboard micro-projects.',
      'Assign peer-teaching role for kinematics revision sessions.'
    ];
  } else if (/chem/i.test(subName)) {
    teacherName = 'Mrs. Rokeya Sultana, M.Sc';
    teacherRole = 'Associate Faculty, Chemistry Section';
    rawTopics = [
      { topic: 'Stoichiometry & Redox Titration', offset: 1 },
      { topic: 'Atomic Orbitals & Periodic Trends', offset: 2 },
      { topic: 'Organic Reaction Mechanisms', offset: -3 },
      { topic: 'Chemical Equilibrium & Kinetics', offset: -1 },
      { topic: 'Electrochemistry & Galvanic Cells', offset: 1 }
    ];
    qualitativeObservation = `Remarkable precision during titration experiments and theoretical stoichiometry. Organic reaction pathways require structured mind-mapping before examination.`;
    keyStrengths = ['Molar Calculations', 'Volumetric Analysis', 'Periodic Properties'];
    growthAreas = ['Reaction Mechanism Arrow Push', 'Organic Nomenclature'];
    recommendations = [
      'Provide organic reaction flowcharts for systematic daily revision.',
      'Maintain continuous titration logbook verification.'
    ];
  } else if (/eng/i.test(subName)) {
    teacherName = 'Ms. Nusrat Jahan, M.A (English)';
    teacherRole = 'Lead Faculty, English Department';
    rawTopics = [
      { topic: 'Reading Comprehension & Inferences', offset: 2 },
      { topic: 'Formal & Argumentative Essays', offset: -2 },
      { topic: 'Advanced Grammar & Clause Syntax', offset: 1 },
      { topic: 'Literary Critique & Thematic Review', offset: -1 },
      { topic: 'Oral Presentation & Phonetics', offset: 2 }
    ];
    qualitativeObservation = `Fluid vocabulary and coherent essay structuring. Syntactical clarity is solid; further work on transition phrases and rhetorical depth will elevate essays to highest band.`;
    keyStrengths = ['Extensive Vocabulary', 'Comprehension Accuracy', 'Pronunciation & Poise'];
    growthAreas = ['Essay Transition Sentences', 'Counter-argument Elaboration'];
    recommendations = [
      'Encourage editorial reading from international journals and periodicals.',
      'Incorporate structured 30-minute timed essay drafting drills.'
    ];
  } else if (/ict|tech|comp/i.test(subName)) {
    teacherName = 'Tanvir Hossain, B.Sc (CSE)';
    teacherRole = 'ICT Lab Instructor & Systems Trainer';
    rawTopics = [
      { topic: 'Algorithms & Computational Logic', offset: 3 },
      { topic: 'Structured Programming (C / Python)', offset: 2 },
      { topic: 'Relational Database (SQL) & Tables', offset: 1 },
      { topic: 'Web Systems (HTML/CSS & DOM)', offset: 2 },
      { topic: 'Networking & Data Security Protocols', offset: -1 }
    ];
    qualitativeObservation = `Pioneering student in computer science laboratory sessions with superior debugging acumen. Writes clean, modular code with appropriate algorithmic complexity.`;
    keyStrengths = ['Algorithm Flowcharts', 'Debugging Code Logic', 'Database Normalization'];
    growthAreas = ['IPv6 Subnetting Calculation', 'Network Protocol Acronyms'];
    recommendations = [
      'Recommend enrollment in junior competitive programming contest.',
      'Assign leadership of school website portal student development team.'
    ];
  } else {
    teacherName = 'Mizanur Rahman, M.Ed';
    teacherRole = 'Senior Social Sciences & General Studies Faculty';
    rawTopics = [
      { topic: 'Historical Milestones & Constitutional Frame', offset: 1 },
      { topic: 'Economic Policies & Sustainable Growth', offset: 2 },
      { topic: 'Geographical Demographics & Ecology', offset: -1 },
      { topic: 'Global Relations & International Treaties', offset: 1 },
      { topic: 'Societal Ethics & Civic Responsibilities', offset: 2 }
    ];
    qualitativeObservation = `Consistent high academic engagement with thorough analytical notes. Expresses well-researched viewpoints during classroom deliberations.`;
    keyStrengths = ['Constitutional Chronology', 'Map Reading', 'Analytical Depth'];
    growthAreas = ['Data Synthesis in Essays', 'Time Allocation in Exam Finals'];
    recommendations = [
      'Encourage submission to the Inter-School Essay & Debate Colloquium.',
      'Practice timed 5-point essay answer structuring.'
    ];
  }

  const topics: SubjectTopicMastery[] = rawTopics.map(r => {
    const score = Math.min(100, Math.max(40, percentage + r.offset));
    const topicClassAvg = Math.min(95, Math.max(35, classAvg + Math.round(r.offset * 0.4)));
    return {
      topic: r.topic,
      score,
      classAverage: topicClassAvg,
      status: score >= 85 ? 'Mastered' : score >= 70 ? 'Competent' : 'Needs Practice'
    };
  });

  return {
    subject: subName,
    code: subCode,
    teacherName,
    teacherRole,
    subjectRank,
    totalStudents,
    periodsAttended,
    totalPeriods,
    periodAttendanceRate,
    homeworkSubmissionRate,
    overallScore: obtained,
    overallTotal: total,
    overallPercentage: percentage,
    overallGrade: grade,
    overallGpa: gpa,
    classAverageScore: classAvg,
    deltaVsClassAvg: delta,
    components,
    termTrajectory,
    topics,
    qualitativeObservation,
    keyStrengths,
    growthAreas,
    recommendations
  };
};

// --- ACADEMIC GOALS INTERFACES & PRESETS ---
export interface AcademicGoal {
  id: string;
  studentId: string;
  subjectCode: string;
  subjectName: string;
  targetScore: number; // 0 - 100
  targetGrade: string; // 'A+', 'A', etc.
  targetTerm: string;  // e.g. 'Pre-Board Comprehensive Exam'
  strategyNotes: string;
  priority: 'High' | 'Medium' | 'Low';
  updatedAt: string;
  assignedBy: string;
}

export interface GoalMetrics {
  gap: number; // studentScore - targetScore
  progressRatio: number; // (studentScore / targetScore) * 100
  status: 'achieved' | 'on_track' | 'needs_push' | 'critical';
  statusLabel: string;
  badgeColor: string;
  progressColor: string;
}

export const calculateGoalMetrics = (currentScore: number, targetScore: number): GoalMetrics => {
  const gap = Math.round((currentScore - targetScore) * 10) / 10;
  const progressRatio = targetScore > 0 ? Math.min(100, Math.max(0, Math.round((currentScore / targetScore) * 100))) : 100;
  let status: 'achieved' | 'on_track' | 'needs_push' | 'critical' = 'on_track';
  let statusLabel = 'On Track';
  let badgeColor = 'bg-indigo-50 text-indigo-700 border-indigo-200';
  let progressColor = 'bg-indigo-600';

  if (gap >= 0) {
    status = 'achieved';
    statusLabel = gap === 0 ? 'Goal Met (100%)' : `Goal Exceeded (+${gap}%)`;
    badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    progressColor = 'bg-emerald-500';
  } else if (gap >= -5) {
    status = 'on_track';
    statusLabel = `Near Goal (${gap}%)`;
    badgeColor = 'bg-blue-50 text-blue-700 border-blue-200';
    progressColor = 'bg-blue-600';
  } else if (gap >= -12) {
    status = 'needs_push';
    statusLabel = `Push Required (${gap}%)`;
    badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
    progressColor = 'bg-amber-500';
  } else {
    status = 'critical';
    statusLabel = `Critical Gap (${gap}%)`;
    badgeColor = 'bg-rose-50 text-rose-800 border-rose-200';
    progressColor = 'bg-rose-500';
  }

  return { gap, progressRatio, status, statusLabel, badgeColor, progressColor };
};

export const INITIAL_ACADEMIC_GOALS: Record<string, Record<string, AcademicGoal>> = {
  'ST-2024-001': {
    'HMATH-101': {
      id: 'GOAL-HMATH-001',
      studentId: 'ST-2024-001',
      subjectCode: 'HMATH-101',
      subjectName: 'Higher Mathematics',
      targetScore: 98,
      targetGrade: 'A+',
      targetTerm: 'Pre-Board Comprehensive Exam',
      strategyNotes: 'Sustain flawless proof execution in calculus & coordinate geometry. Target 100% accuracy in MCQ section.',
      priority: 'High',
      updatedAt: '2024-09-15',
      assignedBy: 'Admin (Academic Dean)'
    },
    'PHY-102': {
      id: 'GOAL-PHY-001',
      studentId: 'ST-2024-001',
      subjectCode: 'PHY-102',
      subjectName: 'Physics',
      targetScore: 95,
      targetGrade: 'A+',
      targetTerm: 'Pre-Board Comprehensive Exam',
      strategyNotes: 'Enhance speed in numerical kinematic derivations and optics problem sets under timed conditions.',
      priority: 'High',
      updatedAt: '2024-09-18',
      assignedBy: 'Admin (Academic Dean)'
    },
    'CHEM-103': {
      id: 'GOAL-CHEM-001',
      studentId: 'ST-2024-001',
      subjectCode: 'CHEM-103',
      subjectName: 'Chemistry',
      targetScore: 94,
      targetGrade: 'A+',
      targetTerm: 'Term 2 Final Examination',
      strategyNotes: 'Strengthen organic reaction pathways and volumetric stoichiometry titration logbooks.',
      priority: 'Medium',
      updatedAt: '2024-09-10',
      assignedBy: 'Admin (Academic Dean)'
    },
    'ENG-104': {
      id: 'GOAL-ENG-001',
      studentId: 'ST-2024-001',
      subjectCode: 'ENG-104',
      subjectName: 'English Language',
      targetScore: 92,
      targetGrade: 'A+',
      targetTerm: 'Term 2 Final Examination',
      strategyNotes: 'Elevate essay transition sentence structure and formal vocabulary in argumentative compositions.',
      priority: 'High',
      updatedAt: '2024-09-12',
      assignedBy: 'Head of English Dept'
    }
  },
  'ST-2024-002': {
    'HMATH-101': {
      id: 'GOAL-HMATH-002',
      studentId: 'ST-2024-002',
      subjectCode: 'HMATH-101',
      subjectName: 'Higher Mathematics',
      targetScore: 88,
      targetGrade: 'A+',
      targetTerm: 'Pre-Board Comprehensive Exam',
      strategyNotes: 'Practice trigonometry substitution and formula sheets to bridge gap from 78% to 88%.',
      priority: 'High',
      updatedAt: '2024-09-14',
      assignedBy: 'Admin (Academic Dean)'
    },
    'PHY-102': {
      id: 'GOAL-PHY-002',
      studentId: 'ST-2024-002',
      subjectCode: 'PHY-102',
      subjectName: 'Physics',
      targetScore: 90,
      targetGrade: 'A+',
      targetTerm: 'Term 2 Final Examination',
      strategyNotes: 'Increase speed during numerical calculation sections to achieve distinction.',
      priority: 'Medium',
      updatedAt: '2024-09-16',
      assignedBy: 'Admin (Academic Dean)'
    },
    'ENG-104': {
      id: 'GOAL-ENG-002',
      studentId: 'ST-2024-002',
      subjectCode: 'ENG-104',
      subjectName: 'English Language',
      targetScore: 95,
      targetGrade: 'A+',
      targetTerm: 'Pre-Board Comprehensive Exam',
      strategyNotes: 'Continue literary critique excellence; maintain top percentile in comprehension.',
      priority: 'High',
      updatedAt: '2024-09-18',
      assignedBy: 'Head of English Dept'
    }
  }
};

// --- GRADE HISTORY TIMELINE INTERFACES & ASSESSMENT GENERATOR ---
export interface HistoricalAssessmentRecord {
  id: string;
  testDate: string;
  displayDate: string;
  term: string;
  category: 'Terminal Exam' | 'Midterm Exam' | 'Monthly Test' | 'Diagnostic Test' | 'Practical Lab' | 'Class Assessment';
  subject: string;
  subjectCode: string;
  studentScore: number;
  totalMarks: number;
  percentage: number;
  classAverage: number;
  deltaVsClassAvg: number;
  grade: string;
  gpa: number;
  topicFocus: string;
  weightage: string;
  teacherRemark: string;
  rankInClass: number;
  components?: {
    name: string;
    obtained: number;
    total: number;
    weight: string;
  }[];
}

export const getStudentGradeHistoryTimeline = (
  student: DetailedStudentProgress,
  targetSubjectCode?: string
): HistoricalAssessmentRecord[] => {
  const subjectsToProcess = targetSubjectCode && targetSubjectCode !== 'all'
    ? student.subjects.filter(s => s.code === targetSubjectCode)
    : student.subjects;

  const records: HistoricalAssessmentRecord[] = [];

  subjectsToProcess.forEach(sub => {
    const isScienceOrMath = /math|phy|chem|sci|ict|tech/i.test(sub.subject);
    const isLanguage = /eng|bang|lang/i.test(sub.subject);
    const basePct = sub.percentage;
    const baseClassAvg = sub.classAverage;

    // 10 chronological assessments spanning the academic cycle
    const assessmentTemplates = [
      {
        term: 'Pre-Board Comprehensive Exam',
        date: '2024-10-20',
        displayDate: '20 Oct 2024',
        category: 'Terminal Exam' as const,
        weightage: '25%',
        pctOffset: 2,
        classOffset: 3,
        topic: isScienceOrMath
          ? 'Comprehensive Board Syllabus (Calculus, Optics, Logic & Kinetics)'
          : isLanguage
          ? 'Comprehensive Composition, Literary Analysis & Advanced Grammar'
          : 'National Constitution, Economic History & Global Treaties',
        remark: 'Exemplary execution under timed examination conditions. Superior analytical clarity.'
      },
      {
        term: 'Autumn Unit Assessment & Quiz',
        date: '2024-09-24',
        displayDate: '24 Sep 2024',
        category: 'Class Assessment' as const,
        weightage: '5%',
        pctOffset: 1,
        classOffset: 1,
        topic: isScienceOrMath
          ? 'Vector Coordinates & Circuit Laws'
          : isLanguage
          ? 'Lexicon Accuracy & Syntactical Inferences'
          : 'Regional Demographics & Environmental Governance',
        remark: 'Swift recall of core conceptual formulae and structured definitions.'
      },
      {
        term: 'Term 2 Final Examination',
        date: '2024-08-30',
        displayDate: '30 Aug 2024',
        category: 'Terminal Exam' as const,
        weightage: '25%',
        pctOffset: 1,
        classOffset: 2,
        topic: isScienceOrMath
          ? 'Mechanics, Stoichiometry & Data Algorithms'
          : isLanguage
          ? 'Formal Debate Essays & Thematic Reading Passages'
          : 'Socio-Economic Development & Global Frameworks',
        remark: 'Commendable problem-solving rigor. Consistent top tier performance.'
      },
      {
        term: 'Term 2 Midterm Examination',
        date: '2024-07-15',
        displayDate: '15 Jul 2024',
        category: 'Midterm Exam' as const,
        weightage: '15%',
        pctOffset: -1,
        classOffset: 0,
        topic: isScienceOrMath
          ? 'Trigonometric Functions & Thermodynamics'
          : isLanguage
          ? 'Clause Analysis & Persuasive Writing'
          : 'Historical Chronology & Institutional Governance',
        remark: 'Solid mastery across major problem sets; minor calculation timing review advised.'
      },
      {
        term: 'Mid-Year Practical Lab & Viva',
        date: '2024-06-18',
        displayDate: '18 Jun 2024',
        category: 'Practical Lab' as const,
        weightage: '10%',
        pctOffset: 3,
        classOffset: 4,
        topic: isScienceOrMath
          ? 'Apparatus Setup, Titration, Breadboard Circuits & Code Logic'
          : isLanguage
          ? 'Oral Defense, Phonetics, Listening & Debate Viva'
          : 'Field Observation Portfolio & Seminar Defense',
        remark: 'Outstanding hands-on dexterity and laboratory safety compliance.'
      },
      {
        term: 'May Diagnostic Progress Test',
        date: '2024-05-22',
        displayDate: '22 May 2024',
        category: 'Monthly Test' as const,
        weightage: '5%',
        pctOffset: 2,
        classOffset: 1,
        topic: isScienceOrMath
          ? 'Coordinate Geometry & Reaction Kinetics'
          : isLanguage
          ? 'Reading Comprehension & Critical Inferences'
          : 'Constitutional Articles & Judicial Structure',
        remark: 'Clean presentation of answer scripts with high scoring accuracy.'
      },
      {
        term: 'Term 1 Final Examination',
        date: '2024-04-28',
        displayDate: '28 Apr 2024',
        category: 'Terminal Exam' as const,
        weightage: '25%',
        pctOffset: 0,
        classOffset: 0,
        topic: isScienceOrMath
          ? 'Polynomial Systems, Kinematics & Periodic Trends'
          : isLanguage
          ? 'Argumentative Prose, Idioms & Applied Vocabulary'
          : 'Agricultural Economy & Cultural Heritage',
        remark: 'Well-structured solutions showing thorough textbook preparation.'
      },
      {
        term: 'Term 1 Midterm Examination',
        date: '2024-03-25',
        displayDate: '25 Mar 2024',
        category: 'Midterm Exam' as const,
        weightage: '15%',
        pctOffset: 1,
        classOffset: 1,
        topic: isScienceOrMath
          ? 'Algebraic Sequences & Newtonian Laws'
          : isLanguage
          ? 'Summary Drafting & Narrative Mechanics'
          : 'Geographical Topography & River Basins',
        remark: 'High conceptual grasp with methodical question breakdown.'
      },
      {
        term: 'Feb Monthly Progress Test',
        date: '2024-02-18',
        displayDate: '18 Feb 2024',
        category: 'Monthly Test' as const,
        weightage: '5%',
        pctOffset: -2,
        classOffset: -1,
        topic: isScienceOrMath
          ? 'Set Theory, Real Numbers & Physical Quantities'
          : isLanguage
          ? 'Parts of Speech, Tenses & Basic Composition'
          : 'Historical Milestones of 1971 & Civic Duties',
        remark: 'Steady progress. Active participation observed in follow-up revision.'
      },
      {
        term: 'Jan Diagnostic Baseline Assessment',
        date: '2024-01-20',
        displayDate: '20 Jan 2024',
        category: 'Diagnostic Test' as const,
        weightage: '5%',
        pctOffset: -3,
        classOffset: -3,
        topic: isScienceOrMath
          ? 'Foundation Diagnostic: Mathematical & Scientific Aptitude'
          : isLanguage
          ? 'Language Placement: Grammar, Syntax & Vocabulary'
          : 'General Social Sciences & Civic Foundations',
        remark: 'Initial diagnostic baseline established for the academic session.'
      }
    ];

    assessmentTemplates.forEach((tmpl, idx) => {
      const pct = Math.min(100, Math.max(35, Math.round(basePct + tmpl.pctOffset)));
      const classAvg = Math.min(95, Math.max(35, Math.round(baseClassAvg + tmpl.classOffset)));
      const delta = Math.round((pct - classAvg) * 10) / 10;
      const totalMarks = tmpl.category === 'Practical Lab' ? 50 : tmpl.category === 'Class Assessment' ? 25 : 100;
      const obtained = Math.round((pct * totalMarks) / 100);
      const grade = pct >= 80 ? 'A+' : pct >= 70 ? 'A' : pct >= 60 ? 'A-' : pct >= 50 ? 'B' : pct >= 40 ? 'C' : 'F';
      const gpa = pct >= 80 ? 5.0 : pct >= 70 ? 4.0 : pct >= 60 ? 3.5 : pct >= 50 ? 3.0 : pct >= 40 ? 2.0 : 0.0;
      const rank = delta >= 20 ? 1 : delta >= 12 ? 2 : delta >= 6 ? 4 : delta >= 0 ? 7 : 15;

      let components: HistoricalAssessmentRecord['components'] = undefined;
      if (totalMarks === 100) {
        if (isScienceOrMath) {
          const cq = Math.round(50 * (pct / 100));
          const mcq = Math.round(25 * (Math.min(100, pct + 2) / 100));
          const lab = Math.round(15 * (Math.min(100, pct + 3) / 100));
          const ca = Math.max(0, obtained - cq - mcq - lab);
          components = [
            { name: 'Theory (CQ)', obtained: cq, total: 50, weight: '50%' },
            { name: 'Objective (MCQ)', obtained: mcq, total: 25, weight: '25%' },
            { name: 'Lab Practical', obtained: lab, total: 15, weight: '15%' },
            { name: 'Continuous CA', obtained: ca, total: 10, weight: '10%' }
          ];
        } else if (isLanguage) {
          const comp = Math.round(40 * (pct / 100));
          const read = Math.round(30 * (Math.min(100, pct + 1) / 100));
          const gram = Math.round(20 * (Math.min(100, pct + 2) / 100));
          const viva = Math.max(0, obtained - comp - read - gram);
          components = [
            { name: 'Composition (CQ)', obtained: comp, total: 40, weight: '40%' },
            { name: 'Reading Passages', obtained: read, total: 30, weight: '30%' },
            { name: 'Applied Grammar', obtained: gram, total: 20, weight: '20%' },
            { name: 'Listening & Viva', obtained: viva, total: 10, weight: '10%' }
          ];
        } else {
          const cq = Math.round(60 * (pct / 100));
          const mcq = Math.round(25 * (pct / 100));
          const proj = Math.round(10 * (Math.min(100, pct + 2) / 100));
          const viva = Math.max(0, obtained - cq - mcq - proj);
          components = [
            { name: 'Descriptive (CQ)', obtained: cq, total: 60, weight: '60%' },
            { name: 'Objective (MCQ)', obtained: mcq, total: 25, weight: '25%' },
            { name: 'Term Project', obtained: proj, total: 10, weight: '10%' },
            { name: 'Oral Defense', obtained: viva, total: 5, weight: '5%' }
          ];
        }
      }

      records.push({
        id: `${sub.code}-${tmpl.date}-${idx}`,
        testDate: tmpl.date,
        displayDate: tmpl.displayDate,
        term: tmpl.term,
        category: tmpl.category,
        subject: sub.subject,
        subjectCode: sub.code,
        studentScore: obtained,
        totalMarks,
        percentage: pct,
        classAverage: classAvg,
        deltaVsClassAvg: delta,
        grade,
        gpa,
        topicFocus: tmpl.topic,
        weightage: tmpl.weightage,
        teacherRemark: tmpl.remark,
        rankInClass: rank,
        components
      });
    });
  });

  return records.sort((a, b) => b.testDate.localeCompare(a.testDate));
};

export const StudentProgressCharts: React.FC = () => {
  const { showToast } = useToast();

  // State
  const [selectedStudentId, setSelectedStudentId] = useState<string>('ST-2024-001');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'all' | 'academic' | 'subject' | 'timeline' | 'goals' | 'attendance' | 'correlation'>('all');
  const [radarSubjectMode, setRadarSubjectMode] = useState<'competency' | 'marks'>('marks');
  const [selectedSubjectCode, setSelectedSubjectCode] = useState<string>('');
  const [subjectReviewSubTab, setSubjectReviewSubTab] = useState<'components' | 'trajectory' | 'topics'>('components');
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false);
  const [isTranscriptModalOpen, setIsTranscriptModalOpen] = useState<boolean>(false);
  const [customSmsMessage, setCustomSmsMessage] = useState<string>('');
  const [isSendingAlert, setIsSendingAlert] = useState<boolean>(false);

  // Academic Goals & Target Scores State
  const [studentGoalsMap, setStudentGoalsMap] = useState<Record<string, Record<string, AcademicGoal>>>(INITIAL_ACADEMIC_GOALS);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState<boolean>(false);
  const [goalEditingSubjectCode, setGoalEditingSubjectCode] = useState<string>('');
  const [goalTargetScore, setGoalTargetScore] = useState<number>(90);
  const [goalTargetTerm, setGoalTargetTerm] = useState<string>('Pre-Board Comprehensive Exam');
  const [goalPriority, setGoalPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [goalStrategyNotes, setGoalStrategyNotes] = useState<string>('');

  // Grade History Timeline State
  const [timelineSubjectScope, setTimelineSubjectScope] = useState<'current' | 'all'>('current');
  const [timelineCategoryFilter, setTimelineCategoryFilter] = useState<string>('all');
  const [timelineSearchQuery, setTimelineSearchQuery] = useState<string>('');
  const [timelineSortOrder, setTimelineSortOrder] = useState<'desc' | 'asc'>('desc');
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);
  const [expandedAssessmentIds, setExpandedAssessmentIds] = useState<Record<string, boolean>>({});

  // PDF Export State & Configuration
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [isPdfConfigModalOpen, setIsPdfConfigModalOpen] = useState<boolean>(false);
  const [pdfSchoolName, setPdfSchoolName] = useState<string>('SMART AMAR SCHOOL & COLLEGE');
  const [pdfAcademicYear, setPdfAcademicYear] = useState<string>('2024 - 2025');
  const [pdfIncludeSignatures, setPdfIncludeSignatures] = useState<boolean>(true);
  const [pdfIncludeSummaryStats, setPdfIncludeSummaryStats] = useState<boolean>(true);
  const [pdfArchiveTarget, setPdfArchiveTarget] = useState<string>('Official Institutional Archive & Guardian Copy');

  // Class Average Comparison Toggle State
  const [compareWithClassAverage, setCompareWithClassAverage] = useState<boolean>(true);

  // Available students for selection
  const filteredStudents = useMemo(() => {
    return MOCK_STUDENTS.filter(s => {
      if (classFilter !== 'all' && s.class.toLowerCase() !== classFilter.toLowerCase()) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = s.name.toLowerCase().includes(q);
        const matchRoll = s.rollNo.toLowerCase().includes(q);
        const matchId = s.id.toLowerCase().includes(q);
        if (!matchName && !matchRoll && !matchId) return false;
      }
      return true;
    });
  }, [classFilter, searchQuery]);

  // Selected student progress data
  const currentStudent = useMemo(() => {
    return getOrCreateStudentProgress(selectedStudentId);
  }, [selectedStudentId]);

  // Derived Class Average Benchmarks & Comparative Metrics
  const classAverages = useMemo(() => {
    const subjects = currentStudent.subjects || [];
    const totalSubjectAvg = subjects.reduce((sum, s) => sum + (s.classAverage || 70), 0);
    const classAvgScore = subjects.length > 0 ? Math.round((totalSubjectAvg / subjects.length) * 10) / 10 : 70.0;
    const overallScoreDelta = Math.round((currentStudent.overallPercentage - classAvgScore) * 10) / 10;

    // Derived cohort average GPA (typically ~3.70 for 70-72% mean mark)
    const classAvgGpa = Number((classAvgScore >= 80 ? 5.0 : classAvgScore >= 70 ? 4.0 : classAvgScore >= 60 ? 3.5 : 3.0).toFixed(2));
    const gpaDelta = Number((currentStudent.cumulativeGPA - classAvgGpa).toFixed(2));

    // Class average attendance mean benchmark
    const classAvgAttendance = 86.4;
    const attendanceDelta = Math.round((currentStudent.totalAttendancePercentage - classAvgAttendance) * 10) / 10;

    // Subject mastery count
    const subjectsAboveAvgCount = subjects.filter(s => s.percentage >= s.classAverage).length;
    const totalSubjects = subjects.length;

    // Multi-term average for class
    const termPoints = currentStudent.termProgress || [];
    const termClassMean = termPoints.length > 0
      ? Math.round((termPoints.reduce((sum, t) => sum + t.classAverage, 0) / termPoints.length) * 10) / 10
      : 70.5;

    // Find top lead subject
    let topLeadSubject = subjects[0];
    let maxDelta = -999;
    subjects.forEach(s => {
      const delta = s.percentage - s.classAverage;
      if (delta > maxDelta) {
        maxDelta = delta;
        topLeadSubject = s;
      }
    });

    // Subject-by-subject comparison array
    const subjectComparisons = subjects.map(s => {
      const delta = Math.round((s.percentage - s.classAverage) * 10) / 10;
      let standingBadge = { label: 'On Benchmark', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      if (delta >= 15) {
        standingBadge = { label: 'High Distinction Lead', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
      } else if (delta > 0) {
        standingBadge = { label: 'Above Class Average', color: 'bg-teal-50 text-teal-700 border-teal-200' };
      } else if (delta === 0) {
        standingBadge = { label: 'Equal to Class Average', color: 'bg-slate-100 text-slate-700 border-slate-200' };
      } else {
        standingBadge = { label: 'Below Class Average', color: 'bg-rose-50 text-rose-700 border-rose-200' };
      }

      return {
        ...s,
        delta,
        standingBadge
      };
    });

    return {
      classAvgScore,
      overallScoreDelta,
      classAvgGpa,
      gpaDelta,
      classAvgAttendance,
      attendanceDelta,
      subjectsAboveAvgCount,
      totalSubjects,
      termClassMean,
      topLeadSubject,
      maxDelta: Math.round(maxDelta * 10) / 10,
      subjectComparisons
    };
  }, [currentStudent]);

  // Active subject code defaulting to first enrolled subject of the selected student
  const activeSubjectCode = useMemo(() => {
    if (selectedSubjectCode && currentStudent.subjects.some(s => s.code === selectedSubjectCode)) {
      return selectedSubjectCode;
    }
    return currentStudent.subjects[0]?.code || '';
  }, [selectedSubjectCode, currentStudent]);

  // Granular details and component breakdown for the active subject
  const currentGranularSubject = useMemo(() => {
    return getGranularSubjectDetails(currentStudent, activeSubjectCode);
  }, [currentStudent, activeSubjectCode]);

  // Academic Goals for the selected student
  const currentStudentGoals = useMemo(() => {
    return studentGoalsMap[selectedStudentId] || {};
  }, [studentGoalsMap, selectedStudentId]);

  // Active Subject Goal
  const currentSubjectGoal = useMemo(() => {
    return currentStudentGoals[activeSubjectCode] || null;
  }, [currentStudentGoals, activeSubjectCode]);

  // Academic Goals Summary KPI & Aggregates
  const studentGoalsSummary = useMemo(() => {
    const goalsList = Object.values(currentStudentGoals);
    const totalGoals = goalsList.length;
    let achievedCount = 0;
    let onTrackCount = 0;
    let needsPushCount = 0;
    let criticalCount = 0;

    currentStudent.subjects.forEach(sub => {
      const g = currentStudentGoals[sub.code];
      if (g) {
        const gap = sub.percentage - g.targetScore;
        if (gap >= 0) achievedCount++;
        else if (gap >= -5) onTrackCount++;
        else if (gap >= -12) needsPushCount++;
        else criticalCount++;
      }
    });

    const avgTargetScore = totalGoals > 0
      ? Math.round(goalsList.reduce((sum, g) => sum + g.targetScore, 0) / totalGoals)
      : 90;

    return {
      totalGoals,
      totalSubjects: currentStudent.subjects.length,
      achievedCount,
      onTrackCount,
      needsPushCount,
      criticalCount,
      avgTargetScore
    };
  }, [currentStudentGoals, currentStudent]);

  // Handler to open Goal Modal
  const handleOpenSetGoalModal = (subjectCode?: string) => {
    const targetCode = subjectCode || activeSubjectCode || currentStudent.subjects[0]?.code || '';
    setGoalEditingSubjectCode(targetCode);
    const existing = currentStudentGoals[targetCode];
    const currentSub = currentStudent.subjects.find(s => s.code === targetCode);
    const currentScore = currentSub ? currentSub.percentage : 85;

    if (existing) {
      setGoalTargetScore(existing.targetScore);
      setGoalTargetTerm(existing.targetTerm);
      setGoalPriority(existing.priority);
      setGoalStrategyNotes(existing.strategyNotes);
    } else {
      const recommendedTarget = Math.min(100, Math.max(75, Math.ceil((currentScore + 5) / 5) * 5));
      setGoalTargetScore(recommendedTarget);
      setGoalTargetTerm('Pre-Board Comprehensive Exam');
      setGoalPriority(currentScore < 80 ? 'High' : 'Medium');
      setGoalStrategyNotes(`Focus on key conceptual derivations, weekly practice drills, and mock exam timing.`);
    }
    setIsGoalModalOpen(true);
  };

  // Handler to save or update Goal
  const handleSaveGoal = () => {
    if (!goalEditingSubjectCode) return;
    const sub = currentStudent.subjects.find(s => s.code === goalEditingSubjectCode);
    const subName = sub ? sub.subject : goalEditingSubjectCode;
    const targetGrade = goalTargetScore >= 80 ? 'A+' : goalTargetScore >= 70 ? 'A' : goalTargetScore >= 60 ? 'A-' : 'B';

    const newGoal: AcademicGoal = {
      id: `GOAL-${goalEditingSubjectCode}-${Date.now()}`,
      studentId: selectedStudentId,
      subjectCode: goalEditingSubjectCode,
      subjectName: subName,
      targetScore: goalTargetScore,
      targetGrade,
      targetTerm: goalTargetTerm,
      strategyNotes: goalStrategyNotes.trim() || 'Consistent revision and continuous evaluation.',
      priority: goalPriority,
      updatedAt: new Date().toISOString().split('T')[0],
      assignedBy: 'Admin (Academic Dean)'
    };

    setStudentGoalsMap(prev => ({
      ...prev,
      [selectedStudentId]: {
        ...(prev[selectedStudentId] || {}),
        [goalEditingSubjectCode]: newGoal
      }
    }));

    setIsGoalModalOpen(false);
    showToast(`Target goal of ${goalTargetScore}% set for ${subName} (${goalEditingSubjectCode}).`, 'success');
  };

  // Handler to delete Goal
  const handleDeleteGoal = (subjectCode: string) => {
    setStudentGoalsMap(prev => {
      const studentMap = { ...(prev[selectedStudentId] || {}) };
      delete studentMap[subjectCode];
      return {
        ...prev,
        [selectedStudentId]: studentMap
      };
    });
    setIsGoalModalOpen(false);
    showToast(`Removed target goal for ${subjectCode}.`, 'info');
  };

  // Quick adjust score handler
  const handleQuickAdjustScore = (subjectCode: string, delta: number) => {
    const existing = currentStudentGoals[subjectCode];
    if (!existing) return;
    const nextScore = Math.min(100, Math.max(50, existing.targetScore + delta));
    const targetGrade = nextScore >= 80 ? 'A+' : nextScore >= 70 ? 'A' : nextScore >= 60 ? 'A-' : 'B';
    setStudentGoalsMap(prev => ({
      ...prev,
      [selectedStudentId]: {
        ...(prev[selectedStudentId] || {}),
        [subjectCode]: {
          ...existing,
          targetScore: nextScore,
          targetGrade,
          updatedAt: new Date().toISOString().split('T')[0]
        }
      }
    }));
    showToast(`Adjusted target goal for ${existing.subjectName} to ${nextScore}%`, 'info');
  };

  // Grade History Timeline data mapped against the student and active subject
  const rawTimelineRecords = useMemo(() => {
    return getStudentGradeHistoryTimeline(
      currentStudent,
      timelineSubjectScope === 'current' ? activeSubjectCode : 'all'
    );
  }, [currentStudent, timelineSubjectScope, activeSubjectCode]);

  const filteredTimelineRecords = useMemo(() => {
    let list = rawTimelineRecords;
    if (timelineCategoryFilter !== 'all') {
      list = list.filter(r => r.category === timelineCategoryFilter);
    }
    if (timelineSearchQuery.trim()) {
      const q = timelineSearchQuery.toLowerCase();
      list = list.filter(r =>
        r.term.toLowerCase().includes(q) ||
        r.subject.toLowerCase().includes(q) ||
        r.subjectCode.toLowerCase().includes(q) ||
        r.topicFocus.toLowerCase().includes(q) ||
        r.displayDate.toLowerCase().includes(q)
      );
    }
    if (timelineSortOrder === 'asc') {
      list = [...list].sort((a, b) => a.testDate.localeCompare(b.testDate));
    } else {
      list = [...list].sort((a, b) => b.testDate.localeCompare(a.testDate));
    }
    return list;
  }, [rawTimelineRecords, timelineCategoryFilter, timelineSearchQuery, timelineSortOrder]);

  // Selected timeline assessment mapped directly to the subject breakdown chart
  const activeTimelineAssessment = useMemo(() => {
    if (!selectedAssessmentId) return null;
    return rawTimelineRecords.find(r => r.id === selectedAssessmentId) || null;
  }, [rawTimelineRecords, selectedAssessmentId]);

  // Summary metrics for the timeline
  const timelineStats = useMemo(() => {
    const total = rawTimelineRecords.length;
    if (total === 0) return { total: 0, avgScore: 0, highScore: 0, aboveAvgCount: 0 };
    const avgScore = Math.round(rawTimelineRecords.reduce((sum, r) => sum + r.percentage, 0) / total);
    const highScore = Math.max(...rawTimelineRecords.map(r => r.percentage));
    const aboveAvgCount = rawTimelineRecords.filter(r => r.percentage >= r.classAverage).length;
    return { total, avgScore, highScore, aboveAvgCount };
  }, [rawTimelineRecords]);

  // Handler to export timeline as CSV
  const handleExportTimelineCSV = () => {
    if (rawTimelineRecords.length === 0) return;
    const headers = ['Assessment Date', 'Term/Title', 'Category', 'Subject', 'Subject Code', 'Score Obtained', 'Total Marks', 'Percentage', 'Grade', 'GPA', 'Class Average', 'Delta vs Class Avg', 'Topic Tested', 'Teacher Feedback'];
    const rows = rawTimelineRecords.map(r => [
      `"${r.displayDate}"`,
      `"${r.term.replace(/"/g, '""')}"`,
      `"${r.category}"`,
      `"${r.subject}"`,
      `"${r.subjectCode}"`,
      r.studentScore,
      r.totalMarks,
      `${r.percentage}%`,
      r.grade,
      r.gpa.toFixed(1),
      `${r.classAverage}%`,
      `${r.deltaVsClassAvg >= 0 ? `+${r.deltaVsClassAvg}%` : `${r.deltaVsClassAvg}%`}`,
      `"${r.topicFocus.replace(/"/g, '""')}"`,
      `"${r.teacherRemark.replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${currentStudent.name.replace(/\s+/g, '_')}_Grade_History_Timeline.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Grade History Timeline exported as CSV for ${currentStudent.name}`, 'success');
  };

  // Classes list for filter
  const classOptions = useMemo(() => {
    const set = new Set<string>();
    MOCK_STUDENTS.forEach(s => set.add(s.class));
    return Array.from(set);
  }, []);

  // Compute attendance distribution breakdown
  const attendanceBreakdown = useMemo(() => {
    let presentTotal = 0;
    let lateTotal = 0;
    let leaveTotal = 0;
    let absentTotal = 0;
    let totalScheduled = 0;

    currentStudent.monthlyAttendance.forEach(m => {
      presentTotal += m.presentDays;
      lateTotal += m.lateDays;
      leaveTotal += m.leaveDays;
      absentTotal += m.absentDays;
      totalScheduled += m.totalDays;
    });

    return [
      { name: 'Present (On Time)', value: Math.max(0, presentTotal - lateTotal), color: '#10b981' },
      { name: 'Late Arrival', value: lateTotal, color: '#f59e0b' },
      { name: 'Approved Leave', value: leaveTotal, color: '#3b82f6' },
      { name: 'Unexcused Absent', value: absentTotal, color: '#ef4444' }
    ];
  }, [currentStudent]);

  // Handle open SMS Alert modal with pre-filled message
  const handleOpenAlert = () => {
    const isUnderThreshold = currentStudent.totalAttendancePercentage < 75;
    const defaultMsg = isUnderThreshold
      ? `Amar Smart School Official Notice: Dear Guardian ${currentStudent.guardian}, student ${currentStudent.name} (Roll: ${currentStudent.rollNo}, ${currentStudent.class}) has reached an attendance rate of ${currentStudent.totalAttendancePercentage}% which is below the mandatory 75% institutional requirement. Current academic percentage is ${currentStudent.overallPercentage}%. Please schedule a meeting with the School Principal.`
      : `Amar Smart School Academic Progress: Dear Guardian ${currentStudent.guardian}, student ${currentStudent.name} (Roll: ${currentStudent.rollNo}, ${currentStudent.class}) holds an attendance rate of ${currentStudent.totalAttendancePercentage}% with GPA ${currentStudent.cumulativeGPA.toFixed(2)} (${currentStudent.overallPercentage}%). Keep up the commendable progress!`;
    setCustomSmsMessage(defaultMsg);
    setIsAlertModalOpen(true);
  };

  const handleSendAlert = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingAlert(true);
    setTimeout(() => {
      setIsSendingAlert(false);
      setIsAlertModalOpen(false);
      showToast(`Official Progress Alert SMS successfully dispatched to ${currentStudent.guardianPhone} (${currentStudent.guardian})`, 'success');
    }, 600);
  };

  // Export official vector PDF report for the current student
  const handleDownloadPdfReport = (customOpts?: Partial<PDFExportOptions>) => {
    setIsExportingPdf(true);
    try {
      showToast(`Generating official PDF dossier for ${currentStudent.name}...`, 'info');
      exportStudentProgressReportToPDF(currentStudent, {
        schoolInfo: {
          schoolName: customOpts?.schoolInfo?.schoolName || pdfSchoolName,
          academicYear: customOpts?.schoolInfo?.academicYear || pdfAcademicYear,
          eiin: 'EIIN: 134209 • Code: 2041',
          established: 'Est. 1998',
          address: 'Plot 14, Academic Avenue, Dhanmondi, Dhaka - 1209'
        },
        includeSignatures: customOpts?.includeSignatures ?? pdfIncludeSignatures,
        includeSummaryStats: customOpts?.includeSummaryStats ?? pdfIncludeSummaryStats,
        filterSummary: {
          'Archival Purpose': customOpts?.filterSummary?.['Archival Purpose'] || pdfArchiveTarget,
          'Class & Section': `${currentStudent.class} (${currentStudent.section})`,
          'Roll Number': currentStudent.rollNo,
          'Academic Standing': currentStudent.academicStanding
        },
        ...customOpts
      });
      showToast(`Official PDF Report downloaded successfully for ${currentStudent.name} (Roll: ${currentStudent.rollNo})!`, 'success');
      setIsPdfConfigModalOpen(false);
    } catch (err) {
      console.error('Error generating official PDF:', err);
      showToast('Failed to export PDF report. Please try again.', 'error');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Color helper for academic standing
  const getStandingBadge = (standing: DetailedStudentProgress['academicStanding']) => {
    switch (standing) {
      case 'Distinction':
        return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Award, label: 'Distinction (Honor Roll)' };
      case 'Good Standing':
        return { bg: 'bg-blue-50 text-blue-700 border-blue-200', icon: CheckCircle2, label: 'Good Standing' };
      case 'Needs Support':
        return { bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: AlertTriangle, label: 'Needs Support' };
      case 'At-Risk':
        return { bg: 'bg-rose-50 text-rose-700 border-rose-200', icon: ShieldAlert, label: 'Academic Risk Alert' };
    }
  };

  // Color helper for attendance status
  const getAttendanceBadge = (status: DetailedStudentProgress['attendanceStatus']) => {
    switch (status) {
      case 'Exemplary':
        return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Exemplary (95%+)' };
      case 'Regular':
        return { bg: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Regular (85%-94%)' };
      case 'Warning':
        return { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Warning (75%-84%)' };
      case 'Critical':
        return { bg: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Critical (<75% Non-Compliant)' };
    }
  };

  const standingMeta = getStandingBadge(currentStudent.academicStanding);
  const attendanceMeta = getAttendanceBadge(currentStudent.attendanceStatus);
  const StandingIcon = standingMeta.icon;

  return (
    <div className="space-y-6">
      {/* ----------------------------------------------------------------- */}
      {/* TOP EXECUTIVE HEADER */}
      {/* ----------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-xs">
              <TrendingUp size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Student Progress & Attendance Analytics
                </h2>
                <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full font-bold">
                  Recharts Visual Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Executive monitoring of individual student multi-term performance trajectories, subject-wise mastery, and attendance compliance rates.
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start lg:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers size={13} />
            <span>Comprehensive</span>
          </button>
          <button
            onClick={() => setActiveTab('academic')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'academic'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen size={13} />
            <span>Academic Trends</span>
          </button>
          <button
            onClick={() => setActiveTab('subject')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'subject'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bookmark size={13} />
            <span>Subject Breakdown</span>
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'timeline'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History size={13} />
            <span>Grade History Timeline</span>
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'goals'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Target size={13} className="text-amber-500" />
            <span>Academic Goals</span>
            <span className="text-[9.5px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              {studentGoalsSummary.totalGoals}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'attendance'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock size={13} />
            <span>Attendance Deep-Dive</span>
          </button>
          <button
            onClick={() => setActiveTab('correlation')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'correlation'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity size={13} />
            <span>Performance vs Attendance</span>
          </button>

          {/* Quick Toggle for Class Average Comparison */}
          <button
            onClick={() => {
              const nextVal = !compareWithClassAverage;
              setCompareWithClassAverage(nextVal);
              showToast(
                nextVal
                  ? 'Class average comparison enabled across all performance metrics & charts.'
                  : 'Class average comparison disabled. Showing student individual data.',
                'info'
              );
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
              compareWithClassAverage
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="Toggle Class Average Comparison across all charts"
          >
            <Scale size={13} className={compareWithClassAverage ? 'text-indigo-600' : 'text-slate-400'} />
            <span className="hidden sm:inline">Class Avg:</span>
            <span className={`text-[10px] font-black uppercase px-1.5 py-0.2 rounded ${
              compareWithClassAverage ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {compareWithClassAverage ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* STUDENT SELECTION & FILTER BAR */}
      {/* ----------------------------------------------------------------- */}
      <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1">
              <Users size={14} className="text-indigo-600" />
              <span>Select Student To Analyze</span>
            </span>
            <span className="text-[11px] font-bold text-slate-400">
              ({filteredStudents.length} students matched)
            </span>
          </div>

          {/* Filters: Class dropdown & Search */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2.5 py-1 shadow-xs">
              <Filter size={13} className="text-slate-400" />
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="text-xs font-bold text-slate-700 bg-transparent outline-none cursor-pointer"
              >
                <option value="all">All Classes</option>
                {classOptions.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            <div className="relative w-48 sm:w-60">
              <Search size={13} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, roll, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Student Selector Carousel / Pill Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
          {filteredStudents.map(student => {
            const isSelected = student.id === selectedStudentId;
            const progress = STUDENT_PROGRESS_DATABASE[student.id];
            const gpa = progress ? progress.cumulativeGPA.toFixed(1) : '4.0';
            const att = progress ? `${progress.totalAttendancePercentage.toFixed(0)}%` : '90%';
            const isLowAtt = progress && progress.totalAttendancePercentage < 75;

            return (
              <button
                key={student.id}
                onClick={() => setSelectedStudentId(student.id)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all shrink-0 cursor-pointer border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <div className={`w-8 h-8 rounded-full overflow-hidden shrink-0 border ${
                  isSelected ? 'border-white/40' : 'border-slate-200'
                }`}>
                  {student.imageUrl ? (
                    <img src={student.imageUrl} alt={student.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center font-bold text-xs ${
                      isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {(student?.name || 'S').charAt(0)}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs truncate max-w-[120px]">{student.name}</span>
                    <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                      isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      #{student.rollNo}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] opacity-80 mt-0.5">
                    <span>{student.class}</span>
                    <span>•</span>
                    <span>GPA {gpa}</span>
                    <span>•</span>
                    <span className={isLowAtt && !isSelected ? 'text-rose-600 font-bold' : ''}>
                      {att} Att.
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* ACTIVE STUDENT PROFILE & KPI SCORECARD */}
      {/* ----------------------------------------------------------------- */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Top Student Header Bar */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border-2 border-indigo-200 shadow-xs bg-slate-100">
              {currentStudent.imageUrl ? (
                <img src={currentStudent.imageUrl} alt={currentStudent.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl font-black text-indigo-600 bg-indigo-50">
                  {(currentStudent?.name || 'S').charAt(0)}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  {currentStudent.name}
                </h3>
                <span className="font-mono text-xs font-black bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200">
                  ID: {currentStudent.id}
                </span>
                <span className="font-mono text-xs font-black bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-lg border border-indigo-200">
                  Roll: {currentStudent.rollNo}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                <span><strong>Class:</strong> {currentStudent.class} ({currentStudent.section})</span>
                <span>•</span>
                <span><strong>Guardian:</strong> {currentStudent.guardian}</span>
                <span>•</span>
                <span className="flex items-center gap-1 font-mono text-[11px] text-slate-600">
                  <Phone size={11} className="text-slate-400" />
                  {currentStudent.guardianPhone}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            {/* Compare against Class Average Toggle Switch */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all bg-slate-50 border-slate-200 hover:border-indigo-300 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Scale size={14} className={compareWithClassAverage ? 'text-indigo-600' : 'text-slate-400'} />
                <span className="hidden sm:inline">Compare Class Avg</span>
                <span className="sm:hidden">Class Avg</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={compareWithClassAverage}
                onClick={() => {
                  const nextVal = !compareWithClassAverage;
                  setCompareWithClassAverage(nextVal);
                  showToast(
                    nextVal
                      ? 'Class average comparison enabled across all performance metrics & charts.'
                      : 'Class average comparison disabled. Showing student individual data.',
                    'info'
                  );
                }}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  compareWithClassAverage ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
                title={compareWithClassAverage ? 'Click to disable Class Average comparison' : 'Click to compare student metrics against Class Average'}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    compareWithClassAverage ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className={`text-[10px] font-black uppercase px-1.5 py-0.2 rounded ${
                compareWithClassAverage ? 'bg-indigo-100 text-indigo-700 font-mono' : 'bg-slate-200 text-slate-600 font-mono'
              }`}>
                {compareWithClassAverage ? 'ON' : 'OFF'}
              </span>
            </div>

            <button
              onClick={() => handleDownloadPdfReport()}
              disabled={isExportingPdf}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              title="Download Official PDF Report for Physical Record-Keeping"
            >
              <Download size={13} />
              <span>{isExportingPdf ? 'Exporting PDF...' : 'Download PDF Report'}</span>
            </button>
            <button
              onClick={() => setIsPdfConfigModalOpen(true)}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold transition-colors cursor-pointer"
              title="Configure PDF Export Options & Archival Details"
            >
              <SlidersHorizontal size={13} />
            </button>
            <button
              onClick={() => handleOpenSetGoalModal()}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Set or manage academic target scores and goals for this student"
            >
              <Target size={13} className="text-amber-600" />
              <span>Set Academic Goal</span>
              <span className="text-[10px] font-mono font-bold bg-amber-200/80 text-amber-900 px-1.5 py-0.2 rounded-md">
                {studentGoalsSummary.totalGoals} Set
              </span>
            </button>
            <button
              onClick={handleOpenAlert}
              className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Send Progress Alert to Guardian via SMS"
            >
              <Send size={13} className="text-amber-600" />
              <span>Send Guardian Alert</span>
            </button>
            <button
              onClick={() => setIsTranscriptModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Printer size={13} />
              <span>Print Transcript</span>
            </button>
          </div>
        </div>

        {/* 4 Primary KPI Tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 bg-slate-50/40">
          {/* KPI 1: Cumulative GPA & Score */}
          <div className="p-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
              <span>Cumulative Performance</span>
              <Award size={15} className="text-indigo-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">
                {currentStudent.overallPercentage}%
              </span>
              <span className="text-xs font-bold text-indigo-600 font-mono">
                GPA {currentStudent.cumulativeGPA.toFixed(2)}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-emerald-600">
              <ArrowUpRight size={12} />
              <span>+3.2% vs previous term</span>
            </div>
            {compareWithClassAverage && (
              <div className="mt-2 flex items-center justify-between text-[11px] bg-indigo-50/90 rounded-md px-2 py-0.5 border border-indigo-100">
                <span className="text-slate-500 font-medium">Class Avg: {classAverages.classAvgScore}%</span>
                <span className={`font-mono font-bold ${classAverages.overallScoreDelta >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {classAverages.overallScoreDelta >= 0 ? `+${classAverages.overallScoreDelta.toFixed(1)}%` : `${classAverages.overallScoreDelta.toFixed(1)}%`}
                </span>
              </div>
            )}
          </div>

          {/* KPI 2: Overall Attendance % */}
          <div className="p-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
              <span>Attendance Rate</span>
              <Clock size={15} className="text-teal-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-2xl font-black ${
                currentStudent.totalAttendancePercentage < 75 ? 'text-rose-600' : 'text-slate-900'
              }`}>
                {currentStudent.totalAttendancePercentage}%
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${attendanceMeta.bg}`}>
                {attendanceMeta.label}
              </span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              {currentStudent.totalAttendancePercentage >= 75 ? (
                <span className="text-emerald-600 font-bold">Complies with 75% Board Rule</span>
              ) : (
                <span className="text-rose-600 font-bold flex items-center gap-1">
                  <AlertTriangle size={11} /> Below mandatory threshold
                </span>
              )}
            </div>
            {compareWithClassAverage && (
              <div className="mt-2 flex items-center justify-between text-[11px] bg-teal-50/90 rounded-md px-2 py-0.5 border border-teal-100">
                <span className="text-slate-500 font-medium">Class Avg: {classAverages.classAvgAttendance}%</span>
                <span className={`font-mono font-bold ${classAverages.attendanceDelta >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {classAverages.attendanceDelta >= 0 ? `+${classAverages.attendanceDelta.toFixed(1)}%` : `${classAverages.attendanceDelta.toFixed(1)}%`}
                </span>
              </div>
            )}
          </div>

          {/* KPI 3: Class Rank & Standing */}
          <div className="p-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
              <span>Class Rank & Standing</span>
              <GraduationCap size={15} className="text-purple-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">
                #{currentStudent.classRank}
              </span>
              <span className="text-xs font-medium text-slate-500">
                of {currentStudent.totalStudentsInClass} students
              </span>
            </div>
            <div className="mt-1">
              <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full border ${standingMeta.bg}`}>
                <StandingIcon size={11} />
                <span>{standingMeta.label}</span>
              </span>
            </div>
            {compareWithClassAverage && (
              <div className="mt-2 flex items-center justify-between text-[11px] bg-purple-50/90 rounded-md px-2 py-0.5 border border-purple-100">
                <span className="text-slate-500 font-medium">Median: #{Math.round(currentStudent.totalStudentsInClass / 2)}</span>
                <span className="font-mono font-bold text-purple-700">
                  Top {Math.max(1, Math.round((currentStudent.classRank / currentStudent.totalStudentsInClass) * 100))}%
                </span>
              </div>
            )}
          </div>

          {/* KPI 4: Percentile & Engagement */}
          <div className="p-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
              <span>Cohort Percentile</span>
              <TrendingUp size={15} className="text-amber-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">
                {currentStudent.percentile}th
              </span>
              <span className="text-xs font-medium text-slate-500">percentile</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500">
              Top {(100 - currentStudent.percentile).toFixed(1)}% of academic tier
            </div>
            {compareWithClassAverage && (
              <div className="mt-2 flex items-center justify-between text-[11px] bg-amber-50/90 rounded-md px-2 py-0.5 border border-amber-100">
                <span className="text-slate-500 font-medium">Exceeds Avg:</span>
                <span className="font-mono font-bold text-emerald-700">
                  {classAverages.subjectsAboveAvgCount}/{classAverages.totalSubjects} Subjects
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Strengths & Growth Areas Chips */}
        <div className="p-4 bg-white border-t border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-500 shrink-0">Key Strengths:</span>
            {currentStudent.strengths.map((str, i) => (
              <span key={i} className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 text-[11px]">
                ✓ {str}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-500 shrink-0">Intervention Areas:</span>
            {currentStudent.growthAreas.map((area, i) => (
              <span key={i} className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-bold border border-amber-200 text-[11px]">
                ! {area}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* CLASS AVERAGE COMPARISON MATRIX & COHORT BENCHMARK PANEL */}
      {/* ----------------------------------------------------------------- */}
      {compareWithClassAverage && (
        <div className="bg-gradient-to-r from-indigo-50/80 via-slate-50/90 to-blue-50/60 rounded-2xl border border-indigo-200/90 p-5 shadow-xs transition-all">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4 pb-3 border-b border-indigo-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
                <Scale size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-black text-slate-900 tracking-tight">
                    Class Average Benchmark Comparison Matrix
                  </h4>
                  <span className="text-[10px] font-mono font-bold bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                    {currentStudent.class} ({currentStudent.section}) • Cohort: {currentStudent.totalStudentsInClass} Students
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Side-by-side comparative analysis of {currentStudent.name}'s academic standing and attendance against the class median.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Comparison Status:</span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black flex items-center gap-1">
                <CheckCircle2 size={13} />
                Exceeds Baseline in {classAverages.subjectsAboveAvgCount} of {classAverages.totalSubjects} Subjects
              </span>
            </div>
          </div>

          {/* 4 Benchmark Comparison Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. Academic Score vs Class Average */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
                <span>Overall Exam Score</span>
                <Award size={14} className="text-indigo-600" />
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Student</span>
                  <span className="text-lg font-black text-slate-900">{currentStudent.overallPercentage}%</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Class Avg</span>
                  <span className="text-lg font-bold text-slate-600">{classAverages.classAvgScore}%</span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Net Delta:</span>
                <span className={`font-black font-mono flex items-center gap-0.5 ${
                  classAverages.overallScoreDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {classAverages.overallScoreDelta >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                  {classAverages.overallScoreDelta >= 0 ? `+${classAverages.overallScoreDelta.toFixed(1)}%` : `${classAverages.overallScoreDelta.toFixed(1)}%`}
                </span>
              </div>
            </div>

            {/* 2. Cumulative GPA vs Class Average */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
                <span>Cumulative GPA</span>
                <GraduationCap size={14} className="text-purple-600" />
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Student GPA</span>
                  <span className="text-lg font-black text-indigo-600">{currentStudent.cumulativeGPA.toFixed(2)}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Class Mean</span>
                  <span className="text-lg font-bold text-slate-600">{classAverages.classAvgGpa.toFixed(2)}</span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Point Delta:</span>
                <span className={`font-black font-mono flex items-center gap-0.5 ${
                  classAverages.gpaDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {classAverages.gpaDelta >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                  {classAverages.gpaDelta >= 0 ? `+${classAverages.gpaDelta.toFixed(2)} pts` : `${classAverages.gpaDelta.toFixed(2)} pts`}
                </span>
              </div>
            </div>

            {/* 3. Attendance Rate vs Class Average */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
                <span>Attendance Rate</span>
                <Clock size={14} className="text-teal-600" />
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Student Rate</span>
                  <span className={`text-lg font-black ${
                    currentStudent.totalAttendancePercentage < 75 ? 'text-rose-600' : 'text-slate-900'
                  }`}>
                    {currentStudent.totalAttendancePercentage}%
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Class Avg</span>
                  <span className="text-lg font-bold text-slate-600">{classAverages.classAvgAttendance}%</span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Variance:</span>
                <span className={`font-black font-mono flex items-center gap-0.5 ${
                  classAverages.attendanceDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {classAverages.attendanceDelta >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                  {classAverages.attendanceDelta >= 0 ? `+${classAverages.attendanceDelta.toFixed(1)}%` : `${classAverages.attendanceDelta.toFixed(1)}%`}
                </span>
              </div>
            </div>

            {/* 4. Subject Standing & Lead Subject */}
            <div className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
                <span>Top Lead Discipline</span>
                <Sparkles size={14} className="text-amber-600" />
              </div>
              <div className="mt-1">
                <div className="text-xs font-bold text-slate-800 truncate" title={classAverages.topLeadSubject?.subject}>
                  {classAverages.topLeadSubject?.subject}
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-slate-500">Student: <strong>{classAverages.topLeadSubject?.percentage}%</strong></span>
                  <span className="text-slate-500">Class Avg: <strong>{classAverages.topLeadSubject?.classAverage}%</strong></span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Lead Margin:</span>
                <span className="font-black text-emerald-600 font-mono">
                  +{classAverages.maxDelta}% over avg
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* SECTION 1: ACADEMIC PERFORMANCE MULTI-TERM TREND (RECHARTS) */}
      {/* ----------------------------------------------------------------- */}
      {(activeTab === 'all' || activeTab === 'academic') && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                  <BarChart2 size={16} />
                </span>
                <h4 className="font-black text-sm text-slate-900 tracking-tight">
                  Multi-Term Academic Score Progression & Benchmarks
                </h4>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluation results across class tests and term examinations compared with Class Average and Distinction (80%) benchmark.
              </p>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block" /> {currentStudent.name}
              </span>
              {compareWithClassAverage && (
                <span className="flex items-center gap-1 text-indigo-700">
                  <span className="w-3 h-0.5 bg-slate-400 inline-block" /> Class Average
                </span>
              )}
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-emerald-500 inline-block" /> Distinction (80%)
              </span>
            </div>
          </div>

          {/* Area / Line Chart with Recharts */}
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentStudent.termProgress} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="studentScoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="term" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                <YAxis domain={[30, 100]} tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" unit="%" />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as TermProgressPoint;
                      const delta = data.studentScore - data.classAverage;
                      return (
                        <div className="bg-slate-900 text-white text-xs p-3 rounded-xl shadow-lg border border-slate-800">
                          <div className="font-bold text-indigo-300 mb-1">{label} ({data.testDate})</div>
                          <div className="space-y-1">
                            <div className="flex justify-between gap-4 font-mono">
                              <span>Student Score:</span>
                              <span className="font-bold text-white">{data.studentScore}% (Grade: {data.grade})</span>
                            </div>
                            <div className="flex justify-between gap-4 font-mono text-slate-400">
                              <span>Class Average:</span>
                              <span>{data.classAverage}%</span>
                            </div>
                            <div className="flex justify-between gap-4 font-mono pt-1 border-t border-slate-800 text-[11px]">
                              <span>Benchmark Delta:</span>
                              <span className={delta >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                                {delta >= 0 ? `+${delta}%` : `${delta}%`}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={80} stroke="#10b981" strokeDasharray="4 4" label={{ value: 'Distinction (80%)', fill: '#10b981', fontSize: 10, position: 'right' }} />
                <ReferenceLine y={40} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Passing Cutoff (40%)', fill: '#ef4444', fontSize: 10, position: 'right' }} />
                <Area
                  type="monotone"
                  dataKey="studentScore"
                  name={currentStudent.name}
                  stroke="#4f46e5"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#studentScoreGrad)"
                  dot={{ r: 4, stroke: '#4f46e5', strokeWidth: 2, fill: '#ffffff' }}
                  activeDot={{ r: 6, fill: '#4f46e5' }}
                />
                {compareWithClassAverage && (
                  <Line
                    type="monotone"
                    dataKey="classAverage"
                    name="Class Average"
                    stroke="#94a3b8"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 3, stroke: '#94a3b8', strokeWidth: 1, fill: '#ffffff' }}
                    activeDot={{ r: 5, fill: '#94a3b8' }}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* SECTION 2: SUBJECT-WISE MASTERY & COMPETENCY RADAR (RECHARTS) */}
      {/* ----------------------------------------------------------------- */}
      {(activeTab === 'all' || activeTab === 'academic') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Subject Marks Bar Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                    <BookOpen size={16} />
                  </span>
                  <h4 className="font-black text-sm text-slate-900 tracking-tight">
                    Subject-Wise Marks vs Class Average
                  </h4>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct evaluation of student subject scores with grade tiers (A+, A, B, C, F).
                </p>
              </div>

              <div className="text-[11px] font-bold text-slate-500 flex items-center gap-2">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-indigo-600" /> Student
                </span>
                {compareWithClassAverage && (
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded bg-slate-300" /> Class Avg
                  </span>
                )}
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentStudent.subjects} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" vertical={false} />
                  <XAxis
                    dataKey="subject"
                    angle={-20}
                    textAnchor="end"
                    interval={0}
                    height={40}
                    tick={{ fontSize: 10.5, fill: '#64748b' }}
                  />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" unit="%" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload as SubjectPerformance;
                        const delta = Math.round((item.percentage - item.classAverage) * 10) / 10;
                        const goal = currentStudentGoals[item.code];
                        const goalMetrics = goal ? calculateGoalMetrics(item.percentage, goal.targetScore) : null;
                        return (
                          <div className="bg-slate-900 text-white text-xs p-2.5 rounded-xl shadow-lg border border-slate-800 min-w-[210px]">
                            <div className="font-bold text-white flex items-center justify-between">
                              <span>{item.subject}</span>
                              <span className="font-mono text-[10px] text-slate-400">({item.code})</span>
                            </div>
                            <div className="font-mono mt-1 space-y-0.5">
                              <div>Obtained: <span className="font-bold text-emerald-400">{item.obtained}/{item.total} ({item.percentage}%)</span></div>
                              <div>Grade & GPA: <span className="font-bold text-indigo-300">{item.grade} (Point: {item.gpa})</span></div>
                              {compareWithClassAverage && (
                                <>
                                  <div className="text-slate-400">Class Average: {item.classAverage}%</div>
                                  <div className={`pt-0.5 border-t border-slate-800 font-bold ${delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    Variance: {delta >= 0 ? `+${delta}%` : `${delta}%`} vs Class Mean
                                  </div>
                                </>
                              )}
                              {goal && (
                                <div className="pt-1.5 mt-1 border-t border-slate-800 space-y-0.5">
                                  <div className="flex justify-between items-center text-amber-300">
                                    <span className="flex items-center gap-1 font-bold">🎯 Target Goal:</span>
                                    <span className="font-bold">{goal.targetScore}% ({goal.targetGrade})</span>
                                  </div>
                                  <div className="flex justify-between items-center text-[10px]">
                                    <span className="text-slate-400">Milestone:</span>
                                    <span className="text-slate-300 truncate max-w-[130px]">{goal.targetTerm}</span>
                                  </div>
                                  <div className="flex justify-between items-center text-[10.5px]">
                                    <span className="text-slate-400">Target Gap:</span>
                                    <span className={goalMetrics && goalMetrics.gap >= 0 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                                      {goalMetrics ? (goalMetrics.gap >= 0 ? `+${goalMetrics.gap}% (Goal Met)` : `${goalMetrics.gap}% to Target`) : ''}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="obtained"
                    name="Obtained Marks"
                    radius={[6, 6, 0, 0]}
                    className="cursor-pointer"
                    onClick={(entry: any) => {
                      if (entry && entry.code) {
                        setSelectedSubjectCode(entry.code);
                        showToast(`Focused deep-dive review on ${entry.subject} (${entry.code})`, 'info');
                      }
                    }}
                  >
                    {currentStudent.subjects.map((entry, index) => {
                      // Color based on marks and highlight active subject
                      const isSelected = entry.code === activeSubjectCode;
                      const color = entry.percentage >= 80 ? '#10b981' : entry.percentage >= 70 ? '#6366f1' : entry.percentage >= 50 ? '#f59e0b' : '#ef4444';
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={color}
                          stroke={isSelected ? '#1e1b4b' : 'none'}
                          strokeWidth={isSelected ? 2.5 : 0}
                        />
                      );
                    })}
                  </Bar>
                  {compareWithClassAverage && (
                    <Bar dataKey="classAverage" name="Class Average" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Subject-by-Subject Benchmark Comparison Table */}
            {compareWithClassAverage && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Scale size={13} className="text-indigo-600" />
                    Subject-by-Subject Benchmark Variance Breakdown
                  </span>
                  <span className="text-[11px] font-bold text-slate-500">
                    Click any subject row to inspect granular metrics below
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-y border-slate-200/80">
                      <tr>
                        <th className="py-2 px-2.5">Subject</th>
                        <th className="py-2 px-2 text-center">Student Score</th>
                        <th className="py-2 px-2 text-center">Class Avg</th>
                        <th className="py-2 px-2 text-center">Delta (Δ)</th>
                        <th className="py-2 px-2.5 text-center">Academic Goal</th>
                        <th className="py-2 px-2.5 text-right">Standing</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {classAverages.subjectComparisons.map((sub, i) => {
                        const isSelected = sub.code === activeSubjectCode;
                        const goal = currentStudentGoals[sub.code];
                        const goalMetrics = goal ? calculateGoalMetrics(sub.percentage, goal.targetScore) : null;
                        return (
                          <tr
                            key={i}
                            onClick={() => {
                              setSelectedSubjectCode(sub.code);
                              showToast(`Focused granular review on ${sub.subject} (${sub.code})`, 'info');
                            }}
                            className={`cursor-pointer transition-colors ${
                              isSelected ? 'bg-indigo-50/90 font-medium' : 'hover:bg-slate-50/70'
                            }`}
                          >
                            <td className="py-2 px-2.5 font-bold text-slate-800 flex items-center gap-1.5">
                              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 inline-block" />}
                              <span>{sub.subject}</span>
                              <span className="font-mono text-[10px] text-slate-400">({sub.code})</span>
                            </td>
                            <td className="py-2 px-2 text-center font-mono font-bold text-slate-900">
                              {sub.obtained}/{sub.total} ({sub.percentage}%)
                            </td>
                            <td className="py-2 px-2 text-center font-mono text-slate-600">
                              {sub.classAverage}%
                            </td>
                            <td className="py-2 px-2 text-center font-mono font-black">
                              <span className={sub.delta >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                                {sub.delta >= 0 ? `+${sub.delta}%` : `${sub.delta}%`}
                              </span>
                            </td>
                            <td className="py-2 px-2.5 text-center">
                              {goal ? (
                                <div className="inline-flex items-center gap-1.5">
                                  <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-amber-50 text-amber-800 border border-amber-200">
                                    🎯 {goal.targetScore}%
                                  </span>
                                  <span className={`text-[10px] font-mono font-bold ${goalMetrics && goalMetrics.gap >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                    {goalMetrics && (goalMetrics.gap >= 0 ? `+${goalMetrics.gap}%` : `${goalMetrics.gap}%`)}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenSetGoalModal(sub.code);
                                    }}
                                    className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                                    title="Edit target goal for this subject"
                                  >
                                    <Edit3 size={11} />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenSetGoalModal(sub.code);
                                  }}
                                  className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-0.5"
                                >
                                  <Plus size={10} /> Set Goal
                                </button>
                              )}
                            </td>
                            <td className="py-2 px-2.5 text-right">
                              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${sub.standingBadge.color}`}>
                                {sub.standingBadge.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Radar Chart: Core Competency Analysis */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
                    <Sparkles size={16} />
                  </span>
                  <h4 className="font-black text-sm text-slate-900 tracking-tight">
                    360° Academic Competency
                  </h4>
                </div>
              </div>
              <p className="text-xs text-slate-500 mb-2">
                Student skill mastery across 6 holistic dimensions vs Institutional Benchmark.
              </p>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius="75%" data={currentStudent.competencyRadar}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="skill" tick={{ fontSize: 9.5, fill: '#475569' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: '#94a3b8' }} stroke="#cbd5e1" />
                  <Radar name={currentStudent.name} dataKey="student" stroke="#6366f1" fill="#6366f1" fillOpacity={0.45} />
                  {compareWithClassAverage && (
                    <Radar name="Benchmark" dataKey="benchmark" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.15} />
                  )}
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-4 text-[11px] font-bold text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> Student ({currentStudent.name})
              </span>
              {compareWithClassAverage && (
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> School Benchmark
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* SECTION 2.5: INDIVIDUAL SUBJECT DEEP-DIVE & GRANULAR ACADEMIC REVIEW (SECONDARY CHART) */}
      {/* ----------------------------------------------------------------- */}
      {(activeTab === 'all' || activeTab === 'academic' || activeTab === 'subject' || activeTab === 'timeline') && currentGranularSubject && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-5">
          {/* Header & Sub-Tab Switcher */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
                  <Bookmark size={18} />
                </span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-black text-base text-slate-900 tracking-tight">
                      Granular Subject Academic Breakdown & Evaluation
                    </h3>
                    <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full font-bold">
                      Secondary Academic Visualizer
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Deconstructs {currentStudent.name}'s performance in <strong>{currentGranularSubject.subject}</strong> across assessment components (CQ, MCQ, Lab, CA), multi-term trajectory, and chapter-level mastery.
                  </p>
                </div>
              </div>
            </div>

            {/* View Sub-Tabs: Components vs Trajectory vs Topics */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 self-start lg:self-auto">
              <button
                onClick={() => setSubjectReviewSubTab('components')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  subjectReviewSubTab === 'components'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarChart2 size={13} />
                <span>Assessment Components</span>
              </button>
              <button
                onClick={() => setSubjectReviewSubTab('trajectory')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  subjectReviewSubTab === 'trajectory'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TrendingUp size={13} />
                <span>Subject Trajectory</span>
              </button>
              <button
                onClick={() => setSubjectReviewSubTab('topics')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  subjectReviewSubTab === 'topics'
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Target size={13} />
                <span>Curriculum Topics</span>
              </button>
            </div>
          </div>

          {/* Interactive Subject Pill Selection Carousel */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
              <BookOpen size={12} />
              <span>Select Subject to Review ({currentStudent.subjects.length} Enrolled):</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {currentStudent.subjects.map((sub) => {
                const isSelected = sub.code === activeSubjectCode;
                const delta = Math.round((sub.percentage - sub.classAverage) * 10) / 10;
                return (
                  <button
                    key={sub.code}
                    onClick={() => {
                      setSelectedSubjectCode(sub.code);
                      showToast(`Selected ${sub.subject} for detailed academic review`, 'info');
                    }}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all shrink-0 cursor-pointer border ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs">{sub.subject}</span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                          isSelected ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {sub.code}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] opacity-90 mt-0.5 font-mono">
                        <span className="font-bold">{sub.obtained}/{sub.total} ({sub.percentage}%)</span>
                        <span>•</span>
                        <span>Grade {sub.grade}</span>
                        <span>•</span>
                        <span className={delta >= 0 ? (isSelected ? 'text-emerald-200 font-bold' : 'text-emerald-600 font-bold') : (isSelected ? 'text-rose-200 font-bold' : 'text-rose-600 font-bold')}>
                          {delta >= 0 ? `+${delta}%` : `${delta}%`}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Subject Executive Header Card */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-base font-black text-slate-900">
                    {currentGranularSubject.subject}
                  </h4>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg">
                    {currentGranularSubject.code}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg">
                    Standing: #{currentGranularSubject.subjectRank} of {currentGranularSubject.totalStudents} Students
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
                  <span className="font-medium text-slate-700">Course Faculty: <strong>{currentGranularSubject.teacherName}</strong></span>
                  <span>•</span>
                  <span>Period Attendance: <strong className="text-slate-800">{currentGranularSubject.periodAttendanceRate}%</strong> ({currentGranularSubject.periodsAttended}/{currentGranularSubject.totalPeriods} periods)</span>
                  <span>•</span>
                  <span>Homework Turn-in: <strong className="text-slate-800">{currentGranularSubject.homeworkSubmissionRate}%</strong></span>
                </div>
              </div>

              {/* Quick Score Badges & Target Goal */}
              <div className="flex items-center gap-3 self-start md:self-auto shrink-0 flex-wrap">
                {/* Academic Goal Target Card */}
                <div className="bg-white rounded-xl border border-amber-200/90 p-2.5 shadow-2xs min-w-[210px]">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                      <Target size={12} className="text-amber-600" />
                      <span>Academic Goal</span>
                    </div>
                    <button
                      onClick={() => handleOpenSetGoalModal(currentGranularSubject.code)}
                      className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer flex items-center gap-0.5"
                    >
                      <Edit3 size={10} />
                      <span>{currentSubjectGoal ? 'Edit' : 'Set'}</span>
                    </button>
                  </div>
                  {currentSubjectGoal ? (
                    <div>
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-base font-black text-slate-900 font-mono">
                          {currentSubjectGoal.targetScore}% <span className="text-xs text-amber-700 font-bold">({currentSubjectGoal.targetGrade})</span>
                        </span>
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border ${
                          currentGranularSubject.overallPercentage >= currentSubjectGoal.targetScore
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {currentGranularSubject.overallPercentage >= currentSubjectGoal.targetScore
                            ? `+${Math.round((currentGranularSubject.overallPercentage - currentSubjectGoal.targetScore) * 10) / 10}% Exceeded`
                            : `${Math.round((currentGranularSubject.overallPercentage - currentSubjectGoal.targetScore) * 10) / 10}% to Goal`}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            currentGranularSubject.overallPercentage >= currentSubjectGoal.targetScore ? 'bg-emerald-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.round((currentGranularSubject.overallPercentage / currentSubjectGoal.targetScore) * 100))}%` }}
                        />
                      </div>
                      <div className="text-[9.5px] text-slate-400 mt-1 truncate" title={currentSubjectGoal.targetTerm}>
                        Target: {currentSubjectGoal.targetTerm}
                      </div>
                    </div>
                  ) : (
                    <div className="py-0.5">
                      <button
                        onClick={() => handleOpenSetGoalModal(currentGranularSubject.code)}
                        className="w-full py-1 text-center text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-dashed border-amber-300 rounded-lg cursor-pointer transition-colors"
                      >
                        + Set Target Score
                      </button>
                    </div>
                  )}
                </div>

                <div className="w-px h-10 bg-slate-200 hidden sm:block" />

                <div className="text-right">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Subject Score</div>
                  <div className="text-xl font-black text-indigo-600">
                    {currentGranularSubject.overallScore}/{currentGranularSubject.overallTotal} ({currentGranularSubject.overallPercentage}%)
                  </div>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div className="text-right">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Grade & GPA</div>
                  <div className="text-xl font-black text-slate-900">
                    {currentGranularSubject.overallGrade} <span className="text-xs font-normal text-slate-500">({currentGranularSubject.overallGpa.toFixed(1)})</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* MAIN INTERACTIVE SECTION: SECONDARY SUBJECT BREAKDOWN CHART (LEFT) MAPPED AGAINST GRADE HISTORY TIMELINE (RIGHT) */}
          {/* ------------------------------------------------------------- */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: SECONDARY SUBJECT BREAKDOWN CHART & ANALYSIS (7 COLS) */}
            <div className="xl:col-span-7 space-y-4">
              {/* Active Mapped Assessment Callout Banner (when an assessment is clicked in the timeline) */}
              {activeTimelineAssessment && (
                <div className="bg-indigo-50/90 border border-indigo-200 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-indigo-600 text-white rounded-lg shrink-0">
                      <CheckCircle2 size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-indigo-950">
                          Timeline Mapping Active: {activeTimelineAssessment.term}
                        </span>
                        <span className="font-mono text-[10px] bg-indigo-200 text-indigo-900 px-1.5 py-0.2 rounded font-bold">
                          {activeTimelineAssessment.displayDate}
                        </span>
                        <span className="font-mono text-[10px] bg-white border border-indigo-200 text-indigo-800 px-1.5 py-0.2 rounded font-bold">
                          {activeTimelineAssessment.category}
                        </span>
                      </div>
                      <div className="text-slate-600 mt-0.5 text-[11px] flex items-center gap-2 flex-wrap font-mono">
                        <span>Score: <strong className="text-slate-900">{activeTimelineAssessment.studentScore}/{activeTimelineAssessment.totalMarks} ({activeTimelineAssessment.percentage}%)</strong></span>
                        <span>•</span>
                        <span>Grade: <strong>{activeTimelineAssessment.grade}</strong> ({activeTimelineAssessment.gpa.toFixed(1)})</span>
                        <span>•</span>
                        <span>Class Avg: {activeTimelineAssessment.classAverage}%</span>
                        <span>•</span>
                        <span className={activeTimelineAssessment.deltaVsClassAvg >= 0 ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                          Δ {activeTimelineAssessment.deltaVsClassAvg >= 0 ? `+${activeTimelineAssessment.deltaVsClassAvg}%` : `${activeTimelineAssessment.deltaVsClassAvg}%`}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedAssessmentId(null);
                      showToast('Cleared timeline assessment filter. Showing cumulative metrics.', 'info');
                    }}
                    className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-white px-2.5 py-1 rounded-lg border border-indigo-200 shrink-0 cursor-pointer shadow-2xs hover:bg-indigo-50 transition-colors"
                  >
                    Reset Mapping
                  </button>
                </div>
              )}

              {/* SUB-TAB 1: ASSESSMENT COMPONENTS BREAKDOWN */}
              {subjectReviewSubTab === 'components' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h5 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <BarChart2 size={14} className="text-indigo-600" />
                        <span>Evaluation Components Breakdown (Creative Theory / MCQ / Lab / CA)</span>
                      </h5>
                      <p className="text-xs text-slate-500">
                        Granular deconstruction of marks obtained in each curriculum domain compared to the class component baseline.
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded bg-indigo-600 inline-block" /> Student Score %
                      </span>
                      {compareWithClassAverage && (
                        <span className="flex items-center gap-1 text-slate-600">
                          <span className="w-2.5 h-2.5 rounded bg-slate-300 inline-block" /> Class Avg %
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Component Recharts Bar Chart */}
                  <div className="h-60 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={currentGranularSubject.components} margin={{ top: 10, right: 10, left: -15, bottom: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="shortName" tick={{ fontSize: 10.5, fill: '#475569', fontWeight: 600 }} stroke="#cbd5e1" />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" unit="%" />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const c = payload[0].payload as SubjectComponentBreakdown;
                              const delta = Math.round((c.percentage - c.classAveragePercentage) * 10) / 10;
                              return (
                                <div className="bg-slate-900 text-white text-xs p-3 rounded-xl shadow-lg border border-slate-800">
                                  <div className="font-bold text-indigo-300 mb-1">{c.component}</div>
                                  <div className="font-mono space-y-1">
                                    <div>Weightage: <span className="font-bold text-slate-300">{c.weightage} of subject total</span></div>
                                    <div>Obtained: <span className="font-bold text-emerald-400">{c.obtained} / {c.total} marks ({c.percentage}%)</span></div>
                                    <div>Class Mean: <span className="text-slate-300">{c.classAverageObtained} / {c.total} ({c.classAveragePercentage}%)</span></div>
                                    <div className={`pt-1 border-t border-slate-800 font-bold ${delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                      Component Delta: {delta >= 0 ? `+${delta}%` : `${delta}%`} vs Class Avg
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="percentage" name="Student Score %" radius={[6, 6, 0, 0]}>
                          {currentGranularSubject.components.map((entry, index) => {
                            const color = entry.percentage >= 80 ? '#4f46e5' : entry.percentage >= 70 ? '#0284c7' : entry.percentage >= 50 ? '#f59e0b' : '#ef4444';
                            return <Cell key={`comp-${index}`} fill={color} />;
                          })}
                        </Bar>
                        {compareWithClassAverage && (
                          <Bar dataKey="classAveragePercentage" name="Class Average %" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
                        )}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* 4 Detailed Component Score Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
                    {currentGranularSubject.components.map((comp, idx) => {
                      const compDelta = Math.round((comp.percentage - comp.classAveragePercentage) * 10) / 10;
                      return (
                        <div key={idx} className="bg-slate-50/80 rounded-xl border border-slate-200/90 p-3 shadow-2xs">
                          <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
                            <span className="truncate pr-1 text-[11px]">{comp.component}</span>
                            <span className="font-mono text-[9.5px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded shrink-0">
                              {comp.weightage}
                            </span>
                          </div>
                          <div className="flex items-baseline justify-between mt-1">
                            <div>
                              <span className="text-[9.5px] text-slate-400 block font-bold uppercase">Marks</span>
                              <span className="text-base font-black text-slate-900 font-mono">
                                {comp.obtained}/{comp.total}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-[9.5px] text-slate-400 block font-bold uppercase">Pct</span>
                              <span className="text-base font-bold text-indigo-600 font-mono">
                                {comp.percentage}%
                              </span>
                            </div>
                          </div>
                          <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10.5px]">
                            <span className="text-slate-500">Class: {comp.classAverageObtained}/{comp.total}</span>
                            <span className={`font-mono font-bold ${compDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {compDelta >= 0 ? `+${compDelta}%` : `${compDelta}%`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SUB-TAB 2: SUBJECT-SPECIFIC MULTI-TERM TRAJECTORY */}
              {subjectReviewSubTab === 'trajectory' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h5 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <TrendingUp size={14} className="text-indigo-600" />
                        <span>{currentGranularSubject.subject} Multi-Term Progress Trajectory</span>
                      </h5>
                      <p className="text-xs text-slate-500">
                        Tracking individual progress in {currentGranularSubject.subject} across class tests and term examinations vs class subject mean.
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block" /> {currentStudent.name} ({currentGranularSubject.code})
                      </span>
                      {compareWithClassAverage && (
                        <span className="flex items-center gap-1 text-slate-500">
                          <span className="w-3 h-0.5 bg-slate-400 inline-block" /> Class Subject Avg
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-emerald-600">
                        <span className="w-3 h-0.5 bg-emerald-500 inline-block" /> Distinction (80%)
                      </span>
                    </div>
                  </div>

                  <div className="h-60 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={currentGranularSubject.termTrajectory} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="subjScoreGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="term" tick={{ fontSize: 10.5, fill: '#64748b' }} stroke="#cbd5e1" />
                        <YAxis domain={[30, 100]} tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" unit="%" />
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              const d = payload[0].payload;
                              const delta = d.studentScore - d.classAverage;
                              return (
                                <div className="bg-slate-900 text-white text-xs p-3 rounded-xl shadow-lg border border-slate-800">
                                  <div className="font-bold text-indigo-300 mb-1">{currentGranularSubject.subject} - {label}</div>
                                  <div className="space-y-1 font-mono">
                                    <div>Student Score: <span className="font-bold text-white">{d.studentScore}% (Grade: {d.grade})</span></div>
                                    <div className="text-slate-400">Class Average: {d.classAverage}%</div>
                                    <div className={`pt-1 border-t border-slate-800 font-bold ${delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                      Net Margin: {delta >= 0 ? `+${delta}%` : `${delta}%`}
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <ReferenceLine y={80} stroke="#10b981" strokeDasharray="4 4" label={{ value: 'Distinction (80%)', fill: '#10b981', fontSize: 10, position: 'right' }} />
                        {currentSubjectGoal && (
                          <ReferenceLine
                            y={currentSubjectGoal.targetScore}
                            stroke="#d97706"
                            strokeDasharray="5 5"
                            strokeWidth={2}
                            label={{
                              value: `🎯 Goal Target: ${currentSubjectGoal.targetScore}% (${currentSubjectGoal.targetTerm})`,
                              fill: '#b45309',
                              fontSize: 10,
                              fontWeight: 'bold',
                              position: 'insideTopRight'
                            }}
                          />
                        )}
                        {activeTimelineAssessment && (
                          <ReferenceLine
                            y={activeTimelineAssessment.percentage}
                            stroke="#6366f1"
                            strokeDasharray="3 3"
                            strokeWidth={1.5}
                            label={{
                              value: `Mapped: ${activeTimelineAssessment.percentage}% (${activeTimelineAssessment.displayDate})`,
                              fill: '#4f46e5',
                              fontSize: 9.5,
                              position: 'insideTopLeft'
                            }}
                          />
                        )}
                        <Area
                          type="monotone"
                          dataKey="studentScore"
                          name={`${currentGranularSubject.subject} Score`}
                          stroke="#4f46e5"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#subjScoreGrad)"
                          dot={{ r: 4, stroke: '#4f46e5', strokeWidth: 2, fill: '#ffffff' }}
                          activeDot={{ r: 6, fill: '#4f46e5' }}
                        />
                        {compareWithClassAverage && (
                          <Line
                            type="monotone"
                            dataKey="classAverage"
                            name="Class Subject Avg"
                            stroke="#94a3b8"
                            strokeWidth={2}
                            strokeDasharray="4 4"
                            dot={{ r: 3, stroke: '#94a3b8', strokeWidth: 1, fill: '#ffffff' }}
                          />
                        )}
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* SUB-TAB 3: TOPIC / CURRICULUM CHAPTER MASTERY */}
              {subjectReviewSubTab === 'topics' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h5 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                        <Target size={14} className="text-indigo-600" />
                        <span>Curriculum Chapter Mastery & Topic Competencies</span>
                      </h5>
                      <p className="text-xs text-slate-500">
                        Topic-level assessment metrics illustrating granular strengths and knowledge gaps within {currentGranularSubject.subject}.
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded bg-indigo-600 inline-block" /> Student Mastery %
                      </span>
                      {compareWithClassAverage && (
                        <span className="flex items-center gap-1 text-slate-600">
                          <span className="w-2.5 h-2.5 rounded bg-slate-300 inline-block" /> Class Baseline
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Horizontal Bar Chart for Topic Mastery */}
                  <div className="h-60 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={currentGranularSubject.topics}
                        margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" horizontal={false} />
                        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} unit="%" />
                        <YAxis dataKey="topic" type="category" tick={{ fontSize: 10, fill: '#334155', fontWeight: 600 }} width={160} />
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const t = payload[0].payload as SubjectTopicMastery;
                              return (
                                <div className="bg-slate-900 text-white text-xs p-2.5 rounded-xl shadow-lg border border-slate-800">
                                  <div className="font-bold text-indigo-300">{t.topic}</div>
                                  <div className="font-mono mt-1 space-y-0.5">
                                    <div>Mastery: <span className="font-bold text-emerald-400">{t.score}%</span></div>
                                    <div className="text-slate-400">Class Average: {t.classAverage}%</div>
                                    <div className="text-slate-300">Status: <span className="font-bold text-white">{t.status}</span></div>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="score" name="Student Score %" fill="#6366f1" radius={[0, 4, 4, 0]}>
                          {currentGranularSubject.topics.map((t, idx) => {
                            const isTopicMapped = activeTimelineAssessment && activeTimelineAssessment.topicFocus.toLowerCase().includes(t.topic.toLowerCase().slice(0, 10));
                            return (
                              <Cell
                                key={`topic-${idx}`}
                                fill={isTopicMapped ? '#4338ca' : t.score >= 85 ? '#10b981' : t.score >= 70 ? '#6366f1' : '#f59e0b'}
                                stroke={isTopicMapped ? '#1e1b4b' : 'none'}
                                strokeWidth={isTopicMapped ? 2 : 0}
                              />
                            );
                          })}
                        </Bar>
                        {compareWithClassAverage && (
                          <Bar dataKey="classAverage" name="Class Mean %" fill="#cbd5e1" radius={[0, 4, 4, 0]} />
                        )}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Qualitative Teacher Remarks & Recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
                <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-start gap-2.5">
                  <div className="p-1.5 bg-indigo-600 text-white rounded-lg shrink-0 mt-0.5">
                    <Sparkles size={14} />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block mb-0.5 text-[11px]">
                      Pedagogical Finding ({currentGranularSubject.teacherName}):
                    </span>
                    <p className="text-slate-600 leading-relaxed text-[11px]">
                      {currentGranularSubject.qualitativeObservation}
                    </p>
                    <div className="mt-1.5 flex items-center gap-1 flex-wrap">
                      <span className="text-[9.5px] font-bold text-indigo-700 uppercase">Strengths:</span>
                      {currentGranularSubject.keyStrengths.map((str, idx) => (
                        <span key={idx} className="px-1.5 py-0.2 rounded bg-white border border-indigo-200 text-indigo-800 font-bold text-[9.5px]">
                          ✓ {str}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-start gap-2.5">
                  <div className="p-1.5 bg-emerald-600 text-white rounded-lg shrink-0 mt-0.5">
                    <CheckCircle2 size={14} />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block mb-0.5 text-[11px]">
                      Academic Recommendations:
                    </span>
                    <ul className="text-slate-600 space-y-0.5 list-disc list-inside text-[11px]">
                      {currentGranularSubject.recommendations.map((rec, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: GRADE HISTORY TIMELINE SECTION (5 COLS) */}
            <div className="xl:col-span-5 bg-slate-50/80 border border-slate-200 rounded-2xl p-4 space-y-3.5 shadow-2xs">
              {/* Timeline Section Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 gap-2">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
                    <History size={16} />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-sm text-slate-900 tracking-tight">
                        Grade History Timeline
                      </h4>
                      <span className="text-[10px] font-mono bg-indigo-100 text-indigo-800 px-2 py-0.2 rounded-full font-bold">
                        {filteredTimelineRecords.length} Records
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Historical assessment scores mapped against {currentGranularSubject.subject}
                    </p>
                  </div>
                </div>

                {/* CSV Export & Sort */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleExportTimelineCSV}
                    title="Export timeline records to CSV"
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-indigo-600 hover:border-indigo-300 text-xs transition-colors cursor-pointer shadow-2xs"
                  >
                    <Download size={13} />
                  </button>
                  <button
                    onClick={() => setTimelineSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                    title={`Sorted: ${timelineSortOrder === 'desc' ? 'Newest first' : 'Oldest first'}`}
                    className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 hover:text-indigo-600 text-[10px] font-bold transition-colors cursor-pointer shadow-2xs"
                  >
                    {timelineSortOrder === 'desc' ? '↓ Newest' : '↑ Oldest'}
                  </button>
                </div>
              </div>

              {/* Scope Switcher & Category Filter Pills */}
              <div className="space-y-2">
                {/* Scope Toggle: Current Subject vs All Subjects */}
                <div className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="font-bold text-slate-500 text-[10px] uppercase tracking-wider">
                    Subject Scope:
                  </span>
                  <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
                    <button
                      onClick={() => {
                        setTimelineSubjectScope('current');
                        showToast(`Filtered timeline to ${currentGranularSubject.subject}`, 'info');
                      }}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-all ${
                        timelineSubjectScope === 'current'
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {currentGranularSubject.code} Only
                    </button>
                    <button
                      onClick={() => {
                        setTimelineSubjectScope('all');
                        showToast('Showing timeline across all enrolled subjects', 'info');
                      }}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-all ${
                        timelineSubjectScope === 'all'
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      All Subjects ({currentStudent.subjects.length})
                    </button>
                  </div>
                </div>

                {/* Category Filter Pills */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-[10px]">
                  {[
                    { id: 'all', label: 'All Exams' },
                    { id: 'Terminal Exam', label: 'Finals (Pre-Board)' },
                    { id: 'Midterm Exam', label: 'Midterms' },
                    { id: 'Monthly Test', label: 'Monthly' },
                    { id: 'Practical Lab', label: 'Lab/Viva' },
                    { id: 'Class Assessment', label: 'Quizzes' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setTimelineCategoryFilter(cat.id)}
                      className={`px-2 py-0.5 rounded-full font-bold whitespace-nowrap cursor-pointer transition-all border ${
                        timelineCategoryFilter === cat.id
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Search Filter */}
                <div className="relative">
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={timelineSearchQuery}
                    onChange={(e) => setTimelineSearchQuery(e.target.value)}
                    placeholder="Search assessment name, topic, or date..."
                    className="w-full pl-7 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 outline-none focus:border-indigo-400"
                  />
                  {timelineSearchQuery && (
                    <button
                      onClick={() => setTimelineSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Timeline Mini KPI Stats Bar */}
              <div className="grid grid-cols-4 gap-2 bg-white rounded-xl p-2.5 border border-slate-200/90 text-center">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Assessments</span>
                  <span className="text-xs font-black text-slate-800 font-mono">{timelineStats.total}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">Mean Score</span>
                  <span className="text-xs font-black text-indigo-600 font-mono">{timelineStats.avgScore}%</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">High Score</span>
                  <span className="text-xs font-black text-emerald-600 font-mono">{timelineStats.highScore}%</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase block">&gt; Class Avg</span>
                  <span className="text-xs font-black text-teal-600 font-mono">{timelineStats.aboveAvgCount}/{timelineStats.total}</span>
                </div>
              </div>

              {/* Vertical Scrollable Timeline List */}
              <div className="max-h-[620px] overflow-y-auto pr-1 space-y-3 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 custom-scrollbar">
                {filteredTimelineRecords.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs bg-white rounded-xl border border-slate-200 ml-7">
                    No historical assessments match the selected filter.
                  </div>
                ) : (
                  filteredTimelineRecords.map((item) => {
                    const isSelected = selectedAssessmentId === item.id;
                    const isExpanded = !!expandedAssessmentIds[item.id];
                    const gradeColor = item.percentage >= 80
                      ? 'bg-emerald-500 text-white'
                      : item.percentage >= 70
                      ? 'bg-indigo-600 text-white'
                      : item.percentage >= 50
                      ? 'bg-amber-500 text-white'
                      : 'bg-rose-500 text-white';

                    return (
                      <div key={item.id} className="relative pl-7 group">
                        {/* Timeline Node Dot on the vertical rail */}
                        <div
                          className={`absolute left-2 top-3 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-125 ${gradeColor}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-white block" />
                        </div>

                        {/* Historical Assessment Card */}
                        <div
                          onClick={() => {
                            if (selectedAssessmentId === item.id) {
                              setSelectedAssessmentId(null);
                              showToast('Deselected timeline assessment.', 'info');
                            } else {
                              setSelectedAssessmentId(item.id);
                              if (timelineSubjectScope === 'all' && item.subjectCode !== activeSubjectCode) {
                                setSelectedSubjectCode(item.subjectCode);
                              }
                              showToast(`Mapped ${item.term} (${item.displayDate}) to Subject Breakdown Chart`, 'info');
                            }
                          }}
                          className={`bg-white rounded-xl border transition-all p-3 text-xs cursor-pointer ${
                            isSelected
                              ? 'border-indigo-500 ring-2 ring-indigo-300/70 shadow-sm bg-indigo-50/30'
                              : 'border-slate-200 hover:border-slate-300 hover:shadow-2xs'
                          }`}
                        >
                          {/* Card Top: Date, Category badge, Subject Tag */}
                          <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-mono text-[10px] text-slate-500 font-bold flex items-center gap-1">
                                <Calendar size={11} className="text-slate-400" />
                                {item.displayDate}
                              </span>
                              <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                                {item.category}
                              </span>
                              {timelineSubjectScope === 'all' && (
                                <span
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedSubjectCode(item.subjectCode);
                                    showToast(`Switched active subject to ${item.subject}`, 'info');
                                  }}
                                  className="text-[9.5px] font-mono font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100"
                                >
                                  {item.subjectCode}
                                </span>
                              )}
                            </div>

                            {isSelected && (
                              <span className="text-[9.5px] font-bold text-indigo-600 bg-indigo-100 px-1.5 py-0.2 rounded-full flex items-center gap-1 animate-pulse">
                                <CheckCircle2 size={10} /> Mapped to Chart
                              </span>
                            )}
                          </div>

                          {/* Assessment Name */}
                          <h5 className="font-bold text-slate-900 text-xs mb-1.5">
                            {item.term}
                          </h5>

                          {/* Score Readout Row */}
                          <div className="flex items-center justify-between gap-2 py-1.5 px-2 bg-slate-50 rounded-lg border border-slate-100 font-mono text-[11px] mb-1.5">
                            <div>
                              <span className="text-[9px] text-slate-400 block font-sans uppercase font-bold">Marks</span>
                              <span className="font-black text-slate-900 font-mono">{item.studentScore}/{item.totalMarks}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 block font-sans uppercase font-bold">Percentage</span>
                              <span className="font-black text-indigo-600">{item.percentage}%</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 block font-sans uppercase font-bold">Grade</span>
                              <span className="font-black text-slate-800">{item.grade} <span className="text-[9.5px] text-slate-500">({item.gpa.toFixed(1)})</span></span>
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] text-slate-400 block font-sans uppercase font-bold">Class Δ</span>
                              <span className={`font-black ${item.deltaVsClassAvg >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {item.deltaVsClassAvg >= 0 ? `+${item.deltaVsClassAvg}%` : `${item.deltaVsClassAvg}%`}
                              </span>
                            </div>
                          </div>

                          {/* Target Goal Alignment Badge if goal set */}
                          {currentStudentGoals[item.subjectCode] && (
                            <div className="flex items-center justify-between text-[10px] bg-amber-50/70 border border-amber-200/70 rounded-md px-2 py-0.5 mb-1.5 font-mono">
                              <span className="text-amber-800 font-bold flex items-center gap-1">
                                <Target size={10} className="text-amber-600" />
                                Target: {currentStudentGoals[item.subjectCode].targetScore}%
                              </span>
                              <span className={`font-bold ${
                                item.percentage >= currentStudentGoals[item.subjectCode].targetScore ? 'text-emerald-700' : 'text-amber-700'
                              }`}>
                                {item.percentage >= currentStudentGoals[item.subjectCode].targetScore
                                  ? `+${Math.round((item.percentage - currentStudentGoals[item.subjectCode].targetScore) * 10) / 10}% Exceeded`
                                  : `${Math.round((item.percentage - currentStudentGoals[item.subjectCode].targetScore) * 10) / 10}% to Goal`}
                              </span>
                            </div>
                          )}

                          {/* Topic Focus */}
                          <div className="text-[10.5px] text-slate-600 flex items-start gap-1 mb-2">
                            <span className="font-bold text-slate-400 shrink-0">Focus:</span>
                            <span className="line-clamp-1">{item.topicFocus}</span>
                          </div>

                          {/* Card Action Footer */}
                          <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-100 text-[10.5px]">
                            <span className="text-slate-400 text-[10px]">
                              Class Avg: {item.classAverage}% • Weight: {item.weightage}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {item.components && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setExpandedAssessmentIds(prev => ({ ...prev, [item.id]: !prev[item.id] }));
                                  }}
                                  className="text-slate-600 hover:text-indigo-600 font-bold flex items-center gap-0.5 cursor-pointer text-[10px]"
                                >
                                  <span>{isExpanded ? 'Hide Marks' : 'Components'}</span>
                                  <ChevronDown size={11} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (selectedAssessmentId === item.id) {
                                    setSelectedAssessmentId(null);
                                    showToast('Deselected timeline assessment.', 'info');
                                  } else {
                                    setSelectedAssessmentId(item.id);
                                    if (timelineSubjectScope === 'all' && item.subjectCode !== activeSubjectCode) {
                                      setSelectedSubjectCode(item.subjectCode);
                                    }
                                    showToast(`Mapped ${item.term} to Subject Breakdown Chart`, 'info');
                                  }
                                }}
                                className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer border text-[10px] ${
                                  isSelected
                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-indigo-50 hover:text-indigo-700'
                                }`}
                              >
                                {isSelected ? 'Mapped' : 'Inspect'}
                              </button>
                            </div>
                          </div>

                          {/* Expandable Accordion: Component Scores & Teacher Feedback */}
                          {isExpanded && item.components && (
                            <div className="mt-2.5 pt-2 border-t border-slate-200/80 space-y-2 text-[10.5px]">
                              <div className="grid grid-cols-2 gap-1.5 font-mono">
                                {item.components.map((c, cIdx) => (
                                  <div key={cIdx} className="bg-slate-50 p-1.5 rounded border border-slate-100 flex items-center justify-between">
                                    <span className="text-slate-600 text-[10px] truncate">{c.name}</span>
                                    <span className="font-bold text-slate-900">{c.obtained}/{c.total}</span>
                                  </div>
                                ))}
                              </div>
                              {item.teacherRemark && (
                                <div className="p-2 bg-indigo-50/50 rounded border border-indigo-100/70 text-slate-600 italic text-[10px]">
                                  "{item.teacherRemark}"
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* SECTION 2.6: ACADEMIC GOALS & TARGET TRACKING MATRIX */}
      {/* ----------------------------------------------------------------- */}
      {(activeTab === 'all' || activeTab === 'goals' || activeTab === 'academic') && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-5">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-xl shadow-xs">
                <Target size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-black text-base text-slate-900 tracking-tight">
                    Academic Goals & Target Tracking Matrix
                  </h3>
                  <span className="text-[10px] font-mono bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
                    Admin Goal Engine
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Define strategic target scores for {currentStudent.name}, monitor learning gaps in real time, and align intervention roadmaps with assessment milestones.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => handleOpenSetGoalModal()}
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} />
                <span>Define Academic Goal</span>
              </Button>
            </div>
          </div>

          {/* Goals KPI Aggregate Scorecard */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* KPI 1: Goals Set */}
            <div className="bg-slate-50/80 rounded-xl border border-slate-200/90 p-3 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
                <span>Goals Configured</span>
                <Flag size={13} className="text-indigo-600" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-slate-900 font-mono">
                  {studentGoalsSummary.totalGoals}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  of {studentGoalsSummary.totalSubjects} subjects
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1 mt-2">
                <div
                  className="bg-indigo-600 h-1 rounded-full transition-all"
                  style={{ width: `${Math.round((studentGoalsSummary.totalGoals / Math.max(1, studentGoalsSummary.totalSubjects)) * 100)}%` }}
                />
              </div>
            </div>

            {/* KPI 2: Achieved */}
            <div className="bg-emerald-50/50 rounded-xl border border-emerald-200/90 p-3 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-emerald-800 font-bold mb-1">
                <span>Targets Met</span>
                <CheckCheck size={14} className="text-emerald-600" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-emerald-700 font-mono">
                  {studentGoalsSummary.achievedCount}
                </span>
                <span className="text-[11px] text-emerald-600 font-bold">
                  ({studentGoalsSummary.totalGoals > 0 ? Math.round((studentGoalsSummary.achievedCount / studentGoalsSummary.totalGoals) * 100) : 0}%)
                </span>
              </div>
              <div className="text-[10px] text-emerald-600 font-medium mt-1">
                Score equal to or above target
              </div>
            </div>

            {/* KPI 3: On Track */}
            <div className="bg-blue-50/50 rounded-xl border border-blue-200/90 p-3 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-blue-800 font-bold mb-1">
                <span>On Track (&le;5%)</span>
                <TrendingUp size={14} className="text-blue-600" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-blue-700 font-mono">
                  {studentGoalsSummary.onTrackCount}
                </span>
                <span className="text-[11px] text-blue-600 font-bold">Subjects</span>
              </div>
              <div className="text-[10px] text-blue-600 font-medium mt-1">
                Close to achieving target milestone
              </div>
            </div>

            {/* KPI 4: Needs Push */}
            <div className="bg-amber-50/50 rounded-xl border border-amber-200/90 p-3 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-amber-800 font-bold mb-1">
                <span>Attention Required</span>
                <AlertTriangle size={14} className="text-amber-600" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-amber-700 font-mono">
                  {studentGoalsSummary.needsPushCount + studentGoalsSummary.criticalCount}
                </span>
                <span className="text-[11px] text-amber-600 font-bold">Interventions</span>
              </div>
              <div className="text-[10px] text-amber-600 font-medium mt-1">
                Gaps &gt; 5% requiring targeted coaching
              </div>
            </div>

            {/* KPI 5: Avg Target */}
            <div className="bg-slate-50/80 rounded-xl border border-slate-200/90 p-3 shadow-2xs col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
                <span>Mean Target Score</span>
                <Award size={14} className="text-amber-600" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-amber-800 font-mono">
                  {studentGoalsSummary.avgTargetScore}%
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  (Curr: {currentStudent.overallPercentage}%)
                </span>
              </div>
              <div className="text-[10px] text-slate-500 font-medium mt-1">
                Target Delta: {Math.round((currentStudent.overallPercentage - studentGoalsSummary.avgTargetScore) * 10) / 10 >= 0 ? `+${Math.round((currentStudent.overallPercentage - studentGoalsSummary.avgTargetScore) * 10) / 10}%` : `${Math.round((currentStudent.overallPercentage - studentGoalsSummary.avgTargetScore) * 10) / 10}%`}
              </div>
            </div>
          </div>

          {/* Interactive Subject Goals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentStudent.subjects.map((sub) => {
              const goal = currentStudentGoals[sub.code];
              const goalMetrics = goal ? calculateGoalMetrics(sub.percentage, goal.targetScore) : null;
              const isSelectedSubject = sub.code === activeSubjectCode;

              if (goal && goalMetrics) {
                return (
                  <div
                    key={sub.code}
                    className={`bg-white rounded-2xl border transition-all p-4 flex flex-col justify-between space-y-3.5 ${
                      isSelectedSubject
                        ? 'border-indigo-400 ring-2 ring-indigo-200/70 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    {/* Card Header */}
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-black text-sm text-slate-900">
                              {sub.subject}
                            </h4>
                            <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200">
                              {sub.code}
                            </span>
                          </div>
                          <div className="text-[10.5px] text-slate-400 mt-0.5">
                            Grade: <strong className="text-slate-700">{sub.grade}</strong> (Point: {sub.gpa}) • Class Avg: {sub.classAverage}%
                          </div>
                        </div>

                        {/* Priority Badge */}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                          goal.priority === 'High'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : goal.priority === 'Medium'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {goal.priority} Priority
                        </span>
                      </div>

                      {/* Scores & Gap Stat Row */}
                      <div className="grid grid-cols-3 gap-2 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100 text-center font-mono my-2.5">
                        <div>
                          <span className="text-[9px] font-sans text-slate-400 block font-bold uppercase">Current</span>
                          <span className="text-sm font-black text-slate-900">{sub.percentage}%</span>
                        </div>
                        <div className="border-x border-slate-200">
                          <span className="text-[9px] font-sans text-amber-700 block font-bold uppercase">Goal</span>
                          <span className="text-sm font-black text-amber-700">{goal.targetScore}%</span>
                        </div>
                        <div>
                          <span className="text-[9px] font-sans text-slate-400 block font-bold uppercase">Variance</span>
                          <span className={`text-sm font-black ${goalMetrics.gap >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {goalMetrics.gap >= 0 ? `+${goalMetrics.gap}%` : `${goalMetrics.gap}%`}
                          </span>
                        </div>
                      </div>

                      {/* Visual Dual Progress Bar */}
                      <div>
                        <div className="flex items-center justify-between text-[10.5px] mb-1">
                          <span className="text-slate-500 font-medium">Progress to Target</span>
                          <span className={`font-mono font-bold text-[10.5px] ${goalMetrics.gap >= 0 ? 'text-emerald-700' : 'text-slate-700'}`}>
                            {goalMetrics.statusLabel}
                          </span>
                        </div>
                        <div className="relative w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                          {/* Current Score Fill */}
                          <div
                            className={`h-full rounded-full transition-all ${goalMetrics.progressColor}`}
                            style={{ width: `${Math.min(100, Math.round((sub.percentage / 100) * 100))}%` }}
                          />
                          {/* Target Goal Needle marker */}
                          <div
                            className="absolute top-0 bottom-0 w-1 bg-amber-500 shadow-xs z-10"
                            style={{ left: `calc(${goal.targetScore}% - 2px)` }}
                            title={`Target Goal: ${goal.targetScore}%`}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono mt-1">
                          <span>0%</span>
                          <span className="text-amber-700 font-bold">▲ Target: {goal.targetScore}%</span>
                          <span>100%</span>
                        </div>
                      </div>

                      {/* Milestone & Target Term */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 text-xs flex items-center justify-between gap-1">
                        <span className="text-[10.5px] text-slate-500 flex items-center gap-1">
                          <Calendar size={11} className="text-slate-400 shrink-0" />
                          <span className="truncate max-w-[170px]" title={goal.targetTerm}>{goal.targetTerm}</span>
                        </span>
                        <span className="text-[10px] font-mono font-bold text-slate-400">
                          Proj: {goal.targetGrade}
                        </span>
                      </div>

                      {/* Pedagogical Strategy Note */}
                      <div className="mt-2 bg-amber-50/40 p-2 rounded-lg border border-amber-200/50 text-[11px] text-slate-600 leading-relaxed">
                        <strong className="text-amber-900 block text-[10px] uppercase font-bold mb-0.5">Strategy Plan:</strong>
                        <p className="line-clamp-2" title={goal.strategyNotes}>{goal.strategyNotes}</p>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      {/* Quick Adjust Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleQuickAdjustScore(sub.code, 2)}
                          className="px-1.5 py-0.5 text-[9.5px] font-mono font-bold rounded bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                          title="Increase target by +2%"
                        >
                          +2%
                        </button>
                        <button
                          onClick={() => handleQuickAdjustScore(sub.code, 5)}
                          className="px-1.5 py-0.5 text-[9.5px] font-mono font-bold rounded bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                          title="Increase target by +5%"
                        >
                          +5%
                        </button>
                        <button
                          onClick={() => handleQuickAdjustScore(sub.code, -2)}
                          className="px-1.5 py-0.5 text-[9.5px] font-mono font-bold rounded bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                          title="Decrease target by -2%"
                        >
                          -2%
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedSubjectCode(sub.code);
                            showToast(`Inspecting granular breakdown for ${sub.subject}`, 'info');
                          }}
                          className="px-2 py-1 text-[10px] font-bold rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-indigo-600 hover:border-indigo-300 transition-colors cursor-pointer"
                        >
                          Inspect
                        </button>
                        <button
                          onClick={() => handleOpenSetGoalModal(sub.code)}
                          className="px-2 py-1 text-[10px] font-bold rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Edit3 size={11} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteGoal(sub.code)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="Remove target goal"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              // Card for subject with NO goal defined yet
              return (
                <div
                  key={sub.code}
                  className="bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 hover:border-amber-300 p-4 flex flex-col justify-between space-y-4 transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-bold text-sm text-slate-700">
                            {sub.subject}
                          </h4>
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-600">
                            {sub.code}
                          </span>
                        </div>
                        <div className="text-[10.5px] text-slate-400 mt-0.5">
                          Current Score: <strong className="text-slate-800">{sub.percentage}%</strong> ({sub.obtained}/{sub.total})
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-200">
                        No Goal Set
                      </span>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-slate-200/80 my-2 text-center text-xs text-slate-500">
                      <Target size={20} className="text-slate-300 mx-auto mb-1" />
                      <p className="text-[11px]">Define an academic target score to unlock trajectory tracking and intervention alerts.</p>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleOpenSetGoalModal(sub.code)}
                    variant="outline"
                    className="w-full border-amber-300 bg-amber-50/60 hover:bg-amber-100 text-amber-900 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Set Target for {sub.subject}</span>
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* SECTION 3: ATTENDANCE PERCENTAGES & BEHAVIORAL TRENDS (RECHARTS) */}
      {/* ----------------------------------------------------------------- */}
      {(activeTab === 'all' || activeTab === 'attendance') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Attendance Trend Line/Area Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-teal-50 text-teal-600 rounded-lg">
                    <Clock size={16} />
                  </span>
                  <h4 className="font-black text-sm text-slate-900 tracking-tight">
                    Month-over-Month Attendance Rate & Statutory Compliance
                  </h4>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Monthly attendance percentage with 75% institutional compliance threshold line.
                </p>
              </div>

              <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-teal-600 inline-block" /> Attendance %
                </span>
                {compareWithClassAverage && (
                  <span className="flex items-center gap-1 text-indigo-700">
                    <span className="w-3 h-0.5 bg-indigo-500 inline-block" /> Class Avg ({classAverages.classAvgAttendance}%)
                  </span>
                )}
                <span className="flex items-center gap-1 text-rose-600">
                  <span className="w-3 h-0.5 bg-rose-500 inline-block" /> 75% Min. Threshold
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentStudent.monthlyAttendance} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="attendanceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                  <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" unit="%" />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const m = payload[0].payload as MonthlyAttendance;
                        const isUnder = m.percentage < 75;
                        const attDiff = Math.round((m.percentage - classAverages.classAvgAttendance) * 10) / 10;
                        return (
                          <div className="bg-slate-900 text-white text-xs p-3 rounded-xl shadow-lg border border-slate-800">
                            <div className="font-bold text-teal-300 mb-1">Month of {label} 2024</div>
                            <div className="font-mono space-y-0.5 text-xs">
                              <div>Attendance: <span className={`font-bold ${isUnder ? 'text-rose-400' : 'text-emerald-400'}`}>{m.percentage}%</span></div>
                              <div className="text-slate-300">Present: {m.presentDays} of {m.totalDays} academic days</div>
                              <div className="text-slate-400">Late: {m.lateDays} | Leaves: {m.leaveDays} | Absences: {m.absentDays}</div>
                              {compareWithClassAverage && (
                                <div className="text-indigo-300 pt-1 border-t border-slate-800">
                                  Class Avg: {classAverages.classAvgAttendance}% ({attDiff >= 0 ? `+${attDiff}%` : `${attDiff}%`})
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine
                    y={75}
                    stroke="#ef4444"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    label={{ value: '75% Mandatory Board Cutoff', fill: '#ef4444', fontSize: 10, position: 'insideTopLeft' }}
                  />
                  {compareWithClassAverage && (
                    <ReferenceLine
                      y={classAverages.classAvgAttendance}
                      stroke="#6366f1"
                      strokeWidth={1.5}
                      strokeDasharray="3 3"
                      label={{
                        value: `Class Avg (${classAverages.classAvgAttendance}%)`,
                        fill: '#6366f1',
                        fontSize: 9.5,
                        position: 'insideBottomRight'
                      }}
                    />
                  )}
                  <Area
                    type="monotone"
                    dataKey="percentage"
                    name="Attendance %"
                    stroke="#0d9488"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#attendanceGrad)"
                    dot={{ r: 4, stroke: '#0d9488', strokeWidth: 2, fill: '#ffffff' }}
                    activeDot={{ r: 6, fill: '#0d9488' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Attendance Breakdown Donut Pie Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                  <PieIcon size={16} />
                </span>
                <h4 className="font-black text-sm text-slate-900 tracking-tight">
                  Attendance Composition
                </h4>
              </div>
              <p className="text-xs text-slate-500 mb-2">
                Cumulative session breakdown across all recorded academic days.
              </p>
            </div>

            <div className="h-52 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attendanceBreakdown}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {attendanceBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0];
                        return (
                          <div className="bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-md">
                            <span className="font-bold">{item.name}:</span> {item.value} days
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Center Readout */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-slate-900">
                  {currentStudent.totalAttendancePercentage}%
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Overall
                </span>
              </div>
            </div>

            {/* Legend Breakdown */}
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-3 border-t border-slate-100">
              {attendanceBreakdown.map((item, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 font-medium truncate">{item.name}</span>
                  <span className="font-bold text-slate-900 ml-auto font-mono">{item.value}d</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Weekday Attendance Patterns */}
      {(activeTab === 'all' || activeTab === 'attendance') && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Calendar size={16} />
                </span>
                <h4 className="font-black text-sm text-slate-900 tracking-tight">
                  Day-of-Week Attendance Distribution (Sunday – Thursday)
                </h4>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Helps identify specific weekday absenteeism patterns (e.g. pre-weekend Thursday absences or post-weekend Sunday dips).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {currentStudent.weekdayAttendance.map((day, i) => {
              const isLow = day.percentage < 75;
              const isWarning = day.percentage >= 75 && day.percentage < 85;
              return (
                <div
                  key={i}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isLow
                      ? 'bg-rose-50/60 border-rose-200'
                      : isWarning
                      ? 'bg-amber-50/60 border-amber-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-1">
                    <span>{day.day}</span>
                    <span className={`text-[10px] font-black px-1.5 py-0.2 rounded ${
                      isLow ? 'bg-rose-200 text-rose-800' : isWarning ? 'bg-amber-200 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {day.status}
                    </span>
                  </div>
                  <div className="text-xl font-black text-slate-900 mt-1">
                    {day.percentage}%
                  </div>
                  {/* Mini Progress Bar */}
                  <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isLow ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${day.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* SECTION 4: PERFORMANCE VS ATTENDANCE CORRELATION (COMPOSED CHART) */}
      {/* ----------------------------------------------------------------- */}
      {(activeTab === 'all' || activeTab === 'correlation') && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                  <Activity size={16} />
                </span>
                <h4 className="font-black text-sm text-slate-900 tracking-tight">
                  Performance vs Attendance Correlation Analysis (Dual-Axis)
                </h4>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Dual-axis visual engine illustrating how monthly attendance rate directly correlates with student exam scores.
              </p>
            </div>

            <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-indigo-600 inline-block" /> Monthly Attendance %
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-0.5 bg-amber-500 inline-block" /> Average Exam Score %
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={currentStudent.monthlyAttendance} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} stroke="#cbd5e1" />
                <YAxis
                  yAxisId="left"
                  domain={[50, 100]}
                  tick={{ fontSize: 11, fill: '#4f46e5' }}
                  stroke="#4f46e5"
                  unit="%"
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[30, 100]}
                  tick={{ fontSize: 11, fill: '#f59e0b' }}
                  stroke="#f59e0b"
                  unit="%"
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as MonthlyAttendance;
                      return (
                        <div className="bg-slate-900 text-white text-xs p-3 rounded-xl shadow-lg border border-slate-800">
                          <div className="font-bold text-indigo-300 mb-1">{label} 2024 Correlation</div>
                          <div className="font-mono space-y-1">
                            <div className="text-indigo-400">Attendance: <span className="font-bold text-white">{data.percentage}%</span></div>
                            <div className="text-amber-400">Exam Average: <span className="font-bold text-white">{data.avgExamScore}%</span></div>
                            <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                              Scheduled Days: {data.totalDays} | Present: {data.presentDays}
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend verticalAlign="bottom" height={36} />
                <Bar
                  yAxisId="left"
                  dataKey="percentage"
                  name="Monthly Attendance %"
                  fill="#6366f1"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avgExamScore"
                  name="Average Exam Score %"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ r: 4, stroke: '#f59e0b', strokeWidth: 2, fill: '#ffffff' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* School Leadership Observation Callout */}
          <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-start gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg shrink-0 mt-0.5">
              <Sparkles size={16} />
            </div>
            <div>
              <span className="font-bold text-slate-800">Administrative Finding: </span>
              <span className="text-slate-600 leading-relaxed">
                {currentStudent.adminNotes}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* MODAL 1: SEND GUARDIAN SMS / EMAIL ALERT */}
      {/* ----------------------------------------------------------------- */}
      {isAlertModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsAlertModalOpen(false)}
          title={`Dispath Progress Alert - Guardian of ${currentStudent.name}`}
        >
          <form onSubmit={handleSendAlert} className="space-y-4 text-xs">
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0">
                {(currentStudent?.name || 'S').charAt(0)}
              </div>
              <div className="text-xs">
                <div className="font-bold text-slate-800">
                  Guardian: {currentStudent.guardian} ({currentStudent.name})
                </div>
                <div className="text-indigo-700 font-mono text-[11px]">
                  Recipient Mobile: {currentStudent.guardianPhone}
                </div>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Official SMS / Notice Content:
              </label>
              <textarea
                rows={5}
                value={customSmsMessage}
                onChange={(e) => setCustomSmsMessage(e.target.value)}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl font-sans text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none leading-relaxed"
                required
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Message will be logged in Communication Center and sent via Amar Smart School SMS Gateway.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button variant="secondary" onClick={() => setIsAlertModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSendingAlert}>
                {isSendingAlert ? 'Transmitting Alert...' : 'Confirm & Send SMS'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* MODAL 2: PRINTABLE OFFICIAL STUDENT TRANSCRIPT */}
      {/* ----------------------------------------------------------------- */}
      {isTranscriptModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsTranscriptModalOpen(false)}
          title={`Official Academic Transcript & Attendance Record`}
        >
          <div className="space-y-4 text-xs print:p-0">
            {/* Header for printout */}
            <div className="p-4 bg-slate-900 text-white rounded-xl text-center">
              <h2 className="text-base font-black tracking-wide">AMAR SMART SCHOOL</h2>
              <p className="text-[10px] text-slate-300">Continuous Assessment & Attendance Registry System</p>
              <p className="text-[11px] font-bold text-indigo-300 mt-1">
                Student Progress Transcript (Academic Year 2024)
              </p>
            </div>

            {/* Student particulars table */}
            <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
              <div><strong>Student Name:</strong> {currentStudent.name}</div>
              <div><strong>Roll Number:</strong> {currentStudent.rollNo}</div>
              <div><strong>Class & Section:</strong> {currentStudent.class} ({currentStudent.section})</div>
              <div><strong>Guardian:</strong> {currentStudent.guardian}</div>
              <div><strong>Cumulative GPA:</strong> {currentStudent.cumulativeGPA.toFixed(2)}</div>
              <div><strong>Overall Percentage:</strong> {currentStudent.overallPercentage}%</div>
              <div><strong>Attendance Percentage:</strong> {currentStudent.totalAttendancePercentage}%</div>
              <div><strong>Class Rank:</strong> #{currentStudent.classRank} of {currentStudent.totalStudentsInClass}</div>
            </div>

            {/* Subjects marks table */}
            <div>
              <h5 className="font-bold text-slate-800 mb-2">Subject-Wise Evaluation Breakdown:</h5>
              <table className="w-full text-left border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-[10px] font-black uppercase text-slate-600">
                  <tr>
                    <th className="p-2">Subject</th>
                    <th className="p-2 text-center">Marks</th>
                    <th className="p-2 text-center">Percentage</th>
                    <th className="p-2 text-center">Grade</th>
                    <th className="p-2 text-center">Point</th>
                    {compareWithClassAverage && (
                      <>
                        <th className="p-2 text-center">Class Avg</th>
                        <th className="p-2 text-center">Variance (Δ)</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {currentStudent.subjects.map((s, idx) => {
                    const delta = Math.round((s.percentage - s.classAverage) * 10) / 10;
                    return (
                      <tr key={idx}>
                        <td className="p-2 font-bold text-slate-700">{s.subject} ({s.code})</td>
                        <td className="p-2 text-center font-mono">{s.obtained}/{s.total}</td>
                        <td className="p-2 text-center font-mono">{s.percentage}%</td>
                        <td className="p-2 text-center font-bold text-indigo-600">{s.grade}</td>
                        <td className="p-2 text-center font-mono">{s.gpa.toFixed(1)}</td>
                        {compareWithClassAverage && (
                          <>
                            <td className="p-2 text-center font-mono text-slate-600">{s.classAverage}%</td>
                            <td className={`p-2 text-center font-mono font-bold ${delta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {delta >= 0 ? `+${delta}%` : `${delta}%`}
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Signature & Seal placeholder */}
            <div className="pt-6 grid grid-cols-2 gap-8 text-center text-slate-500 text-[11px]">
              <div>
                <div className="border-t border-slate-300 pt-1 font-bold">Class Teacher Signature</div>
              </div>
              <div>
                <div className="border-t border-slate-300 pt-1 font-bold">Principal / Head of Institution</div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 flex-wrap">
              <Button variant="secondary" onClick={() => setIsTranscriptModalOpen(false)}>
                Close
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDownloadPdfReport()}
                disabled={isExportingPdf}
              >
                <Download size={13} className="mr-1.5 text-emerald-600" />
                <span>{isExportingPdf ? 'Generating PDF...' : 'Download Official PDF'}</span>
              </Button>
              <Button onClick={() => window.print()}>
                <Printer size={13} className="mr-1.5" />
                Print / Save PDF
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* MODAL 3: CONFIGURE & DOWNLOAD OFFICIAL PDF REPORT */}
      {/* ----------------------------------------------------------------- */}
      {isPdfConfigModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsPdfConfigModalOpen(false)}
          title={`Export Physical Record PDF - ${currentStudent.name}`}
        >
          <div className="space-y-4 text-xs">
            {/* Header info badge */}
            <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-start gap-3">
              <div className="p-2 bg-emerald-600 text-white rounded-lg shrink-0 mt-0.5 shadow-xs">
                <FileText size={18} />
              </div>
              <div>
                <h4 className="font-bold text-emerald-950 text-xs">
                  Official Institutional Vector PDF Dossier
                </h4>
                <p className="text-[11px] text-emerald-700 mt-0.5 leading-relaxed">
                  Leverages the official Amar Smart School PDF export engine. Renders high-resolution vector tables, official crest header, EIIN verification badge, multi-term trajectory, monthly attendance registry, and physical endorsement signature lines for statutory archival.
                </p>
              </div>
            </div>

            {/* Student Particulars Preview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Student</span>
                <span className="font-bold text-slate-900">{currentStudent.name}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase">ID & Roll</span>
                <span className="font-mono font-bold text-indigo-600">{currentStudent.id} (#{currentStudent.rollNo})</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Class</span>
                <span className="font-bold text-slate-800">{currentStudent.class} ({currentStudent.section})</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase">Cumulative GPA</span>
                <span className="font-mono font-black text-emerald-600">GPA {currentStudent.cumulativeGPA.toFixed(2)} ({currentStudent.overallPercentage}%)</span>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Institution / Board Name"
                  value={pdfSchoolName}
                  onChange={(e) => setPdfSchoolName(e.target.value)}
                  placeholder="SMART AMAR SCHOOL & COLLEGE"
                />
                <Input
                  label="Academic Session"
                  value={pdfAcademicYear}
                  onChange={(e) => setPdfAcademicYear(e.target.value)}
                  placeholder="2024 - 2025"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Physical Record Classification / Archival Purpose
                </label>
                <select
                  value={pdfArchiveTarget}
                  onChange={(e) => setPdfArchiveTarget(e.target.value)}
                  className="w-full text-xs font-medium border border-slate-200 rounded-xl p-2.5 bg-slate-50 outline-none focus:ring-2 ring-indigo-500 cursor-pointer"
                >
                  <option value="Official Institutional Archive & Physical Dossier">Official Institutional Archive & Physical Dossier</option>
                  <option value="Parent / Guardian Official Academic Report">Parent / Guardian Official Academic Report</option>
                  <option value="Academic Board & Continuous Assessment Record">Academic Board & Continuous Assessment Record</option>
                  <option value="Attendance Compliance & Disciplinary Audit">Attendance Compliance & Disciplinary Audit</option>
                  <option value="Secondary School Certificate (SSC) / Board Registration">Secondary School Certificate (SSC) / Board Registration</option>
                </select>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-emerald-50/40 transition-colors">
                  <input
                    type="checkbox"
                    checked={pdfIncludeSignatures}
                    onChange={(e) => setPdfIncludeSignatures(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="text-xs font-medium text-slate-700">
                    Include 4 Official Signature Blocks
                  </span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer hover:bg-emerald-50/40 transition-colors">
                  <input
                    type="checkbox"
                    checked={pdfIncludeSummaryStats}
                    onChange={(e) => setPdfIncludeSummaryStats(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="text-xs font-medium text-slate-700">
                    Include Executive KPI Metrics Row
                  </span>
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <Button variant="ghost" onClick={() => setIsPdfConfigModalOpen(false)}>
                Cancel
              </Button>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleDownloadPdfReport()}
                  disabled={isExportingPdf}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <Download size={14} className="mr-1.5" />
                  {isExportingPdf ? 'Exporting...' : 'Generate & Download PDF'}
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* MODAL 4: INTERACTIVE SET ACADEMIC GOAL & TARGET SCORE */}
      {/* ----------------------------------------------------------------- */}
      {isGoalModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsGoalModalOpen(false)}
          title={`Set Academic Goal - ${currentStudent.name}`}
        >
          {(() => {
            const currentSub = currentStudent.subjects.find(s => s.code === goalEditingSubjectCode) || currentStudent.subjects[0];
            const currentScore = currentSub ? currentSub.percentage : 85;
            const liveMetrics = calculateGoalMetrics(currentScore, goalTargetScore);
            const targetGrade = goalTargetScore >= 80 ? 'A+' : goalTargetScore >= 70 ? 'A' : goalTargetScore >= 60 ? 'A-' : 'B';
            const existingGoal = currentStudentGoals[goalEditingSubjectCode];

            return (
              <div className="space-y-4 text-xs">
                {/* Header Banner */}
                <div className="p-3.5 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-indigo-500/10 border border-amber-200 rounded-xl flex items-start gap-3">
                  <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-lg shrink-0 mt-0.5 shadow-xs">
                    <Target size={18} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-xs">
                      Academic Target Score & Strategic Intervention Engine
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      Configure high-fidelity benchmark targets for <strong>{currentStudent.name}</strong>. Target scores are plotted dynamically on trajectory curves, benchmark variance matrices, and historical assessment records.
                    </p>
                  </div>
                </div>

                {/* Subject Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Select Target Subject
                  </label>
                  <select
                    value={goalEditingSubjectCode}
                    onChange={(e) => {
                      const newCode = e.target.value;
                      setGoalEditingSubjectCode(newCode);
                      const existing = currentStudentGoals[newCode];
                      const newSub = currentStudent.subjects.find(s => s.code === newCode);
                      const baseScore = newSub ? newSub.percentage : 85;

                      if (existing) {
                        setGoalTargetScore(existing.targetScore);
                        setGoalTargetTerm(existing.targetTerm);
                        setGoalPriority(existing.priority);
                        setGoalStrategyNotes(existing.strategyNotes);
                      } else {
                        const rec = Math.min(100, Math.max(75, Math.ceil((baseScore + 5) / 5) * 5));
                        setGoalTargetScore(rec);
                        setGoalPriority(baseScore < 80 ? 'High' : 'Medium');
                      }
                    }}
                    className="w-full text-xs font-bold border border-slate-200 rounded-xl p-2.5 bg-white text-slate-800 outline-none focus:ring-2 ring-amber-500 cursor-pointer"
                  >
                    {currentStudent.subjects.map(s => (
                      <option key={s.code} value={s.code}>
                        {s.subject} ({s.code}) — Current Score: {s.percentage}% (Grade: {s.grade})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Live Real-Time Goal Impact Preview Card */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">Live Target Simulation</span>
                    <span className={`text-[10.5px] font-mono font-bold px-2 py-0.5 rounded border ${liveMetrics.badgeColor}`}>
                      {liveMetrics.statusLabel}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center font-mono py-1">
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-[9px] font-sans text-slate-400 block font-bold uppercase">Current Score</span>
                      <span className="text-base font-black text-slate-900">{currentScore}%</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-amber-300 ring-2 ring-amber-200/50">
                      <span className="text-[9px] font-sans text-amber-700 block font-bold uppercase">Target Goal</span>
                      <span className="text-base font-black text-amber-700">{goalTargetScore}%</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200">
                      <span className="text-[9px] font-sans text-slate-400 block font-bold uppercase">Target Gap</span>
                      <span className={`text-base font-black ${liveMetrics.gap >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {liveMetrics.gap >= 0 ? `+${liveMetrics.gap}%` : `${liveMetrics.gap}%`}
                      </span>
                    </div>
                  </div>

                  {/* Dual Progress Bar */}
                  <div className="space-y-1">
                    <div className="relative w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${liveMetrics.progressColor}`}
                        style={{ width: `${Math.min(100, Math.round((currentScore / 100) * 100))}%` }}
                      />
                      <div
                        className="absolute top-0 bottom-0 w-1 bg-amber-500 shadow-xs z-10"
                        style={{ left: `calc(${goalTargetScore}% - 2px)` }}
                        title={`Target: ${goalTargetScore}%`}
                      />
                    </div>
                    <div className="flex justify-between text-[9.5px] text-slate-400 font-mono">
                      <span>Current: {currentScore}%</span>
                      <span className="text-amber-700 font-bold">Goal: {goalTargetScore}% (Proj: {targetGrade})</span>
                    </div>
                  </div>
                </div>

                {/* Target Score Input & Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase text-slate-600">
                      Target Percentage (0 - 100%)
                    </label>
                    <div className="flex items-center gap-1.5 font-mono">
                      <input
                        type="number"
                        min="50"
                        max="100"
                        value={goalTargetScore}
                        onChange={(e) => setGoalTargetScore(Math.min(100, Math.max(50, Number(e.target.value) || 50)))}
                        className="w-16 px-2 py-1 text-right font-black text-amber-900 bg-amber-50 border border-amber-300 rounded-lg text-sm outline-none"
                      />
                      <span className="font-bold text-slate-500">%</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="50"
                    max="100"
                    step="1"
                    value={goalTargetScore}
                    onChange={(e) => setGoalTargetScore(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
                  />

                  {/* Preset Score Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Presets:</span>
                    {[
                      { val: 80, label: '80% Distinction' },
                      { val: 85, label: '85% Honors' },
                      { val: 90, label: '90% Star' },
                      { val: 95, label: '95% Top Tier' },
                      { val: 100, label: '100% Maximum' }
                    ].map(p => (
                      <button
                        key={p.val}
                        type="button"
                        onClick={() => setGoalTargetScore(p.val)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all border cursor-pointer ${
                          goalTargetScore === p.val
                            ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Milestone and Priority in 2 Columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                      Assessment Milestone / Deadline
                    </label>
                    <select
                      value={goalTargetTerm}
                      onChange={(e) => setGoalTargetTerm(e.target.value)}
                      className="w-full text-xs font-medium border border-slate-200 rounded-xl p-2.5 bg-white text-slate-800 outline-none focus:ring-2 ring-amber-500 cursor-pointer"
                    >
                      <option value="Pre-Board Comprehensive Exam">Pre-Board Comprehensive Exam (Oct 2024)</option>
                      <option value="Term 2 Final Examination">Term 2 Final Examination (Aug 2024)</option>
                      <option value="Term 2 Midterm Examination">Term 2 Midterm Examination (Jul 2024)</option>
                      <option value="Mid-Year Practical Lab & Viva">Mid-Year Practical Lab & Viva (Jun 2024)</option>
                      <option value="May Diagnostic Progress Test">May Diagnostic Progress Test (May 2024)</option>
                      <option value="Annual Secondary Board Exam">Annual Secondary Board Exam (Dec 2024)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                      Intervention Priority
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                      {(['High', 'Medium', 'Low'] as const).map(p => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setGoalPriority(p)}
                          className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                            goalPriority === p
                              ? p === 'High'
                                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                                : p === 'Medium'
                                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                                : 'bg-blue-600 text-white border-blue-600 shadow-xs'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Pedagogical Strategy Notes */}
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Pedagogical Strategy & Academic Intervention Action Plan
                  </label>
                  <textarea
                    rows={3}
                    value={goalStrategyNotes}
                    onChange={(e) => setGoalStrategyNotes(e.target.value)}
                    placeholder="Enter targeted revision strategy, focus topics, or remedial assignments..."
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 ring-amber-500 text-slate-800"
                  />
                  {/* Suggestion Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Quick Add:</span>
                    {[
                      'Weekly numerical worksheets',
                      '30-min timed model tests',
                      'Formula mind-maps & derivations',
                      'Peer tutoring & lab viva revision'
                    ].map(rec => (
                      <button
                        key={rec}
                        type="button"
                        onClick={() => setGoalStrategyNotes(prev => prev ? `${prev}. ${rec}` : rec)}
                        className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 transition-colors cursor-pointer"
                      >
                        + {rec}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div>
                    {existingGoal && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => handleDeleteGoal(goalEditingSubjectCode)}
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 text-xs font-bold"
                      >
                        <Trash2 size={13} className="mr-1" />
                        Delete Goal
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => setIsGoalModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveGoal}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs"
                    >
                      <Check size={14} className="mr-1.5" />
                      Save & Apply Target Goal
                    </Button>
                  </div>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
};
