/**
 * Prescription Service Utilities
 *
 * Helper functions for prescription service operations.
 * Extracted for code organization and file size compliance.
 */

import {
  collection,
  doc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import type {
  Prescription,
  PrescriptionStatus,
  CreatePrescriptionInput,
  PrescriptionLogEntry,
  PrescriptionType,
} from '@/types';

/**
 * Get the prescriptions collection reference for a clinic.
 *
 * @param clinicId - The clinic ID
 * @returns Firestore collection reference
 */
export function getPrescriptionCollection(clinicId: string) {
  return collection(db, 'clinics', clinicId, 'prescriptions');
}

/**
 * Get the logs subcollection for a prescription.
 *
 * @param clinicId - The clinic ID
 * @param prescriptionId - The prescription ID
 * @returns Firestore collection reference
 */
export function getLogsCollection(clinicId: string, prescriptionId: string) {
  return collection(db, 'clinics', clinicId, 'prescriptions', prescriptionId, 'logs');
}

/**
 * Get a prescription document reference.
 *
 * @param clinicId - The clinic ID
 * @param prescriptionId - The prescription ID
 * @returns Firestore document reference
 */
export function getPrescriptionDoc(clinicId: string, prescriptionId: string) {
  return doc(db, 'clinics', clinicId, 'prescriptions', prescriptionId);
}

/**
 * Generate a unique validation code for pharmacy verification.
 * Uses alphanumeric characters excluding ambiguous ones (0, O, I, l, 1).
 *
 * @returns 8-character validation code
 */
export function generateValidationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Calculate expiration date based on prescription type.
 *
 * @param prescribedAt - The prescription date (ISO string)
 * @param type - The prescription type
 * @returns Expiration date (ISO string)
 */
export function calculateExpirationDate(prescribedAt: string, type: PrescriptionType): string {
  const validityDays: Record<PrescriptionType, number> = {
    common: 60,
    special_white: 30,
    blue: 30,
    yellow: 30,
    antimicrobial: 10,
  };

  const date = new Date(prescribedAt);
  date.setDate(date.getDate() + validityDays[type]);
  return date.toISOString();
}

/**
 * Converts Firestore document data to Prescription type.
 *
 * @param id - The document ID
 * @param data - The document data
 * @returns Typed Prescription object
 */
export function toPrescription(id: string, data: Record<string, unknown>): Prescription {
  return {
    id,
    clinicId: data.clinicId as string,
    patientId: data.patientId as string,
    patientName: data.patientName as string,
    patientCpf: data.patientCpf as string | undefined,
    professionalId: data.professionalId as string,
    professionalName: data.professionalName as string,
    professionalCrm: data.professionalCrm as string,
    professionalCrmState: data.professionalCrmState as string,
    type: data.type as PrescriptionType,
    status: data.status as PrescriptionStatus,
    medications: data.medications as Prescription['medications'],
    observations: data.observations as string | undefined,
    validityDays: data.validityDays as number,
    prescribedAt: data.prescribedAt as string,
    expiresAt: data.expiresAt as string,
    signature: data.signature as Prescription['signature'],
    memedPrescriptionId: data.memedPrescriptionId as string | undefined,
    memedAccessToken: data.memedAccessToken as string | undefined,
    validationCode: data.validationCode as string | undefined,
    sncr: data.sncr as Prescription['sncr'],
    sentAt: data.sentAt as string | undefined,
    viewedAt: data.viewedAt as string | undefined,
    filledAt: data.filledAt as string | undefined,
    filledByPharmacy: data.filledByPharmacy as string | undefined,
    createdAt: data.createdAt instanceof Timestamp
      ? data.createdAt.toDate().toISOString()
      : (data.createdAt as string),
    updatedAt: data.updatedAt instanceof Timestamp
      ? data.updatedAt.toDate().toISOString()
      : (data.updatedAt as string),
  };
}

/**
 * Converts Firestore document data to PrescriptionLogEntry type.
 *
 * @param id - The document ID
 * @param data - The document data
 * @returns Typed PrescriptionLogEntry object
 */
export function toLogEntry(id: string, data: Record<string, unknown>): PrescriptionLogEntry {
  return {
    id,
    prescriptionId: data.prescriptionId as string,
    eventType: data.eventType as PrescriptionLogEntry['eventType'],
    userId: data.userId as string,
    userName: data.userName as string,
    details: data.details as Record<string, unknown> | undefined,
    timestamp: data.timestamp instanceof Timestamp
      ? data.timestamp.toDate().toISOString()
      : (data.timestamp as string),
  };
}

/**
 * Determine prescription type based on medications.
 * Checks control types and returns the most restrictive.
 *
 * @param medications - Array of medications
 * @returns The determined prescription type
 */
export function determinePrescriptionType(
  medications: CreatePrescriptionInput['medications']
): PrescriptionType {
  const controlTypes = medications
    .filter((m) => m.isControlled && m.controlType)
    .map((m) => m.controlType!);

  // A-type (entorpecentes) = Yellow prescription
  if (controlTypes.some((t) => t.startsWith('A'))) {
    return 'yellow';
  }
  // B-type (psicotrópicos) = Blue prescription
  if (controlTypes.some((t) => t.startsWith('B'))) {
    return 'blue';
  }
  // C-type (outras substâncias) = Special white prescription
  if (controlTypes.some((t) => t.startsWith('C'))) {
    return 'special_white';
  }
  // Antimicrobial = Antimicrobial prescription
  if (medications.some((m) => m.controlType === 'antimicrobial')) {
    return 'antimicrobial';
  }
  // Default = Common prescription
  return 'common';
}

/**
 * Map prescription status to log event type.
 *
 * @param status - The prescription status
 * @returns The corresponding log event type
 */
export function statusToEventType(
  status: PrescriptionStatus
): PrescriptionLogEntry['eventType'] {
  const eventTypeMap: Record<PrescriptionStatus, PrescriptionLogEntry['eventType']> = {
    draft: 'updated',
    pending_signature: 'updated',
    signed: 'signed',
    sent: 'sent',
    viewed: 'viewed',
    filled: 'filled',
    expired: 'expired',
    canceled: 'canceled',
  };
  return eventTypeMap[status];
}
