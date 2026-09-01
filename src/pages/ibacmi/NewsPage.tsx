import React from 'react';
import { NewsSection } from '../../components/ibacmi/NewsSection';
import { Newspaper } from 'lucide-react';

export const NewsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-slate-900 text-white py-14 sm:py-18 relative overflow-hidden border-b border-slate-800">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative space-y-4 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Newspaper className="w-3.5 h-3.5" />
            <span>Campus News & Updates</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-serif tracking-tight text-white">
            IBACMI News & Bulletin
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Latest stories, announcements, commencement highlights, and academic milestones from our faculty and student body.
          </p>
        </div>
      </div>

      <NewsSection
        title="All News Articles & Press Releases"
        subtitle="Read the full coverage of events taking place at IBA College of Mindanao."
        showViewAll={false}
      />
    </div>
  );
};
