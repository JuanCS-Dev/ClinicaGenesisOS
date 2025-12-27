/**
 * Telemedicine Mutation Operations
 *
 * Write operations for teleconsultation sessions.
 * Supports Google Meet (primary) and Jitsi Meet (legacy).
 *
 * @module services/firestore/telemedicine/mutations
 */

import {
  addDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import type {
  TelemedicineSession,
  TelemedicineStatus,
  CreateTelemedicineSessionInput,
  TelemedicineParticipant,
  TelemedicineLogEntry,
  CreateMeetSessionInput,
  CreateMeetSessionOutput,
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

// ============================================================================
// Google Meet Integration
// ============================================================================

/**
 * Extended input for creating a session with Google Meet.
 */
export interface CreateWithMeetInput extends CreateTelemedicineSessionInput {
  /** Patient email for calendar invite */
  patientEmail: string;
  /** Professional email for calendar invite */
  professionalEmail: string;
  /** Clinic name for event description */
  clinicName: string;
  /** Duration in minutes (default: 30) */
  durationMinutes?: number;
}

/**
 * Create a teleconsultation session with Google Meet link.
 *
 * This creates both the Firestore session and the Google Calendar event
 * with an auto-generated Meet link.
 *
 * @param clinicId - The clinic ID
 * @param data - The session data including email addresses
 * @returns The created session ID and Meet link
 */
export async function createWithMeet(
  clinicId: string,
  data: CreateWithMeetInput
): Promise<{ sessionId: string; meetLink: string }> {
  // First, create the session in Firestore
  const sessionId = await create(clinicId, data);

  try {
    // Call Cloud Function to create Google Calendar event with Meet
    const functions = getFunctions();
    const createMeetSession = httpsCallable<CreateMeetSessionInput, CreateMeetSessionOutput>(
      functions,
      'createMeetSession'
    );

    const meetInput: CreateMeetSessionInput = {
      appointmentId: data.appointmentId,
      patientName: data.patientName,
      patientEmail: data.patientEmail,
      professionalName: data.professionalName,
      professionalEmail: data.professionalEmail,
      scheduledAt: data.scheduledAt,
      durationMinutes: data.durationMinutes ?? 30,
      clinicName: data.clinicName,
    };

    const result = await createMeetSession(meetInput);
    const { meetLink, calendarEventId } = result.data;

    // Update session with Meet info
    await setMeetLink(clinicId, sessionId, meetLink, calendarEventId);

    return { sessionId, meetLink };
  } catch (error) {
    // Session was created but Meet failed - log the error but don't fail
    console.error('Failed to create Google Meet session:', error);
    throw error;
  }
}

/**
 * Set or update the Google Meet link for a session.
 *
 * @param clinicId - The clinic ID
 * @param sessionId - The session ID
 * @param meetLink - The Google Meet link
 * @param calendarEventId - Optional Calendar event ID
 */
export async function setMeetLink(
  clinicId: string,
  sessionId: string,
  meetLink: string,
  calendarEventId?: string
): Promise<void> {
  const docRef = getSessionDoc(clinicId, sessionId);

  const updateData: Record<string, unknown> = {
    meetLink,
    updatedAt: serverTimestamp(),
  };

  if (calendarEventId) {
    updateData.calendarEventId = calendarEventId;
  }

  await updateDoc(docRef, updateData);
}

/**
 * Cancel a teleconsultation and its associated Google Calendar event.
 *
 * @param clinicId - The clinic ID
 * @param sessionId - The session ID
 * @param userId - The user canceling the session
 * @param reason - Optional cancellation reason
 */
export async function cancelWithMeet(
  clinicId: string,
  sessionId: string,
  userId: string,
  reason?: string
): Promise<void> {
  const session = await getById(clinicId, sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  // Cancel the Google Calendar event if it exists
  if (session.calendarEventId) {
    try {
      const functions = getFunctions();
      const cancelMeetSession = httpsCallable<
        { calendarEventId: string; reason?: string },
        { success: boolean }
      >(functions, 'cancelMeetSession');

      await cancelMeetSession({
        calendarEventId: session.calendarEventId,
        reason,
      });
    } catch (error) {
      // Log but continue with session cancellation
      console.error('Failed to cancel Google Calendar event:', error);
    }
  }

  // Update session status to canceled
  await updateStatus(clinicId, sessionId, 'canceled');

  await addLog(clinicId, sessionId, {
    sessionId,
    eventType: 'call_ended',
    userId,
    details: { reason: reason ?? 'Canceled by user' },
  });
}
