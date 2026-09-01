import React, { useState } from 'react';
import { COLLEGE_INFO } from '../../data/ibacmiData';
import {
  PhoneCall,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  Building,
  HelpCircle,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react';

export const ContactSection: React.FC = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'Admissions & Enrollment',
    message: '',
  });

  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider">
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Connect with IBACMI</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 font-serif tracking-tight">
            Visit Our Valencia City Campus or Reach Out Today
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Have questions regarding admissions, course prerequisites, tuition scholarships, or student credentials? Our administrative team is ready to assist you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Contact Details & Campus Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="space-y-1">
                <h3 className="text-lg sm:text-xl font-bold font-serif text-white">
                  Institutional Directory
                </h3>
                <p className="text-xs text-slate-400">
                  {COLLEGE_INFO.name}
                </p>
              </div>

              <div className="space-y-4 text-xs text-slate-300">
                {/* Address */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">Campus Location</span>
                    <span>{COLLEGE_INFO.address}</span>
                  </div>
                </div>

                {/* Telephone */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">Mobile & Landline Hotlines</span>
                    <a href={`tel:${COLLEGE_INFO.contactNumber}`} className="hover:text-amber-300 block">
                      {COLLEGE_INFO.contactNumber} (Admissions Hotline)
                    </a>
                    <span className="text-slate-400 text-[11px] block">{COLLEGE_INFO.alternateNumber} (Registrar Office)</span>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">Electronic Inquiries</span>
                    <a href={`mailto:${COLLEGE_INFO.email}`} className="hover:text-amber-300 block">
                      {COLLEGE_INFO.email}
                    </a>
                    <a href={`mailto:${COLLEGE_INFO.registrarEmail}`} className="text-slate-400 hover:text-amber-300 text-[11px] block">
                      {COLLEGE_INFO.registrarEmail}
                    </a>
                  </div>
                </div>

                {/* Operating Hours */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">Administrative Office Hours</span>
                    <span>{COLLEGE_INFO.operatingHours.weekdays}</span>
                    <span className="block text-slate-400 text-[11px]">{COLLEGE_INFO.operatingHours.saturday}</span>
                  </div>
                </div>
              </div>

              {/* Map Banner Mock */}
              <div className="pt-4 border-t border-slate-800">
                <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/60 text-[11px] text-slate-300 flex items-center justify-between">
                  <span>📍 Landmark: Near Valencia City Plaza</span>
                  <span className="text-amber-400 font-bold">Bukidnon</span>
                </div>
              </div>
            </div>
          </div>

          {/* Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              {sent ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold font-serif text-slate-900">
                    Message Sent Successfully!
                  </h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    Thank you for reaching out to IBA College of Mindanao. Our admissions officer or registrar will contact you via email/phone shortly.
                  </p>
                  <button
                    onClick={() => {
                      setSent(false);
                      setForm({
                        name: '',
                        email: '',
                        phone: '',
                        department: 'Admissions & Enrollment',
                        message: '',
                      });
                    }}
                    className="px-5 py-2.5 rounded-xl bg-red-900 text-white text-xs font-bold hover:bg-red-950 transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold font-serif text-slate-900">
                      Send an Online Inquiry
                    </h3>
                    <p className="text-xs text-slate-500">
                      Fill out the form below and we will respond during office hours.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Juan Dela Cruz"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-red-900 bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        Contact Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="0917-000-0000"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-red-900 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="juan@example.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-red-900 bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        Department / Concern *
                      </label>
                      <select
                        value={form.department}
                        onChange={(e) => setForm({ ...form, department: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-red-900 bg-white"
                      >
                        <option value="Admissions & Enrollment">Admissions & Enrollment</option>
                        <option value="Registrar & Transcript of Records">Registrar & Transcript of Records</option>
                        <option value="Scholarships & Senior High Vouchers">Scholarships & Senior High Vouchers</option>
                        <option value="Accounting & Tuition Fees">Accounting & Tuition Fees</option>
                        <option value="Other Inquiries">Other Inquiries</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      Message / Inquiries *
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Write your inquiry or question regarding admissions, enrollment schedules, or document requests..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-red-900 bg-white"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-red-900 hover:bg-red-950 active:bg-slate-950 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Inquiry</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
