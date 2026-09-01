import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProgramsSection } from '../../components/ibacmi/ProgramsSection';
import { GraduationCap } from 'lucide-react';

export const ProgramsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = (searchParams.get('category') as any) || 'all';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page Header */}
      <div className="bg-slate-900 text-white py-14 sm:py-18 relative overflow-hidden border-b border-slate-800">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative space-y-4 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-red-900/60 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Academic Offerings</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-serif tracking-tight text-white">
            Academic Programs & Strands
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            IBA College of Mindanao provides comprehensive education from Basic Education and Senior High School to industry-leading four-year College degrees.
          </p>
        </div>
      </div>

      {/* Main Programs Component */}
      <ProgramsSection
        initialCategory={categoryParam}
        title="Explore All Academic Degrees & Strands"
        subtitle="Select a program below to review the curriculum structure, core subjects, and career trajectories."
      />
    </div>
  );
};
