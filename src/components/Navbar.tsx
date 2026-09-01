import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { NotificationBell } from './NotificationBell';
import { DatabaseSetupModal } from './DatabaseSetupModal';
import { ProfileModal } from './ProfileModal';
import { TopBar } from './ibacmi/TopBar';
import { IbacmiLogo } from './ibacmi/IbacmiLogo';
import {
  LayoutDashboard,
  Inbox,
  FileText,
  Users,
  BarChart3,
  Settings,
  ShieldCheck,
  LogOut,
  User,
  Database,
  Menu,
  X,
  GraduationCap,
  Briefcase,
  ShieldAlert,
  ArrowLeftRight,
  ChevronDown,
  Globe,
  PlusCircle,
  Clock,
  ExternalLink,
  Shield,
  HelpCircle,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, profile, role, signOut, switchDemoAccount, dbConnected } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isDbModalOpen, setIsDbModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [programsDropdownOpen, setProgramsDropdownOpen] = useState(false);

  const roleSwitcherRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        roleSwitcherRef.current &&
        !roleSwitcherRef.current.contains(event.target as Node)
      ) {
        setShowRoleSwitcher(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isPortalView =
    location.pathname.startsWith('/dashboard') ||
    location.pathname.startsWith('/my-requests') ||
    location.pathname.startsWith('/new-request') ||
    location.pathname.startsWith('/staff') ||
    location.pathname.startsWith('/admin') ||
    (location.pathname.startsWith('/request/') && !location.pathname.startsWith('/track'));

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    setShowUserMenu(false);
    await signOut();
    navigate('/login');
  };

  const handleSwitchRole = async (targetRole: 'STUDENT' | 'STAFF' | 'ADMIN') => {
    setShowRoleSwitcher(false);
    await switchDemoAccount(targetRole);
    navigate('/dashboard');
  };

  const publicNavLinks = [
    { name: 'Home', path: '/' },
    {
      name: 'Programs',
      path: '/programs',
      hasDropdown: true,
      subItems: [
        { label: 'All Academic Offerings', path: '/programs' },
        { label: 'College Degrees (BSIT, BSHM, BSCrim, BEEd)', path: '/programs?category=college' },
        { label: 'Senior High School (STEM, ABM, TVL)', path: '/programs?category=shs' },
        { label: 'Basic Education (Pre-School & JHS)', path: '/programs?category=basic' },
      ],
    },
    { name: 'Document Services', path: '/services' },
    { name: 'Track Request', path: '/track' },
    { name: 'About IBACMI', path: '/about' },
    { name: 'News & Events', path: '/news' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <>
      {/* Top Institutional Contact Bar (Rendered on public website views only) */}
      {!isPortalView && <TopBar />}

      {/* Main Enterprise Application Header (approx 68-74px height) */}
      <header
        id="app-main-header"
        className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-2xs"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[70px]">
            {/* Left: School Logo & Institutional Identity */}
            <div className="flex items-center space-x-6 shrink-0">
              <Link
                to={user ? '/dashboard' : '/'}
                className="flex items-center group transition-opacity hover:opacity-90"
              >
                <IbacmiLogo size="sm" textColor="dark" />
              </Link>
            </div>

            {/* Center: Desktop Navigation */}
            {!isPortalView ? (
              /* Public Institutional Website Navigation */
              <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5">
                {publicNavLinks.map((item) => {
                  if (item.hasDropdown) {
                    return (
                      <div
                        key={item.name}
                        className="relative group"
                        onMouseEnter={() => setProgramsDropdownOpen(true)}
                        onMouseLeave={() => setProgramsDropdownOpen(false)}
                      >
                        <Link
                          to={item.path}
                          className={`px-3 py-2 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors ${
                            location.pathname.startsWith('/programs')
                              ? 'text-blue-700 bg-blue-50 font-bold'
                              : 'text-slate-700 hover:text-slate-950 hover:bg-slate-50'
                          }`}
                        >
                          <span>{item.name}</span>
                          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-180 transition-transform duration-200" />
                        </Link>

                        {/* Dropdown Menu */}
                        <div
                          className={`absolute top-full left-0 w-72 bg-white rounded-xl shadow-lg border border-slate-200 py-2 transition-all duration-200 origin-top-left z-50 ${
                            programsDropdownOpen
                              ? 'opacity-100 scale-100 pointer-events-auto visible'
                              : 'opacity-0 scale-95 pointer-events-none invisible'
                          }`}
                        >
                          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                            Academic Offerings
                          </div>
                          {item.subItems?.map((sub) => (
                            <Link
                              key={sub.label}
                              to={sub.path}
                              onClick={() => setProgramsDropdownOpen(false)}
                              className="block px-3 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                            >
                              {sub.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                        location.pathname === item.path
                          ? 'text-blue-700 bg-blue-50 font-bold'
                          : 'text-slate-700 hover:text-slate-950 hover:bg-slate-50'
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            ) : (
              /* Enterprise Administration & Student Navigation */
              <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5">
                {/* 1. Dashboard */}
                <Link
                  to="/dashboard"
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    isActive('/dashboard')
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                {/* 2. Requests */}
                {role === 'STUDENT' ? (
                  <>
                    <Link
                      to="/my-requests"
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                        isActive('/my-requests')
                          ? 'bg-blue-50 text-blue-700 font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Inbox className="w-4 h-4" />
                      <span>My Requests</span>
                    </Link>
                    <Link
                      to="/new-request"
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                        isActive('/new-request')
                          ? 'bg-blue-50 text-blue-700 font-semibold'
                          : 'text-blue-700 hover:bg-blue-50'
                      }`}
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>New Request</span>
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/staff/queue"
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                      isActive('/staff/queue')
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Inbox className="w-4 h-4" />
                    <span>Requests Queue</span>
                  </Link>
                )}

                {/* 3. Documents (Catalog / Doc Types) */}
                {role === 'ADMIN' ? (
                  <Link
                    to="/admin/documents"
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                      isActive('/admin/documents')
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Documents</span>
                  </Link>
                ) : (
                  <Link
                    to="/services"
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Document Catalog</span>
                  </Link>
                )}

                {/* 4. Students / Users */}
                {role === 'ADMIN' && (
                  <Link
                    to="/admin/users"
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                      isActive('/admin/users')
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Users & Students</span>
                  </Link>
                )}

                {/* 5. Reports */}
                {role === 'ADMIN' && (
                  <Link
                    to="/admin/reports"
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                      isActive('/admin/reports')
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Reports</span>
                  </Link>
                )}

                {/* 6. Settings */}
                {role === 'ADMIN' && (
                  <Link
                    to="/admin/settings"
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                      isActive('/admin/settings') || isActive('/admin/audit')
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                )}
              </nav>
            )}

            {/* Right: Actions, Notifications & User Menu */}
            <div className="flex items-center space-x-2.5 sm:space-x-3">
              {!user ? (
                /* Public Visitor Actions */
                <div className="flex items-center space-x-2">
                  <Link
                    to="/track"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors"
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Track Status</span>
                  </Link>

                  <Link
                    to="/new-request"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-medium text-xs shadow-2xs transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>New Request</span>
                  </Link>

                  <Link
                    to="/login"
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-800 hover:bg-slate-100 text-xs font-medium transition-colors"
                  >
                    <span>Log in</span>
                  </Link>
                </div>
              ) : (
                /* Authenticated User Controls */
                <div className="flex items-center space-x-2">
                  {/* Demo Role Switcher Dropdown */}
                  <div className="relative" ref={roleSwitcherRef}>
                    <button
                      onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50/80 hover:bg-slate-100 text-xs font-medium text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Switch Demo Persona"
                    >
                      {role === 'ADMIN' && <ShieldAlert className="w-3.5 h-3.5 text-indigo-600" />}
                      {role === 'STAFF' && <Briefcase className="w-3.5 h-3.5 text-blue-600" />}
                      {role === 'STUDENT' && <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />}
                      <span className="hidden sm:inline font-mono font-bold text-[11px] text-slate-800">
                        {role || 'ROLE'}
                      </span>
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </button>

                    {showRoleSwitcher && (
                      <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
                        <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                          Switch Role Context
                        </div>
                        <button
                          onClick={() => handleSwitchRole('ADMIN')}
                          className={`w-full px-3 py-2 text-left text-xs font-medium flex items-center justify-between hover:bg-slate-50 transition-colors ${
                            role === 'ADMIN' ? 'text-indigo-700 bg-indigo-50/50 font-semibold' : 'text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-indigo-600" />
                            <span>System Administrator</span>
                          </div>
                          {role === 'ADMIN' && <span className="text-[10px] text-indigo-600 font-bold">Active</span>}
                        </button>
                        <button
                          onClick={() => handleSwitchRole('STAFF')}
                          className={`w-full px-3 py-2 text-left text-xs font-medium flex items-center justify-between hover:bg-slate-50 transition-colors ${
                            role === 'STAFF' ? 'text-blue-700 bg-blue-50/50 font-semibold' : 'text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4 text-blue-600" />
                            <span>Registrar Staff</span>
                          </div>
                          {role === 'STAFF' && <span className="text-[10px] text-blue-600 font-bold">Active</span>}
                        </button>
                        <button
                          onClick={() => handleSwitchRole('STUDENT')}
                          className={`w-full px-3 py-2 text-left text-xs font-medium flex items-center justify-between hover:bg-slate-50 transition-colors ${
                            role === 'STUDENT' ? 'text-emerald-700 bg-emerald-50/50 font-semibold' : 'text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-emerald-600" />
                            <span>Student Portal</span>
                          </div>
                          {role === 'STUDENT' && <span className="text-[10px] text-emerald-600 font-bold">Active</span>}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Notification Center */}
                  <NotificationBell />

                  {/* Clean Admin / User Profile Menu */}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="p-1 rounded-lg hover:bg-slate-100 text-slate-700 flex items-center gap-2 transition-colors cursor-pointer"
                      title="User Menu"
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-semibold flex items-center justify-center text-xs shadow-2xs">
                        {profile?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase() || 'A'}
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                    </button>

                    {showUserMenu && (
                      <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                        {/* Profile Info Header */}
                        <div className="px-4 py-2.5 border-b border-slate-100">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {profile?.full_name || 'Arthur Vance'}
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono truncate">
                            {user.email}
                          </p>
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                              {role || 'USER'}
                            </span>
                            {dbConnected && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded text-emerald-700 bg-emerald-50 border border-emerald-200 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                DB Connected
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Menu Links */}
                        <div className="py-1">
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              setIsProfileModalOpen(true);
                            }}
                            className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                          >
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>My Profile & Security</span>
                          </button>

                          {role === 'ADMIN' && (
                            <>
                              <Link
                                to="/admin/settings"
                                onClick={() => setShowUserMenu(false)}
                                className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                              >
                                <Settings className="w-3.5 h-3.5 text-slate-400" />
                                <span>System Settings</span>
                              </Link>
                              <Link
                                to="/admin/audit"
                                onClick={() => setShowUserMenu(false)}
                                className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                              >
                                <Shield className="w-3.5 h-3.5 text-slate-400" />
                                <span>Security & Audit Logs</span>
                              </Link>
                            </>
                          )}

                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              setIsDbModalOpen(true);
                            }}
                            className="w-full px-4 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                          >
                            <Database className="w-3.5 h-3.5 text-slate-400" />
                            <span>Database Setup & Health</span>
                          </button>
                        </div>

                        <div className="pt-1 border-t border-slate-100">
                          <Link
                            to="/"
                            onClick={() => setShowUserMenu(false)}
                            className="w-full px-4 py-2 text-left text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2.5"
                          >
                            <Globe className="w-3.5 h-3.5 text-slate-400" />
                            <span>Visit Public Website</span>
                          </Link>

                          <button
                            onClick={handleSignOut}
                            className="w-full px-4 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 cursor-pointer"
                          >
                            <LogOut className="w-3.5 h-3.5 text-rose-500" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Mobile Hamburger Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Toggle Navigation Menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-lg">
            {isPortalView ? (
              <div className="space-y-1">
                <Link
                  to="/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-xs font-semibold text-slate-900 hover:bg-slate-50"
                >
                  Dashboard
                </Link>
                {role === 'STUDENT' ? (
                  <>
                    <Link
                      to="/my-requests"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      My Requests
                    </Link>
                    <Link
                      to="/new-request"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg text-xs font-semibold text-blue-700 hover:bg-blue-50"
                    >
                      New Request
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/staff/queue"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Request Queue
                  </Link>
                )}

                {role === 'ADMIN' && (
                  <>
                    <Link
                      to="/admin/documents"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Documents
                    </Link>
                    <Link
                      to="/admin/users"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Users & Students
                    </Link>
                    <Link
                      to="/admin/reports"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Reports
                    </Link>
                    <Link
                      to="/admin/settings"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Settings
                    </Link>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                {publicNavLinks.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-lg text-xs font-semibold ${
                      location.pathname === item.path
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 grid grid-cols-2 gap-2">
              <Link
                to="/new-request"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 text-center text-xs font-semibold rounded-lg bg-blue-700 text-white flex items-center justify-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>New Request</span>
              </Link>
              <Link
                to="/track"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2 text-center text-xs font-semibold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1"
              >
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Track Status</span>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Modals */}
      <DatabaseSetupModal isOpen={isDbModalOpen} onClose={() => setIsDbModalOpen(false)} />
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </>
  );
};
