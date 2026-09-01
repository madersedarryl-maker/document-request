import React, { useState } from 'react';
import { CAMPUS_FACILITIES, CampusFacility } from '../../data/ibacmiData';
import { Building2, Check, Sparkles, Monitor, Utensils, Shield, BookOpen, Layers } from 'lucide-react';

export const FacilitiesSection: React.FC = () => {
  const [activeFacility, setActiveFacility] = useState<CampusFacility>(CAMPUS_FACILITIES[0]);

  const categoryIcons: Record<string, React.ReactNode> = {
    Technology: <Monitor className="w-4 h-4" />,
    Hospitality: <Utensils className="w-4 h-4" />,
    Academic: <Shield className="w-4 h-4" />,
    'Student Life': <BookOpen className="w-4 h-4" />,
  };

  return (
    <section className="py-16 sm:py-20 bg-slate-100/70 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-red-100 text-red-900 text-xs font-bold uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5" />
            <span>Campus Infrastructure</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 font-serif tracking-tight">
            Modern Facilities for 21st-Century Competency
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            From high-speed computing labs to commercial culinary kitchens and criminology simulation centers, our campus is engineered for experiential training.
          </p>
        </div>

        {/* Interactive Facilities Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Facility Select List */}
          <div className="lg:col-span-5 space-y-3">
            {CAMPUS_FACILITIES.map((facility) => {
              const isSelected = activeFacility.id === facility.id;
              return (
                <button
                  key={facility.id}
                  onClick={() => setActiveFacility(facility)}
                  className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                    isSelected
                      ? 'bg-red-900 text-white border-red-900 shadow-lg scale-[1.02]'
                      : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                      isSelected
                        ? 'bg-red-950 text-amber-300'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {categoryIcons[facility.category] || <Layers className="w-4 h-4" />}
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                          isSelected ? 'text-amber-300' : 'text-slate-400'
                        }`}
                      >
                        {facility.category}
                      </span>
                    </div>
                    <h3
                      className={`text-sm sm:text-base font-bold font-serif leading-snug ${
                        isSelected ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {facility.title}
                    </h3>
                    <p
                      className={`text-xs line-clamp-2 ${
                        isSelected ? 'text-red-100' : 'text-slate-500'
                      }`}
                    >
                      {facility.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Facility Showcase Card */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
              <div className="relative h-64 sm:h-80 bg-slate-950 overflow-hidden">
                <img
                  src={activeFacility.image}
                  alt={activeFacility.title}
                  className="w-full h-full object-cover transition-all duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                
                <div className="absolute bottom-4 left-6 right-6 text-white">
                  <span className="px-2.5 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-bold uppercase tracking-wider inline-block mb-1">
                    {activeFacility.category}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black font-serif tracking-tight">
                    {activeFacility.title}
                  </h3>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-5">
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {activeFacility.description}
                </p>

                <div className="pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Facility Amenities & Equipment
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {activeFacility.features.map((feat, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs text-slate-800 p-2.5 rounded-lg bg-slate-50 border border-slate-100"
                      >
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="font-medium">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
