import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
  BookOpen,
  Search,
  CheckCircle2,
  FileText,
  Clock,
  Zap,
  Activity,
} from 'lucide-react';
import { COLLEGE_INFO } from '../../data/ibacmiData';
import officialLogoImg from '../../assets/images/ibacmi-logo.png';

export const HeroBanner: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/programs?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/programs');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
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
    <div className="relative bg-white text-slate-900 overflow-hidden border-b border-slate-200">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 sm:pt-14 sm:pb-20 lg:pt-16 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Main Hero Copy */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 space-y-6 text-center lg:text-left"
          >
            {/* Accreditation Badge */}
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200/90 text-[#7a132b] text-xs font-semibold shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Sparkles className="w-3.5 h-3.5 text-[#7a132b]" />
                <span>Official Online Registrar & Document Services</span>
              </div>
            </motion.div>

            {/* Main Title */}
            <motion.h1
              variants={itemVariants}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-5.5xl font-black font-serif tracking-tight text-slate-900 leading-[1.14]"
            >
              Online Student Records &{' '}
              <span className="text-[#7a132b] inline-block">
                Document Request System
              </span>
            </motion.h1>

            {/* Mission Statement */}
            <motion.p
              variants={itemVariants}
              className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal"
            >
              Welcome to the official digital portal of{' '}
              <span className="font-bold text-slate-900 border-b border-rose-300 pb-0.5">{COLLEGE_INFO.name}</span> in Valencia City. Conveniently request official Transcripts of Records, Certifications, and Clearances with real-time status tracking.
            </motion.p>

            {/* Quick Search for Programs with Clean White Input */}
            <motion.form
              variants={itemVariants}
              onSubmit={handleSearch}
              className="max-w-xl mx-auto lg:mx-0"
            >
              <div className="relative flex items-center group">
                <input
                  type="text"
                  placeholder="Search academic programs (e.g. BSIT, BSHM, Criminology)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-28 py-3.5 bg-white text-slate-900 placeholder-slate-400 rounded-xl border border-slate-300 focus:border-[#7a132b] focus:outline-none focus:ring-2 focus:ring-[#7a132b]/20 text-xs sm:text-sm transition-all shadow-xs"
                />
                <Search className="w-4 h-4 text-slate-400 group-focus-within:text-[#7a132b] absolute left-4 pointer-events-none transition-colors" />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="absolute right-1.5 px-4 py-2 bg-[#7a132b] hover:bg-[#661023] text-white font-bold rounded-lg text-xs transition-all shadow-xs cursor-pointer"
                >
                  Explore
                </motion.button>
              </div>
            </motion.form>

            {/* Action Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-1"
            >
              <motion.div whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/new-request"
                  className="px-6 py-3 rounded-xl bg-[#7a132b] hover:bg-[#661023] text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-950/15 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-white" />
                  <span>Request Document Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/track"
                  className="px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-semibold text-xs sm:text-sm shadow-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-[#7a132b]" />
                  <span>Track Request Status</span>
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/programs"
                  className="px-5 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-slate-600" />
                  <span>Academic Programs</span>
                </Link>
              </motion.div>
            </motion.div>

            {/* Quick Statistics in Hero Section */}
            <motion.div
              variants={itemVariants}
              className="pt-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-2xl"
            >
              <div className="bg-slate-50/90 border border-slate-200 rounded-xl p-3 text-left shadow-2xs">
                <p className="text-xl sm:text-2xl font-black font-mono text-[#7a132b] leading-none">3,500+</p>
                <p className="text-[11px] font-semibold text-slate-600 mt-1 flex items-center gap-1">
                  <span className="text-emerald-600 font-bold">✓</span> Active Students
                </p>
              </div>

              <div className="bg-slate-50/90 border border-slate-200 rounded-xl p-3 text-left shadow-2xs">
                <p className="text-xl sm:text-2xl font-black font-mono text-[#7a132b] leading-none">25,000+</p>
                <p className="text-[11px] font-semibold text-slate-600 mt-1 flex items-center gap-1">
                  <span className="text-emerald-600 font-bold">✓</span> Processed Docs
                </p>
              </div>

              <div className="bg-slate-50/90 border border-slate-200 rounded-xl p-3 text-left shadow-2xs">
                <p className="text-xl sm:text-2xl font-black font-mono text-[#7a132b] leading-none">24–48 hrs</p>
                <p className="text-[11px] font-semibold text-slate-600 mt-1 flex items-center gap-1">
                  <span className="text-emerald-600 font-bold">✓</span> Avg Turnaround
                </p>
              </div>

              <div className="bg-slate-50/90 border border-slate-200 rounded-xl p-3 text-left shadow-2xs">
                <p className="text-xl sm:text-2xl font-black font-mono text-[#7a132b] leading-none">99%</p>
                <p className="text-[11px] font-semibold text-slate-600 mt-1 flex items-center gap-1">
                  <span className="text-emerald-600 font-bold">✓</span> Success Rate
                </p>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Visual Card */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="relative mx-auto max-w-md lg:max-w-none"
            >
              <div className="relative bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
                {/* Live Real-time Status Card Pill */}
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span className="text-[11px] font-mono font-bold text-emerald-800 uppercase tracking-wider">
                      Registrar Queue: Active
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Real-time DB Sync</span>
                </div>

                {/* Main Hero Photo Container */}
                <div className="relative rounded-xl overflow-hidden aspect-[4/3] group shadow-inner border border-slate-200">
                  <img
                    src="https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80"
                    alt="IBA College of Mindanao Academic Hall and Registrar Building"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
                  
                  {/* Floating Tag */}
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-white/95 backdrop-blur-md p-2.5 rounded-lg border border-slate-200 shadow-lg"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-white p-0.5 border border-slate-200 flex items-center justify-center shadow-xs shrink-0">
                        <img
                          src={officialLogoImg}
                          alt="IBA College of Mindanao Official Seal"
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 leading-tight">IBA College of Mindanao</p>
                        <p className="text-[10px] text-[#7a132b] font-medium">Office of the College Registrar</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-rose-50 text-[#7a132b] border border-rose-200 px-2 py-0.5 rounded font-mono font-semibold">
                      Valencia City
                    </span>
                  </motion.div>
                </div>

                {/* Quick Academic Portal Shortcuts Card */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      to="/new-request"
                      className="p-3 rounded-xl bg-slate-50 hover:bg-rose-50/50 border border-slate-200 hover:border-rose-200 transition-all group block shadow-2xs"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded bg-rose-100 text-[#7a132b] flex items-center justify-center">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-slate-900 group-hover:text-[#7a132b] transition-colors">Request Records</span>
                      </div>
                      <p className="text-[11px] text-slate-500">TOR, COE, Good Moral, Clearances</p>
                    </Link>
                  </motion.div>

                  <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      to="/track"
                      className="p-3 rounded-xl bg-slate-50 hover:bg-rose-50/50 border border-slate-200 hover:border-rose-200 transition-all group block shadow-2xs"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded bg-slate-200 text-slate-700 flex items-center justify-center">
                          <Clock className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-slate-900 group-hover:text-[#7a132b] transition-colors">Live Tracking</span>
                      </div>
                      <p className="text-[11px] text-slate-500">Real-time registrar workflow status</p>
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};
