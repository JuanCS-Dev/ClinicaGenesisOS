/**
 * Telemedicine Service
 *
 * Handles CRUD operations for teleconsultation sessions in Firestore.
 * Sessions are stored as subcollections under clinics for multi-tenancy.
 *
 * Collection: /clinics/{clinicId}/teleconsultations/{sessionId}
 * Logs: /clinics/{clinicId}/teleconsultations/{sessionId}/logs/{logId}
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import type {
  TelemedicineSession,
  TelemedicineStatus,
  CreateTelemedicineSessionInput,
  TelemedicineParticipant,
  TelemedicineLogEntry,
} from '@/types';

/**
 * Get the teleconsultations collection reference for a clinic.
 */
function getTelemedicineCollection(clinicId: string) {
  return collection(db, 'clinics', clinicId, 'teleconsultations');
}

/**
 * Get the logs subcollection for a session.
 */
function getLogsCollection(clinicId: string, sessionId: string) {
  return collection(db, 'clinics', clinicId, 'teleconsultations', sessionId, 'logs');
}

/**
 * Generate a unique room name for Jitsi.
 */
function generateRoomName(clinicId: string, appointmentId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `genesis-${clinicId.substring(0, 8)}-${appointmentId.substring(0, 8)}-${timestamp}-${random}`;
}

/**
 * Converts Firestore document data to TelemedicineSession type.
 */
function toSession(id: string, data: Record<string, unknown>): TelemedicineSession {
  return {
    id,
    appointmentId: data.appointmentId as string,
    patientId: data.patientId as string,
    patientName: data.patientName as string,
    professionalId: data.professionalId as string,
    professionalName: data.professionalName as string,
    roomName: data.roomName as string,
    status: data.status as TelemedicineStatus,
    participants: (data.participants as TelemedicineParticipant[]) || [],
    scheduledAt: data.scheduledAt as string,
    startedAt: data.startedAt as string | undefined,
    endedAt: data.endedAt as string | undefined,
    durationSeconds: data.durationSeconds as number | undefined,
    recordingEnabled: data.recordingEnabled as boolean | undefined,
    recordingUrl: data.recordingUrl as string | undefined,
    notes: data.notes as string | undefined,
    technicalIssues: data.technicalIssues as string[] | undefined,
    createdAt: data.createdAt instanceof Timestamp
      ? data.createdAt.toDate().toISOString()
      : (data.createdAt as string),
    updatedAt: data.updatedAt instanceof Timestamp
      ? data.updatedAt.toDate().toISOString()
      : (data.updatedAt as string),
  };
}

/**
 * Converts Firestore document data to TelemedicineLogEntry type.
 */
function toLogEntry(id: string, data: Record<string, unknown>): TelemedicineLogEntry {
  return {
    id,
    sessionId: data.sessionId as string,
    eventType: data.eventType as TelemedicineLogEntry['eventType'],
    userId: data.userId as string,
    details: data.details as Record<string, unknown> | undefined,
    timestamp: data.timestamp instanceof Timestamp
      ? data.timestamp.toDate().toISOString()
      : (data.timestamp as string),
  };
}

/**
 * Telemedicine service for Firestore operations.
 */
export const telemedicineService = {
  /**
   * Get all teleconsultation sessions for a clinic.
   *
   * @param clinicId - The clinic ID
   * @returns Array of sessions sorted by scheduled date (descending)
   */
  async getAll(clinicId: string): Promise<TelemedicineSession[]> {
    const sessionsRef = getTelemedicineCollection(clinicId);
    const q = query(sessionsRef, orderBy('scheduledAt', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((docSnap) => toSession(docSnap.id, docSnap.data()));
  },

  /**
   * Get a session by ID.
   *
   * @param clinicId - The clinic ID
   * @param sessionId - The session ID
   * @returns The session or null if not found
   */
  async getById(clinicId: string, sessionId: string): Promise<TelemedicineSession | null> {
    const docRef = doc(db, 'clinics', clinicId, 'teleconsultations', sessionId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return toSession(docSnap.id, docSnap.data());
  },

  /**
   * Get session by appointment ID.
   *
   * @param clinicId - The clinic ID
   * @param appointmentId - The appointment ID
   * @returns The session or null if not found
   */
  async getByAppointment(
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
  },

  /**
   * Get active session for a patient (waiting or in_progress).
   *
   * @param clinicId - The clinic ID
   * @param patientId - The patient ID
   * @returns The active session or null
   */
  async getActiveByPatient(
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
  },

  /**
   * Create a new teleconsultation session.
   *
   * @param clinicId - The clinic ID
   * @param data - The session data
   * @returns The created session ID
   */
  async create(clinicId: string, data: CreateTelemedicineSessionInput): Promise<string> {
    const sessionsRef = getTelemedicineCollection(clinicId);
    const roomName = generateRoomName(clinicId, data.appointmentId);

    const sessionData = {
      appointmentId: data.appointmentId,
      patientId: data.patientId,
      patientName: data.patientName,
      professionalId: data.professionalId,
      professionalName: data.professionalName,
      roomName,
      status: 'scheduled' as TelemedicineStatus,
      participants: [],
      scheduledAt: data.scheduledAt,
      recordingEnabled: data.recordingEnabled ?? false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(sessionsRef, sessionData);

    await this.addLog(clinicId, docRef.id, {
      sessionId: docRef.id,
      eventType: 'session_created',
      userId: data.professionalId,
      details: { appointmentId: data.appointmentId },
    });

    return docRef.id;
  },

  /**
   * Update session status.
   *
   * @param clinicId - The clinic ID
   * @param sessionId - The session ID
   * @param status - The new status
   * @param additionalData - Optional additional data to update
   */
  async updateStatus(
    clinicId: string,
    sessionId: string,
    status: TelemedicineStatus,
    additionalData?: Partial<TelemedicineSession>
  ): Promise<void> {
    const docRef = doc(db, 'clinics', clinicId, 'teleconsultations', sessionId);

    const updateData: Record<string, unknown> = {
      status,
      updatedAt: serverTimestamp(),
      ...additionalData,
    };

    if (status === 'in_progress' && !additionalData?.startedAt) {
      updateData.startedAt = new Date().toISOString();
    }

    if (status === 'completed' && !additionalData?.endedAt) {
      updateData.endedAt = new Date().toISOString();
    }

    await updateDoc(docRef, updateData);
  },

  /**
   * Add a participant to the session.
   *
   * @param clinicId - The clinic ID
   * @param sessionId - The session ID
   * @param participant - The participant to add
   */
  async addParticipant(
    clinicId: string,
    sessionId: string,
    participant: TelemedicineParticipant
  ): Promise<void> {
    const session = await this.getById(clinicId, sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const existingIndex = session.participants.findIndex((p) => p.id === participant.id);
    const updatedParticipants = [...session.participants];

    if (existingIndex >= 0) {
      updatedParticipants[existingIndex] = {
        ...updatedParticipants[existingIndex],
        ...participant,
        joinedAt: participant.joinedAt || new Date().toISOString(),
        leftAt: undefined,
      };
    } else {
      updatedParticipants.push({
        ...participant,
        joinedAt: participant.joinedAt || new Date().toISOString(),
      });
    }

    const docRef = doc(db, 'clinics', clinicId, 'teleconsultations', sessionId);
    await updateDoc(docRef, {
      participants: updatedParticipants,
      updatedAt: serverTimestamp(),
    });

    await this.addLog(clinicId, sessionId, {
      sessionId,
      eventType: 'participant_joined',
      userId: participant.id,
      details: { role: participant.role, displayName: participant.displayName },
    });
  },

  /**
   * Remove a participant from the session (mark as left).
   *
   * @param clinicId - The clinic ID
   * @param sessionId - The session ID
   * @param participantId - The participant ID
   */
  async removeParticipant(
    clinicId: string,
    sessionId: string,
    participantId: string
  ): Promise<void> {
    const session = await this.getById(clinicId, sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const updatedParticipants = session.participants.map((p) =>
      p.id === participantId ? { ...p, leftAt: new Date().toISOString() } : p
    );

    const docRef = doc(db, 'clinics', clinicId, 'teleconsultations', sessionId);
    await updateDoc(docRef, {
      participants: updatedParticipants,
      updatedAt: serverTimestamp(),
    });

    await this.addLog(clinicId, sessionId, {
      sessionId,
      eventType: 'participant_left',
      userId: participantId,
    });
  },

  /**
   * End a teleconsultation session.
   *
   * @param clinicId - The clinic ID
   * @param sessionId - The session ID
   * @param userId - The user who ended the call
   */
  async endSession(clinicId: string, sessionId: string, userId: string): Promise<void> {
    const session = await this.getById(clinicId, sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const endedAt = new Date().toISOString();
    const startedAt = session.startedAt ? new Date(session.startedAt) : new Date();
    const durationSeconds = Math.floor((new Date(endedAt).getTime() - startedAt.getTime()) / 1000);

    const updatedParticipants = session.participants.map((p) =>
      !p.leftAt ? { ...p, leftAt: endedAt } : p
    );

    await this.updateStatus(clinicId, sessionId, 'completed', {
      endedAt,
      durationSeconds,
      participants: updatedParticipants,
    });

    await this.addLog(clinicId, sessionId, {
      sessionId,
      eventType: 'call_ended',
      userId,
      details: { durationSeconds },
    });
  },

  /**
   * Add notes to a session.
   *
   * @param clinicId - The clinic ID
   * @param sessionId - The session ID
   * @param notes - The notes to add
   */
  async addNotes(clinicId: string, sessionId: string, notes: string): Promise<void> {
    const docRef = doc(db, 'clinics', clinicId, 'teleconsultations', sessionId);
    await updateDoc(docRef, {
      notes,
      updatedAt: serverTimestamp(),
    });
  },

  /**
   * Report a technical issue during the session.
   *
   * @param clinicId - The clinic ID
   * @param sessionId - The session ID
   * @param issue - Description of the issue
   * @param userId - The user reporting the issue
   */
  async reportTechnicalIssue(
    clinicId: string,
    sessionId: string,
    issue: string,
    userId: string
  ): Promise<void> {
    const session = await this.getById(clinicId, sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const technicalIssues = [...(session.technicalIssues || []), issue];

    const docRef = doc(db, 'clinics', clinicId, 'teleconsultations', sessionId);
    await updateDoc(docRef, {
      technicalIssues,
      updatedAt: serverTimestamp(),
    });

    await this.addLog(clinicId, sessionId, {
      sessionId,
      eventType: 'technical_issue',
      userId,
      details: { issue },
    });
  },

  /**
   * Add a log entry for audit purposes.
   *
   * @param clinicId - The clinic ID
   * @param sessionId - The session ID
   * @param log - The log entry data (without id and timestamp)
   */
  async addLog(
    clinicId: string,
    sessionId: string,
    log: Omit<TelemedicineLogEntry, 'id' | 'timestamp'>
  ): Promise<string> {
    const logsRef = getLogsCollection(clinicId, sessionId);
    const logData = {
      ...log,
      timestamp: serverTimestamp(),
    };

    const docRef = await addDoc(logsRef, logData);
    return docRef.id;
  },

  /**
   * Get all logs for a session.
   *
   * @param clinicId - The clinic ID
   * @param sessionId - The session ID
   * @returns Array of log entries sorted by timestamp
   */
  async getLogs(clinicId: string, sessionId: string): Promise<TelemedicineLogEntry[]> {
    const logsRef = getLogsCollection(clinicId, sessionId);
    const q = query(logsRef, orderBy('timestamp', 'asc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((docSnap) => toLogEntry(docSnap.id, docSnap.data()));
  },

  /**
   * Subscribe to real-time updates for a session.
   *
   * @param clinicId - The clinic ID
   * @param sessionId - The session ID
   * @param callback - Function called with updated session
   * @returns Unsubscribe function
   */
  subscribe(
    clinicId: string,
    sessionId: string,
    callback: (session: TelemedicineSession | null) => void
  ): () => void {
    const docRef = doc(db, 'clinics', clinicId, 'teleconsultations', sessionId);

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
  },

  /**
   * Subscribe to active sessions for a clinic.
   *
   * @param clinicId - The clinic ID
   * @param callback - Function called with updated sessions
   * @returns Unsubscribe function
   */
  subscribeActive(
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
  },
};
