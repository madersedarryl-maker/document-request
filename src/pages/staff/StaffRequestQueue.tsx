import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestService } from '../../services/requestService';
import { documentService } from '../../services/documentService';
import { reportService } from '../../services/reportService';
import { emailService, STATUS_EMAIL_TEMPLATES } from '../../services/emailService';
import { DocumentRequest, DocumentType, RequestStatus, RequestPriority, EmailNotificationLog } from '../../types';
import { StatusBadge, PriorityBadge, PaymentBadge } from '../../components/StatusBadge';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/Button';
import { TableSkeleton } from '../../components/Skeletons';
import { EmptyState } from '../../components/EmptyState';
import { QueueEmptyState } from '../../components/QueueEmptyState';
import { QueueStatusSummaryCard } from '../../components/QueueStatusSummaryCard';
import { AutoRefreshToggle } from '../../components/AutoRefreshToggle';
import { Modal } from '../../components/Modal';
import { motion, AnimatePresence } from 'motion/react';
import {
  Download,
  RefreshCw,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckSquare,
  Square,
  MinusSquare,
  CheckCircle2,
  Package,
  Clock,
  FileCheck,
  Send,
  AlertTriangle,
  Layers,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Check,
  RotateCcw,
  SlidersHorizontal,
  Info,
  Printer,
  GripVertical,
  ArrowUpToLine,
  Mail,
  MailCheck,
  Eye,
  EyeOff,
  AtSign,
  FileText,
  History,
  CheckCheck,
  ExternalLink,
  HelpCircle,
  SendHorizontal,
} from 'lucide-react';
import { format } from 'date-fns';

// Helper for highlighting matched substring in real-time
const highlightMatch = (text: string | undefined | null, query: string): React.ReactNode => {
  if (!text) return '';
  const trimmed = query.trim();
  if (!trimmed) return text;

  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);

  if (parts.length <= 1) return text;

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-amber-100 text-amber-900 font-semibold px-0.5 rounded">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
};

// Calculate elapsed business days (excluding Saturdays & Sundays)
export const getPendingBusinessDays = (
  createdAt: string | Date | undefined | null,
  targetDate: Date = new Date()
): number => {
  if (!createdAt) return 0;
  const start = new Date(createdAt);
  if (isNaN(start.getTime())) return 0;

  const cur = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const end = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

  if (cur >= end) return 0;

  let businessDays = 0;
  while (cur < end) {
    cur.setDate(cur.getDate() + 1);
    const day = cur.getDay();
    if (day !== 0 && day !== 6) {
      businessDays++;
    }
  }
  return businessDays;
};

// Check if request is in a pending status
export const isPendingStatus = (status: RequestStatus | string): boolean => {
  return ['SUBMITTED', 'UNDER_REVIEW', 'FOR_APPROVAL', 'NEEDS_INFORMATION'].includes(status);
};

// Check if a request has been in 'Pending' status for longer than 3 business days
export const isPendingOverdue = (
  status: RequestStatus | string,
  createdAt: string | Date | undefined | null
): boolean => {
  if (!isPendingStatus(status)) return false;
  const days = getPendingBusinessDays(createdAt);
  return days >= 3;
};

export const StaffRequestQueue: React.FC = () => {
  const navigate = useNavigate();

  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [docTypes, setDocTypes] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [docTypeFilter, setDocTypeFilter] = useState<string>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<string>('ALL');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut (Cmd/Ctrl+K or '/') to focus real-time search bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      } else if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        setSearchTerm('');
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Multi-Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectAllMatching, setIsSelectAllMatching] = useState(false);
  const lastSelectedIndexRef = useRef<number | null>(null);
  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  // Batch Action Modal State
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [batchTargetStatus, setBatchTargetStatus] = useState<RequestStatus>('PROCESSING');
  const [batchRemark, setBatchRemark] = useState('');
  const [batchSubmitting, setBatchSubmitting] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; message?: string } | null>(null);
  const [batchFeedback, setBatchFeedback] = useState<{
    type: 'SUCCESS' | 'ERROR';
    message: string;
    count: number;
    emailCount?: number;
  } | null>(null);

  // Bulk Email Notification State
  const [triggerEmailNotifications, setTriggerEmailNotifications] = useState(true);
  const [customEmailSubject, setCustomEmailSubject] = useState('');
  const [customEmailBody, setCustomEmailBody] = useState('');
  const [isEmailTemplateExpanded, setIsEmailTemplateExpanded] = useState(false);
  const [isPreviewEmailModalOpen, setIsPreviewEmailModalOpen] = useState(false);
  const [previewEmailIndex, setPreviewEmailIndex] = useState(0);
  const [isHistoryEmailModalOpen, setIsHistoryEmailModalOpen] = useState(false);
  const [emailLogsList, setEmailLogsList] = useState<EmailNotificationLog[]>([]);
  const [selectedHistoryEmailLog, setSelectedHistoryEmailLog] = useState<EmailNotificationLog | null>(null);

  // Batch Priority Modal State
  const [isPriorityModalOpen, setIsPriorityModalOpen] = useState(false);
  const [batchTargetPriority, setBatchTargetPriority] = useState<RequestPriority>('HIGH');
  const [prioritySubmitting, setPrioritySubmitting] = useState(false);

  // Manual Drag-and-Drop Prioritization State
  const [customOrderIds, setCustomOrderIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('ibacmi_queue_manual_order');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'above' | 'below' | null>(null);
  const [reorderNotification, setReorderNotification] = useState<{
    message: string;
    requestNumber: string;
    isTop: boolean;
  } | null>(null);

  // Helper to apply manual queue prioritization order
  const applyCustomOrder = (items: DocumentRequest[], orderIds: string[]) => {
    if (!orderIds || orderIds.length === 0) return items;
    const orderMap = new Map<string, number>();
    orderIds.forEach((id, idx) => orderMap.set(id, idx));

    return [...items].sort((a, b) => {
      const rankA = orderMap.has(a.id) ? orderMap.get(a.id)! : 999999;
      const rankB = orderMap.has(b.id) ? orderMap.get(b.id)! : 999999;
      if (rankA !== rankB) return rankA - rankB;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  };

  // Periodic Auto-refresh State
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('ibacmi_queue_auto_refresh');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });
  const [refreshIntervalSec, setRefreshIntervalSec] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('ibacmi_queue_refresh_interval');
      const parsed = saved ? parseInt(saved, 10) : 30;
      return [15, 30, 60, 120].includes(parsed) ? parsed : 30;
    } catch {
      return 30;
    }
  });
  const [countdown, setCountdown] = useState<number>(refreshIntervalSec);
  const [isBackgroundUpdating, setIsBackgroundUpdating] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());

  const loadData = async (silent = false) => {
    if (!silent) {
      // If initial load or explicit manual refresh
      if (requests.length === 0) {
        setLoading(true);
      }
    } else {
      setIsBackgroundUpdating(true);
    }

    try {
      const [allRequests, allDocTypes] = await Promise.all([
        requestService.getAllRequests(),
        documentService.getAllDocumentTypes(),
      ]);

      // Apply any persistent manual order
      const ordered = applyCustomOrder(allRequests, customOrderIds);
      setRequests(ordered);
      setDocTypes(allDocTypes);
      setLastRefreshedAt(new Date());
    } catch (err) {
      console.error('Error fetching queue data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setIsBackgroundUpdating(false);
    }
  };

  // Move a specific request directly to the top of the queue (#1 priority)
  const handleMoveToTop = (reqId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const targetReq = requests.find((r) => r.id === reqId);
    if (!targetReq) return;

    const newRequests = [targetReq, ...requests.filter((r) => r.id !== reqId)];
    const newOrderIds = newRequests.map((r) => r.id);
    setCustomOrderIds(newOrderIds);
    setRequests(newRequests);

    try {
      localStorage.setItem('ibacmi_queue_manual_order', JSON.stringify(newOrderIds));
    } catch {
      // ignore
    }

    setReorderNotification({
      message: 'Moved to top of queue (#1 priority)',
      requestNumber: targetReq.request_number,
      isTop: true,
    });

    setTimeout(() => {
      setReorderNotification(null);
    }, 3500);
  };

  // Reorder row from drag source to target placement
  const handleReorder = (sourceId: string, targetId: string, position: 'above' | 'below') => {
    if (sourceId === targetId) return;

    const sourceReq = requests.find((r) => r.id === sourceId);
    if (!sourceReq) return;

    const withoutSource = requests.filter((r) => r.id !== sourceId);
    const targetIndex = withoutSource.findIndex((r) => r.id === targetId);
    if (targetIndex === -1) return;

    const insertIndex = position === 'above' ? targetIndex : targetIndex + 1;
    const newRequests = [...withoutSource];
    newRequests.splice(insertIndex, 0, sourceReq);

    const newOrderIds = newRequests.map((r) => r.id);
    setCustomOrderIds(newOrderIds);
    setRequests(newRequests);

    try {
      localStorage.setItem('ibacmi_queue_manual_order', JSON.stringify(newOrderIds));
    } catch {
      // ignore
    }

    const isNowTop = insertIndex === 0;
    setReorderNotification({
      message: isNowTop
        ? 'Moved to top of queue (#1 priority)'
        : `Prioritized to queue position #${insertIndex + 1}`,
      requestNumber: sourceReq.request_number,
      isTop: isNowTop,
    });

    setTimeout(() => {
      setReorderNotification(null);
    }, 3500);
  };

  // Reset manual customization back to default chronological/priority sorting
  const handleResetQueueOrder = () => {
    setCustomOrderIds([]);
    try {
      localStorage.removeItem('ibacmi_queue_manual_order');
    } catch {
      // ignore
    }

    setRequests((prev) =>
      [...prev].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    );

    setReorderNotification({
      message: 'Queue reset to default chronological sorting',
      requestNumber: 'All Rows',
      isTop: false,
    });

    setTimeout(() => {
      setReorderNotification(null);
    }, 3000);
  };

  useEffect(() => {
    loadData(false);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setCountdown(refreshIntervalSec);
    loadData(false);
  };

  const handleToggleAutoRefresh = (enabled: boolean) => {
    setAutoRefreshEnabled(enabled);
    try {
      localStorage.setItem('ibacmi_queue_auto_refresh', String(enabled));
    } catch {
      // ignore
    }
    if (enabled) {
      setCountdown(refreshIntervalSec);
    }
  };

  const handleChangeInterval = (seconds: number) => {
    setRefreshIntervalSec(seconds);
    setCountdown(seconds);
    try {
      localStorage.setItem('ibacmi_queue_refresh_interval', String(seconds));
    } catch {
      // ignore
    }
  };

  // Periodic timer effect
  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Trigger background silent update
          loadData(true);
          return refreshIntervalSec;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefreshEnabled, refreshIntervalSec]);

  // Real-time filter application supporting student name, ID, reference number, doc type, program, purpose
  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return requests.filter((r) => {
      const studentName = r.student?.user?.full_name?.toLowerCase() || '';
      const studentId = r.student?.student_id?.toLowerCase() || '';
      const requestNumber = r.request_number?.toLowerCase() || '';
      const trackingId = r.id?.toLowerCase() || '';
      const email = r.student?.user?.email?.toLowerCase() || '';
      const program = r.student?.program?.toLowerCase() || '';
      const docName = r.document_type?.name?.toLowerCase() || '';
      const docCode = r.document_type?.code?.toLowerCase() || '';
      const purpose = r.purpose?.toLowerCase() || '';

      const matchesSearch =
        !term ||
        studentName.includes(term) ||
        studentId.includes(term) ||
        requestNumber.includes(term) ||
        trackingId.includes(term) ||
        email.includes(term) ||
        program.includes(term) ||
        docName.includes(term) ||
        docCode.includes(term) ||
        purpose.includes(term);

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'PENDING'
          ? isPendingStatus(r.status)
          : r.status === statusFilter);
      const matchesPriority = priorityFilter === 'ALL' || r.priority === priorityFilter;
      const matchesDocType = docTypeFilter === 'ALL' || r.document_type_id === docTypeFilter;
      const matchesPayment = paymentFilter === 'ALL' || r.payment_status === paymentFilter;
      const matchesOverdue = !overdueOnly || isPendingOverdue(r.status, r.created_at);

      return matchesSearch && matchesStatus && matchesPriority && matchesDocType && matchesPayment && matchesOverdue;
    });
  }, [requests, searchTerm, statusFilter, priorityFilter, docTypeFilter, paymentFilter, overdueOnly]);

  // Total pending requests that have exceeded the 3 business days SLA
  const overduePendingTotalCount = useMemo(() => {
    return requests.filter((r) => isPendingOverdue(r.status, r.created_at)).length;
  }, [requests]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    return filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [filtered, currentPage, pageSize]);

  // Selected requests resolution
  const selectedRequests = useMemo(() => {
    if (isSelectAllMatching) {
      return filtered;
    }
    const idSet = new Set(selectedIds);
    return requests.filter((r) => idSet.has(r.id));
  }, [selectedIds, isSelectAllMatching, filtered, requests]);

  // Calculate header checkbox state (checked vs indeterminate)
  const isPageFullySelected = useMemo(() => {
    if (paginatedData.length === 0) return false;
    return paginatedData.every((r) => selectedIds.includes(r.id));
  }, [paginatedData, selectedIds]);

  const isPagePartiallySelected = useMemo(() => {
    const count = paginatedData.filter((r) => selectedIds.includes(r.id)).length;
    return count > 0 && count < paginatedData.length;
  }, [paginatedData, selectedIds]);

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = isPagePartiallySelected;
    }
  }, [isPagePartiallySelected]);

  // Multi-Selection Handlers
  const handleToggleSelectOne = (id: string, index: number, event?: React.MouseEvent) => {
    if (event && event.shiftKey && lastSelectedIndexRef.current !== null) {
      // Shift+Click range selection on current page
      const start = Math.min(lastSelectedIndexRef.current, index);
      const end = Math.max(lastSelectedIndexRef.current, index);
      const rangeIds = paginatedData.slice(start, end + 1).map((r) => r.id);
      setSelectedIds((prev) => {
        const set = new Set(prev);
        rangeIds.forEach((rid) => set.add(rid));
        return Array.from(set);
      });
    } else {
      setSelectedIds((prev) => {
        if (prev.includes(id)) {
          return prev.filter((item) => item !== id);
        } else {
          return [...prev, id];
        }
      });
      setIsSelectAllMatching(false);
    }
    lastSelectedIndexRef.current = index;
  };

  const handleToggleSelectPage = () => {
    if (isPageFullySelected) {
      const pageIds = new Set(paginatedData.map((r) => r.id));
      setSelectedIds((prev) => prev.filter((id) => !pageIds.has(id)));
      setIsSelectAllMatching(false);
    } else {
      const pageIds = paginatedData.map((r) => r.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleSelectAllMatching = () => {
    setIsSelectAllMatching(true);
    setSelectedIds(filtered.map((r) => r.id));
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
    setIsSelectAllMatching(false);
    lastSelectedIndexRef.current = null;
  };

  // Open Batch Status Modal with preselected status
  const handleOpenBatchStatusModal = (status: RequestStatus) => {
    setBatchTargetStatus(status);
    setBatchRemark('');
    setIsBatchModalOpen(true);
  };

  // Execute Batch Status Update
  const handleExecuteBatchStatusUpdate = async () => {
    if (selectedRequests.length === 0) return;
    setBatchSubmitting(true);
    setBatchProgress({ current: 0, total: selectedRequests.length });

    const targetIds = selectedRequests.map((r) => r.id);
    let completed = 0;

    try {
      const result = await requestService.batchUpdateRequestStatus(targetIds, batchTargetStatus, {
        reason: batchRemark.trim() || `Batch status updated to ${batchTargetStatus} by Registrar Staff`,
        comment: batchRemark.trim() || undefined,
      });

      // Update local state directly for responsive feedback
      setRequests((prev) =>
        prev.map((r) => {
          if (targetIds.includes(r.id)) {
            return {
              ...r,
              status: batchTargetStatus,
              updated_at: new Date().toISOString(),
            };
          }
          return r;
        })
      );

      setBatchFeedback({
        type: 'SUCCESS',
        message: `Successfully updated ${result.successCount} request(s) to "${batchTargetStatus.replace(/_/g, ' ')}"`,
        count: result.successCount,
      });

      // Clear selection after 1.5s and close modal
      setTimeout(() => {
        handleClearSelection();
        setIsBatchModalOpen(false);
        setBatchFeedback(null);
      }, 1800);
    } catch (err: any) {
      console.error('Batch update failed:', err);
      setBatchFeedback({
        type: 'ERROR',
        message: err?.message || 'Batch update encountered an unexpected error',
        count: 0,
      });
    } finally {
      setBatchSubmitting(false);
      setBatchProgress(null);
    }
  };

  // Execute Batch Priority Update
  const handleExecuteBatchPriorityUpdate = async () => {
    if (selectedRequests.length === 0) return;
    setPrioritySubmitting(true);

    const targetIds = selectedRequests.map((r) => r.id);
    try {
      const result = await requestService.batchUpdatePriority(targetIds, batchTargetPriority);

      setRequests((prev) =>
        prev.map((r) => {
          if (targetIds.includes(r.id)) {
            return {
              ...r,
              priority: batchTargetPriority,
              updated_at: new Date().toISOString(),
            };
          }
          return r;
        })
      );

      setIsPriorityModalOpen(false);
      handleClearSelection();
    } catch (err) {
      console.error('Batch priority update failed:', err);
    } finally {
      setPrioritySubmitting(false);
    }
  };

  const handleExportCSV = (exportSelected = false) => {
    const listToExport = exportSelected ? selectedRequests : filtered;
    const csvContent = reportService.exportRequestsToCSV(listToExport);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `registrar_requests_${exportSelected ? 'batch_' : ''}${format(new Date(), 'yyyyMMdd_HHmm')}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger browser print dialog for printable report
  const handlePrint = () => {
    window.print();
  };

  // Data to render in print view (selected items if any, otherwise current filtered queue)
  const printableData = useMemo(() => {
    if (selectedIds.length > 0) {
      return requests.filter((r) => selectedIds.includes(r.id));
    }
    return filtered;
  }, [requests, selectedIds, filtered]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setPriorityFilter('ALL');
    setDocTypeFilter('ALL');
    setPaymentFilter('ALL');
    setOverdueOnly(false);
    setCurrentPage(1);
    handleClearSelection();
  };

  // Status helper descriptors for batch modal
  const statusOptions: Array<{
    status: RequestStatus;
    label: string;
    icon: any;
    color: string;
    description: string;
  }> = [
    {
      status: 'PROCESSING',
      label: 'Mark as Processing',
      icon: Package,
      color: 'text-sky-700 bg-sky-50 border-sky-200',
      description: 'Document printing, grading verification, and dry seal embossing in progress.',
    },
    {
      status: 'READY_FOR_RELEASE',
      label: 'Mark as Ready for Release',
      icon: CheckCircle2,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      description: 'Credentials prepared and waiting for student pickup or courier dispatch.',
    },
    {
      status: 'FOR_APPROVAL',
      label: 'Mark as For Approval',
      icon: FileCheck,
      color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
      description: 'Escalate document requests to College Registrar / Dean for official signature.',
    },
    {
      status: 'UNDER_REVIEW',
      label: 'Mark as Under Review',
      icon: Clock,
      color: 'text-amber-700 bg-amber-50 border-amber-200',
      description: 'Evaluating student academic records, clearances, and uploaded requirements.',
    },
    {
      status: 'RELEASED',
      label: 'Mark as Released / Claimed',
      icon: Send,
      color: 'text-teal-700 bg-teal-50 border-teal-200',
      description: 'Document handed over to student or dispatched via delivery tracking.',
    },
    {
      status: 'APPROVED',
      label: 'Mark as Approved',
      icon: Check,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      description: 'Registrar endorsement granted; approved for official printing.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* ------------------------------------------------------------- */}
      {/* 1. INTERACTIVE SCREEN VIEW (HIDDEN DURING PRINT) */}
      {/* ------------------------------------------------------------- */}
      <div className="print:hidden space-y-6">
        {/* Standard Page Header */}
        <PageHeader
          title="Request Processing Queue"
          subtitle="Search, evaluate, approve, batch-process, and manage official document releases."
          breadcrumbs={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Request Queue' },
          ]}
          actions={
            <div className="flex items-center gap-2 flex-wrap">
              {/* Periodic Auto-refresh Toggle Switch */}
              <AutoRefreshToggle
                id="queue-auto-refresh-toggle"
                enabled={autoRefreshEnabled}
                onToggle={handleToggleAutoRefresh}
                intervalSec={refreshIntervalSec}
                onChangeInterval={handleChangeInterval}
                countdown={countdown}
                isUpdating={isBackgroundUpdating}
                lastRefreshedAt={lastRefreshedAt}
                onManualRefresh={handleRefresh}
              />

              <Button
                variant="secondary"
                size="sm"
                icon={RefreshCw}
                loading={refreshing}
                onClick={handleRefresh}
                title="Manually refresh request queue now"
              >
                Refresh
              </Button>
              <Button
                id="print-queue-btn"
                variant="secondary"
                size="sm"
                icon={Printer}
                onClick={handlePrint}
                title="Print Queue (Ctrl+P / Cmd+P)"
              >
                Print Queue
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={Download}
                onClick={() => handleExportCSV(false)}
              >
                Export CSV
              </Button>
            </div>
          }
        />

        {/* Status Breakdown Summary Card */}
        <QueueStatusSummaryCard
          id="queue-status-summary-card"
          requests={requests}
          selectedStatus={statusFilter}
          onSelectStatus={(st) => {
            setStatusFilter(st);
            setCurrentPage(1);
          }}
          overdueCount={overduePendingTotalCount}
          overdueOnly={overdueOnly}
          onToggleOverdue={() => {
            setOverdueOnly((prev) => !prev);
            setCurrentPage(1);
          }}
          loading={loading}
        />

        {/* Enterprise Filter and Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          {/* Real-time Search Box */}
          <div className="relative lg:col-span-5">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              id="search-queue-input"
              placeholder="Search by student name, ID, or reference number..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs pl-9 pr-16 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors h-9"
              aria-label="Real-time request search"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchTerm ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    searchInputRef.current?.focus();
                  }}
                  title="Clear search (Esc)"
                  className="p-1 text-slate-400 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-400 bg-slate-100 border border-slate-200 rounded">
                  /
                </kbd>
              )}
            </div>
          </div>

          {/* Status Filter */}
          <div className="lg:col-span-3">
            <select
              id="filter-queue-status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 h-9 cursor-pointer transition-colors"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">All Pending / Action Needed</option>
              <option value="SUBMITTED">Submitted (New)</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="NEEDS_INFORMATION">Needs Information</option>
              <option value="FOR_APPROVAL">For Approval</option>
              <option value="APPROVED">Approved</option>
              <option value="PROCESSING">Processing</option>
              <option value="READY_FOR_RELEASE">Ready for Release</option>
              <option value="RELEASED">Released / Claimed</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="lg:col-span-2">
            <select
              id="filter-queue-priority"
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 h-9 cursor-pointer transition-colors"
            >
              <option value="ALL">All Priorities</option>
              <option value="NORMAL">Normal Priority</option>
              <option value="HIGH">High Priority</option>
              <option value="URGENT">Urgent Priority</option>
            </select>
          </div>

          {/* Document Type Filter */}
          <div className="lg:col-span-2">
            <select
              id="filter-queue-doctype"
              value={docTypeFilter}
              onChange={(e) => {
                setDocTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 h-9 cursor-pointer transition-colors"
            >
              <option value="ALL">All Document Types</option>
              {docTypes.map((dt) => (
                <option key={dt.id} value={dt.id}>
                  {dt.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Real-time Filter Feedback Summary & Quick Reset */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-2">
            <span>
              Found <strong className="text-slate-900 font-semibold">{filtered.length}</strong> matching request(s)
            </span>
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-medium">
                Matching: &ldquo;{searchTerm}&rdquo;
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="hover:text-blue-900 ml-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3 inline" />
                </button>
              </span>
            )}
            {/* Urgent SLA Alert Chip / Toggle */}
            {overduePendingTotalCount > 0 && (
              <button
                type="button"
                id="toggle-overdue-sla-btn"
                onClick={() => {
                  setOverdueOnly((prev) => !prev);
                  setCurrentPage(1);
                }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer border shadow-2xs ${
                  overdueOnly
                    ? 'bg-amber-500 text-slate-950 border-amber-600 ring-2 ring-amber-400 font-extrabold'
                    : 'bg-amber-100 text-amber-950 border-amber-300 hover:bg-amber-200'
                }`}
                title="Filter to requests that have been in pending status for longer than 3 business days"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-800 animate-pulse shrink-0" />
                <span>
                  {overdueOnly
                    ? `Showing ${overduePendingTotalCount} Overdue Pending Only`
                    : `${overduePendingTotalCount} Pending > 3 Business Days`}
                </span>
                {overdueOnly && <X className="w-3 h-3 ml-0.5" />}
              </button>
            )}
          </div>
          {(searchTerm || statusFilter !== 'ALL' || priorityFilter !== 'ALL' || docTypeFilter !== 'ALL' || paymentFilter !== 'ALL' || overdueOnly) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-blue-700 hover:text-blue-900 hover:underline font-semibold cursor-pointer"
            >
              Reset all filters
            </button>
          )}
        </div>
      </div>

      {/* Manual Queue Prioritization Notice & Reset Banner */}
      <AnimatePresence>
        {customOrderIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="bg-amber-50/90 border border-amber-200 rounded-xl p-3 px-4 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-950 shadow-2xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-200/80 text-amber-900 flex items-center justify-center font-bold text-xs shrink-0 border border-amber-300">
                <Sparkles className="w-4 h-4 text-amber-800" />
              </div>
              <div>
                <p className="font-bold text-amber-900 flex items-center gap-1.5">
                  <span>Manual Queue Prioritization Active</span>
                  <span className="text-[10px] bg-amber-200/80 text-amber-900 font-mono px-1.5 py-0.5 rounded font-bold">
                    Custom Order
                  </span>
                </p>
                <p className="text-[11px] text-amber-800">
                  Rows are manually prioritized. Drag rows by their handle or click &ldquo;To Top&rdquo; to elevate urgent requests.
                </p>
              </div>
            </div>
            <button
              type="button"
              id="reset-queue-order-btn"
              onClick={handleResetQueueOrder}
              className="shrink-0 font-bold text-amber-900 hover:text-amber-950 bg-white hover:bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-300 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer text-xs"
              title="Reset queue order back to default chronological submission order"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Default Order</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Select-All-Matching Banner (when page is fully selected and more match filter) */}
      <AnimatePresence>
        {isPageFullySelected && filtered.length > paginatedData.length && !isSelectAllMatching && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="bg-blue-50 border border-blue-200 rounded-xl p-3 px-4 flex items-center justify-between gap-3 text-xs text-blue-900"
          >
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                All <strong>{paginatedData.length}</strong> requests on this page are selected.
              </span>
            </div>
            <button
              type="button"
              onClick={handleSelectAllMatching}
              className="font-bold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer bg-white px-3 py-1 rounded-md border border-blue-300 shadow-2xs transition-colors"
            >
              Select all {filtered.length} requests matching filter
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Main Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-5">
            <TableSkeleton rows={8} columns={8} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-4 sm:p-6">
            <QueueEmptyState
              searchTerm={searchTerm}
              statusFilter={statusFilter}
              priorityFilter={priorityFilter}
              docTypeFilter={docTypeFilter}
              paymentFilter={paymentFilter}
              overdueFilter={overdueOnly}
              onClearSearch={() => {
                setSearchTerm('');
                searchInputRef.current?.focus();
              }}
              onResetAllFilters={handleResetFilters}
              onRefresh={handleRefresh}
              onClearStatusFilter={() => setStatusFilter('ALL')}
              onClearPriorityFilter={() => setPriorityFilter('ALL')}
              onClearDocTypeFilter={() => setDocTypeFilter('ALL')}
              onClearPaymentFilter={() => setPaymentFilter('ALL')}
              onClearOverdueFilter={() => setOverdueOnly(false)}
            />
          </div>
        ) : (
          <>
            {/* Desktop Table View with Drag-and-Drop Prioritization */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    {/* Drag Handle & Queue Rank */}
                    <th className="py-3 px-3 w-16 text-center" title="Drag to reorder queue or see rank position">
                      <span>Rank</span>
                    </th>
                    {/* Multi-Select Header Checkbox */}
                    <th className="py-3 px-3 w-10 text-center">
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          ref={headerCheckboxRef}
                          checked={isPageFullySelected}
                          onChange={handleToggleSelectPage}
                          aria-label="Select all requests on this page"
                          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-offset-1 cursor-pointer accent-blue-600"
                        />
                      </div>
                    </th>
                    <th className="py-3 px-4">Request ID</th>
                    <th className="py-3 px-4">Student Requester</th>
                    <th className="py-3 px-4">Document</th>
                    <th className="py-3 px-4 text-center">Priority</th>
                    <th className="py-3 px-4 text-center">Workflow Status</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Submitted</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80 text-xs">
                  {paginatedData.map((req, idx) => {
                    const isSelected = selectedIds.includes(req.id);
                    const isOverdue = isPendingOverdue(req.status, req.created_at);
                    const pendingDays = getPendingBusinessDays(req.created_at);
                    const queueRank = (currentPage - 1) * pageSize + idx + 1;
                    const isBeingDragged = draggedId === req.id;
                    const isDropTargetAbove = dragOverId === req.id && dropPosition === 'above';
                    const isDropTargetBelow = dragOverId === req.id && dropPosition === 'below';

                    return (
                      <tr
                        key={req.id}
                        draggable
                        onDragStart={(e) => {
                          setDraggedId(req.id);
                          e.dataTransfer.setData('text/plain', req.id);
                          e.dataTransfer.effectAllowed = 'move';
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = 'move';
                          const rect = e.currentTarget.getBoundingClientRect();
                          const offset = e.clientY - rect.top;
                          const pos = offset < rect.height / 2 ? 'above' : 'below';
                          if (dragOverId !== req.id || dropPosition !== pos) {
                            setDragOverId(req.id);
                            setDropPosition(pos);
                          }
                        }}
                        onDragLeave={(e) => {
                          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                            if (dragOverId === req.id) {
                              setDragOverId(null);
                              setDropPosition(null);
                            }
                          }
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (draggedId && draggedId !== req.id) {
                            handleReorder(draggedId, req.id, dropPosition || 'above');
                          }
                          setDraggedId(null);
                          setDragOverId(null);
                          setDropPosition(null);
                        }}
                        onDragEnd={() => {
                          setDraggedId(null);
                          setDragOverId(null);
                          setDropPosition(null);
                        }}
                        onClick={() => navigate(`/staff/request/${req.id}`)}
                        className={`transition-all duration-150 cursor-pointer group relative ${
                          isBeingDragged
                            ? 'opacity-30 bg-blue-100/50 border-2 border-dashed border-blue-400'
                            : isDropTargetAbove
                            ? 'border-t-4 border-t-blue-600 bg-blue-50/50 shadow-inner'
                            : isDropTargetBelow
                            ? 'border-b-4 border-b-blue-600 bg-blue-50/50 shadow-inner'
                            : isSelected
                            ? isOverdue
                              ? 'bg-amber-100/80 hover:bg-amber-100 border-l-4 border-l-amber-600'
                              : 'bg-blue-50/70 hover:bg-blue-50/90'
                            : isOverdue
                            ? 'bg-amber-50/60 hover:bg-amber-100/60 border-l-4 border-l-amber-500 shadow-2xs'
                            : 'hover:bg-slate-50/80'
                        }`}
                      >
                        {/* Drag Handle & Queue Rank */}
                        <td
                          className="py-3.5 px-3 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-center gap-1">
                            <div
                              title="Drag to reorder queue position"
                              className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-blue-600 p-1 rounded hover:bg-slate-100 transition-colors shrink-0"
                            >
                              <GripVertical className="w-3.5 h-3.5" />
                            </div>
                            <span
                              className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                queueRank === 1
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300 font-extrabold shadow-2xs'
                                  : queueRank <= 3
                                  ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                  : 'text-slate-500 bg-slate-100'
                              }`}
                              title={`Queue priority position #${queueRank}`}
                            >
                              #{queueRank}
                            </span>
                          </div>
                        </td>

                        {/* Row Checkbox */}
                        <td
                          className="py-3.5 px-3 text-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSelectOne(req.id, idx, e);
                          }}
                        >
                          <div className="flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}} // Handled by td onClick for shift-click support
                              aria-label={`Select request ${req.request_number}`}
                              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-600 focus:ring-offset-1 cursor-pointer accent-blue-600"
                            />
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            {isOverdue && (
                              <span
                                title={`Action Required: In pending status for ${pendingDays} business days (> 3 business days SLA)`}
                                className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-200 text-amber-900 shrink-0 shadow-2xs"
                              >
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-700 animate-pulse" />
                              </span>
                            )}
                            <span className={`font-mono font-bold ${isOverdue ? 'text-amber-900' : 'text-blue-700'}`}>
                              {highlightMatch(req.request_number, searchTerm)}
                            </span>
                          </div>
                          {isOverdue && (
                            <div className="mt-1">
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                                <Clock className="w-2.5 h-2.5 text-amber-700" />
                                {pendingDays}d pending SLA
                              </span>
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <p className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                              {highlightMatch(req.student?.user?.full_name || 'Student Requester', searchTerm)}
                            </p>
                            <p className="text-[11px] text-slate-500 font-mono">
                              {highlightMatch(req.student?.student_id || 'N/A', searchTerm)} • {req.student?.program || 'Academic Program'}
                            </p>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <p className="font-medium text-slate-800">
                              {highlightMatch(req.document_type?.name, searchTerm)}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {req.quantity} {req.quantity === 1 ? 'copy' : 'copies'} • {req.release_method?.replace(/_/g, ' ')}
                            </p>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <PriorityBadge priority={req.priority} />
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <StatusBadge status={req.status} size="sm" />
                            {isOverdue && (
                              <span
                                title={`In pending status for ${pendingDays} business days`}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9.5px] font-extrabold tracking-wide uppercase bg-amber-500 text-slate-950 shadow-2xs"
                              >
                                <AlertTriangle className="w-2.5 h-2.5 text-slate-950" />
                                &gt;3d Overdue
                              </span>
                            )}
                            {req.overall_verification_status && req.overall_verification_status !== 'NOT_APPLICABLE' && (
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                  req.overall_verification_status === 'VERIFIED'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : req.overall_verification_status === 'ACTION_REQUIRED'
                                    ? 'bg-amber-100 text-amber-800'
                                    : req.overall_verification_status === 'REJECTED'
                                    ? 'bg-rose-100 text-rose-800'
                                    : req.overall_verification_status === 'UNDER_REVIEW'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {req.overall_verification_status === 'VERIFIED'
                                  ? '✓ Docs Clear'
                                  : req.overall_verification_status === 'ACTION_REQUIRED'
                                  ? '⚠️ Resubmit Req'
                                  : req.overall_verification_status === 'REJECTED'
                                  ? '✕ Docs Rejected'
                                  : req.overall_verification_status === 'UNDER_REVIEW'
                                  ? '🔍 Reviewing'
                                  : '⏳ Upload Pending'}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <PaymentBadge status={req.payment_status} fee={req.fee} />
                        </td>

                        <td className="py-3.5 px-4">
                          {isOverdue ? (
                            <div className="space-y-0.5">
                              <p className="text-slate-900 font-bold font-mono text-[11px]">
                                {req.created_at ? format(new Date(req.created_at), 'MMM dd, yyyy') : '-'}
                              </p>
                              <p className="text-[10px] font-bold text-amber-800 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                                <span>{pendingDays} bus. days ago</span>
                              </p>
                            </div>
                          ) : (
                            <span className="text-slate-500 font-mono text-[11px]">
                              {req.created_at
                                ? format(new Date(req.created_at), 'MMM dd, yyyy')
                                : '-'}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Quick Prioritize: Move To Top Action */}
                            {queueRank > 1 && (
                              <button
                                type="button"
                                id={`move-to-top-${req.id}`}
                                onClick={(e) => handleMoveToTop(req.id, e)}
                                title="Prioritize: Move immediately to top of queue (#1 priority)"
                                className="inline-flex items-center gap-1 p-1.5 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors border border-transparent hover:border-amber-200 opacity-80 group-hover:opacity-100"
                              >
                                <ArrowUpToLine className="w-3.5 h-3.5" />
                                <span className="sr-only">Move to Top</span>
                              </button>
                            )}

                            <Button
                              size="sm"
                              variant="secondary"
                              className="group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:border-blue-200"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/staff/request/${req.id}`);
                              }}
                            >
                              Review →
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View with Drag & Drop / Move to Top */}
            <div className="md:hidden divide-y divide-slate-200">
              {paginatedData.map((req, idx) => {
                const isSelected = selectedIds.includes(req.id);
                const isOverdue = isPendingOverdue(req.status, req.created_at);
                const pendingDays = getPendingBusinessDays(req.created_at);
                const queueRank = (currentPage - 1) * pageSize + idx + 1;
                const isBeingDragged = draggedId === req.id;
                const isDropTargetAbove = dragOverId === req.id && dropPosition === 'above';
                const isDropTargetBelow = dragOverId === req.id && dropPosition === 'below';

                return (
                  <div
                    key={req.id}
                    draggable
                    onDragStart={(e) => {
                      setDraggedId(req.id);
                      e.dataTransfer.setData('text/plain', req.id);
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                      const rect = e.currentTarget.getBoundingClientRect();
                      const offset = e.clientY - rect.top;
                      const pos = offset < rect.height / 2 ? 'above' : 'below';
                      if (dragOverId !== req.id || dropPosition !== pos) {
                        setDragOverId(req.id);
                        setDropPosition(pos);
                      }
                    }}
                    onDragLeave={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                        if (dragOverId === req.id) {
                          setDragOverId(null);
                          setDropPosition(null);
                        }
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedId && draggedId !== req.id) {
                        handleReorder(draggedId, req.id, dropPosition || 'above');
                      }
                      setDraggedId(null);
                      setDragOverId(null);
                      setDropPosition(null);
                    }}
                    onDragEnd={() => {
                      setDraggedId(null);
                      setDragOverId(null);
                      setDropPosition(null);
                    }}
                    onClick={() => navigate(`/staff/request/${req.id}`)}
                    className={`p-4 space-y-3 transition-all duration-150 cursor-pointer ${
                      isBeingDragged
                        ? 'opacity-30 bg-blue-100/50 border-2 border-dashed border-blue-400'
                        : isDropTargetAbove
                        ? 'border-t-4 border-t-blue-600 bg-blue-50/50'
                        : isDropTargetBelow
                        ? 'border-b-4 border-b-blue-600 bg-blue-50/50'
                        : isOverdue
                        ? isSelected
                          ? 'bg-amber-100/90 border-l-4 border-l-amber-600 ring-1 ring-amber-400'
                          : 'bg-amber-50/60 hover:bg-amber-100/60 border-l-4 border-l-amber-500 ring-1 ring-amber-300/70'
                        : isSelected
                        ? 'bg-blue-50/70'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Overdue Warning Alert Header */}
                    {isOverdue && (
                      <div className="flex items-center justify-between gap-2 px-2.5 py-1.5 bg-amber-100/95 text-amber-950 border border-amber-300 rounded-lg text-xs font-bold shadow-2xs">
                        <div className="flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 animate-pulse" />
                          <span>Pending for {pendingDays} business days</span>
                        </div>
                        <span className="text-[10px] font-extrabold uppercase bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded shadow-2xs">
                          Urgent SLA
                        </span>
                      </div>
                    )}

                    {/* Top Row: Rank, Drag Handle, Checkbox, ID, and Move To Top Button */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          title="Drag to reorder"
                          className="cursor-grab active:cursor-grabbing text-slate-400 p-0.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                          queueRank === 1 ? 'bg-amber-200 text-amber-950 border border-amber-300' : 'bg-slate-100 text-slate-600'
                        }`}>
                          #{queueRank}
                        </span>
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSelectOne(req.id, idx, e);
                          }}
                          className="p-1 -m-1"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            aria-label={`Select request ${req.request_number}`}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-600 cursor-pointer accent-blue-600"
                          />
                        </div>
                        <span className={`font-mono font-bold text-xs ${isOverdue ? 'text-amber-900' : 'text-blue-700'}`}>
                          {highlightMatch(req.request_number, searchTerm)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {queueRank > 1 && (
                          <button
                            type="button"
                            onClick={(e) => handleMoveToTop(req.id, e)}
                            title="Move to top of queue"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded border border-amber-200 shadow-2xs"
                          >
                            <ArrowUpToLine className="w-3 h-3 text-amber-700" />
                            <span>To Top</span>
                          </button>
                        )}
                        <PriorityBadge priority={req.priority} size="sm" />
                        <StatusBadge status={req.status} size="sm" />
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {highlightMatch(req.student?.user?.full_name || 'Student Requester', searchTerm)}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {highlightMatch(req.student?.student_id || 'N/A', searchTerm)} • {req.student?.program || 'Academic Program'}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-800">
                        {highlightMatch(req.document_type?.name, searchTerm)}
                      </span>
                      <span className="text-slate-500 font-mono">
                        {req.quantity}x copy
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                      <PaymentBadge status={req.payment_status} fee={req.fee} />
                      <span className="font-bold text-blue-700">
                        Review & Process →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Page <strong className="text-slate-900">{currentPage}</strong> of{' '}
                  <strong className="text-slate-900">{totalPages}</strong>
                </span>

                <div className="flex items-center space-x-1.5">
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    icon={ChevronLeft}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    icon={ChevronRight}
                    iconPosition="right"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 4. Floating Enterprise Batch Action Bar */}
      <AnimatePresence>
        {selectedRequests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-6 inset-x-4 sm:inset-x-auto sm:right-8 sm:left-auto z-40 max-w-4xl"
          >
            <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-slate-800 p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 ring-1 ring-white/10">
              {/* Selected Count & Selection Actions */}
              <div className="flex items-center justify-between sm:justify-start gap-3 pl-1">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-bold text-sm text-white">
                      {selectedRequests.length}
                    </span>
                    <span className="text-xs text-slate-300">
                      request{selectedRequests.length > 1 ? 's' : ''} selected
                    </span>
                  </div>
                </div>

                <div className="h-4 w-px bg-slate-700 hidden sm:block" />

                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="text-xs text-slate-400 hover:text-white transition-colors underline cursor-pointer"
                >
                  Deselect all
                </button>
              </div>

              {/* Batch Actions Group */}
              <div className="flex items-center gap-2 flex-wrap justify-end">
                {/* 1. Quick Batch: Mark as Processing */}
                <Button
                  id="batch-action-processing-btn"
                  size="sm"
                  variant="secondary"
                  icon={Package}
                  onClick={() => handleOpenBatchStatusModal('PROCESSING')}
                  className="bg-sky-600/20 text-sky-200 border-sky-500/40 hover:bg-sky-600/30 hover:text-white"
                >
                  Mark Processing
                </Button>

                {/* 2. Quick Batch: Mark as Ready */}
                <Button
                  id="batch-action-ready-btn"
                  size="sm"
                  variant="secondary"
                  icon={CheckCircle2}
                  onClick={() => handleOpenBatchStatusModal('READY_FOR_RELEASE')}
                  className="bg-emerald-600/20 text-emerald-200 border-emerald-500/40 hover:bg-emerald-600/30 hover:text-white"
                >
                  Mark Ready
                </Button>

                {/* 3. More Workflow Statuses */}
                <Button
                  id="batch-action-more-status-btn"
                  size="sm"
                  variant="secondary"
                  icon={Layers}
                  onClick={() => handleOpenBatchStatusModal(batchTargetStatus)}
                  className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white"
                >
                  Update Status...
                </Button>

                {/* 4. Priority Modifier */}
                <Button
                  id="batch-action-priority-btn"
                  size="sm"
                  variant="secondary"
                  icon={AlertTriangle}
                  onClick={() => setIsPriorityModalOpen(true)}
                  className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white"
                >
                  Set Priority...
                </Button>

                {/* 5. Print Selected */}
                <Button
                  id="batch-action-print-btn"
                  size="sm"
                  variant="secondary"
                  icon={Printer}
                  onClick={handlePrint}
                  className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white"
                  title="Print selected requests"
                >
                  Print ({selectedRequests.length})
                </Button>

                {/* 6. Export Selected CSV */}
                <Button
                  id="batch-action-export-btn"
                  size="sm"
                  variant="secondary"
                  icon={Download}
                  onClick={() => handleExportCSV(true)}
                  className="bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white"
                  title="Export selected requests to CSV"
                >
                  CSV
                </Button>

                {/* Close / Dismiss Bar */}
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                  aria-label="Dismiss batch action bar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Batch Status Update Modal */}
      <Modal
        isOpen={isBatchModalOpen}
        onClose={() => !batchSubmitting && setIsBatchModalOpen(false)}
        title="Batch Status Update"
        subtitle={`Apply workflow state change simultaneously across ${selectedRequests.length} selected request(s).`}
        maxWidth="lg"
      >
        <div className="space-y-5 text-left">
          {/* Target Status Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Select Target Workflow Status
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {statusOptions.map((opt) => {
                const IconComponent = opt.icon;
                const isSelected = batchTargetStatus === opt.status;
                return (
                  <div
                    key={opt.status}
                    onClick={() => !batchSubmitting && setBatchTargetStatus(opt.status)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? `${opt.color} ring-2 ring-blue-600 shadow-xs`
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100/80 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <IconComponent className="w-4 h-4 shrink-0" />
                      <span>{opt.label}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {opt.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Requests Preview Summary */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-600 font-semibold mb-1.5">
              <span>Selected Requests ({selectedRequests.length})</span>
              <span className="text-[11px] text-slate-400 font-mono">
                Registrar Intake Queue
              </span>
            </div>
            <div className="max-h-36 overflow-y-auto p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              {selectedRequests.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-slate-200/80 shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-blue-700">
                      {r.request_number}
                    </span>
                    <span className="text-slate-700 font-medium">
                      {r.student?.user?.full_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 truncate max-w-[140px]">
                      {r.document_type?.name}
                    </span>
                    <StatusBadge status={r.status} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Optional Batch Remark / Audit Reason */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Audit Note / Batch Remarks (Optional)
            </label>
            <textarea
              rows={2}
              value={batchRemark}
              onChange={(e) => setBatchRemark(e.target.value)}
              placeholder="e.g., Batch printed and embossed with official dry seal by Registrar Office."
              disabled={batchSubmitting}
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white resize-none"
            />
          </div>

          {/* Feedback & Progress */}
          {batchProgress && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Updating records...</span>
                <span>
                  {batchProgress.current} / {batchProgress.total}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-300"
                  style={{
                    width: `${Math.round((batchProgress.current / batchProgress.total) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {batchFeedback && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 font-medium ${
                batchFeedback.type === 'SUCCESS'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {batchFeedback.type === 'SUCCESS' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              )}
              <span>{batchFeedback.message}</span>
            </div>
          )}

          {/* Modal Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
            <Button
              variant="outline"
              size="sm"
              disabled={batchSubmitting}
              onClick={() => setIsBatchModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              id="confirm-batch-update-btn"
              variant="primary"
              size="sm"
              loading={batchSubmitting}
              onClick={handleExecuteBatchStatusUpdate}
            >
              Update {selectedRequests.length} Request(s)
            </Button>
          </div>
        </div>
      </Modal>

      {/* 6. Batch Priority Modifier Modal */}
      <Modal
        isOpen={isPriorityModalOpen}
        onClose={() => !prioritySubmitting && setIsPriorityModalOpen(false)}
        title="Batch Update Priority"
        subtitle={`Modify priority level simultaneously for ${selectedRequests.length} request(s).`}
        maxWidth="md"
      >
        <div className="space-y-4 text-left">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
            Select New Priority Level
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['NORMAL', 'HIGH', 'URGENT'] as RequestPriority[]).map((p) => {
              const isSelected = batchTargetPriority === p;
              return (
                <button
                  type="button"
                  key={p}
                  onClick={() => setBatchTargetPriority(p)}
                  className={`p-3 rounded-xl border text-center font-bold text-xs transition-all ${
                    isSelected
                      ? 'bg-blue-50 border-blue-500 text-blue-800 ring-2 ring-blue-500'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <PriorityBadge priority={p} />
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
            <Button
              variant="outline"
              size="sm"
              disabled={prioritySubmitting}
              onClick={() => setIsPriorityModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              loading={prioritySubmitting}
              onClick={handleExecuteBatchPriorityUpdate}
            >
              Apply Priority ({selectedRequests.length})
            </Button>
          </div>
        </div>
      </Modal>
      </div> {/* End print:hidden interactive wrapper */}

      {/* ------------------------------------------------------------- */}
      {/* 2. OFFICIAL INSTITUTIONAL PRINTABLE QUEUE REPORT */}
      {/* ------------------------------------------------------------- */}
      <div className="hidden print:block font-sans text-slate-900 print-clean-container">
        {/* Official Institutional Header */}
        <div className="text-center pb-3 mb-3 border-b-2 border-slate-900">
          <div className="flex items-center justify-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-full border-2 border-slate-900 flex items-center justify-center font-serif font-black text-xs text-slate-900">
              IBACMI
            </div>
            <div>
              <h1 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                International Baptist Academy & College of Ministries, Inc.
              </h1>
              <p className="text-[9px] text-slate-700 uppercase tracking-widest font-semibold">
                Office of the College Registrar • Academic Records & Document Services
              </p>
            </div>
          </div>
          <h2 className="text-sm font-black uppercase tracking-tight text-slate-900 mt-1">
            {selectedIds.length > 0
              ? `Official Request Processing Queue (Selected ${printableData.length} Records)`
              : 'Official Document Processing Queue Report'}
          </h2>
        </div>

        {/* Print Metadata Summary */}
        <div className="grid grid-cols-2 text-[8pt] border border-slate-300 rounded p-2 mb-3 bg-slate-50/50">
          <div>
            <p><strong>Generated Date/Time:</strong> {format(new Date(), 'MMMM dd, yyyy - hh:mm a')}</p>
            <p><strong>Search Query:</strong> {searchTerm ? `"${searchTerm}"` : 'All Requesters (No Search Term)'}</p>
          </div>
          <div className="text-right">
            <p><strong>Total Included Records:</strong> {printableData.length} request(s)</p>
            <p><strong>Active Filters:</strong> Status: {statusFilter} | Priority: {priorityFilter} | DocType: {docTypeFilter} | Payment: {paymentFilter}</p>
          </div>
        </div>

        {/* Printable Table */}
        {printableData.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 italic border border-slate-200 rounded">
            No document requests match the active criteria.
          </div>
        ) : (
          <table className="print-table">
            <thead>
              <tr>
                <th style={{ width: '4%', textAlign: 'center' }}>#</th>
                <th style={{ width: '15%' }}>Request ID</th>
                <th style={{ width: '22%' }}>Student Requester</th>
                <th style={{ width: '22%' }}>Document Requested</th>
                <th style={{ width: '9%', textAlign: 'center' }}>Priority</th>
                <th style={{ width: '14%', textAlign: 'center' }}>Workflow Status</th>
                <th style={{ width: '14%' }}>Date Submitted</th>
              </tr>
            </thead>
            <tbody>
              {printableData.map((req, i) => (
                <tr key={req.id}>
                  <td style={{ textAlign: 'center' }} className="font-mono text-slate-600">{i + 1}</td>
                  <td className="font-mono font-bold text-slate-900">{req.request_number}</td>
                  <td>
                    <div className="font-bold text-slate-900">
                      {req.student?.user?.full_name || 'Student Requester'}
                    </div>
                    <div className="text-[7.5pt] text-slate-600 font-mono">
                      ID: {req.student?.student_id || 'N/A'} • {req.student?.program || 'Academic Program'}
                    </div>
                  </td>
                  <td>
                    <div className="font-semibold text-slate-900">{req.document_type?.name}</div>
                    <div className="text-[7.5pt] text-slate-600">
                      {req.quantity} {req.quantity === 1 ? 'copy' : 'copies'} ({req.release_method?.replace(/_/g, ' ')})
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }} className="font-semibold">
                    {req.priority}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="print-badge">
                      {req.status.replace(/_/g, ' ')}
                    </span>
                    {isPendingOverdue(req.status, req.created_at) && (
                      <div className="text-[7pt] font-bold text-amber-900 mt-0.5">
                        ⚠️ Overdue SLA ({getPendingBusinessDays(req.created_at)}d)
                      </div>
                    )}
                  </td>
                  <td className="font-mono text-slate-700 text-[8pt]">
                    {req.created_at ? format(new Date(req.created_at), 'MMM dd, yyyy') : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Official Print Sign-off Block */}
        <div className="print-signature-block pt-6 grid grid-cols-2 gap-8 text-[8.5pt]">
          <div className="border-t border-slate-800 pt-1 text-center">
            <p className="font-bold text-slate-900">Prepared & Generated By</p>
            <p className="text-[7.5pt] text-slate-600">Staff Processing Officer / Records In-Charge</p>
          </div>
          <div className="border-t border-slate-800 pt-1 text-center">
            <p className="font-bold text-slate-900">Certified & Approved By</p>
            <p className="text-[7.5pt] text-slate-600">Office of the College Registrar</p>
          </div>
        </div>
      </div>

      {/* Floating Reorder Toast Feedback */}
      <AnimatePresence>
        {reorderNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-3 text-xs max-w-md"
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                reorderNotification.isTop
                  ? 'bg-amber-400 text-slate-950 font-bold'
                  : 'bg-blue-600 text-white'
              }`}
            >
              {reorderNotification.isTop ? (
                <ArrowUpToLine className="w-4 h-4" />
              ) : (
                <GripVertical className="w-4 h-4" />
              )}
            </div>
            <div className="space-y-0.5">
              <p className="font-bold text-white font-mono">{reorderNotification.requestNumber}</p>
              <p className="text-slate-300">{reorderNotification.message}</p>
            </div>
            <button
              type="button"
              onClick={() => setReorderNotification(null)}
              className="ml-2 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

