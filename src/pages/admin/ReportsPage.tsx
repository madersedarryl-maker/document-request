import React, { useState, useEffect } from 'react';
import { reportService, DashboardStats } from '../../services/reportService';
import { requestService } from '../../services/requestService';
import { DocumentRequest } from '../../types';
import { ReportsAnalyticsSkeleton } from '../../components/Skeletons';
import { PageHeader } from '../../components/PageHeader';
import { KpiCard } from '../../components/KpiCard';
import { Button } from '../../components/Button';
import { RequestTrendsDashboard } from '../../components/RequestTrendsDashboard';
import {
  BarChart3,
  Download,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2,
  FileText,
  TrendingUp,
  RefreshCw,
  PieChart,
  Layers,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';

export const ReportsPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      const [statsData, reqsData] = await Promise.all([
        reportService.getDashboardStats(),
        requestService.getAllRequests(),
      ]);
      setStats(statsData);
      setRequests(reqsData);
    } catch (err: any) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  const handleExportAll = async () => {
    setExportError(null);
    try {
      const allRequests = await requestService.getAllRequests();
      const csv = reportService.exportRequestsToCSV(allRequests);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `registrar_executive_report_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      setExportError(err.message || 'Export failed. Please try again.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. Header with Breadcrumbs & Actions */}
      <PageHeader
        title="Registrar Analytics & Executive Reports"
        subtitle="Real-time audit performance metrics, document volume, revenue assessment, and turnaround analytics."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Analytics & Reports' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              loading={refreshing}
              onClick={handleRefresh}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Download}
              onClick={handleExportAll}
            >
              Export Complete Audit CSV
            </Button>
          </div>
        }
      />

      {exportError && (
        <div role="alert" className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {exportError}
        </div>
      )}

      {loading || !stats ? (
        <ReportsAnalyticsSkeleton />
      ) : (
        <>
          {/* Top KPI Cards (4 metrics) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <KpiCard
              label="Total Submissions"
              value={stats.totalRequests}
              description="All-time recorded requests"
              icon={Layers}
              variant="neutral"
            />
            <KpiCard
              label="Fees Assessed"
              value={`₱${stats.totalRevenue.toFixed(2)}`}
              description="Official credential assessments"
              icon={DollarSign}
              variant="emerald"
            />
            <KpiCard
              label="Completed & Released"
              value={stats.releasedRequests}
              description={
                stats.totalRequests > 0
                  ? `${((stats.releasedRequests / stats.totalRequests) * 100).toFixed(0)}% completion rate`
                  : '0% rate'
              }
              icon={CheckCircle2}
              variant="blue"
            />
            <KpiCard
              label="Active Queue"
              value={stats.pendingRequests}
              description="Under review or in production"
              icon={Clock}
              variant="amber"
            />
          </div>

          {/* Recharts Document Trends & Status Distribution */}
          <RequestTrendsDashboard
            requests={requests}
            role="ADMIN"
            title="Registrar Intake Telemetry & Status Breakdown"
            subtitle="Interactive analytics tracking daily submission velocity, approval queue distribution, and credential demands."
          />

          {/* Detailed Breakdowns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status Breakdown Panel */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-blue-700" />
                  Requests by Workflow Stage
                </h3>
              </div>

              <div className="space-y-3">
                {Object.entries(stats.byStatus).map(([statusKey, countVal]) => {
                  const count = Number(countVal) || 0;
                  const percent =
                    stats.totalRequests > 0 ? (count / stats.totalRequests) * 100 : 0;
                  return (
                    <div key={statusKey} className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-700">
                          {statusKey.replace(/_/g, ' ')}
                        </span>
                        <span className="font-bold text-slate-900 font-mono">
                          {count} <span className="text-slate-400 font-normal">({percent.toFixed(1)}%)</span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Document Demand Breakdown */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Demand by Document Type
                </h3>
              </div>

              <div className="space-y-3">
                {Object.entries(stats.byDocumentType).length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4 text-center">
                    No document transactions recorded yet.
                  </p>
                ) : (
                  Object.entries(stats.byDocumentType).map(([docName, countVal]) => {
                    const count = Number(countVal) || 0;
                    const percent =
                      stats.totalRequests > 0 ? (count / stats.totalRequests) * 100 : 0;
                    return (
                      <div key={docName} className="space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-700 truncate pr-2">
                            {docName}
                          </span>
                          <span className="font-bold text-slate-900 font-mono shrink-0">
                            {count} <span className="text-slate-400 font-normal">({percent.toFixed(1)}%)</span>
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
