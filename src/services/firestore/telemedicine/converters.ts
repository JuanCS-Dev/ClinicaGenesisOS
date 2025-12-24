/**
 * Telemedicine Document Converters
 *
 * Converters for Firestore documents.
 *
 * @module services/firestore/telemedicine/converters
 */

import { Timestamp } from 'firebase/firestore';
import type {
  TelemedicineSession,
  TelemedicineStatus,
  TelemedicineParticipant,
  TelemedicineLogEntry,
} from '@/types';

/**
 * Converts Firestore document data to TelemedicineSession type.
 */
export function toSession(id: string, data: Record<string, unknown>): TelemedicineSession {
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
export function toLogEntry(id: string, data: Record<string, unknown>): TelemedicineLogEntry {
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
