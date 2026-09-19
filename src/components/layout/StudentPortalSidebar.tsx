import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { IbacmiLogo } from '../ibacmi/IbacmiLogo';
import {
  LayoutDashboard,
  Inbox,
  PlusCircle,
  FileText,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  UserCog,
  Database,
  LogOut,
  Globe,
  X,
} from 'lucide-react';

interface StudentPortalSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenProfileModal: () => void;
  onOpenDbModal: () => void;
}

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'My Requests', path: '/my-requests', icon: Inbox },
  { label: 'New Request', path: '/new-request', icon: PlusCircle },
  { label: 'Document Catalog', path: '/services', icon: FileText },
  { label: 'Track Request', path: '/track', icon: Search },
];

export const StudentPortalSidebar: React.FC<StudentPortalSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  onOpenProfileModal,
  onOpenDbModal,
}) => {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navItemClass = (active: boolean) =>
    `group relative flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
      active
        ? 'bg-[#7a132b] text-white shadow-xs'
        : 'text-slate-600 hover:bg-slate-100/90 hover:text-slate-900'
    } ${isCollapsed ? 'justify-center px-2' : ''}`;

  const sidebarContent = (
    <div className="flex h-full flex-col bg-white text-slate-900">
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 px-3.5">
        <Link
          to="/dashboard"
          onClick={onCloseMobile}
          className="flex min-w-0 items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          title="Student Records Portal"
        >
          <IbacmiLogo size="sm" showText={!isCollapsed} textColor="dark" />
        </Link>

        <button
          type="button"
          onClick={onToggleCollapse}
          className="hidden rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 md:flex"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>

        <button
          type="button"
          onClick={onCloseMobile}
          className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 md:hidden"
          aria-label="Close navigation sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-5">
        {!isCollapsed && (
          <div className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Student Portal
          </div>
        )}

        <nav aria-label="Student portal navigation" className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={navItemClass(active)}
                aria-current={active ? 'page' : undefined}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
                {isCollapsed && (
                  <span className="pointer-events-none absolute left-full z-50 ml-2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[11px] font-medium text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="shrink-0 space-y-2 border-t border-slate-200 bg-slate-50/70 p-3">
        <div className={`flex items-center gap-2.5 rounded-xl border border-slate-200/90 bg-white p-2 shadow-2xs ${isCollapsed ? 'flex-col' : ''}`}>
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'S'}
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="truncate text-xs font-bold leading-tight text-slate-900">
                  {profile?.full_name || 'Student'}
                </p>
                <p className="truncate font-mono text-[10px] text-slate-400">
                  {user?.email || 'student@ibacmi.edu.ph'}
                </p>
              </div>
            )}
          </div>

          <div className={`flex shrink-0 items-center gap-1 ${isCollapsed ? 'flex-col' : ''}`}>
            <button
              type="button"
              onClick={onOpenProfileModal}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              title="Profile settings"
              aria-label="Profile settings"
            >
              <UserCog className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onOpenDbModal}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              title="Database health"
              aria-label="Database health"
            >
              <Database className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-lg p-1.5 text-rose-400 transition-colors hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {!isCollapsed && (
          <Link
            to="/"
            onClick={onCloseMobile}
            className="flex items-center justify-center gap-1.5 rounded-lg py-1 text-[11px] font-medium text-slate-500 transition-colors hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <Globe className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Visit Public Website</span>
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={`fixed bottom-0 left-0 top-0 z-40 hidden transition-[width] duration-300 md:block ${
          isCollapsed ? 'w-[72px]' : 'w-64'
        }`}
        aria-label="Student portal sidebar"
      >
        {sidebarContent}
      </aside>

      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <button
            type="button"
            className="fixed inset-0 cursor-default bg-slate-950/60 backdrop-blur-[1px]"
            onClick={onCloseMobile}
            aria-label="Close navigation sidebar"
          />
          <aside className="relative z-10 w-[min(86vw,20rem)] shadow-2xl" aria-label="Student portal sidebar">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
