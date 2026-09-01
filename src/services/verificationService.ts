import { supabase, getSupabaseConfig } from '../lib/supabase';
import {
  RequestRequirementItem,
  RequirementVerificationStatus,
  OverallVerificationStatus,
  RejectionReasonType,
  DocumentReviewItem,
  RequirementSubmissionFile,
} from '../types';
import { mockStore } from './mockStore';
import { storageService } from './storageService';

export interface ReviewRequirementPayload {
  requestId: string;
  requirementId: string;
  status: RequirementVerificationStatus;
  reasonCode?: RejectionReasonType;
  reasonText?: string;
  remarks?: string;
  checklist?: {
    correct_document?: boolean;
    student_info_matches?: boolean;
    required_info_complete?: boolean;
    is_readable?: boolean;
    meets_requirements?: boolean;
  };
  reviewerId: string;
}

export interface UploadRequirementFilesPayload {
  requestId: string;
  requirementId: string;
  files: File[];
  userId: string;
}

export const verificationService = {
  /**
   * Automatically fetch currently configured requirements for a document type
   * and initialize/populate the 'request_requirements' table for a new request.
   */
  async populateRequestRequirements(
    requestId: string,
    documentTypeId: string,
    files?: Array<{ file: File; requirementId?: string }>
  ): Promise<RequestRequirementItem[]> {
    const config = getSupabaseConfig();

    if (config.isConfigured) {
      try {
        // 1. Fetch current configured document requirements
        const { data: docReqs, error: fetchErr } = await supabase
          .from('document_requirements')
          .select('*')
          .eq('document_type_id', documentTypeId);

        if (!fetchErr && docReqs && docReqs.length > 0) {
          // 2. Check if request_requirements already populated (e.g. by database trigger)
          const { data: existingRows, error: checkErr } = await supabase
            .from('request_requirements')
            .select('id')
            .eq('request_id', requestId);

          if (!checkErr && (!existingRows || existingRows.length === 0)) {
            const rowsToInsert = docReqs.map((req) => ({
              request_id: requestId,
              requirement_id: req.id,
              requirement_name: req.requirement_name,
              description: req.description,
              is_mandatory: req.is_mandatory,
              file_type: req.file_type || 'PDF, JPG, PNG',
              max_file_size_mb: req.max_file_size_mb || 10,
              allow_multiple: req.allow_multiple || false,
              status: 'NOT_SUBMITTED',
            }));

            await supabase.from('request_requirements').insert(rowsToInsert);
          }
        }
      } catch (err) {
        console.warn('Could not populate database request_requirements table:', err);
      }
    }

    return mockStore.populateRequestRequirements(requestId, documentTypeId, files);
  },

  /**
   * Get all requirement verification items for a given document request
   */
  async getRequestRequirements(requestId: string): Promise<RequestRequirementItem[]> {
    const config = getSupabaseConfig();
    if (!config.isConfigured) {
      return mockStore.getRequirementsForRequest(requestId);
    }

    try {
      // In Supabase mode, attempt to fetch from request_requirements
      const { data: reqRows, error } = await supabase
        .from('request_requirements')
        .select('*')
        .eq('request_id', requestId);

      if (!error && reqRows && reqRows.length > 0) {
        // Combine with mockStore / attachments for full review item details
        return mockStore.getRequirementsForRequest(requestId);
      }
      return mockStore.getRequirementsForRequest(requestId);
    } catch (err) {
      console.error('Error fetching request requirements:', err);
      return mockStore.getRequirementsForRequest(requestId);
    }
  },

  /**
   * Submit or resubmit files for a specific requirement
   */
  async submitRequirementFiles(payload: UploadRequirementFilesPayload): Promise<RequestRequirementItem> {
    const uploadedFiles: RequirementSubmissionFile[] = [];

    for (const file of payload.files) {
      try {
        const uploadRes = await storageService.uploadFile(file, payload.userId, payload.requestId);
        let previewUrl: string | undefined;
        try {
          previewUrl = await storageService.getSignedUrl(uploadRes.storagePath);
        } catch (e) {
          // ignore
        }

        const subFile: RequirementSubmissionFile = {
          id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          file_name: uploadRes.fileName,
          storage_path: uploadRes.storagePath,
          file_size: uploadRes.fileSize,
          mime_type: uploadRes.mimeType,
          preview_url: previewUrl,
          uploaded_at: new Date().toISOString(),
        };
        uploadedFiles.push(subFile);

        // Also save record to general request_attachments table
        await storageService.saveAttachmentRecord({
          request_id: payload.requestId,
          uploaded_by: payload.userId,
          requirement_id: payload.requirementId,
          file_name: uploadRes.fileName,
          storage_path: uploadRes.storagePath,
          file_size: uploadRes.fileSize,
          mime_type: uploadRes.mimeType,
        });
      } catch (err) {
        console.error('Error uploading requirement file:', file.name, err);
      }
    }

    return mockStore.submitRequirementFiles({
      requestId: payload.requestId,
      requirementId: payload.requirementId,
      files: uploadedFiles,
      userId: payload.userId,
    });
  },

  /**
   * Record a review decision (Approve, Reject, Needs Resubmission, N/A) for a requirement
   */
  async reviewRequirement(payload: ReviewRequirementPayload): Promise<RequestRequirementItem> {
    return mockStore.reviewRequirement({
      requestId: payload.requestId,
      requirementId: payload.requirementId,
      status: payload.status,
      reasonCode: payload.reasonCode,
      reasonText: payload.reasonText,
      remarks: payload.remarks,
      checklist: payload.checklist,
      reviewerId: payload.reviewerId,
    });
  },

  /**
   * Batch approve all submitted requirements for a request
   */
  async batchApproveAll(requestId: string, reviewerId: string, remarks?: string): Promise<RequestRequirementItem[]> {
    return mockStore.batchVerifyAllRequirements(requestId, 'APPROVED', reviewerId, remarks);
  },

  /**
   * Compute the overall verification status and summary metrics for a list of requirement items
   */
  calculateOverallStatus(items: RequestRequirementItem[]): {
    status: OverallVerificationStatus;
    totalCount: number;
    mandatoryCount: number;
    approvedCount: number;
    underReviewCount: number;
    actionRequiredCount: number;
    missingCount: number;
    notApplicableCount: number;
    isFullyVerified: boolean;
  } {
    if (!items || items.length === 0) {
      return {
        status: 'VERIFIED',
        totalCount: 0,
        mandatoryCount: 0,
        approvedCount: 0,
        underReviewCount: 0,
        actionRequiredCount: 0,
        missingCount: 0,
        notApplicableCount: 0,
        isFullyVerified: true,
      };
    }

    const mandatoryItems = items.filter((item) => item.is_mandatory);
    const approvedCount = items.filter((item) => item.current_status === 'APPROVED').length;
    const underReviewCount = items.filter(
      (item) => item.current_status === 'UNDER_REVIEW' || item.current_status === 'UPLOADED'
    ).length;
    const actionRequiredCount = items.filter(
      (item) => item.current_status === 'REJECTED' || item.current_status === 'NEEDS_RESUBMISSION'
    ).length;
    const missingCount = items.filter((item) => item.current_status === 'NOT_SUBMITTED').length;
    const notApplicableCount = items.filter((item) => item.current_status === 'NOT_APPLICABLE').length;

    // Check mandatory fulfillment
    const allMandatoryApprovedOrNA = mandatoryItems.every(
      (item) => item.current_status === 'APPROVED' || item.current_status === 'NOT_APPLICABLE'
    );

    let status: OverallVerificationStatus = 'UNDER_REVIEW';

    if (allMandatoryApprovedOrNA) {
      status = 'VERIFIED';
    } else if (mandatoryItems.some((item) => item.current_status === 'REJECTED' || item.current_status === 'NEEDS_RESUBMISSION')) {
      status = 'ACTION_REQUIRED';
    } else if (mandatoryItems.some((item) => item.current_status === 'NOT_SUBMITTED')) {
      status = 'INCOMPLETE';
    } else {
      status = 'UNDER_REVIEW';
    }

    return {
      status,
      totalCount: items.length,
      mandatoryCount: mandatoryItems.length,
      approvedCount,
      underReviewCount,
      actionRequiredCount,
      missingCount,
      notApplicableCount,
      isFullyVerified: allMandatoryApprovedOrNA,
    };
  },
};
