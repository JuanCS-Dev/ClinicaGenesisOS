/**
 * Telemedicine Helpers
 *
 * Collection references and utility functions.
 *
 * @module services/firestore/telemedicine/helpers
 */

import { collection, doc } from 'firebase/firestore';
import { db } from '../../firebase';

/**
 * Get the teleconsultations collection reference for a clinic.
 */
export function getTelemedicineCollection(clinicId: string) {
  return collection(db, 'clinics', clinicId, 'teleconsultations');
}

/**
 * Get a session document reference.
 */
export function getSessionDoc(clinicId: string, sessionId: string) {
  return doc(db, 'clinics', clinicId, 'teleconsultations', sessionId);
}

/**
 * Get the logs subcollection for a session.
 */
export function getLogsCollection(clinicId: string, sessionId: string) {
  return collection(db, 'clinics', clinicId, 'teleconsultations', sessionId, 'logs');
}

/**
 * Generate a unique room name for Jitsi.
 */
export function generateRoomName(clinicId: string, appointmentId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `genesis-${clinicId.substring(0, 8)}-${appointmentId.substring(0, 8)}-${timestamp}-${random}`;
}
