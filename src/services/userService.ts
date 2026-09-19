import { supabase, getSupabaseConfig } from '../lib/supabase';
import { UserProfile, UserRole } from '../types';
import { mockStore } from './mockStore';
import { isDemoMode } from '../lib/appConfig';

export const userService = {
  /**
   * Get all users for admin management
   */
  async getAllUsers(): Promise<UserProfile[]> {
    const config = getSupabaseConfig();
    if (!config.isConfigured && isDemoMode()) {
      return mockStore.getAllUsers();
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          student_profiles(student_id, program, year_level),
          staff_profiles(employee_id, department, designation)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as any[];
    } catch (e) {
      if (isDemoMode()) return mockStore.getAllUsers();
      throw e;
    }
  },

  /**
   * Update user role (Admin only)
   */
  async updateUserRole(userId: string, newRole: UserRole): Promise<void> {
    const config = getSupabaseConfig();
    if (!config.isConfigured && isDemoMode()) {
      const user = mockStore.getUserById(userId);
      mockStore.updateUserRoleAndStatus(userId, newRole, user?.status || 'ACTIVE');
      return;
    }
    const { error } = await supabase.from('profiles').update({ role: newRole, updated_at: new Date().toISOString() }).eq('id', userId);
    if (error) throw error;
  },

  /**
   * Toggle user active/inactive status
   */
  async updateUserStatus(userId: string, status: 'ACTIVE' | 'INACTIVE'): Promise<void> {
    const config = getSupabaseConfig();
    if (!config.isConfigured && isDemoMode()) {
      const user = mockStore.getUserById(userId);
      mockStore.updateUserRoleAndStatus(userId, user?.role || 'STUDENT', status);
      return;
    }
    const { error } = await supabase.from('profiles').update({ status, updated_at: new Date().toISOString() }).eq('id', userId);
    if (error) throw error;
  },
};
