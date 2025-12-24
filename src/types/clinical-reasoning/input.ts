/**
 * Clinical Reasoning - Input Types
 *
 * Type definitions for analysis inputs and sessions.
 *
 * @module types/clinical-reasoning/input
 */

import type { LabAnalysisResult } from './analysis';

/**
 * Patient context for analysis.
 */
export interface PatientContext {
  /** Patient age in years */
  age: number;
  /** Biological sex */
  sex: 'male' | 'female';
  /** Chief complaint (if available) */
  chiefComplaint?: string;
  /** Relevant medical history */
  relevantHistory?: string[];
  /** Current medications */
  currentMedications?: string[];
  /** Known allergies */
  allergies?: string[];
  /** SOAP notes (if available) */
  soapNotes?: {
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
  };
}

/**
 * Raw lab result for processing.
 */
export interface RawLabResult {
  /** Biomarker name (as printed) */
  name: string;
  /** Value (as string, may include units) */
  value: string;
  /** Unit (if separate from value) */
  unit?: string;
  /** Reference range (as printed) */
  referenceRange?: string;
}

/**
 * Status of a lab analysis session.
 */
export type LabAnalysisStatus =
  | 'idle'
  | 'uploading'
  | 'extracting'
  | 'processing'
  | 'ready'
  | 'error';

/**
 * Lab analysis session tracking.
 */
export interface LabAnalysisSession {
  id: string;
  clinicId: string;
  patientId: string;
  physicianId: string;
  status: LabAnalysisStatus;
  patientContext: PatientContext;
  labResults: RawLabResult[];
  source: 'ocr' | 'manual' | 'hl7';
  documentUrl?: string;
  result?: LabAnalysisResult;
  validated?: boolean;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

/**
 * Input for creating a new lab analysis session.
 */
export interface CreateLabAnalysisInput {
  patientId: string;
  patientContext: PatientContext;
  labResults: RawLabResult[];
  source: 'ocr' | 'manual' | 'hl7';
  documentUrl?: string;
}
