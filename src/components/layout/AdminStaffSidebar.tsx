import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { requestService } from '../../services/requestService';
import officialLogoImg from '../../assets/images/ibacmi-logo.png';
import {
  LayoutDashboard,
  Inbox,
  FileCheck,
  FileText,
  Users,
  BarChart3,
  ShieldAlert,
  Settings,
  BookOpen,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  LogOut,
  Database,
  Globe,
  Briefcase,
  GraduationCap,
  ChevronDown,
  UserCog,
  Sparkles,
  Layers,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

interface AdminStaffSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenProfileModal: () => void;
  onOpenDbModal: () => void;
}

export const AdminStaffSidebar: React.FC<AdminStaffSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  onOpenProfileModal,
  onOpenDbModal,
}) => {
  const { user, profile, staffProfile, role, signOut, switchDemoAccount, dbConnected } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [pendingCount, setPendingCount] = useState<number>(0);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const roleMenuRef = useRef<HTMLDivElement>(null);

  // Fetch pending requests count for badge
  useEffect(() => {
    let isMounted = true;
    const loadQueueCount = async () => {
      try {
        const all = await requestService.getAllRequests();
        if (isMounted) {
          const count = all.filter(
            (r) =>
              r.status === 'SUBMITTED' ||
              r.status === 'UNDER_REVIEW' ||
              r.status === 'PROCESSING' ||
              r.status === 'READY_FOR_RELEASE'
          ).length;
          setPendingCount(count);
        }
      } catch (err) {
        console.error('Error fetching queue count for sidebar:', err);
      }
    };

    loadQueueCount();
    const interval = setInterval(loadQueueCount, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [location.pathname]);

  // Close role menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target as Node)) {
        setShowRoleMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleSwitch = async (targetRole: 'STUDENT' | 'STAFF' | 'ADMIN') => {
    setShowRoleMenu(false);
    await switchDemoAccount(targetRole);
    navigate('/dashboard');
    onCloseMobile();
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  const isStaffRequestDetail = location.pathname.startsWith('/staff/request/');

  const navItemClass = (active: boolean) =>
    `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
      active
        ? 'bg-[#7a132b] text-white shadow-xs font-bold'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/90'
    } ${isCollapsed ? 'justify-center px-2' : ''}`;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 select-none">
      {/* 1. Header: School Brand & Identity */}
      <div className="h-16 flex items-center justify-between px-3.5 border-b border-slate-200/80 shrink-0">
        <Link
          to="/dashboard"
          onClick={onCloseMobile}
          className="flex items-center gap-2.5 min-w-0 group"
          title="IBA College of Mindanao"
        >
          <div className="w-10 h-10 rounded-lg p-0.5 bg-white border border-slate-200 shadow-2xs shrink-0 flex items-center justify-center overflow-hidden">
            <img
              src={officialLogoImg}
              alt="IBACMI Crest"
              className="w-full h-full object-contain group-hover:scale-105 transition-transform"
              referrerPolicy="no-referrer"
            />
          </div>
          {!isCollapsed && (
            <div className="min-w-0 flex flex-col justify-center">
              <span className="text-xs font-black tracking-tight text-slate-900 truncate font-serif uppercase">
                IBACMI Portal
              </span>
              <span className="text-[10px] font-semibold text-amber-700 truncate">
                {role === 'ADMIN' ? 'System Administration' : 'Registrar Operations'}
              </span>
            </div>
          )}
        </Link>

        {/* Collapse toggle button on Desktop */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Navigation Items (Scrollable) */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
        {/* SECTION 1: OPERATIONS */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Operational Desk</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            </div>
          )}

          {/* Dashboard */}
          <Link
            to="/dashboard"
            onClick={onCloseMobile}
            className={navItemClass(isActive('/dashboard'))}
            title={isCollapsed ? 'Dashboard' : undefined}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span className="truncate">Dashboard</span>}
            {isCollapsed && (
              <span className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-[11px] font-medium rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 shadow-md">
                Dashboard
              </span>
            )}
          </Link>

          {/* Requests Queue */}
          <Link
            to="/staff/queue"
            onClick={onCloseMobile}
            className={navItemClass(isActive('/staff/queue'))}
            title={isCollapsed ? `Requests Queue (${pendingCount} active)` : undefined}
          >
            <Inbox className="w-4 h-4 shrink-0" />
            {!isCollapsed && (
              <div className="flex-1 flex items-center justify-between min-w-0">
                <span className="truncate">Requests Queue</span>
                {pendingCount > 0 && (
                  <span
                    className={`ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive('/staff/queue')
                        ? 'bg-white text-[#7a132b]'
                        : 'bg-[#7a132b] text-white'
                    }`}
                  >
                    {pendingCount}
                  </span>
                )}
              </div>
            )}
            {isCollapsed && (
              <>
                {pendingCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#7a132b]" />
                )}
                <span className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-[11px] font-medium rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 shadow-md">
                  Requests Queue ({pendingCount})
                </span>
              </>
            )}
          </Link>

          {/* Contextual Active Review (If on request detail) */}
          {isStaffRequestDetail && (
            <div
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 ${
                isCollapsed ? 'justify-center px-2' : ''
              }`}
            >
              <FileCheck className="w-4 h-4 shrink-0 text-blue-600" />
              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold leading-tight">Review Workspace</p>
                  <p className="text-[10px] text-blue-600 font-normal">Active Evaluation</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* SECTION 2: ACADEMIC & CATALOG */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Academic & Catalog
            </div>
          )}

          {/* Document Catalog */}
          <Link
            to="/services"
            onClick={onCloseMobile}
            className={navItemClass(isActive('/services'))}
            title={isCollapsed ? 'Document Catalog' : undefined}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span className="truncate">Document Catalog</span>}
            {isCollapsed && (
              <span className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-[11px] font-medium rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 shadow-md">
                Document Catalog
              </span>
            )}
          </Link>

          {/* Public Track Status */}
          <Link
            to="/track"
            onClick={onCloseMobile}
            className={navItemClass(isActive('/track'))}
            title={isCollapsed ? 'Track Request' : undefined}
          >
            <Search className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span className="truncate">Track Request</span>}
            {isCollapsed && (
              <span className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-[11px] font-medium rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 shadow-md">
                Track Request
              </span>
            )}
          </Link>
        </div>

        {/* SECTION 3: ADMINISTRATION & GOVERNANCE (ADMIN ONLY) */}
        {role === 'ADMIN' && (
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700 flex items-center justify-between">
                <span>System Administration</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  ADMIN
                </span>
              </div>
            )}

            {/* Document Types & Fees */}
            <Link
              to="/admin/documents"
              onClick={onCloseMobile}
              className={navItemClass(isActive('/admin/documents'))}
              title={isCollapsed ? 'Document Types & Fees' : undefined}
            >
              <FileText className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span className="truncate">Documents & Fees</span>}
              {isCollapsed && (
                <span className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-[11px] font-medium rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 shadow-md">
                  Documents & Fees
                </span>
              )}
            </Link>

            {/* Users & Students */}
            <Link
              to="/admin/users"
              onClick={onCloseMobile}
              className={navItemClass(isActive('/admin/users'))}
              title={isCollapsed ? 'Users & Students' : undefined}
            >
              <Users className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span className="truncate">Users & Students</span>}
              {isCollapsed && (
                <span className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-[11px] font-medium rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 shadow-md">
                  Users & Students
                </span>
              )}
            </Link>

            {/* Reports & Analytics */}
            <Link
              to="/admin/reports"
              onClick={onCloseMobile}
              className={navItemClass(isActive('/admin/reports'))}
              title={isCollapsed ? 'Reports & Analytics' : undefined}
            >
              <BarChart3 className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span className="truncate">Reports & Analytics</span>}
              {isCollapsed && (
                <span className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-[11px] font-medium rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 shadow-md">
                  Reports & Analytics
                </span>
              )}
            </Link>

            {/* Audit Logs */}
            <Link
              to="/admin/audit"
              onClick={onCloseMobile}
              className={navItemClass(isActive('/admin/audit'))}
              title={isCollapsed ? 'Audit Trail Logs' : undefined}
            >
              <ShieldAlert className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span className="truncate">Audit Trail Logs</span>}
              {isCollapsed && (
                <span className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-[11px] font-medium rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 shadow-md">
                  Audit Trail Logs
                </span>
              )}
            </Link>

            {/* System Settings */}
            <Link
              to="/admin/settings"
              onClick={onCloseMobile}
              className={navItemClass(isActive('/admin/settings'))}
              title={isCollapsed ? 'System Settings' : undefined}
            >
              <Settings className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span className="truncate">System Settings</span>}
              {isCollapsed && (
                <span className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-[11px] font-medium rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 shadow-md">
                  System Settings
                </span>
              )}
            </Link>
          </div>
        )}
      </div>

      {/* 3. Bottom Footer: Switcher, Profile & Logout */}
      <div className="p-3 border-t border-slate-200 space-y-2 bg-slate-50/70 shrink-0">
        {/* Quick Persona Switcher */}
        <div className="relative" ref={roleMenuRef}>
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className={`w-full flex items-center justify-between p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer shadow-2xs ${
              isCollapsed ? 'justify-center p-1.5' : ''
            }`}
            title="Switch Demo Role Persona"
          >
            <div className="flex items-center gap-2 min-w-0">
              {role === 'ADMIN' ? (
                <ShieldAlert className="w-4 h-4 text-indigo-600 shrink-0" />
              ) : role === 'STAFF' ? (
                <Briefcase className="w-4 h-4 text-blue-600 shrink-0" />
              ) : (
                <GraduationCap className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              {!isCollapsed && (
                <span className="truncate text-slate-800 text-[11px] font-mono font-bold">
                  {role === 'ADMIN' ? 'Admin View' : 'Staff View'}
                </span>
              )}
            </div>
            {!isCollapsed && <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
          </button>

          {showRoleMenu && (
            <div
              className={`absolute bottom-full mb-2 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 ${
                isCollapsed ? 'left-0 w-52' : 'left-0 right-0'
              }`}
            >
              <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                Switch Role Persona
              </div>
              <button
                onClick={() => handleRoleSwitch('ADMIN')}
                className={`w-full px-3 py-2 text-left text-xs font-medium flex items-center justify-between hover:bg-slate-50 transition-colors ${
                  role === 'ADMIN' ? 'text-indigo-700 bg-indigo-50/50 font-bold' : 'text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />
                  <span>System Admin</span>
                </div>
                {role === 'ADMIN' && <span className="text-[10px] text-indigo-600 font-bold">Active</span>}
              </button>
              <button
                onClick={() => handleRoleSwitch('STAFF')}
                className={`w-full px-3 py-2 text-left text-xs font-medium flex items-center justify-between hover:bg-slate-50 transition-colors ${
                  role === 'STAFF' ? 'text-blue-700 bg-blue-50/50 font-bold' : 'text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                  <span>Registrar Staff</span>
                </div>
                {role === 'STAFF' && <span className="text-[10px] text-blue-600 font-bold">Active</span>}
              </button>
              <button
                onClick={() => handleRoleSwitch('STUDENT')}
                className={`w-full px-3 py-2 text-left text-xs font-medium flex items-center justify-between hover:bg-slate-50 transition-colors ${
                  role === 'STUDENT' ? 'text-emerald-700 bg-emerald-50/50 font-bold' : 'text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Student Portal</span>
                </div>
                {role === 'STUDENT' && <span className="text-[10px] text-emerald-600 font-bold">Active</span>}
              </button>
            </div>
          )}
        </div>

        {/* User Card */}
        <div
          className={`flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/90 shadow-2xs ${
            isCollapsed ? 'flex-col gap-2 p-1.5' : ''
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate leading-tight">
                  {profile?.full_name || 'Staff User'}
                </p>
                <p className="text-[10px] text-slate-400 truncate font-mono">
                  {user?.email || 'staff@ibacmi.edu.ph'}
                </p>
              </div>
            )}
          </div>

          <div className={`flex items-center gap-1 shrink-0 ${isCollapsed ? 'flex-col' : ''}`}>
            <button
              onClick={onOpenProfileModal}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Profile Settings"
              aria-label="Profile Settings"
            >
              <UserCog className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenDbModal}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Database Health"
              aria-label="Database Health"
            >
              <Database className="w-4 h-4" />
            </button>

            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Visit Public Site link */}
        {!isCollapsed && (
          <Link
            to="/"
            className="flex items-center justify-center gap-1.5 py-1 text-[11px] font-medium text-slate-500 hover:text-blue-700 transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Visit Public Website</span>
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block fixed top-0 left-0 bottom-0 z-40 transition-all duration-300 ${
          isCollapsed ? 'w-[72px]' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Overlay) */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer content */}
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
