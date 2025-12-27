/**
 * Input Types
 *
 * Type definitions for patient context and lab analysis input.
 *
 * @module ai/types/input
 */

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
 * Input for lab analysis function.
 */
export interface LabAnalysisInput {
  /** Clinic ID for multi-tenancy */
  clinicId: string;
  /** Patient ID */
  patientId: string;
  /** Requesting physician ID */
  physicianId: string;
  /** Patient context */
  patientContext: PatientContext;
  /** Lab results (structured or from OCR) */
  labResults: RawLabResult[];
  /** Source of lab results */
  source: 'ocr' | 'manual' | 'hl7';
  /** Optional: URL of uploaded lab document */
  documentUrl?: string;
}
