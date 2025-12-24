/**
 * Telemedicine Query Operations
 *
 * Read operations for teleconsultation sessions.
 *
 * @module services/firestore/telemedicine/queries
 */

import {
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import type { TelemedicineSession, TelemedicineLogEntry } from '@/types';
import {
  getTelemedicineCollection,
  getSessionDoc,
  getLogsCollection,
} from './helpers';
import { toSession, toLogEntry } from './converters';

/**
 * Get all teleconsultation sessions for a clinic.
 *
 * @param clinicId - The clinic ID
 * @returns Array of sessions sorted by scheduled date (descending)
 */
export async function getAll(clinicId: string): Promise<TelemedicineSession[]> {
  const sessionsRef = getTelemedicineCollection(clinicId);
  const q = query(sessionsRef, orderBy('scheduledAt', 'desc'));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((docSnap) => toSession(docSnap.id, docSnap.data()));
}

/**
 * Get a session by ID.
 *
 * @param clinicId - The clinic ID
 * @param sessionId - The session ID
 * @returns The session or null if not found
 */
export async function getById(
  clinicId: string,
  sessionId: string
): Promise<TelemedicineSession | null> {
  const docRef = getSessionDoc(clinicId, sessionId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return toSession(docSnap.id, docSnap.data());
}

/**
 * Get session by appointment ID.
 *
 * @param clinicId - The clinic ID
 * @param appointmentId - The appointment ID
 * @returns The session or null if not found
 */
export async function getByAppointment(
  clinicId: string,
  appointmentId: string
): Promise<TelemedicineSession | null> {
  const sessionsRef = getTelemedicineCollection(clinicId);
  const q = query(
    sessionsRef,
    where('appointmentId', '==', appointmentId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const docSnap = querySnapshot.docs[0];
  return toSession(docSnap.id, docSnap.data());
}

/**
 * Get active session for a patient (waiting or in_progress).
 *
 * @param clinicId - The clinic ID
 * @param patientId - The patient ID
 * @returns The active session or null
 */
export async function getActiveByPatient(
  clinicId: string,
  patientId: string
): Promise<TelemedicineSession | null> {
  const sessionsRef = getTelemedicineCollection(clinicId);
  const q = query(
    sessionsRef,
    where('patientId', '==', patientId),
    where('status', 'in', ['waiting', 'in_progress'])
  );
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const docSnap = querySnapshot.docs[0];
  return toSession(docSnap.id, docSnap.data());
}

/**
 * Get all logs for a session.
 *
 * @param clinicId - The clinic ID
 * @param sessionId - The session ID
 * @returns Array of log entries sorted by timestamp
 */
export async function getLogs(
  clinicId: string,
  sessionId: string
): Promise<TelemedicineLogEntry[]> {
  const logsRef = getLogsCollection(clinicId, sessionId);
  const q = query(logsRef, orderBy('timestamp', 'asc'));
  const querySnapshot = await getDocs(q);

  return querySnapshot.docs.map((docSnap) => toLogEntry(docSnap.id, docSnap.data()));
}
