-- ============================================================================
-- SCHOOL DOCUMENT REQUEST SYSTEM: STATUS EMAIL NOTIFICATION SYSTEM
-- Migration: 06_status_notification_webhook.sql
-- Enables automated email notifications to students upon request status changes
-- via Supabase Edge Functions & Database Webhooks.
-- ============================================================================

-- 1. Create Email Logs Table
CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES public.requests(id) ON DELETE CASCADE,
    recipient_email TEXT NOT NULL,
    recipient_name TEXT,
    status request_status_enum NOT NULL,
    subject TEXT NOT NULL,
    body_preview TEXT,
    delivery_provider TEXT NOT NULL DEFAULT 'supabase_edge_function',
    delivery_status TEXT NOT NULL DEFAULT 'DELIVERED' CHECK (
        delivery_status IN ('PENDING', 'SENT', 'DELIVERED', 'FAILED')
    ),
    provider_message_id TEXT,
    error_message TEXT,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_email_logs_request_id ON public.email_logs(request_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient_email ON public.email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON public.email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON public.email_logs(sent_at DESC);

-- 3. Row Level Security (RLS) for Email Logs
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Admins and Staff can read all email logs
CREATE POLICY "Staff and Admins can view all email logs"
    ON public.email_logs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('STAFF', 'ADMIN')
        )
    );

-- Students can view email logs for their own requests
CREATE POLICY "Students can view their own email logs"
    ON public.email_logs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.requests r
            JOIN public.student_profiles sp ON sp.id = r.student_id
            WHERE r.id = email_logs.request_id
            AND sp.user_id = auth.uid()
        )
    );

-- Authenticated staff and service role can insert email logs
CREATE POLICY "Staff and system can insert email logs"
    ON public.email_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- 4. Enable pg_net for Asynchronous HTTP Calls to Edge Function (if supported by Supabase project)
CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA extensions;

-- 5. Trigger Function: Asynchronous Edge Function Notification via pg_net
-- This trigger function automatically invokes the Supabase Edge Function whenever
-- a request's status changes.
CREATE OR REPLACE FUNCTION public.trg_notify_request_status_change()
RETURNS TRIGGER AS $$
DECLARE
    edge_fn_url TEXT;
    anon_key TEXT;
    payload JSONB;
    student_record RECORD;
    doc_record RECORD;
BEGIN
    -- Only proceed if status has transitioned to a new value
    IF (TG_OP = 'UPDATE' AND OLD.status IS NOT DISTINCT FROM NEW.status) THEN
        RETURN NEW;
    END IF;

    -- Fetch student profile and auth details
    SELECT 
        sp.student_id,
        p.full_name,
        p.email
    INTO student_record
    FROM public.student_profiles sp
    JOIN public.profiles p ON p.id = sp.user_id
    WHERE sp.id = NEW.student_id;

    -- Fetch document type name
    SELECT name INTO doc_record
    FROM public.document_types
    WHERE id = NEW.document_type_id;

    -- Retrieve Supabase settings if configured in system_settings or vault
    edge_fn_url := current_setting('app.settings.edge_function_url', true);
    anon_key := current_setting('app.settings.supabase_anon_key', true);

    -- Construct Webhook / Function Payload
    payload := jsonb_build_object(
        'requestId', NEW.id,
        'requestNumber', NEW.request_number,
        'newStatus', NEW.status,
        'previousStatus', CASE WHEN TG_OP = 'UPDATE' THEN OLD.status ELSE NULL END,
        'studentEmail', student_record.email,
        'studentName', student_record.full_name,
        'studentId', student_record.student_id,
        'documentTypeName', doc_record.name,
        'releaseMethod', NEW.release_method,
        'remarks', COALESCE(NEW.information_request_note, NEW.rejection_reason, NEW.remarks, ''),
        'updatedAt', NOW()
    );

    -- Log system notification into public.notifications
    INSERT INTO public.notifications (
        user_id,
        request_id,
        title,
        message,
        type
    ) VALUES (
        (SELECT user_id FROM public.student_profiles WHERE id = NEW.student_id),
        NEW.id,
        'Status Update: ' || NEW.request_number,
        'Your request for ' || COALESCE(doc_record.name, 'document') || ' has been updated to ' || REPLACE(NEW.status::TEXT, '_', ' ') || '.',
        CASE 
            WHEN NEW.status IN ('APPROVED', 'READY_FOR_RELEASE', 'RELEASED') THEN 'SUCCESS'
            WHEN NEW.status = 'NEEDS_INFORMATION' THEN 'WARNING'
            WHEN NEW.status = 'REJECTED' THEN 'ALERT'
            ELSE 'INFO'
        END
    );

    -- If pg_net is available and edge_fn_url is set, dispatch HTTP request to Supabase Edge Function
    IF edge_fn_url IS NOT NULL AND edge_fn_url <> '' THEN
        PERFORM net.http_post(
            url := edge_fn_url || '/functions/v1/send-status-email',
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer ' || COALESCE(anon_key, '')
            ),
            body := payload
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Attach Trigger to requests table
DROP TRIGGER IF EXISTS trigger_notify_request_status_change ON public.requests;

CREATE TRIGGER trigger_notify_request_status_change
    AFTER UPDATE OF status ON public.requests
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION public.trg_notify_request_status_change();

-- 7. Documented Webhook Setup Note:
-- If using the Supabase Dashboard Webhooks UI (Database -> Webhooks):
-- - Name: send_status_email_on_update
-- - Table: public.requests
-- - Events: UPDATE (and optionally INSERT)
-- - Type: Supabase Edge Functions
-- - Function: send-status-email
-- - HTTP Method: POST
