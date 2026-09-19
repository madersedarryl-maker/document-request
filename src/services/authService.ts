import { supabase, getSupabaseConfig } from '../lib/supabase';
import { UserProfile, StudentProfile, StaffProfile, UserRole } from '../types';
import { mockStore } from './mockStore';
import { isDemoMode, productionConfigurationMessage } from '../lib/appConfig';

export interface StudentSignUpData {
  email: string;
  password: string;
  fullName: string;
  studentId: string;
  program: string;
  yearLevel: string;
  phone?: string;
  emergencyContact?: string;
}

export const authService = {
  /**
   * Register a new student account using Supabase Auth or mock fallback
   */
  async signUpStudent(data: StudentSignUpData) {
    const config = getSupabaseConfig();
    if (!config.isConfigured && isDemoMode()) {
      const { profile } = mockStore.createStudentUser({
        email: data.email,
        fullName: data.fullName,
        studentId: data.studentId,
        program: data.program,
        yearLevel: data.yearLevel,
        phone: data.phone,
        emergencyContact: data.emergencyContact,
      });

      return {
        id: profile.id,
        email: profile.email,
        user_metadata: { full_name: profile.full_name, role: profile.role },
      } as any;
    }
    if (!config.isConfigured) throw new Error(productionConfigurationMessage);

    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            role: 'STUDENT',
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create authentication user');

      const userId = authData.user.id;

      // 2. Insert into profiles table
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: userId,
        email: data.email,
        full_name: data.fullName,
        role: 'STUDENT',
        phone: data.phone || null,
        status: 'ACTIVE',
      });

      if (profileError) throw profileError;

      // 3. Insert into student_profiles table
      const { error: studentError } = await supabase.from('student_profiles').upsert({
        user_id: userId,
        student_id: data.studentId,
        program: data.program,
        year_level: data.yearLevel,
        contact_number: data.phone || null,
        emergency_contact: data.emergencyContact || null,
      });

      if (studentError) throw studentError;

      // 4. Log Audit Event
      await supabase.from('audit_logs').insert({
        user_id: userId,
        action: 'USER_CREATED',
        entity_type: 'profiles',
        entity_id: userId,
        details: { role: 'STUDENT', email: data.email, student_id: data.studentId },
      });

      return authData.user;
    } catch (err) {
      if (!isDemoMode()) throw err;
      console.warn('Supabase signUp error, using explicit demo store:', err);
      const { profile } = mockStore.createStudentUser({
        email: data.email,
        fullName: data.fullName,
        studentId: data.studentId,
        program: data.program,
        yearLevel: data.yearLevel,
        phone: data.phone,
        emergencyContact: data.emergencyContact,
      });

      return {
        id: profile.id,
        email: profile.email,
        user_metadata: { full_name: profile.full_name, role: profile.role },
      } as any;
    }
  },

  /**
   * Sign in user with Supabase Auth or mock store fallback
   */
  async signIn(email: string, password?: string) {
    const config = getSupabaseConfig();
    const cleanEmail = email.trim().toLowerCase();

    if (!config.isConfigured && isDemoMode()) {
      // Find in mock store or create student on the fly if not existing
      let user = mockStore.getUserByEmail(cleanEmail);
      if (!user) {
        // Create user on the fly for smooth testing
        const isStaff = cleanEmail.includes('staff');
        const isAdmin = cleanEmail.includes('admin');
        const role: UserRole = isAdmin ? 'ADMIN' : isStaff ? 'STAFF' : 'STUDENT';
        const name = cleanEmail.split('@')[0].replace('.', ' ').replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());

        const created = mockStore.createStudentUser({
          email: cleanEmail,
          fullName: name || 'Demo Student',
          studentId: `2026-${Math.floor(10000 + Math.random() * 90000)}`,
          program: 'BS Computer Science',
          yearLevel: '3rd Year',
        });
        if (role !== 'STUDENT') {
          mockStore.updateUserRoleAndStatus(created.profile.id, role, 'ACTIVE');
        }
        user = mockStore.getUserById(created.profile.id);
      }

      mockStore.setCurrentUserId(user!.id);
      mockStore.addAuditLog({
        user_id: user!.id,
        action: 'LOGIN',
        entity_type: 'auth',
        entity_id: user!.id,
        details: { email: user!.email },
      });

      return {
        user: {
          id: user!.id,
          email: user!.email,
          user_metadata: { full_name: user!.full_name, role: user!.role },
        },
        session: { access_token: 'mock-token' },
      } as any;
    }
    if (!config.isConfigured) throw new Error(productionConfigurationMessage);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password || 'password123',
      });

      if (error) {
        // If it's a demo account and not in remote Supabase auth yet, fall back to mock store smoothly
        const user = isDemoMode() ? mockStore.getUserByEmail(cleanEmail) : null;
        if (user && (cleanEmail.includes('university.edu') || cleanEmail.includes('demo') || cleanEmail.includes('test'))) {
          console.info('Using local demo credentials fallback for:', cleanEmail);
          mockStore.setCurrentUserId(user.id);
          return {
            user: {
              id: user.id,
              email: user.email,
              user_metadata: { full_name: user.full_name, role: user.role },
            },
            session: { access_token: 'demo-session-token' },
          } as any;
        }

        // Friendly error message for Supabase Auth errors
        if (error.message?.includes('Email not confirmed')) {
          throw new Error('Supabase Auth: Email not confirmed yet. Please verify your email via the link sent to your inbox, or disable "Confirm email" in Supabase Auth Settings.');
        } else if (error.message?.includes('Invalid login credentials')) {
          throw new Error('Invalid login credentials. If this user is not registered in your Supabase Auth yet, please click "Create Student Account" below or use the 1-Click Demo buttons.');
        }
        throw error;
      }

      if (data.user) {
        try {
          await supabase.from('audit_logs').insert({
            user_id: data.user.id,
            action: 'LOGIN',
            entity_type: 'auth',
            entity_id: data.user.id,
            details: { email: data.user.email },
          });
        } catch (e) {
          // Ignore audit table insert error if schema is pending
        }
      }

      return data;
    } catch (err: any) {
      console.warn('Supabase signIn error:', err);
      const user = isDemoMode() ? mockStore.getUserByEmail(cleanEmail) : null;
      if (user && (cleanEmail.includes('university.edu') || cleanEmail.includes('demo') || cleanEmail.includes('student') || cleanEmail.includes('staff') || cleanEmail.includes('admin'))) {
        mockStore.setCurrentUserId(user.id);
        return {
          user: {
            id: user.id,
            email: user.email,
            user_metadata: { full_name: user.full_name, role: user.role },
          },
          session: { access_token: 'demo-session-token' },
        } as any;
      }
      throw err;
    }
  },

  /**
   * Sign out current user
   */
  async signOut() {
    if (isDemoMode()) mockStore.setCurrentUserId(null);
    const config = getSupabaseConfig();
    if (config.isConfigured) {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user) {
          await supabase.from('audit_logs').insert({
            user_id: userData.user.id,
            action: 'LOGOUT',
            entity_type: 'auth',
            entity_id: userData.user.id,
          });
        }
        await supabase.auth.signOut();
      } catch (e) {
        // Ignore errors on signout
      }
    }
  },

  /**
   * Request password reset email
   */
  async resetPassword(email: string) {
    const config = getSupabaseConfig();
    if (!config.isConfigured && isDemoMode()) {
      return { success: true };
    }
    if (!config.isConfigured) throw new Error(productionConfigurationMessage);
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      return data;
    } catch (e) {
      if (isDemoMode()) return { success: true };
      throw e;
    }
  },

  /**
   * Update password for authenticated user
   */
  async updatePassword(password: string) {
    const config = getSupabaseConfig();
    if (!config.isConfigured && isDemoMode()) {
      return { success: true };
    }
    if (!config.isConfigured) throw new Error(productionConfigurationMessage);
    const { data, error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    return data;
  },

  /**
   * Fetch full user profile, student profile, and staff profile
   */
  async getCurrentUserProfile(userId: string): Promise<{
    profile: UserProfile | null;
    studentProfile: StudentProfile | null;
    staffProfile: StaffProfile | null;
  }> {
    const config = getSupabaseConfig();
    if (!config.isConfigured && isDemoMode()) {
      const profile = mockStore.getUserById(userId);
      const studentProfile = mockStore.getStudentProfileByUserId(userId);
      const staffProfile = mockStore.getStaffProfileByUserId(userId);
      return { profile, studentProfile, staffProfile };
    }
    if (!config.isConfigured) throw new Error(productionConfigurationMessage);

    try {
      // 1. Try querying remote profiles table
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileErr || !profile) {
        // Check if user is in auth
        const { data: authData } = await supabase.auth.getUser();
        const authUser = authData?.user;

        if (authUser && authUser.id === userId) {
          const derivedRole: UserRole =
            (authUser.user_metadata?.role as UserRole) ||
            (authUser.email?.includes('admin')
              ? 'ADMIN'
              : authUser.email?.includes('staff')
              ? 'STAFF'
              : 'STUDENT');

          const derivedName =
            authUser.user_metadata?.full_name ||
            authUser.email?.split('@')[0].replace('.', ' ').replace(/(^\w|\s\w)/g, (m) => m.toUpperCase()) ||
            'User';

          const autoProfile: UserProfile = {
            id: userId,
            email: authUser.email || '',
            full_name: derivedName,
            role: derivedRole,
            status: 'ACTIVE',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          // Auto-provision profile records in background
          try {
            await supabase.from('profiles').upsert({
              id: userId,
              email: authUser.email,
              full_name: derivedName,
              role: derivedRole,
              status: 'ACTIVE',
            });

            if (derivedRole === 'STUDENT') {
              await supabase.from('student_profiles').upsert({
                user_id: userId,
                student_id: `STU-${userId.substring(0, 6).toUpperCase()}`,
                program: 'BS Information Technology',
                year_level: '3rd Year',
              });
            } else {
              await supabase.from('staff_profiles').upsert({
                user_id: userId,
                employee_id: `EMP-${userId.substring(0, 6).toUpperCase()}`,
                department: 'Office of the Registrar',
                designation: derivedRole === 'ADMIN' ? 'Registrar Administrator' : 'Records Officer',
                can_approve: true,
              });
            }
          } catch (upsertErr) {
            console.info('Profile auto-provision note:', upsertErr);
          }

          const autoStudent: StudentProfile | null =
            derivedRole === 'STUDENT'
              ? {
                  id: `stu-${userId}`,
                  user_id: userId,
                  student_id: `STU-${userId.substring(0, 6).toUpperCase()}`,
                  program: 'BS Information Technology',
                  year_level: '3rd Year',
                  contact_number: null,
                  emergency_contact: null,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                }
              : null;

          const autoStaff: StaffProfile | null =
            derivedRole !== 'STUDENT'
              ? {
                  id: `staff-${userId}`,
                  user_id: userId,
                  employee_id: `EMP-${userId.substring(0, 6).toUpperCase()}`,
                  department: 'Office of the Registrar',
                  designation: derivedRole === 'ADMIN' ? 'Registrar Administrator' : 'Records Officer',
                  can_approve: true,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                }
              : null;

          return { profile: autoProfile, studentProfile: autoStudent, staffProfile: autoStaff };
        }

        if (isDemoMode()) {
          const mockP = mockStore.getUserById(userId);
          if (mockP) {
            return {
              profile: mockP,
              studentProfile: mockStore.getStudentProfileByUserId(userId),
              staffProfile: mockStore.getStaffProfileByUserId(userId),
            };
          }
        }
        return { profile: null, studentProfile: null, staffProfile: null };
      }

      let studentProfile: StudentProfile | null = null;
      let staffProfile: StaffProfile | null = null;

      if (profile.role === 'STUDENT') {
        const { data: sData } = await supabase
          .from('student_profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
        studentProfile = sData || null;
      } else if (profile.role === 'STAFF' || profile.role === 'ADMIN') {
        const { data: stData } = await supabase
          .from('staff_profiles')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();
        staffProfile = stData || null;
      }

      return { profile, studentProfile, staffProfile };
    } catch (e) {
      if (!isDemoMode()) throw e;
      const profile = mockStore.getUserById(userId);
      const studentProfile = mockStore.getStudentProfileByUserId(userId);
      const staffProfile = mockStore.getStaffProfileByUserId(userId);
      return { profile, studentProfile, staffProfile };
    }
  },

  /**
   * Update profile information
   */
  async updateProfile(
    userId: string,
    updates: {
      full_name?: string;
      phone?: string | null;
    },
    studentUpdates?: {
      program?: string;
      year_level?: string;
      contact_number?: string | null;
      emergency_contact?: string | null;
    }
  ) {
    const config = getSupabaseConfig();
    if (!config.isConfigured && !isDemoMode()) throw new Error(productionConfigurationMessage);
    if (isDemoMode()) mockStore.updateProfile(userId, updates, studentUpdates);
    if (config.isConfigured) {
      try {
        await supabase
          .from('profiles')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', userId);

        if (studentUpdates) {
          await supabase
            .from('student_profiles')
            .update({ ...studentUpdates, updated_at: new Date().toISOString() })
            .eq('user_id', userId);
        }

        await supabase.from('audit_logs').insert({
          user_id: userId,
          action: 'USER_UPDATED',
          entity_type: 'profiles',
          entity_id: userId,
          details: { updates, studentUpdates },
        });
      } catch (e) {
        console.warn('Supabase updateProfile error:', e);
      }
    }
  },

  /**
   * Fetch all user profiles for Admin User Management
   */
  async getAllUsers() {
    const config = getSupabaseConfig();
    if (!config.isConfigured && isDemoMode()) {
      return mockStore.getAllUsers();
    }
    if (!config.isConfigured) throw new Error(productionConfigurationMessage);

    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*, student_profile:student_profiles(*), staff_profile:staff_profiles(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return profiles || [];
    } catch (e) {
      if (isDemoMode()) return mockStore.getAllUsers();
      throw e;
    }
  },

  /**
   * Update role and status for an account (Admin only)
   */
  async updateUserRoleAndStatus(
    userId: string,
    role: UserRole,
    status: 'ACTIVE' | 'INACTIVE'
  ) {
    const config = getSupabaseConfig();
    if (!config.isConfigured && !isDemoMode()) throw new Error(productionConfigurationMessage);
    if (isDemoMode()) mockStore.updateUserRoleAndStatus(userId, role, status);
    if (config.isConfigured) {
      try {
        await supabase
          .from('profiles')
          .update({ role, status, updated_at: new Date().toISOString() })
          .eq('id', userId);

        await supabase.from('audit_logs').insert({
          action: 'USER_ROLE_UPDATED',
          entity_type: 'profiles',
          entity_id: userId,
          details: { new_role: role, new_status: status },
        });
      } catch (e) {
        console.warn('Supabase updateUserRoleAndStatus error:', e);
      }
    }
  },
};
