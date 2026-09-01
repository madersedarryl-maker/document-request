import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { requestService } from '../../services/requestService';
import { storageService } from '../../services/storageService';
import { DocumentRequest } from '../../types';
import { StatusBadge, PaymentBadge, PriorityBadge } from '../../components/StatusBadge';
import { Timeline } from '../../components/Timeline';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { FileUploader } from '../../components/FileUploader';
import { RequestDetailSkeleton } from '../../components/Skeletons';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/Button';
import {
  FileText,
  ArrowLeft,
  Calendar,
  Clock,
  HardDrive,
  Download,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Ban,
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';
import { StudentRequirementSubmission } from '../../components/StudentRequirementSubmission';

export const RequestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [request, setRequest] = useState<DocumentRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cancellation modal state
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Fulfill info request state
  const [missingFiles, setMissingFiles] = useState<File[]>([]);
  const [infoReplyNote, setInfoReplyNote] = useState('');
  const [isFulfilling, setIsFulfilling] = useState(false);

  // Attachment signed URLs map
  const [downloadUrls, setDownloadUrls] = useState<Record<string, string>>({});

  const fetchRequestDetails = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await requestService.getRequestById(id);
      if (!data) {
        setError('Document request not found or you do not have permission to view it.');
      } else {
        setRequest(data);
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
      console.error('Error loading request detail:', err);
      setError(err.message || 'Failed to load request details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequestDetails();
  }, [id]);

  const handleCancelRequest = async (reason?: string) => {
    if (!request || !user) return;
    setActionLoading(true);
    try {
      await requestService.updateRequestStatus({
        requestId: request.id,
        newStatus: 'CANCELLED',
        changedBy: user.id,
        reason: reason || 'Cancelled by student requester.',
      });
      setIsCancelModalOpen(false);
      await fetchRequestDetails();
    } catch (err: any) {
      console.error('Cancel request error:', err);
      alert(err.message || 'Failed to cancel request.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFulfillInformation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!request || !user) return;
    setIsFulfilling(true);

    try {
      if (missingFiles.length > 0) {
        for (const file of missingFiles) {
          const uploadRes = await storageService.uploadRequestAttachment(request.id, file);
          await storageService.saveAttachmentRecord({
            request_id: request.id,
            uploaded_by: user.id,
            file_name: uploadRes.fileName,
            storage_path: uploadRes.storagePath,
            file_size: uploadRes.fileSize,
            mime_type: uploadRes.mimeType,
          });
        }
      }

      await requestService.updateRequestStatus({
        requestId: request.id,
        newStatus: 'UNDER_REVIEW',
        changedBy: user.id,
        reason: 'Student provided requested information & documents.',
        comment: infoReplyNote.trim() || undefined,
      });

      setMissingFiles([]);
      setInfoReplyNote('');
      await fetchRequestDetails();
    } catch (err: any) {
      console.error('Fulfill error:', err);
      alert(err.message || 'Failed to update request information.');
    } finally {
      setIsFulfilling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
        <h2 className="text-lg font-bold text-slate-900">Request Not Found</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">{error}</p>
        <Link to="/my-requests">
          <Button size="sm" variant="primary" icon={ArrowLeft}>
            Back to My Requests
          </Button>
        </Link>
      </div>
    );
  }

  const canCancel =
    request.status === 'SUBMITTED' ||
    request.status === 'UNDER_REVIEW' ||
    request.status === 'NEEDS_INFORMATION';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title={request.document_type?.name || 'Document Request'}
        subtitle={
          <span>
            Tracking Number <strong className="font-mono text-slate-900">{request.request_number}</strong> • Submitted on{' '}
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
          { label: 'My Requests', href: '/my-requests' },
          { label: request.request_number },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {canCancel && (
              <Button
                id="cancel-request-btn"
                variant="danger"
                size="sm"
                icon={Ban}
                onClick={() => setIsCancelModalOpen(true)}
              >
                Cancel Request
              </Button>
            )}

            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              onClick={fetchRequestDetails}
            >
              Refresh
            </Button>
          </div>
        }
      />

      {/* 2. Main Request Summary Card */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6">
        {/* Action alert banner if NEEDS_INFORMATION */}
        {request.status === 'NEEDS_INFORMATION' && (
          <div className="p-4 sm:p-5 bg-amber-50 border border-amber-200 rounded-xl space-y-4 text-amber-900">
            <div className="flex items-start space-x-3">
              <HelpCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold">Action Required: The Registrar Requested Information</h3>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  <strong>Registrar Note:</strong> "{request.information_request_note || 'Please provide additional clearance documents.'}"
                </p>
              </div>
            </div>

            {/* Response & Upload Form */}
            <form onSubmit={handleFulfillInformation} className="space-y-3 pt-2 border-t border-amber-200">
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-900">
                Submit Missing Documents or Explanation
              </label>
              <textarea
                rows={2}
                placeholder="Clarification message or note for the registrar officer..."
                value={infoReplyNote}
                onChange={(e) => setInfoReplyNote(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-amber-300 bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />

              <FileUploader
                label="Attach Requested Clearances"
                description="Upload PDF or image clearances requested by the registrar"
                files={missingFiles}
                onFilesSelected={(newFiles) => setMissingFiles(newFiles)}
                onRemoveFile={(idx) => setMissingFiles(missingFiles.filter((_, i) => i !== idx))}
              />

              <Button
                type="submit"
                id="submit-information-btn"
                variant="primary"
                size="sm"
                loading={isFulfilling}
              >
                Submit & Resume Evaluation
              </Button>
            </form>
          </div>
        )}

        {/* Ready for Release Notice */}
        {request.status === 'READY_FOR_RELEASE' && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 text-xs flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Official Document Ready for Release</p>
              <p className="mt-1 leading-relaxed">
                Your requested document has been certified and sealed.
                {request.release_method === 'PICKUP' ? (
                  <>
                    {' '}
                    Please present your valid student ID at <strong>Registrar Window 2</strong> with Request No.{' '}
                    <strong>{request.request_number}</strong> to claim.
                  </>
                ) : request.release_method === 'DIGITAL_COPY' ? (
                  <> A certified digital copy is available in the attachments section below.</>
                ) : (
                  <> Your document has been dispatched via courier to {request.delivery_address}.</>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Rejection Notice */}
        {request.status === 'REJECTED' && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-950 text-xs space-y-1">
            <p className="font-bold text-sm flex items-center gap-1.5 text-rose-800">
              <AlertCircle className="w-4 h-4" /> Request Rejected
            </p>
            <p className="leading-relaxed">
              <strong>Reason:</strong> {request.rejection_reason || 'Unspecified reason by registrar.'}
            </p>
          </div>
        )}

        {/* Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">
              Copies Requested
            </span>
            <span className="font-bold text-slate-900 text-sm mt-0.5 block">
              {request.quantity} copy / copies
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">
              Claim Method
            </span>
            <span className="font-bold text-slate-900 text-sm mt-0.5 block">
              {request.release_method.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">
              Fee & Payment
            </span>
            <div className="mt-1">
              <PaymentBadge status={request.payment_status} fee={request.fee} />
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">
              Turnaround Estimate
            </span>
            <span className="font-bold text-slate-900 text-sm mt-0.5 block">
              {request.document_type?.processing_days || 3} working days
            </span>
          </div>
        </div>

        {/* Purpose & Remarks */}
        <div className="space-y-3 pt-2 text-xs border-t border-slate-100">
          <div>
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">
              Request Purpose
            </span>
            <p className="font-medium text-slate-900 mt-0.5">{request.purpose}</p>
          </div>

          {request.remarks && (
            <div>
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">
                Additional Student Remarks
              </span>
              <p className="text-slate-600 italic mt-0.5">{request.remarks}</p>
            </div>
          )}

          {request.release_method === 'COURIER' && request.delivery_address && (
            <div>
              <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">
                Courier Delivery Address
              </span>
              <p className="text-slate-800 mt-0.5">{request.delivery_address}</p>
            </div>
          )}
        </div>

        {/* Uploaded Attachments */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <HardDrive className="w-4 h-4 text-slate-400" />
            Uploaded Documents & Attachments ({request.attachments?.length || 0})
          </h3>

          {!request.attachments || request.attachments.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No attachments submitted for this request.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
      </div>

      {/* 3. Student Requirement Verification & Submissions */}
      <StudentRequirementSubmission request={request} onSubmitted={fetchRequestDetails} />

      {/* 4. Lifecycle Workflow Timeline */}
      <Timeline currentStatus={request.status} history={request.status_history} />

      {/* 4. Cancellation Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancelRequest}
        title="Cancel Document Request"
        message="Are you sure you wish to cancel this official document request? This action cannot be reversed once confirmed."
        confirmText="Confirm Cancellation"
        type="danger"
        requireReason={true}
        reasonLabel="Reason for Cancellation"
        reasonPlaceholder="e.g. No longer needed, duplicate request, etc."
        loading={actionLoading}
      />
    </div>
  );
};
