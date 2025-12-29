/**
 * Authentication Module
 *
 * Exports Cloud Functions for RBAC management.
 *
 * @module functions/auth
 */

export { setUserClaims, revokeUserClaims, refreshClaims, setOwnerClaimsInternal } from './claims.js'
export { onClinicCreated } from './triggers.js'
export type { UserRole, CustomClaims, SetUserClaimsInput, RevokeUserClaimsInput } from './types.js'
export { ROLE_HIERARCHY, PERMISSION_MATRIX, VALID_ROLES, isValidRole } from './types.js'
