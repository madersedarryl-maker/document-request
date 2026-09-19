import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ToastAlert } from './components/ToastAlert';
import { AdminStaffLayout } from './components/layout/AdminStaffLayout';
import { StudentPortalLayout } from './components/layout/StudentPortalLayout';
import { isRoleAllowed } from './lib/permissions';
import { appConfig } from './lib/appConfig';
import { getSupabaseConfig } from './lib/supabase';

// IBACMI Public Institutional Pages
const HomePage = lazy(() => import('./pages/ibacmi/HomePage').then((m) => ({ default: m.HomePage })));
const ProgramsPage = lazy(() => import('./pages/ibacmi/ProgramsPage').then((m) => ({ default: m.ProgramsPage })));
const AboutPage = lazy(() => import('./pages/ibacmi/AboutPage').then((m) => ({ default: m.AboutPage })));
const PortalServicesPage = lazy(() => import('./pages/ibacmi/PortalServicesPage').then((m) => ({ default: m.PortalServicesPage })));
const NewsPage = lazy(() => import('./pages/ibacmi/NewsPage').then((m) => ({ default: m.NewsPage })));
const ContactPage = lazy(() => import('./pages/ibacmi/ContactPage').then((m) => ({ default: m.ContactPage })));

// Auth & Public Document Tracking
const Login = lazy(() => import('./pages/auth/Login').then((m) => ({ default: m.Login })));
const Register = lazy(() => import('./pages/auth/Register').then((m) => ({ default: m.Register })));
const PublicTrack = lazy(() => import('./pages/public/PublicTrack').then((m) => ({ default: m.PublicTrack })));

// Student Portal Pages
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard').then((m) => ({ default: m.StudentDashboard })));
const NewRequestForm = lazy(() => import('./pages/student/NewRequestForm').then((m) => ({ default: m.NewRequestForm })));
const MyRequests = lazy(() => import('./pages/student/MyRequests').then((m) => ({ default: m.MyRequests })));
const RequestDetail = lazy(() => import('./pages/student/RequestDetail').then((m) => ({ default: m.RequestDetail })));

// Staff & Admin Portal Pages
const StaffDashboard = lazy(() => import('./pages/staff/StaffDashboard').then((m) => ({ default: m.StaffDashboard })));
const StaffRequestQueue = lazy(() => import('./pages/staff/StaffRequestQueue').then((m) => ({ default: m.StaffRequestQueue })));
const StaffRequestDetail = lazy(() => import('./pages/staff/StaffRequestDetail').then((m) => ({ default: m.StaffRequestDetail })));
const DocumentTypesManager = lazy(() => import('./pages/admin/DocumentTypesManager').then((m) => ({ default: m.DocumentTypesManager })));
const UserManagement = lazy(() => import('./pages/admin/UserManagement').then((m) => ({ default: m.UserManagement })));
const ReportsPage = lazy(() => import('./pages/admin/ReportsPage').then((m) => ({ default: m.ReportsPage })));
const AuditLogsPage = lazy(() => import('./pages/admin/AuditLogsPage').then((m) => ({ default: m.AuditLogsPage })));
const SystemSettingsPage = lazy(() => import('./pages/admin/SystemSettingsPage').then((m) => ({ default: m.SystemSettingsPage })));

// Protected Route Guard
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: ('STUDENT' | 'STAFF' | 'ADMIN')[];
}> = ({ children, allowedRoles }) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-xs text-slate-400">
        Loading session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isRoleAllowed(role, allowedRoles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Dynamic Dashboard Route based on Role
const HomeRoute: React.FC = () => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-xs text-slate-400">
        Verifying authorization...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role === 'STAFF' || role === 'ADMIN') {
    return (
      <AdminStaffLayout>
        <StaffDashboard />
      </AdminStaffLayout>
    );
  }

  return (
    <StudentPortalLayout>
      <StudentDashboard />
    </StudentPortalLayout>
  );
};

const RouteFallback: React.FC = () => (
  <div className="flex min-h-[45vh] items-center justify-center px-6 text-sm text-slate-500" role="status" aria-live="polite">
    Loading portal workspace…
  </div>
);

const AppShell: React.FC = () => {
  const { user, role } = useAuth();
  const location = useLocation();

  const isStaffAdminWorkspace =
    !!user &&
    (role === 'STAFF' || role === 'ADMIN') &&
    (location.pathname === '/dashboard' ||
      location.pathname.startsWith('/staff') ||
      location.pathname.startsWith('/admin') ||
      location.pathname === '/services' ||
      location.pathname === '/track');
  const isStudentWorkspace =
    !!user &&
    role === 'STUDENT' &&
    (location.pathname === '/dashboard' ||
      location.pathname.startsWith('/my-requests') ||
      location.pathname.startsWith('/new-request') ||
      location.pathname.startsWith('/request/') ||
      location.pathname === '/services' ||
      location.pathname === '/track');
  const isPortalWorkspace = isStaffAdminWorkspace || isStudentWorkspace;
  const showConfigurationNotice =
    appConfig.isProduction &&
    !getSupabaseConfig().isConfigured &&
    (location.pathname === '/login' || location.pathname === '/register' || location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/my-requests') || location.pathname.startsWith('/new-request') || location.pathname.startsWith('/request/') || location.pathname.startsWith('/staff') || location.pathname.startsWith('/admin'));

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 selection:bg-amber-100 selection:text-blue-950">
      {!isPortalWorkspace && <Navbar />}

      {showConfigurationNotice && (
        <div role="alert" className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-xs font-medium text-amber-950">
          Production mode is active, but Supabase is not configured. Add the required `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables before using portal workflows.
        </div>
      )}

      <main className="flex-1">
        <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* Official Institutional Pages */}
          <Route path="/" element={<HomePage />} />
          <Route path="/programs" element={<ProgramsPage />} />
          <Route path="/admissions" element={<Navigate to="/services" replace />} />
          <Route path="/about" element={<AboutPage />} />
          <Route
            path="/services"
            element={
              user && (role === 'STAFF' || role === 'ADMIN') ? (
                <AdminStaffLayout>
                  <PortalServicesPage />
                </AdminStaffLayout>
              ) : user && role === 'STUDENT' ? (
                <StudentPortalLayout>
                  <PortalServicesPage />
                </StudentPortalLayout>
              ) : (
                <PortalServicesPage />
              )
            }
          />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Public & Authentication Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/track"
            element={
              user && (role === 'STAFF' || role === 'ADMIN') ? (
                <AdminStaffLayout>
                  <PublicTrack />
                </AdminStaffLayout>
              ) : user && role === 'STUDENT' ? (
                <StudentPortalLayout>
                  <PublicTrack />
                </StudentPortalLayout>
              ) : (
                <PublicTrack />
              )
            }
          />

          {/* Portal Dashboard (Dynamic based on user role) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <HomeRoute />
              </ProtectedRoute>
            }
          />

          {/* Student Protected Routes */}
          <Route
            path="/new-request"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentPortalLayout>
                  <NewRequestForm />
                </StudentPortalLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-requests"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentPortalLayout>
                  <MyRequests />
                </StudentPortalLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/request/:id"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentPortalLayout>
                  <RequestDetail />
                </StudentPortalLayout>
              </ProtectedRoute>
            }
          />

          {/* Staff & Admin Protected Routes with Sidebar Navigation */}
          <Route
            path="/staff/queue"
            element={
              <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
                <AdminStaffLayout>
                  <StaffRequestQueue />
                </AdminStaffLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/staff/request/:id"
            element={
              <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
                <AdminStaffLayout>
                  <StaffRequestDetail />
                </AdminStaffLayout>
              </ProtectedRoute>
            }
          />

          {/* Admin Management Routes with Sidebar Navigation */}
          <Route
            path="/admin/documents"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminStaffLayout>
                  <DocumentTypesManager />
                </AdminStaffLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminStaffLayout>
                  <UserManagement />
                </AdminStaffLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminStaffLayout>
                  <ReportsPage />
                </AdminStaffLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audit"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminStaffLayout>
                  <AuditLogsPage />
                </AdminStaffLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminStaffLayout>
                  <SystemSettingsPage />
                </AdminStaffLayout>
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
      </main>

      {!isPortalWorkspace && <Footer />}
      <ToastAlert />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <AppShell />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
