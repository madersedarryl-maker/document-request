import React from 'react';
import { COLLEGE_INFO, CORE_VALUES } from '../../data/ibacmiData';
import {
  Compass,
  Target,
  Sparkles,
  Award,
  ShieldCheck,
  CheckCircle,
  Quote,
  GraduationCap,
} from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-red-100 text-red-900 text-xs font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>About IBA College of Mindanao</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 font-serif tracking-tight">
            A Legacy of Excellence in 21st-Century Learning
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Founded with the vision to make quality technological and higher education accessible to the youth of Valencia City, Bukidnon, and the broader Mindanao region.
          </p>
        </div>

        {/* Vision & Mission Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Vision */}
          <div className="bg-gradient-to-br from-red-950 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black font-serif text-white">
                Our Institutional Vision
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                To be Mindanao’s leading academic and technological training institution, producing competent, socially responsible, and values-centered 21st-century graduates ready to thrive in the competitive international job market.
              </p>
            </div>
            <div className="pt-6 border-t border-slate-800 text-[11px] font-mono text-amber-400/90 uppercase tracking-wider">
              • Global Competitiveness • Modern Innovation
            </div>
          </div>

          {/* Mission */}
          <div className="bg-gradient-to-br from-amber-950/90 to-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="space-y-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black font-serif text-white">
                Our Institutional Mission
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                To deliver accessible, relevant, and quality education through innovative instructional methods, state-of-the-art facilities, continuous faculty development, and community-driven industry partnerships.
              </p>
            </div>
            <div className="pt-6 border-t border-slate-800 text-[11px] font-mono text-amber-400/90 uppercase tracking-wider">
              • Quality Instruction • Inclusive Development
            </div>
          </div>
        </div>

        {/* President's Message */}
        <div className="bg-slate-50 rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-4 text-center lg:text-left space-y-3">
              <div className="relative inline-block rounded-2xl overflow-hidden shadow-lg border-4 border-white aspect-[4/5] w-48 sm:w-56 mx-auto lg:mx-0 bg-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80"
                  alt="Irene B. Antonio, College President"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900 font-serif">
                  Irene B. Antonio
                </h4>
                <p className="text-xs text-amber-700 font-bold">
                  President & Founder, IBACMI
                </p>
                <p className="text-[11px] text-slate-500">
                  IBA College of Mindanao, Inc.
                </p>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-4">
              <Quote className="w-10 h-10 text-red-200" />
              <h3 className="text-lg sm:text-xl font-black text-slate-900 font-serif leading-snug">
                "We believe education is the greatest equalizer. Every student who walks through our doors is prepared not just for a diploma, but for a purposeful life of impact."
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                At IBA College of Mindanao, we have remained true to our founding principle: to provide affordable, top-caliber higher education and senior high training without compromising standards. As Valencia City continues to grow as an economic hub in Bukidnon, our graduates stand at the forefront of technological innovation, hospitality leadership, and civic responsibility.
              </p>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                We invite you to be part of our vibrant academic family where your aspirations are nurtured with care, discipline, and modern facilities.
              </p>
            </div>
          </div>
        </div>

        {/* Core Values Breakdown */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              The IBACMI Identity
            </h3>
            <p className="text-xl sm:text-2xl font-black text-slate-900 font-serif">
              Core Institutional Values
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {CORE_VALUES.map((val) => (
              <div
                key={val.word}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-red-900/30 transition-all flex flex-col justify-between space-y-3 text-center sm:text-left"
              >
                <div className="w-12 h-12 rounded-xl bg-red-900 text-amber-400 font-serif font-black text-xl flex items-center justify-center mx-auto sm:mx-0 shadow-xs">
                  {val.letter}
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900">
                    {val.word}
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    {val.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
