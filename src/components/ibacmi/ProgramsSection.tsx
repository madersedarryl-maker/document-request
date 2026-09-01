import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ACADEMIC_PROGRAMS, AcademicProgram } from '../../data/ibacmiData';
import { ProgramDetailModal } from './ProgramDetailModal';
import {
  GraduationCap,
  Clock,
  ArrowRight,
  Sparkles,
  BookOpen,
  FileText,
} from 'lucide-react';

interface ProgramsSectionProps {
  initialCategory?: 'all' | 'college' | 'shs' | 'basic';
  title?: string;
  subtitle?: string;
  limit?: number;
}

export const ProgramsSection: React.FC<ProgramsSectionProps> = ({
  initialCategory = 'all',
  title = 'Academic Programs & Offerings',
  subtitle = 'Discover degrees and educational pathways offered at IBA College of Mindanao.',
  limit,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'college' | 'shs' | 'basic'>(
    initialCategory
  );
  const [selectedProgram, setSelectedProgram] = useState<AcademicProgram | null>(null);

  const categories = [
    { id: 'all', label: 'All Programs' },
    { id: 'college', label: 'College Degrees' },
    { id: 'shs', label: 'Senior High (SHS)' },
    { id: 'basic', label: 'Basic Education' },
  ];

  const filteredPrograms = useMemo(() => {
    let list = ACADEMIC_PROGRAMS;
    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.category === selectedCategory);
    }
    if (limit) {
      list = list.slice(0, limit);
    }
    return list;
  }, [selectedCategory, limit]);

  return (
    <section className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-red-100/80 text-red-900 text-xs font-bold uppercase tracking-wider">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Academic Programs</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 font-serif tracking-tight">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200 shadow-xs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-red-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredPrograms.map((program) => (
            <div
              key={program.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col overflow-hidden group"
            >
              {/* Card Image */}
              <div className="relative h-48 overflow-hidden bg-slate-900">
                <img
                  src={program.image}
                  alt={program.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                
                {/* Badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-slate-950 shadow-md">
                    {program.code}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-[11px] font-medium text-amber-300 block">
                    {program.department}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>{program.duration}</span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-red-900 transition-colors leading-snug font-serif">
                    {program.name}
                  </h3>

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {program.description}
                  </p>
                </div>

                {/* Highlights tags */}
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <div className="space-y-1.5">
                    {program.highlights.slice(0, 2).map((h, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-700">
                        <Sparkles className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{h}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => setSelectedProgram(program)}
                      className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors text-center flex items-center justify-center gap-1"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-slate-600" />
                      <span>Curriculum</span>
                    </button>
                    <Link
                      to="/new-request"
                      className="w-full py-2 px-3 text-xs font-bold rounded-lg bg-red-900 hover:bg-red-950 text-white transition-colors flex items-center justify-center gap-1 group-hover:bg-red-800 shadow-xs"
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                      <span>Request TOR</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Program Detail Popup Modal */}
      {selectedProgram && (
        <ProgramDetailModal
          program={selectedProgram}
          onClose={() => setSelectedProgram(null)}
        />
      )}
    </section>
  );
};
