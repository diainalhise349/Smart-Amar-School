import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  TrendingUp,
  UserPlus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  Calendar,
  Filter,
  ArrowUpRight,
  Layers,
  Users,
  Eye,
  FileText,
  Percent,
  Activity,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { Card, Button, Badge } from './UIComponents';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';

export interface AdmissionDailyTrend {
  date: string;
  displayDate: string;
  totalApplications: number;
  completedForms: number;
  completionRate: number; // percentage (0-100)
  approved: number;
  pendingReview: number;
  incomplete: number;
}

export interface FunnelStage {
  stage: string;
  stageBn: string;
  count: number;
  percentage: number;
  dropOffRate: number;
}

export interface ClassIntakeData {
  className: string;
  applications: number;
  capacity: number;
  fillRate: number;
}

// 30 Days of realistic daily admission trend records
const RAW_DAILY_TRENDS: AdmissionDailyTrend[] = [
  { date: '2026-08-24', displayDate: 'Aug 24', totalApplications: 14, completedForms: 11, completionRate: 78.6, approved: 9, pendingReview: 2, incomplete: 3 },
  { date: '2026-08-25', displayDate: 'Aug 25', totalApplications: 18, completedForms: 15, completionRate: 83.3, approved: 12, pendingReview: 3, incomplete: 3 },
  { date: '2026-08-26', displayDate: 'Aug 26', totalApplications: 16, completedForms: 14, completionRate: 87.5, approved: 11, pendingReview: 3, incomplete: 2 },
  { date: '2026-08-27', displayDate: 'Aug 27', totalApplications: 22, completedForms: 19, completionRate: 86.4, approved: 16, pendingReview: 3, incomplete: 3 },
  { date: '2026-08-28', displayDate: 'Aug 28', totalApplications: 25, completedForms: 22, completionRate: 88.0, approved: 18, pendingReview: 4, incomplete: 3 },
  { date: '2026-08-29', displayDate: 'Aug 29', totalApplications: 20, completedForms: 18, completionRate: 90.0, approved: 15, pendingReview: 3, incomplete: 2 },
  { date: '2026-08-30', displayDate: 'Aug 30', totalApplications: 28, completedForms: 25, completionRate: 89.3, approved: 22, pendingReview: 3, incomplete: 3 },
  { date: '2026-08-31', displayDate: 'Aug 31', totalApplications: 31, completedForms: 28, completionRate: 90.3, approved: 24, pendingReview: 4, incomplete: 3 },
  { date: '2026-09-01', displayDate: 'Sep 01', totalApplications: 35, completedForms: 32, completionRate: 91.4, approved: 27, pendingReview: 5, incomplete: 3 },
  { date: '2026-09-02', displayDate: 'Sep 02', totalApplications: 38, completedForms: 35, completionRate: 92.1, approved: 30, pendingReview: 5, incomplete: 3 },
  { date: '2026-09-03', displayDate: 'Sep 03', totalApplications: 30, completedForms: 28, completionRate: 93.3, approved: 25, pendingReview: 3, incomplete: 2 },
  { date: '2026-09-04', displayDate: 'Sep 04', totalApplications: 26, completedForms: 24, completionRate: 92.3, approved: 21, pendingReview: 3, incomplete: 2 },
  { date: '2026-09-05', displayDate: 'Sep 05', totalApplications: 34, completedForms: 31, completionRate: 91.2, approved: 27, pendingReview: 4, incomplete: 3 },
  { date: '2026-09-06', displayDate: 'Sep 06', totalApplications: 40, completedForms: 37, completionRate: 92.5, approved: 32, pendingReview: 5, incomplete: 3 },
  { date: '2026-09-07', displayDate: 'Sep 07', totalApplications: 42, completedForms: 39, completionRate: 92.9, approved: 34, pendingReview: 5, incomplete: 3 },
  { date: '2026-09-08', displayDate: 'Sep 08', totalApplications: 36, completedForms: 34, completionRate: 94.4, approved: 30, pendingReview: 4, incomplete: 2 },
  { date: '2026-09-09', displayDate: 'Sep 09', totalApplications: 45, completedForms: 42, completionRate: 93.3, approved: 37, pendingReview: 5, incomplete: 3 },
  { date: '2026-09-10', displayDate: 'Sep 10', totalApplications: 48, completedForms: 45, completionRate: 93.8, approved: 40, pendingReview: 5, incomplete: 3 },
  { date: '2026-09-11', displayDate: 'Sep 11', totalApplications: 39, completedForms: 37, completionRate: 94.9, approved: 33, pendingReview: 4, incomplete: 2 },
  { date: '2026-09-12', displayDate: 'Sep 12', totalApplications: 41, completedForms: 38, completionRate: 92.7, approved: 33, pendingReview: 5, incomplete: 3 },
  { date: '2026-09-13', displayDate: 'Sep 13', totalApplications: 52, completedForms: 49, completionRate: 94.2, approved: 44, pendingReview: 5, incomplete: 3 },
  { date: '2026-09-14', displayDate: 'Sep 14', totalApplications: 47, completedForms: 44, completionRate: 93.6, approved: 39, pendingReview: 5, incomplete: 3 },
  { date: '2026-09-15', displayDate: 'Sep 15', totalApplications: 44, completedForms: 41, completionRate: 93.2, approved: 36, pendingReview: 5, incomplete: 3 },
  { date: '2026-09-16', displayDate: 'Sep 16', totalApplications: 50, completedForms: 47, completionRate: 94.0, approved: 42, pendingReview: 5, incomplete: 3 },
  { date: '2026-09-17', displayDate: 'Sep 17', totalApplications: 55, completedForms: 52, completionRate: 94.5, approved: 46, pendingReview: 6, incomplete: 3 },
  { date: '2026-09-18', displayDate: 'Sep 18', totalApplications: 58, completedForms: 55, completionRate: 94.8, approved: 49, pendingReview: 6, incomplete: 3 },
  { date: '2026-09-19', displayDate: 'Sep 19', totalApplications: 62, completedForms: 59, completionRate: 95.2, approved: 53, pendingReview: 6, incomplete: 3 },
  { date: '2026-09-20', displayDate: 'Sep 20', totalApplications: 60, completedForms: 57, completionRate: 95.0, approved: 51, pendingReview: 6, incomplete: 3 },
  { date: '2026-09-21', displayDate: 'Sep 21', totalApplications: 64, completedForms: 61, completionRate: 95.3, approved: 55, pendingReview: 6, incomplete: 3 },
  { date: '2026-09-22', displayDate: 'Today', totalApplications: 68, completedForms: 65, completionRate: 95.6, approved: 58, pendingReview: 7, incomplete: 3 }
];

const FUNNEL_DATA: FunnelStage[] = [
  { stage: '1. Form Initiated', stageBn: '১. ফরম পূরণ শুরু', count: 1120, percentage: 100, dropOffRate: 0 },
  { stage: '2. Student Bio & DOB', stageBn: '২. শিক্ষার্থীর সাধারণ তথ্য', count: 1075, percentage: 96.0, dropOffRate: 4.0 },
  { stage: '3. Parents & Address', stageBn: '৩. অভিভাবক ও ঠিকানার তথ্য', count: 1042, percentage: 93.0, dropOffRate: 3.1 },
  { stage: '4. Academic & Signatures', stageBn: '৪. শিক্ষাগত তথ্য ও ডিজিটাল স্বাক্ষর', count: 1012, percentage: 90.4, dropOffRate: 2.8 },
  { stage: '5. Form Completed & Sent', stageBn: '৫. আবেদন সম্পন্ন ও দাখিলকৃত', count: 980, percentage: 87.5, dropOffRate: 3.2 },
  { stage: '6. Institutional Approval', stageBn: '৬. বিদ্যালয় কর্তৃপক্ষ কর্তৃক অনুমোদিত', count: 872, percentage: 77.9, dropOffRate: 11.0 }
];

const CLASS_INTAKE_DATA: ClassIntakeData[] = [
  { className: 'Class 6', applications: 185, capacity: 200, fillRate: 92.5 },
  { className: 'Class 7', applications: 140, capacity: 160, fillRate: 87.5 },
  { className: 'Class 8', applications: 132, capacity: 160, fillRate: 82.5 },
  { className: 'Class 9 (Sci)', applications: 195, capacity: 200, fillRate: 97.5 },
  { className: 'Class 9 (Com)', applications: 110, capacity: 120, fillRate: 91.7 },
  { className: 'Class 9 (Hum)', applications: 85, capacity: 100, fillRate: 85.0 },
  { className: 'Class 10', applications: 92, capacity: 100, fillRate: 92.0 },
  { className: 'Class 11 (Sci)', applications: 220, capacity: 240, fillRate: 91.7 },
  { className: 'Class 11 (Com)', applications: 130, capacity: 150, fillRate: 86.7 }
];

const SHIFT_GENDER_DATA = [
  { name: 'Morning Shift (Boys)', nameBn: 'প্রভাতি শাখা (ছাত্র)', value: 430, color: '#3b82f6' },
  { name: 'Morning Shift (Girls)', nameBn: 'প্রভাতি শাখা (ছাত্রী)', value: 395, color: '#ec4899' },
  { name: 'Day Shift (Boys)', nameBn: 'দিবা শাখা (ছাত্র)', value: 380, color: '#0ea5e9' },
  { name: 'Day Shift (Girls)', nameBn: 'দিবা শাখা (ছাত্রী)', value: 360, color: '#a855f7' }
];

export const AdmissionTrendsWidget: React.FC = () => {
  const { t, language } = useLanguage();
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d' | 'session'>('14d');
  const [activeTab, setActiveTab] = useState<'trends' | 'funnel' | 'classes' | 'demographics'>('trends');
  const [selectedStream, setSelectedStream] = useState<string>('all');

  // Filter daily trends according to selected timeframe
  const filteredTrends = useMemo(() => {
    let sliceCount = 14;
    if (timeRange === '7d') sliceCount = 7;
    else if (timeRange === '14d') sliceCount = 14;
    else if (timeRange === '30d') sliceCount = 30;
    else if (timeRange === 'session') sliceCount = RAW_DAILY_TRENDS.length;

    const baseSlice = RAW_DAILY_TRENDS.slice(-sliceCount);

    // Apply mock stream multiplier if filtered
    if (selectedStream === 'all') return baseSlice;

    const multiplier = selectedStream === 'science' ? 0.45 : selectedStream === 'commerce' ? 0.3 : 0.25;
    return baseSlice.map(item => ({
      ...item,
      totalApplications: Math.max(1, Math.round(item.totalApplications * multiplier)),
      completedForms: Math.max(1, Math.round(item.completedForms * multiplier)),
      approved: Math.max(1, Math.round(item.approved * multiplier)),
      pendingReview: Math.max(0, Math.round(item.pendingReview * multiplier)),
      incomplete: Math.max(0, Math.round(item.incomplete * multiplier))
    }));
  }, [timeRange, selectedStream]);

  // Aggregate summary metrics
  const summary = useMemo(() => {
    const totalApps = filteredTrends.reduce((acc, curr) => acc + curr.totalApplications, 0);
    const totalCompleted = filteredTrends.reduce((acc, curr) => acc + curr.completedForms, 0);
    const totalApproved = filteredTrends.reduce((acc, curr) => acc + curr.approved, 0);
    const totalPending = filteredTrends.reduce((acc, curr) => acc + curr.pendingReview, 0);
    const totalIncomplete = filteredTrends.reduce((acc, curr) => acc + curr.incomplete, 0);

    const overallCompletionRate = totalApps > 0 ? ((totalCompleted / totalApps) * 100).toFixed(1) : '0';
    const overallApprovalRate = totalCompleted > 0 ? ((totalApproved / totalCompleted) * 100).toFixed(1) : '0';

    const latestDay = filteredTrends[filteredTrends.length - 1] || { totalApplications: 0, completionRate: 0 };
    const prevDay = filteredTrends[filteredTrends.length - 2] || { totalApplications: 0 };
    const dayGrowth = prevDay.totalApplications > 0
      ? (((latestDay.totalApplications - prevDay.totalApplications) / prevDay.totalApplications) * 100).toFixed(1)
      : '+0.0';

    return {
      totalApps,
      totalCompleted,
      totalApproved,
      totalPending,
      totalIncomplete,
      overallCompletionRate,
      overallApprovalRate,
      todayApps: latestDay.totalApplications,
      todayRate: latestDay.completionRate.toFixed(1),
      dayGrowth
    };
  }, [filteredTrends]);

  // Export trends dataset to CSV
  const handleExportCSV = () => {
    const headers = ['Date,Total Applications,Completed Forms,Completion Rate (%),Approved,Pending Review,Incomplete'];
    const rows = filteredTrends.map(item =>
      `${item.date},${item.totalApplications},${item.completedForms},${item.completionRate}%,${item.approved},${item.pendingReview},${item.incomplete}`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join('\n'), rows.join('\n')].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `admission_trends_export_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Custom Tooltip for Recharts ComposedChart
  const CustomTrendsTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data: AdmissionDailyTrend = payload[0].payload;
      return (
        <div className="bg-slate-900/95 backdrop-blur-sm text-white p-3 rounded-lg shadow-xl border border-slate-700 text-xs min-w-[220px]">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5 mb-2">
            <span className="font-bold text-slate-200">{data.displayDate} ({data.date})</span>
            <span className="font-mono text-emerald-400 font-bold bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/30">
              {data.completionRate}% {t('completion_rate')}
            </span>
          </div>

          <div className="space-y-1.5 font-medium">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                {t('total_applications')}:
              </span>
              <span className="font-bold text-white font-mono">{data.totalApplications}</span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                {t('approved')}:
              </span>
              <span className="font-bold text-emerald-400 font-mono">{data.approved}</span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                {t('pending')}:
              </span>
              <span className="font-bold text-amber-400 font-mono">{data.pendingReview}</span>
            </div>

            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                {t('rejected')} / Draft:
              </span>
              <span className="font-bold text-rose-400 font-mono">{data.incomplete}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-2.5 pt-2 border-t border-slate-700/80">
            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>{t('completion_rate')}</span>
              <span>{data.completedForms} / {data.totalApplications} forms</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${data.completionRate}%` }}
              ></div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card id="admission-trends-widget" className="p-0 border border-slate-200 shadow-sm bg-white overflow-hidden rounded-xl">
      {/* 1. Header Bar with Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-indigo-50/20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-sm flex items-center justify-center shrink-0">
              <TrendingUp size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  {t('admission_trends_title')}
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Live Intake Analytics
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {t('admission_trends_subtitle')}
              </p>
            </div>
          </div>

          {/* Controls: Timeframe Filter + Stream Select + Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Stream Filter */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 shadow-2xs">
              <Filter size={13} className="text-slate-400" />
              <select
                id="admission-stream-filter"
                value={selectedStream}
                onChange={(e) => setSelectedStream(e.target.value)}
                className="bg-transparent font-medium outline-none cursor-pointer text-slate-700"
              >
                <option value="all">{t('all_streams')}</option>
                <option value="science">{t('science_stream')}</option>
                <option value="commerce">{t('commerce_stream')}</option>
                <option value="humanities">{t('humanities_stream')}</option>
              </select>
            </div>

            {/* Timeframe Buttons */}
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100/80 p-0.5 text-xs font-semibold">
              <button
                id="timeframe-7d-btn"
                type="button"
                onClick={() => setTimeRange('7d')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  timeRange === '7d' ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                7D
              </button>
              <button
                id="timeframe-14d-btn"
                type="button"
                onClick={() => setTimeRange('14d')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  timeRange === '14d' ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                14D
              </button>
              <button
                id="timeframe-30d-btn"
                type="button"
                onClick={() => setTimeRange('30d')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  timeRange === '30d' ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                30D
              </button>
              <button
                id="timeframe-session-btn"
                type="button"
                onClick={() => setTimeRange('session')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  timeRange === 'session' ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Session
              </button>
            </div>

            {/* Quick Export & Navigation Actions */}
            <button
              id="export-trends-csv-btn"
              type="button"
              onClick={handleExportCSV}
              title={t('download_report')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold shadow-2xs transition-colors"
            >
              <Download size={13} className="text-slate-500" />
              <span className="hidden sm:inline">{t('download_report')}</span>
            </button>

            <Link
              to="/school/students/admission-request"
              id="view-admission-requests-link"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold transition-colors"
            >
              <Eye size={13} />
              <span className="hidden md:inline">{t('admission_requests_btn')}</span>
            </Link>

            <Link
              to="/school/students/admission"
              id="new-admission-widget-link"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
            >
              <UserPlus size={13} />
              <span>{t('new_admission_btn')}</span>
            </Link>
          </div>
        </div>

        {/* 2. Top Metric KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-4">
          {/* KPI 1: Total Applications */}
          <div className="p-3 bg-white rounded-lg border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">{t('total_applications')}</span>
              <FileText size={14} className="text-blue-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-900 font-mono">{summary.totalApps}</span>
              <span className="text-[11px] font-bold text-emerald-600 flex items-center">
                <ArrowUpRight size={12} /> {summary.dayGrowth}%
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Across {filteredTrends.length} days recorded</p>
          </div>

          {/* KPI 2: Today's Intake Volume */}
          <div className="p-3 bg-white rounded-lg border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">{t('today_applications')}</span>
              <Activity size={14} className="text-indigo-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-indigo-700 font-mono">{summary.todayApps}</span>
              <span className="text-[10px] font-semibold text-slate-500">new today</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Peak intake window</p>
          </div>

          {/* KPI 3: Average Completion Rate */}
          <div className="p-3 bg-white rounded-lg border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">{t('avg_completion')}</span>
              <Percent size={14} className="text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-emerald-700 font-mono">{summary.overallCompletionRate}%</span>
              <span className="text-[10px] font-bold text-emerald-600">✓ {t('target_benchmark')}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1 mt-1.5 overflow-hidden">
              <div
                className="bg-emerald-600 h-1 rounded-full"
                style={{ width: `${Math.min(100, Number(summary.overallCompletionRate))}%` }}
              ></div>
            </div>
          </div>

          {/* KPI 4: Institutional Approvals */}
          <div className="p-3 bg-white rounded-lg border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">{t('approved')}</span>
              <CheckCircle2 size={14} className="text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-slate-900 font-mono">{summary.totalApproved}</span>
              <span className="text-[11px] font-bold text-emerald-600">({summary.overallApprovalRate}%)</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Dual-verified enrollments</p>
          </div>

          {/* KPI 5: Pending Verification */}
          <div className="p-3 bg-white rounded-lg border border-slate-200/90 shadow-2xs col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">{t('pending_verification')}</span>
              <Clock size={14} className="text-amber-500" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black text-amber-600 font-mono">{summary.totalPending}</span>
              <span className="text-[10px] font-medium text-slate-500">review queue</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Awaiting certificate check</p>
          </div>
        </div>

        {/* 3. Sub-View Navigation Tabs */}
        <div className="flex items-center gap-1 mt-4 border-b border-slate-200 pt-1">
          <button
            id="tab-admission-trends"
            type="button"
            onClick={() => setActiveTab('trends')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'trends'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40 rounded-t-md'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <TrendingUp size={14} />
            <span>{t('daily_volume')} & {t('completion_rate')}</span>
          </button>

          <button
            id="tab-admission-funnel"
            type="button"
            onClick={() => setActiveTab('funnel')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'funnel'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40 rounded-t-md'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers size={14} />
            <span>{t('conversion_funnel')}</span>
          </button>

          <button
            id="tab-admission-classes"
            type="button"
            onClick={() => setActiveTab('classes')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'classes'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40 rounded-t-md'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users size={14} />
            <span>{t('class_distribution')}</span>
          </button>

          <button
            id="tab-admission-demographics"
            type="button"
            onClick={() => setActiveTab('demographics')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'demographics'
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/40 rounded-t-md'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar size={14} />
            <span>{t('shift_gender_ratio')}</span>
          </button>
        </div>
      </div>

      {/* 4. Chart Content Stage */}
      <div className="p-4 sm:p-5">
        {/* VIEW 1: Dual-Axis Recharts ComposedChart (Daily Volume vs Completion Rate) */}
        {activeTab === 'trends' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 text-xs text-slate-600 gap-2">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-3 h-3 bg-blue-500 rounded-sm"></span>
                  {t('submitted')} ({t('daily_volume')})
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-3 h-3 bg-emerald-500 rounded-sm"></span>
                  {t('approved')}
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-3 h-3 bg-amber-400 rounded-sm"></span>
                  {t('pending')}
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="w-3 h-1 bg-emerald-600 rounded-full"></span>
                  {t('completion_rate')} (%)
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                Left: Volume (Count) • Right: Completion Rate (%)
              </div>
            </div>

            <div className="h-72 sm:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={filteredTrends}
                  margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="displayDate"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  {/* Left YAxis: Application Volume */}
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                    label={{ value: 'Applications (Count)', angle: -90, position: 'insideLeft', offset: 15, style: { fontSize: 10, fill: '#94a3b8' } }}
                  />
                  {/* Right YAxis: Completion Rate % */}
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[60, 100]}
                    tick={{ fontSize: 11, fill: '#059669' }}
                    axisLine={{ stroke: '#a7f3d0' }}
                    tickLine={false}
                    tickFormatter={(val) => `${val}%`}
                    label={{ value: 'Completion Rate (%)', angle: 90, position: 'insideRight', offset: 15, style: { fontSize: 10, fill: '#059669' } }}
                  />

                  <Tooltip content={<CustomTrendsTooltip />} />

                  {/* Benchmark 90% completion target */}
                  <ReferenceLine
                    yAxisId="right"
                    y={90}
                    stroke="#10b981"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{ value: 'Target: 90%', position: 'top', fill: '#059669', fontSize: 10, fontWeight: 700 }}
                  />

                  {/* Application Volume Stacked / Side-by-side Bars */}
                  <Bar
                    yAxisId="left"
                    dataKey="approved"
                    name={t('approved')}
                    stackId="a"
                    fill="#10b981"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="pendingReview"
                    name={t('pending')}
                    stackId="a"
                    fill="#f59e0b"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="incomplete"
                    name={t('rejected')}
                    stackId="a"
                    fill="#cbd5e1"
                    radius={[3, 3, 0, 0]}
                  />

                  {/* Smooth Completion Rate Line */}
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="completionRate"
                    name={t('completion_rate')}
                    stroke="#047857"
                    strokeWidth={2.5}
                    dot={{ fill: '#047857', stroke: '#ffffff', strokeWidth: 2, r: 3 }}
                    activeDot={{ fill: '#10b981', stroke: '#064e3b', strokeWidth: 2, r: 6 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
              <div className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-emerald-600" />
                <span>
                  <strong>Key Finding:</strong> Completion rate reached an all-time peak of{' '}
                  <strong className="text-emerald-700">{summary.todayRate}%</strong> today with digital signatures enabled.
                </span>
              </div>
              <span className="font-mono text-[11px] text-slate-400">
                Automated hourly sync active
              </span>
            </div>
          </div>
        )}

        {/* VIEW 2: Admission Conversion Funnel */}
        {activeTab === 'funnel' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-medium">
                Step-by-step progress from form initiation to enrollment fee authorization:
              </span>
              <span className="text-[11px] text-slate-400 font-mono">1,120 Initiated • 872 Enrolled</span>
            </div>

            <div className="space-y-2.5">
              {FUNNEL_DATA.map((step, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs mb-1.5 gap-1">
                    <span className="font-bold text-slate-800">
                      {language === 'bn' ? step.stageBn : step.stage}
                    </span>
                    <div className="flex items-center gap-3 font-mono">
                      <span className="text-slate-500 font-medium">{step.count} candidates</span>
                      <span className="font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded">
                        {step.percentage}% conversion
                      </span>
                      {step.dropOffRate > 0 && (
                        <span className="text-rose-600 font-semibold text-[11px]">
                          -{step.dropOffRate}% drop-off
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        idx === 0
                          ? 'bg-blue-600'
                          : idx === 1
                          ? 'bg-indigo-600'
                          : idx === 2
                          ? 'bg-teal-600'
                          : idx === 3
                          ? 'bg-emerald-600'
                          : idx === 4
                          ? 'bg-emerald-500'
                          : 'bg-emerald-700'
                      }`}
                      style={{ width: `${step.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-indigo-50/60 rounded-lg border border-indigo-100 flex items-start gap-2.5 text-xs text-indigo-900">
              <HelpCircle size={16} className="text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <strong>Recommendation:</strong> Step 4 (Academic Information & Dual Signatures) has a 97.2% retention rate. The biggest drop-off occurs during document verification (Step 6) where birth certificate uploads are audited.
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: Class-wise Intake Distribution */}
        {activeTab === 'classes' && (
          <div>
            <div className="flex items-center justify-between text-xs text-slate-600 mb-3">
              <span className="font-medium">
                Comparison of Submitted Applications vs Classroom Available Seat Capacity:
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Total Capacity: 1,280 Seats</span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={CLASS_INTAKE_DATA}
                  margin={{ top: 10, right: 10, left: -10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="className"
                    tick={{ fontSize: 11, fill: '#475569' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value: any, name: any) => [
                      value,
                      name === 'applications' ? 'Applications' : 'Available Seats'
                    ]}
                    contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  />
                  <Bar
                    dataKey="applications"
                    name="Submitted Applications"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="capacity"
                    name="Class Seat Capacity"
                    fill="#cbd5e1"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Class Fill Rate Table / Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mt-3 pt-3 border-t border-slate-100">
              {CLASS_INTAKE_DATA.slice(0, 5).map((cls, idx) => (
                <div key={idx} className="p-2 rounded bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>{cls.className}</span>
                    <span className="font-mono text-indigo-600">{cls.fillRate}%</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {cls.applications} / {cls.capacity} seats filled
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 4: Shift & Gender Demographic Breakdown */}
        {activeTab === 'demographics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={SHIFT_GENDER_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {SHIFT_GENDER_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Shift & Candidate Gender Balance
              </h4>
              <div className="space-y-2">
                {SHIFT_GENDER_DATA.map((item, idx) => {
                  const total = SHIFT_GENDER_DATA.reduce((acc, curr) => acc + curr.value, 0);
                  const pct = ((item.value / total) * 100).toFixed(1);
                  return (
                    <div key={idx} className="flex items-center justify-between p-2 rounded border border-slate-200 bg-white text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                        <span className="font-medium text-slate-800">
                          {language === 'bn' ? item.nameBn : item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="font-bold text-slate-900">{item.value}</span>
                        <span className="text-slate-400 text-[11px]">({pct}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
                <span>Total Registered Intake:</span>
                <span className="font-bold font-mono text-slate-800">1,565 students</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
