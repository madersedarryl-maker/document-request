import React, { useState } from 'react';
import { motion } from 'motion/react';
import { RequestStatus, RequestStatusHistory } from '../types';
import { StatusBadge } from './StatusBadge';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  FileCheck,
  Package,
  HelpCircle,
  Send,
  User,
  Shield,
  ArrowRight,
  ArrowUpDown,
  History,
  Info,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface TimelineProps {
  currentStatus: RequestStatus | string;
  history?: RequestStatusHistory[];
  compact?: boolean;
  createdAt?: string;
  requesterName?: string;
  requesterRole?: string;
  requestNumber?: string;
}

const WORKFLOW_STEPS: Array<{ key: RequestStatus; label: string }> = [
  { key: 'SUBMITTED', label: 'Submitted' },
  { key: 'UNDER_REVIEW', label: 'Under Review' },
  { key: 'FOR_APPROVAL', label: 'For Approval' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'PROCESSING', label: 'Processing' },
  { key: 'READY_FOR_RELEASE', label: 'Ready to Claim' },
  { key: 'RELEASED', label: 'Completed' },
];

export const Timeline: React.FC<TimelineProps> = ({
  currentStatus,
  history = [],
  compact = false,
  createdAt,
  requesterName,
  requesterRole = 'STUDENT',
  requestNumber,
}) => {
  const [sortAscending, setSortAscending] = useState(false); // Default: newest first for quick status check

  const isRejected = currentStatus === 'REJECTED';
  const isCancelled = currentStatus === 'CANCELLED';
  const isNeedsInfo = currentStatus === 'NEEDS_INFORMATION';

  // Calculate current step index
  const getCurrentStepIndex = () => {
    if (isRejected || isCancelled) return -1;
    if (isNeedsInfo) return 1; // At review stage
    return WORKFLOW_STEPS.findIndex((s) => s.key === currentStatus);
  };

  const currentIndex = getCurrentStepIndex();

  // Normalize history list or synthesize initial creation event if empty
  const rawHistoryList: RequestStatusHistory[] =
    history && history.length > 0
      ? [...history]
      : [
          {
            id: 'init-submit',
            request_id: requestNumber || 'req-init',
            previous_status: undefined,
            new_status: (currentStatus as RequestStatus) || 'SUBMITTED',
            changed_by: requesterName || 'Student Requester',
            comment: 'Official document request submitted via online portal and queued for evaluation.',
            created_at: createdAt || new Date().toISOString(),
            changed_by_user: {
              full_name: requesterName || 'Student Requester',
              role: requesterRole as any,
              email: '',
            },
          },
        ];

  // Sort history: ascending (oldest first) or descending (newest first)
  const sortedHistory = [...rawHistoryList].sort((a, b) => {
    const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return sortAscending ? timeA - timeB : timeB - timeA;
  });

  return (
    <div className="space-y-5">
      {/* 1. Linear Visual Workflow Progression */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-700" />
            Request Lifecycle Progress
          </h4>
          <span className="text-[11px] text-slate-500 font-mono">
            {isRejected
              ? 'Status: Rejected'
              : isCancelled
              ? 'Status: Cancelled'
              : isNeedsInfo
              ? 'Status: Information Requested'
              : `Step ${currentIndex + 1} of ${WORKFLOW_STEPS.length}`}
          </span>
        </div>

        {isRejected ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 text-xs"
          >
            <XCircle className="w-4 h-4 mr-2.5 text-rose-600 shrink-0" />
            <div>
              <span className="font-bold">Request Rejected:</span> This request was reviewed and rejected. Please review official registrar remarks in the audit log below.
            </div>
          </motion.div>
        ) : isCancelled ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-xs"
          >
            <XCircle className="w-4 h-4 mr-2.5 text-slate-400 shrink-0" />
            <div>
              <span className="font-bold">Request Cancelled:</span> This document transaction has been cancelled.
            </div>
          </motion.div>
        ) : isNeedsInfo ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs"
          >
            <HelpCircle className="w-4 h-4 mr-2.5 text-amber-700 shrink-0" />
            <div>
              <span className="font-bold">Action Required:</span> Additional documentation or clearance clarification was requested by the registrar.
            </div>
          </motion.div>
        ) : (
          <div className="relative pt-3 pb-2">
            <div className="overflow-x-auto">
              <div className="flex items-center min-w-[560px] justify-between px-2">
                {WORKFLOW_STEPS.map((step, idx) => {
                  const isCompleted = currentIndex > idx;
                  const isCurrent = currentIndex === idx;

                  return (
                    <div key={step.key} className="flex-1 flex flex-col items-center relative">
                      {/* Connecting Line with Animation */}
                      {idx !== 0 && (
                        <div className="absolute top-4 -left-1/2 w-full h-1 -translate-y-1/2 z-0 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: isCompleted || isCurrent ? '100%' : '0%' }}
                            transition={{ duration: 0.5, delay: idx * 0.08 }}
                            className="h-full bg-gradient-to-r from-blue-600 to-blue-700"
                          />
                        </div>
                      )}

                      {/* Step Circle with Radar Waves */}
                      <div className="relative z-10">
                        {isCurrent && (
                          <motion.span
                            animate={{ scale: [1, 1.7, 1], opacity: [0.6, 0, 0.6] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                            className="absolute -inset-1 rounded-full bg-blue-500/40 pointer-events-none"
                          />
                        )}

                        <motion.div
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                            isCompleted
                              ? 'bg-blue-700 text-white'
                              : isCurrent
                              ? 'bg-blue-700 text-white ring-4 ring-blue-100 ring-offset-1'
                              : 'bg-white text-slate-400 border border-slate-300'
                          }`}
                        >
                          {isCompleted ? (
                            <motion.div
                              initial={{ scale: 0, rotate: -45 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                            </motion.div>
                          ) : isCurrent ? (
                            <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                          ) : (
                            idx + 1
                          )}
                        </motion.div>
                      </div>

                      {/* Step Label */}
                      <span
                        className={`mt-2 text-[11px] text-center leading-tight whitespace-nowrap transition-colors ${
                          isCurrent
                            ? 'text-blue-700 font-bold'
                            : isCompleted
                            ? 'text-slate-800 font-medium'
                            : 'text-slate-400'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Official Audit History & Status Change Trail */}
      {!compact && (
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-700" />
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Status Audit History ({sortedHistory.length})
              </h4>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                Official Records
              </span>
            </div>

            {/* Sort Order Toggle */}
            <button
              type="button"
              onClick={() => setSortAscending(!sortAscending)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors font-medium"
              title="Toggle timeline order"
            >
              <ArrowUpDown className="w-3 h-3 text-slate-500" />
              <span>{sortAscending ? 'Oldest First' : 'Newest First'}</span>
            </button>
          </div>

          <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
            {sortedHistory.map((item, idx) => {
              let exactDate = 'Pending';
              let relativeDate = '';
              if (item.created_at) {
                try {
                  const d = new Date(item.created_at);
                  exactDate = format(d, 'MMM dd, yyyy • h:mm a');
                  relativeDate = formatDistanceToNow(d, { addSuffix: true });
                } catch {
                  exactDate = item.created_at;
                }
              }

              // Determine actor info
              const actorName =
                item.changed_by_user?.full_name ||
                (typeof item.changed_by === 'string' && item.changed_by.includes('staff')
                  ? 'Registrar Staff'
                  : typeof item.changed_by === 'string' && item.changed_by.includes('admin')
                  ? 'Administrator'
                  : typeof item.changed_by === 'string' && item.changed_by.includes('student')
                  ? 'Student Requester'
                  : 'Authorized Officer');

              const actorRole =
                item.changed_by_user?.role ||
                (typeof item.changed_by === 'string' && item.changed_by.includes('admin')
                  ? 'ADMIN'
                  : typeof item.changed_by === 'string' && item.changed_by.includes('student')
                  ? 'STUDENT'
                  : 'STAFF');

              const getRoleStyle = (role: string) => {
                switch (role) {
                  case 'ADMIN':
                    return 'bg-purple-50 text-purple-700 border-purple-200';
                  case 'STAFF':
                    return 'bg-blue-50 text-blue-700 border-blue-200';
                  case 'STUDENT':
                    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  default:
                    return 'bg-slate-100 text-slate-700 border-slate-200';
                }
              };

              const getIcon = (st: RequestStatus | string) => {
                switch (st) {
                  case 'SUBMITTED':
                  case 'PENDING':
                    return <Send className="w-3 h-3 text-blue-600" />;
                  case 'APPROVED':
                  case 'READY_FOR_RELEASE':
                  case 'RELEASED':
                  case 'COMPLETED':
                    return <CheckCircle2 className="w-3 h-3 text-emerald-600" />;
                  case 'REJECTED':
                  case 'CANCELLED':
                    return <XCircle className="w-3 h-3 text-rose-600" />;
                  case 'NEEDS_INFORMATION':
                    return <HelpCircle className="w-3 h-3 text-amber-700" />;
                  default:
                    return <Clock className="w-3 h-3 text-indigo-600" />;
                }
              };

              return (
                <motion.div
                  key={item.id || idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: idx * 0.05 }}
                  className="relative group"
                >
                  {/* Timeline Node Dot */}
                  <div className="absolute -left-[25px] top-1.5 w-5 h-5 rounded-full bg-white border border-slate-300 flex items-center justify-center shadow-xs group-hover:border-blue-500 transition-colors">
                    {getIcon(item.new_status)}
                  </div>

                  <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all space-y-2.5">
                    {/* Top Row: Color-Coded Status Badge Transition + Timestamp */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {item.previous_status ? (
                          <>
                            <StatusBadge status={item.previous_status} size="xs" />
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                            <StatusBadge status={item.new_status} size="sm" />
                          </>
                        ) : (
                          <StatusBadge status={item.new_status} size="sm" />
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span title={exactDate}>{exactDate}</span>
                        {relativeDate && (
                          <span className="text-slate-400 font-sans">({relativeDate})</span>
                        )}
                      </div>
                    </div>

                    {/* Middle Row: Actor Profile (Who changed it) */}
                    <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-slate-100 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px] border border-slate-200">
                          {actorName[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <span className="font-semibold text-slate-900 block leading-tight">
                            {actorName}
                          </span>
                          {item.changed_by_user?.email && (
                            <span className="text-[10px] text-slate-400 leading-none">
                              {item.changed_by_user.email}
                            </span>
                          )}
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getRoleStyle(
                          actorRole
                        )}`}
                      >
                        {actorRole === 'STAFF'
                          ? 'Registrar Officer'
                          : actorRole === 'ADMIN'
                          ? 'Administrator'
                          : actorRole === 'STUDENT'
                          ? 'Requester'
                          : actorRole}
                      </span>
                    </div>

                    {/* Bottom Row: Reason or Comments if any */}
                    {item.reason && (
                      <div className="text-xs text-rose-900 bg-rose-50/90 p-2.5 rounded-lg border border-rose-200 space-y-1">
                        <span className="font-bold uppercase tracking-wider text-[10px] text-rose-700 block">
                          Official Decision Reason
                        </span>
                        <p className="leading-relaxed">{item.reason}</p>
                      </div>
                    )}

                    {item.comment && (
                      <div className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
                        <span className="font-semibold uppercase tracking-wider text-[10px] text-slate-400 block flex items-center gap-1">
                          <Info className="w-3 h-3 text-slate-400" />
                          Remarks & Notes
                        </span>
                        <p className="leading-relaxed">{item.comment}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
