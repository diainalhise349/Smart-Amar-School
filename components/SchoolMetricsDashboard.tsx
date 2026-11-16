import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  BarChart,
  PieChart,
  Line,
  Bar,
  Area,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  CreditCard,
  GraduationCap,
  Calendar,
  Filter,
  RefreshCw,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight,
  Sparkles,
  School,
  Wallet,
  Receipt,
  Layers,
  Award,
  ChevronRight,
  Eye,
  Percent,
  Check,
  Building,
  DollarSign
} from 'lucide-react';
import { Card, Button, Badge } from './UIComponents';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';

import { getTenantMetrics } from '../utils/tenantStorage';
import { useTenant } from '../context/TenantContext';

export type TimeRange = 'today' | 'week' | 'month' | 'session';
export type MetricTab = 'all' | 'attendance' | 'fees' | 'admissions';
export type ClassFilter = 'all' | 'primary' | 'secondary' | 'higher';

export const SchoolMetricsDashboard: React.FC<{
  institutionName?: string;
  tenantSubdomain?: string;
  tenantType?: string;
  onNavigateTab?: (tab: string) => void;
}> = ({ 
  institutionName: propInstitutionName,
  tenantSubdomain: propTenantSubdomain,
  tenantType: propTenantType
}) => {
  const { t } = useLanguage();
  const contextTenant = useTenant();

  const institutionName = propInstitutionName || contextTenant.tenantName;
  const tenantSubdomain = propTenantSubdomain || contextTenant.tenantSubdomain;
  const tenantType = propTenantType || contextTenant.tenantType;

  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [activeTab, setActiveTab] = useState<MetricTab>('all');
  const [classFilter, setClassFilter] = useState<ClassFilter>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('Just now (এইমাত্র)');

  // Dynamic live metrics isolated to active tenant
  const metrics = useMemo(() => {
    return getTenantMetrics(tenantSubdomain, tenantType);
  }, [tenantSubdomain, tenantType]);

  const totalStudents = metrics.totalStudents;
  const isMadrasa = tenantType === 'Madrasa' || (tenantSubdomain && (tenantSubdomain.includes('amin') || tenantSubdomain.includes('madrasa')));
  const isCollege = tenantType === 'College' || tenantSubdomain === 'dcc';

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      const now = new Date();
      setLastUpdated(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 600);
  };

  // --- ATTENDANCE DATA GENERATION ---
  const attendanceTrendData = useMemo(() => {
    const scale = Math.max(0.1, totalStudents / 1200);
    if (timeRange === 'today') {
      return [
        { time: '08:00 AM', present: Math.round(320 * scale), absent: Math.round(80 * scale), late: Math.round(45 * scale), rate: 80.0 },
        { time: '09:00 AM', present: Math.round(980 * scale), absent: Math.round(52 * scale), late: Math.round(68 * scale), rate: 89.0 },
        { time: '10:00 AM', present: Math.round(1140 * scale), absent: Math.round(42 * scale), late: Math.round(18 * scale), rate: 95.0 },
        { time: '11:00 AM', present: metrics.presentToday, absent: metrics.absentToday, late: 0, rate: metrics.attendanceRate },
        { time: '12:00 PM', present: Math.round(metrics.presentToday * 0.99), absent: metrics.absentToday + 2, late: 0, rate: 97.0 },
        { time: '01:00 PM', present: Math.round(metrics.presentToday * 0.98), absent: metrics.absentToday + 4, late: 0, rate: 95.8 },
        { time: '02:00 PM', present: Math.round(metrics.presentToday * 0.97), absent: metrics.absentToday + 6, late: 0, rate: 95.1 },
      ];
    } else if (timeRange === 'week') {
      return [
        { time: 'রবি (Sun)', present: Math.round(metrics.presentToday * 0.97), absent: Math.round(metrics.absentToday * 1.5), leave: 5, rate: 93.0 },
        { time: 'সোম (Mon)', present: Math.round(metrics.presentToday * 0.99), absent: Math.round(metrics.absentToday * 1.1), leave: 3, rate: 95.0 },
        { time: 'মঙ্গল (Tue)', present: metrics.presentToday, absent: metrics.absentToday, leave: 4, rate: 96.4 },
        { time: 'বুধ (Wed)', present: Math.round(metrics.presentToday * 0.98), absent: Math.round(metrics.absentToday * 1.2), leave: 4, rate: 94.2 },
        { time: 'বৃহঃ (Thu)', present: Math.round(metrics.presentToday * 0.99), absent: Math.round(metrics.absentToday * 1.0), leave: 3, rate: 95.7 },
      ];
    } else if (timeRange === 'session') {
      return [
        { time: 'জানু (Jan)', present: Math.round(metrics.presentToday * 0.96), absent: Math.round(metrics.absentToday * 1.8), leave: 5, rate: 91.8 },
        { time: 'ফেব্রু (Feb)', present: Math.round(metrics.presentToday * 0.98), absent: Math.round(metrics.absentToday * 1.4), leave: 4, rate: 93.6 },
        { time: 'মার্চ (Mar)', present: metrics.presentToday, absent: metrics.absentToday, leave: 3, rate: 95.9 },
        { time: 'এপ্রিল (Apr)', present: Math.round(metrics.presentToday * 0.98), absent: Math.round(metrics.absentToday * 1.2), leave: 4, rate: 94.1 },
        { time: 'মে (May)', present: metrics.presentToday, absent: metrics.absentToday, leave: 3, rate: 96.5 },
        { time: 'চলতি সেশন', present: metrics.presentToday, absent: metrics.absentToday, leave: 3, rate: 96.1 },
      ];
    } else {
      return [
        { time: 'Week 1', present: Math.round(metrics.presentToday * 0.96), absent: Math.round(metrics.absentToday * 1.6), leave: 5, rate: 92.1 },
        { time: 'Week 2', present: Math.round(metrics.presentToday * 0.99), absent: Math.round(metrics.absentToday * 1.1), leave: 4, rate: 94.7 },
        { time: 'Week 3', present: metrics.presentToday, absent: metrics.absentToday, leave: 3, rate: 96.2 },
        { time: 'Week 4', present: Math.round(metrics.presentToday * 0.99), absent: metrics.absentToday, leave: 3, rate: 95.5 },
      ];
    }
  }, [timeRange, totalStudents, metrics]);

  // Class-wise Attendance strictly tailored to active institution curriculum
  const classWiseAttendanceData = useMemo(() => {
    let raw: any[] = [];
    if (isMadrasa) {
      raw = [
        { class: 'নূরানী শিশু শ্রেণি', rate: 96.5, present: Math.max(1, Math.round(totalStudents * 0.14)), total: Math.max(1, Math.round(totalStudents * 0.15)), level: 'primary' },
        { class: 'হিফজুল কুরআন বিভাগ', rate: 98.2, present: Math.max(1, Math.round(totalStudents * 0.18)), total: Math.max(1, Math.round(totalStudents * 0.18)), level: 'primary' },
        { class: 'ইবতেদায়ি ১ম শ্রেণি', rate: 95.2, present: Math.max(1, Math.round(totalStudents * 0.12)), total: Math.max(1, Math.round(totalStudents * 0.13)), level: 'primary' },
        { class: 'ইবতেদায়ি ৫ম শ্রেণি', rate: 97.4, present: Math.max(1, Math.round(totalStudents * 0.15)), total: Math.max(1, Math.round(totalStudents * 0.15)), level: 'primary' },
        { class: 'দাখিল ৯ম শ্রেণি', rate: 94.0, present: Math.max(1, Math.round(totalStudents * 0.14)), total: Math.max(1, Math.round(totalStudents * 0.15)), level: 'secondary' },
        { class: 'দাখিল ১০ম শ্রেণি', rate: 98.4, present: Math.max(1, Math.round(totalStudents * 0.14)), total: Math.max(1, Math.round(totalStudents * 0.14)), level: 'secondary' },
        { class: 'আলিম ১ম বর্ষ', rate: 93.8, present: Math.max(1, Math.round(totalStudents * 0.10)), total: Math.max(1, Math.round(totalStudents * 0.10)), level: 'higher' },
      ];
    } else if (isCollege) {
      raw = [
        { class: 'HSC ১ম বিজ্ঞান', rate: 95.2, present: Math.max(1, Math.round(totalStudents * 0.28)), total: Math.max(1, Math.round(totalStudents * 0.30)), level: 'higher' },
        { class: 'HSC ১ম ব্যবসায়', rate: 93.8, present: Math.max(1, Math.round(totalStudents * 0.22)), total: Math.max(1, Math.round(totalStudents * 0.24)), level: 'higher' },
        { class: 'HSC ২য় বিজ্ঞান', rate: 97.5, present: Math.max(1, Math.round(totalStudents * 0.26)), total: Math.max(1, Math.round(totalStudents * 0.27)), level: 'higher' },
        { class: 'HSC ২য় মানবিক', rate: 92.0, present: Math.max(1, Math.round(totalStudents * 0.18)), total: Math.max(1, Math.round(totalStudents * 0.19)), level: 'higher' },
      ];
    } else {
      raw = [
        { class: 'Play/Nursery', rate: 91.5, present: Math.max(1, Math.round(totalStudents * 0.08)), total: Math.max(1, Math.round(totalStudents * 0.09)), level: 'primary' },
        { class: 'Class 1', rate: 95.2, present: Math.max(1, Math.round(totalStudents * 0.09)), total: Math.max(1, Math.round(totalStudents * 0.10)), level: 'primary' },
        { class: 'Class 3', rate: 96.4, present: Math.max(1, Math.round(totalStudents * 0.10)), total: Math.max(1, Math.round(totalStudents * 0.11)), level: 'primary' },
        { class: 'Class 5', rate: 97.8, present: Math.max(1, Math.round(totalStudents * 0.12)), total: Math.max(1, Math.round(totalStudents * 0.12)), level: 'primary' },
        { class: 'Class 8', rate: 96.0, present: Math.max(1, Math.round(totalStudents * 0.14)), total: Math.max(1, Math.round(totalStudents * 0.15)), level: 'secondary' },
        { class: 'Class 9', rate: 93.2, present: Math.max(1, Math.round(totalStudents * 0.18)), total: Math.max(1, Math.round(totalStudents * 0.19)), level: 'secondary' },
        { class: 'Class 10', rate: 98.4, present: Math.max(1, Math.round(totalStudents * 0.20)), total: Math.max(1, Math.round(totalStudents * 0.20)), level: 'secondary' },
      ];
    }

    if (classFilter === 'primary') return raw.filter(c => c.level === 'primary');
    if (classFilter === 'secondary') return raw.filter(c => c.level === 'secondary');
    if (classFilter === 'higher') return raw.filter(c => c.level === 'higher');
    return raw;
  }, [classFilter, isMadrasa, isCollege, totalStudents]);

  const attendanceDistributionPie = [
    { name: 'উপস্থিত (Present)', value: metrics.presentToday, color: '#10b981' },
    { name: 'অনুপস্থিত (Absent)', value: metrics.absentToday, color: '#ef4444' },
    { name: 'ছুটিতে (Leave)', value: Math.max(1, Math.round(totalStudents * 0.015)), color: '#f59e0b' },
    { name: 'দেরি (Late)', value: Math.max(1, Math.round(totalStudents * 0.01)), color: '#6366f1' },
  ];

  // --- FEE COLLECTION PROGRESS DATA ---
  const totalTargetMonth = metrics.feeTargetMonth;
  const totalCollectedMonth = metrics.feeCollectedMonth;
  const collectionPercentage = metrics.feeCollectionRate.toFixed(1);
  const totalOverdueMonth = totalTargetMonth - totalCollectedMonth;

  const monthlyFeeData = useMemo(() => {
    const tgt = totalTargetMonth;
    return [
      { month: 'জানু (Jan)', target: tgt, collected: Math.round(tgt * 0.98), due: Math.round(tgt * 0.02), rate: 98.0 },
      { month: 'ফেব্রু (Feb)', target: tgt, collected: Math.round(tgt * 0.96), due: Math.round(tgt * 0.04), rate: 96.0 },
      { month: 'মার্চ (Mar)', target: tgt, collected: Math.round(tgt * 0.97), due: Math.round(tgt * 0.03), rate: 97.0 },
      { month: 'এপ্রিল (Apr)', target: tgt, collected: Math.round(tgt * 0.93), due: Math.round(tgt * 0.07), rate: 93.0 },
      { month: 'মে (May)', target: Math.round(tgt * 1.05), collected: Math.round(tgt * 1.0), due: Math.round(tgt * 0.05), rate: 95.0 },
      { month: 'চলতি মাস (Current)', target: totalTargetMonth, collected: totalCollectedMonth, due: totalOverdueMonth, rate: metrics.feeCollectionRate },
    ];
  }, [totalTargetMonth, totalCollectedMonth, totalOverdueMonth, metrics.feeCollectionRate]);

  const feeCategoryPie = useMemo(() => {
    if (isMadrasa) {
      return [
        { name: 'মাসিক বেতন ও খোরাকি (Tuition)', value: Math.round(totalCollectedMonth * 0.55), percentage: '55%', color: '#3b82f6' },
        { name: 'হিফজ ও কিতাব ফি (Hifz/Kitab)', value: Math.round(totalCollectedMonth * 0.20), percentage: '20%', color: '#10b981' },
        { name: 'পরীক্ষার ফি (Exam)', value: Math.round(totalCollectedMonth * 0.12), percentage: '12%', color: '#f59e0b' },
        { name: 'উন্নয়ন ও সেশন ফি (Session)', value: Math.round(totalCollectedMonth * 0.08), percentage: '8%', color: '#8b5cf6' },
        { name: 'লিল্লাহ ও কল্যাণ তহবিল (Welfare)', value: Math.round(totalCollectedMonth * 0.05), percentage: '5%', color: '#06b6d4' },
      ];
    } else {
      return [
        { name: 'মাসিক বেতন (Tuition)', value: Math.round(totalCollectedMonth * 0.58), percentage: '58%', color: '#3b82f6' },
        { name: 'পরীক্ষার ফি (Exam)', value: Math.round(totalCollectedMonth * 0.18), percentage: '18%', color: '#10b981' },
        { name: 'উন্নয়ন ও সেশন ফি (Session)', value: Math.round(totalCollectedMonth * 0.14), percentage: '14%', color: '#f59e0b' },
        { name: 'পরিবহন/বাস (Transport)', value: Math.round(totalCollectedMonth * 0.06), percentage: '6%', color: '#8b5cf6' },
        { name: 'ল্যাব ও আইসিটি (ICT/Lab)', value: Math.round(totalCollectedMonth * 0.04), percentage: '4%', color: '#06b6d4' },
      ];
    }
  }, [isMadrasa, totalCollectedMonth]);

  const paymentMethodPie = [
    { name: 'বিকাশ / নগদ (MFS)', value: 62, color: '#e11d48' },
    { name: 'ক্যাশ কাউন্টার (Cash)', value: 26, color: '#059669' },
    { name: 'ব্যাংক ও কার্ড (Bank/Card)', value: 12, color: '#4f46e5' },
  ];

  // --- ADMISSION TRENDS DATA ---
  const admissionTrendData = useMemo(() => {
    const scale = Math.max(0.1, totalStudents / 1000);
    return [
      { month: 'নভেম্বর', applications: Math.round(95 * scale), approved: Math.round(80 * scale), enrolled: Math.round(76 * scale), pending: Math.round(15 * scale) },
      { month: 'ডিসেম্বর', applications: Math.round(185 * scale), approved: Math.round(160 * scale), enrolled: Math.round(152 * scale), pending: Math.round(25 * scale) },
      { month: 'জানুয়ারি', applications: Math.round(240 * scale), approved: Math.round(215 * scale), enrolled: Math.round(205 * scale), pending: Math.round(25 * scale) },
      { month: 'ফেব্রুয়ারি', applications: Math.round(75 * scale), approved: Math.round(62 * scale), enrolled: Math.round(58 * scale), pending: Math.round(13 * scale) },
      { month: 'মার্চ-মে', applications: Math.round(45 * scale), approved: Math.round(38 * scale), enrolled: Math.round(35 * scale), pending: Math.round(7 * scale) },
    ];
  }, [totalStudents]);

  const classAdmissionData = useMemo(() => {
    if (isMadrasa) {
      return [
        { class: 'নূরানী শিশু', applicants: 85, enrolled: 75, quota: 80 },
        { class: 'হিফজ বিভাগ', applicants: 65, enrolled: 58, quota: 60 },
        { class: 'ইবতেদায়ি ১ম', applicants: 90, enrolled: 80, quota: 85 },
        { class: 'দাখিল ৯ম', applicants: 55, enrolled: 48, quota: 50 },
        { class: 'আলিম ১ম বর্ষ', applicants: 45, enrolled: 40, quota: 45 },
      ];
    } else if (isCollege) {
      return [
        { class: 'HSC বিজ্ঞান', applicants: 220, enrolled: 180, quota: 200 },
        { class: 'HSC ব্যবসায়', applicants: 180, enrolled: 150, quota: 160 },
        { class: 'HSC মানবিক', applicants: 140, enrolled: 120, quota: 130 },
        { class: 'ডিগ্রি পাস', applicants: 95, enrolled: 80, quota: 90 },
      ];
    } else {
      return [
        { class: 'Play/Nursery', applicants: 85, enrolled: 72, quota: 80 },
        { class: 'Class 1', applicants: 98, enrolled: 85, quota: 90 },
        { class: 'Class 6', applicants: 110, enrolled: 94, quota: 100 },
        { class: 'Class 9 Sci', applicants: 78, enrolled: 64, quota: 70 },
        { class: 'Class 9 Arts/Com', applicants: 65, enrolled: 55, quota: 65 },
      ];
    }
  }, [isMadrasa, isCollege]);


  // Custom Tooltips for charts
  const CustomCurrencyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs backdrop-blur-md">
          <p className="font-bold border-b border-slate-700 pb-1 mb-1.5 text-slate-200">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4 py-0.5">
              <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                <span>{entry.name}:</span>
              </span>
              <span className="font-mono font-bold">
                ৳{entry.value?.toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomAttendanceTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs backdrop-blur-md">
          <p className="font-bold border-b border-slate-700 pb-1 mb-1.5 text-slate-200">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`att-${index}`} className="flex items-center justify-between gap-4 py-0.5">
              <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                <span>{entry.name}:</span>
              </span>
              <span className="font-mono font-bold">
                {entry.value} {entry.name.includes('%') || entry.name.includes('Rate') ? '%' : 'জন'}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gradient-to-br from-white via-slate-50/50 to-indigo-50/30 rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden mb-6 transition-all">
      {/* --- DASHBOARD HEADER --- */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
              <Sparkles size={24} className="animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Institutional Intelligence & Metrics
                </h2>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Live Recharts
                </span>
              </div>
              <p className="text-xs text-indigo-200/80 mt-1 flex flex-wrap items-center gap-2">
                <span>রিয়েলটাইম উপস্থিতি, ফি আদায় অগ্রগতি এবং শিক্ষার্থী ভর্তি অ্যানালিটিক্স</span>
                <span>•</span>
                <span className="font-mono text-[11px] text-slate-300">আপডেট: {lastUpdated}</span>
              </p>
            </div>
          </div>

          {/* Top Actions: Time range, refresh, print */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Time range selector */}
            <div className="inline-flex bg-white/10 p-1 rounded-xl border border-white/15 backdrop-blur-md">
              {(
                [
                  { id: 'today', label: 'আজ (Today)' },
                  { id: 'week', label: 'সপ্তাহ (Week)' },
                  { id: 'month', label: 'চলতি মাস (Month)' },
                  { id: 'session', label: 'শিক্ষাবর্ষ (Session)' },
                ] as const
              ).map(tOpt => (
                <button
                  key={tOpt.id}
                  onClick={() => setTimeRange(tOpt.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    timeRange === tOpt.id
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-indigo-200 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tOpt.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleRefresh}
              title="রিফ্রেশ করুন"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all cursor-pointer flex items-center justify-center"
            >
              <RefreshCw size={15} className={isRefreshing ? 'animate-spin text-emerald-400' : ''} />
            </button>
          </div>
        </div>

        {/* METRIC MODULE TABS */}
        <div className="relative z-10 flex items-center gap-2 mt-5 overflow-x-auto pb-1 border-t border-white/10 pt-4">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-gradient-to-r from-emerald-500 to-indigo-600 text-white shadow-md'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            <Layers size={14} />
            <span>সমন্বিত ড্যাশবোর্ড (All-in-One Overview)</span>
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'attendance'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            <Users size={14} />
            <span>উপস্থিতি পরিসংখ্যান (Attendance)</span>
            <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-1.5 py-0.2 rounded-full font-mono">
              95.1%
            </span>
          </button>
          <button
            onClick={() => setActiveTab('fees')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'fees'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            <CreditCard size={14} />
            <span>ফি আদায় অগ্রগতি (Fee Collection)</span>
            <span className="text-[10px] bg-blue-500/30 text-blue-200 px-1.5 py-0.2 rounded-full font-mono">
              {collectionPercentage}%
            </span>
          </button>
          <button
            onClick={() => setActiveTab('admissions')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'admissions'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                : 'bg-white/5 hover:bg-white/10 text-slate-300'
            }`}
          >
            <GraduationCap size={14} />
            <span>ভর্তি বিশ্লেষণ (Admission Trends)</span>
            <span className="text-[10px] bg-purple-500/30 text-purple-200 px-1.5 py-0.2 rounded-full font-mono">
              +486 Enrolled
            </span>
          </button>
        </div>
      </div>

      {/* --- QUICK KPI SUMMARY BAR (4 CARDS) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 p-4 sm:p-6 bg-slate-50/70 border-b border-slate-200">
        {/* Attendance Card */}
        <div 
          onClick={() => setActiveTab('attendance')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              আজকের উপস্থিতি (Attendance)
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">95.1%</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
              <TrendingUp size={12} />
              +1.8% vs গতকাল
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>উপস্থিত: <strong className="text-slate-800">১,১৬৮ জন</strong></span>
            <span>অনুপস্থিত: <strong className="text-rose-600">৪২ জন</strong></span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: '95.1%' }}></div>
          </div>
        </div>

        {/* Fee Collection Card */}
        <div 
          onClick={() => setActiveTab('fees')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              চলতি মাসের ফি আদায় (Fees)
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CreditCard size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">৳৩,৮২,৫০০</span>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
              {collectionPercentage}% অর্জিত
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>টার্গেট: <strong className="text-slate-800">৳৪,৫০,০০০</strong></span>
            <span>বকেয়া: <strong className="text-amber-600">৳৬৭,৫০০</strong></span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${collectionPercentage}%` }}></div>
          </div>
        </div>

        {/* Admission Card */}
        <div 
          onClick={() => setActiveTab('admissions')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-purple-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              নতুন ভর্তি অগ্রগতি (Admissions)
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <GraduationCap size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">৪৮৬ জন</span>
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
              <TrendingUp size={12} />
              +14% প্রবৃদ্ধি
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>ভর্তি নিশ্চিত: <strong className="text-slate-800">৩৮২ জন</strong></span>
            <span>অপেক্ষমাণ: <strong className="text-indigo-600">৭৪ জন</strong></span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-purple-600 h-full rounded-full transition-all duration-500" style={{ width: '78.6%' }}></div>
          </div>
        </div>

        {/* Staff & Digital Health */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              শিক্ষক ও স্টাফ উপস্থিতি
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <School size={16} />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 font-mono">৯৭.৫%</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              ৩৯/৪০ উপস্থিত
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>ছুটিতে: <strong className="text-slate-800">১ জন (অনুমোদিত)</strong></span>
            <span>ডিজিটাল বায়োমেট্রিক: <strong className="text-emerald-600">সক্রিয়</strong></span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: '97.5%' }}></div>
          </div>
        </div>
      </div>

      {/* --- MAIN CHART VIEW AREA --- */}
      <div className="p-4 sm:p-6 space-y-6">

        {/* SECTION 1: ATTENDANCE VISUALIZATIONS */}
        {(activeTab === 'all' || activeTab === 'attendance') && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span>স্কুল-ব্যাপী উপস্থিতি অ্যানালিটিক্স (School-wide Attendance Metrics)</span>
                </h3>
                <p className="text-xs text-slate-500">প্রতিদিনের শিক্ষার্থী ও স্টাফ উপস্থিতি ট্রেন্ড এবং শ্রেণিবারী তুলনামূলক চিত্র</p>
              </div>

              {/* Class category filter */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase">শ্রেণি ফিল্টার:</span>
                <select
                  value={classFilter}
                  onChange={e => setClassFilter(e.target.value as ClassFilter)}
                  className="text-xs font-bold bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-2xs"
                >
                  <option value="all">সকল শ্রেণি (All Classes)</option>
                  <option value="primary">প্রাথমিক শাখা (Play - Class 5)</option>
                  <option value="secondary">মাধ্যমিক শাখা (Class 6 - 10)</option>
                  <option value="higher">উচ্চ মাধ্যমিক / আলিম (College)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Daily Attendance Trend (Area Chart) */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-black text-slate-800">
                      উপস্থিতি ট্রেন্ড ওভারভিউ ({timeRange.toUpperCase()})
                    </h4>
                    <p className="text-[11px] text-slate-500">উপস্থিত শিক্ষার্থী সংখ্যা ও শতকরা হার</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1.5 font-bold text-emerald-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <span>উপস্থিত (Present)</span>
                    </span>
                    <span className="flex items-center gap-1.5 font-bold text-rose-600">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                      <span>অনুপস্থিত (Absent)</span>
                    </span>
                  </div>
                </div>

                <div className="w-full h-[280px]">
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={attendanceTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomAttendanceTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="present"
                        name="উপস্থিত (Present)"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorPresent)"
                      />
                      <Area
                        type="monotone"
                        dataKey="absent"
                        name="অনুপস্থিত (Absent)"
                        stroke="#ef4444"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorAbsent)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Attendance Distribution Donut Chart */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-black text-slate-800">
                    আজকের উপস্থিতির অনুপাত
                  </h4>
                  <p className="text-[11px] text-slate-500">মোট শিক্ষার্থী: ১,২৪০ জন</p>

                  <div className="w-full h-[180px] relative my-2">
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={attendanceDistributionPie}
                          cx="50%"
                          cy="50%"
                          innerRadius={52}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {attendanceDistributionPie.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-xl font-black text-slate-900 font-mono">95.1%</span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase">গড় উপস্থিতি</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                  {attendanceDistributionPie.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                        <span>{item.name}</span>
                      </span>
                      <span className="font-mono font-bold text-slate-800">{item.value} জন</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Class-wise Attendance Performance (Bar Chart) */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h4 className="text-sm font-black text-slate-800">
                    শ্রেণিভিত্তিক উপস্থিতি হার (% Class-wise Attendance Rate)
                  </h4>
                  <p className="text-[11px] text-slate-500">প্রতিটি শ্রেণির বর্তমান উপস্থিতি অনুপাত ও ৯০% লক্ষ্যমাত্রা পর্যবেক্ষণ</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-emerald-500"></span>
                    <span>৯৩%+ দারুণ উপস্থিতি</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-amber-500"></span>
                    <span>৯০%-এর কম (মনোযোগ দিন)</span>
                  </span>
                </div>
              </div>

              <div className="w-full h-[260px]">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={classWiseAttendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="class"
                      tick={{ fontSize: 10, fill: '#475569' }}
                      angle={-20}
                      textAnchor="end"
                      height={40}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis domain={[80, 100]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      formatter={(val: any) => [`${val}%`, 'উপস্থিতি হার']}
                      labelFormatter={(label) => `শ্রেণি: ${label}`}
                    />
                    <ReferenceLine y={90} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: 'টার্গেট: ৯০%', position: 'top', fill: '#f43f5e', fontSize: 10 }} />
                    <Bar dataKey="rate" radius={[6, 6, 0, 0]}>
                      {classWiseAttendanceData.map((entry, index) => (
                        <Cell
                          key={`bar-${index}`}
                          fill={entry.rate >= 95 ? '#059669' : entry.rate >= 90 ? '#10b981' : '#f59e0b'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: FEE COLLECTION PROGRESS */}
        {(activeTab === 'all' || activeTab === 'fees') && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  <span>ফি আদায় অগ্রগতি ও আর্থিক বিবরণী (Fee Collection Progress & Trends)</span>
                </h3>
                <p className="text-xs text-slate-500">মাসিক টার্গেট বনাম আদায়, ফি ক্যাটাগরি এবং পেমেন্ট মাধ্যমের বিশদ বিবরণ</p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to="/school/accounts"
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Wallet size={13} />
                  <span>অ্যাকাউন্টিং মডিউলে যান</span>
                  <ChevronRight size={13} />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Monthly Target vs Collected Composed Chart */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div>
                    <h4 className="text-sm font-black text-slate-800">
                      মাসভিত্তিক টার্গেট বনাম সংগৃহীত ফি (Target vs Collected)
                    </h4>
                    <p className="text-[11px] text-slate-500">চলতি সেশনের রাজস্ব ও ফি আদায় পরিসংখ্যান</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold">
                    <span className="flex items-center gap-1.5 text-blue-700">
                      <span className="w-2.5 h-2.5 rounded bg-blue-600"></span>
                      <span>আদায়কৃত ফি</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-amber-600">
                      <span className="w-2.5 h-2.5 rounded bg-amber-400"></span>
                      <span>বকেয়া (Due)</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-indigo-700">
                      <span className="w-3 h-0.5 bg-indigo-500"></span>
                      <span>টার্গেট লাইন</span>
                    </span>
                  </div>
                </div>

                <div className="w-full h-[280px]">
                  <ResponsiveContainer width="100%" height={280}>
                    <ComposedChart data={monthlyFeeData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(val) => `৳${val / 1000}k`}
                      />
                      <Tooltip content={<CustomCurrencyTooltip />} />
                      <Bar dataKey="collected" name="আদায়কৃত (Collected)" fill="#2563eb" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="due" name="বকেয়া (Overdue)" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                      <Line
                        type="monotone"
                        dataKey="target"
                        name="লক্ষ্যমাত্রা (Target)"
                        stroke="#4f46e5"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: '#4f46e5' }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Fee Categories Distribution Pie */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-black text-slate-800">
                    ফি খাতভিত্তিক বিতরণ (Fee Categories)
                  </h4>
                  <p className="text-[11px] text-slate-500">চলতি মাসের সংগৃহীত ৳৩,৮২,৫০০-এর বণ্টন</p>

                  <div className="w-full h-[180px] relative my-2">
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={feeCategoryPie}
                          cx="50%"
                          cy="50%"
                          innerRadius={48}
                          outerRadius={72}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {feeCategoryPie.map((entry, index) => (
                            <Cell key={`cat-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomCurrencyTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-lg font-black text-slate-900 font-mono">৳৩.৮২L</span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase">মোট আদায়</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                  {feeCategoryPie.slice(0, 4).map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                        <span className="line-clamp-1">{item.name}</span>
                      </span>
                      <span className="font-mono font-bold text-slate-800">
                        ৳{item.value.toLocaleString('en-IN')} ({item.percentage})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Payment Method Breakdown Bar */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                  পেমেন্ট গেটওয়ে ও কালেকশন মেথড
                </span>
                <p className="text-xs text-slate-600 font-medium">
                  শিক্ষার্থীরা কিভাবে টিউশন ফি পরিশোধ করেছে:
                </p>
              </div>

              <div className="flex-1 max-w-xl">
                <div className="h-4 w-full bg-slate-100 rounded-full flex overflow-hidden shadow-inner">
                  <div style={{ width: '62%' }} className="bg-rose-500 h-full" title="bKash/Nagad (62%)"></div>
                  <div style={{ width: '26%' }} className="bg-emerald-500 h-full" title="Cash Counter (26%)"></div>
                  <div style={{ width: '12%' }} className="bg-indigo-600 h-full" title="Bank/Card (12%)"></div>
                </div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mt-2">
                  <span className="flex items-center gap-1.5 text-rose-600">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span>বিকাশ/নগদ MFS: ৬২%</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span>ক্যাশ কাউন্টার: ২৬%</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-indigo-700">
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    <span>ব্যাংক ট্রান্সফার: ১২%</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: RECENT ADMISSION TRENDS */}
        {(activeTab === 'all' || activeTab === 'admissions') && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                  <span>সাম্প্রতিক ভর্তি ট্রেন্ড ও আবেদন পাইপলাইন (Recent Admission Trends)</span>
                </h3>
                <p className="text-xs text-slate-500">নতুন শিক্ষাবর্ষের ভর্তি আবেদন, যাচাইকরণ এবং শ্রেণিভিত্তিক আসন বণ্টন</p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to="/school/students/admission-request"
                  className="px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <GraduationCap size={13} />
                  <span>ভর্তি আবেদন তালিকা দেখুন</span>
                  <ChevronRight size={13} />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Monthly Admission Trajectory Area Chart */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <div>
                    <h4 className="text-sm font-black text-slate-800">
                      মাসিক ভর্তি আবেদন ও ভর্তির অনুপাত (Intake Trajectory)
                    </h4>
                    <p className="text-[11px] text-slate-500">অনলাইন ও সরাসরি জমা হওয়া আবেদন এবং চূড়ান্ত ভর্তি</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold">
                    <span className="flex items-center gap-1.5 text-purple-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                      <span>মোট আবেদন</span>
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-700">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <span>ভর্তি নিশ্চিত</span>
                    </span>
                  </div>
                </div>

                <div className="w-full h-[280px]">
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={admissionTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorEnrolled" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="applications"
                        name="মোট আবেদন"
                        stroke="#8b5cf6"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorApplications)"
                      />
                      <Area
                        type="monotone"
                        dataKey="enrolled"
                        name="ভর্তি নিশ্চিত"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorEnrolled)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Class-wise Admission Intake Bar Chart */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-black text-slate-800">
                    শ্রেণিভিত্তিক ভর্তি সংখ্যা ও কোটা
                  </h4>
                  <p className="text-[11px] text-slate-500">অনুমোদিত কোটা বনাম ভর্তি সম্পন্ন</p>

                  <div className="w-full h-[220px] my-2">
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={classAdmissionData} layout="vertical" margin={{ top: 5, right: 10, left: 25, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis dataKey="class" type="category" tick={{ fontSize: 10, fill: '#334155' }} axisLine={false} tickLine={false} width={70} />
                        <Tooltip />
                        <Bar dataKey="enrolled" name="ভর্তি সম্পন্ন" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="quota" name="মোট কোটা" fill="#e2e8f0" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="p-3 bg-purple-50/70 border border-purple-200/60 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-purple-900">
                    <span>ভর্তি রূপান্তর হার (Conversion Rate):</span>
                    <span className="font-mono text-purple-700">78.6%</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 text-[11px]">
                    <span>ছাত্র-ছাত্রী অনুপাত:</span>
                    <span>৫২% ছাত্র : ৪৮% ছাত্রী</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- BOTTOM QUICK INSIGHT FOOTER --- */}
      <div className="p-4 bg-gradient-to-r from-slate-100 via-indigo-50/40 to-slate-100 border-t border-slate-200 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-600">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>
            স্বয়ংক্রিয় সিঙ্ক: এসএমএস গেটওয়ে, বায়োমেট্রিক ডিভাইস এবং অ্যাকাউন্টস খাতের ডাটা প্রতি ৫ মিনিটে আপডেট হয়।
          </span>
        </div>
        <div className="flex items-center gap-3 font-bold">
          <Link to="/school/reports" className="text-indigo-600 hover:text-indigo-800 hover:underline">
            সকল রিপোর্ট ডাউনলোড ➔
          </Link>
        </div>
      </div>
    </div>
  );
};
