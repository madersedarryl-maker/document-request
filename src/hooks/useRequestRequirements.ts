import { useState, useEffect, useCallback } from 'react';
import { documentService } from '../services/documentService';
import { verificationService, UploadRequirementFilesPayload, ReviewRequirementPayload } from '../services/verificationService';
import { requestService, SubmitRequestPayload } from '../services/requestService';
import {
  DocumentRequirement,
  RequestRequirementItem,
  DocumentRequest,
  RequirementVerificationStatus,
} from '../types';

/**
 * Hook to fetch and observe currently configured institutional requirements for a document type.
 */
export function useDocumentTypeRequirements(documentTypeId?: string | null) {
  const [requirements, setRequirements] = useState<DocumentRequirement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRequirements = useCallback(async () => {
    if (!documentTypeId) {
      setRequirements([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const docType = await documentService.getDocumentTypeById(documentTypeId);
      setRequirements(docType?.requirements || []);
    } catch (err: any) {
      console.error('Failed to load document type requirements:', err);
      setError(err.message || 'Failed to load requirements.');
    } finally {
      setLoading(false);
    }
  }, [documentTypeId]);

  useEffect(() => {
    loadRequirements();
  }, [loadRequirements]);

  return {
    requirements,
    loading,
    error,
    refresh: loadRequirements,
  };
}

/**
 * Hook to manage request requirements for an active document request.
 * Automatically loads requirement items and provides actions to review or upload.
 */
export function useRequestRequirements(requestId?: string | null) {
  const [requirementItems, setRequirementItems] = useState<RequestRequirementItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRequirements = useCallback(async () => {
    if (!requestId) {
      setRequirementItems([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const items = await verificationService.getRequestRequirements(requestId);
      setRequirementItems(items);
    } catch (err: any) {
      console.error('Failed to load request requirements:', err);
      setError(err.message || 'Failed to load request requirements.');
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    loadRequirements();
  }, [loadRequirements]);

  /**
   * Submit files for a specific requirement
   */
  const submitFiles = async (payload: UploadRequirementFilesPayload) => {
    const updated = await verificationService.submitRequirementFiles(payload);
    await loadRequirements();
    return updated;
  };

  /**
   * Review a requirement
   */
  const reviewRequirement = async (payload: ReviewRequirementPayload) => {
    const updated = await verificationService.reviewRequirement(payload);
    await loadRequirements();
    return updated;
  };

  /**
   * Re-initialize / populate requirements from the document type
   */
  const populateFromDocumentType = async (docTypeId: string, files?: Array<{ file: File; requirementId?: string }>) => {
    if (!requestId) return [];
    const items = await verificationService.populateRequestRequirements(requestId, docTypeId, files);
    setRequirementItems(items);
    return items;
  };

  // Helper stats
  const totalCount = requirementItems.length;
  const mandatoryCount = requirementItems.filter((r) => r.is_mandatory).length;
  const optionalCount = totalCount - mandatoryCount;
  const approvedCount = requirementItems.filter((r) => r.current_status === 'APPROVED' || r.current_status === 'NOT_APPLICABLE').length;
  const pendingCount = requirementItems.filter((r) => r.current_status === 'UNDER_REVIEW' || r.current_status === 'NOT_SUBMITTED').length;
  const actionRequiredCount = requirementItems.filter((r) => r.current_status === 'REJECTED' || r.current_status === 'NEEDS_RESUBMISSION').length;

  const isComplete = mandatoryCount > 0 && requirementItems
    .filter((r) => r.is_mandatory)
    .every((r) => r.current_status === 'APPROVED' || r.current_status === 'NOT_APPLICABLE');

  return {
    requirementItems,
    loading,
    error,
    refresh: loadRequirements,
    submitFiles,
    reviewRequirement,
    populateFromDocumentType,
    stats: {
      totalCount,
      mandatoryCount,
      optionalCount,
      approvedCount,
      pendingCount,
      actionRequiredCount,
      isComplete,
    },
  };
}

/**
 * Hook for creating a new document request.
 * Automatically fetches the currently configured requirements for that document type
 * and populates the 'request_requirements' table to ensure every request is initialized
 * with the current institutional requirements.
 */
export function useCreateDocumentRequest() {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdRequest, setCreatedRequest] = useState<DocumentRequest | null>(null);
  const [initializedRequirements, setInitializedRequirements] = useState<RequestRequirementItem[]>([]);

  const createRequest = async (payload: SubmitRequestPayload): Promise<{
    request: DocumentRequest;
    requirements: RequestRequirementItem[];
  }> => {
    setSubmitting(true);
    setError(null);

    const docTypeId = payload.documentTypeId || payload.document_type_id;
    if (!docTypeId) {
      const err = 'Document type ID is required to create a request.';
      setError(err);
      setSubmitting(false);
      throw new Error(err);
    }

    try {
      // 1. Fetch currently configured requirements for this document type
      const docType = await documentService.getDocumentTypeById(docTypeId);
      const configuredReqs = docType?.requirements || [];

      // 2. Submit the request (this also automatically triggers requirement population)
      const request = await requestService.submitRequest(payload);

      // 3. Ensure 'request_requirements' is populated and retrieve the initialized items
      const populatedItems = await verificationService.populateRequestRequirements(
        request.id,
        docTypeId,
        payload.files
      );

      setCreatedRequest(request);
      setInitializedRequirements(populatedItems);

      return {
        request,
        requirements: populatedItems,
      };
    } catch (err: any) {
      console.error('Error in useCreateDocumentRequest:', err);
      const msg = err.message || 'Failed to submit document request.';
      setError(msg);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setError(null);
    setCreatedRequest(null);
    setInitializedRequirements([]);
  };

  return {
    createRequest,
    submitting,
    error,
    createdRequest,
    initializedRequirements,
    reset,
  };
}
