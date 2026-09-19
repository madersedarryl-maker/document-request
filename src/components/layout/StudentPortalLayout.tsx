import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationBell } from '../NotificationBell';
import { DatabaseSetupModal } from '../DatabaseSetupModal';
import { ProfileModal } from '../ProfileModal';
import { StudentPortalSidebar } from './StudentPortalSidebar';
import { Menu, PanelLeftClose, PanelLeftOpen, Globe } from 'lucide-react';

interface StudentPortalLayoutProps {
  children: React.ReactNode;
}

const getPageTitle = (pathname: string) => {
  if (pathname === '/dashboard') return 'Dashboard';
  if (pathname.startsWith('/my-requests')) return 'My Requests';
  if (pathname.startsWith('/new-request')) return 'New Request';
  if (pathname.startsWith('/request/')) return 'Request Details';
  if (pathname.startsWith('/services')) return 'Document Catalog';
  if (pathname.startsWith('/track')) return 'Track Request';
  return 'Student Portal';
};

export const StudentPortalLayout: React.FC<StudentPortalLayoutProps> = ({ children }) => {
  const { profile } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() =>
    localStorage.getItem('ibacmi_student_sidebar_collapsed') === 'true'
  );
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const handleToggleCollapse = () => {
    setIsCollapsed((previous) => {
      const next = !previous;
      localStorage.setItem('ibacmi_student_sidebar_collapsed', String(next));
      return next;
    });
  };

  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <StudentPortalSidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenDbModal={() => setIsDbModalOpen(true)}
      />

      <div className={`min-h-screen transition-[padding] duration-300 ${isCollapsed ? 'md:pl-[72px]' : 'md:pl-64'}`}>
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200/90 bg-white/95 px-4 shadow-2xs backdrop-blur-md sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsMobileOpen(true)}
              className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 md:hidden"
              aria-label="Open navigation sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={handleToggleCollapse}
              className="hidden rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 md:flex"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-bold uppercase tracking-wider text-slate-400">Student Records Portal</p>
              <h1 className="truncate text-sm font-bold tracking-tight text-slate-900">{pageTitle}</h1>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            <Link
              to="/"
              className="hidden items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 sm:inline-flex"
            >
              <Globe className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Public Site</span>
            </Link>
            <NotificationBell />
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7a132b] text-xs font-bold text-white shadow-2xs transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              aria-label="Open profile settings"
            >
              {profile?.full_name?.charAt(0) || 'S'}
            </button>
          </div>
        </header>

        <main className="min-w-0 pb-10">{children}</main>
      </div>

      <DatabaseSetupModal isOpen={isDbModalOpen} onClose={() => setIsDbModalOpen(false)} />
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </div>
  );
};
