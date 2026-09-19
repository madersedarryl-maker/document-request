import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { requestService } from '../../services/requestService';
import { storageService } from '../../services/storageService';
import {
  DocumentRequest,
  RequestStatus,
  RequestPriority,
  PaymentStatus,
} from '../../types';
import { StatusBadge, PriorityBadge, PaymentBadge } from '../../components/StatusBadge';
import { Timeline } from '../../components/Timeline';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { RequestDetailSkeleton } from '../../components/Skeletons';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/Button';
import {
  FileText,
  ArrowLeft,
  GraduationCap,
  Download,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  XCircle,
  Package,
  CheckCheck,
  Lock,
  RefreshCw,
  DollarSign,
  HardDrive,
  User,
  Clock,
  Shield,
  FileCheck,
  Mail,
  Send,
  X,
  Printer,
} from 'lucide-react';
import { format } from 'date-fns';
import { DocumentReviewWorkspace } from '../../components/DocumentReviewWorkspace';
import { EmailAlertsHistory } from '../../components/EmailAlertsHistory';
import { PrintPreviewModal } from '../../components/PrintPreviewModal';
import { emailService } from '../../services/emailService';

export const StaffRequestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, profile, staffProfile } = useAuth();
  const navigate = useNavigate();

  const [request, setRequest] = useState<DocumentRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Dialog States
  const [dialogType, setDialogType] = useState<
    'REJECT' | 'NEEDS_INFO' | 'RELEASE' | 'APPROVE' | null
  >(null);

  // Custom Email Modal State
  const [isCustomEmailModalOpen, setIsCustomEmailModalOpen] = useState(false);
  const [customEmailStatus, setCustomEmailStatus] = useState<RequestStatus>('UNDER_REVIEW');
  const [customEmailSubject, setCustomEmailSubject] = useState('');
  const [customEmailBody, setCustomEmailBody] = useState('');
  const [sendingCustomEmail, setSendingCustomEmail] = useState(false);

  // Print Preview Modal State
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);

  // Internal Notes State
  const [newNote, setNewNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<'VERIFICATION' | 'OVERVIEW' | 'TIMELINE' | 'EMAILS'>('VERIFICATION');

  // Attachment signed URLs map
  const [downloadUrls, setDownloadUrls] = useState<Record<string, string>>({});

  const fetchDetails = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await requestService.getRequestById(id);
      if (!data) {
        setError('Document request not found.');
      } else {
        setRequest(data);
        // Pre-generate download signed URLs for attachments
        if (data.attachments && data.attachments.length > 0) {
          const urls: Record<string, string> = {};
          for (const att of data.attachments) {
            try {
              const url = await storageService.getDownloadSignedUrl(att.storage_path);
              if (url) urls[att.id] = url;
            } catch (e) {
              console.error('Error generating signed url for', att.file_name, e);
            }
          }
          setDownloadUrls(urls);
        }
      }
    } catch (err: any) {
      console.error('Error loading staff request detail:', err);
      setError(err.message || 'Failed to load request.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  // Execute Status Transition
  const handleStatusTransition = async (newStatus: RequestStatus, reason?: string, comment?: string) => {
    if (!request || !user) return;
    setActionLoading(true);
    setActionFeedback(null);
    try {
      await requestService.updateRequestStatus({
        requestId: request.id,
        newStatus,
        changedBy: user.id,
        reason,
        comment,
      });
      setDialogType(null);
      setActionFeedback({ type: 'success', message: `Request moved to ${newStatus.replace(/_/g, ' ').toLowerCase()}.` });
      await fetchDetails();
    } catch (err: any) {
      console.error('Status change error:', err);
      setActionFeedback({ type: 'error', message: err.message || 'Failed to update request status.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Change Priority
  const handlePriorityChange = async (priority: RequestPriority) => {
    if (!request || !user) return;
    setActionFeedback(null);
    try {
      await requestService.updateRequestPriority(request.id, priority, user.id);
      await fetchDetails();
      setActionFeedback({ type: 'success', message: 'Request priority updated.' });
    } catch (err: any) {
      console.error('Priority update error:', err);
      setActionFeedback({ type: 'error', message: err.message || 'Failed to update priority.' });
    }
  };

  // Change Payment Status
  const handlePaymentChange = async (paymentStatus: PaymentStatus) => {
    if (!request || !user) return;
    setActionFeedback(null);
    try {
      await requestService.updatePaymentStatus(request.id, paymentStatus, user.id);
      await fetchDetails();
      setActionFeedback({ type: 'success', message: 'Payment status updated.' });
    } catch (err: any) {
      console.error('Payment update error:', err);
      setActionFeedback({ type: 'error', message: err.message || 'Failed to update payment status.' });
    }
  };

  // Add Internal Note
  const handleAddInternalNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !request || !user) return;
    setSubmittingNote(true);
    setActionFeedback(null);
    try {
      await requestService.addInternalNote(request.id, user.id, newNote.trim());
      setNewNote('');
      setActionFeedback({ type: 'success', message: 'Internal note added.' });
      await fetchDetails();
    } catch (err: any) {
      console.error('Add note error:', err);
      setActionFeedback({ type: 'error', message: err.message || 'Failed to add internal note.' });
    } finally {
      setSubmittingNote(false);
    }
  };

  // Dispatch Custom Status Email via Supabase Edge Function
  const handleSendCustomEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!request) return;
    setSendingCustomEmail(true);
    try {
      await emailService.sendSingleStatusEmailNotification(
        request,
        customEmailStatus,
        {
          customSubject: customEmailSubject.trim() || undefined,
          customBody: customEmailBody.trim() || undefined,
          senderId: user?.id,
          senderName: profile?.full_name || 'Registrar Evaluation Officer',
        }
      );
      setIsCustomEmailModalOpen(false);
      setCustomEmailSubject('');
      setCustomEmailBody('');
      setActionFeedback({ type: 'success', message: 'The status email was queued for delivery.' });
      await fetchDetails();
    } catch (err: any) {
      console.error('Custom email dispatch error:', err);
      setActionFeedback({ type: 'error', message: err.message || 'Failed to send automated status email.' });
    } finally {
      setSendingCustomEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <RequestDetailSkeleton />
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Request Record Not Found</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">{error}</p>
        <Link to="/staff/queue">
          <Button size="sm" variant="primary" icon={ArrowLeft}>
            Back to Queue
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. Header with Breadcrumbs and Status Controls */}
      <PageHeader
        title={request.request_number}
        subtitle={
          <span>
            Submitted by{' '}
            <strong className="text-slate-900">
              {request.student?.user?.full_name || 'Student'}
            </strong>{' '}
            ({request.student?.student_id || 'ID Pending'}) on{' '}
            {request.created_at
              ? format(new Date(request.created_at), 'MMMM dd, yyyy • h:mm a')
              : '-'}
          </span>
        }
        badge={
          <div className="flex items-center gap-2">
            <StatusBadge status={request.status} size="lg" />
            <PriorityBadge priority={request.priority} />
          </div>
        }
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Request Queue', href: '/staff/queue' },
          { label: request.request_number },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            {/* Priority Selector */}
            <div className="flex items-center space-x-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs text-xs font-semibold">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">Priority:</span>
              <select
                value={request.priority}
                onChange={(e) => handlePriorityChange(e.target.value as RequestPriority)}
                className="text-xs font-bold rounded border-0 bg-transparent py-0.5 pl-1 pr-6 focus:ring-0 cursor-pointer text-slate-800"
              >
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <Button
              size="sm"
              variant="secondary"
              icon={RefreshCw}
              onClick={fetchDetails}
              title="Refresh request"
            >
              Refresh
            </Button>

            <Button
              size="sm"
              variant="secondary"
              icon={Printer}
              onClick={() => setIsPrintPreviewOpen(true)}
              title="Print Preview: Official Routing & Clearance Slip"
            >
              Print Routing Slip
            </Button>
          </div>
        }
      />

      {actionFeedback && (
        <div
          role="status"
          aria-live="polite"
          className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
            actionFeedback.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : 'border-rose-200 bg-rose-50 text-rose-900'
          }`}
        >
          {actionFeedback.type === 'success' ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
          <p>{actionFeedback.message}</p>
        </div>
      )}

      {/* Navigation Tab Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-2 pt-2 rounded-t-xl">
        <button
          id="tab-document-verification"
          type="button"
          onClick={() => setActiveTab('VERIFICATION')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'VERIFICATION'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>Document Verification</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 text-indigo-800">
            {request.requirement_items?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'OVERVIEW'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Request Specifications & Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('TIMELINE')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'TIMELINE'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Timeline & Audit Logs</span>
        </button>

        <button
          onClick={() => setActiveTab('EMAILS')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'EMAILS'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50 rounded-t-lg'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Automated Email Alerts</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
            Edge
          </span>
        </button>
      </div>

      {/* Tab 1: Primary Document Clearance & Verification Workspace */}
      {activeTab === 'VERIFICATION' && (
        <div className="space-y-6">
          <DocumentReviewWorkspace
            request={request}
            onVerificationUpdated={fetchDetails}
            canReview={true}
          />

          {/* Quick Actions & Notes Strip */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-700" />
                  Registrar Workflow Actions
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Current Status:</span>
                  <StatusBadge status={request.status} size="sm" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                {request.status === 'SUBMITTED' && (
                  <Button
                    id="action-start-review-btn"
                    variant="primary"
                    size="sm"
                    onClick={() => handleStatusTransition('UNDER_REVIEW', 'Officer initiated review.')}
                    disabled={actionLoading}
                    loading={actionLoading}
                    icon={Clock}
                  >
                    Start Processing Review
                  </Button>
                )}

                {(request.status === 'SUBMITTED' ||
                  request.status === 'UNDER_REVIEW' ||
                  request.status === 'FOR_APPROVAL') && (
                  <Button
                    id="action-approve-btn"
                    variant="success"
                    size="sm"
                    onClick={() => setDialogType('APPROVE')}
                    disabled={actionLoading}
                    icon={CheckCircle2}
                  >
                    Approve & Authorize Document
                  </Button>
                )}

                {request.status === 'APPROVED' && (
                  <Button
                    id="action-start-processing-btn"
                    variant="primary"
                    size="sm"
                    onClick={() => handleStatusTransition('PROCESSING', 'Document dispatched for printing.')}
                    disabled={actionLoading}
                    icon={Package}
                  >
                    Start Printing / Seal Prep
                  </Button>
                )}

                {request.status === 'PROCESSING' && (
                  <Button
                    id="action-ready-release-btn"
                    variant="success"
                    size="sm"
                    onClick={() => handleStatusTransition('READY_FOR_RELEASE', 'Document ready at window.')}
                    disabled={actionLoading}
                    icon={CheckCheck}
                  >
                    Mark Ready for Release
                  </Button>
                )}

                {request.status === 'READY_FOR_RELEASE' && (
                  <Button
                    id="action-confirm-release-btn"
                    variant="primary"
                    size="sm"
                    onClick={() => setDialogType('RELEASE')}
                    disabled={actionLoading}
                    icon={CheckCircle2}
                  >
                    Release to Student / Claimed
                  </Button>
                )}

                {request.status !== 'RELEASED' &&
                  request.status !== 'REJECTED' &&
                  request.status !== 'CANCELLED' && (
                    <Button
                      id="action-request-info-btn"
                      variant="secondary"
                      size="sm"
                      onClick={() => setDialogType('NEEDS_INFO')}
                      disabled={actionLoading}
                      icon={HelpCircle}
                    >
                      Request Info / Clearances
                    </Button>
                  )}

                {request.status !== 'RELEASED' &&
                  request.status !== 'REJECTED' &&
                  request.status !== 'CANCELLED' && (
                    <Button
                      id="action-reject-btn"
                      variant="danger"
                      size="sm"
                      onClick={() => setDialogType('REJECT')}
                      disabled={actionLoading}
                      icon={XCircle}
                    >
                      Reject Request
                    </Button>
                  )}
              </div>
            </div>

            {/* Internal Staff Notes */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  Staff Internal Notes
                </h3>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Staff Only
                </span>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto divide-y divide-slate-100">
                {!request.internal_notes || request.internal_notes.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">No internal notes added yet.</p>
                ) : (
                  request.internal_notes.map((note) => (
                    <div key={note.id} className="pt-2 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-semibold text-slate-700">{note.author?.full_name || 'Staff'}</span>
                        <span>{note.created_at ? format(new Date(note.created_at), 'MMM d, h:mm a') : ''}</span>
                      </div>
                      <p className="text-slate-800 bg-slate-50 p-2 rounded border border-slate-200">{note.note}</p>
                    </div>
                  ))
                )}
              </div>
              <form onSubmit={handleAddInternalNote} className="space-y-2 pt-2 border-t border-slate-100">
                <textarea
                  rows={2}
                  placeholder="Add internal staff note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600"
                />
                <Button
                  type="submit"
                  size="sm"
                  variant="secondary"
                  disabled={submittingNote || !newNote.trim()}
                  loading={submittingNote}
                  className="w-full"
                >
                  Add Note
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2 & 3: Overview & Timeline */}
      {activeTab !== 'VERIFICATION' && (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Student Profile, Specs, Attachments, Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'OVERVIEW' && (
            <>
              {/* Student Profile Card */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3.5">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-blue-700" />
                  Requester Student Profile
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-4 bg-slate-50 rounded-lg text-xs">
                  <div>
                    <span className="text-slate-400 uppercase font-semibold text-[10px] block">Student Legal Name</span>
                    <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                      {request.student?.user?.full_name || 'Student Requester'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 uppercase font-semibold text-[10px] block">Student ID Number</span>
                    <span className="font-bold font-mono text-slate-900 text-sm mt-0.5 block">
                      {request.student?.student_id || 'N/A'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 uppercase font-semibold text-[10px] block">Enrolled Program</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">{request.student?.program || 'Academic Program'}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 uppercase font-semibold text-[10px] block">Year Level</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">{request.student?.year_level || 'Active'}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 uppercase font-semibold text-[10px] block">Student Email</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block font-mono">{request.student?.user?.email || 'N/A'}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 uppercase font-semibold text-[10px] block">Contact Phone</span>
                    <span className="font-semibold text-slate-800 mt-0.5 block">
                      {request.student?.contact_number || request.student?.user?.phone || 'Not provided'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Document Request Specifications Card */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3.5">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-700" />
                  Document Specifications
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">Document</span>
                    <span className="font-bold text-blue-700 text-sm mt-0.5 block">
                      {request.document_type?.name}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">Quantity</span>
                    <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                      {request.quantity} copy / copies
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">Release Method</span>
                    <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                      {request.release_method.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">Assessment Fee</span>
                    <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                      ₱{Number(request.fee).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 pt-2 text-xs border-t border-slate-100">
                  <div>
                    <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">
                      Stated Purpose
                    </span>
                    <p className="font-medium text-slate-900 mt-0.5">{request.purpose}</p>
                  </div>

                  {request.remarks && (
                    <div>
                      <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">
                        Student Remarks / Special Instructions
                      </span>
                      <p className="text-slate-600 italic mt-0.5">{request.remarks}</p>
                    </div>
                  )}

                  {request.release_method === 'COURIER' && request.delivery_address && (
                    <div>
                      <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">
                        Delivery Address
                      </span>
                      <p className="text-slate-800 mt-0.5">{request.delivery_address}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Attached Files Card */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3.5">
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-blue-700" />
                  Attached Clearances & Files ({request.attachments?.length || 0})
                </h2>

                {!request.attachments || request.attachments.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No attachments submitted with this request.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {request.attachments.map((att) => {
                      const downloadUrl = downloadUrls[att.id];
                      return (
                        <div
                          key={att.id}
                          className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center space-x-2.5 overflow-hidden">
                            <FileText className="w-4 h-4 text-blue-700 shrink-0" />
                            <div className="truncate">
                              <p className="font-semibold text-slate-900 truncate">{att.file_name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">
                                {att.file_size ? `${(att.file_size / 1024).toFixed(1)} KB` : 'File'}
                              </p>
                            </div>
                          </div>

                          {downloadUrl && (
                            <a
                              href={downloadUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 text-blue-700 hover:text-blue-900 hover:bg-blue-50 rounded font-semibold text-xs transition-colors flex items-center gap-1 shrink-0"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Download
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Status Audit History & Lifecycle Progression */}
              <Timeline
                currentStatus={request.status}
                history={request.status_history}
                createdAt={request.created_at}
                requesterName={request.student?.user?.full_name || 'Student Requester'}
                requesterRole="STUDENT"
                requestNumber={request.request_number}
              />
            </>
          )}

          {activeTab === 'TIMELINE' && (
            <div className="space-y-6">
              <Timeline
                currentStatus={request.status}
                history={request.status_history}
                createdAt={request.created_at}
                requesterName={request.student?.user?.full_name || 'Student Requester'}
                requesterRole="STUDENT"
                requestNumber={request.request_number}
              />
              <EmailAlertsHistory
                requestId={request.id}
                requestNumber={request.request_number}
                recipientEmail={request.student?.user?.email}
                isStaff={true}
                onSendCustomNotification={() => {
                  setCustomEmailStatus(request.status);
                  setIsCustomEmailModalOpen(true);
                }}
              />
            </div>
          )}

          {activeTab === 'EMAILS' && (
            <div className="space-y-6">
              <EmailAlertsHistory
                requestId={request.id}
                requestNumber={request.request_number}
                recipientEmail={request.student?.user?.email}
                isStaff={true}
                onSendCustomNotification={() => {
                  setCustomEmailStatus(request.status);
                  setIsCustomEmailModalOpen(true);
                }}
              />
            </div>
          )}
        </div>

        {/* Right 1 Column: Payment Manager & Confidential Internal Notes */}
        <div className="space-y-6">
          {/* Payment Status Manager */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Payment Management
            </h3>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Current Payment:</span>
                <PaymentBadge status={request.payment_status} fee={request.fee} />
              </div>
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span>Total Assessment:</span>
                <span>₱{Number(request.fee).toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="block font-semibold text-slate-700">Update Payment Status:</label>
              <select
                value={request.payment_status}
                onChange={(e) => handlePaymentChange(e.target.value as PaymentStatus)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 bg-white font-medium cursor-pointer"
              >
                <option value="NOT_REQUIRED">Not Required</option>
                <option value="PENDING">Pending Payment</option>
                <option value="PAID">Paid / Verified</option>
                <option value="REFUNDED">Refunded</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Confirmation & Action Dialogs */}
      <ConfirmDialog
        isOpen={dialogType === 'REJECT'}
        onClose={() => setDialogType(null)}
        onConfirm={(reason) => handleStatusTransition('REJECTED', reason)}
        title="Reject Document Request"
        message="Please state the specific reason for rejecting this document request. This explanation will be provided to the student."
        confirmText="Confirm Rejection"
        type="danger"
        requireReason={true}
        reasonLabel="Mandatory Rejection Reason"
        reasonPlaceholder="e.g. Unsettled financial clearance with Treasury, incorrect document requested..."
        loading={actionLoading}
      />

      <ConfirmDialog
        isOpen={dialogType === 'NEEDS_INFO'}
        onClose={() => setDialogType(null)}
        onConfirm={(note) => handleStatusTransition('NEEDS_INFORMATION', note)}
        title="Request Additional Information / Clearances"
        message="Specify the additional documents or clarifications required from the student to proceed with this request."
        confirmText="Send Request to Student"
        type="warning"
        requireReason={true}
        reasonLabel="Required Information / Clearances"
        reasonPlaceholder="e.g. Please upload a clear scan of your official 2026 Student ID and Library Clearance form..."
        loading={actionLoading}
      />

      <ConfirmDialog
        isOpen={dialogType === 'APPROVE'}
        onClose={() => setDialogType(null)}
        onConfirm={() => handleStatusTransition('APPROVED', 'Approved by Registrar Officer.')}
        title="Approve Document Request"
        message={`Are you sure you want to approve request ${request.request_number}? This will authorize document preparation and production.`}
        confirmText="Approve Request"
        type="success"
        loading={actionLoading}
      />

      <ConfirmDialog
        isOpen={dialogType === 'RELEASE'}
        onClose={() => setDialogType(null)}
        onConfirm={() => handleStatusTransition('RELEASED', 'Official document claimed/dispatched.')}
        title="Confirm Document Release"
        message={`Confirm that the physical or digital document for ${request.request_number} has been officially issued and released to ${request.student?.user?.full_name}?`}
        confirmText="Confirm Release"
        type="success"
        loading={actionLoading}
      />

      {/* Manual / Custom Status Email Dispatch Modal */}
      {isCustomEmailModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-800">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Send Status Email Notification</h4>
                  <p className="text-xs text-slate-500">
                    Dispatched via Supabase Edge Function <code className="font-mono text-slate-700">send-status-email</code>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomEmailModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendCustomEmail} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg space-y-1">
                <span className="font-bold text-blue-900 block">Recipient Student:</span>
                <p className="text-blue-800">
                  {request.student?.user?.full_name} ({request.student?.student_id}) &bull;{' '}
                  <span className="font-mono">{request.student?.user?.email}</span>
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Trigger for Status Template:
                </label>
                <select
                  value={customEmailStatus}
                  onChange={(e) => setCustomEmailStatus(e.target.value as RequestStatus)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 font-semibold"
                >
                  <option value="UNDER_REVIEW">UNDER REVIEW (Clearance Evaluation)</option>
                  <option value="FOR_APPROVAL">FOR APPROVAL (Dean / Sign-off)</option>
                  <option value="APPROVED">APPROVED (Queued for Printing)</option>
                  <option value="PROCESSING">PROCESSING (Production & Embossing)</option>
                  <option value="READY_FOR_RELEASE">READY FOR RELEASE (Ready for Claiming)</option>
                  <option value="RELEASED">RELEASED (Officially Issued)</option>
                  <option value="NEEDS_INFORMATION">NEEDS INFORMATION (Resubmission)</option>
                  <option value="REJECTED">REJECTED (Disapproved)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Custom Subject Line (Optional - overrides standard template):
                </label>
                <input
                  type="text"
                  placeholder={`[iBACMI Registrar] Update on request ${request.request_number}`}
                  value={customEmailSubject}
                  onChange={(e) => setCustomEmailSubject(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Custom Remarks / Next Steps (Optional):
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide additional instructions, specific claiming hours, or requirement notes to include in the notification..."
                  value={customEmailBody}
                  onChange={(e) => setCustomEmailBody(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCustomEmailModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={sendingCustomEmail}
                  disabled={sendingCustomEmail}
                  icon={Send}
                >
                  Dispatch Email Notification
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Preview Modal for Official Document Routing & Clearance Slip */}
      <PrintPreviewModal
        isOpen={isPrintPreviewOpen}
        onClose={() => setIsPrintPreviewOpen(false)}
        singleRequest={request}
        initialMode="document"
      />
    </div>
  );
};
