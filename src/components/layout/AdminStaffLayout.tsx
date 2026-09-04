import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AdminStaffSidebar } from './AdminStaffSidebar';
import { NotificationBell } from '../NotificationBell';
import { DatabaseSetupModal } from '../DatabaseSetupModal';
import { ProfileModal } from '../ProfileModal';
import {
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Globe,
  Briefcase,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface AdminStaffLayoutProps {
  children: React.ReactNode;
}

export const AdminStaffLayout: React.FC<AdminStaffLayoutProps> = ({ children }) => {
  const { role, profile, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('ibacmi_sidebar_collapsed') === 'true';
  });
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);
  const [isDbModalOpen, setIsDbModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('ibacmi_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Determine page title & breadcrumbs dynamically
  const getPageContext = () => {
    const path = location.pathname;
    if (path === '/dashboard') {
      return {
        title: 'Dashboard Overview',
        category: role === 'ADMIN' ? 'Administration' : 'Registrar Operations',
        badge: 'Realtime KPIs',
      };
    }
    if (path.startsWith('/staff/queue')) {
      return {
        title: 'Requests Processing Queue',
        category: 'Registrar Operations',
        badge: 'Live Queue',
      };
    }
    if (path.startsWith('/staff/request/')) {
      return {
        title: 'Request Evaluation & Clearance',
        category: 'Registrar Operations',
        badge: 'Active Review',
      };
    }
    if (path.startsWith('/admin/documents')) {
      return {
        title: 'Document Types & Fee Matrix',
        category: 'Administration',
        badge: 'Catalog Governance',
      };
    }
    if (path.startsWith('/admin/users')) {
      return {
        title: 'Users & Student Rosters',
        category: 'Administration',
        badge: 'Account Management',
      };
    }
    if (path.startsWith('/admin/reports')) {
      return {
        title: 'Analytics & Executive Reports',
        category: 'Administration',
        badge: 'BI & Metrics',
      };
    }
    if (path.startsWith('/admin/audit')) {
      return {
        title: 'System Security Audit Logs',
        category: 'Administration',
        badge: 'Security Trail',
      };
    }
    if (path.startsWith('/admin/settings')) {
      return {
        title: 'Institutional System Settings',
        category: 'Administration',
        badge: 'Office Configuration',
      };
    }
    if (path.startsWith('/services')) {
      return {
        title: 'Document Services Catalog',
        category: 'Academic Records',
        badge: 'Public Catalog',
      };
    }
    if (path.startsWith('/track')) {
      return {
        title: 'Document Verification & Tracking',
        category: 'Academic Records',
        badge: 'Verification Tool',
      };
    }
    return {
      title: 'Registrar Management Center',
      category: 'IBACMI Portal',
      badge: 'Portal',
    };
  };

  const context = getPageContext();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* 1. Dedicated Admin & Staff Sidebar */}
      <AdminStaffSidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        onOpenDbModal={() => setIsDbModalOpen(true)}
      />

      {/* 2. Main Content Workspace Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isCollapsed ? 'md:pl-[72px]' : 'md:pl-64'
        }`}
      >
        {/* Top Workspace Header Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/90 h-16 flex items-center justify-between px-4 sm:px-6 shadow-2xs">
          {/* Left: Mobile Toggle & Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Open navigation sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Desktop Quick Collapse Button */}
            <button
              onClick={handleToggleCollapse}
              className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title={isCollapsed ? 'Expand sidebar (Ctrl+\\)' : 'Collapse sidebar'}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>

            {/* Dynamic Breadcrumbs & Section Title */}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                <span className="hidden sm:inline font-mono">IBACMI</span>
                <ChevronRight className="w-3 h-3 hidden sm:inline" />
                <span className="truncate">{context.category}</span>
                <span className="hidden lg:inline-block text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 font-semibold">
                  {context.badge}
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight truncate leading-tight">
                {context.title}
              </h1>
            </div>
          </div>

          {/* Right: Notification Bell, Campus Tag & Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
            {/* Campus Tag */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200/70 text-[11px] font-semibold text-amber-800">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span>Valencia City Campus • Registrar</span>
            </div>

            {/* Role Context Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
              {role === 'ADMIN' ? (
                <>
                  <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="font-mono text-[11px] text-indigo-900 font-bold">ADMIN</span>
                </>
              ) : (
                <>
                  <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                  <span className="font-mono text-[11px] text-blue-900 font-bold">STAFF</span>
                </>
              )}
            </div>

            {/* Notifications */}
            <NotificationBell />

            {/* Visit Public Site */}
            <Link
              to="/"
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-medium text-slate-600 transition-colors"
              title="View Public Institutional Website"
            >
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden md:inline">Public Site</span>
            </Link>

            {/* User Avatar */}
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="w-8 h-8 rounded-lg bg-[#7a132b] text-white font-bold flex items-center justify-center text-xs shadow-2xs hover:opacity-90 transition-opacity"
              title="Edit Profile"
              aria-label="Edit Profile"
            >
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'A'}
            </button>
          </div>
        </header>

        {/* Workspace Children Content */}
        <main className="flex-1 min-w-0 pb-12">
          {children}
        </main>
      </div>

      {/* Modals */}
      <DatabaseSetupModal isOpen={isDbModalOpen} onClose={() => setIsDbModalOpen(false)} />
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </div>
  );
};
