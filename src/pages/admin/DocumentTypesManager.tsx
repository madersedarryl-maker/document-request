import React, { useState, useEffect, useMemo } from 'react';
import { documentService } from '../../services/documentService';
import { DocumentType, DocumentRequirement } from '../../types';
import { Modal } from '../../components/Modal';
import { DocumentCatalogSkeleton } from '../../components/Skeletons';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/Button';
import { DocumentRequirementStudio } from '../../components/DocumentRequirementStudio';
import { RequirementConfigurationView } from '../../components/RequirementConfigurationView';
import { NestedDocumentRequirementManager } from '../../components/NestedDocumentRequirementManager';
import {
  FileText,
  Plus,
  Edit2,
  Trash2,
  Clock,
  DollarSign,
  Layers,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Search,
  Filter,
  Check,
  Sparkles,
  SlidersHorizontal,
  Info,
  Sliders,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
} from 'lucide-react';

export const DocumentTypesManager: React.FC = () => {
  const [docTypes, setDocTypes] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Active View Tab: CATALOG vs REQUIREMENTS
  const [activeView, setActiveView] = useState<'CATALOG' | 'REQUIREMENTS'>('CATALOG');
  const [selectedReqDocTypeId, setSelectedReqDocTypeId] = useState<string | null>(null);

  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [requirementFilter, setRequirementFilter] = useState<'ALL' | 'WITH_REQS' | 'NO_REQS'>('ALL');
  const [expandedDocIds, setExpandedDocIds] = useState<Set<string>>(new Set());

  const toggleExpandDoc = (id: string) => {
    setExpandedDocIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAllDocs = () => {
    setExpandedDocIds(new Set(docTypes.map((d) => d.id)));
  };

  const collapseAllDocs = () => {
    setExpandedDocIds(new Set());
  };

  // Form Modal state (Create / Edit Doc Type)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentType | null>(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fee, setFee] = useState<number>(50.0);
  const [processingDays, setProcessingDays] = useState<number>(3);
  const [isActive, setIsActive] = useState(true);
  const [requiresApproval, setRequiresApproval] = useState(true);
  const [initialReqList, setInitialReqList] = useState<
    Array<{ requirement_name: string; description: string; is_mandatory: boolean; file_type: string }>
  >([]);

  // Requirement Studio Modal state
  const [selectedDocForStudio, setSelectedDocForStudio] = useState<DocumentType | null>(null);
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadDocTypes = async () => {
    try {
      const data = await documentService.getAllDocumentTypes();
      setDocTypes(data);
      // If studio is open, sync the selected doc
      if (selectedDocForStudio) {
        const found = data.find((d) => d.id === selectedDocForStudio.id);
        if (found) setSelectedDocForStudio(found);
      }
    } catch (err: any) {
      console.error('Failed to load document types:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDocTypes();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDocTypes();
  };

  const openCreateModal = () => {
    setEditingDoc(null);
    setCode('');
    setName('');
    setDescription('');
    setFee(50.0);
    setProcessingDays(3);
    setIsActive(true);
    setRequiresApproval(true);
    setInitialReqList([
      {
        requirement_name: 'Valid Student ID / Registration Card',
        description: 'Front and back copy of current validated ID',
        is_mandatory: true,
        file_type: 'PDF, JPG, PNG',
      },
    ]);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (doc: DocumentType) => {
    setEditingDoc(doc);
    setCode(doc.code);
    setName(doc.name);
    setDescription(doc.description || '');
    setFee(Number(doc.fee));
    setProcessingDays(doc.processing_days);
    setIsActive(doc.is_active);
    setRequiresApproval(doc.requires_approval);
    setInitialReqList([]);
    setError(null);
    setIsModalOpen(true);
  };

  const handleOpenStudio = (doc: DocumentType) => {
    setSelectedDocForStudio(doc);
    setIsStudioOpen(true);
  };

  const handleSaveDocType = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (editingDoc) {
        await documentService.updateDocumentType(editingDoc.id, {
          code: code.trim().toUpperCase(),
          name: name.trim(),
          description: description.trim(),
          fee,
          processing_days: processingDays,
          is_active: isActive,
          requires_approval: requiresApproval,
        });
        setFeedback(`Updated document type "${name.trim()}"`);
      } else {
        await documentService.createDocumentType(
          {
            code: code.trim().toUpperCase(),
            name: name.trim(),
            description: description.trim(),
            fee,
            processing_days: processingDays,
            is_active: isActive,
            requires_approval: requiresApproval,
          },
          initialReqList.map((r) => ({
            requirement_name: r.requirement_name,
            description: r.description,
            is_mandatory: r.is_mandatory,
            file_type: r.file_type,
          }))
        );
        setFeedback(`Created new document type "${name.trim()}" with ${initialReqList.length} clearances.`);
      }

      setIsModalOpen(false);
      await loadDocTypes();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      console.error('Save doc type error:', err);
      setError(err.message || 'Failed to save document type.');
    } finally {
      setSaving(false);
    }
  };

  const filteredDocTypes = useMemo(() => {
    return docTypes.filter((doc) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesCode = doc.code.toLowerCase().includes(q);
        const matchesName = doc.name.toLowerCase().includes(q);
        const matchesDesc = (doc.description || '').toLowerCase().includes(q);
        const matchesReq = (doc.requirements || []).some((r) =>
          r.requirement_name.toLowerCase().includes(q)
        );
        if (!matchesCode && !matchesName && !matchesDesc && !matchesReq) {
          return false;
        }
      }

      // Status
      if (statusFilter === 'ACTIVE' && !doc.is_active) return false;
      if (statusFilter === 'INACTIVE' && doc.is_active) return false;

      // Requirements
      const count = doc.requirements?.length || 0;
      if (requirementFilter === 'WITH_REQS' && count === 0) return false;
      if (requirementFilter === 'NO_REQS' && count > 0) return false;

      return true;
    });
  }, [docTypes, searchQuery, statusFilter, requirementFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. Page Header */}
      <PageHeader
        title="Document Catalog & Clearances"
        subtitle="Manage official registrar records, fee schedules, processing turnarounds, and configure required student clearance attachments for each document."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Document Catalog & Clearances' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              loading={refreshing}
              onClick={handleRefresh}
            >
              Refresh
            </Button>
            <Button
              id="create-new-document-type-btn"
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={openCreateModal}
            >
              Add Document Record
            </Button>
          </div>
        }
      />

      {/* Feedback Toast */}
      {feedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-semibold flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main View Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setActiveView('CATALOG')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeView === 'CATALOG'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Document Catalog & Fee Schedule ({docTypes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('REQUIREMENTS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeView === 'REQUIREMENTS'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Requirement Configuration & Rules</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center text-xs text-slate-400 font-medium">
          {activeView === 'CATALOG' ? 'Catalog View' : 'Requirement Matrix View'}
        </div>
      </div>

      {/* VIEW 1: CATALOG VIEW */}
      {activeView === 'CATALOG' && (
        <>
          {/* 2. Search, Stats & Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              {/* Search */}
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, code (e.g. TOR), or requirement..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 w-full md:w-auto flex-wrap justify-end">
                <div className="flex items-center space-x-1 text-xs">
                  <span className="text-slate-400 text-[11px] font-medium mr-1">Status:</span>
                  {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatusFilter(s)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                        statusFilter === s
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {s === 'ALL' ? 'All Records' : s === 'ACTIVE' ? 'Active' : 'Inactive'}
                    </button>
                  ))}
                </div>

                <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

                <div className="flex items-center space-x-1 text-xs">
                  <span className="text-slate-400 text-[11px] font-medium mr-1">Requirements:</span>
                  {(['ALL', 'WITH_REQS', 'NO_REQS'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRequirementFilter(r)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                        requirementFilter === r
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {r === 'ALL' ? 'All' : r === 'WITH_REQS' ? 'Has Prerequisites' : 'No Clearances'}
                    </button>
                  ))}
                </div>

                <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

                {/* Expand / Collapse All Toggle */}
                <div className="flex items-center space-x-1 text-xs">
                  <button
                    type="button"
                    onClick={expandedDocIds.size === filteredDocTypes.length ? collapseAllDocs : expandAllDocs}
                    className="px-2.5 py-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
                    title="Expand or collapse nested requirements on all cards"
                  >
                    <ChevronsUpDown className="w-3.5 h-3.5 text-slate-600" />
                    <span>
                      {expandedDocIds.size === filteredDocTypes.length && filteredDocTypes.length > 0
                        ? 'Collapse All'
                        : 'Expand All'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Grid of Document Types */}
          {loading ? (
            <DocumentCatalogSkeleton count={6} />
          ) : filteredDocTypes.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white rounded-xl border border-slate-200 space-y-3">
              <FileText className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-900">No document records found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try adjusting your search query or filter options to locate existing document records.
              </p>
              {(searchQuery || statusFilter !== 'ALL' || requirementFilter !== 'ALL') && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('ALL');
                    setRequirementFilter('ALL');
                  }}
                >
                  Reset Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDocTypes.map((doc) => {
                const reqs = doc.requirements || [];
                const mandatoryCount = reqs.filter((r) => r.is_mandatory).length;
                const isExpanded = expandedDocIds.has(doc.id);

                return (
                  <div
                    key={doc.id}
                    className={`bg-white rounded-xl border transition-all flex flex-col justify-between overflow-hidden group ${
                      isExpanded
                        ? 'border-blue-400 shadow-md ring-1 ring-blue-200'
                        : 'border-slate-200 shadow-2xs hover:border-blue-300 hover:shadow-xs'
                    }`}
                  >
                    <div className="p-5 space-y-3.5">
                      {/* Top Bar: Code, Active Pill, Fee */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {doc.code}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              doc.is_active
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-100 text-slate-500 border-slate-200'
                            }`}
                          >
                            {doc.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        <span className="text-sm font-black text-slate-900 font-mono">
                          ₱{Number(doc.fee).toFixed(2)}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 leading-snug group-hover:text-blue-900 transition-colors">
                          {doc.name}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                          {doc.description || 'No specific document notes provided.'}
                        </p>
                      </div>

                      {/* Turnaround & Approval badges */}
                      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {doc.processing_days} working {doc.processing_days === 1 ? 'day' : 'days'}
                        </span>
                        <span className="font-medium text-slate-600 text-[11px] bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                          {doc.requires_approval ? 'Officer Approval' : 'Direct Approval'}
                        </span>
                      </div>

                      {/* Clearances & Prerequisites Preview Header / Toggle Bar */}
                      <div
                        onClick={() => toggleExpandDoc(doc.id)}
                        className={`p-3 rounded-lg border transition-all cursor-pointer select-none space-y-2 ${
                          isExpanded
                            ? 'bg-blue-50/70 border-blue-200'
                            : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/80'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                            Nested Requirements ({reqs.length})
                          </span>

                          <div className="flex items-center gap-1.5">
                            {reqs.length > 0 && (
                              <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-100">
                                {mandatoryCount} Req
                              </span>
                            )}
                            <span className="text-xs font-bold text-blue-700 flex items-center gap-0.5">
                              {isExpanded ? (
                                <>
                                  <span className="text-[10px]">Collapse</span>
                                  <ChevronUp className="w-3.5 h-3.5" />
                                </>
                              ) : (
                                <>
                                  <span className="text-[10px]">Manage</span>
                                  <ChevronDown className="w-3.5 h-3.5" />
                                </>
                              )}
                            </span>
                          </div>
                        </div>

                        {!isExpanded && (
                          <div>
                            {reqs.length === 0 ? (
                              <div className="text-[11px] text-slate-400 italic">
                                No clearance requirements attached (Click to add)
                              </div>
                            ) : (
                              <ul className="text-xs space-y-1 text-slate-700">
                                {reqs.slice(0, 2).map((r) => (
                                  <li
                                    key={r.id}
                                    className="flex items-center justify-between text-[11px] bg-white p-1 rounded border border-slate-200/60"
                                  >
                                    <span className="truncate font-medium pr-1 text-slate-800">
                                      {r.requirement_name}
                                    </span>
                                    <span
                                      className={`text-[9px] font-bold px-1 py-0.2 rounded shrink-0 ${
                                        r.is_mandatory
                                          ? 'bg-rose-50 text-rose-700'
                                          : 'bg-slate-100 text-slate-600'
                                      }`}
                                    >
                                      {r.is_mandatory ? 'Required' : 'Optional'}
                                    </span>
                                  </li>
                                ))}
                                {reqs.length > 2 && (
                                  <li className="text-[10px] text-blue-700 font-semibold pl-0.5">
                                    +{reqs.length - 2} more... (Click to expand & edit)
                                  </li>
                                )}
                              </ul>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* NESTED REQUIREMENTS SECTION (EXPANDABLE) */}
                    {isExpanded && (
                      <NestedDocumentRequirementManager
                        documentType={doc}
                        onRefresh={loadDocTypes}
                      />
                    )}

                    {/* Card Action Buttons */}
                    <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => toggleExpandDoc(doc.id)}
                        className="font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1.5 py-1 px-2 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <Layers className="w-3.5 h-3.5 text-blue-700" />
                        <span>
                          {isExpanded
                            ? 'Close Nested Section'
                            : `Open Requirements (${reqs.length})`}
                        </span>
                      </button>

                      <Button
                        size="sm"
                        variant="secondary"
                        icon={Edit2}
                        onClick={() => openEditModal(doc)}
                      >
                        Edit Document
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* VIEW 2: REQUIREMENT CONFIGURATION VIEW */}
      {activeView === 'REQUIREMENTS' && (
        <RequirementConfigurationView
          documentTypes={docTypes}
          selectedDocTypeId={selectedReqDocTypeId}
          onDocTypeSelected={(id) => setSelectedReqDocTypeId(id)}
          onRefresh={loadDocTypes}
        />
      )}

      {/* Dedicated Requirement Studio Modal */}
      <DocumentRequirementStudio
        documentType={selectedDocForStudio}
        isOpen={isStudioOpen}
        onClose={() => {
          setIsStudioOpen(false);
          setSelectedDocForStudio(null);
        }}
        onRequirementsChanged={loadDocTypes}
      />

      {/* Edit / Create Document Type Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDoc ? `Edit Document Record: ${editingDoc.name}` : 'Create New Document Record'}
        subtitle={
          editingDoc
            ? 'Update document details, pricing schedule, and processing turnaround.'
            : 'Register a new official registrar document available for student requests.'
        }
      >
        <form onSubmit={handleSaveDocType} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Document Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. TOR, COE, GMC, DIP"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full text-xs font-mono p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 uppercase font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Assessment Fee (₱) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={fee}
                onChange={(e) => setFee(parseFloat(e.target.value) || 0)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Document Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Official Transcript of Records (TOR) with General Weighted Average"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Description & Coverage Scope
            </label>
            <textarea
              rows={2}
              placeholder="Describe document purpose, official uses, and validity details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Processing Turnaround (Days) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                required
                value={processingDays}
                onChange={(e) => setProcessingDays(parseInt(e.target.value) || 1)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 font-bold"
              />
            </div>

            <div className="flex flex-col justify-end space-y-2">
              <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Active for Student Requests</span>
              </label>

              <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requiresApproval}
                  onChange={(e) => setRequiresApproval(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Requires Officer Approval</span>
              </label>
            </div>
          </div>

          {/* Initial Clearances if creating new */}
          {!editingDoc && (
            <div className="pt-2 border-t border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Initial Clearances / Prerequisites ({initialReqList.length}):
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setInitialReqList([
                      ...initialReqList,
                      {
                        requirement_name: '',
                        description: '',
                        is_mandatory: true,
                        file_type: 'PDF, JPG, PNG',
                      },
                    ])
                  }
                  className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Prerequisite
                </button>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto">
                {initialReqList.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Requirement name (e.g. Clearance Slip, ID)"
                        value={item.requirement_name}
                        onChange={(e) => {
                          const updated = [...initialReqList];
                          updated[idx].requirement_name = e.target.value;
                          setInitialReqList(updated);
                        }}
                        className="flex-1 text-xs p-1.5 rounded border border-slate-300 font-semibold"
                      />
                      <label className="flex items-center gap-1 text-[11px] text-slate-600 cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={item.is_mandatory}
                          onChange={(e) => {
                            const updated = [...initialReqList];
                            updated[idx].is_mandatory = e.target.checked;
                            setInitialReqList(updated);
                          }}
                          className="rounded text-blue-600"
                        />
                        <span>Mandatory</span>
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setInitialReqList(initialReqList.filter((_, i) => i !== idx))
                        }
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {editingDoc && (
            <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 text-xs text-blue-950 flex items-center justify-between">
              <div>
                <span className="font-bold block">Prerequisite Clearances</span>
                <span className="text-[11px] text-slate-500">
                  {editingDoc.requirements?.length || 0} clearances currently assigned to this document.
                </span>
              </div>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                icon={Layers}
                onClick={() => {
                  setIsModalOpen(false);
                  handleOpenStudio(editingDoc);
                }}
              >
                Configure Clearances
              </Button>
            </div>
          )}

          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
            <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={saving}>
              {editingDoc ? 'Save Changes' : 'Create Document Record'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
