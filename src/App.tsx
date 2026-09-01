import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ToastAlert } from './components/ToastAlert';

// IBACMI Public Institutional Pages
import { HomePage } from './pages/ibacmi/HomePage';
import { ProgramsPage } from './pages/ibacmi/ProgramsPage';
import { AboutPage } from './pages/ibacmi/AboutPage';
import { PortalServicesPage } from './pages/ibacmi/PortalServicesPage';
import { NewsPage } from './pages/ibacmi/NewsPage';
import { ContactPage } from './pages/ibacmi/ContactPage';

// Auth & Public Document Tracking
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { PublicTrack } from './pages/public/PublicTrack';

// Student Portal Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { NewRequestForm } from './pages/student/NewRequestForm';
import { MyRequests } from './pages/student/MyRequests';
import { RequestDetail } from './pages/student/RequestDetail';

// Staff & Admin Portal Pages
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { StaffRequestQueue } from './pages/staff/StaffRequestQueue';
import { StaffRequestDetail } from './pages/staff/StaffRequestDetail';
import { DocumentTypesManager } from './pages/admin/DocumentTypesManager';
import { UserManagement } from './pages/admin/UserManagement';
import { ReportsPage } from './pages/admin/ReportsPage';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';
import { SystemSettingsPage } from './pages/admin/SystemSettingsPage';

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

  if (allowedRoles && role && !allowedRoles.includes(role)) {
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
    return <StaffDashboard />;
  }

  return <StudentDashboard />;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 selection:bg-amber-100 selection:text-blue-950">
            <Navbar />

            <main className="flex-1">
              <Routes>
                {/* Official Institutional Pages */}
                <Route path="/" element={<HomePage />} />
                <Route path="/programs" element={<ProgramsPage />} />
                <Route path="/admissions" element={<Navigate to="/services" replace />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/services" element={<PortalServicesPage />} />
                <Route path="/news" element={<NewsPage />} />
                <Route path="/contact" element={<ContactPage />} />

                {/* Public & Authentication Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/track" element={<PublicTrack />} />

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
                      <NewRequestForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-requests"
                  element={
                    <ProtectedRoute allowedRoles={['STUDENT']}>
                      <MyRequests />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/request/:id"
                  element={
                    <ProtectedRoute>
                      <RequestDetail />
                    </ProtectedRoute>
                  }
                />

                {/* Staff & Admin Protected Routes */}
                <Route
                  path="/staff/queue"
                  element={
                    <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
                      <StaffRequestQueue />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/staff/request/:id"
                  element={
                    <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
                      <StaffRequestDetail />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Management Routes */}
                <Route
                  path="/admin/documents"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <DocumentTypesManager />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <UserManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/reports"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <ReportsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/audit"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AuditLogsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/settings"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <SystemSettingsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            <Footer />
            <ToastAlert />
          </div>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
