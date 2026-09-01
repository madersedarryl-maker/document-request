import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { requestService } from '../../services/requestService';
import { DocumentRequest, RequestPriority, RequestStatus } from '../../types';
import { StatusBadge, PriorityBadge } from '../../components/StatusBadge';
import { KpiCard } from '../../components/KpiCard';
import { Button } from '../../components/Button';
import { DashboardStatsSkeleton, TableSkeleton } from '../../components/Skeletons';
import { EmptyState } from '../../components/EmptyState';
import { RequestTrendsDashboard } from '../../components/RequestTrendsDashboard';
import { RecentActivityPanel } from '../../components/RecentActivityPanel';
import { motion, AnimatePresence } from 'motion/react';
import {
  Inbox,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Package,
  FileCheck,
  ArrowRight,
  RefreshCw,
  Search,
  ListFilter,
  FileText,
  User,
  SlidersHorizontal,
  X,
  Radio,
  Zap,
  Sparkles,
  ExternalLink,
  Activity,
} from 'lucide-react';
import { format } from 'date-fns';

export const StaffDashboard: React.FC = () => {
  const { profile, staffProfile, role } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Realtime highlight animation tracking
  const [highlightedKpis, setHighlightedKpis] = useState<{
    submitted?: boolean;
    underReview?: boolean;
    forApproval?: boolean;
    processing?: boolean;
    ready?: boolean;
    urgent?: boolean;
  }>({});
  const [realtimeToast, setRealtimeToast] = useState<{
    request: DocumentRequest;
    timestamp: Date;
  } | null>(null);
  const [simulatingIntake, setSimulatingIntake] = useState(false);

  const highlightTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Quick filters for the priority queue
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');

  // Recent Activity Side Panel State
  const [showRecentActivity, setShowRecentActivity] = useState(false);

  const fetchStaffData = async () => {
    try {
      const data = await requestService.getAllRequests();
      setRequests(data);
    } catch (err) {
      console.error('Error fetching staff requests:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStaffData();

    // Subscribe to Supabase Realtime requests (and fallback store events)
    const unsubscribe = requestService.subscribeToRequests({
      onInsert: (newReq) => {
        // Insert into list
        setRequests((prev) => {
          const exists = prev.some((r) => r.id === newReq.id);
          if (exists) {
            return prev.map((r) => (r.id === newReq.id ? newReq : r));
          }
          return [newReq, ...prev];
        });

        // Trigger subtle highlight animation on affected metrics
        const newHighlights: typeof highlightedKpis = {
          submitted: true,
        };
        if (newReq.priority === 'URGENT') {
          newHighlights.urgent = true;
        }
        if (newReq.status === 'UNDER_REVIEW') {
          newHighlights.underReview = true;
        }

        setHighlightedKpis(newHighlights);
        setRealtimeToast({ request: newReq, timestamp: new Date() });

        // Auto-fade highlight after 4.5 seconds
        if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
        highlightTimeoutRef.current = setTimeout(() => {
          setHighlightedKpis({});
        }, 4500);

        // Auto-dismiss toast banner after 7 seconds
        if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
        toastTimeoutRef.current = setTimeout(() => {
          setRealtimeToast(null);
        }, 7000);
      },
      onUpdate: (updatedReq) => {
        setRequests((prev) =>
          prev.map((r) => (r.id === updatedReq.id ? updatedReq : r))
        );

        // Highlight the updated status metric card
        const newHighlights: typeof highlightedKpis = {};
        if (updatedReq.status === 'SUBMITTED') newHighlights.submitted = true;
        if (updatedReq.status === 'UNDER_REVIEW') newHighlights.underReview = true;
        if (updatedReq.status === 'FOR_APPROVAL') newHighlights.forApproval = true;
        if (updatedReq.status === 'PROCESSING' || updatedReq.status === 'APPROVED')
          newHighlights.processing = true;
        if (updatedReq.status === 'READY_FOR_RELEASE') newHighlights.ready = true;
        if (updatedReq.priority === 'URGENT') newHighlights.urgent = true;

        if (Object.keys(newHighlights).length > 0) {
          setHighlightedKpis(newHighlights);
          if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
          highlightTimeoutRef.current = setTimeout(() => {
            setHighlightedKpis({});
          }, 4000);
        }
      },
    });

    return () => {
      unsubscribe();
      if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStaffData();
  };

  /**
   * Helper function to simulate a new live incoming request
   * for testing realtime animations seamlessly
   */
  const handleSimulateRealtimeIntake = async () => {
    setSimulatingIntake(true);
    try {
      const docTypes = [
        { id: 'doc-type-001', name: 'Certificate of Enrollment (COE)', fee: 50 },
        { id: 'doc-type-002', name: 'Official Transcript of Records (TOR)', fee: 150 },
        { id: 'doc-type-003', name: 'Certificate of Good Moral Character', fee: 75 },
      ];
      const selectedDoc = docTypes[Math.floor(Math.random() * docTypes.length)];
      const isUrgent = Math.random() > 0.5;

      const randomStudNum = `2024-${Math.floor(10000 + Math.random() * 90000)}`;

      await requestService.submitRequest({
        documentTypeId: selectedDoc.id,
        studentId: 'stud-prof-001',
        quantity: 1,
        purpose: 'Realtime live intake verification & testing',
        releaseMethod: 'PICKUP',
        fee: selectedDoc.fee,
        remarks: isUrgent ? 'URGENT: Expedited verification required' : 'Standard intake',
      });
    } catch (err) {
      console.error('Error simulating realtime intake:', err);
    } finally {
      setSimulatingIntake(false);
    }
  };

  // Operational KPIs
  const total = requests.length;
  const submitted = requests.filter((r) => r.status === 'SUBMITTED').length;
  const underReview = requests.filter((r) => r.status === 'UNDER_REVIEW').length;
  const forApproval = requests.filter((r) => r.status === 'FOR_APPROVAL').length;
  const processing = requests.filter(
    (r) => r.status === 'PROCESSING' || r.status === 'APPROVED'
  ).length;
  const readyForRelease = requests.filter((r) => r.status === 'READY_FOR_RELEASE').length;
  const urgent = requests.filter(
    (r) =>
      r.priority === 'URGENT' &&
      r.status !== 'RELEASED' &&
      r.status !== 'REJECTED' &&
      r.status !== 'CANCELLED'
  ).length;

  // Filtered Priority Queue (focus on urgent, high, submitted, or filtered items)
  const priorityQueue = useMemo(() => {
    let list = requests.filter(
      (r) =>
        r.status !== 'RELEASED' &&
        r.status !== 'REJECTED' &&
        r.status !== 'CANCELLED'
    );

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.request_number.toLowerCase().includes(q) ||
          r.student?.user?.full_name?.toLowerCase().includes(q) ||
          r.student?.student_id?.toLowerCase().includes(q) ||
          r.document_type?.name?.toLowerCase().includes(q)
      );
    }

    if (selectedStatus !== 'ALL') {
      list = list.filter((r) => r.status === selectedStatus);
    }

    if (selectedPriority !== 'ALL') {
      list = list.filter((r) => r.priority === selectedPriority);
    }

    // Sort: Urgent first, then High, then Normal, then by date desc
    const priorityWeight: Record<RequestPriority, number> = {
      URGENT: 3,
      HIGH: 2,
      NORMAL: 1,
    };

    return list.sort((a, b) => {
      const weightDiff = priorityWeight[b.priority] - priorityWeight[a.priority];
      if (weightDiff !== 0) return weightDiff;
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
    });
  }, [requests, searchQuery, selectedStatus, selectedPriority]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. Compact Dashboard Header (90-120px) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Registrar Management Center
            </span>
            <span className="text-xs text-slate-400 font-mono">
              IBA College of Mindanao
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Supabase Realtime Live
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Welcome back, {profile?.full_name || 'Administrator'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {role === 'ADMIN'
              ? 'Chief Registrar & System Administrator'
              : `${staffProfile?.designation || 'Registrar Staff'} • ${staffProfile?.department || 'Office of the Registrar'}`}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <Button
            id="open-recent-activity-btn"
            variant="outline"
            size="sm"
            icon={Activity}
            onClick={() => setShowRecentActivity(true)}
            title="View timestamped log of the last 10 actions taken across the system"
            className="border-slate-300 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
          >
            Recent Activity
          </Button>

          <Button
            id="simulate-realtime-btn"
            variant="outline"
            size="sm"
            icon={Zap}
            loading={simulatingIntake}
            onClick={handleSimulateRealtimeIntake}
            title="Simulate incoming document request to trigger realtime highlight animation"
          >
            Simulate Intake
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            loading={refreshing}
            onClick={handleRefresh}
            title="Refresh operational queue"
          >
            Refresh
          </Button>

          <Link to="/staff/queue">
            <Button variant="primary" size="sm" icon={ArrowRight} iconPosition="right">
              Open Request Queue
            </Button>
          </Link>
        </div>
      </div>

      {/* Realtime Live Incoming Notification Toast Banner */}
      <AnimatePresence>
        {realtimeToast && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white rounded-xl p-4 shadow-md border border-blue-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-600/30 border border-blue-400/40 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-blue-300 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
                      Realtime Intake Received
                    </span>
                    <span className="text-xs text-slate-300 font-mono">
                      {realtimeToast.request.request_number}
                    </span>
                    {realtimeToast.request.priority === 'URGENT' && (
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-rose-500/30 text-rose-200 border border-rose-400/40">
                        Urgent
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-white">
                    {realtimeToast.request.document_type?.name || 'Document Request'} for{' '}
                    <span className="text-blue-200 font-semibold">
                      {realtimeToast.request.student?.user?.full_name || 'Student'}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-600 bg-slate-800/80 text-white hover:bg-slate-700"
                  onClick={() => {
                    navigate(`/staff/requests/${realtimeToast.request.id}`);
                  }}
                >
                  Review Now
                </Button>
                <button
                  type="button"
                  onClick={() => setRealtimeToast(null)}
                  className="p-1 text-slate-400 hover:text-white rounded transition-colors"
                  aria-label="Dismiss notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Operational Summary Metric Cards (6 KPI items with subtle highlight animation) */}
      {loading ? (
        <DashboardStatsSkeleton count={6} cols="grid-cols-2 sm:grid-cols-3 lg:grid-cols-6" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <KpiCard
            id="kpi-submitted"
            label="New"
            value={submitted}
            description="Awaiting triage"
            icon={Inbox}
            variant="blue"
            highlighted={Boolean(highlightedKpis.submitted)}
            highlightText="+1 New Intake"
            active={selectedStatus === 'SUBMITTED'}
            onClick={() =>
              setSelectedStatus(selectedStatus === 'SUBMITTED' ? 'ALL' : 'SUBMITTED')
            }
          />
          <KpiCard
            id="kpi-under-review"
            label="Under Review"
            value={underReview}
            description="Verifying records"
            icon={Clock}
            variant="amber"
            highlighted={Boolean(highlightedKpis.underReview)}
            highlightText="Updated"
            active={selectedStatus === 'UNDER_REVIEW'}
            onClick={() =>
              setSelectedStatus(selectedStatus === 'UNDER_REVIEW' ? 'ALL' : 'UNDER_REVIEW')
            }
          />
          <KpiCard
            id="kpi-for-approval"
            label="For Approval"
            value={forApproval}
            description="Officer sign-off"
            icon={FileCheck}
            variant="indigo"
            highlighted={Boolean(highlightedKpis.forApproval)}
            highlightText="Updated"
            active={selectedStatus === 'FOR_APPROVAL'}
            onClick={() =>
              setSelectedStatus(selectedStatus === 'FOR_APPROVAL' ? 'ALL' : 'FOR_APPROVAL')
            }
          />
          <KpiCard
            id="kpi-processing"
            label="Processing"
            value={processing}
            description="Printing & seal prep"
            icon={Package}
            variant="sky"
            highlighted={Boolean(highlightedKpis.processing)}
            highlightText="Updated"
            active={selectedStatus === 'PROCESSING'}
            onClick={() =>
              setSelectedStatus(selectedStatus === 'PROCESSING' ? 'ALL' : 'PROCESSING')
            }
          />
          <KpiCard
            id="kpi-ready"
            label="Ready to Claim"
            value={readyForRelease}
            description="Waiting for pickup"
            icon={CheckCircle2}
            variant="emerald"
            highlighted={Boolean(highlightedKpis.ready)}
            highlightText="Updated"
            active={selectedStatus === 'READY_FOR_RELEASE'}
            onClick={() =>
              setSelectedStatus(
                selectedStatus === 'READY_FOR_RELEASE' ? 'ALL' : 'READY_FOR_RELEASE'
              )
            }
          />
          <KpiCard
            id="kpi-urgent"
            label="Urgent Active"
            value={urgent}
            description="High priority queue"
            icon={AlertTriangle}
            variant="rose"
            highlighted={Boolean(highlightedKpis.urgent)}
            highlightText="Urgent Intake"
            active={selectedPriority === 'URGENT'}
            onClick={() =>
              setSelectedPriority(selectedPriority === 'URGENT' ? 'ALL' : 'URGENT')
            }
          />
        </div>
      )}

      {/* 2.5 Recharts Visual Analytics Telemetry */}
      {!loading && (
        <RequestTrendsDashboard
          requests={requests}
          role={role || 'STAFF'}
          title="Document Submission Trends & Approval Pipeline"
          subtitle="Real-time intake velocity, daily volume waves, and active workflow distribution for registrar operations."
          onStatusClick={(statusKey) => {
            setSelectedStatus(statusKey);
            // Smooth scroll down to priority queue
            const queueEl = document.getElementById('priority-action-queue-section');
            if (queueEl) {
              queueEl.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        />
      )}

      {/* 3. Priority Action Queue Section */}
      <div id="priority-action-queue-section" className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Section Header & Filters */}
        <div className="p-5 border-b border-slate-200/80 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Priority Action Queue
              </h2>
              <p className="text-xs text-slate-500">
                New submissions and urgent requests requiring immediate evaluation.
              </p>
            </div>

            <Link
              to="/staff/queue"
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1 self-start sm:self-auto hover:underline"
            >
              <span>View entire queue ({total})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Search and Filters Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                id="queue-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by student name, ID, or request no..."
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors h-9"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Status Filter */}
              <select
                id="filter-status-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 h-9 cursor-pointer transition-colors"
              >
                <option value="ALL">All Active Statuses</option>
                <option value="SUBMITTED">New / Submitted</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="FOR_APPROVAL">For Approval</option>
                <option value="PROCESSING">Processing</option>
                <option value="READY_FOR_RELEASE">Ready to Claim</option>
              </select>

              {/* Priority Filter */}
              <select
                id="filter-priority-select"
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 h-9 cursor-pointer transition-colors"
              >
                <option value="ALL">All Priorities</option>
                <option value="URGENT">Urgent Only</option>
                <option value="HIGH">High Priority</option>
                <option value="NORMAL">Normal Priority</option>
              </select>

              {(searchQuery || selectedStatus !== 'ALL' || selectedPriority !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedStatus('ALL');
                    setSelectedPriority('ALL');
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1 underline font-medium"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Request Data Table (Desktop & Tablet) */}
        {loading ? (
          <div className="p-4">
            <TableSkeleton rows={5} columns={7} />
          </div>
        ) : priorityQueue.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="Priority Queue Clear"
              description="No active requests match your current filters. Great job keeping the student queue processed!"
              actionLabel="View Full Queue"
              onAction={() => navigate('/staff/queue')}
            />
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-4 font-semibold">Request ID</th>
                    <th className="py-3 px-4 font-semibold">Student Requester</th>
                    <th className="py-3 px-4 font-semibold">Document</th>
                    <th className="py-3 px-4 font-semibold text-center">Priority</th>
                    <th className="py-3 px-4 font-semibold text-center">Status</th>
                    <th className="py-3 px-4 font-semibold">Submitted</th>
                    <th className="py-3 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80 text-xs">
                  {priorityQueue.map((req) => (
                    <tr
                      key={req.id}
                      onClick={() => navigate(`/staff/request/${req.id}`)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Request ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                        {req.request_number}
                      </td>

                      {/* Student */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                            {req.student?.user?.full_name || 'Student Requester'}
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            {req.student?.student_id || 'ID Pending'} •{' '}
                            {req.student?.program || 'General Program'}
                          </p>
                        </div>
                      </td>

                      {/* Document */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="font-medium text-slate-800">
                            {req.document_type?.name}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {req.document_type?.code || 'DOC'} • {req.quantity} {req.quantity === 1 ? 'copy' : 'copies'}
                          </p>
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-4 text-center">
                        <PriorityBadge priority={req.priority} />
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge status={req.status} size="sm" />
                      </td>

                      {/* Submitted */}
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {req.created_at
                          ? format(new Date(req.created_at), 'MMM dd, h:mm a')
                          : '-'}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:border-blue-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/staff/request/${req.id}`);
                          }}
                        >
                          Review & Process →
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden divide-y divide-slate-200">
              {priorityQueue.map((req) => (
                <div
                  key={req.id}
                  onClick={() => navigate(`/staff/request/${req.id}`)}
                  className="p-4 space-y-3 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-xs text-blue-700">
                      {req.request_number}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <PriorityBadge priority={req.priority} size="sm" />
                      <StatusBadge status={req.status} size="sm" />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      {req.student?.user?.full_name}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {req.student?.student_id} • {req.student?.program}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800">
                      {req.document_type?.name}
                    </span>
                    <span className="text-slate-500 font-mono">
                      {req.quantity}x copy
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                    <span>
                      {req.created_at
                        ? format(new Date(req.created_at), 'MMM dd, yyyy • h:mm a')
                        : '-'}
                    </span>
                    <span className="font-bold text-blue-700">
                      Review & Process →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Recent Activity Side Panel / Slide-over Modal */}
      <RecentActivityPanel
        isOpen={showRecentActivity}
        onClose={() => setShowRecentActivity(false)}
        limit={10}
      />
    </div>
  );
};
