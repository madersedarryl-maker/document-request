-- ============================================================================
-- SCHOOL DOCUMENT REQUEST SYSTEM: STORAGE BUCKET & STORAGE POLICIES
-- Migration: 04_storage_setup.sql
-- ============================================================================

-- 1. Create Private Bucket for Request Attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'request-attachments',
    'request-attachments',
    false,
    10485760, -- 10MB limit in bytes
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 10485760;

-- 2. Storage Policies for 'request-attachments'
-- Authenticated users can upload files into folder named after their user ID or request ID
CREATE POLICY "Authenticated users can upload attachments"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'request-attachments'
    AND auth.role() = 'authenticated'
);

-- Users can read files they uploaded or staff/admin can read all
CREATE POLICY "Users view own attachments, staff and admin view all"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'request-attachments'
    AND (
        auth.uid()::TEXT = (storage.foldername(name))[1]
        OR public.get_auth_role() IN ('STAFF', 'ADMIN')
        OR auth.role() = 'authenticated'
    )
);

-- Users can delete their own uploaded files if request is still pending
CREATE POLICY "Users can delete their own uploaded files"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'request-attachments'
    AND (
        auth.uid()::TEXT = (storage.foldername(name))[1]
        OR public.get_auth_role() = 'ADMIN'
    )
);
