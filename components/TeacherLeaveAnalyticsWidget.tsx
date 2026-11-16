import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import {
  CalendarRange,
  PieChart as PieIcon,
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle,
  Users,
  Award,
  Calendar,
  Filter,
  ArrowUpRight,
  Info,
  Sparkles,
  ChevronRight,
  RefreshCw,
  HelpCircle,
  FileText,
  Printer,
  Download
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { LeaveAnalyticsPdfModal } from './LeaveAnalyticsPdfModal';
import {
  getLeaveApplications,
  subscribeToLeaveUpdates,
  getLeaveTypeDistribution,
  getMonthlyLeaveTrends,
  LeaveTypeDistributionItem,
  MonthlyLeaveTrendItem
} from '../utils/leaveWorkflow';
import { LeaveApplication } from '../types';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export const TeacherLeaveAnalyticsWidget: React.FC = () => {
  const [applications, setApplications] = useState<LeaveApplication[]>(() => getLeaveApplications());
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [barChartMetric, setBarChartMetric] = useState<'status' | 'types' | 'days'>('status');
  const [activePieIndex, setActivePieIndex] = useState<number | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);

  // Subscribe to real-time leave workflow changes
  useEffect(() => {
    const sync = () => {
      setApplications(getLeaveApplications());
    };
    sync();
    const unsubscribe = subscribeToLeaveUpdates(sync);
    return () => unsubscribe();
  }, []);

  // Filter applications by year if selected
  const filteredApps = useMemo(() => {
    if (selectedYear === 'All') return applications;
    return applications.filter(app => {
      const dateStr = app.startDate || app.appliedOn;
      if (!dateStr) return true;
      return dateStr.startsWith(selectedYear);
    });
  }, [applications, selectedYear]);

  // Compute distribution and monthly trends
  const typeDistribution = useMemo(() => {
    return getLeaveTypeDistribution(filteredApps);
  }, [filteredApps]);

  const monthlyTrends = useMemo(() => {
    return getMonthlyLeaveTrends(applications, selectedYear);
  }, [applications, selectedYear]);

  // Overall Statistics
  const totalAppsCount = filteredApps.length;
  const approvedCount = filteredApps.filter(a => a.status === 'Approved').length;
  const pendingCount = filteredApps.filter(a => a.status === 'Pending').length;
  const rejectedCount = filteredApps.filter(a => a.status === 'Rejected').length;
  const totalDaysCount = filteredApps.reduce((acc, curr) => acc + (curr.daysCount || 1), 0);
  const approvedDaysCount = filteredApps
    .filter(a => a.status === 'Approved')
    .reduce((acc, curr) => acc + (curr.daysCount || 1), 0);

  const approvalRate = totalAppsCount > 0 ? Math.round((approvedCount / totalAppsCount) * 100) : 0;
  const avgDuration = totalAppsCount > 0 ? (totalDaysCount / totalAppsCount).toFixed(1) : '0';

  const mostFrequentType = typeDistribution.length > 0 ? typeDistribution[0] : null;

  // Custom Tooltip for Pie Chart
  const renderPieTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length > 0) {
      const data: LeaveTypeDistributionItem = payload[0].payload;
      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 text-xs min-w-[200px]">
          <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-slate-800">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: data.color }}
            />
            <span className="font-bold text-sm">{data.name}</span>
          </div>
          <div className="space-y-1 text-slate-300">
            <div className="flex justify-between items-center">
              <span>Applications:</span>
              <span className="font-mono font-bold text-white text-sm">{data.count} ({data.percentage}%)</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Cumulative Days:</span>
              <span className="font-mono font-bold text-amber-400">{data.totalDays} Days</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-slate-800/80 text-[11px]">
              <span className="text-emerald-400">Approved: {data.approvedCount}</span>
              <span className="text-amber-400">Pending: {data.pendingCount}</span>
              <span className="text-rose-400">Rejected: {data.rejectedCount}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Bar Chart
  const renderBarTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload as MonthlyLeaveTrendItem;
      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 text-xs min-w-[220px]">
          <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-800">
            <span className="font-bold text-sm text-slate-100">{data.fullMonth} {selectedYear !== 'All' ? selectedYear : ''}</span>
            <span className="font-mono text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-bold">
              {data.totalApplications} Requests
            </span>
          </div>

          <div className="space-y-1.5 text-slate-300">
            {barChartMetric === 'status' && (
              <>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                    <span>Approved:</span>
                  </span>
                  <span className="font-mono font-bold text-emerald-400">{data.approved}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                    <span>Pending Review:</span>
                  </span>
                  <span className="font-mono font-bold text-amber-400">{data.pending}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                    <span>Rejected:</span>
                  </span>
                  <span className="font-mono font-bold text-rose-400">{data.rejected}</span>
                </div>
              </>
            )}

            {barChartMetric === 'types' && (
              <>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                    <span>Casual Leave:</span>
                  </span>
                  <span className="font-mono font-bold text-amber-400">{data.casualCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                    <span>Sick Leave:</span>
                  </span>
                  <span className="font-mono font-bold text-emerald-400">{data.sickCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
                    <span>Duty / Training:</span>
                  </span>
                  <span className="font-mono font-bold text-indigo-400">{data.dutyCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />
                    <span>Other Types:</span>
                  </span>
                  <span className="font-mono font-bold text-purple-400">{data.otherCount}</span>
                </div>
              </>
            )}

            {barChartMetric === 'days' && (
              <>
                <div className="flex justify-between items-center">
                  <span>Total Leave Days:</span>
                  <span className="font-mono font-bold text-indigo-400 text-sm">{data.totalDays} Days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Sanctioned Days:</span>
                  <span className="font-mono font-bold text-emerald-400">{data.approvedDays} Days</span>
                </div>
              </>
            )}

            <div className="pt-1.5 border-t border-slate-800 text-[10.5px] text-slate-400 flex items-center justify-between">
              <span>Cumulative Days:</span>
              <span className="font-mono font-bold text-white">{data.totalDays} Days</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8 transition-all">
      {/* Top Banner / Section Header */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30 shrink-0">
            <CalendarRange size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-black tracking-tight">Faculty Leave Analytics & Absence Trends</h2>
              <span className="text-[10px] font-mono bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Live Recharts Engine
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Distribution of leave categories, seasonal monthly absenteeism patterns, and administrative approval velocity for faculty staffing governance.
            </p>
          </div>
        </div>

        {/* Action & Filter Controls */}
        <div className="flex items-center gap-2.5 flex-wrap self-start md:self-center">
          <div className="flex items-center bg-white/10 rounded-xl px-2.5 py-1.5 border border-white/15 text-xs">
            <Filter size={13} className="text-amber-400 mr-1.5" />
            <span className="text-slate-300 mr-1.5 font-medium">Year:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-transparent text-white font-bold outline-none cursor-pointer text-xs"
            >
              <option value="2026" className="bg-slate-900 text-white">2026 (Current Academic Session)</option>
              <option value="2025" className="bg-slate-900 text-white">2025 (Prior Session)</option>
              <option value="All" className="bg-slate-900 text-white">All Records</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setIsPdfModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 border border-white/20 shadow-2xs transition-all cursor-pointer"
            title="Export leave distribution and trend charts as a formatted PDF document"
          >
            <Printer size={13} className="text-amber-400" />
            <span>Export PDF</span>
          </button>

          <Link
            to="/school/leave-approval"
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-sm transition-all"
            title="Open Teacher Leave Sanctioning Desk"
          >
            <span>Sanction Desk</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-slate-950 text-amber-400 text-[10px] font-mono font-bold">
                {pendingCount}
              </span>
            )}
            <ChevronRight size={13} />
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-4 sm:p-6 bg-slate-50/70 border-b border-slate-200">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
            <span className="uppercase tracking-wider text-[11px]">Total Applications</span>
            <CalendarRange size={16} className="text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{totalAppsCount}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-bold">{approvedCount} approved</span>
            <span>•</span>
            <span className="text-amber-600 font-bold">{pendingCount} pending</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
            <span className="uppercase tracking-wider text-[11px]">Cumulative Leave Days</span>
            <Clock size={16} className="text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600 font-mono">{totalDaysCount} <span className="text-xs font-bold text-slate-500">Days</span></div>
          <div className="text-[11px] text-slate-500 mt-1">
            <span className="font-bold text-emerald-600">{approvedDaysCount} sanctioned</span> out of {totalDaysCount}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
            <span className="uppercase tracking-wider text-[11px]">Sanction Rate</span>
            <CheckCircle2 size={16} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 font-mono">{approvalRate}%</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-rose-600 font-semibold">{rejectedCount} declined</span>
            <span>({totalAppsCount > 0 ? Math.round((rejectedCount / totalAppsCount) * 100) : 0}%)</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold mb-1">
            <span className="uppercase tracking-wider text-[11px]">Most Common Type</span>
            <Sparkles size={16} className="text-purple-600" />
          </div>
          <div className="text-base font-black text-slate-900 truncate">
            {mostFrequentType ? mostFrequentType.name : 'N/A'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {mostFrequentType ? `${mostFrequentType.percentage}% of all leave filings` : 'No leave records'}
          </div>
        </div>
      </div>

      {/* Main Charts Grid: Pie Chart (Left) + Bar Chart (Right) */}
      <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ============================================================ */}
        {/* CHART 1: RECHARTS PIE CHART - LEAVE TYPE DISTRIBUTION */}
        {/* ============================================================ */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <PieIcon size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Leave Type Distribution</h3>
                  <p className="text-[11px] text-slate-500">Breakdown of teacher absences by leave category</p>
                </div>
              </div>
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {typeDistribution.length} Categories
              </span>
            </div>

            {/* Recharts Pie / Donut Chart */}
            <div className="relative h-[250px] w-full my-2 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={renderPieTooltip} />
                  <Pie
                    data={typeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="count"
                    onMouseEnter={(_, index) => setActivePieIndex(index)}
                    onMouseLeave={() => setActivePieIndex(null)}
                  >
                    {typeDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="#ffffff"
                        strokeWidth={activePieIndex === index ? 3 : 1.5}
                        className="cursor-pointer transition-all duration-200"
                        style={{
                          filter: activePieIndex === index ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))' : 'none',
                          transform: activePieIndex === index ? 'scale(1.03)' : 'scale(1)',
                          transformOrigin: 'center center'
                        }}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Donut Center Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {activePieIndex !== null && typeDistribution[activePieIndex]
                    ? typeDistribution[activePieIndex].type
                    : 'Total Leaves'}
                </span>
                <span className="text-2xl font-black text-slate-800 font-mono leading-none mt-0.5">
                  {activePieIndex !== null && typeDistribution[activePieIndex]
                    ? `${typeDistribution[activePieIndex].count}`
                    : totalAppsCount}
                </span>
                <span className="text-[10px] font-bold text-slate-500 mt-0.5">
                  {activePieIndex !== null && typeDistribution[activePieIndex]
                    ? `${typeDistribution[activePieIndex].percentage}% share`
                    : `${totalDaysCount} Days Total`}
                </span>
              </div>
            </div>

            {/* Interactive Category Legend Grid */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              {typeDistribution.map((item, idx) => (
                <div
                  key={idx}
                  onMouseEnter={() => setActivePieIndex(idx)}
                  onMouseLeave={() => setActivePieIndex(null)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer text-xs flex items-center justify-between ${
                    activePieIndex === idx
                      ? 'bg-slate-100/90 border-slate-400 shadow-2xs'
                      : 'bg-slate-50/70 border-slate-100 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-bold text-slate-800 truncate text-[11px]">{item.type}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 font-mono text-[11px]">
                    <span className="font-bold text-slate-700">{item.count}</span>
                    <span className="text-[10px] text-slate-400">({item.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Policy / Quota Note */}
          <div className="mt-4 p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100 text-[11px] text-slate-600 flex items-start gap-2">
            <Info size={14} className="text-indigo-600 shrink-0 mt-0.5" />
            <p className="leading-snug">
              Standard faculty quota: <strong>15 Casual</strong>, <strong>14 Sick</strong>, and <strong>10 Duty</strong> days annually. Maternity leave governed by statutory civil rules.
            </p>
          </div>
        </div>

        {/* ============================================================ */}
        {/* CHART 2: RECHARTS BAR CHART - MONTHLY LEAVE TRENDS */}
        {/* ============================================================ */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <BarChart3 size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Monthly Teacher Leave Trends</h3>
                  <p className="text-[11px] text-slate-500">Volume and pattern of teacher absence requests over the academic year</p>
                </div>
              </div>

              {/* Bar Metric View Switcher */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start sm:self-center">
                <button
                  type="button"
                  onClick={() => setBarChartMetric('status')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    barChartMetric === 'status'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  By Status
                </button>
                <button
                  type="button"
                  onClick={() => setBarChartMetric('types')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    barChartMetric === 'types'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  By Type
                </button>
                <button
                  type="button"
                  onClick={() => setBarChartMetric('days')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    barChartMetric === 'days'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Total Days
                </button>
              </div>
            </div>

            {/* Recharts Bar Chart */}
            <div className="h-[280px] w-full my-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyTrends}
                  margin={{ top: 15, right: 10, left: -15, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="month"
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                    allowDecimals={false}
                  />
                  <Tooltip content={renderBarTooltip} />
                  
                  {barChartMetric === 'status' && (
                    <>
                      <Legend
                        verticalAlign="top"
                        align="right"
                        wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }}
                      />
                      <Bar
                        dataKey="approved"
                        name="Approved"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                        stackId="statusStack"
                        maxBarSize={32}
                      />
                      <Bar
                        dataKey="pending"
                        name="Pending"
                        fill="#f59e0b"
                        radius={[4, 4, 0, 0]}
                        stackId="statusStack"
                        maxBarSize={32}
                      />
                      <Bar
                        dataKey="rejected"
                        name="Rejected"
                        fill="#ef4444"
                        radius={[4, 4, 0, 0]}
                        stackId="statusStack"
                        maxBarSize={32}
                      />
                    </>
                  )}

                  {barChartMetric === 'types' && (
                    <>
                      <Legend
                        verticalAlign="top"
                        align="right"
                        wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }}
                      />
                      <Bar
                        dataKey="casualCount"
                        name="Casual"
                        fill="#f59e0b"
                        radius={[4, 4, 0, 0]}
                        stackId="typeStack"
                        maxBarSize={32}
                      />
                      <Bar
                        dataKey="sickCount"
                        name="Sick"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                        stackId="typeStack"
                        maxBarSize={32}
                      />
                      <Bar
                        dataKey="dutyCount"
                        name="Duty"
                        fill="#6366f1"
                        radius={[4, 4, 0, 0]}
                        stackId="typeStack"
                        maxBarSize={32}
                      />
                      <Bar
                        dataKey="otherCount"
                        name="Other"
                        fill="#8b5cf6"
                        radius={[4, 4, 0, 0]}
                        stackId="typeStack"
                        maxBarSize={32}
                      />
                    </>
                  )}

                  {barChartMetric === 'days' && (
                    <>
                      <Legend
                        verticalAlign="top"
                        align="right"
                        wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }}
                      />
                      <Bar
                        dataKey="totalDays"
                        name="Total Days Requested"
                        fill="#6366f1"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={28}
                      />
                      <Bar
                        dataKey="approvedDays"
                        name="Sanctioned Days"
                        fill="#10b981"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={28}
                      />
                    </>
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Insight Callout */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600">
              <span className="p-1 rounded-md bg-amber-100 text-amber-800">
                <TrendingUp size={13} />
              </span>
              <span>
                <strong>Seasonal Observation:</strong> Highest absence frequencies occur during <strong>August & September</strong> (Mid-Term examination transition).
              </span>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsPdfModalOpen(true)}
                className="text-slate-700 hover:text-indigo-600 font-bold flex items-center gap-1 hover:underline text-xs cursor-pointer"
                title="Open formatted A4 PDF Document preview"
              >
                <Printer size={13} className="text-indigo-600" />
                <span>Export PDF Report</span>
              </button>
              <Link
                to="/school/leave-approval"
                className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 hover:underline shrink-0"
              >
                <span>Audit Detailed Petitions</span>
                <ChevronRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Faculty Quota & Absence Management Insights Bar */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-50 via-indigo-50/30 to-slate-50 border-t border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl shrink-0 mt-0.5">
              <CheckCircle2 size={16} />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900">100% Peer Substitute Coverage</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Every approved teacher leave is paired with an assigned subject teacher to avoid vacant classroom periods.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="p-2 bg-indigo-100 text-indigo-800 rounded-xl shrink-0 mt-0.5">
              <Clock size={16} />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900">Average Turnaround: 24 Hours</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                92% of leave petitions are formally evaluated and stamped by the Headmaster within 1 working day.
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <div className="p-2 bg-purple-100 text-purple-800 rounded-xl shrink-0 mt-0.5">
              <Award size={16} />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900">Official BISE Duty Endorsement</div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Examiner moderation and academic symposium duty absences are logged as institutional service credits.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Formatted PDF Document Export Modal */}
      <LeaveAnalyticsPdfModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        selectedYear={selectedYear}
        onYearChange={(y) => setSelectedYear(y)}
        applications={applications}
      />
    </div>
  );
};
