import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { IbacmiLogo } from './IbacmiLogo';
import {
  Menu,
  X,
  GraduationCap,
  FileText,
  UserCheck,
  BookOpen,
  Building2,
  PhoneCall,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

interface HeaderNavProps {
  onOpenAdmissionModal?: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ onOpenAdmissionModal }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [programsDropdownOpen, setProgramsDropdownOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    {
      name: 'Programs',
      path: '/programs',
      hasDropdown: true,
      subItems: [
        { label: 'All Academic Offerings', path: '/programs' },
        { label: 'College Degrees (BSIT, BSHM, BSCrim, BEEd, etc.)', path: '/programs?category=college' },
        { label: 'Senior High School (STEM, ABM, TVL)', path: '/programs?category=shs' },
        { label: 'Basic Education (Pre-School & JHS)', path: '/programs?category=basic' },
      ],
    },
    { name: 'Admissions', path: '/admissions' },
    { name: 'About IBACMI', path: '/about' },
    { name: 'Online Services', path: '/services' },
    { name: 'News & Events', path: '/news' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Brand */}
          <Link
            to="/"
            className="flex items-center group transition-transform active:scale-95"
            onClick={() => setMobileMenuOpen(false)}
          >
            <IbacmiLogo size="md" textColor="dark" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((item) => {
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
                      className={`px-3 py-2 text-sm font-semibold rounded-lg flex items-center gap-1 transition-colors ${
                        isActive(item.path)
                          ? 'text-blue-900 bg-blue-50 font-bold'
                          : 'text-slate-700 hover:text-blue-900 hover:bg-slate-50'
                      }`}
                    >
                      <span>{item.name}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:rotate-180 transition-transform duration-200" />
                    </Link>

                    {/* Dropdown Menu */}
                    <div
                      className={`absolute top-full left-0 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 transition-all duration-200 origin-top-left ${
                        programsDropdownOpen
                          ? 'opacity-100 scale-100 pointer-events-auto visible'
                          : 'opacity-0 scale-95 pointer-events-none invisible'
                      }`}
                    >
                      <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                        Academic Offerings
                      </div>
                      {item.subItems?.map((sub) => (
                        <Link
                          key={sub.label}
                          to={sub.path}
                          onClick={() => setProgramsDropdownOpen(false)}
                          className="block px-3 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-900 transition-colors"
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
                  className={`px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'text-blue-900 bg-blue-50 font-bold'
                      : 'text-slate-700 hover:text-blue-900 hover:bg-slate-50'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-2.5">
            <Link
              to="/new-request"
              className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-blue-700" />
              <span>Request Records</span>
            </Link>

            <button
              onClick={onOpenAdmissionModal}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 shadow-sm transition-all flex items-center gap-1.5 transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-900" />
              <span>Enroll / Apply</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-2xl animate-in slide-in-from-top duration-200">
          <div className="space-y-1">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-900 font-bold'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200 grid grid-cols-2 gap-2">
            <Link
              to="/new-request"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-2.5 text-center text-xs font-bold rounded-lg border border-slate-300 text-slate-800 bg-slate-50 flex items-center justify-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-blue-700" />
              <span>Request TOR</span>
            </Link>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenAdmissionModal) onOpenAdmissionModal();
              }}
              className="w-full py-2.5 text-center text-xs font-bold rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Apply Online</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
