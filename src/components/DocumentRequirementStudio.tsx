import React, { useState, useEffect } from 'react';
import { DocumentType, DocumentRequirement } from '../types';
import { documentService } from '../services/documentService';
import { Modal } from './Modal';
import { Button } from './Button';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
  Sparkles,
  Eye,
  Info,
  Check,
  X,
  FileCheck,
  HelpCircle,
} from 'lucide-react';

interface DocumentRequirementStudioProps {
  documentType: DocumentType | null;
  isOpen: boolean;
  onClose: () => void;
  onRequirementsChanged: () => void;
}

interface PresetRequirement {
  id: string;
  category: 'Clearance' | 'Identity' | 'Academic' | 'Financial';
  name: string;
  description: string;
  isMandatory: boolean;
  fileType: string;
  maxFileSizeMb: number;
  allowMultiple: boolean;
}

const UNIVERSITY_PRESETS: PresetRequirement[] = [
  {
    id: 'preset-student-id',
    category: 'Identity',
    name: 'Valid Student ID / Registration Card',
    description: 'Clear front and back photo/scan of your current semester validated student ID card or Certificate of Registration.',
    isMandatory: true,
    fileType: 'PDF, JPG, PNG',
    maxFileSizeMb: 10,
    allowMultiple: false,
  },
  {
    id: 'preset-library-clearance',
    category: 'Clearance',
    name: 'University Library Clearance',
    description: 'Signed clearance slip confirming no overdue books, unreturned journals, or unpaid library fines.',
    isMandatory: true,
    fileType: 'PDF, JPG, PNG',
    maxFileSizeMb: 10,
    allowMultiple: false,
  },
  {
    id: 'preset-accounting-clearance',
    category: 'Financial',
    name: 'Accounting & Cashier Clearance',
    description: 'Official assessment slip showing zero outstanding tuition balance or payment receipt of graduation fee.',
    isMandatory: true,
    fileType: 'PDF, JPG, PNG',
    maxFileSizeMb: 10,
    allowMultiple: false,
  },
  {
    id: 'preset-dean-endorsement',
    category: 'Clearance',
    name: "Dean / Department Head Endorsement",
    description: 'Academic clearance signed by Department Chairperson or College Dean certifying curriculum completion.',
    isMandatory: true,
    fileType: 'PDF, JPG, PNG',
    maxFileSizeMb: 10,
    allowMultiple: false,
  },
  {
    id: 'preset-affidavit-loss',
    category: 'Academic',
    name: 'Notarized Affidavit of Loss',
    description: 'Duly notarized legal affidavit stating the circumstances of the lost original diploma or credential.',
    isMandatory: true,
    fileType: 'PDF, JPG',
    maxFileSizeMb: 10,
    allowMultiple: false,
  },
  {
    id: 'preset-id-photo',
    category: 'Identity',
    name: 'Formal 2x2 ID Photo (White Background)',
    description: 'Recent studio photograph with plain white background, formal collared attire, and neutral facial expression.',
    isMandatory: true,
    fileType: 'JPG, PNG',
    maxFileSizeMb: 5,
    allowMultiple: false,
  },
  {
    id: 'preset-psa-birth-cert',
    category: 'Identity',
    name: 'PSA Birth Certificate (Original Copy Scan)',
    description: 'Clear scan of Philippine Statistics Authority (PSA) issued Certificate of Live Birth with readable SECPA security paper.',
    isMandatory: true,
    fileType: 'PDF, JPG, PNG',
    maxFileSizeMb: 10,
    allowMultiple: false,
  },
  {
    id: 'preset-form-137',
    category: 'Academic',
    name: 'High School Form 137 / SF10',
    description: 'Certified True Copy of Secondary Student Permanent Record with copy for university notation.',
    isMandatory: true,
    fileType: 'PDF, JPG, PNG',
    maxFileSizeMb: 15,
    allowMultiple: false,
  },
  {
    id: 'preset-honorable-dismissal',
    category: 'Academic',
    name: 'Honorable Dismissal / Transfer Credential',
    description: 'Original transfer credential or certificate of honorable dismissal from the previous tertiary institution.',
    isMandatory: true,
    fileType: 'PDF, JPG, PNG',
    maxFileSizeMb: 15,
    allowMultiple: false,
  },
  {
    id: 'preset-payment-receipt',
    category: 'Financial',
    name: 'Payment Receipt / Transaction Slip',
    description: 'Proof of fee payment via university cashier, bank deposit slip, or online payment gateway reference.',
    isMandatory: true,
    fileType: 'PDF, JPG, PNG',
    maxFileSizeMb: 10,
    allowMultiple: false,
  },
  {
    id: 'preset-authorization-rep',
    category: 'Identity',
    name: 'Authorization Letter & Representative ID',
    description: 'Signed letter of authorization with valid IDs of both the student and the authorized representative claiming the record.',
    isMandatory: true,
    fileType: 'PDF, JPG, PNG',
    maxFileSizeMb: 10,
    allowMultiple: true,
  },
  {
    id: 'preset-clinic-clearance',
    category: 'Clearance',
    name: 'University Clinic Health & Dental Clearance',
    description: 'Medical certificate and dental record clearance from the campus health services unit.',
    isMandatory: false,
    fileType: 'PDF, JPG, PNG',
    maxFileSizeMb: 10,
    allowMultiple: false,
  },
];

export const DocumentRequirementStudio: React.FC<DocumentRequirementStudioProps> = ({
  documentType,
  isOpen,
  onClose,
  onRequirementsChanged,
}) => {
  const [activeTab, setActiveTab] = useState<'LIST' | 'FORM' | 'PRESETS'>('LIST');
  const [requirements, setRequirements] = useState<DocumentRequirement[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const [editingReqId, setEditingReqId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formMandatory, setFormMandatory] = useState(true);
  const [formFileType, setFormFileType] = useState('PDF, JPG, PNG');
  const [formMaxSize, setFormMaxSize] = useState<number>(10);
  const [formAllowMultiple, setFormAllowMultiple] = useState(false);
  const [selectedPresetCategory, setSelectedPresetCategory] = useState<string>('ALL');

  useEffect(() => {
    if (documentType) {
      setRequirements(documentType.requirements || []);
      setFeedback(null);
      setActiveTab('LIST');
    }
  }, [documentType, isOpen]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  const handleOpenAddForm = () => {
    setEditingReqId(null);
    setFormName('');
    setFormDesc('');
    setFormMandatory(true);
    setFormFileType('PDF, JPG, PNG');
    setFormMaxSize(10);
    setFormAllowMultiple(false);
    setActiveTab('FORM');
  };

  const handleOpenEditForm = (req: DocumentRequirement) => {
    setEditingReqId(req.id);
    setFormName(req.requirement_name);
    setFormDesc(req.description || '');
    setFormMandatory(req.is_mandatory);
    setFormFileType(req.file_type || 'PDF, JPG, PNG');
    setFormMaxSize(req.max_file_size_mb || 10);
    setFormAllowMultiple(req.allow_multiple || false);
    setActiveTab('FORM');
  };

  const handleSaveRequirementForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentType || !formName.trim()) return;

    setSaving(true);
    try {
      if (editingReqId) {
        // Update existing requirement
        await documentService.updateRequirement(editingReqId, {
          requirement_name: formName.trim(),
          description: formDesc.trim() || null,
          is_mandatory: formMandatory,
          file_type: formFileType.trim() || 'PDF, JPG, PNG',
          max_file_size_mb: formMaxSize,
          allow_multiple: formAllowMultiple,
        });

        setRequirements((prev) =>
          prev.map((r) =>
            r.id === editingReqId
              ? {
                  ...r,
                  requirement_name: formName.trim(),
                  description: formDesc.trim() || null,
                  is_mandatory: formMandatory,
                  file_type: formFileType.trim() || 'PDF, JPG, PNG',
                  max_file_size_mb: formMaxSize,
                  allow_multiple: formAllowMultiple,
                }
              : r
          )
        );

        showNotification('success', `Updated requirement "${formName.trim()}"`);
      } else {
        // Create new requirement
        const created = await documentService.addRequirement(documentType.id, {
          requirement_name: formName.trim(),
          description: formDesc.trim() || null,
          is_mandatory: formMandatory,
          file_type: formFileType.trim() || 'PDF, JPG, PNG',
          max_file_size_mb: formMaxSize,
          allow_multiple: formAllowMultiple,
        });

        if (created) {
          setRequirements((prev) => [...prev, created]);
        }
        showNotification('success', `Added new requirement "${formName.trim()}"`);
      }

      onRequirementsChanged();
      setActiveTab('LIST');
    } catch (err: any) {
      console.error('Failed to save requirement:', err);
      showNotification('error', err.message || 'Failed to save requirement');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRequirement = async (reqId: string, reqName: string) => {
    if (!documentType) return;
    if (!window.confirm(`Are you sure you want to remove the requirement "${reqName}" from ${documentType.name}?`)) {
      return;
    }

    try {
      await documentService.deleteRequirement(reqId);
      setRequirements((prev) => prev.filter((r) => r.id !== reqId));
      onRequirementsChanged();
      showNotification('success', `Removed "${reqName}"`);
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to delete requirement');
    }
  };

  const handleToggleMandatory = async (req: DocumentRequirement) => {
    const updatedStatus = !req.is_mandatory;
    try {
      await documentService.updateRequirement(req.id, {
        is_mandatory: updatedStatus,
      });

      setRequirements((prev) =>
        prev.map((r) => (r.id === req.id ? { ...r, is_mandatory: updatedStatus } : r))
      );
      onRequirementsChanged();
      showNotification(
        'success',
        `"${req.requirement_name}" is now marked as ${updatedStatus ? 'Mandatory' : 'Optional'}`
      );
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to update status');
    }
  };

  const handleMoveOrder = async (index: number, direction: 'UP' | 'DOWN') => {
    if (!documentType) return;
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= requirements.length) return;

    const newReqs = [...requirements];
    const [moved] = newReqs.splice(index, 1);
    newReqs.splice(targetIndex, 0, moved);

    setRequirements(newReqs);

    try {
      await documentService.reorderRequirements(
        documentType.id,
        newReqs.map((r) => r.id)
      );
      onRequirementsChanged();
    } catch (err: any) {
      console.error('Failed to reorder requirements:', err);
    }
  };

  const handleAddPreset = async (preset: PresetRequirement) => {
    if (!documentType) return;

    // Check if duplicate name
    if (requirements.some((r) => r.requirement_name.toLowerCase() === preset.name.toLowerCase())) {
      showNotification('error', `Requirement "${preset.name}" is already configured for this document.`);
      return;
    }

    setSaving(true);
    try {
      const created = await documentService.addRequirement(documentType.id, {
        requirement_name: preset.name,
        description: preset.description,
        is_mandatory: preset.isMandatory,
        file_type: preset.fileType,
        max_file_size_mb: preset.maxFileSizeMb,
        allow_multiple: preset.allowMultiple,
      });

      if (created) {
        setRequirements((prev) => [...prev, created]);
      }
      onRequirementsChanged();
      showNotification('success', `Added "${preset.name}" from university presets`);
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to add preset');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !documentType) return null;

  const filteredPresets = UNIVERSITY_PRESETS.filter(
    (p) => selectedPresetCategory === 'ALL' || p.category === selectedPresetCategory
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Clearances & Requirements: ${documentType.name}`}
      subtitle={`Configure prerequisite documents and clearances required from students when requesting "${documentType.code}".`}
    >
      <div className="space-y-5">
        {/* Banner Feedback */}
        {feedback && (
          <div
            className={`p-3 rounded-xl flex items-center justify-between text-xs transition-all ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold'
                : 'bg-rose-50 border border-rose-200 text-rose-900 font-semibold'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="p-1 hover:bg-black/5 rounded text-slate-500"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-1">
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => setActiveTab('LIST')}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === 'LIST'
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Current Clearances</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-800 font-mono">
                {requirements.length}
              </span>
            </button>

            <button
              type="button"
              onClick={handleOpenAddForm}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === 'FORM'
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {editingReqId ? <Edit2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              <span>{editingReqId ? 'Edit Requirement' : 'Add Custom Requirement'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('PRESETS')}
              className={`px-3.5 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-2 ${
                activeTab === 'PRESETS'
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Preset Library</span>
            </button>
          </div>
        </div>

        {/* TAB 1: REQUIREMENTS LIST */}
        {activeTab === 'LIST' && (
          <div className="space-y-4">
            {requirements.length === 0 ? (
              <div className="text-center py-8 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 space-y-3">
                <FileText className="w-10 h-10 text-slate-400 mx-auto" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    No Clearances or Requirements Assigned
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                    Students can currently request this document without attaching prerequisite clearance files or identity proofs.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <Button size="sm" variant="primary" icon={Plus} onClick={handleOpenAddForm}>
                    Add First Requirement
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    icon={Sparkles}
                    onClick={() => setActiveTab('PRESETS')}
                  >
                    Use Preset Template
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {requirements.map((req, index) => (
                  <div
                    key={req.id}
                    className="p-4 bg-white border border-slate-200 hover:border-blue-300 rounded-xl shadow-2xs space-y-2.5 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start space-x-3">
                        {/* Order Index & Reorder Controls */}
                        <div className="flex flex-col items-center justify-center space-y-0.5 pt-0.5">
                          <span className="text-[10px] font-mono font-bold text-slate-400">#{index + 1}</span>
                          <div className="flex flex-col">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => handleMoveOrder(index, 'UP')}
                              className="p-0.5 text-slate-400 hover:text-blue-600 disabled:opacity-20 transition-colors"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={index === requirements.length - 1}
                              onClick={() => handleMoveOrder(index, 'DOWN')}
                              className="p-0.5 text-slate-400 hover:text-blue-600 disabled:opacity-20 transition-colors"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-1">
                          <div className="flex items-center flex-wrap gap-2">
                            <h4 className="font-bold text-slate-900 text-sm">{req.requirement_name}</h4>
                            <button
                              type="button"
                              onClick={() => handleToggleMandatory(req)}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-colors ${
                                req.is_mandatory
                                  ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                              }`}
                              title="Click to toggle Mandatory vs Optional"
                            >
                              {req.is_mandatory ? '★ Mandatory Requirement' : 'Optional Attachment'}
                            </button>
                          </div>

                          {req.description && (
                            <p className="text-xs text-slate-600 leading-relaxed">{req.description}</p>
                          )}

                          {/* Technical Specification Chips */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px] font-medium text-slate-500">
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                              Format: <strong>{req.file_type || 'PDF, JPG, PNG'}</strong>
                            </span>
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                              Limit: <strong>{req.max_file_size_mb || 10} MB</strong>
                            </span>
                            <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                              {req.allow_multiple ? 'Multiple files allowed' : 'Single file upload'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Menu */}
                      <div className="flex items-center space-x-1 shrink-0">
                        <Button
                          size="sm"
                          variant="secondary"
                          icon={Edit2}
                          onClick={() => handleOpenEditForm(req)}
                        >
                          Edit
                        </Button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRequirement(req.id, req.requirement_name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete requirement"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Actions Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 text-xs">
              <span className="text-slate-500">
                Total Clearances: <strong>{requirements.length}</strong> (
                {requirements.filter((r) => r.is_mandatory).length} Mandatory,{' '}
                {requirements.filter((r) => !r.is_mandatory).length} Optional)
              </span>

              <div className="flex items-center space-x-2">
                <Button size="sm" variant="secondary" icon={Sparkles} onClick={() => setActiveTab('PRESETS')}>
                  Browse Presets
                </Button>
                <Button size="sm" variant="primary" icon={Plus} onClick={handleOpenAddForm}>
                  Add Requirement
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ADD / EDIT FORM */}
        {activeTab === 'FORM' && (
          <form onSubmit={handleSaveRequirementForm} className="space-y-4">
            <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-200 text-xs text-blue-950 flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
              <p>
                {editingReqId
                  ? 'Editing this requirement will update what future and pending verification requests require from students.'
                  : 'Add a new mandatory or optional prerequisite clearance that students must upload when applying for this record.'}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Requirement Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Valid Student ID, Dean's Clearance, PSA Birth Certificate"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Instructions & Guidance for Student
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Please provide a clear, colored scan of front and back sides. Stamped signatures must be legible."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                {/* Allowed File Types */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Allowed File Formats
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PDF, JPG, PNG"
                    value={formFileType}
                    onChange={(e) => setFormFileType(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 font-mono"
                  />
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-[10px] text-slate-400">Quick:</span>
                    <button
                      type="button"
                      onClick={() => setFormFileType('PDF, JPG, PNG')}
                      className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded hover:bg-blue-100"
                    >
                      PDF & Images
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormFileType('PDF')}
                      className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded hover:bg-blue-100"
                    >
                      PDF Only
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormFileType('JPG, PNG')}
                      className="text-[10px] text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded hover:bg-blue-100"
                    >
                      Photos Only
                    </button>
                  </div>
                </div>

                {/* Maximum File Size */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Maximum File Upload Size
                  </label>
                  <select
                    value={formMaxSize}
                    onChange={(e) => setFormMaxSize(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 bg-white"
                  >
                    <option value={2}>2 MB (Light document/receipt)</option>
                    <option value={5}>5 MB (Standard photo)</option>
                    <option value={10}>10 MB (Recommended default)</option>
                    <option value={20}>20 MB (Multi-page PDF scan)</option>
                    <option value={50}>50 MB (High-resolution portfolio)</option>
                  </select>
                </div>
              </div>

              {/* Requirement Configuration Toggles */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 pt-3">
                <label className="flex items-center justify-between cursor-pointer text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">Mandatory Requirement</span>
                    <span className="text-[11px] text-slate-500">
                      Students cannot finalize their application without submitting this clearance.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formMandatory}
                    onChange={(e) => setFormMandatory(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </label>

                <div className="border-t border-slate-200 pt-2.5">
                  <label className="flex items-center justify-between cursor-pointer text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">Allow Multiple Files</span>
                      <span className="text-[11px] text-slate-500">
                        Permit uploading more than 1 file for this item (e.g. multi-page certificates).
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={formAllowMultiple}
                      onChange={(e) => setFormAllowMultiple(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </label>
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs space-y-1.5">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  Student Request Portal Preview:
                </span>
                <div className="p-2.5 bg-white rounded-lg border border-amber-200 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900">
                      {formName || 'Untitled Requirement'}
                    </span>
                    {formMandatory && <span className="text-rose-500 font-bold ml-1">*</span>}
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {formDesc || 'No instructions provided.'}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    {formFileType} (Max {formMaxSize}MB)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
              <Button type="button" variant="secondary" size="sm" onClick={() => setActiveTab('LIST')}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" loading={saving}>
                {editingReqId ? 'Update Requirement' : 'Add to Document'}
              </Button>
            </div>
          </form>
        )}

        {/* TAB 3: PRESET LIBRARY */}
        {activeTab === 'PRESETS' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="text-xs text-slate-500">
                Click <strong>+ Add</strong> on any standard university clearance to attach it instantly to {documentType.name}.
              </p>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-1">
                {(['ALL', 'Clearance', 'Identity', 'Academic', 'Financial'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedPresetCategory(cat)}
                    className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-colors ${
                      selectedPresetCategory === cat
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
              {filteredPresets.map((preset) => {
                const isAlreadyAdded = requirements.some(
                  (r) => r.requirement_name.toLowerCase() === preset.name.toLowerCase()
                );

                return (
                  <div
                    key={preset.id}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-2 transition-all ${
                      isAlreadyAdded
                        ? 'bg-slate-50 border-slate-200 opacity-60'
                        : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-2xs'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider font-mono">
                          {preset.category}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            preset.isMandatory ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {preset.isMandatory ? 'Mandatory' : 'Optional'}
                        </span>
                      </div>

                      <h5 className="font-bold text-slate-900 text-xs leading-snug">{preset.name}</h5>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{preset.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px]">
                      <span className="text-slate-400 font-mono">{preset.fileType}</span>

                      {isAlreadyAdded ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Added
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAddPreset(preset)}
                          disabled={saving}
                          className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white font-bold rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Add Requirement
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <span className="text-xs text-slate-400">
                Showing {filteredPresets.length} clearance templates
              </span>
              <Button size="sm" variant="secondary" onClick={() => setActiveTab('LIST')}>
                Back to Clearances List
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
