-- ============================================================================
-- SCHOOL DOCUMENT REQUEST SYSTEM: SEED DATA
-- Migration: 03_seed_data.sql
-- ============================================================================

-- 1. Insert Initial System Settings (if not exists)
INSERT INTO public.system_settings (
    id,
    school_name,
    school_code,
    office_name,
    office_address,
    contact_number,
    email,
    office_hours,
    release_instructions,
    default_processing_time_days,
    request_prefix,
    max_upload_size_mb,
    allowed_file_types
) VALUES (
    '00000000-0000-0000-0000-000000000001'::UUID,
    'Metropolitan State University',
    'MSU-MAIN',
    'Office of the University Registrar & Student Records',
    'Administration Building, 1st Floor, University Plaza, Manila',
    '+63 (2) 8888-7654',
    'registrar@metrouni.edu',
    'Monday to Friday: 8:00 AM - 5:00 PM (Cut-off: 4:30 PM)',
    '1. Bring your original Student ID or one valid Government-issued ID.\n2. Present your official Claim Stub / Request Number at Counter 4.\n3. If claiming via representative, provide an Authorization Letter and copies of valid IDs.',
    3,
    'DR',
    10,
    'image/jpeg,image/png,application/pdf'
) ON CONFLICT (id) DO NOTHING;

-- 2. Insert Standard Document Types
INSERT INTO public.document_types (id, code, name, description, fee, processing_days, is_active, requires_approval) VALUES
(
    '11111111-1111-1111-1111-111111111101'::UUID,
    'COE',
    'Certificate of Enrollment (COE)',
    'Official certificate certifying student registration, program, current semester, and enrolled subjects.',
    50.00,
    2,
    true,
    true
),
(
    '11111111-1111-1111-1111-111111111102'::UUID,
    'TOR',
    'Official Transcript of Records (TOR)',
    'Comprehensive academic record showing all subjects, grades, units earned, and general weighted average (GWA).',
    150.00,
    5,
    true,
    true
),
(
    '11111111-1111-1111-1111-111111111103'::UUID,
    'COG',
    'Certificate of Grades (COG)',
    'Official certification of scholastic grades attained for a specific academic term or semester.',
    50.00,
    2,
    true,
    true
),
(
    '11111111-1111-1111-1111-111111111104'::UUID,
    'GMC',
    'Certificate of Good Moral Character',
    'Official certification from the Office of Student Affairs regarding conduct and disciplinary standing.',
    75.00,
    3,
    true,
    true
),
(
    '11111111-1111-1111-1111-111111111105'::UUID,
    'CTC',
    'Certified True Copy of School Records',
    'Official authentication stamp certifying that photocopies are true reproductions of original school documents.',
    40.00,
    2,
    true,
    false
),
(
    '11111111-1111-1111-1111-111111111106'::UUID,
    'CAV',
    'Certification, Authentication and Verification (CAV)',
    'Document authentication requested for DFA Apostille, overseas employment, or board exam requirements.',
    200.00,
    7,
    true,
    true
),
(
    '11111111-1111-1111-1111-111111111107'::UUID,
    'DIP_REISSUE',
    'Diploma Reissuance / Second Copy',
    'Official reprint of the University Diploma due to loss, damage, or legal name change.',
    350.00,
    10,
    true,
    true
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    fee = EXCLUDED.fee,
    processing_days = EXCLUDED.processing_days;

-- 3. Insert Document Requirements
INSERT INTO public.document_requirements (id, document_type_id, requirement_name, description, is_mandatory, file_type) VALUES
-- COE Requirements
('22222222-2222-2222-2222-222222222101'::UUID, '11111111-1111-1111-1111-111111111101'::UUID, 'Valid Student ID / School Registration Card', 'Clear front and back photo or scan of valid School ID', true, 'PDF, JPG, PNG'),
('22222222-2222-2222-2222-222222222102'::UUID, '11111111-1111-1111-1111-111111111101'::UUID, 'Proof of Payment / Assessment Form', 'Current term Certificate of Matriculation or assessment slip', false, 'PDF, JPG, PNG'),

-- TOR Requirements
('22222222-2222-2222-2222-222222222201'::UUID, '11111111-1111-1111-1111-111111111102'::UUID, 'Official Student Clearance', 'Signed university clearance form from library, accounting, and department chair', true, 'PDF, JPG, PNG'),
('22222222-2222-2222-2222-222222222202'::UUID, '11111111-1111-1111-1111-111111111102'::UUID, 'Recent 2x2 ID Photo (White Background)', 'Passport-style photo with formal collar attire and name tag', true, 'JPG, PNG'),

-- COG Requirements
('22222222-2222-2222-2222-222222222301'::UUID, '11111111-1111-1111-1111-111111111103'::UUID, 'Valid Student Identification', 'Proof of enrolled status during the requested school term', true, 'PDF, JPG, PNG'),

-- GMC Requirements
('22222222-2222-2222-2222-222222222401'::UUID, '11111111-1111-1111-1111-111111111104'::UUID, 'Student Affairs Clearance Slip', 'Endorsement confirming no pending disciplinary offense on file', true, 'PDF, JPG, PNG'),

-- Diploma Reissuance
('22222222-2222-2222-2222-222222222701'::UUID, '11111111-1111-1111-1111-111111111107'::UUID, 'Notarized Affidavit of Loss / Damaged Original', 'Official notarized legal document stating circumstances of loss', true, 'PDF, JPG, PNG'),
('22222222-2222-2222-2222-222222222702'::UUID, '11111111-1111-1111-1111-111111111107'::UUID, 'PSA Birth Certificate', 'Official birth certificate for name authentication', true, 'PDF, JPG, PNG')
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Default Approval Workflows
INSERT INTO public.approval_workflows (id, name, description, is_active) VALUES
('33333333-3333-3333-3333-333333333001'::UUID, 'Standard Registrar Verification & Approval', 'Default 2-step verification workflow for official records', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.approval_workflow_steps (id, workflow_id, step_order, step_name, required_role) VALUES
('44444444-4444-4444-4444-444444444001'::UUID, '33333333-3333-3333-3333-333333333001'::UUID, 1, 'Records Verification & Clearance Review', 'STAFF'),
('44444444-4444-4444-4444-444444444002'::UUID, '33333333-3333-3333-3333-333333333001'::UUID, 2, 'University Registrar Final Approval & Sign-off', 'ADMIN')
ON CONFLICT (id) DO NOTHING;
