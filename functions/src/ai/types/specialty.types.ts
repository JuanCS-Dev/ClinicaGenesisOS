/**
 * Specialty Types
 *
 * Type definitions for specialty-specific analysis templates.
 *
 * @module ai/types/specialty
 */

import type { PatternType } from './correlation.types.js';

/**
 * Specialty-specific analysis configuration.
 */
export type ClinicalSpecialty =
  | 'general_practice'
  | 'cardiology'
  | 'endocrinology'
  | 'neurology'
  | 'functional_medicine'
  | 'nephrology'
  | 'hematology'
  | 'hepatology';

/**
 * Specialty template for chain-of-thought prompting.
 */
export interface SpecialtyTemplate {
  /** Specialty identifier */
  specialty: ClinicalSpecialty;
  /** Ordered reasoning steps */
  reasoningSteps: string[];
  /** Key biomarkers for this specialty */
  keyBiomarkers: string[];
  /** Common patterns to look for */
  commonPatterns: PatternType[];
  /** Red flags specific to specialty */
  redFlags: string[];
}
