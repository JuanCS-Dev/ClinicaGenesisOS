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
  type UpdateData,
  type DocumentData,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { Patient, CreatePatientInput } from '@/types'
import { validateCreatePatient, validateUpdatePatient } from '@/schemas'
import { auditHelper, type AuditUserContext } from './lgpd/audit-helper'

/**
 * Optional audit context for logging LGPD-compliant access.
 * When provided, all operations will be logged for compliance.
 */
export interface PatientServiceAuditContext {
  userId: string
  userName: string
}

/**
 * Calculate age from birth date.
 */
function calculateAge(birthDate: string): number {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }

  return age
}

/**
 * Get the patients collection reference for a clinic.
 */
function getPatientsCollection(clinicId: string) {
  return collection(db, 'clinics', clinicId, 'patients')
}

/**
 * Build audit context from service parameters.
 */
function buildAuditContext(
  clinicId: string,
  auditCtx?: PatientServiceAuditContext
): AuditUserContext | null {
  if (!auditCtx) return null
  return {
    clinicId,
    userId: auditCtx.userId,
    userName: auditCtx.userName,
  }
}

/**
 * Converts Firestore document data to Patient type.
 */
function toPatient(id: string, data: Record<string, unknown>): Patient {
  const birthDate = data.birthDate as string

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
  }
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
    const patientsRef = getPatientsCollection(clinicId)
    const q = query(patientsRef, orderBy('name', 'asc'))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map(docSnap => toPatient(docSnap.id, docSnap.data()))
  },

  /**
   * Get a patient by ID.
   *
   * @param clinicId - The clinic ID
   * @param patientId - The patient ID
   * @param auditCtx - Optional audit context for LGPD logging
   * @returns The patient or null if not found
   */
  async getById(
    clinicId: string,
    patientId: string,
    auditCtx?: PatientServiceAuditContext
  ): Promise<Patient | null> {
    const docRef = doc(db, 'clinics', clinicId, 'patients', patientId)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return null
    }

    const patient = toPatient(docSnap.id, docSnap.data())

    // Log view access for LGPD compliance
    const ctx = buildAuditContext(clinicId, auditCtx)
    if (ctx) {
      await auditHelper.logView(ctx, 'patient', patientId, {
        accessedFields: ['name', 'birthDate', 'phone', 'email', 'cpf', 'gender', 'insurance'],
      })
    }

    return patient
  },

  /**
   * Create a new patient.
   *
   * Validates input using Zod schema before creating.
   *
   * @param clinicId - The clinic ID
   * @param data - The patient data
   * @param auditCtx - Optional audit context for LGPD logging
   * @returns The created patient ID
   * @throws Error if validation fails
   */
  async create(
    clinicId: string,
    data: CreatePatientInput,
    auditCtx?: PatientServiceAuditContext
  ): Promise<string> {
    // Validate input with Zod
    const validation = validateCreatePatient(data)
    if (!validation.success) {
      const errors = validation.error.issues.map((e: { message: string }) => e.message).join(', ')
      throw new Error(`Validation failed: ${errors}`)
    }

    const validatedData = validation.data
    const patientsRef = getPatientsCollection(clinicId)

    const patientData = {
      name: validatedData.name,
      birthDate: validatedData.birthDate,
      phone: validatedData.phone,
      email: validatedData.email,
      avatar: validatedData.avatar || null,
      gender: validatedData.gender,
      address: validatedData.address || null,
      insurance: validatedData.insurance || null,
      insuranceNumber: validatedData.insuranceNumber || null,
      tags: validatedData.tags || [],
      createdAt: serverTimestamp(),
      nextAppointment: validatedData.nextAppointment || null,
    }

    const docRef = await addDoc(patientsRef, patientData)

    // Log create event for LGPD compliance
    const ctx = buildAuditContext(clinicId, auditCtx)
    if (ctx) {
      await auditHelper.logCreate(ctx, 'patient', docRef.id, {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
      })
    }

    return docRef.id
  },

  /**
   * Update an existing patient.
   *
   * Validates input using Zod schema before updating.
   *
   * @param clinicId - The clinic ID
   * @param patientId - The patient ID
   * @param data - The fields to update
   * @param auditCtx - Optional audit context for LGPD logging
   * @throws Error if validation fails
   */
  async update(
    clinicId: string,
    patientId: string,
    data: Partial<Omit<Patient, 'id' | 'createdAt' | 'age'>>,
    auditCtx?: PatientServiceAuditContext
  ): Promise<void> {
    // Validate input with Zod (partial schema)
    const validation = validateUpdatePatient(data)
    if (!validation.success) {
      const errors = validation.error.issues.map((e: { message: string }) => e.message).join(', ')
      throw new Error(`Validation failed: ${errors}`)
    }

    const validatedData = validation.data
    const docRef = doc(db, 'clinics', clinicId, 'patients', patientId)

    // Get previous values for audit log (only if audit context provided)
    const ctx = buildAuditContext(clinicId, auditCtx)
    let previousValues: Record<string, unknown> | undefined
    if (ctx) {
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        const currentData = docSnap.data()
        previousValues = {}
        // Only capture fields that are being updated
        Object.keys(validatedData).forEach(key => {
          if (key in currentData) {
            previousValues![key] = currentData[key]
          }
        })
      }
    }

    const updateData = { ...validatedData } as UpdateData<DocumentData>

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if ((updateData as Record<string, unknown>)[key] === undefined) {
        delete (updateData as Record<string, unknown>)[key]
      }
    })

    await updateDoc(docRef, updateData)

    // Log update event for LGPD compliance
    if (ctx && previousValues) {
      await auditHelper.logUpdate(
        ctx,
        'patient',
        patientId,
        previousValues,
        validatedData as Record<string, unknown>
      )
    }
  },

  /**
   * Delete a patient.
   *
   * Warning: This does NOT delete related records or appointments.
   * Consider implementing cascade delete logic.
   *
   * @param clinicId - The clinic ID
   * @param patientId - The patient ID
   * @param auditCtx - Optional audit context for LGPD logging
   */
  async delete(
    clinicId: string,
    patientId: string,
    auditCtx?: PatientServiceAuditContext
  ): Promise<void> {
    const docRef = doc(db, 'clinics', clinicId, 'patients', patientId)

    // Get previous values for audit log (only if audit context provided)
    const ctx = buildAuditContext(clinicId, auditCtx)
    let previousValues: Record<string, unknown> | undefined
    if (ctx) {
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        previousValues = docSnap.data()
      }
    }

    await deleteDoc(docRef)

    // Log delete event for LGPD compliance
    if (ctx) {
      await auditHelper.logDelete(ctx, 'patient', patientId, previousValues)
    }
  },

  /**
   * Subscribe to real-time updates for all patients.
   *
   * @param clinicId - The clinic ID
   * @param callback - Function called with updated patients array
   * @returns Unsubscribe function
   */
  subscribe(clinicId: string, callback: (patients: Patient[]) => void): () => void {
    const patientsRef = getPatientsCollection(clinicId)
    const q = query(patientsRef, orderBy('name', 'asc'))

    return onSnapshot(
      q,
      querySnapshot => {
        const patients = querySnapshot.docs.map(docSnap => toPatient(docSnap.id, docSnap.data()))
        callback(patients)
      },
      error => {
        console.error('Error subscribing to patients:', error)
        callback([])
      }
    )
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
    const docRef = doc(db, 'clinics', clinicId, 'patients', patientId)

    return onSnapshot(
      docRef,
      docSnap => {
        if (!docSnap.exists()) {
          callback(null)
          return
        }
        callback(toPatient(docSnap.id, docSnap.data()))
      },
      error => {
        console.error('Error subscribing to patient:', error)
        callback(null)
      }
    )
  },

  /**
   * Add a tag to a patient.
   *
   * @param clinicId - The clinic ID
   * @param patientId - The patient ID
   * @param tag - The tag to add
   * @param auditCtx - Optional audit context for LGPD logging
   */
  async addTag(
    clinicId: string,
    patientId: string,
    tag: string,
    auditCtx?: PatientServiceAuditContext
  ): Promise<void> {
    const patient = await this.getById(clinicId, patientId)
    if (!patient) {
      throw new Error(`Patient not found: ${patientId}`)
    }

    const tags = [...new Set([...patient.tags, tag])]
    await this.update(clinicId, patientId, { tags }, auditCtx)
  },

  /**
   * Remove a tag from a patient.
   *
   * @param clinicId - The clinic ID
   * @param patientId - The patient ID
   * @param tag - The tag to remove
   * @param auditCtx - Optional audit context for LGPD logging
   */
  async removeTag(
    clinicId: string,
    patientId: string,
    tag: string,
    auditCtx?: PatientServiceAuditContext
  ): Promise<void> {
    const patient = await this.getById(clinicId, patientId)
    if (!patient) {
      throw new Error(`Patient not found: ${patientId}`)
    }

    const tags = patient.tags.filter(t => t !== tag)
    await this.update(clinicId, patientId, { tags }, auditCtx)
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
    const patientsRef = getPatientsCollection(clinicId)
    const q = query(patientsRef, where('email', '==', email.toLowerCase().trim()), limit(1))

    const snapshot = await getDocs(q)

    if (snapshot.empty) {
      return null
    }

    const docSnap = snapshot.docs[0]
    return toPatient(docSnap.id, docSnap.data())
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
    const patient = await this.getByEmail(clinicId, email)
    return patient !== null
  },
}
