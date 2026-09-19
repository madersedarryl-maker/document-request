import { supabase, getSupabaseConfig } from '../lib/supabase';
import { DocumentType, DocumentRequirement } from '../types';
import { mockStore } from './mockStore';
import { isDemoMode, productionConfigurationMessage } from '../lib/appConfig';

export const documentService = {
  /**
   * Get all active document types with requirements
   */
  async getActiveDocumentTypes(): Promise<DocumentType[]> {
    const config = getSupabaseConfig();
    if (!config.isConfigured && isDemoMode()) {
      return mockStore.getDocumentTypes(true);
    }

    try {
      const { data: types, error: typesError } = await supabase
        .from('document_types')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (typesError) throw typesError;
      if (!types || types.length === 0) return isDemoMode() ? mockStore.getDocumentTypes(true) : [];

      const { data: requirements } = await supabase
        .from('document_requirements')
        .select('*');

      return types.map((docType) => ({
        ...docType,
        requirements: requirements?.filter((r) => r.document_type_id === docType.id) || [],
      }));
    } catch (e) {
      if (isDemoMode()) return mockStore.getDocumentTypes(true);
      throw e;
    }
  },

  /**
   * Get all document types (active & inactive) for Admin
   */
  async getAllDocumentTypes(): Promise<DocumentType[]> {
    const config = getSupabaseConfig();
    if (!config.isConfigured && isDemoMode()) {
      return mockStore.getDocumentTypes(false);
    }

    try {
      const { data: types, error: typesError } = await supabase
        .from('document_types')
        .select('*')
        .order('created_at', { ascending: false });

      if (typesError) throw typesError;

      const { data: requirements } = await supabase
        .from('document_requirements')
        .select('*');

      return (types || []).map((docType) => ({
        ...docType,
        requirements: requirements?.filter((r) => r.document_type_id === docType.id) || [],
      }));
    } catch (e) {
      if (isDemoMode()) return mockStore.getDocumentTypes(false);
      throw e;
    }
  },

  /**
   * Create a new document type
   */
  async createDocumentType(
    doc: Omit<DocumentType, 'id' | 'created_at' | 'updated_at' | 'requirements'>,
    requirements: Omit<DocumentRequirement, 'id' | 'document_type_id' | 'created_at'>[] = []
  ) {
    const config = getSupabaseConfig();
    if (!config.isConfigured && !isDemoMode()) throw new Error(productionConfigurationMessage);
    const created = isDemoMode() ? mockStore.createDocumentType(doc as any, requirements) : null;
    if (config.isConfigured) {
      try {
        const { data: newDoc, error: docErr } = await supabase
          .from('document_types')
          .insert(doc)
          .select()
          .single();

        if (!docErr && newDoc && requirements.length > 0) {
          const reqRows = requirements.map((req) => ({
            document_type_id: newDoc.id,
            requirement_name: req.requirement_name,
            description: req.description,
            is_mandatory: req.is_mandatory,
            file_type: req.file_type || 'PDF, JPG, PNG',
          }));
          await supabase.from('document_requirements').insert(reqRows);
        }
      } catch (e) {
        if (!isDemoMode()) throw e;
        console.warn('Supabase createDocumentType error:', e);
      }
    }

    return created || undefined;
  },

  /**
   * Update an existing document type
   */
  async updateDocumentType(
    id: string,
    updates: Partial<Omit<DocumentType, 'id' | 'created_at' | 'updated_at' | 'requirements'>>
  ) {
    const config = getSupabaseConfig();
    if (!config.isConfigured && !isDemoMode()) throw new Error(productionConfigurationMessage);
    const updated = isDemoMode() ? mockStore.updateDocumentType(id, updates) : null;
    if (config.isConfigured) {
      try {
        await supabase
          .from('document_types')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id);
      } catch (e) {
        if (!isDemoMode()) throw e;
        console.warn('Supabase updateDocumentType error:', e);
      }
    }

    return updated || undefined;
  },

  /**
   * Delete or deactivate document type
   */
  async deleteDocumentType(id: string) {
    const config = getSupabaseConfig();
    if (!config.isConfigured && !isDemoMode()) throw new Error(productionConfigurationMessage);
    if (isDemoMode()) mockStore.deleteDocumentType(id);
    if (config.isConfigured) {
      try {
        await supabase.from('document_types').delete().eq('id', id);
      } catch (e) {
        if (!isDemoMode()) throw e;
      }
    }
  },

  /**
   * Add a single document requirement
   */
  async addRequirement(
    docTypeIdOrReq: string | Omit<DocumentRequirement, 'id' | 'created_at'>,
    optionalReq?: Omit<DocumentRequirement, 'id' | 'document_type_id' | 'created_at'>
  ): Promise<DocumentRequirement | void> {
    let result: DocumentRequirement | undefined;
    let payload: any;
    if (!getSupabaseConfig().isConfigured && !isDemoMode()) throw new Error(productionConfigurationMessage);
    if (typeof docTypeIdOrReq === 'string' && optionalReq) {
      if (isDemoMode()) result = mockStore.addRequirement(docTypeIdOrReq, optionalReq);
      payload = {
        document_type_id: docTypeIdOrReq,
        requirement_name: optionalReq.requirement_name,
        description: optionalReq.description || null,
        is_mandatory: optionalReq.is_mandatory ?? true,
        file_type: optionalReq.file_type || 'PDF, JPG, PNG',
        max_file_size_mb: optionalReq.max_file_size_mb || 10,
        allow_multiple: optionalReq.allow_multiple ?? false,
        conditional_rule: optionalReq.conditional_rule || null,
      };
    } else if (typeof docTypeIdOrReq === 'object') {
      if (isDemoMode()) result = mockStore.addRequirement(docTypeIdOrReq.document_type_id, docTypeIdOrReq);
      payload = {
        document_type_id: docTypeIdOrReq.document_type_id,
        requirement_name: docTypeIdOrReq.requirement_name,
        description: docTypeIdOrReq.description || null,
        is_mandatory: docTypeIdOrReq.is_mandatory ?? true,
        file_type: docTypeIdOrReq.file_type || 'PDF, JPG, PNG',
        max_file_size_mb: docTypeIdOrReq.max_file_size_mb || 10,
        allow_multiple: docTypeIdOrReq.allow_multiple ?? false,
        conditional_rule: docTypeIdOrReq.conditional_rule || null,
      };
    }

    const config = getSupabaseConfig();
    if (config.isConfigured && payload) {
      try {
        const { data, error } = await supabase
          .from('document_requirements')
          .insert(payload)
          .select()
          .single();
        if (!error && data) {
          return data as DocumentRequirement;
        }
      } catch (e) {
        if (!isDemoMode()) throw e;
        console.warn('Supabase addRequirement error:', e);
      }
    }
    return result;
  },

  /**
   * Update an existing document requirement
   */
  async updateRequirement(id: string, updates: Partial<DocumentRequirement>): Promise<DocumentRequirement | null> {
    const config = getSupabaseConfig();
    if (!config.isConfigured && !isDemoMode()) throw new Error(productionConfigurationMessage);
    const updated = isDemoMode() ? mockStore.updateRequirement(id, updates) : null;
    if (config.isConfigured) {
      try {
        const { data, error } = await supabase
          .from('document_requirements')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single();
        if (!error && data) {
          return data as DocumentRequirement;
        }
      } catch (e) {
        if (!isDemoMode()) throw e;
        console.warn('Supabase updateRequirement error:', e);
      }
    }
    return updated;
  },

  /**
   * Get single document type by ID
   */
  async getDocumentTypeById(id: string): Promise<DocumentType | null> {
    const config = getSupabaseConfig();
    if (!config.isConfigured && isDemoMode()) {
      const all = mockStore.getDocumentTypes(false);
      return all.find((d) => d.id === id) || null;
    }

    try {
      const { data: docType, error } = await supabase
        .from('document_types')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !docType) {
        if (isDemoMode()) {
          const all = mockStore.getDocumentTypes(false);
          return all.find((d) => d.id === id) || null;
        }
        throw error;
      }

      const { data: requirements } = await supabase
        .from('document_requirements')
        .select('*')
        .eq('document_type_id', id)
        .order('display_order', { ascending: true });

      return {
        ...docType,
        requirements: requirements || [],
      };
    } catch (e) {
      if (isDemoMode()) {
        const all = mockStore.getDocumentTypes(false);
        return all.find((d) => d.id === id) || null;
      }
      throw e;
    }
  },

  /**
   * Reorder requirements for a document type
   */
  async reorderRequirements(docTypeId: string, orderedIds: string[]): Promise<void> {
    const config = getSupabaseConfig();
    if (!config.isConfigured && !isDemoMode()) throw new Error(productionConfigurationMessage);
    if (isDemoMode()) mockStore.reorderRequirements(docTypeId, orderedIds);
    if (config.isConfigured) {
      try {
        for (let idx = 0; idx < orderedIds.length; idx++) {
          await supabase
            .from('document_requirements')
            .update({ display_order: idx + 1 })
            .eq('id', orderedIds[idx]);
        }
      } catch (e) {
        if (!isDemoMode()) throw e;
        console.warn('Supabase reorderRequirements error:', e);
      }
    }
  },

  /**
   * Remove a document requirement
   */
  async deleteRequirement(id: string) {
    const config = getSupabaseConfig();
    if (!config.isConfigured && !isDemoMode()) throw new Error(productionConfigurationMessage);
    if (isDemoMode()) mockStore.deleteRequirement(id);
    if (config.isConfigured) {
      try {
        await supabase.from('document_requirements').delete().eq('id', id);
      } catch (e) {
        if (!isDemoMode()) throw e;
      }
    }
  },
};
