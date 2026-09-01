import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { requestService } from '../../services/requestService';
import { DocumentRequest } from '../../types';
import { StatusBadge, PaymentBadge } from '../../components/StatusBadge';
import { KpiCard } from '../../components/KpiCard';
import { Button } from '../../components/Button';
import { DashboardStatsSkeleton, TableSkeleton } from '../../components/Skeletons';
import { EmptyState } from '../../components/EmptyState';
import {
  FileText,
  PlusCircle,
  Clock,
  CheckCircle2,
  Package,
  ArrowRight,
  RefreshCw,
  FolderKanban,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';
import { format } from 'date-fns';

export const StudentDashboard: React.FC = () => {
  const { user, profile, studentProfile } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStudentData = async () => {
    if (!studentProfile) return;
    try {
      const data = await requestService.getStudentRequests(studentProfile.id);
      setRequests(data);
    } catch (err) {
      console.error('Error loading student requests:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [studentProfile]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStudentData();
  };

  // Metrics
  const total = requests.length;
  const pending = requests.filter(
    (r) =>
      r.status === 'SUBMITTED' ||
      r.status === 'UNDER_REVIEW' ||
      r.status === 'FOR_APPROVAL'
  ).length;
  const processing = requests.filter(
    (r) => r.status === 'APPROVED' || r.status === 'PROCESSING'
  ).length;
  const ready = requests.filter((r) => r.status === 'READY_FOR_RELEASE').length;
  const released = requests.filter((r) => r.status === 'RELEASED').length;

  const needsActionRequests = requests.filter((r) => r.status === 'NEEDS_INFORMATION');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. Compact Dashboard Header (90-120px) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Student Records Portal
            </span>
            <span className="text-xs text-slate-400 font-mono">
              IBA College of Mindanao
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Welcome back, {profile?.full_name || 'Student'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Student ID: <span className="font-mono font-semibold text-slate-700">{studentProfile?.student_id || '2023-10482'}</span> •{' '}
            {studentProfile?.program || 'BS Information Technology'} ({studentProfile?.year_level || '3rd Year'})
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            loading={refreshing}
            onClick={handleRefresh}
            title="Refresh requests"
          >
            Refresh
          </Button>

          <Link to="/new-request">
            <Button variant="primary" size="sm" icon={PlusCircle}>
              New Request
            </Button>
          </Link>
        </div>
      </div>

      {/* Action Required Alert Banner if applicable */}
      {needsActionRequests.length > 0 && (
        <div className="p-4 bg-amber-50/90 border border-amber-300 rounded-xl shadow-2xs text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-amber-950">
                Action Required on Your Request
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                The registrar requested additional information for request{' '}
                <strong className="font-mono">{needsActionRequests[0].request_number}</strong> (
                {needsActionRequests[0].document_type?.name}).
              </p>
            </div>
          </div>

          <Link to={`/request/${needsActionRequests[0].id}`}>
            <Button size="sm" variant="primary" className="bg-amber-700 hover:bg-amber-800 text-white shrink-0">
              Respond to Registrar →
            </Button>
          </Link>
        </div>
      )}

      {/* 2. Metric Cards Grid (5 KPI items) */}
      {loading ? (
        <DashboardStatsSkeleton count={5} cols="grid-cols-2 sm:grid-cols-3 lg:grid-cols-5" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <KpiCard
            label="Total Submissions"
            value={total}
            description="All document requests"
            icon={FolderKanban}
            variant="neutral"
          />
          <KpiCard
            label="In Review"
            value={pending}
            description="Verification in progress"
            icon={Clock}
            variant="amber"
          />
          <KpiCard
            label="Processing"
            value={processing}
            description="Printing & seal prep"
            icon={Package}
            variant="sky"
          />
          <KpiCard
            label="Ready to Claim"
            value={ready}
            description="Ready at Window 4"
            icon={CheckCircle2}
            variant="emerald"
          />
          <KpiCard
            label="Completed"
            value={released}
            description="Claimed & recorded"
            icon={CheckCircle2}
            variant="teal"
          />
        </div>
      )}

      {/* 3. Recent Requests Table Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Recent Document Requests
            </h2>
            <p className="text-xs text-slate-500">
              View real-time status and audit timeline of your records transactions.
            </p>
          </div>

          <Link
            to="/my-requests"
            className="text-xs font-semibold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1 hover:underline self-start sm:self-auto"
          >
            <span>View all submissions ({requests.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-4">
            <TableSkeleton rows={4} columns={6} />
          </div>
        ) : requests.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No Document Requests Found"
              description="You have not submitted any official document requests yet. You can request Transcripts (TOR), Certifications, and Clearances online."
              actionLabel="Submit First Request"
              onAction={() => navigate('/new-request')}
              actionIcon={PlusCircle}
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
                    <th className="py-3 px-4 font-semibold">Document Requested</th>
                    <th className="py-3 px-4 font-semibold">Date Submitted</th>
                    <th className="py-3 px-4 font-semibold text-center">Status</th>
                    <th className="py-3 px-4 font-semibold">Payment / Fee</th>
                    <th className="py-3 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80 text-xs">
                  {requests.slice(0, 5).map((req) => (
                    <tr
                      key={req.id}
                      onClick={() => navigate(`/request/${req.id}`)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                        {req.request_number}
                      </td>
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                            {req.document_type?.name || 'Document'}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {req.quantity} {req.quantity === 1 ? 'copy' : 'copies'} • {req.release_method?.replace(/_/g, ' ')}
                          </p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {req.created_at
                          ? format(new Date(req.created_at), 'MMM dd, yyyy')
                          : '-'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge status={req.status} size="sm" />
                      </td>
                      <td className="py-3.5 px-4">
                        <PaymentBadge status={req.payment_status} fee={req.fee} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:border-blue-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/request/${req.id}`);
                          }}
                        >
                          View Details →
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-slate-200">
              {requests.slice(0, 5).map((req) => (
                <div
                  key={req.id}
                  onClick={() => navigate(`/request/${req.id}`)}
                  className="p-4 space-y-2.5 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-xs text-blue-700">
                      {req.request_number}
                    </span>
                    <StatusBadge status={req.status} size="sm" />
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      {req.document_type?.name}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {req.quantity}x copy • {req.release_method?.replace(/_/g, ' ')}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                    <PaymentBadge status={req.payment_status} fee={req.fee} />
                    <span className="font-semibold text-blue-700">
                      View Details →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
