import React from 'react';
import { Link } from 'react-router-dom';
import { COLLEGE_INFO } from '../../data/ibacmiData';
import { IbacmiLogo } from './IbacmiLogo';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Facebook,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Award,
  Heart,
  FileText,
} from 'lucide-react';

export const IbacmiFooter: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs">
      {/* Upper Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Col 1: Brand & College Info (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="inline-block">
              <IbacmiLogo size="md" textColor="light" />
            </Link>

            <p className="text-xs leading-relaxed text-slate-400">
              {COLLEGE_INFO.name} is a premier educational institution in Valencia City, Bukidnon, committed to holistic Christian values, dynamic academic rigor, cutting-edge technology, and global student readiness.
            </p>

            {/* Quick Accreditation Badges */}
            <div className="pt-2 flex flex-wrap gap-2">
              <span className="px-2.5 py-1 rounded bg-red-950/80 text-red-300 border border-red-800/60 text-[10px] font-semibold">
                CHED Recognized
              </span>
              <span className="px-2.5 py-1 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60 text-[10px] font-semibold">
                DepEd SHS ESC/Voucher
              </span>
              <span className="px-2.5 py-1 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 text-[10px] font-semibold">
                TESDA Assessment Center
              </span>
            </div>

            {/* Social media link */}
            <div className="pt-2">
              <a
                href={COLLEGE_INFO.facebook}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors text-xs font-semibold"
              >
                <Facebook className="w-3.5 h-3.5" />
                <span>Follow our Official Facebook Page</span>
                <ExternalLink className="w-3 h-3 ml-0.5" />
              </a>
            </div>
          </div>

          {/* Col 2: Academic Programs (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-serif">
              Academic Degrees & Offerings
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/programs?category=college" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-amber-500" />
                  <span>BS in Information Technology (BSIT)</span>
                </Link>
              </li>
              <li>
                <Link to="/programs?category=college" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-amber-500" />
                  <span>BS in Hospitality Management (BSHM)</span>
                </Link>
              </li>
              <li>
                <Link to="/programs?category=college" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-amber-500" />
                  <span>BS in Criminology (BSCrim)</span>
                </Link>
              </li>
              <li>
                <Link to="/programs?category=college" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-amber-500" />
                  <span>Bachelor of Elementary Education (BEEd)</span>
                </Link>
              </li>
              <li>
                <Link to="/programs?category=shs" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-amber-500" />
                  <span>Senior High School (STEM, ABM, TVL)</span>
                </Link>
              </li>
              <li>
                <Link to="/programs?category=basic" className="hover:text-amber-300 transition-colors flex items-center gap-1.5">
                  <ChevronRight className="w-3 h-3 text-amber-500" />
                  <span>Basic Education & Junior High School</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Student & Online Portals (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-serif">
              Portals & Services
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/services" className="hover:text-amber-300 transition-colors">
                  Document Services Hub
                </Link>
              </li>
              <li>
                <Link to="/new-request" className="hover:text-amber-300 transition-colors">
                  Request Records (TOR/COE)
                </Link>
              </li>
              <li>
                <Link to="/track" className="hover:text-amber-300 transition-colors">
                  Track Document Status
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-amber-300 transition-colors">
                  Student Portal Login
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-amber-300 transition-colors">
                  Registrar Staff Portal
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-amber-300 transition-colors">
                  Vision & Mission
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Campus Contact (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider font-serif">
              Campus & Registrar Office
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{COLLEGE_INFO.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`tel:${COLLEGE_INFO.contactNumber}`} className="hover:text-white transition-colors">
                  {COLLEGE_INFO.contactNumber}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`mailto:${COLLEGE_INFO.email}`} className="hover:text-white transition-colors truncate">
                  {COLLEGE_INFO.email}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Monday – Friday: 8:00 AM – 5:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sub-footer */}
      <div className="bg-slate-900/90 py-5 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
          <div>
            © {new Date().getFullYear()} {COLLEGE_INFO.name}. All Rights Reserved.
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/about" className="hover:text-slate-300 transition-colors">
              Institutional Profile
            </Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-slate-300 transition-colors">
              Helpdesk & Registrar
            </Link>
            <span>•</span>
            <Link to="/track" className="hover:text-slate-300 transition-colors">
              Track Request
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
