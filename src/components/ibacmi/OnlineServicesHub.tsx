import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  FileText,
  Search,
  LogIn,
  GraduationCap,
  ArrowRight,
  ExternalLink,
  Laptop,
  BookOpen,
} from 'lucide-react';

export const OnlineServicesHub: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <section className="py-16 sm:py-20 bg-slate-950 text-white relative overflow-hidden border-b border-slate-800">
      {/* Glow shapes */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto space-y-3"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider border border-amber-500/30 shadow-md">
            <Laptop className="w-3.5 h-3.5" />
            <span>Digital Campus Services</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-serif tracking-tight">
            Institutional Portals & Online Document System
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Convenient, fast, and secure access to academic records, transcript requests, real-time application tracking, and student information systems.
          </p>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* Card 1: Online Document Request */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ duration: 0.25 }}
            className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 hover:border-amber-400/60 transition-colors flex flex-col justify-between group shadow-xl hover:shadow-amber-500/10"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-red-600/30 transition-all duration-300 shadow-md">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors font-serif">
                  Document Request
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Request Official Transcript of Records (TOR), Honorable Dismissal, Good Moral Certificate, and CAV online.
                </p>
              </div>
            </div>

            <div className="pt-6">
              <Link
                to="/new-request"
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-98"
              >
                <span>Request Document</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>

          {/* Card 2: Public Status Tracker */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ duration: 0.25 }}
            className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 hover:border-amber-400/60 transition-colors flex flex-col justify-between group shadow-xl hover:shadow-amber-500/10"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-500/30 transition-all duration-300 shadow-md">
                <Search className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors font-serif">
                  Track Request Status
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Real-time status tracking for pending transcript requests and registrar document validations using your Request Number.
                </p>
              </div>
            </div>

            <div className="pt-6">
              <Link
                to="/track"
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-98"
              >
                <span>Track My Request</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>

          {/* Card 3: College Student Portal */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ duration: 0.25 }}
            className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 hover:border-emerald-400/60 transition-colors flex flex-col justify-between group shadow-xl hover:shadow-emerald-500/10"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-500/30 transition-all duration-300 shadow-md">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors font-serif">
                  Student Portal
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Check semester grades, subject enrollment schedules, billing ledgers, and academic clearances.
                </p>
              </div>
            </div>

            <div className="pt-6">
              <Link
                to="/login"
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-98 border border-slate-700"
              >
                <span>Student Login</span>
                <LogIn className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>

          {/* Card 4: Faculty & Staff Portal */}
          <motion.div
            variants={cardVariants}
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ duration: 0.25 }}
            className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 hover:border-purple-400/60 transition-colors flex flex-col justify-between group shadow-xl hover:shadow-purple-500/10"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-500/30 transition-all duration-300 shadow-md">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors font-serif">
                  iTeach Faculty Portal
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Faculty grade submission, class masterlists, syllabus uploads, and registrar queue management.
                </p>
              </div>
            </div>

            <div className="pt-6">
              <Link
                to="/login"
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-98 border border-slate-700"
              >
                <span>Staff & Faculty Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
