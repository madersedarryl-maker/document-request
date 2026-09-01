import React from 'react';
import { Link } from 'react-router-dom';
import { AcademicProgram } from '../../data/ibacmiData';
import {
  X,
  Clock,
  Building,
  CheckCircle2,
  Briefcase,
  BookOpen,
  FileCheck,
  Sparkles,
  ArrowRight,
  FileText,
} from 'lucide-react';

interface ProgramDetailModalProps {
  program: AcademicProgram | null;
  onClose: () => void;
}

export const ProgramDetailModal: React.FC<ProgramDetailModalProps> = ({
  program,
  onClose,
}) => {
  if (!program) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden border border-slate-200 my-8">
        {/* Header with image banner */}
        <div className="relative h-48 sm:h-56 bg-slate-900 overflow-hidden">
          <img
            src={program.image}
            alt={program.name}
            className="w-full h-full object-cover opacity-40"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/70 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title and metadata */}
          <div className="absolute bottom-4 left-6 right-6">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-slate-950 mb-2">
              {program.badge}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white font-serif tracking-tight">
              {program.name} ({program.code})
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-1">
              <span className="flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-amber-400" />
                {program.department}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                {program.duration}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[65vh] overflow-y-auto">
          {/* Overview */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Program Overview
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              {program.description}
            </p>
          </div>

          {/* Key Program Highlights */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Program Highlights & Training Features</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {program.highlights.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-red-50/60 border border-red-100 flex items-start gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-800 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Curriculum Focus Areas */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-red-700" />
              <span>Curriculum Focus & Core Subjects</span>
            </h3>
            <ul className="space-y-1.5">
              {program.curriculumHighlights.map((curr, idx) => (
                <li key={idx} className="text-xs text-slate-700 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  <span>{curr}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Career Opportunities */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
              <span>Career Trajectories & Job Roles</span>
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {program.careerOpportunities.map((career, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-medium border border-slate-200"
                >
                  {career}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors"
          >
            Close Window
          </button>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Link
              to="/new-request"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-red-900 hover:bg-red-950 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Request Credentials / TOR</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
