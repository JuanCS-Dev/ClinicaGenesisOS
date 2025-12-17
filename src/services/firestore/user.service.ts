/**
 * User Profile Service
 *
 * Handles CRUD operations for user profiles in Firestore.
 * User profiles link Firebase Auth users to clinics.
 *
 * Collection: /users/{userId}
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { UserProfile, UserRole, SpecialtyType } from '@/types';

/**
 * Input type for creating a new user profile.
 */
export interface CreateUserProfileInput {
  email: string;
  displayName: string;
  role?: UserRole;
  specialty?: SpecialtyType;
  avatar?: string;
}

/**
 * Input type for updating an existing user profile.
 */
export interface UpdateUserProfileInput {
  displayName?: string;
  clinicId?: string | null;
  role?: UserRole;
  specialty?: SpecialtyType;
  avatar?: string;
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
  };
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
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return toUserProfile(docSnap.id, docSnap.data());
  },

  /**
   * Create a new user profile.
   *
   * @param userId - The Firebase Auth user ID
   * @param data - The user profile data
   * @returns The created user profile
   */
  async create(userId: string, data: CreateUserProfileInput): Promise<UserProfile> {
    const docRef = doc(db, 'users', userId);

    const profileData = {
      email: data.email,
      displayName: data.displayName,
      clinicId: null,
      role: data.role || 'professional',
      specialty: data.specialty || 'medicina',
      avatar: data.avatar || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(docRef, profileData);

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
    };
  },

  /**
   * Update an existing user profile.
   *
   * @param userId - The Firebase Auth user ID
   * @param data - The fields to update
   */
  async update(userId: string, data: UpdateUserProfileInput): Promise<void> {
    const docRef = doc(db, 'users', userId);

    const updateData: Record<string, unknown> = {
      ...data,
      updatedAt: serverTimestamp(),
    };

    // Remove undefined values
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    await updateDoc(docRef, updateData);
  },

  /**
   * Subscribe to real-time updates for a user profile.
   *
   * @param userId - The Firebase Auth user ID
   * @param callback - Function called with updated profile
   * @returns Unsubscribe function
   */
  subscribe(
    userId: string,
    callback: (profile: UserProfile | null) => void
  ): () => void {
    const docRef = doc(db, 'users', userId);

    return onSnapshot(
      docRef,
      (docSnap) => {
        if (!docSnap.exists()) {
          callback(null);
          return;
        }
        callback(toUserProfile(docSnap.id, docSnap.data()));
      },
      (error) => {
        console.error('Error subscribing to user profile:', error);
        callback(null);
      }
    );
  },

  /**
   * Check if a user profile exists.
   *
   * @param userId - The Firebase Auth user ID
   * @returns True if profile exists
   */
  async exists(userId: string): Promise<boolean> {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  },

  /**
   * Associate a user with a clinic.
   *
   * @param userId - The Firebase Auth user ID
   * @param clinicId - The clinic ID to associate
   * @param role - The user's role in the clinic
   */
  async joinClinic(
    userId: string,
    clinicId: string,
    role: UserRole = 'professional'
  ): Promise<void> {
    await this.update(userId, { clinicId, role });
  },

  /**
   * Remove a user from their clinic.
   *
   * @param userId - The Firebase Auth user ID
   */
  async leaveClinic(userId: string): Promise<void> {
    await this.update(userId, { clinicId: null, role: 'professional' });
  },
};
