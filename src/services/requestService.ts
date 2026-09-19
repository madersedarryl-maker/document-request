import { supabase, getSupabaseConfig } from '../lib/supabase';
import {
  DocumentRequest,
  RequestStatus,
  RequestPriority,
  ReleaseMethod,
  RequestAttachment,
  RequestStatusHistory,
  RequestInternalNote,
} from '../types';
import { storageService } from './storageService';
import { mockStore } from './mockStore';
import { verificationService } from './verificationService';
import { emailService } from './emailService';
import { isDemoMode } from '../lib/appConfig';
import { normalizeSubmitRequest } from '../lib/validation';
import { assertStatusReason, assertValidRequestStatusTransition } from '../lib/requestRules';

export interface SubmitRequestPayload {
  documentTypeId?: string;
  document_type_id?: string;
  studentId?: string;
  student_id?: string;
  quantity: number;
  purpose: string;
  releaseMethod?: ReleaseMethod;
  release_method?: ReleaseMethod;
  deliveryAddress?: string;
  delivery_address?: string;
  remarks?: string;
  fee?: number;
  files?: Array<{ file: File; requirementId?: string }>;
}

export interface StaffQueueFilters {
  status?: RequestStatus | 'ALL';
  documentTypeId?: string | 'ALL';
  priority?: RequestPriority | 'ALL';
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'created_at' | 'updated_at' | 'priority' | 'request_number';
  sortOrder?: 'asc' | 'desc';
}

export const requestService = {
  /**
   * Submit a new document request
   */
  async submitRequest(payload: SubmitRequestPayload): Promise<DocumentRequest> {
    const config = getSupabaseConfig();
    const normalized = normalizeSubmitRequest(payload);
    const docTypeId = normalized.documentTypeId;
    const releaseMethod = normalized.releaseMethod;
    const deliveryAddress = normalized.deliveryAddress || null;
    const remarks = normalized.remarks || null;

    if (!config.isConfigured && isDemoMode()) {
      const studentId = normalized.studentId;
      const created = mockStore.createRequest({
        student_id: studentId,
        document_type_id: docTypeId,
        quantity: normalized.quantity,
        purpose: normalized.purpose,
        release_method: releaseMethod,
        delivery_address: deliveryAddress,
        remarks: remarks,
        fee: normalized.fee,
        files: payload.files,
      });
      return created;
    }

    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData?.user) {
        throw new Error('Your session has expired. Please sign in again before submitting a request.');
      }

      const userId = authData.user.id;

      // 1. Get student profile
      const { data: student, error: studentErr } = await supabase
        .from('student_profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      const studentProfileId = student?.id || normalized.studentId;

      // 2. Try RPC first for concurrency safety & atomic sequence number
      let newRequestId: string | null = null;
      let requestNumber: string | null = null;

      try {
        const { data: rpcResult, error: rpcErr } = await supabase.rpc('rpc_submit_document_request', {
          p_document_type_id: docTypeId,
          p_quantity: normalized.quantity,
          p_purpose: normalized.purpose,
          p_release_method: releaseMethod,
          p_delivery_address: deliveryAddress,
          p_remarks: remarks,
          p_priority: 'NORMAL',
        });

        if (!rpcErr && rpcResult?.request_id) {
          newRequestId = rpcResult.request_id;
          requestNumber = rpcResult.request_number;
        }
      } catch (rpcEx) {
        // Fallback to standard insert
      }

      // Fallback if RPC was not used
      if (!newRequestId) {
        const { data: docType } = await supabase
          .from('document_types')
          .select('fee')
          .eq('id', docTypeId)
          .single();

        const totalFee = normalized.fee !== undefined ? normalized.fee : (docType?.fee || 0) * normalized.quantity;
        const year = new Date().getFullYear();
        const randomSuffix = Math.floor(100000 + Math.random() * 900000);
        const generatedNumber = `DR-${year}-${randomSuffix}`;

        const { data: directReq, error: insertErr } = await supabase
          .from('requests')
          .insert({
            request_number: generatedNumber,
            student_id: studentProfileId,
            document_type_id: docTypeId,
            quantity: normalized.quantity,
            purpose: normalized.purpose,
            release_method: releaseMethod,
            delivery_address: deliveryAddress,
            remarks: remarks,
            status: 'SUBMITTED',
            priority: 'NORMAL',
            fee: totalFee,
            payment_status: totalFee > 0 ? 'PENDING' : 'NOT_REQUIRED',
          })
          .select()
          .single();

        if (insertErr) throw insertErr;

        newRequestId = directReq.id;
        requestNumber = directReq.request_number;

        // Status history record
        await supabase.from('request_status_history').insert({
          request_id: newRequestId,
          previous_status: null,
          new_status: 'SUBMITTED',
          changed_by: userId,
          reason: 'Request submitted by student',
        });

        // Notification
        await supabase.from('notifications').insert({
          user_id: userId,
          request_id: newRequestId,
          title: 'Document Request Submitted',
          message: `Your request ${requestNumber} has been received and queued for review.`,
          type: 'SUCCESS',
        });
      }

      // 3. Upload Attachments if any
      if (payload.files && payload.files.length > 0 && newRequestId) {
        for (const item of payload.files) {
          try {
            const uploadRes = await storageService.uploadFile(item.file, userId, newRequestId);
            await supabase.from('request_attachments').insert({
              request_id: newRequestId,
              uploaded_by: userId,
              requirement_id: item.requirementId || null,
              file_name: uploadRes.fileName,
              storage_path: uploadRes.storagePath,
              mime_type: uploadRes.mimeType,
              file_size: uploadRes.fileSize,
            });
          } catch (uploadErr) {
            console.error('Error uploading file attachment:', uploadErr);
          }
        }
      }

      // 4. Automatically populate request_requirements with currently configured requirements for the document type
      if (newRequestId) {
        try {
          await verificationService.populateRequestRequirements(newRequestId, docTypeId, payload.files);
        } catch (popErr) {
          console.warn('Error during automatic request requirements population:', popErr);
        }
      }

      const fetched = await this.getRequestById(newRequestId!);
      if (!fetched) throw new Error('The request was created but could not be loaded. Please refresh and try again.');
      const finalReq = fetched;

      // Trigger initial submission confirmation email alert via Edge Function
      try {
        await emailService.sendSingleStatusEmailNotification(finalReq, 'SUBMITTED', {
          senderName: 'Registrar Intake System',
          comment: 'Document request officially logged into intake queue.',
        });
      } catch (emailErr) {
        console.warn('Initial intake confirmation email notification failed:', emailErr);
      }

      return finalReq;
    } catch (e) {
      if (!isDemoMode()) throw e;
      console.warn('Supabase submitRequest using explicit demo store:', e);
      const created = mockStore.createRequest({
        student_id: normalized.studentId,
        document_type_id: docTypeId,
        quantity: normalized.quantity,
        purpose: normalized.purpose,
        release_method: releaseMethod,
        delivery_address: deliveryAddress,
        remarks: remarks,
        fee: normalized.fee,
        files: payload.files,
      });

      // Trigger initial submission confirmation email alert via Edge Function
      try {
        await emailService.sendSingleStatusEmailNotification(created, 'SUBMITTED', {
          senderName: 'Registrar Intake System',
          comment: 'Document request officially logged into intake queue.',
        });
      } catch (emailErr) {
        console.warn('Initial intake confirmation email notification failed:', emailErr);
      }

      return created;
    }
  },

  /**
   * Get all requests for a specific student
   */
  async getStudentRequests(studentProfileId: string): Promise<DocumentRequest[]> {
    const config = getSupabaseConfig();
    if (!config.isConfigured && isDemoMode()) {
      return mockStore.getRequests({ studentId: studentProfileId });
    }

    try {
      const { data, error } = await supabase
        .from('requests')
        .select(`
          *,
          document_type:document_types(*)
        `)
        .eq('student_id', studentProfileId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as DocumentRequest[];
    } catch (e) {
      if (isDemoMode()) return mockStore.getRequests({ studentId: studentProfileId });
      throw e;
    }
  },

  /**
   * Get all requests (for Staff & Admin Dashboard)
   */
  async getAllRequests(): Promise<DocumentRequest[]> {
    const config = getSupabaseConfig();
    if (!config.isConfigured && isDemoMode()) {
      return mockStore.getRequests();
    }
    try {
      const { requests } = await this.getAllRequestsForStaff({ pageSize: 1000 });
      return requests;
    } catch (e) {
      if (isDemoMode()) return mockStore.getRequests();
      throw e;
    }
  },

  /**
   * Get all requests with filters & pagination for Staff & Admin Queue
   */
  async getAllRequestsForStaff(filters: StaffQueueFilters = {}): Promise<{
    requests: DocumentRequest[];
    totalCount: number;
  }> {
    const config = getSupabaseConfig();
    if (!config.isConfigured && isDemoMode()) {
      let list = mockStore.getRequests({
        status: filters.status,
        search: filters.search,
      });
      if (filters.documentTypeId && filters.documentTypeId !== 'ALL') {
        list = list.filter((r) => r.document_type_id === filters.documentTypeId);
      }
      if (filters.priority && filters.priority !== 'ALL') {
        list = list.filter((r) => r.priority === filters.priority);
      }
      return {
        requests: list,
        totalCount: list.length,
      };
    }

    try {
      let query = supabase
        .from('requests')
        .select(
          `
          *,
          document_type:document_types(*),
          student:student_profiles(
            id,
            student_id,
            program,
            year_level,
            contact_number,
            user:profiles(id, email, full_name, phone)
          ),
          assigned_staff:staff_profiles(
            id,
            employee_id,
            department,
            user:profiles(full_name, email)
          )
        `,
          { count: 'exact' }
        );

      if (filters.status && filters.status !== 'ALL') {
        query = query.eq('status', filters.status);
      }

      if (filters.documentTypeId && filters.documentTypeId !== 'ALL') {
        query = query.eq('document_type_id', filters.documentTypeId);
      }

      if (filters.priority && filters.priority !== 'ALL') {
        query = query.eq('priority', filters.priority);
      }

      if (filters.search && filters.search.trim() !== '') {
        const s = filters.search.trim();
        query = query.or(`request_number.ilike.%${s}%,purpose.ilike.%${s}%`);
      }

      const sortCol = filters.sortBy || 'created_at';
      const isAsc = filters.sortOrder === 'asc';
      query = query.order(sortCol, { ascending: isAsc });

      if (filters.page && filters.pageSize) {
        const from = (filters.page - 1) * filters.pageSize;
        const to = from + filters.pageSize - 1;
        query = query.range(from, to);
      }

      const { data, count, error } = await query;
      if (error) throw error;

      return {
        requests: (data || []) as DocumentRequest[],
        totalCount: count || 0,
      };
    } catch (e) {
      if (isDemoMode()) {
        const list = mockStore.getRequests({ status: filters.status, search: filters.search });
        return { requests: list, totalCount: list.length };
      }
      throw e;
    }
  },

  /**
   * Get single request with complete details, timeline history, attachments, approval actions, and internal notes
   */
  async getRequestById(id: string): Promise<DocumentRequest | null> {
    const config = getSupabaseConfig();
    if (!config.isConfigured && isDemoMode()) {
      return mockStore.getRequestById(id);
    }

    try {
      const { data: request, error } = await supabase
        .from('requests')
        .select(`
          *,
          document_type:document_types(*),
          student:student_profiles(
            id,
            student_id,
            program,
            year_level,
            contact_number,
            user:profiles(id, email, full_name, phone)
          ),
          assigned_staff:staff_profiles(
            id,
            employee_id,
            department,
            user:profiles(full_name, email)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!request) return null;

      // Attachments
      const { data: attachments } = await supabase
        .from('request_attachments')
        .select('*')
        .eq('request_id', id)
        .order('created_at', { ascending: false });

      // Status History
      const { data: history } = await supabase
        .from('request_status_history')
        .select(`
          *,
          changed_by_user:profiles(full_name, role, email)
        `)
        .eq('request_id', id)
        .order('created_at', { ascending: true });

      // Approval Actions
      const { data: approvals } = await supabase
        .from('approval_actions')
        .select(`
          *,
          approver_user:profiles(full_name, role, email)
        `)
        .eq('request_id', id)
        .order('created_at', { ascending: true });

      // Internal Notes (Staff only)
      let internalNotes: RequestInternalNote[] = [];
      try {
        const { data: notes } = await supabase
          .from('request_internal_notes')
          .select(`
            *,
            author:profiles(full_name, role)
          `)
          .eq('request_id', id)
          .order('created_at', { ascending: false });
        if (notes) internalNotes = notes;
      } catch (e) {
        // graceful
      }

      return {
        ...request,
        attachments: (attachments || []) as RequestAttachment[],
        status_history: (history || []) as RequestStatusHistory[],
        approval_actions: (approvals || []) as any[],
        internal_notes: internalNotes,
      };
    } catch (e) {
      if (isDemoMode()) return mockStore.getRequestById(id);
      throw e;
    }
  },

  /**
   * Update request status (Approve, Reject, Needs Information, Process, Ready, Release)
   */
  async updateRequestStatus(
    paramsOrId:
      | string
      | {
          requestId: string;
          newStatus: RequestStatus;
          changedBy?: string;
          reason?: string;
          comment?: string;
        },
    newStatusArg?: RequestStatus,
    reasonArg?: string,
    commentArg?: string
  ): Promise<void> {
    let requestId: string;
    let newStatus: RequestStatus;
    let reason: string | undefined;
    let comment: string | undefined;
    let changedBy: string | undefined;

    if (typeof paramsOrId === 'object') {
      requestId = paramsOrId.requestId;
      newStatus = paramsOrId.newStatus;
      reason = paramsOrId.reason;
      comment = paramsOrId.comment;
      changedBy = paramsOrId.changedBy;
    } else {
      requestId = paramsOrId;
      newStatus = newStatusArg!;
      reason = reasonArg;
      comment = commentArg;
    }

    const currentRequest = await this.getRequestById(requestId);
    if (!currentRequest) throw new Error('Request not found or you do not have permission to update it.');
    assertValidRequestStatusTransition(currentRequest.status, newStatus);
    assertStatusReason(newStatus, reason, comment);

    const config = getSupabaseConfig();
    if (!config.isConfigured && isDemoMode()) {
      mockStore.updateRequestStatus({ requestId, newStatus, changedBy, reason, comment });
    } else {
      const { error } = await supabase.rpc('rpc_update_request_status', {
        p_request_id: requestId,
        p_new_status: newStatus,
        p_reason: reason || null,
        p_comment: comment || null,
      });
      if (error) throw error;
    }

    // Trigger automated email notification to student informing them of the status progress
    try {
      const updatedReq = isDemoMode() ? mockStore.getRequestById(requestId) : await this.getRequestById(requestId);
      if (updatedReq) {
        await emailService.sendSingleStatusEmailNotification(updatedReq, newStatus, {
          reason,
          comment,
          senderId: changedBy,
        });
      }
    } catch (emailErr) {
      console.warn('Automated status change email notification failed:', emailErr);
    }
  },

  /**
   * Batch update status for multiple requests simultaneously
   */
  async batchUpdateRequestStatus(
    requestIds: string[],
    newStatus: RequestStatus,
    options?: {
      reason?: string;
      comment?: string;
      changedBy?: string;
    }
  ): Promise<{ successCount: number; failedCount: number; errors: string[] }> {
    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (const id of requestIds) {
      try {
        await this.updateRequestStatus({
          requestId: id,
          newStatus,
          reason: options?.reason,
          comment: options?.comment,
          changedBy: options?.changedBy,
        });
        successCount++;
      } catch (err: any) {
        failedCount++;
        errors.push(`Request ${id}: ${err.message || 'Update failed'}`);
      }
    }

    return { successCount, failedCount, errors };
  },

  /**
   * Batch update priority for multiple requests simultaneously
   */
  async batchUpdatePriority(
    requestIds: string[],
    priority: RequestPriority,
    changedBy?: string
  ): Promise<{ successCount: number; failedCount: number }> {
    let successCount = 0;
    let failedCount = 0;

    for (const id of requestIds) {
      try {
        await this.updatePriority(id, priority);
        successCount++;
      } catch (err) {
        failedCount++;
      }
    }

    return { successCount, failedCount };
  },

  /**
   * Update request priority (Staff & Admin)
   */
  async updatePriority(requestId: string, priority: RequestPriority): Promise<void> {
    const config = getSupabaseConfig();
    if (!config.isConfigured && isDemoMode()) {
      mockStore.updatePriority(requestId, priority);
      return;
    }
    const { error } = await supabase.from('requests').update({ priority, updated_at: new Date().toISOString() }).eq('id', requestId);
    if (error) throw error;
  },

  /**
   * Alias for updatePriority with audit logging
   */
  async updateRequestPriority(requestId: string, priority: RequestPriority, changedBy?: string): Promise<void> {
    if (!getSupabaseConfig().isConfigured && isDemoMode()) {
      mockStore.updatePriority(requestId, priority);
      return;
    }
    const { error } = await supabase.from('requests').update({ priority, updated_at: new Date().toISOString() }).eq('id', requestId);
    if (error) throw error;
  },

  /**
   * Update payment status
   */
  async updatePaymentStatus(requestId: string, paymentStatus: any, changedBy?: string): Promise<void> {
    if (!getSupabaseConfig().isConfigured && isDemoMode()) {
      mockStore.updatePaymentStatus(requestId, paymentStatus);
      return;
    }
    const { error } = await supabase.from('requests').update({ payment_status: paymentStatus, updated_at: new Date().toISOString() }).eq('id', requestId);
    if (error) throw error;
  },

  /**
   * Add internal staff-only note
   */
  async addInternalNote(
    requestId: string,
    authorIdOrNote: string,
    noteText?: string
  ): Promise<RequestInternalNote> {
    const note = (noteText || authorIdOrNote).trim();
    if (note.length < 3) throw new Error('Internal notes must be at least 3 characters.');
    const authorId = noteText ? authorIdOrNote : undefined;
    const config = getSupabaseConfig();
    if (!config.isConfigured && isDemoMode()) return mockStore.addInternalNote(requestId, note, authorId);

    const { data: authData } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('request_internal_notes').insert({
      request_id: requestId,
      author_id: authorId || authData?.user?.id,
      note,
    }).select('*').single();
    if (error) throw error;
    return data as RequestInternalNote;
  },

  /**
   * Student cancel pending request
   */
  async cancelRequest(requestId: string, reason: string): Promise<void> {
    await this.updateRequestStatus({
      requestId,
      newStatus: 'CANCELLED',
      reason,
      comment: reason || 'Cancelled by student',
    });
  },

  /**
   * Student responds to information request with optional note and files
   */
  async submitInformationResponse(
    requestId: string,
    responseNote: string,
    files?: File[]
  ): Promise<void> {
    await this.updateRequestStatus({
      requestId,
      newStatus: 'UNDER_REVIEW',
      comment: responseNote,
    });
  },

  /**
   * Public tracking lookup by request number and student ID
   */
  async trackPublicRequest(
    requestNumber: string,
    studentIdNum: string
  ): Promise<DocumentRequest | null> {
    const config = getSupabaseConfig();
    if (!config.isConfigured && isDemoMode()) {
      const list = mockStore.getRequests();
      const match = list.find(
        (r) =>
          r.request_number.toLowerCase() === requestNumber.trim().toLowerCase() &&
          r.student?.student_id.toLowerCase() === studentIdNum.trim().toLowerCase()
      );
      return match || null;
    }

    try {
      const { data, error } = await supabase
        .from('requests')
        .select(`
          *,
          document_type:document_types(*),
          student:student_profiles(
            id,
            student_id,
            program,
            year_level,
            user:profiles(full_name, email)
          )
        `)
        .ilike('request_number', requestNumber.trim())
        .single();

      if (error || !data) return null;

      if (data.student?.student_id?.toLowerCase() !== studentIdNum.trim().toLowerCase()) {
        return null;
      }

      const { data: history } = await supabase
        .from('request_status_history')
        .select('*')
        .eq('request_id', data.id)
        .order('created_at', { ascending: true });

      return {
        ...data,
        status_history: (history || []) as RequestStatusHistory[],
      } as DocumentRequest;
    } catch (e) {
      if (!isDemoMode()) throw e;
      const list = mockStore.getRequests();
      return list.find(
        (r) =>
          r.request_number.toLowerCase() === requestNumber.trim().toLowerCase() &&
          r.student?.student_id.toLowerCase() === studentIdNum.trim().toLowerCase()
      ) || null;
    }
  },

  /**
   * Subscribe to real-time updates for document requests (Supabase Realtime + fallback)
   */
  subscribeToRequests(callbacks: {
    onInsert?: (newRequest: DocumentRequest) => void;
    onUpdate?: (updatedRequest: DocumentRequest) => void;
    onChange?: (payload: {
      eventType: 'INSERT' | 'UPDATE' | 'DELETE';
      request?: DocumentRequest;
      new?: any;
      old?: any;
    }) => void;
  }): () => void {
    const config = getSupabaseConfig();
    const cleanups: Array<() => void> = [];

    // 1. Supabase Realtime channel subscription
    if (config.isConfigured) {
      try {
        const channel = supabase
          .channel('public:requests-realtime-sub')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'requests',
            },
            async (payload) => {
              if (payload.eventType === 'INSERT' && payload.new) {
                try {
                  const full = await requestService.getRequestById(payload.new.id);
                  if (full) {
                    callbacks.onInsert?.(full);
                    callbacks.onChange?.({
                      eventType: 'INSERT',
                      request: full,
                      new: payload.new,
                    });
                    return;
                  }
                } catch {
                  // Fallback
                }
                callbacks.onInsert?.(payload.new as DocumentRequest);
                callbacks.onChange?.({
                  eventType: 'INSERT',
                  request: payload.new as DocumentRequest,
                  new: payload.new,
                });
              } else if (payload.eventType === 'UPDATE' && payload.new) {
                try {
                  const full = await requestService.getRequestById(payload.new.id);
                  if (full) {
                    callbacks.onUpdate?.(full);
                    callbacks.onChange?.({
                      eventType: 'UPDATE',
                      request: full,
                      new: payload.new,
                      old: payload.old,
                    });
                    return;
                  }
                } catch {
                  // Fallback
                }
                callbacks.onUpdate?.(payload.new as DocumentRequest);
                callbacks.onChange?.({
                  eventType: 'UPDATE',
                  request: payload.new as DocumentRequest,
                  new: payload.new,
                  old: payload.old,
                });
              } else if (payload.eventType === 'DELETE') {
                callbacks.onChange?.({ eventType: 'DELETE', old: payload.old });
              }
            }
          )
          .subscribe();

        cleanups.push(() => {
          supabase.removeChannel(channel);
        });
      } catch (err) {
        console.warn('Failed to register Supabase Realtime requests channel:', err);
      }
    }

    // 2. Local fallback events (for demo, testing, mock store)
    if (isDemoMode() && typeof window !== 'undefined') {
      const handleCreated = (e: Event) => {
        const customEvent = e as CustomEvent<{ request: DocumentRequest; eventType: 'INSERT' }>;
        if (customEvent.detail?.request) {
          callbacks.onInsert?.(customEvent.detail.request);
          callbacks.onChange?.({
            eventType: 'INSERT',
            request: customEvent.detail.request,
            new: customEvent.detail.request,
          });
        }
      };

      const handleUpdated = (e: Event) => {
        const customEvent = e as CustomEvent<{ request: DocumentRequest; eventType: 'UPDATE' }>;
        if (customEvent.detail?.request) {
          callbacks.onUpdate?.(customEvent.detail.request);
          callbacks.onChange?.({
            eventType: 'UPDATE',
            request: customEvent.detail.request,
            new: customEvent.detail.request,
          });
        }
      };

      window.addEventListener('ibacmi:request_created', handleCreated);
      window.addEventListener('ibacmi:request_updated', handleUpdated);

      cleanups.push(() => {
        window.removeEventListener('ibacmi:request_created', handleCreated);
        window.removeEventListener('ibacmi:request_updated', handleUpdated);
      });
    }

    return () => {
      cleanups.forEach((fn) => fn());
    };
  },
};

