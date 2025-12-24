/**
 * Telemedicine Mutation Operations
 *
 * Write operations for teleconsultation sessions.
 *
 * @module services/firestore/telemedicine/mutations
 */

import {
  addDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import type {
  TelemedicineSession,
  TelemedicineStatus,
  CreateTelemedicineSessionInput,
  TelemedicineParticipant,
  TelemedicineLogEntry,
} from '@/types';
import {
  getTelemedicineCollection,
  getSessionDoc,
  getLogsCollection,
  generateRoomName,
} from './helpers';
import { getById } from './queries';

/**
 * Add a log entry for audit purposes.
 *
 * @param clinicId - The clinic ID
 * @param sessionId - The session ID
 * @param log - The log entry data (without id and timestamp)
 */
export async function addLog(
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
}

/**
 * Create a new teleconsultation session.
 *
 * @param clinicId - The clinic ID
 * @param data - The session data
 * @returns The created session ID
 */
export async function create(
  clinicId: string,
  data: CreateTelemedicineSessionInput
): Promise<string> {
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

  await addLog(clinicId, docRef.id, {
    sessionId: docRef.id,
    eventType: 'session_created',
    userId: data.professionalId,
    details: { appointmentId: data.appointmentId },
  });

  return docRef.id;
}

/**
 * Update session status.
 *
 * @param clinicId - The clinic ID
 * @param sessionId - The session ID
 * @param status - The new status
 * @param additionalData - Optional additional data to update
 */
export async function updateStatus(
  clinicId: string,
  sessionId: string,
  status: TelemedicineStatus,
  additionalData?: Partial<TelemedicineSession>
): Promise<void> {
  const docRef = getSessionDoc(clinicId, sessionId);

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
}

/**
 * Add a participant to the session.
 *
 * @param clinicId - The clinic ID
 * @param sessionId - The session ID
 * @param participant - The participant to add
 */
export async function addParticipant(
  clinicId: string,
  sessionId: string,
  participant: TelemedicineParticipant
): Promise<void> {
  const session = await getById(clinicId, sessionId);
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

  const docRef = getSessionDoc(clinicId, sessionId);
  await updateDoc(docRef, {
    participants: updatedParticipants,
    updatedAt: serverTimestamp(),
  });

  await addLog(clinicId, sessionId, {
    sessionId,
    eventType: 'participant_joined',
    userId: participant.id,
    details: { role: participant.role, displayName: participant.displayName },
  });
}

/**
 * Remove a participant from the session (mark as left).
 *
 * @param clinicId - The clinic ID
 * @param sessionId - The session ID
 * @param participantId - The participant ID
 */
export async function removeParticipant(
  clinicId: string,
  sessionId: string,
  participantId: string
): Promise<void> {
  const session = await getById(clinicId, sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  const updatedParticipants = session.participants.map((p) =>
    p.id === participantId ? { ...p, leftAt: new Date().toISOString() } : p
  );

  const docRef = getSessionDoc(clinicId, sessionId);
  await updateDoc(docRef, {
    participants: updatedParticipants,
    updatedAt: serverTimestamp(),
  });

  await addLog(clinicId, sessionId, {
    sessionId,
    eventType: 'participant_left',
    userId: participantId,
  });
}

/**
 * End a teleconsultation session.
 *
 * @param clinicId - The clinic ID
 * @param sessionId - The session ID
 * @param userId - The user who ended the call
 */
export async function endSession(
  clinicId: string,
  sessionId: string,
  userId: string
): Promise<void> {
  const session = await getById(clinicId, sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  const endedAt = new Date().toISOString();
  const startedAt = session.startedAt ? new Date(session.startedAt) : new Date();
  const durationSeconds = Math.floor((new Date(endedAt).getTime() - startedAt.getTime()) / 1000);

  const updatedParticipants = session.participants.map((p) =>
    !p.leftAt ? { ...p, leftAt: endedAt } : p
  );

  await updateStatus(clinicId, sessionId, 'completed', {
    endedAt,
    durationSeconds,
    participants: updatedParticipants,
  });

  await addLog(clinicId, sessionId, {
    sessionId,
    eventType: 'call_ended',
    userId,
    details: { durationSeconds },
  });
}

/**
 * Add notes to a session.
 *
 * @param clinicId - The clinic ID
 * @param sessionId - The session ID
 * @param notes - The notes to add
 */
export async function addNotes(
  clinicId: string,
  sessionId: string,
  notes: string
): Promise<void> {
  const docRef = getSessionDoc(clinicId, sessionId);
  await updateDoc(docRef, {
    notes,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Report a technical issue during the session.
 *
 * @param clinicId - The clinic ID
 * @param sessionId - The session ID
 * @param issue - Description of the issue
 * @param userId - The user reporting the issue
 */
export async function reportTechnicalIssue(
  clinicId: string,
  sessionId: string,
  issue: string,
  userId: string
): Promise<void> {
  const session = await getById(clinicId, sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  const technicalIssues = [...(session.technicalIssues || []), issue];

  const docRef = getSessionDoc(clinicId, sessionId);
  await updateDoc(docRef, {
    technicalIssues,
    updatedAt: serverTimestamp(),
  });

  await addLog(clinicId, sessionId, {
    sessionId,
    eventType: 'technical_issue',
    userId,
    details: { issue },
  });
}
