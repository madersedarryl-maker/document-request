import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { useAuth } from '../contexts/AuthContext';
import { saveCustomSupabaseConfig, clearCustomSupabaseConfig, getSupabaseConfig } from '../lib/supabase';
import {
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  RefreshCw,
  Server,
  ShieldCheck,
  HardDrive,
  FileCode,
  Check,
  X,
} from 'lucide-react';

const SQL_MIGRATION_1 = `-- 01_initial_schema.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM ('STUDENT', 'STAFF', 'ADMIN');
    CREATE TYPE request_status_enum AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'FOR_APPROVAL', 'APPROVED', 'PROCESSING', 'READY_FOR_RELEASE', 'RELEASED', 'REJECTED', 'CANCELLED', 'NEEDS_INFORMATION');
    CREATE TYPE request_priority_enum AS ENUM ('NORMAL', 'HIGH', 'URGENT');
    CREATE TYPE payment_status_enum AS ENUM ('NOT_REQUIRED', 'PENDING', 'PAID', 'FAILED', 'REFUNDED');
    CREATE TYPE release_method_enum AS ENUM ('PICKUP', 'DIGITAL_COPY', 'COURIER');
EXCEPTION WHEN duplicate_object THEN null; END $$;

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

CREATE TABLE IF NOT EXISTS public.document_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_type_id UUID NOT NULL REFERENCES public.document_types(id) ON DELETE CASCADE,
    requirement_name TEXT NOT NULL,
    description TEXT,
    is_mandatory BOOLEAN NOT NULL DEFAULT true,
    file_type TEXT DEFAULT 'PDF, JPG, PNG',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE SEQUENCE IF NOT EXISTS public.request_number_seq START 1;

CREATE OR REPLACE FUNCTION public.generate_request_number()
RETURNS TEXT AS $$
DECLARE
    current_year TEXT;
    seq_val BIGINT;
BEGIN
    current_year := TO_CHAR(NOW(), 'YYYY');
    seq_val := NEXTVAL('public.request_number_seq');
    RETURN 'DR-' || current_year || '-' || LPAD(seq_val::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql VOLATILE;

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
    rejection_reason TEXT,
    information_request_note TEXT,
    released_at TIMESTAMPTZ,
    released_by UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS public.request_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
    requirement_id UUID REFERENCES public.document_requirements(id) ON DELETE SET NULL,
    requirement_name TEXT NOT NULL,
    description TEXT,
    is_mandatory BOOLEAN NOT NULL DEFAULT true,
    file_type TEXT DEFAULT 'PDF, JPG, PNG',
    max_file_size_mb INTEGER NOT NULL DEFAULT 10,
    allow_multiple BOOLEAN NOT NULL DEFAULT false,
    conditional_rule JSONB,
    status TEXT NOT NULL DEFAULT 'NOT_SUBMITTED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Automated Hook Trigger: When a new document request is created,
-- automatically query the 'document_requirements' table for that document type
-- and populate the 'request_requirements' junction table, ensuring every request
-- starts with the mandatory and conditional requirements predefined by the admin.
CREATE OR REPLACE FUNCTION public.populate_request_requirements()
RETURNS TRIGGER AS $$
BEGIN
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
        status
    )
    SELECT
        NEW.id,
        dr.id,
        dr.requirement_name,
        dr.description,
        dr.is_mandatory,
        COALESCE(dr.file_type, 'PDF, JPG, PNG'),
        COALESCE(dr.max_file_size_mb, 10),
        COALESCE(dr.allow_multiple, false),
        dr.conditional_rule,
        'NOT_SUBMITTED'
    FROM public.document_requirements dr
    WHERE dr.document_type_id = NEW.document_type_id
    ORDER BY dr.display_order ASC;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_populate_request_requirements ON public.requests;
CREATE TRIGGER trigger_populate_request_requirements
AFTER INSERT ON public.requests
FOR EACH ROW
EXECUTE FUNCTION public.populate_request_requirements();

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

CREATE TABLE IF NOT EXISTS public.approval_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
    approver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('APPROVED', 'REJECTED', 'NEEDS_INFORMATION')),
    reason TEXT,
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.request_internal_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
);`;

const SQL_MIGRATION_2 = `-- 02_rls_and_security.sql
CREATE OR REPLACE FUNCTION public.get_auth_role() RETURNS user_role_enum AS $$
DECLARE u_role user_role_enum;
BEGIN SELECT role INTO u_role FROM public.profiles WHERE id = auth.uid(); RETURN u_role; END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_auth_student_id() RETURNS UUID AS $$
DECLARE s_id UUID;
BEGIN SELECT id INTO s_id FROM public.student_profiles WHERE user_id = auth.uid(); RETURN s_id; END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_internal_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.get_auth_role() IN ('STAFF', 'ADMIN'));
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.get_auth_role() = 'ADMIN');

CREATE POLICY "student_profiles_select" ON public.student_profiles FOR SELECT USING (user_id = auth.uid() OR public.get_auth_role() IN ('STAFF', 'ADMIN'));
CREATE POLICY "student_profiles_insert" ON public.student_profiles FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "student_profiles_update" ON public.student_profiles FOR UPDATE USING (user_id = auth.uid() OR public.get_auth_role() = 'ADMIN');

CREATE POLICY "staff_profiles_select" ON public.staff_profiles FOR SELECT USING (public.get_auth_role() IN ('STAFF', 'ADMIN') OR user_id = auth.uid());
CREATE POLICY "staff_profiles_all" ON public.staff_profiles FOR ALL USING (public.get_auth_role() = 'ADMIN');

CREATE POLICY "document_types_select" ON public.document_types FOR SELECT USING (is_active = true OR public.get_auth_role() IN ('STAFF', 'ADMIN'));
CREATE POLICY "document_types_admin" ON public.document_types FOR ALL USING (public.get_auth_role() = 'ADMIN');
CREATE POLICY "document_req_select" ON public.document_requirements FOR SELECT USING (true);
CREATE POLICY "document_req_admin" ON public.document_requirements FOR ALL USING (public.get_auth_role() = 'ADMIN');

CREATE POLICY "request_requirements_select" ON public.request_requirements FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.requests r WHERE r.id = request_requirements.request_id AND (r.student_id = public.get_auth_student_id() OR public.get_auth_role() IN ('STAFF', 'ADMIN')))
);
CREATE POLICY "request_requirements_insert" ON public.request_requirements FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.requests r WHERE r.id = request_requirements.request_id AND (r.student_id = public.get_auth_student_id() OR public.get_auth_role() IN ('STAFF', 'ADMIN')))
);
CREATE POLICY "request_requirements_update" ON public.request_requirements FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.requests r WHERE r.id = request_requirements.request_id AND (r.student_id = public.get_auth_student_id() OR public.get_auth_role() IN ('STAFF', 'ADMIN')))
);

CREATE POLICY "requests_select" ON public.requests FOR SELECT USING (student_id = public.get_auth_student_id() OR public.get_auth_role() IN ('STAFF', 'ADMIN'));
CREATE POLICY "requests_insert" ON public.requests FOR INSERT WITH CHECK (student_id = public.get_auth_student_id());
CREATE POLICY "requests_update" ON public.requests FOR UPDATE USING ((student_id = public.get_auth_student_id() AND status IN ('SUBMITTED', 'UNDER_REVIEW', 'NEEDS_INFORMATION')) OR public.get_auth_role() IN ('STAFF', 'ADMIN'));

CREATE POLICY "attachments_select" ON public.request_attachments FOR SELECT USING (uploaded_by = auth.uid() OR public.get_auth_role() IN ('STAFF', 'ADMIN'));
CREATE POLICY "attachments_insert" ON public.request_attachments FOR INSERT WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "history_select" ON public.request_status_history FOR SELECT USING (EXISTS (SELECT 1 FROM public.requests r WHERE r.id = request_status_history.request_id AND (r.student_id = public.get_auth_student_id() OR public.get_auth_role() IN ('STAFF', 'ADMIN'))));
CREATE POLICY "history_insert" ON public.request_status_history FOR INSERT WITH CHECK (changed_by = auth.uid());

CREATE POLICY "notes_select" ON public.request_internal_notes FOR SELECT USING (public.get_auth_role() IN ('STAFF', 'ADMIN'));
CREATE POLICY "notes_insert" ON public.request_internal_notes FOR INSERT WITH CHECK (author_id = auth.uid() AND public.get_auth_role() IN ('STAFF', 'ADMIN'));

CREATE POLICY "notifications_select" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notifications_update" ON public.notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "notifications_insert" ON public.notifications FOR INSERT WITH CHECK (true);

CREATE POLICY "audit_select" ON public.audit_logs FOR SELECT USING (public.get_auth_role() = 'ADMIN');
CREATE POLICY "audit_insert" ON public.audit_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "settings_select" ON public.system_settings FOR SELECT USING (true);
CREATE POLICY "settings_admin" ON public.system_settings FOR UPDATE USING (public.get_auth_role() = 'ADMIN');`;

const SQL_MIGRATION_3 = `-- 03_seed_data.sql
INSERT INTO public.system_settings (id, school_name, school_code, office_name, office_address, contact_number, email, office_hours, release_instructions)
VALUES ('00000000-0000-0000-0000-000000000001'::UUID, 'Metropolitan State University', 'MSU-MAIN', 'Office of the University Registrar', 'Admin Bldg, University Plaza', '+1 (555) 019-2834', 'registrar@university.edu', 'Mon-Fri: 8AM-5PM', 'Present student ID upon claim.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.document_types (id, code, name, description, fee, processing_days, is_active, requires_approval) VALUES
('11111111-1111-1111-1111-111111111101'::UUID, 'COE', 'Certificate of Enrollment (COE)', 'Certifies student registration and enrolled units.', 50.00, 2, true, true),
('11111111-1111-1111-1111-111111111102'::UUID, 'TOR', 'Official Transcript of Records (TOR)', 'Official transcript of all subjects, grades, and GWA.', 150.00, 5, true, true),
('11111111-1111-1111-1111-111111111103'::UUID, 'COG', 'Certificate of Grades (COG)', 'Certification of grades for specific term.', 50.00, 2, true, true),
('11111111-1111-1111-1111-111111111104'::UUID, 'GMC', 'Good Moral Certificate', 'Office of Student Affairs certification.', 75.00, 3, true, true),
('11111111-1111-1111-1111-111111111105'::UUID, 'CTC', 'Certified True Copy', 'Authentication of school documents.', 40.00, 2, true, false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.document_requirements (document_type_id, requirement_name, description, is_mandatory) VALUES
('11111111-1111-1111-1111-111111111101'::UUID, 'Valid Student ID / Registration Card', 'Clear copy of valid school ID', true),
('11111111-1111-1111-1111-111111111102'::UUID, 'Student Clearance Form', 'Signed university clearance', true),
('11111111-1111-1111-1111-111111111102'::UUID, 'Recent 2x2 Photo', 'Formal collar attire', true)
ON CONFLICT DO NOTHING;`;

const SQL_MIGRATION_4 = `-- 04_storage_setup.sql
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('request-attachments', 'request-attachments', false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
ON CONFLICT (id) DO UPDATE SET public = false;

CREATE POLICY "attachments_upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'request-attachments' AND auth.role() = 'authenticated');
CREATE POLICY "attachments_select" ON storage.objects FOR SELECT USING (bucket_id = 'request-attachments' AND auth.role() = 'authenticated');
CREATE POLICY "attachments_delete" ON storage.objects FOR DELETE USING (bucket_id = 'request-attachments' AND auth.role() = 'authenticated');`;

const SQL_MIGRATION_5 = `-- 05_request_requirements_trigger.sql
-- Automatic Trigger: Populates request_requirements when a new request is created
CREATE OR REPLACE FUNCTION public.handle_new_request_requirements()
RETURNS TRIGGER AS $$
DECLARE
    req_record RECORD;
    v_is_applicable BOOLEAN;
    v_rule JSONB;
    v_rule_type TEXT;
    v_rule_val TEXT;
BEGIN
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
EXECUTE FUNCTION public.handle_new_request_requirements();`;

export const DatabaseSetupModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { dbConnected, connectionMessage, hasSchema, checkConnection } = useAuth();
  const [activeTab, setActiveTab] = useState<'config' | 'schema' | 'rls' | 'seed' | 'storage' | 'trigger'>('config');
  const [copied, setCopied] = useState<string | null>(null);

  const initialConfig = getSupabaseConfig();
  const [urlInput, setUrlInput] = useState(initialConfig.url || '');
  const [keyInput, setKeyInput] = useState(initialConfig.anonKey || '');
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const cfg = getSupabaseConfig();
      setUrlInput(cfg.url || '');
      setKeyInput(cfg.anonKey || '');
    }
  }, [isOpen]);

  const handleCopy = async (text: string, label: string) => {
    try {
      if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(label);
      setTimeout(() => setCopied(null), 2500);
    } catch (e) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(label);
      setTimeout(() => setCopied(null), 2500);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);
    saveCustomSupabaseConfig(urlInput.trim(), keyInput.trim());
    await checkConnection();
    setIsTesting(false);
  };

  const handleClear = async () => {
    clearCustomSupabaseConfig();
    setUrlInput('');
    setKeyInput('');
    setIsTesting(true);
    await checkConnection();
    setIsTesting(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Supabase Database & Infrastructure Manager"
      subtitle="Verify PostgreSQL connection, inspect RLS policies, and run database migrations"
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Status Indicator Box */}
        <div
          className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
            dbConnected && hasSchema
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
              : dbConnected && !hasSchema
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-zinc-50 border-zinc-200 text-zinc-800'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-lg ${
                dbConnected && hasSchema
                  ? 'bg-emerald-100 text-emerald-700'
                  : dbConnected
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-zinc-200 text-zinc-600'
              }`}
            >
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-sm">
                  {dbConnected && hasSchema
                    ? 'Connected to Supabase PostgreSQL (Schema Initialized)'
                    : dbConnected && !hasSchema
                    ? 'Connected (Schema Pending Migration)'
                    : 'Supabase Configuration Needed'}
                </p>
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    dbConnected && hasSchema ? 'bg-emerald-500 animate-pulse' : dbConnected ? 'bg-amber-500' : 'bg-zinc-400'
                  }`}
                />
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">{connectionMessage || 'Ready to configure credentials or execute schema migrations.'}</p>
            </div>
          </div>

          <button
            type="button"
            id="retest-db-connection-btn"
            onClick={async () => {
              setIsTesting(true);
              await checkConnection();
              setIsTesting(false);
            }}
            disabled={isTesting}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-zinc-300 rounded-lg text-xs font-semibold text-zinc-700 hover:bg-zinc-50 shadow-2xs transition-colors shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap border-b border-zinc-200 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('config')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'config'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            Connection Settings
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('schema')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'schema'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            01_initial_schema.sql
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('rls')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'rls'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            02_rls_and_security.sql
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('seed')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'seed'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            03_seed_data.sql
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('storage')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'storage'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            04_storage_setup.sql
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('trigger')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'trigger'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            05_request_requirements_trigger.sql
          </button>
        </div>

        {/* Tab Content: Credentials */}
        {activeTab === 'config' && (
          <form onSubmit={handleSaveConfig} className="space-y-4">
            <p className="text-xs text-zinc-600 leading-relaxed">
              To connect your real database, copy your Project URL and public <code className="bg-zinc-100 px-1 py-0.5 rounded text-zinc-800 font-semibold">anon</code> API key from your{' '}
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 underline font-medium inline-flex items-center gap-0.5"
              >
                Supabase Project Settings &gt; API <ExternalLink className="w-3 h-3" />
              </a>
              .
            </p>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  Supabase Project URL
                </label>
                <input
                  type="url"
                  required
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full text-xs font-mono p-2.5 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  Supabase Anon Key (Public API Key)
                </label>
                <input
                  type="text"
                  required
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full text-xs font-mono p-2.5 rounded-lg border border-zinc-300 focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleClear}
                disabled={isTesting}
                className="text-xs text-zinc-500 hover:text-rose-600 underline cursor-pointer"
              >
                Reset to local demo storage
              </button>

              <button
                type="submit"
                id="save-supabase-config-btn"
                disabled={isTesting || !urlInput.trim() || !keyInput.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Testing & Connecting...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Save & Test Connection
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Tab Content: SQL Code Viewers */}
        {activeTab !== 'config' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">
                Copy and run this in your Supabase Dashboard &gt; <strong>SQL Editor</strong>:
              </span>
              <button
                type="button"
                id={`copy-sql-${activeTab}`}
                onClick={() => {
                  const sqlMap: Record<string, string> = {
                    schema: SQL_MIGRATION_1,
                    rls: SQL_MIGRATION_2,
                    seed: SQL_MIGRATION_3,
                    storage: SQL_MIGRATION_4,
                    trigger: SQL_MIGRATION_5,
                  };
                  handleCopy(sqlMap[activeTab], activeTab);
                }}
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-zinc-900 text-white rounded-md text-xs font-medium hover:bg-zinc-800 transition-colors"
              >
                {copied === activeTab ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy SQL</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 bg-zinc-950 text-zinc-100 rounded-xl text-xs font-mono overflow-x-auto max-h-80 leading-relaxed border border-zinc-800">
              <code>
                {activeTab === 'schema' && SQL_MIGRATION_1}
                {activeTab === 'rls' && SQL_MIGRATION_2}
                {activeTab === 'seed' && SQL_MIGRATION_3}
                {activeTab === 'storage' && SQL_MIGRATION_4}
                {activeTab === 'trigger' && SQL_MIGRATION_5}
              </code>
            </pre>
          </div>
        )}

        {/* Modal Bottom Action / Dismiss Bar */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-200">
          <p className="text-[11px] text-zinc-500">
            System automatically caches all actions and syncs with connected storage.
          </p>
          <button
            type="button"
            id="close-db-modal-footer-btn"
            onClick={onClose}
            className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            Close Manager
          </button>
        </div>
      </div>
    </Modal>
  );
};
