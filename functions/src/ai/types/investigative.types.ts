/**
 * Investigative Types
 *
 * Type definitions for investigative questions and suggested tests.
 *
 * @module ai/types/investigative
 */

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
