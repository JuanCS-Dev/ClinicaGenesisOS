/**
 * Appointment Service
 *
 * Handles CRUD operations for appointments in Firestore.
 * Appointments are stored as subcollections under clinics for multi-tenancy.
 *
 * Collection: /clinics/{clinicId}/appointments/{appointmentId}
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
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  type UpdateData,
  type DocumentData,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { Appointment, Status, CreateAppointmentInput } from '@/types'

/**
 * Get the appointments collection reference for a clinic.
 */
function getAppointmentsCollection(clinicId: string) {
  return collection(db, 'clinics', clinicId, 'appointments')
}

/**
 * Converts Firestore document data to Appointment type.
 */
function toAppointment(id: string, data: Record<string, unknown>): Appointment {
  return {
    id,
    patientId: data.patientId as string,
    patientName: data.patientName as string,
    date: data.date as string,
    durationMin: data.durationMin as number,
    procedure: data.procedure as string,
    status: data.status as Status,
    professional: data.professional as string,
    specialty: data.specialty as Appointment['specialty'],
    notes: data.notes as string | undefined,
  }
}

/**
 * Appointment service for Firestore operations.
 */
export const appointmentService = {
  /**
   * Get all appointments for a clinic.
   *
   * @param clinicId - The clinic ID
   * @returns Array of appointments sorted by date (ascending)
   */
  async getAll(clinicId: string): Promise<Appointment[]> {
    const appointmentsRef = getAppointmentsCollection(clinicId)
    const q = query(appointmentsRef, orderBy('date', 'asc'))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map(docSnap => toAppointment(docSnap.id, docSnap.data()))
  },

  /**
   * Get appointments for a specific date.
   *
   * @param clinicId - The clinic ID
   * @param date - The date in YYYY-MM-DD format
   * @returns Array of appointments for that date
   */
  async getByDate(clinicId: string, date: string): Promise<Appointment[]> {
    const appointmentsRef = getAppointmentsCollection(clinicId)
    const q = query(
      appointmentsRef,
      where('date', '>=', `${date}T00:00:00`),
      where('date', '<', `${date}T23:59:59`),
      orderBy('date', 'asc')
    )
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map(docSnap => toAppointment(docSnap.id, docSnap.data()))
  },

  /**
   * Get appointments for a specific patient.
   *
   * @param clinicId - The clinic ID
   * @param patientId - The patient ID
   * @returns Array of appointments sorted by date (descending)
   */
  async getByPatient(clinicId: string, patientId: string): Promise<Appointment[]> {
    const appointmentsRef = getAppointmentsCollection(clinicId)
    const q = query(appointmentsRef, where('patientId', '==', patientId), orderBy('date', 'desc'))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map(docSnap => toAppointment(docSnap.id, docSnap.data()))
  },

  /**
   * Get an appointment by ID.
   *
   * @param clinicId - The clinic ID
   * @param appointmentId - The appointment ID
   * @returns The appointment or null if not found
   */
  async getById(clinicId: string, appointmentId: string): Promise<Appointment | null> {
    const docRef = doc(db, 'clinics', clinicId, 'appointments', appointmentId)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return null
    }

    return toAppointment(docSnap.id, docSnap.data())
  },

  /**
   * Create a new appointment.
   *
   * @param clinicId - The clinic ID
   * @param data - The appointment data
   * @returns The created appointment ID
   */
  async create(clinicId: string, data: CreateAppointmentInput): Promise<string> {
    const appointmentsRef = getAppointmentsCollection(clinicId)

    const appointmentData = {
      patientId: data.patientId,
      patientName: data.patientName,
      date: data.date,
      durationMin: data.durationMin,
      procedure: data.procedure,
      status: data.status,
      professional: data.professional,
      specialty: data.specialty,
      notes: data.notes || null,
      createdAt: serverTimestamp(),
    }

    const docRef = await addDoc(appointmentsRef, appointmentData)

    return docRef.id
  },

  /**
   * Update an existing appointment.
   *
   * @param clinicId - The clinic ID
   * @param appointmentId - The appointment ID
   * @param data - The fields to update
   */
  async update(
    clinicId: string,
    appointmentId: string,
    data: Partial<Omit<Appointment, 'id'>>
  ): Promise<void> {
    const docRef = doc(db, 'clinics', clinicId, 'appointments', appointmentId)

    const updateData = { ...data } as UpdateData<DocumentData>

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if ((updateData as Record<string, unknown>)[key] === undefined) {
        delete (updateData as Record<string, unknown>)[key]
      }
    })

    await updateDoc(docRef, updateData)
  },

  /**
   * Update the status of an appointment.
   *
   * @param clinicId - The clinic ID
   * @param appointmentId - The appointment ID
   * @param status - The new status
   */
  async updateStatus(clinicId: string, appointmentId: string, status: Status): Promise<void> {
    await this.update(clinicId, appointmentId, { status })
  },

  /**
   * Delete an appointment.
   *
   * @param clinicId - The clinic ID
   * @param appointmentId - The appointment ID
   */
  async delete(clinicId: string, appointmentId: string): Promise<void> {
    const docRef = doc(db, 'clinics', clinicId, 'appointments', appointmentId)
    await deleteDoc(docRef)
  },

  /**
   * Subscribe to real-time updates for all appointments.
   *
   * @param clinicId - The clinic ID
   * @param callback - Function called with updated appointments array
   * @returns Unsubscribe function
   */
  subscribe(clinicId: string, callback: (appointments: Appointment[]) => void): () => void {
    const appointmentsRef = getAppointmentsCollection(clinicId)
    const q = query(appointmentsRef, orderBy('date', 'asc'))

    return onSnapshot(
      q,
      querySnapshot => {
        const appointments = querySnapshot.docs.map(docSnap =>
          toAppointment(docSnap.id, docSnap.data())
        )
        callback(appointments)
      },
      error => {
        console.error('Error subscribing to appointments:', error)
        callback([])
      }
    )
  },

  /**
   * Subscribe to real-time updates for appointments on a specific date.
   *
   * @param clinicId - The clinic ID
   * @param date - The date in YYYY-MM-DD format
   * @param callback - Function called with updated appointments array
   * @returns Unsubscribe function
   */
  subscribeByDate(
    clinicId: string,
    date: string,
    callback: (appointments: Appointment[]) => void
  ): () => void {
    const appointmentsRef = getAppointmentsCollection(clinicId)
    const q = query(
      appointmentsRef,
      where('date', '>=', `${date}T00:00:00`),
      where('date', '<', `${date}T23:59:59`),
      orderBy('date', 'asc')
    )

    return onSnapshot(
      q,
      querySnapshot => {
        const appointments = querySnapshot.docs.map(docSnap =>
          toAppointment(docSnap.id, docSnap.data())
        )
        callback(appointments)
      },
      error => {
        console.error('Error subscribing to appointments by date:', error)
        callback([])
      }
    )
  },

  /**
   * Subscribe to real-time updates for a patient's appointments.
   *
   * @param clinicId - The clinic ID
   * @param patientId - The patient ID
   * @param callback - Function called with updated appointments array
   * @returns Unsubscribe function
   */
  subscribeByPatient(
    clinicId: string,
    patientId: string,
    callback: (appointments: Appointment[]) => void
  ): () => void {
    const appointmentsRef = getAppointmentsCollection(clinicId)
    const q = query(appointmentsRef, where('patientId', '==', patientId), orderBy('date', 'desc'))

    return onSnapshot(
      q,
      querySnapshot => {
        const appointments = querySnapshot.docs.map(docSnap =>
          toAppointment(docSnap.id, docSnap.data())
        )
        callback(appointments)
      },
      error => {
        console.error('Error subscribing to patient appointments:', error)
        callback([])
      }
    )
  },
}
