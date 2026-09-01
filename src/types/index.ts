export type UserRole = 'STUDENT' | 'STAFF' | 'ADMIN';

export type RequestStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'FOR_APPROVAL'
  | 'APPROVED'
  | 'PROCESSING'
  | 'READY_FOR_RELEASE'
  | 'RELEASED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'NEEDS_INFORMATION';

export type RequestPriority = 'NORMAL' | 'HIGH' | 'URGENT';

export type PaymentStatus = 'NOT_REQUIRED' | 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export type ReleaseMethod = 'PICKUP' | 'DIGITAL_COPY' | 'COURIER';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  created_at: string;
  updated_at: string;
  student_profile?: StudentProfile;
  staff_profile?: StaffProfile;
}

export interface StudentProfile {
  id: string;
  user_id: string;
  student_id: string;
  program: string;
  year_level: string;
  contact_number?: string | null;
  emergency_contact?: string | null;
  created_at: string;
  updated_at: string;
}

export interface StaffProfile {
  id: string;
  user_id: string;
  employee_id: string;
  department: string;
  designation: string;
  can_approve: boolean;
  created_at: string;
  updated_at: string;
}

export type RequirementVerificationStatus =
  | 'NOT_SUBMITTED'
  | 'UPLOADED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'NEEDS_RESUBMISSION'
  | 'NOT_APPLICABLE';

export type OverallVerificationStatus =
  | 'INCOMPLETE'
  | 'UNDER_REVIEW'
  | 'ACTION_REQUIRED'
  | 'VERIFIED';

export type RejectionReasonType =
  | 'WRONG_DOCUMENT'
  | 'MISSING_INFORMATION'
  | 'UNREADABLE_DOCUMENT'
  | 'EXPIRED_DOCUMENT'
  | 'INCORRECT_FILE'
  | 'STUDENT_INFO_MISMATCH'
  | 'INCOMPLETE_DOCUMENT'
  | 'OTHER';

export interface DocumentRequirement {
  id: string;
  document_type_id: string;
  requirement_name: string;
  description?: string | null;
  is_mandatory: boolean;
  file_type?: string | null;
  max_file_size_mb?: number;
  allow_multiple?: boolean;
  conditional_rule?: string | null;
  display_order?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface RequestRequirement {
  id: string;
  request_id: string;
  requirement_id?: string | null;
  requirement_name: string;
  description?: string | null;
  is_mandatory: boolean;
  file_type?: string | null;
  max_file_size_mb?: number;
  allow_multiple?: boolean;
  status: RequirementVerificationStatus;
  created_at: string;
  updated_at?: string;
}

export interface RequirementSubmissionFile {
  id: string;
  file_name: string;
  storage_path: string;
  file_size?: number | null;
  mime_type?: string | null;
  preview_url?: string | null;
  uploaded_at: string;
}

export interface DocumentReviewItem {
  id: string;
  version: number;
  status: RequirementVerificationStatus;
  reviewer_id?: string | null;
  reviewer_name?: string | null;
  reviewer_role?: UserRole | null;
  review_date?: string | null;
  rejection_reason_code?: RejectionReasonType | null;
  rejection_reason_text?: string | null;
  remarks?: string | null;
  checklist_results?: {
    correct_document?: boolean;
    student_info_matches?: boolean;
    required_info_complete?: boolean;
    is_readable?: boolean;
    meets_requirements?: boolean;
  };
  files: RequirementSubmissionFile[];
  created_at: string;
}

export interface RequestRequirementItem {
  id: string;
  request_id: string;
  requirement_id: string;
  requirement_name: string;
  description?: string | null;
  is_mandatory: boolean;
  file_type?: string | null;
  max_file_size_mb?: number;
  allow_multiple?: boolean;
  conditional_rule?: string | null;
  
  // Current active status
  current_status: RequirementVerificationStatus;
  current_version: number;
  
  // Active/latest review details
  latest_reviewer_name?: string | null;
  latest_review_date?: string | null;
  latest_reason?: string | null;
  latest_remarks?: string | null;
  latest_files: RequirementSubmissionFile[];
  
  // Historical versions (v1, v2, v3...)
  version_history: DocumentReviewItem[];
}

export interface DocumentType {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  fee: number;
  processing_days: number;
  is_active: boolean;
  requires_approval: boolean;
  created_at: string;
  updated_at: string;
  requirements?: DocumentRequirement[];
}

export interface ApprovalWorkflow {
  id: string;
  name: string;
  description?: string | null;
  document_type_id?: string | null;
  is_active: boolean;
  created_at: string;
  steps?: ApprovalWorkflowStep[];
}

export interface ApprovalWorkflowStep {
  id: string;
  workflow_id: string;
  step_order: number;
  step_name: string;
  required_role: UserRole;
  approver_id?: string | null;
  created_at: string;
}

export interface DocumentRequest {
  id: string;
  request_number: string;
  student_id: string; // references student_profiles.id
  document_type_id: string;
  quantity: number;
  purpose: string;
  release_method: ReleaseMethod;
  delivery_address?: string | null;
  remarks?: string | null;
  status: RequestStatus;
  priority: RequestPriority;
  fee: number;
  payment_status: PaymentStatus;
  assigned_to?: string | null; // references staff_profiles.id
  current_workflow_step_id?: string | null;
  rejection_reason?: string | null;
  information_request_note?: string | null;
  released_at?: string | null;
  released_by?: string | null;
  created_at: string;
  updated_at: string;

  // Joined relations
  document_type?: DocumentType;
  student?: {
    id: string;
    student_id: string;
    program: string;
    year_level: string;
    contact_number?: string | null;
    user?: {
      id: string;
      email: string;
      full_name: string;
      phone?: string | null;
    };
  };
  assigned_staff?: {
    id: string;
    employee_id: string;
    department: string;
    user?: {
      full_name: string;
      email: string;
    };
  };
  attachments?: RequestAttachment[];
  status_history?: RequestStatusHistory[];
  approval_actions?: ApprovalAction[];
  internal_notes?: RequestInternalNote[];
  requirement_items?: RequestRequirementItem[];
  overall_verification_status?: OverallVerificationStatus;
}

export interface RequestAttachment {
  id: string;
  request_id: string;
  uploaded_by: string;
  requirement_id?: string | null;
  file_name: string;
  storage_path: string;
  mime_type?: string | null;
  file_size?: number | null;
  created_at: string;
}

export interface RequestStatusHistory {
  id: string;
  request_id: string;
  previous_status?: RequestStatus | null;
  new_status: RequestStatus;
  changed_by: string;
  reason?: string | null;
  comment?: string | null;
  created_at: string;
  changed_by_user?: {
    full_name: string;
    role: UserRole;
    email: string;
  };
}

export interface ApprovalAction {
  id: string;
  request_id: string;
  workflow_step_id?: string | null;
  approver_id: string;
  action: 'APPROVED' | 'REJECTED' | 'NEEDS_INFORMATION';
  reason?: string | null;
  comment?: string | null;
  created_at: string;
  approver_user?: {
    full_name: string;
    role: UserRole;
    email: string;
  };
}

export interface RequestInternalNote {
  id: string;
  request_id: string;
  author_id: string;
  note: string;
  created_at: string;
  author?: {
    full_name: string;
    role: UserRole;
  };
}

export interface SystemNotification {
  id: string;
  user_id: string;
  request_id?: string | null;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  is_read: boolean;
  created_at: string;
}

export interface EmailNotificationLog {
  id: string;
  recipient_email: string;
  recipient_name: string;
  student_id: string;
  request_id: string;
  request_number: string;
  document_type_name: string;
  status: RequestStatus;
  subject: string;
  body_text: string;
  body_html: string;
  status_delivery: 'SENT' | 'DELIVERED' | 'FAILED';
  sent_at: string;
  sender_name: string;
  remarks?: string | null;
}

export interface AuditLog {
  id: string;
  user_id?: string | null;
  action:
    | 'LOGIN'
    | 'LOGOUT'
    | 'REQUEST_CREATED'
    | 'REQUEST_UPDATED'
    | 'STATUS_CHANGED'
    | 'REQUEST_APPROVED'
    | 'REQUEST_REJECTED'
    | 'INFORMATION_REQUESTED'
    | 'FILE_UPLOADED'
    | 'REQUIREMENT_SUBMITTED'
    | 'REQUIREMENT_APPROVED'
    | 'REQUIREMENT_REJECTED'
    | 'REQUIREMENT_RESUBMISSION_REQUESTED'
    | 'REQUIREMENT_ADDED'
    | 'REQUIREMENT_UPDATED'
    | 'REQUIREMENT_DELETED'
    | 'DOCUMENT_RELEASED'
    | 'USER_CREATED'
    | 'USER_UPDATED'
    | 'DOCUMENT_TYPE_CREATED'
    | 'DOCUMENT_TYPE_UPDATED'
    | 'DOCUMENT_TYPE_DELETED'
    | 'SETTINGS_CHANGED'
    | 'EMAIL_SENT'
    | 'BATCH_EMAIL_SENT';
  entity_type: string;
  entity_id?: string | null;
  details?: Record<string, any> | null;
  created_at: string;
  user?: {
    full_name: string;
    email: string;
    role: UserRole;
  };
}

export interface SystemSettings {
  id: string;
  school_name: string;
  school_code: string;
  office_name: string;
  office_address: string;
  contact_number: string;
  email: string;
  office_hours: string;
  release_instructions: string;
  default_processing_time_days: number;
  request_prefix: string;
  max_upload_size_mb: number;
  allowed_file_types: string;
  maintenance_mode: boolean;
  updated_at: string;
}
