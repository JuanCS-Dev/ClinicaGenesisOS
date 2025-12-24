/**
 * Clinical Reasoning - Diagnostic Types
 *
 * Type definitions for diagnostic processes, triage, and suggestions.
 *
 * @module types/clinical-reasoning/diagnostics
 */

/**
 * Urgency classification for clinical triage.
 */
export type UrgencyLevel = 'critical' | 'high' | 'routine';

/**
 * Workflow recommendation based on triage.
 */
export type RecommendedWorkflow = 'emergency' | 'specialist' | 'primary';

/**
 * Red flag alert for critical conditions.
 */
export interface RedFlag {
  /** Description of the red flag */
  description: string;
  /** Related biomarkers or symptoms */
  relatedMarkers: string[];
  /** Suggested immediate action */
  action: string;
}

/**
 * Triage result from Layer 1.
 */
export interface TriageResult {
  /** Urgency classification */
  urgency: UrgencyLevel;
  /** Identified red flags */
  redFlags: RedFlag[];
  /** Recommended clinical workflow */
  recommendedWorkflow: RecommendedWorkflow;
  /** Confidence in triage decision */
  confidence: number;
}

/**
 * Differential diagnosis entry.
 */
export interface DifferentialDiagnosis {
  /** ICD-10 code if applicable */
  icd10?: string;
  /** Diagnosis name */
  name: string;
  /** Confidence percentage (0-100) */
  confidence: number;
  /** Supporting evidence */
  supportingEvidence: string[];
  /** Contradicting evidence */
  contradictingEvidence: string[];
  /** Suggested additional tests */
  suggestedTests: string[];
}

/**
 * Investigative question to deepen anamnesis.
 */
export interface InvestigativeQuestion {
  /** The question text */
  question: string;
  /** Why this question is relevant */
  rationale: string;
  /** Related biomarkers or findings */
  relatedTo: string[];
}

/**
 * Suggested additional test/exam.
 */
export interface SuggestedTest {
  /** Test name */
  name: string;
  /** Why this test is recommended */
  rationale: string;
  /** Urgency of the test */
  urgency: 'urgent' | 'routine' | 'follow-up';
  /** Related condition being investigated */
  investigates: string;
}
