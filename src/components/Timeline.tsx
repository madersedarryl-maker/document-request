import React from 'react';
import { motion } from 'motion/react';
import { RequestStatus, RequestStatusHistory } from '../types';
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
  Sparkles,
} from 'lucide-react';
import { format } from 'date-fns';

interface TimelineProps {
  currentStatus: RequestStatus;
  history?: RequestStatusHistory[];
  compact?: boolean;
}

const WORKFLOW_STEPS: Array<{ key: RequestStatus; label: string }> = [
  { key: 'SUBMITTED', label: 'Submitted' },
  { key: 'UNDER_REVIEW', label: 'Under Review' },
  { key: 'FOR_APPROVAL', label: 'For Approval' },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'PROCESSING', label: 'Processing' },
  { key: 'READY_FOR_RELEASE', label: 'Ready to Claim' },
  { key: 'RELEASED', label: 'Released' },
];

export const Timeline: React.FC<TimelineProps> = ({
  currentStatus,
  history = [],
  compact = false,
}) => {
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
              <span className="font-bold">Request Rejected:</span> This request was reviewed and rejected. Please review official registrar remarks below.
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
              <span className="font-bold">Action Required:</span> Additional documentation or clarification was requested by the registrar.
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
                      {/* Connecting Line with Drawing Animation */}
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
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${
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

      {/* 2. Chronological Audit Log */}
      {!compact && history && history.length > 0 && (
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-slate-500" />
            Official Audit Trail & Activity Log ({history.length})
          </h4>

          <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-slate-200">
            {history.map((item, idx) => {
              const dateStr = item.created_at
                ? format(new Date(item.created_at), 'MMM dd, yyyy • h:mm a')
                : 'Pending';

              const getIcon = (st: RequestStatus) => {
                switch (st) {
                  case 'SUBMITTED':
                    return <Send className="w-3 h-3 text-blue-600" />;
                  case 'APPROVED':
                  case 'READY_FOR_RELEASE':
                  case 'RELEASED':
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
                  transition={{ duration: 0.35, delay: idx * 0.07 }}
                  className="relative group"
                >
                  {/* Dot */}
                  <div className="absolute -left-[25px] top-1 w-4.5 h-4.5 rounded-full bg-white border border-slate-300 flex items-center justify-center shadow-2xs group-hover:border-blue-500 transition-colors">
                    {getIcon(item.new_status)}
                  </div>

                  <div className="bg-slate-50/70 p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors">
                    <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">
                          {item.new_status.replace(/_/g, ' ')}
                        </span>
                        {item.changed_by_user && (
                          <span className="inline-flex items-center text-[10px] text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                            <User className="w-2.5 h-2.5 mr-1 text-slate-400" />
                            {item.changed_by_user.full_name} ({item.changed_by_user.role})
                          </span>
                        )}
                      </div>
                      <time className="text-[11px] text-slate-400 font-mono">{dateStr}</time>
                    </div>

                    {item.reason && (
                      <div className="mt-1.5 text-xs text-rose-800 bg-rose-50 p-2 rounded border border-rose-200">
                        <strong className="font-semibold">Reason:</strong> {item.reason}
                      </div>
                    )}

                    {item.comment && (
                      <div className="mt-1.5 text-xs text-slate-700 bg-white p-2 rounded border border-slate-200">
                        {item.comment}
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
