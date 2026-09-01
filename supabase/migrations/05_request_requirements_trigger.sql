-- ============================================================================
-- SCHOOL DOCUMENT REQUEST SYSTEM: REQUEST REQUIREMENTS TRIGGER & AUTOMATION
-- Migration: 05_request_requirements_trigger.sql
-- ============================================================================

-- 1. Ensure public.request_requirements Junction Table Exists
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

-- Ensure conditional_rule and is_applicable columns exist on document_requirements & request_requirements
DO $$ BEGIN
    ALTER TABLE public.document_requirements ADD COLUMN IF NOT EXISTS max_file_size_mb INTEGER DEFAULT 10;
    ALTER TABLE public.document_requirements ADD COLUMN IF NOT EXISTS allow_multiple BOOLEAN DEFAULT false;
    ALTER TABLE public.document_requirements ADD COLUMN IF NOT EXISTS conditional_rule TEXT;
    ALTER TABLE public.document_requirements ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
    ALTER TABLE public.document_requirements ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
EXCEPTION
    WHEN OTHERS THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE public.request_requirements ADD COLUMN IF NOT EXISTS conditional_rule JSONB;
    ALTER TABLE public.request_requirements ADD COLUMN IF NOT EXISTS is_applicable BOOLEAN NOT NULL DEFAULT true;
EXCEPTION
    WHEN OTHERS THEN null;
END $$;

-- 2. Indexes for High Performance Querying
CREATE INDEX IF NOT EXISTS idx_request_requirements_request_id 
    ON public.request_requirements(request_id);

CREATE INDEX IF NOT EXISTS idx_request_requirements_req_id 
    ON public.request_requirements(requirement_id);

CREATE INDEX IF NOT EXISTS idx_request_requirements_status 
    ON public.request_requirements(status);

CREATE INDEX IF NOT EXISTS idx_doc_requirements_type_id 
    ON public.document_requirements(document_type_id);

-- 3. Automatic updated_at Trigger for request_requirements
CREATE OR REPLACE TRIGGER update_request_requirements_updated_at
BEFORE UPDATE ON public.request_requirements
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4. Supabase Database Trigger Function: handle_new_request_requirements()
-- Automatically queries document_requirements for the requested document_type_id
-- and initializes the request_requirements junction table.
CREATE OR REPLACE FUNCTION public.handle_new_request_requirements()
RETURNS TRIGGER AS $$
DECLARE
    req_record RECORD;
    v_is_applicable BOOLEAN;
    v_rule JSONB;
    v_rule_type TEXT;
    v_rule_val TEXT;
    v_rule_op TEXT;
    v_student_status TEXT;
BEGIN
    -- Query all active document requirements configured for this document type
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
        -- Default to applicable
        v_is_applicable := true;

        -- Evaluate conditional visibility if rule JSON exists
        IF req_record.conditional_rule IS NOT NULL AND TRIM(req_record.conditional_rule::TEXT) != '' THEN
            BEGIN
                -- Safely cast to JSONB
                v_rule := req_record.conditional_rule::JSONB;
                v_rule_type := UPPER(COALESCE(v_rule->>'type', 'ALWAYS'));
                v_rule_val := COALESCE(v_rule->>'value', 'ALL');
                v_rule_op := UPPER(COALESCE(v_rule->>'operator', 'EQUALS'));

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
                -- If JSON parsing fails, retain as applicable
                v_is_applicable := true;
            END;
        END IF;

        -- Insert the requirement row into the junction table
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

-- 5. Attach Database Trigger to 'requests' Table
DROP TRIGGER IF EXISTS trigger_initialize_request_requirements ON public.requests;

CREATE TRIGGER trigger_initialize_request_requirements
AFTER INSERT ON public.requests
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_request_requirements();

-- 6. RPC Helper Function: Manually initialize / re-sync requirements for an existing request
CREATE OR REPLACE FUNCTION public.rpc_initialize_request_requirements(p_request_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_req public.requests%ROWTYPE;
    req_record RECORD;
    v_is_applicable BOOLEAN;
    v_rule JSONB;
    v_rule_type TEXT;
    v_rule_val TEXT;
    v_inserted_count INTEGER := 0;
BEGIN
    SELECT * INTO v_req FROM public.requests WHERE id = p_request_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Request not found');
    END IF;

    -- Delete existing requirements for clean re-sync
    DELETE FROM public.request_requirements WHERE request_id = p_request_id;

    -- Query document requirements
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
        WHERE dr.document_type_id = v_req.document_type_id
        ORDER BY dr.created_at ASC
    LOOP
        v_is_applicable := true;

        IF req_record.conditional_rule IS NOT NULL AND TRIM(req_record.conditional_rule::TEXT) != '' THEN
            BEGIN
                v_rule := req_record.conditional_rule::JSONB;
                v_rule_type := UPPER(COALESCE(v_rule->>'type', 'ALWAYS'));
                v_rule_val := COALESCE(v_rule->>'value', 'ALL');

                IF v_rule_type = 'PURPOSE' THEN
                    IF v_rule_val != 'ALL' AND LOWER(TRIM(v_req.purpose)) != LOWER(TRIM(v_rule_val)) THEN
                        v_is_applicable := false;
                    END IF;
                ELSIF v_rule_type = 'RELEASE_METHOD' THEN
                    IF v_rule_val != 'ALL' AND v_req.release_method::TEXT != v_rule_val THEN
                        v_is_applicable := false;
                    END IF;
                ELSIF v_rule_type = 'PRIORITY' THEN
                    IF v_rule_val != 'ALL' AND v_req.priority::TEXT != v_rule_val THEN
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
            p_request_id,
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

        v_inserted_count := v_inserted_count + 1;
    END LOOP;

    RETURN jsonb_build_object(
        'success', true, 
        'request_id', p_request_id, 
        'count', v_inserted_count
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Row Level Security (RLS) Configuration for request_requirements
ALTER TABLE public.request_requirements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can view their own request requirements" ON public.request_requirements;
CREATE POLICY "Students can view their own request requirements"
ON public.request_requirements FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.requests r
        JOIN public.student_profiles sp ON r.student_id = sp.id
        WHERE r.id = public.request_requirements.request_id
        AND sp.user_id = auth.uid()
    )
    OR public.get_auth_role() IN ('STAFF', 'ADMIN')
);

DROP POLICY IF EXISTS "Staff and admin can manage request requirements" ON public.request_requirements;
CREATE POLICY "Staff and admin can manage request requirements"
ON public.request_requirements FOR ALL
USING (public.get_auth_role() IN ('STAFF', 'ADMIN'));
