import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  FileX2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Download,
  ExternalLink,
  ShieldCheck,
  History,
  FileText,
  Upload,
  ChevronRight,
  Info,
  Check,
  RefreshCw,
  Sparkles,
  HelpCircle,
  Calendar,
  User,
  AlertCircle,
  Layers,
  Search,
  Filter,
} from 'lucide-react';
import {
  RequestRequirementItem,
  RequirementVerificationStatus,
  OverallVerificationStatus,
  RejectionReasonType,
  DocumentReviewItem,
  RequirementSubmissionFile,
  DocumentRequest,
} from '../types';
import { verificationService } from '../services/verificationService';
import { useAuth } from '../contexts/AuthContext';

interface DocumentReviewWorkspaceProps {
  request: DocumentRequest;
  onVerificationUpdated?: () => void;
  canReview?: boolean; // Whether current user can make review decisions (Staff/Admin)
}

const REJECTION_REASON_OPTIONS: { code: RejectionReasonType; label: string; defaultNote: string }[] = [
  {
    code: 'WRONG_DOCUMENT',
    label: 'Wrong Document Type Uploaded',
    defaultNote: 'The uploaded file does not match the requested requirement. Please upload the correct document.',
  },
  {
    code: 'MISSING_INFORMATION',
    label: 'Missing Pages or Required Signatures/Seals',
    defaultNote: 'Document is missing required sections, departmental stamps, or official authorized signatures.',
  },
  {
    code: 'UNREADABLE_DOCUMENT',
    label: 'Blurry, Illegible, or Low-Resolution Scan',
    defaultNote: 'The document text or seal is blurry and unreadable. Please provide a clear, high-resolution flat scan.',
  },
  {
    code: 'STUDENT_INFO_MISMATCH',
    label: 'Student Name or ID Mismatch',
    defaultNote: 'The name or student number on the document does not match the requester account profile.',
  },
  {
    code: 'EXPIRED_DOCUMENT',
    label: 'Expired or Outdated Document',
    defaultNote: 'The document has lapsed its validity period or was issued for a previous academic year.',
  },
  {
    code: 'INCOMPLETE_DOCUMENT',
    label: 'Incomplete University Clearance',
    defaultNote: 'Not all clearing departments (Library, Accounting, OSA, Dean) have signed off.',
  },
  {
    code: 'OTHER',
    label: 'Other / Custom Reason',
    defaultNote: '',
  },
];

export const DocumentReviewWorkspace: React.FC<DocumentReviewWorkspaceProps> = ({
  request,
  onVerificationUpdated,
  canReview = true,
}) => {
  const { user } = useAuth();
  const [items, setItems] = useState<RequestRequirementItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedVersionIndex, setSelectedVersionIndex] = useState<number>(0);
  const [selectedFileIndex, setSelectedFileIndex] = useState<number>(0);
  const [filterTab, setFilterTab] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'ACTION_REQUIRED'>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Viewer Controls
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);

  // Review Form State
  const [activeDecision, setActiveDecision] = useState<RequirementVerificationStatus | null>(null);
  const [selectedReasonCode, setSelectedReasonCode] = useState<RejectionReasonType>('WRONG_DOCUMENT');
  const [reasonRemarks, setReasonRemarks] = useState<string>('');
  const [checklist, setChecklist] = useState({
    correct_document: true,
    student_info_matches: true,
    required_info_complete: true,
    is_readable: true,
    meets_requirements: true,
  });

  // Batch Approval Modal State
  const [showBatchModal, setShowBatchModal] = useState<boolean>(false);

  // Load Requirement Items
  useEffect(() => {
    loadRequirements();
  }, [request.id]);

  const loadRequirements = async () => {
    setIsLoading(true);
    try {
      const data = await verificationService.getRequestRequirements(request.id);
      setItems(data);
      if (data.length > 0) {
        // If current selection is invalid, select the first or first pending
        if (!selectedItemId || !data.some((d) => d.id === selectedItemId)) {
          const firstPending = data.find((d) => d.current_status === 'UNDER_REVIEW' || d.current_status === 'UPLOADED');
          setSelectedItemId(firstPending ? firstPending.id : data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load requirements:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedItem = items.find((i) => i.id === selectedItemId);

  // Determine current active review version
  const currentHistory = selectedItem?.version_history || [];
  const activeVersionItem = currentHistory[selectedVersionIndex] || (selectedItem ? {
    id: 'active',
    version: selectedItem.current_version,
    status: selectedItem.current_status,
    reviewer_name: selectedItem.latest_reviewer_name,
    review_date: selectedItem.latest_review_date,
    remarks: selectedItem.latest_remarks,
    rejection_reason_text: selectedItem.latest_reason,
    files: selectedItem.latest_files,
    created_at: request.created_at,
  } : null);

  const activeFiles = activeVersionItem?.files || selectedItem?.latest_files || [];
  const activeFile = activeFiles[selectedFileIndex] || activeFiles[0] || null;

  // Reset viewer controls when file changes
  useEffect(() => {
    setZoomLevel(100);
    setRotation(0);
    setActiveDecision(null);
    setReasonRemarks('');
  }, [selectedItemId, selectedVersionIndex, selectedFileIndex]);

  // Overall statistics
  const summary = verificationService.calculateOverallStatus(items);

  // Filtered requirements list
  const filteredItems = items.filter((item) => {
    if (filterTab === 'PENDING') {
      return item.current_status === 'UNDER_REVIEW' || item.current_status === 'UPLOADED';
    }
    if (filterTab === 'APPROVED') {
      return item.current_status === 'APPROVED' || item.current_status === 'NOT_APPLICABLE';
    }
    if (filterTab === 'ACTION_REQUIRED') {
      return (
        item.current_status === 'REJECTED' ||
        item.current_status === 'NEEDS_RESUBMISSION' ||
        item.current_status === 'NOT_SUBMITTED'
      );
    }
    return true;
  });

  // Handle Review Submission
  const handleDecisionSubmit = async (status: RequirementVerificationStatus) => {
    if (!selectedItem || !user) return;
    setIsSubmitting(true);
    try {
      let finalReason = reasonRemarks;
      if (status === 'REJECTED' || status === 'NEEDS_RESUBMISSION') {
        const option = REJECTION_REASON_OPTIONS.find((o) => o.code === selectedReasonCode);
        if (!finalReason) {
          finalReason = option?.defaultNote || option?.label || 'Requirement does not meet university registrar specifications.';
        }
      }

      await verificationService.reviewRequirement({
        requestId: request.id,
        requirementId: selectedItem.requirement_id || selectedItem.id,
        status,
        reasonCode: status === 'REJECTED' || status === 'NEEDS_RESUBMISSION' ? selectedReasonCode : undefined,
        reasonText: status === 'REJECTED' || status === 'NEEDS_RESUBMISSION' ? finalReason : undefined,
        remarks: finalReason || (status === 'APPROVED' ? 'Verified and approved by registrar evaluation.' : undefined),
        checklist,
        reviewerId: user.id,
      });

      setSuccessMessage(`Requirement "${selectedItem.requirement_name}" marked as ${status.replace(/_/g, ' ')}.`);
      setTimeout(() => setSuccessMessage(null), 4000);

      // Refresh requirements
      await loadRequirements();
      if (onVerificationUpdated) onVerificationUpdated();
    } catch (err) {
      console.error('Failed to submit review decision:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Batch Approval
  const handleBatchApprove = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      await verificationService.batchApproveAll(
        request.id,
        user.id,
        'Batch verification completed: all submitted requirements validated against registrar standards.'
      );
      setShowBatchModal(false);
      setSuccessMessage('All submitted requirements have been approved.');
      setTimeout(() => setSuccessMessage(null), 4000);
      await loadRequirements();
      if (onVerificationUpdated) onVerificationUpdated();
    } catch (err) {
      console.error('Failed batch verification:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: RequirementVerificationStatus) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Approved
          </span>
        );
      case 'UNDER_REVIEW':
      case 'UPLOADED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5" />
            Under Review
          </span>
        );
      case 'NEEDS_RESUBMISSION':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <RefreshCw className="w-3.5 h-3.5" />
            Needs Resubmission
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            Rejected
          </span>
        );
      case 'NOT_APPLICABLE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            N/A
          </span>
        );
      case 'NOT_SUBMITTED':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-600 border border-zinc-200">
            <AlertCircle className="w-3.5 h-3.5" />
            Not Submitted
          </span>
        );
    }
  };

  const getOverallBadge = (status: OverallVerificationStatus) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-100/80 border border-emerald-300 text-emerald-800 font-medium text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Requirements Verified (Ready to Process)</span>
          </div>
        );
      case 'ACTION_REQUIRED':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-100/80 border border-amber-300 text-amber-800 font-medium text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Action Required (Resubmission / Rejection)</span>
          </div>
        );
      case 'INCOMPLETE':
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-100/80 border border-rose-300 text-rose-800 font-medium text-xs">
            <XCircle className="w-4 h-4 text-rose-600" />
            <span>Missing Mandatory Requirements</span>
          </div>
        );
      case 'UNDER_REVIEW':
      default:
        return (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-100/80 border border-blue-300 text-blue-800 font-medium text-xs">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Requirements Pending Review</span>
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* 1. Header Banner & Verification Summary */}
      <div className="bg-slate-900 text-white p-4 sm:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
                  Document Clearance & Requirement Verification
                </h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                  {request.document_type?.code || 'DOC'} Workflow
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Audit student-uploaded files, inspect credentials, and authorize document clearance prior to release.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {getOverallBadge(summary.status)}

          {canReview && summary.underReviewCount > 0 && (
            <button
              onClick={() => setShowBatchModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Batch Approve ({summary.underReviewCount})
            </button>
          )}
        </div>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2.5 flex items-center gap-2 text-xs font-medium text-emerald-800 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Metric Highlights Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 divide-x divide-y sm:divide-y-0 divide-slate-200 bg-slate-50 border-b border-slate-200 text-xs">
        <div className="p-3 text-center">
          <div className="text-slate-500 text-[11px] font-medium uppercase tracking-wider">Total Requirements</div>
          <div className="text-base font-bold text-slate-800 mt-0.5">{summary.totalCount}</div>
        </div>
        <div className="p-3 text-center bg-emerald-50/50">
          <div className="text-emerald-700 text-[11px] font-medium uppercase tracking-wider">Approved</div>
          <div className="text-base font-bold text-emerald-700 mt-0.5">{summary.approvedCount}</div>
        </div>
        <div className="p-3 text-center bg-blue-50/50">
          <div className="text-blue-700 text-[11px] font-medium uppercase tracking-wider">Under Review</div>
          <div className="text-base font-bold text-blue-700 mt-0.5">{summary.underReviewCount}</div>
        </div>
        <div className="p-3 text-center bg-amber-50/50">
          <div className="text-amber-700 text-[11px] font-medium uppercase tracking-wider">Action Needed</div>
          <div className="text-base font-bold text-amber-700 mt-0.5">{summary.actionRequiredCount}</div>
        </div>
        <div className="p-3 text-center col-span-2 sm:col-span-1">
          <div className="text-slate-500 text-[11px] font-medium uppercase tracking-wider">Missing Submissions</div>
          <div className="text-base font-bold text-rose-600 mt-0.5">{summary.missingCount}</div>
        </div>
      </div>

      {/* 2. Main Two-Pane Verification Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        {/* LEFT PANE: Requirements Navigation (5 Cols on Large) */}
        <div className="lg:col-span-4 xl:col-span-4 border-r border-slate-200 flex flex-col bg-slate-50/70">
          {/* Quick Filter Tabs */}
          <div className="p-3 border-b border-slate-200 bg-white flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setFilterTab('ALL')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                filterTab === 'ALL'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              All ({items.length})
            </button>
            <button
              onClick={() => setFilterTab('PENDING')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                filterTab === 'PENDING'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Pending ({summary.underReviewCount})
            </button>
            <button
              onClick={() => setFilterTab('APPROVED')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                filterTab === 'APPROVED'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Approved ({summary.approvedCount})
            </button>
            <button
              onClick={() => setFilterTab('ACTION_REQUIRED')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                filterTab === 'ACTION_REQUIRED'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Action Req. ({summary.actionRequiredCount})
            </button>
          </div>

          {/* Requirements Cards List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {filteredItems.length === 0 ? (
              <div className="text-center py-10 px-4">
                <FileCheck2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-medium">No requirements match the active filter.</p>
              </div>
            ) : (
              filteredItems.map((item, idx) => {
                const isSelected = item.id === selectedItemId;
                const fileCount = item.latest_files?.length || 0;

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedItemId(item.id);
                      setSelectedVersionIndex(0);
                      setSelectedFileIndex(0);
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-white border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] font-bold text-slate-400">#{idx + 1}</span>
                          <h4 className="text-xs sm:text-sm font-semibold text-slate-900 truncate">
                            {item.requirement_name}
                          </h4>
                          {item.is_mandatory && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase bg-rose-50 text-rose-600 border border-rose-200">
                              Mandatory
                            </span>
                          )}
                        </div>

                        {item.description && (
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                      </div>

                      <div className="flex-shrink-0 flex flex-col items-end gap-1">
                        {getStatusBadge(item.current_status)}
                        {item.current_version > 0 && (
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            v{item.current_version}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Files indicator & sign-off snippet */}
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <div className="flex items-center gap-1.5 font-medium">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {fileCount} {fileCount === 1 ? 'file' : 'files'} attached
                        </span>
                      </div>

                      {item.latest_reviewer_name ? (
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium truncate max-w-[140px]">
                          Reviewed by {item.latest_reviewer_name.split(' ')[0]}
                        </span>
                      ) : item.current_status === 'NOT_SUBMITTED' ? (
                        <span className="text-[10px] text-rose-600 font-medium">Awaiting upload</span>
                      ) : (
                        <span className="text-[10px] text-blue-600 font-medium">Ready for review</span>
                      )}
                    </div>

                    {/* Rejection / Resubmission Reason Snippet */}
                    {(item.current_status === 'NEEDS_RESUBMISSION' || item.current_status === 'REJECTED') && item.latest_reason && (
                      <div className="mt-2 p-2 rounded-lg bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 leading-snug">
                        <div className="font-semibold flex items-center gap-1 text-amber-800">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          Remarks:
                        </div>
                        <p className="mt-0.5 text-amber-800/90">{item.latest_reason}</p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT PANE: Interactive File Viewer & Review Decision Workspace (8 Cols) */}
        <div className="lg:col-span-8 xl:col-span-8 flex flex-col bg-white">
          {!selectedItem ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <FileCheck2 className="w-12 h-12 text-slate-300 mb-3" />
              <h3 className="text-sm font-semibold text-slate-700">Select a Requirement to Review</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Choose an item from the checklist on the left to inspect uploaded documents and apply clearance sign-off.
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              {/* Workspace Header Toolbar */}
              <div className="p-3.5 sm:p-4 border-b border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      {selectedItem.requirement_name}
                    </h3>
                    {getStatusBadge(selectedItem.current_status)}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Accepted format: <span className="font-medium text-slate-700">{selectedItem.file_type || 'PDF, JPG, PNG'}</span>
                    {' • '}
                    Max size: <span className="font-medium text-slate-700">{selectedItem.max_file_size_mb || 10} MB</span>
                  </p>
                </div>

                {/* Version Selector Dropdown */}
                {currentHistory.length > 1 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                      <History className="w-3.5 h-3.5 text-slate-400" />
                      Version:
                    </span>
                    <select
                      value={selectedVersionIndex}
                      onChange={(e) => {
                        setSelectedVersionIndex(Number(e.target.value));
                        setSelectedFileIndex(0);
                      }}
                      className="px-2.5 py-1 text-xs font-medium border border-slate-300 rounded-lg bg-white shadow-sm focus:ring-2 focus:ring-indigo-500"
                    >
                      {currentHistory.map((ver, idx) => (
                        <option key={ver.id || idx} value={idx}>
                          Version {ver.version} ({ver.status.replace(/_/g, ' ')})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Multiple Files Tab Bar (if requirement contains >1 attachment) */}
              {activeFiles.length > 1 && (
                <div className="px-4 py-2 bg-slate-100/70 border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Files ({activeFiles.length}):
                  </span>
                  {activeFiles.map((f, fIdx) => (
                    <button
                      key={f.id || fIdx}
                      onClick={() => setSelectedFileIndex(fIdx)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                        selectedFileIndex === fIdx
                          ? 'bg-white text-indigo-700 shadow-sm border border-slate-300'
                          : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <FileText className="w-3 h-3 text-slate-400" />
                      <span className="truncate max-w-[140px]">{f.file_name}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Interactive File Preview Canvas */}
              <div className="flex-1 bg-slate-900/95 relative flex flex-col min-h-[340px] overflow-hidden">
                {/* Canvas Floating Toolbar */}
                {activeFile && (
                  <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-slate-900/80 backdrop-blur border border-slate-700/80 rounded-lg p-1 shadow-lg text-white">
                    <button
                      onClick={() => setZoomLevel((prev) => Math.max(50, prev - 25))}
                      title="Zoom Out"
                      className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] font-mono px-1.5 text-slate-300">{zoomLevel}%</span>
                    <button
                      onClick={() => setZoomLevel((prev) => Math.min(250, prev + 25))}
                      title="Zoom In"
                      className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setRotation((prev) => (prev + 90) % 360)}
                      title="Rotate 90°"
                      className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                    </button>
                    <div className="h-4 w-px bg-slate-700 mx-1" />
                    {activeFile.preview_url && (
                      <a
                        href={activeFile.preview_url}
                        target="_blank"
                        rel="noreferrer"
                        title="Open in new tab"
                        className="p-1.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                )}

                {/* Document Render Area */}
                <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
                  {!activeFile ? (
                    <div className="text-center p-8 max-w-sm">
                      <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
                        <Upload className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-semibold text-slate-200">No Document Uploaded Yet</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        The student has not yet submitted a file for this requirement. Once submitted, you can preview
                        and inspect it here.
                      </p>
                    </div>
                  ) : (
                    <div
                      className="transition-transform duration-200 ease-out origin-center"
                      style={{
                        transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                      }}
                    >
                      {/* Realistic University Document Simulation / Live Image Rendering */}
                      <div className="bg-white rounded-lg shadow-2xl border border-slate-300 text-slate-900 w-[420px] sm:w-[480px] min-h-[580px] p-6 flex flex-col justify-between relative overflow-hidden select-none">
                        {/* University Watermark Background */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                          <div className="text-6xl font-serif font-black text-slate-900 transform -rotate-45 text-center leading-tight">
                            IBA COLLEGE OF MINDANAO<br />OFFICIAL CLEARANCE
                          </div>
                        </div>

                        {/* Document Header */}
                        <div>
                          <div className="text-center border-b pb-4 border-slate-200">
                            <div className="text-[10px] tracking-widest uppercase font-bold text-slate-500">
                              Republic of the Philippines
                            </div>
                            <div className="text-sm font-serif font-bold text-slate-900 uppercase tracking-wide mt-0.5">
                              IBA College of Mindanao
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Office of the University Registrar • Student Records Division
                            </div>
                            <div className="mt-2 inline-block px-2.5 py-0.5 bg-slate-100 rounded text-[11px] font-semibold text-slate-700 border border-slate-200">
                              REQUIREMENT SUBMISSION: {selectedItem.requirement_name.toUpperCase()}
                            </div>
                          </div>

                          {/* Student Identification Meta Table */}
                          <div className="mt-4 bg-slate-50 p-3 rounded border border-slate-200 text-[11px] space-y-1.5">
                            <div className="flex justify-between">
                              <span className="text-slate-500 font-medium">Student Name:</span>
                              <span className="font-bold text-slate-900">
                                {request.student?.user?.full_name || 'Juan Dela Cruz'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500 font-medium">Student ID Number:</span>
                              <span className="font-mono font-semibold text-slate-800">
                                {request.student?.student_id || 'STU-2024-0891'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500 font-medium">Degree Program:</span>
                              <span className="font-medium text-slate-800">
                                {request.student?.program || 'Bachelor of Science in Computer Science'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500 font-medium">Target Document:</span>
                              <span className="font-medium text-indigo-700">
                                {request.document_type?.name || 'Official Academic Record'}
                              </span>
                            </div>
                          </div>

                          {/* Requirement Content / Visual Preview */}
                          <div className="mt-4 p-3.5 border border-dashed border-slate-300 rounded-lg bg-slate-50/50">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="w-4 h-4 text-indigo-600" />
                              <span className="text-xs font-semibold text-slate-800 truncate">
                                {activeFile.file_name}
                              </span>
                            </div>

                            {/* Embedded Document Photo or Scan Placeholder */}
                            <div className="w-full h-44 rounded border border-slate-200 overflow-hidden bg-white relative flex items-center justify-center">
                              {activeFile.preview_url ? (
                                <img
                                  src={activeFile.preview_url}
                                  alt={activeFile.file_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="text-center p-4 text-slate-400">
                                  <FileText className="w-8 h-8 mx-auto mb-1 text-slate-300" />
                                  <span className="text-[11px]">Previewing document scan</span>
                                </div>
                              )}

                              {/* Official Certified Seal Stamp Overlay */}
                              {selectedItem.current_status === 'APPROVED' && (
                                <div className="absolute bottom-2 right-2 border-2 border-emerald-600 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase text-emerald-700 bg-white/95 shadow transform -rotate-12">
                                  ✓ REGISTRAR VERIFIED
                                </div>
                              )}
                            </div>

                            <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                              <span>
                                Size: {activeFile.file_size ? `${(activeFile.file_size / 1024).toFixed(1)} KB` : '420 KB'}
                              </span>
                              <span>Uploaded: {new Date(activeFile.uploaded_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Document Footer with Authentication Notation */}
                        <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
                          <span>Ref: {request.request_number}</span>
                          <span className="font-mono">VER-CODE-{request.id.slice(-6).toUpperCase()}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Reviewer Evaluation & Decision Console */}
              {canReview && (
                <div className="p-4 bg-slate-50 border-t border-slate-200">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                        Evaluation Checklist & Registrar Decision
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Sign-off as <strong className="text-slate-700">{user?.full_name || 'Staff'}</strong>
                    </span>
                  </div>

                  {/* Checklist Criteria Checkboxes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-4 bg-white p-3 rounded-lg border border-slate-200 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={checklist.correct_document}
                        onChange={(e) => setChecklist({ ...checklist, correct_document: e.target.checked })}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Correct document type</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={checklist.student_info_matches}
                        onChange={(e) => setChecklist({ ...checklist, student_info_matches: e.target.checked })}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Student ID & Name match</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={checklist.is_readable}
                        onChange={(e) => setChecklist({ ...checklist, is_readable: e.target.checked })}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Clean & legible scan</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={checklist.required_info_complete}
                        onChange={(e) => setChecklist({ ...checklist, required_info_complete: e.target.checked })}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Signatures & seals present</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={checklist.meets_requirements}
                        onChange={(e) => setChecklist({ ...checklist, meets_requirements: e.target.checked })}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Within validity period</span>
                    </label>
                  </div>

                  {/* If Rejection or Resubmission is selected, show reason dropdown */}
                  {activeDecision && (activeDecision === 'REJECTED' || activeDecision === 'NEEDS_RESUBMISSION') && (
                    <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs animate-fadeIn space-y-2">
                      <label className="block font-semibold text-amber-900">
                        Select Reason for {activeDecision === 'NEEDS_RESUBMISSION' ? 'Resubmission Request' : 'Rejection'}:
                      </label>
                      <select
                        value={selectedReasonCode}
                        onChange={(e) => {
                          const code = e.target.value as RejectionReasonType;
                          setSelectedReasonCode(code);
                          const opt = REJECTION_REASON_OPTIONS.find((o) => o.code === code);
                          if (opt && opt.defaultNote) {
                            setReasonRemarks(opt.defaultNote);
                          }
                        }}
                        className="w-full px-3 py-1.5 border border-amber-300 rounded bg-white text-slate-900 focus:ring-2 focus:ring-amber-500"
                      >
                        {REJECTION_REASON_OPTIONS.map((opt) => (
                          <option key={opt.code} value={opt.code}>
                            {opt.label}
                          </option>
                        ))}
                      </select>

                      <div>
                        <label className="block text-[11px] font-medium text-amber-800 mt-1">
                          Specific instructions or remarks to student:
                        </label>
                        <textarea
                          rows={2}
                          value={reasonRemarks}
                          onChange={(e) => setReasonRemarks(e.target.value)}
                          placeholder="Provide clear guidance on what the student needs to fix..."
                          className="w-full mt-1 p-2 text-xs border border-amber-300 rounded bg-white text-slate-900 focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* Decision Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {/* Approve Button */}
                      <button
                        id="btn-approve-requirement"
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => handleDecisionSubmit('APPROVED')}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Approve Requirement
                      </button>

                      {/* Request Resubmission Button */}
                      <button
                        id="btn-request-resubmission"
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => {
                          if (activeDecision === 'NEEDS_RESUBMISSION') {
                            handleDecisionSubmit('NEEDS_RESUBMISSION');
                          } else {
                            setActiveDecision('NEEDS_RESUBMISSION');
                            const opt = REJECTION_REASON_OPTIONS[0];
                            setReasonRemarks(opt.defaultNote);
                          }
                        }}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors border shadow-sm ${
                          activeDecision === 'NEEDS_RESUBMISSION'
                            ? 'bg-amber-600 text-white border-amber-700 ring-2 ring-amber-400'
                            : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                        }`}
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        {activeDecision === 'NEEDS_RESUBMISSION' ? 'Confirm Resubmission Request' : 'Request Resubmission'}
                      </button>

                      {/* Reject Button */}
                      <button
                        id="btn-reject-requirement"
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => {
                          if (activeDecision === 'REJECTED') {
                            handleDecisionSubmit('REJECTED');
                          } else {
                            setActiveDecision('REJECTED');
                            const opt = REJECTION_REASON_OPTIONS[0];
                            setReasonRemarks(opt.defaultNote);
                          }
                        }}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors border shadow-sm ${
                          activeDecision === 'REJECTED'
                            ? 'bg-rose-600 text-white border-rose-700 ring-2 ring-rose-400'
                            : 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        {activeDecision === 'REJECTED' ? 'Confirm Rejection' : 'Reject Requirement'}
                      </button>
                    </div>

                    <button
                      id="btn-mark-na"
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleDecisionSubmit('NOT_APPLICABLE')}
                      className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded transition-colors"
                    >
                      Mark N/A
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 4. Batch Approve Confirmation Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full p-5 sm:p-6">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Batch Approve Submitted Requirements</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              You are about to batch verify all <strong>{summary.underReviewCount}</strong> currently submitted clearance
              documents for <strong>{request.request_number}</strong>. This will advance the overall clearance state to
              VERIFIED.
            </p>

            <div className="mt-4 p-3 rounded bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="font-semibold text-slate-700">Audit Sign-off:</div>
              <div className="text-slate-600">
                Evaluation Officer: <strong className="text-slate-800">{user?.full_name}</strong>
              </div>
              <div className="text-slate-600">
                Date: <strong>{new Date().toLocaleDateString()}</strong>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                disabled={isSubmitting}
                onClick={() => setShowBatchModal(false)}
                className="px-3.5 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={isSubmitting}
                onClick={handleBatchApprove}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow transition-colors"
              >
                {isSubmitting ? 'Verifying...' : 'Authorize & Batch Approve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
