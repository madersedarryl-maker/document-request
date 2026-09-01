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
    <div className="relative bg-gradient-to-b from-slate-950 via-[#150a10] to-slate-950 text-white overflow-hidden">
      {/* Dynamic Animated Background Aura & Glowing Grids */}
      <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#f59e0b_1.2px,transparent_1.2px)] [background-size:24px_24px] pointer-events-none" />
      
      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.15, 0.3, 0.15],
          x: [0, 30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-32 -right-32 w-[32rem] h-[32rem] bg-red-600/30 rounded-full blur-[100px] pointer-events-none"
      />

      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.25, 0.1],
          x: [0, -30, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
        className="absolute -bottom-32 -left-32 w-[32rem] h-[32rem] bg-amber-500/25 rounded-full blur-[100px] pointer-events-none"
      />

      {/* Floating Sparkle Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-amber-300 rounded-full shadow-[0_0_8px_#fde047]"
            style={{
              top: `${15 + i * 14}%`,
              left: `${10 + (i * 17) % 80}%`,
            }}
            animate={{
              y: [0, -25, 0],
              opacity: [0.2, 0.9, 0.2],
              scale: [0.8, 1.5, 0.8],
            }}
            transition={{
              duration: 3 + i * 0.8,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Main Hero Copy */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="lg:col-span-7 space-y-6 text-center lg:text-left"
          >
            {/* Accreditation Badge */}
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-950/80 border border-amber-400/40 text-amber-300 text-xs font-semibold backdrop-blur-md shadow-lg shadow-red-950/50">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Official Online Registrar & Document Services</span>
              </div>
            </motion.div>

            {/* Main Title with Shimmer Glow */}
            <motion.h1
              variants={itemVariants}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-5.5xl font-black font-serif tracking-tight text-white leading-[1.12]"
            >
              Online Student Records &{' '}
              <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-200">
                Document Request System
                <motion.span
                  className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-amber-400/0 via-amber-400 to-amber-400/0 rounded-full"
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{ duration: 0.9, delay: 0.5, ease: 'easeOut' }}
                />
              </span>
            </motion.h1>

            {/* Mission Statement */}
            <motion.p
              variants={itemVariants}
              className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal"
            >
              Welcome to the official digital portal of{' '}
              <span className="font-bold text-white border-b border-amber-400/40 pb-0.5">{COLLEGE_INFO.name}</span> in Valencia City. Conveniently request official Transcripts of Records, Certifications, and Clearances with real-time status tracking.
            </motion.p>

            {/* Quick Search for Programs with Animated Focus Ring */}
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
                  className="w-full pl-11 pr-28 py-3.5 bg-slate-900/80 hover:bg-slate-900/95 focus:bg-slate-900 text-white placeholder-slate-400 rounded-xl border border-slate-700/80 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/40 text-xs sm:text-sm backdrop-blur-md transition-all shadow-inner"
                />
                <Search className="w-4 h-4 text-amber-400 absolute left-4 pointer-events-none transition-transform group-focus-within:scale-110" />
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  className="absolute right-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-bold rounded-lg text-xs transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Explore
                </motion.button>
              </div>
            </motion.form>

            {/* Action Buttons with Dynamic Interactive Micro-Animations */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2"
            >
              <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}>
                <Link
                  to="/new-request"
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-slate-950" />
                  <span>Request Document Now</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}>
                <Link
                  to="/track"
                  className="px-5 py-3.5 rounded-xl bg-red-950/90 hover:bg-red-900/90 text-red-100 border border-red-700/60 font-semibold text-xs sm:text-sm backdrop-blur-md shadow-lg shadow-red-950/40 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Track Request Status</span>
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.96 }}>
                <Link
                  to="/programs"
                  className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-xs sm:text-sm backdrop-blur-md flex items-center gap-2 transition-all cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-amber-300" />
                  <span>Academic Programs</span>
                </Link>
              </motion.div>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              variants={itemVariants}
              className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs text-slate-400"
            >
              <div className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Secure Registrar Verification</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>QR-Code Trackable Documents</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Official Digital & Campus Claim</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Visual Card / Interactive Holographic Highlight */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative mx-auto max-w-md lg:max-w-none"
            >
              {/* Outer Glow frame with animated rotation */}
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 via-red-600 to-amber-400 rounded-3xl blur-md opacity-40 group-hover:opacity-100 transition duration-1000 animate-pulse" />

              <div className="relative bg-slate-900/95 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl space-y-4">
                {/* Live Real-time Status Card Pill */}
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                      Registrar Queue: Active
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Real-time DB Sync</span>
                </div>

                {/* Main Hero Photo Container with Floating Overlay */}
                <div className="relative rounded-xl overflow-hidden aspect-[4/3] group">
                  <img
                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80"
                    alt="IBA College of Mindanao Graduates and Campus Life"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
                  
                  {/* Floating Tag */}
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-slate-900/90 backdrop-blur-md p-2.5 rounded-lg border border-slate-700/80 shadow-xl"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-md">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white leading-tight">Registrar Records System</p>
                        <p className="text-[10px] text-amber-400">Fast & Verified Credentials Processing</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-red-950 text-red-200 border border-red-800/60 px-2 py-0.5 rounded font-mono font-medium">
                      Valencia City
                    </span>
                  </motion.div>
                </div>

                {/* Quick Academic Portal Shortcuts Card */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      to="/new-request"
                      className="p-3 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/70 hover:border-amber-400/50 transition-all group block shadow-md"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded bg-red-900/80 text-red-200 flex items-center justify-center">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">Request Records</span>
                      </div>
                      <p className="text-[11px] text-slate-400">TOR, COE, Good Moral, Clearances</p>
                    </Link>
                  </motion.div>

                  <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      to="/track"
                      className="p-3 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/70 hover:border-amber-400/50 transition-all group block shadow-md"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded bg-amber-900/80 text-amber-300 flex items-center justify-center">
                          <Clock className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">Live Tracking</span>
                      </div>
                      <p className="text-[11px] text-slate-400">Real-time registrar workflow status</p>
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
