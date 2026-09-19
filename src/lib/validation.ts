import { z } from 'zod';
import { ReleaseMethod } from '../types';

const releaseMethods = ['PICKUP', 'DIGITAL_COPY', 'COURIER'] as const;

export const submitRequestSchema = z.object({
  documentTypeId: z.string().trim().min(1, 'Select a document type.'),
  studentId: z.string().trim().min(1, 'A student profile is required.'),
  quantity: z.number().int().min(1, 'Request at least one copy.').max(20, 'You can request up to 20 copies.'),
  purpose: z.string().trim().min(3, 'Tell us what you need the document for.').max(500),
  releaseMethod: z.enum(releaseMethods),
  deliveryAddress: z.string().trim().max(500).optional(),
  remarks: z.string().trim().max(1000).optional(),
  fee: z.number().nonnegative().optional(),
});

export type NormalizedSubmitRequest = z.infer<typeof submitRequestSchema> & { releaseMethod: ReleaseMethod };

export const normalizeSubmitRequest = (payload: {
  documentTypeId?: string;
  document_type_id?: string;
  studentId?: string;
  student_id?: string;
  quantity: number;
  purpose: string;
  releaseMethod?: ReleaseMethod;
  release_method?: ReleaseMethod;
  deliveryAddress?: string;
  delivery_address?: string;
  remarks?: string;
  fee?: number;
}) => {
  const normalized = submitRequestSchema.parse({
    documentTypeId: payload.documentTypeId || payload.document_type_id,
    studentId: payload.studentId || payload.student_id,
    quantity: payload.quantity,
    purpose: payload.purpose,
    releaseMethod: payload.releaseMethod || payload.release_method || 'PICKUP',
    deliveryAddress: payload.deliveryAddress || payload.delivery_address || undefined,
    remarks: payload.remarks || undefined,
    fee: payload.fee,
  });

  if (normalized.releaseMethod === 'COURIER' && !normalized.deliveryAddress) {
    throw new Error('A delivery address is required for courier release.');
  }

  return normalized as NormalizedSubmitRequest;
};
