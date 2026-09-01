import React from 'react';
import { AboutSection } from '../../components/ibacmi/AboutSection';
import { FacilitiesSection } from '../../components/ibacmi/FacilitiesSection';
import { Compass, Award, History, Building2 } from 'lucide-react';
import { COLLEGE_INFO } from '../../data/ibacmiData';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-slate-900 text-white py-14 sm:py-18 relative overflow-hidden border-b border-slate-800">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative space-y-4 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-red-900/60 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>Institutional Profile</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-serif tracking-tight text-white">
            About IBA College of Mindanao
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Delivering innovative, balanced, and affordable education grounded in character, technological competence, and regional pride since 2005.
          </p>
        </div>
      </div>

      {/* History & Foundation Narrative */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider">
              <History className="w-3.5 h-3.5" />
              <span>Our Roots & Growth</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">
              The IBACMI Journey
            </h2>
          </div>

          <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed space-y-4">
            <p>
              IBA College of Mindanao, Inc. (IBACMI) was established to address the growing demand for top-tier technological, hospitality, and civic education in Central Mindanao. Situated strategically along TN Pepito Street in Valencia City, Bukidnon, the college has continually upgraded its curricula to align with the demands of the 21st-century global workforce.
            </p>
            <p>
              Under the visionary leadership of President Irene B. Antonio, IBACMI pioneered modern computer science programs, state-of-the-art mock hospitality suites, and board-licensure-ready criminology and teacher education degrees.
            </p>
            <p>
              Today, IBACMI proudly serves hundreds of students across basic education, senior high school strands, and undergraduate collegiate programs, retaining its core motto of providing <em>Innovative, Balanced, and Affordable Education</em>.
            </p>
          </div>
        </div>
      </section>

      {/* Vision, Mission & Core Values */}
      <AboutSection />

      {/* Campus Facilities */}
      <FacilitiesSection />
    </div>
  );
};
