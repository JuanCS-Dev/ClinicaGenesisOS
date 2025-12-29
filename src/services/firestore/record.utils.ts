/**
 * Medical Record Service Utilities
 *
 * Helper functions for medical record service operations.
 * Extracted for code organization and file size compliance.
 *
 * Handles polymorphic type conversion for different record types:
 * SOAP, Note, Prescription, ExamRequest, PsychoSession, Anthropometry
 */

import { collection, doc, Timestamp } from 'firebase/firestore'
import { db } from '../firebase'
import type { AuditUserContext } from './lgpd/audit-helper'
import type {
  MedicalRecord,
  RecordType,
  SpecialtyType,
  SoapRecord,
  TextRecord,
  PrescriptionRecord,
  ExamRequestRecord,
  PsychoSessionRecord,
  AnthropometryRecord,
  RecordAttachment,
} from '@/types'

/**
 * Optional audit context for logging LGPD-compliant access.
 * When provided, all operations will be logged for compliance.
 */
export interface RecordServiceAuditContext {
  userId: string
  userName: string
}

/**
 * Get the records collection reference for a clinic.
 *
 * @param clinicId - The clinic ID
 * @returns Firestore collection reference
 */
export function getRecordsCollection(clinicId: string) {
  return collection(db, 'clinics', clinicId, 'records')
}

/**
 * Get a record document reference.
 *
 * @param clinicId - The clinic ID
 * @param recordId - The record ID
 * @returns Firestore document reference
 */
export function getRecordDoc(clinicId: string, recordId: string) {
  return doc(db, 'clinics', clinicId, 'records', recordId)
}

/**
 * Build audit context from service parameters.
 *
 * @param clinicId - The clinic ID
 * @param auditCtx - Optional audit context with userId and userName
 * @returns AuditUserContext or null if no audit context provided
 */
export function buildAuditContext(
  clinicId: string,
  auditCtx?: RecordServiceAuditContext
): AuditUserContext | null {
  if (!auditCtx) return null
  return {
    clinicId,
    userId: auditCtx.userId,
    userName: auditCtx.userName,
  }
}

/**
 * Converts Firestore document data to MedicalRecord type.
 * Handles polymorphic record types and versioning fields.
 *
 * @param id - The document ID
 * @param data - The document data from Firestore
 * @returns Typed MedicalRecord object (SOAP, Note, Prescription, etc.)
 */
export function toRecord(id: string, data: Record<string, unknown>): MedicalRecord {
  const baseRecord = {
    id,
    patientId: data.patientId as string,
    date: data.date instanceof Timestamp ? data.date.toDate().toISOString() : (data.date as string),
    professional: data.professional as string,
    type: data.type as RecordType,
    specialty: data.specialty as SpecialtyType,
    // Versioning fields
    version: (data.version as number) || 1,
    updatedAt:
      data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate().toISOString()
        : (data.updatedAt as string | undefined),
    updatedBy: data.updatedBy as string | undefined,
    // Attachments
    attachments: data.attachments as RecordAttachment[] | undefined,
  }

  switch (data.type as RecordType) {
    case 'soap':
      return {
        ...baseRecord,
        type: 'soap' as const,
        subjective: data.subjective as string,
        objective: data.objective as string,
        assessment: data.assessment as string,
        plan: data.plan as string,
      } as SoapRecord

    case 'note':
      return {
        ...baseRecord,
        type: 'note' as const,
        title: data.title as string,
        content: data.content as string,
      } as TextRecord

    case 'prescription':
      return {
        ...baseRecord,
        type: 'prescription' as const,
        medications: data.medications as PrescriptionRecord['medications'],
      } as PrescriptionRecord

    case 'exam_request':
      return {
        ...baseRecord,
        type: 'exam_request' as const,
        exams: data.exams as string[],
        justification: data.justification as string,
      } as ExamRequestRecord

    case 'psycho_session':
      return {
        ...baseRecord,
        type: 'psycho_session' as const,
        mood: data.mood as PsychoSessionRecord['mood'],
        summary: data.summary as string,
        privateNotes: data.privateNotes as string,
      } as PsychoSessionRecord

    case 'anthropometry':
      return {
        ...baseRecord,
        type: 'anthropometry' as const,
        weight: data.weight as number,
        height: data.height as number,
        imc: data.imc as number,
        waist: data.waist as number,
        hip: data.hip as number,
      } as AnthropometryRecord

    default:
      return {
        ...baseRecord,
        type: 'note' as const,
        title: 'Unknown Record',
        content: JSON.stringify(data),
      } as TextRecord
  }
}
