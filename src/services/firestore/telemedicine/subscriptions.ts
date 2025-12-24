/**
 * Telemedicine Real-time Subscriptions
 *
 * Real-time subscription functions for teleconsultation sessions.
 *
 * @module services/firestore/telemedicine/subscriptions
 */

import {
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import type { TelemedicineSession } from '@/types';
import { getTelemedicineCollection, getSessionDoc } from './helpers';
import { toSession } from './converters';

/**
 * Subscribe to real-time updates for a session.
 *
 * @param clinicId - The clinic ID
 * @param sessionId - The session ID
 * @param callback - Function called with updated session
 * @returns Unsubscribe function
 */
export function subscribe(
  clinicId: string,
  sessionId: string,
  callback: (session: TelemedicineSession | null) => void
): () => void {
  const docRef = getSessionDoc(clinicId, sessionId);

  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        callback(toSession(docSnap.id, docSnap.data()));
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error('Error subscribing to telemedicine session:', error);
      callback(null);
    }
  );
}

/**
 * Subscribe to active sessions for a clinic.
 *
 * @param clinicId - The clinic ID
 * @param callback - Function called with updated sessions
 * @returns Unsubscribe function
 */
export function subscribeActive(
  clinicId: string,
  callback: (sessions: TelemedicineSession[]) => void
): () => void {
  const sessionsRef = getTelemedicineCollection(clinicId);
  const q = query(
    sessionsRef,
    where('status', 'in', ['scheduled', 'waiting', 'in_progress']),
    orderBy('scheduledAt', 'asc')
  );

  return onSnapshot(
    q,
    (querySnapshot) => {
      const sessions = querySnapshot.docs.map((docSnap) =>
        toSession(docSnap.id, docSnap.data())
      );
      callback(sessions);
    },
    (error) => {
      console.error('Error subscribing to active telemedicine sessions:', error);
      callback([]);
    }
  );
}
