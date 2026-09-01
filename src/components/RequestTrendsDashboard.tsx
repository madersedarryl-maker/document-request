import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ResponsiveContainer,
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
} from 'recharts';
import {
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart3,
  Calendar,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowUpRight,
  Filter,
  Sparkles,
  Zap,
} from 'lucide-react';
import { format, subDays, startOfDay, parseISO, isAfter, isValid } from 'date-fns';
import { DocumentRequest, RequestStatus, RequestPriority } from '../types';

interface RequestTrendsDashboardProps {
  requests: DocumentRequest[];
  title?: string;
  subtitle?: string;
  role?: string;
  className?: string;
  defaultTimeRange?: '7d' | '14d' | '30d' | 'all';
  onStatusClick?: (status: string) => void;
}

// Color palette mapping for registrar status lifecycle
const STATUS_COLORS: Record<string, { fill: string; stroke: string; label: string; text: string; bg: string }> = {
  SUBMITTED: {
    fill: '#3b82f6',
    stroke: '#1d4ed8',
    label: 'New Submitted',
    text: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-200',
  },
  UNDER_REVIEW: {
    fill: '#f59e0b',
    stroke: '#d97706',
    label: 'Under Review',
    text: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
  },
  NEEDS_INFORMATION: {
    fill: '#f97316',
    stroke: '#ea580c',
    label: 'Needs Info',
    text: 'text-orange-700',
    bg: 'bg-orange-50 border-orange-200',
  },
  FOR_APPROVAL: {
    fill: '#8b5cf6',
    stroke: '#6d28d9',
    label: 'For Approval',
    text: 'text-purple-700',
    bg: 'bg-purple-50 border-purple-200',
  },
  APPROVED: {
    fill: '#10b981',
    stroke: '#059669',
    label: 'Approved',
    text: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200',
  },
  PROCESSING: {
    fill: '#0ea5e9',
    stroke: '#0284c7',
    label: 'In Processing',
    text: 'text-sky-700',
    bg: 'bg-sky-50 border-sky-200',
  },
  READY_FOR_RELEASE: {
    fill: '#14b8a6',
    stroke: '#0f766e',
    label: 'Ready for Release',
    text: 'text-teal-700',
    bg: 'bg-teal-50 border-teal-200',
  },
  RELEASED: {
    fill: '#16a34a',
    stroke: '#15803d',
    label: 'Released',
    text: 'text-green-700',
    bg: 'bg-green-50 border-green-200',
  },
  REJECTED: {
    fill: '#e11d48',
    stroke: '#be123c',
    label: 'Rejected',
    text: 'text-rose-700',
    bg: 'bg-rose-50 border-rose-200',
  },
  CANCELLED: {
    fill: '#64748b',
    stroke: '#475569',
    label: 'Cancelled',
    text: 'text-slate-600',
    bg: 'bg-slate-50 border-slate-200',
  },
};

// Top document type colors
const DOC_PALETTE = ['#1e40af', '#0d9488', '#d97706', '#7c3aed', '#dc2626', '#475569'];

export const RequestTrendsDashboard: React.FC<RequestTrendsDashboardProps> = ({
  requests = [],
  title = 'Document Request Trends & Status Analytics',
  subtitle = 'Real-time intake velocity, approval pipeline distribution, and credential demand telemetry.',
  role = 'STAFF',
  className = '',
  defaultTimeRange = '14d',
  onStatusClick,
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d' | 'all'>(defaultTimeRange);
  const [activeTab, setActiveTab] = useState<'all' | 'volume' | 'status' | 'demand'>('all');
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');
  const [activePieIndex, setActivePieIndex] = useState<number | null>(null);

  // 1. Calculate time filter threshold
  const filteredRequests = useMemo(() => {
    if (timeRange === 'all') return requests;
    const days = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30;
    const cutoff = subDays(startOfDay(new Date()), days - 1);

    return requests.filter((r) => {
      if (!r.created_at) return true;
      try {
        const d = parseISO(r.created_at);
        return isValid(d) && (isAfter(d, cutoff) || d.getTime() >= cutoff.getTime());
      } catch {
        return true;
      }
    });
  }, [requests, timeRange]);

  // 2. Generate daily timeline trend data
  const dailyTrendData = useMemo(() => {
    const daysCount = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : timeRange === '30d' ? 30 : 14;
    const now = new Date();
    const result: Array<{
      date: string;
      rawDate: Date;
      displayDate: string;
      total: number;
      urgent: number;
      normal: number;
      approvedOrReleased: number;
    }> = [];

    // Pre-populate daily slots
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = subDays(now, i);
      const dateKey = format(d, 'yyyy-MM-dd');
      result.push({
        date: dateKey,
        rawDate: d,
        displayDate: format(d, daysCount <= 7 ? 'EEE, MMM d' : 'MMM d'),
        total: 0,
        urgent: 0,
        normal: 0,
        approvedOrReleased: 0,
      });
    }

    // Populate counts from requests
    requests.forEach((req) => {
      if (!req.created_at) return;
      try {
        const reqDate = parseISO(req.created_at);
        if (!isValid(reqDate)) return;
        const key = format(reqDate, 'yyyy-MM-dd');
        const bucket = result.find((item) => item.date === key);

        if (bucket) {
          bucket.total += 1;
          if (req.priority === 'URGENT' || req.priority === 'HIGH') {
            bucket.urgent += 1;
          } else {
            bucket.normal += 1;
          }
          if (req.status === 'APPROVED' || req.status === 'RELEASED' || req.status === 'READY_FOR_RELEASE') {
            bucket.approvedOrReleased += 1;
          }
        }
      } catch (err) {
        // ignore parse error
      }
    });

    // If requests had few records on dates, ensure a realistic smooth baseline for visual preview
    return result;
  }, [requests, timeRange]);

  // 3. Status Distribution Data
  const statusDistributionData = useMemo(() => {
    const countMap: Record<string, number> = {};

    filteredRequests.forEach((req) => {
      const st = req.status || 'SUBMITTED';
      countMap[st] = (countMap[st] || 0) + 1;
    });

    const items = Object.entries(countMap)
      .map(([statusKey, count]) => {
        const config = STATUS_COLORS[statusKey] || {
          fill: '#64748b',
          stroke: '#475569',
          label: statusKey.replace(/_/g, ' '),
          text: 'text-slate-700',
          bg: 'bg-slate-50',
        };
        const percentage = filteredRequests.length > 0 ? (count / filteredRequests.length) * 100 : 0;

        return {
          statusKey,
          name: config.label,
          value: count,
          percentage: Number(percentage.toFixed(1)),
          fill: config.fill,
          stroke: config.stroke,
          text: config.text,
          bg: config.bg,
        };
      })
      .sort((a, b) => b.value - a.value);

    return items;
  }, [filteredRequests]);

  // 4. Document Type Demand Data
  const documentDemandData = useMemo(() => {
    const countMap: Record<string, { count: number; totalFee: number }> = {};

    filteredRequests.forEach((req) => {
      const name = req.document_type?.name || 'Unspecified Document';
      if (!countMap[name]) {
        countMap[name] = { count: 0, totalFee: 0 };
      }
      countMap[name].count += 1;
      countMap[name].totalFee += Number(req.fee) || 0;
    });

    return Object.entries(countMap)
      .map(([name, data], idx) => ({
        name: name.length > 28 ? name.substring(0, 26) + '...' : name,
        fullName: name,
        count: data.count,
        revenue: data.totalFee,
        percentage:
          filteredRequests.length > 0
            ? Number(((data.count / filteredRequests.length) * 100).toFixed(1))
            : 0,
        fill: DOC_PALETTE[idx % DOC_PALETTE.length],
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [filteredRequests]);

  // Summary Metrics calculations
  const totalSubmissionsInPeriod = filteredRequests.length;
  const activePipelineCount = filteredRequests.filter(
    (r) =>
      r.status !== 'RELEASED' &&
      r.status !== 'REJECTED' &&
      r.status !== 'CANCELLED'
  ).length;

  const releasedCount = filteredRequests.filter((r) => r.status === 'RELEASED').length;
  const urgentCount = filteredRequests.filter(
    (r) => r.priority === 'URGENT' || r.priority === 'HIGH'
  ).length;

  const peakDayVolume = useMemo(() => {
    if (dailyTrendData.length === 0) return 0;
    return Math.max(...dailyTrendData.map((d) => d.total));
  }, [dailyTrendData]);

  const dailyAverage = useMemo(() => {
    if (dailyTrendData.length === 0) return 0;
    const sum = dailyTrendData.reduce((acc, curr) => acc + curr.total, 0);
    return (sum / dailyTrendData.length).toFixed(1);
  }, [dailyTrendData]);

  const approvalRate = totalSubmissionsInPeriod > 0
    ? ((filteredRequests.filter((r) => r.status === 'APPROVED' || r.status === 'RELEASED' || r.status === 'READY_FOR_RELEASE').length / totalSubmissionsInPeriod) * 100).toFixed(0)
    : '0';

  // Custom Recharts Volume Tooltip
  const CustomVolumeTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white text-xs p-3 rounded-xl shadow-xl border border-slate-700/80 space-y-2 min-w-[170px] backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 font-bold">
            <span className="text-slate-300 font-sans">{data.displayDate}</span>
            <span className="text-amber-400 font-mono">{data.total} reqs</span>
          </div>
          <div className="space-y-1 text-[11px]">
            <div className="flex items-center justify-between text-blue-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Total Submissions:
              </span>
              <span className="font-bold font-mono">{data.total}</span>
            </div>
            <div className="flex items-center justify-between text-rose-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Urgent / High Priority:
              </span>
              <span className="font-bold font-mono">{data.urgent}</span>
            </div>
            <div className="flex items-center justify-between text-emerald-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Approved & Released:
              </span>
              <span className="font-bold font-mono">{data.approvedOrReleased}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Recharts Status Pie Tooltip
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white text-xs p-3 rounded-xl shadow-xl border border-slate-700 space-y-1.5 min-w-[160px]">
          <div className="flex items-center gap-2 font-bold">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
            <span>{item.name}</span>
          </div>
          <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-slate-800">
            <span>Requests:</span>
            <span className="font-bold text-white font-mono">{item.value}</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span>Share of Total:</span>
            <span className="font-bold text-amber-400 font-mono">{item.percentage}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 1. Header & Controls Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
                <BarChart3 className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900 bg-blue-100/60 px-2 py-0.5 rounded-md">
                Interactive Telemetry
              </span>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                Recharts Analytics Engine
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
              {title}
            </h2>
            <p className="text-xs text-slate-500 max-w-2xl">
              {subtitle}
            </p>
          </div>

          {/* Range & View Mode Switchers */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Time range buttons */}
            <div className="inline-flex p-1 bg-slate-100/90 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600">
              {(
                [
                  { id: '7d', label: '7 Days' },
                  { id: '14d', label: '14 Days' },
                  { id: '30d', label: '30 Days' },
                  { id: 'all', label: 'All Time' },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTimeRange(t.id)}
                  className={`px-2.5 py-1 rounded-lg transition-all text-xs font-medium cursor-pointer ${
                    timeRange === t.id
                      ? 'bg-white text-blue-900 shadow-xs font-bold'
                      : 'hover:text-slate-900 text-slate-600'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Chart View Mode Tabs */}
            <div className="hidden sm:inline-flex p-1 bg-slate-100/90 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                Full Overview
              </button>
              <button
                onClick={() => setActiveTab('volume')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'volume'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                Volume Trend
              </button>
              <button
                onClick={() => setActiveTab('status')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'status'
                    ? 'bg-blue-900 text-white shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                Status Pipeline
              </button>
            </div>
          </div>
        </div>

        {/* Mini Operational Pulse Strip (4 Quick Metric Pills) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100">
          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600/10 text-blue-700 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-500">Period Intake</div>
              <div className="text-base font-bold text-slate-900 font-mono">
                {totalSubmissionsInPeriod} <span className="text-xs text-slate-400 font-normal">reqs</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-500">Daily Average</div>
              <div className="text-base font-bold text-slate-900 font-mono">
                {dailyAverage} <span className="text-xs text-slate-400 font-normal">/ day</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-500">Approval Throughput</div>
              <div className="text-base font-bold text-emerald-700 font-mono">
                {approvalRate}%
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-500/10 text-rose-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-500">Urgent Priority</div>
              <div className="text-base font-bold text-rose-700 font-mono">
                {urgentCount} <span className="text-xs text-slate-400 font-normal">flagged</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CHART 1: Daily Submission Volume Trend (7 or 12 Cols depending on tab) */}
        {(activeTab === 'all' || activeTab === 'volume') && (
          <motion.div
            layout
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`${
              activeTab === 'volume' ? 'lg:col-span-12' : 'lg:col-span-7'
            } bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm flex flex-col justify-between`}
          >
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-700" />
                    Daily Document Request Volume
                  </h3>
                  <p className="text-xs text-slate-500">
                    Day-by-day intake timeline and surge detection
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setChartType('area')}
                    className={`px-2 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                      chartType === 'area'
                        ? 'bg-blue-100 text-blue-900 font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Area
                  </button>
                  <button
                    onClick={() => setChartType('bar')}
                    className={`px-2 py-1 rounded text-xs font-semibold cursor-pointer transition-colors ${
                      chartType === 'bar'
                        ? 'bg-blue-100 text-blue-900 font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Bars
                  </button>
                </div>
              </div>

              {/* Chart Canvas */}
              <div className="h-64 sm:h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'area' ? (
                    <AreaChart
                      data={dailyTrendData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="totalVolumeGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1d4ed8" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#1d4ed8" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="urgentVolumeGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#e11d48" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#e11d48" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="displayDate"
                        stroke="#94a3b8"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        dy={6}
                      />
                      <YAxis
                        stroke="#94a3b8"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip content={<CustomVolumeTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="total"
                        name="Total Requests"
                        stroke="#1d4ed8"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#totalVolumeGradient)"
                        activeDot={{ r: 5, stroke: '#1e3a8a', strokeWidth: 2, fill: '#ffffff' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="urgent"
                        name="Urgent Submissions"
                        stroke="#e11d48"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#urgentVolumeGradient)"
                        activeDot={{ r: 4, stroke: '#881337', strokeWidth: 2, fill: '#ffffff' }}
                      />
                    </AreaChart>
                  ) : (
                    <BarChart
                      data={dailyTrendData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis
                        dataKey="displayDate"
                        stroke="#94a3b8"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        dy={6}
                      />
                      <YAxis
                        stroke="#94a3b8"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip content={<CustomVolumeTooltip />} />
                      <Bar
                        dataKey="total"
                        name="Total Requests"
                        fill="#1d4ed8"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={32}
                      />
                      <Bar
                        dataKey="urgent"
                        name="Urgent Priority"
                        fill="#e11d48"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={32}
                      />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bottom Legend & Trend Indicators */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-blue-700 inline-block" />
                  <span className="font-medium text-slate-700">Total Submissions</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-rose-600 inline-block" />
                  <span className="font-medium text-slate-700">Urgent / High Priority</span>
                </div>
              </div>

              <div className="text-slate-500 font-mono text-[11px]">
                Peak volume: <strong className="text-slate-900">{peakDayVolume}</strong> in single day
              </div>
            </div>
          </motion.div>
        )}

        {/* CHART 2: Approval Status Distribution (5 or 12 Cols) */}
        {(activeTab === 'all' || activeTab === 'status') && (
          <motion.div
            layout
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className={`${
              activeTab === 'status' ? 'lg:col-span-12' : 'lg:col-span-5'
            } bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm flex flex-col justify-between`}
          >
            <div>
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <PieChartIcon className="w-4 h-4 text-amber-600" />
                    Approval Status Distribution
                  </h3>
                  <p className="text-xs text-slate-500">
                    Active request lifecycle breakdown
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                  {totalSubmissionsInPeriod} Total
                </span>
              </div>

              {/* Donut Chart with Centered Metric */}
              <div className="relative h-56 sm:h-60 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip content={<CustomPieTooltip />} />
                    <Pie
                      data={statusDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={62}
                      outerRadius={88}
                      paddingAngle={3}
                      dataKey="value"
                      onMouseEnter={(_, index) => setActivePieIndex(index)}
                      onMouseLeave={() => setActivePieIndex(null)}
                    >
                      {statusDistributionData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.fill}
                          stroke={index === activePieIndex ? '#0f172a' : '#ffffff'}
                          strokeWidth={index === activePieIndex ? 2 : 1}
                          className="cursor-pointer transition-all duration-200 hover:opacity-90"
                          onClick={() => onStatusClick && onStatusClick(entry.statusKey)}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                {/* Inner Donut Summary Center Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl sm:text-2xl font-black text-slate-900 font-serif tracking-tight">
                    {activePieIndex !== null
                      ? statusDistributionData[activePieIndex]?.value
                      : activePipelineCount}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {activePieIndex !== null
                      ? statusDistributionData[activePieIndex]?.name
                      : 'Active In Queue'}
                  </span>
                </div>
              </div>

              {/* Status Chips List */}
              <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {statusDistributionData.map((item, idx) => (
                  <div
                    key={item.statusKey}
                    onClick={() => onStatusClick && onStatusClick(item.statusKey)}
                    className={`flex items-center justify-between p-1.5 px-2.5 rounded-lg text-xs transition-colors cursor-pointer ${
                      activePieIndex === idx ? 'bg-slate-100 font-semibold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />
                      <span className="text-slate-800 truncate">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-bold text-slate-900 font-mono">{item.value}</span>
                      <span className="text-[10px] text-slate-400 font-mono w-10 text-right">
                        ({item.percentage}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {onStatusClick && (
              <div className="pt-3 mt-2 border-t border-slate-100 text-center">
                <span className="text-[11px] text-blue-700 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer">
                  Click any status above to filter main queue <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* 3. Secondary Row: Document Demand Breakdown */}
      {(activeTab === 'all' || activeTab === 'demand') && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-800" />
                Top Requested Academic Credentials
              </h3>
              <p className="text-xs text-slate-500">
                Volume demand distribution across official certificates and transcripts
              </p>
            </div>
            <span className="text-xs text-slate-500">
              Showing top {documentDemandData.length} document types
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documentDemandData.map((doc, idx) => (
              <div
                key={doc.fullName}
                className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:border-blue-300 transition-all group"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-[10px] font-bold text-slate-400 font-mono">
                      #{idx + 1} DEMAND
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-900 transition-colors">
                      {doc.fullName}
                    </h4>
                  </div>
                  <span className="text-xs font-mono font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 shrink-0">
                    {doc.count} reqs
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${doc.percentage}%`,
                        backgroundColor: doc.fill,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                    <span>Share: <strong>{doc.percentage}%</strong></span>
                    <span>Assessed: <strong>₱{doc.revenue.toFixed(2)}</strong></span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
