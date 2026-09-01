-- ============================================================================
-- SCHOOL DOCUMENT REQUEST SYSTEM: INITIAL DATABASE SCHEMA
-- Migration: 01_initial_schema.sql
-- ============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Custom Types / Enums
DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM ('STUDENT', 'STAFF', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE request_status_enum AS ENUM (
        'SUBMITTED',
        'UNDER_REVIEW',
        'FOR_APPROVAL',
        'APPROVED',
        'PROCESSING',
        'READY_FOR_RELEASE',
        'RELEASED',
        'REJECTED',
        'CANCELLED',
        'NEEDS_INFORMATION'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE request_priority_enum AS ENUM ('NORMAL', 'HIGH', 'URGENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status_enum AS ENUM ('NOT_REQUIRED', 'PENDING', 'PAID', 'FAILED', 'REFUNDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE release_method_enum AS ENUM ('PICKUP', 'DIGITAL_COPY', 'COURIER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Profiles Table (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role user_role_enum NOT NULL DEFAULT 'STUDENT',
    phone TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Student Profiles Table
CREATE TABLE IF NOT EXISTS public.student_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id TEXT NOT NULL UNIQUE,
    program TEXT NOT NULL,
    year_level TEXT NOT NULL,
    contact_number TEXT,
    emergency_contact TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Staff Profiles Table
CREATE TABLE IF NOT EXISTS public.staff_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    employee_id TEXT NOT NULL UNIQUE,
    department TEXT NOT NULL DEFAULT 'Registrar Office',
    designation TEXT NOT NULL DEFAULT 'Registrar Officer',
    can_approve BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Document Types Table
CREATE TABLE IF NOT EXISTS public.document_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (fee >= 0),
    processing_days INTEGER NOT NULL DEFAULT 3 CHECK (processing_days > 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    requires_approval BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Document Requirements Table
CREATE TABLE IF NOT EXISTS public.document_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_type_id UUID NOT NULL REFERENCES public.document_types(id) ON DELETE CASCADE,
    requirement_name TEXT NOT NULL,
    description TEXT,
    is_mandatory BOOLEAN NOT NULL DEFAULT true,
    file_type TEXT DEFAULT 'PDF, JPG, PNG',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Approval Workflows Table
CREATE TABLE IF NOT EXISTS public.approval_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    document_type_id UUID REFERENCES public.document_types(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Approval Workflow Steps Table
CREATE TABLE IF NOT EXISTS public.approval_workflow_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id UUID NOT NULL REFERENCES public.approval_workflows(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    step_name TEXT NOT NULL,
    required_role user_role_enum NOT NULL DEFAULT 'STAFF',
    approver_id UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (workflow_id, step_order)
);

-- 10. Concurrency-Safe Sequence for Request Number (DR-YYYY-XXXXXX)
CREATE SEQUENCE IF NOT EXISTS public.request_number_seq START 1;

CREATE OR REPLACE FUNCTION public.generate_request_number()
RETURNS TEXT AS $$
DECLARE
    current_year TEXT;
    seq_val BIGINT;
    formatted_no TEXT;
BEGIN
    current_year := TO_CHAR(NOW(), 'YYYY');
    seq_val := NEXTVAL('public.request_number_seq');
    formatted_no := 'DR-' || current_year || '-' || LPAD(seq_val::TEXT, 6, '0');
    RETURN formatted_no;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- 11. Requests Table
CREATE TABLE IF NOT EXISTS public.requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_number TEXT NOT NULL UNIQUE DEFAULT public.generate_request_number(),
    student_id UUID NOT NULL REFERENCES public.student_profiles(id) ON DELETE RESTRICT,
    document_type_id UUID NOT NULL REFERENCES public.document_types(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0 AND quantity <= 20),
    purpose TEXT NOT NULL,
    release_method release_method_enum NOT NULL DEFAULT 'PICKUP',
    delivery_address TEXT,
    remarks TEXT,
    status request_status_enum NOT NULL DEFAULT 'SUBMITTED',
    priority request_priority_enum NOT NULL DEFAULT 'NORMAL',
    fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (fee >= 0),
    payment_status payment_status_enum NOT NULL DEFAULT 'NOT_REQUIRED',
    assigned_to UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
    current_workflow_step_id UUID REFERENCES public.approval_workflow_steps(id) ON DELETE SET NULL,
    rejection_reason TEXT,
    information_request_note TEXT,
    released_at TIMESTAMPTZ,
    released_by UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Request Requirements Junction Table
CREATE TABLE IF NOT EXISTS public.request_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
    requirement_id UUID REFERENCES public.document_requirements(id) ON DELETE SET NULL,
    requirement_name TEXT NOT NULL,
    description TEXT,
    is_mandatory BOOLEAN NOT NULL DEFAULT true,
    file_type TEXT DEFAULT 'PDF, JPG, PNG',
    max_file_size_mb INTEGER DEFAULT 10,
    allow_multiple BOOLEAN DEFAULT false,
    conditional_rule JSONB,
    is_applicable BOOLEAN NOT NULL DEFAULT true,
    status TEXT NOT NULL DEFAULT 'NOT_SUBMITTED' CHECK (
        status IN (
            'NOT_SUBMITTED',
            'UPLOADED',
            'UNDER_REVIEW',
            'APPROVED',
            'REJECTED',
            'NEEDS_RESUBMISSION',
            'NOT_APPLICABLE'
        )
    ),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Request Attachments Table
CREATE TABLE IF NOT EXISTS public.request_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    requirement_id UUID REFERENCES public.document_requirements(id) ON DELETE SET NULL,
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    mime_type TEXT,
    file_size BIGINT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Request Status History Table
CREATE TABLE IF NOT EXISTS public.request_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
    previous_status request_status_enum,
    new_status request_status_enum NOT NULL,
    changed_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reason TEXT,
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. Approval Actions Table
CREATE TABLE IF NOT EXISTS public.approval_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
    workflow_step_id UUID REFERENCES public.approval_workflow_steps(id) ON DELETE SET NULL,
    approver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('APPROVED', 'REJECTED', 'NEEDS_INFORMATION')),
    reason TEXT,
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. Request Internal Notes Table (Staff-Only)
CREATE TABLE IF NOT EXISTS public.request_internal_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. System Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    request_id UUID REFERENCES public.requests(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'INFO' CHECK (type IN ('INFO', 'SUCCESS', 'WARNING', 'ALERT')),
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 18. System Settings Table (Singleton Row)
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000001'::UUID,
    school_name TEXT NOT NULL DEFAULT 'Metropolitan University',
    school_code TEXT NOT NULL DEFAULT 'METRO-UNI',
    office_name TEXT NOT NULL DEFAULT 'Office of the University Registrar',
    office_address TEXT NOT NULL DEFAULT 'Academic Hall 101, University Boulevard',
    contact_number TEXT NOT NULL DEFAULT '+1 (555) 019-2834',
    email TEXT NOT NULL DEFAULT 'registrar@university.edu',
    office_hours TEXT NOT NULL DEFAULT 'Monday - Friday, 8:00 AM - 5:00 PM',
    release_instructions TEXT NOT NULL DEFAULT 'Present your valid Student ID or Government ID upon claiming at Window 3.',
    default_processing_time_days INTEGER NOT NULL DEFAULT 3,
    request_prefix TEXT NOT NULL DEFAULT 'DR',
    max_upload_size_mb INTEGER NOT NULL DEFAULT 10,
    allowed_file_types TEXT NOT NULL DEFAULT 'image/jpeg,image/png,application/pdf',
    maintenance_mode BOOLEAN NOT NULL DEFAULT false,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 19. Indexes for High Performance
CREATE INDEX IF NOT EXISTS idx_requests_student_id ON public.requests(student_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON public.requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_priority ON public.requests(priority);
CREATE INDEX IF NOT EXISTS idx_requests_request_number ON public.requests(request_number);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON public.requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_status_history_request ON public.request_status_history(request_id);
CREATE INDEX IF NOT EXISTS idx_attachments_request ON public.request_attachments(request_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- 20. Triggers for Automatic Updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER update_student_profiles_updated_at
BEFORE UPDATE ON public.student_profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER update_staff_profiles_updated_at
BEFORE UPDATE ON public.staff_profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER update_document_types_updated_at
BEFORE UPDATE ON public.document_types
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER update_requests_updated_at
BEFORE UPDATE ON public.requests
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER update_system_settings_updated_at
BEFORE UPDATE ON public.system_settings
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER update_request_requirements_updated_at
BEFORE UPDATE ON public.request_requirements
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 21. Automatic Initialization of Request Requirements Trigger
CREATE OR REPLACE FUNCTION public.handle_new_request_requirements()
RETURNS TRIGGER AS $$
DECLARE
    req_record RECORD;
    v_is_applicable BOOLEAN;
    v_rule JSONB;
    v_rule_type TEXT;
    v_rule_val TEXT;
BEGIN
    -- Query all configured requirements for this document type
    FOR req_record IN
        SELECT 
            dr.id,
            dr.requirement_name,
            dr.description,
            dr.is_mandatory,
            COALESCE(dr.file_type, 'PDF, JPG, PNG') AS file_type,
            COALESCE(dr.max_file_size_mb, 10) AS max_file_size_mb,
            COALESCE(dr.allow_multiple, false) AS allow_multiple,
            dr.conditional_rule
        FROM public.document_requirements dr
        WHERE dr.document_type_id = NEW.document_type_id
        ORDER BY dr.created_at ASC
    LOOP
        v_is_applicable := true;

        -- Evaluate conditional visibility if rule JSON exists
        IF req_record.conditional_rule IS NOT NULL AND TRIM(req_record.conditional_rule::TEXT) != '' THEN
            BEGIN
                v_rule := req_record.conditional_rule::JSONB;
                v_rule_type := UPPER(COALESCE(v_rule->>'type', 'ALWAYS'));
                v_rule_val := COALESCE(v_rule->>'value', 'ALL');

                IF v_rule_type = 'PURPOSE' THEN
                    IF v_rule_val != 'ALL' AND LOWER(TRIM(NEW.purpose)) != LOWER(TRIM(v_rule_val)) THEN
                        v_is_applicable := false;
                    END IF;
                ELSIF v_rule_type = 'RELEASE_METHOD' THEN
                    IF v_rule_val != 'ALL' AND NEW.release_method::TEXT != v_rule_val THEN
                        v_is_applicable := false;
                    END IF;
                ELSIF v_rule_type = 'PRIORITY' THEN
                    IF v_rule_val != 'ALL' AND NEW.priority::TEXT != v_rule_val THEN
                        v_is_applicable := false;
                    END IF;
                END IF;
            EXCEPTION WHEN OTHERS THEN
                v_is_applicable := true;
            END;
        END IF;

        INSERT INTO public.request_requirements (
            request_id,
            requirement_id,
            requirement_name,
            description,
            is_mandatory,
            file_type,
            max_file_size_mb,
            allow_multiple,
            conditional_rule,
            is_applicable,
            status,
            created_at,
            updated_at
        ) VALUES (
            NEW.id,
            req_record.id,
            req_record.requirement_name,
            req_record.description,
            req_record.is_mandatory,
            req_record.file_type,
            req_record.max_file_size_mb,
            req_record.allow_multiple,
            CASE 
                WHEN req_record.conditional_rule IS NOT NULL AND TRIM(req_record.conditional_rule::TEXT) != '' 
                THEN req_record.conditional_rule::JSONB 
                ELSE NULL 
            END,
            v_is_applicable,
            CASE WHEN v_is_applicable THEN 'NOT_SUBMITTED' ELSE 'NOT_APPLICABLE' END,
            NOW(),
            NOW()
        );
    END LOOP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_initialize_request_requirements ON public.requests;

CREATE TRIGGER trigger_initialize_request_requirements
AFTER INSERT ON public.requests
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_request_requirements();

