import { describe, expect, it } from 'vitest';
import {
  assertStatusReason,
  assertValidRequestStatusTransition,
  canTransitionRequestStatus,
} from './requestRules';

describe('request workflow rules', () => {
  it('allows the normal registrar lifecycle', () => {
    expect(canTransitionRequestStatus('SUBMITTED', 'UNDER_REVIEW')).toBe(true);
    expect(canTransitionRequestStatus('UNDER_REVIEW', 'FOR_APPROVAL')).toBe(true);
    expect(canTransitionRequestStatus('READY_FOR_RELEASE', 'RELEASED')).toBe(true);
  });

  it('rejects illegal jumps and terminal-state edits', () => {
    expect(() => assertValidRequestStatusTransition('SUBMITTED', 'RELEASED')).toThrow();
    expect(() => assertValidRequestStatusTransition('RELEASED', 'PROCESSING')).toThrow();
  });

  it('requires explanations for consequential outcomes', () => {
    expect(() => assertStatusReason('REJECTED')).toThrow();
    expect(() => assertStatusReason('NEEDS_INFORMATION', undefined, 'Please upload your clearance.')).not.toThrow();
    expect(() => assertStatusReason('CANCELLED', 'Duplicate request')).not.toThrow();
  });
});
