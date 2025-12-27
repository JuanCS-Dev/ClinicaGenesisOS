/**
 * Audit Types
 *
 * Type definitions for AI analysis audit logging.
 *
 * @module ai/types/audit
 */

/**
 * Feedback options for analysis quality.
 */
export type AnalysisFeedback = 'helpful' | 'not_helpful' | 'incorrect';

/**
 * Audit log entry for compliance.
 */
export interface AIAnalysisLog {
  /** Unique ID */
  id: string;
  /** Clinic ID */
  clinicId: string;
  /** Patient ID */
  patientId: string;
  /** Record ID (if linked to a record) */
  recordId?: string;
  /** Physician who requested */
  physicianId: string;
  /** Timestamp */
  timestamp: string;
  /** Type of analysis */
  type: 'lab_analysis' | 'scribe' | 'diagnostic_helper';
  /** SHA-256 hash of input (for privacy) */
  inputHash: string;
  /** SHA-256 hash of output */
  outputHash: string;
  /** Model used */
  model: string;
  /** Prompt version */
  promptVersion: string;
  /** Whether physician accepted the suggestion */
  accepted: boolean;
  /** Physician feedback */
  feedback?: AnalysisFeedback;
  /** Additional feedback notes */
  feedbackNotes?: string;
  /** Processing time in ms */
  processingTimeMs: number;
}
