import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Tag,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { motion } from 'motion/react';

interface RankedDocument {
  rank: number;
  id: string;
  code: string;
  name: string;
  category: string;
  requestVolume: string;
  percentage: number;
  fee: number;
  processingDays: string;
  description: string;
  requirements: string[];
  isTopRequested?: boolean;
}

const MOST_REQUESTED_DOCS: RankedDocument[] = [
  {
    rank: 1,
    id: 'doc-type-002',
    code: 'TOR',
    name: 'Official Transcript of Records (TOR)',
    category: 'Academic Record',
    requestVolume: '8,450+ issued',
    percentage: 95,
    fee: 150.0,
    processingDays: '3–5 days',
    description: 'Complete official academic record with seal, credit units, GPA, and registrar certification.',
    requirements: ['University Clearance Form', '2x2 ID Photo in Formal Attire', 'Valid Student ID Copy'],
    isTopRequested: true,
  },
  {
    rank: 2,
    id: 'doc-type-003',
    code: 'COG',
    name: 'Certificate of Grades (COG)',
    category: 'Certifications',
    requestVolume: '5,200+ issued',
    percentage: 82,
    fee: 50.0,
    processingDays: '1–2 days',
    description: 'Term-by-term summary of grades for scholarships, job applications, or company evaluations.',
    requirements: ['Valid Student ID / Reg Card', 'Previous Semester Grade Slip (optional)'],
  },
  {
    rank: 3,
    id: 'doc-type-001',
    code: 'COE',
    name: 'Certificate of Enrollment (COE)',
    category: 'Certifications',
    requestVolume: '4,120+ issued',
    percentage: 74,
    fee: 50.0,
    processingDays: '1–2 days',
    description: 'Official proof certifying currently enrolled semester, academic load, and student standing.',
    requirements: ['Current Semester Registration Assessment Form (RAF)', 'Student ID Card'],
  },
  {
    rank: 4,
    id: 'doc-type-hd',
    code: 'HDTC',
    name: 'Honorable Dismissal & Transfer Credentials',
    category: 'Clearance & Exit',
    requestVolume: '2,890+ issued',
    percentage: 58,
    fee: 200.0,
    processingDays: '3–5 days',
    description: 'Official transfer document released upon completing institutional and department exit clearance.',
    requirements: ['Complete Exit Clearance Slip', 'Formal Letter of Request for Transfer', 'Valid ID'],
  },
  {
    rank: 5,
    id: 'doc-type-004',
    code: 'GMC',
    name: 'Certificate of Good Moral Character',
    category: 'Student Affairs',
    requestVolume: '2,340+ issued',
    percentage: 49,
    fee: 75.0,
    processingDays: '2–3 days',
    description: 'Certification issued with Office of Student Affairs validating exemplary student disciplinary record.',
    requirements: ['OSA Discipline Clearance Slip', 'Proof of Enrollment or Graduation'],
  },
  {
    rank: 6,
    id: 'doc-type-005',
    code: 'CTC',
    name: 'Certified True Copy / CAV Authentication',
    category: 'Authentication',
    requestVolume: '1,420+ issued',
    percentage: 36,
    fee: 40.0,
    processingDays: '1–2 days',
    description: 'Dry-seal embossed certification verifying authentic copies of original diploma or transcript.',
    requirements: ['Clear High-Resolution Scan of Original Document', 'Government/School Valid ID'],
  },
  {
    rank: 7,
    id: 'doc-type-006',
    code: 'DIP',
    name: 'Diploma Replacement / Re-issuance',
    category: 'Diplomas',
    requestVolume: '680+ issued',
    percentage: 22,
    fee: 250.0,
    processingDays: '5–7 days',
    description: 'Second-copy parchment diploma with institutional embossed gold seal and registrar notation.',
    requirements: ['Notarized Affidavit of Loss / Damage', 'University Clearance', 'Valid ID'],
  },
  {
    rank: 8,
    id: 'doc-type-syl',
    code: 'SYLL',
    name: 'Course Syllabus & Subject Description',
    category: 'Curriculum',
    requestVolume: '410+ issued',
    percentage: 14,
    fee: 100.0,
    processingDays: '3–4 days',
    description: 'Certified breakdown of subject course outlines and competencies for credit transfer.',
    requirements: ['Program Curriculum Checklist', 'List of Subjects for Evaluation'],
  },
];

export const MostRequestedDocuments: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'TOP' | 'CERT'>('ALL');

  const filteredDocs = MOST_REQUESTED_DOCS.filter((doc) => {
    if (selectedFilter === 'TOP') return doc.rank <= 3;
    if (selectedFilter === 'CERT') return doc.category === 'Certifications';
    return true;
  });

  return (
    <section className="py-14 bg-gradient-to-b from-slate-50 via-white to-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header with Maroon Accent */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#7a132b]/10 border border-[#7a132b]/20 text-[#7a132b] text-xs font-bold uppercase tracking-wider mb-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Registrar Records Demand</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-serif">
              Most Requested Documents
            </h2>
            <p className="text-sm text-slate-600 max-w-2xl mt-1">
              Ranked from highest student demand to specialized credentials. Review fees, required clearance files, and processing timelines before requesting.
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                selectedFilter === 'ALL'
                  ? 'bg-[#7a132b] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              All Ranked (1–8)
            </button>
            <button
              onClick={() => setSelectedFilter('TOP')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                selectedFilter === 'TOP'
                  ? 'bg-[#7a132b] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Top 3 Most Popular
            </button>
            <button
              onClick={() => setSelectedFilter('CERT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                selectedFilter === 'CERT'
                  ? 'bg-[#7a132b] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Certificates Only
            </button>
          </div>
        </div>

        {/* Ranked Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className={`relative rounded-2xl border transition-all duration-300 flex flex-col justify-between p-5 bg-white shadow-xs hover:shadow-lg hover:-translate-y-1 ${
                doc.isTopRequested
                  ? 'border-[#7a132b] ring-2 ring-[#7a132b]/20 bg-gradient-to-b from-rose-50/30 to-white'
                  : 'border-slate-200 hover:border-[#7a132b]/40'
              }`}
            >
              <div>
                {/* Top Badge & Rank */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-black ${
                        doc.rank === 1
                          ? 'bg-[#7a132b] text-white shadow-xs'
                          : doc.rank <= 3
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-slate-100 text-slate-700 font-bold'
                      }`}
                    >
                      #{doc.rank}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-slate-500 uppercase">
                      {doc.code}
                    </span>
                  </div>

                  {doc.isTopRequested ? (
                    <span className="px-2 py-0.5 rounded-full bg-[#7a132b] text-amber-200 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                      #1 Most Requested
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500 font-medium font-mono">
                      {doc.requestVolume}
                    </span>
                  )}
                </div>

                {/* Demand Progress Bar */}
                <div className="space-y-1 mb-3">
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Student Volume</span>
                    <span className="font-semibold text-slate-700">{doc.percentage}% Demand</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        doc.rank === 1
                          ? 'bg-[#7a132b]'
                          : doc.rank <= 3
                          ? 'bg-amber-500'
                          : 'bg-slate-400'
                      }`}
                      style={{ width: `${doc.percentage}%` }}
                    />
                  </div>
                </div>

                {/* Doc Name & Description */}
                <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-[#7a132b] transition-colors mb-1.5">
                  {doc.name}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4">
                  {doc.description}
                </p>

                {/* Requirements Pills */}
                <div className="space-y-1.5 mb-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Required to Submit:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {doc.requirements.map((req, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 text-[11px] bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md text-slate-600 font-medium"
                      >
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                        <span className="truncate max-w-[170px]">{req}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Meta & Action */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Official Fee</span>
                    <span className="text-sm font-black text-slate-900 font-mono">₱{doc.fee.toFixed(2)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-semibold uppercase">Turnaround</span>
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3 text-amber-500" />
                      {doc.processingDays}
                    </span>
                  </div>
                </div>

                <Link
                  to="/new-request"
                  className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    doc.isTopRequested
                      ? 'bg-[#7a132b] hover:bg-[#600e21] text-white shadow-xs'
                      : 'bg-slate-900 hover:bg-[#7a132b] text-white'
                  }`}
                >
                  <span>Request This Document</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Helper Banner */}
        <div className="bg-[#7a132b]/5 border border-[#7a132b]/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#7a132b] text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Need a specialized certification not listed here?</h4>
              <p className="text-xs text-slate-600">
                You can specify custom academic documents or multiple copies in the New Request Form.
              </p>
            </div>
          </div>
          <Link
            to="/new-request"
            className="px-4 py-2 rounded-xl bg-[#7a132b] text-white font-bold text-xs hover:bg-[#630f23] transition-colors shrink-0 shadow-xs flex items-center gap-1.5"
          >
            <span>Open Custom Request</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
