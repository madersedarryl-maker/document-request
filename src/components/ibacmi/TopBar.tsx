import React from 'react';
import { Phone, Mail, MapPin, Clock, ExternalLink, ShieldCheck, Facebook } from 'lucide-react';
import { COLLEGE_INFO } from '../../data/ibacmiData';
import { Link } from 'react-router-dom';

export const TopBar: React.FC = () => {
  return (
    <div className="bg-[#4d0c19] text-amber-100/90 text-xs border-b border-[#691225] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between py-2 gap-2">
          {/* Contact Details & Location */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-5 gap-y-1 text-[11px] sm:text-xs">
            <a
              href="tel:0917-863-5683"
              className="flex items-center gap-1.5 hover:text-amber-300 transition-colors"
              title="Call IBACMI Admissions"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-medium tracking-wide">0917-863-5683</span>
            </a>

            <a
              href="mailto:ibacmiregistrar@gmail.com"
              className="flex items-center gap-1.5 hover:text-amber-300 transition-colors"
              title="Email Registrar"
            >
              <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="hidden sm:inline font-medium">ibacmiregistrar@gmail.com</span>
              <span className="sm:hidden font-medium">Email Registrar</span>
            </a>

            <div className="hidden lg:flex items-center gap-1.5 text-amber-200/80">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>TN Pepito St., Valencia City</span>
            </div>

            <div className="hidden xl:flex items-center gap-1.5 text-amber-200/80">
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Mon-Fri: 8AM-5PM | Sat: 8AM-12NN</span>
            </div>
          </div>

          {/* Quick Institutional Portal Shortcuts */}
          <div className="flex items-center gap-3 text-[11px] sm:text-xs">
            <div className="flex items-center gap-2">
              <Link
                to="/track"
                className="px-2.5 py-0.5 rounded-md bg-[#6d1326] text-amber-200 border border-[#8a1932] hover:bg-[#851831] hover:text-white transition-colors flex items-center gap-1 font-medium shadow-xs"
              >
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                <span>Track Request</span>
              </Link>

              <Link
                to="/login"
                className="px-2.5 py-0.5 rounded-md bg-amber-400 text-[#4d0c19] hover:bg-amber-300 font-bold transition-colors flex items-center gap-1 shadow-xs"
              >
                <span>Portal Login</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </Link>

              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-blue-400 transition-colors p-1"
                aria-label="Official IBACMI Facebook Page"
                title="Official Facebook Page"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
