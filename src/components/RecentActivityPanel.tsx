import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { auditService } from '../services/auditService';
import { AuditLog } from '../types';
import { Button } from '../components/Button';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  X,
  RefreshCw,
  Clock,
  ArrowRight,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  PackageCheck,
  Inbox,
  User,
  Settings,
  ShieldCheck,
  FileText,
  Upload,
  ExternalLink,
  ChevronRight,
  Layers,
  Sparkles,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface RecentActivityPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  limit?: number;
}

type ActionCategoryFilter = 'ALL' | 'STATUS' | 'INTAKE' | 'APPROVAL' | 'REQUIREMENTS';

export const RecentActivityPanel: React.FC<RecentActivityPanelProps> = ({
  isOpen,
  onClose,
  title = 'Recent Activity',
  limit = 10,
}) => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [categoryFilter, setCategoryFilter] = useState<ActionCategoryFilter>('ALL');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchRecentLogs = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      // Fetch audit logs with buffer to allow category filtering, then take the top limit
      const data = await auditService.getAuditLogs(30);
      setLogs(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching recent activity logs:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRecentLogs();
    }
  }, [isOpen]);

  // Subscribe to live system update events
  useEffect(() => {
    const handleSystemUpdate = () => {
      if (isOpen) {
        fetchRecentLogs(true);
      }
    };

    window.addEventListener('ibacmi:request_created', handleSystemUpdate);
    window.addEventListener('ibacmi:request_updated', handleSystemUpdate);

    return () => {
      window.removeEventListener('ibacmi:request_created', handleSystemUpdate);
      window.removeEventListener('ibacmi:request_updated', handleSystemUpdate);
    };
  }, [isOpen]);

  // Handle ESC key closing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRecentLogs(false);
  };

  // Filter logs by category and slice to requested limit (last 10 actions)
  const displayedLogs = useMemo(() => {
    let filtered = logs;

    if (categoryFilter === 'STATUS') {
      filtered = logs.filter(
        (l) =>
          l.action === 'STATUS_CHANGED' ||
          l.action === 'REQUEST_UPDATED' ||
          l.action.includes('STATUS')
      );
    } else if (categoryFilter === 'INTAKE') {
      filtered = logs.filter(
        (l) => l.action === 'REQUEST_CREATED' || l.action === 'USER_CREATED'
      );
    } else if (categoryFilter === 'APPROVAL') {
      filtered = logs.filter(
        (l) =>
          l.action === 'REQUEST_APPROVED' ||
          l.action === 'REQUEST_REJECTED' ||
          l.action === 'DOCUMENT_RELEASED'
      );
    } else if (categoryFilter === 'REQUIREMENTS') {
      filtered = logs.filter((l) => l.action.startsWith('REQUIREMENT_'));
    }

    return filtered.slice(0, limit);
  }, [logs, categoryFilter, limit]);

  // Helper to resolve action icons, theme colors, and semantic label
  const getActionMetadata = (log: AuditLog) => {
    const action = log.action;

    if (action === 'STATUS_CHANGED') {
      return {
        icon: ArrowRightLeft,
        colorClass: 'text-amber-700 bg-amber-50 border-amber-200',
        badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
        label: 'Status Updated',
      };
    }
    if (action === 'REQUEST_CREATED') {
      return {
        icon: Inbox,
        colorClass: 'text-blue-700 bg-blue-50 border-blue-200',
        badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
        label: 'Request Submitted',
      };
    }
    if (action === 'REQUEST_APPROVED') {
      return {
        icon: CheckCircle2,
        colorClass: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        label: 'Approved by Officer',
      };
    }
    if (action === 'REQUEST_REJECTED') {
      return {
        icon: AlertTriangle,
        colorClass: 'text-rose-700 bg-rose-50 border-rose-200',
        badgeBg: 'bg-rose-100 text-rose-900 border-rose-300',
        label: 'Request Rejected',
      };
    }
    if (action === 'DOCUMENT_RELEASED') {
      return {
        icon: PackageCheck,
        colorClass: 'text-sky-700 bg-sky-50 border-sky-200',
        badgeBg: 'bg-sky-100 text-sky-900 border-sky-300',
        label: 'Document Released',
      };
    }
    if (action === 'REQUIREMENT_APPROVED') {
      return {
        icon: FileCheck,
        colorClass: 'text-teal-700 bg-teal-50 border-teal-200',
        badgeBg: 'bg-teal-100 text-teal-900 border-teal-300',
        label: 'Requirement Verified',
      };
    }
    if (action === 'REQUIREMENT_SUBMITTED') {
      return {
        icon: Upload,
        colorClass: 'text-purple-700 bg-purple-50 border-purple-200',
        badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
        label: 'Requirement Files Uploaded',
      };
    }
    if (action === 'REQUIREMENT_REJECTED') {
      return {
        icon: AlertTriangle,
        colorClass: 'text-rose-700 bg-rose-50 border-rose-200',
        badgeBg: 'bg-rose-100 text-rose-900 border-rose-300',
        label: 'Requirement Rejected',
      };
    }
    if (action === 'SETTINGS_CHANGED' || action.includes('SETTINGS')) {
      return {
        icon: Settings,
        colorClass: 'text-slate-700 bg-slate-100 border-slate-300',
        badgeBg: 'bg-slate-200 text-slate-900 border-slate-300',
        label: 'Settings Changed',
      };
    }
    if (action.includes('DOCUMENT_TYPE')) {
      return {
        icon: FileText,
        colorClass: 'text-indigo-700 bg-indigo-50 border-indigo-200',
        badgeBg: 'bg-indigo-100 text-indigo-900 border-indigo-300',
        label: 'Document Catalog Updated',
      };
    }

    return {
      icon: Activity,
      colorClass: 'text-slate-700 bg-slate-50 border-slate-200',
      badgeBg: 'bg-slate-100 text-slate-800 border-slate-200',
      label: action.replace(/_/g, ' '),
    };
  };

  // Helper to extract request navigation link
  const getRequestTargetId = (log: AuditLog): string | null => {
    if (log.entity_type === 'requests' && log.entity_id) {
      return log.entity_id;
    }
    if (log.details?.request_id) {
      return log.details.request_id;
    }
    return null;
  };

  const handleInspectRequest = (requestId: string) => {
    onClose();
    navigate(`/staff/request/${requestId}`);
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return {
        relative: formatDistanceToNow(date, { addSuffix: true }),
        exact: format(date, 'MMM dd, yyyy • h:mm:ss a'),
      };
    } catch {
      return { relative: 'Recently', exact: dateStr };
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          {/* Slide-over Side Panel Container */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              id="recent-activity-side-panel"
              className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col h-full"
            >
              {/* 1. Header */}
              <div className="p-5 border-b border-slate-200 bg-slate-50/75 shrink-0 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center border border-blue-200 shrink-0">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-slate-900 tracking-tight">
                          {title}
                        </h2>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                          </span>
                          Live
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Showing the last {limit} actions across the entire system
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      id="refresh-activity-panel-btn"
                      onClick={handleRefresh}
                      disabled={refreshing || loading}
                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
                      title="Refresh activity feed"
                      aria-label="Refresh activity feed"
                    >
                      <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
                    </button>
                    <button
                      type="button"
                      id="close-activity-panel-btn"
                      onClick={onClose}
                      className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
                      title="Close panel (Esc)"
                      aria-label="Close panel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setCategoryFilter('ALL')}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
                      categoryFilter === 'ALL'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    All ({logs.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryFilter('STATUS')}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
                      categoryFilter === 'STATUS'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Status Updates
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryFilter('INTAKE')}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
                      categoryFilter === 'INTAKE'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    New Requests
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryFilter('APPROVAL')}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
                      categoryFilter === 'APPROVAL'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Approvals & Releases
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategoryFilter('REQUIREMENTS')}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors border ${
                      categoryFilter === 'REQUIREMENTS'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Requirements
                  </button>
                </div>
              </div>

              {/* 2. Scrollable Activity Feed List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 divide-y divide-slate-100">
                {loading ? (
                  <div className="space-y-3 pt-2">
                    {[1, 2, 3, 4, 5, 6].map((idx) => (
                      <div
                        key={idx}
                        className="bg-white p-3.5 rounded-xl border border-slate-200 animate-pulse space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                          <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                        </div>
                        <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                        <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : displayedLogs.length === 0 ? (
                  <div className="text-center py-12 px-4 space-y-2">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                      <Clock className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">No actions recorded</h3>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      There are no recent actions under this category filter.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {displayedLogs.map((log, index) => {
                      const meta = getActionMetadata(log);
                      const IconComponent = meta.icon;
                      const time = formatTimestamp(log.created_at);
                      const targetRequestId = getRequestTargetId(log);
                      const userRole = log.user?.role || 'SYSTEM';

                      return (
                        <motion.div
                          key={log.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.03 }}
                          className="bg-white rounded-xl border border-slate-200 p-3.5 shadow-2xs hover:border-slate-300 transition-all space-y-2.5 text-xs group"
                        >
                          {/* Top Row: Icon + Action Title + Timestamp */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-7 h-7 rounded-lg flex items-center justify-center border shrink-0 ${meta.colorClass}`}
                              >
                                <IconComponent className="w-3.5 h-3.5" />
                              </div>
                              <div>
                                <span className="font-bold text-slate-900 block leading-snug">
                                  {meta.label}
                                </span>
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  <span title={time.exact}>{time.relative}</span>
                                </div>
                              </div>
                            </div>

                            {/* Relative Index Tag */}
                            <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                              #{index + 1}
                            </span>
                          </div>

                          {/* Performer User Row */}
                          <div className="flex items-center justify-between text-slate-600 bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                            <div className="flex items-center gap-1.5">
                              <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                                {log.user?.full_name ? log.user.full_name[0].toUpperCase() : 'S'}
                              </div>
                              <span className="font-medium text-slate-800 truncate max-w-[160px]">
                                {log.user?.full_name || 'System Auto-Service'}
                              </span>
                            </div>
                            <span
                              className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                                userRole === 'ADMIN'
                                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                                  : userRole === 'STAFF'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : userRole === 'STUDENT'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}
                            >
                              {userRole}
                            </span>
                          </div>

                          {/* Action Details & Context */}
                          {log.details && (
                            <div className="space-y-1.5 text-[11px]">
                              {/* Status Transition Diff */}
                              {(log.details.from || log.details.to || log.details.previous_status || log.details.new_status) && (
                                <div className="flex items-center gap-1.5 flex-wrap bg-amber-50/70 text-amber-950 p-2 rounded border border-amber-200/80">
                                  <span className="font-semibold text-amber-900">Transition:</span>
                                  <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-amber-300 font-bold text-[10px]">
                                    {log.details.from || log.details.previous_status || 'INITIAL'}
                                  </span>
                                  <ArrowRight className="w-3 h-3 text-amber-700" />
                                  <span className="font-mono bg-amber-200/80 text-amber-900 px-1.5 py-0.5 rounded border border-amber-400 font-bold text-[10px]">
                                    {log.details.to || log.details.new_status}
                                  </span>
                                </div>
                              )}

                              {/* Document / Requirement context */}
                              <div className="text-slate-600 space-y-0.5">
                                {log.details.request_number && (
                                  <p className="font-mono text-blue-700 font-bold">
                                    Request: {log.details.request_number}
                                  </p>
                                )}
                                {log.details.document_type && (
                                  <p className="font-medium text-slate-800">
                                    Document: {log.details.document_type}
                                  </p>
                                )}
                                {log.details.requirement_name && (
                                  <p className="text-slate-700">
                                    Requirement: <span className="font-medium">{log.details.requirement_name}</span>
                                  </p>
                                )}
                                {log.details.reason && (
                                  <p className="text-slate-500 italic">
                                    Note/Reason: "{log.details.reason}"
                                  </p>
                                )}
                                {log.details.remarks && (
                                  <p className="text-slate-500 italic">
                                    Remarks: "{log.details.remarks}"
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Quick Inspect Request Button if linked to a request */}
                          {targetRequestId && (
                            <div className="pt-1 flex justify-end">
                              <button
                                type="button"
                                onClick={() => handleInspectRequest(targetRequestId)}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:text-blue-900 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                              >
                                <span>Inspect Request</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 3. Footer Bar */}
              <div className="p-4 border-t border-slate-200 bg-white shrink-0 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5 text-[11px]">
                  <span>Last synced:</span>
                  <span className="font-mono font-medium text-slate-700">
                    {format(lastUpdated, 'h:mm:ss a')}
                  </span>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onClose}
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
