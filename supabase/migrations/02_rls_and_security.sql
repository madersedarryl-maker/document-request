-- ============================================================================
-- SCHOOL DOCUMENT REQUEST SYSTEM: ROW LEVEL SECURITY & RPC PROCEDURES
-- Migration: 02_rls_and_security.sql
-- ============================================================================

-- 1. Security Definer Helper Functions to prevent recursive RLS calls
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS user_role_enum AS $$
DECLARE
    u_role user_role_enum;
BEGIN
    SELECT role INTO u_role FROM public.profiles WHERE id = auth.uid();
    RETURN u_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_auth_student_id()
RETURNS UUID AS $$
DECLARE
    s_id UUID;
BEGIN
    SELECT id INTO s_id FROM public.student_profiles WHERE user_id = auth.uid();
    RETURN s_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_auth_staff_id()
RETURNS UUID AS $$
DECLARE
    st_id UUID;
BEGIN
    SELECT id INTO st_id FROM public.staff_profiles WHERE user_id = auth.uid();
    RETURN st_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_internal_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- PROFILES POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view their own profile or staff can view all"
ON public.profiles FOR SELECT
USING (auth.uid() = id OR public.get_auth_role() IN ('STAFF', 'ADMIN'));

CREATE POLICY "Users can insert their own profile on signup"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile or admin can manage"
ON public.profiles FOR UPDATE
USING (auth.uid() = id OR public.get_auth_role() = 'ADMIN');

-- ----------------------------------------------------------------------------
-- STUDENT PROFILES POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Students view own profile, staff/admin view all"
ON public.student_profiles FOR SELECT
USING (user_id = auth.uid() OR public.get_auth_role() IN ('STAFF', 'ADMIN'));

CREATE POLICY "Students insert own student profile"
ON public.student_profiles FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Students update own profile, admin manage all"
ON public.student_profiles FOR UPDATE
USING (user_id = auth.uid() OR public.get_auth_role() = 'ADMIN');

-- ----------------------------------------------------------------------------
-- STAFF PROFILES POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Staff and admin can view staff profiles"
ON public.staff_profiles FOR SELECT
USING (public.get_auth_role() IN ('STAFF', 'ADMIN') OR user_id = auth.uid());

CREATE POLICY "Admins can manage staff profiles"
ON public.staff_profiles FOR ALL
USING (public.get_auth_role() = 'ADMIN');

-- ----------------------------------------------------------------------------
-- DOCUMENT TYPES & REQUIREMENTS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Anyone authenticated can view active document types"
ON public.document_types FOR SELECT
USING (is_active = true OR public.get_auth_role() IN ('STAFF', 'ADMIN'));

CREATE POLICY "Admins can manage document types"
ON public.document_types FOR ALL
USING (public.get_auth_role() = 'ADMIN');

CREATE POLICY "Anyone authenticated can view document requirements"
ON public.document_requirements FOR SELECT
USING (true);

CREATE POLICY "Admins can manage document requirements"
ON public.document_requirements FOR ALL
USING (public.get_auth_role() = 'ADMIN');

-- ----------------------------------------------------------------------------
-- APPROVAL WORKFLOWS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Staff and Admin can view workflows"
ON public.approval_workflows FOR SELECT
USING (public.get_auth_role() IN ('STAFF', 'ADMIN'));

CREATE POLICY "Admins can manage workflows"
ON public.approval_workflows FOR ALL
USING (public.get_auth_role() = 'ADMIN');

CREATE POLICY "Staff and Admin can view workflow steps"
ON public.approval_workflow_steps FOR SELECT
USING (public.get_auth_role() IN ('STAFF', 'ADMIN'));

CREATE POLICY "Admins can manage workflow steps"
ON public.approval_workflow_steps FOR ALL
USING (public.get_auth_role() = 'ADMIN');

-- ----------------------------------------------------------------------------
-- REQUESTS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Students see own requests, Staff/Admin see all"
ON public.requests FOR SELECT
USING (
    student_id = public.get_auth_student_id() 
    OR public.get_auth_role() IN ('STAFF', 'ADMIN')
);

CREATE POLICY "Students can create requests"
ON public.requests FOR INSERT
WITH CHECK (
    student_id = public.get_auth_student_id()
);

CREATE POLICY "Students can cancel their pending request, Staff/Admin can update"
ON public.requests FOR UPDATE
USING (
    (student_id = public.get_auth_student_id() AND status IN ('SUBMITTED', 'UNDER_REVIEW', 'NEEDS_INFORMATION'))
    OR public.get_auth_role() IN ('STAFF', 'ADMIN')
);

-- ----------------------------------------------------------------------------
-- REQUEST REQUIREMENTS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Students see requirements of own requests, Staff/Admin see all"
ON public.request_requirements FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.requests r
        WHERE r.id = request_requirements.request_id
        AND (r.student_id = public.get_auth_student_id() OR public.get_auth_role() IN ('STAFF', 'ADMIN'))
    )
);

CREATE POLICY "Staff and admin can manage request requirements"
ON public.request_requirements FOR ALL
USING (public.get_auth_role() IN ('STAFF', 'ADMIN'));

CREATE POLICY "Allow trigger and auth user to insert initial requirements"
ON public.request_requirements FOR INSERT
WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- REQUEST ATTACHMENTS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Students see own attachments, Staff/Admin see all"
ON public.request_attachments FOR SELECT
USING (
    uploaded_by = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.requests r
        WHERE r.id = request_attachments.request_id
        AND (r.student_id = public.get_auth_student_id() OR public.get_auth_role() IN ('STAFF', 'ADMIN'))
    )
);

CREATE POLICY "Students and staff can insert attachments"
ON public.request_attachments FOR INSERT
WITH CHECK (uploaded_by = auth.uid());

-- ----------------------------------------------------------------------------
-- STATUS HISTORY POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Students see status history of own requests, Staff/Admin see all"
ON public.request_status_history FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.requests r
        WHERE r.id = request_status_history.request_id
        AND (r.student_id = public.get_auth_student_id() OR public.get_auth_role() IN ('STAFF', 'ADMIN'))
    )
);

CREATE POLICY "Authenticated users can insert status history"
ON public.request_status_history FOR INSERT
WITH CHECK (changed_by = auth.uid());

-- ----------------------------------------------------------------------------
-- APPROVAL ACTIONS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Staff and admin view approval actions"
ON public.approval_actions FOR SELECT
USING (
    public.get_auth_role() IN ('STAFF', 'ADMIN')
    OR EXISTS (
        SELECT 1 FROM public.requests r
        WHERE r.id = approval_actions.request_id
        AND r.student_id = public.get_auth_student_id()
    )
);

CREATE POLICY "Staff can insert approval actions"
ON public.approval_actions FOR INSERT
WITH CHECK (approver_id = auth.uid() AND public.get_auth_role() IN ('STAFF', 'ADMIN'));

-- ----------------------------------------------------------------------------
-- INTERNAL NOTES POLICIES (STRICT: STUDENTS HAVE ZERO ACCESS)
-- ----------------------------------------------------------------------------
CREATE POLICY "Staff and Admin can view internal notes"
ON public.request_internal_notes FOR SELECT
USING (public.get_auth_role() IN ('STAFF', 'ADMIN'));

CREATE POLICY "Staff and Admin can insert internal notes"
ON public.request_internal_notes FOR INSERT
WITH CHECK (author_id = auth.uid() AND public.get_auth_role() IN ('STAFF', 'ADMIN'));

-- ----------------------------------------------------------------------------
-- NOTIFICATIONS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view and manage their own notifications"
ON public.notifications FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notification is_read"
ON public.notifications FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "System / Staff can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- AUDIT LOGS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Admin can view audit logs"
ON public.audit_logs FOR SELECT
USING (public.get_auth_role() = 'ADMIN');

CREATE POLICY "Authenticated users can insert audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- ----------------------------------------------------------------------------
-- SYSTEM SETTINGS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY "Anyone can view system settings"
ON public.system_settings FOR SELECT
USING (true);

CREATE POLICY "Admin can update system settings"
ON public.system_settings FOR UPDATE
USING (public.get_auth_role() = 'ADMIN');

-- ============================================================================
-- ATOMIC WORKFLOW RPC PROCEDURES (POSTGRESQL FUNCTIONS)
-- ============================================================================

-- Procedure: Submit Document Request (Atomic creation + history + notification)
CREATE OR REPLACE FUNCTION public.rpc_submit_document_request(
    p_document_type_id UUID,
    p_quantity INTEGER,
    p_purpose TEXT,
    p_release_method release_method_enum,
    p_delivery_address TEXT,
    p_remarks TEXT,
    p_priority request_priority_enum DEFAULT 'NORMAL'
)
RETURNS JSONB AS $$
DECLARE
    v_student_id UUID;
    v_user_id UUID;
    v_doc_fee NUMERIC(10,2);
    v_total_fee NUMERIC(10,2);
    v_new_request_id UUID;
    v_req_number TEXT;
    v_payment_status payment_status_enum;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: User not logged in';
    END IF;

    SELECT id INTO v_student_id FROM public.student_profiles WHERE user_id = v_user_id;
    IF v_student_id IS NULL THEN
        RAISE EXCEPTION 'Student profile not found for user';
    END IF;

    SELECT fee INTO v_doc_fee FROM public.document_types WHERE id = p_document_type_id;
    IF v_doc_fee IS NULL THEN
        RAISE EXCEPTION 'Invalid document type selected';
    END IF;

    v_total_fee := v_doc_fee * p_quantity;
    IF v_total_fee > 0 THEN
        v_payment_status := 'PENDING';
    ELSE
        v_payment_status := 'NOT_REQUIRED';
    END IF;

    v_req_number := public.generate_request_number();

    INSERT INTO public.requests (
        request_number,
        student_id,
        document_type_id,
        quantity,
        purpose,
        release_method,
        delivery_address,
        remarks,
        status,
        priority,
        fee,
        payment_status
    ) VALUES (
        v_req_number,
        v_student_id,
        p_document_type_id,
        p_quantity,
        p_purpose,
        p_release_method,
        p_delivery_address,
        p_remarks,
        'SUBMITTED',
        p_priority,
        v_total_fee,
        v_payment_status
    ) RETURNING id INTO v_new_request_id;

    -- Record Status History
    INSERT INTO public.request_status_history (
        request_id,
        previous_status,
        new_status,
        changed_by,
        reason,
        comment
    ) VALUES (
        v_new_request_id,
        NULL,
        'SUBMITTED',
        v_user_id,
        'Request submitted by student',
        p_remarks
    );

    -- Create Notification for Student
    INSERT INTO public.notifications (
        user_id,
        request_id,
        title,
        message,
        type
    ) VALUES (
        v_user_id,
        v_new_request_id,
        'Document Request Submitted',
        'Your request ' || v_req_number || ' has been received and is queued for verification.',
        'SUCCESS'
    );

    -- Audit Log
    INSERT INTO public.audit_logs (
        user_id,
        action,
        entity_type,
        entity_id,
        details
    ) VALUES (
        v_user_id,
        'REQUEST_CREATED',
        'requests',
        v_new_request_id::TEXT,
        jsonb_build_object(
            'request_number', v_req_number,
            'fee', v_total_fee,
            'quantity', p_quantity
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'request_id', v_new_request_id,
        'request_number', v_req_number
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Procedure: Transition Request Status (Atomic Workflow Step)
CREATE OR REPLACE FUNCTION public.rpc_update_request_status(
    p_request_id UUID,
    p_new_status request_status_enum,
    p_reason TEXT DEFAULT NULL,
    p_comment TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_user_role user_role_enum;
    v_old_status request_status_enum;
    v_student_user_id UUID;
    v_req_num TEXT;
    v_staff_id UUID;
BEGIN
    v_user_id := auth.uid();
    v_user_role := public.get_auth_role();
    v_staff_id := public.get_auth_staff_id();

    IF v_user_role NOT IN ('STAFF', 'ADMIN') THEN
        RAISE EXCEPTION 'Only staff or administrators can update workflow status';
    END IF;

    SELECT r.status, r.request_number, sp.user_id 
    INTO v_old_status, v_req_num, v_student_user_id
    FROM public.requests r
    JOIN public.student_profiles sp ON sp.id = r.student_id
    WHERE r.id = p_request_id;

    IF v_old_status IS NULL THEN
        RAISE EXCEPTION 'Request not found';
    END IF;

    -- Validate Rejection Reason Requirement
    IF p_new_status = 'REJECTED' AND (p_reason IS NULL OR TRIM(p_reason) = '') THEN
        RAISE EXCEPTION 'A mandatory reason is required to reject a document request';
    END IF;

    -- Validate Information Request Reason
    IF p_new_status = 'NEEDS_INFORMATION' AND (p_comment IS NULL OR TRIM(p_comment) = '') THEN
        RAISE EXCEPTION 'Details of the requested information must be specified';
    END IF;

    -- Update Request
    UPDATE public.requests
    SET 
        status = p_new_status,
        rejection_reason = CASE WHEN p_new_status = 'REJECTED' THEN p_reason ELSE rejection_reason END,
        information_request_note = CASE WHEN p_new_status = 'NEEDS_INFORMATION' THEN p_comment ELSE information_request_note END,
        released_at = CASE WHEN p_new_status = 'RELEASED' THEN NOW() ELSE released_at END,
        released_by = CASE WHEN p_new_status = 'RELEASED' THEN v_staff_id ELSE released_by END,
        assigned_to = COALESCE(assigned_to, v_staff_id),
        updated_at = NOW()
    WHERE id = p_request_id;

    -- Record Status History
    INSERT INTO public.request_status_history (
        request_id,
        previous_status,
        new_status,
        changed_by,
        reason,
        comment
    ) VALUES (
        p_request_id,
        v_old_status,
        p_new_status,
        v_user_id,
        p_reason,
        p_comment
    );

    -- Send Notification to Student
    INSERT INTO public.notifications (
        user_id,
        request_id,
        title,
        message,
        type
    ) VALUES (
        v_student_user_id,
        p_request_id,
        'Status Update: ' || v_req_num,
        CASE 
            WHEN p_new_status = 'UNDER_REVIEW' THEN 'Your request ' || v_req_num || ' is currently under review by registrar staff.'
            WHEN p_new_status = 'APPROVED' THEN 'Your request ' || v_req_num || ' has been approved and forwarded for processing.'
            WHEN p_new_status = 'PROCESSING' THEN 'Your request ' || v_req_num || ' is now being prepared and printed.'
            WHEN p_new_status = 'READY_FOR_RELEASE' THEN 'Your requested document (' || v_req_num || ') is ready for release/claim!'
            WHEN p_new_status = 'RELEASED' THEN 'Your document (' || v_req_num || ') has been successfully released.'
            WHEN p_new_status = 'REJECTED' THEN 'Your request ' || v_req_num || ' was rejected. Reason: ' || COALESCE(p_reason, 'See details')
            WHEN p_new_status = 'NEEDS_INFORMATION' THEN 'Action needed on ' || v_req_num || ': ' || COALESCE(p_comment, 'Please upload additional info')
            ELSE 'Your document request status changed to ' || p_new_status::TEXT
        END,
        CASE 
            WHEN p_new_status IN ('APPROVED', 'READY_FOR_RELEASE', 'RELEASED') THEN 'SUCCESS'
            WHEN p_new_status IN ('REJECTED') THEN 'ALERT'
            WHEN p_new_status IN ('NEEDS_INFORMATION') THEN 'WARNING'
            ELSE 'INFO'
        END
    );

    -- Audit Log
    INSERT INTO public.audit_logs (
        user_id,
        action,
        entity_type,
        entity_id,
        details
    ) VALUES (
        v_user_id,
        CASE 
            WHEN p_new_status = 'APPROVED' THEN 'REQUEST_APPROVED'
            WHEN p_new_status = 'REJECTED' THEN 'REQUEST_REJECTED'
            WHEN p_new_status = 'NEEDS_INFORMATION' THEN 'INFORMATION_REQUESTED'
            WHEN p_new_status = 'RELEASED' THEN 'DOCUMENT_RELEASED'
            ELSE 'STATUS_CHANGED'
        END,
        'requests',
        p_request_id::TEXT,
        jsonb_build_object(
            'request_number', v_req_num,
            'previous_status', v_old_status,
            'new_status', p_new_status,
            'reason', p_reason
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'request_id', p_request_id,
        'old_status', v_old_status,
        'new_status', p_new_status
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
