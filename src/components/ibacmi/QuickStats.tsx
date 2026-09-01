import React from 'react';
import { motion } from 'motion/react';
import { QUICK_STATS } from '../../data/ibacmiData';
import { Award, BookOpen, GraduationCap, ShieldCheck } from 'lucide-react';

export const QuickStats: React.FC = () => {
  const icons = [
    <BookOpen className="w-5 h-5 text-amber-500" key="prog" />,
    <GraduationCap className="w-5 h-5 text-blue-600" key="emp" />,
    <Award className="w-5 h-5 text-amber-500" key="yrs" />,
    <ShieldCheck className="w-5 h-5 text-emerald-600" key="vouch" />,
  ];

  return (
    <div className="relative z-10 -mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-50px' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="bg-white rounded-2xl border border-slate-200/80 shadow-xl p-6 sm:p-8 backdrop-blur-md"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {QUICK_STATS.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -3 }}
              className={`flex flex-col items-center sm:items-start text-center sm:text-left group cursor-default ${
                idx > 0 ? 'sm:pl-6 lg:pl-8 pt-4 sm:pt-0' : ''
              }`}
            >
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 mb-3 shadow-xs group-hover:scale-110 group-hover:bg-blue-50/50 transition-all duration-300">
                {icons[idx]}
              </div>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-serif group-hover:text-blue-900 transition-colors">
                {stat.value}
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">
                {stat.label}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5">
                {stat.subtext}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
