import { supabase, getSupabaseConfig } from '../lib/supabase';
import { AuditLog } from '../types';
import { mockStore } from './mockStore';

export const auditService = {
  /**
   * Get audit trail logs for administrators
   */
  async getAuditLogs(limit: number = 100, actionFilter?: string): Promise<AuditLog[]> {
    const config = getSupabaseConfig();
    if (!config.isConfigured) {
      return mockStore.getAuditLogs(actionFilter).slice(0, limit);
    }

    try {
      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          user:profiles(full_name, email, role)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (actionFilter && actionFilter !== 'ALL') {
        query = query.eq('action', actionFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as AuditLog[];
    } catch (e) {
      return mockStore.getAuditLogs(actionFilter).slice(0, limit);
    }
  },

  /**
   * Log an audit event
   */
  async logEvent(
    action: AuditLog['action'],
    entityType: string,
    entityId?: string,
    details?: Record<string, any>
  ): Promise<void> {
    const config = getSupabaseConfig();
    mockStore.addAuditLog({
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
    });

    if (config.isConfigured) {
      try {
        const { data } = await supabase.auth.getUser();
        await supabase.from('audit_logs').insert({
          user_id: data?.user?.id || null,
          action,
          entity_type: entityType,
          entity_id: entityId || null,
          details: details || null,
        });
      } catch (e) {
        // ignore
      }
    }
  },
};
