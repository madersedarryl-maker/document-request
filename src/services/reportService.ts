import { supabase, getSupabaseConfig } from '../lib/supabase';
import { DocumentRequest } from '../types';
import { mockStore } from './mockStore';

export interface DashboardStats {
  totalRequests: number;
  pendingRequests: number;
  releasedRequests: number;
  pendingReview: number;
  forApproval: number;
  processing: number;
  readyForRelease: number;
  released: number;
  rejected: number;
  needsInformation: number;
  totalRevenue: number;
  byStatus: Record<string, number>;
  byDocumentType: Record<string, number>;
}

export const reportService = {
  /**
   * Get operational overview statistics for Dashboards
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const config = getSupabaseConfig();
    let rawRequests: any[] = [];

    if (!config.isConfigured) {
      rawRequests = mockStore.getRequests();
    } else {
      try {
        const { data: requests, error } = await supabase
          .from('requests')
          .select('status, fee, payment_status, document_type:document_types(name)');

        if (error) throw error;
        rawRequests = requests || [];
      } catch (e) {
        rawRequests = mockStore.getRequests();
      }
    }

    const byStatus: Record<string, number> = {
      SUBMITTED: 0,
      UNDER_REVIEW: 0,
      NEEDS_INFORMATION: 0,
      FOR_APPROVAL: 0,
      APPROVED: 0,
      PROCESSING: 0,
      READY_FOR_RELEASE: 0,
      RELEASED: 0,
      REJECTED: 0,
      CANCELLED: 0,
    };

    const byDocumentType: Record<string, number> = {};

    const stats: DashboardStats = {
      totalRequests: rawRequests.length,
      pendingRequests: 0,
      releasedRequests: 0,
      pendingReview: 0,
      forApproval: 0,
      processing: 0,
      readyForRelease: 0,
      released: 0,
      rejected: 0,
      needsInformation: 0,
      totalRevenue: 0,
      byStatus,
      byDocumentType,
    };

    rawRequests.forEach((req: any) => {
      const st = req.status;
      if (byStatus[st] !== undefined) {
        byStatus[st]++;
      } else {
        byStatus[st] = 1;
      }

      const docName = req.document_type?.name || 'Unspecified Document';
      byDocumentType[docName] = (byDocumentType[docName] || 0) + 1;

      if (st === 'SUBMITTED' || st === 'UNDER_REVIEW') stats.pendingReview++;
      if (st === 'FOR_APPROVAL' || st === 'APPROVED') stats.forApproval++;
      if (st === 'PROCESSING') stats.processing++;
      if (st === 'READY_FOR_RELEASE') stats.readyForRelease++;
      if (st === 'RELEASED') {
        stats.released++;
        stats.releasedRequests++;
      }
      if (st === 'REJECTED') stats.rejected++;
      if (st === 'NEEDS_INFORMATION') stats.needsInformation++;

      if (
        st === 'SUBMITTED' ||
        st === 'UNDER_REVIEW' ||
        st === 'NEEDS_INFORMATION' ||
        st === 'FOR_APPROVAL' ||
        st === 'APPROVED' ||
        st === 'PROCESSING'
      ) {
        stats.pendingRequests++;
      }

      if (req.payment_status === 'PAID' || st === 'RELEASED') {
        stats.totalRevenue += Number(req.fee) || 0;
      }
    });

    return stats;
  },

  /**
   * Format document requests array into CSV string
   */
  exportRequestsToCSV(requests: DocumentRequest[]): string {
    const headers = [
      'Request Number',
      'Date Submitted',
      'Status',
      'Priority',
      'Document Name',
      'Quantity',
      'Total Fee ($)',
      'Payment Status',
      'Student ID',
      'Student Full Name',
      'Student Email',
      'Program',
      'Year Level',
      'Release Method',
      'Purpose',
    ];

    const rows = requests.map((r) => [
      `"${r.request_number}"`,
      `"${r.created_at ? new Date(r.created_at).toLocaleString() : ''}"`,
      `"${r.status}"`,
      `"${r.priority}"`,
      `"${(r.document_type?.name || '').replace(/"/g, '""')}"`,
      r.quantity,
      Number(r.fee).toFixed(2),
      `"${r.payment_status}"`,
      `"${r.student?.student_id || ''}"`,
      `"${(r.student?.user?.full_name || '').replace(/"/g, '""')}"`,
      `"${r.student?.user?.email || ''}"`,
      `"${r.student?.program || ''}"`,
      `"${r.student?.year_level || ''}"`,
      `"${r.release_method}"`,
      `"${(r.purpose || '').replace(/"/g, '""')}"`,
    ]);

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  },
};
