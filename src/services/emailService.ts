import {
  DocumentRequest,
  RequestStatus,
  EmailNotificationLog,
  SystemNotification,
} from '../types';
import { mockStore } from './mockStore';
import { supabase, getSupabaseConfig } from '../lib/supabase';
import { format } from 'date-fns';

export interface EmailTemplateConfig {
  subjectTemplate: string;
  bodyTemplate: string;
  actionTitle: string;
  nextSteps: string;
}

export const STATUS_EMAIL_TEMPLATES: Record<RequestStatus, EmailTemplateConfig> = {
  SUBMITTED: {
    subjectTemplate: '[iBACMI Registrar] Document Request Received: {REQUEST_NUMBER}',
    bodyTemplate:
      'Dear {STUDENT_NAME},\n\nYour request for {DOCUMENT_TYPE} ({REQUEST_NUMBER}) has been received and logged in the Registrar Intake Queue. Our evaluation officers will review your submitted documentary requirements shortly.',
    actionTitle: 'Intake Completed',
    nextSteps: 'Please monitor your student portal for requirement verification updates.',
  },
  PENDING_PAYMENT: {
    subjectTemplate: '[iBACMI Registrar] Payment Required for Request {REQUEST_NUMBER}',
    bodyTemplate:
      'Dear {STUDENT_NAME},\n\nYour document request {REQUEST_NUMBER} for {DOCUMENT_TYPE} requires settlement of processing fees before production can proceed.\n\nFee Amount: ₱{FEE}\nPayment Status: Pending Assessment',
    actionTitle: 'Payment Settlement Needed',
    nextSteps: 'Please pay online via your student portal or present your reference number at the Cashier Window.',
  },
  PAYMENT_VERIFIED: {
    subjectTemplate: '[iBACMI Registrar] Payment Confirmed: {REQUEST_NUMBER}',
    bodyTemplate:
      'Dear {STUDENT_NAME},\n\nPayment for your document request {REQUEST_NUMBER} ({DOCUMENT_TYPE}) has been successfully verified. Your request has moved to the verification queue.',
    actionTitle: 'Payment Acknowledged',
    nextSteps: 'Your documentary requirements are currently being verified by registrar evaluators.',
  },
  UNDER_REVIEW: {
    subjectTemplate: '[iBACMI Registrar] Documentary Requirements Under Evaluation: {REQUEST_NUMBER}',
    bodyTemplate:
      'Dear {STUDENT_NAME},\n\nYour submitted clearance and documentary requirements for {DOCUMENT_TYPE} ({REQUEST_NUMBER}) are currently undergoing evaluation and academic audit.',
    actionTitle: 'Evaluation in Progress',
    nextSteps: 'You will receive an update once the documents are verified or if additional attachments are needed.',
  },
  FOR_APPROVAL: {
    subjectTemplate: '[iBACMI Registrar] Request Awaiting Sign-off: {REQUEST_NUMBER}',
    bodyTemplate:
      'Dear {STUDENT_NAME},\n\nYour document request {REQUEST_NUMBER} for {DOCUMENT_TYPE} has completed preliminary clearance checks and has been routed to the Dean / Registrar for formal sign-off.',
    actionTitle: 'Routing for Signature',
    nextSteps: 'No action required on your part at this time.',
  },
  APPROVED: {
    subjectTemplate: '[iBACMI Registrar] Request Approved: {REQUEST_NUMBER}',
    bodyTemplate:
      'Dear {STUDENT_NAME},\n\nGood news! Your request for {DOCUMENT_TYPE} ({REQUEST_NUMBER}) has been approved by the Registrar Office. Preparation and printing will commence according to standard processing timelines.',
    actionTitle: 'Official Approval Granted',
    nextSteps: 'Your document is queued for printing, security sealing, and release preparation.',
  },
  PROCESSING: {
    subjectTemplate: '[iBACMI Registrar] Document Production Underway: {REQUEST_NUMBER}',
    bodyTemplate:
      'Dear {STUDENT_NAME},\n\nYour document request {REQUEST_NUMBER} ({DOCUMENT_TYPE}) is actively being processed, printed, and prepared with official institutional seals and academic signatures.',
    actionTitle: 'Production & Embossing',
    nextSteps: 'You will receive an instant notification as soon as your document is ready for claiming or delivery.',
  },
  READY_FOR_RELEASE: {
    subjectTemplate: '[iBACMI Registrar] Document Ready for Claiming: {REQUEST_NUMBER}',
    bodyTemplate:
      'Dear {STUDENT_NAME},\n\nYour requested document, {DOCUMENT_TYPE} ({REQUEST_NUMBER}), has been completed and is officially READY FOR CLAIMING.\n\nRelease Method: {RELEASE_METHOD}\nLocation: Office of the Registrar, Window 3\nOffice Hours: Monday - Friday, 8:00 AM - 5:00 PM',
    actionTitle: 'Ready for Pickup / Release',
    nextSteps: 'Please bring your Valid Student ID and official receipt reference when claiming.',
  },
  RELEASED: {
    subjectTemplate: '[iBACMI Registrar] Document Released: {REQUEST_NUMBER}',
    bodyTemplate:
      'Dear {STUDENT_NAME},\n\nThis is an official confirmation that your requested document, {DOCUMENT_TYPE} ({REQUEST_NUMBER}), was officially issued and released.\n\nThank you for using the iBACMI Student Document Request System.',
    actionTitle: 'Document Released',
    nextSteps: 'If you have any inquiries regarding the issued document, contact the Registrar Office.',
  },
  NEEDS_INFORMATION: {
    subjectTemplate: '[iBACMI Registrar] Action Required: Clarification Needed for {REQUEST_NUMBER}',
    bodyTemplate:
      'Dear {STUDENT_NAME},\n\nAdditional information or document resubmission is required to process your request for {DOCUMENT_TYPE} ({REQUEST_NUMBER}).\n\nRegistrar Note: {REMARKS}',
    actionTitle: 'Clarification / Attachment Required',
    nextSteps: 'Please log into your student portal immediately to view evaluator notes and upload the requested items.',
  },
  REJECTED: {
    subjectTemplate: '[iBACMI Registrar] Notice Regarding Document Request: {REQUEST_NUMBER}',
    bodyTemplate:
      'Dear {STUDENT_NAME},\n\nWe regret to inform you that your request for {DOCUMENT_TYPE} ({REQUEST_NUMBER}) could not be approved at this time.\n\nReason: {REMARKS}',
    actionTitle: 'Request Disapproved',
    nextSteps: 'If you believe this was in error, please consult the Registrar Office during official business hours.',
  },
  CANCELLED: {
    subjectTemplate: '[iBACMI Registrar] Request Cancelled: {REQUEST_NUMBER}',
    bodyTemplate:
      'Dear {STUDENT_NAME},\n\nYour document request {REQUEST_NUMBER} for {DOCUMENT_TYPE} has been cancelled.\n\nReason/Remarks: {REMARKS}',
    actionTitle: 'Request Cancelled',
    nextSteps: 'You may submit a new document request through your student portal if needed.',
  },
};

export interface GenerateEmailOptions {
  customSubject?: string;
  customBody?: string;
  remarks?: string;
  schoolName?: string;
  officeHours?: string;
}

export interface EmailRenderResult {
  subject: string;
  bodyText: string;
  bodyHtml: string;
  recipientEmail: string;
  recipientName: string;
}

export const emailService = {
  /**
   * Get template defaults for a given status
   */
  getDefaultTemplate(status: RequestStatus): EmailTemplateConfig {
    return (
      STATUS_EMAIL_TEMPLATES[status] || {
        subjectTemplate: '[iBACMI Registrar] Update on your request {REQUEST_NUMBER}',
        bodyTemplate:
          'Dear {STUDENT_NAME},\n\nYour request {REQUEST_NUMBER} for {DOCUMENT_TYPE} has been updated to status: {STATUS}.\n\nNote: {REMARKS}',
        actionTitle: 'Status Updated',
        nextSteps: 'Please check your student portal for more details.',
      }
    );
  },

  /**
   * Render personalized email content for a single request
   */
  renderEmailForRequest(
    request: DocumentRequest,
    targetStatus: RequestStatus,
    options?: GenerateEmailOptions
  ): EmailRenderResult {
    const studentName =
      request.student?.user?.full_name ||
      request.student?.student_id ||
      'Valued Student';
    const studentEmail =
      request.student?.user?.email ||
      `student.${request.student?.student_id || 'user'}@ibacmi.edu.ph`;
    const docTypeName = request.document_type?.name || 'Document Request';
    const releaseMethod =
      request.release_method === 'DELIVERY'
        ? 'Courier Delivery to ' + (request.delivery_address || 'Registered Address')
        : request.release_method === 'DIGITAL'
        ? 'Digital E-Copy Download'
        : 'On-Campus Registrar Pickup';

    const defaultTpl = this.getDefaultTemplate(targetStatus);
    const subjectTemplate = options?.customSubject?.trim() || defaultTpl.subjectTemplate;
    const bodyTemplate = options?.customBody?.trim() || defaultTpl.bodyTemplate;
    const remarks = options?.remarks?.trim() || 'No additional remarks provided.';
    const schoolName = options?.schoolName || 'iBACMI Registrar & Academic Records Office';
    const officeHours = options?.officeHours || 'Monday - Friday, 8:00 AM - 5:00 PM';
    const feeText = (request.fee || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
    });
    const formattedDate = format(new Date(), 'MMMM d, yyyy h:mm a');

    // Replace placeholders
    const replaceVars = (text: string) => {
      return text
        .replace(/\{STUDENT_NAME\}/g, studentName)
        .replace(/\{REQUEST_NUMBER\}/g, request.request_number)
        .replace(/\{DOCUMENT_TYPE\}/g, docTypeName)
        .replace(/\{STATUS\}/g, targetStatus.replace(/_/g, ' '))
        .replace(/\{REMARKS\}/g, remarks)
        .replace(/\{FEE\}/g, feeText)
        .replace(/\{RELEASE_METHOD\}/g, releaseMethod)
        .replace(/\{DATE\}/g, formattedDate)
        .replace(/\{SCHOOL_NAME\}/g, schoolName)
        .replace(/\{OFFICE_HOURS\}/g, officeHours);
    };

    const renderedSubject = replaceVars(subjectTemplate);
    const renderedBody = replaceVars(bodyTemplate);

    // Build academic styled HTML email
    const renderedHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; background-color: #f8fafc; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: #1e3a8a; color: #ffffff; padding: 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -0.02em; }
    .header p { margin: 4px 0 0 0; font-size: 13px; opacity: 0.85; }
    .content { padding: 28px 24px; }
    .status-pill { display: inline-block; background: #eff6ff; color: #1d4ed8; font-weight: 700; font-size: 12px; padding: 4px 12px; border-radius: 9999px; border: 1px solid #bfdbfe; margin-bottom: 16px; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0; }
    .card table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .card td { padding: 6px 0; }
    .card td.label { color: #64748b; font-weight: 600; width: 35%; }
    .card td.value { color: #0f172a; font-weight: 600; }
    .instructions { background: #fefce8; border-left: 4px solid #eab308; padding: 12px 16px; margin: 20px 0; border-radius: 0 8px 8px 0; font-size: 13px; color: #713f12; }
    .footer { background: #f1f5f9; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>iBACMI Academic Document Portal</h1>
      <p>Official Registrar Notification Service</p>
    </div>
    <div class="content">
      <div class="status-pill">${targetStatus.replace(/_/g, ' ')}</div>
      <p style="white-space: pre-line; margin-top: 0;">${renderedBody}</p>

      <div class="card">
        <table>
          <tr>
            <td class="label">Request Number:</td>
            <td class="value">${request.request_number}</td>
          </tr>
          <tr>
            <td class="label">Document Requested:</td>
            <td class="value">${docTypeName}</td>
          </tr>
          <tr>
            <td class="label">Student Name:</td>
            <td class="value">${studentName}</td>
          </tr>
          <tr>
            <td class="label">Release Method:</td>
            <td class="value">${releaseMethod}</td>
          </tr>
          <tr>
            <td class="label">Update Timestamp:</td>
            <td class="value">${formattedDate}</td>
          </tr>
        </table>
      </div>

      <div class="instructions">
        <strong>Next Steps & Instructions:</strong><br/>
        ${defaultTpl.nextSteps}
      </div>
    </div>
    <div class="footer">
      <p style="margin: 0 0 6px 0;"><strong>Office of the University Registrar</strong> • iBACMI Campus</p>
      <p style="margin: 0;">Office Hours: ${officeHours} | Automated notification • Please do not reply directly.</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    return {
      subject: renderedSubject,
      bodyText: renderedBody,
      bodyHtml: renderedHtml,
      recipientEmail: studentEmail,
      recipientName: studentName,
    };
  },

  /**
   * Dispatch bulk automated email notifications to students
   */
  async sendBulkStatusEmailNotifications(
    requests: DocumentRequest[],
    targetStatus: RequestStatus,
    options?: {
      customSubject?: string;
      customBody?: string;
      remarks?: string;
      senderName?: string;
      senderId?: string;
      schoolName?: string;
      officeHours?: string;
    }
  ): Promise<{
    totalSent: number;
    totalFailed: number;
    logs: EmailNotificationLog[];
    recipientsList: Array<{ name: string; email: string; requestNumber: string }>;
  }> {
    const logs: EmailNotificationLog[] = [];
    const recipientsList: Array<{ name: string; email: string; requestNumber: string }> = [];
    let totalSent = 0;
    let totalFailed = 0;

    const senderName = options?.senderName || 'Registrar Evaluation Staff';
    const senderId = options?.senderId || 'usr-staff-001';

    for (const req of requests) {
      try {
        const rendered = this.renderEmailForRequest(req, targetStatus, options);

        const emailLog: EmailNotificationLog = {
          id: `email-log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          recipient_email: rendered.recipientEmail,
          recipient_name: rendered.recipientName,
          student_id: req.student_id,
          request_id: req.id,
          request_number: req.request_number,
          document_type_name: req.document_type?.name || 'Document Request',
          status: targetStatus,
          subject: rendered.subject,
          body_text: rendered.bodyText,
          body_html: rendered.bodyHtml,
          status_delivery: 'DELIVERED',
          sent_at: new Date().toISOString(),
          sender_name: senderName,
          remarks: options?.remarks || null,
        };

        logs.push(emailLog);
        recipientsList.push({
          name: rendered.recipientName,
          email: rendered.recipientEmail,
          requestNumber: req.request_number,
        });

        // 1. Dispatch In-App System Notification to student so they see it in their bell badge
        const targetUserId =
          req.student?.user?.id ||
          req.student?.id ||
          `usr-${req.student_id}`;

        let notifType: SystemNotification['type'] = 'INFO';
        if (targetStatus === 'READY_FOR_RELEASE' || targetStatus === 'RELEASED' || targetStatus === 'APPROVED') {
          notifType = 'SUCCESS';
        } else if (targetStatus === 'NEEDS_INFORMATION') {
          notifType = 'WARNING';
        } else if (targetStatus === 'REJECTED') {
          notifType = 'ALERT';
        }

        const notif: SystemNotification = {
          id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          user_id: targetUserId,
          request_id: req.id,
          title: rendered.subject,
          message: rendered.bodyText.substring(0, 180) + '...',
          type: notifType,
          is_read: false,
          created_at: new Date().toISOString(),
        };

        // Add to mockStore
        mockStore.addNotification(notif);

        // Store email log in localStorage for persistence across reloads
        try {
          const currentLogs = JSON.parse(localStorage.getItem('ibacmi_email_notification_logs') || '[]');
          currentLogs.unshift(emailLog);
          localStorage.setItem('ibacmi_email_notification_logs', JSON.stringify(currentLogs.slice(0, 200)));
        } catch {
          // ignore
        }

        // 2. If Supabase is active, persist notification
        const config = getSupabaseConfig();
        if (config.isConfigured) {
          try {
            await supabase.from('notifications').insert({
              user_id: targetUserId,
              request_id: req.id,
              title: rendered.subject,
              message: rendered.bodyText,
              type: notifType,
            });
          } catch (e) {
            // fallback gracefully
          }
        }

        totalSent++;
      } catch (err) {
        console.error(`Failed to send email for request ${req.request_number}:`, err);
        totalFailed++;
      }
    }

    // Add Audit Log
    mockStore.addAuditLog({
      user_id: senderId,
      action: 'BATCH_EMAIL_SENT',
      entity_type: 'requests',
      entity_id: `batch-${Date.now()}`,
      details: {
        total_requests: requests.length,
        total_emails_sent: totalSent,
        target_status: targetStatus,
        recipients: recipientsList.map((r) => `${r.name} <${r.email}>`),
      },
    });

    // Fire client custom event for live inbox/toasts
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('ibacmi:bulk_emails_sent', {
          detail: {
            totalSent,
            targetStatus,
            recipients: recipientsList,
            logs,
          },
        })
      );
    }

    return {
      totalSent,
      totalFailed,
      logs,
      recipientsList,
    };
  },

  /**
   * Get all stored email logs
   */
  getEmailLogs(): EmailNotificationLog[] {
    try {
      const stored = localStorage.getItem('ibacmi_email_notification_logs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },
};
