/**
 * Patient Service
 *
 * Handles CRUD operations for patients in Firestore.
 * Patients are stored as subcollections under clinics for multi-tenancy.
 *
 * Collection: /clinics/{clinicId}/patients/{patientId}
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Patient, CreatePatientInput } from '@/types';

/**
 * Calculate age from birth date.
 */
function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

/**
 * Get the patients collection reference for a clinic.
 */
function getPatientsCollection(clinicId: string) {
  return collection(db, 'clinics', clinicId, 'patients');
}

/**
 * Converts Firestore document data to Patient type.
 */
function toPatient(id: string, data: Record<string, unknown>): Patient {
  const birthDate = data.birthDate as string;

  return {
    id,
    name: data.name as string,
    birthDate,
    age: calculateAge(birthDate),
    phone: data.phone as string,
    email: data.email as string,
    avatar: data.avatar as string | undefined,
    gender: data.gender as string,
    address: data.address as string | undefined,
    insurance: data.insurance as string | undefined,
    insuranceNumber: data.insuranceNumber as string | undefined,
    tags: (data.tags as string[]) || [],
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : (data.createdAt as string),
    nextAppointment: data.nextAppointment as string | undefined,
  };
}

/**
 * Patient service for Firestore operations.
 */
export const patientService = {
  /**
   * Get all patients for a clinic.
   *
   * @param clinicId - The clinic ID
   * @returns Array of patients sorted by name
   */
  async getAll(clinicId: string): Promise<Patient[]> {
    const patientsRef = getPatientsCollection(clinicId);
    const q = query(patientsRef, orderBy('name', 'asc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((docSnap) => toPatient(docSnap.id, docSnap.data()));
  },

  /**
   * Get a patient by ID.
   *
   * @param clinicId - The clinic ID
   * @param patientId - The patient ID
   * @returns The patient or null if not found
   */
  async getById(clinicId: string, patientId: string): Promise<Patient | null> {
    const docRef = doc(db, 'clinics', clinicId, 'patients', patientId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return toPatient(docSnap.id, docSnap.data());
  },

  /**
   * Create a new patient.
   *
   * @param clinicId - The clinic ID
   * @param data - The patient data
   * @returns The created patient ID
   */
  async create(clinicId: string, data: CreatePatientInput): Promise<string> {
    const patientsRef = getPatientsCollection(clinicId);

    const patientData = {
      name: data.name,
      birthDate: data.birthDate,
      phone: data.phone,
      email: data.email,
      avatar: data.avatar || null,
      gender: data.gender,
      address: data.address || null,
      insurance: data.insurance || null,
      insuranceNumber: data.insuranceNumber || null,
      tags: data.tags || [],
      createdAt: serverTimestamp(),
      nextAppointment: data.nextAppointment || null,
    };

    const docRef = await addDoc(patientsRef, patientData);

    return docRef.id;
  },

  /**
   * Update an existing patient.
   *
   * @param clinicId - The clinic ID
   * @param patientId - The patient ID
   * @param data - The fields to update
   */
  async update(
    clinicId: string,
    patientId: string,
    data: Partial<Omit<Patient, 'id' | 'createdAt' | 'age'>>
  ): Promise<void> {
    const docRef = doc(db, 'clinics', clinicId, 'patients', patientId);

    const updateData: Record<string, unknown> = { ...data };

    // Remove undefined values
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    await updateDoc(docRef, updateData);
  },

  /**
   * Delete a patient.
   *
   * Warning: This does NOT delete related records or appointments.
   * Consider implementing cascade delete logic.
   *
   * @param clinicId - The clinic ID
   * @param patientId - The patient ID
   */
  async delete(clinicId: string, patientId: string): Promise<void> {
    const docRef = doc(db, 'clinics', clinicId, 'patients', patientId);
    await deleteDoc(docRef);
  },

  /**
   * Subscribe to real-time updates for all patients.
   *
   * @param clinicId - The clinic ID
   * @param callback - Function called with updated patients array
   * @returns Unsubscribe function
   */
  subscribe(clinicId: string, callback: (patients: Patient[]) => void): () => void {
    const patientsRef = getPatientsCollection(clinicId);
    const q = query(patientsRef, orderBy('name', 'asc'));

    return onSnapshot(
      q,
      (querySnapshot) => {
        const patients = querySnapshot.docs.map((docSnap) =>
          toPatient(docSnap.id, docSnap.data())
        );
        callback(patients);
      },
      (error) => {
        console.error('Error subscribing to patients:', error);
        callback([]);
      }
    );
  },

  /**
   * Subscribe to real-time updates for a single patient.
   *
   * @param clinicId - The clinic ID
   * @param patientId - The patient ID
   * @param callback - Function called with updated patient
   * @returns Unsubscribe function
   */
  subscribeToOne(
    clinicId: string,
    patientId: string,
    callback: (patient: Patient | null) => void
  ): () => void {
    const docRef = doc(db, 'clinics', clinicId, 'patients', patientId);

    return onSnapshot(
      docRef,
      (docSnap) => {
        if (!docSnap.exists()) {
          callback(null);
          return;
        }
        callback(toPatient(docSnap.id, docSnap.data()));
      },
      (error) => {
        console.error('Error subscribing to patient:', error);
        callback(null);
      }
    );
  },

  /**
   * Add a tag to a patient.
   *
   * @param clinicId - The clinic ID
   * @param patientId - The patient ID
   * @param tag - The tag to add
   */
  async addTag(clinicId: string, patientId: string, tag: string): Promise<void> {
    const patient = await this.getById(clinicId, patientId);
    if (!patient) {
      throw new Error(`Patient not found: ${patientId}`);
    }

    const tags = [...new Set([...patient.tags, tag])];
    await this.update(clinicId, patientId, { tags });
  },

  /**
   * Remove a tag from a patient.
   *
   * @param clinicId - The clinic ID
   * @param patientId - The patient ID
   * @param tag - The tag to remove
   */
  async removeTag(clinicId: string, patientId: string, tag: string): Promise<void> {
    const patient = await this.getById(clinicId, patientId);
    if (!patient) {
      throw new Error(`Patient not found: ${patientId}`);
    }

    const tags = patient.tags.filter((t) => t !== tag);
    await this.update(clinicId, patientId, { tags });
  },

  /**
   * Get a patient by email address.
   *
   * Used for patient portal authentication to verify the patient
   * exists in the clinic before allowing access.
   *
   * @param clinicId - The clinic ID
   * @param email - The patient's email address
   * @returns The patient or null if not found
   */
  async getByEmail(clinicId: string, email: string): Promise<Patient | null> {
    const patientsRef = getPatientsCollection(clinicId);
    const q = query(
      patientsRef,
      where('email', '==', email.toLowerCase().trim()),
      limit(1)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const docSnap = snapshot.docs[0];
    return toPatient(docSnap.id, docSnap.data());
  },

  /**
   * Check if a patient exists by email.
   *
   * Lightweight check for authentication validation.
   *
   * @param clinicId - The clinic ID
   * @param email - The patient's email address
   * @returns True if patient exists, false otherwise
   */
  async existsByEmail(clinicId: string, email: string): Promise<boolean> {
    const patient = await this.getByEmail(clinicId, email);
    return patient !== null;
  },
};
