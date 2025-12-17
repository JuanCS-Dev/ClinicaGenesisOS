/**
 * Clinic Service
 *
 * Handles CRUD operations for clinics in Firestore.
 * Each clinic is a multi-tenant container for patients, appointments, and records.
 *
 * Collection: /clinics/{clinicId}
 */

import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Clinic, ClinicSettings, ClinicPlan, CreateClinicInput } from '@/types';

/**
 * Default clinic settings for new clinics.
 */
const DEFAULT_SETTINGS: ClinicSettings = {
  workingHours: {
    start: '08:00',
    end: '18:00',
  },
  defaultAppointmentDuration: 30,
  specialties: ['medicina'],
  timezone: 'America/Sao_Paulo',
};

/**
 * Converts Firestore document data to Clinic type.
 */
function toClinic(id: string, data: Record<string, unknown>): Clinic {
  return {
    id,
    name: data.name as string,
    phone: data.phone as string | undefined,
    email: data.email as string | undefined,
    address: data.address as string | undefined,
    logo: data.logo as string | undefined,
    ownerId: data.ownerId as string,
    plan: (data.plan as ClinicPlan) || 'solo',
    settings: (data.settings as ClinicSettings) || DEFAULT_SETTINGS,
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
 * Clinic service for Firestore operations.
 */
export const clinicService = {
  /**
   * Get a clinic by ID.
   *
   * @param clinicId - The clinic ID
   * @returns The clinic or null if not found
   */
  async getById(clinicId: string): Promise<Clinic | null> {
    const docRef = doc(db, 'clinics', clinicId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return toClinic(docSnap.id, docSnap.data());
  },

  /**
   * Create a new clinic.
   *
   * @param ownerId - The Firebase Auth user ID of the owner
   * @param data - The clinic data
   * @returns The created clinic ID
   */
  async create(ownerId: string, data: CreateClinicInput): Promise<string> {
    const clinicsRef = collection(db, 'clinics');
    const newDocRef = doc(clinicsRef);

    const clinicData = {
      name: data.name,
      phone: data.phone || null,
      email: data.email || null,
      address: data.address || null,
      logo: data.logo || null,
      ownerId,
      plan: data.plan || 'solo',
      settings: data.settings || DEFAULT_SETTINGS,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(newDocRef, clinicData);

    return newDocRef.id;
  },

  /**
   * Update an existing clinic.
   *
   * @param clinicId - The clinic ID
   * @param data - The fields to update
   */
  async update(clinicId: string, data: Partial<Omit<Clinic, 'id' | 'createdAt'>>): Promise<void> {
    const docRef = doc(db, 'clinics', clinicId);

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
   * Delete a clinic.
   *
   * Warning: This does NOT delete subcollections (patients, appointments, records).
   * Consider implementing a Cloud Function for full cleanup.
   *
   * @param clinicId - The clinic ID
   */
  async delete(clinicId: string): Promise<void> {
    const docRef = doc(db, 'clinics', clinicId);
    await deleteDoc(docRef);
  },

  /**
   * Subscribe to real-time updates for a clinic.
   *
   * @param clinicId - The clinic ID
   * @param callback - Function called with updated clinic
   * @returns Unsubscribe function
   */
  subscribe(clinicId: string, callback: (clinic: Clinic | null) => void): () => void {
    const docRef = doc(db, 'clinics', clinicId);

    return onSnapshot(
      docRef,
      (docSnap) => {
        if (!docSnap.exists()) {
          callback(null);
          return;
        }
        callback(toClinic(docSnap.id, docSnap.data()));
      },
      (error) => {
        console.error('Error subscribing to clinic:', error);
        callback(null);
      }
    );
  },

  /**
   * Update clinic settings.
   *
   * @param clinicId - The clinic ID
   * @param settings - The settings to update (partial)
   */
  async updateSettings(clinicId: string, settings: Partial<ClinicSettings>): Promise<void> {
    const clinic = await this.getById(clinicId);
    if (!clinic) {
      throw new Error(`Clinic not found: ${clinicId}`);
    }

    const mergedSettings: ClinicSettings = {
      ...clinic.settings,
      ...settings,
    };

    await this.update(clinicId, { settings: mergedSettings });
  },

  /**
   * Change the clinic's plan.
   *
   * @param clinicId - The clinic ID
   * @param plan - The new plan
   */
  async changePlan(clinicId: string, plan: ClinicPlan): Promise<void> {
    await this.update(clinicId, { plan });
  },
};
