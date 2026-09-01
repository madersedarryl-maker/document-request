import React, { useState, useEffect, useMemo } from 'react';
import { DocumentType, DocumentRequirement } from '../types';
import { documentService } from '../services/documentService';
import { Button } from './Button';
import { Modal } from './Modal';
import {
  REGISTRAR_DOCUMENT_PRESETS,
  SpecificDocumentPreset,
  PURPOSE_OPTIONS,
  RELEASE_METHOD_OPTIONS,
  STUDENT_STATUS_OPTIONS,
  ConditionalRuleConfig,
  formatConditionalRuleSummary,
  parseConditionalRule,
  evaluateRequirementVisibility,
  StudentRequestContext,
} from '../utils/conditionalRules';
import {
  ShieldCheck,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Layers,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileText,
  SlidersHorizontal,
  Info,
  Filter,
  Check,
  X,
  FileCheck,
  Search,
  HelpCircle,
  Play,
  RotateCcw,
  Zap,
  Tag,
  Copy,
  ChevronRight,
  Clock,
  DollarSign,
  ToggleLeft,
  ToggleRight,
  CheckSquare,
  Square,
} from 'lucide-react';

interface RequirementConfigurationViewProps {
  documentTypes: DocumentType[];
  selectedDocTypeId?: string | null;
  onDocTypeSelected?: (id: string) => void;
  onRefresh: () => void;
}

export const RequirementConfigurationView: React.FC<RequirementConfigurationViewProps> = ({
  documentTypes,
  selectedDocTypeId,
  onDocTypeSelected,
  onRefresh,
}) => {
  // Search query for document type list in master sidebar
  const [docSearchQuery, setDocSearchQuery] = useState('');

  // Selected Document Type
  const [activeDocTypeId, setActiveDocTypeId] = useState<string>(
    selectedDocTypeId || (documentTypes.length > 0 ? documentTypes[0].id : '')
  );

  // Sync if prop changes
  useEffect(() => {
    if (selectedDocTypeId) {
      setActiveDocTypeId(selectedDocTypeId);
    } else if (documentTypes.length > 0 && !activeDocTypeId) {
      setActiveDocTypeId(documentTypes[0].id);
    }
  }, [selectedDocTypeId, documentTypes]);

  const activeDocType = useMemo(() => {
    return documentTypes.find((d) => d.id === activeDocTypeId) || documentTypes[0] || null;
  }, [documentTypes, activeDocTypeId]);

  const requirements = useMemo(() => {
    return activeDocType?.requirements || [];
  }, [activeDocType]);

  // Filtered Document Types for Master Sidebar
  const filteredDocTypes = useMemo(() => {
    if (!docSearchQuery.trim()) return documentTypes;
    const q = docSearchQuery.toLowerCase();
    return documentTypes.filter(
      (d) => d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q)
    );
  }, [documentTypes, docSearchQuery]);

  // Notifications
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  // State for Add/Edit Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingReq, setEditingReq] = useState<DocumentRequirement | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formMandatory, setFormMandatory] = useState(true);
  const [formFileType, setFormFileType] = useState('PDF, JPG, PNG');
  const [formMaxSize, setFormMaxSize] = useState<number>(10);
  const [formAllowMultiple, setFormAllowMultiple] = useState(false);

  // Conditional Rule in form
  const [ruleType, setRuleType] = useState<ConditionalRuleConfig['type']>('ALWAYS');
  const [ruleOperator, setRuleOperator] = useState<ConditionalRuleConfig['operator']>('EQUALS');
  const [ruleValue, setRuleValue] = useState<string>('ALL');
  const [ruleCustomDesc, setRuleCustomDesc] = useState<string>('');

  // Preset Drawer / Modal
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [presetCategory, setPresetCategory] = useState<string>('ALL');
  const [presetSearch, setPresetSearch] = useState<string>('');

  // Live Student Request Simulator Sandbox
  const [showSimulator, setShowSimulator] = useState(false);
  const [simPurpose, setSimPurpose] = useState<string>(PURPOSE_OPTIONS[0]);
  const [simReleaseMethod, setSimReleaseMethod] = useState<string>(RELEASE_METHOD_OPTIONS[0].value);
  const [simStudentStatus, setSimStudentStatus] = useState<string>(STUDENT_STATUS_OPTIONS[0]);
  const [simPriority, setSimPriority] = useState<'NORMAL' | 'HIGH'>('NORMAL');

  const [saving, setSaving] = useState(false);

  const handleSelectDocType = (id: string) => {
    setActiveDocTypeId(id);
    if (onDocTypeSelected) onDocTypeSelected(id);
  };

  // Open Create Modal
  const openCreateModal = () => {
    setEditingReq(null);
    setFormName('');
    setFormDesc('');
    setFormMandatory(true);
    setFormFileType('PDF, JPG, PNG');
    setFormMaxSize(10);
    setFormAllowMultiple(false);
    setRuleType('ALWAYS');
    setRuleOperator('EQUALS');
    setRuleValue('ALL');
    setRuleCustomDesc('');
    setIsEditModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (req: DocumentRequirement) => {
    setEditingReq(req);
    setFormName(req.requirement_name);
    setFormDesc(req.description || '');
    setFormMandatory(req.is_mandatory);
    setFormFileType(req.file_type || 'PDF, JPG, PNG');
    setFormMaxSize(req.max_file_size_mb || 10);
    setFormAllowMultiple(req.allow_multiple || false);

    const parsedRule = parseConditionalRule(req.conditional_rule);
    if (parsedRule) {
      setRuleType(parsedRule.type);
      setRuleOperator(parsedRule.operator);
      setRuleValue(Array.isArray(parsedRule.value) ? parsedRule.value[0] : parsedRule.value);
      setRuleCustomDesc(parsedRule.description || '');
    } else {
      setRuleType('ALWAYS');
      setRuleOperator('EQUALS');
      setRuleValue('ALL');
      setRuleCustomDesc('');
    }

    setIsEditModalOpen(true);
  };

  // Save Requirement
  const handleSaveRequirement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDocType || !formName.trim()) return;

    setSaving(true);

    let conditionalRuleString: string | null = null;
    if (ruleType !== 'ALWAYS') {
      const ruleObj: ConditionalRuleConfig = {
        type: ruleType,
        operator: ruleOperator,
        value: ruleValue,
        description:
          ruleCustomDesc ||
          `Triggered when ${ruleType.toLowerCase().replace('_', ' ')} ${ruleOperator.toLowerCase()} "${ruleValue}"`,
      };
      conditionalRuleString = JSON.stringify(ruleObj);
    }

    try {
      if (editingReq) {
        await documentService.updateRequirement(editingReq.id, {
          requirement_name: formName.trim(),
          description: formDesc.trim() || null,
          is_mandatory: formMandatory,
          file_type: formFileType.trim() || 'PDF, JPG, PNG',
          max_file_size_mb: formMaxSize,
          allow_multiple: formAllowMultiple,
          conditional_rule: conditionalRuleString,
        });
        showFeedback('success', `Updated requirement "${formName.trim()}"`);
      } else {
        await documentService.addRequirement(activeDocType.id, {
          requirement_name: formName.trim(),
          description: formDesc.trim() || null,
          is_mandatory: formMandatory,
          file_type: formFileType.trim() || 'PDF, JPG, PNG',
          max_file_size_mb: formMaxSize,
          allow_multiple: formAllowMultiple,
          conditional_rule: conditionalRuleString,
        });
        showFeedback('success', `Added new requirement "${formName.trim()}"`);
      }

      onRefresh();
      setIsEditModalOpen(false);
    } catch (err: any) {
      console.error('Failed to save requirement:', err);
      showFeedback('error', err.message || 'Failed to save requirement');
    } finally {
      setSaving(false);
    }
  };

  // Direct Toggle Mandatory
  const handleToggleMandatory = async (req: DocumentRequirement) => {
    const nextVal = !req.is_mandatory;
    try {
      await documentService.updateRequirement(req.id, {
        is_mandatory: nextVal,
      });
      onRefresh();
      showFeedback(
        'success',
        `"${req.requirement_name}" is now marked as ${nextVal ? 'Required (Mandatory)' : 'Optional Attachment'}`
      );
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to update required status');
    }
  };

  // Direct Toggle Conditional Rule (Quick switch between Always and Default Conditional)
  const handleToggleConditional = async (req: DocumentRequirement) => {
    const parsed = parseConditionalRule(req.conditional_rule);
    const isCurrentlyConditional = parsed && parsed.type !== 'ALWAYS';

    let nextRule: string | null = null;
    if (!isCurrentlyConditional) {
      // Switch to default Purpose conditional rule
      const ruleObj: ConditionalRuleConfig = {
        type: 'PURPOSE',
        operator: 'CONTAINS',
        value: PURPOSE_OPTIONS[0],
        description: `Triggered when purpose is ${PURPOSE_OPTIONS[0]}`,
      };
      nextRule = JSON.stringify(ruleObj);
    } else {
      // Switch back to Always Required
      nextRule = null;
    }

    try {
      await documentService.updateRequirement(req.id, {
        conditional_rule: nextRule,
      });
      onRefresh();
      showFeedback(
        'success',
        `"${req.requirement_name}" visibility rule toggled to ${
          nextRule ? 'Conditional' : 'Always Required'
        }`
      );
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to toggle conditional rule');
    }
  };

  // Delete Requirement
  const handleDeleteRequirement = async (req: DocumentRequirement) => {
    if (!window.confirm(`Are you sure you want to remove "${req.requirement_name}" from ${activeDocType?.name}?`)) {
      return;
    }

    try {
      await documentService.deleteRequirement(req.id);
      onRefresh();
      showFeedback('success', `Removed requirement "${req.requirement_name}"`);
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to delete requirement');
    }
  };

  // Move Order
  const handleMoveOrder = async (index: number, direction: 'UP' | 'DOWN') => {
    if (!activeDocType) return;
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= requirements.length) return;

    const newReqs = [...requirements];
    const [moved] = newReqs.splice(index, 1);
    newReqs.splice(targetIndex, 0, moved);

    try {
      await documentService.reorderRequirements(
        activeDocType.id,
        newReqs.map((r) => r.id)
      );
      onRefresh();
    } catch (err: any) {
      console.error('Failed to reorder requirements:', err);
    }
  };

  // Add Preset to Active Document
  const handleAddPreset = async (preset: SpecificDocumentPreset) => {
    if (!activeDocType) return;

    const isDuplicate = requirements.some(
      (r) => r.requirement_name.toLowerCase() === preset.name.toLowerCase()
    );

    if (isDuplicate) {
      showFeedback('error', `"${preset.name}" is already configured for this document.`);
      return;
    }

    setSaving(true);
    try {
      await documentService.addRequirement(activeDocType.id, {
        requirement_name: preset.name,
        description: preset.description,
        is_mandatory: preset.isMandatory,
        file_type: preset.fileType,
        max_file_size_mb: preset.maxFileSizeMb,
        allow_multiple: preset.allowMultiple,
        conditional_rule: preset.conditionalRule ? JSON.stringify(preset.conditionalRule) : null,
      });

      onRefresh();
      showFeedback('success', `Added "${preset.name}" from university presets.`);
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to add preset requirement.');
    } finally {
      setSaving(false);
    }
  };

  // Apply Standard Recommended Registrar Package
  const handleApplyStandardPackage = async () => {
    if (!activeDocType) return;
    if (
      !window.confirm(
        `Apply Standard Registrar Clearance Pack (School ID + Official Payment Proof + Library Clearance) to ${activeDocType.name}?`
      )
    ) {
      return;
    }

    const standardIds = ['preset-school-id', 'preset-payment-proof', 'preset-library-clearance'];
    const toAdd = REGISTRAR_DOCUMENT_PRESETS.filter((p) => standardIds.includes(p.id));

    setSaving(true);
    let count = 0;
    for (const preset of toAdd) {
      const exists = requirements.some(
        (r) => r.requirement_name.toLowerCase() === preset.name.toLowerCase()
      );
      if (!exists) {
        await documentService.addRequirement(activeDocType.id, {
          requirement_name: preset.name,
          description: preset.description,
          is_mandatory: preset.isMandatory,
          file_type: preset.fileType,
          max_file_size_mb: preset.maxFileSizeMb,
          allow_multiple: preset.allowMultiple,
          conditional_rule: preset.conditionalRule ? JSON.stringify(preset.conditionalRule) : null,
        });
        count++;
      }
    }
    setSaving(false);
    onRefresh();
    showFeedback('success', `Applied Standard Registrar Pack (${count} new clearances added).`);
  };

  // Filtered Presets
  const filteredPresets = useMemo(() => {
    return REGISTRAR_DOCUMENT_PRESETS.filter((p) => {
      const matchCat = presetCategory === 'ALL' || p.category === presetCategory;
      const matchSearch =
        !presetSearch ||
        p.name.toLowerCase().includes(presetSearch.toLowerCase()) ||
        p.description.toLowerCase().includes(presetSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [presetCategory, presetSearch]);

  // Simulation Evaluation
  const simContext: StudentRequestContext = useMemo(() => {
    return {
      purpose: simPurpose,
      release_method: simReleaseMethod,
      student_status: simStudentStatus,
      priority: simPriority,
    };
  }, [simPurpose, simReleaseMethod, simStudentStatus, simPriority]);

  const simulatedVisibleReqs = useMemo(() => {
    return requirements.filter((r) => evaluateRequirementVisibility(r, simContext));
  }, [requirements, simContext]);

  // Stats for the active document
  const stats = useMemo(() => {
    const total = requirements.length;
    const mandatory = requirements.filter((r) => r.is_mandatory).length;
    const optional = total - mandatory;
    const conditional = requirements.filter((r) => {
      const parsed = parseConditionalRule(r.conditional_rule);
      return parsed && parsed.type !== 'ALWAYS';
    }).length;
    return { total, mandatory, optional, conditional };
  }, [requirements]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl flex items-center justify-between text-xs transition-all shadow-2xs ${
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

      {/* MASTER-DETAIL MANAGEMENT SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: LIST OF EXISTING DOCUMENT TYPES */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Document Types ({documentTypes.length})
              </h3>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">Select to configure</span>
          </div>

          {/* Search Box for Documents */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search document type..."
              value={docSearchQuery}
              onChange={(e) => setDocSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none transition-colors"
            />
          </div>

          {/* Vertical Document List */}
          <div className="space-y-1.5 max-h-[580px] overflow-y-auto pr-1 scrollbar-thin">
            {filteredDocTypes.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No matching documents found
              </div>
            ) : (
              filteredDocTypes.map((doc) => {
                const isSelected = doc.id === activeDocTypeId;
                const reqCount = (doc.requirements || []).length;
                const mandCount = (doc.requirements || []).filter((r) => r.is_mandatory).length;
                const condCount = (doc.requirements || []).filter((r) => {
                  const p = parseConditionalRule(r.conditional_rule);
                  return p && p.type !== 'ALWAYS';
                }).length;

                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => handleSelectDocType(doc.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all border flex items-center justify-between group ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-500 shadow-2xs text-blue-950'
                        : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <div className="space-y-1 min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {doc.code}
                        </span>
                        <span className="font-bold text-xs truncate block">{doc.name}</span>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <span className="font-mono font-semibold">₱{Number(doc.fee).toFixed(0)}</span>
                        <span>•</span>
                        <span className="font-medium">{doc.processing_days}d</span>
                        <span>•</span>
                        <span
                          className={`font-semibold ${
                            reqCount > 0 ? 'text-blue-700 font-bold' : 'text-slate-400 italic'
                          }`}
                        >
                          {reqCount} {reqCount === 1 ? 'req' : 'reqs'} ({mandCount} mand
                          {condCount > 0 ? `, ${condCount} cond` : ''})
                        </span>
                      </div>
                    </div>

                    <ChevronRight
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isSelected ? 'text-blue-600 translate-x-0.5' : 'text-slate-300 group-hover:text-slate-400'
                      }`}
                    />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: REQUIREMENT DEFINITIONS & RULES WORKSPACE */}
        <div className="lg:col-span-8 space-y-4">
          {activeDocType ? (
            <>
              {/* Active Document Header Card */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold font-mono text-xs">
                        {activeDocType.code}
                      </span>
                      <h3 className="text-base font-bold text-slate-900">{activeDocType.name}</h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          activeDocType.is_active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {activeDocType.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 max-w-xl">
                      {activeDocType.description ||
                        'Configure mandatory verification documents, proof of identity, cashier slips, and conditional visibility rules.'}
                    </p>
                  </div>

                  {/* Actions Header */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={Play}
                      onClick={() => setShowSimulator(!showSimulator)}
                      className={showSimulator ? 'bg-amber-50 text-amber-800 border-amber-300' : ''}
                    >
                      {showSimulator ? 'Hide Test' : 'Test Student View'}
                    </Button>

                    <Button
                      size="sm"
                      variant="secondary"
                      icon={Sparkles}
                      onClick={() => setIsPresetModalOpen(true)}
                    >
                      Presets
                    </Button>

                    <Button
                      size="sm"
                      variant="primary"
                      icon={Plus}
                      onClick={openCreateModal}
                    >
                      Add Requirement
                    </Button>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Total Reqs
                    </span>
                    <span className="text-lg font-bold text-slate-900 mt-0.5 block font-mono">
                      {stats.total}
                    </span>
                  </div>

                  <div className="p-2.5 bg-rose-50/60 rounded-xl border border-rose-200 text-rose-950">
                    <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
                      ★ Required
                    </span>
                    <span className="text-lg font-bold text-rose-900 mt-0.5 block font-mono">
                      {stats.mandatory}
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-800">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Optional
                    </span>
                    <span className="text-lg font-bold text-slate-900 mt-0.5 block font-mono">
                      {stats.optional}
                    </span>
                  </div>

                  <div className="p-2.5 bg-amber-50/60 rounded-xl border border-amber-200 text-amber-950">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                      ⚡ Conditional
                    </span>
                    <span className="text-lg font-bold text-amber-900 mt-0.5 block font-mono">
                      {stats.conditional}
                    </span>
                  </div>
                </div>
              </div>

              {/* LIVE SIMULATOR SANDBOX */}
              {showSimulator && (
                <div className="bg-amber-50/60 border-2 border-amber-200 rounded-2xl p-4 shadow-2xs space-y-3 transition-all">
                  <div className="flex items-center justify-between border-b border-amber-200/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                        <Play className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Live Student View Simulator
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Test which requirements are shown when a student selects specific options.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowSimulator(false)}
                      className="text-xs text-slate-400 hover:text-slate-700 font-semibold"
                    >
                      ✕ Close
                    </button>
                  </div>

                  {/* Simulator Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-white p-3 rounded-xl border border-amber-200">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Purpose:
                      </label>
                      <select
                        value={simPurpose}
                        onChange={(e) => setSimPurpose(e.target.value)}
                        className="w-full text-xs p-1.5 rounded-lg border border-slate-300 font-semibold bg-white"
                      >
                        {PURPOSE_OPTIONS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Claim Method:
                      </label>
                      <select
                        value={simReleaseMethod}
                        onChange={(e) => setSimReleaseMethod(e.target.value)}
                        className="w-full text-xs p-1.5 rounded-lg border border-slate-300 font-semibold bg-white"
                      >
                        {RELEASE_METHOD_OPTIONS.map((m) => (
                          <option key={m.value} value={m.value}>
                            {m.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Status:
                      </label>
                      <select
                        value={simStudentStatus}
                        onChange={(e) => setSimStudentStatus(e.target.value)}
                        className="w-full text-xs p-1.5 rounded-lg border border-slate-300 font-semibold bg-white"
                      >
                        {STUDENT_STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Simulated Output List */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-800 block">
                      Active Checklist for Student ({simulatedVisibleReqs.length} Visible):
                    </span>

                    {simulatedVisibleReqs.length === 0 ? (
                      <div className="p-3 bg-white rounded-xl border border-dashed border-amber-300 text-center text-xs text-slate-400">
                        No requirements match this combination.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {simulatedVisibleReqs.map((req) => (
                          <div
                            key={req.id}
                            className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs space-y-1 shadow-2xs"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 truncate">{req.requirement_name}</span>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                                  req.is_mandatory
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {req.is_mandatory ? '★ Required' : 'Optional'}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              {req.file_type || 'PDF, JPG, PNG'} (Max {req.max_file_size_mb || 10}MB)
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* REQUIREMENTS DEFINITIONS LIST */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Configured Requirement Definitions
                    </h4>
                    <p className="text-xs text-slate-500">
                      Toggle Required or Conditional definitions directly, or click Edit for granular rules.
                    </p>
                  </div>

                  {requirements.length === 0 && (
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={Sparkles}
                      onClick={handleApplyStandardPackage}
                      loading={saving}
                    >
                      Apply Standard Pack
                    </Button>
                  )}
                </div>

                {requirements.length === 0 ? (
                  <div className="text-center py-12 px-4 space-y-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="space-y-1 max-w-md mx-auto">
                      <h5 className="text-sm font-bold text-slate-900">
                        No Requirements Configured for {activeDocType.name}
                      </h5>
                      <p className="text-xs text-slate-500">
                        Students can currently submit requests without uploading identification, cashier payment slips, or department clearances.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="primary"
                        icon={Plus}
                        onClick={openCreateModal}
                      >
                        Add Custom Requirement
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={Sparkles}
                        onClick={() => setIsPresetModalOpen(true)}
                      >
                        Browse Presets
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={Zap}
                        onClick={handleApplyStandardPackage}
                        loading={saving}
                      >
                        Apply Standard Pack
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {requirements.map((req, index) => {
                      const ruleInfo = formatConditionalRuleSummary(req.conditional_rule);
                      const parsedRule = parseConditionalRule(req.conditional_rule);
                      const isConditional = parsedRule && parsedRule.type !== 'ALWAYS';

                      return (
                        <div
                          key={req.id}
                          className="p-4 hover:bg-slate-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          {/* Left: Order, Requirement details */}
                          <div className="flex items-start space-x-3 min-w-0">
                            {/* Order Controls */}
                            <div className="flex flex-col items-center justify-center space-y-0.5 pt-1 shrink-0">
                              <span className="text-[10px] font-mono font-bold text-slate-400">
                                #{index + 1}
                              </span>
                              <div className="flex flex-col">
                                <button
                                  type="button"
                                  disabled={index === 0}
                                  onClick={() => handleMoveOrder(index, 'UP')}
                                  className="p-0.5 text-slate-400 hover:text-blue-600 disabled:opacity-20 transition-colors"
                                  title="Move up"
                                >
                                  <ArrowUp className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  disabled={index === requirements.length - 1}
                                  onClick={() => handleMoveOrder(index, 'DOWN')}
                                  className="p-0.5 text-slate-400 hover:text-blue-600 disabled:opacity-20 transition-colors"
                                  title="Move down"
                                >
                                  <ArrowDown className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Details */}
                            <div className="space-y-1.5 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h5 className="font-bold text-slate-900 text-sm">
                                  {req.requirement_name}
                                </h5>

                                {/* Direct Toggle Required / Optional */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleMandatory(req)}
                                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition-all flex items-center gap-1 cursor-pointer ${
                                    req.is_mandatory
                                      ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                  }`}
                                  title="Click to toggle Required vs Optional"
                                >
                                  {req.is_mandatory ? (
                                    <>
                                      <CheckSquare className="w-3 h-3 text-rose-600" />
                                      <span>Required</span>
                                    </>
                                  ) : (
                                    <>
                                      <Square className="w-3 h-3 text-slate-400" />
                                      <span>Optional</span>
                                    </>
                                  )}
                                </button>

                                {/* Direct Toggle Conditional / Always */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleConditional(req)}
                                  className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-md border flex items-center gap-1 transition-all cursor-pointer ${
                                    isConditional
                                      ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                                  }`}
                                  title="Click to toggle Conditional vs Always Required"
                                >
                                  <SlidersHorizontal className="w-3 h-3" />
                                  <span>{isConditional ? ruleInfo.label : 'Always Required'}</span>
                                </button>
                              </div>

                              {req.description && (
                                <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                                  {req.description}
                                </p>
                              )}

                              {/* Technical metadata */}
                              <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 font-medium pt-0.5">
                                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-mono">
                                  {req.file_type || 'PDF, JPG, PNG'}
                                </span>
                                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-mono">
                                  Max: {req.max_file_size_mb || 10} MB
                                </span>
                                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                                  {req.allow_multiple ? 'Multiple files allowed' : 'Single file'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right: Actions */}
                          <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                            <Button
                              size="sm"
                              variant="secondary"
                              icon={Edit2}
                              onClick={() => openEditModal(req)}
                            >
                              Edit
                            </Button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRequirement(req)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                              title="Remove requirement"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
              Select a document type on the left to configure requirement definitions.
            </div>
          )}
        </div>
      </div>

      {/* CREATE / EDIT REQUIREMENT MODAL */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={editingReq ? `Edit Requirement: ${editingReq.requirement_name}` : `Add Requirement to ${activeDocType?.name}`}
        subtitle="Configure verification properties, mandatory status, and conditional visibility rules."
      >
        <form onSubmit={handleSaveRequirement} className="space-y-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Requirement Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Valid School ID / COR, Payment Proof, Notarized Affidavit of Loss"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Instructions & Guidance for Students
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Provide a clear, colored scan of front and back sides. Registrar dry seals or stamps must be clearly legible."
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* REQUIRED STATUS & MULTI-FILE TOGGLES */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <label className="flex items-center justify-between cursor-pointer text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">Required (Mandatory Clearance)</span>
                  <span className="text-[11px] text-slate-500">
                    If enabled, student cannot finalize application without uploading this document.
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
                      Permit uploading more than 1 file (e.g., front/back ID or multi-page clearances).
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

            {/* CONDITIONAL VISIBILITY RULE BUILDER */}
            <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200 space-y-3">
              <div className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Conditional Visibility Rules
                </span>
              </div>
              <p className="text-[11px] text-amber-800">
                Choose when this requirement should be presented to the student during application.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Condition Trigger:
                  </label>
                  <select
                    value={ruleType}
                    onChange={(e) => {
                      const t = e.target.value as ConditionalRuleConfig['type'];
                      setRuleType(t);
                      if (t === 'PURPOSE') setRuleValue(PURPOSE_OPTIONS[0]);
                      else if (t === 'RELEASE_METHOD') setRuleValue(RELEASE_METHOD_OPTIONS[1].value);
                      else if (t === 'STUDENT_STATUS') setRuleValue(STUDENT_STATUS_OPTIONS[1]);
                      else setRuleValue('ALL');
                    }}
                    className="w-full text-xs p-2 rounded-lg border border-amber-300 focus:ring-2 focus:ring-amber-500 bg-white font-semibold"
                  >
                    <option value="ALWAYS">🌐 Always Visible (All Applicants)</option>
                    <option value="PURPOSE">🎯 Only for Specific Request Purpose</option>
                    <option value="RELEASE_METHOD">📦 Only for Specific Claim / Release Method</option>
                    <option value="STUDENT_STATUS">🎓 Only for Specific Academic Standing</option>
                    <option value="PRIORITY">⚡ Only for Rush / Express Processing</option>
                  </select>
                </div>

                {/* Value Selector based on Type */}
                {ruleType === 'PURPOSE' && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Triggered When Purpose Is:
                    </label>
                    <select
                      value={ruleValue}
                      onChange={(e) => setRuleValue(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-amber-300 focus:ring-2 focus:ring-amber-500 bg-white font-semibold"
                    >
                      {PURPOSE_OPTIONS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {ruleType === 'RELEASE_METHOD' && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Triggered When Release Method Is:
                    </label>
                    <select
                      value={ruleValue}
                      onChange={(e) => setRuleValue(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-amber-300 focus:ring-2 focus:ring-amber-500 bg-white font-semibold"
                    >
                      {RELEASE_METHOD_OPTIONS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {ruleType === 'STUDENT_STATUS' && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Triggered When Status Is:
                    </label>
                    <select
                      value={ruleValue}
                      onChange={(e) => setRuleValue(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-amber-300 focus:ring-2 focus:ring-amber-500 bg-white font-semibold"
                    >
                      {STUDENT_STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* FORMAT & SIZE SPECIFICATIONS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
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
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 font-mono"
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

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Maximum File Size Limit
                </label>
                <select
                  value={formMaxSize}
                  onChange={(e) => setFormMaxSize(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 bg-white"
                >
                  <option value={2}>2 MB (Light receipt / voucher)</option>
                  <option value={5}>5 MB (Standard photo)</option>
                  <option value={10}>10 MB (Recommended default)</option>
                  <option value={20}>20 MB (Multi-page PDF scan)</option>
                  <option value={50}>50 MB (Comprehensive dossier)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={saving}>
              {editingReq ? 'Save Changes' : 'Add to Record'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* PRESET LIBRARY MODAL */}
      <Modal
        isOpen={isPresetModalOpen}
        onClose={() => setIsPresetModalOpen(false)}
        title="University Clearance & Document Presets"
        subtitle={`Select from standard Philippine registrar clearances to attach instantly to ${activeDocType?.name}.`}
      >
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search presets (e.g. School ID, Payment Proof, Affidavit)..."
                value={presetSearch}
                onChange={(e) => setPresetSearch(e.target.value)}
                className="w-full text-xs pl-8 p-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {(['ALL', 'Identity', 'Financial', 'Clearance', 'Academic', 'Legal'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setPresetCategory(cat)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-colors whitespace-nowrap ${
                    presetCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Preset Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
            {filteredPresets.map((preset) => {
              const isAlreadyAdded = requirements.some(
                (r) => r.requirement_name.toLowerCase() === preset.name.toLowerCase()
              );

              return (
                <div
                  key={preset.id}
                  className={`p-3 rounded-xl border text-xs flex flex-col justify-between space-y-2 transition-all ${
                    isAlreadyAdded
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-2xs'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-1">
                      <span className="font-bold text-slate-900 text-xs leading-snug">
                        {preset.name}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0 ${
                          preset.category === 'Identity'
                            ? 'bg-blue-50 text-blue-700'
                            : preset.category === 'Financial'
                            ? 'bg-emerald-50 text-emerald-700'
                            : preset.category === 'Clearance'
                            ? 'bg-purple-50 text-purple-700'
                            : preset.category === 'Academic'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {preset.category}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {preset.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400 pt-1">
                      <span className="font-mono">{preset.fileType}</span>
                      <span>•</span>
                      <span>Max {preset.maxFileSizeMb}MB</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold ${
                        preset.isMandatory ? 'text-rose-600' : 'text-slate-500'
                      }`}
                    >
                      {preset.isMandatory ? '★ Mandatory' : 'Optional'}
                    </span>

                    <Button
                      size="sm"
                      variant={isAlreadyAdded ? 'secondary' : 'primary'}
                      disabled={isAlreadyAdded}
                      onClick={() => handleAddPreset(preset)}
                      loading={saving}
                    >
                      {isAlreadyAdded ? 'Added' : 'Add Preset'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex items-center justify-end">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsPresetModalOpen(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
