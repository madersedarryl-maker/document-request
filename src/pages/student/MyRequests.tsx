import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { requestService } from '../../services/requestService';
import { DocumentRequest } from '../../types';
import { StatusBadge, PaymentBadge } from '../../components/StatusBadge';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/Button';
import { TableSkeleton } from '../../components/Skeletons';
import { EmptyState } from '../../components/EmptyState';
import {
  FileText,
  PlusCircle,
  Search,
  Filter,
  RefreshCw,
  X,
  ArrowRight,
} from 'lucide-react';
import { format } from 'date-fns';

export const MyRequests: React.FC = () => {
  const { studentProfile } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState<DocumentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const loadRequests = async () => {
    if (!studentProfile) return;
    try {
      const data = await requestService.getStudentRequests(studentProfile.id);
      setRequests(data);
    } catch (err) {
      console.error('Error fetching student requests:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [studentProfile]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadRequests();
  };

  // Filtering
  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm.trim() ||
        r.request_number.toLowerCase().includes(term) ||
        r.document_type?.name.toLowerCase().includes(term) ||
        r.purpose.toLowerCase().includes(term);

      const matchesStatus =
        selectedStatus === 'ALL' || r.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [requests, searchTerm, selectedStatus]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedData = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const statusOptions: { label: string; value: string }[] = [
    { label: 'All Statuses', value: 'ALL' },
    { label: 'Submitted', value: 'SUBMITTED' },
    { label: 'Under Review', value: 'UNDER_REVIEW' },
    { label: 'Needs Information', value: 'NEEDS_INFORMATION' },
    { label: 'For Approval', value: 'FOR_APPROVAL' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Processing', value: 'PROCESSING' },
    { label: 'Ready for Release', value: 'READY_FOR_RELEASE' },
    { label: 'Released', value: 'RELEASED' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title="My Document Requests"
        subtitle="View submission history, track real-time approvals, and inspect issuance details."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'My Requests' },
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
            <Link to="/new-request">
              <Button variant="primary" size="sm" icon={PlusCircle}>
                New Document Request
              </Button>
            </Link>
          </div>
        }
      />

      {/* 2. Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            id="search-my-requests-input"
            placeholder="Search request #, document, purpose..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full text-xs pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-colors h-9"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            id="filter-student-status-select"
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50 font-medium text-slate-700 h-9 w-full sm:w-auto cursor-pointer transition-colors"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Main Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-4">
            <TableSkeleton rows={5} columns={6} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No Requests Found"
              description="You haven't submitted any document requests matching the current filters."
              actionLabel="Submit Request"
              onAction={() => navigate('/new-request')}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Request No.</th>
                  <th className="py-3 px-4">Document Details</th>
                  <th className="py-3 px-4">Qty & Method</th>
                  <th className="py-3 px-4">Date Submitted</th>
                  <th className="py-3 px-4 text-center">Workflow Status</th>
                  <th className="py-3 px-4 text-center">Payment</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80 text-xs">
                {paginatedData.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => navigate(`/request/${row.id}`)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                      {row.request_number}
                    </td>
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {row.document_type?.name || 'Document'}
                        </p>
                        <p className="text-[11px] text-slate-500 line-clamp-1">
                          Purpose: {row.purpose}
                        </p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {row.quantity}x • {row.release_method.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {row.created_at
                        ? format(new Date(row.created_at), 'MMM dd, yyyy')
                        : '-'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <StatusBadge status={row.status} size="sm" />
                        {row.overall_verification_status && row.overall_verification_status !== 'NOT_APPLICABLE' && (
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                              row.overall_verification_status === 'VERIFIED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : row.overall_verification_status === 'ACTION_REQUIRED'
                                ? 'bg-amber-100 text-amber-800'
                                : row.overall_verification_status === 'REJECTED'
                                ? 'bg-rose-100 text-rose-800'
                                : row.overall_verification_status === 'UNDER_REVIEW'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {row.overall_verification_status === 'VERIFIED'
                              ? '✓ Docs Clear'
                              : row.overall_verification_status === 'ACTION_REQUIRED'
                              ? '⚠️ Resubmit Needed'
                              : row.overall_verification_status === 'REJECTED'
                              ? '✕ Docs Rejected'
                              : row.overall_verification_status === 'UNDER_REVIEW'
                              ? '🔍 Under Review'
                              : '⏳ Upload Missing'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <PaymentBadge status={row.payment_status} fee={row.fee} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/request/${row.id}`);
                        }}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {filtered.length > pageSize && (
          <div className="p-3.5 bg-slate-50/75 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, filtered.length)} of{' '}
              {filtered.length} requests
            </span>
            <div className="flex items-center space-x-1.5">
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="px-2 font-semibold text-slate-800">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
