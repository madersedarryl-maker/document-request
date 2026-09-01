import React, { useState, useMemo } from 'react';
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
} from '../utils/conditionalRules';
import {
  ShieldCheck,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  SlidersHorizontal,
  Info,
  X,
  Zap,
  CheckSquare,
  Square,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Sliders,
  FileText,
  Copy,
} from 'lucide-react';

interface NestedDocumentRequirementManagerProps {
  documentType: DocumentType;
  onRefresh: () => void;
  isCompact?: boolean;
}

export const NestedDocumentRequirementManager: React.FC<NestedDocumentRequirementManagerProps> = ({
  documentType,
  onRefresh,
  isCompact = false,
}) => {
  const requirements = useMemo(() => {
    return documentType.requirements || [];
  }, [documentType]);

  // Inline Quick Add State
  const [isAddingInline, setIsAddingInline] = useState(false);
  const [inlineName, setInlineName] = useState('');
  const [inlineDesc, setInlineDesc] = useState('');
  const [inlineMandatory, setInlineMandatory] = useState(true);
  const [inlineRuleType, setInlineRuleType] = useState<ConditionalRuleConfig['type']>('ALWAYS');
  const [inlineRuleValue, setInlineRuleValue] = useState<string>('ALL');
  const [inlineFileType, setInlineFileType] = useState('PDF, JPG, PNG');
  const [inlineMaxSize, setInlineMaxSize] = useState<number>(10);
  const [inlineAllowMultiple, setInlineAllowMultiple] = useState(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingReq, setEditingReq] = useState<DocumentRequirement | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formMandatory, setFormMandatory] = useState(true);
  const [formFileType, setFormFileType] = useState('PDF, JPG, PNG');
  const [formMaxSize, setFormMaxSize] = useState<number>(10);
  const [formAllowMultiple, setFormAllowMultiple] = useState(false);

  // Conditional Rule state for Edit modal
  const [ruleType, setRuleType] = useState<ConditionalRuleConfig['type']>('ALWAYS');
  const [ruleOperator, setRuleOperator] = useState<ConditionalRuleConfig['operator']>('EQUALS');
  const [ruleValue, setRuleValue] = useState<string>('ALL');
  const [ruleCustomDesc, setRuleCustomDesc] = useState<string>('');

  // Preset Selector Modal
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [presetCategory, setPresetCategory] = useState<string>('ALL');

  // Condition Popover / Quick Edit State
  const [activeConditionReqId, setActiveConditionReqId] = useState<string | null>(null);

  // Operation state & notifications
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  // Toggle Mandatory (Required vs Optional)
  const handleToggleMandatory = async (req: DocumentRequirement) => {
    const nextVal = !req.is_mandatory;
    try {
      await documentService.updateRequirement(req.id, {
        is_mandatory: nextVal,
      });
      onRefresh();
      showFeedback(
        'success',
        `"${req.requirement_name}" set to ${nextVal ? 'Required (Mandatory)' : 'Optional'}`
      );
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to update requirement status');
    }
  };

  // Quick Switch Visibility Condition
  const handleQuickSetCondition = async (
    req: DocumentRequirement,
    type: ConditionalRuleConfig['type'],
    val: string = 'ALL'
  ) => {
    let newRuleString: string | null = null;
    if (type !== 'ALWAYS') {
      const ruleObj: ConditionalRuleConfig = {
        type,
        operator: 'EQUALS',
        value: val,
        description: `Condition: ${type.replace('_', ' ')} is "${val}"`,
      };
      newRuleString = JSON.stringify(ruleObj);
    }

    try {
      await documentService.updateRequirement(req.id, {
        conditional_rule: newRuleString,
      });
      setActiveConditionReqId(null);
      onRefresh();
      showFeedback(
        'success',
        `Visibility condition for "${req.requirement_name}" set to ${
          type === 'ALWAYS' ? 'Always Required' : `Conditional (${type})`
        }`
      );
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to set visibility condition');
    }
  };

  // Save Inline Added Requirement
  const handleSaveInline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineName.trim()) return;

    setSaving(true);
    let condRule: string | null = null;
    if (inlineRuleType !== 'ALWAYS') {
      const ruleObj: ConditionalRuleConfig = {
        type: inlineRuleType,
        operator: 'EQUALS',
        value: inlineRuleValue,
        description: `Triggered when ${inlineRuleType.toLowerCase().replace('_', ' ')} is "${inlineRuleValue}"`,
      };
      condRule = JSON.stringify(ruleObj);
    }

    try {
      await documentService.addRequirement(documentType.id, {
        requirement_name: inlineName.trim(),
        description: inlineDesc.trim() || null,
        is_mandatory: inlineMandatory,
        file_type: inlineFileType.trim() || 'PDF, JPG, PNG',
        max_file_size_mb: inlineMaxSize,
        allow_multiple: inlineAllowMultiple,
        conditional_rule: condRule,
      });

      // Reset inline form
      setInlineName('');
      setInlineDesc('');
      setInlineMandatory(true);
      setInlineRuleType('ALWAYS');
      setInlineRuleValue('ALL');
      setIsAddingInline(false);

      onRefresh();
      showFeedback('success', `Added requirement "${inlineName.trim()}" to ${documentType.code}`);
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to add requirement');
    } finally {
      setSaving(false);
    }
  };

  // Open Edit Modal for a requirement
  const openEditModal = (req: DocumentRequirement) => {
    setEditingReq(req);
    setFormName(req.requirement_name);
    setFormDesc(req.description || '');
    setFormMandatory(req.is_mandatory);
    setFormFileType(req.file_type || 'PDF, JPG, PNG');
    setFormMaxSize(req.max_file_size_mb || 10);
    setFormAllowMultiple(req.allow_multiple || false);

    const parsed = parseConditionalRule(req.conditional_rule);
    if (parsed) {
      setRuleType(parsed.type);
      setRuleOperator(parsed.operator);
      setRuleValue(Array.isArray(parsed.value) ? parsed.value[0] : parsed.value);
      setRuleCustomDesc(parsed.description || '');
    } else {
      setRuleType('ALWAYS');
      setRuleOperator('EQUALS');
      setRuleValue('ALL');
      setRuleCustomDesc('');
    }

    setIsEditModalOpen(true);
  };

  // Save Modal Requirement
  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReq || !formName.trim()) return;

    setSaving(true);
    let condRule: string | null = null;
    if (ruleType !== 'ALWAYS') {
      const ruleObj: ConditionalRuleConfig = {
        type: ruleType,
        operator: ruleOperator,
        value: ruleValue,
        description:
          ruleCustomDesc ||
          `Triggered when ${ruleType.toLowerCase().replace('_', ' ')} ${ruleOperator.toLowerCase()} "${ruleValue}"`,
      };
      condRule = JSON.stringify(ruleObj);
    }

    try {
      await documentService.updateRequirement(editingReq.id, {
        requirement_name: formName.trim(),
        description: formDesc.trim() || null,
        is_mandatory: formMandatory,
        file_type: formFileType.trim() || 'PDF, JPG, PNG',
        max_file_size_mb: formMaxSize,
        allow_multiple: formAllowMultiple,
        conditional_rule: condRule,
      });

      setIsEditModalOpen(false);
      onRefresh();
      showFeedback('success', `Updated requirement "${formName.trim()}"`);
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to update requirement');
    } finally {
      setSaving(false);
    }
  };

  // Delete Requirement
  const handleDeleteRequirement = async (req: DocumentRequirement) => {
    if (
      !window.confirm(
        `Are you sure you want to remove "${req.requirement_name}" from ${documentType.name}?`
      )
    ) {
      return;
    }

    try {
      await documentService.deleteRequirement(req.id);
      onRefresh();
      showFeedback('success', `Removed "${req.requirement_name}"`);
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to delete requirement');
    }
  };

  // Move Requirement Order
  const handleMoveOrder = async (index: number, direction: 'UP' | 'DOWN') => {
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= requirements.length) return;

    const newReqs = [...requirements];
    const [moved] = newReqs.splice(index, 1);
    newReqs.splice(targetIndex, 0, moved);

    try {
      await documentService.reorderRequirements(
        documentType.id,
        newReqs.map((r) => r.id)
      );
      onRefresh();
    } catch (err: any) {
      console.error('Failed to reorder requirements:', err);
    }
  };

  // Apply Standard Pack (School ID + Receipt + Clearance)
  const handleApplyStandardPack = async () => {
    const standardIds = ['preset-school-id', 'preset-payment-proof', 'preset-library-clearance'];
    const toAdd = REGISTRAR_DOCUMENT_PRESETS.filter((p) => standardIds.includes(p.id));

    setSaving(true);
    let count = 0;
    for (const preset of toAdd) {
      const exists = requirements.some(
        (r) => r.requirement_name.toLowerCase() === preset.name.toLowerCase()
      );
      if (!exists) {
        await documentService.addRequirement(documentType.id, {
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
    showFeedback('success', `Added ${count} standard clearance requirements.`);
  };

  // Add Specific Preset
  const handleAddPreset = async (preset: SpecificDocumentPreset) => {
    const exists = requirements.some(
      (r) => r.requirement_name.toLowerCase() === preset.name.toLowerCase()
    );
    if (exists) {
      showFeedback('error', `"${preset.name}" is already configured.`);
      return;
    }

    setSaving(true);
    try {
      await documentService.addRequirement(documentType.id, {
        requirement_name: preset.name,
        description: preset.description,
        is_mandatory: preset.isMandatory,
        file_type: preset.fileType,
        max_file_size_mb: preset.maxFileSizeMb,
        allow_multiple: preset.allowMultiple,
        conditional_rule: preset.conditionalRule ? JSON.stringify(preset.conditionalRule) : null,
      });

      onRefresh();
      showFeedback('success', `Added preset "${preset.name}".`);
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to add preset.');
    } finally {
      setSaving(false);
    }
  };

  // Stats
  const mandatoryCount = requirements.filter((r) => r.is_mandatory).length;
  const conditionalCount = requirements.filter((r) => {
    const p = parseConditionalRule(r.conditional_rule);
    return p && p.type !== 'ALWAYS';
  }).length;

  return (
    <div className="bg-slate-50/90 border-t border-slate-200 p-4 rounded-b-xl space-y-3">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-2.5 rounded-lg flex items-center justify-between text-xs transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold'
              : 'bg-rose-50 border border-rose-200 text-rose-800 font-semibold'
          }`}
        >
          <div className="flex items-center gap-1.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="p-0.5 text-slate-400 hover:text-slate-600">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Header bar inside the nested section */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Nested Requirements ({requirements.length})
          </span>
          <div className="flex items-center gap-1 text-[10px]">
            <span className="bg-rose-100/80 text-rose-800 font-bold px-2 py-0.2 rounded-full">
              {mandatoryCount} Required
            </span>
            {conditionalCount > 0 && (
              <span className="bg-amber-100 text-amber-900 font-semibold px-2 py-0.2 rounded-full">
                {conditionalCount} Conditional
              </span>
            )}
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsPresetModalOpen(true)}
            className="text-[11px] font-semibold text-blue-700 bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" />
            <span>Presets</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddingInline(!isAddingInline)}
            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
              isAddingInline
                ? 'bg-slate-200 text-slate-800'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Plus className="w-3 h-3" />
            <span>{isAddingInline ? 'Cancel' : 'Add Requirement'}</span>
          </button>
        </div>
      </div>

      {/* INLINE ADD REQUIREMENT EXPANDABLE PANEL */}
      {isAddingInline && (
        <form
          onSubmit={handleSaveInline}
          className="bg-white p-3.5 rounded-xl border-2 border-blue-300 shadow-2xs space-y-3"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-blue-600" />
              Add Requirement to {documentType.code}
            </span>
            <button
              type="button"
              onClick={() => setIsAddingInline(false)}
              className="text-[11px] text-slate-400 hover:text-slate-600 font-medium"
            >
              ✕ Close
            </button>
          </div>

          <div className="space-y-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-0.5">
                Requirement Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Valid School ID, Official Payment Receipt, Affidavit of Loss"
                value={inlineName}
                onChange={(e) => setInlineName(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 font-semibold"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-0.5">
                Instructions for Applicant (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Provide clear front and back copy with visible student number"
                value={inlineDesc}
                onChange={(e) => setInlineDesc(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Quick Status & Condition Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {/* Mandatory Status */}
              <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-800">
                  Required Status:
                </span>
                <button
                  type="button"
                  onClick={() => setInlineMandatory(!inlineMandatory)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all flex items-center gap-1 ${
                    inlineMandatory
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-slate-200 text-slate-600 border-slate-300'
                  }`}
                >
                  {inlineMandatory ? (
                    <>
                      <CheckSquare className="w-3 h-3 text-rose-600" />
                      <span>★ Required</span>
                    </>
                  ) : (
                    <>
                      <Square className="w-3 h-3 text-slate-400" />
                      <span>Optional</span>
                    </>
                  )}
                </button>
              </div>

              {/* Visibility Condition */}
              <div className="bg-amber-50/60 p-2 rounded-lg border border-amber-200 space-y-1">
                <span className="text-[10px] font-bold text-amber-900 block">
                  Visibility Condition:
                </span>
                <select
                  value={inlineRuleType}
                  onChange={(e) => {
                    const t = e.target.value as ConditionalRuleConfig['type'];
                    setInlineRuleType(t);
                    if (t === 'PURPOSE') setInlineRuleValue(PURPOSE_OPTIONS[0]);
                    else if (t === 'RELEASE_METHOD') setInlineRuleValue(RELEASE_METHOD_OPTIONS[1].value);
                    else if (t === 'STUDENT_STATUS') setInlineRuleValue(STUDENT_STATUS_OPTIONS[1]);
                    else setInlineRuleValue('ALL');
                  }}
                  className="w-full text-xs p-1 rounded border border-amber-300 bg-white font-medium"
                >
                  <option value="ALWAYS">Always Required (All Applicants)</option>
                  <option value="PURPOSE">When Purpose matches...</option>
                  <option value="RELEASE_METHOD">When Claim Method matches...</option>
                  <option value="STUDENT_STATUS">When Student Standing matches...</option>
                </select>

                {/* Sub-value for condition */}
                {inlineRuleType === 'PURPOSE' && (
                  <select
                    value={inlineRuleValue}
                    onChange={(e) => setInlineRuleValue(e.target.value)}
                    className="w-full text-[11px] p-1 rounded border border-amber-300 bg-white font-medium mt-1"
                  >
                    {PURPOSE_OPTIONS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                )}

                {inlineRuleType === 'RELEASE_METHOD' && (
                  <select
                    value={inlineRuleValue}
                    onChange={(e) => setInlineRuleValue(e.target.value)}
                    className="w-full text-[11px] p-1 rounded border border-amber-300 bg-white font-medium mt-1"
                  >
                    {RELEASE_METHOD_OPTIONS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                )}

                {inlineRuleType === 'STUDENT_STATUS' && (
                  <select
                    value={inlineRuleValue}
                    onChange={(e) => setInlineRuleValue(e.target.value)}
                    className="w-full text-[11px] p-1 rounded border border-amber-300 bg-white font-medium mt-1"
                  >
                    {STUDENT_STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAddingInline(false)}
              className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-medium"
            >
              Cancel
            </button>
            <Button size="sm" variant="primary" type="submit" loading={saving}>
              Save Requirement
            </Button>
          </div>
        </form>
      )}

      {/* REQUIREMENTS LIST */}
      {requirements.length === 0 ? (
        <div className="bg-white p-4 rounded-xl border border-dashed border-slate-300 text-center space-y-2.5">
          <FileText className="w-8 h-8 text-slate-300 mx-auto" />
          <div>
            <span className="text-xs font-bold text-slate-700 block">
              No clearance prerequisites attached yet
            </span>
            <span className="text-[11px] text-slate-400 block max-w-sm mx-auto">
              Students can request {documentType.name} without submitting prerequisite uploads.
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleApplyStandardPack}
              disabled={saving}
              className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              <span>Apply Standard Pack (School ID + Receipt + Clearance)</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {requirements.map((req, index) => {
            const ruleInfo = formatConditionalRuleSummary(req.conditional_rule);
            const parsedRule = parseConditionalRule(req.conditional_rule);
            const isConditional = parsedRule && parsedRule.type !== 'ALWAYS';
            const isConditionMenuOpen = activeConditionReqId === req.id;

            return (
              <div
                key={req.id}
                className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-300 transition-all space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  {/* Left: Reorder & Name */}
                  <div className="flex items-start space-x-2.5 min-w-0">
                    <div className="flex flex-col items-center space-y-0.5 pt-0.5 shrink-0 text-slate-400">
                      <span className="text-[9px] font-mono font-bold">#{index + 1}</span>
                      <div className="flex flex-col">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveOrder(index, 'UP')}
                          className="p-0.5 hover:text-blue-600 disabled:opacity-20 transition-colors"
                          title="Move up"
                        >
                          <ArrowUp className="w-2.5 h-2.5" />
                        </button>
                        <button
                          type="button"
                          disabled={index === requirements.length - 1}
                          onClick={() => handleMoveOrder(index, 'DOWN')}
                          className="p-0.5 hover:text-blue-600 disabled:opacity-20 transition-colors"
                          title="Move down"
                        >
                          <ArrowDown className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {req.requirement_name}
                        </span>

                        {/* TOGGLE 'REQUIRED' (MANDATORY) STATUS BUTTON */}
                        <button
                          type="button"
                          onClick={() => handleToggleMandatory(req)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all flex items-center gap-1 cursor-pointer ${
                            req.is_mandatory
                              ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 shadow-2xs'
                              : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                          }`}
                          title="Click to toggle Required vs Optional"
                        >
                          {req.is_mandatory ? (
                            <>
                              <CheckSquare className="w-3 h-3 text-rose-600" />
                              <span>★ Required</span>
                            </>
                          ) : (
                            <>
                              <Square className="w-3 h-3 text-slate-400" />
                              <span>Optional</span>
                            </>
                          )}
                        </button>

                        {/* VISIBILITY CONDITION BADGE & TOGGLE BUTTON */}
                        <button
                          type="button"
                          onClick={() =>
                            setActiveConditionReqId(isConditionMenuOpen ? null : req.id)
                          }
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1 transition-all cursor-pointer ${
                            isConditional
                              ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 font-bold'
                              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                          }`}
                          title="Click to change visibility conditions"
                        >
                          <SlidersHorizontal className="w-2.5 h-2.5" />
                          <span>{isConditional ? ruleInfo.label : 'Always Required'}</span>
                          <ChevronDown className="w-2.5 h-2.5 ml-0.5 opacity-60" />
                        </button>
                      </div>

                      {req.description && (
                        <p className="text-[11px] text-slate-500 leading-snug">
                          {req.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                        <span>{req.file_type || 'PDF, JPG, PNG'}</span>
                        <span>•</span>
                        <span>Max {req.max_file_size_mb || 10}MB</span>
                        {req.allow_multiple && (
                          <>
                            <span>•</span>
                            <span className="text-blue-600 font-sans font-semibold">Multi-file</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center space-x-1 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => openEditModal(req)}
                      className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit requirement details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteRequirement(req)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete requirement"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* INLINE VISIBILITY CONDITION SELECTOR POPOVER */}
                {isConditionMenuOpen && (
                  <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200 space-y-2 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                        <Sliders className="w-3.5 h-3.5 text-amber-700" />
                        Set Visibility Condition for "{req.requirement_name}"
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveConditionReqId(null)}
                        className="text-[10px] text-amber-800 hover:text-amber-950 font-bold"
                      >
                        ✕ Close
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {/* Option 1: Always */}
                      <button
                        type="button"
                        onClick={() => handleQuickSetCondition(req, 'ALWAYS')}
                        className={`p-2 rounded-lg border text-left transition-all text-xs font-semibold ${
                          !isConditional
                            ? 'bg-amber-600 text-white border-amber-700 shadow-2xs'
                            : 'bg-white text-slate-700 border-amber-200 hover:bg-amber-100/50'
                        }`}
                      >
                        🌐 Always Required (All Applicants)
                      </button>

                      {/* Option 2: When Purpose = Lost Document */}
                      <button
                        type="button"
                        onClick={() =>
                          handleQuickSetCondition(
                            req,
                            'PURPOSE',
                            'Lost Original Document / Replacement'
                          )
                        }
                        className="p-2 rounded-lg border bg-white text-slate-700 border-amber-200 hover:bg-amber-100/50 text-left transition-all text-xs font-semibold"
                      >
                        📄 When Purpose: Replacement of Lost Doc
                      </button>

                      {/* Option 3: When Release Method = Representative */}
                      <button
                        type="button"
                        onClick={() =>
                          handleQuickSetCondition(req, 'RELEASE_METHOD', 'PICKUP_REPRESENTATIVE')
                        }
                        className="p-2 rounded-lg border bg-white text-slate-700 border-amber-200 hover:bg-amber-100/50 text-left transition-all text-xs font-semibold"
                      >
                        👥 When Claim: Authorized Representative
                      </button>

                      {/* Option 4: Custom Condition Builder in Modal */}
                      <button
                        type="button"
                        onClick={() => {
                          setActiveConditionReqId(null);
                          openEditModal(req);
                        }}
                        className="p-2 rounded-lg border bg-white text-blue-700 border-blue-200 hover:bg-blue-50 text-left transition-all text-xs font-bold flex items-center justify-between"
                      >
                        <span>⚙️ Custom Rule Builder...</span>
                        <ChevronDown className="w-3 h-3 -rotate-90" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: EDIT REQUIREMENT & CONDITIONAL RULES */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={editingReq ? `Edit Requirement: ${editingReq.requirement_name}` : `Requirement Setup`}
        subtitle={`Configure requirement properties, mandatory status, and visibility conditions for ${documentType.name}.`}
      >
        <form onSubmit={handleSaveModal} className="space-y-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Requirement Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Instructions for Students
              </label>
              <textarea
                rows={2}
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="e.g. Scanned copy of validated student ID for the current academic term."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* MANDATORY STATUS TOGGLE */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <label className="flex items-center justify-between cursor-pointer text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">Required (Mandatory Clearance)</span>
                  <span className="text-[11px] text-slate-500">
                    If checked, applicant cannot submit request without providing this file.
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
                      Permit uploading more than 1 document (e.g. front & back pages).
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
                  Visibility Conditions
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Rule Condition:
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
                    className="w-full text-xs p-2 rounded-lg border border-amber-300 bg-white font-semibold"
                  >
                    <option value="ALWAYS">🌐 Always Required (All Applicants)</option>
                    <option value="PURPOSE">🎯 Only for Specific Purpose</option>
                    <option value="RELEASE_METHOD">📦 Only for Specific Claim Method</option>
                    <option value="STUDENT_STATUS">🎓 Only for Specific Academic Standing</option>
                    <option value="PRIORITY">⚡ Only for Rush / Priority Processing</option>
                  </select>
                </div>

                {ruleType === 'PURPOSE' && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Target Purpose:
                    </label>
                    <select
                      value={ruleValue}
                      onChange={(e) => setRuleValue(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-amber-300 bg-white font-semibold"
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
                      Target Claim Method:
                    </label>
                    <select
                      value={ruleValue}
                      onChange={(e) => setRuleValue(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-amber-300 bg-white font-semibold"
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
                      Target Academic Standing:
                    </label>
                    <select
                      value={ruleValue}
                      onChange={(e) => setRuleValue(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-amber-300 bg-white font-semibold"
                    >
                      {STUDENT_STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {ruleType === 'PRIORITY' && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Target Priority:
                    </label>
                    <select
                      value={ruleValue}
                      onChange={(e) => setRuleValue(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-amber-300 bg-white font-semibold"
                    >
                      <option value="HIGH">Rush / Urgent Processing</option>
                      <option value="NORMAL">Standard Processing</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* TECHNICAL SPECS */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Accepted File Formats
                </label>
                <input
                  type="text"
                  value={formFileType}
                  onChange={(e) => setFormFileType(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Max File Size (MB)
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={formMaxSize}
                  onChange={(e) => setFormMaxSize(Number(e.target.value))}
                  className="w-full text-xs p-2 rounded-lg border border-slate-300 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              size="sm"
              variant="secondary"
              type="button"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit" loading={saving}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* PRESETS MODAL */}
      <Modal
        isOpen={isPresetModalOpen}
        onClose={() => setIsPresetModalOpen(false)}
        title={`Add Preset Requirements to ${documentType.code}`}
        subtitle="Choose standard university clearance templates to attach with one click."
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 text-xs">
            {(['ALL', 'Identity', 'Financial', 'Clearance', 'Academic', 'Legal'] as const).map(
              (cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setPresetCategory(cat)}
                  className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition-colors ${
                    presetCategory === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              )
            )}
          </div>

          <div className="max-h-80 overflow-y-auto space-y-2 divide-y divide-slate-100">
            {REGISTRAR_DOCUMENT_PRESETS.filter(
              (p) => presetCategory === 'ALL' || p.category === presetCategory
            ).map((preset) => {
              const alreadyAdded = requirements.some(
                (r) => r.requirement_name.toLowerCase() === preset.name.toLowerCase()
              );

              return (
                <div
                  key={preset.id}
                  className="pt-2 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{preset.name}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                        {preset.category}
                      </span>
                      {preset.isMandatory && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-rose-50 text-rose-700">
                          Required
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">{preset.description}</p>
                  </div>

                  <Button
                    size="sm"
                    variant={alreadyAdded ? 'secondary' : 'primary'}
                    disabled={alreadyAdded || saving}
                    onClick={() => handleAddPreset(preset)}
                    className="shrink-0"
                  >
                    {alreadyAdded ? 'Added' : 'Attach'}
                  </Button>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <Button size="sm" variant="secondary" onClick={() => setIsPresetModalOpen(false)}>
              Done
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
