-- ============================================================================
-- SCHOOL DOCUMENT REQUEST SYSTEM: WORKFLOW & ACTOR GUARDS
-- Migration: 07_workflow_guards.sql
-- Keeps request transitions valid even when a caller bypasses the frontend.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.enforce_request_status_transition()
RETURNS TRIGGER AS $$
DECLARE
    transition_allowed BOOLEAN := false;
    current_role user_role_enum;
BEGIN
    IF OLD.status IS NOT DISTINCT FROM NEW.status THEN
        RETURN NEW;
    END IF;

    transition_allowed :=
        (OLD.status = 'SUBMITTED' AND NEW.status IN ('UNDER_REVIEW', 'CANCELLED', 'REJECTED', 'NEEDS_INFORMATION')) OR
        (OLD.status = 'UNDER_REVIEW' AND NEW.status IN ('FOR_APPROVAL', 'APPROVED', 'PROCESSING', 'NEEDS_INFORMATION', 'REJECTED', 'CANCELLED')) OR
        (OLD.status = 'FOR_APPROVAL' AND NEW.status IN ('APPROVED', 'REJECTED', 'NEEDS_INFORMATION')) OR
        (OLD.status = 'APPROVED' AND NEW.status IN ('PROCESSING', 'REJECTED', 'CANCELLED')) OR
        (OLD.status = 'PROCESSING' AND NEW.status IN ('READY_FOR_RELEASE', 'REJECTED', 'NEEDS_INFORMATION')) OR
        (OLD.status = 'READY_FOR_RELEASE' AND NEW.status IN ('RELEASED', 'PROCESSING')) OR
        (OLD.status = 'NEEDS_INFORMATION' AND NEW.status IN ('UNDER_REVIEW', 'CANCELLED', 'REJECTED'));

    IF NOT transition_allowed THEN
        RAISE EXCEPTION 'Invalid request status transition: % -> %', OLD.status, NEW.status
            USING ERRCODE = 'P0001';
    END IF;

    current_role := public.get_auth_role();
    IF current_role = 'STUDENT' AND NOT (
        NEW.status = 'CANCELLED' OR
        (OLD.status = 'NEEDS_INFORMATION' AND NEW.status = 'UNDER_REVIEW')
    ) THEN
        RAISE EXCEPTION 'Students may only cancel a request or respond to an information request'
            USING ERRCODE = '42501';
    END IF;

    IF NEW.status = 'REJECTED' AND NULLIF(BTRIM(NEW.rejection_reason), '') IS NULL THEN
        RAISE EXCEPTION 'A reason is required for rejected requests'
            USING ERRCODE = 'P0001';
    END IF;

    IF NEW.status = 'NEEDS_INFORMATION' AND
       NULLIF(BTRIM(NEW.information_request_note), '') IS NULL THEN
        RAISE EXCEPTION 'Information requests must include a clear note'
            USING ERRCODE = 'P0001';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS enforce_request_status_transition ON public.requests;
CREATE TRIGGER enforce_request_status_transition
BEFORE UPDATE OF status ON public.requests
FOR EACH ROW
EXECUTE FUNCTION public.enforce_request_status_transition();

-- Replace the broad legacy update policy with a policy that also constrains the
-- value a student may write. Staff and administrators remain workflow actors.
DROP POLICY IF EXISTS "Students can cancel their pending request, Staff/Admin can update" ON public.requests;
CREATE POLICY "Students can cancel or respond, Staff/Admin can update"
ON public.requests FOR UPDATE
USING (
    (student_id = public.get_auth_student_id() AND status IN ('SUBMITTED', 'UNDER_REVIEW', 'NEEDS_INFORMATION'))
    OR public.get_auth_role() IN ('STAFF', 'ADMIN')
)
WITH CHECK (
    (student_id = public.get_auth_student_id() AND status IN ('CANCELLED', 'UNDER_REVIEW'))
    OR public.get_auth_role() IN ('STAFF', 'ADMIN')
);

-- The RPC is the only production workflow mutation exposed by the client.
REVOKE ALL ON FUNCTION public.rpc_update_request_status(UUID, request_status_enum, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rpc_update_request_status(UUID, request_status_enum, TEXT, TEXT) TO authenticated;
