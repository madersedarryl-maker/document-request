import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, testSupabaseConnection, getSupabaseConfig } from '../lib/supabase';
import { authService, StudentSignUpData } from '../services/authService';
import { UserProfile, StudentProfile, StaffProfile, UserRole } from '../types';
import { mockStore } from '../services/mockStore';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  studentProfile: StudentProfile | null;
  staffProfile: StaffProfile | null;
  role: UserRole | null;
  loading: boolean;
  dbConnected: boolean;
  connectionMessage: string;
  hasSchema: boolean;
  signIn: (email: string, pass?: string) => Promise<void>;
  signUpStudent: (data: StudentSignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  switchDemoAccount: (targetRole: 'STUDENT' | 'STAFF' | 'ADMIN') => Promise<void>;
  refreshProfile: () => Promise<void>;
  checkConnection: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [staffProfile, setStaffProfile] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [dbConnected, setDbConnected] = useState<boolean>(false);
  const [connectionMessage, setConnectionMessage] = useState<string>('');
  const [hasSchema, setHasSchema] = useState<boolean>(false);

  const checkConnection = async () => {
    const conn = await testSupabaseConnection();
    setDbConnected(conn.connected);
    setConnectionMessage(conn.message);
    setHasSchema(Boolean(conn.hasSchema));
  };

  const loadUserData = async (authUser: User | null, mockUserId?: string) => {
    if (!authUser && !mockUserId) {
      setUser(null);
      setProfile(null);
      setStudentProfile(null);
      setStaffProfile(null);
      setLoading(false);
      return;
    }

    try {
      const targetId = authUser?.id || mockUserId!;
      const data = await authService.getCurrentUserProfile(targetId);
      if (authUser) {
        setUser(authUser);
      } else if (data.profile) {
        setUser({
          id: data.profile.id,
          email: data.profile.email,
          user_metadata: { full_name: data.profile.full_name, role: data.profile.role },
        } as any);
      }
      setProfile(data.profile);
      setStudentProfile(data.studentProfile);
      setStaffProfile(data.staffProfile);
    } catch (err) {
      console.error('Error fetching user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    const config = getSupabaseConfig();
    if (config.isConfigured) {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        await loadUserData(data.user);
        return;
      }
    }
    const currentMock = mockStore.getCurrentUser();
    if (currentMock) {
      await loadUserData(null, currentMock.id);
    }
  };

  useEffect(() => {
    checkConnection();

    const config = getSupabaseConfig();
    if (config.isConfigured) {
      // Check current active session from Supabase
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          loadUserData(session.user);
        } else {
          // Check local store default
          const currentMock = mockStore.getCurrentUser();
          if (currentMock) {
            loadUserData(null, currentMock.id);
          } else {
            setLoading(false);
          }
        }
      });

      // Listen to Auth State Changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          await loadUserData(session.user);
        } else {
          const currentMock = mockStore.getCurrentUser();
          if (currentMock) {
            await loadUserData(null, currentMock.id);
          } else {
            setUser(null);
            setProfile(null);
            setStudentProfile(null);
            setStaffProfile(null);
            setLoading(false);
          }
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // Local demo mode initialized
      const currentMock = mockStore.getCurrentUser() || mockStore.getUserById('usr-student-001');
      if (currentMock) {
        mockStore.setCurrentUserId(currentMock.id);
        loadUserData(null, currentMock.id);
      } else {
        setLoading(false);
      }
    }
  }, []);

  const signIn = async (email: string, pass?: string) => {
    setLoading(true);
    try {
      const res = await authService.signIn(email, pass);
      if (res?.user) {
        await loadUserData(res.user);
      }
    } finally {
      setLoading(false);
    }
  };

  const switchDemoAccount = async (targetRole: 'STUDENT' | 'STAFF' | 'ADMIN') => {
    setLoading(true);
    try {
      let targetId = 'usr-student-001';
      if (targetRole === 'STAFF') targetId = 'usr-staff-001';
      if (targetRole === 'ADMIN') targetId = 'usr-admin-001';

      mockStore.setCurrentUserId(targetId);
      const userObj = mockStore.getUserById(targetId);
      if (userObj) {
        await loadUserData(null, userObj.id);
      }
    } finally {
      setLoading(false);
    }
  };

  const signUpStudent = async (data: StudentSignUpData) => {
    setLoading(true);
    try {
      const newUser = await authService.signUpStudent(data);
      if (newUser) {
        await loadUserData(newUser);
      }
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      setProfile(null);
      setStudentProfile(null);
      setStaffProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const role = useMemo(() => profile?.role || null, [profile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        studentProfile,
        staffProfile,
        role,
        loading,
        dbConnected,
        connectionMessage,
        hasSchema,
        signIn,
        signUpStudent,
        signOut,
        switchDemoAccount,
        refreshProfile,
        checkConnection,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
