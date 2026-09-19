import { RequestStatus } from '../types';

/**
 * The request lifecycle is deliberately explicit. Keep this map in sync with
 * the database trigger in supabase/migrations/07_workflow_guards.sql.
 */
export const REQUEST_STATUS_TRANSITIONS: Record<RequestStatus, readonly RequestStatus[]> = {
  SUBMITTED: ['UNDER_REVIEW', 'CANCELLED', 'REJECTED', 'NEEDS_INFORMATION'],
  UNDER_REVIEW: ['FOR_APPROVAL', 'APPROVED', 'PROCESSING', 'NEEDS_INFORMATION', 'REJECTED', 'CANCELLED'],
  FOR_APPROVAL: ['APPROVED', 'REJECTED', 'NEEDS_INFORMATION'],
  APPROVED: ['PROCESSING', 'REJECTED', 'CANCELLED'],
  PROCESSING: ['READY_FOR_RELEASE', 'REJECTED', 'NEEDS_INFORMATION'],
  READY_FOR_RELEASE: ['RELEASED', 'PROCESSING'],
  RELEASED: [],
  REJECTED: [],
  CANCELLED: [],
  NEEDS_INFORMATION: ['UNDER_REVIEW', 'CANCELLED', 'REJECTED'],
};

export class RequestRuleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RequestRuleError';
  }
}

export const canTransitionRequestStatus = (from: RequestStatus, to: RequestStatus) =>
  from === to || REQUEST_STATUS_TRANSITIONS[from].includes(to);

export const assertValidRequestStatusTransition = (from: RequestStatus, to: RequestStatus) => {
  if (!canTransitionRequestStatus(from, to)) {
    throw new RequestRuleError(
      `A request cannot move from ${from.replace(/_/g, ' ')} to ${to.replace(/_/g, ' ')}.`,
    );
  }
};

export const assertStatusReason = (status: RequestStatus, reason?: string, comment?: string) => {
  const explanation = `${reason || ''} ${comment || ''}`.trim();
  if ((status === 'REJECTED' || status === 'NEEDS_INFORMATION' || status === 'CANCELLED') && explanation.length < 3) {
    throw new RequestRuleError(`Please provide a reason when marking a request ${status.replace(/_/g, ' ').toLowerCase()}.`);
  }
};
