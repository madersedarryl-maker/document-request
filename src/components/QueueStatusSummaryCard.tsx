import React, { useMemo } from 'react';
import {
  Clock,
  Package,
  CheckCircle2,
  Check,
  Send,
  AlertTriangle,
  Layers,
  Inbox,
  Filter,
  X,
  FileCheck,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { DocumentRequest } from '../types';
import { isPendingStatus, isPendingOverdue, getPendingBusinessDays } from '../pages/staff/StaffRequestQueue';

interface QueueStatusSummaryCardProps {
  requests: DocumentRequest[];
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
  overdueCount?: number;
  overdueOnly?: boolean;
  onToggleOverdue?: () => void;
  loading?: boolean;
  id?: string;
}

export const QueueStatusSummaryCard: React.FC<QueueStatusSummaryCardProps> = ({
  requests,
  selectedStatus,
  onSelectStatus,
  overdueCount = 0,
  overdueOnly = false,
  onToggleOverdue,
  loading = false,
  id = 'queue-status-summary-card',
}) => {
  // Aggregate status counts
  const counts = useMemo(() => {
    const stat = {
      total: requests.length,
      pendingTotal: 0,
      submitted: 0,
      underReview: 0,
      needsInfo: 0,
      forApproval: 0,
      approved: 0,
      processing: 0,
      readyForRelease: 0,
      released: 0,
      rejected: 0,
      cancelled: 0,
      overduePending: 0,
    };

    requests.forEach((r) => {
      if (isPendingStatus(r.status)) {
        stat.pendingTotal++;
      }
      if (isPendingOverdue(r.status, r.created_at)) {
        stat.overduePending++;
      }

      switch (r.status) {
        case 'SUBMITTED':
          stat.submitted++;
          break;
        case 'UNDER_REVIEW':
          stat.underReview++;
          break;
        case 'NEEDS_INFORMATION':
          stat.needsInfo++;
          break;
        case 'FOR_APPROVAL':
          stat.forApproval++;
          break;
        case 'APPROVED':
          stat.approved++;
          break;
        case 'PROCESSING':
          stat.processing++;
          break;
        case 'READY_FOR_RELEASE':
          stat.readyForRelease++;
          break;
        case 'RELEASED':
          stat.released++;
          break;
        case 'REJECTED':
          stat.rejected++;
          break;
        case 'CANCELLED':
          stat.cancelled++;
          break;
        default:
          break;
      }
    });

    return stat;
  }, [requests]);

  // Compute percentages for distribution bar
  const total = counts.total || 1;
  const pendingPct = (counts.pendingTotal / total) * 100;
  const processingPct = (counts.processing / total) * 100;
  const readyPct = (counts.readyForRelease / total) * 100;
  const approvedPct = (counts.approved / total) * 100;
  const releasedPct = (counts.released / total) * 100;
  const otherPct = ((counts.rejected + counts.cancelled) / total) * 100;

  if (loading) {
    return (
      <div id={id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs animate-pulse space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 bg-slate-200 rounded w-48" />
          <div className="h-5 bg-slate-200 rounded w-24" />
        </div>
        <div className="h-2 bg-slate-100 rounded-full w-full" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 bg-slate-50 border border-slate-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      id={id}
      className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4 transition-all"
    >
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Queue Status Breakdown
              </h3>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {counts.total} Total {counts.total === 1 ? 'Request' : 'Requests'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Live count of requests across queue stages. Click any status to filter.
            </p>
          </div>
        </div>

        {/* Action / Reset Button if filtered */}
        <div className="flex items-center gap-2 flex-wrap self-start sm:self-center">
          {overdueCount > 0 && onToggleOverdue && (
            <button
              type="button"
              id="summary-overdue-filter-btn"
              onClick={onToggleOverdue}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border shadow-2xs ${
                overdueOnly
                  ? 'bg-amber-500 text-slate-950 border-amber-600 ring-2 ring-amber-400 font-extrabold'
                  : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
              }`}
              title="Toggle filter for requests pending > 3 business days"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
              <span>{overdueCount} Overdue (&gt;3d)</span>
              {overdueOnly && <X className="w-3 h-3 ml-0.5" />}
            </button>
          )}

          {(selectedStatus !== 'ALL' || overdueOnly) && (
            <button
              type="button"
              id="summary-reset-filter-btn"
              onClick={() => {
                onSelectStatus('ALL');
                if (overdueOnly && onToggleOverdue) {
                  onToggleOverdue();
                }
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Show All</span>
            </button>
          )}
        </div>
      </div>

      {/* Proportional Distribution Bar */}
      {counts.total > 0 && (
        <div className="space-y-1.5">
          <div
            className="w-full h-2 rounded-full overflow-hidden flex bg-slate-100 border border-slate-200/80 shadow-inner"
            title={`Status Distribution: ${counts.pendingTotal} Pending (${pendingPct.toFixed(0)}%), ${counts.processing} Processing (${processingPct.toFixed(0)}%), ${counts.readyForRelease} Ready (${readyPct.toFixed(0)}%), ${counts.approved} Approved (${approvedPct.toFixed(0)}%), ${counts.released} Released (${releasedPct.toFixed(0)}%)`}
          >
            {counts.pendingTotal > 0 && (
              <div
                style={{ width: `${pendingPct}%` }}
                className="bg-amber-500 h-full transition-all duration-500 relative group"
              />
            )}
            {counts.processing > 0 && (
              <div
                style={{ width: `${processingPct}%` }}
                className="bg-cyan-500 h-full transition-all duration-500"
              />
            )}
            {counts.readyForRelease > 0 && (
              <div
                style={{ width: `${readyPct}%` }}
                className="bg-emerald-500 h-full transition-all duration-500"
              />
            )}
            {counts.approved > 0 && (
              <div
                style={{ width: `${approvedPct}%` }}
                className="bg-indigo-500 h-full transition-all duration-500"
              />
            )}
            {counts.released > 0 && (
              <div
                style={{ width: `${releasedPct}%` }}
                className="bg-teal-600 h-full transition-all duration-500"
              />
            )}
            {otherPct > 0 && (
              <div
                style={{ width: `${otherPct}%` }}
                className="bg-slate-400 h-full transition-all duration-500"
              />
            )}
          </div>
        </div>
      )}

      {/* Status Breakdown Grid Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* 1. Pending Breakdown Card */}
        <button
          type="button"
          id="summary-card-pending"
          onClick={() => onSelectStatus(selectedStatus === 'PENDING' ? 'ALL' : 'PENDING')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between group ${
            selectedStatus === 'PENDING'
              ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/80 shadow-xs'
              : 'bg-slate-50/70 border-slate-200 hover:border-amber-300 hover:bg-amber-50/40 hover:shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Pending
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {counts.pendingTotal}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {counts.pendingTotal === 1 ? 'request' : 'requests'}
              </span>
            </div>

            {/* Micro Breakdown of pending types */}
            <div className="mt-2 pt-2 border-t border-slate-200/80 flex flex-wrap gap-1 text-[10px] text-slate-600">
              {counts.submitted > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-blue-100/70 text-blue-800 font-medium">
                  {counts.submitted} New
                </span>
              )}
              {counts.underReview > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-amber-100/70 text-amber-900 font-medium">
                  {counts.underReview} Review
                </span>
              )}
              {counts.forApproval > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-indigo-100/70 text-indigo-900 font-medium">
                  {counts.forApproval} Approval
                </span>
              )}
              {counts.needsInfo > 0 && (
                <span className="px-1.5 py-0.5 rounded bg-rose-100/70 text-rose-800 font-medium">
                  {counts.needsInfo} Action
                </span>
              )}
              {counts.pendingTotal === 0 && (
                <span className="text-slate-400 italic">No pending items</span>
              )}
            </div>
          </div>

          {selectedStatus === 'PENDING' && (
            <div className="absolute top-1.5 right-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-600 block" />
            </div>
          )}
        </button>

        {/* 2. Processing Card */}
        <button
          type="button"
          id="summary-card-processing"
          onClick={() => onSelectStatus(selectedStatus === 'PROCESSING' ? 'ALL' : 'PROCESSING')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between group ${
            selectedStatus === 'PROCESSING'
              ? 'bg-cyan-50 border-cyan-400 ring-2 ring-cyan-400/80 shadow-xs'
              : 'bg-slate-50/70 border-slate-200 hover:border-cyan-300 hover:bg-cyan-50/40 hover:shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              Processing
            </span>
            <div className="w-7 h-7 rounded-lg bg-cyan-100 text-cyan-800 flex items-center justify-center shrink-0">
              <Package className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {counts.processing}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {counts.processing === 1 ? 'request' : 'requests'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 line-clamp-1">
              Printing & dry seal embossing
            </p>
          </div>

          {selectedStatus === 'PROCESSING' && (
            <div className="absolute top-1.5 right-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-600 block" />
            </div>
          )}
        </button>

        {/* 3. Ready for Release Card */}
        <button
          type="button"
          id="summary-card-ready"
          onClick={() =>
            onSelectStatus(selectedStatus === 'READY_FOR_RELEASE' ? 'ALL' : 'READY_FOR_RELEASE')
          }
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between group ${
            selectedStatus === 'READY_FOR_RELEASE'
              ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400/80 shadow-xs'
              : 'bg-slate-50/70 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 hover:shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Ready to Claim
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {counts.readyForRelease}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {counts.readyForRelease === 1 ? 'request' : 'requests'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 line-clamp-1">
              Awaiting pickup / dispatch
            </p>
          </div>

          {selectedStatus === 'READY_FOR_RELEASE' && (
            <div className="absolute top-1.5 right-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600 block" />
            </div>
          )}
        </button>

        {/* 4. Approved Card */}
        <button
          type="button"
          id="summary-card-approved"
          onClick={() => onSelectStatus(selectedStatus === 'APPROVED' ? 'ALL' : 'APPROVED')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between group ${
            selectedStatus === 'APPROVED'
              ? 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-400/80 shadow-xs'
              : 'bg-slate-50/70 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 hover:shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              Approved
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {counts.approved}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {counts.approved === 1 ? 'request' : 'requests'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 line-clamp-1">
              Registrar clearance granted
            </p>
          </div>

          {selectedStatus === 'APPROVED' && (
            <div className="absolute top-1.5 right-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600 block" />
            </div>
          )}
        </button>

        {/* 5. Released Card */}
        <button
          type="button"
          id="summary-card-released"
          onClick={() => onSelectStatus(selectedStatus === 'RELEASED' ? 'ALL' : 'RELEASED')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between group ${
            selectedStatus === 'RELEASED'
              ? 'bg-teal-50 border-teal-400 ring-2 ring-teal-400/80 shadow-xs'
              : 'bg-slate-50/70 border-slate-200 hover:border-teal-300 hover:bg-teal-50/40 hover:shadow-2xs'
          }`}
        >
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-500" />
              Released
            </span>
            <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
              <Send className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {counts.released}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {counts.released === 1 ? 'request' : 'requests'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 line-clamp-1">
              Claimed or courier delivered
            </p>
          </div>

          {selectedStatus === 'RELEASED' && (
            <div className="absolute top-1.5 right-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-600 block" />
            </div>
          )}
        </button>
      </div>

      {/* Secondary Status Info if rejected or cancelled exist */}
      {(counts.rejected > 0 || counts.cancelled > 0) && (
        <div className="pt-2 border-t border-slate-100 flex items-center gap-3 text-xs text-slate-500">
          <span className="font-medium text-slate-600">Other Records:</span>
          {counts.rejected > 0 && (
            <button
              type="button"
              onClick={() => onSelectStatus(selectedStatus === 'REJECTED' ? 'ALL' : 'REJECTED')}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                selectedStatus === 'REJECTED'
                  ? 'bg-rose-100 text-rose-800 font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <XCircle className="w-3 h-3 text-rose-600" />
              <span>{counts.rejected} Rejected</span>
            </button>
          )}
          {counts.cancelled > 0 && (
            <button
              type="button"
              onClick={() => onSelectStatus(selectedStatus === 'CANCELLED' ? 'ALL' : 'CANCELLED')}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                selectedStatus === 'CANCELLED'
                  ? 'bg-slate-300 text-slate-900 font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{counts.cancelled} Cancelled</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
