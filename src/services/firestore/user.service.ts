/**
 * User Profile Service
 *
 * Handles CRUD operations for user profiles in Firestore.
 * User profiles link Firebase Auth users to clinics.
 *
 * Collection: /users/{userId}
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  type UpdateData,
  type DocumentData,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { UserProfile, UserRole, SpecialtyType } from '@/types'
import { auditHelper, type AuditUserContext } from './lgpd/audit-helper'

/**
 * Audit context for user operations.
 * Optional because users may not be associated with a clinic.
 */
export interface UserAuditContext {
  actorId: string
  actorName: string
  clinicId: string
}

/**
 * Build audit context for user operations.
 */
function buildAuditContext(ctx?: UserAuditContext): AuditUserContext | null {
  if (!ctx) return null
  return { clinicId: ctx.clinicId, userId: ctx.actorId, userName: ctx.actorName }
}

/**
 * Input type for creating a new user profile.
 */
export interface CreateUserProfileInput {
  email: string
  displayName: string
  role?: UserRole
  specialty?: SpecialtyType
  avatar?: string
}

/**
 * Input type for updating an existing user profile.
 */
export interface UpdateUserProfileInput {
  displayName?: string
  clinicId?: string | null
  role?: UserRole
  specialty?: SpecialtyType
  avatar?: string
}

/**
 * Converts Firestore document data to UserProfile type.
 */
function toUserProfile(id: string, data: Record<string, unknown>): UserProfile {
  return {
    id,
    email: data.email as string,
    displayName: data.displayName as string,
    clinicId: (data.clinicId as string) || null,
    role: (data.role as UserRole) || 'professional',
    specialty: (data.specialty as SpecialtyType) || 'medicina',
    avatar: data.avatar as string | undefined,
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : (data.createdAt as string),
    updatedAt:
      data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate().toISOString()
        : (data.updatedAt as string),
  }
}

/**
 * User profile service for Firestore operations.
 */
export const userService = {
  /**
   * Get a user profile by ID.
   *
   * @param userId - The Firebase Auth user ID
   * @returns The user profile or null if not found
   */
  async getById(userId: string): Promise<UserProfile | null> {
    const docRef = doc(db, 'users', userId)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return null
    }

    return toUserProfile(docSnap.id, docSnap.data())
  },

  /**
   * Create a new user profile.
   *
   * @param userId - The Firebase Auth user ID
   * @param data - The user profile data
   * @returns The created user profile
   */
  async create(userId: string, data: CreateUserProfileInput): Promise<UserProfile> {
    const docRef = doc(db, 'users', userId)

    const profileData = {
      email: data.email,
      displayName: data.displayName,
      clinicId: null,
      role: data.role || 'professional',
      specialty: data.specialty || 'medicina',
      avatar: data.avatar || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    await setDoc(docRef, profileData)

    return {
      id: userId,
      email: data.email,
      displayName: data.displayName,
      clinicId: null,
      role: data.role || 'professional',
      specialty: data.specialty || 'medicina',
      avatar: data.avatar,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  },

  /**
   * Update an existing user profile.
   *
   * @param userId - The Firebase Auth user ID
   * @param data - The fields to update
   * @param auditCtx - Optional audit context (required for role/clinic changes)
   */
  async update(
    userId: string,
    data: UpdateUserProfileInput,
    auditCtx?: UserAuditContext
  ): Promise<void> {
    const docRef = doc(db, 'users', userId)

    // Get previous values for audit if changing sensitive fields
    const ctx = buildAuditContext(auditCtx)
    let previousValues: Record<string, unknown> | undefined
    const sensitiveFields = ['role', 'clinicId']
    const hasSensitiveChange = sensitiveFields.some(f => f in data)

    if (ctx && hasSensitiveChange) {
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        previousValues = {}
        sensitiveFields.forEach(key => {
          const docData = docSnap.data()
          if (key in data && key in docData) {
            previousValues![key] = docData[key]
          }
        })
      }
    }

    const updateData = {
      ...data,
      updatedAt: serverTimestamp(),
    } as UpdateData<DocumentData>

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if ((updateData as Record<string, unknown>)[key] === undefined) {
        delete (updateData as Record<string, unknown>)[key]
      }
    })

    await updateDoc(docRef, updateData)

    // LGPD audit log for sensitive field changes (role, clinicId)
    if (ctx && hasSensitiveChange && previousValues) {
      await auditHelper.logUpdate(
        ctx,
        'user',
        userId,
        previousValues,
        data as Record<string, unknown>
      )
    }
  },

  /**
   * Subscribe to real-time updates for a user profile.
   *
   * @param userId - The Firebase Auth user ID
   * @param callback - Function called with updated profile
   * @returns Unsubscribe function
   */
  subscribe(userId: string, callback: (profile: UserProfile | null) => void): () => void {
    const docRef = doc(db, 'users', userId)

    return onSnapshot(
      docRef,
      docSnap => {
        if (!docSnap.exists()) {
          callback(null)
          return
        }
        callback(toUserProfile(docSnap.id, docSnap.data()))
      },
      error => {
        console.error('Error subscribing to user profile:', error)
        callback(null)
      }
    )
  },

  /**
   * Check if a user profile exists.
   *
   * @param userId - The Firebase Auth user ID
   * @returns True if profile exists
   */
  async exists(userId: string): Promise<boolean> {
    const docRef = doc(db, 'users', userId)
    const docSnap = await getDoc(docRef)
    return docSnap.exists()
  },

  /**
   * Associate a user with a clinic.
   *
   * @param userId - The Firebase Auth user ID
   * @param clinicId - The clinic ID to associate
   * @param role - The user's role in the clinic
   * @param auditCtx - Audit context (actor who is granting access)
   */
  async joinClinic(
    userId: string,
    clinicId: string,
    role: UserRole = 'professional',
    auditCtx?: UserAuditContext
  ): Promise<void> {
    // Get previous state for audit
    const previousProfile = await this.getById(userId)

    await this.update(userId, { clinicId, role })

    // LGPD audit log - user access granted
    const ctx = buildAuditContext(auditCtx || { actorId: userId, actorName: 'Sistema', clinicId })
    if (ctx) {
      await auditHelper.logCreate(ctx, 'user', userId, {
        action: 'join_clinic',
        userId,
        role,
        previousClinicId: previousProfile?.clinicId || null,
      })
    }
  },

  /**
   * Remove a user from their clinic.
   *
   * @param userId - The Firebase Auth user ID
   * @param auditCtx - Audit context (actor who is revoking access)
   */
  async leaveClinic(userId: string, auditCtx?: UserAuditContext): Promise<void> {
    // Get previous state for audit
    const previousProfile = await this.getById(userId)
    const previousClinicId = previousProfile?.clinicId

    await this.update(userId, { clinicId: null, role: 'professional' })

    // LGPD audit log - user access revoked
    if (previousClinicId) {
      const ctx = buildAuditContext(
        auditCtx || { actorId: userId, actorName: 'Sistema', clinicId: previousClinicId }
      )
      if (ctx) {
        await auditHelper.logDelete(ctx, 'user', userId, {
          action: 'leave_clinic',
          userId,
          previousRole: previousProfile?.role,
          previousClinicId,
        })
      }
    }
  },

  /**
   * Get all professionals for a clinic.
   *
   * @param clinicId - The clinic ID
   * @returns Array of user profiles associated with the clinic
   */
  async getByClinic(clinicId: string): Promise<UserProfile[]> {
    const usersRef = collection(db, 'users')
    const q = query(usersRef, where('clinicId', '==', clinicId))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map(docSnap => toUserProfile(docSnap.id, docSnap.data()))
  },
}
