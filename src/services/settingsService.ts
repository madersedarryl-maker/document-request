import { supabase, getSupabaseConfig } from '../lib/supabase';
import { SystemSettings } from '../types';
import { mockStore } from './mockStore';

export const settingsService = {
  /**
   * Get current institutional system settings
   */
  async getSettings(): Promise<SystemSettings> {
    const config = getSupabaseConfig();
    if (!config.isConfigured) {
      return mockStore.getSettings();
    }

    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .limit(1)
        .single();

      if (error || !data) {
        return mockStore.getSettings();
      }

      return data as SystemSettings;
    } catch (e) {
      return mockStore.getSettings();
    }
  },

  /**
   * Update institutional settings (Admin only)
   */
  async updateSettings(
    updates: Partial<Omit<SystemSettings, 'id' | 'updated_at'>>,
    adminUserId?: string
  ): Promise<SystemSettings> {
    const updated = mockStore.updateSettings(updates);

    const config = getSupabaseConfig();
    if (config.isConfigured) {
      try {
        await supabase
          .from('system_settings')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', updated.id);
      } catch (e) {
        // ignore
      }
    }

    return updated;
  },
};
