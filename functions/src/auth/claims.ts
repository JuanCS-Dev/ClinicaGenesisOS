/**
 * Custom Claims Management for RBAC
 *
 * Cloud Functions for setting and revoking Firebase Custom Claims.
 * Custom claims enable secure role-based access control in security rules.
 *
 * SECURITY:
 * - Only clinic owners can set claims for their clinic members
 * - Claims are verified via request.auth.token in security rules
 * - More secure than reading user document (can't be spoofed)
 *
 * @module functions/auth/claims
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { logger } from 'firebase-functions'
import type { SetUserClaimsInput, RevokeUserClaimsInput, CustomClaims, UserRole } from './types.js'
import { isValidRole, VALID_ROLES } from './types.js'

/**
 * Sets custom claims for a user within a clinic.
 *
 * Only the clinic owner can set claims for users in their clinic.
 * This ensures proper tenant isolation and prevents privilege escalation.
 *
 * @param targetUserId - User ID to set claims for
 * @param clinicId - Clinic ID to associate user with
 * @param role - Role to assign (owner, admin, professional, receptionist)
 *
 * @throws UNAUTHENTICATED - If caller is not authenticated
 * @throws PERMISSION_DENIED - If caller is not clinic owner
 * @throws INVALID_ARGUMENT - If role is invalid
 * @throws NOT_FOUND - If clinic doesn't exist
 */
export const setUserClaims = onCall<SetUserClaimsInput>(
  {
    region: 'southamerica-east1',
    memory: '256MiB',
    timeoutSeconds: 30,
  },
  async request => {
    // Require authentication
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be authenticated')
    }

    const { targetUserId, clinicId, role } = request.data

    // Validate input
    if (!targetUserId || typeof targetUserId !== 'string') {
      throw new HttpsError('invalid-argument', 'targetUserId is required')
    }

    if (!clinicId || typeof clinicId !== 'string') {
      throw new HttpsError('invalid-argument', 'clinicId is required')
    }

    if (!role || !isValidRole(role)) {
      throw new HttpsError(
        'invalid-argument',
        `Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`
      )
    }

    const db = getFirestore()
    const auth = getAuth()

    // Get caller's current claims to verify permissions
    const callerToken = request.auth.token
    const callerClinicId = callerToken.clinicId as string | undefined
    const callerRole = callerToken.role as UserRole | undefined

    // Option 1: Caller has custom claims and is owner of the same clinic
    const isOwnerViaClaims = callerClinicId === clinicId && callerRole === 'owner'

    // Option 2: Caller is the clinic document owner (for initial setup)
    let isOwnerViaDocument = false

    const clinicDoc = await db.collection('clinics').doc(clinicId).get()
    if (!clinicDoc.exists) {
      throw new HttpsError('not-found', 'Clinic not found')
    }

    const clinicData = clinicDoc.data()
    if (clinicData?.ownerId === request.auth.uid) {
      isOwnerViaDocument = true
    }

    // Must be owner via claims OR via document
    if (!isOwnerViaClaims && !isOwnerViaDocument) {
      logger.warn('Permission denied for setUserClaims', {
        caller: request.auth.uid,
        targetUserId,
        clinicId,
        callerClinicId,
        callerRole,
      })
      throw new HttpsError('permission-denied', 'Only clinic owner can set user claims')
    }

    // Prevent setting owner role via this function (owner is set during clinic creation)
    if (role === 'owner' && targetUserId !== request.auth.uid) {
      throw new HttpsError('permission-denied', 'Cannot assign owner role to another user')
    }

    // Set custom claims
    const claims: CustomClaims = {
      clinicId,
      role,
      claimsUpdatedAt: Date.now(),
    }

    await auth.setCustomUserClaims(targetUserId, claims)

    // Also update the user document for consistency
    const userRef = db.collection('users').doc(targetUserId)
    const userDoc = await userRef.get()

    if (userDoc.exists) {
      await userRef.update({
        clinicId,
        role,
        updatedAt: new Date().toISOString(),
      })
    }

    logger.info('User claims set successfully', {
      caller: request.auth.uid,
      targetUserId,
      clinicId,
      role,
    })

    return { success: true, claimsUpdatedAt: claims.claimsUpdatedAt }
  }
)

/**
 * Revokes custom claims from a user.
 *
 * Only the clinic owner can revoke claims for users in their clinic.
 * After revocation, user will lose access to clinic data.
 *
 * @param targetUserId - User ID to revoke claims from
 *
 * @throws UNAUTHENTICATED - If caller is not authenticated
 * @throws PERMISSION_DENIED - If caller is not clinic owner or if revoking own claims
 */
export const revokeUserClaims = onCall<RevokeUserClaimsInput>(
  {
    region: 'southamerica-east1',
    memory: '256MiB',
    timeoutSeconds: 30,
  },
  async request => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be authenticated')
    }

    const { targetUserId } = request.data

    if (!targetUserId || typeof targetUserId !== 'string') {
      throw new HttpsError('invalid-argument', 'targetUserId is required')
    }

    // Owner cannot revoke their own claims
    if (targetUserId === request.auth.uid) {
      throw new HttpsError(
        'permission-denied',
        'Cannot revoke your own claims. Transfer ownership first.'
      )
    }

    const db = getFirestore()
    const auth = getAuth()

    // Get target user's current claims
    const targetUser = await auth.getUser(targetUserId)
    const targetClinicId = targetUser.customClaims?.clinicId as string | undefined

    if (!targetClinicId) {
      // User has no claims, nothing to revoke
      return { success: true, message: 'User has no claims' }
    }

    // Verify caller is owner of the same clinic
    const callerToken = request.auth.token
    const callerClinicId = callerToken.clinicId as string | undefined
    const callerRole = callerToken.role as UserRole | undefined

    const isOwnerViaClaims = callerClinicId === targetClinicId && callerRole === 'owner'

    // Also check clinic document ownership
    let isOwnerViaDocument = false
    const clinicDoc = await db.collection('clinics').doc(targetClinicId).get()
    if (clinicDoc.exists && clinicDoc.data()?.ownerId === request.auth.uid) {
      isOwnerViaDocument = true
    }

    if (!isOwnerViaClaims && !isOwnerViaDocument) {
      throw new HttpsError('permission-denied', 'Only clinic owner can revoke user claims')
    }

    // Revoke claims by setting to null
    await auth.setCustomUserClaims(targetUserId, null)

    // Update user document
    const userRef = db.collection('users').doc(targetUserId)
    const userDoc = await userRef.get()

    if (userDoc.exists) {
      await userRef.update({
        clinicId: null,
        role: 'receptionist', // Default role
        updatedAt: new Date().toISOString(),
      })
    }

    logger.info('User claims revoked', {
      caller: request.auth.uid,
      targetUserId,
      previousClinicId: targetClinicId,
    })

    return { success: true }
  }
)

/**
 * Sets initial owner claims when creating a clinic.
 * Called internally by clinic creation trigger.
 *
 * @internal
 */
export async function setOwnerClaimsInternal(userId: string, clinicId: string): Promise<void> {
  const auth = getAuth()

  const claims: CustomClaims = {
    clinicId,
    role: 'owner',
    claimsUpdatedAt: Date.now(),
  }

  await auth.setCustomUserClaims(userId, claims)

  logger.info('Owner claims set for new clinic', {
    userId,
    clinicId,
  })
}

/**
 * Refreshes custom claims to force token refresh.
 * Useful after claim changes to invalidate cached tokens.
 */
export const refreshClaims = onCall<void>(
  {
    region: 'southamerica-east1',
    memory: '128MiB',
    timeoutSeconds: 10,
  },
  async request => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be authenticated')
    }

    const auth = getAuth()
    const user = await auth.getUser(request.auth.uid)

    return {
      claims: user.customClaims || null,
      message: 'Refresh your ID token to get updated claims',
    }
  }
)
