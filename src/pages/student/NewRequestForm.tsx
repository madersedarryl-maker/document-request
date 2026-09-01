import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { documentService } from '../../services/documentService';
import { requestService } from '../../services/requestService';
import { storageService } from '../../services/storageService';
import { DocumentType, ReleaseMethod } from '../../types';
import { FileUploader } from '../../components/FileUploader';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/Button';
import {
  evaluateRequirementVisibility,
  formatConditionalRuleSummary,
} from '../../utils/conditionalRules';
import {
  FileText,
  User,
  GraduationCap,
  Upload,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Clock,
  ShieldCheck,
  Building,
  Send,
  HelpCircle,
  Info,
  SlidersHorizontal,
} from 'lucide-react';

export const NewRequestForm: React.FC = () => {
  const { user, profile, studentProfile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [docTypes, setDocTypes] = useState<DocumentType[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [purpose, setPurpose] = useState<string>('Employment Application');
  const [customPurpose, setCustomPurpose] = useState<string>('');
  const [releaseMethod, setReleaseMethod] = useState<ReleaseMethod>('PICKUP');
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedRequestNumber, setSubmittedRequestNumber] = useState<string | null>(null);
  const [submittedReqs, setSubmittedReqs] = useState<any[]>([]);

  const purposeOptions = [
    'Employment Application',
    'Scholarship Application',
    'Board Examination / PRC',
    'Transfer to Another School',
    'Visa / Immigration / Embassy',
    'Graduate Studies / Law / Medicine',
    'Company Requirement / Promotion',
    'Personal Records Copy',
    'Other (Specify)',
  ];

  useEffect(() => {
    const loadDocTypes = async () => {
      setLoading(true);
      try {
        const types = await documentService.getActiveDocumentTypes();
        setDocTypes(types);
        if (types.length > 0) {
          setSelectedDocId(types[0].id);
        }
      } catch (err: any) {
        console.error('Error fetching document types:', err);
        setError('Failed to load document types from database.');
      } finally {
        setLoading(false);
      }
    };
    loadDocTypes();
  }, []);

  const selectedDoc = docTypes.find((d) => d.id === selectedDocId);
  const totalFee = selectedDoc ? Number(selectedDoc.fee) * quantity : 0;

  const handleNextStep = () => {
    setError(null);
    if (step === 2) {
      if (!selectedDocId) {
        setError('Please select a document type.');
        return;
      }
      if (purpose === 'Other (Specify)' && !customPurpose.trim()) {
        setError('Please specify your request purpose.');
        return;
      }
      if (releaseMethod === 'COURIER' && !deliveryAddress.trim()) {
        setError('Please provide a complete shipping/delivery address for courier delivery.');
        return;
      }
    }
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setError(null);
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!studentProfile || !user || !selectedDoc) {
      setError('Student profile verification missing.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const finalPurpose = purpose === 'Other (Specify)' ? customPurpose.trim() : purpose;

      // 1. Submit Request via atomic RPC
      const createdRequest = await requestService.submitRequest({
        student_id: studentProfile.id,
        document_type_id: selectedDoc.id,
        quantity,
        purpose: finalPurpose,
        release_method: releaseMethod,
        delivery_address: releaseMethod === 'COURIER' ? deliveryAddress.trim() : undefined,
        remarks: remarks.trim() || undefined,
        fee: totalFee,
      });

      // 2. Upload attachments to secure storage bucket if any
      if (files.length > 0) {
        for (const file of files) {
          try {
            const uploadRes = await storageService.uploadRequestAttachment(createdRequest.id, file);
            await storageService.saveAttachmentRecord({
              request_id: createdRequest.id,
              uploaded_by: user.id,
              file_name: uploadRes.fileName,
              storage_path: uploadRes.storagePath,
              file_size: uploadRes.fileSize,
              mime_type: uploadRes.mimeType,
            });
          } catch (uploadErr) {
            console.error('File upload error for', file.name, uploadErr);
          }
        }
      }

      setSubmittedRequestNumber(createdRequest.request_number);
      setSubmittedReqs(createdRequest.requirement_items || []);
      setStep(5); // Success step
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err.message || 'Failed to submit document request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 5 && submittedRequestNumber) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <div className="space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 font-mono">
            Submission Confirmed
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Document Request Successfully Submitted!
          </h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Your application has been logged and initialized with the required clearance checklist for the Office of the College Registrar.
          </p>
        </div>

        {/* Tracking number card */}
        <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl max-w-md mx-auto space-y-2 text-center">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
            Official Tracking Number
          </p>
          <p className="text-2xl font-mono font-black text-blue-700 tracking-tight">
            {submittedRequestNumber}
          </p>
          <p className="text-[11px] text-slate-500">
            Keep this number to track clearance status in real-time or present during document pickup.
          </p>
        </div>

        {/* Initialized Requirements Overview */}
        {submittedReqs.length > 0 && (
          <div className="p-4 bg-white border border-slate-200 rounded-xl max-w-md mx-auto text-left space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Initialized Institutional Requirements
              </span>
              <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {submittedReqs.length} Prerequisite{submittedReqs.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {submittedReqs.map((req, idx) => (
                <div key={req.id || idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-slate-800">{req.requirement_name}</p>
                    <span className="text-[10px] text-slate-500">
                      {req.is_mandatory ? 'Mandatory Requirement' : 'Optional Requirement'}
                    </span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    req.current_status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' :
                    req.current_status === 'UNDER_REVIEW' ? 'bg-amber-50 text-amber-700' :
                    'bg-slate-200 text-slate-700'
                  }`}>
                    {req.current_status === 'UNDER_REVIEW' ? 'Uploaded / Under Review' :
                     req.current_status === 'APPROVED' ? 'Verified' : 'Pending Upload'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link to="/my-requests">
            <Button variant="primary" size="md">
              View My Requests
            </Button>
          </Link>
          <Link to="/track">
            <Button variant="secondary" size="md">
              Public Tracker
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title="New Official Document Request"
        subtitle="Submit a formal request for transcripts, certifications, clearances, and diplomas."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'My Requests', href: '/my-requests' },
          { label: 'New Request' },
        ]}
      />

      {/* 2. Step Progress Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div
            className={`flex flex-col sm:flex-row items-center justify-center gap-2 p-2 rounded-lg transition-colors ${
              step >= 1 ? 'bg-blue-50 text-blue-800 font-bold' : 'text-slate-400'
            }`}
          >
            <span className="w-5 h-5 rounded-full flex items-center justify-center bg-blue-700 text-white text-[11px] font-mono">
              1
            </span>
            <span className="text-xs">Student Verification</span>
          </div>

          <div
            className={`flex flex-col sm:flex-row items-center justify-center gap-2 p-2 rounded-lg transition-colors ${
              step >= 2 ? 'bg-blue-50 text-blue-800 font-bold' : 'text-slate-400'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-mono ${
                step >= 2 ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              2
            </span>
            <span className="text-xs">Select Document</span>
          </div>

          <div
            className={`flex flex-col sm:flex-row items-center justify-center gap-2 p-2 rounded-lg transition-colors ${
              step >= 3 ? 'bg-blue-50 text-blue-800 font-bold' : 'text-slate-400'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-mono ${
                step >= 3 ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              3
            </span>
            <span className="text-xs">Clearance Files</span>
          </div>

          <div
            className={`flex flex-col sm:flex-row items-center justify-center gap-2 p-2 rounded-lg transition-colors ${
              step >= 4 ? 'bg-blue-50 text-blue-800 font-bold' : 'text-slate-400'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-mono ${
                step >= 4 ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              4
            </span>
            <span className="text-xs">Review & Submit</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* 3. Form Content Container */}
      <div className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200 shadow-2xs space-y-6">
        {/* STEP 1: Verify Student Profile */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Step 1: Confirm Student Requester Identity
              </h2>
              <p className="text-xs text-slate-500">
                Official documents will be issued under this verified student record.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 uppercase font-semibold text-[10px] block">
                  Full Legal Name
                </span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {profile?.full_name}
                </span>
              </div>

              <div>
                <span className="text-slate-400 uppercase font-semibold text-[10px] block">
                  Student ID Number
                </span>
                <span className="font-bold font-mono text-slate-900 text-sm mt-0.5 block">
                  {studentProfile?.student_id || 'Not Specified'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 uppercase font-semibold text-[10px] block">
                  Degree / Program
                </span>
                <span className="font-semibold text-slate-800 mt-0.5 block">
                  {studentProfile?.program || 'N/A'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 uppercase font-semibold text-[10px] block">
                  Year Level / Status
                </span>
                <span className="font-semibold text-slate-800 mt-0.5 block">
                  {studentProfile?.year_level || 'N/A'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 uppercase font-semibold text-[10px] block">
                  Institutional Email
                </span>
                <span className="font-semibold text-slate-800 mt-0.5 block">
                  {profile?.email}
                </span>
              </div>

              <div>
                <span className="text-slate-400 uppercase font-semibold text-[10px] block">
                  Contact Phone
                </span>
                <span className="font-semibold text-slate-800 mt-0.5 block">
                  {studentProfile?.contact_number || profile?.phone || 'Not provided'}
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-xs flex items-start space-x-2.5">
              <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
              <p>
                Please verify that your registered name and program details match your official student record.
              </p>
            </div>
          </div>
        )}

        {/* STEP 2: Document Selection & Options */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Step 2: Choose Document & Request Specifications
              </h2>
              <p className="text-xs text-slate-500">
                Select the scholastic document you need and configure fulfillment parameters.
              </p>
            </div>

            {/* Document Types Selector */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Select Document Type <span className="text-rose-500">*</span>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {docTypes.map((doc) => {
                  const isSelected = doc.id === selectedDocId;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDocId(doc.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <span className="font-bold text-sm text-slate-900 block">{doc.name}</span>
                          <p className="text-xs text-slate-500 line-clamp-2">{doc.description}</p>
                        </div>
                        <span className="font-bold text-xs text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full shrink-0 ml-2">
                          ₱{Number(doc.fee).toFixed(2)}
                        </span>
                      </div>

                      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {doc.processing_days} working days
                        </span>
                        {doc.requirements && doc.requirements.length > 0 && (
                          <span className="text-blue-700 font-medium">
                            {doc.requirements.length} requirement(s)
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quantity and Purpose */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Number of Copies (1-20) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))
                  }
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 font-semibold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Purpose of Request <span className="text-rose-500">*</span>
                </label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 bg-white"
                >
                  {purposeOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {purpose === 'Other (Specify)' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Specify Request Purpose <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. For visa renewal application or board exam credential"
                  value={customPurpose}
                  onChange={(e) => setCustomPurpose(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600"
                />
              </div>
            )}

            {/* Release Method */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Release / Claiming Method <span className="text-rose-500">*</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <label
                  className={`p-3.5 rounded-xl border cursor-pointer flex flex-col justify-between ${
                    releaseMethod === 'PICKUP'
                      ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>In-Person Pick-up</span>
                    <input
                      type="radio"
                      name="releaseMethod"
                      checked={releaseMethod === 'PICKUP'}
                      onChange={() => setReleaseMethod('PICKUP')}
                      className="text-blue-600"
                    />
                  </div>
                  <span className="text-[11px] font-normal text-slate-500 mt-1">
                    Claim at Registrar Window 2 with valid ID
                  </span>
                </label>

                <label
                  className={`p-3.5 rounded-xl border cursor-pointer flex flex-col justify-between ${
                    releaseMethod === 'DIGITAL_COPY'
                      ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>Digital Certified Copy</span>
                    <input
                      type="radio"
                      name="releaseMethod"
                      checked={releaseMethod === 'DIGITAL_COPY'}
                      onChange={() => setReleaseMethod('DIGITAL_COPY')}
                      className="text-blue-600"
                    />
                  </div>
                  <span className="text-[11px] font-normal text-slate-500 mt-1">
                    Secure PDF download via portal
                  </span>
                </label>

                <label
                  className={`p-3.5 rounded-xl border cursor-pointer flex flex-col justify-between ${
                    releaseMethod === 'COURIER'
                      ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>Courier Delivery</span>
                    <input
                      type="radio"
                      name="releaseMethod"
                      checked={releaseMethod === 'COURIER'}
                      onChange={() => setReleaseMethod('COURIER')}
                      className="text-blue-600"
                    />
                  </div>
                  <span className="text-[11px] font-normal text-slate-500 mt-1">
                    Direct shipping to physical address
                  </span>
                </label>
              </div>

              {releaseMethod === 'COURIER' && (
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Complete Shipping Address <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="House/Building No., Street, Barangay, City/Municipality, Province, Postal Code"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              )}
            </div>

            {/* Special Instructions / Remarks */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Special Remarks / Additional Notes (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Specify specific academic years, subjects, or special notation requested..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
        )}

        {/* STEP 3: Upload Supporting Clearances */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Step 3: Upload Supporting Documents & Clearances
              </h2>
              <p className="text-xs text-slate-500">
                Ensure all required documentation is clear and legible to avoid review delays.
              </p>
            </div>

            {/* Requirements Checklist */}
            {(() => {
              const reqContext = {
                purpose: purpose === 'Other' ? customPurpose : purpose,
                release_method: releaseMethod,
                student_status: studentProfile?.program || 'Undergraduate',
                year_level: studentProfile?.year_level,
              };

              const allReqs = selectedDoc?.requirements || [];
              const visibleReqs = allReqs.filter((r) => evaluateRequirementVisibility(r, reqContext));

              return visibleReqs.length > 0 ? (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-blue-700" />
                      Required Prerequisites for {selectedDoc?.name}:
                    </h3>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {visibleReqs.filter((r) => r.is_mandatory).length} Mandatory,{' '}
                      {visibleReqs.filter((r) => !r.is_mandatory).length} Optional
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {visibleReqs.map((req) => {
                      const ruleInfo = formatConditionalRuleSummary(req.conditional_rule);
                      return (
                        <div
                          key={req.id}
                          className="p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-slate-900">{req.requirement_name}</span>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                  req.is_mandatory
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {req.is_mandatory ? '★ Mandatory' : 'Optional'}
                              </span>
                              {ruleInfo.isConditional && (
                                <span className="text-[9px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                                  ⚡ {ruleInfo.label}
                                </span>
                              )}
                            </div>

                            <span className="text-[10px] font-mono text-slate-400">
                              {req.file_type || 'PDF, JPG, PNG'} (Max {req.max_file_size_mb || 10}MB)
                            </span>
                          </div>

                          {req.description && (
                            <p className="text-[11px] text-slate-600 leading-relaxed">{req.description}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-start space-x-2.5">
                  <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                  <p>
                    No specific prerequisite clearances are mandated for <strong>{selectedDoc?.name}</strong> under your selected request conditions.
                    You may still upload optional supporting documents or proof of payment below.
                  </p>
                </div>
              );
            })()}

            {/* File Uploader */}
            <FileUploader
              label="Select or Drop Clearance Documents"
              description="Upload PDF clearances, scanned student ID, or photo proofs up to 10MB each"
              files={files}
              onFilesSelected={(newFiles) => setFiles(newFiles)}
              onRemoveFile={(idx) => setFiles(files.filter((_, i) => i !== idx))}
            />
          </div>
        )}

        {/* STEP 4: Review & Final Confirmation */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Step 4: Review and Submit Application
              </h2>
              <p className="text-xs text-slate-500">
                Please verify all request details prior to committing to the university database.
              </p>
            </div>

            {/* Summary card */}
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-200">
                <div>
                  <span className="text-slate-400 uppercase font-semibold text-[10px] block">
                    Student Requester
                  </span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                    {profile?.full_name}
                  </span>
                  <span className="text-slate-500 font-mono text-[11px]">
                    {studentProfile?.student_id}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 uppercase font-semibold text-[10px] block">
                    Degree Program
                  </span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">
                    {studentProfile?.program} ({studentProfile?.year_level})
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pb-3 border-b border-slate-200">
                <div>
                  <span className="text-slate-400 uppercase font-semibold text-[10px] block">
                    Document Type
                  </span>
                  <span className="font-bold text-blue-700 text-sm mt-0.5 block">
                    {selectedDoc?.name}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 uppercase font-semibold text-[10px] block">
                    Quantity
                  </span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                    {quantity} copy / copies
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 uppercase font-semibold text-[10px] block">
                    Turnaround Estimate
                  </span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">
                    {selectedDoc?.processing_days} working days
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-3 border-b border-slate-200">
                <div>
                  <span className="text-slate-400 uppercase font-semibold text-[10px] block">
                    Purpose
                  </span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">
                    {purpose === 'Other (Specify)' ? customPurpose : purpose}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 uppercase font-semibold text-[10px] block">
                    Claiming Method
                  </span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">
                    {releaseMethod.replace(/_/g, ' ')}
                  </span>
                  {releaseMethod === 'COURIER' && (
                    <span className="text-slate-500 text-[11px] block mt-0.5">
                      {deliveryAddress}
                    </span>
                  )}
                </div>
              </div>

              {/* Uploaded files summary */}
              <div>
                <span className="text-slate-400 uppercase font-semibold text-[10px] block">
                  Attached Clearances
                </span>
                {files.length === 0 ? (
                  <span className="text-slate-500 italic mt-0.5 block">No files attached</span>
                ) : (
                  <ul className="mt-1 space-y-1">
                    {files.map((f, i) => (
                      <li key={i} className="text-slate-700 font-medium">
                        ✓ {f.name} ({(f.size / 1024).toFixed(1)} KB)
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Total Calculation */}
              <div className="p-4 bg-white rounded-lg border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block">
                    Document Assessment Fee
                  </span>
                  <span className="text-[11px] text-slate-400">
                    ₱{Number(selectedDoc?.fee).toFixed(2)} × {quantity} copy
                  </span>
                </div>
                <span className="text-xl font-black text-slate-900 font-mono">
                  ₱{totalFee.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 4. Footer Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          {step > 1 ? (
            <Button
              type="button"
              id="wizard-prev-btn"
              variant="secondary"
              size="sm"
              icon={ArrowLeft}
              disabled={submitting}
              onClick={handlePrevStep}
            >
              Previous
            </Button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <Button
              type="button"
              id="wizard-next-btn"
              variant="primary"
              size="md"
              icon={ArrowRight}
              onClick={handleNextStep}
            >
              Continue
            </Button>
          ) : (
            <Button
              type="button"
              id="wizard-submit-btn"
              variant="primary"
              size="md"
              icon={Send}
              loading={submitting}
              onClick={handleSubmit}
            >
              Submit Application
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
