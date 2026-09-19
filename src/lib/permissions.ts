import { UserRole } from '../types';

export type Permission =
  | 'REQUEST_CREATE'
  | 'REQUEST_VIEW_OWN'
  | 'REQUEST_VIEW_QUEUE'
  | 'REQUEST_UPDATE_STATUS'
  | 'REQUEST_ADD_INTERNAL_NOTE'
  | 'MANAGE_USERS'
  | 'MANAGE_DOCUMENT_TYPES'
  | 'VIEW_REPORTS'
  | 'VIEW_AUDIT_LOGS'
  | 'MANAGE_SETTINGS';

const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  STUDENT: ['REQUEST_CREATE', 'REQUEST_VIEW_OWN'],
  STAFF: ['REQUEST_VIEW_QUEUE', 'REQUEST_UPDATE_STATUS', 'REQUEST_ADD_INTERNAL_NOTE', 'VIEW_REPORTS'],
  ADMIN: [
    'REQUEST_VIEW_QUEUE',
    'REQUEST_UPDATE_STATUS',
    'REQUEST_ADD_INTERNAL_NOTE',
    'MANAGE_USERS',
    'MANAGE_DOCUMENT_TYPES',
    'VIEW_REPORTS',
    'VIEW_AUDIT_LOGS',
    'MANAGE_SETTINGS',
  ],
};

export const hasPermission = (role: UserRole | null | undefined, permission: Permission) =>
  Boolean(role && ROLE_PERMISSIONS[role].includes(permission));

export const isRoleAllowed = (role: UserRole | null | undefined, allowedRoles?: UserRole[]) =>
  !allowedRoles || Boolean(role && allowedRoles.includes(role));
