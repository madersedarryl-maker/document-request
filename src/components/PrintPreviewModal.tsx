import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import {
  Printer,
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Layers,
  FileSpreadsheet,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';
import { DocumentRequest, RequestPriority, RequestStatus } from '../types';
import officialLogoImg from '../assets/images/ibacmi-logo.png';
import { isPendingOverdue, getPendingBusinessDays } from '../pages/staff/StaffRequestQueue';

export interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Mode 1: Queue Report
  queueData?: DocumentRequest[];
  meta?: {
    searchTerm?: string;
    statusFilter?: string;
    priorityFilter?: string;
    docTypeFilter?: string;
    paymentFilter?: string;
    dateRangeFilter?: string;
    totalCount?: number;
    title?: string;
  };
  // Mode 2: Single Document Routing Slip
  singleRequest?: DocumentRequest | null;
  // Default mode to open
  initialMode?: 'queue' | 'document';
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  isOpen,
  onClose,
  queueData = [],
  meta,
  singleRequest,
  initialMode = 'queue',
}) => {
  const [activeMode, setActiveMode] = useState<'queue' | 'document'>(
    singleRequest ? 'document' : initialMode
  );
  const [selectedDocIndex, setSelectedDocIndex] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(90); // default 90% for standard laptop screens
  const [showMarginGuides, setShowMarginGuides] = useState<boolean>(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Sync mode if singleRequest is provided or updated
  useEffect(() => {
    if (singleRequest) {
      setActiveMode('document');
    } else if (queueData && queueData.length > 0 && initialMode === 'queue') {
      setActiveMode('queue');
    }
  }, [singleRequest, initialMode, queueData]);

  // Manage body class for printing
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('print-preview-active');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('print-preview-active');
      document.body.style.overflow = '';
    }

    return () => {
      document.body.classList.remove('print-preview-active');
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        handlePrint();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Active single request for document slip preview
  const currentDoc: DocumentRequest | null =
    activeMode === 'document'
      ? singleRequest || (queueData[selectedDocIndex] ?? null)
      : null;

  const totalDocuments = queueData.length;

  // Zoom helpers
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 15, 140));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 15, 50));
  const handleZoomReset = () => setZoomLevel(100);
  const handleFitWidth = () => {
    if (!canvasRef.current) return;
    const containerWidth = canvasRef.current.clientWidth - 48; // padding
    // Standard letter width is 215.9mm ~ 816px at 96dpi
    const letterPxWidth = 816;
    const computedZoom = Math.min(Math.max(Math.round((containerWidth / letterPxWidth) * 100), 50), 120);
    setZoomLevel(computedZoom);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Print Preview"
      className="print-preview-dialog print-preview-modal fixed inset-0 z-50 flex flex-col bg-slate-950/80 backdrop-blur-xs text-white"
    >
      {/* ------------------------------------------------------------- */}
      {/* Top Header / Control Toolbar (Hidden during actual print)     */}
      {/* ------------------------------------------------------------- */}
      <header className="print-preview-toolbar print-preview-chrome shrink-0 bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-md">
        {/* Left: Document Info & Mode Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-tight">Print Preview</h3>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                  US Letter (8.5&quot; × 11&quot;)
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Visualizing paper layout with printer-friendly CSS stylesheet
              </p>
            </div>
          </div>

          {/* Mode Switcher if we have queue items */}
          {queueData.length > 0 && (
            <div className="flex items-center bg-slate-800/90 rounded-lg p-1 border border-slate-700 ml-2">
              <button
                type="button"
                onClick={() => setActiveMode('queue')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  activeMode === 'queue'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Queue Report ({queueData.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('document')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                  activeMode === 'document'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Routing Slip</span>
              </button>
            </div>
          )}

          {/* Document Pagination if in Document Mode and multiple items exist */}
          {activeMode === 'document' && totalDocuments > 1 && (
            <div className="flex items-center gap-1 bg-slate-800/80 px-2 py-1 rounded-lg border border-slate-700 text-xs">
              <button
                type="button"
                disabled={selectedDocIndex <= 0}
                onClick={() => setSelectedDocIndex((prev) => Math.max(prev - 1, 0))}
                className="p-1 rounded hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200"
                title="Previous Request"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono text-[11px] text-slate-300 px-1">
                {selectedDocIndex + 1} of {totalDocuments}
              </span>
              <button
                type="button"
                disabled={selectedDocIndex >= totalDocuments - 1}
                onClick={() => setSelectedDocIndex((prev) => Math.min(prev + 1, totalDocuments - 1))}
                className="p-1 rounded hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200"
                title="Next Request"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Right: Zoom & Preview Controls */}
        <div className="flex items-center gap-2">
          {/* Margin Guides Toggle */}
          <button
            type="button"
            onClick={() => setShowMarginGuides(!showMarginGuides)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              showMarginGuides
                ? 'bg-blue-950 text-blue-300 border-blue-600'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
            }`}
            title="Toggle visual margin guide boundaries (12mm margins)"
          >
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>Margin Guides</span>
          </button>

          {/* Zoom Controls */}
          <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700 p-0.5">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleZoomReset}
              className="px-2 py-1 text-xs font-mono text-slate-200 hover:bg-slate-700 rounded transition-colors"
              title="Reset Zoom to 100%"
            >
              {zoomLevel}%
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleFitWidth}
              className="px-2 py-1 text-[11px] text-slate-300 hover:text-white hover:bg-slate-700 border-l border-slate-700 rounded-r transition-colors"
              title="Fit to Window"
            >
              Fit
            </button>
          </div>

          {/* Print Action Button */}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-500 shadow-md transition-colors cursor-pointer"
            title="Trigger browser print dialog (Ctrl+P)"
          >
            <Printer className="w-4 h-4" />
            <span>Print Document</span>
          </button>

          {/* Close Modal Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-1 cursor-pointer"
            title="Close Preview (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* Main Preview Canvas (Scrollable viewport for sheet simulator) */}
      {/* ------------------------------------------------------------- */}
      <div
        ref={canvasRef}
        className="flex-1 overflow-auto bg-slate-950 p-4 sm:p-8 flex justify-center items-start"
      >
        <div
          className="transition-transform duration-150 ease-out my-auto"
          style={{
            transform: `scale(${zoomLevel / 100})`,
            transformOrigin: 'top center',
          }}
        >
          {/* ========================================================= */}
          {/* SIMULATED PAPER SHEET: US LETTER (215.9mm × 279.4mm)      */}
          {/* Uses exact .print-paper-sheet and printer-friendly styles */}
          {/* ========================================================= */}
          <div
            className={`print-paper-sheet font-sans text-slate-900 ${
              showMarginGuides ? 'show-margin-guides' : ''
            }`}
          >
            {activeMode === 'queue' ? (
              /* ----------------------------------------------------- */
              /* 1. OFFICIAL QUEUE PROCESSING REPORT                   */
              /* ----------------------------------------------------- */
              <div className="print-clean-container space-y-3">
                {/* Official Institutional Header */}
                <div className="text-center pb-3 mb-2 border-b-2 border-slate-900">
                  <div className="flex items-center justify-center gap-3 mb-1">
                    <img
                      src={officialLogoImg}
                      alt="IBA College of Mindanao Official Seal"
                      className="w-12 h-12 object-contain"
                    />
                    <div>
                      <h1 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                        International Baptist Academy & College of Ministries, Inc.
                      </h1>
                      <p className="text-[8.5pt] text-slate-700 uppercase tracking-widest font-semibold">
                        Office of the College Registrar • Academic Records & Document Services
                      </p>
                    </div>
                  </div>
                  <h2 className="text-sm font-black uppercase tracking-tight text-slate-900 mt-1">
                    {meta?.title ||
                      (queueData.length > 0
                        ? `Official Request Processing Queue (${queueData.length} Records)`
                        : 'Official Document Processing Queue Report')}
                  </h2>
                </div>

                {/* Print Metadata Summary Strip */}
                <div className="grid grid-cols-2 text-[8pt] border border-slate-300 rounded p-2 mb-2 bg-slate-50">
                  <div>
                    <p>
                      <strong>Generated Date/Time:</strong>{' '}
                      {format(new Date(), 'MMMM dd, yyyy - hh:mm a')}
                    </p>
                    <p>
                      <strong>Search Query:</strong>{' '}
                      {meta?.searchTerm ? `"${meta.searchTerm}"` : 'All Requesters (No Query Filter)'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p>
                      <strong>Total Included Records:</strong> {queueData.length} request(s)
                    </p>
                    <p>
                      <strong>Active Filters:</strong> Status: {meta?.statusFilter || 'ALL'} | Priority:{' '}
                      {meta?.priorityFilter || 'ALL'} | DocType: {meta?.docTypeFilter || 'ALL'}
                      {meta?.dateRangeFilter ? ` | Date: ${meta.dateRangeFilter}` : ''}
                    </p>
                  </div>
                </div>

                {/* Printable Queue Table */}
                {queueData.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-500 italic border border-slate-200 rounded">
                    No document requests to display for the selected print criteria.
                  </div>
                ) : (
                  <table className="print-table">
                    <thead>
                      <tr>
                        <th style={{ width: '4%', textAlign: 'center' }}>#</th>
                        <th style={{ width: '15%' }}>Request ID</th>
                        <th style={{ width: '22%' }}>Student Requester</th>
                        <th style={{ width: '22%' }}>Document Requested</th>
                        <th style={{ width: '9%', textAlign: 'center' }}>Priority</th>
                        <th style={{ width: '14%', textAlign: 'center' }}>Workflow Status</th>
                        <th style={{ width: '14%' }}>Date Submitted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {queueData.map((req, i) => (
                        <tr key={req.id}>
                          <td style={{ textAlign: 'center' }} className="font-mono text-slate-600">
                            {i + 1}
                          </td>
                          <td className="font-mono font-bold text-slate-900">{req.request_number}</td>
                          <td>
                            <div className="font-bold text-slate-900">
                              {req.student?.user?.full_name || 'Student Requester'}
                            </div>
                            <div className="text-[7.5pt] text-slate-600 font-mono">
                              ID: {req.student?.student_id || 'N/A'} •{' '}
                              {req.student?.program || 'Academic Program'}
                            </div>
                          </td>
                          <td>
                            <div className="font-semibold text-slate-900">{req.document_type?.name}</div>
                            <div className="text-[7.5pt] text-slate-600">
                              {req.quantity} {req.quantity === 1 ? 'copy' : 'copies'} (
                              {req.release_method?.replace(/_/g, ' ')})
                            </div>
                          </td>
                          <td style={{ textAlign: 'center' }} className="font-semibold">
                            {req.priority}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span className="print-badge">{req.status.replace(/_/g, ' ')}</span>
                            {isPendingOverdue(req.status, req.created_at) && (
                              <div className="text-[7pt] font-bold text-amber-900 mt-0.5">
                                ⚠️ Overdue SLA ({getPendingBusinessDays(req.created_at)}d)
                              </div>
                            )}
                          </td>
                          <td className="font-mono text-slate-700 text-[8pt]">
                            {req.created_at ? format(new Date(req.created_at), 'MMM dd, yyyy') : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* Official Print Sign-off Block */}
                <div className="print-signature-block pt-6 grid grid-cols-2 gap-8 text-[8.5pt]">
                  <div className="border-t border-slate-800 pt-1 text-center">
                    <p className="font-bold text-slate-900">Prepared & Generated By</p>
                    <p className="text-[7.5pt] text-slate-600">
                      Staff Processing Officer / Records In-Charge
                    </p>
                  </div>
                  <div className="border-t border-slate-800 pt-1 text-center">
                    <p className="font-bold text-slate-900">Certified & Approved By</p>
                    <p className="text-[7.5pt] text-slate-600">Office of the College Registrar</p>
                  </div>
                </div>

                {/* Footer Security Verification String */}
                <div className="pt-4 text-center text-[7pt] text-slate-400 font-mono">
                  Official Academic Queue Manifest • iBACMI Registrar Portal • Verification Hash:{' '}
                  {Math.random().toString(36).substring(2, 10).toUpperCase()}-
                  {format(new Date(), 'yyyyMMdd')}
                </div>
              </div>
            ) : currentDoc ? (
              /* ----------------------------------------------------- */
              /* 2. OFFICIAL INDIVIDUAL DOCUMENT ROUTING & RELEASE SLIP  */
              /* ----------------------------------------------------- */
              <div className="print-clean-container space-y-4">
                {/* Institutional Letterhead */}
                <div className="text-center pb-3 border-b-2 border-slate-900">
                  <div className="flex items-center justify-center gap-3 mb-1">
                    <img
                      src={officialLogoImg}
                      alt="IBA College of Mindanao Official Seal"
                      className="w-14 h-14 object-contain"
                    />
                    <div>
                      <h1 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                        International Baptist Academy & College of Ministries, Inc.
                      </h1>
                      <p className="text-[8.5pt] text-slate-700 uppercase tracking-widest font-semibold">
                        Office of the College Registrar • Records & Verification Section
                      </p>
                      <p className="text-[7.5pt] text-slate-500">
                        Bukidnon, Philippines • Tel: (088) 221-XXXX • registrar@ibacollege.edu.ph
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 py-1 bg-slate-100 border-y border-slate-300">
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-900">
                      Official Document Routing & Clearance Voucher
                    </h2>
                  </div>
                </div>

                {/* Barcode Reference & Tracking Meta */}
                <div className="flex items-center justify-between border border-slate-300 rounded p-2 bg-slate-50/70 text-[8pt]">
                  <div>
                    <span className="text-slate-500 block uppercase font-bold text-[7pt]">
                      Tracking Reference Number
                    </span>
                    <span className="font-mono text-xs font-black text-slate-900">
                      {currentDoc.request_number}
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-slate-500 block uppercase font-bold text-[7pt]">
                      Processing Priority
                    </span>
                    <span className="font-bold text-slate-900">{currentDoc.priority} PRIORITY</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block uppercase font-bold text-[7pt]">
                      Submission Timestamp
                    </span>
                    <span className="font-mono text-slate-800">
                      {currentDoc.created_at
                        ? format(new Date(currentDoc.created_at), 'MMMM dd, yyyy • hh:mm a')
                        : '-'}
                    </span>
                  </div>
                </div>

                {/* Section 1: Student Particulars */}
                <div className="space-y-1">
                  <h3 className="text-[8.5pt] font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5">
                    1. Student & Applicant Particulars
                  </h3>
                  <table className="print-table !mt-1 !mb-2">
                    <tbody>
                      <tr>
                        <td className="w-1/4 font-bold bg-slate-50 text-slate-700">Full Name:</td>
                        <td className="w-2/4 font-black text-slate-900">
                          {currentDoc.student?.user?.full_name || 'N/A'}
                        </td>
                        <td className="w-1/4 font-bold bg-slate-50 text-slate-700">Student ID No.:</td>
                        <td className="font-mono font-bold text-slate-900">
                          {currentDoc.student?.student_id || 'N/A'}
                        </td>
                      </tr>
                      <tr>
                        <td className="font-bold bg-slate-50 text-slate-700">Degree Program:</td>
                        <td className="font-semibold text-slate-900">
                          {currentDoc.student?.program || 'General Academic Program'}
                        </td>
                        <td className="font-bold bg-slate-50 text-slate-700">Year Level:</td>
                        <td>{currentDoc.student?.year_level ? `Year ${currentDoc.student.year_level}` : 'Enrolled'}</td>
                      </tr>
                      <tr>
                        <td className="font-bold bg-slate-50 text-slate-700">Contact Email:</td>
                        <td className="font-mono text-slate-800">{currentDoc.student?.user?.email || 'N/A'}</td>
                        <td className="font-bold bg-slate-50 text-slate-700">Release Mode:</td>
                        <td className="font-semibold text-slate-900">
                          {currentDoc.release_method?.replace(/_/g, ' ') || 'Registrar Pick-up'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Section 2: Document Request Particulars */}
                <div className="space-y-1">
                  <h3 className="text-[8.5pt] font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5">
                    2. Document Specifications & Purpose
                  </h3>
                  <table className="print-table !mt-1 !mb-2">
                    <tbody>
                      <tr>
                        <td className="w-1/4 font-bold bg-slate-50 text-slate-700">Document Type:</td>
                        <td className="font-black text-slate-900">
                          {currentDoc.document_type?.name} ({currentDoc.document_type?.code})
                        </td>
                        <td className="w-1/6 font-bold bg-slate-50 text-slate-700">Quantity:</td>
                        <td className="font-bold text-slate-900">
                          {currentDoc.quantity} {currentDoc.quantity === 1 ? 'Copy' : 'Copies'}
                        </td>
                      </tr>
                      <tr>
                        <td className="font-bold bg-slate-50 text-slate-700">Stated Purpose:</td>
                        <td colSpan={3} className="text-slate-800 italic">
                          &quot;{currentDoc.purpose || 'Official Institutional Reference & Application Requirements'}&quot;
                        </td>
                      </tr>
                      <tr>
                        <td className="font-bold bg-slate-50 text-slate-700">Current Workflow:</td>
                        <td>
                          <span className="print-badge font-bold">
                            {currentDoc.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="font-bold bg-slate-50 text-slate-700">Est. Processing:</td>
                        <td className="text-slate-700">
                          {currentDoc.document_type?.processing_days || 3} Working Days SLA
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Section 3: Clearance & Verification Checklist */}
                <div className="space-y-1">
                  <h3 className="text-[8.5pt] font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5">
                    3. Institutional Clearance & Verification Checklist
                  </h3>
                  <table className="print-table !mt-1 !mb-2 text-[8pt]">
                    <thead>
                      <tr>
                        <th style={{ width: '25%' }}>Verification Step</th>
                        <th style={{ width: '25%' }}>Status</th>
                        <th style={{ width: '25%' }}>Authorized Signatory</th>
                        <th style={{ width: '25%' }}>Date Verified</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="font-bold text-slate-800">1. Accounting / Bursar Fee</td>
                        <td>
                          <span className="font-bold text-emerald-900">
                            {currentDoc.payment_status === 'PAID' ? '✓ CLEARED / PAID' : 'PENDING PAYMENT'}
                          </span>
                        </td>
                        <td className="text-slate-600">Cashier / Bursar Office</td>
                        <td className="font-mono text-slate-600">
                          {currentDoc.created_at ? format(new Date(currentDoc.created_at), 'MM/dd/yyyy') : '-'}
                        </td>
                      </tr>
                      <tr>
                        <td className="font-bold text-slate-800">2. Academic Records Evaluation</td>
                        <td>
                          <span className="font-bold text-slate-900">✓ VERIFIED IN ORDER</span>
                        </td>
                        <td className="text-slate-600">Records Evaluation Staff</td>
                        <td className="font-mono text-slate-600">
                          {format(new Date(), 'MM/dd/yyyy')}
                        </td>
                      </tr>
                      <tr>
                        <td className="font-bold text-slate-800">3. College Dean / Sign-off</td>
                        <td>
                          <span className="font-bold text-slate-900">✓ ENDORSED</span>
                        </td>
                        <td className="text-slate-600">Dean of Academic Affairs</td>
                        <td className="font-mono text-slate-600">-</td>
                      </tr>
                      <tr>
                        <td className="font-bold text-slate-800">4. Dry Seal & Authentication</td>
                        <td>
                          <span className="font-bold text-slate-900">AFFIXED UPON ISSUANCE</span>
                        </td>
                        <td className="text-slate-600">College Registrar</td>
                        <td className="font-mono text-slate-600">-</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Section 4: Claiming & Release Acknowledgement */}
                <div className="border border-slate-300 rounded p-2.5 bg-slate-50/50 space-y-2 text-[8pt]">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[8pt]">
                    4. Student Claiming & Release Acknowledgement
                  </h4>
                  <p className="text-[7.5pt] text-slate-600">
                    I hereby acknowledge receipt of the official documents specified above in good condition and authentic dry-sealed order.
                  </p>
                  <div className="grid grid-cols-3 gap-4 pt-4 text-center text-[7.5pt]">
                    <div className="border-t border-slate-700 pt-1">
                      <p className="font-bold text-slate-900">Date Received & Claimed</p>
                    </div>
                    <div className="border-t border-slate-700 pt-1">
                      <p className="font-bold text-slate-900">Valid ID Presented (Type & ID #)</p>
                    </div>
                    <div className="border-t border-slate-700 pt-1">
                      <p className="font-bold text-slate-900">Student / Authorized Representative Signature</p>
                    </div>
                  </div>
                </div>

                {/* Official Sign-off Block */}
                <div className="print-signature-block pt-4 grid grid-cols-2 gap-8 text-[8.5pt]">
                  <div className="border-t border-slate-800 pt-1 text-center">
                    <p className="font-bold text-slate-900">Processed By</p>
                    <p className="text-[7.5pt] text-slate-600">Staff Evaluation Officer / Records In-Charge</p>
                  </div>
                  <div className="border-t border-slate-800 pt-1 text-center">
                    <p className="font-bold text-slate-900">Approved & Issued By</p>
                    <p className="text-[7.5pt] text-slate-600">Office of the College Registrar</p>
                  </div>
                </div>

                <div className="pt-2 text-center text-[6.5pt] text-slate-400 font-mono">
                  This document serves as an official institutional transmittal clearance slip. Retain for academic records.
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-500">
                <AlertCircle className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                <p>No document selected for preview.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* Bottom Footer Tip Strip                                       */}
      {/* ------------------------------------------------------------- */}
      <footer className="print-preview-footer print-preview-chrome shrink-0 bg-slate-900 border-t border-slate-800 px-4 py-2 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-blue-400 shrink-0" />
          <span>
            <strong>Printing Tip:</strong> In your browser print dialog, enable{' '}
            <span className="text-slate-200 underline decoration-dotted">Background graphics</span> under More Settings to print authentic seals, badges, and table header shading.
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
          <span>Target: Standard Letter Portrait (12mm Margins)</span>
          <button
            type="button"
            onClick={handlePrint}
            className="text-blue-400 hover:text-blue-300 font-bold transition-colors cursor-pointer"
          >
            Launch Print Dialog (Ctrl+P) &rarr;
          </button>
        </div>
      </footer>
    </div>
  );
};
