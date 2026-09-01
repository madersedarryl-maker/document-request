import React from 'react';
import { OnlineServicesHub } from '../../components/ibacmi/OnlineServicesHub';
import { Link } from 'react-router-dom';
import {
  FileText,
  Search,
  LogIn,
  CheckCircle2,
  ShieldAlert,
  GraduationCap,
  Laptop,
  HelpCircle,
} from 'lucide-react';
import { COLLEGE_INFO } from '../../data/ibacmiData';

export const PortalServicesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-slate-900 text-white py-14 sm:py-18 relative overflow-hidden border-b border-slate-800">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative space-y-4 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-red-900/60 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Laptop className="w-3.5 h-3.5" />
            <span>Digital Services & Document Hub</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-serif tracking-tight text-white">
            Online Portals & Academic Records
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Access your student credentials, request official school documents, track registrar processing status, and log in to institutional systems.
          </p>
        </div>
      </div>

      {/* Online Services Grid Component */}
      <OnlineServicesHub />

      {/* Document Processing Guidelines & Fees */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider">
              <FileText className="w-3.5 h-3.5" />
              <span>Registrar Guidelines</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 font-serif">
              Official Document Processing Information
            </h2>
            <p className="text-xs text-slate-600">
              Standard processing turnaround and claiming protocols for requested credentials.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Transcript of Records (TOR)</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Standard processing time is 3 to 5 business days after clearance verification. Available for current students, transferees, and alumni.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Certificate of Good Moral Character</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Issued within 1 to 2 business days from the Office of Student Affairs & Guidance upon clearance of disciplinary records.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Honorable Dismissal / Transfer Credential</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Requires complete institutional clearance (Library, Property, Accounting, Dean). Processed within 3 business days.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Certificate of Enrollment (COE)</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Same-day or next-day release upon presentation of verified Certificate of Registration (COR).
              </p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-sm font-bold text-red-950">
                Ready to submit an official document request?
              </h4>
              <p className="text-xs text-red-800">
                Use our automated document request queue with digital payment verification.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/new-request"
                className="px-4 py-2 bg-red-900 hover:bg-red-950 text-white font-bold text-xs rounded-xl transition-colors"
              >
                Start Request
              </Link>
              <Link
                to="/track"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors"
              >
                Track Existing
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
