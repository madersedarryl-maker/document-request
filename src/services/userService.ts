import { supabase, getSupabaseConfig } from '../lib/supabase';
import { UserProfile, UserRole } from '../types';
import { mockStore } from './mockStore';

export const userService = {
  /**
   * Get all users for admin management
   */
  async getAllUsers(): Promise<UserProfile[]> {
    const config = getSupabaseConfig();
    if (!config.isConfigured) {
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
      return mockStore.getAllUsers();
    }
  },

  /**
   * Update user role (Admin only)
   */
  async updateUserRole(userId: string, newRole: UserRole): Promise<void> {
    const user = mockStore.getUserById(userId);
    mockStore.updateUserRoleAndStatus(userId, newRole, user?.status || 'ACTIVE');

    const config = getSupabaseConfig();
    if (config.isConfigured) {
      try {
        await supabase
          .from('profiles')
          .update({ role: newRole, updated_at: new Date().toISOString() })
          .eq('id', userId);
      } catch (e) {
        // ignore
      }
    }
  },

  /**
   * Toggle user active/inactive status
   */
  async updateUserStatus(userId: string, status: 'ACTIVE' | 'INACTIVE'): Promise<void> {
    const user = mockStore.getUserById(userId);
    mockStore.updateUserRoleAndStatus(userId, user?.role || 'STUDENT', status);

    const config = getSupabaseConfig();
    if (config.isConfigured) {
      try {
        await supabase
          .from('profiles')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', userId);
      } catch (e) {
        // ignore
      }
    }
  },
};
