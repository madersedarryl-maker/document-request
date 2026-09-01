import {
  UserProfile,
  StudentProfile,
  StaffProfile,
  DocumentType,
  DocumentRequirement,
  DocumentRequest,
  RequestStatusHistory,
  RequestInternalNote,
  SystemNotification,
  AuditLog,
  SystemSettings,
  UserRole,
  RequestStatus,
  RequestPriority,
  ReleaseMethod,
  RequestRequirementItem,
  RequirementVerificationStatus,
  OverallVerificationStatus,
  RejectionReasonType,
  DocumentReviewItem,
  RequirementSubmissionFile,
} from '../types';

const STORE_KEY = 'sdr_local_mock_store_v2';

export interface LocalMockState {
  profiles: UserProfile[];
  studentProfiles: StudentProfile[];
  staffProfiles: StaffProfile[];
  documentTypes: DocumentType[];
  requests: DocumentRequest[];
  requirementItems: RequestRequirementItem[];
  attachments: Array<{
    id: string;
    request_id: string;
    uploaded_by: string;
    requirement_id?: string | null;
    file_name: string;
    storage_path: string;
    file_size?: number | null;
    mime_type?: string | null;
    created_at: string;
  }>;
  statusHistory: RequestStatusHistory[];
  internalNotes: RequestInternalNote[];
  notifications: SystemNotification[];
  auditLogs: AuditLog[];
  systemSettings: SystemSettings;
  currentUserId: string | null;
}

const INITIAL_PROFILES: UserProfile[] = [
  {
    id: 'usr-student-001',
    email: 'student@metrouni.edu',
    full_name: 'Juan Dela Cruz',
    role: 'STUDENT',
    phone: '+1 (555) 234-5678',
    status: 'ACTIVE',
    created_at: '2026-01-15T08:00:00.000Z',
    updated_at: '2026-01-15T08:00:00.000Z',
  },
  {
    id: 'usr-student-002',
    email: 'maria.santos@metrouni.edu',
    full_name: 'Maria Santos',
    role: 'STUDENT',
    phone: '+1 (555) 345-6789',
    status: 'ACTIVE',
    created_at: '2026-01-20T09:30:00.000Z',
    updated_at: '2026-01-20T09:30:00.000Z',
  },
  {
    id: 'usr-student-003',
    email: 'alex.rivera@metrouni.edu',
    full_name: 'Alex Rivera',
    role: 'STUDENT',
    phone: '+1 (555) 456-7890',
    status: 'ACTIVE',
    created_at: '2026-02-01T10:00:00.000Z',
    updated_at: '2026-02-01T10:00:00.000Z',
  },
  {
    id: 'usr-staff-001',
    email: 'staff@metrouni.edu',
    full_name: 'Sarah Jenkins',
    role: 'STAFF',
    phone: '+1 (555) 876-5432',
    status: 'ACTIVE',
    created_at: '2025-10-01T08:00:00.000Z',
    updated_at: '2025-10-01T08:00:00.000Z',
  },
  {
    id: 'usr-admin-001',
    email: 'admin@metrouni.edu',
    full_name: 'Dr. Arthur Vance',
    role: 'ADMIN',
    phone: '+1 (555) 999-0001',
    status: 'ACTIVE',
    created_at: '2025-08-01T08:00:00.000Z',
    updated_at: '2025-08-01T08:00:00.000Z',
  },
];

const INITIAL_STUDENT_PROFILES: StudentProfile[] = [
  {
    id: 'stud-prof-001',
    user_id: 'usr-student-001',
    student_id: '2023-10482',
    program: 'BS Computer Science',
    year_level: '3rd Year',
    contact_number: '+1 (555) 234-5678',
    emergency_contact: 'Elena Dela Cruz (Mother) - +1 (555) 234-9999',
    created_at: '2026-01-15T08:00:00.000Z',
    updated_at: '2026-01-15T08:00:00.000Z',
  },
  {
    id: 'stud-prof-002',
    user_id: 'usr-student-002',
    student_id: '2022-09142',
    program: 'BS Information Technology',
    year_level: '4th Year',
    contact_number: '+1 (555) 345-6789',
    emergency_contact: 'Roberto Santos (Father) - +1 (555) 345-0000',
    created_at: '2026-01-20T09:30:00.000Z',
    updated_at: '2026-01-20T09:30:00.000Z',
  },
  {
    id: 'stud-prof-003',
    user_id: 'usr-student-003',
    student_id: '2024-11005',
    program: 'BS Business Administration',
    year_level: '2nd Year',
    contact_number: '+1 (555) 456-7890',
    emergency_contact: 'Luz Rivera (Mother) - +1 (555) 456-1111',
    created_at: '2026-02-01T10:00:00.000Z',
    updated_at: '2026-02-01T10:00:00.000Z',
  },
];

const INITIAL_STAFF_PROFILES: StaffProfile[] = [
  {
    id: 'staff-prof-001',
    user_id: 'usr-staff-001',
    employee_id: 'EMP-8821',
    department: 'Office of the Registrar',
    designation: 'Registrar Evaluation Officer',
    can_approve: true,
    created_at: '2025-10-01T08:00:00.000Z',
    updated_at: '2025-10-01T08:00:00.000Z',
  },
  {
    id: 'staff-prof-002',
    user_id: 'usr-admin-001',
    employee_id: 'EMP-1001',
    department: 'University Administration',
    designation: 'Chief Registrar & System Administrator',
    can_approve: true,
    created_at: '2025-08-01T08:00:00.000Z',
    updated_at: '2025-08-01T08:00:00.000Z',
  },
];

const INITIAL_DOC_TYPES: DocumentType[] = [
  {
    id: 'doc-type-001',
    code: 'COE',
    name: 'Certificate of Enrollment (COE)',
    description: 'Official certification certifying currently enrolled units, academic semester, and active student status.',
    fee: 50.0,
    processing_days: 2,
    is_active: true,
    requires_approval: true,
    created_at: '2025-08-01T00:00:00.000Z',
    updated_at: '2025-08-01T00:00:00.000Z',
    requirements: [
      {
        id: 'req-001-a',
        document_type_id: 'doc-type-001',
        requirement_name: 'Valid Student ID / Registration Card',
        description: 'Front and back scan of your current semester student ID card.',
        is_mandatory: true,
        file_type: 'PDF, JPG, PNG',
        created_at: '2025-08-01T00:00:00.000Z',
      },
    ],
  },
  {
    id: 'doc-type-002',
    code: 'TOR',
    name: 'Official Transcript of Records (TOR)',
    description: 'Complete official academic record with seal, credit units, grade point average, and registrar signature.',
    fee: 150.0,
    processing_days: 5,
    is_active: true,
    requires_approval: true,
    created_at: '2025-08-01T00:00:00.000Z',
    updated_at: '2025-08-01T00:00:00.000Z',
    requirements: [
      {
        id: 'req-002-a',
        document_type_id: 'doc-type-002',
        requirement_name: 'University Clearance Form',
        description: 'Duly signed clearance from library, laboratory, accounting, and department office.',
        is_mandatory: true,
        file_type: 'PDF, JPG, PNG',
        created_at: '2025-08-01T00:00:00.000Z',
      },
      {
        id: 'req-002-b',
        document_type_id: 'doc-type-002',
        requirement_name: 'Recent 2x2 ID Photo',
        description: 'White background, formal attire, recent photo within 6 months.',
        is_mandatory: true,
        file_type: 'JPG, PNG',
        created_at: '2025-08-01T00:00:00.000Z',
      },
    ],
  },
  {
    id: 'doc-type-003',
    code: 'COG',
    name: 'Certificate of Grades (COG)',
    description: 'Summary of grades per term or semester for scholarship, internship, or employment evaluation.',
    fee: 50.0,
    processing_days: 2,
    is_active: true,
    requires_approval: true,
    created_at: '2025-08-01T00:00:00.000Z',
    updated_at: '2025-08-01T00:00:00.000Z',
    requirements: [
      {
        id: 'req-003-a',
        document_type_id: 'doc-type-003',
        requirement_name: 'Student ID Copy',
        description: 'Valid University ID copy.',
        is_mandatory: true,
        file_type: 'PDF, JPG, PNG',
        created_at: '2025-08-01T00:00:00.000Z',
      },
    ],
  },
  {
    id: 'doc-type-004',
    code: 'GMC',
    name: 'Good Moral Certificate',
    description: 'Certification issued by Office of Student Affairs / Registrar attesting to exemplary student conduct.',
    fee: 75.0,
    processing_days: 3,
    is_active: true,
    requires_approval: true,
    created_at: '2025-08-01T00:00:00.000Z',
    updated_at: '2025-08-01T00:00:00.000Z',
    requirements: [
      {
        id: 'req-004-a',
        document_type_id: 'doc-type-004',
        requirement_name: 'OSA Clearance Slip',
        description: 'Cleared discipline records slip from Office of Student Affairs.',
        is_mandatory: true,
        file_type: 'PDF, JPG, PNG',
        created_at: '2025-08-01T00:00:00.000Z',
      },
    ],
  },
  {
    id: 'doc-type-005',
    code: 'CTC',
    name: 'Certified True Copy (CTC)',
    description: 'Official authentication and dry-seal verification of original university documents or diplomas.',
    fee: 40.0,
    processing_days: 2,
    is_active: true,
    requires_approval: false,
    created_at: '2025-08-01T00:00:00.000Z',
    updated_at: '2025-08-01T00:00:00.000Z',
    requirements: [
      {
        id: 'req-005-a',
        document_type_id: 'doc-type-005',
        requirement_name: 'Original Document Scan',
        description: 'Clear, high resolution scan of the original document requiring certification.',
        is_mandatory: true,
        file_type: 'PDF, JPG, PNG',
        created_at: '2025-08-01T00:00:00.000Z',
      },
    ],
  },
  {
    id: 'doc-type-006',
    code: 'DIP',
    name: 'Diploma Replacement / Re-issuance',
    description: 'Second copy parchment diploma with official university seals and replacement notation.',
    fee: 250.0,
    processing_days: 7,
    is_active: true,
    requires_approval: true,
    created_at: '2025-08-01T00:00:00.000Z',
    updated_at: '2025-08-01T00:00:00.000Z',
    requirements: [
      {
        id: 'req-006-a',
        document_type_id: 'doc-type-006',
        requirement_name: 'Notarized Affidavit of Loss / Damage',
        description: 'Legal sworn statement explaining loss or damage of original diploma.',
        is_mandatory: true,
        file_type: 'PDF',
        created_at: '2025-08-01T00:00:00.000Z',
      },
    ],
  },
];

const INITIAL_REQUESTS: DocumentRequest[] = [
  {
    id: 'req-2026-001',
    request_number: 'DR-2026-001042',
    student_id: 'stud-prof-001',
    document_type_id: 'doc-type-001',
    quantity: 2,
    purpose: 'Scholarship Renewal Application at Department of Higher Education',
    release_method: 'PICKUP',
    delivery_address: undefined,
    remarks: 'Needed by Friday for scholarship grant deadline.',
    status: 'SUBMITTED',
    priority: 'HIGH',
    fee: 100.0,
    payment_status: 'PENDING',
    assigned_to: undefined,
    rejection_reason: undefined,
    information_request_note: undefined,
    released_at: undefined,
    released_by: undefined,
    created_at: '2026-08-20T09:15:00.000Z',
    updated_at: '2026-08-20T09:15:00.000Z',
  },
  {
    id: 'req-2026-002',
    request_number: 'DR-2026-000984',
    student_id: 'stud-prof-001',
    document_type_id: 'doc-type-002',
    quantity: 1,
    purpose: 'Graduate School Application - Master of Science Program',
    release_method: 'DIGITAL_COPY',
    delivery_address: undefined,
    remarks: 'Please expedite if possible.',
    status: 'NEEDS_INFORMATION',
    priority: 'URGENT',
    fee: 150.0,
    payment_status: 'PAID',
    assigned_to: 'staff-prof-001',
    rejection_reason: undefined,
    information_request_note: 'Please re-upload a clear, high-resolution scan of your University Clearance with the Accounting seal visible.',
    released_at: undefined,
    released_by: undefined,
    created_at: '2026-08-18T14:20:00.000Z',
    updated_at: '2026-08-19T10:30:00.000Z',
  },
  {
    id: 'req-2026-003',
    request_number: 'DR-2026-000951',
    student_id: 'stud-prof-002',
    document_type_id: 'doc-type-004',
    quantity: 1,
    purpose: 'Internship Placement at Silicon Valley Tech Hub',
    release_method: 'COURIER',
    delivery_address: '450 Innovation Parkway, Suite 200, Tech City, CA 94016',
    remarks: 'Direct delivery to company HR department.',
    status: 'PROCESSING',
    priority: 'NORMAL',
    fee: 75.0,
    payment_status: 'PAID',
    assigned_to: 'staff-prof-001',
    rejection_reason: undefined,
    information_request_note: undefined,
    released_at: undefined,
    released_by: undefined,
    created_at: '2026-08-16T11:00:00.000Z',
    updated_at: '2026-08-17T15:45:00.000Z',
  },
  {
    id: 'req-2026-004',
    request_number: 'DR-2026-000889',
    student_id: 'stud-prof-001',
    document_type_id: 'doc-type-005',
    quantity: 3,
    purpose: 'Board Examination Licensure Requirement',
    release_method: 'PICKUP',
    delivery_address: undefined,
    remarks: 'Documents printed and authenticated with dry seal.',
    status: 'READY_FOR_RELEASE',
    priority: 'NORMAL',
    fee: 120.0,
    payment_status: 'PAID',
    assigned_to: 'staff-prof-001',
    rejection_reason: undefined,
    information_request_note: undefined,
    released_at: undefined,
    released_by: undefined,
    created_at: '2026-08-12T08:30:00.000Z',
    updated_at: '2026-08-14T16:00:00.000Z',
  },
  {
    id: 'req-2026-005',
    request_number: 'DR-2026-000812',
    student_id: 'stud-prof-003',
    document_type_id: 'doc-type-003',
    quantity: 1,
    purpose: 'Visa and Foreign Exchange Student Application',
    release_method: 'PICKUP',
    delivery_address: undefined,
    remarks: 'Claimed in person by student at Window 3.',
    status: 'RELEASED',
    priority: 'NORMAL',
    fee: 50.0,
    payment_status: 'PAID',
    assigned_to: 'staff-prof-001',
    rejection_reason: undefined,
    information_request_note: undefined,
    released_at: '2026-08-10T14:30:00.000Z',
    released_by: 'staff-prof-001',
    created_at: '2026-08-08T09:00:00.000Z',
    updated_at: '2026-08-10T14:30:00.000Z',
  },
];

const INITIAL_STATUS_HISTORY: RequestStatusHistory[] = [
  {
    id: 'hist-001',
    request_id: 'req-2026-001',
    previous_status: undefined,
    new_status: 'SUBMITTED',
    changed_by: 'usr-student-001',
    reason: undefined,
    comment: 'Request submitted online by student.',
    created_at: '2026-08-20T09:15:00.000Z',
    changed_by_user: {
      full_name: INITIAL_PROFILES[0].full_name,
      role: INITIAL_PROFILES[0].role,
      email: INITIAL_PROFILES[0].email,
    },
  },
  {
    id: 'hist-002',
    request_id: 'req-2026-002',
    previous_status: 'SUBMITTED',
    new_status: 'UNDER_REVIEW',
    changed_by: 'usr-staff-001',
    reason: undefined,
    comment: 'Evaluating requirements and academic record.',
    created_at: '2026-08-18T16:00:00.000Z',
    changed_by_user: {
      full_name: INITIAL_PROFILES[3].full_name,
      role: INITIAL_PROFILES[3].role,
      email: INITIAL_PROFILES[3].email,
    },
  },
  {
    id: 'hist-003',
    request_id: 'req-2026-002',
    previous_status: 'UNDER_REVIEW',
    new_status: 'NEEDS_INFORMATION',
    changed_by: 'usr-staff-001',
    reason: 'Clearance stamp illegible',
    comment: 'Please re-upload a clear, high-resolution scan of your University Clearance with the Accounting seal visible.',
    created_at: '2026-08-19T10:30:00.000Z',
    changed_by_user: {
      full_name: INITIAL_PROFILES[3].full_name,
      role: INITIAL_PROFILES[3].role,
      email: INITIAL_PROFILES[3].email,
    },
  },
  {
    id: 'hist-004',
    request_id: 'req-2026-004',
    previous_status: 'PROCESSING',
    new_status: 'READY_FOR_RELEASE',
    changed_by: 'usr-staff-001',
    reason: undefined,
    comment: 'Document printed, stamped, and ready at Registrar Window 3.',
    created_at: '2026-08-14T16:00:00.000Z',
    changed_by_user: {
      full_name: INITIAL_PROFILES[3].full_name,
      role: INITIAL_PROFILES[3].role,
      email: INITIAL_PROFILES[3].email,
    },
  },
];

const INITIAL_INTERNAL_NOTES: RequestInternalNote[] = [
  {
    id: 'note-001',
    request_id: 'req-2026-002',
    author_id: 'usr-staff-001',
    note: 'Student called Registrar hot-line inquiring about expedite processing. Informed about clearance verification requirement.',
    created_at: '2026-08-19T09:45:00.000Z',
    author: {
      full_name: INITIAL_PROFILES[3].full_name,
      role: INITIAL_PROFILES[3].role,
    },
  },
  {
    id: 'note-002',
    request_id: 'req-2026-004',
    author_id: 'usr-staff-001',
    note: 'Dry seal applied by Officer Sarah. Tagged for priority window dispatch.',
    created_at: '2026-08-14T15:30:00.000Z',
    author: {
      full_name: INITIAL_PROFILES[3].full_name,
      role: INITIAL_PROFILES[3].role,
    },
  },
];

const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 'notif-001',
    user_id: 'usr-student-001',
    request_id: 'req-2026-002',
    title: 'Action Required on Request DR-2026-000984',
    message: 'Your Official Transcript of Records requires additional clearance information before it can proceed.',
    type: 'WARNING',
    is_read: false,
    created_at: '2026-08-19T10:30:00.000Z',
  },
  {
    id: 'notif-002',
    user_id: 'usr-student-001',
    request_id: 'req-2026-004',
    title: 'Documents Ready for Claiming: DR-2026-000889',
    message: 'Your Certified True Copies are printed and ready for pickup at Registrar Window 3.',
    type: 'SUCCESS',
    is_read: false,
    created_at: '2026-08-14T16:00:00.000Z',
  },
  {
    id: 'notif-003',
    user_id: 'usr-staff-001',
    request_id: 'req-2026-001',
    title: 'New High Priority Document Request',
    message: 'Juan Dela Cruz submitted a High Priority request for Certificate of Enrollment (COE).',
    type: 'INFO',
    is_read: false,
    created_at: '2026-08-20T09:15:00.000Z',
  },
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-001',
    user_id: 'usr-staff-001',
    action: 'STATUS_CHANGED',
    entity_type: 'requests',
    entity_id: 'req-2026-004',
    details: { from: 'PROCESSING', to: 'READY_FOR_RELEASE', request_number: 'DR-2026-000889', remarks: 'Seals applied. Ready at Window 3' },
    created_at: '2026-08-20T11:45:00.000Z',
    user: {
      full_name: INITIAL_PROFILES[3].full_name,
      email: INITIAL_PROFILES[3].email,
      role: INITIAL_PROFILES[3].role,
    },
  },
  {
    id: 'audit-002',
    user_id: 'usr-student-001',
    action: 'REQUEST_CREATED',
    entity_type: 'requests',
    entity_id: 'req-2026-001',
    details: { request_number: 'DR-2026-001042', document_type: 'Certificate of Enrollment (COE)', quantity: 2 },
    created_at: '2026-08-20T09:15:00.000Z',
    user: {
      full_name: INITIAL_PROFILES[0].full_name,
      email: INITIAL_PROFILES[0].email,
      role: INITIAL_PROFILES[0].role,
    },
  },
  {
    id: 'audit-003',
    user_id: 'usr-staff-001',
    action: 'REQUIREMENT_APPROVED',
    entity_type: 'requirement_verification',
    entity_id: 'rri-001-1',
    details: { request_id: 'req-2026-001', request_number: 'DR-2026-001042', requirement_name: 'Valid Student ID / Registration Card' },
    created_at: '2026-08-20T08:30:00.000Z',
    user: {
      full_name: INITIAL_PROFILES[3].full_name,
      email: INITIAL_PROFILES[3].email,
      role: INITIAL_PROFILES[3].role,
    },
  },
  {
    id: 'audit-004',
    user_id: 'usr-staff-001',
    action: 'STATUS_CHANGED',
    entity_type: 'requests',
    entity_id: 'req-2026-002',
    details: { from: 'UNDER_REVIEW', to: 'NEEDS_INFORMATION', request_number: 'DR-2026-000984', reason: 'Missing Clearance Slip' },
    created_at: '2026-08-19T10:30:00.000Z',
    user: {
      full_name: INITIAL_PROFILES[3].full_name,
      email: INITIAL_PROFILES[3].email,
      role: INITIAL_PROFILES[3].role,
    },
  },
  {
    id: 'audit-005',
    user_id: 'usr-student-002',
    action: 'REQUIREMENT_SUBMITTED',
    entity_type: 'requirement_verification',
    entity_id: 'rri-002-1',
    details: { request_id: 'req-2026-002', request_number: 'DR-2026-000984', requirement_name: 'University Clearance Form', version: 2 },
    created_at: '2026-08-19T09:45:00.000Z',
    user: {
      full_name: INITIAL_PROFILES[1].full_name,
      email: INITIAL_PROFILES[1].email,
      role: INITIAL_PROFILES[1].role,
    },
  },
  {
    id: 'audit-006',
    user_id: 'usr-admin-001',
    action: 'REQUEST_APPROVED',
    entity_type: 'requests',
    entity_id: 'req-2026-003',
    details: { request_number: 'DR-2026-000912', document_type: 'Diploma Replacement', approved_by: 'Dr. Arthur Vance' },
    created_at: '2026-08-18T14:20:00.000Z',
    user: {
      full_name: INITIAL_PROFILES[4].full_name,
      email: INITIAL_PROFILES[4].email,
      role: INITIAL_PROFILES[4].role,
    },
  },
  {
    id: 'audit-007',
    user_id: 'usr-staff-001',
    action: 'STATUS_CHANGED',
    entity_type: 'requests',
    entity_id: 'req-2026-003',
    details: { from: 'FOR_APPROVAL', to: 'PROCESSING', request_number: 'DR-2026-000912' },
    created_at: '2026-08-18T14:35:00.000Z',
    user: {
      full_name: INITIAL_PROFILES[3].full_name,
      email: INITIAL_PROFILES[3].email,
      role: INITIAL_PROFILES[3].role,
    },
  },
  {
    id: 'audit-008',
    user_id: 'usr-staff-001',
    action: 'DOCUMENT_RELEASED',
    entity_type: 'requests',
    entity_id: 'req-2026-005',
    details: { request_number: 'DR-2026-000755', document_type: 'Good Moral Certificate', release_method: 'PICKUP' },
    created_at: '2026-08-17T16:10:00.000Z',
    user: {
      full_name: INITIAL_PROFILES[3].full_name,
      email: INITIAL_PROFILES[3].email,
      role: INITIAL_PROFILES[3].role,
    },
  },
  {
    id: 'audit-009',
    user_id: 'usr-student-003',
    action: 'REQUEST_CREATED',
    entity_type: 'requests',
    entity_id: 'req-2026-005',
    details: { request_number: 'DR-2026-000755', document_type: 'Good Moral Certificate', quantity: 1 },
    created_at: '2026-08-16T11:00:00.000Z',
    user: {
      full_name: INITIAL_PROFILES[2].full_name,
      email: INITIAL_PROFILES[2].email,
      role: INITIAL_PROFILES[2].role,
    },
  },
  {
    id: 'audit-010',
    user_id: 'usr-admin-001',
    action: 'SETTINGS_CHANGED',
    entity_type: 'system_settings',
    entity_id: '00000000-0000-0000-0000-000000000001',
    details: { office_hours: 'Monday - Friday, 8:00 AM - 5:00 PM', default_processing_time_days: 3 },
    created_at: '2026-08-15T08:00:00.000Z',
    user: {
      full_name: INITIAL_PROFILES[4].full_name,
      email: INITIAL_PROFILES[4].email,
      role: INITIAL_PROFILES[4].role,
    },
  },
  {
    id: 'audit-011',
    user_id: 'usr-staff-001',
    action: 'REQUEST_UPDATED',
    entity_type: 'requests',
    entity_id: 'req-2026-001',
    details: { priority: 'URGENT', reason: 'Scholarship deadline expedition' },
    created_at: '2026-08-14T13:15:00.000Z',
    user: {
      full_name: INITIAL_PROFILES[3].full_name,
      email: INITIAL_PROFILES[3].email,
      role: INITIAL_PROFILES[3].role,
    },
  },
  {
    id: 'audit-012',
    user_id: 'usr-admin-001',
    action: 'DOCUMENT_TYPE_UPDATED',
    entity_type: 'document_types',
    entity_id: 'doc-type-002',
    details: { document_type_name: 'Official Transcript of Records (TOR)', fee: 150 },
    created_at: '2026-08-10T10:00:00.000Z',
    user: {
      full_name: INITIAL_PROFILES[4].full_name,
      email: INITIAL_PROFILES[4].email,
      role: INITIAL_PROFILES[4].role,
    },
  },
];

const INITIAL_REQUIREMENT_ITEMS: RequestRequirementItem[] = [
  // req-2026-001 (Certificate of Enrollment - COE) -> Student ID Uploaded & UNDER_REVIEW
  {
    id: 'rri-001-1',
    request_id: 'req-2026-001',
    requirement_id: 'req-001-a',
    requirement_name: 'Valid Student ID / Registration Card',
    description: 'Front and back scan of your current semester student ID card.',
    is_mandatory: true,
    file_type: 'PDF, JPG, PNG',
    max_file_size_mb: 10,
    allow_multiple: false,
    current_status: 'UNDER_REVIEW',
    current_version: 1,
    latest_reviewer_name: null,
    latest_review_date: null,
    latest_reason: null,
    latest_remarks: 'Uploaded by student upon request submission. Awaiting registrar verification.',
    latest_files: [
      {
        id: 'file-001-1',
        file_name: 'Juan_Dela_Cruz_Student_ID_2026.png',
        storage_path: 'mock-files/req-2026-001/Juan_Dela_Cruz_Student_ID_2026.png',
        file_size: 524288,
        mime_type: 'image/png',
        preview_url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=80',
        uploaded_at: '2026-08-20T09:15:00.000Z',
      },
    ],
    version_history: [
      {
        id: 'rev-001-1-v1',
        version: 1,
        status: 'UNDER_REVIEW',
        reviewer_id: null,
        reviewer_name: null,
        reviewer_role: null,
        review_date: null,
        rejection_reason_code: null,
        rejection_reason_text: null,
        remarks: 'Initial student submission',
        checklist_results: {
          correct_document: true,
          student_info_matches: true,
          required_info_complete: true,
          is_readable: true,
          meets_requirements: true,
        },
        files: [
          {
            id: 'file-001-1',
            file_name: 'Juan_Dela_Cruz_Student_ID_2026.png',
            storage_path: 'mock-files/req-2026-001/Juan_Dela_Cruz_Student_ID_2026.png',
            file_size: 524288,
            mime_type: 'image/png',
            preview_url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=80',
            uploaded_at: '2026-08-20T09:15:00.000Z',
          },
        ],
        created_at: '2026-08-20T09:15:00.000Z',
      },
    ],
  },
  // req-2026-002 (TOR) -> Req 1: Clearance Form (NEEDS_RESUBMISSION), Req 2: 2x2 ID Photo (APPROVED)
  {
    id: 'rri-002-1',
    request_id: 'req-2026-002',
    requirement_id: 'req-002-a',
    requirement_name: 'University Clearance Form',
    description: 'Duly signed clearance from library, laboratory, accounting, and department office.',
    is_mandatory: true,
    file_type: 'PDF, JPG, PNG',
    max_file_size_mb: 10,
    allow_multiple: true,
    current_status: 'NEEDS_RESUBMISSION',
    current_version: 1,
    latest_reviewer_name: 'Sarah Jenkins (Registrar Evaluation Officer)',
    latest_review_date: '2026-08-19T10:30:00.000Z',
    latest_reason: 'Accounting seal missing or unreadable on page 2',
    latest_remarks: 'The Treasury/Accounting clearance stamp on page 2 is cut off at the bottom corner. Please provide a clear, full-page flat scan.',
    latest_files: [
      {
        id: 'file-002-1',
        file_name: 'Clearance_Form_Semester2.pdf',
        storage_path: 'mock-files/req-2026-002/Clearance_Form_Semester2.pdf',
        file_size: 1048576,
        mime_type: 'application/pdf',
        preview_url: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=800&auto=format&fit=crop&q=80',
        uploaded_at: '2026-08-18T14:20:00.000Z',
      },
    ],
    version_history: [
      {
        id: 'rev-002-1-v1',
        version: 1,
        status: 'NEEDS_RESUBMISSION',
        reviewer_id: 'usr-staff-001',
        reviewer_name: 'Sarah Jenkins',
        reviewer_role: 'STAFF',
        review_date: '2026-08-19T10:30:00.000Z',
        rejection_reason_code: 'MISSING_INFORMATION',
        rejection_reason_text: 'Accounting seal missing or unreadable on page 2',
        remarks: 'The Treasury/Accounting clearance stamp on page 2 is cut off at the bottom corner. Please provide a clear, full-page flat scan.',
        checklist_results: {
          correct_document: true,
          student_info_matches: true,
          required_info_complete: false,
          is_readable: false,
          meets_requirements: false,
        },
        files: [
          {
            id: 'file-002-1',
            file_name: 'Clearance_Form_Semester2.pdf',
            storage_path: 'mock-files/req-2026-002/Clearance_Form_Semester2.pdf',
            file_size: 1048576,
            mime_type: 'application/pdf',
            preview_url: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=800&auto=format&fit=crop&q=80',
            uploaded_at: '2026-08-18T14:20:00.000Z',
          },
        ],
        created_at: '2026-08-19T10:30:00.000Z',
      },
    ],
  },
  {
    id: 'rri-002-2',
    request_id: 'req-2026-002',
    requirement_id: 'req-002-b',
    requirement_name: 'Recent 2x2 ID Photo',
    description: 'White background, formal attire, recent photo within 6 months.',
    is_mandatory: true,
    file_type: 'JPG, PNG',
    max_file_size_mb: 5,
    allow_multiple: false,
    current_status: 'APPROVED',
    current_version: 1,
    latest_reviewer_name: 'Sarah Jenkins (Registrar Evaluation Officer)',
    latest_review_date: '2026-08-19T10:25:00.000Z',
    latest_reason: null,
    latest_remarks: 'Photo meets official diploma/transcript standards. Clean white background and formal collar attire.',
    latest_files: [
      {
        id: 'file-002-2',
        file_name: 'DelaCruz_2x2_Formal_Photo.jpg',
        storage_path: 'mock-files/req-2026-002/DelaCruz_2x2_Formal_Photo.jpg',
        file_size: 345000,
        mime_type: 'image/jpeg',
        preview_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
        uploaded_at: '2026-08-18T14:20:00.000Z',
      },
    ],
    version_history: [
      {
        id: 'rev-002-2-v1',
        version: 1,
        status: 'APPROVED',
        reviewer_id: 'usr-staff-001',
        reviewer_name: 'Sarah Jenkins',
        reviewer_role: 'STAFF',
        review_date: '2026-08-19T10:25:00.000Z',
        rejection_reason_code: null,
        rejection_reason_text: null,
        remarks: 'Photo meets official diploma/transcript standards.',
        checklist_results: {
          correct_document: true,
          student_info_matches: true,
          required_info_complete: true,
          is_readable: true,
          meets_requirements: true,
        },
        files: [
          {
            id: 'file-002-2',
            file_name: 'DelaCruz_2x2_Formal_Photo.jpg',
            storage_path: 'mock-files/req-2026-002/DelaCruz_2x2_Formal_Photo.jpg',
            file_size: 345000,
            mime_type: 'image/jpeg',
            preview_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=80',
            uploaded_at: '2026-08-18T14:20:00.000Z',
          },
        ],
        created_at: '2026-08-19T10:25:00.000Z',
      },
    ],
  },
  // req-2026-003 (Good Moral Certificate) -> req-004-a (OSA Clearance Slip) -> APPROVED
  {
    id: 'rri-003-1',
    request_id: 'req-2026-003',
    requirement_id: 'req-004-a',
    requirement_name: 'OSA Clearance Slip',
    description: 'Cleared discipline records slip from Office of Student Affairs.',
    is_mandatory: true,
    file_type: 'PDF, JPG, PNG',
    max_file_size_mb: 10,
    allow_multiple: false,
    current_status: 'APPROVED',
    current_version: 1,
    latest_reviewer_name: 'Sarah Jenkins',
    latest_review_date: '2026-08-16T14:10:00.000Z',
    latest_reason: null,
    latest_remarks: 'OSA disciplinary clearance validated and on file.',
    latest_files: [
      {
        id: 'file-003-1',
        file_name: 'OSA_Clearance_Slip_2026.pdf',
        storage_path: 'mock-files/req-2026-003/OSA_Clearance_Slip_2026.pdf',
        file_size: 612000,
        mime_type: 'application/pdf',
        preview_url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=80',
        uploaded_at: '2026-08-16T11:00:00.000Z',
      },
    ],
    version_history: [
      {
        id: 'rev-003-1-v1',
        version: 1,
        status: 'APPROVED',
        reviewer_id: 'usr-staff-001',
        reviewer_name: 'Sarah Jenkins',
        reviewer_role: 'STAFF',
        review_date: '2026-08-16T14:10:00.000Z',
        remarks: 'OSA disciplinary clearance validated and on file.',
        checklist_results: {
          correct_document: true,
          student_info_matches: true,
          required_info_complete: true,
          is_readable: true,
          meets_requirements: true,
        },
        files: [
          {
            id: 'file-003-1',
            file_name: 'OSA_Clearance_Slip_2026.pdf',
            storage_path: 'mock-files/req-2026-003/OSA_Clearance_Slip_2026.pdf',
            file_size: 612000,
            mime_type: 'application/pdf',
            preview_url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=80',
            uploaded_at: '2026-08-16T11:00:00.000Z',
          },
        ],
        created_at: '2026-08-16T14:10:00.000Z',
      },
    ],
  },
  // req-2026-004 (CTC) -> req-005-a (Original Document Scan) -> APPROVED
  {
    id: 'rri-004-1',
    request_id: 'req-2026-004',
    requirement_id: 'req-005-a',
    requirement_name: 'Original Document Scan',
    description: 'Clear, high resolution scan of the original document requiring certification.',
    is_mandatory: true,
    file_type: 'PDF, JPG, PNG',
    max_file_size_mb: 15,
    allow_multiple: true,
    current_status: 'APPROVED',
    current_version: 1,
    latest_reviewer_name: 'Sarah Jenkins',
    latest_review_date: '2026-08-12T10:00:00.000Z',
    latest_reason: null,
    latest_remarks: 'Verified against university microfilms. Ready for dry seal authentication.',
    latest_files: [
      {
        id: 'file-004-1',
        file_name: 'Original_Diploma_Scan_HighRes.pdf',
        storage_path: 'mock-files/req-2026-004/Original_Diploma_Scan_HighRes.pdf',
        file_size: 2048000,
        mime_type: 'application/pdf',
        preview_url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=80',
        uploaded_at: '2026-08-12T08:30:00.000Z',
      },
    ],
    version_history: [
      {
        id: 'rev-004-1-v1',
        version: 1,
        status: 'APPROVED',
        reviewer_id: 'usr-staff-001',
        reviewer_name: 'Sarah Jenkins',
        reviewer_role: 'STAFF',
        review_date: '2026-08-12T10:00:00.000Z',
        remarks: 'Original document scan verified against university permanent records.',
        checklist_results: {
          correct_document: true,
          student_info_matches: true,
          required_info_complete: true,
          is_readable: true,
          meets_requirements: true,
        },
        files: [
          {
            id: 'file-004-1',
            file_name: 'Original_Diploma_Scan_HighRes.pdf',
            storage_path: 'mock-files/req-2026-004/Original_Diploma_Scan_HighRes.pdf',
            file_size: 2048000,
            mime_type: 'application/pdf',
            preview_url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=80',
            uploaded_at: '2026-08-12T08:30:00.000Z',
          },
        ],
        created_at: '2026-08-12T10:00:00.000Z',
      },
    ],
  },
  // req-2026-005 (COG) -> req-003-a (Student ID Copy) -> APPROVED
  {
    id: 'rri-005-1',
    request_id: 'req-2026-005',
    requirement_id: 'req-003-a',
    requirement_name: 'Student ID Copy',
    description: 'Valid University ID copy.',
    is_mandatory: true,
    file_type: 'PDF, JPG, PNG',
    max_file_size_mb: 5,
    allow_multiple: false,
    current_status: 'APPROVED',
    current_version: 1,
    latest_reviewer_name: 'Sarah Jenkins',
    latest_review_date: '2026-08-08T11:00:00.000Z',
    latest_reason: null,
    latest_remarks: 'ID verified and matched with student profile.',
    latest_files: [
      {
        id: 'file-005-1',
        file_name: 'Student_ID_Alex_Rivera.png',
        storage_path: 'mock-files/req-2026-005/Student_ID_Alex_Rivera.png',
        file_size: 420000,
        mime_type: 'image/png',
        preview_url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=80',
        uploaded_at: '2026-08-08T09:00:00.000Z',
      },
    ],
    version_history: [
      {
        id: 'rev-005-1-v1',
        version: 1,
        status: 'APPROVED',
        reviewer_id: 'usr-staff-001',
        reviewer_name: 'Sarah Jenkins',
        reviewer_role: 'STAFF',
        review_date: '2026-08-08T11:00:00.000Z',
        remarks: 'ID verified and matched with student profile.',
        checklist_results: {
          correct_document: true,
          student_info_matches: true,
          required_info_complete: true,
          is_readable: true,
          meets_requirements: true,
        },
        files: [
          {
            id: 'file-005-1',
            file_name: 'Student_ID_Alex_Rivera.png',
            storage_path: 'mock-files/req-2026-005/Student_ID_Alex_Rivera.png',
            file_size: 420000,
            mime_type: 'image/png',
            preview_url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=80',
            uploaded_at: '2026-08-08T09:00:00.000Z',
          },
        ],
        created_at: '2026-08-08T11:00:00.000Z',
      },
    ],
  },
];

const INITIAL_SETTINGS: SystemSettings = {
  id: '00000000-0000-0000-0000-000000000001',
  school_name: 'Metropolitan State University',
  school_code: 'MSU-MAIN',
  office_name: 'Office of the University Registrar',
  office_address: 'Academic Hall 101, University Boulevard',
  contact_number: '+1 (555) 019-2834',
  email: 'registrar@metrouni.edu',
  office_hours: 'Monday - Friday, 8:00 AM - 5:00 PM',
  release_instructions: 'Present your valid Student ID or Government ID upon claiming at Window 3.',
  default_processing_time_days: 3,
  request_prefix: 'DR',
  max_upload_size_mb: 10,
  allowed_file_types: 'image/jpeg,image/png,application/pdf',
  maintenance_mode: false,
  updated_at: '2026-08-20T00:00:00.000Z',
};

class LocalMockStore {
  private state: LocalMockState;

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): LocalMockState {
    if (typeof window === 'undefined') {
      return this.getInitialState();
    }
    try {
      const stored = localStorage.getItem(STORE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load local store:', e);
    }
    const init = this.getInitialState();
    this.saveState(init);
    return init;
  }

  private getInitialState(): LocalMockState {
    return {
      profiles: [...INITIAL_PROFILES],
      studentProfiles: [...INITIAL_STUDENT_PROFILES],
      staffProfiles: [...INITIAL_STAFF_PROFILES],
      documentTypes: [...INITIAL_DOC_TYPES],
      requests: [...INITIAL_REQUESTS],
      requirementItems: [...INITIAL_REQUIREMENT_ITEMS],
      attachments: [],
      statusHistory: [...INITIAL_STATUS_HISTORY],
      internalNotes: [...INITIAL_INTERNAL_NOTES],
      notifications: [...INITIAL_NOTIFICATIONS],
      auditLogs: [...INITIAL_AUDIT_LOGS],
      systemSettings: { ...INITIAL_SETTINGS },
      currentUserId: 'usr-student-001', // Default to active student
    };
  }

  private saveState(state: LocalMockState) {
    this.state = state;
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify(state));
      } catch (e) {
        console.warn('Failed to persist local store:', e);
      }
    }
  }

  public resetToDefault(): void {
    const init = this.getInitialState();
    this.saveState(init);
  }

  public getState(): LocalMockState {
    return this.state;
  }

  // --- AUTH & USERS ---
  public getCurrentUser(): UserProfile | null {
    if (!this.state.currentUserId) return null;
    return this.state.profiles.find((p) => p.id === this.state.currentUserId) || null;
  }

  public setCurrentUserId(userId: string | null): void {
    this.saveState({ ...this.state, currentUserId: userId });
  }

  public getUserById(id: string): UserProfile | null {
    return this.state.profiles.find((p) => p.id === id) || null;
  }

  public getUserByEmail(email: string): UserProfile | null {
    return this.state.profiles.find((p) => p.email.toLowerCase() === email.toLowerCase()) || null;
  }

  public getStudentProfileByUserId(userId: string): StudentProfile | null {
    return this.state.studentProfiles.find((s) => s.user_id === userId) || null;
  }

  public getStaffProfileByUserId(userId: string): StaffProfile | null {
    return this.state.staffProfiles.find((s) => s.user_id === userId) || null;
  }

  public createStudentUser(params: {
    email: string;
    fullName: string;
    studentId: string;
    program: string;
    yearLevel: string;
    phone?: string;
    emergencyContact?: string;
  }): { profile: UserProfile; studentProfile: StudentProfile } {
    const userId = `usr-stud-${Date.now()}`;
    const newProfile: UserProfile = {
      id: userId,
      email: params.email,
      full_name: params.fullName,
      role: 'STUDENT',
      phone: params.phone || null,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const newStudentProfile: StudentProfile = {
      id: `stud-prof-${Date.now()}`,
      user_id: userId,
      student_id: params.studentId,
      program: params.program,
      year_level: params.yearLevel,
      contact_number: params.phone || null,
      emergency_contact: params.emergencyContact || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const updatedProfiles = [newProfile, ...this.state.profiles];
    const updatedStudentProfiles = [newStudentProfile, ...this.state.studentProfiles];

    this.saveState({
      ...this.state,
      profiles: updatedProfiles,
      studentProfiles: updatedStudentProfiles,
      currentUserId: userId,
    });

    this.addAuditLog({
      user_id: userId,
      action: 'USER_CREATED',
      entity_type: 'profiles',
      entity_id: userId,
      details: { role: 'STUDENT', email: params.email, student_id: params.studentId },
    });

    return { profile: newProfile, studentProfile: newStudentProfile };
  }

  public updateProfile(
    userId: string,
    updates: { full_name?: string; phone?: string | null },
    studentUpdates?: Partial<StudentProfile>
  ): void {
    const profiles = this.state.profiles.map((p) =>
      p.id === userId ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
    );

    let studentProfiles = this.state.studentProfiles;
    if (studentUpdates) {
      studentProfiles = studentProfiles.map((s) =>
        s.user_id === userId ? { ...s, ...studentUpdates, updated_at: new Date().toISOString() } : s
      );
    }

    this.saveState({ ...this.state, profiles, studentProfiles });
    this.addAuditLog({
      user_id: userId,
      action: 'USER_UPDATED',
      entity_type: 'profiles',
      entity_id: userId,
      details: { updates, studentUpdates },
    });
  }

  public updateUserRoleAndStatus(userId: string, role: UserRole, status: 'ACTIVE' | 'INACTIVE'): void {
    const profiles = this.state.profiles.map((p) =>
      p.id === userId ? { ...p, role, status, updated_at: new Date().toISOString() } : p
    );

    let staffProfiles = [...this.state.staffProfiles];
    if (role === 'STAFF' || role === 'ADMIN') {
      const existing = staffProfiles.find((s) => s.user_id === userId);
      if (!existing) {
        staffProfiles.push({
          id: `staff-prof-${Date.now()}`,
          user_id: userId,
          employee_id: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
          department: role === 'ADMIN' ? 'Registrar Leadership' : 'Office of the Registrar',
          designation: role === 'ADMIN' ? 'Administrator' : 'Registrar Officer',
          can_approve: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    }

    this.saveState({ ...this.state, profiles, staffProfiles });
    this.addAuditLog({
      user_id: this.state.currentUserId,
      action: 'USER_UPDATED',
      entity_type: 'profiles',
      entity_id: userId,
      details: { new_role: role, new_status: status },
    });
  }

  public getAllUsers(): UserProfile[] {
    return this.state.profiles.map((p) => {
      const stud = this.state.studentProfiles.find((s) => s.user_id === p.id);
      const staff = this.state.staffProfiles.find((s) => s.user_id === p.id);
      return {
        ...p,
        student_profile: stud,
        staff_profile: staff,
      };
    });
  }

  // --- DOCUMENT TYPES ---
  public getDocumentTypes(onlyActive: boolean = false): DocumentType[] {
    let docs = this.state.documentTypes;
    if (onlyActive) {
      docs = docs.filter((d) => d.is_active);
    }
    return docs;
  }

  public createDocumentType(
    doc: Omit<DocumentType, 'id' | 'created_at' | 'updated_at' | 'requirements'>,
    requirements: any[] = []
  ): DocumentType {
    const docId = `doc-type-${Date.now()}`;
    const newDoc: DocumentType = {
      ...doc,
      id: docId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      requirements: requirements.map((r, i) => ({
        id: `req-${Date.now()}-${i}`,
        document_type_id: docId,
        requirement_name: r.requirement_name,
        description: r.description,
        is_mandatory: r.is_mandatory ?? true,
        file_type: r.file_type || 'PDF, JPG, PNG',
        created_at: new Date().toISOString(),
      })),
    };

    this.saveState({
      ...this.state,
      documentTypes: [newDoc, ...this.state.documentTypes],
    });

    this.addAuditLog({
      user_id: this.state.currentUserId,
      action: 'DOCUMENT_TYPE_CREATED',
      entity_type: 'document_types',
      entity_id: docId,
      details: { name: newDoc.name, code: newDoc.code, fee: newDoc.fee },
    });

    return newDoc;
  }

  public updateDocumentType(id: string, updates: Partial<DocumentType>): DocumentType {
    const docTypes = this.state.documentTypes.map((d) =>
      d.id === id ? { ...d, ...updates, updated_at: new Date().toISOString() } : d
    );
    const updated = docTypes.find((d) => d.id === id)!;
    this.saveState({ ...this.state, documentTypes: docTypes });

    this.addAuditLog({
      user_id: this.state.currentUserId,
      action: 'DOCUMENT_TYPE_UPDATED',
      entity_type: 'document_types',
      entity_id: id,
      details: updates,
    });

    return updated;
  }

  public deleteDocumentType(id: string): void {
    const docTypes = this.state.documentTypes.filter((d) => d.id !== id);
    this.saveState({ ...this.state, documentTypes: docTypes });
  }

  public addRequirement(docTypeId: string, req: any): DocumentRequirement {
    const newReq: DocumentRequirement = {
      id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      document_type_id: docTypeId,
      requirement_name: req.requirement_name,
      description: req.description || null,
      is_mandatory: req.is_mandatory ?? true,
      file_type: req.file_type || 'PDF, JPG, PNG',
      max_file_size_mb: req.max_file_size_mb || 10,
      allow_multiple: req.allow_multiple ?? false,
      conditional_rule: req.conditional_rule || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const docTypes = this.state.documentTypes.map((d) => {
      if (d.id === docTypeId) {
        return {
          ...d,
          requirements: [...(d.requirements || []), newReq],
          updated_at: new Date().toISOString(),
        };
      }
      return d;
    });

    this.saveState({ ...this.state, documentTypes: docTypes });

    this.addAuditLog({
      user_id: this.state.currentUserId,
      action: 'REQUIREMENT_ADDED',
      entity_type: 'document_requirements',
      entity_id: newReq.id,
      details: { docTypeId, requirement_name: newReq.requirement_name, is_mandatory: newReq.is_mandatory },
    });

    return newReq;
  }

  public updateRequirement(reqId: string, updates: Partial<DocumentRequirement>): DocumentRequirement | null {
    let updatedReq: DocumentRequirement | null = null;
    let parentDocId = '';

    const docTypes = this.state.documentTypes.map((d) => {
      const hasReq = (d.requirements || []).some((r) => r.id === reqId);
      if (hasReq) {
        parentDocId = d.id;
        const updatedReqs = (d.requirements || []).map((r) => {
          if (r.id === reqId) {
            updatedReq = { ...r, ...updates, updated_at: new Date().toISOString() };
            return updatedReq;
          }
          return r;
        });
        return { ...d, requirements: updatedReqs, updated_at: new Date().toISOString() };
      }
      return d;
    });

    this.saveState({ ...this.state, documentTypes: docTypes });

    if (updatedReq) {
      this.addAuditLog({
        user_id: this.state.currentUserId,
        action: 'REQUIREMENT_UPDATED',
        entity_type: 'document_requirements',
        entity_id: reqId,
        details: { docTypeId: parentDocId, updates },
      });
    }

    return updatedReq;
  }

  public deleteRequirement(reqId: string): void {
    let parentDocId = '';
    let deletedName = '';

    const docTypes = this.state.documentTypes.map((d) => {
      const target = (d.requirements || []).find((r) => r.id === reqId);
      if (target) {
        parentDocId = d.id;
        deletedName = target.requirement_name;
      }
      return {
        ...d,
        requirements: (d.requirements || []).filter((r) => r.id !== reqId),
      };
    });

    this.saveState({ ...this.state, documentTypes: docTypes });

    this.addAuditLog({
      user_id: this.state.currentUserId,
      action: 'REQUIREMENT_DELETED',
      entity_type: 'document_requirements',
      entity_id: reqId,
      details: { docTypeId: parentDocId, requirement_name: deletedName },
    });
  }

  public reorderRequirements(docTypeId: string, orderedIds: string[]): void {
    const docTypes = this.state.documentTypes.map((d) => {
      if (d.id === docTypeId && d.requirements) {
        const reqMap = new Map(d.requirements.map((r) => [r.id, r]));
        const reordered: DocumentRequirement[] = [];
        for (const id of orderedIds) {
          const item = reqMap.get(id);
          if (item) reordered.push(item);
        }
        // include any that weren't in orderedIds just in case
        d.requirements.forEach((r) => {
          if (!orderedIds.includes(r.id)) reordered.push(r);
        });

        return { ...d, requirements: reordered, updated_at: new Date().toISOString() };
      }
      return d;
    });

    this.saveState({ ...this.state, documentTypes: docTypes });
  }

  // --- REQUESTS & ATTACHMENTS ---
  public getRequests(filter?: { studentId?: string; status?: string; search?: string }): DocumentRequest[] {
    let list = this.state.requests.map((r) => this.hydrateRequest(r));

    if (filter?.studentId) {
      list = list.filter((r) => r.student_id === filter.studentId);
    }
    if (filter?.status && filter.status !== 'ALL') {
      list = list.filter((r) => r.status === filter.status);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (r) =>
          r.request_number.toLowerCase().includes(q) ||
          r.document_type?.name?.toLowerCase().includes(q) ||
          r.student?.user?.full_name?.toLowerCase().includes(q) ||
          r.student?.student_id?.toLowerCase().includes(q) ||
          r.purpose?.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getRequestById(id: string): DocumentRequest | null {
    const raw = this.state.requests.find((r) => r.id === id || r.request_number === id);
    if (!raw) return null;
    return this.hydrateRequest(raw);
  }

  private hydrateRequest(r: DocumentRequest): DocumentRequest {
    const docType = this.state.documentTypes.find((d) => d.id === r.document_type_id);
    const studentProfile = this.state.studentProfiles.find((s) => s.id === r.student_id);
    let studentObj = undefined;
    if (studentProfile) {
      const userObj = this.state.profiles.find((p) => p.id === studentProfile.user_id);
      studentObj = {
        ...studentProfile,
        user: userObj,
      };
    }

    let assignedStaff = undefined;
    if (r.assigned_to) {
      const staffProf = this.state.staffProfiles.find((s) => s.id === r.assigned_to);
      if (staffProf) {
        const staffUser = this.state.profiles.find((p) => p.id === staffProf.user_id);
        assignedStaff = {
          ...staffProf,
          user: staffUser ? { full_name: staffUser.full_name, email: staffUser.email } : undefined,
        };
      }
    }

    const attachments = (this.state.attachments || []).filter((a) => a.request_id === r.id);
    const history = (this.state.statusHistory || [])
      .filter((h) => h.request_id === r.id)
      .map((h) => {
        const p = this.state.profiles.find((prof) => prof.id === h.changed_by);
        return {
          ...h,
          changed_by_user: p ? { full_name: p.full_name, role: p.role, email: p.email } : undefined,
        };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const notes = (this.state.internalNotes || [])
      .filter((n) => n.request_id === r.id)
      .map((n) => {
        const p = this.state.profiles.find((prof) => prof.id === n.author_id);
        return {
          ...n,
          author: p ? { full_name: p.full_name, role: p.role } : undefined,
        };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Requirements & Verification Items
    let reqItems = (this.state.requirementItems || []).filter((ri) => ri.request_id === r.id);
    if (reqItems.length === 0 && docType?.requirements && docType.requirements.length > 0) {
      reqItems = docType.requirements.map((docReq, idx) => {
        const matchingAtt = attachments.filter((a) => a.requirement_id === docReq.id);
        const subFiles: RequirementSubmissionFile[] = matchingAtt.map((att, fIdx) => ({
          id: `file-${att.id || fIdx}`,
          file_name: att.file_name,
          storage_path: att.storage_path,
          file_size: att.file_size || 500000,
          mime_type: att.mime_type || 'application/pdf',
          preview_url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=80',
          uploaded_at: att.created_at || r.created_at,
        }));

        const status: RequirementVerificationStatus = subFiles.length > 0 ? 'UNDER_REVIEW' : 'NOT_SUBMITTED';

        return {
          id: `rri-${r.id}-${idx}`,
          request_id: r.id,
          requirement_id: docReq.id,
          requirement_name: docReq.requirement_name,
          description: docReq.description,
          is_mandatory: docReq.is_mandatory,
          file_type: docReq.file_type || 'PDF, JPG, PNG',
          max_file_size_mb: docReq.max_file_size_mb || 10,
          allow_multiple: docReq.allow_multiple || false,
          conditional_rule: docReq.conditional_rule,
          current_status: status,
          current_version: subFiles.length > 0 ? 1 : 0,
          latest_reviewer_name: null,
          latest_review_date: null,
          latest_reason: null,
          latest_remarks: subFiles.length > 0 ? 'Uploaded by student' : null,
          latest_files: subFiles,
          version_history: subFiles.length > 0
            ? [
                {
                  id: `rev-${r.id}-${idx}-v1`,
                  version: 1,
                  status,
                  reviewer_id: null,
                  reviewer_name: null,
                  review_date: null,
                  remarks: 'Initial student submission',
                  files: subFiles,
                  created_at: r.created_at,
                },
              ]
            : [],
        };
      });
    }

    // Compute overall verification status
    let overallVerification: OverallVerificationStatus = 'VERIFIED';
    if (reqItems.length > 0) {
      const mandatory = reqItems.filter((i) => i.is_mandatory);
      if (mandatory.some((i) => i.current_status === 'REJECTED' || i.current_status === 'NEEDS_RESUBMISSION')) {
        overallVerification = 'ACTION_REQUIRED';
      } else if (mandatory.some((i) => i.current_status === 'NOT_SUBMITTED')) {
        overallVerification = 'INCOMPLETE';
      } else if (mandatory.every((i) => i.current_status === 'APPROVED' || i.current_status === 'NOT_APPLICABLE')) {
        overallVerification = 'VERIFIED';
      } else {
        overallVerification = 'UNDER_REVIEW';
      }
    }

    return {
      ...r,
      document_type: docType,
      student: studentObj as any,
      assigned_staff: assignedStaff as any,
      attachments: attachments as any,
      status_history: history as any,
      internal_notes: notes as any,
      requirement_items: reqItems,
      overall_verification_status: overallVerification,
    };
  }

  public createRequest(payload: {
    student_id: string;
    document_type_id: string;
    quantity: number;
    purpose: string;
    release_method: ReleaseMethod;
    delivery_address?: string | null;
    remarks?: string | null;
    priority?: RequestPriority;
    fee?: number;
    files?: Array<{ file: File; requirementId?: string }>;
  }): DocumentRequest {
    const year = new Date().getFullYear();
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const reqNum = `DR-${year}-00${randomSeq}`;
    const reqId = `req-${Date.now()}`;

    const docType = this.state.documentTypes.find((d) => d.id === payload.document_type_id);
    const totalFee = payload.fee !== undefined ? payload.fee : (docType?.fee || 50) * payload.quantity;

    const newReq: DocumentRequest = {
      id: reqId,
      request_number: reqNum,
      student_id: payload.student_id,
      document_type_id: payload.document_type_id,
      quantity: payload.quantity,
      purpose: payload.purpose,
      release_method: payload.release_method,
      delivery_address: payload.delivery_address || undefined,
      remarks: payload.remarks || undefined,
      status: 'SUBMITTED',
      priority: payload.priority || 'NORMAL',
      fee: totalFee,
      payment_status: totalFee > 0 ? 'PENDING' : 'NOT_REQUIRED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Create attachments
    const newAttachments = (payload.files || []).map((f, i) => ({
      id: `att-${Date.now()}-${i}`,
      request_id: reqId,
      uploaded_by: this.state.currentUserId || 'usr-student-001',
      requirement_id: f.requirementId || null,
      file_name: f.file.name,
      storage_path: `mock-files/${reqId}/${f.file.name}`,
      file_size: f.file.size,
      mime_type: f.file.type,
      created_at: new Date().toISOString(),
    }));

    // Create requirement verification items
    const newReqItems: RequestRequirementItem[] = (docType?.requirements || []).map((docReq, idx) => {
      const matchingFiles = (payload.files || []).filter((f) => f.requirementId === docReq.id);
      const subFiles: RequirementSubmissionFile[] = matchingFiles.map((f, fIdx) => ({
        id: `file-${Date.now()}-${idx}-${fIdx}`,
        file_name: f.file.name,
        storage_path: `mock-files/${reqId}/${f.file.name}`,
        file_size: f.file.size,
        mime_type: f.file.type,
        preview_url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=80',
        uploaded_at: new Date().toISOString(),
      }));

      const status: RequirementVerificationStatus = subFiles.length > 0 ? 'UNDER_REVIEW' : 'NOT_SUBMITTED';

      return {
        id: `rri-${reqId}-${idx}`,
        request_id: reqId,
        requirement_id: docReq.id,
        requirement_name: docReq.requirement_name,
        description: docReq.description,
        is_mandatory: docReq.is_mandatory,
        file_type: docReq.file_type || 'PDF, JPG, PNG',
        max_file_size_mb: docReq.max_file_size_mb || 10,
        allow_multiple: docReq.allow_multiple || false,
        conditional_rule: docReq.conditional_rule,
        current_status: status,
        current_version: subFiles.length > 0 ? 1 : 0,
        latest_reviewer_name: null,
        latest_review_date: null,
        latest_reason: null,
        latest_remarks: subFiles.length > 0 ? 'Uploaded with initial request' : null,
        latest_files: subFiles,
        version_history: subFiles.length > 0
          ? [
              {
                id: `rev-${reqId}-${idx}-v1`,
                version: 1,
                status,
                reviewer_id: null,
                reviewer_name: null,
                review_date: null,
                remarks: 'Initial student upload',
                files: subFiles,
                created_at: new Date().toISOString(),
              },
            ]
          : [],
      };
    });

    // Status History
    const historyItem: RequestStatusHistory = {
      id: `hist-${Date.now()}`,
      request_id: reqId,
      previous_status: undefined,
      new_status: 'SUBMITTED',
      changed_by: this.state.currentUserId || 'usr-student-001',
      comment: 'Request submitted online by student.',
      created_at: new Date().toISOString(),
    };

    // Notification for staff
    const notifItem: SystemNotification = {
      id: `notif-${Date.now()}`,
      user_id: 'usr-staff-001',
      request_id: reqId,
      title: `New Document Request: ${reqNum}`,
      message: `A new request for ${docType?.name || 'Document'} has been submitted.`,
      type: 'INFO',
      is_read: false,
      created_at: new Date().toISOString(),
    };

    this.saveState({
      ...this.state,
      requests: [newReq, ...this.state.requests],
      requirementItems: [...newReqItems, ...(this.state.requirementItems || [])],
      attachments: [...newAttachments, ...this.state.attachments],
      statusHistory: [historyItem, ...this.state.statusHistory],
      notifications: [notifItem, ...this.state.notifications],
    });

    this.addAuditLog({
      user_id: this.state.currentUserId,
      action: 'REQUEST_CREATED',
      entity_type: 'requests',
      entity_id: reqId,
      details: { request_number: reqNum, document_type: docType?.name, fee: totalFee },
    });

    const hydrated = this.hydrateRequest(newReq);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('ibacmi:request_created', {
          detail: { request: hydrated, eventType: 'INSERT' },
        })
      );
    }

    return hydrated;
  }

  public populateRequestRequirements(
    requestId: string,
    documentTypeId: string,
    files?: Array<{ file: File; requirementId?: string }>
  ): RequestRequirementItem[] {
    const docType = this.state.documentTypes.find((d) => d.id === documentTypeId);
    const configuredReqs = docType?.requirements || [];

    // Check if requirements are already populated for this request
    const existing = (this.state.requirementItems || []).filter((ri) => ri.request_id === requestId);
    if (existing.length > 0) {
      return existing;
    }

    const newReqItems: RequestRequirementItem[] = configuredReqs.map((docReq, idx) => {
      const matchingFiles = (files || []).filter((f) => f.requirementId === docReq.id);
      const subFiles: RequirementSubmissionFile[] = matchingFiles.map((f, fIdx) => ({
        id: `file-${Date.now()}-${idx}-${fIdx}`,
        file_name: f.file.name,
        storage_path: `mock-files/${requestId}/${f.file.name}`,
        file_size: f.file.size,
        mime_type: f.file.type,
        preview_url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=80',
        uploaded_at: new Date().toISOString(),
      }));

      const status: RequirementVerificationStatus = subFiles.length > 0 ? 'UNDER_REVIEW' : 'NOT_SUBMITTED';

      return {
        id: `rri-${requestId}-${idx}`,
        request_id: requestId,
        requirement_id: docReq.id,
        requirement_name: docReq.requirement_name,
        description: docReq.description,
        is_mandatory: docReq.is_mandatory,
        file_type: docReq.file_type || 'PDF, JPG, PNG',
        max_file_size_mb: docReq.max_file_size_mb || 10,
        allow_multiple: docReq.allow_multiple || false,
        conditional_rule: docReq.conditional_rule,
        current_status: status,
        current_version: subFiles.length > 0 ? 1 : 0,
        latest_reviewer_name: null,
        latest_review_date: null,
        latest_reason: null,
        latest_remarks: subFiles.length > 0 ? 'Uploaded with initial request' : null,
        latest_files: subFiles,
        version_history: subFiles.length > 0
          ? [
              {
                id: `rev-${requestId}-${idx}-v1`,
                version: 1,
                status,
                reviewer_id: null,
                reviewer_name: null,
                review_date: null,
                remarks: 'Initial student upload',
                files: subFiles,
                created_at: new Date().toISOString(),
              },
            ]
          : [],
      };
    });

    const updated = [...newReqItems, ...(this.state.requirementItems || [])];
    this.saveState({ ...this.state, requirementItems: updated });
    return newReqItems;
  }

  // --- REQUIREMENT VERIFICATION & DOCUMENT REVIEW ---
  public getRequirementsForRequest(requestId: string): RequestRequirementItem[] {
    let req = this.getRequestById(requestId);
    if (!req) return [];
    if ((!req.requirement_items || req.requirement_items.length === 0) && req.document_type_id) {
      this.populateRequestRequirements(req.id, req.document_type_id);
      req = this.getRequestById(requestId);
    }
    return req?.requirement_items || [];
  }

  public reviewRequirement(params: {
    requestId: string;
    requirementId: string;
    status: RequirementVerificationStatus;
    reasonCode?: RejectionReasonType;
    reasonText?: string;
    remarks?: string;
    checklist?: any;
    reviewerId: string;
  }): RequestRequirementItem {
    const reviewer = this.state.profiles.find((p) => p.id === params.reviewerId) || this.getCurrentUser();
    const reviewerName = reviewer?.full_name || 'Registrar Reviewer';
    const reviewerRole = reviewer?.role || 'STAFF';

    const items = [...(this.state.requirementItems || [])];
    const itemIndex = items.findIndex(
      (i) => i.request_id === params.requestId && (i.requirement_id === params.requirementId || i.id === params.requirementId)
    );

    let updatedItem: RequestRequirementItem;

    if (itemIndex >= 0) {
      const existing = items[itemIndex];
      const newReviewItem: DocumentReviewItem = {
        id: `rev-${Date.now()}`,
        version: existing.current_version || 1,
        status: params.status,
        reviewer_id: params.reviewerId,
        reviewer_name: reviewerName,
        reviewer_role: reviewerRole,
        review_date: new Date().toISOString(),
        rejection_reason_code: params.reasonCode || null,
        rejection_reason_text: params.reasonText || null,
        remarks: params.remarks || null,
        checklist_results: params.checklist || null,
        files: [...existing.latest_files],
        created_at: new Date().toISOString(),
      };

      updatedItem = {
        ...existing,
        current_status: params.status,
        latest_reviewer_name: reviewerName,
        latest_review_date: new Date().toISOString(),
        latest_reason: params.reasonText || (params.reasonCode ? params.reasonCode.replace(/_/g, ' ') : null),
        latest_remarks: params.remarks || null,
        version_history: [newReviewItem, ...(existing.version_history || [])],
      };

      items[itemIndex] = updatedItem;
    } else {
      // Fallback create
      const newReviewItem: DocumentReviewItem = {
        id: `rev-${Date.now()}`,
        version: 1,
        status: params.status,
        reviewer_id: params.reviewerId,
        reviewer_name: reviewerName,
        reviewer_role: reviewerRole,
        review_date: new Date().toISOString(),
        rejection_reason_code: params.reasonCode || null,
        rejection_reason_text: params.reasonText || null,
        remarks: params.remarks || null,
        checklist_results: params.checklist || null,
        files: [],
        created_at: new Date().toISOString(),
      };

      updatedItem = {
        id: `rri-${params.requestId}-${Date.now()}`,
        request_id: params.requestId,
        requirement_id: params.requirementId,
        requirement_name: 'Requirement',
        is_mandatory: true,
        current_status: params.status,
        current_version: 1,
        latest_reviewer_name: reviewerName,
        latest_review_date: new Date().toISOString(),
        latest_reason: params.reasonText || null,
        latest_remarks: params.remarks || null,
        latest_files: [],
        version_history: [newReviewItem],
      };
      items.push(updatedItem);
    }

    // Determine audit action
    let auditAction: AuditLog['action'] = 'REQUIREMENT_APPROVED';
    if (params.status === 'REJECTED') auditAction = 'REQUIREMENT_REJECTED';
    else if (params.status === 'NEEDS_RESUBMISSION') auditAction = 'REQUIREMENT_RESUBMISSION_REQUESTED';

    // If needed, update request status or notify student
    const targetReq = this.state.requests.find((r) => r.id === params.requestId);
    let notifications = [...this.state.notifications];
    if (targetReq) {
      const studentProfile = this.state.studentProfiles.find((s) => s.id === targetReq.student_id);
      if (studentProfile) {
        let msg = `Your requirement "${updatedItem.requirement_name}" was ${params.status.replace(/_/g, ' ')}.`;
        if (params.remarks) msg += ` Note: ${params.remarks}`;

        notifications.unshift({
          id: `notif-${Date.now()}`,
          user_id: studentProfile.user_id,
          request_id: targetReq.id,
          title: `Requirement Review Update: ${targetReq.request_number}`,
          message: msg,
          type: params.status === 'APPROVED' ? 'SUCCESS' : 'WARNING',
          is_read: false,
          created_at: new Date().toISOString(),
        });
      }
    }

    this.saveState({
      ...this.state,
      requirementItems: items,
      notifications,
    });

    this.addAuditLog({
      user_id: params.reviewerId,
      action: auditAction,
      entity_type: 'requirement_verification',
      entity_id: updatedItem.id,
      details: {
        request_id: params.requestId,
        requirement_name: updatedItem.requirement_name,
        status: params.status,
        reason: params.reasonText || params.reasonCode,
        remarks: params.remarks,
      },
    });

    return updatedItem;
  }

  public submitRequirementFiles(params: {
    requestId: string;
    requirementId: string;
    files: RequirementSubmissionFile[];
    userId: string;
  }): RequestRequirementItem {
    const items = [...(this.state.requirementItems || [])];
    const itemIndex = items.findIndex(
      (i) => i.request_id === params.requestId && (i.requirement_id === params.requirementId || i.id === params.requirementId)
    );

    let updatedItem: RequestRequirementItem;

    if (itemIndex >= 0) {
      const existing = items[itemIndex];
      const nextVersion = (existing.current_version || 1) + 1;

      const newReviewItem: DocumentReviewItem = {
        id: `rev-${Date.now()}`,
        version: nextVersion,
        status: 'UNDER_REVIEW',
        reviewer_id: null,
        reviewer_name: null,
        review_date: null,
        remarks: `Resubmitted Version ${nextVersion} by student.`,
        files: params.files,
        created_at: new Date().toISOString(),
      };

      updatedItem = {
        ...existing,
        current_status: 'UNDER_REVIEW',
        current_version: nextVersion,
        latest_reviewer_name: null,
        latest_review_date: null,
        latest_reason: null,
        latest_remarks: `Version ${nextVersion} submitted. Awaiting evaluation.`,
        latest_files: params.files,
        version_history: [newReviewItem, ...(existing.version_history || [])],
      };

      items[itemIndex] = updatedItem;
    } else {
      const newReviewItem: DocumentReviewItem = {
        id: `rev-${Date.now()}`,
        version: 1,
        status: 'UNDER_REVIEW',
        reviewer_id: null,
        reviewer_name: null,
        review_date: null,
        remarks: 'Requirement files uploaded by student.',
        files: params.files,
        created_at: new Date().toISOString(),
      };

      updatedItem = {
        id: `rri-${params.requestId}-${Date.now()}`,
        request_id: params.requestId,
        requirement_id: params.requirementId,
        requirement_name: 'Requirement',
        is_mandatory: true,
        current_status: 'UNDER_REVIEW',
        current_version: 1,
        latest_reviewer_name: null,
        latest_review_date: null,
        latest_reason: null,
        latest_remarks: 'Files submitted. Awaiting evaluation.',
        latest_files: params.files,
        version_history: [newReviewItem],
      };
      items.push(updatedItem);
    }

    // Notify Staff
    const targetReq = this.state.requests.find((r) => r.id === params.requestId);
    const notifs = [...this.state.notifications];
    notifs.unshift({
      id: `notif-${Date.now()}`,
      user_id: targetReq?.assigned_to ? (this.state.staffProfiles.find(s => s.id === targetReq.assigned_to)?.user_id || 'usr-staff-001') : 'usr-staff-001',
      request_id: params.requestId,
      title: `Student Resubmitted Files: ${targetReq?.request_number || params.requestId}`,
      message: `Student uploaded new file(s) for requirement "${updatedItem.requirement_name}". Ready for review.`,
      type: 'INFO',
      is_read: false,
      created_at: new Date().toISOString(),
    });

    this.saveState({
      ...this.state,
      requirementItems: items,
      notifications: notifs,
    });

    this.addAuditLog({
      user_id: params.userId,
      action: 'REQUIREMENT_SUBMITTED',
      entity_type: 'requirement_verification',
      entity_id: updatedItem.id,
      details: {
        request_id: params.requestId,
        requirement_name: updatedItem.requirement_name,
        files_count: params.files.length,
        version: updatedItem.current_version,
      },
    });

    return updatedItem;
  }

  public batchVerifyAllRequirements(
    requestId: string,
    status: RequirementVerificationStatus,
    reviewerId: string,
    remarks?: string
  ): RequestRequirementItem[] {
    const reviewer = this.state.profiles.find((p) => p.id === reviewerId) || this.getCurrentUser();
    const reviewerName = reviewer?.full_name || 'Registrar Reviewer';
    const reviewerRole = reviewer?.role || 'STAFF';

    const items = [...(this.state.requirementItems || [])];
    const updatedForRequest: RequestRequirementItem[] = [];

    const newItems = items.map((item) => {
      if (item.request_id === requestId) {
        const newReview: DocumentReviewItem = {
          id: `rev-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          version: item.current_version || 1,
          status,
          reviewer_id: reviewerId,
          reviewer_name: reviewerName,
          reviewer_role: reviewerRole,
          review_date: new Date().toISOString(),
          remarks: remarks || 'Batch approved by registrar.',
          files: item.latest_files,
          created_at: new Date().toISOString(),
        };

        const updated: RequestRequirementItem = {
          ...item,
          current_status: status,
          latest_reviewer_name: reviewerName,
          latest_review_date: new Date().toISOString(),
          latest_reason: null,
          latest_remarks: remarks || 'Batch verified.',
          version_history: [newReview, ...(item.version_history || [])],
        };
        updatedForRequest.push(updated);
        return updated;
      }
      return item;
    });

    this.saveState({
      ...this.state,
      requirementItems: newItems,
    });

    this.addAuditLog({
      user_id: reviewerId,
      action: 'REQUIREMENT_APPROVED',
      entity_type: 'requirement_verification',
      entity_id: requestId,
      details: {
        request_id: requestId,
        action: 'BATCH_VERIFICATION',
        status,
        verified_count: updatedForRequest.length,
      },
    });

    return updatedForRequest;
  }

  public updateRequestStatus(params: {
    requestId: string;
    newStatus: RequestStatus;
    changedBy?: string;
    reason?: string;
    comment?: string;
  }): void {
    const actorId = params.changedBy || this.state.currentUserId || 'usr-staff-001';
    let previousStatus: RequestStatus = 'SUBMITTED';

    const requests = this.state.requests.map((r) => {
      if (r.id === params.requestId) {
        previousStatus = r.status;
        const updates: Partial<DocumentRequest> = {
          status: params.newStatus,
          updated_at: new Date().toISOString(),
        };

        if (params.newStatus === 'REJECTED') {
          updates.rejection_reason = params.reason;
        }
        if (params.newStatus === 'NEEDS_INFORMATION') {
          updates.information_request_note = params.comment || params.reason;
        }
        if (params.newStatus === 'RELEASED') {
          updates.released_at = new Date().toISOString();
          const staff = this.state.staffProfiles.find((s) => s.user_id === actorId);
          updates.released_by = staff?.id || 'staff-prof-001';
        }

        return { ...r, ...updates };
      }
      return r;
    });

    const historyItem: RequestStatusHistory = {
      id: `hist-${Date.now()}`,
      request_id: params.requestId,
      previous_status: previousStatus,
      new_status: params.newStatus,
      changed_by: actorId,
      reason: params.reason,
      comment: params.comment,
      created_at: new Date().toISOString(),
    };

    // Notify Student
    const targetReq = this.state.requests.find((r) => r.id === params.requestId);
    let notifications = this.state.notifications;
    if (targetReq) {
      const studentProfile = this.state.studentProfiles.find((s) => s.id === targetReq.student_id);
      if (studentProfile) {
        let msg = `Your request status was updated to ${params.newStatus.replace(/_/g, ' ')}.`;
        let notifType: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT' = 'INFO';
        if (params.newStatus === 'RELEASED' || params.newStatus === 'READY_FOR_RELEASE') {
          notifType = 'SUCCESS';
          msg = `Your document ${targetReq.request_number} is now ${params.newStatus.replace(/_/g, ' ')}!`;
        } else if (params.newStatus === 'REJECTED') {
          notifType = 'ALERT';
          msg = `Your request ${targetReq.request_number} was rejected: ${params.reason || 'Requirement not met'}`;
        } else if (params.newStatus === 'NEEDS_INFORMATION') {
          notifType = 'WARNING';
          msg = `Clarification needed for ${targetReq.request_number}: ${params.comment || params.reason}`;
        }

        notifications = [
          {
            id: `notif-${Date.now()}`,
            user_id: studentProfile.user_id,
            request_id: targetReq.id,
            title: `Update on Request ${targetReq.request_number}`,
            message: msg,
            type: notifType,
            is_read: false,
            created_at: new Date().toISOString(),
          },
          ...notifications,
        ];
      }
    }

    this.saveState({
      ...this.state,
      requests,
      statusHistory: [historyItem, ...this.state.statusHistory],
      notifications,
    });

    this.addAuditLog({
      user_id: actorId,
      action: 'STATUS_CHANGED',
      entity_type: 'requests',
      entity_id: params.requestId,
      details: {
        previous_status: previousStatus,
        new_status: params.newStatus,
        reason: params.reason,
      },
    });

    const updatedReq = requests.find((r) => r.id === params.requestId);
    if (updatedReq && typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('ibacmi:request_updated', {
          detail: { request: this.hydrateRequest(updatedReq), eventType: 'UPDATE' },
        })
      );
    }
  }

  public assignRequest(requestId: string, staffProfileId: string | null): void {
    const requests = this.state.requests.map((r) =>
      r.id === requestId ? { ...r, assigned_to: staffProfileId || undefined, updated_at: new Date().toISOString() } : r
    );
    this.saveState({ ...this.state, requests });
    this.addAuditLog({
      user_id: this.state.currentUserId,
      action: 'REQUEST_UPDATED',
      entity_type: 'requests',
      entity_id: requestId,
      details: { assigned_to: staffProfileId },
    });
  }

  public updatePriority(requestId: string, priority: RequestPriority): void {
    const requests = this.state.requests.map((r) =>
      r.id === requestId ? { ...r, priority, updated_at: new Date().toISOString() } : r
    );
    this.saveState({ ...this.state, requests });
    this.addAuditLog({
      user_id: this.state.currentUserId,
      action: 'REQUEST_UPDATED',
      entity_type: 'requests',
      entity_id: requestId,
      details: { priority },
    });
  }

  public updatePaymentStatus(requestId: string, paymentStatus: any): void {
    const requests = this.state.requests.map((r) =>
      r.id === requestId ? { ...r, payment_status: paymentStatus, updated_at: new Date().toISOString() } : r
    );
    this.saveState({ ...this.state, requests });
    this.addAuditLog({
      user_id: this.state.currentUserId,
      action: 'REQUEST_UPDATED',
      entity_type: 'requests',
      entity_id: requestId,
      details: { payment_status: paymentStatus },
    });
  }

  public addInternalNote(requestId: string, noteText: string, authorId?: string): RequestInternalNote {
    const author = authorId || this.state.currentUserId || 'usr-staff-001';
    const authorUser = this.state.profiles.find((p) => p.id === author);
    const newNote: RequestInternalNote = {
      id: `note-${Date.now()}`,
      request_id: requestId,
      author_id: author,
      note: noteText.trim(),
      created_at: new Date().toISOString(),
      author: authorUser ? { full_name: authorUser.full_name, role: authorUser.role } : undefined,
    };

    this.saveState({
      ...this.state,
      internalNotes: [newNote, ...this.state.internalNotes],
    });

    this.addAuditLog({
      user_id: author,
      action: 'REQUEST_UPDATED',
      entity_type: 'requests',
      entity_id: requestId,
      details: { note_snippet: noteText.slice(0, 50) },
    });

    return newNote;
  }

  public addAttachment(record: {
    request_id: string;
    uploaded_by: string;
    requirement_id?: string | null;
    file_name: string;
    storage_path: string;
    file_size?: number | null;
    mime_type?: string | null;
  }) {
    const newAtt = {
      id: `att-${Date.now()}`,
      ...record,
      created_at: new Date().toISOString(),
    };
    this.saveState({
      ...this.state,
      attachments: [newAtt, ...this.state.attachments],
    });
    return newAtt;
  }

  // --- NOTIFICATIONS ---
  public getNotifications(userId: string): SystemNotification[] {
    return this.state.notifications.filter((n) => n.user_id === userId);
  }

  public addNotification(notif: SystemNotification): void {
    this.saveState({
      ...this.state,
      notifications: [notif, ...this.state.notifications],
    });
  }

  public markNotificationAsRead(id: string): void {
    const notifications = this.state.notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n));
    this.saveState({ ...this.state, notifications });
  }

  public markAllNotificationsAsRead(userId: string): void {
    const notifications = this.state.notifications.map((n) =>
      n.user_id === userId ? { ...n, is_read: true } : n
    );
    this.saveState({ ...this.state, notifications });
  }

  // --- AUDIT LOGS ---
  public addAuditLog(entry: {
    user_id?: string | null;
    action: AuditLog['action'];
    entity_type: string;
    entity_id?: string | null;
    details?: Record<string, any> | null;
  }): void {
    const userObj = entry.user_id ? this.state.profiles.find((p) => p.id === entry.user_id) : undefined;
    const newLog: AuditLog = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      user_id: entry.user_id || undefined,
      action: entry.action,
      entity_type: entry.entity_type,
      entity_id: entry.entity_id || undefined,
      details: entry.details || undefined,
      created_at: new Date().toISOString(),
      user: userObj
        ? {
            full_name: userObj.full_name,
            email: userObj.email,
            role: userObj.role,
          }
        : undefined,
    };
    this.saveState({
      ...this.state,
      auditLogs: [newLog, ...this.state.auditLogs].slice(0, 500),
    });
  }

  public getAuditLogs(actionFilter?: string): AuditLog[] {
    let logs = this.state.auditLogs.map((l) => {
      const u = l.user_id ? this.state.profiles.find((p) => p.id === l.user_id) : undefined;
      return {
        ...l,
        user: u ? { full_name: u.full_name, email: u.email, role: u.role } : undefined,
      };
    });
    if (actionFilter && actionFilter !== 'ALL') {
      logs = logs.filter((l) => l.action === actionFilter);
    }
    return logs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // --- SETTINGS ---
  public getSettings(): SystemSettings {
    return this.state.systemSettings;
  }

  public updateSettings(updates: Partial<SystemSettings>): SystemSettings {
    const updated = {
      ...this.state.systemSettings,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.saveState({ ...this.state, systemSettings: updated });
    this.addAuditLog({
      user_id: this.state.currentUserId,
      action: 'SETTINGS_CHANGED',
      entity_type: 'system_settings',
      entity_id: updated.id,
      details: updates,
    });
    return updated;
  }
}

export const mockStore = new LocalMockStore();
