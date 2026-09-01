import { supabase, getSupabaseConfig } from '../lib/supabase';
import { DocumentType, DocumentRequirement } from '../types';
import { mockStore } from './mockStore';

export const documentService = {
  /**
   * Get all active document types with requirements
   */
  async getActiveDocumentTypes(): Promise<DocumentType[]> {
    const config = getSupabaseConfig();
    if (!config.isConfigured) {
      return mockStore.getDocumentTypes(true);
    }

    try {
      const { data: types, error: typesError } = await supabase
        .from('document_types')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (typesError) throw typesError;
      if (!types || types.length === 0) return mockStore.getDocumentTypes(true);

      const { data: requirements } = await supabase
        .from('document_requirements')
        .select('*');

      return types.map((docType) => ({
        ...docType,
        requirements: requirements?.filter((r) => r.document_type_id === docType.id) || [],
      }));
    } catch (e) {
      return mockStore.getDocumentTypes(true);
    }
  },

  /**
   * Get all document types (active & inactive) for Admin
   */
  async getAllDocumentTypes(): Promise<DocumentType[]> {
    const config = getSupabaseConfig();
    if (!config.isConfigured) {
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
      return mockStore.getDocumentTypes(false);
    }
  },

  /**
   * Create a new document type
   */
  async createDocumentType(
    doc: Omit<DocumentType, 'id' | 'created_at' | 'updated_at' | 'requirements'>,
    requirements: Omit<DocumentRequirement, 'id' | 'document_type_id' | 'created_at'>[] = []
  ) {
    const created = mockStore.createDocumentType(doc as any, requirements);

    const config = getSupabaseConfig();
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
        console.warn('Supabase createDocumentType error:', e);
      }
    }

    return created;
  },

  /**
   * Update an existing document type
   */
  async updateDocumentType(
    id: string,
    updates: Partial<Omit<DocumentType, 'id' | 'created_at' | 'updated_at' | 'requirements'>>
  ) {
    const updated = mockStore.updateDocumentType(id, updates);

    const config = getSupabaseConfig();
    if (config.isConfigured) {
      try {
        await supabase
          .from('document_types')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id);
      } catch (e) {
        console.warn('Supabase updateDocumentType error:', e);
      }
    }

    return updated;
  },

  /**
   * Delete or deactivate document type
   */
  async deleteDocumentType(id: string) {
    mockStore.deleteDocumentType(id);

    const config = getSupabaseConfig();
    if (config.isConfigured) {
      try {
        await supabase.from('document_types').delete().eq('id', id);
      } catch (e) {
        // ignore
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
    if (typeof docTypeIdOrReq === 'string' && optionalReq) {
      result = mockStore.addRequirement(docTypeIdOrReq, optionalReq);
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
      result = mockStore.addRequirement(docTypeIdOrReq.document_type_id, docTypeIdOrReq);
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
        console.warn('Supabase addRequirement error:', e);
      }
    }
    return result;
  },

  /**
   * Update an existing document requirement
   */
  async updateRequirement(id: string, updates: Partial<DocumentRequirement>): Promise<DocumentRequirement | null> {
    const updated = mockStore.updateRequirement(id, updates);

    const config = getSupabaseConfig();
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
    if (!config.isConfigured) {
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
        const all = mockStore.getDocumentTypes(false);
        return all.find((d) => d.id === id) || null;
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
      const all = mockStore.getDocumentTypes(false);
      return all.find((d) => d.id === id) || null;
    }
  },

  /**
   * Reorder requirements for a document type
   */
  async reorderRequirements(docTypeId: string, orderedIds: string[]): Promise<void> {
    mockStore.reorderRequirements(docTypeId, orderedIds);

    const config = getSupabaseConfig();
    if (config.isConfigured) {
      try {
        for (let idx = 0; idx < orderedIds.length; idx++) {
          await supabase
            .from('document_requirements')
            .update({ display_order: idx + 1 })
            .eq('id', orderedIds[idx]);
        }
      } catch (e) {
        console.warn('Supabase reorderRequirements error:', e);
      }
    }
  },

  /**
   * Remove a document requirement
   */
  async deleteRequirement(id: string) {
    mockStore.deleteRequirement(id);

    const config = getSupabaseConfig();
    if (config.isConfigured) {
      try {
        await supabase.from('document_requirements').delete().eq('id', id);
      } catch (e) {
        // ignore
      }
    }
  },
};
