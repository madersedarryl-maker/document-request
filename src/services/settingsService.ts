import { supabase, getSupabaseConfig } from '../lib/supabase';
import { SystemSettings } from '../types';
import { mockStore } from './mockStore';
import { isDemoMode } from '../lib/appConfig';

export const settingsService = {
  /**
   * Get current institutional system settings
   */
  async getSettings(): Promise<SystemSettings> {
    const config = getSupabaseConfig();
    if (!config.isConfigured && isDemoMode()) {
      return mockStore.getSettings();
    }

    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Institutional settings have not been configured yet.');

      return data as SystemSettings;
    } catch (e) {
      if (isDemoMode()) return mockStore.getSettings();
      throw e;
    }
  },

  /**
   * Update institutional settings (Admin only)
   */
  async updateSettings(
    updates: Partial<Omit<SystemSettings, 'id' | 'updated_at'>>,
    adminUserId?: string
  ): Promise<SystemSettings> {
    const config = getSupabaseConfig();
    if (!config.isConfigured && isDemoMode()) return mockStore.updateSettings(updates);

    const { data: current, error: currentError } = await supabase.from('system_settings').select('*').limit(1).single();
    if (currentError) throw currentError;
    const { data, error } = await supabase.from('system_settings').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', current.id).select('*').single();
    if (error) throw error;
    return data as SystemSettings;
  },
};
