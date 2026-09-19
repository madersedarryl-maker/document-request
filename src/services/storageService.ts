import { supabase, getSupabaseConfig } from '../lib/supabase';
import { mockStore } from './mockStore';
import { isDemoMode } from '../lib/appConfig';

const BUCKET_NAME = 'request-attachments';

export const storageService = {
  /**
   * Upload an attachment file to Supabase Storage or mock store
   */
  async uploadFile(
    file: File,
    userId: string,
    requestId?: string
  ): Promise<{ storagePath: string; fileName: string; fileSize: number; mimeType: string }> {
    const config = getSupabaseConfig();
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const folder = requestId ? `${userId}/${requestId}` : `${userId}/temp`;
    const storagePath = `${folder}/${timestamp}_${sanitizedName}`;

    if (!config.isConfigured && isDemoMode()) {
      return {
        storagePath,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || 'application/octet-stream',
      };
    }

    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      return {
        storagePath: data.path,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || 'application/octet-stream',
      };
    } catch (e) {
      if (isDemoMode()) {
        return { storagePath, fileName: file.name, fileSize: file.size, mimeType: file.type || 'application/octet-stream' };
      }
      throw e;
    }
  },

  /**
   * Get a temporary secure signed URL for viewing/downloading an attachment
   */
  async getSignedUrl(storagePath: string, expiresInSeconds: number = 3600): Promise<string> {
    const config = getSupabaseConfig();
    if (!config.isConfigured && isDemoMode()) {
      return `https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=80`;
    }

    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(storagePath, expiresInSeconds);

      if (error || !data) throw error || new Error('Unable to create a secure file URL.');

      return data.signedUrl;
    } catch (e) {
      if (isDemoMode()) return `https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=80`;
      throw e;
    }
  },

  /**
   * Alias for getSignedUrl with download param
   */
  async getDownloadSignedUrl(storagePath: string, expiresInSeconds: number = 3600): Promise<string> {
    return this.getSignedUrl(storagePath, expiresInSeconds);
  },

  /**
   * Upload an attachment specifically for a document request
   */
  async uploadRequestAttachment(
    requestId: string,
    file: File
  ): Promise<{ storagePath: string; fileName: string; fileSize: number; mimeType: string }> {
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id || 'usr-student-001';
    return this.uploadFile(file, userId, requestId);
  },

  /**
   * Save attachment metadata record into request_attachments table
   */
  async saveAttachmentRecord(record: {
    request_id: string;
    uploaded_by: string;
    requirement_id?: string | null;
    file_name: string;
    storage_path: string;
    file_size?: number | null;
    mime_type?: string | null;
  }) {
    const config = getSupabaseConfig();
    if (!config.isConfigured && isDemoMode()) return mockStore.addAttachment(record);
    const { data, error } = await supabase.from('request_attachments').insert(record).select('*').single();
    if (error) throw error;
    return data;
  },

  /**
   * Delete an uploaded file from storage
   */
  async deleteFile(storagePath: string): Promise<void> {
    const config = getSupabaseConfig();
    if (!config.isConfigured && isDemoMode()) return;
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([storagePath]);
    if (error) throw error;
  },
};
