/**
 * Authentication and RBAC Types
 *
 * Defines role-based access control types for multi-tenant clinics.
 * Custom claims are stored in Firebase Auth tokens for secure access control.
 *
 * @module functions/auth/types
 */

/**
 * User roles within a clinic.
 * Must match frontend types in src/types/clinic/clinic.ts
 */
export type UserRole = 'owner' | 'admin' | 'professional' | 'receptionist'

/**
 * Custom claims stored in Firebase Auth token.
 * Set via setCustomUserClaims and accessible in security rules.
 */
export interface CustomClaims {
  /** Clinic ID the user belongs to */
  clinicId: string
  /** User's role within the clinic */
  role: UserRole
  /** Timestamp when claims were set (for cache invalidation) */
  claimsUpdatedAt: number
}

/**
 * Input for setting user claims.
 */
export interface SetUserClaimsInput {
  /** User ID to set claims for */
  targetUserId: string
  /** Clinic ID to associate user with */
  clinicId: string
  /** Role to assign */
  role: UserRole
}

/**
 * Input for revoking user claims.
 */
export interface RevokeUserClaimsInput {
  /** User ID to revoke claims from */
  targetUserId: string
}

/**
 * Role hierarchy for permission checks.
 * Higher number = more permissions.
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  owner: 100,
  admin: 80,
  professional: 60,
  receptionist: 40,
} as const

/**
 * Permission matrix for collections.
 * Defines which roles can perform which operations.
 */
export const PERMISSION_MATRIX = {
  patients: {
    read: ['owner', 'admin', 'professional', 'receptionist'],
    create: ['owner', 'admin', 'professional', 'receptionist'],
    update: ['owner', 'admin', 'professional'],
    delete: ['owner'],
  },
  records: {
    read: ['owner', 'admin', 'professional'],
    create: ['owner', 'professional'],
    update: ['owner', 'professional'],
    delete: [], // Never delete medical records
  },
  appointments: {
    read: ['owner', 'admin', 'professional', 'receptionist'],
    create: ['owner', 'admin', 'professional', 'receptionist'],
    update: ['owner', 'admin', 'professional', 'receptionist'],
    delete: ['owner', 'admin'],
  },
  transactions: {
    read: ['owner', 'admin'],
    create: ['owner', 'admin'],
    update: ['owner', 'admin'],
    delete: ['owner'],
  },
  settings: {
    read: ['owner', 'admin', 'professional', 'receptionist'],
    write: ['owner'],
  },
  consents: {
    read: ['owner', 'admin', 'professional', 'receptionist'],
    create: ['owner', 'admin', 'professional', 'receptionist'],
    update: [], // Consents are immutable
    delete: [], // Consents are immutable
  },
  aiScribeSessions: {
    read: ['owner', 'admin', 'professional'],
    create: ['owner', 'professional'],
    update: [], // Immutable for audit
    delete: [], // Immutable for audit
  },
  labAnalysisSessions: {
    read: ['owner', 'admin', 'professional'],
    create: ['owner', 'professional'],
    update: [], // Immutable for audit
    delete: [], // Immutable for audit
  },
  operadoras: {
    read: ['owner', 'admin', 'professional', 'receptionist'],
    write: ['owner', 'admin'],
  },
  guias: {
    read: ['owner', 'admin', 'professional', 'receptionist'],
    create: ['owner', 'admin', 'professional'],
    update: ['owner', 'admin', 'professional'],
    delete: ['owner'],
  },
  glosas: {
    read: ['owner', 'admin', 'professional', 'receptionist'],
    write: ['owner', 'admin'],
  },
} as const satisfies Record<string, Record<string, readonly UserRole[]>>

/**
 * Valid user roles for validation.
 */
export const VALID_ROLES: readonly UserRole[] = ['owner', 'admin', 'professional', 'receptionist']

/**
 * Check if a string is a valid UserRole.
 */
export function isValidRole(role: string): role is UserRole {
  return VALID_ROLES.includes(role as UserRole)
}
