import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { requestService } from '../../services/requestService';
import { DocumentRequest } from '../../types';
import { StatusBadge, PaymentBadge } from '../../components/StatusBadge';
import { Timeline } from '../../components/Timeline';
import { RequestDetailSkeleton } from '../../components/Skeletons';
import { Search, FileText, CheckCircle2, AlertCircle, Calendar, Hash, User, Building2, ShieldCheck, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export const PublicTrack: React.FC = () => {
  const [requestNumber, setRequestNumber] = useState('');
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DocumentRequest | null>(null);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestNumber.trim() || !studentId.trim()) return;

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const data = await requestService.trackPublicRequest(requestNumber, studentId);
      if (!data) {
        setError('No matching record found. Please verify your Request Number (e.g. DR-2026-000001) and Student ID Number match our registrar database.');
        setResult(null);
      } else {
        setResult(data);
      }
    } catch (err: any) {
      console.error('Track error:', err);
      setError(err.message || 'Unable to query request tracking records.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      {/* Header Banner */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
          Official Student Document Verification
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight font-serif">
          Public Request Tracker
        </h1>
        <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
          Track the live issuance lifecycle of your official transcripts, certifications, and diplomas without signing in.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm max-w-2xl mx-auto">
        <form onSubmit={handleTrack} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Official Request Number
              </label>
              <div className="relative">
                <Hash className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. DR-2026-000001"
                  value={requestNumber}
                  onChange={(e) => setRequestNumber(e.target.value)}
                  className="w-full text-xs font-mono font-bold pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 uppercase transition-colors bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Student ID Number
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. 2023-10045"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full text-xs font-mono font-bold pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors bg-slate-50/50"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            id="track-request-btn"
            disabled={loading}
            className="w-full flex items-center justify-center py-3 px-4 rounded-xl bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white font-bold text-xs shadow-2xs transition-[background-color,box-shadow,transform] disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            <Search className="w-4 h-4 mr-2 text-amber-300" />
            {loading ? 'Searching Registrar Records...' : 'Verify & Track Request'}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-slate-100 text-center flex items-center justify-between text-xs text-slate-500">
          <span>Need to submit a new document request?</span>
          <Link to="/login" className="font-bold text-blue-700 hover:text-blue-800 hover:underline inline-flex items-center gap-1">
            Student Login <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Error / Not Found */}
      {error && (
        <div className="max-w-2xl mx-auto p-4 bg-rose-50 border border-rose-300 rounded-2xl text-xs text-rose-900 flex items-start space-x-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Record Verification Notice</p>
            <p className="mt-0.5 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="pt-4">
          <RequestDetailSkeleton />
        </div>
      )}

      {/* Result Card */}
      {!loading && result && (
        <div className="space-y-6 animate-fade-in">
          {/* Main Info Card */}
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#8B1E23] bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                    {result.request_number}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Submitted on {result.created_at ? format(new Date(result.created_at), 'MMMM dd, yyyy') : ''}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mt-1.5 font-serif">
                  {result.document_type?.name || 'Official Academic Document'}
                </h2>
              </div>

              <div className="flex items-center space-x-2">
                <StatusBadge status={result.status} size="lg" />
              </div>
            </div>

            {/* Grid specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-slate-400 block font-bold uppercase tracking-wider text-[10px]">
                  Requester
                </span>
                <span className="font-bold text-slate-800 truncate block mt-0.5">
                  {result.student?.user?.full_name || 'Verified Student'}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-slate-400 block font-bold uppercase tracking-wider text-[10px]">
                  Copies Requested
                </span>
                <span className="font-bold text-slate-800 block mt-0.5">
                  {result.quantity} copy / copies
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-slate-400 block font-bold uppercase tracking-wider text-[10px]">
                  Fulfillment Method
                </span>
                <span className="font-bold text-slate-800 block mt-0.5">
                  {result.release_method.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
                <span className="text-slate-400 block font-bold uppercase tracking-wider text-[10px]">
                  Assessment Fee
                </span>
                <div className="mt-0.5">
                  <PaymentBadge status={result.payment_status} fee={result.fee} />
                </div>
              </div>
            </div>

            {/* Requirement Clearance Summary */}
            {result.requirement_items && result.requirement_items.length > 0 && (
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-700" />
                    Clearance & Requirement Status
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      result.overall_verification_status === 'VERIFIED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : result.overall_verification_status === 'ACTION_REQUIRED'
                        ? 'bg-amber-100 text-amber-800'
                        : result.overall_verification_status === 'REJECTED'
                        ? 'bg-rose-100 text-rose-800'
                        : result.overall_verification_status === 'UNDER_REVIEW'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {result.overall_verification_status === 'VERIFIED'
                      ? '✓ All Requirements Cleared'
                      : result.overall_verification_status === 'ACTION_REQUIRED'
                      ? '⚠️ Resubmission Needed'
                      : result.overall_verification_status === 'REJECTED'
                      ? '✕ Requirements Disapproved'
                      : result.overall_verification_status === 'UNDER_REVIEW'
                      ? '🔍 Review in Progress'
                      : '⏳ Pending Documents'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {result.requirement_items.map((req) => (
                    <div
                      key={req.id}
                      className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between"
                    >
                      <span className="font-medium text-slate-800 truncate pr-2">
                        {req.requirement_name}
                        {req.is_mandatory && <span className="text-rose-500 ml-1">*</span>}
                      </span>
                      <StatusBadge status={req.status} size="xs" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Special notices for ready or rejected */}
            {result.status === 'READY_FOR_RELEASE' && (
              <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-950 text-xs flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm text-emerald-900">Document Ready for Claiming!</p>
                  <p className="mt-1 leading-relaxed">
                    Please visit the Office of the University Registrar during office hours. Present your valid Student Identification Card and reference tracking code <strong>{result.request_number}</strong> at Counter 4.
                  </p>
                </div>
              </div>
            )}

            {result.status === 'REJECTED' && result.rejection_reason && (
              <div className="p-4 bg-rose-50 border border-rose-300 rounded-xl text-rose-950 text-xs">
                <p className="font-bold text-rose-900">Registrar Rejection Note:</p>
                <p className="mt-1 leading-relaxed">{result.rejection_reason}</p>
              </div>
            )}
          </div>

          {/* Timeline & Status History */}
          <Timeline
            currentStatus={result.status}
            history={result.status_history}
            createdAt={result.created_at}
            requesterName={result.student?.user?.full_name || 'Verified Student'}
            requesterRole="STUDENT"
            requestNumber={result.request_number}
          />
        </div>
      )}
    </div>
  );
};
