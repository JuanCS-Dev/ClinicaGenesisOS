/**
 * Authentication Middleware for Cloud Functions
 *
 * Validates authentication and authorization for callable functions.
 * Uses Firebase Custom Claims for RBAC.
 * Supports both v1 (functions.https.onCall) and v2 (onCall from v2/https).
 *
 * @module functions/middleware/auth
 */

import { HttpsError, CallableRequest } from 'firebase-functions/v2/https'
import * as functionsV1 from 'firebase-functions'
import type { UserRole } from '../auth/types.js'

/**
 * Extended request with validated auth data (v2 style).
 */
export interface AuthenticatedRequest<T = unknown> extends CallableRequest<T> {
  auth: NonNullable<CallableRequest['auth']>
  clinicId: string
  role: UserRole
  userId: string
}

/**
 * Validated auth context for v1 style functions.
 */
export interface ValidatedAuthContext {
  auth: NonNullable<functionsV1.https.CallableContext['auth']>
  clinicId: string
  role: UserRole
  userId: string
}

/**
 * Validates that the request is authenticated and has clinic claims.
 *
 * @throws UNAUTHENTICATED - If no auth token
 * @throws PERMISSION_DENIED - If no clinic association
 */
export function requireAuth<T>(request: CallableRequest<T>): AuthenticatedRequest<T> {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Authentication required')
  }

  const { clinicId, role } = request.auth.token as { clinicId?: string; role?: UserRole }

  if (!clinicId) {
    throw new HttpsError(
      'permission-denied',
      'User not associated with a clinic. Please contact your administrator.'
    )
  }

  return {
    ...request,
    auth: request.auth,
    clinicId,
    role: role || 'receptionist',
    userId: request.auth.uid,
  } as AuthenticatedRequest<T>
}

/**
 * Validates that the user has one of the allowed roles.
 *
 * @throws PERMISSION_DENIED - If role not allowed
 */
export function requireRole(request: AuthenticatedRequest, allowedRoles: UserRole[]): void {
  if (!allowedRoles.includes(request.role)) {
    throw new HttpsError(
      'permission-denied',
      `Access denied. Required role: ${allowedRoles.join(' or ')}`
    )
  }
}

/**
 * Validates that the user belongs to the target clinic.
 * Prevents cross-tenant access.
 *
 * @throws PERMISSION_DENIED - If clinic mismatch
 */
export function requireClinicAccess(request: AuthenticatedRequest, targetClinicId: string): void {
  if (request.clinicId !== targetClinicId) {
    throw new HttpsError('permission-denied', 'Access denied to this clinic')
  }
}

/**
 * Combined validation: auth + clinic access.
 * Use this for most callable functions.
 */
export function requireAuthAndClinic<T>(
  request: CallableRequest<T>,
  targetClinicId: string
): AuthenticatedRequest<T> {
  const authRequest = requireAuth(request)
  requireClinicAccess(authRequest, targetClinicId)
  return authRequest
}

/**
 * Combined validation: auth + role + clinic access.
 * Use for sensitive operations like payments.
 */
export function requireAuthRoleAndClinic<T>(
  request: CallableRequest<T>,
  targetClinicId: string,
  allowedRoles: UserRole[]
): AuthenticatedRequest<T> {
  const authRequest = requireAuth(request)
  requireRole(authRequest, allowedRoles)
  requireClinicAccess(authRequest, targetClinicId)
  return authRequest
}

// =============================================================================
// V1 Style Middleware (for functions.https.onCall with data, context)
// =============================================================================

/**
 * Validates v1-style callable context has auth and clinic claims.
 *
 * @throws UNAUTHENTICATED - If no auth token
 * @throws PERMISSION_DENIED - If no clinic association
 */
export function requireAuthV1(context: functionsV1.https.CallableContext): ValidatedAuthContext {
  if (!context.auth) {
    throw new functionsV1.https.HttpsError('unauthenticated', 'Authentication required')
  }

  const { clinicId, role } = context.auth.token as { clinicId?: string; role?: UserRole }

  if (!clinicId) {
    throw new functionsV1.https.HttpsError(
      'permission-denied',
      'User not associated with a clinic. Please contact your administrator.'
    )
  }

  return {
    auth: context.auth,
    clinicId,
    role: role || 'receptionist',
    userId: context.auth.uid,
  }
}

/**
 * Validates v1-style role.
 */
export function requireRoleV1(validatedAuth: ValidatedAuthContext, allowedRoles: UserRole[]): void {
  if (!allowedRoles.includes(validatedAuth.role)) {
    throw new functionsV1.https.HttpsError(
      'permission-denied',
      `Access denied. Required role: ${allowedRoles.join(' or ')}`
    )
  }
}

/**
 * Validates v1-style clinic access.
 */
export function requireClinicAccessV1(
  validatedAuth: ValidatedAuthContext,
  targetClinicId: string
): void {
  if (validatedAuth.clinicId !== targetClinicId) {
    throw new functionsV1.https.HttpsError('permission-denied', 'Access denied to this clinic')
  }
}

/**
 * Combined v1 validation: auth + clinic access.
 */
export function requireAuthAndClinicV1(
  context: functionsV1.https.CallableContext,
  targetClinicId: string
): ValidatedAuthContext {
  const validatedAuth = requireAuthV1(context)
  requireClinicAccessV1(validatedAuth, targetClinicId)
  return validatedAuth
}

/**
 * Combined v1 validation: auth + role + clinic access.
 */
export function requireAuthRoleAndClinicV1(
  context: functionsV1.https.CallableContext,
  targetClinicId: string,
  allowedRoles: UserRole[]
): ValidatedAuthContext {
  const validatedAuth = requireAuthV1(context)
  requireRoleV1(validatedAuth, allowedRoles)
  requireClinicAccessV1(validatedAuth, targetClinicId)
  return validatedAuth
}
