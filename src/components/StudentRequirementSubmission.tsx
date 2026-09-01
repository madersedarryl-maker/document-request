import React, { useState } from 'react';
import {
  FileCheck2,
  AlertTriangle,
  Upload,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  RefreshCw,
  Info,
  ExternalLink,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  RequestRequirementItem,
  RequirementVerificationStatus,
  RequirementSubmissionFile,
  DocumentRequest,
} from '../types';
import { verificationService } from '../services/verificationService';
import { useAuth } from '../contexts/AuthContext';

interface StudentRequirementSubmissionProps {
  request: DocumentRequest;
  onSubmitted?: () => void;
}

export const StudentRequirementSubmission: React.FC<StudentRequirementSubmissionProps> = ({
  request,
  onSubmitted,
}) => {
  const { user } = useAuth();
  const [items, setItems] = useState<RequestRequirementItem[]>(request.requirement_items || []);
  const [activeUploadId, setActiveUploadId] = useState<string | null>(null);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadFiles(Array.from(e.target.files));
      setErrorMessage(null);
    }
  };

  const handleResubmit = async (requirement: RequestRequirementItem) => {
    if (uploadFiles.length === 0) {
      setErrorMessage('Please select at least one document file to upload.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await verificationService.submitRequirementFiles({
        requestId: request.id,
        requirementId: requirement.requirement_id || requirement.id,
        files: uploadFiles,
        userId: user?.id || 'usr-student-001',
      });

      setSuccessMessage(`Requirement "${requirement.requirement_name}" resubmitted successfully! Our registrar staff will review it shortly.`);
      setTimeout(() => setSuccessMessage(null), 5000);
      setActiveUploadId(null);
      setUploadFiles([]);

      // Reload
      const updated = await verificationService.getRequestRequirements(request.id);
      setItems(updated);
      if (onSubmitted) onSubmitted();
    } catch (err) {
      console.error('Failed to submit files:', err);
      setErrorMessage('Failed to upload file. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: RequirementVerificationStatus) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Approved
          </span>
        );
      case 'UNDER_REVIEW':
      case 'UPLOADED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5" />
            Under Evaluation
          </span>
        );
      case 'NEEDS_RESUBMISSION':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <RefreshCw className="w-3.5 h-3.5" />
            Action Required
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            Rejected
          </span>
        );
      case 'NOT_APPLICABLE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            Not Required
          </span>
        );
      case 'NOT_SUBMITTED':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-600 border border-zinc-200">
            <Upload className="w-3.5 h-3.5" />
            Upload Required
          </span>
        );
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-6">
      {/* Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold">Document Requirements & Verification Status</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Review registrar evaluations and upload required supporting credentials.
            </p>
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {successMessage && (
        <div className="bg-emerald-50 border-b border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-50 border-b border-rose-200 p-3 text-xs text-rose-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Requirement Items */}
      <div className="p-4 sm:p-5 space-y-4">
        {items.map((item, idx) => {
          const isUploading = activeUploadId === item.id;
          const isHistoryOpen = expandedHistoryId === item.id;
          const needsAction =
            item.current_status === 'NEEDS_RESUBMISSION' ||
            item.current_status === 'REJECTED' ||
            item.current_status === 'NOT_SUBMITTED';

          return (
            <div
              key={item.id || idx}
              className={`rounded-xl border transition-all ${
                needsAction
                  ? 'bg-amber-50/40 border-amber-300 shadow-sm'
                  : item.current_status === 'APPROVED'
                  ? 'bg-emerald-50/20 border-emerald-200'
                  : 'bg-white border-slate-200'
              } p-4`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                    <h4 className="text-sm font-bold text-slate-900">{item.requirement_name}</h4>
                    {item.is_mandatory && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-50 text-rose-600 border border-rose-200">
                        Mandatory
                      </span>
                    )}
                    {getStatusBadge(item.current_status)}
                  </div>

                  {item.description && (
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{item.description}</p>
                  )}

                  {/* Rules snippet */}
                  <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-500">
                    <span>
                      Allowed format: <strong className="text-slate-700">{item.file_type || 'PDF, JPG, PNG'}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Max size: <strong className="text-slate-700">{item.max_file_size_mb || 10} MB</strong>
                    </span>
                  </div>

                  {/* Staff Rejection / Resubmission Feedback Box */}
                  {(item.current_status === 'NEEDS_RESUBMISSION' || item.current_status === 'REJECTED') && (
                    <div className="mt-3 p-3 rounded-lg bg-amber-100/70 border border-amber-300 text-xs text-amber-900">
                      <div className="font-bold flex items-center gap-1.5 text-amber-950">
                        <AlertTriangle className="w-4 h-4 text-amber-700" />
                        Registrar Feedback / Reason:
                      </div>
                      <p className="mt-1 text-amber-900 font-medium">
                        {item.latest_reason || 'Please upload an updated and clear copy of this document.'}
                      </p>
                      {item.latest_remarks && (
                        <p className="mt-0.5 text-amber-800 text-[11px]">Note: {item.latest_remarks}</p>
                      )}
                    </div>
                  )}

                  {/* Attached Files List */}
                  {item.latest_files && item.latest_files.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Submitted Files:
                      </div>
                      {item.latest_files.map((file, fIdx) => (
                        <div
                          key={file.id || fIdx}
                          className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                            <span className="font-medium text-slate-800 truncate">{file.file_name}</span>
                            <span className="text-[10px] text-slate-400">
                              ({(file.file_size / 1024).toFixed(0)} KB)
                            </span>
                          </div>
                          {file.preview_url && (
                            <a
                              href={file.preview_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-600 hover:text-indigo-800 font-semibold text-xs flex items-center gap-1"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              View
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Action: Resubmit Button */}
                <div className="flex sm:flex-col items-end gap-2 flex-shrink-0">
                  {needsAction && !isUploading && (
                    <button
                      onClick={() => {
                        setActiveUploadId(item.id);
                        setUploadFiles([]);
                        setErrorMessage(null);
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow transition-colors flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      {item.current_status === 'NOT_SUBMITTED' ? 'Upload Document' : 'Resubmit File'}
                    </button>
                  )}

                  {item.version_history && item.version_history.length > 1 && (
                    <button
                      onClick={() => setExpandedHistoryId(isHistoryOpen ? null : item.id)}
                      className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 font-medium"
                    >
                      <span>Version History</span>
                      {isHistoryOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>

              {/* In-place File Uploader Dropzone */}
              {isUploading && (
                <div className="mt-4 p-4 rounded-xl bg-white border-2 border-dashed border-indigo-300 animate-fadeIn">
                  <div className="text-center">
                    <Upload className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                    <div className="text-xs font-bold text-slate-900">
                      Select replacement file for "{item.requirement_name}"
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Ensure the document is flat, clear, with all stamps and seals visible.
                    </p>

                    <input
                      type="file"
                      id={`file-input-${item.id}`}
                      className="hidden"
                      onChange={handleFileSelect}
                    />

                    <div className="mt-3 flex items-center justify-center gap-2">
                      <label
                        htmlFor={`file-input-${item.id}`}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold cursor-pointer border border-slate-300 transition-colors"
                      >
                        Browse File
                      </label>
                      {uploadFiles.length > 0 && (
                        <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                          {uploadFiles[0].name}
                        </span>
                      )}
                    </div>

                    <div className="mt-4 flex items-center justify-center gap-2">
                      <button
                        onClick={() => setActiveUploadId(null)}
                        className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        disabled={uploadFiles.length === 0 || isSubmitting}
                        onClick={() => handleResubmit(item)}
                        className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow transition-colors disabled:opacity-50"
                      >
                        {isSubmitting ? 'Uploading...' : 'Confirm Upload'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Version History Accordion */}
              {isHistoryOpen && item.version_history && (
                <div className="mt-3 pt-3 border-t border-slate-200 space-y-2 animate-fadeIn">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Evaluation Timeline & Previous Versions
                  </div>
                  {item.version_history.map((hist, hIdx) => (
                    <div key={hist.id || hIdx} className="p-2.5 rounded bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">Version {hist.version}</span>
                        {getStatusBadge(hist.status)}
                      </div>
                      {hist.remarks && <p className="text-slate-600 mt-1 text-[11px]">{hist.remarks}</p>}
                      <div className="text-[10px] text-slate-400 mt-1">
                        {hist.reviewer_name ? `Reviewed by ${hist.reviewer_name} on ` : 'Submitted on '}
                        {new Date(hist.review_date || hist.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
