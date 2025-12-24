/**
 * Medical Record Types
 *
 * Specialized medical record types and union type.
 */

import type { BaseRecord, RecordType, RecordAutoFields } from './base';

export interface SoapRecord extends BaseRecord {
  type: RecordType.SOAP;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface TextRecord extends BaseRecord {
  type: RecordType.NOTE;
  title: string;
  content: string;
}

export interface PrescriptionRecord extends BaseRecord {
  type: RecordType.PRESCRIPTION;
  medications: Array<{
    name: string;
    dosage: string;
    instructions: string;
  }>;
}

export interface ExamRequestRecord extends BaseRecord {
  type: RecordType.EXAM_REQUEST;
  exams: string[];
  justification: string;
}

export interface PsychoSessionRecord extends BaseRecord {
  type: RecordType.PSYCHO_SESSION;
  mood: 'happy' | 'neutral' | 'sad' | 'anxious' | 'angry';
  summary: string;
  privateNotes: string;
}

export interface AnthropometryRecord extends BaseRecord {
  type: RecordType.ANTHROPOMETRY;
  weight: number;
  height: number;
  imc: number;
  waist: number;
  hip: number;
}

export type MedicalRecord =
  | SoapRecord
  | TextRecord
  | PrescriptionRecord
  | ExamRequestRecord
  | PsychoSessionRecord
  | AnthropometryRecord;

/**
 * Version snapshot of a record.
 * Stored in subcollection: /clinics/{clinicId}/records/{recordId}/versions/{versionId}
 */
export interface RecordVersion {
  id: string;
  version: number;
  data: Omit<MedicalRecord, 'id'>; // Snapshot of record at this version
  savedAt: string;
  savedBy: string;
  changeReason?: string; // Optional reason for the change
}

// Input types for creating records
export type CreateRecordInput = Omit<MedicalRecord, RecordAutoFields>;
export type CreateSoapRecordInput = Omit<SoapRecord, RecordAutoFields>;
export type CreateTextRecordInput = Omit<TextRecord, RecordAutoFields>;
export type CreatePrescriptionRecordInput = Omit<PrescriptionRecord, RecordAutoFields>;
export type CreateExamRequestRecordInput = Omit<ExamRequestRecord, RecordAutoFields>;
export type CreatePsychoSessionRecordInput = Omit<PsychoSessionRecord, RecordAutoFields>;
export type CreateAnthropometryRecordInput = Omit<AnthropometryRecord, RecordAutoFields>;

/**
 * Data returned by record editors.
 * Does not include patientId/specialty (added by context).
 */
export type EditorRecordData =
  | Omit<CreateSoapRecordInput, 'patientId' | 'specialty'>
  | Omit<CreatePrescriptionRecordInput, 'patientId' | 'specialty'>
  | Omit<CreateExamRequestRecordInput, 'patientId' | 'specialty'>
  | Omit<CreateAnthropometryRecordInput, 'patientId' | 'specialty'>
  | Omit<CreatePsychoSessionRecordInput, 'patientId' | 'specialty'>;
